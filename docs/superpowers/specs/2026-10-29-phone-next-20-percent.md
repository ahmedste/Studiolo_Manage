# Phone: the next 20 percent

**Date:** 29 October 2026
**Audited build:** `studiolo` main @ `e5bf9303`, `/dev/specimens`, iPhone 14 viewport (390 × 844 @2x), light and dark
**Follows:** `2026-10-25-phone-control-bar-and-loci-design.md` (the spec) and `../plans/2026-10-25-phone-build-plan.md` (P0–P8)
**Screenshots:** `assets/2026-10-29-phone-audit/`

## Verdict

The phone shell works and it feels right where it was built from scratch:

- **The Palace.** It opens to the whole map with one quiet card.
- **The card.** It stays the height you left it.
- **The bar.** It turns typed text into Loci's suggestions (`Passive design ›`, `Ask Loci "pass"`).
- **The drawer.** It is clean, with the four destinations and Appearance.

The rest of the app reads as **the desktop app shrunk onto the phone**. Every page outside Loci still has:

- the desktop header (breadcrumb, then underlined tabs);
- its own text fields under the bar;
- the desktop Details panel inside the card's full height.

Apple's phone apps feel calm because a few rules hold everywhere: one title, one primary field, one way to go deeper, one kind of motion. The six actions below apply those rules across the app. Each one is a system change, so it fixes many screens at once. That is the 20 percent.

| # | Action | What it fixes | Size |
|---|---|---|---|
| 1 | One page frame: a large title that folds into the top bar | the desktop headers on Today, Learn, Commonplace and Course; 315–490 px of chrome before the first content | M |
| 2 | The bar is the only field | 6 duplicate fields; the bar's Return doing nothing in Commonplace; placeholders that ignore context | S–M |
| 3 | A phone-native card at every height | the desktop Details panel at full height, the duplicate title, native select, stale copy, zero counts, a truncated name | M |
| 4 | Rooms for Lumens, courses and items | the course page is a desktop page; nothing is immersive | L |
| 5 | One motion and touch system | CSS durations rather than springs; targets of 28–42 px | M |
| 6 | A phone-quality gate in CI, plus phone primitives | regressions; each new screen otherwise starts desktop-first | S |

Build order: **6 → 2 → 1 → 3 → 5 → 4.**

- The gate goes first so every later step is measured.
- 2 and 1 are mostly deletions and one shared component.
- 4 is the largest and benefits from everything before it.

---

## 1 · One page frame: a large title that folds into the top bar

**Evidence**

- **Today** (`14-today`). The top bar is empty apart from ☰. "Today" sits in the page as a desktop title.
- **Commonplace** (`16-cp-wall`). The page shows, in order:
  - the ☰ bar;
  - the crumb `Commonplace / All areas ▾ / 24 entries, 12 collections`;
  - underlined tabs;
  - `24 entries · newest first` with Select;
  - the type chips;
  - a capture field.

  The first entry starts **315 px** below the top bar.
- **Learn** (`21-learn`). The page shows the crumb `Learn / Ask, pick up, and what's next`, then tabs, then "What do you want to understand?" and a format picker. The first content starts **372 px** down.
- **To read** (`19-cp-toread`). The first source starts about **490 px** down.
- **Course** (`23-course`). The crumb `Learn / On the Origin of Species / Part 2 · Struggle…` wraps onto two lines above the player.

**The Apple rule.** A navigation bar holds the title. A *large title* opens the page and folds into the bar as you scroll, as in Mail, Notes and Music. Scope (account, mailbox, library) is a menu on the title or the bar, never a breadcrumb. A segmented control or a pinned tab strip switches views. Counts sit in a quiet subtitle.

**The change.** Add one shared component, `PhonePage`, used by Today, Learn, Commonplace, Course and Settings under `COMPACT`:

```
┌ ☰        Commonplace ▾          ⋯ ┐   ← top bar: inline title fades in once the large title scrolls under it
│ Commonplace ▾                      │   ← large title (34/41 Newsreader); ▾ opens the scope menu (All areas / an area)
│ 24 entries · 12 collections        │   ← subtitle, ink-2
│ [ Everything | Collections | To read | Templates ]  ← segmented, pins under the top bar
│ (All) (People) (Things) (Buildings) (More ▾)        ← optional filter row, folds away on scroll (the CP header fold)
└──── content ────────────────────────┘
```

- **Desktop chrome goes.** No breadcrumb, no underlined tabs and no page-level "Select" button under `COMPACT`. Select moves into ⋯ and into a long press on an entry.
- **Scope belongs to the title.** Commonplace's area is the title menu. On a course, the title is the course and ‹ goes back to Learn.
- **Pinned segments.** The segmented control is pinned under the top bar. The filter row folds on scroll and comes back on a small upward scroll. Use the prototype's 450 ms cooldown so the fold does not flicker.
- **`top-bar.tsx`.** It already shows the title when scrolled. `PhonePage` gives it the title and the ⋯ menu for every destination, so the top bar is never empty.

