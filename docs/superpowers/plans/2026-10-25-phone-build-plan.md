MEDIUM per phase (feature code behind a new switch, no migration, no AI input or spend change, no public page). Any phase that finds it needs one of those becomes HIGH and stops (§1.3).

# Studiolo on a phone: the build plan, in phases, for an unattended overnight run

**For:** the AI agent that builds this in `studiolo`, overnight and alone. It reads this whole file before starting.
**Status:** Agreed design, plan for building. Claude, 25 October 2026. The owner approved every design decision in the spec (25 October: "I agree on everything you did"). The owner has **not** authorized any merge.
**Base:** `studiolo` `origin/main` @ `af798620`, the Loci Palace P4 merge (Learn 1.5b at `c8720cf3`, Commonplace P0–2 at `b5eeee25`). If `origin/main` has moved, start from the new tip and note it in the report.

**What to build:** [`docs/superpowers/specs/2026-10-25-phone-control-bar-and-loci-design.md`](../specs/2026-10-25-phone-control-bar-and-loci-design.md), the **spec**, in this repo (`Studiolo_Manage`).
- §-numbers below without a file name refer to the spec.
- The spec wins on what it looks like and how it behaves.
- This plan wins on order, scope, branches and rules.
- `studiolo`'s `AGENTS.md` wins over both.

**What it looks like:**
- The interactive prototype: **https://claude.ai/artifact/WWe61ispK6dczMsPUvgnFG**. Read it with the Artifact tool's `read` action if you have it, or ask for the file.
- Its source: `Studiolo_Manage/prototypes/mobile-loci/`, with `src/app.js`, `app.css`, `learn.js`, `learn.css`, `commonplace.js`, `commonplace.css` and a `README.md` with a "Try it" list.
- **The prototype is a reference, not code to copy.** It is vanilla JS over the app's bundled engines. Rebuild each behaviour with the app's own components, state and actions.
- When the spec and the prototype disagree, the spec wins; record the difference in the report.

---

## 0. How to run this plan unattended

1. **Read first, in this order:**
   1. `studiolo/AGENTS.md`, then `project-docs/README.md` and `project-docs/workflow/README.md` (the tiers and the merge rules);
   2. the spec, all of it;
   3. this plan;
   4. the prototype's `README.md`;
   5. then, per phase, the files that phase's **Read first** names.
2. **Do the phases in order: P0 → P1 → … → P8.**
   - Each phase is one branch, cut from the previous phase's branch (stacked), because nothing reaches `main` tonight.
   - **Branch names:** `phone/p0-switch`, `phone/p1-loci-touch`, `phone/p2-card`, `phone/p3-shell`, `phone/p4-bar`, `phone/p5-thread`, `phone/p6-commonplace`, `phone/p7-learn`, `phone/p8-mini-player`.
3. **Each phase ends with:**
   - Verify's steps green (§1.4);
   - the phase's acceptance list checked;
   - its evidence saved;
   - its guides updated;
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
- **Push only `phone/*` branches, and only if the owner's kickoff message says so (§7).** Otherwise keep the branches local and say so in the report.
  - A pushed branch may get a Vercel preview build. That's expected and changes nothing live.
- **No database migration, no `drizzle/` change, no backfill.** If a phase seems to need one, it's BLOCKED.
- **No new npm dependency, and no app-wide header change** (COOP/COEP and so on). Dictation's own brief owns those, and it needs the owner (§2, not tonight).
- **No AI change:** no prompt, tool, model, context or spend change.
  - These goldens must not change: `tests/fixtures/copilot-turn-input-golden.json` and `tests/fixtures/explainer-job-input-golden.json`.
  - Run their tests on the base and at the end of every phase that touches Loci's chat (P4, P5).
- **No hosted settings:** no Vercel env, Neon or R2 change, and no credentials. You only *list* the env values the owner should set (§6).
- **Kill processes only by exact PID.** Restore `tsconfig.json` and `next-env.d.ts` after any e2e, build or dev run, as the earlier plans do.

### 1.2 Scope guards

- **Everything is behind one new switch, `PHONE_SHELL`, on phones only.**
  - The switch is `off | testers | all`, with `PHONE_SHELL_TESTERS` a comma-separated list of account ids. Same shape as `PALACE` and `CP_HEADER`.
  - "Phone" means the viewport is under 700 px: the existing `COMPACT = "(max-width: 699.98px)"`.
  - **With the switch off, or at 700 px and wider, every screen must stay pixel-identical to the base.** Each phase proves it (§1.5).
- **The surfaces' own switches still apply:**
  - Commonplace's phone layout is the `CP_HEADER` header folded for phones; with `CP_HEADER` off for an account, today's phone header stays.
  - The photo viewer pieces need `PHOTO_VIEWER`.
  - Learn Home needs `LEARN_HOME`; Read needs `LEARN_READ`; the Palace needs `PALACE`; Loci's chat needs `seesCopilot` (testers).
  - Never show a feature its switch hides.
- **Build only on data that exists.**
  - **Watch and Read are real** (Read lessons merged with Learn 1.5b).
  - **Listen is not built in the app.** Show it the way the app's make bar does today: disabled, labelled as coming. Don't fake chapters, hosts or audio.
  - **Live, Walk, Drive, drive editions, marks and recall are not built.** Leave them out of the UI entirely tonight.
- **Not tonight:**
  - Dictation (`Studiolo_Manage/proposals/2026-10-25-dictation-design-brief.md`): it needs the owner's approval for a dependency and headers. The bar keeps a mic slot that stays empty unless a `DICTATION` module already exists on `main`.
  - The unified Loci chat (`…/specs/2026-10-24-unified-loci-chat-brief.md`): it has open owner decisions.
  - The Map's whole-map ring (MB-D5): it stays a picture.
- **Vocabulary on screen:** say "Loci", "your Commonplace", "Lumen", "course". Never say "graph", "library", "copilot" or "explainer" (code names stay in code).
- **Keep files small:** `npm run lint:size` stays green. New behaviour goes in **new focused files**, not into `graph-workspace.tsx`, `palace-workspace.tsx`, `palace-engine.ts`, `loci-side.tsx` or `player.tsx`. Those get at most a few lines of wiring.
- **Use the app's look:**
  - tokens from `src/styles/tokens.css`, and the A3 material (`--m-*` tokens where they exist);
  - the app's menu, sheet (`SheetGrip`, `features/ui/drawer`), toast and dialog components;
  - no new design language.
  
  The sizes are in Appendix A.

### 1.3 Stop and mark BLOCKED when

