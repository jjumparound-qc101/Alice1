// Placeholder art for Chapter VI, "Pig and Pepper", drawn in code until the AI drawings
// arrive (docs/CHAPTER_06_ASSETS.md). Figures stand on the bottom edge of their image and
// face left. No colours: Chapter VI names none.
import { canvas, hatch, flicks, outline, fillPaper, grain, shadeEdge, INK, PAPER } from './ink.js';
import { vignette, line, shape } from './props.js';

const FONT = (size, italic = false) => `${italic ? 'italic ' : ''}${size}px "IM Fell English", Georgia, serif`;
const ellipse = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; };
const rect = (x, y, w, h) => { const p = new Path2D(); p.rect(x, y, w, h); return p; };
const dot = (g, x, y, r, c = INK) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
const panel = (g, p, seed, angle = Math.PI / 2, gap = 5, alpha = 0.7) => { fillPaper(g, p); hatch(g, p, { angle, gap, seed, alpha }); outline(g, p, 3); };
function fur(g, p, seed, count = 260) { shape(g, p, seed); flicks(g, p, { count, len: 9, seed: seed + 1, width: 1 }); outline(g, p, 3); }

// A body in livery or a dress: coat, legs and arms, for the people of this chapter.
function figure(g, { seed, coat, skirt = false, cx = 150 }) {
  if (!skirt) for (const x of [cx - 25, cx + 25]) { const l = rect(x - 12, 300, 24, 140); panel(g, l, seed + x, 0.4, 6, 0.4); const sh = ellipse(x - 6, 440, 22, 9); g.fillStyle = INK; g.fill(sh); }
  const body = new Path2D();
  if (skirt) { body.moveTo(cx - 50, 150); body.lineTo(cx - 110, 445); body.lineTo(cx + 110, 445); body.lineTo(cx + 50, 150); body.closePath(); }
  else { body.moveTo(cx - 55, 150); body.lineTo(cx - 70, 320); body.lineTo(cx + 70, 320); body.lineTo(cx + 55, 150); body.closePath(); }
  panel(g, body, seed, coat, 6, 0.6);
  for (const x of [cx - 40, cx]) line(g, 2, [[x + 20, 170], [x + 20, 300]]); // buttons line
  return body;
}

