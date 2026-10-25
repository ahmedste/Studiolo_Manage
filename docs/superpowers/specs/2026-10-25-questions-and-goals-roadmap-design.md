HIGH (a programme of five phases; each phase states its own tier)

# Questions and learning goals in notes: five phases, one at a time

**For:** the agent building this in `studiolo`, and the owner approving it phase by phase.
**Status:** Proposed. Claude, 25 October 2026. Nothing here is approved until the owner says so in the conversation.
**Checked against:** `studiolo` main @ `b5eeee2` (25 Oct 2026), read only. Paths exist on that commit unless marked *new*.
**Builds on:** [`2026-10-25-questions-and-goals-inside-items-design.md`](2026-10-25-questions-and-goals-inside-items-design.md), which keeps the reasoning (the inside layer, decisions IN-D1 to IN-D9). This roadmap replaces that document's phase table for **order and scope**: it covers what exists today (short notes, long notes, margin notes and the capture box) and leaves boards and Work projects until they are built.

## 0. In short

The owner's direction (25 Oct): *start with what we have*. That means notes, long notes and margin notes, written as you take notes, while you watch and while you read. Boards come later.

**The fact that makes this cheap to start:** every note in Commonplace, wherever it is written, is saved through just two server operations. They are `createItem` and `updateItem` in `src/features/library/items-repository.ts:228, 674`. The capture box, the note page, the long-note editor, every margin-note composer (item page, quick view, watching room, web viewer, photo viewer, PDF reader) and Loci's reader note box all call them. So one parser and one save hook cover every place a learner writes.

| # | Phase | What the learner gets | Tier | Migration | Switch |
|---|---|---|---|---|---|
| Q1 | **Write them** | `@` menu with *Question* and *Learning goal* in every note composer; questions and goals shown as marked lines on cards and in long notes; "? 2 · ◎ 1" on a card's foot; `has:question` and `has:goal` in search | MEDIUM | no | `INLINES` |
| Q2 | **Keep track of them** | Open · Answered · Parked and Active · Reached · Paused · Dropped; an answer line and *Answered in*; a **Questions and goals** page beside To read; goal dates; questions grouped under their goal | HIGH | yes | `INLINES_TRACK` |
| Q3 | **While you watch and read** | **Q** and **G** in the watching room, the PDF reader, the photo viewer and the web viewer start a margin note at that moment; the question leads back to 12:40 or page 14 | MEDIUM | no | `INLINES_CAPTURE` |
| Q4 | **On Loci** | A topic's panel lists its open questions and active goals, at the topic and below; *Move to topic…* | MEDIUM | no | `INLINES_LOCI` |
| Q5 | **Loci uses them** | Loci reads open questions and goals at the place; goals suggest memory's *why*; *Explain this*, *Find resources* and *Ask Loci* on a question; "Make this a question?" offers | HIGH | no | per slice |
| later | **Boards and Work** | Questions and goals placed on a board's canvas; a board's goal; a project's questions | — | small | with Boards B1, Work W2 |

**Why this order:**
- **Q1 needs no data change.** The words live in the note's own text, so the marker alone is enough to show them, count them and search for them. Learners start the habit on day one, and nothing is thrown away later: Q2 reads the same text.
- **Q2 adds state, the only migration.** Status, answers and dates need a table. A backfill picks up everything written during Q1.
- **Q3 needs only Q1.** It is new buttons and keys on composers that already exist, and margin notes already carry the time or page. It can be built **in parallel with Q2**.
- **Q4 needs Q2**, because Loci should list *open* questions, not every question ever asked.
- **Q5 is the AI**, and waits for learner memory (Stage 4) and the resources skill, as Work and resources do.

**Parallel work:** Q2 and Q3 may be built at the same time on separate branches once Q1 has merged. Q4 waits for Q2; Q5 waits for Q4.

## 1. What exists today (main @ b5eeee2)

