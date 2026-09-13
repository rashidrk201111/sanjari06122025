import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

log_path = r"C:\Users\tdsdi\.gemini\antigravity-ide\brain\4827f643-b0a5-4997-9825-58858f15cae9\.system_generated\logs\transcript.jsonl"

print("--- USER INPUT STEPS ---")
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            obj = json.loads(line)
        except Exception as e:
            continue
        
        if obj.get("type") == "USER_INPUT":
            print(f"Step {obj.get('step_index')}:")
            print(obj.get("content", "").strip())
            print("-" * 50)
