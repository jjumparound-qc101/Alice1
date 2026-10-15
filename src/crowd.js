// Extras: puppets that belong to one scene (a procession, a crowd, a jury) rather than to the
// shared cast. They live in the scene's group and are posed in its update(t, cast, camera).
import { Puppet } from '@engine/puppet.js';
import { texture } from '@engine/ink.js';

// A pose drawn in code, its texture made once and shared by every extra that wears it.
const made = new Map();
export function drawnPose(key, make, height) {
  if (!made.has(key)) { const c = make(); made.set(key, { tex: texture(c), aspect: c.width / c.height }); }
  return { ...made.get(key), height, facesLeft: true };
}

// list: [{ poses: { name: pose }, height }]. Returns the puppets and apply(states, camera),
// where states[i] is a Puppet state for list[i] (missing: hidden).
export function extras(group, list) {
  const puppets = list.map(({ poses, height }) => { const p = new Puppet(poses, height); group.add(p.root); return p; });
  return { puppets, apply: (states, camera) => puppets.forEach((p, i) => p.apply(states[i] ?? { visible: false }, camera)) };
}
