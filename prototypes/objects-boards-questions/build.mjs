// Builds index.html from index.src.html, taking studiolo's CSS (tokens, shell, cards, item page) from the Objects phases prototype.
import { readFileSync, writeFileSync } from "node:fs";
const phases = readFileSync(new URL("../objects-phases/index.html", import.meta.url), "utf8");
const base = phases.split("<style>")[1].split("</style>")[0].split("*/").slice(1).join("*/");
const src = readFileSync(new URL("./index.src.html", import.meta.url), "utf8");
writeFileSync(new URL("./index.html", import.meta.url), src.replace("/*BASE*/", () => base));
console.log("index.html written");
