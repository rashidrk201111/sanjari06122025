import json
from copy import deepcopy

from django import forms
from django.contrib import admin
from django.contrib.admin import AdminSite
from django.contrib.auth.models import Group
from django.db import models as django_models
from django.template.loader import render_to_string
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from rest_framework.authtoken.models import TokenProxy

from .models import (
    AdminAuditLog,
    ContentPage,
    FAQ,
    FileItem,
    Order,
    Payment,
    PaymentGatewaySetting,
    PricingRule,
    Product,
    PublicOrder,
    Review,
    SEOSetting,
    ShiprocketLog,
    ShiprocketSettings,
    ShiprocketShipment,
    ShiprocketToken,
    SiteSetting,
    SupabaseUser,
)


AdminSite.site_header = "Sanjari Prints Admin"
AdminSite.site_title = "Sanjari Prints"
AdminSite.index_title = "Website Operations"
admin.site.index_template = "admin/index.html"

for low_level_model in (Group, TokenProxy):
    try:
        admin.site.unregister(low_level_model)
    except admin.sites.NotRegistered:
        pass


class LargeJSONTextarea(forms.Textarea):
    def __init__(self, attrs=None):
        default_attrs = {
            "rows": 18,
            "style": "font-family: Consolas, monospace; min-height: 360px;",
            "spellcheck": "false",
        }
        default_attrs.update(attrs or {})
        super().__init__(default_attrs)


class ComfortableTextarea(forms.Textarea):
    def __init__(self, attrs=None):
        default_attrs = {"rows": 6}
        default_attrs.update(attrs or {})
        super().__init__(default_attrs)


class PricingOptionsWidget(forms.Widget):
    template_name = "admin/widgets/pricing_options.html"

    def __init__(self, *, price_label="Extra per page", price_key="priceModifier", attrs=None):
        self.price_label = price_label
        self.price_key = price_key
        super().__init__(attrs)

    def format_value(self, value):
        if isinstance(value, (list, tuple)):
            return json.dumps(value)
        return value or "[]"

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        context["widget"]["price_label"] = self.price_label
        context["widget"]["price_key"] = self.price_key
        return context

    def render(self, name, value, attrs=None, renderer=None):
        context = self.get_context(name, value, attrs)
        return mark_safe(render_to_string(self.template_name, context))


class PricingOptionsField(forms.Field):
    def __init__(self, *, price_label="Extra per page", price_key="priceModifier", **kwargs):
        self.price_key = price_key
        kwargs["widget"] = PricingOptionsWidget(price_label=price_label, price_key=price_key)
        super().__init__(**kwargs)

    def to_python(self, value):
        if not value:
            return []
        if isinstance(value, list):
            raw_options = value
        else:
            try:
                raw_options = json.loads(value)
            except (TypeError, json.JSONDecodeError) as exc:
                raise forms.ValidationError("The option rows could not be read. Please reload and try again.") from exc

        if not isinstance(raw_options, list):
            raise forms.ValidationError("Pricing options must be a list of rows.")

        options = []
        default_claimed = False
        for raw in raw_options:
            if not isinstance(raw, dict):
                continue
            name = str(raw.get("name") or "").strip()
            if not name:
                continue
            try:
                price = max(0, float(raw.get(self.price_key, 0) or 0))
            except (TypeError, ValueError):
                price = 0
            enabled = raw.get("enabled", True) is not False
            is_default = bool(raw.get("isDefault")) and enabled and not default_claimed
            default_claimed = default_claimed or is_default
            options.append({
                "name": name,
                self.price_key: round(price, 2),
                "enabled": enabled,
                "isDefault": is_default,
            })

        if options and not default_claimed:
            first_enabled = next((option for option in options if option["enabled"]), None)
            if first_enabled:
                first_enabled["isDefault"] = True
        return options


class HierarchicalPricingWidget(forms.Widget):
    template_name = "admin/widgets/hierarchical_pricing.html"

    def format_value(self, value):
        if isinstance(value, (list, tuple)):
            return json.dumps(value)
        return value or "[]"


