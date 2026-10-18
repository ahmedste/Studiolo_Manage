# Brief: what happens at the end of each course part

Status: draft for the owner's decision · 18 Oct 2026

## 1. Summary

Today a course is a straight line. A part ends, the "Up next" card offers the next part, and nothing the learner thinks or asks is recorded or used. This brief turns the end of each part into a small loop:

1. **Ask.** The video ends with a prompt to ask a question. Each question is answered as a **sub-part** under the part (e.g. Part 2.1), before the next part is made.
2. **Say what you understood (optional).** Under each video, the learner can write what they took from it. The tutor reviews it: what's right, what may be missing, where to look again, and a question back.
3. **Carry forward.** When the next part is made, its brief includes the learner's questions and the tutor's review, so the next part answers what this learner actually needs.

```
Part k ends ─► Ask a question? ─► Sub-parts k.1, k.2 … (answers)
     │
     └──────► What did you understand? ─► Tutor review (right / missed / look again / question back)
                                                │
Questions + review ─────────────────────────────┴─► Part k+1 is made with them in its brief
```

Nothing here blocks progress. **Next** stays available at all times.

Wording: the course UI says "Part", so this brief says "part" and "sub-part" (see the Lumen naming proposal, §3). A part *is* a Lumen; internally it is an explainer.

## 2. How courses work today

References are to `studiolo` @ `d6e510e` (read only; nothing has been changed there).

| What | Today | Where |
|---|---|---|
| Course storage | One row in `studiolo.explainer_series`; parts are a flat `parts` jsonb array. The migration is applied only to the test branch `phase-courses-test`, not approved for hosted databases | `drizzle/0023_explainer_series.sql:1-4, 9-37`; `src/features/courses/types.ts:6-18` |
| Nesting | None. Only flat `group` labels | `src/features/courses/model.ts:122-131` |
| When parts are made | The outline is made up front. Each part's content is made **only when the learner opens it** (Make / Next). Nothing is pre-made | `src/features/courses/service.ts:278-279, 318-323`; `src/components/courses/course-viewer.tsx:214-219` |
| What part N is given | Objective, topic path, saved items, the part's source range, a `<series>` block listing all part titles, and a static learner line from onboarding. **Nothing from earlier parts or from the learner's activity** | `src/features/explainers/contract/brief.ts:45-60, 86-93`; `src/features/explainers/run.ts:170-175` |
| End of a part (not the last) | `UpNextCard`: "Up next · Part k of n", **Make/Play part k**, **Replay** | `src/features/explainers/player/player.tsx:633-646, 700-702`; `src/components/courses/up-next.tsx:57-107` |
| End of the last part | `EndCard`: two follow-up questions as links that open the copilot with the question pre-filled, never sent | `src/features/explainers/player/follow-ups.tsx:175-205`; `src/features/explainers/player/ask.ts:241-253` |
| Learner input | None at the end of a part. The only input is the tester feedback form (stars + comment) | `src/components/courses/course-side.tsx:105-217`; `src/features/explainers/feedback.ts` |
| Write-up / tutor review | Not built. The prototype has it: "Write what you took from it", then "What you have right / What you missed / Look again / A question back" | `project-docs/design/prototype/studiolo-design-concept.html:2185-2222`; `src/components/library/document-page.tsx:37-39` |
| Learning state | Topic status is manual only (`not_started / learning / learned`). Watching doesn't change it, by product rule | `project-docs/product/brief.md:14`; `drizzle/0017_explainers.sql:209-219` |
| Notifications / calendar | Loops email for the waitlist and invitations only. No push, no reminders. Today has a read-only activity calendar | `src/features/marketing/loops.ts`; `src/features/today/repository.ts:214-260` |

**Fit with the proposed course engine.** `project-docs/architecture/course-engine.md` already proposes most of this direction: lessons made one ahead and triggered by the learner (D4, R1), progress never blocked (D5, R6), notes used in the next lesson's brief (R2). This brief is a small first slice of that engine, built on the current courses code. It differs in one place: the engine proposes multiple-choice quizzes under the video (D7). This brief uses a free-text "what I understood" instead, because recognising the right option is not understanding, and it matches the prototype's write-up step. Quizzes can come later as a light warm-up.

## 3. The end of a part: asking questions

### 3.1 What the learner sees

When part k ends, the end card changes from "Up next" alone to:

- **"Anything you'd like to ask about this part?"** with a text box.
- The **two follow-up questions** the author already writes (`text.ts:76, 113-115`), shown as one-tap chips that fill the box.
- Below that, the existing **Make/Play part k+1** and **Replay**, unchanged.

The same box is available in the course side panel at any time, so a learner can ask mid-video too.

