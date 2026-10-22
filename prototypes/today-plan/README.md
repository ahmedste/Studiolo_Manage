# Today, planned: interactive prototype

Today grows into a **learning-planning calendar** that the copilot plans with you. It's built on **Studiolo's real Today screen and styles**: the shell, `.td-*`, the copilot panel (`.cp-*`), buttons and toasts are the app's own, captured read-only from `studiolo` @ `48412aa`. Nothing there is changed.

This is the owner's T4 direction (Craft *Today*; `studiolo` `docs/superpowers/specs/2026-10-16-today-design.md` §0 and §7: "the calendar is meant to be a learning planning calendar"), taken further: the copilot plans and re-plans the week, and sessions can be Lumens, reading Lumens or live sessions.

Open `dist/today-plan-prototype.html`. It's also published as a claude.ai artifact that may use Claude.

## Try it

1. **Day** (Today as it is now, planned):
   - **Next up** replaces Continue. It shows the next planned session with **Start**, **Move to the next free time** and **Skip**, and keeps "Earlier today … Continue" underneath.
   - **My Focus** shows this week's time per topic: planned, done, the weekly target, and how short a topic is.
   - **The Big Picture** is still written from records, with no AI.
   - The **rail** is the day's timeline. What you did sits above the now line (the old activity log). The plan sits below it, with learning time tinted and busy times from your calendar hatched.
2. **Plan with the copilot** opens the panel and the **Week** grid. Try the suggestions in order:
   - *Plan the rest of my week*: fills the topic that's short.
   - *I'm presenting a courtyard house to a client on 6 November*: becomes a **goal** that draws on two topics. Its sessions count for both topics and for the goal, shown as a two-colour edge. That's the "overlapping" plan.
   - *Make Saturday lighter*: revises the plan. The earlier card reads "Replaced by a newer plan".
   - *Plan next week*: a **review of the week** (done, missed, quiz results) and next week's plan, with additions, moves and drops.

   Every answer is a **plan card**. Its changes show as dashed ghosts on the calendar until you **Apply** them, and Apply has **Undo**. Untick a line to leave it out.
3. **The week grid, Motion-style:**
   - Drag a session and it lands on the nearest free time.
   - Click a session for its details, **Start**, **Next free time**, **Skip** (it rolls forward on its own) or **Remove**.
   - Working hours with nothing planned fold to a thin band.
4. **Sessions:**
   - **Read** opens a **reading Lumen**, a long HTML lesson with a figure, a table, callouts, sources and a quiz. Today's 19:00 *Thermal mass in hot-arid courtyard houses* is written out in full.
   - **Watch**, **Live**, **Review** and **Library** open small simulations.
   - Finishing a session ticks it on the calendar. Quiz answers feed next week's plan.
5. **Learning time**: your windows, a daily maximum, and whether to plan around your calendar's busy times.
6. **Prototype bar:**
   - **A meeting lands on Thursday** adds a busy time, and the session under it moves itself.
   - **Skip to Sunday** plays the week out, so *Plan next week* has real results to work from.

## Real or simulated

- **Real, when you allow it:** Claude writes the copilot's plans (JSON lines of add, move, drop, link and goal, checked against your learning time, busy times and daily maximum before they're shown). It also writes any reading Lumen other than the thermal mass one, as you open it. This uses the `sample` capability on your own Claude usage, and the first use asks you.
- **Scripted when Claude isn't available:** the badge says "Copilot: scripted sample". The four suggestions above have scripted answers that still go through the same scheduler.
- **Simulated:**
  - the clock (Wednesday 21 October 2026, 15:35);
  - the calendar connection;
  - playback;
  - all learner data.

## Design choices worth deciding

1. **Today is the planner.** There's no separate Planner page: Day and Week are two views of Today. Learn stays the shelf, and Loci (the Graph) stays the map.
2. **The activity log stays, above the now line.** This answers the Today spec's open question of whether the log stays beside the plan.
3. **Goals span topics.** A deadline becomes a goal drawing on existing My Focus topics, and its sessions count for both. The alternative is a separate track per goal.
4. **Nothing is spent by planning.** Lumens are made the evening before (course parts when reached), as the course engine's one-lesson-ahead rule says.
5. **Busy times only.** The calendar connection reads free and busy, never event titles. A real Google Calendar connection is a separate decision (OAuth, privacy).
6. **No guilt.** Missed sessions roll forward, and nothing shows streaks (Today's anti-goals).

## Build

`node build.mjs` bundles `../live-lumens/capture/snap.json` (the captured Today screen and CSS), `src/plan.css` and `src/plan.js` into `dist/today-plan-prototype.html`.
