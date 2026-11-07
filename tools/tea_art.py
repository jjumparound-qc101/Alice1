"""The Mad Tea-Party (Chapter VII), after the book ("a table set out under a tree in front of the house";
"a large arm-chair at one end of the table"; "it's laid for a great many more than three") and Tenniel's
plates 7.1-7.3. The arm-chair, the tree with the door and the teapot are drawn from Alice's own drawings
(alice7_chair, alice7_treedoor) and the Dormouse's (dormouse_teapot), so they match when one stands in
for the other; the first two are mirrored as those poses are (tools/compose_poses.py).
  tea_cloth   the table's hanging cloth, repeated along the table (front, back and both ends)
  tea_tabletop  the table's top, a linen cloth seen from above, repeated along the table (2026-10-25)
  the rest    cut-outs (2026-10-25, the overhaul: the empty chairs along the table, the cake stand, the
              sugar bowl and jam, a tipped cup)
  2026-10-26, the second overhaul (owner: plain cloth, the book's objects, a great tree over the table):
  tea_cloth_plain     the plain hanging cloth with its fringe, a strip repeated (mirrored) along the table
  tea_tabletop_plain  the plain linen top, a tile
  tea_canopy          the oak's leaves seen from below, a tile overhead
  tea_oak, tea_chair_back_*, tea_bread_knife, tea_butter_dish  cut-outs
  tea_music_box       split into tea_music_box_shut and tea_music_box_open (Chapter VII's hidden box)
  2026-10-26, fun things on the table (owner): tea_decanter (empty: "I don't see any wine"), tea_raven_desk (the
  riddle), tea_hat_stack (the Hatter's hats for sale, 10/6), tea_treacle_tin (the treacle-well), tea_clock
  (stopped at six)  cut-outs

Usage: python3 tools/tea_art.py   -> public/art/ai/ch7/<name>.webp
"""
import os
import sys

import numpy as np
from PIL import Image, ImageOps

sys.path.insert(0, os.path.dirname(__file__))
from ch8_art import cut, PAPER  # noqa: E402
from scipy import ndimage as ndi  # noqa: E402

OUT = "public/art/ai/ch7"
NAMES = ["tea_cloth", "tea_armchair", "tree_door", "teacup", "teapot", "milk_jug", "plate_bread",
         "tea_tabletop", "tea_chair_windsor", "tea_chair_ladder", "tea_cake_stand", "tea_sugar_bowl", "tea_cup_tipped",
         "tea_cloth_plain", "tea_tabletop_plain", "tea_canopy", "tea_oak", "tea_chair_back_windsor", "tea_chair_back_ladder",
         "tea_bread_knife", "tea_butter_dish", "tea_music_box",
         "tea_decanter", "tea_raven_desk", "tea_hat_stack", "tea_treacle_tin", "tea_clock"]
TILES = {"tea_tabletop_plain"}
MIRROR = {"tea_armchair", "tree_door"}
CLOTH_X = (0.158, 0.832)   # the middle of the cloth, which repeats fold to fold
CLOTH_HEM = 0.875          # just above the lowest wave of the hem


def cloth_tile(path):
    """The cloth as a solid strip: from its top seam to just above the hem's lowest wave (the hem lines have
    gaps, so cutting the white below them leaks into the cloth), the middle of the cloth only, fold to fold."""
    g = np.asarray(Image.open(path).convert("L"), np.float32)
    H, W = g.shape
    g = g[:, int(CLOTH_X[0] * W):int(CLOTH_X[1] * W)]
    rows = np.nonzero((g < 225).mean(1) > 0.5)[0]                 # the top seam: the first nearly solid ink row
    top = int(rows[0]) if len(rows) and rows[0] < H // 4 else 0
    out = g[top:int(CLOTH_HEM * H), :, None] / 255.0 * PAPER
    return Image.fromarray(out.astype(np.uint8), "RGB")


