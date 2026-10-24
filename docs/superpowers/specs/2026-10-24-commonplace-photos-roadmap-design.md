HIGH (a programme of seven phases; each phase states its own tier)

# Commonplace photos and header: seven phases, one at a time

**For:** the agent building this in `studiolo`, and the owner approving it phase by phase.
**Status:** Proposed. Claude, 24 October 2026. Nothing here is approved until the owner says so in the conversation.
**Checked against:** `studiolo` main @ `3c2f744` (24 Oct 2026), read only. Paths below exist on that commit unless marked *new*.
**Design reference:** the prototype **Commonplace Photos** (`Studiolo_Manage/prototypes/commonplace-photos/`, published at `https://claude.ai/artifact/PvSxX3nhQarJJtwjdjf1Hm`, version 4). The owner approved its header ("That's perfect", 24 Oct 2026). Its README lists what to try.
**Builds on:** [`2026-10-24-commonplace-photos-design.md`](2026-10-24-commonplace-photos-design.md), which keeps the reasoning (three questions instead of folders, decisions PH-D1 to PH-D7). This roadmap replaces that document's §0 table for **order and scope**, and adds the header, which the prototype introduced.

## 0. In short

**One phase or several? Several.** The prototype bundles work with very different risk:
- some of it changes only components;
- some needs four separate migrations;
- one part fetches images from the web on the server;
- one part reaches into Loci while the Palace's own item work is still being designed.

Under the workflow's tiers, every migration makes a phase HIGH, with its own approved spec, two reviews and the owner's test. One big phase would hold the cheap, visible wins (the header, the viewer) behind the slowest, riskiest parts.

| # | Phase | What the learner gets | Tier | Migration | Switch |
|---|---|---|---|---|---|
| 1 | **Header and slim bar** | **Select** on the tabs row. One full-width search bar holding area, search and Wall/Shelves. A type row whose chosen type opens its collections. One slim bar for every type: All · Unsorted, Topic, the type's own filter, count, Display (sort). Shelves follow the same header | MEDIUM | no | `CP_HEADER` |
| 2 | **The photo viewer** | Zoom, pan, 1:1, full screen, Space to look from the wall, a facts block, Copy image, Download in the quick view | MEDIUM | no | `PHOTO_VIEWER` |
| 3 | **The photo wall** | Photos shown whole in Rows, Masonry or Grid, a size slider, colour placeholders, Colour, Shape and Light filters, more sorts, Group by (all types), captions, photo shelves that open as a wall | HIGH | yes (palette) | `PHOTO_WALL` |
| 4 | **Picks, Views and sorting a pile** | ★ Picks on every type, saved **Views** in the search bar, **Sort mode** for unsorted photos, a drag box and bulk actions | HIGH | yes (picks, views) | `CP_PICKS_VIEWS` |
| 5 | **Saving from the web** | Drag or paste an image from a website, keeping its source link; HEIC from iPhones | HIGH | yes (image source) | `PHOTO_WEB_IMPORT` |
| 6 | **Notes on a detail** | Draw a box on a photo and write about that part | HIGH | yes (note regions) | `PHOTO_REGIONS` |
| 7 | **Photos in Loci** | A key picture per topic and area, a mood strip and topic colours on the Map, Show on Loci, prints in an open Palace room | HIGH | yes (topic cover) | `LOCI_PHOTOS` |
| (3C) | **Seeing photos** | Descriptions, suggested tags and topics, search by meaning, More like this | HIGH | yes | own programme |

**Why this order:**
- **Everyone first.** Phase 1 improves Commonplace for every type, has no migration, and decides the frame every later phase plugs into: the bar has a slot for Picks, Views, Colour and Display that later phases fill.
- **No data, high value.** Phase 2 needs nothing from the database and is what people feel every time they open a photo. It can run alongside Phase 1, since the two touch different files.
- **Look before organizing.** Phase 3 adds the palette that Colour, Light and colour placeholders need.
- **Organize next.** Phase 4 adds the two tables that make "find it later" work: Picks and Views.
- **Risky inputs on their own.** Phase 5 fetches from other sites on the server (SSRF and licence questions), so it ships alone.
- **Loci last.** Phase 7 needs Picks (Phase 4) to choose good key pictures, and its Palace part must wait for Palace P2 rooms.

