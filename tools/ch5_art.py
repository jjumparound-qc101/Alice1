"""Process Chapter V's AI drawings (source/ai/) for the game.

- caterpillar_sit: the Caterpillar on his mushroom with his hookah (gpt-image-2, 2026-10-13).
  The drawing's mushroom cap is cut away below his body (the scene has its own mushroom), and
  the Caterpillar himself is coloured blue ("a large blue caterpillar", COLOR.md); the hookah
  stays ink on paper.

- caterpillar_speak, _rear, _yawn, _crawl (2026-10-14): drawn without the hookah, coloured blue all over;
  hookah: the hookah alone, uncoloured.

- alice5_head: her head on the long neck (2026-10-15). The bottom of the drawn neck fades out above its
  cut edge (NECK_FADE), so the scene's tube of a neck shows through and the two join without a seam
  (owner's patch note, 2026-10-15).

Usage: python3 tools/ch5_art.py   -> public/art/ai/ch5/*.webp
Requires Pillow, NumPy and SciPy.
"""
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = "public/art/ai/ch5"
POSES = ["caterpillar_speak", "caterpillar_rear", "caterpillar_yawn", "caterpillar_crawl", "hookah", "alice5_head"]
BLUE = np.array([0x5B, 0x86, 0xC4], np.float32)  # SPOT.blue in src/props.js
# Source pixels (1024x1536): keep everything above the line where his body meets the cap.
KEEP = [(0, 0), (1024, 0), (1024, 955), (925, 955), (905, 975), (735, 975), (700, 1050), (600, 1085),
        (420, 1095), (270, 1080), (200, 1010), (160, 960), (0, 960)]
# His body and arms (the hookah to the right of it stays uncoloured).
BODY = [(330, 120), (440, 40), (560, 120), (620, 330), (690, 560), (700, 760), (690, 960), (640, 1060),
        (420, 1095), (260, 1075), (170, 980), (160, 820), (250, 600), (330, 400)]
# alice5_head, in the saved drawing's pixels (685x900): the drawn neck between her hair, down to its cut
# edge at y 713 (x 170-368: 39.3% of the width is its centre, NECK_U in scenes/caterpillar.js). Inside
# it the drawing fades out from y 655 to the cut, ink line and all; the hair either side stays.
NECK_COLUMN = [(200, 600), (200, 700), (170, 712), (168, 722), (370, 722), (368, 712), (357, 680), (330, 647),
               (313, 613), (308, 600)]
NECK_FADE = (655, 713)


def mask(poly, size, blur=2):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).polygon(poly, fill=255)
    return np.asarray(m.filter(ImageFilter.GaussianBlur(blur)), np.float32) / 255.0


def main():
    os.makedirs(OUT, exist_ok=True)
    with tempfile.TemporaryDirectory() as d:
        subprocess.run([sys.executable, "engine/tools/whitecut.py", "source/ai/caterpillar_sit.png", f"{d}/c.png",
                        "--clear", "760,500;720,1000"],  # inside the hookah hose loop; beside his base
                       check=True, stdout=subprocess.DEVNULL)
        cut = Image.open(f"{d}/c.png").convert("RGBA")
    # whitecut crops to the drawing: put it back on the full source canvas so the polygons line up.
    src = Image.open("source/ai/caterpillar_sit.png").convert("L")
    g = np.asarray(src) < 225
    ys, xs = np.nonzero(g)
    full = Image.new("RGBA", src.size, (0, 0, 0, 0))
    full.paste(cut, (max(0, xs.min() - 2), max(0, ys.min() - 2)))
    a = np.asarray(full, np.float32).copy()
    a[..., 3] *= mask(KEEP, src.size, 1.5)
    body = mask(BODY, src.size, 6)[..., None]
    tone = a[..., :3].mean(2, keepdims=True) / 230.0
    blue = BLUE * np.clip(tone, 0, 1) ** 0.9 + 255 * 0.12 * np.clip(tone, 0, 1)
    a[..., :3] = a[..., :3] * (1 - body * 0.75) + np.clip(blue, 0, 255) * body * 0.75
    img = Image.fromarray(a.astype(np.uint8), "RGBA")
    img = img.crop(img.getbbox())
    img.thumbnail((900, 900))
    img.save(f"{OUT}/caterpillar_sit.webp", quality=90, method=6)
    print(f"{OUT}/caterpillar_sit.webp: {img.size[0]}x{img.size[1]}")
    # His other poses (2026-10-14) are drawn without the hookah, so the whole figure is coloured blue;
    # the hookah is its own drawing, standing beside him on the mushroom while he talks.
    for n in POSES:
        with tempfile.TemporaryDirectory() as d:
            clear = ["--clear", "582,387;365,1241"] if n == "hookah" else []  # inside the loops of the hose
            subprocess.run([sys.executable, "engine/tools/whitecut.py", f"source/ai/{n}.png", f"{d}/c.png", *clear], check=True, stdout=subprocess.DEVNULL)
            cut = Image.open(f"{d}/c.png").convert("RGBA")
        a = np.asarray(cut, np.float32).copy()
        if n not in ("hookah", "alice5_head"):
            tone = a[..., :3].mean(2, keepdims=True) / 230.0
            blue = BLUE * np.clip(tone, 0, 1) ** 0.9 + 255 * 0.12 * np.clip(tone, 0, 1)
            a[..., :3] = a[..., :3] * 0.25 + np.clip(blue, 0, 255) * 0.75
        print(f"{n}: px {cut.height} aspect {cut.width / cut.height:.3f}")
        img = Image.fromarray(a.astype(np.uint8), "RGBA")
        img.thumbnail((900, 900))
        if n == "alice5_head":
            b = np.asarray(img, np.float32).copy()
            y0, y1 = NECK_FADE
            k = np.clip((np.arange(b.shape[0], dtype=np.float32) - y0) / (y1 - y0), 0, 1)
            fade = (k * k * (3 - 2 * k))[:, None]
            b[..., 3] *= 1 - mask(NECK_COLUMN, img.size, 3) * fade
            img = Image.fromarray(b.astype(np.uint8), "RGBA")
        img.save(f"{OUT}/{n}.webp", quality=90, method=6)


if __name__ == "__main__":
    main()
