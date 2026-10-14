// The court of justice (Chapters XI and XII), built at foot-high Alice's scale: the back wall
// with the canopy of hearts and the throne on its dais, the table with the dish of tarts in the
// middle, the jury-box with its twelve creatures and their slates, the witness stand, the
// crowd behind the gallery rails, and the door the witnesses come in by.
import * as THREE from 'three';
import { paperFlat } from '../stage.js';
import { texture, canvas, hatch, INK, PAPER } from '../ink.js';
import { flagstones } from '../props.js';
import { mouseUp } from '../props3.js';
import { courtWall, throne, juryBox, tartsTable, witnessBox, crowdGallery, slate } from '../props11.js';

export const COURT = { w: 5.4, d: 4.4, h: 1.8, back: -2.2 };
export const THRONE = { x: 0, z: -1.95, w: 0.9, seat: 0.09 };              // the dais top, where the King and Queen stand
export const KING = { x: -0.18, z: -1.88 }, QUEEN = { x: 0.2, z: -1.88 };
export const HERALD = { x: -0.62, z: -1.6 };                               // "near the King was the White Rabbit"
export const KNAVE = { x: 0.05, z: -1.15 };
export const TARTS = { x: 0.0, z: -0.5 };
export const JURY = { x: -1.45, z: -0.85, w: 0.9, h: 0.26, turn: 0.55 };   // turned toward the middle of the court
export const WITNESS = { x: 1.25, z: -0.95, w: 0.26, h: 0.15, turn: -0.45 };
export const DOOR = { x: 2.6, z: -0.4 };
export const FRONT = { x: 0.95, z: 0.4 };                                  // Alice and the Gryphon, at the front of the crowd

// The twelve jurors, left to right, back row then front row; Bill the Lizard is the fourth.
// AI drawings where the creature has one (2026-10-14); the Mouse standing is still drawn in code.
const JURORS = ['ch2/dodo_stand', 'ch2/duck_stand', 'ch2/lory_stand', 'ch4/bill_stand', 'ch2/eaglet_stand', 'ch3/owl3', 'ch3/magpie3', 'ch3/canary3', mouseUp,
  'ch3/crab', 'ch8/hedgehog_crawl', 'ch4/guinea_stand'];
export const BILL = 3;

// The ceiling: plain boards between beams, lightly hatched.
function beams() {
  const { c, g } = canvas(512, 512);
  g.fillStyle = PAPER; g.fillRect(0, 0, 512, 512);
  const all = new Path2D(); all.rect(0, 0, 512, 512); hatch(g, all, { angle: 0, gap: 9, width: 0.7, seed: 2501, alpha: 0.35 });
  g.fillStyle = INK; for (const y of [0, 256]) g.fillRect(0, y, 512, 22);
  return c;
}

export function buildCourt({ group, ai }) {
  const plain = (map) => new THREE.MeshBasicMaterial({ map });
  const wallTex = texture(courtWall());
  const back = new THREE.Mesh(new THREE.PlaneGeometry(COURT.w, COURT.h), plain(wallTex));
  back.position.set(0, COURT.h / 2, COURT.back); group.add(back);
  const sideTex = texture(courtWall(1800, 600));
  for (const s of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(COURT.d, COURT.h), plain(sideTex));
    side.rotation.y = -s * Math.PI / 2; side.position.set(s * COURT.w / 2, COURT.h / 2, COURT.back + COURT.d / 2); group.add(side);
  }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(COURT.w, COURT.d + 2), plain(texture(flagstones(), { repeat: [8, 9] })));
  floor.rotation.x = -Math.PI / 2; floor.position.z = COURT.back + COURT.d / 2 + 1; group.add(floor);
  // A ceiling, so looking up in Explore finds the court's roof rather than open paper.
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(COURT.w, COURT.d + 2), plain(texture(beams(), { repeat: [4, 3] })));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, COURT.h, COURT.back + COURT.d / 2 + 1); group.add(ceil);
  // The door the witnesses come in by, in the right-hand wall.
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.62), new THREE.MeshBasicMaterial({ color: '#2a251d' }));
  door.rotation.y = -Math.PI / 2; door.position.set(COURT.w / 2 - 0.005, 0.31, DOOR.z); group.add(door);

  const th = paperFlat(texture(throne()), THRONE.w, THRONE.w * 600 / 800); th.position.set(THRONE.x, 0, THRONE.z); group.add(th);
  const table = paperFlat(texture(tartsTable()), 0.36, 0.27); table.position.set(TARTS.x, 0, TARTS.z); group.add(table);
  // The crowd: little birds and beasts and the pack of cards behind rails on either side and behind the bar.
  for (const [x, z, turn, w, seed] of [[-2.05, -1.6, 0.9, 1.4, 2251], [2.05, -1.65, -0.9, 1.4, 2252], [-1.3, 0.75, 0.25, 1.6, 2253]]) {
    const c = paperFlat(texture(crowdGallery(2400, 500, seed)), w, w * 500 / 2400); c.position.set(x, 0, z); c.rotation.y = turn; group.add(c);
  }
  // The witness stand.
  const wb = paperFlat(texture(witnessBox()), WITNESS.w, WITNESS.h); wb.position.set(WITNESS.x, 0, WITNESS.z); wb.rotation.y = WITNESS.turn; group.add(wb);

  // The jury-box, and the jurors in two rows behind its front, each with a slate.
  const jury = new THREE.Group(); jury.position.set(JURY.x, 0, JURY.z); jury.rotation.y = JURY.turn; group.add(jury);
  const box = paperFlat(texture(juryBox()), JURY.w, JURY.h); jury.add(box);
  const slateTex = texture(slate());
  const toWorld = (lx, ly, lz) => new THREE.Vector3(lx, ly, lz).applyAxisAngle(new THREE.Vector3(0, 1, 0), JURY.turn).add(jury.position);
  const jurors = JURORS.map((draw, i) => {
    const row = i < 6 ? 0 : 1, col = i % 6;
    const h = 0.11 + (row === 0 ? 0.03 : 0);
    const a = typeof draw === 'string' ? ai[draw] : null, c = a ? null : draw();
    const flat = a ? paperFlat(a.tex, h * a.aspect, h) : paperFlat(texture(c), h * c.width / c.height, h);
    const home = toWorld(-JURY.w / 2 + 0.09 + col * 0.145, row === 0 ? 0.12 : 0.06, row === 0 ? -0.12 : -0.05);
    flat.position.copy(home); flat.rotation.y = JURY.turn; group.add(flat);
    const sl = paperFlat(slateTex, 0.05, 0.0375, { anchor: 'center', edge: false });
    const slateHome = toWorld(-JURY.w / 2 + 0.09 + col * 0.145 - 0.02, JURY.h + (row === 0 ? 0.04 : 0.0), row === 0 ? -0.1 : 0.012);
    sl.position.copy(slateHome); sl.rotation.y = JURY.turn; group.add(sl);
    return { flat, home, slate: sl, slateHome };
  });
  return { jury, jurors, toWorld };
}
