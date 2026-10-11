// Placeholder art for the court (Chapters XI and XII), drawn in code until the AI drawings
// arrive (docs/CHAPTER_11_ASSETS.md, CHAPTER_12_ASSETS.md). Figures stand on the bottom edge
// of their image and face left. Colours: the Hatter "turned pale" (a pale face, briefly);
// the card people are coloured like real cards (owner, 2026-10-11).
import { canvas, hatch, blob, flicks, outline, fillPaper, grain, shadeEdge, INK, PAPER } from './ink.js';
import { SPOT, vignette, line, shape } from './props.js';
import { suit, suitColour } from './props8.js';

const FONT = (size, italic = false) => `${italic ? 'italic ' : ''}${size}px "IM Fell English", Georgia, serif`;
const ellipse = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; };
const rect = (x, y, w, h) => { const p = new Path2D(); p.rect(x, y, w, h); return p; };
const dot = (g, x, y, r, c = INK) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
const panel = (g, p, seed, angle = Math.PI / 2, gap = 5, alpha = 0.7) => { fillPaper(g, p); hatch(g, p, { angle, gap, seed, alpha }); outline(g, p, 3); };
export const PALE_FACE = SPOT.paleFace; // "turned pale": the face drained to a cold paper-white

// The back wall of the court: panelling, a canopy of hearts over the throne, high windows.
export function courtWall(w = 3000, h = 1000) {
  const { c, g } = canvas(w, h);
  g.fillStyle = PAPER; g.fillRect(0, 0, w, h);
  hatch(g, rect(0, 0, w, h), { angle: Math.PI / 2, gap: 9, width: 0.8, seed: 2201, alpha: 0.4 });
  for (let x = 120; x < w; x += 480) { // high windows
    const win = new Path2D(); win.moveTo(x, 420); win.lineTo(x, 160); win.arc(x + 90, 160, 90, Math.PI, 0); win.lineTo(x + 180, 420); win.closePath();
    fillPaper(g, win); outline(g, win, 4); line(g, 2, [[x + 90, 70], [x + 90, 420]]); line(g, 2, [[x, 260], [x + 180, 260]]);
  }
  const dado = rect(0, h - 300, w, 300); fillPaper(g, dado); hatch(g, dado, { angle: 0.7, gap: 6, seed: 2202, alpha: 0.5 }); outline(g, dado, 3);
  for (let x = 0; x < w; x += 150) g.strokeRect(x + 15, h - 280, 120, 250);
  // The canopy over the throne, in the middle, hung with hearts.
  const cx = w / 2;
  const can = new Path2D(); can.moveTo(cx - 420, 120); can.lineTo(cx + 420, 120); can.lineTo(cx + 380, 330); for (let k = 0; k <= 8; k++) can.quadraticCurveTo(cx + 380 - k * 95 - 47, 380, cx + 380 - (k + 1) * 95, 330); can.closePath();
  fillPaper(g, can); outline(g, can, 4);
  g.fillStyle = INK; for (let k = 0; k < 9; k++) g.fill(suit('hearts', cx - 360 + k * 90, 220, 22));
  for (const s of [-1, 1]) { const curtain = new Path2D(); curtain.moveTo(cx + s * 380, 330); curtain.quadraticCurveTo(cx + s * 470, 600, cx + s * 400, h - 300); curtain.lineTo(cx + s * 330, h - 300); curtain.quadraticCurveTo(cx + s * 400, 600, cx + s * 330, 330); curtain.closePath(); panel(g, curtain, 2203 + s, Math.PI / 2, 5, 0.6); }
  grain(g, 0.03, 2204);
  return c;
}
// A throne for two on a low dais, decorated with hearts.
export function throne() {
  const { c, g } = canvas(800, 600);
  const dais = rect(20, 520, 760, 80); fillPaper(g, dais); hatch(g, dais, { angle: 0.1, gap: 6, seed: 2211, alpha: 0.5 }); outline(g, dais, 3);
  const back = new Path2D(); back.moveTo(110, 520); back.lineTo(110, 120); back.quadraticCurveTo(400, 0, 690, 120); back.lineTo(690, 520); back.closePath();
  fillPaper(g, back); hatch(g, back, { angle: Math.PI / 2, gap: 7, seed: 2212, alpha: 0.35 }); outline(g, back, 4);
  g.fillStyle = INK; for (const x of [250, 400, 550]) g.fill(suit('hearts', x, 120, 26));
  for (const x of [60, 690]) { const arm = rect(x, 360, 50, 160); panel(g, arm, 2213 + x, 0.3, 5, 0.6); }
  const seat = rect(110, 400, 580, 50); panel(g, seat, 2215, 0.1, 6, 0.4);
  return c;
}
// The jury-box: a low railed box, two rows, seen from the front.
export function juryBox() {
  const { c, g } = canvas(900, 260);
  const box = rect(10, 90, 880, 170); fillPaper(g, box); hatch(g, box, { angle: Math.PI / 2, gap: 6, seed: 2221, alpha: 0.45 }); outline(g, box, 4);
  const rail = rect(0, 70, 900, 26); fillPaper(g, rail); hatch(g, rail, { gap: 4, seed: 2222, alpha: 0.6 }); outline(g, rail, 3);
  for (let x = 60; x < 900; x += 120) { g.strokeRect(x - 40, 120, 80, 110); }
  return c;
}
// The table in the middle of the court with a large dish of tarts.
export function tartsTable() {
  const { c, g } = canvas(400, 300);
  for (const x of [60, 340]) line(g, 10, [[x, 150], [x, 296]]);
  const top = rect(20, 130, 360, 24); fillPaper(g, top); hatch(g, top, { gap: 4, seed: 2231, alpha: 0.6 }); outline(g, top, 3);
  const dish = ellipse(200, 120, 140, 26); fillPaper(g, dish); outline(g, dish, 3);
  for (let k = 0; k < 9; k++) { const x = 100 + (k % 5) * 50 + (k > 4 ? 25 : 0), y = k > 4 ? 92 : 112; const t = ellipse(x, y, 22, 10); fillPaper(g, t); outline(g, t, 2); const jam = ellipse(x, y - 2, 11, 5); hatch(g, jam, { gap: 2, seed: 2232 + k }); outline(g, jam, 1.5); }
  return c;
}
// The witness stand: a small railed box; a figure stands behind it.
export function witnessBox() {
  const { c, g } = canvas(300, 260);
  const box = rect(20, 60, 260, 200); fillPaper(g, box); hatch(g, box, { angle: Math.PI / 2, gap: 6, seed: 2241, alpha: 0.5 }); outline(g, box, 4);
  const rail = rect(6, 44, 288, 22); fillPaper(g, rail); hatch(g, rail, { gap: 4, seed: 2242, alpha: 0.6 }); outline(g, rail, 3);
  g.strokeRect(50, 90, 200, 140);
  return c;
}
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
  const banner = rect(80, 46, 90, 60); fillPaper(g, banner); outline(g, banner, 2); g.fillStyle = INK; g.fill(suit('hearts', 125, 76, 16));
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

