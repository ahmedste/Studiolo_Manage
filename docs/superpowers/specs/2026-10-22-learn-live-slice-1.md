# Learn, slice 1: Live Lumens in a reorganised Learn

Status: **draft for owner review**, 22 October 2026. This is a design and prototype, not approved or built. Nothing has changed in `studiolo`. It builds on [the Live Lumens design](2026-10-21-live-lumens-voice-design.md) and narrows it to slice 1.

- Prototype: [`prototypes/learn-live/`](../../../prototypes/learn-live/README.md).
- Screens captured read-only from `studiolo` @ `48412aa`. The latest main, `5072dad`, adds faster Lumen voicing but no visible UI change to these screens.
- "Loci" is read here as the Graph's new name. The name isn't in the code on main yet.

## Scope of slice 1

- **The talk bar appears only in Learn and on Loci (the Graph).** Today, the Library and Settings don't have it.
- **Learn is reorganised around live learning:**
  - **Home:** start a live Lumen, continue what you were watching, a course shelf and recent Lumens.
  - **Lumens:** search, filters, grouped by day.
  - **Courses:** one row per course with its outline.
  - **Live sessions:** every time you went live.
- **The live studio is the Lumen player with a Recording / Live switch.**
  - The layout is the stage, with the slide strip under it and the transcript beside it.
  - The talk bar sits under the stage.

## The experience: answers to the eight questions

