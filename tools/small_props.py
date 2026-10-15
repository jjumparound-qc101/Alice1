"""Prepare the small AI prop drawings (Chapter I asset list v2, prompts 23-26; Chapter II,
prompt 28) for the game.

  golden_key       cut out, turned to lie bow-left, and coloured gold (COLOR.md: "a tiny
                   golden key"): ink becomes a dark gold, paper a bright gold
  drink_me_bottle  cut out
  eat_me_cake      cut out
  glass_box        cut out; the glass is see-through: pale pixels inside the box fade out
                   while the engraved lines stay
  fan              cut out

Usage: python3 tools/small_props.py   -> public/art/ai/props/*.webp + props.json (sizes)
Requires Pillow, NumPy and SciPy (tools/whitecut.py does the cutting).
"""
import json
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image

SRC = "source/ai"
OUT = "public/art/ai/props"
GOLD_DARK = np.array([0x6a, 0x45, 0x08], np.float32)
GOLD = np.array([0xeb, 0xb4, 0x20], np.float32)
GOLD_LIGHT = np.array([0xff, 0xe2, 0x7a], np.float32)


def whitecut(name, *args, max_side=768):
    with tempfile.TemporaryDirectory() as d:
        subprocess.run([sys.executable, "engine/tools/whitecut.py", f"{SRC}/{name}.webp", f"{d}/out.png", *args], check=True)
        img = Image.open(f"{d}/out.png").convert("RGBA")
        img.load()
    k = min(1, max_side / max(img.size))
    return img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS) if k < 1 else img


def gold(img):
    a = np.asarray(img, np.float32)
    l = a[..., :3].mean(axis=2, keepdims=True) / 235.0  # 0 ink .. 1 paper
    l = np.clip(l, 0, 1)
    rgb = np.where(l < 0.6, GOLD_DARK + (GOLD - GOLD_DARK) * (l / 0.6), GOLD + (GOLD_LIGHT - GOLD) * ((l - 0.6) / 0.4))
    return Image.fromarray(np.concatenate([rgb, a[..., 3:]], axis=2).astype(np.uint8), "RGBA")


def glassy(img, floor=0.25):
    # Paper-pale pixels become mostly transparent (glass); ink keeps full opacity.
    a = np.asarray(img, np.float32)
    l = a[..., :3].mean(axis=2) / 235.0
    k = np.clip((l - 0.55) / 0.4, 0, 1)                  # 0 for ink, 1 for paper
    a[..., 3] *= 1 - k * (1 - floor)
    return Image.fromarray(a.astype(np.uint8), "RGBA")


def main():
    os.makedirs(OUT, exist_ok=True)
    out = {
        "key": gold(whitecut("golden_key", "--clear", "620,320;500,330;760,330").rotate(90, expand=True)),  # the bow is open
        "bottle": whitecut("drink_me_bottle"),
        "cake": whitecut("eat_me_cake"),
        "box": glassy(whitecut("glass_box")),
        "fan": whitecut("fan"),
    }
    meta = {}
    for name, img in out.items():
        img.save(f"{OUT}/{name}.webp", quality=90)
        meta[name] = {"w": img.width, "h": img.height}
        print(f"{OUT}/{name}.webp {img.width}x{img.height}")
    json.dump(meta, open(f"{OUT}/props.json", "w"), indent=1)


if __name__ == "__main__":
    main()
