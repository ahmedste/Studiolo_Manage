// Bundles Learn slice 2 (one Lumen, three formats): the real screens and the app's compiled CSS (captured read-only
// from studiolo's /dev/specimens; see ../live-lumens/capture/capture.cjs), src/learn.js (Learn) and src/listen.js
// (the Listen format, the brief and the player), src/read.js (the Read format's articles and figures), src/dictation.js (the
// mic: Moonshine on-device dictation, with fallbacks). listen.js loads first and registers window.LearnExt; dictation.js
// sets window.Dictation before learn.js. Run: node build.mjs, then node serve.mjs for on-device dictation.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const here = (p) => new URL(p, import.meta.url);
const snap = JSON.parse(readFileSync(here("../live-lumens/capture/snap.json"), "utf8"));
const learnCss = readFileSync(here("src/learn.css"), "utf8");
const learnJs = readFileSync(here("src/learn.js"), "utf8");
const css = readFileSync(here("src/listen.css"), "utf8");
const js = readFileSync(here("src/listen.js"), "utf8");
const readCss = readFileSync(here("src/read.css"), "utf8");
const readJs = readFileSync(here("src/read.js"), "utf8");
const dictJs = readFileSync(here("src/dictation.js"), "utf8");
const { today, library, climate, course } = snap.screens;
const data = JSON.stringify({ screens: { today, library, climate, course }, htmlClass: snap.htmlClass }).replace(/</g, "\\u003c");
const appCss = snap.css.replace(/\/\* \[project\][^*]*\*\//g, "").replace(/<\/style/gi, "<\\/style");
const page = `<title>Learn, One Lumen</title>
<meta name="description" content="Studiolo's Learn with one kind of thing, the Lumen, in three formats: watch it, listen to it, or read it. Made from one brief, kept in one place.">
<!-- Screens and styles: studiolo /dev/specimens, captured read-only. Learn: src/learn.js. Listen and the brief: src/listen.js. Read: src/read.js. Dictation: src/dictation.js. -->
<style>${appCss}</style>
<style>${learnCss}</style>
<style>${css}</style>
<style>${readCss}</style>
<div id="vx-app"></div>
<script type="application/json" id="vx-data">${data}</script>
<script>${js}</script>
<script>${readJs}</script>
<script>${dictJs}</script>
<script>${learnJs}</script>
`;
mkdirSync(here("dist/"), { recursive: true });
writeFileSync(here("dist/learn-lumens-prototype.html"), page);
console.log("dist/learn-lumens-prototype.html", (page.length / 1024).toFixed(0), "KB");
