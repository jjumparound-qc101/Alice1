// The seashore (Chapters IX and X): sand, the sea to a far horizon, and the rock with the
// little ledge where the Mock Turtle sits. Built at foot-high Alice's scale.
import * as THREE from 'three';
import { paperFlat } from '../stage.js';
import { texture } from '../ink.js';
import { seaTile, sandTile, rockLedge, ROCK_PX, LEDGE } from '../props9.js';

export const ROCK = { x: 0.4, z: -0.7, w: 0.45, h: 0.45 * ROCK_PX.h / ROCK_PX.w };
export const LEDGE_AT = { x: ROCK.x + (LEDGE.u - 0.5) * ROCK.w + 0.06, y: (1 - LEDGE.v) * ROCK.h, z: ROCK.z + 0.02 };

export const SHORE_Z = -3;   // where the sand meets the sea
export function buildSeashore({ group, ai }) {
  const flat = (tex, w, d, z, y = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: tex })); m.rotation.x = -Math.PI / 2; m.position.set(0, y, z); group.add(m); };
  flat(texture(sandTile(), { repeat: [40, 12] }), 40, 12, SHORE_Z + 6);               // the sand, from the shore forward
  flat(texture(seaTile(), { repeat: [60, 30] }), 40, 20, SHORE_Z - 10, -0.002);        // the sea, out to the fog
  const sky = paperFlat(ai.sky.tex, 44, 44 / ai.sky.aspect, { edge: false, opaque: true });
  sky.position.set(0, -1.2, -16); group.add(sky);
  const rock = paperFlat(texture(rockLedge()), ROCK.w, ROCK.h); rock.position.set(ROCK.x, 0, ROCK.z); group.add(rock);
  // A few smaller rocks along the shore.
  const small = texture(rockLedge());
  for (const [x, z, s] of [[-2.2, -1.6, 0.5], [2.4, -2.2, 0.7], [-3.5, -3, 0.9], [1.6, -0.9, 0.25]]) { const r = paperFlat(small, ROCK.w * s, ROCK.h * s * 0.6); r.position.set(x, 0, z); r.scale.x = x > 0 ? -1 : 1; group.add(r); }
  return {};
}
