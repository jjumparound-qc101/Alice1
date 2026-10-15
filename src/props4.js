// Placeholder art for Chapter IV, "The Rabbit Sends in a Little Bill", drawn in code until
// the AI drawings arrive (docs/CHAPTER_04_ASSETS.md). Figures stand on the bottom edge of
// their image and face left. Colours: the brass plate (owner, 2026-10-10) and the blue
// Caterpillar (docs/COLOR.md); everything else is ink.
import { canvas, hatch, flicks, outline, fillPaper, grain, shadeEdge, INK, PAPER } from './ink.js';
import { SPOT, vignette, line, shape, cat } from './props.js';

const FONT = (size, italic = false) => `${italic ? 'italic ' : ''}${size}px "IM Fell English", Georgia, serif`;
const ellipse = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; };
const rect = (x, y, w, h) => { const p = new Path2D(); p.rect(x, y, w, h); return p; };
const dot = (g, x, y, r, c = INK) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
function fur(g, p, seed, count = 260) { shape(g, p, seed); flicks(g, p, { count, len: 9, seed: seed + 1, width: 1 }); outline(g, p, 3); }
const panel = (g, p, seed, angle = Math.PI / 2, gap = 5, alpha = 0.7) => { fillPaper(g, p); hatch(g, p, { angle, gap, seed, alpha }); outline(g, p, 3); };

// --- The Rabbit's house ---------------------------------------------------------------
// The front: a neat little cottage, 1000 × 1100. The upstairs window (WINDOW, in pixels)
// is left clear so the room and Alice's arm show through.
export const HOUSE_PX = { w: 1000, h: 1100, window: { x: 560, y: 330, w: 220, h: 200 }, door: { x: 230, y: 760, w: 170, h: 340 }, chimney: { x: 720, y: 0, w: 110, h: 170 } };
export function houseFront() {
  const { w: W, h: H, window: win, door, chimney } = HOUSE_PX;
  const { c, g } = canvas(W, H);
  const roof = new Path2D(); roof.moveTo(40, 280); roof.lineTo(500, 120); roof.lineTo(960, 280); roof.closePath();
  const chim = rect(chimney.x, chimney.y + 40, chimney.w, chimney.h);
  panel(g, chim, 701, 0, 7, 0.6);
  const pot = rect(chimney.x + 20, chimney.y, chimney.w - 40, 50); panel(g, pot, 702, Math.PI / 2, 4);
  fillPaper(g, roof); hatch(g, roof, { angle: 0.15, gap: 6, seed: 703 }); outline(g, roof, 4);
  for (let y = 160; y < 280; y += 22) { g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); g.moveTo(500 - (y - 120) * 2.8, y); g.lineTo(500 + (y - 120) * 2.8, y); g.stroke(); } // slates
  const walls = rect(80, 280, 840, 820);
  fillPaper(g, walls); hatch(g, walls, { angle: 0.05, gap: 9, seed: 704, alpha: 0.35 });
  for (let y = 300; y < 1100; y += 40) for (let x = 80 + ((y / 40) % 2) * 30; x < 920; x += 60) { g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(x, y, 60, 40); } // brickwork
  outline(g, walls, 4);
  const d = rect(door.x, door.y, door.w, door.h); panel(g, d, 705, Math.PI / 2, 6, 0.85);
  dot(g, door.x + door.w - 28, door.y + 180, 9);
  // "a bright brass plate with the name 'W. RABBIT,' engraved upon it"
  const plate = rect(door.x + 25, door.y + 70, door.w - 50, 46);
  g.fillStyle = SPOT.brass; g.fill(plate);
  g.save(); g.clip(plate); g.strokeStyle = SPOT.brassLight; g.lineWidth = 6; g.beginPath(); g.moveTo(door.x + 25, door.y + 76); g.lineTo(door.x + door.w - 25, door.y + 76); g.stroke(); g.restore();
  g.strokeStyle = INK; g.lineWidth = 2; g.stroke(plate);
  g.fillStyle = INK; g.textAlign = 'center'; g.font = FONT(26); g.fillText('W. RABBIT', door.x + door.w / 2, door.y + 102);
  // Downstairs window, and the upstairs window's frame (its panes are cleared).
  const low = rect(560, 760, 220, 200); panel(g, low, 706, 0.8, 5, 0.5); g.strokeRect(560, 760, 220, 200);
  g.lineWidth = 3; g.beginPath(); g.moveTo(670, 760); g.lineTo(670, 960); g.moveTo(560, 860); g.lineTo(780, 860); g.stroke();
  g.clearRect(win.x, win.y, win.w, win.h);
  g.lineWidth = 10; g.strokeRect(win.x - 5, win.y - 5, win.w + 10, win.h + 10);
  grain(g, 0.03, 7);
  return c;
}

