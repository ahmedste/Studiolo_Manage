/* The prototype's sample. One learner, the same everywhere:
   - Loci: the app's specimen map (src/dev/graph-sample.ts, 18 areas and 104 topics, captured in
     ../live-lumens/capture/graph.json) with the Palace specimen's statuses and My Focus (src/dev/palace-specimens.tsx),
     plus the topics the approved Commonplace prototype tags its entries with (Courtyards, Wind towers, Brick…), placed
     where they belong on that map.
   - Commonplace: the approved Commonplace prototype's entries (../commonplace-photos, version 4): its 31 photos, notes,
     quotes, books, lectures and links, their collections and albums.
   - Learn: Lumens in Watch, Listen and Read with their slides, chapters and sections; two courses; a live session; goals.
   build.mjs inlines GRAPH and IMG. */
"use strict";
window.SAMPLE = (() => {
  const G = /*GRAPH*/ { topics: [], relations: [] };
  const LEARNING = new Set(["Geometry & ornament", "Regional schools", "Postmodern & Contemporary", "Vernacular & regional", "Theory & criticism", "Culture and architecture", "Site and place", "Space, sequence & threshold", "Proportion, scale & rhythm", "Civic & cultural", "Rainscreen", "Masonry", "Facade performance", "Steel", "Tall buildings", "Embodied carbon", "Passive design", "Daylight & shading", "MEP fundamentals", "Certification", "Urban design principles", "Masterplanning", "Parametric design", "Scripting & automation", "Writing & presenting", "Acoustics & sound", "Moisture & air tightness", "FF&E specification", "Feasibility & pro forma", "Development economics", "Dispute resolution", "Planning codes", "Biodiversity & soil", "Hardscaping details", "Generative optimization", "Performance simulation", "Arcades & hypostyle", "Wind towers", "Brick", "Riyadh library competition", "Massing options"]);
  const LEARNED = new Set(["Islamic architecture", "Plan types & ritual", "The contemporary mosque", "Modernism", "Climate-responsive design", "Ordering principles", "Massing & hierarchy", "Typologies", "Residential", "Religious", "Retail & mixed use", "Facade systems", "Curtain wall", "Unitised", "Precast", "Detailing & interfaces", "Facade procurement", "Structural principles", "Concrete & precast", "Material selection", "Methods & sequencing", "Detailing", "Site coordination", "Stages & deliverables", "Contracts & procurement", "Coordination & BIM", "Client & stakeholders", "Leadership & teams", "Codes & authorities", "BIM", "AI in practice", "Drawing & sketching", "Rendering & visualization", "Thermal envelope", "Spatial ergonomics", "Architectural lighting", "Standard contracts", "Stormwater management", "Fire engineering", "Universal access", "Egress & evacuation", "Algorithmic modeling", "Courtyards"]);
  const FOCUS = new Set(["Daylight & shading", "Facade systems", "Typologies"]);

  // The Commonplace prototype's topics, added under the map's own topics.
  const EXTRA = [
    ["Courtyards", "Islamic architecture"], ["Arcades & hypostyle", "Islamic architecture"],
    ["Wind towers", "Climate-responsive design"], ["Shading & screens", "Climate-responsive design"],
    ["Brick", "Material selection"], ["Earth", "Material selection"], ["Timber", "Material selection"], ["Tile & stone", "Material selection"],
    ["Riyadh library competition", "Stages & deliverables"], ["Massing options", "Riyadh library competition"], ["Housing study", "Stages & deliverables"],
  ];
  const raw = [...G.topics];
  EXTRA.forEach(([name, parent], i) => raw.push({ id: `x${i + 1}`, parentId: raw.find((t) => t.name === parent).id, name }));
  const topics = raw.map((t, i) => ({
    id: t.id, parentId: t.parentId, name: t.name, description: "",
    status: LEARNED.has(t.name) ? "learned" : LEARNING.has(t.name) ? "learning" : "not_started",
    wantToLearn: FOCUS.has(t.name), sortOrder: i, version: 1,
  }));
  const relations = G.relations.map((r, i) => ({ id: `rel-${i}`, topicAId: r.a, topicBId: r.b, explanation: "", version: 1 }));
  const byName = (n) => { const t = topics.find((x) => x.name === n); if (!t) throw new Error(`No topic ${n}`); return t.id; };
  // The Commonplace prototype's topic ids, by name on this map.
  const TP = { t1: "Islamic architecture", t1a: "Courtyards", t1b: "Arcades & hypostyle", t2: "Climate-responsive design", t2a: "Wind towers", t2b: "Shading & screens", t3: "Space, sequence & threshold", t4: "Material selection", t4a: "Brick", t4b: "Earth", t4c: "Timber", t4d: "Tile & stone", t5: "Riyadh library competition", t5a: "Massing options", t6: "Housing study", dl: "Daylight & shading", pd: "Passive design" };
  const tp = (ids) => ids.map((k) => byName(TP[k]));

  /* ---------- Commonplace ---------- */
  // Photo kinds are the Photos type's collections; the others are collections of Notes and Sources.
  const COLLECTIONS = [
    { id: "site", name: "Site visits", type: "photo" }, { id: "refs", name: "References", type: "photo" }, { id: "renders", name: "Renders", type: "photo" },
    { id: "drawings", name: "Drawings", type: "photo" }, { id: "materials", name: "Materials", type: "photo" },
    { id: "reflections", name: "Reflections", type: "note", desc: "What I took from the places I visited, written soon after." },
    { id: "books", name: "Books", type: "source" }, { id: "lectures", name: "Lectures", type: "source", desc: "Studio lectures and talks worth watching twice." }, { id: "links", name: "Links", type: "source" },
  ];
  const ALBUMS = { kairouan: "Kairouan, site visit", yazd: "Yazd, wind towers", comp: "Library competition, stage 1" };
  const SONY = "Sony α7 IV", IPH = "iPhone 16 Pro", ENS = "Rhino 8 + Enscape", SCAN = "Scan, 600 dpi";
  const P = (img, title, caption, coll, t, date, camera, extra = {}) => ({ id: img, type: "photo", img, title, caption, coll, topics: tp(t), date, camera, picked: false, album: null, site: null, notes: 0, ...extra });
  const items = [
    P("courtyard-morning", "Courtyard toward the prayer hall", "Morning, from the north gate. The pool sits on the axis of the wider central bay.", "site", ["t1a", "t1b"], "2026-09-12", SONY, { picked: true, album: "kairouan", notes: 2 }),
    P("courtyard-noon", "Arcade at noon", "Shade only inside the arcade at this hour; the court itself is a heat trap.", "site", ["t1a", "t2b"], "2026-09-12", SONY, { album: "kairouan" }),
    P("hypostyle", "Hypostyle hall, light through the roof", "Openings in the roof slab, not windows: light arrives in pools between the columns.", "site", ["t1b", "t3"], "2026-09-12", SONY, { picked: true, album: "kairouan" }),
    P("colonnade-dusk", "Colonnade at dusk", "The colonnade keeps its rhythm long after the court goes dark.", "site", ["t1b"], "2026-09-12", SONY, { album: "kairouan" }),
    P("column-base", "Column base, reused capital", "A Roman piece turned upside down as a base. Every column here is different.", "site", ["t1b"], "2026-09-13", IPH, { album: "kairouan", notes: 1 }),
    P("windtowers", "Wind towers over the old quarter", "Each tower faces the summer wind; the slots are on one side only.", "site", ["t2a"], "2026-04-03", IPH, { picked: true, album: "yazd" }),
    P("earth-wall", "Rammed earth wall, long view", "Garden wall on the edge of town. You can count the lifts.", "site", ["t4b"], "2026-04-03", IPH, { album: "yazd" }),
    P("vaults", "Vaulted roofs, mud brick", "Barrel vaults in a row, a dome at the end. No formwork used.", "site", ["t4b", "t1a"], "2026-04-04", IPH, { album: "yazd" }),
    P("stepwell", "Stepwell, looking down", "", "site", [], "2026-04-04", IPH, { album: "yazd" }),
    P("screen-shadow", "Mashrabiya shadow on the floor", "Late afternoon in a Cairo house. The screen draws on the floor for an hour.", "site", ["t2b", "t3", "dl"], "2026-02-18", IPH, { picked: true }),
    P("brick-hall", "Brick prayer hall, light from above", "Saved for the way light comes down the brick, not across it.", "refs", ["t4a", "t3"], "2026-08-22", "", { picked: true, site: "archdaily.com" }),
    P("stair-light", "Stair under a roof light", "Board-marked concrete, one slot of light at the top.", "refs", ["t3", "dl"], "2026-08-29", "", { site: "archdaily.com" }),
    P("tower", "Tower with brise-soleil", "", "refs", ["dl"], "2026-10-02", "", { site: "divisare.com" }),
    P("block-axo", "Urban block, axonometric", "", "renders", [], "2026-10-06", ENS),
    P("pavilion-a", "Massing option A: one long roof", "Reading hall under a single roof plane, closed to the north.", "renders", ["t5a"], "2026-10-14", ENS, { picked: true, album: "comp" }),
    P("pavilion-b", "Massing option B: open both sides", "Same roof, colonnade both sides. Too much glare in the afternoon.", "renders", ["t5a"], "2026-10-14", ENS, { album: "comp" }),
    P("reading-room", "Reading room with clerestory", "North clerestory, no direct sun on the tables.", "renders", ["t5", "t3", "dl"], "2026-10-15", ENS, { picked: true, album: "comp" }),
    P("vault-study", "Vault study, clay model", "Testing barrel vaults over the stacks.", "renders", ["t5a", "t4b"], "2026-10-16", ENS, { album: "comp" }),
    P("courthouse-aerial", "Courtyard house, aerial", "Four rooms round a court; the tall wing takes the wind tower.", "renders", ["t1a", "t6"], "2026-09-30", ENS),
    P("plan-courtyard", "Courtyard house, ground floor plan", "Liwan to the west, majlis to the east. Columns only on the court.", "drawings", ["t1a", "t6"], "2026-09-28", SCAN, { picked: true }),
    P("tplan", "T-plan prayer hall, column grid", "The wider axial aisle meets the qibla transept.", "drawings", ["t1b"], "2026-09-15", SCAN),
    P("section-windtower", "Section through a wind tower", "Cool air down the tower, warm air out through the high openings.", "drawings", ["t2a", "pd"], "2026-04-10", SCAN, { picked: true }),
    P("arcade-elevation", "Arcade elevation, bay proportions", "Bay 3.8 m, spring 3.2 m. Worth testing at 1:20.", "drawings", ["t1b"], "2026-09-16", SCAN),
    P("stair-section", "Stair section, light study", "", "drawings", [], "2026-10-18", SCAN),
    P("mat-brick", "Flemish bond, hand-made brick", "Headers a shade darker than the stretchers.", "materials", ["t4a"], "2026-07-02", IPH, { picked: true }),
    P("mat-zellige", "Zellige, green glaze", "Each tile slightly different. The joints stay wide.", "materials", ["t4d"], "2026-07-02", IPH),
    P("mat-earth", "Rammed earth sample", "Sample panel from the Yazd workshop.", "materials", ["t4b"], "2026-04-05", IPH),
    P("mat-oak", "Oak boards, oiled", "", "materials", ["t4c"], "2026-06-20", IPH),
    P("mat-terrazzo", "Terrazzo, warm aggregate", "", "materials", ["t4d"], "2026-08-11", "", { site: "pinterest.com" }),
    P("mat-jali", "Jali screen, Fatehpur Sikri", "The holes get smaller toward the bottom: more light at eye level, less glare.", "materials", ["t2b", "dl"], "2026-03-14", IPH),
    P("mat-travertine", "Travertine, vein cut", "", "materials", [], "2026-10-12", IPH),
    P("mat-concrete", "Board-marked concrete", "", "materials", [], "2026-10-20", IPH),
    { id: "q1", type: "quote", title: "Shade first, then mass, then air.", src: "Studio course · Climate and Architecture: lecture notes, p. 3", topics: tp(["t2", "dl"]), date: "2026-10-21", picked: true },
    { id: "n-sh", type: "note", title: "The mausoleum at Sultan Hassan faces the Citadel, not the city. Mentions Hassan Fathy.", coll: "reflections", topics: tp(["t1"]), date: "2026-10-17" },
    { id: "b1", type: "book", title: "Islamic Architecture: Form, Function and Meaning", creator: "Robert Hillenbrand, 1994", coll: "books", state: "reading", picked: true, topics: tp(["t1"]), date: "2026-10-09", prog: 0.38 },
    { id: "v1", type: "video", title: "The Great Mosque of Córdoba, plan and extensions", creator: "Studio lecture", dur: "30:00", prog: 0.35, coll: "lectures", state: "reading", topics: tp(["t1b"]), date: "2026-09-25", img: "hypostyle" },
    { id: "q2", type: "quote", title: "The eye never quite finds the end of the field.", src: "Studio lecture · Córdoba, 10:05", topics: tp(["t1b"]), date: "2026-09-20" },
    { id: "l1", type: "link", title: "Bait Ur Rouf Mosque, Marina Tabassum", site: "archdaily.com", desc: "Brick, no dome, light from above.", coll: "links", state: "read", topics: tp(["t3", "t4a"]), date: "2026-08-22", img: "brick-hall" },
    { id: "ln", type: "longnote", title: "What I took from Sultan Hassan", text: "The four iwans turn the courtyard into a room with four deep openings rather than an open field of columns. Standing in the middle you feel held, not exposed; the sky is a ceiling with a hole in it.", coll: "reflections", picked: true, topics: tp(["t1a"]), date: "2026-08-02" },
    { id: "q3", type: "quote", title: "We have to design for the climate, not against it.", src: "Hassan Fathy", topics: tp(["t2"]), date: "2026-05-02" },
    { id: "v2", type: "video", title: "Murcutt draws a roof", creator: "youtube.com", dur: "12:40", prog: 0, coll: "lectures", state: "unread", topics: tp(["t5a"]), date: "2026-10-19", img: "pavilion-a" },
    { id: "n2", type: "note", title: "Ask the client about north light in the reading hall before stage 2.", topics: [], date: "2026-10-22" },
    { id: "l2", type: "link", title: "Rammed earth: a contractor's guide", site: "earthbuilding.org", desc: "Lifts, formwork and curing times.", coll: "links", state: "unread", topics: [], date: "2026-10-20" },
    { id: "pdf1", type: "pdf", title: "Daylight in buildings: design guide", creator: "CIBSE LG10, 2014 · 96 pages", pages: 96, coll: "books", state: "unread", topics: tp(["dl"]), date: "2026-10-23" },
    { id: "n3", type: "note", title: "Daylight factor: 2 % is the floor, 5 % is bright. Anything above 5 % needs shading.", topics: tp(["dl"]), date: "2026-10-23" },
  ];
  const KIND_LABEL = { photo: "Photo", note: "Note", longnote: "Long note", quote: "Quote", book: "Book", video: "Video", link: "Link", pdf: "PDF" };
  items.forEach((x) => { x.kind = KIND_LABEL[x.type]; });

  /* ---------- Learn ---------- */
  // Each Lumen has the formats made for it so far. Watch has slides, Listen chapters and a transcript, Read sections.
  const lumens = [
    {
      id: "l1", title: "Cooling without machines", topic: byName("Passive design"), made: "2026-10-19", format: "listen", min: 18, progress: 0.42,
      formats: {
        listen: { min: 18, chapters: [["Why cool without machines", 0], ["Wind pressure", 190], ["The stack effect", 380], ["Evaporation", 580], ["The courtyard house", 750], ["Your site", 930]] },
        read: { min: 12, sections: ["Three ways air moves", "Wind pressure", "The stack effect", "Evaporation", "Check yourself"] },
      },
      lines: [
        ["A", 0, "Before fans and compressors, buildings in hot places still had to stay liveable. So how?"],
        ["B", 60, "Three things move air without a machine: wind pushing on a wall, warm air rising, and water evaporating."],
        ["A", 190, "Start with the wind. It presses on the side it hits and pulls on the side it leaves."],
        ["B", 260, "So an opening on the windward face and one on the leeward face, and air crosses the room."],
        ["A", 380, "The stack effect needs height. Warm air rises and leaves high up, and cooler air is drawn in low down."],
        ["B", 470, "Which is why the openings at the top of a wind tower matter as much as the ones at the bottom."],
        ["A", 580, "Then water. Air passing over a wet surface gives up heat to evaporate it."],
        ["B", 660, "A jar of water at the foot of the tower, or a pool in the court, does real work on a dry afternoon."],
        ["A", 750, "Put the three together and you get the courtyard house."],
        ["B", 930, "And for your site: which way does the summer wind come from, and how dry is the air?"],
      ],
    },
    {
      id: "l2", title: "How a malqaf moves air", topic: byName("Wind towers"), made: "2026-10-22", format: "watch", min: 6, progress: 0.65,
      formats: { watch: { min: 6, slides: ["A tower that catches wind", "Pressure on the windward face", "Down the shaft", "Through the house", "Out through the high openings"] } },
      lines: [
        ["N", 0, "A malqaf is a tower that faces the summer wind, with its opening on one side only."],
        ["N", 70, "The wind pushes on that opening harder than anywhere else on the building."],
        ["N", 140, "So air is driven down the shaft, often over a jar of water that cools it."],
        ["N", 220, "It crosses the rooms at body height, where it does the most good."],
        ["N", 300, "And leaves through high openings on the far side, carrying the warm air with it."],
      ],
    },
    {
      id: "l3", title: "Geometry in Islamic ornament", topic: byName("Geometry & ornament"), made: "2026-10-16", format: "read", min: 12, progress: 0,
      formats: { read: { min: 12, sections: ["Start from a circle", "Stars from polygons", "Girih tiles", "Check yourself"] } },
      lines: [],
    },
    {
      id: "l4", title: "Rainscreen, in one picture", topic: byName("Rainscreen"), made: "2026-10-10", format: "watch", min: 5, progress: 1,
      formats: { watch: { min: 5, slides: ["Two lines of defence", "The cavity", "Pressure equalised", "Where it fails"] } },
      lines: [["N", 0, "A rainscreen keeps most water out at the cladding, and drains the rest from the cavity behind it."]],
    },
    {
      id: "l5", title: "Courtyards in hot, humid places", topic: byName("Courtyards"), made: "2026-10-24", format: "read", min: 9, progress: 0.2,
      formats: { read: { min: 9, sections: ["Deep or shallow", "Breeze through the plan", "Check yourself"] }, watch: { min: 4, slides: ["Shade, not sun", "Deep courts", "Breeze paths"] } },
      lines: [["N", 0, "In a humid place, evaporation does little. Shade and moving air do the work."]],
    },
  ].map((l) => ({ ...l, state: "ready" }));

  // Courses: a topic and its sub-topics as parts, made one at a time.
  const courses = [
    {
      id: "c1", title: "Climate-responsive design", topic: byName("Climate-responsive design"),
      parts: [
        { title: "The whole topic", state: "watched", min: 4 },
        { title: "Wind towers", state: "watched", min: 3 },
        { title: "Shading & screens", state: "playing", min: 3, at: "1:44 of 3:05" },
        { title: "Evaporative cooling", state: "ready", min: 4 },
        { title: "Courtyards", state: "unmade" },
        { title: "Your site", state: "unmade" },
      ],
    },
    {
      id: "c2", title: "Islamic architecture", topic: byName("Islamic architecture"),
      parts: [
        { title: "The whole topic", state: "ready", min: 5 }, { title: "Plan types & ritual", state: "unmade" }, { title: "Geometry & ornament", state: "unmade" },
        { title: "Regional schools", state: "unmade" }, { title: "The contemporary mosque", state: "unmade" }, { title: "Courtyards", state: "unmade" }, { title: "Arcades & hypostyle", state: "unmade" },
      ],
    },
  ];
  const live = [{ id: "s1", lumen: "l2", slide: 3, slides: 5, min: 4, kept: true, days: 26 }];
  const goals = [
    { title: "Design the Riyadh reading hall", due: "Stage 2, 12 Nov", steps: [["resume", "l5"], ["make", "Daylight & shading"]] },
    { title: "Finish the climate course", due: "", steps: [["part", "c1", 2], ["part", "c1", 3]] },
  ];

  // What Loci would suggest under a topic (simulated: the app asks the model).
  const SUGGEST = {
    "Daylight & shading": ["Daylight factor", "Glare control", "Light shelves", "External shading devices", "Solar geometry"],
    "Passive design": ["Thermal mass", "Night purge ventilation", "Stack effect"],
    "Climate-responsive design": ["Evaporative cooling", "Thermal chimneys"],
    "Facade systems": ["Double-skin facades", "Brise-soleil", "Kinetic facades"],
    "Environment & Services": ["Water & drainage", "Vertical transport"],
    "Islamic architecture": ["Muqarnas", "Mashrabiya", "Iwan"],
  };

  return { topics, relations, items, lumens, courses, live, goals, SUGGEST, COLLECTIONS, ALBUMS, IMG: /*IMG*/ {}, META: /*META*/ {} };
})();
