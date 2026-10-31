# Brief: dictation in the composer with ElevenLabs Scribe (first prototype)

Status: brief for the building agent · 29 Oct 2026 · not yet approved for merge

**This replaces** `2026-10-25-dictation-design-brief.md`. On-device Moonshine is **parked**: the owner chose ElevenLabs for now. The Moonshine research stays in `2026-10-24-dictation-moonshine.md` for later.

Written for an AI agent working in the main app, `studiolo`. Working mock of the interaction: `Studiolo_Manage/prototypes/learn-lumens/src/dictation.js` (engine `elevenlabs`), with a local token server in `prototypes/learn-lumens/serve.mjs`.

## What to build

A mic button in the composer that turns speech into text, live. The user taps the mic and speaks, and their words appear in the input as they talk. They tap again to stop, read and fix the text, and press Send. It works like dictation in the Claude or WhatsApp apps.

This is **dictation only**: voice as a way of typing (spec A7). No voice agent, no spoken replies, no Live Lumens.

## How it should work

- **Tap the mic** to start. Words stream into the input, with the last few revised as the engine settles. **Tap again**, press **Escape**, or press **Send** to stop.
- **Hold the mic** (or hold Space) to talk only while held. When released, the text stays in the input.
- Dictation **adds to** anything already typed. The user can keep typing while it listens.
- The mic shows **Connecting…** briefly, then **Listening**, with a pulsing ring.
- **First use:**
  1. A one-line consent note: "Your voice is sent to ElevenLabs to be turned into text. Studiolo doesn't keep the audio."
  2. The browser's microphone prompt.
- Stop automatically after 30 s of silence.
- Clear messages for a blocked microphone, a failed connection, or the spend cap being reached, never a silent stop.

## Engine: ElevenLabs Scribe v2 Realtime

Studiolo already uses ElevenLabs for voices, so this needs no new vendor. Details below are from the SDK packages themselves (`@elevenlabs/client` 1.32.1, `@elevenlabs/elevenlabs-js` 2.75.0); check them against ElevenLabs' docs.

- **Model:** `scribe_v2_realtime`, over a WebSocket at `wss://api.elevenlabs.io/v1/speech-to-text/realtime`.
- **Auth: the API key never reaches the browser.**
  1. A server route mints a **single-use token** with `client.tokens.singleUse.create("realtime_scribe")` (`POST /v1/single-use-token/realtime_scribe`). It lasts 15 minutes and is used up when the socket connects.
  2. The browser connects with that token.
- **Client:** `Scribe.connect({...})` from `@elevenlabs/client`, or the `useScribe` hook from `@elevenlabs/react`. It opens the mic itself (`microphone: { echoCancellation, noiseSuppression, autoGainControl }`). Options:
  - `modelId: "scribe_v2_realtime"`;
  - `commitStrategy: CommitStrategy.VAD`, so the server commits each phrase after a pause;
  - `keyterms`: up to **50 terms of up to 20 characters**. Use product words (Lumen, Commonplace, Loci…) plus the names on screen;
  - `previousText`: what's already typed, for casing and continuing the sentence;
  - `languageCode`, if known.
- **Events:**
  - `PARTIAL_TRANSCRIPT` (`.text`) is the live line;
  - `COMMITTED_TRANSCRIPT` (`.text`) is a finished phrase to keep;
  - on stop, call `commit()`, wait briefly for the last committed text, then `close()`;
  - also handle `ERROR`, `AUTH_ERROR`, `QUOTA_EXCEEDED`, `RATE_LIMITED` and `CLOSE`.
- **Fallback:** the browser's Web Speech API, when ElevenLabs is off, over the cap, or fails. If neither works, hide the mic.
- Keep the engine behind one small interface (`DictationProvider`: start, stop, cancel, onText, setKeyterms), so Moonshine or another vendor can come back later without touching the UI.

