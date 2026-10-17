# The engine, and how a book uses it

The Library of Living Books engine shows a public-domain book's text in sync with a full-cast LibriVox reading, staged as a 2.5D Victorian toy theater: flat paper cutouts in layered three.js sets, a moving camera that follows the narration (Watch), free walking in a scene (Explore), phones and tablets, and an Electron wrapper for Steam.

It was built for *Alice's Adventures in Wonderland* (`jjumparound-qc101/Alice1`) and separated out for *A Christmas Carol* (`jjumparound-qc101/Carol1`) on 2026-10-15, so that every book shares one engine.

## How books share it
- **This repository holds only the engine** (`src/`, `fonts/`, `electron/`, `tools/`, `docs/`, `template/`).
- **Each book has its own repository** with its text, recording, art, scenes and characters, and a pinned copy of this repository in its `engine/` folder (a git subtree, squashed). A book builds and runs from its own repository alone; GitHub Actions need no extra access.
- **Updates are deliberate**: an engine change is made here, committed and pushed, then pulled into each book when that book is ready for it (see "Updating a book" below). A change made for one book can't break another without that book taking the update.

## A book's folder
| Path | What |
|---|---|
| `engine/` | This repository (git subtree). Don't edit it in place without sending the change back here (below). |
| `index.html` | The page: the book's title, subtitle and notes; links `/engine/src/style.css` and loads `/src/main.js` (copy `template/index.html`; the element ids are the engine's) |
| `src/main.js` | `import { startBook } from '@engine/main.js'; import { BOOK } from './book.js'; startBook(BOOK);` |
| `src/book.js` | The book's settings for `startBook` (below) |
| `src/chapters.js` | The chapters: titles, which are narrated (`NARRATED`), their scenes (`STAGED`), plates, tints, tailpieces |
| `src/scenes/`, `src/sets/`, `src/props*.js` | The book's scenes, sets and code-drawn props |
| `vite.config.js` | The `@engine` alias for `engine/src` |
| `book.json` | The book's text source and chapter headings, for `engine/tools/narration.py` |
| `public/` | Shipped assets: `audio/chNN.mp3`, `data/chNN_words.json`, `art/…` |
| `source/` | Inputs: the book text, plates, AI originals, speech-to-text transcripts (the LibriVox originals are downloaded, not committed) |
| `tools/` | The book's own tools (art processing per place, a fuller smoke test with its key moments) |
| `package.json` | `"main": "engine/electron/main.cjs"`, `"productName"` (the window title), scripts pointing at `engine/tools/` |
| `.github/workflows/desktop.yml` | Windows build and Linux smoke test on every push |
| `CLAUDE.md`, `docs/HANDOFF.md`, `PROVENANCE.md` | Session rules, where things stand, the source of every asset |

