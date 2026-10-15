// Placeholder art for Chapter VII, "A Mad Tea-Party", drawn in code until the AI drawings
// arrive (docs/CHAPTER_07_ASSETS.md). Seated figures are drawn from the waist up, standing
// on the bottom edge of their image, to sit behind the tea-table's cloth. Ink only.
import { canvas, hatch, flicks, outline, fillPaper, grain, shadeEdge, INK, PAPER } from './ink.js';
import { vignette, line, shape } from './props.js';

const FONT = (size, italic = false) => `${italic ? 'italic ' : ''}${size}px "IM Fell English", Georgia, serif`;
const ellipse = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; };
const rect = (x, y, w, h) => { const p = new Path2D(); p.rect(x, y, w, h); return p; };
const dot = (g, x, y, r, c = INK) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
const panel = (g, p, seed, angle = Math.PI / 2, gap = 5, alpha = 0.7) => { fillPaper(g, p); hatch(g, p, { angle, gap, seed, alpha }); outline(g, p, 3); };
function fur(g, p, seed, count = 260) { shape(g, p, seed); flicks(g, p, { count, len: 9, seed: seed + 1, width: 1 }); outline(g, p, 3); }

// The Hatter, seated (waist up): the tall hat with its ticket "In this Style 10/6", a big bow tie.
export function hatter(pose = 'stare') {
  const { c, g } = canvas(320, 460);
  const coat = new Path2D(); coat.moveTo(70, 460); coat.lineTo(90, 280); coat.lineTo(230, 280); coat.lineTo(250, 460); coat.closePath(); panel(g, coat, 1201, 0.8, 6, 0.5);
  for (let x = 100; x < 230; x += 24) for (let y = 300; y < 460; y += 24) { g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(x, y, 24, 24); } // checks
  const bow = new Path2D(); bow.moveTo(160, 285); bow.lineTo(110, 260); bow.lineTo(110, 310); bow.closePath(); bow.moveTo(160, 285); bow.lineTo(210, 260); bow.lineTo(210, 310); bow.closePath(); fillPaper(g, bow); outline(g, bow, 3);
  for (const [x, y] of [[125, 275], [195, 295], [130, 300], [190, 270]]) dot(g, x, y, 6);
  const head = ellipse(160, 215, 52, 64); fillPaper(g, head); shadeEdge(g, head, { size: 110, dx: -0.2, dy: 0, angle: 0.5, gap: 4, seed: 1202 }); outline(g, head, 3);
  dot(g, 140, 205, 5); dot(g, 180, 205, 5); line(g, 3, [[155, 215], [138, 235]]);
  if (pose === 'riddle') { const m = ellipse(160, 250, 14, 12); g.fillStyle = INK; g.fill(m); line(g, 8, [[240, 330], [290, 230]]); } // mouth open, hand up
  else line(g, 3, [[145, 250], [175, 250]]);
  if (pose === 'watch') { line(g, 8, [[240, 340], [230, 230]]); const w = ellipse(222, 222, 18, 18); fillPaper(g, w); outline(g, w, 3); }
  const brim = ellipse(160, 160, 85, 16); fillPaper(g, brim); outline(g, brim, 3);
  const crown = new Path2D(); crown.moveTo(105, 160); crown.lineTo(95, 20); crown.lineTo(225, 20); crown.lineTo(215, 160); crown.closePath(); panel(g, crown, 1203, Math.PI / 2, 7, 0.5);
  const band = rect(100, 120, 120, 26); g.fillStyle = INK; g.fill(band);
  const ticket = rect(165, 70, 50, 40); fillPaper(g, ticket); outline(g, ticket, 2);
  g.fillStyle = INK; g.font = FONT(11); g.textAlign = 'center'; g.fillText('In this', 190, 84); g.fillText('Style', 190, 96); g.fillText('10/6', 190, 108);
  return c;
}
// The March Hare, seated (waist up), with straw in his hair; 'dip' holds the watch over his cup.
export function marchHare(pose = 'sit') {
  const { c, g } = canvas(300, 460);
  const coat = new Path2D(); coat.moveTo(60, 460); coat.lineTo(80, 300); coat.lineTo(220, 300); coat.lineTo(240, 460); coat.closePath(); panel(g, coat, 1211, 0.5, 6, 0.5);
  fur(g, ellipse(150, 240, 60, 62), 1213, 200);
  for (const s of [-1, 1]) { const ear = ellipse(150 + s * 28, 110, 18, 70, s * 0.2); fur(g, ear, 1215 + s, 60); }
  g.strokeStyle = INK; for (let k = 0; k < 5; k++) line(g, 2, [[120 + k * 14, 180], [100 + k * 22, 150 - (k % 2) * 10]]); // straw
  dot(g, 128, 230, 6); dot(g, 92, 252, 6); line(g, 2, [[96, 262], [60, 256]]); line(g, 2, [[96, 266], [62, 274]]);
  if (pose === 'dip') line(g, 8, [[70, 360], [30, 300]]);
  return c;
}
// The Dormouse: 'sleep' (curled up) or 'talk' (sitting up, eyes half shut).
export function dormouse(pose = 'sleep') {
  const { c, g } = canvas(220, 180);
  if (pose === 'sleep') {
    fur(g, ellipse(110, 110, 90, 64), 1221, 260);
    fur(g, ellipse(60, 100, 40, 34), 1223, 60);
    line(g, 2, [[44, 96], [56, 98]]); line(g, 3, [[180, 150], [200, 120], [190, 100]]);
  } else {
    fur(g, ellipse(110, 120, 60, 58), 1225, 220);
    fur(g, ellipse(100, 58, 42, 38), 1227, 70);
    line(g, 2, [[80, 54], [92, 56]]); line(g, 2, [[106, 56], [118, 54]]);
  }
  for (const x of [pose === 'sleep' ? 72 : 82, pose === 'sleep' ? 50 : 118]) { const e = ellipse(x, pose === 'sleep' ? 70 : 24, 14, 12); fillPaper(g, e); outline(g, e, 2); }
  return c;
}
// The Hatter's watch, which tells the day of the month.
export function dayWatch() {
  const { c, g } = canvas(160, 180);
  line(g, 4, [[80, 0], [80, 22]]); const ring = ellipse(80, 26, 10, 8); outline(g, ring, 3);
  const face = ellipse(80, 104, 70, 70); fillPaper(g, face); outline(g, face, 5);
  g.fillStyle = INK; g.font = FONT(14); g.textAlign = 'center';
  for (let d = 1; d <= 31; d += 3) { const a = (d / 31) * Math.PI * 2 - Math.PI / 2; g.fillText(String(d), 80 + Math.cos(a) * 52, 108 + Math.sin(a) * 52); }
  line(g, 3, [[80, 104], [80 + Math.cos(-1.2) * 40, 104 + Math.sin(-1.2) * 40]]);
  const smear = ellipse(100, 130, 16, 8, 0.4); g.save(); g.globalAlpha = 0.5; hatch(g, smear, { gap: 2, seed: 1271 }); g.restore(); // the butter
  return c;
}
// --- Thought vignettes ------------------------------------------------------------
export function ravenVignette() {
  return vignette('Why is a raven like a writing-desk?', (g) => {
    const desk = new Path2D(); desk.moveTo(160, 330); desk.lineTo(180, 230); desk.lineTo(400, 230); desk.lineTo(420, 330); desk.closePath(); fillPaper(g, desk); hatch(g, desk, { angle: 0.2, gap: 5, seed: 1301 }); outline(g, desk, 3);
    const raven = ellipse(290, 180, 60, 40, -0.3); g.fillStyle = INK; g.fill(raven);
    const head = ellipse(230, 140, 26, 22); g.fill(head); const beak = new Path2D(); beak.moveTo(210, 138); beak.lineTo(176, 146); beak.lineTo(210, 152); beak.closePath(); g.fill(beak);
    dot(g, 226, 134, 3, PAPER); line(g, 4, [[280, 216], [276, 232]]); line(g, 4, [[300, 216], [304, 232]]);
  });
}
export function concertVignette() {
  return vignette('the great concert given by the Queen of Hearts', (g) => {
    const stage = rect(80, 260, 220, 40); fillPaper(g, stage); hatch(g, stage, { gap: 5, seed: 1311 }); outline(g, stage, 3);
    const h = hatter('riddle'); g.drawImage(h, 140, 90, 110, 170);
    const queen = ellipse(390, 220, 50, 70); fillPaper(g, queen); outline(g, queen, 3);
    const crown = new Path2D(); crown.moveTo(360, 150); crown.lineTo(370, 120); crown.lineTo(390, 140); crown.lineTo(410, 120); crown.lineTo(420, 150); crown.closePath(); fillPaper(g, crown); outline(g, crown, 2);
    line(g, 5, [[350, 220], [320, 170]]); line(g, 5, [[430, 220], [460, 170]]); // jumping up
  });
}
export function batVignette() {
  return vignette('Up above the world you fly, like a tea-tray in the sky', (g) => {
    const world = ellipse(256, 380, 230, 90); fillPaper(g, world); hatch(g, world, { angle: 0.3, gap: 7, seed: 1321, alpha: 0.5 }); outline(g, world, 3);
    const tray = ellipse(256, 170, 90, 26); fillPaper(g, tray); outline(g, tray, 4);
    for (const s of [-1, 1]) { const w = new Path2D(); w.moveTo(256, 140); w.quadraticCurveTo(256 + s * 60, 90, 256 + s * 120, 110); w.quadraticCurveTo(256 + s * 80, 130, 256, 150); w.closePath(); g.fillStyle = INK; g.fill(w); }
    for (const [x, y] of [[100, 90], [420, 110], [380, 60]]) { line(g, 2, [[x - 8, y], [x + 8, y]]); line(g, 2, [[x, y - 8], [x, y + 8]]); } // twinkles
  });
}
export function treacleVignette() {
  return vignette('three little sisters at the bottom of a treacle-well', (g) => {
    const well = new Path2D(); well.moveTo(140, 60); well.lineTo(150, 340); well.lineTo(360, 340); well.lineTo(370, 60); well.closePath();
    fillPaper(g, well); hatch(g, well, { angle: Math.PI / 2, gap: 6, seed: 1331, alpha: 0.5 }); outline(g, well, 4);
    const treacle = rect(150, 280, 210, 60); hatch(g, treacle, { angle: 0, gap: 3, seed: 1332 }); outline(g, treacle, 2);
    for (const x of [200, 255, 310]) { const head = ellipse(x, 250, 16, 18); fillPaper(g, head); outline(g, head, 2); const d = new Path2D(); d.moveTo(x - 14, 266); d.lineTo(x - 22, 300); d.lineTo(x + 22, 300); d.lineTo(x + 14, 266); d.closePath(); fillPaper(g, d); outline(g, d, 2); }
  });
}
