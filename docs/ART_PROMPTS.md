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

---

## Chapter III asset list (2026-10-10): "A Caucus-Race and a Long Tale"
Background and sources: [CHAPTER_03_ASSETS.md](CHAPTER_03_ASSETS.md). Same conversation, same rules as before. Attach the Alice model sheet with every Alice prompt. Chapter III has no colours: everything is ink.

**References to download first:** plate 3.1 (the party in a ring round the Mouse): https://victorianweb.org/art/illustration/tenniel/alice/3.1.html and plate 3.2 (Alice and the Dodo): https://victorianweb.org/art/illustration/tenniel/alice/3.2.html. Already saved for Chapter II: 2.4 (Alice and the Mouse).

### Alice (whole figures on white, same scale as the model sheet, three-quarter view facing left unless stated)
1. `alice3_wet.png`: "Same Alice, full figure on white: standing dripping wet after a swim, hair and dress clinging, water dripping from her hem, cross and uncomfortable."
2. `alice3_ring.png` (attach 3.1): "Same Alice, in the pose of the seated girl in this plate: sitting on the ground, legs to one side, seen three-quarter from behind, listening. Keep our Alice's hair and dress."
3. `alice3_argue.png`: "Same Alice, full figure on white: standing, arguing politely, one hand raised as if making a point."
4. `alice3_comfits.png`: "Same Alice, full figure on white: one hand in her pinafore pocket pulling out a small round box, the other hand holding out a tiny sweet as if giving it away."
5. `alice3_bow.png` (attach 3.2): "Same Alice, full figure on white: bowing solemnly, one hand reaching out to take something tiny, trying not to laugh. Pose after the Alice in this plate. Facing right."
6. `alice3_wonder.png`: "Same Alice, full figure on white: standing, looking down with wonder at something long lying on the ground in front of her, head tilted."
7. `alice3_call.png`: "Same Alice, full figure on white: calling after someone who is leaving, one arm stretched out, leaning forward."
8. `alice3_alone.png`: "Same Alice, full figure on white: sitting on the ground alone, knees drawn up, crying into her hands."

### The Mouse (attach 3.1 and 2.4)
9. `mouse3_lecture.png`: "The Mouse from plate 3.1, full figure on white: standing upright on his hind legs, front paws raised, with an important air, as if giving a lecture. Side view facing left."
10. `mouse3_cross.png`: "The same Mouse, standing upright, frowning crossly, one paw raised."
11. `mouse3_sigh.png`: "The same Mouse, standing upright, turning his head to look at us and sighing, his very long tail curled in loops on the ground in front of him."
12. `mouse3_angry.png`: "The same Mouse, shouting angrily, fur bristling, paws clenched."
13. `mouse3_away.png`: "The same Mouse walking away on all fours, seen from three-quarter behind, shaking his head impatiently."

### The Dodo and the birds (attach 3.1 and 3.2)
14. `dodo3_rise.png`: "The Dodo from plate 3.2, full figure on white: rising to his feet, solemn, one wing raised as he speaks."
15. `dodo3_think.png`: "The same Dodo, sitting, one wing-tip pressed to his forehead like the pictures of Shakespeare, deep in thought."
16. `dodo3_point.png`: "The same Dodo, standing, pointing to the right with one wing-tip."
17. `dodo3_thimble.png`: "The same Dodo as in plate 3.2: leaning on his walking stick, holding out a thimble solemnly. Facing left."
18. `lory3_sulk.png`: "The Lory from plate 3.1, full figure on white: turned sulky, head turned away, feathers ruffled."
19. `eaglet3_smile.png`: "The Eaglet from plate 3.1: bending its head down to hide a smile."
20. `duck3_ask.png`: "The Duck from plate 3.1: standing, beak open, asking a question."
21. `crabs3.png`: "An old mother Crab and her young daughter side by side, after the crab in plate 3.1. White background."
22. `magpie3.png`: "An old Magpie wrapping itself up carefully in its wings, as if in a shawl, to go home."
23. `canary3.png`: "A Canary calling to her little ones, two or three tiny chicks beside her."
24. `creatures3.png`: "Two or three of the other curious creatures in plate 3.1 (the owl, and the small animals), each standing, separate, on white."

### Props
25. `comfits.png`: "A small round Victorian box of comfits (sugared sweets), lid open, with a few loose comfits beside it. White background."
26. `thimble.png`: "A single thimble, engraved, front view. White background."

### Thought vignettes (oval vignette, engraved, white background)
27. `vignette_shakespeare.png`: "William Shakespeare, head and shoulders, one finger pressed to his forehead in thought, as in the old pictures of him."
28. `vignette_knot.png`: "A long mouse's tail tied in a knot."
29. `vignette_dinah_birds.png`: "A cat (Dinah) crouching, watching a little bird."

### Not needed: the bank is on the hall floor (owner chose A). Kept for reference only
- 3B-1 `bank_rushes.png` (landscape, tiles left to right): "The edge of a pool: rushes, reeds and wet earth, seen from very low down, as by a creature a few inches tall. Edge to edge; left and right edges must join."
- 3B-2 `bank_grass.png` (landscape, tiles): "Grass and weeds seen from very low down, after Tenniel's grass in plate 4.4. Edge to edge, tiling left to right."
- 3B-3 `bank_backdrop.png` (landscape): "A dark wall of foliage and shadow, as behind the animals in plate 3.1. Fill the image."

