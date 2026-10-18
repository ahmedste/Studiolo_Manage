import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const errs = [], seen = new Set();
const grab = async p => { (await p.evaluate(() => [...document.querySelectorAll('#mapView *, #mapView, body > *:not(.app) *')].flatMap(e => [...e.classList]))).forEach(c => seen.add(c)); };
for (const vp of [{ width: 1360, height: 860 }, { width: 390, height: 780, isMobile: true, hasTouch: true }]) {
  const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.isMobile, hasTouch: !!vp.hasTouch });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await p.goto('file://' + process.cwd() + '/' + (process.argv[2] || 'm.html')); await p.waitForTimeout(1500);
  await p.click('[data-view="map"]'); await p.waitForTimeout(1200); await grab(p);
  for (const name of ['History & Theory', 'Islamic architecture', 'Facade systems', 'Daylight & shading', 'Plan types & ritual']) {
    await p.evaluate(nm => setFocus(G.nodes.find(n => n.name === nm)), name); await p.waitForTimeout(900); await grab(p);
  }
  await p.evaluate(() => openAsk({ scope: G.nodes.find(n => n.name === 'Facade systems'), say: 'Suggest sub-topics for Facade systems' })); await p.waitForTimeout(1600); await grab(p);
  await p.evaluate(() => setFocus(G.nodes.find(n => n.name === 'Islamic architecture'))); await p.waitForTimeout(900);
  // hover a lane card, a badge, a node
  for (const sel of ['.graph-lib', '.graph-xbadge', '.graph-node', '.graph-xlane']) { const el = await p.$('#mapView ' + sel); if (el) { try { await el.hover(); await p.waitForTimeout(700); await grab(p); } catch (e) {} } }
  if (!vp.isMobile) await p.screenshot({ path: 'c1-desk.png' }); else await p.screenshot({ path: 'c2-phone.png' });
  await ctx.close();
}
fs.writeFileSync('classes.json', JSON.stringify([...seen].sort()));
console.log([...seen].length, 'classes'); console.log(errs.slice(0, 20).join('\n') || 'no errors'); await b.close();
