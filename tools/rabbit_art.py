"""The White Rabbit after Chapter I (owner, 2026-10-14: the Chapter I model, source/ai/rabbit_sheet.webp,
is the standard for every scene he is in). Each pose was drawn from that sheet (tools/gen_image.py)
and is cut out here, made white rather than paper (he is a White Rabbit) and given his pink eye.

EYES: (x, y, radius) of the eye in the output image (at most 900 px on its long side); drawings seen
from behind have none.

Usage: python3 tools/rabbit_art.py [names...]   (add --noeye to write them without the pink, to find the eye)
"""
import os
import sys

sys.path.insert(0, "tools")
from ch1_art import shrink, whitecut  # noqa: E402
from white_rabbit import pink_eye, whiten  # noqa: E402

NAMES = {
    "rabbit_run_side": "ch1", "rabbit_hop": "ch1", "rabbit_idle_b": "ch1",
    "rabbit2_trot": "ch2", "rabbit2_start": "ch2", "rabbit2_away": "ch2",
    "rabbit4_search": "ch4", "rabbit4_point": "ch4", "rabbit4_frame": "ch4", "rabbit4_order": "ch4",
    "rabbit8_peep": "ch8", "rabbit8_tiptoe": "ch8",
    "rabbit_herald": "ch11", "rabbit_trumpet": "ch11", "rabbit_scroll": "ch11", "rabbit_specs": "ch11",
}
EYES = {
    "rabbit_run_side": (143, 315, 13), "rabbit_hop": (800, 245, 11), "rabbit_idle_b": (384, 296, 12),
    "rabbit2_trot": (342, 292, 13), "rabbit2_start": (548, 351, 13), "rabbit4_search": (158, 365, 13), "rabbit4_point": (312, 288, 13),
    "rabbit4_frame": (553, 219, 13), "rabbit4_order": (205, 284, 13), "rabbit8_peep": (197, 235, 13), "rabbit8_tiptoe": (472, 271, 13),
    "rabbit_herald": (222, 278, 13), "rabbit_trumpet": (399, 284, 13), "rabbit_scroll": (367, 287, 13), "rabbit_specs": (252, 300, 12),
}


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    for n in args or NAMES:
        out = f"public/art/ai/{NAMES[n]}"
        os.makedirs(out, exist_ok=True)
        img = shrink(whitecut(f"source/ai/{n}.png").convert("RGBA"))
        if n in EYES and "--noeye" not in sys.argv:
            img = pink_eye(img, EYES[n])
        img = whiten(img)
        img.save(f"{out}/{n}.webp", quality=90, method=6)
        print(f"{out}/{n}.webp: {img.size[0]}x{img.size[1]}")


if __name__ == "__main__":
    main()
