// Renders the generated stand-in (barjeel) with the Commonplace prototype's scene helpers. Needs three@0.160.0:
//   THREE=/path/to/node_modules/three/build/three.min.js node run.cjs
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const html = fs.readFileSync(path.join(__dirname, 'gen.html'), 'utf8').replace('THREE_PATH', 'file://' + process.env.THREE);
  fs.writeFileSync(path.join(__dirname, '.gen.tmp.html'), html);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage(); p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('file://' + path.join(__dirname, '.gen.tmp.html'));
  const r = await p.evaluate(() => window.renderOne({ id: 'barjeel', scene: 'barjeel', size: [2400, 1600] }));
  const out = path.join(__dirname, '../img');
  fs.writeFileSync(path.join(out, 'barjeel-gen.jpg'), Buffer.from(r.full.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(out, 'barjeel-gen-t.jpg'), Buffer.from(r.thumb.split(',')[1], 'base64'));
  console.log('barjeel', r.w + 'x' + r.h, r.palette.slice(0, 3).map(x => x.hex).join(' '));
  fs.unlinkSync(path.join(__dirname, '.gen.tmp.html'));
  await b.close();
})();
