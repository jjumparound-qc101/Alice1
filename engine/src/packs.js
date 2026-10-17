// Art packs, for the playable web link only: a book's pictures stored in a few large files instead of
// hundreds of small ones, because a web link (a claude.ai artifact) holds at most 511 files and serves only
// web file types (no archives). engine/tools/pack_art.py (run by web_build.sh) writes each pack as a .json
// data file of its pictures' bytes (base64, by path) and packs/index.json, which maps each picture's path
// to its pack, type and size, and names the index in the page (window.ART_PACKS). Without it (the dev
// server, the desktop app) every picture loads from its own file.
// When the book has a record of which pictures each chapter shows (data/art_usage.json, made by
// engine/tools/art_usage.mjs), the packs are grouped by chapter and the index carries that record
// (`usage`): the game then loads a chapter's pictures only when the chapter is opened (main.js).
let index = null;
const blobs = new Map(); // picture path -> Blob, until it is made into a picture
const packs = new Map(); // pack name -> Promise, resolved once its pictures are in `blobs`
let queue = Promise.resolve(); // packs are read one at a time, so a phone never holds several at once
const key = (path) => path.replace(/^\.\//, '');

// Read the index, if this build has one.
export async function initPacks() {
  if (!globalThis.ART_PACKS) return;
  const r = await fetch(globalThis.ART_PACKS);
  if (!r.ok) throw new Error(`art packs: ${r.status}`);
  index = await r.json();
}

// Loading by chapter: whether this build can, a picture's size [w, h] without loading it, and the
// pictures chapter n shows (paths), from the index.
export const byChapter = () => !!index?.usage;
export const packedSize = (path) => index?.files[key(path)]?.size ?? null;
export const chapterArt = (n) => index?.usage?.[n] ?? [];

const decode = (b64) => {
  if (Uint8Array.fromBase64) return Uint8Array.fromBase64(b64);
  const s = atob(b64), bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
  return bytes;
};

function readPack(name) {
  const done = queue.then(async () => {
    const r = await fetch(`packs/${name}`);
    if (!r.ok) throw new Error(`art pack ${name}: ${r.status}`);
    for (const [path, b64] of Object.entries((await r.json()).files)) blobs.set(path, new Blob([decode(b64)], { type: index.files[path].type }));
  });
  queue = done.catch(() => {});
  return done;
}

// A URL for a picture: its own path, or an object URL for its bytes from a pack (revoke it once the
// picture has loaded). `once`: the picture won't be asked for again, so its bytes are let go now.
export async function artUrl(path, { once = false } = {}) {
  const k = key(path), e = index?.files[k];
  if (!e) return path;
  if (!blobs.has(k)) {
    if (!packs.has(e.pack)) packs.set(e.pack, readPack(e.pack));
    await packs.get(e.pack);
    if (!blobs.has(k)) { const again = readPack(e.pack); packs.set(e.pack, again); await again; } // its bytes were let go: read it again
  }
  const url = URL.createObjectURL(blobs.get(k));
  if (once) blobs.delete(k);
  return url;
}

// Let go of the packs' pictures once the book's art is made (a later request reads its pack again).
export function releasePacks() {
  blobs.clear();
  packs.clear();
}
