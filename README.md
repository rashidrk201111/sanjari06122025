# Sanjari Prints — Web Platform

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite-blue)](https://react.dev/)
[![Django](https://img.shields.io/badge/Backend-Django%204.2%20%7C%20DRF%20%7C%20Python%203.11-darkgreen)](https://www.djangoproject.com/)
[![Database](https://img.shields.io/badge/Database-Supabase%20%7C%20PostgreSQL-3ECF8E)](https://supabase.com/)
[![Cloud](https://img.shields.io/badge/Deploy-Google%20Cloud%20Run-4285F4)](https://cloud.google.com/run)
[![Status](https://img.shields.io/badge/Status-Production%20Live-brightgreen)](https://sanjariprint.in)

Sanjari Prints is a full-stack e-commerce and web-to-print platform offering instant print quotes, automated PDF page counting, comprehensive customization options (paper size/gsm, color tiers, binding styles, lamination), digital payment processing via PhonePe, and automated courier fulfillment via Shiprocket.

---

## 🚀 Key Features

* **Instant Online Print Calculator**: Real-time calculation of printing costs based on dynamic hierarchical pricing matrices, binding choices, lamination, and volume discount tiers.
* **Automated PDF Inspection**: Instant client-side and server-side page count detection and validation for customer-uploaded PDF documents.
* **Comprehensive Print Catalog**: Full product categorization supporting Documents, Annual Reports, Paperback Books, E-Books, Study Materials, Certificates, Note Cards, Flash Cards, Thesis & Dissertations, and Black Book Binding.
* **Unified Customer Authentication**: Seamless user authentication via Supabase Auth supporting Email/Password and Social OAuth (Google & Facebook).
* **Self-Service Customer Dashboard**: Real-time order tracking, order history inspection, invoice downloads, and profile management.
* **PhonePe V2 Payment Gateway Integration**: High-reliability payment processing supporting UPI (Intent, QR, Collect), Net Banking, and Credit/Debit Cards with automated callback status verification.
* **Automated Shiprocket Logistics Integration**: Automated courier allocation, shipment creation, AWB generation, PDF shipping label/manifest downloads, and live tracking webhooks.
* **Comprehensive Admin Control Center**: Unified administrative interface for dynamic pricing rule adjustments, product catalog management, payment gateway toggles, review moderation, SEO metadata configuration, and audit logging.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, TypeScript, Vite 6, Tailwind CSS, Radix UI Primitives, Lucide Icons, Sonner Toasts, Recharts.
* **Backend**: Python 3.11, Django 4.2+, Django REST Framework, Gunicorn, Nginx.
* **Database & Storage**: Supabase (Cloud PostgreSQL with Row Level Security), Supabase Storage (`order-files` bucket).
* **Infrastructure**: Google Cloud Run (Unified container on Port 80), Google Cloud Build CI/CD, Container Registry (`gcr.io`).
* **Integrations**: PhonePe PG V2 API, Shiprocket API (v1 external), Supabase Auth.

---

## 📁 Repository Structure

```
.
├── backend/                # Django REST Framework backend application
│   ├── payments/           # Payments, Shiprocket integration, pricing engine, views
│   ├── project/            # Django root settings, URLs, WSGI configuration
│   └── requirements.txt    # Backend Python package dependencies
├── src/                    # React + TypeScript frontend application
│   ├── components/         # Reusable UI & admin management components
│   ├── context/            # React Context providers (Auth, Admin, Cart)
│   ├── data/               # Product catalog taxonomy and categories
│   ├── lib/                # Supabase client, API utilities, HTTP wrappers
│   └── pages/              # SPA route page views & checkout workflows
├── Dockerfile              # Unified production multi-stage container
├── nginx.conf              # Production Nginx reverse proxy configuration
├── cloudbuild.yaml         # Google Cloud Build CI/CD workflow
├── package.json            # Frontend package manifest & scripts
└── vite.config.ts          # Vite build tool configuration
```

---

## ⚡ Quick Start & Local Setup

### 1. Prerequisites
* Node.js `v18+` or `v20+`
* Python `3.11+`
* Git

### 2. Installation & Setup
```bash
# 1. Clone repository
git clone https://github.com/rashidrk201111/sanjari06122025.git
cd "Sanjari Code 13-05-2026"

# 2. Setup frontend environment
cp .env.example .env
npm install

# 3. Setup backend environment
cp backend/.env.example backend/.env
cd backend
python -m venv venv
# Windows: .\venv\Scripts\Activate.ps1 | Linux/Mac: source venv/bin/activate
pip install -r requirements.txt

# 4. Run migrations and sync catalog
python manage.py migrate
python manage.py sync_frontend_catalog
```

### 3. Run Development Servers
* **Backend API**:
  ```bash
  cd backend
  python manage.py runserver 127.0.0.1:8000
  ```
* **Frontend SPA**:
  ```bash
  npm run dev
  ```
* Open `http://localhost:3000` in your web browser.

---

## 📚 Project Documentation & References

Comprehensive guides are available in the repository:

* **[Project Documentation](PROJECT_DOCUMENTATION.md)**: In-depth technical architecture, complete database schemas, API table, and feature workflows.
* **[Local Setup Guide](SETUP.md)**: Detailed step-by-step developer onboarding and troubleshooting guide.
* **[Deployment Guide](DEPLOYMENT.md)**: Google Cloud Run container specifications, Nginx reverse proxy routing, DNS setup, and CI/CD pipelines.
* **[Environment Variables Reference](ENVIRONMENT_VARIABLES.md)**: Exhaustive catalog of all frontend and backend configuration variables.
* **[Project Inventory](PROJECT_INVENTORY.md)**: Standardized audit inventory and metadata checklist.

---

## 🔒 Security & Privacy Notice

* All production credentials, private tokens, service keys, and database passwords must be stored in secure environment managers (e.g., Google Secret Manager or secure `.env` files).
* `.env` files containing real secrets, database dumps, and user-uploaded media files are strictly excluded from version control via `.gitignore`.
* Sensitive credentials in deployment files should always be referenced via secret managers or secure environment variables.

---

## 🌐 Production Links

* **Live Website**: [https://sanjariprint.in](https://sanjariprint.in) / [https://www.sanjariprint.in](https://www.sanjariprint.in)
* **Cloud Run Ingress**: `https://sanjari-prints-873557662000.us-central1.run.app`