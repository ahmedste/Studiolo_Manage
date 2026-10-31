/* Dictation for Learn: the mic turns speech into text in the input, live, word by word.
   Engines, best first (proposals/2026-10-29-dictation-elevenlabs-brief.md):
   - ElevenLabs Scribe v2 Realtime (@elevenlabs/client). The page asks its own server for a single-use token, then the
     browser streams the mic straight to ElevenLabs over a WebSocket. Needs `ELEVENLABS_API_KEY=… node serve.mjs`.
   - The browser's Web Speech API (Chrome and Safari; Chrome sends the audio to Google).
   - A simulation that streams a fixed phrase, so the prototype still works with no microphone.
   - Parked: Moonshine Streaming on-device (@moonshine-ai/moonshine-wasm; proposals/2026-10-24-dictation-moonshine.md).
     Pick it from the Mic menu; it needs cross-origin isolation, `node serve.mjs --moonshine`.
   Sets window.Dictation before learn.js runs. */
(() => {
  const VERSION = "0.1.5";
  // serve.mjs serves the npm package here when it's installed; otherwise the same version comes from jsDelivr.
  const LOCAL = "/vendor/moonshine/index.js";
  const CDN = `https://cdn.jsdelivr.net/npm/@moonshine-ai/moonshine-wasm@${VERSION}/dist/index.js`;
  const KEY = "studiolo.dictation.engine";
  // serve.mjs serves @elevenlabs/client here when it's installed; otherwise the same version comes from jsDelivr.
  const EL_LOCAL = "/vendor/elevenlabs/lib.iife.js";
  const EL_CDN = "https://cdn.jsdelivr.net/npm/@elevenlabs/client@1.32.1/dist/lib.iife.js";
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  const ENGINES = [
    ["auto", "Auto"],
    ["elevenlabs", "ElevenLabs Scribe (cloud)"],
    ["web-speech", "Browser speech"],
    ["simulated", "Simulated"],
    ["moonshine-tiny", "Moonshine Tiny (parked, on-device)"],
    ["moonshine-small", "Moonshine Small (parked, on-device)"],
    ["moonshine-medium", "Moonshine Medium (parked, on-device)"],
  ];
  const ARCH = { "moonshine-tiny": "TinyStreaming", "moonshine-small": "SmallStreaming", "moonshine-medium": "MediumStreaming" };
  const SHORT = { "moonshine-tiny": "on-device · Tiny", "moonshine-small": "on-device · Small", "moonshine-medium": "on-device · Medium", "web-speech": "browser speech", simulated: "simulated", elevenlabs: "ElevenLabs" };

  const canMoonshine = () => !!(window.crossOriginIsolated && typeof SharedArrayBuffer !== "undefined" && navigator.mediaDevices?.getUserMedia);
  // Phones and low-memory machines get Tiny; the rest get Small (decision D1).
  const smallDevice = () => (navigator.deviceMemory && navigator.deviceMemory <= 4) || /iPhone|iPad|Android/i.test(navigator.userAgent);
  const read = () => { try { return localStorage.getItem(KEY) || "auto"; } catch { return "auto"; } };
  let choice = ENGINES.some(([id]) => id === read()) ? read() : "auto";
  let failed = new Set(); // engines that broke this page load; the next best takes over
  let keyterms = [];
  // Only a page served by serve.mjs with a key can mint ElevenLabs tokens; anywhere else (an artifact, a file) it can't.
  let scribeOk = false;
  if (/^https?:$/.test(location.protocol)) {
    fetch("/api/dictation/status").then((r) => (r.ok ? r.json() : null)).then((j) => {
      scribeOk = !!j?.elevenlabs;
      dispatchEvent(new Event("dictation:engines"));
    }).catch(() => {});
  }

  /** Which engine `choice` gives here, and why if it had to fall back. */
  function resolve() {
    const fallback = () => (SR && !failed.has("web-speech") ? "web-speech" : "simulated");
    let id = choice, why = "";
    if (id === "auto") id = scribeOk && !failed.has("elevenlabs") ? "elevenlabs" : fallback();
    if (id === "elevenlabs" && (!scribeOk || failed.has(id))) { why = failed.has(id) ? "ElevenLabs didn't connect" : "ElevenLabs needs ELEVENLABS_API_KEY=… node serve.mjs"; id = fallback(); }
    if (ARCH[id] && (!canMoonshine() || failed.has(id))) { why = failed.has(id) ? "Moonshine didn't load" : "Moonshine needs node serve.mjs --moonshine"; id = fallback(); }
    if (id === "web-speech" && (!SR || failed.has(id))) { why = why || "No browser speech here"; id = "simulated"; }
    return { id, short: SHORT[id], onDevice: !!ARCH[id], why };
  }

  /* ---------- Moonshine: one MicTranscriber per model, kept loaded so the second tap starts at once */
  let mod = null;
  const mics = {};
  let cur = null; // the session the shared Moonshine callbacks report to
  async function moonshine() {
    if (mod) return mod;
    try { mod = await import(LOCAL); } catch { mod = await import(CDN); }
    return mod;
  }
  function startMoonshine(id, h) {
    const s = { lines: [], partial: "", stopped: false, h };
    const text = () => [...s.lines, s.partial].filter(Boolean).join(" ");
    s.text = (t) => { s.partial = t; h.onText(text()); };
    s.line = (t) => { if (t) s.lines.push(t.trim()); s.partial = ""; h.onText(text()); };
    cur = s;
    s.ready = (async () => {
      if (!mics[id]) {
        h.onState("loading", { fraction: 0 });
        // One download per model, even if the mic is tapped again while it runs.
        mics[id] = moonshine().then(async (m) => {
          const mic = new m.MicTranscriber().modelArch(m.ModelArch[ARCH[id]])
            .onText((t) => cur?.text(t))
            .onLine((l) => cur?.line(l.text))
            .onProgress((f) => cur?.h.onState("loading", { fraction: f }))
            .onError((e) => cur?.h.onError(e));
          await mic.load();
          return mic;
        });
        mics[id].catch(() => delete mics[id]);
      }
      const mic = await mics[id];
      if (keyterms.length) { try { mic.setKeyterms(keyterms); } catch { /* only streaming models take key terms */ } }
      if (s.stopped) return;
      await mic.start();
      if (s.stopped) { await mic.stop(); return; }
      s.mic = mic;
      h.onState("listening");
    })();
    s.ready.catch((e) => { failed.add(id); if (!s.stopped) h.onError(e); });
    const release = () => { s.stopped = true; if (cur === s) cur = null; };
    return {
      // Stopping while the model still downloads returns at once; the download carries on into the cache.
      async stop() {
        s.stopped = true;
        await s.mic?.stop(); // flushes the line being spoken through onLine
        release();
        return text();
      },
      cancel() { s.mic?.stop(); release(); },
    };
  }

  /* ---------- ElevenLabs Scribe v2 Realtime: partial transcripts are the live line, committed ones are kept.
     The API key stays on the server: the page gets a single-use token (15 minutes, consumed on connect). */
  let el = null;
  function elevenlabs() {
    if (window.ElevenLabsClient) return Promise.resolve(window.ElevenLabsClient);
    if (el) return el;
    const load = (src) => new Promise((res, rej) => { const t = document.createElement("script"); t.src = src; t.onload = () => (window.ElevenLabsClient ? res(window.ElevenLabsClient) : rej(new Error("ElevenLabs client didn't load"))); t.onerror = rej; document.head.appendChild(t); });
    el = load(EL_LOCAL).catch(() => load(EL_CDN));
    el.catch(() => (el = null));
    return el;
  }
  async function scribeToken() {
    const r = await fetch("/api/dictation/token", { method: "POST" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.token) throw new Error(j.error || `Token request failed (${r.status})`);
    return j.token;
  }
  function startElevenLabs(h) {
    const s = { lines: [], partial: "", stopped: false };
    const text = () => [...s.lines, s.partial].filter(Boolean).join(" ");
    let committed = null; // resolves on the next committed transcript, for stop()
    h.onState("connecting");
    s.ready = (async () => {
      const [EL, token] = await Promise.all([elevenlabs(), scribeToken()]);
      if (s.stopped) return;
      const E = EL.RealtimeEvents;
      const conn = (s.conn = EL.Scribe.connect({
        token,
        modelId: "scribe_v2_realtime",
        // The server commits a segment after a pause, so long dictation is kept piece by piece.
        commitStrategy: EL.CommitStrategy.VAD,
        // At most 50 terms of up to 20 characters each.
        keyterms: keyterms.filter((k) => k.length <= 20).slice(0, 50),
        // What's already typed, for casing, punctuation and continuing the sentence.
        previousText: h.previous || undefined,
        microphone: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      }));
      conn.on(E.SESSION_STARTED, () => { if (!s.stopped) h.onState("listening"); });
      conn.on(E.PARTIAL_TRANSCRIPT, (d) => { s.partial = d.text || ""; h.onText(text()); });
      conn.on(E.COMMITTED_TRANSCRIPT, (d) => { if (d.text?.trim()) s.lines.push(d.text.trim()); s.partial = ""; h.onText(text()); committed?.(); });
      conn.on(E.ERROR, (d) => { if (!s.stopped) h.onError(new Error(d?.error || d?.message || "ElevenLabs error")); });
      conn.on(E.CLOSE, () => { if (!s.stopped) h.onEnd?.(); });
    })();
    s.ready.catch((e) => { if (/token|client|load|fetch/i.test(String(e?.message))) failed.add("elevenlabs"); if (!s.stopped) h.onError(e); });
    return {
      // Commit what's being said, wait briefly for its final text, then close the socket.
      async stop() {
        s.stopped = true;
        if (s.conn) {
          if (s.partial) {
            const got = new Promise((res) => (committed = res));
            try { s.conn.commit(); } catch { /* already closed */ }
            await Promise.race([got, new Promise((res) => setTimeout(res, 1500))]);
          }
          try { s.conn.close(); } catch { /* already closed */ }
        }
        return text();
      },
      cancel() { s.stopped = true; try { s.conn?.close(); } catch { /* already closed */ } },
    };
  }

  /* ---------- Web Speech: interim results give the same live line */
  function startWebSpeech(h) {
    const r = new SR();
    r.lang = navigator.language || "en-GB"; r.interimResults = true; r.continuous = true;
    let said = "", live = true, done;
    const ended = new Promise((res) => (done = res));
    r.onstart = () => h.onState("listening");
    r.onresult = (e) => { said = Array.from(e.results, (x) => x[0].transcript).join("").replace(/\s+/g, " ").trim(); h.onText(said); };
    r.onerror = (e) => { if (e.error === "no-speech" || e.error === "aborted") return; if (e.error === "not-allowed" || e.error === "service-not-allowed") failed.add("web-speech"); h.onError(new Error(e.error)); };
    // Chrome ends recognition by itself after a long silence: tell the caller so the mic doesn't look on.
    r.onend = () => { done(); if (live) h.onEnd?.(); };
    try { r.start(); } catch (e) { failed.add("web-speech"); setTimeout(() => h.onError(e)); }
    return {
      async stop() { live = false; try { r.stop(); } catch { /* already ended */ } await Promise.race([ended, new Promise((res) => setTimeout(res, 1500))]); return said; },
      cancel() { live = false; try { r.abort(); } catch { /* already ended */ } },
    };
  }

  /* ---------- Simulated: words arrive a beat behind, and one is revised, as real speech-to-text does */
  function startSimulated(h) {
    const words = (h.phrase || "What should I watch next?").split(/\s+/);
    let k = 0;
    setTimeout(() => h.onState("listening"));
    const t = setInterval(() => {
      k = Math.min(words.length, k + 1);
      let shown = words.slice(0, k).join(" ");
      if (k < words.length && k > 2 && k % 3 === 0) shown += " " + words[k].slice(0, Math.max(2, words[k].length - 3)) + "…";
      h.onText(shown);
    }, 260);
    return {
      async stop() { clearInterval(t); return k < 2 ? "" : words.join(" "); },
      cancel() { clearInterval(t); },
    };
  }

  window.Dictation = {
    engines: ENGINES,
    choice: () => choice,
    setChoice(id) { choice = id; failed = new Set(); try { localStorage.setItem(KEY, id); } catch { /* private window */ } },
    resolve,
    /** Words the model is unlikely to produce on its own: product names, the subjects on screen. */
    setKeyterms(list) { keyterms = [...new Set(list.filter(Boolean))]; },
    /**
     * Starts listening. `h`: onText(textSoFar), onState("loading", {fraction}) | onState("listening"), onError(err),
     * onEnd() when the engine stops by itself, `previous` (text already in the input) and `phrase` for the simulation.
     * onState may also report "connecting". Returns { stop() → final text, cancel() }.
     */
    start(h) {
      const { id } = resolve();
      return id === "elevenlabs" ? startElevenLabs(h) : ARCH[id] ? startMoonshine(id, h) : id === "web-speech" ? startWebSpeech(h) : startSimulated(h);
    },
  };
})();
