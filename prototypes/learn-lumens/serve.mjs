// Serves the built prototype with what real dictation needs (src/dictation.js):
//   ELEVENLABS_API_KEY=… node serve.mjs   →   http://localhost:8080/
// - ElevenLabs Scribe: POST /api/dictation/token mints a single-use realtime token with the key, which never reaches
//   the page. GET /api/dictation/status tells the page whether a key is set.
// - Parked, Moonshine on-device: `node serve.mjs --moonshine` adds the cross-origin isolation headers its
//   multithreaded WebAssembly needs (SharedArrayBuffer).
// Installed packages are served from node_modules instead of jsDelivr:
//   npm i --no-save @elevenlabs/client@1.32.1 @moonshine-ai/moonshine-wasm@0.1.5
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize, extname } from "node:path";

const here = (p) => new URL(p, import.meta.url);
const PORT = Number(process.env.PORT) || 8080;
const KEY = process.env.ELEVENLABS_API_KEY || "";
const MOONSHINE = process.argv.includes("--moonshine");
// The packages are ESM-only, so look for them by path rather than require.resolve: here, then up the tree.
function findPackage(name) {
  for (let dir = fileURLToPath(here(".")); ; dir = dirname(dir)) {
    const d = join(dir, "node_modules", name, "dist");
    if (existsSync(d)) return d;
    if (dirname(dir) === dir) return null;
  }
}
const VENDOR = { "/vendor/moonshine/": findPackage("@moonshine-ai/moonshine-wasm"), "/vendor/elevenlabs/": findPackage("@elevenlabs/client") };
const TYPES = { ".js": "text/javascript", ".mjs": "text/javascript", ".wasm": "application/wasm", ".map": "application/json" };
const BASE = {
  "Cache-Control": "no-store",
  ...(MOONSHINE ? { "Cross-Origin-Opener-Policy": "same-origin", "Cross-Origin-Embedder-Policy": "require-corp" } : {}),
};
const json = (res, status, body) => res.writeHead(status, { ...BASE, "Content-Type": "application/json" }).end(JSON.stringify(body));

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  try {
    if (path === "/" || path === "/index.html") {
      const body = await readFile(here("dist/learn-lumens-prototype.html"));
      res.writeHead(200, { ...BASE, "Content-Type": "text/html; charset=utf-8" });
      return res.end(Buffer.concat([Buffer.from('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'), body]));
    }
    if (path === "/api/dictation/status") return json(res, 200, { elevenlabs: !!KEY });
    if (path === "/api/dictation/token" && req.method === "POST") {
      if (!KEY) return json(res, 503, { error: "No ElevenLabs key: start the server with ELEVENLABS_API_KEY=…" });
      const r = await fetch("https://api.elevenlabs.io/v1/single-use-token/realtime_scribe", { method: "POST", headers: { "xi-api-key": KEY } })
        .catch((e) => ({ ok: false, status: e.cause?.code || "network", json: async () => ({}) }));
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.token) return json(res, 502, { error: `ElevenLabs refused the token request (${r.status})` });
      return json(res, 200, { token: j.token });
    }
    for (const [prefix, dir] of Object.entries(VENDOR)) {
      if (!dir || !path.startsWith(prefix)) continue;
      const file = normalize(join(dir, path.slice(prefix.length)));
      if (!file.startsWith(dir)) break;
      const body = await readFile(file);
      res.writeHead(200, { ...BASE, "Content-Type": TYPES[extname(file)] || "application/octet-stream" });
      return res.end(body);
    }
  } catch { /* fall through to 404 */ }
  res.writeHead(404, BASE).end("Not found");
}).listen(PORT, () => console.log([
  `Learn prototype: http://localhost:${PORT}/`,
  `  ElevenLabs Scribe: ${KEY ? "on (key set)" : "off (set ELEVENLABS_API_KEY)"} · client from ${VENDOR["/vendor/elevenlabs/"] ? "node_modules" : "jsDelivr"}`,
  `  Moonshine (parked): ${MOONSHINE ? "cross-origin isolated" : "off (--moonshine to try it)"}`,
].join("\n")));
