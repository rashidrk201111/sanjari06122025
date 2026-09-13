import os
import hmac
import hashlib
import json
import base64
import re
import uuid
from pathlib import PurePosixPath
import requests
from datetime import datetime
from decimal import Decimal
from functools import wraps
from urllib.parse import urljoin
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
from django.conf import settings
from django.db import connection
from .models import Order, FileItem, Payment, ShiprocketSettings, ShiprocketToken, ShiprocketShipment, ShiprocketLog, SiteSetting
from django.utils import timezone
from .serializers import FileItemSerializer, OrderSerializer
from . import phonepe_client
from .pricing import calculate_checkout_pricing, get_checkout_charge_settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.decorators import parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q


def _supabase_config():
    supabase_url = os.getenv('SUPABASE_URL') or os.getenv('VITE_SUPABASE_URL')
    supabase_anon_key = os.getenv('SUPABASE_ANON_KEY') or os.getenv('VITE_SUPABASE_ANON_KEY')
    return (supabase_url or '').rstrip('/'), supabase_anon_key or ''


def _supabase_service_config():
    supabase_url = os.getenv('SUPABASE_URL') or os.getenv('VITE_SUPABASE_URL')
    service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    return (supabase_url or '').rstrip('/'), service_key or ''


def upload_pdf_to_supabase_storage(file_obj, order_number=''):
    supabase_url, service_key = _supabase_service_config()
    if not supabase_url or not service_key:
        return ''

    bucket = os.getenv('SUPABASE_UPLOAD_BUCKET', 'order-files')
    safe_name = re.sub(r'[^A-Za-z0-9._-]+', '-', file_obj.name or 'document.pdf').strip('-') or 'document.pdf'
    if not safe_name.lower().endswith('.pdf'):
        safe_name = f'{safe_name}.pdf'
    folder = order_number or f'upload-{uuid.uuid4().hex[:12]}'
    storage_path = str(PurePosixPath('uploads') / folder / f'{uuid.uuid4().hex[:10]}-{safe_name}')

    headers = {
        'apikey': service_key,
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/pdf',
        'x-upsert': 'true',
    }

    try:
        file_obj.seek(0)
        create_bucket = requests.post(
            f'{supabase_url}/storage/v1/bucket',
            headers={**headers, 'Content-Type': 'application/json'},
            json={'id': bucket, 'name': bucket, 'public': True},
            timeout=15,
        )
        if create_bucket.status_code not in (200, 201, 409):
            print(f'Supabase bucket create warning: {create_bucket.status_code} {create_bucket.text}')

        response = requests.post(
            f'{supabase_url}/storage/v1/object/{bucket}/{storage_path}',
            headers=headers,
            data=file_obj.read(),
            timeout=60,
        )
        if response.status_code not in (200, 201):
            print(f'Supabase upload failed: {response.status_code} {response.text}')
            return ''
        return f'{supabase_url}/storage/v1/object/public/{bucket}/{storage_path}'
    except Exception as exc:
        print(f'Supabase upload exception: {exc}')
        return ''
    finally:
        try:
            file_obj.seek(0)
        except Exception:
            pass


def _get_bearer_token(request):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.lower().startswith('bearer '):
        return ''
    return auth_header.split(' ', 1)[1].strip()


def _is_admin_token(request):
    token = _get_bearer_token(request)
    supabase_url, supabase_anon_key = _supabase_config()
    if not token or not supabase_url or not supabase_anon_key:
        return False

    try:
        user_response = requests.get(
            urljoin(f'{supabase_url}/', 'auth/v1/user'),
            headers={
                'apikey': supabase_anon_key,
                'Authorization': f'Bearer {token}',
            },
            timeout=10,
        )
        if not user_response.ok:
            return False

        user_id = user_response.json().get('id')
        if not user_id:
            return False

        with connection.cursor() as cursor:
            cursor.execute(
                'select role from public.users where id = %s limit 1',
                [user_id],
            )
            row = cursor.fetchone()

        return bool(row and row[0] in ('admin', 'staff'))
    except Exception as exc:
        print(f'Admin auth failed: {exc}')
        return False


