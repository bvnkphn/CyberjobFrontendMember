"""
package-standalone.py  –  CyberJob Frontend → Hostinger Standalone ZIP

This script packages the pre-built Next.js standalone output into a zip file
engineered specifically to succeed on Hostinger's Node.js Web App deployment.

Key Protections:
1. Keeps all runtime dependencies in package.json so Hostinger's `npm install`
   will NEVER prune or wipe out node_modules.
2. Provides BOTH root structure (`server.js`) AND `.next/standalone` structure
   so Hostinger's Next.js validator finds `.next/standalone` and doesn't fail with:
   "ERROR: Next.js build produced no standalone server or static output".
3. Patches hardcoded Windows paths (`D:\\CyberJob_\\frontend`) to dynamic runtime
   `__dirname` so it works anywhere on Hostinger's Linux container.
4. Includes .next/static and public assets in both root and standalone locations.
"""

import os
import sys
import shutil
import tempfile
import zipfile
import json

def patch_server_js(server_content):
    # 1. Replace hardcoded Windows build path in raw JSON config
    server_content = server_content.replace(r'D:\\CyberJob_\\frontend', '/app')
    server_content = server_content.replace(r'D:/CyberJob_/frontend', '/app')
    server_content = server_content.replace('D:\\\\CyberJob_\\\\frontend', '/app')

    # 2. Inject dynamic path overrides after JSON.stringify(nextConfig)
    target_str = 'process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig)'
    patch_code = '''// Dynamic Linux path patch for Hostinger
nextConfig.outputFileTracingRoot = __dirname;
if (nextConfig.turbopack) {
  nextConfig.turbopack.root = __dirname;
}
if (nextConfig.experimental && nextConfig.experimental.turbopack) {
  nextConfig.experimental.turbopack.root = __dirname;
}
process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig)'''

    if target_str in server_content:
        server_content = server_content.replace(target_str, patch_code, 1)
    else:
        # Fallback if target string differs
        server_content = server_content.replace(
            "const { startServer }",
            "nextConfig.outputFileTracingRoot = __dirname;\nconst { startServer }"
        )

    return server_content

