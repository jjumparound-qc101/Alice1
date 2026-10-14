"""Process the later Chapter I AI drawings (source/ai/) for the game.

- leaf_heap: cut out from white, paper-tinted (the heap of sticks and dry leaves).
- alice_land: Alice landing on the heap, with the leaves drawn (the drawing includes its own
  heap and flying leaves, so the game shows it in place of the heap at the landing).
- rabbit_sheet: the White Rabbit standing with his watch, trotting, and from behind (Chapter I).
- rabbit_run_away: the White Rabbit seen from behind, running off down the passage.
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

from white_rabbit import pink_eye, whiten

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


# "a White Rabbit with pink eyes" (COLOR.md): the eye of each sheet figure (x, y, radius in the
# cut-out image), its iris tinted the same pink as the Tenniel Rabbit's.
EYES = {"rabbit_watch": (140, 225, 12), "rabbit_trot": (95, 228, 12), "rabbit_back": (214, 216, 8)}
def red_hot(rgb, g):
    """The poker red-hot (COLOR.md): glowing at the tip, red along the first part of the shaft.
    The colour lies over the drawing, so the ink lines still show."""
    h, w = g.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    (x0, y0), (x1, y1) = (440, 418), (640, 512)  # the tip, and where the red fades (source pixels)
    dx, dy = x1 - x0, y1 - y0
    t = np.clip(((xx - x0) * dx + (yy - y0) * dy) / (dx * dx + dy * dy), -0.05, 1.2)
    dist = np.hypot(xx - (x0 + t * dx), yy - (y0 + t * dy))
    a = np.clip(1.3 - dist / 15, 0, 1) * np.clip(1 - t, 0, 1) ** 0.6
    red = np.array([0xF0, 0x38, 0x1A], np.float32)
    glow = np.array([0xFF, 0x9A, 0x3C], np.float32)
    col = red + (glow - red) * np.clip(1 - t * 3, 0, 1)[..., None]
    light = (g[..., None] / 255.0) * 0.6 + 0.4
    rgb[:] = rgb * (1 - a[..., None] * 0.95) + col * light * a[..., None] * 0.95


def main():
    os.makedirs(OUT, exist_ok=True)
    for n in ("leaf_heap", "alice_land", "rabbit_run_away"):  # (the Rabbit whitened below)
        src = next(f"source/ai/{n}.{e}" for e in ("png", "webp") if os.path.exists(f"source/ai/{n}.{e}"))
        img = shrink(whitecut(src).convert("RGBA"))
        if n.startswith("rabbit"):
            img = whiten(img)
        img.save(f"{OUT}/{n}.webp", quality=90, method=6)
        print(f"{OUT}/{n}.webp: {img.size[0]}x{img.size[1]}")
    # The White Rabbit sheet (three figures: watch, trotting, from behind), split and cut out.
    for n, (x0, x1) in {"rabbit_watch": (20, 376), "rabbit_trot": (384, 748), "rabbit_back": (781, 1105)}.items():
        with tempfile.TemporaryDirectory() as d:
            Image.open("source/ai/rabbit_sheet.webp").convert("RGB").crop((x0, 175, x1, 1135)).save(f"{d}/c.png")
            img = shrink(whitecut(f"{d}/c.png").convert("RGBA"))
        img = whiten(pink_eye(img, EYES[n]))  # the White Rabbit is white, not paper
        img.save(f"{OUT}/{n}.webp", quality=90, method=6)
        print(f"{OUT}/{n}.webp: {img.size[0]}x{img.size[1]}")
    # Thought vignettes (the same oval card treatment as Chapter II's).
    sys.path.insert(0, "tools")
    import ch2_art
    for n in ("dinah", "bats", "stairs", "histories", "knife", "poison"):
        ch2_art.vignette(f"vignette_{n}", n)
    ch2_art.vignette("vignette_poker", "poker", paint=red_hot)
    # The globe drawing has its caption printed under the oval: crop it off first.
    with tempfile.TemporaryDirectory() as d:
        Image.open("source/ai/vignette_globe.webp").crop((0, 0, 1254, 1100)).save(f"{d}/vignette_globe.png")
        own = ch2_art.src
        ch2_art.src = lambda name: f"{d}/{name}.png" if name == "vignette_globe" else own(name)
        ch2_art.vignette("vignette_globe", "globe")
        ch2_art.src = own
    # The garden inside the passage's far arch (source pixels, 1024x1536), paper-tinted.
    g = Image.open("source/ai/garden_through_door.png").convert("L").crop((392, 292, 806, 1080))
    rgb = (np.asarray(g, np.float32)[..., None] / 255.0 * PAPER).astype(np.uint8)
    Image.fromarray(rgb, "RGB").save(f"{OUT}/garden.webp", quality=90, method=6)
    print(f"{OUT}/garden.webp: {g.size[0]}x{g.size[1]}")


if __name__ == "__main__":
    main()
