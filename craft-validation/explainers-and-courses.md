# Craft validation: Explainers and courses

Sources: studiolo @ ad38415 (read-only clone at /home/user/studiolo) and its `project-docs/`, checked 17 Oct 2026. Craft space "Studilo". Each Craft doc got an appended "How it works (verified against code)" section with the same validation and diagrams. All diagrams passed the mmd check.sh syntax check.

Totals (as written to Craft): 44 ✅, 7 ⚠️, 3 ❓ across four docs.

## 1. Explainers (03 AI Systems) — rootBlockId df9cae40-8e15-20f5-475e-0922478c14d7

In-place corrections: none.

| Claim | Verdict | Evidence (studiolo @ ad38415) |
|---|---|---|
| Built | ✅ | `src/trigger/explainer-tasks.ts`, `src/features/explainers/run.ts`, `project-docs/implementation/ai.md` (Purpose and status) |
| Testers only | ✅ default / ⚠️ | `EXPLAINER_TESTERS` fail-closed in `src/config/explainers.ts`; but `EXPLAINER_ACCESS=all` admits every signed-in account (`readExplainerAccess`), so it is a switch, not a rule |
| Drawn live in the browser | ✅ | `src/features/explainers/player/`, `project-docs/architecture/overview.md` |
| 2–6 minutes | ✅ (target) | `project-docs/architecture/overview.md` (length target, ~1,500 narration words hard limit) |
| With citations | ⚠️ | Only item explainers (grounding `strict`, contract 1.2 `<sources>`) carry checked citations; topic explainers are `open` with no source text — `src/features/explainers/service.ts`, `src/features/explainers/ingest/citations.ts` |
| Opus 5.5 low writes | ✅ | `src/features/ai/purposes.ts` `explainer_author` (repairs: Opus 5.5 medium) |
| ElevenLabs voices | ✅ | `src/features/explainers/speech/elevenlabs.ts`, `src/config/speech.ts` (estimated timings without key) |
| Hosted voice actually on | ❓ | ai.md (Explainer speech) still says no hosted ElevenLabs key is set; not verifiable from code |
| ~$0.09 per topic explainer without voice | ✅ | ai.md Tune-up verification: US$0.087 (run 3) |
| First slide median ~20 s | ✅ | same: 20.5 s (run 3) |
| Item faithfulness dropped (33/40) | ✅ | same: 33 of 40 supported vs E7 41 of 43 |
| 1 in 3 first slides 14–34 s | ❓ | not found in code or project-docs |
| Phone text tiny | ❓ | not found in code or project-docs |
| Voice cost unmeasured | ✅ | ai.md Evaluation harness, Limits (voice not measured) |
| (omitted) 2 in flight per account + monthly cap | ✅ | `MAX_ACTIVE_EXPLAINERS_PER_TESTER`, `src/features/explainers/gate.ts` |
| (omitted) entry points: topic dialog, Library item, copilot Make it, free onboarding explainer | ✅ | `src/app/api/explainers/route.ts`, `src/app/api/copilot/messages/[messageId]/explainer/route.ts`, `src/features/onboarding/service.ts` (`free: true`) |
| (omitted) share, feedback, Retry voice, Cancel, Try again | ✅ | `src/app/api/explainers/[explainerId]/*`, `src/features/explainers/player/actions.ts` |
| (omitted) stuck runs reconciled on read (snapshot/gate), not by cron | ✅ | `src/features/explainers/reconcile.ts`; `src/trigger/reconcile-task.ts` is the foundation-job cron |
| (omitted) render-check and eval tasks are skeletons | ✅ | `src/trigger/explainer-tasks.ts` |

### Generation pipeline