class HierarchicalPricingField(forms.Field):
    def __init__(self, **kwargs):
        kwargs["widget"] = HierarchicalPricingWidget()
        super().__init__(**kwargs)

    def to_python(self, value):
        if not value:
            return []
        if isinstance(value, list):
            raw_sizes = value
        else:
            try:
                raw_sizes = json.loads(value)
            except (TypeError, json.JSONDecodeError) as exc:
                raise forms.ValidationError("The option rows could not be read. Please reload and try again.") from exc

        if not isinstance(raw_sizes, list):
            raise forms.ValidationError("Pricing sizes must be a list of sizes.")

        def _safe_float(val):
            try:
                if not val:
                    return 0.0
                return float(val)
            except (TypeError, ValueError):
                return 0.0

        sizes = []
        default_size_claimed = False
        for raw_size in raw_sizes:
            if not isinstance(raw_size, dict):
                continue
            size_name = str(raw_size.get("name") or "").strip()
            if not size_name:
                continue
            
            size_enabled = raw_size.get("enabled", True) is not False
            is_size_default = bool(raw_size.get("isDefault")) and size_enabled and not default_size_claimed
            default_size_claimed = default_size_claimed or is_size_default

            paper_types = []
            default_type_claimed = False
            
            for raw_type in raw_size.get("paperTypes", []):
                if not isinstance(raw_type, dict):
                    continue
                type_name = str(raw_type.get("name") or "").strip()
                if not type_name:
                    continue
                
                type_enabled = raw_type.get("enabled", True) is not False
                is_type_default = bool(raw_type.get("isDefault")) and type_enabled and not default_type_claimed
                default_type_claimed = default_type_claimed or is_type_default

                raw_prices = raw_type.get("prices") or {}
                price_keys = (
                    "bw_single",
                    "bw_double",
                    "bw_single_100",
                    "bw_double_100",
                    "bw_single_5000",
                    "bw_double_5000",
                    "color_single",
                    "color_double",
                    "color_single_100",
                    "color_double_100",
                    "color_single_5000",
                    "color_double_5000",
                    "premium_single",
                    "premium_double",
                    "premium_single_100",
                    "premium_double_100",
                    "premium_single_5000",
                    "premium_double_5000",
                )
                prices = {
                    key: max(0.0, _safe_float(raw_prices.get(key)))
                    for key in price_keys
                }

                paper_types.append({
                    "name": type_name,
                    "enabled": type_enabled,
                    "isDefault": is_type_default,
                    "prices": prices
                })

            if paper_types and not default_type_claimed:
                first_enabled = next((t for t in paper_types if t["enabled"]), None)
                if first_enabled:
                    first_enabled["isDefault"] = True

            binding_types = []
            default_binding_claimed = False
            for raw_b in raw_size.get("bindingTypes", []):
                if not isinstance(raw_b, dict):
                    continue
                b_name = str(raw_b.get("name") or "").strip()
                if not b_name:
                    continue
                b_enabled = raw_b.get("enabled", True) is not False
                is_b_default = bool(raw_b.get("isDefault")) and b_enabled and not default_binding_claimed
                default_binding_claimed = default_binding_claimed or is_b_default
                binding_types.append({
                    "name": b_name,
                    "price": max(0.0, _safe_float(raw_b.get("price"))),
                    "enabled": b_enabled,
                    "isDefault": is_b_default,
                })

            cover_types = []
            default_cover_claimed = False
            for raw_c in raw_size.get("coverTypes", []):
                if not isinstance(raw_c, dict):
                    continue
                c_name = str(raw_c.get("name") or "").strip()
                if not c_name:
                    continue
                c_enabled = raw_c.get("enabled", True) is not False
                is_c_default = bool(raw_c.get("isDefault")) and c_enabled and not default_cover_claimed
                default_cover_claimed = default_cover_claimed or is_c_default
                cover_types.append({
                    "name": c_name,
                    "price": max(0.0, _safe_float(raw_c.get("price"))),
                    "enabled": c_enabled,
                    "isDefault": is_c_default,
                })

            lamination_types = []
            default_lam_claimed = False
            for raw_l in raw_size.get("laminationTypes", []):
                if not isinstance(raw_l, dict):
                    continue
                l_name = str(raw_l.get("name") or "").strip()
                if not l_name:
                    continue
                l_enabled = raw_l.get("enabled", True) is not False
                is_l_default = bool(raw_l.get("isDefault")) and l_enabled and not default_lam_claimed
                default_lam_claimed = default_lam_claimed or is_l_default
                lamination_types.append({
                    "name": l_name,
                    "price": max(0.0, _safe_float(raw_l.get("price"))),
                    "enabled": l_enabled,
                    "isDefault": is_l_default,
                })

            sizes.append({
                "name": size_name,
                "enabled": size_enabled,
                "isDefault": is_size_default,
                "paperTypes": paper_types,
                "bindingTypes": binding_types,
                "coverTypes": cover_types,
                "laminationTypes": lamination_types,
            })

        if sizes and not default_size_claimed:
            first_enabled = next((s for s in sizes if s["enabled"]), None)
            if first_enabled:
                first_enabled["isDefault"] = True

        return sizes



