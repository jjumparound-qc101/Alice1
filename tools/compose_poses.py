"""Compose whole-figure poses for Alice from the AI drawings.

The parts sheets have no skirt between the waist and the hem, so a free-jointed
puppet can't be assembled from them. Instead each pose here starts from the
standing Alice (turnaround, three-quarter view), keeps her down to the hem, and
puts other legs (with their own hem ruffles) behind the skirt.

Whole-figure drawings (DRAWN) are cut out with tools/whitecut.py and scaled to match.

Usage: python3 tools/compose_poses.py   -> public/art/ai/poses/<pose>.webp
Requires Pillow, NumPy and SciPy.
"""
import json
import os

import numpy as np
from PIL import Image

BASE = "public/art/ai/alice_stand.webp"   # 241 x 708, faces left
RIG = "public/art/ai/rig"
OUT = "public/art/ai/poses"

# Keep the standing Alice down to this fraction of her height (between hem tiers).
KEEP = 0.665
# Legs: scale relative to the part image, and where the part's top-left goes,
# in base pixels (x, y). Hems are matched by eye against tools/hem.png-style grids.
POSES = {
    "run_a": {"legs": "legs_run_a", "scale": 0.86, "at": (-74, 452)},
    "run_b": {"legs": "legs_run_b", "scale": 0.74, "at": (-60, 452)},
}


# Whole-figure drawings: source, height in pixels at the standing Alice's scale (708 px =
# her full height; matched by head size), and bodyX, the x in the scaled image that lines
# up with the standing figure's centre (her belt is ~20 px left of that centre).
DRAWN = {
    "walk_a": {"src": "source/ai/alice_walk_a.webp", "h": 700, "bodyX": 185},
    "jump": {"src": "source/ai/alice_jump.webp", "h": 751, "bodyX": 350},
}


def drawn(spec):
    import subprocess
    import sys
    import tempfile
    with tempfile.TemporaryDirectory() as d:
        subprocess.run([sys.executable, "tools/whitecut.py", spec["src"], f"{d}/cut.png"], check=True)
        img = Image.open(f"{d}/cut.png").convert("RGBA")
        img.load()
    return img.resize((round(img.width * spec["h"] / img.height), spec["h"]), Image.LANCZOS)


def compose(spec):
    base = Image.open(BASE).convert("RGBA")
    W, H = base.size
    top = base.crop((0, 0, W, round(H * KEEP)))
    # Soften the cut so it doesn't read as a ruled line across the skirt.
    a = np.asarray(top.split()[3], np.float32)
    fade = np.linspace(1, 0, 10)[:, None]
    a[-10:] *= fade
    top.putalpha(Image.fromarray(a.astype(np.uint8)))

    legs = Image.open(f"{RIG}/{spec['legs']}.webp").convert("RGBA")
    legs = legs.resize((round(legs.width * spec["scale"]), round(legs.height * spec["scale"])), Image.LANCZOS)
    lx, ly = spec["at"]
    # Canvas wide enough for both; feet rest on the bottom edge.
    x0 = min(0, lx)
    x1 = max(W, lx + legs.width)
    y1 = max(top.height, ly + legs.height)
    canvas = Image.new("RGBA", (x1 - x0, y1), (0, 0, 0, 0))
    # Paper backing where the two drawings meet, shaped like them (the union of both
    # silhouettes, slightly grown) over a band around the cut, so no gap shows.
    from scipy import ndimage as ndi
    cut = top.height
    sil = np.zeros((y1, x1 - x0), bool)
    sil[0:cut, -x0:-x0 + W] |= np.asarray(top.split()[3]) > 100
    sil[ly:ly + legs.height, lx - x0:lx - x0 + legs.width] |= np.asarray(legs.split()[3]) > 100
    sil = ndi.binary_fill_holes(ndi.binary_closing(sil, iterations=6))
    band = np.zeros_like(sil)
    band[cut - 40:cut + 30] = True
    back = np.zeros((y1, x1 - x0, 4), np.uint8)
    back[sil & band] = (0xEF, 0xE9, 0xDA, 255)
    canvas.alpha_composite(Image.fromarray(back))
    canvas.alpha_composite(legs, (lx - x0, ly))
    canvas.alpha_composite(top, (-x0, 0))
    return canvas, -x0


def main():
    os.makedirs(OUT, exist_ok=True)
    W, H = Image.open(BASE).size
    meta = {"base": {"w": W, "h": H}, "poses": {}}
    for name, spec in POSES.items():
        img, shift = compose(spec)
        img.save(f"{OUT}/{name}.webp", quality=90, method=6)
        # Where the body's centre line sits in the pose image, so the game can line poses up.
        meta["poses"][name] = {"w": img.size[0], "h": img.size[1], "bodyX": shift + W / 2}
        print(f"{name}: {img.size[0]}x{img.size[1]} (body centre shifted {shift}px)")
    for name, spec in DRAWN.items():
        img = drawn(spec)
        img.save(f"{OUT}/{name}.webp", quality=90, method=6)
        meta["poses"][name] = {"w": img.size[0], "h": img.size[1], "bodyX": spec["bodyX"]}
        print(f"{name}: {img.size[0]}x{img.size[1]} (drawn)")
    json.dump(meta, open(f"{OUT}/poses.json", "w"), indent=1)


if __name__ == "__main__":
    main()
