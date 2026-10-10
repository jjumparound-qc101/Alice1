// A toy-theater puppet: a paper cutout that slides on the floor, hops when it
// moves, and turns partly toward the camera so its flatness never shows edge-on.
// Poses are whole-figure swaps for now; swappable parts come with the master drawings.
import * as THREE from 'three';
import { paperFlat } from './stage.js';

const MAX_TURN = 0.6; // radians the cutout may turn toward the camera
const RUN_SPEED = 1.0; // m/s: faster than this, a figure with stride drawings runs

export class Puppet {
  // poses: { name: { tex, aspect, height?, facesLeft, hand? } }
  // hand: [u, v], where the near hand is drawn, as fractions of the image from its top left.
  constructor(poses, height) {
    this.root = new THREE.Group();
    this.height = height;
    this.poses = {};
    for (const [name, p] of Object.entries(poses)) {
      const h = p.height ?? height;
      const flat = paperFlat(p.tex, h * p.aspect, h);
      flat.visible = false;
      flat.userData.facesLeft = p.facesLeft;
      flat.userData.offsetX = p.offsetX ?? 0; // shifts a pose so its body lines up with the others
      flat.userData.size = [h * p.aspect, h];
      flat.userData.hand = p.hand;
      this.root.add(flat);
      this.poses[name] = flat;
    }
    this.pose = null;
  }

  // state: { pose, x, z, visible, moving, dir (+1 right / -1 left), sink (0..1), phase,
  //          y (lift, metres), scale (1 = normal size), tilt (radians),
  //          speed (m/s), gait ('walk' | 'run': overrides the speed),
  //          idle (seconds: standing-still life, a gentle rock and a bounce on the toes) }
  apply(s, camera) {
    this.root.visible = s.visible !== false;
    if (!this.root.visible) return;
    // Running: while a standing figure runs, alternate its two stride drawings. Walking
    // slowly, it keeps the standing pose with a gentle bob (the stride reads oddly at walking pace).
    let pose = s.pose;
    const canStride = pose === 'stand' && s.moving && this.poses.run_a && this.poses.run_b;
    const running = s.gait ? s.gait === 'run' : (s.speed ?? Infinity) >= RUN_SPEED;
    const striding = canStride && running;
    const strolling = canStride && !running;
    if (striding) pose = Math.floor(s.phase * 2) % 2 ? 'run_b' : 'run_a';
    // Walking: step drawings alternate (walk_a with walk_b, or with the standing pose until
    // walk_b is drawn). Without walk art, the standing pose bobs.
    const stepping = strolling && this.poses.walk_a;
    if (stepping) pose = Math.floor(s.phase) % 2 ? (this.poses.walk_b ? 'walk_b' : 'stand') : 'walk_a';
    if (pose !== this.pose) {
      if (this.pose) this.poses[this.pose].visible = false;
      this.poses[pose].visible = true;
      this.pose = pose;
    }
    const flat = this.poses[pose];
    const lift = striding ? 0.04 : stepping ? 0.006 : strolling ? 0.012 : 0.12;
    const beat = s.phase * Math.PI * 2 * (strolling ? 0.5 : 1); // a walk is about two steps a second
    const hop = s.moving ? Math.abs(Math.sin(beat)) * lift * this.height : 0;
    let rock = s.moving ? Math.sin(beat) * (strolling ? 0.025 : 0.06) : 0;
    let bounce = 0;
    if (s.idle !== undefined && !s.moving) {
      rock = Math.sin(s.idle * 2.1) * 0.05; // about ±3°
      const k = (s.idle % 1.4) / 0.28; // a little bounce on his toes every 1.4 s
      if (k < 1) bounce = Math.sin(k * Math.PI) * 0.025 * this.height;
    }
    const scale = s.scale ?? 1;
    this.root.scale.setScalar(scale);
    this.root.position.set(s.x, (s.y ?? 0) + (hop + bounce) * scale - (s.sink ?? 0) * this.height * scale * 1.1, s.z);
    flat.rotation.z = rock + (s.tilt ?? 0);
    // Mirror so the figure faces its direction of travel.
    const facingLeft = (s.dir ?? -1) < 0;
    flat.scale.x = facingLeft === flat.userData.facesLeft ? 1 : -1;
    flat.position.x = flat.userData.offsetX * flat.scale.x;
    // Turn toward the camera, within limits.
    const toCam = Math.atan2(camera.position.x - s.x, camera.position.z - s.z);
    this.root.rotation.y = THREE.MathUtils.clamp(toCam, -MAX_TURN, MAX_TURN);
  }

  // World position of the hand drawn in the current pose, just in front of the card,
  // so a carried prop follows the drawing through mirroring, tilt, turn and scale.
  handPoint(out = new THREE.Vector3()) {
    const flat = this.poses[this.pose];
    const [u, v] = flat?.userData.hand ?? [0.5, 0.55];
    const [w, h] = flat?.userData.size ?? [0, this.height];
    this.root.updateMatrixWorld(true);
    return flat.localToWorld(out.set((u - 0.5) * w, (1 - v) * h, 0.03));
  }
}