## `startBook(book)`
```js
// src/book.js
import { CHAPTERS } from './chapters.js';
export const BOOK = {
  chapters: CHAPTERS,
  storage: { place: 'carol.place.v1', speed: 'carol.speed.v1' },   // localStorage keys, one set per book
  lead: 'scrooge',                                                     // the cast member the camera keeps in the picture
  async loadArt(loadTexture) {                                         // shared art by name, and anything else scenes need
    return { ai: { 'leech/p2_marleys_ghost': await loadTexture('art/leech/p2_marleys_ghost.webp') }, extras: {} };
  },
  cast({ ai, art, drawn, Puppet, extras }) {                           // the puppets shared by every chapter
    return { scrooge: new Puppet({ stand: art('scrooge/stand', 1.7) }, 1.7) };
  },
};
```
- A **chapter** (`chapters.js`) is `{ n, label, roman, title, narrated, audio, words, scenes, tints, tailpiece, plate }`. `label` is what the book calls its chapters ("Chapter", "Stave"); it is used on the contents, the end card and the title pages. `plate` names a picture in the shared art for the placeholder title page.
- A **scene** is `{ id, title, start(cue), parts?(cue), turn?, build({ group, ai, cue, ...extras }) }`; `build` returns `{ T, bg, fog, bounds, hotspots, camera(t), actors(t), update?(t, cast, camera) }`. A chapter without scenes yet uses `placeholder(ch, { note })` from `@engine/scenes/placeholder.js`.
- Engine modules for scenes: `@engine/track.js` (camera tracks, paths, `withLead`), `@engine/cues.js` (cue words; `cue.start` is the first word's time), `@engine/puppet.js`, `@engine/stage.js` (`paperFlat`, `halo`), `@engine/ink.js` (engraving helpers), `@engine/thoughts.js` (thought vignettes), `@engine/theatre.js` (the theatre opening, below).

## Colour
How much of the drawings' colour shows is set per scene (Carol 2026-10-15, its docs/COLOR.md): a scene's `build()` may return `colour(t)`, 0 (ink on paper: each drawing's brightness mapped from the engine's ink to its paper) to 1 (as drawn); without it, 1. It applies to every `paperFlat` (and so every puppet); a flat made with `paperFlat(tex, w, h, { keepColour: true })` keeps its colour (fire, candles, a glowing face). Meshes a scene makes with its own materials are not affected. `window.__slice.colour` is the shared value (for checks).

## The theatre opening
Every book opens the same way (owner, Alice 2026-10-14; Carol 2026-10-15): from a seat in the stalls of a Victorian theatre (the series' auditorium and row of audience, `art/`), looking at the book's own toy-theatre front with the stage beyond; a hold of about five seconds, then the camera rises up the aisle over the heads and into the first scene as the reading begins.
1. The book's front: an AI drawing of a toy-theatre proscenium with a blank banner (Alice's and Carol's share one layout; give the generator the last book's `source/ai/proscenium.png` as reference), processed with `engine/tools/proscenium.py` (cuts out the stage opening, letters the title, writes the opening's size to a `.json`).
2. `book.js` loads it with its json into the shared art, e.g. `ai.proscenium = { ...await loadTexture('art/ai/proscenium.webp'), ...json }`.
3. The first chapter's first scene adds `const house = theatre(group, ai.proscenium)` and starts its camera with `openingKeys(cue.start, firstView, { seat: house.seat, aisle: house.aisle })` (a front given a smaller `open.w` scales the whole theatre, seat included, so the house still fills the picture); a placeholder title page does both with `placeholder(ch, { theatre: 'proscenium' })`.
4. The hold: `python3 engine/tools/lead_silence.py 1 --first 5.0` adds silence before the first word (rerun it after `narration.py` or `forced_align.py`).
- `window.__slice` exposes the running book to the check tools (`chapters`, `begin`, `audio`, `cast`, `lead`, `scenes`, `cue`, `ready`).

## Tools (run from the book's folder)
| Tool | What |
|---|---|
| `engine/tools/transcribe.py` | Speech-to-text with word times (faster-whisper; `WHISPER_MODEL=base.en` is about 4x faster than real time on 4 cores, `small.en` more accurate and about real time) |
| `engine/tools/narration.py N file.mp3` | Cut chapter N's text (book.json), align it to the transcript, trim the recording -> `public/audio/chNN.mp3`, `public/data/chNN_words.json` |
| `engine/tools/forced_align.py N …` | Re-time every word against the sound (wav2vec2, `$W2V_DIR`; `$W2V_CACHE` to keep its output), two rounds; marks words the readers leave out |
| `engine/tools/smoke.mjs [url] [dir]` | Opens every narrated chapter, screenshots, fails on console errors |
| `engine/tools/chapter_shots.mjs`, `mobile_shots.mjs`, `shot_check.mjs`, `electron_smoke.mjs` | Screenshots of one chapter; phones and tablets; where figures land for a camera key; the packaged desktop app |
| `engine/tools/gen_image.py` | One image from the OpenAI API with the book's style block (`docs/ART_PROMPTS.md`, "## 0. Style block") in front |
| `engine/tools/whitecut.py`, `cutout.py` | Cut an AI drawing out of its white ground; cut a figure out of an engraving scan |
| `engine/tools/web_build.sh OUTDIR` | The build for the playable web link: narration re-encoded at 40 kbps mono, pictures packed (`pack_art.py`), `OUTDIR/page.html` for the artifact |
| `engine/tools/art_usage.mjs URL public/data/art_usage.json` | Records the pictures each chapter shows (steps through every chapter on the dev server); with it the web link loads each chapter's pictures only when the chapter opens. Rerun after changing a chapter's staging (a picture it misses still loads, a moment late) |
| `engine/tools/pack_art.py DIST` | Packs a web build's pictures into a few .json data files (`packs/`, base64, at most 11 MB of pictures each so a file stays under the 16 MB text limit) with an index the game reads (`src/packs.js`), because a web link holds at most 511 files and takes no archives (.zip) |
| `engine/tools/proscenium.py SRC OUT.webp --text "TITLE@x,y,size"` | A book's toy-theatre front for the theatre opening |
| `engine/tools/lead_silence.py N --first 5.0` | Silence before chapter N's first word (the hold in the theatre seat) |

## The playable web link
A book's web link is a claude.ai artifact, which holds at most **511 files and 256 MB** per version, **15 MB per file** (16 MB per text file); one publish sends at most 255 files / 64 MB (more go up in several publishes to the same link). `engine/tools/web_build.sh OUTDIR` makes a build that fits: the narration at 40 kbps mono (the desktop build keeps 96 kbps) and every picture under `art/` packed into a few files (`pack_art.py`; the page names the index as `window.ART_PACKS`, and `loadTexture` and the end cards' tailpieces read from the packs; the packs are let go once the pictures are made). Alice: 519 files and 204 MB became about 43 files and 170 MB (base64 makes the pictures a third larger). **Loading by chapter**: with the book's `public/data/art_usage.json` (`engine/tools/art_usage.mjs`), the packs are grouped by the first chapter that shows each picture, the textures are made empty at start (their shapes from the index), and a chapter's pictures load when it is opened (a note on the start screen for the first chapter, a card if a chapter is opened before its pictures are in), the next chapter's in the background while reading. Alice's first chapter: 24 MB instead of 121 MB before the book can start. Pictures a chapter shows that the record missed load a moment late (the render loop checks twice a second and logs `picture loaded late`). Publish `OUTDIR/page.html` with `root` = `OUTDIR/dist` and the files that changed. A book too big even so (e.g. a very long narration) needs a link per part, or another host.

## Updating a book to the latest engine
In a session with both repositories:
```sh
cd <book>
git subtree pull --prefix engine https://github.com/jjumparound-qc101/LoLBookEngine main --squash -m "Engine: <what changed>"
```
Then run the book's smoke test, look at a few screenshots, and push.

## Changing the engine while working on a book
Prefer making the change in this repository (clone it next to the book), push it, then pull it into the book as above. If a change was made inside a book's `engine/` folder, send it here before anything else touches the engine:
```sh
cd <book>
git subtree push --prefix engine https://github.com/jjumparound-qc101/LoLBookEngine main
```
Record every engine change in `docs/CHANGES.md` (newest first), with the books it was checked against.
