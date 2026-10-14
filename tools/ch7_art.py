"""Process Chapter VII's AI drawings (the Hatter, the March Hare, the Dormouse; also in XI, XII).

Each figure is cut out from white and saved to public/art/ai/ch7/; the figure's height in source
pixels is printed (px), so poses of one character are scaled alike in main.js.

Usage: python3 tools/ch7_art.py
"""
import os
import subprocess
import sys
import tempfile

from PIL import Image

OUT = "public/art/ai/ch7"
NAMES = ["hatter_sit_stare", "hatter_sit_riddle", "hatter_sit_watch", "hatter_cup", "hatter_pale", "hatter_bite",
         "hatter_tremble", "hatter_knee", "hatter_run", "marchhare_sit", "marchhare_dip", "dormouse_sleep", "dormouse_talk"]


def main():
    os.makedirs(OUT, exist_ok=True)
    for n in NAMES:
        with tempfile.TemporaryDirectory() as d:
            subprocess.run([sys.executable, "tools/whitecut.py", f"source/ai/{n}.png", f"{d}/c.png"], check=True, stdout=subprocess.DEVNULL)
            img = Image.open(f"{d}/c.png").convert("RGBA")
        print(f"{n}: px {img.height}")
        img.resize((600, round(img.height * 600 / img.width)), Image.LANCZOS).save(f"{OUT}/{n}.webp", quality=90, method=6)


if __name__ == "__main__":
    main()
