# Prompt for an AI tester

Before pasting: open each link below, choose **Share → Anyone with the link**, and keep the same address. Until then the links open only for you.

---

You're reviewing design prototypes for **Studiolo**, a learning app. Its library is called **Commonplace**, its map is **Loci**, and its short explainers are **Lumens**. All content in the prototypes is example data, and nothing calls a real model.

Read the plan first, then test the prototypes against it.

1. **The plan (read first):** https://claude.ai/artifact/Hc7B9N1X7kmCELnew6qbNi
   The build order for three features. It starts with the programme (the order, and where the features meet), then has each design in full: Objects, Questions and goals (roadmap, then design), and Boards last.
2. **Main prototype, Objects + boards + questions and goals:** https://claude.ai/artifact/U95rk7ZKi3c2wsFvqsiS1b
   The end state, drawn in the current real Commonplace screens. Switch Architect, Lawyer and Doctor in the bar at the bottom; **Board**, **Questions** and **Customize** jump between screens.
3. **Objects, phase by phase:** https://claude.ai/artifact/3sJpPHVcPMUJiDgA7MpCTH
   The real Commonplace with a switch from Today through Phase 3.
4. **Boards, the original concept:** https://claude.ai/artifact/CVVpm4kM6pshfmURATKXvi
5. **Objects in any field, the first exploration:** https://claude.ai/artifact/XLHqoBxTXgaCoarmpUmo59

**Test these flows in the main prototype (2), and say for each whether it works and whether it's clear:**
- On the architect's board, click the arrow *Hassan Fathy explains New Gourna Village* and accept **Set New Gourna Village's Architect to Hassan Fathy**. Does the dashed field link appear, and does New Gourna's page show the field?
- On the lawyer's board, click the arrow *Robinson explains "Is Caparo still a test?"* and accept **Mark answered in Robinson**. Then double-click Robinson. Is the question listed under **Answers**? Is it marked answered on **Questions and goals**?
- Change any question's status from the board's **Inside** panel. Does it change on the Object's page and on the list?
- Use **?** to ask a question on the canvas, and **✎** to write a note that contains `@question …`. Do both appear on **Questions and goals**, named by where they were written?
- Open an Object's page, choose **Edit**, and type `@` at the start of a paragraph. Does the menu insert a question or goal correctly?
- Use **+ Place → Questions** to place a question written in a note. Is it clear that it still belongs to the note?
- On **Everything**, choose **Objects** then a collection, and try **Table**, **Columns** and **Timeline**. Do they read as the same Commonplace?
- Turn on **Show phases**. Does each part's phase label match the plan?

**In the phases prototype (3):** step from Today to Phase 3 with **Mark what's new** on. Does each phase add what the plan says it adds?

**Then review the plan:**
- Is the order sound? Questions and goals come first and Boards last. Are the dependencies right?
- Can the lanes really run in parallel?
- Are any of the decisions (OQB-D1 to D8) wrong?

**Report in four parts:**
1. Bugs, with steps to reproduce.
2. Confusing moments, with what you expected instead.
3. Where a prototype contradicts the plan.
4. Your top five recommendations, most important first.

Be specific and brief. Quote the on-screen words you mean.
