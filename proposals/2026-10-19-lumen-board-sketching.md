# Investigation: board slides for Lumen (sketching on a whiteboard)

Status: investigation and working prototype, for the owner's decision · 19 Oct 2026

Prototype: [`prototypes/lumen-board/index.html`](../prototypes/lumen-board/index.html) (open it in a browser; it also runs as a claude.ai artifact, where "Sketch with Claude" works).

## 1. Summary

A **board** is a new kind of Lumen slide. A rough, coloured sketch is drawn on a whiteboard while the voice explains it, the way a person explains an idea at a whiteboard. Boxes, arrows, circles, handwritten labels, underlines and highlights appear **as the voice says the word that names them**. No pen or hand is shown: a small dot of ink moves along each stroke as it is drawn. When the narration comes back to something already drawn, the dot goes back and pulses on it.

The prototype shows this works with the pipeline Lumen already has:

- The author model (Claude) writes a board as **data, not code**: one line per mark, such as `cache box 540 420 200 110 emphasis hatch "Cache"`.
- Narration uses the refs Lumen already has (`[[b1.cache]]` before a word) to say when each mark is drawn.
- Word timings come from ElevenLabs `with-timestamps`, which `studiolo` already calls (`src/features/explainers/speech/elevenlabs.ts`).
- Every frame is a pure function of the time `t`, like today's animation scenes. Seeking, stills, thumbnails, reduced motion and any later video export all work the same way.

**Recommendation.** Add `board` as an item type in contract 1.5, using the prototype's renderer as the starting point. Leave whiteboard libraries such as tldraw and Excalidraw out of the player. Use a small in-house renderer (about 700 lines) with two MIT/OFL pieces: perfect-freehand for marker strokes, and the EMS Tech single-line font for handwriting. Estimated effort: about 6–9 days (§8).

## 2. Where it fits in today's Lumen

References are to `studiolo` @ `c7d39da` (read only; nothing there was changed).

| Today | Board slide |
|---|---|
| Item types: intro, ul/ol, cards, table, code, diff, math, `diagram` (Mermaid), infographic, `animation` (JS scene) (`src/features/explainers/ingest/items.ts`) | Adds `board`. Its body is a header, `---`, then one mark per line. It is plain data with no code, so nothing has to run in the QuickJS sandbox. |
| A ref `[[s5.rise]]` pins an animation moment to a word and moves the pointer (`contract/text.ts` §4, `player/timeline.ts` `pointerTarget`) | The same syntax. The first ref to a mark starts drawing it; a later ref sends the drawing dot back to point at it. |
| The pointer moves to an anchor `leadWords` ahead of the voice (`player/stage/pointer.tsx`) | On a board slide the drawing dot *is* the pointer. It draws, fades when the board is quiet, and comes back to pulse on a mark the voice names again. |
| An animation scene is `draw(s, t, k)`, a pure function of t (`scene/runtime.ts`) | A board is also a pure function of t: `marks + schedule → frame(t)`. |
| Diagram slides are Mermaid, and the contract says "never imitate a drawing with a diagram" | Boards cover the space between the two: an explained sketch with spatial layout and annotation, with no code for the author to write. |
| Role colours: emphasis, second, third, fourth, neutral, ink (`scene/role-palette.ts`) | The same role names, so the contract's "roles" legend line and colour rules carry over. The prototype also has whiteboard, chalk and Studiolo-paper palettes. |
| ElevenLabs with-timestamps gives word timings, with estimated timings as the fallback (`speech/elevenlabs.ts`, `speech-estimate.ts`) | The prototype estimates timings at 160 wpm. In the app the real word timings slot straight in (§6). |

### When to use a board versus a diagram or an animation (proposed contract wording)

- **Board**: an idea explained by building a picture one piece at a time, such as a mechanism, a cause and its effect, a before/after, a worked sketch or an annotated graph. The value is in the order of the build and in pointing back at parts.
- **Diagram**: a flow, hierarchy or state machine whose shape matters more than the order it is built in.
- **Animation**: motion over time, or a precise spatial or 3D drawing.

