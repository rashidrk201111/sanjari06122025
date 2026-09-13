from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("payments", "0003_default_checkout_charge_settings"),
    ]

    operations = [
        migrations.AddField(
            model_name="fileitem",
            name="remote_url",
            field=models.URLField(blank=True),
        ),
    ]