Priority if time is short: 9, 2, 17, 14, 11, 5, 4, 13, 15, 1, 21, then the rest.

---

## Chapter IV asset list (2026-10-10): "The Rabbit Sends in a Little Bill"
Background and sources: [CHAPTER_04_ASSETS.md](CHAPTER_04_ASSETS.md). Same conversation, same rules. Attach the Alice model sheet with every Alice prompt, and Tenniel 1.2 with every Rabbit prompt.

**References to download first:** 4.1 (giant Alice in the room) https://victorianweb.org/art/illustration/tenniel/alice/4.1.html · 4.2 (the hand and the cucumber-frame) https://victorianweb.org/art/illustration/tenniel/alice/4.2.html · 4.3 (Bill out of the chimney) https://victorianweb.org/art/illustration/tenniel/alice/4.3.html · 4.4 (the puppy) https://victorianweb.org/art/illustration/tenniel/alice/4.4.html

### Alice (whole figures on white unless stated, three-quarter view facing left)
1. `alice4_hunt.png`: "Same Alice, full figure: bent forward, hunting about on the ground for something she has lost."
2. `alice4_hold.png`: "Same Alice, full figure: holding a folding fan and a pair of small gloves in one hand, turning her head to look at something on a table behind her."
3. `alice4_drink.png`: "Same Alice, full figure: drinking from a small bottle, head tipped back."
4. `alice4_giant.png` (landscape; attach 4.1): "Our Alice in Tenniel's pose from this plate: so large she fills a small room, lying on her side, one elbow pressed against the door, the other arm out of the window, one foot up the chimney, her head bent under the ceiling. Draw the room around her as in the plate, our Alice's face and hair."
5. `alice4_hand.png` (attach 4.2): "Our Alice's enormous arm and hand reaching out of a small cottage window, fingers spread, snatching at the air, as in this plate. Just the arm, hand and window; white background."
6. `alice4_foot.png`: "Our Alice's enormous foot in a white stocking and strap shoe, pushed up into a narrow fireplace and chimney, about to kick. Just the foot and fireplace."
7. `alice4_pebbles.png`: "Same Alice, head and shoulders, wincing and shielding her face with one hand as small pebbles fly at her."
8. `alice4_stick.png` (attach 4.4): "Same Alice in Tenniel's pose from this plate: half behind a great thistle, holding out a small stick, frightened. Our Alice's face and dress."
9. `alice4_buttercup.png`: "Same Alice, full figure: leaning against the stalk of a buttercup taller than she is, fanning herself with a leaf, out of breath."
10. `alice4_tiptoe.png`: "Same Alice, full figure: standing on tiptoe, peeping over the edge of something just above her head."

### The White Rabbit
11. `rabbit4_search.png`: "The White Rabbit trotting slowly, looking anxiously about at the ground as if he had lost something. Side view facing left."
12. `rabbit4_point.png`: "The White Rabbit pointing angrily with one paw, ordering someone off."
13. `rabbit4_frame.png` (attach 4.2): "The White Rabbit from this plate, tumbling backwards into a glass cucumber-frame, the glass breaking. White background around the frame."
14. `rabbit4_order.png`: "The White Rabbit giving orders, one paw raised, standing on a garden path."

### New characters
15. `pat.png`: "Pat, the Rabbit's gardener, a small animal (a guinea-pig) in a smock, holding a spade; then a second image of him standing nervously, cap in hand."
16. `bill_ladder.png` (attach 4.3): "Bill, a small lizard in Tenniel's style, standing on his hind legs carrying a ladder over his shoulder."
17. `bill_chimney.png`: "The same lizard climbing down into a chimney-pot, only his head and front legs showing."
18. `bill_rocket.png` (attach 4.3): "The lizard from this plate, flying up out of a chimney-pot like a sky-rocket in a cloud of soot."
19. `bill_held.png`: "The same lizard, limp and dazed, held up under the arms by two guinea-pigs; one of them holds a small bottle to his mouth."
20. `puppy_look.png` (attach 4.4): "The enormous puppy from this plate, looking down with large round eyes, one paw stretched out. White background."
21. `puppy_jump.png`: "The same puppy jumping into the air off all four feet at once, yelping with delight."
22. `puppy_tumble.png`: "The same puppy tumbling head over heels."
23. `puppy_sit.png`: "The same puppy sitting a good way off, panting, tongue hanging out, eyes half shut."
24. `caterpillar_first.png`: "A large caterpillar sitting on the top of a mushroom, arms folded, quietly smoking a long hookah, after Tenniel's Caterpillar. Seen from just below the edge of the mushroom cap." (The game colours him blue.)

