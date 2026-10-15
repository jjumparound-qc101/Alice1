"""Add silence before a chapter's narration, for the theatre opening (a hold in the seat before the
reading begins), and shift every word's timing to match.

  public/audio/chNN.mp3        silence added at the start (mono, 96 kbps, as tools/narration.py makes it)
  public/data/chNN_words.json  every time shifted; "lead_silence" records the total added

Run it again after tools/narration.py or tools/forced_align.py, which start from the plain audio.
Usage (from the book's folder): python3 engine/tools/lead_silence.py N --first 5.0
  --first S: make the first word start at S seconds (adds what is needed; nothing if it already does)
"""
import argparse
import json
import os
import subprocess
import tempfile


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("n", type=int)
    ap.add_argument("--first", type=float, required=True)
    a = ap.parse_args()
    nn = f"{a.n:02d}"
    audio, words = f"public/audio/ch{nn}.mp3", f"public/data/ch{nn}_words.json"
    data = json.load(open(words, encoding="utf-8"))
    flat = [w for p in data["paragraphs"] for w in p]
    add = round(a.first - flat[0]["s"], 2)
    if add <= 0.01:
        print(f"chapter {a.n}: the first word already starts at {flat[0]['s']} s")
        return
    with tempfile.TemporaryDirectory() as d:
        out = os.path.join(d, "out.mp3")
        ms = int(round(add * 1000))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", audio, "-af", f"adelay={ms}:all=1", "-ac", "1", "-b:a", "96k", out], check=True)
        os.replace(out, audio)
    for w in flat:
        w["s"] = round(w["s"] + add, 2)
        w["e"] = round(w["e"] + add, 2)
    data["lead_silence"] = round(data.get("lead_silence", 0) + add, 2)
    json.dump(data, open(words, "w", encoding="utf-8"), indent=0, ensure_ascii=False)
    print(f"chapter {a.n}: {add} s of silence added; the first word now starts at {flat[0]['s']} s")


if __name__ == "__main__":
    main()
