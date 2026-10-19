# Today as a planning desk: interactive prototype

Status: prototype for the owner's review · 19 Oct 2026 · nothing here is built in `studiolo`.

Open `index.html` in a browser. It is a single file with sample data; changes are kept in that browser only. The **Prototype** bar (bottom right) sets the time of day, switches between a planned week and an empty one, and resets the demo.

## What it explores

Two asks: make Today's calendar a **learning planning calendar**, and make the **left sidebar** fit the Studiolo idea of a private study.

### 1. The calendar plans ahead

This is slice T4 ("Scheduling") from the Today spec, drawn ahead of time. It follows the agreed rules: the planner proposes, the learner confirms; a session has a day and, optionally, a time and length.

- **The week is the main surface.** A Mon–Sun planner, 7:00–23:00, sits under Continue and The Big Picture. T1's narrow day rail is gone. There is a Day view, and phones always use it, with the week strip from T1.
- **Planning:** drag across empty time to make a session, or click for 30 minutes. Drag a session to move it and drag its bottom edge to change its length. Dropping a session in the **Any time** row gives it a day with no time.
- **Ready to plan tray:** what is waiting to be studied (the next course part, new explainers, readings in To read, topics in focus with no time yet, notes to write up). Drag an item onto the week, or press **Plan** (works by keyboard and on touch screens).
- **The planner proposes, you confirm.** Suggested sessions are drawn as ghosts (dashed ghost blue, as the copilot already does). Each one says why it was suggested. **Plan my week** fills free time from the tray up to the weekly goal, but only as suggestions. Accept them one by one or all at once. Nothing is added without an OK.
- **Weekly goal:** "4 h 10 planned · 0 min done · goal 5 h", which you can change.
- **Sessions that have passed:** a planned session whose time has passed asks "Did you do it?" (Mark done / Move to next free time / Remove). Done sessions get a check.
- **What I did** (off by default) puts T1's activity log (watched, saved, copilot) back as small marks beside the plan. This is one answer to the open question of whether the log stays.
- **Continue ties in.** "Later today" becomes **Plan for later…** (as T4 in the spec says). Once the next part has a session, the card shows "◷ Planned today at 19:00 · Change".
- **The Big Picture** is still template sentences, now about the plan: "This week leans on Islamic architecture (3 h 25)… Timber structures has no session planned yet."
- **Next up** in the header: the next planned session today, with how long until it starts.

### 2. The sidebar becomes the study

A *studiolo* is a Renaissance private study: a small room lined with cabinets, where the scholar keeps books, instruments and current work close at hand. The sidebar now holds the learner's own world as well as the links to each part of the app.

- **Brand:** the S mark with a fine inlay border, "Studiolo" in Newsreader and *Layla's study* under it. The study belongs to the learner.
- **Destinations with a line that says what each holds:** Today *the desk* · Learn *courses and explainers* · Library *your shelves* · Graph *the map of what you know*. The names stay the same and get a small count each ("1 left", "3 to read").
- **My Focus moves into the sidebar**, so the starred topics are visible in every destination. Each shows its status and this week's planned time. Hover a topic to highlight its sessions in the plan, or click it to keep them highlighted.
- **Shelves:** collections drawn as small book spines, with counts.
- **Study this week:** time done and planned against the goal, at the foot of the sidebar.
- **Banding:** sections are divided by a double hairline with a small lozenge, after the inlaid bands of a studiolo's panelling. It is the only ornament.
- It still closes to an icon rail (U4) and becomes a drawer on narrow screens.

## Departures from what is approved

These need the owner's decision (AGENTS.md: substantial visual departures need a design decision).

| # | Departure | Approved now |
|---|---|---|
| P1 | The week planner fills the main column; there is no right calendar rail | Owner's 17 Oct layout: calendar in a 300 px rail |
| P2 | My Focus moves from Today into the global sidebar | My Focus beside Continue on Today |
| P3 | The sidebar opens to 244 px with descriptions, My Focus, Shelves and a weekly meter | U4: 58 px icons / 196 px with names only |
| P4 | Ready to plan tray on Today | Not in the spec |
| P5 | What I did log hidden by default, as marks beside the plan | Open question in spec §0 |

## Open questions

1. Does My Focus belong in the sidebar for every destination, or only on Today?
2. Weekly goal: is a weekly time goal right, or should goals stay tied to the learner-context design (T3)?
3. Should "Plan my week" use the planner (AI, costs usage) or simple rules over free time and what is waiting, as in this demo?
4. Reminders and external calendars stay out (calendar sync is post-MVP). Is that still right?

## Sources

- `studiolo` @ `85e5348` (read-only): `src/components/today/*`, `src/styles/today.css`, `src/styles/tokens.css`, `src/components/shell/*`, `docs/superpowers/specs/2026-10-16-today-design.md` (§0, §7 T4), `project-docs/product/mvp-scope.md` ("PDFs and scheduling", build sequence item 5), prototype `project-docs/design/prototype/studiolo-design-concept.html` (`#s-today`, `.cal.day`, `.ev.sug`).
- Craft, Studilo space: *Today* (02 Product), *Vision & Principles* ("Propose, then confirm"), *Logo & Visual Identity*, *Name, Taglines & Messaging*.
