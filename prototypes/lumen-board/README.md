# Lumen Board prototype

An idea is sketched on a whiteboard in time with the narration, drawn by a small moving dot of ink. This is a prototype of a `board` slide type for Studiolo Lumen. The investigation and integration plan are in [`proposals/2026-10-19-lumen-board-sketching.md`](../../proposals/2026-10-19-lumen-board-sketching.md).

## Run it

Open `index.html` in a browser; there is no build step. The page:

- loads perfect-freehand from jsDelivr, and falls back to plain strokes if that fails;
- loads its fonts from Google Fonts;
- carries its handwriting stroke data inline.

"Sketch with Claude" only works when the page is published as a claude.ai artifact with the `sample` capability.

## Third-party material

- **EMS Tech** single-line font. The glyph strokes are inlined in `index.html` under `<script id="glyphs">`, taken from `hersheytext@2.0.0` `svg_fonts/EMSTech.svg`.
  - Licence: SIL Open Font License 1.1, https://scripts.sil.org/OFL.
  - Created by Sheldon B. Michaels; SVG font conversion by Windell H. Oskay.
  - A derivative of *Architects Daughter* by Kimberly Geswein.
  - The `hersheytext` package itself is MIT.
- **perfect-freehand** 1.2.2 by Steve Ruiz, MIT. Loaded from a CDN, not vendored.
