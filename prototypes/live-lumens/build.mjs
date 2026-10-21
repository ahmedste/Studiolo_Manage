// Bundles the captured real screens (capture/snap.json), the app's compiled CSS and the voice layer (src/) into one
// self-contained page: dist/studiolo-dock-prototype.html. Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const here = (p) => new URL(p, import.meta.url);
const snap = JSON.parse(readFileSync(here("capture/snap.json"), "utf8"));
const css = readFileSync(here("src/dock.css"), "utf8");
const js = readFileSync(here("src/dock.js"), "utf8");
const graph = JSON.parse(readFileSync(here("capture/graph.json"), "utf8"));
const { islamic, ...screens } = snap.screens;
const data = JSON.stringify({ screens, graph, htmlClass: snap.htmlClass }).replace(/</g, "\\u003c");
const appCss = snap.css.replace(/\/\* \[project\][^*]*\*\//g, "").replace(/<\/style/gi, "<\\/style");
const page = `<title>Studiolo Dock Prototype</title>
<meta name="description" content="One assistant docked on every Studiolo page: continuous conversation, quick Lumens, copilot bridge.">
<!-- Screens and styles: studiolo /dev/specimens, captured read-only by capture/capture.cjs. Voice layer: src/. -->
<style>${appCss}</style>
<style>${css}</style>
<div id="vx-app"></div>
<script type="application/json" id="vx-data">${data}</script>
<script>${js}</script>
`;
mkdirSync(here("dist/"), { recursive: true });
writeFileSync(here("dist/studiolo-dock-prototype.html"), page);
console.log("dist/studiolo-dock-prototype.html", (page.length / 1024).toFixed(0), "KB");
