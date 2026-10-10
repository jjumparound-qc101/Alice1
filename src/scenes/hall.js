// Scene 4: the hall, from "she found herself in a long, low hall" to the end of the chapter:
// the doors, the glass table and golden key, the curtain and little door, the garden,
// "DRINK ME", shrinking, the forgotten key, crying, and "EAT ME".
import * as THREE from 'three';
import { paperFlat, halo } from '../stage.js';
import { texture, canvas, INK, PAPER } from '../ink.js';
import { SPOT, hallWall, earth, garden, goldenKey, drinkMeBottle, eatMeCake, pokerVignette, knifeVignette, poisonVignette, candleVignette } from '../props.js';
import { thoughts } from '../thoughts.js';
import { smooth, lerp, route, step, cameraTrack } from '../track.js';

const HALL_W = 12, HALL_D = 6, H = 3.2;
const TABLE = { x: 0.4, z: -1.1, top: 0.92, r: 0.42 };
const DOOR = { x: 4.5, z: -2.97, w: 0.21, h: 0.4 }; // the leaf: "about fifteen inches high"

// Glass reads as a pale, see-through solid with inked edges.
function glass(geometry) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: '#e6eeee', transparent: true, opacity: 0.28, depthWrite: false })));
  g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 20), new THREE.LineBasicMaterial({ color: INK })));
  return g;
}

