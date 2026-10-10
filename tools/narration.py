"""Prepare a chapter's narration for the game, the same way as Chapter I's.

  1. Cut the chapter's text out of Project Gutenberg #11 -> source/text/chNN.txt
  2. Align it to the faster-whisper transcript (tools/transcribe.py) with tools/align.py
  3. Trim the LibriVox file to the text: from 0.7 s before the first word (dropping the
     spoken intro and chapter title) to just before "End of chapter N", with a 1 s
     fade-out; mono, 96 kbps -> public/audio/chNN.mp3
  4. Re-time the words to the trimmed audio -> public/data/chNN_words.json

Usage: python3 tools/narration.py N LIBRIVOX.mp3
  (expects source/audio/chNN_whisper_words.json; needs ffmpeg)
"""
import json
import re
import subprocess
import sys
import tempfile

ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
BOOK = "source/text/pg11_full.txt"


def chapter_text(n):
    book = open(BOOK, encoding="utf-8").read().replace("\r\n", "\n")
    start = book.index(f"\nCHAPTER {ROMAN[n - 1]}.\n")
    nxt = book.find(f"\nCHAPTER {ROMAN[n]}.\n", start) if n < 12 else -1
    end = nxt if nxt > 0 else book.index("\nTHE END", start)
    return book[start:end].strip() + "\n"


def body_ends(text):
    # The chapter body starts after the two heading lines ("CHAPTER II." and its title).
    paras = [p.strip() for p in re.split(r"\n\s*\n", text) if re.search(r"[A-Za-z]", p)]
    body = paras[1:] if paras[0].count("\n") >= 1 else paras[2:]
    first, last = re.sub(r"\s+", " ", body[0]), re.sub(r"\s+", " ", body[-1])
    return first[:24], last[-20:]


def align(txt, whisper, start, end, offset, out):
    subprocess.run([sys.executable, "tools/align.py", txt, whisper, "--from", start, "--to", end,
                    "--offset", str(offset), "--out", out], check=True)
    return json.load(open(out))


def main():
    n, src = int(sys.argv[1]), sys.argv[2]
    nn = f"{n:02d}"
    txt, whisper = f"source/text/ch{nn}.txt", f"source/audio/ch{nn}_whisper_words.json"
    text = chapter_text(n)
    open(txt, "w", encoding="utf-8").write(text)
    first, last = body_ends(text)
    # Underscores (Gutenberg italics) are stripped by align.py, so strip them here too.
    first, last = first.replace("_", ""), last.replace("_", "")

    with tempfile.TemporaryDirectory() as d:
        raw = align(txt, whisper, first, last, 0, f"{d}/raw.json")
    words = [w for p in raw["paragraphs"] for w in p]
    t0 = max(0.0, words[0]["s"] - 0.7)
    segs = json.load(open(whisper))
    closing = [s["start"] for s in segs if re.search(r"end of (the )?chapter", s["text"], re.I) and s["start"] > words[-1]["e"] - 1]
    t1 = min(words[-1]["e"] + 1.2, closing[0] - 0.3) if closing else words[-1]["e"] + 1.2
    dur = t1 - t0
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t0:.2f}", "-to", f"{t1:.2f}", "-i", src, "-ac", "1", "-b:a", "96k",
                    "-af", f"afade=t=out:st={dur - 1:.2f}:d=1", f"public/audio/ch{nn}.mp3"], check=True)
    out = align(txt, whisper, first, last, round(t0, 2), f"public/data/ch{nn}_words.json")
    print(f"Chapter {ROMAN[n - 1]}: kept {t0:.1f}-{t1:.1f} s ({dur:.0f} s), {out['matched']:.1%} of words matched directly")


if __name__ == "__main__":
    main()
