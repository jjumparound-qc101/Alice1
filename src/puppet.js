// A toy-theater puppet: a paper cutout that slides on the floor, hops when it
// moves, and turns partly toward the camera so its flatness never shows edge-on.
// Poses are whole-figure swaps for now; swappable parts come with the master drawings.
import * as THREE from 'three';
import { paperFlat } from './stage.js';

const MAX_TURN = 0.6; // radians the cutout may turn toward the camera

export class Puppet {
  // poses: { name: { tex, aspect, height?, facesLeft } }
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
      this.root.add(flat);
      this.poses[name] = flat;
    }
    this.pose = null;
  }

  // state: { pose, x, z, visible, moving, dir (+1 right / -1 left), sink (0..1), phase,
  //          y (lift, metres), scale (1 = normal size), tilt (radians) }
  apply(s, camera) {
    this.root.visible = s.visible !== false;
    if (!this.root.visible) return;
    // Running: while a standing figure moves, alternate its two stride drawings.
    let pose = s.pose;
    const striding = pose === 'stand' && s.moving && this.poses.run_a && this.poses.run_b;
    if (striding) pose = Math.floor(s.phase * 2) % 2 ? 'run_b' : 'run_a';
    if (pose !== this.pose) {
      if (this.pose) this.poses[this.pose].visible = false;
      this.poses[pose].visible = true;
      this.pose = pose;
    }
    const flat = this.poses[pose];
    const hop = s.moving ? Math.abs(Math.sin(s.phase * Math.PI * 2)) * (striding ? 0.04 : 0.12) * this.height : 0;
    const rock = s.moving ? Math.sin(s.phase * Math.PI * 2) * 0.06 : 0;
    const scale = s.scale ?? 1;
    this.root.scale.setScalar(scale);
    this.root.position.set(s.x, (s.y ?? 0) + hop * scale - (s.sink ?? 0) * this.height * scale * 1.1, s.z);
    flat.rotation.z = rock + (s.tilt ?? 0);
    // Mirror so the figure faces its direction of travel.
    const facingLeft = (s.dir ?? -1) < 0;
    flat.scale.x = facingLeft === flat.userData.facesLeft ? 1 : -1;
    flat.position.x = flat.userData.offsetX * flat.scale.x;
    // Turn toward the camera, within limits.
    const toCam = Math.atan2(camera.position.x - s.x, camera.position.z - s.z);
    this.root.rotation.y = THREE.MathUtils.clamp(toCam, -MAX_TURN, MAX_TURN);
  }
}
