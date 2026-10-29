# Routines (version 5): a page like the rest of Studiolo

Version 4 put everything on one long page beside a chat panel of its own. It read as an add-on, and it didn't make clear where to click. This version keeps the same powers but builds the page from the app's own parts, laid out like the Graph page:

- **The page has three tabs**, using the app's destination tabs: **Your routines · Waiting · Activity**. Each tab does one job.
  - **Your routines** uses the Library's own pieces: the search row, the filter pills (*All · When I send · On a schedule · After I do something*), and cards in three groups. Each card shows a kicker, a name, one line, and a footer with a status dot. The page has one primary button: **New routine**.
  - **Waiting** holds one card per decision.
  - **Activity** is a log of what your routines did, with Undo.
- **On the right is the Loci panel, exactly as on the map.** It's the copilot's own markup and styles: the head (kicker, title, chips, tabs), the conversation, the answer chips, and the prompts plus the composer.
  - With nothing open, it shows the overview (**All routines**, like *Your whole map*): a greeting, the summary, what's waiting, and ideas.
  - **Click a card** and Loci switches to **This routine** (like *This topic*). It shows what the routine does as a sentence with tappable words, and what it did lately. The chips in the head are *On ▾*, *Asks you first ▾* and the count. Prompts and the composer are scoped to that routine.
- **Loci answers questions** as well as making and changing routines:
  - *What did my routines do this week?*
  - *What's waiting for me?*
  - *Why was something filed where it was?*
  - *How do routines work?*
  - *What does this one cost?*
- **A new routine shows on the left as a draft card** until you press **Turn it on** in Loci (propose, then confirm).

UX design: [`docs/superpowers/specs/2026-10-29-routines-chat-ux-design.md`](../../docs/superpowers/specs/2026-10-29-routines-chat-ux-design.md), §0 and §1. What routines can do (filing rules, schedules, events, channels, trust): [`2026-10-29-routines-filing-rules-design.md`](../../docs/superpowers/specs/2026-10-29-routines-filing-rules-design.md).

It's built on **Studiolo's real shell, Library and Today screens and styles**, captured read-only from `studiolo` (`../live-lumens/capture/snap.json`). The sample learner, Layla, is an architect working on a prayer hall in Dubai. "Now" is Monday 26 October, 8:10.

Open `dist/routines-prototype.html`. Links: `#routines` (default), `#waiting`, `#activity`, `#today`.

## Try it

1. **Ask first.** In Loci, tap *What did my routines do this week?*. Loci answers with the busiest routines; tap one to open it. Then try *What's waiting for me?* and *Why was something filed where it was?*.
2. **Open a routine.** Click the *Books* card. It's highlighted, and Loci shows *This routine*.
   - Tap *To read* in the sentence and choose *Reading*.
   - Use the *Asks you first ▾* chip, *What would it do?*, and *More ‹* (Move up, Delete).
   - Type *what did it do this week?*, then *stop asking, just file them*, then *Undo that*.
3. **Make one.** Press **New routine** and tap *When I email myself a PDF, sum it up in three lines and put it on its topic*.
   - Loci asks one question (ask first, or just file).
   - A draft card appears on the left. Loci shows the sentence and what it would have done with your last 20 things.
   - Tap *the topic it's about* to choose *Precast*, then **Turn it on**. It becomes routine 1, and *Open it* takes you to it.
4. **Make one by typing:**
   - *Every evening, sort what I haven't sorted* (then type *yes*);
   - *Keep me up to date on AI in architecture*: untick a source, *Use these*, *Every morning*.
   - Ask a question halfway through. Loci answers, then returns to its question.
5. **Something that already exists:** with *Voice notes* open, type *When I send a voice note on WhatsApp, write it out*. Loci moves the request to *All routines* and points to the routine you already have.
6. **Ideas for you** (overview): *File dezeen.com links as Precedents* is one tap, with *Undo that*.
7. **Waiting:** file the book (change its topic first, if you like) and the voice note, and decide on the To read pile.
8. **Send something…** (prototype controls):
   - a #site photo files on its own;
   - a book cover waits for you;
   - a joinery blog fits no routine. In Waiting, **Make a routine for things like this** starts the conversation from that item.
9. **Activity:** the log, with *Undo* on what was just filed. Tap a routine's name to open it in Loci.
10. **Builder** adds a line to each opened routine and draft saying what runs on plain rules and what needs Loci to read the item. **Today** shows one card for what your routines did.
11. **On a tablet or phone**, the cards fill the page and Loci is a sheet from the foot, as the app's drawer. Tapping a card opens it; the chevron folds it away.

## Real or simulated

- No model runs. A keyword reader stands in for Loci's understanding (§5 of the UX spec), so common phrasings work; the chips cover the rest.
- *What it would have done* uses the prototype's real matcher on 20 example arrivals.
- Nothing is sent or received; *Send something…* simulates arrivals.
- Book titles are real; links, reels and articles are examples.
- Everything resets on reload.

## Build

```sh
node build.mjs   # writes dist/routines-prototype.html
```
