/* Sample pictures for the Commonplace photos prototype: rendered scenes, clay renders, drawings and material swatches. */
const T = THREE;
let seed = 1;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const rr = (a, b) => a + (b - a) * rnd();

/* ---------- canvas textures ---------- */
function canvasTex(w, h, draw, repeat = [1, 1]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace;
  t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); t.anisotropy = 8;
  return t;
}
function noise(g, w, h, base, amt, n = 9000, size = 2) {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) { const v = rnd() < .5 ? 0 : 255; g.fillStyle = `rgba(${v},${v},${v},${rnd() * amt})`; g.fillRect(rnd() * w, rnd() * h, size * rnd() + .5, size * rnd() + .5); }
}
const plasterTex = (col, rep = [3, 3]) => canvasTex(256, 256, (g, w, h) => noise(g, w, h, col, .06, 7000), rep);
const brickTex = (col, mortar, rep) => canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = mortar; g.fillRect(0, 0, w, h);
  const bh = 32, bw = 96;
  for (let y = 0; y < h; y += bh) for (let x = -((y / bh) % 2) * bw / 2; x < w; x += bw) {
    const k = rr(-18, 14); const c = new T.Color(col); c.offsetHSL(rr(-.012, .012), rr(-.05, .05), k / 255);
    g.fillStyle = '#' + c.getHexString(); g.fillRect(x + 3, y + 3, bw - 6, bh - 6);
  }
  for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(0,0,0,${rnd() * .08})`; g.fillRect(rnd() * w, rnd() * h, 2, 2); }
}, rep);
const paverTex = (col, rep) => canvasTex(512, 512, (g, w, h) => {
  noise(g, w, h, col, .05, 6000);
  g.strokeStyle = 'rgba(60,40,20,.25)'; g.lineWidth = 2;
  for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); }
}, rep);
const boardTex = (col, rep) => canvasTex(512, 512, (g, w, h) => {
  noise(g, w, h, col, .05, 5000);
  for (let y = 0; y < h; y += 42) { g.fillStyle = 'rgba(0,0,0,.07)'; g.fillRect(0, y, w, 2); }
}, rep);

/* ---------- scene basics ---------- */
let renderer;
function setup(w, h) {
  if (!renderer) {
    renderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.outputColorSpace = T.SRGBColorSpace;
    document.body.appendChild(renderer.domElement);
  }
  renderer.setPixelRatio(1); renderer.setSize(w, h, false);
  const scene = new T.Scene();
  return scene;
}
function sky(scene, top, horizon, fog) {
  scene.background = canvasTex(4, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(.62, horizon); gr.addColorStop(1, horizon); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.background.wrapS = scene.background.wrapT = T.ClampToEdgeWrapping; scene.background.repeat.set(1, 1);
  if (fog) scene.fog = new T.Fog(horizon, fog[0], fog[1]);
}
function sun(scene, pos, color = '#fff2dc', intensity = 3, size = 40, sky = '#cfe0ff', ground = '#8a7a66', hemi = .9) {
  const d = new T.DirectionalLight(color, intensity); d.position.set(...pos); d.castShadow = true;
  d.shadow.mapSize.set(4096, 4096); const c = d.shadow.camera; c.left = c.bottom = -size; c.right = c.top = size; c.near = 1; c.far = 300; d.shadow.bias = -0.0004; d.shadow.normalBias = 0.02; d.shadow.radius = 3;
  scene.add(d); scene.add(new T.HemisphereLight(sky, ground, hemi));
  return d;
}
const mat = (color, o = {}) => new T.MeshStandardMaterial({ color, roughness: .92, metalness: 0, ...o });
function add(scene, geo, m, x = 0, y = 0, z = 0, ry = 0) {
  const me = new T.Mesh(geo, m); me.position.set(x, y, z); me.rotation.y = ry; me.castShadow = true; me.receiveShadow = true; scene.add(me); return me;
}
function box(scene, w, h, d, m, x, y, z, ry) { return add(scene, new T.BoxGeometry(w, h, d), m, x, y + h / 2, z, ry); }
function ground(scene, m, size = 400) { const g = add(scene, new T.PlaneGeometry(size, size), m); g.rotation.x = -Math.PI / 2; g.castShadow = false; return g; }

/* An arcade wall: width, height, depth, arch count, arch width, spring height. */
function arcadeGeo(len, h, depth, n, aw, spring) {
  const s = new T.Shape(); s.moveTo(-len / 2, 0); s.lineTo(len / 2, 0); s.lineTo(len / 2, h); s.lineTo(-len / 2, h); s.lineTo(-len / 2, 0);
  const step = len / n;
  for (let i = 0; i < n; i++) {
    const cx = -len / 2 + step * (i + .5); const p = new T.Path(); const r = aw / 2;
    p.moveTo(cx - r, 0.0001); p.lineTo(cx - r, spring); p.absarc(cx, spring, r, Math.PI, 0, true); p.lineTo(cx + r, 0.0001); p.lineTo(cx - r, 0.0001);
    s.holes.push(p);
  }
  const g = new T.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 24 }); g.translate(0, 0, -depth / 2); return g;
}
function arcade(scene, m, len, h, depth, n, aw, spring, x, z, ry) { return add(scene, arcadeGeo(len, h, depth, n, aw, spring), m, x, 0, z, ry); }
function column(scene, m, r, h, x, z, cap = true) {
  add(scene, new T.CylinderGeometry(r, r * 1.05, h, 32), m, x, h / 2, z);
  if (cap) { box(scene, r * 2.6, r * .8, r * 2.6, m, x, h - r * .8, z); box(scene, r * 2.4, r * .5, r * 2.4, m, x, 0, z); }
}
function tree(scene, x, z, s = 1, leaf = '#5d7a45', trunk = '#5a4636') {
  add(scene, new T.CylinderGeometry(.18 * s, .28 * s, 3.2 * s, 10), mat(trunk), x, 1.6 * s, z);
  const lm = mat(leaf, { flatShading: true, roughness: 1 });
  for (let i = 0; i < 9; i++) add(scene, new T.IcosahedronGeometry(rr(1.1, 1.8) * s, 1), lm, x + rr(-1.5, 1.5) * s, rr(3.4, 5.2) * s, z + rr(-1.5, 1.5) * s);
}
function person(scene, x, z, col = '#2c2a28', h = 1.72) {
  add(scene, new T.CapsuleGeometry(.2, h - .62, 4, 12), mat(col), x, h / 2 - .02, z);
  add(scene, new T.SphereGeometry(.13, 16, 12), mat(col), x, h - .02, z);
}
function camera(w, h, fov, pos, look) { const c = new T.PerspectiveCamera(fov, w / h, .1, 600); c.position.set(...pos); c.lookAt(...look); return c; }
function ortho(w, h, span, pos, look) { const a = w / h; const c = new T.OrthographicCamera(-span * a, span * a, span, -span, .1, 800); c.position.set(...pos); c.lookAt(...look); return c; }

/* ---------- 3D scenes ---------- */
const S = {};
S.courtyard = (w, h, o = {}) => {
  const sc = setup(w, h); sky(sc, o.top || '#7fa7d6', o.hz || '#f3dcc0', [60, 220]);
  sun(sc, o.sun || [-30, 40, 22], '#fff4e2', o.int || 2.8, 40, '#d6e4f5', '#b8a890', 1.1);
  const stone = mat(o.wall || '#e6d6bd', { map: plasterTex(o.wall || '#e6d6bd') });
  ground(sc, mat('#d9c4a5', { map: paverTex('#d9c4a5', [40, 40]) }));
  const L = 30;
  arcade(sc, stone, L, 7, 1.2, 7, 2.9, 3.6, 0, -L / 2, 0); arcade(sc, stone, L, 7, 1.2, 7, 2.9, 3.6, -L / 2, 0, Math.PI / 2);
  arcade(sc, stone, L, 7, 1.2, 7, 2.9, 3.6, L / 2, 0, Math.PI / 2);
  box(sc, L + 2, 6, 1, stone, 0, 0, -L / 2 - 6); box(sc, 1, 6, L, stone, -L / 2 - 6, 0, 0); box(sc, 1, 6, L, stone, L / 2 + 6, 0, 0);
  box(sc, L, .5, 6, stone, 0, 6.5, -L / 2 - 3); box(sc, 6, .5, L, stone, -L / 2 - 3, 6.5, 0); box(sc, 6, .5, L, stone, L / 2 + 3, 6.5, 0);
  // minaret
  box(sc, 4, 22, 4, stone, -8, 0, -L / 2 - 8); box(sc, 3, 4, 3, stone, -8, 22, -L / 2 - 8);
  // pool
  const pool = box(sc, 9, .35, 5, mat('#e4d2b4'), 0, 0, 2); const water = add(sc, new T.PlaneGeometry(8.4, 4.4), mat('#3f6f87', { roughness: .08, metalness: .2 }), 0, .37, 2); water.rotation.x = -Math.PI / 2;
  if (o.tree) { tree(sc, -7, 6, 1.1); tree(sc, 8, -3, .9); }
  if (o.people) { person(sc, 4, 6); person(sc, 5.2, 7.1, '#6b4a3a', 1.62); person(sc, -9, -6, '#3d4a5a'); }
  return [sc, camera(w, h, o.fov || 55, o.cam || [7, 1.7, 24], o.look || [-2, 4.2, -8])];
};
S.hypostyle = (w, h, o = {}) => {
  const sc = setup(w, h); sc.background = new T.Color('#3a3026'); sc.fog = new T.Fog('#4a3c2e', 14, 80);
  const d = sun(sc, [12, 40, 8], '#ffe6bf', 7, 40, '#a8957a', '#5a4836', 1.1);
  const stone = mat('#cfae86', { map: plasterTex('#cfae86') });
  ground(sc, mat('#8f6b4a', { map: paverTex('#9c7856', [60, 60]) }));
  for (let i = -6; i <= 6; i++) for (let j = -8; j <= 1; j++) column(sc, stone, .32, 6, i * 4, j * 4);
  // roof with openings
  for (let i = -7; i <= 7; i++) for (let j = -9; j <= 2; j++) { if ((i + j * 3) % 5 === 0) continue; box(sc, 4, .6, 4, stone, i * 4, 6, j * 4); }
  box(sc, 60, 7, 1, stone, 0, 0, -36);
  sc.add(new T.AmbientLight('#8a7258', 1.1));
  if (o.people) { person(sc, 1.5, -4, '#1a1715'); }
  return [sc, camera(w, h, 52, [2, 1.6, 9], [0, 3.6, -20])];
};
S.windtowers = (w, h, o = {}) => {
  const sc = setup(w, h); sky(sc, '#8cb3df', '#f5e1c6', [80, 300]); sun(sc, [-40, 50, 30], '#fff1da', 3.4, 60);
  const earth = mat('#cda77a', { map: plasterTex('#cda77a', [4, 4]) });
  ground(sc, mat('#c49d72', { map: plasterTex('#c49d72', [50, 50]) }));
  for (let i = 0; i < 26; i++) {
    const x = rr(-30, 30), z = rr(-60, 4), hh = rr(4, 9), ww = rr(5, 10), dd = rr(5, 10);
    if (Math.abs(x) < 4 && z > -6) continue;
    box(sc, ww, hh, dd, earth, x, 0, z, rr(-.1, .1));
    if (rnd() < .55) { const th = rr(5, 9); const tx = x + rr(-ww / 3, ww / 3), tz = z + rr(-dd / 3, dd / 3);
      box(sc, 2.2, hh + th, 2.2, earth, tx, 0, tz);
      for (let k = 0; k < 3; k++) box(sc, .35, 2.4, 2.3, mat('#2d2219'), tx - .7 + k * .7, hh + th - 3, tz);
    }
  }
  if (o.people) person(sc, 1.2, 4, '#4a3426');
  return [sc, camera(w, h, 45, [2, 2.2, 12], [0, 8, -30])];
};
S.brickhall = (w, h, o = {}) => {
  const sc = setup(w, h); sc.background = new T.Color('#120d0a');
  const d = sun(sc, [6, 60, -4], '#fff3df', 7, 30, '#a07a60', '#4a3020', .7);
  const brick = mat('#a4573a', { map: brickTex('#a4573a', '#7a5a48', [5, 4]) });
  ground(sc, mat('#cfc4b4', { map: paverTex('#d6ccbd', [20, 20]) }));
  const R = 11, H = 13;
  box(sc, R * 2, H, 1, brick, 0, 0, -R); box(sc, 1, H, R * 2, brick, -R, 0, 0); box(sc, 1, H, R * 2, brick, R, 0, 0); box(sc, R * 2, H, 1, brick, 0, 0, R);
  // roof with a cross slit and circular light wells
  const roofM = mat('#5b3626');
  box(sc, R * 2, .8, R - 1, roofM, 0, H, -R / 2 - .6); box(sc, R * 2, .8, R - 1, roofM, 0, H, R / 2 + .6);
  box(sc, R - 1, .8, 1.2, roofM, -R / 2 - .6, H, 0); box(sc, R - 1, .8, 1.2, roofM, R / 2 + .6, H, 0);
  // inner rotated square columns
  for (const [x, z] of [[-6, -6], [6, -6], [-6, 6], [6, 6]]) box(sc, 1.6, H, 1.6, brick, x, 0, z, Math.PI / 4);
  { const pl = new T.PointLight('#ffcf9a', 40, 20); pl.position.set(0, 3, -9); sc.add(pl); }
  if (o.people) { person(sc, -1.5, 3, '#ece6dc', 1.66); person(sc, 2.2, 4.5, '#2b2421'); }
  return [sc, camera(w, h, 60, [0, 1.6, 9.5], [0, 5.5, -10])];
};
S.screen = (w, h, o = {}) => {
  const sc = setup(w, h); sky(sc, '#f1e3cd', '#f1e3cd'); sun(sc, [-14, 16, 10], '#ffe9c4', 5, 20, '#f6e9d6', '#806650', .5);
  const pattern = canvasTex(512, 512, (g, w2, h2) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w2, h2); g.fillStyle = '#000';
    const s = 64; for (let y = 0; y < h2; y += s) for (let x = 0; x < w2; x += s) { g.beginPath(); g.arc(x + s / 2, y + s / 2, s * .3, 0, Math.PI * 2); g.fill(); g.save(); g.translate(x + s / 2, y + s / 2); g.rotate(Math.PI / 4); g.fillRect(-s * .18, -s * .18, s * .36, s * .36); g.restore(); g.fillRect(x + s / 2 - 3, y, 6, s); g.fillRect(x, y + s / 2 - 3, s, 6); } }, [3, 3]);
  pattern.colorSpace = T.NoColorSpace;
  const timber = mat('#6b4428', { map: boardTex('#6b4428', [2, 2]), alphaMap: pattern, alphaTest: .5, side: T.DoubleSide });
  ground(sc, mat('#e7d8c2', { map: paverTex('#eadcc6', [30, 30]) }));
  const plaster = mat('#efe5d6', { map: plasterTex('#efe5d6') });
  box(sc, 14, 6, .5, plaster, 0, 0, -6); box(sc, .5, 6, 14, plaster, 7, 0, 0);
  const scr = add(sc, new T.PlaneGeometry(6, 5), timber, -3.5, 3.1, 1, Math.PI / 2.4);
  box(sc, .3, 6, .3, mat('#4a2e1c'), -3.5, 0, 4); box(sc, .3, 6, .3, mat('#4a2e1c'), -3.5, 0, -2);
  box(sc, 3, .9, 1, mat('#8b6a4c'), 3, 0, -5);
  return [sc, camera(w, h, 50, [5.5, 4.2, 6.5], [-0.5, .4, -1])];
};
S.colonnade = (w, h, o = {}) => {
  const sc = setup(w, h); sky(sc, '#26385e', '#e89a6a', [40, 160]); sun(sc, [40, 8, -10], '#ffb27a', 3.2, 50, '#4b5f8c', '#3a2c2a', .7);
  const stone = mat('#d9cbb8', { map: plasterTex('#d9cbb8') });
  ground(sc, mat('#9d8f80', { map: paverTex('#a49584', [60, 60]) }));
  for (let i = 0; i < 18; i++) { column(sc, stone, .45, 7, -4, -i * 5); column(sc, stone, .45, 7, 4, -i * 5); }
  box(sc, 1.6, 1, 92, stone, -4, 7, -42); box(sc, 1.6, 1, 92, stone, 4, 7, -42);
  for (let i = 0; i < 18; i++) box(sc, 9.6, .5, .5, stone, 0, 7.5, -i * 5);
  const lamp = new T.PointLight('#ffcf8a', 12, 14); lamp.position.set(0, 5, -12); sc.add(lamp);
  if (o.people) { person(sc, .6, -9, '#1c1c22'); person(sc, -.8, -22, '#1c1c22', 1.6); }
  return [sc, camera(w, h, 48, [1.6, 1.7, 8], [0, 3.6, -30])];
};
S.earthwall = (w, h) => {
  const sc = setup(w, h); sky(sc, '#7ea4cf', '#efd7bb', [60, 260]); sun(sc, [-20, 22, 30], '#ffe4bd', 3.6, 70);
  const strata = canvasTex(512, 512, (g, w2, h2) => { let y = 0; while (y < h2) { const t = rr(8, 26); const c = new T.Color('#b98a5f'); c.offsetHSL(rr(-.02, .02), rr(-.06, .06), rr(-.07, .06)); g.fillStyle = '#' + c.getHexString(); g.fillRect(0, y, w2, t); y += t; }
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(40,20,10,${rnd() * .12})`; g.fillRect(rnd() * w2, rnd() * h2, 2, 1.5); } }, [6, 1]);
  const earth = mat('#c1916a', { map: strata });
  ground(sc, mat('#cfb08c', { map: plasterTex('#cfb08c', [60, 60]) }));
  box(sc, 70, 5.5, 1.4, earth, 0, 0, -6); box(sc, 7, 3.2, 2, mat('#2c2018'), 6, 0, -6);
  box(sc, 14, 3.5, 1.2, earth, -22, 0, 4, .25);
  tree(sc, -10, -1, .9, '#7a8b55'); tree(sc, 22, -2, 1.1, '#6f8250');
  person(sc, 2, -3, '#3b2c24');
  return [sc, camera(w, h, 34, [0, 1.8, 26], [0, 2.6, -6])];
};
S.vaults = (w, h, o = {}) => {
  const sc = setup(w, h); sky(sc, '#88aedb', '#f2dcc0', [60, 220]); sun(sc, [-30, 30, 25], '#fff0d8', 3.4, 50);
  const earth = mat(o.clay ? '#f2f0ec' : '#d7ad7c', o.clay ? {} : { map: plasterTex('#d7ad7c', [3, 3]) });
  ground(sc, mat(o.clay ? '#e6e4df' : '#caa27a', o.clay ? {} : { map: plasterTex('#caa27a', [50, 50]) }));
  for (let i = 0; i < 4; i++) {
    const x = -12 + i * 6.4;
    box(sc, 6, 3.4, 12, earth, x, 0, -4);
    const v = add(sc, new T.CylinderGeometry(3, 3, 12, 40, 1, false, Math.PI / 2, Math.PI), earth, x, 3.4, -4); v.rotation.set(Math.PI / 2, 0, 0);
  }
  const dome = add(sc, new T.SphereGeometry(4, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), earth, 15, 4.6, -3); box(sc, 9, 4.6, 9, earth, 15, 0, -3);
  if (!o.clay) { person(sc, 2, 6, '#3b2c24'); tree(sc, -20, 3, 1.1); }
  return [sc, camera(w, h, o.fov || 46, o.cam || [4, 2.4, 22], o.look || [2, 3.4, -4])];
};
S.stepwell = (w, h) => {
  const sc = setup(w, h); sky(sc, '#9ab9dd', '#f0dcc2'); sun(sc, [10, 50, 14], '#fff0d6', 3.8, 30);
  const stone = mat('#c9a77a', { map: plasterTex('#c9a77a', [4, 4]) });
  const A = 9, B = 8;
  for (let i = 0; i < 13; i++) { const a = 8 - i * .5, top = -i * .55, th = B + top; const yb = -B;
    box(sc, 2 * A, th, A - a, stone, 0, yb, -(a + (A - a) / 2)); box(sc, 2 * A, th, A - a, stone, 0, yb, a + (A - a) / 2);
    box(sc, A - a, th, 2 * a, stone, -(a + (A - a) / 2), yb, 0); box(sc, A - a, th, 2 * a, stone, a + (A - a) / 2, yb, 0); }
  const water = add(sc, new T.PlaneGeometry(4, 4), mat('#2f5b5a', { roughness: .06, metalness: .3 }), 0, -6.9, 0); water.rotation.x = -Math.PI / 2;
  box(sc, 4, .3, 4, stone, 0, -7.4, 0);
  const gm = mat('#c9a77a', { map: plasterTex('#c9a77a', [20, 20]) });
  box(sc, 80, 1, 30, gm, 0, -1, -24.5); box(sc, 80, 1, 30, gm, 0, -1, 24.5); box(sc, 30, 1, 18, gm, -24.5, -1, 0); box(sc, 30, 1, 18, gm, 24.5, -1, 0);
  person(sc, 3.2, 9.6, '#3a2a20');
  return [sc, camera(w, h, 50, [6, 7, 13], [0, -5, -1])];
};
/* Clay renders: white model, studio light. */
function clay(sc, bg = '#e9e8e4') { sc.background = new T.Color(bg); sun(sc, [-24, 40, 30], '#ffffff', 3.2, 50, '#ffffff', '#bdbab3', 1.1); return mat('#f4f3ef', { roughness: .95 }); }
S.pavilion = (w, h, o = {}) => {
  const sc = setup(w, h); const m = clay(sc, o.bg); ground(sc, mat('#e4e2dd'));
  const roof = box(sc, 22, .4, 10, m, 0, 4, 0, o.rot || 0);
  for (let i = -5; i <= 5; i++) { box(sc, .18, 4, .18, m, i * 2, 0, 4.5); if (o.b) box(sc, .18, 4, .18, m, i * 2, 0, -4.5); }
  if (!o.b) box(sc, 22, 4, .3, m, 0, 0, -4.7);
  box(sc, 8, 3.2, 5, mat('#d9d7d1'), o.b ? 4 : -4, 0, -1);
  box(sc, 30, .3, 16, mat('#ecebe7'), 0, 0, 0);
  for (let i = 0; i < 7; i++) tree(sc, rr(-24, 24), rr(-16, -8), rr(.6, 1), '#f1f0ec', '#e9e7e2');
  person(sc, 6, 6, '#f4f3ef');
  return [sc, camera(w, h, 38, [24, 9, 26], [0, 2, 0])];
};
S.block = (w, h) => {
  const sc = setup(w, h); const m = clay(sc, '#ebeae6'); ground(sc, mat('#e2e0db'));
  for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
    if (i === 0 && j === 0) { const g = mat('#c9d6c0'); box(sc, 9, .2, 9, g, 0, 0, 0); tree(sc, 0, 0, .8, '#e8eadf', '#dedfd6'); continue; }
    const hh = (i === 1 && j === -1) ? 26 : rr(5, 14); box(sc, 9, hh, 9, m, i * 12, 0, j * 12);
    if (rnd() < .4) box(sc, 4, rr(2, 6), 4, m, i * 12 + 2, hh, j * 12 + 2);
  }
  return [sc, ortho(w, h, 34, [60, 60, 60], [0, 0, 0])];
};
S.courthouse = (w, h) => {
  const sc = setup(w, h); const m = clay(sc, '#eceae5'); ground(sc, mat('#e4e2dc'));
  box(sc, 20, 4, 3, m, 0, 0, -8.5); box(sc, 20, 4, 3, m, 0, 0, 8.5); box(sc, 3, 4, 14, m, -8.5, 0, 0); box(sc, 3, 7.5, 14, m, 8.5, 0, 0);
  box(sc, 2, 10, 2, m, 8.5, 0, -8.5);
  const pool = box(sc, 4, .2, 6, mat('#cfdbe0'), 0, 0, 0); tree(sc, -3.5, 3, .7, '#eef0e8', '#e2e1db');
  for (let i = 0; i < 6; i++) box(sc, 1, 2.4, .2, mat('#d8d6d0'), -6 + i * 2.4, 0, 7);
  return [sc, camera(w, h, 36, [0, 46, 22], [0, 0, 0])];
};
S.tower = (w, h) => {
  const sc = setup(w, h); const m = clay(sc, '#e8e7e2'); ground(sc, mat('#e1dfda'));
  box(sc, 12, 48, 12, mat('#d4d2cc'), 0, 0, 0);
  for (let f = 0; f < 16; f++) { box(sc, 13.2, .25, 13.2, m, 0, f * 3, 0); }
  for (let k = -6; k <= 6; k++) { box(sc, .25, 48, .9, m, k, 0, 6.5); box(sc, .9, 48, .25, m, 6.5, 0, k); }
  box(sc, 20, 6, 18, m, -14, 0, 4); person(sc, 9, 12, '#f4f3ef');
  return [sc, camera(w, h, 40, [30, 6, 40], [0, 22, 0])];
};
S.stair = (w, h) => {
  const sc = setup(w, h); sc.background = new T.Color('#2a2b2c');
  sun(sc, [2, 60, 3], '#ffffff', 7, 16, '#ffffff', '#6a6866', .9);
  const conc = mat('#c9c6bf', { map: boardTex('#c9c6bf', [3, 3]) });
  box(sc, .6, 22, 10, conc, -4, 0, 0); box(sc, .6, 22, 10, conc, 4, 0, 0); box(sc, 8.6, 22, .6, conc, 0, 0, -5);
  for (let i = 0; i < 26; i++) box(sc, 3.4, .22, 1, conc, -2.2, i * .5, 4 - i * .32);
  box(sc, 3.4, .22, 3, conc, -2.2, 13, -4);
  for (let i = 0; i < 18; i++) box(sc, 3.4, .22, 1, conc, 2.2, 13 - i * .5 + 9, -4 + i * .4);
  box(sc, 8.6, .5, 3.5, conc, 0, 22, 3.2); box(sc, 8.6, .5, 3.5, conc, 0, 22, -3.6);
  return [sc, camera(w, h, 62, [1.4, 1.5, 4.6], [-.6, 12, -2])];
};
S.reading = (w, h) => {
  const sc = setup(w, h); sc.background = new T.Color('#dfe6ec');
  sun(sc, [-10, 30, -20], '#fff6e6', 5, 30, '#f0f4f8', '#b0a28e', 1.6); sc.add(new T.AmbientLight('#fff8ee', .8));
  const plaster = mat('#efede7', { map: plasterTex('#efede7') }); const oak = mat('#b48a5e', { map: boardTex('#b48a5e', [4, 4]) });
  ground(sc, oak);
  box(sc, 30, 3.2, .4, plaster, 0, 0, -10); box(sc, 30, 3, .4, plaster, 0, 5.2, -10); box(sc, .4, 9, 22, plaster, -15, 0, 0); box(sc, .4, 9, 22, plaster, 15, 0, 0);
  box(sc, 30, .5, 22, plaster, 0, 8.2, 0); box(sc, 30, 3, .4, plaster, 0, 0, 10);
  for (let i = -2; i <= 2; i++) { box(sc, 5, .12, 1.6, oak, i * 5.4, .9, -2); box(sc, .12, .9, .12, oak, i * 5.4 - 2.3, 0, -2.6); box(sc, .12, .9, .12, oak, i * 5.4 + 2.3, 0, -1.4); }
  for (let i = 0; i < 12; i++) box(sc, 1.6, 2.6, .5, mat(['#40576b', '#8a5a3c', '#c9b48e', '#5e6b48'][i % 4]), -13 + i * 2.2, 0, -9.6);
  person(sc, 3, 1, '#384450', 1.3);
  return [sc, camera(w, h, 58, [6, 1.7, 8], [-2, 3.6, -8])];
};
S.colbase = (w, h) => {
  const sc = setup(w, h); sky(sc, '#c7b8a2', '#c7b8a2'); sun(sc, [-10, 12, 12], '#ffe7c2', 4, 8);
  const stone = mat('#d6c2a4', { map: plasterTex('#d6c2a4', [2, 2]) });
  ground(sc, mat('#bfa27f', { map: paverTex('#c4a783', [8, 8]) }));
  add(sc, new T.CylinderGeometry(.5, .52, 6, 48), stone, 0, 3.6, 0);
  add(sc, new T.TorusGeometry(.6, .12, 16, 48), stone, 0, .72, 0).rotation.x = Math.PI / 2;
  add(sc, new T.TorusGeometry(.66, .16, 16, 48), stone, 0, .46, 0).rotation.x = Math.PI / 2;
  box(sc, 1.7, .32, 1.7, stone, 0, 0, 0);
  return [sc, camera(w, h, 40, [2.6, 1.4, 3], [0, 1, 0])];
};

