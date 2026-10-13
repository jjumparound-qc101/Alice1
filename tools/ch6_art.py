"""Process Chapter VI's AI drawings (source/ai/) for the game.

- cheshire_bough: the Cheshire Cat lying along a bough, grinning (gpt-image-2.5-sunburst).
- cheshire_bough_empty: the same bough without him (generated from the first), so the bough
  stays when he vanishes.
Both are cut out on the same full canvas so they line up exactly, plus a third layer with only
the grin, for "a grin without a cat".

Usage: python3 tools/ch6_art.py   -> public/art/ai/ch6/cheshire_{bough,bough_empty,grin}.webp
Requires Pillow, NumPy and SciPy.
"""
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = "public/art/ai/ch6"
W = 1200  # output width (sources are 1536x1024)
GRIN = (418, 462, 582, 512)  # the mouth, in source pixels


def cut_full(path):
    """whitecut, pasted back on the source's full canvas (whitecut crops to the drawing)."""
    with tempfile.TemporaryDirectory() as d:
        subprocess.run([sys.executable, "tools/whitecut.py", path, f"{d}/c.png"], check=True, stdout=subprocess.DEVNULL)
        cut = Image.open(f"{d}/c.png").convert("RGBA")
    src = Image.open(path).convert("L")
    ys, xs = np.nonzero(np.asarray(src) < 225)
    full = Image.new("RGBA", src.size, (0, 0, 0, 0))
    full.paste(cut, (max(0, xs.min() - 2), max(0, ys.min() - 2)))
    return full


def save(img, name):
    img = img.resize((W, round(img.height * W / img.width)), Image.LANCZOS)
    img.save(f"{OUT}/{name}.webp", quality=90, method=6)
    print(f"{OUT}/{name}.webp: {img.size[0]}x{img.size[1]}")


def main():
    os.makedirs(OUT, exist_ok=True)
    cat = cut_full("source/ai/cheshire_bough.png")
    save(cat, "cheshire_bough")
    save(cut_full("source/ai/cheshire_bough_empty.png"), "cheshire_bough_empty")
    m = Image.new("L", cat.size, 0)
    ImageDraw.Draw(m).ellipse(GRIN, fill=255)
    grin = cat.copy()
    a = np.asarray(grin, np.float32).copy()
    a[..., 3] *= np.asarray(m.filter(ImageFilter.GaussianBlur(3)), np.float32) / 255.0
    save(Image.fromarray(a.astype(np.uint8), "RGBA"), "cheshire_grin")


if __name__ == "__main__":
    main()
