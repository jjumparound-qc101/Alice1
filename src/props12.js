// Placeholder art for Chapter XII, "Alice's Evidence", drawn in code until the AI drawings
// arrive (docs/CHAPTER_12_ASSETS.md). Colours: the King's face pale and the Queen's purple
// (props8.js card faces); card suits red and black (owner, 2026-10-11). Everything else ink.
import { canvas, hatch, outline, fillPaper, shadeEdge, INK, PAPER } from './ink.js';
import { vignette, line, shape } from './props.js';

const FONT = (size, italic = false) => `${italic ? 'italic ' : ''}${size}px "IM Fell English", Georgia, serif`;
const ellipse = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; };
const rect = (x, y, w, h) => { const p = new Path2D(); p.rect(x, y, w, h); return p; };
const dot = (g, x, y, r, c = INK) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };

// The verses: a folded paper, open, closely written.
export function verses() {
  const { c, g } = canvas(200, 260);
  const p = rect(10, 10, 180, 240); fillPaper(g, p); outline(g, p, 3);
  line(g, 1.5, [[10, 130], [190, 130]]); // the fold
  for (let y = 34; y < 240; y += 14) if (Math.abs(y - 130) > 6) line(g, 1.2, [[26, y], [174 - ((y * 7) % 40), y]]);
  return c;
}
// The King's note-book.
export function noteBook() {
  const { c, g } = canvas(160, 120);
  const b = rect(10, 10, 140, 100); fillPaper(g, b); outline(g, b, 3);
  line(g, 2, [[80, 10], [80, 110]]);
  for (let y = 30; y < 100; y += 12) { line(g, 1, [[20, y], [70, y]]); line(g, 1, [[90, y], [140, y]]); }
  return c;
}
// The inkstand the Queen throws at the Lizard.
export function inkstand() {
  const { c, g } = canvas(140, 120);
  const base = rect(10, 80, 120, 30); fillPaper(g, base); hatch(g, base, { gap: 4, seed: 2401, alpha: 0.6 }); outline(g, base, 3);
  const pot = ellipse(70, 64, 26, 22); g.fillStyle = INK; g.fill(pot);
  line(g, 3, [[78, 50], [118, 6]]); const fe = ellipse(112, 14, 6, 16, 0.7); fillPaper(g, fe); outline(g, fe, 1.5); // the quill
  return c;
}
// A dead leaf fluttering down.
export function deadLeaf(seed = 0) {
  const { c, g } = canvas(60, 40);
  const l = ellipse(30, 20, 26, 12, seed * 0.7); fillPaper(g, l); hatch(g, l, { angle: 0.8 + seed, gap: 3, seed: 2411 + seed, alpha: 0.5 }); outline(g, l, 2);
  line(g, 1.5, [[6, 20], [54, 20]]);
  return c;
}

