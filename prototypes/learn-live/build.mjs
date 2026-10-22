// Bundles Learn slice 1: the real screens and the app's compiled CSS (captured read-only from studiolo's
// /dev/specimens; see ../live-lumens/capture/capture.cjs) plus the Learn redesign in src/. Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const here = (p) => new URL(p, import.meta.url);
const snap = JSON.parse(readFileSync(here("../live-lumens/capture/snap.json"), "utf8"));
const css = readFileSync(here("src/learn.css"), "utf8");
const js = readFileSync(here("src/learn.js"), "utf8");
const { today, library, climate, course } = snap.screens;
const data = JSON.stringify({ screens: { today, library, climate, course }, htmlClass: snap.htmlClass }).replace(/</g, "\\u003c");
const appCss = snap.css.replace(/\/\* \[project\][^*]*\*\//g, "").replace(/<\/style/gi, "<\\/style");
const page = `<title>Learn, Live</title>
<meta name="description" content="Studiolo's Learn tab reorganised around Live Lumens: browse Lumens and courses, go live on any Lumen, and talk to it as it's drawn.">
<!-- Screens and styles: studiolo /dev/specimens, captured read-only. Learn redesign and Live Lumens: src/. -->
<style>${appCss}</style>
<style>${css}</style>
<div id="vx-app"></div>
<script type="application/json" id="vx-data">${data}</script>
<script>${js}</script>
`;
mkdirSync(here("dist/"), { recursive: true });
writeFileSync(here("dist/learn-live-prototype.html"), page);
console.log("dist/learn-live-prototype.html", (page.length / 1024).toFixed(0), "KB");
