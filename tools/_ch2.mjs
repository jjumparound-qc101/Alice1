import { chromium } from 'playwright-core';
const out = process.argv[3];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 960, height: 540 } });
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type()==='error' && errs.push(m.text()));
await p.goto(process.argv[2]); await p.waitForTimeout(1500);
await p.evaluate(() => window.__slice.begin(window.__slice.chapters[1], 0));
await p.waitForFunction(() => window.__slice?.ready && window.__slice.chapter?.n === 2);
const T = await p.evaluate(() => window.__slice.scenes[0].T);
const ts = process.argv[4] ? process.argv[4].split(',').map(Number) : [
  1, 6, T.telescope + 1, T.feet, T.struck + 0.5, T.key + 0.5, T.hurried + 2, T.lying + 2, T.cry + 4, T.hall,
  T.pattering + 3, T.near - 3, T.please + 0.5, T.started + 0.3, T.skurried + 1, T.took + 1, T.fanning + 3, T.ada + 3,
  T.lap + 3, T.crocodile + 3, T.burst + 2, T.hands + 2, T.two, T.droppedFan + 1, T.ran + 2, T.shut + 0.5, T.keyOnTable + 1,
  T.slipped + 0.5, T.splash + 0.3, T.bathing + 2, T.swam + 3, T.walrus + 1, T.nearer + 8, T.leap + 0.4, T.purring + 3,
  T.terrier + 3, T.away + 3, T.turned + 7, T.crowded + 3, T.ledTheWay + 1,
];
let i = 0;
for (const t of ts) {
  await p.evaluate((t) => { const a = window.__slice.audio; a.pause(); a.currentTime = t; }, t);
  await p.waitForTimeout(450); await p.screenshot({ path: `${out}/p${String(i++).padStart(2, '0')}.png` });
}
console.log(JSON.stringify(errs)); await b.close();
