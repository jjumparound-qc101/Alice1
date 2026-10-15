// Stage helpers: paper flats arranged in depth, like a Victorian toy theater.
// Units are metres. The audience looks down -Z.
import * as THREE from 'three';

const EDGE = new THREE.Color('#8b8272'); // the cut paper edge seen behind each flat

// How much of the drawings' colour shows, 0 (ink on paper) to 1 (as drawn): set each frame from the
// active scene's colour(t) (Carol 2026-10-15, docs/ENGINE.md "Colour"). Shared by every paper flat.
export const COLOUR = { value: 1 };
const INK_L = new THREE.Color('#17140f'), PAPER_L = new THREE.Color('#efe9da'); // linear, as the shader works
const vec3 = (c) => `vec3(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})`;
// The drawing's brightness mapped from ink to paper, mixed back toward its own colour by COLOUR.
function colourable(mat) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uColour = COLOUR;
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uColour;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        float lum = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
        diffuseColor.rgb = mix(mix(${vec3(INK_L)}, ${vec3(PAPER_L)}, clamp(lum / ${(0.2126 * PAPER_L.r + 0.7152 * PAPER_L.g + 0.0722 * PAPER_L.b).toFixed(4)}, 0.0, 1.0)), diffuseColor.rgb, uColour);`);
  };
  mat.customProgramCacheKey = () => 'colourable';
  return mat;
}

// A flat paper cutout with a visible paper thickness behind it.
// anchor 'bottom' stands it on the floor; 'center' centres it on y.
// keepColour: a light (fire, candle, a glowing face) keeps its colour when a scene drains colour.
export function paperFlat(tex, width, height, { anchor = 'bottom', edge = true, opaque = false, keepColour = false } = {}) {
  const geo = new THREE.PlaneGeometry(width, height);
  if (anchor === 'bottom') geo.translate(0, height / 2, 0);
  const mat = new THREE.MeshBasicMaterial({
    map: tex, transparent: !opaque, alphaTest: opaque ? 0 : 0.5, side: THREE.DoubleSide,
  });
  if (!keepColour) colourable(mat);
  const group = new THREE.Group();
  const front = new THREE.Mesh(geo, mat);
  group.add(front);
  if (edge) {
    const back = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      map: tex, color: EDGE, transparent: !opaque, alphaTest: opaque ? 0 : 0.5, side: THREE.DoubleSide,
    }));
    // The card's edge: about 1 cm on a figure a metre or more tall, in proportion on smaller ones
    // (a fixed offset shows as a dark double behind small figures).
    const k = Math.min(1, Math.max(width, height));
    back.position.set(0.012 * k, -0.012 * k, -0.018 * k);
    group.add(back);
  }
  group.userData.front = front;
  return group;
}


// A soft halo of light, for spot colours that glow (docs/COLOR.md). Sits just behind a prop.
let haloTex = null;
export function halo(color, size, strength = 0.45) {
  if (!haloTex) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,0.45)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    haloTex = new THREE.CanvasTexture(c);
  }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({
    map: haloTex, color, transparent: true, opacity: strength, depthWrite: false,
  }));
  m.position.z = -0.005;
  return m;
}
