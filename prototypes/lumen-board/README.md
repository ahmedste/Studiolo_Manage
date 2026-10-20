# Lumen prototype: board slides in Studiolo's player

A clickable mock of Studiolo's real Lumen surfaces with board slides added. On a board, an idea is sketched stroke by stroke in time with the narration, drawn by a small ink dot.

It goes with two proposals:

- [`proposals/2026-10-19-lumen-board-sketching.md`](../../proposals/2026-10-19-lumen-board-sketching.md): the board itself.
- [`proposals/2026-10-19-lumen-quality-and-board-integration.md`](../../proposals/2026-10-19-lumen-quality-and-board-integration.md): player enhancements, and how boards enter through the copilot and library items.

## What it shows

| Screen (rail) | What to try |
|---|---|
| **Learn** | Lumen cards. Posters show the title card under *Today* and the first drawn slide under *Proposed*. |
| **Player** | The real stage, title card, list, table and cards slides, cursor, captions, controls and the Transcript and Slides panel, plus board slides. The **Today / Proposed** switch in the prototype bar compares the two players: build with the voice, fill the frame, crossfade, phrase captions, cursor fix, scrubber chapter titles and the paused state. |
| **Library** | **Explain…** on the PDF, the note or the quote opens the real Explain dialog, which adds a proposed **Draw it as it explains** option (a board hint). The PDF Lumen carries page citations (P. 12, P. 13 …) and a General knowledge run. |
| **Graph + copilot** | An offer card with a **With sketches** hint, a **Draw it** short (a single board with narration played inside the card, then *Open in Learn*), and a course plan with parts marked **drawn**. |
| **Board lab** | Edit any Lumen's markup and play it, with checks. **Draw it** with Claude writes a new board, which only works when the page is opened in Claude. |

The rail's moon switches light and dark. The stage, roles and captions use Studiolo's own values for both.

## Where the look comes from

`studiolo` @ `4b4ee63` (main, 20 Oct 2026), read only:

- `src/styles/tokens.css`, `src/styles/explainer.css` (stage, title card, slides, cursor, captions, controls, transcript, thumbnails, Explain dialog options);
- `src/styles/copilot.css` (copilot cards and messages), `src/styles/graph.css` (dialog), `src/styles/shell.css` (buttons and fields);
- the real screenshots in `docs/superpowers/evidence/phase-3b4/` and `phase-3b2a/smoke/`.

The Lumens are written in the author's markup:

- `<item>` blocks;
- `- [anchor]` list lines and `## [anchor]` cards;
- refs written `[[s3.mark]]`, citations written `[words](src:ITEM#p12 '…')` and `[[beyond]]` runs;
- board items in the line format.

## What it does not do

- **Timing.** Word timings are estimated at 160 words a minute, and the browser voice (the speaker button) stands in for ElevenLabs.
- **Slide types.** Diagram, animation, maths, code and infographic slides aren't drawn; the Lumens here use the intro, list, table, cards and board types.
- **Wiring.** Sharing, courses and the copilot's own answers aren't wired up; the cards are scripted.
- **Rail and labels.** The rail icons are close to the app's rather than copies. Anything marked *Proposed* is a proposal, not an agreed or built feature.

## Run it

Open `index.html` in a browser; there is no build step. The page:

- loads perfect-freehand from jsDelivr, and falls back to plain strokes if that fails;
- loads Instrument Sans and Newsreader from Google Fonts;
- carries the handwriting stroke data inline.

## Third-party material

- **EMS Tech** single-line font. The glyph strokes are inlined in `index.html` under `<script id="glyphs">`, taken from `hersheytext@2.0.0` `svg_fonts/EMSTech.svg`.
  - Licence: SIL Open Font License 1.1, https://scripts.sil.org/OFL.
  - Created by Sheldon B. Michaels; SVG font conversion by Windell H. Oskay.
  - A derivative of *Architects Daughter* by Kimberly Geswein.
  - The `hersheytext` package itself is MIT.
- **perfect-freehand** 1.2.2 by Steve Ruiz, MIT. Loaded from a CDN, not vendored.
