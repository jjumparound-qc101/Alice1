// Placeholder art for Chapter III, "A Caucus-Race and a Long Tale", drawn in code until
// the AI drawings arrive (docs/CHAPTER_03_ASSETS.md). Figures stand on the bottom edge of
// their image and face left. Chapter III names no colours: everything is ink.
import { canvas, hatch, flicks, outline, fillPaper, INK, PAPER } from '@engine/ink.js';
import { vignette, line, shape, cat } from './props.js';

const FONT = (size, italic = false) => `${italic ? 'italic ' : ''}${size}px "IM Fell English", Georgia, serif`;
const ellipse = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; };
const dot = (g, x, y, r) => { g.fillStyle = INK; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
function body(g, p, seed, count = 240) { shape(g, p, seed); flicks(g, p, { count, len: 9, seed: seed + 1, width: 1 }); outline(g, p, 3); }
const legs = (g, pts, w = 3) => { g.strokeStyle = INK; for (const [x0, y0, x1, y1] of pts) { line(g, w, [[x0, y0], [x1, y1]]); line(g, w, [[x1, y1], [x1 - 14, y1]]); } };

// A standing bird: body, head, beak (a path builder), legs; a few options per species.
function bird({ w = 360, h = 420, bx, by, brx, bry, hx, hy, hr, beak, seed, crest, tail }) {
  const { c, g } = canvas(w, h);
  legs(g, [[bx - 20, by + bry - 10, bx - 24, h - 4], [bx + 20, by + bry - 10, bx + 22, h - 4]]);
  if (tail) { const t = new Path2D(); tail(t); body(g, t, seed + 7, 60); }
  body(g, ellipse(bx, by, brx, bry), seed, 300);
  body(g, ellipse(hx, hy, hr, hr * 1.05), seed + 3, 90);
  const b = new Path2D(); beak(b); fillPaper(g, b); hatch(g, b, { gap: 4, seed: seed + 5 }); outline(g, b, 3);
  if (crest) { g.strokeStyle = INK; crest(g); }
  dot(g, hx - hr * 0.3, hy - hr * 0.15, 6);
  return c;
}

export function dodoStand() {
  const c = bird({
    w: 420, h: 560, bx: 240, by: 330, brx: 150, bry: 140, hx: 140, hy: 150, hr: 62, seed: 501,
    beak: (b) => { b.moveTo(90, 125); b.quadraticCurveTo(0, 120, 10, 200); b.quadraticCurveTo(30, 185, 40, 210); b.quadraticCurveTo(85, 205, 100, 180); b.closePath(); },
    tail: (t) => { t.moveTo(360, 300); t.quadraticCurveTo(420, 260, 410, 340); t.quadraticCurveTo(390, 380, 360, 360); t.closePath(); },
  });
  const g = c.getContext('2d');
  g.strokeStyle = INK; line(g, 6, [[80, 290], [60, 556]]); // the walking stick
  return c;
}
export function duckStand() {
  return bird({
    w: 320, h: 360, bx: 180, by: 230, brx: 115, bry: 80, hx: 95, hy: 110, hr: 42, seed: 511,
    beak: (b) => { b.moveTo(62, 104); b.quadraticCurveTo(10, 106, 6, 124); b.quadraticCurveTo(40, 132, 70, 122); b.closePath(); },
    tail: (t) => { t.moveTo(280, 210); t.lineTo(316, 180); t.lineTo(300, 240); t.closePath(); },
  });
}
export function loryStand() {
  return bird({
    w: 260, h: 380, bx: 140, by: 220, brx: 70, bry: 95, hx: 110, hy: 100, hr: 46, seed: 521,
    beak: (b) => { b.moveTo(72, 92); b.quadraticCurveTo(30, 92, 38, 140); b.quadraticCurveTo(60, 125, 78, 122); b.closePath(); },
    crest: (g) => { for (let k = 0; k < 5; k++) line(g, 3, [[120 + k * 7, 58], [138 + k * 12, 22 - k * 3]]); },
    tail: (t) => { t.moveTo(170, 290); t.lineTo(230, 370); t.lineTo(200, 375); t.lineTo(150, 300); t.closePath(); },
  });
}
export function eagletStand() {
  return bird({
    w: 260, h: 380, bx: 145, by: 225, brx: 78, bry: 98, hx: 112, hy: 104, hr: 48, seed: 531,
    beak: (b) => { b.moveTo(72, 96); b.quadraticCurveTo(26, 94, 30, 146); b.quadraticCurveTo(48, 122, 80, 126); b.closePath(); },
    crest: (g) => { for (let k = 0; k < 6; k++) line(g, 2, [[118 + k * 8, 60], [130 + k * 10, 38 + (k % 2) * 8]]); },
  });
}
export function owlStand() {
  const { c, g } = canvas(260, 340);
  legs(g, [[105, 300, 100, 336], [155, 300, 160, 336]]);
  body(g, ellipse(130, 210, 95, 120), 541, 360);
  for (const x of [95, 165]) { const e = ellipse(x, 140, 30, 30); fillPaper(g, e); outline(g, e, 3); dot(g, x, 140, 10); }
  const b = new Path2D(); b.moveTo(122, 160); b.lineTo(138, 160); b.lineTo(130, 186); b.closePath(); g.fillStyle = INK; g.fill(b);
  line(g, 3, [[60, 80], [80, 110]]); line(g, 3, [[200, 80], [180, 110]]); // ear tufts
  return c;
}
// "an old Crab … to her daughter": young=true draws the daughter.
export function crabStand(young = false) {
  const { c, g } = canvas(300, 200);
  g.strokeStyle = INK;
  for (let k = 0; k < 4; k++) { line(g, 4, [[110 - k * 6, 130], [60 - k * 14, 196]]); line(g, 4, [[190 + k * 6, 130], [240 + k * 14, 196]]); }
  body(g, ellipse(150, 120, 90, 52), young ? 551 : 553, 160);
  for (const s of [-1, 1]) { const p = ellipse(150 + s * 115, 60, 30, 22, s * 0.4); body(g, p, 555 + s, 30); line(g, 4, [[150 + s * 70, 100], [150 + s * 105, 75]]); }
  dot(g, 130, 74, 5); dot(g, 170, 74, 5); line(g, 2, [[130, 74], [132, 92]]); line(g, 2, [[170, 74], [168, 92]]);
  if (!young) line(g, 2, [[120, 140], [180, 140]]); // a wrinkled old brow, near enough
  return c;
}
export function magpieStand() {
  return bird({
    w: 300, h: 380, bx: 150, by: 220, brx: 72, bry: 100, hx: 112, hy: 104, hr: 40, seed: 561,
    beak: (b) => { b.moveTo(76, 98); b.lineTo(30, 108); b.lineTo(78, 116); b.closePath(); },
    tail: (t) => { t.moveTo(190, 280); t.lineTo(290, 370); t.lineTo(270, 378); t.lineTo(170, 300); t.closePath(); },
  });
}
export function canaryStand() {
  const c = bird({
    w: 300, h: 260, bx: 120, by: 150, brx: 52, bry: 62, hx: 92, hy: 84, hr: 32, seed: 571,
    beak: (b) => { b.moveTo(64, 80); b.lineTo(40, 88); b.lineTo(66, 94); b.closePath(); },
  });
  const g = c.getContext('2d'); // her little ones
  for (const x of [210, 260]) { body(g, ellipse(x, 228, 22, 22), 575 + x, 20); dot(g, x - 8, 222, 3); }
  return c;
}
// The Mouse, standing upright "with an important air", and on all fours, walking away.
export function mouseUp() {
  const { c, g } = canvas(260, 420);
  g.strokeStyle = INK; line(g, 4, [[150, 380], [230, 400], [250, 340]]); // tail
  body(g, ellipse(140, 280, 70, 110), 581, 300);
  body(g, ellipse(115, 140, 52, 46, -0.3), 583, 90);
  body(g, ellipse(140, 92, 22, 28, -0.2), 585, 20);
  dot(g, 72, 150, 6); dot(g, 104, 130, 5);
  line(g, 4, [[110, 230], [70, 200]]); line(g, 4, [[150, 230], [120, 190]]); // paws raised
  legs(g, [[120, 380, 116, 416], [160, 380, 164, 416]]);
  return c;
}
export function mouseWalk() {
  const { c, g } = canvas(420, 220);
  g.strokeStyle = INK; line(g, 4, [[330, 150], [400, 120], [416, 60]]);
  body(g, ellipse(230, 130, 120, 60), 591, 300);
  body(g, ellipse(110, 120, 50, 38, -0.2), 593, 80);
  body(g, ellipse(135, 78, 18, 24, -0.2), 595, 15);
  dot(g, 64, 124, 5); dot(g, 96, 110, 4);
  for (const x of [150, 190, 260, 300]) line(g, 4, [[x, 170], [x - 6, 214]]);
  return c;
}

export function thimble() {
  const { c, g } = canvas(120, 140);
  const t = new Path2D(); t.moveTo(20, 130); t.lineTo(28, 40); t.quadraticCurveTo(60, 0, 92, 40); t.lineTo(100, 130); t.closePath();
  fillPaper(g, t); g.save(); g.clip(t);
  for (let y = 30; y < 130; y += 12) for (let x = 24; x < 100; x += 12) { g.beginPath(); g.arc(x + (y % 24 ? 6 : 0), y, 2.5, 0, Math.PI * 2); g.fillStyle = INK; g.fill(); }
  g.restore(); outline(g, t, 3); g.fillStyle = INK; g.fillRect(18, 122, 84, 10);
  return c;
}

// "her idea of the tale was something like this": the Mouse's tale, set in the shape of a
// long tail as the book prints it, each line smaller as the tail narrows.
export function mouseTale() {
  const LINES = ['Fury said to a', 'mouse, That he', 'met in the', 'house,', '“Let us', 'both go to', 'law: I will', 'prosecute', 'you.—Come,', 'I’ll take no', 'denial; We', 'must have a', 'trial: For', 'really this', 'morning I’ve', 'nothing', 'to do.”', 'Said the', 'mouse to the', 'cur, “Such', 'a trial,', 'dear sir,', 'With', 'no jury', 'or', 'judge,', 'would be', 'wasting', 'our', 'breath.”', '“I’ll be', 'judge, I’ll', 'be jury,”', 'Said', 'cunning', 'old Fury:', '“I’ll', 'try the', 'whole', 'cause,', 'and', 'condemn', 'you', 'to', 'death.”'];
  const { c, g } = canvas(700, 1400);
  g.fillStyle = PAPER; g.fillRect(0, 0, 700, 1400);
  g.fillStyle = INK; g.textAlign = 'left';
  let y = 40;
  LINES.forEach((t, i) => {
    const size = Math.max(11, 34 - i * 0.55);
    g.font = FONT(size);
    const x = 250 + Math.sin(i * 0.33) * 170 + i * 2;
    g.fillText(t, x, y);
    y += size * 0.95;
  });
  g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(8, 8, 684, 1384);
  return c;
}

