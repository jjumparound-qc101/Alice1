// Scene 3: the landing and the long passage, from "thump! thump!" to the corner,
// where "the Rabbit was no longer to be seen".
import * as THREE from 'three';
import { paperFlat } from '../stage.js';
import { PAPER } from '../ink.js';
import { smooth, lerp, route, cameraTrack } from '../track.js';

const LEN = 22, HALF_W = 1.4, H = 2.6, CORNER_Z = -17;

export const passage = {
  id: 'passage',
  title: 'The long passage',
  start: (cue) => cue.at('thump') - 0.6,

  build({ group, ai, cue }) {
    const at = cue.at;
    const start = passage.start(cue);
    const T = {
      thump: at('thump'), jumped: at('jumped'), passage: at('passage', 1), away: at('wind'),
      corner: at('corner', 1), turned: at('corner', 2), hall: at('hall', 1),
    };

    const mat = (map, color = '#9a9080') => new THREE.MeshBasicMaterial({ map, color, side: THREE.DoubleSide });
    // Floor and ceiling: AI drawings (tools/walls.py), one drawing to every 2.2 m, repeating both ways.
    const tiled = (name, w, d) => {
      const t = ai[name].tex.clone();
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(w / 2.2, d / 2.2);
      t.needsUpdate = true;
      return t;
    };
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(HALF_W * 2 + 6, LEN), mat(tiled('walls/passage_floor', HALF_W * 2 + 6, LEN), '#c9c0b0'));
    floor.rotation.x = -Math.PI / 2; floor.position.set(1.5, 0, -LEN / 2 + 2);
    group.add(floor);
    const ceil = new THREE.Mesh(floor.geometry, mat(tiled('walls/passage_ceiling', HALF_W * 2 + 6, LEN), '#a59c8c'));
    ceil.material.side = THREE.FrontSide; // seen from below only: the opening shot looks down through it as she lands
    ceil.rotation.x = Math.PI / 2; ceil.position.set(1.5, H, -LEN / 2 + 2); group.add(ceil);
    // Left wall runs the full length; the right wall stops at the corner, where the passage turns right.
    // The walls: packed earth, roots, timber props (AI drawing, tools/walls.py), one drawing to
    // every 3.9 m (its own proportions at the passage's height). 
    const earthWall = (len) => {
      const t = ai['walls/passage'].tex.clone();
      t.wrapS = THREE.RepeatWrapping;
      t.repeat.set(len / (H * ai['walls/passage'].aspect), 1);
      t.needsUpdate = true;
      return t;
    };
    const left = new THREE.Mesh(new THREE.PlaneGeometry(LEN, H), mat(earthWall(LEN), '#c9c0b0'));
    left.rotation.y = Math.PI / 2; left.position.set(-HALF_W, H / 2, -LEN / 2 + 2); group.add(left);
    const rightLen = 2 - CORNER_Z - 1;
    const right = new THREE.Mesh(new THREE.PlaneGeometry(rightLen, H), mat(earthWall(rightLen), '#c9c0b0'));
    right.rotation.y = -Math.PI / 2; right.position.set(HALF_W, H / 2, 2 - rightLen / 2); group.add(right);
    const end = new THREE.Mesh(new THREE.PlaneGeometry(HALF_W * 2 + 6, H), mat(earthWall(HALF_W * 2 + 6), '#c9c0b0'));
    end.position.set(1.5, H / 2, -LEN + 2); group.add(end);
    // Light from round the corner.
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.2, H), new THREE.MeshBasicMaterial({ color: PAPER }));
    glow.rotation.y = -Math.PI / 2; glow.position.set(HALF_W + 3, H / 2, CORNER_Z); group.add(glow);

    // The heap of sticks and dry leaves, and Alice landing on it with the leaves flying (both
    // AI drawings, tools/ch1_art.py). The landing drawing has its own heap, so it stands in
    // for the heap and Alice from "thump!" until she jumps up.
    const HEAP_W = 1.6; // sized to Alice in the landing drawing
    const heap = paperFlat(ai['ch1/leaf_heap'].tex, HEAP_W, HEAP_W / ai['ch1/leaf_heap'].aspect);
    heap.position.set(0, 0, -0.6);
    const LAND_W = HEAP_W * 0.95;
    const landing = paperFlat(ai['ch1/alice_land'].tex, LAND_W, LAND_W / ai['ch1/alice_land'].aspect);
    landing.position.set(0, 0, -0.55);
    group.add(heap, landing);
    const landed = (t) => t >= T.thump && t < T.jumped;

    const AT_HEAP = { x: 0, z: -0.45 };
    const CORNER = { x: 0.2, z: CORNER_Z + 0.6 };
    const ROUND = { x: HALF_W + 2.5, z: CORNER_Z };

    function alice(t) {
      if (t < T.jumped) { // lands on the heap of sticks and dry leaves
        const drop = smooth((t - (T.thump - 0.6)) / 0.6);
        return { pose: 'fall', ...AT_HEAP, dir: 1, y: lerp(2.5, 0.35, drop), visible: !landed(t) };
      }
      const s = route(t, [
        [T.jumped, { x: -0.55, z: -1.2, dir: 1 }],
        [T.away, { x: -0.55, z: -1.2 }],
        [T.away + 9, CORNER],
        [T.turned, CORNER],
        [T.turned + 2.5, ROUND],
      ], { pose: 'stand', phase: t * 2.4 });
      return { ...s, visible: t < T.turned + 2.5 };
    }

    function rabbit(t) {
      // Far off in the dark from the start, "still in sight, hurrying down it"; then
      // "as it turned a corner, 'Oh my ears and whiskers…'": gone by the time she gets there.
      const s = route(t, [
        [start, { x: 0.35, z: -12, dir: -1 }],
        [T.passage, { x: 0.35, z: -12 }],
        [T.corner, { x: 0.1, z: CORNER_Z + 1 }],
        [T.corner + 1.8, ROUND],
      ], { pose: 'watch', phase: t * 2.8 });
      // Hurrying away down the passage, seen from behind (drawn), until he turns the corner.
      const away = s.moving && t < T.corner;
      return { ...s, pose: away ? 'runAway' : s.moving ? 'trot1' : 'watch1', visible: t < T.corner + 1.8 };
    }

    const camera = cameraTrack([
      { t: start, dur: 0, pos: [0.2, 3.5, 2.2], look: [0, 0.2, -1] },              // looking down as she lands
      { t: T.thump + 1, dur: 3, pos: [0.6, 1.2, 2.2], look: [0, 0.5, -1] },
      { t: T.passage - 1, dur: 3, pos: [0.5, 1.4, 1.4], look: [0, 0.6, -10] },      // down the passage
      { t: T.away, dur: 9, pos: [0.4, 1.3, CORNER_Z + 4.5], look: [0.6, 0.6, CORNER_Z - 1] },
      { t: T.turned, dur: 3, pos: [0.6, 1.3, CORNER_Z + 1.5], look: [HALF_W + 3, 0.7, CORNER_Z] },
    ]);

    return {
      T, bg: '#1a1712', fog: [5, 26], // the Rabbit stays "still in sight" far down the passage
      bounds: { minX: -HALF_W + 0.4, maxX: HALF_W - 0.4, minZ: CORNER_Z + 1, maxZ: 1.5 },
      hotspots: [{ pos: new THREE.Vector3(0, 0.4, -0.6), title: 'A heap of sticks and dry leaves', text: 'down she came upon a heap of sticks and dry leaves, and the fall was over.' }],
      camera,
      update(t) { landing.visible = landed(t); heap.visible = !landing.visible; },
      actors: (t) => ({ alice: alice(t), rabbit: rabbit(t) }),
    };
  },
};
