"""The row of stalls in the opening shot, made to continue without mirror-image guests (owner, 2026-10-16).

The row (public/art/ai/theatre_seats.webp, from tools/proscenium.py --house) was repeated mirrored at each
end for wide screens, which showed flipped copies of its end guests. Instead the row now continues with
empty chairs: the one empty chair in the drawing, cut from post to post with the neighbours' shoulders
taken off above its crest, laid side by side (src/sets/riverbank.js). The first empty chair at each end is
laid over the row's half-cut end chair, so the lady and the gentleman at the ends sit in whole chairs; the
drawing's edge cuts through them above the crests, so those cuts are rounded off.

Writes public/art/ai/theatre_seats_row.webp (the row, ends rounded) and theatre_seat_empty.webp (one chair,
303 x 793 px, the row's full height). In the row's pixels (1536 x 793): the empty chair runs from the post
at x 222 to the post at x 525; the row's last whole posts are at x 222 (left) and 1368 (right).

Usage: python3 tools/theatre_seats.py
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SRC = "public/art/ai/theatre_seats.webp"
CHAIR = (222, 525)
# The empty chair's top (crest, shell ornament and the knobs of its posts), left to right.
TOP = [(222, 341), (229, 343), (236, 342), (242, 336), (250, 329), (262, 321), (278, 313), (300, 304), (320, 297),
       (340, 290), (358, 285), (375, 281), (395, 281), (415, 285), (435, 291), (455, 302), (470, 308), (482, 315),
       (492, 322), (500, 330), (507, 338), (512, 343), (518, 341), (525, 340)]
# Where the drawing's edges cut a figure above the end chairs (y from, y to), and how far in to round it.
LEFT_CUT, RIGHT_CUT, ROUND = (266, 306), (252, 284), 13


def soft(mask):
    return np.asarray(mask.filter(ImageFilter.GaussianBlur(0.8)), np.float32) / 255


def main():
    im = Image.open(SRC).convert("RGBA")
    W, H = im.size
    # The empty chair: everything above its top line is the neighbours, taken off.
    m = Image.new("L", (W, H), 0)
    ImageDraw.Draw(m).polygon([(x, y - 1.5) for x, y in TOP] + [(CHAIR[1], H), (CHAIR[0], H)], fill=255)
    a = np.asarray(im, np.float32).copy()
    chair = a.copy()
    chair[..., 3] *= soft(m)
    tile = Image.fromarray(chair.astype(np.uint8)).crop((CHAIR[0], 0, CHAIR[1], H))
    tile.save("public/art/ai/theatre_seat_empty.webp", quality=88, method=6)
    # The row: the cut figures at either edge rounded off (inset most at the top of the cut, none at its foot).
    keep = Image.new("L", (W, H), 255)
    d = ImageDraw.Draw(keep)
    for (y0, y1), side in ((LEFT_CUT, -1), (RIGHT_CUT, 1)):
        edge = []
        for y in range(y0 - 6, y1 + 1):
            s = min(1, max(0, (y - y0) / (y1 - y0)))
            inset = ROUND * (1 - s) ** 2
            edge.append((W - inset if side > 0 else inset, y))
        out = W + 2 if side > 0 else -2
        d.polygon(edge + [(out, y1), (out, y0 - 6)], fill=0)
    a[..., 3] *= soft(keep)
    Image.fromarray(a.astype(np.uint8)).save("public/art/ai/theatre_seats_row.webp", quality=88, method=6)
    print(f"public/art/ai/theatre_seats_row.webp {W}x{H}; theatre_seat_empty.webp {tile.size[0]}x{tile.size[1]}")


if __name__ == "__main__":
    main()
