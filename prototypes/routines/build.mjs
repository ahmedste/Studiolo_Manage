// Bundles the Routines prototype (version 6: a Commonplace tab with a page and an editor for each routine,
// and the real Loci panel).
// It uses the real shell and Today screen with the app's compiled CSS (captured read-only from studiolo's
// /dev/specimens; see ../live-lumens/capture/capture.cjs), the Settings and memory prototype's form styles
// (../settings-memory/src/settings.css), src/routines.css and src/routines.js. Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const here = (p) => new URL(p, import.meta.url);
const snap = JSON.parse(readFileSync(here("../live-lumens/capture/snap.json"), "utf8"));
const base = readFileSync(here("../settings-memory/src/settings.css"), "utf8");
const css = readFileSync(here("src/routines.css"), "utf8");
const js = readFileSync(here("src/routines.js"), "utf8");
const { library, today } = snap.screens;
const data = JSON.stringify({ screens: { library, today }, htmlClass: snap.htmlClass }).replace(/</g, "\\u003c");
const appCss = snap.css.replace(/\/\* \[project\][^*]*\*\//g, "").replace(/<\/style/gi, "<\\/style");
const page = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Studiolo Routines</title>
<meta name="description" content="Routines in Studiolo: a Commonplace tab of routine cards, a page and an editor for each routine, and the Loci panel beside them to ask, make and change.">
<!-- Screens and styles: studiolo /dev/specimens, captured read-only. Routines: src/routines.js. -->
<style>${appCss}</style>
<style>${base}</style>
<style>${css}</style>
<div id="vx-app"></div>
<script type="application/json" id="vx-data">${data}</script>
<script>${js}</script>
`;
mkdirSync(here("dist/"), { recursive: true });
writeFileSync(here("dist/routines-prototype.html"), page);
console.log("dist/routines-prototype.html", (page.length / 1024).toFixed(0), "KB");