**No cross-origin isolation is needed.** That was Moonshine's hard part, and it's gone. Two smaller things to check instead:
- **CSP:** allow `connect-src wss://api.elevenlabs.io`. The SDK loads its audio worklet from a `blob:` URL, unless you self-host the shipped worklet (`@elevenlabs/client/worklets/scribeAudioProcessor.js`) and pass `microphone.workletPaths.scribeAudioProcessor`. Prefer self-hosting.
- **Hosting:** all of this is in the same Next.js app on Vercel. The token route is an ordinary server route.

## Cost, spend cap and ledger

- **Price:** about **$0.39 per hour of audio** (about $0.0065 per minute), billed per second, with discounts on annual Business plans. This is from third-party listings, so confirm it on ElevenLabs' pricing page. A heavy user (150 min a month) costs about $1 a month.
- **Spend cap:** add a `dictation` kind to `checkSpendCap` and hold a small amount per session (for example 10 minutes, about $0.07) when minting the token. Refuse the token when over the cap.
- **Usage ledger:** today the ledger requires ElevenLabs rows to have `purpose='speech'` and a `job_id`. Dictation needs its own purpose (and maybe a session id instead of a job id). **That's a migration: stop and ask the owner** before writing it. Until it's approved, log dictation sessions (seconds of audio, the user, the estimated cost) without a migration, and say how in the report.
- **Limits to confirm:**
  - the maximum session length (one listing says 10 minutes): reconnect with a new token if a session hits it;
  - whether ElevenLabs holds a precharge while a session is open;
  - whether key terms cost extra on realtime.

## Privacy

- Audio leaves the device and goes to ElevenLabs. Studiolo stores no audio, and the text exists only in the input until the user sends it.
- Zero-retention (`enableLogging: false`) is for enterprise customers only. Note what the current plan does, and check that the Legal & Data Terms page in Craft covers speech-to-text.

## Scope of this first prototype

- **In:**
  - the token route, behind auth and the spend cap;
  - the dictation feature module (`src/features/dictation/`) using `@elevenlabs/client`;
  - the mic in the existing composer (`copilot-composer.tsx`, and the Learn talk bar if it exists);
  - behind a feature flag `DICTATION`, testers only.
- **Out:** Moonshine and on-device models, other languages, transcript editing (`transcriptEdit` costs 30% more), mobile apps, and anything to do with voice replies.

## Things to measure and report

- Time from tapping the mic to the first word (including the token request and the connection), and the delay at the end of a sentence.
- Accuracy on 20 Studiolo sentences full of product terms, with and without key terms.
- Punctuation and capitals in the output, and whether `noVerbatim: true` (which drops "um" and false starts) reads better.
- Real cost per minute from ElevenLabs' usage page, against the estimate.
- How it behaves on Chrome, Safari on Mac and iPhone, and Android.

## Rules

Follow `AGENTS.md` in `studiolo`; it wins over this brief.
- Work on a branch. Don't merge or push until the owner has tested it and said so.
- **Ask before adding the dependency** (`@elevenlabs/client`, or `@elevenlabs/react`) and before any migration.
- No new credentials. Use the existing ElevenLabs key from the environment, on the server only.
- Update the owning guides in `project-docs/implementation/` in the same branch.
- Before handing over: lint, typecheck, tests and build. Add one Playwright test that stubs the Scribe client and the token route and checks that the text appears in the composer.

## Done means

- Behind the flag, a tester can tap the mic, see their words appear live, edit them and send, on Chrome and Safari.
- The API key never reaches the browser, the spend cap is enforced, and dictation usage is recorded.
- It falls back cleanly, and every failure shows a clear message.
- A short report gives the measurements above and recommends next steps.

## Sources

- ElevenLabs SDKs on npm: `@elevenlabs/client` (Scribe realtime, events, options), `@elevenlabs/elevenlabs-js` (`tokens.singleUse.create`), `@elevenlabs/types` (message shapes).
- Pricing: https://elevenlabs.io/realtime-speech-to-text · https://vercel.com/ai-gateway/models/scribe-v2-realtime · https://opentranscription.io/blog/scribe-v2-realtime-by-elevenlabs
