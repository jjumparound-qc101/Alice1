// The riverbank diorama: paper flats arranged in depth, like a Victorian toy theater.
// Units are metres. The audience looks down -Z; the proscenium is at z = 2.2.
import * as THREE from 'three';
import * as art from './art.js';
import { texture, PAPER } from './ink.js';

const EDGE = new THREE.Color('#8b8272'); // the cut paper edge seen behind each flat

// A flat paper cutout with a visible paper thickness behind it.
// anchor 'bottom' stands it on the floor; 'center' centres it on y.
export function paperFlat(tex, width, height, { anchor = 'bottom', edge = true, opaque = false } = {}) {
  const geo = new THREE.PlaneGeometry(width, height);
  if (anchor === 'bottom') geo.translate(0, height / 2, 0);
  const mat = new THREE.MeshBasicMaterial({
    map: tex, transparent: !opaque, alphaTest: opaque ? 0 : 0.5, side: THREE.DoubleSide,
  });
  const group = new THREE.Group();
  const front = new THREE.Mesh(geo, mat);
  group.add(front);
  if (edge) {
    const back = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      map: tex, color: EDGE, transparent: !opaque, alphaTest: opaque ? 0 : 0.5, side: THREE.DoubleSide,
    }));
    back.position.set(0.012, -0.012, -0.018);
    group.add(back);
  }
  group.userData.front = front;
  return group;
}

// Load-on-demand art: `ai` holds the master drawings ({ tex, aspect }) that have
// arrived; anything missing falls back to the procedural placeholder.
function tiled(t, repeatX) {
  t.wrapS = THREE.MirroredRepeatWrapping; // mirroring hides the seam between copies
  t.repeat.set(repeatX, 1);
  t.needsUpdate = true;
  return t;
}

export function buildStage(scene, ai = {}) {
  scene.background = new THREE.Color(PAPER);
  scene.fog = new THREE.Fog(PAPER, 9, 34);

  // The floor stops at the proscenium, like a real stage.
  const ground = texture(art.groundTile(), { repeat: [14, 6] });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 17.2), new THREE.MeshBasicMaterial({ map: ground }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -6.4);
  scene.add(floor);

  // Back to front. Widths are generous so the 90° look arc never finds an edge.
  const skyTex = ai.sky ? tiled(ai.sky.tex, 40 / (14 * ai.sky.aspect)) : texture(art.sky());
  const sky = paperFlat(skyTex, 40, 14, { edge: false, opaque: true });
  sky.position.set(0, -0.5, -11);
  scene.add(sky);

  const far = ai.treeline
    ? paperFlat(tiled(ai.treeline.tex, 34 / (3.2 * ai.treeline.aspect)), 34, 3.2, { edge: false })
    : paperFlat(texture(art.treeLine(3)), 34, 8.5, { edge: false });
  far.position.set(0, 0, -8.5);
  scene.add(far);

  // holeFraction: where the rabbit-hole sits across the hedge drawing (measured from the art).
  const holeFraction = ai.hedge ? 0.343 : 0.45;
  const hedgeW = 9, hedgeX = 3.2, hedgeZ = -4.6;
  const hedge = ai.hedge
    ? paperFlat(ai.hedge.tex, hedgeW, hedgeW / ai.hedge.aspect)
    : paperFlat(texture(art.hedge(holeFraction)), hedgeW, 2.8);
  hedge.position.set(hedgeX, 0, hedgeZ);
  scene.add(hedge);
  const holePos = new THREE.Vector3(hedgeX + (holeFraction - 0.5) * hedgeW, 0, hedgeZ + 0.05);

  const treeTex = ai.tree ? ai.tree.tex : texture(art.bigTree());
  const treeAspect = ai.tree ? ai.tree.aspect : 5 / 6.8;
  const tree = paperFlat(treeTex, 6.8 * treeAspect, 6.8);
  tree.position.set(-4.4, 0, -3.3);
  scene.add(tree);

  // Wings: tree flats at the sides, staggered, hiding the set's edges.
  const wingTex = ai.tree ? ai.tree.tex : texture(art.bigTree());
  [[-7.2, 0.4, 1], [7.4, -1.2, -1], [-7.6, -5.6, 1], [7.8, -6.4, -1]].forEach(([x, z, s]) => {
    const w = paperFlat(wingTex, 6.2 * treeAspect, 6.2);
    w.position.set(x, 0, z);
    w.scale.x = s;
    scene.add(w);
  });

  [[0, 1.0, 5], [0.5, -0.9, 6]].forEach(([dx, z, seed]) => {
    // Each strip gets its own texture copy so the two rows can be offset.
    const tex = ai.grass ? tiled(ai.grass.tex.clone(), 32 / (0.55 * ai.grass.aspect)) : texture(art.grassStrip(seed));
    if (ai.grass) tex.offset.x = seed * 0.37;
    const g = paperFlat(tex, 32, 0.55, { edge: false });
    g.position.set(dx, 0, z);
    scene.add(g);
  });

  // Proscenium. Its opening frames the wide Watch-mode shot; Explore mode stays behind it.
  const PW = 12, PH = 7.2, CW = 2048, CH = Math.round((CW * PH) / PW);
  const open = { w: 8.4, h: 4.6, cy: 2.55 };
  const px = (m) => (m / PW) * CW, py = (m) => (m / PH) * CH;
  const pros = paperFlat(texture(art.proscenium(CW, CH, {
    x: px((PW - open.w) / 2), y: py(PH - open.cy - open.h / 2), w: px(open.w), h: py(open.h),
  })), PW, PH);
  pros.position.set(0, 0, 2.2);
  scene.add(pros);

  return {
    holePos,
    // Where the camera may walk in Explore mode.
    bounds: { minX: -4.8, maxX: 4.8, minZ: -3.6, maxZ: 1.6 },
    hotspots: [
      { id: 'book', pos: new THREE.Vector3(-3.25, 0.7, -2.6), title: 'Her sister’s book',
        text: '“and what is the use of a book,” thought Alice, “without pictures or conversations?”' },
      { id: 'hole', pos: holePos.clone().setY(0.4), title: 'The rabbit-hole',
        text: '…just in time to see it pop down a large rabbit-hole under the hedge.' },
    ],
  };
}