// The room's walls, from inside: papered and hatched. `kind`: 'window' (the front wall,
// window cleared), 'fire' (back wall: fireplace and looking-glass), 'door' (side wall).
export function roomWall(kind) {
  const { c, g } = canvas(1200, 750);
  const all = rect(0, 0, 1200, 750);
  fillPaper(g, all);
  for (let x = 0; x < 1200; x += 60) for (let y = 30; y < 650; y += 80) { g.strokeStyle = INK; g.globalAlpha = 0.5; g.lineWidth = 1.2; g.beginPath(); g.arc(x + (y % 160 ? 30 : 0), y, 8, 0, Math.PI * 2); g.stroke(); } // wallpaper sprigs
  g.globalAlpha = 1;
  const skirting = rect(0, 680, 1200, 70); panel(g, skirting, 711, 0.9, 5);
  if (kind === 'window') {
    g.clearRect(660, 140, 270, 250);
    g.strokeStyle = INK; g.lineWidth = 12; g.strokeRect(654, 134, 282, 262);
  }
  if (kind === 'fire') {
    const fire = new Path2D(); fire.moveTo(420, 680); fire.lineTo(420, 430); fire.lineTo(780, 430); fire.lineTo(780, 680);
    fire.moveTo(500, 680); fire.lineTo(500, 510); fire.lineTo(700, 510); fire.lineTo(700, 680);
    g.fillStyle = PAPER; g.fill(fire, 'evenodd'); hatch(g, rect(500, 510, 200, 170), { angle: 0.8, gap: 3.5, seed: 712 });
    g.strokeStyle = INK; g.lineWidth = 4; g.stroke(fire); g.fillStyle = INK; g.fillRect(400, 410, 400, 24); // mantel
    const glass = ellipse(220, 300, 90, 120); fillPaper(g, glass); hatch(g, glass, { angle: 1.1, gap: 9, seed: 713, alpha: 0.4 }); outline(g, glass, 7); // the looking-glass
  }
  if (kind === 'door') {
    const d = rect(480, 210, 240, 470); panel(g, d, 714, Math.PI / 2, 6, 0.85); dot(g, 690, 450, 10);
  }
  grain(g, 0.03, 9);
  return c;
}

// "a little bottle that stood near the looking-glass. There was no label this time"
export function plainBottle() {
  const { c, g } = canvas(120, 240);
  const b = new Path2D(); b.moveTo(48, 20); b.lineTo(72, 20); b.lineTo(72, 80); b.quadraticCurveTo(110, 100, 110, 150); b.lineTo(110, 230);
  b.lineTo(10, 230); b.lineTo(10, 150); b.quadraticCurveTo(10, 100, 48, 80); b.closePath();
  fillPaper(g, b); shadeEdge(g, b, { size: 100, dx: -0.15, dy: 0, angle: 1.3, gap: 4, seed: 731 }); outline(g, b, 3);
  g.fillStyle = INK; g.fillRect(44, 6, 32, 18);
  return c;
}

// Alice's arm out of the window: from the shoulder (left edge) to the spread hand (right).
export function giantArm() {
  const { c, g } = canvas(900, 300);
  const arm = new Path2D(); arm.moveTo(0, 90); arm.quadraticCurveTo(350, 70, 620, 110); arm.lineTo(620, 190); arm.quadraticCurveTo(350, 210, 0, 230); arm.closePath();
  fillPaper(g, arm); shadeEdge(g, arm, { size: 200, dx: 0, dy: -0.25, angle: 0.2, gap: 4, seed: 741 }); outline(g, arm, 4);
  const sleeve = rect(0, 70, 90, 180); panel(g, sleeve, 742, 1.4, 5, 0.5);
  const hand = new Path2D(); hand.moveTo(610, 105); hand.quadraticCurveTo(700, 80, 720, 110);
  [[890, 40], [895, 110], [885, 175], [840, 240]].forEach(([fx, fy]) => { hand.lineTo(fx, fy); hand.lineTo(fx - 30, fy + 22); hand.lineTo(735, 145); });
  hand.lineTo(700, 210); hand.lineTo(610, 195); hand.closePath();
  fillPaper(g, hand); outline(g, hand, 3);
  return c;
}