**Files.** Add `src/components/phone/phone-page.tsx`, used in:

- `today-page.tsx`;
- `learn-home.tsx`;
- `library-wall.tsx`, `collections-page.tsx`, `reading-queue.tsx`;
- the course page;
- `top-bar.tsx`.

`phone-shell-context.tsx` carries title, subtitle, scope menu and ⋯ items.

**Accept when**

- The first content sits **≤ 170 px** below the top bar's bottom edge on Today, Learn Home, Commonplace Everything, Collections and To read. The gate measures this (§6).
- No `nav[aria-label*=readcrumb]` or crumb element renders under `COMPACT`.
- Scrolling 60 px shows the inline title in the top bar on every destination.
- The large title, segments and inline title behave the same in light and dark.

---

## 2 · The bar is the only field

**Evidence.** These fields sit on screen alongside the bar:

| Screen | Duplicate field | Source |
|---|---|---|
| Commonplace Everything | "Capture a thought, quote or link…" with ⊕ | `library/capture-body.tsx:20` |
| Collections | "Search your collections…" | `library/collections-page.tsx:162` |
| To read | "Search your sources…" | `library/reading-queue.tsx:157` |
| Loci List | "Find a topic or area in the tree…" | `graph/topic-tree.tsx:194` |
| Learn Home | Watch / Read / Listen picker and suggestion chips, which repeat the Make sheet | `explainers/learn-home.tsx` |
| Today | "Ask Loci ↗" button | `today/continue-card.tsx:103,120` |

Also:

- In Commonplace the bar is the search, but `use-phone-bar-search.ts:22` has `onSubmit: () => {}`, so **Return does nothing**.
- On the course page the bar still says "What do you want to understand?" (`23-course`). It should talk about this part.

**The Apple rule.** A screen has one primary field. Search lives in one place, the search field, and the keyboard's Return key always does the obvious thing.

**The change**

- **Remove the duplicates under `COMPACT`.** For each, register the matching bar context instead. The context machinery already exists in `bar-context.tsx`.
  - **Collections:** placeholder "Search collections", live filter.
  - **To read:** "Search To read", live filter.
  - **List:** the bar filters the tree as you type. Return opens the first match.
  - **Commonplace Everything:**
    - typing searches;
    - Return on a pasted link or a sentence of five words or more offers **Save to Commonplace** as the first suggestion row, which replaces the capture box;
    - ＋ still opens the full capture.
  - **Learn Home:**
    - the format picker and chips leave the page and live only in the bar's ＋ / Make sheet;
    - Home opens with "Next for your goals".
  - **Today:** "Ask Loci ↗" goes. The bar already says "Ask about your day…".
- **Return always acts.**
  - In search contexts it opens the first result. With no results it offers "Ask Loci" with the query.
  - In ask contexts it asks.
  - Never a no-op.
- **Placeholders come from the room:**
  - a course part: "Ask about Part 2…";
  - a Lumen: "Ask about this Lumen…";
  - an item: "Ask about Great Mosque of Kairouan…";
  - Settings: "Search settings".

**Accept when**

- The gate finds **at most one** visible text field (`input:not([type=hidden]), textarea, [contenteditable]`) outside `.phone-bar` on every specimen. The only exceptions are an open sheet's own fields.
- Return in each bar context changes the screen.
- Every placeholder names the current page or object.

---

## 3 · A phone-native card at every height

**Evidence**

- `05-palace-topic-full` and `08-list`: at full height the card renders the **desktop Details panel** under the phone card's own header. You see:
  - **the title twice** ("Daylight & shading" then DETAILS "Daylight & shading");
  - a **native `<select>`** for status;
  - a **disabled** "Plan a course on this topic" with **"Course planning arrives with Learning."** Learning has shipped, so this copy is stale. It lives in `graph/topic-panel.tsx:83`, `palace-workspace.tsx:482` and `graph-workspace.tsx:59`.
  - In the List, an empty progress bar and "0 of 5 marked Learned, 0 Learning, 5 Not started".
- **Zero counts in the summary:** "0 in Commonplace · 0 Lumens", "No sub-topics yet · … · 0 Lumens".
- **The peek truncates the name** to fit the parent: "Daylight & shad…  Environment & Services" (`A.png`, third frame).
- **The List sits under a full card** (`08-list`). With the card at full height, the tree is unreachable.

**The Apple rule.**

- A sheet's content is designed for the sheet: grouped rows, a segmented control or menu for a choice, no duplicate headers.
- Don't show controls that don't work.
- Hide empty information.
- The object's name is the most important text on the card.

