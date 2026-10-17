// The Library of Living Books engine: a book's text in sync with its narration, staged as a
// 2.5D toy theater. A book calls startBook(book) with its own chapters, art and cast (docs/ENGINE.md).
import { layoutThoughts } from './thoughts.js';
import * as THREE from 'three';
import { Puppet } from './puppet.js';
import { makeCues } from './cues.js';
import { smooth } from './track.js';
import { Page } from './narration.js';
import { Explorer } from './explore.js';
import { PerfMeter } from './perf.js';
import { sentenceStarts, skip, Timeline } from './navigate.js';
import { texture } from './ink.js';
import { COLOUR } from './stage.js';
import { initPacks, artUrl, releasePacks, byChapter, packedSize, chapterArt } from './packs.js';

const $ = (id) => document.getElementById(id);
const SPEEDS = [1, 1.25, 1.5, 2];

// A picture for the stage: { tex, aspect }. Books use it in their loadArt().
// On the web link its bytes may come from an art pack (packs.js). When the packs are grouped by chapter
// (packs.js, byChapter), the texture is made empty at once, its shape known from the index, and its
// picture loads when a chapter that shows it is opened (loadChapterArt), or late if a chapter shows it
// unexpectedly (the check in the render loop).
const lazy = new Map(); // url -> { tex, done } (loading by chapter)
export async function loadTexture(url) {
  const size = byChapter() && packedSize(url);
  if (size) {
    const known = lazy.get(url);
    if (known) return { tex: known.tex, aspect: size[0] / size[1] };
    const t = new THREE.Texture();
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.userData = { url, aspect: size[0] / size[1] };
    lazy.set(url, { tex: t, done: null });
    return { tex: t, aspect: size[0] / size[1] };
  }
  const src = await artUrl(url);
  const t = await new THREE.TextureLoader().loadAsync(src);
  if (src !== url) URL.revokeObjectURL(src);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.userData = { url };
  return { tex: t, aspect: t.image.width / t.image.height };
}
// Loading by chapter: a picture's bytes into its texture (once), and all of chapter n's pictures.
function fetchPicture(url) {
  const e = lazy.get(url);
  if (!e) return Promise.resolve();
  e.done ??= artUrl(url, { once: true }).then((src) => new Promise((ok, fail) => {
    const img = new Image();
    img.onload = () => { if (src !== url) URL.revokeObjectURL(src); e.tex.image = img; e.tex.needsUpdate = true; ok(); };
    img.onerror = () => fail(new Error(`picture ${url}`));
    img.src = src;
  }));
  return e.done;
}
function loadChapterArt(n, progress) {
  const urls = chapterArt(n);
  let k = 0;
  return Promise.all(urls.map((u) => fetchPicture(u).then(() => progress?.(++k, urls.length))));
}

// The reader's place: the chapter, and the time reached in each chapter, under the book's own
// key. Browser storage can be missing or blocked, so every access is guarded and the game works without it.
// upgrade(): the place from an older save format, when the current key is empty (optional, the book's).
const placeStore = (SAVE_KEY, upgrade) => ({
  load() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY)) ?? upgrade?.() ?? null;
    } catch { return null; }
  },
  save(chapter, t) {
    try {
      const p = this.load() ?? { times: {} };
      p.chapter = chapter;
      p.times[chapter] = t;
      p.at = Date.now(); // when, so a reload soon after puts the reader straight back (see below)
      localStorage.setItem(SAVE_KEY, JSON.stringify(p));
    } catch {}
  },
});
const play = (audio) => audio.play().catch(() => {}); // interrupted by pause(): expected
const clock = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

// Start the book. `book`: {
//   chapters,            the book's chapters (see docs/ENGINE.md): n, label, roman, title, narrated, audio, words, scenes, tints, tailpiece
//   storage: { place, speed, upgrade? },   localStorage keys, e.g. 'carol.place.v1'; upgrade() reads an older save
//   loadArt(loadTexture) -> { ai, extras }   shared art by name, and anything else the scenes' build() needs
//   cast({ ai, art, drawn, Puppet, extras }) -> { name: Puppet }   the puppets shared by every chapter
//   lead,                the cast member the camera keeps in the picture and thought vignettes sit beside
// }
export function startBook(book) {
  run(book).catch((e) => {
    console.error(e);
    document.body.insertAdjacentHTML('beforeend', `<pre class="error">${e.message}</pre>`);
  });
}

