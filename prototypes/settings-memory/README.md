# Settings and learner memory

Memory follows the map. Every place on a learner's Loci map (You, an area, a topic, a sub-topic) can hold a **card**: what Loci knows about them *there*. Settings gets five tabs: **Profile · Learning · Memory · Usage · Privacy & data**. Learning holds what you tell Loci. Memory holds what Loci noticed.

**Show less.** The learner sees exactly what Loci reads, and nothing else, and the token budget is the filter. Memory opens on one paragraph and one line per area; a place opens on a tap; the raw text and its size are for builders.

It's built on **Studiolo's real shell, Loci screen and styles**, captured read-only from `studiolo` (`../live-lumens/capture/snap.json`). The sample learner is an architect working on a prayer hall in Dubai; every entry is an example. Spec: [`docs/superpowers/specs/2026-10-24-learner-memory-and-settings-design.md`](../../docs/superpowers/specs/2026-10-24-learner-memory-and-settings-design.md) (§4.4 for showing less). System diagrams: [`2026-10-24-learner-memory-system-reference.md`](../../docs/superpowers/specs/2026-10-24-learner-memory-system-reference.md).

Open `dist/settings-memory-prototype.html`. It is published as a claude.ai artifact that may use Claude for **Try it** (Builder view).

## Try it

1. **Settings → Memory: the Glance** (it opens here).
   - **On / Off** at the top right. Off says what it does in one sentence; nothing is deleted.
   - **About you**: three sentences, compiled from the You card. **Change** opens it.
   - **Waiting for you**: at most three, one row each, with **Keep** and **Dismiss**.
   - **By area**: one line per area that has something ("Envelope & Facade · Regular · for work · 1 to revisit"). Areas with nothing aren't listed.
   - At the foot, small: **Off the record**, and **Delete all memory…** (type *delete*).
2. **Open a place**: tap an area, then a topic (try Culture & Context → Climate-responsive design).
   - **Pitch it at** New · Basics · Regular · Deep: the level dial, the biggest lever.
   - Lines as sentences with a one-word source ("you said", "from a check"). **⋯** gives **Why?**, **Edit**, **Delete** (and **I understand it now** for something to revisit).
   - Seen-here and status aren't listed: one sentence says Loci reads them, and they're on the map and in Learn.
   - **Show the text Loci reads** shows it as plain text. **Forget this place** clears it, with Undo.
3. **Builder** (in the prototype bar): what builders see and learners don't.
   - The exact slice for any place and surface (topic chat, Make a Lumen, Live session), with its size in tokens against a 700 budget.
   - **Try it**: the same question planned as a Lumen twice, with the slice and knowing nothing. Claude writes both when the page may use it; otherwise you see a scripted pair.
   - In **Learning**, Builder also shows the start of every slice, updating as you type.
4. **Settings → Learning.** Four preferences (start with, length, quick checks, examples from my field), two instruction boxes (**About me and my work**, **How I like to be taught**), and **Notes on topics** folded into one line.
5. **Settings → Profile, Usage, Privacy & data.**
   - Profile: what you do (from onboarding), spelling and units, appearance.
   - Usage: example figures.
   - Privacy & data: what Loci never notes, export and account deletion.
6. **In Loci** (the bar, or the Graph icon in the rail). Climate-responsive design's panel:
   - one line under status: *Loci: Basics · for work · 1 to revisit ›*, which opens the same place view as Settings;
   - **Tell Loci…** writes a note for the topic;
   - the chat opens with one line from **To revisit**, with **Check me** and **Straight on**;
   - a reply shows **Remembered: …** with **Undo**;
   - the Lumen offer has a small **For you** tag. Tap it for one sentence and **Too basic · Too advanced**, which move the dial at once, with Undo.

## Not in it

- Real persistence. Everything resets on reload.
- The scribe job, evidence tables and rules. The entries are hand-written examples of what they would produce.
- Other topics in Loci: only Climate-responsive design is wired.
- Phone layouts beyond the app's own shell. The Settings content stacks, but it wasn't designed screen by screen for phones.

## Build

```sh
node build.mjs   # writes dist/settings-memory-prototype.html
```
