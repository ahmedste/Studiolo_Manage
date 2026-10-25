# Loci routines

Small jobs Loci does on a schedule. Each one reads **one place on Loci** and brings back **cards** to keep or dismiss. The idea comes from Walling's "Everyday agents" (instructions, scope, trigger, delivery, run history, cost up front). It's fitted to Studiolo's rules:
- the scope is a place on the map: a topic, an area, a board, a Work project or Commonplace › Unsorted;
- runs produce typed cards, never free text;
- a routine only suggests;
- it never changes status, memory or the map.

It's built on **Studiolo's real shell, Today and Loci screens and styles**, captured read-only from `studiolo` (`../live-lumens/capture/snap.json`), with the Settings and memory prototype's form styles. The sample learner, Layla, is the architect working on a prayer hall in Dubai from the other prototypes. "Now" is Monday 26 October, 8:10.

Open `dist/loci-routines-prototype.html`. Links: `#today`, `#routines`, `#runs`, `#loci`.

## Try it

1. **Routines** (Today / Routines). Four routines: a weekly reading list, a daily brief (audio), a Friday review, and a paused board digest. Each card shows:
   - what it does;
   - its guidelines and the run each came from;
   - where it reads, when, next run, last run, where it lands;
   - the cost of each run and of a month, as a share of the monthly allowance (the same unit as Settings › Usage). Audio makes the daily brief the costly one, and its month tile turns amber.
2. **Run now** on *Weekly reading list*. The six steps play out: it starts, reads, thinks, makes cards, delivers, and you refine. Then it opens the run.
   - Every book is real and new: it leaves out what you've saved or dismissed before.
   - **Save** files a book in Commonplace on the topic, as To read. **Dismiss** asks why.
   - Run it again until the pool runs out: the run is then **Skipped** and uses none of the allowance.
3. **How was this run?** *Too basic*, *Too long* or *Not about my work* adds a guideline to the routine, as does a sentence in your own words. It shows on the card, *from the run on …*, and **Edit** can remove it.
4. **Edit** or **New routine** (or a *Start from* tile).
   - Name and instructions.
   - The place it reads, from your map, boards, Work and Commonplace.
   - When: every day, weekdays, once a week, or every few hours.
   - Where it lands: Today, Email, Audio.
   - Suggest only, or also file into Unsorted.
   - Skip when nothing is new.
   - The next run and the cost update as you change things. Over 10% a month, it says what weekly would cost instead.
5. **Runs**: every run, newest first, with what it read. Try the **daily brief** (▶ plays through the chapters), the **Friday review** (think, show the answer, then *Got it* or *Not yet*), the **board digest** and a **skipped** run.
6. **Today**: a *From your routines* row under Continue; this morning's runs in the day's timeline; the next routine at the foot.
7. **In Loci** (Climate-responsive design): *Routines here* under the chips, with **+ Routine here**. This morning's reading list shows as a message in the topic's chat, and there's a prompt to make one in a sentence: *Every Friday, ask me what I got wrong here*.

## Real or simulated

- No model runs. Every run's content is written by hand from the sample learner. The books and the article are real titles, but the prototype doesn't look them up. "Checked in Open Library" shows what the real check (Loci suggests resources, R1) would say.
- No audio: a timer stands in for the two voices.
- No email and no scheduler. In the app, Trigger.dev would run routines, and Loops would send the emails. Both are already vendors in `cost-dashboard`.
- Costs are example figures.
- Everything resets on reload.

## Build

```sh
node build.mjs   # writes dist/loci-routines-prototype.html
```