### Sets and props
25. `rabbit_house.png` (portrait): "A neat little cottage, front view: a door with a small brass name-plate engraved 'W. RABBIT', one upstairs window, a tall chimney-pot, a slate roof; a small garden with glass cucumber-frames in front. Fill the image."
26. `rabbit_room_back.png` (landscape, flat): "Inside a tidy little upstairs room, back wall seen straight on: a small window with a table in front of it, a fireplace, a looking-glass on the wall. Fill the image edge to edge."
27. `rabbit_room_side.png` (landscape, flat): "The side wall of the same little room, with the door. Edge to edge."
28. `table_gloves.png`: "A small table with a folding fan and two or three pairs of tiny white kid gloves on it, and a little unlabelled bottle beside a looking-glass. White background."
29. `cucumber_frames.png`: "A row of glass cucumber-frames in a kitchen garden, one smashed. White background."
30. `ladders.png`: "Two wooden ladders tied together with rope, leaning. White background."
31. `cart_barrow.png`: "A small hand-cart and a wheelbarrow full of pebbles. White background."
32. `pebbles_cakes.png`: "A few small pebbles, and beside them the same shapes as little cakes. White background."
33. `wood_grass.png` (landscape, tiles left to right): "A thick wood seen from very low down, as by someone three inches tall: tall grass blades, weeds and flower stems towering overhead, after Tenniel's grass in plate 4.4. Edge to edge, tiling left to right."
34. `thistle.png` (attach 4.4): "The great thistle from this plate, alone. White background."
35. `buttercup.png`: "A single buttercup plant, flower and leaves, drawn large. White background." (Uncoloured: the text gives no colour.)
36. `mushroom.png`: "A large mushroom, seen from the side, as tall as a small child would be if she were three inches high: the cap's edge just above eye level. White background."

### Thought vignettes (oval, engraved, white background)
37. `vignette_dinah_nurse.png`: "A cat (Dinah) sitting up like a nurse, ordering a little girl to get ready for her walk."
38. `vignette_book.png`: "A book with 'ALICE' on its cover, and a grown-up young woman at a desk writing it."

Priority if time is short: 4, 25, 26, 5, 13, 18, 20, 33, 34, 36, 8, 3, 16, 19, 11, 12, then the rest.

---

## Chapter V asset list (2026-10-10): "Advice from a Caterpillar"
Background and sources: [CHAPTER_05_ASSETS.md](CHAPTER_05_ASSETS.md). Same conversation, same rules. Attach the Alice model sheet with every Alice prompt.

**References to download first:** 5.1 (the Caterpillar) https://victorianweb.org/art/illustration/tenniel/alice/5.1.html. The Father William plates 5.2–5.5 are recommended for use as they are (no prompts needed); prompts 18–21 are only if you'd rather have new drawings.

### Alice (whole figures on white, three-quarter view facing left unless stated)
1. `alice5_lookup.png` (attach 5.1): "Same Alice, full figure: standing, looking up at something just above her head, hands behind her back, polite and a little shy."
2. `alice5_grave.png`: "Same Alice, full figure: drawing herself up very straight and grave, chin raised."
3. `alice5_away.png`: "Same Alice, full figure: turning away, seen three-quarter from behind, offended."
4. `alice5_recite.png`: "Same Alice, full figure: standing with her hands folded in front of her, reciting a poem."
5. `alice5_break.png`: "Same Alice, full figure: arms stretched wide round the edge of something round at shoulder height, breaking off a piece with each hand."
6. `alice5_squashed.png`: "Same Alice, shrunk so suddenly that her chin is pressed against her foot: a crouched, squashed figure, frightened, holding a bit of mushroom."
7. `alice5_nibble.png`: "Same Alice, full figure: nibbling a small piece held in one hand, another piece in the other hand."
8. `alice5_head.png`: "Same Alice, head only, turned to the left, surprised, as if at the top of an immensely long neck. Draw the head and the top of the neck only; the neck ends in a clean edge at the bottom." (The game draws the long neck.)

### The Caterpillar (attach 5.1; the game colours him blue)
9. `caterpillar_sit.png`: "The Caterpillar from this plate, full figure on white: sitting on top of a mushroom cap, arms folded, smoking a long hookah."
10. `caterpillar_speak.png`: "The same Caterpillar, hookah out of his mouth, speaking languidly, looking down."
11. `caterpillar_rear.png`: "The same Caterpillar rearing upright, angry."
12. `caterpillar_yawn.png`: "The same Caterpillar yawning and shaking himself."
13. `caterpillar_crawl.png`: "The same Caterpillar crawling away through grass, side view."

### The Pigeon
14. `pigeon_attack.png`: "A large wood-pigeon flying straight at us, wings spread and beating, beak open, furious. White background."
15. `pigeon_scream.png`: "The same pigeon perched on a branch, feathers ruffled, screaming."
16. `pigeon_nest.png`: "The same pigeon settling sulkily down into a nest of twigs with eggs, at the top of a tree. White background."

### Sets and props
17. `treetops.png` (landscape, tiles left to right): "The tops of a thick wood seen from far above: a sea of leaves, rounded crowns packed together. Edge to edge, tiling left to right." (The game colours them green.)
- `mushroom_top.png`: "The same large mushroom, its cap seen from slightly above, a blue-caterpillar-sized dent in the top. White background."
- `mushroom_bits.png`: "Two small pieces broken off the edge of a mushroom cap. White background."
- `little_house.png`: "An open place in a wood with a small house about four feet high, a door and a window, trees round it. Fill the image." (Chapter VI uses it too.)

### Thought vignettes (oval, engraved, white background)
- `vignette_chrysalis.png`: "A chrysalis hanging from a twig, and beside it a butterfly just come out."
- `vignette_eggs.png`: "A nest with three eggs in it."

