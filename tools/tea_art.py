"""The Mad Tea-Party (Chapter VII), after the book ("a table set out under a tree in front of the house";
"a large arm-chair at one end of the table"; "it's laid for a great many more than three") and Tenniel's
plates 7.1-7.3. The arm-chair, the tree with the door and the teapot are drawn from Alice's own drawings
(alice7_chair, alice7_treedoor) and the Dormouse's (dormouse_teapot), so they match when one stands in
for the other; the first two are mirrored as those poses are (tools/compose_poses.py).
  tea_cloth   the table's hanging cloth, repeated along the table
  the rest    cut-outs

Usage: python3 tools/tea_art.py   -> public/art/ai/ch7/<name>.webp
"""
import os
import sys

import numpy as np
from PIL import Image, ImageOps

sys.path.insert(0, os.path.dirname(__file__))
from ch8_art import cut, PAPER  # noqa: E402

OUT = "public/art/ai/ch7"
NAMES = ["tea_cloth", "tea_armchair", "tree_door", "teacup", "teapot", "milk_jug", "plate_bread"]
MIRROR = {"tea_armchair", "tree_door"}
CLOTH_X = (0.158, 0.832)   # the middle of the cloth, which repeats fold to fold
CLOTH_HEM = 0.875          # just above the lowest wave of the hem


def cloth_tile(path):
    """The cloth as a solid strip: from its top seam to just above the hem's lowest wave (the hem lines have
    gaps, so cutting the white below them leaks into the cloth), the middle of the cloth only, fold to fold."""
    g = np.asarray(Image.open(path).convert("L"), np.float32)
    H, W = g.shape
    g = g[:, int(CLOTH_X[0] * W):int(CLOTH_X[1] * W)]
    rows = np.nonzero((g < 225).mean(1) > 0.5)[0]                 # the top seam: the first nearly solid ink row
    top = int(rows[0]) if len(rows) and rows[0] < H // 4 else 0
    out = g[top:int(CLOTH_HEM * H), :, None] / 255.0 * PAPER
    return Image.fromarray(out.astype(np.uint8), "RGB")


def main():
    os.makedirs(OUT, exist_ok=True)
    for n in NAMES:
        img = cloth_tile(f"source/ai/{n}.png") if n == "tea_cloth" else cut(f"source/ai/{n}.png")
        if n in MIRROR:
            img = ImageOps.mirror(img)
        img.save(f"{OUT}/{n}.webp", quality=90)
        print(f"{n}: {img.width}x{img.height}")


if __name__ == "__main__":
    main()
