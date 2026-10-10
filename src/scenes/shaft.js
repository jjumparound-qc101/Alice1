// Scene 2: the fall, from "The rabbit-hole went straight on like a tunnel…" to "thump! thump!"
// Alice drifts down the middle of the shaft; the walls scroll upward past her.
import * as THREE from 'three';
import { paperFlat } from '../stage.js';
import { texture } from '../ink.js';
import { earth, dinahVignette, catsBatsVignette } from '../props.js';
import { thoughts } from '../thoughts.js';
import { smooth, lerp, cameraTrack } from '../track.js';

const FALL = 0.35; // metres per second the walls pass by ("she fell very slowly")
const WALL_W = 3.2, WALL_H = 9;

export const shaft = {
  id: 'shaft',
  title: 'Down the rabbit-hole',
  start: (cue) => cue.para('The rabbit-hole went straight on'),

  build({ group, ai, cue, shaftMeta }) {
    const at = cue.at;
    const start = shaft.start(cue);
    const T = {
      dipped: at('dipped'),
      jar: at('jar', 1), marmalade: at('marmalade'), putBack: at('cupboards', 2),
      dinah: at('Dinah', 1), cats: at('cats', 1), batsEatCats: at('cats', 4), thump: at('thump'),
    };
    // "Dinah'll miss me very much to-night", and "Do cats eat bats?"
    const think = thoughts(group, [
      { t0: T.dinah - 0.5, t1: T.cats - 0.4, art: dinahVignette() },
      { t0: T.cats - 0.4, t1: T.batsEatCats + 2, art: catsBatsVignette() },
    ]);

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

    // The ORANGE MARMALADE jar was lifted out of the wall art (tools/shaft_strip.py) so
    // the jar on the shelf and the jar in her hand are one sprite: same image, same size.
    const px = WALL_W / shaftMeta.width; // metres per strip pixel
    const J = shaftMeta.jar;
    const jar = paperFlat(ai.jar.tex, J.w * px, J.h * px, { anchor: 'center' });
    group.add(jar);
    const SHELF = { x: (J.cx / shaftMeta.width - 0.5) * WALL_W, z: -1.58 };
    const HAND = { x: 0.32, y: 0.55, z: -0.95 };
    const CUPBOARD = { x: -0.75, z: -1.58 };

    // Scroll the wall so the jar's shelf reaches her hand at the moment she takes it.
    const wallBottom = 1 - WALL_H / 2;
    const vJar = 1 - J.cy / shaftMeta.height;
    const offsetAtTake = vJar - ((HAND.y - wallBottom) / WALL_H) * (WALL_H / tileH);
    const wallY = (t, y0, t0) => y0 + FALL * (t - t0); // things on the wall rise with it

    function alice(t) {
      // Drops in from above when the tunnel "dipped suddenly down".
      const enter = smooth((t - T.dipped) / 2.5);
      const sway = Math.sin(t * 0.7) * 0.12;
      return {
        visible: t > T.dipped - 0.2, pose: 'stand', dir: 1,
        x: Math.sin(t * 0.31) * 0.15, z: -1.0, // close to the wall, so the jar in her hand looks the size it did on the shelf
        y: lerp(5, 0.15, enter) + Math.sin(t * 0.9) * 0.05,
        tilt: sway,
      };
    }

    function update(t) {
      // Walls scroll upward as she falls.
      strip.offset.y = offsetAtTake - (FALL * (t - T.jar)) / tileH;
      sideTex.offset.y = -(FALL * t) / (WALL_H / 3);
      // The jar: on a shelf rising toward her, in her hand, then put back on a shelf.
      // On its shelf, rising toward her; into her hand; then into a cupboard as she passes.
      const held = { x: HAND.x, y: HAND.y + Math.sin(t * 0.9) * 0.05, z: HAND.z };
      let p;
      if (t < T.jar) p = { ...SHELF, y: wallY(t, HAND.y, T.jar) };
      else if (t < T.putBack) {
        const k = smooth((t - T.jar) / 0.8);
        const from = { ...SHELF, y: wallY(t, HAND.y, T.jar) };
        p = { x: lerp(from.x, held.x, k), y: lerp(from.y, held.y, k), z: lerp(from.z, held.z, k) };
      } else {
        const k = smooth((t - T.putBack) / 0.8);
        const to = { ...CUPBOARD, y: wallY(t, HAND.y, T.putBack) };
        p = { x: lerp(held.x, to.x, k), y: lerp(held.y, to.y, k), z: lerp(held.z, to.z, k) };
      }
      jar.position.set(p.x, p.y, p.z);
      jar.visible = p.y < 6;
      think(t, { x: 0.78, y: 1.6, z: -0.9 }, 1.0);
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
