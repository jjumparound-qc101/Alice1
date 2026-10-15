"""The seashore (Chapters IX-X), after the book ("the Mock Turtle sitting sad and lonely on a little
ledge of rock"; the Gryphon "lying fast asleep in the sun") and Tenniel's plates 9.2, 9.3 and 10.1:
  seashore    the sea to the horizon, cut off at the horizon (the game's sky is above it), repeated (mirrored)
              along the far distance
  sea_tile    the sea's surface, an opaque tile out to the backdrop
  sand        the beach, an opaque tile
  surf        the little waves on the sand at the water's edge, cut off at the horizon (the white foam and
              sand touch the sky through gaps, so a flood from the sky would eat them)
  bank_sunny  the grassy bank behind the sleeping Gryphon, cut off at the horizon the same way
  rock_ledge  the tall rock with the ledge, cut out (the ledge's top measured on it: LEDGE in sets/seashore.js)

Usage: python3 tools/seashore_art.py   -> public/art/ai/ch9/<name>.webp
"""
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from ch8_art import cut, PAPER  # noqa: E402

OUT = "public/art/ai/ch9"


def opaque(path):
    g = np.asarray(Image.open(path).convert("L"), np.float32)
    return Image.fromarray((g[..., None] / 255.0 * PAPER).astype(np.uint8), "RGB")


def horizon_cut(path):
    """Everything above the horizon (the first nearly solid ink row from the top) made transparent."""
    g = np.asarray(Image.open(path).convert("L"), np.float32)
    rows = np.nonzero((g < 200).mean(1) > 0.6)[0]
    top = int(rows[0])
    out = (g[top:, :, None] / 255.0 * PAPER).astype(np.uint8)
    return Image.fromarray(out, "RGB"), top


def main():
    os.makedirs(OUT, exist_ok=True)
    for n in ("sea_tile", "sand"):
        opaque(f"source/ai/{n}.png").save(f"{OUT}/{n}.webp", quality=88)
    for n in ("seashore", "surf", "bank_sunny"):
        img, top = horizon_cut(f"source/ai/{n}.png")
        img.save(f"{OUT}/{n}.webp", quality=88)
        print(f"{n}: horizon at row {top}, {img.width}x{img.height}")
    rock = cut("source/ai/rock_ledge.png")
    rock.save(f"{OUT}/rock_ledge.webp", quality=90)
    print(f"rock_ledge: {rock.width}x{rock.height}")


if __name__ == "__main__":
    main()
