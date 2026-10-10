import * as THREE from 'three';
import { Puppet } from './puppet.js';
import { makeCues } from './cues.js';
import { smooth } from './track.js';
import { Page } from './narration.js';
import { Explorer } from './explore.js';
import { PerfMeter } from './perf.js';
import { sentenceStarts, skip, Timeline } from './navigate.js';
import { CHAPTER_1 } from './scenes/index.js';

const $ = (id) => document.getElementById(id);
const SAVE_KEY = 'alice.place.v1';
const SPEED_KEY = 'alice.speed.v1';
const SPEEDS = [1, 1.25, 1.5, 2];

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
  const AI_ART = ['sky', 'treeline', 'tree', 'hedge', 'grass', 'alice_stand', 'alice_sit', 'sister_read', 'shaft_strip', 'jar',
    'hall/floor', 'hall/lamp', 'hall/curtain', 'hall/door_frame', 'hall/door_leaf'];
  const [words, shaftMeta, hallMeta, poseMeta, rabbitArt, ...aiArt] = await Promise.all([
    fetch('data/ch01_words.json').then((r) => r.json()),
    fetch('art/ai/shaft_strip.json').then((r) => r.json()),
    fetch('art/ai/hall/hall.json').then((r) => r.json()),
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
    return { def, group, start: def.start(cue), ...def.build({ group, ai, cue, shaftMeta, hallMeta }) };
  });
  const sceneAt = (t) => scenes.reduce((cur, s) => (t >= s.start ? s : cur), scenes[0]);

  // Shared cast.
  const cast = {
    rabbit: new Puppet({ watch: { ...rabbitArt, facesLeft: true } }, 0.85),
    alice: new Puppet({
      sit: { ...ai.alice_sit, facesLeft: false, height: 0.85, hand: [0.65, 0.7] },
      stand: { ...ai.alice_stand, facesLeft: true, hand: [0.55, 0.57] },
      ...posed,
      run_a: { ...posed.run_a, hand: [0.62, 0.53] },
      run_b: { ...posed.run_b, hand: [0.66, 0.57] },
      walk_a: { ...posed.walk_a, hand: [0.04, 0.5] },
      walk_b: { ...posed.walk_b, hand: [0.03, 0.5] },
      jump: { ...posed.jump, hand: [0.03, 0.37] },
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
  // The chapter's end: the narration fades, then the end card offers what to do next.
  const atEnd = () => audio.ended || audio.currentTime >= cue.end + 0.8;
  let endDismissed = false;

  function setMode(m) {
    if (m === 'explore' && !active.bounds) return; // e.g. mid-fall: nowhere to stand
    mode = m;
    document.body.dataset.mode = m;
    $('modeBtn').textContent = m === 'watch' ? 'Explore' : 'Back to the story';
    if (m === 'explore') { audio.pause(); explorer.bounds = active.bounds; explorer.enter(); }
    else { explorer.exit(); closeCard(); if (atEnd()) endDismissed = false; else play(audio); }
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
  // Moving through the chapter: scrubber, skip keys, reading speed and the scene menu.
  // `resume` plays after the seek; otherwise the narration keeps its playing/paused state.
  function seek(t, resume = !audio.paused) {
    audio.currentTime = Math.max(0, Math.min(t, cue.end + 0.9));
    if (mode === 'watch' && resume && t < cue.end) play(audio);
  }
  const sentences = sentenceStarts(words);
  const sceneStarts = scenes.map((s) => s.start);
  const timeline = new Timeline($('timeline'), {
    duration: cue.end + 0.9,
    marks: scenes.map((s) => ({ t: s.start, title: s.def.title })),
    onSeek: (() => { let was = false, dragging = false; // hold the narration while dragging
      return (t, done) => {
        if (!dragging) { was = !audio.paused; dragging = true; audio.pause(); }
        seek(t, false);
        if (done) { dragging = false; if (was) seek(t, true); }
      }; })(),
  });

  function setSpeed(r) {
    audio.playbackRate = r;
    audio.preservesPitch = true; // faster, not higher
    $('speedBtn').textContent = `${r}×`;
    try { localStorage.setItem(SPEED_KEY, String(r)); } catch {}
  }
  let savedSpeed = 1;
  try { savedSpeed = Number(localStorage.getItem(SPEED_KEY)) || 1; } catch {}
  setSpeed(SPEEDS.includes(savedSpeed) ? savedSpeed : 1);
  $('speedBtn').addEventListener('click', () => setSpeed(SPEEDS[(SPEEDS.indexOf(audio.playbackRate) + 1) % SPEEDS.length]));

  // The scene menu, from the controls (pausing the reading) and on the start screen.
  let menuResume = false;
  function openMenu() {
    menuResume = !audio.paused;
    audio.pause();
    const here = sceneAt(audio.currentTime);
    $('sceneList').querySelectorAll('button').forEach((b, i) => b.classList.toggle('here', scenes[i] === here));
    $('sceneMenu').hidden = false;
  }
  function closeMenu(resume = menuResume) {
    $('sceneMenu').hidden = true;
    if (resume && mode === 'watch' && !atEnd()) play(audio);
  }
  function goToScene(s) {
    closeMenu(false);
    endDismissed = false;
    if (mode !== 'watch') setMode('watch');
    if (!$('intro').hidden) begin(s.start); else seek(s.start, true);
  }
  scenes.forEach((s) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.innerHTML = `<span></span><span></span>`;
    b.children[0].textContent = s.def.title;
    b.children[1].textContent = clock(s.start);
    b.addEventListener('click', () => goToScene(s));
    li.append(b);
    $('sceneList').append(li);
    const ib = document.createElement('button');
    ib.textContent = s.def.title;
    ib.addEventListener('click', () => goToScene(s));
    $('introScenes').append(ib);
  });
  $('scenesBtn').addEventListener('click', () => ($('sceneMenu').hidden ? openMenu() : closeMenu()));
  $('sceneClose').addEventListener('click', () => closeMenu());

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
  $('endExplore').addEventListener('click', () => { endDismissed = true; setMode('explore'); });
  $('endReplay').addEventListener('click', () => { endDismissed = false; audio.currentTime = 0; play(audio); });
  $('layoutBtn').addEventListener('click', () => setLayout(LAYOUTS[(LAYOUTS.indexOf(layout) + 1) % LAYOUTS.length]));
  audio.addEventListener('play', () => ($('playBtn').textContent = 'Pause'));
  audio.addEventListener('pause', () => { $('playBtn').textContent = 'Play'; place.save(audio.currentTime); });
  addEventListener('pagehide', () => place.save(audio.currentTime));
  setInterval(() => { if (!audio.paused) place.save(audio.currentTime); }, 3000);
  addEventListener('keydown', (e) => {
    if (!$('intro').hidden) return;
    if (e.code === 'Tab') { e.preventDefault(); setMode(mode === 'watch' ? 'explore' : 'watch'); }
    if (e.code === 'KeyE' && mode === 'explore') { const h = explorer.facing(active.hotspots); h ? openCard(h) : closeCard(); }
    if (e.code === 'Escape') { closeCard(); if (!$('sceneMenu').hidden) closeMenu(); }
    if (e.code === 'KeyM') $('scenesBtn').click();
    if (e.code === 'KeyS' && mode === 'watch') $('speedBtn').click();
    if ((e.code === 'ArrowLeft' || e.code === 'ArrowRight') && mode === 'watch' && $('sceneMenu').hidden) {
      e.preventDefault();
      const to = skip(e.shiftKey ? sceneStarts : sentences, audio.currentTime, e.code === 'ArrowLeft' ? -1 : 1, e.shiftKey ? 3 : 1.5);
      if (to !== null) { endDismissed = false; seek(to); }
    }
    if (e.code === 'KeyL') $('layoutBtn').click();
    if (e.code === 'Space' && mode === 'watch' && $('endCard').hidden) { e.preventDefault(); $('playBtn').click(); }
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

  // Scene changes. 'paper' (the default) turns like a page: a quick fade through paper.
  // 'dark' fades to black, changes scene while black, then fades up slowly, as if lamps were lit.
  const TURNS = {
    paper: { out: 0.6, in: 0.7, el: 'turn' },
    dark: { out: 0.8, in: 2.0, light: 3.5, el: 'dark' },
  };
  function turnsAt(t) {
    const o = { turn: 0, dark: 0 };
    for (const s of scenes.slice(1)) {
      const k = TURNS[s.def.turn ?? 'paper'];
      const v = t < s.start ? smooth((t - (s.start - k.out)) / k.out) : 1 - smooth((t - s.start) / k.in);
      o[k.el] = Math.max(o[k.el], v);
    }
    return o;
  }
  // After a 'dark' turn the set's own colours come up from black.
  const lit = new THREE.Color();
  function lightUp(t) {
    const k = TURNS[active.def.turn ?? 'paper'];
    if (!k.light) return;
    const e = smooth((t - active.start) / k.light);
    lit.set('#000').lerp(new THREE.Color(active.bg), e);
    scene.background.copy(lit);
    scene.fog.color.copy(lit);
    scene.fog.near = active.fog[0] * e;
    scene.fog.far = 1.5 + (active.fog[1] - 1.5) * e;
  }

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

    const actors = active.actors(t);
    for (const [name, puppet] of Object.entries(cast)) puppet.apply(actors[name] ?? { visible: false }, camera);
    active.update?.(t, cast); // after the cast, so props can follow a puppet's hand

    lightUp(t);
    page.update(t);
    timeline.update(t);
    const turns = turnsAt(t);
    $('turn').style.opacity = turns.turn;
    $('dark').style.opacity = turns.dark;
    if (t < cue.end) endDismissed = false;
    audio.volume = 1 - smooth((t - cue.end) / 0.8);
    const f = mode !== 'watch' || endDismissed ? 0 : atEnd() ? 1 : smooth((t - cue.end + 0.1) / 0.8);
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
