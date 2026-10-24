# Work in any field

An interactive prototype of [`docs/superpowers/specs/2026-10-24-work-any-field-design.md`](../../docs/superpowers/specs/2026-10-24-work-any-field-design.md): one way of working, the same for everyone, with each field's own words.

**One engine, three fields.** Every screen is drawn by the same code from a field's *work kind* (its words, slot order, facts, stages, test style, evidence stances and sensitivity) plus one sample piece of work:

| Field | The work | The question | The test |
|---|---|---|---|
| Architect | Project: prayer hall, Al Barsha | How do we light the qibla wall without glare? | Checks |
| Lawyer | Matter: fit-out delay claim | Is the contractor entitled to an extension of time? (FIDIC 2017) | Elements |
| Doctor | Case (de-identified teaching case) | Could this be a pulmonary embolism, and which test first? | Score (two-level Wells) |

All content is example data. Loci's words are scripted. The legal and clinical content is for illustration only: it is not legal or clinical advice.

## Try it

1. Switch **Architect · Lawyer · Doctor** at the top. The chain under it shows the ten fixed steps and that field's words for them.
2. Turn on **Show what adapts**: every highlighted word or dashed box comes from the work kind. Everything else is identical code.
3. On the question, tap a **verdict** in the test. For the doctor, the Wells total and what it points to update; the plan follows the score.
4. Open any piece of **evidence**: a box on a photo, a highlighted clause, a row in a results table, a bar in a programme. One viewer, one idea (a locator on a Commonplace item).
5. Ask for the **challenge** (crit, opposing counsel, second opinion), then **write the decision**.
6. **Outcome and lesson**: file the lesson and see what Loci keeps. For the lawyer and doctor, facts are never remembered: lessons travel, facts stay.
7. **Board** lays the same items out as frames; **How … are set up** shows the work kind as a table.
8. **+ Your field**: try Journalist, Teacher or Software engineer to see Loci draft a work kind.

## Build

```sh
node build.mjs   # index.html from index.src.html, inlining 8 thumbs from ../commonplace-photos/img
```
