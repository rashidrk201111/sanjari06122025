import re
import requests
import json

# Read .env for supabase URL and key
url = None
key = None

with open('.env', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line.startswith('VITE_SUPABASE_URL='):
            url = line.split('=', 1)[1].strip()
        elif line.startswith('VITE_SUPABASE_ANON_KEY='):
            key = line.split('=', 1)[1].strip()

print(f"Supabase URL: {url}")
if not url or not key:
    print("Could not find VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env")
    exit(1)

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

# Query public.users table
res = requests.get(f"{url}/rest/v1/users", headers=headers)
if res.status_code == 200:
    users = res.json()
    print(f"Total users: {len(users)}")
    for user in users:
        print(f"ID: {user.get('id')}, Email: {user.get('email')}, Name: {user.get('name')}, Role: {user.get('role')}")
else:
    print(f"Error querying users: {res.status_code} - {res.text}")