export const hall = {
  id: 'hall',
  title: 'The hall',
  turn: 'dark', // from the dark passage: black, then the lamps light the hall
  start: (cue) => cue.at('hall', 1) - 1.5,

  build({ group, ai, cue, hallMeta }) {
    const at = cue.at;
    const start = hall.start(cue);
    const T = {
      hall: at('hall', 1), lamps: at('lamps'), doors: at('doors', 1), table: at('three-legged'),
      key: at('key', 1), tryKey: at('key', 2), curtain: at('curtain'), fits: at('key', 3),
      knelt: at('knelt'), waiting: cue.para('There seemed to be no use'), backToTable: at('table', 2),
      bottle: at('bottle', 1), poker: at('poker'), finger: at('finger'), bleeds: at('bleeds'),
      poison: at('poison', 2), notMarked: at('poison', 3), candle: at('candle', 1), blownOut: at('candle', 3), ventured: at('ventured'),
      drunk: at('finished', 1), telescope: at('telescope', 1, at('ventured')), decided: at('decided'), forgotten: at('forgotten', 2),
      legs: at('legs'), sat: at('sat'), scold: cue.para('“Come, there’s no use'), box: at('box', 2), // #1 is "box her own ears"
      ate: cue.para('She ate a little bit'), finished: at('finished', 2),
    };

    // --- The set ---------------------------------------------------------------
    const plain = (map) => new THREE.MeshBasicMaterial({ map });
    const back = new THREE.Mesh(new THREE.PlaneGeometry(HALL_W, H), plain(texture(hallWall(7))));
    back.position.set(0, H / 2, -3); group.add(back);
    const sideTex = texture(hallWall(3));
    for (const s of [-1, 1]) {
      const side = new THREE.Mesh(new THREE.PlaneGeometry(HALL_D, H), plain(sideTex));
      side.rotation.y = -s * Math.PI / 2; side.position.set(s * HALL_W / 2, H / 2, 0); group.add(side);
    }
    const floorTex = ai['hall/floor'].tex;
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(HALL_W / 2.4, HALL_D / 2.4); // one drawing is about 2.4 m of floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(HALL_W, HALL_D), plain(floorTex));
    floor.rotation.x = -Math.PI / 2; group.add(floor);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(HALL_W, HALL_D), plain(texture(earth(13, 0.5), { repeat: [4, 2] })));
    ceil.rotation.x = Math.PI / 2; ceil.position.y = H; group.add(ceil);
    // "lit up by a row of lamps hanging from the roof"
    const LAMP_H = 1.1;
    for (let x = -4; x <= 4; x += 2) {
      const l = paperFlat(ai['hall/lamp'].tex, LAMP_H * ai['hall/lamp'].aspect, LAMP_H, { anchor: 'center' });
      l.position.set(x, H - LAMP_H / 2, -1.7); group.add(l);
    }

    // "a little three-legged table, all made of solid glass", modelled after the AI drawing
    // (source/ai/glass_table.webp): a thick rimmed top, collars under it, and slender legs
    // that bow outward to curled feet. Glass stays 3D because the camera circles it and
    // later looks up through it at the key.
    const table = new THREE.Group();
    const top = glass(new THREE.CylinderGeometry(TABLE.r, TABLE.r, 0.035, 48));
    top.position.y = TABLE.top; table.add(top);
    const rim = glass(new THREE.CylinderGeometry(TABLE.r * 0.97, TABLE.r * 0.97, 0.03, 48));
    rim.position.y = TABLE.top - 0.03; table.add(rim);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.3;
      const out = (r) => [Math.cos(a) * r, Math.sin(a) * r];
      const at = (r, y) => { const [x, z] = out(r); return new THREE.Vector3(x, y, z); };
      const R = TABLE.r * 0.72, base = TABLE.top - 0.045;
      const curve = new THREE.CatmullRomCurve3([
        at(R, base), at(R * 0.96, base * 0.75), at(R * 1.0, base * 0.4), at(R * 1.18, base * 0.12), at(R * 1.4, 0.015),
      ]);
      table.add(glass(new THREE.TubeGeometry(curve, 24, 0.02, 8, false)));
      const collar = glass(new THREE.CylinderGeometry(0.035, 0.028, 0.03, 12));
      collar.position.copy(at(R, base)); table.add(collar);
    }
    table.position.set(TABLE.x, 0, TABLE.z); group.add(table);

    const KEY = { w: 0.12, h: 0.045 }; // "a tiny golden key"
    const key = paperFlat(texture(goldenKey()), KEY.w, KEY.h, { anchor: 'center' });
    key.add(halo(SPOT.gold, KEY.w * 1.6, 0.4)); // a slight glow
    const bottle = paperFlat(texture(drinkMeBottle()), 0.11, 0.22);
    const box = glass(new THREE.BoxGeometry(0.24, 0.12, 0.18));
    const cake = paperFlat(texture(eatMeCake()), 0.15, 0.094);
    group.add(key, bottle, box, cake);

    // Behind the curtain: the little door in its frame, and the garden seen through it,
    // clipped to the door's arch. The frame stays on the wall; the leaf swings on its hinges.
    const L = hallMeta.door.leaf;
    const frameW = DOOR.w / (L.x1 - L.x0), frameH = DOOR.h / (1 - L.top);
    const frame = paperFlat(ai['hall/door_frame'].tex, frameW, frameH, { edge: false });
    frame.position.set(DOOR.x + (0.5 - (L.x0 + L.x1) / 2) * frameW, 0, DOOR.z + 0.004); group.add(frame);
    const view = canvas(600, Math.round(600 * DOOR.h / DOOR.w));
    view.g.beginPath();
    L.arch.forEach(([u, v], i) => view.g[i ? 'lineTo' : 'moveTo'](u * view.c.width, v * view.c.height));
    view.g.clip();
    view.g.drawImage(garden(), 0, 0, view.c.width, view.c.height);
    const gardenView = paperFlat(texture(view.c), DOOR.w, DOOR.h, { edge: false });
    gardenView.position.set(DOOR.x, 0, DOOR.z - 0.005); group.add(gardenView);
    const hinge = new THREE.Group();
    hinge.position.set(DOOR.x - DOOR.w / 2, 0, DOOR.z + 0.006);
    const door = paperFlat(ai['hall/door_leaf'].tex, DOOR.w, DOOR.h);
    door.position.x = DOOR.w / 2; hinge.add(door); group.add(hinge);
    // "a low curtain she had not noticed before"
    const CURTAIN_W = 1.1;
    const curt = paperFlat(ai['hall/curtain'].tex, CURTAIN_W, CURTAIN_W / ai['hall/curtain'].aspect);
    group.add(curt);

    // "the simple rules their friends had taught them", and later the candle going out.
    const think = thoughts(group, [
      { t0: T.poker - 2, t1: T.finger - 0.3, art: pokerVignette() },
      { t0: T.finger - 0.3, t1: T.poison - 1.2, art: knifeVignette() },
      { t0: T.poison - 1.2, t1: T.notMarked - 0.5, art: poisonVignette() },
      { t0: T.candle - 1.5, t1: T.blownOut + 2, art: candleVignette() },
    ]);

    // --- Alice -----------------------------------------------------------------
    const AT_TABLE = { x: TABLE.x - 0.6, z: TABLE.z + 0.2 };
    const AT_DOOR = { x: DOOR.x - 0.55, z: DOOR.z + 0.45 };
    const BY_LEG = { x: TABLE.x + 0.12, z: TABLE.z + 0.3 };
    const scaleAt = (t) => lerp(1, 0.2, smooth((t - T.telescope) / 3.6)); // "now only ten inches high"

    const walk = (t) => route(t, [
      [start, { x: -5.4, z: 0.6, dir: 1 }],
      [T.doors, { x: -4, z: -2.3 }],          // "doors all round the hall, but they were all locked"
      [T.doors + 4, { x: -2, z: -2.3 }],
      [T.doors + 8, { x: 0.5, z: -2.3 }],
      [T.doors + 12, { x: 2.5, z: -2.3 }],
      [T.table + 1.5, AT_TABLE],
      [T.tryKey, AT_TABLE],
      [T.tryKey + 3, { x: -2.5, z: -2.4 }],    // tries the key in the doors
      [T.curtain, { x: AT_DOOR.x - 0.4, z: AT_DOOR.z }],
      [T.curtain + 1.5, AT_DOOR],
      [T.waiting, AT_DOOR],
      [T.backToTable, AT_TABLE],
      [T.decided, AT_TABLE],
      [T.decided + 6, AT_DOOR],                // off to the garden, small now
      [T.forgotten, AT_DOOR],
      [T.forgotten + 5, BY_LEG],
      [T.box, BY_LEG],
      [T.box + 2.5, { x: TABLE.x - 0.05, z: TABLE.z + 0.45 }],
    ], { phase: t * 2.2 });

    function alice(t) {
      const s = walk(t);
      const scale = scaleAt(t);
      const kneeling = t >= T.knelt && t < T.waiting;
      const crying = t >= T.sat && t < T.scold;
      let y = 0;
      if (t >= T.legs && t < T.sat) y = Math.abs(Math.sin((t - T.legs) * 1.6)) * 0.12; // climbs the leg, slips back
      return { ...s, pose: kneeling || crying ? 'sit' : 'stand', scale, y, moving: s.moving || (y > 0.01 && !crying) };
    }

    // Things she carries sit at the hand drawn in her current pose, in front of her card,
    // turned with her toward the camera. `drop` lowers a bottom-anchored prop into the grip.
    const held = new THREE.Vector3();
    function carry(obj, puppet, { drop = 0, tilt = 0 } = {}) {
      puppet.handPoint(held);
      obj.position.set(held.x, held.y - drop * puppet.root.scale.y, held.z);
      obj.rotation.set(0, puppet.root.rotation.y, tilt);
    }
    const rest = (obj, x, y, z) => { obj.position.set(x, y, z); obj.rotation.set(0, 0, 0); };

    function update(t, cast) {
      const a = alice(t);
      // The key: on the table, then in her hand from "key" until she goes back to the table.
      if (t >= T.key && t < T.backToTable) carry(key, cast.alice, { tilt: -0.6 });
      else rest(key, TABLE.x + 0.12, TABLE.top + 0.015 + KEY.h / 2, TABLE.z + 0.08);
      // The curtain is drawn aside; the little door opens while she's there, and shuts once she gives up waiting.
      curt.position.set(DOOR.x + (t >= T.curtain ? 0.85 : 0), 0, DOOR.z + 0.03);
      const open = smooth((t - T.fits) / 1.2) * (1 - smooth((t - T.waiting - 2) / 1.2));
      hinge.rotation.y = -1.7 * open;
      // The bottle appears on the table, is drunk, and is gone.
      bottle.visible = t >= T.bottle - 0.5 && t < T.drunk + 0.5;
      if (t >= T.bottle + 1 && t < T.drunk + 0.5) carry(bottle, cast.alice, { drop: 0.08 });
      else rest(bottle, TABLE.x - 0.12, TABLE.top + 0.015, TABLE.z + 0.05);
      // Her thoughts, above and beside her head, sized to her.
      think(t, { x: a.x - 0.2 * a.scale, y: (a.y ?? 0) + 1.75 * a.scale, z: a.z + 0.15 }, Math.max(a.scale, 0.35));
      // Under the table: the little glass box and the cake.
      box.visible = cake.visible = t >= T.box - 0.5;
      box.position.set(TABLE.x - 0.05, 0.06, TABLE.z + 0.25);
      if (t >= T.ate && t < T.finished) carry(cake, cast.alice, { drop: 0.04 });
      else rest(cake, TABLE.x - 0.05, 0.005, TABLE.z + 0.25);
      if (t >= T.finished) cake.visible = false;
    }

    const camera = cameraTrack([
      { t: start, dur: 0, pos: [-4.4, 1.35, 2.6], look: [-1, 1.2, -3] },
      { t: T.lamps - 0.5, dur: 3, pos: [-2.4, 1.0, 2.6], look: [0, 2.3, -2] },        // the lamps
      { t: T.doors, dur: 3, pos: [-3.2, 1.3, 1.2], look: [-3, 1.0, -3] },               // the locked doors
      { t: T.doors + 5, dur: 7, pos: [1.6, 1.3, 1.5], look: [1.6, 0.9, -3] },
      { t: T.table - 0.5, dur: 2.5, pos: [1.6, 1.25, 0.7], look: [TABLE.x, 0.85, TABLE.z] },
      { t: T.key - 1, dur: 2, pos: [1.25, 1.2, -0.3], look: [TABLE.x - 0.1, 0.92, TABLE.z] }, // the golden key
      { t: T.tryKey, dur: 3, pos: [-1.2, 1.3, 1.0], look: [-2.5, 1.0, -3] },
      { t: T.curtain - 1.5, dur: 3, pos: [3.2, 0.9, -0.3], look: [DOOR.x, 0.4, DOOR.z] },
      { t: T.fits, dur: 2, pos: [4.95, 0.5, -1.6], look: [DOOR.x - 0.05, 0.22, DOOR.z] },
      { t: T.knelt, dur: 3, pos: [DOOR.x - 0.02, 0.22, DOOR.z + 0.55], look: [DOOR.x, 0.2, DOOR.z - 0.5] }, // the garden
      { t: T.waiting - 6, dur: 3, pos: [3.3, 1.0, 0.1], look: [DOOR.x - 0.2, 0.5, DOOR.z] },
      { t: T.waiting, dur: 4, pos: [1.7, 1.2, 0.6], look: [TABLE.x + 0.3, 0.9, TABLE.z] },
      { t: T.bottle - 1, dur: 2, pos: [1.3, 1.1, -0.2], look: [TABLE.x - 0.2, 0.95, TABLE.z] }, // DRINK ME
      { t: T.poker - 2, dur: 2, pos: [1.6, 1.6, 1.4], look: [AT_TABLE.x, 1.5, AT_TABLE.z] }, // the poker
      { t: T.notMarked - 0.5, dur: 2, pos: [1.6, 1.1, 0.5], look: [AT_TABLE.x, 0.85, AT_TABLE.z] },
      { t: T.telescope - 1, dur: 3, pos: [0.9, 0.6, 0.3], look: [AT_TABLE.x, 0.35, AT_TABLE.z] }, // shutting up like a telescope
      { t: T.telescope + 3, dur: 3, pos: [0.6, 0.28, -0.2], look: [AT_TABLE.x, 0.15, AT_TABLE.z] },
      { t: T.decided, dur: 6, pos: [3.2, 0.3, -1.2], look: [DOOR.x, 0.15, DOOR.z] },
      { t: T.forgotten, dur: 4, pos: [1.1, 0.22, -0.2], look: [TABLE.x, 0.45, TABLE.z] },
      { t: T.forgotten + 6, dur: 2, pos: [TABLE.x + 0.35, 0.14, TABLE.z + 0.45], look: [TABLE.x, 1.0, TABLE.z] }, // the key, through the glass
      { t: T.sat, dur: 2, pos: [TABLE.x + 0.5, 0.25, TABLE.z + 0.7], look: [BY_LEG.x, 0.1, BY_LEG.z] },
      { t: T.box - 1, dur: 3, pos: [TABLE.x + 0.35, 0.22, TABLE.z + 1.0], look: [TABLE.x - 0.05, 0.07, TABLE.z + 0.25] }, // EAT ME
      { t: T.finished - 3, dur: 4, pos: [TABLE.x + 0.6, 0.45, TABLE.z + 1.5], look: [TABLE.x, 0.15, TABLE.z + 0.3] },
    ]);

    return {
      T, bg: PAPER, fog: [8, 20],
      bounds: { minX: -5.5, maxX: 5.5, minZ: -2.4, maxZ: 2.2 },
      hotspots: [
        { pos: new THREE.Vector3(TABLE.x, TABLE.top, TABLE.z), title: 'The glass table', text: 'a little three-legged table, all made of solid glass; there was nothing on it except a tiny golden key' },
        { pos: new THREE.Vector3(DOOR.x, 0.4, DOOR.z), title: 'The low curtain', text: 'behind it was a little door about fifteen inches high' },
        { pos: new THREE.Vector3(0, 1.2, -2.9), title: 'The doors', text: 'There were doors all round the hall, but they were all locked' },
      ],
      camera, update,
      actors: (t) => ({ alice: alice(t) }),
    };
  },
};
