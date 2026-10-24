# Today, planned: design and phased build plan

Status: **design for owner approval, 24 October 2026.** Nothing here is built in `studiolo`, approved, or authorised (no migration, paid service or AI spend). Written in `Studiolo_Manage`; per its rules, `studiolo` is read-only from here.

- **Interactive prototype:** <https://claude.ai/artifact/1VqADPpUKHoKxKkFUmGwcj>. Each phase has its own link: `#phase1`, `#phase2`, `#phase3`, `#phase4`. The prototype bar also has a **Phase** select.
- **Prototype source:** [`prototypes/today-plan/`](../../../prototypes/today-plan/README.md) (`src/plan.js`, `src/plan.css`, `node build.mjs`). Screens and CSS are captured read-only from `studiolo` @ `48412aa`; names and the Loci panel follow `studiolo` @ `5fbb7f2`.
- **Adaptive overview:** [`prototypes/today-plan/adaptive-overview.png`](../../../prototypes/today-plan/adaptive-overview.png).
- **Builds on:** the Today spec (`studiolo/docs/superpowers/specs/2026-10-16-today-design.md`, §0 owner revision, §7 slices T1–T6, §9 decisions); Craft *Today*; the course engine (`studiolo/project-docs/architecture/course-engine.md` §5, §7.1); [Live Lumens](2026-10-21-live-lumens-voice-design.md); the [Lumen naming proposal](../../../proposals/2026-10-17-explainer-naming-studiolo-lumen.md).

---

## 0. How an AI agent should use this document

1. **Work one phase at a time, in order.** Each phase ships something usable on its own. Don't start a phase until the owner has tested and accepted the one before it.
2. **Read first** (in `studiolo`):
   - `AGENTS.md`;
   - `project-docs/README.md`, `project-docs/product/mvp-scope.md` (Stage 5) and `project-docs/workflow/README.md`;
   - `project-docs/implementation/frontend.md` § "Today (T1)";
   - `docs/superpowers/specs/2026-10-16-today-design.md`;
   - this document's section for the phase;
   - the prototype at that phase's link.
3. **Copy this spec into `studiolo`** as `docs/superpowers/specs/<date>-today-planner.md` on the phase branch. Then write that phase's plan under `docs/superpowers/plans/` as the workflow requires. Don't edit `studiolo` from `Studiolo_Manage`.
4. **Stop at every owner decision** marked **OD-n** in the phase (§10). An agent's recommendation is not approval.
5. **The `studiolo` rules always hold:**
   - one branch per phase;
   - no merge or push of `main` without the owner's word in the current conversation;
   - no code on `main` ahead of its migration on every hosted database;
   - update `project-docs/implementation/*` in the same branch;
   - visual comparison against the prototype at matching sizes, light and dark.
6. **The prototype is the visual reference** for layout, hierarchy, states and copy. It's built from the app's own CSS, so classes like `.td-*`, `.cp`, `.cp-reopen` and `.button` are the real ones. Its `pl-*` classes are new and should become production components. Don't port prototype-only things: the prototype bar, simulated time, scripted answers and sample data.

---

## 1. Summary

Today becomes a **learning-planning calendar**: the place where a learner's time lives.

- **Phase 1:** the Day and Week calendar with the right-hand side column, behaving exactly as Today does now. It shows only what happened, with no planning. No migration, no AI.
- **Phase 2:** add Lumens and Commonplace items to the calendar by hand, and move, start, skip and tick them. This is the first migration: sessions.
- **Phase 3:** learning time, weekly time per topic, a daily maximum, and routines (habits like a drive, holding audio only), with rule-based placement. This is the second migration.
- **Phase 4:** Loci plans. It proposes plan cards (dashed "ghosts" with Apply and Undo), goals that span topics, the Sunday review of the week and next week's plan, and fills routines. This brings AI spend.
- **Later, separately decided:** Gmail and Outlook calendar connections (shown greyed as "coming soon" from phase 1), and audio dialogues as content.

