// Thought vignettes: oval pictures of what Alice is imagining, shown while the narration speaks
// of them. (Owner, 2026-10-14) They are drawn flat over the picture, not inside the 3D scene, so:
// every bubble is the same oval shape, its picture fills the oval evenly and is never cut off by
// the edge of the screen, it is large enough to read, and it never covers Alice (it is placed in
// the free space beside her, with a trail of small bubbles toward her head).
import { smooth } from './track.js';

const ALL = new Set(); // every thought card: { el, trail, open, place }
let layer = null;

function ensureLayer() {
  if (layer) return layer;
  layer = document.createElement('div');
  layer.id = 'thoughts';
  document.body.appendChild(layer);
  return layer;
}

// The picture as an image URL: an AI drawing's texture (its <img>), or a canvas drawn in code.
function source(art) {
  const img = art.isTexture ? art.image : art;
  if (img instanceof HTMLCanvasElement) return img.toDataURL();
  if (img?.src) return img.src;
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  c.getContext('2d').drawImage(img, 0, 0); return c.toDataURL();
}

// list: [{ t0, t1, art (a canvas from props.js, or an AI drawing's texture) }].
// Returns update(t): scenes call it every frame (extra arguments from older scenes are ignored).
export function thoughts(group, list) {
  ensureLayer();
  const cards = list.map(({ t0, t1, art }) => {
    const el = document.createElement('div');
    el.className = 'thought';
    const img = document.createElement('img'); img.src = source(art); img.alt = ''; el.appendChild(img);
    const trail = [0, 1, 2].map(() => { const b = document.createElement('div'); b.className = 'thought-dot'; layer.appendChild(b); return b; });
    layer.appendChild(el);
    const card = { el, trail, open: 0, place: null, group };
    ALL.add(card);
    return { t0, t1, card };
  });
  return (t) => {
    for (const { t0, t1, card } of cards) card.open = smooth((t - t0) / 0.35) * (1 - smooth((t - t1 + 0.35) / 0.35));
  };
}

const overlap = (a, b, m = 0) => a.x < b.x + b.w + m && b.x < a.x + a.w + m && a.y < b.y + b.h + m && b.y < a.y + a.h + m;

// Called once a frame after the scene is posed. view: the free picture area in CSS pixels
// ({x, y, w, h}: the screen less the text strip and controls); alice: her box on screen, or null.
export function layoutThoughts(view, alice) {
  if (!layer) return;
  const open = [...ALL].filter((c) => c.open > 0.01 && c.group.visible !== false && isShown(c.group));
  for (const c of ALL) if (!open.includes(c)) { c.el.style.display = 'none'; c.trail.forEach((d) => (d.style.display = 'none')); c.place = null; }
  const taken = alice ? [alice] : [];
  for (const c of open) {
    // As large as reads well: up to 40% of the picture's width (more on narrow phones), the
    // picture's shape kept (1024 x 720).
    const narrow = view.w < 600;
    let w = Math.min(view.w * (narrow ? 0.62 : 0.4), 420, view.h * (narrow ? 0.72 : 0.5) * (1024 / 720));
    let spot = null;
    for (let tries = 0; tries < 4 && !spot; tries++, w *= 0.85) spot = findSpot(view, w, w * 720 / 1024, taken, alice);
    if (!spot) { w = Math.min(view.w * 0.3, 260); spot = { x: view.x + 8, y: view.y + 8, w, h: w * 720 / 1024 }; }
    // Ease toward the spot, so a moving Alice doesn't make the bubble jump.
    c.place = c.place ? { x: c.place.x + (spot.x - c.place.x) * 0.15, y: c.place.y + (spot.y - c.place.y) * 0.15, w: spot.w, h: spot.h } : spot;
    taken.push(c.place);
    const p = c.place, k = c.open;
    Object.assign(c.el.style, { display: 'block', left: `${p.x}px`, top: `${p.y}px`, width: `${p.w}px`, height: `${p.h}px`,
      transform: `scale(${0.6 + 0.4 * k})`, opacity: k });
    // The trail of little bubbles from the oval toward her head.
    const head = alice ? { x: alice.x + alice.w / 2, y: alice.y + alice.h * 0.12 } : null;
    c.trail.forEach((d, i) => {
      if (!head) { d.style.display = 'none'; return; }
      const from = { x: p.x + p.w / 2, y: p.y + p.h / 2 };
      // From the oval's edge toward her head, stopping short of her.
      const dx = head.x - from.x, dy = head.y - from.y, L = Math.hypot(dx, dy) || 1;
      const edge = Math.min(p.w, p.h) * 0.5, gap = Math.max(0, L - edge - 14);
      const f = (edge + gap * (0.2 + i * 0.25)) / L, r = [14, 10, 6][i];
      Object.assign(d.style, { display: 'block', left: `${from.x + dx * f - r}px`, top: `${from.y + dy * f - r}px`, width: `${2 * r}px`, height: `${2 * r}px`, opacity: k });
    });
  }
}

const isShown = (g) => { for (let o = g; o; o = o.parent) if (!o.visible) return false; return true; };

// Candidate places beside Alice: either side of her head, then above, then the picture's top
// corners. The first that fits in the picture and covers neither her nor another thought wins.
function findSpot(view, w, h, taken, alice) {
  const m = 10, cands = [];
  if (alice) {
    const cy = alice.y + alice.h * 0.15 - h * 0.6;
    const prefer = alice.x + alice.w / 2 > view.x + view.w / 2 ? -1 : 1; // the side with more room first
    for (const s of [prefer, -prefer]) cands.push({ x: s > 0 ? alice.x + alice.w + 24 : alice.x - 24 - w, y: cy });
    cands.push({ x: alice.x + alice.w / 2 - w / 2, y: alice.y - h - 30 });
    for (const s of [prefer, -prefer]) cands.push({ x: s > 0 ? alice.x + alice.w + 24 : alice.x - 24 - w, y: alice.y + alice.h * 0.5 - h / 2 });
  }
  cands.push({ x: view.x + view.w - w - m, y: view.y + m }, { x: view.x + m, y: view.y + m });
  for (const c0 of cands) {
    const c = { x: Math.min(Math.max(c0.x, view.x + m), view.x + view.w - w - m), y: Math.min(Math.max(c0.y, view.y + m), view.y + view.h - h - m), w, h };
    if (c.x < view.x || c.y < view.y || c.x + w > view.x + view.w || c.y + h > view.y + view.h) continue;
    if (taken.some((b) => overlap(c, b, 12))) continue;
    return c;
  }
  return null;
}
