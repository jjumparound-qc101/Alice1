// The book: every chapter, its narration and text timings, and its staged scenes.
// A chapter is readable once its narration is aligned (`narrated`): its audio is
// public/audio/chNN.mp3 and its word timings public/data/chNN_words.json (tools/align.py).
// Until its scenes are built, a chapter plays on a placeholder title page.
import { CHAPTER_1 } from './scenes/index.js';
import { placeholder } from './scenes/placeholder.js';
import { pool } from './scenes/pool.js';
import { bank } from './scenes/bank.js';
import { CHAPTER_4 } from './scenes/rabbit.js';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const TITLES = [
  'Down the Rabbit-Hole', 'The Pool of Tears', 'A Caucus-Race and a Long Tale', 'The Rabbit Sends in a Little Bill',
  'Advice from a Caterpillar', 'Pig and Pepper', 'A Mad Tea-Party', 'The Queen’s Croquet-Ground',
  'The Mock Turtle’s Story', 'The Lobster Quadrille', 'Who Stole the Tarts?', 'Alice’s Evidence',
];
const NARRATED = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]); // every chapter's narration is aligned
const STAGED = { 1: CHAPTER_1, 2: [pool], 3: [bank], 4: CHAPTER_4 };

export const CHAPTERS = TITLES.map((title, i) => {
  const n = i + 1, nn = String(n).padStart(2, '0');
  const ch = { n, roman: ROMAN[i], title, narrated: NARRATED.has(n), audio: `audio/ch${nn}.mp3`, words: `data/ch${nn}_words.json` };
  ch.scenes = STAGED[n] ?? [placeholder(ch)];
  return ch;
});
