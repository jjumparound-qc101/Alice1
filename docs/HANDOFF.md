# Handoff: read this first
Updated: 2026-10-13 (end of session 3: Chapters I–II art in, Chapter III's Alice and birds, the Caterpillar and Cheshire Cat generated directly by API; word timings re-aligned; thoughts and Alice kept in frame). For the next Claude Code session (or anyone) picking up the work.

## The project in one paragraph
*Alice's Adventures in Wonderland* as an interactive novel for Steam (a "Library of Living Books" title). The book's text is shown in sync with the LibriVox full-cast reading, staged as a 2.5D Victorian toy theater: flat engraving-style cutouts in layered 3D sets, with a moving camera (Watch mode) and free walking with a 150° look arc (Explore mode). Black-and-white ink, except things the text gives a colour (docs/COLOR.md). Engine: three.js + Vite, wrapped in Electron for desktop and Steam (Gate A: docs/GATE_A.md).

## Where the project stands
- **The whole book is readable**: all twelve chapters have narration aligned to the text (95–99% of words matched directly).
- **The whole book is staged (Chapters I–XII)** start to finish as rough cuts, mostly with placeholder art drawn in code. Each has a rough-cut note: `docs/CHAPTER_0N_ROUGHCUT.md`.
- **A bug fixed 2026-10-14**: since session 3 a bad edit gave the Caterpillar an invalid height (NaN), so he was missing in Chapters IV–V and the smoke test logged an error. Fixed; run the smoke test after every batch.
- **The asset master list** (`docs/ASSETS_MASTER.md`, rebuilt by `tools/assets_master.py`, never edited by hand): 98 of 371 images received. Chapter I's list also records art made outside it (### Already in the game).
- **Phones and tablets** are supported (book layout upright, picture-first sideways, touch controls), and **Explore** has a 150° look arc and a walking stick on touch screens.
- **Art in the game** (all logged in PROVENANCE.md):
  - **Chapter I**: nearly complete. All of Alice's poses (falling, kneeling, crying, eating, holding, reaching, landing on the leaf heap), the White Rabbit (owner's sheet: watch, trot, from behind; white with pink eyes), every wall, floor and ceiling (hall, shaft sides, passage), the leaf heap, the garden through the little door, the coloured marmalade jar (orange label, empty glass), and thoughts (Dinah ×2, the stairs, the globe; in the hall, holding the bottle: the little histories, the red-hot poker, the knife, the poison bottle, 2026-10-14; the hall's thoughts now sit beside her head). All the hall's thoughts are in (the candle, telescope and croquet added 2026-10-14). Still placeholder: antipodes/Dinah-down/dream (39–41), the Rabbit's run_side/hop/idle_b (10, 12, 13), the chapter end (33).
  - **The opening, from a seat** (owner, 2026-10-14): the camera starts in the stalls of a Victorian theatre (auditorium + a row of audience backs, `tools/proscenium.py --house`) looking at the toy stage, holds a few seconds, rises up the aisle over the heads and into the scene.
  - **The toy-theatre front** (proscenium, 2026-10-14): AI drawing with the Cheshire Cat, card suits, a pocket watch and footlights, title lettered in code (`tools/proscenium.py`); a paper surround hides the landscape outside it; the opening shot starts further back to show it whole.
  - **The sky** (2026-10-14): a summer sky with large soft clouds and haze at the horizon, shared by every outdoor scene (`tools/bank_art.py`).
  - **The fourth wall** (owner, 2026-10-14): no theatre seats; Explore's sides continue each scene's world (more trees and sky outdoors, the room's walls indoors). Check each explorable scene for gaps when re-directing its camera.
  - **Riverbank ground** (2026-10-14, owner): meadow grass with daisies tiled over the floor and a grassy bank lip in front (`tools/bank_art.py`; `BANK_TILE` in stage.js = 1.6 m per tile). Later, at Chapter XII: the pool with reeds beside the bank (owner: "at the right time").
  - **Chapter II**: complete (all 36): Alice ×13, Rabbit ×3, Mouse ×4, the four birds swimming and standing, gloves, splash, pool water, shore stones, 7 thoughts.
  - **Chapter III**: all 8 Alice poses and the four birds standing; the rest placeholder.
  - **Chapter V**: the Caterpillar (blue), also at Chapter IV's end. **Chapter VI**: the Cheshire Cat in the wood (on his bough, the empty bough, the grin alone); the Cat on the kitchen hearth (prompt 22), the Duchess (all her poses, prompts 14–16), the Footmen (10–13: the letter is in the Fish-Footman's drawing, the bow is one drawing of both), the Cook (17, 18), the baby and the pig (19–21; the snout drawing also stands for the pig in its clothes), the kitchen's back wall (23; the side walls are still drawn in code). Alice's 9 poses (2026-10-14: laughing, peeping, knocking, sneezing, jumping in terror, catching and holding the baby, carrying it, the pig, from behind under the Cat). Camera re-directed (2026-10-14): Alice in the picture at least every ~10 s (frame_report). Sets and props done 2026-10-14: the little house (also V), the March Hare's house (also VII), the kitchen's side walls (kitchen made deeper so the camera stays inside), the thrown things. Not needed: the stool (hidden by her skirts, owner), the pepper-box (in the Cook's drawing), a separate bough tree (the Cat's drawing has its bough). The Cat waving and the two thoughts done too: **Chapter VI's art is complete** apart from the extras the owner ruled out.
  - **Chapters IX–X**: the Mock Turtle, every pose (sitting, sobbing into a handkerchief, counting, hiding his face, dancing, singing, yawning; the rock taken out of the sitting drawing so he sits on the set's ledge; puppet `drop` lets his tail hang below his hooves), and the Duchess in Chapter IX (arm in arm, trembling, running). `tools/ch9_art.py` processes both and prints each drawing's height and drop. The Gryphon, every pose (sitting, asleep, walking, paws up, hiding his face, dancing, bounding), 2026-10-14. Chapter XII's dream shows the new Duchess, baby, Gryphon and Mock Turtle.
  - The rest of the book is placeholder art drawn in code.
- **Alice's walk**: two matching steps from one drawing (`alice_walk_pair`); keep it. **Do not generate the walk cycle** (owner, 2026-10-13: the owner will make it later; the API attempts got the arms and legs wrong).
- **Chapter I's audio starts with 4.14 s of added silence** (owner, 2026-10-14: a 5 s hold in the theatre seat before "CHAPTER I"; `lead_silence` in ch01_words.json, all times shifted). If `tools/narration.py`/`forced_align.py` is ever rerun for Chapter I, add the silence and the shift again (original audio: `ffmpeg -ss 4.14`).
- **Narration timing**: every word re-timed against the audio (`tools/forced_align.py`, wav2vec2); 51 words the readers leave out are shown faint, explained under Contents → "Why are some words faint?".

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
- **Remind the owner** (asked 2026-10-11) when Chapter XI art begins: the Tenniel frontispiece (the trial) is needed as the reference for the court prompts and isn't on Victorian Web. The owner downloads it from a scan of the 1865/66 edition, or adds commons.wikimedia.org to the network allowlist so Claude can fetch it.

## Next steps, in order
1. **Generate art by API** chapter by chapter (see "Generating art directly"), showing the owner each new character's first picture; or drop in art the owner sends (see "When art arrives"). Next: 
2. **Re-direct each chapter's camera as its art arrives** (Alice in frame every 10–15 s; `tools/frame_report.mjs`). Worst: XI, XII, III (VI done).
3. Work through the owner's patch notes as they come.
4. Regeneration list (owner: "later"): `alice3_wonder` (should look down at the tail), optional closer `alice3_ring` (from behind) and `alice3_bow` (facing right, taking the thimble).
5. Later (owner's decision): low-end hardware test, code signing, high-resolution Tenniel scans.

## How a chapter is done (the owner's process)
1. Read the chapter (`source/text/chNN.txt`) and its Tenniel plates (Victorian Web `…/tenniel/alice/N.M.html`; download the `.jpg` to look).
2. Write **`docs/CHAPTER_NN_ASSETS.md`** (places, plates, colours, poses, characters, sets, vignettes, coverage), then the prompts as a "## Chapter … asset list" section at the end of **`docs/ART_PROMPTS.md`** (numbered lines starting `` N. `file.png` ``; a section headed `### Not needed…` is left out of the master list).
3. Run **`python3 tools/assets_master.py`** to rebuild **`docs/ASSETS_MASTER.md`** (the one document the owner generates art from). Never edit the master by hand.
4. Put any colour or staging decision to the owner **with a recommendation**, and wait.
5. Stage it: placeholders in `src/propsN.js`, scenes in `src/scenes/<name>.js` exporting `CHAPTER_N`, new puppets in `main.js`'s `cast`, register in `src/chapters.js` (`STAGED`). Get cue times with a quick script over `public/data/chNN_words.json` (see "Cue words" below).
6. Check it: `node tools/chapter_shots.mjs http://localhost:5173/ <outdir> N [t1,t2,…]`, contact-sheet the images, **look at them**, fix, repeat. Add a few moments to `tools/smoke.mjs`; run it (all chapters, ~15 min, run in the background).
7. Write `docs/CHAPTER_NN_ROUGHCUT.md`, update this handoff's table, commit, push, republish the web link.

## Generating art directly (owner, 2026-10-13)
- `python3 tools/gen_image.py OUT "PROMPT" --ref FILE …`: OpenAI image API, default **gpt-image-2.5-sunburst** (owner, 2026-10-13: a quarter of the tokens of gpt-image-2; gpt-image-2 as fallback), streamed (the proxy drops requests silent for ~30 s), the style block from ART_PROMPTS.md put in front. Tokens per high-quality picture: about 1,500 with gpt-image-2.5-sunburst, 5,600 with gpt-image-2. If the safety filter rejects a request (it once flagged a reference showing child Alice beside a smoking figure), crop the reference tighter and retry.
- **References are cropped to the target only** (no other figures in the picture: cleaner results, and a plate with child Alice beside a smoking figure tripped the safety filter).
- **Characters already in the project are referenced by their existing drawings** (e.g. the model sheet and walk pair for Alice, `rabbit_sheet` for the Rabbit, `caterpillar_sit` for the Caterpillar), with the Tenniel plate crop, so every new pose matches.
- Show the owner each new character's first picture before putting it in the game.

## When art arrives
- **Card people** (owner, 2026-10-11): numbered cards arrive as bodies with a plain white face; print each card's pips on them in code (reuse `PIP_LAYOUT` and `suitColour` in props8.js, mapped onto the drawn face). Court cards and the court's hearts arrive with solid black suit signs: recolour the solid black heart and diamond shapes red when processing (a new step for `tools/whitecut.py` or a small tool), leaving clubs and spades black.
- **'Direct' Tenniel figures** are being generated as AI from the plates (owner, 2026-10-11); scans are an optional upgrade.
- The owner may send many images and say "don't process yet": just save each to `source/ai/` under its prompt's name, commit and push, until told to process.
- Uploads that arrive mid-turn aren't saved; ask the owner to resend as a normal message. Screenshots are low quality: ask for the downloaded original.
- Save the original to `source/ai/<name given in the prompt>.webp|png`. Process it: `tools/whitecut.py` (cut out from white, paper-tint; `--clear x,y;…` clears enclosed gaps; `--opaque` for full-frame art), `tools/compose_poses.py` (Alice whole-figure poses, scaled to the model sheet; `DRAWN` list), `tools/hall_props.py` (an example of a set-piece pipeline), `tools/small_props.py` (small props: key, bottle, cake, glass box, fan; gold colouring, see-through glass). Output to `public/art/ai/…`.
- Wire it into the scene in place of the placeholder; screenshot and look.
- **Thought cards must be readable on a phone** (owner, 2026-10-14): draw the thing named large and close (e.g. the POISON label), and `keepThoughtsInView` keeps every open card at least ~220 screen pixels wide. On a small portrait phone a card can then cover part of Alice.
- **Re-direct the chapter's camera when its art arrives** (owner, 2026-10-13): Alice in the picture at least every 10–15 s unless the text takes her out (her point of view, close-ups of a prop, another character alone). Check with `node tools/frame_report.mjs URL N` (lists the stretches with Alice on stage but out of the picture). Watch mode already turns the camera to take her in when a shot only cuts her at the edge, and thought cards are kept in the picture (`keepAliceInFrame` in main.js, `keepThoughtsInView` in thoughts.js). All chapters checked: VI, IX, X re-directed by hand; III, XI, XII use `withAlice` (track.js: in the listed stretches the camera eases out every 12 s to take Alice in) as a stopgap, to be replaced by hand-directed shots when their art arrives (XI's trial pulses out every 12 s for ten minutes).
- **Log every asset in PROVENANCE.md** (AI disclosure for Steam), then rerun `python3 tools/assets_master.py` (ticks it).
- Alice's model sheet is `source/ai/alice_turnaround.webp`: every Alice drawing must match it, thought vignettes included (attach it whenever a girl appears; without it the AI adds a hair bow). The book gives her no bow or ribbon: long loose hair (owner, 2026-10-14).

## The owner
Works on Windows, with VS Code and GitHub; not a programmer. Prefers brief, kind, factual replies with honest pushback, and decisions put to them with a recommendation. Generates the AI art in ChatGPT (one conversation for everything) and uploads it; you write the prompts. Tests the web link and the Windows build from GitHub Actions.

## Where things are
- **Repo**: `jjumparound-qc101/Alice1`, branch `claude/literary-game-experience-1de414`. Commit and push there. No PR has been asked for.
- **Playable web link** (private artifact, updated on each milestone): https://claude.ai/artifact/Run3pVwccFBgcP6AHgktXj. To republish: `npx vite build --base ./ --outDir <scratch>/dist`, strip `<!doctype>/<html>/<head>/<body>/<meta>` from `dist/index.html` into a page file, publish it with `root` = dist and the changed files in `files` (new hashed JS bundle, any new art/audio); remove the old hashed bundle with `null`.
- **Windows build**: every push runs `.github/workflows/desktop.yml`; the owner downloads "Alice-windows-x64" from the latest Actions run (includes `steam_appid.txt` = 480 for Steam testing).
- **Art to generate**: `docs/ASSETS_MASTER.md`. **Why each asset**: `docs/CHAPTER_NN_ASSETS.md`. **Decisions**: `docs/AMENDMENTS.md` (newest first). **Colours**: `docs/COLOR.md`. **Asset sources and AI disclosure**: `PROVENANCE.md`.

## Owner decisions so far (details in AMENDMENTS.md / COLOR.md)
- AI art for the rest of the book: numbered card people with blank faces (game prints pips), court cards and court hearts with solid black suit signs (game recolours), 'Direct' Tenniel figures generated as AI now, the executioner is the Ace of Spades. The court's hearts (canopy, throne, herald's banner) are red.
- Phones: portrait = picture band on top, text below; landscape = two-line strip, folded controls that hide while reading. Explore: 150° look arc, 25° up/down; touch stick.
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
| `src/chapters.js` | The twelve chapters: `NARRATED`, `STAGED`, `TINTS` (colour words in poems and songs) |
| `src/scenes/*.js` | One file per chapter (see the table). A scene: `start(cue)`, optional `parts(cue)` (named marks for the contents/timeline/Shift+arrows), `turn`, and `build()` → `{ T, bg, fog, bounds, hotspots, camera(t), actors(t), update?(t, cast) }`. `placeholder.js`: the title page |
| `src/sets/hall.js` | The hall set, shared by Chapters I, II, III, VII |
| `src/sets/croquet.js` | The Queen's garden: rose-tree, flower-pot, croquet-ground (Chapters VIII, IX) |
| `src/sets/seashore.js` | The seashore: sand, sea, the Mock Turtle's rock and ledge (Chapters IX, X) |
| `src/sets/court.js` | The court: throne, Knave, tarts, jury-box and jurors, witness stand, crowds, door (Chapters XI, XII) |
| `src/crowd.js` | Scene-only puppets ("extras": processions, crowds), posed in a scene's `update(t, cast, camera)` |
| `src/props.js` … `props12.js` | Placeholder art drawn in code, per chapter (props.js = Chapter I and shared helpers: `vignette`, `shape`, `line`, `cat`, `SPOT` colours) |
| `src/puppet.js` | Paper-cutout puppets: poses swapped by name; `x z y scale tilt dir`, walking by distance (`walk_a`/`walk_b`), `idle`, `float` (swimmers); `handPoint()` and `carry(obj, puppet)` for held props |
| `src/thoughts.js` | Thought vignettes (oval cards that pop open while the text speaks of them) |
| `src/cues.js` | `at(word, n, after)` and `para(text)` |
| `src/track.js` | `smooth`, `lerp`, `path`, `route` (waypoints; reports `dist` walked), `hop`, `cameraTrack` |
| `src/stage.js`, `art.js`, `ink.js` | Riverbank set, `paperFlat()`, `halo()`; engraving helpers (`hatch`, `flicks`, `shadeEdge`…) |
| `src/navigate.js`, `narration.js`, `explore.js`, `perf.js` | Timeline and skips; the book page (with `TINTS`); Explore mode (keys, drag, tap-to-walk, hold-to-walk, `stick`); F3 readout |
| `src/sets/panorama.js` | Side scenery (sky, treeline) for outdoor sets, so the 150° look never finds an edge |
| `index.html`, `src/style.css` | Page and controls; phone forms (`body[data-form]`), the More panel, the walking stick |
| `electron/` | Desktop wrapper (Steam via steamworks.js) |
| `godot/` | Gate A comparison only; not maintained |

**Tools**: `bank_art.py` (riverbank ground), `ch9_art.py` (Duchess, Mock Turtle, Gryphon), `gen_image.py` (OpenAI images), `frame_report.mjs` (Alice out of the picture), `white_rabbit.py` (the Rabbit white, pink eyes), `jar_colour.py`, `walls.py` (walls, floors, ceilings), `ch5_art.py`, `ch6_art.py`, `forced_align.py` (re-times every chapter's words against the narration with a wav2vec2 model and marks words the readers leave out, `"x": 1`, shown faint and explained under Contents → "Why are some words faint?"; model files from huggingface.co/Xenova/wav2vec2-base-960h in `$W2V_DIR`; run it after `narration.py`), `ch1_art.py`, `ch2_art.py` (process those chapters' AI drawings), `mobile_shots.mjs` (phone and tablet screenshots), `explore_edges.mjs` (every explorable scene at the edges of its walkable area, looking to the limits of the 150° arc: run it after changing a set), `narration.py` (prepare a chapter's narration: text, alignment, trimmed audio), `transcribe.py`, `align.py`, `assets_master.py`, `whitecut.py`, `cutout.py` (Tenniel scans, spot colour), `compose_poses.py`, `hall_props.py`, `shaft_strip.py`, `smoke.mjs` (all chapters; fails on console errors), `chapter_shots.mjs` (screenshots of one chapter), `walk_report.mjs` (Alice's steps per second; keep under ~4), `electron_smoke.mjs`.

## Text-strip colours
Colour words in poems and songs (COLOR.md rule 6) are coloured in the text strip once spoken: `TINTS` in `src/chapters.js` ([word, occurrence, colour]), drawn by `src/narration.js`. Set so far: Chapter II "golden", V "grey", X "pale", "brown", "green".

## Cue words
Staging is keyed to words, not seconds. `at('word', n, after)`: the n-th occurrence **at or after** `after`. Count carefully: list a chapter's occurrences first, e.g.
`python3 -c "import json,re; w=json.load(open('public/data/ch08_words.json')); [print(round(x['s'],1), x['t']) for p in w['paragraphs'] for x in p if re.sub(r'[^\w-]','',x['t']).lower() in {'queen','rose'}]"`.
A wrong count throws "cue word not found" when the chapter opens; the scene's camera keys or actions will be wrong silently if the count is off but the word exists.

## Running and checking
- **Phones:** `node tools/mobile_shots.mjs URL OUTDIR [chapter:time,…]` screenshots small and large phones (both orientations) and a tablet; the smoke test also shoots one portrait and one landscape page. Forms are set by `resize()` in main.js (`body[data-form]`: portrait, landscape, wide) and styled at the end of style.css.
- `npm install`, then `npm run dev` (port 5173). In this container start it with `run_in_background` and a long timeout; it stops after its time limit.
- Headless Chromium needs `--use-gl=angle --use-angle=swiftshader` (in the tools). A "Failed to fetch" on the first load right after editing a file is Vite reloading, not a bug; rerun.
- **Always look at the screenshots.** Contact sheets of 4 per row work well.
- Python tools: a scratch venv with `pillow scipy numpy` (`faster-whisper` for transcription; already done for every chapter, transcripts in `source/audio/`).

## Environment quirks (cloud container)
- **Use the right environment.** On 2026-10-13 a session started in the owner's new environment "GPT and ElevenLabs", which allowed only the OpenAI and ElevenLabs APIs: victorianweb.org, pypi.org and registry.npmjs.org were refused, so plates couldn't be fetched, scipy couldn't be installed and the game couldn't run (no screenshots, no web link update). Earlier sessions ran in "Default" (trusted network). The owner was asked to give the GPT environment the same network access (see the list in the session's reply), or to start sessions in an environment that has both.
- **pip and npm go through the proxy explicitly**: pypi.org and registry.npmjs.org are on the container's no-proxy list but don't resolve directly. Use `NO_PROXY=localhost,127.0.0.1 no_proxy=localhost,127.0.0.1 pip install --break-system-packages scipy` and `ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm ci --ignore-scripts --proxy "$HTTPS_PROXY" --https-proxy "$HTTPS_PROXY" --noproxy localhost` (2026-10-14; the GPT and ElevenLabs environment now allows victorianweb.org and package managers).
- **OpenAI API**: the key is in the environment (`OPENAI_API_KEY`); api.openai.com is allowed. Requests must stream (the proxy cuts any request silent for ~30 s).
- **GitHub pushes** were refused (403) for a few hours on 2026-10-12 although reads worked; it cleared by itself. If it happens, keep committing, send the owner a `git bundle` as a backup, and retry.
- Network allowlist is set by the owner; allowed so far: github.com, raw.githubusercontent.com, gutenberg.org, victorianweb.org, librivox.org, archive.org and its download hosts, huggingface.co, `*.hf.co`. If a host is denied, name it and point the owner to the environment's network settings.
- Files sent to the owner directly are limited to 30 MB; big builds go through GitHub Actions.

## Known gaps (across chapters)
- Almost every character and set is a placeholder; the rough-cut notes list each chapter's.
- The walk is two matching steps from one drawing (`source/ai/alice_walk_pair.webp`, 2026-10-13); a four-frame cycle (#43) would be smoother but is optional.
- Giant Alice (Chapters II, IV) is a scaled standing/sitting figure until the giant poses arrive.
- At tiny scale the hall floor's cracks look very large.
- Chapter I leftovers from Notes 1.0: the leaf heap (note 4), the garden behind the little door (note 8), the Rabbit's hop (note 6) wait on their art.
- The flying pack, the dream figures and the procession are extras that slide; drawn poses will improve them.
- Mobile was checked in the test browser only (it imitates touch); the owner is trying it on a real phone.
