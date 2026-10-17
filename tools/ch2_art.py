"""Process the Chapter II AI drawings (source/ai/) for the game.

Figures and props are cut out from white and paper-tinted (tools/whitecut.py), then saved
as WebP, scaled down to at most MAX px on the long side. The pool's water is kept opaque
(a tile); the shore is kept opaque. Thought vignettes are cropped to the oval card used by
src/thoughts.js (512x360 proportions), masked to the oval and outlined in ink; the
terrier's hair is coloured brown (COLOR.md, Chapter II).

Usage: python3 tools/ch2_art.py   -> public/art/ai/ch2/*.webp, public/art/ai/vignettes/*.webp
Requires Pillow, NumPy and SciPy.
"""
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


SRC = "source/ai"
OUT = "public/art/ai/ch2"
VIG = "public/art/ai/vignettes"
MAX = 900
PAPER = np.array([0xEF, 0xE9, 0xDA], np.float32)
INK = (0x1C, 0x18, 0x14, 255)
BROWN = np.array([0x9A, 0x62, 0x32], np.float32)  # SPOT.brown in src/props.js

# The Rabbit's Chapter II poses are now drawn from the Chapter I model and processed by tools/rabbit_art.py
# (owner, 2026-10-14); the old drawings stay in source/ai/rabbit2_*.webp.
CUT = ["mouse_swim", "mouse_leap", "mouse_bristle", "mouse_away",
       "duck_swim", "duck_stand", "dodo_swim", "dodo_stand",
       "lory_swim", "lory_stand", "eaglet_swim", "eaglet_stand",
       "kid_gloves", "splash"]
OPAQUE = ["pool_water", "pool_shore"]
# Vignettes: source name -> output name. Drawings that aren't ovals already are fitted
# inside the oval (FIT) rather than cropped by it.
FIT = {"foot_parcel", "ada_mabel", "terrier"}
VIGNETTES = {
    "vignette_foot_parcel": "foot_parcel", "vignette_ada_mabel": "ada_mabel",
    "vignette_crocodile": "crocodile", "vignette_seaside": "seaside",
    "vignette_walrus": "walrus", "vignette_dinah_fire": "dinah_fire",
    "vignette_terrier": "terrier",
}


def src(name):
    for ext in ("webp", "png"):
        p = f"{SRC}/{name}.{ext}"
        if os.path.exists(p):
            return p
    raise FileNotFoundError(name)


def shrink(img, m=MAX):
    k = m / max(img.size)
    return img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS) if k < 1 else img


def whitecut(path, *args):
    with tempfile.TemporaryDirectory() as d:
        subprocess.run([sys.executable, "engine/tools/whitecut.py", path, f"{d}/o.png", *args], check=True, stdout=subprocess.DEVNULL)
        img = Image.open(f"{d}/o.png")
        img.load()
    return img


