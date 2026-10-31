MEDIUM per phase (feature code behind a new switch, no migration, no AI input or spend change, no public page). Any phase that finds it needs one of those becomes HIGH and stops (§1.3).

# Studiolo on iPad: the build plan, in phases, for an unattended overnight run

**For:** the AI agent that builds this in `studiolo`, overnight and alone. It reads this whole file before starting.
**Status:** Plan for building. Claude, 31 October 2026. The design is proposed; **build only after the owner has agreed the design** (their kickoff message, §7, says so). The owner has **not** authorized any merge.
**Base:** `studiolo` `origin/main` @ `0f6bd765` (the dictation merge). If `origin/main` has moved, start from the new tip and note it in the report.

**What to build:** [`docs/superpowers/specs/2026-10-31-ipad-experience-design.md`](../specs/2026-10-31-ipad-experience-design.md), the **spec**, in this repo (`Studiolo_Manage`).
- §-numbers below without a file name refer to the spec.
- The spec wins on what it looks like and how it behaves.
- This plan wins on order, scope, branches and rules.
- `studiolo`'s `AGENTS.md` wins over both.

**What it looks like:**
- The interactive prototype: `Studiolo_Manage/prototypes/ipad/dist/ipad-prototype.html` (the owner may also give a claude.ai link to it). Open it in a desktop browser: it shows an iPad frame with the device, orientation and window choices.
- Its source: `Studiolo_Manage/prototypes/ipad/`, with `src/ipad.js`, `src/ipad.css`, `src/ipad-pre.js`, `src/frame.html` and a `README.md` with a "Try it" list. It runs the phone prototype's modules (`prototypes/mobile-loci/src/`) unchanged, with the iPad layer over them.
- **The prototype is a reference, not code to copy.** It is vanilla JS that moves and decorates the phone prototype's DOM. Rebuild each behaviour with the app's own components, state and actions.
- When the spec and the prototype disagree, the spec wins; record the difference in the report.

---

## 0. How to run this plan unattended

1. **Read first, in this order:**
   1. `studiolo/AGENTS.md`, then `project-docs/README.md` and `project-docs/workflow/README.md` (the tiers and the merge rules);
   2. the spec, all of it;
   3. this plan;
   4. the phone spec (`…/specs/2026-10-25-phone-control-bar-and-loci-design.md`) §4–§9 and the 20 % audit (`…/specs/2026-10-29-phone-next-20-percent.md`), because the iPad reuses the phone shell;
   5. the prototype's `README.md`;
   6. then, per phase, the files that phase's **Read first** names.
2. **Do the phases in order: T0 → T1 → … → T9.**
   - Each phase is one branch, cut from the previous phase's branch (stacked), because nothing reaches `main` tonight.
   - **Branch names:** `ipad/t0-switch`, `ipad/t1-shell`, `ipad/t2-voice-keys`, `ipad/t3-loci`, `ipad/t4-list`, `ipad/t5-learn`, `ipad/t6-playback`, `ipad/t7-commonplace`, `ipad/t8-pages`, `ipad/t9-gate`.