```mermaid
sequenceDiagram
  autonumber
  participant UI as "ExplainDialog / copilot offer card"
  participant API as "/api/explainers routes"
  participant SVC as "generateQuick (explainers/service.ts)"
  participant DB as "Postgres: explainers, jobs"
  participant TR as "Trigger.dev explainer-generate"
  participant AN as "Anthropic API"
  participant SP as "Trigger.dev explainer-speech"
  participant EL as ElevenLabs
  participant R2 as "R2 via stored_objects"
  participant PL as "Player (/learn/explainers/id)"
  UI->>API: createKey, topicId or itemId, request
  API->>SVC: generateQuick, origin button
  SVC->>DB: lock account, checkGenerationGate (2 at once, monthly cap)
  SVC->>DB: INSERT explainers queued + jobs explainer_generate
  SVC->>TR: tasks.trigger after commit, concurrencyKey = account
  SVC-->>UI: 201 started, explainerId
  TR->>DB: beginGeneration, status streaming
  opt item anchor
    TR->>R2: read item text, prepareSources
    opt large item with EXPLAINER_COURSES on
      TR->>AN: structure step on Haiku 5.5, Sonnet 5.5 fallback
    end
  end
  TR->>AN: explainer_author on Opus 5.5, effort low, streamed markup
  loop each accepted node
    TR->>DB: saveNode to explainer_nodes
    TR-->>PL: append to Realtime stream
    TR->>SP: one run per say revision
    SP->>EL: text-to-speech with-timestamps
    SP->>R2: MP3 audio object
    SP->>DB: link audio, words, provider_usage_evidence
  end
  opt rejected nodes
    TR->>AN: explainer_repair, Opus medium
  end
  TR->>R2: storeMarkup
  opt course part
    TR->>AN: explainer_reading, Opus low
  end
  TR->>DB: wait for speech, completeGeneration finished or failed
  PL->>API: GET snapshot, POST realtime-token, GET audio node 302 to R2
```

### Explainer lifecycle

```mermaid
stateDiagram-v2
  [*] --> queued: generateQuick inserts row and job
  queued --> streaming: beginGeneration in explainer-generate
  queued --> failed: dispatch_unavailable or stalled
  streaming --> repairing: ingest rejects a node
  repairing --> streaming: repair accepted, writing resumes
  streaming --> finished: done complete, markup stored, speech settled
  repairing --> finished: done complete
  streaming --> failed: refused, stream_broken, provider_unavailable
  repairing --> failed: refused, stream_broken, provider_unavailable
  queued --> failed: cancelled by owner
  streaming --> failed: cancelled or stalled
  repairing --> failed: cancelled or stalled
  finished --> [*]
  failed --> [*]
  note right of failed
    failure code is required when failed.
    Learn shows Stopped for cancelled,
    Could not finish otherwise. Try again makes a new explainer.
  end note
```

### Explainer tables

```mermaid
erDiagram
  accounts ||--o{ explainers : owns
  topics |o--o{ explainers : "anchor_topic_id"
  content_items |o--o{ explainers : "anchor_item_id"
  jobs ||--o{ explainers : "job_id"
  stored_objects |o--o{ explainers : "markup_object_id"
  explainers ||--o{ explainer_nodes : has
  stored_objects |o--o{ explainer_nodes : "audio_object_id"
  explainers ||--o{ explainer_issues : has
  explainers ||--o| explainer_views : "per account"
  explainers ||--o{ explainer_feedback : has
  explainers ||--o{ explainer_shares : "one live share"
  content_items ||--o{ item_text_extracts : has
  explainers {
    uuid id PK
    uuid account_id FK
    text anchor_kind "topic item none"
    text status "queued streaming repairing finished failed"
    text grounding "open strict"
    text origin "button copilot eval"
    text contract_version
    jsonb models
    text run_id
    text failure
    int time_to_first_slide_ms
  }
  explainer_nodes {
    uuid id PK
    uuid explainer_id FK
    int seq
    text node_id
    text kind "item say followup reading"
    jsonb payload
    jsonb words
    int revision
    timestamptz superseded_at
  }
  explainer_issues {
    uuid id PK
    text stage "ingest render speech animation grounding"
    text tier "reject warn autofix"
    text code
  }
  explainer_views {
    uuid account_id PK
    uuid explainer_id PK
    int position_ms
    timestamptz watched_to_end_at
  }
  explainer_shares {
    uuid id PK
    text code "22 chars"
    timestamptz revoked_at
  }
  item_text_extracts {
    uuid id PK
    uuid item_id FK
    text source_fingerprint
    text status "pending ready unreadable failed"
    uuid text_object_id
  }
  jobs {
    uuid id PK
    text kind "explainer_generate explainer_speech"
    text state
    text input_snapshot
  }
```

### Connections

```mermaid
flowchart LR
  classDef planned stroke-dasharray:5 5
  GR["Graph: topic Explain dialog"] -->|"POST /api/explainers"| EX["Explainers service + worker"]
  LIB["Library: Explain item button"] -->|"item anchor, EXPLAINER_ITEM_GROUNDING"| EX
  CP["Copilot: explain tool, Make it"] -->|"POST /api/copilot/messages/id/explainer"| EX
  ON["Onboarding step 6"] -->|"free first explainer"| EX
  LC["Learner line from onboarding answers"] -->|"into every brief"| EX
  EX -->|"explainer_made journal + system entry"| CP
  EX --> LEARN["Learn list and player"]
  EX --> TODAY["Today, behind TODAY: explainers, new count"]
  EX --> SH["Public share page"]
  EX --> CO["Courses: each part is an explainer"]
  CO --> LEARN
  ST["Settings: time zone"] --> LEARN
  EX --> US["Usage ledger: monthly cap"]
  CE["Course engine: Planner, Learner Model, evidence"]:::planned
  EX -.->|"watching is not evidence yet"| CE
  CE -.->|"spaced reviews"| TODAY
```

