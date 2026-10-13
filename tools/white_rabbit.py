"""The White Rabbit is white (COLOR.md rule 8, owner 2026-10-13): his drawings are not tinted to
the paper colour like everything else, so he stands out from the page and the other figures.

whiten(img) undoes the paper tint on an RGBA image: the paper colour becomes pure white, ink
stays ink, and his pink eyes stay pink. Used by tools/ch1_art.py and tools/ch2_art.py on every
Rabbit drawing; run as a script it makes the white copy of the Tenniel Rabbit cut-out.

Usage: python3 tools/white_rabbit.py   (public/art/rabbit_w01-1.png -> public/art/rabbit_w01-1_white.png)
Requires Pillow and NumPy.
"""
import numpy as np
from PIL import Image

PAPER = np.array([0xEF, 0xE9, 0xDA], np.float32)


PINK = np.array([0xF2, 0x55, 0x8F], np.float32)


def pink_eye(img, eye):
    """'a White Rabbit with pink eyes' (COLOR.md): tint the dark iris pink around eye = (x, y, r)
    in image pixels, keeping its shading; the highlight and the white of the eye stay."""
    a = np.asarray(img.convert("RGBA"), np.float32).copy()
    x, y, r = eye
    yy, xx = np.mgrid[:a.shape[0], :a.shape[1]]
    near = np.clip(1 - (np.hypot(xx - x, yy - y) - r * 0.6) / (r * 0.4), 0, 1)[..., None]
    tone = a[..., :3].mean(2, keepdims=True) / PAPER.mean()
    k = near * np.clip((0.8 - tone) / 0.45, 0, 1) * 0.9
    a[..., :3] = a[..., :3] * (1 - k) + PINK * np.clip(tone + 0.6, 0, 1) * k
    return Image.fromarray(a.astype(np.uint8), "RGBA")


def whiten(img):
    a = np.asarray(img.convert("RGBA"), np.float32).copy()
    a[..., :3] = np.clip(a[..., :3] * (255.0 / PAPER), 0, 255)
    return Image.fromarray(a.astype(np.uint8), "RGBA")


if __name__ == "__main__":
    whiten(Image.open("public/art/rabbit_w01-1.png")).save("public/art/rabbit_w01-1_white.png", optimize=True)
    print("public/art/rabbit_w01-1_white.png")
