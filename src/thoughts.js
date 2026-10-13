// Thought vignettes: oval pictures of what Alice is imagining, shown beside her
// while the narration speaks of it. Each pops open and closes like a paper card.
import { paperFlat } from './stage.js';
import { texture } from './ink.js';
import * as THREE from 'three';
import { smooth } from './track.js';

// Every thought card, so keepThoughtsInView can find the open ones after a scene has placed them.
const ALL = new Set();

// list: [{ t0, t1, art (a canvas from props.js, or an AI drawing's texture) }]. Returns update(t, pos, size).
export function thoughts(group, list) {
  const cards = list.map(({ t0, t1, art }) => {
    const card = paperFlat(art.isTexture ? art : texture(art), 1.0, 0.7, { anchor: 'center' });
    card.visible = false;
    group.add(card);
    ALL.add(card);
    return { t0, t1, card };
  });
  // pos: { x, y, z } where the card's centre goes; size: its width in metres.
  return (t, pos, size = 1) => {
    for (const { t0, t1, card } of cards) {
      const open = smooth((t - t0) / 0.35) * (1 - smooth((t - t1 + 0.35) / 0.35));
      card.visible = open > 0.01;
      if (!card.visible) continue;
      card.position.set(pos.x, pos.y, pos.z);
      card.scale.setScalar(size * open);
    }
  };
}

// A thought must stay in the picture (owner, 2026-10-13): after the scene has placed its cards,
// any open card that pokes out of the camera's view (or under the text strip) is slid back in,
// and shrunk if it is too big to fit. Cards are flat to the world, so this works in view space.
const v = new THREE.Vector3();
export function keepThoughtsInView(camera) {
  camera.updateMatrixWorld();
  const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  for (const card of ALL) {
    if (!card.visible || !card.parent?.visible) continue;
    card.getWorldPosition(v).applyMatrix4(camera.matrixWorldInverse);
    const d = -v.z;
    if (d < camera.near * 4) continue; // behind or at the camera: leave it
    const hy = d * tanV, hx = hy * camera.aspect;
    // The view, less a margin, and less the text strip along the bottom (about a third).
    const minX = -hx * 0.94, maxX = hx * 0.94, minY = -hy * 0.3, maxY = hy * 0.94;
    let s = card.scale.x;
    const fit = Math.min((maxX - minX) / 1.0, (maxY - minY) / 0.7) * 0.9;
    if (s > fit) { s = fit; card.scale.setScalar(s); }
    const halfW = 0.5 * s, halfH = 0.35 * s;
    v.x = THREE.MathUtils.clamp(v.x, minX + halfW, maxX - halfW);
    v.y = THREE.MathUtils.clamp(v.y, minY + halfH, maxY - halfH);
    v.applyMatrix4(camera.matrixWorld);
    card.parent.worldToLocal(v);
    card.position.copy(v);
  }
}
