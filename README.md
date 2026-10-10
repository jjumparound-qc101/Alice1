# Alice's Adventures in Wonderland: An Interactive Novel

A Library of Living Books title: the book's text and a full-cast narration, staged as a 2.5D Victorian toy theater with Tenniel's engravings.

## Current state: Chapter I rough cut
The whole of Chapter I plays, in four scenes: the riverbank, the fall, the passage and the hall. See [docs/CHAPTER_01_ROUGHCUT.md](docs/CHAPTER_01_ROUGHCUT.md). The earlier riverbank slice is described in [docs/SLICE_01_RIVERBANK.md](docs/SLICE_01_RIVERBANK.md).

```sh
npm install
npm run dev          # open http://localhost:5173
npm run smoke        # with the dev server running: headless run, screenshots in smoke-shots/
```

Controls:
- **Watch mode** (default): the narration plays and the staging follows it. Space pauses. Click any word on the page to jump there.
- **Text layout** (L or the Text button): bottom strip, top strip or side page.
- **Explore mode** (Tab or the Explore button): walk with W A S D, look by dragging or with ← →, and press E near something to inspect it. The look arc is limited to about 90°.

## Layout
| Path | What |
|---|---|
| `src/` | three.js app: chapter engine (`main.js`), scenes (`scenes/`), cue words (`cues.js`), staging helpers (`track.js`), riverbank set (`stage.js`), puppets (`puppet.js`), book page (`narration.js`), Explore mode (`explore.js`), placeholder art (`art.js`, `props.js`, `ink.js`) |
| `public/` | Shipped assets: the Rabbit cutout, the narration clip, the aligned word timings |
| `source/` | Inputs the assets are built from: the plate scan, its mask, the book text, raw speech-to-text timings |
| `tools/` | `cutout.py` (engraving → cutout), `transcribe.py` and `align.py` (narration → word timings), `smoke.mjs` (headless check) |
| `godot/` | Godot 4.4 version of the slice, kept for reference after Gate A chose three.js (docs/GATE_A.md). Not maintained. |
| `docs/` | Art direction, amendments, color rule, the Chapter I asset list, slice notes, Gate A comparison, art prompts |
| `PROVENANCE.md` | The source of every asset, including any AI involvement |

## Rebuilding assets
The Python tools need Pillow, NumPy and SciPy (`cutout.py`), or faster-whisper (`transcribe.py`).

```sh
# Narration: download Chapter I from the LibriVox recording (see PROVENANCE.md), then
python3 tools/transcribe.py ch01.mp3 source/audio/ch01_whisper_words.json
ffmpeg -ss 14.0 -to 733.9 -i ch01.mp3 -ac 1 -b:a 96k -af "afade=t=out:st=718.9:d=1" public/audio/ch01.mp3
python3 tools/align.py source/text/ch01.txt source/audio/ch01_whisper_words.json \
  --from "Alice was beginning" --to "finished off the cake." --offset 14.0 --out public/data/ch01_words.json

# Rabbit cutout
python3 tools/cutout.py source/plates/tenniel_w01-1_white_rabbit_victorianweb.jpg public/art/rabbit_w01-1.png \
  --poly source/plates/tenniel_w01-1_white_rabbit.poly.json
```
