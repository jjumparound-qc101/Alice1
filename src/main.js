import * as THREE from 'three';
import { Puppet } from './puppet.js';
import { makeCues } from './cues.js';
import { smooth } from './track.js';
import { Page } from './narration.js';
import { Explorer } from './explore.js';
import { PerfMeter } from './perf.js';
import { CHAPTER_1 } from './scenes/index.js';

const $ = (id) => document.getElementById(id);
const SAVE_KEY = 'alice.place.v1';

async function loadTexture(url) {
  const t = await new THREE.TextureLoader().loadAsync(url);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return { tex: t, aspect: t.image.width / t.image.height };
}

// The reader's place: chapter and time. Browser storage can be missing or blocked,
// so every access is guarded and the game works without it.
const place = {
  load() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch { return null; } },
  save(t) { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ chapter: 1, t })); } catch {} },
};
const play = (audio) => audio.play().catch(() => {}); // interrupted by pause(): expected
const clock = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

async function main() {
  const renderer = new THREE.WebGLRenderer({ canvas: $('stage'), antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#efe9da', 9, 34);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.02, 80);

  // Interim AI master drawings (PROVENANCE.md).
  const AI_ART = ['sky', 'treeline', 'tree', 'hedge', 'grass', 'alice_stand', 'alice_sit', 'sister_read', 'shaft_strip', 'jar'];
  const [words, shaftMeta, poseMeta, rabbitArt, ...aiArt] = await Promise.all([
    fetch('data/ch01_words.json').then((r) => r.json()),
    fetch('art/ai/shaft_strip.json').then((r) => r.json()),
    fetch('art/ai/poses/poses.json').then((r) => r.json()),
    loadTexture('art/rabbit_w01-1.png'),
    ...AI_ART.map((n) => loadTexture(`art/ai/${n}.webp`)),
  ]);
  // Composed poses (tools/compose_poses.py), sized and lined up to match the standing Alice.
  const ALICE_H = 1.25;
  const posed = Object.fromEntries(await Promise.all(Object.entries(poseMeta.poses).map(async ([name, m]) => {
    const art = await loadTexture(`art/ai/poses/${name}.webp`);
    const k = ALICE_H / poseMeta.base.h; // metres per pixel
    return [name, { ...art, facesLeft: true, height: m.h * k, offsetX: (m.w / 2 - m.bodyX) * k }];
  })));
  const ai = Object.fromEntries(AI_ART.map((n, i) => [n, aiArt[i]]));
  // Lettering on the proscenium and props is drawn to canvas, so the fonts must be loaded first.
  if (document.fonts) await Promise.all([document.fonts.load('600 64px "IM Fell English"'), document.fonts.load('italic 40px "IM Fell English"')]);

  // Build every scene's set up front; only the active one is shown.
  const cue = makeCues(words);
  const scenes = CHAPTER_1.map((def) => {
    const group = new THREE.Group();
    group.visible = false;
    scene.add(group);
    return { def, group, start: def.start(cue), ...def.build({ group, ai, cue, shaftMeta }) };
  });
  const sceneAt = (t) => scenes.reduce((cur, s) => (t >= s.start ? s : cur), scenes[0]);

  // Shared cast.
  const cast = {
    rabbit: new Puppet({ watch: { ...rabbitArt, facesLeft: true } }, 0.85),
    alice: new Puppet({
      sit: { ...ai.alice_sit, facesLeft: false, height: 0.85 },
      stand: { ...ai.alice_stand, facesLeft: true },
      ...posed,
    }, ALICE_H),
    sister: new Puppet({ read: { ...ai.sister_read, facesLeft: false, height: 1.05 } }, 1.05),
  };
  Object.values(cast).forEach((p) => scene.add(p.root));

  const audio = $('narration');
  const page = new Page($('page'), words, (t) => { audio.currentTime = t; if (mode === 'watch') play(audio); });
  const explorer = new Explorer(camera, renderer.domElement, scenes[0].bounds);

  let mode = 'watch';
  let active = null;
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
    if (m === 'explore' && !active.bounds) return; // e.g. mid-fall: nowhere to stand
    mode = m;
    document.body.dataset.mode = m;
    $('modeBtn').textContent = m === 'watch' ? 'Explore' : 'Back to the story';
    if (m === 'explore') { audio.pause(); explorer.bounds = active.bounds; explorer.enter(); } else { explorer.exit(); closeCard(); play(audio); }
    resize();
  }

  function openCard(h) {
    shown = h;
    $('cardTitle').textContent = h.title;
    $('cardText').textContent = h.text;
    $('card').hidden = false;
  }
  function closeCard() { shown = null; $('card').hidden = true; }

  function begin(t) {
    $('intro').hidden = true;
    audio.currentTime = t;
    play(audio);
  }
  const saved = place.load();
  if (saved?.t > 5 && saved.t < cue.end - 2) {
    $('continue').hidden = false;
    $('continue').textContent = `Continue (${sceneAt(saved.t).def.title}, ${clock(saved.t)})`;
    $('continue').addEventListener('click', () => begin(saved.t));
  }
  $('begin').addEventListener('click', () => begin(0));
  $('modeBtn').addEventListener('click', () => setMode(mode === 'watch' ? 'explore' : 'watch'));
  $('playBtn').addEventListener('click', () => (audio.paused ? play(audio) : audio.pause()));
  $('restartBtn').addEventListener('click', () => { audio.currentTime = 0; if (mode === 'watch') play(audio); });
  $('cardClose').addEventListener('click', closeCard);
  $('layoutBtn').addEventListener('click', () => setLayout(LAYOUTS[(LAYOUTS.indexOf(layout) + 1) % LAYOUTS.length]));
  audio.addEventListener('play', () => ($('playBtn').textContent = 'Pause'));
  audio.addEventListener('pause', () => { $('playBtn').textContent = 'Play'; place.save(audio.currentTime); });
  addEventListener('pagehide', () => place.save(audio.currentTime));
  setInterval(() => { if (!audio.paused) place.save(audio.currentTime); }, 3000);
  addEventListener('keydown', (e) => {
    if (!$('intro').hidden) return;
    if (e.code === 'Tab') { e.preventDefault(); setMode(mode === 'watch' ? 'explore' : 'watch'); }
    if (e.code === 'KeyE' && mode === 'explore') { const h = explorer.facing(active.hotspots); h ? openCard(h) : closeCard(); }
    if (e.code === 'Escape') closeCard();
    if (e.code === 'KeyL') $('layoutBtn').click();
    if (e.code === 'Space' && mode === 'watch') { e.preventDefault(); $('playBtn').click(); }
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

  // Scene changes turn like a page: a quick fade through paper.
  const turnAt = (t) => scenes.slice(1).reduce((m, s) => Math.max(m,
    t < s.start ? smooth((t - (s.start - 0.6)) / 0.6) : 1 - smooth((t - s.start) / 0.7)), 0);

  function show(s) {
    if (active === s) return;
    if (active) active.group.visible = false;
    active = s;
    s.group.visible = true;
    scene.background = new THREE.Color(s.bg);
    scene.fog.color.set(s.bg);
    [scene.fog.near, scene.fog.far] = s.fog;
    $('modeBtn').disabled = !s.bounds;
    if (mode === 'explore' && !s.bounds) setMode('watch');
  }

  const look = new THREE.Vector3();
  let last = performance.now();
  const perf = new PerfMeter(renderer);
  renderer.setAnimationLoop((now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = audio.currentTime;
    show(sceneAt(t));

    if (mode === 'watch') {
      const c = active.camera(t);
      camera.position.set(...c.pos);
      camera.lookAt(look.set(...c.look));
    } else {
      explorer.update(dt);
      const h = explorer.facing(active.hotspots);
      $('prompt').hidden = !h || shown === h;
      if (h) $('prompt').textContent = `E: ${h.title}`;
    }

    active.update?.(t);
    const actors = active.actors(t);
    for (const [name, puppet] of Object.entries(cast)) puppet.apply(actors[name] ?? { visible: false }, camera);

    page.update(t);
    $('turn').style.opacity = turnAt(t);
    const f = audio.ended ? 1 : smooth((t - cue.end + 0.1) / 0.8);
    $('fade').style.opacity = f;
    $('endCard').hidden = f < 0.99;
    renderer.render(scene, camera);
    perf.tick(now);
  });

  // Exposed for automated checks (tools/smoke.mjs).
  window.__slice = { audio, scenes, cue, setMode, setLayout, camera, perf, ready: true };
}

main().catch((e) => {
  console.error(e);
  document.body.insertAdjacentHTML('beforeend', `<pre class="error">${e.message}</pre>`);
});
