// Scene 1: the riverbank, from "Alice was beginning…" to "…how in the world she was to get out again."
import { buildStage } from '../stage.js';
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
    const MID = { x: 0.35, z: -1.75 };
    const NEAR_HEDGE = { x: 1.6, z: -3.7 };
    const HOLE = { x: set.holePos.x, z: set.holePos.z + 0.08 };
    const WAIT = { x: NEAR_HEDGE.x - 0.4, z: NEAR_HEDGE.z + 0.2 };
    // In front of the hole's mouth, and just behind the hedge flat, where a figure is hidden.
    const MOUTH = { x: HOLE.x, z: HOLE.z + 0.35 };
    const INSIDE = { x: HOLE.x + 0.05, z: set.holePos.z - 0.35 };

    // Standing still he fidgets: mostly facing Alice, now and then turning to look away.
    const fidget = (t) => (Math.floor(t / 2.3) % 3 === 2 ? 1 : -1);

    function rabbit(t) {
      const enter = T.rabbit - 0.4;
      if (t < enter) return { visible: false, pose: 'watch1', x: -9, z: -1.6 };
      let s;
      if (t < T.ranClose + 1.4) s = path(t, enter, T.ranClose + 1.4, { x: -8, z: -1.5 }, MID);
      else if (t < T.hurried) s = { ...MID, moving: false, dir: -1, idle: t }; // looking at his watch
      else if (t < T.hurried + 5) s = path(t, T.hurried, T.hurried + 5, MID, NEAR_HEDGE);
      else if (t < T.pop - 1.4) s = { ...NEAR_HEDGE, moving: false, dir: fidget(t), idle: t };
      else if (t < T.pop - 0.2) s = path(t, T.pop - 1.4, T.pop - 0.2, NEAR_HEDGE, MOUTH);
      else s = hop(t, T.pop - 0.2, MOUTH, INSIDE, { dur: 0.5, peak: 0.25 }); // "pop down a large rabbit-hole"
      return { phase: t * 2.6, ...s, pose: s.moving ? 'trot1' : 'watch1' }; // the Chapter I sheet
    }

    function alice(t) {
      if (t < T.started) return { pose: 'sit', ...SIT, dir: 1 };
      const stand = { x: SIT.x + 0.3, z: SIT.z + 0.1 };
      let s;
      if (t < T.ranAcross) s = { ...stand, moving: false, dir: 1 };
      else if (t < T.ranAcross + 4.5) s = path(t, T.ranAcross, T.ranAcross + 4.5, stand, WAIT);
      else if (t < T.downWent) s = { ...WAIT, moving: false, dir: 1 };
      else if (t < T.downWent + 0.9) s = path(t, T.downWent, T.downWent + 0.9, WAIT, MOUTH);
      else s = { ...hop(t, T.downWent + 0.9, MOUTH, INSIDE, { dur: 0.6, peak: 0.3, drop: 0.5 }), pose: 'jump' }; // "down went Alice after it"
      return { pose: 'stand', phase: t * 2.2, ...s };
    }

    const camera = cameraTrack([
      { t: 0, dur: 0, pos: [0, 2.0, 17.5], look: [0, 1.6, -3] },                     // the whole toy-theatre front, title and all
      { t: T.alice, dur: 6, pos: [-1.5, 1.15, 0.3], look: [-2.75, 0.45, -2.35] },
      { t: T.book - 1, dur: 3, pos: [-3.0, 1.05, 0.15], look: [-3.0, 0.5, -2.6] },   // her sister in the middle, Alice beside her, both whole
      { t: T.so, dur: 8, pos: [-1.7, 1.3, 1.4], look: [-2.6, 0.5, -2.35] },
      { t: T.rabbit - 2.5, dur: 2.5, pos: [-0.6, 1.25, 1.2], look: [-2.6, 0.4, -2.0] },
      { t: T.ranClose + 0.4, dur: 2.5, pos: [-0.7, 1.15, 0.6], look: [-0.4, 0.35, -2.0] },
      { t: T.watch - 0.5, dur: 2.5, pos: [0.1, 0.85, -0.45], look: [0.35, 0.45, -1.75] },
      { t: T.hurried, dur: 3, pos: [-0.7, 1.45, 1.8], look: [0.2, 0.45, -3.0] },
      { t: T.ranAcross, dur: 4, pos: [0.0, 1.3, 0.6], look: [1.4, 0.4, -3.6] },
      { t: T.pop - 1.5, dur: 2, pos: [1.15, 1.05, -1.5], look: [HOLE.x, 0.25, HOLE.z] },
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
