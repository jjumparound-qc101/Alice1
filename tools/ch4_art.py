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


# The Rabbit's house (2026-10-14): the front cut off at the ground line (cut-out pixels), the room's walls
# (opaque; the side walls cropped to their middle so they fit the room's depth), the cucumber-frames, and
# giant Alice lying in the room after Tenniel's plate 4.1.
HOUSE_GROUND = 1240
SETS = {"rabbit_house": None, "rabbit_room_back": "opaque", "rabbit_room_door": "side", "rabbit_room_fire": "side",
        "cucumber_frames": None, "cucumber_frames_broken": None, "alice4_giant_lying": None, "alice4_foot": None}
OUT_NAME = {"alice4_giant_lying": "alice_lying", "alice4_foot": "alice_foot"}


def sets(names):
    for n in names:
        with tempfile.TemporaryDirectory() as d:
            cmd = [sys.executable, "engine/tools/whitecut.py", f"source/ai/{n}.png", f"{d}/c.png"]
            if SETS[n]:
                cmd += ["--opaque"]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL)
            img = Image.open(f"{d}/c.png").convert("RGBA")
        if n == "rabbit_house":
            img = img.crop((0, 0, img.width, HOUSE_GROUND))
        if SETS[n] == "side":
            w = round(img.height * 1.1)
            img = img.crop(((img.width - w) // 2, 0, (img.width + w) // 2, img.height))
        print(f"{n}: {img.width}x{img.height} aspect {img.width / img.height:.3f}")
        img.thumbnail((1400, 1400))
        img.save(f"{OUT}/{OUT_NAME.get(n, n)}.webp", quality=90, method=6)


def main():
    os.makedirs(OUT, exist_ok=True)
    pick = sys.argv[1:]
    sets([n for n in SETS if not pick or n in pick])
    for n in [n for n in NAMES if not pick or n in pick]:
        with tempfile.TemporaryDirectory() as d:
            cmd = [sys.executable, "engine/tools/whitecut.py", f"source/ai/{n}.png", f"{d}/c.png"]
            if n in CLEAR:
                cmd += ["--clear", CLEAR[n]]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL)
            img = Image.open(f"{d}/c.png").convert("RGBA")
        print(f"{n}: px {img.height} aspect {img.width / img.height:.3f}")
        img.resize((600, round(img.height * 600 / img.width)), Image.LANCZOS).save(f"{OUT}/{n}.webp", quality=90, method=6)


if __name__ == "__main__":
    main()
