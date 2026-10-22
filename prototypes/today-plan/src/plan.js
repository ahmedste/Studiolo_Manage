/* Today, planning (prototype): Today grows into a learning-planning calendar that the copilot plans with you.
   - Day: Next up (the next planned session, with Continue folded in), My Focus with this week's hours per topic,
     a Big Picture written from records, and the rail's day timeline: past activity above the now line, the plan
     below it, your learning time tinted and busy times from your calendar hatched.
   - Week: a 7-day grid, Motion-style. Drag a session to move it; it snaps to the nearest free time.
   - Copilot: "Plan the rest of my week", a deadline ("presenting to a client on 6 November") that becomes a goal
     spanning two topics, "Make Saturday lighter", "Plan next week". Every answer is a plan card: its changes
     show as ghosts on the calendar until you apply them, and Apply has Undo.
   - Sessions are Lumens to watch, reading Lumens (a long HTML lesson), live sessions, spaced reviews, course
     parts and Library items. New Lumens are made the evening before, so planning spends nothing.
   The shell and Today's components are the app's own DOM and CSS, captured read-only from studiolo. When the page
   may use Claude (the `sample` capability) the copilot's plans and new reading Lumens are written by Claude;
   otherwise scripted answers play. Time is simulated: it is Wednesday 21 October 2026, 15:35. */
