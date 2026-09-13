from django.db import models
import os
import uuid

# Simple file storage for logo
LOGO_STORAGE_KEY = 'site_logo'

class SiteSetting(models.Model):
    """Store site-wide settings like logo URL"""
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Packaging / Shipping Setting'
        verbose_name_plural = 'Packaging & Shipping Charges'

    def __str__(self):
        return self.key

    @classmethod
    def get(cls, key, default=''):
        try:
            return cls.objects.get(key=key).value
        except cls.DoesNotExist:
            return default

    @classmethod
    def set(cls, key, value):
        obj, _ = cls.objects.update_or_create(key=key, defaults={'value': value})
        return obj

class Order(models.Model):
    order_number = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    subtotal = models.IntegerField(default=0)
    total_pages = models.IntegerField(default=0)
    # Shipping fields
    status = models.CharField(max_length=50, default='pending')
    shipping_address = models.TextField(blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    tracking_url = models.URLField(blank=True)

    def __str__(self):
        return self.order_number

    class Meta:
        verbose_name = 'Backend Checkout Order'
        verbose_name_plural = 'Backend Checkout Orders'

class FileItem(models.Model):
    order = models.ForeignKey(Order, related_name='files', on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255)
    total_pages = models.IntegerField(default=0)
    start_page = models.IntegerField(default=1)
    end_page = models.IntegerField(default=1)
    copies = models.IntegerField(default=1)
    upload = models.FileField(upload_to='uploads/%Y/%m/%d/', null=True, blank=True)
    remote_url = models.URLField(blank=True)

class Payment(models.Model):
    order = models.ForeignKey(Order, related_name='payments', on_delete=models.CASCADE)
    phonepe_order_id = models.CharField(max_length=128, blank=True)
    amount = models.IntegerField(default=0)
    status = models.CharField(max_length=50, default='initiated')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.phonepe_order_id} ({self.status})"

    class Meta:
        verbose_name = 'Payment Transaction'
        verbose_name_plural = 'Payment Transactions'

# Shiprocket Integration
SHIPROCKET_API_URL = "https://apiv2.shiprocket.in/v1/external"

class ShiprocketSettings(models.Model):
    """Store Shiprocket credentials and settings"""
    enabled = models.BooleanField(default=False)
    email = models.EmailField(blank=True)
    password = models.CharField(max_length=255, blank=True)
    webhook_secret = models.CharField(max_length=255, blank=True)
    pickup_location = models.CharField(max_length=100, default='Primary')
    company_name = models.CharField(max_length=200, default='Sanjari Prints')
    phone = models.CharField(max_length=20, default='+91')
    address = models.TextField(blank=True)
    address2 = models.TextField(blank=True)
    city = models.CharField(max_length=100, default='Mumbai')
    state = models.CharField(max_length=100, default='Maharashtra')
    pincode = models.CharField(max_length=10, blank=True)
    country = models.CharField(max_length=100, default='India')
    default_weight = models.FloatField(default=0.5)
    default_length = models.IntegerField(default=25)
    default_breadth = models.IntegerField(default=20)
    default_height = models.IntegerField(default=4)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Shiprocket Settings'
        verbose_name_plural = 'Shiprocket Settings'

    @classmethod
    def get_settings(cls):
        settings, created = cls.objects.get_or_create(pk=1)
        import os
        if os.getenv('SHIPROCKET_EMAIL'):
            settings.enabled = os.getenv('SHIPROCKET_ENABLED', 'True').lower() in ('true', '1', 'yes')
            settings.email = os.getenv('SHIPROCKET_EMAIL', '')
            settings.password = os.getenv('SHIPROCKET_PASSWORD', '')
            if os.getenv('SHIPROCKET_WEBHOOK_SECRET') is not None:
                settings.webhook_secret = os.getenv('SHIPROCKET_WEBHOOK_SECRET', '')
            settings.company_name = os.getenv('SHIPROCKET_COMPANY_NAME', settings.company_name or 'Sanjari Prints')
            settings.phone = os.getenv('SHIPROCKET_PHONE', settings.phone or '+91')
            settings.pickup_location = os.getenv('SHIPROCKET_PICKUP_LOCATION', settings.pickup_location or 'Primary')
            settings.city = os.getenv('SHIPROCKET_CITY', settings.city or 'Mumbai')
            settings.state = os.getenv('SHIPROCKET_STATE', settings.state or 'Maharashtra')
            settings.pincode = os.getenv('SHIPROCKET_PINCODE', settings.pincode or '')
            settings.country = os.getenv('SHIPROCKET_COUNTRY', settings.country or 'India')
            settings.address = os.getenv('SHIPROCKET_ADDRESS', settings.address or '')
            settings.address2 = os.getenv('SHIPROCKET_ADDRESS2', settings.address2 or '')
            settings.save()
        return settings

    def __str__(self):
        return f"Shiprocket Settings (enabled={self.enabled})"

class ShiprocketToken(models.Model):
    """Cache Shiprocket auth token"""
    token = models.TextField()
    expires_at = models.DateTimeField()

    class Meta:
        verbose_name = 'Shiprocket Token'
        verbose_name_plural = 'Shiprocket Tokens'

