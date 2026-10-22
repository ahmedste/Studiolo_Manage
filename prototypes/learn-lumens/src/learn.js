/* Learn, slice 2 (prototype): one Lumen, three formats.
   - A Lumen is one idea, explained for you. It comes as Watch (slides and a narrator), Listen (two voices, 10–30 min;
     src/listen.js) or Read (a long read). Live isn't a format: it's talking any Lumen through.
   - Learn has three tabs: Home, Lumens, Courses. Home makes a Lumen (pick the format in the bar; "Tailor" opens the
     whole brief), continues what you were on in any format, and shows courses and recent Lumens. Lumens filters by
     format, area and state, groups by date or topic, and keeps live sessions as one of its filters.
   - Every Lumen card shows its formats; a missing one is "+ Listen" and so on. Every Lumen page has the same
     Watch · Listen · Read switcher.
   Slice 1, kept as it was:
   - Every Lumen has Go live: the narrator takes over from the slide you're on, and you can interrupt (stop, a
     question, another way, simpler, deeper, from my field, test me, skip, back, or tap part of a slide). Ending goes
     back to the recording. Keep saves the live version, with your questions as asides.
   - Typed questions get written answers (no voice minutes). The talk bar appears only in Learn and on the Graph.
   The shell, header, cards and slides are the app's own DOM and CSS, captured read-only from studiolo's
   /dev/specimens. When this page may use Claude (the `sample` capability), Live Lumens, answers and rewrites are
   written by Claude in real time; otherwise a scripted Lumen plays. There is no microphone: holding the mic simulates
   live transcription, and the browser's speech voice stands in for the ElevenLabs narrator. */
