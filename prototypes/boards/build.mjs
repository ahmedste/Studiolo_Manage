// Builds index.html from index.src.html:
// - inlines each picture's size, lightness and palette, exactly as ../commonplace-photos/build.mjs does;
// - inlines the app's own Palace and Map (loci/palace.js, loci/appmap.js, loci/appmap.css; see loci/README.md).
// The pictures are ../commonplace-photos/img (img/ here is a link); board covers are bimg/.
import { readFileSync, writeFileSync } from "node:fs";
const dir = new URL(".", import.meta.url);
const read = (p) => readFileSync(new URL(p, dir), "utf8");
const meta = JSON.parse(read("../commonplace-photos/gen/meta.json"));
const min = Object.fromEntries(Object.entries(meta).map(([k, v]) => [k, [v.w, v.h, v.lightness, v.palette.slice(0, 5).map(p => [p.hex, p.share])]]));
let src = read("index.src.html");
if (!src.includes("/*META*/{}")) throw new Error("META placeholder missing");
if (!src.includes("<!--LOCI-BUNDLES-->")) throw new Error("LOCI-BUNDLES marker missing");
const safe = (js) => js.replace(/<\/script/gi, "<\\/script");
const bundles = `<style>/* Studiolo's own CSS for the Map and the Palace's chrome, scoped to .loci-appmap (loci/scopecss.py) */\n${read("loci/appmap.css")}</style>\n<script>/* Studiolo's PalaceEngine, main @ 6f8d396 (loci/entry-palace.ts) */\n${safe(read("loci/palace.js"))}</script>\n<script>/* Studiolo's GraphMap, main @ 6f8d396 (loci/entry-map.tsx) */\n${safe(read("loci/appmap.js"))}</script>`;
src = src.replace("/*META*/{}", JSON.stringify(min)).replace("<!--LOCI-BUNDLES-->", () => bundles);
writeFileSync(new URL("index.html", dir), src);
console.log("Wrote index.html,", (src.length / 1024).toFixed(0), "KB, with", Object.keys(min).length, "pictures");
