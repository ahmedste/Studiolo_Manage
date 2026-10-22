# Learning forms, and Dialogues (long-form audio)

Status: **draft for owner review**, 22 October 2026. **Partly superseded by [Learn slice 2](2026-10-22-learn-slice-2-one-lumen.md):** a Dialogue is now the **Listen** format of a Lumen. The Dialogues tab and the Home "Dialogue" switch are replaced by format choice. The rest of this design (the brief, the player, driving) stands. This is a study, a design and a prototype, not approved or built. Nothing has changed in `studiolo`. It builds on [Learn slice 1](2026-10-22-learn-live-slice-1.md) and [the Live Lumens design](2026-10-21-live-lumens-voice-design.md).

- Prototype: [`prototypes/learn-dialogues/`](../../../prototypes/learn-dialogues/README.md). It's Learn slice 1 plus Dialogues, on the app's captured screens.
- Sources:
  - Craft, Studilo space: *Learner context & Memory*, *Library*, *Course engine (long-term)*, *Explainers* (read 22 Oct 2026).
  - This repo's specs from 21 and 22 October.
  - "Long reads" (the HTML long-form pieces) are taken as given from the owner's brief. They aren't in `studiolo` or Craft yet.

## 1. The study: one brief, several ways in

Studiolo already has three ways to learn one idea:

| Form | How it reaches you | When it fits | Length |
|---|---|---|---|
| **Lumen** | Eyes and ears: slides and a narrator | At a desk, a first pass | 2–6 min |
| **Live session** | Conversation: Studiolo talks, you cut in | When you're stuck, or want it your way | 3–10 min |
| **Long read** (HTML) | Reading, at your own pace | Depth, references, coming back later | 10–30 min |

The proposal adds a fourth, **Dialogue**: ears only, on the move, two angles, 10–30 minutes.

**What makes these one system rather than four features** is that every form is made from the same brief and files its results back the same way.

**The brief (in).** Every form receives the same context pack:

| Part | What it is | Where it comes from today |
|---|---|---|
| Learner | The onboarding learner line | Built (`onboarding/learner.ts`) |
| Goal | The goal it serves: title and date | Designed: goals as Library notes with a goal record (Craft, *Learner context & Memory*). Not built. |
| Filed under | Area › topic | Built: areas are top-level Graph topics; Library items carry topic tags |
| Sources | Library items tagged to that topic, plus a grounding rule (only / mostly / open) | Built for one item (explain item, `EXPLAINER_ITEM_GROUNDING`). Several items is new. |
| Already known | What the learner has seen on this topic, in any form: Lumens watched, long reads read, Dialogues heard | New. The data exists (`explainer_views`, reading state) but isn't gathered per topic. It's the first step toward Memory. |
| Rules | No invented quotes, pages or numbers; say when unsure | The Lumen contract's rules |

**The results (out).** Every form:
- lives under its topic, in Learn and in the topic's lane on Loci;
- adds a line to the topic's journal;
- saves what you mark to the Library, tagged to the topic;
- records candidate evidence for the Learner Model (watched, answered, explained);
- feeds Today's Continue card.

**What this buys:**
- **"Other ways in" is free.** Any page about a topic can list that topic's Lumens, long reads, Dialogues and a live session.
- **No form repeats another.** "Already known" lets a Dialogue skip what a Lumen already showed.
- **One context to keep right.** Improving the brief (goals, memory) improves every form at once.

## 2. Dialogue

### 2.1 What it is

Two voices talk one idea through from two different angles, for 10, 20 or 30 minutes. It's made to be heard on a walk, a ride or a drive.

It differs from a podcast in three ways:
1. **It's made for you.** It serves your goal, quotes your sources and skips what you already know.
2. **You can take part.** Ask the hosts a question, mark a moment, and answer a recall question at the end.
3. **It's chapters, written one ahead.** Chapters you never reach are never written or voiced.

### 2.2 Making one

**Entry points:**

| Where | What happens | In the prototype |
|---|---|---|
| Learn Home bar | A third switch beside Lumen and Live: **Dialogue** → "Plan a Dialogue" opens the brief with your question | Yes |
| Learn → Dialogues | **New Dialogue** | Yes |
| A Lumen card on a topic | **Dialogue · N min** if one exists | Yes (opens it) |
| A topic on Loci; one or more Library items | "Make a Dialogue" with the topic or the items already chosen as sources | No (proposed) |
| The talk bar | "Make a Dialogue for my thesis" | Yes |

**The brief screen** (one screen, prefilled, so most people just press Make):
1. **What should they talk through?** A question, an idea, or a claim to test.
2. **What is it for?** Your goals; "just curious" is allowed. The goal decides what the hosts steer toward, and the second-to-last chapter applies everything to it.
3. **Where it lives.** Area › topic, guessed from the question.
4. **Two voices.** Two or three suggested pairs of angles for that topic, for example "the engineer and the historian", "the practitioner and the sceptic", or "the expert and a learner like you". They must disagree at least once.
5. **From your library.** Items tagged to the topic, ticked by default, and the grounding rule.
6. **Builds on what you know.** The list of what you've seen, and "Skip what I already know".
7. **Length:** 10, 20 or 30 minutes (4, 6 or 8 chapters).
8. **What the writer gets.** The brief exactly as the writer receives it, with where each line comes from.
9. **How it's made and what it costs** (see 2.5).
10. **Make it and listen now**, or **Make it for later** (written up to chapter 2, and saved for offline).

### 2.3 Listening

- **The player:** both voices, with the one speaking lit. The current sentence appears as a large caption, and the progress bar is split into chapters. There's Back 15 s, Play, Next chapter, speed (0.85–1.5×), **Mark**, **Walk mode**, and **Save for offline**.
- **Chapters:** titles, one-line points and lengths. Unwritten chapters say "Written when you reach chapter N".
- **Transcript:** speaker, role and the source chip when a host draws on a Library item. Tap a line to play from it. Two more tabs:
  - **Sources:** the Library items it may quote.
  - **Made from:** the brief.
- **Other ways in:** the topic's Lumens, long reads and a live session.
- **Your marks:** the moments you saved.
- **Walk mode:** full screen, dark, with 84–120 px targets and nothing that needs reading: Back, Play, Next, **Mark this moment**, **Hold to ask**. The screen may go off. On a phone, headphone and lock-screen controls play, pause and skip, and a double press marks.
- **The mini player:** keeps playing as you move round the app, with play/pause, Walk mode and Stop.

### 2.4 While it plays

| You | What happens | Where it goes |
|---|---|---|
| Ask a question (hold the mic, type, or say it in Walk mode) | The voice pauses. The host who wasn't speaking says "Good question, give us a second" (pre-voiced). Then the best-placed host answers in 30–60 words, the other adds an angle and hands back. Playback resumes at the start of the sentence you cut into. | Two "Answering you" turns in the transcript, kept with the Dialogue; a journal line on the topic |
| Mark that | Saves the line just heard | A Library quote note: speaker, time locator, topic tag, linked back to the moment. Plus a journal line. |
| "Pause", "next chapter", "go back", "slower" | Controls, said or typed | — |
| Answer the recall question (end of the last chapter) | The host says what you got right and the missing piece | Candidate evidence (`retrieved`) on the topic, kept on the recap. It doesn't change topic status ("the learner owns the truth"). |

**Asking is not a live voice session.** It's one small author call plus two short TTS lines, about 3–5 s behind a pre-voiced filler line. So it costs cents and uses no ElevenLabs Agents minutes.

### 2.5 How it's made (port notes)

- **The writer.** One plan call returns the title, takeaway and chapters (title plus the point each one settles). Then one call per chapter returns turns:
  - Each turn is `{who: A|B, say, src?, recall?, answer?}`, the same JSON-Lines habit as the Lumen contract.
  - Citations are checked against the chosen Library items as Lumen citations are.
  - The model is the Lumen author's. Use the 1-hour cached prefix for the brief and contract.
- **One chapter ahead.** Chapter *n* is written when the listener reaches chapter *n − 1*, and chapters 1–2 are written at once. This keeps cost tied to listening. A 30-minute Dialogue abandoned at minute 6 costs about 2.5 chapters.
- **Voices.** One TTS call per turn with two house voices, on the existing ElevenLabs path:
  - Audio is stored in R2 with word timings, as Lumen say-lines are.
  - Voicing runs one chapter ahead of playback.
  - ElevenLabs also offers a multi-speaker "text to dialogue" endpoint. Check whether it's still current and what it costs before choosing it over per-turn calls.
  - Recorded Lumens' speech pipeline isn't changed.
- **Playback on phones.** Lock-screen and headphone control needs a real `<audio>` element with the Media Session API (play, pause, seek, next track). Background playback in an iPhone web app has limits. Test it first, and treat a native shell as the fallback.
- **Cost (estimate, from the Lumen voice estimate of $0.65–0.80 per 3 minutes):**
  - Voice: about $0.22–0.27 a minute, so a 20-minute Dialogue is about **$4–5**. Faster voice models are roughly half that.
  - Writing: a few cents per chapter.
  - Asking the hosts: a few cents each.
  - Voice dominates. P0 must measure it.
- **Data (for the port).** Recommendation: reuse `explainers` with a `format` column (`lumen | dialogue`) and turn nodes. Learn lists, journal rows, views, ingest and R2 storage then work as they do for Lumens. A separate `dialogues` table is the alternative.
- **Switch:** a new `DIALOGUES` switch, closed by default; you first, then testers.

### 2.6 Decisions for the owner

| # | Decision | Recommendation |
|---|---|---|
| DL-1 | Name | **Dialogue**. "Conversation" is taken by the copilot; "Walk" is the mode, not the thing. |
| DL-2 | Voices | Two fixed house voices for v1. Per-pair voices later. |
| DL-3 | Storage | `explainers.format = 'dialogue'` with turn nodes (HIGH-tier migration) |
| DL-4 | Written one chapter ahead | Yes; "Make it for later" writes two chapters |
| DL-5 | Voice model and cap | A faster voice model for Dialogues if a P0 listen passes. Counts against the monthly cap; at most 60 Dialogue minutes per tester per month to start. |
| DL-6 | Ask the hosts in v1 | Yes: typed and held-mic questions, a pre-voiced filler line, answers kept on the Dialogue |
| DL-7 | Marks | Library quote notes with `origin = 'dialogue'` and a time locator, like video margin notes |
| DL-8 | Phones | Web with the Media Session API first. If iPhone background play fails the test, it's the case for a native shell. |
| DL-9 | Recall evidence | Kept as candidate evidence on the recap until the Learner Model exists |
| DL-10 | Goals | Dialogues need the goal record from the learner-context design (L-D decisions). Until it exists, the brief offers My Focus topics as goals. |

### 2.7 Dialogues for driving

