// Placeholder art for the fall, the passage and the hall, drawn in code in the
// engraving style of src/art.js. Spot colours follow docs/COLOR.md: only things
// the text gives a colour are coloured.
import { canvas, hatch, blob, flicks, outline, fillPaper, grain, shadeEdge, PAPER, INK } from './ink.js';

export const SPOT = {
  gold: '#ebb420',    // "a tiny golden key"
  goldLight: '#ffe27a',
  redHot: '#f0381a',  // "a red-hot poker"
  redGlow: '#ff9a3c', // its glowing tip
  brown: '#9a6232',   // the terrier's "long curly brown hair" (Chapter II, a thought)
  brass: '#c29a3f',   // "a bright brass plate" on the Rabbit's door (owner, 2026-10-10: brass-coloured)
  brassLight: '#e8cf7a',
  blue: '#5b86c4',    // "a large blue caterpillar" (Chapter IV onward)
  leaf: '#7fae5a',    // "a sea of green leaves" (Chapter V: those treetops only)
  leafDark: '#4f7d3a',
};

const FONT = (size, italic = false) => `${italic ? 'italic ' : ''}${size}px "IM Fell English", Georgia, serif`;

// Dark earth, cross-hatched, with roots: walls of the passage and the shaft sides.
export function earth(seed = 1, dark = 0.7) {
  const { c, g } = canvas(1024, 1024);
  g.fillStyle = PAPER; g.fillRect(0, 0, 1024, 1024);
  const all = new Path2D(); all.rect(-20, -20, 1064, 1064);
  hatch(g, all, { angle: 0.3, gap: 5, width: 1.1, seed, alpha: dark });
  hatch(g, all, { angle: -0.9, gap: 7, width: 0.9, seed: seed + 1, alpha: dark * 0.8 });
  flicks(g, all, { count: 700, len: 10, seed: seed + 2, width: 1 });
  g.strokeStyle = INK; g.lineWidth = 3;
  for (let i = 0; i < 9; i++) {
    const x = ((i * 397 + seed * 131) % 1024), y = ((i * 251 + seed * 71) % 1024);
    g.beginPath(); g.moveTo(x, y);
    g.bezierCurveTo(x + 60, y + 80, x - 40, y + 160, x + 30, y + 260); g.stroke();
  }
  grain(g, 0.05, seed);
  return c;
}

export function leafHeap() {
  const { c, g } = canvas(1024, 400);
  const heap = blob(512, 330, 470, 160, 41, 14, 0.25);
  fillPaper(g, heap);
  shadeEdge(g, heap, { size: 300, dx: -0.2, dy: -0.35, angle: 0.4, gap: 4, seed: 42 });
  flicks(g, heap, { count: 1600, len: 14, seed: 43, width: 1.1 });
  g.strokeStyle = INK; g.lineWidth = 3;
  for (let i = 0; i < 14; i++) { // sticks
    const x = 120 + i * 57, y = 220 + ((i * 37) % 90);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + 70 - (i % 3) * 50, y - 30 + (i % 4) * 14); g.stroke();
  }
  outline(g, heap, 2);
  return c;
}

// The hall's long wall, panelled, with a row of locked doors.
export function hallWall(doors = 7) {
  const W = 2600, H = 700;
  const { c, g } = canvas(W, H);
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  const wall = new Path2D(); wall.rect(0, 0, W, H);
  hatch(g, wall, { angle: Math.PI / 2, gap: 9, width: 0.8, seed: 51, alpha: 0.45 });
  const dado = new Path2D(); dado.rect(0, H - 130, W, 130);
  fillPaper(g, dado); hatch(g, dado, { angle: 0.8, gap: 5, seed: 52, alpha: 0.7 }); outline(g, dado, 2);
  const step = W / doors;
  for (let i = 0; i < doors; i++) {
    const x = step * i + step * 0.22, w = step * 0.56, top = 90;
    const d = new Path2D();
    d.moveTo(x, H - 4); d.lineTo(x, top + w / 2); d.arc(x + w / 2, top + w / 2, w / 2, Math.PI, 0); d.lineTo(x + w, H - 4); d.closePath();
    fillPaper(g, d);
    hatch(g, d, { angle: Math.PI / 2 + 0.05, gap: 5, seed: 60 + i, alpha: 0.85 });
    shadeEdge(g, d, { size: w, dx: -0.12, dy: 0, angle: 0.7, gap: 4, seed: 70 + i });
    outline(g, d, 4);
    g.lineWidth = 2; g.strokeRect(x + w * 0.14, top + w * 0.6, w * 0.72, (H - top) * 0.32); g.strokeRect(x + w * 0.14, top + w * 0.6 + (H - top) * 0.36, w * 0.72, (H - top) * 0.3);
    g.fillStyle = INK; g.beginPath(); g.arc(x + w * 0.85, H * 0.6, 9, 0, Math.PI * 2); g.fill(); // knob
    g.beginPath(); g.ellipse(x + w * 0.85, H * 0.6 + 26, 5, 10, 0, 0, Math.PI * 2); g.fill(); // keyhole
  }
  grain(g, 0.035, 5);
  return c;
}

