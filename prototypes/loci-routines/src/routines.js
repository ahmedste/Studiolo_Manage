/* Loci routines (prototype, version 2).
   - A routine is a standing instruction to Loci, written as one sentence: when, which place on the map, what to do,
     where to bring it. It works between sessions and keeps the learning loop turning.
   - Four jobs, one per part of the loop: Bring in (Save), Make sense (Save → Learn), Bring back (remember),
     Bring forward (Learn → Work). The Routines page is grouped by them.
   - Runs bring back typed cards that end in a learning action (Keep, Make this Lumen, Got it, Use in project).
     A routine only suggests: nothing is saved, made or marked until the learner says so.
   - A card shows what came of a routine (kept, Lumens made, answered), its last eight runs, and its place on Loci.
   - Builder (prototype bar) shows how each run worked: the steps, which ran on rules and which on a model, tokens.
     Learners never see that view, as in the learner memory design.
   The shell, Today and Loci screens are the app's own DOM and CSS, captured read-only from studiolo's
   /dev/specimens (see ../live-lumens/capture/capture.cjs). Spec: docs/superpowers/specs/2026-10-25-loci-routines-design.md */
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
    unsorted: { name: "Unsorted", path: "Commonplace › Unsorted", st: null, has: "11 entries with no place yet", card: "No place on Loci yet" },
  };
  const PLACE_ORDER = [["Your map", ["you", "climate", "islamic", "daylight", "precast"]], ["Boards", ["board"]], ["Work", ["project"]], ["Commonplace", ["unsorted"]]];

  /* ================================================================ the four jobs, and the kinds of routine */
  const JOBS = [
    { k: "in", name: "Bring in", step: "Save", line: "New material for Commonplace, from sources you trust, already sorted onto your map." },
    { k: "sense", name: "Make sense", step: "Save → Learn", line: "Turn what you've saved and what you've asked into Lumens." },
    { k: "back", name: "Bring back", step: "Remember", line: "Bring back what's slipping, before it's gone." },
    { k: "forward", name: "Bring forward", step: "Learn → Work", line: "Point what you know at what's next: today, a board, a project." },
  ];
  // each kind: its job, the verb phrase of its sentence (p = the place's name), cost per run (% of the monthly allowance)
  const KINDS = {
    watch: { job: "in", name: "Watch sources", blurb: "News, papers and talks from sources you pick, sorted onto your topics", cost: 0.3, place: "you", every: "day", time: "07:30", to: "today",
      say: (p, r) => `read my ${plural(r.sources.length, "source")}, keep what fits ${p}, and sort it onto topics` },
    reading: { job: "in", name: "Reading list", blurb: "Real books and articles you don't have yet, checked in a catalogue", cost: 0.4, place: "climate", every: "w1", time: "07:00", to: "today+email",
      say: (p) => `look through ${p} for books and articles I don't have` },
    questions: { job: "sense", name: "Questions and goals", blurb: "Your open questions and goals at a place, each matched to a Lumen, a reading or an answer you already have", cost: 0.35, place: "climate", every: "w0", time: "18:00", to: "today",
      say: (p) => `go through my open questions and goals at ${p} and suggest a Lumen for each one my saves can answer` },
    week: { job: "sense", name: "Lumen of the week", blurb: "One short Lumen from what you saved this week, so saving turns into learning", cost: 0.25, place: "you", every: "w5", time: "16:00", to: "today",
      say: (p) => `gather what I saved this week across ${p} and outline one Lumen from it` },
    tidy: { job: "sense", name: "Sort Unsorted", blurb: "A topic for each thing that has no place on your map yet", cost: 0.05, place: "unsorted", every: "w0", time: "19:00", to: "today",
      say: (p) => `suggest a topic for each thing in ${p}` },
    review: { job: "back", name: "Review", blurb: "A few questions on what slipped this week, and one from longer ago", cost: 0.1, place: "precast", every: "w5", time: "17:00", to: "today",
      say: (p) => `ask me about what slipped at ${p} this week, and one thing from longer ago` },
    brief: { job: "forward", name: "Daily brief", blurb: "Five minutes of audio for the commute: your step, your saves, one question", cost: 0.6, place: "you", every: "weekdays", time: "06:45", to: "today+audio",
      say: (p) => `make five minutes of audio from ${p}: today's step, yesterday's saves and one question` },
    digest: { job: "forward", name: "Board digest", blurb: "A board's open questions, and what on it already helps answer them", cost: 0.2, place: "board", every: "w4", time: "18:00", to: "today",
      say: (p) => `list the open questions on “${p}” and what on it already helps` },
    project: { job: "forward", name: "Project update", blurb: "What moved on a piece of work: decisions, open questions, gaps to learn", cost: 0.25, place: "project", every: "w5", time: "16:00", to: "today+email",
      say: (p) => `sum up the week on ${p}: decisions, open questions and gaps to learn` },
  };
  const EVERY = [["day", "Every day"], ["weekdays", "Weekdays"], ...[1, 2, 3, 4, 5, 6, 0].map((d) => ["w" + d, "Every " + DAYLONG[d]])];
  const TO = [["today", "Today"], ["today+email", "Today and email"], ["today+audio", "Today, as audio"], ["email", "email"]];
  const runsMonth = (e) => (e === "day" ? 30 : e === "weekdays" ? 22 : 4.3);

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

  /* ================================================================ how a run works (Builder): steps per kind, and what ran each */
  const HOOD = {
    watch: { steps: [["Starts", "The schedule fires for this account (07:30, Asia/Dubai).", "job"], ["Gathers", "Reads 4 sources: 38 new items since yesterday's run.", "rules"], ["Filters", "Drops 21 already seen, 6 duplicates and 4 like ones you dismissed. 7 left.", "rules"], ["Judges and sorts", "One call: is each item relevant to your map and level, and which topic is it most about? Keeps 5.", "small model"], ["Writes", "One line each on why it matters to you, from what Loci knows at that topic.", "same call"], ["Checks", "Every link opens, every title matches its page, every topic exists.", "rules"], ["Delivers", "Today, as arrivals. Nothing is saved until you keep it.", "job"]], tokens: [18400, 12100, 940] },
    reading: { steps: [["Starts", "The schedule fires (Mondays 07:00).", "job"], ["Gathers", "Reads what Loci knows at the topic, its 14 saves and everything this routine suggested before.", "rules"], ["Asks", "One call: suggest 6 titles that fit the instructions, the level and what's missing.", "model"], ["Checks", "Looks each title up in Open Library. Drops any it can't find, any you have, any you dismissed. 3 left.", "rules"], ["Writes", "The reason for each, in your words where it can.", "same call"], ["Delivers", "Today and email.", "job"]], tokens: [9800, 7200, 1300] },
    questions: { steps: [["Starts", "The schedule fires (Sundays 18:00).", "job"], ["Gathers", "Your open questions and goals at the topic and under it: 3 questions, 1 goal. Your 14 saves and 3 Lumens.", "rules"], ["Matches", "Searches your own Lumens and saves for each question. One looks answered already.", "search"], ["Judges", "One call: can your saves carry a Lumen for each open question? If so, a four-slide outline citing them. If not, what's missing.", "model"], ["Checks", "Every save it cites exists and is yours.", "rules"], ["Delivers", "Today. A Lumen is made only when you press Make.", "job"]], tokens: [14200, 9000, 1600] },
    week: { steps: [["Starts", "The schedule fires (Fridays 16:00).", "job"], ["Gathers", "What you saved since last Friday: 5 entries on 3 topics.", "rules"], ["Outlines", "One call: one short Lumen from the saves that belong together, with what each slide draws on.", "model"], ["Checks", "Every slide cites at least one of your saves.", "rules"], ["Delivers", "Today. Make writes and voices the Lumen as usual.", "job"]], tokens: [6900, 4100, 800] },
    tidy: { steps: [["Starts", "The schedule fires (Sundays 19:00).", "job"], ["Gathers", "4 entries in Unsorted, and the names of your topics.", "rules"], ["Sorts", "One call to the small model: the best topic for each, or none.", "small model"], ["Delivers", "Today. Each one moves only when you place it.", "job"]], tokens: [2100, 1500, 200] },
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
  const S = { view: "routines", tab: "routines", routines: ROUTINES, runs: [], sel: null, filter: null, edit: null, running: null, refineOpen: null, dismissing: null, play: null, builder: false };
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
    S.runs.forEach((u) => { u.cost = u.status === "skipped" ? 0 : costRun(R(u.rid)); });
    S.sel = S.runs[S.runs.length - 1].id;
  }

  /* ================================================================ schedule and cost */
  function nextRun(r, from = NOW) {
    const [h, m] = r.time.split(":").map(Number);
    for (let i = 0; i < 9; i++) {
      const d = new Date(from); d.setDate(d.getDate() + i); d.setHours(h, m, 0, 0);
      const wd = d.getDay();
      const ok = r.every === "day" || (r.every === "weekdays" && wd >= 1 && wd <= 5) || r.every === "w" + wd;
      if (ok && d > from) return d;
    }
    return from;
  }
  const hm = (s) => { const [h, m] = s.split(":").map(Number); return `${h}:${String(m).padStart(2, "0")}`; };
  const whenText = (r) => r.every === "day" ? `Every day at ${hm(r.time)}` : r.every === "weekdays" ? `Weekdays at ${hm(r.time)}` : `Every ${DAYLONG[Number(r.every.slice(1))]} at ${hm(r.time)}`;
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
    if (o.kind === "tidy") { const n = open(o.items, (x) => !x.st); return n ? ["waiting", `${n} to place`] : ["done", "Done"]; }
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
    const x = r.tally, bits = [x.kept && `${x.kept} kept`, x.made && plural(x.made, "Lumen") + " made", x.answered && `${x.answered} answered`, x.dismissed && `${x.dismissed} dismissed`].filter(Boolean);
    return bits.length ? bits.join(" · ") : r.kind === "brief" ? "6 of the last 7 heard" : "Nothing yet";
  }
  function card(r) {
    const nx = nextRun(r), running = S.running && S.running.rid === r.id, lr = lastRun(r);
    const [sk, sl] = lr ? status(lr) : [null, null];
    return `<article class="rt-card" id="card-${r.id}"${r.on ? "" : " data-off"}${S.flash === r.id ? " data-flash" : ""}>
      <div class="rt-top"><span class="rt-k">${esc(KINDS[r.kind].name)}</span><span class="rt-next">${r.on ? `Next ${esc(fWhen(nx))}` : "Paused"}</span></div>
      <h3 class="rt-name">${esc(r.name)}</h3>
      <p class="rt-say">${sentence(r)}</p>
      ${r.words ? `<p class="rt-words">“${esc(r.words)}”</p>` : ""}
      ${r.guides.length ? `<ul class="rt-guides">${r.guides.map((g) => `<li>${esc(g.t)} <i>· from the run on ${esc(g.from)}</i></li>`).join("")}</ul>` : ""}
      ${r.paused && !r.on ? `<p class="rt-paused">${esc(r.paused)}</p>` : ""}
      ${running ? stepsHTML(r) : `<div class="rt-came">${rhythm(r)}<span>${esc(cameOf(r))}</span></div>`}
      ${lr && sk === "waiting" && !running ? `<button type="button" class="rt-waiting" data-act="openrun" data-u="${lr.id}"><b>${esc(sl)}</b><span>from ${esc(fWhen(lr.at))}</span><em aria-hidden="true">›</em></button>` : ""}
      <div class="rt-foot"><span class="rt-place">${dotFor(r.place)}<span>${esc(PLACES[r.place].path)}</span></span><span class="rt-cost">about ${pct(costRun(r))} a run</span></div>
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
    const items = [...all("reading"), ...all("watch")];
    const kept = items.filter((x) => x.st === "saved").length;
    const made = wk.filter((u) => u.out.kind === "week" && u.out.st === "made").length + all("questions").filter((x) => x.st === "made").length;
    const answered = all("review").filter((x) => x.mark === "got").length + all("questions").filter((x) => x.st === "answered").length;
    const did = [kept && `kept <em>${kept}</em>`, made && `made <em>${plural(made, "Lumen")}</em>`, answered && `answered <em>${plural(answered, "question")}</em>`].filter(Boolean);
    const list = did.length > 1 ? did.slice(0, -1).join(", ") + " and " + did[did.length - 1] : did[0];
    return `This week your routines brought in <em>${plural(items.length, "thing")}</em>. ${list ? "You " + list + "." : "Nothing is kept yet."}`;
  }
  function routinesTab() {
    const on = S.routines.filter((r) => r.on), month = on.reduce((a, r) => a + costMonth(r), 0);
    return `<div class="rt-body">
      <div class="rt-intro"><div><h1 class="sm-h1">Routines</h1><p class="sm-lead">Loci keeps your learning moving between sessions. Each routine works at one place on your map and brings back things for you to keep, make or answer. It never changes your map or your memory.</p></div>
        <div class="rt-intro-side">${btn("New routine", 'data-act="new"')}<span class="sm-note">${on.length} on · about ${pct(month)} of your monthly allowance</span></div></div>
      <div class="rt-week"><p>${weekLine()}</p></div>
      ${JOBS.map((j) => { const rs = S.routines.filter((r) => KINDS[r.kind].job === j.k), kinds = Object.entries(KINDS).filter(([, K]) => K.job === j.k);
        return `<section class="rt-job" aria-labelledby="job-${j.k}"><div class="rt-job-h"><h2 id="job-${j.k}">${j.name}</h2><span class="rt-loop">${esc(j.step)}</span><p>${esc(j.line)}</p></div>
          <div class="rt-cards">${rs.map(card).join("")}<div class="rt-tpls">${kinds.map(([k, K]) => `<button type="button" class="rt-tpl" data-act="new" data-kind="${k}"><b>+ ${esc(K.name)}</b><span>${esc(K.blurb)}</span></button>`).join("")}</div></div></section>`; }).join("")}
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
    return { reading: `${plural(n, "reading")} on ${P}`, watch: `${plural(n, "arrival")}, sorted onto your map`, questions: `Your questions and goals at ${P}`, week: "This week's Lumen, outlined", tidy: `A place for ${plural(n, "thing")} in Unsorted`, review: `${plural(n, "question")} on ${P}`, brief: "Your daily brief", digest: `Open questions on “${P}”`, project: `This week on ${P}`, skip: "Skipped" }[o.kind];
  }
  function runView(u) {
    const r = R(u.rid), P = PLACES[r.place], o = u.out;
    let reads = [["Place", P.short || P.name], ["What Loci knows there", P.card], ["In it", P.has]];
    if (r.kind === "watch") reads = [["Sources", plural(r.sources.length, "source")], ["Sorted onto", "your whole map"], ["Your instructions", "yes"]];
    if (r.guides.length) reads.push(["Your guidelines", String(r.guides.length)]);
    const body = ({ skip: () => `<p class="sm-note">${esc(o.why)}</p>`, reading: () => o.items.map((b, i) => resCard(u, b, i)).join(""), watch: () => watchBody(u), questions: () => questionsBody(u), week: () => weekBody(u), tidy: () => tidyBody(u), review: () => reviewBody(u), brief: () => briefBody(u), digest: digestBody, project: projectBody }[o.kind] || (() => ""))();
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
  function tidyBody(u) {
    return u.out.items.map((x, i) => `<div class="rt-arrival"${x.st ? ' data-state="saved"' : ""}><b class="rt-at">${esc(x.t)}</b><span class="rt-src">${esc(x.k)}</span>
      ${x.st ? `<span class="rt-done"><b>Placed</b> on ${esc(PLACES[x.sug].name)}.</span>` : `<div class="sm-row"><span class="sm-note">Belongs on</span><select class="sm-select" style="width:auto" id="tidy-${u.id}-${i}" aria-label="Topic">${["climate", "islamic", "daylight", "precast"].map((p) => `<option value="${p}"${x.sug === p ? " selected" : ""}>${esc(PLACES[p].name)}</option>`).join("")}</select>${btn("Place it", `data-act="t-ok" data-u="${u.id}" data-i="${i}"`, "quiet")}</div>`}</div>`).join("");
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
      return ({ watch: () => ["Arrivals", `${plural(left((x) => !x.st), "thing")} came in, sorted onto your map`, "Keep or not"], reading: () => ["Readings", `${plural(left((x) => !x.st), "reading")} on ${placeName(r)}`, "Look through them"], questions: () => ["Your questions", "One question can become a Lumen from your own saves", "See it"], week: () => ["Lumen of the week", "An outline from what you saved this week", "Make it"], review: () => ["Review", `${plural(left((x) => !x.mark), "question")} on ${placeName(r)}`, "Answer"], brief: () => ["Daily brief", "Five minutes for the drive", "▶ Listen"], tidy: () => ["Unsorted", `${plural(left((x) => !x.st), "thing")} to place`, "Place them"] }[o.kind] || (() => [r.name, status(u)[1], "Open"]))(); };
    const html = `<section class="rt-today" aria-labelledby="rt-today-h"><div class="td-h is-plain"><h2 id="rt-today-h">From your routines</h2><span><a href="#routines" data-tab="routines">All routines</a></span></div>
      <div class="rt-today-list">${waiting.map((u) => { const [k, ti, cta] = line(u); return `<button type="button" class="rt-tcard" data-act="openrun" data-u="${u.id}"><span class="rt-k">${esc(k)} · ${esc(fWhen(u.at))}</span><b>${esc(ti)}</b><em>${esc(cta)}</em></button>`; }).join("")}</div></section>`;
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
    root.insertAdjacentHTML("beforeend", `<div class="sm-proto" role="group" aria-label="Prototype views"><span>Prototype</span>${[["today", "Today"], ["routines", "Routines"], ["runs", "Runs"], ["loci", "In Loci"]].map(([k, l]) => `<button type="button" data-go="${k}" aria-pressed="${cur === k}">${l}</button>`).join("")}<i class="sm-proto-sep" aria-hidden="true"></i><button type="button" data-act="builder" aria-pressed="${S.builder}" title="How each run worked: steps, models, tokens">Builder</button></div>`);
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
    if (r.kind === "tidy") return { ...base, took: "6 s", out: { kind: "tidy", items: UNSORTED.map((x) => ({ ...x, st: null })) } };
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
  const tally = (u, k, n = 1) => { const r = R(u.rid); if (r) r.tally[k] = Math.max(0, r.tally[k] + n); };

  root.addEventListener("click", (ev) => {
    const tg = ev.target.closest("[data-act], [data-tab], [data-go], a[href], .theme-toggle, .rail-toggle");
    if (!tg || !root.contains(tg)) return;
    if (tg.matches("[data-go]")) { S.edit = null; go(tg.dataset.go); return; }
    if (tg.matches("[data-tab]")) { ev.preventDefault(); if (tg.dataset.tab === "runs") S.filter = null; go(tg.dataset.tab); return; }
    if (tg.matches(".theme-toggle")) { const dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches); document.documentElement.dataset.theme = dark ? "light" : "dark"; render(); return; }
    if (tg.matches(".rail-toggle")) { const sh = $(".app-shell", root); sh.dataset.rail = sh.dataset.rail === "open" ? "closed" : "open"; return; }
    if (tg.matches("a[href]") && !tg.dataset.act) {
      ev.preventDefault();
      const href = tg.getAttribute("href");
      if (href === "/today") go("today"); else if (href === "/graph") go("loci"); else if (href === "#routines" || href === "#runs") go(href.slice(1)); else toast("Only Today, Routines and Loci are in this prototype.");
      return;
    }
    const a = tg.dataset.act, id = tg.dataset.id;
    const u = tg.dataset.u ? S.runs.find((x) => x.id === tg.dataset.u) : null, i = Number(tg.dataset.i);
    switch (a) {
      case "builder": S.builder = !S.builder; if (S.builder && !(S.view === "routines" && S.tab === "runs")) { go("runs"); return; } break;
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
      case "t-ok": { const x = u.out.items[i], v = $(`#tidy-${u.id}-${i}`, root)?.value; if (v) x.sug = v; x.st = "placed"; break; }
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
      case "learnfor": toast("In the app, this makes a Lumen for the project (Work, W3)."); return;
      case "toast-undo": if (undoFn) undoFn(); undoFn = null; toastMsg = null; break;
      default: return;
    }
    render();
  });
  root.addEventListener("input", (ev) => {
    const tg = ev.target; if (!S.edit || !tg.dataset?.ed) return;
    const d = S.edit.d, k = tg.dataset.ed;
    d[k] = tg.value;
    if (k === "words" || k === "name") return;
    const est = $("#ed-est", root), nx = $("#ed-next", root), mc = costMonth(d);
    if (nx) nx.textContent = `Next run: ${fWhen(nextRun(d))}. ${PLACES[d.place].path}: ${PLACES[d.place].has}.`;
    if (est) { est.toggleAttribute("data-warn", mc > 10); est.innerHTML = `About <b>${pct(costRun(d))}</b> a run, <b>${pct(mc)}</b> a month of your allowance`; }
  });
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && S.edit) { S.edit = null; render(); } });

  const start = (location.hash || "").slice(1);
  if (["today", "routines", "runs", "loci"].includes(start)) go(start); else render();
})();