/* ---------- drawings (canvas 2D) ---------- */
function paper(g, w, h) { g.fillStyle = '#f8f6f0'; g.fillRect(0, 0, w, h); for (let i = 0; i < 20000; i++) { g.fillStyle = `rgba(80,70,50,${rnd() * .035})`; g.fillRect(rnd() * w, rnd() * h, 1.5, 1.5); } }
function ink(g, wgt, col = '#1f2a33') { g.strokeStyle = col; g.lineWidth = wgt; g.lineCap = 'square'; g.lineJoin = 'miter'; }
function label(g, t, x, y, s, col = '#1f2a33', al = 'left') { g.fillStyle = col; g.font = `${s}px "Courier New", monospace`; g.textAlign = al; g.fillText(t, x, y); }
function hatchRect(g, x, y, w, h, gap = 6) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.lineWidth = 1; for (let i = -h; i < w; i += gap) { g.beginPath(); g.moveTo(x + i, y + h); g.lineTo(x + i + h, y); g.stroke(); } g.restore(); g.strokeRect(x, y, w, h); }
const D = {};
D.plan = (g, w, h) => {
  paper(g, w, h); const u = w / 26; const ox = 3 * u, oy = 3 * u;
  ink(g, 3);
  const walls = [[0, 0, 20, .5], [0, 19.5, 20, .5], [0, 0, .5, 20], [19.5, 0, .5, 20], [6, .5, .35, 5], [14, .5, .35, 5], [.5, 6, 5, .35], [14.5, 6, 5, .35], [.5, 14, 5, .35], [14.5, 14, 5, .35], [6, 14.5, .35, 5], [14, 14.5, .35, 5]];
  g.fillStyle = '#1f2a33'; for (const [x, y, ww, hh] of walls) g.fillRect(ox + x * u, oy + y * u, ww * u, hh * u);
  ink(g, 1.2, '#55606a');
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { if (i > 0 && i < 3 && j > 0 && j < 3) continue; }
  g.setLineDash([u * .3, u * .2]); g.strokeRect(ox + 6 * u, oy + 6 * u, 8 * u, 8 * u); g.setLineDash([]);
  g.fillStyle = '#d9e4ea'; g.fillRect(ox + 8.5 * u, oy + 8.5 * u, 3 * u, 3 * u); ink(g, 1.4); g.strokeRect(ox + 8.5 * u, oy + 8.5 * u, 3 * u, 3 * u);
  for (const [x, y] of [[6, 6], [14, 6], [6, 14], [14, 14], [10, 6], [10, 14], [6, 10], [14, 10]]) { g.fillStyle = '#1f2a33'; g.fillRect(ox + x * u - u * .2, oy + y * u - u * .2, u * .4, u * .4); }
  ink(g, 1); g.beginPath(); g.arc(ox + 10 * u, oy + 20 * u, 1.2 * u, Math.PI, Math.PI * 1.5); g.stroke();
  label(g, 'COURTYARD', ox + 10 * u, oy + 7.3 * u, u * .38, '#1f2a33', 'center');
  label(g, 'LIWAN', ox + 3 * u, oy + 10 * u, u * .32, '#55606a', 'center'); label(g, 'MAJLIS', ox + 17 * u, oy + 10 * u, u * .32, '#55606a', 'center');
  label(g, 'GROUND FLOOR PLAN  1:100', ox, oy + 22.4 * u, u * .45); ink(g, 2); g.beginPath(); g.moveTo(ox, oy + 22.7 * u); g.lineTo(ox + 9 * u, oy + 22.7 * u); g.stroke();
  // north arrow + scale bar
  ink(g, 1.5); g.beginPath(); g.arc(ox + 21.6 * u, oy + 1.4 * u, .8 * u, 0, 7); g.stroke(); g.beginPath(); g.moveTo(ox + 21.6 * u, oy + .4 * u); g.lineTo(ox + 22 * u, oy + 2 * u); g.lineTo(ox + 21.2 * u, oy + 2 * u); g.closePath(); g.fillStyle = '#1f2a33'; g.fill();
  for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? '#f8f6f0' : '#1f2a33'; g.fillRect(ox + 14 * u + i * u, oy + 22.2 * u, u, .25 * u); } g.strokeRect(ox + 14 * u, oy + 22.2 * u, 5 * u, .25 * u); label(g, '0    5m', ox + 14 * u, oy + 23.1 * u, u * .3);
};
D.tplan = (g, w, h) => {
  paper(g, w, h); const u = w / 34; const ox = 2 * u, oy = 2 * u;
  g.fillStyle = '#1f2a33'; g.fillRect(ox, oy, 30 * u, .5 * u); g.fillRect(ox, oy, .5 * u, 21 * u); g.fillRect(ox + 29.5 * u, oy, .5 * u, 21 * u); g.fillRect(ox, oy + 20.5 * u, 30 * u, .5 * u);
  for (let i = 0; i < 15; i++) for (let j = 0; j < 8; j++) { const x = ox + (1.5 + i * 1.9) * u, y = oy + (1.6 + j * 1.25) * u; if (i === 7) continue; g.beginPath(); g.arc(x, y, .16 * u, 0, 7); g.fill(); }
  ink(g, 1.1, '#55606a'); g.strokeRect(ox + 13.6 * u, oy + .5 * u, 2.8 * u, 10.2 * u); g.strokeRect(ox + .5 * u, oy + .5 * u, 29 * u, 1.9 * u);
  g.fillStyle = 'rgba(30,62,158,.08)'; g.fillRect(ox + 13.6 * u, oy + .5 * u, 2.8 * u, 10.2 * u); g.fillRect(ox + .5 * u, oy + .5 * u, 29 * u, 1.9 * u);
  ink(g, 1.2); g.setLineDash([u * .25, u * .2]); g.strokeRect(ox + 3 * u, oy + 11.6 * u, 24 * u, 8 * u); g.setLineDash([]);
  label(g, 'SAHN', ox + 15 * u, oy + 16 * u, u * .5, '#1f2a33', 'center'); label(g, 'MIHRAB', ox + 15 * u, oy - .4 * u, u * .38, '#55606a', 'center');
  label(g, 'T-PLAN: WIDER AXIAL AISLE + QIBLA TRANSEPT', ox, oy + 22.6 * u, u * .45);
};
D.section = (g, w, h) => {
  paper(g, w, h); const u = h / 14; const ox = 2 * u, gy = 11 * u;
  ink(g, 3); g.beginPath(); g.moveTo(0, gy); g.lineTo(w, gy); g.stroke(); hatchRect(g, 0, gy, w, .6 * u, 8);
  g.fillStyle = '#1f2a33';
  g.fillRect(ox + 2 * u, gy - 5 * u, .4 * u, 5 * u); g.fillRect(ox + 12 * u, gy - 5 * u, .4 * u, 5 * u); g.fillRect(ox + 2 * u, gy - 5.3 * u, 10.4 * u, .35 * u);
  g.fillRect(ox + 9 * u, gy - 9.5 * u, .35 * u, 4.5 * u); g.fillRect(ox + 11.2 * u, gy - 9.5 * u, .35 * u, 4.5 * u); g.fillRect(ox + 9 * u, gy - 9.7 * u, 2.55 * u, .3 * u);
  g.fillRect(ox + 16 * u, gy - 4 * u, .4 * u, 4 * u); g.fillRect(ox + 24 * u, gy - 4 * u, .4 * u, 4 * u); g.fillRect(ox + 16 * u, gy - 4.3 * u, 8.4 * u, .35 * u);
  ink(g, 2, '#1e3e9e'); const arrow = (pts) => { g.beginPath(); g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p); g.stroke(); const [a, b] = pts.slice(-2); const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(b[0] - u * .4 * Math.cos(ang - .4), b[1] - u * .4 * Math.sin(ang - .4)); g.lineTo(b[0] - u * .4 * Math.cos(ang + .4), b[1] - u * .4 * Math.sin(ang + .4)); g.closePath(); g.fillStyle = '#1e3e9e'; g.fill(); };
  arrow([[ox + 6 * u, gy - 11 * u], [ox + 10.2 * u, gy - 10.3 * u], [ox + 10.2 * u, gy - 6 * u]]); arrow([[ox + 10.2 * u, gy - 4.6 * u], [ox + 7 * u, gy - 2 * u], [ox + 3.4 * u, gy - 2 * u]]);
  ink(g, 2, '#9a3b2e'); arrow([[ox + 3 * u, gy - 4.2 * u], [ox + 8 * u, gy - 4.6 * u]]);
  g.setLineDash([6, 6]); ink(g, 1.2, '#55606a'); g.beginPath(); g.moveTo(ox + 14 * u, gy); g.lineTo(ox + 14 * u, gy - 12 * u); g.stroke(); g.setLineDash([]);
  label(g, 'WIND TOWER', ox + 10.4 * u, gy - 10.2 * u, u * .32, '#1f2a33', 'center'); label(g, 'COOL AIR DOWN', ox + 10.6 * u, gy - 1.2 * u, u * .3, '#1e3e9e'); label(g, 'WARM AIR OUT', ox + 3 * u, gy - 4.8 * u, u * .3, '#9a3b2e');
  label(g, 'SECTION A-A  1:50', ox, gy + 2 * u, u * .45);
};
D.elevation = (g, w, h) => {
  paper(g, w, h); const u = h / 10; const gy = 8.4 * u;
  ink(g, 3); g.beginPath(); g.moveTo(0, gy); g.lineTo(w, gy); g.stroke();
  const n = 13, step = (w - 2 * u) / n; ink(g, 2);
  g.strokeRect(u, gy - 6 * u, w - 2 * u, 6 * u);
  for (let i = 0; i < n; i++) { const cx = u + step * (i + .5), r = step * .34; g.beginPath(); g.moveTo(cx - r, gy); g.lineTo(cx - r, gy - 3.2 * u); g.arc(cx, gy - 3.2 * u, r, Math.PI, 0); g.lineTo(cx + r, gy); g.stroke();
    ink(g, .8, '#7a8690'); g.beginPath(); g.moveTo(cx, gy - 3.2 * u - r); g.lineTo(cx, gy - 6 * u); g.stroke(); ink(g, 2); }
  ink(g, 1, '#1e3e9e'); g.setLineDash([4, 5]); for (let i = 0; i <= n; i++) { const x = u + step * i; g.beginPath(); g.moveTo(x, gy + .2 * u); g.lineTo(x, gy - 6.6 * u); g.stroke(); } g.setLineDash([]);
  label(g, 'ARCADE ELEVATION  BAY 3.8 m  SPRING 3.2 m', u, gy + 1.1 * u, u * .38);
};
D.stairsec = (g, w, h) => {
  paper(g, w, h); const u = w / 12;
  g.fillStyle = '#1f2a33'; g.fillRect(u, u, .35 * u, h - 2 * u); g.fillRect(w - 1.35 * u, u, .35 * u, h - 2 * u); g.fillRect(u, u, w - 2 * u, .3 * u);
  g.fillStyle = '#f8f6f0'; g.fillRect(4.5 * u, u - 2, 3 * u, .3 * u + 4);
  ink(g, 2); let x = 2 * u, y = h - 2 * u; g.beginPath(); g.moveTo(x, y); for (let i = 0; i < 14; i++) { g.lineTo(x, y - .55 * u); y -= .55 * u; g.lineTo(x + .75 * u, y); x += .75 * u; } g.stroke();
  g.fillStyle = 'rgba(232,194,122,.35)'; g.beginPath(); g.moveTo(4.5 * u, u + .3 * u); g.lineTo(7.5 * u, u + .3 * u); g.lineTo(9.8 * u, h - 2 * u); g.lineTo(3.4 * u, h - 2 * u); g.closePath(); g.fill();
  label(g, 'ROOF LIGHT', 6 * u, u * .8, u * .28, '#1f2a33', 'center'); label(g, 'STAIR SECTION, LIGHT STUDY', u, h - u * .9, u * .3);
};

