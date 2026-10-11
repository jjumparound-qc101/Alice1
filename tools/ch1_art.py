"""Process the later Chapter I AI drawings (source/ai/) for the game.

- leaf_heap: cut out from white, paper-tinted (the heap of sticks and dry leaves).
- alice_land: Alice landing on the heap, with the leaves drawn (the drawing includes its own
  heap and flying leaves, so the game shows it in place of the heap at the landing).
- garden_through_door: drawn looking along the little passage; only the garden seen inside
  the far arch is kept (the game draws its own little door and clips the view to its arch).

Usage: python3 tools/ch1_art.py   -> public/art/ai/ch1/*.webp
Requires Pillow, NumPy and SciPy.
"""
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image

OUT = "public/art/ai/ch1"
PAPER = np.array([0xEF, 0xE9, 0xDA], np.float32)
MAX = 1200


def shrink(img, m=MAX):
    k = m / max(img.size)
    return img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS) if k < 1 else img


def whitecut(path, *args):
    with tempfile.TemporaryDirectory() as d:
        subprocess.run([sys.executable, "tools/whitecut.py", path, f"{d}/o.png", *args], check=True, stdout=subprocess.DEVNULL)
        img = Image.open(f"{d}/o.png")
        img.load()
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    for n in ("leaf_heap", "alice_land"):
        img = shrink(whitecut(f"source/ai/{n}.png").convert("RGBA"))
        img.save(f"{OUT}/{n}.webp", quality=90, method=6)
        print(f"{OUT}/{n}.webp: {img.size[0]}x{img.size[1]}")
    # The garden inside the passage's far arch (source pixels, 1024x1536), paper-tinted.
    g = Image.open("source/ai/garden_through_door.png").convert("L").crop((392, 292, 806, 1080))
    rgb = (np.asarray(g, np.float32)[..., None] / 255.0 * PAPER).astype(np.uint8)
    Image.fromarray(rgb, "RGB").save(f"{OUT}/garden.webp", quality=90, method=6)
    print(f"{OUT}/garden.webp: {g.size[0]}x{g.size[1]}")


if __name__ == "__main__":
    main()
