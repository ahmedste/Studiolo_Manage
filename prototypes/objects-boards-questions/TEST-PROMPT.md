# Prompt for an AI tester

Before pasting: open each link below, choose **Share → Anyone with the link**, and keep the same address. Until then the links open only for you.

---

You're reviewing design prototypes for **Studiolo**, a learning app. Its library is called **Commonplace**, its map is **Loci**, and its short explainers are **Lumens**. All content in the prototypes is example data, and nothing calls a real model.

Read the plan first, then test the prototypes against it.

1. **The plan (read first):** https://claude.ai/artifact/Hc7B9N1X7kmCELnew6qbNi
   The build order. It starts with the programme (the order, and where the features meet), then has each design in full: Objects, Questions and goals (roadmap, then design), Long notes and connections, and Boards last.
2. **Main prototype, Objects + boards + questions and goals:** https://claude.ai/artifact/U95rk7ZKi3c2wsFvqsiS1b
   The end state, drawn in the current real Commonplace screens. Switch Architect, Lawyer and Doctor in the bar at the bottom; **Board**, **Questions** and **Customize** jump between screens.
3. **Objects, phase by phase:** https://claude.ai/artifact/3sJpPHVcPMUJiDgA7MpCTH
   The real Commonplace with a switch from Today through Phase 3.
4. **Linking, collections and templates (read with the plan):** https://claude.ai/artifact/JGxxJ7GzsU8kZkb3aL7QN4
   How things link, drawn as diagrams, the problems thought through, backlinks, the collection studio, and Templates.
5. **Boards, the original concept:** https://claude.ai/artifact/CVVpm4kM6pshfmURATKXvi
6. **Objects in any field, the first exploration:** https://claude.ai/artifact/XLHqoBxTXgaCoarmpUmo59

**Test these flows in the main prototype (2), and say for each whether it works and whether it's clear:**
- On the architect's board, click the arrow *Hassan Fathy explains New Gourna Village* and accept **Set New Gourna Village's Architect to Hassan Fathy**. Does the dashed field link appear, and does New Gourna's page show the field?
- On the lawyer's board, click the arrow *Robinson explains "Is Caparo still a test?"* and accept **Mark answered in Robinson**. Then double-click Robinson. Is the question listed under **Answers**? Is it marked answered on **Questions and goals**?
- Change any question's status from the board's **Inside** panel. Does it change on the Object's page and on the list?
- Use **?** to ask a question on the canvas, and **✎** to write a note that contains `@question …`. Do both appear on **Questions and goals**, named by where they were written?
- Open **Long note** (bar at the bottom). Type `/` in an empty line and add a heading, an image and an entry card. Type `@` and part of a name mid-sentence: does it link the entry? Select some words: do **Link to entry**, **Ask about this** and **Margin note** do what they say? Drag a block by **⋮⋮**.
- Click the **Hassan Fathy** mention and open him. Under **Appears in › Mentioned in**, is the sentence shown, and does the row open the note?
- On any building, choose **Write about it**. Does the new note start with the building's card and the collection's headings, and is it listed under **Notes about it** when you go back?
- **Collections** tab: make a new collection with **+ New collection**. Are the three steps clear? Then in the studio, try each tab: change the card layout, take a field off the card, hide a section, add a suggested field, delete a field that has values. Did anything feel overwhelming, or did you lose track of what you changed? Does **Undo** do what you expect?
- On any Object page, click a property's name (e.g. *Architect*). Does it take you to the right place in the studio?
- Open **Hassan Fathy**, the **Arcade and bay rhythm** photo and the **Climate and Architecture** PDF. Does **↩ Appears in** at the top tell you where each is used? Does each row open the exact spot, highlighted?
- Open **Questions** (bar at the bottom). Do the goal cards, rings and **Next** lines make it clear what to do? Mark a question answered, then switch to **Answered**: does *What you've found out* read well? Does clicking a question open the exact place it was written?
- **Templates** tab: are the three generic templates (People, Precedents, Cases) clear enough to fit any field? Use one, then one pre-made for another field. Use one long-note and one board template. Does each make what its picture shows? Open **? How Commonplace works**: after reading it, could a new user explain collections, topics and the three ways things link?
- On a board, link two cards by dragging a blue dot. Is a plain link (with an optional label) enough? Does the link show on both entries' pages?
- On a board, drag a card's blue dot and let go on empty space: is the add-and-link menu what you'd expect? Try Tab on a selected card, ⇧ drag to select several, Tidy, ⌘Z, the minimap, and ? for shortcuts. Does anything feel fiddly?
- On a board, try **⤢ Focus** (F) and Esc; on a long note, **⤢ Focus** while writing. Does focus feel calm, and is the way back obvious?
- Open a board: does it feel like one infinite canvas (like Miro), with everything else floating on it? Hide and show the shelf and the Learning panel.
- On a board, double-click empty space and type part of a name: does Enter place it there? Type a sentence and place it as a **New note**. Drag a tile from the shelf onto the board. Then press **▶ Play the Lumen** on a question: read it, switch to Watch and Listen, add a **✎ Note**, and answer **Did this answer it?**. Answer another question with a Lumen. Did learning on the board feel guided without being restrictive? Did you ever want a separate window?
- Is it always clear where to go to change a connection? Write down any moment when it wasn't.
- Use **+ Place → Questions** to place a question written in a note. Is it clear that it still belongs to the note?
- On **Everything**, choose **Objects** then a collection, and try **Table**, **Columns** and **Timeline**. Do they read as the same Commonplace?
- Turn on **Show phases**. Does each part's phase label match the plan?

**In the phases prototype (3):** step from Today to Phase 3 with **Mark what's new** on. Does each phase add what the plan says it adds?

**Then review the plan:**
- Is the order sound? Questions and goals come first and Boards last. Are the dependencies right?
- Can the lanes really run in parallel?
- Are any of the decisions (OQB-D1 to D8, LN-D1 to D10, CL-D1 to D14, LB-D1 to D14) wrong? Read the linking diagrams and the problems table (P1–P22) in the Collections and linking part: is any case missing or wrong? Is the three-kind connection model (mention, property, arrow) simple enough?

**Report in four parts:**
1. Bugs, with steps to reproduce.
2. Confusing moments, with what you expected instead.
3. Where a prototype contradicts the plan.
4. Your top five recommendations, most important first.

Be specific and brief. Quote the on-screen words you mean.
