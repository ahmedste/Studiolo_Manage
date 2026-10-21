# Live Lumens and the voice narrator: framework, system design and prototype plan

Status: **draft for owner review**, 21 October 2026. Nothing here is approved, built or changed in `studiolo`. The decisions in §12 are the agent's recommendations and are waiting on the owner.

Sources:
- `studiolo` @ `e8ad3c7`, read-only. Files are cited inline.
- Craft, Studilo space: *Vision & Principles*, *Explainers*, *Courses*, *Course engine*, *Copilot*, *Graph actions*, *Learner context & Memory*, *Features & Ideas*, *Pricing & Unit Costs*, *Stack & Architecture*, *Legal & Data Terms*, *Changelog* (read 21 Oct 2026).
- ElevenLabs Agents SDK type definitions: `@elevenlabs/react@1.19.0`, `@elevenlabs/client@1.29.0`.
- elevenlabs.io docs and pricing, from search results; direct page fetches were blocked.

Words used here:
- **Lumen**: the user-facing name for an explainer.
- **ElevenLabs Agents**: ElevenLabs' real-time voice agent platform, now branded "ElevenAgents".

---

## 1. The idea in one paragraph

Studiolo already has a text copilot that can read the map, propose topics, propose change plans and offer Lumens. It also has Lumens: authored slide decks whose narration is voiced line by line ahead of time. This design adds **one live voice**: the copilot, speaking. A learner can start talking to it from anywhere in the app. The voice can do three things:
- Answer and act, under the same rules as the text copilot.
- **Narrate a Lumen live** (a *Live Lumen*), so the learner can cut in: "stop", "explain that another way", "go back", "test me".
- Reach into a recorded Lumen mid-playback to answer a question, then hand back to the recording.

All three are one assistant (spec A8), and voice stays "an input method, not a separate command system" (spec A7). Both rules come from `docs/superpowers/specs/2026-10-05-ai-direction-graph-copilot-design.md`.

## 2. What exists today (and what doesn't)

| Area | Today | Gap for live voice |
|---|---|---|
| Lumen generation | `generateQuick` (`src/features/explainers/service.ts:204`) → Trigger task `explainer-generate`. Opus 5.5 streams contract-1.4 markup: `<item>` slides and `<say>` lines with `[[s3.anchor]]` pointer refs and checked citations. First slide in about 26 s, about $0.13 per Lumen. | Too slow to generate everything live. Fast enough if the learner is talked to while it writes. |
| Lumen voice | One ElevenLabs call per say line: `POST /v1/text-to-speech/{voice}/with-timestamps` with `eleven_v4`, house voice `v5JQmAUezEqHZcOGEbiT` (`speech/elevenlabs.ts:22-59`, `brand-kit/kit.ts:83-97`). Word timings drive the pointer. Voice cost: estimated $0.65–0.80 per 3-minute Lumen, not measured. | One-way. No microphone anywhere in the app. |
| Player | A single `<audio>` element whose clock drives slides, pointer and animation moments (`player/use-playback.ts`, `player/timeline.ts:69-96`). "Ask" only opens the two authored follow-ups, pre-filled into the copilot on `/graph?ask=…` (`player/ask.ts`). | No way to ask a question mid-play. The playback clock is tied to the audio element. |
| Copilot | Sonnet 5.5, at most 5 calls per turn, one tool at a time (`copilot/turn.ts`). Tools: `read_map`, `read_topic`, `find_topics`, `read_branch`, `show_on_map`, `ask_clarifying_question`, `propose_topics`, `propose_changes`, `explain`, `read_course`, `plan_course` (`copilot/tools/index.ts`). The registry enforces action kinds (read / propose / ask / costly / change). Change tools only return cards; Apply and Undo go through `applyTopicSteps` with inverse steps. | Mounted only on Graph → Map (`graph-workspace.tsx`). No Library tools, no "what next" tool, no navigation tool. Page context is only the topic scope. |
| Library | `LibraryGateway`: `moveToCollection`, `addTag`, `setReadingState`, collection CRUD, and more. Capture classification is "never by AI" (`library/classify.ts`). | No AI sorting yet. |
| Spend cap | One `checkSpendCap` with `PaidStart = explainer \| free_explainer \| copilot_turn \| voice_retry`. Holds: $0.60 per Lumen in flight, $0.15 per copilot turn (`usage/in-flight.ts`). | No per-minute hold. The ledger requires ElevenLabs rows to have `purpose='speech'` and a `job_id` (`drizzle/0017:15`, `0023:59-64`). |
| Plans | A7: mic in the composer in Phase 4. Change plans S2 (sort, explainer moves), S3 (merge/delete, 30-day undo). Course engine Learner Model (Stage 4). Today T3, T4 and T6 (goals, planning calendar, AI-written Big Picture). | Nothing mentions a real-time voice agent or a narrator. This is a new idea entry. |

