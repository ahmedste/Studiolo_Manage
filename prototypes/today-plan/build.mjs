// Bundles the planning prototype: Today's real screen and the app's compiled CSS (captured read-only from studiolo's
// /dev/specimens; see ../live-lumens/capture/capture.cjs) plus the planner in src/. Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const here = (p) => new URL(p, import.meta.url);
const snap = JSON.parse(readFileSync(here("../live-lumens/capture/snap.json"), "utf8"));
const css = readFileSync(here("src/plan.css"), "utf8");
const js = readFileSync(here("src/plan.js"), "utf8");
const data = JSON.stringify({ screens: { today: snap.screens.today }, htmlClass: snap.htmlClass }).replace(/</g, "\\u003c");
const appCss = snap.css.replace(/\/\* \[project\][^*]*\*\//g, "").replace(/<\/style/gi, "<\\/style");
const page = `<title>Today, Planned</title>
<meta name="description" content="Studiolo's Today as a learning-planning calendar: the copilot plans your week of Lumens, reading Lumens and live sessions, and adjusts next week from what happened.">
<!-- Screens and styles: studiolo /dev/specimens, captured read-only. Planning: src/. -->
<style>${appCss}</style>
<style>${css}</style>
<div id="vx-app"></div>
<script type="application/json" id="vx-data">${data}</script>
<script>${js}</script>
`;
mkdirSync(here("dist/"), { recursive: true });
writeFileSync(here("dist/today-plan-prototype.html"), page);
console.log("dist/today-plan-prototype.html", (page.length / 1024).toFixed(0), "KB");
