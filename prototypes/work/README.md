# Work prototype

An interactive prototype of [`docs/superpowers/specs/2026-10-24-work-design.md`](../../docs/superpowers/specs/2026-10-24-work-design.md): a fifth destination, **Work**, where a learner uses what they've learned and saved on something they're making, and the work feeds Learn, Commonplace and Loci back.

The sample learner is the same architect as the memory and photos prototypes, working on a prayer hall for about 600 people in Al Barsha, Dubai. The Commonplace items are the photos prototype's own (same titles, captions and pictures). Every entry is an example, and Loci's words are scripted.

**Checked against:** `studiolo` main @ `64a5cee`, read only. Tokens, type and shell are Studiolo's (`src/styles/tokens.css`), as in the photos prototype. It is a design reference, not code for the app.

## What to try

**How to try it** (top right) has links straight to each step.

| Spec section | In the prototype |
|---|---|
| §0 The loop | **Work home**: hover or tab through each arrow of the loop. Orange arrows are new |
| §2 The model | **Prayer hall**: brief, eight facts, stages, what it uses, what to work on next |
| §5 A question | **The qibla wall**: What you already know (from memory), Evidence (with reasons; dashed suggestions), Options A–C with **Crit this**, Gaps with **Make a Lumen for this question**, then **Decide** |
| §3 Learn inside work | **The court in August**: the memory line to revisit appears where it matters; **Check me** |
| §4 Apply | **Uses → Apply** on any topic, for example Climate-responsive design: rules of thumb from your saves, checks for the project, what you know, references |
| §3 Use in a project | **Board → Add from Commonplace**, suggestions first, each with a reason. Also from any item in **Commonplace** |
| §6 Start from a sentence | **Start a project**: Loci's draft as a change card; **Keep** creates it |
| §3 Debrief | **Riyadh library competition → Debrief**: three lessons filed on Loci, then **Keep as an Object** |
| §7 Everywhere else | **Today**, **Learn**, **Commonplace** and **Loci** in the rail show only what Work adds |

## Not in it

- Real persistence. **Start again** resets everything.
- Real AI. Drafts, crits and the Lumen are written in advance; any sentence you type gets the same Sharjah draft.
- The Palace. Loci shows only the Map with a project's topics lit.
- Phone layouts beyond the basics: the screens stack and the rail moves to the bottom.

## Build

```sh
node build.mjs   # index.html from index.src.html, inlining 23 thumbs from ../commonplace-photos/img
```