## 3. Research findings

Versions and licences were checked on npm on 19 Oct 2026. A few vendor sites could not be fetched from the sandbox; those points come from search summaries and are marked "(via search)".

### 3.1 Drawing the hand-drawn look

| Option | Licence | Verdict |
|---|---|---|
| **perfect-freehand** 1.2.x | MIT | **Used.** Turns a centreline into a pressure-shaped marker outline. 3.7 KB, no dependencies. |
| **rough.js** 4.6.6 | MIT | Good alternative for sketchy shapes and hachure fills (Excalidraw uses it). It draws whole shapes, so for progressive pen drawing we would still need its path data. The prototype's own wobble functions do the same job in about 100 lines. |
| **rough-notation** 0.5.1 | MIT | Underline, box, circle, highlight, strike and bracket annotations. A good reference; the prototype has the same set built in. |
| **Excalidraw** 0.18.x (+ `convertToExcalidrawElements`, `@excalidraw/mermaid-to-excalidraw`) | MIT | A full editor. Worth it later if learners should *edit* a board (§9). Too heavy for playback. |
| **excalidraw-animate** (dai-shi) | npm lists no licence | A reference for "scene → stroke reveal". Don't depend on it. |
| **tldraw** 5.x | Own licence; production needs a key; the commercial licence removes the watermark (via search) | **Avoid.** Licence cost, and it is an editor rather than a player. |
| GSAP + DrawSVG | Free, but the standard licence restricts no-code visual animation builders (via search) | Avoid until legal has looked at it. It isn't needed. |
| Vivus, anime.js v4 | MIT | SVG dash-offset reveal. Not needed with a canvas renderer. |
| Rive / Lottie | MIT runtimes | A poor fit, because every asset must be hand-authored. |

### 3.2 Handwriting the labels

To *write* text stroke by stroke you need **single-line fonts**, whose glyphs are pen paths rather than filled outlines.

- **EMS Tech** (Hershey/EMS set in the `hersheytext` npm package, MIT; the font itself is SIL OFL). It is a single-line version of *Architects Daughter*, an architect's hand, which suits Studiolo's audience. **Used in the prototype**: 95 ASCII glyphs, about 10 KB of stroke data.
- **Tegaki** (kurtgokhan/tegaki, MIT): stroke-by-stroke handwriting from *any* font, with harfbuzz shaping, so Arabic and right-to-left text work. It is the upgrade path if Lumen needs non-Latin labels.
- **Relief SingleLine** (OFL): a cleaner technical-pen style.
- Fallback approach: a handwriting outline font (Caveat, Kalam, Excalifont) revealed with a left-to-right wipe. It is cheaper but looks less like real writing.

### 3.3 Getting an LLM to produce diagrams

- The most reliable pattern is **structured data with coordinates** (a DSL or Excalidraw skeleton JSON) that a renderer checks and draws. Asking the model for raw SVG tends to break the layout. Asking it for code is what animation scenes already do, at the cost of the sandbox and repair loops.
- Prior art: Excalidraw's AI diagrams go through Mermaid; `cristianodabc/narrated-explainers` (MIT) has the LLM write a story JSON that is rendered to SVG and video. Its "data only, never code" rule is the right security model for boards as well.
- No academic paper turned up on LLM-generated whiteboard explainers specifically.

### 3.4 Syncing to the voice

- ElevenLabs `POST /v1/text-to-speech/{voice}/with-timestamps` returns per-character times. Studiolo already turns these into word timings (`alignmentToWords`). `POST /v1/forced-alignment` exists for audio made elsewhere.
- The pattern: strip the `[[…]]` refs before speech, keep their character offsets, map each offset to a word's start time, then schedule the drawing from those times. Drive the frame from the audio clock, never from timers.

### 3.5 Existing skills and MCP servers

