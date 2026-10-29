# Routines (version 6): a Commonplace tab, with a page and an editor for each routine

Routines is a tab of Commonplace, next to **Questions and goals**, and looks like it. The card language is the one designed for questions and goals in another session ([`prototypes/objects-boards-questions/`](https://github.com/ahmedste/Studiolo_Manage/tree/claude/gifted-cerf-w0cwoi/prototypes/objects-boards-questions) on branch `claude/gifted-cerf-w0cwoi`, Questions and goals design §10). Each routine has its own page and its own editor, and the Loci panel on the right is the app's own.

- **The tab:**
  - four tiles: routines on, waiting for you, filed this week, paused;
  - a bar: *Routines · Waiting · Activity*, kind chips, and **New routine**;
  - cards in three groups: *When I send something*, *On a schedule*, *After I do something*.
- **A card** is the same family as a goal card:
  - a top line: the accent when on, amber when something waits for you, grey when paused;
  - a round mark for what starts it (WhatsApp, email, phone, browser, a clock);
  - the name in the reading face;
  - three small rows: **When** (what it catches), **Loci** (what Loci does with it), **Then** (where it goes);
  - a **Last / Waiting / Next** line;
  - a footer: the ring (right 9 of 10) or the count, and the **On ▾** status button.
- **A routine's page** (click a card):
  - the header, with *On ▾*, *Asks you first ▾* and **Edit**;
  - anything of its that's waiting;
  - **What it does**, as a sentence with tappable words;
  - **When → Loci → Then**;
  - how it's doing: the ring, its place in line (Move up or down), or its next run;
  - **Lately**, with **Why?** on each item;
  - what it would do with your last 20 things;
  - *Pause it · Duplicate · Delete routine*.
- **The editor** (Edit, New routine, or *Edit in full* on a draft Loci made):
  - five numbered sections: *When it starts · What Loci does with it · Where it goes · Before it files · Name*;
  - a live **It will…** sentence at the top, with how many of your last 20 things it would have caught;
  - **Save changes** or **Turn it on**.

  Save stays off until the routine has a kind or a condition, so a routine can't catch everything by mistake. Schedules get *What it does · When it runs · What it brings you · Name*.
- **New routine** offers three ways in:
  - **Tell Loci**;
  - **Set it up yourself** (pick what starts it, then the form);
  - **one of six templates**.
- **Loci** answers questions, makes routines and changes them. With a routine open, it's scoped to it. While the editor is open, what you tell Loci changes the form, and nothing is saved until you press Save.

Design: [`docs/superpowers/specs/2026-10-29-routines-chat-ux-design.md`](../../docs/superpowers/specs/2026-10-29-routines-chat-ux-design.md). What routines can do (filing rules, schedules, events, channels, trust): [`2026-10-29-routines-filing-rules-design.md`](../../docs/superpowers/specs/2026-10-29-routines-filing-rules-design.md).

It's built on **Studiolo's real shell, Library and Today screens and styles**, captured read-only from `studiolo` (`../live-lumens/capture/snap.json`). Two parts come from the newer app.css used by the Questions and goals prototype: the segmented bar and the amber "needs you" colour. The sample learner, Layla, is an architect working on a prayer hall in Dubai. "Now" is Monday 26 October, 8:10.

Open `dist/routines-prototype.html`. Links: `#routines` (default), `#waiting`, `#activity`, `#new`, `#everything`, `#today`.

## Try it

1. **Look at the cards.**
   - *Books* has an amber top line and a **Waiting** line, because it asked you about a book this morning.
   - *Voice notes* shows its ring: right 7 of 8.
   - Tap **On ▾** on any card to pause it. Then the **Paused** tile shows only paused routines.
2. **Open a routine.** Click *Books*.
   - Read *When → Loci → Then*.
   - Press **Stop asking, file on its own** under the ring.
   - Move it up or down the line.
   - Press **Why?** on a Lately item: Loci explains it on the right.
3. **Edit it.** Press **Edit**.
   - Change *Mark it* or add a condition (*+ has a tag*) and watch **It will…** change.
   - Then **Save changes**, and use **Undo** in the toast.
   - Or type *ask me first* to Loci while the form is open: Loci changes the form, not the routine.
4. **New routine → Set it up yourself → When I send something.**
   - **Turn it on** is off until you choose a kind.
   - Choose *Email* and *PDF*, then *+ Sum it up in three lines*, then a topic, then **Turn it on**. You land on its page.
5. **New routine → a template** (*Morning review*): change the day and time, then **Turn it on**.
6. **Tell Loci instead.** Type *When I send a reel from Instagram, save the links in its caption* and answer two questions.
   - A **draft card** appears in the grid, with **Edit** and **Turn it on**.
   - **Edit in full** in Loci opens the same draft in the form.
7. **Ask Loci:**
   - *What did my routines do this week?* (tap a routine in the answer to open it);
   - *What's waiting for me?*;
   - *Why was something filed where it was?*;
   - *How do routines work?*
8. **Waiting** (tile or bar): file the book, decide on the To read pile. **Send something…** → *a blog post on Japanese joinery*, then **Make a routine for things like this**: the form opens with the kind and the site filled in.
9. **Activity:** the log, with *Undo* on anything just filed.
10. **Builder** marks what needs Loci to read the item, and **Today** shows one card. On a phone, the page fills the screen and Loci is a sheet from the foot.

## Real or simulated

- No model runs. A keyword reader stands in for Loci's understanding (§5 of the design), so common phrasings work; the chips cover the rest.
- *What it would do* and the editor's count use the prototype's real matcher on 20 example arrivals.
- Nothing is sent or received; *Send something…* simulates arrivals.
- Only the *Everything* and *Routines* tabs of Commonplace are in the prototype.
- Book titles are real; links, reels and articles are examples.
- Everything resets on reload.

## Build

```sh
node build.mjs   # writes dist/routines-prototype.html
```
