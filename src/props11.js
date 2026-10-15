// Placeholder art for the court (Chapters XI and XII), drawn in code until the AI drawings
// arrive (docs/CHAPTER_11_ASSETS.md, CHAPTER_12_ASSETS.md). Figures stand on the bottom edge
// of their image and face left. Colours: the Hatter "turned pale" (a pale face, briefly);
// the card people are coloured like real cards, and so are the court's hearts: the canopy,
// the throne and the herald's banner (owner, 2026-10-11).
import { canvas, hatch, blob, flicks, outline, fillPaper, grain, shadeEdge, INK, PAPER } from '@engine/ink.js';
import { SPOT, vignette, line, shape } from './props.js';
import { suit, suitColour } from './props8.js';

const FONT = (size, italic = false) => `${italic ? 'italic ' : ''}${size}px "IM Fell English", Georgia, serif`;
const ellipse = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; };
const rect = (x, y, w, h) => { const p = new Path2D(); p.rect(x, y, w, h); return p; };
const dot = (g, x, y, r, c = INK) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
const panel = (g, p, seed, angle = Math.PI / 2, gap = 5, alpha = 0.7) => { fillPaper(g, p); hatch(g, p, { angle, gap, seed, alpha }); outline(g, p, 3); };
export const PALE_FACE = SPOT.paleFace; // "turned pale": the face drained to a cold paper-white

