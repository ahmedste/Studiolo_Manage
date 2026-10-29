# Proposal: dictation with Moonshine (on-device, live)

Status: **parked** (29 Oct 2026). The owner chose ElevenLabs Scribe for dictation for now: see `2026-10-29-dictation-elevenlabs-brief.md`. Kept as the research for on-device dictation later.

Scope: **dictation only.** The user taps the mic, sees their words appear live in the input, edits them, and sends. This is not Live Lumens or live explainers: there is no voice agent and no spoken reply. It is spec A7 ("voice is just a way of typing"), the mic in the composer.

What this is based on:
- Moonshine repo `moonshine-ai/moonshine` @ 24 Aug 2026 (`docs/`, `language-bindings/wasm/README.md`, `examples/web/dictation/`), and the npm package `@moonshine-ai/moonshine-wasm@0.1.5` (unpacked and inspected).
- The Studiolo stack as these specs describe it: `docs/superpowers/specs/2026-10-21-live-lumens-voice-design.md` (Next.js client, Vercel fra1) and `2026-10-22-learn-v2-implementation-overview.md` (no microphone code in the app yet; `copilot-composer.tsx`; the planned `TalkBar`), plus the R2 and Workers setup in `2026-10-18-cost-dashboard-design.md`.
- **Not read:** the `studiolo` repo itself, which isn't attached to this session. File paths in that repo below are taken from the specs and must be checked.

## 1. Recommendation

Run **Moonshine Streaming in the user's browser** through WebAssembly:

- **Cost:** $0 per minute. No audio leaves the device, so there are no usage-ledger rows, no spend cap and no data-processing terms to agree.
- **Behaviour:** the same live, word-by-word experience as the Claude and ChatGPT apps. `onText` fires with provisional text while the user speaks, and `onLine` fires with the committed line when they pause.
- **License:** MIT for the library and for every streaming model.

Put it behind a small `DictationProvider` interface so that, where Moonshine can't run, the composer falls back to the browser's Web Speech API (also free), and a paid streaming API can be added later without touching the UI.

## 2. What Moonshine is today (Oct 2026)