- the phase needs a migration, a new dependency, a header change, an AI change or a hosted setting;
- the screenshots with the switch off, or at 700 px and wider, change, and you can't find why within 30 minutes;
- a Verify step stays red after three honest fix attempts (about 45 minutes);
- the app's code differs from what this plan says, in a way that changes the design (not just a renamed file). Note what you found;
- you'd have to change shared code that another surface depends on (the player, the copilot thread, the Commonplace header components) beyond a prop or a new optional mode. Then write a short design note in the report instead.

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
- run them as `PHONE_SHELL=all node scripts/run-e2e.mjs <specs> --workers=2`, with the other switches the area needs set too (for example `PALACE=all`, `CP_HEADER=all PHOTO_VIEWER=all`, `LEARN_HOME=on LEARN_READ=on`);
- run them once more with `PHONE_SHELL` unset, to prove the switch-off path.

Quote each command's last result line. If a check can't run here (for example, the Learn specimens need seeded database rows and there is no database), say **unverified** and why. Never write "all green" from a step whose exit code you didn't check.

### 1.5 Evidence every phase saves

Save to `docs/superpowers/evidence/phone/<phase>/` in `studiolo`.
- **Phones:** after-shots at **390 × 844** (`isMobile`, `hasTouch`), light and dark, of every state the phase's acceptance names. Name each like the prototype state it matches, and put the matching prototype screenshot beside it, cut from the artifact at the same state.
- **No-change proof:**
  - before/after shots at **1440 × 900** and **834 × 1194** (iPad) for the surfaces the phase touched;
  - the same surfaces at 390 × 844 with `PHONE_SHELL` off.
  
  Use a pixel diff (Playwright `toHaveScreenshot` with `maxDiffPixels: 0`, or compare the PNG files). Record the result.
- **A canvas can't match pixel for pixel** (the Palace layout is seeded). Compare marks, framing and chrome by eye, and note the differences.

### 1.6 Commits and guides

