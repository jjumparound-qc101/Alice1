// Placeholder art for Chapter VIII, "The Queen's Croquet-Ground", drawn in code until the
// AI drawings arrive (docs/CHAPTER_08_ASSETS.md). Figures stand on the bottom edge of their
// image and face left. Colours (docs/COLOR.md): the roses are white, being painted red; the
// cushion under the King's crown is crimson; the Queen's face flushes crimson. The card people
// are coloured like real cards: red hearts and diamonds, black clubs and spades (owner, 2026-10-11).
import { canvas, hatch, blob, flicks, outline, fillPaper, grain, shadeEdge, INK, PAPER } from '@engine/ink.js';
import { SPOT, vignette, line, shape } from './props.js';
import { cheshire } from './props6.js';

const FONT = (size, italic = false) => `${italic ? 'italic ' : ''}${size}px "IM Fell English", Georgia, serif`;
const ellipse = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; };
const rect = (x, y, w, h) => { const p = new Path2D(); p.rect(x, y, w, h); return p; };
const dot = (g, x, y, r, c = INK) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
const panel = (g, p, seed, angle = Math.PI / 2, gap = 5, alpha = 0.7) => { fillPaper(g, p); hatch(g, p, { angle, gap, seed, alpha }); outline(g, p, 3); };
function fur(g, p, seed, count = 260) { shape(g, p, seed); flicks(g, p, { count, len: 9, seed: seed + 1, width: 1 }); outline(g, p, 3); }

// The four suits as ink shapes, centred on (x, y), about 2r across.
export function suit(kind, x, y, r) {
  const p = new Path2D();
  if (kind === 'diamonds') { p.moveTo(x, y - r); p.lineTo(x + r * 0.7, y); p.lineTo(x, y + r); p.lineTo(x - r * 0.7, y); p.closePath(); }
  else if (kind === 'hearts') { p.moveTo(x, y + r); p.bezierCurveTo(x - r * 1.4, y - r * 0.1, x - r * 0.6, y - r * 1.2, x, y - r * 0.4); p.bezierCurveTo(x + r * 0.6, y - r * 1.2, x + r * 1.4, y - r * 0.1, x, y + r); p.closePath(); }
  else if (kind === 'spades') { p.moveTo(x, y - r); p.bezierCurveTo(x + r * 1.4, y + r * 0.1, x + r * 0.6, y + r * 0.9, x, y + r * 0.35); p.bezierCurveTo(x - r * 0.6, y + r * 0.9, x - r * 1.4, y + r * 0.1, x, y - r); p.closePath(); p.moveTo(x, y + r * 0.2); p.lineTo(x + r * 0.35, y + r); p.lineTo(x - r * 0.35, y + r); p.closePath(); }
  else { for (const [dx, dy] of [[0, -0.45], [-0.45, 0.15], [0.45, 0.15]]) p.ellipse(x + dx * r, y + dy * r, r * 0.42, r * 0.42, 0, 0, Math.PI * 2); p.moveTo(x, y); p.lineTo(x + r * 0.3, y + r); p.lineTo(x - r * 0.3, y + r); p.closePath(); }
  return p;
}
// Pips laid out on a card face (x0, y0, w, h): the rank's count in two columns, or
// "ornamented all over" (count 0) for the courtiers and children.
// The colour of a suit, as printed: red hearts and diamonds, black clubs and spades (owner, 2026-10-11).
export const suitColour = (kind) => (kind === 'hearts' || kind === 'diamonds' ? SPOT.suitRed : INK);
// The pips of a card of Carroll's day: English packs of 1865 had no corner numbers, so the rank
// is read by counting the pips in their standard layout (owner, 2026-10-11). Pips in the lower
// half are printed upside down, as on real cards. Positions are fractions of the card face.
const L = 0.27, C = 0.5, R = 0.73, T = 0.16, B = 0.84;
const CORNERS = [[L, T], [R, T], [L, B], [R, B]];
const SIDES = [[L, 0.5], [R, 0.5]];
const NINE = [[L, T], [R, T], [L, 0.39], [R, 0.39], [L, 0.61], [R, 0.61], [L, B], [R, B]];
export const PIP_LAYOUT = {
  1: [[C, 0.5]],
  2: [[C, T], [C, B]],
  3: [[C, T], [C, 0.5], [C, B]],
  4: CORNERS,
  5: [...CORNERS, [C, 0.5]],
  6: [...CORNERS, ...SIDES],
  7: [...CORNERS, ...SIDES, [C, 0.33]],
  8: [...CORNERS, ...SIDES, [C, 0.33], [C, 0.67]],
  9: [...NINE, [C, 0.5]],
  10: [...NINE, [C, 0.28], [C, 0.72]],
};
function pips(g, kind, x0, y0, w, h, count) {
  g.fillStyle = suitColour(kind);
  const r = count === 1 ? 34 : 17; // the ace has one large pip
  for (const [u, v] of PIP_LAYOUT[count]) {
    g.save(); g.translate(x0 + u * w, y0 + v * h); if (v > 0.5) g.rotate(Math.PI);
    g.fill(suit(kind, 0, 0, r)); g.restore();
  }
}
// A crown, at (x, y) its bottom centre, w wide.
function crown(g, x, y, w) {
  const p = new Path2D(); p.moveTo(x - w / 2, y); p.lineTo(x - w / 2, y - w * 0.45); p.lineTo(x - w / 4, y - w * 0.2); p.lineTo(x, y - w * 0.55); p.lineTo(x + w / 4, y - w * 0.2); p.lineTo(x + w / 2, y - w * 0.45); p.lineTo(x + w / 2, y); p.closePath();
  fillPaper(g, p); hatch(g, p, { gap: 4, seed: 1601 + w, alpha: 0.4 }); outline(g, p, 3);
}

