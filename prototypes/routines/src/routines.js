/* Tasks (prototype, version 9): what Loci does for you, under Loci in the rail. Two kinds of task:
   - Routines: things Loci does every time something happens (a trigger, then steps; version 8's flow editor).
   - Studies (version 9): one long piece of work done once, in depth, in the cloud. Loci asks four questions, shows a
     plan with its time and cost, and you agree it. Then it researches each question in its own thread, writes a
     course, and (deep only) checks it against a rubric, while you get on with your day. It ends on Today, as a
     course in Learn, readings in Commonplace and questions in Questions and goals. Progress is simulated.
   Earlier versions, kept: Routines (prototype, version 7): a Commonplace tab, with a page and an editor for each routine, and Finds.
   - Finds (version 7): a routine kind that checks sources for a subject on a schedule and brings what's new to a
     Finds page. Each find has a summary and why it's for you (a question it may answer, a goal it serves, a topic),
     and one decision: Save, Read later, Not for me (and why), or Ask Loci (and make a Lumen from it).
   - Routines is a tab of Commonplace, beside Questions and goals, and uses the same visual language:
     - summary tiles;
     - a segmented bar (Routines · Waiting · Activity);
     - cards with a coloured top line, a round mark, a serif title, small When / Loci / Then rows, a Last / Next /
       Waiting line, and a footer with a status button. They share the goal and question cards' look
       (prototypes/objects-boards-questions on branch claude/gifted-cerf-w0cwoi; Questions and goals design §10).
   - A card opens the routine's page:
     - what it does, as a sentence with tappable words;
     - When → Loci → Then;
     - how it's doing;
     - what it did lately;
     - what it would do with your last 20 things.
   - Edit opens a short form in five numbered sections, with a live sentence at the top. The same form makes a new
     routine. It's reached from:
     - New routine (beside "Tell Loci" and templates);
     - "Edit in full" on a draft Loci made.
   - The Loci panel on the right is the copilot's own markup and CSS. It answers questions, makes routines and changes
     them; with a routine open, it's scoped to it.
   The shell and Today are the app's own DOM and CSS, captured read-only from studiolo's /dev/specimens
   (see ../live-lumens/capture/capture.cjs). Spec: docs/superpowers/specs/2026-10-29-routines-chat-ux-design.md */
