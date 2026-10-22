# Learn, slice 1: interactive prototype

Learn reorganised around Live Lumens, on **Studiolo's real screens and styles**: the shell, the destination header, `.lx-card`, `.lx-cont`, the player's `.xp-stage` slides and the toasts. These are the app's own, captured read-only from `studiolo`; nothing there is changed. Spec: [`docs/superpowers/specs/2026-10-22-learn-live-slice-1.md`](../../docs/superpowers/specs/2026-10-22-learn-live-slice-1.md).

Open `dist/learn-live-prototype.html`. It's published as a claude.ai artifact that may use Claude.

## Try it

1. **Learn → Home.** Type a question, or hold the mic (or hold Space) and watch your words appear as you "speak". Then press **Explain live**. A Lumen is written and performed live, slide by slide.
2. **While it talks**, cut in from the talk bar: Stop, Explain that another way, Simpler, Go deeper, From my field, Test me, Skip, Back. You can also type or "say" a question (it becomes an aside slide), or **tap part of a slide** to ask what it is.
3. **Go live** on any Lumen card, or "Go live from slide 4" on Continue. **End live** goes back to the recording. **Keep this version** saves it with your questions as asides and adds a journal line to the topic in Loci.
4. **In Recording mode**, typing a question gets a written answer, which uses no voice minutes.
5. **Lumens**, **Courses** and **Live sessions** tabs: browse, filter, "Take Part N live".
6. The **talk bar** shows only in Learn and on the Graph (Loci). Today and the Library don't have it.

## Real or simulated

- **Real, when you allow it:** Claude writes each Live Lumen, rewrite, deeper slide, aside, check question and written answer in real time. Slides appear as each line of Claude's answer arrives (the `sample` capability, on your own Claude usage; the first use asks you).
- **Scripted when Claude isn't available:** the badge says "Live answers: scripted sample". A sample Lumen ("How a malqaf moves air") plays, with scripted rewrites and answers.
- **Simulated:**
  - No microphone: holding the mic streams a phrase as live transcription.
  - The browser's speech voice stands in for the ElevenLabs narrator; mute it in the talk bar.
  - Lumen data (cards, courses, sessions) is sample data. The screens are fixed captures.

## Build

`node build.mjs` bundles `../live-lumens/capture/snap.json` (the captured screens and CSS), `src/learn.css` and `src/learn.js` into `dist/learn-live-prototype.html`.
