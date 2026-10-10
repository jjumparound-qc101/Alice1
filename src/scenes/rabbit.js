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
  HOUSE_PX, houseFront, roomWall, windowTable, plainBottle, giantArm, cucumberFrames, ladder, barrow, pebble, littleCake,
  thistle, buttercup, mushroom, caterpillar, stick, dinahNurseVignette, bookVignette,
} from '../props4.js';
import { thoughts } from '../thoughts.js';
import { carry } from '../puppet.js';
import { smooth, lerp, route, cameraTrack } from '../track.js';

const MAID = 0.5;    // Alice's size here: small enough to be taken for the Rabbit's housemaid
const TINY = 0.13;   // after the little cakes: about three inches
const tiled = (t, rx, ry = 1) => { t = t.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.needsUpdate = true; return t; };
const plain = (map, opts = {}) => new THREE.MeshBasicMaterial({ map, ...opts });

// Ground, sky and far trees for the two outdoor scenes.
function outdoors(group, ai, { groundRepeat = 14 } = {}) {
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), plain(texture(art.groundTile(), { repeat: [groundRepeat, groundRepeat] })));
  floor.rotation.x = -Math.PI / 2; group.add(floor);
  const sky = paperFlat(tiled(ai.sky.tex, 40 / (14 * ai.sky.aspect)), 40, 14, { edge: false, opaque: true });
  sky.position.set(0, -0.5, -14); group.add(sky);
  const far = paperFlat(tiled(ai.treeline.tex, 34 / (3.2 * ai.treeline.aspect)), 34, 3.2, { edge: false });
  far.position.set(0, 0, -12); group.add(far);
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
      ], { pose: 'watch', phase: t * 1.6 });
      const pointing = t >= T.mary && t < T.ran + 2;
      return { ...s, dir: pointing ? -1 : s.dir, tilt: pointing ? -0.12 : s.moving ? 0 : Math.sin(t * 1.3) * 0.08 }; // looking about
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
      return { ...s, pose: 'stand', scale: MAID, tilt: hunting ? 0.25 * (s.dir ?? 1) : 0, visible: t < T.house - 1 };
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
      ceiling: at('ceiling'), putDown: at('bottle', 3), kneel: at('kneel'), lying: at('lying'), arm: at('arm', 2), effect: at('bottle', 4),
      book: at('book'), voice: at('voice'), shook: at('house', 4), door: at('door', 3), window: at('window', 4), snatch: at('snatch', 1),
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
    wall('window', RW, [(ROOM.x0 + ROOM.x1) / 2, ROOM.floor + RH / 2, ROOM.z1 - 0.01], Math.PI);
    wall('fire', RW, [(ROOM.x0 + ROOM.x1) / 2, ROOM.floor + RH / 2, ROOM.z0], 0);
    const doorWall = wall('door', RD, [ROOM.x0, ROOM.floor + RH / 2, (ROOM.z0 + ROOM.z1) / 2], Math.PI / 2);
    wall('fire', RD, [ROOM.x1, ROOM.floor + RH / 2, (ROOM.z0 + ROOM.z1) / 2], -Math.PI / 2);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), plain(texture(flagstones(), { repeat: [3, 2] })));
    floor.rotation.x = -Math.PI / 2; floor.position.set((ROOM.x0 + ROOM.x1) / 2, ROOM.floor + 0.002, (ROOM.z0 + ROOM.z1) / 2); house.add(floor);
    const ceil = floor.clone(); ceil.rotation.x = Math.PI / 2; ceil.position.y = ROOM.ceil; house.add(ceil);
    const table = paperFlat(texture(windowTable()), 0.5, 0.375); table.position.set(0.55, ROOM.floor, ROOM.z1 - 0.12); house.add(table);
    const bottle = paperFlat(texture(plainBottle()), 0.04, 0.08); house.add(bottle);
    // Outside: the cucumber-frames under the window, and later the ladders, the barrow.
    const framesWhole = paperFlat(texture(cucumberFrames(false)), 1.4, 0.44), framesBroken = paperFlat(texture(cucumberFrames(true)), 1.4, 0.44);
    for (const f of [framesWhole, framesBroken]) { f.position.set(FRAMES.x, 0, FRAMES.z); group.add(f); }
    const lad = paperFlat(texture(ladder()), 0.5, HH + 0.1); lad.position.set(HW / 2 - 0.25, 0, 0.25); lad.rotation.x = -0.08; group.add(lad);
    const bar = paperFlat(texture(barrow()), 0.6, 0.33); bar.position.set(-1.0, 0, 1.6); group.add(bar);
    // Her arm out of the window, hanging down the front of the house.
    const arm = paperFlat(texture(giantArm()), 1.5, 0.5, { anchor: 'center' });
    const armPivot = new THREE.Group(); armPivot.position.set((WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, 0.06); arm.position.x = 0.7; armPivot.add(arm); group.add(armPivot);
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
    const GROWN = 1.55;
    const scaleAt = (t) => {
      if (t < T.swallowed) return lerp(MAID, GROWN, smooth((t - T.uncorked - 2) / (T.effect - T.uncorked - 2)));
      return lerp(GROWN, TINY, smooth((t - T.swallowed - 1) / 4));
    };
    const MID = { x: 0.05, z: -0.55 };
    function alice(t) {
      const scale = scaleAt(t);
      if (t < T.upstairs) { // to the door and in
        const s = route(t, [[start, { x: DOORX - 1.6, z: 1.6, dir: 1 }], [T.upstairs - 1.5, { x: DOORX, z: 0.15 }]], { phase: t * 2.2 });
        return { ...s, pose: 'stand', scale, visible: t < T.upstairs - 1.2 };
      }
      if (t >= T.ranOut) { // out of the door, small, and away "as hard as she could"
        const s = route(t, [[T.ranOut, { x: DOORX, z: 0.15, dir: -1 }], [T.held - 1, { x: DOORX - 0.2, z: 0.6 }], [T.ranOff, { x: DOORX - 0.2, z: 0.6 }], [T.ranOff + 3, { x: -3.5, z: 2.2 }]], { phase: t * 3 });
        return { ...s, pose: 'stand', scale, y: 0 };
      }
      // Inside: in from the door, to the table, then growing until she fills the room.
      const s = route(t, [
        [T.upstairs, { x: ROOM.x0 + 0.1, z: -0.5, dir: 1 }], [T.room, { x: 0.35, z: ROOM.z1 - 0.3 }], [T.bottle, { x: 0.35, z: ROOM.z1 - 0.3 }],
        [T.bottle + 3, { x: -0.25, z: ROOM.z0 + 0.3, dir: -1 }], [T.putDown, { x: -0.25, z: ROOM.z0 + 0.3 }], [T.kneel, MID],
      ], { phase: t * 2.2 });
      const lying = smooth((t - T.lying) / 3) * (1 - smooth((t - T.swallowed - 1) / 2));
      const big = scale * 1.25 > RH;
      const pose = t >= T.kneel ? 'sit' : 'stand';
      const stoop = !lying && big && t < T.kneel ? Math.min(0.5, (scale * 1.25 - RH) * 2) : 0; // "had to stoop to save her neck"
      const trembling = t >= T.shook - 1 && t < T.shook + 4 ? Math.sin(t * 50) * 0.02 : 0;
      const pelted = t >= T.pebbles && t < T.pebbles + 4 ? Math.sin(t * 30) * 0.04 : 0;
      return { ...s, pose, scale, y: ROOM.floor, tilt: lying * 1.1 + stoop + trembling + pelted, dir: t >= T.kneel ? 1 : s.dir };
    }

    // --- The Rabbit, Pat, Bill and the crowd outside ---------------------------------
    const UNDER = { x: FRAMES.x - 0.2, z: 0.55 };
    function rabbit(t) {
      if (t < T.window - 1) return { visible: false };
      const fell = t >= T.shriek;
      const s = route(t, [
        [T.window - 1, { x: DOORX + 0.3, z: 1.0, dir: 1 }], [T.window + 4, UNDER],      // "round … to the window"
        [T.shriek, UNDER], [T.shriek + 0.4, { x: FRAMES.x, z: FRAMES.z + 0.02 }],          // into a cucumber-frame
        [T.pat + 8, { x: FRAMES.x, z: FRAMES.z + 0.02 }], [T.pat + 12, { x: FRAMES.x - 0.6, z: 1.5 }],
        [T.snatch2 - 1, { x: FRAMES.x - 0.6, z: 1.5 }], [T.rumbling + 3, { x: -0.6, z: 1.9 }],
        [T.ranOut, { x: -0.6, z: 1.9 }], [T.held, { x: DOORX - 0.6, z: 1.0 }],
      ], { pose: 'watch', phase: t * 2.4 });
      const tumble = fell && t < T.pat + 10 ? Math.min(1, (t - T.shriek) / 0.4) : 0;
      return { ...s, tilt: tumble * 1.2, y: -tumble * 0.12, dir: t > T.pat + 12 && !s.moving ? 1 : s.dir };
    }
    function pat(t) {
      if (t < T.pat + 1) return { visible: false };
      const s = route(t, [[T.pat + 1, { x: 2.6, z: 1.6, dir: -1 }], [T.pat2, { x: FRAMES.x + 0.5, z: 1.1 }], [T.snatch2 - 3, { x: FRAMES.x + 0.15, z: 0.6 }],
        [T.snatch2 + 0.4, { x: FRAMES.x + 0.25, z: FRAMES.z + 0.02 }], [T.snatch2 + 8, { x: FRAMES.x + 0.25, z: FRAMES.z + 0.02 }], [T.rumbling + 5, { x: 1.6, z: 2.0 }]], { pose: 'spade', phase: t * 2.4 });
      const fell = t >= T.snatch2 + 0.2 && t < T.snatch2 + 8 ? 1 : 0;
      return { ...s, tilt: fell * -1.1, y: -fell * 0.08 };
    }
    const ROOF = { x: CHIMNEY.x, z: 0.05 };
    function bill(t) {
      if (t < T.rumbling) return { visible: false };
      if (t < T.kick) {
        const s = route(t, [[T.rumbling, { x: -2.4, z: 2.0, dir: 1 }], [T.heads - 4, { x: HW / 2 - 0.25, z: 0.45 }], [T.downChimney + 4, { x: HW / 2 - 0.25, z: 0.45 }], [T.kick - 6, ROOF]], { pose: 'stand', phase: t * 2.4 });
        const climb = smooth((t - T.downChimney - 4) / 8); // up the ladder and over the roof to the chimney
        return { ...s, y: climb * (HH - 0.05), visible: t < T.kick - 5 };
      }
      if (t < T.kick + 3) { // "up I goes like a sky-rocket!" and down by the hedge
        const k = (t - T.kick) / 3;
        return { pose: 'fly', x: lerp(CHIMNEY.x, 2.4, k), z: lerp(0.05, 2.2, k), y: HH + 0.2 + 2.5 * 4 * k * (1 - k) - k * k * HH * 0.9, tilt: k * 6, dir: 1 };
      }
      const held = { x: DOORX + 0.5, z: 1.1 };
      const s = route(t, [[T.kick + 3, { x: 2.4, z: 2.2 }], [T.feeble - 2, { x: 2.4, z: 2.2 }], [T.feeble + 2, held]], { pose: 'stand', phase: t * 1.5 });
      return { ...s, tilt: t < T.feeble ? -1.4 : 0.3, y: t >= T.feeble ? 0.06 : 0 }; // limp, held up
    }
    const helper = (side) => (t) => {
      if (t < T.kick + 3) return { visible: false };
      const s = route(t, [[T.kick + 3, { x: 2.4 + side * 0.3, z: 2.4 }], [T.feeble - 2, { x: 2.4 + side * 0.22, z: 2.25 }], [T.feeble + 2, { x: DOORX + 0.5 + side * 0.2, z: 1.12 }]], { pose: 'up', phase: t * 2 });
      return { ...s, dir: -side };
    };
    const CROWD = { duck: [-1.6, 2.2], lory: [-1.2, 2.6], eaglet: [1.1, 2.5], owl: [0.6, 2.8], magpie: [-0.4, 2.7], canary: [1.8, 2.7] };
    const crowd = Object.fromEntries(Object.entries(CROWD).map(([name, [x, z]], i) => [name, (t) => {
      if (t < T.rumbling + 2) return { visible: false };
      const rush = t >= T.ranOff - 1.5 ? { x: DOORX - 0.4 + i * 0.12, z: 0.9 + (i % 2) * 0.2 } : { x, z };   // "they all made a rush at Alice"
      const s = route(t, [[T.rumbling + 2, { x: x - 3, z, dir: 1 }], [T.rumbling + 8 + i, { x, z }], [T.ranOff - 1.5, { x, z }], [T.ranOff + 0.5, rush]], { pose: 'up', phase: t * 2 + i });
      return { ...s, scale: 1.8 }; // Chapter III's creatures, at the Rabbit's scale
    }]));

    function update(t, cast) {
      const a = alice(t);
      // The bottle near the looking-glass; in her hand when she drinks; put down.
      bottle.visible = t >= T.room && t < T.swallowed;
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
      // The house trembles with her.
      house.position.x = t >= T.shook - 1 && t < T.shook + 4 ? Math.sin(t * 47) * 0.01 : 0;
      doorWall.position.z = (ROOM.z0 + ROOM.z1) / 2 + (t >= T.door && t < T.door + 3 ? Math.sin(t * 30) * 0.006 : 0); // the Rabbit tries the door
      think(t, { x: 0.35, y: Math.min(ROOM.ceil - 0.3, ROOM.floor + 0.9 * a.scale), z: -0.35 }, 0.45);
    }

    const IN = (pos, look) => ({ pos, look });
    const inside = {
      door: IN([0.85, 1.85, -0.15], [ROOM.x0, 1.75, -0.6]),
      table: IN([-0.1, 1.85, -0.75], [0.5, 1.75, ROOM.z1]),
      glass: IN([0.55, 1.8, -0.2], [-0.45, 1.75, ROOM.z0]),
      wide: IN([-0.68, 2.2, -0.1], [0.4, 1.75, -0.75]),   // from the door corner: the table stays out of the lens
      low: IN([-0.68, 1.6, -0.12], [0.3, 1.95, -0.7]),
    };
    const OUT = {
      wide: IN([0.3, 1.7, 7.5], [0.2, 1.6, 0]),
      door: IN([-0.6, 0.7, 2.6], [DOORX, 0.6, 0]),
      window: IN([FRAMES.x + 0.9, 1.0, 2.9], [FRAMES.x - 0.2, 1.0, 0.3]),
      frames: IN([FRAMES.x + 0.6, 0.5, 2.2], [FRAMES.x - 0.1, 0.25, FRAMES.z]),
      roof: IN([1.6, HH + 0.4, 3.4], [CHIMNEY.x, HH - 0.2, 0]),
      sky: IN([1.6, 1.8, 6.0], [1.4, 2.6, 0.8]),
      crowd: IN([0.2, 0.9, 4.6], [0.3, 0.4, 1.2]),
    };
    const k = (t, dur, s) => ({ t, dur, ...s });
    const camera = cameraTrack([
      k(start, 0, OUT.wide), k(start + 0.5, 4, OUT.door),                            // "a neat little house" and its brass plate
      k(T.upstairs - 0.5, 0, inside.door), k(T.room - 1, 3, inside.table),           // "a tidy little room with a table in the window"
      k(T.bottle - 1, 2, inside.glass),                                              // the bottle near the looking-glass
      k(T.uncorked + 4, 4, inside.wide), k(T.kneel, 6, inside.low),                  // growing, and growing
      k(T.arm + 2, 2, OUT.window),                                                   // the arm out of the window
      k(T.effect, 3, inside.low),                                                    // "what will become of me?"
      k(T.voice - 1, 2, inside.door),                                                // "Mary Ann! Mary Ann!"
      k(T.shook - 1, 1, inside.wide),
      k(T.window - 1, 2, OUT.window), k(T.shriek, 1, OUT.frames),                    // the snatch, and the cucumber-frame
      k(T.pat - 1, 3, OUT.window), k(T.snatch2 - 1, 1, OUT.frames),
      k(T.snatch2 + 6, 3, inside.low),                                               // waiting
      k(T.rumbling, 4, OUT.crowd), k(T.heads - 2, 3, OUT.wide),                      // the cart, the ladders, "Heads below!"
      k(T.downChimney, 3, OUT.roof),                                                 // Bill to the chimney
      k(T.kick - 4, 2, inside.low),                                                  // her foot up the chimney
      k(T.kick, 0.5, OUT.sky),                                                       // "There goes Bill!"
      k(T.feeble - 3, 3, OUT.crowd),
      k(T.burn, 2, inside.wide),                                                     // "If you do, I'll set Dinah at you!"
      k(T.barrowful - 1, 3, OUT.crowd), k(T.pebbles - 0.5, 1, inside.low),           // the pebbles
      k(T.cakes, 2, IN([0.6, 1.62, -0.15], [0.0, ROOM.floor, -0.6])),                // turning into little cakes
      k(T.swallowed + 1, 3, inside.wide),
      k(T.ranOut - 0.5, 0, IN([DOORX + 0.5, 0.25, 1.4], [DOORX, 0.12, 0.2])),        // out of the door, tiny, and the crowd
      k(T.held, 3, IN([DOORX + 0.9, 0.3, 1.9], [DOORX + 0.1, 0.15, 0.9])),
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
    const cat = paperFlat(texture(caterpillar()), 0.07, 0.05); cat.position.set(MU.x + 0.01, 0.158, MU.z + 0.005); group.add(cat);
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
      return { ...s, pose: 'stand', scale: TINY, y: tiptoe, tilt: t >= T.buttercup && t < T.mushroom ? 0.15 : 0, dir: t >= T.tiptoe - 1 ? -1 : s.dir };
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
      return { ...s, x: s.x + charge, pose: t >= T.sat + 3 ? 'sit' : 'stand', y: jump, tilt: tumble, dir: -1, visible: t < T.escape + 6 };
    }
    function update(t, cast) {
      st.visible = t >= T.stick && t < T.escape;
      if (t < T.jumped + 1) carry(st, cast.alice, { tilt: 0.3 });
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
      { t: T.caterpillar - 1, dur: 2, pos: [-1.55, 0.2, -0.2], look: [MU.x, 0.17, MU.z] },      // eyes met those of a large blue caterpillar
    ]);
    return {
      T, bg: PAPER, fog: [6, 24], bounds: null, hotspots: [],
      camera, update, actors: (t) => ({ alice: alice(t), puppy: puppy(t) }),
    };
  },
};

export const CHAPTER_4 = [lane, rabbitHouse, wood];
