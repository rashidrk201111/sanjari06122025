from django.urls import path
from . import views

urlpatterns = [
    # Payment endpoints
    path('create-payment/', views.create_payment, name='create_payment'),
    path('quote/', views.checkout_quote, name='checkout_quote'),
    path('charge-settings/', views.checkout_charge_settings, name='checkout_charge_settings'),
    path('status/', views.check_payment_status, name='check_payment_status'),
    path('settings/', views.payment_settings, name='payment_settings'),
    path('detect-pdf-pages/', views.detect_pdf_pages, name='detect_pdf_pages'),
    path('upload-file/', views.upload_file, name='upload_file'),
    path('callback/', views.phonepe_callback, name='phonepe_callback'),
    path('logo/', views.logo_view, name='logo'),
    path('upload-image/', views.upload_image, name='upload_image'),


    # Shiprocket endpoints
    path('shiprocket/settings/', views.shiprocket_settings, name='shiprocket_settings'),
    path('shiprocket/create-shipment/', views.shiprocket_create_shipment, name='shiprocket_create_shipment'),
    path('shiprocket/track-order/', views.shiprocket_customer_track, name='shiprocket_customer_track'),
    path('shiprocket/track/<str:awb>/', views.shiprocket_track, name='shiprocket_track'),
    path('shiprocket/label/<str:order_number>/', views.shiprocket_label_by_order, name='shiprocket_label'),
    path('shiprocket/manifest/<str:order_number>/', views.shiprocket_manifest_by_order, name='shiprocket_manifest'),
    path('shiprocket/webhook/', views.shiprocket_webhook, name='shiprocket_webhook'),
    path('shiprocket/logs/', views.shiprocket_logs, name='shiprocket_logs'),
    path('shiprocket/action/', views.shiprocket_action, name='shiprocket_action'),
]
