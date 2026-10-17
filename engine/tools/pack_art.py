"""Pack a web build's pictures into a few files, for the playable web link.

A web link (a claude.ai artifact) holds at most 511 files and 15 MB per binary file, and a book has
hundreds of pictures. This stores every picture under DIST/art/ in uncompressed .zip packs of at most
--max-mb each (DIST/packs/art01.zip, ...; the pictures are already compressed), in path order so each
place's pictures sit together, and writes DIST/packs/index.json: for each picture's path, its pack,
the offset of its bytes and their length. The game (src/packs.js) loads each pack once and makes the
pictures from it; the packed files are removed from DIST, and DIST/index.html names the index
(window.ART_PACKS), so a build without packs never asks for one. Anything else (audio, words, .json)
stays loose. Run by web_build.sh; the desktop build doesn't use it.

Usage: python3 engine/tools/pack_art.py DIST [--max-mb 14]
"""
import argparse
import json
import os
import struct
import zipfile

TYPES = {".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dist")
    ap.add_argument("--max-mb", type=float, default=14)
    a = ap.parse_args()
    limit = int(a.max_mb * 1024 * 1024)
    pictures = []
    for root, _, names in os.walk(os.path.join(a.dist, "art")):
        for n in names:
            if os.path.splitext(n)[1].lower() in TYPES:
                p = os.path.join(root, n)
                pictures.append((os.path.relpath(p, a.dist).replace(os.sep, "/"), p))
    pictures.sort()
    groups, cur, size = [], [], 0
    for rel, p in pictures:
        s = os.path.getsize(p)
        if s > limit:
            print(f"left loose (larger than a pack): {rel}")
            continue
        if cur and size + s > limit:
            groups.append(cur)
            cur, size = [], 0
        cur.append((rel, p))
        size += s
    if cur:
        groups.append(cur)
    os.makedirs(os.path.join(a.dist, "packs"), exist_ok=True)
    index = {"files": {}}
    for i, group in enumerate(groups):
        name = f"art{i + 1:02d}.zip"
        path = os.path.join(a.dist, "packs", name)
        with zipfile.ZipFile(path, "w", zipfile.ZIP_STORED) as z:
            for rel, p in group:
                z.write(p, rel)
        # Where each picture's bytes begin: after its local header (30 bytes, its name, any extra field).
        with zipfile.ZipFile(path) as z, open(path, "rb") as f:
            for info in z.infolist():
                f.seek(info.header_offset)
                head = f.read(30)
                n, m = struct.unpack("<HH", head[26:30])
                index["files"][info.filename] = {"pack": name, "at": info.header_offset + 30 + n + m,
                                                 "size": info.file_size,
                                                 "type": TYPES[os.path.splitext(info.filename)[1].lower()]}
        for _, p in group:
            os.remove(p)
        print(f"packs/{name}: {len(group)} pictures, {os.path.getsize(path) / 1e6:.1f} MB")
    with open(os.path.join(a.dist, "packs", "index.json"), "w") as f:
        json.dump(index, f, separators=(",", ":"))
    page = os.path.join(a.dist, "index.html")
    with open(page, encoding="utf-8") as f:
        html = f.read()
    if "window.ART_PACKS" not in html:
        html = html.replace("<script", "<script>window.ART_PACKS = 'packs/index.json';</script>\n  <script", 1)
        with open(page, "w", encoding="utf-8") as f:
            f.write(html)
    for root, dirs, names in os.walk(os.path.join(a.dist, "art"), topdown=False):
        if not dirs and not names:
            os.rmdir(root)
        elif not os.listdir(root):
            os.rmdir(root)
    total = sum(len(fs) for _, _, fs in os.walk(a.dist))
    print(f"{len(index['files'])} pictures in {len(groups)} packs; {total} files in {a.dist}")


if __name__ == "__main__":
    main()