### Not needed: Tenniel's Father William plates are used (owner). Kept for reference only
18. `fw_head.png` (attach 5.2): "An old man standing on his head, a young man watching, after this plate."
19. `fw_somersault.png` (attach 5.3): "A fat old man turning a back-somersault in at a door."
20. `fw_goose.png` (attach 5.4): "An old man at table finishing a whole goose, bones and beak."
21. `fw_eel.png` (attach 5.5): "An old man balancing an eel on the end of his nose."

Priority if time is short: 9, 10, 8, 14, 17, 1, 5, 16, 6, 7, 11, 13, then the rest.

---

## Chapter VI asset list (2026-10-10): "Pig and Pepper"
Background and sources: [CHAPTER_06_ASSETS.md](CHAPTER_06_ASSETS.md). Same conversation, same rules. Attach the Alice model sheet with every Alice prompt. No colours in this chapter.

**References to download first:** 6.1 (the Footmen) https://victorianweb.org/art/illustration/tenniel/alice/6.1.html · 6.2 (the kitchen) …/6.2.html · 6.3 (Alice and the pig) …/6.3.html · 6.4 (the Cat in the tree) …/6.4.html · 6.5 (the grin fading) …/6.5.html (all under https://victorianweb.org/art/illustration/tenniel/alice/)

### Alice (whole figures on white, three-quarter view facing left unless stated)
1. `alice6_peep.png`: "Same Alice, full figure: peeping out from behind a tree trunk (draw the edge of the trunk), curious."
2. `alice6_laugh.png`: "Same Alice, full figure: laughing so much she covers her mouth with her hand."
3. `alice6_knock.png`: "Same Alice, full figure: knocking at a door with her knuckles. Facing right."
4. `alice6_sneeze.png`: "Same Alice, full figure: sneezing, eyes shut, a hand half raised."
5. `alice6_baby.png` (attach 6.3): "Same Alice in Tenniel's pose from this plate, holding a baby in long white clothes against her chest, looking down at it anxiously. Our Alice's face and dress."
6. `alice6_pig.png` (attach 6.3): "The same pose, but what she holds is a little pig in the baby's clothes."
7. `alice6_terror.png`: "Same Alice, full figure: jumping up and down in terror, both hands raised."
8. `alice6_back.png` (attach 6.4): "Same Alice in Tenniel's pose from this plate: seen from behind, hands behind her back, looking up into a tree."
9. `alice6_catch.png`: "Same Alice, full figure: arms out, catching a wriggling bundle thrown at her."

### The Footmen (attach 6.1)
10. `fish_footman.png`: "The Fish-Footman from this plate, full figure on white: in livery and powdered curls, the great letter with a crown seal under his arm."
11. `frog_footman.png`: "The Frog-Footman from this plate, full figure on white: in livery, round face and large eyes, taking a letter."
12. `frog_footman_sit.png`: "The same Frog-Footman sitting on the ground, legs out, staring stupidly up at the sky."
13. `footmen_bow.png`: "The Fish-Footman and the Frog-Footman bowing low to each other, their powdered curls entangled together."

### The kitchen (attach 6.2)
14. `duchess_nurse.png`: "The Duchess from this plate, full figure on white: sitting on a three-legged stool, nursing a howling baby."
15. `duchess_toss.png`: "The same Duchess, standing, tossing the baby up and down violently while she sings."
16. `duchess_fling.png`: "The same Duchess flinging the baby away from her, turning to hurry out."
17. `cook_stir.png`: "The Cook from this plate, full figure on white: leaning over, stirring a large cauldron."
18. `cook_throw.png`: "The same Cook throwing a saucepan overarm."
19. `baby_starfish.png`: "The baby from this plate, howling, arms and legs out in all directions like a star-fish. White background."
20. `baby_snout.png`: "The same baby, its nose turned up into a snout, its eyes getting very small."
21. `pig_trot.png`: "A little pig trotting away into a wood, seen from three-quarter behind."
22. `cheshire_hearth.png`: "The Cheshire Cat from this plate, sitting, grinning from ear to ear. White background."
23. `kitchen_back.png` (landscape): "A large kitchen's back wall, straight on: a big fireplace with a cauldron hanging over the fire, a hearth, a dresser with plates, smoke. Edge to edge."
24. `stool.png`: "A three-legged wooden stool. White background."
25. `thrown_things.png`: "Separate on white: fire-irons (poker, tongs, shovel), two saucepans, a frying-pan, three plates and a dish."
26. `pepper_box.png`: "An old-fashioned pepper-box. White background."
27. `great_letter.png` (attach 6.1): "The great letter from this plate, with its crown seal. White background."

### The Cheshire Cat in the wood (attach 6.4 and 6.5)
28. `cheshire_bough.png`: "The Cheshire Cat from plate 6.4, sitting on a bough, grinning. Draw the bough too. White background."
29. `cheshire_paw.png`: "The same Cat on the bough, waving one paw to the side."
30. `cheshire_grin.png`: "Only the grin of the same Cat, exactly the same size and position as in `cheshire_bough.png`, everything else left out. White background."
31. `tree_bough.png`: "A tree with one long low bough reaching out, after plates 6.4 and 6.5. White background."

### Sets for the end of the chapter
32. `door_close.png` (attach 6.1): "The door of the little house and its step, as in this plate, with a bit of wall and a tree. Fill the image."
33. `march_hare_house.png`: "A large house with chimneys shaped like a hare's ears and a roof thatched with fur, in a wood. Fill the image." (Chapter VII uses it.)

