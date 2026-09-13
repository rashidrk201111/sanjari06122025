# Environment Variables Reference

This document catalogs all environment variables used by the Sanjari Prints platform across frontend and backend services.

> [!IMPORTANT]
> **NEVER** commit files containing real environment variable values (such as `.env`, `.env.local`, `.env.production`, or `backend/.env`) to version control. Use `.env.example` as a template for configuring local or deployment environments.

---

## 1. Application & Server Configuration

### Backend Core (Django)
* `DJANGO_SECRET_KEY`: **Required (Production)** — Cryptographic secret key used by Django for session signing and cryptographic utilities.
* `DEBUG`: **Optional** — Boolean flag (`True` or `False`) to toggle Django debugging mode. Must be set to `False` in production.
* `ALLOWED_HOSTS`: **Required (Production)** — Comma-separated list of host/domain names that this Django site can serve (e.g., `localhost,127.0.0.1,sanjariprint.in,sanjari-prints-873557662000.us-central1.run.app`).
* `NODE_ENV`: **Optional** — Environment indicator (`development` or `production`). Used by Django settings to adjust static/media root directories.
* `HOST`: **Optional** — Host IP address binding (default: `0.0.0.0`).
* `PORT`: **Optional** — Port number for web server binding (default: `80` in container, `8000` for Django).

### CORS & Security Settings
* `CORS_ALLOW_ALL_ORIGINS`: **Optional** — Boolean flag (`True` / `False`) allowing cross-origin requests from any origin. Recommended `False` in production.
* `CORS_ALLOWED_ORIGINS`: **Required (Production)** — Comma-separated list of allowed origins (e.g., `https://sanjariprint.in,https://www.sanjariprint.in`).
* `CSRF_TRUSTED_ORIGINS`: **Required (Production)** — Comma-separated list of trusted origins for CSRF-protected POST requests.
* `SECURE_SSL_REDIRECT`: **Optional** — Boolean flag (`True` / `False`) forcing HTTP to HTTPS redirection.
* `SESSION_COOKIE_SECURE`: **Optional** — Boolean flag ensuring session cookies are only transmitted over HTTPS.
* `CSRF_COOKIE_SECURE`: **Optional** — Boolean flag ensuring CSRF cookies are only transmitted over HTTPS.
* `SECURE_HSTS_SECONDS`: **Optional** — Integer HTTP Strict Transport Security duration (default: `31536000`).
* `SECURE_HSTS_INCLUDE_SUBDOMAINS`: **Optional** — Boolean flag applying HSTS policy to subdomains.
* `SECURE_HSTS_PRELOAD`: **Optional** — Boolean flag allowing domain preloading in HSTS lists.

---

## 2. Database Configuration

* `DATABASE_URL`: **Required (Production)** — Full PostgreSQL connection string including credentials, pooler host, port, database name, and SSL options.
  * *Format*: `postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require`
  * *Supabase Pooler Example Host*: `aws-1-us-east-1.pooler.supabase.com:6543/postgres`
  * *Local Development Fallback*: Defaults to SQLite (`sqlite:///../db.sqlite3`) if `DATABASE_URL` is omitted.

---

## 3. Supabase Integration (Auth, Database & Storage)

### Frontend (`src/` / Vite)
* `VITE_SUPABASE_URL`: **Required** — Public HTTPS URL of the Supabase project instance (e.g., `https://your-project.supabase.co`).
* `VITE_SUPABASE_ANON_KEY`: **Required** — Public anonymous JWT API key for Supabase client requests subject to Row Level Security.
* `VITE_API_URL`: **Optional (Local Development)** — Custom backend API base URL override (e.g., `http://127.0.0.1:8000`). If omitted in local dev, defaults dynamically to `http://127.0.0.1:8000`.
* `VITE_APP_URL`: **Optional** — Base URL of the deployed application (e.g., `https://sanjariprint.in`).

### Backend (`backend/`)
* `SUPABASE_URL`: **Required** — Supabase project URL for backend admin profile verification and storage uploads.
* `SUPABASE_ANON_KEY`: **Required** — Supabase anonymous key used by backend auth backend (`SupabaseAdminBackend`).
* `SUPABASE_SERVICE_ROLE_KEY`: **Required (Backend Admin)** — Supabase privileged service-role JWT key used by Django backend to upload customer documents directly to Supabase Storage bypassing client restrictions.
* `SUPABASE_UPLOAD_BUCKET`: **Optional** — Name of the Supabase Storage bucket for uploaded PDF print files (default: `order-files`).

---

## 4. Payment Gateways

### PhonePe PG V2 (Primary Payment Gateway)
* `PHONEPE_CLIENT_ID`: **Required** — PhonePe Merchant/Client ID issued in the PhonePe Business Developer Portal.
* `PHONEPE_CLIENT_SECRET`: **Required** — PhonePe Merchant/Client Secret key for OAuth client credentials token generation.
* `PHONEPE_CLIENT_VERSION`: **Optional** — API version index (default: `1`).
* `PHONEPE_SANDBOX`: **Optional** — Boolean flag (`True` for preprod/sandbox testing, `False` for production live transactions).
* `PHONEPE_MERCHANT_ID`: **Optional** — Legacy alias for `PHONEPE_CLIENT_ID`.
* `PHONEPE_MERCHANT_SECRET`: **Optional** — Legacy alias for `PHONEPE_CLIENT_SECRET`.
* `PHONEPE_SALT_INDEX`: **Optional** — Legacy alias for `PHONEPE_CLIENT_VERSION`.

