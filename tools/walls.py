"""Paper-tint the AI wall drawings into repeating wall textures (Chapter I sets).

- shaft_side_wall -> walls/shaft_side.webp (repeats top to bottom; the shaft's side walls)
- passage_wall    -> walls/passage.webp    (repeats left to right; the landing and the long passage)
- passage_floor, passage_ceiling -> walls/passage_floor.webp, passage_ceiling.webp (repeat both ways)
- hall_wall       -> walls/hall.webp       (repeats left to right; behind the hall's doors). The
  drawing's wainscot fills nearly half its height, but the hall is 3.2 m high with knee-high
  panelling, so the drawing goes at the bottom and the plaster above is extended upward with
  its own plaster band, mirrored so it joins.

Usage: python3 tools/walls.py   -> public/art/ai/walls/*.webp
Requires Pillow and NumPy.
"""
import os

import numpy as np
from PIL import Image

PAPER = np.array([0xEF, 0xE9, 0xDA], np.float32)
OUT = "public/art/ai/walls"
HALL_H, HALL_TILE_W = 3.2, 3.0   # metres: the hall's height, and how wide one drawing is on the wall


def tint(img):
    g = np.asarray(img.convert("L"), np.float32)
    return Image.fromarray((g[..., None] / 255.0 * PAPER).astype(np.uint8), "RGB")


def main():
    os.makedirs(OUT, exist_ok=True)
    tint(Image.open("source/ai/shaft_side_wall.webp")).save(f"{OUT}/shaft_side.webp", quality=88, method=6)
    tint(Image.open("source/ai/passage_wall.webp")).save(f"{OUT}/passage.webp", quality=88, method=6)
    tint(Image.open("source/ai/passage_floor.webp")).save(f"{OUT}/passage_floor.webp", quality=88, method=6)
    tint(Image.open("source/ai/passage_ceiling.webp")).save(f"{OUT}/passage_ceiling.webp", quality=88, method=6)
    hall = tint(Image.open("source/ai/hall_wall.webp"))
    W, H = hall.size
    total = round(W * HALL_H / HALL_TILE_W)          # pixels for the full wall height
    plaster = hall.crop((0, 0, W, round(H * 0.5)))   # the plaster above the wainscot's top rail
    out = Image.new("RGB", (W, total))
    out.paste(hall, (0, total - H))
    y, flip = total - H, True
    while y > 0:
        band = plaster.transpose(Image.FLIP_TOP_BOTTOM) if flip else plaster
        y -= band.height
        out.paste(band, (0, y))
        flip = not flip
    out.paste(hall, (0, total - H))
    out.save(f"{OUT}/hall.webp", quality=88, method=6)
    for n in ("shaft_side", "passage", "passage_floor", "passage_ceiling", "hall"):
        print(f"{OUT}/{n}.webp", Image.open(f"{OUT}/{n}.webp").size)


if __name__ == "__main__":
    main()
