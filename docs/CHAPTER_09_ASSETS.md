# Chapter IX Asset List: "The Mock Turtle's Story"
Date: 2026-10-10
Status: Draft for the owner. Plates checked against web-resolution images from Victorian Web on 2026-10-10. The prompts are in [ART_PROMPTS.md](ART_PROMPTS.md), "Chapter IX asset list", and are added to [ASSETS_MASTER.md](ASSETS_MASTER.md). Same method as before: the Alice model sheet attached for every Alice drawing; Tenniel plates as references, and cut out directly for figures other than Alice (from high-resolution scans).

## The chapter in places
1. **The croquet-ground** (Chapter VIII's set, `src/sets/croquet.js`): Alice walks arm in arm with the Duchess, who rests her sharp chin on Alice's shoulder; the Queen stands in front of them "frowning like a thunderstorm" and the Duchess flees; the game goes on until every arch has been taken off to custody; the King pardons everyone.
2. **A sunny bank**: the Gryphon lying fast asleep in the sun ("If you don't know what a Gryphon is, look at the picture").
3. **The seashore**: the Mock Turtle "sitting sad and lonely on a little ledge of rock"; Alice and the Gryphon sit down with him and hear his history. Chapter X plays on the same shore, so this set is shared.

## Tenniel plates for Chapter IX
| ID | Plate | Status | Used for |
|---|---|---|---|
| W-09-1 | Alice and the Duchess arm in arm, Alice holding the flamingo, trees behind | Seen | A9-01 (reference), D9-01 (can be cut out) |
| W-09-2 | The Gryphon asleep in the sun, wings folded, on a grassy bank | Seen | GR9-01 (can be cut out), the bank |
| W-09-3 | The Gryphon, Alice and the Mock Turtle at the rock by the sea, the Mock Turtle weeping on his ledge | Seen | GR9-02, MT9-01 (can be cut out), A9-04 (reference), the rock and shore |

## Colour
None. The chapter names no colours (word search of `source/text/ch09.txt`), so everything is ink. The Rabbit is not in this chapter; the Queen's cards stay ink (owner, 2026-10-10).

## Alice: 5 poses (whole figures, model sheet attached)
| ID | Beat | Source | Base |
|---|---|---|---|
| A9-01 | Walking arm in arm with the Duchess, the flamingo under her other arm | Adapt | W-09-1 |
| A9-02 | Startled, the Duchess's chin on her shoulder; uncomfortable but polite | New | — |
| A9-03 | Walking slowly behind the Queen, frightened | New | Walk cycle works |
| A9-04 | Sitting on the shore, listening, hands in her lap | Adapt | W-09-3 |
| A9-05 | "ready to sink into the earth": sitting, shrinking a little, embarrassed | New | — |

## Characters
| ID | Figure and beat | Source | Base |
|---|---|---|---|
| D9-01 | The Duchess walking arm in arm, chin resting on Alice's shoulder | **Direct** (high-res scan) or Adapt | W-09-1 |
| D9-02 | The Duchess trembling, then running away ("was gone in a moment") | New | Chapter VI Duchess |
| Q9-01 | The Queen standing with arms folded, frowning like a thunderstorm | New | Chapter VIII Queen |
| Q9-02 | The Queen stamping, shouting "either you or your head must be off" | Reuse | Q8-02 |
| S9-01 | A soldier leading a player away into custody | New | S8-01 |
| GR9-01 | The Gryphon asleep in the sun | **Direct** or Adapt | W-09-2 |
| GR9-02 | The Gryphon sitting up, rubbing its eyes, chuckling | New | W-09-2, W-09-3 |
| GR9-03 | The Gryphon walking ahead ("Come on!") | New | W-09-3 |
| GR9-04 | The Gryphon sitting by the rock; lifting both paws in surprise; hiding its face in its paws | Adapt | W-09-3 |
| MT9-01 | The Mock Turtle sitting on his ledge, sighing, eyes full of tears | **Direct** or Adapt | W-09-3 |
| MT9-02 | The Mock Turtle sobbing; counting subjects on his flappers; hiding his face | New | W-09-3 |
| K9-01 | The King ("You are all pardoned") | Reuse | K8-01 |

The Mock Turtle has a calf's head, hind hooves and tail on a turtle's shell (Tenniel); he is drawn so, since the text says only "Mock Turtle".

## Sets and props
| Item | Source | Notes |
|---|---|---|
| The croquet-ground | Reuse | Chapter VIII set; no arches left by the end |
| A grassy bank in the sun | Adapt | W-09-2 |
| The seashore: sand, the sea, a far horizon (backdrop) | Adapt | W-09-3 |
| The rock with its little ledge | Adapt | W-09-3 |
| Pebbles and shells (scatter) | New | — |

## Thought vignettes: 4
| ID | Thought | Text |
|---|---|---|
| V9-01 | Pepper, vinegar, camomile, barley-sugar: the new kind of rule | "pepper that makes people hot-tempered … and vinegar that makes them sour" |
| V9-02 | Pigs flying | "Just about as much right … as pigs have to fly" |
| V9-03 | School in the sea: the old Turtle master, "Tortoise" | "we went to school in the sea. The master was an old Turtle" |
| V9-04 | The Drawling-master, an old conger-eel, and the Classics master, an old crab | "the Drawling-master was an old conger-eel … He was an old crab" |

## Coverage
| | Direct | Adapt | New | Total |
|---|---|---|---|---|
| Alice | 0 | 2 | 3 | 5 |
| Duchess, Queen, soldier, King | 1 (high-res scan) | 0 | 3 (+2 reuse) | 6 |
| Gryphon, Mock Turtle | 2 (high-res scans) | 1 | 3 | 6 |
| Sets, props, vignettes | 0 | 3 | 5 | 8 |

## Audio
Narration is ready: `public/audio/ch09.mp3`, `public/data/ch09_words.json` (96.7% of words matched directly).

## Sources
- [Victorian Web: Tenniel's Wonderland plates](https://victorianweb.org/art/illustration/tenniel/alice/), plates [9.1](https://victorianweb.org/art/illustration/tenniel/alice/9.1.html) to [9.3](https://victorianweb.org/art/illustration/tenniel/alice/9.3.html)
- Text: Project Gutenberg #11, Chapter IX (`source/text/ch09.txt`)
