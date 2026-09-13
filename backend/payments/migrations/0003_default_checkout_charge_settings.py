from django.db import migrations


DEFAULT_SETTINGS = {
    "checkout_packaging_charge": "0",
    "checkout_shipping_charge": "0",
    "checkout_free_shipping_threshold": "500",
}


def create_default_checkout_charge_settings(apps, schema_editor):
    SiteSetting = apps.get_model("payments", "SiteSetting")
    for key, value in DEFAULT_SETTINGS.items():
        SiteSetting.objects.get_or_create(key=key, defaults={"value": value})


class Migration(migrations.Migration):
    dependencies = [
        ("payments", "0002_shiprocketlog_shiprocketsettings_shiprockettoken_and_more"),
    ]

    operations = [
        migrations.RunPython(create_default_checkout_charge_settings, migrations.RunPython.noop),
    ]
