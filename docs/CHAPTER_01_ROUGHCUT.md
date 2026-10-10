# Chapter I Rough Cut
Date: 2026-10-10
Status: The whole chapter plays start to finish (about 12 minutes). Riverbank art is the interim AI masters; the fall, the passage and the hall are mostly placeholders.

## How it's built
- **One narration file for the chapter** (`public/audio/ch01.mp3`) with word timings (`public/data/ch01_words.json`). The page text follows the voice through the whole chapter.
- **Scenes** (`src/scenes/`): each has its own set and stages its camera and actors from **cue words** in the text (`src/cues.js`), e.g. `at('thump')` or `at('telescope', 1, at('ventured'))`. The engine (`src/main.js`) shows the scene whose start time has passed, with a quick fade through paper between scenes.
- **Saving your place**: the reader's position is saved every few seconds and on pause. The start screen offers "Continue (scene, time)".
- **Explore mode** works in the riverbank, the passage and the hall. It is switched off mid-fall.

## Scenes
| Scene | From | To | What happens | Art |
|---|---|---|---|---|
| Riverbank | "Alice was beginning…" | "…how in the world she was to get out again." | Sister reading, the Rabbit and his watch, the chase, down the hole | AI masters, Tenniel Rabbit |
| The fall | "The rabbit-hole went straight on like a tunnel…" | "thump! thump!" | Alice drifts down; shelves, maps and cupboards pass; she takes the ORANGE MARMALADE jar (empty, all ink, as in the text) and puts it back. The jar is lifted out of the wall art (`tools/shaft_strip.py`), so the shelf jar and the jar in her hand are the same image and size | AI shaft walls; placeholder side walls |
| The passage | landing on the leaves | the corner | She lands, jumps up, chases the Rabbit, who turns the corner and is gone | Placeholder |
| The hall | "a long, low hall…" | "…finished off the cake." | Lamps, locked doors, glass table and golden key, curtain, little door and garden, DRINK ME, the red-hot poker thought, shrinking to ten inches, the key out of reach, crying, the EAT ME cake | Placeholder; Alice is the AI turnaround |

Spot colours so far (docs/COLOR.md): the Rabbit's pink eyes, the golden key, the red-hot poker.

## Known gaps
- **Alice's poses**: standing, sitting and **running** (two stride drawings, alternating as she moves). Falling, kneeling, reaching/climbing, holding the bottle, crying and eating still use standing or sitting; prompts for those are in ART_PROMPTS.md.
- **The Rabbit** is one pose (watch in hand), also used running away down the passage. Tenniel's back view (plate W-02-2) would suit the passage.
- **Placeholder sets**: the passage, the hall, the little door and the garden view need master drawings. The marmalade jar, bottle, cake and poker vignette are drawn in code.
- **Thought vignettes**: only the poker is staged. Dinah and the bats ("Do cats eat bats?") and the candle are not yet.
- **Explore-mode hotspots** exist only for the main props.
