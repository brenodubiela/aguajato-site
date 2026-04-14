import os
import re
import shutil

# Paths
base_dir = '/Users/breno/Projetos/aguajato-site'
img_dir = os.path.join(base_dir, 'img')
html_files = [f for f in os.listdir(base_dir) if f.endswith('.html')]
css_dir = os.path.join(base_dir, 'css')
js_dir = os.path.join(base_dir, 'js')

def normalize_name(filename):
    name, ext = os.path.splitext(filename)
    # Lowercase
    name = name.lower()
    # Replace spaces, dots, and common special chars with hyphens
    name = re.sub(r'[^a-z0-9]+', '-', name)
    # Remove trailing/leading hyphens
    name = name.strip('-')
    return name + ext.lower()

def cleanup_images():
    files = [f for f in os.listdir(img_dir) if os.path.isfile(os.path.join(img_dir, f))]
    mapping = {} # old_name -> new_name
    to_delete = []

    # 1. Identify WebP vs Others
    webp_bases = {}
    for f in files:
        name, ext = os.path.splitext(f)
        if ext.lower() == '.webp':
            webp_bases[name.lower()] = f

    # 2. Mark duplicates for deletion
    for f in files:
        name, ext = os.path.splitext(f)
        if ext.lower() in ['.jpg', '.jpeg', '.png', '.gif']:
            if name.lower() in webp_bases:
                to_delete.append(f)

    # 3. Perform deletions
    for f in to_delete:
        print(f"Deleting duplicate: {f}")
        os.remove(os.path.join(img_dir, f))
    
    # Refresh file list after deletion
    files = [f for f in os.listdir(img_dir) if os.path.isfile(os.path.join(img_dir, f))]

    # 4. Normalize names and create mapping
    for f in files:
        new_name = normalize_name(f)
        if f != new_name:
            # Handle collisions
            if os.path.exists(os.path.join(img_dir, new_name)):
                # If collision, append a number
                base, ext = os.path.splitext(new_name)
                i = 1
                while os.path.exists(os.path.join(img_dir, f"{base}-{i}{ext}")):
                    i += 1
                new_name = f"{base}-{i}{ext}"
            
            print(f"Renaming: {f} -> {new_name}")
            shutil.move(os.path.join(img_dir, f), os.path.join(img_dir, new_name))
            mapping[f] = new_name
        else:
            mapping[f] = f

    # 5. Handle the case where we deleted a file but need to map its old name to the webp version
    for f in to_delete:
        name, ext = os.path.splitext(f)
        webp_file = webp_bases[name.lower()]
        # The webp file might have been renamed too
        target_name = mapping.get(webp_file, webp_file)
        mapping[f] = target_name

    return mapping

def update_references(mapping):
    target_files = []
    # HTML files in root
    for f in os.listdir(base_dir):
        if f.endswith('.html'):
            target_files.append(os.path.join(base_dir, f))
    
    # CSS files
    if os.path.exists(css_dir):
        for f in os.listdir(css_dir):
            if f.endswith('.css'):
                target_files.append(os.path.join(css_dir, f))
                
    # JS files
    if os.path.exists(js_dir):
        for f in os.listdir(js_dir):
            if f.endswith('.js'):
                target_files.append(os.path.join(js_dir, f))

    for file_path in target_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        changed = False
        # Replace each old reference
        # We search for "img/filename" patterns
        for old_name, new_name in mapping.items():
            if old_name == new_name:
                continue
            
            # Simple replacement for img/old_name
            pattern = re.escape(f'img/{old_name}')
            replacement = f'img/{new_name}'
            if re.search(pattern, content):
                content = re.sub(pattern, replacement, content)
                changed = True
        
        if changed:
            print(f"Updated references in: {file_path}")
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)

if __name__ == "__main__":
    mapping = cleanup_images()
    update_references(mapping)
    print("Done!")