- `excalidraw/excalidraw-mcp` (official, MIT): Claude draws Excalidraw diagrams in chat.
- `yctimlin/mcp_excalidraw`: an MCP server for a live canvas, plus a Claude Code skill.
- Excalidraw diagram skills: `coleam00/excalidraw-diagram-skill` (renders with Playwright so the agent can check its own drawing), `garrytan/gstack` *diagram* (recommends at most 15 nodes per scene), `axtonliu/excalidraw-diagram`, and awesome-copilot's *excalidraw-diagram-generator*.
- `anthropics/skills` has no whiteboard or Excalidraw skill. The user's claude.ai skill catalogue returned nothing for whiteboard, Excalidraw, sketch or tldraw.
- None of these produce *narrated, time-synced* drawing. They are useful as references for prompting and for the self-check loop.

### 3.6 Exporting video (if Lumens are ever downloaded as MP4)

- **Remotion** 4.x renders React frames as a pure function of the frame number. It fits a board component directly. Free for teams of up to 3; company licence above that (via search).
- Free alternative: headless Chromium with a virtual clock (puppeteer-capture), then FFmpeg to mux in the narration MP3.
- Motion Canvas (MIT) works but would be a second rendering stack.

## 4. The prototype

`prototypes/lumen-board/index.html` is a single page with no build step. It loads perfect-freehand from jsDelivr and falls back to plain round strokes if that fails; the font data is inline.

What it does:

- **Four example boards**: a cache (software), a load path (architecture), compound growth (finance), and a two-board request/response that shows the eraser wipe between boards.
- **Script editor**: edit the board source and press Draw. A problems list shows parse errors, unknown refs, marks outside the drawing area and overlapping shapes. These play the same role as the scene checks in `scene/checks/`.
- **Sketch with Claude**: in claude.ai, the page asks Claude to write a board for any idea, streams the script into the editor and draws it. The prompt is the `SPEC` constant in the page, which is a first draft of the contract section.
- **Player**: play/pause, scrubbing, board ticks on the scrubber, speed control, captions with the current word underlined, a colour legend from the `roles:` line, and whiteboard, chalk and Studiolo-paper styles.
- **Read aloud** uses the browser's own voice. The clock re-syncs on word-boundary events and waits for the voice at the end of each say. This is only a stand-in for ElevenLabs audio.
- Reduced motion shows finished marks with no drawing dot; keyboard controls are Space and ← →.

### 4.1 The board format (draft)

```text
<item id="b1" type="board" title="Why a cache makes reads fast">
roles: fourth = the slow trip; third = the fast trip
---
app    box 120 250 200 110 ink "App"
db     cyl 960 220 200 170 ink "Database"
slow   arrow app db fourth bend 0.22 "every read: ~80 ms"
cache  box 540 420 200 110 emphasis hatch "Cache"
check  arrow app cache emphasis "ask first"
hit    ring cache third
</item>
<say>Suppose your [[b1.app]]app needs the same record again and again. Each time it goes to the [[b1.db]]database, and that [[b1.slow]]round trip costs around eighty milliseconds.</say>
<say>So we put a small, fast store in between: a [[b1.cache]]cache. Now the app [[b1.check]]asks the cache first, and every later read is a [[b1.hit]]hit.</say>
```

- **Shapes**: box, circle, ellipse, diamond, cyl, person, text, arrow, line, curve, axes, ground.
- **Annotations**: underline, ring, highlight, cross, tick.
- **Options**: a colour role; `hatch`, `dash`, `arrow`, `bend n`, `small`, `big`, `title`, `size n`, `center`; a quoted label.
- **Positions**: on the 1280 × 720 stage, inside the safe area x 64–1216, y 64–600. These are the same numbers as the scene contract.
- **Arrow ends**: an id or a point. An arrow between two marks attaches to their outlines automatically.

### 4.2 How a frame is made

