// Bundles the Loci routines prototype: the real shell, Today and Loci screens with the app's compiled CSS (captured
// read-only from studiolo's /dev/specimens; see ../live-lumens/capture/capture.cjs), the Settings and memory
// prototype's styles (../settings-memory/src/settings.css), src/routines.css and src/routines.js. Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const here = (p) => new URL(p, import.meta.url);
const snap = JSON.parse(readFileSync(here("../live-lumens/capture/snap.json"), "utf8"));
const base = readFileSync(here("../settings-memory/src/settings.css"), "utf8");
const css = readFileSync(here("src/routines.css"), "utf8");
const js = readFileSync(here("src/routines.js"), "utf8");
const { library, climate, today } = snap.screens;
const data = JSON.stringify({ screens: { library, climate, today }, htmlClass: snap.htmlClass }).replace(/</g, "\\u003c");
const appCss = snap.css.replace(/\/\* \[project\][^*]*\*\//g, "").replace(/<\/style/gi, "<\\/style");
const page = `<title>Studiolo Loci Routines</title>
<meta name="description" content="Loci routines: small jobs Loci does on a schedule. Each reads one place on your map and brings back cards to keep or dismiss.">
<!-- Screens and styles: studiolo /dev/specimens, captured read-only. Routines: src/routines.js. -->
<style>${appCss}</style>
<style>${base}</style>
<style>${css}</style>
<div id="vx-app"></div>
<script type="application/json" id="vx-data">${data}</script>
<script>${js}</script>
`;
mkdirSync(here("dist/"), { recursive: true });
writeFileSync(here("dist/loci-routines-prototype.html"), page);
console.log("dist/loci-routines-prototype.html", (page.length / 1024).toFixed(0), "KB");
