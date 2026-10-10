// Scene 2: the fall, from "The rabbit-hole went straight on like a tunnel…" to "thump! thump!"
// Alice drifts down the middle of the shaft; the walls scroll upward past her.
import * as THREE from 'three';
import { paperFlat } from '../stage.js';
import { texture } from '../ink.js';
import { earth, marmaladeJar } from '../props.js';
import { smooth, lerp, cameraTrack } from '../track.js';

const FALL = 0.35; // metres per second the walls pass by ("she fell very slowly")
const WALL_W = 3.2, WALL_H = 9;

export const shaft = {
  id: 'shaft',
  title: 'Down the rabbit-hole',
  start: (cue) => cue.para('The rabbit-hole went straight on'),

  build({ group, ai, cue }) {
    const at = cue.at;
    const start = shaft.start(cue);
    const T = {
      dipped: at('dipped'),
      jar: at('jar', 1), marmalade: at('marmalade'), putBack: at('cupboards', 2),
      thump: at('thump'),
    };

    // Back wall: the shelves, maps and cupboards from the AI master drawings.
    const strip = ai.shaft_strip.tex;
    strip.wrapS = THREE.ClampToEdgeWrapping;
    strip.wrapT = THREE.RepeatWrapping;
    const tileH = WALL_W / ai.shaft_strip.aspect;
    strip.repeat.set(1, WALL_H / tileH);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(WALL_W, WALL_H), new THREE.MeshBasicMaterial({ map: strip }));
    back.position.set(0, 1, -1.6);
    group.add(back);

    // Side walls: dark earth.
    const sideTex = texture(earth(3, 0.85), { repeat: [1, 3] });
    for (const s of [-1, 1]) {
      const side = new THREE.Mesh(new THREE.PlaneGeometry(4, WALL_H), new THREE.MeshBasicMaterial({ map: sideTex, color: '#6d6558', side: THREE.DoubleSide }));
      side.rotation.y = s * Math.PI / 2;
      side.position.set(s * WALL_W / 2, 1, 0.4);
      group.add(side);
    }

    const jar = paperFlat(texture(marmaladeJar(true)), 0.22, 0.26);
    group.add(jar);

    // The wall moves up FALL m/s; things fixed to it move with it.
    const wallY = (t, y0, t0) => y0 + FALL * (t - t0);
    const HAND = { x: 0.32, y: 0.55, z: -0.35 };

    function alice(t) {
      // Drops in from above when the tunnel "dipped suddenly down".
      const enter = smooth((t - T.dipped) / 2.5);
      const sway = Math.sin(t * 0.7) * 0.12;
      return {
        visible: t > T.dipped - 0.2, pose: 'stand', dir: 1,
        x: Math.sin(t * 0.31) * 0.15, z: -0.4,
        y: lerp(5, 0.15, enter) + Math.sin(t * 0.9) * 0.05,
        tilt: sway,
      };
    }

    function update(t) {
      // Walls scroll upward as she falls.
      strip.offset.y = -(FALL * t) / tileH;
      sideTex.offset.y = -(FALL * t) / (WALL_H / 3);
      // The jar: on a shelf rising toward her, in her hand, then put back on a shelf.
      jar.visible = t > T.jar - 6 && t < T.putBack + 12;
      if (t < T.jar) jar.position.set(-0.9, wallY(t, HAND.y, T.jar), -1.55);
      else if (t < T.putBack) jar.position.set(HAND.x, HAND.y + Math.sin(t * 0.9) * 0.05, HAND.z);
      else jar.position.set(0.9, wallY(t, HAND.y, T.putBack), -1.55);
    }

    const camera = cameraTrack([
      { t: start, dur: 0, pos: [0, 2.2, 2.4], look: [0, 3.5, -1.5] },          // looking up the dark tunnel
      { t: T.dipped, dur: 3, pos: [0, 1.1, 2.4], look: [0, 0.7, -1.2] },       // she falls into view
      { t: T.jar - 3, dur: 3, pos: [0.4, 0.9, 1.3], look: [0, 0.6, -1.2] },    // the jar
      { t: T.putBack + 3, dur: 6, pos: [0, 1.2, 2.6], look: [0, 0.7, -1.2] },
      { t: T.thump - 4, dur: 4, pos: [0, 0.4, 2.0], look: [0, -1.5, -1] },     // looking down as the ground comes
    ]);

    return {
      T, bg: '#1a1712', fog: [3.5, 14],
      bounds: null, hotspots: [], // no walking about mid-fall
      camera, update,
      actors: (t) => ({ alice: alice(t) }),
    };
  },
};
