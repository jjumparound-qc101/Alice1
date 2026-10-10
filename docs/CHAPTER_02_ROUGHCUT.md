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

## Placeholders still in use
The Mouse and the four birds (swimming), the white kid gloves, the fan, tears and splash drops, the water surface, and the seven thought vignettes are drawn in code (`src/props2.js`). Alice has no lying, crying, fanning or swimming poses yet: she uses standing and sitting, and swims as her standing figure sunk to the chin.

## Known gaps
- The key goes from her hand back to the table off-camera while she cries (the text only says it "was lying on the glass table as before").
- The Mouse's "quite pale" face isn't shown yet (needs the Mouse art).
- No Explore-mode hotspots for the Rabbit's things or the swimmers.
