/* Routines (prototype, version 5): a page that works like the rest of Studiolo.
   - It's laid out like the Graph page: the content on the left, the real Loci panel on the right. The panel uses the
     copilot's own markup and CSS: the head (kicker, title, chips, tabs), the conversation (msg.user / msg.ai, qopts
     answers, cp-card proposals, the thinking dots), and prompts plus the composer with its scope chip.
   - The left is split by job, with the app's destination tabs: Your routines · Waiting · Activity. Your routines uses
     the Library's own pieces: the search row, the filter pills, and mcard cards (kicker, title, one line, and a footer
     with a status dot). The page has one primary button: New routine.
   - Click a card and Loci switches to that routine ("This routine", like "This topic" on the map). It shows what the
     routine does as a sentence with tappable words, what it did lately, and a conversation about it. With nothing
     open, Loci shows the overview ("All routines", like "Your whole map"): a greeting, a summary and ideas.
   - Loci answers questions about routines ("What did my routines do this week?", "Why was that filed there?") as well
     as making and changing them. A new routine shows as a draft card on the left until it's turned on
     (propose, then confirm).
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
  const mobile = () => matchMedia("(max-width: 979.98px)").matches;

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
  const CH_SHORT = { any: "Anywhere", whatsapp: "WhatsApp", email: "Email", share: "Phone share", browser: "Browser" };
  const CH_OPTS = [["whatsapp", "On WhatsApp"], ["email", "By email"], ["share", "Shared from my phone"], ["browser", "From the browser"], ["any", "From anywhere"]];
  const ITEM_KINDS = ["photo", "link", "PDF", "voice note", "reel", "video"];
  const KIND_WORD = { photo: "a photo", link: "a link", PDF: "a PDF", "voice note": "a voice note", reel: "a reel", video: "a video" };
  const KINDS_WORD = (k) => (k === "PDF" ? "PDFs" : k + "s");
  const IS_OPTS = ["a book", "a recipe", "a paper", "a lecture"];
  const FILE_AS = ["Site photos", "Renders", "Precedents", "Books", "Papers", "Videos", "Specifications", "Notes", "Recipes"];
  const UND = { describe: "describe it", transcribe: "write out what I said", title: "give it a title", links: "save the links in its caption", book: "find the book", text: "pull out the text", summary: "sum it up in three lines", recipe: "keep just the recipe" };
  const UND_SHORT = { describe: "described", transcribe: "written out", links: "caption links kept", book: "book found", summary: "summed up", recipe: "just the recipe" };
  const LRN = { questions: "turn my questions into @questions", review: "add it to Review" };

  /* ================================================================ the learner's routines */
  let rid = 0;
  const thenOf = (t) => ({ fileAs: "", on: "best", status: "", addTo: "", understand: [], learn: [], reply: "", ...t });
  const arrive = (name, when, ifs, then, extra) => ({ id: "r" + ++rid, type: "arrive", name, on: true, when, ifs, then: thenOf(then), mode: "ask", right: [0, 0], filed: 0, lately: [], ...extra });
  const ROUTINES = [
    arrive("Site photos", "whatsapp", [{ t: "kind", v: "photo" }, { t: "tag", v: "#site" }], { fileAs: "Site photos", on: "", addTo: "project", understand: ["describe"] }, { mode: "own", right: [31, 31], filed: 31,
      lately: [{ t: "North wall, morning", w: "as Site photos in the prayer hall project", when: "Yesterday, 16:05" }, { t: "Mihrab niche, rough opening", w: "as Site photos in the prayer hall project", when: "Fri, 11:20" }] }),
    arrive("Books", "any", [{ t: "is", v: "a book" }], { fileAs: "Books", status: "To read", understand: ["book"] }, { right: [9, 10],
      lately: [{ t: "Architecture for the Poor", w: "as Books on Climate-responsive design, To read · you checked it", when: "Thu, 19:40" }] }),
    arrive("Voice notes", "whatsapp", [{ t: "kind", v: "voice note" }], { fileAs: "Notes", understand: ["transcribe"], learn: ["questions"], reply: "confirm" }, { right: [7, 8],
      lately: [{ t: "Daylight factor for the hall", w: "as Notes on Daylight & shading, 1 question · you checked it", when: "Sat, 08:02" }] }),
    arrive("Recipes", "any", [{ t: "is", v: "a recipe" }], { fileAs: "Recipes", on: "home", understand: ["recipe"] }, { mode: "own", right: [4, 4], filed: 4,
      lately: [{ t: "Za'atar flatbread (example reel)", w: "as Recipes on Home & family", when: "Yesterday, 21:12" }] }),
    arrive("Precedents", "any", [{ t: "site", v: "archdaily.com" }], { fileAs: "Precedents", status: "To read" }, { mode: "own", right: [14, 14], filed: 14,
      lately: [{ t: "Courtyard school in Burkina Faso (example)", w: "as Precedents on Climate-responsive design, To read", when: "Yesterday, 18:40" }] }),
    { id: "r" + ++rid, type: "schedule", kind: "review", name: "Friday review", on: true, every: "w5", time: "17:00", place: "precast", count: 3, stat: "7 answered this month",
      lately: [{ t: "3 questions on Precast", w: "2 right, 1 to revisit", when: "Fri, 17:00" }] },
    { id: "r" + ++rid, type: "schedule", kind: "pile", name: "Clear the To read pile", on: true, every: "month", time: "09:00", stat: "11 let go, 6 kept this year",
      lately: [{ t: "3 things in To read for over three months", w: "waiting for you", when: "1 Oct" }] },
    { id: "r" + ++rid, type: "after", kind: "lumen", name: "After a Lumen", on: true, delay: "three days later", stat: "12 checks this month",
      lately: [{ t: "The check for “How a malqaf moves air”", w: "came back · right", when: "Sat" }] },
    { id: "r" + ++rid, type: "after", kind: "dup", name: "Saved twice", on: true, stat: "3 caught this month",
      lately: [{ t: "Thermal Delight in Architecture", w: "already saved · nothing added", when: "Wed" }] },
  ];
  const RR = (id) => ROUTINES.find((r) => r.id === id);
  const GROUP = { arrive: "When I send something", schedule: "On a schedule", after: "After I do something" };
  const GROUP_NOTE = { arrive: "Checked from the top. The first one that fits files it.", schedule: "They run on their own, when you said.", after: "They follow up on something you did." };

  /* ---------- what's waiting for the learner, and what routines did */
  let wid = 0;
  const W = [
    { id: "w" + ++wid, kind: "single", rid: "r2", title: "Photo of a book cover", newTitle: "Climate Considerations in Building and Urban Design", found: "Loci found the book: Baruch Givoni, 1998.", sug: "climate", fileAs: "Books", status: "To read", when: "Today, 07:52", from: "WhatsApp" },
    { id: "w" + ++wid, kind: "single", rid: "r3", title: "Voice note, 0:38", newTitle: "Precaster: thermal breaks at the fixings", found: "Written out, with one question: “Is stainless worth the extra cost at the fixings?”", sug: "precast", fileAs: "Notes", when: "Today, 07:31", from: "WhatsApp" },
    { id: "w" + ++wid, kind: "pile", rid: "r7", when: "1 Oct", items: [{ t: "Design with Climate, Victor Olgyay", k: "Book", since: "since June" }, { t: "Architecture for the Poor, Hassan Fathy", k: "PDF", since: "since May" }, { t: "Lecture: daylight in deep plans (example)", k: "Video", since: "since July" }] },
  ];
  const ACT = [
    { day: "Today", t: "07:52", rid: "r2", what: "suggests a place for “Climate Considerations in Building and Urban Design”", state: "waiting" },
    { day: "Today", t: "07:31", rid: "r3", what: "wrote out a voice note and suggests Precast", state: "waiting" },
    { day: "Yesterday", t: "21:12", rid: "r4", what: "filed “Za'atar flatbread” as Recipes on Home & family", state: "filed" },
    { day: "Yesterday", t: "18:40", rid: "r5", what: "filed “Courtyard school in Burkina Faso” as Precedents, To read", state: "filed" },
    { day: "Yesterday", t: "16:05", rid: "r1", what: "filed “North wall, morning” as Site photos in the prayer hall project, and described it", state: "filed" },
    { day: "Saturday", t: "09:00", rid: "r8", what: "brought back the check for “How a malqaf moves air”: right", state: "done" },
    { day: "Friday", t: "17:00", rid: "r6", what: "asked 3 questions on Precast: 2 right, 1 to revisit", state: "done" },
  ];

  /* ---------- the last 20 things sent, for "What would it do?" (examples) */
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
  const SEND = [
    { id: "m1", ch: "whatsapp", label: "WhatsApp: a photo with #site", kind: "photo", tags: ["#site"], title: "East court at 4 pm", about: "climate" },
    { id: "m2", ch: "whatsapp", label: "WhatsApp: a photo of a book cover", kind: "photo", is: "a book", title: "Photo of a book cover", newTitle: "The Environmental Imagination", found: "Loci found the book: Dean Hawkes, 2008.", about: "climate" },
    { id: "m3", ch: "share", label: "Phone: an Instagram recipe reel", kind: "reel", is: "a recipe", title: "Red lentil soup in 20 minutes (example reel)", about: "home" },
    { id: "m4", ch: "email", label: "Email: “Precast facade specification” (PDF)", kind: "PDF", title: "Precast facade specification (draft).pdf", found: "24 pages. Summary: stainless A4 fixings; 20 mm joints; a thermal break at every bracket.", about: "precast" },
    { id: "m5", ch: "browser", label: "Browser: a link from dezeen.com", kind: "link", site: "dezeen.com", title: "A courtyard museum in Doha (example)", about: "climate" },
    { id: "m6", ch: "browser", label: "Browser: a blog post on Japanese joinery", kind: "link", site: "woodworking-blog.example", title: "Japanese joinery without nails (example)", newTopic: "Timber joinery" },
    { id: "m7", ch: "whatsapp", label: "WhatsApp: a book you already have", kind: "photo", is: "a book", title: "Thermal Delight in Architecture", dup: true },
  ];
  const SOURCES = ["Design-tools newsletter", "Building-science journal", "Architecture news site", "Conference channel", "A practice's blog you've saved from 6 times"];

  /* ================================================================ state */
  const S = { tab: "all", filter: "all", q: "", sel: null, ptab: "all", more: null, view: "routines", pop: null, sendOpen: false, builder: false, sheet: false, flash: null, tryOpen: null, noticed: "open", sent: new Set() };
  const C = { all: [], per: {}, draft: null, previewed: false, q: [], cur: null, typing: null, input: "", pendingDelete: null, pendingSaid: null, srcOff: null, force: null };

  /* ================================================================ sentences, with tappable words */
  const chip = (id, f, label) => `<button type="button" class="rx-chip" data-act="chip" data-r="${id}" data-f="${f}">${esc(label)}</button>`;
  const reads = (x) => `<span class="rx-reads">${esc(x)}</span>`;
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
      const quals = r.ifs.filter((c) => c.t !== "kind").map((c) => ({
        tag: () => `with ${chip(id, "tag", c.v)}`, site: () => `from ${chip(id, "site", c.v)}`, words: () => `mentioning ${chip(id, "words", c.v)}`,
        is: () => `that's ${chip(id, "is", c.v)}`, about: () => `about ${chip(id, "about", PLACES[c.v].name)}`,
      })[c.t]());
      const t = r.then, acts = [];
      t.understand.forEach((k) => acts.push(reads(UND[k])));
      let file = t.fileAs ? `file it as ${chip(id, "fileAs", t.fileAs)}` : "file it";
      if (t.on === "best") file += ` on ${chip(id, "on", "the topic it's about")}`;
      else if (t.on) file += ` on ${chip(id, "on", PLACES[t.on].name)}`;
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
  // what a card says: a kicker, and one line
  const arrivePos = (r) => ROUTINES.filter((x) => x.type === "arrive").indexOf(r) + 1;
  function kickerOf(r) {
    if (r.type === "arrive") return `${arrivePos(r) || "New"} · ${CH_SHORT[r.when]}`;
    if (r.type === "schedule") return r.every === "month" ? "1st of the month" : r.every === "day" ? `Daily, ${hm(r.time)}` : r.every === "weekdays" ? `Weekdays, ${hm(r.time)}` : `${DAYLONG[Number(r.every.slice(1))]}s, ${hm(r.time)}`;
    return r.kind === "lumen" ? "After a Lumen" : "When I save something again";
  }
  function summary(r) {
    if (r.type === "arrive") {
      const f = (t) => r.ifs.find((c) => c.t === t)?.v;
      const k = f("kind"), tag = f("tag"), site = f("site"), is = f("is");
      const what = `${k ? cap(KINDS_WORD(k)) : is ? cap(is.replace(/^an? /, "")) + "s" : "Anything"}${tag ? ` with ${tag}` : ""}${site ? ` from ${site.split(",")[0]}${site.includes(",") ? " and more" : ""}` : ""}`;
      const t = r.then;
      const same = t.fileAs && what.toLowerCase().includes(t.fileAs.toLowerCase());
      const to = [same ? "" : t.fileAs, t.on === "best" ? "its topic" : t.on ? PLACES[t.on].name : "", t.addTo === "project" ? "prayer hall project" : "", t.status].filter(Boolean).join(", ");
      const extra = t.understand.map((u) => UND_SHORT[u]).filter(Boolean);
      return `${what} → ${to}${extra.length ? ` · ${extra.join(", ")}` : ""}`;
    }
    if (r.type === "schedule") return ({ tidy: () => (r.mode === "ask" ? "Asks you about each thing in Unsorted" : "Files what it's sure of in Unsorted, asks about the rest"), follow: () => `What's new on ${r.label || PLACES[r.place].name}, from ${plural(r.sources.length, "source")}`, review: () => `${r.count} questions on what slipped at ${PLACES[r.place]?.name}`, pile: () => "Shows what's sat in To read for three months" })[r.kind]();
    return r.kind === "lumen" ? `Brings a Lumen's check back ${r.delay}` : "Keeps the one you have, and tells you";
  }
  const modeLabel = (r) => (r.mode === "own" ? "Files on its own" : "Asks you first");
  function nextRun(r) {
    const [h, m] = r.time.split(":").map(Number);
    if (r.every === "month") return new Date(2026, 10, 1, h, m);
    for (let i = 0; i < 9; i++) {
      const d = new Date(NOW); d.setDate(d.getDate() + i); d.setHours(h, m, 0, 0);
      const wd = d.getDay();
      if ((r.every === "day" || (r.every === "weekdays" && wd > 0 && wd < 6) || r.every === "w" + wd) && d > NOW) return d;
    }
    return NOW;
  }
  const fNext = (d) => (d.toDateString() === NOW.toDateString() ? `today, ${hm(`${d.getHours()}:${d.getMinutes()}`)}` : `${DAYLONG[d.getDay()].slice(0, 3)} ${d.getDate()} ${MON[d.getMonth()]}`);
  const stateOf = (r) => (!r.on ? ["s0", "Paused"] : r.type === "schedule" ? ["s2", `Next: ${fNext(nextRun(r))}`] : r.type === "after" ? ["s2", "On"] : r.mode === "own" ? ["s2", "Files on its own"] : ["s1", "Asks you first"]);
  const countOf = (r) => (r.type === "arrive" ? (r.mode === "own" ? `${r.filed} this month` : r.right[1] ? `right ${r.right[0]} of ${r.right[1]}` : "New") : r.stat);

  /* ================================================================ matching (plain rules in code; "is" needs Loci to read the item) */
  function fits(r, it) {
    if (!r.on && r.id !== "draft") return false;
    if (r.when !== "any" && r.when !== it.ch) return false;
    return r.ifs.length > 0 && r.ifs.every((c) => ({
      kind: () => it.kind === c.v, tag: () => (it.tags || []).includes(c.v), site: () => c.v.split(/[,\s]+/).includes(it.site),
      words: () => it.title.toLowerCase().includes(c.v.toLowerCase()), is: () => it.is === c.v, about: () => it.about === c.v,
    })[c.t]());
  }
  function whereFor(r, it) {
    const t = r.then, place = t.on === "best" ? it.about : t.on;
    const base = [t.fileAs && `as ${t.fileAs}`, place && `on ${PLACES[place].name}`, t.addTo === "project" && "in the prayer hall project"].filter(Boolean).join(" ");
    return (base || "where it is") + (t.status ? `, ${t.status}` : "");
  }
  const firstFit = (it) => ROUTINES.find((r) => r.type === "arrive" && fits(r, it));
  function tryHTML(r) {
    const hits = PAST.filter((p) => fits({ ...r, id: "draft", on: true }, p));
    if (!hits.length) return `<p class="note">None of the last 20 things you sent fit this yet.</p>`;
    return `<div class="rx-try"><p><b>${hits.length} of the last 20 things you sent</b> would have been filed${r.id === "draft" ? ". Nothing moves until it's on" : ""}:</p><ul>${hits.slice(0, 3).map((p) => `<li><b>${esc(p.title)}</b><span>${esc(whereFor(r, p))}</span></li>`).join("")}</ul></div>`;
  }

  /* ================================================================ the left: header, tabs, and the three jobs */
  const ICON = {
    plus: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    send: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    fold: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  };
  const btn = (label, attrs, kind = "") => `<button type="button" class="button${kind ? " button-" + kind : ""}" ${attrs}>${label}</button>`;
  function header() {
    const tabs = [["all", "Your routines", null], ["waiting", "Waiting", W.length], ["activity", "Activity", null]];
    return `<h1 class="visually-hidden">Routines</h1><header class="destination-header"><div class="destination-crumb"><strong>Library</strong><i aria-hidden="true">/</i><span>Routines</span></div>
      <nav aria-label="Routines sections" class="destination-tabs">${tabs.map(([k, l, n]) => `<a class="destination-tab" href="#${k}" data-act="tab" data-v="${k}"${S.tab === k ? ' aria-current="page"' : ""}>${l}${n ? `<span class="rx-count">${n}</span>` : ""}</a>`).join("")}</nav></header>`;
  }
  function card(r) {
    const [dot, st] = stateOf(r);
    return `<article class="mcard rx-card" data-r="${r.id}"${S.sel === r.id ? ' aria-current="true"' : ""}${r.on ? "" : " data-off"}${S.flash === r.id ? " data-flash" : ""}>
      <button type="button" class="rx-hit" data-act="sel" data-r="${r.id}" aria-label="Open “${esc(r.name)}” in Loci"></button>
      <div class="ci"><div class="body"><p class="kicker">${esc(kickerOf(r))}</p><h2 class="mcard-title">${esc(r.name)}</h2><p>${esc(summary(r))}</p></div>
      <div class="ft"><div class="ft-meta"><span aria-hidden="true" class="dot ${dot}"></span><span>${esc(st)}</span><span class="ft-notes">${esc(countOf(r))}</span></div></div></div></article>`;
  }
  function draftCard(type) {
    const d = C.draft; if (!d || !C.previewed || d.type !== type) return "";
    return `<article class="mcard rx-card rx-ghost"><button type="button" class="rx-hit" data-act="show-draft" aria-label="Show the draft in Loci"></button>
      <div class="ci"><div class="body"><p class="kicker">Draft · not on yet</p><h2 class="mcard-title">${esc(d.name)}</h2><p>${esc(summary(d))}</p></div>
      <div class="ft"><div class="ft-meta"><span aria-hidden="true" class="dot rx-dot-ghost"></span><span>Turn it on in Loci</span></div></div></div></article>`;
  }
  function allTab() {
    const q = S.q.trim().toLowerCase();
    const n = (t) => ROUTINES.filter((r) => r.type === t).length;
    const pills = [["all", "All", ROUTINES.length], ["arrive", "When I send", n("arrive")], ["schedule", "On a schedule", n("schedule")], ["after", "After I do something", n("after")]];
    const shown = ROUTINES.filter((r) => (S.filter === "all" || r.type === S.filter) && (!q || `${r.name} ${summary(r)} ${kickerOf(r)}`.toLowerCase().includes(q)));
    const types = (S.filter === "all" ? ["arrive", "schedule", "after"] : [S.filter]).filter((t) => shown.some((r) => r.type === t) || (C.draft && C.previewed && C.draft.type === t && !q));
    const groups = types.map((t) => `<section class="rx-group" aria-labelledby="rx-g-${t}"><div class="rx-group-h"><h2 id="rx-g-${t}">${GROUP[t]}</h2><span>${GROUP_NOTE[t]}</span></div>
      <div class="rx-grid">${q ? "" : draftCard(t)}${shown.filter((r) => r.type === t).map(card).join("")}</div></section>`).join("");
    return `<div class="library-wall rx-wall">
      <p class="rx-lead">Things Loci does for you, the way you asked: mostly filing what you send. Open one to see what it did or to change it.</p>
      <div class="lsearch"><input type="search" id="rx-q" aria-label="Search your routines" placeholder="Search your routines…" value="${esc(S.q)}"><span class="n" aria-live="polite">${shown.length === ROUTINES.length ? `${plural(ROUTINES.length, "routine")} · ${ROUTINES.filter((r) => r.on).length} on` : `${shown.length} of ${plural(ROUTINES.length, "routine")}`}</span><button type="button" class="button rx-new" data-act="new">${ICON.plus}New routine</button></div>
      <div class="colls" role="group" aria-label="Show">${pills.map(([k, l, c]) => `<button type="button" data-act="filter" data-v="${k}" aria-pressed="${S.filter === k}"${S.filter === k ? ' class="on"' : ""}>${l}<span>${c}</span></button>`).join("")}</div>
      ${groups || `<p class="rx-empty">No routines match “${esc(S.q)}”. ${btn("Clear the search", 'data-act="q-clear"', "link")}</p>`}
    </div>`;
  }
  const topicSel = (id, cur) => `<select class="sm-select rx-sel" id="${id}" aria-label="Topic">${TOPICS.map((p) => `<option value="${p}"${p === cur ? " selected" : ""}>${esc(PLACES[p].name)}</option>`).join("")}</select>`;
  function waitCard(w) {
    if (w.kind === "single") {
      const r = RR(w.rid);
      return `<article class="mcard rx-wcard"><div class="ci"><div class="body"><p class="kicker">${esc(r.name)} asks · ${esc(w.from)} · ${esc(w.when)}</p><h2 class="mcard-title">${esc(w.newTitle || w.title)}</h2>${w.found ? `<p>${esc(w.found)}</p>` : ""}
        <div class="rx-wfile"><span>File it${w.fileAs ? ` as ${esc(w.fileAs)}` : ""}${r.then.addTo === "project" ? " in the prayer hall project" : ""}${r.then.on === "best" ? " on" : r.then.on ? ` on ${esc(PLACES[r.then.on].name)}` : ""}</span>${r.then.on === "best" ? topicSel(`ws-${w.id}`, w.sug) : ""}${w.status ? `<span>, ${esc(w.status)}</span>` : ""}</div></div>
        <div class="ft rx-wacts">${btn("File it", `data-act="w-file" data-w="${w.id}"`)}${btn("Not this", `data-act="w-no" data-w="${w.id}"`, "quiet")}</div></div></article>`;
    }
    if (w.kind === "nomatch") {
      const it = w.item;
      return `<article class="mcard rx-wcard"><div class="ci"><div class="body"><p class="kicker">No routine covers this · ${esc(CH_SHORT[it.ch])} · just now</p><h2 class="mcard-title">${esc(it.title)}</h2><p>${esc(cap(KIND_WORD[it.kind]))}${it.site ? ` from ${esc(it.site)}` : ""}.</p>
        <div class="rx-wfile">${it.about ? `<span>Loci would put it on</span>${topicSel(`ws-${w.id}`, it.about)}` : `<span>Nothing on your map fits. Loci would start a sub-topic, <b>${esc(it.newTopic)}</b>.</span>`}</div></div>
        <div class="ft rx-wacts">${btn("File it there", `data-act="w-file" data-w="${w.id}"`)}${btn("Leave it in Unsorted", `data-act="w-no" data-w="${w.id}"`, "quiet")}${btn("Make a routine for things like this", `data-act="w-make" data-w="${w.id}"`, "link")}</div></div></article>`;
    }
    const left = w.items.filter((x) => !x.st).length;
    return `<article class="mcard rx-wcard"><div class="ci"><div class="body"><p class="kicker">${esc(RR(w.rid)?.name || "To read pile")} · ${esc(w.when)}</p><h2 class="mcard-title">${plural(left, "thing")} in To read for over three months</h2>
      ${w.items.map((x, i) => `<div class="rx-pile"><span><b>${esc(x.t)}</b> <span class="rx-dim">${esc(x.k)} · ${esc(x.since)}</span></span>${x.st ? `<span class="rx-dim">${{ week: "This week: added to Today", keep: "Kept", letgo: "Let go (archived)" }[x.st]}</span>` : `<span class="rx-pacts">${btn("Read it this week", `data-act="p-act" data-w="${w.id}" data-i="${i}" data-v="week"`, "quiet")}${btn("Keep", `data-act="p-act" data-w="${w.id}" data-i="${i}" data-v="keep"`, "quiet")}${btn("Let go", `data-act="p-act" data-w="${w.id}" data-i="${i}" data-v="letgo"`, "quiet")}</span>`}</div>`).join("")}</div></div></article>`;
  }
  const waitingTab = () => `<div class="rx-wall"><p class="rx-lead">Things your routines want you to check. One decision each.</p>${W.length ? `<section class="rx-wlist" aria-label="Waiting for you">${W.map(waitCard).join("")}</section>` : `<p class="rx-empty">Nothing is waiting for you. ${btn("See what your routines did", 'data-act="tab" data-v="activity"', "link")}</p>`}</div>`;
  function activityTab() {
    let day = "";
    const rows = ACT.map((a, i) => {
      const r = RR(a.rid), h = a.day !== day ? `<li class="rx-day">${esc(a.day)}</li>` : "";
      day = a.day;
      const end = a.state === "waiting" ? btn("Check it", 'data-act="tab" data-v="waiting"', "link") : a.undo ? btn("Undo", `data-act="act-undo" data-i="${i}"`, "link") : a.state === "undone" ? `<span class="rx-dim">Undone</span>` : "";
      return `${h}<li class="rx-arow"><time>${esc(a.t)}</time><span>${r ? `<button type="button" class="rx-link" data-act="sel" data-r="${a.rid}">${esc(r.name)}</button>` : "A routine"} ${esc(a.what)}</span>${end}</li>`;
    }).join("");
    return `<div class="rx-wall"><p class="rx-lead">Everything your routines did, newest first. Tap a routine's name to ask Loci about it.</p><ol class="rx-act">${rows}</ol></div>`;
  }

  /* ================================================================ the right: the Loci panel, as everywhere in the app */
  const tkey = () => (S.ptab === "this" && S.sel ? S.sel : "all");
  const threadOf = (k) => (k === "all" ? C.all : (C.per[k] = C.per[k] || []));
  const thread = () => threadOf(C.force || tkey());
  const lociSay = (text, extra = {}) => thread().push({ from: "ai", text, ...extra });
  const meSay = (text) => thread().push({ from: "me", text });
  function think(fn, ms = 650) {
    const k = C.force || tkey();
    C.typing = k; render();
    setTimeout(() => { C.typing = null; const prev = C.force; C.force = k; fn(); C.force = prev; render(); }, ms);
  }
  const optsOf = (pairs) => pairs.map(([label, a, v]) => ({ label, a, v: v ?? label }));

  const builderNote = (d) => `<p class="note rx-builder"><b>Builder:</b> ${d.type === "arrive" ? (d.ifs.some((c) => c.t === "is") || d.then.on === "best" || d.then.understand.length || d.then.learn.length ? "plain rules match where it came from and what kind it is; Loci reads each matching item for the dotted parts (one small model call each)." : "plain rules only: no model, no cost.") : "one small model call per run; skipped when nothing is new."}</p>`;
  function msgHTML(m, i, k) {
    if (m.from === "me") return `<div class="msg user"><p>${esc(m.text)}</p></div>`;
    const list = threadOf(k), last = list.slice(i + 1).every((x) => x.from !== "me");
    let extra = "";
    if (m.card === "draft" && C.draft) {
      const d = C.draft;
      extra = `<div class="cp-card rx-draft" id="rx-draft"><p class="cp-card-title">${esc(d.name)}<span class="tag ag">Draft</span></p><p class="rx-say">${sentence(d, "draft")}</p>
        ${d.type === "arrive" ? `<p class="note">${chip("draft", "mode", modeLabel(d))} · tap an underlined word to change it.</p>${tryHTML(d)}` : `<p class="note">Tap an underlined word to change it.</p>`}${S.builder ? builderNote(d) : ""}
        <div class="acts">${btn("Turn it on", 'data-act="turn-on"')}${btn("Discard", 'data-act="discard"', "quiet")}</div></div>`;
    } else if (m.card === "snap") {
      extra = `<div class="cp-card rx-draft" data-snap><p class="cp-card-title">${esc(m.snapName || "Routine")}<span class="tag${m.done ? " rx-on" : ""}">${m.done ? "On" : "Earlier draft"}</span></p><p class="rx-say">${m.snap}</p></div>`;
    } else if (m.rows) {
      extra = `<div class="rx-rows">${m.rows.map((x) => `<button type="button" class="cp-row" data-act="${x.a}" data-r="${x.r || ""}" data-v="${esc(x.v || "")}"><span aria-hidden="true" class="dot ${x.dot || "s2"}"></span><span><b>${esc(x.b)}</b><em>${esc(x.em)}</em></span><small>${esc(x.small || "")}</small></button>`).join("")}</div>`;
    }
    let opts = "";
    if (m.opts) {
      const live = !m.answered && (last || m.keep);
      opts = `<div class="qopts${m.answered ? " done" : ""}">${m.opts.map((o, j) => o.toggle
        ? `<button type="button" class="rx-tog" data-act="opt" data-k="${k}" data-m="${i}" data-o="${j}" aria-pressed="${!(C.srcOff || new Set()).has(o.v)}"${m.answered ? " disabled" : ""}>${esc(o.label)}</button>`
        : `<button type="button" data-act="opt" data-k="${k}" data-m="${i}" data-o="${j}"${m.answered === o.label ? ' class="chosen"' : ""}${live ? "" : " disabled"}>${esc(o.label)}</button>`).join("")}${m.opts.some((o) => o.toggle) && !m.answered ? `<button type="button" class="rx-use" data-act="src-done" data-k="${k}" data-m="${i}">Use these</button>` : ""}</div>`;
    }
    return `<div class="msg ai"><div class="who"><span class="av" aria-hidden="true">L</span>Loci</div><div class="txt">${m.text.split("\n").map((p) => `<p>${esc(p)}</p>`).join("")}</div>${extra}${opts}</div>`;
  }
  function threadHTML(k) {
    const list = threadOf(k);
    if (!list.length && C.typing !== k) return "";
    return `<div class="cp-thread">${list.map((m, i) => msgHTML(m, i, k)).join("")}${C.typing === k ? '<div class="msg ai"><div class="thinking"><span class="dots" aria-hidden="true"><span></span><span></span><span></span></span>Loci is thinking</div></div>' : ""}</div>`;
  }
  const filedThisWeek = () => 23 + ACT.filter((a) => a.live && a.state === "filed").length;
  function homeBody() {
    const on = ROUTINES.filter((r) => r.on).length;
    const ideas = [
      S.noticed === "open" ? { a: "noticed", b: "File dezeen.com links as Precedents", em: "You did this by hand 7 times this month", small: "Do it" } : null,
      { a: "idea", v: "Every evening, sort what I haven't sorted", b: "Sort Unsorted every evening", em: "9 things are sitting in Unsorted", small: "Set up" },
      { a: "idea", v: "Keep me up to date on AI in architecture", b: "Follow a subject", em: "New things from sources you trust, sorted onto topics", small: "Set up" },
    ].filter(Boolean);
    return `<div class="cp-home"><h2 class="hello">Good morning, Layla.</h2>
      <div class="progress-card"><div class="rx-big" aria-hidden="true">${on}</div><div><b>${plural(on, "routine")} on</b><span>${filedThisWeek()} things filed for you this week</span></div></div>
      ${W.length ? `<button type="button" class="rx-waitline" data-act="tab" data-v="waiting"><span aria-hidden="true" class="dot s1"></span><span><b>${plural(W.length, "thing")} waiting for a quick look</b><em>Two filings to check, and the To read pile</em></span><span aria-hidden="true" class="rx-arrow">›</span></button>` : ""}
      <div class="cp-sec"><div class="sec-h"><span>Ideas for you</span></div><div class="rx-rows">${ideas.map((x) => `<button type="button" class="cp-row" data-act="${x.a}" data-v="${esc(x.v || "")}"><span aria-hidden="true" class="dot rx-dot-ghost"></span><span><b>${esc(x.b)}</b><em>${esc(x.em)}</em></span><small>${esc(x.small)}</small></button>`).join("")}</div></div></div>`;
  }
  function routineBody(r) {
    const lately = r.lately.length ? `<div class="cp-sec"><div class="sec-h"><span>Lately</span></div><div class="rx-rows">${r.lately.slice(0, 3).map((x) => `<div class="cp-row rx-late"><span aria-hidden="true" class="dot s2"></span><span><b>${esc(x.t)}</b><em>${esc(x.w)}</em></span><small>${esc(x.when)}</small></div>`).join("")}</div></div>` : `<div class="cp-sec"><div class="sec-h"><span>Lately</span></div><p class="rx-quiet">Nothing yet. It starts with the next thing that fits.</p></div>`;
    return `<div class="cp-home rx-routine"><div class="cp-card rx-what"><p class="cp-card-title">What it does</p><p class="rx-say">${sentence(r)}</p><p class="note">Tap an underlined word to change it, or tell Loci below.</p>
        ${r.type === "arrive" ? `<div class="acts">${btn(S.tryOpen === r.id ? "Hide" : "What would it do?", `data-act="try" data-r="${r.id}" aria-expanded="${S.tryOpen === r.id}"`, "quiet")}</div>${S.tryOpen === r.id ? tryHTML(r) : ""}` : ""}${S.builder ? builderNote(r) : ""}</div>
      ${lately}</div>`;
  }
  function panel() {
    const r = S.sel ? RR(S.sel) : null;
    const inThis = !!(r && S.ptab === "this");
    const peek = mobile() && !S.sheet;
    const fold = mobile() ? `<button aria-label="Fold Loci away" class="icb" title="Fold Loci away" type="button" data-act="fold">${ICON.fold}</button>` : "";
    let head;
    if (r) {
      const [dot] = stateOf(r);
      head = `<div class="cp-head"><div class="cp-toprow"><span class="cp-kicker">Routine · ${esc(GROUP[r.type])}</span><button aria-label="Close this routine" class="icb" title="Close this routine" type="button" data-act="desel">${ICON.close}</button>${fold}</div>
        <div class="cp-title"><span aria-hidden="true" class="dot ${dot}"></span><h2>${esc(r.name)}</h2></div>
        <div class="cp-meta"><button class="chip-btn" type="button" data-act="chip" data-r="${r.id}" data-f="onoff"><span aria-hidden="true" class="dot ${r.on ? "s2" : "s0"}"></span>${r.on ? "On" : "Paused"}<span aria-hidden="true" class="caret">▾</span></button>${r.type === "arrive" ? `<button class="chip-btn" type="button" data-act="chip" data-r="${r.id}" data-f="mode">${esc(modeLabel(r))}<span aria-hidden="true" class="caret">▾</span></button>` : ""}<span class="chip">${esc(countOf(r))}</span><button class="details-btn" type="button" data-act="more" data-r="${r.id}" aria-expanded="${S.more === r.id}">More <i aria-hidden="true">‹</i></button></div>
        ${S.more === r.id ? `<div class="rx-more">${r.type === "arrive" && arrivePos(r) > 1 ? btn("Move up", `data-act="up" data-r="${r.id}"`, "link") : ""}${btn("Delete this routine", `data-act="del" data-r="${r.id}"`, "link")}</div>` : ""}
        <div aria-label="Conversation" class="cp-tabs" role="tablist"><button aria-selected="${!inThis}" class="cp-tab" role="tab" type="button" data-act="ptab" data-v="all"><span class="cp-tab-name">All routines</span></button><button aria-selected="${inThis}" class="cp-tab" role="tab" type="button" data-act="ptab" data-v="this"><span class="cp-tab-name">This routine</span></button></div></div>`;
    } else {
      head = `<div class="cp-head"><div class="cp-toprow"><span class="cp-kicker">Studiolo · Routines</span>${fold}</div><div class="cp-title cp-peek-title"><h2>Your routines</h2></div></div>`;
    }
    const body = inThis ? routineBody(r) + threadHTML(r.id) : homeBody() + threadHTML("all");
    const prompts = inThis
      ? [r.type === "arrive" ? (r.mode === "own" ? "Ask me before filing" : "Stop asking, just file them") : null, "What did it do this week?", r.type === "arrive" ? "Why did it file the last one there?" : null, r.on ? "Pause it" : "Turn it back on", r.type === "arrive" && r.ifs.some((c) => c.v === "photo") && !r.then.understand.includes("describe") ? "Also describe them" : null].filter(Boolean)
      : ["What did my routines do this week?", "What's waiting for me?", "Why was something filed where it was?", "How do routines work?"];
    const comp = `<div class="cp-comp"><div class="prompts">${prompts.map((p) => `<button type="button" data-act="prompt" data-v="${esc(p)}">${esc(p)}</button>`).join("")}</div>
      <form class="box" data-form="chat">${inThis ? `<span class="scope">About ${esc(r.name)}<button aria-label="Ask about all routines instead" type="button" data-act="ptab" data-v="all">×</button></span>` : ""}<label class="visually-hidden" for="rx-text">Ask Loci</label><textarea id="rx-text" maxlength="4000" rows="2" placeholder="${inThis ? `Ask about ${esc(r.name)}, or say what to change…` : peek ? "Ask Loci about your routines…" : "Ask about your routines, or say what should happen…"}">${esc(C.input)}</textarea><div class="tools"><span class="grow"></span><button aria-label="Send" class="send" type="submit">${ICON.send}</button></div></form></div>`;
    return `${mobile() && S.sheet ? '<div class="rx-scrim" data-act="fold"></div>' : ""}<div class="cpwrap rx-cpwrap${mobile() ? " is-sheet" : ""}${S.sheet && mobile() ? " is-open" : ""}"${peek ? ' data-drawer="peek"' : ""}><section aria-label="Loci" class="cp" tabindex="-1">${peek ? "" : head + `<div class="cp-body gin" id="rx-body" role="tabpanel">${body}</div>`}${comp}</section></div>`;
  }

  /* ================================================================ the conversation: making routines */
  const TIME_RE = /\b(?:at )?(\d{1,2})(?::(\d{2}))? ?(am|pm)\b|\bat (\d{1,2})(?::(\d{2}))?\b/;
  function parseEvery(s, d) {
    let said = false;
    if (/every (morning|day)|each morning|daily/.test(s)) { d.every = "day"; d.time = "07:30"; said = true; }
    if (/every (evening|night)|each evening|nightly|tonight/.test(s)) { d.every = "day"; d.time = "21:00"; said = true; }
    const day = DAYLONG.findIndex((n) => new RegExp(`\\b${n.toLowerCase()}s?\\b`).test(s));
    if (day >= 0) { d.every = "w" + day; said = true; if (!d.time) d.time = /morning/.test(s) ? "08:00" : "17:00"; }
    if (/every month|monthly/.test(s)) { d.every = "month"; d.time = "09:00"; said = true; }
    const tm = s.match(TIME_RE);
    if (tm && d.every) {
      let h = Number(tm[1] || tm[4]); const m = Number(tm[2] || tm[5] || 0);
      if (tm[3] === "pm" && h < 12) h += 12;
      if (tm[3] === "am" && h === 12) h = 0;
      if (h < 24) d.time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    return said;
  }
  const topicIn = (s) => TOPICS.find((p) => s.includes(PLACES[p].name.toLowerCase()) || s.includes(p));
  function intent(s) {
    if (/\b(sort|tidy|organi[sz]e|clean up)\b/.test(s) && /(unsorted|haven't sorted|not sorted|everything|my stuff|my inbox)/.test(s)) return "tidy";
    if (/up to date|keep up|\bfollow\b|\bnews\b|what's new on|the latest/.test(s)) return "follow";
    if (/quiz|test me|\breview\b|ask me (questions|about)|what slipped/.test(s)) return "review";
    if (/after i (finish|watch)|when i finish/.test(s)) return "after";
    if (/\bwhen i\b|\b(send|share|email|forward)\b.*\b(photo|picture|link|pdf|voice|audio|reel|recipe|book)|every time i (send|save)/.test(s)) return "arrive";
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
    const U = [["describe", /describe|caption it/], ["transcribe", /write (it )?out|transcribe|what i said/], ["summary", /summar|three lines|3 lines/], ["links", /links? (in|inside)|caption links/], ["book", /find the book/], ["recipe", /just (keep )?the recipe|keep (just )?the recipe/]];
    d.then.understand = U.filter(([, re]) => re.test(s)).map(([k]) => k);
    if (d.then.understand.includes("summary")) d.then.understand.unshift("text");
    if (/question/.test(s)) d.then.learn.push("questions");
    if (d.then.understand.length || d.then.learn.length || d.then.status) said.extra = true;
    if (d.when === "whatsapp" && /tell me|reply|let me know/.test(s)) d.then.reply = "confirm";
    if (/just (file|do|put)|automatically|on its own|without asking|don't ask/.test(s)) { d.mode = "own"; said.mode = true; }
    if (/ask me first|check with me/.test(s)) { d.mode = "ask"; said.mode = true; }
    return { d, said };
  }
  const autoName = (d) => { const k = d.ifs.find((c) => c.t === "kind")?.v; return d.then.fileAs || `${k ? cap(KINDS_WORD(k)) : "Things"}${d.when !== "any" ? ` ${CH_PREP[d.when]} ${CH_WORD[d.when]}` : ""}`; };
  function offerFor(d) {
    const k = d.ifs.find((c) => c.t === "kind")?.v, is = d.ifs.find((c) => c.t === "is")?.v;
    if (is === "a book") return ["book", "Shall I find each book in a library catalogue and mark it To read?"];
    if (is === "a recipe") return ["recipe", "Shall I keep just the recipe, and leave the rest of the post?"];
    return ({ photo: ["describe", "Shall I describe each photo, so you can search for it later?"], "voice note": ["transcribe", "Shall I write out what you said, and keep any questions you ask?"], PDF: ["summary", "Shall I pull out the text and give you a three-line summary?"], reel: ["links", "Shall I save the links in the caption as well?"], link: ["status", "Shall I mark them To read?"] })[k] || null;
  }
  function ask() {
    const d = C.draft, q = C.q.shift();
    C.cur = q || null;
    if (!q) return preview();
    const A = {
      channel: () => lociSay("Where will you send these from?", { opts: optsOf([["WhatsApp", "set-channel", "whatsapp"], ["Email", "set-channel", "email"], ["Sharing from my phone", "set-channel", "share"], ["Anywhere", "set-channel", "any"]]) }),
      what: () => lociSay("Which kind of thing?", { opts: optsOf(ITEM_KINDS.map((k) => [cap(KINDS_WORD(k)), "set-kind", k])) }),
      where: () => lociSay("Where should they go?", { opts: optsOf([["On the topic each one is about", "set-on", "best"], ["In the prayer hall project", "set-on", "project"], ["On a topic I choose", "set-on", "pick"]]) }),
      pick: () => lociSay("Which topic?", { opts: optsOf(TOPICS.map((p) => [PLACES[p].name, "set-on", p])) }),
      extra: () => { const o = offerFor(d); if (!o) return ask(); lociSay(o[1], { opts: optsOf([["Yes", "set-extra", o[0]], ["No thanks", "set-extra", ""]]) }); },
      mode: () => lociSay("Should I ask you before filing each one, or just file it? Either way, you can undo anything. I'd start by asking; once I've been right a few times, I'll offer to stop.", { opts: optsOf([["Ask me first", "set-mode", "ask"], ["Just file them", "set-mode", "own"]]) }),
      tidyEvery: () => lociSay("When should I go through it?", { opts: optsOf([["Every evening", "set-every", "day|21:00"], ["Sunday evenings", "set-every", "w0|19:00"], ["Every morning", "set-every", "day|07:30"]]) }),
      tidyMode: () => lociSay("When I'm sure where something belongs, should I just file it?", { opts: optsOf([["Yes, file what you're sure of", "set-tidymode", "own"], ["No, ask me about everything", "set-tidymode", "ask"]]) }),
      followTopic: () => lociSay("Which topic should I follow?", { opts: optsOf(TOPICS.slice(0, 5).map((p) => [PLACES[p].name, "set-place", p])) }),
      sources: () => lociSay("Which sources should I read? These are the ones you save from most. Untick any you don't want.", { opts: SOURCES.map((x, i) => ({ label: x, a: "src", v: String(i), toggle: true })) }),
      followEvery: () => lociSay("How often?", { opts: optsOf([["Every morning", "set-every", "day|07:30"], ["Monday mornings", "set-every", "w1|08:00"]]) }),
      reviewPlace: () => lociSay("Which topic?", { opts: optsOf(TOPICS.slice(0, 5).map((p) => [PLACES[p].name, "set-place", p])) }),
      reviewCount: () => lociSay("How many questions?", { opts: optsOf([["3, about two minutes", "set-count", "3"], ["5, about four minutes", "set-count", "5"]]) }),
      reviewEvery: () => lociSay("When?", { opts: optsOf([["Friday evenings", "set-every", "w5|17:00"], ["Every morning", "set-every", "day|07:30"]]) }),
      delay: () => lociSay("When should the check come back?", { opts: optsOf([["The next day", "set-delay", "the next day"], ["Three days later", "set-delay", "three days later"], ["A week later", "set-delay", "a week later"]]) }),
    };
    A[q]();
  }
  const still = (d) => sentence(d, "snap").replace(/<button[^>]*>/g, "<u>").replace(/<\/button>/g, "</u>");
  // an old draft card in the thread becomes a still copy, so only one live draft is ever on screen
  function snapDrafts(done) {
    const d = C.draft;
    [C.all, ...Object.values(C.per)].forEach((list) => list.forEach((m) => { if (m.card === "draft") { m.card = "snap"; m.snap = d ? still(d) : ""; m.snapName = d?.name; m.done = !!done; } }));
  }
  function clearDraft() { C.draft = null; C.q = []; C.cur = null; C.previewed = false; }
  function queueArrive(said) { C.q = []; if (!said.channel) C.q.push("channel"); if (!said.what) C.q.push("what"); if (!said.where) C.q.push("where"); if (!said.extra) C.q.push("extra"); if (!said.mode) C.q.push("mode"); }
  function understood(d) {
    const kind = d.ifs.find((c) => c.t === "kind")?.v, is = d.ifs.find((c) => c.t === "is")?.v;
    const what = kind ? KINDS_WORD(kind) : is ? is.replace(/^an? /, "") + "s" : "things";
    const bits = [what, d.when !== "any" ? `${CH_PREP[d.when]} ${CH_WORD[d.when]}` : ""].filter(Boolean).join(" ");
    const n = C.q.filter((q) => q !== "extra" || offerFor(d)).length;
    return `Got it: ${bits}. ${n === 0 ? "Here's what I'd set up." : n === 1 ? "One quick question, then I'll show you what it would do." : "A few quick questions, then I'll show you what it would do."}`;
  }
  function begin(text) {
    const s = text.toLowerCase(), kind = intent(s);
    snapDrafts(); clearDraft();
    if (kind === "arrive") {
      const { d, said } = parseArrive(text);
      C.draft = d;
      const twin = ROUTINES.find((r) => r.type === "arrive" && r.when === d.when && d.ifs.length && d.ifs.every((c) => r.ifs.some((x) => x.t === c.t && x.v === c.v)));
      if (twin) { C.pendingSaid = said; lociSay(`You already have “${twin.name}”, which does most of this. Change that one instead?`, { opts: optsOf([[`Open “${twin.name}”`, "open", twin.id], ["Make a new one anyway", "anyway"]]) }); return; }
      queueArrive(said); lociSay(understood(d)); ask(); return;
    }
    const d = { id: "draft", type: kind === "after" ? "after" : "schedule", on: true, lately: [] };
    if (kind === "tidy") {
      Object.assign(d, { kind: "tidy", name: "Tidy Unsorted", every: null, time: null, mode: null });
      if (!parseEvery(s, d)) C.q.push("tidyEvery");
      C.q.push("tidyMode");
      lociSay("Got it: I'll go through what's in Unsorted and put each thing where it belongs.");
    }
    if (kind === "follow") {
      const tp = topicIn(s), m = text.match(/(?:on|about) (.+?)(?:[.,!?]|$)/i);
      Object.assign(d, { kind: "follow", place: tp || "you", label: !tp && m ? m[1].trim() : "", sources: SOURCES.slice(0, 4), every: null, time: null });
      d.name = `Follow: ${d.label ? cap(d.label) : PLACES[d.place].name}`;
      if (!tp && !m) C.q.push("followTopic");
      C.q.push("sources");
      if (!parseEvery(s, d)) C.q.push("followEvery");
      lociSay(d.label ? `“${cap(d.label)}” isn't a topic on your map yet, so I'll watch for it across your whole map and sort what comes in onto the right topics. If it keeps coming up, I'll suggest a sub-topic.` : "Got it: I'll bring you what's new and sort it onto your topics.");
    }
    if (kind === "review") {
      Object.assign(d, { kind: "review", name: "Review", place: topicIn(s) || null, count: /\b5\b|five/.test(s) ? 5 : /\b3\b|three/.test(s) ? 3 : null, every: null, time: null });
      if (!d.place) C.q.push("reviewPlace");
      if (!d.count) C.q.push("reviewCount");
      if (!parseEvery(s, d)) C.q.push("reviewEvery");
      lociSay("Got it: short questions on what you got wrong lately, so it sticks.");
    }
    if (kind === "after") {
      Object.assign(d, { kind: "lumen", name: "After a Lumen", delay: /next day|tomorrow/.test(s) ? "the next day" : /week/.test(s) ? "a week later" : /three|3/.test(s) ? "three days later" : null });
      if (!d.delay) C.q.push("delay");
      lociSay("Got it: after each Lumen, its check comes back later, when it's worth testing.");
    }
    C.draft = d; ask();
  }
  function preview() {
    const d = C.draft;
    if (!d.name || d.name === "Review") d.name = d.type === "arrive" ? autoName(d) : d.kind === "review" ? `${PLACES[d.place].name} review` : d.name;
    snapDrafts(); C.previewed = true;
    const lead = d.type === "arrive" ? "Here it is. It's on the left as a draft; nothing changes until you turn it on."
      : d.kind === "tidy" ? "Here it is. Last night it would have placed 4 of the 9 things in Unsorted, and asked you about 2."
      : d.kind === "follow" ? "Here it is. This morning it would have brought you 5 things, each on its topic." : "Here it is. It's on the left as a draft.";
    lociSay(lead, { card: "draft" });
  }
  function turnOn() {
    const d = C.draft; if (!d) return;
    const r = { ...JSON.parse(JSON.stringify(d)), id: "r" + ++rid, on: true };
    if (r.type === "arrive") { r.right = [0, 0]; r.filed = 0; r.lately = []; ROUTINES.unshift(r); }
    else { r.stat = "New"; r.lately = []; const k = ROUTINES.findIndex((x) => x.type === r.type); ROUTINES.splice(k < 0 ? ROUTINES.length : k, 0, r); }
    snapDrafts(true); clearDraft();
    S.tab = "all"; S.filter = "all"; S.q = ""; flash(r.id, 2400);
    const first = r.type === "arrive" ? ` It's first under “When I send something”, so it gets the first look.${r.mode === "ask" ? " I'll ask you about the first few so you can check me." : ""}` : r.type === "schedule" ? ` First run: ${fNext(nextRun(r))}.` : "";
    lociSay(`Done. “${r.name}” is on.${first}`, { opts: optsOf([["Open it", "open", r.id], ["Make another", "another"]]) });
  }

  /* ---------- changing a routine by saying it */
  function applyChange(r, text) {
    const s = text.toLowerCase(), done = [];
    if (/ask me first|ask me before|check with me/.test(s) && r.type === "arrive") { r.mode = "ask"; done.push("it asks you first"); }
    if (/just file|stop asking|don't ask|on its own|automatically/.test(s) && r.type === "arrive") { r.mode = "own"; done.push("it files on its own"); }
    if (/\bpause\b|turn (it )?off|stop it/.test(s)) { r.on = false; done.push("it's paused"); }
    if (/turn (it )?(back )?on|resume|unpause/.test(s)) { r.on = true; done.push("it's on"); }
    if (r.type === "arrive") {
      [["describe", /describe/], ["transcribe", /write (it )?out|transcribe/], ["summary", /summar|three lines/], ["links", /links/], ["book", /find the book/], ["recipe", /recipe/]].forEach(([k, re]) => {
        if (re.test(s) && /\b(also|and|add|plus|too)\b/.test(s) && !r.then.understand.includes(k)) { r.then.understand.push(k); done.push(`it will ${UND[k]}`); }
      });
      if (/question/.test(s) && /\b(also|add|turn)\b/.test(s) && !r.then.learn.includes("questions")) { r.then.learn.push("questions"); done.push("questions become @questions"); }
      if (/to read/.test(s) && r.then.status !== "To read") { r.then.status = "To read"; done.push("they're marked To read"); }
      if (/tell me|let me know|reply/.test(s) && r.when === "whatsapp" && r.then.reply !== "confirm") { r.then.reply = "confirm"; done.push("it tells you on WhatsApp"); }
      const tp = topicIn(s); if (tp && /\b(on|to|under|into)\b/.test(s)) { r.then.on = tp; done.push(`they go on ${PLACES[tp].name}`); }
      const ch = [["whatsapp", /whatsapp/], ["email", /e-?mail/], ["share", /from my phone|instagram/], ["any", /anywhere/]].find(([, re]) => re.test(s));
      if (ch && ch[0] !== r.when && /\b(only|instead|from now on|listen)\b/.test(s)) { r.when = ch[0]; done.push(`it listens ${CH_PREP[ch[0]]} ${CH_WORD[ch[0]]}`); }
      const site = s.match(/\b([a-z0-9-]+\.(?:com|org|net|io|edu))\b/);
      if (site) { const c = r.ifs.find((x) => x.t === "site"); if (c && !c.v.includes(site[1])) { c.v += `, ${site[1]}`; done.push(`it covers ${site[1]} too`); } }
    }
    if (r.type === "schedule" && parseEvery(s, r)) done.push(`it runs ${everyText(r).toLowerCase()}`);
    const nm = text.match(/(?:call it|rename it(?: to)?|name it) [“"']?([^”"']+)[”"']?/i);
    if (nm) { r.name = nm[1].trim().replace(/[.!]$/, ""); done.push(`it's called “${r.name}”`); }
    return done;
  }

  /* ---------- questions Loci answers */
  const looksLikeQuestion = (s, raw) => /^(what|why|how|which|where|who|is|are|does|did|has|have|show me|tell me)\b/.test(s) || raw.trim().endsWith("?");
  function answer(s, r) {
    if (/what did|what has|what's it done|this week|lately|activity|so far/.test(s)) {
      if (r) {
        lociSay(r.lately.length ? `Lately, “${r.name}”:` : `“${r.name}” hasn't done anything yet. It starts with the next thing that fits.`, r.lately.length ? { rows: r.lately.slice(0, 3).map((x) => ({ a: "noop", b: x.t, em: x.w, small: x.when })) } : {});
        return true;
      }
      const top = ROUTINES.filter((x) => x.type === "arrive" && x.filed).sort((a, b) => b.filed - a.filed).slice(0, 3);
      lociSay(`This week your routines filed ${filedThisWeek()} things for you${W.length ? `, and ${plural(W.length, "thing is", "things are")} waiting for a quick look` : ""}. The busiest:`, { rows: top.map((x) => ({ a: "sel", r: x.id, b: x.name, em: summary(x), small: `${x.filed} this month` })), opts: optsOf([["Open Activity", "goto", "activity"], ...(W.length ? [["Open Waiting", "goto", "waiting"]] : [])]) });
      return true;
    }
    if (/waiting|need(s)? me|to check|for me to/.test(s)) {
      if (!W.length) { lociSay("Nothing is waiting for you. Your routines will ask when they're not sure."); return true; }
      lociSay(`${plural(W.length, "thing is", "things are")} waiting for you:`, { rows: W.map((w) => ({ a: "goto", v: "waiting", b: w.kind === "pile" ? "The To read pile" : w.kind === "nomatch" ? w.item.title : w.newTitle || w.title, em: w.kind === "nomatch" ? "No routine covers it yet" : w.kind === "pile" ? "3 old things to keep or let go" : `${RR(w.rid)?.name || "A routine"} asks where it goes`, small: w.when || "Just now", dot: "s1" })), opts: optsOf([["Open Waiting", "goto", "waiting"]]) });
      return true;
    }
    if (/\bwhy\b/.test(s)) {
      const a = ACT.find((x) => x.state === "filed" && (!r || x.rid === r.id)), rr = a && RR(a.rid);
      if (!rr) { lociSay(r ? `“${r.name}” hasn't filed anything yet, so there's nothing to explain.` : "Nothing has been filed yet."); return true; }
      const conds = rr.type === "arrive" ? [rr.when !== "any" ? `it came from ${CH_WORD[rr.when]}` : "", ...rr.ifs.map((c) => ({ kind: `it's ${KIND_WORD[c.v]}`, tag: `it has ${c.v}`, site: `it's from ${c.v.split(",")[0]}`, is: `I read that it's ${c.v}`, about: `it's about ${PLACES[c.v]?.name}`, words: `it mentions ${c.v}` })[c.t])].filter(Boolean) : [];
      const pos = arrivePos(rr);
      lociSay(`The latest: “${rr.name}” ${a.what}, because ${andJoin(conds)}.${pos > 1 ? ` It's number ${pos} under “When I send something”, and none of the ${plural(pos - 1, "routine")} above it fit.` : " It's first under “When I send something”, so it gets the first look."}\nIf it's wrong, undo it in Activity and I'll count it as a miss.`, { opts: optsOf([["Open Activity", "goto", "activity"], ...(r ? [] : [[`Open “${rr.name}”`, "open", rr.id]])]) });
      return true;
    }
    if (!r && /how (do|does|can|would)|how .* work|what (is|are) (a )?routines?/.test(s)) {
      lociSay("A routine is something I do for you, the way you asked. There are three kinds:\nWhen you send something (from WhatsApp, email, your phone or the browser), I file it where you said.\nOn a schedule, I tidy, bring things in, or quiz you.\nAfter you do something, like finishing a Lumen, I follow up.\nTo make one, press New routine or just tell me what should happen. To change one, open its card and tap an underlined word, or tell me.", { opts: optsOf([["When I send a voice note on WhatsApp, write it out", "say"], ["Every evening, sort what I haven't sorted", "say"]]) });
      return true;
    }
    if (/cost|how much|allowance/.test(s)) { lociSay("Your routines use about 4% of your monthly allowance. Plain rules (where something came from, what kind it is, a tag, a site) cost nothing. A little is used only when I read an item, to find a book or describe a photo, and a run with nothing new costs nothing."); return true; }
    if (r && /what does|what is it|explain/.test(s)) { lociSay(`“${r.name}”: ${sentence(r).replace(/<[^>]+>/g, "")}`); return true; }
    return false;
  }
  function onSay(text) {
    const low = text.toLowerCase().trim().replace(/[.!?]$/, "");
    const list = thread();
    const pending = [...list].reverse().find((x) => x.from === "ai" && x.opts && !x.answered);
    const lastMe = list.map((x) => x.from).lastIndexOf("me");
    const hit = pending && list.indexOf(pending) > lastMe && pending.opts.find((o) => !o.toggle && o.a !== "say" && (o.label.toLowerCase() === low || o.label.toLowerCase().startsWith(low) || (low.length > 3 && o.label.toLowerCase().includes(low))));
    if (hit) { onOpt(pending, hit, text); return; }
    meSay(text);
    think(() => {
      const s = low, r = tkey() !== "all" ? RR(tkey()) : null;
      if (C.pendingDelete) { const x = RR(C.pendingDelete); C.pendingDelete = null; if (/\b(yes|delete)\b/.test(s)) deleteRoutine(x); else lociSay("Kept it."); return; }
      if (/^(cancel|never mind|forget it|stop)$/.test(s)) { snapDrafts(); clearDraft(); lociSay("Cancelled. Nothing changed."); return; }
      if (r) {
        if (looksLikeQuestion(s, text) && answer(s, r)) return;
        if (intent(s) && !applyChange(JSON.parse(JSON.stringify(r)), text).length) {
          lociSay("That sounds like a new routine. I've started it under All routines.");
          S.ptab = "all"; C.force = "all"; meSay(text); begin(text); return;
        }
        if (/\bdelete\b|remove (it|this)/.test(s)) { C.pendingDelete = r.id; lociSay(`Delete “${r.name}”? What it already filed stays where it is.`, { opts: optsOf([["Delete it", "del-yes", r.id], ["Keep it", "del-no"]]) }); return; }
        const before = JSON.stringify(r), done = applyChange(r, text);
        if (done.length) { lociSay(`Done: ${andJoin(done)}.`, { opts: optsOf([["Undo that", "undo", r.id]]), undo: before }); flash(r.id, 1600); return; }
        if (answer(s, r)) return;
        lociSay(`I didn't catch a change to “${r.name}”. You can say things like “ask me first”, “also describe them” or “pause it”, ask what it did this week, or tap an underlined word above.`);
        return;
      }
      const midway = C.draft && !C.previewed && C.cur;
      if (C.draft && C.previewed && !intent(s) && !looksLikeQuestion(s, text)) { const done = applyChange(C.draft, text); if (done.length) { lociSay(`Changed: ${andJoin(done)}. The draft above shows it.`); return; } }
      if (intent(s)) { begin(text); return; }
      if (answer(s, null)) { if (midway) { C.q.unshift(C.cur); lociSay("Back to your new routine:"); ask(); } return; }
      if (midway) { lociSay("Tap one of the answers above, or say “cancel”."); C.q.unshift(C.cur); ask(); return; }
      lociSay("I can make a routine, change one, or tell you what they've done. Try one of these:", { opts: optsOf([["When I send a voice note on WhatsApp, write it out", "say"], ["What did my routines do this week?", "say"]]) });
    });
  }
  function onOpt(m, o, typed) {
    const d = C.draft, v = o.v;
    m.answered = o.label;
    if (o.a === "say") { onSay(o.label); return; }
    meSay(typed || o.label);
    think(() => {
      switch (o.a) {
        case "set-channel": d.when = v; break;
        case "set-kind": d.ifs.unshift({ t: "kind", v }); break;
        case "set-on": if (v === "pick") { C.q.unshift("pick"); break; } if (v === "project") { d.then.addTo = "project"; d.then.on = ""; } else d.then.on = v; break;
        case "set-extra":
          if (v === "status") d.then.status = "To read";
          else if (v === "summary") d.then.understand.push("text", "summary");
          else if (v === "transcribe") { d.then.understand.push("transcribe"); d.then.learn.push("questions"); }
          else if (v === "book") { d.then.understand.push("book"); d.then.status = "To read"; }
          else if (v) d.then.understand.push(v);
          break;
        case "set-mode": case "set-tidymode": d.mode = v; break;
        case "set-every": { const [e, t] = v.split("|"); d.every = e; d.time = t; break; }
        case "set-place": d.place = v; if (d.kind === "follow") d.name = `Follow: ${PLACES[v].name}`; break;
        case "set-count": d.count = Number(v); break;
        case "set-delay": d.delay = v; break;
        case "anyway": queueArrive(C.pendingSaid || {}); lociSay(understood(C.draft)); ask(); return;
        case "open": { const r = RR(v); if (!r) return; select(v); C.force = v; lociSay(`Here's “${r.name}”. Tap an underlined word to change it, or tell me what to change.`); return; }
        case "undo": { const r = RR(v); if (m.undo && r) Object.assign(r, JSON.parse(m.undo)); lociSay("Undone."); return; }
        case "del-yes": C.pendingDelete = null; deleteRoutine(RR(v)); return;
        case "del-no": C.pendingDelete = null; lociSay("Kept it."); return;
        case "another": lociSay("What should happen? Tell me, or pick one:", { opts: optsOf([["When I share a reel, save the links in its caption", "say"], ["Every Friday, quiz me on what slipped", "say"], ["After I finish a Lumen, check me a week later", "say"]]) }); return;
        case "goto": S.tab = v; if (mobile()) S.sheet = false; lociSay(v === "waiting" ? "It's open on the left: Waiting." : "It's open on the left: Activity."); return;
        case "noticed-undo": { const p = RR("r5"); if (p) p.ifs.find((x) => x.t === "site").v = "archdaily.com"; S.noticed = "open"; lociSay("Undone. “Precedents” covers archdaily.com only, as before."); return; }
        case "restore": { const [k, rr] = restoreStack.pop() || []; if (rr) { ROUTINES.splice(k, 0, rr); lociSay(`“${rr.name}” is back.`); flash(rr.id, 1600); } return; }
      }
      ask();
    }, 450);
  }
  const restoreStack = [];
  function deleteRoutine(r) {
    const k = ROUTINES.indexOf(r); if (k < 0) return;
    ROUTINES.splice(k, 1); restoreStack.push([k, r]);
    if (S.sel === r.id) { S.sel = null; S.ptab = "all"; S.more = null; }
    C.force = "all";
    lociSay(`Deleted “${r.name}”. What it filed stays where it is.`, { opts: optsOf([["Bring it back", "restore"]]) });
  }
  function select(id) { S.sel = id; S.ptab = "this"; S.more = null; S.tryOpen = null; if (mobile()) S.sheet = true; }
  function flash(id, ms) { S.flash = id; setTimeout(() => { if (S.flash === id) { S.flash = null; render(); } }, ms); }

  /* ================================================================ tap a word to change it */
  const POP_TITLE = { when: "Sent from", kind: "Which kind of thing", tag: "The tag", site: "From the site", words: "Mentioning", is: "Loci reads that it's", about: "About", fileAs: "File it as", on: "On", status: "Reading status", addTo: "Also add to", mode: "Before it files", onoff: "This routine is", every: "When", place: "Which topic", count: "How many", delay: "When it comes back", sources: "Sources", tidymode: "When Loci is sure" };
  function popOpts(r, f) {
    const t = r.then || {};
    const O = {
      when: CH_OPTS, kind: ITEM_KINDS.map((k) => [k, cap(KIND_WORD[k])]), is: IS_OPTS.map((x) => [x, cap(x)]), about: TOPICS.map((p) => [p, PLACES[p].name]),
      fileAs: [["", "Keep the kind it came as"], ...FILE_AS.map((x) => [x, x])], on: [["best", "The topic it's about (Loci works it out)"], ...TOPICS.map((p) => [p, PLACES[p].name]), ["", "No topic"]],
      status: [["To read", "To read"], ["Reading", "Reading"], ["", "Leave it as it is"]], addTo: [["project", "The prayer hall project"], ["", "Nothing else"]],
      mode: [["ask", "Ask me first"], ["own", "File on its own"]], onoff: [["1", "On"], ["0", "Paused"]], tidymode: [["own", "File what it's sure of, ask about the rest"], ["ask", "Ask me about each thing"]],
      every: [["day", "Every day"], ["weekdays", "Weekdays"], ...[1, 2, 3, 4, 5, 6, 0].map((d) => ["w" + d, `Every ${DAYLONG[d]}`]), ["month", "Every month"]],
      place: [["you", "My whole map"], ...TOPICS.slice(0, 5).map((p) => [p, PLACES[p].name])], count: [["3", "3 questions, about two minutes"], ["5", "5 questions, about four minutes"]],
      delay: [["the next day", "The next day"], ["three days later", "Three days later"], ["a week later", "A week later"]],
    };
    const cur = { when: r.when, kind: r.ifs?.find((c) => c.t === "kind")?.v, is: r.ifs?.find((c) => c.t === "is")?.v, about: r.ifs?.find((c) => c.t === "about")?.v, fileAs: t.fileAs, on: t.on, status: t.status, addTo: t.addTo, mode: r.mode, onoff: r.on ? "1" : "0", tidymode: r.mode, every: r.every, place: r.place, count: String(r.count), delay: r.delay }[f];
    return [O[f], cur];
  }
  const popTarget = () => (S.pop.r === "draft" ? C.draft : RR(S.pop.r));
  function popHTML() {
    const r = popTarget(); if (!r) return "";
    const f = S.pop.f;
    let body;
    if (["tag", "site", "words"].includes(f)) {
      const c = r.ifs.find((x) => x.t === f);
      body = `<input class="sm-input" id="pop-text" value="${esc(c?.v || "")}" aria-label="${POP_TITLE[f]}"><div class="rx-popacts">${btn("Done", 'data-act="pop-text"')}${btn("Remove this condition", 'data-act="pop-remove"', "link")}</div>`;
    } else if (f === "sources") {
      body = SOURCES.map((x) => `<button type="button" class="rx-opt" data-act="pop-src" data-v="${esc(x)}" aria-pressed="${r.sources.includes(x)}">${esc(x)}</button>`).join("");
    } else {
      const [opts, cur] = popOpts(r, f);
      body = opts.map(([v, l]) => `<button type="button" class="rx-opt" data-act="pop-set" data-v="${esc(v)}" aria-pressed="${String(v) === String(cur ?? "")}">${esc(l)}</button>`).join("");
      if (f === "every" && r.every !== "month") body += `<label class="rx-poptime"><span>At</span><input class="sm-input" type="time" id="pop-time" value="${esc(r.time)}"></label>`;
    }
    return `<div class="rx-pop" style="left:${S.pop.x}px;top:${S.pop.y}px" role="dialog" aria-label="${POP_TITLE[f]}"><p class="rx-popk">${POP_TITLE[f]}</p>${body}</div>`;
  }
  function setField(r, f, v) {
    const cond = (t) => { let c = r.ifs.find((x) => x.t === t); if (!c) { c = { t, v }; r.ifs.push(c); } c.v = v; };
    if (["kind", "is", "about", "tag", "site", "words"].includes(f)) cond(f);
    else if (["fileAs", "on", "status", "addTo"].includes(f)) { r.then[f] = v; if (f === "addTo" && !v && !r.then.on) r.then.on = "best"; }
    else if (f === "when") { r.when = v; if (v !== "whatsapp") r.then.reply = ""; }
    else if (f === "mode" || f === "tidymode") r.mode = v;
    else if (f === "onoff") r.on = v === "1";
    else if (f === "every") { r.every = v; if (v === "month") r.time = "09:00"; else if (!r.time) r.time = "08:00"; }
    else if (f === "count") r.count = Number(v);
    else if (f === "place") { r.place = v; r.label = ""; if (r.kind === "follow") r.name = `Follow: ${PLACES[v].name}`; }
    else r[f] = v;
  }
  function changed(r, before, f) {
    if (r.id === "draft") return;
    flash(r.id, 1400);
    toast(f === "onoff" ? `“${r.name}” is ${r.on ? "on" : "paused"}.` : `Changed “${r.name}”.`, () => Object.assign(r, JSON.parse(before)));
  }

  /* ================================================================ arrivals (prototype: Send something) */
  function send(id) {
    const m = SEND.find((x) => x.id === id);
    S.sent.add(id); S.sendOpen = false;
    toast(`Arriving ${CH_PREP[m.ch]} ${CH_WORD[m.ch]}: ${m.title}…`); render();
    setTimeout(() => {
      const dup = ROUTINES.find((r) => r.kind === "dup" && r.on);
      if (m.dup && dup) {
        dup.lately.unshift({ t: m.title, w: "already saved 19 Oct · nothing added", when: "Just now" });
        ACT.unshift({ day: "Today", t: "08:12", rid: dup.id, what: `caught “${m.title}”: you already have it, so nothing was added`, state: "done", live: true });
        toast(`You already have “${m.title}” (saved 19 Oct). Nothing added.`); render(); return;
      }
      const r = firstFit(m);
      if (!r) { W.unshift({ id: "w" + ++wid, kind: "nomatch", item: m }); toast(`No routine covers “${m.title}” yet. It's waiting for you.`); render(); return; }
      if (r.mode === "own") {
        r.filed++; r.lately.unshift({ t: m.newTitle || m.title, w: whereFor(r, m), when: "Just now" });
        const a = { day: "Today", t: "08:12", rid: r.id, what: `filed “${m.newTitle || m.title}” ${whereFor(r, m)}`, state: "filed", live: true, undo: true };
        ACT.unshift(a); flash(r.id, 1800);
        toast(`“${r.name}” filed “${m.newTitle || m.title}” ${whereFor(r, m)}.`, () => { r.lately.shift(); r.filed--; a.state = "undone"; a.undo = false; });
      } else {
        W.unshift({ id: "w" + ++wid, kind: "single", rid: r.id, title: m.title, newTitle: m.newTitle, found: m.found || "", sug: m.about || r.then.on || "climate", fileAs: r.then.fileAs, status: r.then.status, when: "Just now", from: CH_SHORT[m.ch] });
        ACT.unshift({ day: "Today", t: "08:12", rid: r.id, what: `suggests a place for “${m.newTitle || m.title}”`, state: "waiting", live: true });
        toast(`“${r.name}” suggests a place for “${m.newTitle || m.title}”. It's waiting for you.`);
      }
      render();
    }, 800);
  }

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
    const filed = 6 + ACT.filter((a) => a.live && a.state === "filed").length;
    $(".td-top", root)?.insertAdjacentHTML("afterend", `<section class="rx-today" aria-labelledby="rx-today-h"><div class="td-h is-plain"><h2 id="rx-today-h">From your routines</h2><span><a href="#routines" data-act="go-routines">All routines</a></span></div>
      <button type="button" class="rx-todaycard" data-act="today-look"><span class="kicker">Since yesterday evening</span><b>Your routines filed ${filed} things for you.${W.length ? ` ${plural(W.length, "thing is", "things are")} waiting for a quick look.` : ""}</b><em>${W.length ? "Look now" : "See your routines"}</em></button></section>`);
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
    const scroll = window.scrollY, active = document.activeElement?.id, canvasScroll = $(".rx-canvas", root)?.scrollTop || 0, stageScroll = $(".main-stage", root)?.scrollTop || 0;
    if (S.view === "today") todayView();
    else {
      shell("library");
      $$(`.navigation-rail .navigation-link[href="/library"], .tab-bar .tab-bar-link[href="/library"]`, root).forEach((a) => a.setAttribute("aria-current", "page"));
      $("main", root).innerHTML = `${header()}<div class="rx-split"><div class="rx-canvas">${S.tab === "waiting" ? waitingTab() : S.tab === "activity" ? activityTab() : allTab()}</div>${panel()}</div>`;
      const c = $(".rx-canvas", root); if (c) c.scrollTop = canvasScroll;
      const st = $(".main-stage", root); if (st) st.scrollTop = stageScroll;
      const b = $("#rx-body", root); if (b && (threadOf(tkey()).length || C.typing)) b.scrollTop = b.scrollHeight;
    }
    if (S.pop) root.insertAdjacentHTML("beforeend", popHTML());
    root.insertAdjacentHTML("beforeend", `<div class="sm-proto rx-proto" role="group" aria-label="Prototype controls"><span>Prototype</span>${[["routines", "Routines"], ["today", "Today"]].map(([k, l]) => `<button type="button" data-act="view" data-v="${k}" aria-pressed="${S.view === k}">${l}</button>`).join("")}<i class="sm-proto-sep" aria-hidden="true"></i><button type="button" data-act="send-open" aria-expanded="${S.sendOpen}">Send something…</button><button type="button" data-act="builder" aria-pressed="${S.builder}">Builder</button></div>`);
    if (S.sendOpen) root.insertAdjacentHTML("beforeend", `<div class="rx-sendpop" role="dialog" aria-label="Send something"><p class="rx-popk">Send something to Studiolo (simulated)</p>${SEND.map((m) => `<button type="button" class="rx-opt rx-plain" data-act="send" data-v="${m.id}"${S.sent.has(m.id) ? " disabled" : ""}>${esc(m.label)}</button>`).join("")}<p class="rx-sendnote">See what your routines do with it: filed on its own, waiting for you, or not covered yet.</p></div>`);
    if (toastMsg) root.insertAdjacentHTML("beforeend", `<div class="sm-toast rx-toast" role="status"><span>${esc(toastMsg.t)}</span>${toastMsg.undo ? '<button type="button" data-act="toast-undo">Undo</button>' : ""}</div>`);
    window.scrollTo(0, scroll);
    if (active) { const el = document.getElementById(active); if (el) { el.focus({ preventScroll: true }); if (el.tagName === "TEXTAREA" || el.type === "search") try { el.setSelectionRange(el.value.length, el.value.length); } catch { /* not a text field */ } } }
  }
  function go(view) { S.view = view; S.pop = null; S.sendOpen = false; try { history.replaceState(null, "", "#" + view); } catch { /* sandboxed */ } window.scrollTo(0, 0); }

  /* ================================================================ events */
  root.addEventListener("submit", (ev) => {
    if (!ev.target.matches('[data-form="chat"]')) return;
    ev.preventDefault();
    const t = ($("#rx-text", root)?.value || "").trim(); if (!t || C.typing) return;
    C.input = ""; if (mobile()) S.sheet = true;
    onSay(t);
  });
  root.addEventListener("keydown", (ev) => {
    if (ev.target.id === "rx-text" && ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); ev.target.closest("form").requestSubmit(); }
    if (ev.key === "Escape" && (S.pop || S.sendOpen)) { S.pop = null; S.sendOpen = false; render(); }
  });
  root.addEventListener("input", (ev) => {
    if (ev.target.id === "rx-text") C.input = ev.target.value;
    if (ev.target.id === "rx-q") { S.q = ev.target.value; render(); }
  });
  root.addEventListener("focusin", (ev) => { if (ev.target.id === "rx-text" && mobile() && !S.sheet) { S.sheet = true; render(); } });
  root.addEventListener("change", (ev) => {
    if (ev.target.id === "pop-time" && S.pop) { const r = popTarget(), before = JSON.stringify(r); r.time = ev.target.value || r.time; changed(r, before); render(); }
  });
  root.addEventListener("click", (ev) => {
    const t = ev.target.closest("[data-act], a[href], .theme-toggle, .rail-toggle");
    if (S.pop && !ev.target.closest(".rx-pop") && !(t && t.dataset.act === "chip")) { S.pop = null; if (!t) { render(); return; } }
    if (S.sendOpen && !ev.target.closest(".rx-sendpop") && !(t && t.dataset.act === "send-open")) { S.sendOpen = false; if (!t) { render(); return; } }
    if (!t || !root.contains(t)) return;
    if (t.matches(".theme-toggle")) { const html = document.documentElement, dark = html.dataset.theme === "dark" || (!html.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches); html.dataset.theme = dark ? "light" : "dark"; render(); return; }
    if (t.matches(".rail-toggle")) { const sh = $(".app-shell", root); if (sh) sh.dataset.rail = sh.dataset.rail === "open" ? "closed" : "open"; return; }
    if (t.matches("a[href]") && !t.dataset.act) {
      ev.preventDefault();
      const h = t.getAttribute("href");
      if (h === "/today") { go("today"); render(); } else if (h === "/library") { go("routines"); render(); } else toast("Only Routines and Today are in this prototype.");
      return;
    }
    const a = t.dataset.act, r = t.dataset.r ? RR(t.dataset.r) : null;
    if (t.tagName === "A") ev.preventDefault();
    switch (a) {
      case "tab": S.tab = t.dataset.v; if (mobile()) S.sheet = false; $(".main-stage", root)?.scrollTo(0, 0); window.scrollTo(0, 0); break;
      case "filter": S.filter = t.dataset.v; break;
      case "q-clear": S.q = ""; S.filter = "all"; break;
      case "sel": if (!r) return; S.tab = "all"; select(r.id); break;
      case "show-draft": S.sel = null; S.ptab = "all"; if (mobile()) S.sheet = true; render(); $("#rx-draft", root)?.scrollIntoView({ block: "center" }); return;
      case "desel": S.sel = null; S.ptab = "all"; S.more = null; break;
      case "ptab": S.ptab = t.dataset.v; break;
      case "fold": S.sheet = false; break;
      case "more": S.more = S.more === r.id ? null : r.id; break;
      case "new": {
        S.sel = null; S.ptab = "all"; if (mobile()) S.sheet = true;
        const lastMsg = C.all[C.all.length - 1];
        if (!lastMsg || lastMsg.a !== "new") {
          C.force = "all";
          lociSay("What should happen, and when? Say it the way you'd tell an assistant, or start from one of these.", { a: "new", opts: optsOf([["When I email myself a PDF, sum it up in three lines and put it on its topic", "say"], ["Every evening, sort what I haven't sorted", "say"], ["Keep me up to date on AI in architecture", "say"]]) });
          C.force = null;
        }
        render(); $("#rx-text", root)?.focus(); return;
      }
      case "idea": S.sel = null; S.ptab = "all"; if (mobile()) S.sheet = true; onSay(t.dataset.v); return;
      case "noticed": {
        S.sel = null; S.ptab = "all";
        const p = RR("r5"); if (!p) return;
        p.ifs.find((x) => x.t === "site").v += ", dezeen.com"; S.noticed = "done"; flash(p.id, 2000);
        C.force = "all"; meSay("File dezeen.com links as Precedents");
        lociSay("Done. “Precedents” now files links from dezeen.com too: as Precedents on the topic each one is about, To read. Of your last 20 things, 3 would have gone there.", { opts: optsOf([["Undo that", "noticed-undo"], ["Open “Precedents”", "open", p.id]]) });
        C.force = null; break;
      }
      case "prompt": if (mobile()) S.sheet = true; onSay(t.dataset.v); return;
      case "opt": {
        if (C.typing) return;
        const m = threadOf(t.dataset.k)[Number(t.dataset.m)], o = m.opts[Number(t.dataset.o)];
        if (o.toggle) { C.srcOff = C.srcOff || new Set(); if (C.srcOff.has(o.v)) C.srcOff.delete(o.v); else C.srcOff.add(o.v); break; }
        const prev = C.force; C.force = t.dataset.k; onOpt(m, o); C.force = prev; return;
      }
      case "src-done": {
        const m = threadOf(t.dataset.k)[Number(t.dataset.m)], off = C.srcOff || new Set();
        C.draft.sources = SOURCES.filter((_, i) => !off.has(String(i))); if (!C.draft.sources.length) C.draft.sources = [SOURCES[0]];
        m.answered = "Use these"; C.srcOff = null;
        C.force = t.dataset.k; meSay(`Use these ${C.draft.sources.length}`); think(() => ask(), 400); C.force = null; return;
      }
      case "turn-on": if (C.typing || !C.draft) return; C.force = "all"; meSay("Turn it on"); think(() => turnOn(), 400); C.force = null; return;
      case "discard": snapDrafts(); clearDraft(); C.force = "all"; lociSay("Discarded. Nothing changed."); C.force = null; break;
      case "try": S.tryOpen = S.tryOpen === t.dataset.r ? null : t.dataset.r; break;
      case "up": {
        const k = ROUTINES.indexOf(r);
        if (k > 0 && ROUTINES[k - 1].type === "arrive") { [ROUTINES[k - 1], ROUTINES[k]] = [ROUTINES[k], ROUTINES[k - 1]]; toast(`“${r.name}” moved up. It's now checked before “${ROUTINES[k].name}”.`); flash(r.id, 1400); }
        break;
      }
      case "del": { const k = ROUTINES.indexOf(r); ROUTINES.splice(k, 1); S.sel = null; S.ptab = "all"; S.more = null; toast(`Deleted “${r.name}”. What it filed stays where it is.`, () => ROUTINES.splice(k, 0, r)); break; }
      case "chip": {
        if (t.dataset.r === "snap") return;
        const rect = t.getBoundingClientRect(), wv = window.innerWidth, hv = window.innerHeight;
        const x = Math.max(12, Math.min(rect.left, wv - 292)), below = rect.bottom + 6;
        const y = below + 300 > hv && rect.top > 320 ? Math.max(12, rect.top - 306) : Math.min(below, hv - 120);
        S.pop = S.pop && S.pop.r === t.dataset.r && S.pop.f === t.dataset.f ? null : { r: t.dataset.r, f: t.dataset.f, x, y };
        break;
      }
      case "pop-set": case "pop-text": case "pop-remove": case "pop-src": {
        const P = S.pop, x = popTarget(), before = JSON.stringify(x);
        if (a === "pop-set") { setField(x, P.f, t.dataset.v); S.pop = null; }
        if (a === "pop-text") { const v = ($("#pop-text", root)?.value || "").trim(); if (v) setField(x, P.f, P.f === "tag" && !v.startsWith("#") ? "#" + v : v); S.pop = null; }
        if (a === "pop-remove") { x.ifs = x.ifs.filter((c) => c.t !== P.f); S.pop = null; }
        if (a === "pop-src") { const v = t.dataset.v, k = x.sources.indexOf(v); if (k >= 0) { if (x.sources.length > 1) x.sources.splice(k, 1); } else x.sources.push(v); }
        changed(x, before, P.f); break;
      }
      case "w-file": case "w-no": {
        const k = W.findIndex((x) => x.id === t.dataset.w), w = W[k], sel = $(`#ws-${w.id}`, root)?.value;
        W.splice(k, 1);
        if (w.kind === "single") {
          const rr = RR(w.rid); rr.right[1]++;
          if (a === "w-file") {
            const same = !sel || sel === w.sug; if (same) rr.right[0]++;
            rr.lately.unshift({ t: w.newTitle || w.title, w: `${whereFor(rr, { about: sel || w.sug })} · you checked it`, when: "Just now" });
            toast(`Filed “${w.newTitle || w.title}”${same ? "." : " where you chose. The routine learns from the change."}`, () => { W.splice(k, 0, w); rr.lately.shift(); rr.right[1]--; if (same) rr.right[0]--; });
          } else toast(`Left in Unsorted. “${rr.name}” counts it as a miss.`, () => { W.splice(k, 0, w); rr.right[1]--; });
        } else toast(a === "w-file" ? `Filed “${w.item.title}”${w.item.about ? "" : ` on a new sub-topic, ${w.item.newTopic}`}.` : "Left in Unsorted. Tonight's tidy will look again.", () => W.splice(k, 0, w));
        break;
      }
      case "w-make": {
        const w = W.find((x) => x.id === t.dataset.w), it = w.item;
        S.sel = null; S.ptab = "all"; if (mobile()) S.sheet = true;
        snapDrafts(); clearDraft();
        C.draft = { id: "draft", type: "arrive", name: "", on: true, when: it.ch, ifs: [{ t: "kind", v: it.kind }, ...(it.site ? [{ t: "site", v: it.site }] : [])], then: thenOf({}), mode: "ask", right: [0, 0], filed: 0, lately: [] };
        C.q = ["where", "extra", "mode"];
        C.force = "all"; meSay(`Make a routine for things like “${it.title}”`);
        think(() => { lociSay(`Things like this: ${KINDS_WORD(it.kind)}${it.site ? ` from ${it.site}` : ""}, sent ${CH_PREP[it.ch]} ${CH_WORD[it.ch]}.`); ask(); });
        C.force = null; return;
      }
      case "p-act": {
        const w = W.find((x) => x.id === t.dataset.w), x = w.items[Number(t.dataset.i)];
        x.st = t.dataset.v;
        if (w.items.every((y) => y.st)) { W.splice(W.indexOf(w), 1); toast("The To read pile is done until next month."); }
        break;
      }
      case "act-undo": { const x = ACT[Number(t.dataset.i)], rr = RR(x.rid); x.state = "undone"; x.undo = false; if (rr) { rr.filed = Math.max(0, rr.filed - 1); rr.lately.shift(); } toast("Undone. It's back in Unsorted, and the routine counts it as a miss."); break; }
      case "goto": S.tab = t.dataset.v; if (mobile()) S.sheet = false; break;
      case "today-look": go("routines"); S.tab = W.length ? "waiting" : "all"; break;
      case "go-routines": go("routines"); S.tab = "all"; break;
      case "view": go(t.dataset.v); break;
      case "send-open": S.sendOpen = !S.sendOpen; break;
      case "send": send(t.dataset.v); return;
      case "builder": S.builder = !S.builder; document.documentElement.toggleAttribute("data-builder", S.builder); break;
      case "toast-undo": if (undoFn) undoFn(); undoFn = null; toastMsg = null; break;
      default: return;
    }
    render();
  });
  let lastMobile = mobile();
  window.addEventListener("resize", () => { const m = mobile(); if (S.pop || m !== lastMobile) { S.pop = null; lastMobile = m; render(); } });

  const start = (location.hash || "").slice(1);
  if (start === "today") S.view = "today";
  if (["waiting", "activity"].includes(start)) S.tab = start;
  render();
})();
