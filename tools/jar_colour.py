"""The ORANGE MARMALADE jar, coloured (owner, 2026-10-12): "it was labelled 'ORANGE MARMALADE',
but to her great disappointment it was empty".

The label's paper is tinted orange (the ink lettering kept); the glass is lightened and made
partly see-through so the jar reads as empty, with a thin orange smear left in the bottom.
The same sprite is used on the shelf and in her hand (src/scenes/shaft.js).

Usage: python3 tools/jar_colour.py   (reads public/art/ai/jar.webp -> public/art/ai/jar_orange.webp)
Requires Pillow and NumPy.
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ORANGE = np.array([0xE8, 0x86, 0x2A], np.float32)
PAPER = np.array([0xEF, 0xE9, 0xDA], np.float32)
# Regions in the 140x138 sprite, traced by eye: the label, the glass body, the smear.
LABEL = (20, 59, 110, 114)
BODY = (12, 47, 129, 134)
SMEAR = [(22, 126), (40, 121), (70, 123), (100, 120), (120, 125), (116, 131), (70, 132), (26, 131)]


def mask(size, shape, blur=1.5, poly=False):
    m = Image.new("L", size, 0)
    d = ImageDraw.Draw(m)
    (d.polygon if poly else d.rounded_rectangle)(shape, fill=255, **({} if poly else {"radius": 10}))
    return np.asarray(m.filter(ImageFilter.GaussianBlur(blur)), np.float32)[..., None] / 255.0


def main():
    im = Image.open("public/art/ai/jar.webp").convert("RGBA")
    a = np.asarray(im, np.float32)
    rgb, alpha = a[..., :3], a[..., 3:]
    tone = rgb.mean(2, keepdims=True) / PAPER.mean()          # 1 = paper, 0 = ink
    label, body, smear = mask(im.size, LABEL, 1), mask(im.size, BODY, 2), mask(im.size, SMEAR, 1.2, True)
    glass = body * (1 - label)
    # Glass: lift the dark hatching toward paper and let the wall show through.
    lifted = rgb + (PAPER - rgb) * 0.55
    rgb = rgb * (1 - glass) + lifted * glass
    alpha = alpha * (1 - glass * 0.35)
    # The smear in the bottom of the jar, over the glass.
    rgb = rgb * (1 - smear * 0.85) + (ORANGE * np.clip(tone + 0.25, 0, 1)) * smear * 0.85
    alpha = np.maximum(alpha, smear * 255 * 0.9 * (a[..., 3:] > 0))
    # Label: the paper orange, the lettering still ink.
    orange_paper = ORANGE * np.clip(tone, 0, 1) ** 1.2
    rgb = rgb * (1 - label) + orange_paper * label
    out = np.concatenate([np.clip(rgb, 0, 255), np.clip(alpha, 0, 255)], 2).astype(np.uint8)
    Image.fromarray(out, "RGBA").save("public/art/ai/jar_orange.webp", quality=92, method=6)
    print("public/art/ai/jar_orange.webp")


if __name__ == "__main__":
    main()