**Parallel work:** Phases 1 and 2 may be built at the same time on separate branches. Everything after Phase 2 waits for the phase before it to merge.

## 1. What exists today (main @ 3c2f744)

| Area | Today | Where |
|---|---|---|
| **Header** | `DestinationHeader`: a breadcrumb, then tabs (Everything, Collections, To read, Templates). Its `lead` slot holds the `AreaPicker` | `src/components/shell/destination-header.tsx`; `src/components/library/area-picker.tsx`; `src/app/(workspace)/library/page.tsx:36` |
| **Search line** | `SearchLine` is shared by the wall and Shelves (C-6). It is a bare serif input with a count, then the view's buttons (Add items, Select), then `end` (the view switch) | `src/components/library/wall-toolbar.tsx:17` |
| **Wall \| Shelves** | `LibraryViews`; the view is remembered in a cookie | `src/components/library/library-views.tsx`; `LIBRARY_VIEW_COOKIE` in `src/features/library/library-view.ts` |
| **Chip row** | One flat row: All, the learner's collections, Type chips (Notes, Quotes, Photos, Sources, Objects), More ▾ | `src/features/library/wall-chips.ts:27`; `src/components/library/wall-chip-row.tsx` |
| **Filters** | ILIKE search; shape, note style, collection (or `none`), topic, area (subtree), reading state, collapsing of photo groups. All AND-ed. **There is no "no topic" filter** | `src/features/library/search.ts:53-152`; `src/features/library/wall-state.ts` |
| **Reading state, note style** | `sources.reading_state` (`unread`, `reading`, `read`) and `content_items.note_style` already exist | `src/db/library-schema.ts:37,103` |
| **Selection** | Select mode, Shift-range, Select all (cap 500). Bulk: Move to collection, Delete | `src/components/library/library-wall.tsx:429-486, 711-751` |
| **Shelves** | Shelf chips per type, the desk, shelves by collection | `src/components/library/library-shelves.tsx`, `shelf.tsx`, `shelves-parts.tsx` |
| **Photo viewer** | Quick view: no zoom, pan or full screen. Image page: a `zoom-in` cursor that only opens the quick view | `src/components/library/quick-view/photo-view.tsx`; `image-page.tsx`; `src/styles/library.css:905` |
| **Zoom code to reuse** | The PDF reading room: zoom 50–300 %, desk pan | `src/features/library/viewer-state.ts`, `pdf-pan.ts`; `src/components/library/use-desk-pan.ts` |
| **Photo data** | `images` holds size, `taken_at`, camera and group. Sizes: `original`, `display` (2048), `thumb` (640). **No palette, no source URL** | `src/db/files-schema.ts:31-51`; `src/features/files/processing.ts` |
| **Migrations** | Hand-written SQL; the latest is `0024` | `drizzle/` |
| **File size** | Only `graph-workspace.tsx` is pinned (1,962 lines). `library-wall.tsx` is 757 lines: put new wall code in new files | `scripts/file-size-baseline.json` |

## 2. Rules for every phase

- **The prototype is a reference, not code.** Rebuild every screen with the app's React components, tokens and CSS files (`src/styles/library.css`, `shelves.css`). Take layout, spacing, states and keys from the prototype; never copy its HTML or JS. Where the prototype and `project-docs/design/interface.md` disagree, ask the owner.
- **Specimens and comparison.** Each phase adds its states to the dev specimens (`src/dev/library-specimens.tsx` and `library-specimen-views.ts`). The merge checklist pairs screenshots against the prototype at 1440 × 900 and 390 × 844, in light and dark (the AGENTS.md visual-fidelity rule).
- **Switches.** Each phase sits behind its own switch in `src/config/*.ts`, closed unless on, testers first. With the switch off, the app looks exactly as it does today.
- **Tiers and paperwork.**
  - **MEDIUM:** a one-page phase spec and the merge checklist.
  - **HIGH:** a spec the approver approves, a plan only for work over about a day, full integration and end-to-end tests, and two reviews.
  - Each phase spec goes in `studiolo/docs/superpowers/specs/YYYY-MM-DD-<slug>-design.md`, with its tier on line one.
