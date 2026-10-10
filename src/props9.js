// Placeholder art for Chapter IX, "The Mock Turtle's Story" (and the shore of Chapter X),
// drawn in code until the AI drawings arrive (docs/CHAPTER_09_ASSETS.md). Figures stand on
// the bottom edge of their image and face left. No colours: Chapter IX names none.
import { canvas, hatch, blob, flicks, outline, fillPaper, grain, shadeEdge, INK, PAPER } from './ink.js';
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

// The seashore backdrop: a flat sea to a far horizon, a little surf, sky with light clouds.
export function seaBackdrop(w = 4096, h = 900) {
  const { c, g } = canvas(w, h);
  g.fillStyle = PAPER; g.fillRect(0, 0, w, h);
  for (let band = 0; band < 5; band++) hatch(g, rect(0, 0, w, 260 - band * 45), { angle: 0, gap: 8 + band * 2, width: 0.8, seed: 1931 + band, alpha: 0.3 });
  for (const [x, y, rx, ry] of [[500, 230, 260, 60], [1700, 180, 320, 70], [2900, 250, 240, 55], [3700, 200, 280, 60]]) { const cl = blob(x, y, rx, ry, 1936 + x, 11, 0.25); fillPaper(g, cl); outline(g, cl, 1.4); }
  const sea = rect(0, 440, w, h - 440);
  hatch(g, sea, { angle: 0, gap: 5, width: 0.9, seed: 1940, alpha: 0.6 });
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 440); g.lineTo(w, 440); g.stroke(); // the horizon
  for (let k = 0; k < 160; k++) { const x = (k * 263) % w, y = 470 + ((k * 97) % 380); line(g, 1.5, [[x, y], [x + 30 + (k % 3) * 10, y - 4], [x + 60, y]]); }
  for (let x = 0; x < w; x += 70) { g.lineWidth = 2; g.beginPath(); g.arc(x + 35, h - 18, 34, Math.PI, 0); g.stroke(); } // the surf
  grain(g, 0.03, 1941);
  return c;
}
// The sea seen from the shore, laid flat: wavelets in rows (tiles both ways).
export function seaTile() {
  const { c, g } = canvas(512, 512);
  g.fillStyle = PAPER; g.fillRect(0, 0, 512, 512);
  hatch(g, rect(0, 0, 512, 512), { angle: 0, gap: 6, width: 0.9, seed: 1945, alpha: 0.55 });
  g.strokeStyle = INK;
  for (let k = 0; k < 40; k++) { const x = (k * 137) % 512, y = (k * 71) % 512; line(g, 1.6, [[x, y], [x + 18, y - 5], [x + 36, y]]); }
  return c;
}
// Sand: a pale ground tile with pebbles and shells.
export function sandTile() {
  const { c, g } = canvas(512, 512);
  g.fillStyle = PAPER; g.fillRect(0, 0, 512, 512);
  hatch(g, rect(0, 0, 512, 512), { angle: 0.15, gap: 11, width: 0.6, seed: 1951, alpha: 0.22 });
  for (let k = 0; k < 900; k++) dot(g, (k * 151) % 512, (k * 89 + (k % 7) * 31) % 512, 0.9);
  for (let k = 0; k < 16; k++) { const x = (k * 197) % 480 + 16, y = (k * 113) % 480 + 16; const p = ellipse(x, y, 7 + (k % 3) * 3, 5 + (k % 2) * 2, k); fillPaper(g, p); outline(g, p, 1.5); if (k % 4 === 0) for (let r = 0; r < 3; r++) line(g, 1, [[x, y + 4], [x - 6 + r * 6, y - 5]]); }
  grain(g, 0.04, 1952);
  return c;
}
// The tall rock with a little ledge to sit on. LEDGE: the ledge's top, as fractions of the image.
export const ROCK_PX = { w: 600, h: 800 }, LEDGE = { u: 0.62, v: 0.55 };
export function rockLedge() {
  const { c, g } = canvas(ROCK_PX.w, ROCK_PX.h);
  const r = new Path2D(); r.moveTo(40, 800); r.lineTo(90, 300); r.lineTo(170, 60); r.lineTo(260, 20); r.lineTo(320, 140); r.lineTo(330, 430); r.lineTo(560, 440); r.lineTo(590, 800); r.closePath();
  fillPaper(g, r); shadeEdge(g, r, { size: 260, dx: 0.3, dy: 0, angle: 1.3, gap: 4, seed: 1961 }); hatch(g, r, { angle: 1.4, gap: 9, seed: 1962, alpha: 0.35 }); outline(g, r, 4);
  for (let k = 0; k < 9; k++) line(g, 2, [[100 + k * 25, 120 + k * 60], [140 + k * 18, 160 + k * 66]]); // cracks
  const top = new Path2D(); top.moveTo(330, 430); top.lineTo(560, 440); top.lineTo(570, 470); top.lineTo(330, 462); top.closePath(); fillPaper(g, top); outline(g, top, 3); // the ledge
  for (let k = 0; k < 12; k++) { const p = ellipse(60 + k * 46, 785 - (k % 3) * 6, 18, 9); fillPaper(g, p); outline(g, p, 2); } // stones at the foot
  grain(g, 0.03, 1963);
  return c;
}
// The sunny bank where the Gryphon lies asleep: a low grassy rise.
export function sunnyBank() {
  const { c, g } = canvas(1600, 360);
  const b = new Path2D(); b.moveTo(0, 360); b.quadraticCurveTo(300, 140, 800, 120); b.quadraticCurveTo(1300, 130, 1600, 360); b.closePath();
  fillPaper(g, b); hatch(g, b, { angle: 0.1, gap: 7, seed: 1971, alpha: 0.35 }); flicks(g, b, { count: 700, len: 12, seed: 1972, up: true }); outline(g, b, 3);
  return c;
}

