# Engineering and System Map: Craft validation

Sources: studiolo @ ad38415 (`/home/user/studiolo`, read-only) and its `project-docs/`; Craft space "Studilo". Checked 17 Oct 2026. No secrets or env values are reproduced. Every diagram below was validated with `scratchpad/mmd/check.sh` (exit 0) and written to Craft as a code block with language `mermaid` (confirmed in the write results).

## 1. Stack & Architecture (04 Engineering), rootBlockId 23ece942-6840-c147-5330-f7934f51b35f

| Claim | Verdict | Evidence |
|---|---|---|
| Next.js 16 | ✅ | `package.json`: next 16.3.5, React 19.3.0, Node 24.x |
| Vercel in Frankfurt | ✅ (set in Vercel UI, not in repo) | `project-docs/implementation/database.md` "Function region": owner set `fra1`; nothing in repo sets a region |
| Neon Postgres + Neon Auth | ✅ | `pg` 8.23.0, `drizzle-orm` 0.45.2, `@neondatabase/auth` 0.5.0-beta, `neon.ts` `auth: true`; auth integration still "not accepted" (`project-docs/architecture/tech-stack.md`) |
| Cloudflare R2 | ✅ | `@aws-sdk/client-s3`; `project-docs/implementation/backend.md` (EU jurisdiction endpoint, region auto) |
| Trigger.dev workers in us-east-1 | ❓ | `trigger.config.ts` sets runtime node-24, small-1x, maxDuration 120, retries; no region anywhere in repo or docs |
| Anthropic API | ✅ | `@anthropic-ai/sdk` 0.133.0; `src/features/ai/purposes.ts` |
| ElevenLabs | ✅ | `src/features/explainers/speech/`, `src/trigger/explainer-tasks.ts` (explainer-speech) |
| PostHog EU | ✅ | `src/features/analytics/config.ts` (`eu.i.posthog.com`), proxy t.getstudiolo.com (`backend.md`) |
| Loops | ⚠️ | Code on main (`src/features/marketing/loops.ts`, `/api/invitation-requests`, `scripts/invite-core.mjs`), but docs say keys not set on Vercel (`backend.md`, `production-cutover.md` Loops) and backend.md still calls it "branch phase-signin-loops, not merged" (docs lag code) |
| 24 migrations on shared Dev | ✅ | `drizzle/0000_huge_reptil.sql` … `drizzle/0023_explainer_series.sql`; 0023 applied to shared Dev 17 Oct (`database.md` Courses) |
| Production DB reserved in London | ✅ | `database.md` table: Studiolo Production noisy-water (reserved); `tech-stack.md`: London `free_v3` |
| Nothing applied to production | ✅ | All production lines unticked in `production-cutover.md`; `src/config/target.ts` rejects `production` |
| (omitted) Dev DB region | ⚠️ | Shared Dev is in Frankfurt `aws-eu-central-1` (fancy-smoke), not London (`database.md`) |
| (omitted) proxy does no auth | ✅ | `src/proxy.ts` only CSP nonce + security headers; auth in `src/http/account-route.ts` `authorizeAccount` and workspace layout `requireAccount` |
| (omitted) Trigger tasks | ✅ | 8 tasks; crons `studiolo-foundation-reconcile` (every minute) and `studiolo-files-sweep` (every 5 min) only in Trigger PRODUCTION env (`src/trigger/*.ts`) |

In-place corrections: none.

Diagrams:

### Deployment and infrastructure
```mermaid
flowchart LR
  B["Browser / phone"] --> V["Vercel: Next.js 16.3.5 app<br/>function region fra1, set in Vercel UI"]
  V -->|"pg pool, runtime role"| DEV[("Neon Postgres: Studiolo Dev<br/>aws eu-central-1 Frankfurt<br/>shared branch, 0000-0023 applied")]
  V -->|"Neon Auth sessions"| NA["Neon Auth on Studiolo Dev"]
  V -->|"presigned URLs"| R2[("Cloudflare R2<br/>private bucket, EU endpoint")]
  B -->|"direct upload / download"| R2
  V -->|"tasks.trigger"| T["Trigger.dev v4.6.3 worker<br/>node-24, small-1x<br/>region not set in repo"]
  T -->|"worker role"| DEV
  T --> R2
  V -->|"copilot, onboarding sketch"| A["Anthropic API"]
  T -->|"explainer author, reading, structure"| A
  T -->|"explainer speech"| E["ElevenLabs"]
  V --> PH["PostHog Cloud EU<br/>via proxy t.getstudiolo.com"]
  T --> PH
  V -->|"waitlist, invited, joined"| L["Loops"]
  PROD[("Neon Studiolo Production<br/>noisy-water, London eu-west-2<br/>reserved, no app migrations")]:::planned
  V -.->|"not connected: target.ts rejects production"| PROD
  classDef planned stroke-dasharray:5 5
```

