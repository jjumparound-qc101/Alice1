# Amendments

Changes to the original spec, newest first. Each entry has a date, a status (Proposed, Confirmed or Rejected), the change, and the reason.

## 2026-10-11: Phones and tablets
Status: Confirmed by the owner ("go ahead with all of it").

- **Portrait phones** read like an illustrated book: the picture in a band at the top (about 4:3, at most 58% of the screen), the running paragraph below it. The text-layout choice doesn't apply there.
- **Landscape phones:** picture first. A two-line text strip low on the left; Play and "More" on the right (the other buttons fold into the More panel); the controls and timeline fade away after a few seconds of reading and come back on a touch. The picture is lifted a little above the strip.
- **Every screen keeps the width of view the shots were framed for** (45° on 16:9): narrow or tall pictures show more above and below rather than cutting off the sides.
- **Touch:** tap the picture to show the controls, tap again to play or pause; swipe the picture or the text for the next or previous sentence. In Explore: drag to look, tap the ground to walk there, hold a finger down to walk forward, tap a hotspot's label to inspect it; the play button reads "Back to the story".
- **Phone basics:** room for notches and rounded corners, finger-sized buttons, a lower render resolution on touch screens.

## 2026-10-11: How the AI art is made for the rest of the book
Status: Confirmed by the owner.

