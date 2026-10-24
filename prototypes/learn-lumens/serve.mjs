// Serves the built prototype cross-origin isolated, so Moonshine's on-device dictation can run (its WebAssembly build
// needs SharedArrayBuffer). Opened any other way, the mic falls back to the browser's speech or the simulation.
//   node build.mjs && node serve.mjs   →   http://localhost:8080/
// If @moonshine-ai/moonshine-wasm is installed (npm i --no-save @moonshine-ai/moonshine-wasm@0.1.5), its dist/ is served
// at /vendor/moonshine/ and used instead of jsDelivr. Models still come from download.moonshine.ai on the first tap.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize, extname } from "node:path";

const here = (p) => new URL(p, import.meta.url);
const PORT = Number(process.env.PORT) || 8080;
// The package is ESM-only, so look for it by path rather than require.resolve: here, then up the tree.
let vendor = null;
for (let dir = fileURLToPath(here(".")); !vendor; dir = dirname(dir)) {
  const d = join(dir, "node_modules/@moonshine-ai/moonshine-wasm/dist");
  if (existsSync(join(d, "index.js"))) vendor = d;
  if (dirname(dir) === dir) break;
}
const TYPES = { ".js": "text/javascript", ".mjs": "text/javascript", ".wasm": "application/wasm", ".map": "application/json" };
const ISOLATION = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cache-Control": "no-store",
};

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  try {
    if (path === "/" || path === "/index.html") {
      const body = await readFile(here("dist/learn-lumens-prototype.html"));
      res.writeHead(200, { ...ISOLATION, "Content-Type": "text/html; charset=utf-8" });
      return res.end(Buffer.concat([Buffer.from('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'), body]));
    }
    if (vendor && path.startsWith("/vendor/moonshine/")) {
      const file = normalize(join(vendor, path.slice("/vendor/moonshine/".length)));
      if (!file.startsWith(vendor)) throw new Error("outside");
      const body = await readFile(file);
      res.writeHead(200, { ...ISOLATION, "Content-Type": TYPES[extname(file)] || "application/octet-stream" });
      return res.end(body);
    }
  } catch { /* fall through to 404 */ }
  res.writeHead(404, ISOLATION).end("Not found");
}).listen(PORT, () => console.log(`Learn prototype, cross-origin isolated: http://localhost:${PORT}/  (Moonshine runtime: ${vendor ? "local npm package" : "jsDelivr"})`));
