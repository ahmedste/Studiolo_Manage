// Checks dist/ipad-prototype.html at every iPad size and the Split View widths, in light and dark:
// no console errors, no horizontal scroll, the size class each width should get, and the main flows.
// Run from a folder where `playwright` resolves:  NODE_PATH=<a node_modules with playwright> node check.cjs [outdir]
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const OUT = process.argv[2] || path.join(__dirname, "check-out");
const FILE = `file://${path.join(__dirname, "dist/ipad-prototype.html")}?frame=0`;
const SIZES = {
  "air-p": [820, 1180], "air-l": [1180, 820], "pro-p": [1024, 1366], "pro-l": [1366, 1024], "mini-p": [744, 1133], "mini-l": [1133, 744],
  w981: [981, 1024], w694: [694, 1024], w507: [507, 1024], w320: [320, 1024], phone: [390, 844],
};
const ONLY = process.argv[3] ? process.argv[3].split(",") : null;

const hscroll = () => {
  const out = [];
  const W = innerWidth;
  if (document.scrollingElement.scrollWidth > W + 1) out.push(`document ${document.scrollingElement.scrollWidth}`);
  // a visible scroller that scrolls sideways but was not meant to (rails and column views are meant to)
  for (const el of document.querySelectorAll(".m-stage, .r-scroll, .m-page, .m-sheet-body, .ip-side-list, .m-card-body")) {
    const s = getComputedStyle(el); if (s.display === "none" || el.closest("[aria-hidden=true]")) continue;
    if (el.scrollWidth > el.clientWidth + 2 && s.overflowX !== "hidden") out.push(`${el.className.split(" ")[0]} ${el.scrollWidth}>${el.clientWidth}`);
  }
  // anything visible that runs off the right edge of the window
  const offs = [...document.querySelectorAll("#app button, #app h1, #app h2, #app p")].filter((e) => { const b = e.getBoundingClientRect(); if (!b.width || e.closest("[aria-hidden=true], .m-rail, .m-suggest, .p-starters, .r-secchips, .ip-cols, .p-chiprow, .cp-types, .cp-pills, .cp-slim, .r-switch, .m-drawer, .ip-side, .r-room:not(.is-open), .m-sheet:not(.is-open), .v-viewer:not(.is-open), .r-interrupt, .r-qs, .cp-shelf, .cp-shelfrow, #pop, .m-toast, .p-tools")) return false; const st = getComputedStyle(e); return st.visibility !== "hidden" && b.right > W + 2 && b.left < W; });
  offs.slice(0, 3).forEach((e) => out.push(`off-right: ${(e.innerText || e.getAttribute("aria-label") || e.tagName).trim().slice(0, 30)} ${Math.round(e.getBoundingClientRect().right)}`));
  return out;
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  let fails = 0;
  for (const [name, [w, h]] of Object.entries(SIZES)) {
    if (ONLY && !ONLY.includes(name)) continue;
    for (const scheme of ["light", "dark"]) {
      const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, colorScheme: scheme });
      const p = await ctx.newPage();
      const errs = [];
      p.on("console", (m) => { if (m.type() === "error" && !/fonts\.(googleapis|gstatic)|ERR_|net::/.test(m.text())) errs.push(m.text().slice(0, 160)); });
      p.on("pageerror", (e) => errs.push(`pageerror: ${e.message.slice(0, 160)}`));
      const notes = [];
      const shot = async (k) => { if (scheme === "light" || ["loci", "learn-listen", "cp"].includes(k)) await p.screenshot({ path: `${OUT}/${name}-${k}${scheme === "dark" ? "-dark" : ""}.png` }); };
      const check = async (k) => { const hs = await p.evaluate(hscroll); if (hs.length) notes.push(`${k}: hscroll ${hs.join("; ")}`); };
      try {
        await p.goto(FILE, { waitUntil: "load" });
        await p.waitForTimeout(2600);
        // Headless Chromium has speech recognition that ends at once with no microphone: use the simulated engine.
        await p.evaluate(() => window.Dictation.setChoice("simulated"));
        const cls = await p.evaluate(() => ({ regular: document.getElementById("app").classList.contains("ip-regular"), wide: document.getElementById("app").classList.contains("ip-wide"), docked: document.getElementById("app").classList.contains("ip-docked") }));
        const wantRegular = w >= 700, wantWide = w >= 1000 && w > h;
        if (cls.regular !== wantRegular || cls.wide !== wantWide) notes.push(`size class ${JSON.stringify(cls)} at ${w}x${h}`);
        await shot("loci"); await check("loci");
        // the bar's mic, everywhere
        const mic = await p.evaluate(() => { const m = document.getElementById("mic"); const r = m?.getBoundingClientRect(); return r ? Math.round(r.width) : 0; });
        if (mic < 44) notes.push(`mic ${mic}px`);
        // Loci: open a topic; the card or inspector shows it
        await p.evaluate(() => MP.goTo(MP.S.topics.find((t) => t.name === "Daylight & shading").id));
        await p.waitForTimeout(700);
        await p.evaluate(() => MP.setDetent("card")); await p.waitForTimeout(500);
        await shot("topic"); await check("topic");
        // List
        await p.evaluate(() => { MP.S.view = "list"; MP.render(); }); await p.waitForTimeout(400);
        await shot("list"); await check("list");
        await p.evaluate(() => { MP.S.view = "map"; MP.render(); }); await p.waitForTimeout(700);
        await shot("map"); await check("map");
        await p.evaluate(() => { MP.S.view = "palace"; MP.render(); });
        // Learn and a Listen room, then leave it playing
        await p.evaluate(() => MP.setDest("learn")); await p.waitForTimeout(300);
        await shot("learn"); await check("learn");
        await p.evaluate(() => window.MP_PAGES.learn.openLumen("l1", { fmt: "listen" })); await p.waitForTimeout(600);
        await shot("learn-listen"); await check("listen");
        await p.evaluate(() => { const b = document.createElement("button"); b.dataset.p = "rfmt"; b.dataset.f = "read"; window.MP_PAGES.learn.click(b); }); await p.waitForTimeout(400);
        await shot("learn-read"); await check("read");
        await p.evaluate(() => { const b = document.createElement("button"); b.dataset.p = "rfmt"; b.dataset.f = "listen"; window.MP_PAGES.learn.click(b); const c = document.createElement("button"); c.dataset.p = "rclose"; window.MP_PAGES.learn.click(c); }); await p.waitForTimeout(500);
        const nowPlaying = await p.evaluate(() => !!document.querySelector(".m-mini") && getComputedStyle(document.querySelector("#dmini")).display !== "none");
        if (!nowPlaying) notes.push("no Now Playing after leaving Listen");
        await shot("now-playing");
        // Watch, then leave: picture in picture on iPad
        await p.evaluate(() => window.MP_PAGES.learn.openLumen("l2", { fmt: "watch" })); await p.waitForTimeout(600);
        await shot("learn-watch"); await check("watch");
        await p.evaluate(() => { const c = document.createElement("button"); c.dataset.p = "rclose"; window.MP_PAGES.learn.click(c); }); await p.waitForTimeout(500);
        const pipOn = await p.evaluate(() => !document.getElementById("pip").hidden);
        if (w >= 700 && !pipOn) notes.push("no PiP tile after leaving Watch");
        await shot("pip");
        // a course part
        await p.evaluate(() => { const b = document.createElement("button"); b.dataset.p = "course"; b.dataset.id = MP.D.courses[0].id; b.dataset.k = "2"; window.MP_PAGES.learn.click(b); }); await p.waitForTimeout(600);
        await shot("course"); await check("course");
        await p.evaluate(() => { const c = document.createElement("button"); c.dataset.p = "rclose"; window.MP_PAGES.learn.click(c); }); await p.waitForTimeout(300);
        // Commonplace: the wall, then a note beside it, then a photo
        await p.evaluate(() => MP.setDest("commonplace")); await p.waitForTimeout(500);
        await shot("cp"); await check("cp");
        await p.evaluate(() => MP.openItem("ln")); await p.waitForTimeout(600);
        await shot("cp-item"); await check("cp-item");
        await p.evaluate(() => MP.closeSheet()); await p.waitForTimeout(300);
        const photo = await p.evaluate(() => MP.S.items.find((x) => x.type === "photo").id);
        await p.evaluate((id) => MP.openItem(id), photo); await p.waitForTimeout(500);
        await shot("cp-photo");
        await p.evaluate(() => { const b = document.createElement("button"); b.dataset.p = "vclose"; window.MP_PAGES.commonplace.click(b); });
        // interactions, once per orientation
        if (scheme === "light" && (name === "air-l" || name === "air-p")) {
          await p.evaluate(() => MP.setDest("loci")); await p.waitForTimeout(600);
          if (name === "air-p") {
            await p.click(".ip-sidebtn"); await p.waitForTimeout(450);
            if (!(await p.evaluate(() => document.getElementById("app").classList.contains("ip-side-open")))) notes.push("sidebar button did not open the sidebar");
            await shot("side-open");
            await p.click('#side [data-ip="dest"][data-k="learn"]'); await p.waitForTimeout(450);
            const st = await p.evaluate(() => ({ dest: MP.S.dest, open: document.getElementById("app").classList.contains("ip-side-open") }));
            if (st.dest !== "learn" || st.open) notes.push(`sidebar row: ${JSON.stringify(st)}`);
            await p.evaluate(() => MP.setDest("loci")); await p.waitForTimeout(500);
          } else {
            await p.evaluate(() => MP.setDetent("card")); await p.waitForTimeout(400);
            const g = await p.locator("#inspGrab").boundingBox();
            await p.mouse.move(g.x + g.width / 2, g.y + g.height / 2); await p.mouse.down(); await p.mouse.move(g.x + g.width / 2, g.y + 400, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(500);
            if (await p.evaluate(() => MP.S.detent) !== "full") notes.push(`inspector drag gave ${await p.evaluate(() => MP.S.detent)}`);
            const e = await p.locator("#inspEdge").boundingBox();
            await p.mouse.move(e.x + 10, e.y + 40); await p.mouse.down(); await p.mouse.move(e.x - 70, e.y + 40, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(300);
            const iw = await p.evaluate(() => window.IPAD_LAYOUT.state.inspW);
            if (iw < 420) notes.push(`inspector width ${iw}`);
            await shot("inspector-full");
            await p.evaluate(() => MP.setDetent("card"));
          }
          // ⌘K (Ctrl K here) focuses the bar; typing a place and Return opens it
          await p.keyboard.press("Control+KeyK"); await p.waitForTimeout(200);
          if (!(await p.evaluate(() => document.activeElement?.id === "barInput"))) notes.push("Ctrl K did not focus the bar");
          await p.keyboard.type("Passive design"); await p.waitForTimeout(250); await shot("find");
          await p.keyboard.press("Enter"); await p.waitForTimeout(600);
          if (await p.evaluate(() => MP.nameOf(MP.S.openId)) !== "Passive design") notes.push("Return did not open Passive design");
          // the mic: tap to dictate (simulated without a microphone), tap again to stop
          await p.click("#mic"); await p.waitForTimeout(1600);
          const heard = await p.evaluate(() => ({ listening: MP.S.bar.listening, text: document.getElementById("barInput").value }));
          await shot("dictating");
          await p.click("#mic"); await p.waitForTimeout(400);
          if (!heard.listening && !heard.text) notes.push("mic tap did nothing");
          await p.evaluate(() => { document.getElementById("barInput").value = ""; MP.endBarMode(); });
          // hold Ctrl Shift D to talk; release sends to Loci
          await p.keyboard.down("Control"); await p.keyboard.down("Shift"); await p.keyboard.down("KeyD"); await p.waitForTimeout(1800);
          await p.keyboard.up("KeyD"); await p.keyboard.up("Shift"); await p.keyboard.up("Control"); await p.waitForTimeout(1200);
          if (!(await p.evaluate(() => MP.S.thread.length))) notes.push("hold to talk sent nothing");
          await shot("talked");
        }
        // the shortcuts HUD
        if (w >= 700) { await p.keyboard.down("Control"); await p.keyboard.press("Slash"); await p.keyboard.up("Control"); await p.waitForTimeout(250); await shot("hud"); await p.keyboard.press("Escape"); }
      } catch (e) { notes.push(`threw: ${e.message.slice(0, 200)}`); }
      if (errs.length) notes.push(`errors: ${errs.join(" | ")}`);
      console.log(`${notes.length ? "FAIL" : "ok  "} ${name} ${scheme}${notes.length ? `\n   - ${notes.join("\n   - ")}` : ""}`);
      if (notes.length) fails++;
      await ctx.close();
    }
  }
  await b.close();
  console.log(fails ? `${fails} runs with problems` : "all runs clean");
  process.exitCode = fails ? 1 : 0;
})();
