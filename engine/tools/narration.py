"""Prepare a chapter's narration for the game. Run from the book's folder; reads its book.json.

  1. Cut the chapter's text out of the book's Project Gutenberg text -> source/text/chNN.txt;
     with "typeset" in book.json, Gutenberg's plain quotes and double hyphens become the
     printed book's curly quotes and em dashes
  2. Align it to the faster-whisper transcript (tools/transcribe.py) with tools/align.py
  3. Trim the LibriVox file to the text: from 0.7 s before the first word (dropping the
     spoken intro, cast list and chapter title) to just before "End of ...", with a 1 s
     fade-out; mono, 96 kbps -> public/audio/chNN.mp3
  4. Re-time the words to the trimmed audio -> public/data/chNN_words.json
  Then run tools/forced_align.py N to re-time every word against the sound itself.

book.json (in the book's folder), e.g. the Carol's:
  { "text": "source/text/pg46_full.txt", "chapters": ["I", "II", "III", "IV", "V"],
    "heading": "\\nSTAVE {roman}:", "end": "*** END OF THE PROJECT GUTENBERG",
    "heading_paragraphs": 1, "typeset": { "elisions": ["em", "Change", "prentices?", "tis", "twas"] } }
  heading: the text that starts each chapter, {roman} filled in; end: the text after the last one;
  heading_paragraphs: paragraphs before the chapter's first line (left out: the heading is one
  paragraph if it spans two lines, as Alice's "CHAPTER I.\\nDown the Rabbit-Hole", else two).

Usage: python3 engine/tools/narration.py N source/audio/<the LibriVox file>.mp3
  (expects source/audio/chNN_whisper_words.json; needs ffmpeg)
"""
import json
import os
import re
import subprocess
import sys
import tempfile

BOOK = json.load(open("book.json", encoding="utf-8"))
ROMAN = BOOK["chapters"]
ALIGN = os.path.join(os.path.dirname(os.path.abspath(__file__)), "align.py")
# Words that begin with an apostrophe (elisions), not an opening single quote.
ELIDED = re.compile(r"(?<![A-Za-z])'(?=(" + "|".join((BOOK.get("typeset") or {}).get("elisions", ["em"])) + r")\b)")


def typeset(text):
    """Gutenberg's plain quotes and double hyphens -> the printed book's curly quotes and em dashes."""
    text = re.sub(r"--\n(?!\n)", "—", text)  # a dash at a line end joins the lines
    text = text.replace("--", "—")
    text = ELIDED.sub("’", text)
    text = re.sub(r"(?<![A-Za-z0-9.,!?;:—-])'(?=\S)", "‘", text)  # opening single quote
    text = text.replace("'", "’")  # apostrophes and closing single quotes
    paras = re.split(r"(\n\s*\n)", text)
    for i, p in enumerate(paras):
        # Every paragraph has an even number of double quotes: they open and close in turn.
        k = 0

        def swap(_):
            nonlocal k
            k += 1
            return "“" if k % 2 else "”"
        paras[i] = re.sub('"', swap, p)
    return "".join(paras)


def chapter_text(n):
    book = open(BOOK["text"], encoding="utf-8").read().replace("\r\n", "\n")
    head = lambda k: BOOK["heading"].replace("{roman}", ROMAN[k])
    start = book.index(head(n - 1))
    end = book.index(head(n), start) if n < len(ROMAN) else book.index(BOOK["end"], start)
    text = book[start:end].strip()
    return (typeset(text) if BOOK.get("typeset") else text) + "\n"


def body_ends(text):
    # The chapter body starts after its heading paragraph(s).
    paras = [p.strip() for p in re.split(r"\n\s*\n", text) if re.search(r"[A-Za-z]", p)]
    skip = BOOK.get("heading_paragraphs") or (1 if paras[0].count("\n") >= 1 else 2)
    body = paras[skip:]
    # align.py looks these up in the raw text, so take them from within one line.
    first, last = body[0].split("\n")[0].strip(), body[-1].split("\n")[-1].strip()
    return first[:24], last[-20:]


def first_word_start(src, w):
    """When the transcript gives the first word over a second (on Stave II it swallowed the spoken
    title, "The First of the Three Spirits"), the word starts after the last pause inside that span."""
    if w["e"] - w["s"] <= 1.0:
        return w["s"]
    log = subprocess.run(["ffmpeg", "-hide_banner", "-ss", f"{w['s']:.2f}", "-to", f"{w['e'] + 0.5:.2f}", "-i", src,
                          "-af", "silencedetect=n=-35dB:d=0.25", "-f", "null", "-"], capture_output=True, text=True).stderr
    ends = [w["s"] + float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
    ends = [e for e in ends if e < w["e"] + 0.2]  # the real word can begin right where the transcript ends it
    return ends[-1] if ends else w["s"]


def align(txt, whisper, start, end, offset, out):
    subprocess.run([sys.executable, ALIGN, txt, whisper, "--from", start, "--to", end,
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
    start = first_word_start(src, words[0])
    t0 = max(0.0, start - 0.7)
    segs = json.load(open(whisper))
    closing = [s["start"] for s in segs if re.search(r"end of (the )?(chapter|stave|staff|stay|a christmas)", s["text"], re.I) and s["start"] > words[-1]["e"] - 1]
    t1 = min(words[-1]["e"] + 1.2, closing[0] - 0.3) if closing else words[-1]["e"] + 1.2
    dur = t1 - t0
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t0:.2f}", "-to", f"{t1:.2f}", "-i", src, "-ac", "1", "-b:a", "96k",
                    "-af", f"afade=t=out:st={dur - 1:.2f}:d=1", f"public/audio/ch{nn}.mp3"], check=True)
    out = align(txt, whisper, first, last, round(t0, 2), f"public/data/ch{nn}_words.json")
    w0 = out["paragraphs"][0][0]
    if w0["s"] < start - t0:  # the transcript ran the stave title into the first word
        w0["s"] = round(start - t0, 2)
        json.dump(out, open(f"public/data/ch{nn}_words.json", "w"), indent=0, ensure_ascii=False)
    print(f"{ROMAN[n - 1]}: kept {t0:.1f}-{t1:.1f} s ({dur:.0f} s), {out['matched']:.1%} of words matched directly")


if __name__ == "__main__":
    main()