## 2. Learn (02 Product) — rootBlockId 6069a260-6d64-092a-9d1f-09947cd8b281

In-place corrections: none.

| Claim | Verdict | Evidence |
|---|---|---|
| Built | ✅ | `src/app/(workspace)/learn/(list)/page.tsx` |
| Explainers list Today / This week / Earlier | ✅ | `src/features/explainers/learn/model.ts` `groupByDay`, `dayGroup` (account time zone, else browser; This week = six days before today) |
| Course cards | ✅ / ⚠️ | `CourseCard` in `src/components/explainers/explainer-list.tsx`; only for an explainer tester with `EXPLAINER_COURSES` on (`EXPLAINER_ACCESS=all` does not widen) |
| Continue | ✅ | `pickContinue`, `ContinueCard` (course-aware) |
| (omitted) status labels New/Continue/Watched/Making…/Stopped/Couldn't finish | ✅ | `model.ts` `listStatus` |
| (omitted) topic filter chips `?topic=`, 4 s snapshot poll, refresh on return | ✅ | `explainer-list.tsx` (`MAKING_POLL_MS`, `SETTLE_REFRESH_MS`) |
| (omitted) placeholder for non-makers with no explainers | ✅ | `learn/(list)/page.tsx` |
| (omitted) old Courses/Learning paths/Planner tabs redirect to /learn | ✅ | `src/app/(workspace)/learn/[section]/page.tsx` |
| (omitted) jobs card lives in workspace layout | ✅ | `src/app/(workspace)/layout.tsx`, `src/components/explainers/jobs-card.tsx` |
| (omitted) list capped at 200, no search | ✅ | `src/features/explainers/learn/repository.ts` `LIST_LIMIT` |

### Page composition and data sources

```mermaid
flowchart TD
  P["/learn page.tsx, server"] --> G{"requireAccount allowed?"}
  G -->|no| X["redirect sign-in or access"]
  G -->|yes| R["readForActiveAccount"]
  R --> A["loadExplainerList: explainers + explainer_views + content_items + explainer_shares, max 200"]
  R --> B["readTimeZone: account_preferences"]
  R --> C{"EXPLAINER_COURSES on and tester?"}
  C -->|yes| D["loadCourseSummaries: explainer_series"]
  C -->|no| E["no courses"]
  A --> H{"no explainers and cannot make?"}
  H -->|yes| PH["Placeholder: Learning will appear here"]
  H -->|no| L["ExplainerList, client"]
  B --> L
  D --> L
  E --> L
  L --> F["Topic filter chips, ?topic=id"]
  L --> CC["Continue card: last played, not watched"]
  L --> DG["Day groups: Today, This week, Earlier"]
  DG --> K1["Explainer cards"]
  DG --> K2["Course cards: one per course, parts hidden"]
  K1 -.->|"every 4 s while making"| S["GET /api/explainers/id/snapshot"]
  K2 -->|"Delete course"| DS["DELETE /api/series/id"]
```

### Card status rules

```mermaid
flowchart LR
  S{"explainers.status"} -->|"queued, streaming, repairing"| M["Making…"]
  S -->|"failed, failure = cancelled"| ST["Stopped"]
  S -->|"failed, other failure"| F["Could not finish"]
  S -->|finished| V{"explainer_views row?"}
  V -->|none| N["New"]
  V -->|"watched_to_end_at set"| W["Watched"]
  V -->|"position_ms > 0"| C["Continue"]
  V -->|"position_ms = 0"| N
  C --> CC["Candidate for the Continue card: latest last_viewed_at wins"]
```

## 3. Courses (03 AI Systems) — rootBlockId 400b1254-7d0b-d4c4-241e-69e2527ae8f4

In-place correction (block e70e1726-bb63-3734-90d5-81a192ddddab):
- Before: "Large items or topics become a course: Part 0 overview plus 3–6 parts, each an explainer with a 400–700 word Reading. Parts are made when opened. A 6-part course costs about $2."
- After: "Large items or topics become a course: Part 0 overview plus parts, each an explainer. A large item gets 3–6 parts from the structure step; a topic course follows the map (its sub-topics, up to 24 parts in all) or a copilot plan. Each course part gets a 400–700 word Reading. Parts are made when opened. A 6-part item course costs about $2 (spec estimate)."

