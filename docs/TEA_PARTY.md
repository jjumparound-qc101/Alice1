# The Mad Tea-Party: the upgrade (plan, agreed with J 2026-10-26)

Builds on the first pass of 2026-10-25 (table top, cloth on four sides, the three behind the table).
True to Carroll and Tenniel throughout.

## The set
- The moment: Tenniel's famous plate. The Hatter mid-speech with cup and bread-and-butter, the March
  Hare leaning in, the Dormouse asleep between them as their cushion, Alice in the big arm-chair at the end.
- Just the four characters. The life comes from the setting and the tea things.
- The table: twice as long, twice as wide, 80% as tall (the people and chairs keep their size).
  Laid on both sides; the near side has empty chairs spaced apart so the painter can step in between
  and reach the middle. The three stay crowded at the far corner, as in the book.
- The cloth: plain white, as Tenniel drew it, with a simple fringed edge; one Fill covers it.
- The book's objects, each its own named, paintable piece: the Hatter's watch (dipped in tea, with the
  butter, stopped at six), the bread-knife, the butter dish, the upset milk-jug, the teapot, the sugar
  bowl, the cake stand, plates, used and clean cups all down the table, the Hatter's hat with its
  "In this style 10/6" ticket.
- The March Hare's house close and large behind the table: chimneys shaped like ears, roof thatched with fur.
- One big tree whose branches arch over the table.
- The painter's eye a little above the table top, and a "sit down" button that drops to chair height.

## Life in the scene
Gentle motion that never gets in the way of the brush: steam from the teapot, the Dormouse breathing,
a leaf or two falling, the watch at six. No big movement while painting.

## The book
The book's tea party scene plays at the same new table (moving one place on, the Dormouse into the
teapot, Alice walking off), retimed to fit. A pass checks that the table and cloth line up in every
shot of each of the chapter's scenes. The change is owed to Alice1 at the next milestone.

## Music and achievements
- Chapter VII's hidden music box: under the table, among the chair legs behind the hanging cloth.
  A faint tinkle grows as you near it; painting it plays the tune, fuller as you go; at 100% the lid
  opens and the swing "Twinkle" plays in full. The swing "Twinkle" is finished in this work (our own
  arrangement, tune exact, from music_tests/twinkle_swing_exact.mp3).
- New achievements (Steam-ready): the music box's own; "Ten and Six" (paint the Hatter's hat, ticket
  and all); "It's Always Six O'Clock" (paint every cup on the table).

## Art
New drawings by the image AI in Tenniel's engraving style, matched to the scene's art, each checked
before it goes in. A few dollars in all.

## Phones
Every small piece stays big enough to tap and Fill on a phone; checked at phone and tablet sizes with
each batch.

## Order of work
1. Layout with the art we already have; screenshots (desktop, phone, tablet) for J's approval.
2. The new drawings.
3. The book's scene retimed, and the alignment pass on every shot.
4. The motion.
5. The music box, the swing "Twinkle" and the achievements.
6. Once J agrees the set: the "Move down!" button (everyone shifts one place, leaving dirty cups and
   new clean places to paint).

## Status and handoff (2026-10-26)
Work is on branch `claude/project-thread-lx54zc` (not yet merged to main; merge once J agrees the set).
- Step 1 done (03e6fcb): TBL in src/scenes/teaParty.js {x0 -1.2, x1 5.0, z -0.65, d 1.0, h 0.19}; FAR/NEAR place
  lines; NEAR_CHAIRS; house at (3.7, -2.5) 3.4 wide; sets.js bounds/targets widened. J approved the layout.
- Step 2 done (09492c1): new drawings (tools/tea_art.py, PROVENANCE "ai_tea_party_second_overhaul"): tea_oak behind
  the three, tea_canopy overhead (y 2.2), tea_cloth_plain + tea_tabletop_plain, chair backs (near side; far chairs
  have a back drawing behind them, FrontSide only), bread-knife, butter dish, tea_music_box_shut under a far chair
  at x 3.4 (open drawing ready for step 5). Screenshots: /mnt/project-files/ptrr/tea_party/drawings_step2.jpg.
- tools/tea_check.mjs passes desk and phone (34 cups; ball on the oak; the book's paint takes up to ~3 min to load in
  software GL with ~100 sheets, so its wait is 360 s).
- Step 3 done (2026-10-26, branch claude/project-thread-3nz1si, from lx54zc): every shot of the book's tea party walked
  every 4 s (screenshots) and with tools/frame_report.mjs. Found: at the wider table the close shots left the three as
  small heads lost in the oak's roots, and after "one place on" Alice leaned across a table a metre deep. Fixed: close
  shots (CLOSE(x)) stand over the table's near half; the oak moved aside to (-1.7, -2.0) so the three sit against open
  field; Alice walks round the end of the table to the March Hare's old place on the far side (ALICE_PLACE) and back
  round to walk off; new shots FOUR (Alice in the arm-chair and the three) and Alice in the Hare's place with the house
  behind; PARTY and OVER moved closer. Alice is out of the picture no longer than before (longest ~11 s). Table and
  cloth line up in every shot (the hall and garden scenes have no table). Screenshots:
  /mnt/project-files/ptrr/tea_party/book_step3.jpg. Owed to Alice1 at the next milestone with the rest.