DEFAULT_PRINT_TYPES = [
    {"name": "Documents Printing", "priceModifier": 0, "enabled": True, "isDefault": True},
    {"name": "Certificate Printing", "priceModifier": 0, "enabled": True, "isDefault": False},
    {"name": "Leaflet / Flyer / Template Printing", "priceModifier": 0, "enabled": True, "isDefault": False},
    {"name": "Letterhead Printing", "priceModifier": 0, "enabled": True, "isDefault": False},
    {"name": "Photo Album Printing", "priceModifier": 0, "enabled": True, "isDefault": False},
    {"name": "Poster Printing", "priceModifier": 0, "enabled": True, "isDefault": False},
    {"name": "Table Calendar Printing", "priceModifier": 0, "enabled": True, "isDefault": False},
    {"name": "Visiting Card Printing", "priceModifier": 0, "enabled": True, "isDefault": False},
    {"name": "Photos Printing", "priceModifier": 0, "enabled": True, "isDefault": False},
    {"name": "Books Printing", "priceModifier": 0, "enabled": True, "isDefault": False},
]
DEFAULT_PAPER_SIZES = [
    {
        "name": "A4",
        "enabled": True,
        "isDefault": True,
        "paperTypes": [
            {
                "name": "75GSM - Normal Paper",
                "enabled": True,
                "isDefault": True,
                "prices": {"bw_single": 1.50, "bw_double": 2.00, "color_single": 5.00, "color_double": 8.00, "premium_single": 6.50, "premium_double": 10.00}
            },
            {
                "name": "100GSM - Bond Paper",
                "enabled": True,
                "isDefault": False,
                "prices": {"bw_single": 2.50, "bw_double": 3.50, "color_single": 7.00, "color_double": 10.00, "premium_single": 8.50, "premium_double": 12.00}
            },
            {
                "name": "130GSM - Art Paper",
                "enabled": True,
                "isDefault": False,
                "prices": {"bw_single": 3.00, "bw_double": 4.50, "color_single": 8.50, "color_double": 12.00, "premium_single": 10.00, "premium_double": 14.50}
            },
            {
                "name": "300GSM - Art Card",
                "enabled": True,
                "isDefault": False,
                "prices": {"bw_single": 5.00, "bw_double": 8.00, "color_single": 12.00, "color_double": 18.00, "premium_single": 14.50, "premium_double": 21.00}
            },
        ],
        "bindingTypes": [
            {"name": "No Binding", "price": 0, "enabled": True, "isDefault": True},
            {"name": "Spiral Binding", "price": 40, "enabled": True, "isDefault": False},
            {"name": "Soft Bind", "price": 30, "enabled": True, "isDefault": False},
            {"name": "Hard Bind", "price": 80, "enabled": True, "isDefault": False},
            {"name": "Staple", "price": 5, "enabled": True, "isDefault": False},
        ],
        "coverTypes": [
            {"name": "No Cover", "price": 0, "enabled": True, "isDefault": True},
            {"name": "Transparent Front Cover", "price": 10, "enabled": True, "isDefault": False},
            {"name": "Front and Back Cover", "price": 20, "enabled": True, "isDefault": False},
        ],
        "laminationTypes": [
            {"name": "Without Lamination", "price": 0, "enabled": True, "isDefault": True},
            {"name": "Matt Lamination", "price": 5, "enabled": True, "isDefault": False},
            {"name": "Glossy Lamination", "price": 5, "enabled": True, "isDefault": False},
        ],
    },
    {
        "name": "A3",
        "enabled": True,
        "isDefault": False,
        "paperTypes": [
            {
                "name": "75GSM - Normal Paper",
                "enabled": True,
                "isDefault": True,
                "prices": {"bw_single": 3.00, "bw_double": 4.00, "color_single": 10.00, "color_double": 16.00, "premium_single": 13.00, "premium_double": 20.00}
            },
            {
                "name": "100GSM - Bond Paper",
                "enabled": True,
                "isDefault": False,
                "prices": {"bw_single": 5.00, "bw_double": 7.00, "color_single": 14.00, "color_double": 20.00, "premium_single": 17.00, "premium_double": 24.00}
            },
            {
                "name": "130GSM - Art Paper",
                "enabled": True,
                "isDefault": False,
                "prices": {"bw_single": 6.00, "bw_double": 9.00, "color_single": 17.00, "color_double": 24.00, "premium_single": 20.00, "premium_double": 29.00}
            },
            {
                "name": "300GSM - Art Card",
                "enabled": True,
                "isDefault": False,
                "prices": {"bw_single": 10.00, "bw_double": 16.00, "color_single": 24.00, "color_double": 36.00, "premium_single": 29.00, "premium_double": 42.00}
            },
        ],
        "bindingTypes": [
            {"name": "No Binding", "price": 0, "enabled": True, "isDefault": True},
            {"name": "Spiral Binding", "price": 60, "enabled": True, "isDefault": False},
            {"name": "Soft Bind", "price": 50, "enabled": True, "isDefault": False},
            {"name": "Hard Bind", "price": 120, "enabled": True, "isDefault": False},
        ],
        "coverTypes": [
            {"name": "No Cover", "price": 0, "enabled": True, "isDefault": True},
            {"name": "Transparent Front Cover", "price": 20, "enabled": True, "isDefault": False},
            {"name": "Front and Back Cover", "price": 40, "enabled": True, "isDefault": False},
        ],
        "laminationTypes": [
            {"name": "Without Lamination", "price": 0, "enabled": True, "isDefault": True},
            {"name": "Matt Lamination", "price": 10, "enabled": True, "isDefault": False},
            {"name": "Glossy Lamination", "price": 10, "enabled": True, "isDefault": False},
        ],
    },
]
DEFAULT_PAPER_TYPES = [
    {"name": "75GSM - Normal Paper", "priceModifier": 0, "enabled": True, "isDefault": True},
    {"name": "100GSM - Bond Paper", "priceModifier": 0, "enabled": True, "isDefault": False},
    {"name": "130GSM - Art Paper", "priceModifier": 0, "enabled": True, "isDefault": False},
    {"name": "300GSM - Art Card", "priceModifier": 0, "enabled": True, "isDefault": False},
    {"name": "300GSM - Bond Paper", "priceModifier": 0, "enabled": True, "isDefault": False},
    {"name": "90GSM - High Quality", "priceModifier": 0, "enabled": True, "isDefault": False},
    {"name": "100GSM - Premium", "priceModifier": 0, "enabled": True, "isDefault": False},
    {"name": "120GSM - Glossy", "priceModifier": 0, "enabled": True, "isDefault": False},
]
DEFAULT_COLOR_TYPES = [
    {"name": "Black and White", "priceModifier": 0, "enabled": True, "isDefault": True},
    {"name": "Smartcolor Standard", "priceModifier": 2.5, "enabled": True, "isDefault": False},
    {"name": "Ultracolor Pro", "priceModifier": 4.5, "enabled": True, "isDefault": False},
]
DEFAULT_SIDE_TYPES = [
    {"name": "Single Side", "priceModifier": 0, "enabled": True, "isDefault": True},
    {"name": "Both Side (Back2Back)", "priceModifier": 0.6, "enabled": True, "isDefault": False},
]
DEFAULT_BINDING_TYPES = [
    {"name": "No Binding", "price": 0, "enabled": True, "isDefault": True},
    {"name": "Spiral Binding", "price": 40, "enabled": True, "isDefault": False},
    {"name": "Soft Bind", "price": 30, "enabled": True, "isDefault": False},
    {"name": "Hard Bind", "price": 80, "enabled": True, "isDefault": False},
    {"name": "Staple", "price": 5, "enabled": True, "isDefault": False},
]
DEFAULT_COVER_TYPES = [
    {"name": "No Cover", "price": 0, "enabled": True, "isDefault": True},
    {"name": "Transparent Front Cover", "price": 10, "enabled": True, "isDefault": False},
    {"name": "Front and Back Cover", "price": 20, "enabled": True, "isDefault": False},
]

FRONTEND_PRODUCT_CATALOG = [
    ("documents", "PDF PRINT"),
    ("documents", "ANNUAL REPORT PRINTING"),
    ("books", "PAPERBACK / SOFTCOVER / SOFTBACK BOOKS"),
    ("books", "E-BOOK PRINTING"),
    ("books", "STUDY MATERIAL/GUIDE PRINTING"),
    ("certificate-cards", "NOTE CARDS"),
    ("certificate-cards", "CERTIFICATE PRINTING"),
    ("certificate-cards", "FLASH CARD PRINTING"),
    ("thesis-dissertation", "Thesis Print"),
    ("black-book-white-book-binding", "Black Book Binding"),
    ("black-book-white-book-binding", "White Book Binding"),
]


CERTIFICATE_COLOR_TYPES = [
    {"name": "Black and White", "priceModifier": 0, "enabled": True, "isDefault": True},
    {"name": "Ultracolor Pro", "priceModifier": 4.5, "enabled": True, "isDefault": False},
]


def default_pricing_payload(category=None, subcategory=None):
    is_cert = category == "certificate-cards" or "certificate" in str(subcategory).lower()
    return {
        "basePrice": 1.5,
        "printTypes": deepcopy(DEFAULT_PRINT_TYPES),
        "paperSizes": deepcopy(DEFAULT_PAPER_SIZES),
        "paperTypes": deepcopy(DEFAULT_PAPER_TYPES),
        "colorTypes": deepcopy(CERTIFICATE_COLOR_TYPES if is_cert else DEFAULT_COLOR_TYPES),
        "sideTypes": deepcopy(DEFAULT_SIDE_TYPES),
        "bindingTypes": deepcopy(DEFAULT_BINDING_TYPES),
        "coverTypes": deepcopy(DEFAULT_COVER_TYPES),
        "quantityDiscounts": [],
    }


def ensure_frontend_product_catalog():
    for category, product_name in FRONTEND_PRODUCT_CATALOG:
        if not Product.objects.filter(category=category, subcategory=product_name).exists():
            Product.objects.create(
                category=category,
                subcategory=product_name,
                name=product_name.title(),
                description=f"Website product configuration for {product_name.title()}.",
                base_price=1.5,
                specifications={},
            )
        if not PricingRule.objects.filter(category=category, subcategory__iexact=product_name).exists():
            PricingRule.objects.create(
                category=category,
                subcategory=product_name,
                rules=default_pricing_payload(category, product_name),
            )