export function flagstones() {
  const { c, g } = canvas(512, 512);
  g.fillStyle = PAPER; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = INK; g.lineWidth = 2.5;
  for (let y = 0; y <= 512; y += 128) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
  for (let r = 0; r < 4; r++) for (let x = (r % 2) * 128; x <= 512; x += 256) { g.beginPath(); g.moveTo(x, r * 128); g.lineTo(x, r * 128 + 128); g.stroke(); }
  const all = new Path2D(); all.rect(0, 0, 512, 512);
  hatch(g, all, { angle: 0.05, gap: 10, width: 0.7, seed: 81, alpha: 0.35 });
  grain(g, 0.05, 6);
  return c;
}

export function lamp() {
  const { c, g } = canvas(160, 420);
  g.strokeStyle = INK; g.lineWidth = 3;
  g.beginPath(); g.moveTo(80, 0); g.lineTo(80, 250); g.stroke(); // chain
  for (let y = 10; y < 250; y += 22) { g.beginPath(); g.ellipse(80, y, 6, 10, 0, 0, Math.PI * 2); g.stroke(); }
  const glass = new Path2D(); glass.moveTo(40, 260); glass.lineTo(120, 260); glass.lineTo(105, 380); glass.lineTo(55, 380); glass.closePath();
  fillPaper(g, glass); hatch(g, glass, { angle: 1.2, gap: 6, seed: 91, alpha: 0.4 }); outline(g, glass, 3);
  const cap = new Path2D(); cap.ellipse(80, 255, 52, 14, 0, 0, Math.PI * 2); fillPaper(g, cap); hatch(g, cap, { gap: 4, seed: 92 }); outline(g, cap, 2.5);
  g.fillStyle = INK; g.beginPath(); g.moveTo(72, 380); g.lineTo(88, 380); g.lineTo(80, 410); g.fill();
  return c;
}

// "a low curtain she had not noticed before"
export function curtain() {
  const { c, g } = canvas(600, 560);
  const cur = new Path2D();
  cur.moveTo(10, 20); cur.lineTo(590, 20);
  for (let x = 590; x >= 10; x -= 58) cur.quadraticCurveTo(x - 14, 560, x - 29, 548);
  cur.closePath();
  fillPaper(g, cur);
  for (let x = 30; x < 590; x += 58) {
    const fold = new Path2D(); fold.rect(x, 20, 24, 540);
    g.save(); g.clip(cur); hatch(g, fold, { angle: Math.PI / 2, gap: 4, seed: x }); g.restore();
  }
  outline(g, cur, 3);
  g.fillStyle = INK; g.fillRect(0, 6, 600, 18); // rod
  return c;
}

