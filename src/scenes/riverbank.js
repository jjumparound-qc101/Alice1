// Scene 1: the riverbank, from "Alice was beginning…" to "…how in the world she was to get out again."
import { buildStage, paperFlat } from '../stage.js';
import { path, hop, cameraTrack } from '../track.js';
import { PAPER } from '../ink.js';

export const riverbank = {
  id: 'riverbank',
  title: 'The riverbank',
  start: () => 0,

  build({ group, ai, cue }) {
    const set = buildStage(group, ai);
    const at = cue.at;
    const T = {
      alice: at('Alice'), book: at('book'), so: at('So'), rabbit: at('Rabbit'),
      ranClose: at('ran', 1), watch: at('watch'), hurried: at('hurried'), started: at('started'),
      ranAcross: at('ran', 2), pop: at('pop'), downWent: at('down', 2),
    };

    const SIT = { x: -2.25, z: -2.05 };
    // "ran close by her": he stops nearer Alice than her sister sits (owner, 2026-10-14).
    const MID = { x: -1.45, z: -1.8 };
    const NEAR_HEDGE = { x: 1.6, z: -3.7 };
    const HOLE = { x: set.holePos.x, z: set.holePos.z + 0.08 };
    const WAIT = { x: NEAR_HEDGE.x - 0.4, z: NEAR_HEDGE.z + 0.2 };
    // In front of the hole's mouth, and just behind the hedge flat, where a figure is hidden.
    const MOUTH = { x: HOLE.x, z: HOLE.z + 0.35 };
    const INSIDE = { x: HOLE.x + 0.05, z: set.holePos.z - 0.35 };

    // Two clouds hung low behind the hedge, so the closer shots of the Rabbit, Alice and the hole
    // have sky with clouds too (owner, 2026-10-14; tools/bank_art.py).
    for (const [name, x, y, w] of [['cloud_a', 0.4, 3.6, 3.4], ['cloud_b', 3.5, 3.45, 2.1]]) {
      if (!ai[name]) continue;
      const c = paperFlat(ai[name].tex, w, w / ai[name].aspect, { edge: false });
      c.position.set(x, y, -10.2); group.add(c);
      c.traverse((m) => { if (m.material) m.material.fog = false; }); // the fog would wash them out
    }

    function rabbit(t) {
      const enter = T.rabbit - 0.4;
      if (t < enter) return { visible: false, pose: 'watch1', x: -9, z: -1.6 };
      let s;
      if (t < T.ranClose + 1.4) s = path(t, enter, T.ranClose + 1.4, { x: -8, z: -1.5 }, MID);
      else if (t < T.hurried) s = { ...MID, moving: false, dir: -1, idle: t }; // looking at his watch
      else if (t < T.hurried + 5) s = path(t, T.hurried, T.hurried + 5, MID, NEAR_HEDGE);
      else if (t < T.pop - 1.4) s = { ...NEAR_HEDGE, moving: false, dir: -1, idle: t }; // facing back toward Alice (no sudden turns)
      else if (t < T.pop - 0.2) s = path(t, T.pop - 1.4, T.pop - 0.2, NEAR_HEDGE, MOUTH);
      else s = hop(t, T.pop - 0.2, MOUTH, INSIDE, { dur: 0.5, peak: 0.25 }); // "pop down a large rabbit-hole"
      return { phase: t * 2.6, ...s, pose: s.moving ? 'trot1' : 'watch1' }; // the Chapter I sheet
    }

    function alice(t) {
      if (t < T.started) return { pose: 'sit', ...SIT, dir: 1 };
      // She gets up where she sat (no jump), and follows him all the way, steadily, catching
      // up with him at the hedge just as he pops down the hole.
      let s;
      if (t < T.started + 0.8) s = { ...SIT, moving: false, dir: 1 };
      else if (t < T.pop - 1.0) s = path(t, T.started + 0.8, T.pop - 1.0, SIT, WAIT);
      else if (t < T.downWent) s = { ...WAIT, moving: false, dir: 1 };
      else if (t < T.downWent + 1.3) s = path(t, T.downWent, T.downWent + 1.3, WAIT, MOUTH);
      else s = { ...hop(t, T.downWent + 1.3, MOUTH, INSIDE, { dur: 0.6, peak: 0.3, drop: 0.5 }), pose: 'jump' }; // "down went Alice after it"
      return { pose: 'stand', phase: t * 2.2, ...s };
    }

    const camera = cameraTrack([
      { t: 0, dur: 0, pos: [0, 2.0, 17.5], look: [0, 1.6, -3] },                     // from a seat in the stalls: the theatre, the toy stage, title and all
      { t: T.alice + 3, dur: 3.5, pos: [0, 1.9, 11.0], look: [0, 1.5, -3] },            // up the aisle, over the heads
      { t: T.alice + 5.5, dur: 6, pos: [-1.5, 1.15, 0.3], look: [-2.75, 0.45, -2.35] },
      { t: T.book - 1, dur: 3, pos: [-3.0, 1.05, 0.15], look: [-3.0, 0.5, -2.6] },   // her sister in the middle, Alice beside her, both whole
      { t: T.so, dur: 8, pos: [-1.7, 1.3, 1.4], look: [-2.6, 0.5, -2.35] },
      { t: T.rabbit - 2.5, dur: 2.5, pos: [-0.6, 1.25, 1.2], look: [-2.6, 0.4, -2.0] },
      { t: T.ranClose + 0.4, dur: 2.5, pos: [-1.2, 1.0, 0.5], look: [-1.85, 0.4, -1.95] },        // the Rabbit close by her
      { t: T.watch - 0.5, dur: 2.5, pos: [-1.35, 0.85, -0.3], look: [-1.75, 0.42, -1.95] },       // his watch, Alice beside him
      { t: T.hurried, dur: 4, pos: [-0.9, 1.3, 1.3], look: [-0.3, 0.45, -2.8] },                   // he hurries on; she starts up
      { t: T.ranAcross - 2, dur: 5, pos: [0.4, 1.15, 0.6], look: [1.1, 0.8, -3.5] },               // following him to the hedge
      { t: T.pop - 1.5, dur: 2, pos: [1.0, 1.0, 0.8], look: [HOLE.x, 0.85, HOLE.z] },     // the hole, with sky and clouds above the hedge
    ]);

    return {
      T,
      bg: PAPER,
      fog: [9, 34],
      bounds: set.bounds,
      hotspots: set.hotspots,
      camera,
      actors: (t) => ({ alice: alice(t), rabbit: rabbit(t), sister: { pose: 'read', x: -3.25, z: -2.6, dir: 1 } }),
    };
  },
};
