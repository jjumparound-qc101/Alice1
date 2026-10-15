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
// The inkstand the Queen throws at the Lizard.
export function inkstand() {
  const { c, g } = canvas(140, 120);
  const base = rect(10, 80, 120, 30); fillPaper(g, base); hatch(g, base, { gap: 4, seed: 2401, alpha: 0.6 }); outline(g, base, 3);
  const pot = ellipse(70, 64, 26, 22); g.fillStyle = INK; g.fill(pot);
  line(g, 3, [[78, 50], [118, 6]]); const fe = ellipse(112, 14, 6, 16, 0.7); fillPaper(g, fe); outline(g, fe, 1.5); // the quill
  return c;
}