// The Fish-Footman and the Frog-Footman, "in livery … powdered hair that curled all over
// their heads". pose: 'stand' or 'sit' (on the ground, staring up at the sky).
export function footman(kind = 'frog', pose = 'stand') {
  const { c, g } = canvas(320, 460);
  if (pose === 'sit') {
    g.translate(0, 120);
    for (const x of [100, 150]) { const l = rect(x - 70, 290, 90, 26); panel(g, l, 1001 + x, 0.2, 6, 0.4); } // legs out
    const body = new Path2D(); body.moveTo(110, 150); body.lineTo(90, 320); body.lineTo(220, 320); body.lineTo(210, 150); body.closePath(); panel(g, body, 1003, 0.8, 6, 0.6);
    g.translate(0, -120);
  } else figure(g, { seed: kind === 'fish' ? 1011 : 1021, coat: 0.8 });
  const hy = pose === 'sit' ? 190 : 90, hx = pose === 'sit' ? 160 : 150;
  for (let k = 0; k < 9; k++) { const curl = ellipse(hx - 40 + (k % 5) * 20, hy - 40 + Math.floor(k / 5) * 18, 12, 10); fillPaper(g, curl); outline(g, curl, 2); } // powdered curls
  if (kind === 'fish') {
    const head = new Path2D(); head.moveTo(hx + 50, hy - 20); head.quadraticCurveTo(hx - 20, hy - 60, hx - 75, hy + 10); head.quadraticCurveTo(hx - 20, hy + 60, hx + 50, hy + 40); head.closePath();
    fillPaper(g, head); hatch(g, head, { angle: 0.6, gap: 5, seed: 1031, alpha: 0.5 }); outline(g, head, 3);
    for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(hx + 10 + k * 10, hy + 10, 8, 0, Math.PI); g.stroke(); } // scales
    dot(g, hx - 30, hy, 6);
  } else {
    const head = ellipse(hx, hy + 10, 55, 45); fillPaper(g, head); hatch(g, head, { angle: 0.2, gap: 7, seed: 1041, alpha: 0.4 }); outline(g, head, 3);
    for (const x of [hx - 25, hx + 20]) { const e = ellipse(x, hy - 25, 18, 16); fillPaper(g, e); outline(g, e, 3); dot(g, x, pose === 'sit' ? hy - 32 : hy - 24, 7); } // "large eyes like a frog", near the top of his head
    line(g, 3, [[hx - 40, hy + 25], [hx + 35, hy + 25]]);
  }
  return c;
}
// "a great letter, nearly as large as himself", with the Queen's crown on its seal.
export function greatLetter() {
  const { c, g } = canvas(400, 260);
  const env = rect(10, 10, 380, 240); fillPaper(g, env); outline(g, env, 4);
  line(g, 2, [[10, 10], [200, 140], [390, 10]]);
  const seal = ellipse(200, 140, 32, 32); hatch(g, seal, { gap: 3, seed: 1051 }); outline(g, seal, 2);
  g.fillStyle = PAPER; g.font = FONT(30); g.textAlign = 'center'; g.fillText('♛', 200, 152);
  return c;
}
// The Duchess on her stool, or standing (for tossing the baby and hurrying out).
export function duchess(pose = 'sit') {
  const { c, g } = canvas(360, 460);
  if (pose === 'sit') { const stool = new Path2D(); stool.rect(110, 360, 140, 18); stool.moveTo(120, 378); stool.lineTo(100, 460); stool.moveTo(180, 378); stool.lineTo(180, 460); stool.moveTo(240, 378); stool.lineTo(260, 460); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(stool); }
  const dress = new Path2D(); dress.moveTo(130, 170); dress.lineTo(pose === 'sit' ? 50 : 80, pose === 'sit' ? 380 : 455); dress.lineTo(pose === 'sit' ? 310 : 280, pose === 'sit' ? 380 : 455); dress.lineTo(230, 170); dress.closePath();
  fillPaper(g, dress); hatch(g, dress, { angle: 0.9, gap: 6, seed: 1061, alpha: 0.5 });
  for (let k = 0; k < 18; k++) { const f = ellipse(90 + (k * 53) % 180, 220 + (k * 37) % 140, 10, 8); outline(g, f, 1.5); } // a flowered dress
  outline(g, dress, 3);
  const head = ellipse(180, 120, 62, 70); fillPaper(g, head); shadeEdge(g, head, { size: 120, dx: -0.2, dy: 0, angle: 0.5, gap: 4, seed: 1062 }); outline(g, head, 3);
  const cap = new Path2D(); cap.moveTo(100, 90); cap.quadraticCurveTo(180, -20, 260, 90); cap.quadraticCurveTo(300, 40, 290, 10); cap.quadraticCurveTo(180, 40, 70, 10); cap.quadraticCurveTo(60, 40, 100, 90); cap.closePath(); panel(g, cap, 1063, 0.3, 5, 0.5); // the great head-dress
  dot(g, 160, 115, 5); dot(g, 200, 115, 5); line(g, 3, [[160, 160], [200, 160]]); line(g, 2, [[140, 100], [170, 106]]); line(g, 2, [[190, 106], [220, 100]]); // a scowl
  return c;
}
export function cook(pose = 'stir') {
  const { c, g } = canvas(320, 460);
  figure(g, { seed: 1071, coat: 0.5, skirt: true, cx: 160 });
  const apron = new Path2D(); apron.moveTo(130, 200); apron.lineTo(110, 440); apron.lineTo(210, 440); apron.lineTo(190, 200); apron.closePath(); fillPaper(g, apron); outline(g, apron, 2);
  const head = ellipse(160, 110, 50, 56); fillPaper(g, head); hatch(g, head, { angle: 0.4, gap: 7, seed: 1072, alpha: 0.4 }); outline(g, head, 3);
  const cap = ellipse(160, 62, 56, 24); fillPaper(g, cap); outline(g, cap, 3);
  dot(g, 140, 108, 5); line(g, 3, [[140, 140], [175, 138]]);
  if (pose === 'throw') line(g, 8, [[200, 180], [260, 60]]); else line(g, 8, [[120, 190], [40, 300]]); // arm: up to throw, or down to the spoon
  if (pose !== 'throw') line(g, 4, [[40, 300], [10, 420]]); // the spoon
  return c;
}
// The baby: stage 0 howling "like a star-fish", 1 with a snout and small eyes, 2 a pig in its clothes.
export function baby(stage = 0) {
  const { c, g } = canvas(240, 200);
  const clothes = new Path2D(); clothes.moveTo(70, 70); clothes.quadraticCurveTo(140, 50, 230, 120); clothes.quadraticCurveTo(160, 190, 70, 140); clothes.closePath();
  fillPaper(g, clothes); hatch(g, clothes, { angle: 1.2, gap: 8, seed: 1081, alpha: 0.3 }); outline(g, clothes, 3);
  if (stage === 0) for (const [x1, y1] of [[20, 30], [40, 180], [200, 20], [230, 190]]) line(g, 7, [[120, 105], [x1, y1]]); // arms and legs every way
  const head = ellipse(70, 100, 46, 44); fillPaper(g, head); outline(g, head, 3);
  if (stage === 0) { line(g, 2, [[50, 92], [62, 96]]); line(g, 2, [[80, 96], [92, 92]]); const m = ellipse(70, 122, 16, 12); g.fillStyle = INK; g.fill(m); } // howling
  else {
    const snout = ellipse(48, 112, stage === 2 ? 22 : 16, stage === 2 ? 16 : 12); fillPaper(g, snout); outline(g, snout, 3); dot(g, 42, 112, 3); dot(g, 54, 112, 3);
    dot(g, 66, 88, stage === 2 ? 3 : 4); dot(g, 88, 88, stage === 2 ? 3 : 4);
    if (stage === 2) for (const x of [70, 100]) { const ear = new Path2D(); ear.moveTo(x - 10, 66); ear.lineTo(x + 6, 40); ear.lineTo(x + 14, 66); ear.closePath(); fillPaper(g, ear); outline(g, ear, 2); }
  }
  return c;
}
// "it trot away quietly into the wood"
export function pig() {
  const { c, g } = canvas(300, 200);
  for (const x of [90, 130, 200, 235]) line(g, 9, [[x, 140], [x - 4, 196]]);
  const b = ellipse(160, 110, 110, 55); fillPaper(g, b); shadeEdge(g, b, { size: 120, dx: -0.15, dy: -0.2, angle: 0.4, gap: 5, seed: 1091 }); outline(g, b, 3);
  const head = ellipse(60, 95, 42, 36); fillPaper(g, head); outline(g, head, 3);
  const sn = ellipse(22, 100, 14, 16); fillPaper(g, sn); outline(g, sn, 3); dot(g, 18, 96, 3); dot(g, 18, 106, 3);
  dot(g, 56, 84, 4); line(g, 3, [[270, 100], [290, 80], [280, 70]]);
  const ear = new Path2D(); ear.moveTo(60, 64); ear.lineTo(80, 36); ear.lineTo(90, 66); ear.closePath(); fillPaper(g, ear); outline(g, ear, 2);
  return c;
}
// The Cheshire Cat, sitting and grinning; `grinOnly` draws just the grin, in the same place,
// so the rest of the Cat can fade "beginning with the end of the tail" and leave the grin.
export const CAT_PX = { w: 400, h: 360 };
export function cheshire(grinOnly = false) {
  const { c, g } = canvas(CAT_PX.w, CAT_PX.h);
  const grin = () => {
    const m = new Path2D(); m.moveTo(60, 150); m.quadraticCurveTo(130, 230, 210, 150); m.quadraticCurveTo(130, 190, 60, 150); m.closePath();
    g.fillStyle = PAPER; g.fill(m); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(m);
    for (let k = 0; k < 11; k++) { const x = 72 + k * 13; line(g, 2, [[x, 156 + Math.sin(k / 10 * Math.PI) * 18], [x, 170 + Math.sin(k / 10 * Math.PI) * 26]]); }
  };
  if (grinOnly) { grin(); return c; }
  g.strokeStyle = INK; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(300, 300); g.bezierCurveTo(380, 300, 390, 200, 370, 150); g.stroke(); // the tail, to the right
  g.strokeStyle = PAPER; g.lineWidth = 8; g.stroke();
  fur(g, ellipse(230, 250, 120, 100), 1101, 500);
  for (let k = 0; k < 6; k++) line(g, 3, [[160 + k * 30, 170], [175 + k * 30, 330]]); // tabby stripes
  fur(g, ellipse(135, 140, 100, 85), 1103, 260);
  for (const s of [-1, 1]) { const ear = new Path2D(); ear.moveTo(135 + s * 50, 80); ear.lineTo(135 + s * 80, 20); ear.lineTo(135 + s * 95, 100); ear.closePath(); fillPaper(g, ear); hatch(g, ear, { gap: 4, seed: 1105 + s }); outline(g, ear, 3); }
  for (const x of [100, 170]) { const e = ellipse(x, 115, 16, 12); fillPaper(g, e); outline(g, e, 2); dot(g, x, 115, 4); }
  grin();
  return c;
}
// A long low bough for the Cat to sit on.
export function bough() {
  const { c, g } = canvas(900, 220);
  const b = new Path2D(); b.moveTo(0, 120); b.quadraticCurveTo(450, 90, 900, 150); b.lineTo(900, 175); b.quadraticCurveTo(450, 120, 0, 175); b.closePath();
  fillPaper(g, b); hatch(g, b, { angle: 0.05, gap: 4, seed: 1111 }); outline(g, b, 3);
  g.strokeStyle = INK; // twigs and a few leaves hanging below the bough, clear of the Cat above it
  for (let k = 0; k < 14; k++) { const x = 40 + k * 62; line(g, 2, [[x, 150], [x + 14, 200]]); const leaf = ellipse(x + 16, 204, 12, 6, 0.6); fillPaper(g, leaf); hatch(g, leaf, { gap: 3, seed: 1112 + k, alpha: 0.6 }); outline(g, leaf, 1.5); }
  return c;
}
// The kitchen's back wall: the great fireplace with the cauldron, the hearth, a dresser.
export function kitchenWall() {
  const { c, g } = canvas(1600, 900);
  const all = rect(0, 0, 1600, 900); fillPaper(g, all); hatch(g, all, { angle: Math.PI / 2, gap: 8, seed: 1121, alpha: 0.35 });
  const fire = rect(500, 280, 600, 560); fillPaper(g, fire); hatch(g, fire, { angle: 0.8, gap: 3, seed: 1122 }); hatch(g, fire, { angle: -0.8, gap: 4, seed: 1123, alpha: 0.6 }); outline(g, fire, 6);
  g.fillStyle = INK; g.fillRect(470, 250, 660, 36); // mantel
  const pot = ellipse(800, 640, 150, 120); fillPaper(g, pot); shadeEdge(g, pot, { size: 200, dx: -0.2, dy: -0.2, angle: 0.5, gap: 4, seed: 1124 }); outline(g, pot, 5);
  line(g, 4, [[800, 280], [800, 520]]);
  for (let k = 0; k < 6; k++) line(g, 3, [[650 + k * 60, 840], [665 + k * 60, 760 - (k % 2) * 40]]); // flames, in ink
  const dresser = rect(1200, 300, 330, 540); panel(g, dresser, 1125, 0.1, 7, 0.5);
  for (const y of [380, 470]) { line(g, 3, [[1200, y + 50], [1530, y + 50]]); for (let k = 0; k < 4; k++) { const pl = ellipse(1250 + k * 75, y + 15, 30, 30); fillPaper(g, pl); outline(g, pl, 2); } }
  const window = rect(140, 220, 220, 260); panel(g, window, 1126, 0.8, 6, 0.3);
  grain(g, 0.04, 2);
  return c;
}
// Things the Cook throws: kind 'plate', 'saucepan', 'pan' (a frying-pan) or 'irons'.
export function thrown(kind = 'plate') {
  const { c, g } = canvas(200, 120);
  if (kind === 'plate') { const p = ellipse(100, 60, 80, 50); fillPaper(g, p); outline(g, p, 3); const r = ellipse(100, 60, 52, 32); outline(g, r, 1.5); }
  else if (kind === 'irons') { for (let k = 0; k < 3; k++) line(g, 6, [[20, 20 + k * 30], [190, 40 + k * 26]]); }
  else {
    const p = ellipse(kind === 'pan' ? 70 : 80, 60, 60, kind === 'pan' ? 30 : 46); fillPaper(g, p); hatch(g, p, { gap: 4, seed: 1131, alpha: 0.6 }); outline(g, p, 3);
    line(g, 8, [[kind === 'pan' ? 130 : 140, 60], [196, 50]]);
  }
  return c;
}
// The March Hare's house: "the chimneys were shaped like ears and the roof was thatched with fur".
export function marchHareHouse() {
  const { c, g } = canvas(800, 700);
  for (const x of [260, 520]) { const ear = new Path2D(); ear.moveTo(x - 30, 260); ear.quadraticCurveTo(x - 40, 20, x, 10); ear.quadraticCurveTo(x + 40, 20, x + 30, 260); ear.closePath(); fillPaper(g, ear); hatch(g, ear, { angle: Math.PI / 2, gap: 6, seed: 1141 + x, alpha: 0.5 }); outline(g, ear, 4); const inner = ellipse(x, 120, 12, 70); outline(g, inner, 2); }
  const roof = new Path2D(); roof.moveTo(40, 340); roof.quadraticCurveTo(400, 120, 760, 340); roof.closePath(); fillPaper(g, roof); flicks(g, roof, { count: 1200, len: 14, seed: 1143, width: 1.2 }); outline(g, roof, 4);
  const walls = rect(100, 340, 600, 360); fillPaper(g, walls); hatch(g, walls, { angle: 0.05, gap: 9, seed: 1144, alpha: 0.35 }); outline(g, walls, 4);
  const door = rect(340, 470, 120, 230); fillPaper(g, door); hatch(g, door, { angle: Math.PI / 2, gap: 5, seed: 1145, alpha: 0.85 }); outline(g, door, 3);
  for (const x of [160, 540]) { const w = rect(x, 420, 100, 90); fillPaper(g, w); hatch(g, w, { angle: 0.8, gap: 5, seed: 1146 + x, alpha: 0.5 }); outline(g, w, 3); }
  return c;
}

