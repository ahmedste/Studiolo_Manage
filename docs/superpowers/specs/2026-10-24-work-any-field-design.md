HIGH (a new destination and new records; it replaces the model in the first Work design)

# Work, in any field: applying what you know, the same way everywhere

**For:** the owner, to react to and steer. A starting point for a discussion, not a build spec.
**Status:** Idea, explored. Claude, 24 October 2026. Nothing here is agreed until the owner says so in the conversation.
**Replaces:** the model in [`2026-10-24-work-design.md`](2026-10-24-work-design.md) §2–§6, which was shaped around an architect. That document's loop (§0), touchpoints (§7) and "what this is not" (§11) still stand.
**Builds on:** [Boards](../../../prototypes/boards/README.md) (the canvas), [Commonplace photos](2026-10-24-commonplace-photos-design.md) (the viewer and notes on a detail), the [learner memory design](2026-10-24-learner-memory-and-settings-design.md) (what Loci remembers).
**Prototype:** [`prototypes/work-any-field/`](../../../prototypes/work-any-field/README.md). One engine, three fields: switch between an architect, a lawyer and a doctor and see what changes.

## 0. In short

The owner's point (24 Oct): *Work has to adapt to anyone (a lawyer, a doctor), not only architects and designers. We sorted out how Learn applies; now sort out how Work applies.*

Learn already has one shape for everyone: **learn → check → remember**. Every Lumen, course and Live session works the same way, whatever the subject; only the content changes.

Work gets the same treatment. Every profession that applies knowledge does it in the same order, even though each calls the steps something different:

| One shape (fixed, in code) | Architect | Lawyer | Doctor |
|---|---|---|---|
| **Situation**: the facts you're given | Brief and site | Instructions and documents | Presentation |
| **Question**: what has to be resolved | Design question | Issue | Clinical question |
| **Knowledge**: what you know that applies | Rules of thumb | The rule | Guideline and evidence |
| **Test**: the knowledge tried against these facts | Checks | Elements | Score or criteria |
| **Evidence**: what supports or weighs against | References | Documents and authorities | Findings |
| **Options**: the ways it could go | Options | Arguments | Differential |
| **Challenge**: the strongest case against | Crit | Opposing counsel | Second opinion |
| **Decision**: what you choose, and why | Decision | Advice | Plan |
| **Outcome**: what happened | Post-occupancy | Result | Follow-up |
| **Lesson**: what it taught you | Lesson | Lesson | Reflection |

This is not a coincidence. Law teaches it as IRAC (issue, rule, application, conclusion), medicine as the differential and SOAP, design as brief, options and crit, research as question, hypothesis, method and finding. Underneath, they're the same ten steps.

