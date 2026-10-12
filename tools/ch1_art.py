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
PINK = np.array([0xF2, 0x55, 0x8F], np.float32)


def pink_eye(img, eye):
    a = np.asarray(img, np.float32).copy()
    x, y, r = eye
    yy, xx = np.mgrid[:a.shape[0], :a.shape[1]]
    near = np.clip(1 - (np.hypot(xx - x, yy - y) - r * 0.6) / (r * 0.4), 0, 1)[..., None]
    tone = a[..., :3].mean(2, keepdims=True) / PAPER.mean()
    # The dark iris goes pink (keeping its shading); the paper and the pupil's highlight stay.
    k = near * np.clip((0.8 - tone) / 0.45, 0, 1) * 0.9
    a[..., :3] = a[..., :3] * (1 - k) + PINK * np.clip(tone + 0.6, 0, 1) * k
    return Image.fromarray(a.astype(np.uint8), "RGBA")


def main():
    os.makedirs(OUT, exist_ok=True)
    for n in ("leaf_heap", "alice_land", "rabbit_run_away"):
        src = next(f"source/ai/{n}.{e}" for e in ("png", "webp") if os.path.exists(f"source/ai/{n}.{e}"))
        img = shrink(whitecut(src).convert("RGBA"))
        img.save(f"{OUT}/{n}.webp", quality=90, method=6)
        print(f"{OUT}/{n}.webp: {img.size[0]}x{img.size[1]}")
    # The White Rabbit sheet (three figures: watch, trotting, from behind), split and cut out.
    for n, (x0, x1) in {"rabbit_watch": (20, 376), "rabbit_trot": (384, 748), "rabbit_back": (781, 1105)}.items():
        with tempfile.TemporaryDirectory() as d:
            Image.open("source/ai/rabbit_sheet.webp").convert("RGB").crop((x0, 175, x1, 1135)).save(f"{d}/c.png")
            img = shrink(whitecut(f"{d}/c.png").convert("RGBA"))
        img = pink_eye(img, EYES[n])
        img.save(f"{OUT}/{n}.webp", quality=90, method=6)
        print(f"{OUT}/{n}.webp: {img.size[0]}x{img.size[1]}")
    # Thought vignettes (the same oval card treatment as Chapter II's).
    sys.path.insert(0, "tools")
    import ch2_art
    for n in ("dinah", "bats", "stairs"):
        ch2_art.vignette(f"vignette_{n}", n)
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
