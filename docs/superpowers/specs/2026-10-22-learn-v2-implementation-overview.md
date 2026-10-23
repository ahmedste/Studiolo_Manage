HIGH (a programme of seven phases; each phase states its own tier)

# Learn v2: one Lumen, three formats, then Live. Implementation overview

> **Superseded for order and scope** by [`2026-10-23-learn-roadmap-design.md`](2026-10-23-learn-roadmap-design.md) (the owner's five phases, 23 Oct 2026). Its reuse map (§3) and Listen and Live detail (§6) are still useful references.

**For:** the agent implementing this in `studiolo`. Read it first, then the prototype. **Status:** recommendation by Claude, 22 Oct 2026, for owner approval phase by phase. Nothing here is approved until the owner says so in the conversation.

**Checked against:** `studiolo` main @ `5fbb7f2` (read-only). Every path below exists on that commit unless marked *new*.

## 0. What to read, in order

1. **This overview:** the phases, the reuse map and the decisions.
2. **The prototype:** `studiolo_manage/prototypes/learn-lumens/dist/learn-lumens-prototype.html`, with its `README.md`. It's published as *Learn, One Lumen*. Open it in Chrome and click through the README's "Try it" list.
3. **Design specs, in `studiolo_manage/docs/superpowers/specs/`:**
   - `2026-10-22-learn-slice-2-one-lumen.md`: the information architecture, the formats, the dock, and the format colours.
   - `2026-10-22-learning-forms-and-dialogues.md`: the Listen format, the brief, driving (§2.7), and other forms to add later.
   - `2026-10-22-learn-live-slice-1.md`: the eight Live behaviours.
   - `2026-10-21-live-lumens-voice-design.md`: the voice architecture, tools, confirm guard, cost and privacy for Live.
4. **The app's own rules:**
   - `AGENTS.md`;
   - `project-docs/README.md`, `product/mvp-scope.md` and `workflow/README.md` (tiers and "Proportional checks");
   - `project-docs/design/interface.md`;
   - the naming specs in `docs/superpowers/specs/`: `2026-10-21-lumens-rename.md` and `2026-10-21-naming-loci-commonplace-design.md`.

### How to treat the prototype

- **It's a design reference, not code to port.** It's captured static DOM from `/dev/specimens` plus vanilla JS. Rebuild every screen with the app's React components and CSS. Where the prototype already uses an app class (`lx-*`, `xp-*`, `destination-*`, `vtoast`, `jobs-card`, `graph-dialog`, `cp-*`, `.button`), that's the component to reuse.
- **Match the behaviour and layout.** For colours, use the tokens in `src/styles/tokens.css` (§5), never the prototype's literals.
- **Ignore what the prototype fakes:**
  - `window.claude` sampling (production uses `callModel` and Trigger tasks);
  - browser speech voices (production uses ElevenLabs);
  - the "hold to talk" simulation;
  - all sample data;
  - the stand-in Read page;
  - the "Prototype · slice 2" bar.
- **The app's names win over the prototype's.** Learners see **Lumens**, **Loci** (not Graph), **Commonplace** (not Library) and **Ask Loci** for the assistant. Code keeps `explainer`, `graph`, `library` and `copilot`. Where the prototype says "Library" or "Graph", use the app's word.

## 1. The model, in one table

| Thing | Meaning | In code |
|---|---|---|
| **Lumen** | One idea, explained for this learner, made from one **brief** (question, goal, topic, sources, what they already know) | *new* grouping over `explainers` (§4) |
| **Format** | How it's taken in: **Watch** (slides and a narrator, today's explainer), **Listen** (two voices, 10–30 min), **Read** (a long read, 10–20 min) | `explainers.format` (*new*) |
| **Edition** | A variant of a format. Today: Listen's **drive edition** | `explainers.edition` (*new*) |
| **Live** | Not a format: talking a Lumen through now, with the learner cutting in. Sessions are kept 30 days and can be kept as a Lumen. | voice sessions (*new*, Phase 6) |
| **Course** | A series of Lumens (its parts) | `explainer_series` (exists) |

## 2. Recommended phases (Live last)

