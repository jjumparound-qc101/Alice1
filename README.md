# Alice's Adventures in Wonderland: An Interactive Novel

A Library of Living Books title: the book's text and a full-cast narration, staged as a 2.5D Victorian toy theater with Tenniel's engravings.

## Current state: riverbank vertical slice
This covers Chapter I from the opening line to "…how in the world she was to get out again." See [docs/SLICE_01_RIVERBANK.md](docs/SLICE_01_RIVERBANK.md) for what it tests and what it found.

```sh
npm install
npm run dev          # open http://localhost:5173
npm run smoke        # with the dev server running: headless run, screenshots in smoke-shots/
```

Controls:
- **Watch mode** (default): the narration plays and the staging follows it. Space pauses. Click any word on the page to jump there.
- **Explore mode** (Tab or the Explore button): walk with W A S D, look by dragging or with ← →, and press E near something to inspect it. The look arc is limited to about 90°.

## Layout
| Path | What |
|---|---|
| `src/` | three.js app: the set (`stage.js`), puppets (`puppet.js`), staging timeline (`timeline.js`), book page (`narration.js`), Explore mode (`explore.js`), placeholder art (`art.js`, `ink.js`) |
| `public/` | Shipped assets: the Rabbit cutout, the narration clip, the aligned word timings |
| `source/` | Inputs the assets are built from: the plate scan, its mask, the book text, raw speech-to-text timings |
| `tools/` | `cutout.py` (engraving → cutout), `transcribe.py` and `align.py` (narration → word timings), `smoke.mjs` (headless check) |
| `docs/` | Art direction, amendments, the Chapter I asset list, slice notes |
| `PROVENANCE.md` | The source of every asset, including any AI involvement |

## Rebuilding assets
The Python tools need Pillow, NumPy and SciPy (`cutout.py`), or faster-whisper (`transcribe.py`).

```sh
# Narration: download Chapter I from the LibriVox recording (see PROVENANCE.md), then
python3 tools/transcribe.py ch01.mp3 source/audio/ch01_whisper_words.json
ffmpeg -ss 14.0 -to 111.4 -i ch01.mp3 -ac 1 -b:a 96k -af "afade=t=out:st=96.6:d=0.8" public/audio/ch01_slice.mp3
python3 tools/align.py source/text/ch01.txt source/audio/ch01_whisper_words.json \
  --from "Alice was beginning" --to "get out again." --offset 14.0 --out public/data/ch01_slice_words.json

# Rabbit cutout
python3 tools/cutout.py source/plates/tenniel_w01-1_white_rabbit_victorianweb.jpg public/art/rabbit_w01-1.png \
  --poly source/plates/tenniel_w01-1_white_rabbit.poly.json
```
