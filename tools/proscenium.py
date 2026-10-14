"""The toy-theatre front (proscenium) for the riverbank's opening shot (Chapters I, XII).

Paper-tinted; the stage opening (flood-filled from its centre) made transparent; everything
else opaque, the white corners included, so nothing of the set shows around the frame. The
title is lettered on the blank banner here (AI lettering is unreliable), in the game's font.

Usage: python3 tools/proscenium.py   -> public/art/ai/proscenium.webp (prints the opening, in pixels)
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

PAPER = np.array([0xEF, 0xE9, 0xDA], np.float32)
INK = (0x17, 0x14, 0x0F)
BANNER = (520, 118, 1012, 196)  # the blank banner, source pixels


def main():
    src = Image.open("source/ai/proscenium.png").convert("L")
    g = np.asarray(src, np.float32)
    ink = Image.fromarray(((g < 225) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    ImageDraw.floodfill(ink, (768, 560), 128)
    hole = np.asarray(ink) == 128
    ys, xs = np.nonzero(hole)
    print(f"opening: x {xs.min()}-{xs.max()}, y {ys.min()}-{ys.max()} of {src.size}")
    alpha = Image.fromarray(((~hole) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    rgb = Image.fromarray((g[..., None] / 255 * PAPER).astype(np.uint8), "RGB")
    d = ImageDraw.Draw(rgb)
    x0, y0, x1, y1 = BANNER
    # One line, low on the banner (the Cat's paws rest on its top edge).
    font = ImageFont.truetype("public/fonts/IMFeENrm28P.ttf", 21)
    d.text(((x0 + x1) / 2, 172), "ALICE’S ADVENTURES IN WONDERLAND", font=font, fill=INK, anchor="mm")
    out = rgb.convert("RGBA"); out.putalpha(alpha)
    out.save("public/art/ai/proscenium.webp", quality=90, method=6)
    print("public/art/ai/proscenium.webp", out.size)


if __name__ == "__main__":
    main()
