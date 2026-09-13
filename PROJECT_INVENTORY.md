# Project Inventory — Sanjari Prints

Project Name: Sanjari Prints
Project Number: Project 01
Project Type: Full-Stack E-Commerce & Web-to-Print Web Application
Production URL: https://sanjariprint.in (Alternative: https://sanjari-prints-873557662000.us-central1.run.app)
Frontend: React 18.3.1 (TypeScript, Vite 6.3.5, Tailwind CSS, Radix UI Primitives, Lucide Icons, Sonner, Recharts, Embla Carousel React)
Backend: Django 4.2+ (Python 3.11, Django REST Framework, Gunicorn, Nginx, psycopg2-binary, pypdf, Pillow)
Database: Supabase PostgreSQL (Managed PostgreSQL 15+ hosted on AWS us-east-1 via Supavisor pooler on port 6543) / SQLite3 (local fallback)
Authentication: Supabase Auth (Email/Password, Google & Facebook OAuth) + Django SupabaseAdminBackend bridge for Django Admin
Hosting: Google Cloud Run (Unified multi-stage Docker container listening on port 80)
Domain: sanjariprint.in / www.sanjariprint.in (DNS A/AAAA/CNAME records pointed to Google Cloud Run custom domain mapping)
GitHub: https://github.com/rashidrk201111/sanjari06122025.git (Private Repository)
Storage: Supabase Storage (Public bucket: order-files) / Local media storage (backend/media/uploads/)
Payment: PhonePe PG V2 API (Primary OAuth checkout with UPI/Cards/NetBanking) / Razorpay (Configured) / Cash on Delivery (COD)
Email: Supabase Auth transactional emails (Password Reset, Email Verification) / Support inbox: sanjariprint@gmail.com, info@tdsdigitals.in
SMS: PhonePe & Shiprocket automated transaction & delivery tracking SMS
WhatsApp: Customer direct support link (configured in site contact)
External APIs: PhonePe V2 PG API, Shiprocket Logistics API, Supabase REST & Auth API
Webhooks: PhonePe payment status callback (/api/payments/callback/), Shiprocket courier tracking webhook (/api/payments/shiprocket/webhook/)
Cron Jobs: Automatic catalog sync on container startup (python manage.py sync_frontend_catalog), PostgreSQL updated_at database triggers
CSV/Excel Sources: Dynamic client-side CSV export in Admin Dashboard for Orders and Admin Audit Logs; no static imported CSV required
Mobile App: Responsive Web Application (Optimized for Mobile/Tablet/Desktop viewport)
Android: N/A (Web application accessible via mobile browser)
iOS: N/A (Web application accessible via mobile browser)
Important Environment Variables: DJANGO_SECRET_KEY, DATABASE_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET, PHONEPE_SANDBOX, SHIPROCKET_ENABLED, SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD, ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS, CSRF_TRUSTED_ORIGINS
Sensitive Files: .env, .env.local, backend/.env, db.sqlite3, backend/db.sqlite3, cloud_run_logs.txt, backend/media/uploads/ (All excluded in .gitignore)
Backup Location: Supabase Automated Daily Backups & Point-in-Time Recovery (PITR); Google Container Registry for Docker images (gcr.io/$PROJECT_ID/sanjari-prints:latest)
Known Issues: Plaintext production credentials in cloudbuild.yaml flagged for secret rotation and migration to Google Secret Manager; hardcoded Supabase keys in src/lib/supabase.ts should be converted to import.meta.env variables.
Last Audited: 2026-09-13