| Item | Fact |
|---|---|
| Package | `@moonshine-ai/moonshine-wasm` 0.1.5 (24 Aug 2026). **Don't use** the older `@moonshine-ai/moonshine-js` / `@usefulsensors/moonshine-js`: last published July 2025, beta, and it pulls in transformers.js. |
| Engine | C++ core plus ONNX Runtime compiled to `moonshine.wasm` (13.2 MB uncompressed) and a 156 KB `moonshine.mjs` loader. Runs SIMD + multithreaded on Web Workers. |
| API | `new MicTranscriber().modelArch(...).onText(...).onLine(...)`, then `await load()`, `start()`, `stop()`, `close()`. Also `setKeyterms([...])`, `modelsFrom({...})`, `onProgress`, `onError`, `audioConstraints`. |
| Models (English) | **Medium Streaming** 245M params, 6.65% WER · **Small Streaming** 123M, 7.84% · **Tiny Streaming** 34M, 12.0% (Open ASR Leaderboard average). For comparison, Whisper Large v3 is about 7.4%. |
| Download size | Medium Streaming is about **255 MB** (int8, file list in Moonshine's docs). Small and Tiny weren't measured because the proxy here blocks the model CDN. From parameter counts, expect roughly **~130 MB** and **~40 MB**. Measure both in the spike. |
| Other languages | Streaming models exist for Spanish, German, Japanese, Arabic, Mandarin, Vietnamese and Tagalog (MIT). |
| Domain words | `setKeyterms(['Lumen', 'Commonplace', ...])` cuts errors on the listed words by up to about 40%. The list can change while recording. |
| Where models load from | `https://download.moonshine.ai` by default, cached in the browser's Cache Storage (`moonshine-models-v1`). Self-hosting works through `modelsFrom({ 'encoder.ort': url, ... })`. |
| Hard requirement | **Cross-origin isolation.** The published build needs `SharedArrayBuffer`, so the page must be served with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`. A single-threaded fallback exists, but only if you build it yourself with emsdk; it isn't on npm. |

## 3. Decisions to make

| # | Decision | Recommendation |
|---|---|---|
| D1 | Which model | **Small Streaming** on desktop. **Tiny Streaming** on phones and low-memory devices (`navigator.deviceMemory <= 4`, or iOS). Medium could later be a "best accuracy" setting. |
| D2 | When it downloads | On the **first mic tap**, with a progress ring on the mic button, never at page load. After the first use, preload in idle time on later visits. The Cache Storage copy makes it instant from then on. |
| D3 | Where models are hosted | **Spike:** use Moonshine's CDN. **Production:** mirror the version-pinned files to R2 and serve them through the media Worker (`/models/moonshine/small-streaming-en/quantized_26_08_21/...`) with `Cache-Control: immutable`, CORS and `Cross-Origin-Resource-Policy: cross-origin`. That keeps us off a third-party CDN, and R2 has no egress fee. **Don't** put models in Vercel `public/`, because of bandwidth and deploy size. |
| D4 | Where the wasm is hosted | Same origin. Copy `node_modules/@moonshine-ai/moonshine-wasm/dist/` to `public/vendor/moonshine/0.1.5/` with a postinstall script, and import it at runtime by URL. That's 13 MB, compressed by Vercel, and cached long-term because the path carries the version. This also keeps the bundler from touching emscripten code (§5, step 3). |
| D5 | Cross-origin isolation | The biggest risk, covered in §4. Decide after the audit. |
| D6 | Fallback | If `!crossOriginIsolated`, the wasm fails, or the model is still downloading: use the **Web Speech API** (`interimResults: true`). It's free but uneven: Chrome sends audio to Google, and Firefox has none. No fallback at all: hide the mic. A paid API (Deepgram or AssemblyAI streaming) stays a later option behind the same interface. |

## 4. The cross-origin isolation audit (do this first)

`COOP: same-origin` + `COEP: require-corp` change how the **whole app** loads things from other origins. Next.js navigates on the client, so isolation is set by the document the user first loaded. It has to be set app-wide (or for the whole `/(app)` route group); it can't be set only on the page that has the mic.

What can break:
- **Cross-origin images, audio, video and PDFs** (presigned R2 links, the media Worker, ElevenLabs audio in R2, avatars, link-preview images). Each must either send `Cross-Origin-Resource-Policy: cross-origin`, or be loaded with `crossorigin="anonymous"` and answered with CORS headers. The media Worker can add the header. Presigned R2 links straight from the bucket probably can't, so check them (this ties into B2 of `2026-10-24-pdf-speed-brief.md`).
- **Popup sign-in and payment** (OAuth popups, Stripe Checkout in a popup). COOP `same-origin` cuts `window.opener`, so redirect flows keep working but popup flows may not.
- **Third-party scripts and iframes** (analytics, embeds such as YouTube in Lumens or Commonplace link previews). Iframes need to opt in, or carry the `credentialless` attribute.

Easier option: `COEP: credentialless` loads cross-origin resources without cookies and doesn't need CORP from third parties. Chrome supports it, and Firefox is reported to, but **Safari doesn't**. Middleware could send `credentialless` to Chromium and Firefox and `require-corp` to Safari, but that only helps if Safari also passes the audit.

**Audit method:** run the app locally with `COEP: require-corp` set in **report-only** mode (`Cross-Origin-Embedder-Policy-Report-Only`), click through every surface, and list what the reports show. Then decide D5:
- **(a)** Turn isolation on app-wide and fix the listed resources. This is the recommendation if the list is short.
- **(b)** Build the single-threaded wasm ourselves (emsdk 4.0.8). It needs no headers but is slower, so it has to be measured.
- **(c)** Ship the Web Speech fallback first and turn on Moonshine once (a) is done.

## 5. Build steps

### Step 0: spike in this repo (half a day to a day)

**Built** in the current Learn prototype rather than a separate page: `prototypes/learn-lumens/src/dictation.js`, served isolated by `prototypes/learn-lumens/serve.mjs`. Checked in headless Chromium: the page is cross-origin isolated, the Moonshine runtime loads from the npm package and requests the model from `download.moonshine.ai`, a failed download falls back to browser speech with a note, and tap, hold, Space, Escape and Send behave as designed. **Not yet checked:** real speech through a Moonshine model, because this sandbox can't reach the model CDN. The measurements below are still to do, on real devices.

What the spike covers:
1. `npm install @moonshine-ai/moonshine-wasm@0.1.5`. Serve with COOP/COEP headers; Moonshine's `examples/web/serve.mjs` shows how.
2. Copy the flow from Moonshine's own finished dictation app, `examples/web/dictation/index.html`: `MicTranscriber` + `onText` for the grey provisional text, `onLine` for committed text, and `onProgress` driving the ring.
3. Measure on a mid-range Android phone, an iPhone in Safari, and a laptop:
   - download size and time for Tiny and Small;
   - time to first word and latency at the end of a phrase;
   - CPU and memory use, and whether iOS Safari reloads the tab;
   - accuracy on 20 Studiolo sentences full of product terms, with and without `setKeyterms`;
   - whether the output has punctuation and capital letters, or whether we need a cleanup pass.
4. Write the results into this proposal and pick D1.

### Step 1: headers (in `studiolo`, after the audit)

In `next.config.ts`:

```ts
async headers() {
  return [{
    source: '/:path*',
    headers: [
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' }, // start as -Report-Only
    ],
  }];
}
```

Add `Cross-Origin-Resource-Policy: cross-origin` to every media Worker response (`workers/media/`). Fix each item the audit found.

### Step 2: vendor the runtime

- `scripts/vendor-moonshine.mjs` copies `node_modules/@moonshine-ai/moonshine-wasm/dist/*` into `public/vendor/moonshine/<version>/`. Run it from `postinstall`, and git-ignore the output.
- Production model mirror (D3): `scripts/mirror-moonshine-models.mjs` downloads the pinned model files once and uploads them to R2 under `models/moonshine/<arch>/<quant>/`.

### Step 3: the feature module

`src/features/dictation/`:

```
types.ts            DictationProvider { load(onProgress), start(), stop(), close(),
                    onPartial(text), onFinal(text), setKeyterms(string[]), kind }
moonshine.ts        MoonshineProvider. Imports at runtime by URL, so the
                    bundler never sees the emscripten code:
                      const m = await import(/* webpackIgnore: true */
                        '/vendor/moonshine/0.1.5/index.js');
                    new m.MicTranscriber().modelArch(pickArch())
                      .modelsFrom(modelUrls(arch))   // production: R2 mirror
                      .onText(...).onLine(...).onProgress(...).onError(...)
