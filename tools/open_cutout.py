#!/usr/bin/env python3
"""
open_cutout.py -- make a paper gap in a cut-out drawing see-through (2026-11-22: the slate blue Dodo. The white
between his legs, between his leg and his stick, and between his neck and his raised wing is the drawing's blank
paper, closed in by the figure, so whitecut kept it; in the game it showed as a cream patch inside the bird).
The opposite of tools/patch_cutout.py.

  python3 tools/open_cutout.py public/art/ai/ch2/dodo_stand.webp "x,y x,y"

Each point names a gap: the light, ink-free paper connected to it (grey above 200) becomes transparent, with a
soft edge as whitecut makes, so the ink round it stays. The drawing keeps its size, so its part map and Restore
plate still line up; rebuild the plate after (tools/restore/scene_tint.py build cast KEY).
A fix to a book drawing: owed to Alice1 too (CLAUDE.md, "The book stays in Alice1").
"""
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

LIGHT = 200


def gaps(a, seeds):
    g = a[..., :3].astype(np.float32).mean(-1)
    light = (g > LIGHT) & (a[..., 3] > 0)
    lab, _ = ndimage.label(light)
    m = np.zeros(light.shape, bool)
    for x, y in seeds:
        if not lab[y, x]:
            sys.exit(f'no paper at {x},{y}')
        m |= lab == lab[y, x]
    return m


def main():
    path, pts = sys.argv[1], sys.argv[2]
    seeds = [tuple(int(v) for v in p.split(',')) for p in pts.split()]
    img = Image.open(path).convert('RGBA')
    a = np.array(img)
    m = gaps(a, seeds)
    fg = Image.fromarray(((~m) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    a[..., 3] = np.minimum(a[..., 3], np.asarray(fg))
    Image.fromarray(a, 'RGBA').save(path, quality=90, method=6)
    print(f'{path}: {int(m.sum())} px of paper made see-through')


if __name__ == '__main__':
    main()
