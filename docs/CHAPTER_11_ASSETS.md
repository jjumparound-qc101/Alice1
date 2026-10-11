# Chapter XI Asset List: "Who Stole the Tarts?"
Date: 2026-10-10
Status: Draft for the owner. Plates checked against web-resolution images from Victorian Web on 2026-10-10. The prompts are in [ART_PROMPTS.md](ART_PROMPTS.md), "Chapter XI asset list", and are added to [ASSETS_MASTER.md](ASSETS_MASTER.md). Same method as before: the Alice model sheet attached for every Alice drawing; Tenniel plates as references, and cut out directly for figures other than Alice (from high-resolution scans).

## The chapter in places
1. **The court of justice**, all chapter long: the King and Queen of Hearts on their throne (the King as judge, his crown over his wig); the Knave in chains between two soldiers; the White Rabbit as herald with trumpet and scroll; the table with a large dish of tarts in the middle; the jury-box with twelve creatures writing on slates (Bill the Lizard among them); a great crowd of little birds and beasts and the whole pack of cards; the witness stand; the door. Chapter XII plays in the same court, so the set is shared (`src/sets/court.js`).

## Tenniel plates for Chapter XI
| ID | Plate | Status | Used for |
|---|---|---|---|
| W-11-1 | The White Rabbit as herald, in a tabard of hearts, blowing a trumpet, the scroll under his arm | Seen | R11-01 (can be cut out) |
| W-11-2 | The Hatter as witness, a teacup in one hand and bread-and-butter in the other | Seen | H11-01 (can be cut out) |
| W-11-3 | The Hatter hurrying out of court, his shoes left behind | Seen | H11-03 (can be cut out) |
| Frontispiece | The trial: the King as judge with crown over wig, the Queen, the Knave in chains, the Rabbit, the tarts, the jury | Not on Victorian Web | K11-01, the court set. The text says "look at the frontispiece"; get it from a high-resolution scan with the others |

## Colour
| Thing | Colour | Text | Rule |
|---|---|---|---|
| The Hatter's face | pale, briefly | "the Hatter, who turned pale and fidgeted" | 3 (a flush to pale, then back to ink) |
| The White Rabbit | paper-white, pink eyes | as before | 1, 8 |
The cards' suits are red and black, as on real cards (owner, 2026-10-11).

## Alice: 5 poses (whole figures, model sheet attached)
| ID | Beat | Source | Base |
|---|---|---|---|
| A11-01 | Standing at the back of the court beside the Gryphon, looking at everything; whispering to it | New | — |
| A11-02 | Taking the squeaky pencil from behind the Lizard | New | — |
| A11-03 | Sitting among the crowd, beginning to grow (squeezing the Dormouse) | New | A9-04 |
| A11-04 | Growing larger: the same figure scaled, her head nearly to the roof | Reuse | scaled |
| A11-05 | Startled to hear her own name called: "Alice!" | New | — |

## Characters
| ID | Figure and beat | Source | Base |
|---|---|---|---|
| K11-01 | The King as judge, crown over a great wig, on the throne; putting on spectacles; folding his arms and frowning | Adapt | Frontispiece, K8-01 |
| Q11-01 | The Queen on the throne; staring at the Hatter through spectacles | New | Q8-01 |
| KN11-01 | The Knave standing in chains | Adapt | Frontispiece, KN8-01 |
| S11-01 | A soldier on guard (one each side of the Knave) | Reuse | S8-01 |
| R11-01 | The White Rabbit as herald blowing the trumpet; reading the scroll; fumbling over the list | **Direct** (high-res scan) or Adapt | W-11-1 |
| H11-01 | The Hatter as witness with teacup and bread-and-butter; biting the teacup | **Direct** or Adapt | W-11-2 |
| H11-02 | The Hatter trembling so he shakes his shoes off; down on one knee | New | W-11-2 |
| H11-03 | The Hatter hurrying out, without his shoes | **Direct** or Adapt | W-11-3 |
| MH11-01 | The March Hare arm in arm with the Dormouse; "I deny it!" | New | Chapter VII |
| DM11-01 | The Dormouse, standing up sulkily and crossing the court; asleep | New | Chapter VII |
| CK11-01 | The Duchess's cook with the pepper-box; "Shan't" | New | Chapter VI cook |
| J11-01 | The twelve jurors writing on slates: Bill the Lizard, two guinea-pigs, birds and beasts (the Dodo, the Lory, the Eaglet, the Duck, a mouse, a frog, a hedgehog, a squirrel, a mole) | New | Chapters III and IV figures |
| J11-02 | Bill writing with one finger | New | Chapter IV Bill |
| GP11-01 | A guinea-pig cheering; the officers' canvas bag, tied at the mouth, an officer sitting on it | New | Chapter IV guinea-pigs |
| GR11-01 | The Gryphon in the crowd, whispering | Reuse | GR9-02 |
| CR11-01 | The crowd: little birds and beasts and the pack of cards, in rows (a backdrop) | New | — |

## Sets and props
| Item | Source | Notes |
|---|---|---|
| The courtroom: a high back wall with a canopy of hearts over the throne, side walls, floor (a set) | Adapt | Frontispiece |
| The throne for two on a dais | Adapt | Frontispiece |
| The jury-box (a low railed box with two rows of seats) | Adapt | Frontispiece, W-12-1 |
| The table with a large dish of tarts | Adapt | Frontispiece, W-12-2 |
| The witness stand | New | — |
| Trumpet, parchment scroll, slates and pencils, the canvas bag, the pepper-box, teacup and bread-and-butter | New | — |

## Thought vignettes: 2
| ID | Thought | Text |
|---|---|---|
| V11-01 | Tarts handed round as refreshments | "I wish they'd get the trial done, and hand round the refreshments!" |
| V11-02 | The jurors' slates: "stupid things!", one asking how to spell "stupid" | "all the jurors were writing down 'stupid things!' on their slates" |

## Coverage
| | Direct | Adapt | New | Total |
|---|---|---|---|---|
| Alice | 0 | 0 | 4 (+1 scaled) | 5 |
| Court characters | 3 (high-res scans) | 2 | 10 (+2 reuse) | 17 |
| Sets, props, vignettes | 0 | 4 | 4 | 8 |

## Audio
Narration is ready: `public/audio/ch11.mp3`, `public/data/ch11_words.json` (97.7% of words matched directly).

## Sources
- [Victorian Web: Tenniel's Wonderland plates](https://victorianweb.org/art/illustration/tenniel/alice/), plates [11.1](https://victorianweb.org/art/illustration/tenniel/alice/11.1.html) to [11.3](https://victorianweb.org/art/illustration/tenniel/alice/11.3.html); the frontispiece is not on Victorian Web
- Text: Project Gutenberg #11, Chapter XI (`source/text/ch11.txt`)