/* ---------- materials (canvas 2D) ---------- */
const M = {};
M.brick = (g, w, h) => { g.fillStyle = '#b8b0a2'; g.fillRect(0, 0, w, h); const bh = h / 22, hw = bh * 1.9, sw = bh * 3.9; let row = 0;
  for (let y = 0; y < h; y += bh, row++) { let x = row % 2 ? -hw / 2 : 0; let k = 0; while (x < w) { const bw = (k++ % 2) ? hw : sw; const c = new T.Color(k % 2 ? '#8d3b26' : '#a54a2e'); c.offsetHSL(rr(-.01, .01), rr(-.05, .05), rr(-.06, .05)); g.fillStyle = '#' + c.getHexString(); g.fillRect(x + 4, y + 4, bw - 8, bh - 8); x += bw; } }
  for (let i = 0; i < 90000; i++) { g.fillStyle = `rgba(${rnd() < .5 ? 0 : 255},${rnd() < .5 ? 0 : 230},200,${rnd() * .07})`; g.fillRect(rnd() * w, rnd() * h, 2, 2); } };
M.zellige = (g, w, h) => { g.fillStyle = '#e8e2d6'; g.fillRect(0, 0, w, h); const s = w / 14;
  for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) { const c = new T.Color(rnd() < .18 ? '#e9e4d8' : '#1f6b5c'); c.offsetHSL(rr(-.02, .02), rr(-.1, .05), rr(-.08, .08)); const gr = g.createLinearGradient(x, y, x + s, y + s); gr.addColorStop(0, '#' + c.clone().offsetHSL(0, 0, .12).getHexString()); gr.addColorStop(.5, '#' + c.getHexString()); gr.addColorStop(1, '#' + c.clone().offsetHSL(0, 0, -.08).getHexString()); g.fillStyle = gr; g.fillRect(x + 3, y + 3, s - 6, s - 6); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x + s * .15, y + s * .12, s * .3, s * .08); } };