- One commit per meaningful step. Messages follow the repo's style (a plain first line saying what the learner gets).
- End every commit with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  ```
- Write long messages to a file and use `git commit -F`.
- Each phase updates the owning guides **in the same branch**:
  - `project-docs/design/interface.md`: the phone shell paragraph (P3, P4);
  - `project-docs/design/graph.md`: phone Loci (P1, P2, P5);
  - `project-docs/product/library.md`: the Commonplace phone behaviour (P6);
  - `project-docs/implementation/frontend.md`: every new component, hook and switch, with its location (every phase);
  - `project-docs/implementation/ai.md`: only a note that the bar hosts the existing composer, with no AI change (P4).
- **Mark everything as Implemented behind `PHONE_SHELL` (testers), not verified on a device.**

## 2. The phases at a glance

| Phase | What the learner gets | Depends on | Time box | Spec |
|---|---|---|---|---|
| **P0** Switch and baseline | Nothing visible: the `PHONE_SHELL` switch, a hook, specimens, before-shots, the spec and plan copied in | — | 0.5 h | §1, §14 |
| **P1** Loci touch | Every mark is a 44 pt target; a topic opens close up; hold for a menu; a two-finger tap goes back; the key behind a button; the Map shows areas only until one is open | P0 | 2 h | §5.1–5.3, §5.5, MB-D4, D6 |
| **P2** The card | Loci's sheet becomes the place card: a one-line peek by default, card, full; the height is the learner's and stays; four actions; children as chips | P1 | 2.5 h | §5.4, §5.6, MB-D3, D9 |
| **P3** Shell: drawer and top bar | The tab bar goes; ☰ and an edge swipe open the drawer (destinations, Recent, appearance, settings); the top bar has a title slot (Loci's view menu) and one action | P0 (and P2 for Loci's title) | 2 h | §4.2–4.4, MB-D1, D7 |
| **P4** The bar | One bar at the foot of every destination: ＋ creates, the field finds and asks, naming mode for sub-topics; Ask elsewhere hands off to Loci | P2, P3 | 3 h | §4.1, §6.1, §6.5, MB-D2 |
| **P5** Loci's thread and replies | Replies float above the bar with their actions; the thread is a sheet; suggestions show dashed with Keep all | P4 | 1.5 h | §4.1, §6.2 |
| **P6** Commonplace | The CP header folded for phones: area as the title, Select, pinned tabs, type and filter rows folding on scroll, Display sheet, selection bar, the bar as search, viewers as sheets | P3, P4 | 3 h | §8, MB-D12, D13 |
| **P7** Learn | Pinned tabs; the bar is the make field (Watch · Read, Listen disabled); the Lumen room for Watch and Read; the course room with the Parts sheet | P3, P4 | 3 h | §7 (Watch and Read only), MB-D10, D11 |
| **P8** Mini player (stretch) | A Watch Lumen or course part keeps playing, docked above the bar, as you move between destinations | P7 | 2 h | §6.4, MB-D11 |

**The night's priority is P0 to P4**, the Loci experience end to end. P6 and P7 are independent of each other; if P4 blocks, do the parts of P6 and P7 that don't need the bar (header, rooms, layout) and leave the bar wiring as notes. P8 only if everything else is done.

**Not in this plan** (each needs the owner first):
- Dictation;
- the unified chat;
- Listen, Live, Walk and Drive generation and playback;
- the Map ring (MB-D5);
- the iOS 26 tab-bar alternative (MB-D1 chose the drawer).

---

## 3. Shared foundations (built in P0, used by every phase)

- **The switch:**
  - `src/config/phone.ts` mirrors `src/config/library.ts`: `readPhoneAccess(env)`, then `canSeePhoneShell(env, accountId)`, which reads `PHONE_SHELL` and `PHONE_SHELL_TESTERS`. A malformed setting closes the door.
  - Unit tests mirror the library switch's tests.
- **Into the client:**
  - A `PhoneSwitches` context, like `LibrarySwitches`, is set in `src/app/(workspace)/layout.tsx` from the account the layout already has. Don't read the session again.
  - The hook `usePhoneShell()` returns `switch && useMediaMatch(COMPACT)`.
  - Move `useMediaMatch` and `COMPACT` out of `loci-side/use-loci-sheet.ts` into a shared foundation file, and re-export them from there so nothing else changes.
- **Specimens:** `/dev/specimens` accepts `phone=1` to turn the switch on, so e2e tests can run without accounts. Thread it through `AppShellFrame` and the graph, palace, library and course specimens.
- **Where things sit, bottom to top:** the stage, then the top bar, then a pushed room (P7), then the dock (the card, mini player and bar), then sheets and the scrim, then the drawer, then menus, then the photo viewer, then toasts. Write these as named z-index tokens in one place.
- **Safe areas and the keyboard:**
  - Use the existing `KeyboardInsetWriter` and P11 rules. The dock pads by `env(safe-area-inset-bottom)`, and drops that padding while the keyboard is up.
  - On iOS the dock rides `visualViewport` (P11).

---

## 4. The phases

### P0. Switch, baseline and copies (0.5 h)

**Read first:** `src/config/library.ts`, `src/components/library/library-switches.tsx`, `src/app/(workspace)/layout.tsx`, `src/components/shell/app-shell-frame.tsx`, `src/components/graph/loci-side/use-loci-sheet.ts`, `src/app/dev/specimens/page.tsx`.

**Build:**
- [ ] Branch `phone/p0-switch` from `origin/main`.
- [ ] Copy the spec into `studiolo` as `docs/superpowers/specs/2026-10-25-phone-control-bar-and-loci-design.md`, and this plan into `docs/superpowers/plans/2026-10-25-phone-build-plan.md`. Add a first line to each: *Copied from Studiolo_Manage @ <commit>; the source stays there.*
- [ ] Build §3: the switch, the context, the hook, the shared media hook, and `phone=1` in the specimens.
- [ ] Take the before-shots (§1.5) of:
  - the Palace, the Map and the List, with and without a topic open;
  - the Loci sheet at peek and at half;
  - Commonplace (wall, collections, To read) with `header=1`;
  - Learn Home, Lumens and Courses;
  - a course viewer (`/dev/specimens/course`);
  - Today.
  
  Take each at 390 × 844, 834 × 1194 and 1440 × 900, light and dark.

**Acceptance:**
- With the switch on or off, nothing on screen changes yet. The pixel diff is 0 at every size.
- Unit tests cover the switch: off, testers (in and out), all, and malformed.

**Docs:** `implementation/frontend.md` gets the switch, its env vars (`PHONE_SHELL`, `PHONE_SHELL_TESTERS`, documented as `PALACE` is, around line 382) and the hook.

### P1. Loci touch: targets, framing, hold, two-finger tap, the key (2 h)

**Read first:**
- `src/components/graph/palace/palace-engine.ts`: `pick` around line 797, `frameOf`, `retarget`, `pointerDown/Move/End`, `zoomBy`;
- `src/features/palace/camera.ts`: `frameFor` (line 51) and the other camera helpers;
- `palace-canvas.tsx`, `palace-workspace.tsx`, `palace-chrome.tsx`;
- `src/components/graph/graph-map.tsx`: its touch and pinch code, and `TOUCH_PAN_SLOP`;
- `graph-workspace.tsx`, `topic-menu.tsx`, `use-graph-actions.ts`;
- `tests/e2e/graph-touch.spec.ts` and `graph-palace*.spec.ts` (how they fake touch);
- the prototype's `mountPalace`, `gestures` and `thingMenu` in `src/app.js`.

**Build (all only when `usePhoneShell()`):**
1. [ ] **A 44 pt target in the Palace.**
   - The engine takes a new option, `touchSlop` (px, default 0, so nothing changes off-phone).
   - When `pick` finds no mark under the finger, it takes the nearest mark whose edge is within `touchSlop`. Rank by `distance − radius + depth × 8`, so the front wins.
   - Phones pass 22. Put the maths in a new pure helper (`palace/touch-pick.ts`) with unit tests.
2. [ ] **Topics open close up.**
   - The engine takes a new option, `framing: { topic: 0.42, area: 0.72, min: 120 }`, default `null`.
   - It scales the distance `frameFor` returns: a topic (any level below an area) by `topic`, an area by `area`, never below `min`. It also sets `focusDist` to match, so pinch-out-to-go-back still works.
   - The whole map keeps its overview distance.
   - Unit-test the distances.
3. [ ] **Hold for a menu.**
   - A hold is 480 ms, and the finger moves less than 8 px.
   - It raises `onHold(id, point)` and cancels the tap that would follow. The engine already opens on lift only when `drag.moved ≤ 5`, so clear `drag`.
   - Phones open a menu anchored at the point (P6: grows from the finger, 44 px rows, 8 px from the edges). Its items, wired to the existing actions in `use-graph-actions.ts` / `topic-menu.tsx`:
     - **Open**;
     - **Add a sub-topic** / **Add a topic**;
     - **Make a Lumen** (the existing explain dialog);
     - **Ask Loci about it** (focuses the composer with the topic open; testers only);
     - **Not started · Learning · Learned**, with a ✓ on the current one;
     - **Rename**, **Move…**, **Delete…** (the existing dialogs, as P5 sheets).
   - A haptic where `navigator.vibrate` exists.
   - Holding a suggestion opens **Keep / Dismiss**. Holding an item or a Lumen opens it.
   - With a mouse, a right-click on a mark does the same.
4. [ ] **A two-finger tap goes back** in the Palace and the Map: two pointers down and both up within 320 ms, moving less than 14 px. It calls the workspace's back (the Palace's `onBack`; the Map's Up).
5. [ ] **The Map on phones:**
   - With nothing focused, pass the layout **areas only**: the topics whose `parentId` is null, and no relations.
   - Give each dot a 22 px hit target: an invisible circle in `map-node.tsx`, or a nearest-dot lookup in the pointer handler.
   - Hold and a two-finger tap as above.
6. [ ] **The Palace's chrome on phones** (§5.1):
   - The trail row becomes a **back pill** at the top left (*‹ Environment & Services* or *‹ All areas*) that goes back one level. Holding it opens the trail as a menu: All areas, then each crumb.
   - At the top right, a two-button stack: **Whole map** and **Key**. Key shows the existing key row as a small floating card, and hides it again.
   - The bottom row's key, and its ⋯, leave the canvas on phones. *Slow turn* and *Rearrange* move to the top bar's ⋯ in P3; until then, keep them in the ⋯ on the stack.
   - The first-visit hint reads *Tap to open · Hold for more*.
7. [ ] The 22 px left edge of the canvas ignores pointers on phones, so P3's drawer swipe has a place to start. Wire it now and leave it inert.

**Acceptance:**
- In the specimen (`/dev/specimens?graph=palace&phone=1`), a synthetic touch 18 px from a small mark opens it. Off-phone, the same touch turns the scene instead (unchanged).
- Opening a topic flies closer than today: assert through the probe (`probe: true`) that the camera's distance is at most 0.45× the base value for the same topic.
- A hold opens the menu, and the lift doesn't open the mark. **Learned** changes the topic's status, and the map shows it.
- A two-finger tap goes back one level in the Palace and the Map.
- The phone Map with nothing open draws exactly the areas. Opening an area draws its fan.
- There's no key row on the phone canvas, and the Key button shows and hides it.
- No change with the switch off or at 834 and 1440 (the pixel diff).

**Tests:**
- unit: `touch-pick`, `framing`, the two-finger detector;
- e2e: `tests/e2e/phone-loci-touch.spec.ts`;
- rerun `graph-touch`, `graph-palace*` and `graph-sheet`.

**Docs:** `design/graph.md` (phone touch), `implementation/frontend.md`.

### P2. The card (2.5 h)

**Read first:**
- `src/components/graph/loci-side/` (all of it), `src/features/ui/drawer.ts`, `components/foundations/sheet-grip.tsx`;
- `topic-header.tsx`, `details-card.tsx`, `explainers-card.tsx`, `use-topic-contents.ts`;
- `copilot-panel.tsx`;
- where the workspaces raise or lower the sheet when the selection changes: search for `setDetent`, `detent` and `stepDetent` in `graph-workspace.tsx`, `palace-workspace.tsx` and `loci-side/*`;
- the prototype's `paintCard`, `cardModel`, `targetHeight` and `setDetent`, and `.m-card*` in `app.css`.

**Build (phones only):**
1. [ ] **Heights become `peek | card | full`** for the phone card, without changing the iPad's `peek | half | full`. Either map them, or add a phone-only detent set to `drawer.ts`.
   - **peek** is one line, 56 px: a grabber, the status dot, the name in Newsreader 18.5, a quiet count (*5 topics*, *4 sub-topics*), and a 28 px ✕.
   - **card** is everything down to the chips (about 230 px).
   - **full** reaches the top bar.
2. [ ] **The height is the learner's** (MB-D9):
   - Remove every place where a selection change, Back, the trail, search or a chip raises or lowers the sheet on phones.
   - The height is stored in `localStorage` under `studiolo.loci.detent`, wrapped in try/catch. A first visit starts at **peek**.
   - Only a drag on the grabber or the header, or a tap on a peeked card (which raises it to card), changes it. Drags settle with `settleDetent`; flicks are projected (A4).
   - **Review** on a Loci reply (P5) may raise it to card, because that's the learner's own act.
3. [ ] **The card's content** (§5.4 table): the kicker, the title in Newsreader 24, the line (a status pill that opens Not started / Learning / Learned, then the counts), the four actions, the chips, and the full-height sections. Build it as new components in a new folder, `src/components/graph/phone-card/`, fed by the side model `useLociSide` already exposes.
   - **The whole map:** *Loci* / *Your whole map* / *18 areas · 86 topics · 42 learned*. Actions: ＋ Area · Focus (opens the first unfinished My Focus topic) · Ask · More. Chips: the areas with their counts. Full: My Focus, Recently opened.
   - **An area:** ＋ Topic · ▶ Play (once it has a Lumen) or ✦ Lumen · Ask · More. Chips: its topics.
   - **A topic:** ＋ Sub-topic · ✦ Lumen / ▶ Play · Ask · More. Chips: its sub-topics, Loci's pending suggestions under it (dashed), then **＋ Add**. With none yet: **✦ Suggest sub-topics** (testers: sends that message to Loci, P5; others: hidden) and **＋ Add your own**.
     - Full: Status (segmented), Sub-topics (rows), Lumens (rows with ▶), In Commonplace (picture strip, a tap opens the item as Commonplace does).
   - **A stack** (Commonplace or Lumens in the Palace): the stack card's list.
   - Details and the explainers card open inside the full card, as `inPanel` does today.
4. [ ] **The engine's covered area:** the Palace's `view.sheetHeight` and the Map's `coveredBottom` become the dock's covered height (card plus bar), measured, so what's open frames above them.
5. [ ] **The composer stays reachable before P4:** on phones it sits in a 54 px capsule under the card (Appendix A). P4 lifts it into the shell's bar.
6. [ ] **The List on phones** (§5.6): grouped rows for the children of what's open (status, place, chevron). A tap opens the row, and the card follows. Reuse `topic-tree.tsx` data.

**Acceptance:**
- A first visit shows the peek. Tapping three different topics, by canvas, chip, List and Back, leaves it at peek. Raising it to card and tapping on keeps it at card. A reload keeps the last height.
- The canvas visible between the top bar and the card at peek is at least 480 px tall at 390 × 664. Measure it as the prototype measured it (§5.4 table).
- The four actions do what they say. Status changes save. The chips open their topics.
- Desktop and iPad are unchanged.

**Tests:**
- unit: the stored detent and the "navigation never changes it" reducer;
- e2e: `phone-loci-card.spec.ts`;
- rerun `graph-sheet`, `copilot-workspace` and `graph-palace-p3/p4`.

**Docs:** `design/graph.md`, `implementation/frontend.md`.

### P3. Shell: drawer and top bar (2 h)

**Read first:**
- `src/components/shell/*` (`app-shell-frame`, `rail-frame`, `navigation`, `tab-bar`, `destination-header`, `account-menu`, `appearance-control`, `rail-capture`, `destinations.ts`);
- `src/styles/shell.css` (the `max-width: 699.98px` blocks);
- `tests/e2e/shell.spec.ts`, `theme-color-navigation.spec.ts`;
- the prototype's `paintTop`, `paintDrawer` and `dragDrawer`.

**Build (phones with the switch):**
1. [ ] **The top bar:** 48 px plus the safe area, translucent (A3). It has:
   - **☰** (44 px);
   - a **title slot** (centred);
   - one **action slot**.
   
   Pages fill the slots through a small context or portal (`useTopBar({ title, action })`). With no title given, the title is the destination's name, and it fades in once the page's large title scrolls under the bar.
2. [ ] **The drawer**, from the left, 84 % wide and at most 330 px, over a scrim. It holds:
   - the mark and *Studiolo*;
   - **Today, Learn, Commonplace, Loci**, each with its icon, the current one in accent. A count only where it's already loaded on the page; never add a query for a count;
   - **Recent**: the last four places and Lumens opened. Store them in `localStorage` (`studiolo.recent`) as `{kind, id, label, sub}` when a topic or a Lumen opens, and drop entries whose page 404s;
   - at the foot: **Appearance** (Auto · Light · Dark, the existing control), **Settings**, and the account (the existing menu).
   
   It opens from ☰ or a swipe from the left 22 px. It closes with a swipe left, the scrim or Escape. Focus moves to the current destination, and returns to ☰.
3. [ ] **The tab bar** is not rendered on phones with the switch. The destination header and tab rows that sat above the page go too:
   - Loci's sections move into the title menu (step 4);
   - Learn's and Commonplace's tabs move into their pages (P6, P7).
4. [ ] **Loci's title** is a menu: *LOCI* over **Palace ⌄** / **Map ⌄** / **List ⌄**, listing Palace (when `palace`), Map and List (MB-D7: no Overview on phones). Its action is **⋯**: *Slow turn* and *Rearrange* (Palace).
5. [ ] **Capture:** keep the existing capture control in the top bar's action slot on non-Loci destinations **until P4**, so capture is never lost between phases.
6. [ ] `theme-color` and the rail's `keyboard-inset` behaviour still work.

**Acceptance:**
- With the switch on at 390 × 844 there's no tab bar. ☰ and the edge swipe open the drawer, and it reaches all four destinations and Recent. Loci's view menu switches views. Escape, the scrim and a swipe close the drawer.
- With the switch off, or at 834 and 1440, there's no change (the pixel diff, including `shell.spec.ts`).
- Axe is clean on the drawer and the top bar.

**Tests:** e2e `phone-shell.spec.ts`; rerun `shell`, `theme-color-navigation`, `accessibility` and `appearance*`.

**Docs:** `design/interface.md` (replace the phone tab-bar paragraph for switch-on phones; keep the old text marked as the switch-off behaviour), `implementation/frontend.md`.

### P4. The bar (3 h)

**Read first:**
- `components/copilot/copilot-composer.tsx`;
- `loci-side/use-loci-chat.tsx`, `components/graph/copilot-panel.tsx`;
- `palace-chrome.tsx` (`PalaceSearch` matching);
- `graph-workspace.tsx` (the A21 handoff `initialAsk`: `/graph?ask=…&scope=map`);
- `inline-topic-input.tsx`, `use-graph-actions.ts` (create topic), `palace-workspace.tsx` (`createFromDraft`, `adopt`, `setProvisional` drafts);
- `capture-body.tsx`, `capture-box-shell.tsx`, `capture-state.ts`;
- `explain-dialog.tsx`, `make-lumen-bar.tsx`;
- the prototype's `paintBar`, `paintBarState`, `findsHtml`, `submitBar`, `startNaming`, `suggestHtml`, `addTopic` and `plusMenu`.

**Build:**
1. [ ] **`src/components/shell/loci-bar/`:** a 54 px capsule at the foot of every destination, 10 px from the sides, above the safe area. It has:
   - **＋** (42 px), which turns into ✕ in a mode;
   - **the field** (16 px type, so iOS doesn't zoom);
   - **the right button:** **Send** (↑, accent) when there's text, otherwise the mic slot. The slot is empty unless `src/features/dictation/` exists on `main`.
   
   It sits in a **dock** (§3), which also holds the Loci card (P2) and later the mini player (P8).
2. [ ] **Each destination drives the bar:** a page registers an adapter with `useBarAdapter({ placeholder, panel(q), onInput(q), onSubmit(q) })`. With no adapter, the bar finds places and asks Loci.
3. [ ] **In Loci:**
   - **Placeholder:** *Ask about <topic>…*, or *Find a place or ask Loci…* on the whole map.
   - **Focused and empty**, the panel above the bar shows **Recent** places and three **Ask Loci** suggestions.
   - **Typing** lists up to four places that match (prefix first, then contains; the same matching as `PalaceSearch`, moved into a shared helper), then **Ask Loci "…"**.
   - **Return** opens an exact place match, otherwise sends the message to Loci through the existing chat (`use-loci-chat` send) for testers (`seesCopilot`).
   - Non-testers get find only, with the placeholder *Find a place…*.
   - The P2 capsule is retired: the composer now *is* the bar on phones. The send goes through the same code path, so **the AI input does not change**. Run the copilot turn input golden test to prove it.
4. [ ] **Elsewhere** (Today, and Learn and Commonplace until P6 and P7 add their adapters): **Ask Loci "…"** navigates to `/graph?ask=<text>&scope=map`, the existing A21 handoff.
5. [ ] **＋ menu**, anchored to ＋ and growing upward:
   - **New sub-topic** / **New topic** / **New area** (Loci, depending on what's open);
   - **Make a Lumen** (the existing explain or make flow for what's open);
   - **Write a note** and **Paste a link**: the bar turns into capture mode (a chip *Note → <topic>*); Return saves through the existing capture endpoint, tagged on the open topic or the area, with the toast *Saved to your Commonplace.*;
   - **Photo or scan** and **Add a file or PDF**: the existing capture box with files, opened as its phone sheet (M-D5).
   
   The capture control leaves the top bar now.
6. [ ] **Naming mode** (§6.1):
   - **＋ Sub-topic** (from the card, the ＋ menu or the hold menu) hides the card, shows the Palace's draft beside the parent (`setProvisional` draft), and turns the bar into a parent chip plus *Name a sub-topic*, with the keyboard up.
   - **Return** creates the topic with the existing create action, then `adopt`s it into the draft's place. A fresh draft appears for the next name, and a toast says *Added "<name>"* with **Undo** (the existing delete).
   - Above the bar: Loci's pending suggestions under that parent, as dashed chips (a tap keeps one, through the existing Keep). For testers, also **✦ Ask Loci to suggest**, which sends *Suggest sub-topics for <topic>*. Never invent suggestions on the client.
   - **Done** returns to the parent's card, at the height it had.
7. [ ] **The keyboard:** while typing, the dock sits on the keyboard (`visualViewport` on iOS) and drops its safe-area padding. Escape clears and leaves the mode without bubbling to the page.

**Acceptance:**
- The bar shows on every destination with the switch on.
- Typing *pass* lists Passive design first, and Return opens it.
- A tester's question sends, and the reply arrives in the existing thread. The copilot golden is unchanged.
- Five sub-topics can be added in a row without touching anything but the keyboard, and each lands beside its parent in the Palace.
- A note saves to Commonplace with the open topic.
- Ask on Today lands in Loci with the text pre-filled.
- Desktop and iPad are unchanged.

**Tests:** e2e `phone-bar.spec.ts` (find, ask as a tester and a non-tester, naming five, capture a note, handoff from Today); rerun `copilot-*`, `capture-*` and `graph-*`; run the golden test.

**Docs:**
- `design/interface.md`: the bar;
- `implementation/frontend.md`: the bar, the adapter hook and the dock;
- `implementation/ai.md`: one line, *the phone bar hosts the existing composer; no input change*.

### P5. Loci's thread and replies (1.5 h)

**Read first:** `copilot-panel.tsx`, `components/copilot/*` (the thread, cards, proposal cards, Keep and Dismiss), `use-loci-chat.tsx`, and the prototype's `replyHtml`, `paintChat` and `answer`.

**Build:**
1. [ ] **When Loci replies on a phone,** a reply card floats above the bar. It has:
   - Loci's mark;
   - the reply's text, clamped to three lines;
   - the reply's actions:
     - for a proposal: **Keep all**, **Review** (raises the card to card height and shows the dashed chips) and **Thread**;
     - otherwise: **Thread**.
   
   A reply with no action fades after five seconds. ✕ dismisses it. It never covers the card's peek.
2. [ ] **The thread is a sheet** from the bar up to the top bar. It holds the existing conversation view (`CopilotView` / `CopilotHome`, with their cards, Keep and Dismiss), with the bar staying at its foot. Drag it down or tap ⌄ to close it.
   - Where the selection moved between messages, show a quiet *Now in <place>* divider. Use the existing focus dividers (`display.focus`) if they cover this; don't build a new store.
3. [ ] **Pending suggestions show dashed** on the Palace (they already do: `setProvisional` ghosts) and as dashed chips on the card (P2).

**Acceptance:**
- **✦ Suggest sub-topics** (as a tester, against the copilot specimen's canned replies) shows the reply card with Keep all. Keep all turns the dashed chips solid in place.
- The thread opens and closes, and holds the same conversation the desktop panel shows.
- The copilot golden is unchanged.

**Tests:** e2e `phone-loci-thread.spec.ts` (copilot specimens: `copilot=nested`, `question`, `thinking`); rerun `copilot-*`.

**Docs:** `design/graph.md`, `implementation/frontend.md`.

### P6. Commonplace on a phone (3 h)

**Needs** `CP_HEADER` on for the account; with it off, today's phone Commonplace stays as it is.

**Read first:**
- `src/components/library/wall-header.tsx`, `search-bar.tsx`, `type-bar.tsx`, `filter-bar.tsx`, `area-picker.tsx`, `selection-bar.tsx`, `card-menu.tsx`, `library-wall.tsx`, `library-shelves.tsx`, `view-switch.tsx` (or wherever Wall | Shelves lives), `collections-page.tsx`, `collection-hero.tsx`, `new-collection-dialog.tsx`, `quick-view*`, `pdf-viewer.tsx`, `item-page.tsx`;
- `src/features/library/header-model.ts`, `areas.ts`, `card-open.ts`, `library-view.ts`;
- `src/styles/library.css` (the 699.98 px blocks and the `cp-*` header rules), `photo-viewer.css`;
- `tests/e2e/wall-phone.spec.ts`, `library-secondary-phone.spec.ts`;
- the prototype's `commonplace.js` and `commonplace.css`, and spec §8.

**Build (phones with `PHONE_SHELL` and `CP_HEADER`):**
1. [ ] **The top bar:**
   - The title is the **area picker**: *COMMONPLACE* over **● All areas ⌄**, the existing `AreaPicker` menu (All areas with the total, each area with its count, No area yet), keeping its cookie and address behaviour.
   - The action is **Select**, which becomes **Done**.
2. [ ] **The page:**
   - The large title *Commonplace* and its line (*45 entries, 9 collections*, from data already on the page).
   - Then, **pinned:**
     - the tabs **Everything · Collections · To read · Templates** (segmented);
     - the **type row** (`type-bar`: icons, counts, then **›** and the collection pills);
     - the **slim bar** (`filter-bar`: All · Unsorted (and ★ Picks once it exists in the app; don't add it if it doesn't), Topic ▾, the type's own filter, Display).
   - Use the existing components with a phone layout, not copies.
3. [ ] **The type row and slim bar fold away on scroll down** (more than 8 px down past 260 px) and come back on scroll up (more than 14 px, or above 160 px). Ignore scroll events for 450 ms after each fold, because folding moves the scroll position (the prototype hit this loop). The tabs never fold.
4. [ ] **The count line:** *32 photos · newest first*, the search as a removable chip, and **Wall | Shelves** as icons.
5. [ ] **The bar is the search** (MB-D13). The Commonplace adapter:
   - Placeholder per type, from `header-model.ts`, shortened to fit: *Search, capture or ask…* / *Search notes and quotes…* / *Search books, lectures and links…* / *Search photos by place or note…* / *Search your collections…*.
   - `onInput` drives the wall's existing query state (debounced as the search bar does today).
   - The panel above the bar: *N matches on the wall*, **Save "…" as a note**, **Ask Loci "…"**. Focused and empty: **Capture a thought, quote or link…**, plus saved Views if the app has them (don't build Views if it doesn't).
   - Return keeps the query as the chip.
   - The header's own search field hides on phones with the switch.
6. [ ] **Display** opens as a sheet: Wall / Shelves, then sort (Newest / Oldest / Title, from `header-model.ts`), plus whatever the app's Display offers today. Don't add options the app doesn't have.
7. [ ] **Select:** the dock's bar gives way to the existing selection bar, restyled as a floating bar at the foot: *N selected*, then **Move to collection… · Delete…** and whatever else it has. Tapping cards ticks them.
8. [ ] **Hold a card** for the existing card menu (`card-menu.tsx`), anchored at the finger: Move to collection · Area › · Explain… · Show connections · Copy link · Select · Delete…. A hold doesn't open the card.
9. [ ] **How things open on phones** (§8.5):
   - photos open in the viewer, with its bottom row of actions (Pick only if the app has Picks; Info; Explain… for Lumen; Show connections; Copy image);
   - videos, links, notes, quotes and books open in their existing views, presented as tall P4 sheets;
   - the PDF room gets the floating page bar.
   
   Reuse `card-open.ts`. Don't change what opens what.
10. [ ] **Collections:** two columns of tiles; **New collection** opens the existing dialog as a P5 sheet. One collection gets the compact CH-1 header, **Add items** and **Edit collection**. **To read** gets the segmented To read · Reading · Read with counts and the app's empty-state words.

**Acceptance:**
- With `CP_HEADER` and `PHONE_SHELL` on:
  - the area menu changes the wall and is remembered;
  - a type with collections filters;
  - the filter rows fold on scroll down and come back on scroll up, without flicker (record it: scroll 900 px, wait 1 s, assert collapsed);
  - typing in the bar filters the wall live;
  - Select, Move and Delete work through the existing endpoints in the specimen;
  - a held card opens the card menu;
  - a photo opens the viewer, and the PDF room has the page bar.
- With either switch off, nothing changes (the pixel diff, and `wall-phone` and `library-secondary-phone` green).

**Tests:** e2e `phone-commonplace.spec.ts` against `/dev/specimens?library=…&header=1&phone=1` (and `media=1`, `viewer=1` for photos); rerun the `wall-*`, `card-menu*`, `collection-*` and `capture-*` specs.

**Docs:** `product/library.md` (phone behaviour), `design/interface.md`, `implementation/frontend.md`.

### P7. Learn on a phone: tabs, the make field, the Lumen room, the course room (3 h)

**Real today:** Watch, and Read lessons (`LEARN_READ`). **Not built:** Listen (shown disabled, as the make bar already shows it), and Live, Walk, Drive and marks (not shown).

**Read first:**
- `src/components/explainers/learn-home.tsx`, `make-lumen-bar.tsx`, `lumens-tools.tsx`, `explainer-list.tsx`, `poster.tsx`, `lumen-reading.tsx`, `read-lesson.tsx`;
- `src/components/learn/lesson-page/*`;
- `src/features/explainers/player/*`: `player-page.tsx`, `player.tsx`, `controls.tsx`, `transcript.tsx`, `ask.ts`;
- `src/components/courses/course-list.tsx`, `course-viewer.tsx`, `course-outline.tsx`, `course-below.tsx`, `course-meta.tsx`;
- `src/components/shell/destinations.ts` (`learnSections`);
- `src/styles/learn.css`, `explainer.css`, `courses.css` (the 700 px blocks);
- `tests/e2e/explainer-learn-home.spec.ts`, `course-viewer.spec.ts`, `course-sheet.spec.ts`;
- the prototype's `learn.js` and `learn.css`, and spec §7.

**Build (phones with the switch; Learn Home's own switch still decides whether the tabs exist):**
1. [ ] **The page:**
   - the large title *Learn* and its line (*Ask, pick up, and what's next* / *N Lumens* / *N courses*);
   - **Home · Lumens · Courses** as a segmented control, pinned under the top bar. Courses only when the account has courses on; use `learnSections`.
2. [ ] **The bar is the make field** (MB-D10). The Learn adapter:
   - **Placeholder:** *What do you want to understand?*
   - **The panel above the bar:** **Make a Lumen** with the format picker:
     - **Watch** and **Read** (Read only with `LEARN_READ`);
     - **Listen** disabled, with the app's own coming-soon wording;
     - **no Live.**
     
     With text typed: *In: <topic>* (the make bar's topic detection), then **Make a Watch: "…"** with the format's hint line, then **Ask Loci instead** (the handoff). Empty: **Explain <topic>** starters from My Focus.
   - **Return** makes the Lumen with the existing `make-lumen-bar` call. Its making state shows on Home, as it does today.
   - The page's own make field hides on phones with the switch. The make card on Home keeps the heading, the format picker and the hint, and points to the bar: *Type it in the bar below, or hold the mic and say it*. Drop "or hold the mic" when there's no mic.
3. [ ] **Home, Lumens and Courses** keep their content.
   - Phone layout per §7.2 and §7.3, where the data exists: pick rows with their buttons under the text; goal cards; Lumens' state and group as compact controls; posters by format (Watch: title slide; Read: paper title page); format pills only for formats that exist; courses with their strip and outline (*+ n more parts*).
   - Remove nothing the desktop has.
4. [ ] **A Lumen's room**, on the player page, on phones (MB-D11):
   - **The page** is full screen under its own top bar: ‹ back (`router.back()`, or Learn when there's no history), the title, and Share (the existing share action).
   - **The switcher**, pinned: **Watch · Read**, each with its length, and **+** for a Read that can be made (the existing make-Reading action), with **Listen** disabled.
   - **Watch:**
     - the stage pinned under the switcher;
     - one control row (back 10, play, forward 10, scrubber, time, speed, CC, full screen), using the existing controls in a phone layout;
     - then the title, the meta line and **Lives in**;
     - **Transcript | Slides** (the existing transcript panel's tabs);
     - **Questions to take further** (the existing end-card follow-ups).
   - **Asking:** the bar's adapter places the existing Ask (`ask.ts`: Ask Loci) behind the bar, with the placeholder *Ask about this slide…*. Use whatever the player does today; don't add a new AI call.
   - **Read:** the existing lesson page, with a reading progress line under the switcher and its section list as chips. Its checks and figures are the existing blocks.
   - **A swipe from the left edge** goes back.
5. [ ] **The course room:**
   - the course viewer full screen (M-D16), with the episode bar pinned in place of the switcher: ‹, *Part k of N · <title>*, **Parts k/N** (opens the existing Parts sheet), ›;
   - the stage and controls;
   - the existing tabs (Reading · This part · Transcript · Slides), Up next, Feedback and Report as they are.
   
   Keep the app's part numbering (Part 0 is the whole topic).

**Acceptance:**
- The tabs are pinned.
- Typing a question in the bar on Learn and pressing Return starts making a Watch, and Home shows it being made.
- Read is chosen when `LEARN_READ` is on, and absent when it's off. Listen is disabled.
- A Lumen opens in the room. The switcher pins. The stage pins while the transcript scrolls. Transcript | Slides switch. Read shows its progress line and section chips.
- The course room's Parts sheet lists the parts with their states.
- Desktop and iPad are unchanged.
- **Learn specimens need seeded database rows.** If there's no database, cover what the in-memory course specimen allows and mark the rest **unverified**.

**Tests:** e2e `phone-learn.spec.ts` and `phone-course-room.spec.ts`; rerun `explainer-learn-home`, `course-viewer`, `course-sheet` and `course-reading`.

**Docs:** `design/interface.md` (Learn on phones), `implementation/frontend.md`.

### P8. The mini player (stretch, 2 h)

**Only if P0 to P7 are done.** The goal: leaving a Watch room or a course room while it plays docks a 56 px mini player above the bar, on every destination, and a tap returns to the room (§6.4). It shows the slide as a 64 × 40 poster, the title, the format and time, play/pause and ✕.

**Read first:** the player's ownership of its media (`use-playback.ts`, `player.tsx`, `use-watch-progress.ts`), `graph-player*.tsx` and `loci-side/use-lumen-player.ts` (the Map's minimised player already keeps playing across area changes).

**Build:** a `PlayerHost` in the workspace layout (the layout survives navigation) that owns one playing Lumen and renders its mini player in the dock. The room, Loci's player and the course room hand their playback to it.

**Stop and write a design note instead** if this needs more than a wrapper and a context around the existing player: if `use-playback` or the stage would have to change how they own media. The report then says what would change.

**Acceptance:** play a Lumen, go back to Loci, keep hearing and seeing it in the mini player, tap it, and land in the room at the same time.

---

## 5. Decisions already made (don't reopen)

| # | Decision | Where it bites |
|---|---|---|
| MB-D1 | Destinations in a left drawer; the bar at the foot (not the iOS 26 tab bar) | P3, P4 |
| MB-D2 | One field finds and asks (places first) | P4 |
| MB-D3 | The sheet becomes the place card, with peek / card / full | P2 |
| MB-D4 | Topics open at 0.42× and areas at 0.72× the distance, at least 120 | P1 |
| MB-D5 | The Map's whole-map ring stays a picture; the chips navigate | P1 (areas only), not tonight |
| MB-D6 | Hold for a menu everywhere; a two-finger tap goes back | P1, P6 |
| MB-D7 | Palace · Map · List on phones; no Overview | P3 |
| MB-D8 | Spoken commands are plain messages to Loci | Not tonight (dictation) |
| MB-D9 | The card's height is the learner's: peek by default, never changed by navigating, remembered | P2 |
| MB-D10 | On Learn, the bar is the make field | P7 |
| MB-D11 | A Lumen opens in a room that keeps the bar; Watch docks as a mini player | P7, P8 |
| MB-D12 | Commonplace: the area is the title, Select in the top bar, the rows fold on scroll | P6 |
| MB-D13 | Commonplace: the bar is the search, and capture | P6 |

## 6. The morning report

Write `docs/superpowers/plans/2026-10-25-phone-build-report.md` on the last branch you touched, and keep it current as you go (commit it with each phase). Lead with what the owner needs first:

1. **Summary:** one line per phase: **Done / Partly done / Not started / BLOCKED**, its branch and tip commit, and whether it's pushed.
2. **How to try it on the phone:** the env values to set on the Dev deployment, for the owner to apply, never you:
   ```
   PHONE_SHELL=testers
   PHONE_SHELL_TESTERS=<owner account id>
   PALACE           (leave as hosted: all)
   CP_HEADER=testers
   PHOTO_VIEWER=testers
   LEARN_HOME=on
   LEARN_READ=on
   ```
   Then which branch to deploy as a preview, and a short **Try this** list per phase, in the prototype's style.
3. **Per phase:**
   - the acceptance list with ✓ / ✗;
   - the raw last line of every check in §1.4;
   - the evidence folder;
   - the guides updated;
   - **Calls I made** (anything where you chose between the spec and the prototype, or the code differed from this plan);
   - **Not done**, with what remains.
4. **BLOCKED items**, each with the exact question for the owner.
5. **Risks noticed:** performance on the Palace, the keyboard on iOS, or anything else worth the owner's eye on a real iPhone.

## 7. The owner's kickoff message (paste into the overnight session)

> Work overnight, without me, on the phone redesign in `studiolo`. Follow `Studiolo_Manage/docs/superpowers/plans/2026-10-25-phone-build-plan.md` (the plan) and the spec it names, in order, P0 to P8. The prototype is https://claude.ai/artifact/WWe61ispK6dczMsPUvgnFG and its source is `Studiolo_Manage/prototypes/mobile-loci/`. `AGENTS.md` still applies.
>
> For this run I explicitly allow you to:
> - create the branches `phone/p0-switch` to `phone/p8-mini-player`, stacked as the plan says;
> - commit to them;
> - **push those `phone/*` branches to GitHub**, after each phase's checks are green.
>
> I do **not** allow:
> - merging into `main`, pushing `main`, or force-pushing anything;
> - any migration, new dependency, header change, AI prompt or tool change;
> - any change to hosted settings or credentials.
>
> Stop a phase and mark it BLOCKED when the plan says to. Keep going with the next independent phase. Leave me the morning report the plan describes. I'll test on my phone and decide what merges.

---

## Appendix A. Sizes and words (from the prototype; use the app's tokens for colour, shadow and motion)

| Piece | Size and behaviour |
|---|---|
| Top bar | 48 px plus the safe area; translucent paper at 80 % with a 20 px blur (A3), solid under reduced transparency or more contrast; ☰ is 44 px |
| Title (a menu) | an 11 px uppercase kicker (*LOCI*, *COMMONPLACE*), then 16.5 px semibold with a chevron |
| Drawer | 84 % wide, at most 330 px; rows 50 px, 16.5 px; the current row in accent soft; Recent rows 46 px |
| Bar | 54 px tall, radius 27, 10 px from the sides, 8 px above the safe area; ＋ and mic/send 42 px; field text 16 px; listening adds an accent ring |
| Panel above the bar | radius 18; rows at least 48 px; section heads 11.5 px uppercase |
| Card | radius 24 (20 at peek); peek 56 px (name in Newsreader 18.5, count 13 px, ✕ 28 px); card about 230 px (kicker 11 px uppercase, title Newsreader 24, action tiles 58 px with radius 14, chips 38 px); full up to the top bar |
| Reply card | radius 20; text 15 px clamped to 3 lines; buttons 36 px |
| Mini player | 56 px, radius 18; a 2 px progress line at the foot |
| Menus | grow from their anchor, rows 46 px, 8 px from the edges; a held mark's menu blurs the scene behind it |
| Back pill | 38 px, in accent; holding it opens the trail |
| Whole map / Key | a 40 px two-button stack, top right |
| Sheets | radius 24 at the top; grabber 36 × 5; P5 sheets for confirmations |
| Touch | every target at least 44 pt; a hold is 480 ms and moves less than 8 px; a two-finger tap is under 320 ms and moves less than 14 px; the edge swipe zone is 22 px |
| Commonplace header | tabs 34 px; type chips 36 px; pills and filter chips 32 px; fold thresholds as in P6 |
| Lumen room | switcher buttons 44 px; the stage pinned at 16:9; one 40 px control row |

**Words to use exactly:**
- *Find a place or ask Loci…*, *Ask about <topic>…*, *Ask Loci "…"*;
- *Name a sub-topic*, *Loci suggests*, *Added "<name>"*, **Undo**, **Done**;
- *Your whole map*, *Tap to open · Hold for more*;
- *Saved to your Commonplace.*, *What do you want to understand?*, *Ask about this slide…*;
- *Search your collections…*, *N matches on the wall*;
- **Keep all**, **Review**, **Thread**, *Now in <place>*;
- the app's own words wherever an existing component already says something.

## Appendix B. Prototype → app, where each piece comes from

| Prototype (`Studiolo_Manage/prototypes/mobile-loci/src`) | In the app |
|---|---|
| `app.js` `mountPalace`, `engine.pick` wrap, `engine.frameOf` wrap | `palace-engine.ts` options `touchSlop`, `framing` (P1) |
| `app.js` `gestures` (hold, two-finger tap) | new `palace/touch-gestures.ts`, plus the Map's pointer code (P1) |
| `app.js` `thingMenu` | the existing `topic-menu.tsx` actions, as an anchored phone menu (P1) |
| `app.js` `paintCard`, `cardModel`, `targetHeight`, `setDetent`, `savedDetent` | new `graph/phone-card/*`, and `use-loci-sheet.ts` detents (P2) |
| `app.js` `paintTop`, `paintDrawer`, `drawer`, `dragDrawer` | new `shell/phone-top-bar.tsx`, `shell/phone-drawer.tsx` (P3) |
| `app.js` `paintBar`, `findsHtml`, `submitBar`, `plusMenu`, `startNaming`, `addTopic` | new `shell/loci-bar/*`, `useBarAdapter`, the existing composer, capture and create actions (P4) |
| `app.js` `replyHtml`, `paintChat` | `copilot-panel.tsx` / `CopilotView` in a sheet, plus a reply card (P5) |
| `commonplace.js` `top`, `typeRow`, `slimBar`, `mounted` (fold), `barPanel`, `selectBar`, `viewer`, `displaySheet` | `wall-header`, `type-bar`, `filter-bar`, `area-picker`, `selection-bar`, `card-menu`, the quick view, the photo viewer, `pdf-viewer` in phone layouts (P6) |
| `learn.js` `html`, `homeHtml`, `lumensHtml`, `coursesHtml`, `barPanel`, `onSubmit` | `learn-home`, `make-lumen-bar`, `lumens-tools`, `explainer-list`, `course-list` (P7) |
| `learn.js` `lumenRoom`, `watchBody`, `readBody`, `switcher` | `player-page.tsx`, `controls.tsx`, `transcript.tsx`, `lumen-reading.tsx`, `lesson-page/*` in a phone room (P7) |
| `learn.js` `courseRoom`, `partsSheet` | `course-viewer.tsx`, `course-outline.tsx`, `course-below.tsx` (P7) |
| `learn.js` `miniHtml`, the player clock | `PlayerHost` around the existing playback (P8) |
| `learn.js` `listenBody`, `walkHtml`, `driveHtml`, Live | **not tonight**: no data in the app |
