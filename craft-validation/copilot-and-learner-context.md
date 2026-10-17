# Craft validation: Copilot and Learner context

Area slug: copilot-and-learner-context. Checked against studiolo @ ad38415 (`/home/user/studiolo`, main) and its project-docs on 17 Oct 2026. Craft space "Studilo". Every diagram was syntax-checked with the shared `check.sh` (exit 0) and stored in Craft as a code block with language `mermaid` (confirmed in the write responses). No in-place corrections were made in any doc; all additions were appended under `## How it works (verified against code)`.

Totals across the three docs: 19 ✅ (2 of them partly ❓), 1 ⚠️, 5 ❓.

---

## 1. Copilot (03 AI Systems) — rootBlockId 9602d008-37ce-15be-3383-6e66045c4676

### Validation

| Claim (Craft doc "Copilot") | Verdict | Evidence (studiolo @ ad38415) |
|---|---|---|
| Built | ✅ | `src/features/copilot/`, `src/app/api/copilot/`; `project-docs/implementation/ai.md` Purpose and status (3A, 3A-2, 3B-2b, 3B-4, courses merged into main). Note: Phase 3A is "not accepted" by the owner formally. |
| On for everyone | ✅ / ❓ | `src/config/copilot.ts`: `COPILOT_ACCESS=all` admits every account, otherwise only `EXPLAINER_TESTERS` (fail closed). ai.md says the owner set `COPILOT_ACCESS` on Vercel production on 16 Oct; env value not verifiable from code. |
| Runs on Sonnet 5.5 | ✅ | `src/features/ai/purposes.ts`: `copilot_chat` = `claude-sonnet-5-5`, effort medium, maxTokens 16,000, 5 calls/turn. |
| About $0.01–0.03 per turn | ✅ | ai.md Usage accounting: Sonnet medium turn US$0.008–0.03 (lab); course-planning turn US$0.039. In-flight hold US$0.15/turn: `src/features/usage/in-flight.ts`. |
| One assistant with map, area and topic chats | ✅ | `src/db/copilot-schema.ts` (scope map/topic; one conversation per topic), `src/features/copilot/levels.ts`, `context.ts` (area chat = top-level topic's conversation). |
| Proposes ghost topics; Keep or Dismiss | ✅ | `propose_topics` → `copilot_proposals`/`copilot_proposal_items` only; Keep → `createTopicsBatch` (`src/features/copilot/proposals.ts`); routes `proposals/[proposalId]/keep|dismiss|undo`. Undo also exists. |
| Explainer offers | ✅ | `src/features/copilot/tools/explain.ts` (costly tool → confirm card), `explainer-offer.ts` (Make it → `generateQuick`, no model call). |
| Course plans (implied for everyone) | ⚠️ | Built, but `read_course`/`plan_course` are only offered when `coursesAllowed` = explainer tester + `EXPLAINER_COURSES=on` (`src/features/courses/http.ts`, `src/features/copilot/service.ts`, `tools/course.ts`). Not part of "on for everyone". |
| Not built: voice input | ✅ | `project-docs/design/graph.md` departure C23 "No ＋ and no mic"; no mic/speech code in `src/components/copilot/`. |
| Not built: Continue card, journal filters | ✅ | `project-docs/design/graph.md` departure C22. |
| Not built: resource cards | ✅ | No resource tool in `src/features/copilot/tools/index.ts`; "real resources only" is scope in `project-docs/product/mvp-scope.md`. |
| Not built: ask-first change cards | ✅ | `src/features/ai/tools/registry.ts`: a `change` tool cannot be enabled (registering one throws). |

**Built behaviour the doc omits:** Start fresh / Delete conversation (`conversations/fresh|delete`, `history_from`); Stop (`messages/[id]/stop`); `show_on_map`; clarifying questions; item explainer offers behind `EXPLAINER_ITEM_GROUNDING`; server-side refusal fallback; per-account monthly cap (`checkCopilotAccess` in `src/features/copilot/access.ts`); one `provider_usage_evidence` row per model attempt; the model never writes the map; it cannot reorganise existing topics (points to Move to…); only Library item titles (≤10, via `read_topic`) reach the model, never note/item bodies or files.

### Diagrams

#### Chat request sequence

```mermaid
sequenceDiagram
    autonumber
    participant UI as "Copilot panel use-copilot / gateway.ts"
    participant R as "POST /api/copilot/messages"
    participant S as "copilotService.startTurn"
    participant A as "admitTurn store.ts"
    participant DB as "Postgres studiolo.*"
    participant T as "runTurn turn.ts"
    participant M as "callModel to Anthropic Sonnet 5.5"
    UI->>R: text, scope, focusTopicId, createKey
    R->>S: authorizeAccount then startTurn
    S->>A: one transaction
    A->>DB: lock account, checkCopilotAccess - access, key, monthly cap
    A->>DB: lock or create copilot_conversations row
    A->>DB: read history since history_from, readTopicGraph, pendingSummaries
    A->>DB: readLearnerLine from onboarding
    A->>DB: insert user message and streaming assistant message
    A-->>S: admitted with history and studiolo_context block
    S-->>UI: NDJSON stream opens - accepted event
    S->>T: run turn, at most 5 model calls, 240 s budget
    loop each model call
        T->>M: system blocks, tools, replayed history, user content
        M-->>T: text_delta, tool_use, usage, stop
        T-->>UI: text and status events
        T->>DB: recordCopilotUsage - provider_usage_evidence row
        opt tool_use
            T->>DB: read_map, read_topic, find_topics or propose_topics writes copilot_proposals
        end
    end
    opt explain or plan_course or ask_clarifying_question
        T-->>UI: explainer, course_plan or question card - turn ends
    end
    T->>DB: finishTurn - assistant state finished, display, provider_content
    T-->>UI: done
```

#### Conversation and message tables

```mermaid
erDiagram
    accounts ||--o{ copilot_conversations : has
    topics |o--o| copilot_conversations : "topic_id, null for map"
    copilot_conversations ||--o{ copilot_messages : contains
    copilot_messages |o--o{ copilot_messages : "parent_id reply to"
    copilot_conversations ||--o{ copilot_proposals : has
    copilot_messages ||--o{ copilot_proposals : "message_id"
    copilot_proposals ||--o{ copilot_proposal_items : "1 to 24 names"
    copilot_proposal_items |o--o| topics : "topic_id once kept"
    topics ||--o{ copilot_journal_entries : journal
    copilot_proposals |o--o{ copilot_journal_entries : proposal_id
    explainers |o--o{ copilot_journal_entries : explainer_id
    copilot_messages |o--o{ provider_usage_evidence : copilot_message_id
    copilot_conversations {
        uuid id PK
        uuid account_id
        text scope "map or topic"
        uuid topic_id
        timestamptz history_from "Start fresh"
    }
    copilot_messages {
        uuid id PK
        uuid conversation_id
        int seq
        text role "user assistant tool system"
        text state "streaming finished stopped failed"
        text body
        jsonb display "question explainer course"
        jsonb provider_content
        text model
        text prompt_version
    }
    copilot_proposals {
        uuid id PK
        uuid message_id
        text tool_use_id
        text parent_kind
        uuid parent_topic_id
        text state
        text reason
    }
    copilot_proposal_items {
        uuid id PK
        uuid proposal_id
        smallint position
        text name
        text state
        uuid parent_item_id "nested group"
        uuid topic_id
    }
    copilot_journal_entries {
        uuid id PK
        uuid topic_id
        text kind
        jsonb payload
        text event_key
    }
    provider_usage_evidence {
        uuid id PK
        text purpose "copilot_chat"
        text model
        bigint input_units
        bigint output_units
        text event_key "copilot:msg:call"
        text outcome
    }
```

#### What the copilot model receives

```mermaid
flowchart LR
    classDef planned stroke-dasharray:5 5
    subgraph Prefix["Cached prefix - same for every learner"]
        SYS["6 system blocks prompt/system.ts<br/>WHO, CAN_DO, MAP_BUILDING,<br/>ORGANISING, EXPLAINERS, DATA_AND_SAFETY<br/>plus Courses block when flag on"]
        TOOLS["Tools registry.ts<br/>read_map, read_topic, find_topics,<br/>show_on_map, ask_clarifying_question,<br/>propose_topics, explain,<br/>read_course and plan_course with courses flag"]
    end
    HIST["Replayed history<br/>since Start fresh, about 50k tokens<br/>history.ts"]
    subgraph Turn["User message of this turn"]
        CTX["studiolo_context JSON<br/>buildTurnContext context.ts"]
        EVT["studiolo_event rows<br/>e.g. learner started an explainer"]
        TXT["Learner text"]
    end
    G["Topic graph<br/>names, paths, descriptions,<br/>statuses, My Focus"] --> CTX
    P["Pending suggestion names"] --> CTX
    X["Area outline, nowLookingAt,<br/>fromAreaChat, origin extracts"] --> CTX
    L["Learner line<br/>readLearnerLine onboarding"] --> CTX
    LIB["Library item id, title, kind<br/>max 10, only via read_topic tool"] --> TOOLS
    SYS --> MODEL["Anthropic claude-sonnet-5-5<br/>effort medium"]
    TOOLS --> MODEL
    HIST --> MODEL
    CTX --> MODEL
    EVT --> MODEL
    TXT --> MODEL
    MEM["Instructions and Memory entries"]:::planned -.-> CTX
    NEVER["Never sent: note bodies, item text,<br/>files, photos, PDFs"]
```

#### Connections to other features

```mermaid
flowchart TB
    classDef planned stroke-dasharray:5 5
    COP(("Copilot"))
    GRAPH["Graph - topics"]
    LIB["Library - content items tagged to topics"]
    EXP["Explainers - generateQuick, Trigger worker"]
    CRS["Courses - applyPlan"]
    ONB["Onboarding - learner line"]
    LEARN["Learn list"]
    USAGE["Usage ledger and monthly cap"]
    TODAY["Today"]
    LC["Learner context - Instructions, Memory, Goals"]:::planned
    GRAPH -->|"graph read every turn"| COP
    COP -->|"propose_topics, Keep runs createTopicsBatch"| GRAPH
    COP -->|"show_on_map focus"| GRAPH
    LIB -->|"read_topic item titles"| COP
    COP -->|"explain offer, Make it"| EXP
    EXP -->|"journal entry and studiolo_event"| COP
    COP -->|"plan_course card, Start"| CRS
    ONB -->|"learner line in context"| COP
    COP -->|"provider_usage_evidence copilot_chat"| USAGE
    USAGE -->|"cap_reached blocks admission"| COP
    EXP --> LEARN
    CRS --> LEARN
    LC -.->|"designed, not built"| COP
    COP -.->|"goal suggestions T3, not built"| TODAY
```

---

## 2. Learner context & Memory (03 AI Systems) — rootBlockId 52ea05a8-f1e8-d18d-871d-095584e9ebe1

### Validation

| Claim (Craft doc "Learner context & Memory") | Verdict | Evidence |
|---|---|---|
| Designed, not built | ✅ | No Instructions/Memory/goal tables in `src/db/*-schema.ts`; Settings has Profile (preferences), Privacy, Foundation only (`src/app/(workspace)/settings/page.tsx`). |
| Not approved, on branch learner-context-design | ❓ | `git ls-remote` shows only `main` on the remote; branch and its design not available. |
| Instructions written by you | ✅ (as agreed scope, not built) | `project-docs/product/mvp-scope.md` "Instructions for Studiolo"; planned record in `project-docs/architecture/data-model.md`. |
| Goals written by you; Goals are notes with a goal record | ✅ / ❓ | Owner choice 16 Oct "goals as Library notes the copilot recognises, plus Settings" in `docs/superpowers/specs/2026-10-16-today-design.md` (T3 waits). The "goal record" detail is not in the repo. |
| Separate from My Focus | ✅ | My Focus exists as `topics.want_to_learn` (`src/db/topics-schema.ts`), sent to the copilot as `myFocus` (`context.ts`). |
| Memory maintained by the app and editable | ✅ (as agreed scope, not built) | `project-docs/product/mvp-scope.md` (entries readable/editable/deletable, default-on toggle); `data-model.md` Memory entry / evidence / context snapshot. |
| Usage shown as a percentage | ❓ | No usage display in code; only ledger `provider_usage_evidence` + hard monthly cap (`src/features/copilot/access.ts`, `src/features/explainers/spend.ts`). Phase 3D Studiolo tokens planned (`mvp-scope.md`). The 0–100% ring in `src/components/copilot/copilot-home.tsx` is the map progress card, not usage. |
| Decisions L-D1..15 are open | ❓ | Not in the repo. |

**Built behaviour the doc omits:** the interim learner line (Track 2 B3). `learnerLine` (`src/features/onboarding/answers.ts`) builds one or two sentences from onboarding answers (`onboarding` table, migration 0022); `readLearnerLine` (`src/features/onboarding/learner.ts`) is read fresh at every copilot admission (`src/features/copilot/store.ts` → `context.ts` `learner` section) and for every explainer (`collectBriefContext` → `fitJobInput` job `context.learner` → `brief.ts` "Learner: …"). It never uses the word "memory". Open context-engineering questions are recorded in ai.md Current limits, none decided.

### Diagrams

#### Context pipeline into every AI call

```mermaid
flowchart LR
    classDef planned stroke-dasharray:5 5
    subgraph Built["Built on main"]
        ONB[("studiolo.onboarding<br/>field_key, field_text, first_interest,<br/>purpose, level")]
        RLL["readLearnerLine<br/>onboarding/learner.ts"]
        LL["learnerLine - one or two sentences"]
        FOCUS[("topics.want_to_learn<br/>My Focus")]
        COPCTX["Copilot studiolo_context<br/>learner section, every turn"]
        JOB["generate job context.learner<br/>fitJobInput"]
        BRIEF["Explainer brief<br/>Learner: line in context"]
    end
    ONB --> RLL --> LL
    LL --> COPCTX
    LL --> JOB --> BRIEF
    FOCUS -->|"myFocus field"| COPCTX
    subgraph Planned["Designed, not built - Stage 4"]
        INS["Instructions for Studiolo<br/>learner-written, in Settings"]:::planned
        GOAL["Goals as Library notes<br/>with a goal record"]:::planned
        MEM["Memory entries<br/>app-maintained, editable, deletable"]:::planned
        TOG["Memory on or off toggle"]:::planned
        SEL["Context selection<br/>instructions win over memory"]:::planned
        SNAP["Learner context snapshot<br/>per generation run"]:::planned
    end
    INS -.-> SEL
    GOAL -.-> SEL
    MEM -.-> SEL
    TOG -.->|"off: memory excluded"| SEL
    SEL -.-> SNAP
    SNAP -.-> COPCTX
    SNAP -.-> BRIEF
    COPCTX -.->|"conversation evidence"| MEM
```

#### Usage today and the planned percentage

```mermaid
flowchart TB
    classDef planned stroke-dasharray:5 5
    CALL["callModel attempt<br/>copilot, author, repair, onboarding"] --> SINK["usage sink<br/>recordProviderUsage"]
    SINK --> PUE[("provider_usage_evidence<br/>tokens, model, purpose, cost")]
    SINK -->|"after commit"| PH["PostHog ai_generation copy"]
    PUE --> EST["estimateMonthSpend<br/>excludes purpose onboarding<br/>and the free first explainer"]
    EST --> GATE{"spent + in-flight holds<br/>0.60 per explainer, 0.15 per reply<br/>within EXPLAINER_MONTHLY_CAP_USD?"}
    GATE -->|yes| RUN["turn or explainer admitted"]
    GATE -->|no| CAP["cap_reached - composer disabled<br/>until first day of next month"]
    PCT["Usage shown as a percentage<br/>in Settings"]:::planned
    TOKENS["Studiolo token allowance - Phase 3D"]:::planned
    EST -.-> PCT
    PUE -.-> TOKENS
```

---

## 3. AI BRain (TBS) — rootBlockId a4227f90-7d08-446d-9848-475d899ba042

### Validation

| Claim (Craft doc "AI BRain") | Verdict | Evidence |
|---|---|---|
| Idea: how LLMs like Claude build their own memory around the user | ❓ | Idea doc; nothing named AI Brain or memory exists in code. |
| (Context) closest built pieces | ✅ | Learner line (`src/features/onboarding/learner.ts`), graph + My Focus in context (`src/features/copilot/context.ts`), capped area/origin extracts (`src/features/copilot/levels.ts`), journal (`src/features/copilot/journal.ts`). |
| (Context) agreed memory direction | ✅ | `project-docs/product/mvp-scope.md` Learner context and personalization (Stage 4, not built). |
| (Context) open questions for context engineering | ✅ | `project-docs/implementation/ai.md` Current limits (13 Oct, none built). |
| Resume from studiolo-ai/docs/reviews/2026-10-07-design-validation-app.md | ❓ | Different repository; not available. |

### Diagram (planned)

#### How an AI Brain would extend learner context (planned)

```mermaid
flowchart LR
    classDef planned stroke-dasharray:5 5
    subgraph Today["Built today"]
        LL["Learner line<br/>from onboarding answers"]
        G["Topic graph and My Focus"]
        H["Per-conversation history<br/>capped area and origin extracts"]
        J["copilot_journal_entries"]
    end
    subgraph Brain["AI Brain idea - not built"]
        OBS["Observe: chats, kept and dismissed<br/>suggestions, explainers watched, notes"]:::planned
        DIST["Distil into memory entries<br/>title, content, updated time"]:::planned
        REV["Learner reviews, edits, deletes"]:::planned
        STORE[("memory entries and evidence refs")]:::planned
    end
    H -.-> OBS
    J -.-> OBS
    OBS -.-> DIST -.-> STORE
    REV -.-> STORE
    STORE -.-> CTX["Copilot context and explainer brief"]
    LL --> CTX
    G --> CTX
```

---

## Corrections in place

None. The only inaccuracy found (course plans implied as available to everyone) is recorded as ⚠️ in the appended Validation section rather than rewritten.

## Sources

- studiolo @ ad38415: `src/features/copilot/*`, `src/features/ai/*`, `src/features/usage/*`, `src/features/onboarding/{answers,learner}.ts`, `src/config/{copilot,ai}.ts`, `src/db/{copilot,usage,onboarding,topics}-schema.ts`, `drizzle/0018_copilot.sql`, `src/app/api/copilot/**`, `src/components/copilot/*`, `src/app/(workspace)/settings/page.tsx`
- project-docs: `implementation/ai.md`, `design/graph.md`, `product/mvp-scope.md`, `architecture/data-model.md`; `docs/superpowers/specs/2026-10-16-today-design.md`
- Craft docs: "Copilot", "Learner context & Memory", "AI BRain"