M.earth = (g, w, h) => { let y = 0; while (y < h) { const t = rr(h / 70, h / 22); const c = new T.Color('#b07d55'); c.offsetHSL(rr(-.02, .02), rr(-.08, .06), rr(-.08, .07)); g.fillStyle = '#' + c.getHexString(); g.fillRect(0, y, w, t); y += t; }
  for (let i = 0; i < 120000; i++) { g.fillStyle = `rgba(${rnd() < .5 ? 30 : 240},${rnd() < .5 ? 15 : 220},10,${rnd() * .1})`; g.fillRect(rnd() * w, rnd() * h, rnd() * 3, rnd() * 2); }
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(230,215,190,${rr(.3, .7)})`; g.beginPath(); g.arc(rnd() * w, rnd() * h, rr(2, 7), 0, 7); g.fill(); } };
M.oak = (g, w, h) => { const bw = h / 7; for (let y = 0; y < h; y += bw) { const c = new T.Color('#b98a5a'); c.offsetHSL(rr(-.01, .01), rr(-.05, .05), rr(-.06, .05)); g.fillStyle = '#' + c.getHexString(); g.fillRect(0, y, w, bw);
    for (let k = 0; k < 70; k++) { g.strokeStyle = `rgba(80,45,20,${rr(.05, .18)})`; g.lineWidth = rr(.5, 2.2); g.beginPath(); const yy = y + rnd() * bw; g.moveTo(0, yy); for (let x = 0; x < w; x += 40) g.lineTo(x, yy + Math.sin(x / rr(80, 200)) * rr(1, 6)); g.stroke(); }
    g.fillStyle = 'rgba(40,20,5,.35)'; g.fillRect(0, y, w, 2); const jx = rnd() * w; g.fillRect(jx, y, 2, bw); } };
M.terrazzo = (g, w, h) => { g.fillStyle = '#ece8e1'; g.fillRect(0, 0, w, h); const cols = ['#c9765a', '#8f9a8e', '#2f3a40', '#e2c79b', '#ffffff', '#b4b0aa'];
  for (let i = 0; i < 2600; i++) { g.fillStyle = cols[Math.floor(rnd() * cols.length)]; g.beginPath(); const x = rnd() * w, y = rnd() * h, r = rr(3, w / 50); g.moveTo(x + r, y); for (let a = 1; a < 6; a++) g.lineTo(x + Math.cos(a * 1.2 + rnd()) * r * rr(.6, 1.2), y + Math.sin(a * 1.2 + rnd()) * r * rr(.6, 1.2)); g.closePath(); g.fill(); }
  for (let i = 0; i < 60000; i++) { g.fillStyle = `rgba(0,0,0,${rnd() * .05})`; g.fillRect(rnd() * w, rnd() * h, 1.5, 1.5); } };
M.jali = (g, w, h) => { const gr = g.createRadialGradient(w * .55, h * .4, 10, w * .55, h * .4, w); gr.addColorStop(0, '#fff3d6'); gr.addColorStop(1, '#e6a35e'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const bw = w / 9, bh = bw / 2.1; for (let r = 0, y = 0; y < h; y += bh, r++) for (let x = (r % 2) * -bw / 2; x < w; x += bw) { if (r % 2 === 0 && Math.floor(x / bw) % 2 === 1) continue; const c = new T.Color('#7c3a24'); c.offsetHSL(0, rr(-.05, .05), rr(-.07, .04)); g.fillStyle = '#' + c.getHexString(); g.fillRect(x + 3, y + 3, bw - 6, bh - 6); }
  for (let i = 0; i < 50000; i++) { g.fillStyle = `rgba(0,0,0,${rnd() * .08})`; g.fillRect(rnd() * w, rnd() * h, 2, 2); } };
M.travertine = (g, w, h) => { g.fillStyle = '#e3d6bf'; g.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { g.strokeStyle = `rgba(${rr(150, 200)},${rr(130, 170)},${rr(100, 130)},${rr(.15, .45)})`; g.lineWidth = rr(1, 6); g.beginPath(); const y = rnd() * h; g.moveTo(0, y); for (let x = 0; x < w; x += 50) g.lineTo(x, y + Math.sin(x / 300 + i) * 8 + rr(-2, 2)); g.stroke(); }
  for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(120,95,60,${rr(.2, .5)})`; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, rr(2, 12), rr(1, 3), 0, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(90,70,40,.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke(); };
M.concrete = (g, w, h) => { g.fillStyle = '#bdbab3'; g.fillRect(0, 0, w, h); const bw = h / 9; for (let y = 0; y < h; y += bw) { const c = new T.Color('#bdbab3'); c.offsetHSL(0, 0, rr(-.05, .04)); g.fillStyle = '#' + c.getHexString(); g.fillRect(0, y, w, bw);
    for (let k = 0; k < 30; k++) { g.strokeStyle = `rgba(60,60,55,${rr(.04, .12)})`; g.lineWidth = rr(.5, 2); g.beginPath(); const yy = y + rnd() * bw; g.moveTo(0, yy); for (let x = 0; x < w; x += 60) g.lineTo(x, yy + rr(-2, 2)); g.stroke(); } g.fillStyle = 'rgba(40,40,35,.3)'; g.fillRect(0, y, w, 2); }
  for (let i = 0; i < 140; i++) { g.fillStyle = 'rgba(40,40,40,.35)'; g.beginPath(); g.arc(rnd() * w, rnd() * h, rr(1, 4), 0, 7); g.fill(); }
  for (let x = w / 6; x < w; x += w / 3) for (let y = h / 6; y < h; y += h / 3) { g.fillStyle = '#8f8c86'; g.beginPath(); g.arc(x, y, h / 90, 0, 7); g.fill(); } };

/* ---------- export ---------- */
function palette(canvas) {
  const s = 48, c = document.createElement('canvas'); c.width = s; c.height = s; const g = c.getContext('2d'); g.drawImage(canvas, 0, 0, s, s);
  const d = g.getImageData(0, 0, s, s).data; const px = []; for (let i = 0; i < d.length; i += 4) px.push([d[i], d[i + 1], d[i + 2]]);
  let cent = Array.from({ length: 6 }, (_, i) => px[Math.floor(i * px.length / 6 + px.length / 12)].slice());
  let asg = new Array(px.length).fill(0);
  for (let it = 0; it < 12; it++) {
    px.forEach((p, i) => { let b = 0, bd = 1e9; cent.forEach((q, k) => { const dd = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2; if (dd < bd) { bd = dd; b = k; } }); asg[i] = b; });
    cent = cent.map((q, k) => { const m = px.filter((_, i) => asg[i] === k); if (!m.length) return q; return [0, 1, 2].map(j => m.reduce((a, p) => a + p[j], 0) / m.length); });
  }
  const counts = cent.map((_, k) => asg.filter(a => a === k).length);
  const hex = (q) => '#' + q.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  const out = cent.map((q, k) => ({ hex: hex(q), share: +(counts[k] / px.length).toFixed(3) })).filter(p => p.share > .02).sort((a, b) => b.share - a.share);
  const lum = px.reduce((a, p) => a + (0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]), 0) / px.length / 255;
  return { palette: out, lightness: Math.round(lum * 100) };
}
function exportCanvas(src, w, h) {
  const full = src.toDataURL('image/jpeg', .86);
  const tw = w >= h ? 640 : Math.round(640 * w / h), th = w >= h ? Math.round(640 * h / w) : 640;
  const t = document.createElement('canvas'); t.width = tw; t.height = th; const tg = t.getContext('2d'); tg.imageSmoothingQuality = 'high'; tg.drawImage(src, 0, 0, tw, th);
  return { full, thumb: t.toDataURL('image/jpeg', .82), w, h, ...palette(src) };
}
window.renderOne = (spec) => {
  seed = spec.seed || 7;
  const [w, h] = spec.size;
  if (spec.draw || spec.material) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    (spec.draw ? D[spec.draw] : M[spec.material])(g, w, h);
    return exportCanvas(c, w, h);
  }
  const [sc, cam] = S[spec.scene](w, h, spec.o || {});
  renderer.render(sc, cam);
  return exportCanvas(renderer.domElement, w, h);
};
