HIGH (a new lane, N, in the Objects, questions and boards programme; four phases, two with migrations)

# Long notes and connections: a writing page, and one clear way things link

**For:** the owner, to approve the model and the order; then the agents who build lane N in `studiolo`.
**Status:** Proposed. Claude, 28 October 2026. Nothing here is approved until the owner says so in the conversation.
**Checked against:** `studiolo` main @ `7c0e8732`, read only. Paths exist on that commit unless marked *new*.
**Fits into:** [Objects, questions and goals, and boards: one programme](2026-10-28-objects-questions-boards-programme.md) as lane N (§7 here). It builds on the [Questions and goals design](2026-10-25-questions-and-goals-inside-items-design.md) (the `@` menu, `item_inlines`, `reconcileInlines`) and the [Objects build phases](2026-10-25-objects-build-phases.md) (relation fields, F2).
**Prototype:** [`prototypes/objects-boards-questions/`](../../../prototypes/objects-boards-questions/README.md): **Long note** in the bar at the bottom, or open any long note or Object. **Show phases** labels each part N1 to N4.

## 0. In short

The owner's direction (28 Oct): *long notes should feel like Craft notes, where you can embed images, questions and goals, and write about an Object. A long note opens a page you edit in place. And the links between all of this must stay simple, for the code and for the learner: always clear where to go and what to do.*

**Two decisions carry the whole design:**

1. **A long note is a page you write on, not a record you edit.** It opens as a calm reading column that is always editable, made of blocks: text, headings, lists, quotes, dividers, images, **entry cards**, and **questions and goals**. `/` inserts a block. `@` makes a question or a goal, or links an entry by name. Selecting words gives a small bar. Every block has a handle to move it or turn it into another kind. The same editor writes an Object's *What I took from it* and short notes, so there is one way to write everywhere.
2. **Things connect in exactly three ways, and each one is made and changed in one place.**

| Kind | It says | You make it | It lives in | The other side shows it as |
|---|---|---|---|---|
| **Mention** | *I wrote about this here* | `@` and a name while writing, or an **entry card** | the writing (read from the text) | **Mentioned in**, with the sentence |
| **Property** | *This is a fact about it* (Architect: Hassan Fathy; Cites: Caparo) | the rail: a field, or **Link…** | the rail of the entry it describes | its other-side name, in the rail (Works; Cited by) |
| **Link** (on a board) | *On this board, these two belong together* | dragging a line between two cards; a label if you like | the board | **On boards**, as a backlink |

Everything else is not a connection kind: a note's **About** is the note's subject, *Answered in* is a question's property, and topics are Loci's.

**Where to look, on every page, always in the same place:**
- **The rail is what it is:** its properties (fields and named links, both directions) and what's inside it (questions and goals).
- **The foot is where it shows up:** first **Notes about it** (margin notes and long notes, made here), then **Appears in** (*Mentioned in*, *Answers*, *On boards*). Each of these is changed where it was made, and each row opens that place.

**One way up, never automatic:** a mention is loose, an arrow is argued, a property is a fact. Each step up is a one-tap offer (*Keep as a field* on an arrow, OQB-D6), never a silent change.

## 1. What's there today

**Long notes** (`src/components/library/document-page.tsx`, the former Document page, D15):
- The page is the shared item frame: a title hero, then the writing, then *Margin notes* and *Linked* shelves, with a rail (Template, Origin, On the map, Collection, Linked, Blocks).
- The writing is one Markdown body (`features/library/markdown.ts`: headings, paragraphs, block quotes, lists, strong, emphasis and web links; nothing is ever treated as HTML).
- It is read until you press **Edit long note** in the rail. Then `markdown-editor.tsx` swaps in a textarea; **Save** writes the whole body. The `/` menu (`slash.ts`, `WRITING_SLASH_COMMANDS`) inserts `# `, `> `, `- ` or `[text](https://)` as text. **⤢** (`body-writing-space.tsx`) opens a full-screen writing space.
- There is no image, no link to another entry inside the text, and no block you can move.

**Connections today and planned.** Counting the programme, two things can be joined in seven ways, each drawn differently:

| # | Way | Where it is today | Shown as |
|---|---|---|---|
| 1 | A named link, one of 11 (`relations.ts`: Made by, Cites, Mentions, Compared with…) | `content_relations`, made in the Link dialog | rail **Linked**, and a **Linked** shelf |
| 2 | A field that links to an item (`FieldType` `item`; F2 widens it to relation fields) | `item_field_values` | rail row |
| 3 | A note about an item (`about_id`) | `content_items.about_id` | **Margin notes** shelf |
| 4 | A question answered in an item (Q2) | *new* `inline_answers` | **Answers** shelf (Q-O) |
| 5 | Placed on a board (B1) | *new* `board_placements` | rail **On boards** |
| 6 | An arrow on a board (B1) | *new* `board_arrows` | the board |
| 7 | A topic | `content_topic_tags` | **In Loci** |

The owner's worry is right: seven ways, with *Mentions* made by hand in a dialog even though mentioning is something you do while writing. A learner can't tell where to look, and the code grows a shelf and a read path for each.

## 2. The connection model

### 2.1 Three kinds, one home each

**Mention.** You name an entry while writing: `@Hassan Fathy` in a sentence, or the entry shown as a card. A mention is part of the text and comes from it: delete the words and the mention goes. It has no name and needs no dialog. On the other side it shows as **Mentioned in**, with the sentence it's in, so the learner sees *why* it was mentioned.

**Property.** A named fact about an entry, in its rail: a relation field (*Architect*, *Cites*, *Recommends*; F2) or one of the named links from the Link dialog (*Compared with*, *Made by*). Both sides show it in their rails under its own name (*Works*, *Cited by*), because it is part of what each entry is.

**Link.** A line between two cards on one board, with an optional label (Boards §7.10). It belongs to the board. Both entries' pages list it under **On boards**, as a backlink naming the card at the other end.

### 2.2 Rules

| Rule | What it means for the learner | What it means for the code |
|---|---|---|
| **C1 · Made in one place** | You change a connection where you made it: a mention in the writing, a property in the rail, an arrow on the board. Everywhere else it's a reflection that opens that place | One writer per kind; reflections are read-only queries |
| **C2 · Same two places on every page** | The rail says what it is; the foot says where it shows up: **Notes about it**, then **Appears in** | One `<Connections>` component and one read model replace four shelves (§5.4) |
| **C3 · Up, never sideways, and only by offer** | Mention → arrow → property. *Keep as a field* on an arrow (exists, OQB-D6); *Make it a property…* on a mention (N4) | No automatic writes between kinds; every offer is one tap (A2) |
| **C4 · About is a subject, not a link** | A margin note or a long note can be **about** one entry. It's listed under that entry's **Notes about it** | `about_id` stays as it is; a long note may set it too |
| **C5 · A question belongs to its writing** | As in the Questions design; **Answered in** is the question's own property; the answering entry lists it under **Answers** | `inline_answers` unchanged |
| **C6 · Boards draw arrows and field links, not mentions** | A board stays readable: no web of grey lines from every mention | The board's read model never reads `item_refs` |

### 2.3 Today's ways, mapped

| Today | Becomes | Change |
|---|---|---|
| Named links (11) | **Property**, rail | `mentions` leaves the Link dialog: its rows become mentions (§5.3). The other ten stay |
| Item and relation fields | **Property**, rail | Their other side moves from a card shelf to the rail (F2's *other-side blocks* still exist in P2's Arrange page) |
| `about_id` notes | **Notes about it** | Long notes can be *about* too (N3) |
| *Answered in* | **Appears in › Answers** | The Q-O shelf folds into the section |
| Placed on a board | **Appears in › On boards** | The rail row (B2) moves to the foot |
| Arrows | the board | Unchanged |
| Topics | **In Loci** | Unchanged |

### 2.4 Where to go, by what you want

| I want to… | Go to | Do |
|---|---|---|
| record a fact about it (who designed it, which case it cites) | its page, the rail | fill the field, or **Link…** |
| jot a line beside it | its page, **Notes about it** | **Add a margin note** |
| write about it at length | its page, **Notes about it** | **Write about it** |
| refer to it while writing anything | the writing | `@` and its name |
| show it inside my writing | the writing | `/` › **Entry card** |
| argue how two things relate | a board | place both, drag an arrow, say why |
| ask something, or set a goal | wherever I'm writing | `@` › **Question** or **Learning goal** |
| see everything that refers to it | its page, **Appears in** | open a row |

## 3. The long note page

