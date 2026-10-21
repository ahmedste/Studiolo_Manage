/* The Studiolo dock (prototype, direction 2).
   One assistant and one conversation, docked at the bottom centre of every page. It follows you from Today to the
   Library, into a PDF, onto the 2D and 3D graph and into a course; it acts on whatever page you are on; it can pop a
   quick Lumen over the page and narrate it; and on the Graph it is the same conversation as the copilot panel.
   The screens underneath are the app's own DOM and CSS, captured read-only from studiolo's /dev/specimens
   (capture/capture.cjs). No microphone and no network: you pick or type what you'd say, and the browser's speech
   voice stands in for the ElevenLabs narrator. */
(() => {
  "use strict";
  const DATA = JSON.parse(document.getElementById("vx-data").textContent);
  const root = document.getElementById("vx-app");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  DATA.htmlClass.split(/\s+/).filter(Boolean).forEach((c) => document.documentElement.classList.add(c));

  const ICON = {
    mic: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    send: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    up: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 15l6-6 6 6"/></svg>',
    down: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>',
    speaker: '<svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
    page: '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/></svg>',
    play: '<path d="M8 5.5v13l11-6.5z"></path>', pause: '<path d="M7 5h4v14H7zM13 5h4v14h-4z"></path>',
  };
  const IDS = { crd: "00000000-0000-4000-8000-00000000000f" };

  /* ================================================================ pages */
  const PAGES = {
    today: { label: "Today", rail: "/today", chips: ["Pick up my lecture notes", "What should I learn today?", "Show my map in 3D"] },
    library: { label: "Library · Everything", rail: "/library", chips: ["Open my climate lecture notes", "Sort my Sultan Hassan saves", "Find what I saved on courtyards"] },
    pdf: { label: "Climate and Architecture · p. 2", rail: "/library", chips: ["Explain this page", "Save the key point as a note", "Put this on my map"] },
    graphHome: { label: "Graph · your whole map", rail: "/graph", graph: true, chips: ["Take me to Climate-responsive design", "Show me in 3D", "What should I learn next?"] },
    climate: { label: "Graph · Climate-responsive design", rail: "/graph", graph: true, topic: "Climate-responsive design", chips: () => (G.climate === "none" ? ["What's missing here?", "Explain this topic live", "Show me in 3D"] : G.climate === "proposed" ? ["Keep all three", "Explain this topic live", "Show me in 3D"] : ["Explain this topic live", "Show me in 3D", "Go back to my lecture notes"]) },
    g3: { label: "Graph 3D · your whole map", rail: "/graph", graph: true, chips: ["Fly to Climate-responsive design", "Show what I'm focusing on", "Which areas are still empty?"] },
    course: { label: "Course · Origin of Species, part 2", rail: "/learn", chips: ["Explain this part another way", "Quiz me on part 2", "Save the key idea as a note"] },
  };
  const G = { climate: "none", notes: [], sorted: false, mirror: { climate: [], graphHome: [], g3: [] }, seen: new Set() };
  let screen = null;

  /* ================================================================ dock markup */
  const dk = document.createElement("section");
  dk.className = "dk";
  dk.setAttribute("aria-label", "Studiolo");
  dk.innerHTML = `
    <div class="dk-sheet" role="dialog" aria-label="Your conversation with Studiolo">
      <div class="dk-shead"><b>Studiolo</b><span>One conversation that follows you round the app</span>
        <button class="icb dk-audio" type="button" aria-pressed="true" title="Narrator sound">${ICON.speaker}</button>
        <button class="icb dk-close" type="button" aria-label="Fold the conversation away">${ICON.down}</button></div>
      <div class="cp-body"><div class="cp-thread" role="log" aria-label="Conversation"></div></div>
    </div>
    <div class="dk-chips" role="group" aria-label="Things you could say"></div>
    <form class="dk-bar">
      <button class="dk-orb" type="button" aria-label="Show the conversation"><span class="dk-s">S</span><span class="dk-bars" aria-hidden="true"><i></i><i></i><i></i></span></button>
      <span class="dk-ctx" title="What Studiolo can see"></span>
      <button class="dk-np" type="button" title="Bring the Lumen back"><span class="xp-dot" aria-hidden="true"></span><span class="dk-np-t">Quick Lumen</span></button>
      <span class="dk-mid"><label class="visually-hidden" for="dk-in">Ask Studiolo</label><input id="dk-in" autocomplete="off" placeholder="Ask, or tell Studiolo what to do…"><p class="dk-live" aria-live="off"></p></span>
      <span class="dk-mins"></span>
      <button class="dk-btn dk-mic" type="button" aria-pressed="false" aria-label="Talk" title="Talk (opens the line)">${ICON.mic}</button>
      <button class="dk-btn dk-send" type="submit" aria-label="Send">${ICON.send}</button>
    </form>`;
  document.body.appendChild(dk);
  const D = { thread: $(".dk-sheet .cp-thread", dk), body: $(".dk-sheet .cp-body", dk), chips: $(".dk-chips", dk), ctx: $(".dk-ctx", dk), input: $("#dk-in", dk), live: $(".dk-live", dk), mins: $(".dk-mins", dk), np: $(".dk-np", dk) };

  const S = { voice: false, audio: true, consent: false, state: "idle", run: 0, secs: 0, flow: false };
  function setState(st) { S.state = st; dk.dataset.state = st; }
  function openSheet(on = true) { dk.dataset.open = String(on); if (on) scrollEnd(D.body); }
  function scrollEnd(el) { requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; }); }
  function chips(list, kind = "say") {
    D.chips.innerHTML = (list || []).map((t) => `<button type="button" data-kind="${kind}">${esc(t)}</button>`).join("");
  }
  function pageChips() { const p = PAGES[screen]; chips(typeof p.chips === "function" ? p.chips() : p.chips); }
  setInterval(() => { if (S.voice) { S.secs++; D.mins.textContent = `${Math.floor(S.secs / 60)}:${String(S.secs % 60).padStart(2, "0")}`; } }, 1000);

  /* ================================================================ the conversation (one thread, two views on the Graph) */
  let lastDay = "";
  function post(html, { mirror = true } = {}) {
    if (lastDay !== "Today") { D.thread.insertAdjacentHTML("beforeend", '<div class="day">Today</div>'); lastDay = "Today"; }
    D.thread.insertAdjacentHTML("beforeend", html);
    scrollEnd(D.body);
    // On the Graph the copilot panel shows the same conversation: what you say here lands in its thread too.
    if (mirror && PAGES[screen].graph) { G.mirror[screen].push(html); panelThread(html); }
  }
  function panelThread(html) {
    const body = $(".cp .cp-body", root); if (!body) return;
    let th = $(".cp-thread", body);
    if (!th) { body.insertAdjacentHTML("beforeend", '<div class="cp-thread" role="log" aria-label="Conversation"><div class="day">Today</div></div>'); th = $(".cp-thread", body); $(".cp-empty", body)?.remove(); }
    th.insertAdjacentHTML("beforeend", html.replace('class="msg ai"', 'class="msg ai dk-from"'));
    requestAnimationFrame(() => { body.scrollTop = body.scrollHeight; });
  }
  const userMsg = (t, spoken) => `<div class="msg user${spoken ? " dk-said" : ""}"><p>${esc(t)}</p></div>`;
  const aiMsg = (html, steps) => `<div class="msg ai"><div class="who"><span aria-hidden="true" class="av">S</span>Studiolo</div>${steps ? `<button aria-expanded="false" class="steps" type="button"><i aria-hidden="true">›</i>${steps}</button>` : ""}<div class="txt">${html}</div></div>`;
  function mark(text) { D.thread.insertAdjacentHTML("beforeend", `<div class="dk-mark">${ICON.page}${esc(text)}</div>`); scrollEnd(D.body); }

  /* ================================================================ speaking */
  let voice = null;
  const pickVoice = () => { const all = window.speechSynthesis ? speechSynthesis.getVoices() : []; voice = all.find((v) => /en-GB/i.test(v.lang)) || all.find((v) => /^en/i.test(v.lang)) || null; };
  if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  const hush = () => { try { window.speechSynthesis && speechSynthesis.cancel(); } catch { /* none */ } };
  function tts(text, onWord, onEnd) {
    if (!S.audio || !window.speechSynthesis) return false;
    try { const u = new SpeechSynthesisUtterance(text); u.lang = "en-GB"; u.rate = 1.04; if (voice) u.voice = voice; u.onboundary = (e) => onWord(e.charIndex); u.onend = onEnd; u.onerror = onEnd; speechSynthesis.speak(u); return true; } catch { return false; }
  }
  const STOP = new Error("stop");
  let speaking = null, pending = null;
  /** Narrates `text` with a live caption in the dock (and on the stage when a Lumen is up). Resolves {done} or {heard}. */
  function narr(text, { stage = null, lit = [], spoken = true } = {}) {
    const run = S.run;
    return new Promise((resolve, reject) => {
      setState("speaking");
      dk.dataset.captioning = "true";
      D.live.dataset.who = "studiolo";
      const words = text.split(/\s+/), starts = []; let pos = 0;
      for (const w of words) { const i = text.indexOf(w, pos); starts.push(i); pos = i + w.length; }
      const cues = lit.map(([cue, a]) => [Math.max(0, words.findIndex((w) => w.toLowerCase().replace(/[^a-z0-9']/g, "").startsWith(cue.toLowerCase()))), a]);
      let shown = -1, k = 0, done = false, last = 0;
      const draw = (n) => {
        if (n === shown) return; shown = n;
        D.live.innerHTML = `<span>${words.slice(Math.max(0, n - 14), n + 1).map((w, i, a) => (i === a.length - 1 ? `<b>${esc(w)}</b>` : `<b>${esc(w)}</b>`)).join(" ")} ${words.slice(n + 1, n + 6).map(esc).join(" ")}</span>`;
        if (stage) stage.caption(words, n);
        for (const [at, a] of cues) if (n >= at && stage) stage.light(a);
      };
      draw(0);
      const per = 60000 / 172, began = Date.now(), est = words.length * per;
      const clock = setInterval(() => { if (Date.now() - last > 700 && k < words.length - 1) draw(++k); else if (!voiced && k >= words.length - 1) finish({ done: true }); }, per);
      let voiced = spoken && tts(text, (ci) => { last = Date.now(); let j = starts.findIndex((s) => s > ci); j = j < 0 ? words.length - 1 : Math.max(0, j - 1); if (j > k) { k = j; draw(k); } }, (e) => {
        if (done) return;
        if ((e && e.type === "error") || Date.now() - began < est * 0.35) { voiced = false; return; }
        finish({ done: true });
      });
      const safety = setTimeout(() => finish({ done: true }), est * 1.9 + 2500);
      function finish(r) {
        if (done) return; done = true;
        clearInterval(clock); clearTimeout(safety); hush();
        speaking = null;
        if (stage) stage.caption(null);
        dk.dataset.captioning = "false";
        if (run !== S.run) return reject(STOP);
        resolve(r);
      }
      speaking = { cut: (heard) => finish({ heard }), stop: () => finish({ stopped: true }) };
    });
  }
  /** A reply from Studiolo: into the thread (and the copilot on the Graph); spoken when the line is open. */
  async function reply(html, { steps, card, plain } = {}) {
    const text = plain || html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    post(aiMsg(html + (card || ""), steps));
    if (card && !PAGES[screen].graph) openSheet(true);
    if (S.voice) return narr(text);
    setState("idle");
    await wait(Math.min(1400, 300 + text.length * 6));
    return { done: true };
  }
  async function think(ms = 800) { const run = S.run; setState("thinking"); await sleep(ms); if (run !== S.run) throw STOP; }
  async function wait(ms) { const run = S.run; await sleep(ms); if (run !== S.run) throw STOP; }
  function listen(list, kind = "say") {
    const run = S.run;
    if (list) chips(list, kind);
    setState("listening");
    return new Promise((resolve, reject) => { pending = (t) => (run !== S.run ? reject(STOP) : resolve(t)); });
  }

  /* ================================================================ input */
  function deliver(text, via = "dock") {
    text = String(text || "").trim(); if (!text) return;
    post(userMsg(text, S.voice));
    if (S.voice) { dk.dataset.captioning = "true"; D.live.dataset.who = "you"; D.live.textContent = text; }
    if (speaking) { const s = speaking; speaking = null; s.cut(text); return; }
    if (pending) { const p = pending; pending = null; p(text); return; }
    route(text);
  }
  function begin(flow) {
    S.run++; if (speaking) speaking.stop(); pending = null;
    const run = S.run;
    S.flow = true;
    Promise.resolve().then(flow).catch((e) => { if (e !== STOP) console.error(e); }).finally(() => { if (run === S.run) { S.flow = false; setState(S.voice ? "listening" : "idle"); if (!QL.on || QL.min) pageChips(); } });
  }
  $(".dk-bar", dk).addEventListener("submit", (e) => { e.preventDefault(); const t = D.input.value; D.input.value = ""; deliver(t); });
  dk.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.matches(".dk-chips button")) return deliver(b.textContent);
    if (b.matches(".dk-orb")) return openSheet(dk.dataset.open !== "true");
    if (b.matches(".dk-close")) return openSheet(false);
    if (b.matches(".dk-audio")) { S.audio = !S.audio; b.setAttribute("aria-pressed", String(S.audio)); if (!S.audio) hush(); return; }
    if (b.matches(".dk-mic")) return toggleVoice();
    if (b.matches(".dk-np")) return QL.restore();
    if (b.matches("[data-act]")) return act(b);
    if (b.matches(".steps")) return;
  });
  async function toggleVoice() {
    if (!S.voice && !S.consent && !(await consent())) return;
    S.voice = !S.voice;
    dk.dataset.voice = String(S.voice);
    $(".dk-mic", dk).setAttribute("aria-pressed", String(S.voice));
    if (!S.voice) { hush(); if (speaking) speaking.stop(); dk.dataset.captioning = "false"; setState("idle"); D.input.placeholder = "Ask, or tell Studiolo what to do…"; return; }
    D.input.placeholder = "Listening… (pick a suggestion or type what you'd say)";
    if (!S.flow) begin(async () => { await narr(`I'm here. ${greet()}`); });
  }
  function greet() { return { today: "What shall we start with?", library: "We're in your Library.", pdf: "I can see page 2 of your lecture notes.", graphHome: "We're on your whole map.", climate: "We're on Climate-responsive design.", g3: "We're on your map in 3D.", course: "We're on part 2 of the Origin of Species." }[screen]; }
  function consent() {
    return new Promise((resolve) => {
      const w = document.createElement("div");
      w.innerHTML = `<div class="graph-dialog-overlay" style="pointer-events:auto;z-index:150"></div><div role="dialog" aria-modal="true" aria-labelledby="dk-c" class="graph-dialog" style="pointer-events:auto;z-index:151">
        <h2 id="dk-c" class="graph-dialog-title">Talk to Studiolo</h2>
        <div style="display:grid;gap:10px;font-size:14px;line-height:1.5;color:var(--text-muted);margin:6px 0 16px">
          <p style="margin:0">The line stays open while you move round the app, and closes after 30 seconds of quiet. The dock glows whenever Studiolo can hear you.</p>
          <p style="margin:0">Your voice goes to our voice provider in the EU to be turned into text. It isn't recorded.</p>
          <p style="margin:0;font-size:12.5px;color:var(--ink-3)">Prototype: nothing is recorded. Pick a suggestion or type what you'd say.</p></div>
        <div class="row"><button class="button button-quiet" type="button" data-a="no">Not now</button><button class="button" type="button" data-a="yes">Turn on the microphone</button></div></div>`;
      document.body.appendChild(w); $("[data-a=yes]", w).focus();
      w.addEventListener("click", (e) => { const a = e.target.closest("[data-a]"); if (!a) return; w.remove(); S.consent = a.dataset.a === "yes"; resolve(S.consent); });
    });
  }

  /* ================================================================ moving round the app (the dock stays) */
  const TAB3D = '<a class="destination-tab dk-tab3d" href="#3d">3D <span style="font-size:10px;font-weight:600;letter-spacing:.05em;color:var(--ghost-ink);background:var(--ghost-soft);padding:1px 6px;border-radius:8px;margin-left:4px">NEW</span></a>';
  function refresh() { const keep = screen; screen = null; G3.stop(); root.innerHTML = DATA.screens[keep === "g3" ? "graphHome" : keep]; screen = keep; decorate(); requestAnimationFrame(placeDock); }
  function go(name, { quiet = false } = {}) {
    if (screen === name) return;
    const from = screen;
    if (PAGES[name].graph) openSheet(false);
    G3.stop();
    root.innerHTML = DATA.screens[name === "g3" ? "graphHome" : name];
    screen = name;
    decorate();
    D.ctx.innerHTML = `<b>${esc(PAGES[name].label)}</b>`;
    if (from) mark(`You opened ${PAGES[name].label}`);
    if (QL.on && !QL.min && from) QL.minimise();
    if (!S.flow) pageChips();
    if (!quiet && from && S.voice && !S.flow && !speaking) begin(() => narr(greet()));
    window.scrollTo(0, 0);
    requestAnimationFrame(placeDock);
  }
  function placeDock() {
    const side = $(".cpwrap", root) || $("#pdf-notes", root);
    const r = side && side.getBoundingClientRect();
    const right = r && r.width && innerWidth > 760 ? Math.max(0, innerWidth - r.left + 8) : 0;
    document.documentElement.style.setProperty("--dock-right", right + "px");
  }
  addEventListener("resize", () => { placeDock(); QL.fit(); });
  function decorate() {
    $$(".navigation-rail .navigation-link[href], .tab-bar .tab-bar-link[href]", root).forEach((a) => (a.getAttribute("href") === PAGES[screen].rail ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
    $$(".cp-comp", root).forEach((c) => (c.querySelector(".scope") ? null : null));
    if (PAGES[screen].graph) {
      const tabs = $(".destination-tabs", root);
      if (tabs && !$(".dk-tab3d", tabs)) tabs.insertAdjacentHTML("beforeend", TAB3D);
      if (screen === "g3") { $$(".destination-tab", root).forEach((t) => t.removeAttribute("aria-current")); $(".dk-tab3d", root).setAttribute("aria-current", "page"); mount3D(); }
      (G.mirror[screen] || []).forEach((h) => panelThread(h));
      // The copilot's own composer feeds the same conversation.
      const comp = $(".cp .cp-comp", root);
      if (comp) comp.insertAdjacentHTML("afterbegin", '<p class="dk-bridge" style="margin:0 0 6px">Shared with the dock: what you say there or here lands in both.</p>');
    }
    if (screen === "climate") climateMap();
    if (screen === "pdf") pdfPage();
    if (screen === "library" && G.sorted) { const h = $(".destination-header", root); if (h) h.innerHTML = h.innerHTML.replace("11 collections", "12 collections"); }
  }

  /* clicks on the real screens */
  root.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    const b = e.target.closest("button");
    if (a) {
      e.preventDefault();
      const h = a.getAttribute("href"), t = a.textContent.trim();
      if (a.matches(".dk-tab3d")) return go("g3");
      if (h === "/today" || a.matches(".brand-row")) return go("today");
      if (h === "/library" || /^← ?Library|Back to Library|^Library$/.test(t) || a.matches(".back")) return go("library");
      if (h === "/graph") return go("graphHome");
      if (h === "/learn") return go("course");
      if (a.matches(".destination-tab") && t === "Map") return go(screen === "climate" ? "climate" : "graphHome");
      if (/Overview/.test(t) && PAGES[screen].graph) return go("graphHome");
      if (/Open in Graph/.test(t)) return go("graphHome");
      return;
    }
    if (b && b.matches(".theme-toggle")) { const el = document.documentElement; const dark = el.dataset.theme ? el.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; el.dataset.theme = dark ? "light" : "dark"; G3.recolor(); return; }
    if (b && b.closest(".cp-comp .prompts")) return deliver(b.textContent, "panel");
    if (b && b.matches(".cp-comp .send")) { e.preventDefault(); const ta = $(".cp-comp textarea", root); if (ta) { const v = ta.value; ta.value = ""; deliver(v, "panel"); } return; }
    if (b && b.matches("[data-act]")) return act(b);
    if (screen === "library") { const card = e.target.closest(".mcard"); if (card && /Climate and Architecture/.test(card.textContent)) return go("pdf"); }
    if (screen === "graphHome") { const t = e.target.closest("text, g"); if (t && /Culture & Context|Climate/.test(t.textContent)) return go("climate"); }
  });
  root.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && e.target.matches(".cp-comp textarea")) { e.preventDefault(); const v = e.target.value; e.target.value = ""; deliver(v, "panel"); }
  });
  root.addEventListener("submit", (e) => e.preventDefault(), true);

  /* ================================================================ toasts (the app's .vtoast) */
  function toast(title, body, undo = true) {
    $$(".vtoasts.dk-t").forEach((t) => t.remove());
    const h = document.createElement("div");
    h.className = "vtoasts start dk-t"; h.setAttribute("role", "status");
    h.style.bottom = "96px"; h.style.left = "calc(var(--t-rail) + 16px)";
    h.innerHTML = `<div class="vtoast"><b>${title}</b><button aria-label="Dismiss" type="button">×</button><p>${body}</p>${undo ? '<span class="vtoast-actions"><button class="vtoast-action" type="button">Undo</button></span>' : ""}</div>`;
    h.addEventListener("click", (e) => { if (e.target.closest("button")) h.remove(); });
    document.body.appendChild(h); setTimeout(() => h.remove(), 8000);
  }

  /* ================================================================ the quick Lumen pop-up (the Graph player's own panel) */
  const tpl = document.createElement("template");
  tpl.innerHTML = DATA.screens.player; const GP = $(".gp-panel", tpl.content).outerHTML; delete DATA.screens.player;
  const QL = {
    on: false, min: false, el: null, deck: null,
    open(deck) {
      this.close(true);
      const w = document.createElement("div"); w.className = "ql"; w.innerHTML = `<div class="gp-wrap" data-mode="panel">${GP}</div>`; document.body.appendChild(w);
      openSheet(false);
      this.el = w; this.on = true; this.min = false; this.deck = deck;
      $(".gp-kicker", w).innerHTML = `<span>Quick Lumen</span><b class="gp-kicker-subject"> · ${esc(deck.source)}</b><span class="ql-live"><span class="xp-dot" aria-hidden="true"></span>Live</span>`;
      $("#gp-title", w).textContent = deck.title;
      $(".gp-full", w).textContent = "Save as Lumen";
      $(".gp-full", w).setAttribute("href", "#save");
      $$(".xp-scrub-tick, .xp-askbtn", w).forEach((x) => x.remove());
      const meta = $(".gp-meta .xp-meta-line span", w); if (meta) meta.textContent = `Made from ${deck.source} · narrated live · cut in from the dock`;
      $(".xp-tm", w).textContent = "Live";
      $(".xp-screen-stage", w).dataset.captions = "on";
      w.insertAdjacentHTML("beforeend", "");
      w.addEventListener("click", (e) => {
        const b = e.target.closest("button, a"); if (!b) return;
        e.preventDefault();
        const l = b.getAttribute("aria-label") || "";
        if (/Close/.test(l)) return deliver("Close the Lumen");
        if (/Minimise/.test(l)) return this.minimise();
        if (b.matches(".gp-full")) return deliver("Save it as a Lumen");
        if (b.matches(".xp-ib-play")) return deliver(speaking ? "Stop" : "Carry on");
        if (b.matches(".ql-pick")) return;
      });
      w.addEventListener("click", (e) => { const c = e.target.closest(".ql-choice"); if (c) deliver(c.querySelector("h3").textContent); });
      D.np.dataset.on = "false";
      $(".dk-np-t", dk).textContent = `Quick Lumen · ${deck.title}`;
      this.fit(); requestAnimationFrame(() => this.fit());
    },
    fit() { if (!this.el) return; const box = $(".xp-box", this.el), st = $(".xp-stage", this.el); if (box && st) st.style.transform = `scale(${box.clientWidth / 1280})`; },
    slide(html, tag) {
      if (!this.el) return;
      const host = $(".xp-slide-host", this.el); host.innerHTML = html;
      $$(".ql-tag, .ql-src", this.el).forEach((t) => t.remove());
      const st = $(".xp-stage", this.el);
      if (tag) st.insertAdjacentHTML("beforeend", `<span class="ql-tag">${tag}</span>`);
      if (this.deck.cite) st.insertAdjacentHTML("beforeend", `<span class="ql-src">From <b>${this.deck.cite}</b></span>`);
      this.pointer(null);
    },
    light(a) {
      if (!this.el) return;
      $$(".xp-slide-host [data-lit]", this.el).forEach((x) => x.removeAttribute("data-lit"));
      const el = $(`.xp-slide-host [data-anchor="${a}"]`, this.el); if (!el) return;
      el.dataset.lit = "true"; this.pointer(el);
    },
    pointer(el) {
      const p = this.el && $(".xp-pointer", this.el); if (!p) return;
      if (!el) { p.dataset.visible = "false"; return; }
      const s = $(".xp-stage", this.el).getBoundingClientRect(), r = el.getBoundingClientRect(), k = $(".xp-box", this.el).clientWidth / 1280;
      if (!k) return;
      p.style.transform = `translate(${(r.left - s.left) / k - 30}px, ${(r.top - s.top) / k + r.height / k / 2}px)`; p.dataset.visible = "true";
    },
    caption(words, k) {
      const c = this.el && $(".xp-caption", this.el); if (!c) return;
      if (!words) { c.dataset.visible = "false"; return; }
      const from = Math.max(0, k - 9), to = Math.min(words.length, from + 18);
      c.innerHTML = words.slice(from, to).map((w, i) => (from + i <= k ? `<span>${i ? " " : ""}<b>${esc(w)}</b></span>` : `<span> ${esc(w)}</span>`)).join("");
      c.dataset.visible = "true";
    },
    progress(i, n) {
      if (!this.el) return;
      const f = $(".xp-scrub-fill", this.el), kn = $(".xp-scrub-knob", this.el), tm = $(".xp-tm", this.el);
      const p = Math.min(1, i / n) * 100; if (f) f.style.width = p + "%"; if (kn) kn.style.left = p + "%"; if (tm) tm.textContent = `Slide ${Math.min(i + 1, n)} of ${n}`;
    },
    playing(on) { const b = this.el && $(".xp-ib-play", this.el); if (b) { $("svg", b).innerHTML = on ? ICON.pause : ICON.play; b.setAttribute("aria-label", on ? "Pause" : "Play"); } },
    minimise() { if (!this.el) return; this.el.hidden = true; this.min = true; D.np.dataset.on = "true"; },
    restore() { if (!this.el) return; this.el.hidden = false; this.min = false; D.np.dataset.on = "false"; this.fit(); },
    close(silent) { this.el?.remove(); this.el = null; this.on = false; this.min = false; D.np.dataset.on = "false"; },
  };

  /* ---------- decks: the app's own slide markup (contract types intro / ul / ol / cards / table) */
  const sl = {
    title: (t, q, subject, meta) => `<section class="xp-slide xp-tc" data-type="intro"><div class="xp-tc-brand"><span aria-hidden="true" class="xp-mark xp-tc-mark">S</span><span class="xp-tc-kicker">Studiolo Lumen</span></div><div class="xp-tc-block"><div class="xp-tc-text" data-anchor="t1"><h1 class="xp-title xp-tc-title">${t}</h1><p class="xp-tc-question">${q}</p></div><p class="xp-tc-meta"><span class="xp-tc-subject">${subject}</span><span class="xp-tc-length">${meta}</span></p></div></section>`,
    list: (id, t, items, ol) => `<section class="xp-slide" data-anchor="${id}" data-type="${ol ? "ol" : "ul"}"><h2 class="xp-title">${t}</h2><${ol ? "ol" : "ul"} class="xp-list">${items.map((x, i) => `<li data-anchor="${id}.${i + 1}" class="xp-hl">${x}</li>`).join("")}</${ol ? "ol" : "ul"}></section>`,
    cards: (id, t, cs, choice) => `<section class="xp-slide" data-anchor="${id}" data-type="cards"><h2 class="xp-title">${t}</h2><div class="xp-cards" data-count="${cs.length}" style="--xp-cols: ${cs.length};">${cs.map(([h, p], i) => `<div class="xp-card xp-hl${choice ? " ql-choice" : ""}" data-anchor="${id}.${i + 1}"><h3>${h}</h3><p>${p}</p></div>`).join("")}</div></section>`,
    table: (id, t, head, rows) => `<section class="xp-slide" data-anchor="${id}" data-type="table"><h2 class="xp-title">${t}</h2><table class="xp-table"><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r, i) => `<tr data-anchor="${id}.${i + 1}" class="xp-hl">${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></section>`,
  };
  const DECKS = {
    page2: {
      source: "your lecture notes, p. 2", cite: "Climate and Architecture, p. 2", title: "Why mass alone fails in humid climates", topic: "Climate-responsive design",
      intro: [sl.title("Mass, air and humidity", "Why do heavy walls stop working in humid places?", "Climate-responsive design", "Quick Lumen · from p. 2"), "This is page two of your lecture notes, in about a minute. The question it answers: why do heavy walls stop working in humid places?"],
      beats: [
        { html: sl.cards("b1", "It depends on the night", [["Hot and dry", "35° by day, 18° at night: walls soak up the heat and give it back after dark"], ["Hot and humid", "32° by day, 27° at night: the night never cools the wall"], ["So", "In humid places the stored heat has nowhere to go"]]),
          notes: "Thick walls work by soaking up the day's heat and losing it at night. That needs a cold night. In a dry climate the night drops to eighteen degrees, so it works. In a humid one it only drops to twenty-seven, so the wall stays warm, and the heat has nowhere to go.", lit: [["thick", "b1.1"], ["humid", "b1.2"], ["nowhere", "b1.3"]],
          rework: { tag: "Rewritten · as a bath", html: sl.cards("b1r", "Think of a bath, not a wall", [["Dry night", "Pull the plug: the heat drains out by morning"], ["Humid night", "The plug stays in: tomorrow starts warm"], ["Day two", "The water is already hot before you begin"]]),
            notes: "Think of the wall as a bath of heat. On a dry night you pull the plug and it drains by morning. On a humid night the plug stays in. So day two starts with the bath already hot.", lit: [["dry", "b1r.1"], ["humid", "b1r.2"], ["two", "b1r.3"]] } },
        { html: sl.table("b2", "What works where", ["", "Hot and dry", "Hot and humid"], [["Night drop", "Large: about 17°", "Small: about 5°"], ["What cools you", "Thermal mass", "Moving air"], ["What it looks like", "Thick walls, small windows, courtyards", "Light walls, deep shade, cross-breezes"]]),
          notes: "So the page sets the two side by side. Dry climates: a big night drop, so mass does the cooling: thick walls, small windows, courtyards. Humid climates: a small drop, so moving air does it: light walls, deep shade, and breezes straight through.", lit: [["dry", "b2.1"], ["mass", "b2.2"], ["humid", "b2.3"]] },
        { html: sl.list("b3", "What to check on site", ["How far the temperature falls at night", "Where the breeze comes from, and when", "Shade first, then mass"], true),
          notes: "Which gives you three things to check on site. How far the temperature falls at night. Where the breeze comes from. And shade before mass, always.", lit: [["falls", "b3.1"], ["breeze", "b3.2"], ["shade", "b3.3"]] },
      ],
      quiz: { q: "In a hot, humid climate, what does most of the cooling?", options: [["Moving air", "Cross-breezes through light, shaded rooms"], ["Thick walls", "Mass that stores the day's heat"], ["Small windows", "Keeping the sun out"]], right: 0,
        yes: "Right: moving air. The walls can't shed their heat at night.", no: "Not quite: it's moving air. Thick walls can't shed their heat on a warm night." },
    },
    course: {
      source: "Origin of Species, part 2", cite: "On the Origin of Species, pp. 61–63", title: "The struggle for existence, as a budget", topic: "Natural selection",
      intro: [sl.title("The struggle, as a budget", "Why does a small advantage decide who survives?", "Natural selection", "Quick Lumen · another way"), "Here's part two again, told as a household budget instead of as arithmetic."],
      beats: [
        { html: sl.cards("c1", "Income and spending", [["Income", "Food grows slowly, year by year"], ["Spending", "Every species breeds far faster than that"], ["Overdraft", "Most young die before they breed"]]),
          notes: "Think of nature as a household budget. Income is the food supply, and it grows slowly. Spending is breeding, and every species spends far more than it earns. So there's always an overdraft: most young die before they breed.", lit: [["income", "c1.1"], ["spending", "c1.2"], ["overdraft", "c1.3"]] },
        { html: sl.list("c2", "Who gets paid", ["When there isn't enough, small differences decide", "A slightly better beak, root or colour gets fed first", "Over many years, those differences add up"]),
          notes: "When there isn't enough to go round, small differences decide who gets paid. A slightly better beak or root gets fed first. And over thousands of generations those small wins add up. That's what Darwin means by natural selection.", lit: [["small", "c2.1"], ["beak", "c2.2"], ["generations", "c2.3"]] },
      ],
      quiz: { q: "Why does Darwin call it a struggle 'in a large and metaphorical sense'?", options: [["It's about any check on survival", "Drought counts as much as a fight"], ["Animals fight a lot", "Combat between rivals"], ["Food runs out every year", "Famine is constant"]], right: 0,
        yes: "Yes: a plant against drought counts as much as a fight.", no: "It's wider than fighting: any check on survival counts, like a plant against drought." },
    },
  };
  DECKS.topic = { ...DECKS.page2, source: "Climate-responsive design", cite: "your lecture notes, p. 2", title: "Climate-responsive design, in one minute",
    intro: [sl.title("Climate-responsive design", "What should a building do with the climate it's in?", "Climate-responsive design", "Quick Lumen · from your map"), "Here's this topic in a minute, built from the three things you've saved on it."] };

  async function runLumen(deck) {
    QL.open(deck);
    const run = S.run;
    QL.slide(deck.intro[0]); QL.playing(true);
    const INT = ["Stop", "Explain that another way", "Test me", "Skip", "Close the Lumen"];
    chips(INT, "interrupt");
    let r = await narr(deck.intro[1], { stage: QL, spoken: S.audio });
    let i = 0;
    const beats = deck.beats.map((b) => ({ ...b }));
    while (i <= beats.length) {
      if (run !== S.run) throw STOP;
      if (r && r.heard) {
        const t = r.heard.toLowerCase(); r = null;
        if (/close|that's all|stop the lumen/.test(t)) { QL.close(); await reply("Closed. It's not saved, so ask again any time."); return; }
        if (/^stop|wait|hold on|pause/.test(t)) {
          QL.playing(false); await narr("Sure, I'll wait.", { spoken: S.audio });
          const back = await listen(["Carry on", "Save it as a Lumen", "Close the Lumen"]);
          if (/close/i.test(back)) { QL.close(); await reply("Closed."); return; }
          if (/save/i.test(back)) { await saveLumen(deck); }
          QL.playing(true); chips(INT, "interrupt"); continue;
        }
        if (/another way|don't get|differently|analogy/.test(t) && beats[Math.max(0, i - 1)]?.rework && !beats[Math.max(0, i - 1)]._rev) {
          const b = beats[Math.max(0, i - 1)]; b._rev = true; i = Math.max(0, i - 1);
          setState("thinking");
          await narr("Let me try it another way.", { spoken: S.audio });
          await wait(700);
          b.html = b.rework.html; b.tag = b.rework.tag; b.notes = b.rework.notes; b.lit = b.rework.lit;
        } else if (/another way|differently/.test(t)) {
          await narr("The short version: it all depends on how far the night cools down.", { spoken: S.audio }); chips(INT, "interrupt");
        } else if (/test|quiz/.test(t)) { await quiz(deck.quiz); chips(INT, "interrupt"); continue; }
        else if (/skip|next/.test(t)) { i = Math.min(i, beats.length); }
        else if (/save/.test(t)) { await saveLumen(deck); chips(INT, "interrupt"); continue; }
        else { await narr("Good question. I'll fold that into the next slide.", { spoken: S.audio }); }
      }
      if (i === beats.length) break;
      const b = beats[i];
      QL.slide(b.html, b.tag); QL.progress(i, beats.length);
      r = await narr(b.notes, { stage: QL, lit: b.lit, spoken: S.audio });
      if (!r.heard) i++;
    }
    QL.progress(beats.length, beats.length); QL.playing(false);
    await narr("That's it. Want to keep this as a Lumen, or test yourself?", { spoken: S.audio });
    const a = await listen(["Save it as a Lumen", "Test me", "Close the Lumen"]);
    if (/test/i.test(a)) { await quiz(deck.quiz); }
    if (/save/i.test(a)) await saveLumen(deck);
    if (/close/i.test(a)) { QL.close(); await reply("Closed."); return; }
    const z = await listen(["Save it as a Lumen", "Close the Lumen"]);
    if (/save/i.test(z)) await saveLumen(deck);
    QL.close();
  }
  async function saveLumen(deck) {
    toast("Saved as a Lumen.", `“${deck.title}” is in Learn and on ${deck.topic}.`);
    post(aiMsg(`Saved <b>${esc(deck.title)}</b> as a Lumen, in Learn and on <b>${esc(deck.topic)}</b>. It's voiced only if you play it later.`), { mirror: true });
  }
  async function quiz(qz) {
    QL.slide(sl.cards("q1", qz.q, qz.options, true), "Check");
    const run = S.run;
    await narr(qz.q + " Tap one, or tell me.", { stage: QL, spoken: S.audio });
    const ans = await new Promise((res, rej) => { chips(qz.options.map((o) => o[0])); setState("listening"); pending = (t) => (run === S.run ? res(t) : rej(STOP)); });
    const idx = qz.options.findIndex((o) => o[0].toLowerCase() === ans.toLowerCase());
    const ok = idx === qz.right;
    $$(".ql-choice", QL.el).forEach((c, j) => { if (j === qz.right) c.dataset.picked = "right"; else if (j === idx) c.dataset.picked = "wrong"; });
    await narr(ok ? qz.yes : qz.no, { stage: QL, spoken: S.audio });
    post(aiMsg(`Check: ${ok ? "right" : "missed, back in 3 days"}. <i>${esc(qz.q)}</i>`));
  }

  /* ================================================================ page touches */
  function pdfPage() {
    const pg = $(".pdf-page", root); if (!pg) return;
    const view = $(".pdf-view", root); if (view) view.dataset.state = "open";
    $$(".pdf-opening", root).forEach((x) => x.remove());
    pg.classList.add("ql-page"); pg.style.position = "relative";
    pg.innerHTML = `<p class="k">Lecture 3 · Climate and form</p><h2>2. Mass, air and humidity</h2>
      <p>Heavy walls cool a building by storing the day's heat and releasing it at night. <mark>This only works where the night is cool enough to take the heat away.</mark></p>
      <div class="fig"><span><b>35° / 18°</b>Hot-dry: day / night</span><span><b>32° / 27°</b>Hot-humid: day / night</span><span><b>17° vs 5°</b>Night drop</span></div>
      <p>In hot-dry regions the large night drop lets thermal mass work: thick walls, small openings and shaded courtyards keep rooms cool through the day.</p>
      <p>In hot-humid regions the night barely cools. Mass then stores heat it cannot lose, and rooms stay warm. <b>Moving air, not mass, does the cooling</b>: light, raised floors, deep eaves and openings on both sides to catch the breeze.</p>
      <h3>On site, check:</h3><p>the night-time low, the direction of the prevailing breeze, and shade before mass.</p>
      <div class="fn"><span>Climate and Architecture · Studio course</span><span>2</span></div>`;
    pg.style.height = pg.style.height || "";
    const list = $('ul[aria-label="Notes on page 2"]', root);
    G.notes.forEach((n) => list?.insertAdjacentHTML("afterbegin", noteRow(n)));
    const sec = list?.previousElementSibling?.querySelector("span"); if (sec && G.notes.length) sec.textContent = String(1 + G.notes.length);
  }
  const noteRow = (n) => `<li class="dk-touched"><button aria-label="Go to page 2" class="ts" type="button">p. 2</button><p class="tx">${esc(n)}</p><span class="mt">Your note · from the dock</span></li>`;

  function climateMap() {
    const node = $(`[data-topic-id="${IDS.crd}"]`, root); if (!node) return;
    const c = $("circle.nd", node), cx = +c.getAttribute("cx"), cy = +c.getAttribute("cy");
    const big = $$("svg circle.nd", root).sort((a, b) => +b.getAttribute("r") - +a.getAttribute("r"))[0];
    const ax = +big.getAttribute("cx"), ay = +big.getAttribute("cy");
    const ang = Math.atan2(cy - ay, cx - ax);
    const names = ["Thermal mass", "Night ventilation", "Wind catchers"];
    const lineHost = $("line.lk", root)?.parentElement, nodeHost = $(".node-g", root)?.parentElement;
    if (!lineHost || !nodeHost || G.climate === "none") return;
    const kept = G.climate === "kept";
    names.forEach((n, i) => {
      const a = ang + (i - 1) * 0.62, x = cx + Math.cos(a) * 92, y = cy + Math.sin(a) * 92;
      lineHost.insertAdjacentHTML("beforeend", `<line class="lk${kept ? "" : " ghostl"} dk-g" pointer-events="none" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" style="opacity:1"></line>`);
      const ly = y + (Math.sin(a) < -0.2 ? -12 : 18);
      nodeHost.insertAdjacentHTML("beforeend", `<g class="node-g dk-g" style="opacity:1"><g aria-label="${kept ? "" : "Suggested topic: "}${n}" class="graph-node${kept ? "" : " graph-ghost"}" data-kind="${kept ? "child" : "ghost"}" role="button" tabindex="0"><circle class="nd-hit" cx="${x}" cy="${y}" r="11"></circle><circle class="halo" cx="${x}" cy="${y}" r="15"></circle><g class="vis"><circle class="nd ${kept ? "s0" : "gh"}" cx="${x}" cy="${y}" r="6"></circle></g><text class="kl${kept ? "" : " ghl"}" opacity="1" text-anchor="middle" x="${x}" y="${ly}">${n}</text></g></g>`);
    });
    const chip = $$(".cp-meta .chip-btn, .cp-meta .chip", root).find((x) => /sub-topics/.test(x.textContent));
    if (chip && kept) chip.textContent = "3 sub-topics";
    if (chip && !kept) chip.insertAdjacentHTML("afterend", '<span class="chip" style="color:var(--ghost-ink);background:var(--ghost-soft)">3 waiting</span>');
  }
  const proposalCard = (state) => state === "kept"
    ? '<div class="cp-card-holder"><div class="cp-card"><h4>Added 3 topics to Climate-responsive design</h4></div></div>'
    : `<div class="cp-card-holder"><fieldset class="cp-card"><legend class="cp-card-title">3 sub-topics for Climate-responsive design<span class="tag ag">Adds</span></legend><ul class="gl">${["Thermal mass", "Night ventilation", "Wind catchers"].map((n) => `<li><label><input type="checkbox" checked><span aria-hidden="true" class="gd"></span><span class="gname">${n}</span></label></li>`).join("")}</ul><div class="acts"><button class="button" type="button" data-act="keep-ghosts">Keep all</button><button class="button button-quiet" type="button" data-act="dismiss-ghosts">Dismiss all</button></div><p class="note">They wait on the map as dashed topics until you choose.</p></fieldset></div>`;

  /* ================================================================ what the dock can do, page by page */
  function route(text) {
    const t = text.toLowerCase();
    const go2 = (name, line) => begin(async () => { await think(400); go(name, { quiet: true }); await reply(line); });
    // Anywhere
    if (/^(that's all|stop talking|hang up)/.test(t)) return begin(async () => { if (S.voice) await toggleVoice(); post(aiMsg("Line closed. I'm still here: type, or tap the mic.")); });
    if (/3d|three.?d/.test(t) && screen !== "g3") return go2("g3", "Here's your whole map in 3D. Drag to turn it; I can fly you anywhere.");
    if (/(go to|open|take me to) (my )?today/.test(t)) return go2("today", "Today.");
    if (/(go to|open) (my )?library/.test(t)) return go2("library", "Your Library.");
    if (/(go to|open) (the |my )?(graph|map)$/.test(t)) return go2("graphHome", "Your whole map.");
    if (/what have we (done|covered)|recap/.test(t)) return begin(() => recap());
    // Today
    if (/pick up|lecture notes|climate lecture|open my climate/.test(t)) return begin(async () => {
      await think(500); go("pdf", { quiet: true });
      await reply("Here's <b>Climate and Architecture</b>, where you stopped: page 2. Want me to explain it?");
    });
    if (/learn today|learn next/.test(t)) return begin(async () => {
      await think(800);
      await reply("Three ideas for today, from your map and My Focus:", { steps: "Looked at 3 things", plain: "Three ideas for today. Finish page two of your climate lecture notes. Add sub-topics to Climate-responsive design, which is empty. Or finish part two of the Origin of Species.", card: `<fieldset class="cp-card cp-change"><legend class="cp-card-title">For today<span class="tag ag">Suggests</span></legend><ul class="cp-change-list">${[["Finish page 2 of <b>Climate and Architecture</b>", "You stopped there yesterday.", "go-pdf"], ["Build out <b>Climate-responsive design</b>", "It's in My Focus with no sub-topics yet.", "go-climate"], ["Finish <b>Origin of Species, part 2</b>", "About 3 minutes left.", "go-course"]].map(([w, y, a], i) => `<li><div class="row"><span></span><span class="num">${i + 1}</span><span class="what">${w}<span class="why">${y}</span> <button class="button button-link" type="button" data-act="${a}" style="font-size:12px;padding:0">Open</button></span></div></li>`).join("")}</ul></fieldset>` });
    });
    // Library
    if (/sort|sultan hassan/.test(t)) return begin(sortLibrary);
    if (/courtyard/.test(t) && screen === "library") return begin(async () => {
      await think(700);
      const hits = $$(".mcard", root).filter((c) => /court/i.test(c.textContent)); hits.forEach((c) => c.classList.add("dk-touched"));
      hits[0]?.scrollIntoView({ block: "center", behavior: "smooth" });
      await reply(`${hits.length} things mention courtyards. I've outlined them. The essay <b>What I took from Sultan Hassan</b> says the most.`, { steps: "Searched your Library" });
    });
    // PDF
    if (/explain (this|the) page|explain it|explain page/.test(t)) return begin(async () => { if (screen !== "pdf") go("pdf", { quiet: true }); await think(600); post(aiMsg("Making a quick Lumen from page 2. It isn't saved unless you keep it.", "Read page 2")); await runLumen(DECKS.page2); });
    if (/note/.test(t)) return begin(async () => {
      await think(600);
      const n = screen === "course" ? "A small advantage wins because there's never enough to go round (pp. 61–63)." : "Humid nights don't cool the walls, so moving air, not mass, does the cooling.";
      if (screen === "pdf") { G.notes.push(n); const list = $('ul[aria-label="Notes on page 2"]', root); list?.insertAdjacentHTML("afterbegin", noteRow(n)); const sec = list?.previousElementSibling?.querySelector("span"); if (sec) sec.textContent = String(1 + G.notes.length); }
      toast("Note saved.", screen === "pdf" ? "On page 2, and in your Library." : "In your Library, on Natural selection.");
      await reply(`Saved a note: <i>“${esc(n)}”</i>`);
    });
    if (/on (my|the) map|put this|what's missing|missing here|add sub-topics/.test(t)) return begin(proposeTopics);
    if (/^keep|keep all|keep them|yes,? keep/.test(t) && G.climate === "proposed") return begin(keepTopics);
    if (/dismiss/.test(t) && G.climate === "proposed") return begin(async () => { G.climate = "none"; refresh(); await reply("Dismissed. Nothing changed."); });
    if (/climate-responsive|take me to climate/.test(t) && screen !== "g3") return go2("climate", "Climate-responsive design, under Culture & Context. It has no sub-topics yet.");
    if (/explain (this|the) topic|topic live/.test(t)) return begin(async () => { await think(600); post(aiMsg("Making a quick Lumen on Climate-responsive design from what you've saved.", "Read 3 things")); await runLumen(DECKS.topic); });
    if (/back to my lecture/.test(t)) return go2("pdf", "Back to page 2.");
    // 3D
    if (screen === "g3" && /fly|climate|islamic|take me/.test(t)) return begin(async () => { const name = /islamic/.test(t) ? "Islamic architecture" : "Climate-responsive design"; await think(300); G3.flyTo(name); await reply(`Flying to <b>${name}</b>.`); });
    if (screen === "g3" && /focus/.test(t)) return begin(async () => { const f = ["Daylight & shading", "Plan types & ritual", "Vernacular & regional", "Climate-responsive design"]; G3.highlight(f); await reply("Your four My Focus topics are lit. Three are in Culture and History; Daylight & shading sits on its own in Environment & Services."); });
    if (screen === "g3" && /empty|thin|gap/.test(t)) return begin(async () => { const thin = G3.thin(); G3.highlight(thin); await reply(`These ${thin.length} areas have the fewest topics: ${thin.slice(0, 3).map(esc).join(", ")}. Want sub-topics for one of them?`); });
    // Course
    if (/another way|this part/.test(t) && screen === "course") return begin(async () => { await think(600); post(aiMsg("Making a quick Lumen: part 2 told another way.", "Read part 2")); await runLumen(DECKS.course); });
    if (/quiz/.test(t)) return begin(async () => {
      const qz = DECKS.course.quiz;
      await reply(qz.q, { card: `<fieldset class="cp-card"><legend class="cp-card-title">Part 2 · check</legend><div class="acts">${qz.options.map((o, i) => `<button class="button button-quiet" type="button" data-act="quiz-${i}">${o[0]}</button>`).join("")}</div></fieldset>` });
      chips(qz.options.map((o) => o[0]));
      const a = await listen();
      const ok = /any check/i.test(a);
      await reply(ok ? qz.yes : qz.no);
    });
    if (/^(yes|carry on|ok)/.test(t) && screen === "pdf") return route("explain this page");
    begin(async () => { await think(500); await reply(`In the real build I'd answer that with what's on this page (${esc(PAGES[screen].label)}) and your Library. In this prototype, try a suggestion.`); });
  }

  async function sortLibrary() {
    if (screen !== "library") { go("library", { quiet: true }); await wait(300); }
    await think(800);
    const ids = ["006", "004", "00a"].map((n) => `00000000-0000-4000-a000-000000000${n}`);
    ids.forEach((id) => $(`.mcard[data-item-id="${id}"]`, root)?.classList.add("dk-touched"));
    const steps = [["New collection <b>Sultan Hassan</b>", "Three entries are about one building."], ["Move <b>Sultan Hassan: plan, section and the four madrasas</b>, <b>The mausoleum at Sultan Hassan</b> and <b>What I took from Sultan Hassan</b> into it", "They're spread across Lectures, Notes and Essays."], ["Tag all three <b>Plan types &amp; ritual</b>", "The topic they explain on your map."]];
    const card = `<fieldset class="cp-card cp-change" data-plan="sort"><legend class="cp-card-title">Sort Sultan Hassan · 3 changes<span class="tag ask">ASKS FIRST</span></legend><p class="note cp-change-made">Nothing moves until you apply, and nothing is deleted.</p><ul class="cp-change-list">${steps.map(([w, y], i) => `<li><label data-n="${i + 1}"><input type="checkbox" checked><span class="num">${i + 1}</span><span class="what">${w}<span class="why">${y}</span></span></label></li>`).join("")}</ul><div class="acts"><button class="button" type="button" data-act="apply-sort">Apply 3 changes</button><button class="button button-quiet" type="button" data-act="decline-sort">Not now</button></div></fieldset>`;
    await reply("Three saves are about Sultan Hassan, spread across lectures, notes and essays. I'd collect and tag them. Shall I?", { steps: "Looked at 19 entries", card });
    const a = await listen(["Yes, apply", "Not now"]);
    if (/yes|apply/i.test(a)) return applySort(a);
    $$(".dk-touched", root).forEach((c) => c.classList.remove("dk-touched"));
    await reply("Left as they are.");
  }
  async function applySort() {
    G.sorted = true;
    const card = $$('.dk [data-plan="sort"]').at(-1);
    if (card) { card.classList.add("is-applied"); card.querySelector(".tag").outerHTML = `<span class="tag done">APPLIED ${new Date().toTimeString().slice(0, 5)}</span>`; card.querySelector(".acts").innerHTML = '<button class="button button-quiet" type="button">Undo all</button>'; $$("input", card).forEach((i) => (i.disabled = true)); }
    const h = $(".destination-header", root); if (h) h.innerHTML = h.innerHTML.replace("11 collections", "12 collections");
    $$(".dk-touched", root).forEach((c) => c.classList.remove("dk-touched"));
    toast("Sorted into Sultan Hassan.", "3 entries moved and tagged.");
    await reply("Done. They're in a new <b>Sultan Hassan</b> collection. Undo is on the card.");
  }

  /* From anywhere to the map: the dock files the exchange into the topic's copilot chat. */
  async function proposeTopics() {
    const fromPdf = screen === "pdf";
    await think(700);
    if (screen !== "climate") go("climate", { quiet: true });
    G.climate = "proposed";
    refresh(); // redraw with the dashed topics
    if (fromPdf) mark("Filed in the Climate-responsive design chat");
    await reply(`${fromPdf ? "Page 2 belongs under <b>Climate-responsive design</b>, which has no sub-topics yet. " : ""}I'd add three. They're dashed on the map until you keep them.`, { steps: "Looked at 2 things", card: proposalCard("proposed"), plain: `${fromPdf ? "Page two belongs under Climate-responsive design, which has no sub-topics yet. " : ""}I'd add three: thermal mass, night ventilation and wind catchers. They're dashed on the map. Keep them?` });
    post('<p class="dk-bridge">Also in the copilot panel, in the <b>Climate-responsive design</b> chat</p>', { mirror: false });
    chips(["Keep all three", "Dismiss them"]);
  }
  async function keepTopics() {
    G.climate = "kept";
    $$(".cp-card-holder fieldset.cp-card", root).forEach((f) => { if (/sub-topics for Climate/.test(f.textContent)) f.parentElement.outerHTML = proposalCard("kept"); });
    $$(".dk .cp-card-holder fieldset.cp-card").forEach((f) => { if (/sub-topics for Climate/.test(f.textContent)) f.parentElement.outerHTML = proposalCard("kept"); });
    G.mirror.climate = G.mirror.climate.map((h) => (h.includes("3 sub-topics for Climate") ? h.replace(proposalCard("proposed"), proposalCard("kept")) : h));
    refresh();
    G3.addTopics();
    toast("3 topics added.", "Climate-responsive design now has 3 sub-topics.");
    await reply("Kept. Climate-responsive design now has three sub-topics. Undo is on the note at the bottom left.");
  }
  function act(b) {
    const a = b.dataset.act;
    if (a === "keep-ghosts") return deliver("Keep all three");
    if (a === "dismiss-ghosts") return deliver("Dismiss them");
    if (a === "apply-sort") return deliver("Yes, apply");
    if (a === "decline-sort") return deliver("Not now");
    if (a === "go-pdf") return deliver("Pick up my lecture notes");
    if (a === "go-climate") return deliver("Take me to Climate-responsive design");
    if (a === "go-course") { go("course"); return; }
    if (a.startsWith("quiz-")) return deliver(DECKS.course.quiz.options[+a.slice(5)][0]);
  }
  async function recap() {
    const marks = $$(".dk-mark", D.thread).map((m) => m.textContent.replace("You opened ", "")).slice(-5);
    await reply(`So far: ${marks.length ? `we went through ${marks.map(esc).join(", ")}` : "we've stayed on this page"}${G.notes.length ? `; you saved ${G.notes.length} note${G.notes.length > 1 ? "s" : ""}` : ""}${G.climate === "kept" ? "; Climate-responsive design got three sub-topics" : ""}${G.sorted ? "; the Sultan Hassan saves were sorted" : ""}.`);
  }

  /* ================================================================ the 3D graph (proposed view; the app has 2D only) */
  const G3 = (() => {
    let cv, ctx, raf = 0, rot = { x: -0.25, y: 0 }, auto = true, zoom = 1, target = null, lit = new Set(), pts = [], drag = null;
    const topics = DATA.graph.topics.slice();
    function layout() {
      const roots = topics.filter((t) => !t.parentId), n = roots.length, byId = new Map(topics.map((t) => [t.id, t]));
      const pos = new Map();
      roots.forEach((t, i) => { const y = 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(1 - y * y), th = i * 2.399963; pos.set(t.id, [Math.cos(th) * r, y, Math.sin(th) * r]); });
      const depth = (t) => { let d = 0, p = t; while (p.parentId) { d++; p = byId.get(p.parentId); if (!p) break; } return d; };
      topics.filter((t) => t.parentId).sort((a, b) => depth(a) - depth(b)).forEach((t) => {
        const p = pos.get(t.parentId); if (!p) return;
        const sibs = topics.filter((s) => s.parentId === t.parentId), k = sibs.indexOf(t), d = depth(t);
        const spread = 0.22 / d, a = (k / sibs.length) * Math.PI * 2;
        const len = Math.hypot(...p), u = p.map((v) => v / len);
        const t1 = norm(cross(u, Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), t2 = cross(u, t1);
        const out = 1 + 0.16 / d;
        pos.set(t.id, [0, 1, 2].map((j) => u[j] * len * out + (t1[j] * Math.cos(a) + t2[j] * Math.sin(a)) * spread));
      });
      pts = topics.map((t) => ({ t, p: pos.get(t.id) || [0, 0, 0], d: depth(t) }));
    }
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
    let C = {};
    function recolor() { const cs = getComputedStyle(document.documentElement); C = { ink: cs.getPropertyValue("--ink").trim(), ink2: cs.getPropertyValue("--ink-2").trim(), ink3: cs.getPropertyValue("--ink-3").trim(), line: cs.getPropertyValue("--line").trim(), accent: cs.getPropertyValue("--accent").trim(), soft: cs.getPropertyValue("--accent-soft").trim(), ghost: cs.getPropertyValue("--ghost").trim(), panel: cs.getPropertyValue("--panel").trim() }; }
    function proj(p, w, h) {
      const cy = Math.cos(rot.y), sy = Math.sin(rot.y), cx = Math.cos(rot.x), sx = Math.sin(rot.x);
      let x = p[0] * cy + p[2] * sy, z = -p[0] * sy + p[2] * cy, y = p[1];
      const y2 = y * cx - z * sx, z2 = y * sx + z * cx;
      const s = Math.min(w, h) * 0.36 * zoom, f = 3.2 / (3.2 + z2);
      return [w / 2 + x * s * f, h / 2 - y2 * s * f, z2, f];
    }
    function frame() {
      if (!cv) return;
      const w = cv.clientWidth, h = cv.clientHeight, dpr = devicePixelRatio || 1;
      if (cv.width !== w * dpr) { cv.width = w * dpr; cv.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      if (target) { rot.y += (target.y - rot.y) * 0.06; rot.x += (target.x - rot.x) * 0.06; zoom += (target.z - zoom) * 0.06; if (Math.abs(target.y - rot.y) < 0.002) target = null; }
      else if (auto && !drag) rot.y += 0.0016;
      const P = new Map(pts.map((q) => [q.t.id, proj(q.p, w, h)]));
      ctx.lineWidth = 1;
      for (const q of pts) { if (!q.t.parentId) continue; const a = P.get(q.t.id), b = P.get(q.t.parentId); if (!b) continue; ctx.strokeStyle = q.t.ghost ? C.ghost : C.line; ctx.globalAlpha = 0.35 + 0.5 * (1 - (a[2] + 1.4) / 2.8); ctx.setLineDash(q.t.ghost ? [3, 3] : []); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
      ctx.setLineDash([]);
      for (const r of DATA.graph.relations) { const a = P.get(r.a), b = P.get(r.b); if (!a || !b) continue; ctx.strokeStyle = C.accent; ctx.globalAlpha = 0.25; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
      ctx.setLineDash([]);
      const order = pts.slice().sort((a, b) => P.get(b.t.id)[2] - P.get(a.t.id)[2]);
      for (const q of order) {
        const [x, y, z, f] = P.get(q.t.id), on = lit.has(q.t.name), area = !q.t.parentId;
        const r = (area ? 7 : q.d === 1 ? 4.2 : 3) * f, depthA = Math.max(0.25, Math.min(1, 0.55 + 0.6 * (1 - (z + 1.4) / 2.8)));
        ctx.globalAlpha = lit.size && !on ? depthA * 0.45 : depthA;
        if (on) { ctx.fillStyle = C.soft; ctx.beginPath(); ctx.arc(x, y, r + 7, 0, 7); ctx.fill(); }
        ctx.fillStyle = area ? C.ink : C.panel; ctx.strokeStyle = on ? C.accent : area ? C.ink : C.ink3; ctx.lineWidth = on ? 2 : 1.2;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke();
        if (area || on) {
          ctx.globalAlpha = lit.size && !on ? depthA * 0.4 : Math.min(1, depthA + 0.15);
          ctx.fillStyle = on ? C.accent : C.ink; ctx.font = `${area ? 400 : 500} ${area ? 15 * Math.min(1.15, f) : 13}px ${area ? "Newsreader, Georgia, serif" : "'Instrument Sans', system-ui, sans-serif"}`; ctx.textAlign = "center";
          ctx.fillText(q.t.name, x, y - r - 7);
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    function mount(host) {
      recolor(); if (!pts.length) layout();
      host.innerHTML = '<div class="g3"><canvas aria-label="Your map in 3D: drag to turn it"></canvas><div class="g3-note"><span class="tag">Proposed view</span><span>Drag to turn · scroll to zoom · not in the app yet</span></div></div>';
      cv = $("canvas", host); ctx = cv.getContext("2d");
      cv.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY }; target = null; cv.setPointerCapture(e.pointerId); });
      cv.addEventListener("pointermove", (e) => { if (!drag) return; rot.y += (e.clientX - drag.x) * 0.006; rot.x = Math.max(-1.3, Math.min(1.3, rot.x + (e.clientY - drag.y) * 0.006)); drag = { x: e.clientX, y: e.clientY }; });
      cv.addEventListener("pointerup", () => { drag = null; });
      cv.addEventListener("wheel", (e) => { e.preventDefault(); zoom = Math.max(0.6, Math.min(2.6, zoom * (e.deltaY > 0 ? 0.92 : 1.08))); }, { passive: false });
      cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    }
    function flyTo(name) {
      const q = pts.find((x) => x.t.name === name); if (!q) return;
      lit = new Set([name, ...topics.filter((t) => t.parentId === q.t.id).map((t) => t.name)]);
      const [x, y, z] = q.p; let ty = Math.atan2(x, -z);
      while (ty - rot.y > Math.PI) ty -= Math.PI * 2; while (rot.y - ty > Math.PI) ty += Math.PI * 2;
      target = { y: ty, x: -Math.atan2(y, Math.hypot(x, z)), z: 1.7 }; auto = false;
    }
    return {
      mount, flyTo, recolor,
      stop() { cancelAnimationFrame(raf); cv = null; },
      highlight(names) { lit = new Set(names); auto = true; target = { y: rot.y, x: -0.25, z: 1 }; },
      thin() { const roots = topics.filter((t) => !t.parentId); return roots.map((r) => [r.name, topics.filter((t) => t.parentId === r.id).length]).sort((a, b) => a[1] - b[1]).slice(0, 4).map((x) => x[0]); },
      addTopics() { if (topics.some((t) => t.name === "Thermal mass")) return; ["Thermal mass", "Night ventilation", "Wind catchers"].forEach((n, i) => topics.push({ id: "new-" + i, parentId: IDS.crd, name: n, status: "not_started" })); layout(); },
    };
  })();
  function mount3D() {
    const svg = $("main .graph-canvas, main svg.graph-svg", root) || $$("main svg", root).sort((a, b) => b.getBoundingClientRect().width * b.getBoundingClientRect().height - a.getBoundingClientRect().width * a.getBoundingClientRect().height)[0];
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const host = document.createElement("div");
    host.style.cssText = `position:relative;width:${Math.round(r.width)}px;height:${Math.round(Math.max(r.height, 420))}px;max-width:100%`;
    svg.replaceWith(host);
    $$(".gtop .legend, .graph-shortcut-hint, .gzoom-controls", root).forEach((x) => (x.style.visibility = "hidden"));
    G3.mount(host);
  }

  /* ================================================================ prototype bar */
  const bar = document.createElement("nav");
  bar.className = "td-proto dk-proto"; bar.setAttribute("aria-label", "Prototype");
  bar.innerHTML = '<b>Prototype</b><button type="button" id="dk-restart">Start again</button><button type="button" id="dk-how" aria-expanded="false">How to try it</button><span class="hint" hidden>Use the suggestions above the dock, or type. A good path: “Pick up my lecture notes” → “Explain this page” → “Put this on my map” → “Keep all three” → “Show me in 3D”. Move between pages with the sidebar: the dock and the conversation stay.</span>';
  document.body.appendChild(bar);
  $("#dk-restart", bar).addEventListener("click", () => location.reload());
  $("#dk-how", bar).addEventListener("click", (e) => { const h = $(".hint", bar); h.hidden = !h.hidden; e.currentTarget.setAttribute("aria-expanded", String(!h.hidden)); });

  go("today");
  begin(async () => {
    await sleep(500);
    post(aiMsg("Good afternoon. I'm down here on every page: ask, or tell me what to do. Tap the mic to talk instead."), { mirror: false });
    setState("idle");
  });
})();
