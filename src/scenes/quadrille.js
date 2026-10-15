// Chapter X, "The Lobster Quadrille", in one scene on the seashore (src/sets/seashore.js, from
// Chapter IX), at foot-high Alice's scale: the Gryphon thumps the sobbing Mock Turtle; the
// quadrille described, capering wildly; danced solemnly round and round Alice while the Mock
// Turtle sings; whitings and porpoises; Alice's adventures; "'Tis the voice of the Lobster";
// "Beautiful Soup"; "The trial's beginning!" and the Gryphon hurries Alice off by the hand.
// The Mock Turtle and the Gryphon are Chapter IX's placeholders; vignettes from props10.js.
import * as THREE from 'three';
import { PAPER } from '../ink.js';
import { lobstersSeaVignette, whitingSnailVignette, whitingsVignette, lobsterGlassVignette, owlPantherVignette, soupVignette } from '../props10.js';
import { FOOT } from '../sets/croquet.js';
import { buildSeashore, ROCK, LEDGE_AT } from '../sets/seashore.js';
import { thoughts } from '../thoughts.js';
import { smooth, lerp, route, cameraTrack } from '../track.js';

export const quadrille = {
  id: 'quadrille',
  title: 'The Lobster Quadrille',
  start: () => 0,
  parts: (cue) => [
    { title: 'A Lobster Quadrille', t: cue.at('quadrille', 1) - 8 },
    { title: 'Will you walk a little faster?', t: cue.at('solemnly', 1) - 2 },
    { title: 'Whitings, boots and shoes', t: cue.at('whiting', 3) - 3 },
    { title: "'Tis the voice of the Lobster", t: cue.at('stand') - 3 },
    { title: 'Beautiful Soup', t: cue.at('soup', 1) - 6 },
    { title: "The trial's beginning!", t: cue.at('chorus') - 1 },
  ],
  build({ group, ai, cue }) {
    const at = cue.at;
    const T = {
      shaking: at('shaking'), quadrille: at('quadrille', 1), lobsters: at('lobsters', 2), bound: at('bound'), somersault: at('somersault'), capering: at('capering'),
      sadly: at('sadly', 1), try: at('try', 1), solemnly: at('solemnly', 1), toes: at('toes', 1), whiting: at('whiting', 1), songEnd: at('interesting', 1) - 1,
      whiting3: at('whiting', 3), yawned: at('yawned'), interesting2: at('interesting', 2), close: at('close', 3), stand: at('stand'), got: at('got', 5),
      lobster: at('lobster', 5), face: at('face'), garden: at('garden', 2), owl: at('owl', 1), leave: at('leave'), sighed: at('sighed', 2), soup: at('beautiful', 1),
      soupEnd: at('beautiful', 10), chorus: at('chorus'), hand: at('hand'), breeze: at('breeze'), telling: at('telling'),
    };
    const end = cue.end;
    buildSeashore({ group, ai });
    const think = thoughts(group, [
      { t0: T.lobsters - 0.5, t1: T.capering + 4, art: lobstersSeaVignette() },
      { t0: T.whiting - 1, t1: T.whiting + 40, art: whitingSnailVignette() },
      { t0: T.whiting3 + 22, t1: T.interesting2, art: whitingsVignette() },
      { t0: T.lobster - 1, t1: T.lobster + 14, art: lobsterGlassVignette() },
      { t0: T.owl - 1.5, t1: T.owl + 18, art: owlPantherVignette() },
      { t0: T.soup - 1, t1: T.soup + 40, art: soupVignette() },
    ]);
    // Where everyone is: as Chapter IX left them, then on the open sand for the dance.
    const ASEAT = { x: LEDGE_AT.x - 0.32, z: ROCK.z + 0.42 }, GSEAT = { x: LEDGE_AT.x - 0.62, z: ROCK.z + 0.25 };
    const MSAND = { x: LEDGE_AT.x - 0.12, z: ROCK.z + 0.3 };
    const D = { x: -0.35, z: 0.05 };                                  // Alice, in the middle of the dance
    const L = { x: D.x - 0.2, z: D.z - 0.06 }, R = { x: D.x + 0.2, z: D.z - 0.06 }; // one on each side of her afterwards
    const dancing = (t) => t >= T.solemnly && t < T.songEnd;
    const round = (t, phase) => { const a = (t - T.solemnly) * 0.25 + phase; return { x: D.x + Math.cos(a) * 0.3, z: D.z + Math.sin(a) * 0.16 - 0.02, dir: -Math.sin(a) > 0 ? 1 : -1 }; };
    const sitting = (t) => (t >= T.sadly - 1 && t < T.try + 2) || (t >= T.songEnd + 3 && t < T.stand) || (t >= T.face - 0.5 && t < T.garden - 4) || (t >= T.leave + 1 && t < T.hand);
    const aliceA = (t) => {
      if (t < T.try + 2) return { pose: 'shore', x: ASEAT.x, z: ASEAT.z, scale: FOOT, dir: 1 };
      const s = route(t, [[T.try + 2, ASEAT], [T.solemnly - 1, D], [T.hand, D], [T.hand + 1.2, { x: D.x - 0.2, z: D.z + 0.05, dir: -1 }], [T.breeze + 2, { x: -3.2, z: 0.4, dir: -1 }]], { phase: t * 2.6 });
      const trodden = t >= T.toes && t < T.toes + 1 ? Math.sin(t * 30) * 0.05 : 0;       // "treading on her toes"
      const seated = !s.moving && sitting(t) && t >= T.songEnd;
      // AI poses (2026-10-14): standing still while they dance round her; sitting on the sand; telling her adventures;
      // standing to repeat "'Tis the voice of the Lobster"; her face in her hands; pulled along by the hand.
      let pose = seated ? 'shore' : 'stand';
      if (dancing(t) && !s.moving) pose = 'dance10';
      if (seated && t >= T.telling && t < T.stand) pose = 'tell';
      if (!s.moving && t >= T.stand + 1 && t < T.face - 0.5) pose = 'recite10';
      if (seated && t >= T.face - 0.5 && t < T.garden - 4) pose = 'face';
      if (s.moving && t >= T.hand) pose = 'run10';
      return { ...s, pose, scale: FOOT, tilt: trodden, dir: s.moving ? s.dir : 1, visible: t < T.breeze + 2 };
    };
    const gryphonA = (t) => {
      if (dancing(t)) return { ...round(t, 0), pose: 'dance', moving: true, phase: t * 1.2, y: Math.abs(Math.sin(t * 2.4)) * 0.01 };
      if (t >= T.hand) {
        const s = route(t, [[T.hand, R], [T.hand + 1.2, { x: D.x - 0.05, z: D.z + 0.02, dir: -1 }], [T.breeze + 2, { x: -3.0, z: 0.35, dir: -1 }]], { phase: t * 2.4 });
        return { ...s, pose: s.moving ? 'run' : 'walk', visible: t < T.breeze + 2 }; // hurrying off, pulling her by the hand
      }
      // Thumping the Mock Turtle on the back; leaping about as they describe the dance.
      const s = route(t, [[0, GSEAT], [T.shaking - 1, { x: LEDGE_AT.x - 0.3, z: LEDGE_AT.z + 0.08 }], [T.shaking + 4, { x: LEDGE_AT.x - 0.3, z: LEDGE_AT.z + 0.08 }],
        [T.shaking + 6, GSEAT], [T.lobsters, GSEAT], [T.lobsters + 1.5, { x: GSEAT.x - 0.25, z: GSEAT.z + 0.35 }], [T.capering + 6, { x: GSEAT.x + 0.15, z: GSEAT.z + 0.4 }],
        [T.sadly, GSEAT], [T.solemnly - 1, round(T.solemnly, 0)], [T.songEnd, round(T.songEnd, 0)], [T.songEnd + 3, R]], { phase: t * 2 });
      const thumping = t >= T.shaking && t < T.shaking + 4 && !s.moving; // "shaking him and punching him in the back"
      const leap = t >= T.bound && t < T.bound + 0.8 ? Math.sin((t - T.bound) / 0.8 * Math.PI) * 0.12 : t >= T.lobsters && t < T.capering + 6 ? Math.abs(Math.sin(t * 5)) * 0.03 : 0;
      let pose = s.moving ? 'walk' : 'sit';
      if (t >= T.lobsters && t < T.capering + 6) pose = 'dance';
      if (t >= T.bound && t < T.bound + 0.8) pose = 'bound';                      // "leaping into the air with a bound"
      if (t >= T.songEnd + 3 && t < T.hand) pose = 'sit';
      if (thumping) pose = 'thump';
      return { ...s, pose, y: leap, tilt: thumping ? Math.sin(t * 14) * 0.04 : 0, dir: thumping ? 1 : t >= T.songEnd + 3 ? -1 : s.dir };
    };
    const turtleA = (t) => {
      if (dancing(t)) return { ...round(t, Math.PI), pose: 'walk', moving: true, phase: t * 1.2, y: Math.abs(Math.sin(t * 2.4 + 1)) * 0.01 };
      if (t < T.quadrille) {
        const shake = t >= T.shaking && t < T.shaking + 4 ? Math.sin(t * 22) * 0.008 : 0;
        return { pose: 'sob', x: LEDGE_AT.x + shake, z: LEDGE_AT.z, y: LEDGE_AT.y - 0.01, dir: -1 };
      }
      // Down from the ledge to tell of the dance; capering wildly; sitting down sadly.
      const s = route(t, [[T.quadrille, { x: LEDGE_AT.x, z: LEDGE_AT.z + 0.04 }], [T.quadrille + 2, MSAND], [T.somersault, MSAND], [T.somersault + 1.5, { x: MSAND.x - 0.2, z: MSAND.z + 0.4 }],
        [T.capering + 5, { x: MSAND.x - 0.45, z: MSAND.z + 0.3 }], [T.sadly, MSAND], [T.solemnly - 1, round(T.solemnly, Math.PI)], [T.songEnd, round(T.songEnd, Math.PI)], [T.songEnd + 3, L]], { phase: t * 2 });
      const down = t < T.quadrille + 2 ? LEDGE_AT.y * (1 - smooth((t - T.quadrille) / 2)) : 0;
      const caper = t >= T.somersault && t < T.capering + 5 ? Math.abs(Math.sin(t * 6)) * 0.05 : 0;
      let pose = s.moving || (t >= T.somersault && t < T.capering + 5) ? 'walk' : 'sit'; // 'walk' is the dancing drawing
      if (t >= T.yawned && t < T.yawned + 3) pose = 'yawn';
      if (t >= T.sighed && t < T.chorus + 2) pose = 'sing';                       // singing, "choked with sobs"
      if (t >= T.chorus + 2) pose = 'sob';
      return { ...s, pose, y: down + caper, dir: t >= T.songEnd + 3 ? 1 : s.dir };
    };
    function update(t) {
      // Behind the three of them, low enough to stay in the close shots.
      const near = t < T.try + 2 ? ASEAT : D;
      think(t, { x: near.x + 0.02, y: 0.34, z: near.z - 0.4 }, 0.26);
    }
    const LG = [LEDGE_AT.x, LEDGE_AT.y + 0.1, LEDGE_AT.z];
    const mid = [(ASEAT.x + LEDGE_AT.x) / 2 - 0.15, 0.2, ROCK.z + 0.25];
    const DC = [D.x, 0.14, D.z - 0.05];
    const camera = cameraTrack([
      { t: 0, dur: 0, pos: [0.1, 0.36, 0.3], look: LG },                                                // sobs choked his voice
      { t: 9, dur: 3, pos: [-0.2, 0.32, 0.8], look: mid },                                              // Alice listening
      { t: T.shaking - 1, dur: 2, pos: [-0.2, 0.32, 0.8], look: mid },                                  // shaking him and punching him in the back
      { t: T.quadrille + 2, dur: 4, pos: [-0.4, 0.35, 1.1], look: [0.0, 0.16, -0.35] },                 // a Lobster Quadrille
      { t: T.lobsters - 1, dur: 2, pos: [-0.5, 0.38, 1.3], look: [-0.1, 0.16, -0.2] },                  // capering wildly
      { t: T.try, dur: 4, pos: [-0.35, 0.36, 1.1], look: DC },
      { t: T.solemnly, dur: 6, pos: [-0.35, 0.42, 0.95], look: DC },                                   // round and round Alice
      { t: T.whiting + 10, dur: 40, pos: [-0.75, 0.32, 0.75], look: DC },
      { t: T.whiting + 60, dur: 40, pos: [0.05, 0.32, 0.75], look: DC },
      { t: T.songEnd + 2, dur: 4, pos: [-0.35, 0.3, 0.75], look: DC },                                  // whitings, boots and shoes
      { t: T.close, dur: 4, pos: [-0.35, 0.24, 0.5], look: [D.x, 0.12, D.z] },                          // so close to her, one on each side
      { t: T.stand, dur: 3, pos: [-0.3, 0.26, 0.6], look: [D.x, 0.16, D.z] },                           // "Stand up and repeat"
      { t: T.leave, dur: 4, pos: [-0.35, 0.3, 0.75], look: DC },
      { t: T.sighed, dur: 4, pos: [-0.2, 0.22, 0.45], look: [L.x, 0.14, L.z] },                         // Beautiful Soup
      { t: T.chorus, dur: 2, pos: [-0.35, 0.34, 0.9], look: DC },                                       // "The trial's beginning!"
      { t: T.hand + 2, dur: Math.max(2, end - T.hand - 2), pos: [-0.1, 0.25, 0.6], look: [L.x, 0.14, L.z] }, // the melancholy words, more and more faintly
    ]);
    return {
      T, bg: PAPER, fog: [7, 26], bounds: { minX: -2.5, maxX: 2.5, minZ: 0.6, maxZ: 3.0 },
      hotspots: [{ pos: new THREE.Vector3(D.x, 0.1, D.z), title: 'The Lobster Quadrille', text: 'they began solemnly dancing round and round Alice, every now and then treading on her toes' }],
      camera, update, actors: (t) => ({ alice: aliceA(t), gryphon: gryphonA(t), mockTurtle: turtleA(t) }),
    };
  },
};

export const CHAPTER_10 = [quadrille];
