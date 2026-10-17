import os

src_dir = r"src"
count = 0
for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith((".tsx", ".ts")):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            if r'\"' in content:
                new_content = content.replace(r'\"', '"')
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                count += 1
                print(f"Fixed quotes in: {path}")

print(f"Total files fixed: {count}")
