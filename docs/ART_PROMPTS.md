# ChatGPT Prompts for the Master Drawings

Interim AI masters (see AMENDMENTS.md, 2026-10-10). Generate them in ChatGPT, then upload the PNGs here. They'll be logged in PROVENANCE.md as `AI` and disclosed on Steam.

## Before you start
1. **Download these Tenniel references** (right-click and save the image on each page):
   - White Rabbit: https://victorianweb.org/art/illustration/tenniel/alice/1.2.html
   - Alice, curtain: https://victorianweb.org/art/illustration/tenniel/alice/1.3.html
   - Alice, "Drink me": https://victorianweb.org/art/illustration/tenniel/alice/1.4.html
   - Alice kneeling in the hall: https://victorianweb.org/art/illustration/tenniel/alice/2.2.html
   - Grass and thistles: https://victorianweb.org/art/illustration/tenniel/alice/4.4.html
2. **Use one ChatGPT conversation for all of them** so the style stays consistent. Paste the style block first, attaching all five references, then each prompt in turn.
3. **Ask for the largest size** it offers. Tall images are portrait (1024×1536), wide ones landscape (1536×1024).
4. **Reject and regenerate** anything with gray wash, soft airbrushed shading, color, text, a signature or a border. Everything must be ink lines and hatching on white.

---

## 0. Style block (paste first, with the five references attached)
```
I'm making art for a game based on Alice's Adventures in Wonderland (1865). Everything must look like John Tenniel's original wood-engraved illustrations, shown in the attached references.

Style rules for every image in this conversation:
- Victorian wood-engraving style after John Tenniel: black ink on pure white paper.
- Shading ONLY with engraved lines: parallel hatching, cross-hatching, and short flicks. No gray tones, no wash, no gradients, no smudging.
- Confident, fine, slightly irregular line work, as if cut into a woodblock and printed.
- No color at all. No text, no signature, no frame or border.
- Pure white background unless I say otherwise.
- Match the proportions, costume and line quality of the attached Tenniel plates exactly.

Reply "ready" and wait for my first request.
```

## 1. Alice turnaround (portrait)
```
Draw a character turnaround sheet of Alice exactly as Tenniel drew her in the attached plates: about 7 years old, long straight hair falling past her shoulders, short puffed sleeves, a knee-length dress with a full skirt, a white pinafore apron with a pocket, plain white stockings, flat strap shoes.

Show FOUR full-body views side by side, all the same height, standing in a neutral pose with arms relaxed at her sides:
1. front, 2. three-quarter front (facing left), 3. side profile (facing left), 4. back.

Keep clear white space between the figures so each can be cut out separately. Feet on one shared invisible baseline. No ground, no shadows, no background. Engraving style as agreed.
```

Then, in the same chat:
```
Now a parts sheet for the same Alice, for a cut-paper puppet. Draw each part separately with white space around it, all at the same scale as the turnaround:
- her head in 3 angles (front, three-quarter left, profile left), with hair attached
- 4 arms: hanging down, bent at the elbow, reaching forward, raised overhead
- 4 hands: open, pointing, holding something small, clasped
- 2 pairs of legs with shoes: standing, mid-run
Engraving style as agreed. No background.
```

## 2. Riverbank (one image per layer)
These become separate layers in the diorama, so ask for each piece as its own image.

**2a. Sky and distant hills (landscape)**
```
Draw the sky and distant countryside behind a riverbank on a hot English summer afternoon in the 1860s: a few soft cumulus clouds, a sky made of fine horizontal engraved lines that are denser at the top, and low rolling hills along the very bottom edge. No trees, no people, nothing in the foreground. Fill the whole image edge to edge. Engraving style as agreed.
```
**2b. Far tree line (landscape)**
```
Draw a long row of distant English deciduous trees (oaks and elms) standing along the bottom third of the image, as seen across a meadow. Shade them with hatching on their right sides, as if lit from the left. Above and around the trees must be pure empty white, so the row can be cut out. No ground beneath them. Engraving style as agreed.
```
**2c. The sister's tree (portrait)**
```
Draw a single large old oak tree in full summer leaf, standing alone: a thick trunk with bark texture, a broad crown, lit from the left. Trunk base flat at the bottom edge. Pure white around it so it can be cut out. No ground, no people. Engraving style as agreed.
```
**2d. Hedge with the rabbit-hole (landscape)**
```
Draw a long, low, thick English hedgerow seen straight on, filling the width of the image. At its base, a little left of center, is a large dark rabbit-hole: an arched opening heavily cross-hatched into darkness, with roots and loose earth around the rim. The top of the hedge is irregular and leafy. Pure white above the hedge so it can be cut out. Engraving style as agreed.
```
**2e. Grass and daisies strip (landscape)**
```
Draw a strip of long meadow grass with a few daisies, as a foreground border: tall grass blades and seed heads rising from the bottom edge, about a third of the image tall, with pure white above. The daisies stay uncolored. Engraving style as agreed.
```

