"""Build the rabbit-hole wall: a seamlessly repeating vertical strip made from the two
AI shaft walls, with the ORANGE MARMALADE jar lifted out into its own sprite.

The jar Alice takes must be the same image and size as the jar on the shelf, so the
jar is cut out of the wall art, the hole is filled with wall texture, and the game
puts the sprite back on its shelf (public/art/ai/shaft_strip.json gives where).

Usage: python3 tools/shaft_strip.py
Requires Pillow, NumPy and SciPy.
"""
import json

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

PAPER = np.array([0xEF, 0xE9, 0xDA], np.float32)
W = 1000          # strip width in pixels
A_TOP = 330       # rows above this in wall A are daylight, not wall
B_TOP = 300       # same for wall B (after resizing to 1000 wide)
F = 90            # cross-fade rows where one tile meets the next

# The jar on wall B (resized to 1000x1500), traced by hand.
JAR = [(560, 418), (645, 418), (652, 435), (668, 460), (661, 470), (660, 540), (652, 549),
       (552, 549), (543, 540), (542, 470), (535, 460), (548, 435)]


def main():
    a = Image.open("source/ai/shaft_wall_a.webp").convert("L")
    b = Image.open("source/ai/shaft_wall_b.webp").convert("L").resize((W, 1500), Image.LANCZOS)
    B = np.asarray(b, np.float32).copy()

    # Lift the jar out: keep it as a sprite with a feathered mask...
    mask = Image.new("L", (W, 1500), 0)
    ImageDraw.Draw(mask).polygon(JAR, fill=255)
    xs, ys = zip(*JAR)
    box = (min(xs) - 3, min(ys) - 3, max(xs) + 4, max(ys) + 4)
    alpha = mask.filter(ImageFilter.GaussianBlur(1.2)).crop(box)
    jar = (np.asarray(b.crop(box), np.float32)[..., None] / 255.0) * PAPER
    Image.merge("RGBA", [Image.fromarray(jar[..., i].astype(np.uint8)) for i in range(3)] + [alpha]).save(
        "public/art/ai/jar.webp", quality=92, method=6)

    # ...and fill the hole with plain wall from between the map and the jar (x 428-535),
    # repeated mirror-wise to the jar's width, feathered in.
    x0, y0, x1, y1 = box
    w = x1 - x0
    plain = B[y0:y1, 428:535]
    src = np.concatenate([plain, plain[:, ::-1], plain], axis=1)[:, :w]
    m = np.asarray(mask.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(3)), np.float32)[y0:y1, x0:x1] / 255
    B[y0:y1, x0:x1] = B[y0:y1, x0:x1] * (1 - m) + src * m

    A = np.asarray(a.crop((0, A_TOP, W, 1500)), np.float32)
    B = B[B_TOP:]
    ramp = np.linspace(0, 1, F)[:, None]
    strip = np.concatenate([A[:-F], A[-F:] * (1 - ramp) + B[:F] * ramp, B[F:]])
    strip[:F] = strip[-F:] * (1 - ramp) + strip[:F] * ramp  # wrap: bottom flows into top
    strip = strip[:-F]
    rgb = (strip[..., None] / 255.0) * PAPER
    Image.fromarray(rgb.astype(np.uint8)).save("public/art/ai/shaft_strip.webp", quality=85, method=6)

    # Where the jar sat, in strip pixels (B row r lands at strip row len(A) - F + r - B_TOP).
    b_start = len(A) - F - B_TOP
    meta = {
        "width": W, "height": strip.shape[0],
        "jar": {"cx": (x0 + x1) / 2, "cy": b_start + (y0 + y1) / 2, "w": x1 - x0, "h": y1 - y0},
    }
    json.dump(meta, open("public/art/ai/shaft_strip.json", "w"), indent=1)
    print(meta)


if __name__ == "__main__":
    main()