### 3.2 What happens to a question

The tutor sorts each question into one of four kinds and says which it chose. The learner can change it in one tap.

| Kind | Example | Where it goes |
|---|---|---|
| **Clarify** | "What's an iwan?" | A **written sub-part**: a short answer (≤ 150 words) with citations to the part's sources, shown straight away |
| **Gap** in this part's core idea | "I don't see why that makes the plan asymmetric" | A **written sub-part** at once, with an offer: "Make this a short Lumen?" (an explainer of 1–2 minutes, made only if accepted) |
| **Ahead** | "How did later mosques change this?" | "Part 4 covers this." The question is attached to part 4 and goes into its brief (§5). No sub-part |
| **Tangent** | "How does this compare to Gothic cathedrals?" | The existing copilot link with the question pre-filled (`ask.ts:249-253`). No sub-part |

### 3.3 Structure rules: two layers only

```
Course
├── Part 1
│   ├── 1.1  answer to question A
│   └── 1.2  answer to question B
├── Part 2   ← made with part 1's questions and review in its brief
└── Part 3
```

- **Course → Part → Sub-part. Never deeper.** A question asked inside sub-part 1.2 becomes sub-part 1.3 under Part 1, not a child of 1.2.
- **At most 5 sub-parts per part.** After that, the tutor suggests "This could be a course of its own" and offers the copilot's `plan_course`.
- **Sub-parts don't count towards course progress.** Progress stays "watched parts / total" (`model.ts:99-102`).
- **Sub-parts appear in the outline** under their part, indented, labelled "2.1", "2.2".
- **Before the next part is made** means: if a sub-part is still being written when the learner presses Make part k+1, part k+1 waits for it (seconds for a written answer), so its brief includes the answer. A sub-Lumen still being made does not hold part k+1 back.

## 4. Under each video: "What did you understand?"

### 4.1 What the learner sees

Under the player, a collapsed panel: **"What did you take from this? (optional)"**. Opening it shows a text box (a few sentences; up to about 1,500 characters).

On submit, the tutor replies in four fixed sections, as in the prototype (`studiolo-design-concept.html:2212-2218`):

| Section | Content |
|---|---|
| **What you have right** | One to three points, specific to what they wrote |
| **What you may have missed** | One to two points from the part's content or sources |
| **Look again** | Where to look: a slide (jump link into the player) or a source passage (cited) |
| **A question back** | One question that pushes further, ideally tied to their project or field (from the learner line) |

Buttons: **Revise** (write a second version; the tutor reviews it against the first) and **Ask about this** (puts the "missed" point into the question box from §3).

### 4.2 Rules

- **Optional, never gating.** No badge for skipping, no nag. Next works whether or not it's filled.
- **It doesn't change topic status.** That stays the learner's choice (`project-docs/product/brief.md:14`). The review is saved as evidence for later (§7), not as a grade.
- **Tone: a crit, not a test.** No scores, no "correct/incorrect" labels. "You have this right" and "You may want to look at" rather than "Wrong".
- **Grounded.** The tutor reviews against the part's slides, Reading and source spans, and cites them. If the learner says something correct that the part didn't cover, the tutor says so rather than marking it missing.
- **Rate limit** like feedback (`feedback.ts:4`), e.g. 20 reviews an hour.

## 5. Carrying it forward into the next part

When part k+1 is made (`makePart`, `service.ts:318-323`), its brief gets a new `<previous>` block after `<series>` (`brief.ts:86-93`), built as a template merge, not an extra LLM call (as in course-engine R2):

```
<previous>
Part k: <title>
The learner asked:
- <question> (answered in k.1)
- <question> (answered in k.2)
Their own summary, reviewed by the tutor:
- Had right: <points>
- Missed: <points>
- Question back: <question>
Questions they asked earlier that this part covers:
- <"ahead" questions attached to part k+1>
</previous>
```

Instructions to the author, added to the contract next to the `<series>` rule:

- Address the "missed" points briefly where they connect to this part; don't re-teach part k.
- Answer the attached "ahead" questions inside this part.
- Don't repeat what the learner already showed they understood.
- Never mention "your summary" or "you asked" on screen in a way that feels like surveillance; weave it in.

If the learner asked nothing and wrote nothing, the block is left out and the brief is exactly as today.

Only part k feeds part k+1 in this slice. A longer memory across the whole course is the Learner Model's job (course-engine §6), later.

## 6. The three moves with the biggest impact

If only part of this is built, build it in this order. Each move works on its own, and together they close the loop.