class PricingRuleForm(forms.ModelForm):
    CATEGORY_CHOICES = (
        ("documents", "Documents"),
        ("books", "Books"),
        ("certificate-cards", "Certificate & Cards"),
        ("thesis-dissertation", "Thesis & Dissertation"),
        ("black-book-white-book-binding", "Black Book & White Book Binding"),
        ("business-cards", "Business Cards"),
        ("marketing", "Marketing"),
        ("posters", "Posters"),
        ("stationery", "Stationery"),
        ("custom", "Custom"),
    )
    category = forms.ChoiceField(choices=CATEGORY_CHOICES)
    subcategory = forms.ChoiceField(
        choices=(),
        help_text="Products are loaded from Website Products. Add a product there first to make it available here.",
    )
    base_price = forms.DecimalField(label="Base price", min_value=0, decimal_places=2, max_digits=10)
    print_types = PricingOptionsField(label="Category", required=False)
    paper_sizes = HierarchicalPricingField(label="Paper sizes, types and print prices", required=False)
    binding_types = PricingOptionsField(label="Binding options", price_label="Price per copy", price_key="price", required=False)
    cover_types = PricingOptionsField(label="Cover options", price_label="Price per copy", price_key="price", required=False)

    discount_1_qty = forms.IntegerField(label="Discount tier 1 from qty", required=False, min_value=1)
    discount_1_percent = forms.DecimalField(label="Discount tier 1 percent", required=False, min_value=0, decimal_places=2, max_digits=6)
    discount_2_qty = forms.IntegerField(label="Discount tier 2 from qty", required=False, min_value=1)
    discount_2_percent = forms.DecimalField(label="Discount tier 2 percent", required=False, min_value=0, decimal_places=2, max_digits=6)
    discount_3_qty = forms.IntegerField(label="Discount tier 3 from qty", required=False, min_value=1)
    discount_3_percent = forms.DecimalField(label="Discount tier 3 percent", required=False, min_value=0, decimal_places=2, max_digits=6)
    discount_4_qty = forms.IntegerField(label="Discount tier 4 from qty", required=False, min_value=1)
    discount_4_percent = forms.DecimalField(label="Discount tier 4 percent", required=False, min_value=0, decimal_places=2, max_digits=6)

    class Meta:
        model = PricingRule
        fields = ("category", "subcategory", "base_price")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        category_labels = dict(self.CATEGORY_CHOICES)
        grouped_products = {}
        try:
            product_rows = list(
                Product.objects.order_by("category", "subcategory")
                .values_list("category", "subcategory")
                .distinct()
            )
        except Exception:
            product_rows = FRONTEND_PRODUCT_CATALOG

        for category, subcategory in product_rows or FRONTEND_PRODUCT_CATALOG:
            if not subcategory:
                continue
            grouped_products.setdefault(category, [])
            if subcategory not in grouped_products[category]:
                grouped_products[category].append(subcategory)

        current_subcategory = str(getattr(self.instance, "subcategory", "") or "").strip()
        current_category = str(getattr(self.instance, "category", "custom") or "custom")
        if current_subcategory and current_subcategory not in grouped_products.setdefault(current_category, []):
            grouped_products[current_category].append(current_subcategory)

        self.fields["subcategory"].choices = [
            (
                category_labels.get(category, category.replace("-", " ").title()),
                [(subcategory, subcategory) for subcategory in subcategories],
            )
            for category, subcategories in grouped_products.items()
        ]
        rules = self.instance.rules or {}
        self.fields["base_price"].initial = rules.get("basePrice", 0)
        option_defaults = {
            "print_types": ("printTypes", DEFAULT_PRINT_TYPES),
            "paper_sizes": ("paperSizes", DEFAULT_PAPER_SIZES),
            "binding_types": ("bindingTypes", DEFAULT_BINDING_TYPES),
            "cover_types": ("coverTypes", DEFAULT_COVER_TYPES),
        }
        for field_name, (rule_key, defaults) in option_defaults.items():
            self.fields[field_name].initial = rules.get(rule_key) or defaults
        for idx, discount in enumerate(rules.get("quantityDiscounts", [])[:4], start=1):
            self.fields[f"discount_{idx}_qty"].initial = discount.get("minQty", "")
            self.fields[f"discount_{idx}_percent"].initial = discount.get("discount", 0)

    def save(self, commit=True):
        obj = super().save(commit=False)
        quantity_discounts = []
        for idx in range(1, 5):
            discount_qty = self.cleaned_data.get(f"discount_{idx}_qty")
            if discount_qty:
                quantity_discounts.append({
                    "minQty": int(discount_qty),
                    "discount": float(self.cleaned_data.get(f"discount_{idx}_percent") or 0),
                })
        rules = dict(obj.rules or {})
        rules.update({
            "basePrice": float(self.cleaned_data["base_price"]),
            "printTypes": self.cleaned_data.get("print_types", []),
            "paperSizes": self.cleaned_data.get("paper_sizes", []),
            "bindingTypes": self.cleaned_data.get("binding_types", []),
            "coverTypes": self.cleaned_data.get("cover_types", []),
            "quantityDiscounts": quantity_discounts,
        })
        obj.rules = rules
        if commit:
            obj.save()
        return obj


DEFAULT_HERO_SLIDES = [
    {
        "id": 0,
        "imageUrl": "/assets/premium-printing-impact-C6AlLGXi.png",
        "title": "Premium Printing That Makes An Impact",
        "subtitle": "Use code EARLY15 and get 15% off between the 1st and 10th of every month.",
    },
    {
        "id": 1,
        "imageUrl": "/assets/delhi-pickup-DYkMOipV.jpg",
        "title": "Pickup Now Available Exclusively For Delhi NCR",
        "subtitle": "Skip the shipping - order online and pick up from our store.",
    },
    {
        "id": 2,
        "imageUrl": "/assets/coupon-discount-banner-DAWIvJWg.png",
        "title": "First Order And Next Order Discounts",
        "subtitle": "Use FIRST31 for 31% off your first order, plus DEAL25 for your next order.",
    },
    {
        "id": 3,
        "imageUrl": "/assets/exclusive-coupon-banner-B1_0fU_v.png",
        "title": "Exclusive Offer First And Next Order Discounts",
        "subtitle": "Use FIRST31 for 31% off with free shipping, and DEAL25 for your next order.",
    },
]


