# Loci Palace: design doc and plan

- **Status:** proposed, 23 Oct 2026.
- **Goes with:** the Loci prototype (claude.ai artifact `8LqFSz8qKDj9TP3B5fG5y2`, v13; source [`prototypes/graph-3d/index.html`](../prototypes/graph-3d/index.html)) and the spec [`2026-10-23-loci-palace-spec.md`](2026-10-23-loci-palace-spec.md).
- **Based on:** `ahmedste/studiolo` main at `bbc22c6f`, read-only.
- **Replaces:** the placement, rendering and naming parts of [`2026-10-18-graph-3d-knowledge-view.md`](2026-10-18-graph-3d-knowledge-view.md) (a three.js "3D" tab) and [`2026-10-18-loci-mind-palace.md`](2026-10-18-loci-mind-palace.md) ("Loci" as the tab name).
- **Settled in the app since `d6e510e`:** naming N1 and N2 are merged, so the app now says Loci, Commonplace, Lumens and "✦ Ask Loci". The app has no 3D code yet, and the naming spec's A2 says "Palace joins as a view when it is built".

## 1. The idea in three lines

- **Loci** is your mind palace. **Palace** is the view that shows all of it at once, in 3D: every area, topic, Commonplace item, note, Lumen and course, each in a place you can come back to.
- **One gesture: open.** Tap, click or Enter goes one level in. Esc or Back goes one level out.
- **Nothing appears before you ask for it.**

## 2. What the prototype shows

Try these on the artifact:

| Try | What to notice |
|---|---|
| Open the Palace and wait | **Settle:** areas grow in first, then topics, then sub-topics. Only area names show. |
| Hover an area | Its topics drift toward it and the rest greys. The camera does not move. |
| Click an area | **Fly:** the camera frames the room, which holds its topics, its two stacks ("10 in Commonplace", "8 in Learn") and its related topics. |
| Open a stack | A card with the latest four, and "See all". The four bloom out, with arrows to the topics they serve. |
| Open *Great Mosque of Kairouan* | **Object:** its notes and quotes orbit it, and arrows run to all four topics it is tagged on, across two areas. |
| Esc, Esc | Back through each level |
| Map tab | The app's own Map, unchanged, in the same colours. The same thing stays open. |
| ✦ Ask Loci → "Suggest sub-topics" | Dashed suggestions appear in the Palace and on the Map. Keep or Dismiss them in the card. |
| Phone | The details sheet rises, and the Palace frames what is open above it. |

## 3. Design principles

1. **A place, not a chart.** The same account draws the same palace on every visit. Areas never swap places. Motion only helps you see where you went.
2. **Belonging decides place.**
   - A topic sits by its parent.
   - An item sits between the topics it is tagged on.
   - A note or quote sits on its item.
   - A Lumen sits by what it was made from.
3. **A label budget.**
   - Sky shows area names only.
   - A room shows about 15 names.
   - An object shows itself and its neighbours.
   - Names never jump to dodge each other. When crowded, they fade.
4. **One serif per screen:** the open object's name.
5. **Still until you move it:**
   - no idle turn;
   - no breathing ring;
   - sound off until you turn it on.
6. **One Loci:**
   - Palace, Map, List and Overview share the selection, the panel and Ask Loci.
   - The Palace draws; the panel edits.

## 4. How the four views fit together

| View | Answers | Shared |
|---|---|---|
| **Palace** | "What do I know, all of it, and how does it connect?" | Selection (`?topic=`), the panel (Details, Lumens, Ask Loci), find (`/`), the crumb row, colours |
| **Map** | "What is under this topic, and what do I do next?" (the place to edit) | The same |
| **List** | "Where is everything?" (the full keyboard path) | The same |
| **Overview** | "How far along am I?" | The same |

The colours match across all four:
- areas are solid deep blue (`--status-3`) with a coverage ring;
- topics use the three status fills;
- My Focus is a dashed accent ring;
- suggestions are hollow and dashed.

## 5. Design plan (before any code)

1. **Pin the reference:** copy the prototype to `docs/superpowers/specs/2026-10-23-loci-palace-mockups/palace-reference.html`.
2. **Mock-ups** in that folder, at 1440 × 900 and 390 × 844, light and dark:
   - Sky;
   - Room;
   - Object;
   - an open stack;
   - the phone sheet;
   - the reduced-motion state;
   - an empty palace (a new learner with three areas);
   - a loading state;
   - an error state ("Couldn't load your Palace", with Try again).

   The empty, loading and error states are new; the prototype has none of them.
3. **Owner review:**
   - answers to D-1 to D-9 in the spec;
   - the departures table (spec §15);
   - the "Awaiting the owner" and "Agreed" tables in the mock-ups folder's README.
4. **Builder check:** a fresh reviewer plans P1 from the spec alone and checks every file and line reference. Their questions become C-n calls.

## 6. Implementation plan

The spec has the detail (§8–§9). Each slice is its own branch and its own merge on the owner's word.

| Slice | Tier | Work | Rough size |
|---|---|---|---|
| **P0. Spec and mock-ups** | — | Copy the spec into studiolo `docs/superpowers/specs/`, add the mock-ups folder, get owner answers | ½ day |
| **P1. Palace of topics** | MEDIUM | See the list below | 2–3 days |
| **P2. Commonplace and Lumens** | MEDIUM | See the list below | 2–3 days |
| **P3. Feel** | LOW | Sound (off by default), peek on hover or long press, Ask Loci `show_on_map` fly and still glow, suggestions; the trail if D-5 says yes | 1 day |
| **P4. Default view** | LOW | Palace becomes Loci's default, if the owner chooses that after testing | ½ day |

**P1. Palace of topics**
1. Add the `PALACE_ACCESS` switch (`all` or `testers`).
2. Add the `palace` tab, keeping `graph-workspace.tsx` at net zero lines.
3. Add the pure modules (scene, seeded layout, camera) with unit tests.
4. Add the canvas view, lazy loaded.
5. Build Sky and Room, fly, labels, the keyboard and live region, and reduced motion.
6. Reuse the Map panel and sheet.
7. Add the specimen, e2e, axe and speed evidence.

**P2. Commonplace and Lumens**
1. Add `readPalace` and `GET /api/palace`, with the memory gateway.
2. Draw items between their topics, notes and quotes in orbit, and Lumens and courses.
3. Add the stacks and their cards, and the Object level.
4. Re-read after any map change.
5. Add integration tests for account isolation and anchors.

**Order of risk**
1. **The first layout on an iPhone at the limits.** Measure in P1; move to a Web Worker if it blocks for more than 50 ms.
2. **Label legibility on phones.** Compare against the reference in P1.
3. **The response size for very large Commonplaces.** C-4 covers it with stacks only above 3,000 items.

**What stays the same:**
- the Map, its CSS and its layout;
- copilot tools and prompts;
- the database.

There are no migrations and no new dependency.

**Rollback:** unset `PALACE_ACCESS`, or `git revert -m 1`.

## 7. Open questions for you

These are the spec's decisions, short form:

1. **D-1:** add the Palace as a Loci view?
2. **D-2:** tab order and default. Recommended: Palace · Map · List · Overview, with Map staying the default until you've tried it.
3. **D-3:** drop the slow turn and the breathing ring?
4. **D-4:** sound off by default?
5. **D-5:** the trail later?
6. **D-6:** canvas 2D rather than three.js?
7. **D-7:** testers first?
8. **D-8:** on phones too?
9. **D-9:** stacks only above 3,000 items?
