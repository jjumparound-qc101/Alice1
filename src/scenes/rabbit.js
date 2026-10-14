// Chapter IV, "The Rabbit Sends in a Little Bill", in three scenes:
//   lane  — the Rabbit hunts for his gloves and sends Alice off as "Mary Ann";
//   house — the Rabbit's house, inside (Alice grows until she fills the room) and outside
//           (the arm in the window, the cucumber-frames, the ladders, Bill up the chimney,
//           the pebbles that turn into cakes);
//   wood  — tiny Alice, the enormous puppy, the buttercup, and the mushroom with the
//           blue Caterpillar on top.
// Figures and props not yet drawn are placeholders from props4.js.
import * as THREE from 'three';
import { paperFlat } from '../stage.js';
import { texture, PAPER } from '../ink.js';
import * as art from '../art.js';
import { flagstones } from '../props.js';
import {
  HOUSE_PX, houseFront, roomWall, windowTable, plainBottle, cucumberFrames, ladder, barrow, pebble, littleCake,
  thistle, buttercup, mushroom, stick, dinahNurseVignette, bookVignette,
} from '../props4.js';
import { thoughts } from '../thoughts.js';
import { panorama } from '../sets/panorama.js';
import { carry } from '../puppet.js';
import { smooth, lerp, route, cameraTrack } from '../track.js';

const MAID = 0.5;    // Alice's size here: small enough to be taken for the Rabbit's housemaid
const TINY = 0.13;   // after the little cakes: about three inches
export const tiled = (t, rx, ry = 1) => { t = t.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.needsUpdate = true; return t; };
const plain = (map, opts = {}) => new THREE.MeshBasicMaterial({ map, ...opts });

// Ground, sky and far trees for the two outdoor scenes.
export function outdoors(group, ai, { groundRepeat = 14 } = {}) {
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), plain(texture(art.groundTile(), { repeat: [groundRepeat, groundRepeat] })));
  floor.rotation.x = -Math.PI / 2; group.add(floor);
  const sky = paperFlat(tiled(ai.sky.tex, 40 / (14 * ai.sky.aspect)), 40, 14, { edge: false, opaque: true });
  sky.position.set(0, -0.5, -14); group.add(sky);
  const far = paperFlat(tiled(ai.treeline.tex, 34 / (3.2 * ai.treeline.aspect)), 34, 3.2, { edge: false });
  far.position.set(0, 0, -12); group.add(far);
  panorama(group, ai);
}

// --- 1. The lane -------------------------------------------------------------------------
export const lane = {
  id: 'lane',
  title: 'Mary Ann!',
  start: () => 0,
  build({ group, ai, cue }) {
    const at = cue.at;
    const T = { vanished: at('vanished'), noticed: at('noticed'), mary: at('mary'), ran: at('ran', 1), house: at('house', 1) };
    outdoors(group, ai);
    // A lane between trees, the neat little house far off at its end.
    for (const [x, z, s] of [[-2.4, -1, 1], [2.6, -2.5, -1], [-2.8, -5, 1], [2.9, -6.5, -1], [-2.4, -9, 1]]) {
      const tree = paperFlat(ai.tree.tex, 4.5 * ai.tree.aspect, 4.5); tree.position.set(x, 0, z); tree.scale.x = s; group.add(tree);
    }
    for (const z of [0.8, -3, -7]) {
      const grass = paperFlat(tiled(ai.grass.tex, 12 / (0.55 * ai.grass.aspect)), 12, 0.55, { edge: false }); grass.position.set(z > 0 ? 0 : (z < -5 ? 3 : -3), 0, z); group.add(grass);
    }
    const house = paperFlat(texture(houseFront()), 2.4, 2.4 * HOUSE_PX.h / HOUSE_PX.w); house.position.set(0.4, 0, -10); group.add(house);

    const rabbit = (t) => {
      const s = route(t, [
        [0, { x: 1.6, z: -5, dir: -1 }],
        [T.noticed - 2, { x: 0.5, z: -0.8 }],                       // "trotting slowly back again, and looking anxiously about"
        [T.ran + 6, { x: 0.5, z: -0.8 }],
      ], { phase: t * 1.6 });
      // The Chapter I model (owner, 2026-10-14): looking anxiously about; pointing ("run home this moment").
      const pointing = t >= T.mary && t < T.ran + 2;
      return { ...s, pose: pointing ? 'point' : 'search', dir: pointing ? -1 : s.dir };
    };
    const alice = (t) => {
      const s = route(t, [
        [0, { x: -0.9, z: 0.2, dir: 1 }],
        [12, { x: -0.3, z: -0.3 }],                                 // hunting about for the fan and gloves
        [18, { x: -0.3, z: -0.3 }],
        [26, { x: -0.9, z: 0.0 }],
        [T.ran, { x: -0.6, z: -0.2 }],
        [T.house - 1, { x: 0.3, z: -9.6 }],                         // "she ran off at once in the direction it pointed to"
      ], { phase: t * 2.2 });
      const hunting = t < T.noticed && !s.moving;
      return { ...s, pose: hunting ? 'stoop' : 'stand', scale: MAID, visible: t < T.house - 1 }; // stooping to look for the fan and gloves (AI pose)
    };
    const camera = cameraTrack([
      { t: 0, dur: 0, pos: [0.2, 0.9, 2.6], look: [0.6, 0.5, -3] },
      { t: 3, dur: 10, pos: [-0.2, 0.6, 1.4], look: [0.4, 0.45, -2] },
      { t: T.noticed - 1, dur: 3, pos: [-1.4, 0.65, 0.9], look: [0.1, 0.45, -0.5] },     // "Why, Mary Ann…"
      { t: T.ran, dur: 6, pos: [0.0, 1.1, 1.8], look: [0.3, 0.5, -8] },                  // she runs off down the lane
      { t: T.house - 6, dur: 5, pos: [0.3, 0.9, -6.5], look: [0.4, 1.0, -10] },          // the neat little house
    ]);
    return {
      T, bg: PAPER, fog: [9, 30], bounds: { minX: -2, maxX: 2, minZ: -8, maxZ: 1.5 },
      hotspots: [{ pos: new THREE.Vector3(0.4, 1, -9.8), title: 'A neat little house', text: 'on the door of which was a bright brass plate with the name “W. RABBIT,” engraved upon it' }],
      camera, actors: (t) => ({ alice: alice(t), rabbit: rabbit(t) }),
    };
  },
};