| # | Question | Answer (recommendation; owner decides) |
|---|---|---|
| 1 | What "live" means | **Yes, that shape, with one addition.** Every Lumen's player has **Go live**. The narrator takes over *from the slide you're on* and you can interrupt at any point. **Ending goes back to the recording** at the same slide. **Explain live** (Learn Home, a Loci topic, a course part) makes a new Lumen that *starts* in live mode. "Only asking questions while a recorded Lumen plays" is not a separate mode: in Recording mode a *typed* question gets a written answer (see 4), and talking to it means going live. |
| 2 | One length or two | **One.** No quick kind in slice 1. Explain live makes a normal 2–6 minute Lumen, written by the usual author and performed live as its slides arrive. The ~26 s wait for the first slide is filled by the narrator ("Give me a moment while I sketch the first slide"). Faster Lumens on main make that wait shorter still. |
| 3 | Interruptions | **Ship all of these:** stop / carry on, a question (becomes an aside slide), explain that another way, simpler, deeper (adds a slide), **from my field** (uses the onboarding learner line; add it), test me, skip, back, end live, and **tap part of a slide** ("what's this?", answered in a sentence or two). Nothing to drop. |
| 4 | Typing as well as talking | **Yes.** In Recording mode, typing gets a **written answer** in the transcript, and no voice minutes are used. In Live mode the line is open, so a typed question is answered aloud like a spoken one. The transcript always shows your words as you type or speak. |
| 5 | Keeping | **Yes.** **Keep this version** is offered as soon as a live session changes the Lumen (a reworded slide or a question). It saves the Lumen as you shaped it, with your questions as asides, and it is voiced the first time it's played. Without Keep a session leaves only a 30-day entry in Live sessions. |
| 6 | Where the conversation goes | **On the Lumen, as asides, plus one line in the topic's journal in Loci.** The topic's chat is untouched. *Difference from the earlier dock design:* there, things said through the dock on Loci went into that topic's copilot chat. That still stands for map work said on Loci (proposals, plans), but not for Lumen questions. |
| 7 | Who gets it first | **You only, then testers, on a new `LIVE_LUMENS` switch.** It is closed by default, like the other switches, and separate from `EXPLAINER_TESTERS`. |
| 8 | Devices | **Acceptable:** desktop Chrome and Edge first. Everywhere else gets "Live isn't on this browser yet". You can still watch and type questions there. Phones are a follow-up. I could not check the Safari and iPhone bug reports from here (the docs couldn't be fetched), so check them against ElevenLabs' current notes before deciding. |

## Screens

### Learn Home
1. **Live bar (slim):** a one-line title ("Live · What do you want to understand?") with a link to recent sessions, one input bar (hold-to-talk mic and **Explain live**), and one line of ideas. No card. On Home the floating talk bar stays hidden until this bar scrolls out of view.
   *Earlier draft (replaced):*
   - "What do you want to understand?" with an input, a hold-to-talk mic and **Explain live**.
   - Starter ideas from My Focus, the map and courses.
   - A three-step "how it works" (talk or type, cut in, keep it).
   - Recent live sessions.
2. **Continue:** the existing `.lx-cont` card, with **Go live from slide N** beside Resume.
3. **Courses:** cards with a segmented parts bar (watched, current, to come) and the next part.
4. **Recent Lumens:** the existing `.lx-card` grid. Each card gains **Go live**, and kept live versions are badged "Live · N asides".

### Lumens
The existing area chips (`.lx-filter`), plus search, "Made from" (A topic, Your library, The copilot, Live) and state (New, In progress). It's grouped by day as today.

### Courses
One row per course: poster, progress bar, **Continue: Part N** and **Take Part N live**, and the outline with watched and current parts.

### Live sessions
Each time you went live: what you asked, whether anything was kept, and a 30-day list.

### The studio (the Lumen player, Recording / Live)
- **Head:**
  - title;
  - a state pill ("Recording", or "Live · 1:05" with the time running);
  - the topic tag;
  - the Recording / Live switch;
  - **Keep this version**, enabled once something has changed.
- **Stage:**
  - the player's own `.xp-stage` slides, captions and pointer;
  - tags on slides that changed: "Rewritten · as soup", "Added · deeper", "Aside · your question";
  - "Writing the next slide…" while the author is behind.
- **Slide strip:** one thumbnail per slide, with rewritten slides and asides marked. Click one to jump to it; live, the narrator continues from there.
- **Transcript:**
  - narrator lines, with words lit as they're spoken and a slide number on each;
  - your lines, shown live as you speak or type, then marked "said" or "typed";
  - short system lines ("Slide 4 rewritten", "Paused: the line closes after 30 s of quiet");
  - a **Sources** tab listing what answers may quote.
- **Talk bar:**
  - a context chip, a level meter while it hears you, the live caption, hold-to-talk (or hold Space), text input and a narrator sound toggle;
  - suggestions change with the state: the interrupts while live, the end-of-Lumen choices after the last slide.

## How live answers are made (port notes)

- **Go live** runs over the existing deck: slides and `say` lines. The narrator speaks the `say` lines, and recorded audio isn't used while live.
- **Reworks, deeper slides, asides and checks** are small author calls returning contract-shaped slides. Each is validated by the existing ingest and stored as a new revision or an inserted node. The prototype asks Claude for JSON Lines in the same slide shapes.
- **Keep** writes a new Lumen:
  - it copies the deck with the changed revisions and the aside nodes (a new node kind, or `say` nodes with an `aside` flag; this needs a decision);
  - `origin = 'live'`;
  - one journal row on the topic.
  - Voice jobs run on first play, as the speed-layer pipeline does.
- **What the pages need:**
  - a voice session (§3.2 and §6 of the earlier design);
  - the `voice_session` spend hold;
  - `LIVE_LUMENS`;
  - a browser check;
  - no change to the recorded speech pipeline.

## Open decisions

1. Asides as a new node kind or a flag on `say` nodes (migration, HIGH tier).
2. Whether Keep replaces the original Lumen or saves alongside it. **Recommendation:** alongside, linked as "Live version of …".
3. How long Live sessions are kept (the prototype says 30 days) and whether transcripts are stored at all. Earlier recommendation V-D6: only if kept.
4. Whether Explain live on Loci opens Learn's studio (the prototype does) or plays in the Loci player panel. **Recommendation:** Learn's studio for slice 1.
