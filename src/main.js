import * as THREE from 'three';
import { buildStage } from './stage.js';
import { Puppet } from './puppet.js';
import { makeTimeline } from './timeline.js';
import { Page } from './narration.js';
import { Explorer } from './explore.js';
import * as art from './art.js';
import { texture } from './ink.js';

const $ = (id) => document.getElementById(id);

async function loadTexture(url) {
  const t = await new THREE.TextureLoader().loadAsync(url);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return { tex: t, aspect: t.image.width / t.image.height };
}

async function main() {
  const renderer = new THREE.WebGLRenderer({ canvas: $('stage'), antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 80);

  const [words, rabbitArt] = await Promise.all([
    fetch('data/ch01_slice_words.json').then((r) => r.json()),
    loadTexture('art/rabbit_w01-1.png'),
  ]);
  if (document.fonts) await document.fonts.ready; // the proscenium lettering is drawn to canvas

  const stage = buildStage(scene);
  const tl = makeTimeline(words, stage.holePos);

  const canvasPose = (c, facesLeft) => ({ tex: texture(c), aspect: c.width / c.height, facesLeft });
  const rabbit = new Puppet({ watch: { ...rabbitArt, facesLeft: true } }, 0.85);
  const alice = new Puppet({
    sit: { ...canvasPose(art.aliceSitting(), false), height: 0.78 },
    stand: canvasPose(art.aliceStanding(), false),
  }, 1.25);
  const sister = new Puppet({ read: { ...canvasPose(art.sisterReading(), false), height: 0.95 } }, 0.95);
  [rabbit, alice, sister].forEach((p) => scene.add(p.root));

  const audio = $('narration');
  const page = new Page($('page'), words, (t) => { audio.currentTime = t; if (mode === 'watch') audio.play(); });
  const explorer = new Explorer(camera, renderer.domElement, stage.bounds);

  let mode = 'watch';
  let shown = null;

  function setMode(m) {
    mode = m;
    document.body.dataset.mode = m;
    $('modeBtn').textContent = m === 'watch' ? 'Explore' : 'Back to the story';
    if (m === 'explore') { audio.pause(); explorer.enter(); } else { explorer.exit(); closeCard(); audio.play(); }
  }

  function openCard(h) {
    shown = h;
    $('cardTitle').textContent = h.title;
    $('cardText').textContent = h.text;
    $('card').hidden = false;
  }
  function closeCard() { shown = null; $('card').hidden = true; }

  $('begin').addEventListener('click', () => {
    $('intro').hidden = true;
    audio.play();
  });
  $('modeBtn').addEventListener('click', () => setMode(mode === 'watch' ? 'explore' : 'watch'));
  $('playBtn').addEventListener('click', () => (audio.paused ? audio.play() : audio.pause()));
  $('restartBtn').addEventListener('click', () => { audio.currentTime = 0; if (mode === 'watch') audio.play(); });
  $('cardClose').addEventListener('click', closeCard);
  audio.addEventListener('play', () => ($('playBtn').textContent = 'Pause'));
  audio.addEventListener('pause', () => ($('playBtn').textContent = 'Play'));
  addEventListener('keydown', (e) => {
    if (e.code === 'Tab') { e.preventDefault(); setMode(mode === 'watch' ? 'explore' : 'watch'); }
    if (e.code === 'KeyE' && mode === 'explore') { const h = explorer.facing(stage.hotspots); h ? openCard(h) : closeCard(); }
    if (e.code === 'Escape') closeCard();
    if (e.code === 'Space' && mode === 'watch' && $('intro').hidden) { e.preventDefault(); $('playBtn').click(); }
  });

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  resize();

  const look = new THREE.Vector3();
  let last = performance.now();
  renderer.setAnimationLoop((now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = audio.currentTime;

    if (mode === 'watch') {
      const c = tl.cameraAt(t);
      camera.position.set(...c.pos);
      camera.lookAt(look.set(...c.look));
    } else {
      explorer.update(dt);
      const h = explorer.facing(stage.hotspots);
      $('prompt').hidden = !h || shown === h;
      if (h) $('prompt').textContent = `E: ${h.title}`;
    }

    rabbit.apply(tl.rabbit(t), camera);
    alice.apply(tl.alice(t), camera);
    sister.apply({ pose: 'read', x: -3.25, z: -2.6, dir: 1 }, camera);

    page.update(t);
    const f = audio.ended ? 1 : tl.fade(t);
    $('fade').style.opacity = f;
    $('endCard').hidden = f < 0.99;
    renderer.render(scene, camera);
  });

  // Exposed for automated checks (tools/smoke.mjs).
  window.__slice = { audio, tl, setMode, camera, ready: true };
}

main().catch((e) => {
  console.error(e);
  document.body.insertAdjacentHTML('beforeend', `<pre class="error">${e.message}</pre>`);
});
