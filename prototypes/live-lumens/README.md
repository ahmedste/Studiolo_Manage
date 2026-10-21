# Live Lumens: interactive prototype

A clickable prototype of the voice narrator in `docs/superpowers/specs/2026-10-21-live-lumens-voice-design.md`,
built on **Studiolo's real screens**. It isn't a redraw: the screens are the app's own rendered DOM and compiled CSS.

Open `dist/live-lumens-prototype.html` in a browser. The bar at the bottom left switches between five scenarios:

| # | Scenario | What it shows |
|---|---|---|
| 1 | Ask the Lumen | A recorded Lumen plays. **Ask** (or holding Space) pauses it, the narrator answers, draws a board slide, saves a note, then hands back. |
| 2 | Live Lumen | Explain → **Explain live**. The narrator performs the slides and you cut in: Stop (the line closes so silence isn't billed), Explain that another way (the slide is rewritten as a campus analogy), Go deeper, Test me, Skip. |
| 3 | Voice on the map | The mic beside Send. Spoken topic proposals and a spoken change plan, with the **confirm check** (card on screen, clear yes, 5 steps or fewer). Deletes need a tap. |
| 4 | Sort the Library | **Sort by voice**: a Library sort plan (a new tool), applied with Undo. |
| 5 | Plan my session | Today → **Plan my session**: three ranked ideas, then jump into one. |

Every session ends with a **recap** (covered, saved, changed, for review). The transcript is kept only if you choose.

## Limits

- No microphone and no network. You pick a suggestion, type, or hold the mic, which "hears" the first suggestion.
- Your browser's built-in voice stands in for the ElevenLabs narrator. Mute it in the voice dock. Without a voice, captions follow a reading clock.
- The screens are fixed snapshots. Only the voice parts and the sidebar react. Built for desktop first.

## How it's made

1. `capture/capture.cjs` loads studiolo's `/dev/specimens` pages from a **local, read-only** run of the app. These use in-memory fixtures: no database, no AI.
2. It saves each screen's DOM, the compiled stylesheet and the Latin fonts to `capture/snap.json`.
3. Nothing in `studiolo` is changed. It was captured from `studiolo @ e8ad3c7`.
4. `src/voice.css` and `src/voice.js` are the proposed voice layer. They reuse the app's own classes (`.cp-comp`, `.cp-card`, `.cp-change`, `.vtoast`, `.xp-*`, `.graph-dialog`, `.td-proto`) and tokens.
5. `node build.mjs` bundles everything into `dist/live-lumens-prototype.html`.

To refresh the screens, start a local studiolo checkout with `npx next dev -p 3311`. Then run `STUDIOLO=/path/to/studiolo node capture/capture.cjs && node build.mjs`.
