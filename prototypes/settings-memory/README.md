# Settings and learner memory

Memory follows the map. Every place on a learner's Loci map (You, an area, a topic, a sub-topic) can hold a **card**: what Loci knows about them *there*. Settings gets five tabs: **Profile · Learning · Memory · Usage · Privacy & data**. Learning holds what you tell Loci. Memory holds what Loci noticed.

It's built on **Studiolo's real shell, Loci screen and styles**, captured read-only from `studiolo` (`../live-lumens/capture/snap.json`). The sample learner is an architect working on a prayer hall in Dubai; every entry is an example. Spec: [`docs/superpowers/specs/2026-10-24-learner-memory-and-settings-design.md`](../../docs/superpowers/specs/2026-10-24-learner-memory-and-settings-design.md).

Open `dist/settings-memory-prototype.html`. It is published as a claude.ai artifact that may use Claude for **Try it**.

## Try it

1. **Settings → Memory** (it opens here).
   - **The toggle.** Turn memory off: the cards dim but stay editable, and **What Loci knows here** shrinks to Profile, preferences, Instructions and on-screen facts.
   - **Waiting for you.** Three things Loci inferred and won't use until you press **Keep**: start simpler in Structures (from three Simpler taps), sections first everywhere (seen in two areas), the qibla marked on plans.
   - **Your memory map.** The tree mirrors the map. Pick a place to see its card:
     - each entry shows its basis (**You said**, **You showed**, **You agreed**) and date;
     - **Why?** shows the evidence in plain words;
     - **Edit** locks your version, and **Delete** leaves a note that Loci won't rebuild it from older evidence (with **Undo**);
     - **To revisit** has **Understood** instead of Edit;
     - **Seen here** lists facts, each with **Hide from Loci**;
     - **From your map** shows the status and My Focus that you set and Loci never changes.
   - **What Loci knows here.** Choose a place and a moment (topic chat, Make a Lumen, Live session) to see the exact text Loci reads, with its size in tokens. At Precast it reads the Precast card in full, one line from each place above it, and nothing from other areas.
   - **Try it.** The same question is planned as a Lumen twice: once with that text, once knowing nothing. Claude writes both when the page may use it; otherwise you see a scripted pair.
   - **Delete all memory** asks you to type *delete*.
2. **Settings → Learning.**
   - Preferences: start with, length, depth, checks, examples from my field, narrator.
   - **Instructions for Loci**: About me, How I like to be taught, Right now I'm working on…
   - **Notes on topics**: they apply to a topic and everything under it.
   - The box on the right shows the start of every slice and updates as you type.
3. **Settings → Profile, Usage, Privacy & data.**
   - Profile: what you do (from onboarding), spelling and units, appearance.
   - Usage: example figures.
   - Privacy & data: what Loci never notes, export and account deletion.
4. **In Loci** (the bar at the bottom right, or the Graph icon in the rail). This is Climate-responsive design's panel:
   - **Loci knows here** under status and My Focus opens the same card as Settings;
   - **Tell Loci…** writes a note for this topic;
   - the chat opens with one line from **To revisit**, with **Check me** and **Straight on**;
   - a reply shows **Loci will remember: …** with **Undo** and **Edit**;
   - the Lumen offer has **Made for you**, with **Too basic** and **Too advanced**. Either one adds a suggestion to Settings → Memory.

## Not in it

- Real persistence. Everything resets on reload.
- The scribe job, evidence tables and rules. The entries are hand-written examples of what they would produce.
- Other topics in Loci: only Climate-responsive design is wired.
- Phone layouts beyond the app's own shell. The Settings content stacks, but it wasn't designed screen by screen for phones.

## Build

```sh
node build.mjs   # writes dist/settings-memory-prototype.html
```
