# Studiolo dock: interactive prototype

A clickable prototype of **direction 2** in `docs/superpowers/specs/2026-10-21-live-lumens-voice-design.md` (§0): one assistant, docked at the bottom centre of every page. Its conversation follows you round the app, it acts on the page you're on, it pops quick Lumens over what you're reading, and on the Graph it is the same conversation as the copilot.

It's built on **Studiolo's real screens**, captured read-only from `studiolo` @ `48412aa`: the app's own rendered pages and compiled styles, not redrawn copies.

Open `dist/studiolo-dock-prototype.html` in a browser.

## Try it

Use the suggestions above the dock, or type. Move between pages with the sidebar; the dock and the conversation stay.

1. **Today** → "Pick up my lecture notes": opens the PDF reader at page 2.
2. **PDF** → "Explain this page": a quick Lumen pops up over the page and is narrated. Cut in with "Explain that another way" (the slide is redrawn as a bath analogy), Stop, Test me or Skip. Go to another page and it tucks into the dock as *Now playing*.
3. **PDF** → "Put this on my map": goes to Climate-responsive design. Three dashed topics appear on the map, and the proposal lands in the **copilot panel** marked *from the dock*. Say "Keep all three".
4. "Show me in 3D" → a **proposed** 3D view of the whole map (not in the app yet). "Fly to Climate-responsive design".
5. **Library** → "Sort my Sultan Hassan saves" (a plan that asks first). **Learn** → a course part: "Explain this part another way", "Quiz me".
6. The **mic** opens a voice line that stays open across pages. **S** opens the whole conversation.

## Limits

- No microphone and no network. Your browser's built-in voice stands in for the ElevenLabs narrator; mute it in the conversation sheet.
- The screens are fixed snapshots. The dock, the sidebar, links between these pages, the copilot composer and the changes Studiolo makes all respond. Other controls don't.
- The PDF page text is written for the prototype; the specimen PDF only says "Page 2". The 3D map is a new, proposed view drawn from the specimen map's 104 topics.

## How it's made

1. `capture/capture.cjs` loads studiolo's `/dev/specimens` pages from a **local, read-only** run of the app. These use in-memory fixtures: no database, no AI. It saves each screen's DOM, the compiled stylesheet and the Latin fonts to `capture/snap.json`. Nothing in `studiolo` is changed.
2. `capture/graph.json` is the specimen map (`src/dev/graph-sample.ts`) as data, for the 3D view.
3. `src/dock.css` and `src/dock.js` are the proposed dock. They reuse the app's own classes (`.cp-body .cp-thread .msg`, `.cp-card`, `.cp-change`, `.gp-wrap .gp-panel`, `.xp-*` slides, `.vtoast`, `.graph-dialog`, `.td-proto`) and tokens.
4. `node build.mjs` bundles everything into `dist/studiolo-dock-prototype.html`.

To refresh the screens:
1. In a local studiolo checkout, run `npm ci`, then `node scripts/copy-pdfjs-assets.mjs`, then `npx next dev -p 3311`.
2. Run `STUDIOLO=/path/to/studiolo node capture/capture.cjs && node build.mjs`.
