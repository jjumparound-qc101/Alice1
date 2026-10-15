// The Queen's garden (Chapters VIII and IX): the rose-tree near the entrance with its roses
// being painted red, the large flower-pot, and the croquet-ground, "all ridges and furrows",
// with the garden wall behind. Built at foot-high Alice's scale (she is about 0.3 m here).
import * as THREE from 'three';
import { paperFlat } from '../stage.js';
import { ROSE_TREE_PX } from '../props8.js';
import { outdoors } from '../scenes/rabbit.js';

export const FOOT = 0.24;                                   // Alice's scale: "about a foot high"
export const ROSE = { x: -2.2, z: -0.75, w: 0.5, h: 0.5 * ROSE_TREE_PX.h / ROSE_TREE_PX.w };
export const POT = { x: -1.45, z: -0.55, w: 0.36 };
export const CROQ = { x0: 0.6, x1: 5.4, z0: -1.9, z1: 0.9 }; // the croquet-ground
export const FTREE = { x: 5.2, z: -1.6, h: 1.6 };            // the tree the flamingo tries to fly into

// The garden behind: the hedge-wall with the fountain and dome centred at x, and the plain hedge either side.
export function gardenBehind(group, ai, x, z) {
  const WALL_H = 0.9 * 840 / 360, WALL_W = WALL_H * ai['ch8/garden_wall'].aspect;
  for (let k = -4; k <= 4; k++) {
    const w = paperFlat(ai[k ? 'ch8/garden_hedge' : 'ch8/garden_wall'].tex, WALL_W, WALL_H, { edge: false });
    w.position.set(x + k * WALL_W, 0, z); if (k % 2) w.scale.x = -1; group.add(w);
  }
}

// Builds the garden into `group`. Returns paint(n): show the first n roses red.
export function buildCroquet({ group, ai }) {
  outdoors(group, ai, { ground: 'lawn' });
  // The garden behind (AI, 2026-10-15, after plate 8.2; tools/croquet_art.py): the hedge-wall with its arches, the
  // fountain and the glasshouse dome in the middle, the same hedge without them repeated either side (every
  // other copy mirrored, so the joins match). The hedge is 0.9 m high; long enough that its ends stay out of
  // sight from anywhere on the ground (the Explore look arc is 150°).
  gardenBehind(group, ai, 1.2, -3.6);
  for (const [x, z, h, s] of [[-4.2, -2.2, 3.0, 1], [-3.2, -0.2, 2.6, -1], [FTREE.x, FTREE.z, FTREE.h, -1], [6.4, -0.6, 2.8, 1]]) {
    const t = paperFlat(ai.tree.tex, h * ai.tree.aspect, h); t.position.set(x, 0, z); t.scale.x = s; group.add(t);
  }
  // "The bright flower-beds" (AI, after plate 8.2).
  const FB = ai['ch8/flower_bed'];
  for (const [x, z, s] of [[-3.0, -1.6, 1], [-0.6, -2.2, -1], [-1.9, -2.6, 1]]) { const b = paperFlat(FB.tex, 1.0, 1.0 / FB.aspect); b.position.set(x, 0, z); b.scale.x = s; group.add(b); }
  // The croquet-ground, "all ridges and furrows" (AI tile, 0.8 m), laid just above the grass.
  const gw = CROQ.x1 - CROQ.x0, gd = CROQ.z1 - CROQ.z0;
  const furrows = ai['ch8/croquet_ground'].tex.clone(); furrows.wrapS = furrows.wrapT = THREE.RepeatWrapping; furrows.repeat.set(gw / 0.8, gd / 0.8); furrows.anisotropy = 8; furrows.needsUpdate = true;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(gw, gd), new THREE.MeshBasicMaterial({ map: furrows }));
  ground.rotation.x = -Math.PI / 2; ground.position.set((CROQ.x0 + CROQ.x1) / 2, 0.002, (CROQ.z0 + CROQ.z1) / 2); group.add(ground);
  // AI drawings (tools/ch8_art.py): the rose-tree with leaves only, and one rose, white or painted
  // red, placed on its crown at SPOTS (fractions of the tree drawing from its top left).
  const treeArt = ai['ch8/rose_tree'], TH = ROSE.h * 1.25;
  const tree = paperFlat(treeArt.tex, TH * treeArt.aspect, TH); tree.position.set(ROSE.x, 0, ROSE.z); group.add(tree);
  const TW = TH * treeArt.aspect;
  const white = ai['ch8/rose_white'].tex, red = ai['ch8/rose_red'].tex, RW = 0.075, RH = RW / ai['ch8/rose_white'].aspect;
  const SPOTS = [[0.32, 0.15], [0.52, 0.12], [0.66, 0.2], [0.2, 0.26], [0.42, 0.24], [0.62, 0.28], [0.8, 0.34], [0.28, 0.36], [0.52, 0.36], [0.7, 0.42], [0.4, 0.44], [0.56, 0.46]];
  const roses = SPOTS.map(([u, v]) => {
    const r = paperFlat(white, RW, RH, { anchor: 'center', edge: false });
    r.position.set(ROSE.x + (u - 0.5) * TW, (1 - v) * TH, ROSE.z + 0.01); group.add(r); return r;
  });
  const paint = (n) => roses.forEach((r, i) => { r.userData.front.material.map = i < n ? red : white; });
  // The gardeners' pot of red paint, and the large flower-pot Alice hides them in (AI).
  const PP = ai['ch8/paint_pot'], pot = paperFlat(PP.tex, 0.12, 0.12 / PP.aspect); pot.position.set(ROSE.x + 0.05, 0, ROSE.z + 0.12); group.add(pot);
  const FP = ai['ch8/flower_pot'], big = paperFlat(FP.tex, POT.w, POT.w / FP.aspect); big.position.set(POT.x, 0, POT.z); group.add(big);
  return { paint, roses: roses.length };
}
