"""Process Chapter IV's AI drawings (Bill the Lizard, the guinea-pigs, Pat, the puppy; Bill and the
guinea-pigs also sit on the jury in XI, XII).

Each figure is cut out from white and saved to public/art/ai/ch4/; the figure's height in source
pixels is printed (px), so poses of one character are scaled alike in main.js. CLEAR lists points
(source pixels) inside closed gaps that are background, not paper (between the ladder's rungs).

Usage: python3 tools/ch4_art.py [names...]
"""
import os
import subprocess
import sys
import tempfile

from PIL import Image

OUT = "public/art/ai/ch4"
NAMES = ["bill_stand", "bill_ladder", "bill_climb", "bill_rocket", "bill_limp", "guinea_stand", "guinea_hold",
         "guinea_bottle", "pat", "pat_cap", "puppy_look", "puppy_jump", "puppy_tumble", "puppy_sit"]
CLEAR = {"bill_ladder": "178,226;275,308;374,392;474,478;549,543;811,784"}


def main():
    os.makedirs(OUT, exist_ok=True)
    for n in sys.argv[1:] or NAMES:
        with tempfile.TemporaryDirectory() as d:
            cmd = [sys.executable, "tools/whitecut.py", f"source/ai/{n}.png", f"{d}/c.png"]
            if n in CLEAR:
                cmd += ["--clear", CLEAR[n]]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL)
            img = Image.open(f"{d}/c.png").convert("RGBA")
        print(f"{n}: px {img.height} aspect {img.width / img.height:.3f}")
        img.resize((600, round(img.height * 600 / img.width)), Image.LANCZOS).save(f"{OUT}/{n}.webp", quality=90, method=6)


if __name__ == "__main__":
    main()
