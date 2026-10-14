"""The court cards (Chapters VIII-XII): the Queen, King, Knave of Hearts and the executioner; and the
gardeners Two, Five and Seven of Spades (fully drawn, pips checked by eye; red paint on the brush).

They are drawn with their hearts already flat red (and the Queen's and King's face flushes in
colour), so this cut-out keeps colour: ink and white are paper-tinted as usual, coloured pixels
keep their colour, and playing-card red is snapped to the game's suit red (SPOT.suitRed).
Prints each figure's height in source pixels (px) for scaling poses alike.

Usage: python3 tools/ch8_art.py   -> public/art/ai/ch8/<name>.webp
"""
import os

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

OUT = "public/art/ai/ch8"
PAPER = np.array([0xEF, 0xE9, 0xDA], np.float32)
SUIT_RED = np.array([0xC8, 0x22, 0x22], np.float32)
NAMES = ["queen_stand", "queen_point", "queen_flush", "queen_stamp", "queen_folded", "queen_specs", "queen_purple",
         "king_stand", "king_judge", "king_judge_specs", "king_judge_fold", "king_judge_point", "king_judge_pale",
         "knave_carry", "knave_stand", "knave_chains", "executioner",
         *[f"{c}_{p}" for c in ("two", "five", "seven") for p in ("stand", "paint", "bow", "run")], "two_kneel",
         "rose_tree", "rose_white", "rose_red", "card_back",
         "suit_heart", "suit_diamond", "suit_club", "suit_spade", "body_soldier", "body_courtier", "body_child", "body_officer", "card_arch",
         *[f"{r}_{s}" for r in ("king", "queen") for s in ("clubs", "diamonds", "spades")], "knave_spades"]


CRIMSON = np.array([0xA3, 0x12, 0x3A], np.float32)  # "turned crimson with fury" (SPOT.crimson)
ROSE_RED = np.array([0xD8, 0x28, 0x3A], np.float32)  # the painted roses (SPOT.rose)


def cut(path, red_as=SUIT_RED):
    rgb = np.asarray(Image.open(path).convert("RGB"), np.float32)
    g = rgb.mean(-1)
    mx, mn = rgb.max(-1), rgb.min(-1)
    sat = (mx - mn) / np.maximum(mx, 1)
    ink = (g < 225) | (sat > 0.2)
    disk = np.hypot(*np.mgrid[-2:3, -2:3]) <= 2
    ink = ndi.binary_closing(ink, structure=disk, border_value=0)
    lab, _ = ndi.label(~ink)
    border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    fg = ~np.isin(lab, border[border > 0])
    out = g[..., None] / 255.0 * PAPER
    col = sat > 0.2
    red = col & (rgb[..., 0] > 120) & (rgb[..., 1] < 0.55 * rgb[..., 0]) & (rgb[..., 2] < 0.55 * rgb[..., 0])
    # Coloured pixels keep their colour, laid on the paper; card red snapped to the suit red,
    # keeping the drawing's shading (lightness) so hatched hearts still show their lines.
    out[col] = rgb[col] * (PAPER / 255.0)
    shade = (rgb[..., 0] / 255.0)[..., None]
    out[red] = (red_as * np.clip(shade * 1.15, 0.3, 1.0))[red]
    alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    ys, xs = np.nonzero(fg)
    box = (max(0, xs.min() - 2), max(0, ys.min() - 2), min(fg.shape[1], xs.max() + 3), min(fg.shape[0], ys.max() + 3))
    img = Image.fromarray(out.astype(np.uint8), "RGB").convert("RGBA")
    img.putalpha(alpha)
    return img.crop(box)


def face_rect(img):
    """The blank card face of a crowd body: the largest plain white region inside the figure, as
    fractions (u0, v0, u1, v1) of the cut-out image. The game prints the pips inside it."""
    a = np.asarray(img, np.float32)
    white = (a[..., 3] > 200) & (a[..., :3].mean(-1) > 215)
    white = ndi.binary_opening(white, iterations=3)
    lab, n = ndi.label(white)
    sizes = ndi.sum(white, lab, range(1, n + 1))
    k = int(np.argmax(sizes)) + 1
    ys, xs = np.nonzero(lab == k)
    H, W = white.shape
    return tuple(round(v, 3) for v in (xs.min() / W, ys.min() / H, xs.max() / W, ys.max() / H))


def main():
    os.makedirs(OUT, exist_ok=True)
    for n in NAMES:
        img = cut(f"source/ai/{n}.png", {"queen_flush": CRIMSON, "rose_red": ROSE_RED}.get(n, SUIT_RED))
        print(f"{n}: px {img.height}")
        if n.startswith("body_"):
            print(f"  face {face_rect(img)}")
        img.resize((600, round(img.height * 600 / img.width)), Image.LANCZOS).save(f"{OUT}/{n}.webp", quality=90, method=6)


if __name__ == "__main__":
    main()