class ContentPageForm(forms.ModelForm):
    hero_title = forms.CharField(label="Hero title", required=False)
    hero_subtitle = forms.CharField(label="Hero subtitle", required=False, widget=ComfortableTextarea)
    hero_image = forms.CharField(label="Hero poster image URL", required=False)
    hero_button_text = forms.CharField(label="Button text", required=False)
    hero_button_link = forms.CharField(label="Button link", required=False)

    slide_1_image = forms.CharField(label="Banner 1 image URL", required=False)
    slide_1_delete = forms.BooleanField(label="Remove custom Banner 1 image", required=False)
    slide_1_title = forms.CharField(label="Banner 1 title", required=False)
    slide_1_subtitle = forms.CharField(label="Banner 1 subtitle", required=False, widget=ComfortableTextarea)
    slide_2_image = forms.CharField(label="Banner 2 image URL", required=False)
    slide_2_delete = forms.BooleanField(label="Remove custom Banner 2 image", required=False)
    slide_2_title = forms.CharField(label="Banner 2 title", required=False)
    slide_2_subtitle = forms.CharField(label="Banner 2 subtitle", required=False, widget=ComfortableTextarea)
    slide_3_image = forms.CharField(label="Banner 3 image URL", required=False)
    slide_3_delete = forms.BooleanField(label="Remove custom Banner 3 image", required=False)
    slide_3_title = forms.CharField(label="Banner 3 title", required=False)
    slide_3_subtitle = forms.CharField(label="Banner 3 subtitle", required=False, widget=ComfortableTextarea)
    slide_4_image = forms.CharField(label="Banner 4 image URL", required=False)
    slide_4_delete = forms.BooleanField(label="Remove custom Banner 4 image", required=False)
    slide_4_title = forms.CharField(label="Banner 4 title", required=False)
    slide_4_subtitle = forms.CharField(label="Banner 4 subtitle", required=False, widget=ComfortableTextarea)

    class Meta:
        model = ContentPage
        fields = ("page_type", "title", "content")
        widgets = {"content": LargeJSONTextarea}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        content = self._parsed_content()
        if self.instance and self.instance.page_type == "hero" and isinstance(content, dict):
            self.fields["hero_title"].initial = content.get("title", "")
            self.fields["hero_subtitle"].initial = content.get("subtitle", "")
            self.fields["hero_image"].initial = content.get("backgroundImage", "") or self._first_banner_image()
            self.fields["hero_button_text"].initial = content.get("ctaText", "")
            self.fields["hero_button_link"].initial = content.get("ctaLink", "")
        if self.instance and self.instance.page_type == "hero_slides":
            slides = content if isinstance(content, list) else []
            for idx in range(1, 5):
                default = DEFAULT_HERO_SLIDES[idx - 1]
                slide = slides[idx - 1] if len(slides) >= idx and isinstance(slides[idx - 1], dict) else {}
                self.fields[f"slide_{idx}_image"].initial = slide.get("imageUrl") or default["imageUrl"]
                self.fields[f"slide_{idx}_title"].initial = slide.get("title") or default["title"]
                self.fields[f"slide_{idx}_subtitle"].initial = slide.get("subtitle") or default["subtitle"]

    def _parsed_content(self):
        import json
        if isinstance(self.instance.content, (dict, list)):
            return self.instance.content
        try:
            return json.loads(self.instance.content or "{}")
        except Exception:
            return {}

    def save(self, commit=True):
        import json
        obj = super().save(commit=False)
        sync_first_banner_image = None
        if obj.page_type == "hero":
            existing = self._parsed_content() if isinstance(self._parsed_content(), dict) else {}
            hero_image = self.cleaned_data.get("hero_image", "")
            existing.update({
                "title": self.cleaned_data.get("hero_title") or existing.get("title", ""),
                "subtitle": self.cleaned_data.get("hero_subtitle") or existing.get("subtitle", ""),
                "backgroundImage": hero_image,
                "ctaText": self.cleaned_data.get("hero_button_text") or existing.get("ctaText", ""),
                "ctaLink": self.cleaned_data.get("hero_button_link") or existing.get("ctaLink", ""),
            })
            obj.content = json.dumps(existing)
            sync_first_banner_image = hero_image
        elif obj.page_type == "hero_slides":
            existing = self._parsed_content()
            if not isinstance(existing, list):
                existing = []
            slides = []
            for idx in range(1, 5):
                default = DEFAULT_HERO_SLIDES[idx - 1]
                base = existing[idx - 1] if len(existing) >= idx and isinstance(existing[idx - 1], dict) else {"id": idx - 1}
                image = self.cleaned_data.get(f"slide_{idx}_image")
                title = self.cleaned_data.get(f"slide_{idx}_title")
                subtitle = self.cleaned_data.get(f"slide_{idx}_subtitle")
                if self.cleaned_data.get(f"slide_{idx}_delete"):
                    image = ""
                if image or title or subtitle or base:
                    base.update({
                        "id": base.get("id", idx - 1),
                        "imageUrl": image if image != default["imageUrl"] else "",
                        "title": title or base.get("title", "") or default["title"],
                        "subtitle": subtitle or base.get("subtitle", "") or default["subtitle"],
                        "badge": base.get("badge", ""),
                        "ctaLabel": base.get("ctaLabel", ""),
                        "ctaLink": base.get("ctaLink", "/#/all-products"),
                        "secondaryLabel": base.get("secondaryLabel", ""),
                        "secondaryLink": base.get("secondaryLink", "/#/all-products"),
                        "tagText": base.get("tagText", ""),
                    })
                    slides.append(base)
            obj.content = json.dumps(slides)
        if commit:
            obj.save()
            if obj.page_type == "hero" and sync_first_banner_image is not None:
                self._sync_first_banner_image(sync_first_banner_image)
        return obj

    def _first_banner_image(self):
        slides_page = ContentPage.objects.filter(page_type="hero_slides").first()
        if not slides_page:
            return ""
        import json
        content = slides_page.content
        if not isinstance(content, list):
            try:
                content = json.loads(content or "[]")
            except Exception:
                content = []
        if content and isinstance(content[0], dict):
            return content[0].get("imageUrl") or DEFAULT_HERO_SLIDES[0]["imageUrl"]
        return DEFAULT_HERO_SLIDES[0]["imageUrl"]

    def _sync_first_banner_image(self, image_url):
        import json
        slides_page = ContentPage.objects.filter(page_type="hero_slides").first()
        if not slides_page:
            slides_page = ContentPage(page_type="hero_slides", title="Homepage Banner Slides", content="[]")
        content = slides_page.content
        if not isinstance(content, list):
            try:
                content = json.loads(content or "[]")
            except Exception:
                content = []
        while len(content) < 4:
            content.append({"id": len(content), "imageUrl": "", "title": "", "subtitle": ""})
        if not isinstance(content[0], dict):
            content[0] = {"id": 0}
        content[0]["imageUrl"] = image_url
        slides_page.content = json.dumps(content)
        slides_page.save(update_fields=["content", "updated_at"])


