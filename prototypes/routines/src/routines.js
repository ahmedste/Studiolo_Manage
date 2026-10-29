/* Routines (prototype, version 4): make them by talking to Loci.
   - The page is quiet: one list, one sentence per routine, in three groups by what starts it (When I send something,
     On a schedule, After I do something). Any underlined word is tappable: tap it to change it in place.
   - Everything that needs the learner is in one place, Waiting for you, one decision per card.
   - Making or changing a routine is a conversation with Loci in the panel beside the list (a sheet on a phone):
     say it, answer at most a few taps, see what it would have done, then Turn it on. Loci starts the learner off with
     ideas and with one thing it noticed them doing by hand, and spots a routine that already does the job.
   - Builder (prototype bar) shows which parts run on plain rules and which need Loci to read the item.
   The shell and Today are the app's own DOM and CSS, captured read-only from studiolo's /dev/specimens
   (see ../live-lumens/capture/capture.cjs). Spec: docs/superpowers/specs/2026-10-29-routines-chat-ux-design.md */
(() => {
  "use strict";
  const DATA = JSON.parse(document.getElementById("vx-data").textContent);
  const root = document.getElementById("vx-app");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  DATA.htmlClass.split(/\s+/).filter(Boolean).forEach((c) => document.documentElement.classList.add(c));

  /* ================================================================ words and places (the sample learner: an architect in Dubai) */
  const NOW = new Date(2026, 9, 26, 8, 10);
  const DAYLONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const plural = (n, w, ws) => `${n} ${n === 1 ? w : ws || w + "s"}`;
  const cap = (x) => String(x).charAt(0).toUpperCase() + String(x).slice(1);
  const andJoin = (xs) => (xs.length > 1 ? xs.slice(0, -1).join(", ") + " and " + xs[xs.length - 1] : xs[0] || "");
  const hm = (s) => { const [h, m] = s.split(":").map(Number); return `${h}:${String(m).padStart(2, "0")}`; };

  const PLACES = {
    you: { name: "your whole map" },
    climate: { name: "Climate-responsive design" },
    islamic: { name: "Islamic architecture" },
    daylight: { name: "Daylight & shading" },
    precast: { name: "Precast" },
    vernacular: { name: "Vernacular & regional" },
    home: { name: "Home & family" },
  };
  const TOPICS = ["climate", "islamic", "daylight", "precast", "vernacular", "home"];
  const CH_WORD = { any: "anywhere", whatsapp: "WhatsApp", email: "email", share: "my phone", browser: "the browser" };
  const CH_PREP = { any: "from", whatsapp: "on", email: "by", share: "from", browser: "via" };
  const CH_OPTS = [["whatsapp", "On WhatsApp"], ["email", "By email"], ["share", "Shared from my phone"], ["browser", "From the browser"], ["any", "From anywhere"]];
  const ITEM_KINDS = ["photo", "link", "PDF", "voice note", "reel", "video"];
  const KIND_WORD = { photo: "a photo", link: "a link", PDF: "a PDF", "voice note": "a voice note", reel: "a reel", video: "a video" };
  const IS_OPTS = ["a book", "a recipe", "a paper", "a lecture"];
  const FILE_AS = ["Site photos", "Renders", "Precedents", "Books", "Papers", "Videos", "Specifications", "Notes", "Recipes"];
  const UND = { describe: "describe it", transcribe: "write out what I said", title: "give it a title", links: "save the links in its caption", book: "find the book", text: "pull out the text", summary: "sum it up in three lines", recipe: "keep just the recipe" };
  const LRN = { questions: "turn my questions into @questions", review: "add it to Review" };

  /* ================================================================ the learner's routines */
  let rid = 0;
  const thenOf = (t) => ({ fileAs: "", on: "best", status: "", addTo: "", understand: [], learn: [], reply: "", ...t });
  const arrive = (name, when, ifs, then, extra) => ({ id: "r" + ++rid, type: "arrive", name, on: true, when, ifs, then: thenOf(then), mode: "ask", right: [0, 0], filed: 0, lately: [], ...extra });
  const ROUTINES = [
    arrive("Site photos", "whatsapp", [{ t: "kind", v: "photo" }, { t: "tag", v: "#site" }], { fileAs: "Site photos", on: "", addTo: "project", understand: ["describe"] }, { mode: "own", right: [31, 31], filed: 31,
      lately: [{ t: "North wall, morning", w: "as Site photos, in the prayer hall project", when: "Yesterday, 16:05" }, { t: "Mihrab niche, rough opening", w: "as Site photos, in the prayer hall project", when: "Fri, 11:20" }] }),
    arrive("Books", "any", [{ t: "is", v: "a book" }], { fileAs: "Books", status: "To read", understand: ["book"] }, { right: [9, 10],
      lately: [{ t: "Architecture for the Poor", w: "as Books on Climate-responsive design, To read · you checked it", when: "Thu, 19:40" }] }),
    arrive("Voice notes", "whatsapp", [{ t: "kind", v: "voice note" }], { fileAs: "Notes", understand: ["transcribe"], learn: ["questions"], reply: "confirm" }, { right: [7, 8],
      lately: [{ t: "Daylight factor for the hall", w: "as Notes on Daylight & shading, 1 question · you checked it", when: "Sat, 08:02" }] }),
    arrive("Recipes", "any", [{ t: "is", v: "a recipe" }], { fileAs: "Recipes", on: "home", understand: ["recipe"] }, { mode: "own", right: [4, 4], filed: 4,
      lately: [{ t: "Za'atar flatbread (example reel)", w: "as Recipes on Home & family", when: "Yesterday, 21:12" }] }),
    arrive("Precedents", "any", [{ t: "site", v: "archdaily.com" }], { fileAs: "Precedents", status: "To read" }, { mode: "own", right: [14, 14], filed: 14,
      lately: [{ t: "Courtyard school in Burkina Faso (example)", w: "as Precedents on Climate-responsive design, To read", when: "Yesterday, 18:40" }] }),
    { id: "r" + ++rid, type: "schedule", kind: "review", name: "Friday review", on: true, every: "w5", time: "17:00", place: "precast", count: 3, stat: "7 answered this month", lately: [{ t: "3 questions on Precast", w: "2 right, 1 to revisit", when: "Fri, 17:00" }] },
    { id: "r" + ++rid, type: "schedule", kind: "pile", name: "Clear the To read pile", on: true, every: "month", time: "09:00", stat: "11 let go, 6 kept this year", lately: [{ t: "4 things in To read for over three months", w: "waiting for you", when: "1 Oct" }] },
    { id: "r" + ++rid, type: "after", kind: "lumen", name: "After a Lumen", on: true, delay: "three days later", stat: "12 checks brought back this month", lately: [{ t: "The check for “How a malqaf moves air”", w: "came back · right", when: "Sat" }] },
    { id: "r" + ++rid, type: "after", kind: "dup", name: "Saved twice", on: true, stat: "3 caught this month", lately: [{ t: "Thermal Delight in Architecture", w: "already saved · nothing added", when: "Wed" }] },
  ];
  const RR = (id) => ROUTINES.find((r) => r.id === id);
  const GROUPS = [
    { type: "arrive", name: "When I send something", line: "Checked from the top; the first one that fits files it." },
    { type: "schedule", name: "On a schedule", line: "" },
    { type: "after", name: "After I do something", line: "" },
  ];

  /* ---------- what's waiting for the learner (one decision per card) */
  let wid = 0;
  const W = [
    { id: "w" + ++wid, kind: "single", rid: "r2", title: "Photo of a book cover", found: "Found the book: Climate Considerations in Building and Urban Design, Baruch Givoni, 1998.", newTitle: "Climate Considerations in Building and Urban Design", sug: "climate", fileAs: "Books", status: "To read" },
    { id: "w" + ++wid, kind: "single", rid: "r3", title: "Voice note, 0:38", found: "Written out: “Ask the precaster about thermal breaks at the fixings. And is stainless worth the extra cost?” One question kept.", newTitle: "Precaster: thermal breaks at the fixings", sug: "precast", fileAs: "Notes" },
    { id: "w" + ++wid, kind: "pile", rid: "r7", items: [{ t: "Design with Climate, Victor Olgyay", k: "Book", since: "since June" }, { t: "Architecture for the Poor, Hassan Fathy", k: "PDF", since: "since May · stopped at p. 41" }, { t: "Lecture: daylight in deep plans (example)", k: "Video", since: "since July" }] },
  ];

  /* ---------- the last 20 things the learner sent, for "what it would have done" (examples) */
  const PAST = [
    { ch: "whatsapp", kind: "photo", tags: ["#site"], title: "North wall, morning", about: "climate" },
    { ch: "whatsapp", kind: "photo", tags: ["#site"], title: "Mihrab niche, rough opening", about: "islamic" },
    { ch: "browser", kind: "link", site: "archdaily.com", title: "Courtyard school in Burkina Faso (example)", about: "climate" },
    { ch: "browser", kind: "link", site: "dezeen.com", title: "A mosque with a timber roof (example)", about: "islamic" },
    { ch: "share", kind: "reel", title: "Brick screens in Dhaka (example reel)", about: "daylight" },
    { ch: "share", kind: "reel", title: "Za'atar flatbread (example reel)", is: "a recipe", about: "home" },
    { ch: "whatsapp", kind: "voice note", title: "Voice note: daylight factor for the hall", about: "daylight" },
    { ch: "email", kind: "PDF", title: "Precast specification rev B.pdf", about: "precast" },
    { ch: "email", kind: "PDF", title: "Site minutes, week 42.pdf", about: "precast" },
    { ch: "email", kind: "PDF", title: "Courtyard cooling study (example).pdf", about: "climate" },
    { ch: "whatsapp", kind: "photo", title: "Book cover: Architecture for the Poor", is: "a book", about: "climate" },
    { ch: "browser", kind: "link", site: "sciencedirect.com", title: "A paper on wind towers (example)", is: "a paper", about: "climate" },
    { ch: "browser", kind: "link", site: "dezeen.com", title: "Rammed-earth library (example)", about: "vernacular" },
    { ch: "whatsapp", kind: "photo", title: "A receipt" },
    { ch: "share", kind: "link", site: "a-bookshop.example", title: "Book page: The Architecture of Natural Cooling", is: "a book", about: "climate" },
    { ch: "browser", kind: "link", site: "dezeen.com", title: "Courtyard housing in Seville (example)", about: "climate" },
    { ch: "browser", kind: "link", site: "archdaily.com", title: "Brick vaults in Iran (example)", about: "vernacular" },
    { ch: "whatsapp", kind: "photo", tags: ["#site"], title: "Formwork for the precast mock-up", about: "precast" },
    { ch: "share", kind: "reel", title: "A riad courtyard tour (example reel)", about: "vernacular" },
    { ch: "browser", kind: "link", site: "woodworking-blog.example", title: "Dovetails by hand (example)" },
  ];
  // what the prototype bar can send in (simulated)
  const SEND = [
    { id: "m1", ch: "whatsapp", label: "WhatsApp: a photo with #site", kind: "photo", tags: ["#site"], title: "East court at 4 pm", about: "climate" },
    { id: "m2", ch: "whatsapp", label: "WhatsApp: a photo of a book cover", kind: "photo", is: "a book", title: "Photo of a book cover", newTitle: "The Environmental Imagination", found: "Found the book: The Environmental Imagination, Dean Hawkes, 2008.", about: "climate" },
    { id: "m3", ch: "share", label: "Phone: an Instagram recipe reel", kind: "reel", is: "a recipe", title: "Red lentil soup in 20 minutes (example reel)", about: "home" },
    { id: "m4", ch: "email", label: "Email: a PDF, “Precast facade specification”", kind: "PDF", title: "Precast facade specification (draft).pdf", found: "24 pages. Summary: stainless A4 fixings; 20 mm joints; a thermal break at every bracket.", about: "precast" },
    { id: "m5", ch: "browser", label: "Browser: a link from dezeen.com", kind: "link", site: "dezeen.com", title: "A courtyard museum in Doha (example)", about: "climate" },
    { id: "m6", ch: "browser", label: "Browser: a blog post on Japanese joinery", kind: "link", site: "woodworking-blog.example", title: "Japanese joinery without nails (example)", newTopic: "Timber joinery" },
    { id: "m7", ch: "whatsapp", label: "WhatsApp: a book you already have", kind: "photo", is: "a book", title: "Thermal Delight in Architecture", dup: true },
  ];
  const SOURCES = ["Design-tools newsletter", "Building-science journal", "Architecture news site", "Conference channel", "A practice's blog you've saved from 6 times"];

  /* ================================================================ state */
  const S = { view: "routines", open: null, pop: null, waitOpen: false, builder: false, sendOpen: false, chatOpen: false, flash: null, sent: new Set(), tryOpen: null };
  const C = { msgs: [], draft: null, q: [], target: null, typing: false, input: "", pendingDelete: null, suggested: false };

  /* ================================================================ sentences, with tappable words */
  const chip = (id, f, label) => `<button type="button" class="rc-chip" data-act="chip" data-r="${id}" data-f="${f}">${esc(label)}</button>`;
  const reads = (x) => `<span class="rc-reads">${esc(x)}</span>`; // a part Loci reads the item to do (dotted in Builder)
  const everyText = (r) => {
    if (r.every === "month") return "On the 1st of every month";
    const [h] = r.time.split(":").map(Number), t = hm(r.time);
    if (r.every === "day") return h >= 17 ? `Every evening at ${t}` : h < 12 ? `Every morning at ${t}` : `Every day at ${t}`;
    if (r.every === "weekdays") return `Weekday mornings at ${t}`;
    return `Every ${DAYLONG[Number(r.every.slice(1))]} at ${t}`;
  };
  function sentence(r, id = r.id) {
    if (r.type === "arrive") {
      const kind = r.ifs.find((c) => c.t === "kind");
      const subj = kind ? chip(id, "kind", KIND_WORD[kind.v]) : "something";
      const quals = r.ifs.filter((c) => c.t !== "kind").map((c) => ({ tag: () => `with ${chip(id, "tag", c.v)}`, site: () => `from ${chip(id, "site", c.v)}`, words: () => `mentioning ${chip(id, "words", c.v)}`, is: () => `that's ${chip(id, "is", c.v)}`, about: () => `about ${chip(id, "about", PLACES[c.v].name)}` })[c.t]());
      const t = r.then, acts = [];
      t.understand.forEach((k) => acts.push(reads(UND[k])));
      let file = t.fileAs ? `file it as ${chip(id, "fileAs", t.fileAs)}` : "file it";
      if (t.on === "best") file += ` on ${chip(id, "on", "the topic it's about")}`; else if (t.on) file += ` on ${chip(id, "on", PLACES[t.on].name)}`;
      acts.push(file);
      if (t.status) acts.push(`mark it ${chip(id, "status", t.status)}`);
      if (t.addTo === "project") acts.push(`add it to ${chip(id, "addTo", "the prayer hall project")}`);
      t.learn.forEach((k) => acts.push(reads(LRN[k])));
      if (t.reply === "confirm") acts.push("tell me on WhatsApp");
      const via = r.when === "any" && r.ifs.some((c) => c.t === "site") ? `via ${chip(id, "when", "any channel")}` : `${CH_PREP[r.when]} ${chip(id, "when", CH_WORD[r.when])}`;
      return `When I send ${subj}${quals.length ? " " + quals.join(" and ") : ""} ${via}, ${andJoin(acts)}.`;
    }
    if (r.type === "schedule") {
      const ev = chip(id, "every", everyText(r));
      if (r.kind === "tidy") return `${ev}, go through Unsorted: ${chip(id, "tidymode", r.mode === "ask" ? "ask me about each thing" : "file what you're sure of, and ask me about the rest")}.`;
      if (r.kind === "follow") return `${ev}, read ${chip(id, "sources", plural(r.sources.length, "source"))} and bring me what's new on ${chip(id, "place", r.label || PLACES[r.place].name)}, sorted onto my topics.`;
      if (r.kind === "review") return `${ev}, ask me ${chip(id, "count", `${r.count} questions`)} on what slipped at ${chip(id, "place", PLACES[r.place].name)}.`;
      if (r.kind === "pile") return `${ev}, show me what's sat in To read for over three months.`;
    }
    if (r.kind === "lumen") return `After I finish a Lumen, bring its check back ${chip(id, "delay", r.delay)}.`;
    if (r.kind === "dup") return "When I send something I already have, keep the one I have and tell me.";
    return "";
  }
  const modeLabel = (r) => (r.mode === "own" ? "Files on its own" : "Asks you first");
  function nextRun(r) {
    const [h, m] = r.time.split(":").map(Number);
    if (r.every === "month") return new Date(2026, 10, 1, h, m);
    for (let i = 0; i < 9; i++) { const d = new Date(NOW); d.setDate(d.getDate() + i); d.setHours(h, m, 0, 0); const wd = d.getDay(); if ((r.every === "day" || (r.every === "weekdays" && wd > 0 && wd < 6) || r.every === "w" + wd) && d > NOW) return d; }
    return NOW;
  }
  const fNext = (d) => (d.toDateString() === NOW.toDateString() ? `Today, ${hm(`${d.getHours()}:${d.getMinutes()}`)}` : `${DAYLONG[d.getDay()].slice(0, 3)} ${d.getDate()} ${MON[d.getMonth()]}`);
  function meta(r) {
    if (!r.on) return "Paused";
    if (r.type === "arrive") {
      const offer = r.mode === "ask" && r.right[1] >= 8 && r.right[0] / r.right[1] >= 0.9;
      return `${chip(r.id, "mode", modeLabel(r))} · ${r.mode === "own" ? `${r.filed} filed this month` : `right ${r.right[0]} of ${r.right[1]}`}${offer ? ` · <button type="button" class="sm-act" data-act="trust" data-r="${r.id}">Stop asking?</button>` : ""}`;
    }
    if (r.type === "schedule") return `Next: ${fNext(nextRun(r))} · ${esc(r.stat)}`;
    return esc(r.stat);
  }

  /* ================================================================ matching (plain rules in code; "is" needs Loci to read it) */
  function fits(r, it) {
    if (!r.on && r.id !== "draft") return false;
    if (r.when !== "any" && r.when !== it.ch) return false;
    return r.ifs.length > 0 && r.ifs.every((c) => ({ kind: () => it.kind === c.v, tag: () => (it.tags || []).includes(c.v), site: () => c.v.split(/[,\s]+/).includes(it.site), words: () => it.title.toLowerCase().includes(c.v.toLowerCase()), is: () => it.is === c.v, about: () => it.about === c.v })[c.t]());
  }
  function whereFor(r, it) {
    const t = r.then, place = t.on === "best" ? it.about : t.on;
    const base = [t.fileAs && `as ${t.fileAs}`, place && `on ${PLACES[place].name}`, t.addTo === "project" && "in the prayer hall project"].filter(Boolean).join(" ");
    return (base || "where it is") + (t.status ? `, ${t.status}` : "");
  }
  const firstFit = (it, list = ROUTINES) => list.find((r) => r.type === "arrive" && fits(r, it));

  /* ================================================================ the page */
  const ICON = {
    arrive: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>',
    schedule: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    after: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4v7a4 4 0 0 0 4 4h12"/><path d="m15 10 5 5-5 5"/></svg>',
    send: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>',
  };
  const btn = (label, attrs, kind = "") => `<button type="button" class="button${kind ? " button-" + kind : ""}" ${attrs}>${label}</button>`;
  const act = (label, attrs) => `<button type="button" class="sm-act" ${attrs}>${label}</button>`;
  const sw = (r) => `<button type="button" class="sm-switch rc-sw" role="switch" aria-checked="${r.on}" aria-label="${esc(r.name)} ${r.on ? "on" : "off"}" data-act="toggle" data-r="${r.id}"><i aria-hidden="true"></i></button>`;

  function row(r, i) {
    const open = S.open === r.id;
    const how = r.type === "arrive" ? (r.ifs.some((c) => c.t === "is" || c.t === "about") || r.then.on === "best" || r.then.understand.length || r.then.learn.length ? "Plain rules decide where it came from and what kind it is. Loci reads each item for the dotted parts: one small call each." : "Plain rules only. No model, no cost.") : r.kind === "pile" || r.kind === "dup" || r.kind === "lumen" ? "Plain rules only. No model, no cost." : "One small model call per run.";
    return `<article class="rc-row" id="row-${r.id}"${r.on ? "" : " data-off"}${S.flash === r.id ? " data-flash" : ""}>
      <span class="rc-ico" aria-hidden="true">${r.type === "arrive" ? `<span class="rc-n">${i + 1}</span>` : ICON[r.type]}</span>
      <div class="rc-body">
        <div class="rc-head"><button type="button" class="rc-name" data-act="open" data-r="${r.id}" aria-expanded="${open}">${esc(r.name)}<span class="rc-caret" aria-hidden="true">${open ? "▴" : "▾"}</span></button>${sw(r)}</div>
        <p class="rc-say">${sentence(r)}</p>
        <p class="rc-meta">${meta(r)}</p>
        ${open ? `<div class="rc-detail">
          ${r.lately.length ? `<div class="rc-lately"><span class="rc-k">Lately</span>${r.lately.slice(0, 3).map((x, j) => `<div class="rc-late"><b>${esc(x.t)}</b><span>${esc(x.w)} · ${esc(x.when)}</span>${x.undo ? act("Undo", `data-act="late-undo" data-r="${r.id}" data-i="${j}"`) : ""}</div>`).join("")}</div>` : ""}
          ${S.tryOpen === r.id ? tryHTML(r) : ""}
          ${S.builder ? `<p class="rc-builder"><b>Builder:</b> ${how}</p>` : ""}
          <div class="rc-acts">${act("Change it with Loci", `data-act="change" data-r="${r.id}"`)}${r.type === "arrive" ? act(S.tryOpen === r.id ? "Hide what it would do" : "What would it do?", `data-act="try" data-r="${r.id}"`) : ""}${r.type === "arrive" && i > 0 ? act("Move up", `data-act="up" data-r="${r.id}"`) : ""}${act("Delete", `data-act="del" data-r="${r.id}"`)}</div>
        </div>` : ""}
      </div></article>`;
  }
  function tryHTML(r) {
    const hits = PAST.filter((p) => fits({ ...r, id: "draft", on: true }, p));
    const others = r.id === "draft" ? hits.filter((p) => firstFit(p)) : [];
    if (!hits.length) return `<div class="rc-try"><p>None of the last 20 things you sent fit this yet.</p></div>`;
    return `<div class="rc-try"><p><b>${hits.length} of the last 20 things you sent</b> would have been filed. Nothing moves until you turn it on.</p><ul>${hits.slice(0, 3).map((p) => `<li><b>${esc(p.title)}</b><span>${esc(whereFor(r, p))}</span></li>`).join("")}</ul>${hits.length > 3 ? `<p class="rc-note">and ${hits.length - 3} more</p>` : ""}${others.length ? `<p class="rc-note">${plural(others.length, "of these is", "of these are")} filed by another routine today; this one would go first.</p>` : ""}</div>`;
  }
  function waitingHTML() {
    if (!W.length) return `<div class="rc-waitbar" data-empty><span>Nothing is waiting for you.</span></div>`;
    if (!S.waitOpen) return `<button type="button" class="rc-waitbar" data-act="wait-open"><span class="rc-dot" aria-hidden="true"></span><b>${plural(W.length, "thing")} waiting for a quick look</b><span class="rc-waitwhat">${esc(andJoin(W.slice(0, 2).map((w) => w.kind === "pile" ? "the To read pile" : w.kind === "nomatch" ? w.item.title : (w.newTitle || w.title))))}${W.length > 2 ? "…" : ""}</span><em>Look now</em></button>`;
    return `<section class="rc-wait" aria-labelledby="wait-h"><div class="rc-wait-h"><h2 id="wait-h">Waiting for you</h2>${act("Close", 'data-act="wait-close"')}</div>${W.map(waitCard).join("")}</section>`;
  }
  const topicSel = (id, cur) => `<select class="sm-select rc-sel" id="${id}" aria-label="Topic">${TOPICS.map((p) => `<option value="${p}"${p === cur ? " selected" : ""}>${esc(PLACES[p].name)}</option>`).join("")}</select>`;
  function waitCard(w) {
    if (w.kind === "single") {
      const r = RR(w.rid);
      return `<article class="rc-w"><span class="rc-k">${esc(r.name)} asks</span><b class="rc-wt">${esc(w.newTitle || w.title)}</b>${w.found ? `<p>${esc(w.found)}</p>` : ""}
        <div class="rc-wfile"><span>File it${w.fileAs ? ` as ${esc(w.fileAs)}` : ""}${r.then.addTo === "project" ? " in the prayer hall project" : ""}${r.then.on === "best" ? " on" : r.then.on ? ` on ${esc(PLACES[r.then.on].name)}` : ""}</span>${r.then.on === "best" ? topicSel(`ws-${w.id}`, w.sug) : ""}${w.status ? `<span>, ${esc(w.status)}</span>` : ""}</div>
        <div class="sm-row">${btn("File it", `data-act="w-file" data-w="${w.id}"`)}${btn("Not this", `data-act="w-no" data-w="${w.id}"`, "quiet")}</div></article>`;
    }
    if (w.kind === "nomatch") {
      return `<article class="rc-w"><span class="rc-k">No routine covers this yet</span><b class="rc-wt">${esc(w.item.title)}</b><p>${esc(cap(KIND_WORD[w.item.kind]))} from ${esc(CH_WORD[w.item.ch])}.</p>
        <div class="rc-wfile">${w.item.about ? `<span>Loci would put it on</span>${topicSel(`ws-${w.id}`, w.item.about)}` : `<span>Nothing on your map fits. Loci would start a sub-topic, <b>${esc(w.item.newTopic)}</b>.</span>`}</div>
        <div class="sm-row">${btn("File it there", `data-act="w-file" data-w="${w.id}"`)}${btn("Leave it in Unsorted", `data-act="w-no" data-w="${w.id}"`, "quiet")}</div>
        <button type="button" class="rc-make" data-act="w-make" data-w="${w.id}">Make a routine for things like this</button></article>`;
    }
    return `<article class="rc-w"><span class="rc-k">${esc(RR(w.rid).name)}</span><b class="rc-wt">${plural(w.items.filter((x) => !x.st).length, "thing")} in To read for over three months</b>
      ${w.items.map((x, i) => `<div class="rc-pile"><span><b>${esc(x.t)}</b> <span class="rc-note">${esc(x.k)} · ${esc(x.since)}</span></span>${x.st ? `<span class="rc-note">${{ week: "This week: added to Today", keep: "Kept", letgo: "Let go (archived)" }[x.st]}</span>` : `<span class="sm-row">${btn("Read it this week", `data-act="p-act" data-w="${w.id}" data-i="${i}" data-v="week"`, "quiet")}${btn("Keep", `data-act="p-act" data-w="${w.id}" data-i="${i}" data-v="keep"`, "quiet")}${btn("Let go", `data-act="p-act" data-w="${w.id}" data-i="${i}" data-v="letgo"`, "quiet")}</span>`}</div>`).join("")}</article>`;
  }
  function routinesView() {
    return `<div class="rc-page"><header class="destination-header"><div class="destination-crumb"><strong>Today</strong><i aria-hidden="true">/</i><span>Routines</span></div></header>
      <div class="rc-layout">
        <div class="rc-main">
          <div class="rc-intro"><h1 class="sm-h1">Routines</h1><p class="sm-lead">Things Loci does for you, the way you asked. To make one, tell Loci. To change one, tap any underlined word.</p></div>
          ${waitingHTML()}
          ${GROUPS.map((g) => { const rs = ROUTINES.filter((r) => r.type === g.type); return `<section class="rc-group" aria-labelledby="g-${g.type}"><div class="rc-group-h"><h2 id="g-${g.type}">${g.name}</h2>${g.line ? `<span>${g.line}</span>` : ""}</div><div class="rc-list">${rs.map(row).join("")}</div></section>`; }).join("")}
        </div>
        ${chatPanel()}
      </div></div>`;
  }

  /* ================================================================ Loci: the conversation that makes and changes routines */
  const lociMsg = (text, extra = {}) => C.msgs.push({ from: "loci", text, ...extra });
  const meMsg = (text) => C.msgs.push({ from: "me", text });
  function think(fn, ms = 650) { C.typing = true; render(); setTimeout(() => { C.typing = false; fn(); render(); }, ms); }
  function startChat() {
    C.msgs = [];
    lociMsg("Tell me what should happen, and when, the way you'd tell an assistant. I'll set it up and show you what it would have done before anything changes.", { chips: chipsOf([
      ["When I email myself a PDF, sum it up in three lines and put it on its topic", "say"],
      ["Every evening, sort what I haven't sorted", "say"],
      ["Keep me up to date on AI in architecture", "say"],
    ]) });
    lociMsg("One thing I noticed: you filed 7 links from dezeen.com as Precedents by hand this month. Shall I do that for you from now on?", { chips: chipsOf([["Yes, do that", "noticed-yes"], ["Not now", "noticed-no"]]), keep: true });
  }
  const chipsOf = (pairs) => pairs.map(([label, a, v]) => ({ label, a, v: v ?? label }));

  /* ---------- reading what the learner says */
  const TIME_RE = /\b(?:at )?(\d{1,2})(?::(\d{2}))? ?(am|pm)\b|\bat (\d{1,2})(?::(\d{2}))?\b/;
  function parseEvery(s, d) {
    let said = false;
    if (/every (morning|day)|each morning|daily/.test(s)) { d.every = "day"; d.time = "07:30"; said = true; }
    if (/every (evening|night)|each evening|nightly|tonight/.test(s)) { d.every = "day"; d.time = "21:00"; said = true; }
    const day = DAYLONG.findIndex((n) => new RegExp(`\\b${n.toLowerCase()}s?\\b`).test(s));
    if (day >= 0) { d.every = "w" + day; said = true; if (!d.time) d.time = /morning/.test(s) ? "08:00" : "17:00"; }
    if (/every month|monthly/.test(s)) { d.every = "month"; d.time = "09:00"; said = true; }
    const tm = s.match(TIME_RE);
    if (tm) { let h = Number(tm[1] || tm[4]), m = Number(tm[2] || tm[5] || 0); if (tm[3] === "pm" && h < 12) h += 12; if (tm[3] === "am" && h === 12) h = 0; if (h < 24) { d.time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`; said = said || !!d.every; } }
    return said;
  }
  const topicIn = (s) => TOPICS.find((p) => s.includes(PLACES[p].name.toLowerCase()) || s.includes(p));
  function intent(s) {
    if (/\b(sort|tidy|organi[sz]e|clean up)\b/.test(s) && /(unsorted|haven't sorted|not sorted|everything|my stuff|my inbox)/.test(s)) return "tidy";
    if (/up to date|keep up|\bfollow\b|\bnews\b|what's new|the latest/.test(s)) return "follow";
    if (/quiz|test me|\breview\b|ask me (questions|about)|what slipped/.test(s)) return "review";
    if (/after i (finish|watch)|when i finish/.test(s)) return "after";
    if (/\b(send|share|email|whatsapp|forward|photo|picture|link|pdf|voice|audio|reel|recipe|book|save)/.test(s)) return "arrive";
    return null;
  }
  function parseArrive(text) {
    const s = text.toLowerCase(), said = {};
    const d = { id: "draft", type: "arrive", name: "", on: true, when: "any", ifs: [], then: thenOf({}), mode: "ask", right: [0, 0], filed: 0, lately: [] };
    const ch = [["whatsapp", /whatsapp/], ["email", /e-?mail/], ["share", /instagram|facebook|tiktok|\breels?\b|from my phone|\bshare/], ["browser", /browser|chrome|safari/]].find(([, re]) => re.test(s));
    if (ch) { d.when = ch[0]; said.channel = true; } else if (/anywhere|any channel/.test(s)) said.channel = true;
    const kind = [["voice note", /voice|audio/], ["photo", /photo|picture|image|screenshot/], ["PDF", /\bpdf/], ["reel", /\breels?\b/], ["video", /video/], ["link", /\blinks?\b/]].find(([, re]) => re.test(s));
    if (kind) d.ifs.push({ t: "kind", v: kind[0] });
    const tag = text.match(/#[\w-]+/); if (tag) d.ifs.push({ t: "tag", v: tag[0].toLowerCase() });
    const site = s.match(/\b([a-z0-9-]+\.(?:com|org|net|io|edu))\b/); if (site) d.ifs.push({ t: "site", v: site[1] });
    const is = [["a recipe", /recipe/], ["a paper", /\bpapers?\b/], ["a lecture", /lecture/], ["a book", /\bbooks?\b/]].find(([, re]) => re.test(s));
    if (is) d.ifs.push({ t: "is", v: is[0] });
    if (d.ifs.length) said.what = true;
    const fa = FILE_AS.find((v) => s.includes(v.toLowerCase())); if (fa) { d.then.fileAs = fa; said.where = true; }
    const tp = topicIn(s); if (tp) { d.then.on = tp; said.where = true; }
    if (/its topic|the topic it's about|where it belongs|right topic/.test(s)) { d.then.on = "best"; said.where = true; }
    if (/project|prayer hall/.test(s)) { d.then.addTo = "project"; if (!tp && !/topic/.test(s)) d.then.on = ""; said.where = true; }
    if (/to read|reading list/.test(s)) d.then.status = "To read";
    const U = [["describe", /describe|caption it/], ["transcribe", /write (it )?out|transcribe|what i said/], ["summary", /summar|three lines|3 lines/], ["text", /pull (out )?the text|extract/], ["links", /links? (in|inside)|caption links/], ["book", /find the book/], ["recipe", /just (keep )?the recipe|keep (just )?the recipe/]];
    d.then.understand = U.filter(([, re]) => re.test(s)).map(([k]) => k);
    if (d.then.understand.includes("summary") && !d.then.understand.includes("text")) d.then.understand.unshift("text");
    if (/question/.test(s)) d.then.learn.push("questions");
    if (d.then.understand.length || d.then.learn.length || d.then.status) said.extra = true;
    if (d.when === "whatsapp" && /tell me|reply|let me know/.test(s)) d.then.reply = "confirm";
    if (/just (file|do|put)|automatically|on its own|without asking|don't ask/.test(s)) { d.mode = "own"; said.mode = true; }
    if (/ask me first|check with me/.test(s)) { d.mode = "ask"; said.mode = true; }
    return { d, said };
  }
  const autoName = (d) => { const k = d.ifs.find((c) => c.t === "kind")?.v; return d.then.fileAs || `${k ? (k === "PDF" ? "PDFs" : cap(k) + "s") : "Things"}${d.when !== "any" ? ` ${CH_PREP[d.when]} ${CH_WORD[d.when]}` : ""}`; };
  function offerFor(d) {
    const k = d.ifs.find((c) => c.t === "kind")?.v, is = d.ifs.find((c) => c.t === "is")?.v;
    if (is === "a book") return ["book", "Shall I find each book in a library catalogue and mark it To read?"];
    if (is === "a recipe") return ["recipe", "Shall I keep just the recipe, and leave the rest of the post?"];
    return ({ photo: ["describe", "Shall I describe each photo, so you can search for it later?"], "voice note": ["transcribe", "Shall I write out what you said, and keep any questions you ask?"], PDF: ["summary", "Shall I pull out the text and give you a three-line summary?"], reel: ["links", "Shall I save the links in the caption as well?"], link: ["status", "Shall I mark them To read?"] })[k] || null;
  }

  /* ---------- the questions, asked one at a time, only when something's missing */
  function ask() {
    const d = C.draft, q = C.q.shift();
    if (!q) return preview();
    const A = {
      channel: () => lociMsg("Where will you send these from?", { chips: chipsOf([["WhatsApp", "set-channel", "whatsapp"], ["Email", "set-channel", "email"], ["Sharing from my phone", "set-channel", "share"], ["Anywhere", "set-channel", "any"]]) }),
      what: () => lociMsg("Which kind of thing?", { chips: chipsOf(ITEM_KINDS.map((k) => [cap(k === "PDF" ? "PDFs" : k + "s"), "set-kind", k])) }),
      where: () => lociMsg("Where should they go?", { chips: chipsOf([["On the topic each one is about", "set-on", "best"], ["In the prayer hall project", "set-on", "project"], ["On a topic I choose", "set-on", "pick"]]) }),
      pick: () => lociMsg("Which topic?", { chips: chipsOf(TOPICS.map((p) => [PLACES[p].name, "set-on", p])) }),
      extra: () => { const o = offerFor(d); if (!o) return ask(); lociMsg(o[1], { chips: chipsOf([["Yes", "set-extra", o[0]], ["No thanks", "set-extra", ""]]) }); },
      mode: () => lociMsg("Should I ask you before filing each one, or just file it? Either way, you can undo anything. I'd start by asking; once I've been right a few times, I'll offer to stop.", { chips: chipsOf([["Ask me first", "set-mode", "ask"], ["Just file them", "set-mode", "own"]]) }),
      tidyEvery: () => lociMsg("When should I go through it?", { chips: chipsOf([["Every evening", "set-every", "day|21:00"], ["Sunday evenings", "set-every", "w0|19:00"], ["Every morning", "set-every", "day|07:30"]]) }),
      tidyMode: () => lociMsg("When I'm sure where something belongs, should I just file it?", { chips: chipsOf([["Yes, file what you're sure of", "set-tidymode", "own"], ["No, ask me about everything", "set-tidymode", "ask"]]) }),
      followTopic: () => lociMsg("Which topic should I follow?", { chips: chipsOf(TOPICS.slice(0, 5).map((p) => [PLACES[p].name, "set-place", p])) }),
      sources: () => lociMsg("Which sources should I read? These are the ones you save from most. Untick any you don't want.", { chips: SOURCES.map((x, i) => ({ label: x, a: "src-toggle", v: String(i), toggle: true })) }),
      followEvery: () => lociMsg("How often?", { chips: chipsOf([["Every morning", "set-every", "day|07:30"], ["Monday mornings", "set-every", "w1|08:00"]]) }),
      reviewPlace: () => lociMsg("Which topic?", { chips: chipsOf(TOPICS.slice(0, 5).map((p) => [PLACES[p].name, "set-place", p])) }),
      reviewCount: () => lociMsg("How many questions?", { chips: chipsOf([["3, about two minutes", "set-count", "3"], ["5, about four minutes", "set-count", "5"]]) }),
      reviewEvery: () => lociMsg("When?", { chips: chipsOf([["Friday evenings", "set-every", "w5|17:00"], ["Every morning", "set-every", "day|07:30"]]) }),
      delay: () => lociMsg("When should the check come back?", { chips: chipsOf([["The next day", "set-delay", "the next day"], ["Three days later", "set-delay", "three days later"], ["A week later", "set-delay", "a week later"]]) }),
    };
    A[q]();
  }
  // an earlier draft card becomes a still snapshot once something else starts
  function snapDrafts() {
    const d = C.draft;
    C.msgs.forEach((m) => { if (m.card === "draft") { m.card = "snap"; m.snap = d ? sentence(d, "snap").replace(/<button[^>]*>/g, "<u>").replace(/<\/button>/g, "</u>") : ""; } });
  }
  function begin(text) {
    const s = text.toLowerCase(), kind = intent(s);
    C.target = null; snapDrafts(); C.draft = null; C.q = [];
    if (!kind) { lociMsg("I didn't catch what should happen. Tell me when it happens and what I should do, for example:", { chips: chipsOf([["When I send a voice note on WhatsApp, write it out", "say"], ["Every evening, sort what I haven't sorted", "say"]]) }); return; }
    if (kind === "arrive") {
      const { d, said } = parseArrive(text);
      C.draft = d; C.q = [];
      const twin = ROUTINES.find((r) => r.type === "arrive" && r.when === d.when && d.ifs.length && d.ifs.every((c) => r.ifs.some((x) => x.t === c.t && x.v === c.v)));
      if (twin) { lociMsg(`You already have “${twin.name}”, which does most of this. Change that one instead?`, { chips: chipsOf([[`Change “${twin.name}”`, "change", twin.id], ["Make a new one anyway", "anyway"]]) }); C.pendingSaid = said; return; }
      queueArrive(said);
      lociMsg(understood(d)); ask(); return;
    }
    const d = { id: "draft", type: kind === "after" ? "after" : "schedule", on: true, lately: [] };
    if (kind === "tidy") { Object.assign(d, { kind: "tidy", name: "Tidy Unsorted", every: null, time: null, mode: null, stat: "New" }); C.q = []; if (!parseEvery(s, d)) C.q.push("tidyEvery"); C.q.push("tidyMode"); lociMsg("Got it: I'll go through what's in Unsorted and put each thing where it belongs."); }
    if (kind === "follow") {
      const tp = topicIn(s), m = text.match(/(?:on|about) (.+?)(?:[.,!]|$)/i);
      Object.assign(d, { kind: "follow", name: "Follow", place: tp || "you", label: !tp && m ? m[1].trim() : "", sources: SOURCES.slice(0, 4), every: null, time: null, stat: "New" });
      d.name = `Follow: ${d.label || PLACES[d.place].name}`; C.q = [];
      if (!tp && !m) C.q.push("followTopic");
      C.q.push("sources"); if (!parseEvery(s, d)) C.q.push("followEvery");
      lociMsg(d.label ? `“${cap(d.label)}” isn't a topic on your map yet, so I'll watch for it across your whole map and sort what comes in onto the right topics. If it keeps coming up, I'll suggest a sub-topic.` : "Got it: I'll bring you what's new and sort it onto your topics.");
    }
    if (kind === "review") { Object.assign(d, { kind: "review", name: "Review", place: topicIn(s) || null, count: /\b5\b|five/.test(s) ? 5 : /\b3\b|three/.test(s) ? 3 : null, every: null, time: null, stat: "New" }); C.q = []; if (!d.place) C.q.push("reviewPlace"); if (!d.count) C.q.push("reviewCount"); if (!parseEvery(s, d)) C.q.push("reviewEvery"); lociMsg("Got it: short questions on what you got wrong lately, so it sticks."); }
    if (kind === "after") { Object.assign(d, { kind: "lumen", name: "After a Lumen", delay: /next day|tomorrow/.test(s) ? "the next day" : /week/.test(s) ? "a week later" : /three|3/.test(s) ? "three days later" : null, stat: "New" }); C.q = d.delay ? [] : ["delay"]; lociMsg("Got it: after each Lumen, its check comes back to you later, when it's worth testing."); }
    C.draft = d; ask();
  }
  function queueArrive(said) {
    C.q = [];
    if (!said.channel) C.q.push("channel");
    if (!said.what) C.q.push("what");
    if (!said.where) C.q.push("where");
    if (!said.extra) C.q.push("extra");
    if (!said.mode) C.q.push("mode");
  }
  function understood(d) {
    const kind = d.ifs.find((c) => c.t === "kind")?.v, is = d.ifs.find((c) => c.t === "is")?.v;
    const what = kind ? (kind === "PDF" ? "PDFs" : kind + "s") : is ? is.replace(/^an? /, "") + "s" : "things";
    const bits = [what, d.when !== "any" ? `${CH_PREP[d.when]} ${CH_WORD[d.when]}` : ""].filter(Boolean).join(" ");
    const n = C.q.filter((q) => q !== "extra" || offerFor(d)).length;
    return `Got it: ${bits}. ${n === 0 ? "Here's what I'd set up." : n === 1 ? "One quick question, then I'll show you what it would do." : "A few quick questions, then I'll show you what it would do."}`;
  }
  function preview() {
    const d = C.draft;
    if (!d.name || d.name === "Follow") d.name = d.type === "arrive" ? autoName(d) : d.name;
    snapDrafts();
    const lead = d.type === "arrive" ? "Here it is. Tap any underlined word to change it." : d.kind === "tidy" ? "Here it is. Last night it would have placed 4 of the 9 things in Unsorted, and asked you about 2." : d.kind === "follow" ? "Here it is. This morning it would have brought you 5 things, each on its topic." : "Here it is.";
    lociMsg(lead, { card: "draft" });
  }
  function turnOn() {
    const d = C.draft; if (!d) return;
    const r = { ...JSON.parse(JSON.stringify(d)), id: "r" + ++rid, on: true };
    if (r.type === "arrive") { r.right = [0, 0]; r.filed = 0; r.lately = []; ROUTINES.unshift(r); }
    else { r.stat = r.type === "schedule" ? "New · nothing yet" : "New"; r.lately = []; const k = ROUTINES.findIndex((x) => x.type === r.type); ROUTINES.splice(k < 0 ? ROUTINES.length : k, 0, r); }
    C.msgs.forEach((m) => { if (m.card === "draft") { m.card = "snap"; m.snap = sentence(r, "snap").replace(/<button[^>]*>/g, "<u>").replace(/<\/button>/g, "</u>"); m.done = true; } });
    C.draft = null; C.q = [];
    S.flash = r.id; setTimeout(() => { S.flash = null; render(); }, 2200);
    const first = r.type === "arrive" ? ` It's first under “When I send something”, so it gets the first look.${r.mode === "ask" ? " I'll ask you about the first few so you can check me." : ""}` : r.type === "schedule" ? ` First run: ${fNext(nextRun(r))}.` : "";
    lociMsg(`Done. “${r.name}” is on.${first}`, { chips: chipsOf([["Make another", "another"], ["That's all", "bye"]]) });
    if (S.chatOpen && matchMedia("(max-width: 900px)").matches) setTimeout(() => { S.chatOpen = false; render(); $(`#row-${r.id}`, root)?.scrollIntoView({ block: "center" }); }, 1400);
    else setTimeout(() => $(`#row-${r.id}`, root)?.scrollIntoView({ block: "center", behavior: "smooth" }), 50);
  }

  /* ---------- changing something, by saying it (a draft, or a routine that's on) */
  function applyChange(r, text) {
    const s = text.toLowerCase(), done = [];
    if (/ask me first|check with me|ask me before/.test(s) && r.type === "arrive") { r.mode = "ask"; done.push("it asks you first"); }
    if (/just file|stop asking|don't ask|on its own|automatically/.test(s) && r.type === "arrive") { r.mode = "own"; done.push("it files on its own"); }
    if (/pause|turn (it )?off|stop it/.test(s)) { r.on = false; done.push("it's paused"); }
    if (/turn (it )?(back )?on|resume|unpause/.test(s)) { r.on = true; done.push("it's on"); }
    if (r.type === "arrive") {
      const U = [["describe", /describe/], ["transcribe", /write (it )?out|transcribe/], ["summary", /summar|three lines/], ["links", /links/], ["book", /find the book/], ["recipe", /recipe/]];
      U.forEach(([k, re]) => { if (re.test(s) && /\b(also|and|add|plus|too)\b/.test(s) && !r.then.understand.includes(k)) { r.then.understand.push(k); done.push(`it will ${UND[k]}`); } });
      if (/question/.test(s) && !r.then.learn.includes("questions")) { r.then.learn.push("questions"); done.push("questions become @questions"); }
      if (/to read/.test(s) && r.then.status !== "To read") { r.then.status = "To read"; done.push("they're marked To read"); }
      if (/tell me|let me know|reply/.test(s) && r.when === "whatsapp") { r.then.reply = "confirm"; done.push("it tells you on WhatsApp"); }
      const tp = topicIn(s); if (tp && /\b(on|to|under|into)\b/.test(s)) { r.then.on = tp; done.push(`they go on ${PLACES[tp].name}`); }
      if (/project|prayer hall/.test(s)) { r.then.addTo = "project"; done.push("they go in the prayer hall project"); }
      const ch = [["whatsapp", /whatsapp/], ["email", /e-?mail/], ["share", /from my phone|instagram/], ["any", /anywhere/]].find(([, re]) => re.test(s)); if (ch && ch[0] !== r.when && /\b(only|instead|from now on|listen)\b/.test(s)) { r.when = ch[0]; done.push(`it listens ${CH_PREP[ch[0]]} ${CH_WORD[ch[0]]}`); }
      const site = s.match(/\b([a-z0-9-]+\.(?:com|org|net|io|edu))\b/); if (site) { const c = r.ifs.find((x) => x.t === "site"); if (c && !c.v.includes(site[1])) { c.v += `, ${site[1]}`; done.push(`it covers ${site[1]} too`); } }
    }
    if (r.type === "schedule" && parseEvery(s, r)) done.push(`it runs ${everyText(r).toLowerCase()}`);
    const nm = text.match(/(?:call it|rename it(?: to)?|name it) [“"']?([^”"']+)[”"']?/i); if (nm) { r.name = nm[1].trim().replace(/[.!]$/, ""); done.push(`it's called “${r.name}”`); }
    return done;
  }
  function onSay(text) {
    const low = text.toLowerCase().trim().replace(/[.!]$/, "");
    const pending = [...C.msgs].reverse().find((x) => x.from === "loci" && x.chips && !x.answered);
    const hit = pending && C.msgs.indexOf(pending) > C.msgs.map((x) => x.from).lastIndexOf("me") && pending.chips.find((c) => !c.toggle && c.a !== "say" && (c.label.toLowerCase() === low || c.label.toLowerCase().startsWith(low) || (low.length > 3 && c.label.toLowerCase().includes(low))));
    if (hit) { onChip(pending, hit, text); return; }
    meMsg(text);
    const s = text.toLowerCase();
    think(() => {
      if (C.pendingDelete) { const r = RR(C.pendingDelete); if (/\b(yes|delete)\b/.test(s)) { deleteRoutine(r); } else lociMsg("Kept it."); C.pendingDelete = null; return; }
      if (/^(cancel|never mind|stop|forget it)/.test(s)) { snapDrafts(); C.draft = null; C.q = []; C.target = null; lociMsg("Cancelled. Nothing changed."); return; }
      if (C.target) {
        const r = RR(C.target);
        if (/delete|remove (it|this)/.test(s)) { C.pendingDelete = r.id; lociMsg(`Delete “${r.name}”? What it already filed stays where it is.`, { chips: chipsOf([["Delete it", "del-yes", r.id], ["Keep it", "del-no"]]) }); return; }
        const before = JSON.stringify(r), done = applyChange(r, text);
        if (done.length) { lociMsg(`Done: ${andJoin(done)}.`, { chips: chipsOf([["Undo that", "undo-change", r.id]]), undo: before }); S.flash = r.id; setTimeout(() => { S.flash = null; render(); }, 1600); }
        else lociMsg(`I didn't catch a change to “${r.name}”. Try “ask me first”, “also describe them”, “pause it”, or tap the underlined words in its card.`);
        return;
      }
      if (C.draft) {
        if (C.draft.type === "arrive" && C.q.length && C.q[0] !== "mode" && intent(s) === "arrive" && s.split(" ").length > 6) { begin(text); return; }
        const done = applyChange(C.draft, text);
        if (done.length) { lociMsg(`Changed: ${andJoin(done)}.`); if (!C.q.length) preview(); else ask(); }
        else if (intent(s)) begin(text);
        else lociMsg("I didn't catch that. Tap one of the answers above, tap an underlined word in the card, or say something like “ask me first”.");
        return;
      }
      begin(text);
    });
  }
  function onChip(m, ch, typed) {
    const d = C.draft, v = ch.v;
    m.answered = ch.label;
    if (ch.a === "say") { onSay(ch.label); return; }
    meMsg(typed || ch.label);
    think(() => {
      switch (ch.a) {
        case "noticed-yes": { C.target = null; const r = ROUTINES.find((x) => x.name === "Precedents"); const c = r.ifs.find((x) => x.t === "site"); c.v += ", dezeen.com"; S.flash = r.id; setTimeout(() => { S.flash = null; render(); }, 2200); lociMsg("Done. “Precedents” now files links from dezeen.com too, as Precedents on the topic each one is about, To read. Of your last 20 things, 3 would have gone there.", { chips: chipsOf([["Undo that", "undo-noticed"]]) }); return; }
        case "noticed-no": C.target = null; lociMsg("Fine. I won't ask again unless you keep doing it."); return;
        case "undo-noticed": { const r = ROUTINES.find((x) => x.name === "Precedents"); r.ifs.find((x) => x.t === "site").v = "archdaily.com"; lociMsg("Undone. “Precedents” covers archdaily.com only, as before."); return; }
        case "set-channel": d.when = v; break;
        case "set-kind": d.ifs.unshift({ t: "kind", v }); break;
        case "set-on": if (v === "pick") { C.q.unshift("pick"); break; } if (v === "project") { d.then.addTo = "project"; d.then.on = ""; } else d.then.on = v; break;
        case "set-extra": if (v === "status") d.then.status = "To read"; else if (v === "summary") d.then.understand.push("text", "summary"); else if (v === "transcribe") { d.then.understand.push("transcribe"); d.then.learn.push("questions"); } else if (v === "book") { d.then.understand.push("book"); d.then.status = "To read"; } else if (v) d.then.understand.push(v); break;
        case "set-mode": d.mode = v; break;
        case "set-every": { const [e, t] = v.split("|"); d.every = e; d.time = t; break; }
        case "set-tidymode": d.mode = v; break;
        case "set-place": d.place = v; if (d.kind === "follow") d.name = `Follow: ${PLACES[v].name}`; if (d.kind === "review") d.name = `${PLACES[v].name} review`; break;
        case "set-count": d.count = Number(v); break;
        case "set-delay": d.delay = v; break;
        case "src-done": break;
        case "turn-on": turnOn(); return;
        case "tweak": lociMsg("Tap any underlined word in the card to change it, or tell me what to change, like “ask me first” or “also describe them”."); return;
        case "anyway": queueArrive(C.pendingSaid || {}); lociMsg(understood(C.draft)); ask(); return;
        case "change": startChange(v, true); return;
        case "undo-change": { const mm = C.msgs.find((x) => x.chips && x.chips.includes(ch)); const r = RR(v); if (mm?.undo && r) Object.assign(r, JSON.parse(mm.undo)); lociMsg("Undone."); return; }
        case "del-yes": deleteRoutine(RR(v)); C.pendingDelete = null; return;
        case "del-no": C.pendingDelete = null; lociMsg("Kept it."); return;
        case "another": C.target = null; lociMsg("What should happen? Tell me, or pick one:", { chips: chipsOf([["When I share a reel, save the links in its caption", "say"], ["Every Friday, quiz me on what slipped", "say"], ["After I finish a Lumen, check me a week later", "say"]]) }); return;
        case "bye": lociMsg("I'm here whenever you want to make or change one."); return;
        case "c-ask": case "c-own": { const r = RR(v), before = JSON.stringify(r); r.mode = ch.a === "c-ask" ? "ask" : "own"; lociMsg(`Done: “${r.name}” ${r.mode === "ask" ? "asks you first" : "files on its own"} now.`, { chips: chipsOf([["Undo that", "undo-change", r.id]]), undo: before }); return; }
        case "c-pause": { const r = RR(v), before = JSON.stringify(r); r.on = !r.on; lociMsg(`Done: “${r.name}” is ${r.on ? "on" : "paused"}.`, { chips: chipsOf([["Undo that", "undo-change", r.id]]), undo: before }); return; }
        case "c-del": { const r = RR(v); C.pendingDelete = r.id; lociMsg(`Delete “${r.name}”? What it already filed stays where it is.`, { chips: chipsOf([["Delete it", "del-yes", r.id], ["Keep it", "del-no"]]) }); return; }
        case "c-done": C.target = null; lociMsg("Done changing it."); return;
      }
      ask();
    }, 450);
  }
  function startChange(id, inChat = false) {
    const r = RR(id); snapDrafts(); C.target = id; C.draft = null; C.q = [];
    if (!inChat) meMsg(`Change “${r.name}”`);
    const opts = [];
    if (r.type === "arrive") opts.push(r.mode === "own" ? [`Ask me first`, "c-ask", id] : [`Stop asking, just file them`, "c-own", id]);
    opts.push([r.on ? "Pause it" : "Turn it back on", "c-pause", id], ["Delete it", "c-del", id], ["Nothing, thanks", "c-done"]);
    lociMsg(`What should change about “${r.name}”? Pick one, tell me, or tap the underlined words in its card.`, { chips: chipsOf(opts) });
  }
  function deleteRoutine(r) {
    const k = ROUTINES.indexOf(r); if (k < 0) return;
    ROUTINES.splice(k, 1); if (S.open === r.id) S.open = null; C.target = null;
    lociMsg(`Deleted “${r.name}”. What it filed stays where it is.`, { chips: chipsOf([["Bring it back", "restore"]]) });
    restoreStack.push([k, r]);
  }
  const restoreStack = [];

  /* ---------- the chat panel */
  function msgHTML(m, i) {
    if (m.from === "me") return `<div class="lk-me">${esc(m.text)}</div>`;
    const last = i === C.msgs.length - 1 || C.msgs.slice(i + 1).every((x) => x.from !== "me");
    let card = "";
    if (m.card === "draft" && C.draft) {
      const d = C.draft;
      card = `<div class="rc-draft"><span class="rc-k">New routine · ${GROUPS.find((g) => g.type === d.type).name}</span><b class="rc-dname">${esc(d.name)}</b><p class="rc-say">${sentence(d, "draft")}</p>${d.type === "arrive" ? `<p class="rc-meta">${chip("draft", "mode", modeLabel(d))}</p>${tryHTML(d)}` : ""}${S.builder ? `<p class="rc-builder"><b>Builder:</b> ${d.type === "arrive" ? (d.ifs.some((c) => c.t === "is") || d.then.on === "best" || d.then.understand.length ? "Plain rules match the channel and kind; Loci reads each matching item for the dotted parts (one small call each)." : "Plain rules only: no model, no cost.") : "One small model call per run; skipped when nothing is new."}</p>` : ""}
        <div class="sm-row">${btn("Turn it on", 'data-act="turn-on"')}${btn("Change something", 'data-act="tweak"', "quiet")}</div></div>`;
    } else if (m.card === "snap" && m.snap) card = `<div class="rc-draft" data-snap><span class="rc-k">${m.done ? "Turned on" : "Earlier draft"}</span><p class="rc-say">${m.snap}</p></div>`;
    const chips = m.chips && !m.answered && (last || m.keep) ? `<div class="rc-chips">${m.chips.map((c, j) => `<button type="button" class="chip-btn rc-answer" data-act="c-pick" data-m="${i}" data-c="${j}"${c.toggle ? ` aria-pressed="${!(C.srcOff || new Set()).has(c.v)}"` : ""}>${c.toggle ? `<span class="rc-tick" aria-hidden="true"></span>` : ""}${esc(c.label)}</button>`).join("")}${m.chips.some((c) => c.toggle) ? btn("Use these", `data-act="c-srcdone" data-m="${i}"`, "quiet") : ""}</div>` : "";
    return `<div class="lk-loci rc-loci"><p>${esc(m.text)}</p>${card}${chips}</div>`;
  }
  function chatPanel() {
    const target = C.target ? RR(C.target) : null;
    return `<aside class="rc-chat${S.chatOpen ? " is-open" : ""}" aria-label="Make or change a routine with Loci">
      <div class="rc-chat-h"><div><b>Loci</b><span>Make or change a routine by saying it</span></div><button type="button" class="button button-link rc-chat-close" data-act="chat-close">Close</button></div>
      <div class="rc-msgs" id="rc-msgs" aria-live="polite">${C.msgs.map(msgHTML).join("")}${C.typing ? '<div class="rc-typing" aria-label="Loci is writing"><i></i><i></i><i></i></div>' : ""}</div>
      <form class="rc-input" data-form="chat">${target ? `<span class="rc-ctx">Changing: ${esc(target.name)}<button type="button" data-act="ctx-clear" aria-label="Stop changing ${esc(target.name)}">×</button></span>` : ""}
        <div class="rc-box"><textarea id="rc-text" rows="2" placeholder="${target ? `What should change about “${esc(target.name)}”?` : "Tell Loci what should happen…"}">${esc(C.input)}</textarea><button type="submit" class="rc-send" aria-label="Send">${ICON.send}</button></div>
      </form></aside>`;
  }

  /* ================================================================ tap a word to change it (the popover) */
  const POP_TITLE = { when: "Sent from", kind: "Which kind of thing", tag: "The tag", site: "From the site", words: "Mentioning", is: "Loci reads that it's", about: "About", fileAs: "File it as", on: "On", status: "Reading status", addTo: "Also add to", mode: "Before it files", every: "When", place: "Which topic", count: "How many", delay: "When it comes back", sources: "Sources", tidymode: "When Loci is sure" };
  function popOpts(r, f) {
    const t = r.then || {};
    const O = {
      when: CH_OPTS, kind: ITEM_KINDS.map((k) => [k, cap(KIND_WORD[k])]), is: IS_OPTS.map((x) => [x, cap(x)]), about: TOPICS.map((p) => [p, PLACES[p].name]),
      fileAs: [["", "Keep the kind it came as"], ...FILE_AS.map((x) => [x, x])], on: [["best", "The topic it's about (Loci works it out)"], ...TOPICS.map((p) => [p, PLACES[p].name]), ["", "No topic"]],
      status: [["To read", "To read"], ["Reading", "Reading"], ["", "Leave it as it is"]], addTo: [["project", "The prayer hall project"], ["", "Nothing else"]],
      mode: [["ask", "Ask me first"], ["own", "File on its own"]], tidymode: [["own", "File what it's sure of, ask about the rest"], ["ask", "Ask me about each thing"]],
      every: [["day", "Every day"], ["weekdays", "Weekdays"], ...[1, 2, 3, 4, 5, 6, 0].map((d) => ["w" + d, `Every ${DAYLONG[d]}`]), ["month", "Every month"]],
      place: [["you", "My whole map"], ...TOPICS.slice(0, 5).map((p) => [p, PLACES[p].name])], count: [["3", "3 questions, about two minutes"], ["5", "5 questions, about four minutes"]],
      delay: [["the next day", "The next day"], ["three days later", "Three days later"], ["a week later", "A week later"]],
    };
    const cur = { when: r.when, kind: r.ifs?.find((c) => c.t === "kind")?.v, is: r.ifs?.find((c) => c.t === "is")?.v, about: r.ifs?.find((c) => c.t === "about")?.v, fileAs: t.fileAs, on: t.on, status: t.status, addTo: t.addTo, mode: r.mode, tidymode: r.mode, every: r.every, place: r.place, count: String(r.count), delay: r.delay }[f];
    return [O[f], cur];
  }
  function popHTML() {
    const P = S.pop, r = P.r === "draft" ? C.draft : RR(P.r); if (!r) return "";
    const f = P.f, style = `left:${P.x}px;top:${P.y}px`;
    let body;
    if (["tag", "site", "words"].includes(f)) { const c = r.ifs.find((x) => x.t === f); body = `<input class="sm-input" id="pop-text" value="${esc(c?.v || "")}" aria-label="${POP_TITLE[f]}"><div class="sm-row">${btn("Done", 'data-act="pop-text"')}${act("Remove this condition", 'data-act="pop-remove"')}</div>`; }
    else if (f === "sources") body = SOURCES.map((x) => `<button type="button" class="rc-opt" data-act="pop-src" data-v="${esc(x)}" aria-pressed="${r.sources.includes(x)}">${esc(x)}</button>`).join("");
    else {
      const [opts, cur] = popOpts(r, f);
      body = opts.map(([v, l]) => `<button type="button" class="rc-opt" data-act="pop-set" data-v="${esc(v)}" aria-pressed="${String(v) === String(cur ?? "")}">${esc(l)}</button>`).join("");
      if (f === "every" && r.every !== "month") body += `<label class="rc-poptime"><span>At</span><input class="sm-input" type="time" id="pop-time" value="${esc(r.time)}"></label>`;
    }
    return `<div class="rc-pop" style="${style}" role="dialog" aria-label="${POP_TITLE[f]}"><span class="rc-k">${POP_TITLE[f]}</span>${body}</div>`;
  }
  function setField(r, f, v) {
    const cond = (t) => { let c = r.ifs.find((x) => x.t === t); if (!c) { c = { t, v }; r.ifs.push(c); } c.v = v; };
    if (["kind", "is", "about", "tag", "site", "words"].includes(f)) cond(f);
    else if (["fileAs", "on", "status", "addTo"].includes(f)) { r.then[f] = v; if (f === "addTo" && !v && !r.then.on) r.then.on = "best"; }
    else if (f === "when") { r.when = v; if (v !== "whatsapp") r.then.reply = ""; }
    else if (f === "mode" || f === "tidymode") r.mode = v;
    else if (f === "every") { r.every = v; if (v === "month") r.time = "09:00"; }
    else if (f === "count") r.count = Number(v);
    else if (f === "place") { r.place = v; r.label = ""; if (r.kind === "follow") r.name = `Follow: ${PLACES[v].name}`; }
    else r[f] = v;
  }
  function changed(r, before) {
    if (r.id === "draft") return;
    S.flash = r.id; setTimeout(() => { S.flash = null; render(); }, 1400);
    toast(`Changed “${r.name}”.`, () => Object.assign(r, JSON.parse(before)));
  }

  /* ================================================================ arrivals (prototype bar: Send something) */
  function send(id) {
    const m = SEND.find((x) => x.id === id); S.sent.add(id); S.sendOpen = false;
    toast(`Arriving ${CH_PREP[m.ch]} ${CH_WORD[m.ch]}: ${m.title}…`);
    render();
    setTimeout(() => {
      const dup = ROUTINES.find((r) => r.kind === "dup" && r.on);
      if (m.dup && dup) { dup.lately.unshift({ t: m.title, w: "already saved 19 Oct · nothing added", when: "Just now" }); toast(`You already have “${m.title}” (saved 19 Oct). Nothing added.`); render(); return; }
      const r = firstFit(m);
      if (!r) { W.unshift({ id: "w" + ++wid, kind: "nomatch", item: m }); toast(`No routine covers “${m.title}” yet. It's waiting for you.`); pulse(); render(); return; }
      if (r.mode === "own") {
        r.filed++; r.lately.unshift({ t: m.newTitle || m.title, w: whereFor(r, m), when: "Just now", undo: true });
        toast(`“${r.name}” filed “${m.newTitle || m.title}” ${whereFor(r, m)}.`, () => { r.lately.shift(); r.filed--; });
      } else {
        W.unshift({ id: "w" + ++wid, kind: "single", rid: r.id, title: m.title, newTitle: m.newTitle, found: m.found || "", sug: m.about || r.then.on || "climate", fileAs: r.then.fileAs, status: r.then.status });
        toast(`“${r.name}” suggests a place for “${m.newTitle || m.title}”. It's waiting for you.`); pulse();
      }
      render();
    }, 800);
  }
  function pulse() { S.pulse = true; setTimeout(() => { S.pulse = false; render(); }, 1600); }

  /* ================================================================ Today */
  function todayView() {
    shell("today");
    $$(`.navigation-rail .navigation-link[href="/today"], .tab-bar .tab-bar-link[href="/today"]`, root).forEach((a) => a.setAttribute("aria-current", "page"));
    const h1 = $(".td-head h1", root); if (h1) h1.innerHTML = "Today <span>Monday 26 October</span>";
    const tm = $(".td-head time", root); if (tm) tm.textContent = "08:10 AM";
    const strip = $(".td-strip", root);
    if (strip) strip.innerHTML = [["M", 26], ["T", 27], ["W", 28], ["T", 29], ["F", 30], ["S", 31], ["S", 1]].map(([l, n], i) => `<button type="button" aria-pressed="${!i}"${i ? " disabled" : ' class="is-on"'}>${l}<b>${n}</b>${i ? "" : "<i></i>"}</button>`).join("");
    $$(".td-ev", root).forEach((x) => x.remove());
    const dl = $(".td-dayline", root); if (dl) dl.innerHTML = "<b>Today</b> · your routines filed 6 things overnight";
    const filed = 6 + ROUTINES.reduce((a, r) => a + (r.lately || []).filter((x) => x.when === "Just now" && x.undo).length, 0);
    $(".td-top", root)?.insertAdjacentHTML("afterend", `<section class="rc-today" aria-labelledby="rc-today-h"><div class="td-h is-plain"><h2 id="rc-today-h">From your routines</h2><span><a href="#routines" data-go="routines">All routines</a></span></div>
      <button type="button" class="rc-todaycard" data-act="today-look"><span class="rc-k">Since yesterday evening</span><b>Your routines filed ${filed} things for you.${W.length ? ` ${plural(W.length, "thing is", "things are")} waiting for a quick look.` : ""}</b><em>${W.length ? "Look now" : "See your routines"}</em></button></section>`);
  }

  /* ================================================================ rendering */
  function shell(name) {
    root.innerHTML = DATA.screens[name];
    $$(".navigation-rail .navigation-link[href], .tab-bar .tab-bar-link[href]", root).forEach((a) => a.removeAttribute("aria-current"));
    $$(".account-name", root).forEach((x) => (x.textContent = "Layla Haddad"));
    $$(".account-avatar", root).forEach((x) => (x.textContent = "LH"));
    $$(".account-trigger", root).forEach((x) => { x.setAttribute("aria-label", "Account menu for Layla Haddad"); x.title = "Layla Haddad"; });
  }
  let toastMsg = null, toastTimer = 0, undoFn = null;
  function toast(t, undo) { undoFn = undo || null; toastMsg = { t, undo: !!undo }; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toastMsg = null; undoFn = null; $(".sm-toast", root)?.remove(); }, 5200); }
  function render() {
    const scroll = window.scrollY, active = document.activeElement?.id;
    if (S.view === "today") todayView();
    else {
      shell("library");
      $$(`.navigation-rail .navigation-link[href="/today"], .tab-bar .tab-bar-link[href="/today"]`, root).forEach((a) => a.setAttribute("aria-current", "page"));
      $("main", root).innerHTML = routinesView();
      if (!S.chatOpen) root.insertAdjacentHTML("beforeend", `<button type="button" class="rc-bar" data-act="chat-open"><span>Tell Loci what should happen…</span><i aria-hidden="true">${ICON.send}</i></button>`);
    }
    if (S.pop) root.insertAdjacentHTML("beforeend", popHTML());
    root.insertAdjacentHTML("beforeend", `<div class="sm-proto rc-proto" role="group" aria-label="Prototype controls"><span>Prototype</span>${[["routines", "Routines"], ["today", "Today"]].map(([k, l]) => `<button type="button" data-go="${k}" aria-pressed="${S.view === k}">${l}</button>`).join("")}<i class="sm-proto-sep" aria-hidden="true"></i><button type="button" data-act="send-open" aria-expanded="${S.sendOpen}">Send something…</button><button type="button" data-act="builder" aria-pressed="${S.builder}">Builder</button></div>`);
    if (S.sendOpen) root.insertAdjacentHTML("beforeend", `<div class="rc-sendpop" role="dialog" aria-label="Send something"><span class="rc-k">Send something to Studiolo (simulated)</span>${SEND.map((m) => `<button type="button" class="rc-opt" data-act="send" data-v="${m.id}"${S.sent.has(m.id) ? " disabled" : ""}>${esc(m.label)}</button>`).join("")}<p class="rc-note">See what your routines do with it: filed on its own, waiting for you, or no routine yet.</p></div>`);
    if (toastMsg) root.insertAdjacentHTML("beforeend", `<div class="sm-toast" role="status"><span>${esc(toastMsg.t)}</span>${toastMsg.undo ? '<button type="button" data-act="toast-undo">Undo</button>' : ""}</div>`);
    if (S.pulse) $(".rc-waitbar", root)?.setAttribute("data-pulse", "");
    window.scrollTo(0, scroll);
    const msgs = $("#rc-msgs", root); if (msgs) msgs.scrollTop = msgs.scrollHeight;
    if (active) { const el = document.getElementById(active); if (el) { el.focus({ preventScroll: true }); if (el.tagName === "TEXTAREA") try { el.setSelectionRange(el.value.length, el.value.length); } catch { /* */ } } }
  }
  function go(where) { S.view = where; S.pop = null; S.sendOpen = false; try { history.replaceState(null, "", "#" + where); } catch { /* sandboxed */ } window.scrollTo(0, 0); render(); }

  /* ================================================================ events */
  root.addEventListener("submit", (ev) => {
    if (!ev.target.matches('[data-form="chat"]')) return;
    ev.preventDefault();
    const t = ($("#rc-text", root)?.value || "").trim(); if (!t || C.typing) return;
    C.input = ""; onSay(t);
  });
  root.addEventListener("keydown", (ev) => { if (ev.target.id === "rc-text" && ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); ev.target.closest("form").requestSubmit(); } });
  root.addEventListener("input", (ev) => { if (ev.target.id === "rc-text") C.input = ev.target.value; });
  root.addEventListener("change", (ev) => {
    if (ev.target.id === "pop-time" && S.pop) { const r = S.pop.r === "draft" ? C.draft : RR(S.pop.r); const before = JSON.stringify(r); r.time = ev.target.value || r.time; changed(r, before); render(); }
  });
  root.addEventListener("click", (ev) => {
    const t = ev.target.closest("[data-act], [data-go], a[href], .theme-toggle, .rail-toggle");
    if (S.pop && !ev.target.closest(".rc-pop") && !(t && t.dataset.act === "chip")) { S.pop = null; if (!t) { render(); return; } }
    if (S.sendOpen && !ev.target.closest(".rc-sendpop") && !(t && t.dataset.act === "send-open")) { S.sendOpen = false; if (!t) { render(); return; } }
    if (!t || !root.contains(t)) return;
    if (t.matches("[data-go]")) { ev.preventDefault(); go(t.dataset.go); return; }
    if (t.matches(".theme-toggle")) { const dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches); document.documentElement.dataset.theme = dark ? "light" : "dark"; render(); return; }
    if (t.matches(".rail-toggle")) { const sh = $(".app-shell", root); sh.dataset.rail = sh.dataset.rail === "open" ? "closed" : "open"; return; }
    if (t.matches("a[href]") && !t.dataset.act) { ev.preventDefault(); const h = t.getAttribute("href"); if (h === "/today") go("today"); else toast("Only Routines and Today are in this prototype."); return; }
    const a = t.dataset.act, r = t.dataset.r ? RR(t.dataset.r) : null;
    switch (a) {
      case "open": S.open = S.open === r.id ? null : r.id; S.tryOpen = null; break;
      case "toggle": { const before = JSON.stringify(r); r.on = !r.on; toast(r.on ? `“${r.name}” is on.` : `“${r.name}” is paused.`, () => Object.assign(r, JSON.parse(before))); break; }
      case "trust": { const before = JSON.stringify(r); r.mode = "own"; toast(`“${r.name}” files on its own now. Each one still says it filed it, with Undo.`, () => Object.assign(r, JSON.parse(before))); break; }
      case "try": S.tryOpen = S.tryOpen === r.id ? null : r.id; break;
      case "up": { const k = ROUTINES.indexOf(r); if (k > 0 && ROUTINES[k - 1].type === "arrive") { [ROUTINES[k - 1], ROUTINES[k]] = [ROUTINES[k], ROUTINES[k - 1]]; S.flash = r.id; setTimeout(() => { S.flash = null; render(); }, 1200); } break; }
      case "del": { const k = ROUTINES.indexOf(r); ROUTINES.splice(k, 1); S.open = null; toast(`Deleted “${r.name}”. What it filed stays where it is.`, () => ROUTINES.splice(k, 0, r)); break; }
      case "late-undo": { const i = Number(t.dataset.i), x = r.lately[i]; r.lately.splice(i, 1); r.filed = Math.max(0, r.filed - 1); toast(`Undone. “${x.t}” is back in Unsorted, and “${r.name}” counts it as a miss.`); break; }
      case "change": openChat(); startChange(r.id); render(); return;
      case "chip": {
        const rect = t.getBoundingClientRect(), wv = window.innerWidth, hv = window.innerHeight;
        const x = Math.max(12, Math.min(rect.left, wv - 292)), below = rect.bottom + 6, y = below + 300 > hv && rect.top > 320 ? Math.max(12, rect.top - 306) : below;
        if (t.dataset.r === "snap") return;
        S.pop = S.pop && S.pop.r === t.dataset.r && S.pop.f === t.dataset.f ? null : { r: t.dataset.r, f: t.dataset.f, x, y };
        break;
      }
      case "pop-set": case "pop-text": case "pop-remove": case "pop-src": {
        const P = S.pop, x = P.r === "draft" ? C.draft : RR(P.r), before = JSON.stringify(x);
        if (a === "pop-set") { setField(x, P.f, t.dataset.v); S.pop = null; }
        if (a === "pop-text") { const v = ($("#pop-text", root)?.value || "").trim(); if (v) setField(x, P.f, P.f === "tag" && !v.startsWith("#") ? "#" + v : v); S.pop = null; }
        if (a === "pop-remove") { x.ifs = x.ifs.filter((c) => c.t !== P.f); S.pop = null; }
        if (a === "pop-src") { const v = t.dataset.v, k = x.sources.indexOf(v); if (k >= 0) { if (x.sources.length > 1) x.sources.splice(k, 1); } else x.sources.push(v); }
        changed(x, before); break;
      }
      case "wait-open": S.waitOpen = true; break;
      case "wait-close": S.waitOpen = false; break;
      case "w-file": case "w-no": {
        const k = W.findIndex((x) => x.id === t.dataset.w), w = W[k], sel = $(`#ws-${w.id}`, root)?.value;
        W.splice(k, 1);
        if (w.kind === "single") {
          const rr = RR(w.rid); rr.right[1]++;
          if (a === "w-file") { if (!sel || sel === w.sug) rr.right[0]++; rr.lately.unshift({ t: w.newTitle || w.title, w: `${whereFor(rr, { about: sel || w.sug })} · you checked it`, when: "Just now" }); toast(`Filed “${w.newTitle || w.title}”${sel && sel !== w.sug ? " where you chose. The routine learns from the change." : "."}`, () => { W.splice(k, 0, w); rr.lately.shift(); rr.right[1]--; if (!sel || sel === w.sug) rr.right[0]--; }); }
          else toast(`Left in Unsorted. “${rr.name}” counts it as a miss.`, () => { W.splice(k, 0, w); rr.right[1]--; });
        } else toast(a === "w-file" ? `Filed “${w.item.title}”${w.item.about ? "" : ` on a new sub-topic, ${w.item.newTopic}`}.` : "Left in Unsorted. Tonight's tidy will look again.", () => W.splice(k, 0, w));
        if (!W.length) S.waitOpen = false;
        break;
      }
      case "w-make": {
        const w = W.find((x) => x.id === t.dataset.w), it = w.item;
        openChat(); C.target = null; snapDrafts();
        meMsg(`Make a routine for things like “${it.title}”`);
        const d = { id: "draft", type: "arrive", name: "", on: true, when: it.ch, ifs: [{ t: "kind", v: it.kind }, ...(it.site ? [{ t: "site", v: it.site }] : [])], then: thenOf({}), mode: "ask", right: [0, 0], filed: 0, lately: [] };
        C.draft = d; C.q = ["where", "extra", "mode"];
        think(() => { lociMsg(`Things like this: ${KIND_WORD[it.kind].replace(/^an? /, "")}s ${it.site ? `from ${it.site}` : ""} sent ${CH_PREP[it.ch]} ${CH_WORD[it.ch]}.`); ask(); });
        return;
      }
      case "p-act": { const w = W.find((x) => x.id === t.dataset.w), x = w.items[Number(t.dataset.i)]; x.st = t.dataset.v; if (w.items.every((y) => y.st)) { W.splice(W.indexOf(w), 1); toast("To read pile done until next month."); if (!W.length) S.waitOpen = false; } break; }
      case "today-look": S.waitOpen = !!W.length; go("routines"); return;
      case "chat-open": openChat(); S.chatOpen = true; break;
      case "chat-close": S.chatOpen = false; break;
      case "ctx-clear": C.target = null; break;
      case "c-pick": { const m = C.msgs[Number(t.dataset.m)], ch = m.chips[Number(t.dataset.c)]; if (C.typing) return; if (ch.toggle) { C.srcOff = C.srcOff || new Set(); C.srcOff.has(ch.v) ? C.srcOff.delete(ch.v) : C.srcOff.add(ch.v); break; } if (ch.a === "restore") { const [k, rr] = restoreStack.pop() || []; if (rr) { ROUTINES.splice(k, 0, rr); m.answered = ch.label; meMsg("Bring it back"); lociMsg(`“${rr.name}” is back.`); } break; } onChip(m, ch); return; }
      case "c-srcdone": { const m = C.msgs[Number(t.dataset.m)]; const off = C.srcOff || new Set(); C.draft.sources = SOURCES.filter((_, i) => !off.has(String(i))); if (!C.draft.sources.length) C.draft.sources = [SOURCES[0]]; m.answered = "Use these"; C.srcOff = null; meMsg(`Use these ${C.draft.sources.length}`); think(() => ask(), 400); return; }
      case "turn-on": if (C.typing) return; meMsg("Turn it on"); think(() => turnOn(), 400); return;
      case "tweak": meMsg("Change something"); think(() => lociMsg("Tap any underlined word in the card to change it, or tell me what to change, like “ask me first” or “also describe them”."), 350); return;
      case "send-open": S.sendOpen = !S.sendOpen; break;
      case "send": send(t.dataset.v); return;
      case "builder": S.builder = !S.builder; document.documentElement.toggleAttribute("data-builder", S.builder); break;
      case "toast-undo": if (undoFn) undoFn(); undoFn = null; toastMsg = null; break;
      default: return;
    }
    render();
  });
  function openChat() { S.chatOpen = matchMedia("(max-width: 900px)").matches; if (!C.msgs.length) startChat(); }
  window.addEventListener("resize", () => { if (S.pop) { S.pop = null; render(); } });

  startChat();
  const start = (location.hash || "").slice(1);
  if (start === "today") go("today"); else render();
})();
