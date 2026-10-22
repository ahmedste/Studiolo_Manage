# Learn, slice 2: one Lumen, three formats

A **Lumen** is one idea, explained for you. It comes in three formats:
- **Watch:** slides and a narrator.
- **Listen:** two voices, 10–30 minutes, with a drive edition for the road.
- **Read:** a long read.

**Live** isn't a format: it's talking any Lumen through now. It's the live interaction from Learn, Live (slice 1) unchanged, now offered as a first-class choice next to the formats.

Learn has three tabs: **Home · Lumens · Courses**.
- **Home is the desk:** ask, pick up where you left off, and what's next for your goals.
- **Lumens is the full list.**
- **Every Lumen is made with sensible defaults** (the goal, topic and sources follow the question) and kept on one card. There's no brief to fill in. It's built on **Studiolo's real screens and styles**, captured read-only from `studiolo`. Spec: [`docs/superpowers/specs/2026-10-22-learn-slice-2-one-lumen.md`](../../docs/superpowers/specs/2026-10-22-learn-slice-2-one-lumen.md).

Open `dist/learn-lumens-prototype.html`. It's published as a claude.ai artifact that may use Claude.

## Try it

1. **Home.**
   - **Ask.** Pick **Watch, Listen or Read**, type a question, and press **Make a Lumen**.
     - Or pick **● Live**: the button becomes **Start live session**, and holding the mic (or Space) starts it as you speak.
     - One quiet line says what the format is, with "or talk it through live" beside it.
     - Watch and Read are made in the background. Listen starts playing in about half a minute.
   - **Pick up where you left off.** One list across formats: the malqaf at slide 4 (Resume, Go live), *Cooling* at chapter 2 (Resume, Drive edition), and Part 2 of *Origin of Species*.
   - **Next for your goals.** One card per goal, each with two next steps: a Lumen you have but haven't finished, or one to **Make** straight away.
2. **Cards show formats.**
   - *Cooling without machines* has Listen and Read; **+ Watch** makes the missing one straight away, onto the same card.
   - *How a malqaf moves air* has Watch, with **+ Listen** and **+ Read**.
   - **Live** on a watchable card talks it through.
3. **Every Lumen page has the same switcher:** Watch · Listen · Read | **● Live**.
   - Open *Cooling without machines*: it opens in Listen, and Read is one click away. Its Listen page links to the **drive edition**.
   - On the Watch page, Watch and Live are the player's two modes: **Live** goes live from the slide you're on, and **Watch** goes back to the recording. That replaces slice 1's separate Recording | Live switch.
   - Live from Listen or Read starts a live session on the same question.
4. **Lumens tab.**
   - Filter by format (All, Watch, Listen, Read, **Live sessions**), by state and by area.
   - Group **by date** or **by topic**.
5. Everything from the earlier prototypes still works:
   - Watch: go live, interruptions, Keep, resume live sessions.
   - Listen: ask the hosts, marks, Walk and Drive modes, the mini player, the recall question.

## Design notes

- **Formats are told apart quietly, not by colour.** Each has its icon and its word, a small neutral flag on the poster, and a different kind of poster:
  - Watch shows its title slide;
  - Listen shows the two hosts on a dark cover;
  - Read shows a paper title page.

  Buttons keep the app's blue whatever the format. Only Live keeps its small red dot.
- **The dock is one card.**
  - Its suggestions sit in one row that scrolls sideways.
  - A **transcription strip** on top of the input shows who's speaking (Studiolo or You) and up to two lines, lit word by word, while the input stays usable.
  - In a live session the strip is the only live caption (the slide's caption steps aside, and the transcript keeps the history), and the card turns live-red.

## Real or simulated

- **Real, when you allow it:** Claude writes new Watch slides, Listen chapters, the opening of a Read, live answers, the hosts' answers and recall feedback (the `sample` capability, on your own Claude usage).
- **Scripted when Claude isn't available:** the badge says "Live answers: scripted sample".
- **Simulated:**
  - The Read page is a stand-in for the long-read reader.
  - Browser voices stand in for ElevenLabs, and there's no microphone.
  - Goals, Library items and Lumens are sample data.

## Build

`node build.mjs` bundles the captured screens and CSS (`../live-lumens/capture/snap.json`), `src/learn.css` and `src/learn.js` (Learn: Home, Lumens, Courses, Watch, Read), and `src/listen.css` and `src/listen.js` (Listen, the brief, Walk and Drive modes) into `dist/learn-lumens-prototype.html`. `learn.js` and `learn.css` started as copies of slice 1 (`../learn-live`), and `listen.*` as copies of `../learn-dialogues`; those earlier prototypes are left as they were.
