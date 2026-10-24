import * as esbuild from "esbuild";
const r = await esbuild.build({ entryPoints: ["entry-palace.ts"], bundle: true, format: "iife", minify: true, target: "es2020", outfile: "palace.js", tsconfig: "tsconfig.json", logLevel: "error", metafile: true });
console.log("palace.js", r.metafile.outputs["palace.js"].bytes, "bytes");
