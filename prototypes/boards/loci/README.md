# The app's Palace and Map, bundled for Boards

The Boards prototype's **Loci** page runs Studiolo's own Palace and Map, not redrawings of them. This folder holds the two bundles, the stylesheet, and the files that build them from `studiolo` main @ `6f8d396` (24 Oct 2026). `../build.mjs` inlines all three into `../index.html` at the `<!--LOCI-BUNDLES-->` marker.

| File | What it is |
|---|---|
| `palace.js` | `window.LociPalace`: the app's `PalaceEngine` (`src/components/graph/palace/palace-engine.ts`) and the scene, extras, levels and room helpers from `src/features/palace/`. Built from `entry-palace.ts` |
| `appmap.js` | `window.LociAppMap`: the app's `GraphMap` (`src/components/graph/graph-map.tsx`), drawn the way `graph-workspace.tsx` draws it (`layoutFrame` → `useFrameTween` → `GraphMap`, the same fit rules). Built from `entry-map.tsx` |
| `appmap.css` | The app's own CSS for the map, the Palace chrome and the Lumen peek, scoped to `.loci-appmap` by `scopecss.py`, with the app's tokens. `classes.json` lists the classes the map draws |
| `stubs/` | Stand-ins for what a static page can't run: `next/link` (a plain `<a>`), `next/navigation`, KaTeX, DOMPurify, Lucide icons, `perfect-freehand`, and a few slide renderers the map never shows |

## The one change to the app's code

`build-map.mjs` adds a **`board`** item kind to `src/features/library/item-kinds.ts` while bundling (label *Board*, a picture card), so a board can sit in a topic's Commonplace lane. That is the Boards spec's proposed shape (`docs/superpowers/specs/2026-10-24-boards-design.md` §2.2). Nothing else in the app's code is changed. The Palace needs no change: a board is an item there.

The prototype owns the data, the selection and the side panels. It hands the engines the app's own input shapes: `TopicGraph`, `PalaceRoom` and `ExtraNode` for the Palace; `LaneInput`, `ExplainersInput` and `TopicExplainers` for the Map.

## Rebuild

The app's source and `node_modules` are not committed. To rebuild:

```sh
# a scratch folder outside this repo
cp -r /path/to/studiolo/src ./src                 # studiolo main @ 6f8d396, read-only
cp -r <this folder>/{stubs,entry-*.ts*,build-*.mjs,tsconfig.json,package.json,scopecss.py,classes.json} .
npm install                                        # the versions in package.json match the app's
node build-palace.mjs && node build-map.mjs
STUDIOLO_SRC=src python3 scopecss.py classes.json > appmap.css
cp palace.js appmap.js appmap.css <this folder>/
cd <this folder>/.. && node build.mjs
```

Never edit `studiolo` to make a bundle build. Add a stub or an alias here instead.
