# Vertical Slice 1: The Riverbank
Date: 2026-10-10
Scope: Chapter I, from "Alice was beginning…" to "…how in the world she was to get out again." (about 96 s of narration).
Tech: Node, Vite and three.js. No physics engine; nothing needed one.

## What's in it
| Area | Built | Placeholder or missing |
|---|---|---|
| Set | Layered paper flats: sky, far trees, the sister's tree, the hedge with the rabbit-hole, grass strips, side wings, and a proscenium framing the opening shot. Each flat has a paper edge behind it. | All set art is procedural and drawn in code, waiting for the riverbank master drawing. |
| Characters | The White Rabbit is a cutout of Tenniel's plate (W-01-1). Puppets slide and hop, mirror to face their direction of travel, and turn up to ±34° toward the camera. | Alice and her sister are plain placeholder figures. Poses are whole-figure swaps; there's no swappable-part rig yet (it needs the master drawings). |
| Narration | The LibriVox clip, synced word by word. The book page shows the current phrase and underlines the spoken word. Clicking a word jumps there. | — |
| Watch mode | Ten camera moves keyed to words in the text. All staging is a function of narration time, so jumping anywhere stays consistent. | No transitions or effects beyond the closing fade. |
| Explore mode | Walk the floor inside fixed bounds, with a 90° look arc and ±14° pitch. Two inspectable hotspots (the sister's book, the rabbit-hole). Narration pauses while exploring. | No character idles in Explore mode, and no sound. |

## What it showed
1. **The toy-theater look holds up.** Tenniel's engraved Rabbit sits naturally among the ink-style flats, and the proscenium opening works as an establishing shot. The placeholder figures clash with the engraving, as expected; the master drawings are needed before judging the full look.
2. **Cutting out engravings needs a hand-traced mask.** The automatic fill failed wherever Tenniel's outline is open, and grass hatching joins the figure to the ground. A hand-traced polygon of about 50 points fixed it. Plan on manual masking for each pose and part, at a finer level with high-resolution scans. This adds to the art workload in CHAPTER_01_ASSETS.md.
3. **Audio sync is cheap and reliable.** Speech-to-text timings matched to the book text gave 99.3% of words a direct timing, and the rest were interpolated. Cues are written as words ("the second *ran*"), not seconds, so re-cutting the audio moves the staging with it.
4. **The 90° arc with side wings hid the set edges at the positions tested.** The smoke test reaches the arc limit at one spot (the front-right of the walkable area). Edge-checking across the whole walkable area hasn't been done yet.
5. **The text strip competes with the action.** Shots are framed to keep characters above it, but this is a design question for Watch mode: a toggle, a side page, or a page that turns between shots.

## Not covered yet (needed for Gate A)
- Swappable-part puppet rig and a staging-timeline editor; cues are hand-written in code for now.
- Saves, settings and menus, accessibility (caption size, reduced motion), controller input.
- Desktop packaging for Steam (Electron or Tauri around this build, compared against Godot).
- Performance on low-end hardware. It has only run in headless Chromium with software rendering.
- High-resolution scan source for the plates (to be recorded in PROVENANCE.md).

## How to check it
`npm run dev`, then `npm run smoke` saves screenshots of nine story moments and two Explore views, and fails on any console error.
