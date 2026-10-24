MEDIUM (changes how Loci's chat is stored, shown and assembled in the Map and Palace; needs a migration and the owner's decisions in §7)

# Unified Loci chat: one conversation, layered context (design brief)

**For:** the agent who will write the full design and then the implementation plan in `studiolo`.
**Status:** Brief only. Claude, 24 October 2026. This is the problem and the direction, not the design. Nothing here is approved until the owner says so.
**Checked against:** `studiolo` @ `05fa946`, through GitHub code search only (no full file reads). Re-check every path and claim against the code before relying on it.

## 1. The problem

Loci has three separate chats today: **Home** (map scope), the **area** chat (an area's own topic conversation) and the **topic** chat. `src/features/copilot/chats.ts :: chatViewFor` picks one from the selection and the remembered tab (`studiolo:copilot-tab:<account>:<areaId>`).

So a learner starts talking in Home, clicks a topic, and the panel switches to a different thread, often an empty one. What they were just saying is gone from view, and Loci's context drops it too. Building the map with Loci should feel like one ongoing conversation that follows you around, not a set of chats you switch between.

The split exists for a good reason: one endless thread replayed to the model would grow without limit, cost more every turn and get worse as it fills (today's replay budget is already ~50k tokens, `history.ts`, C85). The design has to keep the one-thread feel **and** a small, bounded context.

## 2. Goal

- **For the learner:** one Loci conversation per account. Moving around the Map or Palace never empties or swaps the panel.
- **For the model:** each turn gets a small, bounded context, rebuilt for where the learner is now and what they were just doing. Its size doesn't grow with the length of the thread.

## 3. Principles

1. **Separate what the learner sees from what the model sees.** The visible thread is unbroken. The model's context is put together fresh each turn and never replays the whole thread.
2. **The graph is the long-term memory.** Kept topics, relations, Lumens, courses and the journal already record *what was built*. Conversation summaries record only what the graph can't: intent, decisions, rejected ideas, open threads.
3. **Recent stays verbatim, older gets summarised by place.** The last few turns go in word for word, wherever they happened, so "make that a course" still works after a click. Older turns are folded into a short brief for the place they happened in.
4. **Bounded and cache-friendly.** There's a fixed token budget per layer, the stable layers come first (1h cache), and the volatile layers come last.
5. **Nothing changes the graph without Keep.** The proposal and undo model stays exactly as it is (`registry.ts` policy).
6. **No hidden judgements.** Any summary Loci reads about the learner, the learner can read (the rule in the learner-memory spec).

## 4. Proposed direction (to be tested and refined, not final)

**What the learner sees**
- One thread. Each message is tagged with the place it was sent from (Home, area or topic).
- Moving around adds a divider ("Now in: Area › Topic"). This generalises today's area-chat focus dividers (`display.focus`).
- A topic's "chat" becomes a **filter** on the one thread ("only what was said here"), not a separate conversation.
- Long threads fold into **episodes** (split at idle gaps or big jumps), and older episodes collapse to their summaries.

**What the model sees each turn (starting budgets)**

| # | Layer | Roughly | Changes |
|---|---|---|---|
| 1 | System prompt and tools (as today) | — | never |
| 2 | Learner memory slice (from the learner-memory spec) | ~0.5–1k | rarely |
| 3 | Place briefs: Home, current area, current topic | ~1–2k | at episode end |
| 4 | Graph snapshot: today's `<studiolo_context>`, plus `nowAt` and `cameFrom` | ~2–5k | every turn |
| 5 | Recent turns verbatim, from any place | ~8–12k | every turn |
| 6 | 2–3 earlier exchanges from *this* place | ~2k | every turn |
| 7 | A `recall(query, place?)` tool that searches older history on demand | on demand | — |

Target total: **~15–25k input tokens**, flat however long the thread gets.

**Compaction**
- When a turn drops out of layer 5, a cheap model call folds it into its place's brief.
- Important items roll up the tree: topic → area → Home.
- Briefs are rewritten at episode boundaries, not every turn, so layers 1–3 stay cached.

**Reach**
- Loci may propose anywhere on the map. Proposals default to the current place, and each card states where it will land. This replaces the per-level reach rule (C80); the owner must confirm.

## 5. What exists that this should reuse

| Exists today | Where | Likely becomes |
|---|---|---|
| Conversations and messages tables | `drizzle/0018_copilot.sql`, `0019_proposal_nesting.sql` | one conversation per account, plus a place tag on each message |
| Focus dividers and `focusTopicId` | `display.focus`, `http.ts`, `store.ts` | dividers everywhere |
| `fromAreaChat` and `origin` extracts | `extracts.ts`, `levels.ts` | layer 6 |
| Per-turn context | `context.ts`, `levels.ts :: areaOutline` | layer 4 |
| History replay and budget | `history.ts` | layer 5, with a smaller budget |
| Journal | `copilot_journal_entries`, `src/features/topics/journal.ts` | input to the briefs |
| Learner memory per place (proposed) | `docs/superpowers/specs/2026-10-24-learner-memory-and-settings-design.md` | layer 2 |
| Tabs and pinning | `chat-tabs.tsx`, `use-loci-chat.tsx`, `onOpenChat` | removed or reduced to the filter |

**Overlap to resolve:** the learner-memory spec already puts a card on every place on the map. Decide whether place briefs are a separate table (about the *conversation*) or a slot on those cards (about the *learner*). Don't build two parallel per-place summary systems.

## 6. Read first

- `project-docs/implementation/ai.md`: prompt, tools, history.
- `project-docs/implementation/database.md`: copilot tables.
- `docs/superpowers/plans/2026-10-13-phase-3a-assumptions.md`: decisions C41, C49, C79–C99 (chat levels, tabs, reach, budget). Say which decisions this design replaces.
- `src/features/copilot/*` and `src/components/graph/loci-side/*`: the shared Map and Palace panel.
- `docs/superpowers/specs/2026-10-23-loci-palace-design.md`: how the Palace drives the selection.
- The learner-memory spec and its system reference (in this repo, `docs/superpowers/specs/`).

## 7. Questions for the owner (answer before building)

1. One conversation per account, or one per area with Home on top?
2. Do place briefs live on the learner-memory cards, or in their own table?
3. Can the learner see and edit place briefs (the "no hidden judgements" rule suggests yes)?
4. Reach: allow anywhere (with the destination shown on the card), or keep the per-level limits?
5. Existing three-chat data: merge it into the single thread by timestamp, or start the unified thread fresh and keep the old chats read-only?
6. Does "Start fresh" stay, become "New episode", or go away?

## 8. What to produce

1. **Design doc** (`docs/superpowers/specs/`), checked against the current code. It should cover:
   - the data model and migration
   - the context assembly per turn, with real token budgets measured on real threads
   - compaction (trigger, model, prompt, cost per learner per month)
   - the UI states: thread, dividers, filter, episodes, mobile sheet
   - cache layout
   - failure cases: compaction fails, a brief goes stale, a place is deleted or moved
   - which C-decisions it replaces
2. **Implementation plan** (`docs/superpowers/plans/`) in small vertical slices that can ship one by one. Suggested order:
   1. tag messages with their place, and draw dividers
   2. one thread in the UI (remove the tabs)
   3. layered context assembly with a small verbatim window
   4. place briefs and compaction
   5. `recall` tool
   6. episodes in the UI

   Each slice gets tests and a way to measure tokens per turn before and after.

**Done means:** a learner can talk to Loci in Home, open a topic in the Palace, and keep talking without the panel changing, and median input tokens per turn are no higher than today's.
