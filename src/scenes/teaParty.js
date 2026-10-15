// Chapter VII, "A Mad Tea-Party", in three scenes:
//   teaParty — the long table under the tree in front of the March Hare's house: the Hatter,
//              the March Hare and the sleeping Dormouse; the riddle, the watch, Time, the
//              treacle-well, moving one place on; Alice walks off; the Dormouse into the
//              teapot; the tree with a door in it;
//   hallAgain — the long hall once more: the golden key, the little door, a foot high;
//   garden   — "she found herself at last in the beautiful garden".
// Figures and props not yet drawn are placeholders from props7.js.
import * as THREE from 'three';
import { paperFlat } from '@engine/stage.js';
import { texture, INK, PAPER } from '@engine/ink.js';
import { gardenBehind } from '../sets/croquet.js';
import { buildHall, TABLE, DOOR, KEY } from '../sets/hall.js';
import { thoughts } from '@engine/thoughts.js';
import { carry } from '@engine/puppet.js';
import { smooth, lerp, route, cameraTrack } from '@engine/track.js';
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
    outdoors(group, ai);
    for (const [x, z, h, s] of [[-2.6, -1.8, 3.4, 1], [2.8, -2.2, 3.6, -1], [0.4, -2.6, 3.8, 1], [-4.5, -0.5, 3.4, -1]]) {
      const t = paperFlat(ai.tree.tex, h * ai.tree.aspect, h); t.position.set(x, 0, z); t.scale.x = s; group.add(t);
    }
    const house = paperFlat(ai['ch6/march_hare_house'].tex, 2.0, 2.0 / ai['ch6/march_hare_house'].aspect); house.position.set(1.6, 0, -3.4); group.add(house);
    // The long table: a white top and a hanging cloth in front (the far side is open; people sit behind).
    const topGeo = new THREE.BoxGeometry(TBL.x1 - TBL.x0, 0.015, TBL.d);
    const top = new THREE.Mesh(topGeo, new THREE.MeshBasicMaterial({ color: '#f6f2e8' }));
    top.add(new THREE.LineSegments(new THREE.EdgesGeometry(topGeo), new THREE.LineBasicMaterial({ color: INK })));
    top.position.set((TBL.x0 + TBL.x1) / 2, TBL.h, TBL.z); group.add(top);
    // The tea things (AI, 2026-10-15, tools/tea_art.py, after plates 7.1-7.3): the hanging cloth repeated along the
    // table; "it's laid for a great many more than three": cups and saucers, plates of bread-and-butter, the
    // milk-jug by the March Hare (he upsets it into his plate), the teapot (the Dormouse's, plate 7.3).
    const CL = ai['ch7/tea_cloth'], clothTex = CL.tex.clone(), clothTile = TBL.h * CL.aspect;
    clothTex.wrapS = THREE.RepeatWrapping; clothTex.repeat.set((TBL.x1 - TBL.x0) / clothTile, 1); clothTex.needsUpdate = true;
    const cloth = paperFlat(clothTex, TBL.x1 - TBL.x0, TBL.h, { edge: false, opaque: true }); cloth.position.set((TBL.x0 + TBL.x1) / 2, 0, TBL.z + TBL.d / 2 + 0.003); group.add(cloth);
    const art = (n, w, opts) => { const a = ai[`ch7/${n}`]; return paperFlat(a.tex, w, w / a.aspect, opts); };
    for (let i = 0; i < 14; i++) { const c = art('teacup', 0.07); c.position.set(lerp(TBL.x0 + 0.1, TBL.x1 - 0.1, i / 13), TBL.h + 0.008, TBL.z + (i % 2 ? 0.1 : -0.1)); group.add(c); }
    for (const x of [-0.95, -0.35, 0.85]) { const p = art('plate_bread', 0.09); p.position.set(x, TBL.h + 0.008, TBL.z + 0.14); group.add(p); }
    const jug = art('milk_jug', 0.065); jug.position.set(SEATS[3] + 0.1, TBL.h + 0.008, TBL.z + 0.04); group.add(jug);
    const pot = art('teapot', 0.16); pot.position.set(SEATS[2] - 0.02, TBL.h + 0.008, TBL.z + 0.02); group.add(pot);
    // The arm-chair at the end of the table, the same chair as in Alice's drawing sitting in it.
    const chair = art('tea_armchair', 0.45 * ai['ch7/tea_armchair'].aspect); chair.position.set(TBL.x0 - 0.14, 0, TBL.z + 0.08); chair.rotation.y = 0.9; group.add(chair);
    const W = ai['props/hatter_watch_close'], watch = paperFlat(W.tex, 0.04, 0.04 / W.aspect, { anchor: 'center' }); group.add(watch); // the days of the month, a little butter on it (AI)
    const dA = ai['ch7/dormouse_sleep'], dB = ai['ch7/dormouse_talk']; const dor = paperFlat(dA.tex, 0.11, 0.11 / dA.aspect); const dorTalk = paperFlat(dB.tex, 0.11, 0.11 / dB.aspect); // AI (tools/ch7_art.py) group.add(dor, dorTalk);
    const DT = ai['ch7/dormouse_teapot']; const potDor = paperFlat(DT.tex, 0.19, 0.19 / DT.aspect); group.add(potDor); // the Dormouse in the teapot (AI, after plate 7.3)
    potDor.position.set(SEATS[2] - 0.02, TBL.h + 0.008, TBL.z + 0.02);
    const tree = art('tree_door', 1.47 * ai['ch7/tree_door'].aspect); tree.position.set(-3.6, 0, 0.2); group.add(tree); // the same tree as in her drawing at its door
    const think = thoughts(group, [
      { t0: T.raven - 0.5, t1: T.raven + 12, art: ai['vignettes/raven'].tex },
      { t0: T.concert - 1, t1: T.twinkle, art: ai['vignettes/concert'].tex },
      { t0: T.twinkle, t1: T.pinch + 2, art: ai['vignettes/bat'].tex },
      { t0: T.sisters - 1, t1: T.treacle + 10, art: ai['vignettes/treacle'].tex },
    ]);

    // Who sits where: the Hatter, the Dormouse and the March Hare crowded at one corner;
    // after "let's all move one place on", each moves along one seat.
    const seat = (who, t) => {
      const before = { hatter: 1, dormouse: 2, hare: 3 }[who];
      const k = smooth((t - T.move - 1) / 2.5);
      return lerp(SEATS[before], SEATS[before - 1], k);
    };
    // AI poses (2026-10-14): the Hatter steps along one place standing; at last both push the Dormouse into the
    // teapot (after Tenniel's plate 7.3: the Hare on the left, the Hatter on the right, the teapot between them).
    const POT_X = SEATS[2] - 0.02, pushing = (t) => t >= T.teapot - 2.5;
    const moving = (t) => t >= T.move + 0.8 && t < T.move + 3.7;
    const hatterA = (t) => {
      if (pushing(t)) return { pose: 'push', x: POT_X + 0.13, z: TBL.z - 0.1, y: TBL.h - 0.05, dir: -1 };
      if (moving(t)) return { pose: 'move', x: seat('hatter', t), z: TBL.z - 0.16, y: 0.2, dir: -1 }; // his head about where it is when seated
      return { pose: t >= T.raven - 1 && t < T.raven + 3 ? 'riddle' : t >= T.watch && t < T.dipped ? 'watch' : 'stare', x: seat('hatter', t), z: TBL.z - 0.14, y: SEATED_Y, dir: -1 };
    };
    const hareA = (t) => {
      if (pushing(t)) return { pose: 'push', x: POT_X - 0.13, z: TBL.z - 0.1, y: TBL.h - 0.05, dir: 1 };
      return { pose: t >= T.dipped && t < T.dipped + 6 ? 'dip' : 'sit', x: seat('hare', t), z: TBL.z - 0.14, y: SEATED_Y, dir: -1 };
    };
    const ARMCHAIR = { x: TBL.x0 - 0.12, z: TBL.z + 0.06 };
    const aliceA = (t) => {
      // To the arm-chair; along to the March Hare's old place; up in disgust and off into the wood.
      const s = route(t, [
        [0, { x: -2.6, z: 0.9, dir: 1 }], [T.sat - 0.5, ARMCHAIR], [T.move + 1, ARMCHAIR],
        [T.move + 5, { x: SEATS[3] - 0.08, z: TBL.z + TBL.d / 2 + 0.12 }],
        [T.disgust, { x: SEATS[3] - 0.08, z: TBL.z + TBL.d / 2 + 0.12 }], [T.stupidest, { x: -3.3, z: 0.5, dir: -1 }], [T.door - 0.5, { x: -3.75, z: 0.24 }],
      ], { phase: t * 2.2 });
      const inArmchair = t >= T.sat && t < T.move + 1, atTable = t >= T.move + 5 && t < T.disgust;
      // AI poses (2026-10-14): in the arm-chair (the drawing has the chair); leaning forward at the March Hare's
      // old place, listening; walking off in disgust, looking back; at the tree with a door in it.
      let pose = 'stand';
      if (inArmchair) pose = 'chair7';
      if (atTable) pose = 'lean7';
      if (t >= T.disgust + 2 && t < T.teapot + 1) pose = 'walkoff7';      // "she looked back once or twice"
      if (t >= T.door - 0.5) pose = 'treedoor';
      const dir = inArmchair || atTable ? 1 : pose === 'walkoff7' ? -1 : pose === 'treedoor' ? 1 : s.dir;
      return { ...s, pose, scale: TWO_FEET, dir, visible: t < T.door + 3 };
    };
    function update(t, cast) {
      // The Dormouse: asleep between them as a cushion; awake for the story; into the teapot at last.
      const dx = seat('dormouse', t);
      const awake = t >= T.wake + 3 && t < T.disgust;
      const intoPot = smooth((t - T.teapot + 2.5) / 2.5);
      dor.visible = !awake; dorTalk.visible = awake;
      const jig = (t >= T.pinch && t < T.pinch + 1.5) || (t >= T.wake && t < T.wake + 1) || (t >= T.pinched && t < T.pinched + 1) ? Math.sin(t * 40) * 0.01 : 0;
      for (const d of [dor, dorTalk]) d.position.set(lerp(dx, SEATS[2] - 0.02, intoPot) + jig, TBL.h + 0.008 + intoPot * 0.06 - smooth((t - T.teapot) / 1.5) * 0.08, TBL.z - 0.02);
      // Into the teapot: the drawing of the Dormouse half in the pot replaces the pot and the sleeping Dormouse.
      const inPot = t >= T.teapot - 1;
      dor.visible = dor.visible && !inPot; dorTalk.visible = dorTalk.visible && !inPot;
      pot.visible = !inPot; potDor.visible = inPot;
      pot.position.x = SEATS[2] - 0.02;
      // The watch: out of the Hatter's pocket, into the March Hare's tea, back.
      watch.visible = t >= T.watch && t < T.dipped + 8;
      if (t < T.dipped - 2) carry(watch, cast.hatter);
      else { watch.position.set(seat('hare', t) + 0.05, TBL.h + 0.06 - (t >= T.dipped && t < T.dipped + 2 ? 0.04 : 0), TBL.z + 0.05); watch.rotation.set(0, 0, 0); }
      // "the March Hare had just upset the milk-jug into his plate"
      jug.rotation.z = smooth((t - T.milk + 1) / 0.6) * 1.3; jug.position.x = seat('hare', t) + 0.1;
      chair.visible = aliceA(t).pose !== 'chair7';   // her arm-chair drawing has its own chair
      tree.visible = aliceA(t).pose !== 'treedoor';  // and the tree with the door is in her drawing there
      const a = aliceA(t);
      think(t, { x: a.x + 0.28, y: 0.62, z: a.z + 0.05 }, 0.28);
    }
    const S = (x, y = 0.38) => [x, y, TBL.z];
    // Hand-directed with the AI tea things (2026-10-15): the whole party with Alice in her arm-chair (PARTY) between
    // the close shots, at her own lines, so she is in the picture at least every ~12 s.
    const PARTY = { pos: [-0.5, 0.55, 1.6], look: [-0.5, 0.18, -0.45] };
    const key = (t, s, dur = 2) => ({ t, dur, ...s });
    const camera = cameraTrack([
      { t: 0, dur: 0, pos: [-2.4, 0.5, 2.4], look: [0, 0.3, -0.5] },                                  // the table under the tree
      { t: T.room - 1, dur: 2, pos: [0.9, 0.55, 1.1], look: S(0.3) },                                   // "No room! No room!"
      { t: T.sat, dur: 3, pos: [-0.1, 0.6, 1.4], look: S(-0.4, 0.32) },                               // Alice in the arm-chair
      { t: T.hair - 1, dur: 2, pos: [0.2, 0.5, 0.7], look: S(SEATS[1], 0.42) },                      // "Your hair wants cutting"
      key(76.5, PARTY, 2.5),                                                                          // "You should learn not to make personal remarks"
      { t: T.raven + 6, dur: 3, pos: [-0.1, 0.6, 1.4], look: S(-0.2, 0.34) },
      { t: T.watch - 1, dur: 2, pos: [0.45, 0.5, 0.65], look: S(SEATS[1] + 0.1, 0.4) },                 // the watch
      key(178.6, PARTY), key(182.3, { pos: [0.45, 0.5, 0.65], look: S(SEATS[1] + 0.1, 0.4) }, 1.5),   // "The fourth."; "Two days wrong!"
      key(189, PARTY),                                                                                // "It was the best butter"
      { t: T.dipped - 1, dur: 2, pos: [0.5, 0.5, 0.65], look: S(SEATS[3], 0.38) },                      // dipped into his tea
      { t: T.poured - 1, dur: 2, pos: [0.35, 0.48, 0.6], look: S(SEATS[2], 0.3) },                     // hot tea on the Dormouse's nose
      { t: T.poured + 2.5, dur: 3, pos: [-0.1, 0.65, 1.5], look: S(0, 0.36) },
      { t: T.wake - 1, dur: 2, pos: [0.3, 0.48, 0.6], look: S(SEATS[2], 0.3) },                      // the Dormouse's story
      key(512.8, PARTY, 1.5),                        key(530.8, { pos: [0.3, 0.48, 0.6], look: S(SEATS[2], 0.3) }, 1.5),      // "Yes, please do!"; "Once upon a time"
      key(541.4, PARTY, 1.5), key(547, { pos: [0.3, 0.48, 0.6], look: S(SEATS[2], 0.3) }, 1.5),        // "What did they live on?"; "treacle"
      key(552, PARTY, 1.5),                                                                           // "they'd have been ill" 
      { t: T.treacle + 20, dur: 4, pos: [-0.1, 0.65, 1.5], look: S(0, 0.36) },
      { t: T.move - 1, dur: 3, pos: [0.4, 0.75, 1.4], look: S(0.1, 0.3) },                            // one place on
      { t: T.disgust + 1, dur: 3, pos: [-0.9, 0.5, 1.9], look: [-2.1, 0.15, 0.2] },                   // walking off, looking back
      { t: T.teapot - 3, dur: 2, pos: [0.1, 0.55, 0.7], look: S(SEATS[2], 0.3) },                     // into the teapot
      { t: T.teapot + 1, dur: 3, pos: [-2.6, 0.5, 2.3], look: [-3.4, 0.25, 0.1] },                    // "the stupidest tea-party"; a door into a tree
    ]);
    return {
      T, bg: PAPER, fog: [7, 26], bounds: { minX: -3, maxX: 2.5, minZ: 0.3, maxZ: 3 },
      hotspots: [{ pos: new THREE.Vector3(0, 0.3, TBL.z), title: 'The tea-table', text: 'the table was a large one, but the three were all crowded together at one corner of it' }],
      camera, update,
      actors: (t) => ({ alice: aliceA(t), hatter: hatterA(t), hare: hareA(t) }),
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
      const pose = t >= T.mushroom - 0.5 && t < T.mushroom + 3 ? 'nibble' : 'stand'; // "nibbling at the mushroom"
      return { ...s, pose, scale, visible: t < T.passage + 2.5 };
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
    outdoors(group, ai);
    // "Among the bright flower-beds and the cool fountains": the Queen's garden of Chapter VIII (AI, 2026-10-15).
    gardenBehind(group, ai, 0, -3.2);
    const FB = ai['ch8/flower_bed'];
    for (const [x, z, s] of [[-0.9, -0.7, 1], [0.9, -1.4, -1], [-1.3, 0.4, -1]]) { const b = paperFlat(FB.tex, 1.0, 1.0 / FB.aspect); b.position.set(x, 0, z); b.scale.x = s; group.add(b); }
    const alice = (t) => { const s = route(t, [[start, { x: 0.9, z: 0.2, dir: -1 }], [start + 5, { x: 0.2, z: -0.1 }]], { phase: t * 2.2 }); return { ...s, pose: s.moving ? 'stand' : 'garden7', scale: 0.24 }; }; // delighted, among the flower-beds
    const camera = cameraTrack([{ t: start, dur: 0, pos: [0.6, 0.25, 1.4], look: [0.0, 0.3, -1.5] }, { t: start + 2, dur: 6, pos: [0.9, 0.5, 2.2], look: [0, 0.6, -3] }]);
    return { T: {}, bg: PAPER, fog: [8, 30], bounds: null, hotspots: [], camera, actors: (t) => ({ alice: alice(t) }) };
  },
};

export const CHAPTER_7 = [teaParty, hallAgain, gardenAtLast];
