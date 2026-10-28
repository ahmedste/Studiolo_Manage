# Prompt for the agent that builds it

Before pasting: open each link below and choose **Share → Anyone with the link**. Until then the links open only for you. The designs live on the `claude/gifted-cerf-w0cwoi` branch of `ahmedste/studiolo_manage` until that branch is merged.

---

You're building the next part of **Studiolo**, a learning app (`ahmedste/studiolo`; Next.js 16, React 19, Drizzle, Postgres). Its library is **Commonplace**, its map is **Loci**, and its short explainers are **Lumens**. The designs below were made against `studiolo` main @ `7c0e8732`. They are proposals the owner has reviewed. Each phase still needs its own spec and the owner's go-ahead, as `AGENTS.md` describes.

**Look first, then read:**

1. **The prototype (the end state, drawn in the real Commonplace CSS):** https://claude.ai/artifact/U95rk7ZKi3c2wsFvqsiS1b
   The bar at the bottom switches Architect, Lawyer and Doctor, and jumps between **Everything**, **Long note**, **Board**, **Questions**, **Customize** and **Templates**. **Show phases** labels every part with the phase that builds it.
2. **The plan (the order, then every design in full):** https://claude.ai/artifact/Hc7B9N1X7kmCELnew6qbNi
3. **Linking, collections and templates (diagrams, problem cases, backlinks, the collection studio, Templates):** https://claude.ai/artifact/JGxxJ7GzsU8kZkb3aL7QN4

**The source documents** (in `ahmedste/studiolo_manage`, branch `claude/gifted-cerf-w0cwoi`, under `docs/superpowers/specs/`):

| File | What it decides |
|---|---|
| `2026-10-28-objects-questions-boards-programme.md` | **Start here.** Stages 0 to 4, the lanes, and the rules where the features meet |
| `2026-10-25-questions-and-goals-roadmap-design.md` and `2026-10-25-questions-and-goals-inside-items-design.md` | Lane Q: `@question` and `@goal` inside any writing; `item_inlines`; the Questions and goals page as cards (§10) |
| `2026-10-25-objects-build-phases.md` | Lanes F, P, V, T: Object fields, pages, views (Table, Columns, Timeline), starter types |
| `2026-10-28-long-notes-and-connections-design.md` | Lane N: the long-note page and editor (CodeMirror 6 live preview); the three connection kinds |
| `2026-10-28-collections-and-linking-design.md` | Lane C: the collection studio, New collection, **Appears in** backlinks, Templates as a gallery to start from, *How Commonplace works*, the linking model |
| `2026-10-24-boards-design.md` | Lane B: Boards, built last; §7 the board as a learning space (a guided path, Lumens per question, Learn mode) |

The prototype's source is `prototypes/objects-boards-questions/index.src.html` in the same repository. Read it for exact wording, behaviour and edge cases. Don't port its code: it's a single-file sketch, and the designs name the real files and modules to change.

**The order:**

- **Stage 0:** Q1 (write questions and goals, no migration), F0 (field-type descriptor), P0 (one Object page from blocks).
- **Stage 1:** Q2, Q3, F1, P1, V1, T1, N1 (the long-note page), C1–C3 (collections).
- **Stage 2:** Q4, Q-O, F2, P2, V2, T2, N2 (mentions, cards, images), C4 (Appears in), C5 (Templates; its Boards group arrives with B1).
- **Stage 3:** Q5, F3, T3, N3, N4.
- **Stage 4:** Boards B1, B2, then the board as a learning space (LB1 the path, LB2 Answer with a Lumen, LB3 Learn mode; Boards design §7), B4, with Q-B.

The decisions with their recommendations are OQB-D1–D8, IN-D1–D13, LN-D1–D9, CL-D1–D13 and LB-D1–D7. Treat a recommendation as agreed unless the owner has said otherwise.

**Your first task: phase Q1.**

1. Read `AGENTS.md`, `project-docs/` and the documents above.
2. Write Q1's phase spec in `studiolo`'s `docs/superpowers/specs/`, with its tier on line one. Check every path against the current `main`; the designs were checked at `7c0e8732`.
3. Show the owner the spec and wait for their go-ahead.
4. Then build Q1 on its own branch:
   - the `@` menu in every note composer;
   - `@question` and `@goal` parsed as paragraph markers by `parseMarkdown`;
   - the marked lines;
   - "? 2 · ◎ 1" on a card's foot;
   - `has:question` and `has:goal`.
   
   Q1 needs no migration.
5. Update the owning `project-docs/implementation/` guides on the same branch.
6. Run Verify's steps locally: lint, typecheck, unit tests, `check:docs`, `scripts/check-prototype.cjs`, build.
7. Hand over with honest results and any limits.

**Rules that always hold** (from `studiolo`'s `AGENTS.md`):

- Keep the app's own design: layout, type, colours, spacing, card anatomy. The prototype shows how new parts fit into the current screens. Where you must depart from it, explain why and ask first.
- **Never merge into `main` or push any branch** until the owner has tested the work and said so in the current conversation. Pushing `main` deploys the live app.
- **No database migration** is applied without the owner's explicit word, and code that needs one never reaches `main` before it is applied.
- One phase, one branch. Code and its `project-docs/implementation/` guides change together.
- If Agents B to E start in parallel (programme §1), each takes one lane and names its migration `00xx_<lane>_<what>.sql`. The number is taken at merge.

When Q1 is handed over, say which phase you'd take next and why, from the programme's order.
