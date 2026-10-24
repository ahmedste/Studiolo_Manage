// Bundles the Settings and learner memory prototype: the real shell and Loci screen with the app's compiled CSS
// (captured read-only from studiolo's /dev/specimens; see ../live-lumens/capture/capture.cjs), src/settings.css and
// src/settings.js. Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const here = (p) => new URL(p, import.meta.url);
const snap = JSON.parse(readFileSync(here("../live-lumens/capture/snap.json"), "utf8"));
const css = readFileSync(here("src/settings.css"), "utf8");
const js = readFileSync(here("src/settings.js"), "utf8");
const { library, climate } = snap.screens;
const data = JSON.stringify({ screens: { library, climate }, htmlClass: snap.htmlClass }).replace(/</g, "\\u003c");
const appCss = snap.css.replace(/\/\* \[project\][^*]*\*\//g, "").replace(/<\/style/gi, "<\\/style");
const page = `<title>Studiolo Learner Memory</title>
<meta name="description" content="Studiolo's Settings in five tabs, and learner memory kept as cards on the learner's own map: what Loci knows at each place, why, and the exact text it reads.">
<!-- Screens and styles: studiolo /dev/specimens, captured read-only. Settings and memory: src/settings.js. -->
<style>${appCss}</style>
<style>${css}</style>
<div id="vx-app"></div>
<script type="application/json" id="vx-data">${data}</script>
<script>${js}</script>
`;
mkdirSync(here("dist/"), { recursive: true });
writeFileSync(here("dist/settings-memory-prototype.html"), page);
console.log("dist/settings-memory-prototype.html", (page.length / 1024).toFixed(0), "KB");