export function littleDoor() {
  const { c, g } = canvas(300, 400);
  const d = new Path2D();
  d.moveTo(10, 396); d.lineTo(10, 150); d.arc(150, 150, 140, Math.PI, 0); d.lineTo(290, 396); d.closePath();
  fillPaper(g, d); hatch(g, d, { angle: Math.PI / 2, gap: 5, seed: 101, alpha: 0.8 }); outline(g, d, 5);
  g.fillStyle = INK; g.beginPath(); g.arc(250, 260, 10, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(250, 290, 5, 11, 0, 0, Math.PI * 2); g.fill();
  return c;
}

// "the loveliest garden you ever saw … beds of bright flowers and … cool fountains"
export function garden() {
  const { c, g } = canvas(1024, 768);
  g.fillStyle = PAPER; g.fillRect(0, 0, 1024, 768);
  const sky = new Path2D(); sky.rect(0, 0, 1024, 300);
  hatch(g, sky, { angle: 0, gap: 8, width: 0.8, seed: 111, alpha: 0.35 });
  [[200, 300, 220, 160], [820, 280, 240, 180]].forEach(([x, y, rx, ry], i) => {
    const t = blob(x, y, rx, ry, 120 + i, 12, 0.2); fillPaper(g, t);
    shadeEdge(g, t, { size: rx, dx: -0.3, dy: -0.25, angle: 0.9, gap: 4, seed: 130 + i }); flicks(g, t, { count: 500, len: 9, seed: 140 + i }); outline(g, t, 2);
  });
  const basin = new Path2D(); basin.ellipse(512, 560, 170, 46, 0, 0, Math.PI * 2);
  fillPaper(g, basin); hatch(g, basin, { angle: 0.1, gap: 5, seed: 151 }); outline(g, basin, 3);
  g.strokeStyle = INK; g.lineWidth = 2;
  for (let i = -5; i <= 5; i++) { g.beginPath(); g.moveTo(512, 520); g.quadraticCurveTo(512 + i * 22, 330, 512 + i * 34, 540); g.stroke(); }
  const bed = new Path2D(); bed.rect(0, 620, 1024, 148);
  fillPaper(g, bed);
  for (let i = 0; i < 70; i++) { // flowers: rings of petals, uncoloured
    const x = (i * 149) % 1024, y = 640 + ((i * 53) % 120), r = 9 + (i % 4) * 3;
    g.beginPath(); for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; g.moveTo(x, y); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.stroke();
  }
  grain(g, 0.04, 7);
  return c;
}

export function goldenKey() {
  const { c, g } = canvas(256, 96);
  const k = new Path2D();
  k.arc(48, 48, 34, 0, Math.PI * 2); k.rect(80, 40, 140, 16); k.rect(186, 56, 14, 24); k.rect(206, 56, 14, 30);
  g.fillStyle = SPOT.gold; g.fill(k);
  hatch(g, k, { angle: 0.8, gap: 7, seed: 161, alpha: 0.15 }); // a little engraving, but the gold shows
  g.save(); g.clip(k); g.strokeStyle = SPOT.goldLight; g.lineWidth = 5; // a highlight along the top
  g.beginPath(); g.arc(48, 48, 26, Math.PI * 1.1, Math.PI * 1.7); g.moveTo(84, 44); g.lineTo(214, 44); g.stroke(); g.restore();
  g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(48, 48, 16, 0, Math.PI * 2); g.fill(); g.globalCompositeOperation = 'source-over';
  g.strokeStyle = INK; g.lineWidth = 3; g.stroke(k); g.beginPath(); g.arc(48, 48, 16, 0, Math.PI * 2); g.stroke();
  return c;
}

// "a little bottle … with the words 'DRINK ME' beautifully printed on it in large letters"
export function drinkMeBottle() {
  const { c, g } = canvas(200, 400);
  const b = new Path2D();
  b.moveTo(80, 20); b.lineTo(120, 20); b.lineTo(120, 120); b.quadraticCurveTo(180, 150, 180, 230); b.lineTo(180, 380);
  b.lineTo(20, 380); b.lineTo(20, 230); b.quadraticCurveTo(20, 150, 80, 120); b.closePath();
  fillPaper(g, b); shadeEdge(g, b, { size: 160, dx: -0.15, dy: 0, angle: 1.3, gap: 4, seed: 171 }); outline(g, b, 4);
  g.fillStyle = INK; g.fillRect(76, 4, 48, 22); // cork
  g.fillStyle = PAPER; g.fillRect(36, 240, 128, 80); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(36, 240, 128, 80);
  g.fillStyle = INK; g.textAlign = 'center'; g.font = FONT(30); g.fillText('DRINK', 100, 276); g.fillText('ME', 100, 308);
  return c;
}

// "a very small cake, on which the words 'EAT ME' were beautifully marked in currants"
export function eatMeCake() {
  const { c, g } = canvas(320, 200);
  const top = new Path2D(); top.ellipse(160, 80, 140, 50, 0, 0, Math.PI * 2);
  const side = new Path2D(); side.moveTo(20, 80); side.lineTo(20, 140); side.ellipse(160, 140, 140, 50, 0, Math.PI, 0, true); side.lineTo(300, 80); side.closePath();
  fillPaper(g, side); hatch(g, side, { angle: Math.PI / 2, gap: 5, seed: 181 }); outline(g, side, 3);
  fillPaper(g, top); outline(g, top, 3);
  g.fillStyle = INK; g.textAlign = 'center'; g.font = FONT(44); g.fillText('EAT ME', 160, 96);
  return c;
}

// Thought vignettes: things Alice imagines, drawn in an oval frame with a line of the
// text beneath the top edge. `draw(g)` inks the picture inside the oval (512 × 360).
export function vignette(caption, draw) {
  const { c, g } = canvas(512, 360);
  const v = new Path2D(); v.ellipse(256, 180, 246, 170, 0, 0, Math.PI * 2);
  fillPaper(g, v); outline(g, v, 4);
  g.save(); g.clip(v);
  g.strokeStyle = INK; g.fillStyle = INK; g.lineCap = 'round'; g.lineJoin = 'round';
  draw(g);
  g.restore();
  g.fillStyle = INK; g.font = FONT(22, true); g.textAlign = 'center'; g.fillText(caption, 256, 40);
  return c;
}
export const line = (g, w, pts) => { g.lineWidth = w; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); };
export const shape = (g, p, seed, opts = {}) => { fillPaper(g, p); shadeEdge(g, p, { size: 120, dx: -0.15, dy: -0.1, angle: 0.9, gap: 4, seed, ...opts }); outline(g, p, 3); };

