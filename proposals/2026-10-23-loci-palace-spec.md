MEDIUM (slices P1–P3: a new view inside Loci, one new read-only read, no migration, no AI input, no public page, no new dependency). The owner must approve it first because it is a substantial visual departure (AGENTS.md:9).

# Loci Palace: your whole map in 3D

- **Status:** proposed. Written in Studiolo_Manage on 2026-10-23 from the Loci prototype and `ahmedste/studiolo` main at `bbc22c6f`, read-only. Nothing is built. The owner has not approved this design.
- **For the builder:** this file is meant to be copied to `docs/superpowers/specs/2026-10-23-loci-palace-design.md` on a branch `loci-palace-design` cut from main. That copy is the one the app's agents work from.
- **Reference:** the Loci prototype, claude.ai artifact `8LqFSz8qKDj9TP3B5fG5y2`, version 13, source [`prototypes/graph-3d/index.html`](../prototypes/graph-3d/index.html). Pin a copy as `palace-reference.html` in `docs/superpowers/specs/2026-10-23-loci-palace-mockups/`.
- **Names:** the Studiolo Naming Map (artifact `5jpa74Y8vpvLydgqv6vBP9`) and the naming spec `docs/superpowers/specs/2026-10-21-naming-loci-commonplace-design.md`. Its A2 says: "Palace joins as a view when it is built."
- **Companion:** [`2026-10-23-loci-palace-design-and-plan.md`](2026-10-23-loci-palace-design-and-plan.md), the short design doc and plan.
- **Labels:**
  - **A-n** is an assumption made while writing.
  - **C-n** is a call made by recommendation, under the owner's standing rule "in design work, decide by my recommendation and list assumptions".
  - **D-n** is a decision only the owner can make.

## 1. What the owner asked for

