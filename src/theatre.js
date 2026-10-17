// The theatre opening, shared by every book (owner, Alice project 2026-10-14; Carol 2026-10-15): the
// first shot is from a seat in the stalls of a Victorian theatre, looking at the book's toy-theatre
// front with the stage beyond; it holds a few seconds, then rises up the aisle over the audience's
// heads and into the scene as the reading begins.
// The auditorium and the row of stalls (art/, AI drawings from the Alice project) are the series';
// the toy-theatre front is each book's own (engine/tools/proscenium.py).
import * as THREE from 'three';
import { paperFlat } from './stage.js';

// The auditorium: its own stage opening (in pixels) frames the toy front.
const HOUSE = { url: new URL('../art/theatre_house.webp', import.meta.url).href, w: 1536, h: 1024, opening: [502, 349, 1035, 822] };
// The row in front of our seat (the audience from behind; the drawing's cut edges rounded off); y of the
// hat-tops of the shortest figure.
const SEATS = { url: new URL('../art/theatre_seats_row.webp', import.meta.url).href, w: 1536, h: 793, hats: 233 };
// The row's one empty chair, from post to post (x 222-525 of the row): the row runs on in empty chairs at
// each end, not in mirrored copies of itself, which showed flipped guests (owner, Alice 2026-10-16). The
// row's last whole posts are at x 222 and 1368, so the first empty chair at each end lies over its half-cut
// end chair and the guests there sit in whole chairs. (Both made by tools/theatre_seats.py in Alice1.)
const CHAIR = { url: new URL('../art/theatre_seat_empty.webp', import.meta.url).href, w: 303, left: 222, right: 1368 };
const PAPER = '#efe9da';

function load(url) {
  const t = new THREE.TextureLoader().load(url);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// The seat in the stalls, and the view from it: the camera's first key.
export const SEAT = { pos: [0, 2.0, 17.5], look: [0, 1.6, -3] };

// Adds the book's toy-theatre front at z (its stage opening `open.w` metres wide, centred on x = 0, its
// middle at height `open.cy`), the auditorium around it and the row of stalls before the seat.
// pros: { tex, size: [w, h], opening: [x0, y0, x1, y1] } in pixels (the .json beside the front's .webp).
// Everything is drawn over the set (no depth test), but only from the audience's side.
export function theatre(group, pros, { open = { w: 8.4, cy: 2.55 }, z = 2.2, house = true } = {}) {
  const [x0, y0p, x1, y1p] = pros.opening, [PW, PH] = pros.size;
  const k = open.w / (x1 - x0); // metres per pixel
  const W = PW * k, H = PH * k, openH = (y1p - y0p) * k;
  const x = (PW / 2 - (x0 + x1) / 2) * k; // so the opening is centred on x = 0
  const y0 = open.cy - openH / 2 - (PH - y1p) * k; // the foot of the drawing
  const front = paperFlat(pros.tex, W, H, { edge: false });
  front.position.set(x, y0, z);
  group.add(front);
  const layers = [];
  if (house) {
    const k2 = H * 0.98 / (HOUSE.opening[3] - HOUSE.opening[1]); // the whole toy front fills the auditorium's stage
    const hall = paperFlat(load(HOUSE.url), HOUSE.w * k2, HOUSE.h * k2, { edge: false });
    hall.position.set(x + (HOUSE.w / 2 - (HOUSE.opening[0] + HOUSE.opening[2]) / 2) * k2, y0 - (HOUSE.h - HOUSE.opening[3]) * k2, z + 0.1);
    group.add(hall);
    layers.push([hall, 50]);
    const sw = 4.6, sh = sw * SEATS.h / SEATS.w, sz = SEAT.pos[2] - 3.3;
    // The shortest figure straight ahead, so the stage shows over her; empty chairs on at each end, for
    // wide screens (drawn over the row: the first at each end covers its half-cut end chair).
    const row = paperFlat(load(SEATS.url), sw, sh, { edge: false });
    row.position.set(-0.5, 1.22 - (1 - SEATS.hats / SEATS.h) * sh, sz);
    group.add(row);
    layers.push([row, 60]);
    const px = sw / SEATS.w, chair = load(CHAIR.url), x0 = row.position.x - sw / 2;
    for (let k = 0; k < 6; k++) {
      for (const left of [CHAIR.left - CHAIR.w * (k + 1), CHAIR.right + CHAIR.w * k]) {
        const m = paperFlat(chair, CHAIR.w * px, sh, { edge: false });
        m.position.set(x0 + (left + CHAIR.w / 2) * px, row.position.y, sz);
        group.add(m);
        layers.push([m, 61]);
      }
    }
  } else {
    // A plain paper surround, so the opening shot shows the theatre on the page, not the set around it.
    const outer = new THREE.Shape([new THREE.Vector2(-40, -20), new THREE.Vector2(40, -20), new THREE.Vector2(40, 30), new THREE.Vector2(-40, 30)]);
    outer.holes.push(new THREE.Path([new THREE.Vector2(x - W / 2 + 0.05, y0 + 0.05), new THREE.Vector2(x - W / 2 + 0.05, y0 + H - 0.05),
      new THREE.Vector2(x + W / 2 - 0.05, y0 + H - 0.05), new THREE.Vector2(x + W / 2 - 0.05, y0 + 0.05)]));
    const surround = new THREE.Mesh(new THREE.ShapeGeometry(outer), new THREE.MeshBasicMaterial({ color: PAPER }));
    surround.position.z = z + 0.05;
    group.add(surround);
    layers.push([surround, 50]);
  }
  // Drawn over the set (the ground beside a stage can reach out in front of it); from the stage side
  // the paper flats' backs are not drawn over it, because the camera has passed them.
  for (const [o, r] of layers) o.traverse((m) => { if (m.material) { m.material.depthTest = false; m.material.transparent = true; m.material.fog = false; m.renderOrder = r; } });
  return { front, width: W, height: H, foot: y0 };
}

// Camera keys for the opening: the seat until `start` (the first word), then up the aisle over the
// heads (`aisle`) and on to `into`, the scene's first view; `dur` seconds in all. The moves are marked
// exact (timed by the owner), so the calm-move rule doesn't stretch them.
export function openingKeys(start, into, { dur = 6.5, aisle = { pos: [0, 1.9, 11.0], look: [0, 1.5, -3] } } = {}) {
  return [
    { t: 0, dur: 0, ...SEAT },
    { t: start, dur: dur * 0.55, ...aisle, exact: true },
    { t: start + dur * 0.35, dur: dur * 0.65, ...into, exact: true },
  ];
}