def plain_cloth(path):
    """The plain cloth with its fringe: solid from the top seam down to the fringe, the fringe's own threads below
    (the paper between them clear), the middle 90% of the width (the strip is mirrored along the table)."""
    g = np.asarray(Image.open(path).convert("L"), np.float32)
    H, W = g.shape
    g = g[:, int(0.05 * W):int(0.95 * W)]
    dark = (g < 200).mean(1)
    rows = np.nonzero(dark > 0.05)[0]
    top, bottom = int(rows[0]), int(rows[-1]) + 3
    fringe = top + 40 + int(np.argmax(dark[top + 40:bottom] > 0.35))   # where the knotted fringe begins (below the top seam)
    ink = ndi.binary_closing(g < 225, structure=np.ones((3, 3)), border_value=0)
    alpha = np.zeros_like(g)
    alpha[top:fringe] = 255
    alpha[fringe:bottom] = ink[fringe:bottom] * 255
    out = g[..., None] / 255.0 * PAPER
    img = Image.fromarray(out.astype(np.uint8), "RGB").convert("RGBA")
    img.putalpha(Image.fromarray(alpha.astype(np.uint8)))
    return img.crop((0, top, img.width, bottom))


def canopy(path):
    """The leaves overhead: the picture inside a ragged oval (a few broad lobes of leaves round its edge), clear
    outside it, so the ceiling of leaves has no straight edges against the sky."""
    g = np.asarray(Image.open(path).convert("L"), np.float32)
    H, W = g.shape
    y, x = np.mgrid[0:H, 0:W]
    a = np.arctan2((y - H / 2) / H, (x - W / 2) / W)
    rng = np.random.default_rng(7)
    lobes = sum(rng.uniform(0.02, 0.05) * np.cos(k * a + rng.uniform(0, 6.3)) for k in (5, 9, 14, 23))
    r = np.hypot((x - W / 2) / (W / 2), (y - H / 2) / (H / 2))
    alpha = np.clip((0.92 + lobes - r) * 40, 0, 1) * 255
    out = g[..., None] / 255.0 * PAPER
    img = Image.fromarray(out.astype(np.uint8), "RGB").convert("RGBA")
    img.putalpha(Image.fromarray(alpha.astype(np.uint8)))
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    only = sys.argv[1:]   # (names to make again; all when none)
    for n in NAMES:
        if only and n not in only:
            continue
        if n == "tea_cloth":
            img = cloth_tile(f"source/ai/{n}.png")
        elif n == "tea_cloth_plain":
            img = plain_cloth(f"source/ai/{n}.png")
        elif n == "tea_canopy":
            img = canopy(f"source/ai/{n}.png")
        elif n in TILES:
            img = Image.open(f"source/ai/{n}.png").convert("RGB")   # the whole picture: a tile
            img = Image.fromarray((np.asarray(img, np.float32).mean(-1)[..., None] / 255.0 * PAPER).astype(np.uint8), "RGB")
        elif n == "tea_music_box":
            whole = cut(f"source/ai/{n}.png")
            a = np.asarray(whole)[..., 3] > 0
            cols = np.nonzero(a.any(0))[0]
            gap = max((cols[i + 1] - cols[i], i) for i in range(len(cols) - 1))[1]   # the white between the two boxes
            mid = int((cols[gap] + cols[gap + 1]) / 2)
            parts = {}
            for k, box in (("shut", (0, 0, mid, whole.height)), ("open", (mid, 0, whole.width, whole.height))):
                part = whole.crop(box)
                parts[k] = part.crop(part.getbbox())
            # (2026-10-26, step 5) Both on one card the same size, the box's body in the same place, so the lid
            # opens on the card the player painted and the paint stays on the box: bottoms level, and the shut
            # box moved along to stand where the open one's body stands (the middle of a row low on the body).
            def mid_x(img):
                a = np.asarray(img)[..., 3] > 128
                xs = np.nonzero(a[img.height - 150])[0]
                return (xs[0] + xs[-1]) / 2
            dx = int(round(mid_x(parts["open"]) - mid_x(parts["shut"])))
            W = max(parts["open"].width, parts["shut"].width + dx)
            H = max(p.height for p in parts.values())
            for k, part in parts.items():
                card = Image.new("RGBA", (W, H), (0, 0, 0, 0))
                card.paste(part, (dx if k == "shut" else 0, H - part.height))
                card.save(f"{OUT}/tea_music_box_{k}.webp", quality=90)
                print(f"tea_music_box_{k}: {card.width}x{card.height} (drawing {part.width}x{part.height})")
            continue
        elif n == "tea_tabletop":
            img = Image.open(f"source/ai/{n}.png").convert("RGB")   # the whole square: a tile
        else:
            img = cut(f"source/ai/{n}.png")
        if n in MIRROR:
            img = ImageOps.mirror(img)
        img.save(f"{OUT}/{n}.webp", quality=90)
        print(f"{n}: {img.width}x{img.height}")


if __name__ == "__main__":
    main()
