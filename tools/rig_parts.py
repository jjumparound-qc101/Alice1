"""Cut Alice's puppet parts out of the AI parts sheets.

Each part is a crop of a sheet, with optional rectangles painted white first
(where a neighbouring drawing overlaps), then cut out and paper-tinted like
tools/whitecut.py. Output: public/art/ai/rig/<part>.webp

Usage: python3 tools/rig_parts.py
Requires Pillow, NumPy and SciPy.
"""
import os
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw

SHEET_B = "source/ai/alice_parts_b.webp"   # heads, arms, hands, skirt-and-legs
TORSO = "source/ai/alice_torso.webp"
OUT = "public/art/ai/rig"

# name: (sheet, crop box x0,y0,x1,y1, [white-out boxes in sheet pixels])
PARTS = {
    "head_34": (SHEET_B, (403, 33, 661, 312), []),
    "head_side": (SHEET_B, (742, 31, 970, 300), []),
    "torso_34": (TORSO, (826, 257, 1397, 866), []),
    "torso_front": (TORSO, (50, 265, 785, 849), []),
    "arm_down": (SHEET_B, (35, 310, 165, 650), []),
    "arm_bent": (SHEET_B, (216, 317, 444, 529), []),
    "arm_reach": (SHEET_B, (486, 313, 805, 550), []),
    "arm_up": (SHEET_B, (744, 247, 1086, 488), [(742, 247, 975, 302)]),
    "legs_stand": (SHEET_B, (360, 630, 662, 995), []),
    "legs_front": (SHEET_B, (35, 640, 330, 995), [(35, 640, 160, 662)]),
    "legs_run_a": (SHEET_B, (662, 628, 1035, 993), []),
    "legs_run_b": (SHEET_B, (1050, 635, 1513, 980), []),
}


def main():
    os.makedirs(OUT, exist_ok=True)
    py = sys.executable
    with tempfile.TemporaryDirectory() as tmp:
        for name, (sheet, box, erase) in PARTS.items():
            im = Image.open(sheet).convert("RGB")
            d = ImageDraw.Draw(im)
            for e in erase:
                d.rectangle(e, fill=(255, 255, 255))
            src = os.path.join(tmp, f"{name}.png")
            im.crop(box).save(src)
            png = os.path.join(tmp, f"{name}_cut.png")
            subprocess.run([py, "-I", "tools/whitecut.py", src, png, "--seal", "1"], check=True, stdout=subprocess.DEVNULL)
            Image.open(png).save(os.path.join(OUT, f"{name}.webp"), quality=90, method=6)
            w, h = Image.open(png).size
            print(f"{name}: {w}x{h}")


if __name__ == "__main__":
    main()
