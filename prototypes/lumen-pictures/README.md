# Lumen pictures prototype

One Lumen, *How a wind tower cools a house*, made with the learner's own Commonplace pictures, notes and quotes. A generated picture appears only where nothing of theirs fits. It is the prototype for [`docs/superpowers/specs/2026-10-24-lumen-pictures-design.md`](../../docs/superpowers/specs/2026-10-24-lumen-pictures-design.md).

Open `index.html`. It needs no build: the pictures are files in `img/`.

## What to try

| Screen | What it shows |
|---|---|
| **2 Watch** (opens first) | Press play. The cover and slide 2 use the learner's Yazd photo, and their note on the slots lights up and zooms in when it's spoken. Slide 3 traces the air's path over their own section drawing. Slide 4 quotes their lecture notes word for word. Slide 5 sets two of their site photos side by side. Slide 6 has no picture of theirs, so it **asks** first: *Generate one* or *Pick one of mine*. Slide 7 brings it back to their housing study, and slide 8 is a tap-on-the-drawing question. The **Pictures** tab says why each picture was chosen, and offers **Swap…** (on every slide that uses it), Show and Open in Commonplace |
| **Today: words only** | The same Lumen as Lumens are made today, for comparison |
| **3 Read** | The same pictures as figures in a long read, with the learner's captions; the section keeps its traced path |
| **1 Make** | The brief's **picture shelf**: the 9 pictures the writer will look at, ranked, each with why. Set each to *Studiolo picks*, *Use* or *Leave out*, and choose what happens when nothing fits (Ask · Generate · Words only). **Make a Lumen** runs the steps and opens the result |
| **4 From Commonplace** | The other direction: a photo's panel shows *In Lumens* and opens the Lumen at that slide. Select photos and **Make a Lumen from these** |
| **Share** | Your pictures: *Include them* or *Leave them out* (those slides fall back to words) |

Keys on Watch: Space plays or pauses; ← and → move between slides. **Voice** reads the narration with the browser's voice, where there is one.

## Real or simulated

- **All the content is hand-written.** No model runs in the prototype. The slides show what the proposed typed blocks would render.
- **The pictures are generated stand-ins, not photographs.** Ten come from the Commonplace photos prototype (`../commonplace-photos/img`, made with three.js). `barjeel-gen` stands in for an AI-generated picture and was rendered the same way (`gen/`).
- Making, generating, swapping and sharing are timed stand-ins. The swap's "lines rewritten" is a plain sentence naming the new picture.

## Files

- `index.html`: the page (tokens, shell and type follow the Studiolo app, as in the other prototypes).
- `img/`: the pictures at full size plus 640 px thumbs (`-t.jpg`).
- `gen/`: how `barjeel-gen.jpg` was made. `extra-scenes.js` adds a barjeel scene to `../commonplace-photos/gen/scenes.js`. To rerun it: `THREE=/path/to/three@0.160.0/build/three.min.js node gen/run.cjs` (needs Playwright's Chromium).