**The change.** At full height the card renders its own phone content and stops using the desktop `full` ReactNode:

1. **Status** as a three-part segmented control: Not started · Learning · Learned. It sits directly under the title, with no "My status" label.
2. **Sub-topics.** Rows with a status dot and ›, plus a "＋ Sub-topic" row at the end. Areas show topics the same way.
3. **Lumens.** Poster rows with ▶ and their length. Tapping one opens the Lumen room (§4).
4. **From Commonplace.** A horizontal strip of picture and quote thumbnails. "See all" opens Commonplace filtered to this topic.
5. **Related.** Rows, with Connect in ⋯.
6. **Plan a course.** A live action that starts the course flow, or no action at all. Delete the "arrives with Learning" copy on all three surfaces.

Rules:

- **Zero counts never render.** "0 Lumens" becomes nothing. "No sub-topics yet" becomes the "＋ Sub-topic" row.
- **The peek gives the name its full width.** The parent shows only if there is room after the name. When there isn't, the parent moves to the medium height's eyebrow, as it does today.
- **In the List, full height means "large".** The card stops 120 px from the top so the tree stays visible, and dragging the tree down shrinks the card.

**Files**

- `phone/place-card.tsx`: a new `PlaceCardFull` that stops rendering the `full` prop;
- `features/phone/place-card.ts` (`cardText`): drop zero counts;
- `graph/topic-panel.tsx`, `palace-workspace.tsx`, `graph-workspace.tsx`: the stale copy;
- `graph/use-map-phone.tsx`: the List's cap.

**Accept when**

- At full height the card shows no `select`, no `[disabled]` button and no repeated title.
- No text matching `/\b0 (Lumens?|in Commonplace|sub-topics?)\b/` appears on any card.
- The peek's name is never truncated for any name that fits in 300 px.
- In the List, at least 120 px of tree stays visible with the card at full height.

---

## 4 · Rooms for Lumens, courses and items

**Evidence**

- **Course** (`23-course`): the desktop course page in a single column, with:
  - the crumb;
  - a player with desktop controls (1×, CC, ⛶ as 40 px boxes);
  - a title block;
  - "Ask ▾";
  - a bordered "‹ Parts 2 of 6 ›" pager;
  - a topic chip row;
  - Feedback and Report;
  - the underlined tabs Reading · This part · Transcript · Slides.

  This adds up to about 700 px before the reading starts.
- **Photo item** (`26-cp-photo`): already close to a room. It has "‹ Commonplace  Building ⋯", the picture first and good type. It is the model.
- **The Lumen room** (Watch / Listen / Read / Live / Walk / Drive), as specified in the prototype, is not built. `interface.md` lists it as a follow-up.

**The Apple rule.** Content gets the screen. In Music, TV and Podcasts the media leads, controls float over it and disappear, and you go deeper with a sheet, not a longer page. Playback continues as a mini player when you leave.

**The change.** Add a shared `PhoneRoom` with a back button, a short title and ⋯ in the bar.

- **The stage is pinned at the top.** It shows a video or slide, a Listen waveform with chapters, a Read page, or a photo.
- **Below the stage:**
  - one line of meta;
  - one segmented control: *Watch | Listen | Read* where the Lumen has them; *This part | Transcript | Slides* for a course part.