## 3. Framework: where a conversation starts, lives and ends

### 3.1 The answer: everywhere, as one session at a time owned by the shell

The voice is not a feature of the Graph or of the Library. It is **a session owned by the app shell** (`AppShell`, mounted by `(workspace)/layout.tsx`):
- It survives navigation, the way the Graph player's "Now playing" dock does.
- It always carries an **anchor**: the thing it is about.

Each surface does three things:
1. Offers a way to **start** a session with a sensible anchor.
2. **Publishes context** while the session runs.
3. **Receives the results**, which land where they belong, not in a chat log.

| Surface | How it starts | Anchor | Narrator leads with | Typical actions | Where results land |
|---|---|---|---|---|---|
| Anywhere (rail) | Mic button in the rail, or hold a key (push-to-talk). Testers only at first. | The current page's scope: map, area, topic, item or none | Conversation | Any read, navigate, propose | Cards on the current page; recap |
| **Lumen player** (Learn, Graph player) | **Ask** button, hold Space, or tap the mic while a recorded Lumen plays | That Lumen, the current slide and the playhead | Q&A, then hand back | pause, answer, show a board slide, go to slide, resume | Q&A pinned to the Lumen's transcript; follow-ups |
| **Graph** topic or Explain dialog | "Explain live", next to "Make it" | Topic, or topic plus focus | **Live Lumen** | present beats, rework, quiz, show on map | Lumen saved to the topic lane and Learn |
| Graph (map chat) | Mic in the copilot composer (C23) | Map, area or topic chat scope | Conversation | propose topics, change plans, suggest next | Same copilot thread (voice turns are messages) |
| **Library** item | "Talk it through" on an item | Item (strict grounding) | Live Lumen or Q&A | cite the item, capture a note, link to a topic | Lumen plus captured notes |
| Library wall | Mic, "help me sort this" | Current wall query or collection | Organising | read library, propose a library plan | Library change-plan card with Undo |
| **Today** | "Plan my session" | Today (My Focus, Continue, week) | Coaching | suggest next, start a Lumen, schedule (T4) | Today rows; Continue card |
| Course part | "Take this part live" | Series plus part | Live Lumen plus checks | quiz, self-explain | Evidence for the Learner Model, later |

### 3.2 One session can have several connections

