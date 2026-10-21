// Bundles the captured real screens (capture/snap.json), the app's compiled CSS and the voice layer (src/) into one
// self-contained page: dist/live-lumens-prototype.html. Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const here = (p) => new URL(p, import.meta.url);
const snap = JSON.parse(readFileSync(here("capture/snap.json"), "utf8"));
const css = readFileSync(here("src/voice.css"), "utf8");
const js = readFileSync(here("src/voice.js"), "utf8");
const data = JSON.stringify({ screens: snap.screens, slides: snap.slides, htmlClass: snap.htmlClass }).replace(/</g, "\\u003c");
const appCss = snap.css.replace(/\/\* \[project\][^*]*\*\//g, "").replace(/<\/style/gi, "<\\/style");
const page = `<title>Live Lumens Prototype</title>
<meta name="description" content="Interactive prototype of Studiolo's real-time voice narrator, on the app's real screens.">
<!-- Screens and styles: studiolo /dev/specimens, captured read-only by capture/capture.cjs. Voice layer: src/. -->
<style>${appCss}</style>
<style>${css}</style>
<div id="vx-app"></div>
<script type="application/json" id="vx-data">${data}</script>
<script>${js}</script>
`;
mkdirSync(here("dist/"), { recursive: true });
writeFileSync(here("dist/live-lumens-prototype.html"), page);
console.log("dist/live-lumens-prototype.html", (page.length / 1024).toFixed(0), "KB");
