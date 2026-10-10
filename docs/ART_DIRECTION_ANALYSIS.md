# Art Direction Analysis: 2D vs 2.5D vs 3D
Project: Alice's Adventures in Wonderland: An Interactive Novel
Date: 2026-10-09
Status: Owner leaning 2.5D. To be confirmed in Gate A, alongside the engine choice.

## Recommendation
2.5D "pop-up book / Victorian toy theater":
- flat, hand-drawn Tenniel-style characters and scenery
- arranged in layered 3D sets
- explored with a moving camera

It keeps the most fidelity per dollar, it's the most feasible approach for a solo developer working with Claude Code, and it gives Library of Living Books a signature look it can reuse.

## Scorecard (1 = poor, 5 = excellent)

| Criterion | 2D | 2.5D | 3D |
|---|---|---|---|
| Fidelity to Tenniel | 5 | 5 | 3 |
| Fit with spec's Explore Mode | 2 | 4 | 5 |
| Watch Mode quality | 4 | 5 | 5 |
| Asset cost | 5 | 4 | 2 |
| Asset complexity | 5 | 4 | 1 |
| Claude Code effectiveness | 5 | 4 | 2 |
| Solo-developer feasibility | 5 | 4 | 2 |
| Player hardware requirements | 5 | 4 | 2 |
| Brand reusability | 3 | 5 | 3 |
| Total | 39 | 39 | 25 |

2D and 2.5D tie on points. 2.5D wins on the two things the spec cares most about: real exploration and a memorable identity.

## What each approach requires

### 2D (flat scenes, side-on or panning)
- Assets: Tenniel scans, new poses in matching style, characters cut into puppet layers.
- Animation: 2D skeletal or cutout rigs. Engines like Godot have this built in, so no extra license is needed.
- Explore Mode: panning, zooming, and hotspots. Free roaming is lost, which is a meaningful spec change.
- Main risk: it can feel like a motion comic rather than a world.

### 2.5D (recommended)
- Assets: the same 2D art, plus scenery split into depth layers (foreground, midground, background, set pieces).
- Animation: the same cutout rigs as 2D, placed in 3D space.
- Explore Mode:
  - walk a floor plane through each diorama
  - look around within a limited arc, with no view of the flat edges
  - inspect hotspots
  This satisfies "freely moves through chapter environments," with constraints.
- Main risks:
  - Flat characters seen from steep angles. Fix by limiting the camera arc, turning characters to face the camera, and adding a slight paper thickness as an intentional style.
  - New art must match Tenniel's hand closely.

### 3D
- Assets: turnaround reference sheets for each character, then image-to-3D generation (e.g. Meshy, about $20/month Pro with a commercial license), cleanup, retopology, and rigging. Non-human characters (Caterpillar, Mock Turtle, Gryphon, Dodo) need heavy manual work.
- Look: an ink-line shader approximates Tenniel, but the result is a reinterpretation of his art, not his art.
- Main risks:
  - highest cost and schedule risk
  - inconsistent AI-generated meshes
  - Claude Code can't judge 3D visual quality well

## Cost picture
- Software: 2D and 2.5D can run on a free engine (e.g. Godot) plus free Blender. 3D adds an ongoing image-to-3D subscription.
- Art is the real cost in every option. It scales with the number of characters (around 40 speaking roles) and the number of poses each one needs.
- New art comes from an artist (get quotes) or an AI image tool. AI art must be logged in PROVENANCE.md and disclosed on Steam.
- Voice is covered by the LibriVox full-cast reading, which is public domain. The existing ElevenLabs credits can patch gaps.

## Chapter I asset scope (for sizing)
- Characters: Alice, the White Rabbit, Alice's sister.
- Sets: riverbank, the rabbit-hole fall (shelves, jars, maps), hall of doors, the small door and garden view, the table with bottle and cake.
- Effects: Alice shrinking and growing, which suits 2.5D well because it's a scale change on a flat cutout.

## Suggested de-risk step
Before full Chapter I production, build one vertical-slice scene: the riverbank, through the Rabbit passing by. It should include:
- one cutout-rigged character
- one layered set
- camera exploration
- synced LibriVox narration

This validates the look, the animation workflow, and the audio sync at low cost.

## Owner decisions for the art-style test (2026-10-09)
1. Color: black-and-white ink, matching Tenniel's engravings.
2. Art source: Tenniel scans used directly, with AI only to fill hidden areas and missing poses. Every AI-filled asset is logged in PROVENANCE.md.
3. Build: in Claude Code using the /passes workflow.
4. Tech for the test: Node and three.js. Add Rapier only if a real need appears.
   - The final engine is decided after the test.
   - A custom three.js-based engine is acceptable if Gate A shows it's the right choice. This amends the spec's caution against defaulting to a custom engine.
   - Gate A must still compare it honestly against Godot, including what a custom engine would need: the staging timeline, puppet animation, saves, UI, and Steam packaging.
5. Camera: free walking on the floor plane, with a look arc of about 90°. This is the default; adjust after the test.

## Proposed amendment (for docs/AMENDMENTS.md once confirmed)
> 2026-10-09: Art direction changed from fully explorable 3D to 2.5D "pop-up book / toy theater." Characters and scenery are hand-drawn, Tenniel-based 2D art in layered 3D sets with a moving camera. Explore Mode keeps free movement within each diorama, with a constrained camera arc. Reason: higher fidelity to the original illustrations, lower cost and risk, better fit for the Claude Code workflow, and a reusable visual identity for Library of Living Books. Pending confirmation in Gate A.
