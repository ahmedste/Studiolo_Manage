# Proposal: Loci, the learner's mind palace

Status: draft for the owner's decision · 18 Oct 2026
Builds on: [`2026-10-18-graph-3d-knowledge-view.md`](2026-10-18-graph-3d-knowledge-view.md) and the prototype in [`prototypes/graph-3d/`](../prototypes/graph-3d/index.html).
Sources: `ahmedste/studiolo` at `d6e510e`, read-only. Files are cited inline.

## 1. The idea in one paragraph

The 3D view stops being "the graph, but in 3D". It becomes a place you return to: one space holding everything you know and everything you have gathered.

- **Areas** are the bright landmarks.
- **Topics** and **sub-topics** sit around them.
- Your **Library** (sources, notes, quotes) and your **Learn** shelf (explainers, courses) live beside the topics they belong to.

You move through it by **opening** things, not by scrolling a list. Every move has one consistent motion and one quiet sound, so after a few minutes your hands know where things are. That is what a memory palace is: knowledge you can find again because it has a place.

## 2. Name: Loci

**Recommendation: Loci** (in public, *Studiolo Loci*; in the app, the tab is just **Loci**).

- *Loci* means "places". The ancient memory technique behind the "memory palace" is called the **method of loci**: you remember things by putting them in rooms of an imagined building.
- It fits the house style. A *studiolo* is a Renaissance private study, and the naming proposal already uses Latin with *Lumen* for explainers. *Studiolo · Lumen · Loci* reads as one family.
- It is short enough for a tab, and it can be used as a verb: "Open in Loci".
- **"Your mind palace"** becomes the tagline, not the name. "Mind palace" is a common phrase (and a well-known TV reference), so it describes the feature well but would not be ownable as a name.

| Option | For | Against |
|---|---|---|
| **Loci** (recommended) | Exact meaning, Latin family, short | Needs a one-line explanation the first time |
| Mind Palace | Instantly understood | Generic and widely used; not ownable |
| Orrery | A turning model of the heavens, matches the motion | Few people know the word |
| Constellation | Matches the look | Generic; says nothing about memory |
| Atlas | Familiar | Overused; suggests geography |

Rules if chosen: the tab label is "Loci". In copy, say "your Loci" sparingly and prefer "Open in Loci". The plural is never written as "Locis".

## 3. What is in the palace (the logic)

Everything shown already exists in Studiolo's data. Loci adds no new kind of record, only a way to see them together.

| In Loci | Is in Studiolo | Links it draws |
|---|---|---|
| **Area** | A level-1 topic (`drizzle/0004_topics.sql`) | Its topics |
| **Topic, sub-topic** | `topics` with `parent_id`, up to 10 levels | Parent → child; **related** links with a reason (`topic_relations`) |
| **Library item** | `content_items` with shape `source`, `document`, `work`, `person`, `conversation` or `image` (`0005_library.sql:25`, `0007_files.sql:124`) | **Tagged on** any number of topics at any level (`content_topic_tags`); item ↔ item relations such as *see also* and *compares to* (`content_relations`) |
| **Note** | A `content_item` of shape `note`; `about_id` points at the item it is about (`0005_library.sql:12,41`) | Orbits its item; may also be tagged on topics |
| **Quote** | `content_item` shape `quote` + `annotations` row with a **locator**: page, time or section (`0005_library.sql:78`) | Orbits its source, labelled with its place ("p. 112", "14:05") |
| **Explainer** | `explainers` with one anchor: a topic or an item (`0017_explainers.sql:49`) | Made from its anchor; draws on Library items |
| **Course** | `explainer_series`: ordered parts, anchored on a topic or item (`0023_explainer_series.sql`) | Made from its anchor; its parts are explainers |

Two rules keep this simple:

1. **Belonging decides place.**
   - A topic sits near its parent.
   - A Library item sits between the topics it is tagged on, so a book tagged in three areas visibly bridges them.
   - A note or quote sits on its item, never loose in space.
2. **Nothing appears before you ask for it.**
   - Each level shows only what belongs to that level (section 4). The full palace is never on screen at once, even though everything is connected.

