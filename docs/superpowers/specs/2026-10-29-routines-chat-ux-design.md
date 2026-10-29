MEDIUM (a UX design for routines; the machinery is in the routines v3 spec)

# Routines you make by talking to Loci: the user experience

**For:** the owner, to judge the experience, and the agent who later builds it in `studiolo`.
**Status:** Proposed. Claude, 29 October 2026. Version 8 moves Routines under Loci and turns the editor into a flow of a trigger and steps (§1.7); version 6 (the tab, a routine's page, the editor and New routine, §0 and §1) replaced versions 4 and 5's pages; the conversation (§2 to §5) stays. How it runs, what it runs on and what it costs: [the system and cost study](2026-10-29-routines-system-and-cost-study.md). Nothing here is approved until the owner says so in the conversation.
**Prototype:** [`prototypes/routines/`](../../../prototypes/routines/README.md), published as **Studiolo Routines** (the same link as version 4; version 3 stays at its own).
**Owner's direction (29 Oct):** "How to write a routine should be user friendly. It can be through a chat in the page. Have all of that, and have it less overwhelming. Clarity is key."
**Owner's direction on version 7 (29 Oct):** "How it starts needs some kind of integration, like Make.com or Zapier do … the same function, just more visual. … Is Routines the right name now? Where does this fit? Commonplace? Under Loci?"
**Owner's direction on version 6 (29 Oct):** "Can we have a type that works on checking resources and then suggests it in a page? Like AI news in a specific field."
**Owner's direction on version 5 (29 Oct):** "Where are the screens to view or edit a routine? Also, can the cards get more interesting? Look at the goals and questions cards we designed in another chat."
**Owner's direction on version 4 (29 Oct):** "Still very linear … overwhelming … It has to be properly segregated. … I ask my question, and this question has to be answered. And on the right, the Loci side panel has to be the same design we have everywhere. … Less overwhelmed, better UX and UI and clarity, so the user knows where to click. … Have the routine page similar to what we usually do in the app, rather than feeling like an add-on."
**Builds on:** [Routines, version 3](2026-10-29-routines-filing-rules-design.md) for what routines can do (filing rules, schedules, events, trust, channels). This document changes **how the learner sees them, makes them and changes them**, not what they can do.

## 0. In short

Version 6 answers two points from the owner:

- **Every routine has a page and an editor.** Before, a routine could only be seen and changed inside the Loci panel. Now:
  - a card opens **the routine's page**;
  - **Edit** opens a short form.
- **The cards share the Questions and goals look** ([Questions and goals design](2026-10-25-questions-and-goals-inside-items-design.md) §10, prototype `objects-boards-questions` on branch `claude/gifted-cerf-w0cwoi`), so a routine card, a goal card and a question card read as one family.

| | Questions and goals | Routines |
|---|---|---|
| Where | A Commonplace tab | A Commonplace tab, beside it |
| Top of the page | Four tiles: open · goals · answered · parked | Four tiles: on · waiting for you · new finds · filed this week |
| The bar | *Open · Answered · Parked · All*, topic chips, Cards · List | *Routines · Finds · Waiting · Activity*, kind chips, **New routine** |
| A card | A top line; the ring; a kicker; the goal in Newsreader; its questions as small rows; **Next**; a footer with where it was written and *Active ▾* | A top line; a round mark for what starts it; a kicker; the name in Newsreader; **When · Loci · Then** as small rows; **Last**, **Waiting** or **Next**; a footer with the ring or the count and *On ▾* |
| Colours | ? amber open · ◎ accent goal · ✓ green answered · – grey parked | amber: waiting for you · accent: on · green: filed · grey: paused |
| The ring | Questions answered of the goal's total | **How often it was right when you checked** (9 of 10). It's the routine's progress toward filing on its own |

What versions 4 and 5 got right stays:
- the real Loci panel on the right, which answers questions as well as making and changing routines;
- making a routine by telling Loci;
- tapping a word to change it;
- one place for what needs you.

## 1. The screens

### 1.1 The Routines tab

**Where it lives:** *Commonplace*, as a tab after *Everything · Collections · To read · Questions and goals · Templates*. When something waits for you, the tab shows an amber count.

**Top to bottom:**
1. **Four tiles**, each a number with its mark: *11 routines on · 3 things waiting for you · 7 new finds to look through · 23 filed for you this week*. Clicking one filters the tab or opens that view.
2. **One bar:**
   - *Routines 11 · Finds 7 · Waiting 3 · Activity*;
   - kind chips (*All kinds · When I send · On a schedule · After I do something*);
   - **New routine**, the page's one primary button.
3. **Cards in three groups**, each with a heading, a count and one line:
   - *When I send something*: checked from the top; the first one that fits files it.
   - *On a schedule*.
   - *After I do something*.
   - A routine Loci has drafted but isn't on yet sits in its group as a **dashed draft card**, with **Edit** and **Turn it on**.

**A card:**
- **The top line:** the accent when it's on; amber when it has something waiting for you; grey when paused.
- **The mark:** what starts it (WhatsApp, email, phone, browser, anywhere, a clock, a Lumen).
- **The kicker:** *1st in line · WhatsApp*, or *Next: Fri 30 Oct*.
- **The name**, in Newsreader.
- **Three small rows**, each with its own dot:
  - **When:** *A photo with #site, on WhatsApp*;
  - **Loci** (accent): *Describe it*;
  - **Then** (green): *Site photos · prayer hall project*.
- **One line under them:** *Last: North wall, morning · Yesterday, 16:05*; or *Waiting: "Climate Considerations…" · Check it* (amber); or *New: it starts with the next thing that fits*.
- **The footer:** the ring and *right 9 of 10* for a routine that asks first, or *31 filed this month*; and **On ▾**, which pauses it.

**Waiting** and **Activity** are the same as in version 4. Waiting cards use the question card's look: an amber top edge and a **?** mark.

### 1.2 A routine's page

Open by clicking a card, a routine named in Activity, or a routine in one of Loci's answers. The crumb reads *Commonplace / Routines / Books*. **‹ Routines** goes back.

1. **The header:**
   - the mark;
   - *When I send something · 2nd in line*;
   - the name;
   - *On ▾*, *Asks you first ▾* and the count;
   - **Edit**.
2. **Waiting from this routine**, if anything is: an amber line that opens Waiting.
3. **What it does:** the sentence, large, with tappable words (§3).
4. **When → Loci → Then**, three boxes side by side:
   - **When:** *Sent on WhatsApp · A photo · With the tag #site*.
   - **Loci:** *Describe it*, or *Nothing to read: plain rules only*.
   - **Then:** *File it as Site photos · Add it to the prayer hall project · On its own*.

   With **Builder** on, the parts that need Loci to read the item are dotted.
5. **How it's doing:**
   - **Asks first:** the ring, *Right 9 of 10 times you checked*. At 9 of 10 or better, it offers **Stop asking, file on its own** (the trust ladder).
   - **Files on its own:** *31 filed this month*.
   - **When I send:** *Checked 2nd of 6*, with **Move up** and **Move down**.
   - **On a schedule:** *Next: Fri 30 Oct*.
6. **Lately:** the last five things it did. Each has **Why?**, which Loci answers from the conditions that matched and the routines above it that didn't.
7. **With your last 20 things:** what it would have done.
8. **The foot:** *Pause it · Duplicate · Delete routine*. A deleted routine keeps what it filed, and Undo brings it back.

Loci's panel switches to **This routine** while the page is open. Changes Loci makes show on the page, with *Undo that*.

### 1.3 The editor

The same form serves **Edit**, **New routine**, *Edit in full* on a draft Loci made, *Duplicate*, and *Make a routine for things like this* from Waiting.

**At the top, staying in view:** **It will…**, the routine as a sentence, rebuilt as you change anything. Under it: *3 of your last 20 things would have fitted it.*

**Five numbered sections** for *When I send something*:

| Section | Fields |
|---|---|
| 1. When it starts | **Sent from** (WhatsApp · Email · Phone share · Browser · Anywhere); **What kind** (Anything · Photo · Link · PDF · Voice note · Reel · Video); **Only if**: conditions you add (*has a tag · from a site · mentions words · Loci reads what it is · is about a topic*), each removable. The ones Loci must read are dotted |
| 2. What Loci does with it | Optional: *Describe it · Write out what I said · Sum it up in three lines · Find the book · Keep just the recipe · Keep the links in its caption · Turn my questions into @questions*. A note says these use a little allowance |
| 3. Where it goes | **File it as** (a collection kind); **On** (the topic it's about, a topic, or none); **Mark it** (To read, Reading); **Also add to** (a project); **Tell me** on WhatsApp |
| 4. Before it files | Two choices with what each means: **Ask me first** (and when Loci will offer to stop) or **File on its own** (undo from Activity) |
| 5. Name | Filled in from the rule until you type one |

- Schedules get *What it does* (new ones only) · *When it runs* (day chips and a time) · *What it brings you* (topic, number of questions, or sources) · *Name*. *After a Lumen* gets *when the check comes back*.
- **Save changes** (or **Turn it on** for a new one) and **Cancel** stay at the foot.
- **Guard:** with no kind and no condition, the save button is off: *Choose a kind or add a condition first. With neither, it would catch everything you send.*
- **With Loci:** while the form is open, *ask me first* or *also describe them* typed to Loci changes the form, not the routine: *Changed in the form: it asks you first. Save when you're ready.*

### 1.4 New routine

**New routine** opens one screen, *What should Loci do for you?*, with three ways in:

1. **Tell Loci** (*Easiest*): two starters as chips and **Tell Loci**. The conversation in §2 runs in the panel, and the draft lands in the grid.
2. **Set it up yourself** (*Step by step*): choose *When I send something*, *On a schedule* or *After I do something*. The editor opens empty.
3. **Start from one of these:** six templates as dashed cards, each opening in the editor:
   - *PDFs by email*;
   - *Reels: keep the links*;
   - *Lectures to watch*;
   - *Sort Unsorted every evening*;
   - *Follow: AI in architecture*;
   - *Morning review*.

### 1.5 Finds: a routine that checks sources and brings what's new to a page

This is the *Follow sources* routine (routines v3 spec §1; 25 Oct design), made into its own kind. It watches sources for a subject, such as *AI in architecture*, and each run brings what's new to **a Finds page**, where the learner keeps what's useful.

**Making one:**
- *Keep me up to date on AI in architecture*, *AI news in architecture*, or *Every Monday, find new papers on wind towers*, said to Loci; or **New routine → Find new things for me**.
- Loci asks only for the sources (your most-saved-from, each a tick) and how often. Before anything runs, it shows three things it would have found this morning.
- The editor's sections:
  1. **What to look for:**
     - **Subject** in your own words (*AI in architecture*), or a topic as a whole;
     - **Sort onto** whichever topic fits, or one topic;
     - **Look for**: articles, papers, talks, tools and data;
     - **Where to look**: your sources, plus **Add a website, newsletter, journal or channel**;
     - **How many**: up to 3, 6 or 10;
     - **Bring them**: on a Finds page (you choose), or straight into To read.
  2. **When it runs:** day chips and a time.
  3. **Name.**
- Its sentence: *Every morning at 7:30, look through 4 sources for new articles, papers, talks and tools on AI in architecture, and bring me up to 6 finds on a Finds page.* Every underlined part is tappable.

**Where finds show:**
- **The tab:** a **new finds** tile, and **Finds** in the bar beside *Routines · Waiting · Activity*. Finds lists one card per run (*AI in architecture · Today, 07:30 · Monday 26 October*): the first three finds as rows, the top pick, and a ring for how many are decided.
- **The routine's card:** *Finds: 6 new finds · Today, 07:30 · Look through*.
- **The routine's page:** its latest Finds pages first, and **Check now**.
- **Today:** *This morning's finds: 6 new. Top pick: "…"*. **Loci:** *What did you find today?*
- **Activity:** *AI in architecture brought 6 finds to a Finds page · Look through*.

**A Finds page:**
- **The header:**
  - *Finds · AI in architecture*;
  - the date;
  - *6 finds from 4 sources · Loci looked at 41 · Today, 07:30*;
  - a ring: *6 to decide*.
- **The top pick**, large; then the rest **grouped by topic** (as the question wall is).
- **Each find:**
  - its kind, source and length (*Paper · Building-science journal · 12 min read*);
  - the title, in Newsreader;
  - a two-line summary;
  - **why it's for you**, in the Questions and goals marks:
    - amber **?** *May answer your question "Where does the light come from in each hall?"*;
    - accent **◎** *Serves your goal "…"*;
    - a green dot *Fits Daylight & shading*;
    - or a note, such as *A different view from the precedents you saved this month*.
- **One decision each:**
  - **Save**, as *Papers* on *Daylight & shading*, both changeable. A find that may answer a question is saved linked to it.
  - **Read later** puts it in To read.
  - **Not for me** asks why (*Not this topic · Not from this source · Too basic · Just not now*), and the next run uses the answer.
  - Each has Undo.
- **Ask Loci** on a find: Loci sums it up, says where it sits beside what you've saved, and offers *Save it and make a Lumen*, *Compare with what I've saved*, or *Just save it*. This is the step from finding to learning.
- **Left out 17:** *3 already in your Commonplace · 11 off your topics · 3 the same story twice*, with **See them**, in case Loci got one wrong.
- **The foot:** *Read the rest later · Clear the rest*; *Change what it looks for* opens the editor.

**How it runs in the app:**
- **Fetching:**
  - A scheduled job (the Trigger.dev worker from the routines v3 spec, §7) runs at the routine's time.
  - It fetches each source's feed: RSS or Atom for sites and journals, a newsletter's emails through the learner's own address, or a channel's feed.
  - Items it has seen before are dropped by link, then by title similarity.
- **Plain checks, in code:**
  - already in the Commonplace (link, DOI or near-identical title);
  - the same story from two sources;
  - older than the last run.
- **One small-model call per run,** with structured output, for what's left (often 20 to 40 items):
  - the subject, the learner's topics, their open questions and goals, and the last 30 *Not for me* reasons;
  - each item's title, source and first paragraphs.

  It returns a relevance score, a two-line summary and the *why* for each, plus which question or goal it bears on. Code then keeps the top *N*, and it never invents a link.
- **Cost:** scheduled runs go through the Batch API, with the learner's context cached. A run with nothing new makes no model call.
- **Learning from decisions:** *Not from this source* lowers that source; *Not this topic* lowers that topic for this routine; Saved items raise both. These are plain weights in code, and the model call sees them.
- **Suggesting sources** (later): Loci proposes a source the learner has saved from three or more times. Searching the open web for new sources is a separate decision (§6).

In the prototype, finds are examples and **Check now** builds a page from them.

### 1.6 Tablets and phones

- The tab, the page and the editor fill the screen.
- Loci folds to the composer at the foot, as the app's drawer does; typing or *Why?* raises it as a sheet.
- The flow stacks from top to bottom.
- The editor's labels sit above their fields.

### 1.7 Version 8: a flow of a trigger and steps, under Loci

**Where it lives.** Routines leave Commonplace for **a Loci place in the rail**, after Graph (on a phone, a fifth tab). Its header reads *Loci / Routines*, with tabs **Routines · Finds · Waiting · Activity · Connections**. Commonplace keeps its own tabs. The name stays **Routines**. The reasons are in the [system and cost study](2026-10-29-routines-system-and-cost-study.md) §1.

**The editor is a flow,** as in Zapier: a vertical line of cards, one per step, with a **+** between them.
- **The title** is typed at the top, in the reading face. Under it, **It will…** (the sentence), how many of the last 20 things it would have caught, and **the cost line** (*Under 1% of your monthly allowance*; dollars in Builder view).
- **The first card is the trigger** (*When*). An empty routine starts with **Pick a trigger**, a grid of "apps" in five groups:
  - *Send to Studiolo*: WhatsApp, Email, Phone share, Browser, Anywhere;
  - *Watch sources*: websites and journals, newsletters, YouTube;
  - *On a schedule*;
  - *In Studiolo*: Finish a Lumen, Save something twice (Add a question and Set a goal: soon);
  - *Connected apps* (soon): Zotero, Readwise, Google Drive, Raindrop, Calendar.
- **Then the steps,** each a card with its kind as a tag:
  - **Only if** (the filters; dotted when Loci must read the item);
  - **Loci** (what Loci does with it);
  - **Then** (where it goes, and *Tell me on WhatsApp*);
  - **Before it files** (ask first, or file on its own).
- **Click a card** to open its settings in place; **×** removes a step; **+** offers only the steps that fit the trigger.
- **On a routine's page**, *Step by step* shows the same flow read-only, and clicking a step opens the editor at that step.

**Connections** lists every way in (Send to Studiolo: connected, ready or not set up), the sources the learner watches (with the routines using each, and one that has gone quiet), and the connected apps to come.

## 2. Making a routine: the conversation

It happens in the Loci panel, under *All routines*: from **Tell Loci** on the New routine screen, from an idea, or by just typing. On a phone the panel rises as a sheet. Anyone who'd rather fill in a form has the editor (§1.3), and any draft Loci makes opens there with **Edit in full**.

**How Loci starts:**
- *Tell me what should happen, and when, the way you'd tell an assistant. I'll set it up and show you what it would have done before anything changes.*
- Three starters as chips, picked for this learner: a PDF summary rule, a nightly tidy, following a subject.
- **One thing it noticed:** *You filed 7 links from dezeen.com as Precedents by hand this month. Shall I do that for you from now on?* This stays answerable until answered.

**How Loci asks:**
- **It only asks what the sentence left out**, one question at a time, each with tap answers. A typed answer works too: "yes" and "WhatsApp" are matched to the chips.

  | If you didn't say… | Loci asks |
  |---|---|
  | where you'll send it from | *Where will you send these from?* WhatsApp · Email · Sharing from my phone · Anywhere |
  | which things | *Which kind of thing?* Photos · Links · Voice notes · PDFs · Reels · Videos |
  | where they go | *Where should they go?* On the topic each one is about · In the prayer hall project · On a topic I choose |
  | (it offers one useful extra for that kind) | Photos: *describe each one?* Voice notes: *write out what you said?* PDFs: *a three-line summary?* Books: *find it and mark it To read?* Recipes: *keep just the recipe?* |
  | whether to ask first | *Should I ask you before filing each one, or just file it? Either way, you can undo anything. I'd start by asking…* |
  | when (schedules) | *When should I go through it?* Every evening · Sunday evenings · Every morning |
  | which sources (Follow) | Your most-saved-from sources, each a tick you can untick, then *Use these* |

- A full sentence ("When I email myself a PDF, sum it up in three lines and put it on its topic") needs **one** question. A vague one ("keep me up to date on AI in architecture") needs three.
- If the subject isn't on the map, Loci says so plainly and what it will do: *"AI in architecture" isn't a topic on your map yet, so I'll watch for it across your whole map … If it keeps coming up, I'll suggest a sub-topic.*

**The preview:**
- *Here it is.* A card with the routine's name and its sentence, where the underlined words are tappable.
- For a filing rule, **what it would have done**: *3 of the last 20 things you sent would have been filed. Nothing moves until you turn it on*, with the three things and where each would have gone.
- **Turn it on** or **Change something**.

**After Turn it on:**
- *Done. "PDFs by email" is on. It's first under "When I send something", so it gets the first look. I'll ask you about the first few so you can check me.*
- The draft card in the grid becomes routine 1 and lights up.
- Chips follow: *Open it* (its page) · *Make another*.
- **Questions mid-way are answered.** Ask *what's waiting for me?* halfway through and Loci answers, then says *Back to your new routine* and asks again.

**Duplicates are caught:** *You already have "Site photos", which does most of this. Change that one instead?*

## 3. Changing a routine

There are four ways in:
1. **Tap a word in its sentence**, on its page or in a draft, and choose. A toast says *Changed "Books"*, with Undo.
2. **Tell Loci.** With the routine open, the composer reads *About Books ×* and the prompts offer the likely changes (*Stop asking, just file them · Pause it*). Or say it: *"ask me first and also tell me on WhatsApp"* gets *Done: it asks you first and it tells you on WhatsApp*, with *Undo that*. A question about it (*why did it file the last one there?*) gets an answer, not a change. Saying a whole new routine moves you to *All routines* and starts it there.
3. **The status buttons:** *On ▾* on its card and its page, and *Asks you first ▾* on its page.
4. **Edit**, for everything at once (§1.3).

A deleted routine keeps what it filed, and *Bring it back* restores it.

## 4. Where results show

- **Today:** one card under Continue: *Since yesterday evening, your routines filed 6 things for you. 3 things are waiting for a quick look. Look now.*
- **A toast when something arrives:**
  - *"Site photos" filed "East court at 4 pm" as Site photos in the prayer hall project. Undo.*
  - *"Books" suggests a place for "The Environmental Imagination". It's waiting for you.*
  - *No routine covers "Japanese joinery without nails" yet. It's waiting for you.*

## 5. How the conversation works in the app

The chat is **one model call per turn**, with the routine schema as structured output:
- the learner's words;
- the draft so far;
- the learner's topics, channels and sources;
- which slots are still empty.

The model returns the updated draft and **the next missing slot**. The question for each slot and its answer chips are **templates in code**, not written by the model each time, so questions stay short and identical for everyone.

Everything else is code:
- **What it would have done** runs the real matcher (from the v3 spec) over the learner's last 20 arrivals.
- **Duplicates** are found by comparing the draft with existing routines.
- **The noticed suggestion** comes from counting repeated filings done by hand.

**Questions** use the same call: it first says whether the turn makes a routine, changes one, or asks something.
- An answer is built from the routines' own records, never from the model's memory:
  - the activity log (what was filed, where, and by which routine);
  - Waiting;
  - each routine's conditions and its place in the order.
- "Why was this filed there?" is answered by replaying the matcher: which conditions fit, and which routines above it didn't.
- Each answer ends with a link to where it's shown: Activity, Waiting, or the routine.

A small model is enough for this. Saving a routine never needs a model.

In the prototype, a keyword reader stands in for the model call, so typing works for the common phrasings; the chips cover the rest.

## 6. Decisions for the owner

1. **Is this the experience?**
   - Cards in the Questions and goals look.
   - A page for each routine, and one form for editing and making.
   - The real Loci panel, which answers questions and can make and change routines.
2. **Where Routines live.** Version 8 puts them under Loci, in its own place in the rail (§1.7), instead of a Commonplace tab beside Questions and goals (version 7). Either way, Loci anywhere can make one ("Tell Loci what should happen…").
3. **Which way in comes first on New routine:** *Tell Loci* (as here), or the form?
4. **Finds:**
   - Is a page per run right, or one running list?
   - Finds is now a tab of the Loci place (§1.7).
   - Should Loci also search the open web for a subject, beyond the chosen sources? That costs more, and the results are less sure.
5. **The waiting strip on Today:** just the count (as here), or the first card itself, so one decision can be made without leaving Today?
6. **Starters and templates:** Loci's three starter chips, chosen from the learner's own activity (as here), or a fixed set?
7. **The flow editor** (§1.7): a vertical list of a trigger and steps, as in Zapier, rather than Make's free canvas. The engine, models and costs behind it are decisions RT-1 to RT-10 in the [system and cost study](2026-10-29-routines-system-and-cost-study.md) §10.