def require_admin_user(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not _is_admin_token(request):
            return Response({'error': 'Admin authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        return view_func(request, *args, **kwargs)
    return wrapper


def require_admin_for_methods(*methods):
    protected_methods = {method.upper() for method in methods}

    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if request.method.upper() in protected_methods and not _is_admin_token(request):
                return Response({'error': 'Admin authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def _phonepe_success_states():
    return {'COMPLETED', 'SUCCESS'}


def _valid_uuid_or_none(value):
    if not value:
        return None
    value = str(value).strip()
    if re.match(r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$', value):
        return value
    return None


def _public_order_items(files, cart_items, explicit_items=None):
    if isinstance(explicit_items, list) and explicit_items:
        return explicit_items

    items = []
    for item in cart_items or []:
        items.append({
            'productName': item.get('productName') or item.get('name') or 'Product',
            'categorySlug': item.get('categorySlug') or '',
            'subcategorySlug': item.get('subcategorySlug') or '',
            'price': item.get('price') or 0,
            'quantity': item.get('quantity') or 1,
        })

    for item in files or []:
        file_name = item.get('fileName') or item.get('name') or 'Document'
        items.append({
            'productName': item.get('productName') or f'Document: {file_name}',
            'categorySlug': item.get('categorySlug') or 'documents',
            'subcategorySlug': item.get('subcategorySlug') or 'pdf-print',
            'price': item.get('price') or 0,
            'quantity': item.get('copies') or 1,
            'files': [{
                'name': file_name,
                'pageCount': item.get('totalPages') or item.get('pages') or 0,
                'pagesToPrint': item.get('pages') or item.get('endPage') or item.get('totalPages') or 1,
                'instruction': item.get('specialInstructions') or item.get('instruction') or '',
            }],
        })
    return items


def ensure_public_order_columns():
    with connection.cursor() as cursor:
        cursor.execute("alter table public.orders add column if not exists tracking_number text")
        cursor.execute("alter table public.orders add column if not exists tracking_url text")
        cursor.execute("alter table public.orders add column if not exists estimated_delivery text")


def sync_public_order(order, pricing=None, files=None, cart_items=None, explicit_items=None, delivery_address=None, payment_status='pending', user_id=None):
    """Write the customer/admin order row server-side so browser RLS does not block checkout."""
    ensure_public_order_columns()
    pricing = pricing or {}
    total_amount = pricing.get('totalAmount')
    if total_amount is None:
        total_amount = Decimal(order.subtotal or 0) / Decimal('100')

    items = _public_order_items(files or [], cart_items or [], explicit_items)
    shipping_address = delivery_address
    if shipping_address is None and order.shipping_address:
        try:
            shipping_address = json.loads(order.shipping_address)
        except Exception:
            shipping_address = {}
    shipping_address = shipping_address or {}
    safe_user_id = _valid_uuid_or_none(user_id)

    def execute_upsert(row_user_id):
        with connection.cursor() as cursor:
            cursor.execute(
                """
                update public.orders
                set user_id = %s,
                    items = %s::jsonb,
                    total_amount = %s,
                    status = %s,
                    shipping_address = %s::jsonb,
                    payment_method = %s,
                    payment_status = %s,
                    tracking_number = %s,
                    tracking_url = %s,
                    updated_at = now()
                where order_number = %s
                """,
                [
                    row_user_id,
                    json.dumps(items),
                    total_amount,
                    order.status,
                    json.dumps(shipping_address),
                    'PhonePe',
                    payment_status,
                    order.tracking_number or '',
                    order.tracking_url or '',
                    order.order_number,
                ],
            )
            if cursor.rowcount:
                return
            cursor.execute(
                """
                insert into public.orders (
                    user_id, order_number, items, total_amount, status,
                    shipping_address, payment_method, payment_status, tracking_number, tracking_url
                )
                values (%s, %s, %s::jsonb, %s, %s, %s::jsonb, %s, %s, %s, %s)
                """,
                [
                    row_user_id,
                    order.order_number,
                    json.dumps(items),
                    total_amount,
                    order.status,
                    json.dumps(shipping_address),
                    'PhonePe',
                    payment_status,
                    order.tracking_number or '',
                    order.tracking_url or '',
                ],
            )

    try:
        execute_upsert(safe_user_id)
    except Exception as exc:
        if safe_user_id:
            print(f"Public order sync with user_id failed, retrying as guest: {exc}")
            execute_upsert(None)
        else:
            raise


def update_public_order_payment_status(order, payment_status):
    try:
        sync_public_order(order, payment_status=payment_status)
        ensure_public_order_columns()
        with connection.cursor() as cursor:
            cursor.execute(
                """
                update public.orders
                set status = %s,
                    payment_status = %s,
                    tracking_number = %s,
                    tracking_url = %s,
                    updated_at = now()
                where order_number = %s
                """,
                [order.status, payment_status, order.tracking_number or '', order.tracking_url or '', order.order_number],
            )
    except Exception as exc:
        print(f"Public order status sync failed: {exc}")


def _shiprocket_auto_enabled():
    return str(os.getenv('SHIPROCKET_AUTO_CREATE', 'True')).strip().lower() in ('1', 'true', 'yes', 'on')


def create_shiprocket_shipment_for_order(order, items_data=None, payment_method='PhonePe', comment='Created automatically after payment'):
    settings_obj = ShiprocketSettings.get_settings()
    if not settings_obj.enabled:
        raise Exception('Shiprocket integration is disabled')
    if not settings_obj.email or not settings_obj.password:
        raise Exception('Shiprocket credentials not configured')

    token = get_shiprocket_token()

    shipping_addr = {}
    if order.shipping_address:
        try:
            shipping_addr = json.loads(order.shipping_address)
        except Exception:
            shipping_addr = {}

    full_name = shipping_addr.get('fullName', order.name or 'Customer')
    name_parts = full_name.split(' ', 1)
    first_name = name_parts[0] if name_parts else 'Customer'
    last_name = name_parts[1] if len(name_parts) > 1 else 'Customer'

    order_items = []
    for idx, item in enumerate(items_data or []):
        order_items.append({
            "name": item.get('productName') or item.get('name') or f'Item {idx+1}',
            "sku": item.get('sku') or f'SKU-{order.order_number}-{idx+1}',
            "units": int(item.get('quantity') or 1),
            "selling_price": str(item.get('price') or 0),
            "discount": "",
            "tax": "",
        })

    if not order_items:
        order_items.append({
            "name": "Printing Order",
            "sku": f'SKU-{order.order_number}',
            "units": 1,
            "selling_price": str((Decimal(order.subtotal or 0) / Decimal('100')).quantize(Decimal('0.01'))),
            "discount": "",
            "tax": "",
        })

    is_cod = 'cod' in str(payment_method).lower() or 'cash' in str(payment_method).lower()
    sub_total = Decimal(order.subtotal or 0) / Decimal('100')

    payload = {
        "order_id": order.order_number,
        "order_date": order.created_at.strftime('%Y-%m-%d %H:%M:%S') if order.created_at else datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "pickup_location": settings_obj.pickup_location or "Primary",
        "channel_id": "",
        "comment": comment,
        "billing_customer_name": first_name,
        "billing_last_name": last_name,
        "billing_address": shipping_addr.get('address', settings_obj.address or 'Address not provided'),
        "billing_address_2": shipping_addr.get('landmark', settings_obj.address2 or ''),
        "billing_city": shipping_addr.get('city', settings_obj.city),
        "billing_pincode": str(shipping_addr.get('pincode', settings_obj.pincode or '')),
        "billing_state": shipping_addr.get('state', settings_obj.state),
        "billing_country": settings_obj.country or "India",
        "billing_email": shipping_addr.get('email', order.email or 'support@sanjariprints.com'),
        "billing_phone": shipping_addr.get('phone', order.phone or settings_obj.phone),
        "shipping_is_billing": True,
        "order_items": order_items,
        "payment_method": "COD" if is_cod else "Prepaid",
        "shipping_charges": 0,
        "giftwrap_charges": 0,
        "transaction_charges": 0,
        "total_discount": 0,
        "sub_total": float(sub_total),
        "length": settings_obj.default_length or 25,
        "breadth": settings_obj.default_breadth or 20,
        "height": settings_obj.default_height or 4,
        "weight": settings_obj.default_weight or 0.5,
    }

    shipment_response = requests.post(
        f"{SHIPROCKET_BASE_URL}/orders/create/adhoc",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        },
        json=payload,
        timeout=30
    )

    try:
        shipment_data = shipment_response.json()
    except ValueError:
        shipment_data = {'message': shipment_response.text}

    response_message = str(shipment_data.get('message') or '')
    response_message_lower = response_message.lower()
    if (
        not shipment_response.ok
        or 'wrong pickup location' in response_message_lower
        or 'please choose one location' in response_message_lower
    ):
        log_shiprocket_event('shipment_create_failed', order.order_number, details={'response': shipment_data})
        raise Exception(shipment_data.get('message') or shipment_data.get('error') or 'Shiprocket API failed')

    awb_code = shipment_data.get('awb_code') or shipment_data.get('data', {}).get('awb_code', '')
    tracking_url = shipment_data.get('tracking_url') or shipment_data.get('data', {}).get('tracking_url', '')
    shipment_id = shipment_data.get('shipment_id') or shipment_data.get('order_id', '')

    if not shipment_id and not awb_code:
        log_shiprocket_event('shipment_create_failed', order.order_number, details={'response': shipment_data})
        raise Exception(shipment_data.get('message') or 'Shiprocket did not return shipment details')

    shipment, _ = ShiprocketShipment.objects.update_or_create(
        order=order,
        defaults={
            'shipment_id': shipment_id,
            'awb_code': awb_code,
            'tracking_url': tracking_url,
            'status': 'created',
            'raw_response': shipment_data,
        }
    )

    order.tracking_number = awb_code
    order.tracking_url = tracking_url
    order.status = 'shipped'
    order.save()

    log_shiprocket_event('shipment_created', order.order_number, awb_code, {'shipmentId': shipment.shipment_id})

    return {
        'success': True,
        'message': shipment_data.get('message', 'Shipment created'),
        'shipmentId': shipment.shipment_id,
        'awbCode': awb_code,
        'trackingUrl': tracking_url,
    }


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def create_payment(request):
    """Create PhonePe payment (server-side).
    POST /api/payments/create-payment/
    Body: { amount, order_number, name, email, phone, redirect_url, files }
    """
    try:
        if request.method != 'POST':
            return Response({'error': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

        data = request.data if hasattr(request, 'data') else json.loads(request.body.decode('utf-8'))
    except Exception:
        return Response({'error': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)

    # Extract payment data
    amount = int(data.get('amount', 0))  # Amount in paise ( rupees * 100 )
    if amount < 100:
        return Response({'error': 'Amount must be at least 100 paise (₹1)'}, status=status.HTTP_400_BAD_REQUEST)

    order_number = data.get('order_number') or f"SPR{int(datetime.now().timestamp())}"
    name = data.get('name', '')[:200]
    email = data.get('email', '')[:254]
    phone = data.get('phone', '')[:15]
    redirect_url = data.get('redirect_url', '')
    files = data.get('files', [])
    cart_items = data.get('cartItems', [])
    explicit_items = data.get('items', [])
    coupon = data.get('coupon', '')
    delivery_address = data.get('deliveryAddress') or {}
    user_id = data.get('userId') or data.get('user_id')

    pricing = calculate_checkout_pricing(files=files, cart_items=cart_items, coupon_code=coupon)
    expected_amount = pricing['amountPaise']
    if amount != expected_amount:
        return Response({
            'error': 'Checkout amount mismatch',
            'expectedAmount': expected_amount,
            'receivedAmount': amount,
            'pricing': pricing,
        }, status=status.HTTP_400_BAD_REQUEST)

    # Create order in database
    try:
        order = Order.objects.create(
            order_number=order_number,
            name=name,
            email=email,
            phone=phone,
            subtotal=amount,
            total_pages=pricing['totalPages'],
            shipping_address=json.dumps(delivery_address) if delivery_address else '',
        )

        # Create file items. If checkout uploaded the real PDF before payment,
        # attach that saved FileItem to the final order instead of creating
        # metadata-only rows.
        for f in files:
            pages = int(f.get('pages') or f.get('endPage') or f.get('totalPages') or 1)
            temp_upload_id = f.get('tempUploadId') or f.get('uploadId') or f.get('fileItemId')
            file_item = None
            if temp_upload_id:
                try:
                    file_item = FileItem.objects.filter(id=int(temp_upload_id), upload__isnull=False).first()
                except (TypeError, ValueError):
                    file_item = None
            if file_item:
                file_item.order = order
                file_item.file_name = f.get('fileName') or file_item.file_name
                file_item.total_pages = int(f.get('totalPages') or file_item.total_pages or 0)
                file_item.start_page = int(f.get('startPage', 1))
                file_item.end_page = pages
                file_item.copies = int(f.get('copies', 1))
                if f.get('uploadUrl') and not file_item.remote_url:
                    file_item.remote_url = f.get('uploadUrl')
                file_item.save()
            else:
                FileItem.objects.create(
                    order=order,
                    file_name=f.get('fileName', ''),
                    total_pages=int(f.get('totalPages', 0)),
                    start_page=int(f.get('startPage', 1)),
                    end_page=pages,
                    copies=int(f.get('copies', 1)),
                    remote_url=f.get('uploadUrl', '') if str(f.get('uploadUrl', '')).startswith('http') else '',
                )
        try:
            sync_public_order(
                order,
                pricing=pricing,
                files=files,
                cart_items=cart_items,
                explicit_items=explicit_items,
                delivery_address=delivery_address,
                payment_status='pending',
                user_id=user_id,
            )
        except Exception as sync_err:
            print(f"Public order sync failed: {sync_err}")
    except Exception as db_err:
        return Response({'error': f'Database error: {str(db_err)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if not redirect_url:
        redirect_url = os.getenv('PHONEPE_REDIRECT_URL') or request.build_absolute_uri('/checkout')

    if not phonepe_client.is_configured():
        payment = Payment.objects.create(
            order=order,
            phonepe_order_id=f"mock_{order_number}",
            amount=amount,
            status='mock_created'
        )
        return Response({
            'success': True,
            'mock': True,
            'order_number': order_number,
            'redirectUrl': f"{redirect_url}?status=mock&order={order_number}",
            'data': {
                'merchantPaymentId': payment.phonepe_order_id,
                'redirectUrl': f"{redirect_url}?status=mock&order={order_number}"
            }
        })

    try:
        response = phonepe_client.create_checkout_payment(
            merchant_order_id=order_number,
            amount_paise=amount,
            redirect_url=redirect_url,
            message=f"Payment for {order_number}",
            phone=phone,
        )

        if response.status_code in (200, 201):
            resp_data = response.json()
            payment_url = resp_data.get('redirectUrl', '')
            phonepe_order_id = resp_data.get('orderId', '')
            Payment.objects.create(
                order=order,
                phonepe_order_id=phonepe_order_id,
                amount=amount,
                status=resp_data.get('state', 'PENDING')
            )
            return Response({
                'success': True,
                'order_number': order_number,
                'redirectUrl': payment_url,
                'data': resp_data,
            })

        print(f"PhonePe API Error: {response.status_code} - {response.text}")
        return Response({
            'error': 'PhonePe API error',
            'details': response.text,
            'order_number': order_number
        }, status=status.HTTP_502_BAD_GATEWAY)

    except requests.exceptions.RequestException as req_err:
        print(f"PhonePe Request Error: {str(req_err)}")
        return Response({
            'error': 'PhonePe request failed',
            'details': str(req_err),
            'order_number': order_number
        }, status=status.HTTP_502_BAD_GATEWAY)
    except Exception as err:
        print(f"PhonePe Error: {str(err)}")
        return Response({
            'error': str(err),
            'order_number': order_number
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def checkout_quote(request):
    try:
        data = request.data if hasattr(request, 'data') else json.loads(request.body.decode('utf-8'))
    except Exception:
        return Response({'error': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)

    pricing = calculate_checkout_pricing(
        files=data.get('files', []),
        cart_items=data.get('cartItems', []),
        coupon_code=data.get('coupon', ''),
    )
    return Response({'success': True, 'pricing': pricing})


@api_view(['GET'])
@permission_classes([AllowAny])
def checkout_charge_settings(request):
    settings_data = get_checkout_charge_settings()
    return Response({
        'success': True,
        'settings': {
            key: float(value) for key, value in settings_data.items()
        }
    })


@csrf_exempt
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def check_payment_status(request):
    """Check payment status from PhonePe.
    GET /api/payments/status/<order_number>/
    """
    order_number = request.GET.get('order_number') or request.data.get('order_number')

    if not order_number:
        return Response({'error': 'order_number required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        order = Order.objects.get(order_number=order_number)
        payment = order.payments.last()

        if not payment:
            return Response({'error': 'No payment found'}, status=status.HTTP_404_NOT_FOUND)

        if payment.phonepe_order_id and not payment.phonepe_order_id.startswith('mock_') and phonepe_client.is_configured():
            resp = phonepe_client.get_order_status(order.order_number)

            if resp.ok:
                resp_data = resp.json()
                phonepe_status = resp_data.get('state', '')
                transaction_id = ''
                payment_details = resp_data.get('paymentDetails') or []
                if payment_details:
                    transaction_id = payment_details[0].get('transactionId', '')

                payment.status = phonepe_status
                if transaction_id:
                    payment.phonepe_order_id = transaction_id
                payment.save()

                if phonepe_status in _phonepe_success_states():
                    order.status = 'processing'
                    order.save()
                    update_public_order_payment_status(order, 'completed')
                    if _shiprocket_auto_enabled() and not ShiprocketShipment.objects.filter(order=order).exists():
                        try:
                            create_shiprocket_shipment_for_order(
                                order,
                                payment_method='PhonePe',
                                comment='Created automatically after PhonePe payment'
                            )
                            update_public_order_payment_status(order, 'completed')
                        except Exception as shiprocket_err:
                            log_shiprocket_event(
                                'auto_shipment_failed',
                                order.order_number,
                                details={'error': str(shiprocket_err)}
                            )
                elif phonepe_status == 'FAILED':
                    order.status = 'pending'
                    order.save()
                    update_public_order_payment_status(order, 'failed')

                return Response({
                    'order_number': order_number,
                    'payment_status': phonepe_status,
                    'transaction_id': transaction_id,
                    'order_status': order.status,
                })

        # Return local status for mock payments
        return Response({
            'order_number': order_number,
            'payment_status': payment.status,
            'order_status': 'unknown'
        })

    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as err:
        return Response({'error': str(err)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
@require_admin_for_methods('POST')
def payment_settings(request):
    """Get or save payment gateway settings.
    GET /api/payments/settings/ - Returns current settings
    POST /api/payments/settings/ - Saves new settings
    """
    if request.method == 'GET':
        phonepe_enabled = phonepe_client.is_configured()
        return Response({
            'razorpay': {
                'enabled': False,
                'keyId': '',
                'testMode': True,
            },
            'phonepe': {
                'enabled': phonepe_enabled,
                'merchantId': '',
                'saltIndex': phonepe_client._client_version() if phonepe_enabled else '1',
                'testMode': phonepe_client._is_sandbox(),
            },
            'codEnabled': True,
        })

    elif request.method == 'POST':
        try:
            data = request.data if hasattr(request, 'data') else json.loads(request.body.decode('utf-8'))
            return Response({'success': True, 'message': 'Settings saved'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def detect_pdf_pages(request):
    """Return the page count for an uploaded PDF without saving the file."""
    file = request.FILES.get('file')
    if not file:
        return Response({'error': 'file required'}, status=status.HTTP_400_BAD_REQUEST)

    filename = (file.name or '').lower()
    content_type = (getattr(file, 'content_type', '') or '').lower()
    if not filename.endswith('.pdf') or (content_type and content_type not in {'application/pdf', 'application/x-pdf'}):
        return Response({'error': 'Only PDF files are accepted'}, status=status.HTTP_400_BAD_REQUEST)

    if file.size > 75 * 1024 * 1024:
        return Response({'error': 'PDF is too large. Please upload a file under 75 MB.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        from pypdf import PdfReader

        file.seek(0)
        reader = PdfReader(file)
        pages = len(reader.pages)
        if pages < 1:
            return Response({'error': 'Could not detect pages in this PDF'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        return Response({'success': True, 'pages': pages, 'fileName': file.name})
    except Exception as exc:
        try:
            # Fallback for local environments before pypdf is installed.
            # Counts page objects, excluding the /Pages tree object.
            import re

            file.seek(0)
            content = file.read()
            pages = len(re.findall(rb'/Type\s*/Page\b(?!s)', content))
            if pages > 0:
                return Response({'success': True, 'pages': pages, 'fileName': file.name, 'fallback': True})
        except Exception:
            pass

        return Response(
            {'error': 'Could not detect pages in this PDF', 'details': str(exc)},
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )


@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def upload_file(request):
    """Upload a checkout PDF and keep it temporarily until payment creates the order."""
    file = request.FILES.get('file')
    order_number = request.data.get('order_number')

    if not file:
        return Response({'error': 'file required'}, status=status.HTTP_400_BAD_REQUEST)

    filename = (file.name or '').lower()
    content_type = (getattr(file, 'content_type', '') or '').lower()
    if not filename.endswith('.pdf') or (content_type and content_type not in {'application/pdf', 'application/x-pdf'}):
        return Response({'error': 'Only PDF files are accepted'}, status=status.HTTP_400_BAD_REQUEST)

    if file.size > 75 * 1024 * 1024:
        return Response({'error': 'PDF is too large. Please upload a file under 75 MB.'}, status=status.HTTP_400_BAD_REQUEST)

    detected_pages = 0
    try:
        from pypdf import PdfReader
        file.seek(0)
        detected_pages = len(PdfReader(file).pages)
    except Exception:
        try:
            file.seek(0)
            content = file.read()
            detected_pages = len(re.findall(rb'/Type\s*/Page\b(?!s)', content))
        except Exception:
            detected_pages = 0
    finally:
        try:
            file.seek(0)
        except Exception:
            pass

    order = None
    if order_number:
        order = Order.objects.filter(order_number=order_number).first()
    if not order:
        order = Order.objects.create(order_number=f"upload_{uuid.uuid4().hex[:18]}")

    remote_url = upload_pdf_to_supabase_storage(file, order.order_number)

    fi = FileItem.objects.create(
        order=order,
        file_name=file.name,
        total_pages=detected_pages,
        start_page=1,
        end_page=detected_pages or 1,
        copies=1,
        upload=file,
        remote_url=remote_url,
    )
    serializer = FileItemSerializer(fi, context={'request': request})
    data = serializer.data
    data['success'] = True
    data['fileItemId'] = fi.id
    data['pages'] = detected_pages
    data['tempOrderNumber'] = order.order_number
    data['uploadUrl'] = fi.remote_url or (request.build_absolute_uri(fi.upload.url) if fi.upload else '')
    return Response(data, status=status.HTTP_201_CREATED)


@csrf_exempt
def phonepe_callback(request):
    """Handle PhonePe callback/webhook. Verifies signature and updates payment status."""
    # Extract X-VERIFY header
    signature_header = request.headers.get('X-VERIFY') or request.headers.get('X-SIGNATURE')
    
    # PhonePe webhook body is standard JSON: {"response": "<Base64_Payload>"}
    try:
        req_data = json.loads(request.body.decode('utf-8'))
        base64_response = req_data.get('response')
    except Exception:
        return HttpResponse("Invalid request JSON", status=400)

    merchant_secret = phonepe_client._client_secret()
    salt_index = phonepe_client._client_version()

    if merchant_secret and signature_header and base64_response:
        verify_string = f"{base64_response}{merchant_secret}"
        calculated_hash = hashlib.sha256(verify_string.encode('utf-8')).hexdigest()

        header_parts = signature_header.split('###')
        header_salt_index = header_parts[1] if len(header_parts) > 1 else salt_index
        expected_signature = f"{calculated_hash}###{header_salt_index}"

        if not hmac.compare_digest(expected_signature, signature_header):
            print(f"PhonePe Webhook signature verification failed. Got: {signature_header}, Expected: {expected_signature}")
            return HttpResponse("Signature mismatch", status=403)

    # Decode and parse response payload
    try:
        decoded_bytes = base64.b64decode(base64_response)
        data = json.loads(decoded_bytes.decode('utf-8'))
    except Exception as e:
        print(f"PhonePe Webhook base64 decode failed: {e}")
        return HttpResponse("Failed to decode response payload", status=400)

    success_status = data.get('success', False)
    payload_data = data.get('data', {})

    merchant_txn_id = payload_data.get('merchantTransactionId') or data.get('merchantTransactionId')
    phonepe_txn_id = payload_data.get('transactionId') or payload_data.get('providerReferenceId') or data.get('providerReferenceId')
    payment_state = payload_data.get('state') or data.get('state') or ('SUCCESS' if success_status else 'FAILED')

    try:
        order = Order.objects.filter(order_number=merchant_txn_id).first()
        if order:
            payment = order.payments.last()
            if payment:
                payment.status = payment_state
                if phonepe_txn_id:
                    payment.phonepe_order_id = phonepe_txn_id
                payment.save()
                
                # Update order status if payment is completed
                if payment_state == 'COMPLETED' or payment_state == 'SUCCESS':
                    order.status = 'processing'
                    order.save()

        return HttpResponse('OK', status=200)
    except Exception as e:
        print(f"Callback processing error: {e}")
        return HttpResponse(status=500)


# ==================== SHIPROCKET ENDPOINTS ====================

SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external"

def get_shiprocket_token():
    """Get or refresh Shiprocket auth token"""
    try:
        cached = ShiprocketToken.objects.first()
        if cached and cached.expires_at > timezone.now():
            return cached.token
    except:
        pass

    settings_obj = ShiprocketSettings.get_settings()
    if not settings_obj.email or not settings_obj.password:
        raise Exception("Shiprocket credentials not configured")

    auth_response = requests.post(
        f"{SHIPROCKET_BASE_URL}/auth/login",
        json={"email": settings_obj.email, "password": settings_obj.password},
        timeout=15
    )
    auth_data = auth_response.json()

    if not auth_response.ok or not auth_data.get('token'):
        raise Exception(auth_data.get('message') or 'Shiprocket auth failed')

    # Cache token (expires in ~240h, cache for 23h)
    from datetime import timedelta
    expires_at = timezone.now() + timedelta(hours=23)

    if cached:
        cached.token = auth_data['token']
        cached.expires_at = expires_at
        cached.save()
    else:
        ShiprocketToken.objects.create(token=auth_data['token'], expires_at=expires_at)

    return auth_data['token']


def log_shiprocket_event(event_type, order_number='', awb='', details=None):
    """Log Shiprocket events for audit"""
    ShiprocketLog.objects.create(
        event_type=event_type,
        order_number=order_number,
        awb_code=awb,
        details=details or {}
    )


def fetch_shiprocket_tracking(awb):
    token = get_shiprocket_token()
    response = requests.get(
        f"{SHIPROCKET_BASE_URL}/courier/track/awb/{awb}",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15
    )
    try:
        data = response.json()
    except ValueError:
        data = {}
    return response, data


def normalize_shiprocket_tracking(data, identifier='', awb='', order=None):
    """Return customer-safe tracking details without exposing raw courier payloads."""
    tracking_data = data.get('tracking_data') if isinstance(data, dict) else {}
    if not isinstance(tracking_data, dict):
        tracking_data = {}

    shipment_track = tracking_data.get('shipment_track') or data.get('shipment_track') or []
    if isinstance(shipment_track, dict):
        shipment_track = [shipment_track]
    primary_track = shipment_track[0] if shipment_track else {}
    if not isinstance(primary_track, dict):
        primary_track = {}

    raw_activities = (
        tracking_data.get('shipment_track_activities')
        or data.get('shipment_track_activities')
        or primary_track.get('shipment_track_activities')
        or []
    )
    if isinstance(raw_activities, dict):
        raw_activities = [raw_activities]

    activities = []
    for item in raw_activities[:20]:
        if not isinstance(item, dict):
            continue
        activities.append({
            'date': item.get('date') or item.get('activity_date') or item.get('created_at') or '',
            'status': item.get('activity') or item.get('status') or item.get('sr-status-label') or '',
            'location': item.get('location') or item.get('city') or '',
            'remarks': item.get('remarks') or item.get('description') or '',
        })

    track_url = (
        tracking_data.get('track_url')
        or tracking_data.get('tracking_url')
        or data.get('track_url')
        or data.get('tracking_url')
        or primary_track.get('track_url')
        or primary_track.get('tracking_url')
        or (order.tracking_url if order else '')
    )
    awb_code = awb or primary_track.get('awb_code') or primary_track.get('awb') or (order.tracking_number if order else '')
    current_status = (
        tracking_data.get('shipment_status')
        or tracking_data.get('current_status')
        or primary_track.get('current_status')
        or primary_track.get('shipment_status')
        or primary_track.get('status')
        or (order.status if order else '')
    )

    return {
        'success': True,
        'identifier': identifier,
        'orderNumber': order.order_number if order else '',
        'awb': awb_code or '',
        'currentStatus': str(current_status or ''),
        'courierName': primary_track.get('courier_name') or primary_track.get('courier') or '',
        'estimatedDelivery': primary_track.get('edd') or primary_track.get('etd') or tracking_data.get('etd') or '',
        'trackUrl': track_url or '',
        'activities': activities,
        'message': data.get('message') or tracking_data.get('message') or '',
    }


@csrf_exempt
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
@require_admin_user
def shiprocket_settings(request):
    """Get or save Shiprocket settings"""
    if request.method == 'GET':
        try:
            s = ShiprocketSettings.get_settings()
            return Response({
                'enabled': s.enabled,
                'email': s.email,
                'password': '',  # Don't expose password
                'webhookSecret': '',
                'pickupLocation': s.pickup_location,
                'companyName': s.company_name,
                'phone': s.phone,
                'address': s.address,
                'address2': s.address2,
                'city': s.city,
                'state': s.state,
                'pincode': s.pincode,
                'country': s.country,
                'defaultWeight': s.default_weight,
                'defaultLength': s.default_length,
                'defaultBreadth': s.default_breadth,
                'defaultHeight': s.default_height,
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    elif request.method == 'POST':
        try:
            data = request.data if hasattr(request, 'data') else json.loads(request.body.decode('utf-8'))
            s = ShiprocketSettings.get_settings()
            s.enabled = data.get('enabled', False)
            s.email = data.get('email', '')
            password = data.get('password', '')
            if password:
                s.password = password
            s.webhook_secret = data.get('webhookSecret', '')
            s.pickup_location = data.get('pickupLocation', 'Primary')
            s.company_name = data.get('companyName', 'Sanjari Prints')
            s.phone = data.get('phone', '+91')
            s.address = data.get('address', '')
            s.address2 = data.get('address2', '')
            s.city = data.get('city', 'Mumbai')
            s.state = data.get('state', 'Maharashtra')
            s.pincode = data.get('pincode', '')
            s.country = data.get('country', 'India')
            s.default_weight = float(data.get('defaultWeight', 0.5))
            s.default_length = int(data.get('defaultLength', 25))
            s.default_breadth = int(data.get('defaultBreadth', 20))
            s.default_height = int(data.get('defaultHeight', 4))
            s.save()

            # Delete cached token so it refreshes with new creds
            ShiprocketToken.objects.all().delete()

            return Response({'success': True, 'settings': {
                'enabled': s.enabled,
                'email': s.email,
                'pickupLocation': s.pickup_location,
            }})
        except Exception as e:
            return Response({'error': str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
@require_admin_user
def shiprocket_create_shipment(request):
    """Create Shiprocket shipment for an order"""
    try:
        data = request.data if hasattr(request, 'data') else json.loads(request.body.decode('utf-8'))
        order_number = data.get('orderNumber')

        if not order_number:
            return Response({'error': 'orderNumber is required'}, status=400)

        # Get or find order
        order = Order.objects.filter(order_number=order_number).first()
        if not order:
            return Response({'error': 'Order not found'}, status=404)

        settings_obj = ShiprocketSettings.get_settings()
        if not settings_obj.enabled:
            return Response({'error': 'Shiprocket integration is disabled'}, status=400)

        if not settings_obj.email or not settings_obj.password:
            return Response({'error': 'Shiprocket credentials not configured'}, status=400)

        token = get_shiprocket_token()

        # Parse delivery address from order
        shipping_addr = {}
        if order.shipping_address:
            try:
                shipping_addr = json.loads(order.shipping_address)
            except:
                shipping_addr = {}

        full_name = shipping_addr.get('fullName', order.name or 'Customer')
        name_parts = full_name.split(' ', 1)
        first_name = name_parts[0] if name_parts else 'Customer'
        last_name = name_parts[1] if len(name_parts) > 1 else 'Customer'

        # Build order items
        items_data = data.get('items', [])
        if not items_data and hasattr(order, 'items'):
            try:
                items_data = json.loads(order.items) if isinstance(order.items, str) else order.items
            except:
                items_data = []

        order_items = []
        for idx, item in enumerate(items_data):
            order_items.append({
                "name": item.get('productName') or item.get('name') or f'Item {idx+1}',
                "sku": item.get('sku') or f'SKU-{order_number}-{idx+1}',
                "units": int(item.get('quantity') or 1),
                "selling_price": str(item.get('price') or 0),
                "discount": "",
                "tax": "",
            })

        if not order_items:
            order_items.append({
                "name": "Printing Order",
                "sku": f'SKU-{order_number}',
                "units": 1,
                "selling_price": str(order.subtotal or 0),
                "discount": "",
                "tax": "",
            })

        # Determine COD or Prepaid
        payment_method = data.get('paymentMethod', 'COD')
        is_cod = 'cod' in payment_method.lower() or 'cash' in payment_method.lower()

        # Create shipment payload
        payload = {
            "order_id": order_number,
            "order_date": order.created_at.strftime('%Y-%m-%d %H:%M:%S') if order.created_at else datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "pickup_location": settings_obj.pickup_location or "Primary",
            "channel_id": "",
            "comment": "Created from Sanjari Admin",
            "billing_customer_name": first_name,
            "billing_last_name": last_name,
            "billing_address": shipping_addr.get('address', settings_obj.address or 'Address not provided'),
            "billing_address_2": shipping_addr.get('landmark', settings_obj.address2 or ''),
            "billing_city": shipping_addr.get('city', settings_obj.city),
            "billing_pincode": str(shipping_addr.get('pincode', settings_obj.pincode or '')),
            "billing_state": shipping_addr.get('state', settings_obj.state),
            "billing_country": settings_obj.country or "India",
            "billing_email": shipping_addr.get('email', order.email or 'support@sanjariprints.com'),
            "billing_phone": shipping_addr.get('phone', order.phone or settings_obj.phone),
            "shipping_is_billing": True,
            "order_items": order_items,
            "payment_method": "COD" if is_cod else "Prepaid",
            "shipping_charges": 0,
            "giftwrap_charges": 0,
            "transaction_charges": 0,
            "total_discount": 0,
            "sub_total": order.subtotal or 0,
            "length": settings_obj.default_length or 25,
            "breadth": settings_obj.default_breadth or 20,
            "height": settings_obj.default_height or 4,
            "weight": settings_obj.default_weight or 0.5,
        }

        # Create shipment via Shiprocket API
        shipment_response = requests.post(
            f"{SHIPROCKET_BASE_URL}/orders/create/adhoc",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}",
            },
            json=payload,
            timeout=30
        )

        shipment_data = shipment_response.json()

        if not shipment_response.ok:
            log_shiprocket_event('shipment_create_failed', order_number, details={'response': shipment_data})
            return Response({
                'error': shipment_data.get('message') or shipment_data.get('error') or 'Shiprocket API failed',
                'details': shipment_data
            }, status=502)

        awb_code = shipment_data.get('awb_code') or shipment_data.get('data', {}).get('awb_code', '')
        tracking_url = shipment_data.get('tracking_url') or shipment_data.get('data', {}).get('tracking_url', '')

        # Save shipment record
        shipment, created = ShiprocketShipment.objects.update_or_create(
            order=order,
            defaults={
                'shipment_id': shipment_data.get('shipment_id') or shipment_data.get('order_id', ''),
                'awb_code': awb_code,
                'tracking_url': tracking_url,
                'status': 'created',
                'raw_response': shipment_data,
            }
        )

        # Update order with tracking info
        order.tracking_number = awb_code
        order.tracking_url = tracking_url
        order.status = 'shipped'
        order.save()

        log_shiprocket_event('shipment_created', order_number, awb_code, {'shipmentId': shipment.shipment_id})

        return Response({
            'success': True,
            'message': shipment_data.get('message', 'Shipment created'),
            'shipmentId': shipment.shipment_id,
            'awbCode': awb_code,
            'trackingUrl': tracking_url,
        })

    except Exception as e:
        print(f"Shiprocket shipment error: {e}")
        return Response({'error': str(e)}, status=500)


@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def shiprocket_track(request, awb):
    """Track shipment by AWB code"""
    try:
        if not awb:
            return Response({'error': 'AWB code is required'}, status=400)

        response, data = fetch_shiprocket_tracking(awb)
        if not response.ok:
            return Response({'error': data.get('message') or 'Tracking failed'}, status=502)

        order = Order.objects.filter(tracking_number__iexact=awb).first()
        return Response(normalize_shiprocket_tracking(data, identifier=awb, awb=awb, order=order))

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@csrf_exempt
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def shiprocket_customer_track(request):
    """Track by public order number or Shiprocket AWB without exposing private order details."""
    try:
        identifier = (
            request.query_params.get('id')
            or request.data.get('id')
            or request.data.get('orderNumber')
            or request.data.get('awb')
            or ''
        ).strip()

        if not identifier:
            return Response({'error': 'Order number or AWB is required'}, status=400)
        if len(identifier) > 80 or not re.match(r'^[A-Za-z0-9][A-Za-z0-9_-]*$', identifier):
            return Response({'error': 'Enter a valid order number or AWB'}, status=400)

        looks_like_order_number = bool(re.match(r'^(SPR|Sanjari|SANJARI)[-_]?', identifier, re.IGNORECASE))
        order = Order.objects.filter(
            Q(order_number__iexact=identifier) | Q(tracking_number__iexact=identifier)
        ).first()
        shipment = None
        if not order:
            shipment = ShiprocketShipment.objects.select_related('order').filter(awb_code__iexact=identifier).first()
            if shipment:
                order = shipment.order

        if looks_like_order_number and not order:
            return Response({'error': 'Order not found. Please check the order number and try again.'}, status=404)

        awb = ''
        if order and order.tracking_number:
            awb = order.tracking_number
        elif shipment and shipment.awb_code:
            awb = shipment.awb_code
        elif order:
            return Response({
                'success': True,
                'identifier': identifier,
                'orderNumber': order.order_number,
                'awb': '',
                'currentStatus': order.status or 'processing',
                'courierName': '',
                'estimatedDelivery': '',
                'trackUrl': '',
                'activities': [],
                'message': 'Shipment has been created. AWB assignment is pending from Shiprocket.',
                'awbPending': True,
            })
        else:
            awb = identifier

        response, data = fetch_shiprocket_tracking(awb)
        if not response.ok:
            return Response({'error': data.get('message') or 'Tracking failed'}, status=502)

        normalized = normalize_shiprocket_tracking(data, identifier=identifier, awb=awb, order=order)
        has_tracking_signal = any([
            normalized.get('currentStatus'),
            normalized.get('courierName'),
            normalized.get('trackUrl'),
            normalized.get('activities'),
            order,
        ])
        if not has_tracking_signal:
            return Response({'error': 'Tracking details not found. Please check the order number or AWB.'}, status=404)

        return Response(normalized)

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
@require_admin_user
def shiprocket_label_by_order(request, order_number):
    """Generate shipping label by order number"""
    try:
        shipment = ShiprocketShipment.objects.filter(order__order_number=order_number).first()
        if not shipment:
            return Response({'error': 'Shipment not found for this order'}, status=404)

        token = get_shiprocket_token()
        shipment_id = shipment.shipment_id

        response = requests.post(
            f"{SHIPROCKET_BASE_URL}/courier/generate/label",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}",
            },
            json={"shipment_id": [int(shipment_id)] if shipment_id.isdigit() else [shipment_id]},
            timeout=30
        )

        data = response.json()
        if not response.ok:
            return Response({'error': data.get('message') or 'Label generation failed'}, status=502)

        # Update shipment with label URL
        if data.get('label_url'):
            shipment.label_url = data['label_url']
            shipment.save()

        log_shiprocket_event('label_generated', order_number, shipment.awb_code)

        return Response({'success': True, **data})

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
@require_admin_user
def shiprocket_manifest_by_order(request, order_number):
    """Generate manifest by order number"""
    try:
        shipment = ShiprocketShipment.objects.filter(order__order_number=order_number).first()
        if not shipment:
            return Response({'error': 'Shipment not found for this order'}, status=404)

        token = get_shiprocket_token()
        shipment_id = shipment.shipment_id

        # Generate manifest
        manifest_response = requests.post(
            f"{SHIPROCKET_BASE_URL}/manifests/generate",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}",
            },
            json={"shipment_id": [int(shipment_id)] if shipment_id.isdigit() else [shipment_id]},
            timeout=30
        )

        manifest_data = manifest_response.json()
        if not manifest_response.ok:
            return Response({'error': manifest_data.get('message') or 'Manifest generation failed'}, status=502)

        # Print manifest
        print_response = requests.post(
            f"{SHIPROCKET_BASE_URL}/manifests/print",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}",
            },
            json={"shipment_id": [int(shipment_id)] if shipment_id.isdigit() else [shipment_id]},
            timeout=30
        )

        print_data = print_response.json()

        if print_data.get('manifest_url'):
            shipment.manifest_url = print_data['manifest_url']
            shipment.save()

        log_shiprocket_event('manifest_generated', order_number, shipment.awb_code)

        return Response({'success': True, 'manifest': manifest_data, 'print': print_data})

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def shiprocket_webhook(request):
    """Handle Shiprocket webhook for order status updates"""
    try:
        settings_obj = ShiprocketSettings.get_settings()
        raw_body = request.body.decode('utf-8')

        if not settings_obj.webhook_secret:
            return Response({'error': 'Shiprocket webhook secret is not configured'}, status=403)

        signature = request.headers.get('X-Shiprocket-Signature') or request.headers.get('X-Webhook-Signature', '')
        expected = hmac.new(
            settings_obj.webhook_secret.encode('utf-8'),
            raw_body.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(signature, expected):
            return Response({'error': 'Invalid signature'}, status=401)

        data = json.loads(raw_body)

        # Extract tracking info
        order_id = data.get('order_id') or data.get('orderId')
        awb = data.get('awb_code') or data.get('awb') or ''
        current_status = data.get('current_status') or data.get('status', '')
        tracking_url = data.get('tracking_url') or ''

        if order_id:
            order = Order.objects.filter(order_number=order_id).first()
            if order:
                # Map Shiprocket status to our status
                status_map = {
                    'delivered': 'delivered',
                    'shipped': 'shipped',
                    'in_transit': 'shipped',
                    'out_for_delivery': 'shipped',
                    'cancelled': 'cancelled',
                    'rto': 'cancelled',
                    'pending': 'pending',
                    'processing': 'processing',
                }
                new_status = status_map.get(current_status.lower(), 'pending')

                order.status = new_status
                if awb:
                    order.tracking_number = awb
                if tracking_url:
                    order.tracking_url = tracking_url
                order.save()

                log_shiprocket_event('webhook_received', order_id, awb, {
                    'current_status': current_status,
                    'new_status': new_status
                })

        return Response({'success': True})

    except Exception as e:
        print(f"Webhook error: {e}")
        return Response({'error': str(e)}, status=500)


@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
@require_admin_user
def shiprocket_logs(request):
    """Get Shiprocket audit logs"""
    try:
        limit = int(request.GET.get('limit', 200))
        logs = ShiprocketLog.objects.all()[:limit]
        return Response({
            'success': True,
            'logs': [
                {
                    'eventType': log.event_type,
                    'orderNumber': log.order_number,
                    'awbCode': log.awb_code,
                    'details': log.details,
                    'createdAt': log.created_at.isoformat(),
                }
                for log in logs
            ]
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
@require_admin_user
def shiprocket_action(request):
    """Handle manual Shiprocket actions (retry delivery, mark RTO)"""
    try:
        data = request.data if hasattr(request, 'data') else json.loads(request.body.decode('utf-8'))
        order_number = data.get('orderNumber')
        action = data.get('action')
        note = data.get('note', '')

        if not order_number or not action:
            return Response({'error': 'orderNumber and action are required'}, status=400)

        order = Order.objects.filter(order_number=order_number).first()
        if not order:
            return Response({'error': 'Order not found'}, status=404)

        if action == 'retry_delivery':
            order.status = 'shipped'
            order.save()
            log_shiprocket_event('manual_retry', order_number, order.tracking_number)
            return Response({'success': True, 'action': action, 'message': 'Retry delivery initiated'})

        elif action == 'mark_rto':
            order.status = 'cancelled'
            order.save()
            log_shiprocket_event('manual_rto', order_number, order.tracking_number, {'note': note})
            return Response({'success': True, 'action': action, 'message': 'Order marked as RTO'})

        else:
            return Response({'error': f'Unknown action: {action}'}, status=400)

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
@require_admin_user
def upload_image(request):
    """Upload an image (base64). Returns URL of the uploaded image."""
    import uuid
    try:
        data = request.data if hasattr(request, 'data') else json.loads(request.body.decode('utf-8'))
        file_data = data.get('file')
        file_name = data.get('fileName', 'image.png')
        
        if not file_data:
            return Response({'error': 'file is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Parse base64 string
        if ';base64,' in file_data:
            format, imgstr = file_data.split(';base64,')
        else:
            imgstr = file_data
            
        ext = file_name.split('.')[-1].lower() if '.' in file_name else 'png'
        if ext not in {'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'}:
            ext = 'png'
        unique_name = f"{uuid.uuid4()}.{ext}"
        
        folder_path = os.path.join(settings.MEDIA_ROOT, 'images')
        os.makedirs(folder_path, exist_ok=True)
        
        file_path = os.path.join(folder_path, unique_name)
        with open(file_path, 'wb') as f:
            f.write(base64.b64decode(imgstr))
            
        relative_url = f"{settings.MEDIA_URL}images/{unique_name}"
        url = request.build_absolute_uri(relative_url)
        return Response({'success': True, 'url': url})
        
    except Exception as e:
        print(f"Error uploading image: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([AllowAny])
@require_admin_for_methods('POST', 'DELETE')
def logo_view(request):
    """Get, set or delete site logo.
    GET /api/payments/logo/
    POST /api/payments/logo/
    DELETE /api/payments/logo/
    """
    import uuid
    if request.method == 'GET':
        logo_url = SiteSetting.get('site_logo', '')
        return Response({'logo': logo_url})
        
    elif request.method == 'POST':
        try:
            data = request.data if hasattr(request, 'data') else json.loads(request.body.decode('utf-8'))
            file_data = data.get('file')
            file_name = data.get('fileName', 'logo.png')
            
            if not file_data:
                return Response({'error': 'file is required'}, status=status.HTTP_400_BAD_REQUEST)
                
            # Parse base64 string
            if ';base64,' in file_data:
                format, imgstr = file_data.split(';base64,')
            else:
                imgstr = file_data
                
            ext = file_name.split('.')[-1].lower() if '.' in file_name else 'png'
            if ext not in {'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'}:
                ext = 'png'
            unique_name = f"logo_{uuid.uuid4()}.{ext}"
            
            folder_path = os.path.join(settings.MEDIA_ROOT, 'logos')
            os.makedirs(folder_path, exist_ok=True)
            
            file_path = os.path.join(folder_path, unique_name)
            with open(file_path, 'wb') as f:
                f.write(base64.b64decode(imgstr))
                
            relative_url = f"{settings.MEDIA_URL}logos/{unique_name}"
            url = request.build_absolute_uri(relative_url)
            SiteSetting.set('site_logo', url)
            
            return Response({'success': True, 'url': url})
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    elif request.method == 'DELETE':
        SiteSetting.set('site_logo', '')
        return Response({'success': True, 'message': 'Logo removed'})