## 3. Rabbit-hole shaft wall (portrait, must tile vertically)
```
Draw the inside wall of a deep well-like rabbit-hole, seen straight on, as Alice falls past it: earth walls lined with cupboards and bookshelves, with maps and pictures hung on pegs between them. On one shelf, a small jar labelled "ORANGE MARMALADE". Lit from above, with deep cross-hatched shadow at the edges.

IMPORTANT: this image will repeat vertically. The top edge and bottom edge must line up seamlessly, so nothing should be cut off at the top or bottom in a way that won't continue. Fill the whole image edge to edge. Engraving style as agreed.
```
Then: `Make another version of the same wall with different cupboards, shelves and maps, also tiling vertically, matching the first one's style and edges.` A second tile stops the fall looking repetitive.

*Note: the label text will likely come out garbled. That's fine; the label is replaced in the game, and the marmalade inside is colored orange there (COLOR.md).*

---

## Upload checklist
Save each image with these names and upload them here:

| File | Prompt |
|---|---|
| `alice_turnaround.png` | 1 |
| `alice_parts.png` | 1 (second message) |
| `riverbank_sky.png` | 2a |
| `riverbank_treeline.png` | 2b |
| `riverbank_tree.png` | 2c |
| `riverbank_hedge.png` | 2d |
| `riverbank_grass.png` | 2e |
| `shaft_wall_a.png`, `shaft_wall_b.png` | 3 |

Also note which ChatGPT model made them (shown in the chat) for PROVENANCE.md.

## Follow-up prompts (sent 2026-10-10)
Used in the same conversation after the first set. The results are in `source/ai/`.
- **Alice sitting:** "Same Alice, same style: sitting on the grass of a riverbank, legs tucked to one side, skirt spread around her, hands in her lap, looking bored. Side view facing right. White background, no ground."
- **Sister reading:** "Alice's older sister, about 16, same 1860s style: a long full dress and a wide-brimmed straw hat, sitting on the grass with her back against a tree trunk (don't draw the tree), reading a small book. Seen from three-quarter behind, so the hat hides most of her face. White background."
- **Alice torso:** "For the same Alice puppet: her torso alone (bodice, pinafore top and sash, no head, arms or skirt), front view and three-quarter view, same scale as the parts sheet. White background."

## Alice poses for Chapter I (requested 2026-10-10)
The parts sheets can't make a free-jointed puppet: they have no skirt between waist and hem. Running is composed from the turnaround plus the running legs (`tools/compose_poses.py`). The other poses need whole figures. Use the **same conversation** as the turnaround so she matches, and ask for each on a white background, full figure, same scale as the turnaround.

```
Same Alice, same style, full figure on white, same scale as the turnaround. Pose: FALLING slowly down a well — arms raised and spread, skirt and hair floating upward, feet together, calm and curious expression. Three-quarter view facing left.
```
```
Same Alice, full figure on white: KNEELING on the floor, bent forward, one cheek close to the ground as if peering through a very small door at floor level. Side view facing right.
```
```
Same Alice, full figure on white: REACHING UP with both arms, on tiptoe, trying to reach something just above her head. Three-quarter view facing left.
```
```
Same Alice, full figure on white: standing, HOLDING A SMALL BOTTLE up in her right hand and reading its label, the other hand at her side. Three-quarter view facing left. (Don't draw a label on the bottle.)
```
```
Same Alice, full figure on white: sitting on the floor CRYING, knees drawn up, face in her hands. Three-quarter view facing left.
```
```
Same Alice, full figure on white: standing, EATING a small cake held in one hand, the other hand resting on top of her head as if feeling whether she is growing. Three-quarter view facing left.
```

Upload as `alice_fall.png`, `alice_kneel.png`, `alice_reach.png`, `alice_bottle.png`, `alice_cry.png`, `alice_eat.png`.

## Chapter I asset list v2 (2026-10-10): everything still needed
Use the **same ChatGPT conversation** as the turnaround and the earlier pieces so the style matches. Every image: Tenniel wood-engraving style, black ink on white, hatching only, no colour, no text unless asked, white background (except full scenes). Upload with the file names given. This list **replaces** the "Alice poses" list above, which it includes.

