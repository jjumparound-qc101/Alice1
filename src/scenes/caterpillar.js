// Chapter V, "Advice from a Caterpillar", in three scenes:
//   mushroom — three-inch Alice and the blue Caterpillar; "You are old, Father William",
//              shown in Tenniel's own four plates, which turn like pages as she recites;
//              the two sides of the mushroom; shrinking until her chin strikes her foot;
//   treetops — her head on an immense neck above "a sea of green leaves"; the Pigeon;
//   clearing — her right size again, the little house four feet high, and down to nine inches.
// Figures and props not yet drawn are placeholders from props4.js and props5.js.
import * as THREE from 'three';
import { paperFlat } from '../stage.js';
import { texture, INK, PAPER } from '../ink.js';
import { mushroom } from '../props4.js';
import { treetops, nest, mushroomBit, littleHouse, plateMount, chrysalisVignette, eggsVignette } from '../props5.js';
import { thoughts } from '../thoughts.js';
import { carry } from '../puppet.js';
import { smooth, lerp, route, cameraTrack } from '../track.js';
import { outdoors, tiled } from './rabbit.js';

const TINY = 0.13;       // three inches
const MU = { x: 0, z: 0, h: 0.177, w: 0.17 };

// The thick wood at three-inch height, with the mushroom (shared with Chapter IV's end).
function wood(group, ai) {
  outdoors(group, ai, { groundRepeat: 60 });
  for (const [x, z, h, seed] of [[0, -1.0, 0.45, 1], [-0.5, -2.0, 0.6, 2], [0.6, -2.8, 0.7, 3], [0, 1.1, 0.3, 4]]) {
    const grass = paperFlat(tiled(ai.grass.tex, 10 / (h * ai.grass.aspect)), 10, h, { edge: false });
    grass.userData.front.material.map.offset.x = seed * 0.3; grass.position.set(x, 0, z); group.add(grass);
  }
  const mu = paperFlat(texture(mushroom()), MU.w, MU.h); mu.position.set(MU.x, 0, MU.z); group.add(mu);
}

