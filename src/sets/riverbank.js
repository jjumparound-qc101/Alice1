// The riverbank diorama (Chapters I and XII): paper flats arranged in depth, like a Victorian toy theater.
// Units are metres. The audience looks down -Z; the proscenium is at z = 2.2.
// (Was src/stage.js before the shared engine; paperFlat() and halo() are now @engine/stage.js.)
import * as THREE from 'three';
import * as art from '../art.js';
import { texture } from '@engine/ink.js';
import { paperFlat } from '@engine/stage.js';
import { panorama } from './panorama.js';

// Load-on-demand art: `ai` holds the master drawings ({ tex, aspect }) that have
// arrived; anything missing falls back to the procedural placeholder.
function tiled(t, repeatX) {
  t.wrapS = THREE.MirroredRepeatWrapping; // mirroring hides the seam between copies
  t.repeat.set(repeatX, 1);
  t.needsUpdate = true;
  return t;
}

// Builds the riverbank set into `scene` (a THREE.Group owned by the riverbank scene).
export function buildStage(scene, ai = {}) {
  // The floor stops at the proscenium, like a real stage.
  // "sitting by her sister on the bank": meadow grass and daisies (AI tile, tools/bank_art.py),
  // one tile per BANK_TILE metres; the drawn tile is the fallback.
  const BANK_TILE = 1.6;
  const ground = ai.bank_grass ? (() => { const t = ai.bank_grass.tex.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(40 / BANK_TILE, 17.2 / BANK_TILE); t.anisotropy = 8; t.needsUpdate = true; return t; })() : texture(art.groundTile(), { repeat: [14, 6] });
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
    // The bank's grassy lip (AI, tools/bank_art.py), so the ground reads as a bank, not a field.
    const art2 = ai.bank_edge ?? ai.grass, H = ai.bank_edge ? 0.7 : 0.55;
    const tex = art2 ? tiled(art2.tex.clone(), 32 / (H * art2.aspect)) : texture(art.grassStrip(seed));
    if (art2) tex.offset.x = seed * 0.37;
    const g = paperFlat(tex, 32, H, { edge: false });
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
  // The AI toy-theatre front (tools/proscenium.py) in place of the drawn one: scaled so its stage
  // opening (x 254-1281, y 318-840 of 1536x1024) matches the old opening, its foot below ground.
  if (ai.proscenium) {
    const k = open.w / (1281 - 254); // metres per pixel
    const W = 1536 * k, H = 1024 * k;
    pros.visible = false;
    const front = paperFlat(ai.proscenium.tex, W, H, { edge: false });
    const y0 = (open.cy - open.h / 2) - (1024 - 840) * k;
    front.position.set(0, y0, 2.2);
    scene.add(front);
    // A plain paper surround, so the opening shot shows the theatre on the page, not in the landscape.
    const outer = new THREE.Shape([new THREE.Vector2(-40, -20), new THREE.Vector2(40, -20), new THREE.Vector2(40, 30), new THREE.Vector2(-40, 30)]);
    outer.holes.push(new THREE.Path([new THREE.Vector2(-W / 2 + 0.05, y0 + 0.05), new THREE.Vector2(-W / 2 + 0.05, y0 + H - 0.05), new THREE.Vector2(W / 2 - 0.05, y0 + H - 0.05), new THREE.Vector2(W / 2 - 0.05, y0 + 0.05)]));
    const surround = new THREE.Mesh(new THREE.ShapeGeometry(outer), new THREE.MeshBasicMaterial({ color: '#efe9da', fog: false, depthTest: false, transparent: true }));
    // Drawn over everything (the ground beside the stage reaches out in front of it), but only
    // from the audience's side: from the stage its back face is culled, so it never shows there.
    surround.renderOrder = 50; // (transparent, so it is drawn after the paper flats)
    surround.position.z = 2.25;
    scene.add(surround);
    // The theatre around the toy stage (owner, 2026-10-14): the auditorium, its own stage opening
    // (x 502-1035, y 349-822 of 1536x1024) framing the toy front, and in the foreground a row of
    // stalls with the audience's backs, as if from a seat. Drawn over the set like the surround.
    if (ai.theatre_house) {
      surround.visible = false;
      const k2 = H * 0.98 / (822 - 349);
      const house = paperFlat(ai.theatre_house.tex, 1536 * k2, 1024 * k2, { edge: false });
      house.position.set((768 - (502 + 1035) / 2) * k2, y0 - (1024 - 822) * k2, 2.3);
      scene.add(house);
      // The row in front of our seat: hat-tops at about the lower third of the opening shot.
      const row = ai.theatre_seats_row ?? ai.theatre_seats;
      const seatsW = 4.6, seatsH = seatsW / row.aspect, seats = paperFlat(row.tex, seatsW, seatsH, { edge: false });
      seats.position.set(-0.5, 1.22 - (1 - 233 / 793) * seatsH, 14.2); // the child (shortest) straight ahead, so the stage shows over her
      scene.add(seats);
      // The row runs on at each end in empty chairs, for wide screens (owner, 2026-10-16: no mirror-image
      // guests). The empty chair is the drawing's own, from its post at x 222 to the next at 525 (of 1536 px;
      // tools/theatre_seats.py); the first at each end lies over the row's half-cut end chair (its last whole
      // posts are at 222 and 1368), so the guests there sit in whole chairs.
      const more = [];
      if (ai.theatre_seat_empty) {
        const px = seatsW / 1536, chairW = 303 * px, x0 = seats.position.x - seatsW / 2;
        for (let k = 0; k < 6; k++) {
          for (const left of [222 - 303 * (k + 1), 1368 + 303 * k]) {
            const m = paperFlat(ai.theatre_seat_empty.tex, chairW, seatsH, { edge: false });
            m.position.set(x0 + (left + 151.5) * px, seats.position.y, 14.2); scene.add(m); more.push(m);
          }
        }
      }
      [[house, 50], [seats, 60], ...more.map((m) => [m, 61])].forEach(([o, r]) => o.traverse((m) => { if (m.material) { m.material.depthTest = false; m.material.transparent = true; m.material.fog = false; m.renderOrder = r; } }));
    }
  }
  scene.add(pros);
  // Beside the proscenium, out of the Watch shots: more ground and the side scenery, for the
  // wider Explore look arc (owner, 2026-10-11).
  for (const s of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), new THREE.MeshBasicMaterial({ map: ground }));
    side.rotation.x = -Math.PI / 2; side.position.set(s * 13, 0, 7.2); scene.add(side);
  }
  if (ai.sky && ai.treeline) panorama(scene, ai, { x: 13, z0: -12, z1: 12 });

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
