# Learn, Dialogues: interactive prototype

**Dialogues** are long-form audio in Learn: two voices talk one idea through from two angles for 10 to 30 minutes, to listen to on a walk, a ride or a drive. This prototype is Learn slice 1 ([`../learn-live`](../learn-live/README.md): Lumens, live sessions, courses) with Dialogues added, on **Studiolo's real screens and styles** captured read-only from `studiolo`. Spec: [`docs/superpowers/specs/2026-10-22-learning-forms-and-dialogues.md`](../../docs/superpowers/specs/2026-10-22-learning-forms-and-dialogues.md).

Open `dist/learn-dialogues-prototype.html`. It's published as a claude.ai artifact that may use Claude.

## Try it

1. **Learn → Home → Listen on the go**, or the **Dialogues** tab. Press **Resume** on *Cooling without machines*: Nadia (an environmental engineer) and Karim (an architectural historian) argue about wind towers for your Dubai thesis house.
2. **While it plays:**
   - **Ask the hosts.** Type in the talk bar, press *Why not just use air conditioning?*, or hold the mic (or Space). The hosts answer, then pick up where they stopped.
   - **Mark** a moment. It's saved to your Library as a quote, tagged with the topic, and adds a line to the topic's journal on Loci.
   - **Back 15 s**, **Next chapter**, **speed**, or tap any line in the transcript to play from there.
   - Say or type "pause", "mark that", "next chapter", "slower".
3. **Walk mode:** big controls and nothing to read. Mark the moment, or hold to ask.
4. **Move round the app** (Home, Library, the Graph). The **mini player** (top right) keeps playing.
5. **The end:** jump to *Before you go*. Nadia asks a recall question. Answer by holding the mic, typing, or pressing the suggested answer. The recap notes the answer as evidence on the topic.
6. **Make one:**
   - **New Dialogue** opens the brief, prefilled from your context: the goal it serves, the topic it lives under, two voices, the Library items it draws on, and what you've already seen (so it skips it). The length is 10, 20 or 30 minutes.
   - *What the writer gets* shows the exact brief.
   - **Make it and listen now** starts playing within about half a minute, while later chapters are still being written. **Make it for later** writes the first two chapters; the rest is written as you listen.
   - On Home, the bar's **Dialogue** switch plans one from your question.
7. **Other ways in:** each Dialogue links to the Lumens, long reads and live session on the same topic. Lumen cards on that topic gain a **Dialogue** button.

Everything from Learn, Live still works: Lumen | Live on Home, Go live, live sessions and courses.

## Real or simulated

- **Real, when you allow it:** Claude writes each new Dialogue (the plan, then each chapter, one chapter ahead of you), the hosts' answers to your questions, and the feedback on your recall answer (the `sample` capability, on your own Claude usage; the first use asks you).
- **Scripted when Claude isn't available:** the badge says "Live answers: scripted sample". New Dialogues play the sample for their area, and the hosts answer one sample question per Dialogue.
- **Simulated:**
  - Two browser speech voices stand in for two ElevenLabs voices. Mute them with the talk bar's speaker; the words still move.
  - There's no microphone: holding the mic "says" the first suggestion.
  - "Save for offline", lock-screen and headphone controls are described, not real.
  - Goals, Library items and Dialogues are sample data. *Cooling without machines* is an abridged 8-minute version of a 20-minute Dialogue.

## Build

`node build.mjs` bundles the captured screens and CSS (`../live-lumens/capture/snap.json`), Learn slice 1 (`../learn-live/src`) and `src/` into `dist/learn-dialogues-prototype.html`. `src/dialogues.js` loads first and registers `window.LearnExt`, which `learn.js` reads. Without it, slice 1 is unchanged.
