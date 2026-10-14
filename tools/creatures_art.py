"""Process the AI drawings of the smaller creatures (the Pigeon in V; the Crab and her daughter, the
Owl, the Magpie and the Canary in III, who also sit on the jury in XI).

Each figure is cut out from white and saved under public/art/ai/<chapter>/; its height in source
pixels and its aspect are printed, so poses of one creature are scaled alike in main.js.

Usage: python3 tools/creatures_art.py [names...]
"""
import os
import subprocess
import sys
import tempfile

from PIL import Image

NAMES = {
    "pigeon_attack": "ch5", "pigeon_scream": "ch5", "pigeon_nest": "ch5",
    "crabs3": "ch3", "owl3": "ch3", "magpie3": "ch3", "canary3": "ch3",
}
CLEAR = {"pigeon_scream": "436,929;584,992;611,1135"}  # name: "x,y;x,y" source points inside closed gaps that are background


def main():
    for n in sys.argv[1:] or NAMES:
        out = f"public/art/ai/{NAMES[n]}"
        os.makedirs(out, exist_ok=True)
        with tempfile.TemporaryDirectory() as d:
            cmd = [sys.executable, "tools/whitecut.py", f"source/ai/{n}.png", f"{d}/c.png"]
            if n in CLEAR:
                cmd += ["--clear", CLEAR[n]]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL)
            img = Image.open(f"{d}/c.png").convert("RGBA")
        print(f"{n}: px {img.height} aspect {img.width / img.height:.3f}")
        w = min(700, img.width)
        img.resize((w, round(img.height * w / img.width)), Image.LANCZOS).save(f"{out}/{n}.webp", quality=90, method=6)


if __name__ == "__main__":
    main()
