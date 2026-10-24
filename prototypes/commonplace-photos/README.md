# Commonplace photos prototype

An interactive prototype of the proposal in [`docs/superpowers/specs/2026-10-24-commonplace-photos-design.md`](../../docs/superpowers/specs/2026-10-24-commonplace-photos-design.md), built inside a copy of today's Commonplace: the shell, the Wall, the Shelves and the light quick view.

**Checked against:** `studiolo` main @ `3c2f744`. The layout, tokens, type and card anatomy were taken from the running app's dev specimens (`/dev/specimens?library=views&media=1`) and `src/styles/tokens.css`. The prototype is a design reference only, not code for the app.

## What to try

| Proposal phase | In the prototype |
|---|---|
| Header (all types) | **Select** sits at the right of the tabs row. Below it, one full-width search bar holds the **area** picker, the search (`/`), **Views ▾** and the Wall/Shelves switch. A type row underneath (All, Notes, Sources, Photos) where the chosen type opens its collections. One slim bar for every type: All · Unsorted · Picks, Topic, then the type's own filter (Photos: Colour and More; Sources: Status; Notes: Style), the count and Display |
| 1 The viewer | Open any photo: scroll or pinch to zoom, drag to pan, `Z` for 1:1, `+` `−` `0`, `F` full screen (dark mat), `Space` from the wall, facts block, Copy image |
| 2 The photo wall | **Photos** chip opens one slim bar: All · Unsorted · Picks, then **Colour**, **Topic** and **More** (shape, light). On the right: layout icons (Rows, Masonry, Grid) and **Display** (size, sort, group, captions; `Ctrl +` / `Ctrl −`). Kinds stay in the main chip row. Colour placeholders while loading |
| 3 Sorting a pile | **Unsorted** with **Sort these N** (numbers for topics, `K` kind, `P` pick, `A` whole album, `⌫` undo), **Picks**, saved **Views** for any type under **Views ▾** (or `⋯` → Save as a View), Select with a drag box and bulk actions |
| 4 Notes on a detail | In the viewer press `N` and drag a box; `R` shows or hides the boxes |
| 5 Photos in Loci | Loci → Map: key picture, mood strip, a topic's colours, "See all N photos", **Show on Loci** from any photo filter, the optional key picture in the centre |
| Shelves | One shelf per photo kind with prints, "Open as a photo wall", an **Unsorted** shelf and a Sorting slot on the desk |

The **All** chip shows today's behaviour: cropped cards, with albums collapsed into one card.

## Files

- `index.src.html`: the page. `build.mjs` inlines each picture's size, lightness and palette from `gen/meta.json` and writes `index.html`.
- `img/`: 32 pictures, each at 1600–3000 px plus a 640 px thumb (`-t.jpg`).
- `gen/`: how the pictures were made. `scenes.js` draws rendered scenes (three.js 0.160.0), drawings and material swatches in headless Chromium; `run.cjs` exports them and computes palettes.

**The sample pictures are generated, not photographs.** Photo hosts were blocked from the build environment, and generated images carry no licence questions.

## Rebuild

```sh
node build.mjs                      # index.html from index.src.html
# to regenerate pictures: in gen/, npm i three@0.160.0, then node run.cjs (needs Playwright's Chromium)
```
