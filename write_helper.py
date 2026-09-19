import sys, base64
from pathlib import Path

if len(sys.argv) < 3:
    print('Usage: python write_helper.py <filepath> <base64_content>')
    sys.exit(1)

target = Path(sys.argv[1])
b64_data = sys.argv[2]

target.parent.mkdir(parents=True, exist_ok=True)
target.write_bytes(base64.b64decode(b64_data))
print(f'SUCCESS: {target} ({target.stat().st_size} bytes)')
