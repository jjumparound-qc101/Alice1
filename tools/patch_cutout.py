#!/usr/bin/env python3
"""
patch_cutout.py -- close a see-through hole in a cut-out drawing (2026-11-12: the Cook's face in cook_throw was cut
away with the white round her, because whitecut's flood from the edge got in through a gap in her outline, so the
kitchen showed through her face).

  python3 tools/patch_cutout.py public/art/ai/ch6/cook_throw.webp "x,y x,y x,y ..."

Inside the polygon (the drawing's pixels), every pixel is laid over the drawing's own paper colour (the median of its
light opaque pixels) and made opaque, so ink stays ink and the hole becomes paper. Outside it nothing changes.
A fix to a book drawing: owed to Alice1 too (CLAUDE.md, "The book stays in Alice1").

  python3 tools/patch_cutout.py public/art/ai/ch4/puppy_look.webp --holes "x,y x,y" [--close-bottom]

(2026-11-14) Instead of a polygon, name points inside see-through holes: each hole (a transparent patch closed in by
the figure once gaps under 12 px between its strokes are bridged) holding one of the points is filled the same way.
--close-bottom counts the picture's bottom edge as closed, for a figure cut off there (the March Hare's coat tail).
"""
import sys

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage


def holes(a, seeds, close_bottom=False):
    op = a[..., 3] > 128
    if close_bottom:
        op = np.vstack([op, np.ones((8, op.shape[1]), bool)])
    filled = ndimage.binary_fill_holes(ndimage.binary_closing(op, iterations=6, border_value=0))
    h = (filled & ~op)[:a.shape[0]]
    lab, _ = ndimage.label(h)
    m = np.zeros(h.shape, bool)
    for x, y in seeds:
        win = lab[max(0, y - 10):y + 11, max(0, x - 10):x + 11]
        ids = np.unique(win[win > 0])
        if not len(ids):
            sys.exit(f'no hole near {x},{y}')
        m |= np.isin(lab, ids)
    return ndimage.binary_dilation(m, iterations=2) & (a[..., 3] < 255)


def patch(path, poly=None, seeds=None, close_bottom=False):
    im = Image.open(path).convert('RGBA')
    a = np.asarray(im).astype(np.float32)
    light = (a[..., 3] > 250) & (a[..., :3].min(-1) > 200)
    paper = np.median(a[light][:, :3], axis=0)
    if seeds:
        m = holes(a, seeds, close_bottom)
        k = a[..., 3:] / 255
        a[m, :3] = (a[..., :3] * k + paper * (1 - k))[m]
        a[m, 3] = 255
        Image.fromarray(a.round().astype(np.uint8), 'RGBA').save(path, quality=90, method=6)
        print(path, 'paper', paper.round(), 'pixels', int(m.sum()))
        return
    mk = Image.new('L', im.size, 0)
    ImageDraw.Draw(mk).polygon(poly, fill=1)
    m = np.asarray(mk).astype(bool)
    # (the polygon need not be exact: inside it, the paper between ink lines that is cut off from the main hole by the
    # outline, a sliver outside the face along the polygon's edge, is left as it was)
    ink = (a[..., 3] > 128) & (a[..., :3].max(-1) < 110)
    lab, n = ndimage.label(m & ~ink)
    if n > 1:
        sizes = ndimage.sum(np.ones(m.shape), lab, range(1, n + 1))
        edge = m & ~ndimage.binary_erosion(m, iterations=2)
        on_edge = np.zeros(n + 1, bool)
        on_edge[np.unique(lab[edge])] = True
        keep = np.zeros(n + 1, bool)
        keep[1:] = (sizes >= 0.05 * m.sum()) | ~on_edge[1:]
        m = (keep[lab] & (lab > 0)) | (m & ink & ndimage.binary_dilation(keep[lab] & (lab > 0), iterations=2))
    k = a[..., 3:] / 255
    over = a[..., :3] * k + paper * (1 - k)
    a[m, :3] = over[m]
    a[m, 3] = 255
    Image.fromarray(a.round().astype(np.uint8), 'RGBA').save(path, quality=90, method=6)
    print(path, 'paper', paper.round(), 'pixels', int(m.sum()))


if __name__ == '__main__':
    pts = lambda t: [tuple(map(int, p.split(','))) for p in t.split()]
    if sys.argv[2] == '--holes':
        patch(sys.argv[1], seeds=pts(sys.argv[3]), close_bottom='--close-bottom' in sys.argv)
    else:
        patch(sys.argv[1], pts(sys.argv[2]))
