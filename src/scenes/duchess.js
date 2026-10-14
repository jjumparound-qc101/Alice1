// Chapter VI, "Pig and Pepper", in three scenes, all at nine-inch Alice's scale:
//   doorstep — the Fish- and Frog-Footmen and the Queen's great letter; the plate that skims out;
//   kitchen  — the smoky kitchen: the Duchess and the baby, the Cook and her missiles, the
//              Cheshire Cat on the hearth, the lullaby, the baby flung to Alice;
//   wood     — the baby turning into a pig; the Cheshire Cat on a bough, vanishing tail-first
//              until only the grin is left; the March Hare's house.
// Figures and props not yet drawn are placeholders from props6.js.
import * as THREE from 'three';
import { paperFlat } from '../stage.js';
import { texture, PAPER } from '../ink.js';
import { flagstones } from '../props.js';
import { littleHouse } from '../props5.js';
import { greatLetter, baby, kitchenWall, thrown, marchHareHouse, axisVignette, pigsVignette } from '../props6.js';
import { thoughts } from '../thoughts.js';
import { carry } from '../puppet.js';
import { smooth, lerp, route, cameraTrack } from '../track.js';
import { outdoors } from './rabbit.js';

const NINE = 0.18;   // "nine inches high"
const trees = (group, ai, spots) => spots.forEach(([x, z, h, s]) => { const t = paperFlat(ai.tree.tex, h * ai.tree.aspect, h); t.position.set(x, 0, z); t.scale.x = s; group.add(t); });

