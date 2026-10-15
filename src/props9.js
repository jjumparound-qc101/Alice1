// Placeholder art for Chapter IX, "The Mock Turtle's Story" (and the shore of Chapter X),
// drawn in code until the AI drawings arrive (docs/CHAPTER_09_ASSETS.md). Figures stand on
// the bottom edge of their image and face left. No colours: Chapter IX names none.
import { canvas, hatch, blob, flicks, outline, fillPaper, grain, shadeEdge, INK, PAPER } from '@engine/ink.js';
import { vignette, line, shape } from './props.js';

const FONT = (size, italic = false) => `${italic ? 'italic ' : ''}${size}px "IM Fell English", Georgia, serif`;
const ellipse = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; };
const rect = (x, y, w, h) => { const p = new Path2D(); p.rect(x, y, w, h); return p; };
const dot = (g, x, y, r, c = INK) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
function fur(g, p, seed, count = 260) { shape(g, p, seed); flicks(g, p, { count, len: 9, seed: seed + 1, width: 1 }); outline(g, p, 3); }

// An eagle's head with a hooked beak, facing left, centred on (x, y), size s.
function eagleHead(g, x, y, s, seed, eyesShut = false) {
  const h = ellipse(x, y, 46 * s, 40 * s); fillPaper(g, h); flicks(g, h, { count: 90, len: 7 * s, seed }); outline(g, h, 3);
  const beak = new Path2D(); beak.moveTo(x - 30 * s, y - 14 * s); beak.quadraticCurveTo(x - 90 * s, y - 10 * s, x - 70 * s, y + 30 * s); beak.quadraticCurveTo(x - 56 * s, y + 6 * s, x - 30 * s, y + 12 * s); beak.closePath();
  fillPaper(g, beak); hatch(g, beak, { gap: 4, seed: seed + 1, alpha: 0.5 }); outline(g, beak, 3);
  if (eyesShut) line(g, 3, [[x - 18 * s, y - 10 * s], [x - 2 * s, y - 8 * s]]);
  else { const e = ellipse(x - 10 * s, y - 10 * s, 9 * s, 8 * s); fillPaper(g, e); outline(g, e, 2); dot(g, x - 12 * s, y - 10 * s, 4 * s); }
  for (let k = 0; k < 4; k++) line(g, 2, [[x + 20 * s, y - 30 * s + k * 8], [x + 50 * s, y - 50 * s + k * 10]]); // ear tufts
}
// A folded or raised wing, from the shoulder (x, y).
function wing(g, x, y, up, seed) {
  const w = new Path2D();
  if (up) { w.moveTo(x, y); w.quadraticCurveTo(x + 40, y - 170, x + 160, y - 200); w.lineTo(x + 120, y - 120); w.lineTo(x + 150, y - 110); w.lineTo(x + 100, y - 50); w.lineTo(x + 120, y - 30); w.quadraticCurveTo(x + 60, y + 10, x, y + 20); w.closePath(); }
  else { w.moveTo(x, y); w.quadraticCurveTo(x + 120, y - 60, x + 230, y + 20); w.quadraticCurveTo(x + 120, y + 40, x, y + 40); w.closePath(); }
  fillPaper(g, w); hatch(g, w, { angle: up ? 1.2 : 0.2, gap: 5, seed, alpha: 0.6 }); outline(g, w, 3);
  for (let k = 1; k < 5; k++) line(g, 1.5, up ? [[x + 10, y + 5], [x + 30 * k, y - 40 * k]] : [[x + 20, y + 25], [x + 50 * k, y + 10 + k * 3]]);
}
// The Gryphon: lion's body, eagle's head and wings. pose: asleep, sit, walk, paws, hide.
export function gryphon(pose = 'sit') {
  const { c, g } = canvas(520, 440);
  g.strokeStyle = INK; g.lineCap = 'round'; g.lineJoin = 'round';
  // The tail, to the right, with its tuft.
  line(g, 9, pose === 'asleep' ? [[420, 410], [490, 420], [510, 380]] : [[380, 400], [470, 410], [500, 350]]);
  const tuft = ellipse(pose === 'asleep' ? 510 : 500, pose === 'asleep' ? 372 : 342, 14, 20); fillPaper(g, tuft); flicks(g, tuft, { count: 30, len: 6, seed: 1901 }); outline(g, tuft, 2);
  if (pose === 'asleep') {
    fur(g, ellipse(300, 370, 170, 62), 1902, 300);
    wing(g, 250, 320, false, 1903);
    for (const x of [150, 200]) line(g, 12, [[x + 40, 400], [x, 425]]);   // forepaws out in front
    eagleHead(g, 130, 380, 0.9, 1904, true);
    for (const [x, y] of [[90, 300], [110, 280], [128, 262]]) { g.font = FONT(26, true); g.fillStyle = INK; g.fillText('z', x, y); } // fast asleep
    return c;
  }
  if (pose === 'walk') {
    fur(g, ellipse(290, 290, 150, 70), 1905, 300);
    for (const [x0, x1] of [[190, 160], [240, 270], [340, 320], [390, 420]]) line(g, 13, [[x0, 320], [x1, 430]]);
    wing(g, 250, 250, true, 1906);
    eagleHead(g, 130, 210, 1, 1907);
    return c;
  }
  // Sitting up on its haunches.
  fur(g, ellipse(300, 330, 110, 100), 1908, 280);
  fur(g, ellipse(230, 230, 70, 90, 0.3), 1909, 160);           // chest
  line(g, 13, [[350, 400], [300, 432]]);                       // hind leg
  wing(g, 270, 200, true, 1910);
  if (pose === 'paws') { line(g, 12, [[210, 260], [150, 150]]); line(g, 12, [[240, 260], [200, 140]]); } // both paws up in surprise
  else if (pose === 'hide') { line(g, 12, [[210, 270], [150, 190]]); line(g, 12, [[240, 270], [175, 180]]); }
  else for (const x of [190, 230]) line(g, 12, [[x + 10, 280], [x, 432]]);
  const hy = pose === 'hide' ? 200 : 150;
  eagleHead(g, 190, hy, 1, 1911, pose === 'hide');
  if (pose === 'hide') { const p = ellipse(150, 195, 30, 22); fillPaper(g, p); flicks(g, p, { count: 30, len: 6, seed: 1912 }); outline(g, p, 3); } // paws over its face
  if (pose === 'paws') for (const x of [150, 200]) { const p = ellipse(x, 140, 14, 12); fillPaper(g, p); outline(g, p, 2.5); }
  return c;
}