// --- 1. On the mushroom --------------------------------------------------------------
export const mushroomTalk = {
  id: 'mushroom',
  title: 'Who are you?',
  start: () => 0,
  parts: (cue) => [
    { title: 'Keep your temper', t: cue.at('temper') - 3 },
    { title: 'You are old, Father William', t: cue.at('repeat') - 1 },
    { title: 'One side and the other', t: cue.at('yawned') - 2 },
  ],
  build({ group, ai, cue }) {
    const at = cue.at;
    const T = {
      butterfly: at('butterfly'), gravely: at('gravely'), turned: at('turned', 1), back: at('turned', 2), repeat: at('repeat'), folded: at('folded'),
      v1: at('old', 2), v2: at('old', 3), v3: at('old', 4), v4: at('old', 5), notRight: at('right', 2),
      rearing: at('rearing'), yawned: at('yawned'), crawled: at('crawled'), sight: cue.at('sight', 1, at('crawled')),
      broke: at('broke'), nibbled: at('nibbled'), blow: at('blow'), swallow: at('swallow'), end: at('free') - 1.5,
    };
    wood(group, ai);
    // Tenniel's four Father William plates, on paper mounts, one per question and answer.
    const PW = 0.2;
    const plates = [1, 2, 3, 4].map((n) => {
      const a = ai[`tenniel/father_william_${n}`];
      const card = new THREE.Group();
      const ph = PW / a.aspect;
      const mount = paperFlat(texture(plateMount(400, Math.round(400 / a.aspect))), PW * 1.2, ph + PW * 0.2, { anchor: 'center' });
      const pic = new THREE.Mesh(new THREE.PlaneGeometry(PW, ph), new THREE.MeshBasicMaterial({ map: a.tex }));
      pic.position.z = 0.002; card.add(mount, pic); card.visible = false; group.add(card);
      return card;
    });
    const verses = [T.v1, T.v2, T.v3, T.v4, T.notRight];
    const bitL = paperFlat(texture(mushroomBit()), 0.02, 0.013, { anchor: 'center' }), bitR = bitL.clone();
    group.add(bitL, bitR);
    const think = thoughts(group, [{ t0: T.butterfly - 6, t1: T.butterfly + 6, art: chrysalisVignette() }]);

    const SPOT_A = { x: MU.x + 0.1, z: MU.z + 0.09 };
    function alice(t) {
      const s = route(t, [
        [0, SPOT_A], [T.turned, SPOT_A], [T.turned + 2, { x: MU.x + 0.3, z: MU.z + 0.15, dir: 1 }],   // "she turned away"
        [T.back, { x: MU.x + 0.3, z: MU.z + 0.15 }], [T.back + 2, SPOT_A],                              // "Alice turned and came back again"
        [T.broke - 3, SPOT_A], [T.broke - 1, { x: MU.x + 0.04, z: MU.z + 0.06 }],
      ], { phase: t * 3 });
      const squashed = t >= T.blow; // "a violent blow underneath her chin: it had struck her foot!"
      const scale = squashed ? lerp(TINY, 0.04, smooth((t - T.blow) / 0.4)) : TINY;
      return { ...s, pose: squashed ? 'sit' : 'stand', scale, dir: s.moving ? s.dir : -1, tilt: t >= T.gravely && t < T.gravely + 3 ? -0.05 : 0 };
    }
    function cat(t) {
      const rear = t >= T.rearing - 0.5 && t < T.rearing + 4 ? smooth((t - T.rearing + 0.5) / 0.5) : 0; // "rearing itself upright"
      if (t < T.crawled) return { pose: 'sit', x: MU.x + 0.01, z: MU.z + 0.005, y: MU.h - 0.02, dir: -1, scale: 1 + rear * 0.3, tilt: rear * -0.3 + (t >= T.yawned && t < T.yawned + 2 ? Math.sin(t * 20) * 0.05 : 0) };
      const k = smooth((t - T.crawled) / 5);
      return { pose: 'sit', x: MU.x + 0.01 + k * 0.4, z: MU.z - k * 0.2, y: (MU.h - 0.02) * (1 - smooth((t - T.crawled) / 1.5)), dir: 1, visible: t < T.sight + 1 };
    }
    function update(t, cast) {
      const k = verses.findIndex((v, i) => t >= v - 0.3 && t < verses[i + 1] - 0.3);
      plates.forEach((p, i) => {
        p.visible = i === k;
        if (!p.visible) return;
        const turn = Math.min(1, (t - verses[i] + 0.3) / 0.5); // a page turning in
        p.position.set(MU.x + 0.26, 0.13, MU.z + 0.05);
        p.rotation.set(0, -0.35 + (1 - turn) * 1.4, 0);
      });
      bitL.visible = bitR.visible = t >= T.broke && t < T.end + 2;
      if (bitL.visible) { carry(bitL, cast.alice); carry(bitR, cast.alice); bitR.position.x -= 0.03 * cast.alice.root.scale.x; }
      const a = alice(t);
      think(t, { x: a.x + 0.12, y: 0.19, z: a.z - 0.02 }, 0.1);
    }
    const camera = cameraTrack([
      { t: 0, dur: 0, pos: [0.28, 0.13, 0.42], look: [0.04, 0.12, 0] },                        // looking at each other in silence
      { t: 8, dur: 4, pos: [0.16, 0.09, 0.3], look: [0.02, 0.15, 0] },                         // "Who are you?"
      { t: T.gravely - 1, dur: 2, pos: [0.3, 0.1, 0.32], look: [0.08, 0.11, 0.05] },
      { t: T.turned, dur: 3, pos: [0.45, 0.14, 0.5], look: [0.15, 0.1, 0.05] },                // turning away, and coming back
      { t: T.back + 3, dur: 3, pos: [0.16, 0.09, 0.3], look: [0.02, 0.15, 0] },
      { t: T.folded - 1, dur: 3, pos: [0.38, 0.12, 0.42], look: [0.18, 0.11, 0.05] },          // Father William, in Tenniel's plates
      { t: T.notRight, dur: 3, pos: [0.16, 0.09, 0.3], look: [0.02, 0.15, 0] },
      { t: T.rearing - 1, dur: 1.5, pos: [0.12, 0.13, 0.22], look: [0.01, 0.2, 0] },           // "a very good height indeed!"
      { t: T.crawled - 1, dur: 4, pos: [0.3, 0.12, 0.45], look: [0.15, 0.06, -0.05] },
      { t: T.broke - 2, dur: 3, pos: [0.14, 0.12, 0.28], look: [0.02, 0.1, 0.03] },            // a bit of the edge with each hand
      { t: T.blow - 0.3, dur: 1, pos: [0.1, 0.05, 0.2], look: [0.04, 0.03, 0.05] },             // chin against her foot
    ]);
    return {
      T, bg: PAPER, fog: [6, 24], bounds: null, hotspots: [],
      camera, update, actors: (t) => ({ alice: alice(t), caterpillar: cat(t) }),
    };
  },
};

