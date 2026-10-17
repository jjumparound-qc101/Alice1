// Scene 4: the hall, from "she found herself in a long, low hall" to the end of the chapter:
// the doors, the glass table and golden key, the curtain and little door, the garden,
// "DRINK ME", shrinking, the forgotten key, crying, and "EAT ME".
import * as THREE from 'three';
import { paperFlat } from '@engine/stage.js';
import { texture, PAPER } from '@engine/ink.js';
import { buildHall, TABLE, DOOR, KEY } from '../sets/hall.js';
import { thoughts } from '@engine/thoughts.js';
import { carry } from '@engine/puppet.js';
import { smooth, lerp, route, step, cameraTrack } from '@engine/track.js';

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
      bottle: at('bottle', 1), histories: at('histories'), poker: at('poker'), finger: at('finger'), bleeds: at('bleeds'),
      poison: at('poison', 2), notMarked: at('poison', 3), candle: at('candle', 1), blownOut: at('candle', 3), ventured: at('ventured'),
      drunk: at('finished', 1), telescope: at('telescope', 1, at('ventured')), ears: at('ears', 2), croquet: at('croquet'), decided: at('decided'), forgotten: at('forgotten', 2),
      legs: at('legs'), sat: at('sat'), scold: cue.para('“Come, there’s no use'), box: at('box', 2), // #1 is "box her own ears"
      label: at('label'), currants: at('currants'),
      ate: cue.para('She ate a little bit'), finished: at('finished', 2),
    };

    // --- The set (src/sets/hall.js) and this chapter's props --------------------
    const { key, hinge, curt } = buildHall({ group, ai, hallMeta });
    // The AI drawings (tools/small_props.py): the bottle, the open glass box with the cake in it.
    const flat = (name, w) => paperFlat(ai[name].tex, w, w / ai[name].aspect);
    const bottle = flat('props/bottle', 0.13);
    // "a little glass box", just big enough for the cake; Alice is ten inches high here.
    // See-through, so no shadow cards behind it or the cake (they showed as second copies).
    const BOX_W = 0.09, CAKE_W = 0.042; // the cake as drawn in her hand in the eating pose (4 cm)
    // Beside where she stands to eat, at her depth, so the cake reads at the same size in the box and in her hand.
    const BOX_AT = { x: TABLE.x + 0.1, z: TABLE.z + 0.43 };
    const box = paperFlat(ai['props/box'].tex, BOX_W, BOX_W / ai['props/box'].aspect, { edge: false });
    const cake = paperFlat(ai['props/cake'].tex, CAKE_W, CAKE_W / ai['props/cake'].aspect, { edge: false });
    // The box is one flat drawing, so the cake can't sit "inside" it and stay readable behind
    // its near corner post. Instead the cake stands in the wide left-hand glass panel (no post
    // crosses it), and a faint copy of the box is laid over it as the front glass: the cake
    // reads as behind glass, and EAT ME stays fully legible.
    const glassFront = paperFlat(ai['props/box'].tex, BOX_W, BOX_W / ai['props/box'].aspect, { edge: false });
    const gm = glassFront.userData.front.material;
    gm.opacity = 0.28; gm.alphaTest = 0.02; gm.depthWrite = false;
    group.add(bottle, box, cake, glassFront);

    // "the simple rules their friends had taught them", and later the candle going out.
    const think = thoughts(group, [
      // AI drawings (tools/ch1_art.py; the poker's tip coloured red there).
      { t0: T.histories - 1, t1: T.poker - 2, art: ai['vignettes/histories'].tex },
      { t0: T.poker - 2, t1: T.finger - 0.3, art: ai['vignettes/poker'].tex },
      { t0: T.finger - 0.3, t1: T.poison - 1.2, art: ai['vignettes/knife'].tex },
      { t0: T.poison - 1.2, t1: T.notMarked - 0.5, art: ai['vignettes/poison'].tex },
      { t0: T.telescope - 2.5, t1: T.telescope + 3, art: ai['vignettes/telescope'].tex },   // "shutting up like a telescope"
      { t0: T.candle - 1.5, t1: T.blownOut + 2, art: ai['vignettes/candle'].tex },
      { t0: T.ears - 1, t1: T.croquet + 4, art: ai['vignettes/croquet'].tex },             // boxing her own ears
    ]);

    // --- Alice -----------------------------------------------------------------
    const AT_TABLE = { x: TABLE.x - 0.75, z: TABLE.z + 0.35 };   // beside the table, her drawing clear of its top
    const AT_DOOR = { x: DOOR.x - 0.55, z: DOOR.z + 0.45 };
    // At the foot of the table leg nearest the camera (the second of the three, src/sets/hall.js),
    // just in front of it: she tries to climb this leg.
    const LEG_FOOT = { x: TABLE.x + Math.cos((2 * Math.PI) / 3 + 0.3) * TABLE.r * 0.72 * 1.4, z: TABLE.z + Math.sin((2 * Math.PI) / 3 + 0.3) * TABLE.r * 0.72 * 1.4 };
    const BY_LEG = { x: LEG_FOOT.x + 0.05, z: LEG_FOOT.z + 0.05 };
    const scaleAt = (t) => lerp(1, 0.2, smooth((t - T.telescope) / 3.6)); // "now only ten inches high"

    // Walks go round the glass table, never through it (owner, 2026-10-14; a wider path, owner 2026-10-15): a leg
    // whose straight line passes within CLEAR of the table's centre (the table's radius, half the width of her
    // drawing and a margin) curves round the near side of the table (toward the camera, so she is never seen
    // through the glass and never looks as if she were in it) on an arc, as one unbroken walk eased at its ends.
    // Once she is small enough to walk under the glass top she goes straight.
    const CLEAR = TABLE.r + 0.6;
    const detour = (a, b) => {
      const dx = b.x - a.x, dz = b.z - a.z, L2 = dx * dx + dz * dz;
      if (!L2) return null;
      const k = Math.max(0, Math.min(1, ((TABLE.x - a.x) * dx + (TABLE.z - a.z) * dz) / L2));
      if (Math.hypot(a.x + k * dx - TABLE.x, a.z + k * dz - TABLE.z) >= CLEAR) return null;
      // From a's bearing to b's bearing round the table, the way that passes its near side (bearing +90°).
      const A = Math.atan2(a.z - TABLE.z, a.x - TABLE.x), B = Math.atan2(b.z - TABLE.z, b.x - TABLE.x);
      const TAU = Math.PI * 2, wrap = (v) => ((v % TAU) + TAU) % TAU;
      const ccw = wrap(B - A), viaNear = wrap(Math.PI / 2 - A) <= ccw;
      let arc = viaNear ? ccw : ccw - TAU;
      // Leaving the table's side for somewhere just round it, the near way can be nearly a full circle
      // (Chapter I, off to try the key in the doors: she circled the table first); then the short way.
      if (Math.abs(arc) > Math.PI * 1.5) arc = arc > 0 ? arc - TAU : arc + TAU;
      const n = Math.max(2, Math.ceil(Math.abs(arc) / (Math.PI / 8)));
      const R = CLEAR / Math.cos(Math.abs(arc) / n / 2);          // chords between the points stay outside CLEAR
      const pts = [a];
      for (let i = 0; i <= n; i++) { const g = A + (arc * i) / n; pts.push({ x: TABLE.x + Math.cos(g) * R, z: TABLE.z + Math.sin(g) * R }); }
      pts.push(b);
      return pts;
    };
    // route(), with any leg that would cross the table walked along its detour instead.
    const routeAround = (t, points, extra) => {
      for (let i = 1; i < points.length; i++) {
        const [t1, b] = points[i];
        if (t >= t1) continue;
        const [t0, a] = points[i - 1];
        const poly = t > t0 && scaleAt(t0) > 0.6 ? detour(a, b) : null;
        if (!poly) break;
        const segs = poly.slice(1).map((q, j) => Math.hypot(q.x - poly[j].x, q.z - poly[j].z)), L = segs.reduce((u, v) => u + v, 0);
        let d = smooth((t - t0) / (t1 - t0)) * L, j = 0;
        while (j < segs.length - 1 && d > segs[j]) { d -= segs[j]; j++; }
        const p = poly[j], q = poly[j + 1], f = segs[j] ? d / segs[j] : 0;
        return { x: lerp(p.x, q.x, f), z: lerp(p.z, q.z, f), moving: true, dir: Math.sign(q.x - p.x) || -1, dist: smooth((t - t0) / (t1 - t0)) * L, ...extra };
      }
      return route(t, points, extra);
    };
    const walk = (t) => routeAround(t, [
      [start, { x: -5.4, z: 0.6, dir: 1 }],
      [T.doors, { x: -4, z: -2.3 }],          // "doors all round the hall, but they were all locked"
      [T.doors + 4, { x: -2, z: -2.3 }],
      [T.doors + 8, { x: 0.5, z: -2.3 }],
      [T.doors + 12, { x: 2.5, z: -2.3 }],
      [T.key - 0.5, AT_TABLE],                // round the front of the table, at a walk (owner, 2026-10-15)
      [T.tryKey - 4.5, AT_TABLE],             // "it might belong to one of the doors": off at a walk
      [T.tryKey + 0.5, { x: -2.5, z: -2.4 }],  // tries the key in the doors
      [T.curtain, { x: AT_DOOR.x - 0.4, z: AT_DOOR.z }],
      [T.curtain + 1.5, AT_DOOR],
      [T.waiting, AT_DOOR],
      [T.backToTable, AT_TABLE],
      [T.decided - 1.5, AT_TABLE],
      [T.forgotten + 0.5, AT_DOOR],          // off to the garden, small now: the whole way at her pace
      [T.forgotten + 8, BY_LEG],             // back to the table, at a pace her size can walk
      [T.box, BY_LEG],
      [T.box + 2.5, { x: TABLE.x - 0.05, z: TABLE.z + 0.45 }],
    ], { phase: t * 2.2 });

    function alice(t) {
      const s = walk(t);
      const scale = scaleAt(t);
      const kneeling = t >= T.knelt && t < T.waiting;
      const crying = t >= T.sat && t < T.scold;
      let y = 0;
      // "she tried her best to climb up one of the legs of the table, but it was too slippery":
      // up the leg (pressed against it) and sliding back down.
      let climb = 0;
      if (t >= T.legs && t < T.sat) { climb = Math.abs(Math.sin((t - T.legs) * 1.6)); y = climb * 0.14; }
      const eating = t >= T.ate && t < T.finished;   // the cake drawn in her hand, the other on her head
      // Holding the key, or the bottle, up to look at it while she stands still.
      const holding = !s.moving && ((t >= T.key && t < T.tryKey) || (t >= T.bottle + 1 && t < T.drunk));
      // "she found she could not possibly reach it": up on tiptoe under the table, before climbing a leg.
      const reaching = !s.moving && t >= T.forgotten + 8 && t < T.legs;
      const climbing = t >= T.legs && t < T.sat;
      const pose = reaching || climbing ? 'reach' : kneeling ? 'kneel' : crying ? 'cry' : eating && !s.moving ? 'eat' : holding ? 'hold' : 'stand';
      // Climbing, she follows the leg as it leans in toward the table top.
      const lean = climbing ? y / TABLE.top : 0;
      return { ...s, pose, dir: kneeling ? 1 : pose === 'eat' ? -1 : s.dir, scale, y, // eating: as drawn, so EAT ME reads the right way round
        x: s.x + (TABLE.x - LEG_FOOT.x) * 0.3 * lean, z: s.z + (TABLE.z - LEG_FOOT.z) * 0.3 * lean,
        moving: s.moving && !climbing };
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
      // Her thoughts beside her head (to the left, away from the table), sized to her: above
      // her head the close shots slid them down over her face.
      const ts = Math.max(a.scale, 0.35);
      think(t, { x: a.x - 0.2 * a.scale - 0.62 * ts, y: (a.y ?? 0) + 1.3 * a.scale, z: a.z + 0.15 }, ts);
      // Under the table: the little glass box and the cake.
      box.visible = cake.visible = glassFront.visible = t >= T.box - 0.5;
      box.position.set(BOX_AT.x, 0, BOX_AT.z);
      glassFront.position.set(BOX_AT.x, 0, BOX_AT.z + 0.016);
      if (t >= T.ate && t < T.finished) { carry(cake, cast.alice, { drop: 0.01 }); cake.visible = a.pose !== 'eat'; }
      else rest(cake, BOX_AT.x - 0.016, 0.014, BOX_AT.z + 0.008); // in the left glass panel, between the box and its front glass
      if (t >= T.finished) cake.visible = false;
    }

    const camera = cameraTrack([
      // She comes in at the left and walks toward the doors: the camera takes her in from the first
      // moment, then rises a little for the lamps with her still in the shot (owner, 2026-10-14).
      { t: start, dur: 0, pos: [-3.0, 1.3, 3.4], look: [-5.0, 0.8, -0.4] },
      { t: T.lamps - 0.5, dur: 3, pos: [-2.6, 1.25, 3.4], look: [-4.2, 1.5, -1.2] },  // the lamps, and Alice
      { t: T.doors, dur: 3, pos: [-2.4, 1.2, 1.4], look: [-3.0, 0.7, -2.3] },        // along the locked doors, with her               // the locked doors
      { t: T.doors + 5, dur: 5, pos: [0.2, 1.2, 1.2], look: [0.5, 0.8, -2.6] },
      // Her walk round the near side of the glass table, whole, from above and in front (owner, 2026-10-15: she
      // walked through the table; her wider path came too close to the old camera).
      { t: T.doors + 10.5, dur: 2.5, pos: [0.7, 1.6, 2.9], look: [TABLE.x, 0.2, TABLE.z + 0.2] },
      // The key, the doors, the little door (owner, 2026-10-14: Alice kept whole in the picture). Full-figure
      // shots are about 2.4 m from her, looking at her middle, so she stands clear of the text strip.
      { t: T.key - 1, dur: 2.5, pos: [AT_TABLE.x + 0.8, 1.0, AT_TABLE.z + 2.3], look: [AT_TABLE.x + 0.2, 0.55, AT_TABLE.z] }, // Alice with the golden key, at the glass table
      { t: T.tryKey - 0.5, dur: 3, pos: [0, 1.2, 1.8], look: [0, 0.45, -2.4] },                   // the whole row of doors, wide and still, as she tries them
      { t: T.curtain - 1.5, dur: 3, pos: [AT_DOOR.x - 0.4, 0.95, AT_DOOR.z + 2.5], look: [AT_DOOR.x + 0.25, 0.45, AT_DOOR.z] }, // the low curtain, Alice beside it
      { t: T.fits, dur: 2.5, pos: [AT_DOOR.x - 0.1, 0.85, AT_DOOR.z + 2.3], look: [AT_DOOR.x + 0.3, 0.42, DOOR.z + 0.1] }, // the key fits: Alice whole, the little door beside her
      { t: T.knelt, dur: 3, pos: [DOOR.x - 0.02, 0.22, DOOR.z + 0.55], look: [DOOR.x, 0.2, DOOR.z - 0.5] }, // the garden, as she sees it
      { t: T.knelt + 6, dur: 3, pos: [AT_DOOR.x - 0.75, 0.75, AT_DOOR.z + 1.6], look: [DOOR.x - 0.25, 0.35, DOOR.z + 0.1] }, // over her shoulder: Alice kneeling, the garden beyond
      { t: T.waiting - 6, dur: 3, pos: [DOOR.x - 1.2, 1.0, 0.1], look: [DOOR.x - 0.2, 0.5, DOOR.z] },
      { t: T.waiting, dur: 3, pos: [0.7, 1.6, 2.9], look: [TABLE.x, 0.2, TABLE.z + 0.2] },        // back round the table
      { t: T.bottle - 1, dur: 2, pos: [1.3, 1.1, -0.2], look: [TABLE.x - 0.2, 0.95, TABLE.z] }, // DRINK ME
      { t: T.bottle + 2, dur: 3, pos: [0.9, 1.0, 0.75], look: [AT_TABLE.x + 0.05, 0.72, AT_TABLE.z] }, // the bottle in her hand
      { t: T.label - 0.8, dur: 1.2, pos: [AT_TABLE.x + 0.3, 1.02, AT_TABLE.z + 0.45], look: [AT_TABLE.x + 0.25, 1.0, AT_TABLE.z] }, // close: "DRINK ME" on the label
      { t: T.label + 6, dur: 1.5, pos: [0.9, 1.0, 0.75], look: [AT_TABLE.x + 0.05, 0.72, AT_TABLE.z] },
      { t: T.poker - 2, dur: 2, pos: [1.4, 1.35, 1.7], look: [AT_TABLE.x, 1.2, AT_TABLE.z] }, // the poker
      { t: T.notMarked - 0.5, dur: 2, pos: [1.6, 1.1, 0.5], look: [AT_TABLE.x, 0.85, AT_TABLE.z] },
      { t: T.telescope - 1, dur: 3, pos: [0.9, 0.6, 0.3], look: [AT_TABLE.x, 0.35, AT_TABLE.z] }, // shutting up like a telescope
      { t: T.telescope + 3, dur: 3, pos: [0.6, 0.28, -0.2], look: [AT_TABLE.x, 0.15, AT_TABLE.z] },
      { t: T.decided - 1.5, dur: 7, pos: [1.0, 0.35, 0.3], look: [1.2, 0.1, -1.9] }, // tiny Alice crossing to the door // tiny Alice crossing to the door
      { t: T.forgotten, dur: 2.5, pos: [1.3, 0.4, 0.4], look: [1.3, 0.1, -1.7] }, // facing her as she goes back (a cutout must be seen from the front) to the table
      { t: T.forgotten + 6.8, dur: 1, pos: [BY_LEG.x + 0.1, 0.14, BY_LEG.z + 0.8], look: [BY_LEG.x, 0.06, BY_LEG.z] }, // on tiptoe, reaching up
      { t: T.forgotten + 9.5, dur: 2, pos: [TABLE.x + 0.35, 0.14, TABLE.z + 0.45], look: [TABLE.x, 1.0, TABLE.z] }, // the key, through the glass
      { t: T.legs - 1, dur: 1.5, pos: [BY_LEG.x + 0.2, 0.2, BY_LEG.z + 0.75], look: [BY_LEG.x - 0.02, 0.15, BY_LEG.z - 0.05] }, // climbing the leg
      { t: T.sat, dur: 2, pos: [BY_LEG.x + 0.35, 0.22, BY_LEG.z + 0.6], look: [BY_LEG.x, 0.08, BY_LEG.z] },
      { t: T.box - 1, dur: 3, pos: [TABLE.x + 0.3, 0.2, TABLE.z + 1.05], look: [TABLE.x + 0.05, 0.08, TABLE.z + 0.43] }, // EAT ME
      { t: T.currants - 3.6, dur: 1.2, pos: [BOX_AT.x - 0.016, 0.045, BOX_AT.z + 0.15], look: [BOX_AT.x - 0.012, 0.03, BOX_AT.z] }, // close: "EAT ME" in currants
      { t: T.currants + 1.5, dur: 1.5, pos: [TABLE.x + 0.3, 0.2, TABLE.z + 1.05], look: [TABLE.x + 0.05, 0.08, TABLE.z + 0.43] },
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