### Request lifecycle
```mermaid
sequenceDiagram
  participant U as Browser
  participant P as "src/proxy.ts"
  participant R as "API route e.g. /api/explainers"
  participant H as "src/http/account-route.ts"
  participant S as "features service"
  participant D as "db/transaction.ts + Neon"
  participant T as "Trigger.dev task"
  U->>P: request
  P->>P: CSP nonce + security headers only, no auth
  P->>R: forward with x-nonce
  R->>H: authorizeAccount
  H->>H: readSession via Neon Auth, resolveAccount
  H->>H: hasAllowedOrigin on writes, readJsonBody, Zod parse
  H->>S: accountId + parsed input
  S->>D: inTransaction on one checked-out client
  D-->>S: rows, afterCommit hooks
  S->>T: tasks.trigger after commit, idempotency key
  S-->>R: AccountResult ok, denied, not_found, conflict, rejected
  R-->>U: privateJson 200, 403, 404, 409, 422 or 503
```

### Background job architecture
```mermaid
flowchart TB
  EXS["explainers/service.ts + jobs.ts"] -->|"insert in one tx"| J[("jobs<br/>kind explainer_generate, explainer_speech")]
  FND["foundation service, gate disabled"] -->|"jobs + job_units"| J
  FND -->|"reserve, allocate, settle"| U[("usage_reservations, usage_allocations,<br/>usage_entries, usage_grants")]
  FDS["files/dispatch.ts"] -->|"per stored object, no jobs row"| FI["studiolo-files-process-image"]
  EXS -->|"tasks.trigger after commit"| G["explainer-generate<br/>900 s, no retry"]
  G -->|"tasks.trigger per say line"| SP["explainer-speech<br/>300 s, 4 attempts"]
  G --> N[("explainers, explainer_nodes")]
  G -->|"recordProviderUsage"| PUE[("provider_usage_evidence")]
  SP --> SO[("stored_objects + R2 audio")]
  FI --> SO
  CAP["Monthly cap: explainers/spend.ts<br/>+ usage/in-flight.ts holds"] --> PUE
  RC["explainer-render-check<br/>stub skeleton"]:::planned
  EV["explainer-eval-run<br/>stub skeleton"]:::planned
  FJ["studiolo-foundation-job"] --> J
  REC["studiolo-foundation-reconcile<br/>cron every minute, PRODUCTION env"] -->|"foundation_fixture jobs only"| J
  SW["studiolo-files-sweep<br/>cron every 5 min"] --> SO
  SNAP["explainer snapshot / gate<br/>reconcileExplainers on read"] --> N
  classDef planned stroke-dasharray:5 5
```

### Database overview
```mermaid
erDiagram
  accounts ||--o{ auth_identities : "core-schema"
  accounts ||--o| account_preferences : "core-schema"
  accounts ||--o{ invites : "redeemed_account_id"
  accounts ||--o| onboarding : "onboarding-schema"
  accounts ||--o{ topics : "topics-schema"
  topics ||--o{ topics : "parent_id"
  topics ||--o{ topic_relations : "topic_a_id, topic_b_id"
  accounts ||--o{ content_items : "library-schema"
  content_items ||--o| sources : "item_id"
  content_items ||--o{ annotations : "item_id"
  content_items ||--o{ content_topic_tags : "item_id"
  topics ||--o{ content_topic_tags : "topic_id"
  content_items ||--o{ content_relations : "from_item_id, to_item_id"
  collections ||--o{ collection_fields : "collection_id"
  content_items ||--o{ item_field_values : "item_id"
  content_items ||--o{ images : "files-schema"
  content_items ||--o{ stored_objects : "item_id"
  stored_objects ||--o{ link_previews : "image_object_id"
  topics ||--o{ copilot_conversations : "copilot-schema"
  copilot_conversations ||--o{ copilot_messages : "conversation_id"
  copilot_conversations ||--o{ copilot_proposals : "conversation_id"
  copilot_proposals ||--o{ copilot_proposal_items : "proposal_id"
  topics ||--o{ copilot_journal_entries : "topic_id"
  explainers ||--o{ copilot_journal_entries : "explainer_id"
  topics ||--o{ explainers : "anchor_topic_id"
  content_items ||--o{ explainers : "anchor_item_id"
  explainers ||--o{ explainer_nodes : "explainers-schema"
  stored_objects ||--o{ explainer_nodes : "audio_object_id"
  explainers ||--o{ explainer_shares : "explainer_id"
  content_items ||--o{ item_text_extracts : "item_id"
  topics ||--o{ explainer_series : "anchor_topic_id"
  content_items ||--o{ explainer_series : "anchor_item_id"
  jobs ||--o{ explainers : "job_id"
  jobs ||--o{ job_units : "jobs-schema"
  jobs ||--o{ provider_attempts : "job_id"
  jobs ||--o{ usage_reservations : "usage-schema"
  usage_reservations ||--o{ usage_allocations : "reservation_id"
  usage_grants ||--o{ usage_allocations : "grant_id"
  usage_allocations ||--o{ usage_entries : "allocation_id"
  provider_attempts ||--o{ provider_usage_evidence : "attempt_id"
```