### Thought vignettes (oval, engraved, white background)
34. `vignette_axis.png`: "The earth as a globe turning on its axis, a sun and moon beside it."
35. `vignette_pigs.png`: "Two or three children with little pigs' faces, in their best clothes."

Priority if time is short: 14, 19, 22, 28, 30, 5, 6, 10, 11, 17, 23, 20, 21, then the rest.

---

## Chapter VII asset list (2026-10-10): "A Mad Tea-Party"
Background and sources: [CHAPTER_07_ASSETS.md](CHAPTER_07_ASSETS.md). Same conversation, same rules. Attach the Alice model sheet with every Alice prompt.

**References to download first:** 7.1 (the tea-party) https://victorianweb.org/art/illustration/tenniel/alice/7.1.html · 7.2 (the Hatter) …/7.2.html · 7.3 (the Dormouse into the teapot) …/7.3.html

### Alice (whole figures on white, three-quarter view facing left unless stated)
1. `alice7_chair.png` (attach 7.1): "Same Alice in Tenniel's pose from this plate: sitting in a large arm-chair (draw the chair), indignant, hands on the table edge. Facing right."
2. `alice7_lean.png`: "Same Alice, sitting, leaning forward with curiosity. Facing right."
3. `alice7_tea.png`: "Same Alice, sitting, pouring herself a cup of tea, a slice of bread-and-butter on her plate. Facing right."
4. `alice7_walkoff.png`: "Same Alice, full figure: walking off in disgust, glancing back over her shoulder."
5. `alice7_treedoor.png`: "Same Alice, full figure: opening a small door set into the trunk of a tree (draw the trunk and door)."
6. `alice7_unlock.png`: "Same Alice, full figure: bending to unlock a little door at floor level with a tiny key."
7. `alice7_garden.png`: "Same Alice, full figure: standing delighted among flower-beds, hands clasped."

### The Hatter, the March Hare and the Dormouse (attach the plate named)
8. `hatter_stare.png` (7.1): "The Hatter from this plate, at a table (draw him from the waist up, as seated), staring with great curiosity, his hat with its ticket 'In this Style 10/6'."
9. `hatter_riddle.png` (7.2): "The Hatter from this plate, mouth open, one hand raised. Seated, waist up."
10. `hatter_watch.png`: "The same Hatter holding a pocket-watch to his ear, shaking it, uneasy. Seated, waist up."
11. `hatter_move.png` (7.3): "The same Hatter, full figure, standing and stepping along to the next place, a teacup in hand."
12. `march_hare.png` (7.1): "The March Hare from this plate, seated at a table, waist up, a straw in his hair."
13. `march_hare_dip.png`: "The same March Hare dipping a pocket-watch into his cup of tea, gloomy."
14. `march_hare_push.png` (7.3): "The March Hare from this plate, full figure, pushing something down into a teapot."
15. `dormouse_sleep.png` (7.1): "The Dormouse from this plate, curled up fast asleep. White background."
16. `dormouse_talk.png`: "The same Dormouse sitting up, eyes half shut, telling a story sleepily."
17. `dormouse_teapot.png` (7.3): "The Dormouse half in a big teapot, as in this plate, alone. White background."

### Sets and props
18. `tea_table.png` (landscape, attach 7.1): "A very long table under a tree, with a white cloth, laid with many cups, saucers and plates, side view. White background."
19. `armchair.png` (7.1): "A large old arm-chair. White background."
20. `tea_things.png`: "Separate on white: a big teapot, a milk-jug, cups and saucers, plates, bread-and-butter, a butter dish."
21. `hatter_watch_close.png`: "A pocket-watch with a dial showing the days of the month instead of hours, a little butter smeared on it."
22. `tea_tree.png`: "The large tree that shades the table, after plate 7.1. White background."
23. `tree_door.png`: "A tree in a wood with a small door set into its trunk. White background."

### Thought vignettes (oval, engraved, white background)
24. `vignette_raven.png`: "A raven perched on a writing-desk."
25. `vignette_concert.png`: "A concert: a hatter singing on a little stage, a Queen jumping up in a rage."
26. `vignette_bat.png`: "A bat flying above the world like a tea-tray in the sky."
27. `vignette_treacle.png`: "Three little sisters at the bottom of a well of treacle, drawing pictures."

Priority if time is short: 8, 12, 15, 18, 1, 9, 17, 14, 19, 20, 16, then the rest.

---

## Chapter VIII asset list (2026-10-10): "The Queen's Croquet-Ground"
Background and sources: [CHAPTER_08_ASSETS.md](CHAPTER_08_ASSETS.md). Same conversation, same rules. Attach the Alice model sheet with every Alice prompt and Tenniel 1.2 with the Rabbit. The game adds the colours of the roses and the cushion; draw them in ink.

**Every card person (Chapters VIII–XII), add:** "The card's suit signs are printed as on an English playing card of the 1860s: red hearts and diamonds, black clubs and spades, the pips in the standard layout for its rank (lower-half pips upside down), and no numbers or letters in the corners. Everything else in black ink." Name the exact card in each prompt (e.g. "the Five of Spades").