// --- Thought vignettes ------------------------------------------------------------
export function axisVignette() {
  return vignette('twenty-four hours to turn round on its axis', (g) => {
    const globe = ellipse(256, 210, 110, 110); fillPaper(g, globe); outline(g, globe, 4);
    for (let k = -2; k <= 2; k++) { const lat = ellipse(256, 210 + k * 38, Math.sqrt(110 * 110 - (k * 38) ** 2), 10); g.lineWidth = 1.5; g.strokeStyle = INK; g.stroke(lat); }
    const mer = ellipse(256, 210, 50, 110); outline(g, mer, 1.5);
    line(g, 4, [[230, 70], [282, 350]]); // the axis
    const sun = ellipse(80, 150, 30, 30); outline(g, sun, 3); for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; line(g, 2, [[80 + Math.cos(a) * 38, 150 + Math.sin(a) * 38], [80 + Math.cos(a) * 52, 150 + Math.sin(a) * 52]]); }
  });
}
export function pigsVignette() {
  return vignette('children who might do very well as pigs', (g) => {
    for (const [x, s] of [[150, 1], [360, 0.85]]) {
      const head = ellipse(x, 180, 56 * s, 52 * s); fillPaper(g, head); outline(g, head, 3);
      const sn = ellipse(x - 10, 196, 20 * s, 14 * s); fillPaper(g, sn); outline(g, sn, 2); dot(g, x - 16, 196, 3); dot(g, x - 4, 196, 3);
      dot(g, x - 22, 168, 4); dot(g, x + 10, 168, 4);
      const coat = new Path2D(); coat.moveTo(x - 50 * s, 225); coat.lineTo(x - 80 * s, 340); coat.lineTo(x + 80 * s, 340); coat.lineTo(x + 50 * s, 225); coat.closePath(); shape(g, coat, 1151 + x);
      const collar = ellipse(x, 230, 50 * s, 12); fillPaper(g, collar); outline(g, collar, 2);
    }
  });
}