| Where a learner writes | How it saves | Body | Component |
|---|---|---|---|
| **Capture box** (Commonplace and *Capture* on Loci) | `createItem` | plain text, ≤ 5,000 (`NOTE_BODY_MAX`) | `src/components/library/capture-body.tsx` (has the `/` menu: `CAPTURE_SLASH_COMMANDS`) |
| **Short note page** | `updateItem`, on blur or Ctrl/Cmd+Enter | plain text | `item-hero.tsx :: NoteHero` → `InlineTextEditor` (always-editable textarea) |
| **Long note** (Document) | `updateItem`, on Save only | Markdown, ≤ 100,000 (`MARKDOWN_BODY_MAX`) | `document-page.tsx` → `MarkdownEditor` (view and edit modes, `/` menu: `WRITING_SLASH_COMMANDS`); `writing-space.tsx` |
| **Margin note on an item page** | `createItem` with `aboutId` | plain text | `notes-about.tsx :: NotesAbout` (video Sources: the place chip pins it to the playhead, `note-time.tsx`) |
| **Margin note in the quick view** | `createItem` with `aboutId` | plain text | `quick-view/notes-section.tsx`, `video-view.tsx:178`, `web-view.tsx:218`, `photo-view.tsx:241` |
| **Margin note on a PDF page** | `createItem` with `aboutId` and `notePage` | plain text | `pdf-viewer.tsx:261` |
| **Note from Loci's reader** | `createItem` | plain text | `src/components/graph/reader-note-box.tsx:38` |

Also relevant:
- **Markdown** is a fixed subset parsed to a tree and never treated as HTML (`src/features/library/markdown.ts`). Plain notes are not parsed.
- **Margin notes are off the wall** (`on_wall = false`), and a wall search that matches one shows its *parent* with "found in a note" (`item-card.tsx:113`, `library.md:208`).
- **Delete** says what goes and what stays (`delete-summary.ts`, the `delete-preview` route). Deleting a Source keeps its margin notes, which lose their page or time.
- **Switches** follow `src/config/library.ts`: `<SWITCH>=testers|all` with `<SWITCH>_TESTERS`.
- **Migrations** stop at `0026`.

## 2. Rules for every phase

- **The syntax is one paragraph, the same everywhere.** A paragraph whose first word is `@question` or `@goal` (any case, followed by a space) is one inline; the rest of the paragraph is its words. In plain notes a paragraph is a run of lines between blank lines; in long notes it is a Markdown paragraph. `\@goal` writes the word literally. Only those two full words count, so an email address or a future `@mention` never turns into a question by accident.
- **Hosts:** short notes, long notes and margin notes (any `shape = 'note'` with style `plain` or `long`, with or without `about_id`). **Not** quotes (a quote is the exact quoted text), and not Source descriptions or Object fields. These can come later (RQ-D2).
- **Never on the wall on its own.** An inline shows through its note: on the note's card and page, and, for a margin note, on the parent item's card, as search already does.
- **Learner's words, learner's status.** Loci never writes a marker or changes a status (Q5 only offers, with one tap, A2).
- **One parser.** *New* `src/features/library/inlines.ts :: parseInlines(body, style)` returns `{ kind, text, position, due? }[]`. It is pure and unit-tested, and the card builder, search, the save hook and the views all use it. Markdown's `parseMarkdown` gains two block types, `question` and `goal`, that call it.
- **Looks:** questions use `?` in `--pick`; goals use `◎` in `--accent-soft` (the colours the Boards design chose). No new tokens. Specimens go in `src/dev/library-specimens.tsx`, with screenshots at 1440 × 900 and 390 × 844, in light and dark.
- **Accessibility:** a marked line is read as "Question: …" / "Learning goal: …" (visually hidden prefix). The `@` menu works like the `/` menu, with arrows, Enter and Escape.
- **Paperwork and merging:** as in the photos roadmap §2. A phase spec in `studiolo/docs/superpowers/specs/` with its tier on line one; `library.md`, `frontend.md`, `backend.md` and `database.md` updated on the same branch; migrations hand-written and applied only on the owner's word; nothing merged before the owner has tested it.

## 3. Phase Q1: write them (MEDIUM, no migration)

**Goal:** a learner can write a question or a learning goal in any note, as they take notes, and find them again. Nothing is tracked yet.

**The `@` menu**
- *New* `src/features/library/at-menu.ts`, a sibling of `slash.ts` with the same token rule: `@` at a line start, or after a space. Two entries:
  - `?` **Question** · "Something you want to find out" → inserts `@question `
  - `◎` **Learning goal** · "Something you want to be able to do or understand" → inserts `@goal `
- It always inserts at the **start of the paragraph**, even when `@` is typed mid-line, so the result is always valid.
- It reuses `SlashMenu` (`slash-menu.tsx`) and the `useSlashMenu` hook's keyboard handling. Typing `@q` or `@g` filters the list.
- Wired into every composer in §1: `capture-body.tsx`, `InlineTextEditor` (when it edits a note body, via a new `atMenu` prop), `MarkdownEditor` and `writing-space.tsx`, `notes-about.tsx`, `quick-view/notes-section.tsx`, `video-view.tsx`, `web-view.tsx`, `photo-view.tsx`, `pdf-viewer.tsx` and `reader-note-box.tsx`.
- Touch: the composers' toolbars, where they have one, gain `?` and `◎` buttons that insert the marker. Others rely on typing `@`.

