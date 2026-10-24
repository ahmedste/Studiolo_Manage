// Builds index.html from index.src.html by inlining each picture's size, lightness and palette, exactly as
// ../commonplace-photos/build.mjs does. The pictures themselves are ../commonplace-photos/img (img/ here is a link).
import { readFileSync, writeFileSync } from "node:fs";
const dir = new URL(".", import.meta.url);
const meta = JSON.parse(readFileSync(new URL("../commonplace-photos/gen/meta.json", dir), "utf8"));
const min = Object.fromEntries(Object.entries(meta).map(([k, v]) => [k, [v.w, v.h, v.lightness, v.palette.slice(0, 5).map(p => [p.hex, p.share])]]));
const src = readFileSync(new URL("index.src.html", dir), "utf8");
if (!src.includes("/*META*/{}")) throw new Error("META placeholder missing");
writeFileSync(new URL("index.html", dir), src.replace("/*META*/{}", JSON.stringify(min)));
console.log("Wrote index.html with", Object.keys(min).length, "pictures");
