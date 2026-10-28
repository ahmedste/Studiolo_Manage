// Builds index.html from index.src.html: inlines studiolo's own CSS (app.css, main @ 7c0e8732) and the sample photos as data URIs.
import { readFileSync, writeFileSync } from "node:fs";
const here = p => new URL(p, import.meta.url);
const css = readFileSync(here("./app.css"), "utf8");
let out = readFileSync(here("./index.src.html"), "utf8").replace("/*APPCSS*/", () => css);
out = out.replace(/MEDIA_([a-z-]+)/g, (_, name) => "data:image/webp;base64," + readFileSync(here(`./media/${name}.webp`)).toString("base64"));
writeFileSync(here("./index.html"), out);
console.log(`index.html written (${Math.round(out.length / 1024)} KB)`);
