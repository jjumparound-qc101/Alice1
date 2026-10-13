import { keepThoughtsInView } from './thoughts.js';
import * as THREE from 'three';
import { Puppet } from './puppet.js';
import { makeCues } from './cues.js';
import { smooth } from './track.js';
import { Page } from './narration.js';
import { Explorer } from './explore.js';
import { PerfMeter } from './perf.js';
import { sentenceStarts, skip, Timeline } from './navigate.js';
import { CHAPTERS } from './chapters.js';
import { texture } from './ink.js';
import { lizard, guineaPig, puppy } from './props4.js';
import { pigeon } from './props5.js';
import { footman, duchess, cook, pig } from './props6.js';
import { hatter, marchHare } from './props7.js';
import { card } from './props8.js';
import { gryphon, mockTurtle } from './props9.js';
import { hatterStand } from './props11.js';
import { mouseUp, mouseWalk, owlStand, crabStand, magpieStand, canaryStand } from './props3.js';

const $ = (id) => document.getElementById(id);
const SAVE_KEY = 'alice.place.v2';
const SPEED_KEY = 'alice.speed.v1';
const SPEEDS = [1, 1.25, 1.5, 2];

async function loadTexture(url) {
  const t = await new THREE.TextureLoader().loadAsync(url);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return { tex: t, aspect: t.image.width / t.image.height };
}

// The reader's place: the chapter, and the time reached in each chapter. Browser storage
// can be missing or blocked, so every access is guarded and the game works without it.
const place = {
  load() {
    try {
      const p = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (p) return p;
      const v1 = JSON.parse(localStorage.getItem('alice.place.v1')); // Chapter I only
      return v1 ? { chapter: 1, times: { 1: v1.t } } : null;
    } catch { return null; }
  },
  save(chapter, t) {
    try {
      const p = this.load() ?? { times: {} };
      p.chapter = chapter;
      p.times[chapter] = t;
      localStorage.setItem(SAVE_KEY, JSON.stringify(p));
    } catch {}
  },
};
const play = (audio) => audio.play().catch(() => {}); // interrupted by pause(): expected
const clock = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

