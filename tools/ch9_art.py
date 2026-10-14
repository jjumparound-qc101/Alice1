"""Process Chapter IX's AI drawings (source/ai/) for the game.

- mockturtle_ledge_norock: the Mock Turtle sitting sad and lonely, his tail hanging over the edge
  he sits on (generated from mockturtle_ledge.png with the rock taken out, so he sits on the
  seashore set's own rock). Prints where his hooves are, as a fraction of the height (the
  puppet's `drop`).

Usage: python3 tools/ch9_art.py   -> public/art/ai/ch9/mockturtle_sit.webp
Requires Pillow, NumPy and SciPy.
"""
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image

OUT = "public/art/ai/ch9"
HOOVES = 1012  # bottom of the hooves, in source pixels


def main():
    os.makedirs(OUT, exist_ok=True)
    src = "source/ai/mockturtle_ledge_norock.png"
    with tempfile.TemporaryDirectory() as d:
        subprocess.run([sys.executable, "tools/whitecut.py", src, f"{d}/c.png"], check=True, stdout=subprocess.DEVNULL)
        cut = Image.open(f"{d}/c.png").convert("RGBA")
    g = np.asarray(Image.open(src).convert("L"))
    ys = np.nonzero((g < 225).any(axis=1))[0]
    top, bottom = max(0, ys.min() - 2), min(g.shape[0], ys.max() + 3)
    img = cut.resize((600, round(cut.height * 600 / cut.width)), Image.LANCZOS)
    img.save(f"{OUT}/mockturtle_sit.webp", quality=90, method=6)
    print(f"{OUT}/mockturtle_sit.webp: {img.size[0]}x{img.size[1]}, drop {(bottom - HOOVES) / (bottom - top):.3f}")


if __name__ == "__main__":
    main()
