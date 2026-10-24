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
3. **Every Lumen page has the same frame.** The title row (title, the switcher Watch · Listen · Read | **● Live**, and **Share**) is identical in all three formats and stays pinned while you scroll.
   - Switching formats changes only what's under it: the switcher never moves, and each format has a fixed slot whatever its state ("+", "…", "12 min").
   - Each format's own actions (Keep, Drive edition, Save offline) sit on the line under the title, where they can't push the switcher around.
   - Open *Cooling without machines*: it opens in Listen, and Read is one click away. Its Listen page links to the **drive edition**.
   - On the Watch page, Watch and Live are the player's two modes: **Live** goes live from the slide you're on, and **Watch** goes back to the recording. That replaces slice 1's separate Recording | Live switch.
   - Live from Listen or Read starts a live session on the same question.
4. **Read is a real article.** Open *Cooling without machines* in Read:
   - the three mechanisms as small animated diagrams (wind pressure, the stack effect, evaporation);
   - a humidity slider, with "Dry desert afternoon" and "Humid coast in August" presets, showing how much the wet jar helps (qualitative, no invented numbers);
   - the courtyard house in section, with an **Afternoon | Night** toggle;
   - a malqaf vs barjeel table, steps for your site, a **Check yourself** question, and source chips that open in Commonplace.
   - The section list follows you as you read, and a thin line under the pinned title shows how far through you are.
   - *Courtyards in hot, humid places* has a breeze plan and a deep-vs-shallow court slider (plain geometry, the sun 45° up, stated on the figure).
5. **Share a Lumen.** **Share** on any Lumen page shares the whole Lumen: pick which formats go with it, copy the link, or **Preview as a viewer**.
   - The viewer gets the same frame and moves between the shared formats as you do.
   - They don't get Live, your questions and marks, your goal, the drive edition or your Commonplace notes.
   - A bar at the top says it's a preview; **Back to your Lumen** leaves it.
6. **Lumens tab.**
   - Filter by format (All, Watch, Listen, Read, **Live sessions**), by state and by area.
   - Group **by date** or **by topic**.
7. **Dictation (real microphone).** Tap the mic on Home or in the bottom bar and speak. Your words appear in the input as you talk, the last few revised as the engine settles. Tap again (or press Escape) to stop; the text stays in the input to read, edit and send, and Send also stops the mic. Holding the mic, or holding Space in the player, is push-to-talk: in a live session the words go straight in when you let go. The **Mic** menu in the prototype bar picks the engine:
   - **Moonshine (Tiny, Small, Medium)** runs on your device, free and private. Only when the page is served by `node serve.mjs` (it needs cross-origin isolation). The first tap downloads the model once; the mic's ring fills as it does.
   - **Browser speech** is the Web Speech API (Chrome and Safari; Chrome sends the audio to Google).
   - **Simulated** streams a fixed phrase, as before.
   - **Auto** picks Moonshine Small on a computer and Tiny on a phone, then browser speech, then the simulation. When it has to fall back, the bar says why.
8. Everything from the earlier prototypes still works:
   - Watch: go live, interruptions, Keep, resume live sessions.
   - Listen: ask the hosts, marks, Walk and Drive modes, the mini player, the recall question.

## Design notes

- **One frame, three formats.** The crumb and the title row are the same markup in Watch, Listen and Read (`lumenHead` in `learn.js`, used by `listen.js` too). Only the body fades in on a switch, and it doesn't move for reduced motion.
- **Sizes and breakpoints are the app's** (studiolo `main`; read only):
  - **Widths:** phone under 700 px, tablet 700 to 1099 px, desktop from 1100 px (the mobile and tablet designs, M-D10 and T-D1). Touch sizes follow the pointer, not the width: on a touch screen, buttons and switcher slots are 44 px and chips 36 px.
  - **Lumen pages:**
    - Under 1024 px, the side panel (transcript) goes under the content, as on the explainer player page (`explainer.css`).
    - Beside the content it's 280 to 440 px wide, 20 px from it, like the player's panel.
    - The title is 24 px, 20 px under 1024 px, the player title's sizes. Under 1024 px it gets its own line and the switcher the next.
  - **Read:** the course Reading's measure and type (`courses.css`): 66 characters at 18 / 1.56, 16 / 1.55 on phones. The section list sits beside the article from 1024 px; below that it's a row of chips.
  - **Lumens list:** the app's own grid and cards (`learn.css`): 330 px cards, one column under 640 px.
  - **Page edges:** the stage's own padding: 44 px, 24 px at 980 px and below, 16 px on phones.
  - Checked at 360, 390, 430, 699, 700, 744, 834, 1023, 1024, 1100, 1180, 1280 and 1440 px: nothing scrolls sideways, and the switcher sits in the same place in every format.
- **Diagrams use the app's own palette:** ink lines, board fills, the accent for cool air and the warn tone for warm air. Nothing else is coloured.

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
  - The two long reads are hand-written samples (`src/read.js`). A Read made in the prototype gets plain sections; in the app, the long-read generator would add the figures.
  - Sharing: the link is a placeholder and nothing leaves the page.
  - Browser voices stand in for ElevenLabs.
- **Real microphone:** dictation (see Try it, 7). On-device with Moonshine through `node serve.mjs`; as a claude.ai artifact or opened as a file it uses the browser's speech or the simulation.
  - Goals, Library items and Lumens are sample data.

## Build

`node build.mjs` bundles the captured screens and CSS (`../live-lumens/capture/snap.json`), `src/learn.css` and `src/learn.js` (Learn: Home, Lumens, Courses, Watch, Read, Share), `src/listen.css` and `src/listen.js` (Listen, Walk and Drive modes), `src/read.css` and `src/read.js` (the long reads and their figures), and `src/dictation.js` (the mic) into `dist/learn-lumens-prototype.html`.

**On-device dictation:** `node serve.mjs` serves that page at http://localhost:8080/ with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`, which Moonshine's multithreaded WebAssembly needs. The runtime (`@moonshine-ai/moonshine-wasm@0.1.5`) comes from jsDelivr, or from `node_modules` if you run `npm i --no-save @moonshine-ai/moonshine-wasm@0.1.5` here first. The models come from `download.moonshine.ai` and are cached in the browser. Plan and decisions: [`proposals/2026-10-24-dictation-moonshine.md`](../../proposals/2026-10-24-dictation-moonshine.md). `learn.js` and `learn.css` started as copies of slice 1 (`../learn-live`), and `listen.*` as copies of `../learn-dialogues`; those earlier prototypes are left as they were.