// A cat in profile, sitting: the head, ears, back and tail in a few strokes.
export function cat(g, x, y, s, seed) {
  const body = new Path2D();
  body.moveTo(x, y); body.bezierCurveTo(x - 60 * s, y, x - 70 * s, y - 70 * s, x - 30 * s, y - 100 * s);
  body.lineTo(x - 28 * s, y - 130 * s); body.lineTo(x - 14 * s, y - 116 * s); body.lineTo(x + 2 * s, y - 132 * s); body.lineTo(x + 6 * s, y - 104 * s);
  body.bezierCurveTo(x + 22 * s, y - 80 * s, x + 20 * s, y - 40 * s, x + 30 * s, y); body.closePath();
  shape(g, body, seed, { size: 100 * s });
  line(g, 3, [[x - 50 * s, y - 4 * s], [x - 90 * s, y - 10 * s], [x - 100 * s, y - 40 * s]]); // tail
  g.beginPath(); g.arc(x - 4 * s, y - 108 * s, 3, 0, Math.PI * 2); g.fill(); // eye
}

function bat(g, x, y, s) {
  const b = new Path2D();
  b.moveTo(x, y); b.quadraticCurveTo(x - 30 * s, y - 30 * s, x - 70 * s, y - 20 * s);
  b.quadraticCurveTo(x - 60 * s, y - 5 * s, x - 62 * s, y + 8 * s); b.quadraticCurveTo(x - 45 * s, y, x - 40 * s, y + 12 * s);
  b.quadraticCurveTo(x - 25 * s, y + 4 * s, x, y + 14 * s);
  b.quadraticCurveTo(x + 25 * s, y + 4 * s, x + 40 * s, y + 12 * s); b.quadraticCurveTo(x + 45 * s, y, x + 62 * s, y + 8 * s);
  b.quadraticCurveTo(x + 60 * s, y - 5 * s, x + 70 * s, y - 20 * s); b.quadraticCurveTo(x + 30 * s, y - 30 * s, x, y); b.closePath();
  g.fill(b);
}

// "a red-hot poker will burn you if you hold it too long" (red: docs/COLOR.md)
export function pokerVignette() {
  return vignette('a red-hot poker will burn you', (g) => {
    const grate = new Path2D(); grate.rect(60, 250, 200, 110); hatch(g, grate, { angle: 0.8, gap: 4, seed: 191 }); outline(g, grate, 2);
    g.strokeStyle = INK; line(g, 12, [[420, 70], [220, 250]]); // handle and shaft
    const glow = g.createRadialGradient(200, 268, 4, 200, 268, 80);
    glow.addColorStop(0, SPOT.redGlow); glow.addColorStop(0.45, 'rgba(240,56,26,0.55)'); glow.addColorStop(1, 'rgba(240,56,26,0)');
    g.fillStyle = glow; g.beginPath(); g.arc(200, 268, 80, 0, Math.PI * 2); g.fill();
    g.strokeStyle = SPOT.redHot; line(g, 14, [[250, 222], [185, 282]]);
    g.strokeStyle = SPOT.redGlow; line(g, 5, [[246, 226], [189, 278]]);
  });
}

