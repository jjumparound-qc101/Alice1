import * as THREE from 'three';
import { buildStage } from './stage.js';
import { Puppet } from './puppet.js';
import { makeTimeline } from './timeline.js';
import { Page } from './narration.js';
import { Explorer } from './explore.js';
import { PerfMeter } from './perf.js';

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

  const AI_ART = ['sky', 'treeline', 'tree', 'hedge', 'grass', 'alice_stand', 'alice_sit', 'sister_read']; // interim AI masters (PROVENANCE.md)
  const [words, rabbitArt, ...aiArt] = await Promise.all([
    fetch('data/ch01_slice_words.json').then((r) => r.json()),
    loadTexture('art/rabbit_w01-1.png'),
    ...AI_ART.map((n) => loadTexture(`art/ai/${n}.webp`)),
  ]);
  const ai = Object.fromEntries(AI_ART.map((n, i) => [n, aiArt[i]]));
  // The proscenium lettering is drawn to canvas, so the fonts must be loaded first.
  if (document.fonts) await Promise.all([document.fonts.load('600 64px "IM Fell English"'), document.fonts.load('italic 40px "IM Fell English"')]);

  const stage = buildStage(scene, ai);
  const tl = makeTimeline(words, stage.holePos);

  const rabbit = new Puppet({ watch: { ...rabbitArt, facesLeft: true } }, 0.85);
  const alice = new Puppet({
    sit: { ...ai.alice_sit, facesLeft: false, height: 0.85 },
    stand: { ...ai.alice_stand, facesLeft: true },
  }, 1.25);
  const sister = new Puppet({ read: { ...ai.sister_read, facesLeft: false, height: 1.05 } }, 1.05);
  [rabbit, alice, sister].forEach((p) => scene.add(p.root));

  const audio = $('narration');
  const page = new Page($('page'), words, (t) => { audio.currentTime = t; if (mode === 'watch') audio.play(); });
  const explorer = new Explorer(camera, renderer.domElement, stage.bounds);

  let mode = 'watch';
  const LAYOUTS = ['bottom', 'top', 'side'];
  let layout = 'bottom';
  function setLayout(l) {
    layout = l;
    document.body.dataset.text = l;
    page.setLayout(l);
    $('layoutBtn').textContent = `Text: ${l[0].toUpperCase()}${l.slice(1)}`;
    resize();
  }
  let shown = null;

  function setMode(m) {
    mode = m;
    document.body.dataset.mode = m;
    $('modeBtn').textContent = m === 'watch' ? 'Explore' : 'Back to the story';
    if (m === 'explore') { audio.pause(); explorer.enter(); } else { explorer.exit(); closeCard(); audio.play(); }
    resize();
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
  $('layoutBtn').addEventListener('click', () => setLayout(LAYOUTS[(LAYOUTS.indexOf(layout) + 1) % LAYOUTS.length]));
  audio.addEventListener('play', () => ($('playBtn').textContent = 'Pause'));
  audio.addEventListener('pause', () => ($('playBtn').textContent = 'Play'));
  addEventListener('keydown', (e) => {
    if (e.code === 'Tab') { e.preventDefault(); setMode(mode === 'watch' ? 'explore' : 'watch'); }
    if (e.code === 'KeyE' && mode === 'explore') { const h = explorer.facing(stage.hotspots); h ? openCard(h) : closeCard(); }
    if (e.code === 'Escape') closeCard();
    if (e.code === 'KeyL') $('layoutBtn').click();
    if (e.code === 'Space' && mode === 'watch' && $('intro').hidden) { e.preventDefault(); $('playBtn').click(); }
  });

  // Shift the picture away from the text so shots stay framed whatever the layout.
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    if (mode === 'watch' && layout === 'top') camera.setViewOffset(w, h, 0, -0.2 * h, w, h);
    else if (mode === 'watch' && layout === 'side' && w > 700) camera.setViewOffset(w, h, 0.17 * w, 0.1 * h, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  setLayout('bottom');

  const look = new THREE.Vector3();
  let last = performance.now();
  const perf = new PerfMeter(renderer);
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
    perf.tick(now);
  });

  // Exposed for automated checks (tools/smoke.mjs).
  window.__slice = { audio, tl, setMode, setLayout, camera, perf, ready: true };
}

main().catch((e) => {
  console.error(e);
  document.body.insertAdjacentHTML('beforeend', `<pre class="error">${e.message}</pre>`);
});