3. **Each phase ends with:**
   - Verify's steps green (§1.4);
   - the phase's acceptance list checked;
   - its evidence saved (§1.5);
   - its guides updated (§1.6);
   - one or more commits;
   - the branch pushed (only with the owner's kickoff permission, §7);
   - its section of the report written (§6).

   Then start the next phase.
4. **Time boxes:** each phase has one. If a phase runs past **1.5× its box**:
   - stop adding to it;
   - make what you have green and committed;
   - mark the rest **Not done** in the report, with what remains;
   - move on, if the next phase can stand on what's there (the dependency column in §2).
5. **Never start a phase you can't finish in the time left.** Write its "ready to start" notes in the report instead: the files read, the approach, the first steps.
6. **When you're blocked** (§1.3), don't guess and don't widen scope. Write **BLOCKED** with the reason and the exact question for the owner. Then do the next phase that doesn't depend on the blocked one, or stop.
7. **When something is ambiguous**, take the spec's behaviour; if the spec is silent, the prototype's. Record the call under **Calls I made** in the report. Never reopen a decision listed in §5.

## 1. Rules for the whole night

### 1.1 Safety

- **No merge into `main` and no push of `main`. No force-push, no history rewrite, no deleting branches.**
- **Push only `ipad/*` branches, and only if the owner's kickoff message says so (§7).** Otherwise keep the branches local and say so in the report. A pushed branch may get a Vercel preview build; that's expected and changes nothing live.
- **No database migration, no `drizzle/` change, no backfill.** If a phase seems to need one, it's BLOCKED.
- **No new npm dependency, and no app-wide header change.**
- **No AI change:** no prompt, tool, model, context or spend change.
  - These goldens must not change: `tests/fixtures/copilot-turn-input-golden.json` and `tests/fixtures/explainer-job-input-golden.json`.
  - Run their tests on the base and at the end of every phase that touches the bar or Loci's chat (T1, T2, T3).
- **No dictation engine change.** T2 only mounts the existing engine on tablets; `features/dictation/*` stays as it is. The token route, the engine choice (`DICTATION`, `DICTATION_TESTERS`) and usage limits are untouched.
- **No hosted settings:** no Vercel env, Neon or R2 change, and no credentials. You only *list* the env values the owner should set (§6).
- **Kill processes only by exact PID.** Restore `tsconfig.json` and `next-env.d.ts` after any e2e, build or dev run, as the earlier plans do.

### 1.2 Scope guards

- **Everything is behind one new switch, `IPAD_SHELL`**, shaped like the others: `off | testers | all`, with `IPAD_SHELL_TESTERS` a comma-separated list of account ids.
- **Where the iPad layout applies:** the switch is on for the account **and** `TABLET = "(min-width: 700px) and (pointer: coarse)"` matches. "Wide" adds `(min-width: 1000px) and (orientation: landscape)` (spec §4.1).
- **Three things must stay pixel-identical to the base, and each phase proves it (§1.5):**
  1. **Phones and compact windows** (under 700 px), switch on or off: the phone shell exactly.
  2. **Desktop** at 1100 px and wider with a fine pointer, switch on or off. (The prototype shows the iPad layout on a desktop only because it keys on width; the app keys on the pointer.)
  3. **Tablets with the switch off**: today's tablet layout (the 72 px rail).
- **The surfaces' own switches still apply:** `CP_HEADER`, `PHOTO_VIEWER`, `LEARN_HOME`, `LEARN_READ`, `PALACE`, `DICTATION`, `seesCopilot`. Never show a feature its switch hides.
- **Build only on data that exists.**
  - **Watch and Read are real.** Their rooms get the two-pane layout.
  - **Listen is not built in the app.** It stays as the app shows it today: disabled and marked **Soon**. Don't fake chapters, hosts or audio. The Now Playing host (T6) carries a Watch Lumen's narration and a course part, and is shaped so Listen drops in later.
  - **Live, Walk, Drive, drive editions, marks and recall are not built.** Leave them out of the UI.
- **Reuse the phone shell; don't fork it.** The bar, the dock, the place card, the mini player and the make sheet are the phone's components, given a tablet layout through the size class. A tablet copy of a phone component is a BLOCKED design note, not code.
- **Vocabulary on screen:** say "Loci", "your Commonplace", "Lumen", "course". Never "graph", "library", "copilot" or "explainer" (code names stay in code).
- **Keep files small:** `npm run lint:size` stays green. New behaviour goes in **new focused files** under `src/components/tablet/`, not into `graph-workspace.tsx`, `palace-workspace.tsx`, `palace-engine.ts`, `loci-side.tsx` or `player.tsx`. Those get at most a few lines of wiring, except the engine options in T3, which are named there.
- **Use the app's look:**
  - tokens from `src/styles/tokens.css`, the A3 material, the app's menus, sheets, toasts and dialogs;
  - no new design language.

  The sizes are in Appendix A.

### 1.3 Stop and mark BLOCKED when

- the phase needs a migration, a new dependency, a header change, an AI change, a dictation engine change or a hosted setting;
- the screenshots for phones, the desktop or tablets with the switch off change, and you can't find why within 30 minutes;
- a Verify step stays red after three honest fix attempts (about 45 minutes);
- the app's code differs from what this plan says in a way that changes the design (not just a renamed file). Note what you found;
- you'd have to change shared code that another surface depends on (the player's media ownership, the copilot thread, the Commonplace header components) beyond a prop or a new optional mode. Write a short design note in the report instead.

### 1.4 Checks every phase runs (Verify's steps, quoted raw in the report)

```
npm run lint
RATCHET_BASE=origin/main npm run lint:ratchet     # quote its "check-boundaries ratchet against …" line
npm run lint:size
npm run typecheck
npm run test:unit
npm run check:docs
node scripts/check-prototype.cjs
npm run build
```

Then the phase's own e2e specs, plus the touched area's existing ones (named per phase):
- run them as `IPAD_SHELL=all node scripts/run-e2e.mjs <specs> --workers=2`, with the area's other switches set (for example `PALACE=all`, `CP_HEADER=all PHOTO_VIEWER=all`, `LEARN_HOME=on LEARN_READ=on`, `DICTATION=on`);
- run the phone e2e (`phone-*.spec.ts`) once with `IPAD_SHELL=all` to prove phones are untouched;
- run them once more with `IPAD_SHELL` unset, to prove the switch-off path.

