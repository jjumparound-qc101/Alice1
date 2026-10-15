// Chapter V, "Advice from a Caterpillar", in three scenes:
//   mushroom — three-inch Alice and the blue Caterpillar; "You are old, Father William",
//              shown in Tenniel's own four plates, which turn like pages as she recites;
//              the two sides of the mushroom; shrinking until her chin strikes her foot;
//   treetops — her head on an immense neck above "a sea of green leaves"; the Pigeon;
//   clearing — her right size again, the little house four feet high, and down to nine inches.
// Figures and props not yet drawn are placeholders from props4.js and props5.js.
import * as THREE from 'three';
import { paperFlat } from '@engine/stage.js';
import { texture, canvas, INK, PAPER } from '@engine/ink.js';
import { nest, plateMount } from '../props5.js';
import { thoughts } from '@engine/thoughts.js';
import { carry } from '@engine/puppet.js';
import { smooth, lerp, route, cameraTrack } from '@engine/track.js';
import { outdoors, tiled, MUSH } from './rabbit.js';

const TINY = 0.13;       // three inches
const MU = { x: 0, z: 0, ...MUSH };

// An engraved cylinder's shading as a matcap (x across the tube as seen, y along it).
function neckShade() {
  const { c, g } = canvas(256, 256);
  g.fillStyle = '#eee7da'; g.fillRect(0, 0, 256, 256);   // the paper of her head drawing
  g.strokeStyle = INK;
  for (let x = 2; x < 256; x += 3) {
    const u = (x - 128) / 128, edge = Math.abs(u) + (u > 0 ? 0.12 : 0);   // a little heavier on the right
    const a = Math.max(0, Math.min(1, (edge - 0.45) / 0.5));
    if (a <= 0) continue;
    g.globalAlpha = 0.25 + 0.6 * a; g.lineWidth = 0.6 + 1.2 * a;
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (x % 7) * 0.2, 256); g.stroke();
  }
  g.globalAlpha = 1;
  return c;
}

