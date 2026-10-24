/* The one "generated" picture in the Lumen pictures prototype: a Gulf barjeel, open on four sides.
   It stands in for what an image model would make when the learner's Commonplace has no picture for a point.
   Uses the helpers in ../../commonplace-photos/gen/scenes.js. */
S.barjeel = (w, h) => {
  const sc = setup(w, h); sky(sc, '#b9c9d6', '#efe7da', [70, 260]); sun(sc, [30, 46, 26], '#fff4e4', 3.0, 60, '#d9e4ee', '#b9a88e', 1.0);
  const coral = mat('#e2d6c0', { map: plasterTex('#e2d6c0', [4, 4]) });
  const teak = mat('#5a3f2c');
  ground(sc, mat('#d7c8ae', { map: plasterTex('#d7c8ae', [50, 50]) }));
  // the sea, a flat band at the end of the lane
  const sea = add(sc, new T.PlaneGeometry(400, 120), mat('#7f9fae', { roughness: .35 }), 0, .05, -150); sea.rotation.x = -Math.PI / 2;
  // the house and its neighbours along a lane
  box(sc, 12, 6.5, 12, coral, 3, 0, -10);
  box(sc, 9, 5.5, 10, coral, -9, 0, -16); box(sc, 8, 6, 9, coral, 12, 0, -24); box(sc, 10, 5, 8, coral, -12, 0, -34);
  // the barjeel: a square tower open on all four faces, divided by fins
  const tx = 5, tz = -8, base = 6.5, th = 8, s = 3.2;
  box(sc, s, th, s, coral, tx, base, tz);
  for (const [dx, dz, ry] of [[0, s / 2, 0], [0, -s / 2, 0], [s / 2, 0, Math.PI / 2], [-s / 2, 0, Math.PI / 2]])
    for (let k = 0; k < 3; k++) box(sc, .55, 4.2, .12, mat('#2a2018'), tx + dx + (ry ? 0 : -.9 + k * .9), base + th - 5.2, tz + dz + (ry ? -.9 + k * .9 : 0), ry);
  box(sc, s + .5, .35, s + .5, coral, tx, base + th, tz);
  for (let k = 0; k < 4; k++) box(sc, .14, .14, 3.6, teak, tx - 1.4 + k * .9, base + th - .4, tz); // poles through the top
  // a second, smaller tower further off
  box(sc, 2.2, 6, 2.2, coral, -9, 5.5, -18);
  for (let k = 0; k < 2; k++) box(sc, .45, 3, .1, mat('#2a2018'), -9.45 + k * .9, 8.2, -16.9);
  person(sc, -1.5, 3, '#f1ede6'); person(sc, -.6, 2.4, '#1d1a18', 1.62);
  return [sc, camera(w, h, 48, [-3, 2, 14], [4, 8, -20])];
};