// The crowd: rows of little birds and beasts and cards behind the gallery rail (a backdrop).
export function crowdGallery(w = 2400, h = 500, seed = 2251) {
  const { c, g } = canvas(w, h);
  const kinds = ['card', 'bird', 'beast', 'card', 'beast', 'bird'];
  for (let row = 0; row < 3; row++) {
    const y0 = 150 + row * 110, s = 0.7 + row * 0.15;
    for (let k = 0; k < 26; k++) {
      const x = 40 + k * 92 + (row % 2) * 46 + ((k * 37 + row * 11) % 20), kind = kinds[(k + row * 2) % kinds.length];
      if (kind === 'card') { const b = rect(x - 26 * s, y0 - 10 * s, 52 * s, 80 * s); fillPaper(g, b); outline(g, b, 2); const su = ['hearts', 'spades', 'clubs', 'diamonds'][k % 4]; g.fillStyle = suitColour(su); g.fill(suit(su, x, y0 + 30 * s, 12 * s)); const hd = ellipse(x, y0 - 30 * s, 18 * s, 20 * s); fillPaper(g, hd); outline(g, hd, 2); dot(g, x - 6 * s, y0 - 32 * s, 2.5); }
      else if (kind === 'bird') { const b = ellipse(x, y0 + 20 * s, 26 * s, 34 * s); shape(g, b, seed + k + row * 30, { size: 40 }); const hd = ellipse(x - 10 * s, y0 - 22 * s, 16 * s, 14 * s); fillPaper(g, hd); outline(g, hd, 2); const bk = new Path2D(); bk.moveTo(x - 24 * s, y0 - 24 * s); bk.lineTo(x - 40 * s, y0 - 18 * s); bk.lineTo(x - 24 * s, y0 - 16 * s); bk.closePath(); g.fillStyle = INK; g.fill(bk); }
      else { const b = ellipse(x, y0 + 20 * s, 30 * s, 36 * s); fillPaper(g, b); flicks(g, b, { count: 50, len: 6, seed: seed + k + row * 50 }); outline(g, b, 2); const hd = ellipse(x, y0 - 20 * s, 20 * s, 18 * s); fillPaper(g, hd); outline(g, hd, 2); for (const d of [-1, 1]) { const ear = ellipse(x + d * 14 * s, y0 - 38 * s, 6 * s, 10 * s); fillPaper(g, ear); outline(g, ear, 1.5); } dot(g, x - 7 * s, y0 - 22 * s, 2.5); dot(g, x + 7 * s, y0 - 22 * s, 2.5); }
    }
  }
  const rail = rect(0, h - 70, w, 70); fillPaper(g, rail); hatch(g, rail, { angle: Math.PI / 2, gap: 6, seed: seed + 900, alpha: 0.5 }); outline(g, rail, 3);
  return c;
}
// Small things: the herald's trumpet, the scroll, a slate, the canvas bag, a shoe, the pepper-box.
export function trumpet() {
  const { c, g } = canvas(300, 120);
  line(g, 7, [[10, 40], [220, 40]]); const bell = new Path2D(); bell.moveTo(210, 40); bell.lineTo(290, 8); bell.lineTo(290, 72); bell.closePath(); fillPaper(g, bell); hatch(g, bell, { gap: 4, seed: 2261, alpha: 0.4 }); outline(g, bell, 3);
  const banner = rect(80, 46, 90, 60); fillPaper(g, banner); outline(g, banner, 2); g.fillStyle = suitColour('hearts'); g.fill(suit('hearts', 125, 76, 16));
  return c;
}
export function scroll(open = false) {
  const { c, g } = canvas(200, open ? 260 : 80);
  if (!open) { const r = rect(10, 20, 180, 44); fillPaper(g, r); hatch(g, r, { angle: Math.PI / 2, gap: 6, seed: 2271, alpha: 0.4 }); outline(g, r, 3); for (const x of [10, 190]) outline(g, ellipse(x, 42, 8, 22), 2); return c; }
  const p = rect(20, 20, 160, 220); fillPaper(g, p); outline(g, p, 3);
  for (let y = 50; y < 220; y += 18) line(g, 1.5, [[36, y], [164 - (y % 36), y]]);
  for (const y of [20, 240]) { const r = rect(10, y - 10, 180, 20); fillPaper(g, r); outline(g, r, 2); }
  return c;
}
export function slate() {
  const { c, g } = canvas(120, 90);
  const f = rect(4, 4, 112, 82); fillPaper(g, f); outline(g, f, 3);
  const s = rect(14, 14, 92, 62); g.fillStyle = INK; g.fill(s);
  g.strokeStyle = PAPER; g.lineWidth = 2; for (let y = 30; y < 70; y += 14) { g.beginPath(); g.moveTo(22, y); g.lineTo(90 - (y % 20), y); g.stroke(); }
  return c;
}
export function canvasBag() {
  const { c, g } = canvas(260, 220);
  const b = new Path2D(); b.moveTo(40, 210); b.quadraticCurveTo(0, 100, 90, 60); b.lineTo(170, 60); b.quadraticCurveTo(260, 100, 220, 210); b.closePath();
  fillPaper(g, b); hatch(g, b, { angle: 0.6, gap: 5, seed: 2281, alpha: 0.5 }); outline(g, b, 3);
  line(g, 3, [[90, 60], [130, 30], [170, 60]]); line(g, 2, [[120, 40], [104, 6]]); line(g, 2, [[138, 40], [156, 8]]); // the strings
  return c;
}
export function shoe() {
  const { c, g } = canvas(120, 60);
  const s = new Path2D(); s.moveTo(6, 50); s.quadraticCurveTo(10, 14, 60, 18); s.lineTo(70, 6); s.lineTo(100, 8); s.quadraticCurveTo(116, 30, 112, 52); s.closePath(); g.fillStyle = INK; g.fill(s);
  return c;
}
// The Hatter standing as a witness (whole figure): 'cup' (teacup and bread-and-butter),
// 'pale' (the same, his face gone pale), 'bite' (biting the teacup), 'tremble' (shaking his
// shoes off), 'knee' (down on one knee), 'run' (hurrying out in his stockinged feet).
export function hatterStand(pose = 'cup') {
  const { c, g } = canvas(320, 560);
  g.strokeStyle = INK; g.lineCap = 'round';
  const kneel = pose === 'knee';
  if (kneel) g.translate(0, 80);
  // Legs in check trousers, shoes (or not).
  const legs = pose === 'run' ? [[[140, 380], [90, 470]], [[180, 380], [240, 476]]] : kneel ? [[[140, 380], [100, 400], [100, 476]], [[180, 380], [190, 476]]] : [[[140, 380], [135, 540]], [[180, 380], [185, 540]]];
  for (const l of legs) { g.lineWidth = 26; g.beginPath(); l.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.strokeStyle = PAPER; g.lineWidth = 18; g.stroke(); g.strokeStyle = INK; for (let k = 1; k < 4; k++) { const [x0, y0] = l[0], [x1, y1] = l[l.length - 1]; const x = x0 + (x1 - x0) * k / 4, y = y0 + (y1 - y0) * k / 4; line(g, 2, [[x - 9, y], [x + 9, y]]); } }
  if (pose !== 'run' && pose !== 'tremble') for (const l of legs) { const [x, y] = l[l.length - 1]; const s = ellipse(x - 10, y + 6, 22, 9); g.fillStyle = INK; g.fill(s); }
  // Coat.
  const coat = new Path2D(); coat.moveTo(95, 390); coat.lineTo(110, 230); coat.lineTo(210, 230); coat.lineTo(225, 390); coat.closePath(); panel(g, coat, 2301, 0.8, 6, 0.5);
  const bow = new Path2D(); bow.moveTo(160, 236); bow.lineTo(125, 220); bow.lineTo(125, 252); bow.closePath(); bow.moveTo(160, 236); bow.lineTo(195, 220); bow.lineTo(195, 252); bow.closePath(); fillPaper(g, bow); outline(g, bow, 2.5);
  for (const [x, y] of [[135, 230], [185, 244]]) dot(g, x, y, 4);
  // Arms with the teacup and the bread-and-butter.
  const upCup = pose === 'bite';
  line(g, 10, [[112, 250], [70, 300], upCup ? [92, 200] : [60, 270]]);
  line(g, 10, [[208, 250], [250, 300], [262, 262]]);
  if (pose !== 'knee' && pose !== 'run') {
    const cx = upCup ? 96 : 58, cy = upCup ? 186 : 256;
    const cup = new Path2D(); cup.moveTo(cx - 20, cy - 16); cup.lineTo(cx - 14, cy + 12); cup.lineTo(cx + 14, cy + 12); cup.lineTo(cx + 20, cy - 16); cup.closePath(); fillPaper(g, cup); outline(g, cup, 2.5);
    if (upCup) { g.fillStyle = PAPER; g.beginPath(); g.arc(cx + 18, cy - 14, 9, 0, Math.PI * 2); g.fill(); } // a bite out of it
    const sauce = ellipse(cx, cy + 14, 26, 6); fillPaper(g, sauce); outline(g, sauce, 2);
    const bread = rect(250, 238, 36, 26); fillPaper(g, bread); hatch(g, bread, { gap: 4, seed: 2302, alpha: 0.4 }); outline(g, bread, 2.5);
  }
  // Head, a little to the left, under the great hat with its ticket.
  const face = pose === 'pale' ? PALE_FACE : null;
  const head = ellipse(150, 180, 40, 48);
  if (face) { g.fillStyle = face; g.fill(head); outline(g, head, 3); } else { fillPaper(g, head); shadeEdge(g, head, { size: 80, dx: 0.2, dy: 0, angle: 0.5, gap: 4, seed: 2303 }); outline(g, head, 3); }
  dot(g, 134, 172, 4); dot(g, 164, 172, 4); line(g, 3, [[146, 180], [128, 198]]);
  if (pose === 'tremble' || pose === 'pale') line(g, 2, [[132, 208], [140, 204], [148, 210], [156, 204], [164, 208]]); else line(g, 2.5, [[136, 210], [160, 210]]);
  const brim = ellipse(150, 132, 70, 13); fillPaper(g, brim); outline(g, brim, 3);
  const crown = new Path2D(); crown.moveTo(102, 132); crown.lineTo(92, 10); crown.lineTo(208, 10); crown.lineTo(198, 132); crown.closePath(); panel(g, crown, 2304, Math.PI / 2, 7, 0.5);
  const band = rect(98, 98, 104, 22); g.fillStyle = INK; g.fill(band);
  const ticket = rect(150, 50, 44, 34); fillPaper(g, ticket); outline(g, ticket, 2);
  g.fillStyle = INK; g.font = FONT(10); g.textAlign = 'center'; g.fillText('In this', 172, 62); g.fillText('Style', 172, 72); g.fillText('10/6', 172, 82);
  if (pose === 'tremble') for (const [x, y] of [[60, 120], [260, 110], [40, 300], [280, 330]]) line(g, 2, [[x, y], [x + 12, y - 8]]); // shaking
  return c;
}