**Showing them**
- **Long note view** (`MarkdownView`): the two new block types render as marked lines: the glyph, then the words, in the reading face. A goal shows a little larger, with the questions after it indented under it.
- **Cards** (`item-card.tsx`): a note's excerpt shows a marked line with its glyph instead of the raw `@question`. The card's foot (`Footer`) gains "? 2 · ◎ 1", counted by `parseInlines` when the card is built, in `--ink-3`. A Source or Photo whose **margin notes** hold questions shows the same count, so a video with three questions in its notes says so on the wall.
- **Short note page and margin notes while editing:** the textarea shows the words as typed (`@question Does depth…`); this is plain and readable. The note page's rail gains an **Inside** row ("2 questions · 1 goal") listing them, in `note-page.tsx`.
- **Margin note cards** on an item page (`NotesAbout`'s list) show marked lines, like the wall's cards.

**Finding them**
- **Search keywords:** `has:question` and `has:goal` in the wall's search (`search.ts`). They match notes whose body has the marker, plus items whose margin notes have it. The match is a case-insensitive regular expression on `body` (`~* '(^|\n)@question\s'`), which is fine at thousands of notes per account; Q2 replaces it with an index.
- With `CP_HEADER` on, the slim bar's filter slot gains **Has ▾** (*Questions · Goals*), which sets the same query.
- Matched results show the host card with the matching line under it, using today's "found in a note" pattern.

**Done when:**
- `@` then Enter inserts a marker in each of the eleven composers in §1.
- A long note with a goal and two questions shows marked lines in view mode.
- The note's wall card shows "? 2 · ◎ 1". A video whose margin note has a question shows "? 1".
- `has:question` finds both the note and the video.
- `\@goal` stays literal.
- With `INLINES` off, nothing changes. The parser's tests cover plain and Markdown bodies, mid-line `@`, email addresses and CRLF line ends.

## 4. Phase Q2: keep track of them (HIGH, migration)

**Goal:** a question can be answered or parked, a goal can be reached, and the learner has one place to see what's still open.

**Data:** migration `0027_item_inlines.sql` (number at the time of writing).

*New* table `item_inlines`:

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `account_id` | uuid | composite keys on `(account_id, …)` as elsewhere |
| `host_item_id` | uuid null | FK to `content_items (account_id, id)`, `ON DELETE CASCADE`. Null only for a goal written in Settings on *You* (Q5; check: `kind = 'goal'`) |
| `kind` | text | `question` · `goal` |
| `position` | smallint | order in the host |
| `text` | text ≤ 500 | the words, copied from the body on each save |
| `status` | text | question: `open` · `answered` · `parked`; goal: `active` · `reached` · `paused` · `dropped` (check by kind) |
| `goal_id` | uuid null | the goal it serves; `ON DELETE SET NULL` |
| `topic_id` | uuid null | its own place, set in Q4; null means it follows the host's topics |
| `due` | date null | goals only |
| `answer` | text ≤ 500 null | questions only |
| `removed_at` | timestamptz null | set when its words leave the text; see *Removing* |
| `origin` | text | `learner` · `loci_offer` (Q5) |
| `created_at`, `updated_at`, `decided_at` | timestamptz | |

*New* table `inline_answers(id, account_id, inline_id, item_id)`: **Answered in** links to Commonplace items. Explainer and board targets are added when Q5 and Boards need them.

Indexes: `(account_id, host_item_id, position)`; `(account_id, kind, status) WHERE removed_at IS NULL`.

**The save hook**
- *New* pure function `reconcileInlines(previous, parsed)` in `inlines.ts`. It matches by kind and order first, then by closeness of the words (a normalised edit distance), so a reworded question keeps its status and answer. It returns `{ keep, add, remove }`.
- `createItem` and `updateItem` call it **in the same transaction** as the body write, for hosts only, and write `item_inlines`. Because every composer goes through these two, there is nothing to change in the UI for saving.
- `goal_id` is set for each question that follows a goal in the same host, up to the next goal.
- `due` is parsed from a goal's last words: "by March", "by 12 December", "by 2027", "by the end of term" (that one is kept as words with no date). Pure and tested, in the learner's locale with British date order.
- **Backfill:** *new* `scripts/inlines-backfill.mjs` reads every host body written during Q1 and fills the table. It is idempotent and resumable, like `media-backfill.mjs`.

**Removing**
- A short note saves on blur, so a "Remove this answered question?" dialog would interrupt typing. Instead, when an inline with an answer or a non-open status leaves the text, its row gets `removed_at`, and the save shows an Undo toast: "Removed the question *Does depth…* and its answer. Undo." Undo puts the paragraph back.
- Rows with `removed_at` are deleted after 30 days.
- This replaces IN-D9's "ask first" (RQ-D3).
- Deleting a host: the delete dialog (`delete-summary.ts`, `delete-preview`) adds "and its 2 open questions and 1 goal".

**On the note**
- Each marked line gets a small status menu (a `button` after the words). For a question: **Answer…** (one line), **Answered in…** (the existing item picker from `link-dialog.tsx`), **Mark answered**, **Park**, **Reopen**. For a goal: **Reached**, **Pause**, **Drop**, **Make active**.
- An answered question shows its answer under it in `--ink-2`, and *Answered in: Wind catchers* as a link.
- The status menu appears on the long-note view, on cards (in the quick view and on the item page) and in the note page's **Inside** rail row (the short-note textarea itself stays plain).

**The Questions and goals page**
- *New* route `src/app/(workspace)/library/questions/`, next to To read, reached from the library's tabs (beside **To read**) and from *Has ▾ › See them all*.
- A list, not a wall:
  - **Goals** first, active ones on top, each with its date and its questions under it ("2 of 5 answered").
  - **Open questions** next, grouped by area and topic.
  - Then **Answered** and **Parked**, folded.
- Each row names its host ("in *Lecture notes, week 3*", or "on *Passive cooling lecture*, 12:40") and opens it at the line.
- Filters: status, area, topic, and the text search.
- `has:question` now reads the index (`status = 'open'` by default; `has:question:answered` too).

**API:** *new* `src/app/api/library/inlines/route.ts` (list), `…/inlines/[inlineId]/route.ts` (status, answer, answered-in), going through *new* `inlines-repository.ts`, with account checks and version conflicts as in the items repository.

**Done when:**
- An answer and a status survive a reworded question.
- Removing an answered question offers Undo, which restores it.
- Questions written during Q1 appear after the backfill.
- The page lists goals with their questions, and each row opens its note at the line.
- Deleting a note names its open questions.
- Integration tests cover reconcile through `updateItem`, and the end-to-end test runs "write, answer, find on the page".

## 5. Phase Q3: while you watch and read (MEDIUM, no migration)

**Goal:** "Oh, I want to learn this" is two keys, at the exact moment it occurred to you.

| Where | Keys and buttons | What happens |
|---|---|---|
| **Watching room** (`quick-view/video-view.tsx`) and a video Source's page (`NotesAbout` with `VideoNotes`) | **Q** · **G**, and `?` `◎` buttons by the note box | Pauses the video and opens the margin-note composer, with `@question ` or `@goal ` typed and the place chip on the current time (`note-time.tsx`) |
| **PDF reader** (`pdf-viewer.tsx`) | **Q** · **G** | Opens the page-note composer on the current page (`notePage`) with the marker |
| **Photo viewer** (`quick-view/photo-view.tsx`) | **Q** · **G** | Opens the photo's note composer with the marker (a box on a detail joins later, with the photos design's Phase 6) |
| **Web viewer** (`quick-view/web-view.tsx`) | **Q** · **G** | Opens the link's note composer with the marker |
| **Loci's reader** (`graph/reader-note-box.tsx`) | `?` `◎` buttons | As above |

