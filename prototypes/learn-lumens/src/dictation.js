/* Dictation for Learn: the mic turns speech into text in the input, live, word by word.
   Engines, best first (proposals/2026-10-24-dictation-moonshine.md):
   - Moonshine Streaming, on-device through WebAssembly (@moonshine-ai/moonshine-wasm). Free, private, live. It needs
     SharedArrayBuffer, so the page must be cross-origin isolated: serve it with `node serve.mjs`.
   - The browser's Web Speech API (Chrome and Safari; Chrome sends the audio to Google).
   - A simulation that streams a fixed phrase, so the prototype still works with no microphone.
   Sets window.Dictation before learn.js runs. */
(() => {
  const VERSION = "0.1.5";
  // serve.mjs serves the npm package here when it's installed; otherwise the same version comes from jsDelivr.
  const LOCAL = "/vendor/moonshine/index.js";
  const CDN = `https://cdn.jsdelivr.net/npm/@moonshine-ai/moonshine-wasm@${VERSION}/dist/index.js`;
  const KEY = "studiolo.dictation.engine";
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  const ENGINES = [
    ["auto", "Auto"],
    ["moonshine-tiny", "Moonshine Tiny (on-device, ~40 MB)"],
    ["moonshine-small", "Moonshine Small (on-device, ~130 MB)"],
    ["moonshine-medium", "Moonshine Medium (on-device, ~255 MB)"],
    ["web-speech", "Browser speech"],
    ["simulated", "Simulated"],
  ];
  const ARCH = { "moonshine-tiny": "TinyStreaming", "moonshine-small": "SmallStreaming", "moonshine-medium": "MediumStreaming" };
  const SHORT = { "moonshine-tiny": "on-device · Tiny", "moonshine-small": "on-device · Small", "moonshine-medium": "on-device · Medium", "web-speech": "browser speech", simulated: "simulated" };

  const canMoonshine = () => !!(window.crossOriginIsolated && typeof SharedArrayBuffer !== "undefined" && navigator.mediaDevices?.getUserMedia);
  // Phones and low-memory machines get Tiny; the rest get Small (decision D1).
  const smallDevice = () => (navigator.deviceMemory && navigator.deviceMemory <= 4) || /iPhone|iPad|Android/i.test(navigator.userAgent);
  const read = () => { try { return localStorage.getItem(KEY) || "auto"; } catch { return "auto"; } };
  let choice = ENGINES.some(([id]) => id === read()) ? read() : "auto";
  let failed = new Set(); // engines that broke this page load; the next best takes over
  let keyterms = [];

  /** Which engine `choice` gives here, and why if it had to fall back. */
  function resolve() {
    const fallback = () => (SR && !failed.has("web-speech") ? "web-speech" : "simulated");
    let id = choice, why = "";
    if (id === "auto") id = canMoonshine() ? (smallDevice() ? "moonshine-tiny" : "moonshine-small") : fallback();
    if (ARCH[id] && (!canMoonshine() || failed.has(id))) { why = failed.has(id) ? "Moonshine didn't load" : "Moonshine needs node serve.mjs"; id = fallback(); }
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
     * onEnd() when the engine stops by itself, and `phrase` for the simulation. Returns { stop() → final text, cancel() }.
     */
    start(h) {
      const { id } = resolve();
      return ARCH[id] ? startMoonshine(id, h) : id === "web-speech" ? startWebSpeech(h) : startSimulated(h);
    },
  };
})();
