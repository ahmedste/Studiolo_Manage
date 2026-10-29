MEDIUM (a UX design for routines; the machinery is in the routines v3 spec)

# Routines you make by talking to Loci: the user experience

**For:** the owner, to judge the experience, and the agent who later builds it in `studiolo`.
**Status:** Proposed. Claude, 29 October 2026. Nothing here is approved until the owner says so in the conversation.
**Prototype:** [`prototypes/routines/`](../../../prototypes/routines/README.md), published as **Studiolo Routines** (a new link; version 3 stays at its own).
**Owner's direction (29 Oct):** "How to write a routine should be user friendly. It can be through a chat in the page. Have all of that, and have it less overwhelming. Clarity is key."
**Builds on:** [Routines, version 3](2026-10-29-routines-filing-rules-design.md) for what routines can do (filing rules, schedules, events, trust, channels). This document changes **how the learner sees them, makes them and changes them**, not what they can do.

## 0. In short

Version 3 showed everything at once: suggestions, numbered rules with long sentences and stats, schedule cards, event cards, templates, an Inbox with a send panel, Runs, and a rule editor with five sections. It could do everything and it overwhelmed.

Version 4 keeps all of it and shows almost none of it until it's needed:

| Before (v3) | Now (v4) |
|---|---|
| A rule editor with channel, conditions, four filing fields, eight "Have Loci" toggles, learn toggles, reply, mode, try, name | **Tell Loci.** It asks only what's missing (usually one to three taps), shows what the routine would have done, and you press **Turn it on** |
| Cards with stats, run marks, cost, place, five actions | **One sentence per routine**, a switch, and one quiet line ("Asks you first · right 9 of 10 · Stop asking?") |
| Edit by opening a sheet | **Tap any underlined word** in the sentence and choose. Or **Change it with Loci** |
| Inbox, Runs, and waiting items on each card | **One "Waiting for you" strip.** One decision per card, opened when you want it |
| Templates, suggestions and tiles on the page | **Loci offers them in the chat:** three starters, and one thing it noticed you doing by hand |
| Which parts use AI, cost, tokens | **Builder only.** A learner never needs to see it |

## 1. The page

**Read top to bottom:**
1. **Routines**, with one line: *Things Loci does for you, the way you asked. To make one, tell Loci. To change one, tap any underlined word.*
2. **Waiting for you**, one strip: *3 things waiting for a quick look · Look now.* Opened, it shows one card per decision:
   - *File it* (with a topic to change, only where the topic was Loci's guess) or *Not this*;
   - for something no routine covers: *File it there*, *Leave it in Unsorted*, or **Make a routine for things like this**;
   - for the To read pile: *Read it this week · Keep · Let go*.
3. **Three groups**, by what starts a routine: *When I send something* (numbered, because order matters: *checked from the top; the first one that fits files it*), *On a schedule*, *After I do something*.

**Each routine is one row:**
- **The name and a switch.**
- **One sentence**, in the reading face: *When I send a photo with #site on WhatsApp, describe it, file it as Site photos and add it to the prayer hall project.*
  - **Underlined words are the choices.** Tapping one opens a small list (WhatsApp / By email / Shared from my phone…). Nothing else in the sentence is a control.
- **One quiet line:** *Files on its own · 31 filed this month*, or *Asks you first · right 9 of 10 · Stop asking?*
- **Tap the name** for more: *Lately* (the last three things it did, with Undo), *What would it do?* (on your last 20 things), *Change it with Loci*, *Move up*, *Delete*.

## 2. Making a routine: the conversation

Loci lives beside the list on a desktop. On a phone it's the Loci bar at the foot (*Tell Loci what should happen…*), opening the chat as a sheet, as in the phone design.

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
- The new row lights up in the list.
- Chips follow: *Make another · That's all*.

**Duplicates are caught:** *You already have "Site photos", which does most of this. Change that one instead?*

## 3. Changing a routine

There are three ways in, each one step:
1. **Tap a word in its sentence** and choose. A toast says *Changed "Books"*, with Undo.
2. **Change it with Loci.** The chat shows *Changing: Books ×* above the box, and offers the likely changes as chips (*Stop asking, just file them · Pause it · Delete it*). Or say it: *"ask me first and also tell me on WhatsApp"* gets *Done: it asks you first and it tells you on WhatsApp*, with *Undo that*.
3. **The switch**, to pause and resume.

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

A small model is enough for this. Saving a routine never needs a model.

In the prototype, a keyword reader stands in for the model call, so typing works for the common phrasings; the chips cover the rest.

## 6. Decisions for the owner

1. **Is this the experience?** Chat to make, tap a word to change, one waiting strip, everything else hidden.
2. **Where Routines live.** Under Today (as here), or reached from the Loci bar anywhere ("Tell Loci what should happen…" works on every page)?
3. **The waiting strip on Today:** just the count (as here), or the first card itself, so one decision can be made without leaving Today?
4. **Starters:** Loci's three starter chips, chosen from the learner's own activity (as here), or a fixed set?
