# Engine changes (newest first)

## 2026-10-17: thought bubbles in their picture's own shape
- `thoughts.js`: each bubble is an oval in its picture's own shape (width / height, kept between 0.6 and 2.2), at the area a standard bubble (1024:720) would have, within the same share of the picture; it was one shape for every picture, which cut off the edges of round, upright and very wide ones (owner, Alice 2026-10-17: "every thought bubble resized to fit the image"). `style.css`: the picture fills its bubble (2% overscan under the outline instead of 6%).
- A book's thought pictures should be drawn as ovals filling their own box (Alice: `tools/ch2_art.py` `vignette()` now keeps each drawing's own shape and leaves the outline to the bubble). Rectangular pictures lose only their corners, as before.
- Checked against: Alice1 (six bubbles at desktop size, phones and a tablet; full smoke test). Books to take it: all (Carol1 and pp1 when they next update; their pictures keep working, in their own shape).

## 2026-10-17: no mirror-image guests in the theatre opening
- `theatre.js`: the row of stalls ran on at each end in mirrored copies of itself, which showed flipped copies of its end guests (owner, Alice 2026-10-16). It now runs on in empty chairs (`art/theatre_seat_empty.webp`, the row's own empty chair), the first at each end laid over the row's half-cut end chair; the row itself is `art/theatre_seats_row.webp` (its cut edges rounded off). Both made by `tools/theatre_seats.py` in Alice1.
- Checked against: Alice1 (its own copy of the opening, `src/sets/riverbank.js`, changed the same way: screenshots at six screen shapes, the rise up the aisle, smoke test) and Pride and Prejudice (pp1, chapter 1's opening with this `theatre.js`, wide screen: each guest once, no console errors). Books to take it: Carol1 and pp1.

## 2026-10-17: art packs for the web link
- `src/packs.js` (new) and `main.js`: when the page names an art pack index (`window.ART_PACKS`), `loadTexture` and the chapters' `tailpiece` read pictures from the packs (each pack fetched once, let go after the book's art has loaded); otherwise nothing changes (dev server, desktop app).
- `thoughts.js`: a thought card shows a picture from a pack as a canvas copy (its object URL is let go once loaded); other pictures as before (`<img>` by URL). Found by the smoke test: the cards were blank. `style.css`: the card's canvas styled as its img.
- `tools/pack_art.py` (new): packs a web build's pictures (`art/**/*.webp|png|jpg`) into uncompressed .zip files of at most 14 MB with `packs/index.json`, and names the index in `index.html`.
- `tools/web_build.sh`: runs `pack_art.py` after the 40 kbps narration step; prints the file count and size.
- Why: a web link (claude.ai artifact) holds at most 511 files and 256 MB; Alice's build was 519 files (504 published) and 204 MB, so no new art could go on her link. Now 41 files and 135 MB.
- Checked against: Alice1 (the packed web build served locally: full smoke test; the dev server, unpacked). Books to take the update: all, before their next web link publish (Alice1 now; Carol1 and pp1 when convenient).

## 2026-10-17: narration end marker
- `tools/align.py`: finds the chapter's closing words at their last occurrence, not their first. A chapter whose last line is short ("away.") was cut at an earlier "passed away." (Pride and Prejudice chapter 30 lost its second half).
- Checked against: Pride and Prejudice (pp1; chapter 30 re-made, all 1229 words timed; every other chapter's word count unchanged). Every book can take it; only re-made narration changes.

## 2026-10-16: colour toy-theatre fronts
- `tools/proscenium.py --color`: keeps a watercolour front's colours (paper-tinted as before). Without the flag the output is unchanged (checked: identical file).
- Checked against: Pride and Prejudice (pp1; its front made with --color, chapter 1's theatre opening, screenshots, smoke test). Alice and the Carol need no update.

## 2026-10-15: chapter screenshots wait for the book
- `tools/chapter_shots.mjs`: waits until the book has loaded (`window.__slice`, as `smoke.mjs` does) instead of a fixed 1.5 s, which was too short once a book loads a whole stave of pictures (the Carol's Stave I, about 21 MB).
- Checked against: Carol1 (Stave I, screenshots). Every book can take it; only the tool changes.

## 2026-10-15: image rate limits
- `tools/gen_image.py`: calls are spaced at least `--min-interval` s apart (default 4 s, at most 15 a minute, across runs) and a rate-limit answer (429) is waited out and retried up to 5 times (owner: stay inside OpenAI's limits). Other errors (e.g. no credits) stop at once, as before.
- Checked against: Pride and Prejudice (pp1; four calls in a row, spacing and the error path). Every book can take it; nothing else changes.

## 2026-10-15: Alice on the engine (branch)
- No engine change. Alice1 moved onto the engine on branch `claude/awesome-mayer-w24dxk`: her art list, loads and cast in `src/book.js` (with `storage.upgrade()` for her first saves), her riverbank set in `src/sets/riverbank.js`, her own tools in `tools/`. Checked: her full smoke test on the old and moved versions, screenshots identical apart from timing in the test. Not merged yet (the owner tries the branch's Windows build first).
- Still Alice-only, to bring in book-neutral when needed: `frame_report.mjs`, `jerk_report.mjs`, `walk_report.mjs`, `explore_edges.mjs` (they read `cast.alice`; use `window.__slice.lead`), `assets_master.py`, `compose_poses.py`.

## 2026-10-15: colour per scene
- `stage.js`: `COLOUR` (shared), a shader step on every paper flat that maps the drawing to ink on paper by `1 - COLOUR`; `paperFlat(..., { keepColour: true })` for lights. `main.js` sets it each frame from the active scene's `colour(t)` (1 when a scene has none, so Alice, Pride and Prejudice and every scene without it look exactly as before).
- Checked against: Carol1 (Stave I's title page at 1, 0.5 and 0.1, screenshots; no console errors).

## 2026-10-15: colour cut-outs
- `tools/whitecut.py --color`: keeps a watercolour drawing's colours (white still becomes paper, the same tint as before). Without the flag nothing changes (checked: identical output).
- Checked against: Pride and Prejudice (pp1; Elizabeth cut out, smoke test). Alice and the Carol need no update (they don't use the flag).

## 2026-10-15: older saves
- `book.storage.upgrade()` (optional): the reader's place from an older save format when the book's current key is empty (Alice's 'alice.place.v1', Chapter I only).

## 2026-10-15: the theatre opening for every book
- `src/theatre.js`: `theatre(group, proscenium)` adds a book's toy-theatre front, the auditorium around it and the row of stalls before the seat (from Alice's riverbank set, now the series': `art/theatre_house.webp`, `art/theatre_seats.webp`); `openingKeys(start, firstView)` holds in the seat, then rises up the aisle into the scene as the reading begins.
- `scenes/placeholder.js`: `placeholder(ch, { theatre: 'proscenium' })` opens a chapter's title page in the theatre.
- `cues.js`: `cue.start`, the first word's time.
- New tools: `proscenium.py` (a book's front: opening cut out, title lettered, opening size in a .json), `lead_silence.py` (the hold before the first word).
- `gen_image.py`: `--style none` for prompts that carry their own style.
- Checked against: Carol1 (Stave I's opening, screenshots; smoke test).

## 2026-10-15: the engine on its own
Separated from the Alice project (Alice1, branch `claude/literary-game-experience-1de414`, 2026-10-15) by way of the Carol project's copy.
- `startBook(book)` in `src/main.js`: the book supplies its chapters, storage keys, shared art (`loadArt`), cast and lead. Alice's built-in cast, art lists and Tenniel plates are gone from the engine.
- Chapters have a `label` ("Chapter", "Stave") used on the contents, end card and title pages; the placeholder title page shows the chapter's `plate` beside it and takes its own note lines.
- Fonts bundled with the engine (`fonts/`, referenced from `src/style.css`).
- Electron wrapper: serves the book's `dist/` from `app.getAppPath()`, window title from the book's `productName`.
- `tools/narration.py` reads the book's `book.json` (text, chapter headings, typesetting of plain quotes and dashes); finds the pause before the first real word when the transcript runs a spoken chapter title into it.
- `tools/forced_align.py`: a second round in which each paragraph is aligned together with its neighbours (only its own words kept), so the sound decides where paragraphs meet; this fixes paragraphs whose opening the transcript misheard or dropped (Carol: 80 faint words before, 61 after, the runs of wrongly faint words gone). `$W2V_CACHE` keeps the model's output for quick reruns.
- `tools/transcribe.py`: `WHISPER_MODEL` and `WHISPER_THREADS`.
- New: `tools/smoke.mjs` (any book), `tools/web_build.sh` (the web link, narration at 40 kbps), `template/`.
- Checked against: Carol1 (smoke test, all five staves).
- Not yet in the engine (still in Alice1): `frame_report.mjs`, `jerk_report.mjs`, `walk_report.mjs`, `explore_edges.mjs`, `assets_master.py`, `compose_poses.py`, `proscenium.py` and the theatre opening. Move them in, made book-neutral, when Alice moves onto the engine.
