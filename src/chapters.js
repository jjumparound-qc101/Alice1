// The book: every chapter, its narration and text timings, and its staged scenes.
// A chapter is readable once its narration is aligned (`narrated`): its audio is
// public/audio/chNN.mp3 and its word timings public/data/chNN_words.json (tools/align.py).
// Until its scenes are built, a chapter plays on a placeholder title page.
import { CHAPTER_1 } from './scenes/index.js';
import { placeholder } from './scenes/placeholder.js';
import { pool } from './scenes/pool.js';
import { bank } from './scenes/bank.js';
import { CHAPTER_4 } from './scenes/rabbit.js';
import { CHAPTER_5 } from './scenes/caterpillar.js';
import { CHAPTER_6 } from './scenes/duchess.js';
import { CHAPTER_7 } from './scenes/teaParty.js';
import { CHAPTER_8 } from './scenes/croquet.js';
import { CHAPTER_9 } from './scenes/mockTurtle.js';
import { CHAPTER_10 } from './scenes/quadrille.js';
import { CHAPTER_11 } from './scenes/court.js';
import { SPOT } from './props.js';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const TITLES = [
  'Down the Rabbit-Hole', 'The Pool of Tears', 'A Caucus-Race and a Long Tale', 'The Rabbit Sends in a Little Bill',
  'Advice from a Caterpillar', 'Pig and Pepper', 'A Mad Tea-Party', 'The Queen’s Croquet-Ground',
  'The Mock Turtle’s Story', 'The Lobster Quadrille', 'Who Stole the Tarts?', 'Alice’s Evidence',
];
const NARRATED = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]); // every chapter's narration is aligned
const STAGED = { 1: CHAPTER_1, 2: [pool], 3: [bank], 4: CHAPTER_4, 5: CHAPTER_5, 6: CHAPTER_6, 7: CHAPTER_7, 8: CHAPTER_8, 9: CHAPTER_9, 10: CHAPTER_10, 11: CHAPTER_11 };
// Colour words in poems and songs, coloured in the text strip once spoken (COLOR.md rule 6):
// [word, occurrence in the chapter, colour]. "white" (Chapter V) stays paper-white: unreadable as text colour.
const TINTS = {
  2: [['golden', 2, SPOT.gold]],   // "On every golden scale!"
  5: [['grey', 1, SPOT.grey]],     // "as he shook his grey locks"
  10: [['pale', 1, SPOT.pale], ['brown', 1, SPOT.brown], ['green', 1, SPOT.soup]],
};

export const CHAPTERS = TITLES.map((title, i) => {
  const n = i + 1, nn = String(n).padStart(2, '0');
  const ch = { n, roman: ROMAN[i], title, narrated: NARRATED.has(n), audio: `audio/ch${nn}.mp3`, words: `data/ch${nn}_words.json` };
  ch.scenes = STAGED[n] ?? [placeholder(ch)];
  ch.tints = TINTS[n] ?? [];
  return ch;
});
