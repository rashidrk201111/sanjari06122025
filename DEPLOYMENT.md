# Deployment Guide — Sanjari Prints

This document details the production hosting infrastructure, containerization, build process, DNS configuration, and deployment workflow for the Sanjari Prints platform.

---

## 1. Hosting Architecture Overview

* **Primary Hosting Platform**: **Google Cloud Run** (Fully Managed Serverless Container Platform)
* **GCP Projects**: `sanjari-prints` / `prinsters-38cc5`
* **GCP Region**: `us-central1` (Primary) / `asia-south1` (Alternative)
* **Container Architecture**: Unified Single Container hosting both the Nginx Reverse Proxy / Static SPA and the Django Gunicorn WSGI application.
* **Production Live Domains**:
  * Custom Primary Domain: `https://sanjariprint.in`
  * Custom Subdomain: `https://www.sanjariprint.in`
  * Cloud Run Ingress Endpoint: `https://sanjari-prints-873557662000.us-central1.run.app`

---

## 2. Container & Service Specifications

| Parameter | Configuration | Purpose |
| :--- | :--- | :--- |
| **Service Name** | `sanjari-prints` | Cloud Run managed service identifier |
| **Port** | `80` | External container listening port (handled by Nginx) |
| **CPU Allocation** | `1 vCPU` | Serverless CPU capacity |
| **Memory Allocation** | `1 GiB` | Container memory limit |
| **Min Instances** | `0` | Scale to zero to optimize idle hosting costs |
| **Max Instances** | `10` | Auto-scaling ceiling during traffic bursts |
| **Request Timeout** | `300s` | Maximum duration for PDF uploads / report generations |
| **Authentication** | Allow unauthenticated | Public internet access |

---

## 3. Unified Multi-Stage Dockerfile Architecture

The production [`Dockerfile`](file:///c:/Users/tdsdi/Desktop/Sanjari%20Code%2013-05-2026/Dockerfile) builds a unified runtime environment in three stages:

### Stage 1: Frontend Build (`frontend-builder`)
* **Base Image**: `node:20-alpine`
* **Actions**: Installs NPM dependencies (`npm ci`) and compiles the React application into optimized static assets (`npm run build` -> `/frontend/build`).

### Stage 2: Backend Build (`backend-builder`)
* **Base Image**: `python:3.11-slim`
* **Actions**: Installs Python dependencies (`pip install -r requirements.txt`), copies the Django codebase, collects static files (`python manage.py collectstatic --noinput`), and runs a Django system check.

### Stage 3: Production Runtime Image
* **Base Image**: `python:3.11-slim`
* **System Packages**: Installs `nginx` web server.
* **Artifact Assembly**:
  * Copies compiled React frontend to `/usr/share/nginx/html`.
  * Copies Python environment and backend code to `/app`.
  * Injects custom [`nginx.conf`](file:///c:/Users/tdsdi/Desktop/Sanjari%20Code%2013-05-2026/nginx.conf).
* **Startup Command**:
  ```bash
  python manage.py migrate --noinput && \
  python manage.py sync_frontend_catalog && \
  (gunicorn project.wsgi:application --bind 127.0.0.1:8000 --workers 3 --log-level info &) && \
  sleep 2 && \
  exec nginx -g 'daemon off;'
  ```

---

## 4. Nginx Routing & Proxy Configuration

Nginx handles incoming requests on port 80 and coordinates routing as follows:

1. **API Requests (`/api/`)**: Reverse-proxied to Gunicorn at `http://127.0.0.1:8000/api/` with `X-Forwarded-Proto`, `Host`, and `X-Real-IP` headers.
2. **Admin Requests (`/admin/` & `/admin`)**: Reverse-proxied to Gunicorn at `http://127.0.0.1:8000/admin/`.
3. **Django Static & Media Assets**:
   * `/static/` -> Served directly from `/app/staticfiles/`.
   * `/media/` -> Served directly from `/app/media/`.
4. **Single Page Application (`/`)**:
   * Fallback rule: `try_files $uri $uri/ /index.html;`.
   * `Cache-Control: "no-store, no-cache, must-revalidate"` for `index.html` to guarantee immediate UI updates upon deployment.
   * `Cache-Control: "public, max-age=31536000, immutable"` for hashed CSS, JS, and image assets.
5. **Security Headers**: Injects `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, and `Referrer-Policy`.

---

## 5. Automated CI/CD Deployment with Google Cloud Build

Automated deployment is defined in [`cloudbuild.yaml`](file:///c:/Users/tdsdi/Desktop/Sanjari%20Code%2013-05-2026/cloudbuild.yaml).

### Build Pipeline Steps:
1. **Docker Build**: Builds the unified image tagged as `gcr.io/$PROJECT_ID/sanjari-prints:$BUILD_ID` and `:latest`.
2. **Container Registry Push**: Pushes the container image to Google Container Registry (GCR).
3. **Cloud Run Deploy**: Deploys the new revision to Cloud Run with updated environment variables.

### Deploying via Google Cloud CLI:
```bash
# Submit build to Cloud Build
gcloud builds submit --config=cloudbuild.yaml .
```

### Manual Deployment via `deploy.bat`:
A Windows batch deployment script is provided in [`src/deploy.bat`](file:///c:/Users/tdsdi/Desktop/Sanjari%20Code%2013-05-2026/src/deploy.bat) for automated manual builds:
```cmd
src\deploy.bat
```

---

## 6. Domain & DNS Configuration

To map a custom domain to Google Cloud Run:

1. Open **Google Cloud Console** > **Cloud Run** > **Manage Custom Domains**.
2. Add mapping for `sanjariprint.in` and `www.sanjariprint.in`.
3. Configure the DNS records at your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare):

| Record Type | Host / Name | Value / Destination | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `216.239.32.21`, `216.239.34.21`, `216.239.36.21`, `216.239.38.21` | Auto / 3600 |
| **AAAA** | `@` | `2001:4860:4802:32::15`, `2001:4860:4802:34::15`, etc. | Auto / 3600 |
| **CNAME** | `www` | `ghs.googlehosted.com.` | Auto / 3600 |

* **SSL/TLS Certificates**: Automatically provisioned and renewed by Google Managed SSL Certificates at no extra charge.

---

## 7. Webhook & Integration Configuration

### PhonePe Payment Gateway Callback
* **Webhook URL**: `https://sanjariprint.in/api/payments/callback/`
* **Method**: `POST`
* **Configuration**: Configured in PhonePe Merchant Dashboard under Webhooks / Callback URLs.

### Shiprocket Tracking Webhook
* **Webhook URL**: `https://sanjariprint.in/api/payments/shiprocket/webhook/`
* **Method**: `POST`
* **Configuration**: Configured in Shiprocket Dashboard > API > Webhooks for tracking events (AWB Assigned, In Transit, Out for Delivery, Delivered).

---

## 8. Backup & Maintenance

* **Database Backups**: Managed automatically via Supabase Point-In-Time-Recovery (PITR) and daily snapshot backups.
* **Storage Backups**: Files stored in Supabase Storage (`order-files`) are redundantly preserved across multi-region AWS S3 infrastructure.
* **Disaster Recovery**: Cloud Run container instances are stateless. Re-deploying is instantly achieved by pulling the existing Docker image from Google Container Registry (`gcr.io/$PROJECT_ID/sanjari-prints:latest`).