// --- 2. Above the treetops ------------------------------------------------------------
export const treetopsScene = {
  id: 'treetops',
  title: 'A sea of green leaves',
  start: (cue) => cue.at('free') - 1.5,
  parts: (cue) => [{ title: 'Serpent!', t: cue.at('hiss') - 1 }],
  build({ group, ai, cue }) {
    const at = cue.at;
    const start = treetopsScene.start(cue);
    const T = { free: at('free'), green: at('green', 1), hands: at('hands', 1), serpent: at('serpent', 1), hiss: at('hiss'), screamed: at('serpent', 2),
      eggs: at('eggs', 1), nest: at('nest'), crouched: at('crouched'), nibbling: at('nibbling', 1), end: at('right', 1, at('nibbling')) - 2 };
    // The leaves, far below, and sky.
    const leaves = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ map: texture(treetops(), { repeat: [40, 40] }) }));
    leaves.rotation.x = -Math.PI / 2; group.add(leaves);
    const sky = paperFlat(tiled(ai.sky.tex, 40 / (14 * ai.sky.aspect)), 40, 14, { edge: false, opaque: true }); sky.position.set(0, -2, -14); group.add(sky);
    const NEST = { x: 0.9, z: -0.7 };
    const nestCard = paperFlat(texture(nest()), 0.34, 0.19); nestCard.position.set(NEST.x, -0.03, NEST.z); group.add(nestCard);
    const think = thoughts(group, [{ t0: at('egg') - 1, t1: at('egg') + 8, art: eggsVignette() }]);

    // The neck: a paper tube with an inked outline, from below the leaves to her head.
    const R = 0.045;
    const paperMat = new THREE.MeshBasicMaterial({ color: '#f3eee2' }), inkMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
    const neck = new THREE.Mesh(new THREE.BufferGeometry(), paperMat), outline = new THREE.Mesh(new THREE.BufferGeometry(), inkMat);
    group.add(neck, outline);
    // Her head: the top of the standing drawing (face and hair), on a card.
    const HEAD_FRAC = 0.2, HEAD_H = 0.3;
    const hg = new THREE.PlaneGeometry(HEAD_H * ai.alice_stand.aspect / HEAD_FRAC, HEAD_H); // the top fifth of the drawing
    const uv = hg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - HEAD_FRAC + uv.getY(i) * HEAD_FRAC);
    const head = new THREE.Mesh(hg, new THREE.MeshBasicMaterial({ map: ai.alice_stand.tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }));
    group.add(head);

    // Where her head is: rising, swaying, diving in a zigzag, jerking back, crouching, bobbing.
    function headAt(t) {
      let x = 0.15 * Math.sin(t * 0.4), y = lerp(0.2, 1.7, smooth((t - T.free + 0.5) / 3)), z = 0;
      const dive = smooth((t - T.serpent + 1) / 6) * (1 - smooth((t - T.hiss) / 0.5)); // "curving it down into a graceful zigzag"
      x = lerp(x, 0.7, dive); y = lerp(y, 0.45, dive); z = lerp(z, -0.4, dive);
      const crouch = smooth((t - T.crouched) / 3);
      y = lerp(y, 0.6, crouch);
      if (t >= T.nibbling) y = 0.6 + Math.abs(Math.sin((t - T.nibbling) * 1.2)) * 0.6 * (1 - smooth((t - T.end + 3) / 3)); // taller, shorter…
      return new THREE.Vector3(x, y, z);
    }
    function update(t, cast) {
      const h = headAt(t);
      const zig = smooth((t - T.serpent + 1) / 6) * (1 - smooth((t - T.hiss) / 0.5)) + 0.6 * smooth((t - T.crouched) / 3);
      const pts = [new THREE.Vector3(0, -0.3, 0)];
      for (let i = 1; i <= 6; i++) {
        const k = i / 7;
        pts.push(new THREE.Vector3(lerp(0, h.x, k) + Math.sin(i * 2.1) * 0.25 * zig, lerp(-0.3, h.y - 0.1, k), lerp(0, h.z, k) + Math.cos(i * 1.7) * 0.15 * zig));
      }
      pts.push(new THREE.Vector3(h.x, h.y - 0.1, h.z));
      const curve = new THREE.CatmullRomCurve3(pts);
      neck.geometry.dispose(); outline.geometry.dispose();
      neck.geometry = new THREE.TubeGeometry(curve, 48, R, 10, false);
      outline.geometry = new THREE.TubeGeometry(curve, 48, R * 1.18, 10, false);
      head.position.set(h.x, h.y + HEAD_H / 2 - 0.12, h.z + 0.01);
      head.rotation.y = 0.2;
      // The shaking leaves where her hands are.
      leaves.position.y = t >= T.hands && t < T.hands + 8 ? Math.sin(t * 25) * 0.003 : 0;
      think(t, { x: h.x - 0.35, y: h.y + 0.15, z: h.z }, 0.35);
    }
    function pigeon(t) {
      if (t < T.hiss - 0.3) return { pose: 'perch', x: NEST.x, z: NEST.z + 0.02, y: 0, dir: -1 };
      const h = headAt(t);
      if (t < T.screamed + 3) { // "flown into her face, and was beating her violently with its wings"
        return { pose: 'fly', x: h.x + 0.12 + Math.sin(t * 9) * 0.05, z: h.z + 0.15, y: h.y + Math.sin(t * 13) * 0.04 - 0.05, dir: -1, scale: 1 + Math.sin(t * 22) * 0.08 };
      }
      if (t >= T.nest) { const k = smooth((t - T.nest) / 2); return { pose: 'perch', x: lerp(h.x + 0.3, NEST.x, k), z: lerp(h.z + 0.1, NEST.z + 0.02, k), y: lerp(h.y - 0.1, 0, k), dir: -1 }; }
      return { pose: 'perch', x: h.x + 0.3, z: h.z + 0.1, y: h.y - 0.1 + Math.sin(t * 2) * 0.02, dir: -1, tilt: Math.sin(t * 3) * 0.06 };
    }
    const camera = (t) => {
      const h = headAt(t);
      const wide = t < T.free + 2 || (t >= T.green && t < T.green + 8);
      const pos = wide ? [h.x + 1.3, h.y + 0.4, h.z + 2.6] : [h.x + 0.3, h.y + 0.05, h.z + 0.85];
      if (t >= T.hands && t < T.hands + 7) return { pos: [h.x + 0.4, 0.45, h.z + 1.4], look: [0, 0.0, 0] };                // the distant leaves shaking
      return { pos, look: [h.x + 0.15, wide ? h.y * 0.6 : h.y - 0.02, h.z] };
    };
    return {
      T, bg: PAPER, fog: [10, 40], bounds: null, hotspots: [],
      camera, update, actors: (t) => ({ pigeon: pigeon(t) }),
    };
  },
};

