// The court of justice (Chapters XI and XII), built at foot-high Alice's scale: the back wall
// with the canopy of hearts and the throne on its dais, the table with the dish of tarts in the
// middle, the jury-box with its twelve creatures and their slates, the witness stand, the
// crowd behind the gallery rails, and the door the witnesses come in by.
import * as THREE from 'three';
import { paperFlat } from '../stage.js';
import { texture, canvas, hatch, PAPER } from '../ink.js';
import { slate } from '../props11.js';

// The set is AI drawings after the book and Tenniel's frontispiece (2026-10-15, tools/court_art.py):
// the walls (two window bays repeated), the flagstones, the beamed ceiling, the throne under its
// canopy, the table with the dish of tarts, the jury-box, the witness-box, the door.
export const COURT = { w: 5.4, d: 4.4, h: 1.8, back: -2.2 };
// The throne for two under its canopy, at the back of a dais the King and Queen stand on (the
// drawing's own dais is the dais's front, so `seat` is where the drawn dais top meets the box).
export const THRONE = { x: 0, z: -1.95, w: 0.6, seat: 0.134, depth: 0.25 };
export const KING = { x: -0.15, z: -1.83 }, QUEEN = { x: 0.16, z: -1.83 };
export const HERALD = { x: -0.62, z: -1.6 };                               // "near the King was the White Rabbit"
export const KNAVE = { x: 0.05, z: -1.15 };
export const TARTS = { x: 0.0, z: -0.5, w: 0.36 };
// The jury-box and witness-box: the front (panel and rail) stands before the jurors or the witness,
// the whole drawing behind them; `rail` is the height of the front rail's top.
export const JURY = { x: -1.45, z: -0.85, w: 0.9, h: 0.9 * 460 / 1496, rail: 0.9 * 460 / 1496 * 0.69, turn: 0.55 };  // turned toward the middle of the court
export const WITNESS = { x: 1.25, z: -0.95, w: 0.24, h: 0.24 * 771 / 876, rail: 0.24 * 771 / 876 * 0.8, turn: -0.45 };
export const DOOR = { x: 2.6, z: -0.4 };
export const FRONT = { x: 0.95, z: 0.4 };                                  // Alice and the Gryphon, at the front of the crowd
export const SEAT = { x: -0.8, z: -0.35 };                                 // Alice's bench by the jury-box (XI), where XII begins

// The twelve jurors, left to right, back row then front row: AI drawings of the creatures (2026-10-14).
// Bill the Lizard sits at the end of the back row, so Alice can get behind him beside the box.
const JURORS = ['ch2/dodo_stand', 'ch2/duck_stand', 'ch2/lory_stand', 'ch2/eaglet_stand', 'ch3/owl3', 'ch4/bill_stand', 'ch3/magpie3', 'ch3/canary3', 'ch3/mouse3_lecture',
  'ch3/crab', 'ch8/hedgehog_crawl', 'ch4/guinea_stand'];
export const BILL = 5;

// The dais's top: boards, lightly hatched.
function boards() {
  const { c, g } = canvas(256, 256);
  g.fillStyle = PAPER; g.fillRect(0, 0, 256, 256);
  const all = new Path2D(); all.rect(0, 0, 256, 256); hatch(g, all, { angle: 0, gap: 5, width: 0.6, seed: 2502, alpha: 0.3 });
  g.fillStyle = 'rgba(40,30,20,0.8)'; for (let y = 0; y < 256; y += 32) g.fillRect(0, y, 256, 2);
  return c;
}