### 3.1 Layout

- **A reading column**, about 700 px, centred on the stage. The title is the app's title field (`ip-title-field`), large Newsreader. Under it is one quiet line: **About** (the entry it's about, if any), its topics, and a count ("3 entries · ◎ 1 · ? 2 · Saved as you type"). A rule separates it from the writing.
- **On this page**, on the left on wide screens: the headings, once there are two or more. Click one to scroll to it.
- **Details** is a toggle in the top bar, closed by default: the rail (Template, About, **Mentions** read from the writing, Inside, In Loci, Collection, Blocks, Open in Loci, Delete). Craft keeps the page clean the same way, and a long note has few properties.
- **The foot** is the same on every page (C2): **Notes about it**, then **Appears in**.
- The top bar keeps the app's `ip-top`. **←** names where it goes back to: the board, the list, or the entry you came from. One history covers every way of opening an entry.

### 3.2 Blocks

| Block | Typed as | Stored as |
|---|---|---|
| Text | just type | a paragraph |
| Heading, Subheading | `/heading`, or `## ` and `### ` at a line start | `## `, `### ` |
| Bulleted, Numbered list | `/list`, or `- `, `1. ` | `- `, `1. ` (one item per block) |
| Quote | `/quote`, or `> ` | `> ` |
| Divider | `/divider`, or `---` | `---` |
| Image | `/image`: from your Photos, or upload | `![caption](file:<id>)` (*new*) |
| Entry card | `/entry`, or **Show it as a card** on a mention | `::card[](item:<id>)` (*new*) |
| Question, Learning goal | `@` at a line start, `/question`, or **? Ask about this** on a selection | `@question `, `@goal ` (Q1) |
| Mention (inside text) | `@` and a name; or select words › **Link to entry** | `@[words](item:<id>)` (*new*) |

- **An entry card** shows the entry as it is now: its picture or initials, kind and collection, title, up to three fields and its "? · ◎" counts. It opens the entry. A deleted entry's card says so and stays until you remove it.
- **An image** belongs to the note. It is not a Photo on the wall unless you choose **Add to Photos** in its block menu, which makes it one, linked back to the note. Uploads use the existing stored-object pipeline (`files-schema.ts`).
- **Questions and goals** keep their status buttons and answer lines in place (Q2), and Enter after a goal starts a question under it.

### 3.3 Editing

- **Always editable.** There's no Edit button: click and type. It saves on a pause (about 0.8 s) through the library's own update, so the version check, conflicts and Undo work as they do now. The top bar says *Saving…* and then *Saved*.
- **`/`** in an empty block opens **Insert a block**; type to filter, then Enter.
- **`@`** opens **Make, or link to an entry**. At a line start it offers Question and Learning goal first, then entries by name. Mid-sentence it offers entries only, and choosing one puts a mention there.
- **Selecting words** shows a bar: **B**, *I*, **↗ Link to entry**, **? Ask about this**, **✎ Margin note**, and **Explain** (N4).
- **The block handle** appears on hover: **+** adds a block below, and **⋮⋮** drags it or opens the block's menu (Turn into…, Move up and down, Duplicate, Margin note on this block, Delete). An entry card's menu adds **Show as a link in the text**; an image's adds **Replace** and **Add to Photos**.
- **Clicking a mention** shows the entry's card with **Open ↗**, **Show it as a card below** and **Unlink, keep the words**.
- **Keys.** Enter splits a block (an empty list item or question returns to text). Backspace at a block's start turns it back into text, then joins it with the one above. ↑ and ↓ cross blocks. Ctrl or ⌘ B and I format. Pasting brings in plain text.
- **Phones.** The handles go; a bar above the keyboard holds **+ Block**, **?**, **◎**, **@**, **⋮⋮** and **Done**, as the Questions design asked for touch.

### 3.4 One editor everywhere you write

An Object's **What I took from it**, a short note and a long note all use the same editor, with the same blocks, `@` and `/`. Only the page around it differs. This ends today's two modes (read, then **Edit**) and keeps one keyboard model. The capture box keeps its own composer (`capture-composer.tsx`) and gains `@` only (Q1).

## 4. Writing about an Object

