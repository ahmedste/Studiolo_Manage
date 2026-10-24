# Commonplace Boards

Boards, built **inside** the approved Commonplace Photos prototype. It is a copy of [`../commonplace-photos`](../commonplace-photos) (version 4, the header the owner approved), with Boards plugged into it. The header, wall, viewer, shelves, selection bar and Loci inspector are that prototype's own, unchanged. Design: [`docs/superpowers/specs/2026-10-24-boards-design.md`](../../docs/superpowers/specs/2026-10-24-boards-design.md). It follows the photo roadmap's seven phases.

Open `index.html`. It is published as the claude.ai artifact **Commonplace Boards** (the same link as the first Boards prototype).

## What to try

| Where | What it shows |
|---|---|
| **The board** (it opens here) | *Cooling the prayer-hall courtyard*, at Architecture › Climate-responsive design. The cards are the wall's own: photos whole on their palette colour, with ★ on hover; notes, quotes, links and lectures. Frames read like the wall's group headers. Arrows carry a word and a *why* |
| **Connect** | Hover a card and drag its edge dot onto another card. Pick a word and write why. Dropping the dot on empty canvas makes a new, already-connected note |
| **Place** | **+** opens a small Commonplace: the same area scope, search and type tabs, plus Lumens and Loci, with the photo wall in your own layout. Drag a card in, or tap it. Paste a link to save it as a Source |
| **Viewer** | Double-click a photo (or select it and press Space): the same viewer. ← → follows the board's arrows. The panel adds **On boards** and **On this board**. On *Courtyard toward the prayer hall*, press **Place detail 2 on the board** |
| **Same entry** | Double-click a note, change it, press Enter. In Commonplace › Notes it has changed too |
| **Unpack** | The *Climate and Architecture* course unpacks into parts, the Lumen into slides, the lecture into moments |
| **Ask Loci** | Select a few cards (Shift-click, or Shift-drag a box). **Ask Loci**: you write first, then **Compare** |
| **Make a Lumen** | The goal is the brief and the board's pictures are the **picture shelf** (as in Lumen pictures), with *When nothing of yours fits*. Your arrows set the order and your questions become the check. **Play** it |
| **Recall** | Your own words are covered. Say each one, tap to check, then mark *Got it* or *Not yet* |
| **Commonplace** | The breadcrumb → **Boards** is a type with its slim bar (Questions ▾, + New board). **Shelves** has a *Pinned up* shelf |
| **Loci › Palace** | The place pill under the board's title opens Loci on the **app's own Palace** (bundled from `studiolo` main, see `loci/README.md`), with the board open. The board is a Commonplace item: a square in Architecture's Commonplace stack. Opened, its slot card shows the goal, where it lives, the topics it reaches, its cards, its arrows as sentences and the Lumens made from it. Its cards sit beside their own topics, and its arrows are drawn between them as related links carrying the why |
| **Loci › Map** | The **app's own Map** at Climate-responsive design: the board heads the Commonplace lane with its cover and *BOARD*. After **Make a Lumen**, the Lumen shows in the Lumens lane as *From board*, and the board's card gets the ▶ badge. Hover it for the app's peek, then **Play** |
| **Loci › inspector** | Boards, *Loci reads* (the goal), suggested links from your arrows (**Link them** adds a related link to the Palace and Map), and open questions with *Explain…* |
| **Guide** | *Prototype guide* (bottom right) adds five Boards tries above the photo ones |

**What the arrows mean, and what a board is for:** the spec's §0 and §2.1. In short, an arrow is a claim you make about two things on this board (a word and a why), and a board is for understanding toward the goal you wrote first.

Keys on a board: V H N Q A F (tools) · + (add) · 0 (fit) · = − (zoom) · Space (open the selected card, or hold to pan) · Delete (remove from the board) · Ctrl/⌘ Z (undo).

## Files

- `index.src.html`: the Commonplace Photos page with Boards added. Hooks inside the photos code are marked `BOARDS`. The Boards styles are the `/* ---------- boards ---------- */` section, and the Boards script is the second `<script>`.
- `build.mjs`: inlines the pictures' sizes and palettes (`../commonplace-photos/gen/meta.json`) and writes `index.html`, as the photos prototype does.
- `img`: a link to `../commonplace-photos/img`, so the 32 pictures exist once in the repo.
- `loci/`: the app's Palace and Map, bundled from `studiolo` main @ `6f8d396`, and how to rebuild them. `build.mjs` inlines them at `<!--LOCI-BUNDLES-->`. The Loci script that drives them is the last `<script>` in `index.src.html`.
- `bimg/`: the two boards' covers for the Map's lane cards.
- `v1/`: the first Boards prototype (its own look, before it was matched to Commonplace). Kept for reference; this one replaces it.

## Real or simulated

- No model runs. Ask Loci's replies, the Lumen's slides and narration, and the two answers are written from the board's real contents.
- The Palace and the Map are the app's real code, given the prototype's sample data. The List and Overview tabs are not built.
- Changes last until you reload, as in Commonplace Photos.
- The pictures are the generated ones from Commonplace Photos, not photographs.

## Build

```sh
node build.mjs   # index.html from index.src.html
```