class FileItemInline(admin.TabularInline):
    model = FileItem
    extra = 0
    fields = ("file_name", "total_pages", "start_page", "end_page", "copies", "upload", "remote_url", "download_link")
    readonly_fields = ("download_link",)

    @admin.display(description="Download")
    def download_link(self, obj):
        if obj:
            url = obj.remote_url or (obj.upload.url if obj.upload else "")
            if url:
                return format_html('<a href="{}" target="_blank" rel="noopener">Open PDF</a>', url)
        return "-"


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    fields = ("phonepe_order_id", "amount", "status", "created_at")
    readonly_fields = ("created_at",)


class ShiprocketShipmentInline(admin.StackedInline):
    model = ShiprocketShipment
    extra = 0
    fields = (
        "shipment_id",
        "awb_code",
        "courier_name",
        "status",
        "tracking_url",
        "label_url",
        "manifest_url",
        "updated_at",
    )
    readonly_fields = ("updated_at",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number",
        "name",
        "phone",
        "subtotal",
        "total_pages",
        "status_badge",
        "tracking_number",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("order_number", "name", "email", "phone", "tracking_number")
    readonly_fields = ("created_at",)
    inlines = (FileItemInline, PaymentInline, ShiprocketShipmentInline)

    @admin.display(description="Status")
    def status_badge(self, obj):
        color = "#16a34a" if obj.status in ("paid", "completed", "shipped") else "#9333ea"
        return format_html('<span class="status-pill" style="--pill-color:{}">{}</span>', color, obj.status)


@admin.register(FileItem)
class FileItemAdmin(admin.ModelAdmin):
    list_display = ("file_name", "order", "total_pages", "start_page", "end_page", "copies", "storage_status", "download_link")
    list_filter = ("copies",)
    search_fields = ("file_name", "order__order_number")
    readonly_fields = ("download_link",)

    @admin.display(description="Storage")
    def storage_status(self, obj):
        if obj.remote_url:
            return "Supabase"
        if obj.upload:
            return "Local media"
        return "-"

    @admin.display(description="Download")
    def download_link(self, obj):
        url = obj.remote_url or (obj.upload.url if obj.upload else "")
        if url:
            return format_html('<a href="{}" target="_blank" rel="noopener">Open PDF</a>', url)
        return "-"


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("order_number", "phonepe_order_id", "amount_rupees", "status_badge", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("phonepe_order_id", "order__order_number")
    readonly_fields = ("created_at",)

    @admin.display(description="Order")
    def order_number(self, obj):
        return obj.order.order_number

    @admin.display(description="Amount")
    def amount_rupees(self, obj):
        return f"Rs {obj.amount / 100:.2f}"

    @admin.display(description="Status")
    def status_badge(self, obj):
        normalized = (obj.status or "").lower()
        color = "#16a34a" if normalized == "completed" else "#dc2626" if normalized == "failed" else "#9333ea"
        return format_html('<span class="status-pill" style="--pill-color:{}">{}</span>', color, obj.status)


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    class form(forms.ModelForm):
        CHECKOUT_SETTING_CHOICES = (
            ("checkout_packaging_charge", "Checkout packaging charge"),
            ("checkout_shipping_charge", "Checkout shipping charge"),
            ("checkout_free_shipping_threshold", "Free shipping threshold"),
            ("site_logo", "Site logo URL"),
        )
        key = forms.ChoiceField(
            choices=CHECKOUT_SETTING_CHOICES,
            help_text="Use checkout packaging/shipping keys to control charges shown in checkout.",
        )
        value = forms.CharField(
            required=False,
            widget=forms.Textarea(attrs={"rows": 3}),
            help_text="For checkout charges, enter only a number in rupees, for example 50 or 0.",
        )

        class Meta:
            model = SiteSetting
            fields = "__all__"

    list_display = ("key", "value", "updated_at")
    list_editable = ("value",)
    search_fields = ("key", "value")
    readonly_fields = ("updated_at",)
    fieldsets = (
        ("Setting", {"fields": ("key", "value")}),
        ("System", {"fields": ("updated_at",), "classes": ("collapse",)}),
    )

    def changelist_view(self, request, extra_context=None):
        defaults = {
            "checkout_packaging_charge": "0",
            "checkout_shipping_charge": "0",
            "checkout_free_shipping_threshold": "500",
        }
        for key, value in defaults.items():
            SiteSetting.objects.get_or_create(key=key, defaults={"value": value})
        return super().changelist_view(request, extra_context=extra_context)

    @admin.display(description="Value")
    def value_preview(self, obj):
        value = obj.value or ""
        return value[:90] + ("..." if len(value) > 90 else "")


class SecretAdminForm(forms.ModelForm):
    secret_fields = ()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name in self.secret_fields:
            if field_name in self.fields:
                self.fields[field_name].widget = forms.PasswordInput(render_value=True)


class ShiprocketSettingsForm(SecretAdminForm):
    secret_fields = ("password", "webhook_secret")

    class Meta:
        model = ShiprocketSettings
        fields = "__all__"


@admin.register(ShiprocketSettings)
class ShiprocketSettingsAdmin(admin.ModelAdmin):
    form = ShiprocketSettingsForm
    list_display = ("company_name", "enabled", "email", "pickup_location", "city", "pincode", "updated_at")
    list_filter = ("enabled", "city", "state")
    readonly_fields = ("updated_at",)
    fieldsets = (
        ("Connection", {"fields": ("enabled", "email", "password", "webhook_secret")}),
        ("Pickup address", {"fields": ("company_name", "phone", "pickup_location", "address", "address2", "city", "state", "pincode", "country")}),
        ("Default parcel", {"fields": ("default_weight", "default_length", "default_breadth", "default_height")}),
        ("System", {"fields": ("updated_at",)}),
    )


@admin.register(ShiprocketShipment)
class ShiprocketShipmentAdmin(admin.ModelAdmin):
    list_display = ("order", "shipment_id", "awb_code", "courier_name", "status", "updated_at")
    list_filter = ("status", "courier_name", "created_at")
    search_fields = ("order__order_number", "shipment_id", "awb_code", "courier_name")
    readonly_fields = ("created_at", "updated_at", "raw_response")


@admin.register(ShiprocketLog)
class ShiprocketLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "event_type", "order_number", "awb_code")
    list_filter = ("event_type", "created_at")
    search_fields = ("event_type", "order_number", "awb_code")
    readonly_fields = ("created_at", "details")


@admin.register(ShiprocketToken)
class ShiprocketTokenAdmin(admin.ModelAdmin):
    list_display = ("expires_at",)
    readonly_fields = ("token", "expires_at")


@admin.register(PublicOrder)
class PublicOrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number",
        "total_amount",
        "payment_transaction",
        "transaction_status",
        "status",
        "payment_method",
        "tracking_number",
        "created_at",
    )
    list_filter = ("status", "payment_status", "payment_method", "created_at")
    search_fields = ("order_number", "tracking_number")
    readonly_fields = ("created_at", "updated_at", "payment_summary")
    actions = ("mark_processing", "mark_shipped", "mark_completed")
    formfield_overrides = {
        django_models.JSONField: {"widget": LargeJSONTextarea},
    }
    fieldsets = (
        ("Order", {"fields": ("order_number", "user_id", "items", "total_amount", "status")}),
        ("Payment", {"fields": ("payment_method", "payment_status", "payment_summary")}),
        ("Delivery", {"fields": ("shipping_address", "tracking_number", "tracking_url", "estimated_delivery")}),
        ("System", {"fields": ("created_at", "updated_at")}),
    )

    def _payment(self, obj):
        return (
            Payment.objects.select_related("order")
            .filter(order__order_number=obj.order_number)
            .order_by("-created_at")
            .first()
        )

    @admin.display(description="PhonePe transaction")
    def payment_transaction(self, obj):
        payment = self._payment(obj)
        if not payment:
            return format_html('<span class="status-pill" style="--pill-color:#dc2626">Missing</span>')
        return payment.phonepe_order_id or "-"

    @admin.display(description="Transaction status")
    def transaction_status(self, obj):
        payment = self._payment(obj)
        if not payment:
            return "-"
        normalized = (payment.status or "").lower()
        color = "#16a34a" if normalized == "completed" else "#dc2626" if normalized == "failed" else "#9333ea"
        amount = f"Rs {payment.amount / 100:.2f}"
        return format_html('<span class="status-pill" style="--pill-color:{}">{} - {}</span>', color, payment.status, amount)

    @admin.display(description="Matched payment transaction")
    def payment_summary(self, obj):
        payment = self._payment(obj)
        if not payment:
            return "No backend payment transaction found for this website order."
        return format_html(
            "<strong>{}</strong><br>Status: {}<br>Amount: {}<br>Created: {}",
            payment.phonepe_order_id or "-",
            payment.status,
            f"Rs {payment.amount / 100:.2f}",
            payment.created_at,
        )

    @admin.action(description="Set selected orders to processing")
    def mark_processing(self, request, queryset):
        queryset.update(status="processing")

    @admin.action(description="Set selected orders to shipped")
    def mark_shipped(self, request, queryset):
        queryset.update(status="shipped")

    @admin.action(description="Set selected orders to completed")
    def mark_completed(self, request, queryset):
        queryset.update(status="completed")


