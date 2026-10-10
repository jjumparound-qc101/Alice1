# Handoff: read this first
Updated: 2026-10-10. For the next Claude Code session (or anyone) picking up the work.

## The project in one paragraph
*Alice's Adventures in Wonderland* as an interactive novel for Steam (a "Library of Living Books" title). The book's text is shown in sync with the LibriVox full-cast reading, staged as a 2.5D Victorian toy theater: flat engraving-style cutouts in layered 3D sets, with a moving camera (Watch mode) and free walking with a 90° look arc (Explore mode). Black-and-white ink, except things the text gives a colour (docs/COLOR.md). Engine: three.js + Vite, wrapped in Electron for desktop and Steam (Gate A: docs/GATE_A.md). Chapter I plays start to finish as a rough cut.

## The owner
Works on Windows, with VS Code and GitHub; not a programmer. They prefer brief, kind, factual replies with honest pushback, and decisions put to them with a recommendation. They generate the AI art in ChatGPT and upload it; you write the prompts (docs/ART_PROMPTS.md). They test the web link and the Windows build from GitHub Actions.

## Where things are
- **Repo**: `jjumparound-qc101/Alice1`, branch `claude/literary-game-experience-1de414`. Commit and push there. No PR has been asked for.
- **Playable web link** (private artifact, updated on each milestone): https://claude.ai/artifact/Run3pVwccFBgcP6AHgktXj. To republish: `npx vite build --base ./ --outDir <scratch>/dist`, strip `<html>/<head>/<body>` from `dist/index.html` into a page file, publish it with `root` = dist and the changed asset files in `files`. Remove old hashed JS bundles with `null`.
- **Windows build**: every push runs `.github/workflows/desktop.yml`. The owner downloads the "Alice-windows-x64" artifact from the latest Actions run. It includes `steam_appid.txt` = 480 (Valve's Spacewar test app) for Steam testing.
- **Decisions**: docs/AMENDMENTS.md (newest first). **Colours**: docs/COLOR.md. **Asset sources and AI disclosure**: PROVENANCE.md, which must be updated for every asset.
- **Chapter I status and gaps**: docs/CHAPTER_01_ROUGHCUT.md.

## Code map
| File | What |
|---|---|
| `src/main.js` | Chapter engine: loads art, builds every scene, picks the active scene by narration time, page-turn fade, Watch/Explore, saves the reader's place (localStorage), text layouts, end fade |
| `src/scenes/*.js` | `riverbank`, `shaft` (the fall), `passage`, `hall`. Each has `start(cue)` and `build()`, which returns `{ T, bg, fog, bounds, hotspots, camera(t), actors(t), update?(t) }` |
| `src/cues.js` | `at(word, n, after)`: time of the n-th occurrence of a word. **Count occurrences carefully**: "box" #1 is "box her own ears"; "telescope" vs "telescopes". Prefer an `after` anchor |
| `src/track.js` | `smooth`, `path`, `route` (waypoints), `cameraTrack` (eased keys) |
| `src/puppet.js` | Paper-cutout puppets: whole-figure poses swapped by name. Supports `y`, `scale`, `tilt`, `sink`. Alternates `run_a`/`run_b` while a standing figure moves |
| `src/stage.js` | Riverbank set and `paperFlat()` (a card with paper edge) |
| `src/props.js`, `src/art.js`, `src/ink.js` | Placeholder art drawn in code (engraving style); `SPOT` colours |
| `src/narration.js` | Book page (bottom, top or side layout), click-a-word-to-seek |
| `src/explore.js` | Explore mode |
| `src/perf.js` | F3 readout: fps, GPU, Steam status |
| `electron/` | Desktop wrapper (`app://` protocol, Steam via steamworks.js, preload) |
| `tools/` | `align.py` (text↔audio word timings), `transcribe.py` (faster-whisper), `cutout.py` (Tenniel scans), `whitecut.py` (AI art on white → paper-tinted cutout), `shaft_strip.py`, `rig_parts.py`, `compose_poses.py`, `smoke.mjs` (headless browser check, screenshots), `electron_smoke.mjs` |
| `godot/` | Gate A comparison only; not maintained |

## Running and checking
- `npm install`, then `npm run dev` (port 5173). `node tools/smoke.mjs http://localhost:5173/ <outdir>` takes screenshots of about 19 moments across all scenes plus Explore mode, and fails on console errors. **Always look at the screenshots after a staging change.** Read them in contact sheets.
- Headless Chromium needs `--use-gl=angle --use-angle=swiftshader` (already in smoke.mjs).
- In this container, start the dev server with `run_in_background` (it has a time limit, so restart it when needed).
- Python tools: make a scratch venv with `pillow scipy numpy` (and `faster-whisper` for transcription).

## Environment quirks (cloud container)
- The network allowlist is set by the owner. These hosts have been allowed at some point: github.com, raw.githubusercontent.com, gutenberg.org, victorianweb.org, librivox.org, `*.archive.org` download hosts (dnXXXX.ca.archive.org; archive.org itself flickers), huggingface.co and `*.hf.co`. If a host is denied, say which one and ask the owner to allow it.
- Uploads that arrive *mid-turn* aren't saved to disk. Ask the owner to resend them as a normal message.
- Files sent to the owner directly are limited to 30 MB. Big builds go through GitHub Actions.

## Art in hand
- **Tenniel**: White Rabbit with watch (W-01-1), cut out with pink eyes. Web resolution only; the NYPL Berg 1866 high-resolution source is still to be checked (the host needs allowing).
- **AI masters** (ChatGPT, OpenAI image generation; see PROVENANCE): riverbank sky, tree line, tree, hedge, grass; Alice turnaround (standing pose), sitting, two parts sheets, torso; the sister reading; two shaft walls (combined into a repeating strip; the ORANGE MARMALADE jar lifted out as its own sprite).
- **Composed**: Alice running (`run_a`, `run_b`). The parts sheets lack the mid-skirt, so a jointed puppet doesn't work and poses are whole figures (AMENDMENTS).
- **Still placeholders drawn in code**: passage walls, leaf heap, hall (walls, doors, lamps, floor), curtain, little door, garden view, key, bottle, cake, poker vignette.

## Owner's Notes 1.0 (2026-10-10): the backlog, with a plan for each
Status key: ☐ to do. The owner's answers to the open questions are at the end of this section once given.

1. ☐ **Handoff**: this document.
2. ☐ **Walking legs look wrong.** The composed stride is a running pose used for walking, and its legs read oddly at walking speed. Plan: when the owner's walk-cycle art arrives (ART_PROMPTS "Chapter I asset list v2"), add `walk_a`/`walk_b` and choose walk or run by speed. Until then, consider showing the standing pose with a gentle bob when walking slowly (speed under about 1 m/s), and the stride only when running.
3. ☐ **Golden key floats in front of her.** In `src/scenes/hall.js`, `hand()` uses a guessed offset. Plan: put the key at the hand actually drawn in the current pose (near-side hand at about x +0.13·h and y 0.47·h for the standing turnaround, mirrored by `dir`), slightly in front of her card (z +0.02), tilted, and scaled with her. Better still, use the new "holding" pose art when it arrives.
4. ☐ **Heap of sticks and leaves looks bad.** Replace `leafHeap()` with the AI asset ("leaf_heap" prompt).
5. ☐ **Passage Rabbit and corner transition.** (a) The Rabbit must be visible from the start of the passage scene, far away in the dark (z about -12, dimmed by fog), until he runs and turns the corner. Today he pops in at "passage" and out at "corner". (b) Replace the bright paper flash at the corner/scene change: fade fully to black, switch scenes while black, then fade up in the hall *from dark*, as if the lamps light it (animate fog/brightness up over about 2 s). Add a per-transition style to the engine (`turn: 'paper' | 'dark'`).
6. ☐ **Going down the hole looks like sinking into the ground.** Replace `sink` in the riverbank with a hop: a short arc up and forward into the hole mouth (y peak about 0.25 m, about 0.5 s), then a quick drop and scale toward the hole as they vanish *behind the hedge-hole edge*. Do it for both the Rabbit and Alice. Use the "Rabbit hopping" and "Alice jumping" art when it arrives.
7. ☐ **Faster ways through the chapter.** Recommended: (a) a timeline scrubber at the bottom with scene markers (click to jump); (b) ← / → to jump a sentence back or forward, and Shift+← / Shift+→ for the previous or next scene; (c) a playback-speed control (1×, 1.25×, 1.5×, 2×) using `audio.playbackRate` with `preservesPitch`. Waiting on the owner's choice.
8. ☐ **New asset behind the little door.** The text says it leads into "a small passage, not much larger than a rat-hole … into the loveliest garden you ever saw … beds of bright flowers and … cool fountains". Use the AI "garden_through_door" art (prompt written) in place of `garden()`.
9. ☐ **Abrupt ending.** At the chapter's end, fade the narration out, then show a "Chapter I complete" card with buttons: **Explore the hall**, **Replay the chapter**, **Continue to Chapter II** (disabled until it exists). Reuse the end card in `index.html`.
10. ☐ **Second imagined vignette.** After the poker, the text goes on: "if you cut your finger *very* deeply with a knife, it usually bleeds", and "if you drink much from a bottle marked 'poison,' it is almost certain to disagree with you". Stage both as thought vignettes, like the poker: knife and finger (ink only; "bleeds" isn't a stated colour), and a bottle marked "poison". Also consider the earlier imagined ones: Dinah and her saucer of milk, cats and bats, the candle going out. Art prompts are written.
11. ☐ **The Rabbit standing still is lifeless.** While idle (riverbank, at MID and NEAR_HEDGE), add life: a small rhythmic rock (±3°), a slight bounce on his toes every 1–2 s, and an occasional turn toward Alice (mirror flip) or a glance at the watch. Done in `puppet.js` as an `idle` style or in the scene's actor function.
12. ☐ **All Chapter I assets**: see ART_PROMPTS.md "Chapter I asset list v2".
13. ☐ **Chapter II preparation**: the questions were put to the owner; answers go below.
14. ☐ **Colours more vibrant.** The spot colours (pink eyes, golden key, red-hot poker) should be more saturated and luminous. Plan: raise the saturation of the `SPOT` values, multiply less with the engraving (keep the line work but let the colour sit on top), and consider a soft glow on the poker. Check whether the owner also means the paper tone (see their answer).

### Owner's answers (fill in)
- Note 7:
- Note 13:
- Note 14:
