# Craft validation: Library area

Sources: studiolo @ ad38415 (read-only clone `/home/user/studiolo`), its `project-docs/` and `docs/superpowers/specs/`, and the Craft space "Studilo". Checked 17 Oct 2026. Every Mermaid diagram below passed `mmd/check.sh`. Nothing was deleted in Craft; each doc got an appended "How it works (verified against code)" section. No in-place corrections were made.

Legend: ✅ confirmed · ⚠️ wrong/outdated/partial · ❓ cannot verify from code · ❌ (polish doc only) still open / not built

## 1. Library (02 Product), rootBlockId 5dc8d229-7fdd-78fd-49a1-c834e7afb944

| Claim | Verdict | Evidence |
|---|---|---|
| Status: Built | ✅ 2B–2H and Library areas merged into main and owner-accepted (2H 12 Oct, areas 13 Oct). Migrations 0010–0015 are on Studiolo Dev only, not production | `project-docs/product/mvp-scope.md`, `project-docs/product/library.md`, `project-docs/workflow/production-cutover.md` |
| Reader parked | ✅ only on branch `phase-2i-reader-fixes`; no `src/features/source-content/` on main; 3B-4 wrote its extractors fresh (B12) | `project-docs/implementation/database.md`, `project-docs/implementation/backend.md` |
| "after the 14 Oct revert" | ❓ no revert and no date recorded in code or docs | (none) |
| 3C not started | ✅ no 3C spec or plan; whole-Library extraction, search and image descriptions are "Not built (3C)"; 3B-4 extracts one item's text only when it is explained (`item_text`) | `project-docs/product/mvp-scope.md`, `project-docs/product/library.md`, `drizzle/0021_item_text_extracts.sql` |
| Four item types Notes, Sources, Photos, Objects | ✅ shapes note/source/object/image, note styles plain/long/quote, object base person/thing. Also a fifth stored shape, `conversation`, which the doc leaves out | `src/db/library-schema.ts` (`content_items_shape_check`) |
| One collection per item | ✅ `content_items.collection_id`: at most one, of the item's own type, required for Objects; six starters | `src/db/library-schema.ts`, `src/features/library/starters.ts` |
| Typed links | ✅ `content_relations`, 11 relation names, rules per kind | `src/features/library/relations.ts` |
| Areas | ✅ an area is a top-level Graph topic; `?area=` plus a cookie; a filter, not a workspace; captures inherit the area (17 Oct) | `src/features/library/areas.ts` |
| Rooms for YouTube, PDF, web, photos | ✅ watching room; PDF reading room; web viewer (iframe only when `frame_policy` allows, otherwise a large preview; no reading text); photo quick view and pages that swap in place | `src/components/library/watch-room.tsx`, `src/app/(workspace)/library/items/[itemId]/pdf/page.tsx`, `src/components/library/quick-view/web-view.tsx`, `src/components/library/image-page.tsx` |
| Polish notes are in TBS | ✅ (Craft cross-link) | Craft "Library - polishment Phase" |
| Built but not in the doc | link previews run in the web function with `after()`, not Trigger; margin notes and `on_wall`; `/library/to-read`; bulk delete up to 500 with a typed word; Explain… behind `EXPLAINER_ITEM_GROUNDING` for testers | `src/features/links/refresh.ts`, `src/features/library/bulk-delete.ts`, `src/app/api/items/[itemId]/course-offer/route.ts` |

Count: 9 ✅, 0 ⚠️, 1 ❓.

### Diagrams

#### Item types, collections and links (ER)
```mermaid
erDiagram
  content_items ||--o| library_entries : "on the wall list"
  content_items ||--o| sources : "shape = source"
  content_items ||--o| annotations : "note_style plain or quote"
  content_items ||--o| images : "shape = image"
  collections ||--o{ content_items : "collection_id, at most one"
  collections ||--o{ collection_fields : "up to 8 active"
  collection_fields ||--o{ item_field_values : "field_id"
  content_items ||--o{ item_field_values : "item_id"
  content_items ||--o{ content_relations : "from_item_id / to_item_id"
  content_items ||--o{ content_topic_tags : "item_id"
  topics ||--o{ content_topic_tags : "topic_id, areas = root topics"
  photo_groups ||--o{ images : "group_id"
  content_items ||--o{ stored_objects : "item_id: image or pdf file"
  sources ||--o{ annotations : "source_id, quotes cite"
  content_items {
    uuid id PK
    text shape "note source object image conversation"
    text note_style "plain long quote"
    text object_base "person thing"
    uuid collection_id
    uuid about_id "margin note target"
    boolean on_wall
    text origin "user source model model_external"
  }
  sources {
    uuid item_id PK
    text kind "article video book podcast website pdf other"
    text url
    text reading_state "unread reading read"
    integer last_page
    integer video_seconds
  }
  collections {
    uuid id PK
    text name
    text shape "note source object image"
    text base
    text starter_key
    uuid cover_image_id
    integer position
  }
  content_relations {
    uuid id PK
    text relation "cites depicts see_also ..."
  }
  stored_objects {
    uuid id PK
    text kind "image pdf preview item_text ..."
    text state "pending uploaded processing ready failed deleting"
  }
  topics {
    uuid id PK
    uuid parent_id
  }
  library_entries { uuid item_id PK }
  annotations { uuid item_id PK }
  images { uuid item_id PK }
  collection_fields { uuid id PK }
  item_field_values { uuid field_id PK }
  content_topic_tags { uuid topic_id PK }
  photo_groups { uuid id PK }
```

#### Capture and file processing (sequence)
```mermaid
sequenceDiagram
  autonumber
  participant UI as "Capture box / wall drop"
  participant FAPI as "/api/files/uploads"
  participant R2 as "Cloudflare R2 (EU)"
  participant LAPI as "/api/library/images or /items"
  participant Repo as "createImages / createItem"
  participant DB as "Postgres studiolo schema"
  participant TR as "Trigger.dev studiolo-files-process-image"
  participant Sweep as "studiolo-files-sweep (every 5 min)"
  UI->>FAPI: POST reserve (type, size, createKey)
  FAPI->>DB: reserveUpload: stored_objects pending, quota under files lock
  FAPI-->>UI: 201 signed PUT link (15 min)
  UI->>R2: PUT file to incoming/account/object
  UI->>FAPI: POST .../complete
  FAPI->>R2: HEAD + first 1024 bytes sniff
  FAPI->>DB: state uploaded (PDF copied to a/account/object/original)
  UI->>LAPI: POST create with objectIds or pdfObjectId
  LAPI->>Repo: one transaction under Library + files locks
  Repo->>DB: content_items, images or sources, photo_groups, tags
  Repo->>DB: claimObjectsForItems: photo processing, PDF ready
  Repo-->>LAPI: cards (after commit)
  Repo->>TR: dispatchImageProcessing (key files-process:object:n)
  TR->>R2: read incoming, write original/display/thumb WebP, delete incoming
  TR->>DB: processImage: ready + variants, or failed / retry
  Sweep-->>TR: re-dispatch missed or stalled photos, purge deleting rows
  LAPI-->>UI: 201 cards, photo shows preparing until ready
  Note over LAPI,DB: Link Sources: withPreviews runs safeFetch in Next after(), no Trigger task, writes link_previews
```

#### Rooms by item type (flow)
```mermaid
flowchart TD
  W["Library wall /library"] --> C{"Card type"}
  C -->|"YouTube Source"| WR["Watching room: WatchRoom, quick view"]
  C -->|"PDF Source"| PR["PDF reading room /library/items/id/pdf"]
  C -->|"Link Source or Object with Web link"| WV["Web viewer: quick-view web-view"]
  C -->|"Photo"| QV["Photo quick view, gallery"]
  C -->|"Note, Quote, Object"| IP["Item page /library/items/id"]
  WR --> WR1["resume: PUT video-position, sources.video_seconds"]
  WR --> WR2["Watch status: reading-state To watch, Watching, Watched"]
  WR --> MN["Margin notes with time locator"]
  PR --> PR1["last_page, page notes, select-to-quote"]
  PR1 --> MN
  WV --> WV1{"link_previews.frame_policy"}
  WV1 -->|"allowed"| WV2["Sandboxed iframe"]
  WV1 -->|"blocked or http"| WV3["Large preview + Open site"]
  QV --> PG["Photo page swaps in place within photo group"]
  WR & PR & WV & QV -->|"Open full page"| IP
  IP --> MN
  RD["Reader: clean text, highlights, Inbox"]:::planned
  WV -.->|"parked branch phase-2i-reader-fixes"| RD
  classDef planned stroke-dasharray:5 5
```

#### Connections to other features
```mermaid
flowchart LR
  LIB["Library: content_items + collections"]
  TOP["Topics / Graph: topics, content_topic_tags"]
  GR["Graph: In your library lane, reader on the map, C capture"]
  AREA["Library areas = root topics, ?area= and cookie"]
  CP["Copilot: libraryItems, itemInReach"]
  EX["Explainers: Explain item, item_text extract"]
  CO["Courses: /api/items/id/course-offer"]
  TD["Today: savedCount and newest saves"]
  ON["Onboarding: starter areas"]
  TC["Processing and search 3C"]:::planned
  RDR["Reader 2I"]:::planned
  LIB <-->|"tags"| TOP
  TOP --> AREA
  AREA --> LIB
  LIB --> GR
  GR -->|"captures and margin notes"| LIB
  LIB -->|"titled items by topic"| CP
  LIB -->|"switch EXPLAINER_ITEM_GROUNDING, testers"| EX
  EX -->|"stored structure"| CO
  LIB --> TD
  ON -->|"creates topics"| TOP
  LIB -.->|"whole-library text extraction, search, image descriptions"| TC
  LIB -.-> RDR
  classDef planned stroke-dasharray:5 5
```

## 2. Library - polishment Phase (TBS), rootBlockId 3f23017a-a7df-46f4-a2cb-3af132de9ea9

These notes are quoted in `docs/superpowers/specs/2026-10-10-phase-2g-library-polish-design.md`. That spec split them into 2G (built), 2H (built), 2I (Reader, parked) and the AI phase.

| Note | Verdict | Evidence |
|---|---|---|
| Video resume | ✅ done (G2); the real YouTube embed is still unverified | `src/app/api/library/items/[itemId]/video-position/route.ts`, `sources.video_seconds` (0012) |
| Wide video in a focus mode | ✅ done (G1) | `src/components/library/watch-room.tsx` |
| Full-page video click opens the room | ✅ done (G1) | `src/components/library/video-hero.tsx` |
| Watch status To watch / Watching / Watched, automatic plus manual | ✅ done (G3); stored as unread/reading/read | `reading-state` route, `sources.reading_state` |
| Tabbed AI sidebar in the room | ❌ open (AI phase) | no copilot code in `src/components/library/` |
| AI questions about a YouTube video, Gemini | ❌ open; no Gemini or transcript code | grep of `src/` |
| AI summary in the learner's context | ❌ open | (none) |
| Areas across Graph and Library | ✅ done | `src/features/library/areas.ts` |
| Collections as data types, not folders | ✅ done (2H): one type per collection, at most one per item, no folders | `src/db/library-schema.ts`, migration 0015 |
| A new collection appears in the filters | ✅ done | `src/features/library/wall-chips.ts` |
| Sub-types (Photos → Renders; PDFs → Books) | ✅ done through typed collections and starters | `src/features/library/starter-collections.ts` |
| Top filter shows system types with collections under them | ⚠️ partly: one flat chip row, collections then types, not nested | `project-docs/product/library.md` (Collections) |
| "I want to learn X" note sorted automatically | ❌ open; one flag `topics.want_to_learn` = My Focus (A12 open) | `src/db/topics-schema.ts` |
| PDF reader: highlight, notes on a page, remember the page, reading state | ✅ the basics (page notes, select-to-quote, `last_page`, To read/Reading/Read); ❌ Readwise-like highlights | `src/components/library/pdf-viewer.tsx`, `select-to-quote.tsx` |
| Inbox state | ❌ open; the states are unread/reading/read only | `sources_reading_state_check`, `reading-queue.tsx` |
| Wide e-reader for links, handling sites that block iframes | ⚠️ partly: web viewer with a sidebar; a blocked site gets a large preview; no reader text | `src/components/library/quick-view/web-view.tsx`, `src/features/links/frame-policy.ts` |
| Save image, video or text from the reader | ❌ open | (none) |
| MD files with code blocks and Mermaid | ❌ open; uploads take JPEG/PNG/WebP and PDF only; the Markdown subset has no code blocks or Mermaid | `src/features/files/types.ts`, `src/features/library/markdown.ts` |
| Work collection editorial, hero image, transferable name | ✅ mostly (Objects/Thing base, preview picture as hero, photos depict it); ❌ the slideshow editorial page | `project-docs/product/library.md` (F8, 2H) |
| Delete from the wall in a popup | ✅ done (G5) | `src/components/library/wall-delete-dialog.tsx` |
| Multi-select, delete all, typed word | ✅ done (G6): up to 500; typed `delete` at 10 or more items or with Select all | `src/features/library/bulk-delete.ts`, `bulk-delete-dialog.tsx` |
| Collection cover or colour | ✅ done (2H) | `collections.cover_image_id`, `accent` |
| Photo group page reloads instead of swapping | ✅ fixed (G7) | `src/features/library/photo-swap.ts` |
| PDF opening animation lags | ✅ fixed at the cause (G8); not a server problem | the G8 spec |

