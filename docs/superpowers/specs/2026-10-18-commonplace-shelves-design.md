# Commonplace: the Library as a Wall and as Shelves

Status: second draft for the owner · 18 Oct 2026 · nothing built.

Mockup: the "Studiolo Commonplace" design canvas, private until shared: https://claude.ai/artifact/EkCnrVDC7M1hR6CuftP5V8

- **Wall ⇄ Shelves** (interactive): today's Everything wall. Press Play, then **Shelves** and **Wall** in the toolbar to watch it re-shelve. Tweaks: start view, slow motion, theme.
- **Re-shelving**: the motion, frame by frame, with its timing.
- **Shelves · desktop**: the full Shelves page. The **state** tweak shows Browse, Search ("Zumthor") and Threads (Peter Zumthor selected).
- **Shelves · phone**.

Working prototype (opens in a browser): https://claude.ai/artifact/N5KZmkmcv8fykfiRkyJDRk, source in [`2026-10-18-commonplace-prototype/index.html`](2026-10-18-commonplace-prototype/index.html). It has the Wall and Shelves views with the re-shelving switch, search that lights up in place, threads from an item's quick view, the rotating front (with "Pretend it's tomorrow"), since-marks, Shelve…, + on each shelf, capture, and a phone layout.

Sources: `studiolo` @ `7150fad` (read-only): `project-docs/product/library.md` (types, collections, areas), `project-docs/design/interface.md` (tokens, wall, motion), `src/styles/tokens.css`, `src/styles/library.css` (`.mason`, frameless cards), `src/components/library/wall-motion.ts` and `src/features/ui/flip.ts` (the wall's existing FLIP glide), and the wall as it is now in `docs/superpowers/evidence/library-areas/closed-light-1280.png`. Craft: *Library - polishment Phase*.

---

## 1. Is it actually useful?

Only if it does a job the wall can't. A grid of spines that shows the same thing as the wall in a prettier way would be a toy. Here is the case that there is a real job.

### The wall is a feed

The Everything wall is a masonry grid, newest first, 260 px columns, cards 130–430 px tall. At 1280 × 900 it shows about ten cards above the fold (see the areas evidence screenshot). That is great for what just came in. But it means:

- With 100 items, about 90% are below the fold. With 500, about 98%.
- Ordering by date guarantees that the oldest things are the most buried. The longer someone uses Studiolo, the more of their library goes out of sight.
- Search and chips only help when you remember something is there. **You can't search for what you've forgotten you have.**

This is an old finding about desks. Malone (1983, *How do people organize their desks?*) saw that people keep **piles** in view because piles *remind* them, while **files** go out of sight and get forgotten. Barreau and Nardi (1995, *Finding and reminding*) found the same thing in computer folders: people find things by *where they put them* and keep reminders in view. The wall is the pile: always the latest. Nothing in Studiolo today is a file you can still see.

### The job Shelves does

**Shelves give every collection a fixed place on screen, whatever its age.** A book saved two years ago stands on its shelf just as visibly as one saved yesterday. That gives four things the wall can't:

1. **See what you have, at a glance.** Nine shelves, each with its size and what it holds. You see the shape of your knowledge: Site photos is huge, Specifications is thin, three books were never opened.
2. **Rediscover what's buried.** Each shelf's visible stretch is chosen on purpose, not only newest first (see §4.1). Old things come back to the front.
3. **Find things by place.** A shelf stays where it is (its collection's position), and so do the items on it. After a few visits people remember "the Kahn quote is on the quotes shelf, near the start". The wall reflows on every capture, so nothing on it has a place. Spatial layouts help people find things again (Robertson et al., *Data Mountain*, 1998).
4. **See across collections.** Selecting an item lights up what it connects to on other shelves (§4.4). Only Studiolo can do this, because only Studiolo has the typed links and the topic graph underneath.

And one feeling: **pride of a personal library.** People like to see their collection as a whole, and Goodreads shelves and Letterboxd lists show it. A commonplace book (from *locus communis*, a "common place" or heading) was a notebook where readers copied passages under headings so they could find them again; Erasmus taught it and Locke published a method for indexing one. Shelves are those headings made visible.

### When to use which view

| | Wall | Shelves |
|---|---|---|
| Question it answers | What came in lately? | What do I have, and what have I forgotten? |
| Order | Newest first, reflows | Your collection order; stable |
| Best for | Capture, triage, visual browsing | Re-finding, rediscovery, seeing the whole, tidying |
| Capture | The capture box, first card | **+** at the end of each shelf (files straight into that collection) |
| Unit | One item | One collection |
| Grows badly when | The library gets big: the past sinks | There are many tiny collections: §5 |

The two views are the same records, the same quick view, the same Select, area and search. Only the arrangement changes.

---

## 2. Two views, one switch

- **Where:** a **Wall | Shelves** switch in the Everything toolbar, between the count and **Select**. It is a view of Everything, not a new tab. (Draft 1 proposed a separate Commonplace tab; the switch is simpler and keeps one place for "everything".)
- **Remembered** like the area: in the address (`?view=shelves`) and in this browser, so the Library opens on the last view.
- **What changes in the toolbar:** the count line reads "65 entries · newest first" on the wall and "9 shelves · in your order" on shelves. The chip row becomes the bay links (Sources, Notes, Photos, Objects, Not on a shelf) plus **Each shelf shows: A rotating mix ▾**. The capture card leaves the grid. Capture stays on `C`, the rail, and each shelf's **+**.
- **Phone:** the same switch as two icon buttons in the header. Shelves show one bay at a time, and each shelf scrolls sideways.

### Moving along a shelf, and opening one

- **Each shelf is a carousel.** It holds the whole collection, in shelf order (the rotating front first, §4.1). When it is wider than the screen it scrolls sideways: round **‹ ›** buttons at its ends, edges that fade where more is hidden, snap to items, trackpad and touch swipe, and a quiet position line under the board ("5–8 of 14"). A shelf that fits shows no buttons. The carousel remembers where it was until its order changes (a new sort, a new day, a search).
- **Open shelf** stacks the same collection on more boards of the same bookcase, in place: up to three rows (two for People), each with its own board. The items that were out of sight slide in from the carousel's edge. The footer reads "Showing 31 of 48"; when more remain, the last row ends with **+ N more. See all on the wall** and the footer has **See all on the wall →**, which opens the Wall filtered to that collection. **Close shelf** folds it back into one row. Several shelves can be open at once.
- Rows fit what is on them: books stand as spines (about 15–20 per row), videos and buildings 4–5, cards 5–6, photos by their proportions.

## 3. The switch animation: re-shelving

The cards don't fade out and get replaced. **Each card flies to its own shelf and turns into its shelf shape on the way.** That one motion explains the whole idea: the wall and the shelves are the same things, just arranged differently.

Wall → Shelves (about 1 s; position eases with `--ease-standard`, `cubic-bezier(0.2, 0.8, 0.2, 1)`):

| Time | What moves |
|---|---|
| 0–150 ms | The capture box and chip row step back (fade, 6 px up). |
| 0–865 ms | Cards travel from their wall slot to their shelf slot, 560 ms each, staggered 55 ms per shelf and 35 ms per item, top shelf first. |
| 260–825 ms | Each card's wall face cross-fades into its shelf face: a cover becomes a spine, a picture becomes a print, a note becomes an index card. |
| 260–860 ms | Shelf boards draw from left to right, one shelf after another; labels slide in from 10 px left. |
| 420–1,040 ms | **The buried rest of each shelf rises in**: the items that were below the fold on the wall, then the "+ N more" stub. |

Shelves → Wall reverses it: boards and labels go first, cards fly back newest first (22 ms apart), then the capture box and chips return.

Rules:

- **Nothing vanishes and nothing appears from nowhere.** Items off screen in the old view enter from the edge they were under: buried items rise from below.
- **Only what is on screen travels.** Items outside the viewport in both views just appear in place, so a 2,000-item library animates about 30 elements, not 2,000.
- **Any click, key or scroll during the motion jumps to the end.** It never blocks input.
- **Scroll:** going to Shelves starts at the top. Coming back to the Wall restores the wall's last scroll.
- **Reduced motion:** a single 160 ms cross-fade, and nothing travels (the app's tokens already set every duration to 1 ms under `prefers-reduced-motion`).

**Building it:** the wall already glides cards with FLIP (`wall-motion.ts` measures with `measureCards` and plays with `playFlip` from `src/features/ui/flip.ts`, keyed by item ID). Re-shelving is the same idea across two layouts: measure the visible cards, switch view, measure again by ID, play. The theme switch already uses the View Transitions API (`src/features/appearance/apply-display.ts`). It would also work here (`view-transition-name` per visible item), but FLIP reuses the wall's own code and copes with the face swap. Recommendation: FLIP.

---

## 4. Making Shelves used and loved

Ranked by how much each feature helps the core job of resurfacing what's buried, against its cost.

### 4.1 A rotating front (MVP)

A shelf shows 8–12 items. Which ones appear is the whole game. By default (**Each shelf shows: A rotating mix**):

1. what is **on the desk** from this shelf (reading or watching now),
2. the **2 newest**,
3. **2 rediscoveries**: items saved more than 30 days ago and opened least recently,
4. then your order.

The mix is reshuffled once a day, not on every visit, so shelves stay stable within a day (you can find something again in the same place) but bring different buried items forward over a week. The menu also offers **Newest**, **Least recently opened** and **A–Z**. This needs one new field: when an item was last opened.

### 4.2 Gentle "since" marks (MVP)

An item not opened for six months or more carries a quiet tag above it: **Since Feb**, **Never opened**. The shelf's line says "14 books · 3 not opened this year". No red badges, streaks or guilt: it's information, like dust on a real shelf, and it's what makes old items catch the eye.

### 4.3 Search lights up in place (MVP)

On Shelves, typing a search doesn't throw away the layout. Matching items stay lit where they live, the rest fade to about 20%, and shelves with no match fade back (Search state in the mockup: "6 matches on 5 shelves"). You learn *where* things are, not just *that* they exist. The wall already dims cards this way (`.mason[data-dimmed]`), so it is a known pattern.

### 4.4 Threads across shelves (after MVP; Studiolo's own)

Selecting an item (or a long press on touch) lights up everything it connects to, on every shelf: items it links to (made by, cites, mentions, about…) and items sharing its topics ("Peter Zumthor · 5 connected items on 4 shelves"). It turns the Library from storage into a map, and it uses data Studiolo already has. This is the feature most likely to make people say "oh".

### 4.5 Add to this shelf (MVP)

A **+** at the end of each shelf opens capture with that collection already chosen. Saving a book while looking at your book shelf is the most natural filing there is, and it makes filing nearly automatic.

### 4.6 Not on a shelf (MVP)

Items with no collection sit on a dashed table at the end, with **Shelve…** (Move to…). It is the Library's inbox. Seeing that number go down feels good.

### 4.7 Areas as rooms (later)

The area picker becomes walking into another room: Architecture, Parenting, Faith (the owner's own example of areas). Switching area slides the shelves sideways. Each room holds only that area's items, so its shelves are short and personal.

### 4.8 One from the shelves (later)

Today could show one buried item a day, "From your shelves: *S,M,L,XL*, never opened". It's the smallest way to bring the rediscovery job outside the Library. mymind (Serendipity) and Readwise (Daily Review) both build habits on resurfacing.

### On the desk, defined

The desk shows what is in progress, from states Studiolo already records: **Reading** (a Source's reading state, To read / Reading / Read) and **Watching** (a video's watch status, To watch / Watching / Watched, Phase 2G G3). An item leaves the desk when it becomes Read or Watched, and stays on its shelf throughout. **Writing** is not a state yet: the prototype shows a Long note there. Either define it (a Long note edited in the last 7 days) or leave writing off the desk; this is an owner decision.

### 4.9 AI on a shelf (AI phase)

What this shelf says. Gaps ("9 of these 14 books have no notes"). **Explain this shelf** or make a course from it. The "I want to learn…" notes in the Craft page could form a shelf of their own that the copilot reads.

### Works in every field

Bays are the four types and shelves are the user's own collections, so nothing on a shelf is about architecture. Each item's shelf shape comes from its type and, for Objects, from the collection's layout (Portrait, Picture or Text, which already exist):

| Field | Shelves they'd have |
|---|---|
| Architect | Books, Lectures, Specifications (PDF), Site photos, Buildings (Things, Picture), Architects (People) |
| Lawyer | Cases (Things, Text: Court, Year, Ruling, Parties), Statutes (PDF), Commentary (Books), Case notes |
| Doctor | Conditions (Things, Text: Presentation, Signs, Management), Guidelines (PDF), Papers (Links), Teaching photos |
| Musician | Pieces (Things: Maker, Year, Form), Recordings (Video), Scores (PDF), Practice notes |
| Researcher | Experiments (Things: Question, Method, Result), Papers (PDF), Talks (Video), Lab notes |

The field presets in `library.md` (Buildings, Cases, Conditions, Companies, Experiments, Pieces) are exactly these shelves. Shelf shapes per type: book → spine (one cover face-out); PDF → binder with page count; video → thumbnail with resume bar; link → a clipping with its domain; note → index card; quote → card on quote paper; photo → print; Person → portrait; Thing → picture card, or a labelled text block in the Text layout.

---

## 5. What would make it fail, and the answer

| Risk | Answer |
|---|---|
| Kitsch: wood grain, a "fake library" | Boards are a 2 px ink rule over a 9 px board strip; tokens only; the shapes carry it. Apple dropped its wooden iBooks shelves in 2013 for a reason. |
| Spines are hard to read | Vertical serif, full title as the accessible name and on hover/focus; the face-out book and the shelf label carry the meaning. Phone shelves are wider and scroll. |
| Many small collections (30 shelves of 2) | Shelves with fewer than 3 items show as one compact "short shelf" line; bays collapse; the bay links jump. |
| Huge collections (400 photos) | A shelf only ever shows ~12 plus "+ N more"; Open shelf is the full wall of that collection. Render shelves lazily as they scroll in. |
| People never switch | Remember the view. Show a one-time hint once someone has 40 or more items in 3 or more collections: "See your Library as shelves". Decide the default after testing. |
| Two views to maintain | One data source, one card model, one quick view; only the layout and the shelf faces are new. |

## 6. How we'll know

Analytics already runs (PostHog, behind the analytics notice). Measure:

- **Rediscovery rate:** of the items opened, the share that were saved more than 30 days ago and not opened in the last 30, on Shelves against the Wall. This is the number that says the feature does its job.
- **Return:** of weekly active users, the share who open Shelves at least once a week from their third week on, and the share who keep it as their default.
- **Breadth:** distinct collections opened per week.
- **Tidiness:** the "Not on a shelf" count over time; Shelve… and **+** use.
- **Owner test:** "find something you saved a month ago, without searching", timed on each view.

## 7. First version

1. The **Wall | Shelves** switch, remembered; re-shelving motion; reduced-motion cross-fade.
2. Bays, shelves (one per collection, in collection order), shelf shapes per type, "+ N more", Open shelf.
3. The rotating front with the sort menu (needs "last opened" on items), and since-marks.
4. Search lights up in place.
5. **+** on each shelf, the Not-on-a-shelf table with Shelve…, and the desk.

Later: threads (§4.4), rooms (§4.7), One from the shelves on Today (§4.8), AI (§4.9), dragging between shelves.

## 8. Decisions for the owner

1. **Switch or tab?** Recommended: the Wall | Shelves switch inside Everything (this draft), not a separate tab.
2. **Names.** "Shelves" for the view, and "Commonplace" for the idea and in marketing ("your commonplace")? Or call the view Commonplace?
3. **Default view.** Wall for everyone, or Shelves once a library passes about 100 items?
4. **The rotating front.** Is a daily mix right, or should the front stay strictly your order unless you choose otherwise?
5. **Since-marks.** Helpful nudge or nagging? Six months as the threshold?
6. **The desk.** On Shelves only, or also on the wall?
7. **Threads** (§4.4): worth pulling into the first version? It is the most Studiolo-specific feature, and the data already exists.
8. **Writing on the desk.** Add Writing (a Long note edited in the last 7 days), or keep the desk to Reading and Watching?
