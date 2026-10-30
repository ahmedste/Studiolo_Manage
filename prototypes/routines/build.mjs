// Bundles the Tasks prototype (version 9: a Loci place with Tasks, Finds, Waiting, Activity and Connections. Tasks are
// studies, long work Loci does once in depth, and routines, with a page and a flow editor each; and the real Loci panel).
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
<meta name="description" content="Tasks in Studiolo: studies Loci does once, in depth, while you're away, and routines, in a Loci place of cards, a page and a flow editor (a trigger, then steps) for each routine, Finds pages from the sources you follow, Connections, and the Loci panel beside them.">
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