- **Numbered card people** (soldiers, courtiers, children, gardeners, officers) are generated as card bodies with a **plain white face**; the game prints each card's pips in the period layout and colour. A handful of bodies covers the whole pack, and the pip counts are always right.
- **Colour in AI art:** suit signs on court cards and the court's decorative hearts are drawn as **solid black shapes**; the processing tool turns hearts and diamonds red. The style block's "no colour" rule stays for every image.
- **Tenniel figures** marked "Direct (cut out from a high-resolution scan)" are **generated as AI now**, from the plate as reference, so the whole list can be made at once and matches in style. Cut-outs from scans are an optional upgrade later.
- **The executioner** is the Ace of Spades (the text doesn't say; in English packs the Ace of Spades was the large ornate card).

## 2026-10-11: The card people are coloured like real cards, one pack of 52
Status: Confirmed by the owner. Replaces "Chapter VIII card suits stay ink" below.

- **Colour.** Hearts and diamonds are red, clubs and spades black, on the pips and suit signs (the bodies, heads and limbs stay ink). Court cards carry their suit sign in its colour. The hearts that decorate the court (the canopy over the throne, the throne itself, the herald's banner) are red too.
- **Period styling.** English packs of 1865 had no corner numbers, so the rank is read by counting the pips, laid out as on a real card (lower-half pips upside down; the ace one large pip). No numerals.
- **One pack.** The text speaks only of "a pack of cards" and "the whole pack", and its counts fit one pack of 52: ten soldiers "carrying clubs" (ace to ten of clubs), ten courtiers "ornamented all over with diamonds" (ace to ten of diamonds), ten royal children "ornamented with hearts" (ace to ten of hearts), the guests "mostly Kings and Queens" (the Kings and Queens of clubs, diamonds and spades, and the Knave of Spades), and the Knave, King and Queen of Hearts. The gardeners Two, Five and Seven are spades, after Tenniel (the text gives no suit). Each card person is a different card. The blind areas use the spare spades: the executioner (the Ace of Spades), and the officers of the court in Chapter XI (Three and Four of Spades). The Knaves of Clubs and Diamonds and the rest of the spades are free for later scenes.

## 2026-10-10: Chapter VIII card suits stay ink
Status: Replaced by the owner on 2026-10-11 (see above).

The text says the courtiers are "ornamented all over with diamonds" and the royal children "with hearts", but never says red. By the colour rule (docs/COLOR.md) the suits stay ink, like Tenniel's prints, so the painted red roses and the crimson cushion are the only red on the croquet-ground.

## 2026-10-10: The turnaround is Alice's model sheet
Status: Confirmed by the owner.

The Alice turnaround (`source/ai/alice_turnaround.webp`: front, three-quarter, profile and back) is the model for every Alice drawing from now on. Tenniel's plates are attached only as pose references; Alice keeps the turnaround's face, hair, dress and proportions. Attach the turnaround with every Alice prompt.

## 2026-10-10: Notes 1.0 staging choices (code only)
Status: In effect; owner may revisit.

- **One walk for all movement.** The composed running poses are retired (their legs read wrongly in motion; owner). Alice walks with `walk_a`/`walk_b` at every speed; one step per 0.4 of her height covered, so her feet keep pace with the ground. `tools/walk_report.mjs` lists every leg's steps per second (keep them under about 4). Running art can come back later as a proper drawn cycle.
- **Held things follow the drawn hand.** Each pose records where its hand is drawn, and props she holds are placed there.
- **Into the hall through black.** Scene changes can fade through paper (the default) or through black; the hall uses black, then lights up from dark.
- **Thought vignettes** are oval cards beside Alice: the poker, knife, poison, candle, Dinah's milk, and cats and bats.
- **Spot colours** lie over the ink rather than being multiplied into it, so they read brighter while the line work still shows.

## 2026-10-10: Navigation, spot-colour vibrance, Chapter II timing
Status: Confirmed by the owner.

- Readers get four ways to move through a chapter: a timeline scrubber with scene marks, skip keys (sentence and scene), playback speed (up to 2×, pitch kept), and a chapter scene menu.
- Spot colours (docs/COLOR.md) are made richer and brighter, with a slight glow. Ink and paper are unchanged.
- Chapter II starts after the Chapter I Notes 1.0 are done. Its art is made the same way as Chapter I's.

## 2026-10-10: Alice's poses are whole figures, not a jointed puppet
Status: In effect; owner may revisit.

Adjusts item 3 of the hybrid art-source entry ("characters are built as cutout puppets with swappable parts"). The AI parts sheets don't include the skirt between waist and hem, so a free-jointed puppet would show a gap or a too-short skirt. Instead, poses are whole figures:
- composed from the AI drawings where possible (running = turnaround + running legs, `tools/compose_poses.py`), and
- otherwise generated as whole figures in the same ChatGPT conversation (prompts in [ART_PROMPTS.md](ART_PROMPTS.md)).
The game swaps poses by name and alternates stride drawings while a figure moves. AI makes whole poses cheap, so this costs less than jointing parts and looks better.

## 2026-10-10: Gate A: three.js chosen
Status: Confirmed by the owner.

The game is built on a custom three.js engine (Node, Vite, three.js), after a side-by-side comparison with Godot 4.4 ([GATE_A.md](GATE_A.md)). The Godot build stays in `godot/` for reference only and won't be updated. Steam packaging test passed on 2026-10-10: Electron build on Windows, Steam connection and overlay, 60 fps on an RTX 3060 Ti. Still to do: a low-end hardware check and code signing before release. This also confirms the 2.5D "toy theater" art direction below.

## 2026-10-10: Text layout is a reader setting
Status: Confirmed by the owner.

The reader chooses how the text appears: a bottom strip (the default), a top strip, or a side page. All three are built in the slice (press L).

## 2026-10-10: Black and white with spot color from the text
Status: Confirmed by the owner.

This amends art-style decision 1 ("black-and-white ink, matching Tenniel's engravings"). The world stays black-and-white ink, but anything the text gives a color has that color. The rules are in [COLOR.md](COLOR.md).

## 2026-10-10: Interim AI master drawings; NYPL scans; Godot comparison slice
Status: Confirmed by the owner.

- The three master drawings (Alice turnaround, riverbank, rabbit-hole shaft) are AI-generated for now in ChatGPT (OpenAI image generation) by the owner, using Tenniel plates as reference. Prompts are in [ART_PROMPTS.md](ART_PROMPTS.md). An artist may replace them later. This is a temporary change to item 2 of the hybrid art-source entry below.
- Tenniel scan source: the NYPL Berg Collection copy of the 1866 Macmillan second edition (to be confirmed that high-resolution downloads are available).
- Gate A: rebuild the riverbank slice in Godot 4 for a side-by-side comparison with three.js.

## 2026-10-10: The art source is hybrid (master drawings, then AI fill)
Status: Confirmed by the owner.

This replaces art-style decision 2 ("Tenniel scans used directly, with AI only to fill hidden areas and missing poses").

1. Tenniel scans are used directly wherever a plate covers the pose or set.
2. A small set of style-matched master drawings is commissioned from an artist: an Alice turnaround, the riverbank, and the rabbit-hole shaft wall. Extend the list as later chapters need.
3. Characters are built as cutout puppets with swappable parts (heads, arms, hands), drawn from the scans and the masters.
4. AI fills the remaining gaps, using the scans and masters as reference, never in-style from nothing.
5. Every AI-generated or AI-modified asset is logged in PROVENANCE.md and disclosed on Steam.

Reason: about two-thirds of Chapter I's poses have no Tenniel source (see [CHAPTER_01_ASSETS.md](CHAPTER_01_ASSETS.md)), so "scans first, AI only for gaps" doesn't hold.

## 2026-10-09: Art direction is 2.5D "pop-up book / toy theater"
Status: Confirmed in Gate A (2026-10-10).

The art direction changes from fully explorable 3D to 2.5D "pop-up book / toy theater":
- Characters and scenery are hand-drawn, Tenniel-based 2D art in layered 3D sets, with a moving camera.
- Explore Mode keeps free movement within each diorama, with a constrained camera arc.

Reason: it's more faithful to the original illustrations, costs less and carries less risk, fits the Claude Code workflow better, and gives Library of Living Books a visual identity it can reuse.

See [ART_DIRECTION_ANALYSIS.md](ART_DIRECTION_ANALYSIS.md).

## 2026-10-09: A custom three.js engine is allowed as a Gate A candidate
Status: Confirmed; three.js was chosen in Gate A (2026-10-10).

This amends the spec's caution against defaulting to a custom engine. A three.js-based engine may be chosen if Gate A shows it's the right choice. Gate A must still compare it honestly against Godot, covering the staging timeline, puppet animation, saves, UI, and Steam packaging.
