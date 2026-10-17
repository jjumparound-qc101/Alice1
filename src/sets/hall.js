// The long, low hall (Chapter I, and Chapter II's pool of tears): walls with their locked
// doors, flagstone floor, hanging lamps, the glass table with the golden key, and the little
// door behind the low curtain, with the garden seen through it.
import * as THREE from 'three';
import { paperFlat, halo } from '@engine/stage.js';
import { texture, canvas, INK } from '@engine/ink.js';
import { SPOT } from '../props.js';

export const HALL_W = 12, HALL_D = 6, H = 3.2;
export const TABLE = { x: 0.4, z: -1.1, top: 0.92, r: 0.42 };
export const DOOR = { x: 2.6, z: -2.97, w: 0.21, h: 0.4 }; // the leaf: "about fifteen inches high"

// Glass reads as a pale, see-through solid with inked edges.
export function glass(geometry) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: '#e6eeee', transparent: true, opacity: 0.28, depthWrite: false })));
  g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 20), new THREE.LineBasicMaterial({ color: INK })));
  return g;
}

export const KEY = { w: 0.12, h: 0.048 }; // "a tiny golden key" (the AI drawing, coloured gold: tools/small_props.py)

// Builds the hall into `group`. Returns the parts a scene moves: the key, the door's hinge
// and the curtain.
export function buildHall({ group, ai, hallMeta }) {
  const plain = (map) => new THREE.MeshBasicMaterial({ map });
  // The walls: plaster over a panelled wainscot (AI drawing, tools/walls.py), one drawing to
  // every 3 m; the doors are hung on them below.
  const wallTex = (len) => {
    const t = ai['walls/hall'].tex.clone();
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.set(len / 3, 1);
    t.needsUpdate = true;
    return t;
  };
  const back = new THREE.Mesh(new THREE.PlaneGeometry(HALL_W, H), plain(wallTex(HALL_W)));
  back.position.set(0, H / 2, -3); group.add(back);
  const sideTex = wallTex(HALL_D);
  for (const s of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(HALL_D, H), plain(sideTex));
    side.rotation.y = -s * Math.PI / 2; side.position.set(s * HALL_W / 2, H / 2, 0); group.add(side);
  }
  // The front wall, facing in (play-through, 2026-10-15: wide shots down the hall saw past its open front). One-sided,
  // so shots from in front of the hall look straight through it.
  const front = new THREE.Mesh(new THREE.PlaneGeometry(HALL_W, H), plain(wallTex(HALL_W)));
  front.rotation.y = Math.PI; front.position.set(0, H / 2, HALL_D / 2); group.add(front);
  // "doors all round the hall, but they were all locked": the little door's drawing, frame
  // and leaf, at the old doors' height (owner, 2026-10-11), a little narrower so they fit
  // round the walls. The back wall leaves room for the little door behind its curtain.
  const L = hallMeta.door.leaf;
  const BIG_H = 2.79, BIG_W = BIG_H * ai['hall/door_frame'].aspect * 0.85;
  const bigDoor = (x, z, rotY) => {
    const d = new THREE.Group();
    d.add(paperFlat(ai['hall/door_frame'].tex, BIG_W, BIG_H, { edge: false }));
    const leaf = paperFlat(ai['hall/door_leaf'].tex, BIG_W * (L.x1 - L.x0), BIG_H * (1 - L.top), { edge: false });
    leaf.position.set(((L.x0 + L.x1) / 2 - 0.5) * BIG_W, 0, -0.002);
    d.add(leaf);
    d.position.set(x, 0, z); d.rotation.y = rotY; group.add(d);
  };
  for (const x of [-4.9, -3.1, -1.3, 0.5, 4.6]) bigDoor(x, -2.99, 0);
  for (const s of [-1, 1]) for (const z of [-1.9, 0, 1.9]) bigDoor(s * (HALL_W / 2 - 0.01), z, -s * Math.PI / 2);
  const floorTex = ai['hall/floor'].tex;
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(HALL_W / 2.4, HALL_D / 2.4); // one drawing is about 2.4 m of floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(HALL_W, HALL_D), plain(floorTex));
  floor.rotation.x = -Math.PI / 2; group.add(floor);
  // The ceiling: plaster between dark beams (AI drawing, tools/walls.py), one drawing to every 3 m.
  const ceilTex = ai['walls/hall_ceiling'].tex;
  ceilTex.wrapS = ceilTex.wrapT = THREE.RepeatWrapping;
  ceilTex.repeat.set(HALL_W / 3, HALL_D / 3);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(HALL_W, HALL_D), plain(ceilTex));
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
    const pt = (r, y) => { const [x, z] = out(r); return new THREE.Vector3(x, y, z); };
    const R = TABLE.r * 0.72, base = TABLE.top - 0.045;
    const curve = new THREE.CatmullRomCurve3([
      pt(R, base), pt(R * 0.96, base * 0.75), pt(R * 1.0, base * 0.4), pt(R * 1.18, base * 0.12), pt(R * 1.4, 0.015),
    ]);
    // A leg is a pale rod with an inked outline on either side (a slightly larger tube showing only its
    // inside, behind it), not glass(): the edges of its eight faces read as stray wavy lines (audit, 2026-10-17).
    table.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.02, 10, false), new THREE.MeshBasicMaterial({ color: '#e4ebe8' })));
    table.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.0255, 10, false), new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide })));
    const collar = glass(new THREE.CylinderGeometry(0.035, 0.028, 0.03, 12));
    collar.position.copy(pt(R, base)); table.add(collar);
  }
  table.position.set(TABLE.x, 0, TABLE.z); group.add(table);

  const key = paperFlat(ai['props/key'].tex, KEY.w, KEY.h, { anchor: 'center' });
  key.add(halo(SPOT.gold, KEY.w * 1.6, 0.4)); // a slight glow
  group.add(key);

  // Behind the curtain: the little door in its frame, and the garden seen through it,
  // clipped to the door's arch. The frame stays on the wall; the leaf swings on its hinges.
  const frameW = DOOR.w / (L.x1 - L.x0), frameH = DOOR.h / (1 - L.top);
  const frame = paperFlat(ai['hall/door_frame'].tex, frameW, frameH, { edge: false });
  frame.position.set(DOOR.x + (0.5 - (L.x0 + L.x1) / 2) * frameW, 0, DOOR.z + 0.004); group.add(frame);
  const view = canvas(600, Math.round(600 * DOOR.h / DOOR.w));
  view.g.beginPath();
  L.arch.forEach(([u, v], i) => view.g[i ? 'lineTo' : 'moveTo'](u * view.c.width, v * view.c.height));
  view.g.clip();
  view.g.drawImage(ai['ch1/garden'].tex.image, 0, 0, view.c.width, view.c.height); // the AI drawing (tools/ch1_art.py)
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
  return { key, hinge, curt, table };
}
