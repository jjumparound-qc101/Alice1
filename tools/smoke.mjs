// Smoke test: load the slice in headless Chromium, step through key story
// moments and Explore mode, save screenshots, and fail on any console error.
// Usage: npm run dev   (in another shell)
//        node tools/smoke.mjs [url] [outDir]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const url = process.argv[2] ?? 'http://localhost:5173/';
const out = process.argv[3] ?? 'smoke-shots';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(url);
await page.screenshot({ path: `${out}/00-intro.png` });
await page.click('#begin');
await page.waitForFunction(() => window.__slice?.ready);

// Seek to moments across every scene, pause, let a few frames render.
const moments = await page.evaluate(() => {
  const [rb, sh, pa, ha] = window.__slice.scenes.map((s) => s.T);
  return [
    ['01-wide', 1], ['02-alice-and-sister', rb.alice + 7], ['03-rabbit-watch', rb.watch + 2.5], ['04-pop', rb.pop + 0.2],
    ['05-fall', sh.dipped + 6], ['06-jar', sh.jar + 1], ['07-landing', pa.jumped - 1], ['08-passage', pa.passage + 4],
    ['09-hall', ha.hall + 1], ['10-table-key', ha.key + 1], ['11-curtain-door', ha.fits + 2], ['12-garden', ha.knelt + 4],
    ['13-drink-me', ha.bottle + 2], ['14-poker', ha.poker], ['15-shrunk', ha.telescope + 6], ['16-key-through-glass', ha.forgotten + 9],
    ['17-crying', ha.sat + 2], ['18-eat-me', ha.box + 4], ['19-end', window.__slice.cue.end + 2],
  ];
});
for (const [name, t] of moments) {
  await page.evaluate((t) => { const a = window.__slice.audio; a.pause(); a.currentTime = t; }, t);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/${name}.png` });
}

// Explore mode: enter, walk forward, turn as far right as allowed, inspect the book.
await page.evaluate(() => { window.__slice.audio.currentTime = window.__slice.scenes[0].T.alice + 7; });
await page.waitForTimeout(300);
await page.keyboard.press('Tab');
await page.keyboard.down('KeyW'); await page.waitForTimeout(600); await page.keyboard.up('KeyW');
await page.screenshot({ path: `${out}/20-explore.png` });
await page.keyboard.down('ArrowRight'); await page.waitForTimeout(2500); await page.keyboard.up('ArrowRight');
await page.keyboard.down('KeyD'); await page.waitForTimeout(4000); await page.keyboard.up('KeyD');
await page.screenshot({ path: `${out}/21-explore-arc-limit.png` });
const cam = await page.evaluate(() => {
  const c = window.__slice.camera;
  return { x: c.position.x, z: c.position.z, yawDeg: (c.rotation.y * 180) / Math.PI };
});

console.log(JSON.stringify({ cam, errors }, null, 1));
await browser.close();
if (errors.length) process.exit(1);
