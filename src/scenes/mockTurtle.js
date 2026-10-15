// Chapter IX, "The Mock Turtle's Story", in three scenes at foot-high Alice's scale:
//   duchessWalk — the croquet-ground (Chapter VIII's set): arm in arm with the Duchess and her
//                 morals and her sharp chin; the Queen "frowning like a thunderstorm"; the game
//                 goes on until every arch is in custody; "You are all pardoned";
//   gryphon     — the Gryphon asleep in the sun; the Queen leaves Alice with it;
//   mockTurtle  — the seashore (src/sets/seashore.js, shared with Chapter X): the Mock Turtle
//                 on his ledge of rock, his history, school in the sea, the lessons.
// Figures and props not yet drawn are placeholders from props9.js (and props8.js).
import * as THREE from 'three';
import { crowdCard } from '../cards.js';
import { paperFlat } from '../stage.js';
import { texture, PAPER } from '../ink.js';
import { card, cardArch, GUESTS, COURTIERS, CHILDREN } from '../props8.js';

import { buildCroquet, FOOT, CROQ, FTREE } from '../sets/croquet.js';
import { buildSeashore, ROCK, LEDGE_AT } from '../sets/seashore.js';
import { drawnPose, extras } from '../crowd.js';
import { thoughts } from '../thoughts.js';
import { smooth, lerp, route, cameraTrack } from '../track.js';
import { outdoors } from './rabbit.js';

const DUCHESS = 0.75;   // the Duchess's scale: "exactly the right height to rest her chin upon Alice's shoulder"
const CARD_H = 0.28, CHILD_H = 0.2, COURT_H = 0.32;
const cardPose = (who, pose, h) => drawnPose(`${who.suit}-${who.rank}-${pose}`, () => card(who, pose), h);

