# Handoff: read this first
Updated: 2026-10-10 (end of session 2: Chapters VIII–X staged). For the next Claude Code session (or anyone) picking up the work.

## The project in one paragraph
*Alice's Adventures in Wonderland* as an interactive novel for Steam (a "Library of Living Books" title). The book's text is shown in sync with the LibriVox full-cast reading, staged as a 2.5D Victorian toy theater: flat engraving-style cutouts in layered 3D sets, with a moving camera (Watch mode) and free walking with a 90° look arc (Explore mode). Black-and-white ink, except things the text gives a colour (docs/COLOR.md). Engine: three.js + Vite, wrapped in Electron for desktop and Steam (Gate A: docs/GATE_A.md).

## Where the project stands
- **The whole book is readable**: all twelve chapters have narration aligned to the text (95–99% of words matched directly). Unstaged chapters play on an engraved title page with the text in sync.
- **The whole book is staged (Chapters I–XII)** start to finish as rough cuts, mostly with placeholder art drawn in code. Each has a rough-cut note: `docs/CHAPTER_0N_ROUGHCUT.md`.
- **Art**: 13 of 324 AI images received and in the game (hall floor, lamp, curtain, little door, glass table, Alice walking A/B, Alice jumping; the golden key, DRINK ME bottle, EAT ME cake, glass box and fan via `tools/small_props.py`), plus the earlier riverbank/shaft masters and Alice's model sheet. Everything else is a placeholder.

| Chapter | Asset list | Staged | Scenes (`src/scenes/`) |
|---|---|---|---|
| I Down the Rabbit-Hole | ART_PROMPTS "Chapter I asset list v2" | ✓ | `riverbank`, `shaft`, `passage`, `hall` |
| II The Pool of Tears | CHAPTER_02_ASSETS.md | ✓ | `pool` |
| III A Caucus-Race | CHAPTER_03_ASSETS.md | ✓ | `bank` |
| IV The Rabbit Sends in a Little Bill | CHAPTER_04_ASSETS.md | ✓ | `rabbit.js`: `lane`, `house`, `wood` |
| V Advice from a Caterpillar | CHAPTER_05_ASSETS.md | ✓ | `caterpillar.js`: `mushroom`, `treetops`, `clearing` |
| VI Pig and Pepper | CHAPTER_06_ASSETS.md | ✓ | `duchess.js`: `doorstep`, `kitchen`, `wood6` |
| VII A Mad Tea-Party | CHAPTER_07_ASSETS.md | ✓ | `teaParty.js`: `teaParty`, `hallAgain`, `garden` |
| VIII The Queen's Croquet-Ground | CHAPTER_08_ASSETS.md | ✓ | `croquet.js`: `roseTree`, `croquet` (set: `src/sets/croquet.js`) |
| IX The Mock Turtle's Story | CHAPTER_09_ASSETS.md | ✓ | `mockTurtle.js`: `duchessWalk`, `gryphon`, `mockTurtle` (set: `src/sets/seashore.js`) |
| X The Lobster Quadrille | CHAPTER_10_ASSETS.md | ✓ | `quadrille.js`: `quadrille` (seashore set) |
| XI Who Stole the Tarts? | CHAPTER_11_ASSETS.md | ✓ | `court.js`: `trial` (set: `src/sets/court.js`) |
| XII Alice's Evidence | CHAPTER_12_ASSETS.md | ✓ | `evidence.js`: `evidence`, `waking` (court and riverbank sets) |

## Open decisions for the owner
None.

