// Chapter I, in order. Each scene owns a set and stages its actors and camera
// from cue words in the narration (see src/cues.js).
import { riverbank } from './riverbank.js';
import { shaft } from './shaft.js';
import { passage } from './passage.js';
import { hall } from './hall.js';

export const CHAPTER_1 = [riverbank, shaft, passage, hall];