- **Write about it**, under **Notes about it** on any Object, Source or Photo page, starts a long note: titled *On Great Mosque of Córdoba*, **About** the entry, its card first, then the collection's writing headings, with the caret in the first empty line. It's listed under the entry's **Notes about it** at once.
- **Each Objects collection has a writing template**: a few headings, in **Edit collection › Page** ("Write about it starts with"). Starter types (T1) bring theirs: *Site and climate · Plan and section · What I'd take from it* for buildings; *Facts · Held · Why it matters for the client* for cases; *When I'd use it · Watch for* for drugs.
- **Where to write what:** *What I took from it* on the Object is the short version, part of the Object. A long note about it is a study of its own, and can mention or show other entries too. The empty state under **Notes about it** says so in one line.
- **Margin notes on a block** (N3): **✎ Margin note** on a selection, or in the block menu, adds a margin note to the long note that remembers its block. A small **✎ 1** sits beside that block, and the note is listed under **Notes about it**. The locator gains a kind, `{ kind: "block", key }`. Its key is the block's first words, re-matched on save the way `reconcileInlines` re-matches questions.

## 5. Storage and code

### 5.1 The body stays Markdown

The body stays one Markdown string. It's already searched, exported, versioned and undone, and `MarkdownView` already renders it with no HTML. N2 adds three markers to `parseMarkdown` (pure, unit-tested):

| Marker | Block or inline | Rule |
|---|---|---|
| `![caption](file:<uuid>)` | block, on its own line | the file must belong to the account; otherwise it shows "Image unavailable" |
| `::card[](item:<uuid>)` | block, on its own line | `MdBlock` gains `{ type: "card", itemId }` |
| `@[words](item:<uuid>)` | inline | `MdInline` gains `{ type: "mention", itemId, children }` |

`\@` and `\::` stay literal. A body that doesn't use them parses exactly as today.

### 5.2 The editor: CodeMirror 6 with a live preview

`@codemirror/view` 6.43 and `@codemirror/state` 6.7 are already dependencies (`explainers/player/stage/code-slide.tsx`). A live-preview editor keeps the Markdown as the document and draws it as blocks:
- decorations hide the markers (`## `, `**`, `@[…](item:…)`);
- widgets draw entry cards, images, question and goal chips, and mention pills;
- a gutter carries the **+** and **⋮⋮** handles;
- the `/` and `@` menus are CodeMirror autocompletions that reuse `slash.ts` and the Questions design's `at-menu.ts`.

**Why not ProseMirror, TipTap or Lexical:** each brings a second document model and a JSON-to-Markdown round trip that has to be kept lossless forever, plus a new dependency. CodeMirror keeps one model, the text, and handles IME, mobile selection and very long notes well. Two things need care: widgets need accessible names, and the whole editor is one labelled textbox ("Long note text"), as today.

The prototype draws its blocks with plain `contenteditable` to show the behaviour; it is not the proposed implementation.

### 5.3 Mentions are read out of the writing

- *New* table `item_refs` is the writing's index:

| Column | Type | Notes |
|---|---|---|
| `account_id` | uuid | account isolation |
| `from_item_id` | uuid | the writing's entry (a long note, a note, an Object); `ON DELETE CASCADE` |
| `from_note_id` | uuid null | set when the mention is in a margin note of `from_item_id` |
| `to_item_id` | uuid | `ON DELETE CASCADE`; the text keeps its words, and the pill shows as deleted |
| `kind` | text | `mention` · `card` · `manual` (migrated, §below) |
| `position` | smallint | order in the body |
| `snippet` | text ≤ 200 | the sentence, for **Mentioned in** |

- **One save pipeline.** On every body save, one pure function parses the body once and returns its inlines and its refs. `reconcileInlines` and *new* `reconcileRefs` write both in the same transaction as the body. Refs are only ever written there (C1).
- **Migration of hand-made Mentions.** Rows of `content_relations` with `relation = 'mentions'` become `item_refs` with `kind = 'manual'`, shown under **Mentioned in** as "linked by hand". `mentions` leaves the Link dialog; `RELATION_NAMES` keeps it for reading old rows until a later cleanup.
- **Deleting an entry** warns with what refers to it: "Mentioned in 3 notes. Their words stay; the links show as deleted."
- Limits: 200 refs and 50 images per body. `MARKDOWN_BODY_MAX` is unchanged.

### 5.4 One read model, one component

