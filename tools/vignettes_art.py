"""The rest of the thought vignettes (Chapters I, III-V, VII-XII) and the last small props, 2026-10-15.

Vignettes go through tools/ch2_art.py's vignette() (paper tint, the oval card, its outline). Coloured
ones keep the colour the text gives: the soup green ("Beautiful Soup, so rich and green") and the
Lobster brown (COLOR.md); their coloured pixels are snapped to the game's spot colours.
Props are cut out; drawings of several things are split into one file each, left to right.

Usage: python3 tools/vignettes_art.py   -> public/art/ai/vignettes/<name>.webp, public/art/ai/props/<name>.webp
"""
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from ch2_art import vignette  # noqa: E402
from ch8_art import cut  # noqa: E402
from wood_art import split  # noqa: E402

VIGNETTES = ["antipodes", "dinah_down", "dream", "shakespeare", "knot", "dinah_birds", "dinah_nurse", "book",
             "chrysalis", "eggs", "raven", "concert", "bat", "treacle", "tulips", "tempers", "pigs_fly",
             "sea_school", "masters", "lobsters_sea", "whiting_snail", "whitings", "lobster_glass",
             "owl_panther", "soup", "refreshments", "slates", "goldfish", "country_sounds", "grown_alice"]
SPOT = {"soup": np.array([0x6F, 0x9A, 0x2E], np.float32), "lobster_glass": np.array([0x9A, 0x62, 0x32], np.float32)}
PROPS = ["comfits", "thimble", "hatter_watch_close", "jury_box_tipped", "chapter1_end"]
SPLIT = {"court_papers": "court_paper", "dead_leaves": "dead_leaf"}
OUT = "public/art/ai/props"


def keep_colour(name, spot):
    """paint() for vignette(): the drawing's coloured pixels in the spot colour, shaded by their lightness."""
    def paint(rgb, g):
        src = np.asarray(Image.open(f"source/ai/vignette_{name}.png").convert("RGB"), np.float32)
        mx, mn = src.max(-1), src.min(-1)
        col = (mx - mn) / np.maximum(mx, 1) > 0.2
        shade = np.clip(g / 255.0 * 1.15, 0.25, 1.0)[..., None]
        rgb[col] = (spot * shade)[col]
    return paint


def main():
    os.makedirs(OUT, exist_ok=True)
    for n in VIGNETTES:
        vignette(f"vignette_{n}", n, keep_colour(n, SPOT[n]) if n in SPOT else None)
    for n in PROPS:
        img = cut(f"source/ai/{n}.png")
        img.save(f"{OUT}/{n}.webp", quality=90)
        print(f"{n}: {img.width}x{img.height}")
    for n, stem in SPLIT.items():
        split(cut(f"source/ai/{n}.png"), stem, OUT)


if __name__ == "__main__":
    main()