async function run(book) {
  const CHAPTERS = book.chapters;
  const place = placeStore(book.storage.place, book.storage.upgrade);
  const SPEED_KEY = book.storage.speed;
  const renderer = new THREE.WebGLRenderer({ canvas: $('stage'), antialias: true });
  // Touch screens (phones, tablets) render at a lower resolution, to stay smooth and cool.
  const coarse = matchMedia('(pointer: coarse)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.5 : 2));
  renderer.localClippingEnabled = true; // lets a figure fade part by part (clipping planes)
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#efe9da', 9, 34);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.02, 80);

  // The book's shared art (by name) and whatever else its scenes need, and every narrated chapter's word timings.
  // On the web link the pictures come from art packs (packs.js); the packs are let go once all are made,
  // keeping only the end cards' tailpieces (object URLs, for their <img>).
  // Grouped by chapter, the pictures load as their chapters open instead (loadChapterArt), and the
  // tailpieces when their end card is set.
  const narrated = CHAPTERS.filter((c) => c.narrated);
  await initPacks();
  const byChap = byChapter();
  const [wordsList, loaded] = await Promise.all([
    Promise.all(narrated.map((c) => fetch(c.words).then((r) => r.json()))),
    book.loadArt ? book.loadArt(loadTexture) : {},
    ...(byChap ? [] : CHAPTERS.filter((c) => c.tailpiece).map(async (c) => { c.tailpiece = await artUrl(c.tailpiece); })),
  ]);
  if (!byChap) releasePacks();
  const ai = loaded.ai ?? {}, extras = loaded.extras ?? {};
  // engine/tools/art_usage.mjs: a record of the pictures each chapter shows (window.__artUsage, set by the
  // tool before the page loads): what its scenes take from `ai`, and what is on stage at each moment.
  const usage = window.__artUsage ? (window.__artUsage.chapters = {}) : null;
  const note = (n, tex) => { const u = tex?.userData?.url; if (u) (usage[n] ??= new Set()).add(u); };
  const watchAi = (n) => new Proxy(ai, { get: (o, k) => { const v = o[k]; note(n, v?.tex ?? v); return v; } });
  // Loading by chapter: a note on the start screen while the first chapter's pictures load, and a card
  // over the page when a chapter is opened before its pictures are in.
  const loadingNote = document.createElement('p');
  loadingNote.className = 'loading-note';
  $('intro').append(loadingNote);
  const loadingCard = document.createElement('div');
  loadingCard.id = 'loading';
  loadingCard.hidden = true;
  document.body.append(loadingCard);
  const showLoading = (el, text) => (k, n) => { el.textContent = k < n ? `${text} ${Math.round(100 * k / n)}%` : ''; };
  // Lettering on props and title pages is drawn to canvas, so the fonts must be loaded first.
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
      return { def, group, start: c.starts[i], ...def.build({ group, ai: usage ? watchAi(c.n) : ai, cue: c.cue, ...extras }) };
    });
    const words = c.wordsData;
    const flat = words.paragraphs.flat();
    const sentences = sentenceStarts(words);
    const lastSentence = flat.filter((w) => w.s >= sentences[sentences.length - 1]).map((w) => w.t).join(' ');
    c.built = { scenes, cue: c.cue, words, sentences, sceneStarts: c.marks.map((m) => m.t), lastSentence };
    return c.built;
  }

  // Helpers for the cast below. A pose drawn in code: { tex, aspect, height, facesLeft }.
  const drawn = (c, height) => ({ tex: texture(c), aspect: c.width / c.height, height, facesLeft: true });
  // A pose from an AI drawing in `ai`.
  const art = (name, height, facesLeft = true) => ({ ...ai[name], height, facesLeft });
  // Watch mode: if the lead is partly in the shot but cut by its edge (or hidden under the text
  // strip), turn the camera just enough to take him in. Shots that leave him out altogether
  // (close-ups, his point of view, other characters) are left alone. (Owner, Alice project 2026-10-13.)
  const corner = new THREE.Vector3();
  // The lead's box on screen (CSS pixels), from points on his card; null if he isn't in the cast,
  // isn't shown or is behind the camera. Also the box in view coordinates (-1..1), for keepLeadInFrame.
  function leadOnScreen() {
    const al = cast[LEAD], flat = al?.poses[al.pose];
    if (!al || !al.root.visible || !flat) return null;
    camera.updateMatrixWorld();
    const [w, h] = flat.userData.size;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, inside = 0, n = 0;
    for (const u of [0.15, 0.5, 0.85]) for (const v of [0.05, 0.5, 0.95]) {
      flat.localToWorld(corner.set((u - 0.5) * w, v * h, 0)).project(camera);
      if (corner.z > 1) return null;
      n++; if (Math.abs(corner.x) <= 1 && corner.y <= 1 && corner.y >= -0.4) inside++;
      x0 = Math.min(x0, corner.x); x1 = Math.max(x1, corner.x); y0 = Math.min(y0, corner.y); y1 = Math.max(y1, corner.y);
    }
    const r = renderer.domElement.getBoundingClientRect(), W = r.width, H = r.height; // the picture on screen (a band on portrait phones)
    return { ndc: { x0, x1, y0, y1 }, inside, n, px: { x: r.left + (x0 + 1) / 2 * W, y: r.top + (1 - y1) / 2 * H, w: (x1 - x0) / 2 * W, h: (y1 - y0) / 2 * H } };
  }
  // Watch mode: if the lead is partly in the shot but cut by its edge (or hidden under the text strip),
  // turn the camera just enough to take him in. The turn is eased in and out over about half a
  // second (owner, Alice project 2026-10-14: it used to snap on and off, which made the camera jerk).
  const nudge = { yaw: 0, pitch: 0, last: 0 };
  // The highest head on screen (view coordinates) among the other figures standing in the picture.
  function othersTop() {
    let top = -1;
    for (const [name, p] of Object.entries(cast)) {
      const flat = p.poses[p.pose];
      if (name === LEAD || !p.root.visible || !flat) continue;
      const [w, h] = flat.userData.size;
      const feet = flat.localToWorld(corner.set(0, 0.05 * h, 0)).project(camera);
      if (feet.z > 1 || Math.abs(feet.x) > 1 || feet.y > 1) continue; // behind, beside or above the shot
      const head = flat.localToWorld(corner.set(0, 0.95 * h, 0)).project(camera);
      if (head.z <= 1 && Math.abs(head.x) <= 1) top = Math.max(top, head.y);
    }
    return top;
  }
  function keepLeadInFrame(dt, seeked) {
    // Measured against the shot as directed (before this frame's turn), so the target is absolute.
    const a = leadOnScreen();
    let yaw = 0, pitch = 0;
    if (a && a.inside > 0 && a.inside < a.n) {
      const { x0, x1, y0, y1 } = a.ndc, M = 0.92, BOTTOM = -0.38;
      let dx = 0, dy = 0;
      if (x1 - x0 < 2 * M) dx = x1 > M ? x1 - M : x0 < -M ? x0 + M : 0;
      if (y1 - y0 < M - BOTTOM) dy = y0 < BOTTOM ? y0 - BOTTOM : y1 > M ? y1 - M : 0;
      // Tilting down to lift the lead out from under the text must not cut off the head of anyone
      // else in the shot (owner, pp1 2026-10-17: heads cropped in close two-shots).
      if (dy < 0) dy = Math.max(dy, Math.min(0, othersTop() - 0.98));
      const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), cap = 0.3;
      yaw = -THREE.MathUtils.clamp(Math.atan(dx * tanV * camera.aspect), -cap, cap);
      pitch = THREE.MathUtils.clamp(Math.atan(dy * tanV), -cap, cap);
    }
    const k = seeked ? 1 : 1 - Math.exp(-dt / 0.6);
    nudge.yaw += (yaw - nudge.yaw) * k;
    nudge.pitch += (pitch - nudge.pitch) * k;
    camera.rotateY(nudge.yaw);
    camera.rotateX(nudge.pitch);
  }
  // The picture free of the text strip and the controls, for the thought bubbles.
  function freeView() {
    const pic = renderer.domElement.getBoundingClientRect();
    let top = pic.top, bottom = pic.bottom;
    for (const id of ['page', 'controls', 'timeline']) {
      const el = document.getElementById(id); if (!el || el.offsetParent === null) continue;
      const r = el.getBoundingClientRect(); if (r.height === 0 || r.width < innerWidth * 0.3) continue;
      if (r.top >= pic.bottom || r.bottom <= pic.top) continue; // not over the picture
      if (r.top > pic.top + pic.height * 0.45) bottom = Math.min(bottom, r.top - 6); else if (r.bottom < pic.top + pic.height * 0.55) top = Math.max(top, r.bottom + 6);
    }
    return { x: pic.left, y: top, w: pic.width, h: Math.max(80, bottom - top) };
  }

  // The cast: paper-cutout puppets shared by every chapter, posed by each scene's actors(t). The lead
  // (Alice, Scrooge) is the figure the camera keeps in the picture and the thought vignettes sit beside.
  const LEAD = book.lead;
  const cast = book.cast ? book.cast({ ai, art, drawn, Puppet, extras }) : {};
  Object.values(cast).forEach((p) => scene.add(p.root));

  const audio = $('narration');
  const explorer = new Explorer(camera, renderer.domElement, null);

  // The open chapter (a stave in the Carol). Everything that differs between chapters hangs off `ch`.
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
    if (byChap) { // its pictures first (a card while they load); then the next chapter's, unseen
      loadingCard.hidden = false;
      await loadChapterArt(c.n, showLoading(loadingCard, `Turning to ${c.label} ${c.roman}…`));
      loadingCard.hidden = true;
      loadingCard.textContent = '';
    }
    // Free the pictures held on the graphics card (owner, Alice project 2026-10-14: the tab ran out of
    // memory late in the book and the browser reloaded the page). Textures upload again by themselves when next shown.
    if (chapter) freeTextures();
    chapter = c;
    ch = build(c);
    if (active) { active.group.visible = false; active = null; }
    page = new Page($('page'), ch.words, (t) => { audio.currentTime = t; if (mode === 'watch') play(audio); }, c.tints);
    page.setLayout(shownLayout());
    timeline.set(ch.cue.end + 0.9, c.marks);
    const next = CHAPTERS[c.n];
    $('endQuote').textContent = `“${ch.lastSentence.replace(/^[“"]|[”"]$/g, '')}”`;
    $('endTail').hidden = !c.tailpiece; // under the chapter's last line
    if (usage && c.tailpiece) (usage[c.n] ??= new Set()).add(c.tailpiece);
    if (c.tailpiece) (byChap ? artUrl(c.tailpiece) : Promise.resolve(c.tailpiece)).then((u) => { if (chapter === c) $('endTail').src = u; });
    $('endTitle').textContent = `${c.label} ${c.roman} complete`;
    $('endSub').textContent = c.title;
    const last = ch.scenes[ch.scenes.length - 1];
    $('endExplore').hidden = !last.bounds;
    $('endExplore').textContent = `Explore ${last.def.title.replace(/^The /, 'the ')}`;
    $('endNext').disabled = !next?.narrated;
    $('endNext').textContent = next ? `Continue to ${next.label} ${next.roman}` : 'The end';
    $('endNext').title = next && !next.narrated ? `${next.label} ${next.roman} is not ready yet` : '';
    endDismissed = false;
    audio.src = c.audio;
    audio.defaultPlaybackRate = audio.playbackRate = speed;
    await new Promise((ok) => audio.addEventListener('loadedmetadata', ok, { once: true }));
    switching = false;
    if (byChap && CHAPTERS[c.n]?.narrated) loadChapterArt(CHAPTERS[c.n].n);
  }

  function setMode(m) {
    if (m === 'explore' && !active?.bounds) return; // e.g. mid-fall: nowhere to stand
    mode = m;
    document.body.dataset.mode = m;
    $('modeBtn').textContent = m === 'watch' ? 'Explore' : 'Back to the story';
    if (m === 'explore') { audio.pause(); explorer.bounds = active.bounds; explorer.enter(); }
    else { explorer.exit(); closeCard(); if (atEnd()) endDismissed = false; else play(audio); }
    // After pausing, so Explore's play button reads Play, not Pause.
    $('playBtn').textContent = m === 'explore' && document.body.dataset.form !== 'wide' ? 'Back to the story' : audio.paused ? 'Play' : 'Pause';
    resize();
  }

  function openCard(h) {
    shown = h;
    $('cardTitle').textContent = h.title;
    $('cardText').textContent = h.text;
    $('card').hidden = false;
  }
  function closeCard() { shown = null; $('card').hidden = true; }

  function freeTextures() {
    const seen = new Set();
    scene.traverse((o) => {
      for (const m of [o.material].flat()) {
        if (!m) continue;
        for (const v of Object.values(m)) if (v?.isTexture && !seen.has(v)) { seen.add(v); v.dispose(); }
      }
    });
  }
  // If the graphics card resets (a phone under memory pressure), keep the page and redraw.
  renderer.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault());

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

  // The contents: one row per chapter, all alike (its number and title; it plays the chapter from the
  // start), and under the chapter being read, its scenes (owner, pp1 2026-10-17: the menu listed the
  // scenes of every chapter, some boxed and some not, and was long and uneven). From the controls
  // (pausing the reading) and on the start screen; it opens at the chapter being read.
  const sceneButtons = [], rows = [];
  const list = document.createElement('ol');
  list.className = 'chapters';
  for (const c of CHAPTERS) {
    const li = document.createElement('li');
    const hb = document.createElement('button');
    hb.className = 'chapter';
    hb.innerHTML = '<span class="num"></span><span class="name"></span>';
    hb.children[0].textContent = c.roman;
    hb.children[1].textContent = c.narrated ? c.title : `${c.title} (coming)`;
    hb.disabled = !c.narrated;
    hb.addEventListener('click', () => begin(c, 0));
    li.append(hb);
    let ol = null;
    if (c.narrated && c.marks && c.marks.length > 1) {
      ol = document.createElement('ol');
      ol.className = 'scenes';
      ol.hidden = true;
      c.marks.forEach((m) => {
        const sli = document.createElement('li');
        const b = document.createElement('button');
        b.innerHTML = '<span></span><span></span>';
        b.children[0].textContent = m.title;
        b.children[1].textContent = clock(m.t);
        b.addEventListener('click', () => begin(c, m.t));
        sceneButtons.push({ b, c, m });
        sli.append(b);
        ol.append(sli);
      });
      li.append(ol);
    }
    rows.push({ c, hb, ol });
    list.append(li);
  }
  $('contents').append(list);
  let menuResume = false;
  function openMenu() {
    menuResume = !audio.paused;
    audio.pause();
    const t = audio.currentTime;
    const here = chapter?.marks.reduce((cur, m) => (t >= m.t ? m : cur), chapter.marks[0]);
    sceneButtons.forEach(({ b, m }) => b.classList.toggle('here', m === here));
    for (const r of rows) {
      r.hb.classList.toggle('here', r.c === chapter);
      if (r.ol) r.ol.hidden = r.c !== chapter;
    }
    $('sceneMenu').hidden = false;
    rows.find((r) => r.c === chapter)?.hb.scrollIntoView({ block: 'center' });
  }
  function closeMenu(resume = menuResume) {
    $('sceneMenu').hidden = true;
    if (resume && ch && mode === 'watch' && $('intro').hidden && !atEnd()) play(audio);
  }
  $('scenesBtn').addEventListener('click', () => ($('sceneMenu').hidden ? openMenu() : closeMenu()));
  $('contentsIntro').addEventListener('click', openMenu);
  $('sceneClose').addEventListener('click', () => closeMenu());

  // Start screen: continue where the reader left off, or begin at the first chapter.
  const saved = place.load();
  const savedCh = CHAPTERS.find((c) => c.n === saved?.chapter && c.narrated);
  const savedT = savedCh ? saved.times?.[savedCh.n] ?? 0 : 0;
  if (savedCh && (savedT > 5 || savedCh.n > 1) && savedT < savedCh.cue.end - 2) {
    const sceneTitle = savedCh.marks.reduce((cur, m) => (savedT >= m.t ? m : cur), savedCh.marks[0]).title;
    $('continue').hidden = false;
    $('continue').textContent = `Continue (${savedCh.label} ${savedCh.roman}: ${sceneTitle}, ${clock(savedT)})`;
    $('continue').addEventListener('click', () => begin(savedCh, savedT));
  }
  $('begin').addEventListener('click', () => begin(CHAPTERS[0], 0));
  // A reload within 15 minutes of reading (the page updated, or the browser reloaded it) goes straight
  // back to the place, paused, instead of the start screen (owner, 2026-10-14). Browsers allow sound
  // only after a tap, so the reader presses Play.
  if (savedCh && saved.at && Date.now() - saved.at < 15 * 60e3 && savedT < savedCh.cue.end - 2) {
    $('intro').hidden = true;
    openChapter(savedCh).then(() => { audio.currentTime = savedT; started = true; wake(); });
  }
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
    // Portrait: the picture takes what the text doesn't need. The text keeps room for about eight
    // lines (a longer passage scrolls) above the controls; the picture is between 4:3 and 1:1.35
    // (width to height), so it no longer leaves the bottom third of a tall phone blank (owner,
    // Alice 2026-10-17: the picture was only the top third with blank space below the text).
    let h = H;
    if (form === 'portrait') {
      const lh = parseFloat(getComputedStyle($('page')).lineHeight) || 28;
      h = Math.round(Math.max(W * 0.75, Math.min(W * 1.35, H * 0.7, H - 106 - 8 * lh - 18)));
    }
    const w = W;
    document.body.style.setProperty('--pic-h', `${h}px`);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep at least the width of view the shots were framed for (45° on 16:9), so a narrow or
    // tall picture shows more above and below instead of cutting off the sides.
    // An upright phone's picture keeps 90% of that width (a little closer, so figures aren't tiny)
    // and may look further above and below.
    const keep = form === 'portrait' ? 0.9 : 1;
    const minV = 2 * Math.atan(Math.tan(HFOV / 2) * keep / camera.aspect);
    camera.fov = THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(minV), 45, form === 'portrait' ? 84 : 72);
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
  let last = performance.now(), smoothT = 0, lateCheck = 0;
  const perf = new PerfMeter(renderer);
  renderer.setAnimationLoop((now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!ch) { renderer.clear(); return; }
    // A steady clock (owner, 2026-10-14: jerky motion): some browsers report the narration's time in
    // uneven steps; the picture follows a clock that runs smoothly with the frames and is gently
    // pulled to the narration (snapping to it after a seek or a pause).
    const at = audio.currentTime;
    if (audio.paused || Math.abs(at - smoothT) > 0.3) smoothT = at;
    else smoothT += dt * audio.playbackRate + (at - smoothT) * 0.08;
    const t = smoothT;
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
    // A jump in narration time (a seek, a new chapter) resets the eased camera turn at once.
    const seeked = Math.abs(t - nudge.last) > 0.5; nudge.last = t;
    if (mode === 'watch') keepLeadInFrame(dt, seeked);
    const al = leadOnScreen();
    layoutThoughts(freeView(), al && al.inside > 0 ? al.px : null);

    COLOUR.value = active.colour ? active.colour(t) : 1; // how much colour shows (scenes that drain it, Carol)
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
    if (byChap && now - lateCheck > 500) { // a picture this chapter shows that its record missed: load it now
      lateCheck = now;
      scene.traverseVisible((o) => { for (const m of [o.material].flat()) if (m?.map?.userData?.url && !m.map.image && !lazy.get(m.map.userData.url)?.done) { console.info(`picture loaded late: ${m.map.userData.url}`); fetchPicture(m.map.userData.url); } });
    }
    renderer.render(scene, camera);
    perf.tick(now);
  });

  // Exposed for automated checks (tools/smoke.mjs). The first chapter's sets are built up front
  // so checks can read its scenes before Begin is pressed.
  if (byChap) await loadChapterArt(CHAPTERS[0].n, showLoading(loadingNote, 'Preparing the pictures…'));
  build(CHAPTERS[0]);
  if (byChap && CHAPTERS[1]?.narrated) loadChapterArt(CHAPTERS[1].n);
  // engine/tools/art_usage.mjs: pose the open chapter at time t (no drawing) and note every picture on stage.
  function recordArtAt(t) {
    show(sceneAt(t));
    const c = active.camera(t);
    camera.position.set(...c.pos);
    camera.lookAt(look.set(...c.look));
    const actors = active.actors(t);
    for (const [name, puppet] of Object.entries(cast)) puppet.apply(actors[name] ?? { visible: false }, camera);
    active.update?.(t, cast, camera);
    scene.traverseVisible((o) => { for (const m of [o.material].flat()) if (m) for (const v of Object.values(m)) if (v?.isTexture) note(chapter.n, v); });
  }
  window.__slice = {
    recordArtAt, usage: () => usage && Object.fromEntries(Object.entries(usage).map(([n, s]) => [n, [...s]])),
    colour: COLOUR,
    audio, setMode, setLayout, camera, perf, chapters: CHAPTERS, begin, explorer, cast, lead: LEAD,
    get chapter() { return chapter; },
    get scenes() { return (ch ?? CHAPTERS[0].built).scenes; },
    get cue() { return (ch ?? CHAPTERS[0].built).cue; },
    get ready() { return started && !switching; },
    scene: () => active?.def?.id, // for tools/jerk_report.mjs
  };
}