- *New* `connectionsFor(itemId)` returns `{ notesAbout, mentionedIn, answers, onBoards }` in one round trip: `about_id`, `item_refs` reversed, `inline_answers`, and `board_placements` (from B1).
- *New* `<Connections>` draws **Notes about it** and **Appears in**. It replaces `NotesAbout` and `LinkedShelf` at the foot of every page, the Q-O *Answers* shelf and B2's *On boards* rail row. The rail keeps `LinkedItems` for named links (properties).

## 6. What it looks like for each learner (prototype data)

- **Architect.** *Two ways to stretch a hall* is about Kairouan. It shows Kairouan and Córdoba as entry cards and an arcade photo with a caption. It mentions Hassan Fathy in a sentence, quotes *Shade first, then mass, then air*, and ends with a goal and two questions. Hassan Fathy's page lists it under **Mentioned in**, with the sentence.
- **Lawyer.** *Seminar notes: negligence after Robinson* has Robinson as a card, a mention of it in the argument, the goal and its questions, and an *Authorities* section of case cards.
- **Doctor.** *Respiratory rotation: week 2* mentions NG158, shows it and Apixaban as cards, and has a numbered list of first choices.

## 7. Phases: lane N in the programme

| ID | Stage | What | Tier | Migration | Depends on |
|---|---|---|---|---|---|
| **N1** | 1 · Track and fields | **The page and the editor**: CodeMirror live preview, always editable, autosave, blocks (heading, subheading, lists, quote, divider), `/` menu, handles, keys, **On this page**, **Details** toggle, phone writing bar. Object writing and short notes use it | HIGH | no | Q1 (its markers render as chips) |
| **N2** | 2 · Links and places | **Mentions, entry cards and images**: the three markers, `@` for entries, the selection bar's **Link to entry**, `item_refs`, `<Connections>` with **Appears in**, `mentions` retired from the Link dialog | HIGH | yes: `item_refs`, migrate `mentions` | N1; lands beside F2 (both are links) |
| **N3** | 2 → 3 | **Write about it**: About on long notes, collection writing templates, margin notes on a block (locator kind `block`) | MEDIUM | yes: locator kind; `collections.write_template` | N2, F1, T1 for starter headings |
| **N4** | 3 · Loci uses them | **Loci in the writing**: link offers when an entry's exact name is typed, **Explain** on a selection (kept as a margin note), *Make it a property…* on a mention, *Make this a question?* | HIGH | no | N2, Q5 |

**Agents.** Lane N is one agent's: N1 → N2 → N3 → N4. N1 touches `document-page.tsx`, `markdown-editor.tsx` and `slash.ts`; Q1 touches `markdown.ts` and the composers. So Q1 merges first in Stage 0, and N1 starts on top of it. N2 and F2 both add link rows to the rail and the foot, so they share `<Connections>`: whichever merges first adds it.

**Boards (Stage 4).** A long note placed on a board shows as its card. Double-clicking it opens the page. Mentions are not drawn (C6).

## 8. Decisions for the owner

| ID | Decision | Recommendation |
|---|---|---|
| **LN-D1** | Three connection kinds (mention, property, arrow), each made in one place | **Yes**. It is the rule that keeps the UI and the code small |
| **LN-D2** | Every page: the rail says what it is, the foot says where it shows up (**Notes about it**, **Appears in**) | **Yes** |
| **LN-D3** | Retire the hand-made *Mentions* link; mentions come from the writing | **Yes**, migrating old rows as "linked by hand" |
| **LN-D4** | The body stays Markdown with three new markers | **Yes**. Export, search, versions and Undo keep working |
| **LN-D5** | CodeMirror 6 live preview, not a rich-text framework | **Yes**. It's already a dependency, with one model and no round trip |
| **LN-D6** | Always editable, no Edit button, autosave | **Yes**, with the existing version check and Undo |
| **LN-D7** | Images in a note belong to the note, not the wall; **Add to Photos** promotes one | **Yes** |
| **LN-D8** | Object writing, short notes and long notes share one editor | **Yes** |
| **LN-D9** | Mentions are not drawn on boards | **Yes** |

## 9. What this is not

- No page tree or nested pages: a long note shows another as an entry card instead, and Commonplace stays one flat wall.
- No tables, code blocks or toggles in N1–N4.
- No real-time co-editing or comments from other people.
- No graph view of mentions. Loci is the map.
