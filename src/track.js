// Small helpers for staging as pure functions of time.

export const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
export const lerp = (a, b, k) => a + (b - a) * k;

// Move from a to b ({x, z}) over [t0, t1].
export function path(t, t0, t1, a, b) {
  const k = smooth((t - t0) / (t1 - t0));
  const speed = Math.hypot(b.x - a.x, b.z - a.z) / (t1 - t0); // average, metres per second
  return { x: lerp(a.x, b.x, k), z: lerp(a.z, b.z, k), moving: t > t0 && t < t1, dir: Math.sign(b.x - a.x) || -1, speed };
}

// A route through waypoints: [[t, {x, z}], ...]. Holds still between legs whose
// positions match; walks between legs that differ.
export function route(t, points, extra = {}) {
  if (t <= points[0][0]) return { ...points[0][1], moving: false, dir: points[0][1].dir ?? 1, ...extra };
  for (let i = 1; i < points.length; i++) {
    const [t1, b] = points[i];
    if (t < t1) {
      const [t0, a] = points[i - 1];
      const same = a.x === b.x && a.z === b.z;
      const s = same ? { x: a.x, z: a.z, moving: false, dir: a.dir ?? b.dir ?? 1 } : path(t, t0, t1, a, b);
      if (!same && b.dir) s.dir = b.dir;
      return { ...s, ...extra };
    }
  }
  const last = points[points.length - 1][1];
  return { ...last, moving: false, dir: last.dir ?? 1, ...extra };
}

// A stepped value: [[t, value], ...] -> the value of the last key at or before t.
export function step(t, keys) {
  let v = keys[0][1];
  for (const [k, val] of keys) if (t >= k) v = val;
  return v;
}

// Camera keys: { t, dur, pos: [x,y,z], look: [x,y,z] }. From the previous pose,
// ease to each key over `dur` seconds starting at t.
export function cameraTrack(keys) {
  return (t) => {
    const pos = [...keys[0].pos], look = [...keys[0].look];
    for (const k of keys.slice(1)) {
      if (t < k.t) break;
      const e = smooth((t - k.t) / k.dur);
      for (let i = 0; i < 3; i++) { pos[i] = lerp(pos[i], k.pos[i], e); look[i] = lerp(look[i], k.look[i], e); }
    }
    return { pos, look };
  };
}

// A hop from a to b ({x, z}) starting at t0: an arc up (peak, metres) and forward, then a
// quick drop as the figure shrinks away into a hole. Puts b behind the hole's edge to vanish.
export function hop(t, t0, a, b, { dur = 0.5, peak = 0.25, drop = 0.3, shrink = 0.3 } = {}) {
  const k = Math.min(1, Math.max(0, (t - t0) / dur));
  return {
    x: lerp(a.x, b.x, k), z: lerp(a.z, b.z, k),
    y: 4 * peak * k * (1 - k) - drop * k * k * k,
    scale: 1 - shrink * k * k,
    moving: false, dir: Math.sign(b.x - a.x) || 1, visible: k < 1,
  };
}