def main():
    root_dir = r"d:\CyberJob_\frontend"
    output_zip = r"d:\CyberJob_\FRONTEND-HOSTINGER.zip"
    stage_dir = tempfile.mkdtemp(prefix="hostinger-frontend-")

    standalone_src = os.path.join(root_dir, ".next", "standalone")
    dot_next_src = os.path.join(root_dir, ".next")
    static_src = os.path.join(root_dir, ".next", "static")
    public_src = os.path.join(root_dir, "public")

    if not os.path.exists(standalone_src):
        raise RuntimeError("No .next/standalone found. Run 'npm run build' first.")

    print(f"Staging deployment package to: {stage_dir}")

    # ── 1. Read & Patch server.js ──────────────────────────────────────────
    with open(os.path.join(standalone_src, "server.js"), "r", encoding="utf-8") as f:
        patched_server_code = patch_server_js(f.read())

    # Write patched server.js to root
    with open(os.path.join(stage_dir, "server.js"), "w", encoding="utf-8") as f:
        f.write(patched_server_code)

    # ── 2. Read dependencies from standalone package.json ─────────────────
    standalone_pkg_file = os.path.join(standalone_src, "package.json")
    deps = {}
    if os.path.exists(standalone_pkg_file):
        with open(standalone_pkg_file, "r", encoding="utf-8") as f:
            st_data = json.load(f)
            deps = st_data.get("dependencies", {})

    # Ensure critical dependencies are listed so `npm install` doesn't prune them
    base_deps = {
        "@react-oauth/google": "^0.13.5",
        "axios": "^1.19.0",
        "html2canvas": "^1.4.1",
        "js-cookie": "^3.0.8",
        "jspdf": "^4.2.1",
        "next": "^15.4.0",
        "react": "^19.1.0",
        "react-dom": "^19.1.0"
    }
    base_deps.update(deps)

    root_pkg_data = {
        "name": "cyberjob-frontend",
        "version": "1.0.0",
        "private": True,
        "scripts": {
            "build": "echo 'Prebuilt Next.js standalone application ready'",
            "start": "node server.js"
        },
        "dependencies": base_deps,
        "engines": {
            "node": ">=20"
        }
    }
    with open(os.path.join(stage_dir, "package.json"), "w", encoding="utf-8") as f:
        json.dump(root_pkg_data, f, indent=2)

    # ── 3. Copy node_modules to root ──────────────────────────────────────
    src_nm = os.path.join(standalone_src, "node_modules")
    if os.path.exists(src_nm):
        print("Copying standalone node_modules...")
        shutil.copytree(src_nm, os.path.join(stage_dir, "node_modules"))

    # ── 4. Copy .next contents to root .next ──────────────────────────────
    dst_next = os.path.join(stage_dir, ".next")
    os.makedirs(dst_next, exist_ok=True)

    # Copy server folder
    standalone_next_server = os.path.join(standalone_src, ".next", "server")
    if os.path.exists(standalone_next_server):
        shutil.copytree(standalone_next_server, os.path.join(dst_next, "server"))

    # Copy static folder
    if os.path.exists(static_src):
        shutil.copytree(static_src, os.path.join(dst_next, "static"))

    # Copy all manifest json files from .next
    for fname in os.listdir(dot_next_src):
        fpath = os.path.join(dot_next_src, fname)
        if os.path.isfile(fpath) and (fname.endswith(".json") or fname == "BUILD_ID"):
            shutil.copy2(fpath, os.path.join(dst_next, fname))

    # ── 5. Duplicate into .next/standalone for Hostinger Next.js validator ──
    # Hostinger checks if .next/standalone exists when Framework is Next.js!
    dst_standalone = os.path.join(dst_next, "standalone")
    os.makedirs(dst_standalone, exist_ok=True)

    # Write patched server.js inside .next/standalone
    with open(os.path.join(dst_standalone, "server.js"), "w", encoding="utf-8") as f:
        f.write(patched_server_code)

    with open(os.path.join(dst_standalone, "package.json"), "w", encoding="utf-8") as f:
        json.dump(root_pkg_data, f, indent=2)

    # Link/copy server and static under .next/standalone/.next
    dst_st_next = os.path.join(dst_standalone, ".next")
    os.makedirs(dst_st_next, exist_ok=True)
    if os.path.exists(standalone_next_server):
        shutil.copytree(standalone_next_server, os.path.join(dst_st_next, "server"))
    if os.path.exists(static_src):
        shutil.copytree(static_src, os.path.join(dst_st_next, "static"))

    # ── 6. Copy public assets ─────────────────────────────────────────────
    if os.path.exists(public_src):
        print("Copying public assets...")
        shutil.copytree(public_src, os.path.join(stage_dir, "public"))
        shutil.copytree(public_src, os.path.join(dst_standalone, "public"))

    # ── 7. Environment file ───────────────────────────────────────────────
    env_content = (
        "NODE_ENV=production\n"
        "PORT=3000\n"
        "NEXT_PUBLIC_API_URL=https://peru-dinosaur-201403.hostingersite.com/api\n"
        "NEXT_PUBLIC_OWNER_URL=https://chocolate-ibis-430598.hostingersite.com\n"
    )
    with open(os.path.join(stage_dir, ".env.production"), "w", encoding="utf-8") as f:
        f.write(env_content)
    with open(os.path.join(stage_dir, ".env"), "w", encoding="utf-8") as f:
        f.write(env_content)

    # ── 8. Create ZIP with POSIX permissions ──────────────────────────────
    print(f"Creating ZIP archive at {output_zip}...")
    if os.path.exists(output_zip):
        os.remove(output_zip)

    with zipfile.ZipFile(output_zip, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for dirpath, dirnames, filenames in os.walk(stage_dir):
            for dirname in dirnames:
                full_path = os.path.join(dirpath, dirname)
                rel_path = os.path.relpath(full_path, stage_dir).replace("\\", "/") + "/"
                zinfo = zipfile.ZipInfo(rel_path)
                zinfo.external_attr = 0o755 << 16 | 0x10  # rwxr-xr-x directory
                zf.writestr(zinfo, "")
            for filename in filenames:
                full_path = os.path.join(dirpath, filename)
                rel_path = os.path.relpath(full_path, stage_dir).replace("\\", "/")
                zinfo = zipfile.ZipInfo(rel_path)
                zinfo.external_attr = 0o644 << 16  # rw-r--r-- file
                with open(full_path, "rb") as fp:
                    zf.writestr(zinfo, fp.read())

    shutil.rmtree(stage_dir)
    size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    print(f"SUCCESS: {output_zip} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    main()