// --- 1. The doorstep -------------------------------------------------------------------
export const doorstep = {
  id: 'doorstep',
  title: 'The Footmen',
  start: () => 0,
  parts: (cue) => [{ title: 'No sort of use in knocking', t: cue.at('knocked') - 2 }],
  build({ group, ai, cue }) {
    const at = cue.at;
    const T = { footman: at('footman', 1), rapped: at('rapped'), opened: at('footman', 3), letter: at('letter'), handed: at('croquet', 1) - 4,
      bowed: at('bowed'), laughed: at('laughed'), peeped: at('peeped'), knocked: at('knocked'), plate: at('plate'), whistling: at('whistling'), kitchen: at('kitchen') };
    outdoors(group, ai, { groundRepeat: 40 });
    trees(group, ai, [[-1.6, -0.4, 3.2, 1], [1.4, -1.6, 3.4, -1], [-2.4, -2.6, 3.6, 1], [2.6, -0.2, 3.2, -1]]);
    const house = paperFlat(texture(littleHouse()), 1.15, 1.22); house.position.set(0, 0, -0.6); group.add(house);
    const letter = paperFlat(texture(greatLetter()), 0.16, 0.104, { anchor: 'center' }); group.add(letter);
    const plate = paperFlat(texture((() => { const c = document.createElement('canvas'); c.width = 200; c.height = 120; const g = c.getContext('2d'); g.fillStyle = PAPER; g.strokeStyle = '#17140f'; g.lineWidth = 6; g.beginPath(); g.ellipse(100, 60, 90, 50, 0, 0, Math.PI * 2); g.fill(); g.stroke(); return c; })()), 0.08, 0.05, { anchor: 'center' });
    group.add(plate);
    const DOOR = { x: 0, z: -0.5 };
    const fish = (t) => {
      const s = route(t, [[0, { x: -2.2, z: 0.4, dir: 1 }], [T.rapped - 0.5, { x: DOOR.x - 0.16, z: DOOR.z + 0.1 }], [T.peeped - 3, { x: DOOR.x - 0.16, z: DOOR.z + 0.1 }], [T.peeped, { x: 1.6, z: 0.6, dir: 1 }]], { pose: 'stand', phase: t * 3 });
      const bow = t >= T.bowed && t < T.laughed ? smooth((t - T.bowed) / 0.8) * 0.5 : 0;
      return { ...s, dir: s.moving ? s.dir : 1, tilt: -bow, visible: t < T.peeped };
    };
    const frog = (t) => {
      if (t < T.opened - 0.5) return { visible: false };
      const sitting = t >= T.peeped - 2;
      const bow = t >= T.bowed && t < T.laughed ? smooth((t - T.bowed) / 0.8) * 0.5 : 0;
      return { pose: sitting ? 'sit' : 'stand', x: sitting ? DOOR.x + 0.22 : DOOR.x + 0.08, z: DOOR.z + (sitting ? 0.18 : 0.1), dir: -1, tilt: bow };
    };
    const alice = (t) => {
      const s = route(t, [
        [0, { x: -1.15, z: 0.0, dir: 1 }], [T.laughed, { x: -1.15, z: 0.0 }], [T.laughed + 1.5, { x: -1.55, z: -0.25 }],   // back into the wood
        [T.peeped - 1, { x: -1.55, z: -0.25 }], [T.peeped, { x: -1.15, z: 0.0 }], [T.knocked - 0.5, { x: DOOR.x - 0.12, z: DOOR.z + 0.2 }],
        [T.kitchen - 4, { x: DOOR.x - 0.12, z: DOOR.z + 0.2 }], [T.kitchen - 2, { x: DOOR.x, z: DOOR.z + 0.05 }],
      ], { phase: t * 2.2 });
      const laughing = t >= T.laughed && t < T.laughed + 1.5 ? Math.sin(t * 25) * 0.05 : 0;
      return { ...s, pose: 'stand', scale: NINE, tilt: laughing, visible: t < T.kitchen - 2 };
    };
    function update(t, cast) {
      // The great letter: under the Fish-Footman's arm, handed over, then into the house.
      letter.visible = t < T.peeped - 1;
      if (t < T.handed) carry(letter, cast.fish); else carry(letter, cast.frog);
      // "a large plate came skimming out, straight at the Footman's head … broke to pieces against one of the trees"
      const k = (t - T.plate) / 1.3;
      plate.visible = k > 0 && k < 1;
      plate.position.set(lerp(DOOR.x, 1.35, k), 0.25 + Math.sin(k * Math.PI) * 0.05, lerp(DOOR.z + 0.05, -1.5, k));
      plate.rotation.z = k * 12;
    }
    const camera = cameraTrack([
      { t: 0, dur: 0, pos: [-1.0, 0.25, 1.4], look: [-0.4, 0.2, -0.3] },
      { t: T.rapped - 2, dur: 3, pos: [0.15, 0.22, 0.6], look: [0, 0.2, -0.5] },               // the Footmen and the letter
      { t: T.laughed - 1, dur: 2, pos: [-0.9, 0.2, 0.7], look: [-1.3, 0.13, -0.1] },           // Alice laughing in the wood
      { t: T.peeped, dur: 3, pos: [0.0, 0.3, 0.9], look: [0.05, 0.1, -0.4] },                  // the Frog-Footman on the ground
      { t: T.knocked - 1, dur: 2, pos: [0.25, 0.18, 0.4], look: [-0.05, 0.14, -0.4] },
      { t: T.plate - 1, dur: 1, pos: [0.55, 0.22, 0.5], look: [0.3, 0.2, -0.7] },              // the plate
      { t: T.plate + 3, dur: 2, pos: [0.25, 0.18, 0.4], look: [-0.05, 0.14, -0.4] },
    ]);
    return { T, bg: PAPER, fog: [6, 24], bounds: null, hotspots: [], camera, update, actors: (t) => ({ alice: alice(t), fish: fish(t), frog: frog(t) }) };
  },
};