## Next steps, in order
1. **Drop in art as the owner sends it** (see "When art arrives"). The owner sends art in batches.
2. Polish each chapter as its art arrives (each CHAPTER_NN_ROUGHCUT.md lists its gaps).
3. Later (owner's decision; the whole book is now staged): low-end hardware test, code signing, high-resolution Tenniel scans (NYPL/British Library; Victorian Web images are only 432 px tall).

## How a chapter is done (the owner's process)
1. Read the chapter (`source/text/chNN.txt`) and its Tenniel plates (Victorian Web `…/tenniel/alice/N.M.html`; download the `.jpg` to look).
2. Write **`docs/CHAPTER_NN_ASSETS.md`** (places, plates, colours, poses, characters, sets, vignettes, coverage), then the prompts as a "## Chapter … asset list" section at the end of **`docs/ART_PROMPTS.md`** (numbered lines starting `` N. `file.png` ``; a section headed `### Not needed…` is left out of the master list).
3. Run **`python3 tools/assets_master.py`** to rebuild **`docs/ASSETS_MASTER.md`** (the one document the owner generates art from). Never edit the master by hand.
4. Put any colour or staging decision to the owner **with a recommendation**, and wait.
5. Stage it: placeholders in `src/propsN.js`, scenes in `src/scenes/<name>.js` exporting `CHAPTER_N`, new puppets in `main.js`'s `cast`, register in `src/chapters.js` (`STAGED`). Get cue times with a quick script over `public/data/chNN_words.json` (see "Cue words" below).
6. Check it: `node tools/chapter_shots.mjs http://localhost:5173/ <outdir> N [t1,t2,…]`, contact-sheet the images, **look at them**, fix, repeat. Add a few moments to `tools/smoke.mjs`; run it (all chapters, ~15 min, run in the background).
7. Write `docs/CHAPTER_NN_ROUGHCUT.md`, update this handoff's table, commit, push, republish the web link.

## When art arrives
- **Card people** (owner, 2026-10-11): numbered cards arrive as bodies with a plain white face; print each card's pips on them in code (reuse `PIP_LAYOUT` and `suitColour` in props8.js, mapped onto the drawn face). Court cards and the court's hearts arrive with solid black suit signs: recolour the solid black heart and diamond shapes red when processing (a new step for `tools/whitecut.py` or a small tool), leaving clubs and spades black.
- **'Direct' Tenniel figures** are being generated as AI from the plates (owner, 2026-10-11); scans are an optional upgrade.
- Uploads that arrive mid-turn aren't saved; ask the owner to resend as a normal message. Screenshots are low quality: ask for the downloaded original.
- Save the original to `source/ai/<name given in the prompt>.webp|png`. Process it: `tools/whitecut.py` (cut out from white, paper-tint; `--clear x,y;…` clears enclosed gaps; `--opaque` for full-frame art), `tools/compose_poses.py` (Alice whole-figure poses, scaled to the model sheet; `DRAWN` list), `tools/hall_props.py` (an example of a set-piece pipeline), `tools/small_props.py` (small props: key, bottle, cake, glass box, fan; gold colouring, see-through glass). Output to `public/art/ai/…`.
- Wire it into the scene in place of the placeholder; screenshot and look.
- **Log every asset in PROVENANCE.md** (AI disclosure for Steam), then rerun `python3 tools/assets_master.py` (ticks it).
- Alice's model sheet is `source/ai/alice_turnaround.webp`: every Alice drawing must match it.

## The owner
Works on Windows, with VS Code and GitHub; not a programmer. Prefers brief, kind, factual replies with honest pushback, and decisions put to them with a recommendation. Generates the AI art in ChatGPT (one conversation for everything) and uploads it; you write the prompts. Tests the web link and the Windows build from GitHub Actions.

## Where things are
- **Repo**: `jjumparound-qc101/Alice1`, branch `claude/literary-game-experience-1de414`. Commit and push there. No PR has been asked for.
- **Playable web link** (private artifact, updated on each milestone): https://claude.ai/artifact/Run3pVwccFBgcP6AHgktXj. To republish: `npx vite build --base ./ --outDir <scratch>/dist`, strip `<!doctype>/<html>/<head>/<body>/<meta>` from `dist/index.html` into a page file, publish it with `root` = dist and the changed files in `files` (new hashed JS bundle, any new art/audio); remove the old hashed bundle with `null`.
- **Windows build**: every push runs `.github/workflows/desktop.yml`; the owner downloads "Alice-windows-x64" from the latest Actions run (includes `steam_appid.txt` = 480 for Steam testing).
- **Art to generate**: `docs/ASSETS_MASTER.md`. **Why each asset**: `docs/CHAPTER_NN_ASSETS.md`. **Decisions**: `docs/AMENDMENTS.md` (newest first). **Colours**: `docs/COLOR.md`. **Asset sources and AI disclosure**: `PROVENANCE.md`.

## Owner decisions so far (details in AMENDMENTS.md / COLOR.md)
- Card people: coloured like real cards (red hearts and diamonds, black clubs and spades), period pip layouts with no corner numbers, one pack of 52 with each card person unique (`SOLDIERS`, `COURTIERS`, `CHILDREN`, `GUESTS`, `OFFICERS` in props8.js). Replaces the earlier "ink" decision.
- Text layouts are a reader setting; spot colours only where the text names a colour; spot colours richer, with a slight glow.
- Alice's poses are whole figures (no jointed puppet); the composed running poses are retired; one walk cycle for all movement.
- Alice's model sheet is the turnaround. Tenniel plates are references for Alice, cut out directly only for other figures.
- Chapter III's bank is the pool's edge on the hall floor (Alice tiny). Chapter IV's "W. RABBIT" plate is brass-coloured. Chapter V's Father William poem is shown in Tenniel's own four plates.
- One master asset document, rebuilt after each chapter list.
- Low-end testing, signing and high-res scans wait until the whole book is done.

## Code map
| File | What |
|---|---|
| `src/main.js` | Book engine: loads shared art, the cast of puppets (`cast`), opens a chapter (builds its sets on first open; points narration, text, timeline and end card at it), picks the active scene by narration time, scene turns (`paper`/`dark`), Watch/Explore, saves the place per chapter, contents menu, text layouts, speed, chapter end |
| `src/chapters.js` | The twelve chapters: `NARRATED`, `STAGED` |
| `src/scenes/*.js` | One file per chapter (see the table). A scene: `start(cue)`, optional `parts(cue)` (named marks for the contents/timeline/Shift+arrows), `turn`, and `build()` → `{ T, bg, fog, bounds, hotspots, camera(t), actors(t), update?(t, cast) }`. `placeholder.js`: the title page |
| `src/sets/hall.js` | The hall set, shared by Chapters I, II, III, VII |
| `src/sets/croquet.js` | The Queen's garden: rose-tree, flower-pot, croquet-ground (Chapters VIII, IX) |
| `src/sets/seashore.js` | The seashore: sand, sea, the Mock Turtle's rock and ledge (Chapters IX, X) |
| `src/sets/court.js` | The court: throne, Knave, tarts, jury-box and jurors, witness stand, crowds, door (Chapters XI, XII) |
| `src/crowd.js` | Scene-only puppets ("extras": processions, crowds), posed in a scene's `update(t, cast, camera)` |
| `src/props.js` … `props11.js` | Placeholder art drawn in code, per chapter (props.js = Chapter I and shared helpers: `vignette`, `shape`, `line`, `cat`, `SPOT` colours) |
| `src/puppet.js` | Paper-cutout puppets: poses swapped by name; `x z y scale tilt dir`, walking by distance (`walk_a`/`walk_b`), `idle`, `float` (swimmers); `handPoint()` and `carry(obj, puppet)` for held props |
| `src/thoughts.js` | Thought vignettes (oval cards that pop open while the text speaks of them) |
| `src/cues.js` | `at(word, n, after)` and `para(text)` |
| `src/track.js` | `smooth`, `lerp`, `path`, `route` (waypoints; reports `dist` walked), `hop`, `cameraTrack` |
| `src/stage.js`, `art.js`, `ink.js` | Riverbank set, `paperFlat()`, `halo()`; engraving helpers (`hatch`, `flicks`, `shadeEdge`…) |
| `src/navigate.js`, `narration.js`, `explore.js`, `perf.js` | Timeline and skips; the book page; Explore mode; F3 readout |
| `electron/` | Desktop wrapper (Steam via steamworks.js) |
| `godot/` | Gate A comparison only; not maintained |

**Tools**: `narration.py` (prepare a chapter's narration: text, alignment, trimmed audio), `transcribe.py`, `align.py`, `assets_master.py`, `whitecut.py`, `cutout.py` (Tenniel scans, spot colour), `compose_poses.py`, `hall_props.py`, `shaft_strip.py`, `smoke.mjs` (all chapters; fails on console errors), `chapter_shots.mjs` (screenshots of one chapter), `walk_report.mjs` (Alice's steps per second; keep under ~4), `electron_smoke.mjs`.

## Text-strip colours
Colour words in poems and songs (COLOR.md rule 6) are coloured in the text strip once spoken: `TINTS` in `src/chapters.js` ([word, occurrence, colour]), drawn by `src/narration.js`. Set so far: Chapter II "golden", V "grey", X "pale", "brown", "green".

## Cue words
Staging is keyed to words, not seconds. `at('word', n, after)`: the n-th occurrence **at or after** `after`. Count carefully: list a chapter's occurrences first, e.g.
`python3 -c "import json,re; w=json.load(open('public/data/ch08_words.json')); [print(round(x['s'],1), x['t']) for p in w['paragraphs'] for x in p if re.sub(r'[^\w-]','',x['t']).lower() in {'queen','rose'}]"`.
A wrong count throws "cue word not found" when the chapter opens; the scene's camera keys or actions will be wrong silently if the count is off but the word exists.

## Running and checking
- `npm install`, then `npm run dev` (port 5173). In this container start it with `run_in_background` and a long timeout; it stops after its time limit.
- Headless Chromium needs `--use-gl=angle --use-angle=swiftshader` (in the tools). A "Failed to fetch" on the first load right after editing a file is Vite reloading, not a bug; rerun.
- **Always look at the screenshots.** Contact sheets of 4 per row work well.
- Python tools: a scratch venv with `pillow scipy numpy` (`faster-whisper` for transcription; already done for every chapter, transcripts in `source/audio/`).

## Environment quirks (cloud container)
- Network allowlist is set by the owner; allowed so far: github.com, raw.githubusercontent.com, gutenberg.org, victorianweb.org, librivox.org, archive.org and its download hosts, huggingface.co, `*.hf.co`. If a host is denied, name it and point the owner to the environment's network settings.
- Files sent to the owner directly are limited to 30 MB; big builds go through GitHub Actions.

## Known gaps (across chapters)
- Almost every character and set is a placeholder; the rough-cut notes list each chapter's.
- `walk_b` is from a phone screenshot (near profile); a full-size three-quarter redraw is wanted.
- Giant Alice (Chapters II, IV) is a scaled standing/sitting figure until the giant poses arrive.
- At tiny scale the hall floor's cracks look very large.
- Chapter I leftovers from Notes 1.0: the leaf heap (note 4), the garden behind the little door (note 8), the Rabbit's hop (note 6) wait on their art.
