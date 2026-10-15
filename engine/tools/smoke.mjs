// Smoke test: load the game in headless Chromium, open every narrated chapter, step through
// moments across it, try Explore where a scene allows it, shoot a phone page, save
// screenshots, and fail on any console error.
// Usage: npm run dev   (in another shell, in the book's folder)
//        node engine/tools/smoke.mjs [url] [outDir]
// A book can keep its own fuller check (key moments in each scene) in its own tools/ folder.
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
await page.waitForFunction(() => window.__slice, null, { timeout: 120000 }); // the shared art and cast are ready
await page.screenshot({ path: `${out}/00-intro.png` });
await page.click('#begin', { timeout: 120000 });
await page.waitForFunction(() => window.__slice?.ready, null, { timeout: 120000 });

const chapters = await page.evaluate(() => window.__slice.chapters.filter((c) => c.narrated).map((c) => c.n));
for (const n of chapters) {
  await page.evaluate((n) => window.__slice.begin(window.__slice.chapters[n - 1], 0), n);
  await page.waitForFunction((n) => window.__slice.ready && window.__slice.chapter?.n === n, n, { timeout: 120000 });
  // Five moments spread across the chapter, and its end card.
  const end = await page.evaluate(() => window.__slice.cue.end);
  for (const [name, t] of [...[0.02, 0.25, 0.5, 0.75, 0.98].map((k) => [`${Math.round(k * 100)}`, k * end]), ['end', end + 2]]) {
    await page.evaluate((t) => { const a = window.__slice.audio; a.pause(); a.currentTime = t; }, t);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${out}/s${n}-${name}.png` });
  }
}

// Explore: in the first scene that has somewhere to stand (none until scenes are built).
const explorable = await page.evaluate(() => {
  for (const c of window.__slice.chapters.filter((c) => c.narrated)) {
    const i = c.scenes.findIndex((s) => s.id !== 'title');
    if (i >= 0) return { n: c.n, t: c.starts[i] + 2 };
  }
  return null;
});
if (explorable) {
  await page.evaluate(({ n }) => window.__slice.begin(window.__slice.chapters[n - 1], 0), explorable);
  await page.waitForFunction(({ n }) => window.__slice.ready && window.__slice.chapter?.n === n, explorable);
  await page.evaluate(({ t }) => { window.__slice.audio.currentTime = t; }, explorable);
  await page.waitForTimeout(300);
  await page.keyboard.press('Tab');
  await page.keyboard.down('KeyW'); await page.waitForTimeout(600); await page.keyboard.up('KeyW');
  await page.screenshot({ path: `${out}/explore.png` });
  await page.keyboard.press('Tab');
}

// Phones: a portrait and a landscape page (tools/mobile_shots.mjs covers more devices and moments).
for (const [name, vp] of [['portrait', { width: 390, height: 844 }], ['landscape', { width: 844, height: 390 }]]) {
  const m = await browser.newPage({ viewport: vp, isMobile: true, hasTouch: true });
  m.on('console', (x) => x.type() === 'error' && errors.push(x.text()));
  m.on('pageerror', (e) => errors.push(String(e)));
  await m.goto(url);
  await m.waitForFunction(() => window.__slice, null, { timeout: 120000 });
  await m.click('#begin', { timeout: 120000 });
  await m.waitForFunction(() => window.__slice?.ready, null, { timeout: 120000 });
  await m.evaluate(() => { const a = window.__slice.audio; a.pause(); a.currentTime = 30; });
  await m.waitForTimeout(600);
  await m.screenshot({ path: `${out}/phone-${name}.png` });
  await m.close();
}

console.log(JSON.stringify({ chapters, errors }, null, 1));
await browser.close();
if (errors.length) process.exit(1);
