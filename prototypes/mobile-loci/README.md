# Studiolo on a phone: the Loci bar, the drawer, and Loci made for a thumb

A phone prototype of the shell and of Loci (Palace, Map, List).
- **The bar:** the foot of every screen is one control, the Loci bar: ＋ creates, the field finds a place or asks Loci, and the mic dictates.
- **The drawer:** the four destinations move to a drawer on the left.
- **The card:** in Loci, whatever is open shows as a card above the bar, the way Apple Maps shows a place.

Design: [`docs/superpowers/specs/2026-10-25-phone-control-bar-and-loci-design.md`](../../docs/superpowers/specs/2026-10-25-phone-control-bar-and-loci-design.md).

Open `dist/mobile-loci-prototype.html`:
- **On a phone** it runs full screen.
- **On a desktop** it shows the app in a 390 × 844 frame beside a short guide. A right-click stands in for a hold.

## Try it

**Loci**
1. **The card.** It starts as one line (the name and a count). Tap areas and topics, on the Palace or in the chips: the card stays at the height you left it, and so does the next visit. Drag its top up for the actions and chips, then up again for everything.
2. **Hold a mark** for its menu: open, add, make a Lumen, ask, the statuses, rename, move and delete.
3. **＋ Sub-topic.** Type names and press Return, as many as you like, or tap Loci's suggestions above the bar.
4. **✦ Suggest sub-topics.** Loci drafts them on the Palace, dashed; **Keep all**.
5. **Views.** Palace, Map and List from the title. **‹** goes back; hold it for the trail.

**The shell**
6. **The drawer.** Swipe from the left edge or tap ☰.
7. **The mic.** Tap it to dictate; hold it to talk, and let go to send.

**Learn**
8. **Make a Lumen.** Pick **Watch · Listen · Read · Live**, type in the bar, press Return. *Being made* shows the real steps, and a toast says when it's ready.
9. **Rooms.** Open *Cooling without machines*:
   - **Listen** has the two hosts, chapters, the transcript, Mark, **Walk**, **Drive**, and asking the hosts from the bar.
   - Switch to **Read**: the progress line, section chips, figures, the humidity slider and Check yourself.
   - **Watch** has no format yet: **Make Watch**.
10. **Watch.** Open *How a malqaf moves air*: the pinned stage, Transcript | Slides, Questions to take further. Tap **● Live** for the interruptions.
11. **Courses.** **Continue: Part 2** opens the course room: the episode bar, **Parts**, Reading · This part · Transcript · Slides, Up next. Leave while it plays and it docks above the bar.

**Commonplace**
12. **The area is the title.** Tap it for All areas, each area, and No area yet.
13. **Filter.** Pick a type and its collections (Photos › Site visits…). Then All · Unsorted · ★ Picks, Topic, and the type's own filter: Status, Style, Colour, More. Scroll down and the filters fold away; scroll up and they come back.
14. **Search.** Type in the bar and the wall filters as you type. Focused and empty, the bar lists your saved Views.
15. **Display.** Wall or Shelves; for photos, Rows, Masonry or Grid; size, sort and captions.
16. **Open things.**
    - A photo opens in the viewer: swipe between photos, swipe down to close, double-tap or pinch, **Info**.
    - On To read, open the PDF for its reading room.
    - Notes, books, videos and links open as sheets with **Explain…**.
17. **Select** and **hold a card.**
    - Select puts the selection bar at the foot.
    - Holding a card opens the card menu.
    - Collections has a new-collection sheet and collection pages.

## How it's built

| File | What it is |
|---|---|
| `src/app.html` | The phone app's page: the top bar, stage, dock, sheets, drawer and player |
| `src/app.css` | The shell, bar, card, drawer, menus, sheets and player. Every colour, shadow and duration is an app token (`src/styles/tokens.css`, carried on `.loci-appmap` by `../boards/loci/appmap.css`) |
| `src/app.js` | The shell and Loci: state, the bar and its modes, the card, gestures, the simulated Loci, making a Lumen. It exposes `window.MP` to the pages and lets a page or room drive the bar |
| `src/learn.js`, `src/learn.css` | Learn: Home, Lumens, Courses, the make panel, a Lumen's room (Watch, Listen, Read, Live, Walk, Drive) and the course room, and the player clock and mini player |
| `src/commonplace.js`, `src/commonplace.css` | Commonplace: the header, the wall's card faces, Rows and Grid, Shelves, collections, To read, Templates, Select, Display, and the viewers |
| `src/data.js` | One learner: the app's specimen map (`../live-lumens/capture/graph.json`) with the Commonplace prototype's topics added where they belong, its 45 entries and 9 collections, five Lumens with slides, chapters and sections, two courses, a live session and goals |
| `src/frame.html` | The wrapper: full screen on a phone, a framed phone and guide on a desktop |
| `img/` | The Commonplace prototype's 32 pictures, resized to 320 px. `build.mjs` also inlines their size, lightness and palette from `../commonplace-photos/gen/meta.json` (for Shape, Light and Colour) |
| `build.mjs` | Inlines everything into `dist/mobile-loci-prototype.html` |

**The Palace and the Map are Studiolo's own engines.** They are the `PalaceEngine` and `GraphMap` bundles from `../boards/loci` (main @ `6f8d396`; see its README), unchanged. The prototype adds the proposed phone rules on top, from outside the engines:
- `engine.pick` is wrapped so the nearest mark within 22 px counts (a 44 pt target);
- `engine.frameOf` is wrapped so topics open at 0.42× the distance and areas at 0.72×;
- a hold (or a right-click) opens the context menu;
- a two-finger tap goes back;
- the Map gets the topics of the open area only, so the whole-map level shows areas alone.

**The mic** is Learn's dictation module (`../learn-lumens/src/dictation.js`), unchanged. It uses the browser's speech recognition where it's allowed and falls back to a simulation, which it says when it does.

## Rebuild

```sh
node build.mjs
```

## Limits

- Loci's answers are simulated: open, suggest or add, make a Lumen, set a status, and a generic reply.
- Nothing is saved; a reload starts again.
- The Map has no hold menu yet.
- Lumens play on a clock (no sound or video); slides are one drawing; PDF pages are shapes.
- Photo, file, rename and move only say what they would do.