1. **Parse** the source into mark specs. Ids must be declared before they are referenced, the same rule as refs.
2. **Build** each mark's centrelines. The wobble is seeded from `boardId:markId`, so a mark looks the same on every render. Labels are written with the single-line font, and each mark records its box, outline, anchor and stroke lengths.
3. **Time the words.** The prototype estimates them; the app will use measured timings. A ref's time is the start of its word.
4. **Schedule the drawing.**
   - A mark starts 140 ms before its word. A mark with no ref follows the mark declared before it, and a mark never starts before the marks it connects.
   - Drawing time comes from stroke length divided by drawing speed: shapes about 900 px/s, handwriting 560 px/s, hatching 2,400 px/s. It is squeezed to as little as 40% when the next cue is close.
   - The dot travels between marks at about 1,900 px/s, plus small lifts between strokes.
   - A later ref to a mark already drawn becomes a "point" event when the dot is free.
5. **Draw at t.** Finished strokes are cached as `Path2D` and only the stroke in progress is recomputed each frame. Then the drawing dot is drawn in the ink's colour. It glows while drawing, is smaller and dimmer while moving between marks, pulses when pointing, and fades out about a second after the board goes quiet. No pen, hand or eraser is shown. Between boards a soft wipe clears the old board and leaves a faint ghost, the way a real whiteboard does.

### 4.3 How it was checked

- The page was rendered in headless Chromium for all four examples, at 15%, 40% and 99% of their length, in the whiteboard and chalk styles and at 420 px width.
- There were no console errors, all examples report "No problems found", and the page has no horizontal scroll at phone width.
- Screenshots from that run were used to adjust label placement, text size and the layout of the examples.
- **Not yet tried**: how reliably Claude follows the format. "Sketch with Claude" is wired up, but nobody has run a set of topics through it yet (§7).

## 5. Limits of the prototype

- Narration timing is estimated; the browser voice is a stand-in for ElevenLabs.
- The handwriting covers ASCII only (EMS Tech): no Arabic or other scripts. Tegaki is the route to them.
- Layout is entirely the author's coordinates. There is no auto-layout, so a careless board can overlap. The checker warns about overlaps but doesn't fix them.
- Hatching is only clean on convex shapes: box, circle, ellipse, diamond and the body of a cylinder.
- There is no undo, no learner editing, and no MP4 export.

## 6. Proposed integration into `studiolo` (for whoever works on the main app)

