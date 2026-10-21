// Captures real rendered screens from a LOCAL run of the studiolo app's /dev/specimens pages (in-memory fixtures, no
// database, no AI). Read-only: it only loads pages and reads the DOM and the compiled CSS. Usage:
//   (in a local studiolo checkout) npx next dev -p 3311
//   STUDIOLO=/path/to/studiolo node capture/capture.cjs
const path = require('path');
const fs = require('fs');
const STUDIOLO = process.env.STUDIOLO || '/home/user/studiolo';
const { chromium } = require(path.join(STUDIOLO, 'node_modules/playwright'));
const BASE = process.env.BASE || 'http://localhost:3311';
const IA = '00000000-0000-4000-8000-000000000003'; // Islamic architecture
const FS = '00000000-0000-4000-8000-00000000001d'; // Facade systems
const DC = '00000000-0000-4000-8000-000000000012'; // Design & Composition
const graph = (q) => `/dev/specimens?graph=map&${q}`;
const SCREENS = [
  { name: 'graph', url: graph(`copilot=empty&xp=1&explain=1&topic=${IA}`) },
  { name: 'player', url: graph(`copilot=empty&xp=1&explain=1&topic=${IA}`), steps: [['click', 840, 806], ['wait', 800]], slides: true },
  { name: 'explain', url: graph(`copilot=empty&xp=1&explain=1&topic=${IA}`), steps: [['text', 'Explain']] },
  { name: 'facade', url: graph(`copilot=empty&topic=${FS}`) },
  { name: 'ghosts', url: graph(`copilot=ghosts&topic=${FS}`) },
  { name: 'ghostsKept', url: graph(`copilot=ghosts&topic=${FS}`), steps: [['text', 'Keep all'], ['wait', 1200]] },
  { name: 'tidy', url: graph(`copilot=tidy&topic=${DC}`) },
  { name: 'tidyApplied', url: graph(`copilot=tidy&topic=${DC}`), steps: [['text', 'Apply 3 changes'], ['wait', 1500]] },
  { name: 'library', url: '/dev/specimens?library=wall' },
  { name: 'today', url: '/dev/specimens?today=active' },
];
async function inlineImages(p) {
  await p.evaluate(async () => {
    const toData = async (u) => { try { const r = await fetch(u); const b = await r.blob(); return await new Promise((res) => { const f = new FileReader(); f.onload = () => res(f.result); f.readAsDataURL(b); }); } catch { return null; } };
    for (const img of document.querySelectorAll('img')) {
      const src = img.currentSrc || img.src; if (!src || src.startsWith('data:')) continue;
      const d = await toData(src); if (d) { img.src = d; img.removeAttribute('srcset'); img.removeAttribute('sizes'); }
    }
  });
}
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' });
  const out = { capturedFrom: BASE, screens: {}, slides: [], htmlClass: '', css: '' };
  const sheets = new Set();
  for (const s of SCREENS) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(BASE + s.url, { waitUntil: 'networkidle', timeout: 120000 });
    await p.waitForTimeout(2000);
    for (const [kind, a, c] of s.steps || []) {
      if (kind === 'click') await p.mouse.click(a, c);
      if (kind === 'text') await p.getByText(a, { exact: true }).first().click();
      if (kind === 'wait') await p.waitForTimeout(a);
      await p.waitForTimeout(700);
    }
    if (s.slides) {
      for (let i = 0; i < 14; i++) {
        const html = await p.evaluate(() => document.querySelector('.xp-slide-host')?.innerHTML ?? null);
        if (html && !out.slides.includes(html)) out.slides.push(html);
        await p.waitForTimeout(2000);
      }
    }
    await p.screenshot({ path: path.join(__dirname, `shots/${s.name}.png`) });
    await inlineImages(p);
    const snap = await p.evaluate(() => {
      const sheets = [...document.styleSheets].map((sh) => sh.href).filter(Boolean);
      document.querySelectorAll('script, next-route-announcer, nextjs-portal, link, template, .td-proto').forEach((e) => e.remove());
      return { body: document.body.innerHTML, htmlClass: document.documentElement.className,
        sheets };
    });
    out.screens[s.name] = snap.body;
    out.htmlClass = snap.htmlClass;
    snap.sheets.forEach((h) => sheets.add(h));
    await p.close();
    console.log(s.name, snap.body.length);
  }
  // The app's own compiled stylesheet (KaTeX's sheet is left out: no maths on these screens). Fonts are inlined, latin only.
  for (const h of sheets) {
    if (/katex/.test(h)) continue;
    let t = await (await fetch(h)).text();
    t = t.replace(/\/\*# sourceMappingURL=[^*]*\*\//g, '');
    t = t.replace(/@font-face\s*{[^}]*}/g, (rule) => (!/unicode-range/.test(rule) || /unicode-range:\s*U\+(\?\?|0-FF)/.test(rule) ? rule : ''));
    const urls = [...new Set([...t.matchAll(/url\(["']?([^"')]+\.woff2)["']?\)/g)].map((m) => m[1]))];
    for (const u of urls) {
      const buf = Buffer.from(await (await fetch(new URL(u, h).href)).arrayBuffer());
      t = t.split(u).join('data:font/woff2;base64,' + buf.toString('base64'));
    }
    out.css += t + '\n';
  }
  // Media the DOM still points at (lazy images, CSS backgrounds): inlined so the page needs no server.
  for (const [name, html] of Object.entries(out.screens)) {
    let h = html;
    for (const u of new Set(h.match(/\/dev\/specimen-media\/[^"'&) ]+/g) || [])) {
      const r = await fetch(BASE + u);
      if (!r.ok) continue;
      const type = r.headers.get('content-type') || 'image/webp';
      h = h.split(u).join(`data:${type};base64,` + Buffer.from(await r.arrayBuffer()).toString('base64'));
    }
    out.screens[name] = h;
  }
  fs.writeFileSync(path.join(__dirname, 'snap.json'), JSON.stringify(out));
  console.log('css', out.css.length, 'slides', out.slides.length);
  await b.close();
})();
