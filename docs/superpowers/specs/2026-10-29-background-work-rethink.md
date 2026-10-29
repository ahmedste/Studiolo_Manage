MEDIUM (a direction document; no build until the owner picks what goes first)

# What Loci should do while you're away: three jobs, not an automation builder

**For:** the owner, to decide the direction.
**Status:** Partly superseded the same day. The owner keeps Routines (29 Oct): see [Routines, version 3](2026-10-29-routines-filing-rules-design.md). The cuts in §4 are reversed; the usefulness test in §2 stays, as the bar every routine is held to.
**Replaces:** the direction of [Loci routines](2026-10-25-loci-routines-design.md) (25 Oct) and its prototype. Its run mechanics (§4 there: rules first, one structured model call, checks, skip when nothing is new) still stand; its product shape doesn't.
**Read first:** Craft › 01 Vision & Strategy › *Vision & Principles* ("Today brings you back each day", "Propose, then confirm", "Grounded, not invented", "anything costly shows the cost first"); Craft › 02 Product › *Features & Ideas* › **Sources pulling** (the owner's idea of 17 Oct) and *Today* (T4, the learning-planning calendar, priority Next).

## 0. In short

The owner's critique (29 Oct): *what is it actually doing?* It should be something a user uses as part of their process, not an AI integration for its own sake, and it should be clear what the user has to do.

The critique is right. The routines design started from the reference's shape (an agent with instructions, scope, trigger and delivery) and then looked for things an AI could fill it with. That gave:
- **nine kinds;**
- **a page to manage them;**
- **a sentence editor;**
- **run history.**

It made the learner the operator of an automation system. A knowledge professional doesn't want to run automations; they want a few chores done and a few things not to slip.

**This document starts from the process instead.** It asks where the process breaks down when the user isn't in the app, and keeps only what passes a usefulness test (§2). Three jobs pass. Each has a plain verb, one setup step at most, and one action for the user:

| Job | The user's problem, in their words | What the user does | Where it shows |
|---|---|---|---|
| **Follow** a topic | "I can't keep up with what's new in my field." | Pick the sources once. Then **Keep** or **Skip** a few items a day | Follow on a topic in Loci; a **New** shelf in the Library; one line on Today |
| **Get ready** by a date | "I have a presentation on Thursday and I'm not ready." | Set the date and say what it's for. Then do the sessions | Sessions on Today's calendar (T4); a brief the evening before |
| **Keep it fresh** | "I learned it last month and it's gone." | Answer two or three questions | Today, two minutes |

Everything else in the routines design is **cut** or **moved to the moment it belongs to**, such as suggesting a topic at capture rather than sorting Unsorted every Sunday (§4).

There's no Routines page. Settings gets one honest list, **While you're away**, showing what Loci does in the background, with an on/off switch and this month's cost for each.

## 1. Where the process breaks down

The process, from the vision: **capture → map → learn → come back (Today) → use it at work**. Where it fails without help:

| # | Breakdown | What the user does today | Is it a scheduled job? |
|---|---|---|---|
| B1 | New material in my field appears in a dozen places | Opens sites, skims newsletters, or misses it | **Yes:** it happens whether or not the user is in the app |
| B2 | I save things and never come back to them (the "To read" pile) | Nothing. The pile grows | No. It's a choice at the moment the user opens Today |
| B3 | A deadline is coming and I'm not ready | Crams the night before | **Yes:** it's tied to a date |
| B4 | I forget what I learned | Re-watches a whole Lumen, or doesn't | **Yes:** it's tied to time since learning |
| B5 | Things captured in a hurry end up with no topic | Sorts later, or never | No. It belongs at capture |
| B6 | I wrote a question and lost it | Nothing | No. It belongs at the moment something new might answer it |
| B7 | Commute time is wasted | Podcasts | Maybe. Only for some users, and costly (daily voice) |

## 2. The usefulness test

Every background job must pass all six:

1. **It replaces a chore or catches a loss.** It saves the user something they'd otherwise do by hand (B1), or keeps something that would otherwise be lost (B3, B4).
2. **It needs to run without the user.** If it could just happen when the user opens a screen, it isn't a background job; it's part of that screen.
3. **It shows up where the user already is** (Today, the topic, the item), not in a new place to check.
4. **It asks for one decision**, and is safe to ignore. Ignored items expire and never pile up.
5. **Its setup is one step or none**, in plain words. No sentence builder, no delivery options.
6. **We can tell if it's working**: an action rate with a threshold. Below the threshold, Loci offers to stop it (and stops only on a yes), and we stop building on it.

And for the AI in it: **name the one thing the model does that code can't.** If there isn't one, it's code, not AI.

## 3. The three jobs

### 3.1 Follow a topic (the owner's "Sources pulling")

| | |
|---|---|
| **Problem** | "I want to keep up with my field, but I don't have time to check ten sites." |
| **Setup, once** | On a topic or area in Loci: **Follow**. Loci proposes sources as ghosts, the user ticks. The proposals come from sites the user has already saved from ("You've saved 6 things from this journal") and a short curated list per field. The user can paste their own |
| **What Loci does, each night** | Code fetches new items from those sources (the hardened fetcher and scheduled tasks already exist; see the Craft note). Code drops what was seen before and duplicates. **One small-model call** decides whether each item is about this topic and at this person's level, and writes one line on why. At most 5 per topic |
| **What the user sees** | Today: *"New on Daylight & shading: 3"*. It opens the topic's **New** shelf in the Library: title, source, one line why |
| **The user's part** | **Keep** saves it to the Library on that topic, as To read. **Skip** teaches Loci what not to bring |
| **If ignored** | Items fade after 14 days. Nothing enters the Library unless kept. After three weeks of nothing kept, Loci asks *Narrow it, or unfollow?* and acts only on the user's answer |
| **What AI does that code can't** | Relevance to *this* topic at *this* level, and a reason in one line. Without it, Follow is an RSS reader that dumps everything |
| **Working if** | At least 1 in 4 items kept or opened over the first four weeks, and most follows still on after a month |
| **Builds on** | Library capture (`content_items.origin` already allows `source`); [Loci suggests resources](2026-10-24-loci-suggests-resources-design.md) (Save, Dismiss and reasons) |

### 3.2 Get ready by a date

| | |
|---|---|
| **Problem** | "I have a client presentation, a hearing, an exam or a site visit on a date, and I need to be on top of this topic by then." Deadlines are what make professionals learn. |
| **Setup, once** | On a topic, board, course or project: **Get ready by…**, then a date and one line on what it's for ("present the courtyard cooling approach to the engineer") |
| **What Loci does** | **1. A plan.** Sessions on Today's calendar between now and the date, sized to the days available, proposed as ghosts the user confirms. Each session is concrete ("Watch *How a malqaf moves air*, 5 min", "Read Fathy ch. 3, saved 12 Oct", "Answer 3 checks"). It uses what the user already has first, and suggests a new Lumen only for a gap, with its cost shown. **2. The evening before:** a one-page brief from the user's own saves and Lumens, with citations: what you know, what's still open, three points to make. **3. The morning of:** three quick checks |
| **What the user sees** | Sessions in Today's calendar, then the brief on Today the evening before |
| **The user's part** | Set the date, do the sessions (or move them), open the brief |
| **If ignored** | A missed session moves once to the next free day. If the user keeps missing them, the plan shrinks to just the brief |
| **What AI does that code can't** | Writes the brief from the user's own material, grounded and cited, and judges what's a gap. Choosing and spacing the sessions is rules |
| **Working if** | Half or more of the planned sessions done; the brief opened; *Did this help?* after the date |
| **Builds on** | Today **T4**, the learning-planning calendar (the owner's direction, priority Next). This job is T4's reason to exist: a plan with a purpose and a date |

### 3.3 Keep it fresh

| | |
|---|---|
| **Problem** | "I learned it last month and it's gone." |
| **Setup** | None. It's on once the user has answered checks. In Settings: which days, and 3 or 5 questions |
| **What Loci does** | Picks the questions that are due, from the user's own check history (rules, no model). The questions already exist from Lumens' checks. A small model writes one only where none exists |
| **What the user sees** | Today: *"3 questions · 2 min"*, answered in place |
| **The user's part** | Answer, then **Got it** or **Not yet**. Not yet twice offers a 3-minute Lumen on just that point |
| **If ignored** | Nothing piles up: at most 5 a day, and the oldest drop off |
| **What AI does that code can't** | Almost nothing, which is the point. It's spaced review on the user's own questions |
| **Working if** | Questions answered most active days, and more right at the second ask than the first |
| **Builds on** | [Learner memory](2026-10-24-learner-memory-and-settings-design.md) (To revisit, evidence from checks) |

### 3.4 The same three jobs in each field

The mechanics are the same for everyone; only the examples change, as in [Work, in any field](2026-10-24-work-any-field-design.md).

| Field | Follow | Get ready by | Keep it fresh |
|---|---|---|---|
| **Architect** | New buildings and competition results; a daylight regulation update | A client presentation, a planning submission, a site visit | Rules of thumb, precedents |
| **Lawyer** | New judgments in construction law; contract-form updates | A hearing, an advice deadline | The elements of a claim, key cases |
| **Doctor** | Guideline updates and journals in their specialty | An exam, a rotation, presenting a case | Criteria and scores (illustration only, never clinical advice) |

## 4. What happens to the routines design

| In the 25 Oct design | Now | Why |
|---|---|---|
| Watch sources | **Follow** (3.1) | The real need, and the owner's own idea. Kept, made simpler: no sentence, no delivery choices |
| Reading list (scheduled) | **Cut.** On-demand already: *Go further* and *Find a starter shelf* (Loci suggests resources, R2) | A scheduled list adds to the unread pile; Follow already brings new things |
| Questions and goals (Sunday batch) | **Moved to the moment**: when a save may answer an open question, the question says so (*This may answer it · Link it*). A question's own **Explain from my saves** (questions and goals I4) | No schedule needed; it's better when it happens |
| Lumen of the week | **Cut.** Replaced by **One from your pile** on Today: one saved, untouched item on a My Focus topic, with *Read now · Explain this · Not interested*. Rules only | Making a Lumen nobody asked for costs a voiced video. Choosing one item costs nothing |
| Sort Unsorted (Sunday) | **Moved to capture**: a suggested topic chip when you save (the "unprompted rule-based tidy-up ideas" decision, G-D7) | The best moment to place something is when it's saved |
| Review | **Keep it fresh** (3.3) | Kept |
| Daily brief (audio) | **Later, and only if asked for.** First try voicing the *Get ready* brief | Daily voice is the costliest thing on the list, and only commuters want it |
| Board digest, project update | **Cut** | A weekly status report to yourself isn't a chore anyone does today. Board questions are covered by the move above |
| Routines page, sentence editor, run history, run marks | **Cut.** Settings › **While you're away** lists the three jobs, each with on/off, last run and this month's cost | Transparency without a management surface |

## 5. Before building: test it on a real week

Planned enough means testing the riskiest assumption cheaply before it becomes code in `studiolo`:

1. **Follow, two weeks, the owner as first user.** The owner names one topic and 5 to 10 real sources. A small script in this repo pulls them each morning, runs the relevance pass and writes a page of *New* items. The owner marks Keep or Skip.
   - Go on if the owner keeps something most days and wants it to continue.
   - If the keep rate is low, the relevance pass or the sources are wrong; we fix that before anything is built.
2. **Get ready, one real date.** The owner picks one real deadline. We write the session plan and the evening-before brief by hand from the owner's own material, and the owner says whether it would have helped. This tests the brief's value before T4 is built.
3. **Keep it fresh** needs no test: spaced review is well established. It waits on Lumen checks and learner memory being built.

## 6. Order, if the tests pass

| # | Job | Needs | Why this place |
|---|---|---|---|
| 1 | **Follow** | Capture and the fetcher (built), one scheduled task, a *New* shelf | The owner's own need. Most of the parts exist. No dependency on unbuilt designs |
| 2 | **Get ready** | Today T4 (the planning calendar) | Gives T4 its reason to exist. Built with it, not before |
| 3 | **Keep it fresh** | Lumen checks and learner memory | Waits on them |
| — | Capture topic chip, *This may answer it*, One from your pile | Each in its own screen's spec | Not background jobs; listed so they aren't lost |

None of this is MVP. The *Toned-down MVP* idea in Features & Ideas stands.

## 7. Decisions for the owner

1. **Agree the three jobs** (Follow, Get ready, Keep it fresh) and the cuts in §4?
2. **Run the two-week Follow test?** If yes: which topic, and which sources do you actually read?
3. **A real date for the Get ready test?** Name one coming up.
4. **Drop the word "Routines"** for the plain verbs, with Settings › *While you're away* as the only list?