## 2. Runbooks (04 Engineering), rootBlockId 7f56312b-3e59-2748-0c32-2c21fbb47ada

| Claim | Verdict | Evidence |
|---|---|---|
| Trigger worker deploy `npx trigger.dev@4.6.3 deploy` | ✅ | devDependency `trigger.dev` 4.6.3 in `package.json`; used by owner for worker 20261016.3 (`production-cutover.md`) |
| Neon setup prompt, invite command, 1B test script are in TBS | ✅ | Craft TBS docs "neon - database prompt" and "1B testing" |
| (added) package.json scripts | ✅ | dev, build, typecheck, lint, test:unit, test:integration, test:e2e, check:docs, db:generate, db:migrate, invite, analytics:forget, foundation:fixtures |
| (added) db:migrate needs MIGRATION_DATABASE_URL + approved target | ✅ | `scripts/migrate.mjs`, `scripts/check-db-target.mjs`, `src/config/target.ts` |
| (added) invite flags | ✅ | `scripts/invite.mjs`: --environment, --email, --expires-at, --no-expiry, --revoke-expired |
| (added) reconcile-jobs is dry-run only | ✅ | `scripts/reconcile-jobs.mjs` throws on --execute |
| (added) library-audit refuses production | ✅ | `production-cutover.md` |
| (gap) lab and live test commands not documented | ❓ | `scripts/lab/vitest.config.ts`, `tests/live` |

In-place correction: block f2469cfa-c0ac-5d9f-31a2-0e8eb50b0180.
- Before: `**Trigger worker deploy:** npx [trigger.dev@4.6.3](mailto:trigger.dev@4.6.3) deploy` (Craft had auto-linked the version as an email address).
- After: ``**Trigger worker deploy:** `npx trigger.dev@4.6.3 deploy` `` (code formatting, no link).

### Release and CI flow
```mermaid
flowchart TB
  BR["Phase branch or worktree<br/>code + project-docs/implementation together"] --> LOC["Run Verify steps locally<br/>lint, typecheck, test:unit, check:docs,<br/>check-prototype.cjs, build"]
  LOC --> OWN{"Owner tested and said merge or push?"}
  OWN -->|no| BR
  OWN -->|yes| MIG{"Code needs a migration?"}
  MIG -->|yes| AUTH["Owner authorizes migration"]
  AUTH --> APPLY["npm run db:migrate<br/>MIGRATION_DATABASE_URL, check-db-target.mjs<br/>on shared Dev first"]
  APPLY --> MERGE
  MIG -->|no| MERGE["Normal merge into main, push<br/>never force-push"]
  MERGE --> GH["GitHub Verify workflow<br/>.github/workflows/verify.yml on push to main"]
  MERGE --> VC["Vercel builds main<br/>deploys app.getstudiolo.com"]
  MERGE --> TW["Owner deploys Trigger worker<br/>npx trigger.dev@4.6.3 deploy"]
  GH --> HEALTH{"Verify green and deployment healthy?"}
  VC --> HEALTH
  HEALTH -->|"red Verify"| BLOCK["Blocks further merges until fixed"]
  INT["Verify integration job<br/>manual workflow_dispatch only"] -.-> GH
  PROD["Production DB cutover<br/>production-cutover.md checklist"]:::planned
  HEALTH -.-> PROD
  classDef planned stroke-dasharray:5 5
```

