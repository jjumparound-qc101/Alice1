# Chapter II Rough Cut: "The Pool of Tears"
Date: 2026-10-10
Status: Plays start to finish (11 minutes) in the Chapter I hall, with placeholder figures and props drawn in code where the AI art hasn't arrived (list and prompts: CHAPTER_02_ASSETS.md, ART_PROMPTS.md).

## How it's built
- One scene, `src/scenes/pool.js`, in the shared hall set (`src/sets/hall.js`, also used by Chapter I). Its named **parts** show in the contents and the timeline, and Shift+←/→ jumps between them: Nine feet high, A pool of tears, The White Rabbit returns, Who in the world am I?, Shrinking again, Splash!, The Mouse, The birds and animals.
- Narration: `public/audio/ch02.mp3` and `public/data/ch02_words.json`, made with `tools/narration.py 2 …` (98.8% of words matched directly).

## What happens
| Text | Staging |
|---|---|
| "Curiouser and curiouser! … opening out like the largest telescope" | Alice grows from ten inches beside the table to giant size; the camera looks down at her far-off feet |
| "her head struck against the roof of the hall … took up the little golden key" | Her head reaches the roof; she takes the key and goes to the garden door |
| "lying down on one side … began to cry again … a large pool all round her" | She sits by the door and cries (falling tears); the pool spreads over half the hall and rises to four inches |
| The Rabbit returns, "If you please, sir—" | He trots in with the white kid gloves and fan, jumps, drops them and runs off into the dark |
| "Alice took up the fan and gloves … fanning herself" | She fans herself as she talks; thoughts of Ada's ringlets and Mabel's house, and the crocodile with gold scales |
| "she had put on one of the Rabbit's little white kid gloves … went to the table to measure herself" | She shrinks at the table to two feet, then smaller; drops the fan |
| "ran with all speed back to the little door … shut again … key was lying on the glass table" | Tiny Alice runs to the shut door; the key is back on the table |
| "her foot slipped, and … splash!" | She falls into the pool; the camera drops to the water |
| The seaside, the walrus, the Mouse, Dinah, the terrier | Thought vignettes; the Mouse swims up, leaps in fright, bristles, swims away and back |
| "a Duck and a Dodo, a Lory and an Eaglet … swam to the shore" | The birds swim in; everyone swims to the shore |

## Art (2026-10-11: all 36 Chapter II images in)
Every Chapter II asset is now the AI drawing: Alice's 13 poses (`tools/compose_poses.py`), the Rabbit's three, the Mouse's four, the four birds swimming (and standing, for Chapter III), the gloves, the splash, the pool's water, the stones of the far shore and the seven thoughts (`tools/ch2_art.py`). Only the falling tears are still drawn in code (`src/props2.js`).
- The shore drawing's doors and table leg are dropped: only its band of stones is used, laid round the far side of the pool, because the 3D hall stands behind.
- The Rabbit's gloves and fan are drawn in his trotting and starting poses; the separate props appear when they land. Likewise Alice's fanning, reciting, glove and dropping poses draw the fan and gloves.
- Spare versions (not used): `source/ai/fan_v2.webp`, `alice_jump_v2.webp`.

## Known gaps
- The key goes from her hand back to the table off-camera while she cries (the text only says it "was lying on the glass table as before").
- The Mouse's "quite pale" face isn't shown (no pose for it).
- The water texture is busy right at water level; it may want a lighter tint after a look on a real screen.
- No Explore-mode hotspots for the Rabbit's things or the swimmers.
