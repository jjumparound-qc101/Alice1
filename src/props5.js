// Placeholder art for Chapter V, "Advice from a Caterpillar", drawn in code until the AI
// drawings arrive (docs/CHAPTER_05_ASSETS.md). The Father William pictures are Tenniel's own
// plates (public/art/tenniel/). Colours: the blue Caterpillar, and the green treetops seen
// from Alice's long neck (docs/COLOR.md).
import { canvas, hatch, flicks, outline, fillPaper, grain, INK, PAPER } from '@engine/ink.js';
import { SPOT, vignette, line, shape } from './props.js';

const ellipse = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; };
const dot = (g, x, y, r, c = INK) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
function feathered(g, p, seed, count = 200) { shape(g, p, seed); flicks(g, p, { count, len: 10, seed: seed + 1, width: 1 }); outline(g, p, 3); }

// The Pigeon: 'fly' (wings spread, straight at you) or 'perch' (ruffled, on a branch).
export function pigeon(pose = 'fly') {
  const { c, g } = canvas(420, 300);
  if (pose === 'fly') {
    for (const s of [-1, 1]) {
      const wing = new Path2D(); wing.moveTo(210, 150); wing.quadraticCurveTo(210 + s * 120, 40, 210 + s * 205, 30);
      wing.quadraticCurveTo(210 + s * 150, 120, 210 + s * 180, 150); wing.quadraticCurveTo(210 + s * 100, 170, 210, 180); wing.closePath();
      feathered(g, wing, 911 + s, 160);
      for (let k = 0; k < 6; k++) line(g, 2, [[210 + s * (110 + k * 15), 60 + k * 14], [210 + s * (130 + k * 15), 120 + k * 6]]);
    }
  }
  feathered(g, ellipse(210, pose === 'fly' ? 175 : 190, 60, pose === 'fly' ? 55 : 90), 915, 220);
  feathered(g, ellipse(210, pose === 'fly' ? 110 : 100, 40, 38), 917, 60);
  const beak = new Path2D(); beak.moveTo(198, 120); beak.lineTo(210, 150); beak.lineTo(222, 120); beak.closePath(); g.fillStyle = INK; g.fill(beak);
  dot(g, 195, 104, 5); dot(g, 225, 104, 5);
  if (pose === 'perch') { line(g, 7, [[60, 290], [380, 280]]); for (let k = 0; k < 7; k++) line(g, 2.5, [[160 + k * 14, 120], [150 + k * 16, 92]]); } // branch; ruffled crest
  return c;
}
// The Pigeon's nest of twigs, with eggs, "the highest tree in the wood".
export function nest() {
  const { c, g } = canvas(360, 200);
  for (const [x, y] of [[150, 110], [190, 104], [225, 112]]) { const e = ellipse(x, y, 22, 28); fillPaper(g, e); outline(g, e, 2.5); }
  const n = new Path2D(); n.moveTo(20, 110); n.quadraticCurveTo(180, 230, 340, 110); n.quadraticCurveTo(180, 170, 20, 110); n.closePath();
  fillPaper(g, n); hatch(g, n, { angle: 0.4, gap: 4, seed: 921 }); hatch(g, n, { angle: -0.5, gap: 6, seed: 922, alpha: 0.6 }); outline(g, n, 3);
  g.strokeStyle = INK; for (let k = 0; k < 14; k++) line(g, 2, [[30 + k * 22, 110 + (k % 3) * 8], [50 + k * 22, 140 - (k % 2) * 10]]);
  return c;
}
// "a little house in it about four feet high" (the Duchess's house, Chapter VI).
export function littleHouse() {
  const { c, g } = canvas(600, 640);
  const roof = new Path2D(); roof.moveTo(20, 260); roof.lineTo(300, 60); roof.lineTo(580, 260); roof.closePath();
  fillPaper(g, roof); hatch(g, roof, { angle: 0.2, gap: 5, seed: 941 }); outline(g, roof, 4);
  const chim = new Path2D(); chim.rect(420, 60, 60, 120); fillPaper(g, chim); hatch(g, chim, { gap: 5, seed: 942 }); outline(g, chim, 3);
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); for (let k = 0; k < 4; k++) { g.moveTo(450 + k * 6, 50 - k * 14); g.quadraticCurveTo(430, 30 - k * 14, 455, 10 - k * 14); } g.stroke(); // smoke
  const walls = new Path2D(); walls.rect(60, 260, 480, 380); fillPaper(g, walls); hatch(g, walls, { angle: Math.PI / 2, gap: 9, seed: 943, alpha: 0.4 }); outline(g, walls, 4);
  const door = new Path2D(); door.rect(240, 420, 120, 220); fillPaper(g, door); hatch(g, door, { angle: Math.PI / 2, gap: 5, seed: 944, alpha: 0.85 }); outline(g, door, 3);
  dot(g, 340, 530, 8);
  for (const x of [100, 400]) { const w = new Path2D(); w.rect(x, 320, 100, 90); fillPaper(g, w); hatch(g, w, { angle: 0.8, gap: 5, seed: 945 + x, alpha: 0.5 }); outline(g, w, 3); }
  grain(g, 0.03, 4);
  return c;
}
// A plate frame: a paper mount with an inked rule, for Tenniel's Father William pictures.
export function plateMount(w, h) {
  const { c, g } = canvas(w + 80, h + 80);
  g.fillStyle = PAPER; g.fillRect(0, 0, w + 80, h + 80);
  g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(12, 12, w + 56, h + 56); g.lineWidth = 1.5; g.strokeRect(22, 22, w + 36, h + 36);
  grain(g, 0.03, 5);
  return c;
}