### Alice (whole figures, same scale as the turnaround, three-quarter view facing left unless stated)
1. `alice_walk_a.png`, `alice_walk_b.png`: "Same Alice, full figure on white: WALKING at an easy pace. Frame A: left foot forward, heel down. Frame B: right foot forward, heel down. Arms swing gently opposite to the legs. Two separate images, identical in scale and position." *(note 2)*
2. `alice_jump.png`: "Same Alice, full figure on white: JUMPING forward and down into a hole, knees bent, arms forward, hair and skirt lifting." *(note 6)*
3. `alice_fall.png`: "…FALLING slowly down a well: arms raised and spread, skirt and hair floating upward, feet together, calm and curious."
4. `alice_kneel.png`: "…KNEELING on the floor, bent forward, cheek close to the ground, peering through a tiny door at floor level. Side view facing right."
5. `alice_reach.png`: "…REACHING UP with both arms, on tiptoe, for something just above her head."
6. `alice_hold.png`: "…standing, HOLDING something small up in her right hand at chest height, looking at it. Nothing in the hand (the game adds the object)." *(note 3: the key and bottle go in this hand)*
7. `alice_cry.png`: "…sitting on the floor CRYING, knees drawn up, face in her hands."
8. `alice_eat.png`: "…standing, EATING a small cake held in one hand, the other hand on top of her head as if feeling whether she is growing."
9. `alice_land.png`: "…sitting up suddenly on a heap of leaves after a fall, surprised, hands on the ground behind her. Side view facing right. Don't draw the leaves."

### The White Rabbit (match Tenniel's Rabbit exactly: waistcoat, checked jacket, umbrella under the arm, pocket watch; attach the Tenniel 1.2 reference again)
10. `rabbit_run_side.png`: "The White Rabbit RUNNING, side view facing left, a long hurried stride, watch in one paw."
11. `rabbit_run_away.png`: "The White Rabbit seen FROM BEHIND, running away from us down a passage, ears up, coat tails flying."
12. `rabbit_hop.png`: "The White Rabbit LEAPING head-first, diving forward and down as into a hole, side view facing right." *(note 6)*
13. `rabbit_idle_b.png`: "The White Rabbit standing, same pose as Tenniel's plate but turned slightly toward us, glancing over his shoulder, watch in paw." *(note 11: alternates with the Tenniel pose)*

### Sets and props
14. `leaf_heap.png`: "A low heap of sticks and dry leaves on a dark earth floor at the bottom of a deep well, seen from the front, about three times as wide as it is tall. White background around it." *(note 4)*
15. `passage_wall.png` (landscape, must tile left to right): "The earth wall of a long, dark underground passage, roots and stones in packed earth, dim light from the left. Fill the image edge to edge; the left and right edges must join seamlessly."
16. `hall_wall.png` (landscape, tiles left to right): "The long wall of a low Victorian hall: a row of tall, narrow, locked wooden doors with brass knobs, panelled wainscot between them. Front view, flat, edge to edge; the left and right edges must join seamlessly."
17. `hall_floor.png` (square, tiles both ways): "Flagstone floor seen from straight above, worn stone slabs, edge to edge, tiling seamlessly in both directions."
18. `hall_lamp.png`: "A single Victorian lamp hanging from a chain, glass shade, lit. White background."
19. `little_door.png`: "A tiny arched wooden door about fifteen inches high, set in a wall at floor level, closed, with a small keyhole. Front view, with a little of the wall around it."
20. `low_curtain.png`: "A low velvet curtain hanging from a rod, gathered in heavy folds, about knee height. White background."
21. `garden_through_door.png` (portrait): "Seen through a tiny doorway at floor level: a small passage, not much larger than a rat-hole, opening onto the loveliest garden — beds of bright flowers and cool fountains, sunlit, in the distance. Frame it as if looking along the little passage." *(note 8)*
22. `glass_table.png`: "A little three-legged table made all of solid glass, seen from the side, transparent, with highlights. White background." *(the 3D glass table stays as a fallback)*
23. `golden_key.png`: "A tiny ornate key, front view, white background. (The game colours it gold.)"
24. `drink_me_bottle.png`: "A small Victorian glass bottle with a paper label tied round its neck, the words 'DRINK ME' beautifully printed on the label in large letters. White background."
25. `glass_box.png`: "A very small glass box with a hinged lid, open, transparent, white background."
26. `eat_me_cake.png`: "A very small round cake, the words 'EAT ME' marked on top in currants. White background."