@admin.register(PricingRule)
class PricingRuleAdmin(admin.ModelAdmin):
    form = PricingRuleForm
    list_display = ("category", "subcategory", "base_price_display", "updated_at")
    list_filter = ("category",)
    search_fields = ("category", "subcategory")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Where this price applies", {"fields": ("category", "subcategory")}),
        ("Base price per printed page", {
            "fields": ("base_price",),
            "description": "This is the starting price for one page before option adjustments.",
        }),
        ("Customer checkout options", {
            "fields": (
                "print_types",
                "paper_sizes",
                "binding_types",
                "cover_types",
            ),
            "description": "These rows directly control the checkout dropdowns. Add, remove, disable, reorder, price, or choose the default option.",
        }),
        ("Quantity discount tiers", {
            "fields": (
                ("discount_1_qty", "discount_1_percent"),
                ("discount_2_qty", "discount_2_percent"),
                ("discount_3_qty", "discount_3_percent"),
                ("discount_4_qty", "discount_4_percent"),
            ),
            "description": "Example: from quantity 100, discount 10 means 10 percent off.",
        }),
        ("System", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )




    @admin.display(description="Base price")
    def base_price_display(self, obj):
        return f"Rs {float((obj.rules or {}).get('basePrice', 0) or 0):.2f}"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "subcategory", "base_price", "image_link", "updated_at")
    list_filter = ("category", "subcategory")
    search_fields = ("name", "category", "subcategory", "description")
    readonly_fields = ("created_at", "updated_at")
    formfield_overrides = {
        django_models.JSONField: {"widget": LargeJSONTextarea},
        django_models.TextField: {"widget": ComfortableTextarea},
    }
    fieldsets = (
        ("Product details", {"fields": ("name", "category", "subcategory", "description", "base_price")}),
        ("Website poster/image", {
            "fields": ("image_url",),
            "description": "Use this for product poster or display image URL shown on the website.",
        }),
        ("Specifications", {"fields": ("specifications",)}),
        ("System", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )




    @admin.display(description="Image")
    def image_link(self, obj):
        if not obj.image_url:
            return "-"
        return format_html('<a href="{}" target="_blank" rel="noopener">Open</a>', obj.image_url)


@admin.register(ContentPage)
class ContentPageAdmin(admin.ModelAdmin):
    form = ContentPageForm
    list_display = ("page_type", "title", "updated_at")
    list_filter = ("page_type",)
    search_fields = ("page_type", "title", "content")
    readonly_fields = (
        "created_at",
        "updated_at",
        "slide_1_preview",
        "slide_2_preview",
        "slide_3_preview",
        "slide_4_preview",
    )

    def changelist_view(self, request, extra_context=None):
        import json
        ContentPage.objects.get_or_create(
            page_type="hero_slides",
            defaults={"title": "Homepage Banner Slides", "content": json.dumps(DEFAULT_HERO_SLIDES)},
        )
        ContentPage.objects.get_or_create(
            page_type="hero",
            defaults={
                "title": "Hero Section",
                "content": json.dumps({
                    "title": DEFAULT_HERO_SLIDES[0]["title"],
                    "subtitle": DEFAULT_HERO_SLIDES[0]["subtitle"],
                    "backgroundImage": DEFAULT_HERO_SLIDES[0]["imageUrl"],
                    "ctaText": "Start Your Order",
                    "ctaLink": "/#/all-products",
                }),
            },
        )
        return super().changelist_view(request, extra_context=extra_context)

    def get_fieldsets(self, request, obj=None):
        base = [("Website section", {"fields": ("page_type", "title")})]
        if obj and obj.page_type == "hero":
            base.append(("Homepage hero text", {
                "fields": ("hero_title", "hero_subtitle", "hero_image", "hero_button_text", "hero_button_link"),
                "description": "These fields update the first homepage hero slide text, button, and poster image.",
            }))
        elif obj and obj.page_type == "hero_slides":
            base.append(("Homepage banner images", {
                "fields": (
                    "slide_1_preview",
                    ("slide_1_image", "slide_1_delete"),
                    "slide_1_title",
                    "slide_1_subtitle",
                    "slide_2_preview",
                    ("slide_2_image", "slide_2_delete"),
                    "slide_2_title",
                    "slide_2_subtitle",
                    "slide_3_preview",
                    ("slide_3_image", "slide_3_delete"),
                    "slide_3_title",
                    "slide_3_subtitle",
                    "slide_4_preview",
                    ("slide_4_image", "slide_4_delete"),
                    "slide_4_title",
                    "slide_4_subtitle",
                ),
                "description": "Default homepage banner images are shown below. Paste a new image URL to replace one, or tick remove custom image to return to the default.",
            }))
        else:
            base.append(("Editable content", {
                "fields": ("content",),
                "description": "Advanced content stored as JSON. Use Hero & Banner rows for simple website banner edits.",
            }))
        base.append(("System", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}))
        return base

    def _slide_data(self, obj, index):
        import json
        content = []
        if obj and obj.content:
            if isinstance(obj.content, list):
                content = obj.content
            else:
                try:
                    content = json.loads(obj.content or "[]")
                except Exception:
                    content = []
        slide = content[index] if len(content) > index and isinstance(content[index], dict) else {}
        default = DEFAULT_HERO_SLIDES[index]
        return {
            "imageUrl": slide.get("imageUrl") or default["imageUrl"],
            "title": slide.get("title") or default["title"],
        }

    def _slide_preview(self, obj, index):
        slide = self._slide_data(obj, index)
        image = slide["imageUrl"]
        title = slide["title"]
        return format_html(
            '<div style="display:flex;align-items:center;gap:16px">'
            '<img src="{}" alt="{}" style="width:220px;max-width:100%;height:74px;object-fit:cover;border-radius:10px;border:1px solid #d8dee9;background:#f8fafc" />'
            '<div><strong>{}</strong><br><a href="{}" target="_blank" rel="noopener">Open image</a></div>'
            '</div>',
            image,
            title,
            title,
            image,
        )

    @admin.display(description="Banner 1 current image")
    def slide_1_preview(self, obj):
        return self._slide_preview(obj, 0)

    @admin.display(description="Banner 2 current image")
    def slide_2_preview(self, obj):
        return self._slide_preview(obj, 1)

    @admin.display(description="Banner 3 current image")
    def slide_3_preview(self, obj):
        return self._slide_preview(obj, 2)

    @admin.display(description="Banner 4 current image")
    def slide_4_preview(self, obj):
        return self._slide_preview(obj, 3)


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ("question", "category", "order_index", "updated_at")
    list_filter = ("category",)
    search_fields = ("question", "answer", "category")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("order_index", "question")
    formfield_overrides = {
        django_models.TextField: {"widget": ComfortableTextarea},
    }


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("user_name", "rating", "status", "user_email", "created_at")
    list_filter = ("status", "rating", "created_at")
    search_fields = ("user_name", "user_email", "review_text")
    readonly_fields = ("created_at", "updated_at")
    actions = ("approve_reviews", "reject_reviews")
    formfield_overrides = {
        django_models.TextField: {"widget": ComfortableTextarea},
    }

    @admin.action(description="Approve selected reviews")
    def approve_reviews(self, request, queryset):
        queryset.update(status="approved")

    @admin.action(description="Reject selected reviews")
    def reject_reviews(self, request, queryset):
        queryset.update(status="rejected")


