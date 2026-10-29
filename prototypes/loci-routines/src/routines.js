/* Loci routines (prototype, version 3).
   Routines are small automations for a Commonplace, in three families by what starts them:
   - When something arrives (the new core): everything the learner sends, from WhatsApp, a phone share, email, the
     browser or Studiolo itself, comes through one door and meets their filing rules, top to bottom. A rule is
     When / If / Then, written as a sentence or set with choices; it files (a collection is a kind of thing, never a
     folder; a topic is where it belongs), has Loci read or transcribe it, turns questions into @questions, and can
     reply on WhatsApp. New rules ask first; after 9 right in 10, Loci offers to let one file on its own. Rules are
     also suggested from what the learner keeps doing by hand. Every filed item says which rule filed it, with Undo.
   - On a schedule: the 25 Oct routines (Follow sources, reading list, review, questions and goals…), grouped by
     Store / Manage / Learn, plus Tidy Unsorted, Clear the To read pile and Keep sources alive.
   - When something happens: small follow-ups (a Lumen's check comes back in 3 days, highlights become questions).
   Views: Routines, Inbox (send something and watch the rules act), Runs, Today, In Loci, and Builder (how each
   arrival and run worked). The shell, Today and Loci screens are the app's own DOM and CSS, captured read-only from
   studiolo's /dev/specimens (see ../live-lumens/capture/capture.cjs).
   Spec: docs/superpowers/specs/2026-10-29-routines-filing-rules-design.md */