Tablet e2e uses Playwright projects with `hasTouch: true`, `isMobile: true` and the sizes in §1.5. Quote each command's last result line. If a check can't run here (for example, Learn's Lumens and Courses specimens need seeded rows and there is no database), say **unverified** and why. Never write "all green" from a step whose exit code you didn't check.

### 1.5 Evidence every phase saves

Save to `docs/superpowers/evidence/ipad/<phase>/` in `studiolo`.
- **Tablets:** after-shots at **1180 × 820** and **820 × 1180** (`hasTouch`, `isMobile`, 2× scale), light and dark, of every state the phase's acceptance names, and at **1366 × 1024** for layouts that change with width. Name each like the prototype state it matches, and put the matching prototype screenshot beside it.
- **Window widths:** **981** and **694** (height 1024), to show the regular and compact sides of the 700 px line.
- **No-change proof**, with a pixel diff (Playwright `toHaveScreenshot` with `maxDiffPixels: 0`, or comparing PNGs). Record the result:
  - **390 × 844** phone, switch on: the surfaces the phase touched;
  - **1440 × 900** desktop (fine pointer), switch on;
  - **1180 × 820** tablet, switch off.
- **A canvas can't match pixel for pixel** (the Palace layout is seeded). Compare marks, framing and chrome by eye, and note the differences.

### 1.6 Commits and guides

- One commit per meaningful step. Messages follow the repo's style (a plain first line saying what the learner gets).
- End every commit with the attribution lines the session gives you.
- Write long messages to a file and use `git commit -F`.
- Each phase updates the owning guides **in the same branch**:
  - `project-docs/design/interface.md`: the tablet shell (T1, T2, T8), replacing the tablet rail paragraph for switch-on tablets and keeping the old text marked as the switch-off behaviour;
  - `project-docs/design/graph.md`: Loci on tablets (T3, T4);
  - `project-docs/product/library.md`: Commonplace on tablets (T7);
  - `project-docs/implementation/frontend.md`: every new component, hook and switch, with its location (every phase).
- **Mark everything as Implemented behind `IPAD_SHELL` (testers), not verified on a device.**

## 2. The phases at a glance

| Phase | What the learner gets | Depends on | Time box | Spec |
|---|---|---|---|---|
| **T0** Switch, size classes, gate | Nothing visible: the switch, `useTabletShell()`, the size-class hook, before-shots, `tablet-quality.spec.ts` in report mode | — | 1 h | §4, §11.1 |
| **T1** The shell | The rail goes on tablets; the sidebar (docked in landscape, over the content in portrait, edge swipe, ⌃⌘S); a toolbar per destination; the phone's bar and dock centred in the content column | T0 | 3 h | §5, §6.1, IP-D1–D5, D15 |
| **T2** Voice, keyboard, pointer | The mic in the bar on every destination; ⌘K, Return, ↑/↓, ⌘⇧D held, ⌘1–4 and the rest; the shortcuts list on a held ⌘; hover and lift; nothing hover-only | T1 | 2 h | §6.2–6.4, IP-D6 |
| **T3** Loci | The canvas fills the column; the inspector (landscape) and sheet (portrait) with per-class sizes; the phone's touch rules on tablets, tablet framing, twist, Pencil hover; the key behind a button; no find field on the canvas; the Map's ＋ on touch | T1 | 3.5 h | §7.1–7.3, §7.5, IP-D7, D8 |
| **T4** The List as columns | The List becomes a column view; the inspector follows | T3 | 1 h | §7.4, IP-D9 |
| **T5** Learn | Grids on Home, Lumens and Courses; the Watch and Read rooms and the course room in two panes in landscape; the bar asks about the room | T1 | 3 h | §8.1–8.2, IP-D10 |
| **T6** Playback | Now Playing in the sidebar's foot (or above the bar); the picture-in-picture tile and the system's where allowed; Media Session | T5 | 2.5 h | §8.4, IP-D11 |
| **T7** Commonplace | The header at iPad size; wall columns; an item beside the wall in landscape; the viewer's Info at the side; pointer and two-finger multi-select; drops anywhere | T1, T2 | 3 h | §9, IP-D12, D13 |
| **T8** Today and Settings | The page frame; Today in two columns; Settings as a split | T1 | 1.5 h | §10 |
| **T9** Gate on | `tablet-quality.spec.ts` rules switched to failing; the contact sheet; the guides | all | 1 h | §11.1 |

**The night's priority is T0 → T3, then T5 and T6**: the shell, voice, Loci and playback are what the owner said is missing. T4, T7 and T8 are independent of each other. If T3 blocks, do T5–T8 and leave T4 as notes.

**Not in this plan** (each needs the owner first):
- Listen, Live, Walk and Drive in the app (Learn slice 2; no data yet);
- the sidebar layout for narrow desktop windows (IP-D14: not yet);
- the unified Loci chat (its own open decisions);
- any dictation engine or usage change.

## 3. Shared foundations (built in T0 and T1, used by every phase)

- **`useTabletShell()`** in `src/components/tablet/size-class.ts`: `{ active, wide, cls: "compact" | "sheet" | "inspector" }`, from the switch and the `TABLET` and `TABLET_WIDE` queries. It sets `html[data-tablet-shell]` and `html[data-tablet-wide]`, which all tablet CSS keys off (as the phone shell's `data-phone-shell` does).
- **One state, two layouts.** Nothing that holds state (the place, the card's detent, the player, the bar's text and mode, selections) may live in a component that unmounts when the size class changes. Lift it to the existing providers (the phone shell's context, the bar context, `use-loci-sheet`, the player host) or to the layout. A size change re-lays out; it never resets.
- **Per-class card size:** `use-card-height.ts` stores the detent under `studiolo.loci.detent.<cls>` and the inspector width under `studiolo.loci.inspector.width`, read and written per device (as the phone's detent is).
- **`src/styles/tablet.css`**, imported once, every rule under `html[data-tablet-shell]`.
- **The content column:** a CSS variable `--tablet-side` (0 or 288 px) that the toolbar, the stage, the dock, rooms and toasts offset by.

## 4. The phases

### T0. Switch, size classes, gate (1 h)

**Read first:** `src/config/library.ts` (how `CP_HEADER` reads its switch), `src/components/phone/phone-shell-context.tsx`, `src/components/graph/loci-side/use-loci-sheet.ts` (`COMPACT`, `useMediaMatch`), `src/app/(workspace)/layout.tsx`, `src/components/shell/app-shell-frame.tsx`, `src/app/dev/specimens/page.tsx`, `playwright.config.ts`, `tests/e2e/phone-fit.spec.ts`.

**Build:**
- the `IPAD_SHELL` switch in `src/config/`, passed from the workspace layout to `AppShellFrame`, and a specimen param `&ipad=1` that turns it on for `/dev/specimens`;
- `size-class.ts` (§3) and its unit tests (each width in spec §4.1 gives its class; a fine pointer never gives tablet);
- `tests/e2e/tablet-quality.spec.ts` in **report mode**: the nine rules of spec §11.1 at the five iPad sizes and four window widths, logging failures without failing, plus the contact sheet as an artifact;
- before-shots of every surface at the §1.5 sizes.

**Acceptance:**
- the switch off or on, every screen is pixel-identical to the base (nothing reads the hook yet);
- the gate's report lists today's failures (it should match the spec's audit, §2.2).

**Docs:** `implementation/frontend.md`: the switch, its env vars, the hook, the gate.

### T1. The shell: sidebar, toolbar, content column, the bar (3 h)

**Read first:** `shell/app-shell-frame.tsx`, `shell/navigation.tsx`, `shell/rail-frame.tsx`, `shell/destinations.ts`, `phone/drawer.tsx`, `phone/top-bar.tsx`, `phone/dock.tsx`, `phone/loci-bar.tsx`, `phone/bar-context.tsx`, `src/styles/shell.css` (the `(min-width: 700px) and (pointer: coarse)` rail block), `src/styles/phone.css`; the prototype's `paintSide`, `toggleSide`, `decorateTop`, the edge-swipe handler and `ipad.css` sections "the sidebar" and "the toolbar, the stage, the dock".

**Build (tablets with the switch):**
- **The sidebar,** `tablet/sidebar.tsx`: the four destinations with counts; the current destination's own places (Learn's sections, Commonplace's tabs and up to six collections, Loci's whole map and areas); Recent; a slot for Now Playing (T6); Appearance, Keyboard shortcuts (T2), Settings at the foot. Docked when wide, else over the content; the toolbar button and a 22 px edge swipe open it; a tap outside, Escape or a row close it; ⌃⌘S toggles it (T2 wires the key). The hidden choice is remembered.
- **The toolbar,** `tablet/toolbar.tsx`: the sidebar button (hidden while docked), the destination's title slot (Loci: the Palace · Map · List segmented control; Commonplace: the area title menu and Select), and ⋯.
- **The content column:** the rail is not rendered; the stage, the dock and rooms offset by `--tablet-side`.
- **The bar and the dock** (the phone's components) mounted on tablets: centred, at most 620 px, 56 px tall, 44 pt buttons. The panel above the bar (finds, replies, suggestions, the thread sheet) at the bar's width.
- **Sheets** (the Make sheet, confirmations) as centred form sheets at most 580 px wide.
- **When docked,** Learn's and Commonplace's in-page segmented controls hide (IP-D15).

**Acceptance:**
- at 1180 × 820 the sidebar is docked, at 820 × 1180 it isn't and opens on the button and the edge swipe;
- every sidebar row is at least 44 pt (sub-rows 40 pt drawn, 44 pt hit);
- the bar is centred in the content column at every regular width and the same as the phone's under 700;
- crossing 700 px in a live resize (Playwright `setViewportSize`) keeps the destination and the bar's text;
- phones, desktop and switch-off tablets pixel-identical.

**Tests:** e2e `tablet-shell.spec.ts`; rerun `shell`, `phone-*`, `theme-color-navigation`, `accessibility` and `appearance*`.

**Docs:** `design/interface.md` (the tablet shell), `implementation/frontend.md`.

### T2. Voice, keyboard and pointer (2 h)

**Read first:** `phone/voice.tsx` (`PhoneDictationRoot`, `useBarDictation`), `features/dictation/context.tsx` (`DictationRoot`), `copilot/copilot-composer.tsx` (`MicButton`), `phone/find-panel.tsx`, `tests/e2e/phone-dictation.spec.ts`; the prototype's keyboard section and `hud()`.

**Build:**
- **The mic everywhere:** `PhoneDictationRoot` carries the engine when the phone shell **or** the tablet shell is active. The graph page's own root then passes it on, as on phones (one engine held: the existing `__studioloDictationRoots` check).
- **Keys,** `tablet/shortcuts.tsx`, registered once in the shell: the table in spec §6.3. ⌘⇧D held starts the bar's hold-to-talk (`press`/`release` of the existing controls) and releasing sends. ↑/↓ move through the bar's rows and Return takes the highlighted one. Keys are ignored while a field other than the bar has focus, except Escape.
- **The shortcuts list,** `tablet/shortcuts-hud.tsx`: shown after ⌘ is held for 650 ms, or toggled by ⌘/ and the sidebar's Keyboard shortcuts row. A glass panel with three groups.
- **Pointer:** hover fills and the lift on cards under `(any-hover: hover)`; right-click opens the hold menu where a hold does. **Nothing hover-only:** under `TABLET`, controls that `graph.css` and `library.css` reveal on hover are shown (the Map's ＋ first).

**Acceptance:**
- the bar's mic at 44 pt on Today, Learn, Commonplace and Loci at 820 × 1180 and 1180 × 820, with `DICTATION=on` (specimens with `&dictation=1`);
- tap dictates and hold talks, with the scripted engine (the phone dictation spec's harness);
- ⌘K focuses the bar on every destination; Return acts; ⌘⇧D held and released sends to Loci;
- holding ⌘ shows the list and letting go hides it;
- the gate's rule 7 (opacity 0 controls) finds nothing on the Map.

**Tests:** e2e `tablet-voice.spec.ts`, `tablet-keys.spec.ts`; rerun `phone-dictation`, `copilot-*` and the golden test.

**Docs:** `design/interface.md`, `implementation/frontend.md`, `implementation/ai.md` (a note only: the bar hosts the existing composer on tablets, with no AI change).

### T3. Loci on iPad (3.5 h)

**Read first:** `palace/palace-engine.ts` (the `touch` option, `pick`, `frameFor`, the hold timer at `startHold`, `pointerDown`, `contextmenu`, `B()`'s `panel: "side"` cover), `palace/palace-workspace.tsx`, `palace/palace-chrome.tsx`, `graph/graph-workspace.tsx` (`coveredRight`, the floating foot), `phone/place-card.tsx`, `phone/use-card-height.ts`, `phone/canvas-chrome.tsx`, `features/phone/gestures.ts`; the prototype's `ipad-pre.js`, `placeCard`, the inspector drag handlers and the twist handler.

**Build (tablets with the switch):**
- **Touch rules on tablets:** pass the engine's `touch` option when the tablet shell is active (hold menu, two-finger tap, 22 px slop), with **tablet framing** (topics 0.6×, areas 0.85×) as a `framing` value. Add a **two-finger twist** that turns the Palace (a new private method in the engine, called from the two-pointer branch of `pointerMove`, at most ~25 lines), and **Pencil hover**: treat `pointerType === "pen"` without buttons like a mouse for hover.
- **The canvas:** the toolbar's Palace · Map · List; the back pill and the Whole map / Key stack (the phone's `canvas-chrome`), the key behind its button; the "Find a topic" field and the trail row not rendered (the bar finds).
- **The card:**
  - **wide:** `tablet/inspector.tsx` renders the place card on the right, hanging from the toolbar; drag its foot or its name to change its height (down is taller), drag its left edge between 300 and 480 px; both remembered per class (§3); the engine gets `panel: "side"` with `cover = width + 24` and the Map `coveredRight`;
  - **regular, not wide:** the phone card as a sheet at the bar's width, above the bar;
  - **compact:** the phone card, unchanged.
- **The Map's ＋** visible on touch (T2's rule), and its frame left of the inspector.

**Acceptance:**
- at 1180 × 820, the inspector shows the open place; a drag of its foot moves between peek, card and full; a drag of its edge changes the width; both survive a reload;
- at 820 × 1180, the card is a sheet at the bar's width;
- the canvas covers at least 85 % of the content column with the card at peek;
- hold opens the menu, a two-finger tap goes back, a twist turns the Palace (synthetic touch in Playwright; note that a real iPad is unverified);
- every mark hit within 22 px of a tap.

**Tests:** e2e `tablet-loci.spec.ts`; rerun `graph-*`, `palace-*` and `phone-loci*`.

**Docs:** `design/graph.md`, `implementation/frontend.md`.

### T4. The List as columns (1 h)

**Read first:** `graph/topic-tree.tsx`, `graph/use-map-phone.tsx`; the prototype's `paintColumns`.

**Build:** `tablet/topic-columns.tsx`: the area column, then one column per level down to what is open (260 px each, title and count, status dots, counts and chevrons), the open row marked, **＋ Add a sub-topic** at the end of the last column, sideways scrolling with a left-edge fade. A row opens its place (the inspector follows). The tree's search field is not rendered (the bar finds).

**Acceptance:** opening a sub-topic in the Palace and switching to List shows three columns ending at it; tapping a row opens it; Add starts naming in the bar.

**Tests:** e2e `tablet-list.spec.ts`; rerun the tree specs.

**Docs:** `design/graph.md`, `implementation/frontend.md`.

### T5. Learn (3 h)

**Real today:** Watch and Read lessons (`LEARN_READ`). **Not built:** Listen (stays disabled, "Soon"), Live, Walk, Drive, marks.

**Read first:** `explainers/learn-home.tsx`, `explainers/make-lumen-bar.tsx`, `explainers/explainer-list.tsx`, `courses/course-list.tsx`, `courses/course-viewer.tsx`, `course-below.tsx`, `features/explainers/player/player.tsx` (layout only), `learn/lesson-page/*`, `src/styles/learn.css`, `explainer.css`, `courses.css`; the 20 % audit's §4 (`PhoneRoom`); the prototype's `splitRoom` and `ipad.css` "rooms".

**Build (tablets with the switch):**
- **Pages:** the 40 px large title; Home's picks and goals in a 380 px grid; Lumens rows in 400 px columns; Courses cards in 420 px columns; the make card at most 720 px.
- **Rooms:** the Lumen room (Watch, Read) and the course room as rooms in the content column; in landscape with the room at least 860 px wide, two panes (stage and controls left at about 60 %, words right; Read: the section list left, the article right); in portrait one column with the text at most 720 px. The bar's placeholder names the room (*Ask about this slide…*, *Ask about Part 2…*). The stage's full-screen control becomes picture in picture (T6 wires it).

**Acceptance:** at 1180 × 820 a Watch room shows the stage beside the transcript, a Read lesson the section list beside the article, a course part the stage beside Reading; at 820 × 1180 each is one column; Home shows two columns of picks.

**Tests:** e2e `tablet-learn.spec.ts`, `tablet-rooms.spec.ts` (the course specimens need no database; Lumens and Courses tabs need seeded rows: run them if the e2e database exists, else **unverified**); rerun `explainer-learn-home`, `course-viewer`, `course-reading`.

**Docs:** `design/interface.md` (Learn on tablets), `implementation/frontend.md`.

### T6. Playback that survives navigation (2.5 h)

**Read first:** `phone/mini-player.tsx` and whatever host the phone plan's P8 built (`PlayerHost`, if present), `use-playback.ts`, `player.tsx`, `use-watch-progress.ts`, `graph-player*.tsx`; the prototype's `placePlayer`, `paintPip` and `systemPip`.

**Build:**
- **Now Playing:** the phone's mini player, placed in the sidebar's foot when docked, above the bar otherwise; a tap returns to the room at the same second.
- **Picture in picture:** `tablet/pip-tile.tsx` for a Watch Lumen or a course part left while playing: the current slide, a progress line, Back, play/pause, stop; dragged to a corner, snapped and remembered. The stage's picture-in-picture button hands it to the system with `requestPictureInPicture` where the app's player has a `<video>`, or a canvas stream of the slide where it hasn't; where neither is allowed it falls back to the tile.
- **Media Session:** title, artwork (the slide), play, pause, seek ±15 s, while anything plays.

**Stop and write a design note instead** if this needs more than a host and a context around the existing player: if `use-playback` or the stage would have to change how they own media.

**Acceptance:** play a Watch Lumen, go to Loci: the tile plays in the corner; tap Back: the room resumes within 1 s; with the sidebar docked a playing course part's narration shows in Now Playing; crossing 700 px turns the tile into the phone's mini player and back, still playing.

**Tests:** e2e `tablet-playback.spec.ts`; rerun the player specs.

**Docs:** `design/interface.md`, `implementation/frontend.md`.

### T7. Commonplace (3 h)

**Needs** `CP_HEADER` on for the account; with it off, the tablet keeps today's Commonplace header.

**Read first:** `library/wall-header.tsx`, `wall-toolbar.tsx`, `wall-chip-row.tsx`, `library-wall.tsx`, `wall-placement.ts`, `selection-bar.tsx`, `photo-viewer-context.tsx`, `features/library/card-open.ts`, `capture-composer.tsx`, `shell/stray-file-drop-guard.tsx`, `src/styles/library.css`, `photo-wall.css`; the prototype's `splitItem`, the drop handlers, and `ipad.css` "Commonplace" and "the photo viewer".

**Build (tablets with the switch):**
- **Header:** the area as the title, Select in the toolbar, the types and slim bar; the tabs in the sidebar when docked; the capture box and the page's search field not rendered (the bar searches as you type; ＋ captures).
- **Wall:** masonry at a 210 px target column (Medium), 140 (Small), 420 (Large).
- **Opening an item:** in landscape a 440 px pane beside the wall (notes, sources, books, links, videos), the wall live beside it; in portrait a centred form sheet; the photo viewer's Info as a side panel in landscape; the PDF room in two panes.
- **Multi-select:** ⌘-click and Shift-click with a pointer; the two-finger drag selection; the selection bar centred at most 560 px.
- **Drops:** the shell's stray-file guard becomes a drop target on every destination when the tablet shell is active: pictures, links, PDFs and text become Commonplace items on what is open (the existing capture actions), with the *Drop to save in your Commonplace* overlay and a toast with **Show**.

**Acceptance:** three or more wall columns at 1180 × 820; no field on the page; an item opens beside the wall and another card replaces it; a dropped image and a dropped link (Playwright `DataTransfer`) arrive in Commonplace on the open place; the selection bar's targets are 44 pt.

**Tests:** e2e `tablet-commonplace.spec.ts` against `/dev/specimens?library=…&header=1&ipad=1`; rerun `wall-*`, `card-menu*`, `collection-*`, `capture-*`.

**Docs:** `product/library.md`, `design/interface.md`, `implementation/frontend.md`.

### T8. Today and Settings (1.5 h)

**Read first:** `today/*`, `app/(workspace)/settings/*`, `shell/destination-header.tsx`, the 20 % audit's `PhonePage`.

**Build:** the page frame for both on tablets; Today in two columns in landscape (Continue and Focus, the week); "Ask Loci ↗" not rendered (the bar asks); Settings as a split in landscape (sections left, the section right) with 44 pt rows and chips.

**Acceptance:** no crumb on either; no control under 44 pt; the large title folds into the toolbar after 60 px of scroll.

**Tests:** e2e `tablet-pages.spec.ts`; rerun `today-*`, `settings-*`.

**Docs:** `design/interface.md`, `implementation/frontend.md`.

### T9. Gate on (1 h)

**Build:** switch `tablet-quality.spec.ts` rules 1–9 to failing, one by one, for the screens each phase covered; leave a rule in report mode only where a phase is **Not done**, and say which. Add the gate to the `Verify` workflow. Produce the contact sheet.

**Acceptance:** the gate passes on every tablet specimen it covers; the phone gate (if present) still passes.

**Docs:** `implementation/frontend.md` (the gate), and the report.

## 5. Decisions already made (don't reopen)

The owner's agreed decisions in the spec's §13 are binding once the kickoff message says the design is agreed. In particular:
- compact windows keep the phone shell exactly (IP-D1);
- the tablet layout keys on a coarse pointer, and the desktop is unchanged (IP-D2);
- wide means landscape from 1000 px (IP-D3);
- the sidebar replaces the drawer and the rail on tablets (IP-D4);
- the bar stays at the foot, centred, with ⌘K (IP-D5); the mic is on every destination (IP-D6);
- the inspector in landscape, the sheet in portrait, each class's size remembered (IP-D8);
- video leaves as picture in picture, audio as Now Playing (IP-D11).

The phone spec's MB-D1…D13 and the 20 % audit's rules also stand.

## 6. The morning report

Write it to `docs/superpowers/evidence/ipad/report.md` in `studiolo`, on the last branch.
1. **Summary:** one line per phase: **Done / Partly done / Not started / BLOCKED**, its branch and tip commit, and whether it's pushed.
2. **How to try it on an iPad:** the env values to set on the Dev deployment, for the owner to apply, never you:
   ```
   IPAD_SHELL=testers
   IPAD_SHELL_TESTERS=<owner account id>
   DICTATION        (leave as hosted)
   PALACE           (leave as hosted)
   CP_HEADER=testers
   PHOTO_VIEWER=testers
   LEARN_HOME=on
   LEARN_READ=on
   ```
   Then which branch to deploy as a preview, and a short **Try this** list per phase, in the prototype's style (landscape, portrait, Split View, a keyboard, a trackpad).
3. **Per phase:**
   - the acceptance list with ✓ / ✗;
   - the raw last line of every check in §1.4;
   - the evidence folder;
   - the guides updated;
   - **Calls I made**;
   - **Not done**, with what remains.
4. **BLOCKED items**, each with the exact question for the owner.
5. **Risks noticed:** Safari's ⌘ keys in a tab, picture in picture from a canvas on iPad Safari, the Palace's frame rate at 1366 × 1024 with the inspector, the on-screen keyboard and the bar, anything else worth the owner's eye on a real iPad.

## 7. The owner's kickoff message (paste into the overnight session)

> Work overnight, without me, on the iPad redesign in `studiolo`. I have agreed the design in `Studiolo_Manage/docs/superpowers/specs/2026-10-31-ipad-experience-design.md`. Follow `Studiolo_Manage/docs/superpowers/plans/2026-10-31-ipad-build-plan.md` (the plan), in order, T0 to T9. The prototype is `Studiolo_Manage/prototypes/ipad/dist/ipad-prototype.html` and its source is `Studiolo_Manage/prototypes/ipad/`. `AGENTS.md` still applies.
>
> For this run I explicitly allow you to:
> - create the branches `ipad/t0-switch` to `ipad/t9-gate`, stacked as the plan says;
> - commit to them;
> - **push those `ipad/*` branches to GitHub**, after each phase's checks are green.
>
> I do **not** allow:
> - merging into `main`, pushing `main`, or force-pushing anything;
> - any migration, new dependency, header change, AI prompt or tool change, or dictation engine change;
> - any change to hosted settings or credentials.
>
> Phones and the desktop must look exactly as they do now. Stop a phase and mark it BLOCKED when the plan says to. Keep going with the next independent phase. Leave me the morning report the plan describes. I'll test on my iPad and decide what merges.

---

## Appendix A. Sizes and words (from the prototype; use the app's tokens for colour, shadow and motion)

| Piece | Size and behaviour |
|---|---|
| Breakpoints | compact under 700 px; tablet `(min-width: 700px) and (pointer: coarse)`; wide adds `(min-width: 1000px) and (orientation: landscape)` |
| Sidebar | 288 px; rows 44 px (16 px text), sub-rows 40 px drawn with a 44 px hit box (15 px text, 44 px indent); section heads 11.5 px uppercase; the current row in accent with on-accent text; docked: a hairline on its right, no shadow; over the content: the rail shadow, a transparent scrim; edge swipe zone 22 px |
| Toolbar | 48 px plus the safe area, the A3 material; the sidebar button 44 px; Loci's segmented control at least 300 px, 36 px tall |
| Bar | 56 px tall, radius 28, at most 620 px wide, centred in the content column, 8 px above the safe area; ＋ and mic 44 px; field text 16 px |
| Inspector | 360 px default, 300–480 px; 12 px from the right, under the toolbar, 12 px above the safe area; radius 22; the foot grabber 64 × 22 (drawn 36 × 5); the left-edge handle 20 px wide, shown on hover or focus |
| Sheet (portrait card) | the bar's width, above the bar; the phone's heights |
| Form sheets | at most 580 × 760 px, centred, radius 22 |
| List columns | 260 px each; rows 44 px; title Newsreader 22 px |
| Pages | at most 1040 px, 36 px side margins; large title Newsreader 40 px; grids: picks and goals 380 px, Lumens 400 px, courses 420 px |
| Rooms | two panes when the room is at least 860 px wide in landscape: media 1.45 fr, words at least 320 px; Read: section list 220 px; portrait text at most 720 px |
| Now Playing | the phone's 56 px mini player; in the sidebar's foot under a *Now Playing* head |
| Picture in picture | 300 × 169, radius 14, 20 px from the column's edges and 92 px above the safe area at the foot; controls 44 px on a dark glass pill; snaps to four corners |
| Commonplace | wall column target 210 px (Medium), 140 (Small), 420 (Large); item pane 440 px; photo Info panel 340 px; selection bar at most 560 px |
| Shortcuts list | at most 820 px, glass, three groups; shown after ⌘ is held for 650 ms |
| Touch | every target at least 44 pt; hold 480 ms within 8 px; two-finger tap under 320 ms within 14 px; twist starts after 0.14 rad |

**Words to use exactly:**
- *Ask, find or search*, *Hold to talk*, *Keyboard shortcuts*, *Show sidebar*, *Hide sidebar*;
- *Now Playing*, *Picture in picture*, *Back to the room*;
- *Drop to save in your Commonplace*, *It’s filed on <place>.*;
- *In this Lumen* (Read's section list), *Your whole map*, *Areas*, *Collections*, *Recent*;
- the phone spec's words for everything the phone already says.

## Appendix B. Prototype → app, where each piece comes from

| Prototype (`Studiolo_Manage/prototypes/ipad/src`) | In the app |
|---|---|
| `ipad.js` `Q`, `sizeClass`, `layout` | `tablet/size-class.ts`, `useTabletShell()` (T0) |
| `ipad.js` `paintSide`, `sideAction`, `toggleSide`, the edge swipe | `tablet/sidebar.tsx` (T1) |
| `ipad.js` `decorateTop` | `tablet/toolbar.tsx` (T1) |
| `ipad.css` "the toolbar, the stage, the dock", "sheets" | `src/styles/tablet.css` (T1) |
| `ipad.js` keyboard section, `hud` | `tablet/shortcuts.tsx`, `tablet/shortcuts-hud.tsx` (T2) |
| `ipad.css` "pointer" | `tablet.css` under `(any-hover: hover)` (T2) |
| `ipad-pre.js` (the engines' side cover) | `palace-workspace.tsx` view (`panel: "side"`), `graph-workspace.tsx` `coveredRight` (T3) |
| `ipad.js` `placeCard`, inspector drags, `IP.cover` | `tablet/inspector.tsx`, `phone/use-card-height.ts` per class (T3) |
| `ipad.js` twist handler | `palace-engine.ts` twist in `pointerMove` (T3) |
| `ipad.js` `paintColumns` | `tablet/topic-columns.tsx` (T4) |
| `ipad.js` `splitRoom`; `ipad.css` "rooms" | the room components' tablet layout (T5) |
| `ipad.js` `placePlayer`, `paintPip`, `systemPip` | the mini player's tablet placement, `tablet/pip-tile.tsx`, Media Session (T6) |
| `ipad.js` `splitItem`, the drop handlers; `ipad.css` "Commonplace", "the photo viewer" | `card-open.ts` tablet target, the item pane, `photo-viewer-context.tsx`, the drop target (T7) |
| `check.cjs` | `tests/e2e/tablet-quality.spec.ts` and the phase specs (T0, T9) |
