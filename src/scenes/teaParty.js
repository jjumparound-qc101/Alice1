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
import { texture, canvas, rng, INK, PAPER } from '@engine/ink.js';
import { gardenBehind } from '../sets/croquet.js';
import { buildHall, TABLE, DOOR, KEY } from '../sets/hall.js';
import { thoughts } from '@engine/thoughts.js';
import { carry } from '@engine/puppet.js';
import { smooth, lerp, route, cameraTrack } from '@engine/track.js';
import { outdoors } from './rabbit.js';

const TWO_FEET = 0.4;                       // Alice is about two feet high (Chapter VI's end)
// The long table (owner, 2026-10-25: the overhaul): Alice's end where it was, the far end longer, a cloth top and a
// cloth hanging on all four sides; the three sit behind it on their own chairs, on the ground.
// (Owner, 2026-10-26, the second overhaul: "The table was a large one": twice as long, twice as wide, 80% as tall,
// laid on both sides; the people and chairs keep their size. The near edge stays where it was.)
const TBL = { x0: -1.2, x1: 5.0, z: -0.65, d: 1.0, h: 0.19 };
const BEHIND = TBL.z - TBL.d / 2 - 0.04;     // where the seated sit, their chairs clear of the table
// Seats along the far side of the table (x), for moving one place on.
const SEATS = [0.55, 0.3, 0.05, -0.2, -0.45, -0.7];
// "Move down!" on the paint set (owner, 2026-10-27, the second overhaul's step 6): the three shift one seat along
// the far side at a press, `group.userData.moveDown` seats from the book's places (a fraction while they go), and
// leave a dirty cup at each seat they have used (`group.userData.dirty` of them, MOVES at most). Not in the book.
const STEP = SEATS[0] - SEATS[1], MOVES = 18;
const ARMCHAIR = { x: TBL.x0 - 0.2, z: TBL.z + 0.1 }; // at the end of the table, just clear of it
const CHAIR_FRONT = { x: ARMCHAIR.x - 0.05, z: ARMCHAIR.z + 0.3 }; // standing just in front of it, clear of its drawing
const FAR = TBL.z - TBL.d / 2 + 0.15;        // the line of the three's places, a reach in from the far edge
const NEAR = TBL.z + TBL.d / 2 - 0.15;       // the places laid on the near side
const NEAR_CHAIRS = [0.15, 1.15, 2.15, 3.15, 4.15]; // empty chairs on the near side, spaced to step in between
const ALICE_PLACE = { x: SEATS[3] - 0.08, z: BEHIND + 0.01, dir: 1 }; // "Alice rather unwillingly took the place of the March Hare"

