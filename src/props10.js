// Placeholder art for Chapter X, "The Lobster Quadrille": the thought vignettes, drawn in code
// until the AI drawings arrive (docs/CHAPTER_10_ASSETS.md). The Mock Turtle and the Gryphon
// are Chapter IX's (props9.js). Colours (COLOR.md rule 6, words in the poems and songs): the
// Lobster "baked … too brown", and the soup "so rich and green".
import { hatch, outline, fillPaper, shadeEdge, INK, PAPER } from './ink.js';
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

export function lobstersSeaVignette() {
  return vignette('throw the lobsters as far out to sea as you can', (g) => {
    sea(g, 200, 2111);
    lobster(g, 150, 110, 0.6, null, 2112); lobster(g, 300, 80, 0.5, null, 2113); lobster(g, 420, 140, 0.45, null, 2114);
    for (const x of [130, 260, 380]) { const head = ellipse(x, 240, 18, 14); fillPaper(g, head); outline(g, head, 2); line(g, 2, [[x - 24, 250], [x + 24, 250]]); } // swimming after them
  });
}
export function whitingSnailVignette() {
  return vignette('"Will you walk a little faster?" said a whiting to a snail', (g) => {
    const shingle = rect(0, 270, 512, 90); hatch(g, shingle, { angle: 0.3, gap: 6, seed: 2121, alpha: 0.4 }); for (let k = 0; k < 20; k++) { const p = ellipse((k * 53) % 512, 280 + (k * 17) % 60, 10, 6); fillPaper(g, p); outline(g, p, 1.2); }
    fish(g, 250, 220, 1, 2122);
    const shell = ellipse(130, 245, 28, 26); fillPaper(g, shell); outline(g, shell, 2.5); g.lineWidth = 2; g.beginPath(); g.arc(130, 245, 14, 0, Math.PI * 1.6); g.stroke();
    line(g, 3, [[105, 268], [70, 268], [64, 250]]); line(g, 1.5, [[66, 252], [56, 236]]);
    const por = ellipse(400, 190, 80, 30, -0.1); fillPaper(g, por); shadeEdge(g, por, { size: 60, dx: 0, dy: 0.4, angle: 0.3, gap: 4, seed: 2123 }); outline(g, por, 2.5); dot(g, 340, 182, 3);
    line(g, 3, [[330, 214], [318, 226]]); // treading on the whiting's tail
  });
}
export function whitingsVignette() {
  return vignette('they have their tails in their mouths', (g) => {
    const plate = ellipse(256, 230, 200, 70); fillPaper(g, plate); outline(g, plate, 3); outline(g, ellipse(256, 230, 170, 56), 1.5);
    fish(g, 190, 210, 1, 2131, true); fish(g, 320, 220, 1, 2132, true);
  });
}
// "You have baked me too brown, I must sugar my hair": the Lobster at his glass, brown.
export function lobsterGlassVignette() {
  return vignette("'Tis the voice of the Lobster", (g) => {
    const glass = ellipse(150, 170, 60, 80); fillPaper(g, glass); hatch(g, glass, { angle: 1.0, gap: 9, seed: 2141, alpha: 0.3 }); outline(g, glass, 4);
    line(g, 4, [[150, 250], [150, 320]]); line(g, 4, [[110, 320], [190, 320]]);
    // Standing upright like Tenniel's, facing the glass.
    g.save(); g.translate(320, 200); g.rotate(-Math.PI / 2 + 0.15); lobster(g, 0, 0, 0.9, SPOT.brown, 2142); g.restore();
    for (let k = 0; k < 6; k++) dot(g, 300 + (k * 13) % 40, 60 + (k * 7) % 20, 2.5); // sugar for his hair
  });
}
export function owlPantherVignette() {
  return vignette('the Owl and the Panther were sharing a pie', (g) => {
    const table = rect(120, 250, 280, 20); fillPaper(g, table); hatch(g, table, { gap: 4, seed: 2151 }); outline(g, table, 3);
    const pie = ellipse(260, 240, 50, 16); fillPaper(g, pie); hatch(g, pie, { angle: 0.8, gap: 6, seed: 2152 }); outline(g, pie, 2.5);
    const owl = ellipse(160, 200, 32, 44); fillPaper(g, owl); hatch(g, owl, { angle: 1.2, gap: 5, seed: 2153, alpha: 0.4 }); outline(g, owl, 2.5);
    for (const x of [148, 172]) { const e = ellipse(x, 186, 10, 10); fillPaper(g, e); outline(g, e, 2); dot(g, x, 186, 4); }
    const pan = ellipse(370, 200, 50, 46); fillPaper(g, pan); for (let k = 0; k < 14; k++) dot(g, 340 + (k * 23) % 60, 175 + (k * 17) % 50, 4); outline(g, pan, 2.5);
    const ph = ellipse(340, 150, 30, 26); fillPaper(g, ph); outline(g, ph, 2.5); dot(g, 330, 146, 3);
    for (const s of [-1, 1]) { const ear = ellipse(340 + s * 18, 126, 8, 10); fillPaper(g, ear); outline(g, ear, 2); }
  });
}
// "Beautiful Soup, so rich and green, Waiting in a hot tureen!"
export function soupVignette() {
  return vignette('Beautiful Soup, so rich and green', (g) => {
    const tureen = new Path2D(); tureen.moveTo(140, 180); tureen.quadraticCurveTo(150, 320, 256, 320); tureen.quadraticCurveTo(362, 320, 372, 180); tureen.closePath();
    fillPaper(g, tureen); shadeEdge(g, tureen, { size: 120, dx: 0.2, dy: 0.1, angle: 0.6, gap: 4, seed: 2161 }); outline(g, tureen, 4);
    const soup = ellipse(256, 180, 116, 26); g.fillStyle = SPOT.soup; g.fill(soup); hatch(g, soup, { angle: 0.1, gap: 5, seed: 2162, alpha: 0.25 }); outline(g, soup, 3);
    for (const s of [-1, 1]) { g.lineWidth = 6; g.beginPath(); g.arc(256 + s * 130, 220, 20, s < 0 ? Math.PI * 0.5 : -Math.PI * 0.5, s < 0 ? Math.PI * 1.5 : Math.PI * 0.5); g.stroke(); }
    line(g, 5, [[300, 186], [360, 90]]); // the ladle
    for (const x of [210, 256, 300]) { g.lineWidth = 2; g.beginPath(); g.moveTo(x, 150); g.bezierCurveTo(x - 14, 120, x + 14, 100, x, 70); g.stroke(); } // hot
  });
}