// --- 1. Arm in arm with the Duchess ------------------------------------------------------
export const duchessWalk = {
  id: 'duchessWalk',
  title: 'The Duchess and her morals',
  start: () => 0,
  parts: (cue) => [
    { title: "'Tis love that makes the world go round", t: cue.at('moral', 3) - 6 },
    { title: 'Flamingoes and mustard', t: cue.at('flamingo') - 10 },
    { title: 'Frowning like a thunderstorm', t: cue.at('tremble') - 4 },
    { title: 'All in custody', t: cue.at('quarrelling') - 3 },
  ],
  build({ group, ai, cue }) {
    const at = cue.at;
    const T = {
      pepper: at('pepper', 2), startled: at('startled'), squeezed: at('squeezed'), chin1: at('chin', 1), chin3: at('chin', 3), chin4: at('chin', 4),
      pigs: at('pigs'), tremble: at('tremble'), queen: at('queen', 1), stamping: at('stamping'), gone: at('gone', 1), followed: at('followed', 1),
      resting: at('resting'), hurried: at('hurried', 1), quarrel: at('quarrelling'), noArches: at('arches', 2), breath: at('breath'), walked: at('walked', 2),
      pardoned: at('pardoned'), end: at('gryphon', 1) - 3,
    };
    buildCroquet({ group, ai });
    const think = thoughts(group, [
      { t0: T.pepper - 1, t1: T.startled - 2, art: ai['vignettes/tempers'].tex },
      { t0: T.pigs - 0.5, t1: T.pigs + 3, art: ai['vignettes/pigs_fly'].tex },
    ]);
    // The arches and the players: resting in the shade while the Queen is away; back to the game;
    // taken into custody one by one until only the King, the Queen and Alice are left.
    const ARCHES = [[1.3, -0.6], [2.4, -1.2], [3.1, -0.3], [4.0, -1.1], [4.6, 0.1], [3.0, -1.6]];
    const archTex = ai['ch8/card_arch'].tex;
    const arches = ARCHES.map(([x, z]) => { const a = paperFlat(archTex, 0.2, 0.2 / ai['ch8/card_arch'].aspect); a.position.set(x, 0, z); group.add(a); return a; });
    const players = [...GUESTS, COURTIERS[2], CHILDREN[3]];
    const crowd = extras(group, players.map((who) => {
      const h = who.rank === 'king' || who.rank === 'queen' ? COURT_H : who.suit === 'hearts' ? CHILD_H : CARD_H;
      return { poses: { stand: crowdCard(ai, who, h) }, height: h };
    }));
    const n = players.length;
    const taken = (i) => lerp(T.quarrel + 6, T.breath - 2, i / (n - 1));                       // when each is led away
    // The soldiers who were the arches lead each prisoner away by the arm (AI drawing, 2026-10-14).
    const guards = extras(group, players.map((_, i) => ({ poses: { lead: crowdCard(ai, { suit: 'clubs', rank: 2 + (i % 9), body: 'lead' }, CARD_H) }, height: CARD_H })));
    const guardA = (i) => (t) => {
      if (t < taken(i) - 1.5 || t > taken(i) + 5) return { visible: false };
      const p = playerA(i)(t), from = ARCHES[i % ARCHES.length];
      if (t < taken(i)) { const k = smooth((t - taken(i) + 1.5) / 1.5); return { pose: 'lead', x: lerp(from[0], p.x + 0.14, k), z: lerp(from[1], p.z + 0.02, k), moving: true, phase: t * 2.6, dir: 1 }; }
      return { ...p, pose: 'lead', x: p.x + 0.14, z: p.z + 0.02, dir: 1, visible: true };   // ahead of the prisoner, walking off
    };
    const playerA = (i) => (t) => {
      const game = { x: lerp(CROQ.x0 + 0.6, CROQ.x1 - 0.6, (i + 0.5) / n) + Math.sin(t * 0.2 + i) * 0.25, z: lerp(CROQ.z0 + 0.4, CROQ.z1 - 0.6, ((i * 37) % 10) / 10) };
      const shade = { x: FTREE.x - 0.5 + (i % 3) * 0.2, z: FTREE.z + 0.4 + Math.floor(i / 3) * 0.2 };
      const away = { x: 6.5, z: -1.2 };
      const s = route(t, [[0, game], [T.tremble - 6, game], [T.tremble, shade], [T.hurried, shade], [T.hurried + 3, game], [taken(i), game], [taken(i) + 5, away]], { phase: t * 2.6 });
      return { ...s, pose: 'stand', visible: t < taken(i) + 5 };
    };
    const SPOTQ = { x: 3.55, z: 0.32 };
    const aliceA = (t) => {
      const s = route(t, [
        [0, { x: 2.6, z: 0.3, dir: -1 }], [T.chin1 - 6, { x: 1.6, z: 0.35 }], [T.squeezed + 30, { x: 1.6, z: 0.35 }], [T.chin4 - 2, { x: 3.2, z: 0.4, dir: 1 }],
        [T.followed, { x: 3.2, z: 0.4 }], [T.followed + 5, { x: 2.6, z: -0.05, dir: -1 }], [T.walked, { x: 2.6, z: -0.05 }], [T.end, { x: 1.2, z: 0.3, dir: -1 }],
      ], { phase: t * 2.2 });
      const flinch = (t >= T.startled && t < T.startled + 1) ? Math.sin(t * 30) * 0.04 : 0;
      // AI poses (2026-10-14): arm in arm with the Duchess, a flamingo under her other arm (after plate 9.1);
      // stiff and polite with the sharp chin on her shoulder; following the Queen, timidly.
      let pose = 'stand';
      if (t < T.gone) pose = 'armin'; // (her 'chin' drawing has no flamingo, so it isn't used while she carries one)
      if (t >= T.followed && t < T.followed + 5) pose = 'follow9';
      return { ...s, pose, scale: FOOT, tilt: flinch, dir: s.moving ? s.dir : t >= T.tremble ? 1 : s.dir };
    };
    const duchessA = (t) => {
      // Arm in arm at Alice's side; her chin on Alice's shoulder; trembling; gone in a moment.
      if (t >= T.gone + 2.5) return { visible: false };
      const a = aliceA(t);
      if (t >= T.gone) {
        const k = smooth((t - T.gone) / 2.5);
        return { pose: 'run', x: lerp(a.x - 0.15, 0.2, k), z: lerp(a.z + 0.02, -0.8, k), moving: true, phase: t * 5, dir: -1, scale: DUCHESS };
      }
      const dig = [T.chin1, T.chin3, T.chin4].some((c) => t >= c && t < c + 3);
      const close = t >= T.squeezed ? 0.02 : 0;
      const shake = t >= T.tremble ? Math.sin(t * 40) * 0.03 : 0;
      return { ...a, pose: t >= T.tremble ? 'tremble' : 'stand', x: a.x + (a.dir < 0 ? 0.15 : -0.15) * (1 - close * 10) * (dig ? 0.75 : 1), z: a.z + 0.02, scale: DUCHESS, tilt: (dig ? -0.25 * a.dir : 0) + shake };
    };
    const queenA = (t) => {
      if (t < T.tremble - 3) return { visible: false };
      const s = route(t, [
        [T.tremble - 3, { x: 4.6, z: 0.0, dir: -1 }], [T.queen, SPOTQ], [T.followed, SPOTQ], [T.followed + 5, { x: 2.85, z: -0.2 }],
        [T.quarrel, { x: 2.85, z: -0.2 }], [T.quarrel + 6, { x: 3.8, z: -0.8, dir: 1 }], [T.noArches, { x: 2.2, z: -0.6, dir: -1 }], [T.breath, { x: 2.85, z: -0.2 }],
        [T.walked, { x: 2.85, z: -0.2 }], [T.end, { x: 1.45, z: 0.2, dir: -1 }],
      ], { phase: t * 2.2 });
      const pose = t >= T.stamping - 0.5 && t < T.gone ? 'stamp' : t >= T.quarrel && t < T.breath ? 'point' : t >= T.queen - 0.5 && t < T.stamping ? 'folded' : 'stand';
      return { ...s, pose, dir: s.moving ? s.dir : -1 };
    };
    const kingA = (t) => (t < T.walked - 2 ? { visible: false } : { pose: 'stand', x: 3.4, z: -0.5, dir: -1, idle: t });
    function update(t, cast, camera) {
      crowd.apply(players.map((_, i) => playerA(i)(t)), camera);
      guards.apply(players.map((_, i) => guardA(i)(t)), camera);
      arches.forEach((a, i) => { a.visible = t < taken(i) + 1; });                            // "there were no arches left"
      const a = aliceA(t);
      think(t, { x: a.x + 0.05, y: 0.46, z: a.z - 0.1 }, 0.24);
    }
    const camera = cameraTrack([
      { t: 0, dur: 0, pos: [2.3, 0.3, 1.1], look: [2.5, 0.2, 0.2] },                                    // arm in arm
      { t: 10, dur: 30, pos: [1.6, 0.28, 1.0], look: [1.8, 0.18, 0.3] },
      { t: T.chin1 - 2, dur: 2, pos: [1.82, 0.29, 0.9], look: [1.58, 0.22, 0.33] },                     // the sharp chin
      { t: T.chin1 + 10, dur: 4, pos: [1.7, 0.3, 1.0], look: [1.7, 0.2, 0.3] },
      { t: T.squeezed + 30, dur: T.chin4 - T.squeezed - 32, pos: [3.0, 0.3, 1.1], look: [3.1, 0.2, 0.35] }, // walking on together
      { t: T.tremble - 1, dur: 3, pos: [3.0, 0.32, 1.1], look: [3.4, 0.24, 0.35] },                     // the Queen in front of them
      { t: T.gone, dur: 3, pos: [2.8, 0.45, 1.6], look: [2.6, 0.15, -0.2] },                            // the Duchess flees
      { t: T.resting - 1, dur: 3, pos: [4.3, 0.4, 0.9], look: [FTREE.x - 0.3, 0.15, FTREE.z + 0.5] },   // resting in the shade
      { t: T.quarrel, dur: 4, pos: [2.9, 0.6, 2.0], look: [3.0, 0.1, -0.5] },                           // all in custody
      { t: T.breath - 1, dur: 3, pos: [2.6, 0.3, 0.9], look: [2.75, 0.22, -0.1] },                      // "Have you seen the Mock Turtle yet?"
      { t: T.walked, dur: T.end - T.walked, pos: [1.8, 0.35, 1.2], look: [1.5, 0.2, 0.0] },              // "You are all pardoned"
    ]);
    return {
      T, bg: PAPER, fog: [7, 26], bounds: null, hotspots: [], camera, update,
      actors: (t) => ({ alice: aliceA(t), duchess: duchessA(t), queen: queenA(t), king: kingA(t) }),
    };
  },
};