(() => {
  "use strict";
  const DATA = JSON.parse(document.getElementById("vx-data").textContent);
  const root = document.getElementById("vx-app");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  DATA.htmlClass.split(/\s+/).filter(Boolean).forEach((c) => document.documentElement.classList.add(c));
  const STAGE = "--stage-surface: var(--surface-panel); --stage-ink: var(--text); --stage-ink-muted: var(--text-muted); --stage-ink-decor: var(--text-decor); --stage-rule: var(--rule); --stage-accent: var(--accent); --stage-accent-soft: var(--accent-soft); --stage-accent-strong: var(--accent-strong); --stage-positive: var(--ok); --stage-caution: var(--warn); --stage-board: var(--surface-board); --stage-role-emphasis: var(--accent); --stage-role-second: var(--status-2); --stage-role-third: var(--status-1); --stage-role-fourth: var(--myfocus-ink); --stage-role-neutral: var(--ink-3); --stage-font-ui: var(--ui); --stage-font-read: var(--read); --stage-pointer-ease: var(--ease-spring); --stage-pointer-duration: var(--dur-move); --stage-slide-ease: var(--ease-entrance); --stage-slide-duration: var(--dur-standard); --stage-camera-ease: var(--ease-standard); --stage-camera-duration: var(--dur-move); --stage-title-px: 56px; --stage-body-px: 30px; --stage-caption-px: 22px; --stage-margin-px: 64px; width: 1280px; height: 720px;";
  const I = {
    mic: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    send: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    speaker: '<svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
    topic: '<svg aria-hidden="true" class="ic" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" viewBox="0 0 12 12"><circle cx="2.5" cy="6" r="1.5"/><circle cx="9.5" cy="2.5" r="1.5"/><circle cx="9.5" cy="9.5" r="1.5"/><path d="M4 5.3l4-2M4 6.7l4 2"/></svg>',
    file: '<svg aria-hidden="true" class="ic" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.6" viewBox="0 0 12 12"><path d="M3 1.5h4l2.5 2.5v6.5H3z"/></svg>',
    play: '<svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg>',
    pause: '<svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
    watch: '<svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9.3v5.4l4.6-2.7z" fill="currentColor" stroke="none"/></svg>',
    listen: '<svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4.5" height="7" rx="1.5"/><rect x="16.5" y="14" width="4.5" height="7" rx="1.5"/></svg>',
    read: '<svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3.5 5.5c3-1 5.8-.6 8.5 1v13c-2.7-1.6-5.5-2-8.5-1zM20.5 5.5c-3-1-5.8-.6-8.5 1v13c2.7-1.6 5.5-2 8.5-1z"/></svg>',
    plus: '<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  };
  const now = () => new Date().toTimeString().slice(0, 5);
  // Other Learn prototypes plug in through window.LearnExt (set before this script runs). Slice 1 has none.
  const EXT = window.LearnExt || null;

  /* ================================================================ slides (the player's own markup) */
  const SL = {
    title: (t, q, subject, meta) => `<section class="xp-slide xp-tc" data-type="intro"><div class="xp-tc-brand"><span aria-hidden="true" class="xp-mark xp-tc-mark">S</span><span class="xp-tc-kicker">Studiolo Lumen</span></div><div class="xp-tc-block"><div class="xp-tc-text" data-anchor="t1"><h1 class="xp-title xp-tc-title">${esc(t)}</h1><p class="xp-tc-question">${esc(q)}</p></div><p class="xp-tc-meta"><span class="xp-tc-subject">${esc(subject)}</span><span class="xp-tc-length">${esc(meta)}</span></p></div></section>`,
    list: (id, t, items, ol) => `<section class="xp-slide" data-anchor="${id}" data-type="${ol ? "ol" : "ul"}"><h2 class="xp-title">${esc(t)}</h2><${ol ? "ol" : "ul"} class="xp-list">${items.map((x, i) => `<li data-anchor="${id}.${i + 1}" class="xp-hl">${esc(x)}</li>`).join("")}</${ol ? "ol" : "ul"}></section>`,
    cards: (id, t, cs, choice) => `<section class="xp-slide" data-anchor="${id}" data-type="cards"><h2 class="xp-title">${esc(t)}</h2><div class="xp-cards" data-count="${cs.length}" style="--xp-cols: ${cs.length};">${cs.map(([h, p], i) => `<div class="xp-card xp-hl${choice ? " ll-choice" : ""}" data-anchor="${id}.${i + 1}"><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join("")}</div></section>`,
    table: (id, t, head, rows) => `<section class="xp-slide" data-anchor="${id}" data-type="table"><h2 class="xp-title">${esc(t)}</h2><table class="xp-table"><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r, i) => `<tr data-anchor="${id}.${i + 1}" class="xp-hl">${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></section>`,
  };
  let uid = 0;
  /** One beat (a slide and what's said over it) from the JSON shape Claude writes, or a scripted one. */
  function beat(o) {
    const id = "b" + ++uid;
    const items = o.items || (o.cards || []).map((c) => c[0]) || [];
    const html = o.type === "cards" ? SL.cards(id, o.title, (o.cards || []).slice(0, 4))
      : o.type === "table" ? SL.table(id, o.title, o.head || [], (o.rows || []).slice(0, 4))
      : SL.list(id, o.title, (o.items || []).slice(0, 5), o.type === "ol");
    const n = o.type === "table" ? (o.rows || []).length : o.type === "cards" ? (o.cards || []).length : (o.items || []).length;
    const lit = (o.cues || []).slice(0, n).map((c, i) => [String(c), `${id}.${i + 1}`]);
    return { id, o, title: o.title, html, say: o.say, lit, tag: o.tag || null, aside: !!o.aside, items };
  }
  const titleBeat = (L) => ({ id: "t" + ++uid, title: L.title, html: SL.title(L.title, L.q, L.subject, L.meta || "Live Lumen"), say: L.intro || `${L.q}`, lit: [], items: [], isTitle: true });

  /* ================================================================ the learner's Lumens and courses (sample data) */
  const MALQAF = {
    id: "malqaf", title: "How a malqaf moves air", q: "How does a tower cool a house without a fan?", subject: "Climate-responsive design", anchor: ["Culture & Context", "Climate-responsive design"], dur: "2:48", when: "Today", status: "in", progress: 0.88, made: "topic", area: "Culture & Context", meta: "2:48 · narrated",
    intro: "A malqaf is a tower that catches the breeze high above the roofs, and turns it into cool air inside the house.",
    beats: [
      { type: "ul", title: "A tower that catches the wind", items: ["Rises above the roofs", "Open face turned to the breeze", "Wind is faster and cleaner up high"], say: "A malqaf rises above the roofs, with one open face turned to the prevailing breeze. Up there the wind is faster and cleaner than in the lane below.", cues: ["rises", "open", "wind"] },
      { type: "cards", title: "The air speeds up as it drops", cards: [["Narrow shaft", "Squeezed air moves faster"], ["Wet jar or pool", "Water evaporates and cools the air"], ["Cool and heavy", "Cool air sinks into the room"]], say: "The shaft narrows, so the air speeds up as it drops. At the bottom it passes over a pool or a wet jar, and the water evaporating takes heat with it. Cool air is heavy, so it sinks into the room.", cues: ["shaft", "pool", "heavy"],
        rework: { type: "cards", tag: "Rewritten · as soup", title: "Like blowing on hot soup", cards: [["Blow", "The tower pushes air down"], ["Over water", "Wet surfaces lose heat to moving air"], ["Cooler", "Same as your spoon of soup"]], say: "Think of blowing on a spoon of hot soup. The tower is the blowing. The water at the bottom is the soup: moving air carries its heat away. So the air coming out is cooler, just like the soup.", cues: ["blowing", "water", "cooler"] } },
      { type: "ul", title: "Cool air spreads through the room", items: ["The cooled air sinks into the living room", "It pushes warm air toward the courtyard", "The house breathes without a single fan"], say: "The cooled air sinks into the living room and pushes the warm air out toward the courtyard. The house breathes, without a single fan.", cues: ["sinks", "pushes", "breathes"] },
      { type: "table", title: "Malqaf or barjeel?", head: ["", "Malqaf", "Barjeel"], rows: [["Faces", "One way, to the breeze", "Four ways, any wind"], ["Cools with", "Water at the bottom", "Mostly moving air"], ["See one", "Old Cairo houses", "Al Fahidi, Dubai"]], say: "The Gulf's barjeel is a cousin. A malqaf faces one way and often cools with water; a barjeel opens on four sides to catch wind from anywhere, and relies mostly on moving air.", cues: ["faces", "water", "barjeel"] },
    ],
    quiz: { q: "Why does the air speed up inside the malqaf?", options: [["The shaft narrows", "Squeezed air moves faster"], ["Hot air rises", "Warm air leaves the top"], ["A fan pulls it", "Hidden at the base"]], right: 0, yes: "Right: the shaft narrows, so the air has to move faster.", no: "Not quite: it's the narrowing shaft. Squeezed air moves faster." },
    answers: { "why does the air get cooler at the bottom": { type: "cards", aside: true, title: "Why the bottom is cooler", cards: [["Water", "A pool or a porous jar"], ["Evaporation", "Turning water to vapour needs heat"], ["From the air", "So the passing air loses heat"]], say: "Good question. At the bottom there's water, in a pool or a porous jar. Turning water into vapour needs heat, and it takes that heat from the air passing over it. So the air arrives cooler.", cues: ["water", "vapour", "arrives"] } },
    whats: "That's the heart of it: the passing air gives up heat to the water as it evaporates, so what reaches the room is cooler.",
  };
  const IWANS = {
    id: "iwans", title: "Four iwans: how the madrasa plan works", q: "Why build four halls around one court?", subject: "Islamic architecture", anchor: ["History & Theory", "Islamic architecture"], dur: "4:36", when: "Yesterday", status: "watched", made: "topic", area: "History & Theory", meta: "4:36 · narrated",
    intro: "The four-iwan plan starts from a court open to the sky, and everything in the building faces it.",
    beats: [
      { type: "ul", title: "Four halls around one court", items: ["A court open to the sky", "Four vaulted iwans face it, one on each side", "One hall for each school of law"], say: "Start with the court, open to the sky. Four vaulted halls, the iwans, face it, one in the middle of each side. In a madrasa, each hall could hold one school of law.", cues: ["court", "iwans", "madrasa"] },
      { type: "cards", title: "Where the plan came from", cards: [["Seljuk Iran", "Isfahan's Friday Mosque takes four iwans"], ["Mamluk Cairo", "Sultan Hassan gives each school an iwan"], ["Across the region", "Mosques, madrasas, caravanserais"]], say: "The plan grew up in Iran, at the Friday Mosque of Isfahan. In Cairo, Sultan Hassan gives each school of law its own iwan. From there it spreads to mosques, madrasas and caravanserais.", cues: ["iran", "cairo", "spreads"] },
      { type: "ol", title: "How to read a four-iwan plan", items: ["Find the court", "Find the qibla iwan: the deepest one", "Look at the corners"], say: "To read one of these plans: find the court, then the qibla iwan, the deepest one. Then look at the corners, where each building does something different.", cues: ["court", "qibla", "corners"] },
    ],
    quiz: { q: "In Sultan Hassan, what did each iwan hold?", options: [["One school of law", "Teaching for one Sunni school"], ["A tomb", "A burial chamber"], ["A market", "Shops to fund the building"]], right: 0, yes: "Exactly: one school of law each.", no: "It held one school of law. The tomb sits behind the qibla iwan." },
    whats: "That's the qibla iwan's side of the court: the hall that faces Mecca, always the deepest and tallest.",
  };
  const DARWIN = {
    id: "darwin2", title: "Struggle for existence and natural selection", q: "Why does a small advantage decide who survives?", subject: "Natural selection", anchor: ["Biology", "Natural selection"], dur: "3:05", when: "Yesterday", status: "in", made: "course", area: "From your library", meta: "Part 2 · 3:05",
    intro: "These two chapters are a piece of arithmetic before they are biology.",
    beats: [
      { type: "ul", title: "More are born than can survive", items: ["Every species breeds faster than its food supply grows", "Most young die before they breed", "So any useful difference is kept more often"], say: "Every species breeds faster than its food supply grows. So most young die before they breed, and any useful difference is kept more often.", cues: ["breeds", "die", "useful"] },
      { type: "cards", title: "A struggle in a large sense", cards: [["Not only fighting", "Any check on survival counts"], ["A plant in a desert", "Struggles against drought"], ["Small wins add up", "Over many generations"]], say: "Darwin means struggle in a large and metaphorical sense. It isn't only fighting: a plant on the edge of a desert struggles against drought. And small wins add up over many generations.", cues: ["fighting", "plant", "small"] },
    ],
    quiz: { q: "Why does Darwin call it a struggle 'in a large sense'?", options: [["Any check on survival counts", "Drought as much as a fight"], ["Animals fight a lot", "Combat between rivals"], ["Food runs out yearly", "Famine is constant"]], right: 0, yes: "Yes: drought counts as much as a fight.", no: "It's wider than fighting: any check on survival counts." },
    whats: "That's the arithmetic step: breeding outruns food, so not everyone can survive.",
  };
  const DECKS = { malqaf: MALQAF, iwans: IWANS, darwin2: DARWIN };
  // Long reads (stand-ins: the reader is its own piece of work).
  const READS = {
    cooling: { mins: 12, sections: ["The one idea", "Humidity changes the rules", "What the barjeel houses did", "Where the romance breaks", "What it means for your site"], paras: [
      "In Dubai, a wind tower can't make the air colder, but it can make the air move, and moving air is what makes people comfortable for much of the year. This long read follows that idea from the physics to your thesis site, quoting your lecture notes and Fathy where they help.",
      "Three mechanisms do the work. Wind pressure pushes air in on the windward side and pulls it out on the lee. The stack effect lets warm air rise and leave high up. And evaporation, where there's water, takes heat out of the air as it turns to vapour. Your lecture notes put the order in one line: shade first, then move air, then store or lose heat.",
      "Humidity is what makes Dubai different from Cairo. Evaporation needs dry air. On a humid August day the air is close to full of water, so the wet jar at the foot of an Egyptian malqaf does very little there, and the Gulf's barjeel relied instead on catching whatever breeze came off the sea."] },
    courtyards: { mins: 14, sections: ["What a courtyard does", "Dry heat: a well of cool air", "Humid heat: a path for breezes", "Proportions that work", "Shade before anything"], paras: [
      "In a dry climate a courtyard collects cool night air and holds it into the morning. In a humid one the nights barely cool, so that trick fades, and the courtyard earns its keep in other ways: shade, and a path for breezes through the rooms around it.",
      "A deep, narrow court shades its own floor and walls for most of the day. Open it to the prevailing wind, keep each room's other opening on the far side, and it becomes the outlet that pulls air across the house.",
      "So in humid places, judge a courtyard by two questions: how much of it is in shade at three in the afternoon, and where the air leaves the rooms around it. Thermal mass comes a distant third."] },
  };
  const LUMENS = [
    MALQAF,
    { id: "cooling", title: "Cooling without machines: wind, water and walls", q: "Can a house in Dubai stay cool the old way?", subject: "Climate-responsive design", anchor: ["Culture & Context", "Climate-responsive design"], noWatch: true, listen: "cool", listenDrive: "cool-drive", read: READS.cooling, when: "Today", status: "in", made: "topic", area: "Culture & Context", goal: "Thesis · Dubai courtyard house" },
    IWANS,
    { id: "sultan", title: "Reading Sultan Hassan before you go", q: "What should I look for when I stand in Sultan Hassan?", subject: "Islamic architecture", anchor: ["History & Theory", "Islamic architecture"], noWatch: true, listen: "hassan", when: "Yesterday", status: "new", made: "library", area: "History & Theory", goal: "Cairo trip · Mamluk buildings" },
    { id: "kept1", title: "Mass, air and humidity", q: "Why do heavy walls stop working in humid places?", subject: "Climate-responsive design", anchor: ["Culture & Context", "Climate-responsive design"], dur: "5:10", when: "Yesterday", status: "kept", made: "live", area: "Culture & Context", meta: "Live · 2 asides" },
    { id: "courtyards", title: "Courtyards in hot, humid places", q: "Does a courtyard still help when the air is humid?", subject: "Climate-responsive design", anchor: ["Culture & Context", "Climate-responsive design"], noWatch: true, read: READS.courtyards, when: "This week", status: "watched", made: "topic", area: "Culture & Context" },
    { id: "light", title: "How light shelves push daylight deeper", q: "How can a shelf throw light into the back of a room?", subject: "Daylight & shading", anchor: ["Environment & Services", "Daylight & shading"], dur: "3:12", when: "This week", status: "new", made: "topic", area: "Environment & Services", meta: "3:12 · narrated" },
    { id: "wind", title: "Wind catchers and the courtyard", q: "How do a tower and a court work together?", subject: "Climate-responsive design", anchor: ["Culture & Context", "Climate-responsive design"], dur: "4:02", when: "This week", status: "watched", made: "copilot", area: "Culture & Context", meta: "4:02 · narrated" },
    { id: "cordoba", title: "Córdoba: three enlargements on one grid", q: "How did one mosque grow three times without breaking?", subject: "From a video", item: "The Great Mosque of Córdoba, plan and extensions", dur: "3:40", when: "This week", status: "new", made: "library", area: "From your library", meta: "3:40 · narrated" },
    { id: "hill", title: "Hillenbrand on what makes a mosque", q: "What does every mosque need, and what is optional?", subject: "From a book", item: "Islamic Architecture: Form, Function and Meaning", dur: "4:05", when: "Earlier", status: "watched", made: "library", area: "From your library", meta: "4:05 · narrated" },
    { id: "suburb", title: "Cul-de-sac suburbs", q: "Why did post-war suburbs choose dead ends?", subject: "Form and morphology", anchor: ["Urbanism & Landscape", "Form and morphology"], dur: "2:34", when: "Earlier", status: "watched", made: "topic", area: "Urbanism & Landscape", meta: "2:34 · narrated" },
  ];
  const COURSES = [
    { id: "darwin", title: "On the Origin of Species", by: "Charles Darwin, 1859 · PDF, 502 pages", parts: ["The whole thing", "Variation and breeding", "Struggle for existence and natural selection", "Laws of variation", "Hybrids and the geological record", "Geographical distribution", "Classification and conclusion"], done: 2, now: 2, q: "From your library, in 7 parts" },
    { id: "proportion", title: "Proportion and order", by: "From Design & Composition", parts: ["Overview", "Ratios you can see", "The golden section, honestly", "Modular grids", "Le Corbusier's Modulor", "Proportion today"], done: 0, now: 0, q: "Why do some buildings feel calm before we know why?" },
    { id: "defeat", title: "Architecture of Defeat", by: "Kengo Kuma · from your library", parts: ["Overview", "Against the object", "Weak architecture", "Materials that disappear", "Particles", "What defeat builds"], done: 1, now: 1, q: "Why would an architect argue architecture should accept defeat?" },
  ];
  const MASS = {
    id: "mass", title: "Mass, air and humidity", q: "Why do heavy walls stop working in humid places?", subject: "Climate-responsive design", anchor: ["Culture & Context", "Climate-responsive design"], dur: "5:10", meta: "Live session",
    intro: "Heavy walls cool a building by storing the day's heat and losing it at night. That needs a cool night.",
    beats: [
      { type: "cards", title: "It depends on the night", cards: [["Hot and dry", "35° by day, 18° at night"], ["Hot and humid", "32° by day, 27° at night"], ["So", "In humid places the heat has nowhere to go"]], say: "Thick walls soak up the day's heat and lose it at night. In a dry climate the night drops to eighteen degrees, so it works. In a humid one it only drops to twenty-seven, and the heat has nowhere to go.", cues: ["thick", "humid", "nowhere"] },
      { type: "table", title: "What works where", head: ["", "Hot and dry", "Hot and humid"], rows: [["Night drop", "About 17°", "About 5°"], ["What cools you", "Thermal mass", "Moving air"], ["What it looks like", "Thick walls, courtyards", "Light walls, cross-breezes"]], say: "So dry climates use mass: thick walls, small windows, courtyards. Humid climates use moving air: light walls, deep shade, and breezes straight through.", cues: ["night", "mass", "air"] },
      { type: "ol", title: "What to check on site", items: ["How far it cools at night", "Where the breeze comes from", "Shade first, then mass"], say: "Three things to check on site: how far it cools at night, where the breeze comes from, and shade before mass, always.", cues: ["cools", "breeze", "shade"] },
    ],
  };
  DECKS.mass = MASS;
  // Live sessions are saved when you end them or leave the page, and can be resumed for 30 days.
  const SESSIONS = [
    { id: "s-iwans", L: IWANS, title: IWANS.title, i: 2, total: 4, when: "Tuesday", mins: 3, said: "Is Sultan Hassan built like this?", kept: false, asides: 1, rewrites: 0, days: 28,
      seed: [["ev", "Live from slide 2. The line is open; you can cut in at any point."], ["n", 2, IWANS.beats[0].say], ["you", "Is Sultan Hassan built like this?"], ["n", null, "Good question. Yes: Sultan Hassan in Cairo is the classic case, with four iwans around one court and a madrasa in each corner."], ["ev", "Your question became an aside."], ["n", 3, IWANS.beats[1].say], ["ev", "You left at slide 3. Session saved."]] },
    { id: "s-mass", L: MASS, title: MASS.title, i: 3, total: 4, when: "Yesterday", mins: 6, said: "Can you explain that like a bath?", kept: true, lumen: "kept1", asides: 2, rewrites: 1, days: 29,
      seed: [["n", 1, MASS.intro], ["n", 2, MASS.beats[0].say], ["you", "Can you explain that like a bath?"], ["ev", "Slide 2 rewritten as a bath."], ["n", 3, MASS.beats[1].say], ["ev", "Kept as a Lumen. Session ended at slide 4."]] },
  ];

  /* ================================================================ app state */
  // The Home bar picks how: the three formats, and Live (talked through now; the live part of slice 1, unchanged).
  const MODES = [["watch", "Watch"], ["listen", "Listen"], ["read", "Read"], ["live", '<span class="xp-dot" aria-hidden="true"></span>Live']];
  let mode0 = "watch"; try { mode0 = localStorage.getItem("ll-format") || "watch"; } catch { /* private */ }
  const S = { mode2: MODES.some(([k]) => k === mode0) ? mode0 : "watch", view: "home", tab: "home", ai: null, audio: true, filter: { area: "All", fmt: "all", state: "all", q: "", group: "date" }, journal: [], line: false, secs: 0, run: 0 };
  const BROWSER_OK = (() => { const u = navigator.userAgent; return /Chrome\/|Edg\//.test(u) && !/Mobile|Android|iPhone|iPad|OPR\//.test(u); })();
  (async () => { try { S.ai = window.claude ? await window.claude.use("sample") : null; } catch { S.ai = null; } aiBadge(); })();

  /* ================================================================ rendering the screens */
  function shell(screenName) {
    root.innerHTML = DATA.screens[screenName];
    $$(".navigation-rail .navigation-link[href], .tab-bar .tab-bar-link[href]", root).forEach((a) => a.removeAttribute("aria-current"));
  }
  function railCurrent(href) { $$(`.navigation-rail .navigation-link[href="${href}"], .tab-bar .tab-bar-link[href="${href}"]`, root).forEach((a) => a.setAttribute("aria-current", "page")); }
  function learnShell(inner) {
    shell("library");
    railCurrent("/learn");
    const main = $("main", root);
    main.innerHTML = `<div class="ll-page" data-view="${S.view}">${inner}</div>`;
    fitStages();
  }
  const TABS = [["home", "Home"], ["lumens", "Lumens"], ["courses", "Courses"]];
  const header = (sub) => `<header class="destination-header"><div class="destination-crumb"><strong>Learn</strong><i aria-hidden="true">/</i><span>${esc(sub)}</span></div><nav aria-label="Learn sections" class="destination-tabs">${TABS.map(([k, l]) => `<a class="destination-tab" href="#${k}" data-tab="${k}"${S.tab === k ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav></header>`;

  const poster = (L, extra = "") => `<div class="lx-poster"><div class="xp-box"><div class="xp-stage" style="${STAGE}">${SL.title(L.title, L.q, L.subject, L.meta || L.dur + " · narrated")}</div></div>${extra}</div>`;
  const tag = (L) => !L.item && !L.anchor ? "" : L.item ? `<span class="lx-tag" title="From your library">${I.file}<b>${esc(L.item)}</b></span>` : `<span class="lx-tag" title="${esc(L.anchor.join(" › "))}">${I.topic}<span>${esc(L.anchor[0])} › </span><b>${esc(L.anchor[1])}</b></span>`;
  const status = (L) => ({ new: '<b class="acc">New</b>', in: "<b>In progress</b>", watched: "<b>Finished</b>", kept: '<b class="live">Live · kept</b>', making: '<b class="acc">Being made</b>' })[L.status];
  /* ---------- formats */
  const FMT = { watch: "Watch", listen: "Listen", read: "Read" };
  const hasWatch = (L) => !!L.dur && !L.noWatch && L.making !== "watch";
  /** A Lumen's formats as [kind, label, made?, meta]. Listen's details come from the Listen layer. */
  function formats(L) {
    const d = L.listen && EXT?.dialogue?.(L.listen);
    return [
      ["watch", "Watch", hasWatch(L), hasWatch(L) ? L.dur : L.making === "watch" ? L.writingLabel || "Writing" : ""],
      ["listen", "Listen", !!d, d ? d.meta : ""],
      ["read", "Read", !!L.read && L.making !== "read", L.making === "read" ? L.writingLabel || "Writing" : L.read ? `${L.read.mins} min` : ""],
    ];
  }
  const primary = (L) => (formats(L).find((f) => f[2]) || ["watch"])[0];
  /** The formats on a card: made ones open it, missing ones offer to make it ("+ Listen"). */
  function fmtPills(L) {
    return `<span class="lf-pills" role="group" aria-label="Formats">${formats(L).map(([k, label, has, meta]) => has
      ? `<button type="button" class="lf-pill" data-fmt="${k}" data-lumen-id="${L.id}" title="${label} · ${esc(meta)}">${I[k]}<b>${label}</b><span${k === "listen" ? ` data-dl-meta="${L.listen}"` : ""}>${esc(meta)}</span></button>`
      : L.making === k ? `<span class="lf-pill making">${I[k]}<b>${label}</b><span class="ll-wr">${esc(meta || "Writing")}</span></span>`
      : `<button type="button" class="lf-pill add" data-addfmt="${k}" data-lumen-id="${L.id}" title="Make a ${label.toLowerCase()} version">${I.plus}${label}</button>`).join("")}</span>`;
  }
  /** The same switcher at the top of every Lumen page: its three formats, then Live (talk it through now).
   *  On the Watch page, Watch and Live are the player's own modes (recording and live), so one control does both. */
  function fmtSwitch(L, cur, { studio } = {}) {
    const fs = L ? formats(L) : [["watch", "Watch", true, ""]];
    const btn = ([k, label, has, meta]) => studio && k === "watch"
      ? `<button type="button" data-mode="recorded" aria-pressed="${cur === "watch"}">${I.watch}<b>Watch</b><small>${esc(meta || "recording")}</small></button>`
      : `<button type="button" ${has ? `data-fmt="${k}"` : L.making === k ? "disabled" : `data-addfmt="${k}"`} data-lumen-id="${L.id}" aria-pressed="${cur === k}" class="${has ? "" : "add"}">${I[k]}<b>${label}</b><small>${has ? esc(meta) : L.making === k ? esc(meta || "Writing") : "+ make"}</small></button>`;
    const live = studio ? 'data-mode="live"' : L && hasWatch(L) ? `data-golive="${L.id}"` : `data-livenow="${L?.id || ""}"`;
    return `<span class="lf-switch" role="group" aria-label="Format">${fs.map(btn).join("")}<i class="lf-sw-sep" aria-hidden="true"></i><button type="button" class="lf-sw-live" ${live} aria-pressed="${cur === "live"}" title="Studiolo talks you through it now; cut in any time"><span class="xp-dot" aria-hidden="true"></span><b>Live</b><small>talk it through</small></button></span>`;
  }
  const goalTag = (L) => (L.goal ? `<span class="dl-goal"><i aria-hidden="true">◎</i>For: ${esc(L.goal)}</span>` : "");
  const readPoster = (L) => `<div class="lx-poster lf-poster-read"><div class="lf-read-cover"><span class="k">${I.read}Long read</span><b>${esc(L.title)}</b><span class="m">${L.read ? `${L.read.mins} min read · ${L.read.sections.length} sections` : "Being written"}</span></div></div>`;
  function posterFor(L, extra = "") {
    const k = L.making === "watch" ? "watch" : primary(L);
    if (k === "listen" && EXT?.cover) return `<div class="lx-poster lf-poster-listen">${EXT.cover(L.listen)}${extra}</div>`;
    if (k === "read" || (!hasWatch(L) && L.making === "read")) return readPoster(L);
    return poster(L, extra);
  }
  function card(L) {
    const badge = L.made === "live" ? '<span class="lx-badge">Live · 2 asides</span>' : "";
    const prog = L.progress ? `<div class="lx-prog"><i style="width:${L.progress * 100}%"></i></div>` : "";
    const over = L.making === "watch" ? `<span class="lx-making"><span class="lx-dot" aria-hidden="true"></span><span class="ll-wr">${esc(L.writingLabel || "Writing")}</span></span>` : hasWatch(L) ? `<span class="lx-dur">${L.dur}</span>` : "";
    const live = hasWatch(L) ? `<button class="lf-live" type="button" data-golive="${L.id}" title="Talk it through live">${I.mic}<span>Live</span></button>` : "";
    return `<article class="lx-card" data-lumen="${L.id}">${posterFor(L, `${badge}${over}${prog}`)}<div class="lx-body">${tag(L)}<h3 class="lx-title"><a class="lx-link" href="#open-${L.id}">${esc(L.title)}</a></h3>
      <div class="ll-acts lf-acts">${fmtPills(L)}${live}</div>
      <div class="lx-ft"><span>${esc(L.when)}${L.goal ? ` · for ${esc(L.goal.split(" · ")[0].toLowerCase())}` : ""}</span>${status(L)}</div></div></article>`;
  }
  function courseCard(C) {
    const parts = C.parts.map((_, i) => `<i class="${i < C.done ? "done" : i === C.now ? "now" : ""}"></i>`).join("");
    return `<article class="lx-card" data-course="${C.id}">${poster({ title: C.title, q: C.q, subject: "Course", meta: `${C.parts.length} parts` }, `<span class="lx-badge">Course · ${C.parts.length} parts</span>`)}<div class="lx-body">
      <h3 class="lx-title"><a class="lx-link" href="#course-${C.id}">${esc(C.title)}</a></h3><div class="ll-parts" aria-label="${C.done} of ${C.parts.length} watched">${parts}</div>
      <p class="ll-next" style="margin:0">Next: <b>${C.now ? `Part ${C.now} · ${esc(C.parts[C.now])}` : "the overview"}</b></p>
      <div class="lx-ft"><span>${esc(C.by)}</span><b>${C.done} of ${C.parts.length} watched</b></div></div></article>`;
  }
  const sessionRow = (s) => `<article class="ll-srow" data-session="${s.id}">${poster({ title: s.title, q: "", subject: "Live session", meta: `Slide ${s.i + 1} of ${s.total}` }, `<div class="lx-prog"><i style="width:${Math.round(((s.i + 1) / s.total) * 100)}%"></i></div>`)}
    <div><h4>${esc(s.title)}</h4><p>Stopped at slide ${s.i + 1} of ${s.total} · ${esc(s.when)} · ${s.mins} min live${s.said ? ` · you asked <q>${esc(s.said)}</q>` : ""}</p>
      <p class="ll-keep">${s.kept ? '<span class="tag saved">Kept as a Lumen</span>' : '<span class="tag">Not kept</span>'} Resumable for ${s.days} more days</p></div>
    <div class="ll-acts"><button class="button" type="button" data-resume="${s.id}">${I.mic}Resume</button>${s.kept && s.lumen ? `<a class="button button-quiet" href="#play-${s.lumen}">Play the Lumen</a>` : ""}</div></article>`;
  const lastOpen = () => SESSIONS.find((x) => !x.ended) || null;

  let heroIO = null;
  const HINT = {
    watch: "<b>Watch</b> · slides and a narrator, 2–6 minutes. Made in the background, ready in about a minute.",
    listen: "<b>Listen</b> · two voices talk it through, 10–30 minutes, for a walk, a ride or a drive. Starts playing in about half a minute.",
    read: "<b>Read</b> · a long read, 10–20 minutes, quoting your sources. Made in the background.",
    live: "<b>Start a live session</b> · Studiolo talks you through it now, drawing slides as it goes. Interrupt any time, and keep it as a Lumen at the end. Uses voice minutes.",
  };
  const GO = { watch: "Make a Lumen", listen: "Make a Lumen", read: "Make a Lumen", live: '<span class="xp-dot" aria-hidden="true"></span>Start live session' };
  const PH = { watch: "What should it explain?", listen: "What should two voices talk through?", read: "What should it go into, at length?", live: "Ask, or hold the mic and talk" };
  /** One line under the bar: what the Lumen will be made for and from, with Tailor for the whole brief. */
  function briefLine() {
    const q = $("#ll-hero-in", root)?.value || "", el = $("#lf-brief", root); if (!el) return;
    el.innerHTML = (EXT?.briefPreview?.(q, S.mode2) || "") + '<button class="lf-tailor" type="button" data-tailor>Tailor…</button>';
  }
  function setKind(k) {
    S.mode2 = k; try { localStorage.setItem("ll-format", k); } catch { /* private */ }
    const f = $('[data-form="hero"]', root); if (!f) return;
    f.dataset.kind = k;
    $$("[data-kind]", f).forEach((b) => b.setAttribute("aria-checked", String(b.dataset.kind === k)));
    $(".ll-go", f).innerHTML = GO[k];
    $("#ll-hero-in", root).placeholder = PH[k];
    $(".ll-hint", root).innerHTML = HINT[k];
    const gl = $(".lf-golive", root); if (gl) gl.hidden = k === "live";
    briefLine();
  }
  /** Lumens being made from this bar (and ones just finished), right under it, so the result is never out of sight. */
  function worksRows() {
    const rows = LUMENS.filter((l) => l.making || l.fresh);
    if (!rows.length) return "";
    return `<div class="ll-works" role="status">${rows.map((l) => l.making
      ? `<div class="ll-work" data-work="${l.id}"><span class="lx-dot" aria-hidden="true"></span><span class="t"><b>Making · ${FMT[l.making]}</b> · ${esc(l.title)}</span><span class="ll-wr">${esc(l.writingLabel || "Writing")}</span>${l.making === "watch" ? `<button class="ll-chip" type="button" data-livenow="${l.id}">Talk it through live instead</button>` : ""}</div>`
      : `<div class="ll-work is-ready" data-work="${l.id}"><span class="ok" aria-hidden="true">✓</span><span class="t"><b>Ready · ${FMT[l.fresh]}</b> · ${esc(l.title)}</span><button class="button" type="button" data-fmt="${l.fresh}" data-lumen-id="${l.id}">${I[l.fresh]}${FMT[l.fresh]}</button></div>`).join("")}</div>`;
  }
  const explain = (q) => (S.mode2 === "live" ? startNew(q) : S.mode2 === "listen" && EXT?.quickListen ? EXT.quickListen(q) : S.mode2 === "read" ? makeRead(q) : makeLumen(q));
  /** Under Continue: what else is half-done, in whichever format it's in. */
  function alsoInProgress() {
    const d = EXT?.dialogue?.("cool"); if (!d) return "";
    return `<div class="lf-also"><span class="lab">Also in progress</span><button type="button" class="lf-also-row" data-fmt="listen" data-lumen-id="cooling">${I.listen}<b>Listen</b> · Cooling without machines <span>chapter ${d.ch} of ${d.chapters} · Resume</span></button><button type="button" class="lf-also-row" data-dl-drive="cool-drive">${EXT.carIcon || ""}<b>Driving?</b> <span>Play its drive edition</span></button></div>`;
  }
  function renderHome() {
    S.view = "home"; S.tab = "home";
    const starters = [["How do wind catchers actually cool a house?", "Climate-responsive design"], ["Why do four iwans face one court?", "Islamic architecture"], ["Explain thermal mass to me like a builder", "My Focus"], ["What's the golden section really for?", "Proportion and order"]];
    learnShell(`${header("Lumens, courses and live sessions")}
      <section class="ll-hero" aria-labelledby="ll-hero-t">
        <div class="ll-hero-top"><h2 id="ll-hero-t">What do you want to understand?</h2>
          ${lastOpen() ? `<button class="ll-resume-link" type="button" data-resume="${lastOpen().id}">${I.mic}<span>Resume live session · <b>${esc(lastOpen().title)}</b> · slide ${lastOpen().i + 1}</span></button>` : ""}
          <button class="ll-more" type="button" data-tab="sessions">Live sessions →</button></div>
        <form class="ll-ask" data-form="hero" data-kind="${S.mode2}">
          <span class="ll-mode" role="radiogroup" aria-label="Format">${MODES.map(([k, l]) => `<button type="button" role="radio" data-kind="${k}" aria-checked="${S.mode2 === k}">${I[k] || ""}${l}</button>`).join("")}</span>
          <label class="visually-hidden" for="ll-hero-in">What do you want to understand?</label><input id="ll-hero-in" autocomplete="off" placeholder="${PH[S.mode2]}">
          <button class="ll-mic" type="button" data-mic="hero" aria-label="Hold to talk" title="Hold to talk">${I.mic}</button><button class="ll-go" type="submit">${GO[S.mode2]}</button></form>
        <p class="ll-hint" aria-live="polite">${HINT[S.mode2]}</p>
        <div class="lf-under"><p class="lf-brief" id="lf-brief"></p><button class="lf-golive" type="button" data-livego${S.mode2 === "live" ? " hidden" : ""}><span class="xp-dot" aria-hidden="true"></span>Talk it through live instead</button></div>
        <div class="ll-starters" role="group" aria-label="Ideas"><span class="ll-try">Try</span>${starters.map(([t]) => `<button type="button" data-start="${esc(t)}">${esc(t)}</button>`).join("")}</div>
        ${worksRows()}
      </section>
      <article class="lx-cont" data-lumen="malqaf">${poster(MALQAF, `<span class="lx-dur">2:48</span><div class="lx-prog"><i style="width:88%"></i></div>`)}<div><p class="lx-lab">Continue</p><h2 class="lx-cont-title"><a class="lx-link" href="#play-malqaf">How a malqaf moves air</a></h2><p class="lx-cont-meta">Stopped at 2:28 of 2:48 · slide 4 · made today</p>
        <div class="lx-row" style="position:relative;z-index:2"><a class="lx-resume" href="#play-malqaf">▶ Resume</a><button class="button button-quiet ll-live-btn" type="button" data-golive="malqaf">${I.mic}Go live from slide 4</button>${tag(MALQAF)}</div></div></article>
      ${alsoInProgress()}
      <section class="ll-sec"><p class="ll-h">Courses <span>${COURSES.length}</span><button class="ll-more" type="button" data-tab="courses">All courses →</button></p><div class="ll-courses">${COURSES.map(courseCard).join("")}</div></section>
      <section class="ll-sec"><p class="ll-h">Recent Lumens <span>${LUMENS.length} this week and earlier</span><button class="ll-more" type="button" data-tab="lumens">All Lumens →</button></p><div class="lx-grid">${LUMENS.slice(0, 6).map(card).join("")}</div></section>`);
    briefLine();
    dock({ ctx: "Learn · Home", chips: ["How do wind catchers actually cool a house?", "Go live on How a malqaf moves air", "What should I watch next?"] });
    // On Home the live bar at the top is the input; the floating talk bar takes over once it scrolls out of view.
    const ask = $(".ll-ask", root);
    ld.hidden = true;
    heroIO?.disconnect();
    heroIO = new IntersectionObserver(([e]) => { if (S.view === "home") ld.hidden = e.isIntersecting; }, { threshold: 0 });
    heroIO.observe(ask);
  }
  function renderLumens() {
    S.view = "lumens"; S.tab = "lumens";
    const f = S.filter;
    const areas = ["All", ...new Set(LUMENS.map((l) => l.area))];
    const seg = (key, opts) => `<span class="ll-seg" role="group">${opts.map(([v, l]) => `<button type="button" aria-pressed="${f[key] === v}" data-f="${key}" data-v="${v}">${l}</button>`).join("")}</span>`;
    const tools = `<div class="ll-tools"><label class="visually-hidden" for="ll-q">Search your Lumens</label><input class="ll-search" id="ll-q" placeholder="Search your Lumens…" value="${esc(f.q)}"></div>
      <div class="ll-tools lf-tools">${seg("fmt", [["all", "All"], ["watch", `${I.watch}Watch`], ["listen", `${I.listen}Listen`], ["read", `${I.read}Read`], ["sessions", `<span class="xp-dot" aria-hidden="true"></span>Live sessions`]])}
        ${f.fmt === "sessions" ? "" : `${seg("state", [["all", "All"], ["new", "New"], ["in", "In progress"]])}<span><span class="ll-label">Group</span>${seg("group", [["date", "By date"], ["topic", "By topic"]])}</span>`}</div>`;
    if (f.fmt === "sessions") {
      learnShell(`${header("Live sessions")}${tools}<p class="ll-lede" style="margin:0 0 16px;max-width:66ch;font-size:13.5px;line-height:1.5;color:var(--ink-2)">Each time you talked a Lumen through live. Kept for 30 days; <b style="color:var(--ink);font-weight:500">Resume</b> picks up at the slide where you stopped. What you keep becomes a Lumen.</p><div class="ll-sessions">${SESSIONS.map((x) => sessionRow(x)).join("")}</div>`);
      dock({ ctx: "Learn · Live sessions", chips: ["How do wind catchers actually cool a house?"] });
      return;
    }
    const byFmt = (l) => f.fmt === "all" || (f.fmt === "watch" ? hasWatch(l) || l.making === "watch" : f.fmt === "listen" ? !!l.listen : !!l.read || l.making === "read");
    const list = LUMENS.filter((l) => byFmt(l) && (f.area === "All" || l.area === f.area) && (f.state === "all" || (f.state === "new" ? l.status === "new" : l.status === "in")) && (!f.q || (l.title + l.subject).toLowerCase().includes(f.q.toLowerCase())));
    const groups = f.group === "topic"
      ? [...new Set(list.map((l) => (l.anchor ? l.anchor.join(" › ") : l.area)))].map((g) => [g, list.filter((l) => (l.anchor ? l.anchor.join(" › ") : l.area) === g)])
      : ["Today", "Yesterday", "This week", "Earlier"].map((g) => [g, list.filter((l) => l.when === g)]).filter(([, l]) => l.length);
    learnShell(`${header(`${LUMENS.length} Lumens`)}${tools}
      <div class="lx-filter"><div aria-label="Areas" class="colls lx-chips" role="group">${areas.map((a) => `<button type="button" aria-pressed="${f.area === a}" class="${f.area === a ? "on" : ""}" data-area="${esc(a)}">${esc(a)}${a === "All" ? "" : ` <span>${LUMENS.filter((l) => l.area === a).length}</span>`}</button>`).join("")}</div></div>
      ${groups.length ? groups.map(([g, l]) => `<p class="lx-group">${esc(g)}<span>${l.length} Lumen${l.length > 1 ? "s" : ""}</span></p><div class="lx-grid">${l.map(card).join("")}</div>`).join("") : '<div class="lx-empty"><p>No Lumens match. Clear a filter, or make one from Home.</p></div>'}`);
    dock({ ctx: "Learn · Lumens", chips: ["Go live on How a malqaf moves air", "Which of these haven't I finished?", "I'm about to drive for 20 minutes"] });
  }
  function renderCourses() {
    S.view = "courses"; S.tab = "courses";
    learnShell(`${header(`${COURSES.length} courses`)}
      ${COURSES.map((C) => `<article class="ll-crow" data-course="${C.id}">${poster({ title: C.title, q: C.q, subject: "Course", meta: `${C.parts.length} parts` })}<div><h3>${esc(C.title)}</h3><p class="meta">${esc(C.by)} · ${C.done} of ${C.parts.length} watched</p><div class="ll-parts">${C.parts.map((_, i) => `<i class="${i < C.done ? "done" : i === C.now ? "now" : ""}"></i>`).join("")}</div>
        <div class="ll-acts" style="margin-top:12px"><a class="button" href="#course-${C.id}">${C.done ? "Continue" : "Start"}: ${C.now ? `Part ${C.now}` : "Overview"}</a><button class="button button-quiet ll-live-btn" type="button" data-golive="${C.id === "darwin" ? "darwin2" : "malqaf"}">${I.mic}Take ${C.now ? `Part ${C.now}` : "the overview"} live</button></div></div>
        <ol class="ll-outline">${C.parts.map((p, i) => `<li class="${i < C.done ? "done" : i === C.now ? "now" : ""}"><span class="st">${i < C.done ? "✓" : i === C.now ? "▸" : "·"}</span><span><b>${i ? `Part ${i}` : "Overview"}</b> · ${esc(p)}</span></li>`).join("")}</ol></article>`).join("")}`);
    dock({ ctx: "Learn · Courses", chips: ["Take Part 2 of Origin of Species live", "Quiz me on Part 1", "Which course should I finish first?"] });
  }
  /** Live sessions are a filter of Lumens, not a tab of their own. */
  function renderSessions() { S.filter.fmt = "sessions"; renderLumens(); }

  /* ---------- the stage: scale each 1280 x 720 stage to its box */
  const ro = new ResizeObserver((es) => es.forEach((e) => { const st = $(".xp-stage", e.target); if (st) st.style.transform = `scale(${e.contentRect.width / 1280})`; }));
  function fitStages() { $$(".xp-box", root).forEach((b) => { b.style.position = "relative"; const st = $(".xp-stage", b); if (st) { st.style.position = "absolute"; st.style.left = "0"; st.style.top = "0"; st.style.transformOrigin = "0 0"; } ro.observe(b); }); }

  /* ================================================================ the talk bar (Learn and the Graph only) */
  const ld = document.createElement("section");
  ld.className = "ld"; ld.setAttribute("aria-label", "Talk to Studiolo");
  ld.innerHTML = `<div class="ld-chips" role="group" aria-label="Things you could say"></div>
    <form class="ld-bar"><span class="ld-ctx"></span><span class="ld-meter" aria-hidden="true">${"<i></i>".repeat(7)}</span>
      <span class="ld-mid"><label class="visually-hidden" for="ld-in">Ask Studiolo</label><input id="ld-in" autocomplete="off" placeholder="Type a question, or hold the mic to talk"><p class="ld-live" aria-live="off"></p></span>
      <span class="ld-state" role="status"></span>
      <button class="ld-btn ld-audio" type="button" aria-pressed="true" aria-label="Narrator sound" title="Narrator sound">${I.speaker}</button>
      <button class="ll-mic" type="button" data-mic="dock" aria-label="Hold to talk" title="Hold to talk (or hold Space)">${I.mic}</button>
      <button class="ld-btn ld-send" type="submit" aria-label="Send">${I.send}</button></form>`;
  document.body.appendChild(ld);
  const LD = { chips: $(".ld-chips", ld), ctx: $(".ld-ctx", ld), input: $("#ld-in", ld), live: $(".ld-live", ld), state: $(".ld-state", ld) };
  function dock({ ctx, chips, right = 0 }) {
    ld.hidden = false; ld.dataset.view = S.view; LD.ctx.textContent = ctx; setChips(chips); ld.style.setProperty("--ld-right", right + "px");
    requestAnimationFrame(placeDock);
  }
  function placeDock() {
    const side = $(".ll-tx", root) || $(".cpwrap", root);
    if (!side || innerWidth < 1100) { ld.style.setProperty("--ld-right", "0px"); return; }
    ld.style.setProperty("--ld-right", Math.max(0, innerWidth - side.getBoundingClientRect().left + 6) + "px");
  }
  addEventListener("resize", placeDock);
  function setChips(list, kind = "say") { LD.chips.innerHTML = (list || []).map((t) => `<button type="button" data-kind="${kind}">${esc(t)}</button>`).join(""); }
  function setState(st, label) { ld.dataset.state = st; LD.state.textContent = label ?? { speaking: "Speaking", listening: S.line ? "Listening" : "", thinking: "Thinking…", hearing: "Hearing you…", writing: "Writing…" }[st] ?? ""; }
  $(".ld-bar", ld).addEventListener("submit", (e) => { e.preventDefault(); const t = LD.input.value; LD.input.value = ""; TX.interim(null); deliver(t, { typed: true }); });
  ld.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; if (b.matches(".ld-chips button")) return deliver(b.textContent, { typed: !S.line }); if (b.matches(".ld-audio")) { S.audio = !S.audio; b.setAttribute("aria-pressed", String(S.audio)); if (!S.audio) hush(); } });
  // Typing shows up in the transcript as you type: the same live line speech would make.
  LD.input.addEventListener("input", () => TX.interim(LD.input.value, true));

  /* ---------- hold to talk: simulated live transcription */
  let held = null;
  function holdStart(where) {
    if (held) return;
    EXT?.onHold?.(where);
    if (speaking) { speaking.cut(null); }
    const phrase = where === "hero" ? ($("#ll-hero-in", root)?.value || "How do wind catchers actually cool a house?") : (LD.chips.querySelector("button[data-kind=interrupt]") ? "Why does the air get cooler at the bottom?" : LD.chips.querySelector("button")?.textContent || "What should I watch next?");
    const words = phrase.split(/\s+/);
    held = { where, phrase, k: 0, t: null };
    $$(`[data-mic="${where}"]`).forEach((m) => (m.dataset.held = "true"));
    setState("hearing"); ld.dataset.captioning = "true"; LD.live.dataset.who = "you";
    // Words arrive a beat behind the voice, and the last one is revised once, as real speech-to-text does.
    held.t = setInterval(() => {
      if (!held) return;
      held.k = Math.min(words.length, held.k + 1);
      let shown = words.slice(0, held.k).join(" ");
      if (held.k < words.length && held.k > 2 && held.k % 3 === 0) shown += " " + words[held.k].slice(0, Math.max(2, words[held.k].length - 3)) + "…";
      LD.live.innerHTML = `<span>${esc(shown)}</span>`;
      if (where === "hero") { const i = $("#ll-hero-in", root); if (i) i.value = shown; }
      TX.interim(shown);
    }, 260);
  }
  function holdEnd() {
    if (!held) return;
    const h = held; held = null; clearInterval(h.t);
    $$("[data-mic]").forEach((m) => (m.dataset.held = "false"));
    ld.dataset.captioning = "false";
    if (h.k < 2) { setState("listening"); TX.interim(null); return; }
    const said = h.phrase.split(/\s+/).slice(0, Math.max(h.k, h.phrase.split(/\s+/).length)).join(" ");
    if (h.where === "hero") { TX.interim(null); if (S.mode2 !== "live") { const i = $("#ll-hero-in", root); if (i) { i.value = said; i.focus(); } return; } return startNew(said); }
    TX.interim(null);
    deliver(said, { spoken: true });
  }
  document.addEventListener("pointerdown", (e) => { const m = e.target.closest("[data-mic]"); if (m) { e.preventDefault(); holdStart(m.dataset.mic); } });
  document.addEventListener("pointerup", holdEnd);
  document.addEventListener("keydown", (e) => { if (e.code === "Space" && !e.repeat && !e.target.closest("input, textarea, button, select") && !ld.hidden) { e.preventDefault(); holdStart("dock"); } });
  document.addEventListener("keyup", (e) => { if (e.code === "Space" && held) { e.preventDefault(); holdEnd(); } });

  /* ================================================================ speaking */
  let voice = null;
  const pickVoice = () => { const all = window.speechSynthesis ? speechSynthesis.getVoices() : []; voice = all.find((v) => /en-GB/i.test(v.lang)) || all.find((v) => /^en/i.test(v.lang)) || null; };
  if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  const hush = () => { try { window.speechSynthesis && speechSynthesis.cancel(); } catch { /* none */ } };
  function tts(text, onWord, onEnd) {
    if (!S.audio || !window.speechSynthesis) return false;
    try { const u = new SpeechSynthesisUtterance(text); u.lang = "en-GB"; u.rate = 1.03; if (voice) u.voice = voice; u.onboundary = (e) => onWord(e.charIndex); u.onend = onEnd; u.onerror = onEnd; speechSynthesis.speak(u); return true; } catch { return false; }
  }
  const STOP = new Error("stop");
  let speaking = null, pending = null;
  /** Speaks `text`: caption on the stage and in the bar, words lit in the transcript, anchors lit as their cue words
   *  are said. Resolves {done} or {heard: "what the learner said"}. */
  function narr(text, { lit = [], entry = null, spoken = true } = {}) {
    const run = S.run;
    return new Promise((resolve, reject) => {
      setState("speaking");
      const words = String(text).split(/\s+/).filter(Boolean), starts = []; let pos = 0;
      for (const w of words) { const i = text.indexOf(w, pos); starts.push(i); pos = i + w.length; }
      const cues = lit.map(([cue, a]) => [Math.max(0, words.findIndex((w) => w.toLowerCase().replace(/[^a-z0-9']/g, "").startsWith(cue.toLowerCase().replace(/[^a-z0-9']/g, "")))), a]);
      ld.dataset.captioning = "true"; LD.live.dataset.who = "studiolo";
      let shown = -1, k = 0, done = false, last = 0;
      const draw = (n) => {
        if (n === shown) return; shown = n;
        LD.live.innerHTML = `<span>${words.slice(Math.max(0, n - 12), n + 1).map((w) => `<b>${esc(w)}</b>`).join(" ")} ${words.slice(n + 1, n + 5).map(esc).join(" ")}</span>`;
        STG.caption(words, n);
        if (entry) entry.querySelector(".tx").innerHTML = words.map((w, i) => (i <= n ? `<b>${esc(w)}</b>` : esc(w))).join(" ");
        for (const [at, a] of cues) if (n >= at) STG.light(a);
      };
      draw(0);
      const per = 60000 / 168, began = Date.now(), est = words.length * per;
      const clock = setInterval(() => { if (Date.now() - last > 700 && k < words.length - 1) draw(++k); else if (!voiced && k >= words.length - 1) finish({ done: true }); }, per);
      let voiced = spoken && tts(text, (ci) => { last = Date.now(); let j = starts.findIndex((s) => s > ci); j = j < 0 ? words.length - 1 : Math.max(0, j - 1); if (j > k) { k = j; draw(k); } }, (e) => {
        if (done) return;
        if ((e && e.type === "error") || Date.now() - began < est * 0.35) { voiced = false; return; }
        finish({ done: true });
      });
      const safety = setTimeout(() => finish({ done: true }), est * 1.9 + 2500);
      function finish(r) {
        if (done) return; done = true;
        clearInterval(clock); clearTimeout(safety); hush();
        speaking = null; STG.caption(null); ld.dataset.captioning = "false";
        if (entry) { entry.classList.add("done"); entry.querySelector(".tx").textContent = text; }
        if (run !== S.run) return reject(STOP);
        resolve(r);
      }
      speaking = { cut: (heard) => finish(heard ? { heard } : { stopped: true }) };
    });
  }
  function listen(chips, kind = "say") { const run = S.run; if (chips) setChips(chips, kind); setState("listening"); return new Promise((res, rej) => { pending = (t) => (run === S.run ? res(t) : rej(STOP)); }); }
  async function wait(ms) { const run = S.run; await sleep(ms); if (run !== S.run) throw STOP; }
  function deliver(text, how = {}) {
    text = String(text || "").trim(); if (!text) return;
    if (S.view !== "studio" && S.view !== "graph") return route(text);
    TX.you(text, how.typed && !S.line ? "typed" : "said");
    if (speaking) { const s = speaking; speaking = null; s.cut(text); return; }
    if (pending) { const p = pending; pending = null; p(text); return; }
    if (S.view === "studio") return SES.mode === "live" ? begin(() => SES.handle(text)) : begin(() => SES.written(text));
    route(text);
  }
  function begin(flow) {
    S.run++; if (speaking) speaking.cut(null); pending = null;
    Promise.resolve().then(flow).catch((e) => { if (e !== STOP) console.error(e); });
  }

  /* ================================================================ Claude, when this page may use it */
  const LEARNER = "The learner is an architect learning climate-responsive design and Islamic architecture. Their map has areas such as Culture & Context, History & Theory and Environment & Services.";
  const FORMAT = `Each slide is ONE JSON object on ONE line, one of:
{"type":"ul","title":"…","items":["…","…","…"],"say":"…","cues":["…","…","…"]}
{"type":"cards","title":"…","cards":[["Heading","Body, max 10 words"],["…","…"],["…","…"]],"say":"…","cues":["…","…","…"]}
{"type":"table","title":"…","head":["","Column A","Column B"],"rows":[["Row","…","…"],["…","…","…"],["…","…","…"]],"say":"…","cues":["…","…","…"]}
Items under 9 words. "say" is exactly what you speak over that slide: 35 to 60 words, warm, plain, covering each item in order. "cues" are single words taken from "say", one per item, in order, marking when you reach it. Never invent quotations, page numbers or statistics; if unsure of a fact, say so plainly.`;
  /** Streams JSON Lines from Claude, calling onObj for each complete object as it arrives. */
  async function streamLines(prompt, onObj, signal) {
    let pend = "";
    const eat = ({ delta }) => { const lines = (pend + delta).split("\n"); pend = lines.pop(); for (const l of lines) parse(l); };
    const parse = (l) => { l = l.trim().replace(/^```\w*|```$/g, "").trim(); if (!l.startsWith("{")) return; try { onObj(JSON.parse(l)); } catch { /* a broken line is skipped */ } };
    await S.ai(prompt, { onText: eat, modelTier: "quick", cache: false, signal });
    parse(pend);
  }
  function aiFail(e) {
    if (e === STOP || e?.code === "cancelled") throw STOP;
    const code = e?.code;
    if (["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].includes(code)) { S.ai = null; aiBadge(); TX.event("Live answers need your OK to use Claude, so a sample plays instead.", true); }
    else TX.event(code === "rate_limited" ? "Claude is busy for you right now. Try again in a minute." : "That answer didn't come through. Using the sample.", true);
  }
  const deckText = () => SES.beats.map((b, i) => `${i + 1}. ${b.title}`).join("\n");

  /* ================================================================ the stage */
  const STG = {
    el: null,
    mount(el) { this.el = el; },
    show(b) {
      if (!this.el) return;
      const host = $(".xp-slide-host", this.el); host.innerHTML = b.html;
      $$(".ll-stage-tag, .ll-stage-src", this.el).forEach((x) => x.remove());
      const st = $(".xp-stage", this.el);
      if (b.tag) st.insertAdjacentHTML("beforeend", `<span class="ll-stage-tag">${esc(b.tag)}</span>`);
      if (b.aside) st.insertAdjacentHTML("beforeend", '<span class="ll-stage-src"><b>Aside</b> · your question</span>');
      this.pointer(null);
    },
    light(a) {
      if (!this.el) return;
      $$(".xp-slide-host [data-lit]", this.el).forEach((x) => x.removeAttribute("data-lit"));
      const el = $(`.xp-slide-host [data-anchor="${a}"]`, this.el); if (!el) return;
      el.dataset.lit = "true"; this.pointer(el);
    },
    pointer(el) {
      const p = this.el && $(".xp-pointer", this.el); if (!p) return;
      if (!el) { p.dataset.visible = "false"; return; }
      const box = $(".xp-box", this.el), s = $(".xp-stage", this.el).getBoundingClientRect(), r = el.getBoundingClientRect(), k = box.clientWidth / 1280;
      if (!k) return;
      p.style.transform = `translate(${(r.left - s.left) / k - 30}px, ${(r.top - s.top) / k + r.height / k / 2}px)`; p.dataset.visible = "true";
    },
    caption(words, k) {
      const c = this.el && $(".xp-caption", this.el); if (!c) return;
      if (!words) { c.dataset.visible = "false"; return; }
      const from = Math.max(0, k - 9), to = Math.min(words.length, from + 18);
      c.innerHTML = words.slice(from, to).map((w, i) => (from + i <= k ? `<span>${i ? " " : ""}<b>${esc(w)}</b></span>` : `<span> ${esc(w)}</span>`)).join("");
      c.dataset.visible = "true";
    },
    writing(on) { const o = this.el && $(".xp-overlay", this.el); if (!o) return; $$(".xp-writing", o).forEach((w) => w.remove()); if (on) o.insertAdjacentHTML("beforeend", `<p class="xp-writing" role="status"><span aria-hidden="true" class="xp-dot"></span>${esc(on)}</p>`); },
  };

  /* ================================================================ the transcript */
  const TX = {
    body: null, int: null,
    mount(el) { this.body = el; this.int = null; },
    add(html, cls) { if (!this.body) return null; const d = document.createElement("div"); d.className = "ll-t " + cls; d.innerHTML = html; if (this.int && this.int.parentElement === this.body) this.body.insertBefore(d, this.int); else this.body.appendChild(d); this.body.scrollTop = this.body.scrollHeight; return d; },
    narrator(slideNo, text) { return this.add(`<div class="who"><span class="av" aria-hidden="true">S</span>Studiolo${slideNo ? `<span class="sl">Slide ${slideNo}</span>` : ""}<time>${now()}</time></div><p class="tx">${esc(text)}</p>`, "n"); },
    written(html) { return this.add(`<div class="who"><span class="av" aria-hidden="true">S</span>Studiolo<span class="sl">Written answer</span><time>${now()}</time></div><div class="tx" style="color:var(--text)">${html}</div>`, "n done"); },
    you(text, how) { this.interim(null); return this.add(`<div class="who">You${how === "typed" ? " · typed" : " · said"}<time>${now()}</time></div><p class="tx">${esc(text)}</p>`, "you"); },
    interim(text, typing) {
      if (!this.body) return;
      if (!text) { this.int?.remove(); this.int = null; return; }
      if (!this.int) { this.int = document.createElement("div"); this.int.className = "ll-t you interim"; this.body.appendChild(this.int); }
      this.int.innerHTML = `<div class="who">You · ${typing ? "typing" : "speaking"}…</div><p class="tx">${esc(text)}</p>`;
      this.body.scrollTop = this.body.scrollHeight;
    },
    event(text, warn) { return this.add(esc(text), "ev" + (warn ? " warn" : "")); },
    card(html) { return this.add(`<div class="box">${html}</div>`, "card"); },
  };

  /* ================================================================ the live session */
  const SES = {
    L: null, beats: [], i: 0, mode: "recorded", asides: 0, rewrites: 0, kept: false, streaming: false, ctl: null, secs: 0, tick: null, origin: null,
    open(L, { mode, from = 0, origin = "lumen" }) {
      EXT?.pause?.();
      leaveStudio();
      this.sid = null; this.lastSaid = null; this.heard = null;
      this.L = L; this.mode = mode; this.i = from; this.asides = 0; this.rewrites = 0; this.kept = false; this.origin = origin; this.secs = 0;
      this.beats = L.beats ? [titleBeat(L), ...L.beats.map((b) => beat(b))] : [titleBeat(L)];
      S.view = "studio";
      learnShell(this.markup());
      STG.mount($(".ll-stagecol", root)); TX.mount($(".ll-tx-body", root));
      fitStages();
      dock({ ctx: `Lumen · ${L.title}`, chips: [] });
      this.rail(); this.show(this.i);
      clearInterval(this.tick);
      this.tick = setInterval(() => { if (this.mode === "live") { this.secs++; const p = $(".ll-livepill", root); if (p) p.lastChild.textContent = ` Live session · ${Math.floor(this.secs / 60)}:${String(this.secs % 60).padStart(2, "0")}`; } }, 1000);
      this.paintMode();
    },
    markup() {
      const L = this.L;
      return `<header class="destination-header"><div class="destination-crumb"><strong>Learn</strong><i aria-hidden="true">/</i><a href="#lumens" data-tab="lumens">Lumens</a><i aria-hidden="true">/</i><span>${esc(L.title)}</span></div></header>
        <div class="ll-studio-head"><h1>${esc(L.title)}</h1>${fmtSwitch(LUMENS.find((x) => x.id === L.id), "watch", { studio: true })}<span class="ll-livepill" data-state="ended"><span class="xp-dot" aria-hidden="true"></span> Lumen · recording</span>${L.anchor ? tag(L) : ""}<span class="sp"></span>
          <button class="button button-quiet" type="button" data-act="keep" disabled title="Keep becomes available once you've changed the Lumen live">Keep this version</button></div>
        <div class="ll-studio"><div class="ll-stagecol">
          <div class="xp-screen-stage" data-captions="on" style="position:relative"><div class="xp-box"><div class="xp-stage" role="region" aria-label="Lumen stage" style="${STAGE}"><div class="xp-slide-host"></div><span class="xp-watermark" aria-hidden="true"><span class="xp-mark xp-watermark-mark" aria-hidden="true">S</span></span><span class="xp-pointer" aria-hidden="true" data-visible="false"><svg viewBox="0 0 20 28" width="22" height="30.8"><path d="M2 2 L2 22.5 L7.2 17.8 L11 26 L14.6 24.4 L10.9 16.3 L17.8 16.3 Z"></path></svg></span></div><div class="xp-overlay"><div class="xp-caption" aria-hidden="true" data-visible="false"></div></div></div></div>
          <div class="ll-ctrl"><button class="xp-ib xp-ib-play" type="button" aria-label="Play">${I.play}</button><span class="ll-progress" aria-hidden="true"></span><span class="ll-pos" style="font-variant-numeric:tabular-nums;white-space:nowrap"></span></div>
          <div class="ll-beats" role="group" aria-label="Slides"></div>
        </div>
        <aside class="ll-tx" aria-label="Transcript"><div class="ll-tx-head" role="tablist"><button type="button" role="tab" aria-selected="true" data-txtab="tx">Transcript</button><button type="button" role="tab" aria-selected="false" data-txtab="src">Sources</button><span class="sp"></span><span class="ll-hint">Tap a slide to ask about it</span></div><div class="ll-tx-body" role="log"></div><div class="ll-src" hidden>${this.sources()}</div></aside></div>`;
    },
    sources() {
      const L = this.L;
      const rows = L.id === "darwin2" ? [["On the Origin of Species, ch. III–IV", "PDF in your library · pp. 61–63"]] : L.id === "iwans" ? [["Sultan Hassan: plan, section and the four madrasas", "Lecture · your library"], ["Islamic Architecture: Form, Function and Meaning", "Book · your library"]] : [["Climate and Architecture: lecture notes", "PDF · your library · p. 2"], ["Light shelves in practice", "Link · your library"], ["Climate-responsive design", "Topic on your map"]];
      return rows.map(([a, b]) => `<div class="row"><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join("") + '<p class="note">Answers in a live session quote only these. Anything from general knowledge is marked as such.</p>';
    },
    rail() {
      const r = $(".ll-beats", root), p = $(".ll-progress", root); if (!r) return;
      r.innerHTML = this.beats.map((b, i) => `<button class="ll-beat" type="button" data-beat="${i}" aria-current="${i === this.i}"><div class="xp-box"><div class="xp-stage" style="${STAGE}">${b.html}</div></div><span><b>${i + 1}</b>${b.aside ? "<i>Aside</i>" : b.tag ? "<i>Rewritten</i>" : esc(b.title)}</span></button>`).join("") + (this.streaming ? '<span class="ll-beat is-writing"><div class="xp-box">Writing…</div><span>Next slide</span></span>' : "");
      p.innerHTML = this.beats.map((_, i) => `<i class="${i < this.i ? "done" : i === this.i ? "now" : ""}"></i>`).join("") + (this.streaming ? '<i class="writing"></i>' : "");
      $(".ll-pos", root).textContent = `Slide ${Math.min(this.i + 1, this.beats.length)} of ${this.beats.length}${this.streaming ? "+" : ""}`;
      fitStages();
      const cur = r.querySelector('[aria-current="true"]');
      if (cur) r.scrollLeft = Math.max(0, cur.offsetLeft - r.clientWidth / 2 + cur.clientWidth / 2);
    },
    show(i) { this.i = Math.max(0, Math.min(i, this.beats.length - 1)); STG.show(this.beats[this.i]); this.rail(); },
    playing(on) { const b = $(".xp-ib-play", root); if (b) { b.innerHTML = on ? I.pause : I.play; b.setAttribute("aria-label", on ? "Pause" : "Play"); } },
    paintMode() {
      const live = this.mode === "live";
      S.line = live;
      $$("[data-mode]", root).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === this.mode)));
      const pill = $(".ll-livepill", root); if (pill) { pill.dataset.state = live ? "live" : "ended"; pill.lastChild.textContent = live ? ` Live session · ${Math.floor(this.secs / 60)}:${String(this.secs % 60).padStart(2, "0")}` : " Lumen · recording"; }
      LD.input.placeholder = live ? "Say or type: stop, a question, another way…" : "Type a question for a written answer, or go live";
      if (!live) setChips(["Go live from this slide", "What's on this slide?", "Play the recording"]);
    },
    changed() { const k = $('[data-act="keep"]', root); if (k && !this.kept) { k.disabled = false; k.className = "button"; k.title = ""; } },

    /* Recording mode: plays the recorded narration; typed questions get written answers. */
    async playRecorded() {
      this.playing(true);
      while (this.i < this.beats.length) {
        const b = this.beats[this.i]; STG.show(b); this.rail();
        const r = await narr(b.say, { lit: b.lit });
        if (r.heard) { this.playing(false); return this.written(r.heard); }
        if (r.stopped) { this.playing(false); return; }
        this.i++;
      }
      this.i = this.beats.length - 1; this.playing(false); this.rail();
    },
    async written(text) {
      const t = text.toLowerCase();
      if (/go live|live from/.test(t)) return this.goLive();
      if (/play/.test(t)) return this.playRecorded();
      setState("thinking");
      const b = this.beats[this.i];
      let answer = null;
      if (S.ai) {
        try {
          const entry = TX.written('<span style="color:var(--ink-2)">Thinking…</span>');
          const { text: out } = await S.ai(`${LEARNER}\nThey are watching a Lumen titled "${this.L.title}". The slide on screen is "${b.title}"${b.items?.length ? ` (${b.items.join("; ")})` : ""}. Its narration: "${b.say}".\nTheir typed question: "${text}"\nAnswer in 2 to 4 plain sentences, as written text (it will not be spoken). If it needs general knowledge beyond the slide, say so. No headings.`, { modelTier: "quick", cache: false, onText: ({ text: x }) => { entry.querySelector(".tx").textContent = x; } });
          answer = out; entry.querySelector(".tx").textContent = out;
        } catch (e) { aiFail(e); }
      }
      if (!answer) TX.written(esc(/what'?s on|this slide/.test(t) ? `This slide is “${b.title}”. ${b.say}` : (this.L.whats || "Good question.") + " (Sample answer: with Claude allowed, this answers your exact question.)"));
      TX.event("Written answers use no voice minutes.");
      this.asides++; this.changed();
      setState("idle", "");
    },

    /* Live mode. */
    async goLive(from, { recap } = {}) {
      if (!BROWSER_OK && !(await browserNote())) return;
      if (from !== undefined) this.i = from;
      if (!this.sid) this.sid = "s" + ++uid;
      this.mode = "live"; this.paintMode();
      if (!recap) TX.event(`Live session from slide ${this.i + 1}. The line is open; you can cut in at any point.`);
      await this.loop(true, recap);
    },
    /** Saves this live session so it can be resumed: where it stopped, the slides as changed, everything said. */
    save(note) {
      if (!this.sid) return;
      let s = SESSIONS.find((x) => x.id === this.sid);
      if (!s) { s = { id: this.sid, days: 30 }; SESSIONS.unshift(s); }
      if (note) TX.event(note);
      Object.assign(s, { L: this.L, saved: this.beats.slice(), i: Math.min(this.i, this.beats.length - 1), total: this.beats.length, title: this.L.title, when: "Today", mins: Math.max(1, Math.round(this.secs / 60)), secs: this.secs, said: this.lastSaid || s.said || "", kept: this.kept, lumen: this.kept ? this.L.id + "-kept" : s.lumen, asides: this.asides, rewrites: this.rewrites, tx: TX.body ? TX.body.innerHTML : s.tx, ended: false });
    },
    resume(s) {
      this.open(s.L || MASS, { mode: "recorded" });
      if (s.saved) this.beats = s.saved.slice();
      this.sid = s.id; this.i = Math.min(s.i, this.beats.length - 1);
      this.asides = s.asides || 0; this.rewrites = s.rewrites || 0; this.kept = !!s.kept; this.secs = s.secs || s.mins * 60; this.lastSaid = s.said;
      if (s.tx) TX.body.innerHTML = s.tx;
      else for (const [k, a, b] of s.seed || []) { if (k === "ev") TX.event(a); else if (k === "you") TX.you(a, "said"); else { const e = TX.narrator(a, b); e.classList.add("done"); } }
      TX.add(`Resumed · ${s.when === "Today" ? "today" : s.when}'s session, at slide ${this.i + 1}`, "ev resumed");
      if (this.kept) { const k = $('[data-act="keep"]', root); if (k) { k.disabled = true; k.textContent = "Kept"; } }
      else if (this.asides + this.rewrites) this.changed();
      this.show(this.i);
      const at = this.beats[this.i];
      begin(() => this.goLive(undefined, { recap: `Welcome back. We stopped at slide ${this.i + 1}, ${at.title}.${s.said ? ` Last time you asked: ${s.said}` : ""} I'll carry on from there.` }));
    },
    async endLive() {
      this.mode = "recorded"; this.paintMode(); hush(); this.playing(false); STG.writing(null);
      const changes = this.asides + this.rewrites;
      this.save();
      TX.card(`<h5>Back to the recording</h5><dl><dt>This session</dt><dd>${Math.floor(this.secs / 60)}:${String(this.secs % 60).padStart(2, "0")} live · ${this.asides} question${this.asides === 1 ? "" : "s"} · ${this.rewrites} slide${this.rewrites === 1 ? "" : "s"} reworded</dd><dt>Keep</dt><dd>${changes ? "Keep this version saves the Lumen as you shaped it, with your questions as asides. It's voiced the first time you play it." : "Nothing changed, so there's nothing to keep."}</dd><dt>Saved</dt><dd>This session is in Learn → Live sessions for 30 days. Resume picks up at slide ${this.i + 1}.</dd></dl>`);
      this.save();
    },
    async loop(intro, recap) {
      const INT = ["Stop", "Explain that another way", "Simpler", "Go deeper", "From my field", "Test me", "Skip", "Back", "End live"];
      this.playing(true);
      if (intro) { setChips(INT, "interrupt"); const e = TX.narrator(this.i + 1, ""); const r = await this.say(recap || (this.i === 0 ? `${this.L.intro || this.L.q} Cut in whenever you like.` : "I'll take it from this slide. Cut in whenever you like."), e, []); if (r.heard) this.heard = r.heard; }
      while (this.mode === "live") {
        if (this.heard) { const h = this.heard; this.heard = null; await this.handle(h, true); continue; }
        if (this.i >= this.beats.length) {
          if (this.streaming) { STG.writing("Writing the next slide…"); setState("writing"); await this.waitBeat(); STG.writing(null); continue; }
          break;
        }
        const b = this.beats[this.i];
        STG.show(b); this.rail(); setChips(INT, "interrupt");
        const entry = TX.narrator(this.i + 1, b.say);
        const r = await this.say(b.say, entry, b.lit);
        if (r.heard) { await this.handle(r.heard, true); continue; }
        if (r.stopped) return;
        this.i++;
      }
      if (this.mode !== "live") return;
      this.i = this.beats.length - 1; this.rail(); this.playing(false);
      const e = TX.narrator(null, "");
      await this.say("That's the end. Want to test yourself, go deeper, or keep this version?", e, []);
      for (;;) {
        const a = this.heard || await listen(["Test me", "Go deeper", "Keep this version", "End live"]); this.heard = null;
        const t = a.toLowerCase(); this.lastSaid = a;
        if (/^end|back to the recording/.test(t)) return this.endLive();
        if (/keep/.test(t)) { this.keep(); continue; }
        if (/test|quiz/.test(t)) { await this.quiz(); STG.show(this.beats[this.i]); continue; }
        if (/deeper/.test(t)) { await this.deeper(); return this.loop(false); }
        if (/another way|simpler|field/.test(t)) { await this.rework(/simpler/.test(t) ? "simpler" : /field/.test(t) ? "field" : "another"); return this.loop(false); }
        await this.ask(a); return this.loop(false);
      }
    },
    say(text, entry, lit) { return narr(text, { lit, entry }); },
    waitBeat() { const n = this.beats.length; return new Promise((res) => { const t = setInterval(() => { if (this.beats.length > n || !this.streaming || this.mode !== "live") { clearInterval(t); res(); } }, 200); }); },

    /** Everything the learner can say while live. `inLoop` is true when called from inside the narration loop. */
    async handle(text, inLoop) {
      const t = text.toLowerCase(); this.lastSaid = text;
      const resume = async () => { if (!inLoop) await this.loop(false); };
      if (/^end|stop live|back to the recording/.test(t)) { await this.endLive(); return; }
      if (/^keep/.test(t)) { this.keep(); if (!inLoop) return; return; }
      if (/^(stop|wait|hold on|pause)/.test(t)) {
        this.playing(false); STG.writing(null);
        const e = TX.narrator(null, ""); await this.say("Sure, I'll wait.", e, []);
        TX.event("Paused. The line closes after 30 seconds of quiet, so silence isn't billed.");
        const back = await listen(["Carry on", "End live"]);
        if (/end/i.test(back)) return this.endLive();
        this.playing(true); return resume();
      }
      if (/^(carry on|go on|continue|resume)/.test(t)) return resume();
      if (/^skip|^next/.test(t)) { TX.event(`Skipped slide ${this.i + 1}.`); this.i++; return resume(); }
      if (/^back|previous|go back/.test(t)) { this.i = Math.max(0, this.i - 1); return resume(); }
      if (/test me|quiz/.test(t)) { await this.quiz(); this.i++; return resume(); }
      if (/another way|simpler|from my field|my field|example from|differently|don't get/.test(t)) { await this.rework(/simpler/.test(t) ? "simpler" : /field|example/.test(t) ? "field" : "another"); return resume(); }
      if (/deeper|more detail|go further/.test(t)) { await this.deeper(); return resume(); }
      // Anything else is a question: answered as an aside, then back to where we were.
      await this.ask(text);
      return resume();
    },
    // A short reply (a bridge like "Good question"): anything said over it is kept and handled next, never dropped.
    async say1(text) { const e = TX.narrator(null, ""); const r = await this.say(text, e, []); if (r.heard) this.heard = r.heard; return r; },
    async rework(how) {
      const b = this.beats[this.i]; if (!b || b.isTitle) { await this.say1("Let me put that more simply: " + (this.L.intro || this.L.q)); return; }
      STG.writing("Rewriting this slide…"); setState("thinking");
      const bridge = this.say1(how === "simpler" ? "Let me make that simpler." : how === "field" ? "Let me put it in architect's terms." : "Let me try it another way.");
      let nb = null;
      if (S.ai) {
        try {
          const ctl = new AbortController();
          await streamLines(`${LEARNER}\nYou are narrating a Lumen titled "${this.L.title}". Outline:\n${deckText()}\nThe learner said "${this.lastSaid}" about this slide:\n${JSON.stringify(b.o || { title: b.title, say: b.say })}\nRewrite this ONE slide ${how === "simpler" ? "more simply, for a beginner" : how === "field" ? "with an example from an architect's own practice" : "another way, through an everyday analogy"}, making the same point. Add a "tag" field of 2 to 4 words naming the new approach, starting "Rewritten ·", for example "Rewritten · as soup".\nReply with exactly one line of JSON and nothing else.\n${FORMAT}`, (o) => { if (!nb && o.title) nb = beat({ ...o, tag: o.tag || "Rewritten" }); }, ctl.signal);
        } catch (e) { aiFail(e); }
      }
      if (!nb) { const rw = this.L.beats?.find((x) => x.title === b.title)?.rework; nb = beat(rw || { ...b.o, tag: "Rewritten · simpler", say: "In short: " + b.say }); if (!S.ai) TX.event("Sample rewrite. With Claude allowed, the slide is rewritten for what you said."); }
      await bridge; STG.writing(null);
      this.beats[this.i] = nb; this.rewrites++; this.changed();
      TX.event(`Slide ${this.i + 1} ${nb.tag ? nb.tag.toLowerCase().replace("rewritten ·", "rewritten") : "rewritten"}.`);
    },
    async deeper() {
      const b = this.beats[this.i];
      STG.writing("Writing one more slide…");
      const bridge = this.say1("Sure, one more slide on that.");
      let nb = null;
      if (S.ai) {
        try { await streamLines(`${LEARNER}\nYou are narrating a Lumen titled "${this.L.title}". Outline:\n${deckText()}\nThe learner wants to go deeper on slide "${b.title}" (${b.say}). Write ONE new slide that goes one level deeper on that point.\nReply with exactly one line of JSON and nothing else.\n${FORMAT}`, (o) => { if (!nb && o.title) nb = beat({ ...o, tag: "Added · deeper" }); }); } catch (e) { aiFail(e); }
      }
      if (!nb) nb = beat({ type: "ul", tag: "Added · deeper", title: "One level deeper", items: ["Why the narrow shaft matters", "Where the water sits", "When it stops working"], say: "One level deeper: the narrow shaft speeds the air up, the water sits where the air is fastest, and the whole thing stops working when the air outside is already humid.", cues: ["shaft", "water", "humid"] });
      await bridge; STG.writing(null);
      this.beats.splice(this.i + 1, 0, nb); this.i++; this.rewrites++; this.changed(); this.rail();
      TX.event(`Added slide ${this.i + 1}, going deeper.`);
    },
    async ask(question) {
      setState("thinking"); STG.writing("Answering…");
      const bridge = this.say1("Good question.");
      const add = [];
      if (S.ai) {
        try { await streamLines(`${LEARNER}\nYou are narrating a Lumen titled "${this.L.title}". Outline:\n${deckText()}\nThe learner interrupted slide "${this.beats[this.i]?.title}" to ask: "${question}"\nAnswer with ONE slide (two only if really needed). Start "say" by answering directly. Mark facts from general knowledge as such.\nReply with JSON Lines only.\n${FORMAT}`, (o) => { if (o.title && add.length < 2) add.push(beat({ ...o, aside: true })); }); } catch (e) { aiFail(e); }
      }
      if (!add.length) {
        const k = Object.keys(this.L.answers || {}).find((q) => question.toLowerCase().includes(q.split(" ").slice(-3).join(" ")));
        add.push(beat(k ? this.L.answers[k] : { type: "ul", aside: true, title: "Your question", items: [question.slice(0, 48)], say: `${question} With Claude allowed, I'd answer that here, as an aside drawn from this Lumen's sources.`, cues: [question.split(" ")[0]] }));
      }
      await bridge; STG.writing(null);
      this.beats.splice(this.i + 1, 0, ...add); this.i++; this.asides++; this.changed(); this.rail();
      TX.event(`Your question became an aside: slide ${this.i + 1}.`);
    },
    async whatsThis(text) {
      if (speaking) speaking.cut(null);
      TX.you(`What's this? “${text}”`, "said");
      this.lastSaid = text;
      let ans = null;
      if (S.ai) {
        try { setState("thinking"); const { text: out } = await S.ai(`${LEARNER}\nThey tapped "${text}" on the slide "${this.beats[this.i].title}" of a Lumen titled "${this.L.title}" and asked what it means. Answer in one or two spoken sentences, under 40 words.`, { modelTier: "quick", cache: false }); ans = out; } catch (e) { aiFail(e); }
      }
      await this.say1(ans || this.L.whats || "That's the key idea on this slide.");
      this.asides++; this.changed();
    },
    async quiz() {
      let qz = this.L.quiz || MALQAF.quiz;
      if (S.ai) {
        try { setState("thinking"); const o = await S.ai.json(`${LEARNER}\nWrite one multiple-choice check question about this Lumen, "${this.L.title}":\n${this.beats.map((b) => b.title + ": " + b.say).join("\n")}\nReply with only JSON: {"q":"question","options":[["answer","why, max 8 words"],["…","…"],["…","…"]],"right":0,"yes":"one sentence when right","no":"one sentence when wrong, giving the answer"}. Put the right answer at a random index.`, { modelTier: "quick", cache: false }); if (o?.q && Array.isArray(o.options)) qz = o; } catch (e) { aiFail(e); }
      }
      const id = "q" + ++uid;
      STG.show({ html: SL.cards(id, qz.q, qz.options.slice(0, 3), true), tag: "Check" });
      await this.say1(qz.q + " Tap one, or tell me.");
      const run = S.run;
      const ans = await new Promise((res, rej) => {
        setChips(qz.options.map((o) => o[0])); setState("listening");
        const onClick = (e) => { const c = e.target.closest(".ll-choice"); if (c) { root.removeEventListener("click", onClick, true); pending = null; TX.you(c.querySelector("h3").textContent, "said"); run === S.run ? res(c.querySelector("h3").textContent) : rej(STOP); } };
        root.addEventListener("click", onClick, true);
        pending = (t) => { root.removeEventListener("click", onClick, true); run === S.run ? res(t) : rej(STOP); };
      });
      const idx = qz.options.findIndex((o) => o[0].toLowerCase() === String(ans).toLowerCase());
      const ok = idx === Number(qz.right);
      $$(".ll-choice", root).forEach((c, j) => { if (j === Number(qz.right)) c.dataset.picked = "right"; else if (j === idx) c.dataset.picked = "wrong"; });
      await this.say1(ok ? qz.yes : qz.no);
      TX.event(ok ? "Check: right." : "Check: missed. It'll come back in 3 days.");
    },
    keep() {
      if (this.kept) return;
      this.kept = true;
      const k = $('[data-act="keep"]', root); if (k) { k.disabled = true; k.textContent = "Kept"; k.className = "button button-quiet"; }
      const topic = this.L.anchor ? this.L.anchor[1] : "your map";
      S.journal.push({ topic, html: `Live session on <b>${esc(this.L.title)}</b>: ${this.asides} question${this.asides === 1 ? "" : "s"}, ${this.rewrites} slide${this.rewrites === 1 ? "" : "s"} reworded. Kept as a Lumen.` });
      this.save();
      if (!LUMENS.some((l) => l.id === this.L.id + "-kept")) LUMENS.unshift({ ...this.L, id: this.L.id + "-kept", beats: null, status: "kept", made: "live", when: "Today", meta: `Live · ${this.asides} asides`, dur: this.L.dur || "5:00" });
      toast("Kept as a Lumen.", `Your version, with ${this.asides} aside${this.asides === 1 ? "" : "s"}, is in Learn and on ${esc(topic)}. It's voiced the first time you play it.`);
      TX.event(`Kept. A line was added to ${topic}'s journal in Loci; its chat is untouched.`);
    },
  };

  /* Starting a new Live Lumen ("Explain live"): a normal 2-6 minute Lumen, performed live from the first slide. */
  async function startNew(q, anchor) {
    q = String(q || "").trim(); if (!q) return;
    if (!BROWSER_OK && !(await browserNote())) return;
    const L = { id: "new" + ++uid, title: q.replace(/\?$/, "").slice(0, 60), q, subject: anchor || "Live", anchor: anchor ? ["Culture & Context", anchor] : null, dur: "≈4:00", meta: "Live Lumen · being written", intro: "", beats: null };
    SES.open(L, { mode: "recorded", origin: "new" });
    SES.sid = "s" + ++uid;
    SES.mode = "live"; SES.paintMode();
    TX.you(q, "said");
    TX.event("Live session started. Studiolo writes the slides as it talks; keep it at the end to save it as a Lumen.");
    SES.streaming = true; SES.rail();
    // The writer belongs to this Lumen, not to a turn: interrupting the narrator never stops the slides being written.
    const mine = () => SES.L === L;
    let gotTitle = false;
    const writer = (async () => {
      if (S.ai) {
        try {
          await streamLines(`${LEARNER}\nMake a Lumen: a narrated slide explainer you will speak aloud, live, to this learner.\n${anchor ? `It's about their topic "${anchor}".\n` : ""}They asked: "${q}"\nReply with JSON Lines only. First line: {"title":"at most 7 words","question":"the question in one line","intro":"one spoken opening sentence, under 25 words"}. Then 5 slide lines, using at least two slide types, building from the basics to one practical takeaway.\n${FORMAT}`, (o) => {
            if (!mine()) return;
            if (!gotTitle && o.question !== undefined) { gotTitle = true; L.title = o.title || L.title; L.q = o.question || q; L.intro = o.intro || ""; SES.beats[0] = titleBeat(L); $(".ll-studio-head h1", root).textContent = L.title; if (SES.i === 0) STG.show(SES.beats[0]); SES.rail(); return; }
            if (o.title && o.say) { SES.beats.push(beat(o)); SES.rail(); }
          });
        } catch (e) { if (e === STOP) return; try { aiFail(e); } catch { return; } }
      }
      if (SES.beats.length < 2 && mine()) {
        if (S.ai === null) TX.event("Sample Lumen: with Claude allowed, this is written for your exact question.");
        Object.assign(L, { title: MALQAF.title, q: MALQAF.q, intro: MALQAF.intro, subject: MALQAF.subject, anchor: MALQAF.anchor, quiz: MALQAF.quiz, answers: MALQAF.answers, whats: MALQAF.whats, beats: MALQAF.beats });
        SES.beats[0] = titleBeat(L); $(".ll-studio-head h1", root).textContent = L.title;
        for (const b of MALQAF.beats) { await sleep(900); if (!mine()) return; SES.beats.push(beat(b)); SES.rail(); }
      }
      if (mine()) { SES.streaming = false; SES.rail(); }
    })();
    const first = (async () => {
      SES.playing(true);
      const e = TX.narrator(1, "");
      await SES.say("Good question. Give me a moment while I sketch the first slide.", e, []);
      while (SES.beats.length < 2 && SES.streaming) { STG.writing("Writing the first slide…"); setState("writing"); await wait(250); }
      STG.writing(null);
      await SES.loop(false);
    });
    begin(() => first());
    writer.catch(() => {});
  }

  /** "Make a Lumen": the normal explain. Written and voiced in the background; nothing to talk to until you go live. */
  /** A new Lumen from the bar or the brief, or an existing one getting its first format of this kind. */
  function lumenFor(q, { into, anchor, goal } = {}) {
    if (into) return into;
    const L = { id: "made" + ++uid, title: q.replace(/\?$/, "").slice(0, 60), q, subject: anchor?.[1] || "Asked in Learn", anchor: anchor || null, noWatch: true, when: "Today", status: "new", made: "topic", area: anchor?.[0] || "Asked in Learn", goal: goal || null };
    LUMENS.unshift(L);
    return L;
  }
  async function makeLumen(q, opts = {}) {
    q = String(q || "").trim(); if (!q) return;
    const L = lumenFor(q, opts);
    Object.assign(L, { making: "watch", writingLabel: "Writing", beats: [], meta: "Being made" }); delete L.dur;
    DECKS[L.id] = L;
    const anchor = L.anchor?.[1] || null;
    const hi = $("#ll-hero-in", root); if (hi) hi.value = "";
    if (S.view === "home") renderHome();
    toast("Making your Lumen.", "Watch: it's being written and voiced. Keep working; it'll be ready in about a minute.");
    const label = (t) => { L.writingLabel = t; $$(`[data-lumen="${L.id}"] .ll-wr, [data-work="${L.id}"] .ll-wr`, root).forEach((x) => (x.textContent = t)); };
    if (S.ai) {
      let n = 0;
      try {
        await streamLines(`${LEARNER}\nMake a Lumen: a narrated slide explainer for this learner to watch later.\n${anchor ? `It's about their topic "${anchor}".\n` : ""}They asked: "${q}"\nReply with JSON Lines only. First line: {"title":"at most 7 words","question":"the question in one line","intro":"one spoken opening sentence, under 25 words"}. Then 5 slide lines, using at least two slide types, building from the basics to one practical takeaway.\n${FORMAT}`, (o) => {
          if (o.question !== undefined && !L.intro) { L.title = o.title || L.title; L.q = o.question || q; L.intro = o.intro || ""; $$(`[data-lumen="${L.id}"] .lx-title a`, root).forEach((x) => (x.textContent = L.title)); return; }
          if (o.title && o.say) { L.beats.push(o); label(`Writing · slide ${++n + 1}`); }
        });
      } catch (e) { try { aiFail(e); } catch { /* stopped */ } }
    }
    if (L.beats.length < 2) {
      Object.assign(L, opts.into ? { intro: MALQAF.intro, quiz: MALQAF.quiz, answers: MALQAF.answers, whats: MALQAF.whats, beats: [] } : { title: MALQAF.title, q: MALQAF.q, intro: MALQAF.intro, subject: MALQAF.subject, anchor: MALQAF.anchor, area: MALQAF.area, quiz: MALQAF.quiz, answers: MALQAF.answers, whats: MALQAF.whats, beats: [] });
      for (let i = 0; i < MALQAF.beats.length; i++) { await sleep(1300); L.beats.push(MALQAF.beats[i]); label(`Writing · slide ${i + 2}`); }
    }
    label("Voicing");
    await sleep(1800);
    L.making = null; L.noWatch = false; L.fresh = "watch"; L.dur = `${Math.max(2, Math.round(L.beats.length * 0.7))}:${String((L.beats.length * 17) % 60).padStart(2, "0")}`; L.meta = `${L.dur} · narrated`;
    if (S.view === "home" || S.view === "lumens") (S.view === "home" ? renderHome : renderLumens)();
    toast("Your Lumen is ready to watch.", `“${esc(L.title)}”. <a href="#play-${L.id}" class="vtoast-action">Play it</a>`);
  }
  /** Read: a long read, written in the background. The reader itself is a stand-in here. */
  async function makeRead(q, opts = {}) {
    q = String(q || "").trim(); if (!q) return;
    const L = lumenFor(q, opts);
    L.making = "read"; L.writingLabel = "Writing";
    const hi = $("#ll-hero-in", root); if (hi) hi.value = "";
    if (S.view === "home" || S.view === "lumens") (S.view === "home" ? renderHome : renderLumens)();
    toast("Making your Lumen.", "Read: a long read is being written. It'll be ready in a minute or two.");
    const label = (t) => { L.writingLabel = t; $$(`[data-lumen="${L.id}"] .ll-wr, [data-work="${L.id}"] .ll-wr`, root).forEach((x) => (x.textContent = t)); };
    let R = null;
    if (S.ai) {
      try {
        const { text } = await S.ai(`${LEARNER}\nPlan a long read (an article of about 2,500 words) answering: "${q}"${L.anchor ? `, filed under their topic "${L.anchor[1]}"` : ""}.\nReply with one JSON object only: {"title":"at most 8 words","sections":["five section titles"],"paras":["the opening three paragraphs, 50 to 80 words each, plain and specific; no invented quotations or statistics"]}`, { modelTier: "quick", cache: false });
        const j = JSON.parse(String(text).slice(String(text).indexOf("{"), String(text).lastIndexOf("}") + 1));
        if (j.sections?.length && j.paras?.length) { R = { mins: 12, sections: j.sections.slice(0, 6).map(String), paras: j.paras.slice(0, 3).map(String) }; if (!opts.into && j.title) L.title = String(j.title); }
      } catch (e) { try { aiFail(e); } catch { /* stopped */ } }
    }
    for (const t of ["Planning", "Writing · section 2", "Writing · section 4", "Checking sources"]) { label(t); await sleep(R ? 500 : 1200); }
    L.read = R || { ...READS.cooling, sample: true };
    L.making = null; L.fresh = "read";
    if (S.view === "home" || S.view === "lumens") (S.view === "home" ? renderHome : renderLumens)();
    toast("Your long read is ready.", `“${esc(L.title)}”. Open it from the card's Read button.`);
  }
  function openRead(id) {
    const L = LUMENS.find((x) => x.id === id); if (!L?.read) return;
    L.fresh = false; leaveStudio(); EXT?.pause?.(); S.run++; S.view = "read"; S.tab = "lumens"; S.readId = id;
    const R = L.read;
    learnShell(`<header class="destination-header"><div class="destination-crumb"><strong>Learn</strong><i aria-hidden="true">/</i><a href="#lumens" data-tab="lumens">Lumens</a><i aria-hidden="true">/</i><span>${esc(L.title)}</span></div></header>
      <div class="lf-head"><div class="lf-head-l"><h1>${esc(L.title)}</h1><p class="lf-q">${esc(L.q)}</p><div class="lf-meta">${tag(L)}${goalTag(L)}<span>${R.mins} min read · ${R.sections.length} sections</span></div></div>${fmtSwitch(L, "read")}</div>
      <div class="lf-read"><nav class="lf-toc" aria-label="Sections"><p>Sections</p><ol>${R.sections.map((t, i) => `<li${i ? "" : ' aria-current="true"'}>${esc(t)}</li>`).join("")}</ol></nav>
        <article class="lf-article"><h2>${esc(R.sections[0])}</h2>${R.paras.map((x) => `<p>${esc(x)}</p>`).join("")}<p class="lf-stub">${R.sample ? "Sample text: with Claude allowed, this is written for your question. " : ""}The long read carries on from here. This prototype shows where long reads sit among the formats; the reader itself is its own piece of work.</p></article></div>`);
    dock({ ctx: `Read · ${L.title}`, chips: [L.listen ? "Listen to this instead" : "Make a listen version", "Talk it through live"] });
    window.scrollTo(0, 0);
  }
  /** Opens a Lumen in a format it has. */
  function openFormat(L, k) {
    if (!L) return;
    if (k === "watch") return playLumen(L.id);
    if (k === "listen" && L.listen) return EXT?.openDialogue?.(L.listen);
    if (k === "read") return openRead(L.id);
  }
  const openLumen = (id) => { const L = LUMENS.find((x) => x.id === id); if (L) openFormat(L, primary(L)); };
  function browserNote() {
    return new Promise((resolve) => {
      const w = document.createElement("div");
      w.innerHTML = `<div class="graph-dialog-overlay" style="pointer-events:auto;z-index:150"></div><div role="dialog" aria-modal="true" aria-labelledby="ll-b" class="graph-dialog" style="pointer-events:auto;z-index:151"><h2 id="ll-b" class="graph-dialog-title">Live isn't on this browser yet</h2><div style="display:grid;gap:10px;font-size:14px;line-height:1.5;color:var(--text-muted);margin:6px 0 16px"><p style="margin:0">Live Lumens work in Chrome and Edge on a computer for now. Phones and Safari come next.</p><p style="margin:0">You can still watch any Lumen and type questions for written answers.</p></div><div class="row"><button class="button button-quiet" type="button" data-a="no">OK</button><button class="button" type="button" data-a="yes">Continue anyway (prototype)</button></div></div>`;
      document.body.appendChild(w);
      w.addEventListener("click", (e) => { const a = e.target.closest("[data-a]"); if (!a) return; w.remove(); resolve(a.dataset.a === "yes"); });
    });
  }
  function toast(title, body) {
    $$(".vtoasts.ll-t").forEach((t) => t.remove());
    const h = document.createElement("div"); h.className = "vtoasts start ll-t"; h.setAttribute("role", "status");
    h.style.cssText = "bottom:96px;left:calc(var(--t-rail) + 16px)";
    h.innerHTML = `<div class="vtoast"><b>${title}</b><button aria-label="Dismiss" type="button">×</button><p>${body}</p></div>`;
    h.addEventListener("click", (e) => { const a = e.target.closest('a[href^="#play-"]'); if (a) { e.preventDefault(); h.remove(); return playLumen(a.getAttribute("href").slice(6)); } if (e.target.closest("button")) h.remove(); });
    document.body.appendChild(h); setTimeout(() => h.remove(), 8000);
  }

  /* ================================================================ other screens */
  /** Leaving the studio while live (another tab, page or Lumen) saves the session so it can be resumed. */
  function leaveStudio() {
    if (S.view === "studio" && SES.sid && SES.mode === "live") {
      SES.save(`You left at slide ${SES.i + 1}. Session saved.`);
      SES.mode = "recorded"; S.line = false; hush(); if (speaking) speaking.cut(null);
      toast("Live session saved.", "Resume it from Learn → Home or Live sessions, at the slide where you stopped.");
    }
  }
  function goToday() { leaveStudio(); S.view = "today"; S.run++; hush(); shell("today"); railCurrent("/today"); ld.hidden = true; }
  function goLibrary() { leaveStudio(); S.view = "library"; S.run++; hush(); shell("library"); railCurrent("/library"); ld.hidden = true; }
  function goGraph() {
    leaveStudio(); S.view = "graph"; S.run++; hush(); shell("climate"); railCurrent("/graph");
    const body = $(".cp .cp-body", root);
    const lines = S.journal.filter((j) => j.topic === "Climate-responsive design");
    if (body && lines.length) { body.insertAdjacentHTML("beforeend", `<div class="cp-thread" role="log"><div class="day">Today</div>${lines.map((j) => `<div class="msg jl"><span aria-hidden="true" class="ico">✓</span><span>${j.html}</span></div>`).join("")}</div>`); $(".cp-empty", body)?.remove(); }
    dock({ ctx: "Loci · Climate-responsive design", chips: ["Explain Climate-responsive design live", "Go live on How a malqaf moves air"] });
  }
  function goCourse() {
    leaveStudio(); S.view = "course"; S.run++; hush(); shell("course"); railCurrent("/learn");
    const ask = $(".xp-askbtn", root); if (ask) ask.insertAdjacentHTML("beforebegin", `<button class="button button-quiet ll-live-btn" type="button" data-golive="darwin2" style="min-height:0;padding:5px 10px;font-size:12.5px;margin-right:6px">${I.mic}Go live</button>`);
    dock({ ctx: "Course · Origin of Species, part 2", chips: ["Go live on this part", "Quiz me on part 2"] });
  }

  /* what the talk bar does outside a session */
  function route(text) {
    if (EXT?.route?.(text)) return;
    const t = text.toLowerCase();
    if (/go live on this part|take part 2|part 2 of origin/.test(t)) { SES.open(DARWIN, { mode: "recorded", from: 1 }); return begin(() => SES.goLive()); }
    if (/go live on how a malqaf|malqaf/.test(t)) { SES.open(MALQAF, { mode: "recorded", from: 3 }); return begin(() => SES.goLive()); }
    if (/explain climate-responsive design live/.test(t)) return startNew("What is climate-responsive design, in practice?", "Climate-responsive design");
    if (/explain light shelves live/.test(t)) return startNew("How do light shelves push daylight deeper?", "Daylight & shading");
    if (/quiz me on part/.test(t)) { SES.open(DARWIN, { mode: "recorded" }); return begin(async () => { SES.mode = "live"; SES.paintMode(); await SES.quiz(); await SES.endLive(); }); }
    if (S.view === "read") {
      const L = LUMENS.find((x) => x.id === S.readId);
      if (/listen to this/.test(t) && L?.listen) return EXT?.openDialogue?.(L.listen);
      if (/listen version/.test(t)) return EXT?.compose?.({ lumen: L, format: "listen" });
      if (/talk it through live/.test(t)) return startNew(L.q, L.anchor?.[1]);
    }
    if (/watch next|haven't i finished|finish first/.test(t)) { toast("Pick up How a malqaf moves air.", "You stopped 20 seconds from the end. Then Part 2 of Origin of Species."); return; }
    return startNew(text, S.view === "graph" ? "Climate-responsive design" : null);
  }

  /* ================================================================ clicks */
  document.addEventListener("click", (e) => {
    if (e.target.closest(".ld, .graph-dialog, .vtoasts, .td-proto")) return;
    if (EXT?.onClick?.(e)) return;
    const a = e.target.closest("a[href]");
    const b = e.target.closest("button");
    if (a) {
      e.preventDefault();
      const h = a.getAttribute("href");
      if (a.dataset.tab) return openTab(a.dataset.tab);
      if (h === "/learn" || h === "#home") return openTab("home");
      if (h === "/today" || a.matches(".brand-row")) return goToday();
      if (h === "/library") return goLibrary();
      if (h === "/graph") return goGraph();
      if (h.startsWith("#play-")) return playLumen(h.slice(6));
      if (h.startsWith("#open-")) return openLumen(h.slice(6));
      if (h.startsWith("#course-")) return goCourse();
      if (/^Learn$|Lumens/.test(a.textContent.trim()) && S.view === "course") return openTab("lumens");
      return;
    }
    if (!b) {
      // Tap part of a slide while live: "what's this?"
      const part = e.target.closest(".ll-stagecol .xp-slide-host .xp-hl:not(.ll-choice)");
      if (part && S.view === "studio") return begin(async () => { if (SES.mode !== "live") return SES.written(`What's “${part.textContent.trim()}”?`); await SES.whatsThis(part.querySelector("h3")?.textContent || part.textContent.trim()); await SES.loop(false); });
      if (e.target.closest(".lx-card, .lx-cont, .ll-crow") && !e.target.closest(".ll-acts, .lx-row")) { const c = e.target.closest("[data-lumen], [data-course]"); if (c?.dataset.lumen) return openLumen(c.dataset.lumen); if (c?.dataset.course) return goCourse(); }
      return;
    }
    if (b.dataset.tab) return openTab(b.dataset.tab);
    if (b.dataset.fmt && b.dataset.lumenId) { const L = LUMENS.find((x) => x.id === b.dataset.lumenId); if (L) L.fresh = false; return openFormat(L, b.dataset.fmt); }
    if (b.dataset.addfmt) return EXT?.compose?.({ lumen: LUMENS.find((x) => x.id === b.dataset.lumenId), format: b.dataset.addfmt });
    if (b.dataset.tailor !== undefined) return EXT?.compose?.({ q: $("#ll-hero-in", root)?.value || "", format: S.mode2 });
    if (b.dataset.livego !== undefined) { const v = $("#ll-hero-in", root)?.value.trim(); return startNew(v || "How do wind catchers actually cool a house?"); }
    if (b.dataset.golive) { const made = LUMENS.find((x) => x.id === b.dataset.golive); if (made?.fresh) made.fresh = false; const L = DECKS[b.dataset.golive] || { ...MALQAF, ...LUMENS.find((x) => x.id === b.dataset.golive), beats: MALQAF.beats }; SES.open(L, { mode: "recorded", from: b.dataset.golive === "malqaf" ? 3 : 1 }); return begin(() => SES.goLive()); }
    if (b.dataset.start) return explain(b.dataset.start);
    if (b.dataset.kind && b.closest(".ll-mode")) return setKind(b.dataset.kind);
    if (b.dataset.resume) { const ss = SESSIONS.find((x) => x.id === b.dataset.resume); if (ss) return SES.resume(ss); return; }
    if (b.dataset.livenow !== undefined) { const L = LUMENS.find((x) => x.id === b.dataset.livenow); EXT?.pause?.(); return startNew(L ? L.q : "How do wind catchers actually cool a house?", L?.anchor?.[1]); }
    if (b.dataset.area !== undefined) { S.filter.area = b.dataset.area; return renderLumens(); }
    if (b.dataset.f) { S.filter[b.dataset.f] = b.dataset.v; renderLumens(); return window.scrollTo(0, 0); }
    if (b.dataset.mode && S.view === "studio") { if (b.dataset.mode === "live" && SES.mode !== "live") return begin(() => SES.goLive()); if (b.dataset.mode === "recorded" && SES.mode === "live") return begin(() => SES.endLive()); return; }
    if (b.dataset.act === "keep") return SES.keep();
    if (b.dataset.beat !== undefined) { const i = +b.dataset.beat; if (SES.mode === "live") return begin(async () => { SES.i = i; await SES.loop(false); }); SES.show(i); return; }
    if (b.matches(".xp-ib-play") && S.view === "studio") { if (speaking) { speaking.cut(null); SES.playing(false); return; } return begin(() => (SES.mode === "live" ? SES.loop(false) : SES.playRecorded())); }
    if (b.dataset.txtab) { $$("[data-txtab]", root).forEach((x) => x.setAttribute("aria-selected", String(x === b))); $(".ll-tx-body", root).hidden = b.dataset.txtab !== "tx"; $(".ll-src", root).hidden = b.dataset.txtab !== "src"; return; }
    if (b.matches(".theme-toggle")) { const el = document.documentElement; const dark = el.dataset.theme ? el.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; el.dataset.theme = dark ? "light" : "dark"; return; }
  });
  document.addEventListener("submit", (e) => {
    const f = e.target.closest('[data-form="hero"]');
    e.preventDefault();
    if (f) { const v = $("#ll-hero-in", root).value; if (v.trim()) explain(v); else $("#ll-hero-in", root).focus(); }
  });
  document.addEventListener("input", (e) => { if (e.target.id === "ll-hero-in") briefLine(); if (e.target.id === "ll-q") { S.filter.q = e.target.value; clearTimeout(S.qT); S.qT = setTimeout(() => { renderLumens(); const i = $("#ll-q", root); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 250); } });
  function playLumen(id) {
    const L = LUMENS.find((x) => x.id === id) || MALQAF;
    if (L.making === "watch") { toast("Still being written.", `“${esc(L.title)}” will be ready to watch in about a minute. Or talk it through live now.`); return; }
    if (!hasWatch(L) && L.id !== "malqaf" && !DECKS[L.id]) return openLumen(L.id);
    L.fresh = false;
    const deck = DECKS[L.id] || (L.id === "kept1" ? MASS : null) || (L.id.endsWith("-kept") ? DECKS[L.id.replace("-kept", "")] : null) || { ...MALQAF, ...L, beats: MALQAF.beats };
    SES.open(deck, { mode: "recorded", from: L.id === "malqaf" ? 3 : 0 });
    begin(() => SES.playRecorded());
  }
  function openTab(k) { leaveStudio(); S.run++; hush(); clearInterval(SES.tick); if (k === "lumens" && S.filter.fmt === "sessions") S.filter.fmt = "all";
    ({ home: renderHome, lumens: renderLumens, courses: renderCourses, sessions: renderSessions, ...(EXT?.renderers || {}) })[k](); window.scrollTo(0, 0); }

  /* ================================================================ prototype bar */
  const bar = document.createElement("nav");
  bar.className = "td-proto ll-proto"; bar.setAttribute("aria-label", "Prototype");
  bar.innerHTML = '<b>Prototype · slice 1</b><button type="button" id="ll-restart">Start again</button><button type="button" id="ll-how" aria-expanded="false">How to try it</button><span class="ai" id="ll-ai">Checking for Claude…</span><span class="hint" hidden>Learn → Home: ask “How do wind catchers actually cool a house?” and press Explain live, or hold the mic. While it talks, cut in from the bar: Stop, Explain that another way, Go deeper, Test me, or tap part of a slide. Every Lumen card has Go live; ending goes back to the recording, and Keep saves your version. The talk bar shows only in Learn and on the Graph (Loci).</span>';
  document.body.appendChild(bar);
  $("#ll-restart", bar).addEventListener("click", () => location.reload());
  $("#ll-how", bar).addEventListener("click", (e) => { const h = $(".hint", bar); h.hidden = !h.hidden; e.currentTarget.setAttribute("aria-expanded", String(!h.hidden)); });
  aiBadge();
  EXT?.init?.({ root, S, I, STAGE, LEARNER, LUMENS, DECKS, ld, LD, learnShell, header, poster, tag, dock, setChips, setState, toast, openTab, startNew, leaveStudio, streamLines, aiBadge, hush, nextId: () => ++uid,
    makeLumen, makeRead, lumenFor, formats, fmtSwitch, fmtPills, openFormat, openLumen, goalTag, renderHome, renderLumens });
  function aiBadge() { const el = $("#ll-ai"); if (!el) return; el.dataset.on = String(!!S.ai); el.textContent = S.ai ? "Live answers: written by Claude" : "Live answers: scripted sample"; }

  renderHome();
})();