**References to download first:** 8.1 (painting the roses) https://victorianweb.org/art/illustration/tenniel/alice/8.1.html · 8.2 ("Off with her head!") …/8.2.html · 8.3 (the flamingo) …/8.3.html · 8.4 (the Cat's head) …/8.4.html

### Alice (whole figures on white, three-quarter view facing left unless stated)
1. `alice8_procession.png`: "Same Alice, full figure: standing still, hands behind her back, watching a procession go by, polite but not afraid."
2. `alice8_nonsense.png` (attach 8.2): "Same Alice in Tenniel's pose from this plate, facing the Queen, saying 'Nonsense!' very loudly and decidedly. Our Alice's face and dress. Facing right."
3. `alice8_flowerpot.png`: "Same Alice, full figure: bending to lift three flat playing-card men into a large flower-pot."
4. `alice8_flamingo.png` (attach 8.3): "Same Alice in Tenniel's pose from this plate: holding a flamingo under her arm, its legs hanging down, its neck twisted round to look up at her face. Our Alice."
5. `alice8_swing.png`: "Same Alice, full figure: swinging a flamingo like a croquet mallet at a hedgehog on the ground."
6. `alice8_laugh.png`: "Same Alice, full figure: holding a flamingo, bursting out laughing because it has twisted round to look up at her."

### The cards (attach the plate named; card people are oblong and flat, hands and feet at the corners)
7. `gardeners_paint.png` (8.1): "The three card gardeners from this plate (Two, Five and Seven of spades) painting the roses of a small tree with brushes, a paint-pot at their feet. White background."
8. `gardener_flat.png`: "One card gardener lying flat on its face, so only the patterned back of the card shows. White background."
9. `gardener_bow.png`: "One card gardener (Two of spades) bowing low; a second image of him going down on one knee."
10. `soldier_club.png`: "A card soldier (a club card) carrying a club, marching, after the cards in plate 8.4."
11. `soldier_arch.png`: "A card soldier doubled up, standing on its hands and feet to make a croquet arch. Side view."
12. `courtier.png`: "A card courtier ornamented all over with diamonds, walking."
13. `royal_child.png`: "Two small royal card children ornamented with hearts, jumping merrily along hand in hand."
14. `knave.png` (8.2): "The Knave of Hearts from this plate, carrying the King's crown on a velvet cushion."
15. `king.png` (8.2, 8.4): "The King of Hearts from these plates, full figure."
16. `queen_point.png` (8.2): "The Queen of Hearts from this plate, pointing and shouting 'Off with her head!'"
17. `queen_stamp.png`: "The same Queen stamping about in a furious passion, shouting."
18. `executioner.png` (8.4): "The executioner from this plate, a card with a big axe."
19. `guests.png`: "Two or three guests: Kings and Queens of the other suits, in procession."

### Other characters
20. `rabbit8_herald.png`: "The White Rabbit walking in a procession, smiling nervously at everything, then a second image raising himself on tiptoe to whisper in someone's ear."
21. `flamingo_mallet.png` (8.3): "The flamingo from this plate, alone, held straight as a croquet mallet, head down. White background."
22. `flamingo_fly.png`: "A flamingo trying to fly up into a tree, wings flapping, helpless."
23. `hedgehogs.png` (8.3): "Separate on white: a hedgehog rolled into a ball; the same hedgehog unrolled and crawling away; two hedgehogs fighting."
24. `cheshire_head.png` (8.4): "The Cheshire Cat's head alone, floating in the air, grinning, as in this plate. White background."

### Sets and props
25. `rose_tree.png` (8.1): "The rose-tree from this plate, alone, every rose drawn as a clear separate shape, uncoloured. White background." (The game paints them red.)
26. `paint_pot.png`: "A paint-pot and a paint-brush. White background."
27. `flower_pot.png`: "A very large garden flower-pot. White background."
28. `garden_wall.png` (landscape, attach 8.2): "The garden behind the croquet-ground as in this plate: a long wall with arches, trees, a fountain. Fill the image edge to edge."
29. `croquet_ground.png` (square, tiles both ways): "A lawn seen from above, all ridges and furrows. Edge to edge, tiling in both directions."
30. `crown_cushion.png` (8.2): "A king's crown on a velvet cushion with tassels. White background." (The game colours the cushion crimson.)

### Thought vignette (oval, engraved, white background)
31. `vignette_tulips.png`: "Tulip-roots and onions side by side on a kitchen table."

Priority if time is short: 7, 16, 15, 14, 4, 21, 23, 24, 25, 28, 10, 11, 2, then the rest.

## Chapter IX asset list (2026-10-10): "The Mock Turtle's Story"
Background and sources: [CHAPTER_09_ASSETS.md](CHAPTER_09_ASSETS.md). Same conversation, same rules. Attach the Alice model sheet with every Alice prompt. No colours in this chapter: draw everything in ink.

**References to download first:** 9.1 (Alice and the Duchess) https://victorianweb.org/art/illustration/tenniel/alice/9.1.html · 9.2 (the Gryphon asleep) …/9.2.html · 9.3 (the Gryphon and the Mock Turtle) …/9.3.html

