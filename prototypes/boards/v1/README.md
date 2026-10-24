> **Superseded.** This first version has its own look. The current prototype, [`../`](../README.md) (Commonplace Boards), builds Boards inside the approved Commonplace Photos design.

# Boards

**A board is a Commonplace item you think on.** It's an infinite canvas that lives at a place on the Loci map (an area, a topic or a sub-topic). You place things on it, draw arrows between them, say why, and leave questions. Then you can turn that thinking into a Lumen or a course.

**Status:** an idea for the owner to react to. Claude, 24 October 2026. Nothing here is approved. The prototype is a design reference, not code for the app.

The sample learner is the architect from [`../settings-memory`](../settings-memory) (a prayer hall for about 600 people in Dubai). Their board is *Cooling the prayer-hall courtyard*, in Culture & Context › Climate-responsive design. Every entry is an example. The pictures are the generated ones from [`../commonplace-photos`](../commonplace-photos).

Open `dist/boards-prototype.html`. It is published as the claude.ai artifact "Studiolo Boards".

## The idea in five rules

1. **Placed, never copied.** Everything on a board is the item itself: a photo, note, quote, link, video, book, Lumen, course, Loci topic or another board. Change a note on the board and it changes in Commonplace and on every other board. A card shows when it's on more than one board.
2. **What you write is saved to Commonplace.** A note or a question written on a board is a Commonplace note or question, tagged with the board's topic. A pasted link becomes a Source.
3. **Only a few things belong to the board alone.** These are arrows (a word plus an optional one-line *why*), frames, the goal, and Loci's cards.
4. **Things unpack.** A course opens into its parts, a Lumen into its slides, and a lecture into its saved moments. Drag one out, connect it, and it stays linked to where it came from.
5. **The board drives the app** in four ways:
   - **Make a Lumen.** The Lumen follows your arrows. Frames become sections, questions become the check at the end, and the goal becomes the brief. Lumens and courses on the board are treated as *builds on*, so they aren't repeated. The new Lumen lands on the board, linked to what it was made from.
   - **Make a course.** You get one part per frame.
   - **Loci.** An arrow that joins two topics the map doesn't link becomes a suggested link. The goal is what Loci reads as *why you're learning* the topic (this matches the learner-memory proposal). Open questions on boards show on the topic.
   - **Recall.** Covers your own words (notes, the goal, quotes, arrow words and whys). Anything you mark *Not yet* goes to *To revisit* in Loci.

## Why it helps learning

| Thinking move | On a board |
|---|---|
| **Elaboration** (saying how things relate) | Every arrow asks for a word and a *why*. The why is what a Lumen quotes back to you. |
| **Generation** (trying before being told) | **Ask Loci** asks you to write the connection first, then shows its own. Its version is never added to the board silently. |
| **Organisation** | Frames, and position: what's near what. |
| **Dual coding** (pictures plus words) | Your photo and your sentence sit side by side, and a Lumen keeps them together on one slide. |
| **Questions drive curiosity** | **?** cards. Each one becomes a check in the Lumen, then shows as answered on the board. |
| **Retrieval practice** | **Recall** mode. |
| **A goal** | The pinned goal card, the brief for anything made from the board. |

## Try it

1. **Connect.** Hover a card and drag its edge dot ● onto another card, or use the arrow tool (A). Pick a word and say why. Dropping the dot on empty canvas makes a new note that's already connected.
2. **Place.** Press **+**. The Commonplace, Learn and Loci tabs open on things *near* this topic, or switch to Everything. Drag an item in or tap it. You can also paste a link.
3. **Unpack** the *Climate and Architecture* course, a Lumen's slides, or a lecture's moments. *Fold* takes them back, except the ones you moved or connected.
4. **Same item.** Double-click a note, change it, then open **Commonplace**: it's at the top, marked *just changed on a board*.
5. **Ask Loci.** Select a few cards (Shift-click, or Shift-drag a box) and choose *What connects these?*. You write first, then *Compare*. Keep yours, Loci's, or both, or place the topic it names.
6. **Recall.** Say each covered card or arrow aloud, tap it to check, then mark *Got it* or *Not yet*.
7. **Make a Lumen** from the whole board, a selection or one frame. *Short* keeps only the cards you connected. Watch it being made, then **Play**. The checks at the end hold the two questions, each with an answer.
8. **Loci.** Open the map: the board sits on its topic, the goal shows as *why you're learning it*, and your *Courtyard house → Wind towers* arrow suggests linking Courtyards and Wind towers.
9. **Board in a board.** *Daylight on the qibla wall* is placed on the courtyard board. Open it, and its breadcrumb leads back.

Keys: V select · H pan · N note · Q question · A arrow · F frame · + add · 0 fit · = and − zoom · Space-drag to pan · Ctrl+scroll to zoom · Delete removes from the board (the item stays in Commonplace) · Ctrl+Z undo.

## Questions for the owner

- **Is a board one Commonplace item, or its own destination?** The prototype makes it an item that lives at a place on Loci, with no new rail entry.
- **How much can Loci do on a board?** Here it only answers when asked, and always after you've tried. It could also offer to tidy a board into frames, or point out an arrow with no why.
- **Arrow words.** The prototype offers a fixed list (leads to, explains, example of, contrasts with, causes, raises, part of) plus free text in the why. A fixed list lets a Lumen and the map read the arrows. Free words feel freer.
- **Sharing.** Boards are personal here. A shared studio board, with each person's items still their own, is a bigger design.

## For a later build (not decided)

- **Data.** Probably a `board` content item, plus `board_placements` (item ref, x, y, w, parent placement for unpacked cards) and `board_arrows` (from, to, verb, why). Frames would be placements with a size. A placement points at the item, never at a copy.
- **Make a Lumen.** It would send the ordered outline, the arrows with their whys, the questions and the goal as typed input to today's generation path. The model would still write typed slides, never free HTML.
- **Map links** from arrows would be suggestions only, never written without the learner's tap.

## Not in it

- No model is called. Ask Loci's replies, the Lumen's narration and the answers are scripted from the board's real contents.
- Your changes persist in this browser only. **Reset** in the prototype bar restores the starting board.
- No collaboration, no comments, and no image upload onto the board (use Commonplace's capture).
- Loci and Commonplace are reduced to what Boards touches.

## Build

```sh
node build.mjs   # writes dist/boards-prototype.html (inlines 15 pictures from ../../commonplace-photos/img)
```
