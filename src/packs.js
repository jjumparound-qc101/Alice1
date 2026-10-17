// Art packs, for the playable web link only: a book's pictures stored in a few large files instead of
// hundreds of small ones, because a web link (a claude.ai artifact) holds at most 511 files.
// engine/tools/pack_art.py (run by web_build.sh) writes packs/index.json, which maps each picture's path
// to its pack (an uncompressed .zip), the offset of its bytes and their length, and names it in the page
// (window.ART_PACKS). Without it (the dev server, the desktop app) every picture loads from its own file.
let index = null;
const packs = new Map(); // pack name -> Promise<ArrayBuffer>

// Read the index, if this build has one.
export async function initPacks() {
  if (!globalThis.ART_PACKS) return;
  const r = await fetch(globalThis.ART_PACKS);
  if (!r.ok) throw new Error(`art packs: ${r.status}`);
  index = await r.json();
}

// A URL for a picture: its own path, or an object URL for its bytes in a pack (revoke it once the
// picture has loaded).
export async function artUrl(path) {
  const e = index?.files[path.replace(/^\.\//, '')];
  if (!e) return path;
  if (!packs.has(e.pack)) {
    packs.set(e.pack, fetch(`packs/${e.pack}`).then((r) => {
      if (!r.ok) throw new Error(`art pack ${e.pack}: ${r.status}`);
      return r.arrayBuffer();
    }));
  }
  const buf = await packs.get(e.pack);
  return URL.createObjectURL(new Blob([new Uint8Array(buf, e.at, e.size)], { type: e.type }));
}

// Let go of the packs' bytes once the pictures are made (a later request fetches its pack again).
export function releasePacks() {
  packs.clear();
}
