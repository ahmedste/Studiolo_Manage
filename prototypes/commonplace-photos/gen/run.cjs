const { chromium } = require('playwright'); const fs = require('fs');
const specs = JSON.parse(fs.readFileSync('specs.json', 'utf8'));
const only = process.argv[2];
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage(); p.on('console', m => { if (m.type() === 'error') console.log('ERR', m.text()); }); p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('file://' + __dirname + '/gen.html');
  const meta = fs.existsSync('out/meta.json') ? JSON.parse(fs.readFileSync('out/meta.json')) : {};
  for (const s of specs) {
    if (only && !only.split(',').includes(s.id)) continue;
    const t0 = Date.now();
    const r = await p.evaluate((spec) => window.renderOne(spec), s);
    fs.writeFileSync(`out/${s.id}.jpg`, Buffer.from(r.full.split(',')[1], 'base64'));
    fs.writeFileSync(`out/${s.id}-t.jpg`, Buffer.from(r.thumb.split(',')[1], 'base64'));
    meta[s.id] = { w: r.w, h: r.h, palette: r.palette, lightness: r.lightness };
    console.log(s.id, r.w + 'x' + r.h, (Date.now() - t0) + 'ms', r.palette.slice(0, 3).map(x => x.hex).join(' '));
  }
  fs.writeFileSync('out/meta.json', JSON.stringify(meta, null, 1));
  await b.close();
})();