- **Migrations.** Hand-written in `drizzle/`, numbered at the time of writing. They are applied only on the owner's word, to every hosted database, before the code that needs them reaches `main`.
- **Guides on the same branch:**
  - `project-docs/product/library.md` (behaviour);
  - `project-docs/design/interface.md` (the header pattern, the photo wall);
  - `project-docs/implementation/frontend.md`, `backend.md` and `database.md`;
  - `project-docs/architecture/data-model.md` when a table changes.
- **Accessibility.** Every control is a real button or select with a label, and all keys also work by pointer. Focus returns to the opener when a popover closes. Reduced motion settles at once.
- **Names on screen:** Commonplace, Loci, Views, Picks, Unsorted, Sort mode, Kind (inside Photos only). Code keeps `library`, `graph`, `palace`.
- **Merging:** only on the owner's word after the owner has tested the phase. Never push `main` otherwise.

## 3. Phase 1: header and slim bar (MEDIUM, no migration)

**Goal:** one clear frame for every type.
- **Where am I and what am I looking for?** The search bar.
- **What kind of thing is it?** The type row.
- **Narrow it down:** the slim bar.

**Layout (prototype, top of the page):**

1. **Tabs row.** The existing tabs (Everything, Collections, To read, Templates), with **Select** at the right end. It shows on the Wall only. "Select" with a square outline; while on, it turns into a solid accent "Done".
2. **Search bar.** Full width, 50 px tall, 10 px radius, `--panel` fill and a 1 px `--line` inset. On focus, the whole bar gets the accent outline and a soft ring. Inside it, separated by hairlines:
   - **Area** (the existing `AreaPicker`, moved out of `DestinationHeader`'s `lead`), e.g. "● All areas ▾".
   - **Search**: magnifier icon, Newsreader 19 px, a placeholder per type, `/` focuses it, ✕ clears.
   - **Views slot**: empty in Phase 1, filled in Phase 4.
   - **Wall | Shelves**: an inset segmented switch.
3. **Type row.** All · Notes · Sources · Photos · Objects as pills with an icon and a count; the current one is filled `--ink`.
   - The current type opens its **collections** in the same row after a `›`, e.g. Photos › Site visits · References · Renders. Choosing one fills it `--accent-soft`.
   - This replaces the flat chip row and the Shelves shelf chips.
   - Collections never appear under All.
4. **Slim bar**, between two hairlines:
   - **Show:** All · Unsorted (no topic), with counts. Picks joins in Phase 4.
   - **Topic ▾**.
   - **The type's own filter:** Sources → **Status** (To read, Reading, Read, from `reading_state`). Notes → **Style** (Plain, Long, Quote, from `note_style`). Photos → **More** with Shape only (from `width` and `height`). Objects → none yet.
   - On the right: the **count** ("32 photos · newest first"), **⋯** (empty until Phase 4), and **Display ▾** with Sort (Newest, Oldest, Title).
   - An active filter shows its value plus ✕, e.g. "Reading ✕".
   - With Unsorted on and photos in view, the bar shows a primary "Sort these N" button only once Phase 4 exists.

**Data and server.**
- **`search.ts`:** add `unsorted` (items with no row in `content_items` ⋈ `content_topic_tags`) and photo `shape` (from the `width / height` ratio in `images`). Keep every existing filter.
- **Counts:** the type row needs one count per type for the current area and search. Add it to the existing page load (one grouped count query), not one query per pill.
- **Address:** `?type=`, `?collection=`, `?unsorted=1`, `?status=`, `?style=`, `?shape=`, `?sort=`. The address round-trips, and Back restores the state.
- **Shelves:** apply the same type, area and search to Shelves. Show only the chosen type's sections, and keep the desk.

**Files.**
- *New* `src/components/library/search-bar.tsx`, which replaces `SearchLine`.
- *New* `type-bar.tsx` and `filter-bar.tsx`.
- `wall-toolbar.tsx`, `wall-chip-row.tsx`, `wall-chips.ts` (keep the chip model; render it in the type bar), `library-views.tsx`, `area-picker.tsx` (now rendered inside the bar), `destination-header.tsx` (a trailing slot for Select), `library-shelves.tsx`.
- `src/features/library/search.ts`, `wall-state.ts`, `library.css`, `shelves.css`.

**Done when:**
- Every type reaches every filter by keyboard and pointer.
- The address round-trips.
- Counts match the wall.
- Phone width (390 px) has no sideways scroll, and the type row and slim bar scroll inside themselves.
- With the switch off, the page is byte-for-byte today's layout.
- The library end-to-end and isolation tests pass.

## 4. Phase 2: the photo viewer (MEDIUM, no migration)

Scope is as in the design document §3. In short:
- **Zoom:** wheel or pinch zooms around the pointer, and drag pans.
- **Keys:** double-click or `Z` for 1:1, `+` `−` `0`, `F` for full screen, `Space` to look from the wall, `←` `→` to browse.
- **Resolution:** swap `display` for `original` above 2048 px of shown size, with no flash.
- **Panel:** a facts block (W × H, MP, ratio, file, taken, camera), plus Copy image, Download original (now in the quick view too) and Copy link.
- **Image page:** the `zoom-in` cursor really zooms.

**Reuse:** `viewer-state.ts` and `use-desk-pan.ts`. Don't write a second zoom.

**Files:** `quick-view.tsx`, `quick-view/photo-view.tsx`, `image-page.tsx`, *new* `src/features/library/photo-zoom.ts` (pure, unit-tested: fit, clamp, zoom-at-point), `library.css`.

**Decision needed first:** PH-D1, the full-screen background. The prototype uses a dark mat.

**Done when:** a 6000 px image can be inspected at 100 % in both places; pinch works on a real iPhone; reduced motion is respected; keys don't fire while typing in the notes composer.

## 5. Phase 3: the photo wall (HIGH, migration)

**Migration (*new* `drizzle/00NN_image_palette.sql`).** Add to `images`:
- `palette jsonb`: up to 6 entries of `{ hex, lab, share }`;
- `dominant text`;
- `lightness smallint`.

**Pipeline.**
- **On ingest:** compute the palette in `processImage` (`src/features/files/processing.ts`) from the decoded thumb. Use sharp `stats()` for the dominant colour, plus k-means with k = 6 on a 64 px copy.
- **Worker:** the Cloudflare ingest (`workers/media/src/ingest.ts`) needs the same step.
- **Backfill:** `scripts/media-backfill.mjs --palette` (logic in `src/features/files/media-backfill.ts`), idempotent and resumable.
- **No new image size.**

**Wall (Photos only).**
- **Layouts:** Rows (justified, the default; PH-D3), Masonry (uncropped) and Grid (square), as layout icons in the slim bar.
- **Size:** 120–460 px in Display, plus `Ctrl +` / `Ctrl −`. Use `srcset` with `display` above 320 CSS px.
- **Placeholders:** the dominant colour shows until each photo loads.
- **Shape:** clamp ratios at 1:3 and 3:1.

**Filters.** Colour (15 swatches plus any colour; ΔE < 24 against palette entries of share ≥ 6 %), and Light/Dark under More.

**Display for photos.** Sort: Newest, Oldest, Date taken, Colour, Shape, Resolution, Title, Shuffle. Group: Area, Topic, Kind, Album, Month taken, Colour. Captions: Show, On hover, Hide.

**Group by for every type** (Area, Topic, Type, Collection, Month):
- The server orders by the group key, then by the sort.
- The client inserts section headers when the key changes, so paging (60 at a time) stays correct.
- An item tagged in two groups appears in both.

**Shelves.** Each Photos shelf gets "Open as a photo wall", and there's an **Unsorted** shelf (dashed edge).

**Files:**
- *new* `photo-wall.tsx`, `photo-layout.ts` (pure: justified rows, masonry and grid geometry, unit-tested) and `colour.ts` (Lab, ΔE, swatches);
- `card-media.tsx`, `media.ts`, `search.ts`, `library-shelves.tsx`;
- `files-schema.ts`, `processing.ts`, the worker.

**Done when:**
- 2,000 photos scroll smoothly in Rows at the smallest size on a mid-range laptop.
- Colour matches a hand-checked set of 50.
- The backfill has run on the owner's account.
- The worker and Trigger paths give equal palettes for the same file.

## 6. Phase 4: Picks, Views and sorting a pile (HIGH, migration)

**Migration (*new*):**
- **Picks:** `content_items.picked_at timestamptz null`. Picks apply to **every type** (decision H-D1).
- **Views:** `library_views (id, account_id, name, query jsonb, position, created_at)`. `query` is exactly the Phase 1 + 3 address state: type, collection, area, search and filters. Account-scoped, with the same isolation tests as other library tables.

**Picks.**
- **Where:** a ★ toggle on cards (on hover; always shown when picked), in the quick view (`P`), and in bulk.
- **Show:** the switch becomes All · Unsorted · ★ Picks.

**Views.**
- **In the search bar's Views slot:** "Views ▾" lists the saved Views with their type icon, plus "Save current as a View…".
- **An open View** becomes an accent pill in the bar with its name and ✕.
- **Saving** asks only for a name. A View holds no items.
- **Seed:** none. The learner makes the first one.

**Sort mode (photos).** A full-screen overlay over the unsorted photos, or over a selection.
- **Keys:** `1`–`9` toggle the learner's recent topics, `T` opens any topic, `K` cycles the kind, `P` picks, `A` gives the whole album the same topics, `→` / `←` move, `⌫` undoes, `Esc` closes.
- **Progress:** a bar and a strip, with a done state.
- **Entry points:** "Sort these N" in the slim bar, ⋯ → "Sort unsorted photos", and a desk slot on Shelves.

**Selection.**
- **Drag box:** starts anywhere on the wall in Select mode. A drag over 6 px starts it, and a short press is still a click.
- **Native image drag** is blocked on the wall.
- **Bulk actions gain:** Add topics…, Set kind…, ★ Pick and Sort these.

**Files:**
- *new* `sort-mode.tsx`, `views-menu.tsx`, `use-lasso.ts`, `src/features/library/views.ts` (repository and route) and `picks.ts`;
- `library-wall.tsx` (selection only; keep growth out of it), `library-schema.ts`;
- the HTTP routes under `src/app/api/library/`.

**Done when:**
- 200 photos can be given topics in under 10 minutes with the keyboard alone.
- Undo is exact.
- Views survive reload and other devices.
- Isolation tests cover `library_views`.

## 7. Phase 5: saving from the web (HIGH, migration)

- **Migration:** `images.source_url text`, `images.source_title text`.
- **Drop from another tab:** a dragged image from another tab carries a URL. The server fetches it through the SSRF-safe path that link previews use (`src/features/links/preview-image.ts`), then runs the normal ingest.
- **Paste:** pasting an image URL into the composer does the same.
- **Panel:** shows "From archdaily.com ↗", which is also searchable.
- **HEIC:** prebuilt sharp can't decode it. Decide in the phase spec between a browser-side WASM decoder and a decoder in the task (`library.md:134`). Test on a real iPhone.
- **Limits:** the existing ones apply (20 MB, 100 MP, 5 GB per account). Name failures plainly, e.g. "That site doesn't allow saving its images".
- **Out of scope:** a browser extension and a share target.

## 8. Phase 6: notes on a detail (HIGH, migration)

- **Migration:** a *new* `note_regions (item_id, x, y, w, h)` table, with fractions 0–1 of the original image. A Note keeps `about_id` pointing at the photo; the region is optional.
- **Viewer:**
  - `N`, or "Note on a detail", lets the learner drag a box. The composer then reads "Note on this detail".
  - Saved boxes show numbered; `R` toggles them.
  - Hovering a note lights its box, and the boxes stay in place under zoom and pan.
- **Optional:** cut the detail out as its own photo, linked back.
- **In Loci:** region notes appear as ordinary "Note on" links.
- **Files:**
  - *new* `region-layer.tsx` and `src/features/library/note-regions.ts`;
  - `photo-view.tsx` and `image-page.tsx`;
  - `annotations` code where margin notes are saved.

## 9. Phase 7: photos in Loci (HIGH, migration)

- **Migration:** `topics.cover_image_id uuid null`. It's set by "Use as topic picture" (quick view footer and ⋯).
- **Key picture:** the learner's cover, else the newest Pick on the topic or below it, else the newest photo. Computed by a *new* pure helper `topicKeyPicture` in `src/features/topics/`.
- **Map inspector:**
  - the key picture;
  - a **Mood** strip of 5 (Picks first);
  - **Colours of this topic** (combined from the palettes; a swatch opens that topic's photos in that colour);
  - "See all N photos".
- **Map:**
  - Lane thumbnails grow to 30 px for photos.
  - "Key picture in the centre" is a Map setting, off by default (PH-D4).
  - **Node colours never change** (D-2).
- **Show on Loci:** from ⋯ in the slim bar, for any type and filter. It highlights the topics that hold the results and dims the rest, with a bar offering "Back to Commonplace" and "Clear".
- **Palace:** only after Palace P2 rooms are built.
  - Photo items in an open, near room draw as small prints from `thumb`; far away they stay squares.
  - The rooms read adds `thumb: { url, w, h, dominant } | null`.
  - Frame budget as the Palace spec sets it (≥ 50 fps at 2,000 topics).
- **Files:**
  - new files beside `graph-workspace.tsx`, which is pinned at 1,962 lines;
  - `src/components/graph/map-node.tsx`, `src/features/topics/layout.ts`, `topics-schema.ts`;
  - the Palace files under `src/features/palace/` and `src/components/graph/palace/`.

## 10. Decisions for the owner

From the design document, with what the prototype now shows:

| ID | Question | Prototype shows | Recommendation |
|---|---|---|---|
| PH-D1 | Full-screen background | Dark mat in full screen only | Approve before Phase 2 |
| PH-D2 | Picks: one flag or 1–5 | One flag | One flag |
| PH-D3 | Default photo layout | Rows | Rows |
| PH-D4 | Key picture in the Map centre by default | Off, a setting | Off |
| PH-D5 | "More like this" by look as well as meaning | — | Decide in 3C |
| PH-D6 | Descriptive tags as a fourth axis | Not in the prototype | Phase 4 or later; decide before Phase 4's spec |
| PH-D7 | Screen names | Kind, Views, Picks, Unsorted, Sort mode | Yes |

New, from the header work:

| ID | Question | Recommendation |
|---|---|---|
| **H-D1** | Do Picks and Unsorted apply to every type, not only photos? | **Yes.** Unsorted (no topic) is useful for every type. Picks are one flag on `content_items`, the same cost for all |
| **H-D2** | The **To read** tab now overlaps the Sources Status filter. Keep the tab, or make it a built-in View? | **Keep the tab in Phase 1**; revisit once Views exist (Phase 4) |
| **H-D3** | **Objects** is in the type row with its collections (People, Buildings), though the prototype's sample has none | **Yes**; its own filter waits until there is a clear one |
| **H-D4** | Collections show only under their type, never under All | **Yes**, the owner's rule (Craft, Library polish notes) |
| **H-D5** | Phases 1 and 2 built in parallel by two agents | **Yes**, if the owner can test two branches; otherwise 1 then 2 |

## 11. Handing a phase to the building agent

For each phase, the agent:
1. reads this roadmap, the design document and the prototype README;
2. opens the prototype and tries that phase's rows in the README table;
3. writes the phase spec in `studiolo`, tier on line one, listing what it reuses, the files it touches, the migration if any, and its specimens;
4. for HIGH, waits for the approver's approval of that spec;
5. builds behind the switch, updates the guides, and runs the checks for its tier;
6. hands the branch to the owner with paired screenshots against the prototype, and does not merge until the owner says so.