## 3. AI Lab & Test Results (04 Engineering), rootBlockId 45a622b0-dca4-7f1c-dce8-2b0692ca1730

| Claim | Verdict | Evidence |
|---|---|---|
| Opus low (E9) now live | ✅ | `src/features/ai/purposes.ts` explainer_author claude-opus-5-5 effort low; contract 1.3 section 11 from E9 (`project-docs/implementation/ai.md`) |
| Opus low matches baseline at about a third of the cost | ❓ | tune-up plan quotes ~US$0.13 and 26 s for E9 (`docs/superpowers/plans/2026-10-16-ai-tune-up.md`); baseline ratio in uncommitted lab records |
| Sonnet is the better copilot (E5, E18, E19) | ✅ | purposes.ts copilot_chat claude-sonnet-5-5 medium; ai.md cites E5, E18, E19, E28; T3 66/78 vs Opus 61/78 |
| Sonnet at about a third of the cost | ⚠️ | rate card: Sonnet 5.5 is half of Opus 5.5 per token (`src/features/usage/rate-card.ts`); further savings not evidenced in repo |
| 15k tokens of ranked passages enough (E7) | ✅ | `SOURCE_BUDGET_CHARS = 60_000` (`src/features/explainers/sources/budget.ts`); E7 in `scripts/lab/catalogue.mjs` |
| (omitted) T5 faithfulness fail at that budget | ⚠️ | ai.md tune-up table: 33/40 supported vs E7 41/43; citations 47/47 |
| Splitting writer and drawer always loses (E25–27) | ❓ | experiments exist (`scripts/lab/split.lab.ts`, `split.ts`, `split-analyse.py`, catalogue E25/E26/E27) but results not committed |
| Ratings of 12 explainers unfinished | ✅ | `scripts/lab/calibration.mjs` (12 explainers), `scripts/lab/review.mjs`; no owner-ratings.json; ai.md lists owner ratings as not covered |
| (omitted) E-ids collide with spec assumption ids | ✅ | e.g. E27 retry ladder in `docs/superpowers/plans/2026-10-13-phase-3b2a-assumptions.md` |
| (omitted) in-product eval is a stub | ✅ | `explainer-eval-run` runs `runStubJob` (`src/trigger/explainer-tasks.ts`); `eval_runs`, `eval_results` tables |

In-place corrections: none.

### Test and evaluation layers
```mermaid
flowchart TB
  subgraph CI["Runs in CI Verify, no money"]
    UNIT["tests/unit<br/>vitest, 340 files"]
  end
  subgraph LOCAL["Local, needs dev database"]
    INTEG["tests/integration<br/>npm run test:integration, maxWorkers 1"]
    E2E["tests/e2e<br/>Playwright via scripts/run-e2e.mjs"]
  end
  subgraph LIVE["Opt-in, real providers, spends money"]
    LIVET["tests/live<br/>AI_LIVE=1, e.g. explainer-smoke, organising-eval"]
    LAB["scripts/lab *.lab.ts<br/>LAB_RUN=1 AI_LIVE=1, experiments E1-E28"]
    LABX["scripts/lab-cache, scripts/lab-largedocs"]
  end
  SETS[("evals/explainers: set, lengths, false-premises<br/>evals/copilot: map-building, map-organisation,<br/>map-hierarchy, conversations, explain-chain, lab-extra")]
  SETS --> LAB
  SETS -->|"copilot sets"| LIVET
  SETS -->|"copilot map-building, map-organisation"| UNIT
  LAB --> TUNE["Tune-up harness<br/>tuneup*.lab.ts, tuneup-summary.mjs"]
  TUNE --> PURP["src/features/ai/purposes.ts<br/>models + effort now in code"]
  EVT["explainer-eval-run task<br/>eval_runs, eval_results tables"]:::planned
  LAB -.->|"3B-5 quality loop, designed"| EVT
  classDef planned stroke-dasharray:5 5
```

## 4. neon - database prompt (TBS), rootBlockId c2bd7fbc-6c8f-4e8e-9db2-b5649138da89 (validation section only)