### Thought vignettes (oval vignette, engraved, white background; shown above Alice's head)
27. `vignette_poker.png`: "A fire grate with a poker resting in the coals, its tip glowing hot." *(the game colours the tip red)*
28. `vignette_knife.png`: "A child's hand with a small cut on one finger, a kitchen knife lying beside it." *(note 10; ink only)*
29. `vignette_poison.png`: "A small dark bottle with a label marked 'POISON'." *(note 10)*
30. `vignette_dinah.png`: "A cat (Dinah) lapping from a saucer of milk."
31. `vignette_bats.png`: "A cat looking up at bats flying in the dusk."
32. `vignette_candle.png`: "A candle flame going out, a thin curl of smoke."

### Chapter end
33. `chapter1_end.png`: "A small decorative tailpiece vignette for the end of a chapter: the White Rabbit's pocket watch lying on a curl of ribbon among a few leaves." *(note 9)*

Priority if time is short: 1, 9, 2, 12, 10, 11, 14, 21, 6, 16, 17, 18, 20, 19, then the rest.

---

## Chapter II asset list (2026-10-10): "The Pool of Tears"
Background and sources: [CHAPTER_02_ASSETS.md](CHAPTER_02_ASSETS.md). Use the **same ChatGPT conversation** as all the Chapter I art, so Alice and the Rabbit stay the same. Same rules: Tenniel wood-engraving style, black ink on white, hatching only, no colour, no text unless asked, white background unless stated. Upload with the file names given.

**Received from the Chapter I v2 list (2026-10-10):** `alice_walk_a`, `alice_jump`. Still wanted from it: `alice_walk_b` first, then the rest of that list.

**References to download first** (right-click, save image):
- 2.1, long neck: https://victorianweb.org/art/illustration/tenniel/alice/2.1.html
- 2.2, giant Alice kneeling, Rabbit trotting away: https://victorianweb.org/art/illustration/tenniel/alice/2.2.html
- 2.3, Alice swimming: https://victorianweb.org/art/illustration/tenniel/alice/2.3.html
- 2.4, Alice and the Mouse: https://victorianweb.org/art/illustration/tenniel/alice/2.4.html
- 3.1 and 3.2, the Duck, Dodo, Lory and Eaglet: https://victorianweb.org/art/illustration/tenniel/alice/3.1.html and https://victorianweb.org/art/illustration/tenniel/alice/3.2.html

**Alice's model sheet** is the turnaround (front, three-quarter, profile, back; owner, 2026-10-10). Attach it with **every** Alice prompt and add: "Match this model sheet exactly: same face, hair, collar, puffed sleeves, pinafore with pocket, sash bow, stockings and strap shoes, same proportions."

Attach the reference named in a prompt when you send it. Where a prompt says "Tenniel's pose", keep **our** Alice's face, hair and dress (the turnaround), not Tenniel's: the plate is for the pose only.

### Alice (whole figures, same scale as the turnaround, three-quarter view facing left unless stated)
1. `alice2_feet.png`: "Same Alice, full figure on white: standing, looking down at her feet in surprise, as if they were very far away, hands raised a little."
2. `alice2_longneck.png` (attach 2.1): "Same Alice, full figure on white, in Tenniel's pose from this plate: standing very tall, her neck stretched extremely long, arms at her sides, looking down. Front view."
3. `alice2_stoop.png`: "Same Alice, full figure on white: standing with her head bent sharply sideways and down, as if pressed against a low ceiling, one hand raised to her head."
4. `alice2_lie.png`: "Same Alice, full figure on white: lying on her side on the floor, propped on one elbow, face close to the ground, peering with one eye into something tiny at floor level. Side view facing right."
5. `alice2_cry_giant.png` (attach 2.2): "Same Alice, full figure on white: sitting on the floor with her legs folded under her, crying, wiping her eyes with the back of one hand. Pose after Tenniel's plate, turned three-quarter toward us."
6. `alice2_kneel_back.png` (attach 2.2): "Same Alice, full figure on white, in Tenniel's pose from this plate: kneeling, one hand on the floor, turning her head to look back over her shoulder, timid. Don't draw the Rabbit or the wall."
7. `alice2_fan.png`: "Same Alice, full figure on white: standing, fanning herself with a large open folding fan in her right hand, a pair of small gloves in her left hand, talking to herself, puzzled."
8. `alice2_recite.png`: "Same Alice, full figure on white: sitting upright on the floor with her hands crossed in her lap, as if saying her lessons, eyes a little tearful."
9. `alice2_glove.png`: "Same Alice, full figure on white: standing, holding up her left hand to look at it, surprised; she is wearing one small white glove on that hand. Leave the glove unshaded, plain white."
10. `alice2_drop_fan.png`: "Same Alice, full figure on white: frightened, flinging away a folding fan that is falling from her hand, leaning back."
11. `alice2_swim.png` (attach 2.3): "Same Alice in Tenniel's swimming pose from this plate: in water up to her shoulders, one arm reaching forward, hair spread on the water. Draw her down to just below the water line only; white background, no water."
12. `alice2_swim_talk.png` (attach 2.4): "Same Alice in Tenniel's pose from this plate: swimming, head and shoulders above water, turned toward someone beside her, talking. Down to the water line only; white background, no water, no mouse."
13. `alice2_slip.png`: "Same Alice, full figure on white: slipping, one foot shooting forward, arms flung up, falling backward."

