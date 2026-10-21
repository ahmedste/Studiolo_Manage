/* Live Lumens prototype: the voice layer over real Studiolo screens.
   The screens are the app's own DOM and CSS, captured from studiolo's /dev/specimens (see capture/capture.cjs).
   This script only adds the proposed voice UI (rail Talk, composer mic, player Ask, Explain live, the voice dock,
   voice cards and the confirm guard) and scripts five flows. No microphone and no network: you pick or type what
   you'd say, and the browser's own speech voice stands in for the ElevenLabs narrator. */
(() => {
  "use strict";
  const DATA = JSON.parse(document.getElementById("vx-data").textContent);
  const root = document.getElementById("vx-app");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const sleepRaw = (ms) => new Promise((r) => setTimeout(r, ms));
  DATA.htmlClass.split(/\s+/).filter(Boolean).forEach((c) => document.documentElement.classList.add(c));

  const MIC = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  const SPEAKER = '<svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>';
  const MINI = '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 9l6 6 6-6"/><path d="M6 19h12"/></svg>';
  const PLAY = '<path d="M8 5.5v13l11-6.5z"></path>';
  const PAUSE = '<path d="M7 5h4v14H7zM13 5h4v14h-4z"></path>';

  /* ---------------------------------------------------------------- screens */
  let screen = null;
  const RAIL = { graph: "/graph", player: "/graph", explain: "/graph", facade: "/graph", ghosts: "/graph", ghostsKept: "/graph", tidy: "/graph", tidyApplied: "/graph", library: "/library", today: "/today" };
  function show(name) {
    stopPlayer();
    parkDock();
    root.innerHTML = DATA.screens[name];
    screen = name;
    patch();
    if (S.on || S.state === "ended") mountDock();
    window.scrollTo(0, 0);
  }
  /* On a screen with the copilot panel, the voice takes the composer's place (voice is an input method of the same
     copilot, spec A7), so cards it raises stay in view in the thread. Elsewhere it floats bottom right. */
  function mountDock() {
    const comp = $(".cp .cp-comp", root);
    if (comp) { comp.hidden = true; comp.after(dock); dock.classList.add("in-panel"); scrollThread(); }
    else { document.body.appendChild(dock); dock.classList.remove("in-panel"); }
  }
  function parkDock() { if (dock.parentElement !== document.body) document.body.appendChild(dock); dock.classList.remove("in-panel"); }
  function scrollThread(el) {
    const body = $(".cp .cp-body", root); if (!body) return;
    requestAnimationFrame(() => { if (el) { const r = el.getBoundingClientRect(), b = body.getBoundingClientRect(); body.scrollTop += r.top - b.top - 12; } else body.scrollTop = body.scrollHeight; });
  }
  function patch() {
    $$(".navigation-rail .navigation-link[href]", root).forEach((a) => (a.getAttribute("href") === RAIL[screen] ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
    const cap = $(".capture-shortcut", root);
    if (cap && !$(".vx-rail-talk", root)) cap.insertAdjacentHTML("afterend", `<button class="navigation-link vx-rail-talk" data-on="${S.on}" title="Talk to Studiolo" type="button">${MIC}<span class="rail-label">Talk</span></button>`);
    const send = $(".cp-comp .tools .send", root);
    if (send) send.insertAdjacentHTML("beforebegin", `<button class="vx-mic-inline" type="button" aria-label="Talk instead of typing" title="Talk instead of typing">${MIC}</button>`);
    if (screen === "player") setupPlayer();
    if (screen === "explain") patchExplain();
    if (screen === "today") {
      const head = $(".td-head p", root);
      if (head) head.insertAdjacentHTML("afterbegin", `<button class="button button-quiet vx-plan" type="button" style="display:inline-flex;gap:6px;align-items:center;margin-right:12px">${MIC}Plan my session</button>`);
    }
    if (screen === "library") {
      const sel = $(".sel-toggle", root);
      if (sel) sel.insertAdjacentHTML("beforebegin", `<button class="button button-quiet vx-sort" type="button" style="display:inline-flex;gap:6px;align-items:center;margin-right:8px">${MIC}Sort by voice</button>`);
    }
    if (screen === "ghosts" || screen === "ghostsKept") sayInThread("What's missing under Facade systems for my tower?", "Add sub-topics to Facade systems");
    if (screen === "tidy" || screen === "tidyApplied") sayInThread("Tidy my Design & Composition area", "Tidy my Design area");
  }
  function sayInThread(spoken, typed) {
    const p = $$(".cp-thread .msg.user p", root).find((x) => x.textContent.trim() === typed);
    if (p && S.on) { p.textContent = spoken; p.parentElement.classList.add("vx-said"); }
  }

  /* ---------------------------------------------------------------- toasts (the app's own .vtoast) */
  function toast(title, body, undo = true) {
    $$(".vtoasts.vx-t").forEach((t) => t.remove());
    const host = document.createElement("div");
    host.className = "vtoasts start vx-t";
    host.setAttribute("role", "status");
    host.innerHTML = `<div class="vtoast"><b>${title}</b><button aria-label="Dismiss" type="button">×</button><p>${body}</p>${undo ? '<span class="vtoast-actions"><button class="vtoast-action" type="button">Undo</button></span>' : ""}</div>`;
    host.addEventListener("click", (e) => { if (e.target.closest("button")) host.remove(); });
    document.body.appendChild(host);
    setTimeout(() => host.remove(), 9000);
  }

  /* ---------------------------------------------------------------- session + dock */
  const S = { on: false, run: 0, secs: 0, tick: null, audio: true, consent: false, log: [], state: "idle", busyAt: 0 };
  const STOP = new Error("stop");
  const dock = document.createElement("section");
  dock.className = "vx-dock";
  dock.hidden = true;
  dock.setAttribute("aria-label", "Talking to Studiolo");
  dock.innerHTML = `
    <div class="vx-head">
      <span class="vx-orb" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="vx-who"><span class="vx-state" role="status">Listening</span><span class="vx-anchor"></span></span>
      <span class="vx-mins" title="Voice minutes this session"></span>
      <button class="icb vx-audio" type="button" aria-pressed="true" aria-label="Narrator audio" title="Narrator audio (your browser's voice stands in for the ElevenLabs voice)">${SPEAKER}</button>
      <button class="icb vx-min" type="button" aria-label="Minimise" title="Minimise">${MINI}</button>
      <button class="button button-quiet vx-end" type="button">End</button>
    </div>
    <div class="vx-body">
      <p class="vx-caption" aria-live="off"></p>
      <div class="vx-trace"></div>
      <div class="vx-cards cp-body"></div>
    </div>
    <div class="cp-comp">
      <div class="prompts" role="group" aria-label="Things you could say"></div>
      <form class="box">
        <span class="scope"></span>
        <label class="visually-hidden" for="vx-text">Say or type to Studiolo</label>
        <textarea id="vx-text" rows="1" placeholder="Hold the mic and talk, or type…"></textarea>
        <div class="tools"><span class="grow vx-tip">Hold Space or the mic to talk</span>
          <button class="vx-talk" type="button" aria-label="Hold to talk">${MIC}</button>
          <button aria-label="Send" class="send" type="submit"><svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(dock);
  const D = {
    state: $(".vx-state", dock), anchor: $(".vx-anchor", dock), mins: $(".vx-mins", dock), cap: $(".vx-caption", dock),
    trace: $(".vx-trace", dock), cards: $(".vx-cards", dock), prompts: $(".prompts", dock), scope: $(".scope", dock), text: $("#vx-text", dock), body: $(".vx-body", dock),
  };
  const LABEL = { listening: "Listening", hearing: "Hearing you…", thinking: "Thinking…", speaking: "Studiolo is speaking", paused: "Paused · line closed", ended: "Session ended", connecting: "Connecting…" };
  function setState(st, label) {
    S.state = st;
    dock.dataset.state = st;
    D.state.textContent = label || LABEL[st] || st;
    const t = $(".vx-rail-talk", root);
    if (t) t.dataset.on = String(S.on && st !== "ended");
  }
  function fmt(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }
  function renderMins() { D.mins.textContent = `${fmt(S.secs)} of 10:00`; }
  function setAnchor(text, scope) { D.anchor.textContent = text; D.scope.innerHTML = `${esc(scope)}<button aria-label="Talk about the whole map instead" type="button">×</button>`; }
  function trace(text, code) {
    const row = document.createElement("div");
    row.className = "steps";
    row.innerHTML = `<i aria-hidden="true">›</i><span>${text}</span>${code ? `<code>${esc(code)}</code>` : ""}`;
    D.trace.appendChild(row);
    while (D.trace.children.length > 3) D.trace.firstChild.remove();
  }
  function cards(html) { D.cards.innerHTML = html; if (html) D.body.scrollTop = 0; }
  function chips(list, kind = "answer") {
    D.prompts.innerHTML = list.map((t) => `<button type="button" data-kind="${kind}">${esc(t)}</button>`).join("");
  }
  function you(text) { D.cap.dataset.who = "you"; D.cap.textContent = text; }

  /* ---------------------------------------------------------------- the narrator's voice */
  let voice = null;
  function pickVoice() {
    const all = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    voice = all.find((v) => /en-GB/i.test(v.lang) && /female|Serena|Kate|Libby|Sonia|Google UK English Female/i.test(v.name)) || all.find((v) => /en-GB/i.test(v.lang)) || all.find((v) => /^en/i.test(v.lang)) || null;
  }
  if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function ttsCancel() { try { window.speechSynthesis && speechSynthesis.cancel(); } catch { /* none */ } }
  function tts(text, onBoundary, onEnd) {
    if (!S.audio || !window.speechSynthesis) return false;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-GB"; u.rate = 1.04; u.pitch = 1;
      if (voice) u.voice = voice;
      u.onboundary = (e) => { if (e.name === "word" || e.charIndex !== undefined) onBoundary(e.charIndex); };
      u.onend = onEnd; u.onerror = onEnd;
      speechSynthesis.speak(u);
      return true;
    } catch { return false; }
  }

  let speaking = null;
  let pending = null;
  /** Speaks `text`. Resolves {done:true}, or {heard:"…"} when the learner cut in. Captions in the dock, and on the
   *  stage when `stage` (the player's own .xp-caption); `lit` lights stage anchors as their cue words are spoken. */
  function narr(text, { stage = false, lit = [], wpm = 175 } = {}) {
    const run = S.run;
    return new Promise((resolve, reject) => {
      setState("speaking");
      const words = text.split(/\s+/);
      const starts = []; let pos = 0;
      for (const w of words) { const i = text.indexOf(w, pos); starts.push(i); pos = i + w.length; }
      const cues = lit.map(([cue, anchor]) => { const k = words.findIndex((w) => w.toLowerCase().replace(/[^a-z']/g, "").startsWith(cue.toLowerCase())); return [k < 0 ? 0 : k, anchor]; });
      D.cap.dataset.who = "studiolo";
      let shown = -1;
      const draw = (k) => {
        if (k === shown) return; shown = k;
        // In the panel there's room for about three lines, so the caption slides along with the voice.
        const tight = dock.classList.contains("in-panel");
        const from = tight ? Math.max(0, k - 16) : 0, to = tight ? Math.min(words.length, from + 26) : words.length;
        const html = words.slice(from, to).map((w, j) => { const i = from + j; return i <= k ? `<b${i === k ? ' data-current="true"' : ""}>${esc(w)}</b>` : esc(w); }).join(" ");
        D.cap.innerHTML = (from > 0 ? "… " : "") + html + (to < words.length ? " …" : "");
        if (stage) stageCaption(words, k);
        for (const [at, anchor] of cues) if (k >= at) light(anchor);
      };
      draw(0);
      let k = 0, done = false, lastBoundary = 0;
      const per = 60000 / wpm;
      // The browser voice drives the words when it works; when it fails or has no voices (it then "ends" at once),
      // a reading clock at the narrator's pace takes over, so captions and timing still behave like the real thing.
      const began = Date.now(), estimate = words.length * per;
      const clock = setInterval(() => { if (Date.now() - lastBoundary > 700 && k < words.length - 1) draw(++k); else if (!voiced && k >= words.length - 1) finish({ done: true }); }, per);
      let voiced = tts(text, (ci) => { lastBoundary = Date.now(); let j = starts.findIndex((s) => s > ci); j = j < 0 ? words.length - 1 : Math.max(0, j - 1); if (j > k) { k = j; draw(k); } }, (e) => {
        if (done) return;
        if ((e && e.type === "error") || Date.now() - began < estimate * 0.35) { voiced = false; return; }
        finish({ done: true });
      });
      const safety = setTimeout(() => finish({ done: true }), estimate * 1.9 + 2500);
      function finish(result) {
        if (done) return; done = true;
        clearInterval(clock); clearTimeout(safety); ttsCancel();
        if (result.done) draw(words.length - 1);
        speaking = null;
        if (stage) stageCaption(null);
        if (run !== S.run) return reject(STOP);
        resolve(result);
      }
      speaking = { cut: (heard) => finish({ heard }), stop: () => finish({ stopped: true }) };
    });
  }
  /** Waits for the learner: a chip, typed text, or held mic. */
  function listen(list, kind = "answer", state = "listening", label) {
    const run = S.run;
    if (list) chips(list, kind);
    setState(state, label);
    return new Promise((resolve, reject) => { pending = (t) => (run !== S.run ? reject(STOP) : resolve(t)); });
  }
  async function think(ms = 900, label) {
    const run = S.run;
    setState("thinking", label);
    await sleepRaw(ms);
    if (run !== S.run) throw STOP;
  }
  async function wait(ms) { const run = S.run; await sleepRaw(ms); if (run !== S.run) throw STOP; }
  function deliver(text) {
    text = String(text || "").trim();
    if (!text || !S.on) return;
    you(text);
    S.log.push(["you", text]);
    if (speaking) { const s = speaking; speaking = null; s.cut(text); return; }
    if (pending) { const p = pending; pending = null; p(text); }
  }
  const INTENT = [
    ["end", /^(that'?s all|end|bye|finish|stop the session)/i], ["stop", /^(stop|wait|hold on|pause)\b/i], ["resume", /(carry on|go on|continue|resume|back to it|keep going)/i],
    ["another", /(another way|don'?t get|differently|analogy|simpler|explain that)/i], ["deeper", /(deeper|more detail|go further)/i], ["test", /(test me|quiz|check)/i],
    ["skip", /(skip|i know this)/i], ["back", /(go back|previous|last slide)/i], ["map", /(on (my|the) map|show me .*map)/i],
    ["no", /^(no\b|not now|cancel|leave it)/i], ["yes", /^(yes|yeah|yep|sure|ok|okay|apply|do it|go ahead|keep (them|it|all)|please)/i],
  ];
  const intent = (t) => (INTENT.find(([, re]) => re.test(t)) || ["other"])[0];

  function startTicker() {
    clearInterval(S.tick);
    S.tick = setInterval(() => { if (S.on && !["paused", "ended"].includes(S.state)) { S.secs++; renderMins(); } }, 1000);
  }
  /** Opens the line: consent the first time, then the dock. Returns false when the learner said not now. */
  async function open(anchor, scope) {
    if (!S.consent && !(await consent())) return false;
    S.on = true; S.secs = 0; S.log = []; S.started = Date.now(); S.liveDone = false;
    renderMins(); setAnchor(anchor, scope);
    D.trace.innerHTML = ""; cards(""); D.cap.textContent = ""; chips([]);
    dock.hidden = false; dock.dataset.min = "false";
    mountDock();
    setState("connecting");
    startTicker();
    const rt = $(".vx-rail-talk", root); if (rt) rt.dataset.on = "true";
    await sleepRaw(450);
    return true;
  }
  function close() {
    S.run++;
    if (speaking) speaking.stop();
    pending = null;
    ttsCancel();
    S.on = false;
    clearInterval(S.tick);
    dock.hidden = true;
    S.state = "idle";
    parkDock();
    const comp = $(".cp .cp-comp", root); if (comp) comp.hidden = false;
    const t = $(".vx-rail-talk", root); if (t) t.dataset.on = "false";
  }
  /** Starts a scripted flow as its own run, so a new one (or End) stops the old one cleanly. */
  function begin(flow) {
    S.run++;
    if (speaking) speaking.stop();
    pending = null;
    const run = S.run;
    Promise.resolve().then(() => flow()).catch((e) => { if (e !== STOP) console.error(e); }).finally(() => { if (run === S.run && S.on && S.state !== "ended") setState("listening"); });
  }

  function consent() {
    return new Promise((resolve) => {
      const wrap = document.createElement("div");
      wrap.innerHTML = `<div class="graph-dialog-overlay" style="pointer-events:auto"></div>
        <div role="dialog" aria-modal="true" aria-labelledby="vx-consent-t" class="graph-dialog" style="pointer-events:auto">
          <h2 id="vx-consent-t" class="graph-dialog-title">Talk to Studiolo</h2>
          <div style="display:grid;gap:10px;font-size:14px;line-height:1.5;color:var(--text-muted);margin:6px 0 16px">
            <p style="margin:0">Studiolo listens only while the line is open. The mic in the sidebar lights up whenever it is.</p>
            <p style="margin:0">Your voice goes to our voice provider in the EU to be turned into text. It isn't recorded, and the transcript is kept only if you choose to keep it.</p>
            <p style="margin:0">Spoken time counts towards your monthly allowance: up to 10 minutes a session.</p>
            <p style="margin:0;font-size:12.5px;color:var(--ink-3)">Prototype: nothing is recorded here. Instead of speaking, pick or type what you'd say.</p>
          </div>
          <div class="row"><button class="button button-quiet" type="button" data-a="no">Not now</button><button class="button" type="button" data-a="yes">Turn on the microphone</button></div>
        </div>`;
      document.body.appendChild(wrap);
      $("[data-a=yes]", wrap).focus();
      wrap.addEventListener("click", (e) => {
        const a = e.target.closest("[data-a]"); if (!a) return;
        wrap.remove(); S.consent = a.dataset.a === "yes"; resolve(S.consent);
      });
    });
  }

  /* dock controls */
  dock.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.matches(".prompts button")) return deliver(b.textContent);
    if (b.matches(".vx-end")) return begin(() => recap());
    if (b.matches(".vx-min")) { dock.dataset.min = String(dock.dataset.min !== "true"); return; }
    if (b.matches(".vx-audio")) { S.audio = !S.audio; b.setAttribute("aria-pressed", String(S.audio)); if (!S.audio) ttsCancel(); return; }
    if (b.matches(".scope button")) return;
  });
  $("form", dock).addEventListener("submit", (e) => { e.preventDefault(); const t = D.text.value; D.text.value = ""; deliver(t); });
  D.text.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("form", dock).requestSubmit(); } });

  /* Hold to talk: the mic button, or Space outside a text box. The prototype "hears" the first suggestion. */
  let held = null;
  function holdStart() {
    if (!S.on || held) return;
    if (speaking) { speaking.stop && ttsCancel(); }
    const first = $(".prompts button", dock);
    const said = first ? first.textContent : "";
    held = { said, i: 0, t: null };
    $(".vx-talk", dock).dataset.held = "true";
    setState("hearing");
    D.cap.dataset.who = "you"; D.cap.textContent = "…";
    held.t = setInterval(() => { if (!held) return; held.i = Math.min(said.length, held.i + 3); D.cap.textContent = said.slice(0, held.i) + (held.i < said.length ? "…" : ""); }, 45);
  }
  function holdEnd() {
    if (!held) return;
    const h = held; held = null; clearInterval(h.t);
    $(".vx-talk", dock).dataset.held = "false";
    if (h.said) deliver(h.said); else setState("listening");
  }
  const talk = $(".vx-talk", dock);
  talk.addEventListener("pointerdown", (e) => { e.preventDefault(); holdStart(); });
  talk.addEventListener("pointerup", holdEnd);
  talk.addEventListener("pointerleave", holdEnd);
  talk.addEventListener("keydown", (e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); holdStart(); } });
  talk.addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); holdEnd(); } });
  let spaceT = null;
  document.addEventListener("keydown", (e) => {
    if (e.code !== "Space" || e.repeat || e.target.closest("textarea, input, select, button, [contenteditable]")) return;
    e.preventDefault();
    if (S.on) return holdStart();
    if (screen === "player" && P.mode === "recorded") spaceT = setTimeout(() => { spaceT = "held"; askFromPlayer(); }, 380);
  });
  document.addEventListener("keyup", (e) => {
    if (e.code !== "Space" || e.target.closest("textarea, input, select, button, [contenteditable]")) return;
    if (held) return holdEnd();
    if (spaceT && spaceT !== "held") { clearTimeout(spaceT); P.toggle(); }
    spaceT = null;
  });

  /* ---------------------------------------------------------------- the Lumen stage (the app's .xp-* player) */
  // The map's Lumen lane draws thumbnails with the same .xp-* classes, so every stage lookup is scoped to the player.
  const G = () => $(".gp-panel", root) || root;
  const P = { mode: null, t: 0, playing: false, raf: 0, line: -1, lastTs: 0 };
  const LINES = [
    { slide: 0, text: "The four-iwan plan starts from a court open to the sky, and everything in the building faces it.", lit: [] },
    { slide: 1, text: "Four vaulted halls, the iwans, open onto that court, one in the middle of each side, so the court reads as a cross.", lit: [["court", "i2.court"], ["iwans", "i2.iwans"]] },
    { slide: 1, text: "In a madrasa each hall could hold one school of law, which is why the plan spread so quickly across the region.", lit: [["school", "i2.law"]] },
  ];
  const WPM = 155;
  LINES.forEach((l, i) => { l.words = l.text.split(/\s+/); l.dur = (l.words.length * 60000) / WPM; l.at = i ? LINES[i - 1].at + LINES[i - 1].dur : 0; });
  const TOTAL = LINES.at(-1).at + LINES.at(-1).dur;

  function fitStage() {
    const box = $(".xp-box", G()), st = $(".xp-stage", G());
    if (box && st) st.style.transform = `scale(${box.clientWidth / 1280})`;
  }
  window.addEventListener("resize", fitStage);
  function stageScale() { const box = $(".xp-box", G()); return box ? box.clientWidth / 1280 : 1; }
  function setSlide(html, tag) {
    const host = $(".xp-slide-host", G()); if (!host) return;
    host.innerHTML = html;
    $$(".vx-board-tag, .vx-rev-tag", G()).forEach((t) => t.remove());
    if (tag) $(".xp-stage", G()).insertAdjacentHTML("beforeend", tag);
    pointer(null);
  }
  function light(anchor) {
    $$(".xp-slide-host [data-lit]", G()).forEach((el) => el.removeAttribute("data-lit"));
    const el = $(`.xp-slide-host [data-anchor="${anchor}"]`, G());
    if (!el) return;
    el.dataset.lit = "true";
    pointer(el);
  }
  function pointer(el) {
    const p = $(".xp-pointer", G()); if (!p) return;
    if (!el) { p.dataset.visible = "false"; return; }
    const s = $(".xp-stage", G()).getBoundingClientRect(), r = el.getBoundingClientRect(), k = stageScale();
    p.style.transform = `translate(${(r.left - s.left) / k - 30}px, ${(r.top - s.top) / k + r.height / k / 2}px)`;
    p.dataset.visible = "true";
  }
  function stageCaption(words, k) {
    const c = $(".xp-caption", G()); if (!c) return;
    if (!words) { c.dataset.visible = "false"; return; }
    $(".xp-screen-stage", G()).dataset.captions = "on";
    const from = Math.max(0, k - 9), to = Math.min(words.length, from + 18);
    c.innerHTML = words.slice(from, to).map((w, i) => (from + i <= k ? `<span>${i ? " " : ""}<b${from + i === k ? ' data-current="true"' : ""}>${esc(w)}</b></span>` : `<span> ${esc(w)}</span>`)).join("");
    c.dataset.visible = "true";
  }
  function playIcon(playing) {
    const b = $(".xp-ib-play", G()); if (!b) return;
    b.setAttribute("aria-label", playing ? "Pause" : "Play");
    $("svg", b).innerHTML = playing ? PAUSE : PLAY;
  }
  function scrub(frac, label) {
    const f = $(".xp-scrub-fill", G()), k = $(".xp-scrub-knob", G()), tm = $(".xp-tm", G());
    if (f) f.style.width = `${frac * 100}%`; if (k) k.style.left = `${frac * 100}%`;
    if (tm && label) tm.textContent = label;
  }
  function setupPlayer() {
    P.mode = "recorded"; P.t = 0; P.line = -1; P.playing = false;
    fitStage();
    requestAnimationFrame(fitStage);
    setSlide(DATA.slides[0]);
    const tm = $(".xp-tm", G());
    if (tm && !$(".vx-ask", G())) tm.insertAdjacentHTML("afterend", `<button class="xp-ib vx-ask" type="button" aria-label="Ask about this slide" title="Ask about this slide (or hold Space)">${MIC}Ask</button>`);
    $(".xp-screen-stage", G()).dataset.captions = "on";
    const cc = $('.xp-ctrl [aria-label="Captions"]', G()); if (cc) cc.setAttribute("aria-pressed", "true");
    playIcon(false);
    scrub(0, `0:00 / ${fmt(Math.round(TOTAL / 1000))}`);
    P.toggle = () => (P.playing ? pausePlayer() : playPlayer());
  }
  function playPlayer() {
    if (P.mode !== "recorded" || P.playing) return;
    if (P.t >= TOTAL) P.t = 0, P.line = -1;
    P.playing = true; playIcon(true); P.lastTs = performance.now();
    P.spoke = -1;
    const step = (ts) => {
      if (!P.playing) return;
      P.t += ts - P.lastTs; P.lastTs = ts;
      if (P.t >= TOTAL) { P.t = TOTAL; renderRecorded(); pausePlayer(); onRecordedEnd(); return; }
      renderRecorded();
      P.raf = requestAnimationFrame(step);
    };
    P.raf = requestAnimationFrame(step);
  }
  function pausePlayer() { P.playing = false; cancelAnimationFrame(P.raf); playIcon(false); if (!S.on) ttsCancel(); }
  function stopPlayer() { P.playing = false; cancelAnimationFrame(P.raf); P.mode = null; }
  function renderRecorded() {
    const i = LINES.findIndex((l) => P.t < l.at + l.dur);
    const line = LINES[i === -1 ? LINES.length - 1 : i];
    const idx = LINES.indexOf(line);
    if (idx !== P.line) {
      P.line = idx;
      setSlide(DATA.slides[line.slide]);
      if (P.playing && !S.on) { ttsCancel(); tts(line.text, () => {}, () => {}); }
    }
    const k = Math.min(line.words.length - 1, Math.floor(((P.t - line.at) / line.dur) * line.words.length));
    stageCaption(line.words, k);
    for (const [cue, anchor] of line.lit) { const at = line.words.findIndex((w) => w.toLowerCase().startsWith(cue)); if (k >= at) light(anchor); }
    scrub(P.t / TOTAL, `${fmt(Math.floor(P.t / 1000))} / ${fmt(Math.round(TOTAL / 1000))}`);
  }
  function onRecordedEnd() {
    if (S.on) return;
    stageCaption(null);
  }

  /* ---------------------------------------------------------------- slides the live narrator uses (the app's slide markup) */
  const slide = {
    title: (t, q, meta) => `<section class="xp-slide xp-tc" data-type="intro"><div class="xp-tc-brand"><span aria-hidden="true" class="xp-mark xp-tc-mark">S</span><span class="xp-tc-kicker">Studiolo Lumen</span></div><div class="xp-tc-block"><div class="xp-tc-text" data-anchor="t1"><h1 class="xp-title xp-tc-title">${t}</h1><p class="xp-tc-question">${q}</p></div><p class="xp-tc-meta"><span class="xp-tc-subject">Islamic architecture</span><span class="xp-tc-length">${meta}</span></p></div></section>`,
    list: (id, t, items, ordered) => `<section class="xp-slide" data-anchor="${id}" data-type="${ordered ? "ol" : "ul"}"><h2 class="xp-title">${t}</h2><${ordered ? "ol" : "ul"} class="xp-list">${items.map((x, i) => `<li data-anchor="${id}.${i + 1}" class="xp-hl">${x}</li>`).join("")}</${ordered ? "ol" : "ul"}></section>`,
    cards: (id, t, cs, choice) => `<section class="xp-slide" data-anchor="${id}" data-type="cards"><h2 class="xp-title">${t}</h2><div class="xp-cards" data-count="${cs.length}" style="--xp-cols: ${cs.length};">${cs.map(([h, p], i) => `<div class="xp-card xp-hl${choice ? " vx-choice" : ""}" data-anchor="${id}.${i + 1}"${choice ? ` data-choice="${i}" role="button" tabindex="0"` : ""}><h3>${h}</h3><p>${p}</p></div>`).join("")}</div></section>`,
    table: (id, t, head, rows) => `<section class="xp-slide" data-anchor="${id}" data-type="table"><h2 class="xp-title">${t}</h2><table class="xp-table"><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r, i) => `<tr data-anchor="${id}.${i + 1}" class="xp-hl">${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></section>`,
  };
  const BOARD = '<span class="vx-board-tag">Board</span>';
  const BEATS = [
    { id: "s1", html: () => DATA.slides[1], notes: "Start with the court, open to the sky. Four vaulted halls, the iwans, face it, one in the middle of each side. And in a madrasa, each hall could hold one school of law.", lit: [["court", "i2.court"], ["iwans", "i2.iwans"], ["madrasa", "i2.law"]],
      rework: { tag: "Rewritten · as a campus", html: () => slide.cards("s1r", "Like a campus around a quad", [["The quad", "The court: open, and shared by everyone"], ["Four faculties", "The iwans: one school of law each"], ["Rooms behind", "Cells where students lived and studied"]]),
        notes: "Picture a campus. The quad in the middle is the court: open, and shared by everyone. Facing it are four faculty buildings, the iwans, one for each school of law. And behind them are the rooms where students lived.", lit: [["quad", "s1r.1"], ["faculty", "s1r.2"], ["behind", "s1r.3"]] } },
    { id: "s2", html: () => slide.cards("s2", "Where the plan came from", [["Seljuk Iran", "The Friday Mosque of Isfahan takes four iwans in the 12th century"], ["Mamluk Cairo", "Sultan Hassan, from 1356: one iwan for each school of law"], ["Across the region", "Mosques, madrasas and caravanserais take it up"]]),
      notes: "The plan grew up in Iran: the Friday Mosque of Isfahan gets its four iwans in the twelfth century. By 1356, Sultan Hassan in Cairo gives each school of law its own iwan. From there it spreads to mosques, madrasas and even caravanserais.", lit: [["iran", "s2.1"], ["1356", "s2.2"], ["spreads", "s2.3"]] },
    { id: "s3", html: () => slide.table("s3", "Court or columns?", ["", "Four-iwan court", "Hypostyle hall"], [["At the centre", "An open court", "A field of columns"], ["Who it serves", "Four groups, one per hall", "One congregation"], ["In your Library", "Sultan Hassan", "Córdoba, Kairouan"]]),
      notes: "Compare it with the hypostyle halls you saved from Córdoba and Kairouan. There the centre is a field of columns serving one congregation. Here it's an open court, serving four groups, one per hall.", lit: [["compare", "s3.3"], ["field", "s3.1"], ["four", "s3.2"]] },
    { id: "s4", html: () => slide.list("s4", "How to read a four-iwan plan", ["Find the court", "Find the qibla iwan: the deepest one", "Look at the corners: what fills them?"], true),
      notes: "When you meet one of these plans, read it in three steps. Find the court first. Then find the qibla iwan, the deepest one. Then look at the corners, because that's where each building does something different.", lit: [["court", "s4.1"], ["qibla", "s4.2"], ["corners", "s4.3"]] },
  ];
  const DEEPER = { id: "d1", tag: "Added · deeper", html: () => slide.list("d1", "Why the qibla iwan is the biggest", ["It faces Mecca, the direction of prayer", "It is the deepest and tallest of the four", "It gets the richest decoration"]),
    notes: "One hall always wins: the qibla iwan, on the side facing Mecca. It's the deepest and tallest of the four, and it gets the richest decoration.", lit: [["qibla", "d1.1"], ["deepest", "d1.2"], ["richest", "d1.3"]] };
  const QUIZ = { html: () => slide.cards("q1", "In Sultan Hassan, what did each iwan hold?", [["One school of law", "Teaching for one of the four Sunni schools"], ["A tomb", "A burial chamber for the patron"], ["A market", "Shops rented out to pay for the building"]], true), right: 0 };

  function writing(text) {
    const o = $(".xp-overlay", G()); if (!o) return;
    $$(".xp-writing", o).forEach((w) => w.remove());
    if (text) o.insertAdjacentHTML("beforeend", `<p class="xp-writing" role="status"><span aria-hidden="true" class="xp-dot"></span>${text}</p>`);
  }
  function liveHead(on) {
    const k = $(".gp-kicker", G()), h = $("#gp-title", G()), meta = $(".gp-meta .xp-meta-line span", G());
    if (on) {
      if (k) k.innerHTML = '<span>Live Lumen</span><b class="gp-kicker-subject"> · Islamic architecture</b><span class="vx-live"><span class="xp-dot" aria-hidden="true"></span>Live</span>';
      if (h) h.textContent = "The four-iwan plan, talked through";
      if (meta) meta.textContent = "Narrated live by Studiolo · interrupt any time · saved to Learn when you finish";
      const tm = $(".xp-tm", G()); if (tm) tm.textContent = "Live";
      $$(".xp-scrub-tick", G()).forEach((t) => t.remove());
      $$(".vx-ask", G()).forEach((b) => b.remove());
    }
  }
  function liveProgress(i, n) { scrub(Math.min(1, i / n), `Slide ${Math.min(i + 1, n)} of ${n}`); }

  /* ---------------------------------------------------------------- flows */
  const BYE = "That's all";
  async function fallback(t) {
    await think(700);
    await narr("In the real build I'd answer that from what's on screen and your Library. In this prototype, try one of the suggestions.");
  }
  async function guard(card, said, steps) {
    const shownFor = ((Date.now() - (card._shownAt || Date.now())) / 1000).toFixed(1);
    card.insertAdjacentHTML("beforeend", `<p class="vx-guard"><span>Card on screen ${shownFor} s</span><span>Heard a clear yes: “${esc(said)}”</span><span>${steps} step${steps === 1 ? "" : "s"}, 5 or fewer</span></p>`);
    trace("Voice yes accepted by the confirm check", "confirm_card");
    await wait(1300);
  }

  /* 1 · Ask the Lumen: a recorded Lumen, interrupted. */
  async function askFromPlayer() {
    if (screen !== "player" || P.mode !== "recorded") return;
    pausePlayer(); ttsCancel();
    const slideNo = P.line < 1 ? 1 : 2;
    if (!(await open(`Lumen · Four iwans · slide ${slideNo} at ${fmt(Math.floor(P.t / 1000))}`, "About this slide"))) return;
    trace("Paused the Lumen", "player_control(pause)");
    begin(flowAsk);
  }
  async function flowAsk() {
    const opening = ["Why does each school of law get its own hall?", "Is Sultan Hassan built like this?", "Show me this on my map", BYE];
    await narr("I've paused it. What would you like to know?");
    let said = await listen(opening);
    for (;;) {
      const it = intent(said);
      if (it === "end") return recap();
      if (/school of law|own hall|each school/i.test(said)) {
        await think(800);
        trace("Read the slide on screen", "get_screen");
        trace("Drew a board slide", "show_board(cards)");
        S.boardFrom = $(".xp-slide-host", G()).innerHTML;
        setSlide(slide.cards("b1", "One court, four schools", [["Four schools", "Hanafi, Maliki, Shafi'i and Hanbali"], ["Four iwans", "Each school teaches in its own hall"], ["One court", "Shared by all of them"]]), BOARD);
        await narr("Because a madrasa like Sultan Hassan in Cairo taught all four Sunni schools of law at once. Each school got its own iwan to teach in, with its own rooms behind it, but they all shared the one court. One building, four communities.", { stage: true, lit: [["four", "b1.1"], ["iwan", "b1.2"], ["shared", "b1.3"]] });
        S.log.push(["covered", "Why each school of law gets its own iwan (board slide)"]);
        said = await listen(["Carry on", "Is Sultan Hassan built like this?", "Save that as a note", BYE]);
        continue;
      }
      if (/sultan hassan/i.test(said)) {
        await think(900);
        trace("Searched your Library", "find_items(\"Sultan Hassan\")");
        await narr("Yes. Sultan Hassan, built in Cairo from 1356, is the classic case: four iwans around the court, with a madrasa tucked into each corner. You saved a lecture on it: Sultan Hassan, plan, section and the four madrasas. Want me to open it after this?");
        S.log.push(["covered", "Sultan Hassan as the classic four-iwan madrasa"]);
        said = await listen(["Carry on", "Save that as a note", BYE]);
        continue;
      }
      if (/note/i.test(said)) {
        await think(700);
        trace("Drafted a note (it waits for you)", "capture_note");
        cards(`<fieldset class="cp-card"><legend class="cp-card-title">1 note for Islamic architecture<span class="tag ag">Adds</span></legend><p style="margin:0;font-family:var(--read);font-size:15px;line-height:1.45">Sultan Hassan (Cairo, 1356): four iwans on one court, one for each Sunni school of law; a madrasa in each corner.</p><div class="acts"><button class="button" type="button" data-act="keep-note">Keep</button><button class="button button-quiet" type="button" data-act="drop-note">Dismiss</button></div><p class="note">It waits in your Library inbox until you choose.</p></fieldset>`);
        await narr("I've drafted it as a note on Islamic architecture. Keep it?");
        const a = await listen(["Yes, keep it", "No, drop it"]);
        if (intent(a) === "yes") { cards(""); toast("Note saved.", "In your Library, on Islamic architecture."); S.log.push(["saved", "A note on Sultan Hassan, in your Library"]); await narr("Saved."); }
        else { cards(""); await narr("Dropped."); }
        said = await listen(["Carry on", BYE]);
        continue;
      }
      if (it === "map") {
        await think(600);
        trace("Pointed at it on the map", "show_on_map(Plan types & ritual)");
        const lab = $$("svg text", root).find((t) => /Plan types/.test(t.textContent));
        if (lab) { lab.style.fill = "var(--accent)"; lab.style.fontWeight = "600"; }
        await narr("It's Islamic architecture, under History and Theory. The plan itself has its own sub-topic: Plan types and ritual, there on the left.");
        said = await listen(["Carry on", "Why does each school of law get its own hall?", BYE]);
        continue;
      }
      if (it === "resume" || it === "yes") {
        if (S.boardFrom) { setSlide(S.boardFrom); S.boardFrom = null; }
        trace("Back to the Lumen", "player_control(resume)");
        chips(["Why does each school of law get its own hall?", "Stop", BYE], "interrupt");
        setState("listening", "Listening while it plays");
        D.cap.dataset.who = "studiolo"; D.cap.textContent = "I'm here if you need me.";
        playPlayer();
        const until = await new Promise((resolve) => {
          const check = setInterval(() => { if (!P.playing) { clearInterval(check); resolve("__end__"); } }, 300);
          const run = S.run; pending = (t) => { clearInterval(check); run === S.run && resolve(t); };
        });
        if (until !== "__end__") { pausePlayer(); said = until; continue; }
        await narr("That's the end of the Lumen. Want a quick check before you go?");
        said = await listen(["Test me", BYE]);
        if (intent(said) === "test") { await quiz(); }
        return recap();
      }
      if (it === "stop") { await narr("Paused. Say carry on when you're ready."); said = await listen(["Carry on", BYE]); continue; }
      await fallback(said);
      said = await listen(opening);
    }
  }

  async function quiz() {
    trace("Asked a check question", "show_board(quiz)");
    const before = $(".xp-slide-host", G()) ? $(".xp-slide-host", G()).innerHTML : null;
    if (before !== null) setSlide(QUIZ.html(), BOARD);
    await narr("In Sultan Hassan, what did each iwan hold? Tap a card, or tell me.", { stage: before !== null });
    const ans = await new Promise((resolve, reject) => {
      const run = S.run;
      chips(["One school of law", "A tomb", "A market"]);
      setState("listening");
      const onClick = (e) => { const c = e.target.closest(".vx-choice"); if (c) { root.removeEventListener("click", onClick); pending = null; run === S.run ? resolve(c.querySelector("h3").textContent) : reject(STOP); } };
      root.addEventListener("click", onClick);
      pending = (t) => { root.removeEventListener("click", onClick); run === S.run ? resolve(t) : reject(STOP); };
    });
    you(ans);
    const right = /school of law/i.test(ans);
    const cardsEls = $$(".vx-choice", G());
    cardsEls.forEach((c) => { const t = c.querySelector("h3").textContent; if (t === ans || (right && /school/i.test(t))) c.dataset.picked = right ? "right" : "wrong"; if (!right && /school/i.test(t)) c.dataset.picked = "right"; });
    S.log.push(["evidence", right ? "Check question answered correctly" : "Check question missed (marked to revisit)"]);
    await narr(right ? "Exactly: one school of law each. That's the idea to keep." : "Not quite. Each iwan held one school of law. The tomb was there too, but behind the qibla iwan. I'll bring this back in a few days.", { stage: before !== null });
    if (before !== null) setSlide(before);
  }

  /* 2 · Live Lumen: performed by the narrator, interruptible. */
  async function startLive() {
    show("player");
    P.mode = "live";
    stopPlayer(); P.mode = "live";
    liveHead(true);
    setSlide("");
    writing("Writing the first slide…");
    if (!(await open("Live Lumen · Islamic architecture", "About Islamic architecture · the four-iwan plan"))) { show("explain"); return; }
    trace("Started a Live Lumen (no voice-over files made)", "start_live_lumen");
    begin(flowLive);
  }
  async function flowLive() {
    await narr("Let's look at the four-iwan plan. While I put the first slide together: when you picture a madrasa, what do you see first?");
    const warm = await listen(["A courtyard", "A big dome", "Not sure yet"]);
    trace("Passed your answer to the writer as a focus", "focus_hint");
    S.log.push(["covered", "Warm-up: what you picture first"]);
    setSlide(slide.title("The four-iwan plan", "Why build four halls around one court?", "Live · about 6 min"));
    writing("Writing the next slide…");
    liveProgress(0, BEATS.length);
    await narr(/court/i.test(warm) ? "Good instinct: the court is where this whole story starts." : /dome/i.test(warm) ? "Lots of people do. The dome often covers a tomb, but the teaching happens around the court. Let's see why." : "That's fine. That's what this is for.");
    await wait(600);
    writing(null);
    const beats = BEATS.slice();
    let i = 0, reworks = 0;
    const INT = ["Stop", "Explain that another way", "Go deeper", "Test me", "Skip this", "Show me on the map"];
    while (i < beats.length) {
      const b = beats[i];
      const rev = b._rev;
      setSlide((rev || b).html(), rev ? `<span class="vx-rev-tag">${rev.tag}</span>` : b.tag ? `<span class="vx-rev-tag">${b.tag}</span>` : "");
      liveProgress(i, beats.length);
      trace(`Slide ${i + 1}: ${(rev || b).id || b.id}`, "present_beat");
      chips(INT, "interrupt");
      const r = await narr((rev || b).notes, { stage: true, lit: (rev || b).lit });
      if (r.done) { i++; continue; }
      const said = r.heard; const it = intent(said);
      if (it === "end") return recap();
      if (it === "stop") {
        await narr("Sure, I'll wait.");
        const run = S.run;
        const back = await Promise.race([listen(["Carry on", BYE], "answer", "listening", "Waiting · the line closes after 30 s of quiet"), sleepRaw(4000).then(() => "__closed__")]);
        if (run !== S.run) throw STOP;
        if (back === "__closed__") {
          trace("Line closed so silence isn't billed (after 30 s; 4 s here)", "disconnect");
          const t = await listen(["Carry on", BYE], "answer", "paused", "Paused · line closed, not billing");
          if (intent(t) === "end") return recap();
        }
        else if (intent(back) === "end") return recap();
        await think(700, "Reconnecting…");
        trace("Reopened the line with where we were", "reconnect(session state)");
        continue;
      }
      if (it === "another" && b.rework && !rev) {
        await think(500);
        trace("Rewriting this slide for you, as an architect", "rework_beat(s1, from_my_field)");
        writing("Rewriting this slide…");
        await narr("Let me try it from your side. You design buildings, so think of a campus.");
        await wait(900);
        writing(null);
        b._rev = b.rework; reworks++;
        S.log.push(["covered", "Slide 1 rewritten as a campus analogy (1 rework of 4)"]);
        continue;
      }
      if (it === "another") { await narr("Here's the short version: one shared court, four halls facing it, each with its own job. Shall I carry on?"); const t = await listen(["Carry on", BYE]); if (intent(t) === "end") return recap(); i++; continue; }
      if (it === "deeper" && !beats.includes(DEEPER)) {
        await think(500);
        trace("Adding a slide after this one", "rework_beat(after s" + (i + 1) + ", deeper)");
        writing("Writing one more slide…");
        await narr("Sure, one more slide on that.");
        await wait(700); writing(null);
        beats.splice(i + 1, 0, DEEPER); i++;
        S.log.push(["covered", "Added a deeper slide: the qibla iwan"]);
        continue;
      }
      if (it === "test") { await quiz(); i++; continue; }
      if (it === "skip") { trace("Skipped ahead", "go_to_beat(next)"); S.log.push(["evidence", `Skipped slide ${i + 1} (you knew it)`]); await narr("Skipping ahead."); i++; continue; }
      if (it === "back") { trace("Went back", "go_to_beat(previous)"); i = Math.max(0, i - 1); continue; }
      if (it === "map") {
        trace("Pointed at it on the map", "show_on_map(Islamic architecture)");
        await narr("It sits under History and Theory, next to Plan types and ritual. I'll pick up where we were.");
        continue;
      }
      await fallback(said);
      const t = await listen(["Carry on", BYE]);
      if (intent(t) === "end") return recap();
    }
    liveProgress(beats.length, beats.length);
    chips([]);
    await narr("That's the four-iwan plan. One last thing: in a sentence, why do all four halls face the court?");
    const ans = await listen(["Because the court is shared by everyone", "Skip the check"]);
    if (!/skip/i.test(ans)) { S.log.push(["evidence", "Explained it back in your own words"]); await narr("Exactly. That's the idea to keep."); }
    S.log.push(["saved", `“The four-iwan plan, talked through”: ${beats.length + 1} slides, in Learn and on Islamic architecture${reworks ? `, with your rewritten slide` : ""}`]);
    S.liveDone = true;
    return recap();
  }

  /* 3 · On the map: propose topics, then a change plan, by voice. */
  async function flowMap() {
    const opening = ["What's missing under Facade systems for my tower?", "Tidy my Design & Composition area", "What should I learn next?", BYE];
    await narr(screen === "facade" ? "I'm listening. We're on Facade systems." : "I'm listening.");
    let said = await listen(opening);
    for (;;) {
      if (intent(said) === "end") return recap();
      if (/missing|facade|sub-topics/i.test(said)) {
        await think(1000);
        trace("Read Facade systems", "read_topic");
        trace("Suggested 4 topics (dashed until you keep them)", "propose_topics");
        show("ghosts");
        const card = $(".cp-card[data-proposal-id]", root); card._shownAt = Date.now();
        scrollThread(card.closest(".msg"));
        const items = $$(".gl li", card);
        const read = narr("For a tower, four would help most: glass and glazing, facade loads and wind, thermal bridges, and mock-ups and testing. They're on your map as dashed topics. Shall I keep them?");
        for (const [n, li] of items.entries()) setTimeout(() => { items.forEach((x) => x.classList.remove("vx-reading")); li.classList.add("vx-reading"); if (n === 0) scrollThread(card); }, 1500 + n * 1250);
        await read; items.forEach((x) => x.classList.remove("vx-reading"));
        const a = await listen(["Keep all of them", "Not now"]);
        if (intent(a) === "yes") {
          await guard(card, a, 4);
          show("ghostsKept");
          scrollThread();
          S.log.push(["changed", "Kept 4 topics under Facade systems (Undo in the toast)"]);
          await narr("Done. Facade systems now has nine sub-topics. You can undo that from the note at the bottom left.");
        } else { S.log.push(["covered", "4 topic ideas for Facade systems, left waiting"]); await narr("I'll leave them waiting on the map."); }
        said = await listen(["Tidy my Design & Composition area", "What should I learn next?", BYE]);
        continue;
      }
      if (/tidy|design/i.test(said)) {
        await think(900);
        trace("Opened Design & Composition", "show_on_map");
        trace("Made a plan; nothing changes until you say", "propose_changes");
        show("tidy");
        setAnchor("Area chat · Design & Composition", "Design & Composition area");
        const card = $(".cp-change", root); card._shownAt = Date.now();
        scrollThread(card);
        const li = $$(".cp-change-list li", card);
        const read = narr("Here's a plan with three changes. One: a new group, Form and order, holding ordering principles, massing and hierarchy, and proportion. Two: rename Space, sequence and threshold to Space and sequence. Three: connect Form and order to Typologies. Nothing changes until you say so. Shall I apply all three?");
        [1700, 7600, 12600].forEach((ms, n) => setTimeout(() => { li.forEach((x) => x.classList.remove("vx-reading")); if (li[n]) { li[n].classList.add("vx-reading"); scrollThread(li[n]); } }, ms));
        await read; li.forEach((x) => x.classList.remove("vx-reading"));
        let a = await listen(["Yes, apply them", "Delete Massing & hierarchy too", "Not now"]);
        if (/delete/i.test(a)) {
          trace("Deletes always need a tap", "confirm_card → needs_tap");
          cards(`<fieldset class="cp-card"><legend class="cp-card-title">Delete Massing &amp; hierarchy<span class="tag ask">NEEDS A TAP</span></legend><p class="note" style="margin:0">Voice can't delete. Tap Delete if you mean it.</p><p class="vx-guard"><span data-ok="false">Deletes need a tap, not a spoken yes</span></p><div class="acts"><button class="button" type="button" data-act="del">Delete</button><button class="button button-quiet" type="button" data-act="keepit">Keep it</button></div></fieldset>`);
          await narr("Deleting needs a tap from you, not just your voice. I've put it on a card. Meanwhile, shall I apply the three changes?");
          a = await listen(["Yes, apply them", "Not now"]);
        }
        if (intent(a) === "yes") {
          await guard(card, a, 3);
          cards("");
          show("tidyApplied");
          scrollThread($(".cp-change", root));
          S.log.push(["changed", "Tidied Design & Composition: 3 changes (Undo all on the card)"]);
          await narr("Applied. If you change your mind, Undo all is on the card.");
        } else { $("[data-act=decline]", card)?.click(); S.log.push(["covered", "A tidy plan for Design & Composition, not applied"]); await narr("Left as it is."); }
        said = await listen(["What should I learn next?", BYE]);
        continue;
      }
      if (/learn next|what should i/i.test(said)) { await suggestNext(); said = await listen(["Start the first one", BYE]); if (/first/i.test(said)) { close(); return scenario("ask"); } continue; }
      if (/explain .*live|live/i.test(said)) { close(); return startLive(); }
      await fallback(said);
      said = await listen(opening);
    }
  }

  /* 4 · Library: a sort plan the Library can't make today. */
  async function flowLibrary() {
    const opening = ["Sort my Sultan Hassan saves", "Save a note: check the qibla wall angle on site", BYE];
    await narr("I'm listening. What shall we do in your Library?");
    let said = await listen(opening);
    for (;;) {
      if (intent(said) === "end") return recap();
      if (/sort|sultan/i.test(said)) {
        await think(1000);
        trace("Found 3 entries about Sultan Hassan", "read_library(\"Sultan Hassan\")");
        const ids = ["006", "004", "00a"].map((n) => `00000000-0000-4000-a000-000000000${n}`);
        ids.forEach((id) => $(`.mcard[data-item-id="${id}"]`, root)?.classList.add("vx-touched"));
        trace("Made a sort plan; nothing moves until you say", "propose_library_plan");
        const tpl = document.createElement("div");
        tpl.innerHTML = DATA.screens.tidy;
        const real = tpl.querySelector(".cp-change");
        real.querySelector("legend").innerHTML = 'Sort Sultan Hassan · 3 changes<span class="tag ask">ASKS FIRST</span>';
        real.querySelector(".cp-change-made").textContent = "Made from your Library just now. Nothing moves until you apply, and nothing is deleted.";
        real.querySelector(".cc-bar")?.remove();
        const whats = [["New collection <b>Sultan Hassan</b>", "Three entries are about one building."], ["Move <b>Sultan Hassan: plan, section and the four madrasas</b>, <b>The mausoleum at Sultan Hassan faces the Citadel</b> and <b>What I took from Sultan Hassan</b> into it", "They're spread across Lectures, Notes and Essays."], ["Tag all three <b>Plan types &amp; ritual</b>", "That's the topic they explain on your map."]];
        $$(".cp-change-list li", real).forEach((li, n) => { li.querySelector(".what").innerHTML = `${whats[n][0]}<span class="why">${whats[n][1]}</span>`; });
        cards(real.outerHTML);
        const card = $(".cp-change", dock); card._shownAt = Date.now();
        const li = $$(".cp-change-list li", card);
        const read = narr("Three of your saves are about Sultan Hassan, spread across lectures, notes and essays. I'd make a Sultan Hassan collection, move all three into it, and tag them Plan types and ritual. Nothing is deleted. Shall I?");
        [300, 3600, 8800].forEach((ms, n) => setTimeout(() => { li.forEach((x) => x.classList.remove("vx-reading")); li[n] && li[n].classList.add("vx-reading"); }, ms));
        await read; li.forEach((x) => x.classList.remove("vx-reading"));
        const a = await listen(["Yes, apply", "Not now"]);
        if (intent(a) === "yes") {
          await guard(card, a, 3);
          const done = document.createElement("div"); done.innerHTML = DATA.screens.tidyApplied;
          const applied = done.querySelector(".cp-change");
          applied.querySelector("legend").innerHTML = `Sort Sultan Hassan · 3 changes<span class="tag done">APPLIED ${new Date().toTimeString().slice(0, 5)}</span>`;
          $$(".cp-change-list li .what", applied).forEach((w, n) => (w.innerHTML = whats[n][0]));
          cards(applied.outerHTML);
          const head = $(".destination-header", root); if (head) head.innerHTML = head.innerHTML.replace("11 collections", "12 collections");
          toast("Sorted into Sultan Hassan.", "3 entries moved and tagged. Undo stays on the card while nothing has changed.");
          S.log.push(["changed", "New collection Sultan Hassan, with 3 entries moved and tagged (Undo on the card)"]);
          await narr("Done. They're in the Sultan Hassan collection now.");
        } else { cards(""); await narr("Left as they are."); }
        $$(".vx-touched", root).forEach((c) => c.classList.remove("vx-touched"));
        said = await listen(["Save a note: check the qibla wall angle on site", BYE]);
        continue;
      }
      if (/note/i.test(said)) {
        await think(700);
        trace("Drafted a note (it waits for you)", "capture_note");
        cards(`<fieldset class="cp-card"><legend class="cp-card-title">1 note<span class="tag ag">Adds</span></legend><p style="margin:0;font-family:var(--read);font-size:15px">Check the qibla wall angle on site.</p><div class="acts"><button class="button" type="button">Keep</button><button class="button button-quiet" type="button">Dismiss</button></div></fieldset>`);
        await narr("Drafted. Keep it?");
        const a = await listen(["Yes, keep it", "No"]);
        cards("");
        if (intent(a) === "yes") { toast("Note saved.", "It's at the top of your Library."); S.log.push(["saved", "A note: check the qibla wall angle on site"]); await narr("Saved."); } else await narr("Dropped.");
        said = await listen(["Sort my Sultan Hassan saves", BYE]);
        continue;
      }
      await fallback(said);
      said = await listen(opening);
    }
  }

  /* 5 · Today: plan a session, then jump into it. */
  async function suggestNext() {
    await think(1000);
    trace("Read your map, My Focus and what you've watched", "read_learning");
    trace("3 ideas, ranked by rules; worded by the model", "suggest_next");
    cards(`<fieldset class="cp-card cp-change"><legend class="cp-card-title">3 ideas for the next 20 minutes<span class="tag ag">Suggests</span></legend>
      <ul class="cp-change-list">
        <li><div class="row"><span></span><span class="num">1</span><span class="what">Finish <b>How the four-iwan plan organises a courtyard</b><span class="why">2 minutes left. Ask about it as you go.</span></span></div></li>
        <li><div class="row"><span></span><span class="num">2</span><span class="what">A Live Lumen on <b>Plan types &amp; ritual</b><span class="why">It's in My Focus. About 6 minutes.</span></span></div></li>
        <li><div class="row"><span></span><span class="num">3</span><span class="what">A 3-minute check on <b>Daylight &amp; shading</b><span class="why">You watched its Lumen this week.</span></span></div></li>
      </ul><p class="note">Nothing starts until you choose.</p></fieldset>`);
    const li = $$(".vx-cards li", dock);
    const read = narr("Here's a plan for twenty minutes. First, finish the four-iwan Lumen: you stopped two minutes from the end. Then a live Lumen on plan types and ritual. And if there's time, a three-minute check on daylight and shading. Which first?");
    [1500, 6800, 10500].forEach((ms, n) => setTimeout(() => { li.forEach((x) => x.classList.remove("vx-reading")); li[n] && li[n].classList.add("vx-reading"); }, ms));
    await read; li.forEach((x) => x.classList.remove("vx-reading"));
  }
  async function flowToday() {
    await narr("Good afternoon. How long have you got?");
    await listen(["About 20 minutes", "An hour"]);
    await suggestNext();
    const a = await listen(["Start with the first", "Do the live one", "Test me on daylight", BYE]);
    if (/first/i.test(a)) { await narr("Opening it."); close(); return scenario("ask", true); }
    if (/live/i.test(a)) { await narr("Starting it now."); close(); S.consent = true; return startLive(); }
    if (/daylight|test/i.test(a)) {
      trace("A check question", "show_board(quiz)");
      cards(`<fieldset class="cp-card"><legend class="cp-card-title">Daylight &amp; shading · check</legend><p style="margin:0 0 8px;font-family:var(--read);font-size:16px">Which facade gets a light shelf first, in the northern hemisphere?</p><div class="acts"><button class="button button-quiet" type="button" data-q="right">South</button><button class="button button-quiet" type="button" data-q="wrong">North</button><button class="button button-quiet" type="button" data-q="wrong">It doesn't matter</button></div></fieldset>`);
      await narr("Which facade gets a light shelf first, in the northern hemisphere?");
      const run = S.run;
      const pick = await new Promise((resolve, reject) => {
        chips(["South", "North", "It doesn't matter"]); setState("listening");
        const onClick = (e) => { const b = e.target.closest("[data-q]"); if (b) { dock.removeEventListener("click", onClick); pending = null; run === S.run ? resolve(b.textContent) : reject(STOP); } };
        dock.addEventListener("click", onClick);
        pending = (t) => { dock.removeEventListener("click", onClick); run === S.run ? resolve(t) : reject(STOP); };
      });
      you(pick);
      const ok = /south/i.test(pick);
      S.log.push(["evidence", ok ? "Daylight check: right" : "Daylight check: missed (back in 3 days)"]);
      cards("");
      await narr(ok ? "Right: south, where the high sun can bounce deep into the room." : "It's south: that's where the high sun can be bounced deep into the room. I'll ask again in three days.");
    }
    return recap();
  }

  /* The end of every session: a recap, the only trace the learner didn't choose to keep. */
  async function recap() {
    if (speaking) speaking.stop();
    ttsCancel();
    pausePlayer();
    if (P.mode === "live" && !S.liveDone) S.log.push(["saved", "“The four-iwan plan, talked through”, up to where you stopped: in Learn, ready to pick up"]);
    S.liveDone = true;
    const groups = { covered: "Covered", saved: "Saved", changed: "Changed", evidence: "For your review" };
    const rows = Object.entries(groups).map(([k, label]) => { const xs = S.log.filter(([t]) => t === k).map(([, v]) => v); return xs.length ? `<dt>${label}</dt>${xs.map((x) => `<dd>${esc(x)}</dd>`).join("")}` : ""; }).join("");
    const mins = fmt(S.secs);
    chips([]);
    setState("ended", "Session ended");
    D.cap.textContent = "";
    cards(`<fieldset class="cp-card"><legend class="cp-card-title">Session recap · ${mins}<span class="tag done">ENDED</span></legend>
      <dl class="vx-recap">${rows || "<dd>A short chat. Nothing was saved or changed.</dd>"}</dl>
      <p class="note">The transcript isn't kept unless you keep it. Pick up from here on Today.</p>
      <div class="acts"><button class="button" type="button" data-act="done">Done</button><button class="button button-quiet" type="button" data-act="keep-tx">Keep transcript</button></div></fieldset>`);
    trace("Saved the recap; line closed", "end_session");
    S.on = false;
    clearInterval(S.tick);
    const t = $(".vx-rail-talk", root); if (t) t.dataset.on = "false";
  }
  dock.addEventListener("click", (e) => {
    const a = e.target.closest("[data-act]"); if (!a) return;
    if (a.dataset.act === "done") { close(); }
    if (a.dataset.act === "keep-tx") { a.textContent = "Transcript kept"; a.disabled = true; }
    if (a.dataset.act === "del") { toast("Not in this prototype.", "Deletes arrive with change plans S3, each with its own tap and Undo.", false); cards(""); }
    if (a.dataset.act === "keepit") cards("");
  });

  /* ---------------------------------------------------------------- the Explain dialog: Explain live */
  function patchExplain() {
    const form = $(".graph-dialog form", root); if (!form) return;
    form.insertAdjacentHTML("beforeend", `<div class="vx-explain-live"><p><b>Or explain it live.</b> Studiolo talks you through it as the slides are drawn, and you can cut in at any time: “stop”, “explain that another way”, “test me”.</p><div class="vx-row"><button class="button vx-go-live" type="button" style="display:inline-flex;gap:6px;align-items:center">${MIC}Explain live</button><span class="vx-cost">About 6 minutes of voice · counts towards your allowance</span></div></div>`);
    const focus = $("#explain-focus", root); if (focus) focus.value = "the four-iwan plan";
  }

  /* ---------------------------------------------------------------- clicks on the real screens */
  root.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (a) {
      e.preventDefault();
      const h = a.getAttribute("href");
      if (h === "/today" || (a.matches(".brand-row"))) return scenario("today");
      if (h === "/library") return scenario("library");
      if (h === "/graph") return scenario("map");
      return;
    }
    const b = e.target.closest("button");
    if (b && b.matches(".theme-toggle")) { const el = document.documentElement; const dark = el.dataset.theme ? el.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; el.dataset.theme = dark ? "light" : "dark"; return; }
    if (b && b.matches(".vx-rail-talk, .vx-mic-inline")) return startHere();
    if (b && b.matches(".vx-ask")) return askFromPlayer();
    if (b && b.matches(".vx-plan")) return (async () => { if (await open("Today · Plan my session", "About today")) begin(flowToday); })();
    if (b && b.matches(".vx-sort")) return (async () => { if (await open("Library · Everything", "About your Library")) begin(flowLibrary); })();
    if (b && b.matches(".vx-go-live")) return startLive();
    if (screen === "explain" && b && /^(Cancel|Explain)$/.test(b.textContent.trim())) { e.preventDefault(); return show("graph"); }
    if (screen === "player" && b) {
      if (b.matches(".xp-ib-play")) return P.mode === "recorded" ? P.toggle() : S.on && deliver("Stop");
      if (b.getAttribute("aria-label") === "Close player") { if (S.on) close(); return show("graph"); }
    }
    if (screen === "player" && P.mode === "recorded" && e.target.closest(".xp-screen-stage")) return P.toggle();
    if (screen === "graph") {
      if (b && b.textContent.trim() === "Explain") return show("explain");
      const g = e.target.closest("g, a, button");
      if (g && /Four iwans|Lumens/.test(g.textContent)) { show("player"); return playPlayer(); }
    }
  });
  async function startHere() {
    if (S.on) { dock.dataset.min = "false"; return; }
    if (screen === "player" && P.mode === "recorded") return askFromPlayer();
    if (screen === "library") { if (await open("Library · Everything", "About your Library")) begin(flowLibrary); return; }
    if (screen === "today") { if (await open("Today · Plan my session", "About today")) begin(flowToday); return; }
    if (["facade", "ghosts", "ghostsKept", "tidy", "tidyApplied"].includes(screen)) { if (await open("Topic chat · Facade systems", "About Facade systems")) begin(flowMap); return; }
    if (await open("Topic chat · Islamic architecture", "About Islamic architecture")) begin(async () => {
      await narr("I'm listening. We're on Islamic architecture.");
      const said = await listen(["Explain the four-iwan plan live", "Play the four iwans Lumen", BYE]);
      if (/live/i.test(said)) { close(); return startLive(); }
      if (/play/i.test(said)) { close(); show("player"); return playPlayer(); }
      return recap();
    });
  }

  /* ---------------------------------------------------------------- the prototype bar (the specimens' .td-proto) */
  const HINTS = {
    ask: "A recorded Lumen plays. Press Ask, or hold Space, to cut in with a question.",
    live: "Choose Explain live. Then interrupt: Stop, Explain that another way, Test me…",
    map: "Press the mic beside Send, or Talk in the sidebar. Changes still ask first.",
    library: "Press Sort by voice. The plan asks first; nothing is deleted.",
    today: "Press Plan my session for three ideas, then start one.",
  };
  const bar = document.createElement("nav");
  bar.className = "td-proto vx-proto";
  bar.setAttribute("aria-label", "Prototype");
  bar.innerHTML = `<b>Prototype</b><label class="visually-hidden" for="vx-scn">Scenario</label><select id="vx-scn">
      <option value="ask">1 · Ask the Lumen</option><option value="live">2 · Live Lumen</option><option value="map">3 · Voice on the map</option>
      <option value="library">4 · Sort the Library</option><option value="today">5 · Plan my session</option></select>
    <button type="button" id="vx-restart">Restart</button><span class="vx-hint" id="vx-hint"></span>`;
  document.body.appendChild(bar);
  const sel = $("#vx-scn", bar);
  sel.addEventListener("change", () => scenario(sel.value));
  $("#vx-restart", bar).addEventListener("click", () => scenario(sel.value));
  function scenario(name, autoplay) {
    close();
    sel.value = name;
    $("#vx-hint", bar).textContent = HINTS[name];
    try { localStorage.setItem("vx-scn", name); } catch { /* private mode */ }
    if (name === "ask") { show("player"); if (autoplay) playPlayer(); }
    if (name === "live") show("explain");
    if (name === "map") show("facade");
    if (name === "library") show("library");
    if (name === "today") show("today");
  }
  let first = "ask";
  try { first = localStorage.getItem("vx-scn") || "ask"; } catch { /* private mode */ }
  scenario(HINTS[first] ? first : "ask");
})();
