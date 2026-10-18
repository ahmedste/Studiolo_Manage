import * as esbuild from "esbuild";
import path from "node:path";
import fs from "node:fs/promises";
const RENAMES = {
  "layout.ts": [["In your library (", "In your Commonplace ("], ["more in library →", "more in Commonplace →"], ["`Explainers (", "`Lumens ("], [": \"library\"}`", ": \"Commonplace\"}`"], [": \"Explainer\",", ": \"Lumen\","], ["explainers →`", "Lumens →`"]],
  "graph-map.tsx": [["`${count} explainer${count === 1 ? \"\" : \"s\"}`", "`${count} Lumen${count === 1 ? \"\" : \"s\"}`"]],
  "explainer-peek.tsx": [],
};
const here = path.resolve(".");
const swap = {
  name: "swap",
  setup(b) {
    b.onResolve({ filter: /\/topics\/schema$/ }, a => a.importer.includes("library/classify") ? { path: path.join(here, "stubs/schema-lite.ts") } : undefined);
    b.onResolve({ filter: /^\.\/(code|diff)-slide$/ }, () => ({ path: path.join(here, "stubs/slide-null.tsx") }));
    // Loci's names (proposals/2026-10-18-naming-map.html): Library is the Commonplace, explainers are Lumens.
    b.onLoad({ filter: /src\/(features\/topics\/layout\.ts|components\/graph\/graph-map\.tsx|components\/graph\/explainer-peek\.tsx)$/ }, async (a) => {
      let text = await fs.readFile(a.path, "utf8");
      for (const [from, to] of RENAMES[path.basename(a.path)]) {
        if (!text.includes(from)) throw new Error(`rename: "${from}" not found in ${a.path}`);
        text = text.split(from).join(to);
      }
      return { contents: text, loader: a.path.endsWith("x") ? "tsx" : "ts" };
    });
  },
};
await esbuild.build({
  entryPoints: ["entry.tsx"], bundle: true, format: "iife", minify: true, target: "es2020",
  define: { "process.env.NODE_ENV": '"production"' },
  alias: { "next/link": "./stubs/next-link.tsx", "katex/dist/katex.min.css": "./stubs/empty.css", katex: "./stubs/katex.ts", dompurify: "./stubs/dompurify.ts", "lucide-react": "./stubs/lucide.ts" },
  external: ["mermaid", "@mermaid-js/layout-elk"],
  outfile: "appmap.js", tsconfig: "tsconfig.json", logLevel: "error", metafile: true,
  plugins: [swap],
}).then(r => { const o = r.metafile.outputs["appmap.js"]; console.log("bytes", o.bytes); });
