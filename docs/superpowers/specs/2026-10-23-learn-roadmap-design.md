HIGH (a programme of five phases; each phase states its own tier)

# Learn roadmap: five phases, one at a time

**For:** the agent building Learn in `studiolo`, and the owner approving it phase by phase.
**Status:** Proposed. Claude, 23 October 2026. It follows the owner's sequence from the same day. Nothing here is approved until the owner says so in the conversation.
**Checked against:** `studiolo` main @ `43ed7245` (23 Oct 2026), read only. Paths below exist on that commit unless marked *new*.
**Replaces:** [`2026-10-22-learn-v2-implementation-overview.md`](2026-10-22-learn-v2-implementation-overview.md) for order and scope. That overview's reuse map and Listen/Live detail are still useful; where the two disagree, this one wins.

## 0. In short

The owner's order (23 Oct 2026). We improve Learn and Lumens one step at a time, and every phase is useful on its own.

| # | Phase | What the learner gets | Tier | Migration | Switch |
|---|---|---|---|---|---|
| 1 | **Learn: Home, Lumens, Courses** | Home with **Make a Lumen** at the top (today's Lumens only), **Pick up where you left off** and **Next for your goals**; a full **Lumens** tab; a **Courses** tab | MEDIUM | no | `LEARN_HOME` |
| 2 | **Reading lessons in courses** | Courses gain HTML **reading lessons** as lessons in their own right, built on the teach skill: one win, a primary source, a quick check, related lessons | HIGH | yes | `COURSE_READING` |
| 3 | **Enhance and share** | Comment on slides and **remake a Lumen from your comments**; a better **Share a Lumen**; **Share a course**; the person you share with can **add it to their own Lumens or courses** | HIGH | yes | `LUMEN_REMAKE`, `LEARN_SHARING` |
| 4 | **Listen** | Audio Lumens: two voices, 10–30 min, chapters written one ahead, the mini player, Walk and the drive edition | HIGH | yes | `LUMEN_LISTEN` |
| 5 | **Live** | Talking any Lumen through in real time, with the learner cutting in | HIGH | yes | `LIVE_LUMENS` |

**Why this order:**
- **No AI change first.** Phase 1 changes no AI and no data, so the new Learn can be judged on real Lumens.
- **Text before audio.** Phase 2 is text only. It builds the page renderer, the quiz and the lesson model that later phases reuse.
- **Fix and spread what exists.** Phase 3 makes today's Lumens better and lets them travel before any new format is added.
- **Audio, then voice.** Listen needs the speech pipeline and the one-Lumen-many-formats model. Live needs everything before it, and it carries the most cost, latency and legal risk.

## 1. What exists today (main @ 43ed7245)

| Area | Today | Where |
|---|---|---|
| **Learn tabs** | One tab, **Lumens**. The comment says Courses, Learning paths and Planner wait for Stage 4. | `src/components/shell/destinations.ts:37-38` |
| **Learn list** | Subtitle "Lumens made for you". A Continue card, then course cards, area chips and day groups. | `src/app/(workspace)/learn/(list)/page.tsx`; `src/components/explainers/explainer-list.tsx` (`ExplainerList` :329, `CourseCard` :90, `Card` :121, `ContinueCard` :165, `TopicFilter`) |
| **List helpers** | `groupByDay`, `chipRows`, `groupCourses` and `pickContinueEntry`. Progress has one module, shared with Today. | `src/features/explainers/learn/model.ts`; `learner-progress.ts` (`continueChoices` :114); `learn/repository.ts` |
| **Making a Lumen** | `ExplainDialog` from a Loci topic or a Commonplace item, and the Ask Loci `explain` tool. `POST /api/explainers` accepts a topic, an item, or **no anchor**. | `src/components/explainers/explain-dialog.tsx`; `src/app/api/explainers/route.ts`; `src/features/copilot/tools/explain.ts` |
| **Generation** | Trigger task `explainer-generate`, with a standby warm-up and per-line speech. Contract **1.7**, the quality stack (L1–L5): merged for the owner's test, not accepted. | `src/trigger/explainer-tasks.ts`; `src/features/explainers/types.ts:56`; `project-docs/implementation/ai.md:348` |
| **Courses** | `explainer_series` (0023) with up to 40 parts in jsonb. Each part is one Lumen plus a **Reading**: 400–700 words of sanitised HTML in a `reading` node, written after the slides. No quizzes, no reading-only lessons, no review lessons. Behind `EXPLAINER_COURSES` and the tester list. | `src/db/explainers-schema.ts:277`; `src/components/courses/*`; `src/features/explainers/reading.ts`; `src/features/courses/http.ts:29` |
| **Course engine** | **Proposed, none implemented:** Planner, Learner Model, learning records, lesson pages, quizzes and reviews. It maps the **teach skill** onto the app (§13). It is the intended design for **Stage 4: Courses**. | `project-docs/architecture/course-engine.md` |
| **Sharing** | A public link for one Lumen (`explainer_shares`, 0020), the `/e/[code]` page and "Made with Studiolo". No course sharing, no adding to your own, no sharing with a named person. | `src/features/explainers/sharing/*`; `src/app/e/[code]/page.tsx` |
| **Feedback** | A 1–5 rating with a comment, or a report (reasons `wrong`, `citation`, `place`, `playback`, `other`, kept in `tags`) that can include the slide (`node_id`). The UI is in the **course viewer only**. Nothing acts on the rows. | `src/features/explainers/feedback.ts`; `src/components/courses/course-side.tsx:105-185` |
| **Redo** | Try again (a new Lumen), Retry voice for one line, and automatic repair rounds during generation. No learner-led remake. | `player/actions.ts:115`; `author.ts:56` (`REPAIRABLE_WARNINGS`) |
| **Audio and voice** | ElevenLabs TTS with timestamps. No dialogue/audio Lumens, microphone or voice sessions. | `src/features/explainers/speech/*` |
| **Goals** | No goals table. My Focus topics (`topics.want_to_learn`). Goals on Today wait for the learner-context design (T3). | `src/db/topics-schema.ts:28`; `project-docs/product/mvp-scope.md:235` |
| **Rules** | Tiers and paperwork, owner's word for merges, migrations, paid services and deploys. Hand-written SQL in `drizzle/` (latest `0024`). Guides updated on the same branch. | `AGENTS.md`; `project-docs/workflow/README.md:48-56` |

## 2. Rules for every phase

- **Names.**
  - Learners see **Lumen(s)**, **Course(s)**, **Loci**, **Commonplace** and **Ask Loci**.
  - Code keeps `explainer`, `series`, `graph`, `library` and `copilot`.
  - Format words, when they arrive, are **Watch · Listen · Read**; **Live** is a way of taking any Lumen, not a format.
- **The model writes typed content, and Studiolo renders it.** This is a house rule (course engine §8). It holds for slides, lesson pages, quizzes and audio scripts. The model never writes free HTML, CSS or SVG. New visuals are new typed blocks with fixed components.
- **Reuse before new.** Each phase lists the existing component to extend. New shared pieces go in the feature folder that owns them (`features/explainers`, `features/courses`, `components/explainers`, `components/courses`).
- **The prototype is a design reference, not code.**
  - Prototype: `Studiolo_Manage/prototypes/learn-lumens/dist/learn-lumens-prototype.html` and its README. It's published as "Learn, One Lumen".
  - Rebuild every screen with the app's React components and tokens.
  - Its responsive rules already match the app (compact < 700, medium 700–1099, wide ≥ 1100; panels beside from 1024; course Reading type).
  - Phase 1 uses only its Home, Lumens and Courses screens, in Watch-only form.
- **Switches.** Each phase is behind its own switch (`src/config/*.ts`), closed unless on, testers first. Pages and routes answer 404 when off.
- **Paperwork follows the tier.** A phase spec in `docs/superpowers/specs/YYYY-MM-DD-<slug>-design.md`, tier on line one. A plan only for work over a day. A merge checklist in `docs/superpowers/evidence/<feature>/checklist.md`.
- **Same branch.** Every AI change updates `project-docs/implementation/ai.md`, and the other owning guides (`frontend`, `backend`, `database`) change on the same branch.
- **Spend.** Every new paid start goes through `checkSpendCap` with an in-flight hold (`src/features/usage/*`).
- **Never** merge, push `main`, run a migration on hosted data, run paid evals or deploy the worker without the owner's word.

## 3. Phase 1: Learn, Home, Lumens and Courses (MEDIUM)

**Goal:** Learn becomes three tabs with clear jobs. Home is the desk: make, resume, next. Lumens is the full list. Courses is the full list of courses.

### 3.1 Home

1. **Make a Lumen (top).**
   - **What it is:** one question field and **Make a Lumen**, making today's Lumen (Watch only, so no format choice).
   - **Path:** `POST /api/explainers`, the same request `ExplainDialog` sends, with `origin: "button"`.
   - **Anchor:** none. As an option, the field can pick a Loci topic when the question names one (a chip "In: *topic*", removable). It's anchored only if the learner keeps the chip.
   - **While it's made:** the existing `JobsCard` / jobs module (`features/jobs`). No new progress UI.
   - **Starters:** under the field, 2–3 quiet starters from the learner's My Focus topics.
   - **Ask Loci:** keeps its `explain` tool; the bar doesn't replace it.
2. **Pick up where you left off.**
   - **What it shows:** one list across Lumens and courses: the newest unfinished Lumen, course parts in progress, and Lumens made but not opened. Each row has **Resume** and its position ("slide 4 of 9", "Part 2 of 6").
   - **Source:** extend `pickContinueEntry` / `continueChoices` to return the top three, not one. Today's Continue card uses the same module, so the two stay in agreement (arch-m1).
3. **Next for your goals.**
   - **Goal source:** goals don't exist yet. Until the learner-context design lands, a goal is either:
     - (a) a **course**, its aim taken from its title and request; or
     - (b) a **My Focus topic**.
   - **Layout:** one card per goal, at most three.
   - **Next steps:** each card shows two, from existing data only:
     - the next unmade or unwatched course part (**Make** or **Watch**);
     - an unwatched Lumen on that topic;
     - for a My Focus topic with nothing yet, **Make a Lumen on *topic*** (the same path as the bar, anchored to the topic).
   - **Data and AI:** no new data, no AI ranking. Decision D2.
4. **Hidden until their phases:** format choice, Listen, Read, Live, the talk dock and the mini player.

### 3.2 Lumens tab

- **Contents:** today's list, made fuller.
  - **Filters and grouping:** search by title, a state filter (All · New · In progress · Watched), the area chips (extract the private `TopicFilter`), and grouping **By date** (`groupByDay`) or **By topic** (*new* `groupByTopic` in `learn/model.ts`).
  - **Cards:** today's `Card` and `ExplainerPoster`, unchanged in look. The card's menu keeps Share, Copy link, Stop sharing and Delete.
- **Courses:** no longer listed here. They move to their own tab.

### 3.3 Courses tab

- **Route:** `/learn/courses` (*new*), shown only when `coursesAllowed` is true. Otherwise the tab is absent, not greyed.
- **Contents:** `CourseCard` in the `lx-grid`, with progress (`courseProgress`), the anchor tag and **Resume** into `/learn/series/<id>/resume`.
- **Empty state:** how to start a course: Explain a large Commonplace item, Explain a Loci topic with sub-topics, or ask Loci to plan one.

### 3.4 Build notes

- **Tabs:** `destinations.ts` `learn` gets Home · Lumens · Courses behind `LEARN_HOME`. With it off, today's single tab stays.
- **Routes:** Home stays `/learn`, so old links still land. Lumens is `/learn/lumens` (*new*), Courses `/learn/courses` (*new*). `[section]/page.tsx` already redirects unknown sections to `/learn`.
- **Read model:** `learn/repository.ts` gains `loadHome(accountId)`: the pick-up list, goal cards and starters, in one round trip where possible.
- **Tests:**
  - specimens for Home, Lumens and Courses (`src/app/dev/specimens`);
  - visual e2e in light and dark with Axe (`tests/e2e/explainer-learn-visual.spec.ts`);
  - unit tests for the extended `continueChoices` and `groupByTopic`.
- **Out of scope:** any AI, migration or format work.
- **Exit:**
  - Home, Lumens and Courses render from real data.
  - Make a Lumen from Home produces the same Lumen as `ExplainDialog`.
  - Today and Home agree on what to resume.
  - Verify passes, with the ratchet line quoted.

## 4. Phase 2: Reading lessons in courses, on the teach skill (HIGH)

**Goal:**
- **A new kind of lesson.** A course can contain **reading lessons**: HTML lessons that are lessons in their own right, not the short Reading under a video.
- **Planned by the teach skill.** They follow the teach skill's approach as the course engine maps it (§6.4, §8.3, §13).
- **The first slice of Stage 4.** This phase is the first slice of the course engine.

### 4.1 Stage 4 needs the owner's word

The course engine says Stage 4 starts only after the owner signs off explainer quality (Phase 3B). Contract 1.7 is merged for the owner's test but not accepted. Starting Phase 2 is the owner's call (D4). This spec proposes it as **Stage 4, slice 1: reading lessons**, with the rest of the engine still out.

### 4.2 What the teach skill asks of a lesson, and how Phase 2 does it

| Teach skill rule | Phase 2 |
|---|---|
| **A mission** grounds everything; confirm before changing it | The course's **aim** becomes a short *mission* on `explainer_series`, confirmed when the course is accepted (the copilot plan card or the course offer). Phase 2 shows it and passes it to every brief; re-planning is later. |
| **Short lesson, one win** | Every reading lesson has one `win` sentence ("You can now…"), shown at the top and checked at the end. Length is `expanded` (≤ 20 blocks, about 1,200 words, about 6–8 min). |
| **Never trust parametric knowledge; cite** | Grounding as today. Claims cite the learner's sources; anything beyond them goes in a `beyond_sources` callout. Citations are verified as Readings are today. |
| **One primary source per lesson** | `primarySource`: one Commonplace item and why, opened at the cited passage |
| **Retrieval practice; tight feedback** | An optional **check** of 2–4 single-choice questions at the end, with immediate feedback and the *why*, first try recorded. Never gates progress (D5). |
| **Quiz rules** | The course engine §8.3 validators: 3–4 options, one correct, equal word counts and ±10 % characters, no position, formatting or wording clues. **The server shuffles** options and assigns keys. |
| **Lessons link to lessons and reference docs** | `relatedLessons` (earlier parts) and two **Ask Loci** follow-up chips |
| **Glossary, learning records, spacing, reviews** | **Not in Phase 2.** The quiz answers are stored as evidence, so records and reviews can start from real data later (§8). |

Source: `project-docs/architecture/course-engine.md` §5.2, §6.4, §7.1, §8.2–8.3, §12.4, §13. The teach skill itself (`~/.claude/skills/teach/SKILL.md`) isn't in either repo. If the owner wants its exact wording to govern, add it to `project-docs/` first (D5).

### 4.3 The lesson page: typed blocks, rendered by Studiolo

- **What the model writes:** one structured-output call returns a **`LessonPage`** and a **`QuizSet`** (course engine §12.4). The renderer is *new* (`components/courses/lesson-page.tsx`), in the course Reading's face (`courses.css` `.cv-reading`: 66ch, 18/1.56, 16/1.55 on phones). It's clean and printable.
- **Blocks from §12.4:** `heading`, `paragraph` (with citations), `key_points`, `diagram` (mermaid, sanitised), `table`, `quote` (a passage from the learner's source) and `callout` (note, warning, beyond sources).
- **Blocks added to make it "nice", typed and fixed, never model HTML:**

  | Block | What it is | Reuse |
  |---|---|---|
  | `scene` | An animated figure from the **L4 scene kit** (`s.flow`, `s.cycle`, `s.figure`, `s.bars`, `s.callout`) with typed parameters | The contract 1.7 scene pieces, rendered on the page instead of a slide |
  | `steps` | 3–6 numbered steps with a bold lead | — |
  | `compare` | A two- or three-column comparison (the prototype's malqaf vs barjeel table) | `table` styling |
  | `check` | One inline question, mid-lesson | The quiz component |
  | `figure_toggle` | Two states of one `scene` (e.g. Afternoon / Night) | `scene` |

- **Interactive sliders** (the prototype's humidity and court-depth figures) are **later**. Each needs its own typed component and a stated model. Note them as D6.
- **The prototype as a guide:** its Read (`src/read.js`) shows the target feel: a lede, a pull quote, scenes, a comparison, steps, a check, source chips, and a section list that follows you.

### 4.4 Data (migration 0025)

- **Recommended:** a reading lesson is an **explainer row with `format = 'reading'`**. It reuses jobs, views, sharing, feedback, deletion and the course viewer's part plumbing.
  - `explainers.format text not null default 'watch'`, with a check `watch | reading`. Listen adds `listen` later.
  - The page and quiz are `explainer_nodes` of kinds `lesson_page` and `quiz`; `explainer_nodes` already holds `reading`.
  - `explainer_series.parts[]` gains `format: "video" | "reading"` and `win`. Old parts default to `video`.
  - `explainer_series` gains `mission jsonb null`.
  - *New* table `quiz_answers`: `account_id`, `explainer_id`, `question_id`, `choice`, `correct`, `first_try`, `answered_at`. It's evidence for later; deletion follows the account.
- **Rules:** hand-written SQL, never `db:generate`; `src/db/*-schema.ts` mirrors it. Applying it to hosted data needs the owner's word.

### 4.5 Planning: which parts are reading lessons

- **Who chooses:** the planners that exist today choose the format per part, with a reason, using course engine §5.2's rule.
  - **Reading:** for reference-heavy parts (definitions, clause-by-clause, lists of obligations, comparisons to reread).
  - **Video:** for processes and mechanisms.
- **Where it applies:** the copilot `plan_course` tool (`src/features/copilot/tools/course.ts`) and the item course offer (`/api/items/[itemId]/course-offer`).
- **Override:** the learner can switch a part's format before it's made.
- **Contract:** the planner prompt change bumps its version and re-records its golden on purpose.

### 4.6 The learner's view

- **In the course viewer,** a reading part opens the lesson page in the player's place:
  - the win;
  - the section list (beside from 1024 px, chips below);
  - the blocks;
  - the check;
  - the primary source;
  - related lessons and Ask Loci chips.
- **Progress:** read to the end or marked complete (D5), saved in `explainer_views` as a scroll position.
- **Outline:** reading parts show a page icon and "8 min read".
- **Feedback:** the existing Feedback and Report work on a reading lesson too, with a paragraph instead of a slide.

### 4.7 Build notes

- **AI:**
  - *new* purpose `course_reading_lesson` (Opus, structured output);
  - a spend start `reading_lesson`;
  - generation one ahead, as parts are made today.
  - The existing per-part Reading under a video stays as it is.
- **Validators:** the schema, length caps per depth, the quiz rules (§8.3) and citations. A failed validation goes to one repair round, then the lesson fails with Try again (Readings have no retry today; this phase adds one).
- **Tests:** unit tests for the quiz validators and the server shuffle; renderer specimens for every block; visual e2e; integration for the migration and `quiz_answers`.
- **Evals (owner's word, paid):** 10 reading lessons across two courses. Checks: one win per lesson, citations hold, the quiz rules pass, no invented numbers.
- **Exit:**
  - A course mixes video and reading lessons.
  - A reading lesson streams in block by block.
  - The check records first tries.
  - The owner rates three lessons.

### 4.8 Optional at the end: a standalone Read Lumen

Once the renderer exists, a **Read** Lumen outside a course is the same call with no course. It's cheap to add (`format = 'reading'`, made from Home). It turns on the format switcher (Watch | Read) for a Lumen that has both. Recommend it at the end of Phase 2 if the lessons are good (D7).

## 5. Phase 3: Enhance and share (HIGH)

Three parts. Each can ship alone: **3a** Remake from comments, **3b** Share a Lumen, better, and **3c** Share a course and add to your own.

### 5.1 3a: Comment on slides, then remake the Lumen

- **Commenting.**
  - The standalone player gets the course viewer's feedback: **Comment on this slide** (a short note pinned to the slide, using the existing `nodeId`), plus Rate and Report.
  - Comments list in the transcript panel under their slide, with a count on the slide strip.
  - Store them in `explainer_feedback` as a row with the slide's `nodeId`, the `comment` and the tag `comment`. The table already has `node_id`, `comment` and `tags`, so this adds no new kind. Its owner-only access and rate limit stay.
- **Remake.**
  - **Remake with my comments** opens a sheet: the comments, ticked, plus one optional line ("simpler", "more on X").
  - It makes a **new version** of the Lumen. The brief is the original plus the comments as a steer block, and the slides they point to are named.
  - The old version stays playable until the new one is ready, then the card swaps. **Versions** keeps the last three for 30 days.
  - Comments the remake addressed are marked done.
- **Data:**
  - `explainers.revises_id uuid null` (the version before) and `version int`;
  - `explainer_feedback.resolved_at timestamptz null`.
- **AI:**
  - a steer block in the brief (contract minor bump);
  - a spend start `remake`;
  - remakes count against the monthly cap;
  - at most two remakes running per tester.
- **Later, not now:** comments on reading lessons' paragraphs remake that lesson the same way.
- **Exit:**
  - a remake changes what the comments asked;
  - unrelated slides stay close to the original (the owner checks three);
  - the old version is never lost before the new one finishes.

### 5.2 3b: Share a Lumen, better

- **Dialog.** One dialog (extend `ShareDialog`):
  - a preview of what the viewer gets;
  - what's **not** shared (your notes, comments, marks, goal and Commonplace notes);
  - the link with Copy;
  - **Preview as a viewer**;
  - Stop sharing.
- **Formats.** When a Lumen has more than one format (from Phase 2's Read, Phase 4's Listen), the dialog lets you choose which go with the link. The prototype shows this.
- **Public page** (`/e/[code]`):
  - the Lumen's frame: title, the shared formats, the player or reader;
  - "Made with Studiolo";
  - **Add to my Lumens** (3c) for signed-in viewers, and **Join** / Sign in for others.
- **Rules kept:**
  - only finished Lumens;
  - not when its item has notes or was removed;
  - one live link per Lumen;
  - `noindex` and `no-referrer`.

### 5.3 3c: Share a course, and add to your own

- **Share a course.**
  - *New* `series_shares` (code, `revoked_at`, one live link per course).
  - A public course page at `/c/[code]` (*new*): the outline, the mission, the parts that are made (video and reading), playable in order.
  - Unmade parts show as "not made yet".
  - Course sharing has the same exclusions as a Lumen: a course on a Commonplace item with notes can't be shared until they're excluded.
- **Add to my own** (signed-in viewer):
  - **Add to my Lumens** / **Add to my courses** makes a **copy** owned by the viewer. It's a snapshot of the explainer rows and nodes; the audio is referenced, not duplicated.
  - The copy records where it came from (`origin = 'shared'`, `copied_from` with the share code) and shows "Shared by *name*".
  - **Anchors don't travel.** The sharer's Loci topics and Commonplace items aren't the viewer's.
    - The copy asks the viewer to place it on one of their Loci topics, or leaves it unanchored.
    - Citations to the sharer's items become plain source chips ("from the sharer's source", title only).
  - **Unmade parts of a shared course:**
    - Topic courses can be made by the viewer, at the viewer's cost.
    - Item courses can't, because the viewer doesn't have the item. They show "Add the source to your Commonplace to make the rest" (D8).
  - **Updates:** a copy is frozen. A later remake by the sharer doesn't change it.
- **Sharing with a person** (after links work):
  - **Send to a Studiolo user** by email. They get it in a *new* **Shared with you** row on Learn Home, with Add and Dismiss.
  - This touches identity and lookup by email, so it's HIGH on its own and goes last in 3c. No email is revealed: an unknown address gets the same "sent" answer.
- **Data:**
  - `series_shares`;
  - `explainers.origin` check widened with `shared` and `copied_from`;
  - the same on `explainer_series`;
  - for person-to-person, *new* `share_invites` (sender, recipient account, target, status).
- **Exit:**
  - A course link plays for a signed-out viewer.
  - Add makes an independent copy.
  - Stop sharing ends both the link and pending invites.
  - Deleting the sharer's account leaves copies working and removes the invites.

## 6. Phase 4: Listen, audio Lumens (HIGH)

**Goal:** a Lumen you can listen to while walking, cycling or driving. The full design is in [`2026-10-22-learning-forms-and-dialogues.md`](2026-10-22-learning-forms-and-dialogues.md), and the earlier overview's Phases 4–5 (§6) still hold.

- **Before:** a spike (scripts only, owner's word, through the spend guard). Voice two 3-minute pairs on today's ElevenLabs path and record cost per minute and time to first audio. The numbers set the caps (D9).
- **One Lumen, many formats:**
  - **Data.** *New* `lumens` table, with `explainers.lumen_id` and `format` gaining `listen`. Existing explainers backfill one Lumen each. This is when the format switcher and format pills turn on everywhere.
  - **Card switch.** The Phase 1 card becomes `LumenCard`.
- **Making:**
  - A two-voice script, written one chapter ahead (`{who, say, src?, recall?}` turns).
  - Voiced per turn with two voice ids.
  - Audio to storage with word timings.
  - A spend start `listen` with a hold per chapter.
  - An abandoned Listen stops writing and voicing.
- **Listening:**
  - **The Listen page:** hosts, caption, chapter bar, controls, chapters, transcript with sources.
  - **The mini player** in `AppShell`.
  - **Walk mode** and the **drive edition** (no visual reliance, say-that-again, a think-only recall).
  - **Media Session controls** for lock screens and car wheels.
  - **Marks to Commonplace** (D10).
  - **Typed questions to the hosts** (not voice).
- **Exit:**
  - The first chapter plays within about 30–40 s of Make.
  - Cost per minute is within the cap.
  - Tested over car Bluetooth on an iPhone and an Android phone.

## 7. Phase 5: Live, real time (HIGH, last)

**Goal:** talk any Lumen through now, cutting in at any time. The full design is in [`2026-10-21-live-lumens-voice-design.md`](2026-10-21-live-lumens-voice-design.md) and [`2026-10-22-learn-live-slice-1.md`](2026-10-22-learn-live-slice-1.md).

- **Voice:**
  - a voice session transport behind `VoiceTransport` (ElevenLabs Agents, EU residency);
  - a `LiveDriver` beside the existing `AudioDriver` (from `use-playback.ts`).
- **Where Live appears:**
  - **Live** in the switcher and on Home;
  - **the dock (talk bar)** with the transcription strip;
  - **interruptions:** stop, another way, simpler, deeper, test me, skip, back;
  - tapping part of a slide;
  - asides, Keep and Resume within 30 days.
- **Order:**
  - L1, *Ask the Lumen*, which interrupts a recorded one;
  - then L2, *Live Lumen*.
  - Desktop Chrome and Edge first.
- **Before any tester:**
  - consent;
  - legal L1–L6;
  - a spend start `voice_session` with per-minute holds and the post-call webhook.
- **Exit:**
  - first word in ≤ 1.2–1.5 s;
  - barge-in in ≤ 300 ms;
  - the owner rates three sessions.

## 8. Not in this roadmap (recorded so they aren't lost)

- **Learner Model.** Learning records, the glossary, spaced reviews and review lessons (course engine §5.5, §6). Phase 2's `quiz_answers` is their evidence. They're the natural Phase 2b or a later Stage 4 slice.
- **Planner.** Course re-planning at chapter boundaries and mission changes.
- **Goals.** Real goals, from the learner-context design and Today T3. Phase 1's goal cards switch to them when they exist.
- **Other forms** (see the learning forms spec): flashcards, worked examples, debates, field walks.

## 9. Decisions for the owner

| # | Decision | Needed by | Recommendation |
|---|---|---|---|
| D1 | Learn tabs on day one | Phase 1 | Home · Lumens · Courses, with Courses only where courses are on |
| D2 | What a "goal" is until goals exist | Phase 1 | A course's aim, or a My Focus topic; at most three cards; no AI ranking |
| D3 | Does Home's Make a Lumen anchor to a topic? | Phase 1 | No anchor by default; an optional topic chip the learner can keep or remove |
| D4 | Start Stage 4 with reading lessons before explainer quality is accepted? | Phase 2 | Yes, as Stage 4 slice 1, once the owner accepts contract 1.7 or says to go ahead anyway |
| D5 | Which text of the teach skill governs | Phase 2 | Course engine §13 as written; add the skill's `SKILL.md` to `project-docs/` if its exact wording should rule |
| D6 | Interactive figures (sliders) in lessons | Phase 2 | Later; start with typed `scene`, `steps`, `compare`, `check` and `figure_toggle` |
| D7 | Standalone Read Lumen | End of Phase 2 | Yes, if the reading lessons rate well |
| D8 | Shared item courses: can the viewer make the unmade parts? | Phase 3c | No, until they add the source to their own Commonplace |
| D9 | Listen voice model and monthly cap | Phase 4 | From the spike; start at 60 min per tester per month |
| D10 | What a Listen mark is in Commonplace | Phase 4 | A quote note with a new origin `lumen` and a time locator |
| D11 | Live vendor and legal | Phase 5 | ElevenLabs Agents (EU), after legal L1–L6 |

## 10. Kickoff prompt for the implementing agent

> You are building the Learn roadmap in `studiolo`, one phase at a time.
>
> 1. **Read, in order:**
>    - `Studiolo_Manage/docs/superpowers/specs/2026-10-23-learn-roadmap-design.md` (this file);
>    - the prototype `Studiolo_Manage/prototypes/learn-lumens/dist/learn-lumens-prototype.html` and its README (Home, Lumens and Courses only for now);
>    - `AGENTS.md`;
>    - `project-docs/workflow/README.md`;
>    - `project-docs/design/interface.md`;
>    - `project-docs/architecture/course-engine.md` §13 (for Phase 2).
> 2. **Start with Phase 1 only.** Before writing code, write its one-page MEDIUM spec in `docs/superpowers/specs/` (tier on line one). Include the screens, the routes, `loadHome`, the extended `continueChoices`, `groupByTopic` and the tests.
> 3. **List the files.** Name every file you'll touch and every existing component you'll reuse. Flag anywhere the prototype and the app disagree; the app wins unless the owner says otherwise.
> 4. **Stop and wait** for the owner's approval.
> 5. **Never:**
>    - push or merge `main`;
>    - run a migration on hosted data;
>    - run paid evals or deploy the worker without the owner's word.
