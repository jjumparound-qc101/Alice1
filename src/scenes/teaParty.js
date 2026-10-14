// Chapter VII, "A Mad Tea-Party", in three scenes:
//   teaParty — the long table under the tree in front of the March Hare's house: the Hatter,
//              the March Hare and the sleeping Dormouse; the riddle, the watch, Time, the
//              treacle-well, moving one place on; Alice walks off; the Dormouse into the
//              teapot; the tree with a door in it;
//   hallAgain — the long hall once more: the golden key, the little door, a foot high;
//   garden   — "she found herself at last in the beautiful garden".
// Figures and props not yet drawn are placeholders from props7.js.
import * as THREE from 'three';
import { paperFlat } from '../stage.js';
import { texture, INK, PAPER } from '../ink.js';
import { garden as gardenPicture } from '../props.js';
import { tableCloth, cup, teapot, armchair, dayWatch, treeDoor, flowerBed, ravenVignette, concertVignette, batVignette, treacleVignette } from '../props7.js';
import { buildHall, TABLE, DOOR, KEY } from '../sets/hall.js';
import { thoughts } from '../thoughts.js';
import { carry } from '../puppet.js';
import { smooth, lerp, route, cameraTrack } from '../track.js';
import { outdoors } from './rabbit.js';

const TWO_FEET = 0.4;                       // Alice is about two feet high (Chapter VI's end)
const TBL = { x0: -1.2, x1: 1.2, z: -0.4, d: 0.5, h: 0.24 };
// Seats along the far side of the table (x), for moving one place on.
const SEATS = [0.55, 0.3, 0.05, -0.2, -0.45, -0.7];
const SEATED_Y = TBL.h - 0.07;               // waist-up drawings: the waist sits just below the table top