### Alice (whole figures on white, three-quarter view facing left unless stated)
1. `alice9_armin.png` (attach 9.1): "Same Alice in Tenniel's pose from this plate: walking arm in arm with someone on her left (leave them out), a flamingo tucked under her other arm. Our Alice's face and dress."
2. `alice9_chin.png`: "Same Alice, full figure: standing stiffly, startled and uncomfortable, as if someone's sharp chin is resting on her shoulder; trying to stay polite."
3. `alice9_follow.png`: "Same Alice, full figure: walking slowly, frightened, hands clasped, eyes down."
4. `alice9_sit_shore.png` (attach 9.3): "Same Alice in Tenniel's pose from this plate: sitting on the sand, listening, hands in her lap. Our Alice."
5. `alice9_sink.png`: "Same Alice, sitting: shrinking down a little, embarrassed, as if ready to sink into the earth."

### Characters (attach the plate named)
6. `duchess9_arm.png` (9.1): "The Duchess from this plate, walking arm in arm, leaning close, her chin forward. White background."
7. `duchess9_flee.png`: "The same Duchess trembling with fright, then a second image of her running away, skirts lifted."
8. `queen9_folded.png`: "The Queen of Hearts (as in our earlier drawings) standing with her arms folded, frowning like a thunderstorm."
9. `soldier9_custody.png`: "A card soldier (clubs) leading a card courtier away by the arm, into custody."
10. `gryphon_asleep.png` (9.2): "The Gryphon from this plate, alone, fast asleep in the sun. White background."
11. `gryphon_wake.png`: "The same Gryphon sitting up, rubbing its eyes with a claw; a second image of it chuckling."
12. `gryphon_walk.png`: "The same Gryphon walking ahead, looking back over its shoulder: 'Come on!'"
13. `gryphon_sit.png` (9.3): "The Gryphon from this plate, sitting; a second image lifting up both paws in surprise; a third hiding its face in its paws."
14. `mockturtle_ledge.png` (9.3): "The Mock Turtle from this plate (calf's head, turtle shell, hind hooves), alone, sitting sad and lonely, eyes full of tears. White background."
15. `mockturtle_sob.png`: "The same Mock Turtle sobbing into a handkerchief; a second image counting off on his flappers; a third hiding his face."

### Sets and props
16. `bank_sunny.png` (landscape, attach 9.2): "A grassy bank in the sun, with a few tufts and a low rise, as behind the Gryphon in this plate. Fill the image edge to edge."
17. `seashore.png` (landscape, attach 9.3): "The seashore: a flat sea to a far horizon, a little surf, sky with light clouds. Fill the image edge to edge, no figures."
18. `rock_ledge.png` (9.3): "The tall rock with a little ledge from this plate, alone, the ledge big enough to sit on. White background."
19. `sand.png` (square, tiles both ways): "Sand seen from above, with a few pebbles and shells. Edge to edge, tiling in both directions."

### Thought vignettes (oval, engraved, white background)
20. `vignette_tempers.png`: "A pepper-pot, a vinegar cruet, a camomile flower and a stick of barley-sugar, each beside a little face: hot-tempered, sour, bitter, sweet."
21. `vignette_pigs_fly.png`: "Pigs flying across the sky."
22. `vignette_sea_school.png`: "A school at the bottom of the sea: an old turtle schoolmaster at a desk, little turtles in rows."
23. `vignette_masters.png`: "An old conger-eel coiled like a teacher, and an old crab in a mortarboard."

Priority if time is short: 14, 10, 13, 6, 18, 17, 4, 1, 11, 8, then the rest.

## Chapter X asset list (2026-10-10): "The Lobster Quadrille"
Background and sources: [CHAPTER_10_ASSETS.md](CHAPTER_10_ASSETS.md). Same conversation, same rules. Attach the Alice model sheet with every Alice prompt. Draw everything in ink; the game adds the brown Lobster and the green soup in their vignettes.

**References to download first:** 10.1 (the quadrille) https://victorianweb.org/art/illustration/tenniel/alice/10.1.html · 10.2 (the Lobster) …/10.2.html

### Alice (whole figures on white, three-quarter view facing left unless stated)
1. `alice10_dance.png` (attach 10.1): "Same Alice in Tenniel's pose from this plate: standing still, a little anxious, as two creatures dance round her. Our Alice. Facing the viewer."
2. `alice10_tell.png`: "Same Alice, sitting on the sand, telling a story with one hand raised, a little nervous."
3. `alice10_recite.png`: "Same Alice, full figure: standing up to recite a poem like a schoolgirl, hands clasped behind her back."
4. `alice10_face_hands.png`: "Same Alice, sitting with her face in her hands."
5. `alice10_run.png`: "Same Alice running, one arm held out to the left as if someone is pulling her by the hand, panting."

### Characters (attach the plate named)
6. `mockturtle_dance.png` (10.1): "The Mock Turtle from this plate, alone, dancing and waving a forepaw; a second image capering wildly. White background."
7. `mockturtle_sing.png`: "The same Mock Turtle singing very slowly and sadly, eyes shut; a second image yawning."
8. `gryphon_dance.png` (10.1): "The Gryphon from this plate, alone, dancing and waving a forepaw. White background."
9. `gryphon_bound.png`: "The same Gryphon leaping into the air with a bound, shouting."
10. `gryphon_thump.png`: "The Gryphon thumping someone on the back with a paw (leave the other figure out)."
11. `gryphon_run.png`: "The Gryphon running, one forepaw held back as if pulling someone by the hand."