## 4. Three levels, one gesture

The prototype already has the bones of this. The proposal makes the three levels explicit, so zooming *changes what you see* and does more than scale it up ("semantic zoom").

| Level | You see | Names shown | You do |
|---|---|---|---|
| **Sky** (overview) | Areas as solid landmarks, topics and sub-topics as quiet dots, links very faint | Area names only, near ones clear, far ones faint | Hover an area to draw its topics in; open an area |
| **Room** (an area open) | That area's topics and sub-topics; two stacks beside it: **Library** (square stack) and **Learn** (play stack), each with a count | Topic names in the room; stack counts | Open a topic, a stack, or another room through a related link |
| **Object** (an item, note, explainer or topic open) | The object, its own notes and quotes orbiting it, arrowed lines to every topic it touches in any area | The object (in the serif), its neighbours | Read it in the panel; follow a line; go back |

**One gesture everywhere: open.**
- **Tap, click or Enter** goes one level in. **Esc or Back** goes one level out.
- **Scrolling** past a threshold does the same: zooming far into a room opens it; zooming out of an object returns to its room.
- Nothing else is needed. Turning the view is optional decoration, not navigation.

**Where am I.** A small path chip at the top left of the canvas shows the route, for example `Sky › History & Theory › Islamic architecture › Great Mosque of Kairouan`. Each part is a button.

**How did I get here.** A faint **trail** links the last few things you opened. It fades over about a minute, like footprints. Back follows the trail.

## 5. Looking at it: readability rules

These rules come out of the prototype rounds so far:

1. **Hierarchy you can see from across the room.**
   - Areas are large, solid, deep-blue dots.
   - Topics are medium dots in their status colour.
   - Sub-topics are small.
   - Depth changes size only gently, so a far area still reads bigger than a near topic.
2. **Status at a glance.** Topics keep the app's three status colours. **Areas get a thin progress ring:** the share of their topics marked Learned, drawn as an arc around the solid dot. This restores area status without losing the solid landmark.
3. **A label budget.**
   - Sky: at most one label per area (18 in the sample).
   - Room: at most about 15 labels.
   - Object: the object plus its direct neighbours.
   - Everything else is reachable by hover.
4. **Labels never move to dodge.** A name sits under its mark and fades if crowded. The nearest name wins, and a showing name keeps a head start, so nothing flickers as the space turns.
5. **One serif per screen.** Only the open object's name is in Newsreader. Everything else is Instrument Sans in muted inks.
6. **Lines say what they mean.** Lines get stronger only around what you are looking at.

| Line | Means |
|---|---|
| Hairline | Parent → child |
| Dashed blue | Related topics (with a reason) |
| Dotted | Tagged on |
| Arrow | Made from, or "points to" (an item to the topics it is tagged on) |
| Short tick | A note or quote to its item |

## 6. Motion: four movements, nothing else

A small set of named movements makes the space feel crafted instead of busy. Each uses the app's existing motion tokens (`src/styles/tokens.css`: `--dur-move` 380 ms, `--dur-calm` 1250 ms, `--ease-standard`, `--ease-spring`).

| Movement | When | How it looks |
|---|---|---|
| **Settle** | Opening Loci | Areas appear first, then topics, then sub-topics, each growing in with a slight spring while the camera swings in from above (about 3 s, once per visit) |
| **Fly** | Opening anything | The camera eases to frame the object and everything it touches. Long jumps pull back and come in again, so the path is readable (0.7–1.5 s) |
| **Bloom** | Opening a stack or an object | Contents unfold from their parent: a stack fans its latest four out of itself, and an item's notes and quotes orbit out around it one by one (40 ms apart). Closing reverses it |
| **Breathe** | Idle | A very slow turn of the whole space and a soft pulse on the open object's ring. It stops the moment you hover or touch |

Rules:
- Only one movement leads at a time.
- Hover never moves the camera.
- With reduced motion on, every movement becomes a short cross-fade and Breathe is off.

## 7. Sound: quiet, tuned, optional

Sound is what makes it feel physical. Done badly it is the first thing people switch off, so:

- **Off until the learner turns it on.** A first-visit card offers it; the setting is remembered. Sound is never played on load (browsers block that anyway), and it is muted while the tab is hidden.
- **Synthesised in the browser** with Web Audio: no audio files, about 2 KB of code, instant.
- **Short and soft:** under 120 ms, around −24 dB, soft attack.
- **Tuned to one pentatonic scale**, so any sequence of moves sounds pleasant rather than random.
- **Pitch follows level:** lower for big things, higher for small ones. You hear where you are.

| Event | Sound |
|---|---|
| Open an area | Low wooden "tock" (G3) |
| Open a topic | Mid "tock" (D4) |
| Open a sub-topic | Higher "tock" (G4) |
| Open a Library item | Paper "tick" (a short filtered noise) |
| Open a note or quote | Pencil tap (a shorter, brighter tick) |
| Open an explainer or course | Soft two-note chime (D5 + A5, 400 ms tail) |
| Bloom (a stack or orbit opens) | Quick three-note rise, 30 ms apart |
| Mark a topic Learned | A pleasant fifth upward (G4 → D5) |
| Hover an area | Nearly silent tick, areas only |
| Go back | The same note as the level you land on, a little softer |

On phones, a 5 ms vibration can accompany "open" where the platform allows it. Android does; iOS web does not.

## 8. Interaction details that make it feel alive

- **Hover an area:** its topics drift a third of the way toward it, its links curve in with flowing dots, and the rest greys out (built in the prototype).
- **Stacks:**
  - Opening a stack shows a small card beside it with the latest four, plus *See all N in Library →* or *See all N in Learn →*. These open those pages already filtered to the area (built in the prototype).
  - The latest four bloom out with arrowed lines to the topics they serve.
- **Notes and quotes:**
  - Opening an item blooms its notes and quotes into a small ring around it.
  - Quotes carry their locator ("p. 112"). Hovering one shows its first line.
  - Opening a note shows it in the panel, with *Open in Library*.
- **Peek before open:** on desktop, hovering any object for 400 ms shows a one-line card (type, status, counts). On phones, a long press does the same.
- **Keyboard:**
  - Arrow keys move to the nearest neighbour in that screen direction.
  - Enter opens, Esc goes up a level.
  - `/` searches and flies to the result.
  - The List view stays the full keyboard path, as today.
- **Empty and sparse palaces:** a new learner with three areas would see a thin sky. Show the AI's suggested areas as hollow, faint "ghost" landmarks. They use the app's existing ghost concept (`src/features/topics/layout.ts`, `FrameItem.kind = "ghost"`). Opening one offers to add it.

## 9. Fitting into Studiolo

- **Placement:** a fourth Graph tab, **Loci**, at `/graph/loci`, as in the earlier proposal. The radial Map stays the place to edit.
- **Data:** read-only, and loaded once per visit. Topics and relations already come from `loadTopicGraph`. Loci also needs:
  - tag pairs from `content_topic_tags`;
  - notes and quotes (`about_id`, `annotations`);
  - explainer and course anchors.
  
  All of these are scoped by `account_id` like everything else.
- **Rendering:** plain canvas, as in the prototype. No 3D library is needed, which keeps it light. At the per-account limit (2,000 topics, 4,000 links) the prototype ran at about 52 fps in a headless browser.
- **Design system:** Studiolo tokens, light and dark. The serif is used only for the open object.
- **Owner decisions needed** (AGENTS.md requires them for a visual departure):
  - the name;
  - the tab;
  - sound (on or off by default; recommendation: off);
  - the area progress ring.

## 10. Build order

Each step is small and can be tried in the prototype before the app.

1. **Notes and quotes** orbiting their items, with locators. Sample notes are added to the existing items.
2. **Area progress rings** and the **path chip** with Back.
3. **Sound** (off by default, with a switch in the key) using the table above.
4. **Semantic zoom** thresholds and the **trail**.
5. **Peek** cards and keyboard neighbour moves.
6. **Ghost areas** for sparse palaces.
7. **App slice:** the Loci tab reading real data, behind a feature switch.
