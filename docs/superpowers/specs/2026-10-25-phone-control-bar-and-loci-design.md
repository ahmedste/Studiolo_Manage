HIGH (changes the phone shell for every destination and how the Map and Palace are used on touch; no data or AI change)

# Studiolo on a phone: the control bar, the drawer, and Loci made for a thumb

**For:** the owner, to decide the direction, and the agent who later builds it in `studiolo`.
**Status:** Proposed. Claude, 25 October 2026. Nothing here is approved until the owner says so in the conversation. The decisions in §11 are recommendations.
**Checked against:** `studiolo` main @ `b5eeee2` (read-only clone, 25 October 2026): the shell (`src/components/shell/`), the Loci sheet (`src/components/graph/loci-side/use-loci-sheet.ts`), the Palace engine (`src/components/graph/palace/palace-engine.ts`), the Map (`src/components/graph/graph-map.tsx`), and the phone specimens at `/dev/specimens?graph=palace|map` rendered at 390 × 844.
**Prototype:** [`prototypes/mobile-loci/`](../../../prototypes/mobile-loci/README.md). It runs the app's own PalaceEngine and GraphMap (the bundles from `prototypes/boards/loci`, main @ `6f8d396`) inside the new phone shell, with Loci's answers simulated and the mic real where the browser allows it.
**Builds on:**
- `studiolo` [mobile responsive design](https://github.com/ahmedste/studiolo/blob/main/docs/superpowers/specs/2026-10-16-mobile-responsive-design.md) (M-D1 to M-D26, the Apple pass A1–A8, the phone patterns P0–P12). This spec **replaces M-D1** (the bottom tab bar) and **G-2** (the Loci sheet's peek / half / full), and keeps the rest.
- `studiolo` [Loci Palace design](https://github.com/ahmedste/studiolo/blob/main/docs/superpowers/specs/2026-10-23-loci-palace-design.md) §8.6 and §17.9 (phones).
- [Unified Loci chat brief](2026-10-24-unified-loci-chat-brief.md): one conversation that follows you. The bar in this spec is its phone face.
- [Dictation with Moonshine](../../../proposals/2026-10-24-dictation-moonshine.md): the mic in the bar.

## 1. What the owner asked for

> Work on the mobile experience of the graph, the palace, and having the call to action in the middle. We're adding dictation soon, where the user can dictate and speak to the agent or type: this is the centre of people controlling the app. Move Learn, Today, Commonplace and Loci from the bottom, so the bottom becomes the control, and the navigation maybe becomes a hamburger menu on the left. And design the responsiveness of Loci: the 3D Palace and the 2D Map. It's okay but not good: it takes time to open something, zoom in, zoom out. Think about it from an Apple perspective: simplify it so people can reach what they need and take the action with Loci, without clutter, especially with the nodes, adding a sub-topic, creating a Lumen and opening a Lumen. The whole sequence needs to be amazing on the phone.

Success means:
- the foot of every screen is one control for talking to Loci, typing, dictating and creating;
- the four destinations are one swipe or tap away, never lost;
- in Loci, the common sequences take one or two taps with no pinching: open an area, open a topic, add sub-topics, make a Lumen, play it;
- the Palace and the Map get most of the screen, and every mark can be hit with a thumb.

## 2. What is wrong today (measured)

Measured on the phone specimens at 390 × 844 (Playwright's iPhone 13, which gives a 664 px tall visible page), light theme. Before shots: `/dev/specimens?graph=palace&copilot=empty` and `?graph=map&copilot=empty`.

| # | Fault | Evidence |
|---|---|---|
| F1 | **Chrome eats the canvas.** Top bar (52), the "Loci" header and the Palace · Map · List · Overview tabs stack 168 px above the canvas; the sheet's peek (132) and the tab bar (56) take 188 px below it. | Palace canvas visible from 168 to 476 px: **308 px, 46 %** of the page. The Map: 210 to 476 px, **266 px, 40 %**. |
| F2 | **Acting hides the map.** To use Loci, Details or the topic's actions you raise the sheet to half (58 % of the screen). | With the sheet at half, the Palace shows from 168 to 223 px: **55 px** of canvas. |
| F3 | **Marks are too small to tap.** The Palace hits a mark within its drawn radius + 3 px (`pick`, `palace-engine.ts:797`); small marks are 5 px. | Smallest touch target **16 px** across, against Apple's 44 pt. Missing a mark turns the scene instead. |
| F4 | **Opening a topic doesn't bring it close.** Every level is framed from at least 260 units away (`frameFor`), so a topic's sub-topics stay a few pixels wide. | You open, then pinch in, then pan: the "takes time to open something, zoom in, zoom out" the owner describes. |
| F5 | **The Map is unreadable at the whole-map level.** The fan of 18 areas and 86 topics fits a 390 px width. | Labels **6 to 7 px** (measured on the SVG text). |
| F6 | **The key sits on the scene.** Not started · Learning · Learned · Commonplace · Lumen take a row over the Palace's lower edge. | Visible in every Palace shot; on phones it covers marks near the sheet. |
| F7 | **The way to Loci is in the sheet, not the foot.** The composer is the sheet's peek row; capture is a 26 px ring in the top bar; there's no mic. | Talking to Loci means finding the sheet first; it competes with the tab bar for the bottom of the screen. |

## 3. Principles (the Apple view)

1. **The foot is for doing.** The bottom third is where a thumb rests. The most-used action gets it: talking to Loci (typed or spoken), finding a place, creating something. Going somewhere else is rarer and moves up and aside.
2. **One control, many verbs.** One bar does ask, find, dictate and create, the way Spotlight, Maps' search field and the Claude and ChatGPT apps put everything behind one field. There are no separate search, capture and chat entry points.
3. **Content first, chrome on glass.** The canvas runs edge to edge; bars and floating controls are translucent paper (A3) over it. Nothing permanent sits on the scene: the key goes behind a button.
4. **Show a place as a card.** What is open is a card above the bar, as Apple Maps shows a place: its name, its status, its children one tap away, and four big actions. The card has three heights (peek, card, full) and you drag it by its top.
5. **Reach by list, explore by picture.** The Palace and the Map are for seeing; the card's chips and the List are for getting there. Nobody should have to hit a 5 px dot to go one level down.
6. **Every target is 44 pt.** A tap near a mark opens the nearest mark.
7. **Back is always one tap, and history is a hold away.** A back pill names where it goes, and holding it shows the whole trail, as iOS does with a held Back button.
8. **Hold for the menu.** A long press on any mark, chip or row opens its context menu (A1 lift, a light haptic): open, add, make a Lumen, ask, set its status, rename, move, delete.
9. **Nothing changes the graph without Keep** (the Loci rule stays): Loci's suggestions are dashed until kept, and every add has Undo.

## 4. The shell on a phone (under 700 px)

### 4.1 The Loci bar (replaces the tab bar)

A floating capsule at the foot of **every** destination: 54 px tall, 10 px from the screen edges, above the home indicator's safe area, on the A3 material.

| Part | What it does |
|---|---|
| **＋** (left, 42 px) | Opens the create menu, anchored to it and growing upwards (P6): **New sub-topic** / **New topic** / **New area** (whichever fits what is open, in Loci), **Make a Lumen**, then **Write a note**, **Photo or scan**, **Paste a link**, **Add a file or PDF**. This replaces the capture ring in the top bar. A note or link is filed in Commonplace on whatever is open. |
| **The field** | The placeholder says what it will act on: *Ask about Daylight & shading…*, *Find a place or ask Loci…* on the whole map, *Ask about your day…* on Today, *Capture, find or ask…* on Commonplace. Focused and empty, it shows **Recent** places and three **Ask Loci** suggestions above it. While you type, **places come first** (prefix matches, then contains, at most four) and the last row is **Ask Loci "…"**. Return opens an exact match, otherwise sends to Loci. |
| **Mic** (right, 42 px) | **Tap** to dictate: the words appear in the field as you speak, the bar gets an accent ring and a small waveform, ＋ becomes ✕ (stop without sending), and a second tap stops and leaves the text to edit. **Hold** to talk: release sends. When there is text and you're not dictating, the mic becomes **Send** (↑). |

Modes the bar takes on without leaving the foot:
- **Naming** (§6.1): a chip with the parent's name, *Name a sub-topic*, Loci's suggestions above it, **Done**.
- **Capture**: a chip *Note → Daylight & shading* and *Write a note…*.
- **Listening**: as above.

Loci's replies float **above the bar** as a short card (three lines at most, with its actions: Keep all, Review, Open…). Tapping it opens the **thread sheet**: one conversation, with "Now in …" dividers where you moved (the unified chat brief, §4 there). A reply with no action fades after five seconds; it stays in the thread.

### 4.2 The drawer (the destinations)

**☰** at the top left, or a swipe from the left edge (a 22 px edge zone that the Palace leaves alone), opens a drawer 84 % wide (at most 330 px) over a scrim:
- **Today, Learn, Commonplace, Loci**, each with its own icon and a quiet count (*5 Lumens*, *12 items*, *104 topics*), the current one in accent;
- **Recent:** the last four places and Lumens you opened, one tap back to them;
- at the foot: **Appearance** (Auto · Light · Dark), **Settings**, the account.

It closes with a swipe left, a tap on the scrim or Escape. Settings stays reached through the account, as today.

### 4.3 The top bar

48 px plus the safe area, translucent: ☰, the title, and one action.
- **In Loci** the title is a menu: a small *LOCI* over the view's name, **Palace ⌄**. It lists **Palace · Map · List**. Overview isn't on phones: the whole map is the Palace or Map with nothing open, and its numbers are in the whole-map card. The right action is **⋯**: *Slow turn*, *Rearrange*, and the mic engine while testing.
- **Elsewhere** the page has an iOS large title (Newsreader 34), which moves into the bar as you scroll.

The 91 px stacked header (the M-D1 complaint) and the Loci tab row go. Together with the bar replacing the tab bar, **F1** is fixed: the canvas runs from the top bar to the screen's foot.

### 4.4 Why a drawer and not a tab bar (the trade-off)

Apple's guidance prefers a tab bar for an app's top-level sections, because a hamburger hides them. The recommendation is still the drawer, because:
- Studiolo is becoming an app you **talk to**. The bar is used far more often than a change of destination, so it earns the foot. Next to it, a tab bar would stack two bars at the bottom (56 + 62 px plus the safe area).
- Hidden is mitigated:
  - the title says where you are;
  - the drawer is a swipe from anywhere;
  - it carries Recent, which a tab bar can't;
  - Loci can take you there ("open Commonplace").
- This is the pattern of the Claude and ChatGPT apps, which people already use for exactly this.

**The alternative** (decision MB-D1) is iOS 26's compact tab bar: four icons without words on the left of the foot and a round Loci button on the right, which expands into the bar. It keeps the destinations visible but makes the bar a second tap away. The prototype can show it if the owner wants to compare.

## 5. Loci on a phone

### 5.1 The canvas

- **Edge to edge**, from the top bar to the foot. The bar, the card and the mini player float over it, and the Palace and the Map frame what is open in the space left above them (the engine's `sheetHeight`, which is now the dock's covered height).
- **Two floating controls:**
  - top left, the **back pill**: *‹ Environment & Services*, naming where Back goes, or *‹ All areas*. Hold it for the trail.
  - top right, a two-button stack: **Whole map**, and **Key**, which shows the key only when asked (F6).
- A first-visit hint, *Tap to open · Hold for more*, fades at the first touch.

### 5.2 Gestures (Palace and Map)

| Gesture | Does | Today |
|---|---|---|
| Tap a mark | Opens it and flies there. **The nearest mark within 22 px of the finger counts**, front first (a 44 pt target). | Hit only within the drawn radius + 3 px (F3) |
| Tap a chip or row in the card | Opens that child: the fast way down | — (new) |
| Hold a mark (480 ms) | Its context menu, with a light haptic and the scene blurred behind | — (new). Right-click with a mouse |
| One-finger drag | Turns the Palace; pans the Map | Same |
| Pinch in on the whole Palace | Opens the area under your fingers | Same |
| Pinch out from anything open | Back one level | Same |
| **Two-finger tap** | Back one level (Maps' "zoom out" gesture) | — (new) |
| Swipe from the left edge | The drawer | — (new) |
| Tap the back pill | Back one level. Hold it for the trail | Trail row with crumbs |

### 5.3 Opening brings things close (fixes F4)

On a phone, opening a **topic** frames it and its sub-topics and suggestions from 0.42× the app's distance (at least 120 units), so their names show without a pinch. Opening an **area** uses 0.72×. The whole map keeps the overview distance. In the engine this is one rule in `frameFor` for narrow screens (§9). The prototype applies it by wrapping `frameOf`.

### 5.4 The card

One card for whatever is open, above the bar, radius 24, solid `--surface-float` (sheets stay solid, A3).

| Part | Whole map | Area | Topic |
|---|---|---|---|
| Kicker | LOCI | AREA · 5 TOPICS | TOPIC IN ENVIRONMENT & SERVICES |
| Title (Newsreader 24) | Your whole map | Environment & Services | Daylight & shading |
| Line | 18 areas · 86 topics · 42 learned | 5 topics · 6 in Commonplace · 1 Lumen | **status pill** (tap to change) · 4 sub-topics · 4 in Commonplace |
| Four actions | ＋ Area · Focus · Ask · More | ＋ Topic · ▶ Play / ✦ Lumen · Ask · More | ＋ Sub-topic · ✦ Lumen (▶ Play once it has one) · Ask · More |
| Chips (scroll sideways) | the 18 areas, with counts | its topics | its sub-topics, Loci's dashed suggestions, then **＋ Add**. With none yet: **✦ Suggest sub-topics** and **＋ Add your own** |
| Full height adds | My Focus, Recently opened | Status, Topics, Lumens, In Commonplace | Status (segmented), Sub-topics, Lumens (▶ each), In Commonplace (pictures) |

- **Heights:**
  - **peek** shows the name only;
  - **card** (the default) is everything down to the chips, about 230 px;
  - **full** shows everything, up to the top bar.
- **Moving between heights:** drag the top or the name. In the build, flicks are projected (A4); the prototype snaps by the drag's direction and speed. A tap on a peeked card raises it. Touching the canvas lowers a full card to card height.
- **✕** closes the card and goes back one level.
- **More** is the context menu.
- An area's **Commonplace** and **Lumens** stacks in the Palace open the same card listing their members.
- An item opens its quick view; a Lumen opens the player.

The canvas left visible, at 390 × 664:

| State | Today | Proposed |
|---|---|---|
| Looking (sheet at peek / card at peek) | 308 px (46 %) | **468 px (70 %)** |
| Ready to act (sheet at half / card at card) | 55 px | **323 px (49 %)**, with the four actions and the children in reach |

### 5.5 The Map on a phone

- The Map is the app's `GraphMap` unchanged, with the lanes in the card (M-D3, as built).
- **New:** with nothing open it draws **areas only**. Once an area is open, its topics fan out at full width and the labels are readable.
- **Still open: the whole-map ring stays small (F5).** 18 labels on a 390 px circle can't reach 11 px. The card's area chips do the navigating there. Decision MB-D5: keep the ring as a picture, or zoom it to readable and let people pan it.

### 5.6 The List

On phones the List is the accessible, fastest way down. It shows the **same selection** as the Palace and the Map: the children of what is open, as grouped rows with status, place and a chevron. A tap opens the row, and the card follows. It is reached from the title menu, and from **More** on the whole-map card.

## 6. The sequences

### 6.1 Add sub-topics (one after another)

1. On the card, **＋ Sub-topic** (or ＋ in the bar, or hold the mark → *Add a sub-topic*).
2. The card steps aside, and a **draft mark** waits beside the parent on the Palace (the engine's existing draft, §17.4 of the Palace spec).
3. The bar becomes *Daylight & shading · Name a sub-topic* with the keyboard up and the mic beside it. Above it, **Loci suggests**: *Daylight factor · Glare control · Light shelves · …*, dashed chips.
4. Type a name and press **Return**. The topic lands where the draft was (`adopt`), a new draft appears for the next one, and a toast says *Added "Overhangs"* with **Undo**. Or tap a suggestion chip to add it at once.
5. **Done** (or ✕) returns to the parent's card, with the new chips in place.

### 6.2 Ask Loci to break it down

1. **✦ Suggest sub-topics** on an empty topic, or say *"suggest sub-topics"*, or *"add glare and light shelves"*.
2. Loci drafts them as **dashed marks** on the Palace and dashed chips on the card. The reply above the bar offers **Keep all** and **Review**.
3. Tap a dashed mark or chip for **Keep / Dismiss** one at a time.

### 6.3 Make a Lumen

1. **✦ Lumen** on the card (or ＋ → Make a Lumen, or hold → Make a Lumen, or *"make me a Listen about this"*).
2. A sheet: *About Daylight & shading*; three big format tiles, **Watch** (slides and a narrator, ~6 min), **Listen** (two voices, ~15 min) and **Read** (a long read with diagrams, ~12 min); the question, pre-filled and editable, with its own mic; **Make Lumen**.
3. The sheet closes. The card shows **Making Listen** with a progress line, and you keep exploring.
4. When it's ready, a toast says *"Daylight & shading, talked through" is ready* with **Play**. The topic's action turns into **▶ Play**, and the Lumen joins the area's Lumens stack on the Palace.

### 6.4 Open and play a Lumen

- **▶** on the card, a Lumen row, a Lumen mark, Recent in the drawer, or Today's *Pick up where you left off*: the **player** opens full screen. It has:
  - the cover;
  - the format switch, Watch · Listen · Read | ● Live (as in Learn slice 2);
  - the scrubber and the transport;
  - **Ask the hosts about this…** with a mic.
- **Swipe it down**, or tap ⌄, and it docks as a **mini player above the bar**, as Apple Music's does. It keeps playing while you move around Loci and the other destinations. Tap it to bring the player back.

### 6.5 Capture into Commonplace from anywhere

＋ → **Write a note** turns the bar into *Note → Daylight & shading*. Return files it in Commonplace, tagged on what is open. Photo, link and file follow the same rule.

## 7. Learn on a phone

Learn keeps the app's three tabs and everything in them, and adds the agreed formats from Learn slice 2 (Watch, Listen, Read, ● Live). What is **built** in the app today is Watch only, with the player, Home, Lumens and Courses. Listen, Read, Live, drive editions, marks and recall exist only in the slice 2 prototype and specs, and each is marked *new to build* below.

### 7.1 The page

- **Large title** *Learn* with its line: *Ask, pick up, and what's next* / *5 Lumens* / *2 courses*. It moves into the top bar as you scroll.
- **Home · Lumens · Courses** as a segmented control, pinned under the top bar. Courses shows only while courses are on for the account (absent, not greyed out; `learnSections`).
- **The bar is the make field.** Its placeholder is the app's heading, *What do you want to understand?*. Focused, the panel above it shows:
  - **Make a Lumen**, with the format picker **Watch · Listen · Read | ● Live** (the last format used, Watch for new learners: LS2-2);
  - with text typed: *In: <topic>* when the question names one of your topics, then **Make a Watch: "…"** with the format's hint, then **Ask Loci instead**;
  - with nothing typed: **Explain <topic>** starters from My Focus.
  - Return makes the Lumen; ● Live starts a live session.

### 7.2 Home

- **The make card:** *What do you want to understand?*, the format picker, the hint for the format, and the starters.
  - Watch: *Slides and a narrator · 2–6 min · ready in about a minute*.
  - Listen: *Two voices · 10–30 min · starts playing in about 30 seconds*.
  - Read: *A long read with diagrams · 8–15 min*.
  - Live: *Talk it through now, slide by slide, and interrupt any time*.
  - The card says *Type it in the bar below, or hold the mic and say it*, so nobody hunts for a second field.
- **Being made:** each Lumen in progress, with the app's steps (*Reading the source · Planning the story · Writing slide 3 of 5 · Recording voice, 4 of 9 lines*; Listen: *Chapter 1 is ready to play · writing the rest*) and a progress line. When it's done, a toast offers **Play** (or **Read**).
- **Pick up where you left off:** a poster, a tag (format · topic), the title, the place line, and the buttons under the text (the app's phone rule, learn-home §3.2):
  - Listen: *Chapter 3 of 6 · paused at 7:34 of 18:00*, **Resume** · **Drive edition**;
  - Read: *20% read · Deep or shallow*, **Resume**;
  - Course: *Shading & screens · paused at 1:44 · 2 of 6 watched*, **Continue**;
  - Live session: *Stopped at slide 3 of 5 · 4 min live · Kept*, **Resume live** · **Play the Lumen**.
- **Next for your goals** (*From your courses and My Focus*, **All Lumens →**): one card per goal, with its due date, and two steps each. A step is Resume, Continue part *k*, Watch, or **Make a Lumen on <topic>** (*Not made yet*).

### 7.3 Lumens and Courses

- **Lumens:**
  - **Format chips:** All · Watch · Listen · Read · ● Live sessions.
  - **State:** All · New · In progress · Watched.
  - **Group:** By date (Today, Yesterday, This week, Earlier) or By topic (your areas).
  - **Each row:** the poster, the title, the topic and date, a *New* or *Watched* mark, a progress line on the poster, and the **format pills**: each made format with its length, and **+ Listen** (dashed) for one not made yet. A pill opens that format or makes it.
  - **⋯ menu:** Edit details…, Share…, Show in Loci, Delete…. An empty result says *No Lumens match.* with **Clear filters**.
- **Live sessions:** *Stopped at slide k of n · … min live*, *Kept · Resumable for N more days*, then **Resume** and **Play the Lumen**.
- **Posters tell the formats apart without colour** (slice 2 rule): Watch shows its title slide with a play mark, Listen the two hosts on a dark cover, Read a paper title page.
- **Courses:**
  - **Each course:** a 16:9 poster with *Course · N parts*, the topic, the title, *k of N watched*, a segmented progress strip (watched, playing, ready, not made), one button (**Continue: Part 2** / **Start: The whole topic** / **Watch again**) and ⋯ (Edit details…, Share course…, Report a problem, Delete course…).
  - **Its outline:** the first four parts with ✓ / ▸ / dot and *Watched*, *Playing · 1:44 of 3:05*, *Ready · 4 min* or *Not made yet*, then **+ n more parts**.
  - Parts are numbered as in the app: Part 0 is *The whole topic*.

### 7.4 A Lumen's room (Watch, Listen, Read, ● Live)

A Lumen opens in a room that slides in from the right, over whatever destination you were in.
- **Its top bar:** ‹ the place you came from, the title, and Share (Aa as well in Read). A swipe from the left edge goes back, as on iOS.
- **The bar stays at the foot**, and asks about what you're looking at: *Ask about this slide…*, *Ask the hosts…*, *Ask about this page…*, or *Talk or type to interrupt…* in Live.
- **The switcher** is pinned under the top bar: **Watch · Listen · Read | ● Live**, each slot showing its length, **+** (not made) or **…** (being made). Switching changes only what's below it (the slice 2 rule).
- **A format not made yet** shows its poster, *<title> has no Listen yet*, the hint, and **Make Listen**. It's made from the same Lumen, onto the same card, with its progress shown in place.

**Watch (the video preview; built in the app):**
- **A 16:9 stage, pinned under the switcher** as you scroll (the course viewer's phone rule). It shows the slide, its number, and captions over the foot of the slide.
- **One control row:** back 10 s, play/pause, forward 10 s, the scrubber, the time, speed (1 → 1.25 → 1.5 → 0.75×), **CC** and full screen. Sideways, the slide fills the screen.
- **Below:**
  - the title, *6:00 · 5 slides · made 22 Oct*, and **Lives in <topic> ▾**;
  - **Transcript | Slides**: lines with their times, the current one lit, and a tap seeks to it; or a two-column grid of slides;
  - the citation chips, and *General knowledge*;
  - **Questions to take further** as chips, which ask Loci.
- **Asking from the bar pauses** and shows a **Written answer** card under the stage (it uses no voice minutes), with **Back to the Lumen**.

**Listen (the audio preview; new to build, from slice 2):**
- **A dark cover:**
  - the two hosts (*Maya*, *Sam*), the one speaking ringed;
  - the line being said, large, in Newsreader;
  - a chapter-segmented progress bar, *Chapter 3 of 6 · The stack effect* and the time;
  - back 15 s, a large play, next chapter;
  - then **1×**, **Mark**, **Walk** and **Drive**.
- **Below:**
  - *Two voices · 18 min · 6 chapters*, with **Make a drive edition** and **Save for offline**;
  - **Chapters** (*Played*, *Playing*, a time, or *Written when you get closer*);
  - the **Transcript** (*Tap a line to play it*);
  - **Your marks**;
  - the **Your turn** recall card (*Answer out loud, type it below, or say "skip"*).
- **Asking the hosts from the bar** pauses them, and the answer shows on the cover, under *You asked: …*.
- **Walk:** a full-screen dark page with 72 px buttons and a 104 px play, **Mark this moment** and **Hold to ask**.
- **Drive:** *Set it up before you move.* first (**Make a drive edition** / **Play it anyway** / **Start**), then four 84 px buttons: **Say that again**, **Mark**, **Next chapter**, **Hold to ask**.

**Read (new to build, from slice 2):**
- **Pinned under the switcher:** a reading progress line, then the section chips.
- **The article:** *12 min read · 5 sections · Passive design* and the title, then Instrument Sans at 16/1.55 (18 and 20 with **Aa**). Its figures, the humidity slider with *Dry desert afternoon* and *Humid coast in August*, and **Check yourself** with three choices and its answer.
- **At the end:** the **Sources** as chips (your Commonplace entries open in their viewer), and **Listen to this instead**.

**● Live (new to build, from slice 2):**
- The Watch stage with a **Live** badge, and the interruption chips: *Explain that another way · Go deeper · From my field · Simpler · Test me · Skip*.
- **Back to the recording** and **Keep this version**, with *Tap a slide to ask about it, or hold the mic and talk. Live sessions are kept for 30 days.*
- Holding the mic is talking. Typing is a written answer.

**Share** (every format): *Share this Lumen*, the formats to include, *Not shared: your live sessions, your questions and marks, your goal and your Commonplace notes.*, then **Copy link** and **Preview as a viewer**.

### 7.5 A course's room

The same room, with:
- **an episode bar** pinned in place of the switcher: ‹, *Part 2 of 5 · Shading & screens*, **Parts 2/5**, ›;
- the Watch stage and controls;
- **Reading · This part · Transcript · Slides**:
  - Reading has *Where this is on your map* with **Open in Loci ↗**, and Sources;
  - This part has *How useful was this part?* 1–5, and **Report a problem**;
- **Up next**, with **Play part 3** or **Make part 4**.

**The Parts sheet** lists every part as *Watched* / *Now playing* / *Ready · 4 min* / *Not made yet. Opening it makes it.*

**Report a problem** is a sheet with the app's four choices and *Include the slide I'm on*. This is the full-screen course room the mobile design asked for (M-D16), with the bar in place of the app bar and tab bar.

## 8. Commonplace on a phone

Commonplace takes the **new header** (CP_HEADER, built behind its switch, and the approved v4 prototype) and folds it for a thumb. Labels are the app's (`wall-header.tsx`, `header-model.ts`, `filter-bar.tsx`, `card-menu.tsx`).

### 8.1 The header

- **The area switch is the title:** *COMMONPLACE* over **● All areas ⌄**, as Loci's title holds its view. The menu has:
  - **All areas** with the total;
  - each area that has entries, with its count;
  - **No area yet**.
  
  The choice is remembered (the `studiolo-area` cookie), and new captures go into that area.
- **Select** at the top right; it becomes **Done** while selecting.
- **Under the large title**, pinned:
  1. **Everything · Collections · To read · Templates** (segmented);
  2. **The types:** All · Notes · Sources · Photos · Objects, each with an icon and a count. The chosen type is followed by **›** and its collections as pills with counts (Photos › Site visits · References · Renders · Drawings · Materials).
  3. **The slim bar:**
     - **All · Unsorted · ★ Picks**, with counts;
     - **Topic ▾**;
     - the type's own filter: Sources → **Status** (To read / Reading / Read); Notes → **Style** (Plain / Long / Quote); Photos → **Colour** (12 swatches) and **More** (Landscape / Portrait / Square / Panorama, Light / Dark);
     - **Display**.
- **Rows 2 and 3 fold away while you scroll down and come back when you scroll up**, as Safari's bars do. The tabs stay.
- **The count line:** *32 photos · newest first*, the search as a removable chip (*"brick" ✕*), and **Wall | Shelves**.

### 8.2 Search and capture: the bar again

- **The bar is the search field.** Its placeholder follows the type:
  - *Search, capture or ask…*;
  - *Search notes and quotes…*;
  - *Search books, lectures and links…*;
  - *Search photos by place or note…*;
  - *Search your collections…* on Collections.
- **The wall filters as you type.** Above the bar: *N matches on the wall*, **Save "…" as a note** (*Looks like a Note*), and **Ask Loci "…"**. Return keeps the search as a chip.
- **Focused and empty**, it lists your saved **Views** (*Warm brick references*, *Competition picks*, *Reading now*) and **Capture a thought, quote or link…**.
- **＋ in the bar** is capture: a note, a photo or scan, a link, or a file or PDF.

### 8.3 The wall

- **Two columns of the app's card faces** (M-D4):
  - **Photo:** frameless, with the caption and *collection · topic*, ★ for a pick, and the detail-note count.
  - **Album:** one card with its count, on All.
  - **Note:** paper with the blue edge. **Long note:** title and first lines. **Quote:** warm paper, italic Newsreader, attribution.
  - **Book:** a 2:3 cover with a progress line. **Video:** a thumbnail with play, duration and a watched bar. **Link:** its picture and site. **PDF:** its first page on a white sheet.
  - Each card has its collection as a kicker.
- **Photos also have Rows** (justified, the photo-wall phase) and **Grid** (square, 2–4 across).
- **Display** (a sheet):
  - View: Wall / Shelves;
  - Layout: Rows / Masonry / Grid (photos);
  - Size: Small / Medium / Large;
  - Sort: Newest / Oldest / Title;
  - Captions: Show / Hide (photos);
  - Views, and **Save these filters as a View…**.
- **Shelves:** one shelf per collection, with its count and **Open shelf**, scrolling sideways on the shelf's edge, then **Not on a shelf**.
- **Hold a card** for its menu: Move to collection · Area › · Explain… · Show connections · Copy link · Select · Delete….
- **Select:**
  - tap cards to tick them;
  - the bar at the foot gives way to the selection bar: *N selected*, then **Add topics… · Move to… · Pick · Delete…**;
  - **Move to…** lists the type's collections, *No collection* and **New collection…**.

### 8.4 Collections, To read, Templates

- **Collections:** two columns of tiles (cover or a paper stack, the name, *Photos · 10 items*), then **New collection**.
  - New collection is a short sheet: Name; Type as four rows with one line each (*Notes: your writing and quotes* · *Sources: links, videos, PDFs, books* · *Photos: pictures and their groups* · *Objects: people, buildings, cases… with your own fields*); **Create**.
  - Create opens the new, empty collection (M-D24).
- **One collection** (CH-1, M-D22):
  - ‹ Collections;
  - a 72 px cover, *SOURCES COLLECTION*, the name, and the description in two lines;
  - **Add items** and **Edit collection**;
  - then its own wall or shelf.
- **To read:** To read · Reading · Read with counts; each source with its cover, creator, kind and progress. The empty states are the app's:
  - *Nothing to read yet. Sources you save start here.*
  - *Nothing in progress. Set a Source to Reading on its page.*
  - *Nothing finished yet.*
- **Templates:** *The Four Types*, each with its line and **New … collection**.

### 8.5 How each kind opens (card-open.ts)

| Kind | Opens in | On the phone |
|---|---|---|
| Photo, album | the viewer (PHOTO_VIEWER) | Full screen on a dark mat. *3 of 32*, swipe between photos, swipe down to close, double-tap or pinch to zoom. Under it: title and caption; **Pick · Info · Lumen · On Loci · Share**. **Info** adds Album / Size / Kind / Taken / From, the topic chips (which open Loci) and *notes on a detail*. ⋯ has Copy image, Move to collection…, Note a detail, Delete… |
| Video | the video quick view, then the watching room | A sheet with the 16:9 frame, its watched bar and play; *creator · 30:00 · 35% watched · Lectures*; Status; **Resume in the watching room**; **Explain… (make a Lumen or a course)**; topics |
| Link | the web viewer | A sheet with the site, the page's picture, the reader view, Status, **Open in the browser ↗**, **Explain…**, topics |
| PDF | the PDF reading room | Full screen: ‹ Commonplace, the title, Notes; the pages scrolling; a floating bar with *Page 1 of 96*, a page slider and **Explain…** |
| Note, long note, quote | the item page | A tall sheet you can write in (Newsreader 17), topics, **Explain…**, **Show connections**, ⋯ (Move to collection…, Area ›, Copy link, Delete…) |
| Book | the item page | A tall sheet with the cover, Status (To read · Reading · Read), topics and **Explain…** |

**Explain…** is the app's explain dialog as a sheet:
- *The whole thing*;
- for books, PDFs and videos also *Part by part* (**Start with part 1**) and *One chapter* (*Choose pages instead*);
- *Focus on… (optional)*;
- then it makes a Lumen.

## 9. Dictation in the bar

- One mic for every destination, the Lumen sheet's question, Live, *Ask the hosts* in Listen, and **Hold to ask** in Walk and Drive. It uses the `DictationProvider` from the Moonshine proposal: Moonshine Tiny on phones (D1 there), then Web Speech, then hidden.
- **Keyterms** come from the screen: the open place's name, its children's names, and the product words (*Lumen, Commonplace, Loci*), through `setKeyterms`, which can change while recording.
- **Spoken commands** go to Loci as text, with no separate command parser: *"open passive design"*, *"suggest sub-topics"*, *"make me a Listen about this"*, *"mark this learned"*. The prototype simulates these four intents to show the flow. In the app they are Loci's tools, with Keep where the graph changes.
- Hold-to-talk sends on release; tap-to-dictate never sends by itself.

## 10. What stays

The phone patterns of the mobile design keep:
- P5: confirmations as sheets;
- P6: anchored menus;
- P11: safe areas and the keyboard (the bar rides the keyboard through `visualViewport` on iOS);
- P12: immersive rooms hide the bar (the photo viewer, the PDF room, Walk and Drive). A Lumen's room keeps it, because asking is part of learning.

The Palace's levels, flights, labels, rooms, trail, the draft and suggestions, Keep / Dismiss and reduced motion are unchanged. The Map's layout is unchanged. iPads (700 px and up) keep the rail and the side panel; nothing here applies above 700 px.

## 11. What changes in the app (for the builder)

| Area | Change | Where |
|---|---|---|
| Shell | Under 700 px: the tab bar goes; the top bar gets ☰, a title slot and one action; a new **drawer** (destinations, recents, appearance, settings, account) with an edge swipe; the capture ring leaves the top bar | `shell/tab-bar.tsx` (removed on compact), `app-shell-frame.tsx`, `navigation.tsx`, `destination-header.tsx`, `src/styles/shell.css` |
| The bar | A new `LociBar` in the shell, on every destination. It owns ＋, the field (find + ask), the mic and its modes. The copilot composer moves into it on phones; the thread becomes a sheet | new `src/components/shell/loci-bar.tsx`; `components/copilot/*` composer; `loci-side/use-loci-chat.tsx` |
| Find | Place search in the field (prefix, then contains), shared with the Palace's *Find a topic* | `palace/palace-chrome.tsx` `PalaceSearch` logic, moved to a hook |
| Loci sheet → card | The sheet's peek / half / full becomes the card's peek / card / full, with the topic header, four actions and a chips row on top. Details, the explainers card and the stack card open inside it (as `inPanel` does) | `loci-side/use-loci-sheet.ts`, `loci-side/loci-side.tsx`, `topic-header.tsx` |
| Palace | Touch pick: the nearest mark within 22 px. Phone framing: topics 0.42×, areas 0.72× the distance, at least 120. Two-finger tap = back. A hold opens the context menu (cancels the tap). Leave the 22 px left edge to the drawer. The key moves behind a button on phones | `palace-engine.ts` (`pick`, `frameOf`/`frameFor`, pointer handlers), `palace-workspace.tsx`, `palace-chrome.tsx` |
| Map | Areas only at the whole-map level on phones; a hit target of 22 px around dots; hold for the context menu; two-finger tap = back | `graph-map.tsx`, `graph-workspace.tsx`, `features/topics/layout.ts` input |
| Lumens | The make sheet with three format tiles; the mini player docked above the bar | `graph-player*.tsx`, Learn's format picker |
| The card's height | Sticky and remembered: opening anything never changes it; only a drag or a tap on the peek does | `loci-side/use-loci-sheet.ts` (detent state moves out of the open/close path), `features/ui/drawer` |
| Learn | The bar is the make field on Learn (the make bar's job on phones); the room for a Lumen and for a course, pushed over any destination, with the switcher pinned, the stage pinned, and the mini player in the dock | `explainers/learn-home.tsx`, `make-lumen-bar.tsx`, `explainer-list.tsx`, `courses/course-list.tsx`, `courses/course-viewer.tsx`, `features/explainers/player/*`, `src/styles/learn.css`, `explainer.css`, `courses.css` |
| Listen, Read, Live | New formats from Learn slice 2: chapters, two-host transcript, Mark, Walk, Drive, the drive edition, offline; the article with figures and Check yourself; live interruptions and Keep | new, per `docs/superpowers/specs/2026-10-22-learn-slice-2-one-lumen.md` and `2026-10-22-learning-forms-and-dialogues.md` (this repo) |
| Commonplace | The CP_HEADER header folded for phones: area in the title, Select in the top bar, the pinned tabs, the type and collection row and the slim bar folding on scroll; the bar searches; the selection bar takes the foot | `library/wall-header.tsx`, `search-bar.tsx`, `type-bar.tsx`, `filter-bar.tsx`, `area-picker.tsx`, `selection-bar.tsx`, `src/styles/library.css` (the 700 px block) |
| Viewers | The photo viewer with Info and the five actions; the video and web viewers and item pages as sheets; the PDF room with its floating page bar | `photo-viewer.css`, `library/pdf-viewer.tsx`, `item-page.tsx`, `features/library/card-open.ts` |
| Dictation | The `DictationProvider` and mic, per the Moonshine proposal, mounted in the bar | per that proposal's step 3 |

Docs to update with the build: `project-docs/design/interface.md` (phone shell, replacing the tab-bar paragraph), `project-docs/design/graph.md` (phone Loci), and `project-docs/implementation/frontend.md`.

## 12. Slices (each shippable alone, testers first)

1. **Palace and Map touch fixes.** Hit target, closer framing, two-finger tap, hold menu, the key behind a button. No shell change; fixes F3, F4 and F6 today.
2. **The card.** The sheet becomes the card (actions + chips), with the List as a first-class phone view. Fixes F2.
3. **The bar and the drawer.** The tab bar goes; the bar takes find + ask + ＋; the thread sheet. Fixes F1 and F7.
4. **Naming and suggestions in the bar.** Rapid sub-topics with suggestion chips.
5. **Lumens on the phone.** The make sheet, making on the card, the mini player.
6. **Learn on the phone.** The bar as the make field, Home / Lumens / Courses as above, and the Watch room and course room (what the app has today, rearranged).
7. **Commonplace on the phone.** The CP_HEADER header folded for phones, the bar as search, the viewers and the selection bar. Needs CP_HEADER and PHOTO_VIEWER on for testers.
8. **Listen, Read and Live.** Slice 2's formats, in the room, one by one.
9. **Dictation.** Behind the Moonshine proposal's flag.

Checks for every slice:
- paired screenshots of today and the build at 390 × 844 and 360 × 780, light and dark;
- Axe on the bar, the drawer, the card and the menus;
- an end-to-end run of §6.1–6.4 on the specimen pages;
- the owner on an iPhone on the hosted Dev site.

## 13. Decisions for the owner

| # | Decision | Recommendation |
|---|---|---|
| **MB-D1** | Destinations move from the bottom tab bar to a left drawer; the foot becomes the Loci bar on every destination (replaces M-D1) | **Yes.** The alternative is iOS 26's compact tab bar beside a round Loci button (§4.4) |
| **MB-D2** | One field does find **and** ask (places first, then "Ask Loci") | **Yes.** No separate search |
| **MB-D3** | The Loci sheet becomes the place card: peek / card / full, with four actions and the children as chips (replaces G-2) | **Yes** |
| **MB-D4** | Phone framing: topics open at 0.42× and areas at 0.72× the app's distance | **Yes**; tune on a real iPhone |
| **MB-D5** | The Map's whole-map ring on phones | **Keep it as a picture** and navigate by the card's chips; revisit if testers try to tap the ring |
| **MB-D6** | Hold for a context menu on every mark, chip and row; a two-finger tap goes back | **Yes** |
| **MB-D7** | Overview leaves the phone's view menu (Palace · Map · List only) | **Yes**; its numbers are on the whole-map card |
| **MB-D8** | Spoken commands are plain messages to Loci (no separate parser); hold-to-talk sends on release | **Yes** |
| **MB-D9** | The card's height is the learner's: peek by default, never changed by navigating, remembered on the device | **Yes** (asked for by the owner, 25 October) |
| **MB-D10** | On Learn, the bar is the make field (Return makes a Lumen; **Ask Loci instead** is one tap) | **Yes** |
| **MB-D11** | A Lumen opens in a room pushed over any destination, keeping the bar for asking; Watch and Listen dock as a mini player when you leave | **Yes** |
| **MB-D12** | On Commonplace, the area switch is the title and Select is in the top bar; the type row and slim bar fold away on scroll | **Yes** |
| **MB-D13** | On Commonplace, the bar is the search field (it filters as you type) and capture | **Yes** |

## 14. What the prototype does and doesn't do

**Does:** everything in §4–8, on the app's real Palace and Map engines, in light and dark, full screen on a phone and in a 390 × 844 frame on a desktop. On a desktop a right-click stands in for a hold. The sample is one learner across Loci, Learn and Commonplace: the specimen map, the approved Commonplace prototype's 45 entries, five Lumens in their formats, two courses, a live session and two goals.

**Doesn't:**
- Loci's answers are simulated: four intents (open, suggest or add, make a Lumen, set a status), plus a generic reply.
- Nothing is saved: a reload starts again.
- The Map's own + buttons and dots open the same flows, but the Map has no hold menu yet.
- Photo, file, rename and move only say what they would do; so do Edit collection, Add items, a card's Area and Show connections.
- **Stand-ins:**
  - Lumens play on a clock, with no audio or video;
  - slides are one wind-tower drawing, lit differently per slide;
  - a PDF's pages are blank shapes;
  - the video and web viewers show a frame and a reader stand-in.
- The mic uses the browser's speech recognition where it's allowed, and otherwise a simulation (it says so). Moonshine needs the cross-origin isolated server from `prototypes/learn-lumens/serve.mjs`.
