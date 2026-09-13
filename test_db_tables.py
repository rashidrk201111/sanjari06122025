import requests
import os

url = None
key = None

if os.path.exists('.env'):
    with open('.env', 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('VITE_SUPABASE_URL='):
                url = line.split('=', 1)[1].strip()
            elif line.startswith('VITE_SUPABASE_ANON_KEY='):
                key = line.split('=', 1)[1].strip()

if not url or not key:
    print("Error: Could not find VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env")
    exit(1)

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

endpoints = ["users", "admin_audit_logs", "payment_settings", "content_pages", "orders", "pricing_rules"]
for ep in endpoints:
    try:
        res = requests.get(f"{url}/rest/v1/{ep}", headers=headers)
        if res.status_code in [200, 201, 204]:
            print(f"Table '{ep}': SUCCESS (Status {res.status_code})")
        else:
            print(f"Table '{ep}': FAILED (Status {res.status_code}) - {res.text[:150]}")
    except Exception as e:
        print(f"Table '{ep}': ERROR - {str(e)}")
