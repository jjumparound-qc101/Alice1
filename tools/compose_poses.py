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
    # A phone screenshot (382x515): grey fade over the bottom and two buttons, removed
    # below. Interim until the full-size original is sent. Drawn facing right: mirrored.
    "walk_b": {"src": "source/ai/alice_walk_b_screenshot.png", "h": 620, "bodyX": 193, "mirror": True,
               "screenshot": {"fade_from": 430, "blank": [(0, 468, 58, 515), (336, 470, 382, 515)]}},
    # Chapter II (matched by eye against the standing Alice: dress, hands and head size).
    "feet": {"src": "source/ai/alice2_feet.webp", "h": 695, "bodyX": None},
    "longneck": {"src": "source/ai/alice2_longneck.webp", "h": 950, "bodyX": None},
    "stoop": {"src": "source/ai/alice2_stoop.webp", "h": 625, "bodyX": None},
    "cry_giant": {"src": "source/ai/alice2_cry_giant.webp", "h": 490, "bodyX": None},
    # Drawn facing right, lying along the floor: mirrored so she faces left like the others.
    "lie": {"src": "source/ai/alice2_lie.webp", "h": 235, "bodyX": None, "mirror": True},
    "fan": {"src": "source/ai/alice2_fan.webp", "h": 661, "bodyX": None},
    "recite": {"src": "source/ai/alice2_recite.webp", "h": 508, "bodyX": None},
    "glove": {"src": "source/ai/alice2_glove.webp", "h": 671, "bodyX": None},
    "drop_fan": {"src": "source/ai/alice2_drop_fan.webp", "h": 610, "bodyX": None},
    "kneel_back": {"src": "source/ai/alice2_kneel_back.webp", "h": 507, "bodyX": None},
    "slip": {"src": "source/ai/alice2_slip.webp", "h": 576, "bodyX": None},
    # Swimming: drawn down to the water line, reaching to the right: mirrored.
    "swim": {"src": "source/ai/alice2_swim.webp", "h": 192, "bodyX": None, "mirror": True},
    "swim_talk": {"src": "source/ai/alice2_swim_talk.webp", "h": 201, "bodyX": None, "mirror": True},
    # Chapter I.
    "fall": {"src": "source/ai/alice_fall.webp", "h": 698, "bodyX": None},
    "kneel": {"src": "source/ai/alice_kneel.webp", "h": 332, "bodyX": None, "mirror": True},
    "cry": {"src": "source/ai/alice_cry.webp", "h": 485, "bodyX": None},
    "eat": {"src": "source/ai/alice_eat.webp", "h": 753, "bodyX": None},
    "hold": {"src": "source/ai/alice_hold.webp", "h": 700, "bodyX": None},
    # Chapter III.
    "wet": {"src": "source/ai/alice3_wet.webp", "h": 700, "bodyX": None},
    "ring": {"src": "source/ai/alice3_ring.webp", "h": 500, "bodyX": None},
    "argue": {"src": "source/ai/alice3_argue.webp", "h": 700, "bodyX": None},
    "comfits": {"src": "source/ai/alice3_comfits.webp", "h": 700, "bodyX": None},
    "bow": {"src": "source/ai/alice3_bow.webp", "h": 625, "bodyX": None},
    "call": {"src": "source/ai/alice3_call.webp", "h": 680, "bodyX": None},
    "alone": {"src": "source/ai/alice3_alone.webp", "h": 500, "bodyX": None},
    "wonder": {"src": "source/ai/alice3_wonder.webp", "h": 700, "bodyX": None, "mirror": True},
    # Chapter I: on tiptoe, arms up (taller than standing: arms above her head).
    "reach": {"src": "source/ai/alice_reach.webp", "h": 800, "bodyX": None, "mirror": True},
}


def unscreenshot(src, spec, dst):
    """Make a screenshot of a drawing on white usable: lift the darkening fade back to
    white row by row (dividing by each row's background level) and blank the buttons."""
    g = np.asarray(Image.open(src).convert("L"), np.float32)
    for y in range(spec["fade_from"], g.shape[0]):
        bg = np.percentile(g[y], 90)
        g[y] = np.clip(g[y] * 255 / bg, 0, 255)
    for x0, y0, x1, y1 in spec["blank"]:
        g[y0:y1, x0:x1] = 255
    Image.fromarray(g.astype(np.uint8)).save(dst)


def drawn(spec):
    import subprocess
    import sys
    import tempfile
    with tempfile.TemporaryDirectory() as d:
        src = spec["src"]
        if "screenshot" in spec:
            unscreenshot(src, spec["screenshot"], f"{d}/clean.png")
            src = f"{d}/clean.png"
        subprocess.run([sys.executable, "tools/whitecut.py", src, f"{d}/cut.png"], check=True)
        img = Image.open(f"{d}/cut.png").convert("RGBA")
        img.load()
    if spec.get("mirror"):
        img = img.transpose(Image.FLIP_LEFT_RIGHT)
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
        meta["poses"][name] = {"w": img.size[0], "h": img.size[1], "bodyX": spec["bodyX"] or img.size[0] / 2}
        print(f"{name}: {img.size[0]}x{img.size[1]} (drawn)")
    json.dump(meta, open(f"{OUT}/poses.json", "w"), indent=1)


if __name__ == "__main__":
    main()
