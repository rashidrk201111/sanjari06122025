import requests

# Create a minimal dummy PDF content
dummy_pdf = (
    b"%PDF-1.4\n"
    b"1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n"
    b"2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n"
    b"3 0 obj <</Type /Page /Parent 2 0 R /Resources <<>> /MediaBox [0 0 595 842]>> endobj\n"
    b"xref\n"
    b"0 4\n"
    b"0000000000 65535 f\n"
    b"0000000009 00000 n\n"
    b"0000000056 00000 n\n"
    b"0000000111 00000 n\n"
    b"trailer <</Size 4 /Root 1 0 R>>\n"
    b"startxref\n"
    b"198\n"
    b"%%EOF"
)

with open('dummy.pdf', 'wb') as f:
    f.write(dummy_pdf)

url = "https://sanjari-prints-873557662000.us-central1.run.app/api/payments/detect-pdf-pages/"
print(f"Sending dummy.pdf to {url}...")

files = {'file': ('dummy.pdf', dummy_pdf, 'application/pdf')}
try:
    res = requests.post(url, files=files)
    print(f"Status Code: {res.status_code}")
    print(f"Response Content: {res.text}")
except Exception as e:
    print(f"Request failed: {e}")