### Thought vignettes (oval, engraved, white background)
12. `vignette_lobsters_sea.png`: "Lobsters flung far out over the sea, seals and turtles swimming after them."
13. `vignette_whiting_snail.png`: "A whiting talking to a snail on the shingle, a porpoise close behind treading on the whiting's tail."
14. `vignette_whitings.png`: "Two whitings curled round with their tails in their mouths."
15. `vignette_lobster_glass.png` (attach 10.2): "The Lobster from this plate at his looking-glass, trimming his belt and buttons with his nose." (The game colours him brown.)
16. `vignette_owl_panther.png`: "An owl and a panther sitting at a table sharing a pie."
17. `vignette_soup.png`: "A large steaming soup tureen with a ladle." (The game colours the soup green.)

Priority if time is short: 6, 8, 1, 7, 15, 3, 11, 5, then the rest.

## Chapter XI asset list (2026-10-10): "Who Stole the Tarts?"
Background and sources: [CHAPTER_11_ASSETS.md](CHAPTER_11_ASSETS.md). Same conversation, same rules. Attach the Alice model sheet with every Alice prompt and Tenniel 1.2 with the Rabbit. Draw everything in ink; the game adds the Hatter's pale flush and the Rabbit's pink eyes.

**References to download first:** 11.1 (the Rabbit as herald) https://victorianweb.org/art/illustration/tenniel/alice/11.1.html · 11.2 (the Hatter as witness) …/11.2.html · 11.3 (the Hatter leaving) …/11.3.html · the frontispiece (the trial), from any good scan of the 1865/1866 edition.

### Alice (whole figures on white, three-quarter view facing left unless stated)
1. `alice11_court.png`: "Same Alice, full figure: standing, looking round a courtroom with great interest, one hand raised to whisper to someone beside her."
2. `alice11_pencil.png`: "Same Alice, full figure: reaching down behind someone to take away a squeaky pencil, mischievous."
3. `alice11_sit_crowd.png`: "Same Alice sitting on a bench, squashed, a little guilty, as she begins to grow."
4. `alice11_named.png`: "Same Alice, full figure: startled, hand to her chest, hearing her own name called out."

### Characters (attach the plate named)
5. `king_judge.png` (frontispiece): "The King of Hearts as judge, his crown on top of a great judge's wig, seated, from this plate. White background."
6. `king_judge_frown.png`: "The same King folding his arms and frowning till his eyes are nearly out of sight; a second image putting on spectacles."
7. `queen_throne.png`: "The Queen of Hearts seated on a throne, staring hard through spectacles."
8. `knave_chains.png` (frontispiece): "The Knave of Hearts standing in chains, as in this plate."
9. `rabbit_herald.png` (11.1): "The White Rabbit from this plate, alone, as herald, blowing a trumpet. Then a second image reading from an unrolled parchment scroll."
10. `hatter_witness.png` (11.2): "The Hatter from this plate, alone, teacup in one hand, bread-and-butter in the other. A second image biting a piece out of the teacup."
11. `hatter_tremble.png`: "The same Hatter trembling so hard that his shoes fly off; a second image down on one knee."
12. `hatter_leaving.png` (11.3): "The Hatter from this plate, hurrying away in his stockinged feet."
13. `hare_dormouse_arm.png`: "The March Hare and the Dormouse walking arm in arm (as in our Chapter VII drawings)."
14. `dormouse_sulky.png`: "The Dormouse standing up very sulkily and walking off."
15. `cook_pepper.png`: "The Duchess's cook (as in our Chapter VI drawing) carrying a pepper-box, scowling: 'Shan't.'"
16. `jurors.png`: "Twelve small creatures in two rows of a jury-box, each writing on a slate: a lizard, two guinea-pigs, a dodo, a lory, an eaglet, a duck, a mouse, a frog, a hedgehog, a squirrel, a mole. White background."
17. `bill_finger.png`: "Bill the Lizard writing on a slate with one finger, puzzled."
18. `guinea_bag.png`: "A large canvas bag tied at the mouth with strings, a guinea-pig's feet sticking out, a court officer sitting on it."
19. `crowd_court.png` (landscape, fill edge to edge): "Rows of spectators in a courtroom gallery: little birds and beasts and playing-card people, packed together, looking toward the viewer."

### Sets and props
20. `court_wall.png` (landscape, attach frontispiece): "The back wall of the courtroom: panelling, a canopy decorated with hearts over a throne, high windows. Fill the image edge to edge."
21. `throne.png` (frontispiece): "A throne for two on a low dais, decorated with hearts. White background."
22. `jury_box.png`: "An empty jury-box: a low railed wooden box with two rows of seats, seen from the front at three-quarters. White background."
23. `tarts_table.png` (frontispiece): "A small table with a large dish of jam tarts. White background."
24. `witness_box.png`: "A small wooden witness stand. White background."
25. `herald_props.png`: "Separate on white: a long herald's trumpet with a banner of hearts; a parchment scroll; a slate and a slate-pencil; a pepper-box."

### Thought vignettes (oval, engraved, white background)
26. `vignette_refreshments.png`: "Plates of jam tarts being handed round on a tray."
27. `vignette_slates.png`: "Several slates with 'stupid things!' written on them, one spelt wrong."

Priority if time is short: 5, 9, 10, 8, 16, 20, 21, 22, 23, 12, 7, 11, then the rest.
