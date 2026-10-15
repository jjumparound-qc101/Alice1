"""The wood and the mushroom (Chapters IV-V), and the Rabbit's yard and room (Chapter IV), after the book
and Tenniel's plates 4.4 and 5.1: the thistle, the buttercup, the mushroom and the two bits Alice breaks
off it, the treetops (the "sea of green leaves", coloured green, COLOR.md), the tall grass of the wood,
the ladders, the cart and the barrow, the pebbles and the little cakes they turn into, and the table
with the fan and gloves. Drawings of several things (pebbles, cakes, bits) are split into one file each,
left to right.

Usage: python3 tools/wood_art.py   -> public/art/ai/ch4/<name>.webp, public/art/ai/ch5/<name>.webp
"""
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

sys.path.insert(0, os.path.dirname(__file__))
from ch8_art import cut  # noqa: E402

CUTS = {"ch4": ["thistle", "buttercup", "ladders", "cart_barrow", "table_gloves", "table_empty", "wood_grass"], "ch5": ["mushroom"]}
SPLIT = {"ch4": {"pebbles": "pebble", "little_cakes": "cake"}, "ch5": {"mushroom_bits": "mushroom_bit"}}
LEAF, LEAF_INK = np.array([0x7F, 0xAE, 0x5A], np.float32), np.array([0x1E, 0x2C, 0x16], np.float32)  # SPOT.leaf


def split(img, stem, out):
    """One file per separate thing in the drawing, numbered left to right."""
    a = np.asarray(img)[..., 3] > 40
    lab, n = ndi.label(ndi.binary_dilation(a, iterations=6))
    boxes = sorted(ndi.find_objects(lab), key=lambda b: b[1].start)
    for k, (ys, xs) in enumerate(boxes, 1):
        img.crop((xs.start, ys.start, xs.stop, ys.stop)).save(f"{out}/{stem}_{k}.webp", quality=90)
    print(f"{stem}: {len(boxes)} pieces")


def main():
    for ch, names in CUTS.items():
        os.makedirs(f"public/art/ai/{ch}", exist_ok=True)
        for n in names:
            img = cut(f"source/ai/{n}.png")
            img.save(f"public/art/ai/{ch}/{n}.webp", quality=90)
            print(f"{n}: {img.width}x{img.height}")
    for ch, names in SPLIT.items():
        for n, stem in names.items():
            split(cut(f"source/ai/{n}.png"), stem, f"public/art/ai/{ch}")
    # The treetops: green leaves, the ink lines a dark green (an opaque tile).
    g = np.asarray(Image.open("source/ai/treetops.png").convert("L"), np.float32)[..., None] / 255.0
    Image.fromarray((g * LEAF + (1 - g) * LEAF_INK).astype(np.uint8), "RGB").save("public/art/ai/ch5/treetops.webp", quality=88)


if __name__ == "__main__":
    main()