Count: 16 ✅ (done), 2 ⚠️ (partly), 9 ❌ open, counting the ❌ parts of mixed rows. No ❓.

### Diagram: where each note went
```mermaid
flowchart LR
  N["Owner test notes, 10 Oct 2026"]
  N --> G["Phase 2G Library polish, accepted 12 Oct"]
  N --> H["Phase 2H structure + Library areas, accepted 12-13 Oct"]
  N --> I["Phase 2I Reader and Markdown"]:::planned
  N --> A["AI phase items"]:::planned
  G --> G1["Watching room, resume, watch status"]
  G --> G2["Delete in place, Select + typed delete"]
  G --> G3["Photo page swaps in place"]
  G --> G4["PDF opening ghost fix"]
  H --> H1["4 types, collections one type each, chips"]
  H --> H2["Collection cover, accent, description"]
  H --> H3["Work renamed Objects with Thing base"]
  H --> H4["Areas picker = root topics"]
  I -.-> I1["Readwise-like highlights, Inbox state, reader for links, MD + Mermaid"]:::planned
  A -.-> A1["Tabbed AI sidebar in room, video Q and A, contextual summary, learning intent"]:::planned
  H -.-> H5["Want to learn vs My Focus A12, bulk tagging"]:::planned
  classDef planned stroke-dasharray:5 5
```

## 3. Sources pulling (TBS), rootBlockId 5ad9ed4d-45d2-4aff-9f20-646d3eadf60b

| Claim | Verdict | Evidence |
|---|---|---|
| Cloud agents pull from agreed sources into a news wall; the user picks what goes to the Library | ❓ idea only: no code, table, task, route or spec. `src/trigger/` has only the files, explainer, foundation and reconcile tasks | `src/trigger/`, `project-docs/product/mvp-scope.md` |
| Reusable pieces exist | ✅ `safeFetch` with the address guard, `parse-html`, `oembed`, scheduled Trigger tasks | `src/features/links/*`, `src/trigger/files-tasks.ts` |
| The schema can mark non-user items | ✅ `content_items.origin` takes user/source/model/model_external | `src/db/library-schema.ts` |
| Matches the "Save to Library only by choice" principle | ✅ | `project-docs/product/mvp-scope.md` |
| Plan limit on schedules | ❓ Free-plan schedules fire at most hourly | `project-docs/architecture/tech-stack.md` |

Count: 3 ✅, 0 ⚠️, 2 ❓.

### Diagram: how it would plug into capture (everything dashed is planned)
```mermaid
flowchart TD
  subgraph PLANNED["Sources pulling - all planned, nothing built"]
    SRC["Agreed sources per account: feeds, sites, channels"]:::planned
    AG["Scheduled Trigger.dev task: pull agent"]:::planned
    NW["News wall: candidate items, not in Library"]:::planned
    PICK["User picks Add to Library"]:::planned
  end
  SRC -.-> AG
  AG -.->|"reuse safeFetch + address-guard"| NW
  NW -.-> PICK
  PICK -.->|"same input as capture"| CI["POST /api/library/items createItem"]
  CI --> DB["content_items + sources, origin column already allows source / model_external"]
  CI --> WP["withPreviews: link_previews picture, title"]
  CI --> COL["Starter collection by kind: Links, Videos"]
  CI --> TAG["content_topic_tags, area inherit"]
  DB --> WALL["Library wall /library"]
  classDef planned stroke-dasharray:5 5
```