// --- Thought vignettes ------------------------------------------------------------
// "a globe of goldfish she had accidentally upset the week before" (goldfish: not a colour, COLOR.md rule 7)
export function goldfishVignette() {
  return vignette('a globe of goldfish, upset the week before', (g) => {
    const carpet = rect(0, 260, 512, 100); hatch(g, carpet, { angle: 0.6, gap: 8, seed: 2421, alpha: 0.35 });
    const globe = ellipse(330, 210, 90, 80); fillPaper(g, globe); hatch(g, globe, { angle: 0, gap: 9, seed: 2422, alpha: 0.25 }); outline(g, globe, 3);
    const water = new Path2D(); water.moveTo(250, 250); water.quadraticCurveTo(170, 300, 80, 290); water.lineTo(80, 300); water.quadraticCurveTo(200, 320, 260, 270); water.closePath(); hatch(g, water, { gap: 3, seed: 2423 }); outline(g, water, 1.5);
    for (const [x, y, r] of [[120, 280, 0.4], [190, 300, -0.3], [250, 286, 0.2]]) {
      const f = ellipse(x, y, 22, 10, r); fillPaper(g, f); outline(g, f, 2);
      const t = new Path2D(); t.moveTo(x + 20, y); t.lineTo(x + 34, y - 10); t.lineTo(x + 34, y + 10); t.closePath(); fillPaper(g, t); outline(g, t, 2);
    }
  });
}
// The sister's dream turned back into the countryside: sheep-bells, the shepherd boy, the farm-yard, the cattle.
export function countryVignette() {
  return vignette('tinkling sheep-bells … the lowing of the cattle', (g) => {
    const field = new Path2D(); field.moveTo(0, 360); field.quadraticCurveTo(256, 200, 512, 300); field.lineTo(512, 360); field.closePath(); hatch(g, field, { angle: 0.1, gap: 7, seed: 2431, alpha: 0.4 });
    for (const [x, y] of [[150, 270], [220, 285], [290, 268]]) { const s = ellipse(x, y, 30, 18); fillPaper(g, s); outline(g, s, 2); const h = ellipse(x - 30, y - 6, 10, 8); g.fillStyle = INK; g.fill(h); dot(g, x - 20, y + 10, 4); for (const d of [-14, 12]) line(g, 3, [[x + d, y + 16], [x + d, y + 28]]); }
    line(g, 4, [[400, 300], [400, 220]]); const boy = ellipse(400, 205, 14, 16); fillPaper(g, boy); outline(g, boy, 2); line(g, 3, [[414, 230], [450, 200]]); // the shepherd boy and his crook
    const barn = new Path2D(); barn.moveTo(40, 220); barn.lineTo(40, 170); barn.lineTo(80, 140); barn.lineTo(120, 170); barn.lineTo(120, 220); barn.closePath(); fillPaper(g, barn); hatch(g, barn, { angle: Math.PI / 2, gap: 6, seed: 2432, alpha: 0.5 }); outline(g, barn, 2);
    const cow = ellipse(330, 150, 30, 16); fillPaper(g, cow); for (let k = 0; k < 4; k++) dot(g, 315 + k * 10, 146 + (k % 2) * 6, 4); outline(g, cow, 2);
  });
}
// "this same little sister of hers would, in the after-time, be herself a grown woman … and
// gather about her other little children"
export function grownAliceVignette() {
  return vignette('the dream of Wonderland of long ago', (g) => {
    const chair = rect(200, 150, 110, 170); fillPaper(g, chair); hatch(g, chair, { angle: Math.PI / 2, gap: 6, seed: 2441, alpha: 0.4 }); outline(g, chair, 3);
    const woman = new Path2D(); woman.moveTo(255, 140); woman.lineTo(205, 320); woman.lineTo(305, 320); woman.closePath(); fillPaper(g, woman); shadeEdge(g, woman, { size: 60, dx: 0.2, dy: 0, angle: 0.4, gap: 4, seed: 2442 }); outline(g, woman, 2.5);
    const head = ellipse(255, 120, 20, 24); fillPaper(g, head); outline(g, head, 2.5);
    g.lineWidth = 3; g.beginPath(); g.moveTo(240, 104); g.quadraticCurveTo(230, 150, 236, 170); g.moveTo(270, 104); g.quadraticCurveTo(280, 150, 274, 170); g.stroke(); // long hair, as Alice's
    for (const [x, y] of [[110, 300], [160, 320], [360, 318], [410, 296]]) { const ch = ellipse(x, y, 16, 18); fillPaper(g, ch); outline(g, ch, 2); const b = new Path2D(); b.moveTo(x - 18, y + 16); b.lineTo(x + 18, y + 16); b.lineTo(x + 24, y + 50); b.lineTo(x - 24, y + 50); b.closePath(); fillPaper(g, b); outline(g, b, 2); }
    g.fillStyle = INK; g.font = FONT(22, true); g.textAlign = 'center'; g.fillText('“Once upon a time…”', 256, 80);
  });
}