| # | Phase | What the learner gets | Tier | Migration | Switch |
|---|---|---|---|---|---|
| 0 | Foundations and spikes | Nothing visible. The data model, format tokens, shared components and a voice cost spike. | HIGH (migration) | yes: `lumens` / `format` | `LEARN_V2` (closed) |
| 1 | Learn reorganised, Watch only | Tabs Home · Lumens · Courses; Lumen cards with format pills; the Lumens filters; the format switcher on the player | MEDIUM | no | `LEARN_V2` |
| 2 | The brief | "Make a Lumen" with a one-line brief preview and **Tailor…**: goal, topic, several sources, already known, length | HIGH (AI input) | maybe (brief snapshot) | `LEARN_V2` |
| 3 | **Read** | A standalone long read as a format: + Read, the reader page, sources quoted | HIGH (AI, new purpose) | no, if Phase 0 added `format` | `LUMEN_READ` |
| 4 | **Listen** | Two-voice audio Lumens, chapters written one ahead, the Listen page, the mini player, Walk mode, marks to Commonplace, a recall question, asking the hosts by typing | HIGH (AI, spend, worker, speech) | yes (positions, marks origin) | `LUMEN_LISTEN` |
| 5 | Drive edition and phone audio | Drive rules in the brief, Drive mode, lock-screen and wheel controls, interruptions, offline | HIGH (AI rules) / MEDIUM (player) | no | `LUMEN_LISTEN` |
| 6 | **Live** | Live in the bar and the switcher; the live player; the dock's transcription strip; interruptions, asides, Keep, Resume | HIGH (voice, spend, legal) | yes (`voice_sessions`, ledger) | `LIVE_LUMENS` |

### Why this order

