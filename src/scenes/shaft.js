// Scene 2: the fall, from "The rabbit-hole went straight on like a tunnel…" to "thump! thump!"
// Alice drifts down the middle of the shaft; the walls scroll upward past her.
import * as THREE from 'three';
import { paperFlat } from '@engine/stage.js';
import { thoughts } from '@engine/thoughts.js';
import { smooth, lerp, cameraTrack } from '@engine/track.js';

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
      { t0: at('brave') - 1.5, t1: at('true') + 1, art: ai['vignettes/stairs'].tex },          // "How brave they'll all think me at home!"
      { t0: at('thousand') - 1.5, t1: at('longitude', 2) + 2, art: ai['vignettes/globe'].tex }, // "four thousand miles down … Latitude or Longitude"
      { t0: at('downward') - 1, t1: at('somewhere', 1, at('downward')) + 1.5, art: ai['vignettes/antipodes'].tex }, // "the people that walk with their heads downward" (2026-10-15)
      { t0: T.dinah - 0.5, t1: at('wish') - 0.3, art: ai['vignettes/dinah'].tex },     // AI drawings (tools/ch1_art.py)
      { t0: at('wish') - 0.3, t1: T.cats - 0.4, art: ai['vignettes/dinah_down'].tex }, // "I wish you were down here with me!" (2026-10-15)
      { t0: T.cats - 0.4, t1: T.batsEatCats + 2, art: ai['vignettes/bats'].tex },
      { t0: at('dream') - 1, t1: T.thump - 0.3, art: ai['vignettes/dream'].tex },      // "walking hand in hand with Dinah" (2026-10-15)
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

    // Side walls: earth, roots, a shelf or a map now and then (AI drawing, tools/walls.py),
    // repeating top to bottom and scrolling up with the back wall.
    const sideTex = ai['walls/shaft_side'].tex;
    sideTex.wrapS = sideTex.wrapT = THREE.RepeatWrapping;
    const SIDE_TILE = 4 / ai['walls/shaft_side'].aspect; // one drawing spans the wall's 4 m width
    sideTex.repeat.set(1, WALL_H / SIDE_TILE);
    for (const s of [-1, 1]) {
      const side = new THREE.Mesh(new THREE.PlaneGeometry(4, WALL_H), new THREE.MeshBasicMaterial({ map: sideTex, color: '#b8b0a2', side: THREE.DoubleSide }));
      side.rotation.y = s * Math.PI / 2;
      side.position.set(s * WALL_W / 2, 1, 0.4);
      group.add(side);
    }

    // The ORANGE MARMALADE jar was lifted out of the wall art (tools/shaft_strip.py) so
    // the jar on the shelf and the jar in her hand are one sprite: same image, same size.
    const px = WALL_W / shaftMeta.width; // metres per strip pixel
    const J = shaftMeta.jar;
    // Coloured: orange label, clear glass, a smear left in the bottom (tools/jar_colour.py; COLOR.md).
    const jar = paperFlat(ai.jar_orange.tex, J.w * px, J.h * px, { anchor: 'center' });
    group.add(jar);
    const SHELF = { x: (J.cx / shaftMeta.width - 0.5) * WALL_W, z: -1.58 };
    const HAND = { x: 0.32, y: 0.55, z: -0.95 };
    // The open cupboard on the left of the wall drawing (strip pixels; the next time it comes
    // round, one strip height below the jar's shelf): she puts the jar inside it as she passes.
    const CUP = { px: 300, py: 765 + shaftMeta.height };
    const CUPBOARD = { x: (CUP.px / shaftMeta.width - 0.5) * WALL_W, z: -1.56 };
    const cupY = (t) => HAND.y + (J.cy - CUP.py) * px + FALL * (t - T.jar);   // rises with the wall
    const T_PUT = T.jar + ((CUP.py - J.cy) * px) / FALL;                       // when it reaches her hand

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
        visible: t > T.dipped - 0.2, dir: 1,
        // Floating down, arms up (drawn) the whole way; the jar goes in her raised right hand.
        pose: 'fall',
        x: Math.sin(t * 0.31) * 0.15, z: -1.0, // close to the wall, so the jar in her hand looks the size it did on the shelf
        y: lerp(5, 0.15, enter) + Math.sin(t * 0.9) * 0.05,
        tilt: sway,
      };
    }

    function update(t, cast) {
      // Walls scroll upward as she falls.
      strip.offset.y = offsetAtTake - (FALL * (t - T.jar)) / tileH;
      sideTex.offset.y = -(FALL * t) / SIDE_TILE;
      // The jar: on a shelf rising toward her, in her hand, then put back on a shelf.
      // On its shelf, rising toward her; into her hand; then into a cupboard as she passes.
      const held = cast.alice.handPoint(new THREE.Vector3());
      held.y += J.h * px * 0.3; // her fingers round the lower part of the jar
      let p;
      if (t < T.jar) p = { ...SHELF, y: wallY(t, HAND.y, T.jar) };
      else if (t < T_PUT - 0.8) {
        const k = smooth((t - T.jar) / 0.8);
        const from = { ...SHELF, y: wallY(t, HAND.y, T.jar) };
        p = { x: lerp(from.x, held.x, k), y: lerp(from.y, held.y, k), z: lerp(from.z, held.z, k) };
      } else {
        const k = smooth((t - (T_PUT - 0.8)) / 0.8);
        const to = { ...CUPBOARD, y: cupY(t) };
        p = { x: lerp(held.x, to.x, k), y: lerp(held.y, to.y, k), z: lerp(held.z, to.z, k) };
      }
      jar.position.set(p.x, p.y, p.z);
      jar.visible = p.y < 6;
      think(t, { x: 0.78, y: 1.6, z: -0.9 }, 1.0);
    }

    const camera = cameraTrack([
      { t: start, dur: 0, pos: [0, 2.2, 2.4], look: [0, 2.6, -1.5] },          // looking a little up the tunnel (not so far that the walls' top shows; owner)
      { t: T.dipped, dur: 3, pos: [0, 1.1, 2.4], look: [0, 0.7, -1.2] },       // she falls into view
      { t: T.jar - 3, dur: 3, pos: [0.35, 1.15, 1.9], look: [0.05, 0.95, -1.2] },  // the jar, held up, well inside the picture (owner)
      { t: T_PUT - 1.5, dur: 2, pos: [-0.2, 1.15, 1.9], look: [-0.3, 0.95, -1.4] },  // into the cupboard
      { t: T_PUT + 3, dur: 6, pos: [0, 1.2, 2.6], look: [0, 0.7, -1.2] },
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