// The thick wood at three-inch height, with the mushroom (shared with Chapter IV's end).
function wood(group, ai) {
  outdoors(group, ai);
  for (const [x, z, h, seed] of [[0, -1.0, 0.45, 1], [-0.5, -2.0, 0.6, 2], [0.6, -2.8, 0.7, 3], [0, 1.1, 0.3, 4]]) {
    const WG = ai['ch4/wood_grass'], grass = paperFlat(tiled(WG.tex, 10 / (h * WG.aspect)), 10, h, { edge: false }); // the tall grass of the wood (AI)
    grass.userData.front.material.map.offset.x = seed * 0.3; grass.position.set(x, 0, z); group.add(grass);
  }
  const mu = paperFlat(ai['ch5/mushroom'].tex, MU.w, MU.h); mu.position.set(MU.x, 0, MU.z); group.add(mu); // after plate 5.1 (AI)
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
      out1: at('hookah', 1), puffed: at('puffed'), out2: at('hookah', 2), in3: at('hookah', 3), out4: at('hookah', 4),
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
    const bit = (k) => paperFlat(ai[`ch5/mushroom_bit_${k}`].tex, 0.024, 0.024 / ai[`ch5/mushroom_bit_${k}`].aspect, { anchor: 'center' }); // AI
    const bitL = bit(1), bitR = bit(2);
    group.add(bitL, bitR);
    const think = thoughts(group, [{ t0: T.butterfly - 6, t1: T.butterfly + 6, art: ai['vignettes/chrysalis'].tex }]);

    const SPOT_A = { x: MU.x + 0.1, z: MU.z + 0.09 };
    function alice(t) {
      const s = route(t, [
        [0, SPOT_A], [T.turned, SPOT_A], [T.turned + 2, { x: MU.x + 0.3, z: MU.z + 0.15, dir: 1 }],   // "she turned away"
        [T.back, { x: MU.x + 0.3, z: MU.z + 0.15 }], [T.back + 2, SPOT_A],                              // "Alice turned and came back again"
        [T.broke - 3, SPOT_A], [T.broke - 1, { x: MU.x + 0.04, z: MU.z + 0.06 }],
      ], { phase: t * 3 });
      const squashed = t >= T.blow; // "a violent blow underneath her chin: it had struck her foot!"
      const scale = squashed ? lerp(TINY, 0.04, smooth((t - T.blow) / 0.4)) : TINY;
      // AI poses (2026-10-14): looking up at the Caterpillar; grave; turned away, offended; reciting with
      // folded hands; breaking off a piece with each hand; nibbling; squashed, chin against her foot.
      let pose = s.moving ? 'stand' : 'lookup';
      if (t >= T.gravely && t < T.gravely + 3) pose = 'grave';
      if (!s.moving && t >= T.turned + 2 && t < T.back) pose = 'away';
      if (t >= T.folded && t < T.notRight) pose = 'recite5'; // standing, hands folded
      if (!s.moving && t >= T.broke - 1 && t < T.nibbled) pose = 'break';
      if (t >= T.nibbled && t < T.blow) pose = 'nibble';
      if (squashed) pose = 'squashed';
      return { ...s, pose, scale: squashed ? lerp(TINY, 0.09, smooth((t - T.blow) / 0.4)) : scale, dir: pose === 'away' ? 1 : s.moving ? s.dir : -1 };
    }
    // Smoking while the hookah is in his mouth (the text says when it goes in and out); otherwise speaking
    // with it standing beside him; rearing up; yawning; crawling away (AI poses, 2026-10-14).
    const smoking = (t) => t < T.out1 + 0.8 || (t >= T.puffed - 1 && t < T.out2 + 0.7) || (t >= T.in3 && t < T.out4 + 0.7);
    function cat(t) {
      if (t < T.crawled) {
        let pose = smoking(t) ? 'sit' : 'speak';
        if (t >= T.rearing - 0.5 && t < T.rearing + 4) pose = 'rear';            // "rearing itself upright as it spoke"
        if (t >= T.yawned - 0.3 && t < T.yawned + 2.5) pose = 'yawn';            // "yawned once or twice, and shook itself"
        const shake = pose === 'yawn' ? Math.sin(t * 20) * 0.04 : 0;
        return { pose, x: MU.x + 0.01 + (pose === 'sit' ? 0 : -0.012), z: MU.z + 0.005, y: MU.seat, dir: -1, tilt: shake };
      }
      const k = smooth((t - T.crawled) / 5);
      return { pose: 'crawl', x: MU.x + 0.01 + k * 0.4, z: MU.z - k * 0.2, y: MU.seat * (1 - smooth((t - T.crawled) / 1.5)), dir: 1, visible: t < T.sight + 1 };
    }
    // The hookah, standing on the mushroom beside him when it isn't in his drawing.
    const H = ai['ch5/hookah'], hookah = paperFlat(H.tex, 0.058 * H.aspect, 0.058);
    hookah.position.set(MU.x + 0.04, MU.seat, MU.z - 0.002); group.add(hookah);
    function update(t, cast) {
      hookah.visible = cast.caterpillar.pose !== 'sit';
      const k = verses.findIndex((v, i) => t >= v - 0.3 && t < verses[i + 1] - 0.3);
      plates.forEach((p, i) => {
        p.visible = i === k;
        if (!p.visible) return;
        const turn = Math.min(1, (t - verses[i] + 0.3) / 0.5); // a page turning in
        p.position.set(MU.x + 0.26, 0.13, MU.z + 0.05);
        p.rotation.set(0, -0.35 + (1 - turn) * 1.4, 0);
      });
      const drawnBits = ['break', 'nibble', 'squashed'].includes(cast.alice.pose); // those drawings hold the pieces
      bitL.visible = bitR.visible = t >= T.broke && t < T.end + 2 && !drawnBits;
      if (bitL.visible) { carry(bitL, cast.alice); carry(bitR, cast.alice); bitR.position.x -= 0.03 * cast.alice.root.scale.x; }
      const a = alice(t);
      think(t, { x: a.x + 0.12, y: 0.19, z: a.z - 0.02 }, 0.1);
    }
    // (2026-10-14) Framed a little higher, so her feet are above the text strip, and both she and the
    // Caterpillar are in the conversation shot.
    const TALK = { pos: [0.25, 0.11, 0.48], look: [0.02, 0.1, 0] };
    const camera = cameraTrack([
      { t: 0, dur: 0, pos: [0.3, 0.13, 0.5], look: [0.04, 0.1, 0] },                           // looking at each other in silence
      { t: 8, dur: 4, ...TALK },                                                               // "Who are you?"
      { t: T.gravely - 1, dur: 2, pos: [0.34, 0.11, 0.42], look: [0.08, 0.1, 0.05] },
      { t: T.turned, dur: 3, pos: [0.45, 0.14, 0.55], look: [0.15, 0.09, 0.05] },                // turning away, and coming back
      { t: T.back + 3, dur: 3, ...TALK },
      { t: T.folded - 1, dur: 3, pos: [0.38, 0.12, 0.42], look: [0.18, 0.09, 0.05] },          // Father William, in Tenniel's plates
      { t: T.notRight, dur: 3, ...TALK },
      { t: T.rearing - 1, dur: 1.5, pos: [0.12, 0.13, 0.22], look: [0.01, 0.2, 0] },           // "a very good height indeed!"
      { t: T.rearing + 5, dur: 3, ...TALK },
      { t: T.crawled - 1, dur: 4, pos: [0.3, 0.12, 0.45], look: [0.15, 0.06, -0.05] },
      { t: T.broke - 2, dur: 3, pos: [0.14, 0.12, 0.28], look: [0.02, 0.08, 0.03] },            // a bit of the edge with each hand
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
    const T = { free: at('free'), green: at('green', 1), hands: at('hands', 1, at('free')), serpent: at('serpent', 1), hiss: at('hiss'), screamed: at('serpent', 2),
      eggs: at('eggs', 1), nest: at('nest'), crouched: at('crouched'), nibbling: at('nibbling', 1), end: at('right', 1, at('nibbling')) - 2 };
    // The leaves, far below, and sky.
    // "a sea of green leaves" (AI tile, coloured green: COLOR.md), 1.5 m a tile.
    const TT = ai['ch5/treetops'].tex.clone(); TT.wrapS = TT.wrapT = THREE.RepeatWrapping; TT.repeat.set(40, 40); TT.needsUpdate = true;
    const leaves = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ map: TT }));
    leaves.rotation.x = -Math.PI / 2; group.add(leaves);
    const sky = paperFlat(tiled(ai.sky.tex, 40 / (14 * ai.sky.aspect)), 40, 14, { edge: false, opaque: true }); sky.position.set(0, -2, -14); group.add(sky);
    const NEST = { x: 0.9, z: -0.7 };
    const nestCard = paperFlat(texture(nest()), 0.34, 0.19); nestCard.position.set(NEST.x, -0.03, NEST.z); group.add(nestCard);
    const think = thoughts(group, [{ t0: at('egg') - 1, t1: at('egg') + 8, art: ai['vignettes/eggs'].tex }]);

    // The neck: a paper tube with an inked outline, from below the leaves to her head, shaded like an engraved
    // cylinder (a matcap: fine hatching along its length, closer towards its edges, a little heavier on the right),
    // so it reads as a neck from any angle rather than a white post (play-through, 2026-10-15).
    // Her head (AI, 2026-10-15): head and hair, surprised; the drawn neck's cut edge is at 79% of the drawing's
    // height (21% up from its foot), 195 px of 685 wide, centred at 39.3% of its width. Above the cut the drawn
    // neck fades out (tools/ch5_art.py), and the tube runs up behind it, as wide as the drawn neck, flattened
    // against the drawing so it never shows in front of it: the two join without a seam (owner, 2026-10-15).
    const HD = ai['ch5/alice5_head'], HEAD_H = 0.46, HEAD_W = HEAD_H * HD.aspect, HEAD_TURN = 0.2;
    const NECK_U = 0.393, NECK_CUT = 0.21;
    const R = HEAD_W * (195 / 685) / 2 / 1.085; // half the drawn neck's width, less the ink outline (0.046 m)
    const paperMat = new THREE.MeshMatcapMaterial({ matcap: texture(neckShade()) }), inkMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
    const neck = new THREE.Mesh(new THREE.BufferGeometry(), paperMat), outline = new THREE.Mesh(new THREE.BufferGeometry(), inkMat);
    group.add(neck, outline);
    const head = new THREE.Mesh(new THREE.PlaneGeometry(HEAD_W, HEAD_H), new THREE.MeshBasicMaterial({ map: HD.tex, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide }));
    head.rotation.y = HEAD_TURN;
    group.add(head);
    const FACING = new THREE.Vector3(Math.sin(HEAD_TURN), 0, Math.cos(HEAD_TURN)); // the drawing's front
    const SEGS = 48, SIDES = 12;
    // Squash the tube's top towards the drawing's plane (depth only, so it looks the same from the front;
    // its normals stay round, so the shading does too): flat from the cut up, round again 0.1 m below.
    function flatten(geo, curve, cutY) {
      const p = geo.attributes.position, c = new THREE.Vector3(), v = new THREE.Vector3();
      for (let i = 0; i <= SEGS; i++) {
        curve.getPointAt(i / SEGS, c);
        const s = lerp(1, 0.25, smooth((c.y - cutY + 0.1) / 0.1));
        if (s === 1) continue;
        for (let j = 0; j <= SIDES; j++) {
          const k = i * (SIDES + 1) + j;
          v.fromBufferAttribute(p, k).sub(c);
          v.addScaledVector(FACING, v.dot(FACING) * (s - 1)).add(c);
          p.setXYZ(k, v.x, v.y, v.z);
        }
      }
      p.needsUpdate = true;
    }

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
      nestCard.visible = cast.pigeon.pose !== 'nest'; // the nesting drawing brings its own nest
      const h = headAt(t);
      const zig = smooth((t - T.serpent + 1) / 6) * (1 - smooth((t - T.hiss) / 0.5)) + 0.6 * smooth((t - T.crouched) / 3);
      // The drawing's cut edge sits at h.y - 0.08; the neck's centre there (N), on the drawing's plane.
      head.position.set(h.x + (0.5 - NECK_U) * HEAD_W, h.y - 0.08 + HEAD_H / 2 - NECK_CUT * HEAD_H, h.z + 0.01);
      const N = new THREE.Vector3((NECK_U - 0.5) * HEAD_W, 0, 0).applyAxisAngle(THREE.Object3D.DEFAULT_UP, HEAD_TURN);
      N.add(head.position).setY(h.y - 0.08);
      const top = N.clone().addScaledVector(FACING, -0.016); // just behind the drawing
      const pts = [new THREE.Vector3(0, -0.3, 0)];
      for (let i = 1; i <= 6; i++) {
        const k = i / 7;
        pts.push(new THREE.Vector3(lerp(0, top.x, k) + Math.sin(i * 2.1) * 0.25 * zig, lerp(-0.3, top.y - 0.12, k), lerp(0, top.z, k) + Math.cos(i * 1.7) * 0.15 * zig));
      }
      pts.push(top.clone().setY(top.y - 0.05), top.clone().setY(top.y + 0.045)); // straight up into the drawn neck, its open top hidden behind it
      const curve = new THREE.CatmullRomCurve3(pts);
      neck.geometry.dispose(); outline.geometry.dispose();
      neck.geometry = new THREE.TubeGeometry(curve, SEGS, R, SIDES, false);
      outline.geometry = new THREE.TubeGeometry(curve, SEGS, R * 1.085, SIDES, false);
      flatten(neck.geometry, curve, N.y); flatten(outline.geometry, curve, N.y);
      // The shaking leaves where her hands are.
      leaves.position.y = t >= T.hands && t < T.hands + 8 ? Math.sin(t * 25) * 0.003 : 0;
      think(t, { x: h.x - 0.35, y: h.y + 0.15, z: h.z }, 0.35);
    }
    function pigeon(t) {
      const onNest = { pose: 'nest', x: NEST.x, z: NEST.z + 0.02, y: -0.04, dir: 1 }; // the drawing has her nest and eggs
      if (t < T.hiss - 0.3) return onNest;
      const h = headAt(t);
      if (t < T.screamed + 3) { // "flown into her face, and was beating her violently with its wings"
        return { pose: 'fly', x: h.x + 0.12 + Math.sin(t * 9) * 0.05, z: h.z + 0.15, y: h.y + Math.sin(t * 13) * 0.04 - 0.05, dir: -1, scale: 1 + Math.sin(t * 22) * 0.08 };
      }
      if (t >= T.nest + 2) return onNest;
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
    const house = paperFlat(ai['ch6/little_house'].tex, 1.15, 1.15 / ai['ch6/little_house'].aspect); house.position.set(0.2, 0, -3.2); group.add(house); // "about four feet high"
    const alice = (t) => {
      const s = route(t, [[start, { x: 1.4, z: 0.6, dir: -1 }], [T.open + 1, { x: 0.8, z: -0.8 }]], { phase: t * 2.2 });
      const scale = lerp(1, 0.18, smooth((t - T.nibble - 1) / 4)); // "down to nine inches high"
      return { ...s, pose: !s.moving && t >= T.nibble - 1 && t < T.nibble + 5 ? 'nibble' : 'stand', scale };
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