// "if you cut your finger very deeply with a knife, it usually bleeds" (no colour stated: ink only)
export function knifeVignette() {
  return vignette('if you cut your finger very deeply with a knife', (g) => {
    const hand = new Path2D(); // a hand from the left, forefinger out
    hand.moveTo(0, 230); hand.lineTo(150, 205); hand.lineTo(300, 200); hand.quadraticCurveTo(326, 210, 300, 222);
    hand.lineTo(190, 232); hand.quadraticCurveTo(200, 262, 170, 270); hand.lineTo(0, 300); hand.closePath();
    shape(g, hand, 201);
    line(g, 2, [[170, 238], [175, 262]]); // knuckle crease
    const blade = new Path2D(); blade.moveTo(250, 160); blade.lineTo(420, 110); blade.quadraticCurveTo(440, 112, 430, 124); blade.lineTo(262, 182); blade.closePath();
    fillPaper(g, blade); hatch(g, blade, { angle: -0.3, gap: 5, seed: 202, alpha: 0.5 }); outline(g, blade, 3);
    const handle = new Path2D(); handle.moveTo(430, 108); handle.lineTo(500, 88); handle.lineTo(508, 104); handle.lineTo(438, 126); handle.closePath();
    g.fill(handle);
    line(g, 2.5, [[262, 200], [268, 214]]); // the cut
    [[266, 226, 5], [268, 246, 4], [270, 264, 3]].forEach(([x, y, r]) => { g.beginPath(); g.ellipse(x, y, r * 0.7, r, 0, 0, Math.PI * 2); g.fill(); }); // drops, in ink
  });
}

// "if you drink much from a bottle marked 'poison,' it is almost certain to disagree with you"
export function poisonVignette() {
  return vignette('a bottle marked “poison”', (g) => {
    const b = new Path2D();
    b.moveTo(236, 70); b.lineTo(276, 70); b.lineTo(276, 120); b.quadraticCurveTo(330, 140, 330, 200); b.lineTo(330, 330);
    b.lineTo(182, 330); b.lineTo(182, 200); b.quadraticCurveTo(182, 140, 236, 120); b.closePath();
    shape(g, b, 211, { size: 150 });
    g.fillStyle = INK; g.fillRect(230, 56, 52, 20); // stopper
    for (let y = 140; y < 320; y += 16) line(g, 2, [[188, y], [200, y + 6]]); // ribbed glass
    g.fillStyle = PAPER; g.fillRect(200, 220, 112, 64); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(200, 220, 112, 64);
    g.fillStyle = INK; g.textAlign = 'center'; g.font = FONT(26); g.fillText('POISON', 256, 260);
  });
}

// "I hope they'll remember her saucer of milk at tea-time. Dinah my dear!"
export function dinahVignette() {
  return vignette('her saucer of milk at tea-time', (g) => {
    const floor = new Path2D(); floor.rect(0, 290, 512, 80); hatch(g, floor, { angle: 0.05, gap: 7, seed: 221, alpha: 0.6 });
    cat(g, 210, 300, 1.7, 222);
    const saucer = new Path2D(); saucer.ellipse(360, 296, 70, 16, 0, 0, Math.PI * 2); shape(g, saucer, 223, { size: 60 });
    const milk = new Path2D(); milk.ellipse(360, 293, 46, 9, 0, 0, Math.PI * 2); fillPaper(g, milk); outline(g, milk, 1.5);
  });
}

// "Do cats eat bats? Do bats eat cats?"
export function catsBatsVignette() {
  return vignette('Do cats eat bats?', (g) => {
    cat(g, 170, 320, 1.5, 231);
    bat(g, 330, 140, 1.1); bat(g, 410, 210, 0.7); bat(g, 300, 250, 0.55);
  });
}

// "for it might end, you know, … in my going out altogether, like a candle"
export function candleVignette() {
  return vignette('the flame of a candle after it is blown out', (g) => {
    const stick = new Path2D(); stick.ellipse(256, 320, 110, 26, 0, 0, Math.PI * 2); shape(g, stick, 241, { size: 90 });
    const wax = new Path2D(); wax.rect(226, 150, 60, 170); shape(g, wax, 242, { size: 60 });
    line(g, 3, [[256, 150], [256, 130]]); // wick
    g.lineWidth = 2.5; g.beginPath(); g.moveTo(256, 128); // a wisp of smoke where the flame was
    for (let k = 0; k < 6; k++) g.quadraticCurveTo(256 + (k % 2 ? 26 : -26), 112 - k * 12, 256, 100 - k * 12);
    g.stroke();
  });
}
