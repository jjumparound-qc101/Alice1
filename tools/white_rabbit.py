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


def whiten(img):
    a = np.asarray(img.convert("RGBA"), np.float32).copy()
    a[..., :3] = np.clip(a[..., :3] * (255.0 / PAPER), 0, 255)
    return Image.fromarray(a.astype(np.uint8), "RGBA")


if __name__ == "__main__":
    whiten(Image.open("public/art/rabbit_w01-1.png")).save("public/art/rabbit_w01-1_white.png", optimize=True)
    print("public/art/rabbit_w01-1_white.png")
