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
    // Notes 1.0: the hop into the hole, the Rabbit far down the passage, the dark turn into
    // the hall, the key in her hand, and the thought vignettes.
    ['30-rabbit-hop', rb.pop + 0.1], ['31-alice-hop', rb.downWent + 1.1], ['32-passage-rabbit-far', pa.thump + 3],
    ['33-dark-turn', ha.hall - 1.2], ['34-lamps-lighting', ha.hall], ['35-key-in-hand', ha.tryKey + 1],
    ['36-dinah', sh.dinah + 2], ['37-cats-bats', sh.cats + 4], ['38-knife', ha.finger + 1], ['39-poison', ha.poison + 1],
    ['40-candle', ha.candle + 1], ['41-rabbit-idle', rb.hurried + 6], ['42-hall-walk', ha.doors + 2], ['43-run', rb.ranAcross + 2], ['44-hall-walk-b', ha.doors + 2.5], ['45-alice-takeoff', rb.downWent + 0.95],
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
