// Walk report: for every leg Alice walks in every scene, how far, how long, and how many
// steps a second her feet take, so no leg is a blur of legs.
// Usage: npm run dev; node tools/walk_report.mjs [url]
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader'] });
const p = await b.newPage();
await p.goto(process.argv[2] ?? 'http://localhost:5173/');
await p.click('#begin');
await p.waitForFunction(() => window.__slice?.ready);
const rows = await p.evaluate(() => {
  const out = [];
  for (const s of window.__slice.scenes) {
    let leg = null;
    const sc = window.__slice.scenes, i = sc.indexOf(s);
    const end = i + 1 < sc.length ? sc[i + 1].start : window.__slice.cue.end;
    for (let t = s.start; t < end; t += 0.05) {
      const a = s.actors(t).alice;
      if (!a) continue;
      const walking = a.moving && a.pose === 'stand' && a.visible !== false && a.dist !== undefined;
      if (walking && leg && a.dist < leg.dist) { out.push(leg); leg = null; } // a new leg began
      if (walking && !leg) leg = { scene: s.def.id, t0: t, scale: a.scale ?? 1 };
      if (walking) { leg.dist = a.dist; leg.t1 = t; }
      if (!walking && leg) { out.push(leg); leg = null; }
    }
  }
  return out;
});
for (const r of rows) {
  const steps = r.dist / (0.4 * 1.25 * r.scale);
  console.log(`${r.scene.padEnd(9)} t=${r.t0.toFixed(1).padStart(6)}  ${r.dist.toFixed(2)} m in ${(r.t1 - r.t0).toFixed(1)} s, scale ${r.scale.toFixed(2)}: ${(steps / (r.t1 - r.t0)).toFixed(1)} steps/s`);
}
await b.close();
