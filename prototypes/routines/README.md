# Tasks (version 9): studies and routines under Loci, with a flow editor, Finds and Connections

**New in version 9: studies.** A study is a task Loci does **once, in depth, in the cloud**: it plans, researches each question in its own thread for 20 minutes to an hour, writes a course, and (deep only) checks it, while you get on with your day. Loci's tab is now **Tasks**, holding studies and routines: *Loci / Tasks · Finds · Waiting · Activity · Connections*.
- **Start one** from **New task** (*Study something in depth*), by telling Loci ("I want to really understand stack ventilation"), or with **Study this in depth** on a find.
- **Four questions** (what you know, what it's for, time a week, how deep), then **a plan** in Loci: the aim, the questions, where it'll look, what you'll get, when it's ready, and its cost as a share of your allowance with a ceiling. Nothing runs until **Start the study**.
- **While it works:** a card with a progress bar in Tasks and on Today; the study's page shows each phase and what it's doing now. Ask how it's going, add a question, or stop it.
- **When it's ready:** what Loci found (each finding marked Sure, Mostly, Mixed or Thin), the course (each lesson with what you'll be able to do and its source), readings saved, new questions, and **Keep it up to date** (a Finds routine).

How it would run, on what, and at what cost: [`docs/superpowers/specs/2026-10-30-loci-tasks-and-studies-design.md`](../../docs/superpowers/specs/2026-10-30-loci-tasks-and-studies-design.md), with the cost model in [`routines-study/study-cost.mjs`](../../routines-study/study-cost.mjs).

## Version 8: a Loci place, a flow editor of a trigger and steps, Finds and Connections

