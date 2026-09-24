import zipfile

zf = zipfile.ZipFile(r'd:\CyberJob_\FRONTEND-HOSTINGER.zip', 'r')
names = zf.namelist()

key_paths = ['server.js', '.next/', 'node_modules/next/', 'public/']
print('=== Key paths check ===')
for kp in key_paths:
    found = any(n.startswith(kp) or n == kp for n in names)
    status = 'YES' if found else 'NO'
    print('  ' + kp + ': ' + status)

print()
print('=== Root level files/dirs ===')
root_items = [n for n in names if '/' not in n.rstrip('/')]
for f in root_items[:20]:
    print('  ' + f)

print()
print('=== .next/ top-level dirs ===')
next_dirs = set()
for n in names:
    if n.startswith('.next/'):
        parts = n.split('/')
        if len(parts) >= 2 and parts[1]:
            next_dirs.add(parts[1])
print(sorted(next_dirs))

print()
print('=== node_modules/next exists? ===')
has_next = any(n.startswith('node_modules/next/') for n in names)
print('  ' + str(has_next))

zf.close()