// --- Thought vignettes ------------------------------------------------------------
export function tempersVignette() {
  return vignette('pepper, vinegar, camomile, barley-sugar', (g) => {
    const items = [['pepper', 110], ['vinegar', 210], ['camomile', 310], ['barley-sugar', 410]];
    items.forEach(([what, x], i) => {
      if (what === 'pepper') { const p = new Path2D(); p.moveTo(x - 20, 250); p.lineTo(x - 26, 160); p.quadraticCurveTo(x, 130, x + 26, 160); p.lineTo(x + 20, 250); p.closePath(); fillPaper(g, p); hatch(g, p, { gap: 5, seed: 1981 }); outline(g, p, 3); for (const d of [-8, 0, 8]) dot(g, x + d, 146, 2); }
      if (what === 'vinegar') { const p = new Path2D(); p.moveTo(x - 24, 250); p.lineTo(x - 24, 190); p.lineTo(x - 8, 160); p.lineTo(x - 8, 130); p.lineTo(x + 8, 130); p.lineTo(x + 8, 160); p.lineTo(x + 24, 190); p.lineTo(x + 24, 250); p.closePath(); fillPaper(g, p); hatch(g, p, { angle: Math.PI / 2, gap: 4, seed: 1982, alpha: 0.5 }); outline(g, p, 3); }
      if (what === 'camomile') { for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; const pet = ellipse(x + Math.cos(a) * 22, 190 + Math.sin(a) * 22, 14, 6, a); fillPaper(g, pet); outline(g, pet, 1.5); } const ctr = ellipse(x, 190, 11, 11); hatch(g, ctr, { gap: 2, seed: 1983 }); outline(g, ctr, 2); line(g, 3, [[x, 212], [x, 250]]); }
      if (what === 'barley-sugar') { const p = rect(x - 8, 130, 16, 120); fillPaper(g, p); outline(g, p, 3); for (let y = 136; y < 250; y += 14) line(g, 2, [[x - 8, y], [x + 8, y + 8]]); }
      // a little face below each: hot, sour, bitter, sweet
      const face = ellipse(x, 300, 26, 26); fillPaper(g, face); outline(g, face, 2.5); dot(g, x - 9, 294, 3); dot(g, x + 9, 294, 3);
      g.lineWidth = 2.5; g.beginPath(); if (i === 3) g.arc(x, 304, 10, 0.3, Math.PI - 0.3); else g.arc(x, 316, 10, Math.PI + 0.3, -0.3); g.stroke();
      if (i === 0) for (const d of [-14, 0, 14]) line(g, 2, [[x + d, 268], [x + d * 1.4, 258]]); // steam: hot-tempered
    });
  });
}
export function pigsFlyVignette() {
  return vignette('as pigs have to fly', (g) => {
    for (const [x, y, s] of [[170, 160, 1], [330, 230, 0.8], [380, 110, 0.6]]) {
      const b = ellipse(x, y, 60 * s, 34 * s); fillPaper(g, b); shadeEdge(g, b, { size: 60 * s, dx: 0, dy: 0.3, angle: 0.5, gap: 4, seed: 1991 + x }); outline(g, b, 2.5);
      const sn = ellipse(x - 62 * s, y - 2 * s, 12 * s, 14 * s); fillPaper(g, sn); outline(g, sn, 2); dot(g, x - 40 * s, y - 12 * s, 3);
      for (const d of [-25, 20]) line(g, 4 * s, [[x + d * s, y + 30 * s], [x + d * s - 6, y + 46 * s]]);
      const w = new Path2D(); w.moveTo(x, y - 20 * s); w.quadraticCurveTo(x + 20 * s, y - 80 * s, x + 70 * s, y - 70 * s); w.quadraticCurveTo(x + 40 * s, y - 40 * s, x + 20 * s, y - 20 * s); w.closePath(); fillPaper(g, w); outline(g, w, 2);
      g.lineWidth = 2; g.beginPath(); g.arc(x + 66 * s, y - 6 * s, 8 * s, 0, Math.PI * 1.5); g.stroke(); // curly tail
    }
  });
}
export function seaSchoolVignette() {
  return vignette('school in the sea: the old Turtle, "Tortoise"', (g) => {
    for (let k = 0; k < 30; k++) line(g, 1, [[(k * 61) % 512, 60 + (k * 37) % 280], [(k * 61) % 512 + 20, 56 + (k * 37) % 280]]); // the water
    const desk = rect(300, 200, 150, 70); fillPaper(g, desk); hatch(g, desk, { gap: 5, seed: 2001, alpha: 0.6 }); outline(g, desk, 3);
    const master = ellipse(375, 170, 60, 40); fillPaper(g, master); hatch(g, master, { angle: 0.9, gap: 6, seed: 2002, alpha: 0.4 }); outline(g, master, 3);
    const mh = ellipse(318, 150, 18, 14); fillPaper(g, mh); outline(g, mh, 2); dot(g, 312, 146, 2.5);
    for (const [x, y] of [[90, 250], [160, 250], [230, 250], [120, 310], [200, 310]]) { const t = ellipse(x, y, 26, 16); fillPaper(g, t); hatch(g, t, { angle: 0.9, gap: 5, seed: 2003 + x, alpha: 0.4 }); outline(g, t, 2); dot(g, x - 30, y - 2, 6); }
  });
}
export function mastersVignette() {
  return vignette('the Drawling-master, a conger-eel; the Classics master, a crab', (g) => {
    g.lineWidth = 14; g.strokeStyle = INK; g.beginPath(); g.moveTo(80, 300); g.bezierCurveTo(60, 180, 220, 260, 180, 150); g.bezierCurveTo(160, 90, 230, 80, 240, 120); g.stroke();
    g.strokeStyle = PAPER; g.lineWidth = 7; g.stroke(); g.strokeStyle = INK;
    dot(g, 232, 112, 3);
    const crab = ellipse(370, 260, 64, 40); fillPaper(g, crab); hatch(g, crab, { gap: 5, seed: 2011, alpha: 0.5 }); outline(g, crab, 3);
    for (const s of [-1, 1]) { line(g, 4, [[370 + s * 50, 240], [370 + s * 90, 190]]); const cl = ellipse(370 + s * 96, 180, 18, 12, s * 0.6); fillPaper(g, cl); outline(g, cl, 2.5); for (let k = 0; k < 3; k++) line(g, 3, [[370 + s * 40, 280 + k * 6], [370 + s * 80, 300 + k * 10]]); }
    const board = new Path2D(); board.moveTo(330, 200); board.lineTo(370, 180); board.lineTo(410, 200); board.lineTo(370, 220); board.closePath(); g.fillStyle = INK; g.fill(board); // a mortarboard
  });
}