web-speech.ts       WebSpeechProvider (fallback, interimResults: true)
pick-provider.ts    crossOriginIsolated + feature flag + device class
                      → Moonshine | WebSpeech | none
use-dictation.ts    React hook: state (idle | downloading p | listening | error),
                    committed text + provisional text, toggle()
mic-button.tsx      Mic with progress ring, live dot and a press-and-hold option
keyterms.ts         Product words + the current scope (map, topic and Lumen
                    titles, the learner's name) passed to setKeyterms
```

All of this is `'use client'` and loaded with `dynamic(..., { ssr: false })`. Nothing runs on the server.

### Step 4: wire into the composer

- Put the mic button in `copilot-composer.tsx` (the existing input) and in the new `TalkBar`, once Phase 4 has built it.
- Text behaviour:
  - committed lines are inserted at the cursor;
  - provisional text shows grey after them and is replaced on every `onText`;
  - the user can type while dictating;
  - tapping Send stops the mic and sends what's in the box.
- First use: a one-time consent sheet ("Your voice is turned into text on this device. Audio is never uploaded."), then the browser's mic prompt.
- Stop automatically after 30 s of silence, the same rule as the live-voice spec (§3.2).

### Step 5: flag, test and ship

- Feature flag `DICTATION`, testers first, as with `LUMEN_LISTEN` and `LIVE_LUMENS`.
- Playwright: a fake mic stream (`--use-file-for-fake-audio-capture`) with a known WAV, asserting that the text appears in the composer.
- Update the owning guides in `project-docs/implementation/` (frontend, plus a short dictation section), as `AGENTS.md` asks.

## 6. Costs

| Item | Cost |
|---|---|
| Transcription | $0 (runs on the user's device) |
| Model hosting on R2 | about 0.2–0.4 GB stored, which is pennies a month. Egress is free, and each user downloads once per model version. |
| Wasm on Vercel | 13 MB uncompressed, cached long-term, one download per user per version. |
| A paid fallback, if ever added | about $0.004–0.008 per minute (Deepgram or AssemblyAI streaming, list prices from memory, to be confirmed). |

## 7. Risks

| Risk | Mitigation |
|---|---|
| COOP/COEP breaks embeds, popups or media | Report-only audit first (§4). Web Speech fallback until it's fixed. |
| A 40–130 MB first download on mobile data | Download only when the user taps, with a progress ring. Tiny on phones. Web Speech covers the wait. |
| iOS Safari memory limits | Measure in the spike. Tiny on iOS. Fall back if loading fails. |
| The package is young (0.1.x) | Pin the exact version. The runtime is vendored, so an upgrade is a deliberate change. |
| Accuracy on product words | `setKeyterms` from the current scope. LoRA fine-tuning is available later (`moonshine-voice finetune`). |
| No punctuation or capitals | Check in the spike. If needed, add a cheap formatting pass on Send. |

## Sources

- Moonshine repo and docs: https://github.com/moonshine-ai/moonshine (README, `docs/models/available-models.md`, `docs/using/downloading-models.md`, `docs/models/domain-customization.md`, `language-bindings/wasm/README.md`, `examples/web/dictation/`)
- npm: https://www.npmjs.com/package/@moonshine-ai/moonshine-wasm
- Model cards: https://huggingface.co/UsefulSensors/moonshine-streaming-medium · https://huggingface.co/UsefulSensors/moonshine-streaming-tiny
- Transformers docs: https://huggingface.co/docs/transformers/v5.5.1/en/model_doc/moonshine_streaming
- COEP `credentialless`: https://developer.chrome.com/blog/coep-credentialless-origin-trial · https://next.centralcsp.com/en/docs/web-security/policies/cross-origin-embedder-policy
