// Builds index.html from index.src.html by inlining the sample pictures it uses (640 px thumbs from
// ../commonplace-photos/img, the same items as the Commonplace photos prototype) as data URIs with their ratios.
import { readFileSync, writeFileSync } from "node:fs";
const here = (p) => new URL(p, import.meta.url);
const meta = JSON.parse(readFileSync(here("../commonplace-photos/gen/meta.json"), "utf8"));
const USED = ["hypostyle", "brick-hall", "stair-light", "reading-room", "screen-shadow", "courtyard-morning", "plan-courtyard", "mat-jali"];
const img = {};
for (const k of USED) {
  const b64 = readFileSync(here(`../commonplace-photos/img/${k}-t.jpg`)).toString("base64");
  img[k] = { src: `data:image/jpeg;base64,${b64}`, r: +(meta[k].w / meta[k].h).toFixed(3), c: meta[k].palette[0].hex };
}
const src = readFileSync(here("index.src.html"), "utf8");
if (!src.includes("/*IMG*/{}")) throw new Error("IMG placeholder missing");
const out = src.replace("/*IMG*/{}", JSON.stringify(img));
writeFileSync(here("index.html"), out);
console.log("Wrote index.html,", Object.keys(img).length, "pictures,", (out.length / 1024).toFixed(0), "KB");
