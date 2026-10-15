"""The court of justice (Chapters XI-XII), after the book and Tenniel's frontispiece (the trial,
source/plates/tenniel_frontispiece_trial_gutenberg.png): the walls, floor and ceiling, the throne
under its canopy, the table with the dish of tarts, the jury-box, the witness-box and the door.

Drawn with their hearts flat red, so the cut-outs keep colour like the court cards (ch8_art.cut:
card red snapped to the game's suit red). The walls, floor and ceiling are opaque tiles:
  court_wall    two window bays cut out of the drawing so it repeats along the walls
  court_floor   the flagstones, repeated both ways
  court_ceiling the beams, repeated both ways
The jury-box and witness-box are cut in two: the front (its panel and rail, and the corner posts)
stands before the jurors or the witness; the whole drawing stands behind them, so its back panel
(and the witness-box's chair) shows over their shoulders.

Usage: python3 tools/court_art.py   -> public/art/ai/ch11/<name>.webp
"""
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from ch8_art import cut, PAPER, SUIT_RED  # noqa: E402

OUT = "public/art/ai/ch11"
CUTS = ["court_throne", "court_table", "court_jury_box", "court_witness_box", "court_door"]
# The front pieces: everything below the top of the front rail, plus the corner posts above it
# (fractions of the cut-out's width and height, measured on the drawings).
FRONT = {
    "court_jury_box": {"rail": 0.31, "posts": [(0.0, 0.058), (0.94, 1.0)]},
    "court_witness_box": {"rail": 0.2, "posts": [(0.0, 0.17), (0.685, 1.0)]},
}


def tint(path, crop=None):
    """An opaque drawing on the game's paper, the hearts snapped to the suit red."""
    rgb = np.asarray(Image.open(path).convert("RGB"), np.float32)
    if crop:
        x0, y0, x1, y1 = crop
        rgb = rgb[y0:y1, x0:x1]
    g = rgb.mean(-1)
    mx, mn = rgb.max(-1), rgb.min(-1)
    sat = (mx - mn) / np.maximum(mx, 1)
    out = g[..., None] / 255.0 * PAPER
    red = (sat > 0.2) & (rgb[..., 0] > 120) & (rgb[..., 1] < 0.55 * rgb[..., 0]) & (rgb[..., 2] < 0.55 * rgb[..., 0])
    shade = (rgb[..., 0] / 255.0)[..., None]
    out[red] = (SUIT_RED * np.clip(shade * 1.15, 0.3, 1.0))[red]
    return Image.fromarray(out.astype(np.uint8), "RGB")


def period(path, guess, lo=0.9, hi=1.1):
    """The wall's window bay, in pixels: the shift near `guess` at which the drawing best matches itself."""
    g = np.asarray(Image.open(path).convert("L"), np.float32)
    best = None
    for p in range(int(guess * lo), int(guess * hi)):
        d = np.abs(g[:, p:] - g[:, :-p]).mean()
        if best is None or d < best[0]:
            best = (d, p)
    return best[1]


def front_piece(img, spec):
    a = np.asarray(img).copy()
    H, W = a.shape[:2]
    keep = np.zeros((H, W), bool)
    keep[int(spec["rail"] * H):] = True
    for u0, u1 in spec["posts"]:
        keep[:, int(u0 * W):int(u1 * W)] = True
    a[..., 3] = np.where(keep, a[..., 3], 0)
    return Image.fromarray(a, "RGBA")


def main():
    os.makedirs(OUT, exist_ok=True)
    for n in CUTS:
        img = cut(f"source/ai/{n}.png")
        img.save(f"{OUT}/{n}.webp", quality=90)
        print(f"{n}: {img.width}x{img.height}")
        if n in FRONT:
            front_piece(img, FRONT[n]).save(f"{OUT}/{n}_front.webp", quality=90)
    # The wall: two window bays from the middle of the drawing, so it repeats seamlessly.
    p = period("source/ai/court_wall.png", 508)
    W = Image.open("source/ai/court_wall.png").width
    x0 = (W - 2 * p) // 2
    wall = tint("source/ai/court_wall.png", (x0, 0, x0 + 2 * p, 1024))
    wall.save(f"{OUT}/court_wall.webp", quality=90)
    print(f"court_wall: bay {p}px, tile {wall.width}x{wall.height}")
    for n in ("court_floor", "court_ceiling"):
        tint(f"source/ai/{n}.png").save(f"{OUT}/{n}.webp", quality=90)


if __name__ == "__main__":
    main()