### The White Rabbit (attach the Tenniel 1.2 reference again)
14. `rabbit2_trot.png`: "The White Rabbit, splendidly dressed (his best waistcoat and coat, a ruffled cravat), trotting in a great hurry, side view facing left, a pair of white kid gloves in one paw and a large folding fan in the other, muttering to himself. Leave the gloves plain white."
15. `rabbit2_start.png`: "The same Rabbit starting violently in fright, leaping back, ears straight up, gloves and fan flying out of his paws."
16. `rabbit2_away.png` (attach 2.2): "The same Rabbit seen from behind, scurrying away as hard as he can go, ears up, coat tails flying, after Tenniel's small figure in this plate."

### The Mouse (attach 2.4)
17. `mouse_swim.png`: "The Mouse from this Tenniel plate: swimming, head and back above the water line, side view facing right. Down to the water line only; white background, no water."
18. `mouse_leap.png`: "The same Mouse leaping straight up out of the water in fright, quivering all over, fur on end, water dripping. White background, no water."
19. `mouse_bristle.png`: "The same Mouse, bristling all over with anger, trembling to the end of his tail, head and shoulders above the water line. White background, no water."
20. `mouse_away.png`: "The same Mouse swimming away fast, seen from three-quarter behind, kicking up spray. White background, no water."

### The birds (attach 3.1 and 3.2; draw each twice: swimming, head and back above the water line; and standing, full figure)
21. `duck_swim.png`, `duck_stand.png`: "The Duck from these Tenniel plates…"
22. `dodo_swim.png`, `dodo_stand.png`: "The Dodo from these Tenniel plates, with his walking stick when standing…"
23. `lory_swim.png`, `lory_stand.png`: "The Lory (a parrot) from these Tenniel plates…"
24. `eaglet_swim.png`, `eaglet_stand.png`: "The Eaglet from these Tenniel plates…"
(For each: "…White background, no water.")

### Sets and props
25. `pool_water.png` (landscape, tiles left to right): "The surface of a pool seen from water level, in Tenniel's horizontal engraved water lines from plates 2.3 and 2.4, small ripples, a few rings. Fill the image edge to edge; the left and right edges must join seamlessly."
26. `pool_shore.png` (landscape): "Seen from water level by someone very tiny: the edge of a stone floor rising like a cliff from a pool, the bottom of an enormous wooden door and a huge glass table leg beyond. Fill the image edge to edge."
27. `kid_gloves.png`: "A pair of small white kid gloves, lying loosely together. Plain white, outline only, very little shading. White background."
28. `fan.png`: "A large Victorian folding fan, open, front view. White background."
29. `splash.png`: "A small engraved water splash, drops flying up, as when someone falls into water. White background."

### Thought vignettes (oval vignette, engraved, white background, like the Chapter I ones)
30. `vignette_foot_parcel.png`: "A brown-paper parcel tied with string, holding a new pair of boots, addressed in neat handwriting: 'Alice's Right Foot, Esq., Hearthrug, near the Fender'." (The game may letter the address; ChatGPT's lettering often goes wrong.)
31. `vignette_ada_mabel.png`: "Two little girls side by side: one with hair in very long ringlets, the other in front of a small, poky cottage."
32. `vignette_crocodile.png`: "A little crocodile in the river Nile, grinning, its claws neatly spread, little fishes swimming into its smiling jaws." (The game colours its scales gold.)
33. `vignette_seaside.png`: "An English seaside: wooden bathing machines in the sea, children digging in the sand with wooden spades, a row of lodging houses, and a railway station behind them."
34. `vignette_walrus.png`: "A walrus and a hippopotamus in the water, side by side."
35. `vignette_dinah_fire.png`: "A cat (Dinah) sitting by a fireplace, purring, licking her paw and washing her face."
36. `vignette_terrier.png`: "A small bright-eyed terrier with long curly hair, sitting up to beg." (The game colours its hair brown.)

Priority if time is short: 2, 6, 11, 12, 17, 14, 16, 7, 4, 5, 25, 26, 21–24 (swimming), 18, 19, then the rest.