// --- 1. The tea-party ------------------------------------------------------------------
export const teaParty = {
  id: 'teaParty',
  title: 'No room!',
  start: () => 0,
  parts: (cue) => [
    { title: 'Why is a raven like a writing-desk?', t: cue.at('raven') - 3 },
    { title: 'The best butter', t: cue.at('month') - 3 },
    { title: 'Time', t: cue.at('time', 4) - 4 },
    { title: 'Twinkle, twinkle', t: cue.at('concert') - 3 },
    { title: 'The treacle-well', t: cue.at('story') - 4 },
    { title: 'One place on', t: cue.at('move') - 2 },
    { title: 'The stupidest tea-party', t: cue.at('disgust') - 3 },
  ],
  build({ group, ai, cue }) {
    const at = cue.at;
    const T = {
      room: at('room', 1), sat: at('sat', 1), hair: at('hair'), raven: at('raven'), month: at('month'), watch: at('watch', 1), dipped: at('dipped'),
      poured: at('poured'), concert: at('concert'), twinkle: at('twinkle', 1), pinch: at('pinch'), queen: at('queen', 2), wake: at('wake'),
      sisters: at('sisters'), treacle: at('treacle', 1), move: at('move'), milk: at('milk-jug'), pinched: at('pinched', 2), disgust: at('disgust'),
      teapot: at('teapot'), stupidest: at('stupidest'), door: at('door', 1), end: at('hall') - 1.5,
    };
    outdoors(group, ai, { groundRepeat: 40 });
    for (const [x, z, h, s] of [[-2.6, -1.8, 3.4, 1], [2.8, -2.2, 3.6, -1], [0.4, -2.6, 3.8, 1], [-4.5, -0.5, 3.4, -1]]) {
      const t = paperFlat(ai.tree.tex, h * ai.tree.aspect, h); t.position.set(x, 0, z); t.scale.x = s; group.add(t);
    }
    const house = paperFlat(ai['ch6/march_hare_house'].tex, 2.0, 2.0 / ai['ch6/march_hare_house'].aspect); house.position.set(1.6, 0, -3.4); group.add(house);
    // The long table: a white top and a hanging cloth in front (the far side is open; people sit behind).
    const topGeo = new THREE.BoxGeometry(TBL.x1 - TBL.x0, 0.015, TBL.d);
    const top = new THREE.Mesh(topGeo, new THREE.MeshBasicMaterial({ color: '#f6f2e8' }));
    top.add(new THREE.LineSegments(new THREE.EdgesGeometry(topGeo), new THREE.LineBasicMaterial({ color: INK })));
    top.position.set((TBL.x0 + TBL.x1) / 2, TBL.h, TBL.z); group.add(top);
    const cloth = paperFlat(texture(tableCloth()), TBL.x1 - TBL.x0, TBL.h); cloth.position.set((TBL.x0 + TBL.x1) / 2, 0, TBL.z + TBL.d / 2 + 0.003); group.add(cloth);
    // "it's laid for a great many more than three"
    const cupTex = texture(cup());
    for (let i = 0; i < 14; i++) { const c = paperFlat(cupTex, 0.06, 0.04); c.position.set(lerp(TBL.x0 + 0.1, TBL.x1 - 0.1, i / 13), TBL.h + 0.008, TBL.z + (i % 2 ? 0.1 : -0.1)); group.add(c); }
    const pot = paperFlat(texture(teapot()), 0.14, 0.11); pot.position.set(SEATS[2] - 0.02, TBL.h + 0.008, TBL.z + 0.02); group.add(pot);
    const chair = paperFlat(texture(armchair()), 0.32, 0.38); chair.position.set(TBL.x0 - 0.14, 0, TBL.z + 0.08); chair.rotation.y = 0.9; group.add(chair);
    const watch = paperFlat(texture(dayWatch()), 0.04, 0.045, { anchor: 'center' }); group.add(watch);
    const dA = ai['ch7/dormouse_sleep'], dB = ai['ch7/dormouse_talk']; const dor = paperFlat(dA.tex, 0.11, 0.11 / dA.aspect); const dorTalk = paperFlat(dB.tex, 0.11, 0.11 / dB.aspect); // AI (tools/ch7_art.py) group.add(dor, dorTalk);
    const tree = paperFlat(texture(treeDoor()), 0.5, 1.12); tree.position.set(-3.6, 0, 0.2); group.add(tree);
    const think = thoughts(group, [
      { t0: T.raven - 0.5, t1: T.raven + 12, art: ravenVignette() },
      { t0: T.concert - 1, t1: T.twinkle, art: concertVignette() },
      { t0: T.twinkle, t1: T.pinch + 2, art: batVignette() },
      { t0: T.sisters - 1, t1: T.treacle + 10, art: treacleVignette() },
    ]);

    // Who sits where: the Hatter, the Dormouse and the March Hare crowded at one corner;
    // after "let's all move one place on", each moves along one seat.
    const seat = (who, t) => {
      const before = { hatter: 1, dormouse: 2, hare: 3 }[who];
      const k = smooth((t - T.move - 1) / 2.5);
      return lerp(SEATS[before], SEATS[before - 1], k);
    };
    const hatterA = (t) => ({ pose: t >= T.raven - 1 && t < T.raven + 3 ? 'riddle' : t >= T.watch && t < T.dipped ? 'watch' : 'stare', x: seat('hatter', t), z: TBL.z - 0.14, y: SEATED_Y, dir: -1 });
    const hareA = (t) => ({ pose: t >= T.dipped && t < T.dipped + 6 ? 'dip' : 'sit', x: seat('hare', t), z: TBL.z - 0.14, y: SEATED_Y, dir: -1 });
    const ARMCHAIR = { x: TBL.x0 - 0.12, z: TBL.z + 0.06 };
    const aliceA = (t) => {
      // To the arm-chair; along to the March Hare's old place; up in disgust and off into the wood.
      const s = route(t, [
        [0, { x: -2.6, z: 0.9, dir: 1 }], [T.sat - 0.5, ARMCHAIR], [T.move + 1, ARMCHAIR],
        [T.move + 5, { x: SEATS[3] - 0.08, z: TBL.z + TBL.d / 2 + 0.12 }],
        [T.disgust, { x: SEATS[3] - 0.08, z: TBL.z + TBL.d / 2 + 0.12 }], [T.stupidest, { x: -3.3, z: 0.5, dir: -1 }], [T.door + 3, { x: -3.6, z: 0.22 }],
      ], { phase: t * 2.2 });
      const seated = (t >= T.sat && t < T.move + 1) || (t >= T.move + 5 && t < T.disgust);
      const lookBack = t >= T.disgust + 2 && t < T.teapot + 1 ? 1 : s.dir; // "she looked back once or twice"
      return { ...s, pose: seated ? 'sit' : 'stand', scale: TWO_FEET, dir: seated ? 1 : lookBack, visible: t < T.door + 3 };
    };
    function update(t, cast) {
      // The Dormouse: asleep between them as a cushion; awake for the story; into the teapot at last.
      const dx = seat('dormouse', t);
      const awake = t >= T.wake + 3 && t < T.disgust;
      const intoPot = smooth((t - T.teapot + 2.5) / 2.5);
      dor.visible = !awake; dorTalk.visible = awake;
      const jig = (t >= T.pinch && t < T.pinch + 1.5) || (t >= T.wake && t < T.wake + 1) || (t >= T.pinched && t < T.pinched + 1) ? Math.sin(t * 40) * 0.01 : 0;
      for (const d of [dor, dorTalk]) d.position.set(lerp(dx, SEATS[2] - 0.02, intoPot) + jig, TBL.h + 0.008 + intoPot * 0.06 - smooth((t - T.teapot) / 1.5) * 0.08, TBL.z - 0.02);
      dor.visible = dor.visible && t < T.teapot + 1.5;
      pot.position.x = SEATS[2] - 0.02;
      // The watch: out of the Hatter's pocket, into the March Hare's tea, back.
      watch.visible = t >= T.watch && t < T.dipped + 8;
      if (t < T.dipped - 2) carry(watch, cast.hatter);
      else { watch.position.set(seat('hare', t) + 0.05, TBL.h + 0.06 - (t >= T.dipped && t < T.dipped + 2 ? 0.04 : 0), TBL.z + 0.05); watch.rotation.set(0, 0, 0); }
      const a = aliceA(t);
      think(t, { x: a.x + 0.28, y: 0.62, z: a.z + 0.05 }, 0.28);
    }
    const S = (x, y = 0.38) => [x, y, TBL.z];
    const camera = cameraTrack([
      { t: 0, dur: 0, pos: [-2.4, 0.5, 2.4], look: [0, 0.3, -0.5] },                                  // the table under the tree
      { t: T.room - 1, dur: 2, pos: [0.9, 0.55, 1.1], look: S(0.3) },                                   // "No room! No room!"
      { t: T.sat, dur: 3, pos: [-0.1, 0.6, 1.4], look: S(-0.4, 0.32) },                               // Alice in the arm-chair
      { t: T.hair - 1, dur: 2, pos: [0.2, 0.5, 0.7], look: S(SEATS[1], 0.42) },                      // "Your hair wants cutting"
      { t: T.raven + 6, dur: 3, pos: [-0.1, 0.6, 1.4], look: S(-0.2, 0.34) },
      { t: T.watch - 1, dur: 2, pos: [0.45, 0.5, 0.65], look: S(SEATS[1] + 0.1, 0.4) },                 // the watch
      { t: T.dipped - 1, dur: 2, pos: [0.5, 0.5, 0.65], look: S(SEATS[3], 0.38) },                      // dipped into his tea
      { t: T.poured - 1, dur: 2, pos: [0.35, 0.48, 0.6], look: S(SEATS[2], 0.3) },                     // hot tea on the Dormouse's nose
      { t: T.poured + 8, dur: 4, pos: [-0.1, 0.65, 1.5], look: S(0, 0.36) },
      { t: T.wake - 1, dur: 2, pos: [0.3, 0.48, 0.6], look: S(SEATS[2], 0.3) },                      // the Dormouse's story
      { t: T.treacle + 20, dur: 4, pos: [-0.1, 0.65, 1.5], look: S(0, 0.36) },
      { t: T.move - 1, dur: 3, pos: [0.4, 0.75, 1.4], look: S(0.1, 0.3) },                            // one place on
      { t: T.disgust - 1, dur: 3, pos: [-1.4, 0.55, 1.5], look: [-2.4, 0.3, 0.3] },                   // walking off
      { t: T.teapot - 3, dur: 2, pos: [0.1, 0.55, 0.7], look: S(SEATS[2], 0.3) },                     // into the teapot
      { t: T.stupidest - 1, dur: 4, pos: [-2.9, 0.5, 1.5], look: [-3.6, 0.4, 0.2] },                  // a door into a tree
    ]);
    return {
      T, bg: PAPER, fog: [7, 26], bounds: { minX: -3, maxX: 2.5, minZ: 0.3, maxZ: 3 },
      hotspots: [{ pos: new THREE.Vector3(0, 0.3, TBL.z), title: 'The tea-table', text: 'the table was a large one, but the three were all crowded together at one corner of it' }],
      camera, update, actors: (t) => ({ alice: aliceA(t), hatter: hatterA(t), hare: hareA(t) }),
    };
  },
};