async function main() {
  const renderer = new THREE.WebGLRenderer({ canvas: $('stage'), antialias: true });
  // Touch screens (phones, tablets) render at a lower resolution, to stay smooth and cool.
  const coarse = matchMedia('(pointer: coarse)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.5 : 2));
  renderer.localClippingEnabled = true; // the Cheshire Cat fades from the tail (Chapter VI)
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#efe9da', 9, 34);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.02, 80);

  // Interim AI master drawings (PROVENANCE.md), shared by every chapter.
  const AI_ART = ['sky', 'treeline', 'tree', 'hedge', 'grass', 'alice_stand', 'alice_sit', 'sister_read', 'shaft_strip', 'jar_orange',
    'hall/floor', 'hall/lamp', 'hall/curtain', 'hall/door_frame', 'hall/door_leaf',
    'props/key', 'props/bottle', 'props/cake', 'props/box', 'props/fan', // tools/small_props.py
    'ch1/leaf_heap', 'ch1/alice_land', 'ch1/garden', 'ch1/rabbit_run_away', 'ch1/rabbit_watch', 'ch1/rabbit_trot',
    'walls/shaft_side', 'walls/passage', 'walls/passage_floor', 'walls/passage_ceiling', 'walls/hall', 'walls/hall_ceiling', 'ch5/caterpillar_sit', 'vignettes/dinah', 'vignettes/bats', 'vignettes/stairs', 'vignettes/globe', // tools/walls.py // tools/ch1_art.py
    // Chapter II (tools/ch2_art.py): the Rabbit, the Mouse, the birds, props, the pool and the thoughts.
    ...['rabbit2_trot', 'rabbit2_start', 'rabbit2_away', 'mouse_swim', 'mouse_leap', 'mouse_bristle', 'mouse_away',
      'duck_swim', 'duck_stand', 'dodo_swim', 'dodo_stand', 'lory_swim', 'lory_stand', 'eaglet_swim', 'eaglet_stand',
      'kid_gloves', 'splash', 'pool_water', 'pool_rim'].map((n) => `ch2/${n}`),
    ...['foot_parcel', 'ada_mabel', 'crocodile', 'seaside', 'walrus', 'dinah_fire', 'terrier'].map((n) => `vignettes/${n}`)];
  const narrated = CHAPTERS.filter((c) => c.narrated);
  const [wordsList, shaftMeta, hallMeta, poseMeta, rabbitArt, ...aiArt] = await Promise.all([
    Promise.all(narrated.map((c) => fetch(c.words).then((r) => r.json()))),
    fetch('art/ai/shaft_strip.json').then((r) => r.json()),
    fetch('art/ai/hall/hall.json').then((r) => r.json()),
    fetch('art/ai/poses/poses.json').then((r) => r.json()),
    loadTexture('art/rabbit_w01-1_white.png'), // white, not paper (tools/white_rabbit.py)
    ...AI_ART.map((n) => loadTexture(`art/ai/${n}.webp`)),
  ]);
  // Whole-figure poses (tools/compose_poses.py), sized and lined up to match the standing Alice.
  const ALICE_H = 1.25;
  const posed = Object.fromEntries(await Promise.all(Object.entries(poseMeta.poses).filter(([name]) => !name.startsWith('run_')).map(async ([name, m]) => {
    const art = await loadTexture(`art/ai/poses/${name}.webp`);
    const k = ALICE_H / poseMeta.base.h; // metres per pixel
    return [name, { ...art, facesLeft: true, height: m.h * k, offsetX: (m.w / 2 - m.bodyX) * k }];
  })));
  const ai = Object.fromEntries(AI_ART.map((n, i) => [n, aiArt[i]]));
  // Tenniel's own plates shown as pictures (Chapter V's Father William), paper-tinted.
  for (const n of ['father_william_1', 'father_william_2', 'father_william_3', 'father_william_4']) ai[`tenniel/${n}`] = await loadTexture(`art/tenniel/${n}.webp`);
  // Lettering on the proscenium, props and title pages is drawn to canvas, so the fonts must be loaded first.
  if (document.fonts) await Promise.all([document.fonts.load('600 64px "IM Fell English"'), document.fonts.load('italic 40px "IM Fell English"')]);

  // Each narrated chapter's text timings and scene start times are known up front (for the
  // contents); its sets are built the first time it is opened.
  narrated.forEach((c, i) => {
    c.wordsData = wordsList[i];
    c.cue = makeCues(c.wordsData);
    c.starts = c.scenes.map((def) => def.start(c.cue));
    // Marks: each scene, and the named parts within it (for the contents, the timeline and Shift+arrows).
    c.marks = c.scenes.flatMap((def, i) => [{ title: def.title, t: c.starts[i] }, ...(def.parts?.(c.cue) ?? [])]);
  });
  function build(c) {
    if (c.built) return c.built;
    const scenes = c.scenes.map((def, i) => {
      const group = new THREE.Group();
      group.visible = false;
      scene.add(group);
      return { def, group, start: c.starts[i], ...def.build({ group, ai, cue: c.cue, shaftMeta, hallMeta }) };
    });
    const words = c.wordsData;
    const flat = words.paragraphs.flat();
    const sentences = sentenceStarts(words);
    const lastSentence = flat.filter((w) => w.s >= sentences[sentences.length - 1]).map((w) => w.t).join(' ');
    c.built = { scenes, cue: c.cue, words, sentences, sceneStarts: c.marks.map((m) => m.t), lastSentence };
    return c.built;
  }

  // A pose drawn in code: { tex, aspect, height, facesLeft }.
  const drawn = (c, height) => ({ tex: texture(c), aspect: c.width / c.height, height, facesLeft: true });
  // A pose from an AI drawing in `ai`.
  const art = (name, height, facesLeft = true) => ({ ...ai[name], height, facesLeft });
  // Watch mode: if Alice is partly in the shot but cut by its edge (or hidden under the text
  // strip), turn the camera just enough to take her in. Shots that leave her out altogether
  // (close-ups, her point of view, other characters) are left alone. (Owner, 2026-10-13.)
  const corner = new THREE.Vector3();
  function keepAliceInFrame() {
    const al = cast.alice, flat = al.poses[al.pose];
    if (!al.root.visible || !flat) return;
    camera.updateMatrixWorld();
    const [w, h] = flat.userData.size;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, inside = 0, n = 0;
    for (const u of [0.15, 0.5, 0.85]) for (const v of [0.05, 0.5, 0.95]) {
      flat.localToWorld(corner.set((u - 0.5) * w, v * h, 0)).project(camera);
      if (corner.z > 1) return; // behind the camera
      n++; if (Math.abs(corner.x) <= 1 && corner.y <= 1 && corner.y >= -0.4) inside++;
      x0 = Math.min(x0, corner.x); x1 = Math.max(x1, corner.x); y0 = Math.min(y0, corner.y); y1 = Math.max(y1, corner.y);
    }
    if (inside === 0 || inside === n) return;
    const M = 0.92, BOTTOM = -0.38;
    let dx = 0, dy = 0;
    if (x1 - x0 < 2 * M) dx = x1 > M ? x1 - M : x0 < -M ? x0 + M : 0;
    if (y1 - y0 < M - BOTTOM) dy = y0 < BOTTOM ? y0 - BOTTOM : y1 > M ? y1 - M : 0;
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const cap = 0.3;
    camera.rotateY(-THREE.MathUtils.clamp(Math.atan(dx * tanV * camera.aspect), -cap, cap));
    camera.rotateX(THREE.MathUtils.clamp(Math.atan(dy * tanV), -cap, cap));
  }

  // Shared cast.
  const cast = {
    rabbit: new Puppet({
      watch: { ...rabbitArt, facesLeft: true },
      // Chapter I: seen from behind, running off down the passage (tools/ch1_art.py).
      runAway: { ...ai['ch1/rabbit_run_away'], facesLeft: true, height: 0.95 },
      // Chapter I's Rabbit (the owner's sheet, tools/ch1_art.py): with his watch; trotting.
      watch1: { ...ai['ch1/rabbit_watch'], facesLeft: true, height: 0.9 },
      trot1: { ...ai['ch1/rabbit_trot'], facesLeft: true, height: 0.9 },
      // Chapter II: "splendidly dressed", gloves and fan in his paws; starting; scurrying away.
      trot: { ...ai['ch2/rabbit2_trot'], facesLeft: true, height: 0.95 },
      start: { ...ai['ch2/rabbit2_start'], facesLeft: false, height: 1.0 },
      away: { ...ai['ch2/rabbit2_away'], facesLeft: true, height: 0.9 },
    }, 0.85),
    alice: new Puppet({
      sit: { ...ai.alice_sit, facesLeft: false, height: 0.85, hand: [0.65, 0.7] },
      stand: { ...ai.alice_stand, facesLeft: true, hand: [0.55, 0.57] },
      ...posed,
      walk_a: { ...posed.walk_a, hand: [0.03, 0.48] },
      walk_b: { ...posed.walk_b, hand: [0.09, 0.45] },
      jump: { ...posed.jump, hand: [0.03, 0.37] },
      fall: { ...posed.fall, hand: [0.06, 0.06] },        // the marmalade jar, in her raised left hand (Chapter I)
      hold: { ...posed.hold, hand: [0.05, 0.17] },        // the key or bottle held up (Chapter I)
      comfits: { ...posed.comfits, hand: [0.11, 0.45] },
      bow: { ...posed.bow, hand: [0.38, 0.51] },          // takes the thimble (Chapter III)
    }, ALICE_H),
    sister: new Puppet({ read: { ...ai.sister_read, facesLeft: false, height: 1.05 } }, 1.05),
    // Chapter II placeholders (props2.js), sized for a tiny Alice: swimmers show only what
    // is above the water.
    // The Mouse and the birds (AI drawings, tools/ch2_art.py; drawn facing right). The Mouse
    // standing and walking on the shore (Chapter III) are still placeholders.
    mouse: new Puppet({ swim: art('ch2/mouse_swim', 0.05, false), leap: art('ch2/mouse_leap', 0.13, false),
      bristle: art('ch2/mouse_bristle', 0.07), away: art('ch2/mouse_away', 0.06, false),
      up: drawn(mouseUp(), 0.09), walk: drawn(mouseWalk(), 0.04) }, 0.05),
    duck: new Puppet({ swim: art('ch2/duck_swim', 0.06, false), up: art('ch2/duck_stand', 0.11, false) }, 0.07),
    dodo: new Puppet({ swim: art('ch2/dodo_swim', 0.09, false), up: art('ch2/dodo_stand', 0.2, false) }, 0.11),
    lory: new Puppet({ swim: art('ch2/lory_swim', 0.06, false), up: art('ch2/lory_stand', 0.1, false) }, 0.065),
    eaglet: new Puppet({ swim: art('ch2/eaglet_swim', 0.06, false), up: art('ch2/eaglet_stand', 0.11, false) }, 0.065),
    // Chapter III placeholders (props3.js).
    owl: new Puppet({ up: drawn(owlStand(), 0.09) }, 0.09),
    magpie: new Puppet({ up: drawn(magpieStand(), 0.1) }, 0.1),
    canary: new Puppet({ up: drawn(canaryStand(), 0.06) }, 0.06),
    crab: new Puppet({ stand: drawn(crabStand(), 0.035) }, 0.035),
    crabling: new Puppet({ stand: drawn(crabStand(true), 0.022) }, 0.022),
    // Chapter IV placeholders (props4.js).
    bill: new Puppet({ stand: drawn(lizard('stand'), 0.3), fly: drawn(lizard('fly'), 0.3) }, 0.3),
    pat: new Puppet({ spade: drawn(guineaPig(true), 0.4) }, 0.4),
    pig1: new Puppet({ up: drawn(guineaPig(), 0.32) }, 0.32),
    pig2: new Puppet({ up: drawn(guineaPig(), 0.32) }, 0.32),
    // Chapter V placeholders.
    // The AI drawing (tools/ch5_art.py): blue, with his hookah, on the scene's own mushroom.
    caterpillar: new Puppet({ sit: art('ch5/caterpillar_sit', 0.1) }, 0.1),
    pigeon: new Puppet({ fly: drawn(pigeon('fly'), 0.22), perch: drawn(pigeon('perch'), 0.2) }, 0.2),
    // Chapter VI placeholders.
    fish: new Puppet({ stand: drawn(footman('fish'), 0.3) }, 0.3),
    frog: new Puppet({ stand: drawn(footman('frog'), 0.3), sit: drawn(footman('frog', 'sit'), 0.3) }, 0.3),
    duchess: new Puppet({ sit: drawn(duchess('sit'), 0.3), stand: drawn(duchess('stand'), 0.32) }, 0.32),
    cook: new Puppet({ stir: drawn(cook('stir'), 0.3), throw: drawn(cook('throw'), 0.3) }, 0.3),
    pig: new Puppet({ trot: drawn(pig(), 0.07) }, 0.07),
    // Chapter VII placeholders (seated, waist up).
    hatter: new Puppet({ stare: drawn(hatter('stare'), 0.42), riddle: drawn(hatter('riddle'), 0.42), watch: drawn(hatter('watch'), 0.42),
      // Chapter XI: standing as a witness (props11.js).
      ...Object.fromEntries(['cup', 'pale', 'bite', 'tremble', 'knee', 'run'].map((p) => [p, drawn(hatterStand(p), 0.36)])) }, 0.42),
    hare: new Puppet({ sit: drawn(marchHare('sit'), 0.4), dip: drawn(marchHare('dip'), 0.4) }, 0.4),
    // Chapter VIII placeholders: the cards (props8.js), coloured like real cards (owner, 2026-10-11).
    ...Object.fromEntries([['two', 2], ['five', 5], ['seven', 7]].map(([name, rank]) => [name, new Puppet(Object.fromEntries(
      ['stand', 'paint', 'bow', 'kneel', 'run'].map((p) => [p, drawn(card({ suit: 'spades', rank }, p), 0.28)])), 0.28)])),
    queen: new Puppet(Object.fromEntries([...['stand', 'point', 'flush', 'stamp', 'folded'].map((p) => [p, drawn(card({ suit: 'hearts', rank: 'queen' }, p), 0.32)]),
      ['specs', drawn(card({ suit: 'hearts', rank: 'queen', specs: true }, 'stand'), 0.32)], ['purple', drawn(card({ suit: 'hearts', rank: 'queen', face: 'purple' }, 'point'), 0.32)]]), 0.32),
    // The King: as judge in Chapters XI and XII, his crown over his wig; spectacles; arms folded; pale.
    king: new Puppet({
      stand: drawn(card({ suit: 'hearts', rank: 'king' }, 'stand'), 0.32),
      judge: drawn(card({ suit: 'hearts', rank: 'king', wig: true }, 'stand'), 0.32),
      judgeSpecs: drawn(card({ suit: 'hearts', rank: 'king', wig: true, specs: true }, 'stand'), 0.32),
      judgeFold: drawn(card({ suit: 'hearts', rank: 'king', wig: true }, 'folded'), 0.32),
      judgePoint: drawn(card({ suit: 'hearts', rank: 'king', wig: true }, 'point'), 0.32),
      judgePale: drawn(card({ suit: 'hearts', rank: 'king', wig: true, face: 'pale' }, 'stand'), 0.32),
    }, 0.32),
    knave: new Puppet({ carry: drawn(card({ suit: 'hearts', rank: 'knave' }, 'carry'), 0.3), stand: drawn(card({ suit: 'hearts', rank: 'knave' }, 'stand'), 0.3), chains: drawn(card({ suit: 'hearts', rank: 'knave', chains: true }, 'stand'), 0.3) }, 0.3),
    executioner: new Puppet({ axe: drawn(card({ suit: 'spades', rank: 'executioner' }, 'axe'), 0.32) }, 0.32),
    // Chapter IX placeholders (props9.js).
    gryphon: new Puppet(Object.fromEntries(['asleep', 'sit', 'walk', 'paws', 'hide'].map((p) => [p, drawn(gryphon(p), p === 'asleep' ? 0.5 : 0.36)])), 0.36),
    mockTurtle: new Puppet(Object.fromEntries(['sit', 'sob', 'count', 'hide', 'walk'].map((p) => [p, drawn(mockTurtle(p), 0.3)])), 0.3),
    puppy: new Puppet({ stand: drawn(puppy('stand'), 0.75), sit: drawn(puppy('sit'), 0.8) }, 0.75),
  };
  Object.values(cast).forEach((p) => scene.add(p.root));

  const audio = $('narration');
  const explorer = new Explorer(camera, renderer.domElement, null);

  // The open chapter. Everything that differs between chapters hangs off `ch`.
  let chapter = null, ch = null, page = null;
  const sceneAt = (t) => ch.scenes.reduce((cur, s) => (t >= s.start ? s : cur), ch.scenes[0]);

  let mode = 'watch';
  let active = null;
  const LAYOUTS = ['bottom', 'top', 'side'];
  let layout = 'bottom';
  // On a phone held upright the text always sits below the picture, as a page of running text.
  const shownLayout = () => (document.body.dataset.form === 'portrait' ? 'side' : layout);
  function setLayout(l) {
    layout = l;
    document.body.dataset.text = shownLayout();
    page?.setLayout(shownLayout());
    $('layoutBtn').textContent = `Text: ${l[0].toUpperCase()}${l.slice(1)}`;
    resize();
  }
  let shown = null;
  // The chapter's end: the narration fades, then the end card offers what to do next.
  const atEnd = () => audio.ended || audio.currentTime >= ch.cue.end + 0.8;
  let endDismissed = false;

  // Open a chapter: build its sets if needed, point the narration, text, timeline and
  // end card at it, and wait until its audio can be positioned.
  let switching = false; // while a chapter's narration loads, don't save its time
  async function openChapter(c) {
    if (chapter === c) return;
    if (chapter) place.save(chapter.n, audio.currentTime);
    switching = true;
    audio.pause();
    chapter = c;
    ch = build(c);
    if (active) { active.group.visible = false; active = null; }
    page = new Page($('page'), ch.words, (t) => { audio.currentTime = t; if (mode === 'watch') play(audio); }, c.tints);
    page.setLayout(shownLayout());
    timeline.set(ch.cue.end + 0.9, c.marks);
    const next = CHAPTERS[c.n];
    $('endQuote').textContent = `“${ch.lastSentence.replace(/^[“"]|[”"]$/g, '')}”`;
    $('endTitle').textContent = `Chapter ${c.roman} complete`;
    $('endSub').textContent = c.title;
    const last = ch.scenes[ch.scenes.length - 1];
    $('endExplore').hidden = !last.bounds;
    $('endExplore').textContent = `Explore ${last.def.title.replace(/^The /, 'the ')}`;
    $('endNext').disabled = !next?.narrated;
    $('endNext').textContent = next ? `Continue to Chapter ${next.roman}` : 'The end';
    $('endNext').title = next && !next.narrated ? `Chapter ${next.roman} is not ready yet` : '';
    endDismissed = false;
    audio.src = c.audio;
    audio.defaultPlaybackRate = audio.playbackRate = speed;
    await new Promise((ok) => audio.addEventListener('loadedmetadata', ok, { once: true }));
    switching = false;
  }

  function setMode(m) {
    if (m === 'explore' && !active?.bounds) return; // e.g. mid-fall: nowhere to stand
    mode = m;
    document.body.dataset.mode = m;
    $('modeBtn').textContent = m === 'watch' ? 'Explore' : 'Back to the story';
    $('playBtn').textContent = m === 'explore' && document.body.dataset.form !== 'wide' ? 'Back to the story' : audio.paused ? 'Play' : 'Pause';
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

  // Start reading chapter c at time t.
  async function begin(c, t) {
    $('intro').hidden = true;
    closeMenu(false);
    if (mode !== 'watch') setMode('watch');
    await openChapter(c);
    audio.currentTime = t;
    play(audio);
    started = true;
    wake(); // show the controls at first, even on a phone
  }
  let started = false; // a chapter is open and positioned (for automated checks)
  // Moving through the chapter: scrubber, skip keys, reading speed and the contents.
  // `resume` plays after the seek; otherwise the narration keeps its playing/paused state.
  function seek(t, resume = !audio.paused) {
    audio.currentTime = Math.max(0, Math.min(t, ch.cue.end + 0.9));
    if (mode === 'watch' && resume && t < ch.cue.end) play(audio);
  }
  const timeline = new Timeline($('timeline'), (() => {
    let was = false, dragging = false; // hold the narration while dragging
    return (t, done) => {
      if (!ch) return;
      if (!dragging) { was = !audio.paused; dragging = true; audio.pause(); }
      endDismissed = false;
      seek(t, false);
      if (done) { dragging = false; if (was) seek(t, true); }
    };
  })());

  let speed = 1;
  function setSpeed(r) {
    speed = r;
    audio.defaultPlaybackRate = audio.playbackRate = r;
    audio.preservesPitch = true; // faster, not higher
    $('speedBtn').textContent = `${r}×`;
    try { localStorage.setItem(SPEED_KEY, String(r)); } catch {}
  }
  let savedSpeed = 1;
  try { savedSpeed = Number(localStorage.getItem(SPEED_KEY)) || 1; } catch {}
  setSpeed(SPEEDS.includes(savedSpeed) ? savedSpeed : 1);
  $('speedBtn').addEventListener('click', () => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]));

  // The contents: every chapter, and the scenes of each narrated one. From the controls
  // (pausing the reading) and on the start screen.
  const sceneButtons = [];
  for (const c of CHAPTERS) {
    const h = document.createElement('h3');
    const hb = document.createElement('button');
    hb.textContent = `${c.roman}. ${c.title}`;
    hb.disabled = !c.narrated;
    hb.addEventListener('click', () => begin(c, 0));
    h.append(hb);
    if (!c.narrated) h.insertAdjacentHTML('beforeend', ' <span class="later">(coming)</span>');
    $('contents').append(h);
    if (!c.narrated || !c.marks || c.marks.length < 2) continue;
    const ol = document.createElement('ol');
    c.marks.forEach((m) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.innerHTML = '<span></span><span></span>';
      b.children[0].textContent = m.title;
      b.children[1].textContent = clock(m.t);
      b.addEventListener('click', () => begin(c, m.t));
      sceneButtons.push({ b, c, m });
      li.append(b);
      ol.append(li);
    });
    $('contents').append(ol);
  }
  let menuResume = false;
  function openMenu() {
    menuResume = !audio.paused;
    audio.pause();
    const t = audio.currentTime;
    const here = chapter?.marks.reduce((cur, m) => (t >= m.t ? m : cur), chapter.marks[0]);
    sceneButtons.forEach(({ b, m }) => b.classList.toggle('here', m === here));
    $('sceneMenu').hidden = false;
  }
  function closeMenu(resume = menuResume) {
    $('sceneMenu').hidden = true;
    if (resume && ch && mode === 'watch' && $('intro').hidden && !atEnd()) play(audio);
  }
  $('scenesBtn').addEventListener('click', () => ($('sceneMenu').hidden ? openMenu() : closeMenu()));
  $('contentsIntro').addEventListener('click', openMenu);
  $('sceneClose').addEventListener('click', () => closeMenu());

  // Start screen: continue where the reader left off, or begin at Chapter I.
  const saved = place.load();
  const savedCh = CHAPTERS.find((c) => c.n === saved?.chapter && c.narrated);
  const savedT = savedCh ? saved.times?.[savedCh.n] ?? 0 : 0;
  if (savedCh && (savedT > 5 || savedCh.n > 1) && savedT < savedCh.cue.end - 2) {
    const sceneTitle = savedCh.marks.reduce((cur, m) => (savedT >= m.t ? m : cur), savedCh.marks[0]).title;
    $('continue').hidden = false;
    $('continue').textContent = `Continue (Chapter ${savedCh.roman}: ${sceneTitle}, ${clock(savedT)})`;
    $('continue').addEventListener('click', () => begin(savedCh, savedT));
  }
  $('begin').addEventListener('click', () => begin(CHAPTERS[0], 0));
  $('modeBtn').addEventListener('click', () => setMode(mode === 'watch' ? 'explore' : 'watch'));
  // In Explore the play button reads "Back to the story" (on phones the Explore button is in the More panel).
  const phoneForm = () => document.body.dataset.form !== 'wide';
  $('playBtn').addEventListener('click', () => (mode === 'explore' && phoneForm() ? setMode('watch') : audio.paused ? play(audio) : audio.pause()));
  $('restartBtn').addEventListener('click', () => { endDismissed = false; audio.currentTime = 0; if (mode === 'watch') play(audio); });
  $('cardClose').addEventListener('click', closeCard);
  $('endExplore').addEventListener('click', () => { endDismissed = true; setMode('explore'); });
  $('endReplay').addEventListener('click', () => { endDismissed = false; audio.currentTime = 0; play(audio); });
  $('endNext').addEventListener('click', () => { const next = CHAPTERS[chapter.n]; if (next?.narrated) begin(next, 0); });
  $('layoutBtn').addEventListener('click', () => setLayout(LAYOUTS[(LAYOUTS.indexOf(layout) + 1) % LAYOUTS.length]));
  audio.addEventListener('play', () => { if (mode === 'watch') $('playBtn').textContent = 'Pause'; });
  const savePlace = () => { if (chapter && !switching) place.save(chapter.n, audio.currentTime); };
  audio.addEventListener('pause', () => { if (mode === 'watch') $('playBtn').textContent = 'Play'; savePlace(); });
  addEventListener('pagehide', savePlace);
  setInterval(() => { if (!audio.paused) savePlace(); }, 3000);
  addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && !$('sceneMenu').hidden) { closeMenu(); return; }
    if (!$('intro').hidden || !ch) return;
    if (e.code === 'Tab') { e.preventDefault(); setMode(mode === 'watch' ? 'explore' : 'watch'); }
    if (e.code === 'KeyE' && mode === 'explore') { const h = explorer.facing(active.hotspots); h ? openCard(h) : closeCard(); }
    if (e.code === 'Escape') closeCard();
    if (e.code === 'KeyM') $('scenesBtn').click();
    if (e.code === 'KeyS' && mode === 'watch') $('speedBtn').click();
    if ((e.code === 'ArrowLeft' || e.code === 'ArrowRight') && mode === 'watch' && $('sceneMenu').hidden) {
      e.preventDefault();
      const to = skip(e.shiftKey ? ch.sceneStarts : ch.sentences, audio.currentTime, e.code === 'ArrowLeft' ? -1 : 1, e.shiftKey ? 3 : 1.5);
      if (to !== null) { endDismissed = false; seek(to); }
    }
    if (e.code === 'KeyL') $('layoutBtn').click();
    if (e.code === 'Space' && mode === 'watch' && $('endCard').hidden) { e.preventDefault(); $('playBtn').click(); }
  });

  // --- Touch and small screens --------------------------------------------------------------
  // "More": on phones the secondary buttons fold into a panel.
  $('moreBtn').addEventListener('click', () => {
    const open = document.body.classList.toggle('more-open');
    $('moreBtn').setAttribute('aria-expanded', String(open));
  });
  $('more').addEventListener('click', (e) => { if (e.target.closest('button') && e.target.id !== 'speedBtn') document.body.classList.remove('more-open'); });
  // The walking stick (Explore, touch): the knob's offset from the centre steers.
  {
    const stick = $('stick'), knob = stick.querySelector('.knob'), R = 44;
    let id = null;
    const move = (e) => {
      const r = stick.getBoundingClientRect();
      let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy); if (d > R) { dx *= R / d; dy *= R / d; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      const dead = (v) => (Math.abs(v) < 0.15 ? 0 : v);
      explorer.stick = { x: dead(dx / R), y: dead(-dy / R) };
    };
    const end = () => { id = null; knob.style.transform = ''; explorer.stick = { x: 0, y: 0 }; };
    stick.addEventListener('pointerdown', (e) => { e.stopPropagation(); id = e.pointerId; try { stick.setPointerCapture(id); } catch {} move(e); });
    stick.addEventListener('pointermove', (e) => { if (e.pointerId === id) move(e); });
    stick.addEventListener('pointerup', end);
    stick.addEventListener('pointercancel', end);
  }
  // Inspect a hotspot by tapping its label (the E key on a keyboard).
  $('prompt').addEventListener('click', () => { const h = mode === 'explore' && explorer.facing(active.hotspots); if (h) openCard(h); });
  // Landscape phones: the controls and timeline fade away while the story plays, and come back
  // on any touch (the first tap only brings them back).
  let lastTouch = performance.now();
  const chromeShown = () => !document.body.classList.contains('chrome-hidden');
  function wake() { lastTouch = performance.now(); document.body.classList.remove('chrome-hidden'); }
  setInterval(() => {
    const hide = document.body.dataset.form === 'landscape' && mode === 'watch' && ch && !audio.paused && $('sceneMenu').hidden
      && !document.body.classList.contains('more-open') && performance.now() - lastTouch > 4000;
    if (hide) document.body.classList.add('chrome-hidden');
  }, 500);
  addEventListener('keydown', wake);
  // In the story: a tap on the picture shows the controls (or, when they're showing on a touch
  // screen, plays or pauses); a swipe across the picture or the text moves a sentence on or back.
  let swipe = null, swiped = false;
  const startSwipe = (e) => { swipe = { x: e.clientX, y: e.clientY, t: performance.now(), shown: chromeShown() }; swiped = false; };
  function endSwipe(e, onPicture) {
    if (!swipe || !ch || mode !== 'watch') { swipe = null; return; }
    const dx = e.clientX - swipe.x, dy = e.clientY - swipe.y, quick = performance.now() - swipe.t < 600, wasShown = swipe.shown;
    swipe = null;
    if (quick && Math.abs(dx) > 50 && Math.abs(dy) < 40) {
      swiped = true;
      const to = skip(ch.sentences, audio.currentTime, dx < 0 ? 1 : -1, 1.5);
      if (to !== null) { endDismissed = false; seek(to); }
      return;
    }
    if (onPicture && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      wake();
      if (document.body.classList.contains('more-open')) { document.body.classList.remove('more-open'); return; }
      if (coarse && wasShown && $('endCard').hidden) $('playBtn').click();
    }
  }
  renderer.domElement.addEventListener('pointerdown', (e) => { if (mode === 'watch') startSwipe(e); wake(); });
  renderer.domElement.addEventListener('pointerup', (e) => endSwipe(e, true));
  $('page').addEventListener('pointerdown', (e) => { startSwipe(e); wake(); });
  $('page').addEventListener('pointerup', (e) => endSwipe(e, false));
  $('page').addEventListener('click', (e) => { if (swiped) { e.stopPropagation(); swiped = false; } }, true); // a swipe isn't a tap on a word
  addEventListener('pointerdown', (e) => { if (!e.target.closest('#controls')) wake(); });

  // Shift the picture away from the text so shots stay framed whatever the layout.
  // The window's form: 'portrait' (a phone held upright: the picture in a band at the top, the
  // text below), 'landscape' (a short screen: picture first, a two-line strip, controls folded
  // away), or 'wide' (computers, tablets). See style.css.
  const HFOV = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(22.5)) * 16 / 9); // a 45° shot on a 16:9 screen
  function resize() {
    const W = innerWidth, H = innerHeight;
    const form = H > W && W < 900 ? 'portrait' : H < 520 ? 'landscape' : 'wide';
    if (document.body.dataset.form !== form) {
      document.body.dataset.form = form;
      document.body.dataset.text = shownLayout();
      page?.setLayout(shownLayout());
      $('layoutBtn').hidden = form === 'portrait';
      document.body.classList.remove('more-open');
    }
    // Portrait: the picture is a 4:3-ish band, never more than 58% of the screen.
    const w = W, h = form === 'portrait' ? Math.round(Math.min(W * 0.8, H * 0.58)) : H;
    document.body.style.setProperty('--pic-h', `${h}px`);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep at least the width of view the shots were framed for (45° on 16:9), so a narrow or
    // tall picture shows more above and below instead of cutting off the sides.
    const minV = 2 * Math.atan(Math.tan(HFOV / 2) / camera.aspect);
    camera.fov = THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(minV), 45, 72);
    const l = shownLayout();
    if (mode === 'watch' && form === 'landscape' && l === 'bottom') camera.setViewOffset(w, h, 0, 0.14 * h, w, h); // lift the picture above the strip
    else if (mode === 'watch' && form !== 'portrait' && l === 'top') camera.setViewOffset(w, h, 0, -0.2 * h, w, h);
    else if (mode === 'watch' && form === 'wide' && l === 'side' && w > 700) camera.setViewOffset(w, h, 0.17 * w, 0.1 * h, w, h);
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
    for (const s of ch.scenes.slice(1)) {
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
    if (!ch) { renderer.clear(); return; }
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
      if (h) $('prompt').textContent = `${coarse ? 'Tap' : 'E'}: ${h.title}`;
    }

    const actors = active.actors(t);
    for (const [name, puppet] of Object.entries(cast)) puppet.apply(actors[name] ?? { visible: false }, camera);
    active.update?.(t, cast, camera); // after the cast, so props can follow a puppet's hand
    if (mode === 'watch') keepAliceInFrame();
    keepThoughtsInView(camera);

    lightUp(t);
    page.update(t);
    timeline.update(t);
    const turns = turnsAt(t);
    $('turn').style.opacity = turns.turn;
    $('dark').style.opacity = turns.dark;
    if (t < ch.cue.end) endDismissed = false;
    audio.volume = 1 - smooth((t - ch.cue.end) / 0.8);
    const f = mode !== 'watch' || endDismissed ? 0 : atEnd() ? 1 : smooth((t - ch.cue.end + 0.1) / 0.8);
    $('fade').style.opacity = f;
    $('endCard').hidden = f < 0.99;
    renderer.render(scene, camera);
    perf.tick(now);
  });

  // Exposed for automated checks (tools/smoke.mjs). Chapter I's sets are built up front
  // so checks can read its scenes before Begin is pressed.
  build(CHAPTERS[0]);
  window.__slice = {
    audio, setMode, setLayout, camera, perf, chapters: CHAPTERS, begin, explorer, cast,
    get chapter() { return chapter; },
    get scenes() { return (ch ?? CHAPTERS[0].built).scenes; },
    get cue() { return (ch ?? CHAPTERS[0].built).cue; },
    get ready() { return started && !switching; },
  };
}

main().catch((e) => {
  console.error(e);
  document.body.insertAdjacentHTML('beforeend', `<pre class="error">${e.message}</pre>`);
});
