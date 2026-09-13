import os
import re

src_dir = r"c:\Users\tdsdi\Desktop\Sanjari Code 13-05-2026\src"
pattern = re.compile(r'\bAPI_BASE\b')

print("Searching for API_BASE in src...")
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    for i, line in enumerate(f, 1):
                        if pattern.search(line):
                            print(f"{os.path.relpath(path, src_dir)}:L{i} - {line.strip()}")
            except Exception as e:
                pass