// --- 3. The open place ----------------------------------------------------------------
export const clearing = {
  id: 'clearing',
  title: 'A little house',
  start: (cue) => cue.at('right', 1, cue.at('nibbling')) - 2,
  build({ group, ai, cue }) {
    const at = cue.at;
    const start = clearing.start(cue);
    const T = { open: at('open', 1, start), nibble: at('nibbling', 2), nine: at('nine') };
    outdoors(group, ai);
    for (const [x, z, s] of [[-3, -2, 1], [3.2, -3, -1], [-2.4, -6, 1], [2.6, -6.5, -1]]) {
      const tree = paperFlat(ai.tree.tex, 4.5 * ai.tree.aspect, 4.5); tree.position.set(x, 0, z); tree.scale.x = s; group.add(tree);
    }
    const house = paperFlat(texture(littleHouse()), 1.15, 1.22); house.position.set(0.2, 0, -3.2); group.add(house); // "about four feet high"
    const alice = (t) => {
      const s = route(t, [[start, { x: 1.4, z: 0.6, dir: -1 }], [T.open + 1, { x: 0.8, z: -0.8 }]], { phase: t * 2.2 });
      const scale = lerp(1, 0.18, smooth((t - T.nibble - 1) / 4)); // "down to nine inches high"
      return { ...s, pose: 'stand', scale };
    };
    const camera = cameraTrack([
      { t: start, dur: 0, pos: [2.4, 1.3, 2.6], look: [1.0, 0.8, -0.5] },
      { t: T.open - 0.5, dur: 3, pos: [1.6, 1.0, 1.8], look: [0.3, 0.7, -3.2] },        // "an open place, with a little house in it"
      { t: T.nibble, dur: 4, pos: [1.3, 0.4, 0.5], look: [0.75, 0.15, -0.9] },          // nine inches high
    ]);
    return {
      T, bg: PAPER, fog: [9, 30], bounds: { minX: -2, maxX: 2, minZ: -2.4, maxZ: 2 },
      hotspots: [{ pos: new THREE.Vector3(0.2, 0.6, -3.1), title: 'A little house', text: 'a little house in it about four feet high' }],
      camera, actors: (t) => ({ alice: alice(t) }),
    };
  },
};

export const CHAPTER_5 = [mushroomTalk, treetopsScene, clearing];