| Claim | Verdict | Evidence |
|---|---|---|
| Built (merged 84f1697e, worker 20261017.3, not formally accepted) | ✅ | `project-docs/implementation/ai.md` (Purpose and status) |
| Behind EXPLAINER_COURSES | ✅ | `src/config/explainers.ts` `isCoursesOn` |
| Testers only | ✅ | `src/features/courses/http.ts` (EXPLAINER_TESTERS; ACCESS=all does not widen); item courses also need `EXPLAINER_ITEM_GROUNDING` |
| Large items or topics become a course | ✅ | `src/features/courses/service.ts` `startCourse` |
| Part 0 overview | ✅ | `src/features/courses/plan.ts` ("The whole thing" / "The whole topic") |
| plus 3–6 parts | ⚠️ | true for item courses only (`MIN_SERIES_PARTS` 3, `MAX_SERIES_PARTS` 6); topic courses = Part 0 + children/grandchildren up to `MAX_TOPIC_COURSE_PARTS` 24; copilot plans 4–12 (≤39) — `plan.ts`, `types.ts`, ai.md (Course plans). Corrected in place |
| Each part an explainer with a 400–700 word Reading | ✅ | `src/features/explainers/run.ts` `writeReading`, `reading.ts`, purpose `explainer_reading` (Opus low); not measured live |
| Parts made when opened | ✅ | `src/components/courses/course-viewer.tsx` `go` → `POST /api/series/[seriesId]/parts/[key]` |
| 6-part course ≈ $2 | ✅ (estimate) | `docs/superpowers/specs/2026-10-16-large-documents-design.md` §6: USD 2.05 |
| (omitted) structure step Haiku 5.5 → Sonnet 5.5 inside a large item explainer | ✅ | `src/features/explainers/sources/structure.ts`, `purposes.ts` |
| (omitted) three entry points | ✅ | `GET /api/items/[itemId]/course-offer`, `POST /api/series`, `POST /api/copilot/messages/[messageId]/course` |
| (omitted) stale item courses refuse new parts | ✅ | `service.ts` `isStale`, `STALE_COURSE_MESSAGE` |
| (omitted) "Also on this book" one-chapter extras | ✅ | `service.ts` `listExtras` |
| (omitted) `intro` column never written (Sonnet intro not built) | ⚠️ | `service.ts` `newCourse` sets `intro: null`; spec §3 planned a Sonnet intro |
| Voice for course parts | ❓ | not run before merge — `docs/superpowers/plans/2026-10-16-courses-report.md` |

### Starting a course and making parts

```mermaid
sequenceDiagram
  autonumber
  participant UI as "Explain dialog / Graph topic / copilot plan card"
  participant API as "POST /api/series or /api/copilot/messages/id/course"
  participant CS as "courseService (courses/service.ts)"
  participant DB as "explainer_series"
  participant EX as "generateQuick"
  participant V as "Course viewer /learn/series/id/part"
  UI->>API: start, item or topic, first overview or series
  API->>CS: startCourse or applyPlan
  CS->>CS: allowed: tester + EXPLAINER_COURSES, item also needs item grounding
  alt item course
    CS->>CS: readStructure from item extract, need 3 or more parts
    CS->>DB: insert itemPlan: Part 0 + up to 6 parts with span ranges
  else topic course
    CS->>DB: insert topicPlan: Part 0 + children and grandchildren, max 24
  else copilot plan
    CS->>DB: upsertPlanned, structure_version copilot-plan-1
  end
  CS->>EX: make first part with series snapshot
  EX-->>CS: started, explainerId
  CS->>DB: setPartExplainer in the same transaction
  CS-->>V: open the part
  V->>API: POST /api/series/id/parts/key when an unmade part is opened
  API->>CS: makePart, refused as stale if the item changed
```

### Course tables

```mermaid
erDiagram
  accounts ||--o{ explainer_series : owns
  content_items |o--o{ explainer_series : "anchor_item_id"
  topics |o--o{ explainer_series : "anchor_topic_id"
  explainer_series ||--|{ PART_JSON : "parts jsonb, 1 to 40"
  PART_JSON |o--o| explainers : "explainerId"
  explainers ||--o{ explainer_nodes : "incl. kind reading"
  explainers ||--o| explainer_views : progress
  explainer_series {
    uuid id PK
    uuid account_id FK
    text anchor_kind "item topic"
    text structure_version "item version or copilot-plan-1"
    text title
    text intro "always null today"
    jsonb parts
  }
  PART_JSON {
    string key "0, number or topic id"
    string title
    string about
    string group
    json range "span from to"
    uuid topicId
    uuid explainerId
    string focus
    uuid itemId
  }
```