// --- 2. The Gryphon asleep in the sun ------------------------------------------------------
export const gryphonBank = {
  id: 'gryphon',
  title: 'The Gryphon',
  start: (cue) => cue.at('gryphon', 1) - 3,
  build({ group, ai, cue }) {
    const at = cue.at;
    const start = gryphonBank.start(cue);
    const T = { lazy: at('lazy'), walked: at('walked', 3), rubbed: at('rubbed'), chuckled: at('chuckled'), come: at('come', 3), end: at('distance') - 2 };
    // "a Gryphon, lying fast asleep in the sun": the sunny bank by the sea behind him (AI, after plate 9.2), three
    // copies mirrored; the far treeline left out, as the bank shows the sea beyond.
    outdoors(group, ai, { groundRepeat: 40, far: false });
    for (const [x, z, h, s] of [[-3.0, -0.9, 2.6, 1], [3.2, -1.2, 2.8, -1], [-3.4, 0.4, 2.4, -1]]) { const t = paperFlat(ai.tree.tex, h * ai.tree.aspect, h); t.position.set(x, 0, z); t.scale.x = s; group.add(t); }
    const BK = ai['ch9/bank_sunny'], BH = 0.45, BW = BH * BK.aspect;
    for (const k of [-1, 0, 1]) { const b = paperFlat(BK.tex, BW, BH, { edge: false }); b.position.set(k * BW, 0, -1.2); if (k) b.scale.x = -1; group.add(b); }
    const G = { x: -0.1, z: -0.35 };
    const gryphonA = (t) => {
      const s = route(t, [[start, G], [T.come + 0.5, G], [T.end, { x: -2.2, z: 0.1, dir: -1 }]], { phase: t * 2 });
      // AI poses (2026-10-14): "The Gryphon sat up and rubbed its eyes"; "then it chuckled".
      let pose = s.moving ? 'walk' : t >= T.rubbed - 0.5 ? 'sit' : 'asleep';
      if (!s.moving && t >= T.rubbed - 0.5 && t < T.chuckled - 0.5) pose = 'wake';
      if (!s.moving && t >= T.chuckled - 0.3 && t < T.chuckled + 3) pose = 'chuckle';
      return { ...s, pose, dir: s.moving ? -1 : 1 };
    };
    const aliceA = (t) => {
      const s = route(t, [[start, { x: 1.4, z: 0.3, dir: -1 }], [T.lazy - 1, { x: 0.45, z: 0.05 }], [T.come + 1.2, { x: 0.45, z: 0.05 }], [T.end, { x: -1.7, z: 0.2, dir: -1 }]], { phase: t * 2.2 });
      return { ...s, pose: 'stand', scale: FOOT, dir: s.moving ? s.dir : -1 };
    };
    const queenA = (t) => {
      const s = route(t, [[start, { x: 1.65, z: 0.2, dir: -1 }], [T.lazy - 1, { x: 0.7, z: -0.05 }], [T.walked, { x: 0.7, z: -0.05 }], [T.walked + 6, { x: 2.4, z: 0.4, dir: 1 }]], { phase: t * 2.2 });
      return { ...s, pose: t >= T.lazy && t < T.lazy + 2.5 ? 'point' : 'stand', visible: t < T.walked + 6 };
    };
    const camera = cameraTrack([
      { t: start, dur: 0, pos: [0.9, 0.35, 1.3], look: [0.2, 0.15, -0.3] },
      { t: T.lazy - 1, dur: 3, pos: [0.5, 0.3, 0.9], look: [0.0, 0.12, -0.35] },                   // a Gryphon, lying fast asleep in the sun
      { t: T.walked + 3, dur: 4, pos: [0.35, 0.27, 0.8], look: [0.1, 0.18, -0.25] },               // left alone with the Gryphon
      { t: T.come, dur: T.end - T.come, pos: [-1.2, 0.3, 1.1], look: [-1.6, 0.18, 0.1] },          // "Come on!"
    ]);
    return { T, bg: PAPER, fog: [7, 24], bounds: null, hotspots: [], camera, actors: (t) => ({ alice: aliceA(t), gryphon: gryphonA(t), queen: queenA(t) }) };
  },
};

