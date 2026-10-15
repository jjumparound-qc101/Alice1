// Placeholder art for Chapter X, "The Lobster Quadrille": the thought vignettes, drawn in code
// until the AI drawings arrive (docs/CHAPTER_10_ASSETS.md). The Mock Turtle and the Gryphon
// are Chapter IX's (props9.js). Colours (COLOR.md rule 6, words in the poems and songs): the
// Lobster "baked … too brown", and the soup "so rich and green".
import { hatch, outline, fillPaper, shadeEdge, INK, PAPER } from '@engine/ink.js';
import { SPOT, vignette, line } from './props.js';

const ellipse = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; };
const rect = (x, y, w, h) => { const p = new Path2D(); p.rect(x, y, w, h); return p; };
const dot = (g, x, y, r, c = INK) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
const sea = (g, y0, seed) => { hatch(g, rect(0, y0, 512, 360 - y0), { angle: 0, gap: 6, seed, alpha: 0.5 }); for (let k = 0; k < 14; k++) line(g, 1.5, [[(k * 83) % 480, y0 + 20 + (k * 41) % (300 - y0)], [(k * 83) % 480 + 30, y0 + 16 + (k * 41) % (300 - y0)]]); };

// A lobster in profile, facing left, centred on (x, y), size s; fill: ink hatching or a colour.
function lobster(g, x, y, s, fill = null, seed = 2101) {
  const body = new Path2D(); body.moveTo(x - 60 * s, y); body.quadraticCurveTo(x, y - 30 * s, x + 70 * s, y - 6 * s); body.lineTo(x + 110 * s, y + 10 * s); body.lineTo(x + 70 * s, y + 18 * s); body.quadraticCurveTo(x, y + 26 * s, x - 60 * s, y); body.closePath();
  if (fill) { g.fillStyle = fill; g.fill(body); } else fillPaper(g, body);
  hatch(g, body, { angle: 1.2, gap: 5, seed, alpha: fill ? 0.3 : 0.6 }); outline(g, body, 2.5);
  for (let k = 1; k < 5; k++) line(g, 1.5, [[x + k * 16 * s, y - 14 * s], [x + k * 16 * s, y + 18 * s]]);
  for (const d of [-1, 1]) { line(g, 3, [[x - 40 * s, y], [x - 80 * s, y + d * 30 * s]]); const cl = ellipse(x - 96 * s, y + d * 36 * s, 20 * s, 11 * s, d * 0.5); if (fill) { g.fillStyle = fill; g.fill(cl); } else fillPaper(g, cl); outline(g, cl, 2); }
  line(g, 1.2, [[x - 58 * s, y - 4 * s], [x - 140 * s, y - 50 * s]]); line(g, 1.2, [[x - 58 * s, y - 2 * s], [x - 150 * s, y - 20 * s]]); // feelers
  dot(g, x - 50 * s, y - 8 * s, 3 * s);
}
function fish(g, x, y, s, seed, tailInMouth = false) {
  if (tailInMouth) { g.lineWidth = 16 * s; g.strokeStyle = INK; g.beginPath(); g.arc(x, y, 40 * s, 0, Math.PI * 2); g.stroke(); g.strokeStyle = PAPER; g.lineWidth = 10 * s; g.stroke(); g.strokeStyle = INK; dot(g, x - 30 * s, y - 28 * s, 3); return; }
  const b = ellipse(x, y, 50 * s, 18 * s); fillPaper(g, b); hatch(g, b, { gap: 4, seed, alpha: 0.4 }); outline(g, b, 2);
  const t = new Path2D(); t.moveTo(x + 46 * s, y); t.lineTo(x + 76 * s, y - 18 * s); t.lineTo(x + 76 * s, y + 18 * s); t.closePath(); fillPaper(g, t); outline(g, t, 2);
  dot(g, x - 34 * s, y - 4 * s, 2.5);
}