### Part states

```mermaid
stateDiagram-v2
  [*] --> unmade: part in plan, explainerId null
  unmade --> making: opened or Next, makePart
  making --> ready: explainer finished
  making --> failed: explainer failed or stopped
  failed --> making: Try again, new createKey
  ready --> watched: watched to end
  watched --> [*]
```

## 4. Course engine (long-term) (03 AI Systems) — rootBlockId fa2bd429-ffbc-547a-cacf-421115709065

In-place corrections: none. Compared with `project-docs/architecture/course-engine.md`.

| Claim | Verdict | Evidence |
|---|---|---|
| Proposed for Stage 4, spec v1.1, 12 Oct | ✅ | `course-engine.md` Status; `project-docs/product/mvp-scope.md` Stage 4 |
| Course Planner | ✅ (planned) | §3, §5: copilot tools `draft_course`, `revise_course`, `accept_course`, `get_next_step` |
| Explainer Service one lesson ahead | ✅ (planned) | §0, §5.4 R1 |
| Learner Model unseen → exposed → assumed → self-explained → retrieved → retained | ✅ (planned) | §6.2 (plus `shaky` flag, levels only go up) |
| Spaced reviews | ✅ (planned) | §5.5 (1, 3, 7, 21 days, review lessons) |
| ...feeding Today | ⚠️ | engine spec never mentions Today; reviews feed the Planner as review lessons. Today design plans a course Continue (T2), not reviews — `docs/superpowers/specs/2026-10-16-today-design.md` |
| (omitted) nothing of the engine is in code | ✅ | no concept/evidence/quiz tables in `drizzle/`, no planner in `src/features/` |
| (omitted) built Courses is a simpler, different thing; course-engine.md status "none of it is implemented" predates it | ⚠️ | `src/features/courses/`, `drizzle/0023_explainer_series.sql`, copilot `plan_course` (not `draft_course`) |
| (omitted) Phase 3B departures (video only, open/strict grounding, MP3, landscape, Learn not Library) | ✅ | `course-engine.md` "What Phase 3B takes from it" |

### Designed engine versus what is built

```mermaid
flowchart LR
  classDef planned stroke-dasharray:5 5
  classDef built stroke-width:2px
  CP["Copilot plan_course tool"]:::built --> SER["explainer_series + course viewer"]:::built
  GR["Graph topic click"]:::built --> EXS["Explainer service, quick video"]:::built
  SER --> EXS
  EXS --> LEARN["Learn list"]:::built
  PL["Course Planner: mission, chapters, lessons, re-plan"]:::planned
  LM["Learner Model: unseen to retained, shaky flag"]:::planned
  LP["Lesson page: page + quiz + notes"]:::planned
  RV["Spaced reviews 1, 3, 7, 21 days"]:::planned
  CTX["Context Provider: card, map, retrieve, read_span"]:::planned
  TODAY["Today T1, read-only, behind TODAY"]:::built
  CP -.->|"draft, revise, accept, next step"| PL
  PL -.->|"lesson brief, one lesson ahead"| EXS
  LP -.->|"evidence, quiz answers"| LM
  LM -.-> RV
  RV -.->|"review lessons"| PL
  RV -.->|"not in the engine spec, Today T2 adds courses later"| TODAY
  PL -.-> CTX
  EXS -.-> CTX
```

### Learner Model levels (planned)

```mermaid
stateDiagram-v2
  classDef planned stroke-dasharray:5 5
  [*] --> unseen
  unseen --> exposed: completes a quick-mode explainer
  exposed --> assumed: completes a course lesson or claims it
  unseen --> assumed: completes a course lesson or claims it
  assumed --> self_explained: notes use the concept correctly
  assumed --> retrieved: correct first-try quiz answer
  self_explained --> retrieved: correct first-try quiz answer
  retrieved --> retained: correct first-try in a review lesson, 3 or more days later
  note right of retrieved
    shaky is a flag on top, set by a wrong answer
    or a misconception, cleared by a later correct answer.
    Levels only go up. Nothing here is built.
  end note
  class unseen, exposed, assumed, self_explained, retrieved, retained planned
```