// A card person: "oblong and flat, with their hands and feet at the corners", a small head
// on top. who: { suit, rank (1-10, the pips) | 'king' | 'queen' | 'knave' |
// 'executioner' }, plus optional wig (the King as judge), specs, chains (the Knave on trial) and
// face ('pale' | 'purple', Chapter XII). pose: stand, walk, paint, bow, kneel, point, flush, stamp, folded, carry, axe, run.
export function card(who, pose = 'stand') {
  const { c, g } = canvas(300, 460);
  const B = { x: 70, y: 130, w: 160, h: 240 }; // the card body
  g.strokeStyle = INK; g.lineCap = 'round'; g.lineJoin = 'round';
  // Bowing and kneeling tip the whole card forward (to the left) from the feet.
  if (pose === 'bow') { g.translate(150, 455); g.rotate(-0.55); g.translate(-150, -455); }
  if (pose === 'kneel') { g.translate(0, 70); }
  // Legs from the bottom corners.
  const legs = {
    walk: [[[B.x + 10, B.y + B.h], [B.x - 15, 452]], [[B.x + B.w - 10, B.y + B.h], [B.x + B.w + 15, 452]]],
    run: [[[B.x + 10, B.y + B.h], [B.x - 40, 440]], [[B.x + B.w - 10, B.y + B.h], [B.x + B.w + 30, 452]]],
    kneel: [[[B.x + 10, B.y + B.h], [B.x - 30, B.y + B.h + 10], [B.x - 30, 385]], [[B.x + B.w - 10, B.y + B.h], [B.x + B.w - 10, 385]]],
    stamp: [[[B.x + 10, B.y + B.h], [B.x - 10, 420]], [[B.x + B.w - 10, B.y + B.h], [B.x + B.w, 452]]],
  }[pose] ?? [[[B.x + 10, B.y + B.h], [B.x + 5, 452]], [[B.x + B.w - 10, B.y + B.h], [B.x + B.w - 5, 452]]];
  for (const l of legs) { line(g, 9, l); const [fx, fy] = l[l.length - 1]; const shoe = ellipse(fx - 8, fy, 16, 7); g.fillStyle = INK; g.fill(shoe); }
  // The body: plain cards show their pips; court cards a robe with the suit on the breast.
  const body = rect(B.x, B.y, B.w, B.h);
  fillPaper(g, body);
  const kind = who.suit;
  if (typeof who.rank === 'number') pips(g, kind, B.x, B.y, B.w, B.h, who.rank);
  else {
    const robe = new Path2D(); robe.moveTo(B.x + 20, B.y); robe.lineTo(B.x + 5, B.y + B.h); robe.lineTo(B.x + B.w - 5, B.y + B.h); robe.lineTo(B.x + B.w - 20, B.y); robe.closePath();
    hatch(g, robe, { angle: who.rank === 'executioner' ? 0.3 : Math.PI / 2, gap: who.rank === 'executioner' ? 3 : 6, seed: 1611 + B.y, alpha: who.rank === 'executioner' ? 0.9 : 0.45 });
    if (who.rank !== 'executioner') {
      const ermine = rect(B.x + 8, B.y + B.h - 34, B.w - 16, 26); fillPaper(g, ermine); outline(g, ermine, 2);
      for (let x = B.x + 20; x < B.x + B.w - 10; x += 22) dot(g, x, B.y + B.h - 21, 3);
      g.fillStyle = PAPER; const s = suit(kind, B.x + B.w / 2, B.y + 70, 26); g.fill(s); g.lineWidth = 3; g.stroke(s);
      g.fillStyle = suitColour(kind); g.fill(suit(kind, B.x + B.w / 2, B.y + 70, 16));
    }
  }
  outline(g, body, 4);
  // Arms from the top corners.
  const arms = {
    paint: [[[B.x, B.y + 10], [B.x - 45, B.y + 40], [B.x - 70, B.y - 5]], [[B.x + B.w, B.y + 10], [B.x + B.w + 20, B.y + 90]]],
    point: [[[B.x, B.y + 10], [B.x - 70, B.y - 30]], [[B.x + B.w, B.y + 10], [B.x + B.w + 25, B.y + 80], [B.x + B.w, B.y + 120]]],
    flush: [[[B.x, B.y + 10], [B.x - 70, B.y - 30]], [[B.x + B.w, B.y + 10], [B.x + B.w + 25, B.y + 80], [B.x + B.w, B.y + 120]]],
    stamp: [[[B.x, B.y + 10], [B.x - 40, B.y - 50]], [[B.x + B.w, B.y + 10], [B.x + B.w + 40, B.y - 50]]],
    folded: [[[B.x, B.y + 10], [B.x + 30, B.y + 60], [B.x + B.w - 20, B.y + 50]], [[B.x + B.w, B.y + 10], [B.x + B.w - 30, B.y + 70], [B.x + 20, B.y + 64]]],
    carry: [[[B.x, B.y + 10], [B.x - 40, B.y + 60], [B.x - 60, B.y + 50]], [[B.x + B.w, B.y + 10], [B.x + B.w + 20, B.y + 90]]],
    axe: [[[B.x, B.y + 10], [B.x - 30, B.y + 80]], [[B.x + B.w, B.y + 10], [B.x + B.w + 30, B.y + 80]]],
    run: [[[B.x, B.y + 10], [B.x - 50, B.y - 30]], [[B.x + B.w, B.y + 10], [B.x + B.w + 50, B.y - 20]]],
    kneel: [[[B.x, B.y + 10], [B.x - 30, B.y + 70], [B.x - 10, B.y + 100]], [[B.x + B.w, B.y + 10], [B.x + B.w + 20, B.y + 90]]],
  }[pose] ?? [[[B.x, B.y + 10], [B.x - 25, B.y + 100]], [[B.x + B.w, B.y + 10], [B.x + B.w + 25, B.y + 100]]];
  for (const a of arms) { line(g, 8, a); const [hx, hy] = a[a.length - 1]; dot(g, hx, hy, 8); }
  // Things held: a brush, a club, the crown on its cushion, the axe.
  if (pose === 'paint') { line(g, 5, [[B.x - 70, B.y - 5], [B.x - 110, B.y - 50]]); const tip = ellipse(B.x - 112, B.y - 54, 8, 12, -0.7); g.fillStyle = INK; g.fill(tip); }
  if (who.suit === 'clubs' && typeof who.rank === 'number' && (pose === 'stand' || pose === 'walk')) { const [hx, hy] = arms[0][1]; line(g, 7, [[hx, hy], [hx - 10, hy - 90]]); g.fill(suit('clubs', hx - 12, hy - 104, 18)); }
  if (pose === 'carry') {
    const cushion = ellipse(B.x - 60, B.y + 40, 42, 14); g.fillStyle = SPOT.crimson; g.fill(cushion); hatch(g, cushion, { gap: 4, seed: 1621, alpha: 0.35 }); outline(g, cushion, 3);
    for (const x of [B.x - 100, B.x - 20]) { const tassel = ellipse(x, B.y + 52, 5, 9); g.fillStyle = SPOT.crimson; g.fill(tassel); outline(g, tassel, 1.5); }
    crown(g, B.x - 60, B.y + 32, 50);
  }
  // The executioner is the Ace of Spades (owner, 2026-10-11): one large spade on his robe.
  if (who.rank === 'executioner') { g.fillStyle = PAPER; g.fill(suit('spades', B.x + B.w / 2, B.y + 120, 44)); g.fillStyle = INK; g.fill(suit('spades', B.x + B.w / 2, B.y + 120, 36)); }
  if (pose === 'axe' || who.rank === 'executioner') {
    line(g, 8, [[B.x - 30, B.y + 80], [B.x - 10, B.y - 110]]);
    const blade = new Path2D(); blade.moveTo(B.x - 14, B.y - 100); blade.quadraticCurveTo(B.x - 80, B.y - 110, B.x - 70, B.y - 40); blade.lineTo(B.x - 18, B.y - 60); blade.closePath();
    fillPaper(g, blade); hatch(g, blade, { gap: 3, seed: 1631, alpha: 0.4 }); outline(g, blade, 3);
  }
  // The head, a little to the left (facing left).
  const hx = 150, hy = 82;
  const head = ellipse(hx - 4, hy, 34, 40);
  // The judge's great wig, behind the head and down to the shoulders.
  if (who.wig) for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { const curl = ellipse(hx - 4 + s * 40, hy - 20 + k * 24, 16, 14); fillPaper(g, curl); g.lineWidth = 2; g.beginPath(); g.arc(hx - 4 + s * 40, hy - 20 + k * 24, 7, 0, Math.PI * 1.5); g.stroke(); outline(g, curl, 2.5); }
  const faceColour = pose === 'flush' ? SPOT.crimson : who.face === 'pale' ? SPOT.paleFace : who.face === 'purple' ? SPOT.purple : null;
  if (faceColour) { g.fillStyle = faceColour; g.fill(head); if (who.face !== 'pale') hatch(g, head, { angle: 0.5, gap: 5, seed: 1641, alpha: 0.35 }); outline(g, head, 3); } // "turned crimson with fury", "turned pale", "turning purple"
  else { fillPaper(g, head); shadeEdge(g, head, { size: 60, dx: 0.2, dy: 0, angle: 0.5, gap: 4, seed: 1642 }); outline(g, head, 3); }
  dot(g, hx - 18, hy - 6, 4); line(g, 3, [[hx - 32, hy + 2], [hx - 40, hy + 12], [hx - 30, hy + 14]]);
  if (pose === 'point' || pose === 'flush' || pose === 'stamp') { const m = ellipse(hx - 20, hy + 22, 9, 7); g.fillStyle = INK; g.fill(m); } // shouting
  else line(g, 2.5, [[hx - 26, hy + 22], [hx - 12, hy + 24]]);
  if (who.rank === 'king' || who.rank === 'queen') crown(g, hx - 4, hy - 34, 56);
  if (who.rank === 'king') { const beard = new Path2D(); beard.moveTo(hx - 34, hy + 10); beard.quadraticCurveTo(hx - 30, hy + 70, hx + 10, hy + 40); beard.lineTo(hx + 20, hy + 20); beard.closePath(); fillPaper(g, beard); flicks(g, beard, { count: 60, len: 8, seed: 1651 }); outline(g, beard, 2); }
  if (who.rank === 'knave') { const cap = new Path2D(); cap.moveTo(hx - 40, hy - 26); cap.quadraticCurveTo(hx, hy - 70, hx + 34, hy - 24); cap.closePath(); panel(g, cap, 1652, 0.6, 4, 0.6); }
  if (who.rank === 'executioner') { const hood = new Path2D(); hood.moveTo(hx - 40, hy + 10); hood.lineTo(hx - 30, hy - 46); hood.quadraticCurveTo(hx, hy - 60, hx + 30, hy - 40); hood.lineTo(hx + 32, hy + 20); hood.closePath(); g.fillStyle = INK; g.fill(hood); dot(g, hx - 18, hy - 6, 5, PAPER); }
  if (pose === 'flush' || pose === 'point' || pose === 'stamp' || pose === 'folded') { /* the Queen's eyes glare */ line(g, 3, [[hx - 28, hy - 16], [hx - 10, hy - 12]]); }
  if (who.specs) { for (const x of [hx - 30, hx - 8]) { g.lineWidth = 2.5; g.beginPath(); g.arc(x, hy - 6, 10, 0, Math.PI * 2); g.stroke(); } line(g, 2, [[hx - 20, hy - 7], [hx - 18, hy - 7]]); }
  if (who.chains) { g.lineWidth = 3; for (let k = 0; k < 9; k++) { g.beginPath(); g.ellipse(B.x + 8 + k * 18, B.y + 120 + Math.sin(k) * 4, 9, 6, 0, 0, Math.PI * 2); g.stroke(); } for (const x of [B.x - 22, B.x + B.w + 22]) { const cuff = rect(x - 12, B.y + 92, 24, 14); g.fillStyle = INK; g.fill(cuff); } }
  return c;
}
// A card lying flat on its face: only the back shows, "the same as the rest of the pack".
// Seen from above; laid on the ground as a flat plane by the scene.
export function cardBack() {
  const { c, g } = canvas(200, 300);
  const b = rect(6, 6, 188, 288); fillPaper(g, b); outline(g, b, 4);
  const inner = rect(20, 20, 160, 260); outline(g, inner, 2);
  g.save(); g.clip(inner); hatch(g, inner, { angle: 0.8, gap: 10, seed: 1661, alpha: 0.6 }); hatch(g, inner, { angle: -0.8, gap: 10, seed: 1662, alpha: 0.6 }); g.restore();
  for (const [x, y] of [[0, 120], [180, 120], [20, 290], [160, 290]]) dot(g, x + 10, y, 8); // hands and feet at the corners
  return c;
}
// A soldier doubled up "on their hands and feet, to make the arches": a card bent into a hoop.
export function cardArch() {
  const { c, g } = canvas(300, 300);
  const a = new Path2D(); a.moveTo(30, 295); a.lineTo(30, 130); a.arc(150, 130, 120, Math.PI, 0); a.lineTo(270, 295); a.lineTo(220, 295); a.lineTo(220, 130); a.arc(150, 130, 70, 0, Math.PI, true); a.lineTo(80, 295); a.closePath();
  fillPaper(g, a); outline(g, a, 4);
  g.fillStyle = INK; for (let k = 0; k < 7; k++) { const ang = Math.PI + k / 6 * Math.PI; g.fill(suit('clubs', 150 + Math.cos(ang) * 95, 130 + Math.sin(ang) * 95, 12)); }
  for (const x of [30, 80, 220, 270]) dot(g, x + (x < 150 ? 10 : -10), 290, 9);
  const head = ellipse(150, 268, 22, 20); fillPaper(g, head); outline(g, head, 3); dot(g, 143, 266, 3); // peering out under the arch
  return c;
}