// --- 3. The Mock Turtle on his rock ----------------------------------------------------------
export const mockTurtleRock = {
  id: 'mockTurtle',
  title: 'The Mock Turtle',
  start: (cue) => cue.at('distance') - 2,
  parts: (cue) => [
    { title: 'Once I was a real Turtle', t: cue.at('real') - 4 },
    { title: 'School in the sea', t: cue.at('school', 1) - 4 },
    { title: 'Reeling and Writhing', t: cue.at('reeling') - 3 },
    { title: 'Lessons', t: cue.at('lessons', 1) - 3 },
  ],
  build({ group, ai, cue }) {
    const at = cue.at;
    const start = mockTurtleRock.start(cue);
    const T = {
      nearer: at('nearer'), tears: at('tears'), sat: at('sat', 2), real: at('real'), hjckrrh: at('hjckrrh'), sobbing2: at('sobbing', 2), school: at('school', 1),
      dull: at('dull'), sink: at('sink'), drive: at('drive'), paws: at('paws', 1), flappers: at('flappers'), conger: at('conger-eel'), crab: at('crab'),
      faces: at('faces'), sigh: at('turtle', 19), games: at('games', 2),
    };
    buildSeashore({ group, ai });
    const think = thoughts(group, [
      { t0: T.school - 0.5, t1: T.dull - 1, art: ai['vignettes/sea_school'].tex },
      { t0: T.conger - 1, t1: T.crab + 8, art: ai['vignettes/masters'].tex },
    ]);
    const ASEAT = { x: LEDGE_AT.x - 0.32, z: ROCK.z + 0.42 }, GSEAT = { x: LEDGE_AT.x - 0.62, z: ROCK.z + 0.25 };
    const aliceA = (t) => {
      const s = route(t, [[start, { x: -2.4, z: 0.35, dir: 1 }], [T.tears - 1, { x: ASEAT.x - 0.05, z: ASEAT.z }], [T.sat - 0.5, ASEAT]], { phase: t * 2.2 });
      const seated = t >= T.sat;
      const sinking = t >= T.sink && t < T.drive + 1 ? smooth((t - T.sink) / 1) * 0.12 : 0; // "ready to sink into the earth"
      // Sitting on the sand listening (after plate 9.3); shrinking, embarrassed, "ready to sink into the earth".
      const pose = !seated ? 'stand' : sinking > 0 ? 'sink' : 'shore';
      return { ...s, pose, scale: FOOT, sink: sinking * 0.3, dir: seated ? 1 : s.dir };
    };
    const gryphonA = (t) => {
      const s = route(t, [[start, { x: -2.1, z: 0.15, dir: 1 }], [T.tears - 1.5, { x: GSEAT.x - 0.05, z: GSEAT.z }], [T.sat - 0.5, GSEAT]], { phase: t * 2 });
      let pose = s.moving ? 'walk' : 'sit';
      if (t >= T.paws && t < T.paws + 4) pose = 'paws';                          // "lifted up both its paws in surprise"
      if (t >= T.faces - 0.5 && t < T.faces + 5) pose = 'hide';                  // "hid their faces in their paws"
      // "an occasional exclamation of 'Hjckrrh!'"
      const hj = t >= T.hjckrrh - 0.3 && t < T.sobbing2 && ((t - T.hjckrrh) % 9 + 9) % 9 < 0.6 ? 0.08 : 0;
      return { ...s, pose, tilt: hj, dir: 1 };
    };
    const turtleA = (t) => {
      let pose = 'sit';
      if ((t >= T.real && t < T.sobbing2 + 4) || (t >= T.sigh - 1 && t < T.sigh + 3)) pose = 'sob';  // "the constant heavy sobbing"
      if (t >= T.flappers - 0.5 && t < T.conger + 6) pose = 'count';                                   // "counting off the subjects on his flappers"
      if (t >= T.faces - 0.5 && t < T.faces + 5) pose = 'hide';
      const heave = pose === 'sob' ? Math.abs(Math.sin(t * 3)) * 0.01 : Math.sin(t * 0.8) * 0.003;
      return { pose, x: LEDGE_AT.x, z: LEDGE_AT.z, y: LEDGE_AT.y - 0.01 + heave, dir: -1 };
    };
    function update(t) {
      const a = aliceA(t);
      think(t, { x: a.x - 0.05, y: 0.5, z: a.z }, 0.26);
    }
    const L = [LEDGE_AT.x, LEDGE_AT.y + 0.12, LEDGE_AT.z];
    const mid = [(ASEAT.x + LEDGE_AT.x) / 2 - 0.1, 0.2, ROCK.z + 0.2];
    const camera = cameraTrack([
      { t: start, dur: 0, pos: [-3.5, 0.5, 1.9], look: [-0.8, 0.1, -0.4] },                          // the Mock Turtle in the distance, Alice and the Gryphon walking to him
      { t: start + 18, dur: T.tears - start - 18, pos: [-0.5, 0.3, 1.1], look: [ROCK.x - 0.1, 0.25, ROCK.z] },
      { t: T.tears - 1, dur: 2, pos: [0.15, 0.36, 0.25], look: L },                                  // large eyes full of tears
      { t: T.tears + 8, dur: 3, pos: [-0.3, 0.3, 1.0], look: mid },                                  // Alice and the Gryphon with him (Alice in frame every ~10 s)
      { t: T.sat, dur: 3, pos: [-0.3, 0.3, 1.0], look: mid },                                        // they sat down
      { t: T.real - 1, dur: 2, pos: [0.1, 0.36, 0.3], look: L },                                     // "Once I was a real Turtle"
      { t: T.hjckrrh - 1, dur: 3, pos: [-0.3, 0.3, 1.0], look: mid },
      { t: T.dull - 1, dur: 2, pos: [ASEAT.x + 0.15, 0.2, ASEAT.z + 0.45], look: [ASEAT.x, 0.12, ASEAT.z] }, // poor Alice
      { t: T.drive, dur: 3, pos: [-0.3, 0.3, 1.0], look: mid },
      { t: T.paws - 1, dur: 2, pos: [GSEAT.x + 0.1, 0.3, GSEAT.z + 0.8], look: [GSEAT.x + 0.1, 0.2, GSEAT.z] }, // "Never heard of uglifying!"
      { t: T.flappers - 1, dur: 2, pos: [0.1, 0.36, 0.3], look: L },                                 // counting off on his flappers
      { t: T.flappers + 9, dur: 3, pos: [-0.3, 0.3, 1.0], look: mid },
      { t: T.flappers + 20, dur: 3, pos: [0.1, 0.36, 0.3], look: L },
      { t: T.crab, dur: 3, pos: [-0.3, 0.3, 1.0], look: mid },
      { t: T.faces - 1, dur: 3, pos: [-0.15, 0.32, 0.8], look: [LEDGE_AT.x - 0.3, 0.22, ROCK.z + 0.1] }, // both hid their faces
      { t: T.games - 8, dur: 6, pos: [-0.6, 0.4, 1.4], look: mid },
    ]);
    return {
      T, bg: PAPER, fog: [7, 26], bounds: { minX: -2.5, maxX: 2.5, minZ: 0.6, maxZ: 3.0 },
      hotspots: [{ pos: new THREE.Vector3(LEDGE_AT.x, LEDGE_AT.y, ROCK.z), title: 'The little ledge of rock', text: 'the Mock Turtle in the distance, sitting sad and lonely on a little ledge of rock' }],
      camera, update, actors: (t) => ({ alice: aliceA(t), gryphon: gryphonA(t), mockTurtle: turtleA(t) }),
    };
  },
};

export const CHAPTER_9 = [duchessWalk, gryphonBank, mockTurtleRock];