**Destination names** (live app, `src/components/shell/destinations.ts`): Today, Learn, Commonplace (the Library), Loci (the map, and the copilot's name). The destination stays **Today**: it's where people land each day, and planning is weekly.

---

## 2. Principles

1. **Nothing moves by itself.**
   - The head, the side column, the calendar box and the hour axis keep their positions when switching Day and Week, opening or closing Loci, proposing or applying a plan.
   - The hour height changes only when the window is resized.
   - Verify this by measuring element positions across states.
2. **Today owns time.** Learn is the shelf, Commonplace keeps sources, and Loci is the map. Today links into them and never duplicates them.
3. **The learner owns the calendar.** Hand edits always win. Rules and Loci only propose: Loci shows ghosts until Apply, and rule-based changes come with Undo.
4. **No guilt.** No streaks and no "you missed". Missed sessions roll forward quietly (Today spec anti-goals).
5. **Planning spends nothing.** A new Lumen is made the evening before its session (course parts when reached, the course engine's one-lesson-ahead rule).
6. **Words come from records.** The Big Picture uses template sentences (T-D2) until a written one is approved.
7. **Built from the live app's parts:**
   - Today's `.td-*` components;
   - Loci's own panel (`graph.css` `.cp`, `.cp-head`, `.cp-reopen`) and the composer and messages in `src/components/copilot/*`;
   - the app's tokens (`tokens.css`) and breakpoints.

---

## 3. Layout (all phases)

### 3.1 The frame

```
┌ rail ┬───────────────────────────────────────────────────────────────────────────────┐
│      │ Today  Wednesday 21 October                 [Learning time] [✦ Ask Loci /] 15:35 │  ← head (fixed)
│      ├──────────────────────────────────────────────────┬────────────────────────────┤
│      │ [Day|Week] ‹ › This week 19–25 Oct  [+ Add]  key │ My Focus          This week │  ← toolbar line = side head line
│      │ ┌ day headers / day strip (62px, sticky) ──────┐ │ ● Daylight & shading 1h45/2h│
│      │ │ hours │ Mon │ Tue │ … columns                  │ │ ─────────────────────────── │
│      │ │       │     │     │ blocks, bands, now line    │ │ Up next          Today 19:00│
│      │ │ (scrolls inside the box)                      │ │ ▌Read · Thermal mass …      │
│      │ └──────────────────────────────────────────────┘ │ ─────────────────────────── │
│      │                                                  │ The Big Picture             │
└──────┴──────────────────────────────────────────────────┴────────────────────────────┘
          calendar (flex)                       one hairline   side column (--t-panel)
```

- `.pl-frame` fills the main stage's height (`calc(100dvh - 88px)`). The page itself doesn't scroll on wide screens: the calendar scrolls inside its box, and the side column scrolls on its own.
- **The calendar is on the left and the side column on the right**, divided by one hairline (`border-left: 1px solid var(--line)`) that stays when Loci opens.
- **The side column is `var(--t-panel)` wide** (`clamp(360px, 32vw, 420px)`, the same as Loci's panel on the map). Loci opens *in* it, in place of its sections (§7).
- **The side column's first head sits on the calendar toolbar's line** (both 34px rows, 8px gap below).

### 3.2 Breakpoints (the live app's, from `src/styles/*`)

| Width | Layout |
|---|---|
| **≥ 1100px** | Two columns as above; Loci docks in the side column; the hour height fills the box (§3.3). |
| **981–1099px** (tablet landscape) | Same two columns; side column 300px; Loci is a bottom sheet (as `.cpwrap.is-drawer` on Loci); the toolbar legend is hidden; week columns min 60px. |
| **700–980px** (tablet portrait) | One column: My Focus, Up next, then the calendar, then the Big Picture (CSS `order`, side `display: contents`); Loci is a bottom sheet; the page scrolls. |
| **< 700px** (phone) | Same order; the app's top bar and tab bar; the week scrolls sideways inside its own box (columns min 64px); the toolbar wraps, title on its own line. |

The rail is 58px, or 72px with labels on touch at 700px and up (`shell.css`). The page never scrolls sideways at any width. The prototype checks 390, 768, 1024, 1180, 1440, 1920 and 2560.

### 3.3 The hour axis

- The calendar runs **06:00–23:00**.
- **Folding:** a run of hours with nothing in it folds into one 22px band labelled "12–15", spread evenly across the run.
  - Phase 1: hours with activity stay open.
  - Phase 2 and later: hours stay open if they hold learning time, a routine or a session (not proposals), plus the hour containing "now".
  - Day and Week compute folds from the **whole shown week**, so the axis is identical in both views.
- **Hour height:** on framed screens (≥ 981px), `H = clamp(56, floor((box height − 62 − folds × 22 − 6) / open hours), 112)`. Measure the box once on first paint; recompute only on resize. Stacked screens use 56px.
- Positions use a piecewise `Y(minute)` and its inverse `M(y)`. Dragging and click-to-add depend on `M`.

### 3.4 The toolbar

From the left:

1. **Day | Week** switch (`.pl-seg`, like the app's segmented controls).
2. ‹ › (a day in Day, a week in Week; this week and next only, until OD-12).
3. The title ("Today 21 October" or "This week 19–25 October"). It truncates before anything wraps.
4. **+ Add** (phase 2 and later).
5. **Connect · Gmail · Outlook**, greyed (§9.4).
6. The legend (phase 3 and later: Learning time, Routine, and in phase 4 Busy).

From 700px up the toolbar stays on **one line** so the axis never shifts. The connection chips show only where they fit (≥ 1600px when the legend is present), and are always in Learning time.

---

## 4. Calendar components

### 4.1 Day and Week

- **Week:**
  - Header row: one button per day (weekday, date, the day's planned time; red when over the daily maximum; a dashed dot when a proposal touches the day). Clicking a day opens it in Day.
  - Today's header has the accent underline.
  - Columns: hour lines, folds, bands, blocks, the now line.
- **Day:**
  - The header row is a **day strip** (7 buttons, the chosen one inked; a dot when the day has sessions or activity; a dashed dot for proposals) plus a one-line summary ("1 done · 3 to go · 1 h 05").
  - One wide column. Blocks show their reason ("why") when tall enough.
  - Past activity sits in the right part of the column (phases 2 and later) or across it (phase 1).

### 4.2 Bands (beneath blocks)

| Band | Look | Phase |
|---|---|---|
| Past | `--pl-past` wash above the now line | 1 |
| Now line | 1.5px `--warn` with a dot | 1 |
| Fold | `--board` with dashed edges, label in the hour column | 1 |
| Learning time | `--pl-avail` tint | 3 |
| Routine | teal `--pl-rt` with the mode's icon on the right edge; sessions inside leave 20px for it | 3 |
| Busy | hatched, "Busy · 17:00–18:30" (never event titles) | 4 (sample) / with connections |

### 4.3 Session blocks

- **Look:** soft topic colour fill and a 3px topic-coloured left edge, the same as the Up next card.
- **Label:** `HH:MM · Kind`, then the title.
  - Below 28px tall: one line.
  - Below 46px: one title line.
  - A second colour edge (inset) when a session also counts for a goal.
- **Kinds and labels:**

| Kind | Label | What it opens |
|---|---|---|
| watch | Watch | the Lumen player |
| read | Read | a reading Lumen (§4.5) |
| live | Live | Learn's live studio |
| review | Review | a quiz |
| course | Course | the course part |
| library | Source | the item in Commonplace |
| plan | Plan | Loci (phase 4) |
| listen | Listen | a dialogue (audio only) |
| aloud | Aloud | a spoken review |

- **States:**

| State | Look |
|---|---|
| planned | default |
| started | "· started" after the kind |
| done | panel fill, ✓ before the title |
| moved / skipped | dashed edge, faded, struck through |

- **Proposals** (phase 4):

| Proposal | Look |
|---|---|
| new | ghost: dashed outline, `--ghost-soft`, "· New" |
| moved | ghost at the target ("· Move"), source faded and struck through |
| changed | "· Change" |
| dropped | warn fill, struck through, "· Drop" |
| linked to a goal | dashed outline in the goal's colour |

- **Topic colours:** a, b and c for the three My Focus topics (accent blue, entity green, myfocus amber) and d for a goal (violet). Each has a light and a dark value (prototype `:root` tokens `--tr-*`).

### 4.4 Session details (popover)

Opened by clicking a block:

- kind and format;
- title (reading face);
- day, time and length;
- topic › sub-topic, and the goal if any;
- status;
- when it's made ("Ready · made last night", "Made the evening before · nothing is spent until then", "Already in your Commonplace", "Made when you reach it");
- for routines, "In Drive to work · audio only…";
- the reason, in quotes;
- **actions:** Start (the kind's verb), **Next free time**, **Skip** (rolls forward), Remove. Proposals get "Leave this out of the plan".

### 4.5 The reading Lumen

A long HTML lesson, the course engine's `reading` format (`course-engine.md` §7.1, §12.4):

- a sticky bar ("‹ Today", the topic, "Ask about this page", a progress line);
- the title, a question line, and planned-for metadata;
- sections with headings, paragraphs, lists, **Key idea** and **On site** callouts, an SVG chart drawn to scale with a legend, a table with "indicative" notes, a few sentences to use with a client;
- a 3-question quiz with instant feedback;
- sources that separate *your Commonplace* from *general knowledge*;
- **Done reading**, which ticks the session and keeps the score.

On wide screens there's a contents list on the right. The model writes typed blocks, never HTML (course engine principle). The prototype's lesson is *Thermal mass in hot-arid courtyard houses*.

### 4.6 Interactions

- **Drag** (phase 2 and later, Day and Week): the block follows the pointer and lands on the nearest free 5-minute time on the drop day.
  - Never in the past.
  - In phase 3 and later, never in a routine whose mode doesn't allow its kind.
  - Toast "Moved to Thu 20:00", with the reason if the time was adjusted, and **Undo**.
- **Click an empty hour** (phase 2 and later): opens Add with that day and quarter-hour.
- **Keyboard:** blocks are buttons in time order. Escape closes popovers and dialogs. `/` opens Loci (phase 4).

---

## 5. Side column components

All three sections share one head style: 13px semibold and a muted note on the right. The first head is 15px and sits on the toolbar line. Sections are separated by hairlines.

### 5.1 My Focus (first)

- **Phases 1–2:** status, as Today now shows (`focusTopics` in `src/features/today/model.ts`). Each row has a colour dot, the name, the status on the right ("Learning"), and a line under it: what's waiting ("1 new Lumen", "2 suggestions waiting"), or in phase 2 "N sessions this week".
- **Phase 3 and later:** the week's time per topic. The name on the left, "1 h 45 / 2 h" on the right (warn when short), and a 4px bar (planned faint, done solid).
  - A goal row has a diamond dot, a violet name and "16 days".
  - It doubles as **the calendar's colour key**.

### 5.2 Up next / Continue (second)

- **Phase 1: Continue**, as `continue-card.tsx` does now: the kind pill and topic, the title, "2:41 of 4:38 · you paused at …", **Continue watching** and **Ask Loci ↗**, then "Also in progress: …".
- **Phase 2 and later: Up next**, the next planned session today, else the next one ahead:
  - drawn like its calendar block (soft fill and coloured edge);
  - the kind pill, length and sub-topic (and routine name);
  - the title;
  - **Start** (the kind's verb), **Later** (next free time) and **Skip**;
  - "Continue …" for anything half-done underneath.

### 5.3 The Big Picture (third)

A short paragraph in the reading face, with records as italic accents, and one muted line. Template sentences only:

| Phase | Sentence |
|---|---|
| 1 | "This week you watched or read *four Lumens* and saved *three things* to your Commonplace. *Daylight & shading* is in focus and has a new Lumen you haven't seen." / "5 of 24 topics on your map are learned." (T1 `bigPicture`) |
| 2 | "You've done *3 of 11* sessions this week. One was moved rather than dropped." / "Next week: 2 planned so far". |
| 3 | Adds "*Plan types & ritual* is 45 min short." |
| 4 | Adds a goal ("*Client presentation* is in 16 days") and "· weekly plan on Sunday". |

---

## 6. Data model (proposed)

The existing tables these phases read:

| Table | Used for |
|---|---|
| `explainers`, `explainer_views`, `explainer_series` | Lumens, progress, courses |
| `content_items`, `library_entries` | Commonplace items |
| `topics` | status; My Focus as read by `focusRows` |
| `copilot_conversations`, `copilot_messages`, `copilot_proposals` | Loci |
| `account_preferences` | time zone |

The latest migration is `0024`.

### 6.1 Phase 2: `0025_learning_sessions.sql` (OD-1)

```sql
create table studiolo.learning_sessions (
  id            uuid primary key default gen_random_uuid(),
  account_id    uuid not null references studiolo.accounts(id) on delete cascade,
  starts_at     timestamptz not null,                 -- stored in UTC; shown in account_preferences.time_zone
  minutes       smallint not null check (minutes between 5 and 240),
  kind          text not null check (kind in ('watch','read','live','review','course','library','plan','listen','aloud')),
  title         text not null check (char_length(title) <= 200),
  explainer_id  uuid null references studiolo.explainers(id) on delete set null,
  series_id     uuid null references studiolo.explainer_series(id) on delete set null,
  part_key      text null,
  content_item_id uuid null references studiolo.content_items(id) on delete set null,
  topic_id      uuid null references studiolo.topics(id) on delete set null,   -- the sub-topic
  track_topic_id uuid null references studiolo.topics(id) on delete set null,  -- the My Focus topic it counts for
  goal_id       uuid null,                              -- phase 4 (learning_goals), no FK until then
  status        text not null default 'planned' check (status in ('planned','started','done','moved','skipped')),
  result        text null,                              -- "Watched", "2 of 3 right", "Read · 1 of 3 first try"
  score         smallint null,
  moved_to_id   uuid null references studiolo.learning_sessions(id) on delete set null,
  origin        text not null default 'learner' check (origin in ('learner','rule','loci')),
  reason        text null check (char_length(reason) <= 200), -- the "why" line
  make          text not null default 'none' check (make in ('ready','evening','course','exists','none')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  version       integer not null default 0
);
create index learning_sessions_account_time on studiolo.learning_sessions (account_id, starts_at);
```

`origin`, `reason`, `goal_id`, `make`, `moved_to_id` and the `listen`/`aloud` kinds are included now, so phases 3 and 4 don't need to rework the table.

### 6.2 Phase 3: `0026_learning_time.sql` (OD-6)

- `learning_windows (account_id, weekday 0–6, starts_min, ends_min)`. Seeded with defaults on first use: weekdays 07:00–08:00 and 19:00–21:00, Saturday 09:00–12:00, Sunday 17:00–19:00.
- `account_preferences` gains `daily_max_minutes smallint default 90`.
- `topic_weekly_targets (account_id, topic_id, minutes)`, for My Focus topics.
- `learning_routines (id, account_id, name, mode in ('driving','cycling','walking'), weekdays smallint[] , starts_min, ends_min, created_at)`.

### 6.3 Phase 4: `0027_learning_goals.sql` (OD-10)

- `learning_goals (id, account_id, name, note, until date, minutes_per_week, created_at)`.
- `learning_goal_topics (goal_id, topic_id)`.
- Plan cards: reuse `copilot_proposals` and `copilot_proposal_items` if their shape fits (a new proposal kind `plan`, items `add | move | drop | link | convert`), else a `learning_plan_proposals` table. Decide with the S1/S2 change-plan work.

---

## 7. Rules (deterministic; phase 2 onwards, extended in 3)

These live in one pure module, for example `src/features/today/plan-rules.ts`, unit-tested, used by the server and by Loci's tools.

- **`free(day, start, minutes, kind)`:**
  - inside 06:00–23:00;
  - no overlap with another planned, started or done session;
  - no overlap with busy time (phase 4 or with connections);
  - from phase 3, inside a routine only if the routine's mode allows the kind and the session fits in it.
- **`fits(...)`:** `free`, not in the past, and either inside a routine, or inside learning time with the day's non-routine minutes plus this one at most the daily maximum.
- **`place(minutes, {from, to, preferDay, preferStart}, kind)`:** the preferred slot if it fits. Otherwise the first fitting 5-minute start, preferred day first, then later days, then earlier ones in range. Audio kinds try routine windows first.
- **`nearest(day, start, minutes, kind)`:** for drags and click-to-add. The closest free start that day, any hour, never in the past. It ignores learning time and the maximum, because the learner's choice wins.
- **Skip:** the original becomes `moved`, and a copy is placed with `place` from the next day ("Moved from Tuesday, when you skipped it"). Missed sessions (past, still planned) are offered the same treatment, never automatically in phase 2. From phase 3, rolling forward automatically is a setting (OD-8).
- **Later:** the next fitting start after the current one, the same day first.
- **Busy lands on a session** (phase 4, or with connections): move it with `place` from the busy end, or mark it "clashing", depending on the setting.
- **Routines (phase 3):**
  - Mode → allowed kinds:

    | Mode | Allowed kinds |
    |---|---|
    | driving | listen, aloud |
    | walking | listen, aloud |
    | cycling | listen |

  - Routine minutes don't count towards the daily maximum, but do count towards weekly targets.
  - When a routine is added:
    1. A planned `watch` inside it whose sub-topic rates **good by ear** becomes `listen` in the same slot (convert).
    2. Other screen sessions move to the evening (`place` with an evening preference).
    3. Each empty routine day fills with dialogues of up to 25 minutes (window − 5 spare), from the topic shortest of its weekly target, preferring "good" sub-topics.
    4. If the previous evening had a desk session (read, watch or course) on a good or fair sub-topic, and the mode allows `aloud`, it starts with a 10-minute spoken review of it. This is the desk-then-ears loop.
  - **By-ear ratings** live in data (OD-9), for example `{Glare: poor, "it's about what you see"}`.

---

## 8. Phases

Each phase: goal, scope, data, UI, acceptance, tests, decisions. "Prototype" points at the matching link.

### Phase 1: Day/Week calendar and the side column, as Today behaves now

**Prototype:** `#phase1`.

**Goal:** the new Today layout with no new behaviour. Today T1's data in the planner's frame.

**Scope:**
- Replace T1's composition (`today-page.tsx`, `today-sections.tsx`, `today.css`) with §3's frame, keeping T1's data (`loadToday` in `src/features/today/service.ts`):
  - `calendarEntries` → activity on the calendar (watched or read, saved, Loci chats), placed at their hour;
  - `continueView` → the Continue card;
  - `focusTopics` → My Focus status rows;
  - `bigPicture` → the paragraph.
- **The calendar:**
  - Day and Week, ‹ › through this week and last week (OD-12), folding by activity, the now line, the past wash.
  - Week columns show compact entries; Day shows title and kind.
  - The week header shows "N done" per day.
- **The side column:** §5 in phase 1 form. **Ask Loci ↗** links to Loci on the map (`/graph?scope=map`, as `continue-card.tsx` does); no docked panel.
- **The toolbar:** Day | Week, ‹ › and the title. **Connect · Gmail · Outlook** greyed with "… calendar · coming soon" on hover, focus and click (OD-14 decides whether phase 1 shows it).
- Keep the T1 gates, **Later today**, section errors (each section fails on its own, with Try again), new-learner and away states, and the `TODAY` switch.
- Responsive per §3.2; light and dark; reduced motion.

**Out of scope:** adding, moving, learning time, Loci in the panel, busy times.

**Data:** none new. **Migration:** none. **AI:** none.

**Acceptance:**
1. Day and Week show the same activity as T1's rail, at the right hours in the account's time zone.
2. Positions (head buttons, calendar box, side column, the 7:00 line) are identical in Day and Week at 1440×900, 1180×820 and 1920×1080.
3. No sideways page scroll at 390, 768, 1024, 1180, 1440, 1920 and 2560. Order and placement match §3.2.
4. Continue, My Focus and the Big Picture show T1's content and states (new learner, away 14+ days, nothing half-done, a failing section).
5. Axe passes on Today in light and dark at 1280×800 and 390×844.

**Tests:** unit (activity → positions, folds, `Y`/`M`), E2E (Day/Week switch, Ask Loci link, position stability), visual comparison with `#phase1`.

**Docs:** `project-docs/implementation/frontend.md` § Today, and `project-docs/design/interface.md` if new patterns are added (the side column, the calendar).

### Phase 2: add and move by hand; a deeper calendar

**Prototype:** `#phase2`.

**Goal:** the learner plans their own sessions.

**Scope:**
- **Migration `0025_learning_sessions`** (§6.1) and its repository and service (CRUD scoped to the account, optimistic `version`).
- **Add** (toolbar **+ Add**, or click an empty hour). The picker has three tabs:
  - **Lumens:** existing Lumens, reading Lumens, course parts and review quizzes, with progress and "already planned Thu 19:00";
  - **Commonplace:** items with where you stopped (PDF page, video time) or "Your note";
  - **Explain a topic:** a sub-topic of My Focus becomes a *new* Lumen "made the evening before · uses one Lumen". This is OD-3: it spends at make time.
  - Plus search, Day, Time (quarter hours, not past) and Length. The button names the slot ("Add to Thu 19:00"). It lands on `nearest`, with a toast and **Undo**.
- **Move:** drag in Day and Week (`nearest`), **Later** (next free time) and the Undo toast.
- **Start:** each kind opens its place (§4.3). Finishing records `done` with its result. Lumen progress (`explainer_views`) also marks a session done if it's watched in the session's window (OD-4).
- **Skip:** rolls forward with `place` and shows "Moved from Tuesday".
- **Remove:** the item stays in Learn or Commonplace.
- **Up next** replaces Continue (§5.2). My Focus shows "N sessions this week". The Big Picture uses the phase 2 sentence.
- **Making a Lumen the evening before** (only for "Explain a topic"): a scheduled job uses the existing generation path (`generateQuick` in `src/features/explainers/service.ts`, cap-checked) at a fixed local evening time. If the cap is reached, the session says so and offers "Make it now" or "Remove" (OD-3).

**Out of scope:** learning-time windows (placement uses the default windows hard-coded, OD-5), targets, routines, busy times, Loci.

**Acceptance:**
1. Adding from each tab creates a session at the chosen slot or the nearest free one, never in the past, never overlapping.
2. Drag, Later, Skip and Remove work in both views, each with Undo. Done sessions are ticked; a skip leaves a struck-through original plus a placed copy.
3. Sessions survive reloads and are scoped to the account; two tabs don't lose edits (version check).
4. No AI spend except the Lumens made from "Explain a topic", which count against the existing monthly cap.
5. Phase 1's acceptance still holds (position stability, responsive, Axe).

**Tests:** unit (`plan-rules`: `free`, `nearest`, `place`, skip), integration (repository against a test database), E2E (add from each tab, drag, skip, undo).

**Docs:** `database.md` (the new table), `backend.md` (session API), `frontend.md` (Today), `mvp-scope.md` (Stage 5 status).

### Phase 3: learning time and habits

**Prototype:** `#phase3`.

**Goal:** the calendar knows when you learn, how much each topic should get, and the routines you already have.

**Scope:**
- **Migration `0026_learning_time`** (§6.2).
- **The Learning time dialog** (head button):
  - windows per weekday;
  - **Each week**, a target per My Focus topic;
  - **Each day**, a maximum;
  - **Routines**: mode, days, from–to, **Add routine** and Remove;
  - **Calendars**, Gmail and Outlook greyed as coming soon;
  - plan around busy times;
  - move sessions when something new lands.
- **The calendar:** learning-time tint, routine bands, and the legend in the toolbar.
- **My Focus** shows hours (§5.1). The Big Picture adds the "short" sentence. Day headers turn red over the maximum.
- **Rules** (§7) use the windows, targets and routines. **Add routine** runs the routine rules and applies them at once with a toast ("Morning drive added · 10 changes") and **Undo**, with no Loci.
- **Audio formats:** `listen` (dialogue) and `aloud` (spoken review) sessions can be added by hand and are placed in routines by rule. Their content depends on OD-7:
  - dialogues are a separate roadmap item;
  - until they exist, routines hold spoken reviews and existing Lumens marked "audio-safe".
- **Rule-based suggestions** (no AI): a spaced review after a session or quiz (course engine §5.5), and filling a topic that's short. Both are offered as a toast or row with **Add**, never applied silently (OD-8).

**Out of scope:** Loci, goals, real calendar connections.

**Acceptance:**
1. Windows, targets, the maximum and routines persist and drive placement. Nothing is placed outside the windows or over the maximum, except by the learner's own hand.
2. Adding a driving routine on weekdays 07:00–07:30:
   - converts good-by-ear Lumens in that time to dialogues;
   - moves screen sessions to the evening;
   - fills empty drives;
   - opens a drive with a spoken review after an evening desk session;
   - does all this in one change with one Undo.
3. Screen kinds can't be dropped into a routine. The toast says why and where the session went.
4. Routine minutes count towards targets but not towards the daily maximum.

**Tests:** unit (routine rules, by-ear conversion, the loop, targets), E2E (Learning time dialog, add and remove routine, undo).

**Docs:** `database.md`, `backend.md`, `frontend.md`, and the Today section of `interface.md`.

### Phase 4: Loci plans

**Prototype:** `#phase4` (the default).

**Goal:** a conversation plans and re-plans the week.

**Scope:**
- **Loci on Today:**
  - The **"✦ Ask Loci /"** pill (`.cp-reopen`) in the head **stays visible** while Loci is open; pressing it again focuses the field. `/` opens Loci.
  - Loci opens **in the side column**: Loci's panel card, with the "LOCI · TODAY" kicker, the fold button and the serif title "Your plan", "✦ Loci" replies and the live composer.
  - On tablets and phones it's a bottom sheet.
  - The hairline stays, and the calendar keeps its size, position and view.
- **Tools** (in `src/features/copilot/tools/`, registered in `index.ts`):
  - `read_plan` (read): the week's sessions, windows, targets, routines and busy times, plus results;
  - `propose_plan` (change): returns a plan card of operations `add | move | drop | link | convert`, plus optional `goal` and `routine`, each with a reason;
  - `review_week` (read): the facts for the Sunday review.
  - Every operation is validated by the §7 rules before it's shown.
  - The model's prompt includes the by-ear ratings and the rules; it never invents results.
- **The plan card** (in the thread):
  - title and summary ("3 new · 1 moved · 25 min added");
  - optional **How the week went** (stats and lines from records), **New goal** and **New routine** boxes;
  - rows grouped by day, each with a checkbox, a glyph (+ → − ◆ ⇄), the title, what changes and the reason;
  - **Apply to my calendar**, **Not now** and **Show on the week**;
  - states: pending, applied with Undo, undone, dismissed, and "Replaced by a newer plan".
  - While it's pending, ghosts show on the calendar and dashed dots mark the days. Unticking a row removes its ghost. **Nothing changes until Apply.**
- **Goals:** "presenting to a client on 6 November" becomes a goal drawing on existing topics. Its sessions count for both, and My Focus shows a goal row.
- **The weekly plan:** a Sunday `plan` session (default 17:30) opens Loci with "Plan next week". The review uses records (done, missed, quiz scores), and next week's plan carries over missed sessions, adds reviews for shaky quizzes, and drops what's already known.
- **Busy times:** sample data until connections (OD-13); the "something new lands" behaviour.
- **Cost:** Loci replies at the existing copilot model and limits (`copilot/turn.ts`). Planning makes nothing; Lumens are made the evening before.

**Acceptance:**
1. Each prototype suggestion yields a valid card whose ghosts, Apply and Undo behave as in `#phase4`: the rest of the week, a client goal, a drive routine, a lighter Saturday, next week.
2. Applying never violates §7. Rejected operations are dropped with a reason, never applied.
3. Opening or closing Loci and proposing or applying a plan moves nothing (position test as in phase 1).
4. Evals: a set of conversation cases with expected operation types, and zero rule violations.

**Docs:** `ai.md` (required for any AI change), `backend.md`, `frontend.md`, `architecture/*` (planner).

### Later, separately

- **Gmail and Outlook connections** (OD-13): OAuth, free/busy only, never titles, privacy and terms review, per-provider rate limits.
- **Audio dialogues** (OD-7): a format of two voices, made the evening before, with chapters that end at natural pauses. Routines plan them from phase 3.
- **Inferring routines from usage** (OD-11): not without explicit consent.

---

## 9. Copy

### 9.1 Names

- Today, Learn, Commonplace, Loci.
- A **Lumen**, a **reading Lumen**, a **live session**, a **review quiz**, a **course part**, a **dialogue**, a **spoken review**.
- A **routine**, **learning time**, a **goal**, a **plan**.
- Don't use "copilot" in copy; it's **Loci**.

### 9.2 Phrases from the prototype

| Where | Copy |
|---|---|
| Up next actions | Start reading · Watch · Go live · Start the review · Open in Commonplace · Listen · Start, hands-free · Later · Skip |
| Toasts | "Added to Thu 22 19:00" · "Moved to Fri 23 07:20 · The nearest free time." · "Skipped · I've moved it to Friday at 07:00, the next free learning time." · "Plan applied · 6 changes on your calendar." · "Morning drive added · 10 changes on your calendar." |
| Making | "Ready · made last night" · "Made the evening before · nothing is spent until then" · "Already in your Commonplace" · "Made when you reach it, like every course part" |
| Routines | "Audio only · no screen · questions answered aloud · stops cleanly between chapters" (driving) · "Audio only · no talking back · short chapters" (cycling) |
| Learning time | "A routine is time you spend anyway, like a drive. It holds audio only and doesn't count towards the daily maximum." |
| Calendars | "Gmail calendar · coming soon" · "Coming soon. Studiolo will read only busy and free, never event titles." |

### 9.3 Never

Streaks, "you missed", event titles from a calendar, AI text presented as records.

### 9.4 Calendar connections (all phases)

- **Gmail** and **Outlook** are greyed buttons with `aria-disabled="true"`.
- They stay focusable, and a tooltip reads "… calendar · coming soon" on hover, focus and click.
- They're shown in the toolbar where it fits, and always under Learning time → Calendars (phase 3 and later).

---

## 10. Owner decisions

| # | Decision | Recommendation | Phase |
|---|---|---|---|
| OD-1 | Sessions table (`0025`) as in §6.1, including future fields | Approve | 2 |
| OD-2 | Phase 1 replaces T1's layout behind the existing `TODAY` switch (no new switch) | Yes, same switch | 1 |
| OD-3 | "Explain a topic" plans a new Lumen made the evening before (spends one Lumen against the cap) | Yes, with a visible "uses one Lumen" and a failure path | 2 |
| OD-4 | Watching a Lumen in its session's window ticks the session automatically | Yes, within ±60 min of the window | 2 |
| OD-5 | Phase 2 places with fixed default windows (editable from phase 3) | Yes | 2 |
| OD-6 | Learning time, targets, maximum and routines tables (`0026`) | Approve | 3 |
| OD-7 | Audio content before or with phase 3: dialogues (new format) vs. "audio-safe" Lumens plus spoken reviews only | Ship phase 3 with spoken reviews and audio-safe Lumens; dialogues as their own project | 3 |
| OD-8 | Rule-based roll-forward and suggestions: automatic or offered | Offered (toast or row with Add); automatic roll-forward as a setting, off by default | 3 |
| OD-9 | Where by-ear ratings come from (curated per sub-topic, model-rated once, or learner-set) | Model-rated once when a topic is created, learner can change | 3 |
| OD-10 | Goals table and plan cards on `copilot_proposals` vs. a new table | Reuse proposals if the S1/S2 change-plan work allows | 4 |
| OD-11 | Inferring routines from usage | Not now | later |
| OD-12 | How far ‹ › goes (past weeks, weeks ahead) | Phase 1: this and last week; phase 2+: up to 4 weeks ahead | 1–2 |
| OD-13 | Gmail and Outlook connections (OAuth, privacy review) | After phase 4, as their own project | later |
| OD-14 | Show "coming soon" calendar chips from phase 1 | Yes, under Learning time from phase 3; toolbar chips optional | 1 |

---

## 11. Risks

| Risk | Mitigation |
|---|---|
| The calendar looks empty in phase 1 (no future) | Honest empty future; strong Continue and My Focus; phase 2 follows closely |
| Time zones and DST | Store UTC, render in `account_preferences.time_zone`; tests across a DST change |
| Spending on planned Lumens | Only "Explain a topic" spends, at make time, cap-checked, shown in the picker |
| Rules and Loci disagreeing | One rules module used by both; Loci's operations validated before showing |
| Layout shifts | Position tests in CI at three sizes (§8, phase 1 acceptance 2) |
| Driving safety | Audio only, no required interaction, spoken reviews optional (OD-7); never prompt while a routine is in progress |

---

## 12. What the prototype simulates

| Simulated | How |
|---|---|
| Time | Wednesday 21 October 2026, 15:35 |
| Week outcomes | "Skip to Sunday" |
| A busy time landing | "A meeting lands on Thursday" |
| Playback | watch, live, listen and the Commonplace item |
| Loci's answers | scripted, or written by Claude through the artifact's `sample` capability when allowed; the Claude path is untested |
| Lesson writing | reading Lumens other than the thermal mass one are written by Claude when allowed |
| Data | all learner data is sample data |