// --- 2. The kitchen --------------------------------------------------------------------
const K = { w: 1.6, h: 0.9, z0: -0.6, z1: 0.6 };
export const kitchen = {
  id: 'kitchen',
  title: 'The kitchen',
  start: (cue) => cue.at('kitchen') - 1,
  parts: (cue) => [
    { title: 'A shower of saucepans', t: cue.at('fire-irons') - 6 },
    { title: 'The lullaby', t: cue.at('lullaby') - 2 },
  ],
  build({ group, ai, cue }) {
    const at = cue.at;
    const start = kitchen.start(cue);
    const T = { cat: at('cat', 1), pig: at('pig'), irons: at('fire-irons'), nose: at('nose', 2), axes: at('axes'), lullaby: at('lullaby'),
      verse2: at('wow', 3) + 1, nurse: at('nurse'), fling: at('flinging'), pan: at('frying-pan'), air: at('air', 2) };
    // The room: the back wall with the fireplace, plain side walls, flagstones, a low ceiling; smoke is the fog.
    const plain = (map, side = THREE.FrontSide) => new THREE.MeshBasicMaterial({ map, side });
    const back = new THREE.Mesh(new THREE.PlaneGeometry(K.w, K.h), plain(texture(kitchenWall()))); back.position.set(0, K.h / 2, K.z0); group.add(back);
    for (const s of [-1, 1]) { const side = new THREE.Mesh(new THREE.PlaneGeometry(K.z1 - K.z0, K.h), plain(texture(kitchenWall()))); side.rotation.y = -s * Math.PI / 2; side.position.set(s * K.w / 2, K.h / 2, 0); group.add(side); }
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(K.w, K.z1 - K.z0), plain(texture(flagstones(), { repeat: [4, 3] }))); floor.rotation.x = -Math.PI / 2; group.add(floor);
    // The Cat on the hearth: AI drawing (gpt-image-2.5-sunburst, from cheshire_bough), on his patch of hearthstone.
    const catArt = ai['ch6/cheshire_hearth'], catOnHearth = paperFlat(catArt.tex, 0.13, 0.13 / catArt.aspect); catOnHearth.position.set(0.42, 0, K.z0 + 0.12); group.add(catOnHearth);
    const babyArt = [0, 1, 2].map((s) => texture(baby(s)));
    const babyCard = paperFlat(babyArt[0], 0.1, 0.083, { anchor: 'center' }); group.add(babyCard);
    const kinds = ['irons', 'saucepan', 'plate', 'plate', 'saucepan', 'plate', 'pan'];
    const missiles = kinds.map((k) => { const m = paperFlat(texture(thrown(k)), 0.07, 0.042, { anchor: 'center' }); group.add(m); return m; });
    const think = thoughts(group, [{ t0: at('axis') - 1, t1: T.axes, art: axisVignette() }]);
    const DUCHESS = { x: 0.05, z: -0.15 }, COOK = { x: -0.32, z: -0.42 }, ALICE = { x: 0.42, z: 0.12 };
    const duchessA = (t) => {
      const s = route(t, [[start, DUCHESS], [T.fling + 1, DUCHESS], [T.fling + 4, { x: 0.85, z: 0.5, dir: 1 }]], { phase: t * 3 }); // "she hurried out of the room"
      // Sitting with the baby; tossing it through the lullaby; flinging it; hurrying out.
      const pose = t >= T.fling ? 'run' : t >= T.fling - 0.6 ? 'fling' : t >= T.verse2 - 1 ? 'toss' : 'sit';
      return { ...s, pose, dir: s.moving || pose === 'run' ? 1 : -1, visible: t < T.fling + 4 };
    };
    const cookA = (t) => {
      const throwing = (t >= T.irons - 1 && t < T.axes - 4) || (t >= T.pan - 1 && t < T.pan + 1);
      return { pose: throwing ? 'throw' : 'stir', ...COOK, dir: 1 };
    };
    const aliceA = (t) => {
      const s = route(t, [[start, { x: 0.78, z: 0.4, dir: -1 }], [start + 3, ALICE]], { phase: t * 2.2 });
      const terror = t >= T.nose - 6 && t < T.nose + 3 ? Math.abs(Math.sin(t * 8)) * 0.03 : 0; // "jumping up and down in an agony of terror"
      const sneeze = Math.sin(t * 0.9) > 0.97 ? 0.15 : 0;
      return { ...s, pose: 'stand', scale: NINE, y: terror, tilt: sneeze };
    };
    function update(t, cast) {
      // The baby: in the Duchess's lap, tossed in the lullaby, flung to Alice.
      const d = cast.duchess.root.position;
      babyCard.visible = t >= T.fling; // until it is flung, the baby is in the Duchess's drawings
      if (t < T.fling) {
        const toss = t >= T.verse2 && t < T.fling ? Math.abs(Math.sin(t * 5)) * 0.08 : 0;
        babyCard.position.set(d.x - 0.01, (duchessA(t).pose === 'sit' ? 0.14 : 0.2) + toss, d.z + 0.04);
        babyCard.rotation.set(0, 0, Math.sin(t * 7) * 0.2);
      } else if (t < T.fling + 1) {
        const k = t - T.fling; babyCard.position.set(lerp(d.x, ALICE.x, k), 0.16 + Math.sin(k * Math.PI) * 0.15, lerp(d.z, ALICE.z, k) + 0.04); babyCard.rotation.z = k * 6;
      } else { carry(babyCard, cast.alice); babyCard.rotation.z += Math.sin(t * 9) * 0.25; } // "kept doubling itself up and straightening itself out"
      // The Cook's missiles at the Duchess and the baby; the frying-pan after the Duchess.
      missiles.forEach((m, i) => {
        let k = -1, to = { x: d.x, y: 0.2, z: d.z };
        if (t >= T.irons && t < T.axes - 4) k = ((t - T.irons) * 0.9 + i / missiles.length) % 1;
        if (i === missiles.length - 1) { k = t >= T.pan && t < T.pan + 1 ? t - T.pan : -1; to = { x: 0.95, y: 0.2, z: 0.5 }; }
        m.visible = k >= 0 && (i === missiles.length - 1 || i < missiles.length - 1);
        if (!m.visible) return;
        m.position.set(lerp(COOK.x, to.x + (i % 2 ? 0.08 : -0.06), k), 0.25 + Math.sin(k * Math.PI) * 0.18, lerp(COOK.z, to.z + 0.05, k));
        m.rotation.z = k * 9 + i;
      });
      catOnHearth.visible = true;
      think(t, { x: ALICE.x - 0.1, y: 0.32, z: ALICE.z }, 0.16);
    }
    const camera = cameraTrack([
      { t: start, dur: 0, pos: [0.65, 0.3, 0.65], look: [0, 0.22, -0.4] },                    // a large kitchen full of smoke
      { t: T.cat - 1, dur: 2, pos: [0.2, 0.12, 0.05], look: [0.42, 0.07, K.z0 + 0.12] },          // the cat grinning on the hearth
      { t: T.pig - 0.5, dur: 1, pos: [0.25, 0.2, 0.35], look: [0.05, 0.17, -0.15] },              // "Pig!"
      { t: T.irons - 1, dur: 2, pos: [0.45, 0.32, 0.6], look: [-0.1, 0.2, -0.3] },                // a shower of saucepans
      { t: T.lullaby, dur: 3, pos: [0.25, 0.22, 0.4], look: [0.05, 0.2, -0.15] },                // the lullaby
      { t: T.fling - 1, dur: 2, pos: [0.55, 0.25, 0.55], look: [0.2, 0.16, -0.05] },
      { t: T.fling + 4, dur: 3, pos: [0.55, 0.2, 0.45], look: [ALICE.x, 0.18, ALICE.z] },        // a queer-shaped little creature
    ]);
    return {
      T, bg: '#d8d0bf', fog: [0.5, 3.2], bounds: null, hotspots: [], camera, update,
      actors: (t) => ({ alice: aliceA(t), duchess: duchessA(t), cook: cookA(t) }),
    };
  },
};