- **Live last (agreed with the owner's instinct).**
  - There's no voice code in the app at all: no microphone, `getUserMedia` or realtime voice.
  - Live is the biggest unknown in cost, latency and Safari support, and it has a legal blocker (voice data terms).
  - It also needs what the earlier phases build: decks to perform (Watch), the brief, the dock and the transcript.
  - Every earlier phase is useful without it.
- **Read before Listen.**
  - It's half-built already. `src/features/explainers/reading.ts` writes a 400–700-word sanitised, cited HTML **Reading** node (kind `reading`) for course parts, shown by `src/components/courses/course-below.tsx`.
  - It's text only, so there's no audio infrastructure or voice cost.
  - It proves the multi-format model and "+ Format" cheaply.
- **Phase 1 changes no AI and no data,** so the new information architecture can be judged on real Lumens before anything costly.
- **One spike runs early, in Phase 0, with no UI:** measure two-voice TTS cost per minute and voice consistency on today's ElevenLabs setup. The Listen cost (estimated $4–5 per 20 min) decides Phase 4's caps.

## 3. Reuse map: prototype → existing app code

| Prototype piece | Reuse in the app | Change |
|---|---|---|
| Learn page and tabs | `src/app/(workspace)/learn/(list)/page.tsx`, `DestinationHeader` (`src/components/shell/destination-header.tsx`), `src/components/shell/destinations.ts` (today one tab, "Lumens"; its comment says the others wait for Stage 4) | Add Home · Lumens · Courses behind `LEARN_V2`. Courses shows only when `isCoursesOn()`. |
| Lumen cards | `ExplainerList` (`src/components/explainers/explainer-list.tsx`), `ExplainerPoster` (`poster.tsx`), `AnchorTag`, `lx-*` styles in `src/styles/learn.css` | Wrap in a *new* `LumenCard`: format pills, a poster flag, Live. Listen and Read posters are *new* variants. |
| Continue | `ContinueCard` + `pickContinueEntry` (`src/features/explainers/learn/model.ts`), `readView` / `saveView` (`learn/repository.ts`, `explainer_views`) | Pick across formats; add "Also in progress" |
| Area chips, grouping | The private `TopicFilter` in `explainer-list.tsx`; `groupByDay` / `chipRows` in `learn/model.ts` | Extract `TopicFilter`. Add a format filter (incl. Live sessions in Phase 6) and a *new* `groupByTopic`. |
| "Making · Watch" rows | `JobsProvider` / `JobsCard` (`src/components/explainers/jobs-card.tsx`), `MAKING_POLL_MS` polling of `/api/explainers/:id/snapshot` | Prefer the existing jobs card over new inline rows; add the format to its titles |
| Toasts | `useToast` (`src/components/foundations/toaster.tsx`), `toasts.css` | As is |
| Make a Lumen / Tailor | `ExplainDialog` (`src/components/explainers/explain-dialog.tsx`), `ExplainItemButton`, the copilot `explain` tool (`src/features/copilot/tools/explain.ts`) | The Home bar is *new*. Tailor grows out of `ExplainDialog` into a sheet or page with the format first. The copilot tool gains `format`. |
| Brief | `collectBriefContext` (`src/features/explainers/repository.ts`), `buildQuickBrief` / `renderBrief` (`contract/brief.ts`), `job-input.ts`, `readLearnerLine` (`src/features/onboarding/learner.ts`), item grounding (`sources/prepare.ts`, `ingest/citations`) | Add goal, several sources, already-known and format. A contract text change bumps `CONTRACT_VERSION` (`types.ts`, now 1.6) and re-records the job-input golden on purpose. |
| Watch page | `renderPlayer` (`player/player-page.tsx`), `Player`, `stage/*`, `Captions`, `transcript.tsx`, `use-playback.ts` | Add the format switcher to the player head. In Phase 6 its Watch/Live half also switches modes. |
| Read page | `reading.ts` (`readingPayload`, `sanitiseReading`, `READING_WORDS_PER_MINUTE`), `course-below.tsx` | Standalone reading at 2,300–4,600 words, in sections; a reader page (*new*) built from the course-below rendering |
| Course viewer | `CourseViewer` (`src/components/courses/course-viewer.tsx`), `src/features/courses/*` | Parts are Lumens. "Listen to Part N" comes later. |
| Speech (Listen) | `speech/elevenlabs.ts`, `synthesize.ts` (`alignmentToWords`, `speechCacheKey`), the `explainer-speech` task (`src/trigger/explainer-tasks.ts`), `src/config/speech.ts` | Two voice ids, per-turn voicing one chapter ahead |
| Marks | `createItem` (`src/features/library/items-repository.ts`) with `shape: "note"`, `noteStyle: "quote"` and a `{kind:"time", seconds}` locator (`features/library/types.ts`), as `pdf-viewer.tsx` does | A quote needs a `sourceId`, and a Lumen isn't a Commonplace source: decision D4 |
| Journal on Loci | `recordJournalEntry` (`src/features/topics/journal.ts`; kinds include `explainer_made` and `explainer_started`) | New kinds such as `lumen_listened`, `lumen_marked` and `live_session` |
| Spend | `checkSpendCap` / `PaidStart` (`src/features/usage/spend-cap.ts`), `in-flight.ts`, `rate-card.ts`, `recordProviderUsage` | New starts `read`, `listen` and `voice_session`, each with an in-flight hold |
| Switches | `src/config/explainers.ts` (`isCoursesOn`, `explainerAdmits`, tester lists) | `LEARN_V2`, `LUMEN_READ`, `LUMEN_LISTEN` and `LIVE_LUMENS`, closed unless on, testers first |
| Dock (talk bar) | None exists. The nearest are `copilot-composer.tsx` and `cp-*` (`src/styles/copilot.css`). | *New* `TalkBar` in `AppShell`, shown only in Learn and Loci. Typed in Phase 4; voice and the transcription strip in Phase 6. |
| Mini player | None. `JobsCard` shows the pattern for an app-shell fixture. | *New* `MiniPlayer` in `AppShell` (Phase 4) |
| Specimens and tests | `src/app/dev/specimens/*`, `src/dev/explainer-specimen.tsx`, `tests/e2e/explainer-learn-visual.spec.ts`, `explainer-player.spec.ts`, `course-viewer.spec.ts` | Add specimens for every new screen; visual e2e in light and dark with Axe, as the house does |

## 4. Data model (decide in Phase 0)

- **Recommended, Option A:**
  - **A `lumens` table:** `id`, `account_id`, `question`, `topic_id`, `goal_ref` (nullable until goals exist), `brief jsonb` (snapshot), `created_at`.
  - **On `explainers`:** add `lumen_id`, `format` (`watch|listen|read`) and `edition` (`standard|drive`).
  - **Backfill:** one Lumen per existing explainer (`format = 'watch'`). Each course part is its own Lumen.
  - **Rules:** hand-written SQL in `drizzle/0025_*.sql` (the latest is `0024`). Never run `db:generate`; `src/db/*-schema.ts` only mirrors the SQL.
- **Option B (minimal):** add only `lumen_id` and `format` to `explainers`, with no table. It's cheaper, but goals, briefs and memory then attach to a file rather than the idea.
- **Watch for:**
  - `explainers_origin_check` allows only `button | copilot | eval`. Live-kept Lumens and Home-bar origins need it widened.
  - `explainer_views` keeps progress per format. Listen needs chapter/turn positions, and Read a section or scroll position.
  - Library `ORIGINS` (`user|source|model|model_external`) are a DB check too. Marks may need a new value (D4).

## 5. Design rules carried from the prototype

- **Format colours:** add aliases to `src/styles/tokens.css` rather than new colours.

  | Format | Alias | Token |
  |---|---|---|
  | Watch | `--fmt-watch` | `--accent` |
  | Listen | `--fmt-listen` | `--myfocus-ink`, soft `--myfocus-paper` |
  | Read | `--fmt-read` | `--entity-work` |
  | Live | `--fmt-live` | `--warn`, soft `--warn-soft` |

  The colour appears on:
  - the poster flag;
  - the format pills;
  - the page switcher (the chosen format is tinted);
  - the Lumens format filter;
  - the Home bar's Make button.
- **Posters by kind:**
  - Watch keeps today's title slide.
  - Listen is the two hosts on the dark cover (`--cover-paper`).
  - Read is a paper title page with a green spine.
- **Cards:** one per Lumen. Made formats are pills that open them; missing ones are dashed "+ Listen" pills that open the brief for that format. Live sits apart, on the right.
- **Lumen pages:** every one has the same switcher: Watch · Listen · Read | ● Live, with Live after a divider.
- **Home bar:** Watch · Listen · Read · ● Live, then one line of brief preview with **Tailor…**, then "Talk it through live instead". The button follows the format: "Make a Lumen", or "Start live session" for Live.
- **The dock:**
  - **Suggestions in one row,** centred, scrolling sideways with faded edges.
  - **One card,** with a **transcription strip** over the input: who's speaking and two lines, lit word by word. The input stays usable.
  - **In live, the strip is the only live caption.** The slide caption hides, the transcript panel keeps the history, and the card is outlined red with the label "Live · title".
- **Phone layout:**
  - The Home bar's format row wraps above the input.
  - The mini player sits above the tab bar and lifts the dock.
  - Walk and Drive modes are full screen with 84–220 px targets.
- **Copy:** follow the house copy rules. The prototype's strings are a starting point, not final.

## 6. The phases in detail

### Phase 0: Foundations and spikes (HIGH, migration)

- **Scope:**
  - Decide D1 (data model) and write `0025`.
  - Backfill the existing explainers.
  - Mirror the schema; read-model functions that return Lumens with their formats (`learn/repository.ts`).
  - Format tokens.
  - The *new* shared components, with no screens using them yet: `FormatPills`, `FormatSwitch`, `FormatFlag`, `LumenPoster` (watch/listen/read) and `LumenCard`.
  - The `LEARN_V2` switch.
  - **Spike** (scripts only, on the owner's word, through the spend guard): voice two 3-minute turns pairs with the current ElevenLabs path, and record cost per minute and time to first audio.
- **Exit:**
  - Migration applied to the hosted DB with the owner's authorisation.
  - Unit tests for the backfill and the read model.
  - Spike numbers written into the Listen design.
  - No visible change with `LEARN_V2` off.

### Phase 1: Learn reorganised, Watch only (MEDIUM)

- **Scope:**
  - Tabs: Home · Lumens · Courses.
  - **Home:**
    - the bar with the format choice (only Watch enabled; Listen, Read and Live hidden until their phases);
    - Continue;
    - courses;
    - recent Lumens.
  - **Lumens:**
    - search;
    - format filter (Watch only for now);
    - state filter;
    - area chips (the extracted `TopicFilter`);
    - grouping by date or by topic.
  - Cards as `LumenCard`.
  - The player head gains `FormatSwitch`, with Watch only.
  - The bar's Make is today's `generateQuick` path (same brief as `ExplainDialog`).
- **Out:** the brief screen, Read, Listen and Live.
- **Exit:**
  - Specimens for Home, Lumens and the card.
  - Visual e2e in light and dark.
  - Existing e2e updated on purpose.
  - Verify passes, with the ratchet line quoted.

### Phase 2: The brief (HIGH, AI input)

- **Scope:**
  - The one-line preview under the bar, and **Tailor…**.
  - The brief screen: format first, then goal, topic, sources, already known and length.
  - **Goal:** no goals table exists. Until the learner-context design ships, offer My Focus topics (`topics.want_to_learn`) and "Just curious" (D3).
  - **Sources:** several Commonplace items tagged to the topic, with the grounding rule (only / mostly / open), extending the single-item grounding path.
  - **Already known:** a query over `explainer_views` (watched) and, later, reads and listens on the same topic.
  - Store the brief snapshot on the Lumen.
  - Bump the contract version and re-record the job-input golden on purpose.
  - Update `project-docs/implementation/ai.md`.
- **Exit:**
  - Evals on the owner's word: an "already known" brief doesn't re-explain; a goal steers the takeaway.
  - One live generation recorded.

### Phase 3: Read (HIGH, new AI purpose)

- **Scope:**
  - A standalone long read as an explainer with `format = 'read'`:
    - written in sections (2,300–4,600 words, from the length choice);
    - sanitised by `sanitiseReading`;
    - citations checked like a Reading's.
  - The reader page:
    - a table of contents;
    - the article in the reading face (`--read`);
    - quoted sources linking to Commonplace items;
    - position saved.
  - "+ Read" on cards and in the switcher.
  - A journal entry on the topic.
  - The spend start `read` (text only).
- **Exit:**
  - A Lumen can hold Watch and Read, and they open from one card.
  - Evals: structure, citations, no invented numbers.
  - The reader passes Axe.

### Phase 4: Listen (HIGH, AI, spend, worker, speech)

- **Scope:**
  - **The Listen contract:**
    - the plan: title, takeaway and chapters;
    - chapter calls returning `{who, say, src?, recall?, answer?}` turns.
  - **The writer runs as a Trigger task,** one chapter ahead of the listener: chapters 1–2 first, chapter *n* when the listener reaches *n − 1*.
  - **Voicing is per turn, with two voice ids,** one chapter ahead. Audio goes to R2 with word timings, and usage rows carry job ids.
  - **The Listen page:**
    - both hosts, a caption, a chapter bar, controls (back 15 s, play, next chapter, speed, Mark);
    - the chapter list;
    - a transcript with source chips;
    - Sources and Made-from tabs;
    - "More on this topic".
  - **The `MiniPlayer` in `AppShell`.**
  - **Walk mode.**
  - **Marks** become Commonplace quote notes (D4), plus a journal entry.
  - **The recall question at the end,** recorded as candidate evidence on the recap only. It doesn't change topic status.
  - **Asking the hosts, typed in the `TalkBar`.** One small author call plus two short TTS lines, behind a pre-voiced filler. It's not a voice session.
  - **The spend start `listen`,** with a hold per chapter.
- **Out:** the microphone, Drive mode and offline.
- **Exit:**
  - A first chapter plays within about 30–40 s of Make.
  - An abandoned Dialogue stops writing and voicing.
  - The cost per minute is measured and inside the cap.
  - Evals: the two angles really differ; no invented quotes.

### Phase 5: Drive edition and phone audio (HIGH for the drive rules in the brief; MEDIUM for the player)

- **Scope:**
  - "Where will you listen?" in the brief, with the drive rules (specs: Dialogues §2.7).
  - Drive mode:
    - a setup screen;
    - no captions;
    - say that again, next chapter, Mark;
    - a think-only recall question.
  - The Media Session API: play, pause, previous track = say that again, next track = next chapter.
  - Interruptions: pause for calls, duck for directions, and resume at the start of the turn with a pre-voiced "where we were" line per chapter.
  - Offline download.
- **Decide:** whether to build a native shell (CarPlay audio app, Android Auto media app, Siri / Assistant intents). That's a separate track.
- **Exit:** tested on a real iPhone and an Android phone over car Bluetooth. The background-play limits are written down.

### Phase 6: Live (HIGH, voice, spend, legal). Build it last.

- **Scope:** follow `2026-10-21-live-lumens-voice-design.md` §3–§8 and slice 1's eight answers.
  1. A voice session object and transport (ElevenLabs Agents, EU residency), behind a `VoiceTransport` interface.
  2. A `PlaybackDriver` pulled out of `use-playback.ts`: the existing `AudioDriver` plus a new `LiveDriver`.
  3. Live in the Home bar ("Start live session", hold to talk) and in the switcher. On the player, Watch/Live are the two modes and replace any separate toggle.
  4. The dock's voice line, with the transcription strip and the live state.
  5. Interruptions (stop, another way, simpler, deeper, from my field, test me, skip, back) and tapping part of a slide.
  6. Asides, Keep, and Resume within 30 days ("Live sessions" as a Lumens filter).
  7. The spend start `voice_session`, with per-minute holds and the post-call webhook.
  8. A consent screen and legal L1–L6 before any tester.
  9. Browser check: desktop Chrome and Edge first.
- **Split:** L1 *Ask the Lumen* (interrupting a recorded Lumen) ships before L2 *Live Lumen*.
- **Fix carried from the prototype:** a cut-in during the narrator's opening line must stop it. The prototype had this bug.
- **Exit:**
  - The design's P0/P1 numbers: first word in ≤1.2–1.5 s, barge-in in ≤300 ms, a rework slide in ≤6 s.
  - The owner rates three live sessions.

## 7. Considerations

- **Cost.** Listen voice and Live minutes dominate everything else. Every new start goes through `checkSpendCap` with an in-flight hold, and per-minute rows go in the usage ledger. Show the cost estimate in the brief (the prototype shows where).
- **Goals don't exist yet.** Use My Focus as the stand-in and keep `goal_ref` nullable. Don't build a goals table inside this programme without the learner-context decisions (L-D1–15).
- **Naming.** Learner-visible: Watch · Listen · Read · Live, "Make a Lumen", "Talk it through live", "Tailor…". "Dialogue" stays a code name only.
- **Accessibility:**
  - Every audio format has a transcript.
  - Captions come from word timings.
  - All controls work by keyboard.
  - Walk and Drive targets are 44 px or larger.
  - Reduced motion is respected (the wave animations).
- **Phones.** Phase 1 already lays out at 390 px. Background audio is the phone risk (Phase 5).
- **Analytics.** PostHog events per format: made, opened, finished, abandoned at chapter or slide. Live adds minutes and interruptions.
- **Docs.** Update `project-docs/implementation/{frontend,backend,database,ai}.md` in place on the same branch, every phase. Copy the prototype into `project-docs/design/prototype/` only if the owner asks; `scripts/check-prototype.cjs` checks that folder.

## 8. Decisions for the owner (before the phase that needs them)

| # | Decision | Needed by | Recommendation |
|---|---|---|---|
| D1 | Data model | Phase 0 | Option A (`lumens` + `format` / `edition` on `explainers`) |
| D2 | Tabs on day one | Phase 1 | Home · Lumens · Courses, with Courses only where courses are on |
| D3 | Goals until learner context exists | Phase 2 | My Focus topics plus "Just curious" |
| D4 | What a mark is in Commonplace | Phase 4 | A quote note attached to the Lumen, with a new origin (`lumen`) and a time locator. Needs a check-constraint change. |
| D5 | Listen voice model and monthly cap | Phase 4 | Decide from the Phase 0 spike; start at 60 min per tester per month |
| D6 | Native shell for driving | Phase 5 | Only if the phone tests show web background play is unreliable |
| D7 | Live vendor and legal | Phase 6 | ElevenLabs Agents (EU), after legal L1–L6 |

## 9. Kickoff prompt for the implementing agent

> You are implementing Learn v2 in `studiolo`.
> 1. Read `studiolo_manage/docs/superpowers/specs/2026-10-22-learn-v2-implementation-overview.md`, then the prototype `studiolo_manage/prototypes/learn-lumens/dist/learn-lumens-prototype.html` and its README, then `AGENTS.md` and the workflow docs it points to.
> 2. Start with **Phase 0 only**. Before you write code, write a phase spec under `docs/superpowers/specs/` in the house format (tier line first). It should cover:
>    - the D1 data model and the exact `0025` SQL;
>    - the backfill;
>    - the shared components, with their props;
>    - the tests;
>    - the spike plan and its budget.
> 3. List every file you will touch, and every existing component you will reuse, from the overview's reuse map. Flag any place where the app and the prototype disagree.
> 4. Stop and wait for the owner's approval. Never push or merge `main`. Never run real-model evals or the spike without the owner's word.
