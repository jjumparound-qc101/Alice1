"""The riverbank's ground (Chapters I and XII): "sitting by her sister on the bank" ... "picking the daisies".

- bank_grass_tile: meadow grass with daisies and clover from straight above, tiling both ways.
  Softened (lifted toward the paper, contrast reduced) so it doesn't shimmer or band at a low
  camera angle, and its edges cross-faded with the opposite side so the repeats join.
- bank_edge: the bank's grassy lip, side on; cut out from white, its two ends cross-faded so it
  repeats sideways.

- clouds_two: two loose clouds, cut out separately, hung low behind the hedge so the riverbank's
  closer shots (the Rabbit, the hole) have clouds too (owner).
- sky_summer: the hot day's sky (every outdoor scene shares it), no hills; ends joined.

Usage: python3 tools/bank_art.py   -> public/art/ai/bank_grass.webp, bank_edge.webp, sky.webp, cloud_a.webp, cloud_b.webp
Requires Pillow, NumPy and SciPy.
"""
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image

PAPER = np.array([0xEF, 0xE9, 0xDA], np.float32)
SOFT = 0.55  # how much of the ink's darkness is kept on the ground tile


def wrap(a, axis, n):
    """Cross-fade the last n pixels along axis into the first n, then drop them: seamless."""
    a = np.moveaxis(a, axis, 0).astype(np.float32)
    k = np.linspace(0, 1, n)[(...,) + (None,) * (a.ndim - 1)]
    head = a[:n] * k + a[-n:] * (1 - k)
    out = np.concatenate([head, a[n:-n]], 0)
    return np.moveaxis(out, 0, axis)


def main():
    g = np.asarray(Image.open("source/ai/bank_grass_tile.png").convert("L"), np.float32)
    g = wrap(wrap(g, 0, 48), 1, 48)
    g = 255 - (255 - g) * SOFT
    Image.fromarray((g[..., None] / 255 * PAPER).astype(np.uint8), "RGB").resize((768, 768), Image.LANCZOS) \
        .save("public/art/ai/bank_grass.webp", quality=88, method=6)
    print("public/art/ai/bank_grass.webp")
    with tempfile.TemporaryDirectory() as d:
        subprocess.run([sys.executable, "tools/whitecut.py", "source/ai/bank_edge.png", f"{d}/c.png", "--seal", "1"], check=True, stdout=subprocess.DEVNULL)
        cut = np.asarray(Image.open(f"{d}/c.png").convert("RGBA"), np.float32)
    cut = wrap(cut, 1, 60)
    img = Image.fromarray(cut.astype(np.uint8), "RGBA")
    img = img.resize((1400, round(img.height * 1400 / img.width)), Image.LANCZOS)
    img.save("public/art/ai/bank_edge.webp", quality=90, method=6)
    print(f"public/art/ai/bank_edge.webp: {img.size[0]}x{img.size[1]}")
    sky = np.asarray(Image.open("source/ai/sky_summer.png").convert("L"), np.float32)
    sky = wrap(sky, 1, 80)
    Image.fromarray((sky[..., None] / 255 * PAPER).astype(np.uint8), "RGB").save("public/art/ai/sky.webp", quality=88, method=6)
    print("public/art/ai/sky.webp")
    for name, box in (("cloud_a", (20, 250, 930, 660)), ("cloud_b", (990, 420, 1515, 640))):
        with tempfile.TemporaryDirectory() as d:
            Image.open("source/ai/clouds_two.png").convert("RGB").crop(box).save(f"{d}/c.png")
            subprocess.run([sys.executable, "tools/whitecut.py", f"{d}/c.png", f"public/art/ai/{name}.png"], check=True, stdout=subprocess.DEVNULL)
        Image.open(f"public/art/ai/{name}.png").save(f"public/art/ai/{name}.webp", quality=90, method=6)
        os.remove(f"public/art/ai/{name}.png")
        print(f"public/art/ai/{name}.webp")


if __name__ == "__main__":
    main()