// --- 3. The wood -----------------------------------------------------------------------
export const wood6 = {
  id: 'wood6',
  title: 'Pig',
  start: (cue) => cue.at('air', 2) - 1,
  parts: (cue) => [
    { title: 'The Cheshire Cat', t: cue.at('bough') - 2 },
    { title: 'A grin without a cat', t: cue.at('slowly') - 2 },
  ],
  build({ group, ai, cue }) {
    const at = cue.at;
    const start = wood6.start(cue);
    const T = { snout: at('snout'), pig: at('pig', 2), trot: at('trot'), children: at('pig', 4) - 4, bough: at('bough'), paw1: at('paw', 1), paw2: at('paw', 2),
      vanished: at('vanished', 1), appeared: at('appeared'), vanished2: at('vanished', 2), again: at('cat', 1, at('hare', 2)) , slowly: at('slowly'),
      grinGone: at('grin', 4) + 1, hare: at('hare', 4), two: at('two', 1, at('hare', 4)) };
    outdoors(group, ai, { groundRepeat: 40 });
    trees(group, ai, [[-1.2, -1.0, 3.4, 1], [1.4, -1.4, 3.2, -1], [-4.1, -2.0, 3.6, 1], [0.2, -3.2, 3.6, -1], [-2.4, -3.6, 3.4, 1]]);
    const hare = paperFlat(texture(marchHareHouse()), 1.6, 1.4); hare.position.set(-5.2, 0, -4.2); group.add(hare);
    // The baby, carried; it changes as it grunts.
    const babyArt = [0, 1, 2].map((s) => texture(baby(s)));
    const babyCard = paperFlat(babyArt[0], 0.1, 0.083, { anchor: 'center' }); group.add(babyCard);
    // Two boughs with the Cat: the first, and the "branch of a tree" where it appears again.
    // AI drawings (tools/ch6_art.py), all on one canvas so they line up: the bough alone; the
    // Cat on the bough; and the grin alone. The empty bough stays when the Cat vanishes.
    const CW = 0.5, CH = CW / ai['ch6/cheshire_bough'].aspect;
    const BOUGH_DROP = CH * 0.52; // the bough runs about half-way down the drawing
    const boughs = [{ x: -1.25, y: 0.42, z: -0.5 }, { x: -2.75, y: 0.48, z: -0.2 }].map((p) => {
      const b = paperFlat(ai['ch6/cheshire_bough_empty'].tex, CW, CH, { edge: false }); b.position.set(p.x, p.y - BOUGH_DROP, p.z); group.add(b); return p;
    });
    // The Cat, and its grin on a separate card in the same place, so the Cat can fade from
    // the tail while the grin stays. A clipping plane sweeps from the tail (right) to the head.
    const catCard = paperFlat(ai['ch6/cheshire_bough'].tex, CW, CH, { edge: false }), grinCard = paperFlat(ai['ch6/cheshire_grin'].tex, CW, CH, { edge: false });
    const clip = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 10);
    catCard.traverse((m) => { if (m.material) { m.material.clippingPlanes = [clip]; } });
    group.add(catCard, grinCard);
    const think = thoughts(group, [{ t0: T.children, t1: T.children + 8, art: pigsVignette() }]);

    const aliceA = (t) => {
      const s = route(t, [
        [start, { x: 1.4, z: 0.3, dir: -1 }], [T.trot - 2, { x: -0.4, z: 0.1 }], [T.trot + 6, { x: -0.4, z: 0.1 }],
        [T.bough + 1, { x: -0.95, z: -0.2 }], [T.vanished2 + 6, { x: -0.95, z: -0.2 }], [T.again - 1, { x: -2.6, z: -0.4 }],
        [T.hare + 1, { x: -2.6, z: -0.4 }], [T.hare + 9, { x: -3.6, z: -1.4 }],
      ], { phase: t * 2.2 });
      const scale = lerp(NINE, 0.38, smooth((t - T.two) / 3)); // "raised herself to about two feet high"
      return { ...s, pose: 'stand', scale, dir: s.moving ? s.dir : -1 };
    };
    const pigA = (t) => {
      if (t < T.trot - 0.5) return { visible: false };
      const s = route(t, [[T.trot - 0.5, { x: -0.5, z: 0.15, dir: 1 }], [T.trot + 6, { x: 0.8, z: -1.6 }]], { pose: 'trot', phase: t * 3 });
      return { ...s, visible: t < T.trot + 6 };
    };
    function update(t, cast) {
      // The baby: a star-fish, then a snout, then a pig; set down, and it trots away.
      babyCard.visible = t < T.trot - 0.5;
      const stage = t >= T.pig ? 2 : t >= T.snout - 1 ? 1 : 0;
      babyCard.userData.front.material.map = babyArt[stage];
      if (babyCard.visible) carry(babyCard, cast.alice);
      // The Cat: on the first bough; vanishes and appears; on the second; then fades slowly.
      const b = t < T.again - 0.5 ? boughs[0] : boughs[1];
      const shown = t >= T.bough - 0.5 && !(t >= T.vanished && t < T.appeared) && !(t >= T.vanished2 && t < T.again);
      catCard.visible = shown && t < T.slowly + 4;
      grinCard.visible = shown && t < T.grinGone;
      const wave = (t >= T.paw1 && t < T.paw1 + 3) || (t >= T.paw2 && t < T.paw2 + 3) ? Math.sin(t * 6) * 0.08 : 0;
      for (const card of [catCard, grinCard]) { card.position.set(b.x, b.y - BOUGH_DROP, b.z + 0.004 + (card === grinCard ? 0.002 : 0)); card.rotation.z = wave * 0.3; }
      // "beginning with the end of the tail, and ending with the grin"
      const k = smooth((t - T.slowly) / 3.5);
      clip.constant = lerp(b.x + CW / 2 + 0.01, b.x - CW / 2 - 0.01, k);
      grinCard.userData.front.material.opacity = 1 - smooth((t - T.grinGone + 1.5) / 1.5);
      grinCard.userData.front.material.transparent = true;
      const a = aliceA(t);
      think(t, { x: a.x - 0.18, y: 0.32, z: a.z }, 0.17);
    }
    const B0 = boughs[0], B1 = boughs[1];
    // Where the grin is drawn on the second bough's card (about a third across, half-way down).
    const GRIN1 = { x: B1.x + (0.33 - 0.5) * CW, y: B1.y - BOUGH_DROP + CH * 0.52 };
    const camera = cameraTrack([
      { t: start, dur: 0, pos: [1.8, 0.25, 1.0], look: [1.0, 0.15, 0.0] },                         // out into the open air
      { t: start + 4, dur: 20, pos: [0.4, 0.2, 0.9], look: [-0.2, 0.15, 0.0] },
      { t: T.snout - 2, dur: 2, pos: [-0.05, 0.17, 0.55], look: [-0.3, 0.15, 0.1] },               // a very turn-up nose
      { t: T.trot - 2, dur: 3, pos: [0.0, 0.25, 0.9], look: [0.0, 0.05, -0.5] },                   // the pig trots away
      { t: T.bough - 1, dur: 3, pos: [-0.5, 0.18, 0.55], look: [-1.1, 0.3, -0.35] },               // the Cheshire Cat on a bough
      { t: T.bough + 30, dur: 6, pos: [-0.75, 0.25, 0.35], look: [B0.x, B0.y + 0.05, B0.z] },
      { t: T.vanished2 + 3, dur: 6, pos: [-2.0, 0.3, 0.45], look: [-2.9, 0.5, -0.7] },
      { t: T.slowly - 2, dur: 2, pos: [GRIN1.x + 0.12, GRIN1.y + 0.03, B1.z + 0.42], look: [GRIN1.x, GRIN1.y, B1.z] }, // a grin without a cat
      { t: T.hare - 1, dur: 4, pos: [-2.4, 0.35, 0.4], look: [-5.0, 0.5, -4.0] },                  // the March Hare's house
    ]);
    return { T, bg: PAPER, fog: [6, 24], bounds: null, hotspots: [], camera, update, actors: (t) => ({ alice: aliceA(t), pig: pigA(t) }) };
  },
};

export const CHAPTER_6 = [doorstep, kitchen, wood6];
