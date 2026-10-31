# Studiolo on iPad

An iPad prototype of the whole app. It is the phone prototype's idea given room:
- **The sidebar:** Today, Learn, Commonplace and Loci, with Learn's sections, your collections and Loci's areas inside. Docked in landscape; over the content in portrait.
- **The bar:** still the one field to ask, find, make, search and dictate, centred at the foot of the content column, with the mic on every destination, ⌘K and a held ⌘⇧D.
- **The inspector:** in Loci, whatever is open floats on the right in landscape (resizable, its size remembered) and is a sheet in portrait.
- **Rooms in two panes, and playback that survives navigation:** Watch leaves as picture in picture, Listen as Now Playing.

Design: [`docs/superpowers/specs/2026-10-31-ipad-experience-design.md`](../../docs/superpowers/specs/2026-10-31-ipad-experience-design.md). Build plan: [`docs/superpowers/plans/2026-10-31-ipad-build-plan.md`](../../docs/superpowers/plans/2026-10-31-ipad-build-plan.md).

Open `dist/ipad-prototype.html`:
- **On an iPad** (or any touch device) it runs full screen. Add it to the Home Screen for the ⌘ keys Safari otherwise keeps.
- **On a desktop** it shows an iPad in a frame. Choose the iPad (Air 11″, Pro 13″, mini), the orientation, the window (Full screen, Split ⅔, Split ½, Stage Manager, Slide Over) and the look. In Split View, drag the divider across 700 px. `?frame=0` forces full screen; `?frame=1` forces the frame.

## Try it

**The shell**
1. **Sidebar.** In landscape it is docked. Hide it with its button; bring it back from the toolbar. Turn to portrait: it hides, and opens from the toolbar or a swipe from the left edge.
2. **Window.** Choose Split ½ or Slide Over: Studiolo goes compact and is the phone shell, at the same place, with the same card, still playing. Drag the divider back past 700 px.

**The bar and voice**
3. Press **⌘K** (or **Ctrl K**), type *Passive design*, press Return. The bar finds and opens it.
4. **The mic:** tap to dictate; hold to talk, and let go to send. **Hold ⌘⇧D** (Ctrl ⇧ D) to talk from the keyboard.
5. **Hold ⌘** (or press ⌘/ or Ctrl /) for the shortcuts.

**Loci**
6. **The inspector.** Drag its foot down for more, up for less; drag its left edge to widen it. Open another place: it keeps the size. Turn to portrait: it is a sheet.
7. **Touch.** Hold a mark (right-click with a mouse) for its menu. Two fingers: pinch, **twist to turn**, tap to go back.
8. **List** in the toolbar: columns, as in Files.

**Learn**
9. **Listen.** Open *Cooling without machines*: the hosts on the left, chapters and the transcript on the right. Try Walk and Drive, then Read (its section list sits on the left).
10. **Now Playing.** Leave the room while it plays: in landscape it is in the sidebar's foot, in portrait above the bar.
11. **Picture in picture.** Open *How a malqaf moves air* (Watch), then leave: the slide keeps playing in a corner. Drag it to another corner. The stage's picture-in-picture button asks the browser for the real thing.
12. **Live.** Tap ● Live, then hold the mic to interrupt.
13. **A course.** Courses → **Continue**: the stage beside Reading, Up next and the Parts sheet.

**Commonplace**
14. A wall of three or four columns. Open a note or a link in landscape: it opens beside the wall; tap another card to switch.
15. A photo opens full screen with **Info** beside it.
16. **Drag and drop.** Choose Split ½; drag a picture or the link from the page on the left into Studiolo. It lands in your Commonplace, on what you have open.

## How it's built

The phone prototype's modules run **unchanged**, so a compact window is exactly the phone shell. This folder adds an iPad layer that moves and decorates what they draw.

| File | What it is |
|---|---|
| `src/app.html` | The page: the phone app's parts, plus the sidebar, the inspector, the picture-in-picture tile, the drop overlay and the shortcuts panel |
| `src/ipad-pre.js` | Runs before the phone modules. Wraps Studiolo's `PalaceEngine` and `GraphMap` so they frame what is open left of the inspector (the engines' own `panel: "side"` cover and `coveredRight`) |
| `src/ipad.js` | The iPad layer: size classes, the sidebar, the toolbar's view switch, the inspector and its drags, the List's columns, two-pane rooms, Now Playing and picture in picture, the Commonplace split, the keyboard and its shortcuts panel, the twist, and drag and drop |
| `src/ipad.css` | Everything above, scoped to `#app.ip-regular` (700 px and up), plus the iPad status bar in the frame |
| `src/frame.html` | The desktop frame: the device, orientation, window and look controls, the other app for Split View, and the guide |
| `build.mjs` | Inlines everything into `dist/ipad-prototype.html` (and `dist/artifact.html`) |
| `check.cjs` | The Playwright check (below) |

**Reused, not copied:**
- `../mobile-loci/src/` (`data.js`, `app.js`, `learn.js`, `commonplace.js` and their CSS) and `../mobile-loci/img/`;
- `../boards/loci/` (the `PalaceEngine` and `GraphMap` bundles from `studiolo`, unchanged);
- `../learn-lumens/src/dictation.js` (the browser's speech recognition, or a simulation);
- `../live-lumens/capture/graph.json` and `../commonplace-photos/gen/meta.json`.

**One patch:** `build.mjs` widens what the phone shell exports on `window.MP` (`setDetent`, `targetHeight`, `goBack`, `goHome`, `submitBar` and a few more), asserting the anchor so a change to `app.js` fails the build loudly.

**Size classes:** compact under 700 px; regular from 700 px; wide from 1000 px in landscape. The app will key on a coarse pointer too (spec §4.1); the prototype keys on width only, so a desktop can show it.

## Rebuild and check

```sh
node build.mjs
NODE_PATH=<a node_modules with playwright> node check.cjs [outdir] [sizes]
```

`check.cjs` loads the built file at the iPad sizes in both orientations (Air, Pro 13″, mini), the window widths 981, 694, 507 and 320, and a phone, in light and dark. At each it checks the size class, the mic's size, no console errors and no horizontal scroll, then walks Loci (a topic, List, Map), Learn (Listen, Read, leaving it playing, Watch and picture in picture, a course), Commonplace (the wall, an item, a photo) and the shortcuts panel. In Air landscape and portrait it also drives the sidebar, the inspector's drags, ⌘K and Return, the mic and hold-to-talk. Screenshots go to `outdir`.

## Limits

- Loci's answers, making a Lumen and playback are simulated (no sound or video), as in the phone prototype. Nothing is saved, except the sidebar, inspector and tile positions and the card heights, kept in this browser.
- ↑/↓ through the bar's rows, ⌘-click and Shift-click selection, the two-finger selection drag, dragging out of Studiolo, Media Session and Pencil hover are in the spec, not here.
- Today and Settings are the phone prototype's simple pages.
- The system's picture in picture uses a canvas stream; it works in Chromium and is untested on iPad Safari. The in-app tile always works.
- Not yet tried on a real iPad.
