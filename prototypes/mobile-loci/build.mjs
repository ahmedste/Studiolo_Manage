// Builds dist/mobile-loci-prototype.html, one file:
// - the phone app (src/app.html) with its CSS and JS, the sample map (../live-lumens/capture/graph.json) and the
//   pictures (img/) inlined;
// - Studiolo's own Palace and Map, the bundles from ../boards/loci (palace.js, appmap.js, appmap.css; see its README),
//   unchanged, so the 3D and 2D views are the app's engines, not redrawings;
// - Learn's dictation (../learn-lumens/src/dictation.js), so the mic is a real microphone where the browser allows it.
// On a phone the file runs the app full screen; on a wider screen it shows it in a 390 × 844 frame beside a guide.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
const dir = new URL(".", import.meta.url);
const read = (p) => readFileSync(new URL(p, dir), "utf8");
const safe = (js) => js.replace(/<\/script/gi, "<\\/script");

const graph = JSON.parse(read("../live-lumens/capture/graph.json"));
const img = Object.fromEntries(
  readdirSync(new URL("img/", dir)).filter((f) => f.endsWith(".jpg"))
    .map((f) => [f.replace(/\.jpg$/, ""), `data:image/jpeg;base64,${readFileSync(new URL(`img/${f}`, dir)).toString("base64")}`]),
);
const data = read("src/data.js").replace("/*GRAPH*/ { topics: [], relations: [] }", JSON.stringify(graph)).replace("/*IMG*/ {}", JSON.stringify(img));
if (data.includes("/*GRAPH*/") || data.includes("/*IMG*/")) throw new Error("data placeholders missing");

let app = read("src/app.html");
const parts = {
  "<!--APP-CSS-->": `<style>/* Studiolo's own CSS for the Map and the Palace, scoped to .loci-appmap (../boards/loci) */\n${read("../boards/loci/appmap.css")}</style>\n<style>${read("src/app.css")}</style>`,
  "<!--APP-JS-->": [
    `<script>/* Studiolo's PalaceEngine (../boards/loci/palace.js) */\n${safe(read("../boards/loci/palace.js"))}</script>`,
    `<script>/* Studiolo's GraphMap (../boards/loci/appmap.js) */\n${safe(read("../boards/loci/appmap.js"))}</script>`,
    `<script>${safe(data)}</script>`,
    `<script>${safe(read("../learn-lumens/src/dictation.js"))}</script>`,
    `<script>${safe(read("src/app.js"))}</script>`,
  ].join("\n"),
};
for (const [mark, html] of Object.entries(parts)) {
  if (!app.includes(mark)) throw new Error(`${mark} missing`);
  app = app.replace(mark, () => html);
}

let page = read("src/frame.html");
if (!page.includes("/*APP*/\"\"")) throw new Error("APP placeholder missing");
page = page.replace("/*APP*/\"\"", () => JSON.stringify(app).replace(/<\//g, "<\\/"));
writeFileSync(new URL("dist/mobile-loci-prototype.html", dir), page);
console.log("Wrote dist/mobile-loci-prototype.html,", (page.length / 1024).toFixed(0), "KB");

// The same page for a claude.ai artifact, which wraps the file in its own document: no doctype, html, head or body tags.
const bare = page.replace(/<!doctype html>\s*/i, "").replace(/<html[^>]*>\s*/i, "").replace(/<\/?head>\s*/gi, "").replace(/<body>\s*/i, "").replace(/<\/body>\s*<\/html>\s*$/i, "")
  .replace(/<meta charset="utf-8">\s*/i, "").replace(/<meta name="viewport"[^>]*>\s*/i, "");
writeFileSync(new URL("dist/artifact.html", dir), bare);