def vignette(name, out, paint=None):
    """Paper-tint, crop to the drawing and lay it on an oval card in the drawing's own shape (owner,
    2026-10-17: each thought bubble fits its picture; the game's bubble draws the oval's outline).
    paint(rgb, g): optional, colours the paper-tinted drawing in place (source pixels)."""
    g = np.asarray(Image.open(src(name)).convert("L"), np.float32)
    rgb = g[..., None] / 255.0 * PAPER
    if paint:
        paint(rgb, g)
    if out == "terrier":
        # The dog's hair brown: blend paper toward brown inside the figure, keep the ink.
        from scipy import ndimage as ndi
        ink = g < 225
        closed = ndi.binary_closing(ink, iterations=3)
        lab, _ = ndi.label(~closed)
        border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
        inside = ~np.isin(lab, border[border > 0])
        inside = ndi.binary_dilation(inside, iterations=2)
        tone = g[..., None] / 255.0
        brown = tone * (BROWN * 0.55 + PAPER * 0.45)
        rgb = np.where(inside[..., None], brown, rgb)
    img = Image.fromarray(rgb.astype(np.uint8), "RGB")
    # The drawing's box (non-white). Most are drawn as oval vignettes, so the card is their own oval;
    # free-standing figures (FIT) get an oval round them, with room for the box's corners.
    ys, xs = np.nonzero(g < 230)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    grow = 1.3 if out in FIT else 1.02
    bw, bh = (x1 - x0) * grow, (y1 - y0) * grow
    # No slivers: the shape kept between 0.6 and 2.2 wide to tall (as the game's bubbles, thoughts.js).
    bw, bh = max(bw, bh * 0.6), max(bh, bw / 2.2)
    a = bw / bh
    box = (round(cx - bw / 2), round(cy - bh / 2), round(cx + bw / 2), round(cy + bh / 2))
    pad = Image.new("RGB", img.size, tuple(int(v) for v in PAPER))
    pad.paste(img)
    W, H = (1024, round(1024 / a)) if a >= 1 else (round(1024 * a), 1024)
    card = Image.new("RGB", (round(bw), round(bh)), tuple(int(v) for v in PAPER))
    card.paste(pad.crop((max(0, box[0]), max(0, box[1]), min(img.width, box[2]), min(img.height, box[3]))),
               (max(0, -box[0]), max(0, -box[1])))
    card = card.resize((W, H), Image.LANCZOS).convert("RGBA")
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).ellipse((2, 2, W - 3, H - 3), fill=255)
    card.putalpha(mask.filter(ImageFilter.GaussianBlur(1)))
    card.save(f"{VIG}/{out}.webp", quality=90, method=6)
    print(f"{VIG}/{out}.webp: {W}x{H}")


def main():
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(VIG, exist_ok=True)
    for n in CUT:
        # The angry Mouse: a wider seal keeps his fur closed; clear the white between the
        # whiskers and the paw.
        args = ["--seal", "4", "--clear", "421,599"] if n == "mouse_bristle" else []
        img = shrink(whitecut(src(n), *args).convert("RGBA"))
        img.save(f"{OUT}/{n}.webp", quality=90, method=6)
        print(f"{OUT}/{n}.webp: {img.size[0]}x{img.size[1]}")
    for n in OPAQUE:
        g = np.asarray(Image.open(src(n)).convert("L"), np.float32)
        img = shrink(Image.fromarray((g[..., None] / 255.0 * PAPER).astype(np.uint8), "RGB"), 1536)
        img.save(f"{OUT}/{n}.webp", quality=88, method=6)
        print(f"{OUT}/{n}.webp: {img.size[0]}x{img.size[1]} (opaque)")
    # The shore's band of stones (the floor's edge rising from the water), without the doors
    # and table leg drawn above it: the game's own hall stands behind. Cut out along the top
    # of the stones; the water below is dropped (the pool is drawn by the game).
    shore = Image.open(f"{OUT}/pool_shore.webp").convert("RGB")
    W, H = shore.size
    band = shore.crop((0, round(H * 0.335), W, round(H * 0.712))).convert("RGBA")
    # The stones' top edge, traced by hand (x, y in band pixels at 1500 px wide).
    edge = [(0, 18), (100, 26), (430, 48), (512, 92), (940, 146), (975, 158), (1262, 192), (1500, 214)]
    k = W / 1500
    a = Image.new("L", band.size, 0)
    ImageDraw.Draw(a).polygon([(x * k, y * k) for x, y in edge] + [(W, band.height), (0, band.height)], fill=255)
    a = np.asarray(a)
    band.putalpha(Image.fromarray(a).filter(ImageFilter.GaussianBlur(1.5)))
    band.save(f"{OUT}/pool_rim.webp", quality=88, method=6)
    os.remove(f"{OUT}/pool_shore.webp")  # only the band is used
    print(f"{OUT}/pool_rim.webp: {band.size[0]}x{band.size[1]}")
    for n, out in VIGNETTES.items():
        vignette(n, out)


if __name__ == "__main__":
    main()
