/* Learn on a phone: Home · Lumens · Courses, and a Lumen's room in each format.
   - Home: the bar is the make field (choose Watch, Listen, Read or ● Live above it), what's being made, pick up where you
     left off, next for your goals. Lumens: the full list, by format, state and day. Courses: each course with its parts.
   - A Lumen opens in a room that keeps the bar (ask the hosts, ask about this slide): one pinned switcher,
     Watch · Listen · Read | ● Live, and each format's own body: a video stage with transcript and slides, an audio player
     with chapters, marks, Walk and Drive, or an article with sections and a Check yourself.
   - A course opens in the same room, with its parts, Up next and the Parts sheet.
   Labels are the app's (learn-home.tsx, course-*.tsx, player/) and the Learn slice 2 prototype's (../learn-lumens). */
"use strict";
(() => {
  const L = { tab: "home", ff: "all", st: "all", group: "date", makeFmt: "watch", room: null, marks: [] };
  const ORDER = ["watch", "listen", "read"];
  const HINT = {
    watch: "Slides and a narrator · 2–6 min · ready in about a minute",
    listen: "Two voices · 10–30 min · starts playing in about 30 seconds",
    read: "A long read with diagrams · 8–15 min",
    live: "Talk it through now, slide by slide, and interrupt any time",
  };
  const HOST = { A: "Maya", B: "Sam", N: "Narrator" };
  const TODAY = Date.parse("2026-10-25T12:00:00");
  const M = () => window.MP;

  /* ---------- helpers ---------- */
  const lumen = (id) => M().S.lumens.find((l) => l.id === id);
  const course = (id) => M().D.courses.find((c) => c.id === id);
  const made = (l) => ORDER.filter((f) => l.formats?.[f] || f === l.format);
  const lenOf = (l, f) => (l.formats?.[f]?.min ?? (f === l.format ? l.min : M().FMT[f].len)) * 60;
  const stateOf = (l) => (l.progress >= 1 ? "watched" : l.progress > 0 ? "progress" : "new");
  const STATE_LABEL = { new: "New", progress: "In progress", watched: "Watched" };
  const dayOf = (l) => { const d = Math.round((TODAY - Date.parse(`${l.made || "2026-10-25"}T12:00:00`)) / 864e5); return d <= 0 ? "Today" : d === 1 ? "Yesterday" : d <= 6 ? "This week" : "Earlier"; };
  const dateLabel = (l) => { const d = new Date(`${l.made || "2026-10-25"}T12:00:00`); return `${d.getDate()} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]}`; };
  const topicName = (id) => M().T().get(id)?.name ?? "";
  const slidesOf = (l) => l.formats?.watch?.slides || ["The idea", "How it works", "An example", "On your site", "In one picture"];
  const chaptersOf = (l) => l.formats?.listen?.chapters || [["Why it matters", 0], ["How it works", 120], ["Examples", 300], ["Your site", 480]];
  const sectionsOf = (l) => l.formats?.read?.sections || ["The idea", "How it works", "Check yourself"];
  const linesOf = (l) => (l.lines?.length ? l.lines : [["N", 0, `Here is ${l.title.toLowerCase()}, from the beginning.`], ["N", 60, "We start with the idea, then an example you can draw from."]]);
  const lineAt = (l, pos) => { const ls = linesOf(l); let cur = ls[0]; for (const x of ls) if (x[1] <= pos) cur = x; return cur; };

  /* posters: Watch shows its title slide, Listen the two hosts on a dark cover, Read a paper title page */
  function poster(l, f = l.format, cls = "") {
    const { esc } = M();
    if (f === "listen") return `<span class="p-poster listen ${cls}" aria-hidden="true"><i>M</i><i>S</i></span>`;
    if (f === "read") return `<span class="p-poster read ${cls}" aria-hidden="true"><b>${esc(l.title)}</b></span>`;
    return `<span class="p-poster watch ${cls}" aria-hidden="true"><b>${esc(l.title)}</b></span>`;
  }
  function pills(l) {
    const { FMT } = M();
    return `<span class="p-pills">${ORDER.map((f) => made(l).includes(f) ? `<span class="p-pill" data-p="openfmt" data-id="${l.id}" data-f="${f}">${FMT[f].label} · ${Math.round(lenOf(l, f) / 60)} min</span>` : `<span class="p-pill is-add" data-p="addfmt" data-id="${l.id}" data-f="${f}">+ ${FMT[f].label}</span>`).join("")}</span>`;
  }

  /* ---------- the page ---------- */
  function html() {
    const { S, D, plural } = M();
    const ready = S.lumens.filter((l) => l.state === "ready");
    const tabs = [["home", "Home"], ["lumens", "Lumens"], ["courses", "Courses"]];
    return `<div class="m-page p-learn"><h1>Learn</h1>
      <p class="m-lede">${L.tab === "home" ? "Ask, pick up, and what’s next" : L.tab === "lumens" ? plural(ready.length, "Lumen") : plural(D.courses.length, "course")}</p>
      <div class="p-sticky"><div class="m-seg p-tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" role="tab" data-p="tab" data-t="${k}" aria-pressed="${L.tab === k}">${l}</button>`).join("")}</div></div>
      <div id="learnBody">${L.tab === "home" ? homeHtml() : L.tab === "lumens" ? lumensHtml() : coursesHtml()}</div></div>`;
  }

  function homeHtml() {
    const { S, D, esc, ic, FMT } = M(), T = M().T();
    const focus = S.topics.filter((t) => t.wantToLearn).slice(0, 3);
    const inprog = S.lumens.filter((l) => l.progress > 0 && l.progress < 1);
    const c1 = D.courses[0], ci = c1.parts.findIndex((p) => p.state === "playing");
    const s1 = D.live[0], sl = lumen(s1.lumen);
    return `
      <section class="p-make">
        <h2 class="p-q">What do you want to understand?</h2>
        <div class="p-fmts" role="group" aria-label="Format">${[...ORDER, "live"].map((f) => `<button type="button" data-p="mkfmt" data-f="${f}" aria-pressed="${L.makeFmt === f}" class="${f === "live" ? "is-live" : ""}">${f === "live" ? "Live" : FMT[f].label}</button>`).join("")}</div>
        <p class="p-hint">${HINT[L.makeFmt]}</p>
        <button class="p-ask" type="button" data-p="focusbar">${ic("spark", "sm")}<span>Type it in the bar below, or hold the mic and say it</span></button>
        <div class="p-starters">${focus.map((t) => `<button class="m-chip" type="button" data-p="starter" data-t="${t.id}">Explain ${esc(t.name)}</button>`).join("")}</div>
      </section>
      ${S.making ? `<h2>Being made</h2><div class="m-rows">${makingRow()}</div>` : ""}
      <h2>Pick up where you left off</h2>
      <div class="p-picks">
        ${inprog.map((l) => pickRow(l)).join("")}
        <div class="p-pick">${poster(lumen("l1"), "watch")}<div class="p-ptxt"><small>Course · Part ${ci} of ${c1.parts.length - 1}</small><b>${esc(c1.title)}</b><span>${esc(c1.parts[ci].title)} · paused at ${c1.parts[ci].at.split(" of ")[0]} · ${c1.parts.filter((p) => p.state === "watched").length} of ${c1.parts.length} watched</span>
          <span class="p-btns"><button class="m-btn is-primary" type="button" data-p="course" data-id="${c1.id}" data-k="${ci}">Continue</button></span></div></div>
        <div class="p-pick">${poster(sl, "watch")}<div class="p-ptxt"><small><i class="p-live"></i>Live session</small><b>${esc(sl.title)}</b><span>Stopped at slide ${s1.slide} of ${s1.slides} · ${s1.min} min live · Kept</span>
          <span class="p-btns"><button class="m-btn is-primary" type="button" data-p="live" data-id="${sl.id}">Resume live</button><button class="m-btn" type="button" data-p="openfmt" data-id="${sl.id}" data-f="watch">Play the Lumen</button></span></div></div>
      </div>
      <h2 class="p-h2row">Next for your goals <button type="button" data-p="tab" data-t="lumens">All Lumens →</button></h2>
      <p class="p-sub">From your courses and My Focus</p>
      <div class="p-goals">${D.goals.map((g) => `<div class="p-goal"><b>${esc(g.title)}</b>${g.due ? `<small>${esc(g.due)}</small>` : ""}
        ${g.steps.map(([k, a, b]) => {
          if (k === "resume") { const l = lumen(a); return `<div class="p-step">${ic(FMT[l.format].ic, "sm")}<span><b>${esc(l.title)}</b><small>${FMT[l.format].label} · ${Math.round(l.progress * 100)}% read</small></span><button class="m-btn" type="button" data-p="openfmt" data-id="${l.id}" data-f="${l.format}">Resume</button></div>`; }
          if (k === "make") return `<div class="p-step">${ic("spark", "sm")}<span><b>Make a Lumen on ${esc(a)}</b><small>Not made yet</small></span><button class="m-btn is-primary" type="button" data-p="starter" data-t="${M().S.topics.find((t) => t.name === a).id}">Make</button></div>`;
          const c = course(a), p = c.parts[b];
          return `<div class="p-step">${ic("watch", "sm")}<span><b>Part ${b}: ${esc(p.title)}</b><small>${p.state === "playing" ? `Paused at ${p.at.split(" of ")[0]}` : p.state === "ready" ? "Ready" : "Not made yet"}</small></span><button class="m-btn" type="button" data-p="course" data-id="${c.id}" data-k="${b}">${p.state === "playing" ? "Continue" : "Watch"} </button></div>`;
        }).join("")}</div>`).join("")}</div>`;
  }
  function pickRow(l) {
    const { esc, FMT, mmss } = M();
    const f = l.format, len = lenOf(l, f), at = Math.round(l.progress * len);
    const line = f === "read" ? `${Math.round(l.progress * 100)}% read · ${sectionsOf(l)[Math.min(sectionsOf(l).length - 1, Math.floor(l.progress * sectionsOf(l).length))]}` : f === "listen" ? `Chapter ${chapterIndex(l, at) + 1} of ${chaptersOf(l).length} · paused at ${mmss(at)} of ${mmss(len)}` : `Paused at ${mmss(at)} of ${mmss(len)}`;
    return `<div class="p-pick">${poster(l, f)}<div class="p-ptxt"><small>${FMT[f].label} · ${esc(topicName(l.topic))}</small><b>${esc(l.title)}</b><span>${line}</span>
      <span class="p-btns"><button class="m-btn is-primary" type="button" data-p="openfmt" data-id="${l.id}" data-f="${f}">Resume</button>${f === "listen" ? `<button class="m-btn" type="button" data-p="drive" data-id="${l.id}">Drive edition</button>` : f === "watch" ? `<button class="m-btn" type="button" data-p="live" data-id="${l.id}">Go live</button>` : ""}</span></div></div>`;
  }
  function makingRow() {
    const { S, esc, ic, FMT } = M(), m = S.making;
    return `<div class="m-row p-makingrow" role="status">${ic(FMT[m.format].ic, "sm")}<span class="m-txt"><b>${esc(m.title)}</b><small id="mkStep">${esc(stepOf(m))}</small><span class="p-mkbar"><i style="width:${Math.round(m.progress * 100)}%"></i></span></span></div>`;
  }
  function stepOf(m) {
    const p = m.progress;
    if (p >= 1) return "Ready";
    if (m.format === "watch") return p < 0.15 ? "Reading the source" : p < 0.3 ? "Planning the story" : p < 0.75 ? `Writing slide ${Math.ceil((p - 0.3) / 0.09)} of 5` : `Recording voice, ${Math.ceil((p - 0.75) / 0.028)} of 9 lines`;
    if (m.format === "listen") return p < 0.2 ? "Planning six chapters" : p < 0.45 ? "Writing chapter 1 of 6" : "Chapter 1 is ready to play · writing the rest";
    return p < 0.25 ? "Reading your sources" : `Writing section ${Math.min(5, Math.ceil((p - 0.25) / 0.15))} of 5`;
  }

  function lumensHtml() {
    const { S, D, esc, ic, FMT, plural } = M();
    const chips = [["all", "All"], ["watch", "Watch"], ["listen", "Listen"], ["read", "Read"], ["livesessions", "Live sessions"]];
    const head = `<div class="p-chiprow">${chips.map(([k, l]) => `<button class="m-chip p-fchip" type="button" data-p="ff" data-f="${k}" aria-pressed="${L.ff === k}">${k === "livesessions" ? `<i class="p-live"></i>` : k !== "all" ? ic(FMT[k].ic, "xs") : ""}${l}</button>`).join("")}</div>`;
    if (L.ff === "livesessions") {
      return `${head}<div class="m-rows p-list">${D.live.map((s) => { const l = lumen(s.lumen); return `<div class="p-lrow">${poster(l, "watch")}<div class="p-ltxt"><b>${esc(l.title)}</b><small>Stopped at slide ${s.slide} of ${s.slides} · ${s.min} min live</small><small>${s.kept ? "Kept" : "Not kept"} · Resumable for ${s.days} more days</small>
        <span class="p-btns"><button class="m-btn is-primary" type="button" data-p="live" data-id="${l.id}">Resume</button><button class="m-btn" type="button" data-p="openfmt" data-id="${l.id}" data-f="watch">Play the Lumen</button></span></div></div>`; }).join("")}</div>`;
    }
    const list = S.lumens.filter((l) => l.state === "ready" && (L.ff === "all" || made(l).includes(L.ff)) && (L.st === "all" || stateOf(l) === L.st));
    const groups = new Map();
    list.forEach((l) => { const g = L.group === "date" ? dayOf(l) : M().T().get(M().areaOf(l.topic))?.name || "Your map"; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(l); });
    const order = L.group === "date" ? ["Today", "Yesterday", "This week", "Earlier"] : [...groups.keys()].sort();
    return `${head}
      <div class="p-tools"><div class="m-seg p-states">${[["all", "All"], ["new", "New"], ["progress", "In progress"], ["watched", "Watched"]].map(([k, l]) => `<button type="button" data-p="st" data-s="${k}" aria-pressed="${L.st === k}">${l}</button>`).join("")}</div>
        <button class="m-btn p-group" type="button" data-p="group">${L.group === "date" ? "By date" : "By topic"}${ic("down", "xs")}</button></div>
      ${list.length ? order.filter((g) => groups.has(g)).map((g) => `<h2>${esc(g)}</h2><div class="p-list">${groups.get(g).map(lumenRow).join("")}</div>`).join("") : `<p class="p-empty">No Lumens match. <button class="m-btn" type="button" data-p="clear">Clear filters</button></p>`}
      <p class="p-count">${plural(list.length, "Lumen")}</p>`;
  }
  function lumenRow(l) {
    const { esc } = M(), st = stateOf(l);
    return `<div class="p-lrow" data-p="openfmt" data-id="${l.id}" data-f="${l.format}" role="button" tabindex="0">${poster(l)}${st === "progress" ? `<span class="p-prog"><i style="width:${l.progress * 100}%"></i></span>` : ""}<div class="p-ltxt">
      <b>${esc(l.title)}</b><small>${esc(topicName(l.topic))} · ${dateLabel(l)}${st === "new" ? ` · <em class="p-new">New</em>` : st === "watched" ? " · Watched" : ""}</small>${pills(l)}</div>
      <button class="m-ib p-more" type="button" data-p="lmenu" data-id="${l.id}" aria-label="More for ${esc(l.title)}">${M().ic("more", "sm")}</button></div>`;
  }

  function coursesHtml() {
    const { D, esc, ic } = M();
    return `<div class="p-courses">${D.courses.map((c, ci) => {
      const watched = c.parts.filter((p) => p.state === "watched").length, now = Math.max(0, c.parts.findIndex((p) => p.state === "playing" || p.state === "ready" || p.state === "unmade"));
      const btn = watched === c.parts.length ? "Watch again" : watched || c.parts[now].state === "playing" ? `Continue: Part ${now}` : `Start: ${c.parts[0].title}`;
      const open = L.open === c.id;
      return `<article class="p-course"><div class="p-cposter">${poster({ title: c.title }, "watch", "big")}<span class="p-badge">Course · ${c.parts.length} parts</span></div>
        <div class="p-ctxt"><small>${esc(topicName(c.topic))}</small><b>${esc(c.title)}</b><span>${watched} of ${c.parts.length} watched</span>
          <span class="p-strip">${c.parts.map((p) => `<i class="${p.state}"></i>`).join("")}</span>
          <span class="p-btns"><button class="m-btn is-primary" type="button" data-p="course" data-id="${c.id}" data-k="${now}">${btn}</button><button class="m-ib" type="button" data-p="cmenu" data-id="${c.id}" aria-label="More for ${esc(c.title)}">${ic("more", "sm")}</button></span></div>
        <ol class="p-outline">${c.parts.slice(0, open ? 99 : 4).map((p, k) => `<li class="${p.state}"><button type="button" data-p="course" data-id="${c.id}" data-k="${k}"><span class="p-mark">${p.state === "watched" ? ic("check", "xs") : p.state === "playing" ? ic("play", "xs") : ""}</span><span>Part ${k}: ${esc(p.title)}</span><small>${partLabel(p)}</small></button></li>`).join("")}</ol>
        ${c.parts.length > 4 ? `<button class="p-moreparts" type="button" data-p="expand" data-id="${c.id}">${open ? "Fewer parts" : `+ ${c.parts.length - 4} more parts`}</button>` : ""}</article>`;
    }).join("")}</div>`;
  }
  const partLabel = (p) => p.state === "watched" ? "Watched" : p.state === "playing" ? `Playing · ${p.at}` : p.state === "ready" ? `Ready · ${p.min} min` : "Not made yet";

  /* ---------- the bar in Learn: it makes a Lumen ---------- */
  function placeholder() { return L.makeFmt === "live" ? "What should we talk through?" : "What do you want to understand?"; }
  function detect(q) {
    const s = q.toLowerCase();
    return M().S.topics.filter((t) => s.includes(t.name.toLowerCase())).sort((a, b) => b.name.length - a.name.length)[0] || null;
  }
  function barPanel(q) {
    const { esc, ic, FMT, S } = M();
    const t = q ? detect(q) : null;
    return `<div class="m-finds p-makepanel" data-keep>
      <div class="m-head">${L.makeFmt === "live" ? "Talk it through live" : "Make a Lumen"}</div>
      <div class="p-fmts small" data-keep>${[...ORDER, "live"].map((f) => `<button type="button" data-keep data-p="mkfmt" data-f="${f}" aria-pressed="${L.makeFmt === f}" class="${f === "live" ? "is-live" : ""}">${f === "live" ? "Live" : FMT[f].label}</button>`).join("")}</div>
      ${q ? `${t ? `<div class="p-in">In: <b>${esc(t.name)}</b></div>` : ""}<button type="button" class="is-first" data-p="make">${ic(L.makeFmt === "live" ? "chat" : FMT[L.makeFmt].ic, "sm")}<span class="m-txt"><b class="m-ask">${L.makeFmt === "live" ? "Start live session" : `Make a ${FMT[L.makeFmt].label}`}: “${esc(q)}”</b><small>${HINT[L.makeFmt]}</small></span>${ic("up", "sm")}</button>
        <button type="button" data-ask="${esc(q)}">${ic("chat", "sm")}<span class="m-txt"><b>Ask Loci instead</b></span></button>`
        : S.topics.filter((x) => x.wantToLearn).map((x) => `<button type="button" data-keep data-p="starter" data-t="${x.id}">${ic("spark", "sm")}<span class="m-txt"><b class="m-ask">Explain ${esc(x.name)}</b></span></button>`).join("")}</div>`;
  }
  function onSubmit(text) {
    const t = detect(text);
    if (L.makeFmt === "live") { openLumen("l2", { fmt: "watch", live: true }); return true; }
    M().makeLumen(t?.id ?? null, L.makeFmt, text);
    if (M().S.dest === "learn") { L.tab = "home"; M().render(); }
    return true;
  }
  function onMaking() {
    const m = M().S.making; if (!m) return;
    const step = document.getElementById("mkStep"); if (step) step.textContent = stepOf(m);
    document.querySelectorAll(".p-mkbar i").forEach((i) => (i.style.width = `${Math.round(m.progress * 100)}%`));
    if (L.room?.kind === "lumen" && L.room.id === m.addTo) paintRoom();
  }

  /* ---------- the room: one Lumen, in one format ---------- */
  function openLumen(id, opts = {}) {
    const { S, refresh } = M(), l = lumen(id); if (!l) return;
    if (opts.course !== undefined && opts.course !== null) return openCourse(opts.course.id, opts.course.k);
    const fmt = opts.fmt || (S.player?.id === id ? S.player.fmt : null) || l.format;
    L.room = { fresh: true, kind: "lumen", id, fmt, sub: "transcript", live: !!opts.live, walk: false, drive: opts.drive ? "setup" : null, size: 0, answer: null };
    if (fmt !== "read" && made(l).includes(fmt)) startPlayer(id, fmt);
    M().remember({ kind: "lumen", id });
    showRoom(); refresh();
  }
  function startPlayer(id, fmt, extra = {}) {
    const { S } = M(), l = lumen(id);
    if (!(S.player && S.player.id === id && S.player.fmt === fmt && !S.player.course === !extra.course)) S.player = { id, fmt, pos: Math.round((fmt === l.format ? l.progress : 0) * lenOf(l, fmt)) % lenOf(l, fmt), playing: true, mode: "room", ...extra };
    S.player.mode = "room";
  }
  function showRoom() {
    const el = document.getElementById("room");
    el.classList.add("is-open"); el.setAttribute("aria-hidden", "false");
    window.MP_ROOM = { placeholder: roomPlaceholder, onSubmit: roomAsk };
    paintRoom();
    M().paintBar();
  }
  function closeRoom() {
    const { S, refresh } = M(), el = document.getElementById("room");
    el.classList.remove("is-open"); el.setAttribute("aria-hidden", "true");
    L.room = null; window.MP_ROOM = null;
    if (S.player && S.player.mode === "room") S.player.mode = "mini";
    M().paintBar(); refresh();
    if (S.dest === "learn") M().render();
  }
  function roomPlaceholder() {
    const r = L.room;
    if (r.kind === "course") return "Ask about this part…";
    if (r.live) return "Talk or type to interrupt…";
    return r.fmt === "listen" ? "Ask the hosts…" : r.fmt === "watch" ? "Ask about this slide…" : "Ask about this page…";
  }
  function roomAsk(text) {
    const r = L.room, { S } = M();
    if (r.fmt === "read" && r.kind === "lumen") { M().askLoci(text); return true; }
    if (S.player) S.player.playing = false;
    r.answer = { q: text, a: r.fmt === "listen" ? "Good question. Think of the tower as a chimney that also catches wind: the top openings let warm air out, so the bottom can draw cool air in. We’ll pick up where we were." : "A written answer, so it uses no voice minutes: the opening faces the summer wind because that is where the pressure is highest. On this slide, follow the arrow down the shaft." };
    paintRoom();
    return true;
  }

  function paintRoom() {
    const r = L.room; if (!r) return;
    const el = document.getElementById("room");
    const st = r.fresh ? 0 : el.querySelector(".r-scroll")?.scrollTop || 0;
    r.fresh = false;
    el.innerHTML = r.kind === "course" ? courseRoom() : lumenRoom();
    const sc = el.querySelector(".r-scroll"); if (sc) { sc.scrollTop = st; sc.onscroll = () => readProgress(sc); readProgress(sc); }
    paintTime();
  }
  function roomBar(title, right) {
    const { esc, ic, S } = M();
    const from = { loci: "Loci", today: "Today", commonplace: "Commonplace", learn: "Learn" }[S.dest];
    return `<header class="r-tb m-mat"><button class="r-back" type="button" data-p="rclose">${ic("left", "sm")}<span>${from}</span></button><b class="r-title">${esc(title)}</b>${right}</header>`;
  }
  function switcher(l, r) {
    const { FMT, S } = M();
    return `<div class="r-switch" role="tablist" aria-label="Format">${ORDER.map((f) => {
      const has = made(l).includes(f), mk = S.making?.addTo === l.id && S.making.format === f;
      return `<button type="button" role="tab" data-p="rfmt" data-f="${f}" aria-pressed="${!r.live && r.fmt === f}"><b>${FMT[f].label}</b><small>${mk ? "…" : has ? `${Math.round(lenOf(l, f) / 60)} min` : "+"}</small></button>`;
    }).join("")}<span class="r-sep"></span><button type="button" class="r-live" data-p="rlive" aria-pressed="${r.live}"><b><i class="p-live"></i>Live</b><small>now</small></button></div>`;
  }
  function lumenRoom() {
    const r = L.room, l = lumen(r.id), { ic, S } = M();
    const right = `<span class="r-acts">${r.fmt === "read" ? `<button class="m-ib" type="button" data-p="aa" aria-label="Text size">Aa</button>` : ""}<button class="m-ib" type="button" data-p="share" aria-label="Share">${ic("share", "sm")}</button></span>`;
    let body;
    if (!r.live && !made(l).includes(r.fmt)) body = missingBody(l, r.fmt);
    else if (r.live || r.fmt === "watch") body = watchBody(l, r);
    else if (r.fmt === "listen") body = listenBody(l, r);
    else body = readBody(l, r);
    return `${roomBar(l.title, right)}<div class="r-scroll ${r.fmt === "read" && !r.live ? "is-read" : ""}" data-size="${r.size}"><div class="r-head">${switcher(l, r)}${r.fmt === "read" && !r.live ? `<div class="r-progress"><i id="rprog"></i></div>` : ""}</div>${body}</div>
      ${r.walk ? walkHtml(l) : ""}${r.drive ? driveHtml(l, r) : ""}`;
  }
  function missingBody(l, f) {
    const { FMT, esc, S, ic } = M();
    const mk = S.making?.addTo === l.id && S.making.format === f;
    return `<div class="r-missing">${poster(l, f, "huge")}<h2>${mk ? `Making ${FMT[f].label}…` : `${esc(l.title)} has no ${FMT[f].label} yet`}</h2>
      <p>${HINT[f]}. It’s made from the same Lumen and lands on this card.</p>
      ${mk ? `<div class="p-mkbar big"><i style="width:${Math.round(S.making.progress * 100)}%"></i></div><p class="r-step">${esc(stepOf(S.making))}</p>` : `<button class="m-btn is-primary is-big" type="button" data-p="makefmt" data-id="${l.id}" data-f="${f}">${ic(FMT[f].ic, "sm")}Make ${FMT[f].label}</button>`}</div>`;
  }

  /* Watch: the stage, its controls, Transcript | Slides */
  function slideArt(i, n, title, live, figure) {
    const { esc } = M();
    // A wind tower in section; each slide lights a different part of the story.
    const hl = (k) => (i === k ? "var(--r-hot)" : "rgba(255,255,255,.28)");
    return `<svg class="r-art" viewBox="0 0 320 180" aria-hidden="true">
      <rect width="320" height="180" fill="none"/>
      <path d="M20 150H300" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/>
      <path d="M70 150V96h120v54M190 96l-60-28-60 28" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1.5"/>
      <path d="M200 150V40h28v110" fill="none" stroke="${hl(0)}" stroke-width="2"/>
      <path d="M150 40h30" stroke="${hl(1)}" stroke-width="2" marker-end="url(#ah)"/><path d="M150 52h30" stroke="${hl(1)}" stroke-width="2" marker-end="url(#ah)"/>
      <path d="M214 50v80" stroke="${hl(2)}" stroke-width="2" marker-end="url(#ah)"/>
      <path d="M200 132H92" stroke="${hl(3)}" stroke-width="2" marker-end="url(#ah)"/>
      <path d="M90 112c-6-14 4-24 14-30" stroke="${hl(4)}" stroke-width="2" fill="none" marker-end="url(#ah)"/>
      <defs><marker id="ah" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L8 4L0 8z" fill="rgba(255,255,255,.8)"/></marker></defs>
      <text x="20" y="28" fill="#fff" font-family="Newsreader, Georgia, serif" font-size="17">${esc(title)}</text>
      ${figure ? "" : `<text x="20" y="46" fill="rgba(255,255,255,.55)" font-family="Instrument Sans, system-ui" font-size="9.5" letter-spacing=".08em">${live ? "LIVE" : `SLIDE ${i + 1} OF ${n}`}</text>`}</svg>`;
  }
  function stageHtml(l, slides, i, live, cap) {
    const { ic, esc } = M();
    return `<div class="r-stage" data-p="stagetap">${slideArt(i, slides.length, slides[i], live)}
        ${live ? `<span class="r-livebadge"><i class="p-live"></i>Live</span>` : ""}
        <p class="r-cap" id="rcap">${esc(cap)}</p></div>
      <div class="r-ctl">
        <button class="m-ib" type="button" data-p="seek" data-d="-10" aria-label="Back 10 seconds">${ic("back15", "sm")}</button>
        <button class="r-pp" type="button" data-p="pp" aria-label="Play or pause" id="rpp">${ic("pause", "sm")}</button>
        <button class="m-ib" type="button" data-p="seek" data-d="10" aria-label="Forward 10 seconds">${ic("fwd15", "sm")}</button>
        <span class="r-scrub" data-p="scrub"><span class="r-track"><i id="rtrack"></i></span></span>
        <span class="r-time" id="rtime">0:00</span>
        <button class="r-chip" type="button" data-p="speed" id="rspeed">1×</button>
        <button class="r-chip" type="button" data-p="cc" aria-pressed="true">CC</button>
        <button class="m-ib" type="button" data-p="fs" aria-label="Full screen">${ic("whole", "sm")}</button>
      </div>`;
  }
  function watchBody(l, r) {
    const { esc, ic, mmss, S } = M();
    const slides = slidesOf(l), len = lenOf(l, "watch"), pos = S.player?.id === l.id ? S.player.pos : 0;
    const i = Math.min(slides.length - 1, Math.floor((pos / len) * slides.length));
    const cur = lineAt(l, pos);
    const answer = r.answer ? `<div class="r-answer"><small>You asked</small><p>${esc(r.answer.q)}</p><small>Written answer</small><p>${esc(r.answer.a)}</p><button class="m-btn" type="button" data-p="resume">Back to the Lumen</button></div>` : "";
    const live = r.live ? `<div class="r-interrupt">${["Explain that another way", "Go deeper", "From my field", "Simpler", "Test me", "Skip"].map((x) => `<button class="m-chip" type="button" data-p="interrupt" data-x="${x}">${x}</button>`).join("")}</div>
      <div class="r-liveacts"><button class="m-btn" type="button" data-p="endlive">Back to the recording</button><button class="m-btn is-primary" type="button" data-p="keeplive">Keep this version</button></div>
      <p class="r-note">Tap a slide to ask about it, or hold the mic and talk. Live sessions are kept for 30 days.</p>` : "";
    return `<div class="r-stagewrap">${stageHtml(l, slides, i, r.live, cur[2])}</div>${answer}${live}
      <div class="r-body">
        <h1 class="r-h1">${esc(l.title)}</h1>
        <p class="r-meta">${mmss(len)} · ${slides.length} slides · made ${dateLabel(l)}</p>
        <button class="r-lives" type="button" data-p="lives">Lives in <b>${esc(topicName(l.topic))}</b>${ic("down", "xs")}</button>
        <div class="m-seg r-subtabs"><button type="button" data-p="sub" data-s="transcript" aria-pressed="${r.sub === "transcript"}">Transcript</button><button type="button" data-p="sub" data-s="slides" aria-pressed="${r.sub === "slides"}">Slides</button></div>
        ${r.sub === "slides" ? `<div class="r-slides">${slides.map((s, k) => `<button type="button" data-p="toslide" data-k="${k}" class="${k === i ? "is-now" : ""}">${slideArt(k, slides.length, s)}<small>${k + 1}. ${esc(s)}</small></button>`).join("")}</div>`
          : `<div class="r-lines">${linesOf(l).map((x) => `<button type="button" data-p="toline" data-t="${x[1]}" class="${x === cur ? "is-now" : ""}"><small>${mmss(x[1])}</small><span>${esc(x[2])}</span></button>`).join("")}<p class="r-cite"><span class="m-chip">archdaily.com</span><span class="m-chip">General knowledge</span></p></div>`}
        <h3 class="r-h3">Questions to take further</h3>
        <div class="r-qs">${["Would a malqaf work in a humid city?", "How tall does the tower need to be?", "Where does the water jar go?"].map((q) => `<button class="m-chip" type="button" data-ask="${esc(q)}">${esc(q)}</button>`).join("")}</div>
      </div>`;
  }

  /* Listen: two hosts, chapters, Mark, Walk and Drive */
  function chapterIndex(l, pos) { const cs = chaptersOf(l); let k = 0; cs.forEach((c, i) => { if (c[1] <= pos) k = i; }); return k; }
  function listenBody(l, r) {
    const { esc, ic, mmss, S } = M();
    const cs = chaptersOf(l), len = lenOf(l, "listen"), pos = S.player?.id === l.id ? S.player.pos : 0, k = chapterIndex(l, pos), cur = lineAt(l, pos);
    const marks = L.marks.filter((m) => m.id === l.id);
    return `<div class="r-cover">
        <div class="r-hosts"><span class="${cur[0] === "A" ? "is-talking" : ""}"><i>M</i>Maya</span><span class="${cur[0] === "B" ? "is-talking" : ""}"><i>S</i>Sam</span></div>
        <p class="r-bigcap" id="rcap">${r.answer ? `<small>You asked: ${esc(r.answer.q)}</small>${esc(r.answer.a)}` : esc(cur[2])}</p>
        <div class="r-chapbar" id="rchap">${cs.map((c, i) => { const end = cs[i + 1]?.[1] ?? len, w = (end - c[1]) / len; return `<span style="flex:${w}"><i style="width:${pos >= end ? 100 : pos > c[1] ? ((pos - c[1]) / (end - c[1])) * 100 : 0}%"></i></span>`; }).join("")}</div>
        <div class="r-chapline"><span id="rchapname">Chapter ${k + 1} of ${cs.length} · ${esc(cs[k][0])}</span><span id="rtime">${mmss(pos)} / ${mmss(len)}</span></div>
        <div class="r-transport">
          <button type="button" data-p="seek" data-d="-15" aria-label="Back 15 seconds">${ic("back15")}</button>
          <button type="button" class="r-big" data-p="pp" aria-label="Play or pause" id="rpp">${ic("pause")}</button>
          <button type="button" data-p="nextch" aria-label="Next chapter">${ic("right")}</button>
        </div>
        <div class="r-tools"><button type="button" data-p="speed" id="rspeed">1×</button><button type="button" data-p="mark">${ic("pencil", "xs")}Mark</button><button type="button" data-p="walk">Walk</button><button type="button" data-p="drive" data-id="${l.id}">Drive</button></div>
      </div>
      <div class="r-body">
        <div class="r-edition"><span>Two voices · ${Math.round(len / 60)} min · ${cs.length} chapters</span><span class="p-btns"><button class="m-btn" type="button" data-p="driveed">Make a drive edition</button><button class="m-btn" type="button" data-p="offline">${L.offline ? "Saved offline" : "Save for offline"}</button></span></div>
        <h3 class="r-h3">Chapters</h3>
        <div class="m-rows">${cs.map((c, i) => `<button class="m-row ${i === k ? "is-now" : ""}" type="button" data-p="toline" data-t="${c[1]}"><span class="r-chnum">${i + 1}</span><span class="m-txt"><b>${esc(c[0])}</b><small>${i < k ? "Played" : i === k ? "Playing" : i > 3 ? "Written when you get closer" : mmss(c[1])}</small></span></button>`).join("")}</div>
        <h3 class="r-h3">Transcript <small>Tap a line to play it</small></h3>
        <div class="r-lines">${linesOf(l).map((x) => `<button type="button" data-p="toline" data-t="${x[1]}" class="${x === cur ? "is-now" : ""}"><small>${HOST[x[0]]} · ${mmss(x[1])}</small><span>${esc(x[2])}</span></button>`).join("")}</div>
        <h3 class="r-h3">Your marks</h3>
        ${marks.length ? `<div class="m-rows">${marks.map((m) => `<button class="m-row" type="button" data-p="toline" data-t="${m.t}"><span class="r-chnum">${ic("pencil", "xs")}</span><span class="m-txt"><b>${esc(m.text)}</b><small>${mmss(m.t)}</small></span></button>`).join("")}</div>` : `<p class="r-note">Tap Mark to keep a moment. Marks come back in your recap and in Commonplace.</p>`}
        <div class="r-recall"><small>Your turn</small><p>Why do the openings at the top of a wind tower matter as much as the ones at the bottom?</p><span>Answer out loud, type it below, or say “skip”. It comes at the end of each chapter.</span></div>
      </div>`;
  }
  function walkHtml(l) {
    const { ic, esc, S } = M(), pos = S.player?.pos || 0, cs = chaptersOf(l), k = chapterIndex(l, pos);
    return `<div class="r-walk"><button class="r-done" type="button" data-p="walkoff">Done</button><small>Walk · Chapter ${k + 1} of ${cs.length}</small><h2>${esc(cs[k][0])}</h2>
      <div class="r-wbtns"><button type="button" data-p="seek" data-d="-15" aria-label="Back 15 seconds">${ic("back15")}</button><button type="button" class="r-wplay" data-p="pp" aria-label="Play or pause">${ic(S.player?.playing ? "pause" : "play")}</button><button type="button" data-p="nextch" aria-label="Next chapter">${ic("right")}</button></div>
      <button class="r-wide" type="button" data-p="mark">Mark this moment</button><button class="r-wide is-ask" type="button" data-p="holdask">Hold to ask</button></div>`;
  }
  function driveHtml(l, r) {
    const { ic } = M();
    if (r.drive === "setup") return `<div class="r-walk is-drive"><button class="r-done" type="button" data-p="driveoff">Cancel</button><small>Drive</small><h2>Set it up before you move.</h2>
      <p>The drive edition is shorter, says what’s on the slides, and asks you questions you can answer without looking.</p>
      <button class="r-wide" type="button" data-p="driveed">Make a drive edition</button><button class="r-wide is-plain" type="button" data-p="drivego">Play it anyway</button><button class="r-wide is-go" type="button" data-p="drivego">Start</button></div>`;
    return `<div class="r-walk is-drive"><button class="r-done" type="button" data-p="driveoff">Done</button><small>Drive</small>
      <div class="r-dgrid"><button type="button" data-p="seek" data-d="-15">Say that again</button><button type="button" data-p="mark">${ic("pencil", "sm")}Mark</button><button type="button" data-p="nextch">Next chapter</button><button type="button" class="is-ask" data-p="holdask">Hold to ask</button></div></div>`;
  }

  /* Read: an article with a progress line, section chips, figures and Check yourself */
  function readBody(l, r) {
    const { esc, ic } = M();
    const secs = sectionsOf(l);
    const text = (s, i) => {
      if (l.id === "l1") return [
        "<p>Before fans and compressors, buildings in hot places still had to stay liveable. Three forces move air with no machine at all, and a good building uses all three at once.</p>",
        `<p>Wind presses on the face it meets and pulls on the face it leaves. An opening on each side, and air crosses the room.</p><figure class="r-fig">${slideArt(1, 5, "Pressure, then suction", false, true)}<figcaption>Wind pressure: high on the windward face, low on the leeward.</figcaption></figure>`,
        `<p>Warm air rises. Give it a way out high up, and cooler air is drawn in low down. The taller the stack, the stronger the pull.</p><figure class="r-fig">${slideArt(4, 5, "Out through the top", false, true)}<figcaption>The stack effect needs height and an opening at the top.</figcaption></figure>`,
        `<p>Air passing over water gives up heat to evaporate it. How much depends on how dry the air is.</p><div class="r-slider"><label for="hum">Humidity <b id="humv">Dry desert afternoon</b></label><input id="hum" type="range" min="0" max="100" value="15" data-p="hum"><div class="r-presets"><button class="m-chip" type="button" data-p="humset" data-v="15">Dry desert afternoon</button><button class="m-chip" type="button" data-p="humset" data-v="85">Humid coast in August</button></div><p class="r-out" id="humout">The wet jar helps a lot.</p></div>`,
      ][i] || "";
      return `<p>${esc(s)}: the idea in a paragraph, then an example you can draw from, with your own photos from Commonplace where they fit.</p>`;
    };
    return `<div class="r-secchips">${secs.map((s, i) => `<button class="m-chip" type="button" data-p="tosec" data-k="${i}">${esc(s)}</button>`).join("")}</div>
      <article class="r-article"><p class="r-kicker">${Math.round(lenOf(l, "read") / 60)} min read · ${secs.length} sections · ${esc(topicName(l.topic))}</p><h1>${esc(l.title)}</h1>
        ${secs.map((s, i) => s === "Check yourself" ? `<section id="sec${i}" class="r-check"><h2>Check yourself</h2><p>A courtyard house on a humid coast. Which helps most?</p>${["A pool in the court", "Shade and a breeze path through the plan", "A taller wind tower"].map((o, k) => `<button class="r-opt" type="button" data-p="check" data-k="${k}">${esc(o)}</button>`).join("")}<p class="r-out" id="checkout"></p></section>` : `<section id="sec${i}"><h2>${esc(s)}</h2>${text(s, i)}</section>`).join("")}
        <h3 class="r-h3">Sources</h3><div class="r-qs"><button class="m-chip" type="button" data-item="section-windtower">${ic("commonplace", "xs")}Section through a wind tower</button><button class="m-chip" type="button" data-item="q3">${ic("commonplace", "xs")}Hassan Fathy</button><span class="m-chip">General knowledge</span></div>
        <button class="r-listen" type="button" data-p="rfmt" data-f="listen">${ic("listen", "sm")}<span><b>Listen to this instead</b><small>${made(l).includes("listen") ? "Two voices pick up where you are" : "Make the Listen of this Lumen"}</small></span></button>
      </article>`;
  }
  function readProgress(sc) {
    const bar = document.getElementById("rprog"); if (!bar) return;
    const p = sc.scrollTop / Math.max(1, sc.scrollHeight - sc.clientHeight);
    bar.style.width = `${Math.round(p * 100)}%`;
    const l = lumen(L.room.id); if (L.room.fmt === "read" && l.format === "read") l.progress = Math.max(l.progress, p);
  }

  /* ---------- a course: the same room, with parts ---------- */
  function openCourse(id, k = 0) {
    const c = course(id), p = c.parts[k];
    if (p.state === "unmade") { M().toast(`Making Part ${k}: ${p.title}. Opening it makes it.`); p.state = "making"; setTimeout(() => { p.state = "ready"; p.min = 3; if (L.room?.kind === "course") paintRoom(); }, 3000); }
    L.room = { fresh: true, kind: "course", id, k, sub: "reading", answer: null, fb: null };
    const { S } = M();
    S.player = { id: "l2", fmt: "watch", pos: p.state === "playing" ? 104 : 0, playing: p.state !== "making", mode: "room", course: { id, k } };
    showRoom(); M().refresh();
  }
  function courseRoom() {
    const r = L.room, c = course(r.id), p = c.parts[r.k], { esc, ic, S } = M(), l = lumen("l2");
    const slides = [p.title, "What it’s for", "How it works", "An example", "On your site"], len = 185, pos = S.player?.pos || 0;
    const i = Math.min(4, Math.floor((pos / len) * 5));
    const next = c.parts[r.k + 1];
    const tabs = [["reading", "Reading"], ["part", "This part"], ["transcript", "Transcript"], ["slides", "Slides"]];
    return `${roomBar(c.title, `<span class="r-acts"><button class="m-ib" type="button" data-p="cmenu" data-id="${c.id}" aria-label="More">${ic("more", "sm")}</button></span>`)}
      <div class="r-scroll"><div class="r-head"><div class="r-episode"><button class="m-ib" type="button" data-p="part" data-k="${r.k - 1}" ${r.k ? "" : "disabled"} aria-label="Previous part">${ic("left", "sm")}</button>
        <button class="r-parts" type="button" data-p="parts"><small>Part ${r.k} of ${c.parts.length - 1}</small><b>${esc(p.title)}</b></button>
        <button class="r-chip" type="button" data-p="parts">Parts ${r.k}/${c.parts.length - 1}</button>
        <button class="m-ib" type="button" data-p="part" data-k="${r.k + 1}" ${next ? "" : "disabled"} aria-label="Next part">${ic("right", "sm")}</button></div></div>
      ${p.state === "making" ? `<div class="r-missing"><h2>Making Part ${r.k}…</h2><div class="p-mkbar big"><i style="width:40%"></i></div><p class="r-step">Writing slide 2 of 5</p></div>` : `<div class="r-stagewrap">${stageHtml(l, slides, i, false, `${p.title}: what it is, and why it matters on a hot site.`)}</div>`}
      ${r.answer ? `<div class="r-answer"><small>You asked</small><p>${esc(r.answer.q)}</p><small>Written answer</small><p>${esc(r.answer.a)}</p><button class="m-btn" type="button" data-p="resume">Back to the part</button></div>` : ""}
      <div class="r-body">
        <div class="m-seg r-subtabs four">${tabs.map(([k, t]) => `<button type="button" data-p="sub" data-s="${k}" aria-pressed="${r.sub === k}">${t}</button>`).join("")}</div>
        ${r.sub === "reading" ? `<div class="r-reading"><p>${esc(p.title)} is the part of ${esc(c.title.toLowerCase())} that decides how much sun reaches a room before anything else is designed. Read this beside the slides, or on its own.</p><p>Start from the sun’s path on your site, then the openings, then the depth of the screen.</p><h3 class="r-h3">Where this is on your map</h3><button class="r-lives" type="button" data-p="lives" data-t="${c.topic}">${esc(topicName(c.topic))} › ${esc(p.title)} <b>Open in Loci ↗</b></button><h3 class="r-h3">Sources</h3><div class="r-qs"><button class="m-chip" type="button" data-item="screen-shadow">Mashrabiya shadow on the floor</button><button class="m-chip" type="button" data-item="mat-jali">Jali screen</button></div></div>`
          : r.sub === "part" ? `<div class="r-reading"><p class="r-meta">Part ${r.k} of ${c.parts.length - 1} · ${p.min || 3} min · ${partLabel(p)}</p><div class="r-fb"><b>How useful was this part?</b><div class="r-fbrow">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-p="fb" data-n="${n}" aria-pressed="${r.fb === n}">${n}</button>`).join("")}</div>${r.fb ? `<small>Thanks. It shapes the next parts.</small>` : ""}</div><button class="m-btn" type="button" data-p="report">Report a problem</button></div>`
          : r.sub === "slides" ? `<div class="r-slides">${slides.map((s, k) => `<button type="button" class="${k === i ? "is-now" : ""}">${slideArt(k, 5, s)}<small>${k + 1}. ${esc(s)}</small></button>`).join("")}</div>`
          : `<div class="r-lines">${slides.map((s, k) => `<button type="button" class="${k === i ? "is-now" : ""}"><small>${M().mmss(k * 37)}</small><span>${esc(s)}: what the slide shows, in the narrator’s words.</span></button>`).join("")}</div>`}
        ${next ? `<div class="r-upnext"><small>Up next · Part ${r.k + 1} of ${c.parts.length - 1}</small><b>${esc(next.title)}</b><span>${partLabel(next)}</span><button class="m-btn is-primary" type="button" data-p="part" data-k="${r.k + 1}">${next.state === "unmade" ? `Make part ${r.k + 1}` : `Play part ${r.k + 1}`}</button></div>` : ""}
      </div></div>`;
  }
  function partsSheet() {
    const r = L.room, c = course(r.id), { esc, ic } = M();
    M().sheet(`<div class="m-grab" data-drag="sheet"></div><div class="m-sheet-head" data-drag="sheet"><h2>${esc(c.title)}</h2><button class="m-ib" type="button" data-act="sheetx" aria-label="Close">${ic("x")}</button></div>
      <div class="m-sheet-body"><p class="r-meta">${c.parts.filter((p) => p.state === "watched").length} of ${c.parts.length} watched · made one part at a time</p><div class="m-rows">${c.parts.map((p, k) => `<button class="m-row ${k === r.k ? "is-now" : ""}" type="button" data-p="part" data-k="${k}"><span class="r-chnum">${p.state === "watched" ? ic("check", "xs") : k}</span><span class="m-txt"><b>${esc(p.title)}</b><small>${k === r.k ? "Now playing" : p.state === "unmade" ? "Not made yet. Opening it makes it." : partLabel(p)}</small></span></button>`).join("")}</div></div>`);
  }

  /* ---------- the player clock ---------- */
  const SPEEDS = [1, 1.25, 1.5, 0.75];
  setInterval(() => {
    const { S } = M(); const p = S.player;
    if (!p || !p.playing) return;
    const l = lumen(p.id), len = p.course ? 185 : lenOf(l, p.fmt);
    p.pos = Math.min(len, p.pos + (p.speed || 1));
    if (!p.course && p.fmt === l.format) l.progress = p.pos / len;
    paintTime();
  }, 1000);
  function paintTime() {
    const { S, mmss, esc } = M(), p = S.player;
    if (!p) return;
    const l = lumen(p.id), len = p.course ? 185 : lenOf(l, p.fmt), w = `${(p.pos / len) * 100}%`;
    document.querySelectorAll(".m-mini .m-prog i").forEach((i) => (i.style.width = w));
    const mt = document.querySelector(".m-mini .m-txt small"); if (mt) mt.textContent = `${p.course ? "Course" : M().FMT[p.fmt].label} · ${mmss(p.pos)}`;
    const r = L.room; if (!r || r.walk) return;
    const tr = document.getElementById("rtrack"); if (tr) tr.style.width = w;
    const tm = document.getElementById("rtime"); if (tm) tm.textContent = p.fmt === "listen" ? `${mmss(p.pos)} / ${mmss(len)}` : `${mmss(p.pos)} / ${mmss(len)}`;
    const pp = document.getElementById("rpp"); if (pp) pp.innerHTML = M().ic(p.playing ? "pause" : "play", p.fmt === "listen" ? "" : "sm");
    if (r.answer || r.kind === "course") return;
    const cap = document.getElementById("rcap"), cur = lineAt(l, p.pos);
    if (cap && cap.dataset.t !== String(cur[1])) {
      cap.dataset.t = String(cur[1]);
      // a new line or slide: repaint the room so the lit host, slide and transcript line follow
      if (cap.textContent && cap.textContent !== cur[2]) paintRoom();
    }
    if (p.fmt === "listen") {
      const cs = chaptersOf(l);
      document.querySelectorAll("#rchap > span").forEach((s, i) => { const st = cs[i][1], end = cs[i + 1]?.[1] ?? len; s.firstElementChild.style.width = `${p.pos >= end ? 100 : p.pos > st ? ((p.pos - st) / (end - st)) * 100 : 0}%`; });
    }
  }
  function miniHtml() {
    const { S, esc, ic, FMT, mmss } = M(), p = S.player, l = lumen(p.id), len = p.course ? 185 : lenOf(l, p.fmt);
    const c = p.course ? course(p.course.id) : null;
    const cover = p.fmt === "watch" ? `<span class="p-poster watch mini"><b>${esc(c ? c.parts[p.course.k].title : l.title)}</b></span>` : `<span class="m-cover">${ic(FMT[p.fmt].ic, "sm")}</span>`;
    return `<div class="m-mini m-mat" role="group" aria-label="Now playing"><button class="m-cover-b" type="button" data-act="full" aria-label="Open">${cover}</button><button class="m-txt" type="button" data-act="full"><b>${esc(c ? `${c.title}: ${c.parts[p.course.k].title}` : l.title)}</b><small>${c ? "Course" : FMT[p.fmt].label} · ${mmss(p.pos)}</small></button>
      <button class="m-ib" type="button" data-act="pp" aria-label="${p.playing ? "Pause" : "Play"}">${ic(p.playing ? "pause" : "play", "sm")}</button><button class="m-ib" type="button" data-act="stop" aria-label="Stop">${ic("x", "sm")}</button><span class="m-prog"><i style="width:${(p.pos / len) * 100}%"></i></span></div>`;
  }

  /* ---------- clicks ---------- */
  function click(t, ev) {
    const d = t.dataset, k = d.p, mp = M(), { S } = mp, r = L.room;
    const rerender = () => { if (S.dest === "learn" && !r) mp.render(); };
    switch (k) {
      case "tab": L.tab = d.t; mp.render(); $stageTop(); return true;
      case "mkfmt": L.makeFmt = d.f; mp.paintBarState(); if (document.querySelector(".p-makepanel")) document.getElementById("dtop").innerHTML = barPanel(document.getElementById("barInput").value.trim()); if (S.dest === "learn" && !r) { const b = document.getElementById("learnBody"); if (b && L.tab === "home") b.innerHTML = homeHtml(); } return true;
      case "focusbar": mp.focusBar(); return true;
      case "starter": { const t2 = mp.T().get(d.t), i = document.getElementById("barInput"); if (S.dest !== "learn") { mp.setDest("learn"); } i.value = `Explain ${t2.name} for a hot, sunny site`; i.focus(); i.dispatchEvent(new Event("input")); return true; }
      case "make": { const i = document.getElementById("barInput"), v = i.value.trim(); if (!v) return true; i.value = ""; i.blur(); S.bar.mode = "idle"; mp.paintDock(); onSubmit(v); return true; }
      case "ff": L.ff = d.f; rerender(); return true;
      case "st": L.st = d.s; rerender(); return true;
      case "clear": L.ff = "all"; L.st = "all"; rerender(); return true;
      case "group": mp.menu(mp.anchor(t, { align: "right" }), `<button type="button" data-m="date">By date${L.group === "date" ? mp.ic("check", "sm") : ""}</button><button type="button" data-m="topic">By topic${L.group === "topic" ? mp.ic("check", "sm") : ""}</button>`, { date: () => { L.group = "date"; rerender(); }, topic: () => { L.group = "topic"; rerender(); } }); return true;
      case "lmenu": { const l = lumen(d.id); mp.menu(mp.anchor(t, { align: "right" }), `<button type="button" data-m="edit">Edit details…${mp.ic("pencil", "sm")}</button><button type="button" data-m="share">Share…${mp.ic("share", "sm")}</button><button type="button" data-m="loci">Show in Loci${mp.ic("network", "sm")}</button><button type="button" class="is-danger" data-m="del">Delete…${mp.ic("trash", "sm")}</button>`, { edit: () => mp.toast("Edit details: Title, Lives in, Save."), share: () => shareSheet(l), loci: () => mp.goTo(l.topic), del: () => mp.toast("Delete this Lumen for good? asks first, as a sheet.") }); return true; }
      case "cmenu": mp.menu(mp.anchor(t, { align: "right" }), `<button type="button" data-m="edit">Edit details…${mp.ic("pencil", "sm")}</button><button type="button" data-m="share">Share course…${mp.ic("share", "sm")}</button><button type="button" data-m="rep">Report a problem${mp.ic("note", "sm")}</button><button type="button" class="is-danger" data-m="del">Delete course…${mp.ic("trash", "sm")}</button>`, { edit: () => mp.toast("Edit details: Title, Lives in, Save."), share: () => mp.toast("Share course: Create link and copy."), rep: reportSheet, del: () => mp.toast("Delete course… asks first, as a sheet.") }); return true;
      case "expand": L.open = L.open === d.id ? null : d.id; rerender(); return true;
      case "openfmt": openLumen(d.id, { fmt: d.f }); return true;
      case "addfmt": openLumen(d.id, { fmt: d.f }); return true;
      case "live": openLumen(d.id, { fmt: "watch", live: true }); return true;
      case "drive": openLumen(d.id, { fmt: "listen", drive: true }); return true;
      case "course": openCourse(d.id, Number(d.k)); return true;
      case "rclose": closeRoom(); return true;
    }
    if (!r) return false;
    const p = S.player, l = r.kind === "lumen" ? lumen(r.id) : null;
    switch (k) {
      case "rfmt": if (r.live) r.live = false; r.fmt = d.f; r.answer = null; if (d.f !== "read" && made(l).includes(d.f)) startPlayer(l.id, d.f); paintRoom(); mp.paintBar(); document.querySelector(".r-scroll").scrollTop = 0; return true;
      case "rlive": r.live = !r.live; if (r.live) { r.fmt = "watch"; startPlayer(l.id, "watch"); } paintRoom(); mp.paintBar(); return true;
      case "makefmt": mp.makeLumen(l.topic, d.f, null, l.id); paintRoom(); return true;
      case "pp": if (p) { p.playing = !p.playing; r.answer = null; paintRoom(); } return true;
      case "resume": r.answer = null; if (p) p.playing = true; paintRoom(); return true;
      case "seek": if (p) { p.pos = Math.max(0, p.pos + Number(d.d)); paintRoom(); } return true;
      case "toline": if (p) { p.pos = Number(d.t); p.playing = true; paintRoom(); document.querySelector(".r-scroll").scrollTo({ top: 0, behavior: "smooth" }); } return true;
      case "toslide": if (p) { p.pos = Math.ceil((Number(d.k) / slidesOf(l).length) * lenOf(l, "watch")) + 1; paintRoom(); } return true;
      case "scrub": { if (!p) return true; const b = t.getBoundingClientRect(), x = (ev.clientX - b.left) / b.width; p.pos = Math.round(Math.max(0, Math.min(1, x)) * (p.course ? 185 : lenOf(l, p.fmt))); paintRoom(); return true; }
      case "nextch": { if (!p) return true; const cs = chaptersOf(l), i = chapterIndex(l, p.pos); if (cs[i + 1]) p.pos = cs[i + 1][1]; paintRoom(); return true; }
      case "speed": if (p) { p.speed = SPEEDS[(SPEEDS.indexOf(p.speed || 1) + 1) % SPEEDS.length]; t.textContent = `${p.speed}×`; } return true;
      case "cc": t.setAttribute("aria-pressed", String(t.getAttribute("aria-pressed") !== "true")); document.getElementById("rcap")?.classList.toggle("is-off"); return true;
      case "fs": mp.toast("Full screen: turn the phone sideways, or tap here. The slide fills the screen, captions stay."); return true;
      case "stagetap": if (r.live) { mp.focusBar(); } return true;
      case "sub": r.sub = d.s; paintRoom(); return true;
      case "lives": closeRoom(); mp.goTo(d.t || l.topic); return true;
      case "share": shareSheet(l); return true;
      case "aa": r.size = (r.size + 1) % 3; paintRoom(); return true;
      case "mark": { const cur = lineAt(l, p.pos); L.marks.push({ id: l.id, t: p.pos, text: cur[2] }); mp.toast("Marked. It’s in Your marks."); if (!r.walk && !r.drive) paintRoom(); return true; }
      case "walk": r.walk = true; paintRoom(); return true;
      case "walkoff": r.walk = false; paintRoom(); return true;
      case "driveoff": r.drive = null; paintRoom(); return true;
      case "drivego": r.drive = "on"; if (p) p.playing = true; paintRoom(); return true;
      case "driveed": mp.toast("Making a drive edition: shorter, and it says what’s on the slides."); return true;
      case "offline": L.offline = true; paintRoom(); mp.toast("Saved for offline"); return true;
      case "holdask": mp.startListening(document.getElementById("barInput"), "Why does the tower need openings at the top?"); return true;
      case "interrupt": r.answer = { q: d.x, a: d.x === "Test me" ? "Here’s one: which face of the tower has the highest pressure, and why does that matter for the opening?" : `${d.x}: the tower is a funnel turned toward the wind. The air it catches has nowhere to go but down, through the house and out.` }; if (p) p.playing = false; paintRoom(); return true;
      case "endlive": r.live = false; r.answer = null; paintRoom(); mp.paintBar(); return true;
      case "keeplive": mp.toast("Kept as a Lumen"); r.live = false; paintRoom(); mp.paintBar(); return true;
      case "tosec": document.getElementById(`sec${d.k}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); return true;
      case "humset": { const h = document.getElementById("hum"); h.value = d.v; h.dispatchEvent(new Event("input")); return true; }
      case "check": { const o = document.getElementById("checkout"); o.textContent = d.k === "1" ? "Right. In humid air evaporation does little; shade and moving air do the work." : "Not quite. In humid air evaporation does little; try shade and a breeze path."; document.querySelectorAll(".r-opt").forEach((b) => b.classList.toggle("is-right", b.dataset.k === "1")); return true; }
      case "parts": partsSheet(); return true;
      case "part": { const kk = Number(d.k); mp.closeSheet(); openCourse(r.id, kk); return true; }
      case "fb": r.fb = Number(d.n); paintRoom(); return true;
      case "report": reportSheet(); return true;
    }
    return false;
  }
  function $stageTop() { document.getElementById("stage").scrollTop = 0; }
  function shareSheet(l) {
    const { esc, ic, FMT } = M();
    M().sheet(`<div class="m-grab" data-drag="sheet"></div><div class="m-sheet-head" data-drag="sheet"><h2>Share this Lumen</h2><button class="m-ib" type="button" data-act="sheetx" aria-label="Close">${ic("x")}</button></div>
      <div class="m-sheet-body"><p class="r-meta">${esc(l.title)}</p><div class="m-rows">${made(l).map((f) => `<label class="m-row"><input type="checkbox" checked> <span class="m-txt"><b>${FMT[f].label}</b><small>${Math.round(lenOf(l, f) / 60)} min</small></span></label>`).join("")}</div>
      <p class="r-note">Not shared: your live sessions, your questions and marks, your goal and your Commonplace notes.</p>
      <div style="display:grid;gap:8px"><button class="m-btn is-primary is-big" type="button" id="shcopy">Copy link</button><button class="m-btn is-big" type="button" id="shprev">Preview as a viewer</button></div></div>`, (el) => {
      el.querySelector("#shcopy").onclick = () => { M().closeSheet(); M().toast("Link copied"); };
      el.querySelector("#shprev").onclick = () => { M().closeSheet(); M().toast("Preview: the same frame, without Live, your marks or your goal."); };
    });
  }
  function reportSheet() {
    const { ic } = M();
    M().sheet(`<div class="m-grab" data-drag="sheet"></div><div class="m-sheet-head" data-drag="sheet"><h2>Report a problem</h2><button class="m-ib" type="button" data-act="sheetx" aria-label="Close">${ic("x")}</button></div>
      <div class="m-sheet-body"><div class="m-rows">${["Something in it is wrong or misleading", "The chapter, pages or topic are wrong", "Audio, captions or slides don’t work", "Something else"].map((x, i) => `<label class="m-row"><input type="radio" name="rep" ${i ? "" : "checked"}> <span class="m-txt"><b>${x}</b></span></label>`).join("")}</div>
      <label class="m-row" style="margin:10px 0"><input type="checkbox" checked> <span class="m-txt"><b>Include the slide I’m on</b></span></label>
      <div style="display:grid;gap:8px"><button class="m-btn is-primary is-big" type="button" id="repsend">Send</button><button class="m-btn is-big" type="button" data-act="sheetx">Cancel</button></div></div>`, (el) => { el.querySelector("#repsend").onclick = () => { M().closeSheet(); M().toast("Sent. Thank you."); }; });
  }

  // The humidity slider in Read.
  document.addEventListener("input", (e) => {
    if (e.target.id !== "hum") return;
    const v = Number(e.target.value);
    document.getElementById("humv").textContent = v < 35 ? "Dry desert afternoon" : v < 65 ? "A mild day" : "Humid coast in August";
    document.getElementById("humout").textContent = v < 35 ? "The wet jar helps a lot." : v < 65 ? "The wet jar helps a little." : "The wet jar barely helps. Shade and breeze do the work.";
  });
  // A swipe from the left edge closes a room, as Back does on iOS.
  document.addEventListener("pointerdown", (e) => {
    const room = document.getElementById("room"); if (!L.room || !room.contains(e.target)) return;
    const a = room.getBoundingClientRect(); if (e.clientX - a.left > 22) return;
    const x0 = e.clientX; let dx = 0;
    const move = (ev) => { dx = Math.max(0, ev.clientX - x0); room.style.transform = `translateX(${dx}px)`; };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); room.style.transform = ""; if (dx > 90) closeRoom(); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  }, true);

  window.MP_PAGES = window.MP_PAGES || {};
  window.MP_PAGES.learn = { html, click, placeholder, barPanel, onSubmit, openLumen, miniHtml, onMaking, onStop: () => {} };
})();
