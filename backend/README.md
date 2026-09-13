Django backend for PhonePe merchant integration (minimal scaffold)

Setup (local):

1. Create and activate a virtual environment

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
# source venv/bin/activate
```

2. Install dependencies

```bash
pip install -r requirements.txt
```

3. Copy `.env.example` to `.env` and set your PhonePe credentials

```bash
cp .env.example .env
# edit .env and set PHONEPE_MERCHANT_ID and PHONEPE_MERCHANT_SECRET
```

4. Run migrations and start the server

```bash
python manage.py migrate
python manage.py runserver
```

API endpoints (examples):

- `POST /api/payments/create-payment/` - create a payment and order
  - JSON body: `{ "amount": 10000, "order_number": "SPR123", "name": "Alice", "email": "a@b.com", "phone": "9999999999", "files": [{"fileName":"doc.pdf","totalPages":10,"startPage":1,"endPage":10,"copies":1}] }`

- `POST /api/payments/callback/` - webhook endpoint for PhonePe to notify payment status

Notes:
- PhonePe API URL and signature mechanism must be confirmed against official PhonePe merchant docs; the code includes an HMAC-based example and a `mock` mode when environment variables are not set for local testing.
- For production, secure `.env`, enable HTTPS, and configure `ALLOWED_HOSTS`.