- Step 4 done (2026-10-26, same branch): in src/scenes/teaParty.js, life(cam) on a wall clock (performance.now), so it
  runs while the book is paused and while painting: three ink steam wisps over each teapot (steamTex, facing the
  camera, follow the pot's visibility), four oak leaves falling from under the crown to lie on the grass or the cloth
  (leafTex, an 11 s cycle each, seeded places), and the sleeping Dormouse breathing (2.5% rise and fall). None of it
  takes paint (still(): userData.notPaint, no raycast). tea_check passes desk and phone. Not yet looked at closely
  by J; the steam is deliberately faint.
- J's answers (2026-10-26, after step 4): keep the oak moved aside in the paint set too. The moving things must TAKE
  paint (the steam wisps and the falling leaves; the Dormouse already does). Painting any leaf, falling or lying on
  the ground, unlocks a SECRET achievement and a leaf stamp in the shape of the falling leaves (the leafTex drawing).
  Build this first in the next thread, before step 5. Notes: remove still() from the wisps and leaves and give them
  paperFlat-style fronts so paintables() picks them up; paint keys are "by picture and place" (src/paint/layers.js),
  so moving pieces need a key that does not change as they move; each leaf restarts its fall every 11 s (decide
  whether its paint stays with it: recommended yes); a painted leaf must be catchable by the brush while falling
  (slow it or widen the hit area on phones); add the achievement (Steam id, hidden) in src/paint/achievements.js
  and the stamp in src/paint/stamps.js; check desk, phone, tablet.
- Done 2026-10-26 (branch claude/project-thread-lyqvs9, from 3nz1si): J's answers after step 4. The oak stays moved
  aside in the paint set (it is the book's scene; nothing to change). The steam (redrawn as paper curls with an ink
  edge, so paint shows on it) and the falling leaves take paint as extras; a leaf keeps its paint when it falls again
  (the previous thread's recommendation, under J's "follow your recommendations"); leaves a little larger (6 cm) and
  slower (14 s cycle, about 8 s falling, 5 s lying). Secret FLUTTERED_DOWN + the secret oak-leaf stamp. Details in
  docs/PAINT.md, "The Mad Tea-Party".
- Step 5 done 2026-10-26 (same branch): the music box (src/paint/teaParty.js; tinkle, phrase per stroke fuller as
  painted, opens at 90% and plays the swing Twinkle), the swing Twinkle finished (tools/music/twinkle_swing.py ->
  public/audio/music/twinkle_swing.mp3, 76 s; copy for J at /mnt/project-files/ptrr/tea_party/twinkle_swing_final.mp3),
  TEN_AND_SIX, ITS_ALWAYS_SIX_OCLOCK, TWINKLE_LITTLE_BAT (secret). tea_check passes desk, phone, tablet.
- Later 2026-10-26 (same branch): Fill fixed on small pieces (sheets at least 256 px, docs/PAINT.md); five fun things
  on the table (decanter, raven and writing-desk, clock at six, treacle tin, hat stack), J was offered the choice on a
  card, recommended all five.
- Later still 2026-10-26/27: Redo beside Undo everywhere; the tea party's ground fills region by region again
  (`groundRegions` in sets.js). Web link v31. tea_check now also checks Redo and the ground (desk, phone, tablet pass
  except that the ground check's threshold was loosened to < 90% after a tap covered 55%: rerun to confirm).
- Step 6 done 2026-10-27 (same branch, J: "Move down"): the Move down! button (docs/PAINT.md, "Move down!"). tea_check passes desk, phone, tablet. Web link v32.
- Merged into main 2026-10-27 (J: "yes"); work on main from now on. Still owed: the book changes to Alice1 at the next milestone.
- 2026-10-27 (J: "Alice starts getting cut off"): walking out of the arm-chair her picture crossed the chair's drawing, so she now stands a step in front of it (`CHAIR_FRONT` in src/scenes/teaParty.js) before she sits and after she rises. Also owed to Alice1. tea_check now waits for the tea party's own sheets after its reload (it had stopped at a sheet of the scene behind the title).
- Settled 2026-10-27: the planned bat creature's achievement is "Do Cats Eat Bats?" (J), as the music box has "Twinkle, Twinkle, Little Bat!"; docs/PLAN.md updated.
- 2026-10-26: after the sheet-size change sets_check passes on phone; on desk the "book shows the set's paint" step
  times out now and then (pool, caucus, mushroom), and fails the same way with the code from before the change, so it
  is the software-GL wait, not the game: run the set alone to confirm.
- Testing tips: a camera-shot tool that overrides the scene camera at a time and screenshots (scenes[i].camera can be
  swapped in the page: S.scenes.find(...).camera = () => ({pos, look})) was used for step 3; tools/frame_report.mjs
  7 1 for Alice in the picture. tea_check's book-paint wait can time out once in software GL; rerun before worrying.
- Next: step 5 (music box under the far chair at x 3.4: faint tinkle growing as you near it, painting plays the tune
  fuller as you go, at 100% the lid opens (tea_music_box_open drawing ready) and the swing Twinkle plays in full;
  finish the swing Twinkle from /mnt/project-files/ptrr/music_tests/twinkle_swing.py; achievements TEN_AND_SIX (the
  Hatter's hat: part of his drawing, use the part maps), ITS_ALWAYS_SIX_OCLOCK (every cup), and the box's own, in
  src/paint/achievements.js with Steam ids), then 6 Move down after J agrees the set.
- (Old note) step 3 (book retime + alignment pass: walk every camera shot of teaParty with tools/frame_report.mjs or
  screenshots; cameras use S() = FAR line now), then 4 motion (steam, Dormouse breathing, leaves), 5 music box
  behaviour + swing Twinkle (finish from /mnt/project-files/ptrr/music_tests/twinkle_swing.py) + achievements
  TEN_AND_SIX, ITS_ALWAYS_SIX_OCLOCK and the box's own, 6 Move down (after J agrees the set).
- Not yet: the Hatter's hat as its own piece for "Ten and Six" (the hat is part of his drawing: use the part maps).
