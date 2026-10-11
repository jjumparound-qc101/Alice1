# Chapter XII Asset List: "Alice's Evidence"
Date: 2026-10-11
Status: Draft for the owner. Plates checked against web-resolution images from Victorian Web on 2026-10-10. The prompts are in [ART_PROMPTS.md](ART_PROMPTS.md), "Chapter XII asset list", and are added to [ASSETS_MASTER.md](ASSETS_MASTER.md). Same method as before: the Alice model sheet attached for every Alice drawing; Tenniel plates as references, and cut out directly for figures other than Alice (from high-resolution scans).

## The chapter in places
1. **The court** (Chapter XI's set, `src/sets/court.js`): Alice, grown large, jumps up and tips over the jury-box with the edge of her skirt; she puts the jurors back (Bill head downwards, then right way up); "Rule Forty-two"; the King turns pale; the White Rabbit reads the verses; the Queen throws an inkstand at Bill; "Sentence first—verdict afterwards"; the Queen turns purple; "You're nothing but a pack of cards!"; the whole pack flies up at Alice.
2. **The riverbank** (Chapter I's set): Alice wakes with her head in her sister's lap, tells her dream and runs in to tea. Her sister sits on in the setting sun and dreams of Wonderland: the creatures come alive around her, then turn back into the sounds of the countryside; last, she pictures Alice grown up, telling her own children the dream.

## Tenniel plates for Chapter XII
| ID | Plate | Status | Used for |
|---|---|---|---|
| W-12-1 | Alice, grown large, tipping over the jury-box; the jurors tumbling out (the Lizard, birds and beasts) | Seen | A12-01 (reference), J12-01 (can be cut out) |
| W-12-2 | The King as judge on the throne, the Knave in chains before him, the tarts | Seen | K12-01, KN12-01 (can be cut out), the throne |
| W-12-3 | The pack of cards flying up at Alice, who beats them off | Seen | A12-04 (reference), the flying cards |

## Colour
| Thing | Colour | Text | Rule |
|---|---|---|---|
| The King's face | pale, briefly | "The King turned pale, and shut his note-book hastily" | 3 |
| The Queen's face | purple, briefly | "said the Queen, turning purple" | 3 |
| The card suits | red hearts and diamonds, black clubs and spades | (owner, 2026-10-11) | — |
| The White Rabbit | paper-white, pink eyes | as before | 1, 8 |
The setting sun is not given a colour ("watching the setting sun"): ink. "Bright eager eyes": bright is not a colour (rule 7).

## Alice: 6 poses (whole figures, model sheet attached)
| ID | Beat | Source | Base |
|---|---|---|---|
| A12-01 | Jumping up in a hurry, her skirt sweeping the jury-box over | Adapt | W-12-1 |
| A12-02 | Bending to pick up the jurors and put them back | New | — |
| A12-03 | Standing at full size, defiant: "Who cares for you?" | New | — |
| A12-04 | Beating off the flying cards, half frightened, half angry | Adapt | W-12-3 |
| A12-05 | Lying on the bank, her head in her sister's lap | New | — |
| A12-06 | Running off home to tea | New | Walk cycle works |

## Characters
| ID | Figure and beat | Source | Base |
|---|---|---|---|
| J12-01 | The jurors sprawling, upset out of the box | **Direct** (high-res scan) or Adapt | W-12-1 |
| J12-02 | Bill the Lizard head downwards in the jury-box, tail waving; then sitting with his mouth open | New | Chapter IV Bill |
| K12-01 | The King writing in his note-book; pale; spreading the verses on his knee | **Direct** or Adapt | W-12-2 |
| Q12-01 | The Queen purple with rage, throwing an inkstand; "Off with her head!" | New | Q8-01 |
| KN12-01 | The Knave in chains, shaking his head sadly | **Direct** or Adapt | W-12-2 |
| R12-01 | The White Rabbit reading the verses through his spectacles | New | R11-01 |
| PK12-01 | The pack flying: cards in the air, faces and backs | **Direct** or Adapt | W-12-3 |
| SI12-01 | The sister, Alice's head in her lap, brushing away dead leaves; then alone, head on her hand, eyes closed | New | `sister_read` |

## Sets and props
| Item | Source | Notes |
|---|---|---|
| The court | Reuse | Chapter XI set |
| The jury-box tipped over | New | Chapter XI jury-box |
| The King's note-book; the verses (a paper); the inkstand | New | — |
| The riverbank | Reuse | Chapter I set |
| Dead leaves fluttering down | New | — |

## Thought vignettes: 4
| ID | Thought | Text |
|---|---|---|
| V12-01 | The globe of goldfish Alice upset the week before | "reminding her very much of a globe of goldfish she had accidentally upset the week before" |
| V12-02 | The sister's dream: Wonderland's creatures, and the countryside sounds they turn into (sheep-bells, the shepherd boy, the farm-yard, the cattle) | "the rattling teacups would change to tinkling sheep-bells" |
| V12-03 | Alice grown up, telling the dream to other little children | "how she would gather about her other little children" |
| V12-04 | (staged, not a vignette) The creatures of the dream appear faintly around the sister, each as the text names it | "The long grass rustled at her feet as the White Rabbit hurried by" |

## Coverage
| | Direct | Adapt | New | Total |
|---|---|---|---|---|
| Alice | 0 | 2 | 4 | 6 |
| Court, sister | 4 (high-res scans) | 0 | 4 | 8 |
| Sets, props, vignettes | 0 | 0 | 6 | 6 |

## Audio
Narration is ready: `public/audio/ch12.mp3`, `public/data/ch12_words.json` (98.6% of words matched directly).

## Sources
- [Victorian Web: Tenniel's Wonderland plates](https://victorianweb.org/art/illustration/tenniel/alice/), plates [12.1](https://victorianweb.org/art/illustration/tenniel/alice/12.1.html) to [12.3](https://victorianweb.org/art/illustration/tenniel/alice/12.3.html)
- Text: Project Gutenberg #11, Chapter XII (`source/text/ch12.txt`)
