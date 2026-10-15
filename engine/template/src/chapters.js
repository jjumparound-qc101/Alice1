// The book's chapters, each with its narration, text timings and staged scenes.
// A chapter is readable once its narration is aligned (`narrated`): its audio is public/audio/chNN.mp3
// and its word timings public/data/chNN_words.json (engine/tools/narration.py, then forced_align.py).
// Until its scenes are built, a chapter plays on its title page.
import { placeholder } from '@engine/scenes/placeholder.js';

const LABEL = 'Chapter'; // what the book calls its chapters
const ROMAN = ['I', 'II', 'III'];
const TITLES = ['{{Chapter one}}', '{{Chapter two}}', '{{Chapter three}}'];
const NARRATED = new Set([]); // filled in as each chapter's narration is aligned
const STAGED = {};
// A picture (a name in the shared art) beside a chapter's title page while its scenes are drawn.
const PLATES = {};
// Colour words in songs and verses, coloured in the text strip once spoken: [word, occurrence, colour].
const TINTS = {};
// A picture on a chapter's end card under its last line.
const TAILPIECES = {};

export const CHAPTERS = TITLES.map((title, i) => {
  const n = i + 1, nn = String(n).padStart(2, '0');
  const ch = { n, label: LABEL, roman: ROMAN[i], title, narrated: NARRATED.has(n), audio: `audio/ch${nn}.mp3`, words: `data/ch${nn}_words.json`, plate: PLATES[n] };
  ch.scenes = STAGED[n] ?? [placeholder(ch)];
  ch.tints = TINTS[n] ?? [];
  ch.tailpiece = TAILPIECES[n] ?? null;
  return ch;
});