1. **Contract 1.5** (`contract/text.ts`, `examples.ts`, `CONTRACT_VERSION`):
   - Add the board type and the "when to use a board" rule (§2).
   - Add the shape and option list (adapted from the prototype's `SPEC`) and one worked example.
   - Add limits: at most 16 marks, labels of at most 4 words, at most 3 colours.
2. **Ingest** (`ingest/items.ts`): parse the board body into a `BoardPayload { title, roles, marks[] }` using the prototype's parser. Each mark id is an anchor, so existing ref validation covers `[[b1.cache]]`.
3. **Checks** (`scene/checks/`):
   - Reuse the prototype's out-of-area and overlap checks, and add label-on-line and label-overlap checks.
   - Failures go through the existing repair path. Because a board is data, a repair is a cheap rewrite of the item, and nothing needs the sandbox.
4. **Player** (`player/stage/board-slide.tsx`):
   - A canvas slide like `animation-slide.tsx`, fed `slideTime` from the timeline.
   - It builds its schedule from the say segments' measured `words` and `refs`, so it needs nothing new from speech.
   - On board slides, hide the DOM pointer and draw the drawing dot instead. Stills and thumbnails are `frame(Infinity)`.
5. **Brand**:
   - Map roles to the existing role palette, giving light and dark themes for free. Decide whether "whiteboard" and "chalk" are styles a learner can pick or only internal options.
   - Add the EMS Tech glyphs, or a Tegaki-built font, to the brand kit.
6. **Evals**: run 20–30 topics through the author model with the new contract and score layout problems, ref coverage and the pacing of narration against drawing.

## 7. Open questions for the owner

1. Should a board be its **own slide type** (proposed), or a style on top of the existing `diagram` type?
2. **Look**: true whiteboard (white and aluminium), chalkboard, or Studiolo paper with marker ink? The prototype lets you compare all three.
3. ~~**Pen**: a visible marker or a hand?~~ Decided 19 Oct 2026: no pen or hand. Only a small ink dot shows where the drawing is happening.
4. **Handwriting**: is EMS Tech (Architects Daughter) the right voice for Studiolo? Are non-Latin labels needed soon (then Tegaki)?
5. **Learner editing**: should a learner be able to open a board and change it? That points to Excalidraw (MIT) as the editor, with this renderer kept for playback.
6. **Eval budget**: about 30 author runs to tune the contract text before release.

## 8. Rough effort

These are estimates, not measured.

| Part | Days |
|---|---|
| Contract text, examples and the version bump | 1 |
| Ingest parser, payload type and ref validation (port from the prototype) | 1–1.5 |
| Board slide renderer and drawing dot in the player (port from the prototype, React and theming) | 2–3 |
| Checks and repair messages | 1 |
| Author evals and tuning | 1–2 |
| **Total** | **6–9** |

## Sources

- `studiolo` @ `c7d39da` (read only):
  - `src/features/explainers/contract/text.ts`
  - `src/features/explainers/ingest/items.ts`
  - `src/features/explainers/player/timeline.ts`
  - `src/features/explainers/player/stage/{animation-slide,pointer}.tsx`
  - `src/features/explainers/scene/{runtime,role-palette}.ts`
  - `src/features/explainers/speech/elevenlabs.ts`
  - `src/styles/tokens.css`
- Craft, Studilo space: a search for "whiteboard" and "sketch" found no earlier notes on this idea (19 Oct 2026).
- Libraries:
  - rough.js: https://github.com/rough-stuff/rough
  - rough-notation: https://github.com/rough-stuff/rough-notation
  - perfect-freehand: https://github.com/steveruizok/perfect-freehand
  - roughViz: https://github.com/jwilber/roughViz
  - Vara: https://github.com/akzhy/Vara
  - anime.js drawable: https://animejs.com/documentation/svg/createdrawable
- Excalidraw:
  - Element skeleton: https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/excalidraw-element-skeleton
  - Mermaid to Excalidraw: https://docs.excalidraw.com/docs/@excalidraw/mermaid-to-excalidraw/installation
  - Excalifont: https://plus.excalidraw.com/excalifont
  - excalidraw-animate: https://github.com/dai-shi/excalidraw-animate
- tldraw licence: https://tldraw.dev/legal/tldraw-license and https://tldraw.dev/sdk-features/license-key
- GSAP licence: https://gsap.com/community/standard-license/ and https://webflow.com/updates/gsap-becomes-free
- Handwriting and fonts:
  - Tegaki: https://github.com/kurtgokhan/tegaki
  - Relief SingleLine: https://github.com/isdat-type/Relief-SingleLine
  - hersheytext: https://npmjs.com/package/hersheytext
  - EMS fonts: https://www.evilmadscientist.com/tag/hershey/
- ElevenLabs:
  - With-timestamps: https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps
  - Forced alignment: https://elevenlabs.io/docs/capabilities/forced-alignment
- Prior art:
  - https://github.com/cristianodabc/narrated-explainers
  - https://smcleod.net/2024/10/generating-diagrams-with-with-ai-/-llms/
  - https://tldraw.dev/blog/make-real-the-story-so-far
- MCP servers and skills:
  - https://github.com/excalidraw/excalidraw-mcp
  - https://mcpservers.org/fr/servers/yctimlin/mcp_excalidraw
  - https://www.mintlify.com/coleam00/excalidraw-diagram-skill/installation
  - https://hackernoon.com/skills/garrytan-diagram
  - https://github.com/anthropics/skills/tree/main/skills
- Video export:
  - Remotion pricing: https://www.remotion.dev/docs/license/pricing
  - Motion Canvas: https://github.com/motion-canvas/motion-canvas
  - puppeteer-capture: https://cdn.jsdelivr.net/npm/puppeteer-capture@1.58.0/README.md
