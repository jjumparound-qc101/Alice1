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
