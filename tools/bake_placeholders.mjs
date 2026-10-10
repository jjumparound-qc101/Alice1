// Render the procedural placeholder art (src/art.js) to PNG files, so the Godot
// comparison build uses exactly the same art as the three.js build.
// Usage: npm run dev   (in another shell)
//        node tools/bake_placeholders.mjs [url] [outDir]
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const url = process.argv[2] ?? 'http://localhost:5173/';
const out = process.argv[3] ?? 'godot/art';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
await page.goto(url);
const files = await page.evaluate(async () => {
  await document.fonts.ready;
  const a = await import('/src/art.js');
  // Same proscenium geometry as src/stage.js.
  const PW = 12, PH = 7.2, CW = 2048, CH = Math.round((CW * PH) / PW);
  const open = { w: 8.4, h: 4.6, cy: 2.55 };
  const px = (m) => (m / PW) * CW, py = (m) => (m / PH) * CH;
  const canvases = {
    sky: a.sky(), treeline: a.treeLine(3), tree: a.bigTree(), hedge: a.hedge(0.45),
    grass5: a.grassStrip(5), grass6: a.grassStrip(6), ground: a.groundTile(),
    proscenium: a.proscenium(CW, CH, { x: px((PW - open.w) / 2), y: py(PH - open.cy - open.h / 2), w: px(open.w), h: py(open.h) }),
    alice_sit: a.aliceSitting(), alice_stand: a.aliceStanding(), sister_read: a.sisterReading(),
  };
  return Object.fromEntries(Object.entries(canvases).map(([k, c]) => [k, c.toDataURL('image/png')]));
});
for (const [name, data] of Object.entries(files)) {
  writeFileSync(`${out}/${name}.png`, Buffer.from(data.split(',')[1], 'base64'));
}
console.log(`baked ${Object.keys(files).length} images to ${out}`);
await browser.close();
