from decimal import Decimal, ROUND_HALF_UP
import json

from django.db import connection

from .models import SiteSetting


PRICE_PER_PAGE_BW = Decimal("1.50")
PRICE_PER_PAGE_COLOR_MULTIPLIER = Decimal("5")
PACKAGING_CHARGE = Decimal("0")
FREE_SHIPPING_THRESHOLD = Decimal("500")
SHIPPING_CHARGE = Decimal("0")
PACKAGING_SETTING_KEY = "checkout_packaging_charge"
SHIPPING_SETTING_KEY = "checkout_shipping_charge"
FREE_SHIPPING_SETTING_KEY = "checkout_free_shipping_threshold"

BINDING_PRICES = {
    "No Binding": Decimal("0"),
    "Spiral Binding": Decimal("40"),
    "Soft Bind": Decimal("30"),
    "Hard Bind": Decimal("80"),
    "Staple": Decimal("5"),
}

COLOR_ADDONS = {
    "bw": Decimal("0"),
    "black and white": Decimal("0"),
    "color-standard": Decimal("2.50"),
    "smartcolor standard": Decimal("2.50"),
    "color-premium": Decimal("4.50"),
    "ultracolor pro": Decimal("4.50"),
    "color": Decimal("4.50"),
}

SIDES_ADDONS = {
    "single": Decimal("0"),
    "single side": Decimal("0"),
    "duplex": Decimal("0.60"),
    "both side (back2back)": Decimal("0.60"),
}

FALLBACK_QUANTITY_DISCOUNTS = [
    {"minQty": 500, "discount": Decimal("12")},
    {"minQty": 200, "discount": Decimal("8")},
    {"minQty": 100, "discount": Decimal("5")},
    {"minQty": 50, "discount": Decimal("3")},
]

COUPONS = {
    "FIRST31": {"discount": Decimal("31"), "type": "percent", "max": Decimal("310")},
    "DEAL25": {"discount": Decimal("25"), "type": "percent", "max": Decimal("250")},
}


