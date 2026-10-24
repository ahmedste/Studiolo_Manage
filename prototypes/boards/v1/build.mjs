// Bundles the Boards prototype into one page: src/boards.css, src/boards.js, and 15 of the generated pictures from
// ../commonplace-photos/img (640 px thumbs, inlined as data URIs with their size and first palette colour).
// Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const here = (p) => new URL(p, import.meta.url);
const meta = JSON.parse(readFileSync(here("../commonplace-photos/gen/meta.json"), "utf8"));
const names = ["windtowers", "section-windtower", "courtyard-morning", "courtyard-noon", "screen-shadow", "mat-jali", "courthouse-aerial", "plan-courtyard", "stepwell", "vaults", "earth-wall", "hypostyle", "brick-hall", "stair-light", "colonnade-dusk"];
const img = Object.fromEntries(names.map((n) => {
  const m = meta[n]; if (!m) throw new Error("no meta for " + n);
  const b64 = readFileSync(here(`../commonplace-photos/img/${n}-t.jpg`)).toString("base64");
  return [n, { src: `data:image/jpeg;base64,${b64}`, w: m.w, h: m.h, pal: m.palette[0].hex }];
}));
const css = readFileSync(here("src/boards.css"), "utf8");
const js = readFileSync(here("src/boards.js"), "utf8");
const page = `<title>Studiolo Boards</title>
<meta name="description" content="Boards in Studiolo: an infinite thinking canvas that lives on the Loci map, holds your real Commonplace items, Lumens and courses, and turns your arrows into a Lumen.">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap">
<!-- Boards prototype. Source: src/boards.css, src/boards.js; pictures from ../commonplace-photos/img. -->
<style>${css}</style>
<div id="bx-app"></div>
<script type="application/json" id="bx-img">${JSON.stringify(img)}</script>
<script>${js}</script>
`;
mkdirSync(here("dist/"), { recursive: true });
writeFileSync(here("dist/boards-prototype.html"), page);
console.log("dist/boards-prototype.html", (page.length / 1024).toFixed(0), "KB");
