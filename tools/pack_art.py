"""Pack a web build's pictures into a few files, for the playable web link.

A web link (a claude.ai artifact) holds at most 511 files, 15 MB per binary file and 16 MB per text file,
and serves only web file types (no archives such as .zip), while a book has hundreds of pictures. This
stores every picture under DIST/art/ in a few .json data files (DIST/packs/art01.json, ...: each picture's
bytes in base64, by path; at most --max-mb of pictures each, so the file stays under 16 MB), in path order
so each place's pictures sit together, and writes DIST/packs/index.json: for each picture's path, its pack
and type. The game (src/packs.js) reads the packs one at a time and makes the pictures from them; the
packed files are removed from DIST, and DIST/index.html names the index (window.ART_PACKS), so a build
without packs never asks for one. Anything else (audio, words, .json) stays loose. Run by web_build.sh;
the desktop build doesn't use it.

With a record of the pictures each chapter shows (DIST/data/art_usage.json, from engine/tools/art_usage.mjs,
copied there from the book's public/data/), the pictures are packed by the first chapter that shows them
(chapter 1's first, a new pack at each chapter, unused pictures last), and the index carries each picture's
size and that record (`usage`), so the game loads each chapter's pictures only when it is opened.

Usage: python3 engine/tools/pack_art.py DIST [--max-mb 11]
"""
import argparse
import base64
import json
import os

from PIL import Image

TYPES = {".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dist")
    ap.add_argument("--max-mb", type=float, default=11)
    a = ap.parse_args()
    limit = int(a.max_mb * 1024 * 1024)
    pictures = []
    for root, _, names in os.walk(os.path.join(a.dist, "art")):
        for n in names:
            if os.path.splitext(n)[1].lower() in TYPES:
                p = os.path.join(root, n)
                pictures.append((os.path.relpath(p, a.dist).replace(os.sep, "/"), p))
    pictures.sort()
    # By chapter, when the book has a record of the pictures each chapter shows: each picture with the
    # first chapter that shows it, a new pack at each chapter; otherwise all in path order.
    usage_path = os.path.join(a.dist, "data", "art_usage.json")
    usage = json.load(open(usage_path)) if os.path.exists(usage_path) else None
    known = {rel for rel, _ in pictures}
    if usage:
        usage = {n: [u.replace("./", "", 1) if u.startswith("./") else u for u in paths] for n, paths in usage.items()}
        first = {}
        for n in sorted(usage, key=int):
            for u in usage[n]:
                first.setdefault(u, int(n))
        runs = [[pp for pp in pictures if first.get(pp[0]) == n] for n in sorted({*first.values()})]
        runs.append([pp for pp in pictures if pp[0] not in first])
    else:
        runs = [pictures]
    groups = []
    for run in runs:
        cur, size = [], 0
        for rel, p in run:
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
        name = f"art{i + 1:02d}.json"
        files = {}
        for rel, p in group:
            with open(p, "rb") as f:
                files[rel] = base64.b64encode(f.read()).decode("ascii")
            with Image.open(p) as im:
                w, h = im.size
            index["files"][rel] = {"pack": name, "type": TYPES[os.path.splitext(rel)[1].lower()], "size": [w, h]}
        path = os.path.join(a.dist, "packs", name)
        with open(path, "w") as f:
            json.dump({"files": files}, f, separators=(",", ":"))
        for _, p in group:
            os.remove(p)
        print(f"packs/{name}: {len(group)} pictures, {os.path.getsize(path) / 1e6:.1f} MB")
    if usage:
        index["usage"] = {n: [u for u in paths if u in index["files"]] for n, paths in usage.items()}
        for n in sorted(usage, key=int):
            mb = sum(os.path.getsize(os.path.join(a.dist, "packs", pk)) for pk in {index["files"][u]["pack"] for u in index["usage"][n]}) / 1e6
            print(f"chapter {n}: {len(index['usage'][n])} pictures in packs of {mb:.1f} MB")
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
