// The pictures each chapter shows, so the web link can load a book chapter by chapter (src/packs.js,
// tools/pack_art.py). Opens every narrated chapter on the dev server and steps through it (no drawing),
// noting the pictures its scenes take from the book's art and every picture on stage at each moment
// (main.js: window.__artUsage, __slice.recordArtAt). Run it again after changing a chapter's staging;
// a picture it missed still loads, a moment late (the check in main.js's render loop).
// Usage: node engine/tools/art_usage.mjs http://localhost:5173/ public/data/art_usage.json [step seconds = 0.1]
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const [url, out, stepArg] = process.argv.slice(2);
const step = Number(stepArg ?? 0.1);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const errs = [];
// Each chapter in a fresh page, as a reader opening it from the contents would: pictures an earlier
// chapter had already composed (Alice: the court's cards, made in VIII) are then recorded for this one too.
async function open() {
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  p.on('pageerror', (e) => errs.push(String(e)));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.addInitScript(() => { window.__artUsage = {}; });
  await p.goto(url);
  await p.waitForFunction(() => window.__slice?.recordArtAt, null, { timeout: 180000 });
  return p;
}
const first = await open();
const chapters = await first.evaluate(() => window.__slice.chapters.filter((c) => c.narrated).map((c) => c.n));
await first.close();
const usage = {};
for (const n of chapters) {
  const p = await open();
  await p.evaluate((n) => window.__slice.begin(window.__slice.chapters.find((c) => c.n === n), 0), n);
  await p.waitForFunction((n) => window.__slice.ready && window.__slice.chapter?.n === n, n, { timeout: 180000 });
  const end = await p.evaluate(() => { window.__slice.audio.pause(); return window.__slice.cue.end + 1; });
  await p.evaluate(({ end, step }) => { for (let t = 0; t <= end; t += step) window.__slice.recordArtAt(t); }, { end, step });
  // A fresh page also records the start screen's pictures under the chapter that opened first; keep
  // only this chapter's own list.
  usage[n] = await p.evaluate((n) => window.__slice.usage()[n] ?? [], n);
  console.log(`chapter ${n}: ${usage[n].length} pictures`);
  await p.close();
}
fs.writeFileSync(out, JSON.stringify(usage) + '\n');
console.log(`${out}: ${Object.keys(usage).length} chapters${errs.length ? `; errors: ${JSON.stringify(errs.slice(0, 5))}` : ''}`);
await b.close();