// --- 2. The Rabbit's house ---------------------------------------------------------------
// The front of the house stands on z = 0, facing +z; the little room upstairs is behind it.
const HW = 3.0, HH = HW * HOUSE_PX.h / HOUSE_PX.w, PXM = HW / HOUSE_PX.w;
const px = (x) => -HW / 2 + x * PXM, py = (y) => HH - y * PXM;
const WIN = { x0: px(HOUSE_PX.window.x), x1: px(HOUSE_PX.window.x + HOUSE_PX.window.w), y0: py(HOUSE_PX.window.y + HOUSE_PX.window.h), y1: py(HOUSE_PX.window.y) };
const DOORX = px(HOUSE_PX.door.x + HOUSE_PX.door.w / 2);
const CHIMNEY = { x: px(HOUSE_PX.chimney.x + HOUSE_PX.chimney.w / 2), y: HH };
const ROOM = { x0: -0.75, x1: 0.95, z0: -1.05, z1: -0.03, floor: 1.45, ceil: 2.42 };
const FRAMES = { x: (WIN.x0 + WIN.x1) / 2, z: 0.9 };

export const rabbitHouse = {
  id: 'house',
  title: 'W. RABBIT',
  start: (cue) => cue.at('house', 1) - 1,
  parts: (cue) => [
    { title: 'The tidy little room', t: cue.at('upstairs') - 1 },
    { title: 'Growing', t: cue.at('ceiling') - 3 },
    { title: 'An arm in the window', t: cue.at('window', 4) - 2 },
    { title: 'Bill', t: cue.at('rumbling') - 1 },
    { title: 'Pebbles and cakes', t: cue.at('barrowful') - 1 },
  ],
  build({ group, ai, cue }) {
    const at = cue.at;
    const start = rabbitHouse.start(cue);
    const T = {
      house: at('house', 1), upstairs: at('upstairs'), dinah: at('dinah'), room: at('room', 1), bottle: at('bottle', 1), uncorked: at('uncorked'),
      ceiling: at('ceiling'), putDown: at('bottle', 4), kneel: at('kneel'), lying: at('lying'), arm: at('arm', 2), effect: at('effect', 2),
      book: at('book'), voice: at('voice'), shook: at('house', 4), door: at('door', 1, at('house', 4)), window: at('window', 4), snatch: at('snatch', 1),
      shriek: at('shriek'), pat: at('pat', 1), pat2: at('pat', 2), snatch2: at('snatch', 2), rumbling: at('rumbling'), heads: at('heads'),
      downChimney: at('chimney', 3), kick: at('kick', 2), goes: at('bill', 5), feeble: at('voice', 4), burn: at('burn'), dinah2: at('dinah', 2),
      barrowful: at('barrowful'), pebbles: at('pebbles'), cakes: at('cakes'), swallowed: at('swallowed'), ranOut: at('ran', 1, at('swallowed')),
      held: at('guinea-pigs'), ranOff: at('ran', 2, at('swallowed')),
    };

    // The house shakes when she trembles ("she trembled till she shook the house").
    const house = new THREE.Group(); group.add(house);
    outdoors(group, ai);
    const front = paperFlat(texture(houseFront()), HW, HH, { edge: false }); house.add(front);
    // The room: front wall (with the window), back wall (fireplace and looking-glass), sides, floor, ceiling.
    const RW = ROOM.x1 - ROOM.x0, RH = ROOM.ceil - ROOM.floor, RD = ROOM.z1 - ROOM.z0;
    const wall = (kind, w, pos, rotY) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, RH), plain(texture(roomWall(kind)), { transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })); m.position.set(...pos); m.rotation.y = rotY; house.add(m); return m; };
    const windowWall = wall('window', RW, [(ROOM.x0 + ROOM.x1) / 2, ROOM.floor + RH / 2, ROOM.z1 - 0.01], Math.PI);
    wall('fire', RW, [(ROOM.x0 + ROOM.x1) / 2, ROOM.floor + RH / 2, ROOM.z0], 0);
    const doorWall = wall('door', RD, [ROOM.x0, ROOM.floor + RH / 2, (ROOM.z0 + ROOM.z1) / 2], Math.PI / 2);
    wall('fire', RD, [ROOM.x1, ROOM.floor + RH / 2, (ROOM.z0 + ROOM.z1) / 2], -Math.PI / 2);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), plain(texture(flagstones(), { repeat: [3, 2] })));
    floor.rotation.x = -Math.PI / 2; floor.position.set((ROOM.x0 + ROOM.x1) / 2, ROOM.floor + 0.002, (ROOM.z0 + ROOM.z1) / 2); house.add(floor);
    const ceil = floor.clone(); ceil.rotation.x = Math.PI / 2; ceil.position.y = ROOM.ceil; house.add(ceil);
    const table = paperFlat(texture(windowTable()), 0.5, 0.375); table.position.set(0.55, ROOM.floor, ROOM.z1 - 0.12); house.add(table);
    const bottle = paperFlat(texture(plainBottle()), 0.04, 0.08); house.add(bottle);
    // The dollhouse view (2026-10-14): the room is seen from in front of the house, with the front
    // cut away over it, so the whole of her is in the picture however large she grows. Once her arm is
    // out of the window, only the part left of the window is cut, so the window and the arm stay.
    const cutFront = (x1) => {
      const V = (x, y) => new THREE.Vector2(x, y), i = 0.03;
      const shape = new THREE.Shape([V(-HW / 2, 0), V(HW / 2, 0), V(HW / 2, HH), V(-HW / 2, HH)]);
      shape.holes.push(new THREE.Path([V(ROOM.x0 + i, ROOM.floor + i), V(ROOM.x0 + i, ROOM.ceil - i), V(x1, ROOM.ceil - i), V(x1, ROOM.floor + i)]));
      const geo = new THREE.ShapeGeometry(shape), uv = geo.attributes.uv, p = geo.attributes.position;
      for (let n = 0; n < p.count; n++) uv.setXY(n, (p.getX(n) + HW / 2) / HW, p.getY(n) / HH);
      const m = new THREE.Mesh(geo, front.userData.front.material); house.add(m); return m;
    };
    const fullCut = cutFront(ROOM.x1 - 0.03), halfCut = cutFront(WIN.x0 - 0.06);
    const cutAt = (t) => (t < T.upstairs - 0.5 || t >= T.ranOut - 0.5 ? 'none' : t < T.arm ? 'full' : 'half');
    // Outside: the cucumber-frames under the window, and later the ladders, the barrow.
    const framesWhole = paperFlat(texture(cucumberFrames(false)), 1.4, 0.44), framesBroken = paperFlat(texture(cucumberFrames(true)), 1.4, 0.44);
    for (const f of [framesWhole, framesBroken]) { f.position.set(FRAMES.x, 0, FRAMES.z); group.add(f); }
    const lad = paperFlat(texture(ladder()), 0.5, HH + 0.1); lad.position.set(HW / 2 - 0.25, 0, 0.25); lad.rotation.x = -0.08; group.add(lad);
    const bar = paperFlat(texture(barrow()), 0.6, 0.33); bar.position.set(1.75, 0, 0.75); group.add(bar);
    // Her arm out of the window, hanging down the front of the house.
    const ARM = 0.7; // shoulder to fingertips at her full size: it "fills the whole window"
    const arm = paperFlat(ai['ch4/alice_hand'].tex, ARM, ARM / ai['ch4/alice_hand'].aspect, { anchor: 'center' }); // AI, after Tenniel's plate 4.2
    const armPivot = new THREE.Group(); armPivot.position.set((WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, 0.06); arm.position.x = ARM * 0.44; armPivot.add(arm); group.add(armPivot);
    // Pebbles on the floor, turning into little cakes.
    const pebTex = texture(pebble()), cakeTex = texture(littleCake());
    const pebs = Array.from({ length: 9 }, (_, i) => {
      const p = paperFlat(pebTex, 0.05, 0.037), c = paperFlat(cakeTex, 0.05, 0.037);
      const x = lerp(ROOM.x0 + 0.2, ROOM.x1 - 0.2, (i * 0.37) % 1), z = lerp(ROOM.z0 + 0.15, ROOM.z1 - 0.1, (i * 0.61) % 1);
      p.position.set(x, ROOM.floor, z); c.position.copy(p.position); house.add(p, c);
      return { p, c, i };
    });
    const think = thoughts(group, [
      { t0: T.dinah - 6, t1: T.dinah + 3, art: dinahNurseVignette() },
      { t0: T.book - 1, t1: T.book + 11, art: bookVignette() },
    ]);

    // --- Alice: maid-sized, then giant, then tiny ---------------------------------
    // She grows until her head is against the ceiling ("had to stoop"), then, kneeling and lying
    // cramped, until the crouching drawing fills the room's height (it is 1 m tall at scale 1).
    const HEAD = RH / 1.25, GROWN = (RH - 0.02) / 1.0;
    const scaleAt = (t) => {
      if (t >= T.swallowed) return lerp(GROWN, TINY, smooth((t - T.swallowed - 1) / 4));
      if (t < T.ceiling) return lerp(MAID, HEAD, smooth((t - T.uncorked - 2.5) / (T.ceiling - T.uncorked - 2.5)));
      return lerp(HEAD, GROWN, smooth((t - T.kneel + 1) / (T.effect - T.kneel + 1)));
    };
    const GIANT = { x: -0.33, z: -0.6 }; // against the door, left of the window
    function alice(t) {
      const scale = scaleAt(t);
      if (t < T.upstairs) { // to the door and in
        const s = route(t, [[start, { x: DOORX - 1.6, z: 1.6, dir: 1 }], [T.upstairs - 1.5, { x: DOORX, z: 0.15 }]], { phase: t * 2.2 });
        return { ...s, pose: 'stand', scale, visible: t < T.upstairs - 1.2 };
      }
      if (t >= T.ranOut) { // out of the door, small, and away "as hard as she could"
        const s = route(t, [[T.ranOut, { x: DOORX, z: 0.15, dir: 1 }], [T.held - 1, { x: DOORX + 0.05, z: 0.45 }], [T.ranOff, { x: DOORX + 0.05, z: 0.45 }], [T.ranOff + 3, { x: -3.5, z: 1.6, dir: -1 }]], { phase: t * 3 });
        return { ...s, pose: 'stand', scale, y: 0 };
      }
      // Inside: in at the door (thinking of Dinah), to the table, to the looking-glass, then growing.
      const s = route(t, [
        [T.upstairs, { x: ROOM.x0 + 0.15, z: -0.5, dir: 1 }], [T.room - 2, { x: ROOM.x0 + 0.15, z: -0.5 }],
        [T.room + 1, { x: 0.35, z: ROOM.z1 - 0.3 }], [T.bottle, { x: 0.35, z: ROOM.z1 - 0.3 }],
        [T.bottle + 3, { x: -0.25, z: ROOM.z0 + 0.3, dir: -1 }], [T.kneel - 1, { x: -0.25, z: ROOM.z0 + 0.3 }], [T.kneel + 1, GIANT],
      ], { phase: t * 2.2 });
      // AI poses (2026-10-14): the fan and gloves in her hand; drinking; then cramped, too big for the room.
      let pose = 'stand';
      if (!s.moving && t >= T.room + 2 && t < T.bottle) pose = 'hold4';
      if (t >= T.uncorked && t < T.uncorked + 2.5) pose = 'drink';
      if (t >= T.kneel && scale > 0.4) pose = 'giant';
      const stoop = pose === 'stand' && t >= T.ceiling - 1 && t < T.kneel ? 0.12 : 0; // "had to stoop to save her neck"
      const trembling = t >= T.shook - 1 && t < T.shook + 4 ? Math.sin(t * 50) * 0.02 : 0;
      const pelted = t >= T.pebbles && t < T.pebbles + 4 ? Math.sin(t * 30) * 0.04 : 0;
      return { ...s, pose, scale, y: ROOM.floor, tilt: stoop + trembling + pelted, dir: t >= T.kneel ? 1 : s.dir };
    }

    // --- The Rabbit, Pat, Bill and the crowd outside ---------------------------------
    const UNDER = { x: FRAMES.x - 0.2, z: 0.55 };
    function rabbit(t) {
      if (t < T.window - 1) return { visible: false };
      const fell = t >= T.shriek;
      const s = route(t, [
        [T.window - 1, { x: DOORX + 0.3, z: 1.0, dir: 1 }], [T.window + 4, UNDER],      // "round … to the window"
        [T.shriek, UNDER], [T.shriek + 0.4, { x: FRAMES.x, z: FRAMES.z + 0.02 }],          // into a cucumber-frame
        [T.pat + 8, { x: FRAMES.x, z: FRAMES.z + 0.02 }], [T.pat + 12, { x: FRAMES.x - 0.6, z: 1.0 }],
        [T.snatch2 - 1, { x: FRAMES.x - 0.6, z: 1.0 }], [T.rumbling + 3, { x: -0.1, z: 1.05 }],
        [T.ranOut, { x: -0.1, z: 1.05 }], [T.held, { x: DOORX + 1.0, z: 1.0 }],
      ], { phase: t * 2.4 });
      // The Chapter I model: trotting round; tumbling into the cucumber-frame (drawn falling); giving orders.
      const tumble = fell && t < T.pat + 10 ? Math.min(1, (t - T.shriek) / 0.4) : 0;
      const pose = tumble > 0 ? 'frame' : s.moving ? 'trot1' : t > T.pat + 12 ? 'order' : 'watch1';
      return { ...s, pose, y: -tumble * 0.05, dir: t > T.pat + 12 && !s.moving ? 1 : s.dir };
    }
    function pat(t) {
      if (t < T.pat + 1) return { visible: false };
      const s = route(t, [[T.pat + 1, { x: 2.6, z: 1.0, dir: -1 }], [T.pat2, { x: FRAMES.x + 0.5, z: 0.95 }], [T.snatch2 - 3, { x: FRAMES.x + 0.15, z: 0.6 }],
        [T.snatch2 + 0.4, { x: FRAMES.x + 0.25, z: FRAMES.z + 0.02 }], [T.snatch2 + 8, { x: FRAMES.x + 0.25, z: FRAMES.z + 0.02 }], [T.rumbling + 5, { x: 1.6, z: 1.1 }]], { pose: 'spade', phase: t * 2.4 });
      const fell = t >= T.snatch2 + 0.2 && t < T.snatch2 + 8 ? 1 : 0;
      const nervous = t >= T.pat2 + 2 && t < T.snatch2 - 4 && !s.moving; // "Sure, I don't like it, yer honour"
      return { ...s, pose: nervous ? 'cap' : 'spade', tilt: fell * -1.1, y: -fell * 0.08 };
    }
    const ROOF = { x: CHIMNEY.x, z: 0.05 };
    function bill(t) {
      if (t < T.rumbling) return { visible: false };
      if (t < T.kick) {
        const s = route(t, [[T.rumbling, { x: -2.6, z: 0.9, dir: 1 }], [T.heads - 4, { x: HW / 2 - 0.25, z: 0.45 }], [T.downChimney + 4, { x: HW / 2 - 0.25, z: 0.45 }], [T.kick - 6, ROOF]], { pose: 'stand', phase: t * 2.4 });
        const climb = smooth((t - T.downChimney - 4) / 8); // up the ladder and over the roof to the chimney
        const pose = t < T.heads - 4 ? 'ladder' : t >= T.downChimney + 4 ? 'climb' : 'stand';  // "Bill's got the other" ladder
        return { ...s, pose, dir: pose === 'stand' ? -1 : s.dir, y: climb * (HH - 0.05), visible: t < T.kick - 5 };
      }
      if (t < T.kick + 3) { // "up I goes like a sky-rocket!" and down by the hedge
        const k = (t - T.kick) / 3;
        return { pose: 'fly', x: lerp(CHIMNEY.x, 2.0, k), z: lerp(0.05, 0.7, k), y: HH + 0.2 + 2.5 * 4 * k * (1 - k) - k * k * HH * 0.9, tilt: -k * 2.6, dir: 1 }; // up, over and down
      }
      const held = { x: DOORX - 0.6, z: 0.7 }; // left of the door, clear of the cucumber-frames
      const s = route(t, [[T.kick + 3, { x: 2.0, z: 0.7 }], [T.feeble - 2, { x: 2.0, z: 0.7 }], [T.feeble + 2, held]], { pose: 'limp', phase: t * 1.5 });
      return { ...s, pose: 'limp', tilt: t < T.feeble ? -1.4 : 0, y: t >= T.feeble ? 0.06 : 0 }; // limp by the hedge, then held up
    }
    const helper = (side) => (t) => {
      if (t < T.kick + 3) return { visible: false };
      const s = route(t, [[T.kick + 3, { x: 2.0 + side * 0.3, z: 0.85 }], [T.feeble - 2, { x: 2.0 + side * 0.2, z: 0.72 }], [T.feeble + 2, { x: DOORX - 0.6 + side * 0.17, z: 0.72 }]], { pose: 'up', phase: t * 2 });
      // Holding him up under the arms; the other gives him something out of a bottle ("Brandy now").
      const pose = t >= T.feeble - 2 ? (side < 0 ? 'hold' : 'bottle') : 'up';
      return { ...s, pose, dir: -side };
    };
    const CROWD = { duck: [-1.6, 1.0], lory: [-1.2, 1.25], eaglet: [1.1, 1.2], owl: [0.6, 1.35], magpie: [-0.4, 1.3], canary: [1.8, 1.25] }; // close to the house, above the text strip
    const crowd = Object.fromEntries(Object.entries(CROWD).map(([name, [x, z]], i) => [name, (t) => {
      if (t < T.rumbling + 2) return { visible: false };
      const rush = t >= T.ranOff - 1.5 ? { x: DOORX - 0.4 + i * 0.12, z: 0.6 + (i % 2) * 0.15 } : { x, z };   // "they all made a rush at Alice"
      const s = route(t, [[T.rumbling + 2, { x: x - 3, z, dir: 1 }], [T.rumbling + 8 + i, { x, z }], [T.ranOff - 1.5, { x, z }], [T.ranOff + 0.5, rush]], { pose: 'up', phase: t * 2 + i });
      return { ...s, scale: 1.8 }; // Chapter III's creatures, at the Rabbit's scale
    }]));

    function update(t, cast) {
      const a = alice(t);
      // The bottle near the looking-glass; in her hand when she drinks; put down.
      bottle.visible = t >= T.room && t < T.swallowed;
      if (a.pose === 'drink') bottle.visible = false; // the drinking drawing has the bottle at her lips
      if (t >= T.bottle + 3 && t < T.putDown) carry(bottle, cast.alice, { drop: 0.03 * a.scale });
      else { bottle.position.set(-0.45, ROOM.floor + 0.32, ROOM.z0 + 0.04); bottle.rotation.set(0, 0, 0); }
      // The arm: out of the window from "one arm out of the window" until she shrinks; it snatches twice.
      armPivot.visible = t >= T.arm && t < T.swallowed + 1;
      const snatch = (t0) => Math.max(0, Math.sin(Math.min(1, Math.max(0, (t - t0) / 0.8)) * Math.PI));
      armPivot.rotation.z = -1.1 + 0.6 * (snatch(T.snatch) + snatch(T.snatch2)) + Math.sin(t * 0.7) * 0.03;
      armPivot.scale.setScalar(smooth((t - T.arm) / 1.5));
      // Frames: broken from the first shriek.
      framesBroken.visible = t >= T.shriek; framesWhole.visible = !framesBroken.visible;
      lad.visible = t >= T.rumbling + 8 && t < T.ranOff + 5;
      bar.visible = t >= T.barrowful - 3;
      // Pebbles fly in and turn into cakes; she eats one.
      for (const { p, c, i } of pebs) {
        const landed = t >= T.pebbles + i * 0.15;
        const cake = smooth((t - T.cakes - i * 0.3) / 0.6);
        p.visible = landed && cake < 0.5; c.visible = landed && cake >= 0.5 && !(i === 0 && t >= T.swallowed);
      }
      const cut = cutAt(t);
      front.visible = cut === 'none'; fullCut.visible = cut === 'full'; halfCut.visible = cut === 'half'; windowWall.visible = cut === 'none';
      // The house trembles with her.
      house.position.x = t >= T.shook - 1 && t < T.shook + 4 ? Math.sin(t * 47) * 0.01 : 0;
      doorWall.position.z = (ROOM.z0 + ROOM.z1) / 2 + (t >= T.door && t < T.door + 3 ? Math.sin(t * 30) * 0.006 : 0); // the Rabbit tries the door
      think(t, { x: 0.35, y: Math.min(ROOM.ceil - 0.3, ROOM.floor + 0.9 * a.scale), z: -0.35 }, 0.45);
    }

    const IN = (pos, look) => ({ pos, look });
    // Inside: the dollhouse view, from in front of the house through its cut-away front.
    const CUT = {
      room: IN([0.1, 1.9, 2.4], [0.1, 1.75, -0.5]),          // the whole room
      door: IN([-0.35, 1.9, 1.8], [-0.45, 1.78, -0.5]),      // by the door
      table: IN([0.45, 1.88, 1.6], [0.35, 1.75, -0.4]),      // the table in the window
      glass: IN([-0.15, 1.9, 1.7], [-0.25, 1.78, -0.8]),     // the bottle by the looking-glass
      her: IN([-0.15, 1.92, 2.1], [-0.25, 1.8, -0.6]),       // filling the room
      near: IN([-0.3, 1.97, 1.4], [-0.33, 1.86, -0.6]),      // closer: her face
      both: IN([0.1, 1.95, 2.7], [-0.05, 1.82, -0.4]),       // her, and the window with her arm out of it
      floor: IN([0.0, 1.85, 1.3], [-0.1, 1.55, -0.6]),       // the pebbles turning into cakes
      small: IN([-0.3, 1.62, 0.9], [-0.33, 1.52, -0.6]),     // shrinking
    };
    const OUT = {
      wide: IN([0.3, 1.7, 7.5], [0.2, 1.6, 0]),
      door: IN([-0.6, 0.7, 2.6], [DOORX, 0.6, 0]),
      house: IN([0.6, 1.3, 5.6], [0.2, 0.7, 0]),             // the house, her in it, the arm, the yard in front
      window: IN([0.8, 1.6, 3.4], [0.35, 1.5, 0]),           // "what's that in the window?"
      frames: IN([FRAMES.x + 0.6, 0.5, 2.2], [FRAMES.x - 0.1, 0.25, FRAMES.z]),
      roof: IN([1.2, 2.7, 4.6], [0.45, 2.15, 0]),            // the roof and the chimney, and her below
      sky: IN([1.6, 1.8, 6.0], [1.4, 2.6, 0.8]),
      yard: IN([0.9, 0.45, 3.0], [0.8, 0.05, 0.6]),          // low on the yard (her window out of the picture): the crowd, Bill, the guinea-pigs
      yardWide: IN([0.0, 0.5, 3.6], [-0.2, -0.05, 0.6]),     // the cart and the crowd arriving, Bill with the other ladder
      held: IN([DOORX - 0.4, 0.45, 3.0], [DOORX - 0.5, 0.05, 0.6]),  // Bill held up by the guinea-pigs
    };
    // Cuts (dur 0) wherever the front changes, so the cut-away never appears or vanishes in view.
    const k = (t, dur, s) => ({ t, dur, ...s });
    const camera = cameraTrack([
      k(start, 0, OUT.wide), k(start + 0.5, 4, OUT.door),                            // "a neat little house" and its brass plate
      k(T.upstairs - 0.5, 0, CUT.room),                                              // in at the door upstairs
      k(T.dinah - 8, 8, CUT.door),                                                   // thinking of Dinah
      k(T.room - 2, 4, CUT.room), k(T.room + 1.5, 3, CUT.table),                     // "a tidy little room with a table in the window"
      k(T.bottle - 0.5, 3, CUT.glass),                                               // the bottle near the looking-glass
      k(T.uncorked + 3, 6, CUT.room),                                                // growing
      k(T.ceiling - 3, 4, CUT.her), k(T.putDown, 5, CUT.near),                       // the ceiling; "That's quite enough"
      k(T.kneel - 2, 5, CUT.her),                                                    // kneeling, lying down
      k(T.arm, 0, OUT.house), k(T.arm + 4, 4, OUT.window),                           // the arm out of the window
      k(T.effect, 0, CUT.both), k(T.effect + 13, 8, CUT.near),                       // "it was much pleasanter at home"
      k(T.book - 4, 6, CUT.her), k(T.book + 14, 8, CUT.near),
      k(T.voice - 4, 5, CUT.both),                                                   // a voice outside; trembling
      k(T.door - 1, 3, CUT.door),                                                    // the Rabbit at the door
      k(T.window - 1, 0, OUT.house),                                                 // round to the window
      k(T.shriek, 0, OUT.frames), k(T.shriek + 5, 0, CUT.her),                       // the shriek, the cucumber-frame
      k(T.pat - 3, 0, OUT.house), k(T.pat2 - 1, 4, OUT.window),                      // Pat; "what's that in the window?"
      k(T.pat2 + 18, 0, CUT.near),                                                   // a long silence, and whispers
      k(T.snatch2 - 1, 0, OUT.house), k(T.snatch2 + 2, 0, OUT.frames),               // the second snatch
      k(T.snatch2 + 6, 0, CUT.her),                                                  // "What a number of cucumber-frames"
      k(T.rumbling - 1, 0, OUT.yardWide), k(T.rumbling + 10, 6, OUT.house),              // the cart; Bill with the other ladder
      k(T.heads - 3, 3, OUT.roof), k(T.heads + 4, 0, CUT.near),                      // "Heads below!"
      k(T.downChimney + 3, 0, OUT.roof),                                             // Bill up the ladder to the chimney
      k(T.kick - 9, 0, CUT.her),                                                     // her foot down the chimney
      k(T.kick - 0.5, 0, OUT.sky), k(T.kick + 3.5, 0, OUT.yard),                     // "There goes Bill!" "Catch him, you by the hedge!"
      k(T.feeble + 5.5, 4, OUT.house),                                               // "Hold up his head—Brandy now"
      k(T.feeble + 14, 0, OUT.held), k(T.feeble + 24, 0, CUT.near),                  // Bill's feeble voice; "like a sky-rocket!"
      k(T.burn - 1, 0, CUT.her), k(T.dinah2 + 2, 4, CUT.near),                       // "I'll set Dinah at you!"
      k(T.barrowful - 2, 0, OUT.house),                                              // "A barrowful will do"
      k(T.pebbles - 1, 0, CUT.her),                                                  // the pebbles in at the window
      k(T.cakes - 3, 4, CUT.floor),                                                  // turning into little cakes
      k(T.swallowed, 3, CUT.her), k(T.swallowed + 3, 3, CUT.small),                  // shrinking
      k(T.ranOut - 0.5, 0, IN([DOORX - 0.3, 0.45, 2.7], [DOORX - 0.2, 0.15, 0.5])),     // out of the door, tiny; Bill held up
      k(T.held, 3, IN([DOORX - 0.35, 0.47, 2.9], [DOORX - 0.25, 0.16, 0.6])),
    ]);
    return {
      T, bg: PAPER, fog: [9, 30], bounds: { minX: -2.5, maxX: 2.5, minZ: 0.8, maxZ: 6 },
      hotspots: [
        { pos: new THREE.Vector3(DOORX, 0.9, 0.05), title: 'The brass plate', text: 'a bright brass plate with the name “W. RABBIT,” engraved upon it' },
        { pos: new THREE.Vector3(FRAMES.x, 0.3, FRAMES.z), title: 'The cucumber-frames', text: 'a crash of broken glass, from which she concluded that it was just possible it had fallen into a cucumber-frame' },
      ],
      camera, update,
      actors: (t) => ({
        alice: alice(t), rabbit: rabbit(t), pat: pat(t), bill: bill(t), pig1: helper(-1)(t), pig2: helper(1)(t),
        ...Object.fromEntries(Object.entries(crowd).map(([n, f]) => [n, f(t)])),
      }),
    };
  },
};

