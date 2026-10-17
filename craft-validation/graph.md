# Graph: Craft validation report

Sources: studiolo @ ad38415 (`/home/user/studiolo`, read-only), project-docs at the same commit, Craft space "Studilo" (docs "Graph" and "Graph actions", plus "Decisions" for G-D1..G-D9). Checked 17 Oct 2026.

Legend: ✅ confirmed · ⚠️ wrong or outdated · ❓ cannot be verified from code · ➕ built behaviour the doc leaves out

---

## 1. Graph (02 Product): rootBlockId `92fc112a-2789-9164-65d3-2d7905370739`

### Validation

| Claim | Verdict | Evidence (studiolo @ ad38415) |
|---|---|---|
| Status: Built | ✅ | `src/app/(workspace)/graph/graph-page.tsx`, `src/app/(workspace)/graph/[section]/page.tsx`, `src/components/graph/graph-workspace.tsx`; `project-docs/design/graph.md` (Phase 2A–2D merged) |
| Radial focus-based map | ✅ | `src/features/topics/layout.ts` (layoutFrame, overview/focused), `src/features/topics/label-layout.ts` (ringLayout, fanLayout) |
| Map / List / Overview | ✅ | `[section]/page.tsx` accepts `list` and `overview`; `src/components/graph/topic-tree.tsx`, `status-overview.tsx`, `topic-inspector.tsx`; design D9, D10 |
| Library lane | ✅ | `graph-workspace.tsx` loadLane → `libraryGateway.listItems({ topicId, limit: LANE_LIMIT })`; `LANE_LIMIT = 7` in `src/features/library/limits.ts`; tags in `content_topic_tags` (`src/db/library-schema.ts`) |
| Explainer lane | ✅ | `GET /api/topics/[topicId]/explainers` → `listTopicExplainers` (`src/features/explainers/topic-explainers.ts`, recursive over sub-topics, item explainers via `content_topic_tags`, cap 300); `EXPLAINER_LANE_MAX = 3` in `layout.ts` |
| Related topics | ✅ | `topic_relations` with `topic_a_id < topic_b_id` check (`src/db/topics-schema.ts`); `MAP_RELATED_LIMIT = 6`; `src/components/graph/related-section.tsx`, `edge-panel.tsx`; routes `/api/topic-relations` |
| Ghost suggestions | ✅ (with a gate) | `ghost-node.tsx`, `GhostInput` in `layout.ts`, `placedItems` in `src/features/copilot/nesting.ts`, tables `copilot_proposals` and `copilot_proposal_items`. Drawn only when `seesCopilot(access)` is true (copilot testers); everyone else gets no ghosts |
| Label-aware layout | ✅ | `src/features/topics/label-layout.ts`, `label-advances.ts`; design says built and merged 17 Oct, but W-D1 and W-D3 still await the owner's decision |
| No drag-to-reparent (D13) | ✅ | No reorder or reparent-by-drag route; createTopic and moveTopic write the next `sort_order` (`src/features/topics/repository.ts`); design D4, D13 |
| Copilot reorganising is designed only | ✅ | `src/features/ai/tools/registry.ts` throws if a `change` tool is enabled; `src/features/copilot/tools/index.ts` registers only read, ask, propose, explain and course tools |
| (omitted) Hierarchy and account limits: 10 levels, 2,000 topics, 4,000 links, 24 children and 6 related drawn, names of 80 characters | ➕ | `src/features/topics/limits.ts` |
| (omitted) Snapshot-checked branch delete, including tagged Library items | ➕ | `/api/topics/[topicId]/dependents`, `deleteTopic` in `repository.ts`; design D3 |
| (omitted) Per-account advisory lock serialises structural writes (D16) | ➕ | `lockTopicTree` in `repository.ts` |
| (omitted) Phones: lanes leave the map and go into the sheet; iPads fit the whole drawing | ➕ | `project-docs/design/graph.md` "Phones and iPads" |
| (omitted) Onboarding replaces the Map while onboarding is in progress | ➕ | `graph-page.tsx` (onboardingRouteOrNull → OnboardingWorkspace) |

In-place corrections: none. The status and summary sentences are accurate.

### Diagrams

#### Topics, relations and what hangs off them
```mermaid
erDiagram
  topics ||--o{ topics : "parent_id"
  topics ||--o{ topic_relations : "topic_a_id / topic_b_id"
  topics ||--o{ content_topic_tags : "topic_id"
  content_items ||--o{ content_topic_tags : "item_id"
  topics ||--o{ explainers : "anchor_topic_id"
  content_items ||--o{ explainers : "anchor_item_id"
  topics ||--o| copilot_conversations : "topic_id"
  copilot_conversations ||--o{ copilot_proposals : "conversation_id"
  copilot_proposals ||--o{ copilot_proposal_items : "proposal_id"
  topics |o--o{ copilot_proposal_items : "topic_id once kept"
  topics {
    uuid id PK
    uuid account_id
    uuid parent_id
    text name "1-80 chars, unique per parent"
    text status "not_started learning learned"
    boolean want_to_learn "My Focus"
    int sort_order "append-only, D13"
    int version
  }
  topic_relations {
    uuid id PK
    uuid topic_a_id "a < b, symmetric pair"
    uuid topic_b_id
    text explanation "max 500"
    int version
  }
  content_topic_tags {
    uuid item_id PK
    uuid topic_id PK
    text added_by "learner assistant enrichment"
    timestamptz added_at
  }
  explainers {
    uuid id PK
    text anchor_kind
    uuid anchor_topic_id
    uuid anchor_item_id
    text status
  }
  copilot_proposals {
    uuid id PK
    text parent_kind
    uuid parent_topic_id
    text state "pending ..."
  }
  copilot_proposal_items {
    uuid id PK
    text name
    text state
    uuid keep_key "Undo"
  }
```

#### Focus navigation and view states
```mermaid
stateDiagram-v2
  direction LR
  state "Map tab /graph" as Map {
    [*] --> Overview
    Overview: Overview ring, focusId null
    Focused: Focused fan, focusId set
    Selected: Topic selected, panel shows it
    Edge: Relation selected
    Overview --> Focused: enter area
    Focused --> Focused: enter child or follow related
    Focused --> Selected: select
    Selected --> Focused: enter selected
    Focused --> Edge: click link or related row
    Edge --> Focused: Follow
    Focused --> Overview: Overview or Up from area
    Focused --> Focused: Back via journey, Up via parent
  }
  state "List tab /graph/list" as List
  state "Overview tab /graph/overview" as Stats
  Map --> List: tab
  List --> Map: tab, ?topic=id
  Map --> Stats: tab
  Stats --> Map: tab
  note right of Stats: Status bars per area, D9
```

#### Layout pipeline and how the lanes are filled
```mermaid
sequenceDiagram
  autonumber
  participant P as "graph-page.tsx renderGraphPage"
  participant W as GraphWorkspace
  participant LG as "libraryGateway.listItems"
  participant TE as "GET /api/topics/:id/explainers"
  participant CS as "GET /api/copilot/state"
  participant L as "layoutFrame in layout.ts"
  participant M as GraphMap SVG
  P->>P: loadTopicGraph reads topics + topic_relations
  P->>W: initialGraph, view map list overview
  W->>W: reduceGraph focus select back up
  W->>LG: topicId, limit 7 for focused topic
  LG-->>W: Library lane cards from content_topic_tags
  W->>TE: focused and inspected topic
  TE-->>W: listTopicExplainers, latest 3 in lane
  opt copilot tester only
    W->>CS: pending proposals
    CS-->>W: ghosts via placedItems, +N counts
  end
  W->>L: index, focusId, lanes, explainers, ghosts, draft
  L->>L: fanLayout or ringLayout, label-aware placement
  L-->>W: Frame items and links
  W->>M: useFrameTween animates to new frame
```

#### How the Graph connects to other features
```mermaid
flowchart LR
  classDef planned stroke-dasharray:5 5
  G["Graph: topics + topic_relations"]
  LIB["Library: content_topic_tags"]
  EXP["Explainers: anchor_topic_id"]
  COP["Copilot panel, testers"]
  CRS["Courses: plan_course"]
  LRN["Learn /learn?topic=id"]
  TOD["Today: topic counts"]
  ONB["Onboarding draft map"]
  GA["Graph actions: change plans"]:::planned
  LIB -->|"lane, reader and capture on map"| G
  EXP -->|"explainer lane, player over map"| G
  G -->|"Explain on a topic"| EXP
  COP -->|"propose_topics ghosts, Keep"| G
  COP -->|"read_map, show_on_map"| G
  G -->|"topic conversation scope"| COP
  COP -->|"plan_course behind isCoursesOn"| CRS
  G -->|"All in Learn"| LRN
  G -->|"status, want_to_learn"| TOD
  ONB -->|"OnboardingWorkspace on Map"| G
  GA -.->|"group move rename merge delete"| G
```

---

## 2. Graph actions (03 AI Systems): rootBlockId `e3edc809-a722-0cbd-cd91-bd74585c7dd7`

### Validation

