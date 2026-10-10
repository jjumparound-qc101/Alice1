"""Prepare the AI drawings for the hall (Chapter I asset list v2) for the game.

  hall_floor   tiling flagstones: paper-tinted, kept opaque
  hall_lamp    hanging lamp: cut out
  low_curtain  the low curtain on its rod: cut out
  little_door  split along the traced arches into the frame (which stays on the wall)
               and the door leaf (which swings open on its hinges), same scale

Usage: python3 tools/hall_props.py   -> public/art/ai/hall/*.webp + hall.json
Requires Pillow, NumPy and SciPy (tools/whitecut.py does the cutting).
"""
import json
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SRC = "source/ai"
OUT = "public/art/ai/hall"
PAPER = np.array([0xEF, 0xE9, 0xDA], np.float32)


def whitecut(name, *args, max_side=1024):
    with tempfile.TemporaryDirectory() as d:
        subprocess.run([sys.executable, "tools/whitecut.py", f"{SRC}/{name}.webp", f"{d}/out.png", *args], check=True)
        img = Image.open(f"{d}/out.png")
        img.load()
    k = min(1, max_side / max(img.size))
    return img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS) if k < 1 else img


# The little door's arches, traced on the 1086x1448 drawing: each side of a pointed arch
# is a cubic curve from the springing point (where the straight side ends) to the apex.
def _bez(p0, p1, p2, p3, n=40):
    t = np.linspace(0, 1, n)[:, None]
    p = [np.array(v, float) for v in (p0, p1, p2, p3)]
    return (1 - t) ** 3 * p[0] + 3 * (1 - t) ** 2 * t * p[1] + 3 * (1 - t) * t ** 2 * p[2] + t ** 3 * p[3]


def arch(left, right, bottom, spring, apex, cx=545, bulge=0.55, c2=(0.45, 0.12)):
    w, h = cx - left, spring - apex
    L = _bez((left, spring), (left, spring - h * bulge), (cx - w * c2[0], apex + h * c2[1]), (cx, apex))
    R = _bez((cx, apex), (cx + (right - cx) * c2[0], apex + h * c2[1]), (right, spring - h * bulge), (right, spring))
    return [(left, bottom)] + [tuple(p) for p in L] + [tuple(p) for p in R] + [(right, bottom)]


OUTER = arch(236, 856, 1150, 520, 192, bulge=0.4, c2=(0.6, 0.3))  # outside of the frame
INNER = arch(322, 772, 1146, 560, 298)                              # the door leaf


def little_door():
    g = np.asarray(Image.open(f"{SRC}/little_door.webp").convert("L"), np.float32)
    rgb = (g[..., None] / 255.0) * PAPER

    def mask(poly):
        m = Image.new("L", (g.shape[1], g.shape[0]), 0)
        ImageDraw.Draw(m).polygon(poly, fill=255)
        return np.asarray(m.filter(ImageFilter.GaussianBlur(0.8)), np.float32)

    outer, inner = mask(OUTER), mask(INNER)
    box = (236, 192, 856, 1150)  # the frame's extent: both pieces share this frame of reference
    frame = np.dstack([rgb, np.clip(outer - inner, 0, 255)])
    leaf = np.dstack([rgb, inner])
    lbox = (322, 298, 772, 1146)
    for name, arr, b in (("door_frame", frame, box), ("door_leaf", leaf, lbox)):
        Image.fromarray(arr.astype(np.uint8), "RGBA").crop(b).save(f"{OUT}/{name}.webp", quality=90, method=6)
    W, H = box[2] - box[0], box[3] - box[1]
    # The leaf's place inside the frame, as fractions of the frame's width and height.
    return {"frame": {"w": W, "h": H},
            "leaf": {"x0": (lbox[0] - box[0]) / W, "x1": (lbox[2] - box[0]) / W, "top": (lbox[1] - box[1]) / H,
                     # The leaf's outline as fractions of its own box (u right, v down), to clip
                     # the garden seen through the open door to the same arch.
                     "arch": [[round((x - lbox[0]) / (lbox[2] - lbox[0]), 4), round((y - lbox[1]) / (lbox[3] - lbox[1]), 4)]
                              for x, y in INNER[::2] + [INNER[-1]]]}}


def main():
    os.makedirs(OUT, exist_ok=True)
    meta = {}
    floor = whitecut("hall_floor", "--opaque")
    floor.save(f"{OUT}/floor.webp", quality=88, method=6)
    # Clear the enclosed gaps that should show what's behind: between the lamp's chains and
    # under its shade, and between the curtain's rod and its gathered top.
    clear = {
        "hall_lamp": "430,600;575,500;300,1100;720,1100",
        "low_curtain": ";".join(f"{x},255" for x in (250, 470, 690, 915, 1115, 1245, 1325)),
    }
    for name, out in (("hall_lamp", "lamp"), ("low_curtain", "curtain")):
        img = whitecut(name, "--clear", clear[name], max_side=768)
        img.save(f"{OUT}/{out}.webp", quality=90, method=6)
        meta[out] = {"w": img.width, "h": img.height}
    meta["door"] = little_door()
    json.dump(meta, open(f"{OUT}/hall.json", "w"), indent=1)
    print(json.dumps(meta))


if __name__ == "__main__":
    main()