// The Mock Turtle: a calf's head, hind hooves and tail on a turtle's shell (Tenniel).
// pose: sit, sob, count (on his flappers), hide (his face in his flappers), walk.
export function mockTurtle(pose = 'sit') {
  const { c, g } = canvas(360, 460);
  g.strokeStyle = INK; g.lineCap = 'round';
  // Hind legs with hooves.
  for (const x of [140, 220]) { line(g, 14, [[x, 360], [x + (pose === 'walk' ? (x < 180 ? -20 : 20) : 0), 440]]); const hoof = rect(x - 14 + (pose === 'walk' ? (x < 180 ? -20 : 20) : 0), 436, 28, 18); g.fillStyle = INK; g.fill(hoof); }
  line(g, 6, [[250, 380], [300, 420], [292, 440]]);  // the calf's tail
  // The shell (back) and the plastron (front), standing upright.
  const shell = ellipse(195, 270, 115, 135); fillPaper(g, shell); hatch(g, shell, { angle: 0.9, gap: 6, seed: 1921, alpha: 0.35 }); outline(g, shell, 4);
  for (const [x, y] of [[230, 200], [250, 280], [230, 350], [270, 240], [275, 320]]) { const s = new Path2D(); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; (k ? s.lineTo : s.moveTo).call(s, x + Math.cos(a) * 26, y + Math.sin(a) * 26); } s.closePath(); outline(g, s, 1.5); }
  const front = ellipse(165, 275, 72, 115); fillPaper(g, front); outline(g, front, 3);
  for (let y = 190; y < 380; y += 32) line(g, 1.5, [[100, y], [230, y]]);
  // Flappers.
  const flap = (pts) => { g.lineWidth = 16; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.strokeStyle = PAPER; g.lineWidth = 9; g.stroke(); g.strokeStyle = INK; };
  if (pose === 'count') { flap([[120, 210], [70, 170], [60, 120]]); flap([[210, 210], [120, 150]]); }
  else if (pose === 'hide' || pose === 'sob') { flap([[120, 210], [80, 160], [96, 110]]); flap([[210, 210], [150, 150], [120, 112]]); }
  else { flap([[110, 220], [80, 300], [90, 330]]); flap([[220, 220], [250, 300], [240, 330]]); }
  // The calf's head, bowed in sorrow.
  const hx = pose === 'hide' ? 120 : 110, hy = pose === 'hide' ? 120 : 105;
  const head = ellipse(hx, hy, 48, 56, 0.4); fillPaper(g, head); shadeEdge(g, head, { size: 70, dx: 0.2, dy: -0.1, angle: 0.5, gap: 4, seed: 1922 }); outline(g, head, 3);
  const snout = ellipse(hx - 30, hy + 36, 26, 20, 0.4); fillPaper(g, snout); outline(g, snout, 3); dot(g, hx - 42, hy + 38, 4); dot(g, hx - 26, hy + 46, 4);
  for (const s of [-1, 1]) { const ear = ellipse(hx + 30 + s * 10, hy - 40 + s * 8, 22, 9, s * 0.6 - 0.3); fillPaper(g, ear); outline(g, ear, 2.5); }
  if (pose !== 'hide') {
    const eye = ellipse(hx - 8, hy - 6, 13, 11); fillPaper(g, eye); outline(g, eye, 2.5); dot(g, hx - 12, hy - 4, 5);
    line(g, 2, [[hx - 22, hy - 22], [hx + 4, hy - 26]]);  // a sad brow
    for (let k = 0; k < (pose === 'sob' ? 4 : 2); k++) { const t = ellipse(hx - 14 - k * 3, hy + 14 + k * 18, 4, 7); fillPaper(g, t); outline(g, t, 1.5); } // tears
  }
  if (pose === 'sob' || pose === 'hide') { const hk = new Path2D(); hk.moveTo(hx - 40, hy + 10); hk.lineTo(hx + 10, hy + 20); hk.lineTo(hx - 10, hy + 70); hk.lineTo(hx - 50, hy + 50); hk.closePath(); fillPaper(g, hk); outline(g, hk, 2); } // handkerchief
  return c;
}
