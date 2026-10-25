/* Loci routines (prototype).
   - A routine is a small job Loci does on a schedule: instructions, a place on Loci it reads, when it runs, where the
     result lands, and what it costs. Five kinds: reading list, daily brief, review, board digest, project update.
   - Every run makes typed cards (resources, chapters, questions), never free text, and only suggests: nothing is
     saved, marked or changed until the learner says so. It never changes status, memory or the map.
   - Every run can be refined: a tap or a sentence becomes a guideline on the routine, shown with where it came from.
   - Where it shows: a Routines page (under Today), deliveries on Today, and "Routines here" on a topic in Loci.
     The shell, Today and Loci screens are the app's own DOM and CSS, captured read-only from studiolo's
     /dev/specimens (see ../live-lumens/capture/capture.cjs). Notes: README.md (no spec yet). */
(() => {
  "use strict";
  const DATA = JSON.parse(document.getElementById("vx-data").textContent);
  const root = document.getElementById("vx-app");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  DATA.htmlClass.split(/\s+/).filter(Boolean).forEach((c) => document.documentElement.classList.add(c));

  /* ================================================================ time: the prototype's "now" is Monday 26 October, 8:10 */
  const NOW = new Date(2026, 9, 26, 8, 10);
  const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const DAYLONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const at = (m, d, hh, mm) => new Date(2026, m - 1, d, hh, mm);
  const fTime = (d) => `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  const fDay = (d) => `${DAY[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
  const fWhen = (d) => {
    const same = (a, b) => a.toDateString() === b.toDateString();
    const y = new Date(NOW); y.setDate(y.getDate() - 1);
    const t = new Date(NOW); t.setDate(t.getDate() + 1);
    const day = same(d, NOW) ? "Today" : same(d, y) ? "Yesterday" : same(d, t) ? "Tomorrow" : fDay(d);
    return `${day}, ${fTime(d)}`;
  };
  const hm = (s) => s.split(":").map(Number);

  /* ================================================================ the sample learner's places (examples) */
  const PLACES = {
    you: { name: "Everywhere", path: "Your whole map", card: "Architect · prayer hall in Dubai", has: "64 saves · 21 Lumens", focus: "4 topics in My Focus" },
    climate: { name: "Climate-responsive design", path: "Culture & Context › Climate-responsive design", card: "Basics · for work · 1 to revisit", has: "14 saves · 3 Lumens" },
    islamic: { name: "Islamic architecture", path: "History & Theory › Islamic architecture", card: "Regular · the mihrab and qibla wall", has: "22 saves · 6 Lumens" },
    envelope: { name: "Envelope & Facade", path: "Envelope & Facade (area)", card: "Regular · for work", has: "31 saves · 8 Lumens" },
    precast: { name: "Precast", path: "Envelope & Facade › Facade systems › Precast", card: "Basics · 1 to revisit", has: "9 saves · 2 Lumens" },
    board: { name: "Cooling the prayer-hall courtyard", path: "Board · at Climate-responsive design", card: "Goal: brief the engineer", has: "17 cards · 9 arrows · 4 questions" },
    project: { name: "Prayer hall, Al Barsha", path: "Work · project", card: "Stage: concept design", has: "3 questions · 12 references" },
    unsorted: { name: "Unsorted", path: "Commonplace › Unsorted", card: "No place on Loci yet", has: "11 entries" },
  };
  const PLACE_ORDER = [["Your map", ["you"]], ["Areas and topics", ["climate", "islamic", "envelope", "precast"]], ["Boards", ["board"]], ["Work", ["project"]], ["Commonplace", ["unsorted"]]];

  /* ================================================================ kinds: what a routine can be */
  const KINDS = {
    reading: { name: "Reading list", ico: "▤", blurb: "Real books and articles you don't have yet, checked in a catalogue", cost: 0.4,
      obj: (p) => `Find three real books or articles on ${p} that I don't already have, pitched at my level, and say why each one.`,
      place: "climate", every: { k: "week", day: 1, time: "07:00" }, to: { today: true, email: true, audio: false }, make: "3 readings, each checked in a catalogue" },
    brief: { name: "Daily brief", ico: "♪", blurb: "Five minutes of audio for the commute: your step, your saves, one question", cost: 0.15,
      obj: () => "Five minutes for the drive: today's step toward my goal, what I saved yesterday, and one question to think over.",
      place: "you", every: { k: "weekdays", day: 1, time: "06:45" }, to: { today: true, email: false, audio: true }, make: "A script, then two voices" },
    review: { name: "Review", ico: "↻", blurb: "A few questions on what slipped this week, and one from longer ago", cost: 0.1,
      obj: () => "Ask me three questions on what I got wrong here this week, then one I got right a while ago.",
      place: "precast", every: { k: "week", day: 5, time: "17:00" }, to: { today: true, email: false, audio: false }, make: "Questions from your own checks" },
    digest: { name: "Board digest", ico: "?", blurb: "A board's open questions, and what on it already helps answer them", cost: 0.2,
      obj: () => "List the board's open questions, say what on the board already helps answer each one, and what's missing.",
      place: "board", every: { k: "week", day: 4, time: "18:00" }, to: { today: true, email: false, audio: false }, make: "Open questions, matched to cards" },
    project: { name: "Project update", ico: "▣", blurb: "What moved on a piece of work: decisions, open questions, gaps to learn", cost: 0.25,
      obj: () => "What moved on the project this week: decisions made, questions still open, and the gaps I should learn first.",
      place: "project", every: { k: "week", day: 5, time: "16:00" }, to: { today: true, email: true, audio: false }, make: "A one-page update" },
  };
  const AUDIO_COST = 0.45;
  const RUNS_A_MONTH = { day: 30, weekdays: 22, week: 4.3 };

  /* ================================================================ what runs produce (examples; every book is real) */
  const BOOKS = {
    climate: [
      { id: "olgyay", t: "Design with Climate", a: "Victor Olgyay", y: "1963; new edition 2015", k: "book", lv: "Regular", why: "The book that set out bioclimatic design: from climate data to building form, chart by chart." },
      { id: "fathy", t: "Natural Energy and Vernacular Architecture", a: "Hassan Fathy", y: "1986", k: "book", lv: "Regular", why: "Fathy measured the malqaf and the courtyard himself. The closest book to your board." },
      { id: "givoni1", t: "Passive and Low Energy Cooling of Buildings", a: "Baruch Givoni", y: "1994", k: "book", lv: "Deep", why: "Sizing for evaporative and night cooling, with numbers you can hand an engineer." },
      { id: "heschong", t: "Thermal Delight in Architecture", a: "Lisa Heschong", y: "1979 · 78 pp", k: "book", lv: "Basics", why: "Short, and about how cool feels as well as how it's measured." },
      { id: "ford", t: "The Architecture of Natural Cooling", a: "Brian Ford, Rosa Schiano-Phan and Juan A. Vallejo", y: "2nd edition, 2019", k: "book", lv: "Regular", why: "Recent buildings cooled without machines, including hot and humid climates." },
      { id: "mazria", t: "The Passive Solar Energy Book", a: "Edward Mazria", y: "1979", k: "book", lv: "Regular", why: "Passive design worked through by hand." },
      { id: "edwards", t: "Courtyard Housing: Past, Present and Future", a: "Brian Edwards, Magda Sibley, Mohamad Hakmi and Peter Land (eds.)", y: "2006", k: "book", lv: "Regular", why: "Courtyards across climates, drawn in section. The Gulf chapters fit your prayer hall's court." },
      { id: "bahadori", t: "Passive Cooling Systems in Iranian Architecture", a: "Mehdi N. Bahadori, Scientific American", y: "February 1978", k: "article", lv: "Basics", why: "Wind towers and cisterns with the airflow drawn in section. It matches “sections before photos”." },
      { id: "givoni2", t: "Climate Considerations in Building and Urban Design", a: "Baruch Givoni", y: "1998", k: "book", lv: "Deep", why: "Treats hot-dry and hot-humid regions separately, which your humid-air question needs." },
      { id: "hawkes", t: "The Environmental Imagination", a: "Dean Hawkes", y: "2008", k: "book", lv: "Deep", why: "How architects have used heat and light as material. A step deeper than your card says." },
      { id: "banham", t: "The Architecture of the Well-Tempered Environment", a: "Reyner Banham", y: "1969", k: "book", lv: "Regular", why: "How buildings came to rely on machines. Useful when the brief has to argue against them." },
      { id: "hagan", t: "Taking Shape: A New Contract Between Architecture and Nature", a: "Susannah Hagan", y: "2001", k: "book", lv: "Deep", why: "Environmental design as part of a building's form, not an add-on." },
    ],
    islamic: [
      { id: "hillenbrand", t: "Islamic Architecture: Form, Function and Meaning", a: "Robert Hillenbrand", y: "1994", k: "book", lv: "Regular", why: "Organised by building type, with a long chapter on the mosque and the mihrab." },
      { id: "holod", t: "The Mosque and the Modern World", a: "Renata Holod and Hasan-Uddin Khan", y: "1997", k: "book", lv: "Regular", why: "Recent mosques and how their architects handled the qibla wall. Close to your project." },
      { id: "grabar", t: "The Formation of Islamic Art", a: "Oleg Grabar", y: "1973", k: "book", lv: "Deep", why: "Where the early forms came from, if you want the reasons behind the plan types." },
      { id: "blairbloom", t: "The Art and Architecture of Islam 1250–1800", a: "Sheila S. Blair and Jonathan M. Bloom", y: "1994", k: "book", lv: "Regular", why: "Named buildings and primary sources, as your note here asks." },
    ],
    precast: [
      { id: "elliott", t: "Precast Concrete Structures", a: "Kim S. Elliott", y: "2nd edition, 2016", k: "book", lv: "Regular", why: "Connections and fixings in detail, which is where your heat question sits." },
      { id: "pciarch", t: "Architectural Precast Concrete", a: "Precast/Prestressed Concrete Institute", y: "3rd edition, 2007", k: "book", lv: "Regular", why: "Joints, reveals and tolerances from the architect's side of the table." },
      { id: "pcidh", t: "PCI Design Handbook", a: "Precast/Prestressed Concrete Institute", y: "8th edition", k: "book", lv: "Deep", why: "The reference the precaster's engineer will use. Good for knowing what to ask." },
    ],
  };
  const REVIEW = {
    precast: [
      { q: "Where does most heat get through a precast wall: the joint sealant, or the steel fixings behind the panel?", a: "The fixings. Steel conducts heat over a thousand times better than the insulation it passes through, so each fixing is a small bridge. Ask for thermally broken fixings, or stainless steel, which conducts about a third as well as carbon steel.", from: "Got wrong on Fri 23 Oct, in “Why precast cracks”" },
      { q: "What decides how wide a panel joint is?", a: "Tolerances and movement: making and fixing tolerances, plus the panel's thermal movement, with a sealant that can take the stretch. Often around 20 mm.", from: "Got right 10 days ago, in “Precast joints”" },
      { q: "Why does an architectural panel often get a reveal at the joint?", a: "It hides small differences in line and level between panels and makes the joint look intended. (Your word: reveal, not return.)", from: "From your words on Precast" },
    ],
    climate: [
      { q: "Why does a wet jar cool a room well in Riyadh in June but hardly at all in Dubai in August?", a: "Evaporation needs dry air. Dubai's August air is close to saturated, so little water evaporates and little heat is taken from the air.", from: "Got wrong on Thu 22 Oct, in a check" },
      { q: "What makes air rise through a malqaf at night?", a: "The stack effect: warm air inside is lighter and rises out, pulling cooler air in below.", from: "Got right on Wed 21 Oct" },
      { q: "Why does a deep, narrow court stay cooler than a wide one?", a: "It's in shade for more of the day, so its floor and walls take in less sun, and the cool night air pools in it.", from: "From your board's goal" },
    ],
  };
  const DIGEST = [
    { q: "How much does the malqaf actually cool a hall for 600?", helps: "Your section of the Yazd malqaf, and your note “catch the wind at 8 m”.", missing: "No numbers yet for air change in a hall this size.", open: true },
    { q: "Is evaporative cooling worth it in Dubai's August?", helps: "Fathy's jar photo and your arrow “contrasts with” the humid-coast note.", missing: "Nothing yet on humidity in the Gulf summer.", open: true },
    { q: "Where should the court's shade fall at 3 pm?", helps: "Answered in your Lumen “Shade and the afternoon court”.", missing: "", open: false },
  ];
  const BRIEF = [
    ["0:00", "Good morning, Layla. <b>Today's step</b> for the prayer hall: where the court's shade falls at 3 pm."],
    ["0:50", "<b>Yesterday you saved</b> two things: Heschong's <i>Thermal Delight in Architecture</i>, and a section of the Bait Ur Rouf mosque."],
    ["2:05", "<b>On Precast</b>, one thing to revisit: heat at the panel fixings. One sentence on why, then we move on."],
    ["3:20", "<b>Think it over</b> on the drive: why does a deep court stay cooler than a wide one? Eight seconds of quiet, then the answer."],
    ["4:30", "That's it. Your reading list on Climate-responsive design arrives at 7."],
  ];
  const PROJECT = {
    decided: ["Qibla wall glazing: option B, high clerestory, no glare on the mihrab (Thu 22 Oct)"],
    open: ["How do we light the qibla wall without glare at dusk?", "Can the court be cooled without machines for Friday prayers?"],
    gaps: [["Thermal bridging at precast fixings", "precast"], ["Air change in a large hall", "climate"]],
  };

  /* ================================================================ state */
  let rid = 0, runId = 0;
  const mk = (kind, over) => {
    const K = KINDS[kind];
    return { id: "r" + ++rid, kind, name: K.name, obj: K.obj(PLACES[over.place || K.place].name), place: K.place, every: { ...K.every }, to: { ...K.to }, may: "suggest", skip: true, on: true, guides: [], ...over };
  };
  const ROUTINES = [
    mk("reading", { name: "Weekly reading list", place: "climate", obj: "Find three real books or articles on keeping a courtyard cool without machines that I don't already have, pitched at my level, and say why each one.", guides: [{ t: "Skip the classics I'm likely to own already", from: "Mon 12 Oct", how: "you dismissed Olgyay with Have it" }] }),
    mk("brief", { name: "Daily brief", place: "you" }),
    mk("review", { name: "Friday review", place: "precast" }),
    mk("digest", { name: "Board digest", place: "board", on: false, to: { today: true, email: true, audio: false } }),
  ];
  const run = (r, when, status, out, extra = {}) => ({ id: "u" + ++runId, rid: r.id, at: when, how: "scheduled", status, out, took: "41 s", cost: costRun(r), ...extra });
  const books = (ids, place = "climate") => ids.map(([id, st, why]) => ({ ...BOOKS[place].find((b) => b.id === id), st: st || null, dis: why || null }));
  const S = {
    view: "routines", tab: "routines", routines: ROUTINES, runs: [], sel: null, filter: null,
    edit: null, running: null, refineOpen: null, dismissing: null, play: null,
  };
  const R = (id) => S.routines.find((r) => r.id === id);
  {
    const [r1, r2, r3, r4] = ROUTINES;
    S.runs.push(
      run(r1, at(10, 12, 7, 0), "", { kind: "reading", items: books([["olgyay", "dismissed", "Have it"], ["fathy", "saved"], ["givoni1", "saved"]]) }),
      run(r4, at(10, 15, 18, 0), "", { kind: "digest", items: DIGEST.map((d) => ({ ...d })) }, { took: "29 s" }),
      run(r3, at(10, 16, 17, 0), "skipped", { kind: "skip", why: "Nothing new on Precast since the last run, so it didn't run. No allowance used." }, { cost: 0, took: "1 s" }),
      run(r1, at(10, 19, 7, 0), "", { kind: "reading", items: books([["heschong", "saved"], ["ford", "saved"], ["mazria", "dismissed", "Not about my work"]]) }),
      run(r2, at(10, 22, 6, 45), "", { kind: "brief", chapters: BRIEF, heard: true }),
      run(r2, at(10, 23, 6, 45), "", { kind: "brief", chapters: BRIEF, heard: true }),
      run(r3, at(10, 23, 17, 0), "", { kind: "review", items: REVIEW.precast.map((x, i) => ({ ...x, shown: true, mark: i === 1 ? "got" : i === 0 ? "not" : null })) }),
      run(r2, at(10, 26, 6, 45), "", { kind: "brief", chapters: BRIEF, heard: false }, { took: "1 min 12 s" }),
      run(r1, at(10, 26, 7, 0), "", { kind: "reading", items: books([["edwards"], ["bahadori"], ["givoni2"]]) }, { took: "38 s" }),
    );
    S.runs.forEach((u) => { u.cost = u.status === "skipped" ? 0 : costRun(R(u.rid)); });
    S.sel = S.runs[S.runs.length - 1].id;
  }

  /* ================================================================ schedule and cost */
  function nextRun(r, from = NOW) {
    const [h, m] = hm(r.every.time);
    if (r.every.k === "hours") {
      const d = new Date(from); d.setHours(h, m, 0, 0);
      while (d <= from) d.setHours(d.getHours() + Number(r.every.hours || 6));
      return d;
    }
    for (let i = 0; i < 9; i++) {
      const d = new Date(from); d.setDate(d.getDate() + i); d.setHours(h, m, 0, 0);
      const wd = d.getDay();
      const ok = r.every.k === "day" || (r.every.k === "weekdays" && wd >= 1 && wd <= 5) || (r.every.k === "week" && wd === Number(r.every.day));
      if (ok && d > from) return d;
    }
    return from;
  }
  const t12 = (s) => { const [h, m] = hm(s); return `${h}:${String(m).padStart(2, "0")}`; };
  function cadence(r, short) {
    const e = r.every, t = t12(e.time);
    if (e.k === "day") return short ? `Daily ${t}` : `Every day at ${t}`;
    if (e.k === "weekdays") return short ? `Weekdays ${t}` : `Weekdays at ${t}`;
    if (e.k === "hours") return short ? `Every ${e.hours} hours` : `Every ${e.hours} hours, from ${t}`;
    return short ? `${DAYLONG[e.day]}s ${t}` : `Every ${DAYLONG[e.day]} at ${t}`;
  }
  const runsMonth = (r) => r.every.k === "hours" ? (24 / Number(r.every.hours || 6)) * 30 : RUNS_A_MONTH[r.every.k];
  function costRun(r) { return KINDS[r.kind].cost + (r.to.audio ? AUDIO_COST : 0); }
  const costMonth = (r) => costRun(r) * runsMonth(r) * (r.skip ? 0.85 : 1);
  const pct = (x) => (x === 0 ? "nothing" : x < 0.1 ? "under 0.1%" : x < 10 ? `${(Math.round(x * 10) / 10).toString()}%` : `${Math.round(x)}%`);
  const deliverText = (to) => [to.today && "Today", to.email && "Email", to.audio && "Audio"].filter(Boolean).join(", ") || "Nowhere yet";
  const lastRun = (r) => S.runs.filter((u) => u.rid === r.id).sort((a, b) => b.at - a.at)[0];

  function status(u) {
    if (u.status === "skipped") return ["skipped", "Skipped"];
    const o = u.out;
    if (o.kind === "reading") { const n = o.items.filter((x) => !x.st).length; return n ? ["waiting", `${n} to look at`] : ["done", "Done"]; }
    if (o.kind === "review") { const n = o.items.filter((x) => !x.mark).length; return n ? ["waiting", `${n} to answer`] : ["done", "Done"]; }
    if (o.kind === "brief") return o.heard ? ["done", "Heard"] : ["waiting", "New · 5 min"];
    if (o.kind === "digest") return ["done", `${o.items.filter((x) => x.open).length} open`];
    return ["done", "Delivered"];
  }

  /* ================================================================ helpers */
  const sw = (id, on, label) => `<button type="button" class="sm-switch" role="switch" id="${id}" aria-checked="${on}" data-act="${id}"${label ? "" : ' aria-label="On"'}><i aria-hidden="true"></i>${esc(label || "")}</button>`;
  const btn = (label, attrs, kind = "") => `<button type="button" class="button${kind ? " button-" + kind : ""}" ${attrs}>${label}</button>`;
  const act = (label, attrs) => `<button type="button" class="sm-act" ${attrs}>${label}</button>`;
  const placeLine = (id) => PLACES[id].path;
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

  /* ================================================================ Routines page */
  function header() {
    const tabs = [["routines", `Routines`], ["runs", "Runs"]];
    return `<header class="destination-header"><div class="destination-crumb"><strong>Today</strong><i aria-hidden="true">/</i><span>Routines</span></div><nav aria-label="Routines sections" class="destination-tabs">${tabs.map(([k, l]) => `<a class="destination-tab" href="#${k}" data-tab="${k}"${S.tab === k ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav></header>`;
  }
  function card(r) {
    const nx = nextRun(r), lr = lastRun(r), running = S.running && S.running.rid === r.id;
    const mc = costMonth(r), warn = mc > 10;
    return `<article class="rt-card" id="card-${r.id}"${r.on ? "" : " data-off"}${S.flash === r.id ? " data-flash" : ""}>
      <div class="rt-head"><span class="rt-ico" aria-hidden="true">${KINDS[r.kind].ico}</span><div style="min-width:0"><h3>${esc(r.name)}</h3><div class="rt-sub"><span class="rt-pill" data-s="${r.on ? "on" : "paused"}">${r.on ? "On" : "Paused"}</span><span>${esc(cadence(r, true))} · ${esc(deliverText(r.to))}</span></div></div>${sw("toggle", r.on).replace('data-act="toggle"', `data-act="toggle" data-id="${r.id}"`).replace('id="toggle"', `id="tg-${r.id}"`).replace('aria-label="On"', `aria-label="${esc(r.name)} on"`)}</div>
      <div class="rt-obj"><span class="rt-k">What it does</span><p>${esc(r.obj)}</p>${r.guides.length ? `<ul class="rt-guides">${r.guides.map((g) => `<li>${esc(g.t)} <i>· from the run on ${esc(g.from)}</i></li>`).join("")}</ul>` : ""}</div>
      <div class="rt-facts">
        <div class="rt-fact"><span>Reads</span><b>${esc(PLACES[r.place].name)}<small>${esc(placeLine(r.place))}</small></b></div>
        <div class="rt-fact"><span>When</span><b>${esc(cadence(r))}</b></div>
        <div class="rt-fact"><span>Next run</span><b>${r.on ? esc(fWhen(nx)) : "Paused"}</b></div>
        <div class="rt-fact"><span>Last run</span><b>${lr ? esc(fWhen(lr.at)) + (lr.status === "skipped" ? "<small>Skipped: nothing new</small>" : "") : "Not yet"}</b></div>
        <div class="rt-fact"><span>Delivers to</span><b>${esc(deliverText(r.to))}</b></div>
      </div>
      <div class="rt-cost"><div class="rt-tile"><span>Each run</span><b>${pct(costRun(r))}</b></div><div class="rt-tile"${warn ? " data-warn" : ""}><span>A month, about</span><b>${pct(mc)}</b></div></div>
      ${running ? stepsHTML(r) : ""}
      <div class="rt-foot"><span class="rt-ready"${running ? " data-running" : ""}><i aria-hidden="true"></i>${running ? "Running…" : r.on ? "Ready to run" : "Paused"}</span>${act("Run now", `data-act="runnow" data-id="${r.id}"${running ? " disabled" : ""}`)}<span aria-hidden="true" style="color:var(--ink-3)">·</span>${act("Runs", `data-act="runsof" data-id="${r.id}"`)}<span aria-hidden="true" style="color:var(--ink-3)">·</span>${act("Edit", `data-act="edit" data-id="${r.id}"`)}</div>
    </article>`;
  }
  function stepsHTML(r) {
    const s = S.running.step, P = PLACES[r.place];
    const steps = [
      ["It starts", `Run now (normally ${cadence(r, true)})`],
      ["It reads", `${P.name}: ${P.has}, your card`],
      ["It thinks", r.kind === "reading" ? "Skips what you have or dismissed" : "Follows your instructions and guidelines"],
      ["It makes cards", KINDS[r.kind].make],
      ["It delivers", deliverText(r.to)],
      ["You refine it", "Mark what helped"],
    ];
    const lines = [`Starting “${r.name}”…`, `Reading ${P.name}: ${P.has}, and what Loci knows about you there (${P.card}).`, "Leaving out what you already have and what you've dismissed before.", r.kind === "reading" ? "Checking each title in a library catalogue, so none is made up." : `Making it: ${KINDS[r.kind].make.toLowerCase()}.`, `Sending it to ${deliverText(r.to)}.`, "Done. Open it to see what it found."];
    return `<div class="rt-steps" aria-label="Run progress">${steps.map(([b, t], i) => `<div class="rt-step"${i < s ? " data-done" : i === s ? " data-now" : ""}><em>${String(i + 1).padStart(2, "0")}</em><b>${b}</b><span>${esc(t)}</span></div>`).join("")}</div><p class="rt-stepline" role="status">${esc(lines[Math.min(s, 5)])}</p>`;
  }
  function routinesTab() {
    const on = S.routines.filter((r) => r.on), month = on.reduce((a, r) => a + costMonth(r), 0);
    return `<div class="rt-body">
      <div class="rt-intro"><div><h1 class="sm-h1">Routines</h1><p class="sm-lead">Small jobs Loci does for you on a schedule. Each reads one place on your map and brings back cards for you to keep or dismiss. A routine never changes a topic's status, your memory or your map.</p></div>
        <div class="sm-row"><span class="sm-note">${on.length} on · about <b>${pct(month)}</b> of your monthly allowance</span>${btn("New routine", 'data-act="new"')}</div></div>
      <div class="rt-cards">${S.routines.map(card).join("")}</div>
      <section class="rt-start" aria-labelledby="rt-start-h"><h2 class="sm-h3" id="rt-start-h">Start from</h2><div class="rt-starts">${Object.entries(KINDS).map(([k, K]) => `<button type="button" class="rt-tpl" data-act="new" data-kind="${k}"><b>${K.ico}&nbsp; ${K.name}</b><span>${esc(K.blurb)}</span></button>`).join("")}</div></section>
    </div>`;
  }

  /* ---------- Runs */
  function runsTab() {
    let list = S.runs.slice().sort((a, b) => b.at - a.at);
    if (S.filter) list = list.filter((u) => u.rid === S.filter);
    if (!list.some((u) => u.id === S.sel)) S.sel = list[0]?.id || null;
    let day = "";
    const rows = list.map((u) => {
      const d = fWhen(u.at).split(",")[0], r = R(u.rid), [k, l] = status(u);
      const head = d !== day ? `<div class="rt-day">${esc(d)}</div>` : ""; day = d;
      return `${head}<button type="button" class="rt-row" data-act="sel" data-id="${u.id}" aria-current="${u.id === S.sel}"><b>${esc(r.name)}</b><span class="rt-pill" data-s="${k}">${esc(l)}</span><small>${fTime(u.at)}${u.how === "now" ? " · Run now" : ""} · ${esc(PLACES[r.place].name)}</small></button>`;
    }).join("");
    const u = S.runs.find((x) => x.id === S.sel);
    return `<div class="rt-body">
      <div class="rt-intro"><div><h1 class="sm-h1">Runs</h1><p class="sm-lead">Everything your routines brought back, newest first. Open one to see what it read, what it found, and to tell it what to change next time.</p></div>
        ${S.filter ? `<div class="sm-row"><span class="rt-chip">Only <b>${esc(R(S.filter).name)}</b></span>${act("Show all", 'data-act="unfilter"')}</div>` : ""}</div>
      <div class="rt-runs"><div class="rt-list" aria-label="Runs">${rows || '<p class="sm-note" style="padding:14px">No runs yet.</p>'}</div>${u ? runView(u) : '<div class="rt-run"><p class="sm-note">Pick a run.</p></div>'}</div>
    </div>`;
  }
  function runView(u) {
    const r = R(u.rid), P = PLACES[r.place], o = u.out;
    const reads = [["Place", P.name], ["Your card there", P.card], ["In it", P.has]];
    if (o.kind === "reading") reads.push(["Left out", `${S.runs.filter((x) => x.rid === r.id && x.at < u.at && x.out.items).flatMap((x) => x.out.items).length} suggested before`]);
    if (r.guides.length) reads.push(["Your guidelines", String(r.guides.length)]);
    let body = "";
    if (o.kind === "skip") body = `<p class="sm-note">${esc(o.why)}</p>`;
    if (o.kind === "reading") body = o.items.map((b) => resCard(u, b)).join("");
    if (o.kind === "review") body = o.items.map((q, i) => `<div class="rt-q"${q.mark ? ` data-mark="${q.mark}"` : ""}><span class="sm-path">${esc(q.from)}</span><b>${esc(q.q)}</b>${q.shown ? `<p class="rt-ans">${esc(q.a)}</p>${q.mark ? `<span class="rt-done">${q.mark === "got" ? "<b>Got it.</b> Loci may ask again in a few weeks." : "<b>Not yet.</b> It stays in To revisit on " + esc(P.name) + "."}</span>` : `<div class="sm-row">${btn("Got it", `data-act="mark" data-u="${u.id}" data-i="${i}" data-val="got"`, "quiet")}${btn("Not yet", `data-act="mark" data-u="${u.id}" data-i="${i}" data-val="not"`, "quiet")}</div>`}` : `<div class="sm-row">${btn("Think, then show the answer", `data-act="reveal" data-u="${u.id}" data-i="${i}"`, "quiet")}</div>`}</div>`).join("");
    if (o.kind === "brief") {
      const p = S.play && S.play.u === u.id ? S.play.t : o.heard ? 100 : 0, playing = S.play && S.play.u === u.id && S.play.on;
      const nowCh = Math.min(BRIEF.length - 1, Math.floor((p / 100) * BRIEF.length));
      body = `<div class="rt-audio"><button type="button" class="rt-play" data-act="play" data-u="${u.id}" aria-label="${playing ? "Pause" : "Play"}">${playing ? "❚❚" : "▶"}</button><div style="min-width:0"><b>Your brief for ${esc(fDay(u.at))}</b><div class="rt-bar" aria-hidden="true"><i style="width:${p}%"></i></div></div><time>${playing || p ? `${Math.floor((p / 100) * 5)}:${String(Math.floor(((p / 100) * 300) % 60)).padStart(2, "0")}` : "0:00"} / 5:00</time></div>
        <div class="rt-chapters">${o.chapters.map(([t, x], i) => `<div class="rt-chapter"${(playing || p) && i === nowCh ? " data-now" : ""}><span>${t}</span><p>${x}</p></div>`).join("")}</div>
        <p class="sm-note">In the app, two voices read this (as in Dialogues). Here, a timer stands in.</p>`;
    }
    if (o.kind === "digest") body = o.items.map((d) => `<div class="rt-q"><span class="sm-path">${d.open ? "Open question" : "Answered"}</span><b>${esc(d.q)}</b><p class="sm-note"><b>On the board:</b> ${esc(d.helps)}${d.missing ? ` <b>Missing:</b> ${esc(d.missing)}` : ""}</p>${d.open ? `<div class="sm-row">${btn("Explain…", 'data-act="explain"', "quiet")}${btn("Find readings for this", 'data-act="findfor"', "quiet")}</div>` : ""}</div>`).join("");
    if (o.kind === "project") body = `<div class="rt-q"><span class="sm-path">Decided this week</span>${PROJECT.decided.map((x) => `<b>${esc(x)}</b>`).join("")}</div><div class="rt-q"><span class="sm-path">Still open</span>${PROJECT.open.map((x) => `<p class="sm-note" style="font-size:14px;color:var(--ink)">${esc(x)}</p>`).join("")}</div><div class="rt-q"><span class="sm-path">Gaps to learn first</span>${PROJECT.gaps.map(([x, p]) => `<div class="sm-row" style="justify-content:space-between"><span>${esc(x)} <span class="sm-note">· ${esc(PLACES[p].name)}</span></span>${btn("Learn this for the project", 'data-act="learnfor"', "quiet")}</div>`).join("")}</div>`;
    const rf = S.refineOpen === u.id;
    const fb = u.fb;
    return `<div class="rt-run">
      <div class="rt-run-head"><span class="sm-path">${esc(KINDS[r.kind].name)} · ${esc(r.name)}</span><h2 class="sm-h2">${esc(o.kind === "reading" ? `${o.items.length} readings on ${P.name}` : o.kind === "brief" ? "Your daily brief" : o.kind === "review" ? `${o.items.length} questions on ${P.name}` : o.kind === "digest" ? `Open questions on “${P.name}”` : o.kind === "project" ? `This week on ${P.name}` : "Skipped")}</h2>
        <div class="rt-meta"><span>${u.how === "now" ? "Run now" : "On schedule"} · <b>${esc(fWhen(u.at))}</b></span><span>Took <b>${esc(u.took)}</b></span><span>Used <b>${pct(u.cost)}</b> of your allowance</span>${act("Edit routine", `data-act="edit" data-id="${r.id}"`)}</div></div>
      ${u.status === "skipped" ? "" : `<div class="rt-read"><span class="rt-k">What it read</span><div class="rt-chips">${reads.map(([a, b]) => `<span class="rt-chip">${esc(a)} <b>${esc(b)}</b></span>`).join("")}</div></div>`}
      <div class="rt-out">${body}</div>
      ${u.status === "skipped" ? "" : `<div class="rt-refine"><span class="rt-k">How was this run?</span>
        ${fb ? `<div class="rt-added">${fb === "ok" ? "<b>Noted.</b> It keeps doing this." : `<b>Added to its guidelines:</b> ${esc(fb)}`}</div>` : `<div class="sm-row">${[["ok", "Just right"], ["basic", "Too basic"], ["long", "Too long"], ["work", "Not about my work"]].map(([k, l]) => `<button class="chip-btn" type="button" data-act="fb" data-u="${u.id}" data-val="${k}">${l}</button>`).join("")}${act(rf ? "Close" : "Tell it something else…", `data-act="refine" data-u="${u.id}"`)}</div>`}
        ${rf && !fb ? `<textarea class="sm-area" id="rf-text" placeholder="For example: only things I can read in an evening, and say which chapter to start with."></textarea><div class="sm-row">${btn("Add to its instructions", `data-act="refine-save" data-u="${u.id}"`)}<span class="sm-note">It reads this from the next run. You can remove it in Edit.</span></div>` : ""}
        <p>Each run gets better as you sharpen what it does. Guidelines show on the routine with the run they came from.</p></div>`}
    </div>`;
  }
  function resCard(u, b) {
    const i = u.out.items.indexOf(b);
    const dis = S.dismissing && S.dismissing.u === u.id && S.dismissing.i === i;
    let foot;
    if (b.st === "saved") foot = `<span class="rt-done"><b>Saved</b> to Commonplace › Sources › ${b.k === "article" ? "Articles" : "Books"}, on ${esc(PLACES[R(u.rid).place].name)} · To read</span>`;
    else if (b.st === "dismissed") foot = `<span class="rt-done">Dismissed${b.dis ? ` · ${esc(b.dis)}` : ""}. It won't be suggested again.</span>`;
    else if (dis) foot = `<div class="sm-row"><span class="sm-note">Why?</span>${["Have it", "Too basic", "Too advanced", "Not my format", "Not about my work"].map((w) => `<button class="chip-btn" type="button" data-act="dismiss" data-u="${u.id}" data-i="${i}" data-val="${w}">${w}</button>`).join("")}${act("Cancel", 'data-act="dis-cancel"')}</div>`;
    else foot = `<div class="sm-row">${btn("Save", `data-act="save" data-u="${u.id}" data-i="${i}"`)}${btn("Dismiss", `data-act="dis-open" data-u="${u.id}" data-i="${i}"`, "quiet")}</div>`;
    return `<div class="rt-res"${b.st ? ` data-state="${b.st}"` : ""}><span class="rt-cover" data-k="${b.k}" aria-hidden="true">${b.k}</span>
      <div class="rt-res-top"><b>${esc(b.t)}</b><span>${esc(b.a)} · ${esc(b.y)}</span></div>
      <p>${esc(b.why)}</p>
      <div class="rt-tags"><span>${b.k === "article" ? "Article" : "Book"}</span><span>${esc(b.lv)}</span><span>Checked in Open Library</span></div>
      <div style="grid-column:2">${foot}</div></div>`;
  }

  /* ---------- the editor */
  function draftOf(r) { return { ...r, every: { ...r.every }, to: { ...r.to }, guides: r.guides.map((g) => ({ ...g })) }; }
  function editorHTML() {
    const d = S.edit.d, isNew = S.edit.isNew, K = KINDS[d.kind];
    const mc = costMonth(d), warn = mc > 10;
    const lighter = warn ? (() => { const x = draftOf(d); x.every = { ...x.every, k: "week" }; return pct(costMonth(x)); })() : "";
    const seg = (key, opts, cur) => `<div class="sm-seg" role="group">${opts.map(([v, l]) => `<button type="button" data-act="ed-seg" data-key="${key}" data-val="${v}" aria-pressed="${String(cur) === String(v)}">${l}</button>`).join("")}</div>`;
    return `<div class="rt-scrim" data-act="ed-close"></div><aside class="rt-sheet" role="dialog" aria-modal="true" aria-labelledby="ed-h">
      <div class="rt-sheet-top"><div><span class="sm-path">${K.ico} ${esc(K.name)}</span><h2 id="ed-h">${isNew ? "New routine" : "Edit routine"}</h2></div><button class="button button-link" type="button" data-act="ed-close">Close</button></div>
      <div class="rt-sheet-body">
        <label class="sm-field"><span>Name</span><input class="sm-input" id="ed-name" data-ed="name" value="${esc(d.name)}" maxlength="60"></label>
        <label class="sm-field"><span>What should it do?</span><textarea class="sm-area" id="ed-obj" data-ed="obj" maxlength="400">${esc(d.obj)}</textarea><small>Say it as you would to a colleague. Loci also knows your level and goal at the place it reads.</small></label>
        ${d.guides.length ? `<div class="sm-field"><span>Guidelines from your runs</span><ul class="rt-guides">${d.guides.map((g, i) => `<li>${esc(g.t)} <i>· from ${esc(g.from)}${g.how ? ", " + esc(g.how) : ""}</i> ${act("Remove", `data-act="ed-guide-del" data-i="${i}"`)}</li>`).join("")}</ul></div>` : ""}
        <label class="sm-field"><span>Where it reads</span><select class="sm-select" id="ed-place" data-ed="place">${PLACE_ORDER.map(([g, ids]) => `<optgroup label="${g}">${ids.map((id) => `<option value="${id}"${d.place === id ? " selected" : ""}>${esc(PLACES[id].name)}${id !== "you" ? " · " + esc(PLACES[id].path.split(" › ")[0]) : ""}</option>`).join("")}</optgroup>`).join("")}</select><small>${esc(PLACES[d.place].path)}: ${esc(PLACES[d.place].has)}. It reads this place and everything under it, and nothing else.</small></label>
        <div class="sm-field"><span>When</span>${seg("k", [["day", "Every day"], ["weekdays", "Weekdays"], ["week", "Once a week"], ["hours", "Every few hours"]], d.every.k)}
          <div class="rt-when">${d.every.k === "week" ? `<select class="sm-select" id="ed-day" data-ed="day" aria-label="Day">${DAYLONG.map((n, i) => [n, i]).slice(1).concat([["Sunday", 0]]).map(([n, i]) => `<option value="${i}"${Number(d.every.day) === i ? " selected" : ""}>${n}</option>`).join("")}</select>` : ""}${d.every.k === "hours" ? `<select class="sm-select" id="ed-hours" data-ed="hours" aria-label="How often">${[3, 6, 12].map((h) => `<option value="${h}"${Number(d.every.hours) === h ? " selected" : ""}>Every ${h} hours</option>`).join("")}</select><span class="sm-note">from</span>` : `<span class="sm-note">at</span>`}<input class="sm-input" type="time" id="ed-time" data-ed="time" value="${esc(d.every.time)}" style="width:auto"></div>
          <small id="ed-next">Next run: ${esc(fWhen(nextRun(d)))}</small></div>
        <div class="sm-field"><span>Where the result lands</span><div class="rt-checks">${[["today", "Today"], ["email", "Email"], ["audio", "As audio (5 min)"]].map(([k, l]) => `<button type="button" class="rt-check" data-act="ed-to" data-key="${k}" aria-pressed="${!!d.to[k]}">${l}</button>`).join("")}</div><small>Every run is also kept in Runs.${d.to.audio ? " Audio is the costly part: it's read by two voices." : ""}</small></div>
        <div class="sm-field"><span>What it may do</span><div class="rt-radio">
          <button type="button" data-act="ed-may" data-val="suggest" aria-pressed="${d.may === "suggest"}"><b>Suggest only</b><span>Nothing is saved until you press Save on it.</span></button>
          <button type="button" data-act="ed-may" data-val="save" aria-pressed="${d.may === "save"}"><b>Also file what it finds</b><span>Into Commonplace › Unsorted, marked “From a routine”, for you to sort or delete.</span></button></div>
          <p class="rt-never"><b>It never</b> changes a topic's status, your memory or your map, and never sends anything to anyone but you.</p></div>
        <div class="sm-field">${sw("ed-skip", d.skip, "Skip a run when nothing is new at its place")}<small>A skipped run uses none of your allowance.</small></div>
        ${isNew ? "" : `<div>${btn("Delete routine", `data-act="ed-del" data-id="${d.id}"`, "quiet")}</div>`}
      </div>
      <div class="rt-sheet-foot"><span class="rt-est" id="ed-est"${warn ? " data-warn" : ""}>Each run <b>${pct(costRun(d))}</b> · a month, about <b>${pct(mc)}</b> of your allowance${warn ? `. Once a week would be about ${lighter}.` : ""}</span>${btn("Cancel", 'data-act="ed-close"', "quiet")}${btn(isNew ? "Create routine" : "Save", 'data-act="ed-save"')}</div>
    </aside>`;
  }
  function refreshEstimate() {
    const d = S.edit.d, mc = costMonth(d), est = $("#ed-est", root), nx = $("#ed-next", root);
    if (nx) nx.textContent = "Next run: " + fWhen(nextRun(d));
    if (est) { est.toggleAttribute("data-warn", mc > 10); est.innerHTML = `Each run <b>${pct(costRun(d))}</b> · a month, about <b>${pct(mc)}</b> of your allowance`; }
  }

  /* ================================================================ Today: deliveries */
  function todayView() {
    shell("today");
    $$(`.navigation-rail .navigation-link[href="/today"], .tab-bar .tab-bar-link[href="/today"]`, root).forEach((a) => a.setAttribute("aria-current", "page"));
    const h1 = $(".td-head h1", root); if (h1) h1.innerHTML = `Today <span>Monday 26 October</span>`;
    const tm = $(".td-head time", root); if (tm) tm.textContent = "08:10 AM";
    const strip = $(".td-strip", root);
    if (strip) strip.innerHTML = [["M", 26], ["T", 27], ["W", 28], ["T", 29], ["F", 30], ["S", 31], ["S", 1]].map(([l, n], i) => `<button type="button" aria-pressed="${!i}"${i ? " disabled" : ' class="is-on"'} aria-label="${i ? "" : "Today"}">${l}<b>${n}</b>${i ? "" : "<i></i>"}</button>`).join("");
    const dl = $(".td-dayline", root); if (dl) dl.innerHTML = "<b>Today</b> · two routines ran this morning";
    $$(".td-ev", root).forEach((x) => x.remove());
    const today = S.runs.filter((u) => u.at.toDateString() === NOW.toDateString() || (u.at > NOW));
    const rows = $$(".td-cal-row", root);
    today.forEach((u) => { const row = rows.find((x) => $(".td-cal-t", x)?.textContent === `${u.at.getHours()}:00`); const [, l] = status(u); row && $(".td-cal-c", row).insertAdjacentHTML("beforeend", `<a class="td-ev is-routine" href="#runs" data-act="openrun" data-u="${u.id}">${esc(R(u.rid).name)}<small>Routine · ${esc(l)}</small></a>`); });
    const nowLine = $(".td-cal-now", root); const r8 = rows.find((x) => $(".td-cal-t", x)?.textContent === "8:00");
    if (nowLine && r8) { nowLine.style.top = "16.7%"; $(".td-cal-c", r8).appendChild(nowLine); }
    const nexts = S.routines.filter((r) => r.on).map((r) => [r, nextRun(r)]).sort((a, b) => a[1] - b[1]);
    const later = $(".td-plan-later", root); if (later && nexts[0]) later.textContent = `Next routine: ${nexts[0][0].name}, ${fWhen(nexts[0][1])}.`;
    // From your routines: the newest run of each routine that still has something for you, or ran today
    const cards = S.routines.map((r) => lastRun(r)).filter(Boolean).filter((u) => status(u)[0] === "waiting" || u.at.toDateString() === NOW.toDateString()).sort((a, b) => b.at - a.at);
    const html = `<section class="rt-today" aria-labelledby="rt-today-h"><div class="td-h is-plain"><h2 id="rt-today-h">From your routines</h2><span><a href="#routines" data-tab="routines">All routines</a></span></div>
      <div class="rt-today-list">${cards.map((u) => { const r = R(u.rid), [, l] = status(u), o = u.out;
        const title = o.kind === "reading" ? `${plural(o.items.filter((x) => !x.st).length || o.items.length, "reading")} on ${PLACES[r.place].name}` : o.kind === "brief" ? "Your brief for the drive" : o.kind === "review" ? `${plural(o.items.filter((x) => !x.mark).length, "question")} on ${PLACES[r.place].name}` : r.name;
        const cta = o.kind === "brief" ? (o.heard ? "Play again" : "▶ Listen, 5 min") : o.kind === "reading" ? "Look through them" : "Answer them";
        return `<button type="button" class="rt-tcard" data-act="openrun" data-u="${u.id}"><span class="rt-k">${esc(r.name)} · ${esc(fWhen(u.at))}</span><b>${esc(title)}</b><span>${esc(l)}</span><em>${cta}</em></button>`; }).join("")}</div></section>`;
    const top = $(".td-top", root); top?.insertAdjacentHTML("afterend", html);
  }

  /* ================================================================ Loci: routines here */
  function lociView() {
    shell("climate");
    $$(`.navigation-rail .navigation-link[href="/graph"], .tab-bar .tab-bar-link[href="/graph"]`, root).forEach((a) => a.setAttribute("aria-current", "page"));
    const cp = $(".cp", root); if (!cp) return;
    const here = S.routines.filter((r) => r.place === "climate" || r.place === "board");
    $(".cp-meta", cp)?.insertAdjacentHTML("afterend", `<div class="rt-here"><div class="rt-here-row"><span>Routines here</span>${act("+ Routine here", 'data-act="new" data-kind="reading" data-place="climate"')}</div>${here.map((r) => `<div class="rt-here-row"><b>${esc(r.name)}</b><span>· ${r.on ? esc(cadence(r, true)) + " · next " + esc(fWhen(nextRun(r))) : "paused"}</span>${act("Open", `data-act="edit" data-id="${r.id}"`)}</div>`).join("") || "<span>None yet.</span>"}</div>`);
    const body = $(".cp-body", cp);
    const u = S.runs.filter((x) => R(x.rid).place === "climate" && x.out.kind === "reading").sort((a, b) => b.at - a.at)[0];
    if (body && u) {
      const left = u.out.items.filter((x) => !x.st);
      body.innerHTML = `<div class="lk-thread"><div class="lk-loci rt-msg"><span class="rt-k">From your ${esc(R(u.rid).name)} · ${esc(fWhen(u.at))}</span><p>${left.length ? `Three readings on cooling the court came in this morning. ${left.length === 3 ? "The Bahadori article is the short one, with the airflow in section." : `${left.length} still to look at.`}` : "You've been through this morning's readings."}</p><div class="lk-q">${btn("See them", `data-act="openrun" data-u="${u.id}"`, "quiet")}</div></div></div>`;
    }
    const prompts = $(".prompts", cp);
    prompts?.insertAdjacentHTML("afterbegin", `<button type="button" data-act="new" data-kind="review" data-place="climate">Every Friday, ask me what I got wrong here</button>`);
  }

  /* ================================================================ rendering */
  function shell(name) {
    root.innerHTML = DATA.screens[name];
    $$(".navigation-rail .navigation-link[href], .tab-bar .tab-bar-link[href]", root).forEach((a) => a.removeAttribute("aria-current"));
    $$(".account-name", root).forEach((x) => (x.textContent = "Layla Haddad"));
    $$(".account-avatar", root).forEach((x) => (x.textContent = "LH"));
    $$(".account-trigger", root).forEach((x) => { x.setAttribute("aria-label", "Account menu for Layla Haddad"); x.title = "Layla Haddad"; });
  }
  function render() {
    const scroll = window.scrollY, active = document.activeElement?.id, sheetScroll = $(".rt-sheet-body", root)?.scrollTop || 0;
    if (S.view === "today") todayView();
    else if (S.view === "loci") lociView();
    else {
      shell("library");
      $$(`.navigation-rail .navigation-link[href="/today"], .tab-bar .tab-bar-link[href="/today"]`, root).forEach((a) => a.setAttribute("aria-current", "page"));
      $("main", root).innerHTML = `<div class="rt-page">${header()}${S.tab === "runs" ? runsTab() : routinesTab()}</div>`;
    }
    if (S.edit) { root.insertAdjacentHTML("beforeend", editorHTML()); const sb = $(".rt-sheet-body", root); if (sb) sb.scrollTop = sheetScroll; }
    const cur = S.view === "routines" ? S.tab : S.view;
    root.insertAdjacentHTML("beforeend", `<div class="sm-proto" role="group" aria-label="Prototype views"><span>Prototype</span>${[["today", "Today"], ["routines", "Routines"], ["runs", "Runs"], ["loci", "In Loci"]].map(([k, l]) => `<button type="button" data-go="${k}" aria-pressed="${cur === k}">${l}</button>`).join("")}</div>`);
    if (toastMsg) root.insertAdjacentHTML("beforeend", `<div class="sm-toast" role="status"><span>${esc(toastMsg.t)}</span>${toastMsg.undo ? '<button type="button" data-act="toast-undo">Undo</button>' : ""}</div>`);
    window.scrollTo(0, scroll);
    if (active) { const el = document.getElementById(active); if (el) { el.focus({ preventScroll: true }); if (el.setSelectionRange && typeof el.value === "string" && el.type !== "time") try { el.setSelectionRange(el.value.length, el.value.length); } catch { /* not text */ } } }
  }
  let toastMsg = null, toastTimer = 0, undoFn = null;
  function toast(t, undo) { undoFn = undo || null; toastMsg = { t, undo: !!undo }; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toastMsg = null; undoFn = null; $(".sm-toast", root)?.remove(); }, 5200); }
  function go(where) {
    if (where === "routines" || where === "runs") { S.view = "routines"; S.tab = where; } else S.view = where;
    try { history.replaceState(null, "", "#" + where); } catch { /* sandboxed */ }
    window.scrollTo(0, 0); render();
  }

  /* ================================================================ actions */
  function openRun(id) { S.sel = id; S.filter = null; go("runs"); }
  function startRun(r) {
    if (S.running) return;
    S.running = { rid: r.id, step: 0 }; S.flash = null; render();
    const tick = setInterval(() => {
      S.running.step++;
      if (S.running.step >= 6) {
        clearInterval(tick);
        const u = makeRun(r);
        S.running = null; S.runs.push(u);
        toast(u.status === "skipped" ? `${r.name}: nothing new, so nothing used.` : `${r.name} is ready. ${status(u)[1]}.`);
        openRun(u.id); return;
      }
      if (S.view === "routines" && S.tab === "routines") { const c = $(`#card-${r.id}`, root); if (c) c.outerHTML = card(r); }
    }, 750);
  }
  function makeRun(r) {
    const when = new Date(NOW); when.setMinutes(NOW.getMinutes() + 1 + S.runs.filter((x) => x.how === "now").length);
    const base = { id: "u" + ++runId, rid: r.id, at: when, how: "now", status: "", took: "34 s", cost: costRun(r) };
    if (r.kind === "reading") {
      const pool = BOOKS[r.place] || BOOKS.climate;
      const used = new Set(S.runs.filter((x) => x.out.items && x.out.kind === "reading" && R(x.rid).place === r.place).flatMap((x) => x.out.items.map((b) => b.id)));
      const fresh = pool.filter((b) => !used.has(b.id)).slice(0, 3);
      if (!fresh.length) return { ...base, status: "skipped", cost: 0, took: "2 s", out: { kind: "skip", why: `Nothing new on ${PLACES[r.place].name} that you don't already have or haven't dismissed. No allowance used.` } };
      return { ...base, out: { kind: "reading", items: fresh.map((b) => ({ ...b, st: r.may === "save" ? "saved" : null })) } };
    }
    if (r.kind === "brief") return { ...base, took: "1 min 9 s", out: { kind: "brief", chapters: BRIEF, heard: false } };
    if (r.kind === "review") return { ...base, out: { kind: "review", items: (REVIEW[r.place] || REVIEW.precast).map((x) => ({ ...x })) } };
    if (r.kind === "digest") return { ...base, out: { kind: "digest", items: DIGEST.map((d) => ({ ...d })) } };
    return { ...base, out: { kind: "project" } };
  }
  const FB = {
    basic: (r) => r.kind === "reading" ? "Pitch it one step deeper than my card says" : "Ask harder questions; skip the definitions",
    long: (r) => r.kind === "brief" ? "Keep it under four minutes" : r.kind === "reading" ? "Two items are enough" : "Keep it to the two most important",
    work: () => "Tie every item to the prayer hall in Dubai",
  };
  let playTimer = 0;

  root.addEventListener("click", (ev) => {
    const t = ev.target.closest("[data-act], [data-tab], [data-go], a[href], .theme-toggle, .rail-toggle");
    if (!t || !root.contains(t)) return;
    if (t.matches("[data-go]")) { S.edit = null; go(t.dataset.go); return; }
    if (t.matches("[data-tab]")) { ev.preventDefault(); if (t.dataset.tab === "runs") S.filter = null; go(t.dataset.tab); return; }
    if (t.matches(".theme-toggle")) { const dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches); document.documentElement.dataset.theme = dark ? "light" : "dark"; render(); return; }
    if (t.matches(".rail-toggle")) { const sh = $(".app-shell", root); sh.dataset.rail = sh.dataset.rail === "open" ? "closed" : "open"; return; }
    if (t.matches("a[href]") && !t.dataset.act) {
      ev.preventDefault();
      const href = t.getAttribute("href");
      if (href === "/today") go("today"); else if (href === "/graph") go("loci"); else if (href === "#routines" || href === "#runs") go(href.slice(1)); else toast("Only Today, Routines and Loci are in this prototype.");
      return;
    }
    const a = t.dataset.act, id = t.dataset.id;
    const u = t.dataset.u ? S.runs.find((x) => x.id === t.dataset.u) : null, i = Number(t.dataset.i);
    switch (a) {
      case "toggle": { ev.preventDefault(); const r = R(id); r.on = !r.on; toast(r.on ? `${r.name} is on. Next run ${fWhen(nextRun(r))}.` : `${r.name} is paused. It won't run until you turn it back on.`); break; }
      case "runnow": { const r = R(id); if (!r.on) toast(`${r.name} is paused, but Run now still runs it once.`); startRun(r); return; }
      case "runsof": S.filter = id; S.sel = lastRun(R(id))?.id; go("runs"); return;
      case "unfilter": S.filter = null; break;
      case "sel": S.sel = id; S.refineOpen = null; S.dismissing = null; break;
      case "openrun": ev.preventDefault(); openRun(t.dataset.u); return;
      case "new": {
        const kind = t.dataset.kind || "reading", K = KINDS[kind], place = t.dataset.place || K.place;
        S.edit = { isNew: true, d: { id: null, kind, name: K.name, obj: K.obj(PLACES[place].name), place, every: { ...K.every }, to: { ...K.to }, may: "suggest", skip: true, on: true, guides: [] } };
        break;
      }
      case "edit": S.edit = { isNew: false, d: draftOf(R(id)) }; break;
      case "ed-close": S.edit = null; break;
      case "ed-seg": S.edit.d.every[t.dataset.key] = t.dataset.val; if (t.dataset.val === "hours" && !S.edit.d.every.hours) S.edit.d.every.hours = 6; break;
      case "ed-to": S.edit.d.to[t.dataset.key] = !S.edit.d.to[t.dataset.key]; break;
      case "ed-may": S.edit.d.may = t.dataset.val; break;
      case "ed-skip": S.edit.d.skip = !S.edit.d.skip; break;
      case "ed-guide-del": S.edit.d.guides.splice(i, 1); break;
      case "ed-save": {
        const d = S.edit.d;
        if (!d.name.trim() || !d.obj.trim()) { toast("Give it a name and say what it should do."); render(); return; }
        if (!d.to.today && !d.to.email && !d.to.audio) { toast("Choose where the result lands: Today, Email or Audio."); render(); return; }
        if (S.edit.isNew) { d.id = "r" + ++rid; S.routines.push(d); toast(`Created. ${d.name} first runs ${fWhen(nextRun(d))}.`); }
        else { const k = S.routines.findIndex((r) => r.id === d.id); S.routines[k] = d; toast(`Saved. Next run ${d.on ? fWhen(nextRun(d)) : "when you turn it on"}.`); }
        S.flash = d.id; S.edit = null; S.view = "routines"; S.tab = "routines";
        render(); $(`#card-${d.id}`, root)?.scrollIntoView({ block: "center", behavior: "smooth" }); setTimeout(() => { S.flash = null; $(`#card-${d.id}`, root)?.removeAttribute("data-flash"); }, 1800);
        return;
      }
      case "ed-del": { const r = R(id), k = S.routines.indexOf(r); S.routines.splice(k, 1); S.edit = null; S.view = "routines"; S.tab = "routines"; toast(`Deleted ${r.name}. Its runs stay in Runs.`, () => S.routines.splice(k, 0, r)); break; }
      case "save": { const b = u.out.items[i]; b.st = "saved"; toast(`Saved “${b.t}” to Commonplace, on ${PLACES[R(u.rid).place].name}.`, () => { b.st = null; }); break; }
      case "dis-open": S.dismissing = { u: u.id, i }; break;
      case "dis-cancel": S.dismissing = null; break;
      case "dismiss": { const b = u.out.items[i]; b.st = "dismissed"; b.dis = t.dataset.val; S.dismissing = null; toast(`Dismissed. Loci won't suggest it again${t.dataset.val === "Too basic" || t.dataset.val === "Too advanced" ? ", and will pitch the next ones accordingly" : ""}.`, () => { b.st = null; b.dis = null; }); break; }
      case "reveal": u.out.items[i].shown = true; break;
      case "mark": { u.out.items[i].mark = t.dataset.val; if (t.dataset.val === "not") toast(`Kept in To revisit on ${PLACES[R(u.rid).place].name}.`); break; }
      case "play": {
        if (S.play && S.play.u === u.id && S.play.on) { S.play.on = false; clearInterval(playTimer); break; }
        if (!S.play || S.play.u !== u.id) S.play = { u: u.id, t: 0, on: true }; else S.play.on = true;
        if (S.play.t >= 100) S.play.t = 0;
        clearInterval(playTimer);
        playTimer = setInterval(() => { if (!S.play?.on) return clearInterval(playTimer); S.play.t = Math.min(100, S.play.t + 2); if (S.play.t >= 100) { S.play.on = false; u.out.heard = true; clearInterval(playTimer); toast("Brief finished. The question will come back in Friday's review."); } if (S.view === "routines" && S.tab === "runs") render(); }, 400);
        break;
      }
      case "fb": {
        const r = R(u.rid), k = t.dataset.val;
        if (k === "ok") { u.fb = "ok"; break; }
        const g = { t: FB[k](r), from: fDay(u.at), how: "you tapped " + t.textContent };
        r.guides.push(g); u.fb = g.t; toast("Added to its guidelines. It reads them from the next run.", () => { r.guides = r.guides.filter((x) => x !== g); u.fb = null; });
        break;
      }
      case "refine": S.refineOpen = S.refineOpen === u.id ? null : u.id; break;
      case "refine-save": {
        const v = ($("#rf-text", root)?.value || "").trim(); if (!v) { toast("Write what it should do differently."); return; }
        const r = R(u.rid), g = { t: v.slice(0, 160), from: fDay(u.at), how: "in your words" };
        r.guides.push(g); u.fb = g.t; S.refineOpen = null; toast("Added. It reads this from the next run.");
        break;
      }
      case "explain": toast("In the app, this opens Loci on the topic with the question already asked."); return;
      case "findfor": toast("In the app, this asks Loci for readings on this question (Loci suggests resources, R2)."); return;
      case "learnfor": toast("In the app, this makes a Lumen for the project (Work, W3)."); return;
      case "toast-undo": if (undoFn) undoFn(); undoFn = null; toastMsg = null; break;
      default: return;
    }
    render();
  });
  root.addEventListener("input", (ev) => {
    const t = ev.target; if (!S.edit || !t.dataset || !t.dataset.ed) return;
    const d = S.edit.d, k = t.dataset.ed;
    if (k === "name" || k === "obj") d[k] = t.value;
    else if (k === "place") { const old = PLACES[d.place].name; d.place = t.value; if (d.obj.includes(old)) d.obj = d.obj.replace(old, PLACES[d.place].name); render(); return; }
    else { d.every[k] = t.value; }
    refreshEstimate();
  });
  root.addEventListener("change", (ev) => { const t = ev.target; if (S.edit && t.dataset?.ed && ["place", "day", "hours", "time"].includes(t.dataset.ed)) { if (t.dataset.ed !== "place") { S.edit.d.every[t.dataset.ed] = t.value; } render(); } });
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && S.edit) { S.edit = null; render(); } });

  const start = (location.hash || "").slice(1);
  if (["today", "routines", "runs", "loci"].includes(start)) go(start); else render();
})();