(() => {
  "use strict";
  const DATA = JSON.parse(document.getElementById("vx-data").textContent);
  const root = document.getElementById("vx-app");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clone = (x) => JSON.parse(JSON.stringify(x));
  DATA.htmlClass.split(/\s+/).filter(Boolean).forEach((c) => document.documentElement.classList.add(c));

  /* ================================================================ time */
  let H = 52; const H0 = 6 * 60, H1 = 23 * 60; // px per hour (52 on the day rail, 64 on the week); the calendar runs 6:00 to 23:00
  const DN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dateOf = (d) => new Date(2026, 9, 19 + d); // day 0 is Monday 19 October 2026
  const wd = (d) => ((d % 7) + 7) % 7;
  const dayLong = (d) => `${DN[wd(d)]} ${dateOf(d).getDate()} ${MON[dateOf(d).getMonth()]}`;
  const dayShort = (d) => `${DN[wd(d)].slice(0, 3)} ${dateOf(d).getDate()}`;
  const dayRel = (d) => (d === S.now.d ? "today" : d === S.now.d + 1 ? "tomorrow" : d - S.now.d < 7 && d > S.now.d && Math.floor(d / 7) === Math.floor(S.now.d / 7) ? DN[wd(d)] : dayShort(d));
  const hm = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  const h12 = (m) => { const h = Math.floor(m / 60); return `${String(((h + 11) % 12) + 1).padStart(2, "0")}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };
  const len = (m) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${String(m % 60).padStart(2, "0")}` : ""}`);
  const weekRange = (w) => { const a = dateOf(w * 7), b = dateOf(w * 7 + 6); return a.getMonth() === b.getMonth() ? `${a.getDate()}–${b.getDate()} ${MON[b.getMonth()]}` : `${a.getDate()} ${MON[a.getMonth()]} – ${b.getDate()} ${MON[b.getMonth()]}`; };
  const snap5 = (m) => Math.round(m / 5) * 5;
  /* Hour rows: on the week, working hours with nothing planned fold to a thin band, Motion-style. */
  let ROW = Array(17).fill(52), FOLDED = Array(17).fill(false);
  const FOLD = 22; // a run of folded hours shares one band this tall
  const Y = (m) => { m = Math.min(Math.max(m, H0), H1); const i = Math.floor((m - H0) / 60); let y = 0; for (let k = 0; k < Math.min(i, ROW.length); k++) y += ROW[k]; return i >= ROW.length ? y : y + ((m - H0 - i * 60) / 60) * ROW[i]; };
  const M = (y) => { let acc = 0; for (let k = 0; k < ROW.length; k++) { if (y < acc + ROW[k]) return H0 + k * 60 + ((y - acc) / ROW[k]) * 60; acc += ROW[k]; } return H1; };
  const TOT = () => ROW.reduce((a, b) => a + b, 0);
  const parseHM = (t) => { const m = /^(\d{1,2}):(\d{2})/.exec(String(t || "")); return m ? +m[1] * 60 + +m[2] : null; };

  /* ================================================================ the learner's world (sample data) */
  const TRACKS = [
    { id: "day", name: "Daylight & shading", area: "Environment & Services", subs: ["Glare", "Sun angles", "Light shelves", "Mashrabiya screens"], target: 120, tr: "a", state: "Learning" },
    { id: "plan", name: "Plan types & ritual", area: "History & Theory", subs: ["Four-iwan plan", "Hypostyle hall", "Qibla orientation"], target: 90, tr: "b", state: "Learning" },
    { id: "ver", name: "Vernacular & regional", area: "Culture & Context", subs: ["Courtyard houses", "Wind catchers", "Thermal mass"], target: 120, tr: "c", state: "Learning" },
  ];
  const GOAL = { id: "client", name: "Client presentation", note: "Courtyard house scheme", until: 18, draws: ["day", "ver"], target: 120, tr: "d", goal: true };
  const AVAIL = [[[420, 480], [1140, 1260]], [[420, 480], [1140, 1260]], [[420, 480], [1140, 1260]], [[420, 480], [1140, 1260]], [[420, 480], [1140, 1260]], [[540, 720]], [[1020, 1140]]];
  const KIND = {
    watch: { k: "Watch", noun: "Lumen", go: "Watch" },
    read: { k: "Read", noun: "Reading Lumen", go: "Start reading" },
    live: { k: "Live", noun: "Live session", go: "Go live" },
    review: { k: "Review", noun: "Review quiz", go: "Start the review" },
    course: { k: "Course", noun: "Course part", go: "Watch the part" },
    library: { k: "Library", noun: "From your Library", go: "Open in Library" },
    plan: { k: "Plan", noun: "Weekly plan", go: "Plan with the copilot" },
  };
  const MADE = { ready: "Ready · made last night", evening: "Made the evening before · nothing is spent until then", exists: "Already in your Library", course: "Made when you reach it, like every course part", none: "" };
  const B = (id, d, s, m, kind, title, tr, topic, st, x = {}) => ({ id, d, s, m, kind, title, tr, topic, st, made: "evening", why: "", also: null, ...x });
  const START_BLOCKS = [
    B("b1", 0, 1140, 30, "read", "Courtyard houses: how the court works", "ver", "Courtyard houses", "done", { made: "ready", res: "Read to the end" }),
    B("b2", 0, 1170, 10, "review", "Courtyard houses · 4 questions", "ver", "Courtyard houses", "done", { res: "3 of 4 right" }),
    B("b3", 1, 420, 25, "watch", "Glare: where it comes from", "day", "Glare", "moved", { why: "Missed. Moved to Thursday 07:00" }),
    B("b4", 1, 1140, 30, "course", "Daylighting · Part 1: The sky as a light source", "day", "Sun angles", "done", { made: "course", res: "Watched" }),
    B("b5", 2, 420, 25, "watch", "How the four-iwan plan organises a courtyard", "plan", "Four-iwan plan", "started", { made: "ready", res: "Paused at 2:41 of 4:38", prog: 0.58 }),
    B("b7", 2, 1140, 30, "read", "Thermal mass in hot-arid courtyard houses", "ver", "Thermal mass", "planned", { made: "ready", why: "Next in Vernacular & regional, after Monday's courtyard reading" }),
    B("b8", 2, 1170, 10, "review", "Courtyard houses · spaced review", "ver", "Courtyard houses", "planned", { made: "ready", why: "Two days after Monday's quiz, where you got 3 of 4" }),
    B("b6", 3, 420, 25, "watch", "Glare: where it comes from", "day", "Glare", "planned", { made: "ready", why: "Moved from Tuesday, when you missed it" }),
    B("b9", 3, 1140, 30, "course", "Daylighting · Part 2: Sun angles", "day", "Sun angles", "planned", { made: "course", why: "The next part of your Daylighting course" }),
    B("b10", 4, 420, 20, "watch", "Hypostyle halls: a forest of columns", "plan", "Hypostyle hall", "planned", { why: "Plan types & ritual, after the four-iwan plan" }),
    B("b11", 5, 570, 40, "library", "Architecture for the Poor · from p. 41", "ver", "Courtyard houses", "planned", { made: "exists", why: "You stopped at p. 41 on Wednesday" }),
    B("b12", 5, 615, 20, "live", "Talk it through: light shelves or mashrabiya?", "day", "Light shelves", "planned", { made: "none", why: "Compare the two before the shading part of the course" }),
    B("b13", 6, 1050, 15, "plan", "Plan next week with the copilot", null, null, "planned", { made: "none", why: "Ten minutes on Sunday: what happened, and what next week should hold" }),
    B("b14", 7, 1140, 30, "course", "Daylighting · Part 3: Shading devices", "day", "Sun angles", "planned", { made: "course", why: "The next part of your Daylighting course" }),
    B("b15", 8, 420, 25, "watch", "Glare, part 2: veiling reflections", "day", "Glare", "planned", { why: "Follows Glare: where it comes from" }),
    B("b16", 13, 1050, 15, "plan", "Plan next week with the copilot", null, null, "planned", { made: "none", why: "Your weekly plan" }),
  ];
  // Busy times read from the learner's calendar (titles are never read, only busy and free).
  const START_BUSY = [
    { d: 1, s: 1200, e: 1260 }, { d: 2, s: 1020, e: 1110 }, { d: 4, s: 1110, e: 1350 }, { d: 5, s: 720, e: 840 },
    { d: 8, s: 1140, e: 1230 }, { d: 10, s: 1110, e: 1290 },
  ];
  // What else happened (the old activity log, kept above the now line).
  const LOG = [
    { d: 0, at: 760, title: "Bait Ur Rouf Mosque, Marina Tabassum", sub: "Video · to 12:34" },
    { d: 1, at: 545, title: "Daylight & shading", sub: "Copilot · 3 messages" },
    { d: 2, at: 455, title: "Wind catchers and the courtyard", sub: "Lumen · 4 min, not planned" },
    { d: 2, at: 540, title: "Mihrab tolerances on site", sub: "Note saved" },
    { d: 2, at: 590, title: "Plan types & ritual", sub: "Copilot · 2 messages" },
    { d: 2, at: 780, title: "Architecture for the Poor", sub: "PDF · read to p. 41" },
  ];
  const LIBRARY = ["Architecture for the Poor, Hassan Fathy (PDF, read to p. 41)", "Bait Ur Rouf Mosque, Marina Tabassum (video, 12:34 of 48:10)", "Mihrab tolerances on site (your note)"];

  const S = {
    now: { d: 2, m: 935 }, view: "day", sel: 2, wk: 0, panel: false, readId: null,
    blocks: clone(START_BLOCKS), busy: clone(START_BUSY), tracks: clone(TRACKS), maxDay: 90, calOn: true, autoMove: true,
    notes: [{ d: 2, text: "<b>Glare</b> moved from Tuesday to Thursday 07:00, because you missed it on Tuesday." }],
    msgs: [], cards: [], card: null, seq: 0, ai: null, busyAI: false, meeting: false, skipped: false,
  };

  /* ================================================================ the plan's rules */
  const track = (id) => S.tracks.find((t) => t.id === id) || (S.card?.state === "pending" && S.card.goal?.id === id ? S.card.goal : null);
  const trOf = (id) => track(id)?.tr || "a";
  const live = (b) => ["planned", "started", "done"].includes(b.st);
  const isPast = (d, m) => d < S.now.d || (d === S.now.d && m < S.now.m);
  const blockById = (id, bl = S.blocks) => bl.find((b) => b.id === id);
  const overlaps = (s1, e1, s2, e2) => s1 < e2 && s2 < e1;
  const dayLoad = (d, bl, ignore = []) => bl.filter((b) => b.d === d && live(b) && !ignore.includes(b.id)).reduce((a, b) => a + b.m, 0);
  function free(d, s, m, bl, ignore = []) {
    if (s < H0 || s + m > H1) return false;
    if (bl.some((b) => b.d === d && live(b) && !ignore.includes(b.id) && overlaps(s, s + m, b.s, b.s + b.m))) return false;
    if (S.calOn && S.busy.some((z) => z.d === d && overlaps(s, s + m, z.s, z.e))) return false;
    return true;
  }
  const inAvail = (d, s, m) => AVAIL[wd(d)].some(([a, e]) => s >= a && s + m <= e);
  const fits = (d, s, m, bl, ignore = []) => !isPast(d, s) && inAvail(d, s, m) && free(d, s, m, bl, ignore) && dayLoad(d, bl, ignore) + m <= S.maxDay;
  /** Motion-style placement: the preferred slot if it's free, else the first free learning time from that day on,
      else the earliest one in range. Never in the past, never in busy time, never over the daily maximum. */
  function place(m, { d0, d1, prefD = null, prefS = null }, bl, ignore = []) {
    if (prefD != null && prefS != null && prefD >= d0 && prefD <= d1 && fits(prefD, prefS, m, bl, ignore)) return { d: prefD, s: prefS };
    const start = Math.max(d0, prefD ?? d0);
    const order = []; for (let d = start; d <= d1; d++) order.push(d); for (let d = d0; d < start; d++) order.push(d);
    for (const d of order) {
      const wins = AVAIL[wd(d)].slice().sort((a, b) => (prefS != null && d === prefD ? Math.abs(a[0] - prefS) - Math.abs(b[0] - prefS) : 0));
      for (const [a, e] of wins) for (let s = a; s + m <= e; s += 5) if (fits(d, s, m, bl, ignore)) return { d, s };
    }
    return null;
  }
  /** Where a dragged session lands: the exact time if free, else the nearest free time that day (any hour). */
  function nearest(d, s, m, ignore) {
    for (let off = 0; off <= 17 * 60; off += 5) for (const t of off ? [s + off, s - off] : [s]) if (!isPast(d, t) && free(d, t, m, S.blocks, ignore)) return t;
    return null;
  }
  const weekMins = (w, trId, bl = S.blocks) => bl.filter((b) => Math.floor(b.d / 7) === w && live(b) && (b.tr === trId || b.also === trId)).reduce((a, b) => a + b.m, 0);
  const weekDone = (w, trId) => S.blocks.filter((b) => Math.floor(b.d / 7) === w && b.st === "done" && (b.tr === trId || b.also === trId)).reduce((a, b) => a + b.m, 0);

  /* ================================================================ icons */
  const I = {
    spark: '<svg class="pl-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>',
    clock: '<svg class="pl-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    send: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    prev: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>',
    next: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>',
  };

  /* ================================================================ the shell */
  function shell() {
    root.innerHTML = DATA.screens.today;
    $$(".navigation-rail .navigation-link[href], .tab-bar .tab-bar-link[href]", root).forEach((a) => a.removeAttribute("aria-current"));
    $$('.navigation-rail .navigation-link[href="/today"], .tab-bar .tab-bar-link[href="/today"]', root).forEach((a) => a.setAttribute("aria-current", "page"));
  }
  const main = () => $("main", root);
  const head = (sub) => `<header class="td-head"><h1>Today <span>${esc(sub)}</span></h1><div class="pl-tools">
      <div class="pl-seg" role="group" aria-label="Show"><button type="button" data-view="day" aria-pressed="${S.view === "day"}">Day</button><button type="button" data-view="week" aria-pressed="${S.view === "week"}">Week</button></div>
      <button class="button button-quiet" type="button" data-lt>${I.clock}Learning time</button>
      <button class="button" type="button" data-copilot>${I.spark}Plan with the copilot</button>
      <time>${h12(S.now.m)}</time></div></header>`;

  function render() {
    hidePop();
    if (S.view === "read") return; // the reading view renders itself
    const keep = main()?.scrollTop || 0;
    H = S.view === "week" ? 68 : 52;
    if (S.view === "week") renderWeek(); else renderDay();
    if (main()) main().scrollTop = keep;
  }

  /* ---------------------------------------------------------------- blocks */
  function ghostOps() {
    const g = { add: [], from: new Set(), gone: new Set(), link: new Map(), to: new Map() };
    const c = S.card; if (!c || c.state !== "pending") return g;
    for (const o of c.ops) {
      if (!o.on) continue;
      if (o.type === "add") g.add.push(o.nb);
      if (o.type === "move") { g.from.add(o.id); g.to.set(o.id, o); }
      if (o.type === "drop") g.gone.add(o.id);
      if (o.type === "link") g.link.set(o.id, o.also);
    }
    return g;
  }
  function layout(days) {
    const g = ghostOps();
    ROW = []; FOLDED = [];
    for (let h = 6; h < 23; h++) {
      const a = h * 60, e = a + 60, hit = (d, s, m) => days.includes(d) && overlaps(s, s + m, a, e);
      const used = S.view !== "week" || AVAIL.some((ws) => ws.some(([x, y]) => overlaps(x, y, a, e)))
        || S.blocks.some((b) => b.st !== "dropped" && hit(b.d, b.s, b.m)) || g.add.some((b) => hit(b.d, b.s, b.m))
        || [...g.to.values()].some((o) => hit(o.d, o.s, blockById(o.id)?.m || 0)) || (days.includes(S.now.d) && S.now.m >= a && S.now.m < e);
      ROW.push(H); FOLDED.push(!used);
    }
    for (const [a, b] of runs()) for (let i = a; i < b; i++) ROW[i] = FOLD / (b - a);
  }
  function runs() { const out = []; FOLDED.forEach((f, i) => { if (!f) return; const last = out[out.length - 1]; if (last && last[1] === i) last[1] = i + 1; else out.push([i, i + 1]); }); return out; }
  function folds() { return runs().map(([a, b]) => [H0 + a * 60, H0 + b * 60]); }
  function blockEl(b, { ghost = false, from = false, gone = false, linked = null } = {}) {
    const also = linked || b.also;
    const top = Y(b.s), h = Math.max(16, Y(b.s + b.m) - top - 2);
    const cls = ["pl-b", `is-${b.st}`, ghost && "is-ghost", from && "is-from", gone && "is-gone", linked && "is-linked", also && "has-also", h < 28 ? "is-short" : h < 46 && "is-two", b.flash && "is-flash"].filter(Boolean).join(" ");
    const kind = KIND[b.kind].k;
    const tag = gone ? "Drop" : ghost ? (b.ghostOf ? "Move" : "New") : "";
    const label = `${hm(b.s)} · ${kind}${tag ? ` · ${tag}` : ""}`;
    const aria = `${KIND[b.kind].noun}: ${b.title}, ${dayLong(b.d)} ${hm(b.s)} to ${hm(b.s + b.m)}${b.st === "done" ? ", done" : b.st === "moved" ? ", moved" : ""}${ghost ? ", proposed" : ""}${gone ? ", proposed to drop" : ""}`;
    return `<button type="button" class="${cls}" data-b="${esc(b.id)}"${ghost ? ` data-ghost="1"` : ""} data-tr="${b.tr ? trOf(b.tr) : "a"}"${also ? ` data-tr2="${trOf(also)}"` : ""} style="top:${top}px;height:${h}px${b.kind === "plan" ? ";--tr:var(--ghost);--tr-soft:var(--ghost-soft)" : ""}" aria-label="${esc(aria)}"><span class="k">${esc(label)}</span><span class="t">${esc(b.title)}</span></button>`;
  }
  function dayLayer(d) {
    let h = "";
    if (S.view === "week") { for (let k = 7; k < 23; k++) if (!FOLDED[k - 6] || !FOLDED[k - 7]) h += `<span class="pl-hl" style="top:${Y(k * 60)}px"></span>`; for (const [a, e] of folds()) h += `<div class="pl-fold" style="top:${Y(a)}px;height:${Y(e) - Y(a)}px"></div>`; }
    for (const [a, e] of AVAIL[wd(d)]) h += `<div class="pl-av" style="top:${Y(a)}px;height:${Y(e) - Y(a)}px"></div>`;
    if (S.calOn) for (const z of S.busy.filter((z) => z.d === d)) h += `<div class="pl-busy${z.isNew ? " is-new" : ""}" style="top:${Y(z.s)}px;height:${Y(z.e) - Y(z.s)}px">${Y(z.e) - Y(z.s) > 16 ? `Busy · ${hm(z.s)}–${hm(z.e)}` : ""}</div>`;
    const pastTo = d < S.now.d ? H1 : d === S.now.d ? S.now.m : H0;
    if (pastTo > H0) h += `<div class="pl-past" style="height:${Y(pastTo)}px"></div>`;
    const g = ghostOps();
    for (const b of S.blocks.filter((x) => x.d === d && x.st !== "dropped")) h += blockEl(b, { from: g.from.has(b.id), gone: g.gone.has(b.id), linked: g.link.get(b.id) || null });
    for (const [id, o] of g.to) { const b = blockById(id); if (b && o.d === d) h += blockEl({ ...b, d: o.d, s: o.s, id: b.id, ghostOf: b.id }, { ghost: true }); }
    for (const nb of g.add.filter((x) => x.d === d)) h += blockEl(nb, { ghost: true });
    if (d === S.now.d) h += `<div class="pl-now" style="top:${Y(S.now.m)}px" aria-hidden="true"></div>`;
    return h;
  }

  /* ---------------------------------------------------------------- Day */
  function nextUp() {
    const d = S.now.d;
    const today = S.blocks.filter((b) => b.d === d && (b.st === "planned" || b.st === "started")).sort((a, b) => a.s - b.s);
    const upcoming = today.filter((b) => b.st === "planned" && b.s + b.m > S.now.m);
    const later = S.blocks.filter((b) => b.d > d && b.st === "planned").sort((a, b) => a.d - b.d || a.s - b.s);
    return { b: upcoming[0] || later[0] || null, then: upcoming[1] || null, started: S.blocks.find((b) => b.st === "started" && b.d <= d) || null };
  }
  function nextCard() {
    const { b, then, started } = nextUp();
    if (!b) return `<section class="td-next pl-next"><p class="td-k">Next</p><h2 class="td-n">Nothing planned yet</h2><p class="td-m">Ask the copilot to plan your week around your learning time.</p><div class="td-row"><button class="button" type="button" data-copilot>${I.spark}Plan with the copilot</button></div></section>`;
    const t = track(b.tr), K = KIND[b.kind];
    const when = b.d === S.now.d ? hm(b.s) : `${dayRel(b.d)[0].toUpperCase()}${dayRel(b.d).slice(1)} ${hm(b.s)}`;
    const note = S.notes.filter((n) => n.d <= S.now.d).slice(-1)[0];
    const after = [
      then ? `Then ${hm(then.s)}: <a href="#b-${then.id}" data-open="${then.id}">${esc(then.title)}</a> (${len(then.m)})` : "",
      started && started.id !== b.id ? `${started.d === S.now.d ? "Earlier today" : "Still open"}: <a href="#b-${started.id}" data-start="${started.id}">${esc(started.title)}</a>, ${esc(started.res || "started")} · <button class="pl-linkbtn" type="button" data-start="${started.id}">Continue</button>` : "",
    ].filter(Boolean);
    return `<section class="td-next pl-next${b.kind === "plan" ? " is-plan" : ""}" aria-labelledby="pl-next-t" data-tr="${t ? t.tr : "a"}">
      <p class="td-k"><span>Next · ${esc(when)}</span><span class="pl-kind"${b.kind === "plan" ? ' style="--tr:var(--ghost-ink);--tr-soft:var(--ghost-soft)"' : ""}>${esc(K.k)}</span>${t ? `<span>${esc(t.name)} › ${esc(b.topic)}</span>` : ""}</p>
      <h2 class="td-n" id="pl-next-t">${esc(b.title)}</h2>
      <p class="td-m">${len(b.m)} · ${esc(K.noun)}${MADE[b.made] ? ` · ${esc(MADE[b.made])}` : ""}${b.also ? ` · counts for ${esc(track(b.also)?.name || "")} too` : ""}</p>
      <div class="td-row"><button class="button" type="button" data-start="${b.id}">${esc(K.go)}</button><button class="button button-quiet" type="button" data-movenext="${b.id}">Move to the next free time</button><button class="button button-link" type="button" data-skip="${b.id}">Skip</button></div>
      ${after.length ? `<p class="td-after">${after.join("<br>")}</p>` : ""}
      ${note ? `<p class="pl-note"><span class="av" aria-hidden="true">S</span><span>${note.text}</span></p>` : ""}
    </section>`;
  }
  function focusList() {
    const w = Math.floor(S.now.d / 7);
    return `<ul class="pl-focus">${S.tracks.map((t) => {
      const plan = weekMins(w, t.id), done = weekDone(w, t.id), max = Math.max(plan, t.target, 1) * 1.1;
      const short = plan < t.target ? `<span class="short">${len(t.target - plan)} short</span>` : "";
      return `<li data-tr="${t.tr}"><span aria-hidden="true" class="td-star${t.goal ? " goal" : ""}">${t.goal ? "◆" : "★"}</span>
        <span class="nm">${t.goal ? `<span class="goal">${esc(t.name)}</span><small>${esc(t.note)} · ${esc(dayShort(t.until))} ${MON[dateOf(t.until).getMonth()].slice(0, 3)} · ${t.until - S.now.d} days</small>` : `${esc(t.name)}<small>${esc(t.state)}</small>`}</span>
        <span class="pl-hrs" title="${len(done)} done, ${len(plan)} planned, of ${len(t.target)} a week"><span class="pl-bar" aria-hidden="true"><i class="plnd" style="width:${(plan / max) * 100}%"></i><i style="width:${(done / max) * 100}%"></i><span class="tgt" style="left:${(t.target / max) * 100}%"></span></span><span>${len(plan)} of ${len(t.target)}</span>${short}</span></li>`;
    }).join("")}</ul>`;
  }
  function bigPicture() {
    const w = Math.floor(S.now.d / 7);
    const wk = S.blocks.filter((b) => Math.floor(b.d / 7) === w && b.kind !== "plan");
    const done = wk.filter((b) => b.st === "done"), planned = wk.filter((b) => live(b));
    const moved = wk.filter((b) => b.st === "moved" || b.st === "skipped").length;
    const short = S.tracks.filter((t) => !t.goal && weekMins(w, t.id) < t.target);
    const goal = S.tracks.find((t) => t.goal);
    const nxt = S.blocks.filter((b) => Math.floor(b.d / 7) === w + 1 && live(b) && b.kind !== "plan").length;
    return `<section class="td-compass" aria-labelledby="pl-bp"><div class="td-h"><h2 id="pl-bp">The Big Picture</h2><span>Week of ${weekRange(w)}</span></div>
      <div class="td-narrative"><p><span>This week you've done </span><em>${done.length} of ${planned.length} planned sessions</em><span> (${len(done.reduce((a, b) => a + b.m, 0))} of ${len(planned.reduce((a, b) => a + b.m, 0))}).</span>
      ${moved ? `<span> ${moved === 1 ? "One session was" : `${moved} sessions were`} moved to a later day rather than dropped.</span>` : ""}
      ${short.length ? `<span> </span><em>${esc(short[0].name)}</em><span> is ${len(short[0].target - weekMins(w, short[0].id))} short of its ${len(short[0].target)}.</span>` : "<span> Every topic in My Focus has its time this week.</span>"}
      ${goal ? `<span> </span><em>${esc(goal.name)}</em><span> is in ${goal.until - S.now.d} days.</span>` : ""}</p>
      <p class="td-sub">Next week: ${nxt ? `${nxt} session${nxt === 1 ? "" : "s"} planned so far` : "nothing planned yet"} · plan it on Sunday at 17:30, or ask the copilot any time.</p></div></section>`;
  }
  function renderDay() {
    const d = S.sel, w = Math.floor(S.now.d / 7);
    const dayB = S.blocks.filter((b) => b.d === d && live(b));
    const sum = d === S.now.d
      ? `<b>Today</b> · ${dayB.filter((b) => b.st === "done").length} done · ${dayB.filter((b) => b.st !== "done").length} to go · ${len(dayB.reduce((a, b) => a + b.m, 0))} planned`
      : `<b>${DN[wd(d)]}</b> · ${dayB.length ? `${dayB.length} session${dayB.length === 1 ? "" : "s"} · ${len(dayB.reduce((a, b) => a + b.m, 0))}` : "nothing planned"}${S.calOn && S.busy.some((z) => z.d === d) ? " · busy " + S.busy.filter((z) => z.d === d).map((z) => `${hm(z.s)}–${hm(z.e)}`).join(", ") : ""}`;
    layout([d]);
    const logs = LOG.filter((l) => l.d === d && (d < S.now.d || l.at < S.now.m)).map((l) => `<div class="pl-log" style="top:${Y(l.at)}px"><b>${esc(l.title)}</b>${esc(l.sub)}</div>`).join("");
    let hours = ""; for (let h = 6; h <= 22; h++) hours += `<span class="pl-hr" style="top:${Y(h * 60)}px">${h}:00</span><span class="pl-hl" style="top:${Y(h * 60)}px"></span>`;
    main().innerHTML = `<div class="td plan-pg"><div class="td-stream">${head(dayLong(S.now.d))}
      <div class="td-top">${nextCard()}<section aria-labelledby="pl-focus-h" class="td-focus-wrap"><div class="td-h is-plain"><h2 id="pl-focus-h">My Focus</h2><span>This week's time</span></div>${focusList()}</section></div>
      ${bigPicture()}</div>
      <aside aria-labelledby="pl-week-h" class="td-rail pl-rail"><div class="td-h is-plain"><h2 id="pl-week-h">This week</h2><button class="pl-linkbtn" type="button" data-view="week" style="font-size:12px">Open the week</button></div>
        <div aria-label="Days of this week" class="td-strip" role="group">${[0, 1, 2, 3, 4, 5, 6].map((i) => { const dd = w * 7 + i; const has = S.blocks.some((b) => b.d === dd && live(b)); return `<button type="button" data-sel="${dd}" aria-pressed="${dd === d}" class="${dd === d ? "is-on" : ""}" aria-label="${dayLong(dd)}${dd === S.now.d ? ", today" : ""}">${DN[i][0]}<b>${dateOf(dd).getDate()}</b>${has ? "<i></i>" : ""}</button>`; }).join("")}</div>
        <p aria-live="polite" class="pl-daysum">${sum}</p>
        <div class="pl-tlwrap"><div class="pl-tl" style="height:${TOT()}px">${hours}${dayLayer(d)}${logs}</div></div>
      </aside></div>`;
    const tw = $(".pl-tlwrap", root);
    if (tw && tw.scrollHeight > tw.clientHeight) { const nb = S.blocks.filter((b) => b.d === d && live(b)).map((b) => b.s); const focus = d === S.now.d ? S.now.m - 90 : (nb.length ? Math.min(...nb) - 60 : 1080); tw.scrollTop = Math.max(0, Y(focus)); }
  }

  /* ---------------------------------------------------------------- Week */
  function renderWeek() {
    const w = S.wk;
    const legend = S.tracks.map((t) => `<span data-tr="${t.tr}"><i></i>${esc(t.name)} · ${len(weekMins(w, t.id))} of ${len(t.target)}</span>`).join("") + `<span><i class="av"></i>Learning time</span>${S.calOn ? '<span><i class="bz"></i>Busy</span>' : ""}`;
    const days = [0, 1, 2, 3, 4, 5, 6].map((i) => w * 7 + i);
    layout(days);
    let hours = ""; for (let h = 6; h <= 22; h++) if (!FOLDED[h - 6]) hours += `<span style="top:${Y(h * 60)}px">${h}:00</span>`;
    for (const [a, e] of folds()) hours += `<span class="fold" style="top:${Y(a) + 5}px" title="${hm(a)}–${hm(e)}, nothing planned">${a / 60}–${e / 60}</span>`;
    const dh = days.map((d) => { const ld = dayLoad(d, S.blocks); return `<button type="button" class="pl-wd${d === S.now.d ? " is-today" : ""}" data-sel="${d}" aria-label="Open ${dayLong(d)}">${DN[wd(d)].slice(0, 3)}<b>${dateOf(d).getDate()}</b><span class="sm${ld > S.maxDay ? " over" : ""}">${ld ? len(ld) : "–"}</span></button>`; }).join("");
    const cols = days.map((d) => `<div class="pl-col" data-d="${d}" aria-label="${dayLong(d)}" style="height:${TOT()}px">${dayLayer(d)}</div>`).join("");
    main().innerHTML = `<div class="plan-pg pl-wk">${head(dayLong(S.now.d))}
      <div class="pl-wknav"><button class="icb" type="button" data-wk="-1" aria-label="Previous week"${w <= 0 ? " disabled" : ""}>${I.prev}</button><button class="icb" type="button" data-wk="1" aria-label="Next week"${w >= 1 ? " disabled" : ""}>${I.next}</button>
        <h2>${w === Math.floor(S.now.d / 7) ? "This week" : "Next week"} <span>${weekRange(w)}</span></h2><div class="pl-legend">${legend}</div></div>
      <div class="pl-wkscroll"><div class="pl-wkgrid"><div></div>${dh}<div class="pl-wkh" style="height:${TOT()}px">${hours}</div>${cols}</div></div>
      <p class="pl-wkfoot">Drag a session to move it; it lands on the nearest free time. Click one for details. Tinted hours are your learning time; hatched hours are busy in your calendar. Working hours with nothing planned are folded.</p></div>`;
  }

  /* ================================================================ popover */
  let popEl = null;
  function hidePop() { popEl?.remove(); popEl = null; }
  function showPop(id, anchor, ghost) {
    hidePop();
    const g = ghostOps();
    const b = ghost ? (g.add.find((x) => x.id === id) || (g.to.get(id) && { ...blockById(id), d: g.to.get(id).d, s: g.to.get(id).s, why: g.to.get(id).why, ghostOf: id })) : blockById(id);
    if (!b) return;
    const K = KIND[b.kind], t = track(b.tr), a2 = b.also ? track(b.also) : null;
    const can = !ghost && (b.st === "planned" || b.st === "started");
    const status = ghost ? "Proposed by the copilot · not on your calendar until you apply the plan" : { done: `Done · ${b.res || "finished"}`, started: `Started · ${b.res || ""}`, moved: "Moved", skipped: "Skipped", planned: isPast(b.d, b.s + b.m) ? "Not done" : "Planned" }[b.st];
    popEl = document.createElement("div"); popEl.className = "pl-pop"; popEl.setAttribute("role", "dialog"); popEl.setAttribute("aria-label", b.title);
    popEl.innerHTML = `<button class="icb x" type="button" data-px aria-label="Close">×</button>
      <span class="pl-kind" data-tr="${t ? t.tr : "a"}">${K.noun.startsWith(K.k) ? esc(K.noun) : `${esc(K.k)} · ${esc(K.noun)}`}</span>
      <h3>${esc(b.title)}</h3>
      <p class="meta"><span>${dayLong(b.d)} · ${hm(b.s)}–${hm(b.s + b.m)} · ${len(b.m)}</span>
        ${t ? `<span class="trs"><span data-tr="${t.tr}"><i></i>${esc(t.name)} › ${esc(b.topic)}</span>${a2 ? `<span data-tr="${a2.tr}"><i></i>${esc(a2.name)}</span>` : ""}</span>` : ""}
        <span>${esc(status)}</span>${MADE[b.made] && b.st !== "done" ? `<span>${esc(MADE[b.made])}</span>` : ""}
        ${b.why ? `<span class="why">“${esc(b.why)}”</span>` : ""}</p>
      <div class="acts">${ghost ? `<button class="button button-quiet" type="button" data-leave="${esc(id)}">Leave this out of the plan</button>` : `${can || b.st === "done" ? `<button class="button" type="button" data-start="${b.id}">${b.st === "done" ? "Open again" : esc(K.go)}</button>` : ""}${can ? `<button class="button button-quiet" type="button" data-movenext="${b.id}">Next free time</button><button class="button button-quiet" type="button" data-skip="${b.id}">Skip</button><button class="button button-link" type="button" data-remove="${b.id}">Remove</button>` : ""}`}</div>`;
    document.body.appendChild(popEl);
    const r = anchor.getBoundingClientRect(), pw = popEl.offsetWidth, ph = popEl.offsetHeight;
    let x = r.right + 10; if (x + pw > innerWidth - 12) x = r.left - pw - 10; if (x < 12) x = Math.min(Math.max(12, r.left), innerWidth - pw - 12);
    let y = Math.min(Math.max(12, r.top - 8), innerHeight - ph - 12);
    if (innerWidth < 700) { x = (innerWidth - pw) / 2; y = Math.max(12, innerHeight - ph - 80); }
    popEl.style.left = `${x}px`; popEl.style.top = `${y}px`;
    $("button.button, [data-px]", popEl)?.focus();
  }

  /* ================================================================ changing the plan by hand */
  function snapshot() { return { blocks: clone(S.blocks), tracks: clone(S.tracks), notes: clone(S.notes) }; }
  function restore(snap) { S.blocks = snap.blocks; S.tracks = snap.tracks; S.notes = snap.notes; }
  function flash(ids) { S.blocks.forEach((b) => { b.flash = ids.includes(b.id); }); setTimeout(() => S.blocks.forEach((b) => delete b.flash), 1700); }
  const newId = () => `n${++S.seq}`;
  function moveNext(id) {
    const b = blockById(id); if (!b) return;
    const snap = snapshot();
    let p = null;
    for (let d = Math.max(b.d, S.now.d); d <= Math.floor(S.now.d / 7) * 7 + 13 && !p; d++) for (const [a, e] of AVAIL[wd(d)]) { for (let s = d === b.d ? Math.max(a, b.s + 5) : a; s + b.m <= e; s += 5) if (fits(d, s, b.m, S.blocks, [id])) { p = { d, s }; break; } if (p) break; }
    if (!p) return toast("No free time left", "There's no free learning time in the next two weeks for this. Try Learning time to add some.");
    const from = `${dayShort(b.d)} ${hm(b.s)}`;
    Object.assign(b, { d: p.d, s: p.s, why: `Moved by you from ${from}` });
    flash([id]); jumpTo(p.d); render();
    toast(`Moved to ${dayRel(p.d)} ${hm(p.s)}`, `${b.title}: the next free learning time.`, () => { restore(snap); render(); });
  }
  function skip(id) {
    const b = blockById(id); if (!b) return;
    const snap = snapshot();
    const p = place(b.m, { d0: b.d + 1, d1: Math.floor(b.d / 7) * 7 + 13, prefD: b.d + 1 }, S.blocks, [id]);
    b.st = "moved"; b.why = p ? `Skipped. Moved to ${dayShort(p.d)} ${hm(p.s)}` : "Skipped";
    let msg = "Nothing else changed.";
    if (p && b.kind !== "plan") {
      const nb = { ...clone(b), id: newId(), d: p.d, s: p.s, st: "planned", why: `Moved from ${DN[wd(b.d)]}, when you skipped it` };
      S.blocks.push(nb); flash([nb.id]);
      msg = `I've moved it to ${dayRel(p.d)} at ${hm(p.s)}, the next free learning time.`;
      S.notes.push({ d: S.now.d, text: `<b>${esc(b.title)}</b> skipped, so it moved to ${dayRel(p.d)} ${hm(p.s)}.` });
    }
    render(); toast("Skipped", msg, () => { restore(snap); render(); });
  }
  function removeB(id) {
    const b = blockById(id); if (!b) return;
    const snap = snapshot();
    S.blocks = S.blocks.filter((x) => x.id !== id);
    render(); toast("Removed from the plan", `${b.title}. The Lumen stays in Learn.`, () => { restore(snap); render(); });
  }
  function jumpTo(d) { if (S.view === "week") S.wk = Math.floor(d / 7); else if (Math.floor(d / 7) === Math.floor(S.now.d / 7)) S.sel = d; }

  /* drag in the week grid */
  let drag = null;
  function dragStart(e, el) {
    const b = blockById(el.dataset.b);
    if (!b || el.dataset.ghost || S.view !== "week" || !(b.st === "planned" || b.st === "started") || e.button > 0) return;
    const r = el.getBoundingClientRect();
    drag = { el, b, x0: e.clientX, y0: e.clientY, dy: e.clientY - r.top, on: false };
    el.setPointerCapture?.(e.pointerId);
  }
  function dragMove(e) {
    if (!drag) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.on && Math.hypot(dx, dy) < 5) return;
    drag.on = true; hidePop(); drag.el.classList.add("is-drag");
    drag.el.style.transform = `translate(${dx}px, ${dy}px)`;
    drag.el.style.pointerEvents = "none";
    const col = document.elementFromPoint(e.clientX, e.clientY)?.closest(".pl-col");
    $$(".pl-col.is-drop", root).forEach((c) => c !== col && c.classList.remove("is-drop"));
    col?.classList.add("is-drop");
  }
  function dragEnd(e) {
    if (!drag) return;
    const { el, b, on, dy } = drag; drag = null;
    if (!on) return;
    S.dragAt = Date.now();
    const col = document.elementFromPoint(e.clientX, e.clientY)?.closest(".pl-col");
    el.style.pointerEvents = "";
    if (!col) return render();
    const d = +col.dataset.d, top = e.clientY - dy - col.getBoundingClientRect().top;
    const s = snap5(M(Math.max(0, top)));
    if (isPast(d, Math.max(s, H0))) { render(); return toast("That time has passed", "Sessions can only move to later times."); }
    const ns = nearest(d, Math.min(Math.max(s, H0), H1 - b.m), b.m, [b.id]);
    if (ns == null) { render(); return toast("No room that day", `${dayLong(d)} has no free time for ${len(b.m)}.`); }
    const snap = snapshot(), from = `${dayShort(b.d)} ${hm(b.s)}`;
    Object.assign(b, { d, s: ns, why: `Moved by you from ${from}` });
    flash([b.id]); render();
    const outside = !inAvail(d, ns, b.m), over = dayLoad(d, S.blocks) > S.maxDay;
    toast(`Moved to ${dayShort(d)} ${hm(ns)}`, `${ns !== s ? "The nearest free time. " : ""}${outside ? "It's outside your learning time, which is fine: your choice wins. " : ""}${over ? `${DN[wd(d)]} is now over your ${len(S.maxDay)} a day.` : ""}`.trim() || b.title, () => { restore(snap); render(); });
  }

  /* ================================================================ the copilot panel */
  const cpw = document.createElement("div");
  cpw.className = "cpwrap pl-cpwrap"; cpw.hidden = true;
  cpw.innerHTML = `<section class="cp" aria-label="Copilot: planning" tabindex="-1"><div class="cp-head"><div class="cp-toprow"><span class="cp-kicker">Copilot · Planning</span><span style="flex:1"></span><button class="icb" type="button" data-cpx aria-label="Close the copilot">×</button></div>
    <div class="cp-title"><h2>Your learning plan</h2></div><p class="cp-sub">It sees your week, My Focus, your Lumens and Library, and when you're busy. Nothing changes until you apply a plan.</p></div>
    <div class="cp-body"><div class="cp-thread" aria-live="polite"></div></div>
    <div class="cp-comp"><div class="prompts"></div><form class="box"><label class="visually-hidden" for="pl-in">Ask the copilot about your plan</label><textarea id="pl-in" rows="2" maxlength="1200" placeholder="Plan my week, or tell me about a deadline…"></textarea><div class="tools"><small id="pl-ai2"></small><span class="grow"></span><button aria-label="Send" class="send" type="submit" disabled>${I.send}</button></div></form></div></section>`;
  document.body.appendChild(cpw);
  const thread = $(".cp-thread", cpw), input = $("#pl-in", cpw), sendBtn = $(".send", cpw);
  const PROMPTS = ["Plan the rest of my week", "I'm presenting a courtyard house to a client on 6 November", "Make Saturday lighter", "Plan next week"];
  const used = new Set();
  function prompts() { $(".prompts", cpw).innerHTML = PROMPTS.filter((p) => !used.has(p)).map((p) => `<button type="button" data-say="${esc(p)}">${esc(p)}</button>`).join(""); }
  function openPanel(focus = true) {
    S.panel = true; cpw.hidden = false; document.documentElement.classList.add("pl-on");
    if (S.view === "day") { S.view = "week"; S.wk = Math.floor(S.now.d / 7); render(); }
    if (focus) setTimeout(() => input.focus({ preventScroll: true }), 60);
  }
  function closePanel() { S.panel = false; cpw.hidden = true; document.documentElement.classList.remove("pl-on"); }
  const scrollThread = () => { const b = $(".cp-body", cpw); b.scrollTop = b.scrollHeight; };
  function addMsg(role, html) {
    const el = document.createElement("div"); el.className = `msg ${role}`;
    el.innerHTML = role === "user" ? `<p>${esc(html)}</p>` : `<div class="who"><span class="av" aria-hidden="true">S</span>Studiolo</div><div class="txt">${html}</div>`;
    thread.appendChild(el); scrollThread(); return el;
  }
  function thinking(text) { const el = document.createElement("div"); el.className = "thinking"; el.innerHTML = `<span class="dots" aria-hidden="true"><span></span><span></span><span></span></span><span>${esc(text)}</span>`; thread.appendChild(el); scrollThread(); return el; }
  function greet() {
    const w = Math.floor(S.now.d / 7), n = S.blocks.filter((b) => Math.floor(b.d / 7) === w && live(b) && b.kind !== "plan");
    const short = S.tracks.find((t) => !t.goal && weekMins(w, t.id) < t.target);
    addMsg("ai", `<p>Your week has ${n.length} sessions, about ${len(n.reduce((a, b) => a + b.m, 0))}. I moved <b>Glare</b> from Tuesday to Thursday morning because you missed it.</p>${short ? `<p>${esc(short.name)} is ${len(short.target - weekMins(w, short.id))} short this week. Want me to find time, or is there a deadline I should plan around?</p>` : ""}`);
    S.msgs.push({ role: "assistant", content: "Greeting: summarised the week." });
  }

  /* ---------------------------------------------------------------- plan cards */
  function cardHTML(c) {
    const byDay = new Map();
    c.ops.forEach((o, i) => { const d = o.type === "add" ? o.nb.d : o.type === "move" ? o.d : (blockById(o.id) || o.gone)?.d ?? 0; if (!byDay.has(d)) byDay.set(d, []); byDay.get(d).push([o, i]); });
    const days = [...byDay.keys()].sort((a, b) => a - b);
    const G = { add: "+", move: "→", drop: "−", link: "◆" };
    const rows = days.map((d) => `<p class="pl-dayh">${dayLong(d)}</p>${byDay.get(d).map(([o, i]) => {
      const b = o.type === "add" ? o.nb : blockById(o.id) || o.gone; if (!b) return "";
      const what = o.type === "add" ? `${hm(b.s)} · ${len(b.m)} · ${KIND[b.kind].noun}` : o.type === "move" ? `${dayShort(o.fd ?? b.d)} ${hm(o.fs ?? b.s)} → ${dayShort(o.d)} ${hm(o.s)}` : o.type === "drop" ? `Drop · was ${hm(b.s)}` : `Also counts for ${esc(track(o.also)?.name || c.goal?.name || "")}`;
      const t = track(b.tr);
      return `<label class="pl-op${o.on ? "" : " is-off"}"><input type="checkbox" data-op="${i}"${o.on ? " checked" : ""}${c.state !== "pending" ? " disabled" : ""}><span class="g${o.type === "drop" ? " drop" : ""}" aria-hidden="true">${G[o.type]}</span><span class="tt"><b>${esc(b.title)}</b><small>${what}${t ? ` · ${esc(t.name)}` : ""}</small>${o.why || b.why ? `<span class="why">${esc(o.why || b.why)}</span>` : ""}</span></label>`;
    }).join("")}`).join("");
    const n = c.ops.filter((o) => o.on);
    const added = n.filter((o) => o.type === "add").reduce((a, o) => a + o.nb.m, 0);
    const sum = [n.filter((o) => o.type === "add").length && `${n.filter((o) => o.type === "add").length} new`, n.filter((o) => o.type === "move").length && `${n.filter((o) => o.type === "move").length} moved`, n.filter((o) => o.type === "drop").length && `${n.filter((o) => o.type === "drop").length} dropped`, n.filter((o) => o.type === "link").length && `${n.filter((o) => o.type === "link").length} linked to the goal`, added && `${len(added)} added`].filter(Boolean).join(" · ") || "Nothing selected";
    const acts = { pending: `<button class="button" type="button" data-apply="${c.id}"${n.length ? "" : " disabled"}>Apply to my calendar</button><button class="button button-quiet" type="button" data-dismiss="${c.id}">Not now</button><button class="button button-link" type="button" data-showwk="${c.wk}">Show on the week</button>`, applied: `<span class="done"><b>✓ Applied</b> to your calendar · <button class="pl-linkbtn" type="button" data-undo="${c.id}">Undo</button></span>`, undone: '<span class="done">Undone. Your calendar is as it was.</span>', dismissed: '<span class="done">Not applied.</span>', replaced: '<span class="done">Replaced by a newer plan below.</span>' }[c.state];
    return `<div class="pl-card${c.state === "pending" ? " is-pending" : ""}${["replaced", "dismissed", "undone"].includes(c.state) ? " is-old" : ""}" data-card="${c.id}">
      <div class="pl-card-h"><span class="tag">Plan</span><h4>${esc(c.title)}</h4></div><p class="pl-card-sum">${sum}</p>
      ${c.review ? `<div class="pl-review"><h5>How the week went</h5><p class="stat"><span><b>${c.review.done}</b>of ${c.review.total} sessions</span><span><b>${len(c.review.mins)}</b>of learning</span>${c.review.missed ? `<span><b>${c.review.missed}</b>missed or skipped</span>` : ""}</p><ul>${c.review.lines.map((l) => `<li>${l}</li>`).join("")}</ul></div>` : ""}
      ${c.goal ? `<div class="pl-goal"><span><b>New goal · ${esc(c.goal.name)}</b> · ${esc(dayLong(c.goal.until))}</span><span>Draws on ${c.goal.draws.map((id) => esc(track(id)?.name || id)).join(" and ")}. Its sessions count for both, and for the goal.</span></div>` : ""}
      ${rows || '<p class="pl-card-sum">No calendar changes.</p>'}<div class="acts">${acts}</div></div>`;
  }
  function refreshCard(c) { const el = $(`[data-card="${c.id}"]`, cpw); if (el) el.outerHTML = cardHTML(c); }
  function postCard(c) {
    if (S.card && S.card.state === "pending") { S.card.state = "replaced"; refreshCard(S.card); }
    S.cards.push(c); S.card = c;
    const holder = document.createElement("div"); holder.className = "msg ai"; holder.innerHTML = cardHTML(c);
    thread.appendChild(holder); scrollThread();
    if (S.view !== "week") S.view = "week";
    S.wk = c.wk; render();
    $(".pl-b.is-ghost, .pl-b.is-gone, .pl-b.is-linked", root)?.scrollIntoView({ block: "nearest", behavior: "auto" });
  }
  function applyCard(id) {
    const c = S.cards.find((x) => x.id === id); if (!c || c.state !== "pending") return;
    c.snap = snapshot();
    if (c.goal && !S.tracks.some((t) => t.id === c.goal.id)) S.tracks.push(clone(c.goal));
    const ids = [];
    for (const o of c.ops.filter((x) => x.on)) {
      if (o.type === "add") { S.blocks.push({ ...clone(o.nb), st: "planned" }); ids.push(o.nb.id); }
      const b = o.id && blockById(o.id);
      if (o.type === "move" && b) { Object.assign(b, { d: o.d, s: o.s, why: o.why || b.why }); ids.push(b.id); }
      if (o.type === "drop" && b) { o.gone = clone(b); S.blocks = S.blocks.filter((x) => x.id !== o.id); }
      if (o.type === "link" && b) { b.also = o.also; ids.push(b.id); }
    }
    c.state = "applied"; S.card = null; refreshCard(c); flash(ids); render();
    toast("Plan applied", `${c.ops.filter((x) => x.on).length} changes on your calendar.`, () => undoCard(id));
  }
  function undoCard(id) { const c = S.cards.find((x) => x.id === id); if (!c || c.state !== "applied") return; restore(c.snap); c.state = "undone"; refreshCard(c); render(); }

  /** Turns wishes (add / move / drop / link, with preferred times) into a card, placing each one Motion-style. */
  function buildCard({ title, wishes, goal = null, review = null, wk = null }) {
    const sim = clone(S.blocks), ops = [];
    const w0 = Math.floor(S.now.d / 7);
    for (const x of wishes) {
      if (x.type === "add") {
        const m = Math.min(60, Math.max(5, x.m | 0 || 20));
        const wkx = x.d != null ? Math.floor(x.d / 7) : w0;
        const p = place(m, { d0: Math.max(S.now.d, wkx * 7), d1: wkx * 7 + 6, prefD: x.d ?? null, prefS: x.s ?? null }, sim)
          || place(m, { d0: S.now.d, d1: w0 * 7 + 13, prefD: x.d ?? null }, sim);
        if (!p) continue;
        const nb = { id: newId(), d: p.d, s: p.s, m, kind: KIND[x.kind] ? x.kind : "watch", title: String(x.title || "A new Lumen").slice(0, 90), tr: track(x.tr) ? x.tr : S.tracks[0].id, also: x.also && (track(x.also) || x.also === goal?.id) ? x.also : null, topic: x.topic || "", st: "planned", made: x.made || (x.kind === "live" ? "none" : x.kind === "library" ? "exists" : "evening"), why: x.why || "" };
        sim.push(nb); ops.push({ type: "add", nb, on: true, why: x.why });
      } else {
        const b = sim.find((y) => y.id === x.id);
        if (!b || !(b.st === "planned" || b.st === "started") || isPast(b.d, b.s)) continue;
        if (x.type === "move") {
          const wkx = x.d != null ? Math.floor(x.d / 7) : Math.floor(b.d / 7);
          const p = place(b.m, { d0: Math.max(S.now.d, wkx * 7), d1: wkx * 7 + 6, prefD: x.d ?? b.d, prefS: x.s ?? null }, sim, [b.id]);
          if (!p || (p.d === b.d && p.s === b.s)) continue;
          const added = ops.find((o) => o.type === "add" && o.nb.id === b.id);
          if (added) { Object.assign(added.nb, { d: p.d, s: p.s }); Object.assign(b, { d: p.d, s: p.s }); continue; }
          ops.push({ type: "move", id: b.id, d: p.d, s: p.s, fd: b.d, fs: b.s, on: true, why: x.why }); Object.assign(b, { d: p.d, s: p.s });
        }
        if (x.type === "drop") { const ai = ops.findIndex((o) => o.type === "add" && o.nb.id === b.id); if (ai >= 0) ops.splice(ai, 1); else ops.push({ type: "drop", id: b.id, on: true, why: x.why }); b.st = "dropped"; }
        if (x.type === "link" && x.also) { if (b.also === x.also) continue; ops.push({ type: "link", id: b.id, also: x.also, on: true, why: x.why }); b.also = x.also; }
      }
    }
    const weeks = new Set(ops.map((o) => Math.floor((o.type === "add" ? o.nb.d : o.type === "move" ? o.d : blockById(o.id)?.d ?? S.now.d) / 7)));
    const cw = wk ?? (weeks.size === 1 ? [...weeks][0] : w0);
    return { id: `c${S.cards.length + 1}`, title: title || (cw > w0 ? `Next week · ${weekRange(cw)}` : weeks.size > 1 ? "Changes to this week and next" : "Changes to this week"), ops, goal, review, wk: cw, state: "pending" };
  }

  /* ---------------------------------------------------------------- scripted answers */
  const has = (title) => S.blocks.some((b) => b.title === title && b.st !== "dropped") || (S.card?.state === "pending" && S.card.ops.some((o) => o.type === "add" && o.nb.title === title));
  function scriptRest() {
    const w = Math.floor(S.now.d / 7), wishes = [];
    const plan = track("plan"), short = plan.target - weekMins(w, "plan");
    if (short > 0 && !has("Qibla orientation: why the mosque turns")) wishes.push({ type: "add", kind: "watch", title: "Qibla orientation: why the mosque turns", tr: "plan", topic: "Qibla orientation", m: 20, d: Math.max(S.now.d, w * 7 + 3), s: 1170, why: `Plan types & ritual is ${len(short)} short this week` });
    if (!has("Four-iwan plan · 3 questions")) wishes.push({ type: "add", kind: "review", title: "Four-iwan plan · 3 questions", tr: "plan", topic: "Four-iwan plan", m: 10, d: w * 7 + 5, s: 660, made: "none", why: "A spaced review a few days after you finish the four-iwan Lumen" });
    const c = buildCard({ wishes });
    if (!c.ops.length) return { say: "Your week already has every topic's time, and there's no free learning time left that wouldn't go over your daily maximum. I'd leave it as it is." };
    return { say: `${short > 0 ? `Plan types & ritual is ${len(short)} short of its ${len(plan.target)}, and Friday evening is busy.` : "Your week is nearly full."} I'd add a short Lumen on qibla orientation and a spaced review of the four-iwan plan, and leave everything else where it is.`, card: c };
  }
  function scriptGoal() {
    if (track("client")) return { say: "The client presentation is already a goal on your plan. Ask me to plan next week and I'll lean it further towards the presentation." };
    const goal = clone(GOAL), w = Math.floor(S.now.d / 7);
    const link = (id, why) => { const b = blockById(id); return b && b.st === "planned" && !isPast(b.d, b.s) ? [{ type: "link", id, also: "client", why }] : []; };
    const wishes = [
      ...link("b7", "Thermal mass is half of what the client will ask about"),
      ...link("b9", "Sun angles decide how light reaches rooms off the court"),
      ...link("b12", "Light shelves or mashrabiya is a choice you'll present"),
      { type: "add", kind: "read", title: "Daylight in deep courtyard plans", tr: "day", also: "client", topic: "Sun angles", m: 30, d: w * 7 + 5, s: 660, why: "The client will ask how light reaches the rooms off the court" },
      { type: "add", kind: "live", title: "Rehearse: explain the court's cooling in two minutes", tr: "ver", also: "client", topic: "Thermal mass", m: 20, d: w * 7 + 6, s: 1080, why: "Say it out loud once before the meeting; I'll play the client and interrupt" },
      { type: "move", id: "b10", d: w * 7 + 7, s: 420, why: "Moved to next week to make room for the presentation" },
    ];
    const c = buildCard({ title: "A goal, and changes to this week", wishes, goal });
    return { say: `That's ${GOAL.until - S.now.d} days away. I've set it up as a goal that draws on two of your topics, Daylight & shading and Vernacular & regional, so its sessions count for both. This week I'd put thermal mass, sun angles and a rehearsal first, and move the hypostyle Lumen to next week to make room.`, card: c };
  }
  function scriptLighter() {
    const w = Math.floor(S.now.d / 7), sat = w * 7 + 5, sun = w * 7 + 6;
    const pend = S.card?.state === "pending" ? S.card : null;
    const sim = clone(S.blocks); if (pend) for (const o of pend.ops.filter((x) => x.on && x.type === "add")) sim.push(o.nb);
    const satB = sim.filter((b) => b.d === sat && (b.st === "planned") && b.kind !== "plan").sort((a, b) => b.m - a.m);
    if (!satB.length) return { say: "Saturday has nothing planned, so it's already as light as it gets." };
    const target = satB[0], before = satB.reduce((a, b) => a + b.m, 0);
    const isAdd = !!pend?.ops.some((o) => o.type === "add" && o.nb.id === target.id);
    const wishes = pend ? pend.ops.filter((o) => o.on).map((o) => (o.type === "add" ? { type: "add", ...o.nb, why: o.why ?? o.nb.why, d: o.nb.id === target.id ? sun : o.nb.d, s: o.nb.id === target.id ? 1065 : o.nb.s } : { ...o })) : [];
    if (!isAdd) wishes.push({ type: "move", id: target.id, d: sun, s: 1065, why: "To keep Saturday light" });
    const c = buildCard({ title: pend ? `${pend.title}, with a lighter Saturday` : "A lighter Saturday", wishes, goal: pend?.goal || null });
    return { say: `Saturday drops from ${len(before)} to ${len(before - target.m)}. ${target.title.split(" · ")[0]} moves to Sunday${pend ? ", and the rest of the plan above stays the same" : ""}.`, card: c };
  }
  function scriptNext() {
    const w = Math.floor(S.now.d / 7), n = w + 1, D = (i) => n * 7 + i;
    const wk = S.blocks.filter((b) => Math.floor(b.d / 7) === w && b.kind !== "plan");
    const done = wk.filter((b) => b.st === "done"), missed = wk.filter((b) => b.st === "skipped" || (b.st === "planned" && isPast(b.d, b.s + b.m)));
    const lines = [], wishes = [];
    const carry = missed;
    for (const b of wk.filter((x) => x.st === "moved")) { const r = wk.find((x) => x.title === b.title && x.id !== b.id && x.st === "done"); if (r) lines.push(`<b>${esc(b.title)}</b> moved from ${DN[wd(b.d)]} to ${DN[wd(r.d)]}, and you did it then.`); }
    for (const b of carry) { lines.push(`You missed <b>${esc(b.title)}</b>, so it carries over to next week.`); wishes.push({ type: "add", kind: b.kind, title: b.title, tr: b.tr, also: b.also, topic: b.topic, m: b.m, d: D(0), s: 420, why: `Carried over from ${DN[wd(b.d)]}` }); }
    const hyp = blockById("b10"); if (hyp && Math.floor(hyp.d / 7) === n) lines.push("<b>Hypostyle halls</b> is already on Monday morning.");
    const th = blockById("b7");
    if (th?.st === "done" && th.score != null && th.score < 3) { lines.push(`On thermal mass you got ${th.score} of 3 on the first try, so a short review of thermal lag goes first on Monday evening.`); wishes.push({ type: "move", id: "b14", d: D(0), s: 1155, why: "After the review" }, { type: "add", kind: "review", title: "Thermal lag · 3 questions", tr: "ver", also: track("client") ? "client" : null, topic: "Thermal mass", m: 10, d: D(0), s: 1140, made: "none", why: `${th.score} of 3 on the first try on Wednesday` }); }
    else if (th && th.st !== "done") lines.push("<b>Thermal mass</b> isn't read yet; it stays where it is this week.");
    const gl = blockById("b6");
    if (gl?.st === "done" && /3 of 3/.test(gl.res || "")) { lines.push("You got all three glare questions right, so <b>Glare, part 2</b> can wait."); wishes.push({ type: "drop", id: "b15", why: "You got 3 of 3 on glare; it can come later" }); }
    const goal = track("client");
    if (goal) {
      lines.push(`The client presentation is in ${goal.until - S.now.d} days, so next week leans towards it.`);
      wishes.push({ type: "link", id: "b14", also: "client", why: "Shading devices are part of the scheme" });
      wishes.push({ type: "add", kind: "read", title: "Mashrabiya: screens that shade and ventilate", tr: "day", also: "client", topic: "Mashrabiya screens", m: 30, d: D(1), s: 1140, why: "The court's screens, in enough depth to answer questions" });
      wishes.push({ type: "add", kind: "live", title: "Rehearse the whole scheme, with questions", tr: "ver", also: "client", topic: "Courtyard houses", m: 25, d: D(3), s: 1140, why: "A full run-through a week before the meeting" });
      if (!has("Daylight in deep courtyard plans")) wishes.push({ type: "add", kind: "read", title: "Daylight in deep courtyard plans", tr: "day", also: "client", topic: "Sun angles", m: 30, d: D(2), s: 1140, why: "How light reaches rooms off a deep court" });
    } else {
      wishes.push({ type: "add", kind: "read", title: "Mashrabiya: screens that shade and ventilate", tr: "day", topic: "Mashrabiya screens", m: 30, d: D(1), s: 1140, why: "Next in Daylight & shading" });
    }
    if (!has("Qibla orientation: why the mosque turns")) wishes.push({ type: "add", kind: "watch", title: "Qibla orientation: why the mosque turns", tr: "plan", topic: "Qibla orientation", m: 20, d: D(2), s: 420, why: "Plan types & ritual, after the hypostyle hall" });
    wishes.push({ type: "add", kind: "read", title: "The four-iwan plan, read in depth", tr: "plan", topic: "Four-iwan plan", m: 30, d: D(5), s: 570, why: "Plan types & ritual needs 1 h 30 a week" });
    wishes.push({ type: "add", kind: "library", title: "Bait Ur Rouf Mosque · from 12:34", tr: "ver", topic: "Courtyard houses", m: 35, d: D(5), s: 615, made: "exists", why: "You stopped at 12:34 on Monday" });
    wishes.push({ type: "add", kind: "review", title: "Courtyard houses · spaced review", tr: "ver", topic: "Courtyard houses", m: 10, d: D(4), s: 420, made: "none", why: "A week after the last one" });
    if (!lines.length) lines.push("It's only " + DN[wd(S.now.d)] + ", so I've planned next week from what's done so far. I'll check again on Sunday.");
    const c = buildCard({ title: `Next week · ${weekRange(n)}`, wishes, wk: n, review: { done: done.length, total: wk.filter((b) => live(b) || b.st === "skipped").length, mins: done.reduce((a, b) => a + b.m, 0), missed: missed.length, lines } });
    return { say: "Here's how this week went, and what I'd put in next week. Busy evenings are left free, and no day goes over 1 h 30. Nothing changes until you apply it.", card: c };
  }
  function scripted(text) {
    const t = text.toLowerCase();
    if (/next week/.test(t)) return scriptNext();
    if (/client|present|deadline|exam|november|\bnov\b|due/.test(t)) return scriptGoal();
    if (/light|less|saturday|weekend|tired|busy/.test(t)) return scriptLighter();
    return scriptRest();
  }

  /* ---------------------------------------------------------------- Claude's answers */
  function stateForAI() {
    const w = Math.floor(S.now.d / 7);
    const bl = S.blocks.filter((b) => Math.floor(b.d / 7) >= w && Math.floor(b.d / 7) <= w + 1).sort((a, b) => a.d - b.d || a.s - b.s);
    const wkLabel = (d) => (Math.floor(d / 7) === w ? "this" : "next");
    return [
      `Now: ${dayLong(S.now.d)} 2026, ${hm(S.now.m)}.`,
      "Learner: an architect learning climate-responsive design and Islamic architecture, for work.",
      `Topics in My Focus (id: name, sub-topics, weekly target, planned this week): ${S.tracks.map((t) => `${t.id}: ${t.name}${t.goal ? ` (GOAL until ${dayLong(t.until)}, draws on ${t.draws.join(", ")})` : ` (${t.subs.join(", ")})`}, target ${t.target} min, planned ${weekMins(w, t.id)} min`).join("; ")}.`,
      "Learning time: weekdays 07:00–08:00 and 19:00–21:00; Saturday 09:00–12:00; Sunday 17:00–19:00. At most " + S.maxDay + " minutes a day.",
      `Busy in their calendar: ${S.busy.filter((z) => z.d >= S.now.d && z.d < (w + 2) * 7).map((z) => `${wkLabel(z.d)} ${DN[wd(z.d)].slice(0, 3)} ${hm(z.s)}–${hm(z.e)}`).join("; ")}.`,
      `Sessions (id | week day time | minutes | kind | title | topic id | also | status | result):\n${bl.map((b) => `${b.id} | ${wkLabel(b.d)} ${DN[wd(b.d)].slice(0, 3)} ${hm(b.s)} | ${b.m} | ${b.kind} | ${b.title} | ${b.tr || "-"} | ${b.also || "-"} | ${b.st}${isPast(b.d, b.s) && b.st === "planned" ? " (time has passed)" : ""} | ${b.res || (b.score != null ? `${b.score} of 3 first try` : "-")}`).join("\n")}`,
      `Library: ${LIBRARY.join("; ")}.`,
    ].join("\n");
  }
  const FORMAT = `Session kinds: watch (a narrated video Lumen, 4–25 min), read (a reading Lumen: a long illustrated lesson page with a short quiz, 15–40 min), live (a live session: the narrator talks it through and the learner interrupts, 15–30 min), review (a short spaced quiz, 5–15 min), course (the next part of a course), library (an item from their Library).
New Lumens can be planned on any sub-topic; they're made the evening before, so planning costs nothing.
Reply with JSON Lines only: one object per line, no prose, no code fences.
Line 1: {"say":"1 to 3 short, plain sentences to the learner. Say what you'd change and why. No lists."}
Then any of:
{"goal":{"name":"…","until":"YYYY-MM-DD","tracks":["day","ver"],"minutes":120}}   only if the learner names a deadline or goal that spans topics; its id becomes "goal"
{"add":{"week":"this|next","day":"Mon|Tue|Wed|Thu|Fri|Sat|Sun","start":"HH:MM","mins":20,"kind":"read","title":"specific title","topic":"day","also":"goal or null","sub":"sub-topic","why":"short reason, under 12 words"}}
{"move":{"id":"b7","week":"this|next","day":"Thu","start":"HH:MM","why":"…"}}
{"drop":{"id":"b9","why":"…"}}
{"link":{"id":"b3","also":"goal","why":"…"}}   counts an existing session for the goal too
{"review":"one line on how the week went, from the records"}   up to 3, only when planning next week
Rules: change only sessions that are planned and still ahead; keep to learning time, outside busy times, at most ${S.maxDay} minutes a day; prefer small changes (at most 8) unless asked to plan a whole week; never invent results the records don't show.`;
  async function askClaude(text) {
    const hist = S.msgs.slice(-6).map((m) => `${m.role === "user" ? "Learner" : "Copilot"}: ${m.content}`).join("\n");
    const prompt = `You are Studiolo's copilot, planning a learner's study week on their calendar.\n\n${stateForAI()}\n\nConversation so far:\n${hist || "(none)"}\n\nLearner: ${text}\n\n${FORMAT}`;
    const out = { say: "", wishes: [], goal: null, review: [] };
    let pend = "";
    const dayIdx = (wk, day) => { const i = DN.findIndex((n) => n.slice(0, 3).toLowerCase() === String(day || "").slice(0, 3).toLowerCase()); if (i < 0) return null; return (Math.floor(S.now.d / 7) + (wk === "next" ? 1 : 0)) * 7 + i; };
    const eat = (l) => {
      l = l.trim().replace(/^```\w*|```$/g, "").trim(); if (!l.startsWith("{")) return;
      let o; try { o = JSON.parse(l); } catch { return; }
      if (o.say) out.say = String(o.say);
      if (o.review) out.review.push(esc(String(o.review)));
      if (o.goal && !track("client")) { const u = new Date(o.goal.until); const until = isNaN(u) ? S.now.d + 14 : Math.round((u - dateOf(0)) / 864e5); out.goal = { ...clone(GOAL), name: String(o.goal.name || "Goal").slice(0, 40), note: "From your conversation", until: Math.max(S.now.d + 1, until), draws: (o.goal.tracks || []).filter((t) => track(t)).slice(0, 3), target: Math.min(240, Math.max(30, o.goal.minutes | 0 || 120)) }; if (!out.goal.draws.length) out.goal.draws = ["day", "ver"]; }
      const alsoOf = (a) => (a === "goal" || a === "client" ? "client" : track(a) ? a : null);
      if (o.add) out.wishes.push({ type: "add", kind: o.add.kind, title: o.add.title, tr: o.add.topic, also: alsoOf(o.add.also), topic: o.add.sub || "", m: +o.add.mins || 20, d: dayIdx(o.add.week, o.add.day), s: parseHM(o.add.start), why: o.add.why });
      if (o.move) out.wishes.push({ type: "move", id: o.move.id, d: dayIdx(o.move.week, o.move.day), s: parseHM(o.move.start), why: o.move.why });
      if (o.drop) out.wishes.push({ type: "drop", id: o.drop.id, why: o.drop.why });
      if (o.link) out.wishes.push({ type: "link", id: o.link.id, also: alsoOf(o.link.also), why: o.link.why });
    };
    let seen = 0;
    await S.ai(prompt, { modelTier: "default", cache: false, onText: ({ text: whole }) => { const lines = whole.split("\n"); pend = lines.pop(); for (; seen < lines.length; seen++) eat(lines[seen]); } });
    eat(pend);
    if (!out.say) throw new Error("empty");
    const next = /next week/i.test(text);
    const w = Math.floor(S.now.d / 7);
    const wk = S.blocks.filter((b) => Math.floor(b.d / 7) === w && b.kind !== "plan");
    const review = next || out.review.length ? { done: wk.filter((b) => b.st === "done").length, total: wk.filter((b) => live(b) || b.st === "skipped").length, mins: wk.filter((b) => b.st === "done").reduce((a, b) => a + b.m, 0), missed: wk.filter((b) => b.st === "skipped" || (b.st === "planned" && isPast(b.d, b.s + b.m))).length, lines: out.review.length ? out.review : ["Planned from what's done so far."] } : null;
    const card = out.wishes.length || out.goal ? buildCard({ wishes: out.wishes, goal: out.goal, review, wk: next ? w + 1 : null, title: next ? `Next week · ${weekRange(w + 1)}` : out.goal ? "A goal, and changes to your plan" : null }) : null;
    return { say: esc(out.say), card };
  }

  async function send(text) {
    text = text.trim(); if (!text || S.busyAI) return;
    used.add(PROMPTS.find((p) => p === text)); prompts();
    addMsg("user", text); S.msgs.push({ role: "user", content: text });
    input.value = ""; sendBtn.disabled = true; S.busyAI = true;
    const th = thinking(/next week/i.test(text) ? "Reading how this week went…" : "Reading your week, My Focus and your calendar…");
    let ans = null;
    if (S.ai) { try { ans = await askClaude(text); } catch (e) { if (["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].includes(e?.code)) { S.ai = null; aiBadge(); } ans = null; } }
    if (!ans) { await sleep(900); ans = scripted(text); }
    th.remove(); S.busyAI = false;
    addMsg("ai", `<p>${ans.say}</p>`); S.msgs.push({ role: "assistant", content: ans.say.replace(/<[^>]+>/g, "") });
    if (ans.card) { if (ans.card.ops.length || ans.card.goal) postCard(ans.card); else addMsg("ai", "<p>I couldn't fit those into free learning time without going over your daily maximum.</p>"); }
  }

  /* ================================================================ sessions: watch, read, live, review */
  let dlg = null;
  function closeDlg() { dlg?.remove(); dlg = null; }
  function openDlg(html, onClick) {
    closeDlg(); hidePop();
    dlg = document.createElement("div"); dlg.className = "pl-dlg"; dlg.innerHTML = `<div class="pl-dlg-in" role="dialog" aria-modal="true">${html}</div>`;
    dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.closest("[data-dx]")) return closeDlg(); onClick?.(e); });
    document.body.appendChild(dlg); $("button", dlg)?.focus();
  }
  function finish(b, res, extra = {}) {
    const was = b.st;
    Object.assign(b, { st: "done", res, ...extra });
    if (was === "planned" && b.d > S.now.d) { b.why = `Done early, on ${DN[wd(S.now.d)]}`; }
    closeDlg(); render();
    toast("Done", `${b.title}${res ? ` · ${res}` : ""}. It's ticked on your calendar.`);
  }
  function start(id) {
    const b = blockById(id); if (!b) return; hidePop();
    if (b.kind === "plan") { openPanel(); send("Plan next week"); return; }
    if (b.kind === "read") return openRead(b);
    if (b.kind === "review") return openReview(b);
    const t = track(b.tr);
    const titles = { watch: "Playing the Lumen", course: "Playing the course part", live: "Live session", library: "Opening in your Library" };
    const sub = { watch: "Simulated playback. In the app this opens the Lumen player.", course: "Simulated playback. In the app this opens the course viewer at this part.", live: "In the app this opens Learn's live studio: the narrator talks it through and you can cut in (see the Learn, Live prototype). Simulated here.", library: "In the app this opens the item in your Library where you stopped." }[b.kind];
    const p0 = b.prog || 0;
    openDlg(`<h3>${esc(titles[b.kind])}</h3><p class="sub">${esc(sub)}</p>
      <div class="pl-screen"><span class="kk"><span class="brand-mark" aria-hidden="true">S</span>${b.kind === "library" ? "Your Library" : b.kind === "live" ? "Studiolo · Live" : "Studiolo Lumen"}</span><h4>${esc(b.title)}</h4><p>${t ? `${esc(t.name)} › ${esc(b.topic)}` : ""}</p></div>
      <div class="pl-prog" aria-hidden="true"><i style="width:${p0 * 100}%"></i></div>
      <div class="acts"><button class="button button-quiet" type="button" data-dx>Stop here</button><button class="button" type="button" data-fin disabled>${b.kind === "live" ? "End live" : b.kind === "library" ? "Mark as read" : "Mark as watched"}</button></div>`, (e) => { if (e.target.closest("[data-fin]")) finish(b, { watch: "Watched", course: "Watched", live: "8 min live · 2 questions asked", library: "Read to p. 58" }[b.kind]); });
    const bar = $(".pl-prog i", dlg), fin = $("[data-fin]", dlg); let p = p0; const my = dlg;
    (async () => { while (p < 1 && dlg === my) { await sleep(120); p = Math.min(1, p + 0.035); bar.style.width = `${p * 100}%`; } if (dlg === my) { fin.disabled = false; fin.focus(); } })();
  }
  const QUIZ = {
    "Courtyard houses": [
      ["Why is a deep, narrow court cooler in the afternoon than a wide one?", ["It catches more wind", "It stays shaded for longer, so the night's cool air survives", "Its walls are thinner"], 1, "Shade keeps the pool of cool night air from warming up."],
      ["Where did families often sleep on summer nights?", ["In the basement", "On the roof", "In the iwan"], 1, "Roofs lose heat fast to a clear night sky."],
      ["What does a pool or fountain in the court add?", ["Evaporative cooling", "Thermal mass only", "Nothing but beauty"], 0, "Evaporation takes heat from the air around it."],
    ],
    "Four-iwan plan": [
      ["How many iwans face the court in a four-iwan plan?", ["Two", "Four", "Six"], 1, "One on each side, facing each other across the court."],
      ["In a four-iwan mosque, which iwan is usually the largest?", ["The one on the qibla side", "The entrance iwan", "They're all equal"], 0, "The qibla iwan usually leads to the domed prayer hall."],
      ["What is an iwan?", ["A domed tower", "A vaulted hall open on one side", "A courtyard pool"], 1, "A vaulted space walled on three sides, open to the court."],
    ],
    "Thermal mass": [
      ["A thick earth wall's outer face peaks at 2 pm. Roughly when does its inner face peak?", ["2:30 pm", "Late evening, around 11 pm", "Never"], 1, "In the region of 8 to 10 hours later."],
      ["What has to happen every night for mass to keep working?", ["The walls must be painted", "The walls must lose the day's heat to night air and sky", "Nothing"], 1, "Mass that never discharges just stores heat."],
      ["Where do thick walls help least?", ["Desert, 40 °C days and 20 °C nights", "A humid city where nights stay near 30 °C", "A highland town with cold nights"], 1, "Small daily swings leave no cool night to discharge into."],
    ],
  };
  function openReview(b) {
    const qs = QUIZ[b.topic] || QUIZ[Object.keys(QUIZ).find((k) => b.title.includes(k.split(" ")[0])) || "Courtyard houses"];
    let right = 0, answered = 0;
    openDlg(`<h3>${esc(b.title)}</h3><p class="sub">A spaced review: answers feed what the copilot plans next.</p><div class="pl-quiz">${qs.map(([q, o], i) => `<div class="pl-q" data-q="${i}"><p>${i + 1}. ${esc(q)}</p><div class="opts">${o.map((x, j) => `<button type="button" data-a="${j}">${esc(x)}</button>`).join("")}</div></div>`).join("")}</div><div class="acts"><button class="button button-quiet" type="button" data-dx>Later</button><button class="button" type="button" data-fin disabled>Done</button></div>`, (e) => {
      const a = e.target.closest("[data-a]");
      if (a && !a.disabled) {
        const qi = +a.closest("[data-q]").dataset.q, [, , ok, why] = qs[qi], good = +a.dataset.a === ok;
        $$("[data-a]", a.parentElement).forEach((x) => { x.disabled = true; if (+x.dataset.a === ok) x.classList.add("ok"); });
        if (!good) a.classList.add("no"); right += good; answered++;
        a.closest(".pl-q").insertAdjacentHTML("beforeend", `<p class="why">${good ? "Right." : "Not quite."} ${esc(why)}</p>`);
        if (answered === qs.length) $("[data-fin]", dlg).disabled = false;
      }
      if (e.target.closest("[data-fin]")) finish(b, `${right} of ${qs.length} right`, { score: right });
    });
  }

  /* ---------------------------------------------------------------- the reading Lumen */
  function chart() {
    const X = (t) => 52 + (t / 24) * 560, Y = (c) => 214 - ((c - 15) / 30) * 190;
    const curve = (f) => Array.from({ length: 97 }, (_, i) => { const t = i / 4; return `${i ? "L" : "M"}${X(t).toFixed(1)},${Y(f(t)).toFixed(1)}`; }).join("");
    const out = (t) => 32 + 10 * Math.cos((2 * Math.PI * (t - 14)) / 24), ins = (t) => 29.5 + 1.5 * Math.cos((2 * Math.PI * (t - 23)) / 24);
    let g = ""; for (const c of [20, 30, 40]) g += `<line x1="52" x2="612" y1="${Y(c)}" y2="${Y(c)}" style="stroke:var(--line)"/><text x="44" y="${Y(c) + 4}" text-anchor="end" style="fill:var(--ink-2)" font-size="11">${c} °C</text>`;
    for (let t = 0; t <= 24; t += 6) g += `<text x="${X(t)}" y="234" text-anchor="middle" style="fill:var(--ink-2)" font-size="11">${String(t).padStart(2, "0")}:00</text>`;
    return `<figure><p class="pl-key"><span><i style="background:var(--warn)"></i>Outdoor air · swings 20 K</span><span><i style="background:var(--accent)"></i>Inside face of a 300 mm earth wall · swings 3 K</span></p><svg viewBox="0 0 640 250" role="img" aria-label="Outdoor air swings from 22 to 42 °C, peaking at 2 pm; the inside face of a 300 mm earth wall swings from 28 to 31 °C, peaking around 11 pm." style="width:100%;height:auto;max-width:100%">
      ${g}<line x1="52" x2="612" y1="214" y2="214" style="stroke:var(--ink-3)"/>
      <path d="${curve(out)}" fill="none" style="stroke:var(--warn)" stroke-width="2.5"/>
      <path d="${curve(ins)}" fill="none" style="stroke:var(--accent)" stroke-width="2.5"/>
      <line x1="${X(14)}" x2="${X(23)}" y1="${Y(44.5)}" y2="${Y(44.5)}" style="stroke:var(--ink-2)" stroke-width="1.2"/>
      <line x1="${X(14)}" x2="${X(14)}" y1="${Y(44.5) - 4}" y2="${Y(42)}" style="stroke:var(--ink-2)" stroke-dasharray="2 3"/><line x1="${X(23)}" x2="${X(23)}" y1="${Y(44.5) - 4}" y2="${Y(31)}" style="stroke:var(--ink-2)" stroke-dasharray="2 3"/>
      <text x="${X(18.5)}" y="${Y(44.5) - 6}" text-anchor="middle" style="fill:var(--ink)" font-size="12" font-weight="600">about 9 hours later</text>
      <circle cx="${X(14)}" cy="${Y(42)}" r="4" style="fill:var(--warn)"/><circle cx="${X(23)}" cy="${Y(31)}" r="4" style="fill:var(--accent)"/>
</svg>
      <figcaption>Indicative curves, not measured data: a desert day peaking at 42 °C at 2 pm, and the inside face of a 300 mm earth wall peaking around 11 pm, when the house can be opened to the night.</figcaption></figure>`;
  }
  const QZ = (qs) => `<div class="pl-quiz" data-readquiz>${qs.map(([q, o], i) => `<div class="pl-q" data-q="${i}"><p>${i + 1}. ${esc(q)}</p><div class="opts">${o.map((x, j) => `<button type="button" data-ra="${j}">${esc(x)}</button>`).join("")}</div></div>`).join("")}</div>`;
  function lessonThermal() {
    return `
      <h2 id="s1">A climate of big swings</h2>
      <p>On the Iranian plateau, in the Nile valley outside Cairo or in the Gulf's interior, a summer afternoon can be above 40 °C and the hour before dawn in the low 20s. Clear skies let the ground lose heat to the night sky quickly, and dry air holds little heat of its own. A swing of 15 K or more in a day is common.</p>
      <p>A house that simply followed the outdoor air would be unbearable at 3 pm and chilly at 5 am. Thermal mass lets the house live closer to the day's average than its extremes.</p>
      <h2 id="s2">What mass does: store, delay, flatten</h2>
      <p>Earth, stone and brick take a lot of heat to warm up. When sun and hot air strike a thick wall, the heat soaks in slowly, layer by layer. Two things follow.</p>
      <ul><li><b>Delay (time lag).</b> The peak reaches the inside face hours after the outdoor peak. For 300 mm of earth it is in the region of 8 to 10 hours, so the afternoon's heat arrives inside late in the evening, when the house can be opened up.</li>
      <li><b>Flattening (decrement).</b> The inside swing is far smaller than the outside one. A thick wall passes on only a fraction of it.</li></ul>
      ${chart()}
      <div class="key"><b>Key idea</b>Mass doesn't make cold. It moves heat in time. You still need somewhere to put that heat at night: the clear sky and the cool night air.</div>
      <h2 id="s3">The court as a reservoir of cool air</h2>
      <p>At night the court's floor and walls radiate heat to the clear sky. Cool air is heavier than warm air, so it settles into the court and spills into the rooms around it, carrying away the heat the walls took in during the day. By morning the walls and floor are cool, and they spend the day absorbing heat from the rooms.</p>
      <p>The court's proportions matter. A deep, narrow court stays shaded for most of the day, so the pool of cool air survives into the afternoon. Trees, a pool or a fountain add shade and evaporative cooling. In many houses the family moved with the sun: the shaded iwan or talar on summer afternoons, the roof for sleeping on summer nights.</p>
      <div class="key site"><b>On site</b>Visit a courtyard house on a hot afternoon and put your hand on an inside wall. It is usually noticeably cooler than the air.</div>
      <h2 id="s4">Pairing mass with night ventilation</h2>
      <p>Mass only helps if it is cooled every night. That needs openings that close by day (heavy doors, shutters, screens) and open at night, and paths for the air: from the court, through the rooms, and up stairwells or wind catchers. A wind catcher (badgir, malqaf) can bring night air down into the rooms; on still nights it works as a chimney, drawing warm air up and out.</p>
      <p>The rule the house follows is short: <b>closed and shaded by day, open and flushed by night.</b></p>
      <h2 id="s5">Rules of thumb</h2>
      <div class="pl-tbl"><table><thead><tr><th>Wall</th><th>Thickness</th><th>Indicative time lag</th></tr></thead><tbody>
        <tr><td>Rammed earth</td><td>400 mm</td><td>10–12 h</td></tr><tr><td>Adobe (mud brick)</td><td>300 mm</td><td>8–10 h</td></tr><tr><td>Solid fired brick</td><td>220 mm</td><td>about 6 h</td></tr><tr><td>Lightweight timber frame</td><td>150 mm</td><td>under 2 h</td></tr></tbody></table></div>
      <p class="fine">Indicative ranges only. Real figures depend on density, moisture and finishes; check them against your own sources before using them in a design.</p>
      <h2 id="s6">When mass works against you</h2>
      <ul><li><b>Humid climates with small daily swings.</b> If nights stay near 30 °C, the walls never lose the day's heat. Vernacular houses there favour shade and constant air movement over mass.</li>
      <li><b>Mass that is never flushed.</b> A heavy room kept shut at night simply stores heat and gives it back.</li>
      <li><b>Winter in the same deserts.</b> Here mass helps again, storing the low winter sun let in through the court.</li></ul>
      <h2 id="s7">For your client</h2>
      <p>Three sentences you could say on 6 November:</p>
      <ul class="say"><li>“The thick walls don't keep the heat out for ever; they hold it back until night, when we let it go.”</li><li>“Every night the court fills with cool air, and the shade keeps it there through the morning.”</li><li>“The house has one rule: closed by day, open by night.”</li></ul>
      <h2 id="s8">Check yourself</h2>
      ${QZ(QUIZ["Thermal mass"])}
      <div class="src"><p><b>From your Library.</b> Architecture for the Poor, Hassan Fathy (PDF): his account of building with mud brick at New Gourna. You're at p. 41.</p><p><b>From general knowledge.</b> The physics of time lag and night ventilation, and the indicative figures above, come from the model's general knowledge, not your sources. They're marked so you can check them.</p></div>`;
  }
  const OUTLINE = {
    "Daylight in deep courtyard plans": ["How much sky a deep court sees", "Light that bounces: floors, walls and the iwan", "Rooms two layers back from the court", "Glare at the court's edge", "What to show the client"],
    "Mashrabiya: screens that shade and ventilate": ["What a mashrabiya is", "Shade without darkness", "Air through the lattice", "Privacy and the view out", "Modern versions, and where they fail"],
    "The four-iwan plan, read in depth": ["Origins in Iranian architecture", "The court as the plan's centre", "The qibla iwan and the prayer hall", "Madrasas, caravanserais and houses", "Reading a four-iwan plan on site"],
  };
  function openRead(b) {
    hidePop(); closeDlg();
    S.view = "read"; S.readId = b.id;
    const t = track(b.tr), thermal = /^Thermal mass/.test(b.title);
    const secs = thermal ? ["A climate of big swings", "What mass does", "The court as a reservoir", "Night ventilation", "Rules of thumb", "When mass works against you", "For your client", "Check yourself"] : [];
    main().innerHTML = `<div class="pl-read"><div class="pl-read-bar"><button class="pl-linkbtn" type="button" data-back>‹ Today</button><span>Reading Lumen · ${t ? `${esc(t.name)} › ${esc(b.topic)}` : ""}</span><span class="grow"></span><button class="button button-quiet" type="button" data-askpage style="min-height:0;padding:5px 10px;font-size:12.5px">${I.spark}Ask about this page</button><div class="pl-prog" aria-hidden="true"><i></i></div></div>
      <article class="pl-art" aria-labelledby="pl-rt"><p class="kick"><span class="pl-kind" data-tr="${t ? t.tr : "a"}">Read</span><span>${thermal ? "12 min read" : `${len(b.m)} read`} · made for you ${b.made === "ready" ? "last night" : "this evening"} from your map${thermal ? " and one Library item" : ""}</span></p>
        <h1 id="pl-rt">${esc(b.title)}</h1>${thermal ? '<p class="q">Why do thick earth walls keep a courtyard house cool, and when do they stop working?</p>' : ""}
        <p class="by">Planned for ${dayLong(b.d)} at ${hm(b.s)} · ${len(b.m)}${b.also ? ` · counts for ${esc(track(b.also)?.name || "")} too` : ""}</p>
        <div data-body>${thermal ? lessonThermal() : ""}</div>
        <div class="done-row"><p>${b.st === "done" ? `Done · ${esc(b.res || "")}` : "When you finish, it's ticked on your calendar and your quiz answers shape next week's plan."}</p><button class="button" type="button" data-readdone>${b.st === "done" ? "Back to Today" : "Done reading"}</button></div>
      </article>
      ${thermal ? `<nav class="pl-toc" aria-label="On this page"><b>On this page</b>${secs.map((s, i) => `<a href="#s${i + 1}" data-toc="s${i + 1}">${esc(s)}</a>`).join("")}<p class="pl-note"><span class="av" aria-hidden="true">S</span><span>A reading Lumen is a long lesson page: text, figures, a table and a quiz, written the evening before.</span></p></nav>` : "<div></div>"}</div>`;
    main().scrollTop = 0;
    S.readQuiz = { right: 0, n: 0 };
    if (!thermal) writeLesson(b);
  }
  async function writeLesson(b) {
    const body = $("[data-body]", root); const my = S.readId;
    const outline = OUTLINE[b.title] || ["What it is", "How it works", "Where it goes wrong", "On site", "For your work"];
    if (!S.ai) {
      body.innerHTML = `<p class="q">${esc(b.why || "")}</p>${outline.map((h) => `<h2>${esc(h)}</h2><p class="fine">This section is written the evening before the session.</p>`).join("")}<p class="fine">In this prototype only “Thermal mass in hot-arid courtyard houses” is written out in full. When this page may use Claude, any other reading Lumen is written here as you open it.</p>`;
      return;
    }
    body.innerHTML = '<p class="writing"><span class="lx-dot" aria-hidden="true"></span>Writing the lesson…</p>';
    const t = track(b.tr);
    const prompt = `Write a reading lesson for Studiolo, a learning app, for an architect learning climate-responsive design and Islamic architecture.\nTitle: ${b.title}\nTopic: ${t?.name} › ${b.topic}\nLength: about ${b.m} minutes of reading (around ${b.m * 120} words).\nSections, in order: ${outline.join("; ")}.\nOutput JSON Lines only, one object per line, no code fences:\n{"h2":"section heading"}\n{"p":"a paragraph, plain and concrete, 50–110 words"}\n{"key":"one key idea in one or two sentences"}\n{"list":["item","item","item"]}\n{"table":{"head":["…","…"],"rows":[["…","…"]]}}  at most one table\n{"quiz":{"q":"question","options":["…","…","…"],"answer":0,"why":"one sentence"}}  exactly 3, at the end\nNever invent quotations, page numbers or precise statistics; when a figure is approximate, say so.`;
    let pend = "", first = true;
    const add = (o) => {
      if (S.readId !== my) return; if (first) { body.innerHTML = ""; first = false; }
      if (o.h2) body.insertAdjacentHTML("beforeend", `<h2>${esc(o.h2)}</h2>`);
      if (o.p) body.insertAdjacentHTML("beforeend", `<p>${esc(o.p)}</p>`);
      if (o.key) body.insertAdjacentHTML("beforeend", `<div class="key"><b>Key idea</b>${esc(o.key)}</div>`);
      if (Array.isArray(o.list)) body.insertAdjacentHTML("beforeend", `<ul>${o.list.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`);
      if (o.table?.head) body.insertAdjacentHTML("beforeend", `<div class="pl-tbl"><table><thead><tr>${o.table.head.map((x) => `<th>${esc(x)}</th>`).join("")}</tr></thead><tbody>${(o.table.rows || []).map((r) => `<tr>${r.map((x) => `<td>${esc(x)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      if (o.quiz?.q && Array.isArray(o.quiz.options)) { S.readQs = S.readQs || []; S.readQs.push([o.quiz.q, o.quiz.options, +o.quiz.answer || 0, o.quiz.why || ""]); const i = S.readQs.length - 1; if (!$("[data-readquiz]", body)) body.insertAdjacentHTML("beforeend", '<h2>Check yourself</h2><div class="pl-quiz" data-readquiz></div>'); $("[data-readquiz]", body).insertAdjacentHTML("beforeend", `<div class="pl-q" data-q="${i}"><p>${i + 1}. ${esc(o.quiz.q)}</p><div class="opts">${o.quiz.options.map((x, j) => `<button type="button" data-ra="${j}">${esc(x)}</button>`).join("")}</div></div>`); }
    };
    S.readQs = [];
    const eat = (l) => { l = l.trim().replace(/^```\w*|```$/g, "").trim(); if (!l.startsWith("{")) return; try { add(JSON.parse(l)); } catch { /* skip a broken line */ } };
    try {
      let seen = 0;
      await S.ai(prompt, { modelTier: "default", cache: false, onText: ({ text }) => { const ls = text.split("\n"); pend = ls.pop(); for (; seen < ls.length; seen++) eat(ls[seen]); } });
      eat(pend);
      if (S.readId === my) body.insertAdjacentHTML("beforeend", '<div class="src"><p><b>From general knowledge.</b> This lesson was written by Claude from general knowledge, not your sources. Check figures before using them in a design.</p></div>');
    } catch (e) {
      if (S.readId !== my) return;
      if (["not_granted", "sampling_disabled"].includes(e?.code)) { S.ai = null; aiBadge(); }
      body.innerHTML = `${outline.map((h) => `<h2>${esc(h)}</h2><p class="fine">This section is written the evening before the session.</p>`).join("")}<p class="fine">The lesson couldn't be written just now${e?.code === "rate_limited" ? " (Claude is busy for you; try again in a minute)" : ""}.</p>`;
    }
  }
  function leaveRead() { S.view = "day"; S.sel = S.now.d; S.readId = null; renderDay(); main().scrollTop = 0; }
  function readQuizAnswer(btn) {
    if (btn.disabled) return;
    const b = blockById(S.readId); const q = btn.closest("[data-q]"); const qi = +q.dataset.q;
    const qs = /^Thermal mass/.test(b?.title || "") ? QUIZ["Thermal mass"] : S.readQs || [];
    const [, , ok, why] = qs[qi] || []; if (ok == null) return;
    const good = +btn.dataset.ra === ok;
    $$("[data-ra]", q).forEach((x) => { x.disabled = true; if (+x.dataset.ra === ok) x.classList.add("ok"); });
    if (!good) btn.classList.add("no");
    S.readQuiz.right += good; S.readQuiz.n++;
    q.insertAdjacentHTML("beforeend", `<p class="why">${good ? "Right." : "Not quite."} ${esc(why)}</p>`);
  }

  /* ================================================================ learning time, and the simulations */
  function openLT() {
    const rows = [["Weekdays", AVAIL[0]], ["Saturday", AVAIL[5]], ["Sunday", AVAIL[6]]];
    openDlg(`<h3>Learning time</h3><p class="sub">When the copilot may plan sessions. You can still move any session anywhere by hand.</p>
      <div class="pl-lt">${rows.map(([n, ws]) => `<div class="pl-lt-row"><span>${n}</span><span class="slots">${ws.map(([a, e]) => `<i>${hm(a)}–${hm(e)}</i>`).join("")}</span></div>`).join("")}
        <div class="pl-lt-row"><span>Each day</span><span><label for="pl-max">At most <select id="pl-max">${[60, 90, 120].map((m) => `<option value="${m}"${m === S.maxDay ? " selected" : ""}>${len(m)}</option>`).join("")}</select></label></span></div>
        <label><input type="checkbox" id="pl-cal"${S.calOn ? " checked" : ""}><span>Plan around busy times in my calendar<small>Google Calendar, connected (simulated). Studiolo reads only busy and free, never event titles.</small></span></label>
        <label><input type="checkbox" id="pl-auto"${S.autoMove ? " checked" : ""}><span>When something new lands on a session, move the session to the next free time<small>Otherwise the session stays and is marked as clashing.</small></span></label></div>
      <div class="acts"><button class="button" type="button" data-dx>Done</button></div>`);
    dlg.addEventListener("change", (e) => {
      if (e.target.id === "pl-max") S.maxDay = +e.target.value;
      if (e.target.id === "pl-cal") S.calOn = e.target.checked;
      if (e.target.id === "pl-auto") S.autoMove = e.target.checked;
      render();
    });
  }
  function simMeeting() {
    const w = Math.floor(S.now.d / 7), d = w * 7 + 3;
    if (S.meeting || S.now.d > d || (S.now.d === d && S.now.m > 1125)) return toast("Already past", "Thursday evening has passed in this simulation. Start again to try it.");
    S.meeting = true;
    const z = { d, s: 1125, e: 1200, isNew: true }; S.busy.push(z);
    setTimeout(() => delete z.isNew, 1800);
    const hit = S.blocks.filter((b) => b.d === d && b.st === "planned" && overlaps(b.s, b.s + b.m, z.s, z.e));
    const moved = [];
    for (const b of hit) {
      if (!S.autoMove) { b.why = "Clashes with something new in your calendar"; continue; }
      const p = place(b.m, { d0: d, d1: w * 7 + 13, prefD: d, prefS: z.e }, S.blocks, [b.id]);
      if (p) { const from = hm(b.s); Object.assign(b, { d: p.d, s: p.s, why: `Moved from ${DN[wd(d)]} ${from}: something new landed in your calendar` }); moved.push(`${b.title} → ${dayRel(p.d)} ${hm(p.s)}`); }
    }
    if (moved.length) S.notes.push({ d: S.now.d, text: `Something new is busy on Thursday 18:45–20:00, so <b>${esc(hit[0].title)}</b> moved to ${esc(moved[0].split(" → ")[1])}.` });
    S.view = "week"; S.wk = w; flash(hit.map((b) => b.id)); render();
    toast("Your calendar changed", hit.length ? (S.autoMove ? `Thursday 18:45–20:00 is now busy. ${moved.join("; ")}.` : "Thursday 18:45–20:00 is now busy. The session there is marked as clashing.") : "Thursday 18:45–20:00 is now busy. Nothing planned was in the way.");
  }
  function skipToSunday() {
    const w = Math.floor(S.now.d / 7), sun = w * 7 + 6;
    if (S.now.d >= sun) return toast("It's already Sunday", "Start again to replay the week.");
    S.now = { d: sun, m: 1045 };
    let done = 0, missed = 0;
    for (const b of S.blocks) {
      if (!(b.st === "planned" || b.st === "started") || b.kind === "plan" || !isPast(b.d, b.s + b.m)) continue;
      if (b.id === "b10") { b.st = "skipped"; b.why = "Missed on Friday"; missed++; continue; }
      if (b.id === "b7" && b.score == null) { b.score = 1; b.res = "Read · 1 of 3 on the first try"; }
      if (b.id === "b6") b.res = "Watched · 3 of 3 on the quiz";
      if (b.id === "b5") { b.res = "Watched"; delete b.prog; }
      b.st = "done"; b.res = b.res && !/^Paused/.test(b.res) ? b.res : b.kind === "review" ? "4 of 4 right" : b.kind === "live" ? "12 min live · 3 questions asked" : "Done"; done++;
    }
    S.skipped = true; S.sel = sun;
    S.notes.push({ d: sun, text: "Your weekly plan is next. It takes about ten minutes, and nothing changes until you apply it." });
    if (S.view === "read") S.view = "day";
    render();
    toast("It's Sunday, 17:25", `The rest of the week played out: ${done} sessions done, ${missed} missed. Next up is planning next week.`);
  }

  /* ================================================================ toast and badge */
  function toast(title, body, undo) {
    $$(".vtoasts.pl-t").forEach((t) => t.remove());
    const h = document.createElement("div"); h.className = "vtoasts start pl-t"; h.setAttribute("role", "status");
    h.style.cssText = "bottom:calc(76px + env(safe-area-inset-bottom, 0px));left:calc(var(--t-rail) + 16px)";
    h.innerHTML = `<div class="vtoast"><b>${esc(title)}</b><button class="icb" aria-label="Dismiss" type="button" data-tx>×</button><p>${esc(body)}${undo ? ' <button class="pl-linkbtn vtoast-action" type="button" data-tundo>Undo</button>' : ""}</p></div>`;
    h.addEventListener("click", (e) => { if (e.target.closest("[data-tundo]")) { undo(); h.remove(); } else if (e.target.closest("[data-tx]")) h.remove(); });
    document.body.appendChild(h); setTimeout(() => h.remove(), 9000);
  }
  function aiBadge() {
    const t = S.ai ? "Plans written by Claude" : "Scripted answers";
    const el = $("#pl-ai"); if (el) { el.dataset.on = String(!!S.ai); el.textContent = S.ai ? "Copilot: Claude writes the plans" : "Copilot: scripted sample"; }
    const e2 = $("#pl-ai2", cpw); if (e2) e2.textContent = t;
  }

  /* ================================================================ events */
  root.addEventListener("click", (e) => {
    const t = e.target;
    if (Date.now() - (S.dragAt || 0) < 350) return;
    const a = t.closest("a[href]");
    if (a && !a.matches("[data-toc], [data-open], [data-start]")) {
      e.preventDefault();
      const href = a.getAttribute("href");
      if (href === "/today") { if (S.view === "read") leaveRead(); else { S.view = "day"; S.sel = S.now.d; render(); } return; }
      if (/^\/(learn|library|graph)|capture/.test(href)) return toast("Not in this prototype", "This prototype covers Today. Learn, Live covers Lumens and live sessions.");
      return;
    }
    const tg = t.closest(".theme-toggle"); if (tg) { const el = document.documentElement; const dark = el.dataset.theme ? el.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; el.dataset.theme = dark ? "light" : "dark"; return; }
    const v = t.closest("[data-view]"); if (v) { S.view = v.dataset.view; S.wk = Math.floor(S.now.d / 7); S.sel = S.now.d; return render(); }
    if (t.closest("[data-copilot]")) return openPanel();
    if (t.closest("[data-lt]")) return openLT();
    const sel = t.closest("[data-sel]"); if (sel) { S.sel = +sel.dataset.sel; S.view = "day"; if (Math.floor(S.sel / 7) !== Math.floor(S.now.d / 7)) { S.view = "week"; S.wk = Math.floor(S.sel / 7); } return render(); }
    const wkb = t.closest("[data-wk]"); if (wkb) { S.wk = Math.min(1, Math.max(0, S.wk + +wkb.dataset.wk)); return render(); }
    const st = t.closest("[data-start]"); if (st) { e.preventDefault(); return start(st.dataset.start); }
    const op = t.closest("[data-open]"); if (op) { e.preventDefault(); const el = $(`.pl-b[data-b="${op.dataset.open}"]`, root); return el ? showPop(op.dataset.open, el) : start(op.dataset.open); }
    const mv = t.closest("[data-movenext]"); if (mv) return moveNext(mv.dataset.movenext);
    const sk = t.closest("[data-skip]"); if (sk) return skip(sk.dataset.skip);
    if (t.closest("[data-back]")) return leaveRead();
    if (t.closest("[data-askpage]")) { openPanelKeepView(); addMsg("ai", "<p>Ask me anything about this page. I can also add a review of it to your plan, or move the rest of today's sessions if this one runs long.</p>"); return; }
    const ra = t.closest("[data-ra]"); if (ra) return readQuizAnswer(ra);
    if (t.closest("[data-readdone]")) {
      const b = blockById(S.readId);
      if (b && b.st !== "done") { const qn = (/^Thermal mass/.test(b.title) ? 3 : (S.readQs || []).length); const sc = S.readQuiz.n ? S.readQuiz.right : null; Object.assign(b, { st: "done", res: sc != null ? `Read · ${sc} of ${qn} on the first try` : "Read to the end", score: sc ?? b.score }); leaveRead(); toast("Done", `${b.title}. It's ticked on your calendar${sc != null ? `, and your quiz answers (${sc} of ${qn}) go into next week's plan` : ""}.`); }
      else leaveRead();
      return;
    }
    const toc = t.closest("[data-toc]"); if (toc) { e.preventDefault(); $(`#${toc.dataset.toc}`, root)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); return; }
    const blk = t.closest(".pl-b"); if (blk && !blk.classList.contains("is-drag")) { if (popEl && popEl.dataset.for === blk.dataset.b) return hidePop(); showPop(blk.dataset.b, blk, !!blk.dataset.ghost); if (popEl) popEl.dataset.for = blk.dataset.b; return; }
  });
  function openPanelKeepView() { S.panel = true; cpw.hidden = false; document.documentElement.classList.add("pl-on"); }
  root.addEventListener("pointerdown", (e) => { const el = e.target.closest(".pl-col .pl-b"); if (el) dragStart(e, el); });
  window.addEventListener("pointermove", dragMove);
  window.addEventListener("pointerup", dragEnd);
  window.addEventListener("pointercancel", () => { if (drag) { drag = null; render(); } });
  root.addEventListener("scroll", (e) => {
    if (S.view !== "read" || e.target !== main()) return;
    const m = main(), p = m.scrollTop / Math.max(1, m.scrollHeight - m.clientHeight);
    const bar = $(".pl-read-bar .pl-prog i", root); if (bar) bar.style.width = `${Math.min(100, p * 100)}%`;
    let on = null; $$(".pl-art h2[id]", root).forEach((h) => { if (h.getBoundingClientRect().top < 140) on = h.id; });
    $$("[data-toc]", root).forEach((a) => a.classList.toggle("is-on", a.dataset.toc === on));
  }, true);

  document.addEventListener("click", (e) => {
    if (!popEl) return;
    const t = e.target;
    if (popEl.contains(t)) {
      if (t.closest("[data-px]")) return hidePop();
      const s = t.closest("[data-start]"); if (s) return start(s.dataset.start);
      const m = t.closest("[data-movenext]"); if (m) return moveNext(m.dataset.movenext);
      const k = t.closest("[data-skip]"); if (k) return skip(k.dataset.skip);
      const r = t.closest("[data-remove]"); if (r) return removeB(r.dataset.remove);
      const l = t.closest("[data-leave]"); if (l && S.card) { const id = l.dataset.leave; S.card.ops.forEach((o) => { if ((o.type === "add" && o.nb.id === id) || (o.type === "move" && o.id === id)) o.on = false; }); refreshCard(S.card); return render(); }
      return;
    }
    if (!t.closest(".pl-b, [data-open]")) hidePop();
  });
  cpw.addEventListener("click", (e) => {
    const t = e.target;
    if (t.closest("[data-cpx]")) return closePanel();
    const p = t.closest("[data-say]"); if (p) return send(p.dataset.say);
    const ap = t.closest("[data-apply]"); if (ap) return applyCard(ap.dataset.apply);
    const di = t.closest("[data-dismiss]"); if (di) { const c = S.cards.find((x) => x.id === di.dataset.dismiss); if (c) { c.state = "dismissed"; S.card = null; refreshCard(c); render(); } return; }
    const un = t.closest("[data-undo]"); if (un) return undoCard(un.dataset.undo);
    const sw = t.closest("[data-showwk]"); if (sw) { S.view = "week"; S.wk = +sw.dataset.showwk; return render(); }
  });
  cpw.addEventListener("change", (e) => {
    const cb = e.target.closest("[data-op]"); if (!cb || !S.card) return;
    const c = S.cards.find((x) => x.id === cb.closest("[data-card]").dataset.card); if (!c || c.state !== "pending") return;
    c.ops[+cb.dataset.op].on = cb.checked; refreshCard(c); render();
    $(`[data-card="${c.id}"] [data-op="${cb.dataset.op}"]`, cpw)?.focus();
  });
  $("form", cpw).addEventListener("submit", (e) => { e.preventDefault(); send(input.value); });
  input.addEventListener("input", () => { sendBtn.disabled = !input.value.trim() || S.busyAI; });
  input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input.value); } });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { if (dlg) closeDlg(); else if (popEl) hidePop(); } });

  /* ================================================================ prototype bar */
  const bar = document.createElement("nav");
  bar.className = "td-proto pl-proto"; bar.setAttribute("aria-label", "Prototype");
  bar.innerHTML = '<div class="row"><b>Prototype · planning</b><button type="button" id="pl-how" aria-expanded="false">How to try it</button><button type="button" id="pl-meet">A meeting lands on Thursday</button><button type="button" id="pl-sun">Skip to Sunday</button><button type="button" id="pl-restart">Start again</button><span class="ai" id="pl-ai">Checking for Claude…</span></div><p class="hint" hidden>Open <b>Plan with the copilot</b> and try the suggestions: plan the rest of the week, a client presentation on 6 November (a goal across two topics), a lighter Saturday, then next week. Changes show as dashed ghosts until you apply them. Drag sessions on the week; click one to start it. <b>A meeting lands on Thursday</b> shows sessions moving around a new busy time. <b>Skip to Sunday</b> plays the week out so you can plan next week from what happened. The 19:00 reading Lumen today is a full lesson.</p>';
  document.body.appendChild(bar);
  $("#pl-restart", bar).addEventListener("click", () => location.reload());
  $("#pl-meet", bar).addEventListener("click", simMeeting);
  $("#pl-sun", bar).addEventListener("click", skipToSunday);
  $("#pl-how", bar).addEventListener("click", (e) => { const h = $(".hint", bar); h.hidden = !h.hidden; e.currentTarget.setAttribute("aria-expanded", String(!h.hidden)); });

  shell(); prompts(); greet(); aiBadge(); render();
  (async () => { try { S.ai = window.claude ? await window.claude.use("sample") : null; } catch { S.ai = null; } aiBadge(); })();
})();
