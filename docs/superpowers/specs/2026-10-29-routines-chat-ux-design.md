MEDIUM (a UX design for routines; the machinery is in the routines v3 spec)

# Routines you make by talking to Loci: the user experience

**For:** the owner, to judge the experience, and the agent who later builds it in `studiolo`.
**Status:** Proposed. Claude, 29 October 2026. Version 5 (the page, §0 and §1) replaces version 4's single list; the conversation (§2 to §5) stays. Nothing here is approved until the owner says so in the conversation.
**Prototype:** [`prototypes/routines/`](../../../prototypes/routines/README.md), published as **Studiolo Routines** (the same link as version 4; version 3 stays at its own).
**Owner's direction (29 Oct):** "How to write a routine should be user friendly. It can be through a chat in the page. Have all of that, and have it less overwhelming. Clarity is key."
**Owner's direction on version 4 (29 Oct):** "Still very linear … overwhelming … It has to be properly segregated. … I ask my question, and this question has to be answered. And on the right, the Loci side panel has to be the same design we have everywhere. … Less overwhelmed, better UX and UI and clarity, so the user knows where to click. … Have the routine page similar to what we usually do in the app, rather than feeling like an add-on."
**Builds on:** [Routines, version 3](2026-10-29-routines-filing-rules-design.md) for what routines can do (filing rules, schedules, events, trust, channels). This document changes **how the learner sees them, makes them and changes them**, not what they can do.

## 0. In short

**Version 5 builds the page from parts the learner already knows.** Nothing on it is new to Studiolo:

| Owner's point on version 4 | Version 5 |
|---|---|
| "Very linear, overwhelming" | **Three tabs, one job each** (the app's destination tabs): *Your routines · Waiting · Activity*. Routines are **cards in a grid**, in three groups, not one long list of sentences |
| "Properly segregated" | Each part has one place: **what you have** (cards), **what needs you** (Waiting), **what happened** (Activity), and **Loci** (the panel on the right). The sentence with tappable words lives only in Loci, once a card is open |
| "So the user knows where to click" | One primary button, **New routine**. A card opens the routine in Loci. Waiting has one decision per card. Everything else is a chip or a prompt in Loci |
| "The Loci side panel has to be the same design we have everywhere" | **The copilot panel itself**, with the same markup and styles as on the map: kicker, title, status chips, *All routines / This routine* tabs (as *Culture & Context area / This topic*), messages, answer chips, cards, prompts, and the composer with its scope chip |
| "I ask my question, and this question has to be answered" | **Loci answers questions about routines**, not just builds them: what they did this week, what's waiting, why something was filed where it was, how routines work, what they cost. Each answer links to the place it's about |
| "Similar to what we usually do in the app, not an add-on" | It's **part of the Library** (*Library / Routines*), with the Library's search row, filter pills and cards, and the Graph page's layout (content on the left, Loci on the right). On a phone, Loci is the app's bottom sheet |

What version 4 got right stays: you make a routine by telling Loci, Loci asks only what's missing, it shows what the routine would have done before anything changes, and you change a routine by tapping a word or saying it.

## 1. The page

**Where it lives:** *Library / Routines*, reached from the Library in the rail. Routines are mostly about how things get into the Library, so they belong with it. Decision 2 in §6 asks whether this is the right home.

**Left, *Your routines* tab** (the Library's own pieces):
1. One plain line: *Things Loci does for you, the way you asked: mostly filing what you send. Open one to see what it did or to change it.*
2. **The search row** (*Search your routines…*, a count, and **New routine**, the page's only primary button).
3. **The filter pills:** *All 9 · When I send 5 · On a schedule 2 · After I do something 2*.
4. **Three groups of cards**, each with a heading and one line:
   - *When I send something*: checked from the top; the first one that fits files it. Cards are numbered.
   - *On a schedule*: they run on their own, when you said.
   - *After I do something*: they follow up on something you did.
5. **Each card** is a Library card:
   - kicker: its number and channel (*1 · WhatsApp*), or when it runs (*Fridays, 17:00*);
   - the name;
   - one line: *Photos with #site → Site photos, prayer hall project · described*;
   - a footer with a status dot: *Files on its own · 31 this month*, *Asks you first · right 9 of 10*, or *Next: Fri 30 Oct*.
   - The open card is outlined; a paused one is greyed; a new one shows as a **draft card** (*Draft · not on yet · Turn it on in Loci*) until it's turned on.

**Left, *Waiting* tab:** one card per decision, as in version 4 (*File it* or *Not this*; for something no routine covers, *Make a routine for things like this*; the To read pile). The tab shows the count.

**Left, *Activity* tab:** a log by day (*07:52 · Books suggests a place for "Climate Considerations…" · Check it*), with *Undo* on what was just filed. A routine's name opens it in Loci.

**Right, the Loci panel:**
- **Nothing open: the overview** (the head reads *Studiolo · Routines*):
  - *Good morning, Layla.*;
  - a summary card: *9 routines on · 23 things filed for you this week*;
  - *3 things waiting for a quick look ›*;
  - **Ideas for you**: the one thing Loci noticed you doing by hand (*File dezeen.com links as Precedents · Do it*), and two set-ups that fit your library.
  - Prompts: *What did my routines do this week? · What's waiting for me? · Why was something filed where it was? · How do routines work?*
- **A routine open:**
  - The head: *Routine · When I send something*, the name with its status dot, and chips: *On ▾*, *Asks you first ▾*, *right 9 of 10*, *More ‹* (Move up, Delete).
  - The tabs: *All routines / This routine*.
  - Under *This routine*: **What it does**, the sentence with tappable words, and *What would it do?*; then **Lately**, the last three things it did; then the conversation about it.
  - The composer is scoped: *About Books ×*. Prompts: *Stop asking, just file them · What did it do this week? · Why did it file the last one there? · Pause it*.

**Tablets and phones:** the cards fill the page. Loci folds to the composer at the foot (*Ask Loci about your routines…*), as the app's drawer does. Opening a card, or typing, raises it as a sheet; the chevron folds it away.

## 2. Making a routine: the conversation

It happens in the Loci panel, under *All routines*. **New routine**, an idea, or just typing starts it. On a phone the panel rises as a sheet.

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
- The draft card on the left becomes routine 1 and lights up.
- Chips follow: *Open it · Make another*.
- **Questions mid-way are answered.** Ask *what's waiting for me?* halfway through and Loci answers, then says *Back to your new routine* and asks again.

**Duplicates are caught:** *You already have "Site photos", which does most of this. Change that one instead?*

## 3. Changing a routine

There are three ways in, each one step:
1. **Tap a word in its sentence** and choose. A toast says *Changed "Books"*, with Undo.
2. **Tell Loci.** With the routine open, the composer reads *About Books ×* and the prompts offer the likely changes (*Stop asking, just file them · Pause it*). Or say it: *"ask me first and also tell me on WhatsApp"* gets *Done: it asks you first and it tells you on WhatsApp*, with *Undo that*. A question about it (*why did it file the last one there?*) gets an answer, not a change. Saying a whole new routine moves you to *All routines* and starts it there.
3. **The chips in Loci's head:** *On ▾* (On or Paused) and *Asks you first ▾*.

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
   - Cards in tabs on the left, the real Loci panel on the right.
   - Loci answers questions as well as making and changing routines.
   - Tap a word to change one.
2. **Where Routines live.** *Library / Routines* (as here), or a fifth Library tab beside *Everything · Collections · To read · Templates*, or their own place in the rail? Either way, Loci anywhere can make one ("Tell Loci what should happen…").
3. **The waiting strip on Today:** just the count (as here), or the first card itself, so one decision can be made without leaving Today?
4. **Starters:** Loci's three starter chips, chosen from the learner's own activity (as here), or a fixed set?
