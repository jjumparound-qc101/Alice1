// Placeholder art for Chapter II, "The Pool of Tears", drawn in code in the engraving
// style of props.js until the AI drawings arrive (docs/CHAPTER_02_ASSETS.md). Swimmers are
// drawn down to the waterline only: the bottom edge of each image is the water's surface.
import { canvas, hatch, flicks, outline, fillPaper, shadeEdge, grain, INK, PAPER } from '@engine/ink.js';
import { SPOT, vignette, line, shape, cat } from './props.js';

const FONT = (size, italic = false) => `${italic ? 'italic ' : ''}${size}px "IM Fell English", Georgia, serif`;
const ellipse = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; };
const dot = (g, x, y, r) => { g.fillStyle = INK; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
// A furred or feathered body: paper, shaded on one side, with short flicks.
function body(g, p, seed, count = 260) { shape(g, p, seed); flicks(g, p, { count, len: 9, seed: seed + 1, width: 1 }); outline(g, p, 3); }

// --- Swimmers (facing left) -------------------------------------------------------
export function mouseSwim() {
  const { c, g } = canvas(420, 200);
  body(g, ellipse(250, 200, 150, 70), 301, 300);                // back, half under water
  const head = new Path2D(); head.moveTo(150, 190); head.quadraticCurveTo(60, 170, 30, 150);
  head.quadraticCurveTo(70, 105, 160, 110); head.quadraticCurveTo(190, 150, 150, 190); head.closePath();
  body(g, head, 303, 120);
  body(g, ellipse(150, 92, 30, 36, -0.3), 305, 40);              // ear
  dot(g, 32, 150, 6); dot(g, 92, 136, 5);                        // nose, eye
  g.strokeStyle = INK; for (const k of [-1, 0, 1]) line(g, 1.5, [[40, 152], [0, 140 + k * 14]]);
  return c;
}
export function mouseLeap() {
  const { c, g } = canvas(420, 420);
  const b = new Path2D(); b.ellipse(230, 230, 130, 80, -0.5, 0, Math.PI * 2);
  body(g, b, 311, 500);
  g.strokeStyle = INK; // fur standing on end
  for (let a = 0; a < Math.PI * 2; a += 0.22) line(g, 2, [[230 + Math.cos(a) * 125, 230 + Math.sin(a) * 78], [230 + Math.cos(a) * 150, 230 + Math.sin(a) * 100]]);
  body(g, ellipse(110, 150, 60, 48, -0.6), 313, 100);
  body(g, ellipse(130, 92, 26, 32, -0.3), 315, 30);
  dot(g, 62, 132, 6); dot(g, 104, 138, 5);
  line(g, 4, [[340, 300], [390, 360], [370, 410]]);              // tail
  for (const [x, y] of [[180, 300], [270, 310]]) line(g, 4, [[x, y], [x - 10, y + 40]]); // legs
  return c;
}
export function duckSwim() {
  const { c, g } = canvas(420, 260);
  const b = new Path2D(); b.moveTo(70, 260); b.quadraticCurveTo(60, 160, 200, 170); b.quadraticCurveTo(360, 160, 400, 120);
  b.quadraticCurveTo(390, 230, 330, 260); b.closePath();
  body(g, b, 321, 200);
  const neck = new Path2D(); neck.moveTo(110, 190); neck.quadraticCurveTo(90, 120, 110, 70); neck.quadraticCurveTo(150, 50, 160, 90);
  neck.quadraticCurveTo(150, 140, 170, 185); neck.closePath(); body(g, neck, 323, 60);
  const bill = new Path2D(); bill.moveTo(100, 78); bill.quadraticCurveTo(40, 80, 30, 96); bill.quadraticCurveTo(70, 104, 110, 96); bill.closePath();
  fillPaper(g, bill); hatch(g, bill, { gap: 4, seed: 325 }); outline(g, bill, 2.5);
  dot(g, 128, 80, 5);
  return c;
}
export function dodoSwim() {
  const { c, g } = canvas(460, 360);
  body(g, ellipse(260, 330, 190, 130), 331, 500);
  const head = ellipse(130, 150, 70, 62); body(g, head, 333, 120);
  const neck = new Path2D(); neck.moveTo(110, 200); neck.quadraticCurveTo(140, 260, 170, 300); neck.lineTo(230, 230); neck.quadraticCurveTo(190, 200, 180, 160); neck.closePath();
  body(g, neck, 335, 80);
  const beak = new Path2D(); beak.moveTo(80, 120); beak.quadraticCurveTo(0, 120, 10, 190); beak.quadraticCurveTo(30, 175, 40, 200);
  beak.quadraticCurveTo(80, 200, 95, 175); beak.closePath();
  fillPaper(g, beak); shadeEdge(g, beak, { size: 80, angle: 0.5, gap: 4, seed: 337 }); outline(g, beak, 3);
  dot(g, 120, 135, 7);
  return c;
}
export function lorySwim() {
  const { c, g } = canvas(320, 300);
  body(g, ellipse(190, 300, 120, 90), 341, 240);
  body(g, ellipse(130, 150, 70, 75), 343, 140);
  const beak = new Path2D(); beak.moveTo(70, 140); beak.quadraticCurveTo(20, 140, 30, 200); beak.quadraticCurveTo(60, 180, 80, 180); beak.closePath();
  fillPaper(g, beak); hatch(g, beak, { gap: 3.5, seed: 345 }); outline(g, beak, 3);
  g.strokeStyle = INK; for (let k = 0; k < 5; k++) line(g, 3, [[150 + k * 8, 80], [170 + k * 14, 40 - k * 4]]); // crest
  dot(g, 110, 130, 6);
  return c;
}
export function eagletSwim() {
  const { c, g } = canvas(320, 300);
  body(g, ellipse(190, 300, 125, 90), 351, 240);
  const head = new Path2D(); head.moveTo(60, 200); head.quadraticCurveTo(70, 90, 160, 90); head.quadraticCurveTo(230, 110, 220, 230); head.closePath();
  body(g, head, 353, 160);
  const beak = new Path2D(); beak.moveTo(75, 130); beak.quadraticCurveTo(20, 130, 25, 185); beak.quadraticCurveTo(45, 160, 80, 165); beak.closePath();
  fillPaper(g, beak); hatch(g, beak, { gap: 4, seed: 355 }); outline(g, beak, 3);
  g.strokeStyle = INK; for (let k = 0; k < 6; k++) line(g, 2, [[170 + k * 9, 100], [190 + k * 10, 70 + (k % 2) * 10]]); // downy tufts
  dot(g, 112, 128, 6);
  return c;
}

// --- Props ------------------------------------------------------------------------
// "a pair of white kid gloves": paper-white, outline only (docs/COLOR.md rule 8).
export function kidGloves() {
  const { c, g } = canvas(300, 180);
  const glove = (x, y, rot) => {
    g.save(); g.translate(x, y); g.rotate(rot);
    const p = new Path2D(); p.moveTo(-40, 70); p.lineTo(-40, 0);
    for (let k = 0; k < 4; k++) { const fx = -36 + k * 20; p.lineTo(fx, -50 + (k === 0 || k === 3 ? 14 : 0)); p.arc(fx + 8, -50 + (k === 0 || k === 3 ? 14 : 0), 8, Math.PI, 0); p.lineTo(fx + 16, -6); }
    p.lineTo(40, 0); p.quadraticCurveTo(70, -10, 60, 20); p.lineTo(40, 30); p.lineTo(40, 70); p.closePath();
    g.fillStyle = '#fbf8f0'; g.fill(p); g.strokeStyle = INK; g.lineWidth = 2.5; g.stroke(p);
    g.restore();
  };
  glove(100, 90, -0.3); glove(190, 90, 0.25);
  return c;
}
// "a large fan"
export function fan() {
  const { c, g } = canvas(320, 200);
  const f = new Path2D(); f.moveTo(160, 190); f.arc(160, 190, 170, Math.PI * 1.05, Math.PI * 1.95); f.closePath();
  fillPaper(g, f); hatch(g, f, { angle: 1.2, gap: 6, seed: 361, alpha: 0.45 }); outline(g, f, 3);
  g.strokeStyle = INK;
  for (let k = 0; k <= 12; k++) { const a = Math.PI * (1.05 + 0.9 * k / 12); line(g, 1.6, [[160, 190], [160 + Math.cos(a) * 168, 190 + Math.sin(a) * 168]]); }
  dot(g, 160, 186, 8);
  return c;
}
// One tear, falling.
export function tear() {
  const { c, g } = canvas(48, 72);
  const p = new Path2D(); p.moveTo(24, 4); p.quadraticCurveTo(44, 44, 24, 66); p.quadraticCurveTo(4, 44, 24, 4); p.closePath();
  g.fillStyle = '#f7f3ea'; g.fill(p); outline(g, p, 2.5);
  return c;
}
// The pool's surface, in Tenniel's horizontal engraved water lines; tiles both ways.
export function water() {
  const { c, g } = canvas(512, 512);
  g.fillStyle = PAPER; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = INK;
  for (let y = 4, k = 0; y < 512; y += 9, k++) {
    g.lineWidth = 0.9 + (k % 3) * 0.35;
    g.globalAlpha = 0.55 + (k % 4) * 0.1;
    g.beginPath();
    for (let x = 0; x <= 512; x += 8) g.lineTo(x, y + Math.sin((x / 512) * Math.PI * 2 * (2 + (k % 3)) + k) * 2.2);
    g.stroke();
  }
  g.globalAlpha = 1;
  grain(g, 0.04, 9);
  return c;
}

// --- Thought vignettes ------------------------------------------------------------
// "Alice's Right Foot, Esq., Hearthrug, near the Fender, (with Alice's love)."
export function footParcelVignette() {
  return vignette('presents to one’s own feet', (g) => {
    const p = new Path2D(); p.rect(130, 130, 260, 170);
    fillPaper(g, p); hatch(g, p, { angle: 0.3, gap: 7, seed: 371, alpha: 0.4 }); outline(g, p, 3);
    line(g, 3, [[260, 130], [260, 300]]); line(g, 3, [[130, 215], [390, 215]]); // string
    g.fillStyle = PAPER; g.fillRect(150, 228, 220, 62); g.strokeRect(150, 228, 220, 62);
    g.fillStyle = INK; g.textAlign = 'center'; g.font = FONT(18, true);
    g.fillText('Alice’s Right Foot, Esq.', 260, 252); g.fillText('Hearthrug, near the Fender', 260, 276);
  });
}
// "I'm sure I'm not Ada … for her hair goes in such long ringlets … I can't be Mabel"
export function adaMabelVignette() {
  return vignette('not Ada … and not Mabel', (g) => {
    const head = (x, ringlets) => {
      const h = ellipse(x, 150, 40, 48); fillPaper(g, h); outline(g, h, 3);
      g.strokeStyle = INK;
      if (ringlets) for (let k = -3; k <= 3; k++) { g.lineWidth = 2; g.beginPath(); for (let y = 0; y < 120; y += 4) g.lineTo(x + k * 12 + Math.sin(y / 6) * 6, 120 + y); g.stroke(); }
      const d = new Path2D(); d.moveTo(x - 30, 200); d.lineTo(x - 60, 330); d.lineTo(x + 60, 330); d.lineTo(x + 30, 200); d.closePath(); shape(g, d, 380 + x);
    };
    head(170, true);
    const house = new Path2D(); house.rect(300, 230, 130, 100); shape(g, house, 383);
    const roof = new Path2D(); roof.moveTo(290, 232); roof.lineTo(365, 170); roof.lineTo(440, 232); roof.closePath(); fillPaper(g, roof); hatch(g, roof, { gap: 4, seed: 384 }); outline(g, roof, 3);
    g.strokeRect(350, 280, 30, 50);
  });
}
// "How doth the little crocodile … On every golden scale!" (gold: a colour in a poem, rule 6)
export function crocodileVignette() {
  return vignette('How doth the little crocodile', (g) => {
    const river = new Path2D(); river.rect(0, 250, 512, 120); hatch(g, river, { angle: 0, gap: 8, seed: 391, alpha: 0.6 });
    const b = new Path2D(); b.moveTo(60, 240); b.quadraticCurveTo(140, 190, 300, 200); b.quadraticCurveTo(400, 205, 470, 250);
    b.quadraticCurveTo(380, 255, 300, 250); b.lineTo(80, 255); b.closePath();
    g.fillStyle = SPOT.gold; g.fill(b);
    g.save(); g.clip(b); g.strokeStyle = INK; g.lineWidth = 1.2; // scales
    for (let x = 60; x < 470; x += 16) for (let y = 190; y < 260; y += 12) { g.beginPath(); g.arc(x + (y % 24 ? 8 : 0), y, 7, 0, Math.PI); g.stroke(); }
    g.restore(); outline(g, b, 3);
    g.strokeStyle = INK; line(g, 2.5, [[62, 238], [140, 228]]);   // the grin
    for (let k = 0; k < 6; k++) line(g, 1.5, [[80 + k * 10, 230], [84 + k * 10, 236]]);
    dot(g, 150, 214, 5);
    for (const x of [30, 0]) { const f = new Path2D(); f.ellipse(x + 20, 236, 14, 6, 0, 0, Math.PI * 2); fillPaper(g, f); outline(g, f, 2); } // little fishes
  });
}
// "bathing machines in the sea, some children digging in the sand with wooden spades,
//  then a row of lodging houses, and behind them a railway station"
export function seasideVignette() {
  return vignette('wherever you go on the English coast', (g) => {
    const sea = new Path2D(); sea.rect(0, 240, 512, 130); hatch(g, sea, { angle: 0, gap: 7, seed: 401, alpha: 0.6 });
    for (let k = 0; k < 6; k++) { const h = new Path2D(); h.rect(70 + k * 60, 120 - (k % 2) * 10, 50, 70); shape(g, h, 410 + k); const r = new Path2D(); r.moveTo(65 + k * 60, 122 - (k % 2) * 10); r.lineTo(95 + k * 60, 96 - (k % 2) * 10); r.lineTo(125 + k * 60, 122 - (k % 2) * 10); r.closePath(); fillPaper(g, r); outline(g, r, 2); }
    for (const x of [120, 300]) { const m = new Path2D(); m.rect(x, 200, 44, 50); shape(g, m, 420 + x); for (const w of [x + 8, x + 36]) { g.beginPath(); g.arc(w, 252, 7, 0, Math.PI * 2); g.stroke(); } }
    for (const x of [210, 250]) { const k = ellipse(x, 230, 9, 11); fillPaper(g, k); outline(g, k, 2); line(g, 2, [[x + 8, 236], [x + 22, 258]]); }
  });
}
// "at first she thought it must be a walrus or hippopotamus"
export function walrusVignette() {
  return vignette('a walrus or hippopotamus', (g) => {
    const sea = new Path2D(); sea.rect(0, 250, 512, 120); hatch(g, sea, { angle: 0, gap: 8, seed: 431, alpha: 0.6 });
    const w = ellipse(160, 250, 110, 70); shape(g, w, 432);
    line(g, 5, [[110, 262], [104, 320]]); line(g, 5, [[134, 266], [130, 324]]); // tusks
    dot(g, 120, 230, 5);
    const h = ellipse(360, 255, 120, 60); shape(g, h, 433);
    const snout = ellipse(260, 245, 40, 32); shape(g, snout, 434);
    dot(g, 300, 222, 5); dot(g, 240, 240, 4);
  });
}
// "she sits purring so nicely by the fire, licking her paws and washing her face"
export function dinahFireVignette() {
  return vignette('purring so nicely by the fire', (g) => {
    const grate = new Path2D(); grate.rect(300, 150, 170, 170); fillPaper(g, grate); hatch(g, grate, { angle: 0.8, gap: 4, seed: 441 }); outline(g, grate, 3);
    g.strokeStyle = INK; for (let k = 0; k < 5; k++) line(g, 2, [[330 + k * 28, 300], [338 + k * 28, 230 - (k % 2) * 30]]); // flames, in ink
    const rug = new Path2D(); rug.rect(0, 320, 512, 50); hatch(g, rug, { angle: Math.PI / 2, gap: 6, seed: 442, alpha: 0.5 });
    cat(g, 190, 320, 1.4, 443);
  });
}
// "a little bright-eyed terrier … with oh, such long curly brown hair!" (brown: rule 4)
export function terrierVignette() {
  return vignette('a little bright-eyed terrier', (g) => {
    const dog = new Path2D();
    dog.moveTo(180, 320); dog.lineTo(190, 200); dog.quadraticCurveTo(200, 140, 240, 130); dog.lineTo(230, 90);
    dog.quadraticCurveTo(270, 70, 310, 100); dog.lineTo(330, 120); dog.quadraticCurveTo(300, 150, 290, 170);
    dog.quadraticCurveTo(320, 240, 310, 320); dog.closePath();
    g.fillStyle = SPOT.brown; g.fill(dog);
    g.save(); g.clip(dog); g.strokeStyle = INK; g.lineWidth = 1.4; // curls
    for (let x = 170; x < 340; x += 14) for (let y = 80; y < 330; y += 14) { g.beginPath(); g.arc(x + (y % 28 ? 7 : 0), y, 5, 0.3, Math.PI * 1.7); g.stroke(); }
    g.restore(); outline(g, dog, 3);
    g.fillStyle = PAPER; g.beginPath(); g.arc(272, 104, 7, 0, Math.PI * 2); g.fill(); dot(g, 273, 104, 4); // bright eye
    dot(g, 326, 120, 6);
    line(g, 4, [[200, 210], [160, 180]]); line(g, 4, [[205, 230], [165, 205]]); // paws up, begging
  });
}
