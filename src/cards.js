// The crowd card people (owner, 2026-10-14): one blank-faced body drawing per class (soldiers carry
// clubs, courtiers wear diamonds, the royal children are small, the officers of the court hold a
// bag), with the card's pips printed on its face here from four engraved suit signs, in the period
// layout (no corner numbers). Pips show only where the face is blank paper, so a hand, a collar or
// the officers' bag in front of the card hides them naturally. The guests are court cards, drawn
// whole. All drawings: tools/ch8_art.py.
import * as THREE from 'three';
import { PIP_LAYOUT } from './props8.js';

// The card face of each body drawing, as fractions of the image (tools/ch8_art.py face_rect; the
// officer's runs down behind his bag).
const BODIES = {
  clubs: { art: 'ch8/body_soldier', face: [0.18, 0.23, 0.796, 0.754] },
  diamonds: { art: 'ch8/body_courtier', face: [0.188, 0.232, 0.705, 0.686] },
  hearts: { art: 'ch8/body_child', face: [0.288, 0.281, 0.722, 0.719], small: true },
  spades: { art: 'ch8/body_officer', face: [0.287, 0.219, 0.852, 0.74] },
  // A soldier walking off, leading a prisoner away by the arm (Chapter IX, "in custody"; 2026-10-14).
  lead: { art: 'ch8/body_soldier_lead', face: [0.198, 0.249, 0.68, 0.749], sign: 'clubs', scale: 1426 / 1384 },
};
const SIGN = { hearts: 'ch8/suit_heart', diamonds: 'ch8/suit_diamond', clubs: 'ch8/suit_club', spades: 'ch8/suit_spade' };
const COURT = { king: 'king', queen: 'queen', knave: 'knave' };

const made = new Map();

// who: { suit, rank (1-10 | 'king' | 'queen' | 'knave'), body? ('lead') }. Returns a puppet pose { tex, aspect,
// height, facesLeft } at the given height (children are drawn at two thirds of it).
export function crowdCard(ai, who, height) {
  if (COURT[who.rank]) {
    const a = ai[`ch8/${who.rank}_${who.suit}`] ?? ai[`ch8/${who.rank}_stand`];
    return { ...a, height: height * 1.15, facesLeft: true };
  }
  const key = `${who.body ?? who.suit}-${who.rank}`;
  if (!made.has(key)) made.set(key, compose(ai, who));
  const b = BODIES[who.body ?? who.suit];
  return { ...made.get(key), height: (b.small ? height * 0.72 : height) * (b.scale ?? 1), facesLeft: true };
}

function compose(ai, who) {
  const B = BODIES[who.body ?? who.suit];
  const body = ai[B.art].tex.image, sign = ai[SIGN[B.sign ?? who.suit]].tex.image;
  const W = body.naturalWidth || body.width, H = body.naturalHeight || body.height;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.drawImage(body, 0, 0, W, H);
  // Blank paper on the face: where the pips may show.
  const [u0, v0, u1, v1] = B.face;
  const fx = u0 * W, fy = v0 * H, fw = (u1 - u0) * W, fh = (v1 - v0) * H;
  const base = g.getImageData(0, 0, W, H);
  // The pips, on their own layer.
  const p = document.createElement('canvas'); p.width = W; p.height = H;
  const q = p.getContext('2d');
  const count = Math.max(1, Math.min(10, who.rank));
  const size = fw * (count === 1 ? 0.42 : 0.2);
  const sh = size * (sign.naturalHeight || sign.height) / (sign.naturalWidth || sign.width);
  for (const [u, v] of PIP_LAYOUT[count]) {
    q.save(); q.translate(fx + u * fw, fy + v * fh); if (v > 0.5) q.rotate(Math.PI); // lower pips upside down, as on real cards
    q.drawImage(sign, -size / 2, -sh / 2, size, sh); q.restore();
  }
  const pip = q.getImageData(0, 0, W, H), d = base.data, s = pip.data;
  for (let i = 0; i < d.length; i += 4) {
    if (s[i + 3] < 8) continue;
    const blank = d[i + 3] > 200 && d[i] + d[i + 1] + d[i + 2] > 3 * 205; // paper, not ink
    if (!blank) continue;
    const a = s[i + 3] / 255;
    d[i] = d[i] * (1 - a) + s[i] * a; d[i + 1] = d[i + 1] * (1 - a) + s[i + 1] * a; d[i + 2] = d[i + 2] * (1 - a) + s[i + 2] * a;
  }
  g.putImageData(base, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  return { tex, aspect: W / H };
}