| Claim | Verdict | Evidence |
|---|---|---|
| Steps 1–3 neon CLI install/login/skills/mcp | ❓ | outside repo; `skills-lock.json` records the neon agent skill |
| Step 4 neon link to the production project/branch | ✅ | `project-docs/implementation/README.md` (repo `.neon` link) |
| Step 4 caveat: that is not the app database | ⚠️ | app uses Studiolo Dev (Frankfurt); unqualified `neon env pull` gives a split runtime (`README.md`, `database.md`) |
| Steps 5–6 neon config init + neon.ts | ✅ | `neon.ts` = `defineConfig({ auth: true })`, `@neon/config` 1.7.2 |
| Step 7 neon deploy | ⚠️ | production setup not authorized (`tech-stack.md`); migrations go via `npm run db:migrate` to an approved non-production target |
| Invitation command flags | ✅ | `scripts/invite.mjs` |
| `.worktrees/phase-1a/.env.local` path | ❓ | local, not in repo |
| Invitation block contains a real email address | ⚠️ | privacy note only (address not repeated here) |
| Closing tagline | ❓ | product copy |

In-place corrections: none.

## 5. New doc: System Map (verified) (04 Engineering), rootBlockId bcf156ad-c8d0-7e46-4674-28624d07a215

Contents: intro; Feature connections; Layered architecture; Data ownership; Feature docs and status per code (table); Key code; Connected docs.

### Feature connections
```mermaid
flowchart LR
  ONB["Onboarding<br/>Craft: Settings & Onboarding<br/>switch ONBOARDING"] -->|"writes onboarding row"| LL["Learner line<br/>Craft: Learner context & Memory"]
  LL -->|"copilot/context.ts"| COP["Copilot<br/>Craft: Copilot<br/>switch COPILOT_ACCESS / testers"]
  LL -->|"explainer brief"| EXP["Explainers<br/>Craft: Explainers<br/>tester gate"]
  ONB -->|"starter areas, first explainer"| GR["Graph topics + lanes<br/>Craft: Graph"]
  LIB["Library items<br/>Craft: Library"] <-->|"content_topic_tags"| GR
  COP -->|"proposals create topics"| GR
  COP -->|"Explain X offer"| EXP
  GR -->|"Explainers lane, badges"| EXP
  LIB -->|"item explainers<br/>EXPLAINER_ITEM_GROUNDING"| EXP
  EXP <-->|"explainer_series"| CRS["Courses<br/>Craft: Courses<br/>switch EXPLAINER_COURSES"]
  EXP --> LRN["Learn player + list<br/>Craft: Learn"]
  CRS --> LRN
  TOD["Today T1<br/>Craft: Today<br/>switch TODAY"] -->|"reads"| EXP
  TOD -->|"reads"| COP
  TOD -->|"reads wall"| LIB
  USG["Usage ledger + monthly cap<br/>features/usage, rate-card"] --- COP
  USG --- EXP
  SET["Settings preferences<br/>Craft: Settings & Onboarding"]
  GA["Graph actions: tidy-map plans<br/>Craft: Graph actions"]:::planned
  MEM["Instructions, Goals, Memory, Usage page<br/>Craft: Learner context & Memory"]:::planned
  TODX["Today T2-T6, calendar T4<br/>Craft: Today"]:::planned
  ENG["Course engine long-term<br/>Craft: Course engine"]:::planned
  COP -.-> GA
  LL -.-> MEM
  TOD -.-> TODX
  CRS -.-> ENG
  classDef planned stroke-dasharray:5 5
```

### Layered architecture
```mermaid
flowchart TB
  subgraph UI["UI: src/components/area + app pages"]
    C1["components/library, graph, copilot,<br/>explainers, courses, today, shell"]
    P1["app/(workspace): library, graph, learn,<br/>today, settings; app/e share pages"]
  end
  subgraph EDGE["Edge of the server"]
    PX["src/proxy.ts: CSP + headers"]
    API["src/app/api/*: route handlers"]
    HTTP["src/http: authorizeAccount, origin check,<br/>body limits, privateJson"]
  end
  subgraph FEAT["src/features/area: services + repositories"]
    F1["library, topics, files, links, copilot,<br/>explainers, courses, today, onboarding"]
    F2["jobs, usage, ai, identity, analytics, security"]
  end
  subgraph INFRA["Data + providers"]
    DB[("src/db: Neon Postgres<br/>pool, inTransaction, readForActiveAccount")]
    R2[("Cloudflare R2<br/>features/files storage")]
    TR["src/trigger: Trigger.dev tasks"]
    AN["Anthropic: features/ai/provider.ts"]
    EL["ElevenLabs: explainers/speech"]
  end
  C1 --> P1
  P1 --> PX
  PX --> API
  API --> HTTP
  HTTP --> F1
  P1 -->|"server components read directly"| F1
  F1 --> F2
  F1 --> DB
  F2 --> DB
  F1 --> R2
  F2 -->|"tasks.trigger"| TR
  TR --> F1
  F2 --> AN
  F1 --> EL
```

