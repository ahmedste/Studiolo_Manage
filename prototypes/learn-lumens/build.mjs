// Bundles Learn slice 2 (one Lumen, three formats): the real screens and the app's compiled CSS (captured read-only
// from studiolo's /dev/specimens; see ../live-lumens/capture/capture.cjs), src/learn.js (Learn) and src/listen.js
// (the Listen format, the brief and the player). listen.js loads first and registers window.LearnExt. Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const here = (p) => new URL(p, import.meta.url);
const snap = JSON.parse(readFileSync(here("../live-lumens/capture/snap.json"), "utf8"));
const learnCss = readFileSync(here("src/learn.css"), "utf8");
const learnJs = readFileSync(here("src/learn.js"), "utf8");
const css = readFileSync(here("src/listen.css"), "utf8");
const js = readFileSync(here("src/listen.js"), "utf8");
const { today, library, climate, course } = snap.screens;
const data = JSON.stringify({ screens: { today, library, climate, course }, htmlClass: snap.htmlClass }).replace(/</g, "\\u003c");
const appCss = snap.css.replace(/\/\* \[project\][^*]*\*\//g, "").replace(/<\/style/gi, "<\\/style");
const page = `<title>Learn, One Lumen</title>
<meta name="description" content="Studiolo's Learn with one kind of thing, the Lumen, in three formats: watch it, listen to it, or read it. Made from one brief, kept in one place.">
<!-- Screens and styles: studiolo /dev/specimens, captured read-only. Learn: src/learn.js. Listen and the brief: src/listen.js. -->
<style>${appCss}</style>
<style>${learnCss}</style>
<style>${css}</style>
<div id="vx-app"></div>
<script type="application/json" id="vx-data">${data}</script>
<script>${js}</script>
<script>${learnJs}</script>
`;
mkdirSync(here("dist/"), { recursive: true });
writeFileSync(here("dist/learn-lumens-prototype.html"), page);
console.log("dist/learn-lumens-prototype.html", (page.length / 1024).toFixed(0), "KB");