// --- 2. The long hall again --------------------------------------------------------------
export const hallAgain = {
  id: 'hallAgain',
  title: 'The long hall again',
  turn: 'dark',
  start: (cue) => cue.at('hall') - 1.5,
  build({ group, ai, cue, hallMeta }) {
    const at = cue.at;
    const start = hallAgain.start(cue);
    const T = { key: at('key'), unlock: at('door', 2), mushroom: at('mushroom'), passage: at('passage') };
    const { key, hinge, curt } = buildHall({ group, ai, hallMeta });
    curt.position.set(DOOR.x + 0.85, 0, DOOR.z + 0.03);
    const alice = (t) => {
      const s = route(t, [[start, { x: TABLE.x - 0.6, z: TABLE.z + 0.3, dir: 1 }], [T.key + 0.5, { x: TABLE.x - 0.25, z: TABLE.z + 0.35 }], [T.unlock - 0.5, { x: DOOR.x - 0.3, z: DOOR.z + 0.35 }],
        [T.passage, { x: DOOR.x - 0.3, z: DOOR.z + 0.35 }], [T.passage + 2.5, { x: DOOR.x, z: DOOR.z + 0.05 }]], { phase: t * 2.2 });
      const scale = lerp(0.8, 0.24, smooth((t - T.mushroom) / 3)); // "till she was about a foot high"
      return { ...s, pose: 'stand', scale, visible: t < T.passage + 2.5 };
    };
    function update(t, cast) {
      if (t >= T.key) { carry(key, cast.alice, { tilt: -0.6 }); }
      else { key.position.set(TABLE.x + 0.12, TABLE.top + 0.015 + KEY.h / 2, TABLE.z + 0.08); key.rotation.set(0, 0, 0); }
      key.visible = t < T.unlock + 1;
      hinge.rotation.y = -1.7 * smooth((t - T.unlock) / 1.2);
    }
    const camera = cameraTrack([
      { t: start, dur: 0, pos: [-1.0, 1.1, 1.2], look: [TABLE.x, 0.8, TABLE.z] },
      { t: T.key - 1, dur: 2, pos: [TABLE.x + 0.6, 1.1, TABLE.z + 1.0], look: [TABLE.x, 0.9, TABLE.z] },     // the little golden key
      { t: T.unlock - 1, dur: 2, pos: [DOOR.x - 0.6, 0.45, DOOR.z + 1.2], look: [DOOR.x, 0.25, DOOR.z] },    // unlocking the door
      { t: T.passage - 0.5, dur: 2, pos: [DOOR.x + 0.1, 0.18, DOOR.z + 0.7], look: [DOOR.x, 0.15, DOOR.z] },
    ]);
    return { T, bg: PAPER, fog: [8, 20], bounds: null, hotspots: [], camera, update, actors: (t) => ({ alice: alice(t) }) };
  },
};

