# Engine changes (newest first)

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
