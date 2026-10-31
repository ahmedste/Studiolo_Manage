// Builds dist/ipad-prototype.html, one file:
// - the phone prototype's modules, unchanged (../mobile-loci/src: data.js, learn.js, commonplace.js, app.js and their CSS),
//   so a compact window is exactly the phone shell and a regular one is the same app laid out for iPad;
// - the iPad layer (src/ipad-pre.js before the phone modules, src/ipad.js and src/ipad.css after them);
// - Studiolo's own Palace and Map (the bundles from ../boards/loci, unchanged) and Learn's dictation (../learn-lumens);
// - the sample map, the pictures and their metadata, inlined.
// One small patch widens what the phone shell exports on window.MP (asserted below), so the iPad layer can drive the
// card, the bar and the Loci flows without copying them.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
const dir = new URL(".", import.meta.url);
const read = (p) => readFileSync(new URL(p, dir), "utf8");
const safe = (js) => js.replace(/<\/script/gi, "<\\/script");
const PHONE = "../mobile-loci/";

const graph = JSON.parse(read("../live-lumens/capture/graph.json"));
const img = Object.fromEntries(
  readdirSync(new URL(`${PHONE}img/`, dir)).filter((f) => f.endsWith(".jpg"))
    .map((f) => [f.replace(/\.jpg$/, ""), `data:image/jpeg;base64,${readFileSync(new URL(`${PHONE}img/${f}`, dir)).toString("base64")}`]),
);
const pics = JSON.parse(read("../commonplace-photos/gen/meta.json"));
const meta = Object.fromEntries(Object.entries(pics).map(([k, v]) => [k, [v.w, v.h, v.lightness, v.palette.slice(0, 4).map((p) => p.hex)]]));
const data = read(`${PHONE}src/data.js`).replace("/*GRAPH*/ { topics: [], relations: [] }", JSON.stringify(graph)).replace("/*IMG*/ {}", JSON.stringify(img)).replace("/*META*/ {}", JSON.stringify(meta));
if (data.includes("/*GRAPH*/") || data.includes("/*IMG*/") || data.includes("/*META*/")) throw new Error("data placeholders missing");

// The phone shell, with more of its own functions exported for the iPad layer. Nothing else in it changes.
const EXPORT_AT = "openThing: (id) => openThing(id), isTopic,";
let phoneApp = read(`${PHONE}src/app.js`);
if (!phoneApp.includes(EXPORT_AT)) throw new Error("app.js export anchor missing: update the patch in build.mjs");
phoneApp = phoneApp.replace(EXPORT_AT, `${EXPORT_AT}
    setDetent, targetHeight, goBack, goHome, submitBar, thingMenu, plusMenu, endBarMode, startNaming, openPlayer, paintCard, current, cardModel,`);

let app = read("src/app.html");
const parts = {
  "<!--APP-CSS-->": [
    `<style>/* Studiolo's own CSS for the Map and the Palace, scoped to .loci-appmap (../boards/loci) */\n${read("../boards/loci/appmap.css")}</style>`,
    `<style>/* the phone shell (../mobile-loci/src) */\n${read(`${PHONE}src/app.css`)}</style>`,
    `<style>${read(`${PHONE}src/learn.css`)}</style>`,
    `<style>${read(`${PHONE}src/commonplace.css`)}</style>`,
    `<style>/* the iPad layer */\n${read("src/ipad.css")}</style>`,
  ].join("\n"),
  "<!--APP-JS-->": [
    `<script>/* Studiolo's PalaceEngine (../boards/loci/palace.js) */\n${safe(read("../boards/loci/palace.js"))}</script>`,
    `<script>/* Studiolo's GraphMap (../boards/loci/appmap.js) */\n${safe(read("../boards/loci/appmap.js"))}</script>`,
    `<script>${safe(data)}</script>`,
    `<script>${safe(read("../learn-lumens/src/dictation.js"))}</script>`,
    `<script>${safe(read("src/ipad-pre.js"))}</script>`,
    `<script>${safe(read(`${PHONE}src/learn.js`))}</script>`,
    `<script>${safe(read(`${PHONE}src/commonplace.js`))}</script>`,
    `<script>${safe(phoneApp)}</script>`,
    `<script>${safe(read("src/ipad.js"))}</script>`,
  ].join("\n"),
};
for (const [mark, html] of Object.entries(parts)) {
  if (!app.includes(mark)) throw new Error(`${mark} missing`);
  app = app.replace(mark, () => html);
}

let page = read("src/frame.html");
if (!page.includes("/*APP*/\"\"")) throw new Error("APP placeholder missing");
// The frame's other app (Split View): three of the pictures, to drag into Studiolo.
const SIDE = ["courtyard-morning", "mat-zellige", "stair-light"];
page = page.replace("/*SIDE*/{}", () => JSON.stringify(Object.fromEntries(SIDE.map((k) => [k, img[k]]))));
page = page.replace("/*APP*/\"\"", () => JSON.stringify(app).replace(/<\//g, "<\\/"));
if (!existsSync(new URL("dist/", dir))) mkdirSync(new URL("dist/", dir));
writeFileSync(new URL("dist/ipad-prototype.html", dir), page);
console.log("Wrote dist/ipad-prototype.html,", (page.length / 1024).toFixed(0), "KB");

// The same page for a claude.ai artifact, which wraps the file in its own document.
const bare = page.replace(/<!doctype html>\s*/i, "").replace(/<html[^>]*>\s*/i, "").replace(/<\/?head>\s*/gi, "").replace(/<body>\s*/i, "").replace(/<\/body>\s*<\/html>\s*$/i, "")
  .replace(/<meta charset="utf-8">\s*/i, "").replace(/<meta name="viewport"[^>]*>\s*/i, "");
writeFileSync(new URL("dist/artifact.html", dir), bare);