| # | Move | Why it matters | Rough size |
|---|---|---|---|
| **1** | **Ask at the end → written sub-parts** (§3), with the two-layer rule and the cap, but no sub-Lumens yet | Gives the learner a reason to engage at the end of each part, and produces the first signal to carry forward | Medium |
| **2** | **Carry-forward block** (§5), fed by those questions | Makes every course adapt to the learner. It is the cheapest change (one brief block plus a contract line) and turns "6 fixed lessons" into "6 lessons for you". Ship it with move 1 | Small |
| **3** | **"What did you understand?" + four-part review** (§4) | This is Studiolo's difference: the tutor answers the learner's own writing. Its "missed" and "question back" make move 2 much sharper | Medium |

Leave for later: the "Make this a Lumen" sub-Lumens, Revise with a comparison, and the tutor triage for "ahead" questions (in v1, every question can be a written sub-part).

## 7. Data and code changes (for review, not applied)

- **Sub-parts.** Add an optional `subs` array to `CoursePart` (`types.ts:6-18`): `{ key: "2.1", question, kind, answer, explainerId | null, createdAt }`. Because `parts` is jsonb, this needs no column change, the same way `focus` and `itemId` were added (`types.ts:51` comment). A type-level rule enforces no `subs` inside a sub.
- **Understanding reviews.** A new table, e.g. `studiolo.course_part_reflections` (`account_id, series_id, part_key, version, text, review jsonb, created_at`). This is a migration and **needs the owner's separate approval** (AGENTS.md). Note `0023_explainer_series.sql` itself is not yet approved for hosted databases.
- **Brief.** A `previous` field on `QuickBrief` and a `renderPrevious()` next to `renderSeries()` (`brief.ts`), plus the contract lines above.
- **Player.** Extend the course end-card path (`player.tsx:640-642`, `up-next.tsx`) with the question box; add the reflection panel under the player in `course-viewer.tsx`.
- **AI purposes.** New usage purposes, e.g. `course_answer` and `course_review` (as `structure` and `reading` were added in `0023`), counted against `EXPLAINER_MONTHLY_CAP_USD`.
- **Flag.** Behind `EXPLAINER_COURSES` plus a new `COURSE_LOOP` switch (`src/config/explainers.ts`), testers first.
- **Analytics** (none exist for courses yet, `events.ts:5-22`): `course_question_asked {kind}`, `course_subpart_opened`, `course_reflection_submitted {version}`, `course_part_made {carried: boolean}`. Also fire `explainer_started` from `/api/series`, which currently doesn't.
- **Tests.** Brief rendering with and without `<previous>`; the two-layer rule; the 5-sub-part cap; Next never blocked; topic status untouched after a review.

## 8. On the roadmap, not in this build

**Don't build these now.** Record them in the roadmap so this build leaves room for them.

| Item | What it would do | Groundwork this build leaves |
|---|---|---|
| **Reminders that carry a question** | A notification whose text *is* the tutor's "question back" or a "missed" point, answerable in a few seconds, rather than "come back and study" | Reviews store the question back per part |
| **Spaced review** | Bring back a part's key points after 1, 3, 7, 21 days (course-engine §5.5), drawn from the learner's own summaries and the tutor's "missed" lines, not generated facts | Reviews are stored with dates |
| **Freshness on topics** | A visual that fades with time since the learner last engaged with a topic, separate from status | Reflection and question dates per topic |
| **Calendar placement** | The planner proposes study sessions in Studiolo's internal calendar; the learner confirms (`mvp-scope.md:137`, Stage 5 T4). External calendar sync stays deferred (`brief.md:56`) | Today's activity calendar already exists |
| **Delivery channels** | Push (none today) and learning emails (Loops is waitlist-only today; the privacy page would need updating) | None needed now |

Rules for when they are built: no streaks, no guilt copy, a weekly time budget the learner sets, and every reminder optional.

## 9. Open questions for the owner

1. Sub-part cap: **5** per part, or another number?
2. Should "Gap" questions offer a sub-Lumen in v1, or written answers only (recommended for v1)?
3. Is the free-text "what I understood" replacing course-engine D7's multiple-choice quiz, or sitting alongside it?
4. Which model runs the tutor review? It's called often, so cost per learner matters.
5. Approve the `course_part_reflections` migration, or store reviews in the `parts` jsonb for the tester phase?

## Sources

- `studiolo` @ `d6e510e`, read only: files cited inline, plus `AGENTS.md`, `project-docs/architecture/course-engine.md`, `project-docs/product/brief.md`, `project-docs/product/mvp-scope.md`, `docs/superpowers/specs/2026-10-16-large-documents-design.md`, `docs/superpowers/specs/2026-10-16-copilot-course-planning-design.md`
- Studiolo Competitive Landscape and Feature Roadmap (8 Oct 2026, owner's research): the tutor loop as the differentiator, no streaks, freshness separate from depth
