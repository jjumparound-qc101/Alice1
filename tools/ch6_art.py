"""Process Chapter VI's AI drawings (source/ai/) for the game.

- cheshire_bough: the Cheshire Cat lying along a bough, grinning (gpt-image-2.5-sunburst).
- cheshire_bough_empty: the same bough without him (generated from the first), so the bough
  stays when he vanishes.
Both are cut out on the same full canvas so they line up exactly, plus a third layer with only
the grin, for "a grin without a cat".

- cheshire_hearth: the Cat sitting on the kitchen hearth (from cheshire_bough).
- duchess_nurse: the Duchess sitting, nursing the howling baby (from plate 6.2; her skirts hide the stool).
- The Footmen (fish_footman, frog_footman, frog_footman_sit, footmen_bow), the Cook (cook_stir,
  cook_throw), the baby (baby_starfish, baby_snout), the pig (pig_trot): cut out; each figure's
  height in source pixels is printed (`px`), for scaling poses of one character alike.
- kitchen_back: the kitchen's back wall, cropped to the wall (the game has its own floor).

Usage: python3 tools/ch6_art.py   -> public/art/ai/ch6/cheshire_{bough,bough_empty,grin,hearth}.webp, duchess_nurse.webp
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


def save(img, name, w=W):
    img = img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)
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
    for name, w in (("cheshire_hearth", 600), ("duchess_nurse", 700), ("fish_footman", 600), ("frog_footman", 600),
                    ("frog_footman_sit", 700), ("footmen_bow", 1000), ("cook_stir", 700), ("cook_throw", 600),
                    ("baby_starfish", 500), ("baby_snout", 500), ("pig_trot", 500)):
        with tempfile.TemporaryDirectory() as d:
            subprocess.run([sys.executable, "tools/whitecut.py", f"source/ai/{name}.png", f"{d}/c.png"], check=True, stdout=subprocess.DEVNULL)
            img = Image.open(f"{d}/c.png").convert("RGBA")
            print(f"  {name}: px {img.height}")
            save(img, name, w)
    with tempfile.TemporaryDirectory() as d:
        Image.open("source/ai/kitchen_back.png").convert("RGB").crop((0, 30, 1536, 894)).save(f"{d}/k.png")
        subprocess.run([sys.executable, "tools/whitecut.py", f"{d}/k.png", f"{OUT}/kitchen_back.png", "--opaque"], check=True, stdout=subprocess.DEVNULL)
    Image.open(f"{OUT}/kitchen_back.png").save(f"{OUT}/kitchen_back.webp", quality=88, method=6)
    os.remove(f"{OUT}/kitchen_back.png")
    print(f"{OUT}/kitchen_back.webp")


if __name__ == "__main__":
    main()
