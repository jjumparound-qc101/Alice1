// Explore mode: walk the floor of the diorama with a limited look arc,
// so the flat edges of the set never come into view.
import * as THREE from 'three';

const EYE = 1.35;
const YAW_LIMIT = THREE.MathUtils.degToRad(45);   // ±45° = the 90° arc
const PITCH_LIMIT = THREE.MathUtils.degToRad(14);
const SPEED = 1.6; // m/s

export class Explorer {
  constructor(camera, dom, bounds) {
    this.camera = camera;
    this.bounds = bounds;
    this.yaw = 0;
    this.pitch = 0;
    this.keys = new Set();
    this.active = false;
    this.drag = null;
    addEventListener('keydown', (e) => { if (this.active) this.keys.add(e.code); });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    dom.addEventListener('pointerdown', (e) => { if (this.active) this.drag = { x: e.clientX, y: e.clientY }; });
    addEventListener('pointerup', () => (this.drag = null));
    addEventListener('pointermove', (e) => {
      if (!this.active || !this.drag) return;
      this.look((e.clientX - this.drag.x) * -0.004, (e.clientY - this.drag.y) * -0.004);
      this.drag = { x: e.clientX, y: e.clientY };
    });
  }

  look(dYaw, dPitch) {
    this.yaw = THREE.MathUtils.clamp(this.yaw + dYaw, -YAW_LIMIT, YAW_LIMIT);
    this.pitch = THREE.MathUtils.clamp(this.pitch + dPitch, -PITCH_LIMIT, PITCH_LIMIT);
  }

  // Start from wherever the Watch camera was, pulled inside the walkable area.
  enter() {
    const b = this.bounds, p = this.camera.position;
    p.set(THREE.MathUtils.clamp(p.x, b.minX, b.maxX), EYE, THREE.MathUtils.clamp(p.z, b.minZ, b.maxZ));
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    this.yaw = 0;
    this.pitch = 0;
    this.look(Math.atan2(-dir.x, -dir.z), Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1)));
    this.active = true;
  }

  exit() {
    this.active = false;
    this.keys.clear();
  }

  update(dt) {
    const k = this.keys;
    const fwd = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
    const side = (k.has('KeyD') ? 1 : 0) - (k.has('KeyA') ? 1 : 0);
    const turn = (k.has('ArrowLeft') ? 1 : 0) - (k.has('ArrowRight') ? 1 : 0);
    if (turn) this.look(turn * 1.4 * dt, 0);
    const p = this.camera.position, b = this.bounds;
    const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
    p.x += (-sin * fwd + cos * side) * SPEED * dt;
    p.z += (-cos * fwd - sin * side) * SPEED * dt;
    p.x = THREE.MathUtils.clamp(p.x, b.minX, b.maxX);
    p.z = THREE.MathUtils.clamp(p.z, b.minZ, b.maxZ);
    p.y = EYE;
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }

  // The nearest hotspot in front of the camera and within reach, if any.
  facing(hotspots) {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    let best = null;
    for (const h of hotspots) {
      const to = h.pos.clone().sub(this.camera.position);
      const d = to.length();
      if (d > 2.6) continue;
      const ang = dir.angleTo(to.normalize());
      if (ang < 0.45 && (!best || d < best.d)) best = { h, d };
    }
    return best?.h ?? null;
  }
}
