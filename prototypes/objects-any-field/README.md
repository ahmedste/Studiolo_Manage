# Objects in any field

An interactive prototype of [`docs/superpowers/specs/2026-10-25-objects-any-field-design.md`](../../docs/superpowers/specs/2026-10-25-objects-any-field-design.md): object types you shape, pages you arrange, views of each type.

**One engine, three fields.** Every list, page and view is drawn by the same code from an object type's data (its base, fields, page layout, views and sensitivity):

| Field | Types | Shows off |
|---|---|---|
| Architect | Precedents, Architects, Materials | Slideshow page; Precedent → Architect gives every Architect a **Works** block; board by My status; timeline of when they lived |
| Lawyer | Cases, Courts, Judges, Clauses & sections | Law-report heading; **Cites ↔ Cited by**; cases as a table; timeline from 1854 to 2021 |
| Doctor | Drugs, Guidelines, Procedures, Teaching cases | Procedures logbook as a timeline; symmetric **Alternatives**; Teaching cases set to **Clinical** |

All content is example data. The legal and clinical content is for illustration only: it is not legal or clinical advice. Pictures are drawn stand-ins for photos.

## Try it

1. Switch **Architect · Lawyer · Doctor**. Pick a type on the left, then switch its **views** (Gallery, Table, Board, Timeline). **+ View** saves a new one.
2. On a **board**, drag a card to another column. In a **table**, click a choice cell to change it.
3. Open any object. Click a value to edit it; **+ Link** adds a relation, and the other object's page shows it on its other side.
4. **Arrange page**: choose the top (Slideshow, Picture, Portrait, Document, None), one or two columns, and move or hide blocks. It changes the page for every object of that type.
5. **Edit type**: rename it, change its base or sensitivity, and add fields from the catalogue (try a Relation or a Choice). The page and table update as you go.
6. On a **Teaching case**, type "Mrs Smith" or a date of birth into a field: it's refused.
7. **+ New type**: pick a suggestion or write your own sentence ("I keep track of…") and Loci drafts a type to keep.

## Build

None. `index.html` is the whole prototype; open it in a browser.