export function buildCourt({ group, ai }) {
  const plain = (map) => new THREE.MeshBasicMaterial({ map });
  const tile = (name, rx, ry, ox = 0) => { const t = ai[name].tex.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.offset.set(ox, 0); t.anisotropy = 8; t.needsUpdate = true; return t; };
  // The walls: the window bays repeated, the middle of a bay behind the throne.
  const bay = COURT.h * ai['ch11/court_wall'].aspect;
  const back = new THREE.Mesh(new THREE.PlaneGeometry(COURT.w, COURT.h), plain(tile('ch11/court_wall', COURT.w / bay, 1, 0.5 - COURT.w / bay / 2)));
  back.position.set(0, COURT.h / 2, COURT.back); group.add(back);
  for (const s of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(COURT.d, COURT.h), plain(tile('ch11/court_wall', COURT.d / bay, 1)));
    side.rotation.y = -s * Math.PI / 2; side.position.set(s * COURT.w / 2, COURT.h / 2, COURT.back + COURT.d / 2); group.add(side);
  }
  // The flagstones (four by four in a drawing, 0.8 m), and the beamed ceiling, so looking up in Explore finds the roof.
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(COURT.w, COURT.d + 2), plain(tile('ch11/court_floor', COURT.w / 0.8, (COURT.d + 2) / 0.8)));
  floor.rotation.x = -Math.PI / 2; floor.position.z = COURT.back + COURT.d / 2 + 1; group.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(COURT.w, COURT.d + 2), plain(tile('ch11/court_ceiling', COURT.w / 1.2, (COURT.d + 2) / 1.2)));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, COURT.h, COURT.back + COURT.d / 2 + 1); group.add(ceil);
  // The door the witnesses come in by, in the right-hand wall, standing open.
  const D = ai['ch11/court_door'], door = paperFlat(D.tex, 0.62 * D.aspect, 0.62, { edge: false });
  door.rotation.y = -Math.PI / 2; door.position.set(COURT.w / 2 - 0.01, 0, DOOR.z); group.add(door);

  // The throne under its canopy, and the dais: a box whose front is the drawing's own carved dais front.
  const TH = ai['ch11/court_throne'], thH = THRONE.w / TH.aspect;
  const th = paperFlat(TH.tex, THRONE.w, thH, { edge: false }); th.position.set(THRONE.x, 0, THRONE.z); group.add(th);
  const band = THRONE.seat / thH;                                            // the drawing's dais front, as a fraction of its height
  const fr = TH.tex.clone(); fr.repeat.set(1, band); fr.needsUpdate = true;
  const daisFront = new THREE.Mesh(new THREE.PlaneGeometry(THRONE.w, THRONE.seat), new THREE.MeshBasicMaterial({ map: fr, transparent: true, alphaTest: 0.5 }));
  daisFront.position.set(THRONE.x, THRONE.seat / 2, THRONE.z + THRONE.depth); group.add(daisFront);
  const topTex = texture(boards(), { repeat: [2, 1] });
  const daisTop = new THREE.Mesh(new THREE.PlaneGeometry(THRONE.w * 0.98, THRONE.depth), plain(topTex));
  daisTop.rotation.x = -Math.PI / 2; daisTop.position.set(THRONE.x, THRONE.seat, THRONE.z + THRONE.depth / 2); group.add(daisTop);
  for (const s of [-1, 1]) {
    const end = new THREE.Mesh(new THREE.PlaneGeometry(THRONE.depth, THRONE.seat), plain(topTex));
    end.rotation.y = s * Math.PI / 2; end.position.set(THRONE.x + s * THRONE.w * 0.49, THRONE.seat / 2, THRONE.z + THRONE.depth / 2); group.add(end);
  }
  const TB = ai['ch11/court_table'];
  const table = paperFlat(TB.tex, TARTS.w, TARTS.w / TB.aspect); table.position.set(TARTS.x, 0, TARTS.z); group.add(table);
  // The crowd: little birds and beasts and the pack of cards behind rails on either side and behind the bar.
  for (const [x, z, turn, w, seed] of [[-2.05, -1.6, 0.9, 1.4, 2251], [2.05, -1.65, -0.9, 1.4, 2252], [-1.45, 1.25, 0.25, 1.6, 2253]]) {
    // The gallery, packed with birds, beasts and cards (AI, 2026-10-14; was drawn in code): the drawing twice
    // along each rail (the second mirrored), so the spectators are about the size of the jurors.
    const C = ai['ch8/crowd_court'], tw = w / 2;
    for (const k of [0, 1]) {
      const c = paperFlat(C.tex, tw, tw / C.aspect);
      c.position.set(x + Math.cos(turn) * (k - 0.5) * tw, 0, z - Math.sin(turn) * (k - 0.5) * tw); c.rotation.y = turn;
      if ((k + seed) % 2) c.scale.x = -1;
      group.add(c);
    }
  }
  // The witness-box: the whole drawing behind the witness (the chair, the back), its front before.
  const wit = new THREE.Group(); wit.position.set(WITNESS.x, 0, WITNESS.z); wit.rotation.y = WITNESS.turn; group.add(wit);
  const wBack = paperFlat(ai['ch11/court_witness_box'].tex, WITNESS.w, WITNESS.h); wBack.position.z = -0.13;
  const wFront = paperFlat(ai['ch11/court_witness_box_front'].tex, WITNESS.w, WITNESS.h);
  wit.add(wBack, wFront);

  // The jury-box: the whole drawing behind the jurors (its back panel shows over their shoulders), its
  // front before them; the jurors in two rows, the back row standing higher, each with a slate.
  const jury = new THREE.Group(); jury.position.set(JURY.x, 0, JURY.z); jury.rotation.y = JURY.turn; group.add(jury);
  const boxBack = paperFlat(ai['ch11/court_jury_box'].tex, JURY.w, JURY.h); boxBack.position.z = -0.22;
  const box = paperFlat(ai['ch11/court_jury_box_front'].tex, JURY.w, JURY.h);
  jury.add(boxBack, box);
  const slateTex = texture(slate());
  const toWorld = (lx, ly, lz) => new THREE.Vector3(lx, ly, lz).applyAxisAngle(new THREE.Vector3(0, 1, 0), JURY.turn).add(jury.position);
  const jurors = JURORS.map((draw, i) => {
    const row = i < 6 ? 0 : 1, col = i % 6;
    const h = 0.11 + (row === 0 ? 0.03 : 0);
    const a = typeof draw === 'string' ? ai[draw] : null, c = a ? null : draw();
    const flat = a ? paperFlat(a.tex, h * a.aspect, h) : paperFlat(texture(c), h * c.width / c.height, h);
    const home = toWorld(-JURY.w / 2 + 0.1 + col * 0.14, row === 0 ? JURY.rail - 0.01 : JURY.rail - 0.07, row === 0 ? -0.14 : -0.06);
    flat.position.copy(home); flat.rotation.y = JURY.turn; group.add(flat);
    const sl = paperFlat(slateTex, 0.05, 0.0375, { anchor: 'center', edge: false });
    const slateHome = toWorld(-JURY.w / 2 + 0.1 + col * 0.14 - 0.02, JURY.rail + (row === 0 ? 0.06 : 0.015), row === 0 ? -0.1 : 0.012);
    sl.position.copy(slateHome); sl.rotation.y = JURY.turn; group.add(sl);
    return { flat, home, slate: sl, slateHome };
  });
  return { jury, jurors, toWorld };
}
