"""Process the Duchess's and the Mock Turtle's AI drawings (source/ai/) for the game.

All of a character's drawings were generated at the same size, so each pose's height in the game
is its drawn height in source pixels times one scale per character (printed as `px`). For the
Mock Turtle, `drop` is how much of the drawing hangs below his hooves (his tail), as a fraction
of its height, so he sits on a ledge or the sand on his hooves.

- The Mock Turtle (Chapters IX, X): mockturtle_ledge_norock (sitting; the rock taken out so he
  sits on the seashore set's own ledge), _sob, _count, _hide, _dance, _sing, _yawn.
- The Duchess (Chapters VI, IX; output to ch6/): duchess_toss, duchess_fling, duchess9_arm,
  duchess9_tremble, duchess9_run (duchess_nurse is done by ch6_art.py).

Usage: python3 tools/ch9_art.py   -> public/art/ai/ch9/mockturtle_*.webp, public/art/ai/ch6/duchess_*.webp
Requires Pillow, NumPy and SciPy.
"""
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image

TURTLE = {"mockturtle_ledge_norock": "mockturtle_sit", **{f"mockturtle_{p}": f"mockturtle_{p}" for p in
          ("sob", "count", "hide", "dance", "sing", "yawn")}}
DUCHESS = ["duchess_nurse", "duchess_toss", "duchess_fling", "duchess9_arm", "duchess9_tremble", "duchess9_run"]


def cut(name, out, width=600):
    src = f"source/ai/{name}.png"
    with tempfile.TemporaryDirectory() as d:
        subprocess.run([sys.executable, "tools/whitecut.py", src, f"{d}/c.png"], check=True, stdout=subprocess.DEVNULL)
        img = Image.open(f"{d}/c.png").convert("RGBA")
    a = np.asarray(img)[..., 3] > 128
    h = img.height
    if out:
        img.resize((width, round(img.height * width / img.width)), Image.LANCZOS).save(out, quality=90, method=6)
    return a, h


def hooves(a):
    """Bottom of the hooves: the lowest row much wider than the tail."""
    widths = a.sum(axis=1)
    for y in range(len(widths) - 1, 0, -1):
        if widths[y] > 0.25 * a.shape[1]:
            return y
    return len(widths) - 1


def main():
    os.makedirs("public/art/ai/ch9", exist_ok=True)
    for name, out in TURTLE.items():
        a, h = cut(name, f"public/art/ai/ch9/{out}.webp")
        print(f"{out}: px {h}, drop {(h - hooves(a)) / h:.3f}")
    for name in DUCHESS:
        _, h = cut(name, f"public/art/ai/ch6/{name}.webp" if name != "duchess_nurse" else None, 700)
        print(f"{name}: px {h}")


if __name__ == "__main__":
    main()