| Claim | Verdict | Evidence |
|---|---|---|
| Not built | ✅ | No change tool exists. `ActionKind` includes `change`, but `createRegistry` throws when a change tool is enabled (`src/features/ai/tools/registry.ts`); `src/features/copilot/tools/index.ts` |
| Designed | ✅ in principle, ❓ in detail | The A2 ask-first rule for rename, move, delete and status, and "ask-first change cards" planned for Stage 4, are in `docs/superpowers/specs/2026-10-05-ai-direction-graph-copilot-design.md`, `docs/superpowers/specs/2026-10-13-phase-3a-copilot-core-design.md` (§ deferred) and `project-docs/design/graph.md` ("Still planned"). The change-plan design itself is not on main |
| Not approved | ✅ | Craft "Decisions": G-D1..G-D9 are all Open |
| Branch copilot-graph-actions | ❓ | `git ls-remote --heads origin` lists only `main`, so the branch is not reachable from this clone |
| One plan card, numbered steps (group, move, rename, connect, move explainer, re-tag, sort, merge, delete), Before/After preview | ❓ | Not in code or project-docs |
| Nothing changes until Apply; one Undo for the whole plan | ❓ | Not in code. The nearest built pattern is ghost Keep/Undo per proposal (`/api/copilot/proposals/[proposalId]/keep|dismiss|undo`, `keep_key`) |
| Merge and delete need a migration (S3) | ❓ | No change-set table exists (`src/db/copilot-schema.ts`; latest migration `drizzle/0023_explainer_series.sql`). No merge operation exists. Manual delete exists without a migration but cannot be undone (D3, G-D9) |
| G-D1 "no migration, sort_order exists" | ✅ | `topics.sort_order` in `src/db/topics-schema.ts`; only create and move write it today |
| G-D6 COPILOT_CHANGES switch | ❓ (planned) | No such variable in `src/` |
| (omitted) Domain ops a plan could reuse: create, batch create, rename (updateTopic), move, status, relation create/update/delete, delete | ➕ | `src/features/topics/repository.ts` |

In-place corrections: none. The status sentence ("Designed, not approved, not built") is consistent with the code.

### Diagrams

#### What exists versus what is planned
```mermaid
flowchart TB
  classDef planned stroke-dasharray:5 5
  subgraph Built["Built in main @ ad38415"]
    REG["copilotRegistry: A2 policy by ActionKind"]
    READ["read tools: read_map read_topic find_topics show_on_map"]
    PROP["propose kind: propose_topics"]
    KEEP["/api/copilot/proposals/:id/keep dismiss undo"]
    OPS["Topic domain ops: createTopic moveTopic updateTopic deleteTopic createRelation"]
    REFUSE["change kind: registry throws if a change tool is enabled"]
  end
  subgraph Planned["Designed only, branch copilot-graph-actions"]
    TOOL["change tool: propose change plan"]:::planned
    CARD["Change plan card, numbered steps, Before/After preview"]:::planned
    APPLY["Apply whole plan, one Undo, 30-day window G-D4"]:::planned
    MIG["S3 migration: change sets, archived chats G-D3"]:::planned
    MERGE["merge topic, no op exists yet"]:::planned
    SORT["sort siblings, reverses D13 G-D1"]:::planned
    SW["COPILOT_CHANGES switch, testers first G-D6"]:::planned
  end
  REG --> READ
  REG --> PROP --> KEEP --> OPS
  REG --> REFUSE
  REFUSE -.-> TOOL
  TOOL -.-> CARD -.-> APPLY
  APPLY -.->|"reuse"| OPS
  APPLY -.-> MERGE
  APPLY -.-> SORT
  MIG -.-> APPLY
  SW -.-> TOOL
```

#### Proposed change-plan flow (planned)
```mermaid
sequenceDiagram
  autonumber
  actor U as Learner
  participant CP as "Copilot panel"
  participant API as "POST /api/copilot/messages"
  participant AI as "Anthropic model"
  participant CS as "change-set store, planned"
  participant T as "topic domain ops"
  U->>CP: Tidy my map
  CP->>API: message, topic or map scope
  API->>AI: turn with read_map context
  Note over AI,CS: Steps below are designed only, not built
  AI-->>API: change-plan tool call, planned
  API-->>CS: store pending plan, planned
  CS-->>CP: plan card with steps and Before/After
  U->>CP: Apply
  CP-->>T: group move rename connect re-tag sort merge delete
  T-->>CS: record applied set for Undo
  U->>CP: Undo
  CP-->>T: reverse whole plan
```

---

## Counts
- Graph: 10 ✅, 0 ⚠️, 0 ❓, 5 ➕
- Graph actions: 4 ✅ (one of them "in principle"), 0 ⚠️, 5 ❓, 1 ➕

All 6 diagrams passed `mmd/check.sh` and are stored in Craft as code blocks with language mermaid.
