"""A book's toy-theatre front (proscenium) for the theatre opening (src/theatre.js).

Paper-tinted; the stage opening (flood-filled from a point inside it) made transparent;
everything else opaque, the white corners included, so nothing of the set shows around the
frame. The title is lettered on the blank banner here (AI lettering is unreliable), in the
engine's font. Writes OUT.webp and OUT.json ({"size": [w, h], "opening": [x0, y0, x1, y1]},
in pixels), which the book's loadArt passes to the theatre.

Usage (from the book's folder):
  python3 engine/tools/proscenium.py source/ai/proscenium.png public/art/ai/proscenium.webp \\
      --text "A CHRISTMAS@620,171,24" --text "CAROL@905,171,24" [--inside 768,560]
  --text TEXT@x,y[,size]: one line of lettering centred on (x, y) in source pixels (repeatable)
"""
import argparse
import json
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

PAPER = np.array([0xEF, 0xE9, 0xDA], np.float32)
INK = (0x17, 0x14, 0x0F)
FONT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "fonts", "IMFeENrm28P.ttf")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("out")
    ap.add_argument("--text", action="append", default=[])
    ap.add_argument("--inside", default=None, help="x,y of a point in the stage opening (default: the centre)")
    a = ap.parse_args()
    src = Image.open(a.src).convert("L")
    g = np.asarray(src, np.float32)
    w, h = src.size
    ink = Image.fromarray(((g < 225) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    inside = tuple(map(int, a.inside.split(","))) if a.inside else (w // 2, int(h * 0.55))
    ImageDraw.floodfill(ink, inside, 128)
    hole = np.asarray(ink) == 128
    ys, xs = np.nonzero(hole)
    opening = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
    print(f"opening: x {opening[0]}-{opening[2]}, y {opening[1]}-{opening[3]} of {src.size}")
    alpha = Image.fromarray(((~hole) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    rgb = Image.fromarray((g[..., None] / 255 * PAPER).astype(np.uint8), "RGB")
    d = ImageDraw.Draw(rgb)
    for t in a.text:
        text, at = t.rsplit("@", 1)
        x, y, *size = map(float, at.split(","))
        d.text((x, y), text, font=ImageFont.truetype(FONT, int(size[0]) if size else 21), fill=INK, anchor="mm")
    out = rgb.convert("RGBA")
    out.putalpha(alpha)
    os.makedirs(os.path.dirname(a.out) or ".", exist_ok=True)
    out.save(a.out, quality=90, method=6)
    json.dump({"size": [w, h], "opening": opening}, open(os.path.splitext(a.out)[0] + ".json", "w"))
    print(a.out, out.size)


if __name__ == "__main__":
    main()
