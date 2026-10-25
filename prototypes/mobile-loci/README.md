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

1. **The drawer.** Swipe from the left edge, or tap ☰. You get Today, Learn, Commonplace and Loci, then the places and Lumens you opened last.
2. **Go down without hunting for dots.** In the card, tap a chip: Environment & Services, then **Daylight & shading**. The Palace flies close enough to read its sub-topics.
3. **Add sub-topics.** Tap **＋ Sub-topic**.
   - Type a name and press Return, as many times as you like.
   - Or tap one of Loci's dashed suggestions above the bar.
   - A draft mark waits beside the parent; each new topic lands where it was, with Undo.
   - Tap **Done** when you're finished.
4. **Let Loci draft them.** On a topic with none, tap **✦ Suggest sub-topics**. Dashed marks appear on the Palace and dashed chips on the card; tap **Keep all**, or tap one to keep or dismiss it.
5. **Hold a mark** on the Palace. Its menu has open, add, make a Lumen, ask, the three statuses, rename, move and delete.
6. **Make a Lumen.** Tap **✦ Lumen**, pick Watch, Listen or Read, edit or dictate the question, and tap **Make Lumen**.
   - It's made on the card while you keep exploring.
   - When it's ready, tap **Play**.
   - Swipe the player down: it docks above the bar and keeps playing across destinations.
7. **The mic.** Tap it to dictate: the words go into the field to edit. Or hold it to talk: letting go sends. Try "suggest sub-topics", "open passive design", "make me a Listen about this" or "what should I learn next?".
8. **Type in the bar.** Places come first, then "Ask Loci". Loci's reply floats above the bar; **Thread** opens the one conversation, with "Now in …" dividers.
9. **Move around.** Drag the card's top to peek, card or full. **‹** goes back; hold it for the trail. On a phone, a two-finger tap or a pinch out also goes back.
10. **Switch views.** Use the title for **Palace · Map · List**. The Map shows areas only until you open one.
11. **Capture.** ＋ → **Write a note** files a note in Commonplace on whatever is open.

## How it's built

| File | What it is |
|---|---|
| `src/app.html` | The phone app's page: the top bar, stage, dock, sheets, drawer and player |
| `src/app.css` | The shell, bar, card, drawer, menus, sheets and player. Every colour, shadow and duration is an app token (`src/styles/tokens.css`, carried on `.loci-appmap` by `../boards/loci/appmap.css`) |
| `src/app.js` | State, the bar and its modes, the card, gestures, the simulated Loci, Lumens and the player |
| `src/data.js` | The app's specimen map (18 areas, 104 topics; `../live-lumens/capture/graph.json`) with the Palace specimen's statuses and My Focus, plus sample Commonplace items and Lumens |
| `src/frame.html` | The wrapper: full screen on a phone, a framed phone and guide on a desktop |
| `img/` | Ten small pictures from `../commonplace-photos/img`, resized to 240 px |
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
- Photo, file, rename and move only say what they would do.