@admin.register(SEOSetting)
class SEOSettingAdmin(admin.ModelAdmin):
    list_display = ("page_path", "title", "updated_at")
    search_fields = ("page_path", "title", "description", "keywords")
    readonly_fields = ("created_at", "updated_at")
    formfield_overrides = {
        django_models.TextField: {"widget": ComfortableTextarea},
    }
    fieldsets = (
        ("Page", {"fields": ("page_path", "title")}),
        ("Search preview", {"fields": ("description", "keywords", "og_image")}),
        ("System", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )


class PaymentGatewaySettingForm(SecretAdminForm):
    secret_fields = ("razorpay_key_secret", "phonepe_salt_key")

    class Meta:
        model = PaymentGatewaySetting
        fields = "__all__"


@admin.register(PaymentGatewaySetting)
class PaymentGatewaySettingAdmin(admin.ModelAdmin):
    form = PaymentGatewaySettingForm
    list_display = ("id", "phonepe_enabled", "razorpay_enabled", "cod_enabled", "updated_at")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("PhonePe", {"fields": ("phonepe_enabled", "phonepe_merchant_id", "phonepe_salt_key", "phonepe_salt_index")}),
        ("Razorpay", {"fields": ("razorpay_enabled", "razorpay_key_id", "razorpay_key_secret")}),
        ("Other", {"fields": ("cod_enabled",)}),
        ("System", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(SupabaseUser)
class SupabaseUserAdmin(admin.ModelAdmin):
    list_display = ("email", "name", "phone", "role", "email_verified", "created_at")
    list_filter = ("role", "email_verified", "created_at")
    search_fields = ("email", "name", "phone")
    readonly_fields = ("created_at", "updated_at")


@admin.register(AdminAuditLog)
class AdminAuditLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "admin_email", "action")
    list_filter = ("action", "created_at")
    search_fields = ("admin_email", "admin_name", "action")
    readonly_fields = ("admin_id", "admin_email", "admin_name", "action", "details", "created_at")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