(() => {
  "use strict";
  const DATA = JSON.parse(document.getElementById("vx-data").textContent);
  const root = document.getElementById("vx-app");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const clone = (x) => JSON.parse(JSON.stringify(x));
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
  const ord = (n) => n + (n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th");

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
  const FILE_AS = ["Site photos", "Renders", "Precedents", "Books", "Papers", "Articles", "Videos", "Tools", "Specifications", "Notes", "Recipes"];
  const UND = { describe: "describe it", transcribe: "write out what I said", title: "give it a title", links: "save the links in its caption", book: "find the book", text: "pull out the text", summary: "sum it up in three lines", recipe: "keep just the recipe" };
  const UND_VERB = { describe: "Describe it", transcribe: "Write out what I said", links: "Keep the links in its caption", book: "Find the book", summary: "Sum it up in three lines", recipe: "Keep just the recipe" };
  const LRN = { questions: "turn my questions into @questions", review: "add it to Review", lumen: "offer to make a Lumen from it" };
  const LRN_VERB = { questions: "Turn my questions into @questions", lumen: "Offer to make a Lumen from it" };
  const COND_LABEL = { tag: "Has the tag", site: "From the site", words: "Mentions", is: "Loci reads that it's", about: "Is about" };
  const COND_ADD = { tag: "has a tag", site: "from a site", words: "mentions words", is: "Loci reads what it is", about: "is about a topic" };
  const DELAY_WAIT = { "the next day": "Waits a day", "three days later": "Waits three days", "a week later": "Waits a week" };

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
    { id: "rf1", type: "schedule", kind: "follow", name: "AI in architecture", on: true, every: "day", time: "07:30", place: "you", label: "AI in architecture", sources: ["Design-tools newsletter", "Building-science journal", "Architecture news site", "Conference channel"], kinds: ["article", "paper", "video", "tool"], count: 6, dest: "page", stat: "Kept 9 of 22 this month",
      lately: [{ t: "6 finds", w: "on today's Finds page", when: "Today, 07:30" }, { t: "4 finds", w: "3 decided", when: "Yesterday, 07:30" }] },
    { id: "rf2", type: "schedule", kind: "follow", name: "New papers on passive cooling", on: true, every: "w3", time: "08:00", place: "climate", label: "passive cooling", sources: ["Building-science journal", "A university lab's feed"], kinds: ["paper"], count: 5, dest: "page", stat: "Kept 2 of 3 this month",
      lately: [{ t: "3 finds", w: "all decided", when: "Wed 21 Oct" }] },
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
    { day: "Today", t: "07:45", sid: "st2", what: "started: 3 questions to research", state: "study" },
    { day: "Today", t: "07:30", rid: "rf1", what: "brought 6 finds to a Finds page", state: "finds", iss: "i1" },
    { day: "Today", t: "07:52", rid: "r2", what: "suggests a place for “Climate Considerations in Building and Urban Design”", state: "waiting" },
    { day: "Today", t: "07:31", rid: "r3", what: "wrote out a voice note and suggests Precast", state: "waiting" },
    { day: "Yesterday", t: "21:12", rid: "r4", what: "filed “Za'atar flatbread” as Recipes on Home & family", state: "filed" },
    { day: "Yesterday", t: "18:40", rid: "r5", what: "filed “Courtyard school in Burkina Faso” as Precedents, To read", state: "filed" },
    { day: "Yesterday", t: "16:05", rid: "r1", what: "filed “North wall, morning” as Site photos in the prayer hall project, and described it", state: "filed" },
    { day: "Saturday", t: "09:00", rid: "r8", what: "brought back the check for “How a malqaf moves air”: right", state: "done" },
    { day: "Friday", t: "17:00", rid: "r6", what: "asked 3 questions on Precast: 2 right, 1 to revisit", state: "done" },
  ];

  /* ---------- the last 20 things sent, for "what would it do" (examples) */
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

  /* ---------- Finds: what a finding routine brought back, as a page to look through (all examples) */
  const FIND_KINDS = [["article", "Articles"], ["paper", "Papers"], ["video", "Videos and talks"], ["tool", "Tools and data"]];
  const FK_ONE = { article: "Article", paper: "Paper", video: "Talk", tool: "Tool" };
  const FK_PL = { article: "articles", paper: "papers", video: "talks", tool: "tools" };
  const FK_AS = { article: "Articles", paper: "Papers", video: "Videos", tool: "Tools" };
  const FK_ICON = { article: "doc", paper: "book", video: "play", tool: "grid" };
  const kindsText = (r) => andJoin((r.kinds && r.kinds.length ? r.kinds : FIND_KINDS.map((k) => k[0])).map((k) => FK_PL[k]));
  const fnd = (id, kind, src, len, title, sum, topic, why, extra) => ({ id, kind, src, len, title, sum, topic, why, st: null, as: FK_AS[kind], on: topic, ...extra });
  const SAMPLE = [
    fnd("s1", "paper", "Building-science journal", "12 min read", "A daylight model trained on 10,000 measured rooms (example)", "It predicts daylight in deep plans from a simple massing model, within 10% of measurements in most rooms. It's weakest in rooms lit from one side only.", "daylight", [{ t: "q", v: "Where does the light come from in each hall?" }], { top: true }),
    fnd("s2", "article", "Architecture news site", "8 min read", "Five generative massing tools on one courtyard brief (example)", "The same hot, dry brief run through five tools. Two kept the courtyard shaded at noon; three never checked the shade.", "climate", [{ t: "g", v: "Understand how to keep the prayer hall's courtyard cool without machines" }]),
    fnd("s3", "video", "Conference channel", "38 min talk", "What AI changes in early climate design (example talk)", "A practice shows where machine learning saved them time (sun and wind studies) and where it misled them (thermal comfort).", "climate", []),
    fnd("s4", "tool", "Design-tools newsletter", "Open dataset", "A year of wind-tower measurements (example dataset)", "Air speeds and temperatures from 40 wind towers over a year, humid nights included.", "vernacular", [{ t: "q", v: "Does a malqaf still work when the night air is humid?" }]),
    fnd("s5", "tool", "Design-tools newsletter", "Free plugin", "Daylight autonomy in the browser (example plugin)", "It reads a simple massing model and maps daylight autonomy in a few seconds. Free for students.", "daylight", []),
    fnd("s6", "article", "A practice's blog you've saved from 6 times", "6 min read", "Why image models are poor at precedent research (example)", "Generated “precedents” mix real buildings with invented ones. The author argues for searching archives first, and using images only to sketch.", "islamic", [{ t: "n", v: "A different view from the precedents you saved this month" }]),
    fnd("s7", "paper", "Building-science journal", "14 min read", "Wind towers on humid nights: a field study (example)", "Measured in four towers on the Gulf coast: on humid nights the air still moved, but it cooled the rooms by less than a degree.", "vernacular", [{ t: "q", v: "Does a malqaf still work when the night air is humid?" }]),
    fnd("s8", "paper", "A university lab's feed", "10 min read", "Cross-ventilation through courtyards, modelled (example)", "Simulations of 30 courtyard plans: a narrow court with openings on two sides moved the most air.", "climate", [{ t: "g", v: "Understand how to keep the prayer hall's courtyard cool without machines" }]),
  ];
  const ISSUES = [
    { id: "i1", rid: "rf1", date: "Monday 26 October", when: "Today, 07:30", sources: 4, checked: 41, left: [[3, "already in your Commonplace"], [11, "off your topics"], [3, "the same story twice"]], items: SAMPLE.slice(0, 6).map((f, i) => ({ ...clone(f), id: "f" + (i + 1) })) },
    { id: "i2", rid: "rf1", date: "Sunday 25 October", when: "Yesterday, 07:30", sources: 4, checked: 36, left: [[2, "already in your Commonplace"], [9, "off your topics"]], items: [
      fnd("f7", "article", "Architecture news site", "5 min read", "A school roof that shades its own courtyard (example)", "A deep timber roof with gaps tuned to the sun's path keeps the courtyard below in shade from 10 to 4.", "climate", [], { st: "saved", top: true }),
      fnd("f8", "video", "Conference channel", "22 min talk", "Machine learning for natural ventilation (example talk)", "Fast airflow predictions for early design, checked against a wind tunnel.", "climate", [], { st: "later" }),
      fnd("f9", "tool", "Design-tools newsletter", "Paid app", "An AI rendering app for interiors (example)", "Turns a sketch into a photoreal interior in seconds.", "home", [], { st: "no", reason: "Not this topic" }),
      fnd("f10", "paper", "Building-science journal", "15 min read", "Predicting glare from a single photograph (example)", "A model that flags glare risk from a phone photo of a room, tested in 120 offices.", "daylight", []),
    ] },
    { id: "i3", rid: "rf2", date: "Wednesday 21 October", when: "Wed 21 Oct", sources: 2, checked: 14, left: [[1, "already in your Commonplace"]], items: [
      fnd("f11", "paper", "Building-science journal", "18 min read", "Night flushing in heavy and light buildings (example)", "Heavy buildings cooled by night air stayed 2 to 3 degrees cooler the next afternoon; light ones barely changed.", "climate", [{ t: "q", v: "Why does mass alone fail in humid climates?" }], { st: "saved", top: true }),
      fnd("f12", "paper", "A university lab's feed", "11 min read", "Evaporative cooling in courtyards, measured (example)", "Pools and planting in four courtyards; the cooling fell away when humidity rose above 60%.", "climate", [], { st: "saved" }),
      fnd("f13", "paper", "Building-science journal", "9 min read", "Cool roofs in cold climates (example)", "A study of reflective roofs in northern cities.", "climate", [], { st: "no", reason: "Not this topic" }),
    ] },
  ];
  const issueById = (id) => ISSUES.find((x) => x.id === id);
  const issuesOf = (rid) => ISSUES.filter((x) => x.rid === rid);
  const openOf = (iss) => iss.items.filter((x) => !x.st).length;
  const newFinds = () => ISSUES.reduce((a, x) => a + openOf(x), 0);
  const findById = (id) => { for (const iss of ISSUES) { const f = iss.items.find((x) => x.id === id); if (f) return [f, iss]; } return [null, null]; };
  let iid = ISSUES.length;

  /* ---------- templates for New routine */
  const blank = (type) => type === "arrive"
    ? { id: "draft", type: "arrive", name: "", on: true, when: "any", ifs: [], then: thenOf({}), mode: "ask", right: [0, 0], filed: 0, lately: [] }
    : type === "schedule" ? { id: "draft", type: "schedule", kind: "tidy", name: "", on: true, every: "day", time: "21:00", mode: "own", lately: [] }
    : { id: "draft", type: "after", kind: "lumen", name: "", on: true, delay: "three days later", lately: [] };
  const TPL = [
    { ...blank("arrive"), name: "PDFs by email", when: "email", ifs: [{ t: "kind", v: "PDF" }], then: thenOf({ understand: ["text", "summary"] }) },
    { ...blank("arrive"), name: "Reels: keep the links", when: "share", ifs: [{ t: "kind", v: "reel" }], then: thenOf({ understand: ["links"] }) },
    { ...blank("arrive"), name: "Lectures to watch", ifs: [{ t: "is", v: "a lecture" }], then: thenOf({ fileAs: "Videos", status: "To read" }) },
    { ...blank("schedule"), name: "Sort Unsorted every evening" },
    { ...blank("schedule"), kind: "follow", name: "Talks on daylight", place: "daylight", label: "", sources: ["Conference channel", "A practice's blog you've saved from 6 times"], kinds: ["video"], count: 3, dest: "page", every: "w5", time: "18:00" },
    { ...blank("schedule"), kind: "review", name: "Morning review", place: "daylight", count: 3, every: "day", time: "07:30" },
  ];

  /* ================================================================ state */

  /* ---------- studies (version 9): long work Loci does once, in depth, while you get on with your day.
     Loci plans it (you agree the plan), researches each question in its own thread, writes a course, and (deep
     only) checks it against a rubric. Each lesson is made when you reach it, in Learn. All content is an example. */
  const MONTHLY = 10; // an assumed monthly AI allowance in dollars, for showing costs as a share (decision ST-6)
  const DEPTHS = {
    standard: { label: "Standard", mins: 20, segs: 3, base: 0.73, perSeg: 0.31, note: "about 20 minutes", how: "3 questions, about 20 minutes" },
    deep: { label: "Deep", mins: 50, segs: 5, base: 1.55, perSeg: 0.5, note: "about 50 minutes", how: "5 questions, about 50 minutes, checked twice" },
  };
  const costFor = (depth, segs, mine) => DEPTHS[depth].base + DEPTHS[depth].perSeg * segs * (mine ? 0.8 : 1);
  const pctAllow = (c) => Math.max(1, Math.round((c / MONTHLY) * 100));
  const CONF = { Sure: "ok", Mostly: "ok", Mixed: "pick", Thin: "dim" };
  const STUDIES = [
    { id: "st2", subject: "Acoustics of large domed rooms", short: "Acoustics of domed rooms", on: "islamic", depth: "standard", state: "running", step: 2, tick: 1, mins: 20,
      started: "Today, 7:45", use: "project", know: "some", time: 3, mine: false, special: "acoustics",
      mission: "Understand how the prayer hall's dome will carry the imam's voice, and what to do about echoes, before the interior design starts.",
      segs: [
        { q: "Why domes focus sound, and where the echoes land", kept: 4, words: "dome focusing, concave reflections" },
        { q: "How long a prayer hall should ring for speech and recitation", kept: 5, words: "reverberation time, mosques" },
        { q: "What absorbs sound without spoiling the space", kept: 4, words: "hidden absorbers, perforated timber, plaster" },
      ],
      log: ["Kept 4 sources, and noted what they agree on", "Read 6 sources, 1 from your Commonplace", "Searched journals and books: “dome focusing, concave reflections”", "Plan agreed: 3 questions"] },
    { id: "st1", subject: "Passive cooling for a prayer hall in Dubai", short: "Passive cooling", on: "climate", depth: "deep", state: "done", seen: true, step: 7, tick: 0, mins: 52,
      started: "Thursday 22 October, 21:40", ready: "Thursday 22 October, 22:32", use: "project", know: "some", time: 3, done: 1, cost: 3.81,
      tokens: "2.7 million tokens in, 118 thousand out · 38 searches · 52 minutes",
      mission: "Know how to keep the prayer hall comfortable at Friday noon in June with as little cooling plant as possible, and be able to explain why to the client.",
      read: 46, kept: 18, mine: 5, readings: 12, collection: "Study: Passive cooling",
      segs: [
        { q: "Where the heat comes from in a large hall in Dubai", kept: 3 }, { q: "Shading roofs, domes and walls", kept: 4 },
        { q: "Thermal mass and night cooling in a hot, humid climate", kept: 4 }, { q: "Moving air: stack ventilation, wind catchers and fans", kept: 4 },
        { q: "What has been measured in real mosques and halls", kept: 3 },
      ],
      found: [
        { q: "Where the heat comes from", a: "Most of it comes through the roof and from the people. Sun on the roof is the largest single gain at noon, and a full hall adds roughly 100 W for every person.", conf: "Sure", n: 3 },
        { q: "Shading", a: "Shade the roof first: a ventilated second skin or a shaded dome cuts more heat than any measure on the walls. Deep, small openings keep the sun off the floor.", conf: "Sure", n: 4 },
        { q: "Thermal mass and the night", a: "Heavy walls help in spring and autumn, when nights are cool. From June to September Dubai's nights stay near 30 °C, so night cooling alone can't do it. Sources disagree on how much it helps.", conf: "Mixed", n: 4 },
        { q: "Moving air", a: "Hot air gathers under a dome; openings at its base let it out. Ceiling fans let people feel comfortable a few degrees warmer. Wind catchers moved air in old Dubai, but on a humid coast they don't cool it much.", conf: "Mostly", n: 4 },
        { q: "Measured buildings", a: "Measured studies of big prayer halls in hot, humid places are few; most measurements are of houses. The course says where it leans on house studies.", conf: "Thin", n: 3 },
      ],
      lessons: [
        { t: "Where the heat comes from", win: "Name the four sources of heat in the hall, and which is largest at noon", f: "Read", min: 8, src: "Givoni, Passive and Low Energy Cooling of Buildings (1994)" },
        { t: "Shade the roof first", win: "Choose between a second skin, a shaded dome and roof mass for the hall", f: "Watch", min: 5, src: "Brown and DeKay, Sun, Wind & Light (2014)" },
        { t: "Heavy walls and the night", win: "Say when thermal mass helps in Dubai, and when it doesn't", f: "Watch", min: 6, src: "Dubai climate data, and a journal review (example)" },
        { t: "Hot air up and out", win: "Size openings at the base of the dome so hot air can leave", f: "Watch", min: 5, src: "Givoni (1994)" },
        { t: "Wind catchers in the Gulf", win: "Explain what Al Fahidi's wind towers did, and why they cool less on a humid coast", f: "Read", min: 10, src: "Fathy, Natural Energy and Vernacular Architecture (1986)" },
        { t: "Fans, and feeling cooler", win: "Use air speed to raise the temperature people find comfortable", f: "Watch", min: 4, src: "ASHRAE Standard 55" },
        { t: "What real buildings tell us", win: "Tell which numbers come from halls and which from houses", f: "Read", min: 7, src: "5 measured studies (examples)" },
        { t: "A cooling plan for the hall", win: "Put the measures in order for the prayer hall, with a reason for each", f: "Read", min: 12, src: "This study's notes, and your site photos", check: true },
      ],
      questions: ["How big should the openings at the base of the dome be?", "Is a second roof skin worth its cost in Dubai?", "Can the courtyard cool the air before it enters the hall?"],
      sources: [
        ["Natural Energy and Vernacular Architecture", "Hassan Fathy, 1986 · Book", "mine"], ["Passive and Low Energy Cooling of Buildings", "Baruch Givoni, 1994 · Book", ""],
        ["Sun, Wind & Light", "G. Z. Brown and Mark DeKay, 2014 · Book", ""], ["ASHRAE Standard 55", "Thermal comfort · Standard", ""],
        ["Courtyard cooling study (example).pdf", "PDF · saved 12 Oct", "mine"], ["Measured temperatures in a domed hall (example)", "Paper · Building-science journal", ""],
      ] },
  ];
  const ACOUSTICS = {
    read: 31, kept: 13, mine: 2, readings: 7, collection: "Study: Acoustics of domed rooms", cost: 1.58,
    tokens: "0.9 million tokens in, 48 thousand out · 14 searches · 21 minutes",
    found: [
      { q: "Domes and focusing", a: "A dome reflects sound back toward its centre of curvature. If that point is near where people stand or speak, echoes gather there; a dome sprung higher, or a less regular surface, spreads them.", conf: "Sure", n: 4 },
      { q: "How long it should ring", a: "For speech and recitation, a hall this size should ring for about 1.5 seconds or less when full. Bare stone halls often ring for 3 seconds or more.", conf: "Mostly", n: 5 },
      { q: "Absorbers that don't show", a: "The carpet does much of the work at high pitches. The low voice of recitation needs absorbers that can hide in the architecture, such as perforated timber or plaster with a cavity behind, around the dome's base.", conf: "Mostly", n: 4 },
    ],
    lessons: [
      { t: "Why domes focus sound", win: "Find where echoes will gather under the hall's dome", f: "Watch", min: 5, src: "A room-acoustics textbook (example)" },
      { t: "How long a hall should ring", win: "Set a target reverberation time for the prayer hall", f: "Watch", min: 4, src: "Measured reverberation in large mosques (example)" },
      { t: "Measuring it", win: "Read a reverberation-time chart, and know what to ask an acoustician", f: "Read", min: 8, src: "A room-acoustics textbook (example)" },
      { t: "Absorbers that don't show", win: "Choose where hidden absorbers go, and how much area they need", f: "Watch", min: 5, src: "Two product guides and a journal paper (examples)" },
      { t: "A sound plan for the hall", win: "Put it together for the prayer hall, with a reason for each choice", f: "Read", min: 10, src: "This study's notes, and your site photos", check: true },
    ],
    questions: ["Where should the imam stand relative to the dome's centre?", "How much perforated panel does the hall need?"],
    sources: [["A room-acoustics textbook (example)", "Book", ""], ["Measured reverberation in large mosques (example)", "Paper · Acoustics journal", ""], ["Dome interior, east (example)", "Photo · your site photos", "mine"], ["Perforated timber panels: a product guide (example)", "Guide · manufacturer", ""]],
  };
  const studyById = (id) => STUDIES.find((x) => x.id === id);

  const S = { study: null, view: "routines", seg: "routines", kind: "all", only: null, open: null, edit: null, newer: false, ptab: "all", pop: null, sendOpen: false, builder: false, sheet: false, flash: null, noticed: "open", sent: new Set(), issue: null, issueFrom: null, findNo: null };
  const C = { all: [], per: {}, draft: null, previewed: false, q: [], cur: null, typing: null, input: "", pendingDelete: null, pendingSaid: null, srcOff: null, force: null, resetScroll: false };
  const curId = () => S.open || (S.issue ? issueById(S.issue)?.rid : null) || (S.edit && !S.edit.isNew ? S.edit.id : null);

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
        tag: () => `with ${chip(id, "tag", c.v || "a tag")}`, site: () => `from ${chip(id, "site", c.v || "a site")}`, words: () => `mentioning ${chip(id, "words", c.v || "some words")}`,
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
      if (r.kind === "follow") return `${ev}, look through ${chip(id, "sources", plural(r.sources.length, "source"))} for new ${chip(id, "fkinds", kindsText(r))} on ${chip(id, "place", r.label || PLACES[r.place].name)}, and bring me up to ${chip(id, "count", `${r.count} finds`)} ${chip(id, "dest", r.dest === "toread" ? "in To read" : "on a Finds page")}.`;
      if (r.kind === "review") return `${ev}, ask me ${chip(id, "count", `${r.count} questions`)} on what slipped at ${chip(id, "place", PLACES[r.place].name)}.`;
      if (r.kind === "pile") return `${ev}, show me what's sat in To read for over three months.`;
    }
    if (r.kind === "lumen") return `After I finish a Lumen, bring its check back ${chip(id, "delay", r.delay)}.`;
    if (r.kind === "dup") return "When I send something I already have, keep the one I have and tell me.";
    return "";
  }
  const still = (d) => sentence(d, "snap").replace(/<button[^>]*>/g, "<u>").replace(/<\/button>/g, "</u>");

  /* ---------- the same routine, as When → Loci → Then */
  const condOf = (r, t) => r.ifs.find((c) => c.t === t)?.v;
  function flowOf(r) {
    if (r.type === "arrive") {
      const t = r.then;
      const when = [{ t: r.when === "any" ? "From anywhere you send things" : `Sent ${CH_PREP[r.when]} ${CH_WORD[r.when]}` }, ...r.ifs.map((c) => ({
        kind: { t: cap(KIND_WORD[c.v]) }, tag: { t: `With the tag ${c.v}` }, site: { t: `From ${c.v}` }, words: { t: `Mentioning “${c.v}”` },
        is: { t: `That's ${c.v}`, loci: true }, about: { t: `About ${PLACES[c.v]?.name}`, loci: true },
      })[c.t])];
      const loci = [...t.understand.filter((u) => UND_VERB[u]).map((u) => ({ t: UND_VERB[u], loci: true })), ...t.learn.map(() => ({ t: "Turn your questions into @questions", loci: true })), ...(t.on === "best" ? [{ t: "Work out its topic", loci: true }] : [])];
      const then = [{ t: t.fileAs ? `File it as ${t.fileAs}` : "File it" }, ...(t.on === "best" ? [{ t: "On the topic it's about" }] : t.on ? [{ t: `On ${PLACES[t.on].name}` }] : []), ...(t.status ? [{ t: `Mark it ${t.status}` }] : []), ...(t.addTo === "project" ? [{ t: "Add it to the prayer hall project" }] : []), ...(t.reply === "confirm" ? [{ t: "Tell you on WhatsApp" }] : []), { t: r.mode === "ask" ? "Ask you first" : "On its own", mode: true }];
      return { when, loci, then };
    }
    if (r.type === "schedule") {
      if (r.kind === "follow") return { when: [{ t: everyText(r) }], loci: [{ t: `Looks through ${plural(r.sources.length, "source")} for new ${kindsText(r)}`, loci: true }, { t: `Keeps what's about ${r.label || PLACES[r.place].name}`, loci: true }, { t: "Leaves out what you already have" }, { t: "Sums each one up, and says why it's for you", loci: true }], then: [{ t: r.dest === "toread" ? `Puts up to ${r.count} in To read` : `Brings up to ${r.count} to a Finds page` }, { t: "Puts a card on Today" }] };
      const L = { tidy: "Reads each thing in Unsorted", review: `Finds what slipped at ${PLACES[r.place]?.name}`, pile: "Finds what's sat in To read for three months" };
      const T = { tidy: r.mode === "ask" ? "Asks you about each thing" : "Files what it's sure of, asks about the rest", follow: `Brings them to Today, each on its topic`, review: `Asks you ${r.count} questions in Today`, pile: "Asks you: read it, keep it, or let it go" };
      return { when: [{ t: everyText(r) }], loci: [{ t: L[r.kind], loci: true }], then: [{ t: T[r.kind] }] };
    }
    if (r.kind === "lumen") return { when: [{ t: "You finish a Lumen" }], loci: [{ t: DELAY_WAIT[r.delay] || "Waits" }], then: [{ t: "Brings its check back to Today" }] };
    return { when: [{ t: "You send something you already have" }], loci: [{ t: "Compares it with your Commonplace", loci: true }], then: [{ t: "Keeps the one you have, and tells you" }] };
  }
  // the three short rows on a card
  function cardRows(r) {
    if (r.type === "arrive") {
      const f = (t) => condOf(r, t), k = f("kind"), is = f("is");
      let what = k ? cap(KIND_WORD[k]) : is ? `Anything that's ${is}` : "Anything";
      if (f("tag")) what += ` with ${f("tag")}`;
      if (f("site")) what += ` from ${f("site")}`;
      if (f("words")) what += ` mentioning “${f("words")}”`;
      if (k && is) what += `, if it's ${is}`;
      if (f("about")) what += ` about ${PLACES[f("about")].name}`;
      if (r.when !== "any") what += `, ${CH_PREP[r.when]} ${CH_WORD[r.when]}`;
      const t = r.then, loci = [...t.understand.filter((u) => UND_VERB[u]).map((u) => UND_VERB[u]), ...t.learn.map(() => "Questions become @questions")];
      const to = [t.fileAs, t.on === "best" ? "its topic" : t.on ? PLACES[t.on].name : "", t.addTo === "project" ? "prayer hall project" : "", t.status].filter(Boolean).join(" · ");
      return [["when", what], ...(loci.length ? [["loci", loci.join(" · ")]] : []), ["then", cap(to || "where it is")]];
    }
    if (r.kind === "follow") return [["when", everyText(r)], ["loci", `Looks through ${plural(r.sources.length, "source")} for ${r.label || PLACES[r.place].name}`], ["then", r.dest === "toread" ? `Up to ${r.count} new things in To read` : `Up to ${r.count} finds on a Finds page`]];
    const fl = flowOf(r);
    return [["when", fl.when[0].t], ["loci", fl.loci[0].t], ["then", fl.then[0].t]];
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
  const countOf = (r) => (r.type === "arrive" ? (r.mode === "own" ? (r.filed || r.lately.length ? `${r.filed} filed this month` : "New") : r.right[1] ? `right ${r.right[0]} of ${r.right[1]}` : "New") : r.stat);
  const arrivePos = (r) => ROUTINES.filter((x) => x.type === "arrive").indexOf(r) + 1;
  const autoName = (d) => { const k = d.ifs.find((c) => c.t === "kind")?.v; return d.then.fileAs || `${k ? cap(KINDS_WORD(k)) : "Things"}${d.when !== "any" ? ` ${CH_PREP[d.when]} ${CH_WORD[d.when]}` : ""}`; };
  const autoNameAny = (d) => d.type === "arrive" ? autoName(d) : d.type === "after" ? "After a Lumen" : ({ tidy: "Sort Unsorted", follow: cap(d.label || (d.place && d.place !== "you" ? PLACES[d.place].name : "") || "New finds"), review: `${PLACES[d.place]?.name} review`, pile: "Clear the To read pile" })[d.kind];

  /* ================================================================ matching (plain rules in code; "is" needs Loci to read the item) */
  function fits(r, it) {
    if (!r.on && r.id !== "draft") return false;
    if (r.when !== "any" && r.when !== it.ch) return false;
    return r.ifs.length > 0 && r.ifs.every((c) => ({
      kind: () => it.kind === c.v, tag: () => (it.tags || []).includes(c.v), site: () => c.v.split(/[,\s]+/).includes(it.site),
      words: () => !!c.v && it.title.toLowerCase().includes(c.v.toLowerCase()), is: () => it.is === c.v, about: () => it.about === c.v,
    })[c.t]());
  }
  function whereFor(r, it) {
    const t = r.then, place = t.on === "best" ? it.about : t.on;
    const base = [t.fileAs && `as ${t.fileAs}`, place && `on ${PLACES[place].name}`, t.addTo === "project" && "in the prayer hall project"].filter(Boolean).join(" ");
    return (base || "where it is") + (t.status ? `, ${t.status}` : "");
  }
  const firstFit = (it) => ROUTINES.find((r) => r.type === "arrive" && fits(r, it));
  const hitsOf = (r) => PAST.filter((p) => fits({ ...r, id: "draft", on: true }, p));
  function tryHTML(r, max = 3) {
    const hits = hitsOf(r);
    if (!hits.length) return `<p class="note">None of the last 20 things you sent fit this yet.</p>`;
    return `<div class="rx-try"><p><b>${hits.length} of the last 20 things you sent</b> would have been filed${r.id === "draft" ? ". Nothing moves until it's on" : ""}:</p><ul>${hits.slice(0, max).map((p) => `<li><b>${esc(p.title)}</b><span>${esc(whereFor(r, p))}</span></li>`).join("")}</ul>${hits.length > max ? `<p class="rx-more-n">and ${hits.length - max} more</p>` : ""}</div>`;
  }

  /* ================================================================ marks: icons, the ring, buttons */
  const IC = {
    whatsapp: '<path d="M4.5 19.5 5.8 16A7.5 7.5 0 1 1 8.6 18.6z"/>',
    email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    share: '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/>',
    browser: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    any: '<path d="M3 13.5 6 5h12l3 8.5V19H3z"/><path d="M3 13.5h5l1.2 2.2h5.6l1.2-2.2h5"/>',
    schedule: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
    lumen: '<path d="M4 12h11"/><path d="m11 7.5 4.5 4.5-4.5 4.5"/><path d="M19.5 5v14"/>',
    dup: '<rect x="8.5" y="8.5" width="12" height="12" rx="2"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>',
    loop: '<path d="M17 2.5 20.5 6 17 9.5"/><path d="M3.5 11V9.5A3.5 3.5 0 0 1 7 6h13.5"/><path d="M7 21.5 3.5 18 7 14.5"/><path d="M20.5 13v1.5A3.5 3.5 0 0 1 17 18H3.5"/>',
    in: '<path d="M5 12h12"/><path d="m12.5 7.5 4.5 4.5-4.5 4.5"/>',
    spark: '<path d="M12 4v4M12 16v4M4 12h4M16 12h4"/><path d="m7.5 7.5 1.8 1.8M14.7 14.7l1.8 1.8M7.5 16.5l1.8-1.8M14.7 9.3l1.8-1.8"/>',
    out: '<path d="M4 7.5A1.5 1.5 0 0 1 5.5 6H9l2 2h7.5A1.5 1.5 0 0 1 20 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    send: '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    fold: '<path d="m6 9 6 6 6-6"/>',
    back: '<path d="m14.5 6-6 6 6 6"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
    study: '<path d="M3 5.5c3-1.2 6-1 9 1 3-2 6-2.2 9-1v13c-3-1.2-6-1-9 1-3-2-6-2.2-9-1z"/><path d="M12 6.5v13"/>',
    filter: '<path d="M4 5h16l-6 7.5V19l-4-2v-4.5z"/>',
    check: '<path d="M12 3 4.5 6v5.5c0 4.4 3.2 8.2 7.5 9.5 4.3-1.3 7.5-5.1 7.5-9.5V6z"/><path d="m9 12 2 2 4-4"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7L11.5 6.8"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5"/>',
    doc: '<path d="M7 3.5h7l4 4v12.5a.5.5 0 0 1-.5.5h-10.5a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5z"/><path d="M9.5 12h5M9.5 15.5h5"/>',
    book: '<path d="M3.5 6c3-1.5 5.5-1.5 8.5 0v13c-3-1.5-5.5-1.5-8.5 0zM20.5 6c-3-1.5-5.5-1.5-8.5 0v13c3-1.5 5.5-1.5 8.5 0z"/>',
    play: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m10.5 9.5 4 2.5-4 2.5z"/>',
    grid: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M10 4v16"/>',
  };
  const svg = (k, s = 16) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`;
  const iconOf = (r) => (r.type === "arrive" ? r.when : r.kind === "follow" ? "search" : r.type === "schedule" ? "schedule" : r.kind === "lumen" ? "lumen" : "dup");
  // the progress ring from Questions and goals: here, how often the routine was right when you checked
  function ring(d, n, size = 46) {
    const Cf = 2 * Math.PI * 15.9, p = n ? d / n : 0;
    return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 36 36" role="img" aria-label="Right ${d} of ${n} times"><circle cx="18" cy="18" r="15.9" class="rb"/>${p ? `<circle cx="18" cy="18" r="15.9" class="rf" stroke-dasharray="${(p * Cf).toFixed(1)} ${Cf.toFixed(1)}" transform="rotate(-90 18 18)"/>` : ""}${size > 30 ? `<text x="18" y="21.2" text-anchor="middle"${`${d}${n}`.length > 2 ? ' style="font-size:7.5px"' : ""}>${d}/${n}</text>` : ""}</svg>`;
  }
  const btn = (label, attrs, kind = "") => `<button type="button" class="button${kind ? " button-" + kind : ""}" ${attrs}>${label}</button>`;
  const stBtn = (r) => `<button type="button" class="st ${r.on ? "active" : "paused"}" data-act="chip" data-r="${r.id}" data-f="onoff" aria-label="${r.on ? "On" : "Paused"}: change">${r.on ? "On" : "Paused"} ▾</button>`;

  /* ================================================================ the page header: a Commonplace tab */
  // Routines live under Loci: what Loci does for you. Commonplace keeps its own tabs; Finds and Waiting also reach Today.
  function header(tab, crumb) {
    if (tab === "everything") {
      const tabs = [["everything", "Everything"], ["collections", "Collections"], ["toread", "To read"], ["qg", "Questions and goals"], ["templates", "Templates"]];
      return `<header class="destination-header"><div class="destination-crumb"><strong>Commonplace</strong>${crumb.map((c) => `<i aria-hidden="true">/</i><span>${esc(c)}</span>`).join("")}</div>
        <nav aria-label="Commonplace sections" class="destination-tabs">${tabs.map(([k, l]) => `<a class="destination-tab" href="#${k}" data-act="dtab" data-v="${k}"${tab === k ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav></header>`;
    }
    const tabs = [["routines", "Tasks", STUDIES.filter((x) => x.state === "running").length || null], ["finds", "Finds", newFinds()], ["waiting", "Waiting", W.length], ["activity", "Activity", null], ["connections", "Connections", null]];
    return `<header class="destination-header"><div class="destination-crumb"><strong>Loci</strong>${crumb.map((c) => `<i aria-hidden="true">/</i><span>${esc(c)}</span>`).join("")}</div>
      <nav aria-label="Loci sections" class="destination-tabs">${tabs.map(([k, l, n]) => `<a class="destination-tab" href="#${k}" data-act="seg" data-v="${k}"${S.seg === k && !S.edit && !S.newer && !S.open && !S.issue && !S.study ? ' aria-current="page"' : S.seg === k ? ' aria-current="true"' : ""}>${l}${n ? `<span class="rx-count${k === "finds" ? " acc" : ""}">${n}</span>` : ""}</a>`).join("")}</nav></header>`;
  }

  /* ================================================================ the Routines tab: tiles, the bar, cards */
  const filedThisWeek = () => 23 + ACT.filter((a) => a.live && a.state === "filed").length;
  function tiles() {
    const on = ROUTINES.filter((r) => r.on).length;
    const T = [
      (() => { const w = STUDIES.filter((x) => x.state === "running").length, rd = STUDIES.filter((x) => x.state === "done" && !x.seen).length;
        return ["studies", "g", svg("study", 16), w || rd || on, w ? (w === 1 ? "study working now" : "studies working now") : rd ? (rd === 1 ? "study ready" : "studies ready") : on === 1 ? "routine on" : "routines on", S.seg === "routines" && S.kind === "study"]; })(),
      ["waiting", "q", "?", W.length, W.length === 1 ? "thing waiting for you" : "things waiting for you", S.seg === "waiting"],
      ["finds", "f", svg("search", 16), newFinds(), newFinds() === 1 ? "new find to look through" : "new finds to look through", S.seg === "finds"],
      ["activity", "a", "✓", filedThisWeek(), "filed for you this week", S.seg === "activity"],
    ];
    return `<div class="rx-tiles">${T.map(([k, c, gl, n, l, on2]) => `<button type="button" class="qg-tile ${c}${on2 ? " on" : ""}" data-act="tile" data-v="${k}"><span class="qg-gl" aria-hidden="true">${gl}</span><b>${n}</b><span>${l}</span></button>`).join("")}</div>`;
  }
  function bar() {
    const n = (t) => ROUTINES.filter((r) => r.type === t).length;
    const kinds = [["all", "All"], ["study", `Studies · ${STUDIES.length}`], ["arrive", `When I send · ${n("arrive")}`], ["schedule", `On a schedule · ${n("schedule")}`], ["after", `After I do something · ${n("after")}`]];
    return `<div class="cph-bar rx-bar">
      ${S.seg === "routines" ? `<div class="qg-topics" role="group" aria-label="Kind">${kinds.map(([k, l]) => `<button type="button" data-act="kind" data-v="${k}" aria-pressed="${S.kind === k}">${l}</button>`).join("")}${S.only === "paused" ? `<button type="button" data-act="tile" data-v="on" aria-pressed="true">Paused only ×</button>` : ""}</div>` : ""}
      <span class="rx-grow"></span><button type="button" class="button rx-new" data-act="new">${svg("plus")}New task</button></div>`;
  }
  function card(r) {
    const waiting = W.filter((w) => w.rid === r.id && w.kind === "single");
    const cls = ["rk", !r.on ? "paused" : waiting.length ? "waiting" : "", S.flash === r.id ? "flash" : ""].filter(Boolean).join(" ");
    const kick = r.type === "arrive" ? `${ord(arrivePos(r))} in line · ${CH_SHORT[r.when]}` : r.type === "schedule" ? (r.on ? `Next: ${fNext(nextRun(r))}` : "Scheduled") : "Follow-up";
    const last = r.lately[0], iss = r.kind === "follow" ? issuesOf(r.id)[0] : null;
    const next = iss && openOf(iss) ? `<p class="rk-next finds"><b>Finds</b><span>${plural(openOf(iss), "new find")} · ${esc(iss.when)}</span><button type="button" class="rk-go" data-act="open-issue" data-v="${iss.id}">Look through</button></p>`
      : waiting.length ? `<p class="rk-next wait"><b>Waiting</b><span>“${esc(waiting[0].newTitle || waiting[0].title)}”${waiting.length > 1 ? ` and ${waiting.length - 1} more` : ""}</span><button type="button" class="rk-go" data-act="seg" data-v="waiting">Check it</button></p>`
      : last ? `<p class="rk-next"><b>Last</b><span>${esc(last.t)} · ${esc(last.when)}</span></p>`
      : `<p class="rk-next new"><b>New</b><span>${r.type === "schedule" ? `Its first run is ${fNext(nextRun(r))}.` : "It starts with the next thing that fits."}</span></p>`;
    const stat = r.type === "arrive" && r.mode === "ask" && r.right[1] ? `<span class="gprog">${ring(r.right[0], r.right[1], 18)}right ${r.right[0]} of ${r.right[1]}</span>` : `<span class="rk-stat">${esc(countOf(r))}</span>`;
    return `<article class="${cls}" data-r="${r.id}"><button type="button" class="rx-hit" data-act="open-r" data-r="${r.id}" aria-label="Open “${esc(r.name)}”"></button>
      <div class="rk-top"><span class="rk-gl">${svg(iconOf(r), 18)}</span><div class="rk-h"><p class="rk-k">${esc(kick)}</p><h3>${esc(r.name)}</h3></div></div>
      <ul class="rk-rows">${cardRows(r).map(([k, t]) => `<li class="${k}"><span class="rk-dot" title="${{ when: "When", loci: "Loci", then: "Then" }[k]}">${svg({ when: "in", loci: "spark", then: "out" }[k], 12)}</span><span class="rk-t">${esc(t)}</span></li>`).join("")}</ul>
      ${next}<div class="rk-ft">${stat}${stBtn(r)}</div></article>`;
  }
  function draftCard(type) {
    const d = C.draft; if (!d || !C.previewed || d.type !== type) return "";
    return `<article class="rk ghost"><div class="rk-top"><span class="rk-gl">${svg(iconOf(d), 18)}</span><div class="rk-h"><p class="rk-k">Draft · not on yet</p><h3>${esc(d.name)}</h3></div></div>
      <ul class="rk-rows">${cardRows(d).map(([k, t]) => `<li class="${k}"><span class="rk-dot">${svg({ when: "in", loci: "spark", then: "out" }[k], 12)}</span><span class="rk-t">${esc(t)}</span></li>`).join("")}</ul>
      <p class="rk-next new"><b>Next</b><span>Turn it on, or edit it first.</span></p><div class="rk-ft"><span class="rk-stat">${d.type === "arrive" ? `${hitsOf(d).length} of your last 20 would fit` : "Loci made this"}</span><span class="rx-acts">${btn("Edit", 'data-act="draft-edit"', "quiet")}${btn("Turn it on", 'data-act="turn-on"')}</span></div></article>`;
  }
  function routinesSeg() {
    if (S.kind === "study") return studiesSec();
    const lead = S.kind === "all" && S.only !== "paused" ? studiesSec() : "";
    const shown = ROUTINES.filter((r) => (S.kind === "all" || r.type === S.kind) && (S.only !== "paused" || !r.on));
    const types = (S.kind === "all" ? ["arrive", "schedule", "after"] : [S.kind]).filter((t) => shown.some((r) => r.type === t) || (C.draft && C.previewed && C.draft.type === t));
    if (!types.length) return lead + `<div class="qg-empty"><span class="qc-gl">–</span><p>${S.only === "paused" ? "Nothing is paused." : "No routines of this kind yet."} ${btn("Make one", 'data-act="new"', "link")}</p></div>`;
    return lead + types.map((t) => `<section class="rx-sec" aria-labelledby="rx-g-${t}"><h2 id="rx-g-${t}">${GROUP[t]} <span>${shown.filter((r) => r.type === t).length}</span></h2><p class="rx-sub">${GROUP_NOTE[t]}</p>
      <div class="rk-grid">${draftCard(t)}${shown.filter((r) => r.type === t).map(card).join("")}</div></section>`).join("");
  }
  const topicSel = (id, cur) => `<select class="sm-select rx-sel" id="${id}" aria-label="Topic">${TOPICS.map((p) => `<option value="${p}"${p === cur ? " selected" : ""}>${esc(PLACES[p].name)}</option>`).join("")}</select>`;
  function waitCard(w) {
    if (w.kind === "single") {
      const r = RR(w.rid);
      return `<article class="rk wcard"><div class="rk-top"><span class="rk-gl q" aria-hidden="true">?</span><div class="rk-h"><p class="rk-k">${esc(r.name)} asks · ${esc(w.from)} · ${esc(w.when)}</p><h3>${esc(w.newTitle || w.title)}</h3></div></div>
        ${w.found ? `<p class="rk-found">${esc(w.found)}</p>` : ""}
        <div class="rx-wfile"><span>File it${w.fileAs ? ` as ${esc(w.fileAs)}` : ""}${r.then.addTo === "project" ? " in the prayer hall project" : ""}${r.then.on === "best" ? " on" : r.then.on ? ` on ${esc(PLACES[r.then.on].name)}` : ""}</span>${r.then.on === "best" ? topicSel(`ws-${w.id}`, w.sug) : ""}${w.status ? `<span>, ${esc(w.status)}</span>` : ""}</div>
        <div class="rk-ft"><button type="button" class="rk-go" data-act="open-r" data-r="${r.id}">From “${esc(r.name)}” ↗</button><span class="rx-acts">${btn("Not this", `data-act="w-no" data-w="${w.id}"`, "quiet")}${btn("File it", `data-act="w-file" data-w="${w.id}"`)}</span></div></article>`;
    }
    if (w.kind === "nomatch") {
      const it = w.item;
      return `<article class="rk wcard"><div class="rk-top"><span class="rk-gl q" aria-hidden="true">?</span><div class="rk-h"><p class="rk-k">No routine covers this · ${esc(CH_SHORT[it.ch])} · just now</p><h3>${esc(it.title)}</h3></div></div>
        <p class="rk-found">${esc(cap(KIND_WORD[it.kind]))}${it.site ? ` from ${esc(it.site)}` : ""}.</p>
        <div class="rx-wfile">${it.about ? `<span>Loci would put it on</span>${topicSel(`ws-${w.id}`, it.about)}` : `<span>Nothing on your map fits. Loci would start a sub-topic, <b>${esc(it.newTopic)}</b>.</span>`}</div>
        <div class="rk-ft"><button type="button" class="rk-go" data-act="w-make" data-w="${w.id}">Make a routine for things like this</button><span class="rx-acts">${btn("Leave it", `data-act="w-no" data-w="${w.id}"`, "quiet")}${btn("File it there", `data-act="w-file" data-w="${w.id}"`)}</span></div></article>`;
    }
    const left = w.items.filter((x) => !x.st).length;
    return `<article class="rk wcard"><div class="rk-top"><span class="rk-gl q" aria-hidden="true">?</span><div class="rk-h"><p class="rk-k">${esc(RR(w.rid)?.name || "To read pile")} · ${esc(w.when)}</p><h3>${plural(left, "thing")} in To read for over three months</h3></div></div>
      <ul class="rk-pile">${w.items.map((x, i) => `<li><span><b>${esc(x.t)}</b><em>${esc(x.k)} · ${esc(x.since)}</em></span>${x.st ? `<span class="rx-dim">${{ week: "This week: added to Today", keep: "Kept", letgo: "Let go (archived)" }[x.st]}</span>` : `<span class="rx-acts">${btn("Read it this week", `data-act="p-act" data-w="${w.id}" data-i="${i}" data-v="week"`, "quiet")}${btn("Keep", `data-act="p-act" data-w="${w.id}" data-i="${i}" data-v="keep"`, "quiet")}${btn("Let go", `data-act="p-act" data-w="${w.id}" data-i="${i}" data-v="letgo"`, "quiet")}</span>`}</li>`).join("")}</ul></article>`;
  }
  const waitingSeg = () => `<section class="rx-sec"><h2>Waiting for you <span>${W.length}</span></h2><p class="rx-sub">Things your routines weren't sure about. One decision each.</p>${W.length ? `<div class="rk-grid">${W.map(waitCard).join("")}</div>` : `<div class="qg-empty"><span class="qc-gl">✓</span><p>Nothing is waiting for you. ${btn("See what your routines did", 'data-act="seg" data-v="activity"', "link")}</p></div>`}</section>`;
  function activitySeg() {
    let day = "";
    const rows = ACT.map((a, i) => {
      const r = RR(a.rid), h = a.day !== day ? `<li class="rx-day">${esc(a.day)}</li>` : "";
      day = a.day;
      const end = a.state === "study" ? btn("Open", `data-act="open-study" data-v="${a.sid}"`, "link") : a.state === "finds" ? btn("Look through", `data-act="open-issue" data-v="${a.iss}"`, "link") : a.state === "waiting" ? btn("Check it", 'data-act="seg" data-v="waiting"', "link") : a.undo ? btn("Undo", `data-act="act-undo" data-i="${i}"`, "link") : a.state === "undone" ? `<span class="rx-dim">Undone</span>` : "";
      return `${h}<li class="rx-arow"><time>${esc(a.t)}</time><span>${r ? `<button type="button" class="rx-link" data-act="open-r" data-r="${a.rid}">${esc(r.name)}</button>` : a.sid && studyById(a.sid) ? `The study <button type="button" class="rx-link" data-act="open-study" data-v="${a.sid}">${esc(studyById(a.sid).short)}</button>` : "A routine"} ${esc(a.what)}</span>${end}</li>`;
    }).join("");
    return `<section class="rx-sec"><h2>Activity</h2><p class="rx-sub">Everything your routines and studies did, newest first. Tap a name to open it.</p><ol class="rx-act">${rows}</ol></section>`;
  }

  /* ================================================================ Finds: a page per run, to look through */
  function issueCard(iss) {
    const r = RR(iss.rid), open = openOf(iss), n = iss.items.length, top = iss.items.find((f) => f.top) || iss.items[0];
    return `<article class="rk fcard${open ? "" : " done"}"><button type="button" class="rx-hit" data-act="open-issue" data-v="${iss.id}" aria-label="Open the finds from ${esc(iss.date)}"></button>
      <div class="rk-top"><span class="rk-gl">${svg("search", 18)}</span><div class="rk-h"><p class="rk-k">${esc(r ? r.name : "Finds")} · ${esc(iss.when)}</p><h3>${esc(iss.date)}</h3></div></div>
      <ul class="rk-rows">${iss.items.slice(0, 3).map((f) => `<li class="${f.st ? "done" : ""}"><span class="rk-dot">${svg(FK_ICON[f.kind], 12)}</span><span class="rk-t">${esc(f.title)}</span></li>`).join("")}</ul>
      <p class="rk-next finds"><b>Top pick</b><span>${esc(top.title)}</span></p>
      <div class="rk-ft"><span class="gprog">${ring(n - open, n, 18)}${n - open} of ${n} decided</span><span class="st active">${open ? `${open} to look at ›` : "Done ›"}</span></div></article>`;
  }
  function findsSeg() {
    const fr = ROUTINES.filter((r) => r.kind === "follow");
    return `<section class="rx-sec"><h2>Finds <span>${newFinds()} new</span></h2><p class="rx-sub">What your finding routines brought back: one page per run. Keep what's useful; Loci learns from what you skip.</p>
      <div class="rk-grid">${ISSUES.map(issueCard).join("")}<button type="button" class="rk ghost rx-addfind" data-act="new-follow"><span class="rk-gl">${svg("plus", 18)}</span><b>Something else to watch</b><span>A subject, the sources to read, and how often</span></button></div></section>
      ${fr.length ? `<section class="rx-sec"><h2>What they watch <span>${fr.length}</span></h2><p class="rx-sub">Open one to change its subject, sources or timing.</p><div class="rk-grid">${fr.map(card).join("")}</div></section>` : ""}`;
  }
  function whyRow(w) {
    if (w.t === "q") return `<li class="q"><span class="gc-dot" aria-hidden="true">?</span><span>May answer your question “${esc(w.v)}”</span></li>`;
    if (w.t === "g") return `<li class="g"><span class="gc-dot" aria-hidden="true">◎</span><span>Serves your goal “${esc(w.v)}”</span></li>`;
    return `<li class="n"><span class="gc-dot" aria-hidden="true">${svg("spark", 11)}</span><span>${esc(w.v)}</span></li>`;
  }
  function findCard(f, big) {
    const place = PLACES[f.on] ? PLACES[f.on].name : "your whole map";
    const state = f.st === "saved" ? `<p class="fd-done ok">✓ Saved as ${esc(f.as)} on ${esc(place)}${f.why.some((w) => w.t === "q") ? ", linked to your question" : ""}<button type="button" class="rk-go" data-act="f-undo" data-v="${f.id}">Undo</button></p>`
      : f.st === "later" ? `<p class="fd-done">In To read<button type="button" class="rk-go" data-act="f-undo" data-v="${f.id}">Undo</button></p>`
      : f.st === "no" ? `<p class="fd-done">Not for me${f.reason ? `: ${esc(f.reason.toLowerCase())}` : ""}<button type="button" class="rk-go" data-act="f-undo" data-v="${f.id}">Undo</button></p>`
      : S.findNo === f.id ? `<div class="fd-acts fd-no"><span>Why not?</span>${["Not this topic", "Not from this source", "Too basic", "Just not now"].map((x) => `<button type="button" class="ed-chip" data-act="f-reason" data-v="${f.id}" data-r2="${x}">${x}</button>`).join("")}</div>`
      : `<div class="fd-save"><span>Save as</span><select class="sm-select" data-fs="as" data-f="${f.id}" aria-label="Save as">${FILE_AS.map((x) => `<option${x === f.as ? " selected" : ""}>${esc(x)}</option>`).join("")}</select><span>on</span><select class="sm-select" data-fs="on" data-f="${f.id}" aria-label="Topic">${TOPICS.map((p) => `<option value="${p}"${p === f.on ? " selected" : ""}>${esc(PLACES[p].name)}</option>`).join("")}</select></div>
        <div class="fd-acts">${btn("Save", `data-act="f-save" data-v="${f.id}"`)}${btn("Read later", `data-act="f-later" data-v="${f.id}"`, "quiet")}${btn("Not for me", `data-act="f-no" data-v="${f.id}"`, "quiet")}<span class="rx-grow"></span><button type="button" class="rk-go" data-act="f-ask" data-v="${f.id}">Ask Loci</button></div>`;
    return `<article class="fd${big ? " big" : ""}${f.st ? " is-" + f.st : ""}" id="fd-${f.id}"><p class="fd-k"><span class="rk-dot">${svg(FK_ICON[f.kind], 12)}</span>${FK_ONE[f.kind]} · ${esc(f.src)} · ${esc(f.len)}</p>
      <h3>${esc(f.title)}</h3><p class="fd-sum">${esc(f.sum)}</p>
      <ul class="fd-why">${f.why.map(whyRow).join("")}${PLACES[f.topic] ? `<li class="t"><span class="gc-dot" aria-hidden="true">${svg("out", 11)}</span><span>Fits ${esc(PLACES[f.topic].name)}</span></li>` : ""}</ul>${state}</article>`;
  }
  function issuePage(iss) {
    const r = RR(iss.rid), open = openOf(iss), n = iss.items.length, top = iss.items.find((f) => f.top) || iss.items[0];
    const rest = iss.items.filter((f) => f !== top), topics = [...new Set(rest.map((f) => f.topic))];
    const leftN = iss.left.reduce((a, [k]) => a + k, 0);
    return `<article class="rp iss" aria-label="Finds, ${esc(iss.date)}">
      <nav class="rp-back"><button type="button" class="rx-backbtn" data-act="iss-back">${svg("back", 14)}${S.issueFrom && S.issueFrom !== "finds" && r ? esc(r.name) : "Finds"}</button></nav>
      <header class="rp-head"><span class="rk-gl lg">${svg("search", 22)}</span><div class="rp-h"><p class="rk-k">Finds · ${esc(r ? r.name : "")}</p><h1 class="rp-title">${esc(iss.date)}</h1>
        <div class="rp-meta"><span>${plural(n, "find")} from ${plural(iss.sources, "source")} · Loci looked at ${iss.checked} · ${esc(iss.when)}</span></div></div>
        <div class="iss-prog">${ring(n - open, n)}<span>${open ? `${open} to decide` : "All decided"}</span></div></header>
      <p class="iss-how">For each one, <b>Save</b> it to your Commonplace, <b>Read later</b>, or say <b>Not for me</b>. Loci learns from what you skip.</p>
      <section class="rp-sec"><h2 class="rp-sh">Top pick</h2>${findCard(top, true)}</section>
      ${topics.map((t) => `<section class="rp-sec"><h2 class="qt-h">${esc(PLACES[t] ? PLACES[t].name : "Across your map")} <span>${rest.filter((f) => f.topic === t).length}</span></h2><div class="fd-grid">${rest.filter((f) => f.topic === t).map((f) => findCard(f)).join("")}</div></section>`).join("")}
      <div class="iss-left"><p><b>Left out ${leftN}:</b> ${iss.left.map(([k, w]) => `${k} ${w}`).join(" · ")}.</p><button type="button" class="rk-go" data-act="left-see">See them</button></div>
      <footer class="rp-foot">${open ? `${btn("Read the rest later", `data-act="iss-later" data-v="${iss.id}"`, "quiet")}${btn("Clear the rest", `data-act="iss-clear" data-v="${iss.id}"`, "quiet")}` : ""}<span class="rx-grow"></span>${r ? btn("Change what it looks for", `data-act="edit" data-r="${r.id}"`, "link") : ""}</footer></article>`;
  }
  function openIssue(id, from) { S.study = null; S.issue = id; S.issueFrom = from || S.open || "finds"; S.open = null; S.edit = null; S.newer = false; S.findNo = null; S.ptab = "this"; S.pop = null; C.resetScroll = true; }

  /* ================================================================ Connections: where things come from (the "apps", as in Zapier) */
  const usedBy = (pred) => ROUTINES.filter(pred).map((r) => r.name);
  function connectionsSeg() {
    const tile = (ic, name, what, state, stTxt, detail, act, used) => `<article class="cn ${state}"><div class="rk-top"><span class="rk-gl">${ic}</span><div class="rk-h"><p class="rk-k">${esc(stTxt)}</p><h3>${esc(name)}</h3></div></div><p class="rk-found">${what}</p>${detail ? `<p class="cn-d">${detail}</p>` : ""}${used && used.length ? `<p class="cn-u">Used by ${esc(andJoin(used))}</p>` : ""}<div class="rk-ft"><span></span>${act}</div></article>`;
    const sends = [
      tile(svg("whatsapp", 18), "WhatsApp", "Send photos, voice notes, PDFs and links to Studiolo's number. Loci can reply.", "ok", "Connected", "Your number: +971 50 ••• 4127 · checked with a code on 12 Oct", btn("Disconnect", 'data-act="cn" data-v="Disconnected (prototype)."', "quiet"), usedBy((r) => r.when === "whatsapp")),
      tile(svg("email", 18), "Email", "Forward PDFs, newsletters and links to your own address.", "ok", "Ready", `<code>layla.k7m2@in.studiolo.app</code>`, btn("Copy address", 'data-act="cn" data-v="Copied: layla.k7m2@in.studiolo.app"', "quiet"), usedBy((r) => r.when === "email" || (r.kind === "follow" && r.sources.some((x) => /newsletter/i.test(x))))),
      tile(svg("share", 18), "Phone share", "Share from Instagram, YouTube or Safari straight to Studiolo.", "ok", "Set up on Android", "iPhone: add the Studiolo Shortcut once.", btn("Get the iPhone Shortcut", 'data-act="cn" data-v="In the app, this opens the Shortcut."', "quiet"), usedBy((r) => r.when === "share")),
      tile(svg("browser", 18), "Browser", "Save the page you're on, with any text you selected.", "need", "Not set up", "", btn("Get the extension", 'data-act="cn" data-v="In the app, this opens the extension page."'), usedBy((r) => r.when === "browser")),
    ];
    const srcs = [...new Set(ROUTINES.filter((r) => r.kind === "follow").flatMap((r) => r.sources))];
    const later = LATER_APPS.map(([k, l, h]) => tile(`<b>${l[0]}</b>`, l, h + ".", "soon", "Coming later", "", btn("I'd use this", `data-act="cn" data-v="Noted: you'd use ${l}."`, "quiet")));
    return `<section class="rx-sec"><h2>Send to Studiolo</h2><p class="rx-sub">The ways things reach your Commonplace. Each one can start a routine.</p><div class="rk-grid">${sends.join("")}</div></section>
      <section class="rx-sec"><h2>Sources you watch <span>${srcs.length}</span></h2><p class="rx-sub">What your Finds routines read. Loci checks each one is still alive.</p>
        <ul class="cn-src">${srcs.map((x, i) => `<li><span class="rk-gl">${svg(/newsletter/i.test(x) ? "email" : /channel/i.test(x) ? "play" : "search", 15)}</span><span><b>${esc(x)}</b><em>${["New item 2 hours ago", "New item yesterday", "New item 3 days ago", "Quiet for 5 weeks: check it?"][i % 4]}</em></span><span class="rx-dim">${esc(andJoin(usedBy((r) => r.kind === "follow" && r.sources.includes(x))))}</span></li>`).join("")}</ul></section>
      <section class="rx-sec"><h2>Connected apps</h2><p class="rx-sub">Later: other apps you keep things in, as triggers for routines. Tell us which you'd use.</p><div class="rk-grid">${later.join("")}</div></section>`;
  }

  /* ================================================================ a routine's page */
  function routinePage(r) {
    const fl = flowOf(r), nA = ROUTINES.filter((x) => x.type === "arrive").length, pos = arrivePos(r);
    const waiting = W.filter((w) => w.rid === r.id);
    const step = (k, label, rows, icon) => `<div class="rp-step ${k}"><p class="rp-step-k"><span class="rk-dot">${svg(icon, 12)}</span>${label}</p><ul>${rows.length ? rows.map((x) => `<li${x.loci ? ' class="lr"' : ""}${x.mode ? ' class="md"' : ""}>${esc(x.t)}</li>`).join("") : `<li class="none">Nothing to read: plain rules only</li>`}</ul></div>`;
    const stats = [];
    if (r.type === "arrive") {
      if (r.mode === "ask") stats.push(`<div class="rp-tile">${ring(r.right[0], r.right[1])}<div><b>${r.right[1] ? `Right ${r.right[0]} of ${r.right[1]}` : "Not checked yet"}</b><span>times you checked what it suggested</span>${r.right[1] >= 5 && r.right[0] / r.right[1] >= 0.9 ? `<button type="button" class="rk-go" data-act="trust" data-r="${r.id}">Stop asking, file on its own</button>` : ""}</div></div>`);
      else stats.push(`<div class="rp-tile"><span class="rp-big">${r.filed}</span><div><b>${r.filed} filed this month</b><span>on its own · undo any in Activity</span></div></div>`);
      stats.push(`<div class="rp-tile"><span class="rp-big sm">${ord(pos)}</span><div><b>Checked ${ord(pos)} of ${nA}</b><span>when something arrives</span><span class="rp-order">${pos > 1 ? `<button type="button" class="rk-go" data-act="up" data-r="${r.id}">Move up</button>` : ""}${pos < nA ? `<button type="button" class="rk-go" data-act="down" data-r="${r.id}">Move down</button>` : ""}</span></div></div>`);
    } else {
      if (r.type === "schedule") stats.push(`<div class="rp-tile"><span class="rk-gl">${svg("schedule", 18)}</span><div><b>${r.on ? `Next: ${fNext(nextRun(r))}` : "Paused"}</b><span>${esc(everyText(r))}</span></div></div>`);
      stats.push(r.stat === "New" ? `<div class="rp-tile"><span class="rk-gl">${svg("loop", 18)}</span><div><b>Not run yet</b><span>What it did will show here</span></div></div>` : `<div class="rp-tile"><span class="rk-gl a">✓</span><div><b>${esc(cap(r.stat))}</b><span>${r.type === "schedule" ? "since it started" : "so far"}</span></div></div>`);
    }
    const late = r.lately.length ? `<ul class="rp-late">${r.lately.slice(0, 5).map((x, i) => `<li><span aria-hidden="true" class="dot s2"></span><span><b>${esc(x.t)}</b><em>${esc(x.w)}</em></span><time>${esc(x.when)}</time>${r.type === "arrive" ? `<button type="button" class="rk-go" data-act="why" data-r="${r.id}" data-i="${i}">Why?</button>` : ""}</li>`).join("")}</ul>` : `<p class="rx-sub">Nothing yet. ${r.type === "schedule" ? `It runs first ${r.on ? `on ${fNext(nextRun(r))}` : "when you turn it back on"}.` : "It starts with the next thing that fits."}</p>`;
    return `<article class="rp" aria-label="${esc(r.name)}">
      <nav class="rp-back"><button type="button" class="rx-backbtn" data-act="back">${svg("back", 14)}Routines</button></nav>
      <header class="rp-head${r.on ? "" : " paused"}"><span class="rk-gl lg">${svg(iconOf(r), 22)}</span><div class="rp-h"><p class="rk-k">${esc(GROUP[r.type])}${r.type === "arrive" ? ` · ${ord(pos)} in line` : ""}</p><h1 class="rp-title">${esc(r.name)}</h1>
        <div class="rp-meta">${stBtn(r)}${r.type === "arrive" ? `<button type="button" class="st" data-act="chip" data-r="${r.id}" data-f="mode">${esc(modeLabel(r))} ▾</button>` : ""}<span>${esc(countOf(r))}</span></div></div>
        <div class="rp-acts">${btn("Edit", `data-act="edit" data-r="${r.id}"`, "quiet")}</div></header>
      ${waiting.length ? `<button type="button" class="rx-waitline" data-act="seg" data-v="waiting"><span aria-hidden="true" class="rk-gl q sm">?</span><span><b>${plural(waiting.length, "thing")} from this routine waiting for you</b><em>${esc(waiting.map((w) => w.newTitle || w.title || "The To read pile").join(" · "))}</em></span><span aria-hidden="true">›</span></button>` : ""}
      ${r.kind === "follow" ? `<section class="rp-sec"><h2 class="rp-sh">Its Finds pages</h2>${issuesOf(r.id).length ? `<div class="rk-grid">${issuesOf(r.id).slice(0, 2).map(issueCard).join("")}</div>` : `<p class="rx-sub">None yet. The first comes ${r.on ? fNext(nextRun(r)) : "when you turn it back on"}.</p>`}<div>${btn("Check now", `data-act="check-now" data-r="${r.id}"`, "quiet")}</div></section>` : ""}
      <section class="rp-sec"><h2 class="rp-sh">What it does</h2><p class="rx-say rp-say">${sentence(r)}</p><p class="rp-note">Tap an underlined word to change it, or press <b>Edit</b> to see everything.</p></section>
      <section class="rp-sec" aria-label="How it works"><h2 class="rp-sh">Step by step</h2>${flowHTML(r, false)}<p class="rp-note">Click a step to change it.</p></section>
      ${S.builder ? builderNote(r) : ""}
      <section class="rp-stats" aria-label="How it's doing">${stats.join("")}<div class="rp-tile"><span class="rk-gl">${svg("spark", 18)}</span><div><b>${esc(costText(r))}</b><span>${S.builder ? esc(costBuilder(r)) : "What it costs to run, from your AI allowance"}</span></div></div></section>
      <section class="rp-sec"><h2 class="rp-sh">Lately</h2>${late}</section>
      ${r.type === "arrive" ? `<section class="rp-sec"><h2 class="rp-sh">With your last 20 things</h2>${tryHTML(r, 5)}</section>` : ""}
      <footer class="rp-foot">${btn(r.on ? "Pause it" : "Turn it back on", `data-act="toggle" data-r="${r.id}"`, "quiet")}${btn("Duplicate", `data-act="dupe" data-r="${r.id}"`, "quiet")}<span class="rx-grow"></span>${btn("Delete routine", `data-act="del" data-r="${r.id}"`, "link")}</footer></article>`;
  }
  const builderNote = (d) => `<p class="note rx-builder"><b>Builder:</b> ${d.type === "arrive" ? (d.ifs.some((c) => c.t === "is" || c.t === "about") || d.then.on === "best" || d.then.understand.length || d.then.learn.length ? "plain rules match where it came from and what kind it is; Loci reads each matching item for the dotted parts (one small model call each)." : "plain rules only: no model, no cost.") : "one small model call per run; skipped when nothing is new."}</p>`;

  /* ================================================================ the editor: one short form, for Edit and for New routine */
  function startEdit(d, isNew, from) {
    S.edit = { d: clone(d), id: isNew ? "new" : d.id, isNew, from: from || null, chosen: from !== "pick" }; S.issue = null; S.study = null; S.fnOpen = null; S.fnAdd = null;
    S.newer = false; S.pop = null;
    if (isNew) { S.open = null; S.ptab = "all"; } else { S.open = d.id; S.ptab = "this"; }
    C.resetScroll = true;
  }
  const chips = (f, opts, cur) => `<div class="ed-chips" role="group">${opts.map(([v, l]) => `<button type="button" class="ed-chip" data-act="ed-set" data-f="${f}" data-v="${esc(v)}" aria-pressed="${String(cur ?? "") === String(v)}">${esc(l)}</button>`).join("")}</div>`;
  const toggles = (f, opts, on) => `<div class="ed-chips" role="group">${opts.map(([v, l]) => `<button type="button" class="ed-chip ed-tog" data-act="ed-tog" data-f="${f}" data-v="${esc(v)}" aria-pressed="${on(v)}">${esc(l)}</button>`).join("")}</div>`;
  const select = (f, opts, cur, id) => `<select class="sm-select ed-sel" data-ed="${f}"${id ? ` id="${id}"` : ""}>${opts.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(cur ?? "") ? " selected" : ""}>${esc(l)}</option>`).join("")}</select>`;
  const field = (label, body, help) => `<div class="ed-f"><p class="ed-l">${label}</p><div class="ed-b">${body}${help ? `<p class="ed-help">${help}</p>` : ""}</div></div>`;
  const section = (n, title, body, note) => `<section class="ed-sec"><h2><span class="ed-n">${n}</span>${title}</h2>${note ? `<p class="ed-help">${note}</p>` : ""}${body}</section>`;
  function condsHTML(d) {
    const cs = d.ifs.filter((c) => c.t !== "kind"), free = Object.keys(COND_LABEL).filter((t) => !cs.some((c) => c.t === t));
    const row = (c) => {
      const input = c.t === "is" ? select("cond-is", IS_OPTS.map((x) => [x, x]), c.v) : c.t === "about" ? select("cond-about", TOPICS.map((p) => [p, PLACES[p].name]), c.v)
        : `<input class="sm-input ed-in" id="ed-c-${c.t}" data-edc="${c.t}" value="${esc(c.v)}" placeholder="${{ tag: "#site", site: "archdaily.com", words: "courtyard" }[c.t]}" aria-label="${COND_LABEL[c.t]}">`;
      return `<div class="ed-cond${c.t === "is" || c.t === "about" ? " lr" : ""}"><span class="ed-cond-k">${COND_LABEL[c.t]}</span>${input}<button type="button" class="icb" data-act="ed-rmc" data-v="${c.t}" aria-label="Remove “${COND_LABEL[c.t]}”" title="Remove">${svg("close", 14)}</button></div>`;
    };
    return `${cs.map(row).join("")}${free.length ? `<div class="ed-add"><span>Add:</span>${free.map((t) => `<button type="button" class="ed-chip ed-addc" data-act="ed-addc" data-v="${t}">+ ${COND_ADD[t]}</button>`).join("")}</div>` : ""}`;
  }
  /* ---------- the flow: a routine as steps, like Zapier. One registry serves the builder, the cost line and (in the app)
     the worker: a trigger, then steps that read the item (Loci), check it, and act on it. */
  const SEND_APPS = [["whatsapp", "WhatsApp", "Photos, voice notes, PDFs, links"], ["email", "Email", "Forward PDFs, newsletters and links"], ["share", "Phone share", "From Instagram, YouTube, Safari…"], ["browser", "Browser", "The page you're on"], ["any", "Anywhere", "However it arrives"]];
  const WATCH_APPS = [["watch:feeds", "Websites and journals", "New articles and papers", "search"], ["watch:newsletters", "Newsletters", "The ones you forward to Studiolo", "email"], ["watch:youtube", "YouTube channels", "New talks and videos", "play"]];
  const TIME_APPS = [["schedule", "Schedule", "Every day, a weekday, or monthly", "schedule"]];
  const IN_APPS = [["lumen", "Finish a Lumen", "Follow up when it's worth testing", "lumen"], ["dup", "Save something twice", "Catch what you already have", "dup"], ["question", "Add a question", "Look for answers to it", "doc", true], ["goal", "Set a goal", "Plan the steps toward it", "loop", true]];
  const LATER_APPS = [["zotero", "Zotero", "Papers you add"], ["readwise", "Readwise", "Your highlights"], ["drive", "Google Drive", "Files in a folder"], ["raindrop", "Raindrop", "Your bookmarks"], ["calendar", "Calendar", "Before a meeting or site visit"]];
  const CONN = { whatsapp: ["ok", "Connected"], email: ["ok", "Your address is ready"], share: ["ok", "Set up on Android"], browser: ["need", "Not set up"], any: ["ok", ""] };
  const trigKey = (d) => (d.type === "arrive" ? d.when : d.kind === "follow" ? "watch:" + (d.watch || "feeds") : d.type === "schedule" ? "schedule" : d.kind);
  const famOf = (k) => (SEND_APPS.some((a) => a[0] === k) ? "arrive" : k.startsWith("watch:") ? "follow" : k === "schedule" ? "schedule" : k === "lumen" || k === "dup" ? k : "other");
  const famOfD = (d) => (d.type === "arrive" ? "arrive" : d.kind === "follow" ? "follow" : d.type === "schedule" ? "schedule" : d.kind);
  function pickTrigger(E, k) {
    const fam = famOf(k), keepName = E.d.name;
    if (fam !== famOfD(E.d) || !E.chosen) {
      if (fam === "arrive") E.d = blank("arrive");
      else if (fam === "follow") { E.d = blank("schedule"); edSet(E.d, "skind", "follow"); E.d.every = "day"; }
      else if (fam === "schedule") E.d = blank("schedule");
      else E.d = { ...blank("after"), kind: k, name: k === "dup" ? "Saved twice" : "" };
      if (!E.isNew) E.d.name = keepName;
    }
    const d = E.d;
    if (fam === "arrive") d.when = k;
    if (fam === "follow") { d.watch = k.slice(6); d.sources = { feeds: SOURCES.slice(0, 4), newsletters: ["Design-tools newsletter"], youtube: ["Conference channel"] }[d.watch]; if (d.watch === "youtube") d.kinds = ["video"]; }
    E.chosen = true; S.fnOpen = null;
  }
  function trigPicker(d) {
    const E = S.edit, cur = E && E.chosen ? trigKey(d) : null, fam = famOfD(d);
    const tile = ([k, l, h, ic, soon], later) => {
      const locked = later || soon || (E && !E.isNew && famOf(k) !== fam), st = CONN[k];
      return `<button type="button" class="tp-app${cur === k ? " on" : ""}" data-act="ed-trig" data-v="${k}"${locked ? " disabled" : ""}${E && !E.isNew && !later && !soon && famOf(k) !== fam ? ' title="Make a new routine for this"' : ""}><span class="tp-ic">${later ? `<b>${l[0]}</b>` : svg(ic || k, 17)}</span><span class="tp-t"><b>${l}</b><em>${h}</em></span>${later || soon ? '<i class="tp-soon">Soon</i>' : st && st[1] ? `<i class="tp-st ${st[0]}">${st[1]}</i>` : ""}</button>`;
    };
    const grp = (title, list, later) => `<p class="tp-h">${title}</p><div class="tp-grid">${list.map((a) => tile(a, later)).join("")}</div>`;
    return `<div class="tp">${grp("Send to Studiolo", SEND_APPS)}${grp("Watch sources", WATCH_APPS)}${grp("On a schedule", TIME_APPS)}${grp("In Studiolo", IN_APPS)}${grp("Connected apps", LATER_APPS, true)}</div>`;
  }
  const UND_HELP = { describe: "Loci looks at the photo and writes two lines, so you can search for it later.", transcribe: "Speech-to-text, then the questions you asked are pulled out.", summary: "The text is pulled out, then summed up in three lines.", book: "Loci reads the cover or page and looks the book up in a library catalogue.", recipe: "Keeps the ingredients and steps; leaves the rest of the post.", links: "Every link in the caption is saved as its own thing." };
  const whatOf = (d) => {
    const f = (t) => condOf(d, t), k = f("kind"), is = f("is");
    let w = k ? cap(KIND_WORD[k]) : is ? `Anything that's ${is}` : "Anything";
    if (f("tag")) w += ` with ${f("tag")}`; if (f("site")) w += ` from ${f("site")}`; if (f("words")) w += ` mentioning “${f("words")}”`;
    if (k && is) w += `, if it's ${is}`; if (f("about")) w += ` about ${PLACES[f("about")].name}`;
    return w;
  };
  // the steps of a routine, in order; each has a header (always shown) and a body (shown when open in the editor)
  function flowNodes(d) {
    const N = [], add = (n) => N.push(n), every = () => chips("every", [["day", "Every day"], ["weekdays", "Weekdays"], ...[1, 2, 3, 4, 5, 6, 0].map((x) => ["w" + x, DAYLONG[x].slice(0, 3)]), ["month", "Monthly"]], d.every) + (d.every === "month" ? `<p class="ed-help">On the 1st, at 9:00.</p>` : `<label class="ed-time"><span>At</span><input class="sm-input" type="time" id="ed-time" value="${esc(d.time)}"></label>`);
    if (d.type === "arrive") {
      const t = d.then;
      add({ key: "trigger", cls: "trig", tag: "When", icon: d.when, title: { whatsapp: "I send something on WhatsApp", email: "I email something to Studiolo", share: "I share something from my phone", browser: "I save something from the browser", any: "I send something, from anywhere" }[d.when], body: () => trigPicker(d) });
      add({ key: "filter", cls: "filt", tag: "Only if", icon: "filter", title: whatOf(d), warn: !d.ifs.length, body: () => field("What kind", chips("kind", [["", "Anything"], ...ITEM_KINDS.map((k) => [k, cap(k)])], condOf(d, "kind") || "")) + field("And", condsHTML(d), "Optional. Each one narrows it down. Dotted ones need Loci to read the item.") });
      t.understand.filter((u) => UND_VERB[u]).forEach((u) => add({ key: "und:" + u, cls: "loci", tag: "Loci", icon: "spark", title: UND_VERB[u], body: () => `<p class="ed-help">${UND_HELP[u]}</p>`, remove: true }));
      t.learn.forEach((l) => add({ key: "lrn:" + l, cls: "loci", tag: "Loci", icon: "spark", title: LRN_VERB[l] || l, body: () => `<p class="ed-help">${l === "lumen" ? "When something fits, Loci offers a Lumen on it. A Lumen costs more than a routine, so it always asks first." : "Questions you ask in it go to Questions and goals, linked to where you asked them."}</p>`, remove: true }));
      add({ key: "file", cls: "act", tag: "Then", icon: "out", title: [t.fileAs ? `File it as ${t.fileAs}` : "File it", t.on === "best" ? "on the topic it's about" : t.on ? `on ${PLACES[t.on].name}` : "", t.addTo === "project" ? "in the prayer hall project" : "", t.status ? `mark it ${t.status}` : ""].filter(Boolean).join(", "), body: () => field("File it as", select("fileAs", [["", "Keep the kind it came as"], ...FILE_AS.map((x) => [x, x])], t.fileAs)) + field("On", select("on", [["best", "The topic it's about (Loci works it out)"], ...TOPICS.map((p) => [p, PLACES[p].name]), ["", "No topic"]], t.on)) + field("Mark it", chips("status", [["", "Nothing"], ["To read", "To read"], ["Reading", "Reading"]], t.status)) + field("Also add to", chips("addTo", [["", "Nothing else"], ["project", "The prayer hall project"]], t.addTo)) });
      add({ key: "mode", cls: "chk", tag: "Before it files", icon: "check", title: d.mode === "ask" ? "Ask me first" : "File it on its own", body: () => `<div class="ed-radios">${[["ask", "Ask me first", "You check each one. Once it's right 9 times out of 10, Loci offers to stop asking."], ["own", "File on its own", "It files straight away. You can undo anything from Activity."]].map(([v, l, h]) => `<button type="button" class="ed-radio" data-act="ed-set" data-f="mode" data-v="${v}" aria-pressed="${d.mode === v}"><b>${l}</b><span>${h}</span></button>`).join("")}</div>` });
      if (t.reply === "confirm") add({ key: "reply", cls: "act", tag: "Then", icon: "whatsapp", title: "Tell me on WhatsApp", body: () => `<p class="ed-help">A one-line reply once it's filed. Since October 2026 each reply costs Studiolo about half a cent, so replies are a step you add, not the default.</p>`, remove: true });
    } else if (d.kind === "follow") {
      add({ key: "trigger", cls: "trig", tag: "When", icon: "search", title: `${everyText(d)}, check ${plural(d.sources.length, "source")}`, body: () => trigPicker(d) + field("Sources", toggles("src", [...new Set([...SOURCES, ...d.sources])].map((x) => [x, x]), (v) => d.sources.includes(v)) + `<div class="ed-addsrc"><input class="sm-input ed-in" id="ed-src" placeholder="Add a website, newsletter, journal or channel" aria-label="Add a source">${btn("Add", 'data-act="ed-addsrc"', "quiet")}</div>`) + field("How often", every()) });
      add({ key: "filter", cls: "filt", tag: "Only if", icon: "filter", title: `It's new, and about ${d.label || PLACES[d.place].name}: ${kindsText(d)}`, body: () => field("Subject", `<input class="sm-input ed-in" id="ed-label" value="${esc(d.label || "")}" placeholder="e.g. AI in architecture" aria-label="Subject">`, "In your own words. Leave it empty to follow a topic as a whole.") + field("Sort onto", select("place", [["you", "Whichever topic fits (my whole map)"], ...TOPICS.slice(0, 5).map((p) => [p, PLACES[p].name])], d.place)) + field("Look for", toggles("fkind", FIND_KINDS, (v) => (d.kinds || []).includes(v))) + `<p class="ed-help">Anything already in your Commonplace, and the same story from two sources, is left out in code, before Loci reads anything.</p>` });
      add({ key: "rank", cls: "loci", tag: "Loci", icon: "spark", title: `Keep the best ${d.count}, sum each one up, and say why it's for you`, body: () => field("How many", chips("count", [["3", "Up to 3"], ["6", "Up to 6"], ["10", "Up to 10"]], d.count)) + `<p class="ed-help">One small-model call per run, against your topics, open questions and goals. A run with nothing new makes no call.</p>` });
      add({ key: "dest", cls: "act", tag: "Then", icon: "out", title: d.dest === "toread" ? "Save them all, marked To read" : "Bring them to a Finds page", body: () => `<div class="ed-radios">${[["page", "On a Finds page", "You look through them and keep what's useful."], ["toread", "Straight into To read", "Everything it finds is saved and marked To read."]].map(([v, l, h]) => `<button type="button" class="ed-radio" data-act="ed-set" data-f="dest" data-v="${v}" aria-pressed="${(d.dest || "page") === v}"><b>${l}</b><span>${h}</span></button>`).join("")}</div>` });
      add({ key: "today", cls: "act", tag: "Then", icon: "loop", title: "Put a card on Today" });
    } else if (d.type === "schedule") {
      add({ key: "trigger", cls: "trig", tag: "When", icon: "schedule", title: everyText(d), body: () => trigPicker(d) + field("How often", every()) });
      add({ key: "job", cls: "loci", tag: "Loci", icon: "spark", title: { tidy: "Go through what's in Unsorted", review: `Find what slipped at ${PLACES[d.place]?.name}`, pile: "Find what's sat in To read for three months" }[d.kind], body: () => (S.edit && S.edit.isNew ? field("Job", chips("skind", [["tidy", "Sort Unsorted"], ["review", "Quiz me on what slipped"], ["pile", "Clear the To read pile"]], d.kind)) : "") + (d.kind === "review" ? field("Topic", select("place", TOPICS.slice(0, 5).map((p) => [p, PLACES[p].name]), d.place)) : "") });
      add({ key: "act", cls: "act", tag: "Then", icon: "out", title: { tidy: d.mode === "ask" ? "Ask me about each thing" : "File what it's sure of, and ask me about the rest", review: `Ask me ${d.count} questions on Today`, pile: "Ask me: read it, keep it, or let it go" }[d.kind], body: () => (d.kind === "tidy" ? field("When Loci is sure", chips("tidymode", [["own", "File it, and ask me about the rest"], ["ask", "Ask me about each thing"]], d.mode)) : d.kind === "review" ? field("How many", chips("count", [["3", "3 questions, about two minutes"], ["5", "5 questions, about four minutes"]], d.count)) : `<p class="ed-help">Nothing to set.</p>`) });
    } else if (d.kind === "lumen") {
      add({ key: "trigger", cls: "trig", tag: "When", icon: "lumen", title: "I finish a Lumen", body: () => trigPicker(d) });
      add({ key: "wait", cls: "chk", tag: "Wait", icon: "schedule", title: { "the next day": "Wait a day", "three days later": "Wait three days", "a week later": "Wait a week" }[d.delay], body: () => chips("delay", [["the next day", "A day"], ["three days later", "Three days"], ["a week later", "A week"]], d.delay) });
      add({ key: "act", cls: "act", tag: "Then", icon: "out", title: "Bring its check back to Today" });
    } else {
      add({ key: "trigger", cls: "trig", tag: "When", icon: "dup", title: "I send something I already have", body: () => trigPicker(d) });
      add({ key: "cmp", cls: "loci", tag: "Check", icon: "spark", title: "Compare it with my Commonplace (in code: link, DOI, title)" });
      add({ key: "act", cls: "act", tag: "Then", icon: "out", title: "Keep the one I have, and tell me" });
    }
    return N;
  }
  // steps that can be added with +, for each kind of routine
  function stepMenu(d) {
    if (d.type !== "arrive") return [];
    const t = d.then, o = [];
    [["describe", "Describe it"], ["transcribe", "Write out what I said"], ["summary", "Sum it up in three lines"], ["book", "Find the book"], ["recipe", "Keep just the recipe"], ["links", "Keep the links in its caption"]].forEach(([v, l]) => { if (!t.understand.includes(v)) o.push(["und:" + v, l, "Loci reads it", "spark"]); });
    if (!t.learn.includes("questions")) o.push(["lrn:questions", "Turn my questions into @questions", "Loci reads it", "spark"]);
    if (!t.learn.includes("lumen")) o.push(["lrn:lumen", "Offer to make a Lumen from it", "Asks first", "spark"]);
    if (d.when === "whatsapp" && t.reply !== "confirm") o.push(["reply", "Tell me on WhatsApp", "About half a cent a reply", "whatsapp"]);
    if (t.addTo !== "project") o.push(["project", "Add it to a project", "Free", "out"]);
    if (!t.status) o.push(["toread", "Mark it To read", "Free", "out"]);
    return o;
  }
  // what a routine costs, from the study's unit costs (routines-study/cost-model.mjs); the learner sees a share of the allowance
  const ALLOWANCE = MONTHLY; // costs show as a share of the whole monthly allowance; routines may use up to $2 of it (RT-7)
  function costOf(d) {
    if (d.type === "arrive") {
      const n = Math.max(1, Math.round((hitsOf(d).length / 20) * 120)), t = d.then;
      const U = { describe: 0.0003, transcribe: 0.0038, summary: 0.001, book: 0.0001, recipe: 0.0002, links: 0 };
      let per = d.ifs.some((c) => c.t === "is" || c.t === "about") || t.on === "best" ? 0.0001 : 0;
      t.understand.forEach((u) => { per += U[u] || 0; });
      if (t.learn.includes("questions")) per += 0.0001;
      if (t.learn.includes("lumen")) per += 0.013; // a Lumen is about $0.13; say 1 in 10 offers is taken
      if (t.reply === "confirm") per += 0.005;
      return { m: n * per, n, unit: "things a month" };
    }
    const runs = d.type === "after" ? 0 : d.every === "month" ? 1 : d.every === "day" ? 30 : d.every === "weekdays" ? 22 : 4;
    const unit = d.kind === "follow" ? (0.0013 * (d.count || 6)) / 6 : d.kind === "tidy" || d.kind === "review" ? 0.0003 : 0;
    return { m: runs * unit, n: runs, unit: "runs a month" };
  }
  const costText = (d) => { const c = costOf(d).m; if (c === 0) return "Free: plain rules, no AI"; const pct = (c / ALLOWANCE) * 100; return pct < 1 ? "Under 1% of your monthly allowance" : `About ${Math.round(pct)}% of your monthly allowance`; };
  const costBuilder = (d) => { const c = costOf(d); return `$${c.m < 0.01 ? c.m.toFixed(4) : c.m.toFixed(2)} a month, at about ${c.n} ${c.unit}`; };
  function flowHTML(d, edit) {
    const nodes = flowNodes(d), E = S.edit, menu = edit ? stepMenu(d) : [];
    const head = (n, i) => `<span class="fn-ic">${svg(n.icon === "filter" ? "filter" : n.icon === "check" ? "check" : n.icon, 18)}</span><span class="fn-txt"><em>${i + 1} · ${esc(n.tag)}</em><b>${esc(n.title)}</b></span>${n.warn ? '<i class="fn-warn">Needs a kind or a condition</i>' : n.cls === "loci" && n.key !== "cmp" ? '<i class="fn-tag">Loci reads it</i>' : ""}`;
    if (edit && E.isNew && !E.chosen) return `<ol class="fl"><li class="fn trig open"><div class="fn-head static">${head({ icon: "plus", tag: "When", title: "Choose what starts it" }, 0)}</div><div class="fn-body">${trigPicker(d)}</div></li><li class="fn-link" aria-hidden="true"></li><li class="fn ghost"><div class="fn-head static"><span class="fn-ic">${svg("out", 18)}</span><span class="fn-txt"><em>2 · Then</em><b>Choose a trigger first</b></span></div></li></ol>`;
    const plus = (i) => edit && menu.length ? `<li class="fn-link"><button type="button" class="fn-plus" data-act="fn-add" data-v="${i}" aria-label="Add a step here" aria-expanded="${S.fnAdd === i}">${svg("plus", 13)}</button></li>${S.fnAdd === i ? `<li class="fn-menu" role="menu"><p class="tp-h">Add a step</p>${menu.map(([v, l, h, ic]) => `<button type="button" class="fn-opt" role="menuitem" data-act="fn-step" data-v="${v}"><span class="tp-ic">${svg(ic, 15)}</span><span class="tp-t"><b>${esc(l)}</b><em>${esc(h)}</em></span></button>`).join("")}</li>` : ""}` : `<li class="fn-link" aria-hidden="true"></li>`;
    return `<ol class="fl${edit ? "" : " ro"}">${nodes.map((n, i) => {
      const open = edit && S.fnOpen === n.key && n.body;
      const h = edit ? (n.body ? `<button type="button" class="fn-head" data-act="fn-open" data-v="${n.key}" aria-expanded="${!!open}">${head(n, i)}<span class="fn-chev" aria-hidden="true">${svg("fold", 15)}</span></button>` : `<div class="fn-head static">${head(n, i)}</div>`) : `<button type="button" class="fn-head" data-act="edit-at" data-r="${d.id}" data-v="${n.key}" title="Change this step">${head(n, i)}</button>`;
      return `<li class="fn ${n.cls}${open ? " open" : ""}${n.warn ? " warn" : ""}">${h}${open ? `<div class="fn-body">${n.body()}${n.remove ? `<div><button type="button" class="button button-link rx-danger" data-act="fn-rm" data-v="${n.key}">Remove this step</button></div>` : ""}</div>` : ""}</li>${i < nodes.length - 1 ? plus(i) : ""}`;
    }).join("")}${edit && menu.length ? plus(nodes.length) : ""}</ol>`;
  }
  function editorView() {
    const E = S.edit, d = E.d, orig = E.isNew ? null : RR(E.id);
    const ok = !E.isNew || E.chosen ? d.type !== "arrive" || d.ifs.length > 0 : false;
    const hits = d.type === "arrive" && ok ? hitsOf(d).length : null;
    return `<article class="rp ed" aria-label="${E.isNew ? "New routine" : "Edit " + esc(orig.name)}">
      <nav class="rp-back"><button type="button" class="rx-backbtn" data-act="ed-cancel">${svg("back", 14)}${E.isNew ? "Back" : esc(orig.name)}</button></nav>
      <header class="ed-head"><p class="rk-k">${E.isNew ? "New routine" : "Editing"}</p><input class="ed-title" id="ed-name" value="${esc(d.name)}" placeholder="${esc(E.chosen || !E.isNew ? autoNameAny(d) : "Name it, or let Loci name it")}" aria-label="Name"></header>
      ${E.chosen || !E.isNew ? `<div class="ed-live" aria-live="polite"><p class="ed-live-k">${svg("loop", 13)}It will</p><p class="rx-say">${still(d)}</p><p class="ed-live-n${ok ? "" : " warn"}">${d.type === "arrive" ? (ok ? `${hits} of your last 20 things would have fitted it. ` : "Choose a kind or add a condition. With neither, it would catch everything you send. ") : ""}${ok ? `<span class="ed-cost">${esc(costText(d))}${S.builder ? ` · ${esc(costBuilder(d))}` : ""}</span>` : ""}</p></div>` : `<p class="iss-how">Start with what starts it, as in Zapier or Make: something you send, sources to watch, a time, or something you do in Studiolo. Then add what Loci does, and where it goes.</p>`}
      ${flowHTML(d, true)}
      <div class="ed-bar">${btn(E.isNew ? "Turn it on" : "Save changes", `data-act="ed-save"${ok ? "" : " disabled"}`)}${btn("Cancel", 'data-act="ed-cancel"', "quiet")}<span class="rx-grow"></span><span class="ed-tip">Click a step to change it, or tell Loci →</span></div></article>`;
  }
  function edSet(d, f, v) {
    if (f === "when") { d.when = v; if (v !== "whatsapp") d.then.reply = ""; }
    else if (f === "kind") { d.ifs = d.ifs.filter((c) => c.t !== "kind"); if (v) d.ifs.unshift({ t: "kind", v }); }
    else if (f === "status" || f === "addTo") { d.then[f] = v; if (f === "addTo" && v === "project" && d.then.on === "best") d.then.on = ""; }
    else if (f === "mode" || f === "tidymode") d.mode = v;
    else if (f === "every") { d.every = v; if (v === "month") d.time = "09:00"; else if (!d.time) d.time = "08:00"; }
    else if (f === "count") d.count = Number(v);
    else if (f === "delay") d.delay = v;
    else if (f === "dest") d.dest = v;
    else if (f === "skind") {
      d.kind = v;
      if (v === "tidy") Object.assign(d, { mode: "own" });
      if (v === "follow") Object.assign(d, { place: "you", label: "", sources: SOURCES.slice(0, 4), kinds: FIND_KINDS.map((k) => k[0]), count: 6, dest: "page", time: "07:30" });
      if (v === "review") Object.assign(d, { place: "precast", count: 3 });
    }
  }
  function addRoutine(d) {
    const r = { ...clone(d), id: "r" + ++rid, on: true };
    if (!r.name) r.name = autoNameAny(r);
    if (r.type === "arrive") { r.right = [0, 0]; r.filed = 0; r.lately = []; ROUTINES.unshift(r); }
    else { r.stat = "New"; r.lately = []; const k = ROUTINES.findIndex((x) => x.type === r.type); ROUTINES.splice(k < 0 ? ROUTINES.length : k, 0, r); }
    return r;
  }

  /* ================================================================ New routine: three ways in */
  function newView() {
    const types = [["arrive", "When I send something", "File what arrives from WhatsApp, email, your phone or the browser.", "any"], ["follow", "Find new things for me", "Watch sources for a subject, and bring finds to a page.", "search"], ["schedule", "On a schedule", "Sort Unsorted, or quiz you on what slipped.", "schedule"], ["after", "After I do something", "Follow up after a Lumen.", "lumen"]];
    const tplCard = (d, i) => `<article class="rk ghost tpl"><button type="button" class="rx-hit" data-act="tpl" data-v="${i}" aria-label="Use “${esc(d.name)}”"></button><div class="rk-top"><span class="rk-gl">${svg(iconOf(d), 18)}</span><div class="rk-h"><p class="rk-k">${esc(GROUP[d.type])}</p><h3>${esc(d.name)}</h3></div></div>
      <ul class="rk-rows">${cardRows(d).map(([k, t]) => `<li class="${k}"><span class="rk-dot">${svg({ when: "in", loci: "spark", then: "out" }[k], 12)}</span><span class="rk-t">${esc(t)}</span></li>`).join("")}</ul><div class="rk-ft"><span class="rk-stat">${d.type === "arrive" ? `${hitsOf(d).length} of your last 20 would fit` : "A template"}</span><span class="st active">Use ›</span></div></article>`;
    return `<article class="rp nr" aria-label="New task">
      <nav class="rp-back"><button type="button" class="rx-backbtn" data-act="back">${svg("back", 14)}Tasks</button></nav>
      <header class="rp-head"><span class="rk-gl lg">${svg("plus", 22)}</span><div class="rp-h"><p class="rk-k">New task</p><h1 class="rp-title">What should Loci do for you?</h1><p class="rp-lead">Once, in depth: a study. Or every time something happens: a routine. You'll see what it would do, and what it costs, before anything starts.</p></div></header>
      <section class="nr-way nr-study"><p class="rk-k">Once, in depth</p><h2>Study something in depth</h2><p>Loci plans it with you, researches it for 20 minutes to an hour, and builds you a course. You don't wait: it's on Today when it's ready.</p>
        <form class="nr-st" data-form="study"><label class="visually-hidden" for="st-subject">What do you want to understand?</label><input id="st-subject" class="sm-input" type="text" placeholder="What do you want to understand?" autocomplete="off"><button type="submit" class="button" data-act="st-begin">Plan it with Loci</button></form>
        <div class="ed-chips">${["Acoustics of large domed rooms", "Mashrabiya and daylight in prayer halls", "Precast concrete for curved façades"].map((x) => `<button type="button" class="ed-chip" data-act="st-idea" data-v="${esc(x)}">${esc(x)}</button>`).join("")}</div></section>
      <h2 class="nr-or">Or make a routine: something Loci does every time</h2>
      <div class="nr-ways">
        <section class="nr-way"><p class="rk-k">Easiest</p><h2>Tell Loci</h2><p>Say it the way you'd tell an assistant. Loci asks only what's missing, then shows you the routine.</p>
          <div class="ed-chips">${["When I email myself a PDF, sum it up in three lines and put it on its topic", "Every evening, sort what I haven't sorted"].map((x) => `<button type="button" class="ed-chip" data-act="idea" data-v="${esc(x)}">${esc(x)}</button>`).join("")}</div>
          <div>${btn("Tell Loci", 'data-act="tell"')}</div></section>
        <section class="nr-way"><p class="rk-k">Step by step</p><h2>Set it up yourself</h2><p>Choose what starts it, then add steps: what Loci does, and where it goes. <button type="button" class="rk-go" data-act="pick">Choose a trigger ›</button></p>
          <div class="nr-types">${types.map(([t, l, h, ic]) => `<button type="button" class="nr-type" data-act="blank" data-v="${t}"><span class="rk-gl">${svg(ic, 18)}</span><span><b>${l}</b><em>${h}</em></span><span aria-hidden="true">›</span></button>`).join("")}</div></section>
      </div>
      <section class="rx-sec"><h2>Or start from one of these</h2><p class="rx-sub">Each opens in the form, ready to change.</p><div class="rk-grid">${TPL.map(tplCard).join("")}</div></section></article>`;
  }


  /* ================================================================ studies: a card, a page while it works, a page when it's done */
  const TPS = 4; // ticks per phase in the prototype's simulated clock
  let CLK = 11; const clk = () => `08:${String(Math.min(59, ++CLK)).padStart(2, "0")}`; // minutes past 8 for live events
  const stepsOf = (st) => [{ k: "plan" }, ...st.segs.map((s, i) => ({ k: "seg", i })), { k: "write" }, ...(st.depth === "deep" ? [{ k: "check" }] : [])];
  const stPct = (st) => (st.state === "done" ? 100 : Math.min(99, Math.round(((st.step + st.tick / TPS) / stepsOf(st).length) * 100)));
  const stLeft = (st) => Math.max(1, Math.round(st.mins * (1 - stPct(st) / 100)));
  const stPhase = (st) => { const p = stepsOf(st)[st.step]; if (!p) return "Finishing"; return p.k === "seg" ? `Researching question ${p.i + 1} of ${st.segs.length}` : { plan: "Planning", write: "Writing the course", check: "Checking the course" }[p.k]; };
  const stNext = (st) => st.lessons?.[st.done || 0];
  const stCost = (st) => st.cost || costFor(st.depth, st.segs.length, st.mine);
  const stCap = (st) => Math.ceil(stCost(st) * 1.5 * 2) / 2;
  const lessonsTxt = (st) => st.lessons ? `${plural(st.lessons.length, "lesson")}, about ${st.lessons.reduce((a, l) => a + l.min, 0)} minutes` : `about ${plural(st.segs.length + 2, "lesson")}`;
  function lineFor(st) {
    const p = stepsOf(st)[st.step], i = st.tick;
    if (!p) return "Finishing";
    if (p.k === "seg") { const s = st.segs[p.i]; return [`Searched journals and books: “${s.words || s.q.toLowerCase()}”`, `Read ${4 + (p.i % 3)} sources${st.mine ? "" : `, ${p.i % 2} from your Commonplace`}`, `Kept ${s.kept} sources, and noted what they agree on`, `Wrote up question ${p.i + 1}`][i] || ""; }
    if (p.k === "write") return [`Outlined the course: ${lessonsTxt(st).split(",")[0]}`, "Gave each lesson one thing you'll be able to do", "Chose a source for each lesson", "Saved the readings to your Commonplace"][i] || "";
    if (p.k === "check") return ["Checked every lesson has a source", `Checked it fits ${st.time} hours a week`, "One lesson was too long, so it was split", "Passed the check"][i] || "";
    return "Plan agreed";
  }
  function resultsFor(st) {
    if (st.special === "acoustics") return clone(ACOUSTICS);
    const names = ["The ideas everything rests on", "How it's done in practice", "Where it's been done well", "What's argued about", "How it applies to your work"];
    const confs = ["Sure", "Sure", "Mostly", "Mixed", "Thin"];
    const found = st.segs.map((s, i) => ({ q: s.q, a: `${names[i] || "What Loci found"}: in the app, two or three sentences with their sources (example).`, conf: confs[i] || "Mostly", n: s.kept }));
    const lessons = [...(st.know === "new" ? [{ t: `${st.short}: the basics`, win: "Know the words and the main ideas", f: "Watch", min: 5, src: "An introductory book (example)" }] : []),
      ...st.segs.map((s, i) => ({ t: s.q, win: `Explain ${s.q.toLowerCase()}, with an example`, f: i % 2 ? "Read" : "Watch", min: i % 2 ? 8 : 5, src: `${s.kept} sources from question ${i + 1} (examples)` })),
      { t: "Put it together", win: st.use === "project" ? "Apply it to the prayer hall, with a reason for each choice" : "Explain it to someone else in five minutes", f: "Read", min: 10, src: "This study's notes", check: true }];
    const kept = st.segs.reduce((a, s) => a + s.kept, 0);
    return { found, lessons, read: kept * 2 + 5, kept, mine: st.mine ? kept : 2, readings: Math.min(kept, 9), collection: `Study: ${st.short}`, cost: costFor(st.depth, st.segs.length, st.mine) * 0.95,
      tokens: st.depth === "deep" ? "2.8 million tokens in, 120 thousand out · 40 searches · 50 minutes" : "0.9 million tokens in, 50 thousand out · 15 searches · 20 minutes",
      questions: [`What would change if the prayer hall were twice the size?`, `Which part of ${st.short.toLowerCase()} is still argued about?`].slice(0, st.use === "project" ? 2 : 1),
      sources: [["An introductory book (example)", "Book", ""], ["A review paper (example)", "Paper · journal", ""], ["Something you saved (example)", "From your Commonplace", "mine"]] };
  }
  function finishStudy(st) {
    const t = clk(); st.state = "done"; st.seen = false; st.ready = `Today, ${t.replace(/^0/, "")}`; st.done = 0;
    Object.assign(st, resultsFor(st));
    ACT.unshift({ day: "Today", t, sid: st.id, what: `finished: a course of ${plural(st.lessons.length, "lesson")}, ${st.readings} readings saved`, state: "study", live: true });
    toast(`Your study “${st.short}” is ready: a course of ${plural(st.lessons.length, "lesson")}.`);
  }
  function advance(st) {
    st.tick++;
    if (st.tick >= TPS) { st.tick = 0; st.step++; }
    if (st.step >= stepsOf(st).length) { finishStudy(st); return; }
    const l = lineFor(st); if (l && l !== st.log[0]) st.log.unshift(l);
  }
  function openStudy(id) { const st = studyById(id); if (!st) return; S.study = id; S.open = null; S.issue = null; S.edit = null; S.newer = false; S.ptab = "this"; S.pop = null; if (st.state === "done") st.seen = true; C.resetScroll = true; }

  function studyCard(st) {
    const run = st.state === "running" || st.state === "stopped", fresh = st.state === "done" && !st.seen;
    const cls = ["rk", "stc", run ? "running" : fresh ? "ready" : "", st.state === "stopped" ? "paused" : ""].filter(Boolean).join(" ");
    const kick = `Study · ${DEPTHS[st.depth].label} · ${st.state === "stopped" ? "stopped" : run ? "working" : fresh ? "ready" : "done"}`;
    const rows = [["when", `Once · started ${st.started.replace(/^Today, /, "")}`], ["loci", run ? stPhase(st) : `Read ${st.read} sources, kept ${st.kept}`], ["then", run ? `A course of ${lessonsTxt(st)}` : `A course of ${lessonsTxt(st)}, in Learn`]];
    const nx = stNext(st);
    const next = run ? `<p class="rk-next"><b>${st.state === "stopped" ? "Stopped" : "Now"}</b><span>${esc(st.log[0] || "Starting")}</span></p><div class="stc-bar" role="progressbar" aria-valuenow="${stPct(st)}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(st.short)}: ${stPct(st)}% done"><i style="width:${stPct(st)}%"></i></div>`
      : fresh ? `<p class="rk-next ready"><b>Ready</b><span>Your course is ready to start.</span></p>`
      : `<p class="rk-next"><b>Course</b><span>${nx ? `Lesson ${(st.done || 0) + 1} of ${st.lessons.length}: ${esc(nx.t)}` : "All lessons done"}</span></p>`;
    const ft = run ? `<span class="gprog">${stPct(st)}% · ${st.state === "stopped" ? "paused" : `about ${plural(stLeft(st), "minute")} left`}</span><span class="st active">${st.state === "stopped" ? "Stopped" : "Working"} ›</span>`
      : `<span class="rk-stat">${plural(st.lessons.length, "lesson")} · ${st.readings} readings</span><span class="st active">Open ›</span>`;
    return `<article class="${cls}" data-st="${st.id}"><button type="button" class="rx-hit" data-act="open-study" data-v="${st.id}" aria-label="Open the study “${esc(st.short)}”"></button>
      <div class="rk-top"><span class="rk-gl">${svg("study", 18)}</span><div class="rk-h"><p class="rk-k">${esc(kick)}</p><h3>${esc(st.short)}</h3></div></div>
      <ul class="rk-rows">${rows.map(([k, t]) => `<li class="${k}"><span class="rk-dot">${svg({ when: "in", loci: "spark", then: "out" }[k], 12)}</span><span class="rk-t">${esc(t)}</span></li>`).join("")}</ul>
      ${next}<div class="rk-ft">${ft}</div></article>`;
  }
  function studiesSec() {
    return `<section class="rx-sec" aria-labelledby="rx-g-study"><h2 id="rx-g-study">Studies <span>${STUDIES.length}</span></h2><p class="rx-sub">Long pieces of work Loci does once, in depth, while you get on with your day. Each ends in a course.</p>
      <div class="rk-grid">${STUDIES.map(studyCard).join("")}<button type="button" class="rk ghost rx-addfind" data-act="new-study"><span class="rk-gl">${svg("plus", 18)}</span><b>Study something in depth</b><span>Loci plans it, researches it and builds you a course</span></button></div></section>`;
  }
  function studyPage(st) {
    const run = st.state !== "done", steps = stepsOf(st);
    const back = `<nav class="rp-back"><button type="button" class="rx-backbtn" data-act="back">${svg("back", 14)}Tasks</button></nav>`;
    const builder = S.builder ? `<p class="sp-builder"><b>Builder</b> One Managed Agents session: an Opus 5.5 coordinator at high effort, ${plural(st.segs.length, "Sonnet 5.5 researcher")} in their own threads${st.depth === "deep" ? ", and a grader with a rubric" : ""}. Session budget $${stCap(st).toFixed(2)}. ${run ? `Spent so far about $${(stCost(st) * stPct(st) / 100).toFixed(2)} of an estimated $${stCost(st).toFixed(2)}.` : `Spent $${stCost(st).toFixed(2)}: ${esc(st.tokens)}.`}</p>` : "";
    if (run) {
      const ph = (p, i) => {
        const done = i < st.step, now = i === st.step && st.state === "running";
        const t = p.k === "seg" ? st.segs[p.i].q : { plan: "Plan the study", write: "Write the course", check: "Check it against the plan" }[p.k];
        const k = p.k === "seg" ? `Question ${p.i + 1}` : { plan: "Plan", write: "Course", check: "Check" }[p.k];
        const sub = done ? (p.k === "seg" ? `Kept ${st.segs[p.i].kept} sources` : p.k === "plan" ? "You agreed it" : "Done") : now ? esc(st.log[0] || "") : i === st.step ? "Stopped here" : "Next";
        return `<li class="sp-ph ${done ? "done" : now ? "run" : "wait"}"><span class="sp-mk" aria-hidden="true">${done ? "✓" : now ? "" : i + 1}</span><span><em>${k}</em><b>${esc(t)}</b><small>${sub}</small></span></li>`;
      };
      return `<article class="rp sp" aria-label="Study: ${esc(st.subject)}">${back}
        <header class="rp-head sp-head run"><span class="rk-gl lg">${svg("study", 22)}</span><div class="rp-h"><p class="rk-k">Study · ${DEPTHS[st.depth].label} · started ${esc(st.started.replace(/^Today, /, "today at "))}</p><h1 class="rp-title">${esc(st.subject)}</h1>
          <div class="rp-meta"><span>${st.state === "stopped" ? "Stopped. What it found so far is kept." : `${esc(stPhase(st))} · about ${plural(stLeft(st), "minute")} left`}</span></div></div>
          <div class="sp-pct"><b>${stPct(st)}%</b><span>${st.state === "stopped" ? "stopped" : "done"}</span></div></header>
        <div class="stc-bar lg" aria-hidden="true"><i style="width:${stPct(st)}%"></i></div>
        <p class="iss-how">You don't need to wait. Close Studiolo if you like: it will be on <b>Today</b> when it's ready, and Loci will tell you on WhatsApp.</p>
        <section class="rp-sec"><h2 class="rp-sh">What Loci is doing</h2><ol class="sp-phases">${steps.map(ph).join("")}</ol></section>
        <section class="rp-sec"><h2 class="rp-sh">The aim you agreed</h2><p class="sp-mission">${esc(st.mission)}</p></section>
        <section class="rp-sec"><h2 class="rp-sh">Lately</h2><ul class="sp-log">${st.log.slice(0, 6).map((l, i) => `<li${i ? "" : ' class="now"'}>${esc(l)}</li>`).join("")}</ul></section>
        ${builder}
        <footer class="rp-foot">${st.state === "stopped" ? btn("Finish it", `data-act="st-resume" data-v="${st.id}"`) : btn("Stop the study", `data-act="st-stop" data-v="${st.id}"`, "quiet")}<span class="rx-grow"></span>${st.state === "running" ? btn("Skip ahead (prototype)", `data-act="st-skip" data-v="${st.id}"`, "link") : ""}</footer></article>`;
    }
    const nx = stNext(st), mins = st.lessons.reduce((a, l) => a + l.min, 0);
    const les = st.lessons.map((l, i) => { const d = i < (st.done || 0), now = i === (st.done || 0);
      return `<li class="sp-l${d ? " done" : now ? " next" : ""}"><span class="sp-mk" aria-hidden="true">${d ? "✓" : i + 1}</span><span class="sp-lt"><b>${esc(l.t)}</b><em>You'll be able to: ${esc(l.win.charAt(0).toLowerCase() + l.win.slice(1))}</em><small>${l.f} · ${l.min} min${l.check ? " · with a check" : ""} · ${esc(l.src)}</small></span>${now ? btn((st.done || 0) ? "Continue" : "Start", `data-act="st-lesson" data-v="${st.id}"`) : ""}</li>`; }).join("");
    return `<article class="rp sp" aria-label="Study: ${esc(st.subject)}">${back}
      <header class="rp-head sp-head"><span class="rk-gl lg">${svg("study", 22)}</span><div class="rp-h"><p class="rk-k">Study · ${DEPTHS[st.depth].label} · ready ${esc(st.ready.replace(/^Today, /, "today, "))}</p><h1 class="rp-title">${esc(st.subject)}</h1>
        <div class="rp-meta"><span>Researched for ${st.mins} minutes · read ${st.read} sources, kept ${st.kept} · ${st.mine} from your Commonplace</span></div></div>
        <div class="sp-pct"><b>${st.done || 0}/${st.lessons.length}</b><span>lessons done</span></div></header>
      <section class="rp-sec"><h2 class="rp-sh">The aim</h2><p class="sp-mission">${esc(st.mission)}</p></section>
      <section class="rp-sec"><h2 class="rp-sh">What Loci found</h2><ol class="sp-finds">${st.found.map((x) => `<li><p class="sp-fq">${esc(x.q)}<span class="sp-conf ${CONF[x.conf]}">${x.conf}</span><span class="rx-dim">${plural(x.n, "source")}</span></p><p>${esc(x.a)}</p></li>`).join("")}</ol></section>
      <section class="rp-sec"><div class="sp-sh"><h2 class="rp-sh">Your course · ${plural(st.lessons.length, "lesson")}, about ${mins} minutes</h2><span class="rx-dim">In Learn › Courses. Each lesson is made when you reach it.</span></div><ol class="sp-les">${les}</ol></section>
      <section class="rp-sec"><h2 class="rp-sh">Also from this study</h2><div class="sp-also">
        <div class="sp-a"><span class="rk-gl sm">${svg("out", 13)}</span><span><b>${st.readings} readings saved</b><em>In your Commonplace, in a new collection, ${esc(st.collection)}</em></span>${btn("See them", `data-act="st-readings" data-v="${st.id}"`, "link")}</div>
        <div class="sp-a"><span class="rk-gl sm q">?</span><span><b>${plural(st.questions.length, "new question")}</b><em>${st.questions.map((q) => `“${esc(q)}”`).join(" · ")}</em></span>${btn("Open Questions and goals", `data-act="st-questions"`, "link")}</div>
        <div class="sp-a"><span class="rk-gl sm">${svg("search", 13)}</span><span><b>Keep it up to date</b><em>A Finds routine that watches the best sources this study found</em></span>${btn("Watch for new work", `data-act="st-watch" data-v="${st.id}"`, "link")}</div></div></section>
      <section class="rp-sec"><h2 class="rp-sh">Sources it kept · ${st.kept}</h2><ul class="sp-src">${st.sources.map(([t, m, mine]) => `<li><b>${esc(t)}</b><em>${esc(m)}${mine ? " · in your Commonplace" : ""}</em></li>`).join("")}${st.kept > st.sources.length ? `<li class="more">${btn(`and ${st.kept - st.sources.length} more`, `data-act="st-sources"`, "link")}</li>` : ""}</ul></section>
      ${builder}
      <footer class="rp-foot">${nx ? btn((st.done || 0) ? `Continue: lesson ${(st.done || 0) + 1}` : "Start the course", `data-act="st-lesson" data-v="${st.id}"`) : ""}<span class="rx-grow"></span>${btn("Study it again, deeper", `data-act="st-again" data-v="${st.id}"`, "link")}</footer></article>`;
  }

  /* ---------- making a study: four questions, then a plan to agree */
  const STUDY_RE = /\b(in[ -]depth|deep[ -]dive|deeply|thoroughly|properly|study|research|teach me|a course (on|about)|learn (all )?about|really understand)\b/;
  const studyIntent = (s) => STUDY_RE.test(s) && !/\bevery\b|\bwhen i (send|email|share|forward|save)|keep me up to date|\bafter i\b|each (day|week|morning)|\bdaily\b|\bweekly\b|new papers/.test(s) && !/^(what|how|why|which|where|who)\b/.test(s);
  const subjectFrom = (t) => t.replace(/[?.!]+$/, "").replace(/^(please |can you |could you |i (want|would like|'d like|need) to |help me |i want |i'd like )+/i, "")
    .replace(/\b(study|research|learn( all)? about|teach me( about)?|really understand|understand|make me a course (on|about)|a course (on|about)|do a deep[ -]dive (into|on)|deep[ -]dive (into|on)?|properly|thoroughly|deeply|in[ -]depth|for me|please)\b/gi, " ").replace(/\s+/g, " ").replace(/^(about|on|into|the subject of) /i, "").trim();
  function beginStudy(subject) {
    const sub = cap(subject.trim());
    if (!sub || sub.length < 3) { C.sq = { awaiting: true }; lociSay("What should I study? Say it in a few words, for example “acoustics of domed rooms”."); return; }
    C.sq = { subject: sub };
    lociSay(`A study of “${sub}”. I'll plan it, research it properly and build you a course, while you get on with your day. Four quick questions first.\nHow much do you know about it already?`, { opts: optsOf([["New to me", "st-know", "new"], ["I know some", "st-know", "some"], ["I work with it", "st-know", "lot"]]) });
  }
  function startStudyChat(subject, said) {
    if (mobile()) S.sheet = true;
    S.ptab = "all"; C.force = "all";
    meSay(said || `Study ${subject.charAt(0).toLowerCase() + subject.slice(1)} in depth`);
    think(() => beginStudy(subject), 600); C.force = null;
  }
  function makePlan(q) {
    const sub = q.subject, low = sub.toLowerCase(), depth = q.depth || "standard";
    const ac = /acoustic|sound|echo/.test(low);
    const all = ac ? STUDIES.find((x) => x.id === "st2").segs.map((s) => s.q).concat(["How other domed prayer halls handled it", "What to ask an acoustician"])
      : [`What ${low} is, and the ideas everything else rests on`, `How it's done in practice: methods, tools and numbers`, `Where it's been done well: precedents worth knowing`, `What's argued about, and what's still unknown`, `How it applies to the prayer hall`];
    let segs = all.slice(0, DEPTHS[depth].segs);
    if (q.use === "project" && depth === "standard" && !ac) segs = [all[0], all[1], all[4]];
    const mission = q.use === "project" ? `Understand ${low} well enough to use it on the prayer hall, and explain it to the client.` : q.use === "talk" ? `Be ready to talk about ${low} with confidence, and answer the hard questions.` : `Understand ${low}: the ideas, how it's done, and what's still open.`;
    return { subject: sub, short: sub.length > 34 ? sub.split(" ").slice(0, 4).join(" ") : sub, depth, know: q.know, use: q.use, time: q.time, segs, mission, mine: false, special: ac ? "acoustics" : null };
  }
  const planCost = (p) => costFor(p.depth, p.segs.length, p.mine);
  function planCard(p, state) {
    const done = state !== "live";
    const c = planCost(p), lessons = p.segs.length + 1 + (p.know === "new" ? 1 : 0), weeks = Math.max(1, Math.round((lessons * 7 + 30) / 60 / p.time * 2));
    return `<div class="cp-card rx-draft sp-plan"><p class="cp-card-title">${esc(p.subject)}<span class="tag${state === "started" ? " rx-on" : state === "live" ? " ag" : ""}">${{ started: "Started", old: "Earlier plan", live: "Plan" }[state]}</span></p>
      <p class="sp-pl-aim">${esc(p.mission)}</p>
      <p class="sp-pl-k">I'll research ${plural(p.segs.length, "question")}:</p><ol class="sp-pl-q">${p.segs.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
      <p class="sp-pl-k">Where I'll look</p><p class="note">${p.mine ? "Only your Commonplace (14 things on this) and books. No open web." : "Your Commonplace first (14 things on this), then journals, books and the open web."}</p>
      <p class="sp-pl-k">What you'll get</p><p class="note">A course of about ${plural(lessons, "lesson")}, Watch and Read, about ${plural(weeks, "week")} at ${p.time} hours a week. The readings, saved to your Commonplace, and new questions for your goals.</p>
      <p class="sp-pl-cost">${svg("schedule", 13)}<span>Ready in ${DEPTHS[p.depth].note}${p.depth === "deep" ? ", checked twice" : ""}. You don't need to wait.<br>Uses about ${pctAllow(c)}% of your monthly allowance, and never more than ${pctAllow(c * 1.5)}%.${S.builder ? ` <b>$${c.toFixed(2)} estimated, budget $${(Math.ceil(c * 1.5 * 2) / 2).toFixed(2)}</b>` : ""}</span></p>
      ${done ? "" : `<div class="acts">${btn("Start the study", 'data-act="st-start"')}${btn("Change the plan", 'data-act="st-change"', "quiet")}${btn("Not now", 'data-act="st-not"', "quiet")}</div>`}</div>`;
  }
  function startStudy() {
    const p = C.plan; if (!p) return;
    const st = { id: "st" + ++iid, subject: p.subject, short: p.short, on: "you", depth: p.depth, state: "running", step: 1, tick: 0, mins: DEPTHS[p.depth].mins,
      started: `Today, ${clk().replace(/^0/, "")}`, use: p.use, know: p.know, time: p.time, mine: p.mine, special: p.special, mission: p.mission,
      segs: p.segs.map((q, i) => ({ q, kept: 3 + ((i + q.length) % 3) })), log: [`Plan agreed: ${plural(p.segs.length, "question")}`] };
    STUDIES.unshift(st);
    ACT.unshift({ day: "Today", t: st.started.replace("Today, ", "0"), sid: st.id, what: `started: ${plural(st.segs.length, "question")} to research`, state: "study", live: true });
    const msg = [...C.all, ...Object.values(C.per).flat()].reverse().find((m) => m.card === "plan" && !m.started); if (msg) msg.started = true;
    C.plan = null; C.sq = null;
    openStudy(st.id); S.ptab = "all";
    C.force = "all"; lociSay(`Started. It's open on the left, and in Tasks. You can leave: it'll be on Today when it's ready, in ${DEPTHS[st.depth].note}.`); C.force = null;
    toast(`Loci is studying “${st.short}”.`);
  }
  function studyAnswer(s, st, text) {
    const run = st.state !== "done";
    if (/how('s| is) it going|progress|how long|when will|ready yet|status/.test(s)) {
      lociSay(run ? `${stPct(st)}% done. ${stPhase(st)}${st.state === "stopped" ? ", stopped" : `; about ${plural(stLeft(st), "minute")} left`}. So far it has kept ${st.segs.slice(0, Math.max(0, st.step - 1)).reduce((a, x) => a + x.kept, 0)} sources.` : `It finished ${st.ready.replace(/^Today, /, "today, ")}: a course of ${plural(st.lessons.length, "lesson")}, and ${st.readings} readings saved.`); return true;
    }
    if (run && /\b(stop|cancel|pause)\b/.test(s)) { st.state = "stopped"; lociSay("Stopped. What it found so far is kept. Say “finish it” or press Finish it to carry on."); return true; }
    if (run && /\b(finish it|carry on|resume|continue)\b/.test(s)) { st.state = "running"; lociSay("Carrying on from where it stopped."); return true; }
    if (run && /add (a )?question|also (look|research)|look into/.test(s)) {
      const q = text.replace(/^.*?(add (a )?question|also (look at|research)|look into)( about| on)?:?\s*/i, "").replace(/[?.!]$/, "").trim() || "How it applies to the prayer hall";
      st.segs.push({ q: cap(q), kept: 3 }); st.mins += Math.round(st.mins / st.segs.length);
      lociSay(`Added as question ${st.segs.length}: “${cap(q)}”. It adds about ${Math.round(DEPTHS[st.depth].mins / DEPTHS[st.depth].segs)} minutes and ${pctAllow(DEPTHS[st.depth].perSeg)}% of your allowance.`); return true;
    }
    if (!run && /\bwhy\b.*lesson|why these|why this order/.test(s)) {
      lociSay(`Each lesson answers a question from the plan, in the order you'll need them: ${andJoin(st.lessons.slice(0, 3).map((l) => `“${l.t}”`))}, and so on. ${st.know === "new" ? "You said it's new to you, so it starts with the basics." : "You said you know some, so it skips the basics."} The last one puts it together${st.use === "project" ? " for the prayer hall" : ""}, with a check.`); return true;
    }
    if (!run && /unsure|not sure|open|gaps?|confiden|disagree/.test(s)) {
      const weak = st.found.filter((x) => x.conf === "Mixed" || x.conf === "Thin");
      lociSay(weak.length ? `Where it's least sure:\n${weak.map((x) => `${x.q} (${x.conf.toLowerCase()}): ${x.a}`).join("\n")}` : "Every finding has at least three sources that agree. Nothing is marked unsure."); return true;
    }
    if (!run && /shorter|fewer lessons|too long/.test(s)) {
      const n = Math.max(3, st.lessons.length - 2);
      lociSay(`I can merge it into ${plural(n, "lesson")}, keeping the first and the last. Nothing you've done is lost.`, { opts: optsOf([[`Make it ${plural(n, "lesson")}`, "st-shorter", st.id], ["Keep it as it is", "st-keep"]]) }); return true;
    }
    if (!run && /up to date|new work|watch for|keep (an eye|me)/.test(s)) { watchFromStudy(st); C.force = "all"; lociSay("It's in the form on the left: a Finds routine on this subject, reading the best sources this study found. Turn it on when you're ready."); return true; }
    lociSay(run ? "I can tell you how it's going, add a question, or stop it. What it finds is kept either way." : "Ask me why these lessons, what's still unsure, or to make the course shorter. Or keep it up to date with a Finds routine.");
    return true;
  }
  function watchFromStudy(st) {
    const d = blank("schedule"); edSet(d, "skind", "follow");
    d.every = "w1"; d.time = "08:00"; d.label = st.short; d.name = `New work: ${st.short}`; d.place = TOPICS.includes(st.on) ? st.on : "you";
    d.sources = st.sources.filter(([, m]) => /journal|Paper/.test(m)).map(([t, m]) => m.split(" · ")[1] || t).slice(0, 2).concat(["Building-science journal"]).filter((x, i, a) => a.indexOf(x) === i);
    startEdit(d, true, null);
  }

  /* ================================================================ the right: the Loci panel, as everywhere in the app */
  const tkey = () => (S.ptab === "this" && S.study ? S.study : S.ptab === "this" && curId() ? curId() : "all");
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
  function msgHTML(m, i, k) {
    if (m.from === "me") return `<div class="msg user"><p>${esc(m.text)}</p></div>`;
    const list = threadOf(k), last = list.slice(i + 1).every((x) => x.from !== "me");
    let extra = "";
    if (m.card === "draft" && C.draft) {
      const d = C.draft;
      extra = `<div class="cp-card rx-draft" id="rx-draft"><p class="cp-card-title">${esc(d.name)}<span class="tag ag">Draft</span></p><p class="rx-say">${sentence(d, "draft")}</p>
        ${d.type === "arrive" ? `<p class="note">${chip("draft", "mode", modeLabel(d))} · tap an underlined word to change it.</p>${tryHTML(d)}` : `<p class="note">Tap an underlined word to change it.</p>`}${S.builder ? builderNote(d) : ""}
        <div class="acts">${btn("Turn it on", 'data-act="turn-on"')}${btn("Edit in full", 'data-act="draft-edit"', "quiet")}${btn("Discard", 'data-act="discard"', "quiet")}</div></div>`;
    } else if (m.card === "plan" && m.plan) {
      extra = planCard(m.plan, m.started ? "started" : m.plan === C.plan ? "live" : "old");
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
  function homeBody() {
    const on = ROUTINES.filter((r) => r.on).length;
    const ideas = [
      S.noticed === "open" ? { a: "noticed", b: "File dezeen.com links as Precedents", em: "You did this by hand 7 times this month", small: "Do it" } : null,
      { a: "st-idea", v: "Mashrabiya and daylight in prayer halls", b: "Study mashrabiya and daylight, in depth", em: "You have 2 open questions on Daylight & shading", small: "Plan it" },
      { a: "idea", v: "Every evening, sort what I haven't sorted", b: "Sort Unsorted every evening", em: "9 things are sitting in Unsorted", small: "Set up" },
      { a: "idea", v: "Every Monday, find new papers on Daylight & shading", b: "New papers on Daylight & shading", em: "You have 2 open questions there", small: "Set up" },
    ].filter(Boolean);
    return `<div class="cp-home"><h2 class="hello">Good morning, Layla.</h2>
      <div class="progress-card"><div class="rx-big" aria-hidden="true">${on}</div><div><b>${plural(on, "routine")} on</b><span>${filedThisWeek()} things filed for you this week</span></div></div>
      ${STUDIES.filter((x) => x.state === "running" || (x.state === "done" && !x.seen)).map((x) => `<button type="button" class="rx-waitline rx-studyline" data-act="open-study" data-v="${x.id}"><span aria-hidden="true" class="rk-gl sm">${svg("study", 13)}</span><span><b>${x.state === "done" ? `Your study is ready: ${esc(x.short)}` : `Studying ${esc(x.short)} · ${stPct(x)}%`}</b><em>${x.state === "done" ? `A course of ${plural(x.lessons.length, "lesson")}` : x.state === "stopped" ? "Stopped" : `Ready in about ${plural(stLeft(x), "minute")}`}</em></span><span aria-hidden="true">›</span></button>`).join("")}
      ${newFinds() ? `<button type="button" class="rx-waitline rx-findline" data-act="seg" data-v="finds"><span aria-hidden="true" class="rk-gl sm">${svg("search", 13)}</span><span><b>${plural(newFinds(), "new find")} to look through</b><em>Top pick: ${esc((() => { const iss = ISSUES.find((x) => openOf(x)); return iss ? (iss.items.find((f) => f.top && !f.st) || iss.items.find((f) => !f.st)).title : ""; })())}</em></span><span aria-hidden="true">›</span></button>` : ""}
      ${W.length ? `<button type="button" class="rx-waitline" data-act="seg" data-v="waiting"><span aria-hidden="true" class="rk-gl q sm">?</span><span><b>${plural(W.length, "thing")} waiting for a quick look</b><em>Your routines weren't sure about these</em></span><span aria-hidden="true">›</span></button>` : ""}
      <div class="cp-sec"><div class="sec-h"><span>Ideas for you</span></div><div class="rx-rows">${ideas.map((x) => `<button type="button" class="cp-row" data-act="${x.a}" data-v="${esc(x.v || "")}"><span aria-hidden="true" class="dot rx-dot-ghost"></span><span><b>${esc(x.b)}</b><em>${esc(x.em)}</em></span><small>${esc(x.small)}</small></button>`).join("")}</div></div></div>`;
  }
  function panel() {
    const id = curId(), r = id ? RR(id) : null, inThis = !!(r && S.ptab === "this"), peek = mobile() && !S.sheet;
    const fold = mobile() ? `<button aria-label="Fold Loci away" class="icb" title="Fold Loci away" type="button" data-act="fold">${svg("fold")}</button>` : "";
    const st = S.study ? studyById(S.study) : null, inSt = !!(st && S.ptab === "this");
    const head = st
      ? `<div class="cp-head"><div class="cp-toprow"><span class="cp-kicker">Study · ${DEPTHS[st.depth].label}</span><button aria-label="Close this study" class="icb" title="Close this study" type="button" data-act="back">${svg("close", 15)}</button>${fold}</div>
        <div class="cp-title"><span aria-hidden="true" class="dot ${st.state === "running" ? "s1" : "s2"}"></span><h2>${esc(st.short)}</h2></div>
        <div aria-label="Conversation" class="cp-tabs" role="tablist"><button aria-selected="${!inSt}" class="cp-tab" role="tab" type="button" data-act="ptab" data-v="all"><span class="cp-tab-name">All tasks</span></button><button aria-selected="${inSt}" class="cp-tab" role="tab" type="button" data-act="ptab" data-v="this"><span class="cp-tab-name">This study</span></button></div></div>`
      : r
      ? `<div class="cp-head"><div class="cp-toprow"><span class="cp-kicker">Routine · ${esc(GROUP[r.type])}</span><button aria-label="Close this routine" class="icb" title="Close this routine" type="button" data-act="back">${svg("close", 15)}</button>${fold}</div>
        <div class="cp-title"><span aria-hidden="true" class="dot ${r.on ? "s2" : "s0"}"></span><h2>${esc(r.name)}</h2></div>
        <div aria-label="Conversation" class="cp-tabs" role="tablist"><button aria-selected="${!inThis}" class="cp-tab" role="tab" type="button" data-act="ptab" data-v="all"><span class="cp-tab-name">All routines</span></button><button aria-selected="${inThis}" class="cp-tab" role="tab" type="button" data-act="ptab" data-v="this"><span class="cp-tab-name">This routine</span></button></div></div>`
      : `<div class="cp-head"><div class="cp-toprow"><span class="cp-kicker">Loci · Tasks</span>${fold}</div><div class="cp-title cp-peek-title"><h2>Your tasks</h2></div></div>`;
    const editing = S.edit && (S.edit.isNew ? !inThis : inThis);
    const body = inSt
      ? (threadOf(st.id).length ? "" : `<p class="cp-empty">${st.state === "done" ? `Ask me anything about this study: why these lessons, what's still unsure, or what to change.` : `Ask how it's going, add a question, or stop it. What it finds is kept either way.`}</p>`) + threadHTML(st.id)
      : inThis
      ? (threadOf(r.id).length ? "" : `<p class="cp-empty">${S.edit ? `Tell me what to change, and I'll change it in the form. Nothing is saved until you press Save.` : `Ask me anything about “${esc(r.name)}”, or tell me what to change. Changes show on the page, with Undo.`}</p>`) + threadHTML(r.id)
      : (S.edit && S.edit.isNew && !C.all.length ? `<p class="cp-empty">Tell me what this routine should do, and I'll fill in the form for you.</p>` : homeBody()) + threadHTML("all");
    const prompts = inSt ? (st.state === "done" ? ["Why these lessons?", "What's still unsure?", "Make the course shorter", "Keep me up to date on this"] : ["How is it going?", "Add a question about precedents", st.state === "stopped" ? "Finish it" : "Stop it"])
      : inThis && r.kind === "follow" ? ["What did you find today?", "Only papers", "Up to 10 finds", r.on ? "Pause it" : "Turn it back on", S.edit ? null : "Edit it"].filter(Boolean)
      : inThis
      ? [S.edit ? null : "What did it do this week?", r.type === "arrive" ? (r.mode === "own" ? "Ask me before filing" : "Stop asking, just file them") : null, r.type === "arrive" && !S.edit ? "Why did it file the last one there?" : null, r.on ? "Pause it" : "Turn it back on", S.edit ? null : "Edit it"].filter(Boolean)
      : ["What are you working on?", "Study something in depth", "What did you find today?", "What did my routines do this week?", "What's waiting for me?", "How do tasks work?"];
    const comp = `<div class="cp-comp"><div class="prompts">${prompts.map((p) => `<button type="button" data-act="prompt" data-v="${esc(p)}">${esc(p)}</button>`).join("")}</div>
      <form class="box" data-form="chat">${inSt ? `<span class="scope">About ${esc(st.short)}<button aria-label="Ask about all tasks instead" type="button" data-act="ptab" data-v="all">×</button></span>` : inThis ? `<span class="scope">About ${esc(r.name)}<button aria-label="Ask about all routines instead" type="button" data-act="ptab" data-v="all">×</button></span>` : ""}<label class="visually-hidden" for="rx-text">Ask Loci</label><textarea id="rx-text" maxlength="4000" rows="2" placeholder="${inSt ? `Ask about ${esc(st.short)}…` : inThis ? (peek ? `Ask Loci about ${esc(r.name)}…` : `Ask about ${esc(r.name)}, or say what to change…`) : peek ? "Ask Loci about your tasks…" : editing ? "Tell Loci what it should do…" : "Ask about your tasks, say what should happen, or what to study…"}">${esc(C.input)}</textarea><div class="tools"><span class="grow"></span><button aria-label="Send" class="send" type="submit">${svg("send")}</button></div></form></div>`;
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
    if (/every week|weekly/.test(s) && !said) { d.every = "w1"; d.time = "08:00"; said = true; }
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
    if (/up to date|keep up|\bfollow\b|\bnews\b|what's new on|the latest|find (me )?(new|the latest)|keep an eye on/.test(s)) return "follow";
    if (/quiz|test me|\breview\b|ask me (questions|about)|what slipped/.test(s)) return "review";
    if (/after i (finish|watch)|when i finish/.test(s)) return "after";
    if (/\bwhen i\b|\b(send|share|email|forward)\b.*\b(photo|picture|link|pdf|voice|audio|reel|recipe|book)|every time i (send|save)/.test(s)) return "arrive";
    return null;
  }
  function parseArrive(text) {
    const s = text.toLowerCase(), said = {};
    const d = blank("arrive");
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
  // "Keep me up to date on AI in architecture", "AI news in architecture", "find me new papers about wind towers"
  function subjectOf(text) {
    const t = text.replace(/[.!?]+$/, "").replace(/\b(every|each) (day|morning|evening|week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)s?\b,?/gi, "").trim();
    let m = t.match(/\b([\w-]+(?: [\w-]+)?) news (?:in|on|about|for) (.+)$/i);
    if (m) return `${m[1]} in ${m[2]}`.trim();
    m = t.match(/\b(?:on|about)\s+(.+)$/i) || t.match(/\bnews (?:in|for)\s+(.+)$/i);
    return m ? m[1].replace(/^the latest\s+/i, "").trim() : "";
  }
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
    const d = { ...blank(kind === "after" ? "after" : "schedule"), every: null, time: null };
    if (kind === "tidy") {
      Object.assign(d, { kind: "tidy", name: "Sort Unsorted", mode: null });
      if (!parseEvery(s, d)) C.q.push("tidyEvery");
      C.q.push("tidyMode");
      lociSay("Got it: I'll go through what's in Unsorted and put each thing where it belongs.");
    }
    if (kind === "follow") {
      const tp = topicIn(s), subj = subjectOf(text);
      const ks = [["paper", /\bpapers?\b|research|studies/], ["video", /videos?|talks?|lectures?/], ["tool", /\btools?\b|apps?\b|plugins?|datasets?/], ["article", /articles?|blogs?|posts?/]].filter(([, re]) => re.test(s)).map(([k]) => k);
      Object.assign(d, { kind: "follow", place: tp || "you", label: tp ? "" : subj, sources: SOURCES.slice(0, 4), kinds: ks.length ? ks : FIND_KINDS.map((k) => k[0]), count: 6, dest: "page" });
      const subject = d.label || PLACES[d.place].name;
      d.name = ks.length === 1 ? `New ${FK_PL[ks[0]]} on ${subject}` : cap(subject);
      if (!tp && !subj) C.q.push("followTopic");
      C.q.push("sources");
      if (!parseEvery(s, d)) C.q.push("followEvery");
      else if (!TIME_RE.test(s) && !/evening|night/.test(s)) d.time = d.every === "day" ? "07:30" : "08:00";
      const twin = ROUTINES.find((r) => r.kind === "follow" && r.place === d.place && (r.label || "").toLowerCase() === (d.label || "").toLowerCase());
      if (twin) { C.draft = d; lociSay(`You already have “${twin.name}”, which looks for this ${everyText(twin).toLowerCase().replace(/^every /, "every ")}. Open it?`, { opts: optsOf([[`Open “${twin.name}”`, "open", twin.id], ["Make a new one anyway", "anyway"]]) }); return; }
      lociSay(d.label ? `Got it: I'll look for new ${kindsText(d)} on “${d.label}”. It isn't a topic on your map, so I'll sort what I find onto the topics it fits. If it keeps coming up, I'll suggest a sub-topic.` : `Got it: I'll look for new ${kindsText(d)} on ${subject}.`);
    }
    if (kind === "review") {
      Object.assign(d, { kind: "review", name: "", place: topicIn(s) || null, count: /\b5\b|five/.test(s) ? 5 : /\b3\b|three/.test(s) ? 3 : null });
      if (!d.place) C.q.push("reviewPlace");
      if (!d.count) C.q.push("reviewCount");
      if (!parseEvery(s, d)) C.q.push("reviewEvery");
      lociSay("Got it: short questions on what you got wrong lately, so it sticks.");
    }
    if (kind === "after") {
      Object.assign(d, { kind: "lumen", name: "After a Lumen", every: undefined, time: undefined, delay: /next day|tomorrow/.test(s) ? "the next day" : /week/.test(s) ? "a week later" : /three|3/.test(s) ? "three days later" : null });
      if (!d.delay) C.q.push("delay");
      lociSay("Got it: after each Lumen, its check comes back later, when it's worth testing.");
    }
    C.draft = d; ask();
  }
  function preview() {
    const d = C.draft;
    if (!d.name) d.name = autoNameAny(d);
    snapDrafts(); C.previewed = true;
    if (S.newer) { S.newer = false; S.seg = "routines"; S.kind = "all"; S.only = null; C.resetScroll = true; }
    if (d.kind === "follow") lociSay(`This morning it would have found ${d.count} things. For example:`, { rows: SAMPLE.filter((f) => !d.kinds || d.kinds.includes(f.kind)).concat(SAMPLE).slice(0, 3).map((f) => ({ a: "noop", b: f.title, em: `${FK_ONE[f.kind]} · ${f.src}`, small: PLACES[f.topic]?.name || "", dot: "s2" })) });
    const lead = d.type === "arrive" ? "Here it is. It's on the left as a draft; nothing changes until you turn it on."
      : d.kind === "tidy" ? "Here it is. Last night it would have placed 4 of the 9 things in Unsorted, and asked you about 2."
      : d.kind === "follow" ? "Here it is. Each run gets its own Finds page, and nothing runs until you turn it on." : "Here it is. It's on the left as a draft.";
    lociSay(lead, { card: "draft" });
  }
  function turnOn() {
    const d = C.draft; if (!d) return;
    const r = addRoutine(d);
    snapDrafts(true); clearDraft();
    S.seg = "routines"; S.kind = "all"; S.only = null; flash(r.id, 2400);
    const first = r.type === "arrive" ? ` It's first in line under “When I send something”.${r.mode === "ask" ? " I'll ask you about the first few so you can check me." : ""}` : r.kind === "follow" ? ` Your first finds come ${fNext(nextRun(r))}, on a Finds page, with a card on Today.` : r.type === "schedule" ? ` First run: ${fNext(nextRun(r))}.` : "";
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
    if (r.kind === "follow") {
      const ks = [["paper", /\bpapers?\b/], ["video", /videos?|talks?/], ["tool", /\btools?\b|datasets?/], ["article", /articles?|\bnews\b/]].filter(([, re]) => re.test(s)).map(([k]) => k);
      if (ks.length && /\b(only|just)\b/.test(s)) { r.kinds = ks; done.push(`it looks only for ${kindsText(r)}`); }
      else if (ks.length && /\b(also|add|and|plus)\b/.test(s)) { r.kinds = [...new Set([...(r.kinds || []), ...ks])]; done.push(`it looks for ${kindsText(r)}`); }
      const n = s.match(/\b(?:up to )?(\d{1,2}) (?:finds|things|items)\b/); if (n) { r.count = Number(n[1]); done.push(`it brings up to ${r.count}`); }
      if (/(straight )?into to read/.test(s)) { r.dest = "toread"; done.push("its finds go straight into To read"); }
      if (/finds page|let me choose/.test(s)) { r.dest = "page"; done.push("its finds go on a Finds page"); }
    }
    if (r.type === "schedule" && parseEvery(s, r)) done.push(`it runs ${everyText(r).toLowerCase()}`);
    const nm = text.match(/(?:call it|rename it(?: to)?|name it) [“"']?([^”"']+)[”"']?/i);
    if (nm) { r.name = nm[1].trim().replace(/[.!]$/, ""); done.push(`it's called “${r.name}”`); }
    return done;
  }

  /* ---------- questions Loci answers */
  const looksLikeQuestion = (s, raw) => /^(what|why|how|which|where|who|is|are|does|did|has|have|show me|tell me)\b/.test(s) || raw.trim().endsWith("?");
  function whyText(r, x) {
    const conds = [r.when !== "any" ? `it came ${CH_PREP[r.when]} ${CH_WORD[r.when]}` : "", ...r.ifs.map((c) => ({ kind: `it's ${KIND_WORD[c.v]}`, tag: `it had ${c.v}`, site: `it's from ${c.v.split(",")[0]}`, is: `I read that it's ${c.v}`, about: `it's about ${PLACES[c.v]?.name}`, words: `it mentions ${c.v}` })[c.t])].filter(Boolean);
    const pos = arrivePos(r);
    return `“${x.t}” was filed ${x.w.replace(/ · you checked it$/, "")} because ${andJoin(conds)}.${pos > 1 ? ` “${r.name}” is ${ord(pos)} in line, and none of the ${plural(pos - 1, "routine")} above it fit.` : ` “${r.name}” is first in line, so it gets the first look.`}\nIf it's wrong, undo it in Activity and I'll count it as a miss.`;
  }
  function answer(s, r) {
    if (!r && /working on|what are you (doing|studying)|\bstudies\b|my studies/.test(s)) {
      lociSay(`${plural(STUDIES.filter((x) => x.state === "running").length, "study is", "studies are")} working now, and ${plural(ROUTINES.filter((x) => x.on).length, "routine is", "routines are")} on:`, { rows: STUDIES.map((x) => ({ a: "open-study", v: x.id, b: x.short, em: x.state === "done" ? `A course of ${plural(x.lessons.length, "lesson")} · ready ${x.ready.replace(/^Today, /, "today, ")}` : `${stPct(x)}% · ${stPhase(x)}`, small: x.state === "done" ? (x.seen ? "Done" : "Ready") : x.state === "stopped" ? "Stopped" : "Working", dot: x.state === "done" ? "s2" : "s1" })), opts: optsOf([["What did my routines do this week?", "say"]]) });
      return true;
    }
    if (/\bfinds?\b|what's new|what did (you|it) find|\bnews\b/.test(s) && !(r && r.kind !== "follow")) {
      const iss = r ? issuesOf(r.id)[0] : ISSUES.find((x) => openOf(x)) || ISSUES[0];
      if (!iss) { lociSay(r ? `“${r.name}” hasn't run yet. Its first finds come ${fNext(nextRun(r))}.` : "No finds yet."); return true; }
      const fr = RR(iss.rid);
      lociSay(`${fr ? fr.name : "Finds"}, ${iss.when.toLowerCase()}: ${plural(iss.items.length, "find")}, ${openOf(iss) ? `${openOf(iss)} still to look at` : "all decided"}. The first three:`, { rows: iss.items.slice(0, 3).map((f) => ({ a: "open-issue", v: iss.id, b: f.title, em: `${FK_ONE[f.kind]} · ${f.src}${f.why.some((w) => w.t === "q") ? " · may answer a question of yours" : ""}`, small: f.st ? { saved: "Saved", later: "To read", no: "Skipped" }[f.st] : "", dot: f.st ? "s0" : "s2" })), opts: optsOf([["Open the Finds page", "open-issue-opt", iss.id]]) });
      return true;
    }
    if (/what did|what has|what's it done|this week|lately|activity|so far/.test(s)) {
      if (r) {
        lociSay(r.lately.length ? `Lately, “${r.name}”:` : `“${r.name}” hasn't done anything yet. It starts with the next thing that fits.`, r.lately.length ? { rows: r.lately.slice(0, 3).map((x) => ({ a: "noop", b: x.t, em: x.w, small: x.when })) } : {});
        return true;
      }
      const top = ROUTINES.filter((x) => x.type === "arrive" && x.filed).sort((a, b) => b.filed - a.filed).slice(0, 3);
      lociSay(`This week your routines filed ${filedThisWeek()} things for you${W.length ? `, and ${plural(W.length, "thing is", "things are")} waiting for a quick look` : ""}. The busiest:`, { rows: top.map((x) => ({ a: "open-r", r: x.id, b: x.name, em: cardRows(x).map((y) => y[1]).join(" → "), small: `${x.filed} this month` })), opts: optsOf([["Open Activity", "goto", "activity"], ...(W.length ? [["Open Waiting", "goto", "waiting"]] : [])]) });
      return true;
    }
    if (/waiting|need(s)? me|to check|for me to/.test(s)) {
      if (!W.length) { lociSay("Nothing is waiting for you. Your routines will ask when they're not sure."); return true; }
      lociSay(`${plural(W.length, "thing is", "things are")} waiting for you:`, { rows: W.map((w) => ({ a: "goto", v: "waiting", b: w.kind === "pile" ? "The To read pile" : w.kind === "nomatch" ? w.item.title : w.newTitle || w.title, em: w.kind === "nomatch" ? "No routine covers it yet" : w.kind === "pile" ? "3 old things to keep or let go" : `${RR(w.rid)?.name || "A routine"} asks where it goes`, small: w.when || "Just now", dot: "s1" })), opts: optsOf([["Open Waiting", "goto", "waiting"]]) });
      return true;
    }
    if (/\bwhy\b/.test(s)) {
      const rr = r || RR(ACT.find((x) => x.state === "filed")?.rid);
      const x = rr && rr.type === "arrive" ? rr.lately[0] : null;
      if (!x) { lociSay(r ? `“${r.name}” hasn't filed anything yet, so there's nothing to explain.` : "Nothing has been filed yet."); return true; }
      lociSay(whyText(rr, x), { opts: optsOf([["Open Activity", "goto", "activity"], ...(r ? [] : [[`Open “${rr.name}”`, "open", rr.id]])]) });
      return true;
    }
    if (!r && /how (do|does|can|would)|how .* work|what (is|are) (a )?(routines?|tasks?|stud(y|ies))/.test(s)) {
      lociSay("A task is work I do for you while you're away. There are two kinds.\nA routine runs every time something happens: when you send something, on a schedule, or after you do something. I file it, bring things in, or follow up.\nA study runs once, in depth. I ask four questions, show you a plan with its time and cost, and once you agree I research it for 20 minutes to an hour and build you a course. You don't need to wait: it's on Today when it's ready.\nTo make either, press New task, or just tell me.", { opts: optsOf([["When I send a voice note on WhatsApp, write it out", "say"], ["Every evening, sort what I haven't sorted", "say"]]) });
      return true;
    }
    if (/cost|how much|allowance/.test(s)) { lociSay("A study uses about 17% of your monthly allowance (standard) or 40% (deep), and I show it before it starts. Your routines use about 4%. Plain rules (where something came from, what kind it is, a tag, a site) cost nothing. A little is used only when I read an item, to find a book or describe a photo, and a run with nothing new costs nothing."); return true; }
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
      const s = low, r = tkey() !== "all" ? RR(tkey()) : null, stx = studyById(tkey());
      if (stx) { studyAnswer(s, stx, text); return; }
      if (C.sq && C.sq.awaiting) { beginStudy(subjectFrom(text) || text); return; }
      if (/^study something( new)?( in depth)?$/.test(s)) { beginStudy(""); return; }
      if (!r && studyIntent(s)) { if (S.edit && S.edit.isNew) S.edit = null; beginStudy(subjectFrom(text)); return; }
      if (C.pendingDelete) { const x = RR(C.pendingDelete); C.pendingDelete = null; if (/\b(yes|delete)\b/.test(s)) deleteRoutine(x); else lociSay("Kept it."); return; }
      if (/^(cancel|never mind|forget it|stop)$/.test(s)) { snapDrafts(); clearDraft(); lociSay("Cancelled. Nothing changed."); return; }
      if (r) {
        const editing = S.edit && S.edit.id === r.id;
        if (looksLikeQuestion(s, text) && answer(s, r)) return;
        if (/^(edit|change)( it)?$|open the (form|editor)|edit it/.test(s)) { if (!editing) startEdit(r, false); lociSay("It's open in the form on the left. Save when you're done, or tell me what to change."); return; }
        if (intent(s) && !applyChange(clone(r), text).length) {
          lociSay("That sounds like a new routine. I've started it under All routines.");
          S.ptab = "all"; C.force = "all"; meSay(text); begin(text); return;
        }
        if (/\bdelete\b|remove (it|this)/.test(s)) { C.pendingDelete = r.id; lociSay(`Delete “${r.name}”? What it already filed stays where it is.`, { opts: optsOf([["Delete it", "del-yes", r.id], ["Keep it", "del-no"]]) }); return; }
        const target = editing ? S.edit.d : r, before = JSON.stringify(r), done = applyChange(target, text);
        if (done.length) {
          if (editing) lociSay(`Changed in the form: ${andJoin(done)}. Save when you're ready.`);
          else { lociSay(`Done: ${andJoin(done)}.`, { opts: optsOf([["Undo that", "undo", r.id]]), undo: before }); flash(r.id, 1600); }
          return;
        }
        if (answer(s, r)) return;
        lociSay(`I didn't catch a change to “${r.name}”. You can say things like “ask me first”, “also describe them” or “pause it”, ask what it did this week, or press Edit.`);
        return;
      }
      if (S.edit && S.edit.isNew && !looksLikeQuestion(s, text) && !intent(s)) { const done = applyChange(S.edit.d, text); if (done.length) { lociSay(`Changed in the form: ${andJoin(done)}. Turn it on when you're ready.`); return; } }
      const midway = C.draft && !C.previewed && C.cur;
      if (C.draft && C.previewed && !intent(s) && !looksLikeQuestion(s, text)) { const done = applyChange(C.draft, text); if (done.length) { lociSay(`Changed: ${andJoin(done)}. The draft above shows it.`); return; } }
      if (intent(s)) { if (S.edit && S.edit.isNew) S.edit = null; begin(text); return; }
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
        case "anyway": if (C.draft.type === "arrive") { queueArrive(C.pendingSaid || {}); lociSay(understood(C.draft)); } ask(); return;
        case "open-issue-opt": openIssue(v, "finds"); lociSay("It's open on the left."); return;
        case "find-study": { const [f] = findById(v); if (!f) return; beginStudy(f.title.replace(/ \(example[^)]*\)$/, "")); return; }
        case "st-know": C.sq.know = v; lociSay("What is it for?", { opts: optsOf([["The prayer hall project", "st-use", "project"], ["A talk or a client meeting", "st-use", "talk"], ["Just to understand it", "st-use", "general"]]) }); return;
        case "st-use": C.sq.use = v; lociSay("How much time a week can you give it?", { opts: optsOf([["About 1 hour", "st-time", "1"], ["About 3 hours", "st-time", "3"], ["5 hours or more", "st-time", "5"]]) }); return;
        case "st-time": C.sq.time = Number(v); lociSay("How deep should I go?", { opts: optsOf([[`Standard: ${DEPTHS.standard.how}, about ${pctAllow(costFor("standard", 3))}% of your allowance`, "st-depth", "standard"], [`Deep: ${DEPTHS.deep.how}, about ${pctAllow(costFor("deep", 5))}%`, "st-depth", "deep"]]) }); return;
        case "st-depth": C.sq.depth = v; C.plan = makePlan(C.sq); lociSay("Here's my plan. Nothing starts until you say so.", { card: "plan", plan: C.plan }); return;
        case "st-fewer": if (C.plan && C.plan.segs.length > 2) C.plan.segs.pop(); C.plan = { ...C.plan }; lociSay("One question fewer:", { card: "plan", plan: C.plan }); return;
        case "st-addapp": if (C.plan && !C.plan.segs.some((x) => /prayer hall/.test(x))) C.plan.segs.push("How it applies to the prayer hall"); C.plan = { ...C.plan }; lociSay("Added:", { card: "plan", plan: C.plan }); return;
        case "st-mine": C.plan = { ...C.plan, mine: !C.plan.mine }; lociSay(C.plan.mine ? "Only your Commonplace and books, no open web. It costs a little less, and finds less that's new." : "Back to the open web too:", { card: "plan", plan: C.plan }); return;
        case "st-deeper": { const d2 = C.plan.depth === "deep" ? "standard" : "deep"; C.plan = makePlan({ ...C.sq, depth: d2 }); C.sq.depth = d2; lociSay(d2 === "deep" ? "Deeper: five questions, and a second check." : "Lighter: three questions.", { card: "plan", plan: C.plan }); return; }
        case "st-shorter": { const st = studyById(v); if (!st) return; const mid = st.lessons.slice(1, -1), drop = new Set([...mid].sort((a, b) => a.min - b.min).slice(0, Math.min(2, mid.length - 1))); const keep = [st.lessons[0], ...mid.filter((l) => !drop.has(l)), st.lessons[st.lessons.length - 1]]; st.lessons = keep; st.done = Math.min(st.done || 0, keep.length - 1); lociSay(`Done: ${plural(keep.length, "lesson")} now. The page shows it.`); return; }
        case "st-keep": lociSay("Kept as it is."); return;
        case "find-lumen": { const [f] = findById(v); if (!f) return; f.st = "saved"; lociSay(`Saved, and I've started a Lumen from it: “${f.title.replace(/ \(example[^)]*\)$/, "")}”. It'll be in Learn in a few minutes, on ${PLACES[f.on]?.name || "your map"}.`); return; }
        case "find-compare": { const [f] = findById(v); if (!f) return; lociSay(`Closest in your Commonplace, on ${PLACES[f.topic]?.name || "your map"}:`, { rows: [{ a: "noop", b: "Courtyard cooling study (example).pdf", em: "PDF · saved 12 Oct", small: "Agrees" }, { a: "noop", b: "Climate Considerations in Building and Urban Design", em: "Book · Baruch Givoni", small: "Older view" }] }); return; }
        case "find-save": { const [f] = findById(v); if (!f) return; f.st = "saved"; lociSay(`Saved as ${f.as} on ${PLACES[f.on]?.name || "your map"}.`); return; }
        case "open": { const r = RR(v); if (!r) return; openRoutine(v); C.force = v; lociSay(`Here's “${r.name}”, open on the left. Tap an underlined word to change it, press Edit, or tell me what to change.`); return; }
        case "undo": { const r = RR(v); if (m.undo && r) Object.assign(r, JSON.parse(m.undo)); lociSay("Undone."); return; }
        case "del-yes": C.pendingDelete = null; deleteRoutine(RR(v)); return;
        case "del-no": C.pendingDelete = null; lociSay("Kept it."); return;
        case "another": lociSay("What should happen? Tell me, or pick one:", { opts: optsOf([["When I share a reel, save the links in its caption", "say"], ["Every Friday, quiz me on what slipped", "say"], ["After I finish a Lumen, check me a week later", "say"]]) }); return;
        case "goto": goSeg(v); lociSay(v === "waiting" ? "It's open on the left: Waiting." : "It's open on the left: Activity."); return;
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
    if (curId() === r.id) { S.open = null; S.edit = null; S.ptab = "all"; C.resetScroll = true; }
    C.force = "all";
    lociSay(`Deleted “${r.name}”. What it filed stays where it is.`, { opts: optsOf([["Bring it back", "restore"]]) });
  }
  function openRoutine(id) { S.study = null; S.issue = null; S.open = id; S.edit = null; S.newer = false; S.ptab = "this"; S.seg = "routines"; S.pop = null; C.resetScroll = true; }
  function goSeg(v) { S.study = null; S.issue = null; S.seg = v; S.open = null; S.edit = null; S.newer = false; S.ptab = "all"; C.resetScroll = true; if (mobile()) S.sheet = false; }
  function flash(id, ms) { S.flash = id; setTimeout(() => { if (S.flash === id) { S.flash = null; render(); } }, ms); }

  /* ================================================================ tap a word to change it */
  const POP_TITLE = { when: "Sent from", kind: "Which kind of thing", tag: "The tag", site: "From the site", words: "Mentioning", is: "Loci reads that it's", about: "About", fileAs: "File it as", on: "On", status: "Reading status", addTo: "Also add to", mode: "Before it files", onoff: "This routine is", every: "When", place: "Which topic", count: "How many", delay: "When it comes back", sources: "Sources", tidymode: "When Loci is sure", fkinds: "Look for", dest: "Bring them" };
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
      dest: [["page", "On a Finds page, for me to choose"], ["toread", "Straight into To read"]],
    };
    if (r.kind === "follow") O.count = [["3", "Up to 3"], ["6", "Up to 6"], ["10", "Up to 10"]];
    const cur = { when: r.when, kind: r.ifs?.find((c) => c.t === "kind")?.v, is: r.ifs?.find((c) => c.t === "is")?.v, about: r.ifs?.find((c) => c.t === "about")?.v, fileAs: t.fileAs, on: t.on, status: t.status, addTo: t.addTo, mode: r.mode, onoff: r.on ? "1" : "0", tidymode: r.mode, every: r.every, place: r.place, count: String(r.count), delay: r.delay, dest: r.dest }[f];
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
    } else if (f === "fkinds") {
      body = FIND_KINDS.map(([v, l]) => `<button type="button" class="rx-opt" data-act="pop-fk" data-v="${v}" aria-pressed="${(r.kinds || []).includes(v)}">${l}</button>`).join("");
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

  /* ================================================================ Today, and the Everything tab */
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
    $(".td-top", root)?.insertAdjacentHTML("afterend", `<section class="rx-today" aria-labelledby="rx-today-h"><div class="td-h is-plain"><h2 id="rx-today-h">From Loci</h2><span><a href="#routines" data-act="go-routines">All tasks</a></span></div>${STUDIES.filter((x) => x.state !== "done" || !x.seen || stNext(x)).slice(0, 2).map((x) => x.state !== "done" ? `<button type="button" class="rx-todaycard study" data-act="today-study" data-v="${x.id}"><span class="kicker">Loci is studying for you</span><b>“${esc(x.short)}”: ${stPct(x)}% done${x.state === "stopped" ? ", stopped" : `, ready in about ${plural(stLeft(x), "minute")}`}.</b><em>See how it's going</em></button>` : !x.seen ? `<button type="button" class="rx-todaycard study ready" data-act="today-study" data-v="${x.id}"><span class="kicker">Your study is ready</span><b>“${esc(x.short)}”: a course of ${plural(x.lessons.length, "lesson")}, and ${x.readings} readings saved.</b><em>Start the course</em></button>` : `<button type="button" class="rx-todaycard study" data-act="today-study" data-v="${x.id}"><span class="kicker">Next in your study · ${esc(x.short)}</span><b>Lesson ${(x.done || 0) + 1} of ${x.lessons.length}: ${esc(stNext(x).t)}. ${stNext(x).f}, ${stNext(x).min} minutes.</b><em>Continue</em></button>`).join("")}
      <button type="button" class="rx-todaycard" data-act="today-look"><span class="kicker">Since yesterday evening</span><b>Your routines filed ${filed} things for you.${W.length ? ` ${plural(W.length, "thing is", "things are")} waiting for a quick look.` : ""}</b><em>${W.length ? "Look now" : "See your routines"}</em></button>${(() => { const iss = ISSUES.find((x) => openOf(x)); if (!iss) return ""; const fr = RR(iss.rid), top = iss.items.find((f) => f.top) || iss.items[0]; return `<button type="button" class="rx-todaycard finds" data-act="today-finds" data-v="${iss.id}"><span class="kicker">This morning's finds · ${esc(fr ? fr.name : "")}</span><b>${plural(openOf(iss), "new find")}. Top pick: “${esc(top.title)}”.</b><em>Look through them</em></button>`; })()}</section>`);
  }
  function everythingView() {
    shell("library");
    $$(`.navigation-rail .navigation-link[href="/library"], .tab-bar .tab-bar-link[href="/library"]`, root).forEach((a) => a.setAttribute("aria-current", "page"));
    const h = $(".destination-header", root); if (h) h.outerHTML = header("everything", ["19 entries, 11 collections"]);
  }

  /* ================================================================ rendering */
  function shell(name) {
    root.innerHTML = DATA.screens[name];
    $$(".navigation-rail .navigation-link[href], .tab-bar .tab-bar-link[href]", root).forEach((a) => a.removeAttribute("aria-current"));
    $$(".account-name", root).forEach((x) => (x.textContent = "Layla Haddad"));
    $$(".account-avatar", root).forEach((x) => (x.textContent = "LH"));
    $$(".account-trigger", root).forEach((x) => { x.setAttribute("aria-label", "Account menu for Layla Haddad"); x.title = "Layla Haddad"; });
    // Loci gets a place of its own in the rail and the phone's tab bar, after Graph
    [[".navigation-rail .navigation-link[href='/graph']", ".rail-label"], [".tab-bar .tab-bar-link[href='/graph']", "span"]].forEach(([sel, lab]) => {
      const g = $(sel, root); if (!g) return;
      const a = g.cloneNode(true); a.setAttribute("href", "/loci"); a.removeAttribute("aria-current"); if (a.title) a.title = "Loci";
      const sv = a.querySelector("svg"); if (sv) { const w = sv.getAttribute("width"); sv.outerHTML = svg("spark", Number(w) || 18).replace("<svg ", `<svg class="${sv.getAttribute("class") || ""}" `); }
      const l = a.querySelector(lab); if (l) l.textContent = "Loci";
      g.after(a);
    });
  }
  let toastMsg = null, toastTimer = 0, undoFn = null;
  function toast(t, undo) { undoFn = undo || null; toastMsg = { t, undo: !!undo }; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toastMsg = null; undoFn = null; $(".sm-toast", root)?.remove(); }, 5200); }
  function canvas() {
    if (S.edit) return editorView();
    if (S.newer) return newView();
    if (S.study && studyById(S.study)) return studyPage(studyById(S.study));
    if (S.issue && issueById(S.issue)) return issuePage(issueById(S.issue));
    const r = S.open && RR(S.open);
    if (r) return routinePage(r);
    if (S.seg === "waiting") return waitingSeg();
    if (S.seg === "activity") return activitySeg();
    if (S.seg === "finds") return findsSeg();
    if (S.seg === "connections") return connectionsSeg();
    return `${tiles()}${bar()}${routinesSeg()}`;
  }
  function crumb() {
    const r = S.open && RR(S.open);
    if (S.edit) return ["Tasks", S.edit.isNew ? "New routine" : `${RR(S.edit.id)?.name || ""}: editing`];
    if (S.newer) return ["Tasks", "New task"];
    if (S.study && studyById(S.study)) return ["Tasks", studyById(S.study).short];
    if (S.issue && issueById(S.issue)) return ["Finds", issueById(S.issue).date];
    if (r) return ["Tasks", r.name];
    return [{ routines: "Tasks", finds: "Finds", waiting: "Waiting", activity: "Activity", connections: "Connections" }[S.seg]];
  }
  function render() {
    const scroll = window.scrollY, active = document.activeElement?.id;
    let canvasScroll = $(".rx-canvas", root)?.scrollTop || 0, stageScroll = $(".main-stage", root)?.scrollTop || 0;
    if (C.resetScroll) { canvasScroll = 0; stageScroll = 0; }
    if (S.view === "today") todayView();
    else if (S.view === "everything") everythingView();
    else {
      shell("library");
      $$(`.navigation-rail .navigation-link[href="/loci"], .tab-bar .tab-bar-link[href="/loci"]`, root).forEach((a) => a.setAttribute("aria-current", "page"));
      $("main", root).innerHTML = `<h1 class="visually-hidden">Tasks</h1>${header("routines", crumb())}<div class="rx-split"><div class="rx-canvas">${canvas()}</div>${panel()}</div>`;
      const c = $(".rx-canvas", root); if (c) c.scrollTop = canvasScroll;
      const st = $(".main-stage", root); if (st) st.scrollTop = stageScroll;
      const b = $("#rx-body", root); if (b && (threadOf(tkey()).length || C.typing)) b.scrollTop = b.scrollHeight;
    }
    if (S.pop) root.insertAdjacentHTML("beforeend", popHTML());
    root.insertAdjacentHTML("beforeend", `<div class="sm-proto rx-proto" role="group" aria-label="Prototype controls"><span>Prototype</span>${[["routines", "Loci"], ["today", "Today"]].map(([k, l]) => `<button type="button" data-act="view" data-v="${k}" aria-pressed="${S.view === k}">${l}</button>`).join("")}<i class="sm-proto-sep" aria-hidden="true"></i><button type="button" data-act="send-open" aria-expanded="${S.sendOpen}">Send something…</button><button type="button" data-act="builder" aria-pressed="${S.builder}">Builder</button></div>`);
    if (S.sendOpen) root.insertAdjacentHTML("beforeend", `<div class="rx-sendpop" role="dialog" aria-label="Send something"><p class="rx-popk">Send something to Studiolo (simulated)</p>${SEND.map((m) => `<button type="button" class="rx-opt rx-plain" data-act="send" data-v="${m.id}"${S.sent.has(m.id) ? " disabled" : ""}>${esc(m.label)}</button>`).join("")}<p class="rx-sendnote">See what your routines do with it: filed on its own, waiting for you, or not covered yet.</p></div>`);
    if (toastMsg) root.insertAdjacentHTML("beforeend", `<div class="sm-toast rx-toast" role="status"><span>${esc(toastMsg.t)}</span>${toastMsg.undo ? '<button type="button" data-act="toast-undo">Undo</button>' : ""}</div>`);
    window.scrollTo(0, C.resetScroll ? 0 : scroll);
    C.resetScroll = false;
    if (active) { const el = document.getElementById(active); if (el) { el.focus({ preventScroll: true }); if (el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && el.type !== "time")) try { el.setSelectionRange(el.value.length, el.value.length); } catch { /* not a text field */ } } }
  }
  function go(view) { S.view = view; S.pop = null; S.sendOpen = false; C.resetScroll = true; try { history.replaceState(null, "", "#" + view); } catch { /* sandboxed */ } }

  /* ================================================================ events */
  root.addEventListener("submit", (ev) => {
    if (ev.target.matches('[data-form="study"]')) { ev.preventDefault(); const v = ($("#st-subject", root)?.value || "").trim(); if (v) startStudyChat(cap(v)); return; }
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
    const t = ev.target;
    if (t.id === "rx-text") { C.input = t.value; return; }
    if (!S.edit) return;
    const d = S.edit.d;
    if (t.id === "ed-name") { d.name = t.value; render(); }
    else if (t.id === "ed-label") { d.label = t.value; d.name = d.name || ""; render(); }
    else if (t.dataset.edc) { const c = d.ifs.find((x) => x.t === t.dataset.edc); if (c) c.v = t.dataset.edc === "tag" && t.value && !t.value.startsWith("#") ? "#" + t.value : t.value.trim().toLowerCase(); render(); }
  });
  root.addEventListener("focusin", (ev) => { if (ev.target.id === "rx-text" && mobile() && !S.sheet) { S.sheet = true; render(); } });
  root.addEventListener("change", (ev) => {
    const t = ev.target;
    if (t.dataset.fs) { const [f] = findById(t.dataset.f); if (f) f[t.dataset.fs] = t.value; return; }
    if (t.id === "pop-time" && S.pop) { const r = popTarget(), before = JSON.stringify(r); r.time = t.value || r.time; changed(r, before); render(); return; }
    if (!S.edit) return;
    const d = S.edit.d;
    if (t.id === "ed-time") { d.time = t.value || d.time; render(); }
    else if (t.dataset.ed === "fileAs" || t.dataset.ed === "on") { d.then[t.dataset.ed] = t.value; render(); }
    else if (t.dataset.ed === "place") { d.place = t.value; d.label = ""; render(); }
    else if (t.dataset.ed === "cond-is" || t.dataset.ed === "cond-about") { const c = d.ifs.find((x) => x.t === t.dataset.ed.slice(5)); if (c) c.v = t.value; render(); }
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
      if (h === "/today") go("today"); else if (h === "/library") go("everything"); else if (h === "/loci") { go("routines"); goSeg("routines"); } else { toast("Only Loci, Commonplace and Today are in this prototype."); render(); return; }
      render(); return;
    }
    const a = t.dataset.act, r = t.dataset.r ? RR(t.dataset.r) : null;
    if (t.tagName === "A") ev.preventDefault();
    switch (a) {
      case "dtab": {
        const v = t.dataset.v;
        if (v === "routines") { go("routines"); goSeg("routines"); }
        else if (v === "everything") go("everything");
        else { toast(`In the app this opens ${t.textContent.trim()}. This prototype has Everything and Routines.`); }
        break;
      }
      case "tile": { const v = t.dataset.v; if (v === "studies") { goSeg("routines"); S.kind = S.kind === "study" ? "all" : "study"; break; } if (v === "waiting" || v === "activity" || v === "finds") goSeg(v); else { goSeg("routines"); S.only = v === "paused" ? "paused" : null; } break; }
      case "seg": goSeg(t.dataset.v); break;
      case "kind": S.kind = t.dataset.v; break;
      case "open-r": if (!r) return; openRoutine(r.id); break;
      case "back":
        if (S.study) { S.study = null; S.ptab = "all"; }
        else if (S.issue) { const from = S.issueFrom; S.issue = null; if (from && from !== "finds" && RR(from)) S.open = from; else { S.seg = "finds"; S.ptab = "all"; } }
        else if (S.edit) { S.edit = null; }
        else { S.open = null; S.newer = false; S.ptab = "all"; }
        C.resetScroll = true; break;
      case "ptab": S.ptab = t.dataset.v; break;
      case "fold": S.sheet = false; break;
      case "new": S.study = null; S.issue = null; S.newer = true; S.open = null; S.edit = null; S.ptab = "all"; C.resetScroll = true; break;
      case "tell": {
        if (mobile()) S.sheet = true;
        const lastMsg = C.all[C.all.length - 1];
        if (!lastMsg || lastMsg.a !== "new") {
          C.force = "all";
          lociSay("What should happen, and when? Say it the way you'd tell an assistant, or start from one of these.", { a: "new", opts: optsOf([["When I email myself a PDF, sum it up in three lines and put it on its topic", "say"], ["Every evening, sort what I haven't sorted", "say"], ["Keep me up to date on AI in architecture", "say"]]) });
          C.force = null;
        }
        render(); $("#rx-text", root)?.focus(); return;
      }
      case "blank": { const v = t.dataset.v; const d = blank(v === "follow" ? "schedule" : v); if (v === "follow") { edSet(d, "skind", "follow"); d.every = "day"; } startEdit(d, true, "new"); break; }
      case "new-follow": { const d = blank("schedule"); edSet(d, "skind", "follow"); d.every = "day"; startEdit(d, true, null); break; }
      case "tpl": startEdit(TPL[Number(t.dataset.v)], true, "new"); break;
      case "edit": if (!r) return; startEdit(r, false); break;
      case "edit-at": if (!r) return; startEdit(r, false); S.fnOpen = t.dataset.v; break;
      case "pick": startEdit(blank("arrive"), true, "pick"); S.fnOpen = "trigger"; break;
      case "fn-open": S.fnOpen = S.fnOpen === t.dataset.v ? null : t.dataset.v; S.fnAdd = null; break;
      case "fn-add": { const i = Number(t.dataset.v); S.fnAdd = S.fnAdd === i ? null : i; break; }
      case "fn-step": {
        const d = S.edit.d, v = t.dataset.v, tt = d.then;
        if (v.startsWith("und:")) { const u = v.slice(4); tt.understand.push(u); if (u === "summary" && !tt.understand.includes("text")) tt.understand.unshift("text"); }
        else if (v.startsWith("lrn:")) tt.learn.push(v.slice(4));
        else if (v === "reply") tt.reply = "confirm";
        else if (v === "project") { tt.addTo = "project"; if (tt.on === "best") tt.on = ""; }
        else if (v === "toread") tt.status = "To read";
        S.fnAdd = null; S.fnOpen = v.includes(":") ? v : v === "reply" ? "reply" : "file"; break;
      }
      case "fn-rm": {
        const d = S.edit.d, v = t.dataset.v, tt = d.then;
        if (v.startsWith("und:")) { const u = v.slice(4); tt.understand = tt.understand.filter((x) => x !== u && !(u === "summary" && x === "text")); }
        else if (v.startsWith("lrn:")) tt.learn = tt.learn.filter((x) => x !== v.slice(4));
        else if (v === "reply") tt.reply = "";
        S.fnOpen = null; break;
      }
      case "ed-trig": pickTrigger(S.edit, t.dataset.v); break;
      case "cn": toast(t.dataset.v); break;
      case "dupe": if (!r) return; startEdit({ ...clone(r), id: "draft", name: `${r.name} (copy)`, lately: [] }, true, null); toast(`A copy of “${r.name}”. Change what you need, then turn it on.`); break;
      case "draft-edit": if (!C.draft) return; startEdit(C.draft, true, "draft"); break;
      case "ed-set": edSet(S.edit.d, t.dataset.f, t.dataset.v); break;
      case "ed-tog": {
        const d = S.edit.d, v = t.dataset.v, f = t.dataset.f;
        if (f === "und") { const u = d.then.understand; if (u.includes(v)) d.then.understand = u.filter((x) => x !== v && !(v === "summary" && x === "text")); else { u.push(v); if (v === "summary" && !u.includes("text")) u.unshift("text"); } }
        if (f === "learn") d.then.learn = d.then.learn.includes(v) ? [] : [v];
        if (f === "reply") d.then.reply = d.then.reply === v ? "" : v;
        if (f === "fkind") { const ks = d.kinds || []; d.kinds = ks.includes(v) ? (ks.length > 1 ? ks.filter((x) => x !== v) : ks) : [...ks, v]; }
        if (f === "src") { const k = d.sources.indexOf(v); if (k >= 0) { if (d.sources.length > 1) d.sources.splice(k, 1); } else d.sources.push(v); }
        break;
      }
      case "ed-addc": { const v = t.dataset.v; S.edit.d.ifs.push({ t: v, v: { tag: "#", site: "", words: "", is: "a book", about: "climate" }[v] }); render(); if (["tag", "site", "words"].includes(v)) $(`#ed-c-${v}`, root)?.focus(); return; }
      case "ed-rmc": S.edit.d.ifs = S.edit.d.ifs.filter((c) => c.t !== t.dataset.v); break;
      case "ed-cancel": { const E = S.edit; S.edit = null; if (E.isNew && (E.from === "new" || E.from === "pick")) S.newer = true; C.resetScroll = true; break; }
      case "ed-save": {
        const E = S.edit, d = E.d;
        if ((E.isNew && !E.chosen) || (d.type === "arrive" && !d.ifs.length)) return;
        if (!d.name.trim()) d.name = autoNameAny(d);
        if (E.isNew) {
          const nr = addRoutine(d);
          if (E.from === "draft") { snapDrafts(true); clearDraft(); }
          S.edit = null; openRoutine(nr.id); flash(nr.id, 2000);
          toast(`“${nr.name}” is on.${nr.type === "arrive" && nr.mode === "ask" ? " It'll ask you about the first few." : ""}`);
        } else {
          const o = RR(E.id), before = JSON.stringify(o);
          Object.assign(o, clone(d), { id: o.id }); S.edit = null; C.resetScroll = true; flash(o.id, 1600);
          toast(`Saved changes to “${o.name}”.`, () => Object.assign(o, JSON.parse(before)));
        }
        break;
      }
      case "idea": if (mobile()) S.sheet = true; S.ptab = "all"; if (!S.newer) { S.open = null; S.edit = null; } onSay(t.dataset.v); return;
      case "noticed": {
        const p = RR("r5"); if (!p) return;
        S.ptab = "all";
        p.ifs.find((x) => x.t === "site").v += ", dezeen.com"; S.noticed = "done"; flash(p.id, 2000);
        C.force = "all"; meSay("File dezeen.com links as Precedents");
        lociSay("Done. “Precedents” now files links from dezeen.com too: as Precedents on the topic each one is about, To read. Of your last 20 things, 3 would have gone there.", { opts: optsOf([["Undo that", "noticed-undo"], ["Open “Precedents”", "open", p.id]]) });
        C.force = null; break;
      }
      case "prompt": if (mobile()) S.sheet = true; onSay(t.dataset.v); return;
      case "why": {
        if (!r) return;
        const x = r.lately[Number(t.dataset.i)]; if (!x) return;
        if (mobile()) S.sheet = true;
        S.ptab = "this"; C.force = r.id; meSay(`Why did “${x.t}” go there?`); think(() => lociSay(whyText(r, x)), 500); C.force = null; return;
      }
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
      case "trust": { const before = JSON.stringify(r); r.mode = "own"; flash(r.id, 1400); toast(`“${r.name}” files on its own now. Undo anything from Activity.`, () => Object.assign(r, JSON.parse(before))); break; }
      case "toggle": { const before = JSON.stringify(r); r.on = !r.on; toast(`“${r.name}” is ${r.on ? "on" : "paused"}.`, () => Object.assign(r, JSON.parse(before))); break; }
      case "up": case "down": {
        const list = ROUTINES.filter((x) => x.type === "arrive"), i = list.indexOf(r), j = a === "up" ? i - 1 : i + 1;
        if (j < 0 || j >= list.length) return;
        const ki = ROUTINES.indexOf(r), kj = ROUTINES.indexOf(list[j]);
        [ROUTINES[ki], ROUTINES[kj]] = [ROUTINES[kj], ROUTINES[ki]];
        toast(`“${r.name}” is now ${ord(arrivePos(r))} in line.`); flash(r.id, 1400); break;
      }
      case "del": {
        if (!r) return;
        const k = ROUTINES.indexOf(r); ROUTINES.splice(k, 1); S.open = null; S.edit = null; S.ptab = "all"; C.resetScroll = true;
        toast(`Deleted “${r.name}”. What it filed stays where it is.`, () => ROUTINES.splice(k, 0, r)); break;
      }
      case "chip": {
        if (t.dataset.r === "snap") return;
        const rect = t.getBoundingClientRect(), wv = window.innerWidth, hv = window.innerHeight;
        const x = Math.max(12, Math.min(rect.left, wv - 292)), below = rect.bottom + 6;
        const y = below + 300 > hv && rect.top > 320 ? Math.max(12, rect.top - 306) : Math.min(below, hv - 120);
        S.pop = S.pop && S.pop.r === t.dataset.r && S.pop.f === t.dataset.f ? null : { r: t.dataset.r, f: t.dataset.f, x, y };
        break;
      }
      case "pop-set": case "pop-text": case "pop-remove": case "pop-src": case "pop-fk": {
        const P = S.pop, x = popTarget(), before = JSON.stringify(x);
        if (a === "pop-set") { setField(x, P.f, t.dataset.v); S.pop = null; }
        if (a === "pop-text") { const v = ($("#pop-text", root)?.value || "").trim(); if (v) setField(x, P.f, P.f === "tag" && !v.startsWith("#") ? "#" + v : v); S.pop = null; }
        if (a === "pop-remove") { x.ifs = x.ifs.filter((c) => c.t !== P.f); S.pop = null; }
        if (a === "pop-fk") { const v = t.dataset.v, ks = x.kinds || []; x.kinds = ks.includes(v) ? (ks.length > 1 ? ks.filter((y) => y !== v) : ks) : [...ks, v]; }
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
        startEdit({ ...blank("arrive"), when: it.ch, ifs: [{ t: "kind", v: it.kind }, ...(it.site ? [{ t: "site", v: it.site }] : [])] }, true, null);
        toast("A new routine for things like this. Fill in where they go.");
        break;
      }
      case "p-act": {
        const w = W.find((x) => x.id === t.dataset.w), x = w.items[Number(t.dataset.i)];
        x.st = t.dataset.v;
        if (w.items.every((y) => y.st)) { W.splice(W.indexOf(w), 1); toast("The To read pile is done until next month."); }
        break;
      }
      case "act-undo": { const x = ACT[Number(t.dataset.i)], rr = RR(x.rid); x.state = "undone"; x.undo = false; if (rr) { rr.filed = Math.max(0, rr.filed - 1); rr.lately.shift(); } toast("Undone. It's back in Unsorted, and the routine counts it as a miss."); break; }
      case "goto": goSeg(t.dataset.v); break;
      case "open-issue": openIssue(t.dataset.v); break;
      case "iss-back": { const from = S.issueFrom; S.issue = null; S.findNo = null; if (from && from !== "finds" && RR(from)) { S.open = from; S.ptab = "this"; } else { S.seg = "finds"; S.ptab = "all"; } C.resetScroll = true; break; }
      case "f-save": case "f-later": {
        const [f] = findById(t.dataset.v); if (!f) return;
        f.st = a === "f-save" ? "saved" : "later"; S.findNo = null;
        const q = f.why.find((w) => w.t === "q");
        toast(a === "f-save" ? `Saved “${f.title}” as ${f.as} on ${PLACES[f.on]?.name || "your map"}.${q ? " It's linked to your question." : ""}` : `“${f.title}” is in To read.`, () => { f.st = null; });
        break;
      }
      case "f-no": S.findNo = t.dataset.v; break;
      case "f-reason": { const [f] = findById(t.dataset.v); if (!f) return; f.st = "no"; f.reason = t.dataset.r2; S.findNo = null; toast(f.reason === "Not from this source" ? `Got it: fewer from ${f.src}.` : f.reason === "Just not now" ? "Skipped for now." : "Got it: fewer like this.", () => { f.st = null; f.reason = null; }); break; }
      case "f-undo": { const [f] = findById(t.dataset.v); if (f) { f.st = null; f.reason = null; } break; }
      case "f-ask": {
        const [f, iss] = findById(t.dataset.v); if (!f) return;
        if (mobile()) S.sheet = true;
        S.ptab = "this"; C.force = iss.rid; meSay(`Tell me about “${f.title}”`);
        const q = f.why.find((w) => w.t === "q");
        think(() => lociSay(`${f.sum}\nIt fits ${PLACES[f.topic]?.name || "your map"}, beside 3 things you've saved there.${q ? ` It may answer your question “${q.v}”.` : ""}`, { opts: optsOf([["Save it and make a Lumen", "find-lumen", f.id], ["Study this in depth", "find-study", f.id], ["Compare with what I've saved", "find-compare", f.id], ["Just save it", "find-save", f.id]]) }), 500);
        C.force = null; return;
      }
      case "iss-later": case "iss-clear": {
        const iss = issueById(t.dataset.v), touched = iss.items.filter((f) => !f.st);
        touched.forEach((f) => { f.st = a === "iss-later" ? "later" : "no"; });
        toast(a === "iss-later" ? `${plural(touched.length, "find")} put in To read.` : `${plural(touched.length, "find")} cleared.`, () => touched.forEach((f) => { f.st = null; }));
        break;
      }
      case "left-see": toast("In the app, this lists everything left out, in case Loci got one wrong."); break;
      case "check-now": {
        if (!r) return;
        toast(`Looking through ${plural(r.sources.length, "source")}…`); render();
        setTimeout(() => {
          const pool = SAMPLE.filter((f) => !r.kinds || r.kinds.includes(f.kind)), items = (pool.length ? pool : SAMPLE).slice(0, r.count).map((f, i) => ({ ...clone(f), id: `f${r.id}-${iid}-${i}`, top: i === 0 }));
          const iss = { id: "i" + ++iid, rid: r.id, date: "Monday 26 October", when: "Just now", sources: r.sources.length, checked: 27, left: [[2, "already in your Commonplace"], [8, "off your topics"]], items };
          ISSUES.unshift(iss); r.lately.unshift({ t: plural(items.length, "find"), w: "on a new Finds page", when: "Just now" });
          if (r.stat === "New") r.stat = "Ran once";
          openIssue(iss.id, r.id); toast(`${plural(items.length, "find")} for “${r.name}”.`); render();
        }, 900);
        return;
      }
      case "today-finds": go("routines"); openIssue(t.dataset.v, "finds"); break;
      case "open-study": go("routines"); openStudy(t.dataset.v); break;
      case "today-study": go("routines"); openStudy(t.dataset.v); break;
      case "new-study": S.study = null; S.issue = null; S.newer = true; S.open = null; S.edit = null; S.ptab = "all"; C.resetScroll = true; break;
      case "st-begin": { const v = ($("#st-subject", root)?.value || "").trim(); if (!v) { $("#st-subject", root)?.focus(); toast("Say what to study first, in a few words."); render(); return; } startStudyChat(cap(v)); return; }
      case "st-idea": startStudyChat(t.dataset.v); return;
      case "st-start": startStudy(); break;
      case "st-change": C.force = "all"; lociSay("What should change?", { opts: optsOf([["One question fewer", "st-fewer"], ["Add: how it applies to the prayer hall", "st-addapp"], [C.plan?.mine ? "Use the open web too" : "Only my Commonplace and books", "st-mine"], [C.plan?.depth === "deep" ? "Make it standard" : "Make it deep", "st-deeper"]]) }); C.force = null; break;
      case "st-not": C.force = "all"; C.plan = null; C.sq = null; lociSay("Fine, nothing started. Say “study …” whenever you want one."); C.force = null; break;
      case "st-stop": { const st = studyById(t.dataset.v); if (st) { st.state = "stopped"; toast("Stopped. What it found so far is kept."); } break; }
      case "st-resume": { const st = studyById(t.dataset.v); if (st) st.state = "running"; break; }
      case "st-skip": { const st = studyById(t.dataset.v); if (!st) return; for (let i = 0; i < TPS && st.state === "running"; i++) advance(st); break; }
      case "st-lesson": { const st = studyById(t.dataset.v); if (!st) return; const l = stNext(st); toast(`In the app, this opens “${l ? l.t : ""}” in Learn › Courses. Each lesson is made when you reach it.`); break; }
      case "st-readings": { const st = studyById(t.dataset.v); toast(`In the app, this opens the collection “${st ? st.collection : ""}” in Commonplace.`); break; }
      case "st-questions": toast("In the app, this opens Questions and goals, with the new questions at the top."); break;
      case "st-sources": toast("In the app, this lists every source it kept, with why."); break;
      case "st-watch": { const st = studyById(t.dataset.v); if (st) watchFromStudy(st); break; }
      case "st-again": { const st = studyById(t.dataset.v); if (!st) return; S.study = null; S.ptab = "all"; C.force = "all"; meSay(`Study ${st.subject.toLowerCase()} again, deeper`); C.sq = { subject: st.subject, know: "some", use: st.use, time: st.time, depth: "deep" }; C.plan = makePlan(C.sq); lociSay("Here's a deeper plan. It starts from what the first study found, so it costs a little less.", { card: "plan", plan: C.plan }); C.force = null; break; }
      case "ed-addsrc": { const v = ($("#ed-src", root)?.value || "").trim(); if (!v) return; if (!S.edit.d.sources.includes(v)) S.edit.d.sources.push(v); break; }
      case "today-look": go("routines"); goSeg(W.length ? "waiting" : "routines"); break;
      case "go-routines": go("routines"); goSeg("routines"); break;
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
  if (start === "everything") S.view = "everything";
  if (["waiting", "activity"].includes(start)) S.seg = start;
  if (start === "new") S.newer = true;
  if (start === "tasks") S.seg = "routines";
  // the prototype's clock for studies: every 1.4 s a running study moves on a step; the page redraws if it shows it
  setInterval(() => {
    const run = STUDIES.filter((x) => x.state === "running"); if (!run.length) return;
    run.forEach(advance);
    const ae = document.activeElement;
    if ((ae && /^(TEXTAREA|INPUT|SELECT)$/.test(ae.tagName) && ae.value) || S.pop || S.sendOpen || C.typing) return;
    if (S.view === "today" || (S.view === "routines" && !S.edit && !S.newer && (S.study || (!S.open && !S.issue && S.seg === "routines")))) render();
  }, 1400);
  if (start === "study") { S.study = "st1"; S.ptab = "this"; }
  if (start === "studying") { S.study = "st2"; S.ptab = "this"; }
  if (["finds", "connections"].includes(start)) S.seg = start;
  render();
})();
