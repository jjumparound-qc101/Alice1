// Small helpers for staging as pure functions of time.

export const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
export const lerp = (a, b, k) => a + (b - a) * k;

// Move from a to b ({x, z}) over [t0, t1].
export function path(t, t0, t1, a, b) {
  const k = smooth((t - t0) / (t1 - t0));
  const len = Math.hypot(b.x - a.x, b.z - a.z);
  // dist: metres walked so far along this leg, so steps can match the ground covered.
  return { x: lerp(a.x, b.x, k), z: lerp(a.z, b.z, k), moving: t > t0 && t < t1, dir: Math.sign(b.x - a.x) || -1, dist: len * k };
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

// Alice in the picture at least every ~12 s (owner, 2026-10-13): within each [t0, t1] stretch where
// a scene's shots leave her out (tools/frame_report.mjs), every `every` seconds the camera eases out
// for `hold` seconds to take in both what it was looking at and Alice, then eases back.
// alice(t) -> { x, z, y?, scale? }; h: her full height in metres at scale 1.
export function withAlice(camera, alice, gaps, { every = 12, hold = 4.5, first = 5, h = 1.25, fov = 45 } = {}) {
  const tan = Math.tan((fov / 2) * Math.PI / 180);
  return (t) => {
    const c = camera(t);
    for (const [t0, t1] of gaps) {
      if (t < t0 || t > t1) continue;
      const since = t - t0 - first;
      if (since < 0) break;
      const p = since % every;
      if (p > hold || t0 + first + (since - p) + hold > t1 + 2) break;
      const k = smooth(p / 1.2) * (1 - smooth((p - hold + 1.2) / 1.2));
      const a = alice(t), s = a.scale ?? 1, ah = h * s;
      const A = [a.x, (a.y ?? 0) + ah * 0.6, a.z];
      const mid = [(c.look[0] + A[0]) / 2, (c.look[1] + A[1]) / 2, (c.look[2] + A[2]) / 2];
      let dir = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
      const d0 = Math.hypot(...dir); dir = dir.map((v) => v / d0);
      const sep = Math.hypot(c.look[0] - A[0], c.look[1] - A[1], c.look[2] - A[2]);
      const D = Math.max(d0, (sep * 0.9 + ah * 0.8) / tan);
      const pos = mid.map((m, i) => m - dir[i] * D);
      return { pos: c.pos.map((v, i) => lerp(v, pos[i], k)), look: c.look.map((v, i) => lerp(v, mid[i], k)) };
    }
    return c;
  };
}
