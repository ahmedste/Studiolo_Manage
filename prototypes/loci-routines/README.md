# Loci routines

> **Superseded direction (29 Oct).** This prototype shows the 25 Oct routines design. The direction is now three jobs (Follow, Get ready, Keep it fresh) with no Routines page: see [`docs/superpowers/specs/2026-10-29-background-work-rethink.md`](../../docs/superpowers/specs/2026-10-29-background-work-rethink.md). Kept for reference until a new prototype replaces it.

**Routines keep your learning moving between sessions.** Each one is a standing instruction to Loci, written as one sentence and tied to one place on the map. Its runs bring back things for you to keep, make or answer. It never changes your map or your memory.

Design: [`docs/superpowers/specs/2026-10-25-loci-routines-design.md`](../../docs/superpowers/specs/2026-10-25-loci-routines-design.md). That spec covers what routines are for, the rules, how a run really works with Claude, the card, data and phases.

It's built on **Studiolo's real shell, Today and Loci screens and styles**, captured read-only from `studiolo` (`../live-lumens/capture/snap.json`), with the Settings and memory prototype's form styles. The sample learner, Layla, is the architect working on a prayer hall in Dubai from the other prototypes. "Now" is Monday 26 October, 8:10.

Open `dist/loci-routines-prototype.html`. Links: `#today`, `#routines`, `#runs`, `#loci`.

## Try it

1. **Routines** (Today / Routines). The page opens on one sentence about this week, then the four jobs of the loop:
   - **Bring in:** Watch: AI in architecture, and a weekly reading list.
   - **Make sense:** Questions and goals, and Lumen of the week.
   - **Bring back:** Friday review.
   - **Bring forward:** the daily brief, and a board digest paused after three unopened runs.

   Each card shows:
   - the routine as a sentence;
   - your words and its guidelines;
   - its last eight runs as marks, and what came of it (kept, Lumens made, answered);
   - a link to anything waiting;
   - its place on Loci, with the place's status dot.

   The dashed tiles start a new routine of that kind.
2. **Run now** on *Questions and goals*. The card shows each step in plain words, then the run opens:
   - the goal, with its progress;
   - a question that becomes a **Lumen outline from your own saves** (Make this Lumen);
   - a question your saves can't answer (Find readings for it);
   - one you may have answered already (Mark answered).
3. **Runs › Watch: AI in architecture.** Five arrivals, grouped by the topic each was sorted onto. One suggests a new sub-topic, dashed and not made. **Keep**, **Not this** (with a reason), or **Keep all**.
4. **Builder** (in the prototype bar) shows how each run worked: every step, whether rules, search, a small model, the writing model or voice ran it, and the tokens, with how many came from the cache. Learners never see this.
5. **How was this run?** A tap or a sentence becomes a guideline on the routine, *from the run on …*.
6. **Edit.** The sentence is the editor: change how often, the time, the place and where it lands inside the sentence. Below it:
   - sources (Watch only);
   - in your words;
   - guidelines from your runs;
   - suggest only, or also file;
   - skip when nothing is new.

   The cost updates as you go.
7. **Today:** *From your routines* lists what's waiting, and this morning's runs are in the timeline.
8. **In Loci** (Climate-responsive design):
   - *Routines here*;
   - the Questions and goals finding as a message, with **Make it**;
   - a prompt that creates a routine from a sentence.

## Real or simulated

- No model runs. Every run's content is written by hand from the sample learner.
- The books and the article are real titles, but the prototype doesn't look them up.
- **Watch items are invented examples**, and their sources are described rather than named.
- No audio: a timer stands in for the two voices. No email and no scheduler.
- Costs and token counts are example figures.
- Everything resets on reload.

## Build

```sh
node build.mjs   # writes dist/loci-routines-prototype.html
```
