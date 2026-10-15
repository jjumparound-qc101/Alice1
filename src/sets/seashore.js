// The seashore (Chapters IX and X): sand, the sea to a far horizon, the little waves at the water's
// edge, and the tall rock with the little ledge where the Mock Turtle sits. Built at foot-high
// Alice's scale. AI drawings after Tenniel's plates 9.3 and 10.1 (2026-10-15, tools/seashore_art.py).
import * as THREE from 'three';
import { paperFlat } from '../stage.js';
import { panorama } from './panorama.js';

// The rock (rock_ledge, 993 x 1474): the ledge's top at LEDGE (fractions from the drawing's top left),
// a quarter of the rock's height up, so the rock is a metre high.
const LEDGE = { u: 0.58, v: 0.75 };
export const ROCK = { x: 0.4, z: -0.7, w: 1.0 * 993 / 1474, h: 1.0 };
export const LEDGE_AT = { x: ROCK.x + (LEDGE.u - 0.5) * ROCK.w + 0.06, y: (1 - LEDGE.v) * ROCK.h, z: ROCK.z + 0.02 };

export const SHORE_Z = -3;   // where the sand meets the sea
const HORIZON = 0.35;        // the far sea's horizon, about a camera's height
const tile = (ai, name, rx, ry, mirror = false) => {
  const t = ai[name].tex.clone(); t.wrapS = mirror ? THREE.MirroredRepeatWrapping : THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry); t.anisotropy = 8; t.needsUpdate = true; return t;
};
export function buildSeashore({ group, ai }) {
  const flat = (tex, w, d, z, y = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: tex })); m.rotation.x = -Math.PI / 2; m.position.set(0, y, z); group.add(m); };
  flat(tile(ai, 'ch9/sand', 40 / 0.8, 24 / 0.8), 40, 24, SHORE_Z + 12);                 // the sand (0.8 m a tile), from the shore forward
  flat(tile(ai, 'ch9/sea_tile', 40 / 1.5, 13 / 1.5), 40, 13, SHORE_Z - 6.5, -0.002);    // the sea's surface, out to the far sea
  const sky = paperFlat(ai.sky.tex, 44, 44 / ai.sky.aspect, { edge: false, opaque: true });
  sky.position.set(0, -1.2, -16.2); group.add(sky);
  // The far sea, up to its horizon, along the whole width; and the little waves at the water's edge.
  const SEA = ai['ch9/seashore'];
  const far = paperFlat(tile(ai, 'ch9/seashore', 44 / (HORIZON * SEA.aspect), 1, true), 44, HORIZON, { edge: false, opaque: true });
  far.position.set(0, 0, SHORE_Z - 13); group.add(far);
  const SURF = ai['ch9/surf'], SURF_H = 0.18, SURF_W = SURF_H * SURF.aspect * 2;    // stretched along the shore
  const surf = paperFlat(tile(ai, 'ch9/surf', 40 / SURF_W, 1, true), 40, SURF_H, { edge: false, opaque: true });
  surf.position.set(0, 0, SHORE_Z); group.add(surf);
  panorama(group, ai, { x: 16, z0: -16, z1: 20, trees: false });
  const R = ai['ch9/rock_ledge'];
  const rock = paperFlat(R.tex, ROCK.w, ROCK.h); rock.position.set(ROCK.x, 0, ROCK.z); group.add(rock);
  // A few smaller rocks along the shore (the same rock, smaller and squatter).
  for (const [x, z, s] of [[-2.2, -1.6, 0.35], [2.4, -2.2, 0.45], [-3.5, -2.7, 0.6], [1.6, -0.9, 0.18]]) {
    const r = paperFlat(R.tex, ROCK.w * s, ROCK.h * s * 0.6); r.position.set(x, 0, z); r.scale.x = x > 0 ? -1 : 1; group.add(r);
  }
  return {};
}
