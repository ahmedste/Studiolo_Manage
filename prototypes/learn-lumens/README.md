# Learn, slice 2: one Lumen, three formats

A **Lumen** is one idea, explained for you. It comes in three formats:
- **Watch:** slides and a narrator.
- **Listen:** two voices, 10–30 minutes, with a drive edition for the road.
- **Read:** a long read.

**Live** isn't a format: it's talking any Lumen through now. It's the live interaction from Learn, Live (slice 1) unchanged, now offered as a first-class choice next to the formats.

Learn has three tabs: **Home · Lumens · Courses**. Everything is made from one brief and kept on one card per Lumen. It's built on **Studiolo's real screens and styles**, captured read-only from `studiolo`. Spec: [`docs/superpowers/specs/2026-10-22-learn-slice-2-one-lumen.md`](../../docs/superpowers/specs/2026-10-22-learn-slice-2-one-lumen.md).

Open `dist/learn-lumens-prototype.html`. It's published as a claude.ai artifact that may use Claude.

## Try it

1. **Home → the bar.**
   - Pick **Watch, Listen or Read**, type a question, and press **Make a Lumen**.
   - Or pick **● Live**: the button becomes **Start live session**, and holding the mic (or Space) starts it as you speak, as in Learn, Live.
   - The line under the bar shows what it'll be made for and from: goal, topic, library items, what you've seen. **Tailor…** opens the whole brief.
   - **Talk it through live instead** starts a live session from any of the three formats.
   - Watch and Read are made in the background, with a "Making · Watch" row. Listen starts playing in about half a minute.
2. **Cards show formats.**
   - *Cooling without machines* has Listen and Read; **+ Watch** makes the missing one, from the same brief, onto the same card.
   - *How a malqaf moves air* has Watch, with **+ Listen** and **+ Read**.
   - **Live** on a watchable card talks it through.
3. **Every Lumen page has the same switcher:** Watch · Listen · Read | **● Live**.
   - Open *Cooling without machines*: it opens in Listen, and Read is one click away. Its Listen page links to the **drive edition**.
   - On the Watch page, Watch and Live are the player's two modes: **Live** goes live from the slide you're on, and **Watch** goes back to the recording. That replaces slice 1's separate Recording | Live switch.
   - Live from Listen or Read starts a live session on the same question.
4. **Lumens tab.**
   - Filter by format (All, Watch, Listen, Read, **Live sessions**), by state and by area.
   - Group **by date** or **by topic**.
5. **Home → Continue** shows the Lumen you were watching, plus **Also in progress** in other formats (a Listen at chapter 2, and its drive edition).
6. Everything from the earlier prototypes still works:
   - Watch: go live, interruptions, Keep, resume live sessions.
   - Listen: ask the hosts, marks, Walk and Drive modes, the mini player, the recall question.

## Real or simulated

- **Real, when you allow it:** Claude writes new Watch slides, Listen chapters, the opening of a Read, live answers, the hosts' answers and recall feedback (the `sample` capability, on your own Claude usage).
- **Scripted when Claude isn't available:** the badge says "Live answers: scripted sample".
- **Simulated:**
  - The Read page is a stand-in for the long-read reader.
  - Browser voices stand in for ElevenLabs, and there's no microphone.
  - Goals, Library items and Lumens are sample data.

## Build

`node build.mjs` bundles the captured screens and CSS (`../live-lumens/capture/snap.json`), `src/learn.css` and `src/learn.js` (Learn: Home, Lumens, Courses, Watch, Read), and `src/listen.css` and `src/listen.js` (Listen, the brief, Walk and Drive modes) into `dist/learn-lumens-prototype.html`. `learn.js` and `learn.css` started as copies of slice 1 (`../learn-live`), and `listen.*` as copies of `../learn-dialogues`; those earlier prototypes are left as they were.
