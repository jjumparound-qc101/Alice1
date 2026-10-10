// Scene 1: the riverbank, from "Alice was beginning…" to "…how in the world she was to get out again."
import { buildStage } from '../stage.js';
import { smooth, path, cameraTrack } from '../track.js';
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

    function rabbit(t) {
      const enter = T.rabbit - 0.4;
      if (t < enter) return { visible: false, pose: 'watch', x: -9, z: -1.6 };
      let s;
      if (t < T.ranClose + 1.4) s = path(t, enter, T.ranClose + 1.4, { x: -8, z: -1.5 }, MID);
      else if (t < T.hurried) s = { ...MID, moving: false, dir: -1 };
      else if (t < T.hurried + 5) s = path(t, T.hurried, T.hurried + 5, MID, NEAR_HEDGE);
      else if (t < T.pop - 1.4) s = { ...NEAR_HEDGE, moving: false, dir: -1 };
      else s = path(t, T.pop - 1.4, T.pop, NEAR_HEDGE, HOLE);
      const sink = smooth((t - T.pop) / 0.6);
      return { ...s, pose: 'watch', phase: t * 2.6, sink, visible: sink < 1 };
    }

    function alice(t) {
      if (t < T.started) return { pose: 'sit', ...SIT, dir: 1 };
      const stand = { x: SIT.x + 0.3, z: SIT.z + 0.1 };
      let s;
      if (t < T.ranAcross) s = { ...stand, moving: false, dir: 1 };
      else if (t < T.ranAcross + 4.5) s = path(t, T.ranAcross, T.ranAcross + 4.5, stand, WAIT);
      else if (t < T.downWent) s = { ...WAIT, moving: false, dir: 1 };
      else s = path(t, T.downWent, T.downWent + 0.9, WAIT, HOLE);
      const sink = smooth((t - T.downWent - 0.9) / 0.7);
      return { ...s, pose: 'stand', phase: t * 2.2, sink, visible: sink < 1 };
    }

    const camera = cameraTrack([
      { t: 0, dur: 0, pos: [0, 2.1, 9.2], look: [0, 1.4, -3] },
      { t: T.alice, dur: 6, pos: [-1.5, 1.15, 0.3], look: [-2.75, 0.45, -2.35] },
      { t: T.book - 1, dur: 3, pos: [-3.05, 1.0, -0.8], look: [-3.3, 0.45, -2.6] },
      { t: T.so, dur: 8, pos: [-1.1, 1.35, 1.0], look: [-2.5, 0.5, -2.4] },
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
