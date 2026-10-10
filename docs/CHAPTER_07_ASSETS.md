# Chapter VII Asset List: "A Mad Tea-Party"
Date: 2026-10-10
Status: Draft for the owner. Plates checked against web-resolution images from Victorian Web on 2026-10-10. The prompts are in [ART_PROMPTS.md](ART_PROMPTS.md), "Chapter VII asset list". Same method as before: the Alice model sheet attached for every Alice drawing; Tenniel plates as references, and cut out directly for figures other than Alice (from high-resolution scans).

## The chapter in places
1. **The tea-table under a tree in front of the March Hare's house** (Chapter VI's last set): the long table laid with many tea-things, the large arm-chair, the Hatter, the March Hare and the Dormouse. Almost the whole chapter happens here.
2. **The wood**, briefly, as she walks off: a tree with a door in it.
3. **The long hall again**, the glass table and the golden key (Chapter I's set, with your hall art), then down the little passage **into the garden**, "among the bright flower-beds and the cool fountains". Chapter VIII begins in that garden, so its set is shared.

## Tenniel plates for Chapter VII
| ID | Plate | Status | Used for |
|---|---|---|---|
| W-07-1 | The tea-party: Alice in the arm-chair, the March Hare, the sleeping Dormouse, the Hatter (hat ticket "In this Style 10/6"), the long table with cups | Seen | A7-01 (reference), H7-01, M7-01, D7-01 (can be cut out), the table and chair |
| W-07-2 | The Hatter, mouth open, one hand up, at the table, the Dormouse beside him | Seen | H7-02 (can be cut out) |
| W-07-3 | The March Hare and the Hatter pushing the Dormouse into the teapot | Seen | M7-03, H7-04, D7-03 (can be cut out) |

## Colour
Only the golden key at the end (gold, as before). "Bright flower-beds" is not a colour (COLOR.md rule 7). The Hatter's hat ticket "In this Style 10/6" is lettering, kept as in Tenniel.

## Alice: 7 poses (whole figures, model sheet attached)
| ID | Beat | Source | Base |
|---|---|---|---|
| A7-01 | Sitting in a large arm-chair at the end of the table, indignant | Adapt | W-07-1 |
| A7-02 | Sitting, leaning forward, curious (looking at the watch; asking about the treacle-well) | New | — |
| A7-03 | Sitting, helping herself to tea and bread-and-butter | New | — |
| A7-04 | Getting up in disgust and walking off, glancing back over her shoulder | New | — |
| A7-05 | At a tree with a door in it, opening the door | New | — |
| A7-06 | Unlocking the little door with the golden key | New | Chapter I `alice_hold` / `alice_kneel` if they arrive |
| A7-07 | In the garden at last, among flower-beds, delighted | New | — |

## The Hatter, the March Hare and the Dormouse
| ID | Figure and beat | Source | Base |
|---|---|---|---|
| H7-01 | The Hatter at the table, staring at Alice ("Your hair wants cutting") | **Direct** (high-res scan) or Adapt | W-07-1 |
| H7-02 | The Hatter, mouth open, a hand raised (the riddle; "Twinkle, twinkle") | **Direct** or Adapt | W-07-2 |
| H7-03 | The Hatter holding his watch to his ear, shaking it | New | — |
| H7-04 | The Hatter moving one place on along the table, standing | Adapt | W-07-3 |
| M7-01 | The March Hare at the table | **Direct** or Adapt | W-07-1 |
| M7-02 | The March Hare dipping the watch into his tea, gloomy | New | — |
| M7-03 | The March Hare pushing the Dormouse into the teapot | **Direct** or Adapt | W-07-3 |
| D7-01 | The Dormouse asleep, used as a cushion | **Direct** or Adapt | W-07-1 |
| D7-02 | The Dormouse awake, telling the story, eyes half shut | New | — |
| D7-03 | The Dormouse going into the teapot | **Direct** or Adapt | W-07-3 |

## Sets and props
| Item | Source | Notes |
|---|---|---|
| The long table, laid for many, with a cloth | Adapt | W-07-1 |
| A large arm-chair | Adapt | W-07-1 |
| Tea-things: cups and saucers, plates, a big teapot, a milk-jug, bread-and-butter, the butter dish | Adapt | W-07-1, W-07-3; one sheet of separate pieces |
| The Hatter's watch (tells the day of the month) | New | Close-up for the "Two days wrong!" moment |
| The tree in front of the March Hare's house, shading the table | Adapt | W-07-1 |
| A tree with a door in it | New | — |
| The garden: bright flower-beds and cool fountains | Chapter I `garden_through_door` | Chapter VIII needs it as a full set; listed there |

The March Hare's house is Chapter VI's prompt 33; the hall, the glass table, the little door and the passage are Chapter I's.

## Thought vignettes: 4
| ID | Thought | Text |
|---|---|---|
| V7-01 | A raven and a writing-desk | "Why is a raven like a writing-desk?" |
| V7-02 | The Queen's concert: the Hatter singing, the Queen jumping up | "it was at the great concert given by the Queen of Hearts" |
| V7-03 | "Twinkle, twinkle, little bat … Like a tea-tray in the sky" | The Hatter's song |
| V7-04 | Three little sisters at the bottom of a treacle-well | "Elsie, Lacie, and Tillie; and they lived at the bottom of a well" |

## Coverage
| | Direct | Adapt | New | Total |
|---|---|---|---|---|
| Alice | 0 | 1 | 6 | 7 |
| Hatter, March Hare, Dormouse | 6 (high-res scans) | 1 | 3 | 10 |
| Sets, props, vignettes | 0 | 4 | 6 | 10 |

## Audio
Narration is ready: `public/audio/ch07.mp3`, `public/data/ch07_words.json` (96.9% of words matched directly).

## Sources
- [Victorian Web: Tenniel's Wonderland plates](https://victorianweb.org/art/illustration/tenniel/alice/), plates [7.1](https://victorianweb.org/art/illustration/tenniel/alice/7.1.html), [7.2](https://victorianweb.org/art/illustration/tenniel/alice/7.2.html), [7.3](https://victorianweb.org/art/illustration/tenniel/alice/7.3.html)
- Text: Project Gutenberg #11, Chapter VII (`source/text/ch07.txt`)