def _money(value):
    return Decimal(value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _int_from(value, default=0, minimum=0, maximum=100000):
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        parsed = default
    return max(minimum, min(maximum, parsed))


def _decimal_from(value, default="0"):
    try:
        parsed = Decimal(str(value))
    except Exception:
        parsed = Decimal(default)
    return max(Decimal("0"), parsed)


def _setting_decimal(key, default):
    return _money(_decimal_from(SiteSetting.get(key, str(default)), default))


def get_checkout_charge_settings():
    return {
        "packagingCharge": _setting_decimal(PACKAGING_SETTING_KEY, PACKAGING_CHARGE),
        "shippingCharge": _setting_decimal(SHIPPING_SETTING_KEY, SHIPPING_CHARGE),
        "freeShippingThreshold": _setting_decimal(FREE_SHIPPING_SETTING_KEY, FREE_SHIPPING_THRESHOLD),
    }


def _norm(value):
    return str(value or "").strip().lower()


def _slugish(value):
    return _norm(value).replace("&", "and").replace("/", " ").replace("-", " ")


def _load_pricing_rules():
    try:
        with connection.cursor() as cursor:
            cursor.execute("select category, subcategory, rules from public.pricing_rules")
            rows = cursor.fetchall()
    except Exception as exc:
        print(f"Pricing rules unavailable, using fallback pricing: {exc}")
        return []

    rules = []
    for category, subcategory, rule_data in rows:
        if isinstance(rule_data, str):
            try:
                rule_data = json.loads(rule_data)
            except json.JSONDecodeError:
                rule_data = {}
        rules.append({
            "category": category,
            "subcategory": subcategory,
            **(rule_data or {}),
        })
    return rules


def _find_pricing_rule(rules, category, subcategory=None, product_name=None):
    category_key = _norm(category)
    subcategory_candidates = [_slugish(subcategory), _slugish(product_name)]

    category_rules = [rule for rule in rules if _norm(rule.get("category")) == category_key]
    for candidate in [value for value in subcategory_candidates if value]:
        for rule in category_rules:
            rule_subcategory = _slugish(rule.get("subcategory"))
            if candidate == rule_subcategory or candidate in rule_subcategory or rule_subcategory in candidate:
                return rule

    if category_rules:
        return category_rules[0]

    document_rules = [rule for rule in rules if _norm(rule.get("category")) == "documents"]
    return document_rules[0] if document_rules else None


def _matching_named_rule(rules, selected):
    available_rules = [rule for rule in (rules or []) if rule.get("enabled", True) is not False]
    selected_key = _norm(selected)
    if selected_key:
        for rule in available_rules:
            name = _norm(rule.get("name"))
            if name and (selected_key == name or selected_key in name or name in selected_key):
                return rule
    return next((rule for rule in available_rules if rule.get("isDefault")), None) or (available_rules[0] if available_rules else None)


def _option_price(rule, key, selected, price_key="priceModifier", fallback=None):
    options = rule.get(key, []) if rule else []
    option = _matching_named_rule(options, selected)
    if option:
        return _decimal_from(option.get(price_key, 0))
    return _decimal_from((fallback or {}).get(_norm(selected), 0))


def _best_quantity_discount(discounts, copies):
    normalized = []
    for discount in discounts or []:
        min_qty = _int_from(discount.get("minQty"), default=0, minimum=0)
        percent = _decimal_from(discount.get("discount", 0))
        if min_qty > 0 and percent > 0:
            normalized.append({"minQty": min_qty, "discount": percent})

    if not normalized:
        normalized = FALLBACK_QUANTITY_DISCOUNTS

    applicable = [discount for discount in normalized if copies >= discount["minQty"]]
    applicable.sort(key=lambda discount: discount["minQty"], reverse=True)
    return applicable[0] if applicable else None


def _file_line_pricing(item, pricing_rules):
    pages = _int_from(item.get("pages", item.get("endPage", item.get("totalPages", 1))), default=1, minimum=1)
    copies = _int_from(item.get("copies", 1), default=1, minimum=1)
    category = item.get("categorySlug") or "documents"
    subcategory = item.get("subcategoryName") or item.get("subcategorySlug")
    product_name = item.get("productName")
    print_type = item.get("printType", "")
    paper = item.get("paper", "")
    size = item.get("size", "")
    color = _norm(item.get("color", "bw"))
    sides = _norm(item.get("sides", "single"))
    binding = str(item.get("binding", "No Binding")).strip() or "No Binding"
    cover = str(item.get("cover", "No Cover")).strip() or "No Cover"

    rule = _find_pricing_rule(pricing_rules, category, subcategory, product_name)
    per_page = None
    size_rule = None

    if rule:
        # Hierarchical lookup check
        paper_sizes = rule.get("paperSizes", [])
        size_rule = _matching_named_rule(paper_sizes, size)
        if size_rule and isinstance(size_rule, dict) and "paperTypes" in size_rule:
            nested_paper_types = size_rule.get("paperTypes", [])
            matched_paper = _matching_named_rule(nested_paper_types, paper)
            if matched_paper and isinstance(matched_paper, dict):
                prices = matched_paper.get("prices", {})
                color_norm = _norm(color)
                is_bw = color_norm in ("bw", "black and white") or color_norm == "black & white"
                is_double = "both" in _norm(sides) or "double" in _norm(sides) or "duplex" in _norm(sides)

                # Map the chosen color tier to a per-tier price key.
                # Admin UI stores `color_single`/`color_double` for the Standard tier.
                # Premium gets `premium_*` keys (defaulting to color_* if absent).
                if is_bw:
                    price_key = "bw_double" if is_double else "bw_single"
                elif "premium" in color_norm or "ultra" in color_norm:
                    side = "_double" if is_double else "_single"
                    price_key = f"premium{side}" if f"premium{side}" in prices else f"color{side}"
                else:
                    side = "_double" if is_double else "_single"
                    price_key = f"color{side}"

                per_page = _decimal_from(prices.get(price_key, 0))

        # Fallback to legacy flat calculation
        if per_page is None:
            per_page = _decimal_from(rule.get("basePrice"), PRICE_PER_PAGE_BW)
            per_page += _option_price(rule, "printTypes", print_type)
            per_page += _option_price(rule, "paperSizes", size)
            per_page += _option_price(rule, "paperTypes", paper)
            per_page += _option_price(rule, "colorTypes", color, fallback=COLOR_ADDONS)
            per_page += _option_price(rule, "sideTypes", sides, fallback=SIDES_ADDONS)
    else:
        per_page = PRICE_PER_PAGE_BW
        if color in COLOR_ADDONS:
            per_page = PRICE_PER_PAGE_BW + COLOR_ADDONS[color]
        elif "color" in _norm(color):
            per_page = PRICE_PER_PAGE_BW * PRICE_PER_PAGE_COLOR_MULTIPLIER

    printing_cost = Decimal(pages) * Decimal(copies) * per_page
    discount = _best_quantity_discount(rule.get("quantityDiscounts", []) if rule else [], copies)
    if discount:
        printing_cost = printing_cost * (Decimal("1") - discount["discount"] / Decimal("100"))

    binding_options = rule.get("bindingTypes", []) if rule else []
    binding_rule = _matching_named_rule(binding_options, binding)
    if binding_options:
        binding_cost = _decimal_from(binding_rule.get("price", 0) if binding_rule else 0) * Decimal(copies)
    else:
        binding_cost = BINDING_PRICES.get(binding, Decimal("0")) * Decimal(copies)

    cover_options = rule.get("coverTypes", []) if rule else []
    cover_rule = _matching_named_rule(cover_options, cover)
    cover_cost = _decimal_from(cover_rule.get("price", 0) if cover_rule else 0) * Decimal(copies)

    lamination = str(item.get("lamination", "Without Lamination")).strip() or "Without Lamination"
    lamination_cost = Decimal("0")
    if _norm(lamination) not in ("without lamination", "no lamination", "none", ""):
        lam_options = []
        if size_rule and isinstance(size_rule, dict) and "laminationTypes" in size_rule:
            lam_options = size_rule.get("laminationTypes", [])
        elif rule:
            lam_options = rule.get("laminationTypes", [])
        lam_rule = _matching_named_rule(lam_options, lamination) if lam_options else None
        if lam_rule and "price" in lam_rule:
            lam_rate = _decimal_from(lam_rule["price"])
        elif "soft" in _norm(lamination):
            lam_rate = Decimal("8")
        else:
            lam_rate = Decimal("5")
        lamination_cost = lam_rate * Decimal(pages) * Decimal(copies)

    return printing_cost, binding_cost + cover_cost + lamination_cost, pages


def calculate_checkout_pricing(files=None, cart_items=None, coupon_code=None):
    files = files or []
    cart_items = cart_items or []
    pricing_rules = _load_pricing_rules()
    charge_settings = get_checkout_charge_settings()

    file_printing = Decimal("0")
    binding_charges = Decimal("0")
    total_pages = 0

    for item in files:
        printing_cost, binding_cost, pages = _file_line_pricing(item, pricing_rules)
        file_printing += printing_cost
        binding_charges += binding_cost
        total_pages += pages

    cart_total = Decimal("0")
    for item in cart_items:
        price = _decimal_from(item.get("price", 0))
        quantity = _int_from(item.get("quantity", 1), default=1, minimum=1)
        cart_total += price * Decimal(quantity)

    printing_charges = _money(file_printing + cart_total)
    binding_charges = _money(binding_charges)
    packaging_charges = charge_settings["packagingCharge"] if files or cart_items else Decimal("0")
    net_charges = _money(printing_charges + binding_charges + packaging_charges)

    coupon = COUPONS.get(str(coupon_code or "").strip().upper())
    discount = Decimal("0")
    applied_coupon = str(coupon_code or "").strip().upper() if coupon else ""
    if coupon:
        if coupon["type"] == "percent":
            discount = printing_charges * coupon["discount"] / Decimal("100")
            discount = min(discount, coupon["max"])
        else:
            discount = coupon["discount"]
    discount = _money(discount)

    shipping_charge = Decimal("0") if net_charges - discount >= charge_settings["freeShippingThreshold"] or applied_coupon == "FIRST31" else charge_settings["shippingCharge"]
    total_amount = _money(net_charges - discount + shipping_charge)
    amount_paise = int((total_amount * Decimal("100")).quantize(Decimal("1"), rounding=ROUND_HALF_UP))

    return {
        "printingCharges": float(printing_charges),
        "bindingCharges": float(binding_charges),
        "packagingCharges": float(packaging_charges),
        "netCharges": float(net_charges),
        "discount": float(discount),
        "shippingCharge": float(shipping_charge),
        "totalAmount": float(total_amount),
        "amountPaise": amount_paise,
        "totalPages": total_pages,
        "coupon": applied_coupon,
    }