- Keys work only when focus is not in a text field (the PDF reader's `/` key already follows this rule, `pdf-viewer.tsx:227`). Before building, check them against `use-graph-shortcuts.ts` and the viewers' existing keys; if a key is taken, use Shift + Q / Shift + G.
- **Leading back:** a marked line in a timed margin note shows the time as today's `NoteTimeButton`, which seeks; a page note links with `pdfViewerHref`. Q2's page rows use the same links.
- **On the video's timeline:** a small `?` tick at each question's time, clickable, in the watching room's scrubber area. (Optional within the phase.)
- The keyboard hint in each viewer's panel lists **Q** and **G**.

**Done when:** in the watching room, **G** pauses at 12:40 and opens the composer with `@goal ` and "12:40"; after saving, the line plays from 12:40; the same works on a PDF page; the keys never fire while typing.

## 6. Phase Q4: on Loci (MEDIUM, no migration)

**Goal:** a topic shows what you're asking and aiming for there.

- **Place:** an inline belongs to its host's topics. For a margin note with no topics of its own, it belongs to its parent item's topics. *Move to topic…* in the status menu sets `item_inlines.topic_id` (the column added in Q2), and then it belongs to that topic alone.
- **Topic panel** (`src/components/graph/topic-panel.tsx` / `topic-inspector.tsx`): two short sections, **Goals here** and **Open questions here**, at the topic and below it, at most 5 each with *See all*. *See all* opens the Questions and goals page filtered to the topic.
- **Areas:** the area's overview panel (`overview-panel.tsx`) shows counts only ("4 open questions · 1 goal").
- **Map capture** (`map-capture.tsx`) already saves to the topic you're in, so `@goal` written there lands on that topic with no extra work.
- No change to nodes or colours (owner decision D-2: no recolouring of nodes).

**Done when:** a question written in a note tagged *Courtyards* shows under *Courtyards* and under its area; *Move to topic…* moves it; a question in a margin note on an untagged video inherits the video's topics.

## 7. Phase Q5: Loci uses them (HIGH, AI, no migration)

Each slice gets its own small spec, after learner memory (Stage 4) and, for one slice, the resources skill.

| Slice | What it does | Depends on |
|---|---|---|
| **Q5a. Loci reads them** | The place's open questions and active goals go into Loci's per-turn context (`src/features/copilot/context.ts`), at most 5 each, about 150 tokens | Q4 |
| **Q5b. Goals become `why`** | An active goal suggests the place's `why` memory line, basis `said`, naming the note it came from. A goal written in Settings on *You* (host null) is the account-wide `why` | learner memory |
| **Q5c. Learn ranks by goals** | Learn Home's *Next for your goals* and Today read active goals with dates | Learn slice 2 |
| **Q5d. Act on a question** | **Explain this** (a Lumen whose brief is the question, its note and its topic; its end asks "Did this answer it?", and *Yes* adds *Answered in*); **Ask Loci** (opens the one Loci thread with the question and its note in context); **Find resources** (the resources skill, origin `question`) | explainers; the resources design R1 |
| **Q5e. Offers** | After a note is saved: "This note asks three things. Make them questions?" (paragraphs ending in "?"). "Make this a learning goal?" for "I want to…" / "I need to understand…". At most once per note; accepted ones get `origin = 'loci_offer'` | Q5a |

**Never:** Loci writes into a note without a tap, or sets a status. An answered question is not `known`; only a check answered right is (course engine §6.3).

## 8. Decisions for the owner

| ID | Question | Recommendation |
|---|---|---|
| **RQ-D1** | The marker words: `@question` and `@goal`, or shorter (`@q`, `@g`) in the saved text? | **The full words in the text**, so the note reads well anywhere; `@q` and `@g` only filter the menu |
| **RQ-D2** | Hosts in Q1: short, long and margin notes only? | **Yes.** Quotes, Source descriptions and Object fields wait until someone needs them |
| **RQ-D3** | Removing an answered question while editing: ask first, or remove with Undo? (changes IN-D9) | **Undo**, because short notes save on blur and a dialog would interrupt typing; rows are kept for 30 days |
| **RQ-D4** | Where *Questions and goals* lives | **A tab beside To read** in Commonplace, plus Loci's topic panel; in Learn later (Q5c) |
| **RQ-D5** | Search keywords `has:question` / `has:goal` while `CP_HEADER` is off | **Yes.** They cost nothing, and they also serve power users when the header is on |
| **RQ-D6** | Q2 and Q3 in parallel | **Yes**, on separate branches after Q1 merges; they touch different files except `inlines.ts` |
| **RQ-D7** | The **Q** and **G** keys in viewers | **Yes**, if free; otherwise Shift + Q / Shift + G |

## 9. Handing a phase to the building agent

For each phase, the agent:
1. reads this roadmap and the design document (`2026-10-25-questions-and-goals-inside-items-design.md`);
2. writes the phase spec in `studiolo`, tier on line one, listing what it reuses, the files it touches, the migration if any, and its specimens;
3. for HIGH (Q2, Q5), waits for the approver's approval of that spec;
4. builds behind the switch, updates the guides, and runs the checks for its tier (lint, typecheck, unit tests, `check:docs`, `scripts/check-prototype.cjs`, build);
5. hands the branch to the owner with paired screenshots and a short "try this" list, and does not merge until the owner says so.