// Life in the scene (owner, 2026-10-26, the second overhaul's step 4), drawn here; the steam and the leaves take
// paint (J, after step 4). A wisp of steam, a curl of paper rising with an ink edge, and a fallen oak leaf.
function steamTex() {
  const { c, g } = canvas(64, 192);
  g.lineCap = 'round';
  const curl = (x0) => { g.beginPath(); for (let y = 180; y > 14; y -= 4) g.lineTo(x0 + Math.sin(y / 22 + x0) * (6 + (180 - y) / 14), y); };
  for (const [x0, w] of [[28, 13], [38, 9]]) {
    curl(x0); g.strokeStyle = INK; g.lineWidth = w + 4; g.stroke();
    curl(x0); g.strokeStyle = PAPER; g.lineWidth = w; g.stroke();
  }
  return texture(c);
}
function leafTex() {
  const { c, g } = canvas(64, 96), r = rng(11);
  g.beginPath(); g.moveTo(32, 90);
  // Oak lobes up one side and down the other.
  for (let i = 0; i <= 5; i++) { const y = 82 - i * 14, k = Math.sin((i + 0.5) / 6 * Math.PI); g.quadraticCurveTo(32 - 30 * k, y - 4, 32 - 12 * k, y - 10); }
  g.quadraticCurveTo(32, 2, 36, 8);
  for (let i = 5; i >= 0; i--) { const y = 82 - i * 14, k = Math.sin((i + 0.5) / 6 * Math.PI); g.quadraticCurveTo(32 + 30 * k, y - 10, 32 + 12 * k, y - 4); }
  g.closePath(); g.fillStyle = PAPER; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
  g.lineWidth = 2.5; g.beginPath(); g.moveTo(32, 92); g.lineTo(32, 10); g.stroke();
  for (let i = 0; i < 5; i++) { const y = 74 - i * 13; g.beginPath(); g.moveTo(32, y); g.lineTo(32 - 14 - r() * 4, y - 8); g.moveTo(32, y - 3); g.lineTo(32 + 14 + r() * 4, y - 11); g.stroke(); }
  return texture(c);
}

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
    for (const [x, z, h, s] of [[-3.4, -2.6, 3.4, 1], [6.8, -2.0, 3.6, -1], [-4.5, -0.5, 3.4, -1]]) {
      const t = paperFlat(ai.tree.tex, h * ai.tree.aspect, h); t.position.set(x, 0, z); t.scale.x = s; group.add(t);
    }
    // (2026-10-26: close behind the table and large, its ear chimneys and fur roof a centrepiece to paint.)
    const house = paperFlat(ai['ch6/march_hare_house'].tex, 3.4, 3.4 / ai['ch6/march_hare_house'].aspect); house.position.set(3.7, 0, -2.5); group.add(house);
    // "a table set out under a tree in front of the house" (2026-10-26): one great oak behind the three, its crown
    // spreading over their end of the table, and its leaves overhead, seen from below as you stand at the table.
    const OAK = ai['ch7/tea_oak'], oak = paperFlat(OAK.tex, 5.6, 5.6 / OAK.aspect); oak.position.set(-1.7, 0, -2.0); group.add(oak);
    const CAN = ai['ch7/tea_canopy'], canopy = paperFlat(CAN.tex, 5.2, 5.2 / CAN.aspect, { anchor: 'center', edge: false });
    canopy.rotation.x = Math.PI / 2; canopy.position.set(-0.2, 2.2, -0.7); group.add(canopy);
    // The long table: its edge, and on it the cloth top (AI, 2026-10-25: a drawing, so it can be painted).
    const L = TBL.x1 - TBL.x0, topGeo = new THREE.BoxGeometry(L, 0.015, TBL.d);
    const top = new THREE.Mesh(topGeo, new THREE.MeshBasicMaterial({ color: '#f6f2e8' }));
    top.add(new THREE.LineSegments(new THREE.EdgesGeometry(topGeo), new THREE.LineBasicMaterial({ color: INK })));
    top.position.set((TBL.x0 + TBL.x1) / 2, TBL.h - 0.008, TBL.z); group.add(top);
    const TT = ai['ch7/tea_tabletop_plain'].tex.clone(); TT.wrapS = THREE.MirroredRepeatWrapping; TT.repeat.set(L / TBL.d, 1); TT.anisotropy = 8; TT.needsUpdate = true;
    const topCloth = new THREE.Mesh(new THREE.PlaneGeometry(L, TBL.d), new THREE.MeshBasicMaterial({ map: TT }));
    topCloth.userData.piece = true; topCloth.rotation.x = -Math.PI / 2; topCloth.position.set((TBL.x0 + TBL.x1) / 2, TBL.h + 0.001, TBL.z); group.add(topCloth);
    // The tea things (AI, 2026-10-15, tools/tea_art.py, after plates 7.1-7.3): the hanging cloth repeated along the
    // table; "it's laid for a great many more than three": cups and saucers, plates of bread-and-butter, the
    // milk-jug by the March Hare (he upsets it into his plate), the teapot (the Dormouse's, plate 7.3).
    // (2026-10-26: the plain cloth with a knotted fringe, as Tenniel drew it, mirrored fold to fold along the table.)
    const CL = ai['ch7/tea_cloth_plain'], clothTex = CL.tex.clone(), clothTile = TBL.h * CL.aspect;
    clothTex.wrapS = THREE.MirroredRepeatWrapping; clothTex.repeat.set((TBL.x1 - TBL.x0) / clothTile, 1); clothTex.needsUpdate = true;
    const cloth = paperFlat(clothTex, TBL.x1 - TBL.x0, TBL.h, { edge: false }); cloth.userData.front.userData.piece = true; cloth.position.set((TBL.x0 + TBL.x1) / 2, 0, TBL.z + TBL.d / 2 + 0.003); group.add(cloth);
    // ... and on the far side and both ends (2026-10-25: the far side was open).
    const back = paperFlat(clothTex, L, TBL.h, { edge: false }); back.rotation.y = Math.PI; back.position.set((TBL.x0 + TBL.x1) / 2, 0, TBL.z - TBL.d / 2 - 0.003); group.add(back);
    const endTex = CL.tex.clone(); endTex.wrapS = THREE.MirroredRepeatWrapping; endTex.repeat.set(TBL.d / clothTile, 1); endTex.needsUpdate = true;
    for (const [x, r] of [[TBL.x0 - 0.003, -Math.PI / 2], [TBL.x1 + 0.003, Math.PI / 2]]) {
      const e = paperFlat(endTex, TBL.d, TBL.h, { edge: false }); e.rotation.y = r; e.position.set(x, 0, TBL.z); group.add(e);
    }
    const art = (n, w, opts) => { const a = ai[`ch7/${n}`]; return paperFlat(a.tex, w, w / a.aspect, opts); };
    // Laid all along (2026-10-25: more of it, and untidy, as the three leave it: they move one place on at every cup).
    // (2026-10-26: laid on both sides of the wider table, a place every half metre or so.)
    for (const [row, z, n] of [[0, FAR, 18], [1, NEAR, 16]]) {
      for (let i = 0; i < n; i++) {
        const tipped = (row === 0 && (i === 4 || i === 11)) || (row === 1 && i === 9), c = art(tipped ? 'tea_cup_tipped' : 'teacup', tipped ? 0.085 : 0.07);
        c.position.set(lerp(TBL.x0 + 0.15, TBL.x1 - 0.15, i / (n - 1)) + (i % 3 - 1) * 0.02, TBL.h + 0.008, z + (i % 2 ? 0.04 : -0.04)); group.add(c);
      }
    }
    for (const [x, z] of [[-0.95, NEAR - 0.12], [0.35, FAR + 0.14], [1.4, NEAR - 0.12], [2.6, FAR + 0.14], [3.5, NEAR - 0.12], [4.5, FAR + 0.14]]) {
      const p = art('plate_bread', 0.09); p.position.set(x, TBL.h + 0.008, z); group.add(p);
    }
    for (const x of [1.0, 3.9]) { const cakes = art('tea_cake_stand', 0.11); cakes.position.set(x, TBL.h + 0.008, TBL.z); group.add(cakes); }
    for (const x of [-0.75, 2.4]) { const sugar = art('tea_sugar_bowl', 0.1); sugar.position.set(x, TBL.h + 0.008, TBL.z + 0.05); group.add(sugar); }
    const pot2 = art('teapot', 0.13); pot2.position.set(3.2, TBL.h + 0.008, TBL.z - 0.05); pot2.scale.x = -1; group.add(pot2);
    // The empty places along the far side, mismatched chairs ("a great many more than three"): left of the
    // three, and all along the far end.
    const CH = ['tea_chair_windsor', 'tea_chair_ladder'], CB = ['tea_chair_back_windsor', 'tea_chair_back_ladder'];
    const empty = [];
    for (const [i, x] of [-1.0, -0.82, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.2, 3.6, 4.0, 4.4, 4.8].entries()) {
      const c = art(CH[i % 2], 0.3 * ai[`ch7/${CH[i % 2]}`].aspect, { edge: false }); c.position.set(x, 0, BEHIND - 0.02); if (i % 3 === 1) c.scale.x = -1; group.add(c);
      // (2026-10-26: their backs drawn too, for the painter who walks round to the far side, where the music box is.)
      const b = art(CB[i % 2], 0.3 * ai[`ch7/${CB[i % 2]}`].aspect, { edge: false }); b.rotation.y = Math.PI; b.position.set(x, 0, BEHIND - 0.03); if (i % 3 !== 1) b.scale.x = -1; group.add(b);
      for (const m of [c, b]) m.userData.front.material.side = THREE.FrontSide;   // each drawing seen from its own side only
      empty.push({ x, m: [c, b] });
    }
    // ... and on the near side, seen from behind, spaced so the painter can step in between and reach the middle.
    for (const [i, x] of NEAR_CHAIRS.entries()) {
      const c = art(CB[i % 2], 0.3 * ai[`ch7/${CB[i % 2]}`].aspect); c.position.set(x, 0, TBL.z + TBL.d / 2 + 0.08); if (i % 2) c.scale.x = -1; group.add(c);
    }
    // The book's own things (2026-10-26): the bread-knife ("you shouldn't have put it in with the bread-knife"), the
    // butter ("It was the best butter"), and under a chair on the far side Chapter VII's hidden music box.
    const knife = art('tea_bread_knife', 0.13); knife.position.set(SEATS[1] + 0.12, TBL.h + 0.008, FAR + 0.12); group.add(knife);
    const butter = art('tea_butter_dish', 0.09); butter.position.set(SEATS[3] + 0.22, TBL.h + 0.008, FAR + 0.1); group.add(butter);
    // Fun things down the middle of the table (owner, 2026-10-26), clear of the three's corner so no shot loses
    // them: the decanter, empty ("I don't see any wine"); the raven on a writing-desk (the riddle); a carriage clock
    // stopped at six ("it's always six o'clock now"); the treacle tin (the treacle-well); and, at the far end, the
    // Hatter's hats for sale, each ticketed 10/6.
    for (const [n, w, x, dz] of [['tea_decanter', 0.14, 1.25, 0.1], ['tea_clock', 0.08, 1.65, -0.1], ['tea_raven_desk', 0.16, 2.05, 0.05],
      ['tea_treacle_tin', 0.09, 2.85, 0.1], ['tea_hat_stack', 0.1, 4.4, -0.05]]) {
      const o = art(n, w); o.position.set(x, TBL.h + 0.008, TBL.z + dz); group.add(o);
    }
    const musicBox = art('tea_music_box_shut', 0.08); musicBox.position.set(3.4, 0, BEHIND - 0.1); musicBox.rotation.y = Math.PI; group.add(musicBox);
    // (Step 5: one card, shut or open, its paint kept by one name; a hidden thing, not needed to finish the set.
    // src/paint/teaParty.js opens it.)
    Object.assign(musicBox.userData.front.userData, { drawing: 'ch7/tea_music_box', bonus: true, musicBox: { shut: ai['ch7/tea_music_box_shut'].tex, open: ai['ch7/tea_music_box_open'].tex } });
    // The dirty cups left behind as the three move down (paint mode only): one at each seat they have used, a
    // tipped cup in its spilt tea, each a sheet of its own (kept while hidden: prepare in src/paint/index.js) and
    // not needed to finish the set.
    const dirtyCups = Array.from({ length: MOVES }, (_, j) => {
      const c = art('tea_cup_tipped', 0.085); c.position.set(SEATS[3] + j * STEP, TBL.h + 0.008, FAR + 0.13); c.visible = false;
      c.userData.dirtyCup = true;
      Object.assign(c.userData.front.userData, { drawing: 'ch7/tea_cup_dirty', fineKey: true, bonus: true });
      group.add(c); return c;
    });
    const jug = art('milk_jug', 0.065); jug.position.set(SEATS[3] + 0.1, TBL.h + 0.008, FAR); group.add(jug);
    const pot = art('teapot', 0.16); pot.position.set(SEATS[2] - 0.02, TBL.h + 0.008, FAR); group.add(pot);
    // The arm-chair at the end of the table, the same chair as in Alice's drawing sitting in it.
    // (2026-10-25: turned to face down the table, not side-on to it, clear of the table's end.)
    const chair = art('tea_armchair', 0.45 * ai['ch7/tea_armchair'].aspect); chair.position.set(ARMCHAIR.x, 0, ARMCHAIR.z); chair.rotation.y = 0.35; group.add(chair);
    const W = ai['props/hatter_watch_close'], watch = paperFlat(W.tex, 0.04, 0.04 / W.aspect, { anchor: 'center' }); group.add(watch); // the days of the month, a little butter on it (AI)
    const dA = ai['ch7/dormouse_sleep'], dB = ai['ch7/dormouse_talk']; const dor = paperFlat(dA.tex, 0.11, 0.11 / dA.aspect); const dorTalk = paperFlat(dB.tex, 0.11, 0.11 / dB.aspect); group.add(dor, dorTalk); // AI (tools/ch7_art.py)
    const DT = ai['ch7/dormouse_teapot']; const potDor = paperFlat(DT.tex, 0.19, 0.19 / DT.aspect); group.add(potDor); // the Dormouse in the teapot (AI, after plate 7.3)
    potDor.position.set(SEATS[2] - 0.02, TBL.h + 0.008, FAR);
    // Gentle motion that never gets in the way of the brush (2026-10-26): steam from both teapots, the Dormouse
    // breathing in his sleep, now and then a leaf from the oak. It runs on a clock of its own, so it goes on while
    // the book is paused and while you paint; nothing that takes paint moves more than a breath.
    const STEAM = steamTex(), LEAF = leafTex();
    // Each wisp and leaf is a sheet of its own, known by its name and a place of its own, wherever it is when it is
    // painted (layers.js, `moving`); a leaf keeps its paint when it falls again. Painting a leaf is a secret.
    const wisps = [[pot, 0.16], [pot2, 0.13]].flatMap(([p, w], j) => [0, 1, 2].map((i) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.1), new THREE.MeshBasicMaterial({ map: STEAM, transparent: true, depthWrite: false }));
      m.userData.steam = { p, top: w / ai['ch7/teapot'].aspect * 0.7, i };
      m.userData.drawing = `ch7/tea_steam_${j * 3 + i}`;
      m.userData.moving = { size: [0.04, 0.1], at: new THREE.Vector3(p.position.x, p.position.y + 0.3, p.position.z + i * 0.01) };
      group.add(m); return m;
    }));
    const leaves = [0, 1, 2, 3].map((i) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.087), new THREE.MeshBasicMaterial({ map: LEAF, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide }));
      m.userData.leaf = i;
      m.userData.drawing = `ch7/tea_leaf_${i}`;
      m.userData.moving = { size: [0.06, 0.087], at: new THREE.Vector3(-1.7, 2, -2 + i * 0.1) };
      m.userData.secret = 'FLUTTERED_DOWN';
      group.add(m); return m;
    });
    function life(cam) {
      const w = performance.now() / 1000;
      for (const m of wisps) {
        const { p, top, i } = m.userData.steam, k = (w * 0.22 + i / 3) % 1;
        m.visible = p.visible && !group.userData.focused; // (there while its pot is, so the set gathers it to paint; out of the way while a piece is painted close up)
        m.position.set(p.position.x + Math.sin(w * 0.7 + i * 2) * 0.008, p.position.y + top + k * 0.08, p.position.z + 0.005);
        m.scale.setScalar(0.6 + k * 0.9); m.material.opacity = Math.sin(Math.PI * k) * 0.9;
        if (cam) m.quaternion.copy(cam.quaternion);
      }
      // A leaf every few seconds: down from under the crown, turning, to lie a while on the grass or the cloth.
      for (const m of leaves) {
        m.visible = !group.userData.focused;
        const s = w / 14 + m.userData.leaf * 0.27, n = Math.floor(s), k = s - n, r = rng(n * 7 + m.userData.leaf + 1);
        const x = -1.4 + r() * 2.6, z = -1.5 + r() * 1.6, onTable = x > TBL.x0 && x < TBL.x1 && Math.abs(z - TBL.z) < TBL.d / 2;
        const floor = onTable ? TBL.h + 0.004 : 0.004, fall = Math.min(1, k / 0.6);
        m.position.set(x + Math.sin(fall * 9 + n) * 0.12 * (1 - fall), lerp(1.7, floor, fall), z + Math.cos(fall * 7) * 0.05);
        if (fall < 1) m.rotation.set(Math.sin(fall * 11) * 0.9, fall * 8, Math.cos(fall * 13) * 0.6);
        else m.rotation.set(-Math.PI / 2, 0, n);
        m.material.opacity = k > 0.92 ? (1 - k) / 0.08 : 1;
      }
      return w;
    }
    const tree = art('tree_door', 1.47 * ai['ch7/tree_door'].aspect); tree.position.set(-3.6, 0, 0.2); group.add(tree); // the same tree as in her drawing at its door
    const think = thoughts(group, [
      { t0: T.raven - 0.5, t1: T.raven + 12, art: ai['vignettes/raven'].tex },
      { t0: T.concert - 1, t1: T.twinkle, art: ai['vignettes/concert'].tex },
      { t0: T.twinkle, t1: T.pinch + 2, art: ai['vignettes/bat'].tex, tag: 'bat' },
      { t0: T.sisters - 1, t1: T.treacle + 10, art: ai['vignettes/treacle'].tex },
    ]);

    // Who sits where: the Hatter, the Dormouse and the March Hare crowded at one corner;
    // after "let's all move one place on", each moves along one seat.
    const bookSeat = (who, t) => {
      const before = { hatter: 1, dormouse: 2, hare: 3 }[who];
      const k = smooth((t - T.move - 1) / 2.5);
      return lerp(SEATS[before], SEATS[before - 1], k);
    };
    // ... and on the paint set, as many seats further on as they have moved down, with a little hop as they go.
    const along = () => group.userData.moveDown ?? 0;
    const seat = (who, t) => bookSeat(who, t) + along() * STEP;
    const hop = () => Math.sin(Math.PI * (along() % 1)) * 0.03;
    // AI poses (2026-10-14): the Hatter steps along one place standing; at last both push the Dormouse into the
    // teapot (after Tenniel's plate 7.3: the Hare on the left, the Hatter on the right, the teapot between them).
    const POT_X = SEATS[2] - 0.02, pushing = (t) => t >= T.teapot - 2.5;
    const moving = (t) => t >= T.move + 0.8 && t < T.move + 3.7;
    const hatterA = (t) => {
      if (pushing(t)) return { pose: 'push', x: POT_X + 0.13, z: FAR - 0.12, y: TBL.h - 0.05, dir: -1 };
      if (moving(t)) return { pose: 'move', x: seat('hatter', t), z: BEHIND - 0.02, y: 0, dir: -1 };
      return { pose: t >= T.raven - 1 && t < T.raven + 3 ? 'riddle' : t >= T.watch && t < T.dipped ? 'watch' : 'stare', x: seat('hatter', t), z: BEHIND, y: hop(), dir: -1 };
    };
    const hareA = (t) => {
      if (pushing(t)) return { pose: 'push', x: POT_X - 0.13, z: FAR - 0.12, y: TBL.h - 0.05, dir: 1 };
      return { pose: t >= T.dipped && t < T.dipped + 6 ? 'dip' : 'sit', x: seat('hare', t), z: BEHIND, y: hop(), dir: -1 };
    };
    const aliceA = (t) => {
      // To the arm-chair; round the end of the table to the March Hare's old place among the three on the far side
      // (2026-10-26: the table is twice as wide now, so she no longer leans across it from the near side); up in
      // disgust, back round the end and off into the wood.
      const s = route(t, [
        // (J, 2026-10-27: walking she was cut off by the arm-chair's drawing, standing in the same place: she
        // stands just in front of it, sits at once, gets up in front of it again, and goes round its far side.)
        [0, { x: -2.6, z: 0.9, dir: 1 }], [T.sat - 0.5, CHAIR_FRONT], [T.sat - 0.01, CHAIR_FRONT], [T.sat, ARMCHAIR],
        [T.move + 0.99, ARMCHAIR], [T.move + 1, CHAIR_FRONT], [T.move + 1.8, { x: ARMCHAIR.x - 0.5, z: ARMCHAIR.z }],
        [T.move + 3.2, { x: TBL.x0 - 0.3, z: BEHIND - 0.25 }], [T.move + 5.5, { x: SEATS[3] - 0.4, z: BEHIND - 0.25 }], [T.move + 7, ALICE_PLACE],
        [T.disgust, ALICE_PLACE], [T.disgust + 3, { x: TBL.x0 - 0.3, z: BEHIND - 0.25, dir: -1 }],
        [T.stupidest, { x: -3.3, z: 0.5, dir: -1 }], [T.door - 0.5, { x: -3.75, z: 0.24 }],
      ], { phase: t * 2.2 });
      const inArmchair = t >= T.sat && t < T.move + 1, atTable = t >= T.move + 7 && t < T.disgust;
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
    function update(t, cast, cam) {
      const w = life(cam);
      // The Dormouse: asleep between them as a cushion; awake for the story; into the teapot at last.
      const dx = seat('dormouse', t);
      const awake = t >= T.wake + 3 && t < T.disgust;
      const intoPot = smooth((t - T.teapot + 2.5) / 2.5);
      dor.visible = !awake; dorTalk.visible = awake;
      const jig = (t >= T.pinch && t < T.pinch + 1.5) || (t >= T.wake && t < T.wake + 1) || (t >= T.pinched && t < T.pinched + 1) ? Math.sin(t * 40) * 0.01 : 0;
      // Asleep, he breathes: a slow rise and fall, too little to disturb a brush on him.
      dor.scale.set(1 + Math.sin(w * 1.6) * 0.008, 1 + Math.sin(w * 1.6) * 0.025, 1);
      for (const d of [dor, dorTalk]) d.position.set(lerp(dx, SEATS[2] - 0.02, intoPot) + jig, TBL.h + 0.008 + hop() + intoPot * 0.06 - smooth((t - T.teapot) / 1.5) * 0.08, lerp(TBL.z - TBL.d / 2 + 0.07, FAR, intoPot));
      // Into the teapot: the drawing of the Dormouse half in the pot replaces the pot and the sleeping Dormouse.
      const inPot = t >= T.teapot - 1;
      dor.visible = dor.visible && !inPot; dorTalk.visible = dorTalk.visible && !inPot;
      pot.visible = !inPot; potDor.visible = inPot;
      pot.position.x = SEATS[2] - 0.02;
      // The watch: out of the Hatter's pocket, into the March Hare's tea, back.
      watch.visible = t >= T.watch && t < T.dipped + 8;
      if (t < T.dipped - 2) carry(watch, cast.hatter);
      else { watch.position.set(seat('hare', t) + 0.05, TBL.h + 0.06 - (t >= T.dipped && t < T.dipped + 2 ? 0.04 : 0), FAR + 0.05); watch.rotation.set(0, 0, 0); }
      // "the March Hare had just upset the milk-jug into his plate"
      jug.rotation.z = smooth((t - T.milk + 1) / 0.6) * 1.3; jug.position.x = bookSeat('hare', t) + 0.1; // (left behind as they move down)
      // Moving down: the dirty cups they leave, and the empty chairs where they sit now out of their way.
      const dirty = group.userData.dirty ?? 0, sat = ['hatter', 'dormouse', 'hare'].map((w) => seat(w, t));
      dirtyCups.forEach((c, j) => { c.visible = j < dirty; });
      for (const { x, m } of empty) { const free = sat.every((s) => Math.abs(s - x) > 0.16); m.forEach((o) => { o.visible = free; }); }
      chair.visible = aliceA(t).pose !== 'chair7';   // her arm-chair drawing has its own chair
      tree.visible = aliceA(t).pose !== 'treedoor';  // and the tree with the door is in her drawing there
      const a = aliceA(t);
      think(t, { x: a.x + 0.28, y: 0.62, z: a.z + 0.05 }, 0.28);
    }
    const S = (x, y = 0.38) => [x, y, FAR];
    // (2026-10-26, the second overhaul: the table is twice as wide, so the close shots stand over its near half, a
    // reach from the three, not at its near edge, where they were small heads lost in the oak's roots.)
    const CLOSE = (x, y = 0.3) => ({ pos: [x + 0.05, 0.43, FAR + 0.72], look: S(x, y) });
    // Hand-directed with the AI tea things (2026-10-15): the whole party with Alice in her arm-chair (PARTY) between
    // the close shots, at her own lines, so she is in the picture at least every ~12 s.
    const PARTY = { pos: [-0.55, 0.62, 0.85], look: [-0.35, 0.24, -0.95] };
    // Alice in her arm-chair, near; and over her shoulder down the long table to the three at the far corner
    // (2026-10-17: the wide shot left her a small head at the edge for most of ten minutes).
    const ALICE_C = { pos: [-0.75, 0.42, 0.55], look: [-1.25, 0.3, -0.35] };
    // Alice in her arm-chair and the three at their corner across the table, from the near side (2026-10-26).
    const FOUR = { pos: [0.4, 0.6, 0.6], look: [-0.6, 0.25, -0.9] };
    const OVER = { pos: [-2.0, 0.56, 0.25], look: [-0.1, 0.3, -1.1] };
    const key = (t, s, dur = 2) => ({ t, dur, ...s });
    const camera = cameraTrack([
      { t: 0, dur: 0, pos: [-2.4, 0.5, 2.4], look: [0, 0.3, -0.5] },                                  // the table under the tree
      { t: T.room - 1, dur: 2, pos: [0.7, 0.5, 0.25], look: [-0.15, 0.28, FAR] },                      // "No room! No room!"
      { t: T.sat, dur: 3, ...ALICE_C },                                                                  // Alice in the arm-chair
      { t: T.hair - 1, dur: 2, ...CLOSE(SEATS[1], 0.32) },                                               // "Your hair wants cutting"
      key(76.5, PARTY, 2.5),                                                                          // "You should learn not to make personal remarks"
      { t: T.raven + 6, dur: 3, ...OVER },
      { t: T.watch - 1, dur: 2, ...CLOSE(SEATS[1] + 0.05) },                                             // the watch
      key(178.6, PARTY), key(182.3, CLOSE(SEATS[1] + 0.05), 1.5),                                      // "The fourth."; "Two days wrong!"
      key(189, PARTY),                                                                                // "It was the best butter"
      { t: T.dipped - 1, dur: 2, ...CLOSE(SEATS[3] + 0.1) },                                             // dipped into his tea
      { t: T.dipped + 7, dur: 2.5, ...FOUR },                                                             // "Alice had been looking over his shoulder"
      { t: T.poured - 1, dur: 2, ...CLOSE(SEATS[2], 0.27) },                                             // hot tea on the Dormouse's nose
      { t: T.poured + 2.5, dur: 3, ...ALICE_C },
      { t: T.wake - 1, dur: 2, ...CLOSE(SEATS[2], 0.27) },                                               // the Dormouse's story
      key(512.8, PARTY, 1.5),                        key(530.8, CLOSE(SEATS[2], 0.27), 1.5),          // "Yes, please do!"; "Once upon a time"
      key(541.4, PARTY, 1.5), key(547, CLOSE(SEATS[2], 0.27), 1.5),                                     // "What did they live on?"; "treacle"
      key(552, PARTY, 1.5),                                                                           // "they'd have been ill"
      { t: T.treacle + 20, dur: 4, ...OVER },
      { t: T.move - 1, dur: 3, pos: [0.1, 0.62, 0.55], look: S(0.1, 0.26) },                          // one place on
      { t: T.move + 8, dur: 3, pos: [-0.7, 0.48, -0.1], look: [0.2, 0.28, FAR - 0.05] },             // Alice in the March Hare's old place, the house behind
      { t: T.disgust + 1, dur: 3, pos: [-0.9, 0.5, 1.9], look: [-2.1, 0.15, 0.2] },                   // walking off, looking back
      { t: T.teapot - 3, dur: 2, ...CLOSE(SEATS[2], 0.3) },                                              // into the teapot
      { t: T.teapot + 1, dur: 3, pos: [-2.6, 0.5, 2.3], look: [-3.4, 0.25, 0.1] },                    // "the stupidest tea-party"; a door into a tree
    ]);
    return {
      T, bg: PAPER, fog: [7, 26], bounds: { minX: -3, maxX: 5.5, minZ: 0.3, maxZ: 3 },
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
    T.atDoor = Math.min(T.unlock + 3, T.mushroom - 0.3);
    const { key, hinge, curt } = buildHall({ group, ai, hallMeta });
    curt.position.set(DOOR.x + 0.85, 0, DOOR.z + 0.03);
    const alice = (t) => {
      // Round the table to the door (2026-10-17: she used to dash straight through it in a second), so the door
      // opens as she reaches it (T.atDoor), a little after the words.
      const s = route(t, [[start, { x: TABLE.x - 0.6, z: TABLE.z + 0.3, dir: 1 }], [T.key + 0.4, { x: TABLE.x - 0.25, z: TABLE.z + 0.35 }],
        [T.key + 0.9, { x: TABLE.x + 0.15, z: TABLE.z + 0.65 }], [T.key + 1.5, { x: TABLE.x + 0.65, z: TABLE.z + 0.5 }], [T.atDoor, { x: DOOR.x - 0.3, z: DOOR.z + 0.35 }],
        [T.passage, { x: DOOR.x - 0.3, z: DOOR.z + 0.35 }], [T.passage + 2.5, { x: DOOR.x, z: DOOR.z + 0.05 }]], { phase: t * 2.2 });
      const scale = lerp(0.8, 0.24, smooth((t - T.mushroom) / 3)); // "till she was about a foot high"
      const pose = t >= Math.max(T.mushroom - 0.5, T.atDoor + 0.2) && t < T.mushroom + 3 ? 'nibble' : 'stand'; // "nibbling at the mushroom"
      return { ...s, pose, scale, visible: t < T.passage + 2.5 };
    };
    function update(t, cast) {
      if (t >= T.key) { carry(key, cast.alice, { tilt: -0.6 }); }
      else { key.position.set(TABLE.x + 0.12, TABLE.top + 0.015 + KEY.h / 2, TABLE.z + 0.08); key.rotation.set(0, 0, 0); }
      key.visible = t < T.atDoor + 0.8;
      hinge.rotation.y = -1.7 * smooth((t - T.atDoor + 0.3) / 1.2);
    }
    const camera = cameraTrack([
      { t: start, dur: 0, pos: [-1.0, 1.1, 1.2], look: [TABLE.x, 0.8, TABLE.z] },
      { t: T.key - 1, dur: 2, pos: [TABLE.x + 0.6, 1.1, TABLE.z + 1.0], look: [TABLE.x, 0.9, TABLE.z] },     // the little golden key
      { t: T.key + 0.6, dur: 2, pos: [2.6, 1.3, 1.6], look: [1.2, 0.25, -1.5] },                               // round the table to the door
      { t: T.atDoor - 0.6, dur: 2, pos: [1.3, 1.0, -0.3], look: [2.4, 0.35, -2.9] },                             // unlocking the door; nibbling
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
