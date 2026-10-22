// Bundles Learn with Dialogues: the real screens and the app's compiled CSS (captured read-only from studiolo's
// /dev/specimens; see ../live-lumens/capture/capture.cjs), Learn slice 1 (../learn-live/src) and the Dialogues layer
// in src/. dialogues.js loads first and registers window.LearnExt; learn.js picks it up. Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const here = (p) => new URL(p, import.meta.url);
const snap = JSON.parse(readFileSync(here("../live-lumens/capture/snap.json"), "utf8"));
const learnCss = readFileSync(here("../learn-live/src/learn.css"), "utf8");
const learnJs = readFileSync(here("../learn-live/src/learn.js"), "utf8");
const css = readFileSync(here("src/dialogues.css"), "utf8");
const js = readFileSync(here("src/dialogues.js"), "utf8");
const { today, library, climate, course } = snap.screens;
const data = JSON.stringify({ screens: { today, library, climate, course }, htmlClass: snap.htmlClass }).replace(/</g, "\\u003c");
const appCss = snap.css.replace(/\/\* \[project\][^*]*\*\//g, "").replace(/<\/style/gi, "<\\/style");
const page = `<title>Learn, Listen</title>
<meta name="description" content="Studiolo's Learn with Dialogues: two voices talk one idea through for 10 to 30 minutes, made for a goal, from your own sources, to hear on a walk, a ride or a drive.">
<!-- Screens and styles: studiolo /dev/specimens, captured read-only. Learn slice 1: ../learn-live/src. Dialogues: src/. -->
<style>${appCss}</style>
<style>${learnCss}</style>
<style>${css}</style>
<div id="vx-app"></div>
<script type="application/json" id="vx-data">${data}</script>
<script>${js}</script>
<script>${learnJs}</script>
`;
mkdirSync(here("dist/"), { recursive: true });
writeFileSync(here("dist/learn-dialogues-prototype.html"), page);
console.log("dist/learn-dialogues-prototype.html", (page.length / 1024).toFixed(0), "KB");