Routines now live under **Loci**, in its own place in the rail after Graph (on a phone, a fifth tab): *Loci / Routines · Finds · Waiting · Activity · Connections*. Commonplace keeps its own tabs. The card language is the one designed for questions and goals in another session ([`prototypes/objects-boards-questions/`](https://github.com/ahmedste/Studiolo_Manage/tree/claude/gifted-cerf-w0cwoi/prototypes/objects-boards-questions) on branch `claude/gifted-cerf-w0cwoi`, Questions and goals design §10). Each routine has its own page and its own editor, and the Loci panel on the right is the app's own.

**New in version 8:**
- **A flow editor,** as in Zapier: the trigger (*When*), then steps (*Only if*, *Loci*, *Then*, *Before it files*), joined by a line with a **+** between them. Click a card to open its settings; **×** removes a step.
- **Pick a trigger:** "apps" in five groups: *Send to Studiolo* (WhatsApp, Email, Phone share, Browser, Anywhere), *Watch sources* (websites and journals, newsletters, YouTube), *On a schedule*, *In Studiolo* (Finish a Lumen, Save something twice) and *Connected apps* (Zotero, Readwise, Google Drive, Raindrop, Calendar: soon).
- **A cost line** under the title: a share of the learner's monthly allowance (dollars in Builder view).
- **Step by step** on a routine's page shows the flow read-only; clicking a step opens the editor there.
- **Connections:** every way in, the sources you watch, and the apps to come.

How it would run, on what, and at what cost per user: [`docs/superpowers/specs/2026-10-29-routines-system-and-cost-study.md`](../../docs/superpowers/specs/2026-10-29-routines-system-and-cost-study.md), with the cost model in [`routines-study/cost-model.mjs`](../../routines-study/cost-model.mjs).

- **The Routines tab:**
  - four tiles: routines on, waiting for you, new finds, filed this week;
  - a bar: kind chips and **New routine** (Finds, Waiting, Activity and Connections are tabs of the Loci header);
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
  - the name, typed at the top;
  - a live **It will…** sentence, with how many of your last 20 things it would have caught, and the cost line;
  - the flow: the trigger card, then the step cards, with **+** between them;
  - **Save changes** or **Turn it on**.

  Save stays off until the routine has a kind or a condition, so a routine can't catch everything by mistake. Schedules get *What it does · When it runs · What it brings you* as their steps.
- **New routine** offers three ways in:
  - **Tell Loci**;
  - **Set it up yourself** (pick a trigger, then add steps);
  - **one of six templates**.
- **Finds** is a routine kind that checks sources and brings what's new to a page, for example *AI in architecture*, every morning.
  - Each run gets a **Finds page**: a top pick, then finds grouped by topic.
  - Each find has a summary and **why it's for you**: it may answer one of your questions, serve one of your goals, or fit a topic.
  - Each find has **Save** (as which kind, on which topic), **Read later**, **Not for me** (and why), and **Ask Loci** (*Save it and make a Lumen*).
  - **Left out** says what was skipped and why.
  - Finds show as a tile, in the bar, on the routine's card and page, on Today, and in Loci (*What did you find today?*).
- **Loci** answers questions, makes routines and changes them. With a routine open, it's scoped to it. While the editor is open, what you tell Loci changes the form, and nothing is saved until you press Save.

Design: [`docs/superpowers/specs/2026-10-29-routines-chat-ux-design.md`](../../docs/superpowers/specs/2026-10-29-routines-chat-ux-design.md). What routines can do (filing rules, schedules, events, channels, trust): [`2026-10-29-routines-filing-rules-design.md`](../../docs/superpowers/specs/2026-10-29-routines-filing-rules-design.md).

It's built on **Studiolo's real shell, Library and Today screens and styles**, captured read-only from `studiolo` (`../live-lumens/capture/snap.json`). Two parts come from the newer app.css used by the Questions and goals prototype: the segmented bar and the amber "needs you" colour. The sample learner, Layla, is an architect working on a prayer hall in Dubai. "Now" is Monday 26 October, 8:10.

Open `dist/routines-prototype.html`. Links: `#routines` (default, the Tasks tab), `#studying` (a study at work), `#study` (a finished study), `#finds`, `#waiting`, `#activity`, `#connections`, `#new`, `#everything`, `#today`.

## Try it

**Studies (version 9):**
1. On **Tasks**, *Acoustics of domed rooms* is working. Watch its bar move, then open it: each phase, and what it's doing now. Ask Loci *How is it going?*, then **Skip ahead (prototype)** until it's ready.
2. **New task → Study something in depth**: type a subject and press **Plan it with Loci**. Answer the four questions, read the plan, press **Change the plan → Only my Commonplace and books** (the cost drops), then **Start the study**.
3. Open *Passive cooling* (done): read what Loci found, then ask *What's still unsure?* and *Make the course shorter*. Press **Builder** to see what it cost, and **Watch for new work** to make a Finds routine from it.
4. **Today** shows the study at work, the one that's ready, and the next lesson.
5. On a find, **Ask Loci → Study this in depth**.

**Routines:**

1. **Look at the cards.**
   - *Books* has an amber top line and a **Waiting** line, because it asked you about a book this morning.
   - *Voice notes* shows its ring: right 7 of 8.
   - Tap **On ▾** on any card to pause it: the card greys out.
2. **Open a routine.** Click *Books*.
   - Read *When → Loci → Then*.
   - Press **Stop asking, file on its own** under the ring.
   - Move it up or down the line.
   - Press **Why?** on a Lately item: Loci explains it on the right.
3. **Edit it.** Press **Edit**, or click a card under *Step by step* on its page.
   - Open the *Then* card and change *Mark it*, or press **+** and add *Tell me on WhatsApp*: watch **It will…** and the cost line change.
   - Then **Save changes**, and use **Undo** in the toast.
   - Or type *ask me first* to Loci while the form is open: Loci changes the form, not the routine.
4. **New routine → Set it up yourself.** Pick the *Email* trigger.
   - **Turn it on** is off until you choose a kind.
   - Choose *PDF* in the *Only if* card, press **+** and add *Sum it up*, choose a topic, then **Turn it on**. You land on its page.
5. **New routine → a template** (*Morning review*): change the day and time, then **Turn it on**.
6. **Tell Loci instead.** Type *When I send a reel from Instagram, save the links in its caption* and answer two questions.
   - A **draft card** appears in the grid, with **Edit** and **Turn it on**.
   - **Edit in full** in Loci opens the same draft in the form.
7. **Finds.** Tap the **new finds** tile, then today's *AI in architecture* page.
   - **Save** the top pick: it's linked to your question about light.
   - Put one in To read, and say **Not for me → Not from this source** to another.
   - Press **Ask Loci** on the wind-tower dataset, then **Save it and make a Lumen**.
   - **Read the rest later** decides the rest. *Left out* says what Loci skipped.
   - Then open the routine: *Only papers* or *Up to 10 finds* changes it by saying it, and **Edit** shows *What to look for*.
8. **Make a Finds routine:**
   - Say *Every Monday, find new papers on wind towers*, and choose its sources.
   - Or use **New routine → Find new things for me**, with a subject in your own words and **Add a source**.
   - On its page, **Check now** builds a Finds page.
9. **Ask Loci:**
   - *What did my routines do this week?* (tap a routine in the answer to open it);
   - *What's waiting for me?*;
   - *Why was something filed where it was?*;
   - *How do routines work?*
10. **Waiting** (tile or bar): file the book, decide on the To read pile. **Send something…** → *a blog post on Japanese joinery*, then **Make a routine for things like this**: the form opens with the kind and the site filled in.
11. **Activity:** the log, with *Undo* on anything just filed.
12. **Connections** (a Loci tab): the ways in, the sources you watch (one has gone quiet), and the apps to come.
13. **Builder** marks what needs Loci to read the item and shows each routine's cost in dollars, and **Today** shows one card. On a phone, the page fills the screen and Loci is a sheet from the foot.

## Real or simulated

- No model runs. A keyword reader stands in for Loci's understanding (§5 of the design), so common phrasings work; the chips cover the rest.
- Studies run on a simulated clock (a step every 1.4 seconds). Their findings, lessons and sources are examples; the four real books and ASHRAE Standard 55 in *Passive cooling* are real, but what's said about them is a summary written for the prototype.
- *What it would do* and the editor's count use the prototype's real matcher on 20 example arrivals.
- Nothing is sent or received; *Send something…* simulates arrivals.
- Every find is an example: no source is fetched. Sources are named generically, so no real publication is credited with an invented article.
- Only the *Everything* tab of Commonplace is in the prototype. Connected apps and the *soon* triggers can't be picked.
- Costs are estimates from the cost model, not measured.
- Book titles are real; links, reels and articles are examples.
- Everything resets on reload.

## Build

```sh
node build.mjs   # writes dist/routines-prototype.html
```
