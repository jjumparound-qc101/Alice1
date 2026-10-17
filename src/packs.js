// Art packs, for the playable web link only: a book's pictures stored in a few large files instead of
// hundreds of small ones, because a web link (a claude.ai artifact) holds at most 511 files and serves only
// web file types (no archives). engine/tools/pack_art.py (run by web_build.sh) writes each pack as a .json
// data file of its pictures' bytes (base64, by path) and packs/index.json, which maps each picture's path
// to its pack and type, and names the index in the page (window.ART_PACKS). Without it (the dev server, the
// desktop app) every picture loads from its own file.
let index = null;
const blobs = new Map(); // picture path -> Blob, while the book's art loads
const packs = new Map(); // pack name -> Promise, resolved once its pictures are in `blobs`
let queue = Promise.resolve(); // packs are read one at a time, so a phone never holds several at once

// Read the index, if this build has one.
export async function initPacks() {
  if (!globalThis.ART_PACKS) return;
  const r = await fetch(globalThis.ART_PACKS);
  if (!r.ok) throw new Error(`art packs: ${r.status}`);
  index = await r.json();
}

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
// picture has loaded).
export async function artUrl(path) {
  const key = path.replace(/^\.\//, ''), e = index?.files[key];
  if (!e) return path;
  if (!blobs.has(key)) {
    if (!packs.has(e.pack)) packs.set(e.pack, readPack(e.pack));
    await packs.get(e.pack);
  }
  return URL.createObjectURL(blobs.get(key));
}

// Let go of the packs' pictures once the book's art is made (a later request reads its pack again).
export function releasePacks() {
  blobs.clear();
  packs.clear();
}