// --- 3. The garden ---------------------------------------------------------------------
export const gardenAtLast = {
  id: 'garden',
  title: 'The beautiful garden',
  start: (cue) => cue.at('garden', 2) - 2,
  build({ group, ai, cue }) {
    const start = gardenAtLast.start(cue);
    outdoors(group, ai, { groundRepeat: 40 });
    // A placeholder garden: Chapter I's drawing as the backdrop, and flower-beds in front.
    const back = paperFlat(texture(gardenPicture()), 6, 4.5, { edge: false }); back.position.set(0, 0, -4); group.add(back);
    const bedTex = texture(flowerBed());
    for (const [x, z] of [[-0.8, -0.6], [0.9, -1.3], [-0.2, 0.5]]) { const b = paperFlat(bedTex, 1.8, 0.36); b.position.set(x, 0, z); group.add(b); }
    const alice = (t) => ({ ...route(t, [[start, { x: 0.9, z: 0.2, dir: -1 }], [start + 5, { x: 0.2, z: -0.1 }]], { phase: t * 2.2 }), pose: 'stand', scale: 0.24 });
    const camera = cameraTrack([{ t: start, dur: 0, pos: [0.6, 0.25, 1.4], look: [0.0, 0.3, -1.5] }, { t: start + 2, dur: 6, pos: [0.9, 0.5, 2.2], look: [0, 0.6, -3] }]);
    return { T: {}, bg: PAPER, fog: [8, 30], bounds: null, hotspots: [], camera, actors: (t) => ({ alice: alice(t) }) };
  },
};

export const CHAPTER_7 = [teaParty, hallAgain, gardenAtLast];
