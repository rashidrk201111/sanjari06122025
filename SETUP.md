# Local Development Setup Guide — Sanjari Prints

This guide provides step-by-step instructions to set up, configure, and run the Sanjari Prints application locally on your workstation.

---

## 1. Prerequisites

Before starting, ensure the following software is installed on your development machine:

* **Node.js**: `v18.x` or `v20.x` (LTS recommended)
* **NPM**: `v9.x` or `v10.x`
* **Python**: `3.11.x`
* **Git**: `2.x+`
* **Docker & Docker Compose** *(Optional, for containerized local testing)*

---

## 2. Clone the Repository

```bash
git clone https://github.com/rashidrk201111/sanjari06122025.git
cd "Sanjari Code 13-05-2026"
```

---

## 3. Configure Environment Variables

Create the local environment files from the provided templates:

### Root Frontend Environment
Copy [`.env.example`](file:///c:/Users/tdsdi/Desktop/Sanjari%20Code%2013-05-2026/.env.example) to `.env`:
```bash
cp .env.example .env
```
Ensure the following variables are populated in `.env`:
```ini
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://127.0.0.1:8000
```

### Backend Environment
Copy [`backend/.env.example`](file:///c:/Users/tdsdi/Desktop/Sanjari%20Code%2013-05-2026/backend/.env.example) to `backend/.env`:
```bash
cp backend/.env.example backend/.env
```
Configure `backend/.env` with your development settings:
```ini
DJANGO_SECRET_KEY=local-dev-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Use SQLite for local development or point to your Supabase PostgreSQL pooler
# DATABASE_URL=postgresql://postgres.xxx:password@aws-1-us-east-1.pooler.supabase.com:6543/postgres

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Payment settings (PhonePe Sandbox for local testing)
PHONEPE_CLIENT_ID=your_phonepe_client_id
PHONEPE_CLIENT_SECRET=your_phonepe_client_secret
PHONEPE_CLIENT_VERSION=1
PHONEPE_SANDBOX=True

# CORS & CSRF for local frontend development
CORS_ALLOW_ALL_ORIGINS=True
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
```

---

## 4. Install Dependencies

### Frontend Dependencies
In the root directory, install all Node.js dependencies:
```bash
npm install
```

### Backend Dependencies
Navigate to the `backend/` directory, set up a Python virtual environment, and install dependencies:
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (Command Prompt):
venv\Scripts\activate.bat
# macOS / Linux:
source venv/bin/activate

# Install Python packages
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 5. Database Setup & Migrations

From the `backend/` folder (with your virtual environment active):

1. **Run Database Migrations**:
   ```bash
   python manage.py migrate
   ```

2. **Synchronize Product Catalog & Default Pricing Rules**:
   ```bash
   python manage.py sync_frontend_catalog
   ```

3. **(Optional) Create Django Superuser**:
   ```bash
   python manage.py createsuperuser
   ```

---

## 6. Running the Application Locally

You need to run the backend and frontend in separate terminals:

### Terminal 1: Start Django Backend
```bash
cd backend
# Activate virtual environment if not already active
python manage.py runserver 127.0.0.1:8000
```
* Backend API available at: `http://127.0.0.1:8000/api/payments/`
* Django Admin available at: `http://127.0.0.1:8000/admin/`

### Terminal 2: Start Vite Frontend
In the root project directory:
```bash
npm run dev
```
* Frontend Application available at: `http://localhost:3000` (or `http://localhost:5173`)

---

## 7. Verifying the Setup

1. **Homepage & Catalog**: Open `http://localhost:3000` in your browser. Verify categories load (Documents, Books, Certificates, Thesis, Black Book Binding).
2. **Price Calculator & PDF Detection**: Navigate to `/price-calculator` or any product customization page. Upload a PDF file (e.g. `src/test/sample1.pdf`) and verify that the page count is automatically detected and the price recalculates in real-time.
3. **Customer Authentication**: Navigate to `/#/signup` to create a test user, then log in at `/#/login`.
4. **Admin Dashboard**: Navigate to `/#/admin/login` and authenticate with an admin user account to access the administrative dashboard at `/#/admin/dashboard`.
5. **Payment Checkout**: Proceed to checkout (`/#/checkout`) to test quotation generation and checkout flow.

---

## 8. Alternative: Running with Docker Compose

To run the entire containerized stack locally using Docker:

```bash
docker-compose up --build
```
The application will be accessible at `http://localhost:8080`.
