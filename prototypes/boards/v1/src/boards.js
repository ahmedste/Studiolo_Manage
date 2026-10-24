/* Boards (prototype).
   A board is a Commonplace item you think on: an infinite canvas that lives at a place on Loci (area, topic or
   sub-topic). What you place on it is never a copy. A photo, note, quote, link, video, book, Lumen, course, Loci topic
   or another board on a board is the item itself, so a change made on the board shows in Commonplace and on every
   other board. A note or question written on the board is saved to Commonplace. Board-only marks: arrows (a word and
   an optional "why"), frames, the goal, and Loci's cards.
   It drives the app: Make a Lumen follows your arrows (frames become sections, questions become the check, the goal
   sets the brief); a course takes one part per frame; arrows between topics suggest links on the Loci map; the goal
   is what Loci reads as why you're learning the topic; Recall covers your own words so you can test yourself.
   Sample learner: the architect from ../settings-memory (a prayer hall for about 600 in Dubai). Every entry is an
   example. Nothing calls a model: Ask Loci and Make a Lumen are scripted from the board's real contents. */
(() => {
  "use strict";
  const IMG = JSON.parse(document.getElementById("bx-img").textContent);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const uid = (p) => p + "-" + Math.random().toString(36).slice(2, 8);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const TODAY = "24 Oct";
  const KEY = "studiolo-boards-proto-v3";

  /* ================================================================ icons */
  const I = {
    select: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M5 3l10 6.5-4.6 1.1L8.5 15z"/></svg>',
    hand: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10V4.5a1.2 1.2 0 0 1 2.4 0V9M9.4 9V3.6a1.2 1.2 0 0 1 2.4 0V9M11.8 9V4.6a1.2 1.2 0 0 1 2.4 0V11c0 3.3-2 5.5-5 5.5-2.3 0-3.4-1.2-4.6-3.3L3.4 11a1.2 1.2 0 0 1 2-1.3L7 11.6"/></svg>',
    note: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M4 3.5h12v9l-4 4H4z"/><path d="M12 16.5v-4h4"/><path d="M7 7.5h6M7 10h4" stroke-linecap="round"/></svg>',
    arrow: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="4.5" cy="15.5" r="1.8"/><path d="M6 14l9-9M10 5h5v5"/></svg>',
    frame: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="14" height="11" rx="1.5" stroke-dasharray="2.5 2"/><path d="M3 3h6" stroke-linecap="round"/></svg>',
    question: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="10" cy="10" r="7.2"/><path d="M7.9 7.8a2.2 2.2 0 1 1 3 2c-.6.3-.9.8-.9 1.4v.4"/><circle cx="10" cy="14" r=".4" fill="currentColor"/></svg>',
    plus: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10 4.5v11M4.5 10h11"/></svg>',
    close: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>',
    search: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="9" cy="9" r="5.5"/><path d="M13.2 13.2L17 17"/></svg>',
    spark: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M10 2.5l1.7 4.8 4.8 1.7-4.8 1.7L10 15.5l-1.7-4.8L3.5 9l4.8-1.7z"/></svg>',
    play: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M6.5 4.5v11l9-5.5z"/></svg>',
    eye: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10z"/><path d="M3 17L17 3" stroke-linecap="round"/></svg>',
    lumen: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="4" width="15" height="10" rx="1.5"/><path d="M8.5 7v4l3.5-2z" fill="currentColor" stroke="none"/><path d="M6 17h8" stroke-linecap="round"/></svg>',
    open: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 3.5h5.5V9M16.5 3.5L9 11M14 12v4.5H3.5V6H8"/></svg>',
    unpack: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="3" y="3" width="6" height="5" rx="1"/><rect x="11" y="12" width="6" height="5" rx="1"/><rect x="3" y="12" width="6" height="5" rx="1"/><path d="M6 8v4M9 5.5h5V12" stroke-linecap="round"/></svg>',
    trash: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 6h12M8 6V4h4v2M5.5 6l.8 10h7.4l.8-10"/></svg>',
    board: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="3.5" width="15" height="13" rx="1.5"/><rect x="5" y="6" width="4" height="3" rx=".5"/><rect x="11" y="10.5" width="4" height="3.5" rx=".5"/><path d="M9 8l2.5 3" stroke-linecap="round"/></svg>',
    link: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-.9.9M11.5 8.5a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2l.9-.9"/></svg>',
    info: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="10" cy="10" r="7.2"/><path d="M10 9v5"/><circle cx="10" cy="6.4" r=".5" fill="currentColor"/></svg>',
    more: '<svg viewBox="0 0 20 20" fill="currentColor"><circle cx="5" cy="10" r="1.4"/><circle cx="10" cy="10" r="1.4"/><circle cx="15" cy="10" r="1.4"/></svg>',
  };

  /* ================================================================ the learner's map (examples) */
  const TOPICS = [
    { id: "you", name: "You", parent: null },
    { id: "hist", name: "History & Theory", parent: "you" },
    { id: "islamic", name: "Islamic architecture", parent: "hist", st: 2 },
    { id: "court", name: "Courtyards", parent: "islamic", st: 2 },
    { id: "hypo", name: "Arcades & hypostyle", parent: "islamic", st: 1 },
    { id: "light", name: "Light & threshold", parent: "hist", st: 1 },
    { id: "culture", name: "Culture & Context", parent: "you" },
    { id: "climate", name: "Climate-responsive design", parent: "culture", st: 1 },
    { id: "wind", name: "Wind towers", parent: "climate", st: 1 },
    { id: "shade", name: "Shading & screens", parent: "climate", st: 0 },
    { id: "stack", name: "Stack effect", parent: "climate", st: 2 },
    { id: "evap", name: "Evaporative cooling", parent: "climate", st: 0 },
    { id: "env", name: "Envelope & Facade", parent: "you" },
    { id: "facades", name: "Facade systems", parent: "env", st: 1 },
    { id: "brick", name: "Brick", parent: "env", st: 1 },
    { id: "struct", name: "Structures", parent: "you" },
    { id: "concrete", name: "Concrete & precast", parent: "struct", st: 0 },
    { id: "law", name: "Construction Law", parent: "you" },
  ];
  const T = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
  const ST = ["Not started", "Learning", "Learned"];
  const chain = (id) => { const out = []; let t = T[id]; while (t && t.id !== "you") { out.unshift(t); t = T[t.parent]; } return out; };
  const under = (id, root) => { let t = T[id]; while (t) { if (t.id === root) return true; t = T[t.parent]; } return false; };
  const areaOf = (id) => chain(id)[0];

  /* ================================================================ Commonplace (the one library) */
  function seed() {
    const it = {};
    const add = (o) => (it[o.id] = { date: "20 Oct", topics: [], ...o });
    const ph = (id, img, title, caption, kind, topics, extra) => add({ id, type: "photo", img, title, caption, kind, topics, ...extra });
    ph("p-wind", "windtowers", "Wind towers over the old quarter", "Each tower faces the summer wind; the slots are on one side only.", "Site visits", ["wind"], { album: "Yazd", date: "3 Apr" });
    ph("p-section", "section-windtower", "Section through a wind tower", "Cool air down the tower, warm air out through the high openings.", "Drawings", ["wind", "stack"], { date: "10 Apr" });
    ph("p-court", "courtyard-morning", "Courtyard toward the prayer hall", "Morning, from the north gate. The pool sits on the axis of the wider central bay.", "Site visits", ["court"], { album: "Kairouan", date: "12 Sep", notes: 2 });
    ph("p-noon", "courtyard-noon", "Arcade at noon", "Shade only inside the arcade at this hour; the court itself is a heat trap.", "Site visits", ["court", "shade"], { album: "Kairouan", date: "12 Sep" });
    ph("p-mash", "screen-shadow", "Mashrabiya shadow on the floor", "Late afternoon in a Cairo house. The screen draws on the floor for an hour.", "Site visits", ["shade"], { date: "18 Feb" });
    ph("p-jali", "mat-jali", "Perforated brick screen", "Half-bricks left out. Light and air, no glass.", "Materials", ["shade", "brick"], { date: "3 Jul" });
    ph("p-house", "courthouse-aerial", "Courtyard house, aerial", "Four rooms round a court; the tall wing takes the wind tower.", "Renders", ["court"], { date: "30 Sep" });
    ph("p-plan", "plan-courtyard", "Courtyard house, ground floor plan", "Liwan to the west, majlis to the east. Columns only on the court.", "Drawings", ["court"], { date: "28 Sep" });
    ph("p-stepwell", "stepwell", "Stepwell, looking down", "Water deep in the ground stays cool, and so does the air just above it.", "Site visits", ["evap"], { album: "Yazd", date: "4 Apr" });
    ph("p-vaults", "vaults", "Vaulted roofs, mud brick", "Barrel vaults in a row, a dome at the end. No formwork used.", "Site visits", ["stack"], { album: "Yazd", date: "4 Apr" });
    ph("p-earth", "earth-wall", "Rammed earth wall, long view", "Garden wall on the edge of town. You can count the lifts.", "Site visits", [], { album: "Yazd", date: "3 Apr" });
    ph("p-hypo", "hypostyle", "Hypostyle hall, light through the roof", "Openings in the roof slab, not windows: light arrives in pools between the columns.", "Site visits", ["hypo", "light"], { album: "Kairouan", date: "12 Sep" });
    ph("p-brickhall", "brick-hall", "Brick prayer hall, light from above", "Saved for the way light comes down the brick, not across it.", "References", ["light", "brick"], { date: "22 Aug" });
    ph("p-stair", "stair-light", "Stair under a roof light", "Board-marked concrete, one slot of light at the top.", "References", ["light"], { date: "29 Aug" });
    ph("p-colon", "colonnade-dusk", "Colonnade at dusk", "The colonnade keeps its rhythm long after the court goes dark.", "Site visits", ["hypo"], { album: "Kairouan", date: "12 Sep" });

    add({ id: "n-tower", type: "note", text: "The tower works two ways: it catches the wind and sends it down, and it lets warm air rise out. On a still day only the second one works.", topics: ["wind", "stack"], date: "19 Oct" });
    add({ id: "n-court", type: "note", text: "A court deeper than it is wide stays in shade most of the day. Ours is 24 m wide with 7 m walls, so it won't.", topics: ["court"], date: "22 Oct" });
    add({ id: "n-client", type: "note", text: "Client wants the courtyard usable after Isha prayers in summer, not only in winter.", topics: ["climate"], date: "18 Oct" });
    add({ id: "q-shade", type: "quote", text: "Shade first, then mass, then air.", src: "Climate and Architecture, lecture notes, p. 3", topics: ["climate", "shade"], date: "21 Oct" });
    add({ id: "q-fathy", type: "quote", text: "We have to design for the climate, not against it.", src: "Hassan Fathy", topics: ["climate"], date: "2 May" });
    add({ id: "qn-humid", type: "question", text: "Does evaporative cooling help at all in Dubai's humid August?", topics: ["evap"], date: "22 Oct" });
    add({ id: "qn-ratio", type: "question", text: "How deep must the court be, for its width, to stay shaded at noon?", topics: ["court", "shade"], date: "22 Oct" });
    add({ id: "l-humid", type: "link", title: "Evaporative cooling in hot-humid climates: what the numbers say", site: "Journal article", desc: "Wet-bulb depression by month for five Gulf cities.", topics: ["evap"], date: "20 Oct" });
    add({ id: "l-rouf", type: "link", title: "Bait Ur Rouf Mosque, Marina Tabassum", site: "archdaily.com", desc: "Brick, no dome, light from above.", topics: ["light", "brick"], date: "22 Aug" });
    add({ id: "v-cool", type: "video", title: "Cooling without machines", creator: "Studio lecture", dur: "42:10", topics: ["climate"], date: "14 Oct",
      moments: [{ t: "08:20", text: "The malqaf at a Cairo house" }, { t: "19:45", text: "Why the catcher faces one way" }, { t: "31:02", text: "Water jars in the airstream" }] });
    add({ id: "b-fathy", type: "book", title: "Natural Energy and Vernacular Architecture", creator: "Hassan Fathy, 1986", topics: ["climate"], date: "2 May" });

    add({ id: "lm-malqaf", type: "lumen", title: "How a malqaf moves air", min: 4, watched: true, topics: ["wind"], date: "19 Oct",
      slides: [{ t: "What a malqaf is", img: "windtowers" }, { t: "Wind pressure at the top" }, { t: "Cool air sinks down the shaft", img: "section-windtower" }, { t: "Over water, the air cools further", img: "stepwell" }, { t: "On a still day, the stack effect takes over" }] });
    add({ id: "lm-night", type: "lumen", title: "Why courtyards stay cool at night", min: 5, topics: ["court"], date: "16 Oct",
      slides: [{ t: "The court as a well of cool air", img: "courtyard-morning" }, { t: "Radiating heat to a clear sky" }, { t: "Mass that gives the cool back by day" }, { t: "Where it stops working" }] });
    const parts = [["lm-c1", "Sun and shade", true, "courtyard-noon"], ["lm-c2", "Thermal mass", true, "earth-wall"], ["lm-c3", "Moving air", false, "section-windtower"], ["lm-c4", "Water and evaporation", false, "stepwell"], ["lm-c5", "Courtyards as climate machines", false, "courthouse-aerial"]];
    parts.forEach(([id, title, watched, img], i) => add({ id, type: "lumen", title, min: 5 + (i % 2), watched, course: "c-climate", part: i + 1, topics: ["climate"], date: "12 Oct",
      slides: [{ t: title, img }, { t: "The principle" }, { t: "A building that does it" }, { t: "Check yourself" }] }));
    add({ id: "c-climate", type: "course", title: "Climate and Architecture", parts: parts.map((p) => p[0]), topics: ["climate"], date: "12 Oct" });

    add({ id: "b-court", type: "board", title: "Cooling the prayer-hall courtyard", place: "climate", date: "22 Oct",
      goal: "Understand how to keep the prayer hall's courtyard cool without machines, well enough to brief the engineer.",
      cards: [
        { id: "c-goal", kind: "goal", x: 40, y: 30, w: 330 },
        { id: "f-air", kind: "frame", label: "How air moves", x: 40, y: 250, w: 800, h: 600 },
        { id: "c1", ref: "p-wind", x: 72, y: 290, w: 160 },
        { id: "c2", ref: "p-section", x: 330, y: 290, w: 260 },
        { id: "c3", ref: "n-tower", x: 330, y: 500, w: 250 },
        { id: "c4", ref: "lm-malqaf", x: 640, y: 300, w: 176 },
        { id: "f-shade", kind: "frame", label: "Shade first", x: 900, y: 250, w: 700, h: 600 },
        { id: "c5", ref: "q-shade", x: 930, y: 290, w: 240 },
        { id: "c6", ref: "p-noon", x: 930, y: 450, w: 180 },
        { id: "c7", ref: "p-mash", x: 1210, y: 290, w: 170 },
        { id: "c8", ref: "p-jali", x: 1420, y: 290, w: 150 },
        { id: "c9", ref: "p-court", x: 40, y: 920, w: 250 },
        { id: "c10", ref: "n-court", x: 350, y: 930, w: 250 },
        { id: "c11", ref: "qn-ratio", x: 660, y: 940, w: 230 },
        { id: "c12", ref: "p-house", x: 72, y: 620, w: 170 },
        { id: "c13", ref: "c-climate", x: 960, y: 940, w: 220 },
        { id: "c14", ref: "qn-humid", x: 1250, y: 940, w: 230 },
        { id: "c15", ref: "l-humid", x: 1250, y: 1100, w: 230 },
        { id: "c16", ref: "b-qibla", x: 1430, y: 30, w: 190 },
      ],
      arrows: [
        { id: "a1", a: "c2", b: "c1", verb: "explains", why: "Why the slots are on one side only." },
        { id: "a2", a: "c2", b: "c3", verb: "leads to", why: "" },
        { id: "a3", a: "c4", b: "c2", verb: "explains", why: "" },
        { id: "a4", a: "c6", b: "c5", verb: "example of", why: "" },
        { id: "a5", a: "c8", b: "c7", verb: "contrasts with", why: "Same patterned shade, but brick needs no carpenter." },
        { id: "a6", a: "c9", b: "c10", verb: "leads to", why: "I measured ours after this visit." },
        { id: "a7", a: "c10", b: "c11", verb: "raises", why: "" },
        { id: "a8", a: "c12", b: "c1", verb: "leads to", why: "The court and the tower work as one system." },
        { id: "a9", a: "c15", b: "c14", verb: "explains", why: "" },
      ] });
    add({ id: "b-qibla", type: "board", title: "Daylight on the qibla wall", place: "light", date: "20 Oct",
      goal: "Find a way to bring light down the qibla wall without glare at the mihrab.",
      cards: [
        { id: "q-goal", kind: "goal", x: 40, y: 30, w: 320 },
        { id: "q1", ref: "p-hypo", x: 40, y: 220, w: 250 },
        { id: "q2", ref: "p-brickhall", x: 340, y: 200, w: 190 },
        { id: "q3", ref: "p-stair", x: 580, y: 200, w: 190 },
        { id: "q4", ref: "l-rouf", x: 340, y: 500, w: 240 },
      ],
      arrows: [{ id: "qa1", a: "q4", b: "q2", verb: "explains", why: "" }, { id: "qa2", a: "q1", b: "q2", verb: "contrasts with", why: "Pools of light vs. light sliding down a wall." }] });
    return { v: 3, items: it, cur: "b-court", views: {}, links: [], dismissed: [], made: 0, firstGuide: true };
  }

  /* ================================================================ state */
  let DB;
  try { DB = JSON.parse(localStorage.getItem(KEY) || "null"); } catch { DB = null; }
  if (!DB || DB.v !== 3) DB = seed();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch { /* private window: fine */ } };
  const hist = [];
  const pushHist = () => { hist.push(JSON.stringify(DB)); if (hist.length > 80) hist.shift(); };
  function undo() { const s = hist.pop(); if (!s) return toast("Nothing to undo."); DB = JSON.parse(s); save(); U.sel.clear(); U.wire = null; render(); }
  function mutate(fn, msg, opts = {}) { pushHist(); fn(); save(); if (opts.redraw !== false) redraw(); if (msg) toast(msg, opts.undo !== false); }

  const U = { screen: "board", sel: new Set(), tool: "select", drawer: false, dtab: "cp", dscope: "here", dq: "", insp: null,
    recall: false, rv: {}, wire: null, space: false, cpType: "all", lociSel: "climate", edited: null, guide: false, pbarOpen: false };
  const SZ = {}; // measured card sizes (world px)

  const board = () => DB.items[DB.cur];
  function item(ref) {
    if (!ref) return null;
    if (ref.includes("#")) { const [lid, n] = ref.split("#"); const l = DB.items[lid]; if (!l) return null; const s = l.slides[+n]; return s && { id: ref, type: "slide", lumen: l, n: +n, of: l.slides.length, ...s, topics: l.topics }; }
    if (ref.includes("@")) { const [vid, n] = ref.split("@"); const v = DB.items[vid]; if (!v) return null; const m = v.moments[+n]; return m && { id: ref, type: "moment", video: v, n: +n, ...m, topics: v.topics }; }
    if (ref.startsWith("topic:")) { const t = T[ref.slice(6)]; return t && { id: ref, type: "topic", topic: t, title: t.name, topics: [t.id] }; }
    return DB.items[ref] || null;
  }
  const cardOf = (cid, b = board()) => b.cards.find((c) => c.id === cid);
  const titleOf = (x) => !x ? "" : x.type === "note" || x.type === "question" || x.type === "quote" ? x.text : x.type === "moment" ? `${x.t} · ${x.text}` : x.title || x.text || "";
  const short = (s, n = 46) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
  const boardsWith = (ref) => Object.values(DB.items).filter((b) => b.type === "board" && b.cards.some((c) => c.ref === ref));
  const typeWord = (x) => ({ photo: x.kind || "Photo", note: "Note", quote: "Quote", question: "Question", link: "Link", video: "Video", book: "Book", lumen: x.course ? `Part ${x.part}` : "Lumen", course: "Course", board: "Board", topic: "Loci topic", slide: "Slide", moment: "Moment" })[x.type] || x.type;
  const isContent = (c) => c && c.ref && !c.kind;
  const VERBS = ["leads to", "explains", "example of", "contrasts with", "causes", "raises", "part of"];

  /* ================================================================ shell */
  const app = document.getElementById("bx-app");
  app.innerHTML = `<div class="app">
    <nav class="rail" aria-label="Primary">
      <span class="logo" aria-hidden="true">S</span>
      <button data-act="nyi" data-msg="Capture isn't part of this prototype." title="Capture"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="7.5"/><path d="M10 6.5v7M6.5 10h7"/></svg><span class="vh">Capture</span></button>
      <button data-act="nyi" data-msg="Today isn't part of this prototype." title="Today"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="3.2"/><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4"/></svg><span class="vh">Today</span></button>
      <button data-act="nyi" data-msg="Learn isn't part of this prototype. Lumens you make on a board also appear in Learn." title="Learn"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 8l8-4 8 4-8 4z"/><path d="M5.5 9.8V13c1.2 1.3 2.7 2 4.5 2s3.3-.7 4.5-2V9.8"/></svg><span class="vh">Learn</span></button>
      <button data-act="screen" data-s="commonplace" data-nav="commonplace" title="Commonplace"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4v12M7.5 4v12M11 4.5l3.5 11.2"/></svg><span class="vh">Commonplace</span></button>
      <button data-act="screen" data-s="loci" data-nav="loci" title="Loci"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="8" y="2.5" width="4" height="4" rx="1"/><rect x="2.5" y="13.5" width="4" height="4" rx="1"/><rect x="13.5" y="13.5" width="4" height="4" rx="1"/><path d="M10 6.5v3.5M4.5 13.5V10h11v3.5"/></svg><span class="vh">Loci</span></button>
      <span class="grow"></span>
      <button data-act="theme" title="Switch theme"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15.5 12.5A6.5 6.5 0 0 1 7.5 4.5a6.5 6.5 0 1 0 8 8z"/></svg><span class="vh">Switch theme</span></button>
      <span class="me" aria-hidden="true">AS</span>
    </nav>
    <main id="main"></main>
  </div>
  <div class="pbar" id="pbar"></div>
  <div id="layer"></div>
  <div id="toast" aria-live="polite"></div>`;
  const main = $("#main");

  function render() {
    $$(".rail [data-nav]").forEach((b) => b.toggleAttribute("aria-current", false));
    const nav = U.screen === "commonplace" ? "commonplace" : "loci";
    const nb = $(`.rail [data-nav="${nav}"]`); if (nb) nb.setAttribute("aria-current", "page");
    if (U.screen === "board") renderBoard(); else if (U.screen === "loci") renderLoci(); else renderCommonplace();
    renderPbar();
  }
  function redraw() { if (U.screen === "board") { drawWorld(); renderInsp(); renderDrawer(); } else render(); }

  /* ================================================================ prototype bar + guide */
  function renderPbar() {
    const p = $("#pbar");
    p.className = "pbar" + (U.screen === "board" ? " on-board" : "") + (U.pbarOpen ? " open" : "");
    const s = (id, l) => `<button class="scr" data-act="screen" data-s="${id}" aria-pressed="${U.screen === id}">${l}</button>`;
    p.innerHTML = `<span class="tag">Prototype</span>${s("board", "Board")}${s("loci", "Loci")}${s("commonplace", "Commonplace")}<button data-act="guide" aria-pressed="${U.guide}">Guide</button><button class="scr" data-act="reset">Reset</button>`;
  }
  function renderGuide() {
    $(".guide")?.remove();
    if (!U.guide) return;
    const g = document.createElement("div");
    g.className = "guide"; g.setAttribute("role", "dialog"); g.setAttribute("aria-label", "Guide");
    g.innerHTML = `<h2>A board is where you think</h2>
      <p>Place anything from your library, draw arrows, say why, and leave questions. Everything on it is the real item, so it stays connected to Commonplace, Loci and your Lumens. Then turn the thinking into a Lumen.</p>
      <ol>
        <li><span><b>Connect.</b> Drag a card by its edge dot ● onto another, or use the arrow tool (A). Pick a word and say <em>why</em> in one line.</span></li>
        <li><span><b>Place.</b> Press <b>+</b>: a photo, note or link from Commonplace, a Lumen, a course, a Loci topic, another board. Drag it in or tap it. Paste a link to save it as a source.</span></li>
        <li><span><b>Unpack.</b> Open the course into its parts and drag one out. Do the same with a Lumen's slides or a lecture's moments.</span></li>
        <li><span><b>It's the same item.</b> Double-click a note and change it, then look in Commonplace: it changed there too.</span></li>
        <li><span><b>Ask Loci.</b> Select a few cards and press Ask Loci. You write the connection first, then compare.</span></li>
        <li><span><b>Recall.</b> Covers your notes and arrows. Say each one, tap to check.</span></li>
        <li><span><b>Make a Lumen.</b> It follows your arrows, frames become sections, questions become the check. Play it.</span></li>
        <li><span><b>Loci.</b> Arrows between topics suggest links on your map. The goal is what Loci reads as why you're learning.</span></li>
      </ol>
      <div class="gf"><span class="kick">Scroll to pan · Ctrl+scroll to zoom · 0 fit</span><button class="btn sm" data-act="guide">Close</button></div>`;
    document.body.appendChild(g);
    const pb = $("#pbar").getBoundingClientRect();
    const w = Math.min(380, innerWidth - 20);
    g.style.left = clamp(pb.left, 10, innerWidth - w - 10) + "px";
    if (innerWidth < 700) { g.style.top = pb.bottom + 8 + "px"; } else { g.style.bottom = innerHeight - pb.top + 8 + "px"; }
  }

  /* ================================================================ toast */
  function toast(msg, undoable = false, action) {
    const box = $("#toast");
    const t = document.createElement("div");
    t.className = "tst";
    t.innerHTML = `<span>${esc(msg)}</span>${action ? `<button>${esc(action.label)}</button>` : undoable ? "<button>Undo</button>" : ""}`;
    const b = t.querySelector("button");
    if (b) b.onclick = () => { t.remove(); if (action) action.fn(); else undo(); };
    box.innerHTML = ""; box.appendChild(t);
    setTimeout(() => t.remove(), action || undoable ? 5200 : 3200);
  }

  /* ================================================================ BOARD */
  const V = () => (DB.views[DB.cur] ||= { x: 0, y: 0, z: 0, fit: true });

  function renderBoard() {
    const b = board();
    const crumbs = chain(b.place);
    const parentBoards = Object.values(DB.items).filter((x) => x.type === "board" && x.id !== b.id && x.cards.some((c) => c.ref === b.id));
    main.innerHTML = `<div class="bd${U.recall ? " recall" : ""}" id="bd">
      <header class="bd-top">
        <div class="bd-id">
          <nav class="crumbs" aria-label="Where this board lives">
            <button data-act="screen" data-s="loci">Loci</button>${crumbs.map((t, i) => `<span class="sep">›</span><button class="${i < crumbs.length - 1 ? "mid" : ""}" data-act="loci-at" data-t="${t.id}">${esc(t.name)}</button>`).join("")}
            ${parentBoards.length ? `<span class="sep">›</span><button data-act="open-board" data-id="${parentBoards[0].id}">${esc(short(parentBoards[0].title, 28))}</button>` : ""}
          </nav>
          <div class="bd-title"><span class="kick">Board</span><h1 id="bd-h1" title="Double-click to rename">${esc(b.title)}</h1></div>
        </div>
        <div class="bd-acts">
          <button class="btn" data-act="recall" aria-pressed="${U.recall}" title="Cover your own words and test yourself">${I.eye}<span class="lbl">Recall</span></button>
          <button class="btn" data-act="ask" title="Ask Loci about the selection">${I.spark}<span class="lbl">Ask Loci</span></button>
          <button class="btn primary" data-act="make" title="Turn this board into a Lumen">${I.lumen}<span class="lbl">Make a Lumen</span></button>
        </div>
      </header>
      <div class="stage" id="stage" tabindex="0" aria-label="Board canvas. Drag to pan, Ctrl and scroll to zoom." data-tool="${U.tool}">
        <div class="world" id="world"><div id="frames"></div><svg id="wires" width="1" height="1" aria-hidden="true"></svg><div id="cards"></div><div id="labels"></div></div>
        <div class="marquee" id="marquee" hidden></div>
        <div class="palette" role="toolbar" aria-label="Tools">
          <button class="add" data-act="drawer" aria-pressed="${U.drawer}" aria-label="Add to board">${I.plus}<span class="tip">Add from your library <kbd>+</kbd></span></button>
          <hr>
          ${[["select", "Select and move", "V"], ["hand", "Pan", "H"], ["note", "Note", "N"], ["question", "Question", "Q"], ["arrow", "Arrow", "A"], ["frame", "Frame", "F"]].map(([t, l, k]) =>
            `<button data-act="tool" data-t="${t}" aria-pressed="${U.tool === t}" aria-label="${l}">${I[t]}<span class="tip">${l}<kbd>${k}</kbd></span></button>`).join("")}
        </div>
        <div class="minimap" id="minimap" aria-label="Overview" role="img"></div>
        <div class="zoombar"><button data-act="zout" aria-label="Zoom out">−</button><button class="ro" data-act="fit" id="zro" title="Fit the board (0)">100%</button><button data-act="zin" aria-label="Zoom in">+</button></div>
        <div id="seltb" class="seltb" hidden></div>
        <div id="banner"></div>
        <aside class="drawer left${U.drawer ? " open" : ""}" id="drawer" aria-label="Add to board"></aside>
        <aside class="drawer right${U.insp ? " open" : ""}" id="insp" aria-label="Details"></aside>
      </div>
    </div>`;
    bindStage();
    drawWorld();
    renderDrawer();
    renderInsp();
    if (V().fit) requestAnimationFrame(() => {
      // on a phone, open on the goal and the first frame rather than the whole board at a size nobody can read
      const f = b.cards.find((c) => c.kind === "frame"), g = b.cards.find((c) => c.kind === "goal");
      fit(false, innerWidth < 700 && f ? [f, g].filter(Boolean) : undefined);
    });
  }

  /* ---------- card faces ---------- */
  function picHTML(name, w, extraStyle = "") {
    const m = IMG[name]; if (!m) return "";
    return `<div class="pic" style="aspect-ratio:${m.w}/${m.h};background:${m.pal};${extraStyle}"><img src="${m.src}" alt="" draggable="false"></div>`;
  }
  const onBoardsBadge = (ref) => { const n = boardsWith(ref).length; return n > 1 ? `<span class="on bdg" title="On ${n} boards">${I.board.replace("<svg", '<svg width="11" height="11"')} ${n}</span>` : ""; };
  function face(c) {
    const b = board();
    if (c.kind === "goal") return `<div class="k-goal cv" data-cover="${c.id}"><span class="kick">${I.spark.replace("<svg", '<svg width="13" height="13"')} Goal</span><p class="txt" data-edit="goal" data-ph="What do you want to understand?">${esc(b.goal)}</p><span class="gfoot">Loci reads this as why you're learning ${esc(T[b.place]?.name || "this")}.</span></div>`;
    if (c.kind === "loci") return lociFace(c);
    const x = item(c.ref);
    if (!x) return `<div class="k-note"><p class="txt">This item was deleted.</p></div>`;
    const src = (w) => `<div class="src">${w}${onBoardsBadge(c.ref)}</div>`;
    switch (x.type) {
      case "photo": return `${picHTML(x.img)}${x.notes ? `<span class="pn">▢ ${x.notes} notes</span>` : ""}<div class="cap"><b>${esc(x.title)}</b><span>${esc(x.kind)}${x.album ? " · " + esc(x.album) : ""}</span></div>`;
      case "note": return `<div class="k-note cv" data-cover="${c.id}"><p class="txt" data-edit="item" data-ph="Write a note">${esc(x.text)}</p>${src("Note · Commonplace")}</div>`;
      case "quote": return `<div class="k-quote cv" data-cover="${c.id}"><p class="txt">${esc(x.text)}</p><cite>${esc(x.src)}</cite></div>`;
      case "question": {
        const ans = Object.values(DB.items).find((l) => l.type === "lumen" && l.state !== "making" && l.answers?.includes(x.id));
        return `<div class="k-question"><div class="qh"><span class="qm">?</span><span class="kick">Question</span></div><p class="txt" data-edit="item" data-ph="What don't you know yet?">${esc(x.text)}</p>${ans ? `<span class="ans">✓ Answered in “${esc(short(ans.title, 30))}”</span>` : src("Commonplace · open")}</div>`;
      }
      case "link": return `<div class="k-link"><span class="site"><i>${esc((x.site || "?")[0].toUpperCase())}</i>${esc(x.site)}</span><b>${esc(x.title)}</b>${x.desc ? `<p>${esc(x.desc)}</p>` : ""}${src("Source · Commonplace")}</div>`;
      case "video": { const open = b.cards.some((k) => k.from === c.id);
        return `<div class="vid"><span class="pl">${I.play.replace("<svg", '<svg width="14" height="14"')}</span><span class="dur">${x.dur}</span></div><div class="cap"><b>${esc(x.title)}</b><span class="src">${esc(x.creator)}${onBoardsBadge(c.ref)}</span><div class="row"><button class="in" data-act="unpack" data-c="${c.id}">${open ? "Fold moments" : `Unpack ${x.moments.length} moments`}</button></div></div>`; }
      case "moment": return `<div class="k-moment"><span class="t">▶ ${esc(x.t)} · ${esc(short(x.video.title, 22))}</span><b>${esc(x.text)}</b></div>`;
      case "book": return `<div class="cover">${esc(x.title)}<small>${esc(x.creator)}</small></div><div class="cap"><span class="src">Book · Reading</span></div>`;
      case "slide": return `<div class="k-slide"><span class="t">Slide ${x.n + 1} of ${x.of} · ${esc(short(x.lumen.title, 22))}</span>${x.img ? `<div class="sim"><img src="${IMG[x.img]?.src}" alt="" draggable="false"></div>` : ""}<b>${esc(x.t)}</b></div>`;
      case "lumen": {
        const making = x.state === "making"; const open = b.cards.some((k) => k.from === c.id);
        const imgs = x.slides.filter((s) => s.img).slice(0, 4);
        return `<div class="k-lumen${making ? " making" : ""}"><span class="kick"><span class="dot"></span>${x.course ? `Part ${x.part} · ` : ""}Lumen · ${x.min} min${x.watched ? " · watched" : ""}</span><b>${esc(x.title)}</b>
          ${making ? `<span class="lsub">${esc(x.stage)}</span><div class="prog"><i style="width:${x.pct}%"></i></div>` : `
          ${imgs.length ? `<div class="thumbs">${imgs.map((s) => `<span><img src="${IMG[s.img].src}" alt="" draggable="false"></span>`).join("")}</div>` : ""}
          ${x.from ? `<span class="lsub">Made from this board · ${x.slides.length} slides</span>` : ""}
          <div class="row"><button class="in" data-act="play" data-id="${x.id}">${I.play.replace("<svg", '<svg width="11" height="11"')} Play</button><button class="in" data-act="unpack" data-c="${c.id}">${open ? "Fold slides" : "Slides"}</button></div>`}</div>`;
      }
      case "course": {
        const ps = x.parts.map((p) => DB.items[p]); const done = ps.filter((p) => p.watched).length; const open = b.cards.some((k) => k.from === c.id);
        return `<div class="band" style="--p:${(done / ps.length) * 100}%"></div><div class="cap"><span class="kick">Course · ${ps.length} parts · ${done} done</span><b>${esc(x.title)}</b>
          <ol class="parts">${ps.map((p) => `<li class="${p.watched ? "done" : ""}"><i>${p.watched ? "✓" : ""}</i>${p.part}. ${esc(p.title)}</li>`).join("")}</ol>
          <div class="row"><button class="in" data-act="unpack" data-c="${c.id}">${open ? "Fold parts" : "Unpack parts"}</button></div></div>`;
      }
      case "topic": { const t = x.topic; return `<span class="ring s${t.st ?? 0}"></span><div><b>${esc(t.name)}</b><span>Loci · ${esc(ST[t.st ?? 0])} · ${esc(T[t.parent]?.name || "")}</span></div>`; }
      case "board": return `<span class="pv">${boardSVG(x, 174, 104)}</span><div class="cap"><span class="kick">Board · ${x.cards.length} cards</span><b>${esc(x.title)}</b><div class="row"><button class="in" data-act="open-board" data-id="${x.id}">Open ›</button></div></div>`;
    }
    return "";
  }
  function lociFace(c) {
    const n = c.about.length;
    if (c.state === "ask") return `<div class="k-loci"><span class="kick"><i>L</i>Loci asks</span><p>What connects ${n === 1 ? "this" : `these ${n}`}? Say it in one sentence first. Then compare with mine.</p>
      <textarea data-loci="${c.id}" placeholder="In your words…" aria-label="Your answer">${esc(c.yours || "")}</textarea>
      <div class="row"><button class="btn sm primary" data-act="loci-compare" data-c="${c.id}">Compare</button><button class="btn sm quiet" data-act="loci-skip" data-c="${c.id}">Just tell me</button><button class="btn sm quiet" data-act="rm-card" data-c="${c.id}">Dismiss</button></div></div>`;
    return `<div class="k-loci"><span class="kick"><i>L</i>Loci</span>${c.yours ? `<div class="yours">${esc(c.yours)}</div>` : ""}<div class="theirs">${esc(c.text)}</div>${c.extra ? `<p>${esc(c.extra)}</p>` : ""}
      <div class="row">${c.yours ? `<button class="btn sm" data-act="loci-keep" data-c="${c.id}" data-w="mine">Keep mine as a note</button>` : ""}<button class="btn sm" data-act="loci-keep" data-c="${c.id}" data-w="loci">Keep Loci's</button>${c.topic ? `<button class="btn sm" data-act="loci-topic" data-c="${c.id}">Place “${esc(T[c.topic].name)}”</button>` : ""}<button class="btn sm quiet" data-act="rm-card" data-c="${c.id}">Dismiss</button></div></div>`;
  }
  function cardHTML(c) {
    const x = c.kind ? null : item(c.ref);
    const k = c.kind || x?.type || "note";
    const cls = ["card", "k-" + k, U.sel.has(c.id) ? "sel" : "", U.wire?.from === c.id ? "wire-from" : "", c.flash ? "flash" : ""].join(" ");
    const r = U.rv[c.id]; const covered = U.recall && coverable(c) && !r;
    let inner = face(c);
    if (U.recall && coverable(c)) {
      if (covered) inner = inner.replace(/class="(k-note|k-goal|k-quote) cv"/, 'class="$1 cv"');
      else inner = inner.replace(/ cv"/, '"');
    } else inner = inner.replace(/ cv"/, '"');
    const mark = U.recall && r === "shown" ? `<div class="rmark"><button class="y" data-act="rmark" data-c="${c.id}" data-v="y">✓ Got it</button><button class="n" data-act="rmark" data-c="${c.id}" data-v="n">Not yet</button></div>` : "";
    const res = U.recall && (r === "y" || r === "n") ? `<span class="rres ${r}">${r === "y" ? "Got it" : "To revisit"}</span>` : "";
    const wrapPad = k === "goal" || k === "note" || k === "quote";
    return `<div class="${cls}" data-id="${c.id}" style="left:${c.x}px;top:${c.y}px;width:${c.w}px">${inner}${mark && wrapPad ? `<div style="padding:0 14px 10px">${mark}</div>` : mark}${res}<span class="hd" data-hd="${c.id}" title="Drag to another card to connect"></span></div>`;
  }
  const coverable = (c) => c.kind === "goal" || (c.ref && ["note", "quote"].includes(item(c.ref)?.type));
  function frameHTML(f) {
    return `<div class="frame${U.sel.has(f.id) ? " sel" : ""}" data-id="${f.id}" style="left:${f.x}px;top:${f.y}px;width:${f.w}px;height:${f.h}px"><div class="fl" data-fl="${f.id}">${esc(f.label)}</div><span class="fr" data-fr="${f.id}"></span></div>`;
  }

  /* ---------- world drawing ---------- */
  function drawWorld() {
    if (U.screen !== "board" || !$("#world")) return;
    const b = board();
    $("#frames").innerHTML = b.cards.filter((c) => c.kind === "frame").map(frameHTML).join("");
    $("#cards").innerHTML = b.cards.filter((c) => c.kind !== "frame").map(cardHTML).join("");
    b.cards.forEach((c) => delete c.flash);
    measure();
    drawWires();
    applyView();
    renderBanner();
  }
  function measure() {
    const b = board();
    $$("#cards .card").forEach((el) => { const c = cardOf(el.dataset.id); if (!c) return; SZ[c.id] = { w: el.offsetWidth, h: el.offsetHeight }; c.mh = el.offsetHeight; });
    b.cards.filter((c) => c.kind === "frame").forEach((f) => (SZ[f.id] = { w: f.w, h: f.h }));
  }
  const rectOf = (c) => ({ x: c.x, y: c.y, w: c.kind === "frame" ? c.w : SZ[c.id]?.w ?? c.w, h: c.kind === "frame" ? c.h : SZ[c.id]?.h ?? c.mh ?? 120 });
  function edgePt(r, tx, ty, pad = 7) {
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2, dx = tx - cx, dy = ty - cy;
    if (!dx && !dy) return { x: cx, y: cy };
    const s = Math.min((r.w / 2 + pad) / Math.abs(dx || 1e-9), (r.h / 2 + pad) / Math.abs(dy || 1e-9));
    return { x: cx + dx * s, y: cy + dy * s };
  }
  const center = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
  function seg(ra, rb) { const ca = center(ra), cb = center(rb); return [edgePt(ra, cb.x, cb.y), edgePt(rb, ca.x, ca.y, 9)]; }
  function drawWires() {
    const b = board(); const svg = $("#wires"); if (!svg) return;
    let s = `<defs><marker id="ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="ah" d="M0,1 L9,5 L0,9 z"/></marker><marker id="ahs" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="ah-sel" d="M0,1 L9,5 L0,9 z"/></marker><marker id="aht" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="ah-temp" d="M0,1 L9,5 L0,9 z"/></marker></defs>`;
    let L = "";
    b.cards.forEach((c) => {
      if (c.from) { const p = cardOf(c.from); if (p) { const [p1, p2] = seg(rectOf(p), rectOf(c)); s += `<path class="w-part" d="M${p1.x},${p1.y} L${p2.x},${p2.y}"/>`; } }
      if (c.kind === "loci") c.about.forEach((id) => { const p = cardOf(id); if (p) { const [p1, p2] = seg(rectOf(c), rectOf(p)); s += `<path class="w-loci" d="M${p1.x},${p1.y} L${p2.x},${p2.y}"/>`; } });
      if (c.madeFrom) c.madeFrom.forEach((id) => { const p = cardOf(id); if (p) { const [p1, p2] = seg(rectOf(p), rectOf(c)); s += `<path class="w-made" d="M${p1.x},${p1.y} L${p2.x},${p2.y}" marker-end="url(#ah)"/>`; } });
    });
    b.arrows.forEach((a) => {
      const A = cardOf(a.a), B = cardOf(a.b); if (!A || !B) return;
      const [p1, p2] = seg(rectOf(A), rectOf(B)); const sel = U.sel.has(a.id);
      const d = `M${p1.x},${p1.y} L${p2.x},${p2.y}`;
      s += `<path class="w${sel ? " sel" : ""}" d="${d}" marker-end="url(#${sel ? "ahs" : "ah"})"/><path class="w-hit" data-wire="${a.id}" d="${d}"/>`;
      const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
      const cov = U.recall && !U.rv[a.id]; const shown = U.recall && U.rv[a.id] === "shown";
      L += `<button class="alabel${sel ? " sel" : ""}${a.verb ? "" : " empty"}${cov ? " cv" : ""}" data-wire="${a.id}" style="left:${mx}px;top:${my}px">${esc(a.verb || "add a word")}${a.why ? `<span class="why why-c">${esc(a.why)}</span>` : ""}${shown ? `<span class="rmark"><span role="button" tabindex="0" class="y" data-act="rmark" data-c="${a.id}" data-v="y" style="all:unset;cursor:pointer;color:var(--ok);font-weight:600">✓</span> <span role="button" tabindex="0" data-act="rmark" data-c="${a.id}" data-v="n" style="all:unset;cursor:pointer;color:var(--warn);font-weight:600">Not yet</span></span>` : ""}${U.recall && (U.rv[a.id] === "y" || U.rv[a.id] === "n") ? ` <span style="color:${U.rv[a.id] === "y" ? "var(--ok)" : "var(--warn)"}">${U.rv[a.id] === "y" ? "✓" : "↺"}</span>` : ""}</button>`;
    });
    if (G?.type === "wire") {
      const A = cardOf(G.from); if (A) { const ra = rectOf(A); const p1 = edgePt(ra, G.x, G.y); s += `<path class="w-temp" d="M${p1.x},${p1.y} L${G.x},${G.y}" marker-end="url(#aht)"/>`; }
    }
    svg.innerHTML = s;
    $("#labels").innerHTML = L;
  }

  /* ---------- view ---------- */
  function applyView() {
    const st = $("#stage"), w = $("#world"); if (!st || !w) return;
    const v = V();
    w.style.transform = `translate(${v.x}px,${v.y}px) scale(${v.z})`;
    const g = 22 * v.z;
    st.style.backgroundSize = `${g}px ${g}px`;
    st.style.backgroundPosition = `${v.x}px ${v.y}px`;
    w.classList.toggle("far", v.z < 0.5);
    w.style.setProperty("--inv", String(Math.min(2.6, 0.55 / v.z)));
    w.style.setProperty("--hs", String(clamp(1 / v.z, 1, 3)));
    const ro = $("#zro"); if (ro) ro.textContent = Math.round(v.z * 100) + "%";
    drawMinimap();
    positionSeltb();
  }
  function zoomAt(f, sx, sy) {
    const v = V(); const z = clamp(v.z * f, 0.15, 2.5);
    const st = $("#stage").getBoundingClientRect();
    if (sx == null) { sx = st.width / 2; sy = st.height / 2; }
    v.x = sx - ((sx - v.x) * z) / v.z; v.y = sy - ((sy - v.y) * z) / v.z; v.z = z; v.fit = false;
    applyView(); save();
  }
  function bboxOf(cards) {
    if (!cards.length) return { x: 0, y: 0, w: 800, h: 500 };
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    cards.forEach((c) => { const r = rectOf(c); x1 = Math.min(x1, r.x); y1 = Math.min(y1, r.y - (c.kind === "frame" ? 26 : 0)); x2 = Math.max(x2, r.x + r.w); y2 = Math.max(y2, r.y + r.h); });
    return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
  }
  function fit(anim = true, cards) {
    const st = $("#stage"); if (!st) return;
    const R = st.getBoundingClientRect(); const bb = bboxOf(cards || board().cards);
    const padL = innerWidth < 700 ? 16 : 70, padR = innerWidth < 700 ? 16 : 30, padT = innerWidth < 700 ? 60 : 30, padB = innerWidth < 700 ? 80 : 30;
    const z = clamp(Math.min((R.width - padL - padR) / bb.w, (R.height - padT - padB) / bb.h), 0.15, cards ? 1.1 : 1);
    const v = V();
    const tx = padL + (R.width - padL - padR - bb.w * z) / 2 - bb.x * z, ty = padT + (R.height - padT - padB - bb.h * z) / 2 - bb.y * z;
    v.fit = false;
    if (!anim || matchMedia("(prefers-reduced-motion: reduce)").matches) { Object.assign(v, { x: tx, y: ty, z }); applyView(); save(); return; }
    const from = { ...v }, t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / 320), e = 1 - Math.pow(1 - k, 3); v.x = from.x + (tx - from.x) * e; v.y = from.y + (ty - from.y) * e; v.z = from.z + (z - from.z) * e; applyView(); if (k < 1) requestAnimationFrame(step); else save(); };
    requestAnimationFrame(step);
  }
  function panTo(c) { fit(true, [c]); }
  const toWorld = (cx, cy) => { const R = $("#stage").getBoundingClientRect(), v = V(); return { x: (cx - R.left - v.x) / v.z, y: (cy - R.top - v.y) / v.z }; };
  const toScreen = (x, y) => { const v = V(); return { x: x * v.z + v.x, y: y * v.z + v.y }; };
  function viewCenter() { const R = $("#stage").getBoundingClientRect(); return toWorld(R.left + R.width / 2, R.top + R.height / 2); }

  /* ---------- minimap + board previews ---------- */
  function boardSVG(b, W, H, vp) {
    const cards = b.cards; const bb = bboxOf(cards.map((c) => (b.id === DB.cur ? c : { ...c, w: c.w, mh: c.mh ?? estH(c) })));
    const pad = 20; const sc = Math.min((W - 8) / (bb.w + pad * 2), (H - 8) / (bb.h + pad * 2));
    const ox = (W - (bb.w + pad * 2) * sc) / 2 - (bb.x - pad) * sc, oy = (H - (bb.h + pad * 2) * sc) / 2 - (bb.y - pad) * sc;
    const R = (c) => { const r = b.id === DB.cur ? rectOf(c) : { x: c.x, y: c.y, w: c.w, h: c.kind === "frame" ? c.h : c.mh ?? estH(c) }; return { x: ox + r.x * sc, y: oy + r.y * sc, w: r.w * sc, h: r.h * sc }; };
    let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`;
    cards.filter((c) => c.kind === "frame").forEach((f) => { const r = R(f); s += `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="2" fill="none" stroke="var(--ink-3)" stroke-width=".8" stroke-dasharray="2 2"/>`; });
    b.arrows.forEach((a) => { const A = cards.find((c) => c.id === a.a), B = cards.find((c) => c.id === a.b); if (!A || !B) return; const ra = R(A), rb = R(B); s += `<line x1="${ra.x + ra.w / 2}" y1="${ra.y + ra.h / 2}" x2="${rb.x + rb.w / 2}" y2="${rb.y + rb.h / 2}" stroke="var(--wire)" stroke-width=".8"/>`; });
    cards.filter((c) => c.kind !== "frame").forEach((c) => {
      const r = R(c); const x = c.kind ? null : item(c.ref);
      const fill = c.kind === "goal" ? "var(--accent-soft)" : c.kind === "loci" ? "var(--panel)" : x?.type === "photo" ? IMG[x.img]?.pal : ["lumen", "slide"].includes(x?.type) ? "var(--cover-paper)" : x?.type === "question" ? "var(--pick-soft)" : x?.type === "note" ? "var(--note-paper)" : x?.type === "quote" ? "var(--quote-paper)" : "var(--panel)";
      s += `<rect x="${r.x}" y="${r.y}" width="${Math.max(2, r.w)}" height="${Math.max(2, r.h)}" rx="1.5" fill="${fill}" stroke="var(--line)" stroke-width=".6"/>`;
    });
    if (vp) s += `<rect class="vp" x="${ox + vp.x * sc}" y="${oy + vp.y * sc}" width="${vp.w * sc}" height="${vp.h * sc}" rx="2"/>`;
    return s + "</svg>";
  }
  function estH(c) {
    if (c.kind === "goal") return 120;
    const x = item(c.ref); if (!x) return 100;
    if (x.type === "photo") { const m = IMG[x.img]; return (c.w * m.h) / m.w + 46; }
    if (x.type === "course") return 210; if (x.type === "lumen") return 150; if (x.type === "board") return 170;
    return 60 + Math.ceil(titleOf(x).length / 28) * 21;
  }
  function drawMinimap() {
    const mm = $("#minimap"); if (!mm) return;
    const R = $("#stage").getBoundingClientRect(); const v = V();
    const vp = { x: -v.x / v.z, y: -v.y / v.z, w: R.width / v.z, h: R.height / v.z };
    mm.innerHTML = boardSVG(board(), 180, 112, vp);
  }

  /* ---------- selection toolbar ---------- */
  function positionSeltb() {
    const tb = $("#seltb"); if (!tb) return;
    const b = board();
    const ids = [...U.sel].filter((id) => cardOf(id));
    const arrow = [...U.sel].find((id) => b.arrows.some((a) => a.id === id));
    if (!ids.length || G?.moved || U.recall) { tb.hidden = true; return; }
    const cards = ids.map((id) => cardOf(id));
    const bb = bboxOf(cards); const p = toScreen(bb.x + bb.w / 2, bb.y);
    const one = cards.length === 1 ? cards[0] : null; const x = one && !one.kind ? item(one.ref) : null;
    const contentN = cards.filter(isContent).length;
    let h = "";
    if (one?.kind === "frame") h = `<button class="hi" data-act="make" data-scope="${one.id}">${I.lumen}<span class="lbl-x">Make a Lumen from this frame</span></button><button data-act="rename-frame" data-c="${one.id}">Rename</button><button data-act="rm-sel" aria-label="Remove frame">${I.trash}</button>`;
    else if (one?.kind === "goal") h = `<button data-act="edit" data-c="${one.id}">Edit goal</button>`;
    else if (one?.kind === "loci") h = `<button data-act="rm-sel">${I.trash}<span class="lbl-x">Dismiss</span></button>`;
    else if (one && x) {
      const canUnpack = ["course", "lumen", "video"].includes(x.type) && x.state !== "making";
      h = `<button data-act="inspect" data-c="${one.id}">${I.info}<span class="lbl-x">Open</span></button>
        ${x.type === "lumen" && x.state !== "making" ? `<button data-act="play" data-id="${x.id}">${I.play}<span class="lbl-x">Play</span></button>` : ""}
        ${canUnpack ? `<button data-act="unpack" data-c="${one.id}">${I.unpack}<span class="lbl-x">${b.cards.some((k) => k.from === one.id) ? "Fold" : "Unpack"}</span></button>` : ""}
        ${x.type === "board" ? `<button data-act="open-board" data-id="${x.id}">${I.open}<span class="lbl-x">Open board</span></button>` : ""}
        ${x.type === "question" ? `<button class="hi" data-act="explain-q" data-id="${x.id}">${I.lumen}<span class="lbl-x">Explain…</span></button>` : ""}
        <button data-act="connect" data-c="${one.id}">${I.arrow}<span class="lbl-x">Connect</span></button>
        <button data-act="ask">${I.spark}<span class="lbl-x">Ask Loci</span></button>
        <span class="sep"></span><button data-act="rm-sel" aria-label="Remove from board" title="Remove from board (stays in Commonplace)">${I.trash}</button>`;
    } else if (cards.length > 1) {
      h = `<span class="n">${cards.length} selected</span>
        <button data-act="frame-sel">${I.frame}<span class="lbl-x">Frame</span></button>
        <button data-act="ask">${I.spark}<span class="lbl-x">What connects these?</span></button>
        ${contentN >= 2 ? `<button class="hi" data-act="make" data-scope="sel">${I.lumen}<span class="lbl-x">Make a Lumen</span></button>` : ""}
        <span class="sep"></span><button data-act="rm-sel" aria-label="Remove from board">${I.trash}</button>`;
    }
    if (!h) { tb.hidden = true; return; }
    tb.innerHTML = h; tb.hidden = false;
    const R = $("#stage").getBoundingClientRect();
    const w = tb.offsetWidth;
    tb.style.left = clamp(p.x, w / 2 + 8, R.width - w / 2 - 8) + "px";
    tb.style.top = Math.max(tb.offsetHeight + 8, p.y - 12) + "px";
    void arrow;
  }

  /* ---------- recall banner ---------- */
  function renderBanner() {
    const el = $("#banner"); if (!el) return;
    if (!U.recall) { el.innerHTML = ""; return; }
    const b = board();
    const targets = [...b.cards.filter(coverable).map((c) => c.id), ...b.arrows.filter((a) => a.verb || a.why).map((a) => a.id)];
    const done = targets.filter((id) => U.rv[id] === "y" || U.rv[id] === "n");
    const got = targets.filter((id) => U.rv[id] === "y").length, not = targets.filter((id) => U.rv[id] === "n").length;
    const fin = done.length === targets.length && targets.length;
    el.innerHTML = `<div class="banner" role="status">${fin ? `<span><b>${got} of ${targets.length}.</b> ${not ? `${not} go to <b>To revisit</b> in Loci for ${esc(T[b.place].name)}.` : "All of them. Nice."}</span>`
      : `<span><b>Recall.</b> <span class="long">Your words are covered. Say each one aloud, then tap it to check.</span></span><span class="ct">${done.length} / ${targets.length}</span>`}<button class="btn sm" data-act="recall">${fin ? "Done" : "Stop"}</button></div>`;
  }

  /* ================================================================ pointer + keys */
  let G = null; const ptrs = new Map();
  function bindStage() {
    const st = $("#stage");
    st.addEventListener("pointerdown", onDown);
    st.addEventListener("wheel", onWheel, { passive: false });
    st.addEventListener("dblclick", onDbl);
    st.addEventListener("scroll", () => { st.scrollLeft = 0; st.scrollTop = 0; });
    st.addEventListener("input", (e) => { const ta = e.target.closest("[data-loci]"); if (ta) { const c = cardOf(ta.dataset.loci); if (c) c.yours = ta.value; } });
  }
  function onWheel(e) {
    if (e.target.closest(".drawer, .seltb, .pop, textarea")) return;
    e.preventDefault();
    const R = $("#stage").getBoundingClientRect();
    if (e.ctrlKey || e.metaKey) zoomAt(Math.exp(-e.deltaY * 0.0105), e.clientX - R.left, e.clientY - R.top);
    else { const v = V(); v.x -= e.deltaX; v.y -= e.deltaY; v.fit = false; applyView(); clearTimeout(onWheel.t); onWheel.t = setTimeout(save, 300); }
  }
  function onDown(e) {
    if (e.target.closest(".drawer, .seltb, .palette, .zoombar, .banner, .pop, .minimap")) {
      if (e.target.closest(".minimap")) { minimapJump(e); }
      return;
    }
    closePop();
    const st = $("#stage");
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; G = { type: "pinch", d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, v: { ...V() } }; return; }
    const lbl = e.target.closest(".alabel");
    if (lbl && !e.target.closest("[data-act]") && U.tool !== "hand" && !U.space) {
      const wid = lbl.dataset.wire;
      if (U.recall) { if (!U.rv[wid]) { U.rv[wid] = "shown"; drawWires(); renderBanner(); } return; }
      selectOnly(wid); openArrowPop(wid); return;
    }
    if (e.target.closest("button, textarea, input, [contenteditable='true'], [role='button']")) return;
    if (e.button === 2) return;
    const w = toWorld(e.clientX, e.clientY);
    const hd = e.target.closest("[data-hd]");
    if (hd) { G = { type: "wire", from: hd.dataset.hd, x: w.x, y: w.y, ox: w.x, oy: w.y, moved: true }; drawWires(); return; }
    const fr = e.target.closest("[data-fr]");
    if (fr) { const f = cardOf(fr.dataset.fr); pushHist(); G = { type: "resize", id: f.id, sw: f.w, sh: f.h, sx: w.x, sy: w.y }; return; }
    const wire = e.target.closest("[data-wire]");
    if (wire && U.tool !== "hand" && !U.space) { if (U.recall) { if (!U.rv[wire.dataset.wire]) { U.rv[wire.dataset.wire] = "shown"; drawWires(); renderBanner(); } return; } selectOnly(wire.dataset.wire); openArrowPop(wire.dataset.wire); return; }
    const flEl = e.target.closest("[data-fl]");
    const cardEl = e.target.closest(".card") || (flEl ? flEl.closest(".frame") : null);
    if (e.button === 1 || U.space || U.tool === "hand" || (!cardEl && U.tool === "select" && !e.shiftKey)) {
      if (!cardEl && U.tool === "select" && !e.shiftKey && !U.space && e.button !== 1) G = { type: "pan", sx: e.clientX, sy: e.clientY, v: { ...V() }, clear: true };
      else G = { type: "pan", sx: e.clientX, sy: e.clientY, v: { ...V() } };
      st.classList.add("panning"); return;
    }
    if (!cardEl) {
      if (U.tool === "note" || U.tool === "question") { G = { type: "tap-create", kind: U.tool, x: w.x, y: w.y }; return; }
      if (U.tool === "frame") { G = { type: "frame", sx: w.x, sy: w.y, x: w.x, y: w.y }; return; }
      if (U.tool === "arrow") { U.wire = null; drawWorld(); return; }
      G = { type: "marquee", sx: w.x, sy: w.y, x: w.x, y: w.y, add: e.shiftKey }; return;
    }
    const id = cardEl.dataset.id; const c = cardOf(id);
    if (U.recall && coverable(c) && !U.rv[id]) { U.rv[id] = "shown"; drawWorld(); return; }
    if (U.tool === "arrow") {
      if (!U.wire) { U.wire = { from: id }; drawWorld(); toast("Now tap the card it connects to."); }
      else if (U.wire.from !== id) { const from = U.wire.from; U.wire = null; makeArrow(from, id); }
      return;
    }
    if (e.shiftKey) { U.sel.has(id) ? U.sel.delete(id) : U.sel.add(id); refreshSel(); return; }
    if (!U.sel.has(id)) { U.sel.clear(); U.sel.add(id); refreshSel(); }
    const ids = new Set([...U.sel].filter((s) => cardOf(s)));
    [...ids].forEach((s) => { const k = cardOf(s); if (k.kind === "frame") membersOf(k).forEach((m) => ids.add(m.id)); });
    const start = {}; ids.forEach((s) => { const k = cardOf(s); start[s] = { x: k.x, y: k.y }; });
    G = { type: "drag", ids: [...ids], start, sx: w.x, sy: w.y, moved: false, id };
  }
  function membersOf(f) { return board().cards.filter((c) => c.kind !== "frame" && (() => { const r = rectOf(c), m = center(r); return m.x > f.x && m.x < f.x + f.w && m.y > f.y && m.y < f.y + f.h; })()); }
  window.addEventListener("pointermove", (e) => {
    if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (PL) return placeMove(e);
    if (!G) return;
    if (G.type === "pinch" && ptrs.size === 2) {
      const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const R = $("#stage").getBoundingClientRect(); const v = V(); const z = clamp(G.v.z * (d / G.d), 0.15, 2.5);
      const ox = G.mx - R.left, oy = G.my - R.top;
      v.z = z; v.x = mx - R.left - ((ox - G.v.x) * z) / G.v.z; v.y = my - R.top - ((oy - G.v.y) * z) / G.v.z; v.fit = false; applyView(); return;
    }
    if (G.type === "pan") { const v = V(); if (Math.hypot(e.clientX - G.sx, e.clientY - G.sy) > 3) G.moved = true; v.x = G.v.x + e.clientX - G.sx; v.y = G.v.y + e.clientY - G.sy; v.fit = false; applyView(); return; }
    const w = toWorld(e.clientX, e.clientY);
    if (G.type === "drag") {
      const dx = w.x - G.sx, dy = w.y - G.sy;
      if (!G.moved && Math.hypot(dx, dy) * V().z < 4) return;
      if (!G.moved) { pushHist(); G.moved = true; $("#seltb").hidden = true; G.ids.forEach((id) => $(`[data-id="${id}"]`)?.classList.add("lifted")); }
      G.ids.forEach((id) => { const c = cardOf(id), s = G.start[id]; c.x = Math.round(s.x + dx); c.y = Math.round(s.y + dy); const el = $(`#world [data-id="${id}"]`); if (el) { el.style.left = c.x + "px"; el.style.top = c.y + "px"; } });
      drawWires(); return;
    }
    if (G.type === "wire") {
      G.x = w.x; G.y = w.y;
      $$(".card.wire-over").forEach((el) => el.classList.remove("wire-over"));
      const over = document.elementFromPoint(e.clientX, e.clientY)?.closest(".card"); if (over && over.dataset.id !== G.from) over.classList.add("wire-over");
      drawWires(); return;
    }
    if (G.type === "resize") { const f = cardOf(G.id); f.w = Math.max(160, Math.round(G.sw + w.x - G.sx)); f.h = Math.max(120, Math.round(G.sh + w.y - G.sy)); const el = $(`.frame[data-id="${f.id}"]`); el.style.width = f.w + "px"; el.style.height = f.h + "px"; SZ[f.id] = { w: f.w, h: f.h }; return; }
    if (G.type === "marquee" || G.type === "frame") {
      G.x = w.x; G.y = w.y; const m = $("#marquee"); const a = toScreen(Math.min(G.sx, G.x), Math.min(G.sy, G.y)), v = V();
      m.hidden = false; Object.assign(m.style, { left: a.x + "px", top: a.y + "px", width: Math.abs(G.x - G.sx) * v.z + "px", height: Math.abs(G.y - G.sy) * v.z + "px" }); return;
    }
  });
  const endPtr = (e) => {
    ptrs.delete(e.pointerId);
    if (PL) return placeEnd(e);
    if (!G) return;
    const g = G; G = null;
    $("#stage")?.classList.remove("panning");
    if (g.type === "pinch") { save(); return; }
    if (g.type === "pan") { save(); if (g.clear && !g.moved && (U.sel.size || U.wire)) { U.sel.clear(); U.wire = null; drawWorld(); } return; }
    if (g.type === "drag") { if (g.moved) { save(); drawWorld(); } else refreshSel(); return; }
    if (g.type === "resize") { save(); drawWorld(); return; }
    if (g.type === "wire") {
      $$(".card.wire-over").forEach((el) => el.classList.remove("wire-over"));
      const over = document.elementFromPoint(e.clientX, e.clientY)?.closest(".card");
      if (over && over.dataset.id !== g.from) makeArrow(g.from, over.dataset.id);
      else { const el = document.elementFromPoint(e.clientX, e.clientY); const empty = el?.closest("#stage") && !el.closest(".card, .drawer, .palette, .zoombar, .minimap"); if (empty && Math.hypot(g.x - g.ox, g.y - g.oy) > 60) { newNoteAt(g.x, g.y - 20, "note", g.from); toast("A new note, connected. Write what follows."); } else drawWires(); }
      return;
    }
    if (g.type === "tap-create") { newNoteAt(g.x - 10, g.y - 14, g.kind); return; }
    if (g.type === "frame") {
      $("#marquee").hidden = true;
      let x = Math.min(g.sx, g.x), y = Math.min(g.sy, g.y), w = Math.abs(g.x - g.sx), h = Math.abs(g.y - g.sy);
      if (w < 40 || h < 40) { w = 480; h = 320; x = g.sx - 20; y = g.sy - 20; }
      const id = uid("f");
      mutate(() => { board().cards.unshift({ id, kind: "frame", label: "New frame", x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) }); U.sel = new Set([id]); U.tool = "select"; });
      syncTools(); setTimeout(() => editFrameLabel(id), 30); return;
    }
    if (g.type === "marquee") {
      $("#marquee").hidden = true;
      const x1 = Math.min(g.sx, g.x), y1 = Math.min(g.sy, g.y), x2 = Math.max(g.sx, g.x), y2 = Math.max(g.sy, g.y);
      if (!g.add) U.sel.clear();
      if (x2 - x1 > 4 || y2 - y1 > 4) board().cards.forEach((c) => { if (c.kind === "frame") return; const r = rectOf(c); if (r.x < x2 && r.x + r.w > x1 && r.y < y2 && r.y + r.h > y1) U.sel.add(c.id); });
      refreshSel(); return;
    }
  };
  window.addEventListener("pointerup", endPtr);
  window.addEventListener("pointercancel", endPtr);
  function refreshSel() {
    $$("#world .card, #world .frame").forEach((el) => el.classList.toggle("sel", U.sel.has(el.dataset.id)));
    drawWires(); positionSeltb();
  }
  function selectOnly(id) { U.sel.clear(); U.sel.add(id); refreshSel(); }
  function minimapJump(e) {
    const mm = $("#minimap"), R = mm.getBoundingClientRect(); const b = board(); const bb = bboxOf(b.cards);
    const pad = 20, W = 180, H = 112; const sc = Math.min((W - 8) / (bb.w + pad * 2), (H - 8) / (bb.h + pad * 2));
    const ox = (W - (bb.w + pad * 2) * sc) / 2 - (bb.x - pad) * sc, oy = (H - (bb.h + pad * 2) * sc) / 2 - (bb.y - pad) * sc;
    const wx = (e.clientX - R.left - ox) / sc, wy = (e.clientY - R.top - oy) / sc;
    const S = $("#stage").getBoundingClientRect(), v = V();
    v.x = S.width / 2 - wx * v.z; v.y = S.height / 2 - wy * v.z; v.fit = false; applyView(); save();
  }
  function onDbl(e) {
    if (e.target.closest(".drawer, .seltb, .palette, .zoombar, .banner, .pop, .minimap, button, textarea")) return;
    if (U.recall) return;
    const fl = e.target.closest("[data-fl]"); if (fl) return editFrameLabel(fl.dataset.fl);
    const cardEl = e.target.closest(".card");
    if (cardEl) {
      const c = cardOf(cardEl.dataset.id);
      if (cardEl.querySelector("[data-edit]")) return startEdit(c.id);
      if (c.ref) { const x = item(c.ref); if (x?.type === "board") return openBoard(x.id); if (x?.type === "lumen" && x.state !== "making") return play(x.id); }
      return inspect(c.id);
    }
    const w = toWorld(e.clientX, e.clientY); newNoteAt(w.x - 20, w.y - 16, "note");
  }
  document.addEventListener("keydown", (e) => {
    const typing = e.target.closest?.("input, textarea, [contenteditable='true']");
    if (e.key === "Escape") {
      if ($(".scrim")) { closeLayer(); return; }
      if (U.guide) { U.guide = false; renderGuide(); renderPbar(); return; }
      if (typing) { e.target.blur(); return; }
      if ($(".pop")) { closePop(); return; }
      if (U.insp) { U.insp = null; renderInsp(); return; }
      if (U.drawer) { U.drawer = false; renderDrawer(); syncTools(); return; }
      if (U.wire) { U.wire = null; drawWorld(); return; }
      if (U.sel.size) { U.sel.clear(); refreshSel(); return; }
      return;
    }
    if (typing || $(".scrim") || U.screen !== "board") return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") { e.preventDefault(); board().cards.forEach((c) => c.kind !== "frame" && U.sel.add(c.id)); refreshSel(); return; }
    if (e.key === " " && !U.space) { U.space = true; $("#stage")?.classList.add("space"); e.preventDefault(); return; }
    if (e.key === "Delete" || e.key === "Backspace") { if (U.sel.size) { e.preventDefault(); removeSel(); } return; }
    const k = e.key.toLowerCase();
    const tools = { v: "select", h: "hand", n: "note", q: "question", a: "arrow", f: "frame" };
    if (tools[k] && !e.ctrlKey && !e.metaKey) { setTool(tools[k]); return; }
    if (e.key === "+" || e.key === "=") { if (e.shiftKey && e.key === "+") { U.drawer = !U.drawer; renderDrawer(); syncTools(); } else zoomAt(1.2); return; }
    if (e.key === "-") { zoomAt(1 / 1.2); return; }
    if (e.key === "0") { fit(); return; }
    if (e.key === "Enter" && U.sel.size === 1) { const c = cardOf([...U.sel][0]); if (c) { e.preventDefault(); c.ref ? inspect(c.id) : c.kind === "goal" ? startEdit(c.id) : null; } }
  });
  document.addEventListener("keyup", (e) => { if (e.key === " ") { U.space = false; $("#stage")?.classList.remove("space"); } });
  function setTool(t) { U.tool = t; U.wire = null; syncTools(); drawWorld(); }
  function syncTools() {
    $$(".palette [data-act='tool']").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.t === U.tool)));
    $(".palette .add")?.setAttribute("aria-pressed", String(U.drawer));
    const st = $("#stage"); if (st) st.dataset.tool = U.tool;
  }

  /* ================================================================ editing */
  function startEdit(cid) {
    const el = $(`#world .card[data-id="${cid}"] [data-edit]`); if (!el) return;
    U.sel = new Set([cid]); refreshSel(); $("#seltb").hidden = true;
    el.contentEditable = "true"; el.focus();
    const r = document.createRange(); r.selectNodeContents(el); r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    const before = el.textContent;
    const done = () => {
      el.removeEventListener("blur", done); el.removeEventListener("keydown", kd);
      el.contentEditable = "false";
      const text = el.textContent.trim();
      const c = cardOf(cid); if (!c) return;
      if (c.kind === "goal") { if (text !== before.trim()) mutate(() => { board().goal = text; }, "Goal saved. Loci reads it for this topic."); else drawWorld(); return; }
      const x = item(c.ref);
      if (!text && c.fresh) { board().cards = board().cards.filter((k) => k.id !== cid); board().arrows = board().arrows.filter((a) => a.a !== cid && a.b !== cid); delete DB.items[x.id]; save(); U.sel.clear(); drawWorld(); return; }
      if (text && text !== before.trim()) {
        const fresh = c.fresh;
        mutate(() => { x.text = text; x.date = TODAY; delete c.fresh; U.edited = x.id; }, fresh ? `Saved to Commonplace · ${x.type === "question" ? "Questions" : "Notes"}` : `Changed everywhere: in Commonplace${boardsWith(x.id).length > 1 ? ` and on ${boardsWith(x.id).length - 1} other board` : ""}.`);
      } else { delete c.fresh; drawWorld(); }
    };
    const kd = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); el.blur(); } };
    el.addEventListener("blur", done); el.addEventListener("keydown", kd);
  }
  function newNoteAt(x, y, kind, connectFrom) {
    const itid = uid(kind === "question" ? "qn" : "n"), cid = uid("c");
    mutate(() => {
      DB.items[itid] = { id: itid, type: kind, text: "", topics: [board().place], date: TODAY };
      board().cards.push({ id: cid, ref: itid, x: Math.round(x), y: Math.round(y), w: 230, fresh: true });
      if (connectFrom) board().arrows.push({ id: uid("a"), a: connectFrom, b: cid, verb: "leads to", why: "" });
      U.sel = new Set([cid]);
      if (U.tool !== "select") U.tool = "select";
    });
    syncTools();
    setTimeout(() => startEdit(cid), 20);
  }
  function editFrameLabel(fid) {
    const el = $(`[data-fl="${fid}"]`); if (!el) return;
    el.contentEditable = "true"; el.focus(); const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    const done = () => { el.removeEventListener("blur", done); el.contentEditable = "false"; const t = el.textContent.trim() || "Frame"; const f = cardOf(fid); if (f && t !== f.label) mutate(() => { f.label = t; }); };
    el.addEventListener("blur", done); el.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); el.blur(); } });
  }
  function editTitle() {
    const h = $("#bd-h1"); h.contentEditable = "true"; h.focus(); const r = document.createRange(); r.selectNodeContents(h); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    const done = () => { h.removeEventListener("blur", done); h.contentEditable = "false"; const t = h.textContent.trim(); if (t && t !== board().title) mutate(() => { board().title = t; }, "Renamed. It's renamed in Commonplace too."); else h.textContent = board().title; };
    h.addEventListener("blur", done); h.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); h.blur(); } });
  }
  document.addEventListener("dblclick", (e) => { if (e.target.closest("#bd-h1")) editTitle(); });

  /* ================================================================ arrows */
  function makeArrow(a, b) {
    const B = board();
    if (B.arrows.some((x) => (x.a === a && x.b === b))) { toast("Those two are already connected."); drawWorld(); return; }
    const id = uid("a");
    const bi = item(cardOf(b)?.ref);
    if (U.arrowOnce) { U.arrowOnce = false; U.tool = "select"; syncTools(); }
    mutate(() => { B.arrows.push({ id, a, b, verb: bi?.type === "question" ? "raises" : "", why: "" }); U.sel = new Set([id]); });
    setTimeout(() => openArrowPop(id, true), 10);
  }
  function openArrowPop(id, fresh) {
    closePop();
    const B = board(); const a = B.arrows.find((x) => x.id === id); if (!a) return;
    const A = item(cardOf(a.a)?.ref) || { title: "Goal" }, Bt = item(cardOf(a.b)?.ref) || { title: "Goal" };
    const lbl = $(`.alabel[data-wire="${id}"]`); const st = $("#stage"); if (!lbl || !st) return;
    const R = st.getBoundingClientRect(), L = lbl.getBoundingClientRect();
    const p = document.createElement("div"); p.className = "pop"; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", "Arrow");
    p.innerHTML = `<h4>${esc(short(titleOf(A), 34))} → ${esc(short(titleOf(Bt), 34))}</h4>
      <div class="verbs">${VERBS.map((v) => `<button class="chip" data-verb="${v}" aria-pressed="${a.verb === v}">${v}</button>`).join("")}</div>
      <input id="why" placeholder="Why? (one line, in your words)" value="${esc(a.why)}" aria-label="Why are these connected?">
      <p class="hint">Saying why is the part that makes it stick. It stays on the arrow, Recall covers it, and a Lumen made from this board uses it.</p>
      <div class="row"><button class="btn sm quiet" data-pact="del">${I.trash} Delete arrow</button><button class="btn sm primary" data-pact="ok">Done</button></div>`;
    st.appendChild(p);
    const pw = p.offsetWidth, ph = p.offsetHeight;
    let left = L.left - R.left + L.width / 2 - pw / 2, top = L.bottom - R.top + 10;
    if (top + ph > R.height - 10) top = L.top - R.top - ph - 10;
    p.style.left = clamp(left, 8, R.width - pw - 8) + "px"; p.style.top = clamp(top, 8, R.height - ph - 8) + "px";
    const why = p.querySelector("#why");
    if (fresh) setTimeout(() => (innerWidth >= 700 ? why.focus() : null), 30);
    p.addEventListener("click", (e) => {
      const v = e.target.closest("[data-verb]");
      if (v) { a.verb = a.verb === v.dataset.verb ? "" : v.dataset.verb; save(); $$(".chip", p).forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.verb === a.verb))); drawWires(); return; }
      const act = e.target.closest("[data-pact]")?.dataset.pact;
      if (act === "del") { closePop(); mutate(() => { B.arrows = B.arrows.filter((x) => x.id !== id); U.sel.delete(id); }, "Arrow deleted."); }
      if (act === "ok") closePop();
    });
    why.addEventListener("input", () => { a.why = why.value; save(); drawWires(); });
    why.addEventListener("keydown", (e) => { if (e.key === "Enter") closePop(); });
  }
  function closePop() { const p = $(".pop"); if (p) { p.remove(); } }

  /* ================================================================ placing from the drawer */
  let PL = null;
  function libraryList() {
    const b = board(); const q = U.dq.trim().toLowerCase();
    const here = (x) => U.dscope === "all" || (x.topics || []).some((t) => under(t, b.place) || under(b.place, t)) || x.id === b.id;
    const match = (x) => !q || [titleOf(x), x.caption, x.kind, x.site, x.creator, ...(x.topics || []).map((t) => T[t]?.name)].join(" ").toLowerCase().includes(q);
    const all = Object.values(DB.items).filter((x) => x.id !== b.id && !(x.type === "lumen" && x.course) && x.state !== "making");
    if (U.dtab === "loci") return TOPICS.filter((t) => t.id !== "you").map((t) => item("topic:" + t.id)).filter((x) => match(x) && (U.dscope === "all" || under(x.topic.id, areaOf(b.place).id)));
    const types = U.dtab === "learn" ? ["lumen", "course"] : ["photo", "note", "quote", "question", "link", "video", "book", "board"];
    return all.filter((x) => types.includes(x.type) && here(x) && match(x));
  }
  function rowHTML(x) {
    const on = board().cards.some((c) => c.ref === x.id);
    let th;
    if (x.type === "photo") th = `<span class="th"><img src="${IMG[x.img].src}" alt=""></span>`;
    else if (x.type === "note") th = `<span class="th note">${esc(short(x.text, 40))}</span>`;
    else if (x.type === "question") th = `<span class="th q">?</span>`;
    else if (x.type === "quote") th = `<span class="th note" style="font-style:italic">“${esc(short(x.text, 34))}”</span>`;
    else if (x.type === "lumen" || x.type === "video" || x.type === "book") th = `<span class="th dark">${x.type === "book" ? "B" : "▶"}</span>`;
    else if (x.type === "course") th = `<span class="th dark">${x.parts.length}</span>`;
    else if (x.type === "board") th = `<span class="th">${boardSVG(x, 44, 44)}</span>`;
    else if (x.type === "topic") th = `<span class="th tp"><span style="width:20px;height:20px;border-radius:50%;${x.topic.st === 2 ? "background:var(--status-3)" : `box-shadow:inset 0 0 0 3px var(${x.topic.st === 1 ? "--status-2" : "--status-1"})`}"></span></span>`;
    else th = `<span class="th">${esc((x.site || "L")[0].toUpperCase())}</span>`;
    const meta = x.type === "topic" ? `${ST[x.topic.st ?? 0]} · ${chain(x.topic.id).slice(0, -1).map((t) => t.name).join(" › ") || "Area"}` : `${typeWord(x)}${x.topics?.[0] ? " · " + T[x.topics[0]].name : ""}${x.type === "lumen" ? ` · ${x.min} min` : ""}`;
    return `<button class="row-it" data-place="${esc(x.id)}" title="${on ? "On this board. Tap to find it." : "Drag onto the board, or tap to place"}">${th}<span><b>${esc(short(titleOf(x), 60))}</b><small>${esc(meta)}</small></span>${on ? '<span class="tag">On board</span>' : ""}</button>`;
  }
  function renderDrawer() {
    const d = $("#drawer"); if (!d) return;
    d.classList.toggle("open", U.drawer); $("#stage")?.classList.toggle("dr-open", U.drawer);
    if (!U.drawer) { d.innerHTML = ""; return; }
    const b = board(); const list = libraryList();
    const groups = {};
    list.forEach((x) => { const g = U.dtab === "loci" ? areaOf(x.topic.id)?.name || "Areas" : x.type === "photo" ? "Photos" : ["note", "quote", "question"].includes(x.type) ? "Notes, quotes and questions" : ["link", "video", "book"].includes(x.type) ? "Sources" : x.type === "board" ? "Boards" : x.type === "course" ? "Courses" : "Lumens"; (groups[g] ||= []).push(x); });
    const keepFocus = document.activeElement?.id === "dq"; const keepScroll = d.querySelector(".db")?.scrollTop || 0;
    d.innerHTML = `<div class="dh"><h2>Add to this board</h2><button class="icon-btn" data-act="drawer" aria-label="Close">${I.close}</button></div>
      <div class="tabs" role="tablist">${[["cp", "Commonplace"], ["learn", "Learn"], ["loci", "Loci"]].map(([k, l]) => `<button role="tab" aria-selected="${U.dtab === k}" data-act="dtab" data-t="${k}">${l}</button>`).join("")}</div>
      <div class="db">
        <label class="search">${I.search}<input id="dq" placeholder="Search ${U.dtab === "loci" ? "your map" : "your library"}…" value="${esc(U.dq)}" aria-label="Search"></label>
        <div class="scope"><button class="chip" data-act="dscope" data-v="here" aria-pressed="${U.dscope === "here"}">${U.dtab === "loci" ? esc(areaOf(b.place).name) : "Near " + esc(T[b.place].name)}</button><button class="chip" data-act="dscope" data-v="all" aria-pressed="${U.dscope === "all"}">Everything</button></div>
        ${U.dtab === "cp" ? `<form class="paste" data-form="paste"><input name="url" placeholder="Paste a link to save and place it" aria-label="Paste a link"><button class="btn sm">Add</button></form>` : ""}
        <div class="list">${Object.entries(groups).map(([g, xs]) => `<h3>${esc(g)}</h3>${xs.map(rowHTML).join("")}`).join("") || `<p class="dnote">Nothing here${U.dq ? ` for “${esc(U.dq)}”` : ""}. Try Everything.</p>`}</div>
        <p class="dnote">${U.dtab === "learn" ? "A course unpacks into its parts on the board, and a Lumen into its slides." : U.dtab === "loci" ? "A topic on a board is the place on your map: its status and Lumens come with it." : "Everything you place is the item itself, not a copy. It stays in Commonplace, and it can be on many boards at once."}</p>
      </div>`;
    const q = $("#dq"); q.addEventListener("input", () => { U.dq = q.value; renderDrawer(); });
    if (keepFocus) { const n = $("#dq"); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }
    d.querySelector(".db").scrollTop = keepScroll;
    $$("[data-place]", d).forEach((el) => el.addEventListener("pointerdown", placeDown));
    $("[data-form='paste']", d)?.addEventListener("submit", (e) => { e.preventDefault(); pasteLink(new FormData(e.target).get("url")); });
  }
  function placeDown(e) {
    if (e.button && e.button !== 0) return;
    if (e.pointerType !== "touch") e.preventDefault();
    PL = { touch: e.pointerType === "touch", ref: e.currentTarget.dataset.place, sx: e.clientX, sy: e.clientY, moved: false, ghost: null, pid: e.pointerId };
  }
  function placeMove(e) {
    if (PL.touch) { if (Math.hypot(e.clientX - PL.sx, e.clientY - PL.sy) > 8) PL.cancel = true; return; }
    if (!PL.moved && Math.hypot(e.clientX - PL.sx, e.clientY - PL.sy) < 6) return;
    if (!PL.moved) {
      PL.moved = true; const x = item(PL.ref);
      const g = document.createElement("div"); g.className = "ghost";
      g.innerHTML = `${x.type === "photo" ? `<img src="${IMG[x.img].src}" alt="">` : ""}<span>${esc(short(titleOf(x), 40))}</span>`;
      document.body.appendChild(g); PL.ghost = g;
      if (innerWidth < 700) { U.drawer = false; renderDrawer(); syncTools(); }
    }
    PL.ghost.style.left = e.clientX + "px"; PL.ghost.style.top = e.clientY + "px";
  }
  function placeEnd(e) {
    const p = PL; PL = null; p.ghost?.remove();
    if (e.type === "pointercancel" || p.cancel) return;
    if (!p.moved) { placeRef(p.ref); if (innerWidth < 700) { U.drawer = false; renderDrawer(); syncTools(); } return; }
    const over = document.elementFromPoint(e.clientX, e.clientY);
    if (over?.closest("#stage") && !over.closest(".drawer, .palette")) { const w = toWorld(e.clientX, e.clientY); placeRef(p.ref, w.x, w.y); }
  }
  function placeRef(ref, x, y) {
    const b = board(); const exist = b.cards.find((c) => c.ref === ref);
    if (exist) { U.sel = new Set([exist.id]); exist.flash = true; drawWorld(); panTo(exist); toast("Already on this board."); return; }
    const it = item(ref);
    const w = it.type === "photo" ? (IMG[it.img].h > IMG[it.img].w ? 180 : 240) : it.type === "topic" ? 230 : it.type === "lumen" ? 190 : it.type === "board" ? 200 : 230;
    if (x == null) { const c = viewCenter(); ({ x, y } = freeSpot(c.x - w / 2 + (U.drawer && innerWidth >= 700 ? 170 / V().z : 0), c.y - 80, w, estH({ ref, w }))); } else { x -= w / 2; y -= 30; }
    const cid = uid("c");
    mutate(() => { b.cards.push({ id: cid, ref, x: Math.round(x), y: Math.round(y), w, flash: true }); U.sel = new Set([cid]); }, `Placed “${short(titleOf(it), 34)}”.`);
  }
  function freeSpot(x0, y0, w, h) {
    // the nearest place to (x0, y0), spiralling out, where a w×h card overlaps no other card
    const rs = board().cards.filter((c) => c.kind !== "frame").map(rectOf);
    const free = (x, y) => rs.every((r) => x + w + 16 < r.x || x > r.x + r.w + 16 || y + h + 16 < r.y || y > r.y + r.h + 16);
    for (let ring = 0; ring < 30; ring++) for (let k = 0; k < Math.max(1, ring * 8); k++) {
      const a = (k / Math.max(1, ring * 8)) * Math.PI * 2, x = x0 + Math.cos(a) * ring * 60, y = y0 + Math.sin(a) * ring * 45;
      if (free(x, y)) return { x, y };
    }
    return { x: x0, y: y0 };
  }
  function pasteLink(url) {
    url = String(url || "").trim(); if (!url) return;
    let host = "link"; try { host = new URL(/^https?:/.test(url) ? url : "https://" + url).hostname.replace(/^www\./, ""); } catch { /* keep "link" */ }
    const slug = url.split(/[/?#]/).filter(Boolean).pop() || host;
    const title = /\./.test(slug) && slug === host ? `A page on ${host}` : slug.replace(/[-_]+/g, " ").replace(/\.\w+$/, "").replace(/^\w/, (c) => c.toUpperCase());
    const id = uid("l");
    DB.items[id] = { id, type: "link", title: short(title, 70), site: host, desc: "Saved from a board. Loci fills in the title and summary when it reads the page.", topics: [board().place], date: TODAY, url };
    placeRef(id);
    toast(`Saved to Commonplace · Sources, and placed.`);
  }

  /* ================================================================ unpack */
  function unpack(cid) {
    const b = board(); const c = cardOf(cid); const x = item(c.ref);
    const kids = b.cards.filter((k) => k.from === cid);
    if (kids.length) {
      const keep = kids.filter((k) => b.arrows.some((a) => a.a === k.id || a.b === k.id) || Math.hypot(k.x - k.ox, k.y - k.oy) > 30);
      mutate(() => { const gone = new Set(kids.filter((k) => !keep.includes(k)).map((k) => k.id)); b.cards = b.cards.filter((k) => !gone.has(k.id)); keep.forEach((k) => delete k.from); [...gone].forEach((g) => U.sel.delete(g)); },
        keep.length ? `Folded. ${keep.length} stay because you moved or connected them.` : "Folded back.");
      return;
    }
    const refs = x.type === "course" ? x.parts : x.type === "lumen" ? x.slides.map((_, i) => `${x.id}#${i}`) : x.moments.map((_, i) => `${x.id}@${i}`);
    const r = rectOf(c); const w = x.type === "lumen" ? 180 : x.type === "course" ? 176 : 190, gap = 18;
    const total = refs.length * (w + gap) - gap; const x0 = r.x + r.w / 2 - total / 2;
    mutate(() => {
      refs.forEach((ref, i) => {
        if (b.cards.some((k) => k.ref === ref)) return;
        const nx = Math.round(x0 + i * (w + gap)), ny = Math.round(r.y + r.h + 70);
        b.cards.push({ id: uid("c"), ref, x: nx, y: ny, w, from: cid, ox: nx, oy: ny, flash: true });
      });
    }, x.type === "course" ? `${refs.length} parts. Each is a Lumen: drag one out, connect it, play it.` : x.type === "lumen" ? "The slides, as cards. Drag one next to your own picture." : "The saved moments, as cards.");
    setTimeout(() => { const ks = board().cards.filter((k) => k.from === cid); if (ks.length) fit(true, [cardOf(cid), ...ks]); }, 40);
  }

  /* ================================================================ removing */
  function removeSel() {
    const b = board(); const ids = new Set([...U.sel]);
    const arrowsOnly = [...ids].every((id) => b.arrows.some((a) => a.id === id));
    const n = [...ids].filter((id) => cardOf(id)?.ref).length;
    mutate(() => {
      b.cards = b.cards.filter((c) => !ids.has(c.id));
      b.arrows = b.arrows.filter((a) => !ids.has(a.id) && !ids.has(a.a) && !ids.has(a.b));
      b.cards.forEach((c) => { if (c.from && ids.has(c.from)) delete c.from; if (c.about) c.about = c.about.filter((x) => !ids.has(x)); });
      U.sel.clear();
    }, arrowsOnly ? "Arrow deleted." : n ? `Removed from this board. ${n === 1 ? "It's" : "They're"} still in Commonplace.` : "Removed.");
  }

  /* ================================================================ Ask Loci (you first, then compare) */
  function askLoci() {
    const b = board();
    let ids = [...U.sel].filter((id) => isContent(cardOf(id)));
    if (!ids.length) { toast("Select a few cards first, then Ask Loci what connects them."); setTool("select"); return; }
    const xs = ids.map((id) => item(cardOf(id).ref));
    const tps = new Set(xs.flatMap((x) => x.topics || []));
    let text, extra = "", topic = null;
    if (["wind", "stack"].some((t) => tps.has(t))) {
      text = "Warm air rises and leaves high; cooler air is pulled in low. That's the stack effect, and it's why the tower still works on a still day.";
      extra = "You showed you know the stack effect (a check on 21 Oct). What this board adds: the court can be the cool source the tower pulls from.";
      if (!b.cards.some((c) => c.ref === "topic:stack")) topic = "stack";
    } else if (["shade", "court"].some((t) => tps.has(t))) {
      text = "Each one keeps sun off a surface people touch or stand on. In Dubai the June sun at noon is almost overhead (about 88°), so only shade from above works at that hour: an arcade, a canopy, trees.";
      extra = "That also answers part of your question about the court's depth: no ratio of walls shades the floor at noon.";
      if (!b.cards.some((c) => c.ref === "topic:shade")) topic = "shade";
    } else if (tps.has("evap")) {
      text = "Evaporation cools only as far as the air is dry. Dubai's August air is humid, so a wet surface gives a degree or two at best.";
      extra = "This is one you marked to revisit (22 Oct).";
    } else {
      text = xs.length > 1 ? `These share ${tps.size ? [...tps].map((t) => T[t]?.name).filter(Boolean).slice(0, 2).join(" and ") : "no topic yet"}. I'd need your arrows to say more: what does one do for the other?` : "On its own it doesn't say much yet. Connect it to something, and say why.";
    }
    const bb = bboxOf(ids.map((id) => cardOf(id)));
    const cid = uid("loci");
    const spot = freeSpot(bb.x + bb.w + 60, bb.y, 300, 260);
    mutate(() => { b.cards.push({ id: cid, kind: "loci", state: "ask", about: ids, text, extra, topic, x: Math.round(spot.x), y: Math.round(spot.y), w: 300, flash: true }); U.sel = new Set([cid]); }, null);
    setTimeout(() => { const ta = $(`[data-loci="${cid}"]`); if (ta && innerWidth >= 700) ta.focus(); panTo(cardOf(cid)); }, 40);
  }

  /* ================================================================ inspector */
  function inspect(cid) { U.insp = cid; renderInsp(); }
  function renderInsp() {
    const el = $("#insp") || $("#cp-insp"); if (!el) return;
    const ref = U.insp && (U.screen === "board" ? cardOf(U.insp)?.ref : U.insp);
    el.classList.toggle("open", !!ref);
    if (!ref) { el.innerHTML = ""; return; }
    const x = item(ref); if (!x) { el.innerHTML = ""; return; }
    const on = boardsWith(ref);
    const tps = (x.topics || []).map((t) => T[t]).filter(Boolean);
    let body = "";
    if (x.type === "photo") body = `<div class="big"><img src="${IMG[x.img].src}" alt="${esc(x.title)}"></div>${x.caption ? `<p class="lead">${esc(x.caption)}</p>` : ""}<p class="meta">${esc(x.kind)}${x.album ? " · " + esc(x.album) : ""} · ${esc(x.date)}${x.notes ? ` · ${x.notes} notes on details` : ""}</p>`;
    else if (x.type === "note" || x.type === "question") body = `<textarea id="insp-text" aria-label="${x.type === "note" ? "Note" : "Question"}">${esc(x.text)}</textarea>`;
    else if (x.type === "quote") body = `<p class="lead"><i>“${esc(x.text)}”</i></p><p class="meta">${esc(x.src)}</p>`;
    else if (x.type === "link") body = `<p class="lead">${esc(x.title)}</p><p class="meta">${esc(x.site)}${x.desc ? " · " + esc(x.desc) : ""}</p>`;
    else if (x.type === "video") body = `<p class="meta">${esc(x.creator)} · ${x.dur}</p><div><h3>Saved moments</h3><ol class="slist">${x.moments.map((m) => `<li><span><b style="font-weight:500">${m.t}</b> ${esc(m.text)}</span></li>`).join("")}</ol></div>`;
    else if (x.type === "book") body = `<p class="meta">${esc(x.creator)} · Reading</p>`;
    else if (x.type === "lumen") body = `<p class="meta">${x.min} min · ${x.slides.length} slides${x.watched ? " · watched" : ""}${x.course ? ` · Part ${x.part} of ${DB.items[x.course].title}` : ""}${x.from ? " · made from a board" : ""}</p><ol class="slist">${x.slides.map((s) => `<li>${esc(s.t)}</li>`).join("")}</ol><div class="acts"><button class="btn primary" data-act="play" data-id="${x.id}">${I.play} Play</button></div>`;
    else if (x.type === "course") body = `<ol class="slist">${x.parts.map((p) => `<li>${esc(DB.items[p].title)}${DB.items[p].watched ? " ✓" : ""}</li>`).join("")}</ol>`;
    else if (x.type === "topic") body = `<p class="meta">${ST[x.topic.st ?? 0]} · ${chain(x.topic.id).map((t) => esc(t.name)).join(" › ")}</p><div class="acts"><button class="btn" data-act="loci-at" data-t="${x.topic.id}">Open in Loci</button></div>`;
    else if (x.type === "board") body = `<span class="big" style="display:block;background:var(--board)">${boardSVG(x, 340, 200)}</span><p class="lead">${esc(x.goal)}</p><div class="acts"><button class="btn primary" data-act="open-board" data-id="${x.id}">Open board</button></div>`;
    else if (x.type === "slide") body = `<p class="lead">${esc(x.t)}</p><p class="meta">Slide ${x.n + 1} of ${x.of} in “${esc(x.lumen.title)}”</p><div class="acts"><button class="btn" data-act="play" data-id="${x.lumen.id}" data-at="${x.n}">${I.play} Play from here</button></div>`;
    else if (x.type === "moment") body = `<p class="lead">${esc(x.text)}</p><p class="meta">${x.t} in “${esc(x.video.title)}”</p>`;
    const sentences = U.screen === "board" ? board().arrows.filter((a) => a.a === U.insp || a.b === U.insp).map((a) => {
      const A = item(cardOf(a.a)?.ref), B = item(cardOf(a.b)?.ref);
      return `<li>${esc(short(titleOf(A) || "Goal", 44))} <span class="v">${esc(a.verb || "→")}</span> ${esc(short(titleOf(B) || "Goal", 44))}${a.why ? ` <em>because ${esc(a.why.replace(/^\w/, (c) => c.toLowerCase()))}</em>` : ""}</li>`;
    }) : [];
    const real = !["slide", "moment", "topic"].includes(x.type);
    el.innerHTML = `<div class="dh"><div style="flex:1;min-width:0"><span class="kick">${esc(typeWord(x))}</span><h2>${esc(short(titleOf(x), 80))}</h2></div><button class="icon-btn" data-act="insp-close" aria-label="Close">${I.close}</button></div>
      <div class="db"><div class="insp">
        ${body}
        ${real && x.type !== "board" ? `<div class="same">${I.link}<span>${x.type === "note" || x.type === "question" ? "This is the note in Commonplace, not a copy. Change it here and it changes everywhere it appears." : "This is the item in your Commonplace, not a copy. Its notes, topics and picks are the same wherever it's placed."}</span></div>` : ""}
        ${sentences.length ? `<div><h3>On this board</h3><ul class="sent">${sentences.join("")}</ul></div>` : ""}
        ${tps.length ? `<div><h3>On your map</h3><div class="tps">${tps.map((t) => `<span class="tp"><i class="s${t.st ?? 0}"></i>${esc(t.name)}</span>`).join("")}</div></div>` : ""}
        ${real ? `<div><h3>On ${on.length} board${on.length === 1 ? "" : "s"}</h3><div class="ons">${on.map((b) => `<button data-act="open-board" data-id="${b.id}">${I.board}${esc(b.title)}${b.id === DB.cur && U.screen === "board" ? '<span class="here">this board</span>' : ""}</button>`).join("") || '<p class="meta">Not on a board yet.</p>'}</div></div>` : ""}
      </div></div>`;
    const ta = $("#insp-text");
    if (ta) {
      ta.addEventListener("input", () => { x.text = ta.value; save(); if (U.screen === "board") { const t = $(`#world .card[data-id="${U.insp}"] .txt`); if (t) t.textContent = x.text; measure(); drawWires(); } });
      ta.addEventListener("change", () => { U.edited = x.id; toast("Changed everywhere it appears."); });
    }
  }

  /* ================================================================ Make a Lumen */
  function frameOf(c, frames) { const r = rectOf(c), m = center(r); return frames.find((f) => m.x > f.x && m.x < f.x + f.w && m.y > f.y && m.y < f.y + f.h); }
  function buildOutline(scope) {
    const b = board(); const frames = b.cards.filter((c) => c.kind === "frame").sort((p, q) => p.y - q.y || p.x - q.x);
    let pool;
    if (scope === "sel") pool = [...U.sel].map((id) => cardOf(id)).filter(isContent);
    else if (scope && scope !== "all") { const f = cardOf(scope); pool = f ? membersOf(f).filter(isContent) : []; }
    else pool = b.cards.filter(isContent);
    pool = pool.filter((c) => { const x = item(c.ref); return x && x.state !== "making" && !x.from; });
    const qs = pool.filter((c) => item(c.ref).type === "question");
    const main = pool.filter((c) => !qs.includes(c));
    const ids = new Set(main.map((c) => c.id));
    const fIdx = (c) => { const f = frameOf(c, frames); return f ? frames.indexOf(f) : frames.length; };
    const key = (c) => [fIdx(c), c.y, c.x];
    const cmp = (p, q) => { const a = key(p), z = key(q); return a[0] - z[0] || a[1] - z[1] || a[2] - z[2]; };
    const arrows = b.arrows.filter((a) => ids.has(a.a) && ids.has(a.b));
    const indeg = {}; main.forEach((c) => (indeg[c.id] = 0)); arrows.forEach((a) => indeg[a.b]++);
    const order = []; const left = new Set(main.map((c) => c.id));
    while (left.size) {
      let avail = main.filter((c) => left.has(c.id) && indeg[c.id] === 0).sort(cmp);
      if (!avail.length) avail = main.filter((c) => left.has(c.id)).sort(cmp);
      // stay in the same frame while it has cards ready
      const lastF = order.length ? fIdx(order[order.length - 1]) : -1;
      const same = avail.filter((c) => fIdx(c) === lastF);
      const pick = (same.length ? same : avail)[0];
      order.push(pick); left.delete(pick.id); arrows.filter((a) => a.a === pick.id).forEach((a) => indeg[a.b]--);
    }
    const into = (c) => b.arrows.find((a) => a.b === c.id && order.some((o) => o.id === a.a)) || b.arrows.find((a) => a.a === c.id && order.some((o) => o.id === a.b));
    const secs = []; order.forEach((c) => { const f = frameOf(c, frames); const name = f ? f.label : "Also on your board"; if (!secs.length || secs[secs.length - 1].name !== name) secs.push({ name, frame: f?.id, cards: [] }); secs[secs.length - 1].cards.push(c); });
    const connected = new Set(arrows.flatMap((a) => [a.a, a.b]));
    return { order, secs, qs, into, arrows, connected };
  }
  function openMake(scopeArg) {
    const b = board();
    const frames = b.cards.filter((c) => c.kind === "frame");
    const selN = [...U.sel].map((id) => cardOf(id)).filter(isContent).length;
    const M = { scope: scopeArg || (selN >= 2 ? "sel" : "all"), order: "mine", len: "short", shape: "lumen" };
    $("#toast").innerHTML = "";
    const draw = () => {
      const o = buildOutline(M.scope);
      const n = o.order.length;
      const level = T[b.place].st === 2 ? "Regular" : "Basics";
      const scopes = [["all", "Whole board"], ...(selN >= 2 ? [["sel", `Selection (${selN})`]] : []), ...frames.map((f) => [f.id, f.label])];
      const thumbOf = (x) => x.type === "photo" ? `<span class="th"><img src="${IMG[x.img].src}" alt=""></span>` : x.type === "question" ? `<span class="th q">?</span>` : ["lumen", "course", "video"].includes(x.type) ? `<span class="th dark">▶</span>` : x.type === "topic" ? `<span class="th">◎</span>` : `<span class="th">“</span>`;
      let k = 0;
      const outline = M.shape === "course"
        ? o.secs.map((s, i) => `<li class="sec">Part ${i + 1} · ${esc(s.name)}</li>${s.cards.map((c) => { const x = item(c.ref); return `<li class="it"><span class="n">${++k}</span>${thumbOf(x)}<span><b>${esc(short(titleOf(x), 70))}</b><small>${esc(typeWord(x))}</small></span></li>`; }).join("")}`).join("")
        : o.secs.map((s) => `<li class="sec">${esc(s.name)}</li>${s.cards.map((c) => { const x = item(c.ref); const a = M.order === "mine" ? o.into(c) : null; const other = a && item(cardOf(a.a === c.id ? a.b : a.a).ref);
            if (buildsOn(c)) return `<li class="it dim"><span class="n">·</span>${thumbOf(x)}<span><b>${esc(short(titleOf(x), 70))}</b><small>Builds on it, doesn't repeat it</small></span></li>`;
            const out = M.len === "short" && !o.connected.has(c.id);
            return `<li class="it${out ? " dim" : ""}"><span class="n">${out ? "·" : ++k}</span>${thumbOf(x)}<span><b>${esc(short(titleOf(x), 70))}</b><small>${out ? "Left out of a short Lumen: nothing connects it" : a ? `${a.a === c.id ? "" : "← "}<span class="v">${esc(a.verb || "linked")}</span> ${esc(short(titleOf(other), 34))}${a.why ? ` · “${esc(short(a.why, 40))}”` : ""}` : esc(typeWord(x))}</small></span></li>`; }).join("")}`).join("");
      const lay = $("#layer");
      if (!$(".sheet", lay)) lay.innerHTML = `<div class="scrim" data-scrim><div class="sheet" role="dialog" aria-modal="true" aria-label="Make a Lumen"></div></div>`;
      $(".sheet", lay).innerHTML = `
        <div class="sh"><div style="flex:1"><h2>Make a Lumen from ${M.scope === "all" ? "this board" : M.scope === "sel" ? "your selection" : `“${esc(cardOf(M.scope).label)}”`}</h2><p>Loci reads what you placed, the arrows you drew and why, and the goal. It writes the slides and narration; your pictures and words are cited.</p></div><button class="icon-btn" data-act="close-layer" aria-label="Close">${I.close}</button></div>
        <div class="sb">
          <div class="opt"><span>From</span><div class="seg">${scopes.map(([v, l]) => `<button data-m="scope" data-v="${v}" aria-pressed="${M.scope === v}">${esc(l)}</button>`).join("")}</div></div>
          <div class="feeds">
            <div class="feed goal"><b>The brief: your goal</b><span>${esc(short(b.goal || "No goal yet. Add one on the board.", 120))}</span></div>
            <div class="feed"><b>Pitched at ${level}</b><span>From what Loci knows about you in ${esc(T[b.place].name)}.</span></div>
            <div class="feed q"><b>${o.qs.length} question${o.qs.length === 1 ? "" : "s"} → the check</b><span>${o.qs.length ? "Answered at the end, after you try." : "Leave a ? card to get a check."}</span></div>
          </div>
          <div class="opt"><span>Order</span><div class="seg"><button data-m="order" data-v="mine" aria-pressed="${M.order === "mine"}">Follow my arrows</button><button data-m="order" data-v="loci" aria-pressed="${M.order === "loci"}">Let Loci order it</button></div></div>
          <div style="display:flex;gap:18px;flex-wrap:wrap">
            <div class="opt"><span>Make</span><div class="seg"><button data-m="shape" data-v="lumen" aria-pressed="${M.shape === "lumen"}">One Lumen</button><button data-m="shape" data-v="course" aria-pressed="${M.shape === "course"}" ${o.secs.length < 2 ? "disabled" : ""}>A course: a part per frame</button></div></div>
            ${M.shape === "lumen" ? `<div class="opt"><span>Length</span><div class="seg"><button data-m="len" data-v="short" aria-pressed="${M.len === "short"}">Short: connected cards</button><button data-m="len" data-v="std" aria-pressed="${M.len === "std"}">Everything</button></div></div>` : ""}
          </div>
          <div class="opt"><span>${M.order === "mine" ? "Outline, in the order of your arrows" : "Outline (Loci may reorder this when it writes)"}</span>
            ${n ? `<ol class="outline">${outline}${o.qs.length ? `<li class="sec">Check</li>${o.qs.map((c) => `<li class="it"><span class="n">?</span><span class="th q">?</span><span><b>${esc(item(c.ref).text)}</b><small>Try it, then see the answer</small></span></li>`).join("")}` : ""}</ol>` : `<p class="dnote">Nothing to explain here yet. Place a few things and connect them.</p>`}
          </div>
        </div>
        <div class="sf"><span class="note">${n} cards · ${b.arrows.filter((a) => o.order.some((c) => c.id === a.a) && o.order.some((c) => c.id === a.b)).length} arrows. Nothing on the board changes.</span><button class="btn quiet" data-act="close-layer">Cancel</button><button class="btn primary" data-act="do-make" ${n ? "" : "disabled"}>${M.shape === "course" ? `Make the course (${o.secs.length} parts)` : "Make the Lumen"}</button></div>`;
      lay.querySelectorAll("[data-m]").forEach((bt) => bt.addEventListener("click", () => { M[bt.dataset.m] = bt.dataset.v; draw(); }));
      lay.querySelector("[data-act='do-make']").onclick = () => { closeLayer(); doMake(M, o); };
    };
    draw();
  }
  const BUILDS = ["lumen", "course", "topic", "board"];
  const buildsOn = (c) => BUILDS.includes(item(c.ref)?.type);
  function narr(x, a, other) {
    const join = a && other ? (a.a === x.__cid ? "" : `This ${a.verb || "connects to"} what came before. `) : "";
    const why = a?.why ? ` You put it this way: “${a.why}”` : "";
    switch (x.type) {
      case "photo": return `${join}${x.caption || x.title}.${why}`;
      case "note": return `In your words: “${x.text}”${why}`;
      case "quote": return `“${x.text}” (${x.src}).${why}`;
      case "link": return `From “${x.title}”: ${x.desc || ""}${why}`;
      case "lumen": return `You've already watched “${x.title}”, so this doesn't repeat it. It builds on it.${why}`;
      case "course": return `This draws on your course “${x.title}”.`;
      case "topic": return `This connects to ${x.topic.name} on your map.`;
      case "slide": return `From your Lumen “${x.lumen.title}”: ${x.t}.`;
      case "moment": return `At ${x.t} in “${x.video.title}”: ${x.text}.`;
      default: return titleOf(x);
    }
  }
  const ANSWERS = {
    "qn-ratio": "No ratio does it at noon in June. In Dubai the sun is then about 88° up, almost overhead, so the floor of any open court is in sun. Depth helps in the morning and late afternoon. At noon, shade has to come from above: an arcade, a canopy, trees.",
    "qn-humid": "Very little. Evaporation cools air only as far as it's dry, and Dubai's August air is humid, so a wet surface gives a degree or two at best. Shade and moving air do far more. Keep water for the drier months, and for the sound.",
  };
  function slidesFrom(o, b) {
    const builds = o.order.filter(buildsOn).map((c) => item(c.ref));
    const S = [{ kind: "title", t: b.title, sub: b.goal, narr: `Your goal: ${b.goal}${builds.length ? ` This builds on ${builds.map((x) => `“${x.title}”`).join(" and ")}, so it won't repeat ${builds.length > 1 ? "them" : "it"}.` : ""}`, cite: builds.map((x) => x.title) }];
    let last = null; // { cid, idx }: the slide that shows the previous card on its own
    o.order.filter((c) => !buildsOn(c)).forEach((c) => {
      const x = item(c.ref); x.__cid = c.id;
      const a = o.into(c); const otherC = a && cardOf(a.a === c.id ? a.b : a.a); const other = otherC && item(otherC.ref);
      const prev = last && cardOf(last.cid);
      const link = prev && o.arrows.find((r) => (r.a === prev.id && r.b === c.id) || (r.b === prev.id && r.a === c.id));
      if (link && (x.type === "photo" || item(prev.ref).type === "photo")) {
        const p = item(prev.ref);
        const L = link.a === prev.id ? p : x, R = link.a === prev.id ? x : p;
        S[last.idx] = { kind: "pair", L: L.id, R: R.id, verb: link.verb || "connects to", t: `${short(titleOf(L), 40)} ${link.verb || "→"} ${short(titleOf(R), 40)}`,
          narr: link.why ? `${short(titleOf(L), 50)} ${link.verb || "connects to"} ${short(titleOf(R), 50)}. You put it this way: “${link.why}”` : `${titleOf(L)} ${link.verb || "connects to"} ${titleOf(R)}.`, cite: [titleOf(L), titleOf(R)] };
        last = null; delete x.__cid; return;
      }
      if (x.type === "photo") S.push({ kind: "img", img: x.img, t: x.title, body: x.caption, narr: narr(x, a, other), cite: [x.title] });
      else if (x.type === "slide" && x.img) S.push({ kind: "img", img: x.img, t: x.t, body: `From “${x.lumen.title}”`, narr: narr(x), cite: [titleOf(x)] });
      else S.push({ kind: "txt", t: x.type === "quote" ? "" : short(titleOf(x), 90), body: x.type === "note" || x.type === "quote" ? x.text : x.type === "link" ? x.desc : "", quote: x.type === "quote" ? x.src : "", narr: narr(x, a, other), cite: [titleOf(x)], kick: typeWord(x) });
      if (x.type === "note") S[S.length - 1].t = "";
      last = { cid: c.id, idx: S.length - 1 };
      delete x.__cid;
    });
    o.qs.forEach((c) => { const x = item(c.ref); S.push({ kind: "check", q: x.text, qid: x.id, ans: ANSWERS[x.id] || "Loci answers this from your sources and its own, and says which is which.", narr: "Try this before you look.", cite: [] }); });
    return S;
  }
  function doMake(M, o) {
    const b = board();
    const scopeCards = o.order.concat(o.qs);
    const bb = bboxOf(scopeCards.length ? scopeCards : b.cards);
    if (M.shape === "course") {
      const cid = uid("c"), courseId = uid("cr");
      const parts = o.secs.map((s, i) => { const id = uid("lm"); const oo = { ...o, order: s.cards, qs: i === o.secs.length - 1 ? o.qs : [] };
        DB.items[id] = { id, type: "lumen", title: s.name, min: 4, course: courseId, part: i + 1, topics: [b.place], date: TODAY, from: b.id, slides: slidesFrom(oo, { ...b, title: s.name }), answers: oo.qs.map((c) => cardOf(c.id) && item(c.ref).id) };
        return id; });
      mutate(() => { DB.items[courseId] = { id: courseId, type: "course", title: b.title, parts, topics: [b.place], date: TODAY, from: b.id };
        b.cards.push({ id: cid, ref: courseId, x: Math.round(bb.x + bb.w + 90), y: Math.round(bb.y), w: 230, flash: true, madeFrom: o.secs.map((s) => s.frame).filter(Boolean) }); U.sel = new Set([cid]); }, `Course made: ${parts.length} parts, one per frame. It's in Learn too.`);
      setTimeout(() => panTo(cardOf(cid)), 60);
      return;
    }
    const id = uid("lm"), cid = uid("c");
    const slides = slidesFrom(M.len === "short" ? { ...o, order: o.order.filter((c) => o.connected.has(c.id) || buildsOn(c)) } : o, b);
    const fr = b.cards.filter((c) => c.kind === "frame" && o.secs.some((s) => s.frame === c.id)).map((f) => f.id);
    DB.made++;
    mutate(() => {
      DB.items[id] = { id, type: "lumen", title: M.title || b.title, min: Math.max(2, Math.round(slides.length * 0.45)), topics: [b.place], date: TODAY, from: b.id, state: "making", stage: "Reading your board…", pct: 8, slides, answers: o.qs.map((c) => item(c.ref).id) };
      b.cards.push({ id: cid, ref: id, x: Math.round(bb.x + bb.w + 90), y: Math.round(bb.y + 40), w: 220, flash: true, madeFrom: M.scope === "all" ? fr : M.scope === "sel" ? [] : [M.scope] });
      U.sel = new Set([cid]);
    });
    setTimeout(() => panTo(cardOf(cid)), 60);
    const steps = [["Following your arrows…", 30], ["Writing slides…", 55], ["Choosing your pictures…", 75], ["Recording the voice…", 92]];
    steps.forEach(([s, p], i) => setTimeout(() => { const l = DB.items[id]; if (!l || l.state !== "making") return; l.stage = s; l.pct = p; save(); if (U.screen === "board") drawWorld(); }, 700 * (i + 1)));
    setTimeout(() => { const l = DB.items[id]; if (!l) return; l.state = "ready"; delete l.stage; save(); if (U.screen === "board") drawWorld();
      toast("Your Lumen is ready. It's on the board and in Learn.", false, { label: "Play", fn: () => play(id) }); }, 700 * (steps.length + 1));
  }

  /* ================================================================ player */
  function play(lid, at = 0) {
    const l = DB.items[lid]; if (!l) return;
    const slides = l.slides.map((s) => (s.kind ? s : { kind: s.img ? "img" : "txt", img: s.img, t: s.t, body: "", narr: s.t + ".", cite: [] }));
    if (!l.slides[0]?.kind) slides.unshift({ kind: "title", t: l.title, sub: l.course ? `Part ${l.part} of ${DB.items[l.course].title}` : `${l.min} min`, narr: "", cite: [] });
    let i = clamp(+at + (l.slides[0]?.kind ? 0 : 1), 0, slides.length - 1); const shown = {};
    const draw = () => {
      const s = slides[i];
      let inner = "";
      if (s.kind === "title") inner = `<div class="s-title"><span class="kick">${l.from ? "Lumen · made from your board" : "Lumen"}</span><h3>${esc(s.t)}</h3>${s.sub ? `<p>${esc(s.sub)}</p>` : ""}</div>`;
      else if (s.kind === "img") inner = `<div class="s-img"><div class="im"><img src="${IMG[s.img]?.src}" alt=""></div><div class="tx"><h3>${esc(s.t)}</h3>${s.body ? `<p>${esc(s.body)}</p>` : ""}<span class="cite">From your Commonplace</span></div></div>`;
      else if (s.kind === "pair") { const side = (id) => { const x = item(id); return x?.type === "photo" ? `<div><img src="${IMG[x.img].src}" alt=""></div>` : `<div class="txtbox">${esc(titleOf(x))}</div>`; };
        inner = `<div class="s-pair"><div class="two">${side(s.L)}<span class="verb">${esc(s.verb)} →</span>${side(s.R)}</div><div class="cap">${esc(s.t)}</div></div>`; }
      else if (s.kind === "check") inner = `<div class="s-check"><span class="kick">Check</span><h3>${esc(s.q)}</h3>${shown[i] ? `<div class="ans">${esc(s.ans)}</div>` : `<button data-pl="reveal">I've thought about it · Show the answer</button>`}</div>`;
      else inner = `<div class="s-txt"><div class="tx">${s.kick ? `<span class="cite">${esc(s.kick)}</span>` : ""}${s.t ? `<h3>${esc(s.t)}</h3>` : ""}${s.body ? `<p>${s.quote ? `<q>${esc(s.body)}</q>` : esc(s.body)}</p>` : ""}${s.quote ? `<span class="cite">${esc(s.quote)}</span>` : ""}</div></div>`;
      if (!$(".player")) $("#layer").innerHTML = `<div class="scrim" data-scrim><div class="player" role="dialog" aria-modal="true" aria-label="${esc(l.title)}"></div></div>`;
      $(".player").innerHTML = `
        <div class="ph"><b>${esc(l.title)}</b><button class="icon-btn" data-act="close-layer" aria-label="Close">${I.close}</button></div>
        <div class="slide">${inner}</div>
        <div class="narr" aria-live="polite">${esc(s.narr || "")}</div>
        <div class="cites">${(s.cite || []).filter(Boolean).map((c) => `<span>${esc(short(c, 50))}</span>`).join("")}</div>
        <div class="pf"><button class="btn sm" data-pl="prev" ${i === 0 ? "disabled" : ""}>‹ Back</button><span class="bar">${slides.map((_, k) => `<i class="${k <= i ? "on" : ""}"></i>`).join("")}</span><span class="ct">${i + 1} / ${slides.length}</span><button class="btn sm" data-pl="next">${i === slides.length - 1 ? "Done" : "Next ›"}</button></div>`;
      $$("[data-pl]").forEach((bt) => bt.onclick = () => { const a = bt.dataset.pl; if (a === "reveal") { shown[i] = true; return draw(); } if (a === "prev") i = Math.max(0, i - 1); else if (i === slides.length - 1) { closeLayer(); if (l.from) toast("Watched. Its questions now show as answered on the board."); l.watched = true; save(); if (U.screen === "board") drawWorld(); return; } else i++; draw(); });
    };
    draw();
    const key = (e) => { if (!$(".player")) { document.removeEventListener("keydown", key); return; } if (e.key === "ArrowRight") { $("[data-pl='next']")?.click(); } if (e.key === "ArrowLeft") { $("[data-pl='prev']")?.click(); } };
    document.addEventListener("keydown", key);
  }
  function closeLayer() { $("#layer").innerHTML = ""; }

  /* ================================================================ LOCI */
  function crossLinks() {
    // arrows on boards whose two ends share no topic: a link the map doesn't have yet
    const out = [];
    Object.values(DB.items).filter((b) => b.type === "board").forEach((b) => b.arrows.forEach((a) => {
      const A = item(b.cards.find((c) => c.id === a.a)?.ref), B = item(b.cards.find((c) => c.id === a.b)?.ref);
      if (!A || !B || !A.topics?.length || !B.topics?.length) return;
      if (A.topics.some((t) => B.topics.includes(t))) return;
      const ta = A.topics[0], tb = B.topics[0];
      if (under(ta, tb) || under(tb, ta)) return;
      const k = [ta, tb].sort().join("|");
      if (DB.links.includes(k) || DB.dismissed.includes(k) || out.some((o) => o.k === k)) return;
      out.push({ k, ta, tb, A, B, a, board: b });
    }));
    return out;
  }
  function renderLoci() {
    const sel = U.lociSel; const t = T[sel];
    // radial tree
    const kids = (id) => TOPICS.filter((x) => x.parent === id);
    const leaves = (id) => { const k = kids(id); return k.length ? k.reduce((s, x) => s + leaves(x.id), 0) : 1; };
    const pos = { you: { x: 0, y: 0 } }; const RAD = [0, 150, 285, 410];
    const lay = (id, a0, a1, d) => { let a = a0; kids(id).forEach((k) => { const span = ((a1 - a0) * leaves(k.id)) / leaves(id); const m = a + span / 2; pos[k.id] = { x: Math.cos(m) * RAD[d], y: Math.sin(m) * RAD[d] }; lay(k.id, a, a + span, d + 1); a += span; }); };
    lay("you", -Math.PI / 2, Math.PI * 1.5, 1);
    const boardsAt = (id) => Object.values(DB.items).filter((b) => b.type === "board" && b.place === id);
    let s = `<svg viewBox="-610 -480 1220 960" role="img" aria-label="Your map">`;
    TOPICS.forEach((x) => { if (!x.parent) return; const a = pos[x.parent], b = pos[x.id]; s += `<path class="edge" d="M${a.x},${a.y} L${b.x},${b.y}"/>`; });
    DB.links.forEach((k) => { const [p, q] = k.split("|"); const a = pos[p], b = pos[q]; if (a && b) s += `<path class="link" d="M${a.x},${a.y} Q0,0 ${b.x},${b.y}"/>`; });
    const sugs = crossLinks();
    sugs.forEach((g) => { const a = pos[g.ta], b = pos[g.tb]; if (a && b) s += `<path class="link sug" d="M${a.x},${a.y} Q0,0 ${b.x},${b.y}"/>`; });
    TOPICS.forEach((x) => {
      const p = pos[x.id]; const isArea = x.parent === "you"; const r = x.id === "you" ? 16 : isArea ? 11 : 9;
      const cls = ["nd", x.id === "you" ? "you" : isArea ? "area" : "s" + (x.st ?? 0), x.id === sel ? "on" : ""].join(" ");
      const anchor = p.x < -20 ? "end" : p.x > 20 ? "start" : "middle"; const dx = anchor === "end" ? -r - 6 : anchor === "start" ? r + 6 : 0; const dy = anchor === "middle" ? (p.y < 0 ? -r - 8 : r + 16) : 4;
      const bs = boardsAt(x.id);
      s += `<g class="${cls}" data-act="loci-sel" data-t="${x.id}" tabindex="0" role="button" aria-label="${esc(x.name)}"><circle class="r" cx="${p.x}" cy="${p.y}" r="${r}"/><text x="${p.x + dx}" y="${p.y + dy}" text-anchor="${anchor}">${esc(x.id === "you" ? "You" : x.name)}</text>
        ${bs.length ? `<g class="bb"><rect x="${p.x - 8}" y="${p.y + r + 3}" width="16" height="12" rx="2"/><text x="${p.x}" y="${p.y + r + 12.5}" text-anchor="middle">${bs.length}</text></g>` : ""}</g>`;
    });
    s += "</svg>";
    const here = Object.values(DB.items).filter((b) => b.type === "board" && (b.place === sel || under(b.place, sel)));
    const mine = sugs.filter((g) => [g.ta, g.tb].some((x) => under(x, sel) || under(sel, x)) || here.some((b) => b.id === g.board.id));
    const qs = [...new Set(here.flatMap((b) => b.cards.map((c) => item(c.ref)).filter((x) => x?.type === "question")))];
    const goalB = here.find((b) => b.place === sel && b.goal);
    const added = DB.links.filter((k) => k.split("|").some((x) => x === sel));
    main.innerHTML = `<div class="pg">
      <div class="pg-head"><div><h1>Loci</h1><p>Your map. A board lives at a place on it; the small square on a topic counts its boards.</p></div></div>
      <div class="loci">
        <div class="map">${s}</div>
        <aside class="tp-panel">
          <div><p class="path">${chain(sel).slice(0, -1).map((x) => esc(x.name)).join(" › ") || "&nbsp;"}</p><h2>${esc(t.id === "you" ? "You" : t.name)}</h2>${t.st != null ? `<span class="stl"><i></i>${ST[t.st]}</span>` : ""}</div>
          ${goalB ? `<div><h3>Why you're learning it</h3><div class="reads">Loci reads: <b>${esc(goalB.goal)}</b><br>From the goal on “${esc(goalB.title)}”. Change it there.</div></div>` : ""}
          <div><h3>Boards ${sel === "you" ? "everywhere" : "here"}<button class="btn sm" data-act="new-board" data-t="${sel}">${I.plus} New board</button></h3>
            <div class="btiles">${here.map((b) => `<button class="btile" data-act="open-board" data-id="${b.id}"><span class="pv">${boardSVG(b, 170, 100)}</span><b>${esc(b.title)}</b><small>${b.cards.length} cards · ${b.arrows.length} arrows${b.place !== sel ? " · " + esc(T[b.place].name) : ""}</small></button>`).join("") || `<button class="btile new" data-act="new-board" data-t="${sel}">${I.plus}<span>Start a board here</span></button>`}</div></div>
          <div><h3>From your boards</h3><div class="sugs">
            ${mine.map((g) => `<div class="sug"><span>Your arrow <em>“${esc(short(titleOf(g.A), 34))}” ${esc(g.a.verb || "→")} “${esc(short(titleOf(g.B), 34))}”</em> connects <b>${esc(T[g.ta].name)}</b> and <b>${esc(T[g.tb].name)}</b>. They aren't linked on your map.</span><div class="row"><button class="btn sm primary" data-act="add-link" data-k="${g.k}">Link them on the map</button><button class="btn sm quiet" data-act="dismiss-link" data-k="${g.k}">Not now</button></div></div>`).join("")}
            ${added.map((k) => `<div class="sug done">Linked on your map: <b>${k.split("|").map((x) => esc(T[x].name)).join(" ↔ ")}</b>. Lumens and chat in one now mention the other.</div>`).join("")}
            ${!mine.length && !added.length ? `<p class="dnote" style="margin:0">Nothing new. When an arrow on a board joins two topics your map doesn't link, it shows here.</p>` : ""}
          </div></div>
          ${qs.length ? `<div><h3>Open questions from your boards</h3><ul class="qs">${qs.map((q) => `<li><span>${esc(q.text)}</span><button class="btn sm" data-act="explain-q" data-id="${q.id}">Explain…</button></li>`).join("")}</ul></div>` : ""}
        </aside>
      </div></div>`;
  }

  /* ================================================================ COMMONPLACE */
  function renderCommonplace() {
    const types = { all: null, notes: ["note", "quote", "question"], sources: ["link", "video", "book"], photos: ["photo"], boards: ["board"] };
    const order = Object.values(DB.items).filter((x) => !["lumen", "course"].includes(x.type) && (!types[U.cpType] || types[U.cpType].includes(x.type)));
    const rank = (x) => (x.id === U.edited ? -2 : x.type === "board" ? -1 : 0);
    order.sort((a, b) => rank(a) - rank(b));
    const card = (x) => {
      const on = boardsWith(x.id).length;
      const ob = on ? `<span class="ob">${I.board.replace("<svg", '<svg width="12" height="12"')} On ${on} board${on > 1 ? "s" : ""}</span>` : "";
      const ed = x.id === U.edited ? " edited" : "";
      if (x.type === "photo") return `<button class="wc${ed}" data-act="cp-open" data-id="${x.id}"><img src="${IMG[x.img].src}" alt="" style="aspect-ratio:${IMG[x.img].w}/${IMG[x.img].h};background:${IMG[x.img].pal}"><span class="wb"><b>${esc(x.title)}</b>${ob}</span></button>`;
      if (x.type === "board") return `<button class="wc board" data-act="open-board" data-id="${x.id}"><span class="pv">${boardSVG(x, 240, 150)}</span><span class="wb"><span class="k">Board · ${x.cards.length} cards</span><b style="font:500 16px/1.3 var(--read)">${esc(x.title)}</b><span style="font-size:11.5px;color:var(--ink-2)">${esc(T[x.place].name)}</span>${ob}</span></button>`;
      if (x.type === "note" || x.type === "quote" || x.type === "question") return `<button class="wc ${x.type === "question" ? "q" : x.type}${ed}" data-act="cp-open" data-id="${x.id}"><span class="wb"><span class="k">${typeWord(x)}${x.id === U.edited ? " · just changed on a board" : ""}</span><p>${esc(x.text)}</p>${x.src ? `<span style="font-size:11.5px;color:var(--ink-2)">${esc(x.src)}</span>` : ""}${ob}</span></button>`;
      if (x.type === "video" || x.type === "book") return `<button class="wc dark" data-act="cp-open" data-id="${x.id}"><span class="wb"><span class="k">${typeWord(x)}</span><b style="font:500 16px/1.3 var(--read)">${esc(x.title)}</b><span style="font-size:11.5px;color:var(--cover-ink-2)">${esc(x.creator)}</span>${ob}</span></button>`;
      return `<button class="wc" data-act="cp-open" data-id="${x.id}"><span class="wb"><span class="k">${esc(x.site)}</span><b style="font:500 16px/1.3 var(--read)">${esc(x.title)}</b>${x.desc ? `<span style="font-size:12px;color:var(--ink-2)">${esc(x.desc)}</span>` : ""}${ob}</span></button>`;
    };
    main.innerHTML = `<div class="pg"><div class="pg-head"><div><h1>Commonplace</h1><p>One library. A board is one kind of item in it, and what you place on a board stays here too.</p></div><span class="grow"></span><button class="btn" data-act="new-board" data-t="climate">${I.plus} New board</button></div>
      <div class="cp-bar">${[["all", "All"], ["notes", "Notes"], ["sources", "Sources"], ["photos", "Photos"], ["boards", "Boards"]].map(([k, l]) => `<button class="chip" data-act="cp-type" data-v="${k}" aria-pressed="${U.cpType === k}">${l}</button>`).join("")}</div>
      <div class="wall">${order.map(card).join("") || '<p class="empty">Nothing here yet.</p>'}</div>
      <aside class="drawer right${U.insp ? " open" : ""}" id="cp-insp" aria-label="Details" style="position:fixed"></aside></div>`;
    renderInsp();
  }

  /* ================================================================ navigation */
  function openBoard(id) {
    if (!DB.items[id]) return;
    DB.cur = id; U.sel.clear(); U.insp = null; U.wire = null; U.recall = false; U.rv = {}; U.screen = "board"; save(); closeLayer(); render();
  }
  function newBoard(place) {
    const id = uid("b");
    DB.items[id] = { id, type: "board", title: "Untitled board", place, date: TODAY, goal: "", cards: [{ id: uid("g"), kind: "goal", x: 40, y: 30, w: 330 }], arrows: [] };
    DB.views[id] = { x: 0, y: 0, z: 1, fit: true };
    save(); openBoard(id); U.drawer = true; renderDrawer(); syncTools();
    setTimeout(() => { const g = board().cards[0]; startEdit(g.id); }, 80);
    toast(`New board in ${T[place].name}. Start with what you want to understand.`);
  }

  /* ================================================================ clicks */
  document.addEventListener("click", (e) => {
    if (e.target.matches("[data-scrim]")) { closeLayer(); return; }
    const t = e.target.closest("[data-act]"); if (!t) return;
    const a = t.dataset.act; const b = board();
    switch (a) {
      case "nyi": toast(t.dataset.msg); break;
      case "theme": { const r = document.documentElement; const dark = r.dataset.theme ? r.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; r.dataset.theme = dark ? "light" : "dark"; break; }
      case "screen": U.screen = t.dataset.s; U.insp = null; render(); renderGuide(); break;
      case "guide": U.guide = !U.guide; DB.firstGuide = false; save(); renderPbar(); renderGuide(); break;
      case "reset": if (confirm("Reset the prototype to its starting board?")) { DB = seed(); DB.firstGuide = false; hist.length = 0; U.sel.clear(); U.insp = null; U.recall = false; U.rv = {}; U.edited = null; U.screen = "board"; save(); render(); } break;
      case "tool": setTool(t.dataset.t); break;
      case "drawer": U.drawer = !U.drawer; if (U.drawer && innerWidth < 700) U.insp = null; renderDrawer(); renderInsp(); syncTools(); break;
      case "dtab": U.dtab = t.dataset.t; U.dq = ""; renderDrawer(); break;
      case "dscope": U.dscope = t.dataset.v; renderDrawer(); break;
      case "zin": zoomAt(1.25); break;
      case "zout": zoomAt(1 / 1.25); break;
      case "fit": fit(); break;
      case "inspect": inspect(t.dataset.c); break;
      case "insp-close": U.insp = null; renderInsp(); break;
      case "cp-open": U.insp = t.dataset.id; renderInsp(); break;
      case "cp-type": U.cpType = t.dataset.v; renderCommonplace(); break;
      case "unpack": unpack(t.dataset.c); break;
      case "play": play(t.dataset.id, t.dataset.at || 0); break;
      case "connect": U.tool = "arrow"; U.arrowOnce = true; U.wire = { from: t.dataset.c }; syncTools(); drawWorld(); toast("Tap the card it connects to. Esc to stop."); break;
      case "ask": askLoci(); break;
      case "rm-sel": removeSel(); break;
      case "rm-card": mutate(() => { b.cards = b.cards.filter((c) => c.id !== t.dataset.c); U.sel.delete(t.dataset.c); }); break;
      case "edit": startEdit(t.dataset.c); break;
      case "rename-frame": editFrameLabel(t.dataset.c); break;
      case "frame-sel": {
        const cs = [...U.sel].map((id) => cardOf(id)).filter((c) => c && c.kind !== "frame"); if (!cs.length) break;
        const bb = bboxOf(cs); const id = uid("f");
        mutate(() => { b.cards.unshift({ id, kind: "frame", label: "New frame", x: Math.round(bb.x - 30), y: Math.round(bb.y - 30), w: Math.round(bb.w + 60), h: Math.round(bb.h + 60) }); U.sel = new Set([id]); });
        setTimeout(() => editFrameLabel(id), 30); break;
      }
      case "make": openMake(t.dataset.scope); break;
      case "do-make": break;
      case "close-layer": closeLayer(); break;
      case "recall": U.recall = !U.recall; U.rv = {}; U.sel.clear(); closePop(); $("#bd")?.classList.toggle("recall", U.recall); $(`[data-act="recall"].btn`)?.setAttribute("aria-pressed", String(U.recall)); drawWorld(); break;
      case "rmark": { U.rv[t.dataset.c] = t.dataset.v; drawWorld(); break; }
      case "loci-compare": case "loci-skip": {
        const c = cardOf(t.dataset.c); const ta = $(`[data-loci="${c.id}"]`); const yours = a === "loci-compare" ? (ta?.value || "").trim() : "";
        if (a === "loci-compare" && !yours) { ta?.focus(); toast("Write yours first, even a rough one. That's the part that helps."); break; }
        mutate(() => { c.yours = yours; c.state = "told"; }); break;
      }
      case "loci-keep": {
        const c = cardOf(t.dataset.c); const text = t.dataset.w === "mine" ? c.yours : c.text; const itid = uid("n");
        mutate(() => { DB.items[itid] = { id: itid, type: "note", text, topics: [b.place], date: TODAY, by: t.dataset.w === "loci" ? "Loci" : undefined }; const nc = { id: uid("c"), ref: itid, x: c.x, y: c.y, w: 250, flash: true }; b.cards.push(nc); c.about.slice(0, 3).forEach((id) => b.arrows.push({ id: uid("a"), a: nc.id, b: id, verb: "explains", why: "" })); b.cards = b.cards.filter((k) => k.id !== c.id); U.sel = new Set([nc.id]); }, "Kept as a note in Commonplace, connected to the cards it's about.");
        break;
      }
      case "loci-topic": { const c = cardOf(t.dataset.c); const ref = "topic:" + c.topic; const id = uid("c"); const sp = freeSpot(c.x, c.y + (SZ[c.id]?.h || 200) + 30, 230, 60); mutate(() => { b.cards.push({ id, ref, x: Math.round(sp.x), y: Math.round(sp.y), w: 230, flash: true }); c.topic = null; }, `Placed ${T[ref.slice(6)].name} from your map.`); break; }
      case "explain-q": { const q = DB.items[t.dataset.id]; toast(`Making a Lumen to answer: “${short(q.text, 50)}”`); if (U.screen === "board") { const qc = b.cards.find((c) => c.ref === q.id); if (qc) { U.sel = new Set([qc.id]); const o = { order: b.arrows.filter((x) => x.b === qc.id).map((x) => cardOf(x.a)).filter(isContent), qs: [qc], secs: [], into: () => null }; o.secs = [{ name: "", cards: o.order }]; setTimeout(() => doMake({ shape: "lumen", len: "short", scope: "sel", title: q.text }, o), 300); } } break; }
      case "open-board": openBoard(t.dataset.id); break;
      case "loci-at": U.lociSel = t.dataset.t; U.screen = "loci"; U.insp = null; render(); break;
      case "loci-sel": U.lociSel = t.dataset.t; renderLoci(); break;
      case "new-board": newBoard(t.dataset.t === "you" ? "climate" : t.dataset.t); break;
      case "add-link": DB.links.push(t.dataset.k); save(); renderLoci(); toast("Linked on your map."); break;
      case "dismiss-link": DB.dismissed.push(t.dataset.k); save(); renderLoci(); break;
    }
  });
  document.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.matches?.("g[data-act], [role='button'][data-act]")) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); } });
  addEventListener("resize", () => { if (U.screen === "board") applyView(); renderGuide(); });

  render();
  if (DB.firstGuide) { U.guide = true; renderPbar(); setTimeout(renderGuide, 60); }
})();
