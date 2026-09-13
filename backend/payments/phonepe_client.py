import time
import requests
from django.conf import settings

_token_cache = {"token": None, "expires_at": 0}


def _is_sandbox():
    return bool(getattr(settings, "PHONEPE_SANDBOX", False))


def _client_id():
    return getattr(settings, "PHONEPE_CLIENT_ID", "") or ""


def _client_secret():
    return getattr(settings, "PHONEPE_CLIENT_SECRET", "") or ""


def _client_version():
    return str(getattr(settings, "PHONEPE_CLIENT_VERSION", "1") or "1")


def is_configured():
    return bool(_client_id() and _client_secret())


def _auth_url():
    if _is_sandbox():
        return "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token"
    return "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"


def _pay_url():
    if _is_sandbox():
        return "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay"
    return "https://api.phonepe.com/apis/pg/checkout/v2/pay"


def _status_url(merchant_order_id):
    if _is_sandbox():
        return f"https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/{merchant_order_id}/status"
    return f"https://api.phonepe.com/apis/pg/checkout/v2/order/{merchant_order_id}/status"


def get_access_token(force=False):
    now = int(time.time())
    if not force and _token_cache["token"] and _token_cache["expires_at"] > now + 60:
        return _token_cache["token"]

    response = requests.post(
        _auth_url(),
        data={
            "client_id": _client_id(),
            "client_version": _client_version(),
            "client_secret": _client_secret(),
            "grant_type": "client_credentials",
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=15,
    )
    response.raise_for_status()
    data = response.json()
    token = data.get("access_token")
    if not token:
        raise ValueError("PhonePe auth response missing access_token")

    expires_at = data.get("expires_at")
    if not expires_at:
        expires_at = now + int(data.get("expires_in") or 3600)

    _token_cache["token"] = token
    _token_cache["expires_at"] = int(expires_at)
    return token


def create_checkout_payment(merchant_order_id, amount_paise, redirect_url, message="Sanjari Prints order", phone=""):
    token = get_access_token()
    payment_flow = {
        "type": "PG_CHECKOUT",
        "message": message,
        "merchantUrls": {"redirectUrl": redirect_url},
        "paymentModeConfig": {
            "version": "V2",
            "enabledPaymentModes": [
                {"type": "UPI", "flows": ["INTENT", "QR", "COLLECT"]},
                {"type": "CARD"},
                {"type": "NET_BANKING"},
            ],
        },
    }
    payload = {
        "merchantOrderId": merchant_order_id,
        "amount": int(amount_paise),
        "expireAfter": 1200,
        "paymentFlow": payment_flow,
    }
    if phone:
        digits = "".join(ch for ch in str(phone) if ch.isdigit())
        if len(digits) >= 10:
            payload["prefillUserLoginDetails"] = {"phoneNumber": digits[-10:]}
    response = requests.post(
        _pay_url(),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"O-Bearer {token}",
        },
        json=payload,
        timeout=20,
    )
    return response


def get_order_status(merchant_order_id):
    token = get_access_token()
    response = requests.get(
        _status_url(merchant_order_id),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"O-Bearer {token}",
        },
        timeout=15,
    )
    return response