### Data ownership
```mermaid
flowchart LR
  subgraph IDN["Identity + Settings"]
    CS["core-schema.ts<br/>accounts, auth_identities,<br/>invites, account_preferences"]
  end
  subgraph ONBF["Onboarding"]
    OS["onboarding-schema.ts<br/>onboarding"]
  end
  subgraph GRF["Graph / Topics"]
    TS["topics-schema.ts<br/>topics, topic_relations"]
  end
  subgraph LIBF["Library + Files + Links"]
    LS["library-schema.ts<br/>content_items, library_entries, sources,<br/>annotations, content_topic_tags, content_relations,<br/>collections, collection_fields, item_field_values"]
    FS["files-schema.ts<br/>stored_objects, images, photo_groups, link_previews"]
  end
  subgraph COPF["Copilot"]
    CPS["copilot-schema.ts<br/>copilot_conversations, copilot_messages,<br/>copilot_proposals, copilot_proposal_items,<br/>copilot_journal_entries"]
  end
  subgraph EXPF["Explainers + Courses + Learn"]
    ES["explainers-schema.ts<br/>explainers, explainer_nodes, explainer_issues,<br/>item_text_extracts, explainer_views, explainer_feedback,<br/>explainer_shares, explainer_series, eval_runs, eval_results"]
  end
  subgraph PLAT["Platform: jobs + usage"]
    JS["jobs-schema.ts<br/>jobs, job_units, job_commands, job_outbox,<br/>provider_attempts, job_environment, job_execution_slots,<br/>foundation_targets, foundation_results, foundation_provider_requests"]
    US["usage-schema.ts<br/>usage_grants, usage_reservations,<br/>usage_allocations, usage_entries, provider_usage_evidence"]
  end
  TODF["Today: no tables, reads others"]
  CS --> OS
  CS --> TS
  TS --> LS
  LS --> FS
  TS --> CPS
  TS --> ES
  LS --> ES
  FS --> ES
  JS --> ES
  JS --> US
  TODF -->|"reads"| ES
  TODF -->|"reads"| CPS
  TODF -->|"reads"| LS
```

### Status table (as written to Craft)

| Craft doc | Folder | Status per code | Evidence |
|---|---|---|---|
| Library | 02 Product | built | `src/features/library`, `library-schema.ts`, `files-schema.ts` |
| Graph | 02 Product | built | `src/features/topics`, `topics-schema.ts` |
| Learn | 02 Product | built; course parts behind switch | `src/app/(workspace)/learn` |
| Today | 02 Product | T1 behind `TODAY`; T2–T6 designed | `src/config/today.ts`, `src/features/today` |
| Settings & Onboarding | 02 Product | Settings built; onboarding behind `ONBOARDING` | `src/features/settings`, `src/config/onboarding.ts` |
| Features & Ideas | 02 Product | idea backlog | — |
| Changelog | 02 Product | record only | — |
| Copilot | 03 AI Systems | behind switch (`EXPLAINER_TESTERS` or `COPILOT_ACCESS=all`, needs Anthropic key) | `src/config/copilot.ts` |
| Graph actions | 03 AI Systems | designed | no code |
| Explainers | 03 AI Systems | behind switch (tester gate / `EXPLAINER_ACCESS=all`; items behind `EXPLAINER_ITEM_GROUNDING`) | `src/config/explainers.ts` |
| Courses | 03 AI Systems | behind `EXPLAINER_COURSES` | `src/features/courses` |
| Learner context & Memory | 03 AI Systems | learner line built (behind `ONBOARDING`); rest designed | `src/features/onboarding/learner.ts` |
| Course engine (long-term) | 03 AI Systems | designed | `project-docs/architecture/course-engine.md` |
| Usage and metering (no doc) | — | built | `src/features/usage`, `src/features/explainers/spend.ts` |
| Stack & Architecture / Runbooks / AI Lab | 04 Engineering | reference | — |

## Counts

- Stack & Architecture: 12 ✅, 2 ⚠️, 1 ❓
- Runbooks: 7 ✅, 0 ⚠️, 1 ❓
- AI Lab & Test Results: 6 ✅, 2 ⚠️, 2 ❓
- neon - database prompt: 3 ✅, 3 ⚠️, 3 ❓
- Total: 28 ✅, 7 ⚠️, 7 ❓
