# The app's Map inside the Loci prototype

The Map tab of [`../index.html`](../index.html) is Studiolo's own Map, not a copy drawn by hand. It is bundled from `ahmedste/studiolo` at `d6e510e` (read-only), so its layout, motion, hover, pan, pinch, lanes, ▶ badges and suggestions are exactly the app's. The prototype only feeds it the palace's data and recolours it.

## What is bundled

`entry.tsx` mounts the same chain the workspace uses (`src/components/graph/graph-workspace.tsx`):

1. `layoutFrame` (`src/features/topics/layout.ts`);
2. `useFrameTween` (`src/components/graph/use-frame-tween.ts`);
3. `GraphMap` (`src/components/graph/graph-map.tsx`), with the workspace's fit rules (desktop, touch and phone).

The page reaches it through `window.LociAppMap` (`mount`, `update`, `zoom`, `fit`).

What the build changes on the way in (`build.mjs`):

| Change | Why |
|---|---|
| The explainer player's code, diff, maths and diagram slides, and its icon set, are stubs (`stubs/`) | The posters on the map never draw them; this keeps the bundle at about 120 KB gzipped |
| `library/classify.ts` gets only the storable-text check, not the zod schema | Same reason |
| `next/link` is a plain anchor | No Next.js here |
| Lane text says "Commonplace" and "Lumens" | Loci's names (`proposals/2026-10-18-naming-map.html`); the build fails if a string it renames moves |

React is 19.1.1 here; the app runs 19.3.0.

## Styles

`scopecss.py` keeps the app's CSS rules (`src/styles/*.css`) whose classes the map draws (`classes.json`, collected by `classes.mjs` from a headless run), plus the classes the components can add in states a run may miss. Every rule is scoped to `.loci-appmap`, so nothing leaks into the Palace, List or Overview. The app's tokens (`tokens.css`) sit on the map's box and follow the prototype's theme through `color-scheme`. The Lumen peek is portalled to `<body>`, so its own rules stay unprefixed.

`palace-colours.css` comes last and changes colour only:
- areas and the centre are the Palace's solid deep blue;
- links use the Palace's ink;
- Loci's suggestions are hollow and dashed in the accent.

## Rebuilding

```sh
cp -r <studiolo checkout at d6e510e>/src ./src     # read-only copy; never commit it here
npm install
node build.mjs                                     # → appmap.js
python3 scopecss.py classes.json > appmap.base.css
cat appmap.base.css palace-colours.css > appmap.css
python3 assemble.py ../index.html appmap.js appmap.css
```

`assemble.py` replaces everything between the `app map` markers in `index.html`. `src/`, `node_modules/` and the build outputs are not committed.
