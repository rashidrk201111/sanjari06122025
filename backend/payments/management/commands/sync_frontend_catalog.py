from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create missing admin Product and Pricing Rule rows for the frontend catalogue."

    def handle(self, *args, **options):
        try:
            from payments.admin import ensure_frontend_product_catalog

            ensure_frontend_product_catalog()
        except Exception as exc:
            self.stderr.write(self.style.WARNING(f"Frontend catalogue sync skipped: {exc}"))
            return

        self.stdout.write(self.style.SUCCESS("Frontend product catalogue is synchronized."))
