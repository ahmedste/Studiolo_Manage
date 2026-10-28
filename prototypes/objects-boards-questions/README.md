# Objects, boards, and questions and goals

An interactive prototype of [`docs/superpowers/specs/2026-10-28-objects-questions-boards-programme.md`](../../docs/superpowers/specs/2026-10-28-objects-questions-boards-programme.md): the end state of the programme, where Objects, questions and goals, and a board share one Commonplace. It's drawn with `studiolo`'s own CSS (copied from [`../objects-phases`](../objects-phases) by `build.mjs`).

Three sample learners, each opening on a board: an **architect** (*Cooling the prayer-hall courtyard*), a **lawyer** (*Duty of care after Caparo*) and a **doctor** (*Suspected PE: what to do first*). **Show phases** labels each part with the phase that builds it.

## Try this

| Where | What it shows |
|---|---|
| **The board** | Object cards carry their fields and "? · ◎" counts. The goal card is a goal inline; question cards are question inlines. The **Inside** panel lists the goal, the board's questions and the questions inside its cards |
| **Field links** | Dashed lines are relation fields already set between two placed Objects (*Architect*, *Cites*, *Recommends*). They aren't arrows and can't be edited on the board |
| **Keep as a field** (architect) | Click the arrow *Hassan Fathy explains New Gourna Village*. It offers **Set New Gourna Village's Architect to Hassan Fathy**. Take it: a field link appears, and the Object's page shows the field |
| **Mark answered** (lawyer, doctor) | Click the arrow *Robinson explains "Is Caparo still a test?"* (or *NG158 explains "When is a D-dimer enough?"*). It offers **Mark answered in Robinson**. Take it, then double-click Robinson: its page lists the question under **Answers** |
| **Connect** | Hover a card and drag its blue dot onto another card. Pick a word and write why |
| **Ask a question** | **?** (or Q), then click the canvas. It belongs to the board and shows in Questions and goals |
| **Write a note** | **✎** (or N), then click the canvas. Start a paragraph with `@question` or `@goal`: the note is saved to Commonplace with them inside |
| **Place** | **+ Place**: Objects by collection, notes, Sources, and **Questions** written elsewhere. A placed question still belongs to its note |
| **Status** | Click any **Open ▾** or **Active ▾**: mark answered, park, answer in a line, or **Answered in** an Object or a board. It changes everywhere it shows |
| **An Object's page** | Double-click an Object card. **What I took from it** shows its questions as marked lines; **Edit** and type `@` for the menu; **Inside** and **On boards** in the rail; **Answers** at the end |
| **A Source** | Open the lecture or the judgment: a question in a margin note at 12:40 or p. 21. **? Question** adds one at the current moment (phase Q3) |
| **Questions and goals** | The list: goals with their questions under them, then other questions, each naming where it was written and which boards it's placed on |
| **Everything** | The wall: cards count what's open inside them; **Boards** is a type |

All content is example data; the legal and clinical content is for illustration only and isn't legal or clinical advice. Nothing calls a model; Loci's actions (Explain this, Find resources, Plan a course) say which phase builds them. Changes last until you reload.

## Build

```sh
node build.mjs   # index.html from index.src.html, with studiolo's CSS from ../objects-phases/index.html
```