### Razorpay (Alternative Payment Gateway)
* `VITE_RAZORPAY_KEY_ID`: **Optional** — Public Razorpay Key ID used for client-side checkout initiation.
* `RAZORPAY_KEY_SECRET`: **Optional** — Razorpay Key Secret for backend webhook verification.

---

## 5. Logistics & Courier Service (Shiprocket)

* `SHIPROCKET_ENABLED`: **Optional** — Boolean flag (`True` or `False`) to enable automated Shiprocket shipment booking upon order completion.
* `SHIPROCKET_EMAIL`: **Required (if enabled)** — Registered Shiprocket account email address.
* `SHIPROCKET_PASSWORD`: **Required (if enabled)** — Registered Shiprocket account password.
* `SHIPROCKET_WEBHOOK_SECRET`: **Optional** — Webhook authentication secret to verify incoming Shiprocket courier tracking status payloads.
* `SHIPROCKET_COMPANY_NAME`: **Optional** — Business name displayed on shipping manifests and labels (default: `Sanjari Prints`).
* `SHIPROCKET_PHONE`: **Optional** — Primary business contact phone number for shipments.
* `SHIPROCKET_PICKUP_LOCATION`: **Optional** — Configured Shiprocket pickup warehouse nickname (default: `Primary` or `Home`).
* `SHIPROCKET_ADDRESS`: **Optional** — Warehouse pickup address line 1.
* `SHIPROCKET_ADDRESS2`: **Optional** — Warehouse pickup address line 2.
* `SHIPROCKET_CITY`: **Optional** — Warehouse city (default: `Mumbai`).
* `SHIPROCKET_STATE`: **Optional** — Warehouse state (default: `Maharashtra`).
* `SHIPROCKET_PINCODE`: **Optional** — Warehouse postal code.
* `SHIPROCKET_COUNTRY`: **Optional** — Warehouse country (default: `India`).
* `SHIPROCKET_AUTO_CREATE`: **Optional** — Boolean flag (`True` / `False`) to automatically initiate shipment generation when payment succeeds.

---

## 6. Google Cloud Platform & Deployment

* `GCP_PROJECT_ID`: **Required (Deploy Script)** — Google Cloud project identifier (e.g., `sanjari-prints` or `prinsters-38cc5`).
* `GCP_REGION`: **Optional** — Cloud Run region (e.g., `us-central1` or `asia-south1`).
* `GCP_SERVICE_NAME`: **Optional** — Cloud Run service name (default: `sanjari-prints`).
* `DOCKER_IMAGE_TAG`: **Optional** — Docker image tag for deployments (default: `latest`).

---

## Categorized Environment Setup Matrix

| Variable Name | Local Dev | Staging | Production | Service / Layer | Where Configured |
| :--- | :---: | :---: | :---: | :--- | :--- |
| `DJANGO_SECRET_KEY` | Auto/Any | Required | Required | Django Backend | `.env` / Cloud Run Env |
| `DEBUG` | `True` | `False` | `False` | Django Backend | `.env` / Cloud Run Env |
| `ALLOWED_HOSTS` | `localhost` | Specific | Specific | Django Backend | `.env` / Cloud Run Env |
| `DATABASE_URL` | SQLite / Supabase | Supabase Pooler | Supabase Pooler | PostgreSQL | `.env` / Cloud Run Env |
| `VITE_SUPABASE_URL` | Required | Required | Required | Frontend / Supabase | `.env` / Cloud Build / Vite |
| `VITE_SUPABASE_ANON_KEY`| Required | Required | Required | Frontend / Supabase | `.env` / Cloud Build / Vite |
| `SUPABASE_URL` | Required | Required | Required | Backend / Supabase | `backend/.env` / Cloud Run |
| `SUPABASE_ANON_KEY` | Required | Required | Required | Backend / Supabase | `backend/.env` / Cloud Run |
| `SUPABASE_SERVICE_ROLE_KEY` | Required | Required | Required | Backend Storage | `backend/.env` / Cloud Run |
| `PHONEPE_CLIENT_ID` | Sandbox ID | Sandbox ID | Production ID | PhonePe | `backend/.env` / Cloud Run |
| `PHONEPE_CLIENT_SECRET` | Sandbox Secret | Sandbox Secret | Production Secret | PhonePe | `backend/.env` / Cloud Run |
| `PHONEPE_SANDBOX` | `True` | `True` | `False` | PhonePe | `backend/.env` / Cloud Run |
| `SHIPROCKET_EMAIL` | Optional | Sandbox/Dev | Production | Shiprocket | `backend/.env` / Cloud Run |
| `SHIPROCKET_PASSWORD` | Optional | Sandbox/Dev | Production | Shiprocket | `backend/.env` / Cloud Run |
| `CORS_ALLOWED_ORIGINS` | `localhost:*` | Domain | Domain | Django CORS | `backend/.env` / Cloud Run |
| `CSRF_TRUSTED_ORIGINS` | `localhost:*` | Domain | Domain | Django CSRF | `backend/.env` / Cloud Run |