- **Parts.** A Parts sheet (the bar's ＋ / Parts chip) replaces the pager. Swiping the stage left or right moves between parts.
- **Secondary actions.** Feedback, Report and topic chips move into ⋯.
- **The bar follows the room.** For example: "Ask about Part 2…".
- **Leaving keeps playback.** Leaving a playing room docks the **mini player** above the bar (`mini-player.tsx` exists); tapping it re-opens the room at the same point.
- **Order of build:**
  1. course part;
  2. Lumen (Watch, Read; Listen when it ships);
  3. Commonplace item and PDF, by moving the photo viewer onto `PhoneRoom`.

**Accept when**

- On a course part the stage's top edge is ≤ 60 px below the safe area.
- The reading text starts ≤ 420 px from the top.
- No breadcrumb renders.
- Leaving while playing shows the mini player, and tapping it resumes within 1 s of the left position.

---

## 5 · One motion and touch system

**Evidence**

- **Motion.** Sizes and positions use CSS transitions with `--dur-move` and `--ease-entrance` (`styles/phone.css`). `place-card.tsx:175` takes the release velocity only to *choose* a height. The card then animates there at a fixed duration, so:
  - a fast flick and a slow drag land the same way;
  - there is no rubber band past the top or bottom height.
- **Targets under 44 pt:**

| Element | Size | `phone.css` |
|---|---|---|
| Bar ＋ and the field | 42 px | 411, 424 |
| Card ✕ at peek | 28 px | 183 |
| Thread ✕ | 28 px | 516 |
| Chips (sub-topic, filter) | 36 px tall | 485 |
| Commonplace area picker | 23 px tall | (library.css) |
| To read sub-tabs | 36 px | (library.css) |
| Inline links (All Lumens →, Connect) | 34 px | — |

**The Apple rule.**

- Interactive things move with springs that carry the finger's velocity.
- They rubber-band at the edges.
- They respect Reduce Motion.
- Hit targets are at least 44 × 44 pt, even when the visible shape is smaller.

**The change**

- **A small spring helper**, `src/components/phone/spring.ts`, about 60 lines:
  - It drives the card, the drawer and the Make and thread sheets.
  - It is critically damped with a short response (stiffness 380, damping 38, mass 1).
  - It takes over from the release velocity.
  - It rubber-bands past the end heights with `offset × 0.55 / (1 + offset / 300)`.
  - Under `prefers-reduced-motion` it snaps.
  - CSS transitions stay for colour and opacity.
- **Hit areas grow; shapes stay.**
  - The bar becomes 44 px.
  - Chips get an invisible ±4 px hit area, which takes them to 44.
  - ✕ buttons get a 44 px hit box around the 28 px circle (`::before` inset −8 px).
  - The area picker and To read sub-tabs become 44 px rows or segments, which §1 already gives them.
- **Shared transitions.** Use the View Transitions API (`document.startViewTransition`) for:
  - a Lumen poster into its room;
  - a Commonplace picture into the viewer;
  - a card chip into the next place.

  Where the browser lacks it, fall back to the current fade.

**Accept when**

- The gate finds no visible interactive element with a hit box under 44 × 44 px.
- A fast flick (> 0.8 px/ms) visibly overshoots and settles.
- Reduce Motion gives instant changes.

---

## 6 · A phone-quality gate in CI, plus phone primitives

This is what keeps the experience good as the app grows. Design systems that work at scale don't depend on every screen being reviewed. Their components make the right thing the default, and a check catches the rest. GitHub's Primer and Apple's UIKit both work this way.

**The gate.** Add `e2e/phone-quality.spec.ts`. It runs every `/dev/specimens` page and each destination at 390 × 844, light and dark, and fails on:

1. a visible interactive element with a hit box under 44 × 44;
2. more than one visible text field outside `.phone-bar`, excluding open sheets;
3. a breadcrumb or underlined desktop tab strip under `COMPACT`;
4. horizontal scroll on `document.scrollingElement`;
5. an empty top-bar title after scrolling 60 px;
6. first content more than 170 px below the top bar (destinations only);
7. zero-count text (`/\b0 (Lumens?|items?|entries|sub-topics?)\b/`);
8. Axe violations, serious and above.

It writes a contact sheet of every screen as a CI artifact, so the owner's iPhone check becomes looking at one image. The scripts used for this audit are the starting point: `live.cjs`, `measure.cjs` and `strip.py`, all in this session's scratchpad.

**The primitives** under `src/components/phone/`:

- `PhonePage` (§1);
- `PhoneRoom` (§4);
- `PhoneSegmented`;
- `PhoneRow` (44 pt, chevron, status dot);
- `PhoneSheet` (heights and spring, §5).

A new phone screen is built from these, so it passes the gate by construction.

**Accept when**

- The gate runs in the `Verify` workflow.
- It starts in report mode, listing today's failures as a baseline.
- After each of 1–5 lands, the matching rule switches to failing mode.

---

## What stays as it is

- **The Palace and Map framing.** Tap to open, hold for more, the corner controls.
- **The sticky card heights** and their stored state.
- **The bar's live suggestions**, and Ask as the last row.
- **The drawer** and its Appearance switch.
- **Today's card hierarchy.** One primary button: Continue.
- **The photo viewer's layout.** It is the model for rooms.

## Build order for an unattended run

| Phase | Work | Gate rules turned on |
|---|---|---|
| Q0 | §6 gate in report mode; primitives `PhoneRow`, `PhoneSegmented` | none |
| Q1 | §2 one field: remove duplicates, bar contexts, Return always acts, room placeholders | 2 |
| Q2 | §1 `PhonePage` on Today, Learn, Commonplace (3 tabs), Settings | 3, 5, 6 |
| Q3 | §3 card full height, zero counts, peek name, List cap, stale copy | 7 |
| Q4 | §5 spring helper, hit areas, view transitions | 1 |
| Q5 | §4 `PhoneRoom`: course part, then Lumen, then Commonplace item and PDF | all |

Rules from the P0–P8 plan still hold:

- one commit per step;
- the gate and the typecheck pass before every commit;
- desktop (≥ 700 px) is unchanged; check this with the existing desktop e2e;
- no feature switches.
