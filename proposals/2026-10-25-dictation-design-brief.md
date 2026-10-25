# Brief: dictation in the composer (first prototype)

Status: brief for the building agent · 25 Oct 2026 · not yet approved for merge

Written for an AI agent working in the main app, `studiolo`. Background and the reasoning behind every choice: `Studiolo_Manage/proposals/2026-10-24-dictation-moonshine.md`. A working mock of the interaction: the **Learn Dictation** artifact (https://claude.ai/artifact/X9VuMHqmqNujmxGxH4dxHx), source in `Studiolo_Manage/prototypes/learn-lumens/src/dictation.js`.

## What to build

A mic button in the composer that turns speech into text, live. The user taps the mic and speaks, and their words appear in the input as they talk. They tap again to stop, read and fix the text, and press Send. It works like dictation in the Claude or WhatsApp apps.

This is **dictation only**: voice as a way of typing (spec A7). No voice agent, no spoken replies, no Live Lumens.

## How it should work

- **Tap the mic** to start. Words stream into the input, with the last few revised as the engine settles. **Tap again**, press **Escape**, or press **Send** to stop.
- **Hold the mic** (or hold Space) to talk only while held. When released, the text stays in the input.
- Dictation **adds to** anything already typed. The user can keep typing while it listens.
- The mic shows clearly when it's **listening**: a pulsing ring and a "Listening" state.
- **First use:**
  1. A one-line consent note: "Your voice is turned into text on this device. Audio is never uploaded."
  2. The browser's microphone prompt.
  3. A progress ring on the mic while the speech model downloads once.
- Stop automatically after 30 s of silence.
- Clear messages for a blocked microphone and for any failure, never a silent stop.

## Engine

1. **Moonshine Streaming, on-device** (`@moonshine-ai/moonshine-wasm`, pin `0.1.5`, MIT). Use `MicTranscriber`:
   - `onText` gives the live text and `onLine` gives each finished line;
   - `onProgress` drives the download ring;
   - `setKeyterms([...])` takes product words and the names on screen.
   Use **Small Streaming** on computers and **Tiny Streaming** on phones and low-memory devices. It costs nothing per minute, and no audio leaves the device.
2. **Fallback: the browser's Web Speech API** (`interimResults: true`), when Moonshine can't run.
3. If neither is available, hide the mic.

Keep the engine behind one small interface (`DictationProvider`: start, stop, cancel, onText, setKeyterms), so a paid streaming API can be added later without touching the UI.

## The one hard part: cross-origin isolation

Moonshine's WebAssembly build needs `SharedArrayBuffer`, which means the page must send:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

That affects the **whole app**, not just one page. It can break:
- cross-origin images, audio and PDFs (presigned R2 links, the media Worker);
- popup sign-in or payment;
- embedded videos and iframes.

**Do this before any UI work:**
1. Turn on the `-Report-Only` versions of these headers locally.
2. Click through every screen and list every resource the reports flag.
3. **Stop and report the list to the owner.**

Turn the real headers on only after the owner agrees. Until then, the prototype runs with the Web Speech fallback.

## Scope of this first prototype

- **In:**
  - the isolation audit report;
  - the dictation feature module (`src/features/dictation/`);
  - the mic in the existing composer (`copilot-composer.tsx`, and the Learn talk bar if it exists);
  - behind a feature flag `DICTATION`, testers only.
- **Hosting:**
  - Load the Moonshine runtime from our own origin: copy the package's `dist/` into `public/vendor/moonshine/0.1.5/` with a script, and import it at runtime by URL so the bundler doesn't touch it.
  - Models can come from Moonshine's CDN for now. Mirroring them to R2 comes later.
- **Out:** model mirroring to R2, other languages, punctuation cleanup, a paid fallback, mobile apps, and anything to do with voice replies.

## Things to measure and report

- Model download size and time for Tiny and Small.
- Time until the first word appears, and the delay at the end of a sentence.
- How it runs on a mid-range Android phone, an iPhone in Safari, and a laptop: CPU, memory, and whether Safari reloads the tab.
- Accuracy on 20 Studiolo sentences full of product terms (Lumen, Commonplace, Loci, malqaf, iwan…), with and without key terms.
- Whether the output has punctuation and capital letters.

## Rules

Follow `AGENTS.md` in `studiolo`; it wins over this brief.
- Work on a branch. Don't merge or push until the owner has tested it and said so.
- **Ask before adding the dependency** and before changing app-wide headers.
- No migrations, new paid services or credential changes.
- Update the owning guides in `project-docs/implementation/` in the same branch.
- Before handing over: lint, typecheck, tests and build. Add one Playwright test that uses a fake mic (`--use-file-for-fake-audio-capture` with a known WAV) and checks that the text appears in the composer.

## Done means

- The isolation audit list has been handed to the owner.
- Behind the flag, a tester can tap the mic, see their words appear live, edit them and send, on Chrome and Safari.
- It falls back cleanly when Moonshine can't run, and every failure shows a clear message.
- A short report gives the measurements above and recommends next steps.