// Glass cucumber-frames; `broken` smashes the middle one.
export function cucumberFrames(broken = false) {
  const { c, g } = canvas(700, 220);
  for (let k = 0; k < 3; k++) {
    const x = 20 + k * 225;
    const box = rect(x, 120, 210, 95); panel(g, box, 751 + k, Math.PI / 2, 7, 0.6);
    const lid = new Path2D(); lid.moveTo(x, 120); lid.lineTo(x + 10, 50); lid.lineTo(x + 200, 50); lid.lineTo(x + 210, 120); lid.closePath();
    g.fillStyle = 'rgba(230,238,238,0.6)'; g.fill(lid); outline(g, lid, 3);
    g.lineWidth = 2; g.beginPath(); g.moveTo(x + 105, 50); g.lineTo(x + 105, 120); g.stroke();
    if (broken && k === 1) { g.strokeStyle = INK; for (let i = 0; i < 8; i++) line(g, 2, [[x + 105, 85], [x + 105 + Math.cos(i) * 90, 85 + Math.sin(i) * 34]]); }
  }
  return c;
}
// --- New figures ---------------------------------------------------------------------
// Bill the Lizard: `pose` 'stand' (upright, as Tenniel draws him) or 'fly' (stretched out).
export function lizard(pose = 'stand') {
  const { c, g } = canvas(220, 420);
  g.save(); if (pose === 'fly') { g.translate(110, 210); g.rotate(-0.5); g.translate(-110, -210); }
  g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.moveTo(120, 300); g.quadraticCurveTo(170, 380, 120, 416); g.stroke(); // tail
  const b = ellipse(110, 230, 36, 90); fillPaper(g, b); hatch(g, b, { angle: 0.6, gap: 4, seed: 781, alpha: 0.6 }); outline(g, b, 3);
  const head = ellipse(100, 115, 34, 42); fillPaper(g, head); hatch(g, head, { gap: 5, seed: 782, alpha: 0.4 }); outline(g, head, 3);
  dot(g, 86, 104, 6);
  const arms = pose === 'fly' ? [[80, 190, 20, 120], [140, 190, 200, 120]] : [[80, 190, 40, 250], [140, 190, 180, 250]];
  for (const [x0, y0, x1, y1] of arms) line(g, 6, [[x0, y0], [x1, y1]]);
  for (const [x0, x1] of [[95, 70], [125, 150]]) line(g, 6, [[x0, 300], [x1, pose === 'fly' ? 360 : 410]]);
  g.restore();
  return c;
}
// A guinea-pig, upright; `spade` gives him Pat's spade.
export function guineaPig(spade = false) {
  const { c, g } = canvas(220, 300);
  fur(g, ellipse(110, 190, 80, 100), spade ? 791 : 793, 340);
  fur(g, ellipse(90, 90, 52, 46), spade ? 795 : 797, 100);
  dot(g, 62, 84, 5); dot(g, 44, 100, 5);
  for (const [x, y] of [[120, 52], [80, 50]]) { const e = ellipse(x, y, 14, 10); fillPaper(g, e); outline(g, e, 2); }
  if (spade) { g.strokeStyle = INK; line(g, 6, [[170, 40], [190, 260]]); const s = new Path2D(); s.moveTo(172, 250); s.lineTo(210, 250); s.lineTo(200, 300); s.lineTo(182, 300); s.closePath(); panel(g, s, 799, 0.8, 4); }
  return c;
}
// The enormous puppy: 'stand' (one paw out) or 'sit' (panting, tongue out).
export function puppy(pose = 'stand') {
  const { c, g } = canvas(600, 520);
  if (pose === 'sit') {
    fur(g, ellipse(330, 330, 170, 180), 801, 900);
    fur(g, ellipse(220, 170, 110, 100), 803, 300);
    for (const x of [250, 350]) { const l = rect(x, 420, 50, 100); fur(g, l, 805 + x, 60); }
    const tongue = ellipse(200, 250, 18, 34); fillPaper(g, tongue); outline(g, tongue, 2);
    line(g, 4, [[170, 150], [190, 158]]); line(g, 4, [[230, 150], [250, 158]]); // eyes half shut
  } else {
    fur(g, ellipse(340, 300, 220, 140), 811, 1000);
    fur(g, ellipse(150, 230, 110, 100), 813, 300);
    for (const [x0, x1] of [[260, 250], [430, 440], [470, 490]]) { const l = new Path2D(); l.rect(x0 - 26, 380, 52, 140); fur(g, l, 815 + x0, 60); }
    const paw = new Path2D(); paw.moveTo(220, 360); paw.quadraticCurveTo(110, 420, 60, 410); paw.lineTo(60, 450); paw.quadraticCurveTo(140, 470, 250, 400); paw.closePath(); fur(g, paw, 819, 80); // "stretching out one paw"
    for (const x of [115, 185]) { const e = ellipse(x, 210, 26, 26); fillPaper(g, e); outline(g, e, 3); dot(g, x, 212, 13); } // "large round eyes"
    dot(g, 150, 265, 14);
  }
  for (const s of [-1, 1]) { const ear = ellipse(pose === 'sit' ? 220 + s * 95 : 150 + s * 95, pose === 'sit' ? 100 : 160, 30, 55, s * 0.5); fur(g, ear, 821 + s, 50); }
  return c;
}
// "a large blue caterpillar … with its arms folded, quietly smoking a long hookah"
export function caterpillar() {
  const { c, g } = canvas(420, 300);
  g.strokeStyle = INK; line(g, 3, [[120, 120], [210, 210], [300, 210]]); // hookah tube
  const hk = ellipse(330, 240, 34, 50); fillPaper(g, hk); hatch(g, hk, { gap: 4, seed: 871, alpha: 0.5 }); outline(g, hk, 3);
  for (let k = 5; k >= 0; k--) {
    const seg = ellipse(160 + k * 32, 250 - Math.max(0, 3 - k) * 30, 30, 34);
    g.fillStyle = SPOT.blue; g.fill(seg); hatch(g, seg, { angle: 0.9, gap: 5, seed: 872 + k, alpha: 0.35 }); outline(g, seg, 3);
  }
  const head = ellipse(110, 110, 36, 40); g.fillStyle = SPOT.blue; g.fill(head); hatch(g, head, { gap: 5, seed: 879, alpha: 0.3 }); outline(g, head, 3);
  dot(g, 96, 104, 4); line(g, 4, [[120, 170], [170, 172]]); // folded arms
  return c;
}
export function stick() { const { c, g } = canvas(400, 60); g.strokeStyle = INK; line(g, 10, [[10, 40], [390, 20]]); line(g, 6, [[260, 26], [300, 4]]); return c; }