// --- Thought vignettes ------------------------------------------------------------
export function refreshmentsVignette() {
  return vignette('and hand round the refreshments!', (g) => {
    const tray = ellipse(256, 230, 180, 50); fillPaper(g, tray); outline(g, tray, 4); outline(g, ellipse(256, 230, 150, 38), 1.5);
    for (let k = 0; k < 7; k++) { const x = 150 + (k % 4) * 66 + (k > 3 ? 33 : 0), y = k > 3 ? 210 : 236; const t = ellipse(x, y, 28, 12); fillPaper(g, t); outline(g, t, 2); const jam = ellipse(x, y - 2, 14, 6); hatch(g, jam, { gap: 2, seed: 2311 + k }); outline(g, jam, 1.5); }
    line(g, 6, [[80, 260], [110, 240]]); line(g, 6, [[432, 260], [402, 240]]); // hands
  });
}
export function slatesVignette() {
  return vignette('"stupid things!" on their slates', (g) => {
    const words = ['stupid things!', 'stupid things!', 'stoopid?', 'stupid thing'];
    words.forEach((w, k) => {
      const x = 70 + (k % 2) * 200, y = 90 + Math.floor(k / 2) * 120;
      const f = rect(x, y, 170, 100); fillPaper(g, f); outline(g, f, 3);
      const s = rect(x + 10, y + 10, 150, 80); g.fillStyle = INK; g.fill(s);
      g.fillStyle = PAPER; g.font = FONT(22, true); g.textAlign = 'center'; g.fillText(w, x + 85, y + 58);
    });
  });
}
