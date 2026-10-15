"""The Queen's garden and croquet-ground (Chapters VIII-IX), after the book ("the bright flower-beds
and the cool fountains"; the croquet-ground "all ridges and furrows") and Tenniel's plates 8.1-8.3:
  garden_wall     the garden behind the ground (hedge-wall with arches, a fountain, the glasshouse dome,
                  trees), cut at the foot of the hedge; only the sky is cut away (flooded from the top),
                  so the arches keep the trees drawn through them
  garden_hedge    the same hedge without the fountain and dome (drawn from garden_wall, so the two match
                  edge for edge), repeated either side of it
  croquet_ground  the furrowed lawn, an opaque tile
  garden_lawn     the clipped lawn of the rest of the garden, an opaque tile (also the ground of outdoors())
  flower_bed, flower_pot, paint_pot   cut-outs (the paint snapped to the painted roses' red)

Usage: python3 tools/croquet_art.py   -> public/art/ai/ch8/<name>.webp
"""
import os
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

sys.path.insert(0, os.path.dirname(__file__))
from ch8_art import cut, PAPER, ROSE_RED  # noqa: E402

OUT = "public/art/ai/ch8"
WALL_FOOT = 840   # the foot of the hedge and the fountain's basin, in source pixels


def sky_cut(path, foot):
    """Cut away only the white connected to the top edge (the sky)."""
    rgb = np.asarray(Image.open(path).convert("RGB"), np.float32)[:foot]
    g = rgb.mean(-1)
    ink = g < 225
    disk = np.hypot(*np.mgrid[-2:3, -2:3]) <= 2
    ink = ndi.binary_closing(ink, structure=disk, border_value=0)
    lab, _ = ndi.label(~ink)
    top = np.unique(lab[0])
    sky = np.isin(lab, top[top > 0])
    out = g[..., None] / 255.0 * PAPER
    alpha = Image.fromarray((~sky * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    img = Image.fromarray(out.astype(np.uint8), "RGB").convert("RGBA")
    img.putalpha(alpha)
    return img


def opaque(path):
    g = np.asarray(Image.open(path).convert("L"), np.float32)
    return Image.fromarray((g[..., None] / 255.0 * PAPER).astype(np.uint8), "RGB")


def main():
    os.makedirs(OUT, exist_ok=True)
    for n in ("garden_wall", "garden_hedge"):
        sky_cut(f"source/ai/{n}.png", WALL_FOOT).save(f"{OUT}/{n}.webp", quality=88)
    for n in ("croquet_ground", "garden_lawn"):
        opaque(f"source/ai/{n}.png").save(f"{OUT}/{n}.webp", quality=88)
    for n in ("flower_bed", "flower_pot", "paint_pot"):
        img = cut(f"source/ai/{n}.png", ROSE_RED)
        img.save(f"{OUT}/{n}.webp", quality=90)
        print(f"{n}: {img.width}x{img.height}")


if __name__ == "__main__":
    main()