A **voice session** (Studiolo's object) is different from an **ElevenLabs conversation** (one connection, billed per minute while connected). A session can span several connections:
- When the learner says "stop", or goes quiet for 30 s, the connection closes. Silence costs money.
- The session stays alive: its anchor, deck position, transcript and pending cards are kept.
- **Resume** opens a new connection seeded with that state through `dynamicVariables` and the prompt `overrides`.

### 3.3 Lifecycle

```
idle ──start(anchor)──▶ gating ──ok──▶ connecting ──▶ live ⇄ (listening | thinking | speaking | acting)
  ▲                       │ refused (cap/access)          │
  │                       ▼                               ├─ "stop"/pause ─▶ paused (disconnected, state kept) ─ resume ─▶ connecting
  │                    message                            ├─ present ─▶ presenting (Live Lumen stage up; same states inside)
  └──── recap ◀── ending ◀── end: learner | idle 30 s+prompt | cap | Lumen done | tab hidden 2 min
```

**How a session ends.** The learner says "that's all" or presses End. Or the session times out:
- 20 s of silence: the narrator asks whether to carry on.
- 40 s of silence: the connection closes and the session pauses.
- 10 minutes after pausing: the session ends.

The cap ends a session too. The narrator warns at 80% of the session's minutes and, at 100%, finishes its sentence and stops. A Live Lumen reaching its last beat ends with an offer of a next step.

**Every ending produces a Recap card.** It lists:
1. What we covered.
2. What was saved: the Lumen goes to Learn and the topic lane.
3. What changed, with Undo.
4. Suggestions still waiting.
5. "Pick up here", which feeds the Today Continue card.

The recap is the only place a voice session leaves a trace that the learner didn't explicitly keep.

### 3.4 Three levels, built in order

| Level | What the learner gets | New generation work | Risk |
|---|---|---|---|
| **L1 Ask the Lumen** | Any recorded Lumen can be interrupted. The recording pauses, the narrator answers using the slide on screen (sometimes with a quick "board" slide), then says "back to it" and the recording resumes where it stopped. | None. Works on every existing Lumen. | Low. Costs minutes only while asking. |
| **L2 Live Lumen** | The narrator *performs* a Lumen live. The learner can cut in at any time: another way, deeper, skip, back, test me. | A **beat rework** call that rewrites one slide and its notes. The rest reuses `generateQuick` with voice set to live. | Medium. Latency of rich slides; quality of reworked beats. |
| **L3 Narrator actions** | The same voice edits the map (proposals and change plans), proposes Library sorting, suggests what to learn next and starts Lumens or courses. | New tools: `read_library`, `propose_library_plan`, `suggest_next`, `navigate`, `capture_note`. | Medium. Mis-heard confirmations, and the action rules must hold under voice. |

## 4. How a Live Lumen works

### 4.1 Key move: a Live Lumen is a Lumen whose say lines are performed live

Contract 1.4 already gives us what a live deck needs:
- ordered slides (`<item>`)
- speaker notes (`<say>`)
- pointer refs (`[[s3.sky]]`)
- checked citations
- two follow-ups

So a Live Lumen is **not a new content type**:
- Generation uses `generateQuick` with a new `voice: "live"` option that **skips the per-line `explainer-speech` jobs**. That saves the TTS cost, and the live voice replaces it.
- The narrator receives each say line as speaker notes and performs them, keeping cited claims as written.
- Afterwards the deck is an ordinary Lumen in Learn. It can be replayed live again, or voiced later through the existing speech jobs, which is a costly action that asks first.

This keeps one author and one contract, and it avoids the "splitting writer and drawer always loses quality" trap (AI Lab E25–27). The author still writes slide and narration together. The live voice only *performs* and *bridges*.

### 4.2 Hiding the 26-second first slide

The talk starts immediately, while the author writes:
1. **0 s.** Session connects. The narrator opens with the topic framing and **one warm-up question**: "Before we start: when you hear *load path*, what comes to mind?" Activating prior knowledge is good teaching anyway. The learner's answer goes to the author as a `focus` hint, provided the first beats haven't been written yet.
2. **About 3–8 s.** A **title board** appears: an instant, narrator-made slide (FS-3, "instant Sonnet title card", already on the list).
3. **About 26 s.** The first authored slide arrives over the existing Trigger Realtime stream (`use-explainer.ts`), and the narrator moves to beat 1.
4. If the author is still behind when the narrator reaches the "ready edge", the narrator fills the gap with a check question, the same way the player already holds at the ready edge.

### 4.3 Beats

A **beat** is one authored slide plus the say lines that belong to it. A say line belongs to the last item before it (`ingest/types.ts`). The client builds beats from the node stream, so nothing changes on the server for L2.

```ts
type Beat = {
  id: string;                     // item node id, e.g. "s3"
  slide: ItemPayload;             // existing payload union
  notes: SayPayload[];            // existing say payloads, refs and citations included
  revision: number;               // existing append-only node revisions
  approach?: Approach;            // set when reworked
};
type Approach = "analogy" | "example" | "visual" | "simpler" | "step_by_step" | "deeper" | "from_my_field";
```

`from_my_field` uses the onboarding learner line, for example "The learner works in law…", to pick an analogy from the learner's own field.

### 4.4 Interruptions: what the learner can say and what happens

| Learner says | Recognised as | Done by | Result |
|---|---|---|---|
| "Stop", "hold on", "wait" | control | `pause_presentation`, then the narrator stops talking | Stage freezes and the pointer holds. After 30 s the connection closes (session paused). |
| "Go on", "carry on" | control | `resume_presentation(from)` | Continues from the interrupted word, rounded back to the start of that sentence |
| "Go back", "previous slide" | control | `go_to_beat(id)` | — |
| "Skip this", "I know this" | control | `go_to_beat(next)` plus a contextual note | The skip is recorded (a possible signal for a later Learner Model) |
| "Slower" / "faster" | control | Narrator changes pacing (TTS speed is fixed per connection) | — |
| A question about the slide | question | Answered in speech, maybe `show_board` | Narrator offers "shall I carry on?" |
| "Explain that another way", "I don't get it" | rework | `rework_beat(beatId, approach, learnerWords)` | Narrator bridges in speech ("let me try an analogy…") while the new slide is written (target under 6 s). It replaces the beat as a new revision. |
| "Go deeper on that" | rework | `rework_beat(…, "deeper")`, inserted after the current beat | Deck grows by one beat (counts against the 1,500-word ceiling) |
| "Test me" | check | `show_board(kind:"quiz")` | Answer judged in speech; evidence noted |
| "Show me on the map" | navigate | `show_on_map(topic)` | Map focuses, in the dock or the Graph |
| "Save that" | capture | `capture_note(text, topic)`, which creates a ghost note | Keep or Dismiss in the Library inbox |

**Rework is a cheap author call, not a new Lumen.** It is a new purpose, `explainer_beat`:
- Model: Sonnet 5.5, or Opus 5.5 low with the existing 1-hour cached contract prefix.
- Input: the contract, the current deck outline, the beat being replaced, the approach and the learner's words.
- Output: one or two `<item>` blocks with `<say>` lines, validated by the existing ingest and kit checks.
- Estimate: $0.02–0.05 per rework.

Reworks are covered by the Live Lumen's session hold and are not confirmed one by one. A11 forbids chains of costly *starts*, not steps inside one confirmed session. The session hold caps reworks (default 4 per session).

### 4.5 Board slides: the instant tier

Some slides must appear in under a second: a title, a quick list, a quiz or a definition. The narrator draws these itself through `show_board`, using a **restricted** subset of existing slide types: `intro | ul | ol | cards | table | math | quote`. Rich types (`diagram`, `animation`, `infographic`, `code`, `kit`) always come from the author.

Board slides are marked as such and are **never cited**: the citations rule stays with the author. They are kept in the recap and can be promoted into the deck.

### 4.6 Pointer and captions under a live voice

ElevenLabs sends `onAudioAlignment` events (character timings of what the narrator is saying). The narrator *paraphrases* its notes, so exact `[[ref]]` offsets won't line up. Instead:
- Each ref's anchor gets a few **cue words**, taken from the text the ref covers.
- The client fuzzy-matches the alignment stream against them and moves the pointer when the cue words are spoken.
- Fallback: anchors are revealed in order, spread over the beat's speaking time.

Captions come from the alignment stream, so they are always available, which also covers accessibility and a muted-audio mode.

### 4.7 The player change: two drivers behind one interface

`use-playback.ts` currently assumes the `<audio>` clock. Pull a `PlaybackDriver` interface out of it:

```ts
interface PlaybackDriver {
  position(): { beat: string; word: number };
  play(): void; pause(): void; seek(to: { beat: string; word?: number }): void;
  onWord(cb: (w: { beat: string; word: number; text: string }) => void): Unsubscribe;
}
// AudioDriver: today's behaviour (MP3 + WordTiming[]), unchanged
// LiveDriver:  ElevenLabs alignment events + present/next/rework tool calls
```

The slide stage, pointer, moments and captions consume the driver and don't change. For L1, the AudioDriver stays and a voice session simply pauses it and later seeks it.

## 5. System design

### 5.1 Components

```
┌─────────────────────────── Browser (Next.js client) ───────────────────────────┐
│ Surfaces: Rail mic · Player Ask · Explain-live · Library · Today · Copilot mic │
│        │ start(anchor)                         ▲ cards / stage / dock          │
│ ┌──────▼───────────────── VoiceProvider (in AppShell) ──────────────────────┐  │
│ │ Session machine (§3.3) · Context publisher · Tool hub · Card bridge       │  │
│ │ Live stage (PlaybackDriver) · Confirm guard · Dock + captions             │  │
│ │ ElevenLabs ConversationProvider (WebRTC, eu-residency)                    │  │
│ └───────┬─────────────────────────────┬──────────────────────────┬──────────┘  │
└─────────┼─────────────────────────────┼──────────────────────────┼─────────────┘
          │ voice audio (WebRTC)        │ HTTPS (session cookie)   │ Trigger Realtime
          ▼                             ▼                          ▼  (existing)
 ┌──────────────────────┐   ┌───────────────────── Studiolo (Vercel fra1) ─────────────────────┐
 │ ElevenLabs Agents    │   │ /api/voice/session        gate · spend hold · mint token · vars   │
 │  ASR · turn-taking   │──▶│ /api/voice/tools/[name]   thin wrappers on copilot tools & domain │
 │  TTS (house voice)   │   │ /api/voice/beats/rework   explainer_beat purpose → ingest         │
 │  LLM ─ Phase 0: EL-  │   │ /api/voice/session/[id]/end  recap · settle usage                 │
 │  hosted Claude;      │   │ /api/voice/webhooks/elevenlabs  post-call minutes (HMAC)          │
 │  Phase 2: custom LLM │──▶│ /api/voice/llm (Phase 2)  OpenAI-compatible → callModel           │
 └──────────────────────┘   │ Domain: topics/steps · LibraryGateway · explainers · courses      │
                            │ usage ledger · spend cap · copilot_conversations                  │
                            └────────────────────────────────────────────────────────────────────┘
```

### 5.2 Design rules

1. **The browser is the tool hub.** Every ElevenLabs tool is a *client tool*. A client tool either acts on the UI (stage, map focus, navigation, player) or calls a Studiolo route with the learner's own session cookie. Why:
   - The model can only do what the learner's UI can do.
   - There is no unauthenticated webhook path into learner data.
   - Each route re-checks the same Zod schemas and the A2 rules.
   - ElevenLabs server tools and MCP are not used for learner data.
2. **One assistant, one tool registry.** `/api/voice/tools/[name]` calls the *same* tool implementations as `copilot/tools/*`: same action kinds, same 8 KB cap, same read-back strings. A new tool is added once and works in text and voice. Voice adds only UI tools (`present_*`, `show_board`, `navigate`, player control).
3. **The brain moves home in Phase 2.**
   - Phase 0–1: the agent runs ElevenLabs-hosted Claude, Sonnet 5.5 from the SDK's `Llm` list. This is the fastest way to a prototype.
   - Production: ElevenLabs' **custom LLM** mode calls `/api/voice/llm`, an OpenAI-compatible streaming endpoint that wraps `callModel` with a new `voice_turn` purpose.
   - That restores the single model gateway (`call-model.ts`), the 1-hour prompt cache, usage rows per call, the copilot system prompt and evals, and EU control of the prompt.
   - ElevenLabs then only hears and speaks.
4. **Context in, sparingly.**
   - At connect: `dynamicVariables` carry the learner's name, the learner line, the anchor and the scope.
   - On every surface change: `sendContextualUpdate("now on: Graph › Structures › Load paths; selected: Beams")`.
   - On every beat change: an update with the slide title and the beat's notes digest.
   - `get_screen` (expects a response) returns the full current state on demand.
   - As with the text copilot, note bodies, item text, files and photos are **never** sent, except item text in a strict-grounded Live Lumen, where the author reads it on the server as it does today.
5. **Voice turns are copilot messages (Phase 2).** Each spoken exchange is saved to `copilot_messages` in the anchor's conversation, with a `channel = 'voice'` column (migration). The text panel shows the same thread, and A7 holds literally.
6. **The transport is swappable.** A `VoiceTransport` interface sits around the ElevenLabs SDK: connect, sendContext, sendText, events, registerTools. OpenAI Realtime, Gemini Live or a DIY pipeline could replace ElevenLabs without touching the tool hub or the stage. The DIY pipeline is Scribe realtime speech-to-text, then Claude streaming, then ElevenLabs streaming TTS.

### 5.3 Tools (voice view of one registry)

| Tool | Kind (A2) | New or existing | Notes |
|---|---|---|---|
| `read_map`, `read_topic`, `find_topics`, `read_branch`, `read_course` | read | existing | unchanged |
| `get_screen` | read | new, client | current route, anchor, selection, beat, playhead |
| `read_library(query, filters)` | read | new | titles, kinds, collections, reading state; no bodies |
| `read_learning(scope)` | read | new | Lumens watched to the end, topic statuses, My Focus, recent sessions; feeds `suggest_next` |
| `show_on_map`, `navigate(dest, id)`, `open_item` | read (UI) | existing / new | navigation never changes data |
| `present_beat`, `go_to_beat`, `pause_presentation`, `resume_presentation`, `show_board` | read (UI) | new, client | Live stage only |
| `player_control(pause \| resume \| seek)` | read (UI) | new, client | L1, on recorded Lumens |
| `ask_clarifying_question` | ask | existing | spoken, with option chips on screen |
| `propose_topics` | propose | existing | ghosts; keep and dismiss by voice allowed |
| `suggest_next(scope)` | propose | new | 1–3 suggestion cards with reasons, no writes. Rule-based ranking first (statuses, prerequisites, My Focus, recency), model phrasing second. Feeds Today T3/T6. |
| `capture_note(text, topic?)` | propose | new | ghost note in the Library inbox |
| `propose_changes` | change | existing | graph change plan; S2/S3 operations arrive with those phases |
| `propose_library_plan(steps)` | change | new | steps: `create_collection`, `move_to_collection`, `tag`, `untag`, `set_reading_state`. **No delete in v1.** Apply and Undo through `LibraryGateway`, same card pattern as graph plans. |
| `explain` | costly | existing | offer card for a recorded Lumen |
| `start_live_lumen(request, focus?, itemId?)` | costly | new | confirm card shows the cost and minutes |
| `rework_beat(beat, approach, words)` | inside session | new | covered by the session hold, limit 4 per session |
| `plan_course` | costly | existing | — |
| `end_session` | system | ElevenLabs system tool | triggers the recap |

### 5.4 Confirming by voice: the guard

A2 says changes and removals ask first, and costly actions confirm. Voice adds the risk of mis-hearing. Rules:

| Kind | Voice "yes" enough? | Guard |
|---|---|---|
| read / UI | no confirmation needed | Narrator says what it did ("The map now shows Beams.") |
| propose: keep ghosts | yes | Undo toast as today |
| change: graph or library plan | **yes, if** the card has been on screen at least 1.5 s **and** the narrator read the steps out | Card stays with Undo. Plans of more than 5 steps need a tap. |
| change: merge or delete (S3) | **no, tap only** | — |
| costly: start a Lumen, Live Lumen or course | yes, once the cost has been said aloud and shown | Within the session hold, otherwise a tap |

The guard runs **in the client**, not in the prompt. A `confirm_card(cardId)` client tool checks three things:
1. The card is visible and has been for long enough.
2. The last learner transcript contains an explicit yes ("yes", "apply", "go ahead", "do it"; a short list, per locale).
3. The kind allows a voice yes.

Otherwise it returns "Needs a tap", and the narrator says so. A recommendation from the agent never counts as approval (Founder Home rule).

## 6. Data model changes (for the port into `studiolo`; Phase 3)

All are additive migrations (HIGH tier):
- `voice_sessions(id, account_id, anchor_kind, anchor_id, explainer_id?, state, minutes_used, cap_minutes, started_at, ended_at, recap jsonb)`.
- `voice_connections(session_id, provider, provider_conversation_id, connected_at, disconnected_at, billed_seconds)` keeps provider ids out of the session row.
- `copilot_messages.channel text default 'text'` (`'text' | 'voice'`).
- `explainers.voice_mode text default 'recorded'` (`'recorded' | 'live'`). Live decks have no audio objects until they are voiced later.
- `explainer_nodes` gains nothing: reworks are new revisions, which already exist and are append-only.
- **Usage ledger:**
  - Allow `source='elevenlabs'` with `purpose='voice_session'`, unit `seconds`, keyed by `provider_conversation_id`, with `job_id` nullable for this purpose. This relaxes the `0023:59-64` check for this purpose only.
  - Model calls through `/api/voice/llm` write ordinary `anthropic` rows.
- **Spend cap:**
  - Add `PaidStart = voice_session`.
  - Hold: per-minute rate × session cap minutes. Example: $0.25 × 10 = $2.50.
  - Settled from the post-call webhook.
  - The narrator warns at 80% of the session minutes.

## 7. Cost model (estimates; P0 measures them)

| Item | Figure | Source |
|---|---|---|
| ElevenLabs Agents, voice | $0.08 per minute beyond the plan's included minutes; burst $0.16 | elevenlabs.io pricing (search snippet) |
| LLM per minute | Passed through on top. About $0.02–0.15 per minute for Sonnet-class models, **heavily dependent on prompt caching**. Uncached, a 10k-token context × 4 turns a minute is the expensive end. | estimate |
| Beat rework | $0.02–0.05 each | estimate from author prices |
| Live Lumen author run (no TTS) | about $0.13 | `purposes.ts` comment / lab E9 |

| Experience | Rough cost per use |
|---|---|
| L1, a 2-minute question inside a recorded Lumen | about $0.20–0.45 |
| L2, a 6-minute Live Lumen with 2 reworks | about $0.75–1.60 (compare: a recorded 3-minute Lumen's voice alone is estimated at $0.65–0.80) |
| L3, a 3-minute "sort my library" talk | about $0.30–0.70 |

Plan fit for testers:
- 20 testers × 60 minutes a month = 1,200 minutes, roughly the Pro plan's included 1,238 minutes and within its 20 concurrent calls. **Confirm the plan price on the live pricing page before deciding.**
- Running the brain through `/api/voice/llm` (§5.2 rule 3) is mainly a **cost** decision: it is the only path where Studiolo controls prompt caching.

## 8. Privacy, safety and legal

- **EU:** connect with `serverLocation: "eu-residency"`. Check that it covers ASR, TTS and the hosted LLM, matching "EU hosting, private by default".
- **No always-on listening:** no wake word. The mic opens only on a press or on Ask, and the dock shows a live mic indicator. A consent screen appears on first use.
- **Retention:** turn off ElevenLabs call recording and transcript storage in the agent settings, or use zero-retention if the plan offers it (to confirm). Studiolo keeps the transcript only inside a recap the learner keeps.
- **Prompt injection:** item text in strict-grounded Live Lumens is read by the author on the server, as today. The live LLM sees speaker notes, not raw item text. DATA_AND_SAFETY applies to the voice prompt unchanged. Tools that change data still return cards only.
- **Legal (blocking for launch, not for a prototype):** confirm ElevenLabs and Anthropic data terms, plus voice-data processing in the privacy page (Craft *Legal & Data Terms* L1–L6).

## 9. Pedagogy: what the live loop makes possible

These come with the design rather than as add-ons:
- **Warm-up question** (prior knowledge) while the first slide is written (§4.2).
- **Check-in every 2–3 beats:** "Say back to me in one sentence why the beam needs the column." The learner's answer is a *self-explanation*.
- **Test me** quizzes on board slides, and a retrieval question at the end.
- **Analogies from the learner's field** (`from_my_field`, using the onboarding learner line).
- **Evidence for the Course engine's Learner Model** (Stage 4, not built). Skips, rework requests, check-in answers and quiz results map directly onto `exposed → self_explained → retrieved`. The recap stores them as candidate evidence; they don't change topic status ("The learner owns the truth").

## 10. Further possibilities (not in the first build)

- **Live course parts:** take a part live, with a check-in before moving on.
- **Map tour:** "walk me through my map". The narrator navigates and focuses areas while summarising them.
- **Voice capture** ("save that as a note"), already wanted under Library 3C.
- **Audio-only review on a phone:** a recorded Lumen with Ask, or a short retrieval quiz, while walking.
- **Multi-voice:** the agent supports up to 10 voices, for example a second voice for quoted sources or a language's native speaker.
- **Text mode:** the same session with `textOnly`, for libraries and quiet offices. ElevenLabs charges per message.

## 11. Prototype plan

**Where it's built.** A standalone Next.js app at `prototypes/live-lumens/` in **this repo** (Studiolo_Manage). It never touches `studiolo`. It uses:
- **Fixtures:** one exported Lumen (markup plus audio from a dev account), a mock map and a mock library in JSON.
- **A minimal stage** that renders the simple slide types.
- **Real ElevenLabs Agents** (WebRTC, EU residency) and **real Claude**.

Keys live in `.env.local` and are never committed. Budget cap: $40 total, in line with the AI Lab's $39.50 hard cap per run.

| Step | Scope | Exit criteria (measured) | Rough time |
|---|---|---|---|
| **P0 Ask the Lumen** | Fixture Lumen with the AudioDriver. Ask button or hold Space. Agent with tools `player_control`, `show_board`, `go_to_beat`, `get_screen`. Contextual updates per slide. | Time to first spoken word ≤ 1.2 s at p50. Barge-in silences the narrator in ≤ 300 ms. Real cost per minute recorded. The owner tries 5 questions on 2 Lumens. | 2–3 days |
| **P1 Live Lumen** | LiveDriver and beats from the fixture's nodes. Warm-up question. `present_beat`, `rework_beat` (Claude on the contract), cue-word pointer, captions, pause by disconnecting. | First word ≤ 1.5 s. Rework slide on screen ≤ 6 s. Pointer lands on the right anchor ≥ 80% of the time. The owner rates 3 Live Lumens against their recorded versions. | 4–5 days |
| **P2 Narrator actions** | Mock map and library. `propose_topics`, `propose_changes`, `propose_library_plan`, `suggest_next`, `navigate`, the confirm guard, the recap card. | 20 scripted utterances (eval sheet) give the right tool and the right card. Zero changes applied without passing the guard. | 4–5 days |
| **P3 Port spec** | A written HIGH-tier spec for `studiolo`: `VOICE_ACCESS=testers` switch, §6 migrations, `voice_session` cap, `/api/voice/*`, agent config as code, `ai.md` update, evals. **No code in `studiolo` from here.** | Owner approval | 1–2 days |

The P0 risks to watch:
1. Echo: the recorded MP3 playing while the mic is open. This is why L1 uses press-to-ask rather than open barge-in.
2. Safari WebRTC.
3. The ElevenLabs-hosted Claude's tool-call latency.

## 12. Decisions for the owner

| # | Decision | Recommendation |
|---|---|---|
| V-D1 | Approve ElevenLabs Agents as a **paid service**, EU residency | Yes for the prototype on the smallest plan that fits. Choose the Pro plan only when testers start. |
| V-D2 | Where the brain runs | Prototype: ElevenLabs-hosted Claude Sonnet 5.5. Production: custom LLM through `callModel` (§5.2 rule 3). |
| V-D3 | Who voices a Live Lumen | The live narrator, with TTS jobs skipped. Recorded Lumens keep today's pipeline. **No change to the speech pipeline** (owner caution after the 17 Oct revert). |
| V-D4 | Voice confirmation rules | As in §5.4: tap only for merge and delete, and for plans of more than 5 steps |
| V-D5 | Limits | 10 minutes per session, 60 minutes per tester per month, disconnect after 30 s idle, 4 reworks per Live Lumen |
| V-D6 | What is saved | Recap and deck always. Transcript only if the learner keeps it. No audio stored anywhere. |
| V-D7 | Library tools in v1 | Sort, tag, file and reading state. No delete. |
| V-D8 | Entry points first | L1 Ask in the player, then Explain live on the Graph. The rail mic last. |
| V-D9 | Live voice model | Same house voice id on `eleven_v4_turbo` or `eleven_flash_v2_5` (latency). Compare against `eleven_v4` in P0 for voice consistency with recorded Lumens. |
| V-D10 | Prototype budget | $40 cap, tracked in the cost dashboard as "ElevenLabs Agents" |

It also touches decisions already open: G-D1 to G-D9 (graph actions), VD-2 to VD-4 (voice model, streaming TTS, warm machines), FS-3 (instant title card) and Legal L1–L6.

## 13. Risks

| Risk | Mitigation |
|---|---|
| Rich slides are slow; reworks feel laggy | Narrator bridges in speech; board slides for anything instant; rework limited to 1–2 slides |
| Quality of reworked beats | Same contract, ingest and checks; rework sees the whole outline; owner rating in P1 |
| Cost unknown (voice is "the biggest unknown") | P0 measures it; session holds; per-minute ledger rows; idle disconnect |
| A mis-heard "yes" applies a change | Client-side confirm guard (§5.4); Undo on every plan |
| Paraphrase breaks the pointer | Cue-word matching with an ordered fallback |
| Locked in to ElevenLabs | `VoiceTransport` interface; tools and brain live in Studiolo |
| Concurrency limit (20 on Pro) | Testers only; queue with "the narrator is busy, try in a minute" |
| Privacy of voice | EU residency, no recording, consent screen, legal review before any tester |