> "having it in our graph as an option will help seeing a person his full whole knowledge … its crazy light and good" (on the AI Coding Dictionary's 3D term graph)

> "how one library item can be linked to multiple subtopics and topics or areas, and how the explainers also could do that … fluid, nice, modern"

> "give it a name, your mind palace?" … "go ahead with Loci … simplicity is important"

> "make Loci now match our vision … all 4 feels cohesive"

The prototype answers these in four views that share one selection, one panel and one Ask Loci:
- **Palace**, the new 3D view;
- **Map**, the app's own GraphMap, unchanged;
- **List**;
- **Overview**.

This spec covers the Palace only. Map, List and Overview stay as built.

- **A-1.** The Palace is a view of Loci, not a new destination. It lives under Loci's tabs next to Map, List and Overview. This is the naming spec's A2.
- **A-2.** It is **read-mostly**:
  - The Palace never moves, creates or deletes a topic or an item. Positions are computed, never saved (D13).
  - Status, My Focus and Ask Loci work through the panel that already exists, exactly as on the Map.

## 2. Why, and what success looks like

**Why.** The Map is deliberately focused: one topic, at most 24 children and 6 related (D14). Nothing shows a learner the whole of what they know and have gathered at once:
- how big it is;
- which areas are dense or thin;
- how much is Learned;
- how one book bridges three areas.

The Palace does, and it gives every thing a **place** you can return to. That is the method of loci.

**Success**
1. From the overview, a learner can name their largest and thinnest areas within five seconds, without hovering.
2. Opening an area, then a topic, then a Commonplace item and one of its notes takes four taps or clicks. Esc or Back retraces those steps.
3. One item tagged on topics in two areas is visibly drawn between them, with a line to each.
4. The same account draws the same palace on every visit. Areas never swap places.
5. Labels never jump or flicker while the view turns.
6. At the account limits (2,000 topics, 4,000 links, items in stacks) it stays smooth:
   - **desktop:** median frame time ≤ 16 ms;
   - **iPhone:** median frame time ≤ 33 ms (§8.6).
7. The Map's first paint does not get slower.

**Non-goals**
- Editing in 3D, dragging nodes, or saved positions (D13).
- A Journal view.
- New tables or migrations.
- Changes to AI input or to the copilot's tools.
- Session replay of the canvas (it is blocked by `REPLAY_BLOCK_SELECTOR`, `src/features/analytics/options.ts:11-14`).
- A 3D library such as three.js (C-1).

**Anti-goals** (failures even if the view works)
- Anything that loops or drifts on its own (`project-docs/design/graph.md:67`; C25 "nothing loops").
- A wall of text in the overview.
- A slower Map, List or Overview.
- Sound that plays without the learner turning it on.

## 3. Where it lives

| Thing | Value |
|---|---|
| Address | `/graph/palace`. The route stays `/graph`, as the naming spec keeps routes (§2 rule 6). `?topic=<id>` opens that topic. |
| Tab | **Palace**, in Loci's section tabs. Order and default are D-2. |
| Selection | The same `?topic=` as the other views. `graphHref` already builds `/graph/palace?topic=` (`graph-workspace.tsx:84`), so a topic open on the Map is open in the Palace and the other way round. |
| Panel | The existing Map panel: `CopilotPanel` for testers ("Ask Loci"), or the Map panel with `TopicBody` / `OverviewPanel`. Details and Lumens (`DetailsCard`, the sheet slot) behave as on the Map. |
| Phone and iPad | The same sheet and detents as the Map (`drawerHeightsFor`, peek / half / full). The Palace frames what is open above the sheet, as the prototype does. |
| Switch | `PALACE_ACCESS=all\|testers` in `src/config/palace.ts`. Unset means off, and it fails closed. Testers come from `EXPLAINER_TESTERS`, like the copilot. `graph-page.tsx` passes `palace: boolean`. Off removes the tab, makes `/graph/palace` a 404 and makes `GET /api/palace` a 404. The name is added to `.env.example`. |
| Data | `GET /api/palace` is fetched when the tab first opens. It is never fetched on Map, List or Overview first paint (§8.2). |

## 4. The scene

### 4.1 What is drawn

| In the Palace | Is in Studiolo | Mark | Size (base px at default zoom) |
|---|---|---|---|
| **Area** | A level-1 topic (`parentId === null`) | A solid disc in `--status-3`, with a coverage ring: one arc per direct sub-topic in its status colour, starting at twelve o'clock, as on the Map's `.cov-ring` | 15 |
| **Topic** (level 2) | `topics` | A disc filled with its status colour. Not started is hollow: `--paper` with a `--ink-3` edge. | 7.5 |
| **Sub-topic** (level 3 and below) | `topics` | The same, smaller | 4.2, then 3.6 |
| **My Focus** | `wantToLearn` | A dashed `--accent` ring, matching the Map's | +4 |
| **Commonplace item** | `content_items` with `on_wall`, tagged on one or more topics (`content_topic_tags`) | A small square in `--ink-3`. It grows slightly with each tag, up to 4 tags. | 4.2 to 6.4 |
| **Note** | A plain note with `about_id` set to its item | An open square, orbiting its item | 3.2 |
| **Quote** | A note with `note_style='quote'`, plus an `annotations` locator | A small filled diamond, orbiting its source, labelled with its place ("p. 112", "14:05") | 3.2 |
| **Lumen** | An `explainers` row anchored on a topic or an item | A play triangle in `--accent` | 5.6 |
| **Course** | `explainer_series` (only while `EXPLAINER_COURSES` is on) | A play triangle inside a ring | 6.6 |
| **Stack** | One per area, for its Commonplace items and for its Lumens | A count disc ("8") and a card stack ("10"), beside the area | 6.5 + 2·√n |
| **Suggestion** | Pending copilot proposal items, testers only (the Map's `ghosts`) | A hollow, dashed `--accent` topic | As a topic |

**Belonging decides place.**
- A topic sits near its parent.
- An item settles between the topics it is tagged on.
- A note or quote sits on its item, never loose.
- A Lumen sits by its anchor.

### 4.2 Lines

Lines get stronger only around what is open. Elsewhere they stay at a hairline.

| Line | Means |
|---|---|
| Hairline, `--ink-3` at low alpha | Parent → child |
| Dashed `--status-2` | Related topics (`topic_relations`), with a reason |
| Dotted | An item tagged on a topic |
| Arrow | Made from: an item or topic → its Lumen; an item → the topics it is tagged on, when the item is open |
| Short tick | A note or quote → its item |

### 4.3 Three levels, one gesture

| Level | You see | Names shown | Budget |
|---|---|---|---|
| **Sky** (nothing open) | Every area as a landmark, topics as quiet dots, links very faint, stacks closed | Area names only; near ones clear, far ones faint | 1 per area |
| **Room** (an area or topic open) | Its topics and sub-topics, its two stacks, its related topics; everything else greys to about 25% | Names in the room, plus stack counts | About 15 |
| **Object** (an item, note, quote, Lumen or course open) | The object, its notes and quotes in a small orbit, arrowed lines to every topic it touches in any area | The object, in Newsreader, and its direct neighbours | The object and its neighbours |

- **Open** goes one level in: tap, click, Enter, or zooming past a threshold.
- **Back** goes one level out: Esc, Back, or zooming out past a threshold.
- A short pause stops one long scroll from skipping two levels.

### 4.4 Labels (from the prototype rounds)

1. Every name sits under its mark and **never moves to dodge**. When crowded, it fades.
2. The nearest name wins. A name already showing keeps a small head start, so names hand over calmly as the view turns. This hysteresis removed the flicker.
3. On phones, type is 0.8× and labels are fewer.
4. **One serif per screen:** only the open object's name is in Newsreader. Everything else is Instrument Sans in `--ink-2` or `--ink-3` text tokens. `color: var(--ink-3)` is banned on text (`tests/unit/tokens.test.ts`), so the canvas uses `--text-muted`.
5. Names are cut at 24 characters (D15). The full name is in the peek, the panel and the accessible description.

### 4.5 Stacks

**Opening a stack** shows a small card beside it with the latest four, then a "See all" link:
- "See all N in Commonplace →" goes to `libraryHref(areaId)` (`/library?topic=…`, `graph-workspace.tsx:271`);
- "See all N in Learn →" opens the Lumens card, as the Map's `more-explainers` does (`openExplainers`, `graph-workspace.tsx:1089`).

At the same moment the latest four bloom out of the stack, with arrowed lines to the topics they serve. On phones the card is a sheet.

## 5. Interaction

### 5.1 Pointer and touch

| Gesture | Desktop | Touch |
|---|---|---|
| Turn the view | Drag on empty space | One finger, after 8 px (as the Map) |
| Zoom; zoom past a threshold to go in or out a level | Wheel or trackpad | Pinch |
| Open | Click | Tap |
| Peek (one line: kind, status, counts) | Hover for 400 ms | Long press |
| Hover an area | Its topics drift a third of the way toward it, its links curve in, and the rest greys. The camera never moves on hover. | none |
| Fit | The ⤢ button, as the Map's | The same, 44 px |

- Dragging never moves a node (D13).
- The canvas cancels Safari's page zoom while a pinch is over it, as the Map does.

### 5.2 Keyboard and screen readers

The canvas is one Tab stop: `role="application"`, with the accessible name "Palace of your map". A polite live region says what is open, for example "Islamic architecture, topic in History & Theory, Learned, 4 sub-topics, 6 in your Commonplace".

| Key | Does |
|---|---|
| Arrow keys | Move to the nearest drawn neighbour in that screen direction, announced. Turning the view by keyboard uses Shift+arrows. |
| Enter | Open |
| Esc | Back one level, after the panel's own layers in `map-layers.ts` order |
| `/` | Find a topic (the Map's shortcut). The result flies there. |
| `+` / `-` | Zoom |

The List stays the full keyboard path (D5). Every action in the Palace is also in the panel's lists (sub-topics, Commonplace items, Lumens, related).

**C-2.** The keyboard moves between neighbours, not the camera. This is a change from the prototype, where the arrows turn the view. Moving between neighbours gives a screen reader something to say.

### 5.3 Where am I

The Map's crumb row (`GraphNav`: back, up, overview) shows the route, for example "All areas › History & Theory › Islamic architecture". Every part is a button.

The prototype also draws a faint **trail** between the last few things opened, fading over about a minute. That is D-5.

### 5.4 Ask Loci (testers)

- **`show_on_map`:** the Palace flies to the topic and gives it the Map's still glow for 1.6 s (`SHOWN_GLOW_MS`). It does not pulse.
- **Pending suggestions** draw as dashed topics under their parent. Keep and Dismiss stay in the Ask Loci card, as on the Map. A kept topic pops once (`popIds`).
- **Change-plan previews** stay a Map feature. While a plan card is open, the Palace shows a one-line note, "See the plan on the Map", with a link.

## 6. Motion

Four movements, and only one leads at a time. All of them use the app's tokens (`src/styles/tokens.css:24-36`).

| Movement | When | How | Timing |
|---|---|---|---|
| **Settle** | The first open of the Palace in a visit | Areas grow in first, then topics, then sub-topics, with a slight spring. The camera swings in from above. | Areas from 150 ms, 45 ms apart; each level 380 ms after the last. About 3 s in all. `--ease-spring`. |
| **Fly** | Opening anything | The camera eases to frame the object and everything it touches. Long jumps pull back, then come in, so the path stays readable. | 700–1,500 ms, scaled by distance. `--ease-standard`. |
| **Bloom** | Opening a stack or an object | Contents unfold from the parent, one by one. Closing reverses it. | 40 ms apart, each over `--dur-move` (380 ms) |
| **Fade** | Greying and lifting, labels | Cross-fades only, never a snap | Rates as in the prototype (in 5/s, out 7/s), equivalent to about `--dur-standard` |

**Rules**
- Hover never moves the camera.
- A new open interrupts a flight from where it is. Stale transitions never queue (`interface.md:382`).
- Nothing loops. No idle turn, and no pulsing selection ring. The prototype's "Slow turn" option and its breathing ring are D-3.
- **Reduced motion:** every movement becomes an instant cut with a `--dur-quick` cross-fade. Settle is skipped. The layout is computed to rest before the first frame.

## 7. Visual tokens

- **Colours:** only existing tokens: `--paper`, `--panel`, `--line`, `--ink`, `--ink-2`, `--ink-3`, `--text-muted`, `--status-1`, `--status-2`, `--status-3`, `--accent`, `--accent-soft`, `--ghost*`.
  - The canvas reads them with `getComputedStyle` at mount and again when the theme changes: `data-theme` or `color-scheme` changes, and the `prefers-color-scheme` listener.
  - There are no new colours, and light and dark both come from `light-dark()`.
- **Type:** `--ui` and `--read`, as above.
- **Paper grain:** the prototype's paper grain overlay is decoration. The builder keeps it only if the reference comparison shows it is needed (C-3).
- **New tokens:** none, unless the motion table needs a named duration. A new duration would follow C-23's precedent: a 1 ms reduced-motion value, documented at `interface.md:377`.
- **CSS:** DOM chrome uses the prefix `plc-` (cards, peek, the sound switch).

## 8. How it is built

### 8.1 Rendering: canvas 2D, no dependency

**C-1.** The renderer is a hand-written projection onto a 2D canvas, as in the prototype. It is not WebGL or three.js.
- The prototype ran at the account limits at about 52 fps in headless Chromium.
- It needs no CSP change, no new package and no texture CORS.
- It stays legible with the same fonts as the app.
- **If the owner prefers three.js** (D-6), it needs:
  - a dependency entry in `project-docs/architecture/tech-stack.md` (licence MIT, about 150 KB gzipped);
  - loading through `next/dynamic({ ssr: false })` on this tab only.

### 8.2 Data: one new read, composed from what exists

There is no whole-account read of tag pairs, item links or Lumen anchors today:
- The Learn reads are capped at 200 and drop `anchor_item_id` (`learn/repository.ts:31-36`).
- The topic gateway works one topic at a time.

So the Palace gets **one composed read** in the layer-3 feature `src/features/graph/`. No new `FEATURE_LAYERS` entry is needed.

- **`src/features/graph/palace-read.ts`** (`import "server-only"`):
  - `readPalace(db, accountId)` combines, with `together(db, …)`:
    1. `readTopicGraph`. This needs a reasoned row in `scripts/boundaries-baseline.json`, because `topics/repository.ts` is not public.
    2. Tag pairs: `SELECT item_id, topic_id FROM studiolo.content_topic_tags WHERE account_id=$1`, for on-wall items only, joined to `library_entries`.
    3. A light item projection: `id, shape, note_style, object_base, title, created_at`. No bodies and **no signed media**, which is the expensive part of `readCards`.
    4. Notes about items: `id, about_id, title` or an excerpt cut to 80 characters, where `about_id IS NOT NULL`.
    5. Quotes: `item_id, source_id, locator_kind, locator_page, locator_seconds, locator_text`.
    6. Lumens: `id, title, status, anchor_kind, anchor_topic_id, anchor_item_id, created_at`. Excludes `origin='eval'`, cancelled and failed rows (`explainers/status.ts`). Includes making rows, drawn hollow.
    7. Courses, only while `EXPLAINER_COURSES` is on: `id, title, anchor_*`, and the part count from `jsonb_array_length(parts)`.
  - `loadPalace(accountId) = readForActiveAccount(accountId, db => readPalace(db, accountId))`.
- **`src/app/api/palace/route.ts`:**
  - `export const runtime = "nodejs"; export const dynamic = "force-dynamic";`
  - `accountRead(request, "palace.read", …)` gives `privateJson`, with 403 on null. Off gives 404.
  - Copy `api/topics/[topicId]/explainers/route.ts`.
- **`src/features/graph/palace-gateway.ts`** (client-safe): the `Palace` types, `createHttpPalaceGateway`, and `createMemoryPalaceGateway(seed, latencyMs)` for specimens and browser specs.
- **Shape:** compact columns, with ids sent once and indexes after that. Worst case at the limits: 10,000 items, 200,000 tag pairs. Realistic accounts are a small fraction.
  - **C-4.** Above 3,000 items the read returns items only for stacks (count and latest four per area) until a room opens. Opening a room fetches that area's items with `?area=<id>`.
  - Response budget: under 1.5 MB uncompressed at the limits.
- **Freshness:** the Palace re-reads after the map's single "map changed" entry (`useGraphActions().changed`), and after a plan is applied or undone (`copilotPlanHandlers.onMapChanged`). Change plans move Lumens and tags.
- **No migration:** the existing indexes cover these scans: `content_topic_tags_topic_idx`, `explainers_anchor_*_idx`, `content_items_account_about_idx`.

### 8.3 Client modules

`graph-workspace.tsx` is at its limit (1,967 lines; `scripts/file-size-baseline.json`). The Palace must add **net zero lines** there:
- the union member and `VIEWS` entry;
- one render branch that hands its props to `PalaceView`.

Code moved out balances it, as `copilot-plan-handlers.ts` was moved out for change plans.

| Module | Holds | Pure? |
|---|---|---|
| `src/components/palace/palace-view.tsx` | Loaded with `next/dynamic({ ssr: false })`. It owns the canvas, the gateway fetch, the live region and the DOM chrome (stack card, peek, sound switch). | No |
| `src/features/graph/palace-scene.ts` | Builds the scene from `Palace` and `TopicGraph`: kinds, sizes, groups, scope per level, label candidates and priorities | Yes |
| `src/features/graph/palace-layout.ts` | The 3D force layout, seeded and frozen (C-5) | Yes |
| `src/features/graph/palace-camera.ts` | Projection, the fly with its hop, framing, and zoom thresholds for levels | Yes |
| `src/components/palace/palace-draw.ts` | Canvas drawing: marks, lines, rings, labels, using tokens read once | No |
| `src/components/palace/palace-input.ts` | Pointer, wheel, pinch, keyboard, and neighbour picking | No |
| `src/components/palace/palace-sound.ts` | Web Audio, about 2 KB, off by default (D-4) | No |

New files stay under about 400 lines each (the Shelves plan's convention).

**C-5. One palace per account.**
- Areas sit on a Fibonacci sphere in `sortOrder`, so they never swap places.
- Every other position comes from a seeded random (seed = a hash of the topic id), not `Math.random`, which the prototype used.
- The simulation runs to rest, then freezes. It is never saved (D13).
- Adding a topic moves only its neighbours, because the areas are fixed anchors.
- Above 500 nodes the repulsion is sampled, as in the prototype. A Web Worker is optional; use one if the first layout blocks the main thread for more than 50 ms on an iPhone.

### 8.4 What the Palace does not touch

It does not change:
- the Map's `GraphMap`, `layoutFrame` or its CSS;
- copilot tools or prompts;
- analytics events. No new `NamedEvent`; the page path `/graph/palace` already shows in PostHog.

### 8.5 Sound

- Web Audio, synthesised. There are no files, and nothing plays until the learner turns it on.
- The switch sits in the Palace's key. The choice is saved per device in `localStorage` (`studiolo:palace-sound`), with try/catch.
- Sound is muted while the tab is hidden.
- Every sound is under 120 ms (chimes 400 ms) at about −24 dB, tuned to one pentatonic scale (G3, D4, G4, B4, D5, A5).

| Event | Sound |
|---|---|
| Open an area | Low "tock", G3 |
| Open a topic | D4 |
| Open a sub-topic | G4 |
| Open an item | Paper tick (filtered noise) |
| Open a note or quote | A shorter pencil tick |
| Open a Lumen or course | Two-note chime, D5 + A5 |
| Bloom | Quick rise, D4 G4 B4, 30 ms apart |
| Mark Learned | G4 → D5 |
| Hover an area | Near-silent tick |
| Switch tab | Soft tick |

### 8.6 Tests

| Suite | What |
|---|---|
| Unit (`tests/unit/palace-*.test.ts`) | **Scene:** kinds, groups, scope per level, label budget, label hysteresis (no swap under a small turn). **Layout:** same input gives same positions; adding one topic moves no area. **Camera:** framing and level thresholds. **Input:** keyboard neighbour picking. **Switch:** off hides the tab and 404s both routes. The vocabulary check passes. |
| Integration (`tests/integration/palace-read.test.ts`) | Account isolation; eval and cancelled Lumens excluded; removed anchors (NULL id) drawn as unanchored and not crashing; margin notes and quotes found; over 3,000 items gives stacks only |
| Route unit | `api/palace` uses `testContext` (`tests/support/route-context.ts`): 403, 404 when off, 200 shape |
| e2e (`tests/e2e/loci-palace.spec.ts`) on `/dev/specimens?graph=palace` with the memory gateway | **Navigation:** open an area, a stack, an item, a note; Esc back through each level; `/` find; the `?topic=` round trip with the Map. **Motion and phone:** reduced motion is static; the phone sheet at 390 × 844 with no horizontal scroll. **Ask Loci:** `show_on_map` fly and glow. |
| axe | Light and dark at 1440 × 900 and 390 × 844, with `.exclude("nextjs-portal")` |
| Performance (`palace-speed`, evidence only) | The 2,000-topic specimen: median and 95th-percentile frame time while turning, and time to first frame. Recorded in `docs/superpowers/evidence/loci-palace/speed.md`. Budgets are in §2.6. |
| Visual comparison | App against `palace-reference.html` at 1440 and 390, light and dark: Sky, Room, Object and an open stack. Recorded in `evidence/loci-palace/differences.md`. |

Specimens need:
- a `palace` branch in `src/app/dev/specimens/page.tsx:112` and in `src/dev/graph-specimens.tsx`;
- `src/dev/palace-sample.ts`, which is the prototype's sample account.

## 9. Slices

| Slice | Tier | Learner gets | Data |
|---|---|---|---|
| **P1. The palace of topics** | MEDIUM | The Palace tab (behind the switch): areas, topics, sub-topics, related links, Sky and Room levels, fly, labels, the panel, find, keyboard, reduced motion, phone | `TopicGraph` only (already on the page). No new read. |
| **P2. Commonplace and Lumens** | MEDIUM | Items between their topics, notes and quotes orbiting, Lumens and courses, stacks with their cards, the Object level | The new `readPalace` and `GET /api/palace` |
| **P3. Feel** | LOW | Sound (off by default), peek, the trail if D-5 says yes, Ask Loci show and suggestions | None new |
| **P4. Default view** | LOW | Palace becomes Loci's default, if D-2 says so after the owner's tests | None |

## 10. Decisions for the owner

Most consequential first.

| # | Question | Recommendation | Owner's answer |
|---|---|---|---|
| D-1 | Approve the Palace as a Loci view, with the prototype (v13) as its pinned reference? | Yes: a fourth view, read-mostly, behind `PALACE_ACCESS=testers` first | |
| D-2 | Tab order and default view | **Palace · Map · List · Overview**, with Map staying the default until you have tried it (naming A2). P4 then makes Palace the default if you want it. | |
| D-3 | The prototype's slow idle turn and breathing ring break "no drift or orbit" and "nothing loops" | Drop both. The Palace stays still until you move it. | |
| D-4 | Sound | Ship it in P3, off by default, with a switch in the key | |
| D-5 | The fading trail of the last things opened | Leave it out of P1–P2. The crumb row already answers "where am I". Try the trail in P3. | |
| D-6 | Canvas 2D (no dependency) or three.js | Canvas 2D. It is fast enough at the limits, adds no new package and needs no CSP change. | |
| D-7 | Who sees it first | Testers (`PALACE_ACCESS=testers`), then everyone | |
| D-8 | The Palace on phones | Yes, with fewer labels and the Map's sheet. The prototype was tested at 390 px. | |
| D-9 | Very large Commonplaces (more than 3,000 items) | Stacks only until a room opens (C-4) | |

## 11. Calls made after the builder check

- **C-1** Canvas 2D renderer (§8.1).
- **C-2** The keyboard moves between neighbours, not the camera (§5.2).
- **C-3** The paper grain only if the comparison needs it (§7).
- **C-4** Stacks only above 3,000 items (§8.2).
- **C-5** A seeded, frozen layout with areas fixed in `sortOrder` (§8.3).
- **C-6** Lumens that are being made are drawn hollow. Failed and Stopped ones are not drawn.
- **C-7** The panel edits and the Palace draws. Status and My Focus change through the existing inspector actions and `useGraphActions().changed`, so the Palace sees the change like any other view.

## 12. All assumptions and calls in one place

A-1 a view of Loci · A-2 read-mostly · C-1 canvas 2D · C-2 neighbour keys · C-3 grain optional · C-4 stacks above 3,000 · C-5 seeded frozen layout · C-6 making drawn hollow, failed hidden · C-7 the panel edits.

## 13. Before the plan: pull and re-check

Seams and constraints at `bbc22c6f`:
- `graph-workspace.tsx`:
  - `GraphViewName` l.81, `VIEWS` l.87-91 and the render branch l.1935-1948.
  - Every `view === "map"` check: l.453, 503-507, 1279-1316, 1446, 1529.
  - Size limit 1,967.
- Section allow-list: `src/app/(workspace)/graph/[section]/page.tsx:13`.
- Section lists:
  - `src/components/shell/destinations.ts:45-49`, `destinationSections.graph`;
  - `src/components/onboarding/onboarding-workspace.tsx:28`, `SECTIONS`.
- Specimens:
  - `src/app/dev/specimens/page.tsx:112`;
  - `src/dev/graph-specimens.tsx:68,167-187`.
- Tests that pin the tabs: `tests/unit/destination-header-labels.test.tsx` and the e2e specs `graph-list`, `graph-journey`, `graph-inspector`, `copilot-shell`, `onboarding-*`.
- The Escape order: `src/components/graph/map-layers.ts:7`.
- Boundaries: `scripts/boundaries-baseline.json`, for the `readTopicGraph` import.

## 14. Documentation the build updates

- **`project-docs/design/graph.md`**
  - l.105: "Graph has three tabs", becoming four tabs.
  - Motion: the Palace's four movements.
  - Its decisions: C-1 to C-7 and D-1 to D-9 as answered.
- **`project-docs/design/interface.md`**
  - Names: Palace.
  - Motion: Settle, Fly and Bloom.
- **`project-docs/implementation/frontend.md`**
  - l.184: the views paragraph.
  - A new "Palace" section: modules, layout seed, label rules, the canvas and accessibility.
- **`project-docs/implementation/backend.md`:** the Palace read beside "Today reads".
- **`project-docs/product/mvp-scope.md`:** Loci's views.
- **`.env.example`:** `PALACE_ACCESS`.

## 15. Departures from the prototype

| Prototype | App | Why |
|---|---|---|
| Its own rail, header and scripted Ask Loci | The app's shell, `DestinationHeader`, `CopilotPanel` and real copilot | The Palace is one view of the real Loci |
| Slow turn and breathing ring | None (D-3) | `graph.md:67`; nothing loops |
| `Math.random` layout | A seeded layout (C-5) | One palace per account |
| Arrows turn the view | Arrows move between neighbours; Shift+arrows turn (C-2) | Screen readers and the keyboard path |
| Trail of footprints | The crumb row; trail in P3 if D-5 says yes | Simplicity |
| "Try 2,000 topics" and the fps readout | Specimen only | Not for learners |
| Group card "See all" says "In the app this opens…" | Real links to Commonplace and the Lumens card | — |

## 16. Checks (for the checklist) and rollback

- **Verify:** lint (0 errors), `lint:ratchet` ("0 added", quoting the line with `RATCHET_BASE=origin/main`), `lint:size` ("0 over"), typecheck, unit, `check:docs`, `scripts/check-prototype.cjs`, build.
- **Tests:** the graph and palace integration tests (branches mode); e2e `loci-palace` plus the graph specs that pin tabs; axe as in §8.6.
- **Evidence:** speed and differences evidence as in §8.6.
- **Manual:** the owner's devices (`project-docs/workflow/owner-testing.md`): desktop Chrome, iPhone Safari, iPad Safari in both orientations. Firefox and Android are "unverified" unless run.
- **Commit note:** "No migration, no env beyond `PALACE_ACCESS`, no new dependency."
- **Rollback:** unset `PALACE_ACCESS` to hide it at once, or `git revert -m 1` on the merge.