**Why driving is its own case.** A driver's eyes and most of their attention belong to the road, and their attention comes and goes: a junction, a merge or a child in the back takes a minute away. They can't look at anything, write anything down or scrub back through a waveform. Calls and navigation prompts take the audio without warning. Connectivity drops in tunnels and car parks. Distraction guidelines for in-car devices (NHTSA's visual-manual guidelines, for example) limit single glances to about 2 seconds and a whole task to about 12 seconds of looking. Learning content has to be designed to need **none**.

So a Dialogue made for driving changes in two places: how it's written, and how it plays. In the prototype this is the **"Where will you listen?"** choice in the brief (Anywhere / Walking or cycling / Driving) and **Drive mode** in the player. *Cooling without machines, for the drive* is the sample.

**How it's written (the writer is told):**
1. **One main idea**, said plainly in the first minute, said again in other words in the middle and at the end. A driver who misses half still leaves with it.
2. **Signposted steps** ("three steps; step one…"), and every chapter after the first opens with a one-line **"Where we are"**.
3. **Each chapter stands on its own**, so a minute missed at a junction doesn't lose the thread.
4. **At most one number per point, rounded.** No lists longer than three, and no tables, spellings or diagrams.
5. **Nothing to picture in detail, look at, write down or do.** Questions are to think about, never to answer.
6. **Short sentences**, about 140 words a minute, and calm voices. The two hosts still disagree, but without raised stakes or sudden shifts. Emotional spikes take attention too.
7. **No sound effects or music**, and nothing that sounds like a phone, a horn or a car alert.
8. **The ending** is a recall question to *think* about, a short silence, the answer, and "three things to keep". The marks wait in the Library "for when you're parked".

**How it plays (Drive mode):**

| Moment | What happens |
|---|---|
| Before moving | A setup screen: "Set it up before you move." It saves for offline automatically and says which buttons do what. A Dialogue that wasn't written for driving says so, and offers **Make a drive edition** (the same brief, context = driving) or "Play it anyway". |
| Playing | No captions or text. One play/pause target about 220 px wide, the chapter, who's speaking, and three large buttons: **Say that again**, **Mark**, **Next chapter**. The screen can be off. |
| Steering-wheel and headphone buttons | Play/pause; Back = **say that again** (to the start of the current turn, or the one before if it has just begun); Next = next chapter. On the web these come through the Media Session API. |
| Marking and asking | By voice: the car's voice button, then "Mark that" (spoken confirmation: "Marked.") or a question. Answers are shorter while driving: under 30 words a turn, no numbers. |
| A call or a direction | Calls pause. Navigation prompts should duck the volume rather than pause. When the audio comes back it rewinds to the start of the interrupted turn, after one line of bearings: "Welcome back. We were on *chapter*: *its point*." Those lines can be voiced ahead, one per chapter, so they're instant. |
| Recall | Asked, then 8 seconds of quiet ("think it over"), then the host gives the answer. Saying it aloud is optional. The recap records "asked to think over while driving" and schedules it for a review. |
| Arriving | Proposed, not in the prototype: **Fit my drive**. You give the drive time, and it queues chapters (or Dialogues) to end on a chapter boundary. If you arrive mid-chapter, next time starts with the recap line. |

**What a web app can't do, and the native path.**
- **What the web gets:** played from a phone, a web app reaches the car over Bluetooth. With the Media Session API it gets lock-screen and steering-wheel play, pause, previous and next.
- **What needs a native app:**
  - **Showing up on the car's screen.** That means CarPlay, as an audio app using Apple's templates and its CarPlay audio entitlement, or Android Auto, as a media app.
  - **Taking voice from the car's voice button.** That means App Intents for Siri, or Assistant App Actions on Android, e.g. "Hey Siri, mark that in Studiolo".
  - **Reliable background playback on iPhone.**
- **Consequence:** Drive mode is the strongest case for a native shell. Until then, marking and asking in the car need the on-screen button, which is a glance; the setup screen should say so honestly.

**Decisions:**

| # | Decision | Recommendation |
|---|---|---|
| DL-11 | Drive editions | A separate edition made from the same brief with context = driving, not a setting on an existing Dialogue. The writing has to change, not only the player. **Make a drive edition** from any Dialogue. |
| DL-12 | Native shell | Plan CarPlay and Android Auto audio apps, with voice intents, as the first native work if Drive mode tests well. Web plus Media Session until then. |
| DL-13 | Interruptions | Pause for calls, duck for directions. Resume at the turn's start with a pre-voiced "where we were" line per chapter. |
| DL-14 | Fit my drive | Yes, after v1: the queue ends on chapter boundaries |
| DL-15 | Safety | No speed detection and no prompts to touch the screen while moving. Drive mode is the learner's choice, set up before the drive, and the copy never invites screen use on the move. |

## 3. Other forms worth adding

Ranked by fit with Studiolo (goal, topic, Library, Learner Model) and by cost. The first two close the learning loop. The four existing and proposed forms are mostly *intake*; these make the learner *produce* something, which is what moves a concept from `exposed` to `self_explained` and `retrieved`.

| # | Form | What it is | Why it fits | Effort |
|---|---|---|---|---|
| 1 | **Review** (spaced recall) | 3–5 short questions drawn from what you watched, heard and read on a topic, due at 1, 3, 7 and 21 days. Answered on Today, in under two minutes, by typing or voice. | The course engine already plans this cadence. It turns every other form into retained knowledge, and it's text, so it's cheap. | Low |
| 2 | **Teach-back** | You explain the idea back, aloud or in writing. Studiolo checks it against your sources and names one gap and one strength. | The strongest evidence of `self_explained`. It reuses the live voice line and the sources. | Medium |
| 3 | **Argue it** | A Dialogue in which you are one of the two voices: you take a side and a host argues the other. | Good for contested topics ("is the golden section real?"). It's a variant of Dialogue plus the live line. | Medium |
| 4 | **Site guide** | A Dialogue tuned for standing in a building: "walk to the court, turn to the deepest iwan". Chapters follow a route, with optional location prompts. | Specific to architecture and the Cairo-trip kind of goal. It's a Dialogue variant. | Low after Dialogue |
| 5 | **Studio brief** | A short design exercise from your goal ("size a wind tower for your plot"), with critique of a photo of your sketch. | It practises the skill rather than the fact. It uses photo upload and the Library. | Medium–high |
| 6 | **Guided reading** | Studiolo reads a PDF chapter alongside you, with margin questions page by page and a summary at the end. | It builds on the PDF reading room and margin notes. | Medium |
| 7 | **Daily brief** | A 5-minute two-voice audio of your new saves and today's goal step, for the commute. | Pairs with Today T6 (written Big Picture). It's a short Dialogue. | Low after Dialogue |
| 8 | **Map tour** | A narrated walk through an area of your Loci map: what's strong, what's thin, and what connects. | Already listed in the live design (§10). | Medium |

**Recommended order after Dialogues:** Review, then Teach-back. Site guide and Daily brief come almost free once Dialogues exist.

## 4. What the prototype shows and doesn't

- **Shows:**
  - the brief prefilled from goal, topic, Library and prior exposure;
  - a new Dialogue written by Claude (plan, then chapters one ahead) and playing within about half a minute;
  - two voices with live captions, chapters, a transcript with source chips, Sources and Made-from tabs;
  - asking the hosts, marking to the Library, voice commands;
  - Walk mode and the mini player;
  - recall with feedback and a recap;
  - journal lines on Loci;
  - "other ways in" across Lumens, long reads and live sessions;
  - the drive edition and Drive mode: drive writing rules in the brief, the setup screen, keyboard keys for the wheel's buttons, spoken "Marked.", a simulated call with the "welcome back" recap, the think-only recall, and "Make a drive edition" from a Dialogue not written for driving.
- **Doesn't:**
  - real ElevenLabs voices (two browser voices stand in);
  - a microphone;
  - lock-screen or headphone controls;
  - offline storage;
  - real goal records;
  - a long-read reader (it links to one).
  - CarPlay, Android Auto, Media Session controls or the car's voice button;
  - Fit my drive.
