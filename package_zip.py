import os
import zipfile

source_dir = r"C:\Users\rajni\.gemini\antigravity\scratch\greenmetrix"
output_zip = r"C:\Users\rajni\Downloads\greenmetrix.zip"

exclude_dirs = {"node_modules", ".git", "venv", ".venv", "__pycache__"}

print(f"Creating zip archive at {output_zip}...")

file_count = 0
total_size = 0

with zipfile.ZipFile(output_zip, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(source_dir):
        # Filter out excluded directories in-place
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if file.endswith(".pyc"):
                continue
            abs_path = os.path.join(root, file)
            rel_path = os.path.relpath(abs_path, source_dir)
            zf.write(abs_path, arcname=os.path.join("greenmetrix", rel_path))
            file_count += 1
            total_size += os.path.getsize(abs_path)

zip_size_mb = os.path.getsize(output_zip) / (1024 * 1024)
print(f"Successfully created {output_zip}!")
print(f"Total files archived: {file_count}")
print(f"Uncompressed size: {total_size / (1024 * 1024):.2f} MB")
print(f"Compressed archive size: {zip_size_mb:.2f} MB")
