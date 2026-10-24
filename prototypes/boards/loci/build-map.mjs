// Bundles Studiolo's own Map (graph-map.tsx and its layout) for the Boards prototype, as the Loci prototype's appmap did.
// One change on the way in: a "board" item kind (the Boards spec's proposed shape), so a board can sit in the lane.
import * as esbuild from "esbuild";
import path from "node:path";
import fs from "node:fs/promises";
const here = path.resolve(".");
const PATCHES = {
  "item-kinds.ts": [["export const ITEM_KIND_SPECS: Readonly<Record<ItemKind, ItemKindSpec>> = {", `export const ITEM_KIND_SPECS: Readonly<Record<ItemKind, ItemKindSpec>> = {
  board: { label: "Board", plural: "Boards", icon: "▦", bodyLimit: 0, bodyRequired: false, titleRequired: true, untitled: "none", excerpt: "description", markdownBody: false, depictable: false, photosOffWall: false, cardClass: "mcard", cardFrame: "picture", pictureAspect: null } as any,`]],
};
const swap = {
  name: "swap",
  setup(b) {
    b.onResolve({ filter: /\/topics\/schema$/ }, a => a.importer.includes("library/classify") ? { path: path.join(here, "stubs/schema-lite.ts") } : undefined);
    b.onResolve({ filter: /^\.\/(code|diff)-slide$/ }, () => ({ path: path.join(here, "stubs/slide-null.tsx") }));
    b.onLoad({ filter: /src\/features\/library\/item-kinds\.ts$/ }, async (a) => {
      let text = await fs.readFile(a.path, "utf8");
      for (const [from, to] of PATCHES[path.basename(a.path)]) { if (!text.includes(from)) throw new Error(`patch: "${from}" not found`); text = text.split(from).join(to); }
      return { contents: text, loader: "ts" };
    });
  },
};
const r = await esbuild.build({
  entryPoints: ["entry-map.tsx"], bundle: true, format: "iife", minify: true, target: "es2020",
  define: { "process.env.NODE_ENV": '"production"' },
  alias: { "next/link": "./stubs/next-link.tsx", "katex/dist/katex.min.css": "./stubs/empty.css", katex: "./stubs/katex.ts", dompurify: "./stubs/dompurify.ts", "lucide-react": "./stubs/lucide.ts", "next/navigation": "./stubs/next-navigation.ts", "perfect-freehand": "./stubs/perfect-freehand.ts" },
  external: ["mermaid", "@mermaid-js/layout-elk"],
  outfile: "appmap.js", tsconfig: "tsconfig.json", logLevel: "error", metafile: true, plugins: [swap],
});
console.log("appmap.js", r.metafile.outputs["appmap.js"].bytes, "bytes");
