HIGH (a programme of six phases; L1 is MEDIUM, L2 onwards HIGH; each phase states its own tier)

# Learner memory: the build brief

**For:** the coding agent who builds learner memory in `studiolo`, and the owner who approves each phase.
**Status:** The owner asked on 28 October 2026 to start this next. That sets the direction; it doesn't approve each decision. Under `AGENTS.md`, the agent writes its own spec and plan for **L1**, the owner approves it, and nothing merges or migrates without the owner's word in the conversation.
**Checked against:** `studiolo` main @ `7c0e8732` (28 October 2026), read only. Every path below exists on that commit unless marked *new*. Line numbers are as of that commit; re-check before relying on them.

## 0. What to read, in this order

Everything you need is in **four pages** and the `studiolo` repo. Each page is self-contained. Links to other planning documents are background only, and you don't need them to build.

| # | Read | For |
|---|---|---|
| 1 | **This brief** | Scope, order, the first phase in detail |
| 2 | [Design spec](https://claude.ai/artifact/PMhNu3p63tGbr9RoTT5iNm): §0, §2, §4 (especially §4.4, *Show less*), §5, §6, §9 | What and why: cards on the map, the four depths, the slice, the Settings tabs, the decisions |
| 3 | [System reference](https://claude.ai/artifact/Hw6sRsxA5h4ks4CmM4uV3Q) | How: every Save, Call and Edit step, the tables, costs, invariants and function names |
| 4 | [Prototype](https://claude.ai/artifact/QhtegT5EWSw9thhd78HdWk) (how to use it: §0.1 below) | What it looks like and how it behaves |
| 5 | In `studiolo`: `AGENTS.md`; `project-docs/workflow/README.md` (tiers, temporary switches); `project-docs/product/mvp-scope.md` → *Learner context and personalization*; `project-docs/architecture/data-model.md` → *Learner context and explainer records*; `project-docs/implementation/ai.md` → *Copilot → Context* and *The learner line*; `project-docs/design/interface.md` → *Learner instructions and memory* | The agreed scope this must not break, and the house rules |

The design spec and the system reference stay the source of truth for the design. This brief decides **order and scope**; where it narrows a phase, this brief wins.

### 0.1 Using the prototype

It's built on Studiolo's real shell and styles, with a sample learner (an architect working on a prayer hall in Dubai); every entry is an example and nothing persists. The bar at the bottom right switches **Settings**, **In Loci** and **Builder**.

- **Settings → Learning** is L1: four preferences, two instruction boxes, and *Notes on topics* folded into one line (topic notes are L2). With **Builder** on, a box beside it shows the "you" block updating as you type: that's the text L1 sends to the AI (§2.4).
- **Settings → Profile** and **Privacy & data** are also L1. **Usage** is later; its figures are examples.
- **Settings → Memory** is L2: it opens on one paragraph about you, at most three things waiting, and one line per area. Tap an area, then a topic, for the level dial and the place's lines, each with **⋯** (Why?, Edit, Delete).
- **Builder** (L2 onwards) shows the exact text Loci reads at any place and surface, its size in tokens, and **Try it**, which plans the same Lumen with and without that text.
- **In Loci** (L2 and L3) shows the one line on a topic's panel, **Tell Loci…**, **Remembered: …** with Undo in a reply, and **For you** on a Lumen offer.

## 1. The phases

Each phase is useful on its own and ships on its own branch.

| # | Phase | What the learner gets | Tier | Migration | Switch (temporary) | Needs |
|---|---|---|---|---|---|---|
| **L1** | **Settings tabs and Instructions** | Settings gets **Profile · Learning · Privacy & data**. Profile gains *What you do*, spelling and units, and the full time-zone list. Learning has four preferences and two instruction boxes. **Loci and every Lumen read them** | MEDIUM | yes (one) | `LEARNER_INSTRUCTIONS` | — |
| **L2** | **Memory you can see and set** | The **Memory** tab (Glance and Open, §4.4), cards on the map, the **level dial**, onboarding answers turned into the first entries, **Tell Loci…** notes on topics, the one line on a topic's panel, **For you** on Lumens, the memory toggle, Delete all. The slice reads by place, sent once per conversation | HIGH | yes | `LEARNER_MEMORY` | L1 |
| **L3** | **Loci remembers what you tell it** | The copilot's `remember` tool, **Remembered: …** with **Undo**, and **Why?** pointing at the message | HIGH | yes (evidence links) | `LEARNER_MEMORY` | L2 |
| **L4** | **Rules and suggestions** | Evidence from finished Lumens, ratings, **Too basic · Too advanced** and Live taps; the threshold rules; **Waiting for you**; the one-question rule (Q1, Q2, Q4–Q7); roll-ups and expiry | HIGH | yes | `MEMORY_RULES` | L3 |
| **L5** | **The scribe** | Free text the copilot didn't catch, read by Haiku 5.5 per place in batches, behind the 20-history evaluation (design §12) | HIGH | yes (queue) | `MEMORY_SCRIBE` | L4 |
| **L6** | **Checks and goals** | Stage 4 checks write *you showed* (course engine §6.3); active goals suggest `why` (questions-and-goals roadmap **Q5b**) | HIGH | with Stage 4 / Q2 | per slice | L4, Stage 4, Q2 |

**Why this order:**
- **L1 changes what the AI reads, safely.** It replaces today's onboarding line with a richer "you" block at the two places that read it. Every later phase only adds lines to that same block.
- **L2 is where it becomes memory.** It's the biggest phase, but it has no AI writing anything: everything on a card comes from onboarding, from Settings, or from the learner's own taps. That makes it easy to test and impossible to get creepy.
- **L3–L5 add writing in order of risk:** the learner's own words first, then fixed rules, then a model.

## 2. L1 in detail: Settings tabs and Instructions

### 2.1 What the learner gets

1. **Settings tabs**: **Profile · Learning · Privacy & data**, in the existing `DestinationHeader`. Memory joins in L2, and Usage when prices and the allowance land (Phase 3D).
2. **Profile**: display name and time zone, as today; the time zone becomes the full IANA list with search, instead of five zones; plus:
   - **What you do**: the onboarding field (chips plus the learner's own words). It edits the **same onboarding row** the map's note card edits, so there is one record and two ways in (decision M-D8).
   - **Spelling** (British · American) and **units** (Metric · Imperial).
3. **Learning**: four preferences and two boxes, as in the prototype:
   - **Start with** (Watch · Listen · Read), **Length** (Short · Standard · Long), **Quick checks** (Often · Sometimes · Never), **Examples from my field** (on/off);
   - **About me and my work** and **How I like to be taught**, each at most 1,000 characters.
4. **Privacy & data**: today's analytics row moves here unchanged, with the "What Loci never notes" list (design §4.2) as plain text. Export and Delete account stay out of L1.
5. **The effect.** From the next Loci turn and the next Lumen, the AI reads the learner's preferences and instructions beside today's onboarding line. Nothing on screen announces it.

### 2.2 Where it goes in the code

| What | Where today (main @ `7c0e8732`) | L1 change |
|---|---|---|
| Settings tabs | `src/components/shell/destinations.ts:50`, `settings: [{ href: "/settings", label: "Profile" }]` | Three sections; routes `/settings`, `/settings/learning` *new*, `/settings/privacy` *new* |
| Profile page | `src/app/(workspace)/settings/page.tsx`; `src/features/settings/{schema,repository,preferences-form,preferences-state}.ts(x)` | Add the fields; keep the version check and the conflict view that Profile already has |
| Privacy row | `src/features/settings/privacy-setting.tsx` | Moves to `/settings/privacy` unchanged |
| Onboarding answers | `studiolo.onboarding` (`drizzle/0022_onboarding.sql`); `src/features/onboarding/answers.ts`, `learner.ts` | Profile's *What you do* writes `field_key` / `field_text` through the onboarding module's own update, not a second copy |
| Learner line reads | `src/features/copilot/store.ts:229` and `src/features/explainers/repository.ts:328`, both `readLearnerLine(tx, accountId)` | Both call *new* `readLearnerContext(tx, accountId)` instead (§2.4) |
| Copilot context | `src/features/copilot/context.ts:20–29` (`learner` section, `learnerSection`) | Same `learner` key; its `line` becomes the "you" block; its `note` says instructions are the learner's own words and win over everything else |
| Lumen brief | `src/features/explainers/contract/brief.ts:47–74` (`learner`), rendered as the `Learner:` line; job input `src/features/explainers/job-input.ts:86`, `learner: z.string().max(600)` | Same key and type. **The 600-character cap must rise** (§2.4), which needs a **worker deploy** |

A new feature folder, `src/features/learner/` *new*, owns `readLearnerContext`, the instruction and preference schemas, and the repository. Settings screens import from it; the copilot and explainers call only `readLearnerContext`.

### 2.3 Data: one migration (the agent proposes the number; the next free one on main is 0030)

| Table | Change |
|---|---|
| `account_preferences` (exists) | Add `spelling` (`british`, `american`; default `british`), `units` (`metric`, `imperial`; default `metric`), `learning_prefs` (JSON, validated by a Zod schema on read and write; default `{}`). The row's existing `version` covers them |
| `learner_instructions` *new* | `account_id`, `id`, `place_id` (null in L1: everywhere; topic notes use it in L2, with an `ON DELETE CASCADE` foreign key to `topics (account_id, id)`), `kind` (`about`, `teaching`, `topic_note`), `text` (1–1,000 characters), `version`, timestamps. Unique on `(account_id, kind)` where `place_id` is null |

Under `AGENTS.md`: the migration is built and tested on a disposable Neon branch; it reaches shared Dev and production only with the owner's explicit approval, and code that needs it reaches `main` only after it has been applied to every hosted database.

### 2.4 The "you" block (what the AI reads)

`readLearnerContext` returns one string, the **you** part of the design's slice (§6.1), in plain labelled lines, at most about 120 tokens (about 500 characters) before instructions:

```text
you: Architect. British spelling, metric.
learning: The learner works in architecture. They are learning passive cooling for work and know the basics of it.
prefers: starts with Watch; short; quick checks sometimes; examples from their field.
about (their words): "Architect, 8 years, mostly religious and civic buildings in the Gulf…"
taught (their words): "Diagrams before text. Define a term once, then use it…"
```

Rules:
- **Same data, same bytes.** A fixed order and fixed wording, so the hash is stable (system reference invariant 10).
- **Instructions are quoted as the learner's words**, escaped like every value today (`tagSafeJson` in the copilot; `escapeValue` in the brief).
- **Nothing set, nothing sent.** Without preferences or instructions the block is exactly today's learner line, so an account that never opens Settings sees no change.
- **Length.** Each instruction is cut to 400 characters in the block (whole words, with an ellipsis), so the block stays under 1,600 characters. Raise `job-input.ts:86` from 600 to **1,600** and redeploy the Trigger worker; an older worker would reject the longer string, so the worker deploys **before** the app.
- **Cache.** The block goes where the learner line goes today: per-turn data in the copilot's user message, and the brief's variable part. The cached system prefix and the author's cached block don't change, so no prompt version bump is needed. Check it with the existing pinned-hash tests (`tests/unit/copilot-prompt.test.ts`).
- **Preferences are hints, not options.** *Length* and *Examples from my field* become words in the block, not new keys in the explainer options bag (`src/features/explainers/options.ts`), which stays the Lumen dialog's own choices. *Start with* sets the default format in Learn's Make bar where that choice exists, and is stored either way.

### 2.5 Done when

- [ ] Settings shows three tabs on desktop and phone, in the existing Settings frame (`.preferences-form`, `.field`), with saving, saved, conflict, unavailable and empty states.
- [ ] Profile's *What you do* and the map's note card edit the same onboarding row; changing one shows in the other.
- [ ] A saved instruction reaches the **next** copilot turn and the **next** Lumen brief (integration tests, as `tests/integration/onboarding-learner-line.test.ts` does for the line today).
- [ ] With nothing set, the copilot context and the brief are **byte-identical** to before (unit test).
- [ ] The copilot's cached prefix hash is unchanged (existing pinned test passes untouched).
- [ ] The worker accepts a 1,600-character learner block, and the app never sends more.
- [ ] Account isolation: another account's instructions never appear (integration test).
- [ ] Docs updated in the same branch: `project-docs/implementation/ai.md` (*The learner line* becomes *The learner block*), `frontend.md`, `backend.md`, `database.md`, and `interface.md` (Settings).
- [ ] The prototype's Learning tab and the built one compared at matching widths (`AGENTS.md`: fidelity is checked in the browser, not by reading code).

### 2.6 Not in L1

The Memory tab, cards, the level dial, topic notes, the topic panel line, **For you**, `remember`, evidence, rules, the scribe, Usage, Export, Delete account and Off the record. They're L2 and later.

## 3. L2 in outline (the next spec)

The agent writes L2's own spec after L1 is accepted. Its scope, from the design and the reference:
- **Tables:** `memory_entries`, `memory_tombstones`, `memory_digests`, `context_snapshots` (system reference §2).
- **Backfill:** each account's onboarding answers become entries: the field on **You**, and level and purpose on the first interest's topic, basis *you said*.
- **Compile on write** (reference §3.4) and **`learnerSlice`** (reference §4.1), which replaces `readLearnerContext` and adds `path`, `here`, `seen`, `below` and `related` by place.
- **Unified Loci chat.** Since 24 October Loci has one conversation whose turns each carry a place (`src/features/copilot/context.ts:12–18`). So send-once (reference §4.2) splits in two: the **you** block is sent once per conversation, and the **place** part whenever the turn's place changes or its hash does.
- **Screens:** the Memory tab's Glance and Open, the level dial, **Tell Loci…** on a topic's menu, the one line on a topic's panel (in the shared Loci place core, `useLociPlace` (`src/components/graph/use-loci-place.ts`), so the Map and the Palace both get it), **For you** on Lumens from the snapshot, the memory toggle, Delete all.
- **The job input grows again** to carry the place part (about 2,400 characters), with another worker deploy before the app.

## 4. Rules every phase keeps

1. **What the learner sees is what Loci reads** (design §4.4). No line reaches a model that the learner can't open and change.
2. **Instructions win** over memory, and memory never changes topic status, My Focus, courses, published Lumens or schedules.
3. **No model reads memory.** Reading is templates and one query; models only write, and only from L3.
4. **Sensitive categories are never stored** (design §4.2), enforced by a validator in code, not left to a prompt.
5. **Temporary switches.** Each phase names its switch; the switch and its off side are removed once the owner accepts the phase (`project-docs/workflow/README.md`, *Feature switches are temporary*).
6. **The house rules** of `AGENTS.md`: own branch, docs in the same branch, local checks (lint, typecheck, unit, `check:docs`, `scripts/check-prototype.cjs`, build) before handing over, and no merge, push of `main`, migration or deploy without the owner's word.

## 5. Decisions for the owner

**Before L1 starts** (the agent asks these in its L1 spec; recommendations from the design):

| # | Decision | Recommendation |
|---|---|---|
| M-D3 | Settings tabs: Profile · Learning · Memory · Usage · Privacy & data (L1 ships the first, second and fifth) | **Yes** |
| M-D8 | Onboarding answers editable in Settings as well as on the map's note card, one record | **Yes** |
| M-D16 | Learning keeps four preferences and two boxes; depth moves to the level dial (L2) | **Yes** |
| B-1 | The learner block's cap: 1,600 characters, with a worker deploy before the app | **Yes** |
| B-2 | The L1 migration (`account_preferences` columns and `learner_instructions`) | The owner approves it when the spec is ready |

**Before L2:** M-D1 (memory attached to places on the map), M-D2 (the card's slots), M-D6 (deleting a topic deletes its cards), M-D7 (retention), M-D9 (**For you** on Lumens), M-D13 (show less), M-D15 (send once). **Before L4:** M-D5, M-D10, M-D14. **Before L5:** M-D12. The design spec's §13 has each one with its reasoning.

## 6. What changed since the design (24 → 28 October)

- **Feature switches were retired on 27 October** (`retire-switches`, merged as `8cefbcf8`), and new ones are temporary by rule. The switch names in §1 follow that rule.
- **Loci's chat is one conversation** with a place per turn (Unified Loci chat). That's why send-once splits into a "you" part and a place part (§3).
- **The Loci place core** (`useLociPlace` in `src/components/graph/use-loci-place.ts`, C1 of the 27 October stabilise pass) serves the Map and the Palace, so L2's topic-panel line goes there once.
- **Questions and goals** (Studiolo_Manage, 25 October) plans **Q5b**: an active goal suggests a place's `why`. That's L6 here, after both are built.
- **Migrations 0025–0029** have landed; L1's migration is the next free number.