(() => {
  "use strict";
  const DATA = JSON.parse(document.getElementById("vx-data").textContent);
  const root = document.getElementById("vx-app");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  DATA.htmlClass.split(/\s+/).filter(Boolean).forEach((c) => document.documentElement.classList.add(c));

  /* ================================================================ time: "now" is Monday 26 October 2026, 8:10 */
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
    return `${same(d, NOW) ? "Today" : same(d, y) ? "Yesterday" : same(d, t) ? "Tomorrow" : fDay(d)}, ${fTime(d)}`;
  };
  const plural = (n, w, ws) => `${n} ${n === 1 ? w : ws || w + "s"}`;

  /* ================================================================ the sample learner's places (examples) */
  const PLACES = {
    you: { name: "your whole map", short: "Everywhere", path: "You", st: null, has: "64 saves · 21 Lumens · 9 open questions", card: "Architect · prayer hall in Dubai" },
    climate: { name: "Climate-responsive design", path: "Culture & Context › Climate-responsive design", st: 1, has: "14 saves · 3 Lumens · 4 open questions", card: "Basics · for work · 1 to revisit" },
    islamic: { name: "Islamic architecture", path: "History & Theory › Islamic architecture", st: 2, has: "22 saves · 6 Lumens · 2 open questions", card: "Regular · the mihrab and the qibla wall" },
    daylight: { name: "Daylight & shading", path: "Envelope & Facade › Daylight & shading", st: 1, has: "11 saves · 2 Lumens", card: "Regular · for work" },
    precast: { name: "Precast", path: "Envelope & Facade › Facade systems › Precast", st: 1, has: "9 saves · 2 Lumens · 1 open question", card: "Basics · 1 to revisit" },
    board: { name: "Cooling the prayer-hall courtyard", path: "Board at Climate-responsive design", st: null, has: "17 cards · 9 arrows · 4 questions", card: "Goal: brief the engineer" },
    project: { name: "Prayer hall, Al Barsha", path: "Work › Project", st: null, has: "3 questions · 12 references", card: "Stage: concept design" },
    unsorted: { name: "Unsorted", path: "Commonplace › Unsorted", st: null, has: "9 entries with no place yet", card: "No place on Loci yet" },
    vernacular: { name: "Vernacular & regional", path: "Culture & Context › Vernacular & regional", st: 0, has: "6 saves", card: "New · for work" },
    home: { name: "Home & family", path: "Home & family (area)", st: 0, has: "8 saves", card: "Not for work" },
  };
  const PLACE_ORDER = [["Your map", ["you", "climate", "islamic", "daylight", "precast", "vernacular", "home"]], ["Boards", ["board"]], ["Work", ["project"]], ["Commonplace", ["unsorted"]]];

  /* ================================================================ the four jobs, and the kinds of routine */
  const JOBS = [
    { k: "store", name: "Store", line: "Bring things in and file them where they belong." },
    { k: "manage", name: "Manage", line: "Keep Commonplace in order: sorted, current, not piling up." },
    { k: "learn", name: "Learn", line: "Turn what you've kept into something you know, and keep knowing it." },
  ];
  // each kind: its job, the verb phrase of its sentence (p = the place's name), cost per run (% of the monthly allowance)
  const KINDS = {
    watch: { job: "store", name: "Watch sources", blurb: "News, papers and talks from sources you pick, sorted onto your topics", cost: 0.3, place: "you", every: "day", time: "07:30", to: "today",
      say: (p, r) => `read my ${plural(r.sources.length, "source")}, keep what fits ${p}, and sort it onto topics` },
    reading: { job: "store", name: "Reading list", blurb: "Real books and articles you don't have yet, checked in a catalogue", cost: 0.4, place: "climate", every: "w1", time: "07:00", to: "today+email",
      say: (p) => `look through ${p} for books and articles I don't have` },
    questions: { job: "learn", name: "Questions and goals", blurb: "Your open questions and goals at a place, each matched to a Lumen, a reading or an answer you already have", cost: 0.35, place: "climate", every: "w0", time: "18:00", to: "today",
      say: (p) => `go through my open questions and goals at ${p} and suggest a Lumen for each one my saves can answer` },
    week: { job: "learn", name: "Lumen of the week", blurb: "One short Lumen from what you saved this week, so saving turns into learning", cost: 0.25, place: "you", every: "w5", time: "16:00", to: "today",
      say: (p) => `gather what I saved this week across ${p} and outline one Lumen from it` },
    tidy: { job: "manage", name: "Tidy Unsorted", blurb: "Goes through Unsorted: files what your rules now cover, suggests a place for the rest", cost: 0.05, place: "unsorted", every: "day", time: "21:00", to: "today",
      say: (p) => `go through ${p}, file what my rules cover and suggest a place for the rest` },
    review: { job: "learn", name: "Review", blurb: "A few questions on what slipped this week, and one from longer ago", cost: 0.1, place: "precast", every: "w5", time: "17:00", to: "today",
      say: (p) => `ask me about what slipped at ${p} this week, and one thing from longer ago` },
    brief: { job: "learn", name: "Daily brief", blurb: "Five minutes of audio for the commute: your step, your saves, one question", cost: 0.6, place: "you", every: "weekdays", time: "06:45", to: "today+audio",
      say: (p) => `make five minutes of audio from ${p}: today's step, yesterday's saves and one question` },
    digest: { job: "learn", name: "Board digest", blurb: "A board's open questions, and what on it already helps answer them", cost: 0.2, place: "board", every: "w4", time: "18:00", to: "today",
      say: (p) => `list the open questions on “${p}” and what on it already helps` },
    project: { job: "learn", name: "Project update", blurb: "What moved on a piece of work: decisions, open questions, gaps to learn", cost: 0.25, place: "project", every: "w5", time: "16:00", to: "today+email",
      say: (p) => `sum up the week on ${p}: decisions, open questions and gaps to learn` },
    pile: { job: "manage", name: "Clear the To read pile", blurb: "Once a month, what's sat in To read for over three months: keep it, read it this week, or let it go", cost: 0, place: "you", every: "month", time: "09:00", to: "today",
      say: (p) => `show me what's been in To read for over three months across ${p}, so I can keep it, read it this week or let it go` },
    alive: { job: "manage", name: "Keep sources alive", blurb: "Checks your saved links, and keeps the copy you saved when one stops working", cost: 0, place: "you", every: "month", time: "09:30", to: "today",
      say: (p) => `check every link saved across ${p}, and keep my saved copy of any that stopped working` },
  };
  const EVERY = [["day", "Every day"], ["weekdays", "Weekdays"], ...[1, 2, 3, 4, 5, 6, 0].map((d) => ["w" + d, "Every " + DAYLONG[d]]), ["month", "Every month"]];
  const TO = [["today", "Today"], ["today+email", "Today and email"], ["today+audio", "Today, as audio"], ["email", "email"]];
  const runsMonth = (e) => (e === "day" ? 30 : e === "weekdays" ? 22 : e === "month" ? 1 : 4.3);

  /* ================================================================ what runs produce (examples) */
  const BOOKS = {
    climate: [
      { id: "olgyay", t: "Design with Climate", a: "Victor Olgyay", y: "1963; new edition 2015", k: "book", lv: "Regular", why: "The book that set out bioclimatic design: from climate data to building form." },
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
      { id: "holod", t: "The Mosque and the Modern World", a: "Renata Holod and Hasan-Uddin Khan", y: "1997", k: "book", lv: "Regular", why: "Recent mosques and how their architects handled the qibla wall." },
      { id: "blairbloom", t: "The Art and Architecture of Islam 1250–1800", a: "Sheila S. Blair and Jonathan M. Bloom", y: "1994", k: "book", lv: "Regular", why: "Named buildings and primary sources, as your note here asks." },
    ],
    precast: [
      { id: "elliott", t: "Precast Concrete Structures", a: "Kim S. Elliott", y: "2nd edition, 2016", k: "book", lv: "Regular", why: "Connections and fixings in detail, which is where your heat question sits." },
      { id: "pciarch", t: "Architectural Precast Concrete", a: "Precast/Prestressed Concrete Institute", y: "3rd edition, 2007", k: "book", lv: "Regular", why: "Joints, reveals and tolerances from the architect's side of the table." },
    ],
  };
  // Watch items are invented examples (no real articles are named); in the app they come from the learner's own sources.
  const ARRIVALS = [
    { t: "A shading study that runs a courtyard through a whole August day in seconds", src: "Design-tools newsletter", k: "Article", topic: "climate", why: "Tests the 3 pm shade question on your board without a full simulation." },
    { t: "Predicting airflow through wind towers with a trained model", src: "Building-science journal", k: "Paper", topic: "climate", why: "Gives a number for the malqaf question you couldn't answer from your saves." },
    { t: "Daylight simulation in the browser: what it gets right and wrong", src: "Practice blog", k: "Article", topic: "daylight", why: "Relevant to the qibla-wall glare question on your project." },
    { t: "Text-to-plan tools and the qibla: why generated mosque layouts go wrong", src: "Architecture news site", k: "Article", topic: "islamic", why: "Close to your work. You know the plan types well, so it's pitched at Regular." },
    { t: "Talk: how one practice uses image models for early massing", src: "Conference channel", k: "Video, 34 min", topic: { new: "AI in design" }, why: "Nothing on your map fits yet. It would start a sub-topic “AI in design”." },
  ];
  const QUESTIONS = [
    { kind: "goal", q: "Understand how to keep the court cool without machines, well enough to brief the engineer", host: "Board “Cooling the prayer-hall courtyard” · its goal", verdict: "progress", progress: [2, 4], next: "Two of its questions can be answered from what you have. Start with the night air." },
    { kind: "question", q: "Why does the air move at night?", host: "Margin note on “Wind and the court” at 12:40 · 21 Oct", verdict: "lumen",
      lumen: { title: "Why night air moves through a court", slides: ["The court after sunset", "Warm air rises out of the hall", "Cool air pools in the court", "What that means for your prayer hall"], from: ["Fathy, Natural Energy and Vernacular Architecture (saved 12 Oct)", "Your section of the Yazd malqaf", "Your note “catch the wind at 8 m”"] } },
    { kind: "question", q: "How much does a malqaf cool a hall for 600?", host: "On the board, between the malqaf section and your note", verdict: "find", gap: "Your saves describe how a malqaf works, but none give numbers for a hall this size." },
    { kind: "question", q: "Where should the court's shade fall at 3 pm?", host: "Short note · 19 Oct", verdict: "answered", answeredIn: "Your Lumen “Shade and the afternoon court”, slide 3" },
  ];
  const WEEK = { saves: ["Heschong, Thermal Delight in Architecture (book)", "Section of the Bait Ur Rouf mosque (photo)", "“The court is the building's lung” (quote)", "Mihrab tolerances on site (note)", "Ford, The Architecture of Natural Cooling (book)"],
    lumen: { title: "Cool by design: three things you saved this week", slides: [["Why cool feels good", "Heschong"], ["A court that breathes", "the Bait Ur Rouf section and your quote"], ["Cooling without machines, today", "Ford"], ["Check yourself", "two questions from your week"]] }, left: "Your note on mihrab tolerances is about Precast, so it stays out of this one." };
  const UNSORTED = [
    { t: "Screenshot of a jali screen pattern", k: "Photo", sug: "daylight" },
    { t: "“Shade is the first material of hot climates”", k: "Quote", sug: "climate" },
    { t: "Notes from the call with the precaster", k: "Note", sug: "precast" },
    { t: "Article on muqarnas geometry", k: "Link", sug: "islamic" },
  ];
  const REVIEW = {
    precast: [
      { q: "Where does most heat get through a precast wall: the joint sealant, or the steel fixings behind the panel?", a: "The fixings. Steel conducts heat over a thousand times better than the insulation it passes through, so each fixing is a small bridge. Ask for thermally broken fixings, or stainless steel, which conducts about a third as well as carbon steel.", from: "Got wrong on Fri 23 Oct, in “Why precast cracks”" },
      { q: "What decides how wide a panel joint is?", a: "Tolerances and movement: making and fixing tolerances, plus the panel's thermal movement, with a sealant that can take the stretch. Often around 20 mm.", from: "Got right 10 days ago, in “Precast joints”" },
      { q: "Why does an architectural panel often get a reveal at the joint?", a: "It hides small differences in line and level between panels and makes the joint look intended. (Your word: reveal, not return.)", from: "From your words on Precast" },
    ],
    climate: [
      { q: "Why does a wet jar cool a room well in Riyadh in June but hardly at all in Dubai in August?", a: "Evaporation needs dry air. Dubai's August air is close to saturated, so little water evaporates and little heat is taken from the air.", from: "Got wrong on Thu 22 Oct" },
      { q: "What makes air rise through a malqaf at night?", a: "The stack effect: warm air inside is lighter and rises out, pulling cooler air in below.", from: "Got right on Wed 21 Oct" },
    ],
  };
  const DIGEST = [
    { q: "How much does the malqaf actually cool a hall for 600?", helps: "Your section of the Yazd malqaf, and your note “catch the wind at 8 m”.", missing: "No numbers yet for air change in a hall this size.", open: true },
    { q: "Is evaporative cooling worth it in Dubai's August?", helps: "Fathy's jar photo, and your arrow “contrasts with” the humid-coast note.", missing: "Nothing yet on humidity in the Gulf summer.", open: true },
    { q: "Where should the court's shade fall at 3 pm?", helps: "Answered in your Lumen “Shade and the afternoon court”.", missing: "", open: false },
  ];
  const BRIEF = [
    ["0:00", "Good morning, Layla. <b>Today's step</b> for the prayer hall: where the court's shade falls at 3 pm."],
    ["0:50", "<b>Yesterday you saved</b> two things: Heschong's <i>Thermal Delight in Architecture</i>, and a section of the Bait Ur Rouf mosque."],
    ["2:05", "<b>On Precast</b>, one thing to revisit: heat at the panel fixings. One sentence on why, then we move on."],
    ["3:20", "<b>Think it over</b> on the drive: why does a deep court stay cooler than a wide one? Eight seconds of quiet, then the answer."],
    ["4:30", "That's it. Your reading list on Climate-responsive design arrives at 7."],
  ];
  const PROJECT = { decided: ["Qibla wall glazing: option B, a high clerestory, no glare on the mihrab (Thu 22 Oct)"], open: ["How do we light the qibla wall without glare at dusk?", "Can the court be cooled without machines for Friday prayers?"], gaps: [["Thermal bridging at precast fixings", "precast"], ["Air change in a large hall", "climate"]] };

  const TIDY = {
    rules: [{ t: "Lentil soup reel, from 3 Oct", r: "Recipes", where: "as Recipes on Home & family" }, { t: "Link from archdaily.com: courtyard school (example)", r: "Precedents", where: "as Precedents on Climate-responsive design · To read" }, { t: "Precast specification rev B.pdf, from 2 Oct", r: "Specifications", where: "as Specifications on Precast" }],
    suggest: [{ t: "Screenshot of a jali screen pattern", k: "Photo", sug: "daylight" }, { t: "“Shade is the first material of hot climates”", k: "Quote", sug: "climate" }, { t: "Notes from the call with the precaster", k: "Note", sug: "precast" }, { t: "Article on muqarnas geometry (example)", k: "Link", sug: "islamic" }],
    left: [{ t: "A screenshot with no text", k: "Photo" }, { t: "A link that no longer opens", k: "Link" }],
  };
  const PILE = [
    { t: "Design with Climate, Victor Olgyay", k: "Book", since: "in To read since 2 Jun" },
    { t: "Courtyard house in Kuwait (example link)", k: "Link", since: "since 14 Jun" },
    { t: "Architecture for the Poor, Hassan Fathy", k: "PDF", since: "since 20 May · you stopped at p. 41" },
    { t: "Lecture: daylight in deep plans (example)", k: "Video", since: "since 1 Jul" },
  ];
  const ALIVE = [
    { t: "Courtyard house in Muscat (example link)", st: "dead", note: "Stopped working on 12 Oct. Your saved copy opens instead." },
    { t: "A guide to wind catchers (example)", st: "moved", note: "Moved to a new address. Updated." },
    { t: "Mosque lighting study (example PDF link)", st: "dead", note: "Gone. The text you saved is kept." },
  ];

  /* ================================================================ how a run works (Builder): steps per kind, and what ran each */
  const HOOD = {
    watch: { steps: [["Starts", "The schedule fires for this account (07:30, Asia/Dubai).", "job"], ["Gathers", "Reads 4 sources: 38 new items since yesterday's run.", "rules"], ["Filters", "Drops 21 already seen, 6 duplicates and 4 like ones you dismissed. 7 left.", "rules"], ["Judges and sorts", "One call: is each item relevant to your map and level, and which topic is it most about? Keeps 5.", "small model"], ["Writes", "One line each on why it matters to you, from what Loci knows at that topic.", "same call"], ["Checks", "Every link opens, every title matches its page, every topic exists.", "rules"], ["Delivers", "Today, as arrivals. Nothing is saved until you keep it.", "job"]], tokens: [18400, 12100, 940] },
    reading: { steps: [["Starts", "The schedule fires (Mondays 07:00).", "job"], ["Gathers", "Reads what Loci knows at the topic, its 14 saves and everything this routine suggested before.", "rules"], ["Asks", "One call: suggest 6 titles that fit the instructions, the level and what's missing.", "model"], ["Checks", "Looks each title up in Open Library. Drops any it can't find, any you have, any you dismissed. 3 left.", "rules"], ["Writes", "The reason for each, in your words where it can.", "same call"], ["Delivers", "Today and email.", "job"]], tokens: [9800, 7200, 1300] },
    questions: { steps: [["Starts", "The schedule fires (Sundays 18:00).", "job"], ["Gathers", "Your open questions and goals at the topic and under it: 3 questions, 1 goal. Your 14 saves and 3 Lumens.", "rules"], ["Matches", "Searches your own Lumens and saves for each question. One looks answered already.", "search"], ["Judges", "One call: can your saves carry a Lumen for each open question? If so, a four-slide outline citing them. If not, what's missing.", "model"], ["Checks", "Every save it cites exists and is yours.", "rules"], ["Delivers", "Today. A Lumen is made only when you press Make.", "job"]], tokens: [14200, 9000, 1600] },
    week: { steps: [["Starts", "The schedule fires (Fridays 16:00).", "job"], ["Gathers", "What you saved since last Friday: 5 entries on 3 topics.", "rules"], ["Outlines", "One call: one short Lumen from the saves that belong together, with what each slide draws on.", "model"], ["Checks", "Every slide cites at least one of your saves.", "rules"], ["Delivers", "Today. Make writes and voices the Lumen as usual.", "job"]], tokens: [6900, 4100, 800] },
    tidy: { steps: [["Starts", "The schedule fires (every day, 21:00).", "job"], ["Gathers", "9 entries in Unsorted, and your filing rules.", "rules"], ["Your rules", "3 match rules you made after they arrived. Filed by those rules.", "rules"], ["Suggests", "One call to the small model: the best topic for each of the rest, or none.", "small model"], ["Leaves", "2 it can't place stay for you.", "rules"], ["Delivers", "Today. Each suggestion moves only when you place it.", "job"]], tokens: [2600, 1800, 260] },
    pile: { steps: [["Starts", "The 1st of the month, 09:00.", "job"], ["Gathers", "Everything in To read for over three months.", "rules"], ["Delivers", "Today. Nothing moves until you choose.", "job"]], tokens: [0, 0, 0] },
    alive: { steps: [["Starts", "The 1st of the month, 09:30.", "job"], ["Checks", "Opens each saved link, with a time limit.", "rules"], ["Keeps", "Where a link has gone, the copy saved at capture opens instead; where it moved, the address is updated.", "rules"], ["Delivers", "Today.", "job"]], tokens: [0, 0, 0] },
    review: { steps: [["Starts", "The schedule fires (Fridays 17:00).", "job"], ["Gathers", "Your checks at Precast this week, and To revisit there.", "rules"], ["Skips?", "If nothing new happened at Precast, it stops here and uses nothing.", "rules"], ["Writes", "Questions from your own checks, plus one you got right a while ago.", "small model"], ["Delivers", "Today.", "job"]], tokens: [3200, 2400, 500] },
    brief: { steps: [["Starts", "The schedule fires (weekdays 06:45).", "job"], ["Gathers", "Today's step, yesterday's saves, one thing to revisit, one question.", "rules"], ["Writes", "A five-minute script for two voices.", "model"], ["Voices", "The script is read by two voices.", "voice"], ["Delivers", "Today, ready to play in the car.", "job"]], tokens: [5200, 3600, 1100] },
    digest: { steps: [["Starts", "The schedule fires (Thursdays 18:00).", "job"], ["Gathers", "The board's cards, arrows and questions.", "rules"], ["Matches", "For each question, the cards and arrows that touch it.", "model"], ["Delivers", "Today.", "job"]], tokens: [7400, 5100, 900] },
    project: { steps: [["Starts", "The schedule fires (Fridays 16:00).", "job"], ["Gathers", "The project's decisions, questions and gaps this week.", "rules"], ["Writes", "A one-page update.", "model"], ["Delivers", "Today and email.", "job"]], tokens: [6100, 4000, 900] },
  };

  /* ================================================================ state */
  let rid = 0, runId = 0;
  const mk = (kind, over) => {
    const K = KINDS[kind];
    return { id: "r" + ++rid, kind, name: K.name, words: "", place: K.place, every: K.every, time: K.time, to: K.to, may: "suggest", skip: true, on: true, guides: [], sources: [], marks: [], tally: { kept: 0, made: 0, answered: 0, dismissed: 0 }, ...over };
  };
  const ROUTINES = [
    mk("watch", { name: "Watch: AI in architecture", sources: ["Design-tools newsletter", "Building-science journal", "Architecture news site", "Conference channel"], words: "Only things about using AI in design practice, not general AI news.", marks: ["used", "used", "ignored", "used", "skipped", "used", "used"], tally: { kept: 9, made: 0, answered: 0, dismissed: 6 } }),
    mk("reading", { name: "Weekly reading list", words: "On keeping a courtyard cool without machines.", guides: [{ t: "Skip the classics I'm likely to own already", from: "Mon 12 Oct", how: "you dismissed Olgyay with Have it" }], marks: ["used", "used", "used", "used", "used"], tally: { kept: 8, made: 0, answered: 0, dismissed: 3 } }),
    mk("questions", { name: "Questions and goals", marks: ["used", "used", "ignored"], tally: { kept: 0, made: 2, answered: 3, dismissed: 0 } }),
    mk("week", { name: "Lumen of the week", marks: ["used", "used"], tally: { kept: 0, made: 2, answered: 0, dismissed: 0 } }),
    mk("review", { name: "Friday review", marks: ["used", "used", "used", "skipped"], tally: { kept: 0, made: 0, answered: 7, dismissed: 0 } }),
    mk("brief", { name: "Daily brief", marks: ["used", "used", "used", "used", "ignored", "used", "used"] }),
    mk("digest", { name: "Board digest", on: false, paused: "Paused on 15 Oct after three runs you didn't open. You agreed.", marks: ["used", "ignored", "ignored", "ignored"] }),
  ];
  ROUTINES.push(
    mk("tidy", { name: "Tidy Unsorted", marks: ["used", "used", "used", "skipped", "used", "used", "used"], tally: { placed: 34, letgo: 5 } }),
    mk("pile", { name: "Clear the To read pile", marks: ["used", "used"], tally: { letgo: 11, kept: 6 } }),
    mk("alive", { name: "Keep sources alive", marks: ["used", "used"], tally: { fixed: 4 } }),
  );
  const S = { view: "routines", tab: "routines", routines: ROUTINES, runs: [], sel: null, filter: null, edit: null, running: null, refineOpen: null, dismissing: null, play: null, builder: false, sent: new Set(), chat: [], catchall: "ask", suggDone: new Set(), tryRule: null, ruleEdit: null, inboxFilter: null, feedTab: "all" };
  const R = (id) => S.routines.find((r) => r.id === id);
  const run = (r, when, out, extra = {}) => ({ id: "u" + ++runId, rid: r.id, at: when, how: "scheduled", status: "", out, took: "41 s", ...extra });
  const books = (ids, place = "climate") => ids.map(([id, st, dis]) => ({ ...BOOKS[place].find((b) => b.id === id), st: st || null, dis: dis || null }));
  {
    const [watch, r1, qs, wk, rv, br, dg] = ROUTINES;
    S.runs.push(
      run(dg, at(10, 15, 18, 0), { kind: "digest", items: DIGEST.map((d) => ({ ...d })) }, { took: "29 s" }),
      run(r1, at(10, 19, 7, 0), { kind: "reading", items: books([["heschong", "saved"], ["ford", "saved"], ["mazria", "dismissed", "Not about my work"]]) }),
      run(wk, at(10, 23, 16, 0), { kind: "week", ...WEEK, st: null }, { took: "22 s" }),
      run(rv, at(10, 23, 17, 0), { kind: "review", items: REVIEW.precast.map((x, i) => ({ ...x, shown: true, mark: i === 1 ? "got" : i === 0 ? "not" : null })) }),
      run(qs, at(10, 25, 18, 0), { kind: "questions", items: QUESTIONS.map((x) => ({ ...x, st: null })) }, { took: "36 s" }),
      run(br, at(10, 26, 6, 45), { kind: "brief", chapters: BRIEF, heard: false }, { took: "1 min 12 s" }),
      run(r1, at(10, 26, 7, 0), { kind: "reading", items: books([["edwards"], ["bahadori"], ["givoni2"]]) }, { took: "38 s" }),
      run(watch, at(10, 26, 7, 30), { kind: "watch", items: ARRIVALS.map((x) => ({ ...x, st: null })) }, { took: "52 s" }),
    );
    const [td, pl, al] = ROUTINES.slice(7);
    S.runs.push(
      run(pl, at(10, 1, 9, 0), { kind: "pile", items: PILE.map((x) => ({ ...x })) }, { took: "2 s" }),
      run(al, at(10, 1, 9, 30), { kind: "alive", items: ALIVE.map((x) => ({ ...x })) }, { took: "3 min 10 s" }),
      run(td, at(10, 25, 21, 0), { kind: "tidy", rules: TIDY.rules.map((x) => ({ ...x })), suggest: TIDY.suggest.map((x) => ({ ...x })), left: TIDY.left.map((x) => ({ ...x })) }, { took: "9 s" }),
    );
    S.runs.forEach((u) => { u.cost = u.status === "skipped" ? 0 : costRun(R(u.rid)); });
    S.sel = S.runs[S.runs.length - 1].id;
  }

  /* ================================================================ schedule and cost */
  function nextRun(r, from = NOW) {
    const [h, m] = r.time.split(":").map(Number);
    if (r.every === "month") { const d = new Date(from.getFullYear(), from.getMonth(), 1, h, m); return d > from ? d : new Date(from.getFullYear(), from.getMonth() + 1, 1, h, m); }
    for (let i = 0; i < 9; i++) {
      const d = new Date(from); d.setDate(d.getDate() + i); d.setHours(h, m, 0, 0);
      const wd = d.getDay();
      const ok = r.every === "day" || (r.every === "weekdays" && wd >= 1 && wd <= 5) || r.every === "w" + wd;
      if (ok && d > from) return d;
    }
    return from;
  }
  const hm = (s) => { const [h, m] = s.split(":").map(Number); return `${h}:${String(m).padStart(2, "0")}`; };
  const whenText = (r) => r.every === "month" ? `On the 1st of every month at ${hm(r.time)}` : r.every === "day" ? `Every day at ${hm(r.time)}` : r.every === "weekdays" ? `Weekdays at ${hm(r.time)}` : `Every ${DAYLONG[Number(r.every.slice(1))]} at ${hm(r.time)}`;
  const toText = (to) => ({ today: "Today", "today+email": "Today and email", "today+audio": "Today, as audio", email: "email" })[to];
  function costRun(r) { return KINDS[r.kind].cost + (r.to === "today+audio" && r.kind !== "brief" ? 0.45 : 0); }
  const costMonth = (r) => costRun(r) * runsMonth(r.every) * (r.skip ? 0.85 : 1);
  const pct = (x) => (x === 0 ? "nothing" : x < 0.1 ? "under 0.1%" : x < 10 ? `${Math.round(x * 10) / 10}%` : `${Math.round(x)}%`);
  const lastRun = (r) => S.runs.filter((u) => u.rid === r.id).sort((a, b) => b.at - a.at)[0];
  const placeName = (r) => PLACES[r.place].name;

  function status(u) {
    if (u.status === "skipped") return ["skipped", "Skipped"];
    const o = u.out, open = (xs, f) => xs.filter(f).length;
    if (o.kind === "reading") { const n = open(o.items, (x) => !x.st); return n ? ["waiting", `${n} to look at`] : ["done", "Done"]; }
    if (o.kind === "watch") { const n = open(o.items, (x) => !x.st); return n ? ["waiting", `${n} arrivals`] : ["done", "Done"]; }
    if (o.kind === "questions") { const n = open(o.items, (x) => !x.st && x.verdict !== "progress"); return n ? ["waiting", `${n} to decide`] : ["done", "Done"]; }
    if (o.kind === "week") return o.st ? ["done", o.st === "made" ? "Lumen made" : "Not this week"] : ["waiting", "Outline ready"];
    if (o.kind === "tidy") { const n = open(o.suggest, (x) => !x.st); return n ? ["waiting", `${n} to place`] : ["done", "Done"]; }
    if (o.kind === "pile") { const n = open(o.items, (x) => !x.st); return n ? ["waiting", `${n} to decide`] : ["done", "Done"]; }
    if (o.kind === "alive") return ["done", `${o.items.filter((x) => x.st === "dead").length} copies kept`];
    if (o.kind === "review") { const n = open(o.items, (x) => !x.mark); return n ? ["waiting", `${n} to answer`] : ["done", "Done"]; }
    if (o.kind === "brief") return o.heard ? ["done", "Heard"] : ["waiting", "New · 5 min"];
    if (o.kind === "digest") return ["done", `${o.items.filter((x) => x.open).length} open`];
    return ["done", "Delivered"];
  }

  /* ================================================================ helpers */
  const btn = (label, attrs, kind = "") => `<button type="button" class="button${kind ? " button-" + kind : ""}" ${attrs}>${label}</button>`;
  const act = (label, attrs) => `<button type="button" class="sm-act" ${attrs}>${label}</button>`;
  const dotFor = (p) => `<span class="state ${PLACES[p].st == null ? "rt-nost" : "s" + PLACES[p].st}" aria-hidden="true"></span>`;

  /* ================================================================ the routine card: a standing instruction, and what came of it */
  function sentence(r) {
    const p = `<span class="rt-ink">${esc(placeName(r))}</span>`;
    return `<span class="rt-ink">${esc(whenText(r))}</span>, ${KINDS[r.kind].say(p, r)}. <span class="rt-to">→ ${esc(toText(r.to))}</span>`;
  }
  function rhythm(r) {
    const live = S.runs.filter((u) => u.rid === r.id).sort((a, b) => a.at - b.at).map((u) => { const [k] = status(u); return k === "skipped" ? "skipped" : k === "waiting" ? "new" : "used"; });
    const marks = [...r.marks, ...live].slice(-8);
    const word = { used: "used", new: "waiting for you", ignored: "not opened", skipped: "skipped, nothing new" };
    return `<span class="rt-marks" role="img" aria-label="Last ${marks.length} runs: ${marks.map((m) => word[m]).join(", ")}">${marks.map((m) => `<i data-m="${m}" title="${word[m]}"></i>`).join("")}</span>`;
  }
  function cameOf(r) {
    const x = r.tally, bits = [x.placed && `${x.placed} placed`, x.kept && `${x.kept} kept`, x.made && plural(x.made, "Lumen") + " made", x.answered && `${x.answered} answered`, x.dismissed && `${x.dismissed} dismissed`, x.letgo && `${x.letgo} let go`, x.fixed && `${x.fixed} links fixed`].filter(Boolean);
    return bits.length ? bits.join(" · ") : r.kind === "brief" ? "6 of the last 7 heard" : "Nothing yet";
  }
  function card(r) {
    const nx = nextRun(r), running = S.running && S.running.rid === r.id, lr = lastRun(r);
    const [sk, sl] = lr ? status(lr) : [null, null];
    return `<article class="rt-card" id="card-${r.id}"${r.on ? "" : " data-off"}${S.flash === r.id ? " data-flash" : ""}>
      <div class="rt-top"><span class="rt-k">${esc(JOBS.find((j) => j.k === KINDS[r.kind].job).name)} · ${esc(KINDS[r.kind].name)}</span><span class="rt-next">${r.on ? `Next ${esc(fWhen(nx))}` : "Paused"}</span></div>
      <h3 class="rt-name">${esc(r.name)}</h3>
      <p class="rt-say">${sentence(r)}</p>
      ${r.words ? `<p class="rt-words">“${esc(r.words)}”</p>` : ""}
      ${r.guides.length ? `<ul class="rt-guides">${r.guides.map((g) => `<li>${esc(g.t)} <i>· from the run on ${esc(g.from)}</i></li>`).join("")}</ul>` : ""}
      ${r.paused && !r.on ? `<p class="rt-paused">${esc(r.paused)}</p>` : ""}
      ${running ? stepsHTML(r) : `<div class="rt-came">${rhythm(r)}<span>${esc(cameOf(r))}</span></div>`}
      ${lr && sk === "waiting" && !running ? `<button type="button" class="rt-waiting" data-act="openrun" data-u="${lr.id}"><b>${esc(sl)}</b><span>from ${esc(fWhen(lr.at))}</span><em aria-hidden="true">›</em></button>` : ""}
      <div class="rt-foot"><span class="rt-place">${dotFor(r.place)}<span>${esc(PLACES[r.place].path)}</span></span><span class="rt-cost">${costRun(r) ? `about ${pct(costRun(r))} a run` : "free: no model"}</span></div>
      <div class="rt-acts">${act(running ? "Running…" : "Run now", `data-act="runnow" data-id="${r.id}"${running ? " disabled" : ""}`)}${act("Runs", `data-act="runsof" data-id="${r.id}"`)}${act(r.on ? "Pause" : "Turn on", `data-act="toggle" data-id="${r.id}"`)}${act("Edit", `data-act="edit" data-id="${r.id}"`)}</div>
    </article>`;
  }
  // the learner sees each step in plain words; Builder sees what ran it
  const learnerLine = (x) => x.replace(/^One call to the small model: |^One call: /, "");
  function stepsHTML(r) {
    const s = S.running.step, steps = HOOD[r.kind].steps, i = Math.min(s, steps.length - 1);
    return `<div class="rt-progress" role="status"><div class="rt-pbar"><i style="width:${Math.round(((s + 1) / steps.length) * 100)}%"></i></div><span><b>${esc(steps[i][0])}.</b> ${esc(learnerLine(steps[i][1]))}</span></div>`;
  }

  /* ================================================================ Routines page */
  function header() {
    return `<header class="destination-header"><div class="destination-crumb"><strong>Today</strong><i aria-hidden="true">/</i><span>Routines</span></div><nav aria-label="Routines sections" class="destination-tabs">${[["routines", "Routines"], ["runs", "Runs"]].map(([k, l]) => `<a class="destination-tab" href="#${k}" data-tab="${k}"${S.tab === k ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav></header>`;
  }
  function weekLine() {
    const since = at(10, 19, 0, 0), wk = S.runs.filter((u) => u.at >= since), all = (k) => wk.flatMap((u) => (u.out.kind === k ? u.out.items : []));
    const fresh = ARR.filter((x) => x.live), arrived = 23 + fresh.length, filed = 17 + fresh.filter((x) => x.state === "filed").length;
    const items = [...all("reading"), ...all("watch")];
    const kept = items.filter((x) => x.st === "saved").length;
    const made = wk.filter((u) => u.out.kind === "week" && u.out.st === "made").length + all("questions").filter((x) => x.st === "made").length;
    const answered = all("review").filter((x) => x.mark === "got").length + all("questions").filter((x) => x.st === "answered").length;
    const did = [kept && `kept <em>${kept}</em>`, made && `made <em>${plural(made, "Lumen")}</em>`, answered && `answered <em>${plural(answered, "question")}</em>`].filter(Boolean);
    const list = did.length > 1 ? did.slice(0, -1).join(", ") + " and " + did[did.length - 1] : did[0];
    return `This week <em>${plural(arrived, "thing")}</em> arrived and your rules filed <em>${filed}</em> of them. Your routines brought in <em>${items.length}</em> more${list ? `; you ${list}` : ""}.`;
  }
  function routinesTab() {
    const on = S.routines.filter((r) => r.on), month = on.reduce((a, r) => a + costMonth(r), 0);
    const ord = { manage: 0, store: 1, learn: 2 };
    const sched = S.routines.slice().sort((a, b) => ord[KINDS[a.kind].job] - ord[KINDS[b.kind].job]);
    const sec = (id, title, tag, line, body) => `<section class="rt-job" aria-labelledby="${id}"><div class="rt-job-h"><h2 id="${id}">${title}</h2>${tag ? `<span class="rt-loop">${tag}</span>` : ""}<p>${line}</p></div>${body}</section>`;
    return `<div class="rt-body">
      <div class="rt-intro"><div><h1 class="sm-h1">Routines</h1><p class="sm-lead">Small automations for your Commonplace. Send things from anywhere and they're filed the way you say; Loci tidies, checks and brings things back on a schedule; and what you learn comes back to you. Nothing is deleted, and anything can be undone.</p></div>
        <div class="rt-intro-side"><div class="sm-row">${btn("New rule", 'data-act="r-new"')}${btn("New routine", 'data-act="new"', "quiet")}</div><span class="sm-note">${RULES.filter((f) => f.on).length} rules · ${on.length} routines on · about ${pct(month)} of your monthly allowance</span></div></div>
      <div class="rt-week"><p>${weekLine()}</p></div>
      ${sec("sec-arrive", "When something arrives", "Store", "Your filing rules. Everything you send, from any channel, comes through one door and meets these from the top. The first rule that fits files it.", arriveBody())}
      ${sec("sec-sched", "On a schedule", "", "Loci does these at set times: tidying, bringing in, bringing back.", `<div class="rt-cards">${sched.map(card).join("")}<div class="rt-tpls">${Object.entries(KINDS).map(([k, K]) => `<button type="button" class="rt-tpl" data-act="new" data-kind="${k}"><b>+ ${esc(K.name)}</b><span>${esc(K.blurb)}</span></button>`).join("")}</div></div>`)}
      ${sec("sec-event", "When something happens", "", "Small follow-ups to things you do. No setup: turn each on or off.", `<div class="rt-cards">${EVENTS.map(eventCard).join("")}</div>`)}
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
      return `${head}<button type="button" class="rt-row" data-act="sel" data-id="${u.id}" aria-current="${u.id === S.sel}"><b>${esc(r.name)}</b><span class="rt-pill" data-s="${k}">${esc(l)}</span><small>${fTime(u.at)}${u.how === "now" ? " · Run now" : ""} · ${esc(PLACES[r.place].short || placeName(r))}</small></button>`;
    }).join("");
    const u = S.runs.find((x) => x.id === S.sel);
    return `<div class="rt-body">
      <div class="rt-intro"><div><h1 class="sm-h1">Runs</h1><p class="sm-lead">Everything your routines brought back, newest first. Open one to see what it read and what it found, and to tell it what to change next time.</p></div>
        ${S.filter ? `<div class="sm-row"><span class="rt-chip">Only <b>${esc(R(S.filter).name)}</b></span>${act("Show all", 'data-act="unfilter"')}</div>` : ""}</div>
      <div class="rt-runs"><div class="rt-list" aria-label="Runs">${rows || '<p class="sm-note" style="padding:14px">No runs yet.</p>'}</div>${u ? runView(u) : '<div class="rt-run"><p class="sm-note">Pick a run.</p></div>'}</div>
    </div>`;
  }
  function title(u) {
    const o = u.out, P = placeName(R(u.rid)), n = o.items?.length || 0;
    return { reading: `${plural(n, "reading")} on ${P}`, watch: `${plural(n, "arrival")}, sorted onto your map`, questions: `Your questions and goals at ${P}`, week: "This week's Lumen, outlined", tidy: "Unsorted, gone through", pile: "In To read for over three months", alive: "Your saved links, checked", review: `${plural(n, "question")} on ${P}`, brief: "Your daily brief", digest: `Open questions on “${P}”`, project: `This week on ${P}`, skip: "Skipped" }[o.kind];
  }
  function runView(u) {
    const r = R(u.rid), P = PLACES[r.place], o = u.out;
    let reads = [["Place", P.short || P.name], ["What Loci knows there", P.card], ["In it", P.has]];
    if (r.kind === "watch") reads = [["Sources", plural(r.sources.length, "source")], ["Sorted onto", "your whole map"], ["Your instructions", "yes"]];
    if (r.guides.length) reads.push(["Your guidelines", String(r.guides.length)]);
    const body = ({ skip: () => `<p class="sm-note">${esc(o.why)}</p>`, reading: () => o.items.map((b, i) => resCard(u, b, i)).join(""), watch: () => watchBody(u), questions: () => questionsBody(u), week: () => weekBody(u), tidy: () => tidyBody(u), pile: () => pileBody(u), alive: () => aliveBody(u), review: () => reviewBody(u), brief: () => briefBody(u), digest: digestBody, project: projectBody }[o.kind] || (() => ""))();
    const fb = u.fb, rf = S.refineOpen === u.id;
    return `<div class="rt-run">
      <div class="rt-run-head"><span class="sm-path">${esc(r.name)} · ${u.how === "now" ? "Run now" : "On schedule"}, ${esc(fWhen(u.at))}</span><h2 class="sm-h2">${esc(title(u))}</h2>
        <div class="rt-meta"><span>Took <b>${esc(u.took)}</b></span><span>Used <b>${pct(u.cost)}</b> of your allowance</span>${act("Edit routine", `data-act="edit" data-id="${r.id}"`)}</div></div>
      ${u.status === "skipped" ? "" : `<div class="rt-read"><span class="rt-k">What it read</span><div class="rt-chips">${reads.map(([a, b]) => `<span class="rt-chip">${esc(a)} <b>${esc(b)}</b></span>`).join("")}</div></div>`}
      <div class="rt-out">${body}</div>
      ${S.builder ? hoodHTML(u) : ""}
      ${u.status === "skipped" ? "" : `<div class="rt-refine"><span class="rt-k">How was this run?</span>
        ${fb ? `<div class="rt-added">${fb === "ok" ? "<b>Noted.</b> It keeps doing this." : `<b>Added to its guidelines:</b> ${esc(fb)}`}</div>` : `<div class="sm-row">${[["ok", "Just right"], ["basic", "Too basic"], ["long", "Too much"], ["work", "Not about my work"]].map(([k, l]) => `<button class="chip-btn" type="button" data-act="fb" data-u="${u.id}" data-val="${k}">${l}</button>`).join("")}${act(rf ? "Close" : "Tell it something else…", `data-act="refine" data-u="${u.id}"`)}</div>`}
        ${rf && !fb ? `<textarea class="sm-area" id="rf-text" placeholder="For example: only things I can read in an evening, and say which chapter to start with."></textarea><div class="sm-row">${btn("Add to its guidelines", `data-act="refine-save" data-u="${u.id}"`)}<span class="sm-note">It reads this from the next run. You can remove it in Edit.</span></div>` : ""}
        <p>What you keep, dismiss and answer is how it gets better. Guidelines show on the routine with the run they came from.</p></div>`}
    </div>`;
  }
  function hoodHTML(u) {
    const H = HOOD[R(u.rid).kind];
    if (u.status === "skipped") return `<div class="rt-hood"><span class="rt-k">Builder · how this run worked</span><p class="sm-note">The skip check runs before any model call. Nothing new at the place since the last run (no saves, checks or questions), so it stopped. 0 tokens.</p></div>`;
    const [inp, cached, out] = H.tokens;
    if (!inp) return `<div class="rt-hood"><span class="rt-k">Builder · how this run worked</span><ol>${H.steps.map(([a, b, how]) => `<li><b>${esc(a)}</b><span>${esc(b)}</span><em data-how="${how}">${esc(how)}</em></li>`).join("")}</ol><p class="sm-note">No model call: rules and code only. It costs nothing.</p></div>`;
    return `<div class="rt-hood"><span class="rt-k">Builder · how this run worked</span>
      <ol>${H.steps.map(([a, b, how]) => `<li><b>${esc(a)}</b><span>${esc(b)}</span><em data-how="${how}">${esc(how)}</em></li>`).join("")}</ol>
      <p class="sm-note">Input ${inp.toLocaleString("en-GB")} tokens, ${cached.toLocaleString("en-GB")} of them read from the cache (the routine's fixed instructions and the place's digest). Output ${out.toLocaleString("en-GB")}. Scheduled runs go through the batch queue at half price; Run now doesn't.</p></div>`;
  }
  const disChoices = (u, i) => `<div class="sm-row"><span class="sm-note">Why?</span>${["Have it", "Too basic", "Too advanced", "Not my format", "Not about my work"].map((w) => `<button class="chip-btn" type="button" data-act="dismiss" data-u="${u.id}" data-i="${i}" data-val="${w}">${w}</button>`).join("")}${act("Cancel", 'data-act="dis-cancel"')}</div>`;
  const dismissingThis = (u, i) => S.dismissing && S.dismissing.u === u.id && S.dismissing.i === i;
  function resCard(u, b, i) {
    let foot;
    if (b.st === "saved") foot = `<span class="rt-done"><b>Saved</b> to Commonplace › Sources › ${b.k === "article" ? "Articles" : "Books"}, on ${esc(placeName(R(u.rid)))} · To read</span>`;
    else if (b.st === "dismissed") foot = `<span class="rt-done">Dismissed${b.dis ? ` · ${esc(b.dis)}` : ""}. It won't be suggested again.</span>`;
    else if (dismissingThis(u, i)) foot = disChoices(u, i);
    else foot = `<div class="sm-row">${btn("Save", `data-act="save" data-u="${u.id}" data-i="${i}"`)}${btn("Dismiss", `data-act="dis-open" data-u="${u.id}" data-i="${i}"`, "quiet")}</div>`;
    return `<div class="rt-res"${b.st ? ` data-state="${b.st}"` : ""}><span class="rt-cover" data-k="${b.k}" aria-hidden="true">${b.k}</span>
      <div class="rt-res-top"><b>${esc(b.t)}</b><span>${esc(b.a)} · ${esc(b.y)}</span></div><p>${esc(b.why)}</p>
      <div class="rt-tags"><span>${b.k === "article" ? "Article" : "Book"}</span><span>${esc(b.lv)}</span><span>Checked in Open Library</span></div><div style="grid-column:2">${foot}</div></div>`;
  }
  const topicLabel = (x) => (typeof x === "string" ? PLACES[x].name : `New sub-topic “${x.new}”`);
  function watchBody(u) {
    const items = u.out.items, left = items.filter((x) => !x.st).length, groups = {};
    items.forEach((x, i) => { const k = topicLabel(x.topic); (groups[k] = groups[k] || []).push([x, i]); });
    return `${left > 1 ? `<div class="sm-row" style="justify-content:space-between"><span class="sm-note">Sorted onto ${plural(Object.keys(groups).length, "place")} on your map. Keep saves each one there, as To read.</span>${btn(`Keep all ${left}`, `data-act="keepall" data-u="${u.id}"`, "quiet")}</div>` : ""}
      ${Object.entries(groups).map(([g, xs]) => { const tp = xs[0][0].topic, real = typeof tp === "string";
        return `<div class="rt-group"><div class="rt-group-h">${real ? dotFor(tp) : '<span class="rt-dashed" aria-hidden="true"></span>'}<b>${esc(g)}</b><span class="sm-note">${real ? esc(PLACES[tp].path.split(" › ")[0]) : "Suggested, not made"}</span></div>
        ${xs.map(([x, i]) => { const foot = x.st === "saved" ? `<span class="rt-done"><b>Kept</b> in Commonplace › Sources, on ${esc(real ? PLACES[tp].name : tp.new + " (made when you kept it)")} · To read</span>` : x.st === "dismissed" ? `<span class="rt-done">Not this${x.dis ? ` · ${esc(x.dis)}` : ""}. Loci brings fewer things like it.</span>` : dismissingThis(u, i) ? disChoices(u, i) : `<div class="sm-row">${btn("Keep", `data-act="save" data-u="${u.id}" data-i="${i}"`)}${btn("Not this", `data-act="dis-open" data-u="${u.id}" data-i="${i}"`, "quiet")}</div>`;
          return `<div class="rt-arrival"${x.st ? ` data-state="${x.st}"` : ""}><b class="rt-at">${esc(x.t)}</b><span class="rt-src">${esc(x.k)} · ${esc(x.src)} <i>(example)</i></span><p>${esc(x.why)}</p>${foot}</div>`; }).join("")}</div>`; }).join("")}`;
  }
  function questionsBody(u) {
    return u.out.items.map((x, i) => {
      let main = "", foot = "";
      if (x.verdict === "progress") main = `<div class="rt-goalbar"><span>${x.progress[0]} of ${x.progress[1]} questions under it answered</span><div class="rt-pbar"><i style="width:${(x.progress[0] / x.progress[1]) * 100}%"></i></div></div><p class="sm-note">${esc(x.next)}</p>`;
      if (x.verdict === "lumen") {
        main = `<div class="rt-lumen"><span class="rt-k">A Lumen from your own saves</span><b>${esc(x.lumen.title)}</b><ol>${x.lumen.slides.map((s) => `<li>${esc(s)}</li>`).join("")}</ol><p class="sm-note">Draws on: ${x.lumen.from.map(esc).join(" · ")}</p></div>`;
        foot = x.st === "made" ? `<span class="rt-done"><b>Making it.</b> It'll be in Learn in about two minutes, and on this question as “Answered in”.</span>` : x.st === "later" ? `<span class="rt-done">Left for now. It comes back next Sunday if the question is still open.</span>` : `<div class="sm-row">${btn("Make this Lumen", `data-act="q-make" data-u="${u.id}" data-i="${i}"`)}${btn("Not now", `data-act="q-later" data-u="${u.id}" data-i="${i}"`, "quiet")}</div>`;
      }
      if (x.verdict === "find") { main = `<p class="sm-note">${esc(x.gap)}</p>`; foot = x.st === "find" ? `<span class="rt-done"><b>Asked.</b> Readings for it come with Monday's reading list.</span>` : x.st === "later" ? `<span class="rt-done">Left for now.</span>` : `<div class="sm-row">${btn("Find readings for it", `data-act="q-find" data-u="${u.id}" data-i="${i}"`)}${btn("Ask Loci now", 'data-act="explain"', "quiet")}</div>`; }
      if (x.verdict === "answered") { main = `<p class="sm-note">You may have answered this already: <b>${esc(x.answeredIn)}</b>.</p>`; foot = x.st === "answered" ? `<span class="rt-done"><b>Marked answered.</b> It becomes a recall check in Friday's review.</span>` : x.st === "later" ? `<span class="rt-done">Kept open.</span>` : `<div class="sm-row">${btn("Mark answered", `data-act="q-ans" data-u="${u.id}" data-i="${i}"`)}${btn("Still open", `data-act="q-later" data-u="${u.id}" data-i="${i}"`, "quiet")}</div>`; }
      return `<div class="rt-q" data-kind="${x.kind}"${x.st && x.st !== "later" ? ' data-mark="got"' : ""}><span class="rt-qk">${x.kind === "goal" ? "@goal" : "@question"}</span><span class="sm-path">${esc(x.host)}</span><b>${esc(x.q)}</b>${main}${foot}</div>`;
    }).join("");
  }
  function weekBody(u) {
    const o = u.out;
    return `<div class="rt-q"><span class="sm-path">You saved ${plural(o.saves.length, "thing")} this week</span><ul class="rt-guides">${o.saves.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>
      <div class="rt-lumen"><span class="rt-k">Lumen · Watch · about 4 min</span><b>${esc(o.lumen.title)}</b><ol>${o.lumen.slides.map(([s, f]) => `<li>${esc(s)} <span class="sm-note">· ${esc(f)}</span></li>`).join("")}</ol><p class="sm-note">${esc(o.left)}</p>
      ${o.st === "made" ? `<span class="rt-done"><b>Making it.</b> It'll be in Learn in about two minutes.</span>` : o.st === "skip" ? `<span class="rt-done">Not this week.</span>` : `<div class="sm-row">${btn("Make this Lumen", `data-act="w-make" data-u="${u.id}"`)}${btn("Not this week", `data-act="w-skip" data-u="${u.id}"`, "quiet")}</div>`}</div>`;
  }
  const topicSel = (id, cur) => `<select class="sm-select rt-sel" id="${id}" aria-label="Topic">${TOPICS.map((p) => `<option value="${p}"${cur === p ? " selected" : ""}>${esc(PLACES[p].name)}</option>`).join("")}</select>`;
  function tidyBody(u) {
    const o = u.out, left = o.suggest.filter((x) => !x.st).length;
    return `${o.rules.length ? `<div class="rt-q"><span class="sm-path">Filed by your rules · ${o.rules.length}</span>${o.rules.map((x) => `<p style="margin:0">${esc(x.t)} <span class="sm-note">· “${esc(x.r)}” filed it ${esc(x.where)}</span></p>`).join("")}<p class="sm-note">These came in before the rule existed, so tonight's tidy applied it.</p></div>` : ""}
      <div class="rt-q"><div class="sm-row" style="justify-content:space-between"><span class="sm-path">Loci suggests a place · ${o.suggest.length}</span>${left > 1 ? btn(`Place all ${left}`, `data-act="t-all" data-u="${u.id}"`, "quiet") : ""}</div>
        ${o.suggest.map((x, i) => `<div class="rt-arrival"${x.st ? ' data-state="saved"' : ""}><b class="rt-at">${esc(x.t)}</b><span class="rt-src">${esc(x.k)}</span>${x.st ? `<span class="rt-done"><b>Placed</b> on ${esc(PLACES[x.sug].name)}.</span>` : `<div class="sm-row"><span class="sm-note">Belongs on</span>${topicSel(`tidy-${u.id}-${i}`, x.sug)}${btn("Place it", `data-act="t-ok" data-u="${u.id}" data-i="${i}"`, "quiet")}</div>`}</div>`).join("")}</div>
      ${o.left.length ? `<div class="rt-q"><span class="sm-path">Left for you · ${o.left.length}</span>${o.left.map((x, i) => `<div class="sm-row" style="justify-content:space-between"><span>${esc(x.t)} <span class="sm-note">· ${esc(x.k)}</span></span>${x.st ? `<span class="rt-done">${x.st === "letgo" ? "Let go: archived, never deleted." : "Kept in Unsorted."}</span>` : `<span class="sm-row">${btn("Keep", `data-act="t-left" data-u="${u.id}" data-i="${i}" data-val="keep"`, "quiet")}${btn("Let go", `data-act="t-left" data-u="${u.id}" data-i="${i}" data-val="letgo"`, "quiet")}</span>`}</div>`).join("")}<p class="sm-note">Tip: in the Inbox, <b>Make a rule from this</b> turns any one of these into a rule, so the next one files itself.</p></div>` : ""}`;
  }
  function pileBody(u) {
    return `<p class="sm-note">Nothing moves until you choose. Let go archives it; it's never deleted.</p>` + u.out.items.map((x, i) => `<div class="rt-arrival"${x.st ? ' data-state="saved"' : ""}><b class="rt-at">${esc(x.t)}</b><span class="rt-src">${esc(x.k)} · ${esc(x.since)}</span>
      ${x.st ? `<span class="rt-done">${{ keep: "<b>Kept</b> in To read. It comes back in three months.", week: "<b>This week:</b> added as a session on Today.", letgo: "<b>Let go:</b> archived." }[x.st]}</span>` : `<div class="sm-row">${btn("Read it this week", `data-act="p-act" data-u="${u.id}" data-i="${i}" data-val="week"`)}${btn("Keep", `data-act="p-act" data-u="${u.id}" data-i="${i}" data-val="keep"`, "quiet")}${btn("Let go", `data-act="p-act" data-u="${u.id}" data-i="${i}" data-val="letgo"`, "quiet")}</div>`}</div>`).join("");
  }
  function aliveBody(u) {
    return `<p class="sm-note">Every saved link was opened once. 41 are fine.</p>` + u.out.items.map((x) => `<div class="rt-arrival"><b class="rt-at">${esc(x.t)}</b><span class="rt-src">${x.st === "dead" ? "Stopped working" : "Moved"}</span><p>${esc(x.note)}</p>${x.st === "dead" ? `<div class="sm-row">${btn("Open the saved copy", 'data-act="al-open"', "quiet")}</div>` : ""}</div>`).join("");
  }
  function reviewBody(u) {
    const P = placeName(R(u.rid));
    return u.out.items.map((q, i) => `<div class="rt-q"${q.mark ? ` data-mark="${q.mark}"` : ""}><span class="sm-path">${esc(q.from)}</span><b>${esc(q.q)}</b>${q.shown ? `<p class="rt-ans">${esc(q.a)}</p>${q.mark ? `<span class="rt-done">${q.mark === "got" ? "<b>Got it.</b> Loci may ask again in a few weeks." : "<b>Not yet.</b> It stays in To revisit on " + esc(P) + "."}</span>` : `<div class="sm-row">${btn("Got it", `data-act="mark" data-u="${u.id}" data-i="${i}" data-val="got"`, "quiet")}${btn("Not yet", `data-act="mark" data-u="${u.id}" data-i="${i}" data-val="not"`, "quiet")}</div>`}` : `<div class="sm-row">${btn("Think, then show the answer", `data-act="reveal" data-u="${u.id}" data-i="${i}"`, "quiet")}</div>`}</div>`).join("");
  }
  function briefBody(u) {
    const o = u.out, p = S.play && S.play.u === u.id ? S.play.t : o.heard ? 100 : 0, playing = S.play && S.play.u === u.id && S.play.on;
    const nowCh = Math.min(BRIEF.length - 1, Math.floor((p / 100) * BRIEF.length)), secs = Math.floor((p / 100) * 300);
    return `<div class="rt-audio"><button type="button" class="rt-play" data-act="play" data-u="${u.id}" aria-label="${playing ? "Pause" : "Play"}">${playing ? "❚❚" : "▶"}</button><div style="min-width:0"><b>Your brief for ${esc(fDay(u.at))}</b><div class="rt-pbar"><i style="width:${p}%"></i></div></div><time>${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")} / 5:00</time></div>
      <div class="rt-chapters">${o.chapters.map(([tt, x], i) => `<div class="rt-chapter"${p && i === nowCh ? " data-now" : ""}><span>${tt}</span><p>${x}</p></div>`).join("")}</div>
      <p class="sm-note">In the app, two voices read this, as in Dialogues. Here, a timer stands in.</p>`;
  }
  const digestBody = () => DIGEST.map((d) => `<div class="rt-q"><span class="sm-path">${d.open ? "Open question" : "Answered"}</span><b>${esc(d.q)}</b><p class="sm-note"><b>On the board:</b> ${esc(d.helps)}${d.missing ? ` <b>Missing:</b> ${esc(d.missing)}` : ""}</p>${d.open ? `<div class="sm-row">${btn("Explain…", 'data-act="explain"', "quiet")}</div>` : ""}</div>`).join("");
  const projectBody = () => `<div class="rt-q"><span class="sm-path">Decided this week</span>${PROJECT.decided.map((x) => `<b>${esc(x)}</b>`).join("")}</div><div class="rt-q"><span class="sm-path">Still open</span>${PROJECT.open.map((x) => `<p style="margin:0">${esc(x)}</p>`).join("")}</div><div class="rt-q"><span class="sm-path">Gaps to learn first</span>${PROJECT.gaps.map(([x, p]) => `<div class="sm-row" style="justify-content:space-between"><span>${esc(x)} <span class="sm-note">· ${esc(PLACES[p].name)}</span></span>${btn("Learn this for the project", 'data-act="learnfor"', "quiet")}</div>`).join("")}</div>`;

  /* ---------- the editor: the routine's sentence, with its parts as choices, then the details */
  const draftOf = (r) => ({ ...r, guides: r.guides.map((g) => ({ ...g })), sources: [...r.sources], tally: { ...r.tally }, marks: [...r.marks] });
  function editorHTML() {
    const d = S.edit.d, isNew = S.edit.isNew, K = KINDS[d.kind];
    const sel = (id, key, opts, cur, label) => `<select class="rt-inl" id="${id}" data-ed="${key}" aria-label="${label}">${opts.map(([v, l]) => `<option value="${v}"${v === cur ? " selected" : ""}>${esc(l)}</option>`).join("")}</select>`;
    const placeSel = `<select class="rt-inl" id="ed-place" data-ed="place" aria-label="Where it works">${PLACE_ORDER.map(([g, ids]) => `<optgroup label="${g}">${ids.map((id) => `<option value="${id}"${d.place === id ? " selected" : ""}>${esc(PLACES[id].name)}</option>`).join("")}</optgroup>`).join("")}</select>`;
    const mc = costMonth(d);
    return `<div class="rt-scrim" data-act="ed-close"></div><aside class="rt-sheet" role="dialog" aria-modal="true" aria-labelledby="ed-h">
      <div class="rt-sheet-top"><div><span class="sm-path">${esc(JOBS.find((j) => j.k === K.job).name)} · ${esc(K.name)}</span><h2 id="ed-h">${isNew ? "New routine" : "Edit routine"}</h2></div><button class="button button-link" type="button" data-act="ed-close">Close</button></div>
      <div class="rt-sheet-body">
        <div class="sm-field"><span>What it does</span><p class="rt-sentence">${sel("ed-every", "every", EVERY, d.every, "How often")} at <input class="rt-inl rt-time" type="time" id="ed-time" data-ed="time" value="${esc(d.time)}" aria-label="Time">, ${K.say(placeSel, d)}, and bring it to ${sel("ed-to", "to", TO, d.to, "Where it lands")}.</p><small id="ed-next">Next run: ${esc(fWhen(nextRun(d)))}. ${esc(PLACES[d.place].path)}: ${esc(PLACES[d.place].has)}.</small></div>
        ${d.kind === "watch" ? `<div class="sm-field"><span>Sources</span><div class="rt-chips">${d.sources.map((s, i) => `<span class="rt-chip">${esc(s)} ${act("×", `data-act="ed-src-del" data-i="${i}" aria-label="Remove ${esc(s)}"`)}</span>`).join("") || '<span class="sm-note">None yet.</span>'}</div><div class="sm-row"><input class="sm-input" id="ed-src" placeholder="Paste a site, newsletter, journal or channel" style="flex:1;min-width:0">${btn("Add", 'data-act="ed-src-add"', "quiet")}</div><small>Only these are read. Loci can suggest sources once, and you choose.</small></div>` : ""}
        <label class="sm-field"><span>In your words <small style="font-weight:400">(optional)</small></span><textarea class="sm-area" id="ed-words" data-ed="words" maxlength="300" placeholder="For example: only things about using AI in practice, not general news.">${esc(d.words)}</textarea><small>Loci also reads what it knows about you at that place: your level, why you're learning it, what you've dismissed.</small></label>
        <label class="sm-field"><span>Name</span><input class="sm-input" id="ed-name" data-ed="name" value="${esc(d.name)}" maxlength="60"></label>
        ${d.guides.length ? `<div class="sm-field"><span>Guidelines from your runs</span><ul class="rt-guides">${d.guides.map((g, i) => `<li>${esc(g.t)} <i>· from ${esc(g.from)}${g.how ? ", " + esc(g.how) : ""}</i> ${act("Remove", `data-act="ed-guide-del" data-i="${i}"`)}</li>`).join("")}</ul></div>` : ""}
        <div class="sm-field"><span>What it may do</span><div class="rt-radio">
          <button type="button" data-act="ed-may" data-val="suggest" aria-pressed="${d.may === "suggest"}"><b>Suggest only</b><span>Nothing is saved, made or marked until you say so.</span></button>
          <button type="button" data-act="ed-may" data-val="save" aria-pressed="${d.may === "save"}"><b>Also file what it finds</b><span>Into Commonplace › Unsorted, marked “From a routine”, for you to sort or delete.</span></button></div>
          <p class="rt-never"><b>It never</b> changes a topic's status, your memory or your map, and never sends anything to anyone but you.</p></div>
        <div class="sm-field"><button type="button" class="sm-switch" role="switch" id="ed-skip" aria-checked="${d.skip}" data-act="ed-skip"><i aria-hidden="true"></i>Skip a run when nothing is new at its place</button><small>A skipped run uses none of your allowance.</small></div>
        ${isNew ? "" : `<div>${btn("Delete routine", `data-act="ed-del" data-id="${d.id}"`, "quiet")}</div>`}
      </div>
      <div class="rt-sheet-foot"><span class="rt-est" id="ed-est"${mc > 10 ? " data-warn" : ""}>About <b>${pct(costRun(d))}</b> a run, <b>${pct(mc)}</b> a month of your allowance</span>${btn("Cancel", 'data-act="ed-close"', "quiet")}${btn(isNew ? "Create routine" : "Save", 'data-act="ed-save"')}</div>
    </aside>`;
  }

  /* ================================================================ Today: what came in, and when it ran */
  function todayView() {
    shell("today");
    $$(`.navigation-rail .navigation-link[href="/today"], .tab-bar .tab-bar-link[href="/today"]`, root).forEach((a) => a.setAttribute("aria-current", "page"));
    const h1 = $(".td-head h1", root); if (h1) h1.innerHTML = `Today <span>Monday 26 October</span>`;
    const tm = $(".td-head time", root); if (tm) tm.textContent = "08:10 AM";
    const strip = $(".td-strip", root);
    if (strip) strip.innerHTML = [["M", 26], ["T", 27], ["W", 28], ["T", 29], ["F", 30], ["S", 31], ["S", 1]].map(([l, n], i) => `<button type="button" aria-pressed="${!i}"${i ? " disabled" : ' class="is-on"'}>${l}<b>${n}</b>${i ? "" : "<i></i>"}</button>`).join("");
    const dl = $(".td-dayline", root); if (dl) dl.innerHTML = "<b>Today</b> · three routines ran this morning";
    $$(".td-ev", root).forEach((x) => x.remove());
    const rows = $$(".td-cal-row", root);
    S.runs.filter((u) => u.at.toDateString() === NOW.toDateString()).forEach((u) => { const row = rows.find((x) => $(".td-cal-t", x)?.textContent === `${u.at.getHours()}:00`); row && $(".td-cal-c", row).insertAdjacentHTML("beforeend", `<a class="td-ev is-routine" href="#runs" data-act="openrun" data-u="${u.id}">${esc(R(u.rid).name)}<small>Routine · ${esc(status(u)[1])}</small></a>`); });
    const nowLine = $(".td-cal-now", root), r8 = rows.find((x) => $(".td-cal-t", x)?.textContent === "8:00");
    if (nowLine && r8) { nowLine.style.top = "16.7%"; $(".td-cal-c", r8).appendChild(nowLine); }
    const nexts = S.routines.filter((r) => r.on).map((r) => [r, nextRun(r)]).sort((a, b) => a[1] - b[1]);
    const later = $(".td-plan-later", root); if (later && nexts[0]) later.textContent = `Next routine: ${nexts[0][0].name}, ${fWhen(nexts[0][1])}.`;
    const waiting = S.routines.map(lastRun).filter(Boolean).filter((u) => status(u)[0] === "waiting").sort((a, b) => b.at - a.at);
    const line = (u) => { const o = u.out, r = R(u.rid), left = (f) => o.items.filter(f).length;
      return ({ watch: () => ["Arrivals", `${plural(left((x) => !x.st), "thing")} came in, sorted onto your map`, "Keep or not"], reading: () => ["Readings", `${plural(left((x) => !x.st), "reading")} on ${placeName(r)}`, "Look through them"], questions: () => ["Your questions", "One question can become a Lumen from your own saves", "See it"], week: () => ["Lumen of the week", "An outline from what you saved this week", "Make it"], review: () => ["Review", `${plural(left((x) => !x.mark), "question")} on ${placeName(r)}`, "Answer"], brief: () => ["Daily brief", "Five minutes for the drive", "▶ Listen"], tidy: () => ["Tidy Unsorted", `${plural(o.suggest.filter((x) => !x.st).length, "suggestion")} for a place`, "Place them"], pile: () => ["To read pile", `${plural(left((x) => !x.st), "thing")} waiting three months`, "Decide"] }[o.kind] || (() => [r.name, status(u)[1], "Open"]))(); };
    const html = `<section class="rt-today" aria-labelledby="rt-today-h"><div class="td-h is-plain"><h2 id="rt-today-h">From your routines</h2><span><a href="#routines" data-tab="routines">${waiting.length > 4 ? `${waiting.length - 4} more · ` : ""}All routines</a></span></div>
      <div class="rt-today-list">${inboxTodayCard()}${waiting.slice(0, 4).map((u) => { const [k, ti, cta] = line(u); return `<button type="button" class="rt-tcard" data-act="openrun" data-u="${u.id}"><span class="rt-k">${esc(k)} · ${esc(fWhen(u.at))}</span><b>${esc(ti)}</b><em>${esc(cta)}</em></button>`; }).join("")}</div></section>`;
    $(".td-top", root)?.insertAdjacentHTML("afterend", html);
  }

  /* ================================================================ Loci: routines at this topic, and what they found */
  function lociView() {
    shell("climate");
    $$(`.navigation-rail .navigation-link[href="/graph"], .tab-bar .tab-bar-link[href="/graph"]`, root).forEach((a) => a.setAttribute("aria-current", "page"));
    const cp = $(".cp", root); if (!cp) return;
    const here = S.routines.filter((r) => ["climate", "board"].includes(r.place));
    $(".cp-meta", cp)?.insertAdjacentHTML("afterend", `<div class="rt-here"><div class="rt-here-row"><span>Routines here</span>${act("+ Routine here", 'data-act="new" data-kind="questions" data-place="climate"')}</div>${here.map((r) => `<div class="rt-here-row"><b>${esc(r.name)}</b><span>· ${r.on ? esc(whenText(r).replace(/^Every (\w+day) at/, "$1s at")) : "paused"}</span>${act("Open", `data-act="edit" data-id="${r.id}"`)}</div>`).join("")}</div>`);
    const body = $(".cp-body", cp), u = S.runs.find((x) => x.out.kind === "questions");
    if (body && u) {
      const i = u.out.items.findIndex((y) => y.verdict === "lumen"), x = u.out.items[i];
      body.innerHTML = `<div class="lk-thread"><div class="lk-loci rt-msg"><span class="rt-k">From your Questions and goals · ${esc(fWhen(u.at))}</span><p>${x.st === "made" ? `“${esc(x.lumen.title)}” is being made from your saves. It answers your question from the lecture.` : `Your question from the lecture, <i>${esc(x.q)}</i>, can be answered from things you've already saved. Make a short Lumen of it?`}</p>
        ${x.st ? "" : `<div class="lk-lumen"><span class="sm-ai">Lumen · Watch · from your saves</span><b>${esc(x.lumen.title)}</b><div class="sm-row">${btn("Make it", `data-act="q-make" data-u="${u.id}" data-i="${i}"`)}${btn("See all", `data-act="openrun" data-u="${u.id}"`, "quiet")}</div></div>`}</div></div>`;
    }
    $(".prompts", cp)?.insertAdjacentHTML("afterbegin", `<button type="button" data-act="new" data-kind="review" data-place="climate">Every Friday, ask me what slipped here</button>`);
  }

  /* ================================================================ when something arrives: one door, and your filing rules */
  const cap = (x) => String(x).charAt(0).toUpperCase() + String(x).slice(1);
  const PROJ_NAME = "Prayer hall, Al Barsha";
  const TOPICS = ["climate", "islamic", "daylight", "precast", "vernacular", "home"];
  const CH = { any: "anywhere", whatsapp: "WhatsApp", email: "email", share: "a phone share", browser: "the browser", app: "Studiolo", follow: "a source you follow" };
  const CH_LABEL = { whatsapp: "WhatsApp", email: "Email", share: "Phone share", browser: "Browser", app: "Studiolo", follow: "Follow" };
  const CH_OPTS = [["any", "Anywhere"], ["whatsapp", "WhatsApp"], ["email", "Email"], ["share", "A phone share (Instagram, Safari…)"], ["browser", "The browser"], ["app", "Studiolo itself"], ["follow", "Sources you follow"]];
  const ITEM_KINDS = ["photo", "link", "PDF", "voice note", "video", "reel", "note"];
  const KIND_WORD = { photo: "a photo", link: "a link", PDF: "a PDF", "voice note": "a voice note", video: "a video", reel: "a reel", note: "a note" };
  const IS_OPTS = ["a book", "a recipe", "a paper", "a lecture", "a site photo"];
  // a collection is a kind of thing inside a type, never a folder (owner, Library polish notes)
  const FILE_AS = [["Site photos", "Photos"], ["Renders", "Photos"], ["Precedents", "Objects"], ["Books", "Sources"], ["Papers", "Sources"], ["Videos", "Sources"], ["Links", "Sources"], ["Specifications", "PDFs"], ["Notes", "Notes"], ["Recipes", "Notes"]];
  const UNDERSTAND = [["describe", "describe it", "Describe photos"], ["transcribe", "write out what I said", "Write out voice notes"], ["title", "give it a title", "Give it a title"], ["links", "save the links inside it", "Save the links inside it"], ["book", "find the book", "Find the book"], ["text", "pull out the text", "Pull out the text"], ["summary", "sum it up in three lines", "Three-line summary"], ["recipe", "keep just the recipe", "Keep just the recipe"]];
  const LEARN = [["questions", "turn my questions into @questions", "Questions become @questions"], ["review", "add it to Review", "Add it to Review"], ["lumen", "offer a short Lumen", "Offer a short Lumen"]];
  const PROG = { describe: "Describing the photo…", transcribe: "Writing out what you said…", title: "Giving it a title…", links: "Looking for links inside…", book: "Finding the book…", text: "Pulling out the text…", summary: "Summing it up…", recipe: "Keeping just the recipe…" };
  const COND_TYPES = [["kind", "It's", false], ["site", "It's from the site", false], ["tag", "It has the tag", false], ["words", "Its words include", false], ["is", "Loci reads that it's", true], ["about", "Loci reads that it's about", true]];
  const AI_COND = (c) => c.t === "is" || c.t === "about";

  const blankThen = () => ({ fileAs: "", on: "best", status: "", addTo: "", understand: [], learn: [], reply: "" });
  let fid = 0;
  const rule = (name, when, ifs, then, extra = {}) => ({ id: "f" + ++fid, name, when, ifs, then: { ...blankThen(), ...then }, mode: "ask", always: false, right: [0, 0], filed: 0, undone: 0, on: true, origin: "", ...extra });
  const blankRule = () => ({ id: null, name: "", when: "any", ifs: [], then: blankThen(), mode: "ask", always: false, right: [0, 0], filed: 0, undone: 0, on: true, origin: "" });
  const RULES = [
    rule("Ask and get a Lumen", "whatsapp", [{ t: "tag", v: "#explain" }], { fileAs: "Notes", learn: ["questions", "lumen"], reply: "lumen" }, { always: true, right: [6, 6], filed: 6 }),
    rule("Site photos", "whatsapp", [{ t: "kind", v: "photo" }, { t: "tag", v: "#site" }], { fileAs: "Site photos", on: "", addTo: "project", understand: ["describe"] }, { mode: "own", right: [31, 31], filed: 31 }),
    rule("Recipes", "any", [{ t: "is", v: "a recipe" }], { fileAs: "Recipes", on: "home", understand: ["recipe"] }, { mode: "own", right: [4, 4], filed: 4 }),
    rule("Reels", "share", [{ t: "kind", v: "reel" }], { fileAs: "Videos", understand: ["links"] }, { right: [5, 6] }),
    rule("Books", "any", [{ t: "is", v: "a book" }], { fileAs: "Books", status: "To read", understand: ["book"] }, { right: [9, 10] }),
    rule("Voice notes", "whatsapp", [{ t: "kind", v: "voice note" }], { fileAs: "Notes", understand: ["transcribe", "title"], learn: ["questions"], reply: "confirm" }, { right: [7, 8] }),
    rule("Precedents", "any", [{ t: "site", v: "archdaily.com" }], { fileAs: "Precedents", status: "To read" }, { mode: "own", right: [14, 14], filed: 14, origin: "Made from your own filing, 14 Oct" }),
    rule("Specifications", "email", [{ t: "kind", v: "PDF" }, { t: "words", v: "specification" }], { fileAs: "Specifications", on: "precast", addTo: "project", understand: ["text", "summary"] }, { mode: "own", right: [3, 3], filed: 3 }),
  ];
  const FR = (id) => RULES.find((f) => f.id === id);
  const SUGG = [
    { id: "s1", seen: "You filed 7 links from dezeen.com as Precedents by hand this month.", ask: "Add dezeen.com to your “Precedents” rule?", yes: "Add it", done: "Added. Links from dezeen.com now file as Precedents too.", apply: () => { const f = RULES.find((r) => r.name === "Precedents"); const c = f.ifs.find((x) => x.t === "site"); c.v += ", dezeen.com"; return f.id; } },
    { id: "s2", seen: "You typed #ask in 5 WhatsApp messages this week, then turned each one into a question by hand.", ask: "Make #ask always become a @question on the topic it's about?", yes: "Make it a rule", done: "Made “Questions by WhatsApp”. It asks first until it has earned your trust.", apply: () => { const f = rule("Questions by WhatsApp", "whatsapp", [{ t: "tag", v: "#ask" }], { fileAs: "Notes", learn: ["questions"], reply: "confirm" }, { origin: "Made from your own filing, 29 Oct" }); RULES.unshift(f); return f.id; } },
  ];
  const EVENTS = [
    { id: "e1", job: "Learn", name: "After a Lumen", say: "When I finish a Lumen, bring its check back three days later.", on: true, did: "12 checks brought back this month" },
    { id: "e2", job: "Learn", name: "Highlights become questions", say: "When I highlight in the reader, turn the week's highlights into questions on Friday.", on: true, did: "9 questions from 23 highlights" },
    { id: "e3", job: "Manage", name: "Saved twice", say: "When I send something I already have, keep the one I have and tell me.", on: true, did: "3 caught this month" },
    { id: "e4", job: "Learn", name: "A date on a topic", say: "When I set a date on a topic or project, plan sessions to get ready by then.", on: true, did: "1 plan: meeting the precaster, 5 Nov" },
    { id: "e5", job: "Learn", name: "Learned, then checked", say: "When I mark a topic Learned, check me once, a month later.", on: false, did: "Off" },
  ];

  // what you send (simulated); "made" is what Loci's reading produces for each action
  const SEND = [
    { id: "m1", ch: "whatsapp", label: "Photo with “#site east court at 4 pm”", media: "Photo", text: "#site east court at 4 pm, shade only reaches halfway", kind: "photo", title: "East court at 4 pm", tags: ["#site"], is: "a site photo", about: "climate", made: { describe: "Described: the east court late in the afternoon. The west wall's shadow covers about half the paving; the fountain is in sun." } },
    { id: "m2", ch: "whatsapp", label: "A link from archdaily.com", media: "", text: "archdaily.com/… courtyard house in Muscat", kind: "link", site: "archdaily.com", title: "Courtyard house in Muscat (example)", about: "climate", made: {} },
    { id: "m3", ch: "whatsapp", label: "Photo of a book cover", media: "Photo: a book cover", text: "", kind: "photo", title: "Photo of a book cover", newTitle: "Climate Considerations in Building and Urban Design", is: "a book", about: "climate", made: { book: "Found the book: Climate Considerations in Building and Urban Design, Baruch Givoni, 1998. Checked in Open Library." } },
    { id: "m4", ch: "whatsapp", label: "Voice note, 0:38", media: "Voice note 0:38", text: "", kind: "voice note", title: "Voice note", newTitle: "Precaster: thermal breaks at the fixings", about: "precast", made: { transcribe: "Written out: “Note to self: ask the precaster about thermal breaks at the fixings. And is stainless worth the extra cost?”", title: "Titled: Precaster: thermal breaks at the fixings", questions: "@question: Is stainless worth the extra cost at the fixings?" } },
    { id: "m5", ch: "whatsapp", label: "Voice note with #explain", media: "Voice note 0:12", text: "#explain", kind: "voice note", title: "Voice note", newTitle: "Why does stainless let less heat through?", tags: ["#explain"], about: "precast", made: { questions: "@question: Why does stainless steel let less heat through than ordinary steel?", lumen: "Lumen offered on WhatsApp" } },
    { id: "m10", ch: "whatsapp", label: "Photo of a book you already have", media: "Photo: a book cover", text: "", kind: "photo", title: "Thermal Delight in Architecture", is: "a book", about: "climate", dup: "saved 19 Oct", made: {} },
    { id: "m6", ch: "share", label: "Instagram reel: three courtyard houses", media: "", text: "", kind: "reel", title: "Three courtyard houses in Morocco (example reel)", about: "vernacular", made: { links: "Found 2 links in the caption and saved each as a video: “Riad restoration, a walkthrough” and “How a riad stays cool” (examples)." } },
    { id: "m7", ch: "share", label: "Instagram reel: a lentil soup recipe", media: "", text: "", kind: "reel", title: "Red lentil soup in 20 minutes (example reel)", is: "a recipe", about: "home", made: { recipe: "Kept just the recipe: red lentils, onion, cumin, lemon, 6 steps. The rest of the reel isn't saved." } },
    { id: "m8", ch: "email", label: "A PDF: “Precast facade specification (draft)”", media: "", text: "", kind: "PDF", title: "Precast facade specification (draft).pdf", about: "precast", made: { text: "Pulled out the text: 24 pages.", summary: "Summary: stainless A4 fixings; 20 mm joints; a thermal break at every bracket." } },
    { id: "m9", ch: "browser", label: "A blog post on Japanese joinery", media: "", text: "", kind: "link", site: "woodworking-blog.example", title: "Japanese joinery without nails (example)", newTopic: "Timber joinery", made: {} },
  ];
  // the last 20 arrivals, for Try it (examples)
  const PAST = [
    { ch: "whatsapp", kind: "photo", tags: ["#site"], title: "North wall, morning", is: "a site photo", about: "climate" },
    { ch: "whatsapp", kind: "photo", tags: ["#site"], title: "Mihrab niche, rough opening", is: "a site photo", about: "islamic" },
    { ch: "browser", kind: "link", site: "archdaily.com", title: "Courtyard school in Burkina Faso (example)", about: "climate" },
    { ch: "browser", kind: "link", site: "dezeen.com", title: "A mosque with a timber roof (example)", about: "islamic" },
    { ch: "share", kind: "reel", title: "Brick screens in Dhaka (example reel)", about: "daylight" },
    { ch: "share", kind: "reel", title: "Za'atar flatbread (example reel)", is: "a recipe", about: "home" },
    { ch: "whatsapp", kind: "voice note", title: "Voice note: daylight factor for the hall", about: "daylight" },
    { ch: "email", kind: "PDF", title: "Precast specification rev B.pdf", about: "precast" },
    { ch: "email", kind: "PDF", title: "Invoice, October.pdf" },
    { ch: "whatsapp", kind: "photo", title: "Book cover: Architecture for the Poor", is: "a book", about: "climate" },
    { ch: "browser", kind: "link", site: "sciencedirect.com", title: "A paper on wind towers (example)", is: "a paper", about: "climate" },
    { ch: "whatsapp", kind: "video", title: "Lecture: courtyard microclimates (example)", is: "a lecture", about: "climate" },
    { ch: "app", kind: "note", title: "Shade first, then air", about: "climate" },
    { ch: "whatsapp", kind: "photo", title: "A receipt" },
    { ch: "share", kind: "link", site: "a-bookshop.example", title: "Book page: The Architecture of Natural Cooling", is: "a book", about: "climate" },
    { ch: "whatsapp", kind: "voice note", tags: ["#explain"], title: "Voice note: why do thick walls delay heat?", about: "climate" },
    { ch: "browser", kind: "link", site: "archdaily.com", title: "Brick vaults in Iran (example)", about: "vernacular" },
    { ch: "follow", kind: "link", title: "A daylight guideline update (example)", about: "daylight" },
    { ch: "whatsapp", kind: "photo", tags: ["#site"], title: "Formwork for the precast mock-up", is: "a site photo", about: "precast" },
    { ch: "share", kind: "reel", title: "A riad courtyard tour (example reel)", about: "vernacular" },
  ];
  PAST.forEach((x) => { x.text = x.text || ""; x.words = x.title; if (/specification/i.test(x.title)) x.words += " specification"; });

  // the Inbox feed: everything that arrived, and what happened (newest first when shown)
  let aid = 0;
  const ARR = [
    { aid: "p1", ch: "whatsapp", kind: "photo", title: "North wall, morning", tags: ["#site"], at: at(10, 25, 16, 5), state: "filed", rule: RULES[1].id, made: { describe: "Described: the north wall in morning light; the parapet casts a thin shadow line." } },
    { aid: "p2", ch: "browser", kind: "link", site: "archdaily.com", title: "Courtyard school in Burkina Faso (example)", about: "climate", at: at(10, 25, 18, 40), state: "filed", rule: RULES[6].id, made: {} },
    { aid: "p3", ch: "share", kind: "reel", title: "Za'atar flatbread (example reel)", is: "a recipe", about: "home", at: at(10, 25, 21, 12), state: "filed", rule: RULES[2].id, made: { recipe: "Kept just the recipe: 7 ingredients, 5 steps." } },
    { aid: "p4", ch: "share", kind: "photo", title: "A screenshot with no text", at: at(10, 25, 22, 30), state: "unsorted", rule: null, made: {} },
  ];
  const AR = (x) => ARR.find((a) => a.aid === x);

  function matches(f, it) {
    if (!f.on && f.id) return false;
    if (f.when !== "any" && f.when !== it.ch) return false;
    if (!f.ifs.length) return f.when !== "any";
    return f.ifs.every((c) => {
      if (!String(c.v).trim()) return false;
      if (c.t === "kind") return it.kind === c.v;
      if (c.t === "site") return c.v.split(/[,\s]+/).filter(Boolean).includes(it.site);
      if (c.t === "tag") return (it.tags || []).includes(c.v.trim());
      if (c.t === "words") return `${it.title} ${it.text || ""} ${it.words || ""}`.toLowerCase().includes(c.v.toLowerCase());
      if (c.t === "is") return it.is === c.v;
      if (c.t === "about") return it.about === c.v;
      return false;
    });
  }
  const firstRule = (it) => RULES.find((f) => f.on && matches(f, it));
  function where(f, it, over) {
    const t = f ? f.then : blankThen();
    const place = over || (t.on === "best" ? it.about : t.on);
    const bits = [t.fileAs && `as ${t.fileAs}`, place && PLACES[place] && `on ${PLACES[place].name}`, !place && !f && it.newTopic && `on a new sub-topic “${it.newTopic}” (suggested, not made)`, t.addTo === "project" && `in ${PROJ_NAME}`, t.addTo === "board" && `on the board “${PLACES.board.name}”`, t.status && `· ${t.status}`].filter(Boolean);
    return bits.join(" ") || "as it came";
  }
  const madeLines = (f, it) => (f ? [...f.then.understand, ...f.then.learn].map((k) => it.made?.[k]).filter(Boolean) : []);
  const needsAI = (f) => (f ? f.ifs.some(AI_COND) || f.then.on === "best" || f.then.understand.some((k) => k !== "text") || f.then.learn.length > 0 : S.catchall === "ask");

  /* ---------- the sentence a rule reads as (dotted parts: Loci reads the item to know) */
  const ink = (x) => `<span class="rt-ink">${esc(x)}</span>`;
  const ai = (x) => `<span class="rt-ai">${esc(x)}</span>`;
  function ruleSentence(f) {
    const kind = f.ifs.find((c) => c.t === "kind" && c.v);
    const qual = f.ifs.filter((c) => c.t !== "kind" && String(c.v).trim()).map((c) => ({ site: `from ${ink(c.v)}`, tag: `with ${ink(c.v)}`, words: `mentioning “${ink(c.v)}”`, is: `that is ${ai(c.v)}`, about: `about ${ai(PLACES[c.v]?.name || c.v)}` })[c.t]);
    let s = `When ${kind ? ink(KIND_WORD[kind.v] || kind.v) : "something"}${qual.length ? " " + qual.join(" and ") : ""} arrives${f.when !== "any" ? ` from ${ink(CH[f.when])}` : ""}, `;
    const t = f.then, acts = [];
    t.understand.forEach((k) => acts.push(ai(UNDERSTAND.find((u) => u[0] === k)[1])));
    const filePart = [t.fileAs ? `file it as ${ink(t.fileAs)}` : "file it", t.on === "best" ? `on ${ai("the topic it's about")}` : t.on && PLACES[t.on] ? `on ${ink(PLACES[t.on].name)}` : "", t.status ? `as ${ink(t.status)}` : ""].filter(Boolean).join(" ");
    acts.push(filePart);
    if (t.addTo === "project") acts.push(`add it to ${ink(PROJ_NAME)}`);
    if (t.addTo === "board") acts.push(`put it on the board ${ink(PLACES.board.name)}`);
    t.learn.forEach((k) => acts.push(k === "lumen" && t.reply === "lumen" ? `${ai("offer a short Lumen")} and send me the link` : ai(LEARN.find((l) => l[0] === k)[1])));
    if (t.reply === "confirm") acts.push(`tell me on ${ink("WhatsApp")}`);
    s += acts.length > 1 ? acts.slice(0, -1).join(", ") + " and " + acts[acts.length - 1] : acts[0];
    return s + ".";
  }
  const autoName = (d) => d.then.fileAs || cap((d.ifs.find((c) => c.t === "kind")?.v || "Things") + "s") + (d.when !== "any" ? ` from ${CH_LABEL[d.when]}` : "");

  /* ---------- the When something arrives section */
  function ruleCard(f, i) {
    const offer = f.mode === "ask" && !f.always && f.right[1] >= 8 && f.right[0] / f.right[1] >= 0.9;
    const stats = f.mode === "own" && !f.always ? `Filed ${f.filed} this month · ${f.undone ? `${f.undone} undone` : "none undone"}` : `Right ${f.right[0]} of ${f.right[1]} times you checked`;
    return `<article class="rt-rule" id="rule-${f.id}"${f.on ? "" : " data-off"}${S.flash === f.id ? " data-flash" : ""}>
      <span class="rt-num" aria-label="Rule ${i + 1}">${i + 1}</span>
      <div class="rt-rule-main">
        <div class="rt-top"><h3 class="rt-name">${esc(f.name)}</h3><span class="rt-mode" data-m="${f.always ? "always" : f.mode}">${!f.on ? "Paused" : f.always ? "Always asks: it costs" : f.mode === "own" ? "Files on its own" : "Asks you first"}</span></div>
        <p class="rt-say">${ruleSentence(f)}</p>
        <div class="rt-came"><span>${esc(stats)}</span>${f.origin ? `<span class="rt-origin">${esc(f.origin)}</span>` : ""}</div>
        ${offer && f.on ? `<div class="rt-offer"><span>Right ${f.right[0]} of the last ${f.right[1]}. Let it file on its own? Each one will still say so, with Undo.</span>${btn("Let it file on its own", `data-act="r-trust" data-id="${f.id}"`, "quiet")}</div>` : ""}
        ${S.tryRule === f.id ? `<div class="rt-tryres">${tryList(f)}</div>` : ""}
        <div class="rt-acts">${act(S.tryRule === f.id ? "Close the try" : "Try it", `data-act="r-try" data-id="${f.id}"`)}${act("What it did", `data-act="r-did" data-id="${f.id}"`)}${act("Edit", `data-act="r-edit" data-id="${f.id}"`)}${act(f.on ? "Pause" : "Turn on", `data-act="r-toggle" data-id="${f.id}"`)}${i > 0 ? act("Move up", `data-act="r-up" data-id="${f.id}"`) : ""}${i < RULES.length - 1 ? act("Move down", `data-act="r-down" data-id="${f.id}"`) : ""}</div>
      </div></article>`;
  }
  function tryList(f) {
    const idx = RULES.findIndex((r) => r.id === f.id), cut = idx < 0 ? 0 : idx;
    const hits = PAST.filter((p) => matches({ ...f, on: true }, p));
    if (!hits.length) return `<p class="sm-note">Matches none of your last 20 arrivals. Check the conditions: every one has to fit.</p>`;
    return `<p class="sm-note"><b>Matches ${hits.length} of your last 20 arrivals.</b> Nothing is moved by trying.</p><ul class="rt-trylist">${hits.map((p) => { const before = RULES.slice(0, cut).find((r) => r.on && r.id !== f.id && matches(r, p)); return `<li><b>${esc(p.title)}</b><span>would file ${esc(where(f, p))}${before ? ` <em>· today “${esc(before.name)}” gets it first</em>` : ""}</span></li>`; }).join("")}</ul>`;
  }
  const suggCard = (g) => `<div class="rt-sugg"><span class="rt-k">Suggested from what you do</span><p><b>${esc(g.seen)}</b> ${esc(g.ask)}</p><div class="sm-row">${btn(g.yes, `data-act="sugg-yes" data-id="${g.id}"`)}${btn("Not now", `data-act="sugg-no" data-id="${g.id}"`, "quiet")}</div></div>`;
  function arriveBody() {
    const sg = SUGG.filter((g) => !S.suggDone.has(g.id));
    return `${sg.length ? `<div class="rt-suggs">${sg.map(suggCard).join("")}</div>` : ""}
      <div class="rt-rules">${RULES.map(ruleCard).join("")}
        <div class="rt-rule rt-catch"><span class="rt-num" aria-hidden="true">·</span><div class="rt-rule-main"><div class="rt-top"><h3 class="rt-name">Anything else</h3></div><p class="rt-say">${S.catchall === "ask" ? `When nothing above fits, ${ai("Loci suggests a place")} and asks you.` : "When nothing above fits, it waits in Unsorted for tonight's tidy."}</p><div class="rt-acts">${act(S.catchall === "ask" ? "Leave it in Unsorted instead" : "Have Loci suggest a place instead", 'data-act="catchall"')}</div></div></div>
      </div>
      <div class="sm-row">${btn("New rule", 'data-act="r-new"')}${btn("Open the Inbox", 'data-go="inbox"', "quiet")}<span class="sm-note"><span class="rt-ai">Dotted</span> parts: Loci reads the item to know. The rest are plain rules and cost nothing.</span></div>`;
  }
  const eventCard = (e) => `<article class="rt-card"${e.on ? "" : " data-off"}><div class="rt-top"><span class="rt-k">${esc(e.job)} · When something happens</span><span class="rt-next">${e.on ? "On" : "Off"}</span></div><h3 class="rt-name">${esc(e.name)}</h3><p class="rt-say">${esc(e.say)}</p><div class="rt-came"><span>${esc(e.did)}</span></div><div class="rt-acts">${act(e.on ? "Turn off" : "Turn on", `data-act="ev-toggle" data-id="${e.id}"`)}</div></article>`;

  /* ---------- arriving: simulate a send, and let the rules act */
  function send(id) {
    const m = SEND.find((x) => x.id === id); if (!m || S.sent.has(id)) return;
    S.sent.add(id);
    const a = { ...m, made: { ...m.made }, aid: "a" + ++aid, live: true, at: new Date(NOW.getTime() + S.sent.size * 60000), state: "processing", p: 8, step: `Received from ${CH_LABEL[m.ch]}` };
    if (m.ch === "whatsapp") S.chat.push({ from: "me", media: m.media, text: m.text, t: fTime(a.at) });
    ARR.push(a);
    const dupOn = EVENTS.find((e) => e.id === "e3").on;
    const f = a.dup && dupOn ? null : firstRule(a);
    const steps = a.dup && dupOn ? ["Checking what you have", "You already have this"] : [needsAI(f) ? "Loci is reading it" : "Checking your rules", f ? `Matched “${f.name}”` : "No rule fits", ...(f ? f.then.understand.map((k) => PROG[k]) : [])];
    let i = 0;
    const tick = setInterval(() => {
      if (i < steps.length) { a.step = steps[i]; a.p = Math.round(((i + 1) / (steps.length + 1)) * 100); i++; if (S.view === "inbox") render(); return; }
      clearInterval(tick); finish(a, f, dupOn); render();
    }, 480);
    render();
  }
  function finish(a, f, dupOn) {
    if (a.newTitle && f) a.title = a.newTitle;
    if (a.dup && dupOn) { a.state = "dup"; if (a.ch === "whatsapp") S.chat.push({ from: "studio", text: `You already have this one: “${a.title}”, ${a.dup}. Nothing added.`, t: fTime(a.at) }); return; }
    if (!f) { a.state = S.catchall === "ask" ? "suggest" : "unsorted"; return; }
    a.rule = f.id; a.by = f.name;
    a.state = f.mode === "own" && !f.always ? "filed" : "waiting";
    if (a.state === "filed") f.filed++;
    if (a.ch !== "whatsapp") return;
    if (f.then.reply === "lumen") S.chat.push({ from: "studio", text: "I can make a 3-minute Lumen on this from what you've saved on Precast. It uses about 1% of your monthly allowance. Make it?", ask: a.aid, t: fTime(a.at) });
    else if (f.then.reply === "confirm") S.chat.push({ from: "studio", text: a.state === "filed" ? `Saved ${where(f, a)}.${a.made.questions ? " 1 question kept." : ""} Reply “undo” to take it back.` : `Got it: “${a.title}”. It's waiting for you in the Inbox: Loci suggests filing it ${where(f, a)}.${a.made.questions ? " 1 question found." : ""}`, t: fTime(a.at) });
  }
  function waAnswer(id, yes) {
    const a = AR(id), f = FR(a.rule); if (!a || a.answered) return;
    a.answered = true;
    const tNow = fTime(new Date(NOW.getTime() + (S.sent.size + 1) * 60000));
    S.chat.push({ from: "me", text: yes ? "Yes" : "No", t: tNow });
    if (!yes) { a.state = "filed"; a.made.lumen = "No Lumen: you said no. The question is kept."; S.chat.push({ from: "studio", text: "Fine. Your question is kept on Precast.", t: tNow }); if (f) { f.right[0]++; f.right[1]++; } render(); return; }
    S.chat.push({ from: "studio", text: "Making it. About two minutes.", t: tNow });
    render();
    setTimeout(() => {
      a.state = "filed"; a.made.lumen = "Made the Lumen “Why stainless lets less heat through” (3 min) and sent the link on WhatsApp.";
      if (f) { f.right[0]++; f.right[1]++; f.filed++; }
      S.chat.push({ from: "studio", text: "Here it is: “Why stainless lets less heat through”, 3 min. Your question is kept on Precast, answered by this Lumen.", link: true, t: fTime(new Date(NOW.getTime() + (S.sent.size + 3) * 60000)) });
      render();
    }, 1400);
  }
  const ruleFromItem = (x) => { const d = blankRule(); d.when = x.ch; d.ifs = [{ t: "kind", v: x.kind }, ...((x.tags || []).length ? [{ t: "tag", v: x.tags[0] }] : []), ...(x.site ? [{ t: "site", v: x.site }] : [])]; d.name = autoName(d); return d; };

  /* ---------- the Inbox view */
  const sendBtn = (m) => `<button type="button" class="rt-sendbtn" data-act="send" data-id="${m.id}"${S.sent.has(m.id) ? " disabled" : ""}><span class="rt-kindtag">${esc(m.kind)}</span><span>${esc(m.label)}</span></button>`;
  const bubble = (b) => `<div class="rt-bub" data-from="${b.from}">${b.media ? `<span class="rt-media">${esc(b.media)}</span>` : ""}${b.text ? `<span>${esc(b.text)}</span>` : ""}${b.link ? `<span class="rt-lumenlink">▶ Open the Lumen</span>` : ""}${b.ask && !AR(b.ask)?.answered ? `<span class="sm-row">${btn("Yes", `data-act="wa-yes" data-a="${b.ask}"`, "quiet")}${btn("No", `data-act="wa-no" data-a="${b.ask}"`, "quiet")}</span>` : ""}<time>${esc(b.t)}</time></div>`;
  function arrivalCard(a) {
    const f = a.rule ? FR(a.rule) : null;
    const head = `<div class="rt-arr-h"><span class="rt-kindtag">${esc(a.kind)}</span><b>${esc(a.title)}</b><span class="rt-src">from ${esc(CH_LABEL[a.ch])} · ${esc(fWhen(a.at))}</span></div>`;
    let body = "";
    if (a.state === "processing") body = `<div class="rt-proc"><div class="rt-pbar"><i style="width:${a.p}%"></i></div><span>${esc(a.step)}</span></div>`;
    else if (a.state === "filed") body = `<p class="rt-out1">Filed by <b>${esc(a.by || f?.name || "you")}</b> ${esc(where(f, a, a.placed))}</p>${madeLines(f, a).map((x) => `<p class="rt-made">${esc(x)}</p>`).join("")}<div class="rt-acts">${act("Undo", `data-act="a-undo" data-a="${a.aid}"`)}${act(a.why ? "Hide why" : "Why", `data-act="a-why" data-a="${a.aid}"`)}</div>`;
    else if (a.state === "waiting" || a.state === "suggest") body = `<p class="rt-out1">${f ? `<b>${esc(f.name)}</b> asks:` : "<b>No rule fits.</b> Loci suggests:"} file it ${esc(where(f, a))}</p>${madeLines(f, a).map((x) => `<p class="rt-made">${esc(x)}</p>`).join("")}
      ${f?.then.reply === "lumen" && !a.answered ? `<p class="sm-note">Waiting for your yes or no on WhatsApp.</p>` : `<div class="sm-row">${btn("File it", `data-act="a-file" data-a="${a.aid}"`)}${a.about || (f && f.then.on === "best") ? `<span class="sm-note">or on</span>${topicSel(`ap-${a.aid}`, a.about)}` : ""}${btn("Leave in Unsorted", `data-act="a-leave" data-a="${a.aid}"`, "quiet")}</div>`}
      <div class="rt-acts">${f ? "" : act("Make a rule from this", `data-act="a-rule" data-a="${a.aid}"`)}${act(a.why ? "Hide why" : "Why", `data-act="a-why" data-a="${a.aid}"`)}</div>`;
    else if (a.state === "unsorted" || a.state === "undone") body = `<p class="rt-out1">${a.state === "undone" ? "Undone. It's in Unsorted." : "In Unsorted. No rule fits it."} Tonight's tidy will suggest a place.</p><div class="rt-acts">${act("Make a rule from this", `data-act="a-rule" data-a="${a.aid}"`)}${act(a.why ? "Hide why" : "Why", `data-act="a-why" data-a="${a.aid}"`)}</div>`;
    else if (a.state === "dup") body = `<p class="rt-out1">You already have this (${esc(a.dup)}). Nothing added.</p>`;
    return `<article class="rt-arr" data-state="${a.state}">${head}${body}${a.why ? whyHTML(a, f) : ""}</article>`;
  }
  const condLabel = (c) => ({ kind: `it's ${KIND_WORD[c.v] || c.v}`, site: `it's from ${c.v}`, tag: `it has ${c.v}`, words: `it mentions “${c.v}”`, is: `Loci read that it's ${c.v}`, about: `Loci read that it's about ${PLACES[c.v]?.name || c.v}` })[c.t];
  function whyHTML(a, f) {
    const tech = S.builder ? `<p class="rt-tech"><b>Builder:</b> Received through ${{ whatsapp: "the WhatsApp Business Platform (a webhook; media downloaded)", email: "the inbound email address (attachment saved)", share: "the phone's share sheet (link and caption)", browser: "the browser button (page address and title)", app: "Studiolo's own capture", follow: "a followed source" }[a.ch]}. ${needsAI(f) ? `One small-model call read what it is and which topic it's about, because ${f ? "the rule needed it" : "“Anything else” suggests a place"}.` : "No model call: the conditions are plain."} Rules checked in code, top to bottom.${f && f.then.understand.includes("transcribe") ? " Speech-to-text for the voice note." : ""}${f && f.then.understand.includes("describe") ? " A small vision call for the description." : ""}${f && f.then.understand.includes("book") ? " A catalogue lookup." : ""} Filed in code, with an undo record.</p>` : "";
    if (!f) return `<div class="rt-why"><p>${RULES.filter((r) => r.on).length} rules checked from the top; none fits${a.kind ? `: it's ${KIND_WORD[a.kind] || a.kind} from ${CH_LABEL[a.ch]}` : ""}.${a.state === "suggest" ? " “Anything else” is set to suggest, so Loci read it for a place." : ""}</p>${tech}</div>`;
    const k = RULES.indexOf(f), above = RULES.slice(0, k).filter((r) => r.on).length;
    return `<div class="rt-why"><p>Rule ${k + 1}, <b>${esc(f.name)}</b>: ${[f.when !== "any" ? `it came from ${CH_LABEL[f.when]}` : "", ...f.ifs.map(condLabel)].filter(Boolean).map(esc).join(" · ")}.${above ? ` ${plural(above, "rule")} above didn't fit.` : ""}</p>${tech}</div>`;
  }
  function inboxView() {
    const fr = S.inboxFilter ? FR(S.inboxFilter) : null;
    let list = ARR.slice().sort((x, y) => y.at - x.at);
    if (fr) list = list.filter((x) => x.rule === fr.id);
    const tabs = [["all", "All"], ["filed", "Filed"], ["waiting", "Waiting for you"], ["unsorted", "Unsorted"]];
    const inTab = (x) => S.feedTab === "all" || (S.feedTab === "filed" && x.state === "filed") || (S.feedTab === "waiting" && (x.state === "waiting" || x.state === "suggest")) || (S.feedTab === "unsorted" && (x.state === "unsorted" || x.state === "undone"));
    const count = (k) => ARR.filter((x) => (k === "waiting" ? x.state === "waiting" || x.state === "suggest" : k === "unsorted" ? x.state === "unsorted" || x.state === "undone" : k === "filed" ? x.state === "filed" : true)).length;
    const group = (title, chs) => `<div class="rt-chan"><div class="rt-chan-h"><b>${title}</b></div><div class="rt-sends">${SEND.filter((m) => chs.includes(m.ch)).map(sendBtn).join("")}</div></div>`;
    return `<div class="rt-page"><header class="destination-header"><div class="destination-crumb"><strong>Commonplace</strong><i aria-hidden="true">/</i><span>Inbox</span></div></header>
      <div class="rt-body"><div class="rt-intro"><div><h1 class="sm-h1">Inbox</h1><p class="sm-lead">Everything that arrives, from any channel, and what your filing rules did with it. Send something from the panel and watch it get filed.</p></div><div class="rt-intro-side">${btn("Your filing rules", 'data-go="routines"', "quiet")}</div></div>
      <div class="rt-inbox">
        <aside class="rt-send" aria-label="Send something (simulated)">
          <div class="rt-chan"><div class="rt-chan-h"><b>WhatsApp</b><span>to Studiolo's number (simulated)</span></div><div class="rt-chat" id="rt-chat">${S.chat.map(bubble).join("") || '<p class="sm-note">Send something below. Replies from Studiolo show here.</p>'}</div><div class="rt-sends">${SEND.filter((m) => m.ch === "whatsapp").map(sendBtn).join("")}</div></div>
          ${group("Share from your phone", ["share"])}${group("Email to your Studiolo address", ["email"])}${group("The browser button", ["browser"])}
          ${S.sent.size ? `<div>${act("Start the demo over", 'data-act="inbox-reset"')}</div>` : ""}
        </aside>
        <section class="rt-feed" aria-label="Just arrived">
          ${fr ? `<div class="sm-row"><span class="rt-chip">Only what <b>${esc(fr.name)}</b> did</span>${act("Show all", 'data-act="inbox-unfilter"')}</div>` : ""}
          <div class="rt-tabs" role="group" aria-label="Show">${tabs.map(([k, l]) => `<button type="button" data-act="feed" data-val="${k}" aria-pressed="${S.feedTab === k}">${l} <span>${count(k)}</span></button>`).join("")}</div>
          ${list.filter(inTab).map(arrivalCard).join("") || '<p class="sm-note">Nothing here.</p>'}
        </section>
      </div></div></div>`;
  }
  function inboxTodayCard() {
    const since = at(10, 25, 15, 0), xs = ARR.filter((x) => x.at >= since && x.state !== "processing");
    const filed = xs.filter((x) => x.state === "filed").length, wait = xs.filter((x) => x.state === "waiting" || x.state === "suggest").length, uns = xs.filter((x) => x.state === "unsorted" || x.state === "undone").length;
    return `<button type="button" class="rt-tcard" data-go="inbox"><span class="rt-k">Inbox · since yesterday afternoon</span><b>${plural(xs.length, "thing")} arrived: ${filed} filed by your rules${wait ? `, ${wait} waiting for you` : ""}${uns ? `, ${uns} in Unsorted` : ""}</b><em>Open the Inbox</em></button>`;
  }

  /* ---------- the rule editor: say it, or set it */
  const SAY_EX = [
    "When I send a photo with #site from WhatsApp, file it as Site photos in the prayer hall project and describe it, on its own.",
    "When I share a reel, save the links inside it and file it as Videos on the topic it's about.",
    "When a PDF arrives by email mentioning specification, pull out the text, sum it up in three lines and file it as Specifications on Precast.",
    "When I send a voice note on WhatsApp, write out what I said, turn my questions into questions and tell me.",
  ];
  function sayParse(text) {
    const s = text.toLowerCase(), d = blankRule();
    d.when = /whatsapp/.test(s) ? "whatsapp" : /e-?mail/.test(s) ? "email" : /instagram|facebook|tiktok|\breel|share sheet|from my phone/.test(s) ? "share" : /browser|chrome|safari/.test(s) ? "browser" : "any";
    const kind = [["voice note", /voice|audio/], ["photo", /photo|picture|image|screenshot/], ["PDF", /\bpdf/], ["reel", /\breel/], ["video", /video/], ["link", /\blink/]].find(([, re]) => re.test(s));
    if (kind) d.ifs.push({ t: "kind", v: kind[0] });
    const tag = text.match(/#[\w-]+/); if (tag) d.ifs.push({ t: "tag", v: tag[0].toLowerCase() });
    const site = s.match(/\b([a-z0-9-]+\.(?:com|org|net|io|edu|co\.uk))\b/); if (site) d.ifs.push({ t: "site", v: site[1] });
    const words = s.match(/mentioning (\w+)/); if (words) d.ifs.push({ t: "words", v: words[1] });
    const is = [["a recipe", /recipe/], ["a paper", /\bpaper/], ["a lecture", /lecture/], ["a book", /\bbooks?\b(?! cover)/]].find(([, re]) => re.test(s) && !(re.source.includes("book") && /find the book/.test(s) && !/is a book|when a book|if it's a book/.test(s)));
    if (is) d.ifs.push({ t: "is", v: is[0] });
    const fa = FILE_AS.find(([v]) => s.includes(v.toLowerCase())); if (fa) d.then.fileAs = fa[0];
    const pl = TOPICS.find((p) => s.includes(PLACES[p].name.toLowerCase()));
    if (pl) d.then.on = pl; else if (/project|prayer hall/.test(s) && !/topic it's about|where it belongs/.test(s)) d.then.on = "";
    if (/project|prayer hall/.test(s)) d.then.addTo = "project"; else if (/\bboard\b/.test(s)) d.then.addTo = "board";
    if (/to read|reading list/.test(s)) d.then.status = "To read";
    const U = [["describe", /describe|caption/], ["transcribe", /transcribe|write (it )?out|what i said/], ["title", /\btitle/], ["links", /links? inside|the links/], ["book", /find the book/], ["text", /extract|pull (out )?the text/], ["summary", /summar|three lines|3 lines/], ["recipe", /just the recipe/]];
    d.then.understand = U.filter(([, re]) => re.test(s)).map(([k]) => k);
    const L = [["questions", /question/], ["review", /\breview/], ["lumen", /lumen|#explain|explain it/]];
    d.then.learn = L.filter(([, re]) => re.test(s)).map(([k]) => k);
    if (d.when === "whatsapp" && /tell me|reply|send (it |me )?back|send me/.test(s)) d.then.reply = d.then.learn.includes("lumen") ? "lumen" : "confirm";
    d.always = d.then.learn.includes("lumen");
    d.mode = !d.always && /on its own|without asking|automatically|just do it/.test(s) ? "own" : "ask";
    d.name = autoName(d);
    return d;
  }
  function condRow(c, i) {
    const opts = (pairs, cur) => pairs.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(cur) ? " selected" : ""}>${esc(l)}</option>`).join("");
    const val = c.t === "kind" ? `<select class="sm-select" id="re-cv-${i}" data-re="cv" data-i="${i}" aria-label="Kind">${opts(ITEM_KINDS.map((k) => [k, KIND_WORD[k]]), c.v)}</select>`
      : c.t === "is" ? `<select class="sm-select" id="re-cv-${i}" data-re="cv" data-i="${i}" aria-label="What it is">${opts(IS_OPTS.map((k) => [k, k]), c.v)}</select>`
      : c.t === "about" ? `<select class="sm-select" id="re-cv-${i}" data-re="cv" data-i="${i}" aria-label="Topic">${opts(TOPICS.map((p) => [p, PLACES[p].name]), c.v)}</select>`
      : `<input class="sm-input" id="re-cv-${i}" data-re="cv" data-i="${i}" value="${esc(c.v)}" placeholder="${{ site: "archdaily.com, dezeen.com", tag: "#site", words: "specification" }[c.t]}" aria-label="Value">`;
    return `<div class="rt-cond"><select class="sm-select" id="re-ct-${i}" data-re="ct" data-i="${i}" aria-label="Condition">${opts(COND_TYPES.map(([v, l]) => [v, l]), c.t)}</select>${val}${AI_COND(c) ? '<span class="rt-ai rt-aitag">Loci reads it</span>' : ""}${act("Remove", `data-act="re-del" data-i="${i}"`)}</div>`;
  }
  function reCost(d) {
    const n = d.ifs.filter(AI_COND).length + d.then.understand.filter((k) => k !== "text").length + d.then.learn.filter((k) => k !== "lumen").length + (d.then.on === "best" ? 1 : 0);
    return `${n ? "Loci reads each item this rule catches: under 0.1% of your allowance each" : "A plain rule: it costs nothing"}${d.then.learn.includes("lumen") ? ". A Lumen always asks first, with its cost" : ""}.`;
  }
  function ruleEditorHTML() {
    const E = S.ruleEdit, d = E.d, isNew = E.isNew;
    const opts = (pairs, cur) => pairs.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(cur) ? " selected" : ""}>${esc(l)}</option>`).join("");
    const chk = (act2, k, l, on) => `<button type="button" class="rt-check" data-act="${act2}" data-k="${k}" aria-pressed="${on}">${esc(l)}</button>`;
    return `<div class="rt-scrim" data-act="re-close"></div><aside class="rt-sheet" role="dialog" aria-modal="true" aria-labelledby="re-h">
      <div class="rt-sheet-top"><div><span class="sm-path">Routines · When something arrives</span><h2 id="re-h">${isNew ? "New filing rule" : "Edit filing rule"}</h2></div><button class="button button-link" type="button" data-act="re-close">Close</button></div>
      <div class="rt-sheet-body">
        <div class="sm-field"><span>Say it</span><textarea class="sm-area" id="re-say" style="min-height:64px" placeholder="When I send a photo with #site from WhatsApp, file it as Site photos in the prayer hall project and describe it.">${esc(E.say || "")}</textarea>
          <div class="sm-row">${btn("Make it a rule", 'data-act="re-parse"', "quiet")}<span class="sm-note">Or try one:</span></div>
          <div class="rt-exs">${SAY_EX.map((x, i) => `<button type="button" class="rt-ex" data-act="re-ex" data-i="${i}">${esc(x)}</button>`).join("")}</div></div>
        <div class="sm-field"><span>It reads</span><p class="rt-sentence rt-preview" id="re-sent">${ruleSentence(d)}</p></div>
        <label class="sm-field"><span>When something arrives from</span><select class="sm-select" id="re-when" data-re="when">${opts(CH_OPTS, d.when)}</select></label>
        <div class="sm-field"><span>If all of these fit</span>${d.ifs.map(condRow).join("") || '<p class="sm-note">No conditions yet: it would catch everything from this channel.</p>'}<div>${act("+ Add a condition", 'data-act="re-add"')}</div></div>
        <div class="sm-field"><span>File it</span><div class="rt-grid2">
          <label class="sm-field"><small>As</small><select class="sm-select" id="re-fileAs" data-re="fileAs">${opts([["", "Keep the kind it came as"], ...FILE_AS.map(([v, ty]) => [v, `${v} (${ty})`])], d.then.fileAs)}</select></label>
          <label class="sm-field"><small>On</small><select class="sm-select" id="re-on" data-re="on">${opts([["best", "The topic it's about (Loci reads it)"], ["", "No topic"], ...TOPICS.map((p) => [p, PLACES[p].name])], d.then.on)}</select></label>
          <label class="sm-field"><small>Reading status</small><select class="sm-select" id="re-status" data-re="status">${opts([["", "Leave as it is"], ["Inbox", "Inbox"], ["To read", "To read"], ["Reading", "Reading"]], d.then.status)}</select></label>
          <label class="sm-field"><small>Also add to</small><select class="sm-select" id="re-addTo" data-re="addTo">${opts([["", "Nothing else"], ["project", `${PROJ_NAME} (project)`], ["board", `${PLACES.board.name} (board)`]], d.then.addTo)}</select></label>
        </div><small>A collection says what kind of thing it is, not which folder it's in. Where it belongs is its topic.</small></div>
        <div class="sm-field"><span>Have Loci</span><div class="rt-checks">${UNDERSTAND.map(([k, , l]) => chk("re-u", k, l, d.then.understand.includes(k))).join("")}</div></div>
        <div class="sm-field"><span>Learn from it</span><div class="rt-checks">${LEARN.map(([k, , l]) => chk("re-l", k, l, d.then.learn.includes(k))).join("")}</div></div>
        ${d.when === "whatsapp" ? `<label class="sm-field"><span>Reply on WhatsApp</span><select class="sm-select" id="re-reply" data-re="reply">${opts([["", "No reply"], ["confirm", "A short line saying where it went"], ["lumen", "The Lumen's link, once you've said yes"]], d.then.reply)}</select></label>` : ""}
        <div class="sm-field"><span>Before it files</span><div class="rt-radio">
          <button type="button" data-act="re-mode" data-val="ask" aria-pressed="${d.mode === "ask" || d.always}"><b>Ask me first</b><span>It suggests; you file with one tap. New rules start here.</span></button>
          <button type="button" data-act="re-mode" data-val="own" aria-pressed="${d.mode === "own" && !d.always}"${d.always ? " disabled" : ""}><b>File on its own</b><span>${d.always ? "Not for a rule that makes a Lumen: that always asks, with its cost." : "Each item still says which rule filed it, with Undo."}</span></button></div>
          <small>After a rule has been right 9 times in 10, Loci offers to let it file on its own.</small></div>
        <div class="sm-field"><span>Try it</span><div>${btn("Try it on your last 20 arrivals", 'data-act="re-try"', "quiet")}</div>${E.tried ? `<div class="rt-tryres">${tryList(d)}</div>` : ""}</div>
        <label class="sm-field"><span>Name</span><input class="sm-input" id="re-name" data-re="name" value="${esc(d.name)}" placeholder="${esc(autoName(d))}" maxlength="50"></label>
        ${isNew ? "" : `<div>${btn("Delete rule", 'data-act="re-delete"', "quiet")}</div>`}
      </div>
      <div class="rt-sheet-foot"><span class="rt-est" id="re-est">${reCost(d)}</span>${btn("Cancel", 'data-act="re-close"', "quiet")}${btn(isNew ? "Create rule" : "Save", 'data-act="re-save"')}</div>
    </aside>`;
  }
  function reInput(tg, isChange) {
    const d = S.ruleEdit.d, k = tg.dataset.re, i = Number(tg.dataset.i);
    if (k === "name") { d.name = tg.value; return; }
    if (k === "when") d.when = tg.value;
    else if (k === "ct") { d.ifs[i].t = tg.value; d.ifs[i].v = { kind: "photo", is: "a book", about: "climate" }[tg.value] || ""; }
    else if (k === "cv") d.ifs[i].v = tg.value;
    else d.then[k] = tg.value;
    if (k === "when" && d.when !== "whatsapp") d.then.reply = "";
    S.ruleEdit.tried = false;
    if (isChange && (k === "ct" || k === "when")) { render(); return; }
    const sent = $("#re-sent", root); if (sent) sent.innerHTML = ruleSentence(d);
    const est = $("#re-est", root); if (est) est.textContent = reCost(d);
    $(".rt-sheet .rt-tryres", root)?.remove();
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
    else if (S.view === "inbox") {
      shell("library");
      $$(`.navigation-rail .navigation-link[href="/library"], .tab-bar .tab-bar-link[href="/library"]`, root).forEach((a) => a.setAttribute("aria-current", "page"));
      $("main", root).innerHTML = inboxView();
    }
    else {
      shell("library");
      $$(`.navigation-rail .navigation-link[href="/today"], .tab-bar .tab-bar-link[href="/today"]`, root).forEach((a) => a.setAttribute("aria-current", "page"));
      $("main", root).innerHTML = `<div class="rt-page">${header()}${S.tab === "runs" ? runsTab() : routinesTab()}</div>`;
    }
    if (S.edit) { root.insertAdjacentHTML("beforeend", editorHTML()); const sb = $(".rt-sheet-body", root); if (sb) sb.scrollTop = sheetScroll; }
    else if (S.ruleEdit) { root.insertAdjacentHTML("beforeend", ruleEditorHTML()); const sb = $(".rt-sheet-body", root); if (sb) sb.scrollTop = sheetScroll; }
    const chat = $("#rt-chat", root); if (chat) chat.scrollTop = chat.scrollHeight;
    const cur = S.view === "routines" ? S.tab : S.view;
    root.insertAdjacentHTML("beforeend", `<div class="sm-proto" role="group" aria-label="Prototype views"><span>Prototype</span>${[["today", "Today"], ["routines", "Routines"], ["inbox", "Inbox"], ["runs", "Runs"], ["loci", "In Loci"]].map(([k, l]) => `<button type="button" data-go="${k}" aria-pressed="${cur === k}">${l}</button>`).join("")}<i class="sm-proto-sep" aria-hidden="true"></i><button type="button" data-act="builder" aria-pressed="${S.builder}" title="How each run worked: steps, models, tokens">Builder</button></div>`);
    if (toastMsg) root.insertAdjacentHTML("beforeend", `<div class="sm-toast" role="status"><span>${esc(toastMsg.t)}</span>${toastMsg.undo ? '<button type="button" data-act="toast-undo">Undo</button>' : ""}</div>`);
    window.scrollTo(0, scroll);
    if (active) { const el = document.getElementById(active); if (el) { el.focus({ preventScroll: true }); if (el.setSelectionRange && typeof el.value === "string" && el.type !== "time" && el.tagName !== "SELECT") try { el.setSelectionRange(el.value.length, el.value.length); } catch { /* not text */ } } }
  }
  let toastMsg = null, toastTimer = 0, undoFn = null;
  function toast(tx, undo) { undoFn = undo || null; toastMsg = { t: tx, undo: !!undo }; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toastMsg = null; undoFn = null; $(".sm-toast", root)?.remove(); }, 5200); }
  function go(where) {
    if (where === "routines" || where === "runs") { S.view = "routines"; S.tab = where; } else S.view = where;
    try { history.replaceState(null, "", "#" + where); } catch { /* sandboxed */ }
    window.scrollTo(0, 0); render();
  }

  /* ================================================================ actions */
  function openRun(id) { S.sel = id; S.filter = null; go("runs"); }
  function startRun(r) {
    if (S.running) return;
    S.running = { rid: r.id, step: 0 }; render();
    const n = HOOD[r.kind].steps.length;
    const tick = setInterval(() => {
      S.running.step++;
      if (S.running.step >= n) {
        clearInterval(tick);
        const u = makeRun(r);
        S.running = null; S.runs.push(u);
        toast(u.status === "skipped" ? `${r.name}: nothing new, so nothing used.` : `${r.name} is ready: ${status(u)[1].toLowerCase()}.`);
        openRun(u.id); return;
      }
      if (S.view === "routines" && S.tab === "routines") { const c = $(`#card-${r.id}`, root); if (c) c.outerHTML = card(r); }
    }, 700);
  }
  function makeRun(r) {
    const when = new Date(NOW); when.setMinutes(NOW.getMinutes() + 1 + S.runs.filter((x) => x.how === "now").length);
    const base = { id: "u" + ++runId, rid: r.id, at: when, how: "now", status: "", took: "34 s", cost: costRun(r) };
    const skip = (why) => ({ ...base, status: "skipped", cost: 0, took: "1 s", out: { kind: "skip", why } });
    if (r.kind === "reading") {
      const pool = BOOKS[r.place] || BOOKS.climate;
      const used = new Set(S.runs.filter((x) => x.out.kind === "reading" && R(x.rid)?.place === r.place).flatMap((x) => x.out.items.map((b) => b.id)));
      const fresh = pool.filter((b) => !used.has(b.id)).slice(0, 3);
      return fresh.length ? { ...base, out: { kind: "reading", items: fresh.map((b) => ({ ...b, st: r.may === "save" ? "saved" : null })) } } : skip(`Nothing on ${placeName(r)} that you don't already have or haven't dismissed. No allowance used.`);
    }
    if (r.kind === "watch") {
      const last = lastRun(r);
      if (last && last.out.kind === "watch" && last.out.items.some((x) => !x.st)) return skip("Nothing new came in since this morning's run. No allowance used.");
      return { ...base, took: "49 s", out: { kind: "watch", items: ARRIVALS.slice(0, 3).map((x) => ({ ...x, st: null })) } };
    }
    if (r.kind === "questions") return { ...base, out: { kind: "questions", items: QUESTIONS.map((x) => ({ ...x, st: null })) } };
    if (r.kind === "week") return { ...base, out: { kind: "week", ...WEEK, st: null } };
    if (r.kind === "tidy") {
      const loose = ARR.filter((x) => x.state === "unsorted" || x.state === "undone");
      const suggest = loose.filter((x) => x.about).map((x) => ({ t: x.title, k: cap(x.kind), sug: x.about, st: null }));
      const left = loose.filter((x) => !x.about).map((x) => ({ t: x.title, k: cap(x.kind) }));
      if (!suggest.length) suggest.push({ t: "Screenshot: a section through a malqaf", k: "Photo", sug: "climate", st: null });
      return { ...base, took: "5 s", out: { kind: "tidy", rules: [], suggest, left } };
    }
    if (r.kind === "pile") return { ...base, took: "2 s", cost: 0, out: { kind: "pile", items: PILE.slice(0, 2).map((x) => ({ ...x })) } };
    if (r.kind === "alive") return { ...base, took: "3 min", cost: 0, out: { kind: "alive", items: ALIVE.slice(1, 2).map((x) => ({ ...x })) } };
    if (r.kind === "brief") return { ...base, took: "1 min 9 s", out: { kind: "brief", chapters: BRIEF, heard: false } };
    if (r.kind === "review") return { ...base, out: { kind: "review", items: (REVIEW[r.place] || REVIEW.precast).map((x) => ({ ...x })) } };
    if (r.kind === "digest") return { ...base, out: { kind: "digest", items: DIGEST.map((d) => ({ ...d })) } };
    return { ...base, out: { kind: "project" } };
  }
  const FB = {
    basic: (r) => (r.kind === "review" ? "Ask harder questions; skip the definitions" : "Pitch it one step deeper than my card says"),
    long: (r) => (r.kind === "brief" ? "Keep it under four minutes" : r.kind === "watch" ? "Three arrivals are enough" : "Two items are enough"),
    work: () => "Tie every item to the prayer hall in Dubai",
  };
  let playTimer = 0;
  const tally = (u, k, n = 1) => { const r = R(u.rid); if (r) r.tally[k] = Math.max(0, (r.tally[k] || 0) + n); };

  root.addEventListener("click", (ev) => {
    const tg = ev.target.closest("[data-act], [data-tab], [data-go], a[href], .theme-toggle, .rail-toggle");
    if (!tg || !root.contains(tg)) return;
    if (tg.matches("[data-go]")) { S.edit = null; S.ruleEdit = null; if (tg.dataset.go !== "inbox") S.inboxFilter = null; go(tg.dataset.go); return; }
    if (tg.matches("[data-tab]")) { ev.preventDefault(); if (tg.dataset.tab === "runs") S.filter = null; go(tg.dataset.tab); return; }
    if (tg.matches(".theme-toggle")) { const dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches); document.documentElement.dataset.theme = dark ? "light" : "dark"; render(); return; }
    if (tg.matches(".rail-toggle")) { const sh = $(".app-shell", root); sh.dataset.rail = sh.dataset.rail === "open" ? "closed" : "open"; return; }
    if (tg.matches("a[href]") && !tg.dataset.act) {
      ev.preventDefault();
      const href = tg.getAttribute("href");
      if (href === "/today") go("today"); else if (href === "/graph") go("loci"); else if (href === "/library") go("inbox"); else if (href === "#routines" || href === "#runs") go(href.slice(1)); else toast("Only Today, Routines and Loci are in this prototype.");
      return;
    }
    const a = tg.dataset.act, id = tg.dataset.id;
    const u = tg.dataset.u ? S.runs.find((x) => x.id === tg.dataset.u) : null, i = Number(tg.dataset.i);
    switch (a) {
      case "builder": S.builder = !S.builder; if (S.builder && S.view !== "inbox" && !(S.view === "routines" && S.tab === "runs")) { go("runs"); return; } break;
      case "toggle": { const r = R(id); r.on = !r.on; if (r.on) r.paused = null; toast(r.on ? `${r.name} is on. Next run ${fWhen(nextRun(r))}.` : `${r.name} is paused. It won't run until you turn it back on.`); break; }
      case "runnow": { const r = R(id); if (!r.on) toast(`${r.name} is paused, but Run now still runs it once.`); startRun(r); return; }
      case "runsof": S.filter = id; S.sel = lastRun(R(id))?.id; go("runs"); return;
      case "unfilter": S.filter = null; break;
      case "sel": S.sel = id; S.refineOpen = null; S.dismissing = null; break;
      case "openrun": ev.preventDefault(); openRun(tg.dataset.u); return;
      case "new": { const kind = tg.dataset.kind || "questions"; S.edit = { isNew: true, d: mk(kind, { id: null, place: tg.dataset.place || KINDS[kind].place }) }; rid--; break; }
      case "edit": S.edit = { isNew: false, d: draftOf(R(id)) }; break;
      case "ed-close": S.edit = null; break;
      case "ed-may": S.edit.d.may = tg.dataset.val; break;
      case "ed-skip": S.edit.d.skip = !S.edit.d.skip; break;
      case "ed-guide-del": S.edit.d.guides.splice(i, 1); break;
      case "ed-src-del": S.edit.d.sources.splice(i, 1); break;
      case "ed-src-add": { const v = ($("#ed-src", root)?.value || "").trim(); if (v) S.edit.d.sources.push(v.slice(0, 60)); break; }
      case "ed-save": {
        const d = S.edit.d;
        if (!d.name.trim()) { toast("Give it a name."); render(); return; }
        if (d.kind === "watch" && !d.sources.length) { toast("Add at least one source for it to read."); render(); return; }
        if (S.edit.isNew) { d.id = "r" + ++rid; S.routines.push(d); toast(`Created. ${d.name} first runs ${fWhen(nextRun(d))}.`); }
        else { const k = S.routines.findIndex((r) => r.id === d.id); S.routines[k] = d; toast(`Saved. Next run ${d.on ? fWhen(nextRun(d)) : "when you turn it on"}.`); }
        S.flash = d.id; S.edit = null; S.view = "routines"; S.tab = "routines";
        render(); $(`#card-${d.id}`, root)?.scrollIntoView({ block: "center", behavior: "smooth" }); setTimeout(() => { S.flash = null; $(`#card-${d.id}`, root)?.removeAttribute("data-flash"); }, 1800);
        return;
      }
      case "ed-del": { const r = R(id), k = S.routines.indexOf(r); S.routines.splice(k, 1); S.edit = null; S.view = "routines"; S.tab = "routines"; toast(`Deleted ${r.name}. Its runs stay in Runs.`, () => S.routines.splice(k, 0, r)); break; }
      case "save": { const b = u.out.items[i]; b.st = "saved"; tally(u, "kept"); toast(`Kept “${b.t}” in Commonplace, on ${topicLabel(b.topic || R(u.rid).place)}.`, () => { b.st = null; tally(u, "kept", -1); }); break; }
      case "keepall": { const xs = u.out.items.filter((x) => !x.st); xs.forEach((x) => { x.st = "saved"; }); tally(u, "kept", xs.length); toast(`Kept ${xs.length}, each on its topic.`, () => { xs.forEach((x) => { x.st = null; }); tally(u, "kept", -xs.length); }); break; }
      case "dis-open": S.dismissing = { u: u.id, i }; break;
      case "dis-cancel": S.dismissing = null; break;
      case "dismiss": { const b = u.out.items[i]; b.st = "dismissed"; b.dis = tg.dataset.val; S.dismissing = null; tally(u, "dismissed"); toast("Dismissed. Loci takes the reason into account next time.", () => { b.st = null; b.dis = null; tally(u, "dismissed", -1); }); break; }
      case "q-make": { const x = u.out.items[i]; x.st = "made"; tally(u, "made"); toast(`Making “${x.lumen.title}” from your saves.`); break; }
      case "q-later": u.out.items[i].st = "later"; break;
      case "q-find": u.out.items[i].st = "find"; toast("Added to Monday's reading list as a question to find readings for."); break;
      case "q-ans": u.out.items[i].st = "answered"; tally(u, "answered"); break;
      case "w-make": u.out.st = "made"; tally(u, "made"); toast(`Making “${u.out.lumen.title}”. It'll be in Learn shortly.`); break;
      case "w-skip": u.out.st = "skip"; break;
      case "t-ok": { const x = u.out.suggest[i], v = $(`#tidy-${u.id}-${i}`, root)?.value; if (v) x.sug = v; x.st = "placed"; tally(u, "placed"); break; }
      case "t-all": { const xs = u.out.suggest.filter((x) => !x.st); xs.forEach((x) => { x.st = "placed"; }); tally(u, "placed", xs.length); toast(`Placed ${xs.length}, each on its topic.`, () => { xs.forEach((x) => { x.st = null; }); tally(u, "placed", -xs.length); }); break; }
      case "t-left": { const x = u.out.left[i]; x.st = tg.dataset.val; if (x.st === "letgo") tally(u, "letgo"); break; }
      case "p-act": { const x = u.out.items[i]; x.st = tg.dataset.val; if (x.st === "letgo") tally(u, "letgo"); if (x.st === "keep") tally(u, "kept"); if (x.st === "week") toast("Added as a 20-minute session on Thursday. Move it on Today."); break; }
      case "al-open": toast("In the app, this opens the copy saved when you captured it."); return;
      case "reveal": u.out.items[i].shown = true; break;
      case "mark": { u.out.items[i].mark = tg.dataset.val; if (tg.dataset.val === "got") tally(u, "answered"); else toast(`Kept in To revisit on ${placeName(R(u.rid))}.`); break; }
      case "play": {
        if (S.play && S.play.u === u.id && S.play.on) { S.play.on = false; clearInterval(playTimer); break; }
        if (!S.play || S.play.u !== u.id) S.play = { u: u.id, t: 0, on: true }; else S.play.on = true;
        if (S.play.t >= 100) S.play.t = 0;
        clearInterval(playTimer);
        playTimer = setInterval(() => { if (!S.play?.on) return clearInterval(playTimer); S.play.t = Math.min(100, S.play.t + 2); if (S.play.t >= 100) { S.play.on = false; u.out.heard = true; clearInterval(playTimer); toast("Brief finished. Its question comes back in Friday's review."); } if (S.view === "routines" && S.tab === "runs") render(); }, 400);
        break;
      }
      case "fb": {
        const r = R(u.rid), k = tg.dataset.val;
        if (k === "ok") { u.fb = "ok"; break; }
        const g = { t: FB[k](r), from: fDay(u.at), how: "you tapped " + tg.textContent };
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
      case "r-new": S.ruleEdit = { isNew: true, d: blankRule(), say: "" }; break;
      case "r-edit": S.ruleEdit = { isNew: false, d: JSON.parse(JSON.stringify(FR(id))), say: "" }; break;
      case "r-toggle": { const f = FR(id); f.on = !f.on; toast(f.on ? `“${f.name}” is on again.` : `“${f.name}” is paused. Things it would have filed go on to the next rule.`); break; }
      case "r-trust": { const f = FR(id); f.mode = "own"; toast(`“${f.name}” files on its own now. Every item still says it filed it, with Undo.`, () => { f.mode = "ask"; }); break; }
      case "r-try": S.tryRule = S.tryRule === id ? null : id; break;
      case "r-did": S.inboxFilter = id; S.feedTab = "all"; go("inbox"); return;
      case "r-up": case "r-down": { const k = RULES.findIndex((f) => f.id === id), j = a === "r-up" ? k - 1 : k + 1; if (j >= 0 && j < RULES.length) { [RULES[k], RULES[j]] = [RULES[j], RULES[k]]; S.flash = id; } break; }
      case "sugg-yes": { const sg = SUGG.find((x) => x.id === id); const fidNew = sg.apply(); S.suggDone.add(id); S.flash = fidNew; toast(sg.done); break; }
      case "sugg-no": S.suggDone.add(id); toast("Fine. Loci won't suggest it again unless you keep doing it."); break;
      case "catchall": S.catchall = S.catchall === "ask" ? "leave" : "ask"; break;
      case "ev-toggle": { const e = EVENTS.find((x) => x.id === id); e.on = !e.on; break; }
      case "send": send(id); return;
      case "inbox-reset": S.sent.clear(); S.chat = []; for (let k = ARR.length - 1; k >= 0; k--) if (ARR[k].live) ARR.splice(k, 1); break;
      case "feed": S.feedTab = tg.dataset.val; break;
      case "inbox-unfilter": S.inboxFilter = null; break;
      case "a-file": { const x = AR(tg.dataset.a), f = FR(x.rule), v = $(`#ap-${x.aid}`, root)?.value; const changed = v && v !== x.about; if (v) x.placed = v; x.state = "filed"; x.by = f ? f.name : "you"; if (f) { f.right[1]++; if (!changed) f.right[0]++; f.filed++; } toast(changed ? "Filed where you chose. The rule learns from the change." : "Filed."); break; }
      case "a-leave": { const x = AR(tg.dataset.a), f = FR(x.rule); x.state = "unsorted"; if (f) f.right[1]++; break; }
      case "a-undo": { const x = AR(tg.dataset.a), f = FR(x.rule); x.state = "undone"; if (f) f.undone++; toast("Undone. It's back in Unsorted, and the rule counts it as a miss."); break; }
      case "a-why": { const x = AR(tg.dataset.a); x.why = !x.why; break; }
      case "a-rule": { const x = AR(tg.dataset.a); S.ruleEdit = { isNew: true, d: ruleFromItem(x), say: "", from: x.aid }; break; }
      case "wa-yes": case "wa-no": waAnswer(tg.dataset.a, a === "wa-yes"); return;
      case "re-close": S.ruleEdit = null; break;
      case "re-parse": { const t = ($("#re-say", root)?.value || "").trim(); if (!t) { toast("Say what should happen, in a sentence."); return; } const d = sayParse(t); d.id = S.ruleEdit.d.id; S.ruleEdit.d = d; S.ruleEdit.say = t; S.ruleEdit.tried = false; toast("Here's the rule. Check it below, then Create."); break; }
      case "re-ex": { const t = SAY_EX[i]; const d = sayParse(t); d.id = S.ruleEdit.d.id; S.ruleEdit.d = d; S.ruleEdit.say = t; S.ruleEdit.tried = false; break; }
      case "re-add": S.ruleEdit.d.ifs.push({ t: "tag", v: "" }); break;
      case "re-del": S.ruleEdit.d.ifs.splice(i, 1); break;
      case "re-u": case "re-l": { const key = a === "re-u" ? "understand" : "learn", arr = S.ruleEdit.d.then[key], k = tg.dataset.k; const at2 = arr.indexOf(k); if (at2 >= 0) arr.splice(at2, 1); else arr.push(k); break; }
      case "re-mode": S.ruleEdit.d.mode = tg.dataset.val; break;
      case "re-try": S.ruleEdit.tried = true; break;
      case "re-save": {
        const d = S.ruleEdit.d;
        if (!d.ifs.length && d.when === "any") { toast("Add a condition or a channel, or it would catch everything you send."); render(); return; }
        if (!d.name.trim()) d.name = autoName(d);
        if (S.ruleEdit.isNew) { d.id = "f" + ++fid; RULES.unshift(d); toast(`Created “${d.name}”. It's first in the list, so it gets the first look; move it if another rule should come first.`); }
        else { const k = RULES.findIndex((f) => f.id === d.id); RULES[k] = d; toast(`Saved “${d.name}”.`); }
        const from = S.ruleEdit.from; S.ruleEdit = null; S.flash = d.id;
        if (from) { const x = AR(from); if (x && matches(d, x) && ["unsorted", "undone", "suggest"].includes(x.state)) { x.state = d.mode === "own" ? "filed" : "waiting"; x.rule = d.id; x.by = d.name; if (d.mode === "own") d.filed++; } render(); return; }
        S.view = "routines"; S.tab = "routines"; render(); $(`#rule-${d.id}`, root)?.scrollIntoView({ block: "center" }); setTimeout(() => { S.flash = null; $(`#rule-${d.id}`, root)?.removeAttribute("data-flash"); }, 1800); return;
      }
      case "re-delete": { const k = RULES.findIndex((f) => f.id === S.ruleEdit.d.id), f = RULES[k]; RULES.splice(k, 1); S.ruleEdit = null; toast(`Deleted “${f.name}”. What it filed stays where it is.`, () => RULES.splice(k, 0, f)); break; }
      case "learnfor": toast("In the app, this makes a Lumen for the project (Work, W3)."); return;
      case "toast-undo": if (undoFn) undoFn(); undoFn = null; toastMsg = null; break;
      default: return;
    }
    render();
  });
  root.addEventListener("input", (ev) => {
    const tg = ev.target;
    if (S.ruleEdit && tg.dataset?.re) { reInput(tg, false); return; }
    if (!S.edit || !tg.dataset?.ed) return;
    const d = S.edit.d, k = tg.dataset.ed;
    d[k] = tg.value;
    if (k === "words" || k === "name") return;
    const est = $("#ed-est", root), nx = $("#ed-next", root), mc = costMonth(d);
    if (nx) nx.textContent = `Next run: ${fWhen(nextRun(d))}. ${PLACES[d.place].path}: ${PLACES[d.place].has}.`;
    if (est) { est.toggleAttribute("data-warn", mc > 10); est.innerHTML = `About <b>${pct(costRun(d))}</b> a run, <b>${pct(mc)}</b> a month of your allowance`; }
  });
  root.addEventListener("change", (ev) => { const tg = ev.target; if (S.ruleEdit && tg.dataset?.re && tg.tagName === "SELECT") reInput(tg, true); });
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && (S.edit || S.ruleEdit)) { S.edit = null; S.ruleEdit = null; render(); } });

  const start = (location.hash || "").slice(1);
  if (["today", "routines", "inbox", "runs", "loci"].includes(start)) go(start); else render();
})();