// --- Thought vignettes ------------------------------------------------------------
export function dinahNurseVignette() {
  return vignette('“Miss Alice! Come here directly…”', (g) => {
    cat(g, 200, 320, 1.6, 881);
    const cap = new Path2D(); cap.ellipse(168, 140, 34, 14, 0, 0, Math.PI * 2); fillPaper(g, cap); outline(g, cap, 2);
    const girl = ellipse(370, 210, 30, 36); fillPaper(g, girl); outline(g, girl, 3);
    const dress = new Path2D(); dress.moveTo(345, 240); dress.lineTo(320, 340); dress.lineTo(420, 340); dress.lineTo(395, 240); dress.closePath(); shape(g, dress, 882);
  });
}
export function bookVignette() {
  return vignette('a book written about me', (g) => {
    const book = new Path2D(); book.moveTo(130, 120); book.lineTo(330, 100); book.lineTo(350, 320); book.lineTo(150, 340); book.closePath();
    fillPaper(g, book); hatch(g, book, { angle: 0.1, gap: 6, seed: 891, alpha: 0.4 }); outline(g, book, 4);
    g.save(); g.translate(240, 220); g.rotate(-0.1); g.fillStyle = INK; g.textAlign = 'center'; g.font = FONT(40); g.fillText('ALICE', 0, 0); g.restore();
    g.strokeStyle = INK; line(g, 4, [[380, 300], [440, 180]]); // a pen
  });
}
