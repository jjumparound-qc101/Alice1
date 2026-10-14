"""Process the AI drawings of the smaller creatures (the Pigeon in V; the Crab and her daughter, the
Owl, the Magpie and the Canary in III, who also sit on the jury in XI; the flamingoes and hedgehogs in VIII).

Each figure is cut out from white and saved under public/art/ai/<chapter>/; its height in source
pixels and its aspect are printed, so poses of one creature are scaled alike in main.js.

Usage: python3 tools/creatures_art.py [names...]
"""
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image

NAMES = {
    "pigeon_attack": "ch5", "pigeon_scream": "ch5", "pigeon_nest": "ch5",
    "flamingo_stand": "ch8", "flamingo_mallet": "ch8", "flamingo_twist": "ch8", "flamingo_fly": "ch8",
    "hedgehog_crawl": "ch8", "hedgehog_ball": "ch8", "hedgehog_fight": "ch8",
    "mouse3_lecture": "ch3", "mouse3_cross": "ch3", "mouse3_sigh": "ch3", "mouse3_angry": "ch3", "mouse3_away": "ch3",
    "dodo3_rise": "ch3", "dodo3_think": "ch3", "dodo3_point": "ch3", "dodo3_thimble": "ch3", "lory3_sulk": "ch3",
    "eaglet3_smile": "ch3", "duck3_ask": "ch3",
    "crabs3": "ch3", "owl3": "ch3", "magpie3": "ch3", "magpie3_shawl": "ch3", "canary3": "ch3", "canary3_chicks": "ch3",
}
CLEAR = {"pigeon_scream": "436,929;584,992;611,1135", "magpie3": "270,1030;400,1050;380,980", "magpie3_shawl": "350,1040;490,1000",
         "canary3": "486,1101;546,1011", "canary3_chicks": "589,1096;608,1013",
         "hedgehog_fight": "540,720;560,735;575,760"}  # name: "x,y;x,y" source points inside closed gaps that are background


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
        if n == "crabs3":  # the old Crab and her daughter, split into two figures at the gap between them
            for part, box in split(img).items():
                save(part, img.crop(box), out)
            continue
        save(n, img, out)


def split(img):
    """The two crabs: the emptiest column between them separates mother (left) and daughter."""
    a = np.asarray(img)[..., 3] > 20
    cols = a.sum(0)
    w = img.width
    lo, hi = w // 3, w * 5 // 6
    gap = lo + int(np.argmin(cols[lo:hi]))
    def box(x0, x1):
        ys = np.where(a[:, x0:x1].any(1))[0]; xs = np.where(a[:, x0:x1].any(0))[0] + x0
        return (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)

    return {"crab": box(0, gap), "crabling": box(gap, w)}


def save(n, img, out):
    print(f"{n}: px {img.height} aspect {img.width / img.height:.3f}")
    w = min(700, img.width)
    img.resize((w, round(img.height * w / img.width)), Image.LANCZOS).save(f"{out}/{n}.webp", quality=90, method=6)


if __name__ == "__main__":
    main()
