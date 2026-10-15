// The book's settings for the shared engine (engine/docs/ENGINE.md, "startBook").
import { CHAPTERS } from './chapters.js';

// The AI master drawings shared by every chapter, by name under public/art/ai/ (.webp). Add each
// name as its drawing arrives (PROVENANCE.md).
const AI_ART = [];

export const BOOK = {
  chapters: CHAPTERS,
  storage: { place: '{{key}}.place.v1', speed: '{{key}}.speed.v1' },
  lead: '{{lead}}', // the cast member the camera keeps in the picture
  async loadArt(loadTexture) {
    const tex = await Promise.all(AI_ART.map((n) => loadTexture(`art/ai/${n}.webp`)));
    return { ai: Object.fromEntries(AI_ART.map((n, i) => [n, tex[i]])) };
  },
  // The puppets shared by every chapter, e.g. { {{lead}}: new Puppet({ stand: art('{{lead}}/stand', 1.7) }, 1.7) }.
  cast: () => ({}),
};
