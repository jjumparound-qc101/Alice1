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