// The rose-tree: a bush with no roses drawn on it; the roses are separate cards so each can be
// painted red in turn. ROSES lists where they sit, as fractions of the image.
export const ROSE_TREE_PX = { w: 600, h: 700 };
export const ROSES = [[0.30, 0.22], [0.52, 0.14], [0.70, 0.24], [0.22, 0.40], [0.44, 0.32], [0.64, 0.40], [0.80, 0.42], [0.32, 0.55], [0.55, 0.52], [0.72, 0.60], [0.18, 0.62], [0.45, 0.68]];
export function roseTree() {
  const { c, g } = canvas(ROSE_TREE_PX.w, ROSE_TREE_PX.h);
  line(g, 18, [[300, 700], [295, 520]]); line(g, 8, [[295, 560], [220, 480]]); line(g, 8, [[298, 540], [390, 470]]);
  const crownP = blob(300, 280, 270, 250, 1670, 15, 0.16);
  fillPaper(g, crownP); shadeEdge(g, crownP, { size: 220, dx: 0.2, dy: 0.25, angle: 0.5, gap: 4, seed: 1671 });
  flicks(g, crownP, { count: 900, len: 12, seed: 1672, width: 1.2 });
  outline(g, crownP, 3);
  const tub = new Path2D(); tub.moveTo(230, 640); tub.lineTo(240, 700); tub.lineTo(360, 700); tub.lineTo(370, 640); tub.closePath(); panel(g, tub, 1673, 0.2, 6, 0.5);
  grain(g, 0.03, 1674);
  return c;
}
// One rose: white (paper) or painted red, with a wet streak of paint while it's being done.
export function rose(red = false) {
  const { c, g } = canvas(96, 96);
  const outer = new Path2D(); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; outer.ellipse(48 + Math.cos(a) * 20, 48 + Math.sin(a) * 20, 22, 18, a, 0, Math.PI * 2); }
  g.fillStyle = red ? SPOT.rose : PAPER; g.fill(outer); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke(outer);
  const inner = ellipse(48, 48, 16, 14); g.fillStyle = red ? SPOT.roseDark : PAPER; g.fill(inner); g.stroke(inner);
  g.lineWidth = 2; g.beginPath(); g.arc(48, 48, 7, 0.4, 5.2); g.stroke();
  return c;
}
// A live flamingo used as a mallet. pose: 'held' (neck straight, head down), 'twist' (its neck
// twisted round to look up at Alice), 'fly' (trying to fly up into a tree).
export function flamingo(pose = 'held') {
  const { c, g } = canvas(360, 300);
  g.strokeStyle = INK; g.lineCap = 'round';
  const body = ellipse(260, 110, 70, 40, -0.2); fur(g, body, 1721, 120);
  if (pose === 'fly') {
    for (const s of [-1, 1]) { const w = new Path2D(); w.moveTo(250, 100); w.quadraticCurveTo(250 + s * 30, 20, 220 + s * 90, 10); w.quadraticCurveTo(250 + s * 30, 70, 270, 110); w.closePath(); shape(g, w, 1722 + s); }
    line(g, 4, [[300, 130], [330, 250]]); line(g, 4, [[290, 130], [310, 260]]);
    line(g, 10, [[200, 100], [140, 60], [110, 30]]); const head = ellipse(100, 26, 18, 14); fillPaper(g, head); outline(g, head, 3);
    return c;
  }
  // Legs hanging down behind.
  line(g, 4, [[300, 135], [320, 280]]); line(g, 4, [[285, 140], [300, 290]]);
  if (pose === 'twist') {
    g.lineWidth = 10; g.beginPath(); g.moveTo(200, 110); g.bezierCurveTo(120, 140, 110, 40, 190, 30); g.stroke(); // looking up
    const head = ellipse(204, 30, 20, 15); fillPaper(g, head); outline(g, head, 3); dot(g, 210, 26, 3);
    const beak = new Path2D(); beak.moveTo(220, 32); beak.quadraticCurveTo(250, 40, 238, 60); beak.lineTo(222, 40); beak.closePath(); g.fillStyle = INK; g.fill(beak);
    line(g, 2, [[214, 10], [220, 0]]); line(g, 2, [[222, 14], [232, 4]]); // puzzled
  } else {
    line(g, 10, [[200, 110], [100, 180], [30, 250]]);
    const head = ellipse(28, 260, 20, 15); fillPaper(g, head); outline(g, head, 3); dot(g, 22, 256, 3);
    const beak = new Path2D(); beak.moveTo(14, 266); beak.quadraticCurveTo(4, 290, 22, 296); beak.lineTo(28, 274); beak.closePath(); g.fillStyle = INK; g.fill(beak);
  }
  return c;
}
// A live hedgehog: rolled up as a ball, or unrolled and crawling away.
export function hedgehog(pose = 'ball') {
  const { c, g } = canvas(160, 120);
  g.strokeStyle = INK;
  if (pose === 'ball') {
    const b = ellipse(80, 66, 56, 50); fillPaper(g, b); outline(g, b, 3);
    for (let k = 0; k < 60; k++) { const a = k / 60 * Math.PI * 2; line(g, 2, [[80 + Math.cos(a) * 40, 66 + Math.sin(a) * 36], [80 + Math.cos(a) * 62, 66 + Math.sin(a) * 56]]); }
  } else {
    const b = new Path2D(); b.moveTo(20, 100); b.quadraticCurveTo(60, 20, 140, 90); b.lineTo(140, 104); b.lineTo(20, 104); b.closePath(); fillPaper(g, b); outline(g, b, 3);
    for (let k = 0; k < 24; k++) { const x = 34 + k * 4.5, y = 100 - Math.sin((k / 24) * Math.PI) * 62; line(g, 2, [[x, y + 8], [x + 10, y - 14]]); }
    const snout = ellipse(16, 98, 14, 9); fillPaper(g, snout); outline(g, snout, 2); dot(g, 4, 98, 3); dot(g, 18, 94, 2);
    for (const x of [40, 70, 110]) line(g, 4, [[x, 104], [x - 6, 116]]);
  }
  return c;
}
// The Cheshire Cat's head alone in the air, "the grin" first, then the eyes, then the whole
// head with its ears. stage: 0 grin, 1 grin and eyes, 2 the whole head. Cut from the
// Chapter VI Cat so it matches.
export const CAT_HEAD_PX = { w: 260, h: 240 };
export function catHead(stage = 2) {
  const { c, g } = canvas(CAT_HEAD_PX.w, CAT_HEAD_PX.h);
  const src = cheshire(stage < 2);
  g.drawImage(src, 15, 10, CAT_HEAD_PX.w, CAT_HEAD_PX.h, 0, 0, CAT_HEAD_PX.w, CAT_HEAD_PX.h);
  if (stage === 1) for (const x of [85, 155]) { const e = ellipse(x, 105, 16, 12); fillPaper(g, e); outline(g, e, 2); dot(g, x, 105, 4); }
  return c;
}
// The King and Queen's guests: a King or Queen of another suit, small and plain.
// The pack (owner, 2026-10-11): one pack of 52, each card person unique. From the text: ten
// soldiers "carrying clubs" (ace to ten of clubs), ten courtiers "ornamented all over with
// diamonds" (ace to ten of diamonds), ten royal children "ornamented with hearts" (ace to ten
// of hearts), the guests "mostly Kings and Queens", the Knave, King and Queen of Hearts. The
// gardeners Two, Five and Seven are spades after Tenniel; the other spades fill the blind areas
// (the executioner is the Ace of Spades; the officers of the court the Three and Four).
export const SOLDIERS = Array.from({ length: 10 }, (_, i) => ({ suit: 'clubs', rank: i + 1 }));
export const COURTIERS = Array.from({ length: 10 }, (_, i) => ({ suit: 'diamonds', rank: i + 1 }));
export const CHILDREN = Array.from({ length: 10 }, (_, i) => ({ suit: 'hearts', rank: i + 1 }));
export const GUESTS = [{ suit: 'clubs', rank: 'king' }, { suit: 'clubs', rank: 'queen' }, { suit: 'diamonds', rank: 'king' }, { suit: 'diamonds', rank: 'queen' },
  { suit: 'spades', rank: 'king' }, { suit: 'spades', rank: 'queen' }, { suit: 'spades', rank: 'knave' }];
export const OFFICERS = [{ suit: 'spades', rank: 3 }, { suit: 'spades', rank: 4 }];   // "the officers of the court" (Chapter XI)