class ShiprocketShipment(models.Model):
    """Track shipments created in Shiprocket"""
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='shipment')
    shipment_id = models.CharField(max_length=100, blank=True)
    awb_code = models.CharField(max_length=100, blank=True)
    courier_name = models.CharField(max_length=100, blank=True)
    label_url = models.URLField(blank=True)
    manifest_url = models.URLField(blank=True)
    tracking_url = models.URLField(blank=True)
    status = models.CharField(max_length=50, default='created')
    raw_response = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Shipment {self.awb_code} for {self.order.order_number}"

class ShiprocketLog(models.Model):
    """Audit log for Shiprocket events"""
    event_type = models.CharField(max_length=100)
    order_number = models.CharField(max_length=64, blank=True)
    awb_code = models.CharField(max_length=100, blank=True)
    details = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Shiprocket Log'
        verbose_name_plural = 'Shiprocket Logs'
        ordering = ['-created_at']


class SupabaseUser(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.TextField(unique=True)
    name = models.TextField()
    phone = models.TextField(blank=True, null=True)
    role = models.TextField(default='user')
    email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'users'
        verbose_name = 'Website User'
        verbose_name_plural = 'Website Users'

    def __str__(self):
        return f"{self.name} ({self.email})"


class PublicOrder(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField(blank=True, null=True)
    order_number = models.TextField(unique=True)
    items = models.JSONField(default=list)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.TextField(default='pending')
    shipping_address = models.JSONField(blank=True, null=True)
    payment_method = models.TextField(blank=True, null=True)
    payment_status = models.TextField(default='pending')
    tracking_number = models.TextField(blank=True, null=True)
    tracking_url = models.TextField(blank=True, null=True)
    estimated_delivery = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'orders'
        verbose_name = 'Website Order'
        verbose_name_plural = 'Website Orders'

    def __str__(self):
        return self.order_number


class PricingRule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.TextField()
    subcategory = models.TextField()
    rules = models.JSONField(default=dict)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'pricing_rules'
        verbose_name = 'Website Pricing Rule'
        verbose_name_plural = 'Website Pricing Rules'

    def __str__(self):
        return f"{self.category} / {self.subcategory}"


class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.TextField()
    subcategory = models.TextField()
    name = models.TextField()
    description = models.TextField(blank=True, null=True)
    base_price = models.DecimalField(max_digits=12, decimal_places=2)
    image_url = models.TextField(blank=True, null=True)
    specifications = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'products'
        verbose_name = 'Website Product'
        verbose_name_plural = 'Website Products'

    def __str__(self):
        return self.name


class ContentPage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page_type = models.TextField()
    title = models.TextField()
    content = models.TextField()
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'content_pages'
        verbose_name = 'Website Content Page'
        verbose_name_plural = 'Website Content Pages'

    def __str__(self):
        return f"{self.page_type}: {self.title}"


class FAQ(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.TextField()
    answer = models.TextField()
    category = models.TextField(blank=True, null=True)
    order_index = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'faqs'
        verbose_name = 'Website FAQ'
        verbose_name_plural = 'Website FAQs'

    def __str__(self):
        return self.question


class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField(blank=True, null=True)
    user_name = models.TextField()
    user_email = models.TextField()
    rating = models.IntegerField()
    review_text = models.TextField()
    status = models.TextField(default='pending')
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'reviews'
        verbose_name = 'Website Review'
        verbose_name_plural = 'Website Reviews'

    def __str__(self):
        return f"{self.user_name} - {self.rating}/5"


class SEOSetting(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page_path = models.TextField(unique=True)
    title = models.TextField()
    description = models.TextField(blank=True, null=True)
    keywords = models.TextField(blank=True, null=True)
    og_image = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'seo_settings'
        verbose_name = 'Website SEO Setting'
        verbose_name_plural = 'Website SEO Settings'

    def __str__(self):
        return self.page_path


class PaymentGatewaySetting(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    razorpay_enabled = models.BooleanField(default=False)
    razorpay_key_id = models.TextField(blank=True, null=True)
    razorpay_key_secret = models.TextField(blank=True, null=True)
    phonepe_enabled = models.BooleanField(default=True)
    phonepe_merchant_id = models.TextField(blank=True, null=True)
    phonepe_salt_key = models.TextField(blank=True, null=True)
    phonepe_salt_index = models.TextField(blank=True, null=True)
    cod_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'payment_gateway_settings'
        verbose_name = 'Website Payment Gateway Setting'
        verbose_name_plural = 'Website Payment Gateway Settings'

    def __str__(self):
        return f"Payment gateways ({self.id})"


class AdminAuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admin_id = models.UUIDField()
    admin_email = models.TextField()
    admin_name = models.TextField()
    action = models.TextField()
    details = models.JSONField(default=dict)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'admin_audit_logs'
        verbose_name = 'Website Admin Audit Log'
        verbose_name_plural = 'Website Admin Audit Logs'

    def __str__(self):
        return f"{self.action} by {self.admin_email}"