**So Studiolo ships one way of working and lets each field name it.** The steps, the screens, the board, the memory rules and the AI are the same for everyone. A **work kind** (a template, like an Objects collection's fields) supplies the words, the facts, the stages and two small choices: how a test is scored and how sensitive the work is.

## 1. What's fixed and what adapts

### Fixed for everyone (code)

1. **A piece of work** has a brief, up to 8 facts, stages, a status and a board.
2. **Questions** are the unit of reasoning. Each one runs through the same slots: knowledge, test, evidence, options, challenge, decision, then later outcome and lesson.
3. **Evidence is a Commonplace item plus three things:** a **stance** (for, against, context), a **locator** (page and clause, a timestamp, a row in a results table, a box on a photo) and a one-line **reason**. The item is never copied.
4. **The test** is the same component in every field. Each line is a rule from your knowledge, the fact it's tested on, and a verdict: **Met · Not met · Unclear**. A field chooses whether lines also carry points (a clinical score) or a count (legal elements) or neither (design checks).
5. **The challenge** is Loci arguing the other side, from your own evidence and memory. It never writes the decision.
6. **A decision** records what was chosen, **because** (lines that cite evidence and test results), **confidence** (low, medium, high) and **what would change it**.
7. **Outcome and lesson** close the loop. The lesson is filed on a topic on your map, as a note and as memory with the basis *did*.
8. **The board** (from the Boards design) is the free canvas behind every piece of work, with the slots as frames.

### Adapts per field (data: a work kind)

| Part of the work kind | Example values |
|---|---|
| **Words** | the work (Project, Matter, Case, Story), the question (Issue, Clinical question), options (Arguments, Differential), challenge (Opposing counsel, Second opinion), decision (Advice, Plan), outcome (Result, Follow-up), lesson (Reflection) |
| **Order of the slots** | A lawyer sees Issue → Rule → Application → Arguments → Conclusion. A doctor sees Question → Findings → Guideline → Differential → Plan. The slots are the same; only their order and names change |
| **Facts** | up to 8 fields, the same field types as collections (Text, Number, Date, Item, Web link). A matter has Client, Contract, Governing law; a case has Age band, Setting, Presenting complaint |
| **Stages** | Brief · Concept · Developed · Technical · Site · Done; Instructions · Investigation · Claim · Negotiation · Hearing · Closed; Presentation · Assessment · Investigation · Management · Follow-up · Reflected |
| **Test style** | checks (no score) · elements (count met) · score (points with thresholds) |
| **Evidence stances** | for / against / context, renamed: Supports · Undermines · Background; For · Against · Neutral |
| **Sensitivity** | Normal · Confidential · Clinical (§3) |

**Where work kinds come from.** At onboarding the learner already says what they do (`src/features/onboarding/learner.ts`). Studiolo seeds one or two work kinds from that answer (a lawyer gets *Matter*, a doctor gets *Case* and *Audit*). Anyone can edit a kind, and **Add your field** lets Loci draft one from a sentence ("I'm a journalist" gives *Story*, *What we need to stand up*, *Angles*, *Publish or hold*). Kinds are data, like the seed areas on the map: editable, never hard-coded rules.

## 2. Applying knowledge: one move, three faces

In Learn, a topic is **explained**. In Work, a topic is **applied**: its rules are tested against the facts of this one situation. That's the same move in every field:

| | The rules come from | Tested against | The test reads as |
|---|---|---|---|
| **Lawyer** | Extensions of time (FIDIC 2017, Sub-Clauses 1.9, 8.5, 20.2) | the letters, drawing register, programme | **Elements**: cause listed ✓ · notice within 28 days ✓ (24 days) · delay to completion ? · detailed claim within 84 days ? |
| **Doctor** | Pulmonary embolism (two-level Wells score, NICE NG158) | history, examination, observations | **Score**: calf signs 3 · heart rate over 100 1.5 · *a 12-hour flight scores nothing* · total 4.5, so PE is likely: scan rather than D-dimer |
| **Architect** | Light & threshold (your captions and saves) | the section and plan | **Checks**: no openings in the qibla wall below 3 m ✓ · light from above ✓ · mihrab brightest ? |

The rules are the learner's own: the topic's items, quotes, notes and Lumens, and their memory there. Loci drafts the test lines from them, cites each one, and the learner sets the verdicts. A verdict marked **Unclear** is where the next piece of evidence, or the next thing to learn, is needed. That's how Work finds the gaps in your map.

## 3. Sensitivity: lessons travel, facts stay

Lawyers and doctors can't put client or patient details into a learning app's memory. So sensitivity is part of the work kind, not an afterthought:

| Level | For | What changes |
|---|---|---|
| **Normal** | design, research, most work | As in the first design |
| **Confidential** | legal matters, consulting, HR | The work is **off the record** for memory by default. Loci reads the facts while you work, but remembers only the **lessons** you file, never names, parties or numbers. Sharing is off |
| **Clinical** | medical and other health cases | Everything in Confidential, plus: facts take bands, not identifiers (age band, not date of birth); capture warns when text looks like a name, a date of birth or a record number; a standing line says it's for learning and reflection, not a clinical record or clinical advice; Loci's challenge never states a diagnosis or a dose as fact |

This rides on the memory design's existing **off the record** switch and its *Lessons* path: a debrief writes a lesson to a topic with basis *did*. The facts stay in the piece of work, which the learner can delete in one step.

## 4. The fields that informed the shape

| Field | Its own frame | What Studiolo borrows |
|---|---|---|
| Law | IRAC; elements of a claim; authorities | the test as elements; evidence with a locator (clause, paragraph); the challenge as opposing counsel |
| Medicine | differential diagnosis; SOAP; scores and decision rules; reflective practice for revalidation | the test as a score; options as a differential; the outcome and reflection as the lesson |
| Design | brief, options, crit | options with pictures; the crit; the board |
| Research | question, hypothesis, method, evidence | stances (supports, weighs against); "what would change it" |
| Engineering and software | decision records (context, decision, consequences) | the decision's *because* and *what would change it* |

## 5. Records (sketch)

The first design's records stay, with three changes:

- *new* `work_kinds` (account-owned): `name`, `words jsonb`, `slot_order jsonb`, `facts jsonb` (≤ 8 field definitions), `stages jsonb`, `test_style` (checks, elements, score), `stances jsonb`, `sensitivity` (normal, confidential, clinical). Seeded from onboarding; editable.
- `projects` becomes `works`, with a `kind_id`. Its facts are values for the kind's fields.
- `project_refs` becomes `work_evidence`, gaining `stance` and `locator jsonb` (`{page, clause}`, `{t}`, `{row}`, `{x, y, w, h}`).
- *new* `work_tests`: one row per question and topic, holding its lines (`rule`, `source_item_id`, `fact`, `verdict`, `points`).
- Decisions gain `confidence` and `would_change`.

## 6. Decisions for the owner

| ID | Question | Recommendation |
|---|---|---|
| **WA-D1** | One fixed shape with field words, or free-form templates? | **One fixed shape.** Ten slots, renamed and reordered per field. Free-form templates would make every AI feature field-specific |
| **WA-D2** | Who writes work kinds? | **Seeded from onboarding, editable by the learner, drafted by Loci on request.** Never per-profession code |
| **WA-D3** | Clinical and confidential work in a learning app at all? | **Yes, with the sensitivity rules in §3.** Doctors and lawyers learn most from their cases; refusing them loses the two fields the owner named. Revisit with legal advice before launch |
| **WA-D4** | Does the challenge get a field-specific voice (opposing counsel, second opinion)? | **Yes, by name and stance only.** The same tool, with the field's word and the instruction to argue against the current leaning |
| **WA-D5** | Name on screen | **Work** in the rail, with the field's own word inside (Projects, Matters, Cases) |

## 7. What this is not

- **Not a practice-management system.** No billing, no time recording, no patient records, no document management. It's where you think a case through and learn from it.
- **Not advice.** Loci tests your reasoning against your own knowledge; the professional decides.
- **Not a template marketplace.** A work kind is a short list of words and fields, editable in a minute.