// --- 3. The wood ------------------------------------------------------------------------
// Everything at a three-inch Alice's scale: the grass towers, the puppy is enormous.
export const wood = {
  id: 'wood',
  title: 'The thick wood',
  start: (cue) => cue.at('wood', 1) - 1,
  parts: (cue) => [
    { title: 'An enormous puppy', t: cue.at('bark') - 1 },
    { title: 'The mushroom', t: cue.at('mushroom') - 3 },
  ],
  build({ group, ai, cue }) {
    const at = cue.at;
    const start = wood.start(cue);
    const T = {
      bark: at('bark', 1), puppy: at('puppy', 1), stick: at('stick', 1), jumped: at('puppy', 3), thistle: at('thistle', 1), tumbled: at('tumbled'),
      round: at('thistle', 2), charges: at('puppy', 5), sat: at('sat'), escape: at('ran', 1, at('sat')), buttercup: at('buttercup'),
      mushroom: at('mushroom', 1), tiptoe: at('tiptoe'), caterpillar: at('caterpillar'), end: cue.end,
    };
    outdoors(group, ai, { groundRepeat: 60 });
    // Grass as tall as trees to her, in layers.
    for (const [x, z, h, seed] of [[0, -1.2, 0.45, 1], [-0.5, -2.2, 0.6, 2], [0.6, -3, 0.7, 3], [0, 0.9, 0.3, 4]]) {
      const grass = paperFlat(tiled(ai.grass.tex, 10 / (h * ai.grass.aspect)), 10, h, { edge: false }); grass.position.set(x, 0, z);
      grass.material = grass.userData.front.material; grass.userData.front.material.map.offset.x = seed * 0.3; group.add(grass);
    }
    const TH = { x: 0.15, z: -0.35 };
    const th = paperFlat(texture(thistle()), 0.42, 0.75); th.position.set(TH.x, 0, TH.z); group.add(th);
    const BC = { x: -1.3, z: -0.2 };
    const bc = paperFlat(texture(buttercup()), 0.14, 0.33); bc.position.set(BC.x, 0, BC.z); group.add(bc);
    const MU = { x: -1.65, z: -0.45 };
    const mu = paperFlat(texture(mushroom()), 0.17, 0.177); mu.position.set(MU.x, 0, MU.z); group.add(mu);
    const C = ai['ch5/caterpillar_sit']; // the AI drawing (tools/ch5_art.py), as in Chapter V
    const cat = paperFlat(C.tex, 0.1 * C.aspect, 0.1); cat.position.set(MU.x + 0.01, 0.132, MU.z + 0.005); group.add(cat);
    const st = paperFlat(texture(stick()), 0.1, 0.015, { anchor: 'center' }); group.add(st);

    function alice(t) {
      const s = route(t, [
        [start, { x: 0.8, z: 0.2, dir: -1 }], [T.bark - 3, { x: 0.45, z: -0.05 }], [T.stick + 1, { x: 0.45, z: -0.05 }],
        [T.thistle + 1, { x: TH.x + 0.1, z: TH.z + 0.08 }],                         // "dodged behind a great thistle"
        [T.round, { x: TH.x + 0.1, z: TH.z + 0.08 }], [T.round + 2, { x: TH.x - 0.12, z: TH.z + 0.1 }],
        [T.escape, { x: TH.x - 0.12, z: TH.z + 0.1 }], [T.buttercup - 1, { x: BC.x + 0.05, z: BC.z + 0.05 }],  // ran till she was quite tired
        [T.mushroom, { x: BC.x + 0.05, z: BC.z + 0.05 }], [T.tiptoe - 1, { x: MU.x + 0.07, z: MU.z + 0.08 }],
      ], { phase: t * 3 });
      const tiptoe = t >= T.tiptoe ? smooth((t - T.tiptoe) / 1) * 0.02 : 0;
      // AI poses (2026-10-14): holding out the stick; leaning on the buttercup, fanning herself; on tiptoe.
      let pose = 'stand';
      if (!s.moving && t >= T.stick && t < T.jumped + 0.5) pose = 'stick';
      if (!s.moving && t >= T.buttercup && t < T.mushroom) pose = 'buttercup';
      if (!s.moving && t >= T.tiptoe) pose = 'tiptoe';
      return { ...s, pose, scale: TINY, y: tiptoe * 0.3, dir: pose === 'stick' ? 1 : t >= T.tiptoe - 1 ? -1 : s.dir };
    }
    const PUP = { x: 1.0, z: -0.9 };
    function puppy(t) {
      if (t < T.bark - 1) return { visible: false };
      const charge = t >= T.charges && t < T.sat ? (Math.sin((t - T.charges) * 1.3) > 0 ? 0.15 : -0.1) * Math.sin((t - T.charges) * 2.6) : 0; // "a very little way forwards … a long way back"
      const s = route(t, [
        [T.bark - 1, PUP], [T.jumped, PUP], [T.jumped + 1, { x: 0.65, z: -0.6 }],       // rushed at the stick
        [T.tumbled, { x: 0.55, z: -0.55 }], [T.charges, { x: 0.75, z: -0.75 }], [T.sat, { x: 0.95 + charge, z: -0.85 }], [T.sat + 3, { x: 1.6, z: -1.6 }],
      ], { phase: t * 1.5 });
      const jump = t >= T.jumped && t < T.jumped + 0.8 ? Math.sin(((t - T.jumped) / 0.8) * Math.PI) * 0.25 : 0; // "jumped into the air off all its feet at once"
      const tumble = t >= T.tumbled && t < T.tumbled + 1.2 ? ((t - T.tumbled) / 1.2) * Math.PI * 2 : 0;       // "tumbled head over heels"
      // AI poses (2026-10-14): crouching, jumping "off all its feet at once", tumbling, sitting panting.
      let pose = t >= T.sat + 3 ? 'sit' : 'stand';
      if (jump > 0) pose = 'jump';
      if (tumble > 0) pose = 'tumble';
      return { ...s, x: s.x + charge, pose, y: jump, tilt: tumble, dir: -1, visible: t < T.escape + 6 };
    }
    function update(t, cast) {
      st.visible = t >= T.stick && t < T.escape;
      if (t < T.jumped + 1) { carry(st, cast.alice, { tilt: 0.3 }); if (cast.alice.pose === 'stick') st.visible = false; } // the drawing holds its own stick
      else { st.position.set(0.5, 0.01, -0.45); st.rotation.set(-1.4, 0, 0.2); }
      cat.visible = true;
    }
    const camera = cameraTrack([
      { t: start, dur: 0, pos: [0.9, 0.12, 0.7], look: [0.4, 0.15, -0.5] },                   // among grass taller than she is
      { t: T.bark - 0.5, dur: 1.5, pos: [0.7, 0.07, 0.35], look: [0.8, 0.45, -0.8] },          // "a little sharp bark just over her head"
      { t: T.stick, dur: 3, pos: [0.15, 0.18, 0.8], look: [0.6, 0.25, -0.5] },
      { t: T.thistle - 1, dur: 3, pos: [0.2, 0.25, 1.1], look: [0.4, 0.25, -0.5] },             // the thistle and the puppy
      { t: T.sat, dur: 4, pos: [0.0, 0.2, 1.2], look: [0.7, 0.25, -0.9] },
      { t: T.escape, dur: 6, pos: [-0.6, 0.15, 0.6], look: [-1.2, 0.08, -0.2] },               // running till she was quite tired
      { t: T.buttercup - 1, dur: 3, pos: [-1.05, 0.12, 0.25], look: [BC.x, 0.12, BC.z] },       // leaning against a buttercup
      { t: T.mushroom - 1, dur: 4, pos: [-1.35, 0.11, 0.2], look: [MU.x, 0.1, MU.z] },          // the mushroom
      { t: T.caterpillar - 1, dur: 2, pos: [-1.4, 0.16, 0.05], look: [MU.x + 0.02, 0.1, MU.z] },       // eyes met those of a large blue caterpillar
    ]);
    return {
      T, bg: PAPER, fog: [6, 24], bounds: null, hotspots: [],
      camera, update, actors: (t) => ({ alice: alice(t), puppy: puppy(t) }),
    };
  },
};

export const CHAPTER_4 = [lane, rabbitHouse, wood];
