/* Learn, slice 2 (prototype): the Listen format and the brief. A Lumen's Listen format (called a Dialogue in code) is
   two voices talking one idea through from two angles for 10 to 30 minutes, made to be heard on a walk, a ride or a
   drive; a drive edition is written and played for the road. Every format (Watch, Listen, Read) is made from one brief,
   the same context every Studiolo form uses:
     - the learner line (onboarding);
     - the learning goal it serves (a goal note in the Library);
     - the area and topic it's filed under (Loci);
     - the learner's own sources (Library items tagged to that topic);
     - what they already know (Lumens watched, long reads read), so it builds on it.
   It's written one chapter ahead of the listener, so chapters nobody reaches are never written or voiced.
   While it plays you can ask the hosts (they answer, then hand back), mark a moment (a quote note in the Library) and
   switch to Walk mode (big controls, nothing to read). It ends with a spoken recall question.
   When this page may use Claude (the `sample` capability), plans, chapters, answers and recall feedback are written by
   Claude; otherwise a scripted sample plays. Two browser speech voices stand in for the two ElevenLabs voices.
   learn.js owns Learn (Home, Lumens, Courses, the Watch and Read pages) and calls window.LearnExt for Listen and the brief. */
(() => {
  "use strict";
  let A = null; // the Learn API, handed over by learn.js (init)
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const WPM = 150; // speaking pace used for lengths and positions
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const minLabel = (s) => `${Math.max(1, Math.round(s / 60))} min`;
  const svg = (d, fill) => `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="${fill ? "currentColor" : "none"}" stroke="${fill ? "none" : "currentColor"}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const IC = {
    phones: svg('<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4.5" height="7" rx="1.5"/><rect x="16.5" y="14" width="4.5" height="7" rx="1.5"/>'),
    walk: svg('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
    mark: svg('<path d="M7 4h10v16l-5-4-5 4z"/>'),
    back: svg('<path d="M5 12a7 7 0 1 0 2.1-5"/><path d="M5 4.5V8h3.5"/><text x="12.4" y="15.2" font-size="6.6" font-family="system-ui,sans-serif" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none">15</text>'),
    next: svg('<path d="M5 5.5v13l9.5-6.5z" fill="currentColor"/><path d="M18 5.5v13"/>'),
    play: svg('<path d="M8 5.5v13l11-6.5z"/>', true),
    pause: svg('<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>', true),
    down: svg('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    x: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
    open: svg('<path d="M14 5h5v5M19 5l-8 8M10 5H5v14h14v-5"/>'),
    car: svg('<path d="M5 15.5v-4l2-5h10l2 5v4"/><path d="M3.5 15.5h17V19h-17z"/><path d="M5 11.5h14"/><circle cx="7.5" cy="17.2" r=".6" fill="currentColor"/><circle cx="16.5" cy="17.2" r=".6" fill="currentColor"/>'),
  };

  /* ================================================================ the learner's context (sample data) */
  const GOALS = [
    { id: "thesis", title: "Thesis: a passively cooled courtyard house in Dubai", short: "Thesis · Dubai courtyard house", due: "due March", topic: "Climate-responsive design" },
    { id: "cairo", title: "Cairo in December: read the Mamluk buildings on site", short: "Cairo trip · Mamluk buildings", due: "trip on 12 December", topic: "Islamic architecture" },
    { id: "darwin", title: "Finish On the Origin of Species", short: "Finish Origin of Species", due: "no date", topic: "Natural selection" },
    { id: "none", title: "No goal, just curious", short: "Just curious", due: "" },
  ];
  const TOPICS = [["Culture & Context", "Climate-responsive design"], ["History & Theory", "Islamic architecture"], ["Environment & Services", "Daylight & shading"], ["Biology", "Natural selection"]];
  const areaOf = (topic) => (TOPICS.find((t) => t[1] === topic) || ["", ""])[0];
  // Library items tagged to each topic: what a Dialogue may quote.
  const LIB = {
    "Climate-responsive design": [["notes", "Climate and Architecture: lecture notes", "PDF · 38 pages"], ["fathy", "Natural Energy and Vernacular Architecture", "Book · Hassan Fathy"], ["yazd", "Wind catchers of Yazd", "Video · 18 min"], ["fahidi", "Al Fahidi walk", "Photos · 12"]],
    "Islamic architecture": [["hassan", "Sultan Hassan: plan, section and the four madrasas", "Lecture · PDF"], ["hill", "Islamic Architecture: Form, Function and Meaning", "Book · Hillenbrand"], ["cordoba", "The Great Mosque of Córdoba, plan and extensions", "Video"]],
    "Daylight & shading": [["notes", "Climate and Architecture: lecture notes", "PDF · 38 pages"], ["shelf", "Light shelves, a field guide", "Article"]],
    "Natural selection": [["origin", "On the Origin of Species", "PDF · 502 pages"]],
  };
  // What the learner has already seen on each topic, in any form. A Dialogue builds on it instead of repeating it.
  const KNOWN = {
    "Climate-responsive design": [["Lumen", "How a malqaf moves air", "watched, 88%"], ["Lumen", "Mass, air and humidity", "kept from a live session"], ["Long read", "Courtyards in hot, humid places", "read to the end"]],
    "Islamic architecture": [["Lumen", "Four iwans: how the madrasa plan works", "watched"], ["Lumen", "Hillenbrand on what makes a mosque", "watched"]],
    "Daylight & shading": [["Lumen", "How light shelves push daylight deeper", "not started"]],
    "Natural selection": [["Course", "On the Origin of Species", "2 of 7 parts"]],
  };
  // Two voices: suggested pairs of angles for a topic.
  const host = (name, role, lens) => ({ name, role, lens });
  const PAIRS = {
    "Climate-responsive design": [
      { label: "The engineer and the historian", A: host("Nadia", "Environmental engineer", "what the physics allows"), B: host("Karim", "Architectural historian", "why builders did it, and what it meant") },
      { label: "The practitioner and the sceptic", A: host("Lina", "Architect practising in Dubai", "what works on a real site and budget"), B: host("Omar", "The sceptic", "where the romance of tradition breaks down") },
      { label: "The expert and a learner like you", A: host("Nadia", "Environmental engineer", "explains, with numbers"), B: host("Sam", "Architecture student", "asks the questions you would") },
    ],
    "Islamic architecture": [
      { label: "The guide and the traveller", A: host("Huda", "Cairo guide", "what to look at, standing there"), B: host("Sam", "First-time visitor", "asks what a visitor would") },
      { label: "The historian and the architect", A: host("Karim", "Architectural historian", "patrons, dates and meaning"), B: host("Lina", "Architect", "how the plan and section work") },
    ],
    "Natural selection": [
      { label: "The naturalist and the statistician", A: host("Ruth", "Naturalist", "what Darwin saw in the field"), B: host("Theo", "Statistician", "the arithmetic underneath") },
    ],
  };
  const pairsFor = (topic) => PAIRS[topic] || PAIRS["Climate-responsive design"];

  /* ================================================================ Dialogues (sample) */
  const T = (who, say, extra) => ({ who, say, ...extra });
  const COOL = {
    id: "cool", lumen: "cooling", title: "Cooling without machines: wind, water and walls", q: "Can a house in Dubai stay cool the old way?", topic: "Climate-responsive design", goal: "thesis", pair: PAIRS["Climate-responsive design"][0], len: 20,
    sources: ["notes", "fathy", "yazd"], grounding: "mostly", skipKnown: true, when: "Today", status: "in", offline: true, at: 0, startCh: 1, sample: true,
    chapters: [
      { title: "Why this, and why now", point: "What the tower can do for this thesis, and what we'll skip.", turns: [
        T("A", "Here's where we're starting. You're designing a courtyard house in Dubai for your thesis, and you want to know how far the old ways of cooling can carry it. You've already watched how a malqaf moves air, so we won't redraw the tower. We'll argue about whether it still works."),
        T("B", "And argue we will. I'm Karim; I look at buildings as history. Nadia measures them. So when I say the barjeel houses of Al Fahidi were comfortable, she's going to ask me: comfortable compared with what, and at what time of day?"),
        T("A", "Exactly that. Comfort in 1900 meant something different. People moved through the house with the seasons, slept on the roof in summer, and expected to feel warm in the afternoon. Your client will expect twenty-four degrees in every room at three in the afternoon in August."),
        T("B", "Which is the real question of this whole conversation. Not whether the tower works, but what job we give it. A tower that has to do everything will fail. A tower that does one thing well might be the best part of your house."),
        T("A", "So here's the plan. The physics, briefly. What the old houses actually did. Where the romance breaks. And then your site."),
      ] },
      { title: "Three ways air takes heat away", point: "Wind pressure, the stack effect and evaporation, and why humidity matters.", turns: [
        T("A", "Three mechanisms do the work. Wind pressure pushes air in on the windward side and pulls it out on the lee. The stack effect lets warm air rise and leave high up. And evaporation, when there's water, takes heat out of the air as it turns to vapour."),
        T("B", "Your lecture notes put it in one line on page two: shade first, then move air, then store or lose heat. The old builders didn't have those words, but they worked in that order.", { src: "notes" }),
        T("A", "That order matters more in Dubai than almost anywhere. Evaporation needs dry air. On a humid August day the air is already close to full of water, so a wet jar at the bottom of a tower does very little."),
        T("B", "Which is why the barjeel, the Gulf's tower, rarely relied on water the way the Egyptian malqaf did. It opened on four sides and caught whatever breeze came off the sea."),
        T("A", "Right. And moving air cools people even when it doesn't cool the air. A breeze across damp skin carries sweat away. That's what the barjeel really offers: not colder air, but air that moves across you."),
        T("B", "So when people say a wind tower cools the house, it's half true. It cools the people in the house, and only while the wind blows."),
      ] },
      { title: "What the barjeel houses actually did", point: "The tower served one room; the courtyard, the walls and the family's habits did the rest.", turns: [
        T("B", "Let's walk into one of the Al Fahidi houses. The tower usually stands over the room where the family spent the hottest part of the day. Below it, a place to sit; around it, a courtyard; above, a roof terrace for the nights."),
        T("A", "And notice what that tells you. The tower serves one room, not the whole house. The courtyard and the thick, shaded walls carry the rest, along with the family simply moving to wherever was coolest at that hour."),
        T("B", "Fathy makes this point in your copy of Natural Energy and Vernacular Architecture: these houses are systems, not devices. You can't lift the tower out, bolt it onto a villa and expect the same result.", { src: "fathy" }),
        T("A", "I'd push back a little. You can lift the principle out. A tall shaft over a room, with an outlet on the far side, will move air whenever there's wind above the roofs. That's physics, not culture."),
        T("B", "Fair. But the culture decides whether anyone sits in that room at two in the afternoon with the door to the courtyard open. Your thesis has to design the habits as well as the shaft."),
        T("A", "Then let's be careful about what we claim. Measurements of traditional towers vary a lot with wind and design; the Yazd video in your library shows that range. I'd tell your examiners: useful air movement much of the year, very little on still, humid summer days. I wouldn't put a single number on it.", { src: "yazd" }),
      ] },
      { title: "Where the romance breaks", point: "Dust, insects, humidity and people; and the tower as a partner to air conditioning.", turns: [
        T("B", "Now my uncomfortable chapter. Hassan Fathy built New Gourna in the 1940s, with domes, courtyards and wind catchers, for villagers who largely didn't want to move there. The buildings were thoughtful. The people weren't asked."),
        T("A", "And there's an engineering version of that story. Towers let in dust, insects and sometimes birds. Their openings are hard to seal when you want air conditioning. In a humid summer they can let in more moisture than they let out heat."),
        T("B", "So the sceptic says: it's a museum piece. Put in a good heat pump and move on."),
        T("A", "And I'd say the sceptic is right about August and wrong about the year. For a good part of the cooler season, a tower and a courtyard can carry the house with fans and no compressor running. That's months of electricity your thesis can count."),
        T("B", "Which turns the tower from a replacement for air conditioning into a partner for it. Open in the cooler months, sealed with dampers in high summer."),
        T("A", "Masdar City did something like that with the modern wind tower in its plaza, with louvres that open and close. Whatever you think of the results, the idea has the right shape: a tower you can switch."),
      ] },
      { title: "What it means for your site", point: "Shade, one job for the tower, light mass, dampers and fans; claims made in hours.", turns: [
        T("A", "So, your thesis house. Start with shade, because that's where the biggest gains are in Dubai: a deep, narrow courtyard, and walls and openings shaded from the low east and west sun."),
        T("B", "Then give the tower one job. Put it over the family room, the majlis or the living space, and draw a clear path for the air: in high, across the room, out into the courtyard."),
        T("A", "And be careful with thermal mass. You kept a Lumen on this: humid nights barely cool down, so heavy walls have nowhere to dump the day's heat. Use mass where it's shaded and can be flushed on cooler winter nights, and keep the rest light."),
        T("B", "Add dampers so the tower closes in summer, and ceiling fans so the room still has moving air when it does. Then the tower becomes the house's seasonal instrument: open through the cooler months, shut through the humid ones."),
        T("A", "For your examiners, make the claim in hours: how many hours a year the house can run without compressors, and in which rooms. That's measurable, and it's honest."),
      ] },
      { title: "Before you go", point: "One recall question.", turns: [
        T("B", "Let's close the loop. Everything today came back to one fact about Dubai, the same fact that limits both water cooling and heavy walls."),
        T("A", "So here's your question. Say it out loud, or just think it: why does high humidity weaken both the wet jar at the foot of a malqaf and a house's heavy walls?", { recall: true, answer: "Humid air can't take up much more water, so evaporation barely cools it; and humid nights stay warm, so heavy walls can't lose the day's heat.", learner: "Humid air can't take more water, and the nights stay too warm for the walls to cool down" }),
      ] },
    ],
    canned: [[/air.?condition|\bac\b|heat pump|compressor/i, [T("A", "Fair question, and in August that's exactly what your house will use. The point isn't to refuse the heat pump. It's to need it for fewer months, and in fewer rooms."), T("B", "And when the compressor is off, the tower and the courtyard are what make the house pleasant. That's the part of the year your thesis can win. Right, back to where we were.")]]],
    askChip: "Why not just use air conditioning?",
  };
  const HASSAN = {
    id: "hassan", lumen: "sultan", title: "Reading Sultan Hassan before you go", q: "What should I look for when I stand in Sultan Hassan?", topic: "Islamic architecture", goal: "cairo", pair: PAIRS["Islamic architecture"][0], len: 10,
    sources: ["hassan", "hill"], grounding: "mostly", skipKnown: true, when: "Yesterday", status: "new", offline: false, at: 0, sample: true,
    chapters: [
      { title: "Find the court first", point: "The court, the qibla iwan and the four madrasas in the corners.", turns: [
        T("A", "When you step into Sultan Hassan in December, don't look up yet. Walk through the long, bent entrance corridor and stop in the court. Everything in the building is arranged around it, and you've already seen the plan in your iwans Lumen."),
        T("B", "So the four big arches on each side, those are the iwans. Which one should I look at first?"),
        T("A", "The one facing Mecca, the qibla iwan. It's the deepest and the tallest, and behind its wall is the sultan's mausoleum. Stand in the middle of the court and turn slowly: one side feels heavier than the others."),
        T("B", "And the corners? The Lumen said to look at the corners."),
        T("A", "Yes. Between the iwans there are doors. Each leads into a smaller madrasa with its own court and rooms stacked several storeys high, one for each of the four Sunni schools of law. Your lecture handout draws all four.", { src: "hassan" }),
      ] },
      { title: "Look at the scale", point: "A building that was speaking to the Citadel.", turns: [
        T("B", "Everyone says it's huge. Huge compared with what?"),
        T("A", "Compared with almost anything else in Mamluk Cairo. It was built in the 1350s and early 1360s, and its walls rise like cliffs over the street. Walk around the outside before you go in, along the side that faces the Citadel."),
        T("B", "Why that side?"),
        T("A", "Because that's who it was talking to. The sultan's palace sat on the hill above. Later the building was even used as a fortress, with guns fired from its roof at the Citadel during revolts."),
        T("B", "So I should think of it as a political building as much as a religious one."),
        T("A", "As much as, yes. Hillenbrand makes the wider point in your copy: in Mamluk Cairo, mosque, school, tomb and monument often share one building and one patron's ambition.", { src: "hill" }),
      ] },
      { title: "Before you go", point: "One recall question.", turns: [
        T("B", "One thing to carry to Cairo, then."),
        T("A", "When you stand in the court, how will you know which iwan faces Mecca?", { recall: true, answer: "It's the deepest and tallest iwan, with the mihrab, and the mausoleum lies behind it.", learner: "It's the deepest and tallest one, and the tomb is behind it" }),
      ] },
    ],
    canned: [[/inside|go in|madrasa|visit|open/i, [T("A", "Usually you can look into at least one of the madrasa courts from the main court, but access changes, so ask the guardian at the door. The corner doors are the ones to try."), T("B", "Worth it if you can. Right, back to where we were.")]]],
    askChip: "Can I go inside the madrasas?",
  };
  // The same idea, written for driving (rules below): one idea said three ways, signposted steps, a "where we are" line
  // opening each chapter, at most one number, nothing to picture in detail, and a recall question only to think about.
  const DRIVE = {
    id: "cool-drive", lumen: "cooling", title: "Cooling without machines, for the drive", q: "Can a house in Dubai stay cool the old way?", topic: "Climate-responsive design", goal: "thesis", pair: PAIRS["Climate-responsive design"][0], len: 10, context: "drive",
    sources: ["notes", "fathy"], grounding: "mostly", skipKnown: true, when: "Today", status: "new", offline: true, at: 0, sample: true,
    chapters: [
      { title: "The one idea", point: "in Dubai a wind tower can't make the air colder, but it can make it move", turns: [
        T("A", "This is the drive edition, so here's the deal. No diagrams, no numbers you need to hold on to, and nothing to look at. One idea, told three ways. I'm Nadia, the engineer."),
        T("B", "And I'm Karim, the historian. Here's the one idea, so you have it from the start. In Dubai, a wind tower can't make the air colder. But it can make the air move. And moving air is what makes people comfortable."),
        T("A", "Hold on to that. Moving air, not colder air. We'll take it in three steps. Why humidity changes the rules. What the old houses really did. And what it means for your thesis house."),
      ] },
      { title: "Why humidity changes the rules", point: "humid air won't take the water trick, which leaves moving air", turns: [
        T("B", "Step one: humidity. Think of a hot, dry desert day. You splash water on your arms, and you feel cool straight away. That's the water taking heat with it as it dries."),
        T("A", "Now think of the same splash on a sticky August day on the coast. It just sits on your skin. The air is already full of water, so there's nowhere for more to go."),
        T("B", "So the old Egyptian trick, a wet jar at the bottom of the tower, works in dry Cairo, and barely works in humid Dubai."),
        T("A", "Which leaves us with the one idea. If the water won't cool the air, the tower's job is to move it. A breeze still feels good, even when the air itself isn't any colder."),
        T("B", "That's step one. Humidity takes away the water trick, and leaves us with moving air."),
      ] },
      { title: "What the old houses really did", point: "the tower looked after one room, and the house and the family's habits did the rest", turns: [
        T("A", "Where we are: in humid air, the tower's job is to move air, not to chill it. Step two is what the old Dubai houses did with that."),
        T("B", "Imagine walking into one of the old courtyard houses in Al Fahidi. The tower stands over one room, where the family sat through the hottest hours. Not the whole house. One room."),
        T("A", "And the family moved with the day. The shady courtyard in the morning. The tower room at noon. The roof at night. The house worked because people moved through it."),
        T("B", "Fathy says it well in the book in your library: these houses are systems, not gadgets. The thick, shaded walls and the deep courtyard did most of the quiet work.", { src: "fathy" }),
        T("A", "So, step two in one line. The tower looked after one room. The house, and the family's habits, did the rest."),
      ] },
      { title: "What it means for your house", point: "shade first, one job for the tower, and a tower you can close", turns: [
        T("B", "Where we are: humidity leaves us with moving air, and the old houses gave the tower one room to look after. Step three is your thesis house."),
        T("A", "Start with shade. Always shade first. Then give the tower one job: move air through the main living room, in high and out to the courtyard."),
        T("B", "And give the tower a door. Close it for the sticky summer months, open it for the cooler ones. When it's closed, ceiling fans keep the air moving."),
        T("A", "Which is the one idea, a last time. In Dubai, a tower can't make the air colder. It can make it move. And for a good part of the year, that's what makes people comfortable."),
      ] },
      { title: "Before you arrive", point: "one question to think over", turns: [
        T("B", "One question to think over for the rest of your drive. You don't need to say anything."),
        T("A", "Why does a wet jar at the foot of a wind tower cool the air in Cairo, but hardly at all in Dubai?", { recall: true, think: true, answer: "Cairo's air is dry, so the water can evaporate and take heat with it. Dubai's air is already full of water, so it can't.", learner: "Because Cairo's air is dry and Dubai's is already full of water" }),
        T("B", "Three things to keep. Moving air, not colder air. One room for the tower. And a tower you can close. Anything you marked is in your Library for when you're parked."),
      ] },
    ],
    canned: [[/air.?condition|\bac\b|heat pump|compressor/i, [T("A", "In August, yes, your house will use it. The point is to need it for fewer months, and in fewer rooms."), T("B", "And when it's off, the tower and the courtyard make the house pleasant. Right, back to where we were.")]]],
    askChip: "Why not just use air conditioning?",
  };
  const DIALOGUES = [COOL, DRIVE, HASSAN];
  // Where it will be heard changes how it's written. Driving is the strictest: the listener's eyes and most of their
  // attention belong to the road, so nothing may need a look, a pen or a reply, and any minute may be missed.
  const CONTEXTS = { any: "Anywhere", walk: "Walking or cycling", drive: "Driving" };
  const DRIVE_RULES = [
    "One main idea, said plainly in the first minute, said again in other words in the middle and at the end",
    "Signposted steps (\"three steps; step one…\"), and every chapter after the first opens with a one-line \"where we are\"",
    "Each chapter makes sense on its own, so a minute missed at a junction doesn't lose the thread",
    "At most one number per point, rounded; no lists longer than three; no tables, spellings or diagrams",
    "Nothing to picture in detail, look at, write down or do; questions are to think about, never to answer",
    "Short sentences, about 140 words a minute, calm voices: real disagreement, without raised stakes or sudden shifts",
    "No sound effects or music, and nothing that sounds like a phone, a horn or a car alert",
  ];
  const MARKS = [];
  const goalOf = (D) => GOALS.find((g) => g.id === D.goal) || GOALS[3];
  const srcOf = (D, id) => (LIB[D.topic] || []).find((s) => s[0] === id);
  const touch = (D) => { D.v = (D.v || 0) + 1; };

  /* ---------- a Dialogue as a list of sentences: what the player walks through */
  const sentences = (t) => (String(t).match(/[^.!?]+[.!?]+["”’)]*|[^.!?]+$/g) || [String(t)]).map((s) => s.trim()).filter(Boolean);
  function flat(D) {
    if (D._flat && D._fv === D.v) return D._flat;
    const out = []; let t = 0;
    D.chapters.forEach((c, ci) => c.turns.forEach((tn, ti) => {
      if (tn.who === "you") return; // the learner's own words are shown, not spoken
      const ss = sentences(tn.say);
      ss.forEach((text, si) => { const n = text.split(/\s+/).filter(Boolean).length; const d = (n * 60) / WPM + 0.3; out.push({ ci, ti, si, last: si === ss.length - 1, text, n, t0: t, d }); t += d; });
    }));
    D._flat = out; D._fv = D.v; D.total = t;
    return out;
  }
  const lengthOf = (D) => { flat(D); return D.total || 0; };
  const chStart = (D, ci) => flat(D).findIndex((it) => it.ci >= ci);
  const turnAt = (D, it) => D.chapters[it.ci]?.turns[it.ti];
  DIALOGUES.forEach((D) => { touch(D); if (D.startCh) D.at = chStart(D, D.startCh) + 2; });

  /* ================================================================ voices (two browser voices stand in for ElevenLabs) */
  let VO = { A: { voice: null, pitch: 1.08 }, B: { voice: null, pitch: 0.86 } };
  function pickVoices() {
    if (!window.speechSynthesis) return;
    const en = speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang));
    if (!en.length) return;
    const by = (re, not) => en.find((v) => v !== not && re.test(v.name));
    const a = by(/female|samantha|serena|libby|sonia|zira|aria|jenny|karen|moira|tessa|fiona|kate/i) || en.find((v) => /en-GB/i.test(v.lang)) || en[0];
    const b = by(/\bmale|daniel|ryan|guy|david|george|arthur|oliver|alex|fred|thomas|rishi/i, a) || en.find((v) => v !== a && v.lang !== a.lang) || en.find((v) => v !== a) || a;
    VO = { A: { voice: a, pitch: b === a ? 1.12 : 1 }, B: { voice: b, pitch: b === a ? 0.8 : 1 } };
  }
  if (window.speechSynthesis) { pickVoices(); speechSynthesis.addEventListener?.("voiceschanged", pickVoices); }
  function utter(text, who, onWord, onEnd) {
    if (!window.speechSynthesis) return false;
    try {
      const v = VO[who] || VO.A;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = v.voice?.lang || "en-GB"; if (v.voice) u.voice = v.voice; u.pitch = v.pitch; u.rate = Math.min(2, P.speed);
      u.onboundary = (e) => onWord(e.charIndex); u.onend = () => onEnd(null); u.onerror = (e) => onEnd(e);
      speechSynthesis.speak(u); return true;
    } catch { return false; }
  }

  /* ================================================================ the player */
  const P = { D: null, k: 0, playing: false, speed: 1, tok: 0, wait: "", recall: null, walk: false, cap: { who: "", words: [], n: -1 } };
  const SPEEDS = [1, 1.25, 1.5, 0.85];
  const cancel = () => { try { window.speechSynthesis && speechSynthesis.cancel(); } catch { /* none */ } };
  function play(D, k) {
    if (D && D !== P.D) { stop(); P.D = D; P.k = k ?? D.at ?? 0; }
    else if (k !== undefined) P.k = k;
    if (!P.D || P.playing) return paint();
    if (P.recall) return paint();
    const F = flat(P.D);
    if (P.k >= F.length && !P.D.writing) P.k = 0;
    P.playing = true; P.D.heard = true; if (P.D.status === "new") P.D.status = "in";
    const tok = ++P.tok;
    paint(); loop(tok);
  }
  function pause() { if (!P.playing) return; P.playing = false; P.tok++; cancel(); P.wait = ""; if (P.D) P.D.at = P.k; paint(); }
  function stop() { pause(); if (P.D) P.D.at = P.k; P.D = null; P.recall = null; closeWalk(); paint(); }
  function seek(k) { const was = P.playing; pause(); P.recall = null; P.k = Math.max(0, Math.min(k, flat(P.D).length)); if (was) play(); else { showCap(flat(P.D)[P.k], -1); paint(); } }
  async function loop(tok) {
    const D = P.D;
    while (P.playing && tok === P.tok) {
      const F = flat(D);
      if (P.k >= F.length) {
        if (D.writing) { P.wait = `Writing chapter ${Math.min(D.chapters.length, (F[F.length - 1]?.ci ?? -1) + 2)}…`; paint(); await sleep(300); continue; }
        P.playing = false; P.tok++; P.wait = ""; return finish(D);
      }
      P.wait = "";
      const it = F[P.k];
      paint(it);
      const r = await speak(it, tok);
      if (tok !== P.tok) return;
      if (r === "cut") { await sleep(150); continue; } // something else silenced the voice: say the sentence again
      P.k++; D.at = P.k;
      const tn = turnAt(D, it);
      if (it.last && tn?.hold) while (D.asking && tok === P.tok) { P.wait = "Thinking about your question…"; paint(); await sleep(250); }
      if (it.last && tn?.recall && !tn.answered) { P.playing = false; P.tok++; return tn.think || P.drive ? thinkRecall(D, tn) : askRecall(D, tn); }
    }
  }
  /** Speaks one sentence in its host's voice, lighting words as they're said. Resolves "done", or "cut" if silenced. */
  function speak(it, tok) {
    return new Promise((res) => {
      const D = P.D, tn = turnAt(D, it), who = tn.who;
      const words = it.text.split(/\s+/).filter(Boolean), starts = []; let pos = 0;
      for (const w of words) { const i = it.text.indexOf(w, pos); starts.push(i); pos = i + w.length; }
      let k = 0, fin = false, last = Date.now();
      const per = 60000 / (WPM * 1.12 * P.speed), began = Date.now();
      showCap(it, 0);
      const end = (r) => { if (fin) return; fin = true; clearInterval(clock); clearTimeout(safe); res(r); };
      let voiced = A.S.audio && utter(it.text, who, (ci) => { last = Date.now(); let j = starts.findIndex((s) => s > ci); j = j < 0 ? words.length - 1 : Math.max(0, j - 1); if (j > k) { k = j; showCap(it, k); } }, (e) => {
        if (fin) return;
        if (tok !== P.tok) return end("cut");
        if (e && (e.error === "interrupted" || e.error === "canceled")) return end("cut");
        // No usable voice (an error, or "finished" far too soon): let the clock carry the words instead.
        if (e || Date.now() - began < words.length * per * 0.3) { voiced = false; return; }
        showCap(it, words.length); end("done");
      });
      const clock = setInterval(() => {
        if (tok !== P.tok) return end("cut");
        if (!voiced) { if (k < words.length - 1) showCap(it, ++k); else end("done"); }
        else if (Date.now() - last > 900 && k < words.length - 1) showCap(it, ++k); // no word events from this voice: keep the words moving
      }, per);
      const safe = setTimeout(() => end("done"), (voiced ? 2.4 : 1.3) * words.length * per + 3000);
    });
  }
  /** The caption for D (the one playing, unless a page is showing another one at rest). */
  function showCap(it, n, D = P.D) {
    if (!it || !D) return;
    const tn = turnAt(D, it), cap = { who: tn?.who || "A", words: it.text.split(/\s+/).filter(Boolean), n, k: flat(D).indexOf(it) };
    if (D === P.D) P.cap = cap;
    const html = cap.words.map((w, i) => (i <= n ? `<b>${esc(w)}</b>` : `<span>${esc(w)}</span>`)).join(" ");
    $$(`.dl-player[data-d="${D.id}"] .dl-cap-t, .dl-walk[data-d="${D.id}"] .dl-cap-t`).forEach((c) => (c.innerHTML = html));
    if (D !== P.D) return;
    $$(".dl-tx-body .dl-s.on").forEach((s) => s.classList.remove("on"));
    const s = $(`.dl-tx-body .dl-s[data-k="${P.cap.k}"]`); if (s) { s.classList.add("on"); if (n <= 0) s.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
  }
  function back15() { const F = flat(P.D); const it = F[Math.min(P.k, F.length - 1)]; if (!it) return; const to = Math.max(0, it.t0 - 15); let k = 0; F.forEach((x, i) => { if (x.t0 <= to) k = i; }); seek(k); }
  function nextCh() { const F = flat(P.D); const cur = F[Math.min(P.k, F.length - 1)]; const k = F.findIndex((x) => x.ci > (cur?.ci ?? -1)); if (k < 0) { if (P.D.writing) A.toast("Next chapter is still being written.", "It's written a chapter ahead of you; it'll be ready before you get there."); return; } seek(k); }
  function setSpeed(v) { P.speed = v; if (P.playing) { const k = P.k; pause(); play(P.D, k); } paint(); }
  const speed = () => setSpeed(SPEEDS[(SPEEDS.indexOf(P.speed) + 1) % SPEEDS.length]);
  /** On a Dialogue's page, the controls act on that Dialogue, even if another one is in the mini player. */
  function focusCur() { if (A.S.view === "dialogue" && cur && P.D !== cur && !P.walk) { if (P.D) stop(); P.D = cur; P.k = cur.at || 0; } }

  /* ---------- painting the player wherever it shows (page, mini player, walk mode) */
  function paint() {
    const D = P.D;
    $$("[data-dl-pp]").forEach((b) => { const mine = b.dataset.dlPp === (D?.id || ""); const on = mine && P.playing; b.innerHTML = on ? IC.pause : IC.play; b.setAttribute("aria-label", on ? "Pause" : "Play"); b.dataset.on = String(on); });
    $$(".dl-player, .dl-walk").forEach((el) => { el.dataset.playing = String(P.playing && el.dataset.d === D?.id); el.dataset.who = el.dataset.d === D?.id ? P.cap.who || "" : ""; });
    $$("[data-dl-speed]").forEach((b) => (b.textContent = `${P.speed}×`));
    [D, cur].filter((x, i, a) => x && a.indexOf(x) === i).forEach((D) => {
      const at = D === P.D ? P.k : D.at || 0;
      const F = flat(D), it = F[Math.min(at, F.length - 1)];
      const pos = it ? (at >= F.length ? D.total : it.t0) : 0;
      const tot = D.writing ? Math.max(D.total, D.len * 60) : D.total;
      $$(`[data-dl-time="${D.id}"]`).forEach((t) => (t.textContent = `${mmss(pos)} / ${D.writing ? "≈" : ""}${mmss(tot)}`));
      $$(`[data-dl-chap="${D.id}"]`).forEach((t) => (t.textContent = it ? `Chapter ${it.ci + 1} of ${D.chapters.length} · ${D.chapters[it.ci].title}` : ""));
      const wait = D === P.D ? P.wait : "";
      $$(`[data-dl-wait="${D.id}"]`).forEach((t) => { t.textContent = wait; t.hidden = !wait; });
      $$(`.dl-bar[data-d="${D.id}"]`).forEach((bar) => [...bar.children].forEach((seg, ci) => { const s = chStart(D, ci); const e = chStart(D, ci + 1); const n = (e < 0 ? F.length : e) - s; seg.style.setProperty("--p", s < 0 || !n ? 0 : Math.max(0, Math.min(1, (at - s) / n))); seg.dataset.state = s < 0 ? "planned" : ""; }));
      $$(`.dl-chapters[data-d="${D.id}"] li`).forEach((li, ci) => li.setAttribute("aria-current", String(it?.ci === ci)));
      const h = D === P.D && P.cap.who === "B" ? D.pair.B : D === P.D || !it ? D.pair.A : hostOf(D, turnAt(D, it));
      $$(`[data-dl-speaker="${D.id}"]`).forEach((t) => (t.innerHTML = `<b>${esc(h.name)}</b> ${esc(h.role)}`));
    });
    mini();
  }

  /* ================================================================ asking the hosts, marking, recall */
  async function ask(text) {
    const D = P.D; if (!D) return;
    pause();
    const F = flat(D), cur = F[Math.min(P.k, F.length - 1)] || { ci: 0, ti: -1, si: 0 };
    const ch = D.chapters[cur.ci];
    let at;
    if (P.k >= F.length) at = ch.turns.length;
    else if (cur.si === 0) at = cur.ti;
    else { // split the turn so the answer comes now and the host picks up again at the interrupted sentence
      const tn = ch.turns[cur.ti], ss = sentences(tn.say);
      ch.turns.splice(cur.ti, 1, { ...tn, say: ss.slice(0, cur.si).join(" ") }, { ...tn, say: ss.slice(cur.si).join(" "), cont: true });
      at = cur.ti + 1;
    }
    const other = turnAt(D, cur)?.who === "A" ? "B" : "A";
    ch.turns.splice(at, 0, { who: "you", say: text }, { who: other, say: "Good question. Give us a second.", hold: true, aside: true });
    touch(D); D.asking = true; D.asked = (D.asked || 0) + 1; renderTx();
    P.k = flat(D).findIndex((it) => it.ci === cur.ci && it.ti === at + 1);
    play();
    let turns = null;
    if (A.S.ai) {
      try {
        const heard = F.slice(Math.max(0, P.k - 4), P.k).map((it) => `${hostOf(D, turnAt(D, it)).name}: ${it.text}`).join(" ");
        const got = [];
        await A.streamLines(`${A.LEARNER}\nThey're listening to a Studiolo Dialogue, "${D.title}", an audio conversation between ${D.pair.A.name} (${D.pair.A.role}) and ${D.pair.B.name} (${D.pair.B.role}). It is audio only.\n${goalLine(D)}\nThey just heard: ${heard}\nThey cut in with a question: "${text}"\nReply with JSON Lines only, 2 turns: {"who":"A" or "B","say":"…"}. ${D.context === "drive" || P.drive ? "They are DRIVING: keep each turn under 30 words, no numbers, nothing to picture." : ""} The host best placed to answer answers directly in 30 to 60 words. The other adds one angle in under 35 words and ends with a short hand-back such as "Right, back to where we were." Spoken English, no lists, no invented quotations or statistics.`, (o) => { if (o.say) got.push({ who: o.who === "B" ? "B" : "A", say: String(o.say), aside: true }); });
        if (got.length) turns = got;
      } catch (e) { aiFail(e); }
    }
    if (!turns) {
      const hit = (D.canned || []).find(([re]) => re.test(text));
      turns = hit ? hit[1].map((t) => ({ ...t, aside: true })) : [{ who: "A", aside: true, say: "That one's outside what this sample can answer. With Claude allowed, we'd answer your exact question here, from your sources first." }, { who: "B", aside: true, say: "Right, back to where we were." }];
    }
    ch.turns.splice(at + 2, 0, ...turns);
    touch(D); D.asking = false; renderTx(); paint();
    journal(D, `Asked the hosts in <b>${esc(D.title)}</b>: “${esc(text)}”`);
  }
  function mark() {
    const D = P.D; if (!D) return;
    const F = flat(D), it = F[P.cap.k] || F[Math.max(0, Math.min(P.k, F.length) - 1)]; if (!it) return;
    const tn = turnAt(D, it), h = hostOf(D, tn);
    const text = tn.say.length > 200 ? tn.say.slice(0, 197).replace(/\s+\S*$/, "") + "…" : tn.say;
    MARKS.unshift({ d: D.id, k: flat(D).indexOf(it), at: mmss(it.t0), who: h.name, text });
    journal(D, `Marked while listening to <b>${esc(D.title)}</b> at ${mmss(it.t0)}: “${esc(text.slice(0, 90))}${text.length > 90 ? "…" : ""}”`);
    A.toast("Marked. Saved to your Library.", `A quote note from ${esc(h.name)} at ${mmss(it.t0)}, tagged ${esc(D.topic)}, linked back to this moment.`);
    if (S().view === "dialogue") renderMarks();
    flash();
  }
  function flash() { $$(".dl-walk .dl-w-mark, [data-dl-act=mark]").forEach((b) => { b.dataset.flash = "true"; setTimeout(() => (b.dataset.flash = "false"), 700); }); }
  function askRecall(D, tn) {
    P.recall = tn; P.wait = "";
    renderTx(); paint();
    A.setChips([tn.learner || tn.answer || "I'm not sure", "Skip the question"]);
    A.setState?.("listening", "Your turn");
  }
  /** Driving: the question is only to think about. A quiet pause, then the host gives the answer. Saying it aloud is optional. */
  function thinkRecall(D, tn) {
    P.recall = tn; renderTx();
    A.setChips([tn.learner || tn.answer || "I'm not sure"]);
    let n = 8;
    P.wait = `Think it over… ${n}`; paint();
    clearInterval(P.thinkT);
    P.thinkT = setInterval(() => {
      if (P.recall !== tn) return clearInterval(P.thinkT);
      if (--n > 0) { P.wait = `Think it over… ${n}`; paint(); return; }
      clearInterval(P.thinkT); P.recall = null; tn.answered = "thought";
      const ch = D.chapters.find((c) => c.turns.includes(tn)), at = ch.turns.indexOf(tn) + 1;
      ch.turns.splice(at, 0, { who: tn.who, aside: true, reveal: true, say: `Here's how I'd put it. ${tn.answer}` });
      touch(D); renderTx(); P.wait = "";
      P.k = flat(D).findIndex((it) => it.ci === D.chapters.indexOf(ch) && it.ti === at); play();
    }, 1000);
  }
  async function answerRecall(text) {
    const D = P.D, tn = P.recall; if (!D || !tn) return;
    P.recall = null;
    const ch = D.chapters.find((c) => c.turns.includes(tn)), at = ch.turns.indexOf(tn) + 1;
    if (/^skip/i.test(text.trim())) { tn.answered = "skipped"; ch.turns.splice(at, 0, { who: tn.who, aside: true, say: `No problem. The short answer: ${tn.answer || "it's in the last chapter."}` }); }
    else {
      ch.turns.splice(at, 0, { who: "you", say: text, answers: true });
      let ok = null, say = null;
      if (A.S.ai) {
        try {
          const { text: out } = await A.S.ai(`A learner just answered a recall question at the end of a Studiolo Dialogue (audio).\nQuestion: "${tn.say}"\nIdeal answer: "${tn.answer || ""}"\nTheir answer: "${text}"\nReply with one JSON object only: {"ok":true or false,"say":"what ${hostOf(D, tn).name} says back, 1 or 2 spoken sentences: warm, specific about what they got right, and the missing piece if any"}`, { modelTier: "quick", cache: false });
          const j = JSON.parse(String(out).slice(String(out).indexOf("{"), String(out).lastIndexOf("}") + 1)); ok = !!j.ok; say = j.say;
        } catch (e) { aiFail(e); }
      }
      if (say == null) {
        const keys = String(tn.answer || "").toLowerCase().match(/[a-z]{5,}/g) || [];
        const hits = keys.filter((w) => text.toLowerCase().includes(w.slice(0, 5))).length;
        ok = hits >= 2; say = ok ? `That's it. ${tn.answer}` : `Close. The full answer: ${tn.answer}`;
      }
      tn.answered = ok ? "right" : "partly";
      ch.turns.splice(at + 1, 0, { who: tn.who, aside: true, say });
    }
    touch(D); renderTx();
    P.k = flat(D).findIndex((it) => it.ci === D.chapters.indexOf(ch) && it.ti >= at && turnAt(D, it).who !== "you");
    play();
  }
  function finish(D) {
    D.status = "played"; D.at = 0;
    const tn = D.chapters.flatMap((c) => c.turns).find((t) => t.recall);
    journal(D, `Listened to <b>${esc(D.title)}</b>${tn?.answered === "right" ? "; recall answered" : ""}.`);
    renderTx(); paint();
    A.setState?.("idle", "");
    if (A.S.view === "dialogue") A.setChips(["Play it again"]);
    A.toast("Finished listening.", `${tn?.answered === "right" ? "Recall answered and noted on " + esc(D.topic) + ". " : ""}Watch or read it from the switcher at the top.`);
  }
  function journal(D, html) { A.S.journal.push({ topic: D.topic, html }); }
  const hostOf = (D, tn) => (tn?.who === "B" ? D.pair.B : D.pair.A);
  const S = () => A.S;
  function aiFail(e) {
    const code = e?.code;
    if (["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].includes(code)) { A.S.ai = null; A.aiBadge(); }
  }

  /* ================================================================ making a Dialogue */
  const LENS = [[10, 4], [20, 6], [30, 8]]; // minutes → chapters
  const goalLine = (D) => { const g = goalOf(D); return g.id === "none" ? "No learning goal: they're curious." : `Learning goal it must serve: "${g.title}" (${g.due}). Every chapter should move them toward it.`; };
  const FMT_LINE = { watch: "Watch: slides and a narrator", listen: "Listen: two voices, audio only", read: "Read: a long read" };
  function briefLines(D) {
    const fmt = D.format || "listen";
    const g = goalOf(D), srcs = D.sources.map((id) => srcOf(D, id)).filter(Boolean), known = D.skipKnown ? KNOWN[D.topic] || [] : [];
    const ground = { mostly: "Draw on these first and name them when you use them. Anything else is general knowledge; say so when it matters.", only: "Use only these. If they don't cover something, the hosts say so.", open: "Use them where they help; general knowledge is fine." }[D.grounding];
    return [
      ["Learner", "An architect learning climate-responsive design and Islamic architecture", "Onboarding"],
      ["Goal", g.id === "none" ? "None: curiosity" : `${g.title} · ${g.due}`, g.id === "none" ? "" : "Goal note, Library"],
      ["Format", FMT_LINE[fmt], "Your choice"],
      ["Filed under", `${areaOf(D.topic)} › ${D.topic}`, "Loci"],
      ...(fmt !== "listen" ? [] : [["Voices", `${D.pair.A.name}, ${D.pair.A.role.toLowerCase()} (${D.pair.A.lens}) · ${D.pair.B.name}, ${D.pair.B.role.toLowerCase()} (${D.pair.B.lens})`, "Your choice"]]),
      ["Sources", srcs.length ? `${srcs.map((s) => s[1]).join("; ")}. ${ground}` : "None chosen: general knowledge, said as such", "Library"],
      ["Already known", known.length ? known.map((k) => `${k[0]}: ${k[1]} (${k[2]})`).join("; ") + ". Don't re-explain; build on it." : D.skipKnown ? "Nothing yet on this topic" : "Not used", "Learn"],
      ["Length", fmt === "listen" ? `${D.len} min · ${D.chapters?.length || (LENS.find((l) => l[0] === D.len) || LENS[1])[1]} chapters · audio only` : fmt === "watch" ? `${D.len === 3 ? "2–3" : "4–6"} min · narrated slides` : `about ${D.len} min to read · sections, with sources quoted`, ""],
      ...(fmt !== "listen" ? [] : [["Heard", D.context === "drive" ? "Driving: written and played for the road" : CONTEXTS[D.context || "any"], "Your choice"]]),
      ...(fmt === "listen" && D.context === "drive" ? [["Written for driving", DRIVE_RULES.join(". ") + ".", "Studiolo"]] : []),
      ["Rules", "No invented quotations, page numbers or statistics; a host says when unsure", "Studiolo"],
    ];
  }
  function promptHead(D) {
    const srcs = D.sources.map((id) => srcOf(D, id)).filter(Boolean), known = D.skipKnown ? KNOWN[D.topic] || [] : [];
    const ground = { mostly: "Draw on these first and name them when you use them (\"in your lecture notes…\"). Anything else is general knowledge; say so when it matters.", only: "Use only these. If they don't cover something, the hosts say so.", open: "Use them where they help; general knowledge is fine." }[D.grounding];
    return `${A.LEARNER}
${goalLine(D)}
Filed under: ${areaOf(D.topic)} › ${D.topic}.
Host A: ${D.pair.A.name}, ${D.pair.A.role}; their angle: ${D.pair.A.lens}.
Host B: ${D.pair.B.name}, ${D.pair.B.role}; their angle: ${D.pair.B.lens}.
${srcs.length ? `Their own sources, from their library: ${srcs.map((s) => `"${s[1]}" (${s[2]})`).join(", ")}. ${ground}` : "No sources chosen: general knowledge, said as such."}
${known.length ? `They already know (don't re-explain; build on it): ${known.map((k) => `${k[0]} "${k[1]}"`).join(", ")}.` : ""}
${D.context === "drive" ? `It will be heard while DRIVING. Write for a listener whose eyes and most of their attention are on the road:\n- ${DRIVE_RULES.join("\n- ")}` : D.context === "walk" ? "It will be heard on a walk or a ride: nothing to look at, and chapters that survive a missed sentence." : ""}`;
  }
  /** Writes the plan, then each chapter, staying one chapter ahead of the listener. */
  async function write(D) {
    D.writing = true; touch(D); refresh(D);
    const nCh = (LENS.find((l) => l[0] === D.len) || LENS[1])[1];
    if (A.S.ai) {
      try {
        await A.streamLines(`${promptHead(D)}
Plan a Studiolo Dialogue: a ${D.len}-minute audio conversation between the two hosts that this learner will listen to while walking, cycling or driving. It is audio only: never mention slides, screens or diagrams.
Question: "${D.q}"
Reply with JSON Lines only, one object per line. First line: {"title":"at most 8 words","takeaway":"what they should come away with, one sentence"}. Then exactly ${nCh} lines, one per chapter: {"chapter":"title, at most 6 words","point":"what this chapter settles, as a short clause a host could say aloud"}.${D.context === "drive" ? " It's for driving: chapter 1 states the one main idea, and every chapter stands on its own." : ""} Chapter 1 frames the question for the goal and says what they already know and will be skipped. The second-to-last chapter applies everything to the goal. The last chapter is short and ends with a recall question.`, (o) => {
          if (o.takeaway !== undefined || (o.title && !o.chapter)) { D.title = String(o.title || D.title); D.takeaway = o.takeaway; refresh(D); return; }
          if (o.chapter) { D.chapters.push({ title: String(o.chapter), point: String(o.point || ""), turns: [], state: "planned" }); touch(D); refresh(D); }
        });
      } catch (e) { aiFail(e); }
    }
    if (D.chapters.length < 2) return writeSample(D);
    for (let n = 0; n < D.chapters.length; n++) {
      while (listenerCh(D) < n - 1) { D.chapters[n].state = "waiting"; refresh(D); await sleep(500); }
      const ch = D.chapters[n], lastCh = n === D.chapters.length - 1;
      ch.state = "writing"; refresh(D);
      const prev = n ? D.chapters[n - 1].turns.slice(-2).map((t) => `${hostOf(D, t).name}: ${t.say}`).join(" ") : "";
      const per = lastCh ? 3 : Math.max(6, Math.min(12, Math.round((D.len * WPM) / D.chapters.length / 50)));
      try {
        await A.streamLines(`${promptHead(D)}
You are writing chapter ${n + 1} of ${D.chapters.length} of a Studiolo Dialogue titled "${D.title}", an audio conversation for listening on the move. Never mention slides, screens or diagrams.
The question: "${D.q}"
The plan: ${D.chapters.map((c, i) => `${i + 1}. ${c.title}: ${c.point}`).join(" ")}
Write chapter ${n + 1}, "${ch.title}": ${ch.point}
${prev ? `The previous chapter ended: ${prev}` : "This is the opening: each host says who they are in a few words, and host A frames the question for the goal."}
Reply with JSON Lines only, one turn per line: {"who":"A" or "B","say":"…","src":"exact title of one of their sources, only when this turn draws on it"}. Write ${per} turns of ${D.context === "drive" ? "20 to 50" : "25 to 70"} words each, in natural spoken English with contractions.${D.context === "drive" && n ? ' Open with a one-sentence "Where we are:" line.' : ""} The hosts bring their different angles, and disagree at least once in a real way before settling it. No stage directions, no lists read aloud, no invented quotations, page numbers or statistics; when unsure, a host says so.${lastCh ? (D.context === "drive" ? ` This is the last chapter: host A asks one question only to think about (no answer expected), in its own turn, written as {"who":"A","say":"the question","recall":true,"think":true,"answer":"the ideal answer in one or two short sentences"}. Then host B closes with the three things to keep, and says their marks are in their library for when they're parked.` : ` This is the last chapter: end with host A asking the listener one recall question in its own turn, written as {"who":"A","say":"the question","recall":true,"answer":"the ideal answer in one sentence"}.`) : ""}`, (o) => {
          if (!o.say) return;
          const src = o.src ? (LIB[D.topic] || []).find((s) => String(o.src).toLowerCase().includes(s[1].toLowerCase().slice(0, 18)))?.[0] : undefined;
          ch.turns.push({ who: o.who === "B" ? "B" : "A", say: String(o.say), src, recall: !!o.recall, think: !!o.think, answer: o.answer ? String(o.answer) : undefined, learner: o.answer ? String(o.answer) : undefined });
          touch(D); refresh(D);
        });
      } catch (e) { aiFail(e); }
      if (!ch.turns.length) { D.chapters.splice(n); D.cut = true; break; }
      ch.state = "ready"; refresh(D);
    }
    D.writing = false; if (D.status === "making") D.status = "new"; touch(D); refresh(D);
  }
  /** No Claude: the sample Dialogue for that area, arriving at a realistic pace. */
  async function writeSample(D) {
    const S0 = D.topic === "Islamic architecture" ? HASSAN : D.context === "drive" ? DRIVE : COOL;
    D.sample = true; D.title = S0.title; D.pair = S0.pair; D.canned = S0.canned; D.askChip = S0.askChip; D.chapters = []; touch(D); refresh(D);
    await sleep(900);
    S0.chapters.forEach((c) => D.chapters.push({ title: c.title, point: c.point, turns: [], state: "planned" }));
    touch(D); refresh(D);
    for (let n = 0; n < S0.chapters.length; n++) {
      while (listenerCh(D) < n - 1) { D.chapters[n].state = "waiting"; refresh(D); await sleep(500); }
      D.chapters[n].state = "writing"; refresh(D);
      for (const t of S0.chapters[n].turns) { await sleep(n === 0 ? 1100 : 450); D.chapters[n].turns.push({ ...t }); touch(D); refresh(D); }
      D.chapters[n].state = "ready";
    }
    D.writing = false; if (D.status === "making") D.status = "new"; touch(D); refresh(D);
  }
  function listenerCh(D) { if (P.D !== D) return flat(D)[D.at]?.ci ?? 0; const F = flat(D); return (F[Math.min(P.k, F.length - 1)] || { ci: 0 }).ci; }
  /** Keeps whichever screen shows this Dialogue in step with the writer. */
  let refreshT = null;
  function refresh(D) {
    clearTimeout(refreshT);
    refreshT = setTimeout(() => {
      const v = S().view;
      if (v === "dialogue" && cur === D) { renderHead(); renderChapters(); renderTx(); paint(); }
      const L = lumenOf(D); if (L && D.syncTitle && D.title) L.title = D.title;
      $$(`[data-dl-meta="${D.id}"]`).forEach((x) => (x.textContent = info(D.id).meta));
      if (D.listenNow && S().view === "dialogue" && cur === D && flat(D).length >= 2) { D.listenNow = false; if (P.D !== D || !P.playing) play(D, 0); }
    }, 60);
  }

  /* ================================================================ screens */
  const ctxPill = (D) => (D.context === "drive" ? `<span class="dl-ctx">${IC.car}For driving</span>` : "");
  const voicesLine = (D) => `${esc(D.pair.A.name)}, ${esc(D.pair.A.role.toLowerCase())} · ${esc(D.pair.B.name)}, ${esc(D.pair.B.role.toLowerCase())}`;
  const goalPill = (D) => { const g = goalOf(D); return g.id === "none" ? "" : `<span class="dl-goal" title="${esc(g.title)}"><i aria-hidden="true">◎</i>For: ${esc(g.short)}</span>`; };
  const topicTag = (D) => A.tag({ anchor: [areaOf(D.topic), D.topic] });
  const initials = (h) => esc(h.name[0]);
  const cover = (D, cls = "") => `<div class="dl-cover ${cls}" aria-hidden="true"><span class="dl-disc a">${initials(D.pair.A)}</span><span class="dl-disc b">${initials(D.pair.B)}</span><span class="dl-wave">${"<i></i>".repeat(14)}</span></div>`;
  const lenLabel = (D) => (D.status === "making" && D.writing ? `≈${D.len} min` : minLabel(lengthOf(D)));
  function progressBar(D) {
    const F = flat(D);
    return `<span class="dl-mbar" aria-hidden="true">${D.chapters.map((c, ci) => { const s = chStart(D, ci), e = chStart(D, ci + 1), n = (e < 0 ? F.length : e) - s, at = P.D === D ? P.k : D.at || 0; return `<i style="--p:${s < 0 || !n ? 0 : Math.max(0, Math.min(1, (at - s) / n))}"></i>`; }).join("")}</span>`;
  }
  function stateLine(D) {
    if (D.writing) { const w = D.chapters.findIndex((c) => c.state === "writing"); const wt = D.chapters.findIndex((c) => c.state === "waiting"); return `<span class="dl-st making"><span class="lx-dot" aria-hidden="true"></span>${!D.chapters.length ? "Planning" : w >= 0 ? `Writing chapter ${w + 1}` : wt >= 0 ? `Chapters 1–${wt} ready; the rest is written as you listen` : "Writing"}</span>`; }
    return { new: '<b class="dl-st new">New</b>', in: '<span class="dl-st">In progress</span>', played: '<span class="dl-st done">Played</span>' }[D.status] || "";
  }
  const lumenOf = (D) => A.LUMENS.find((l) => l.id === D.lumen) || A.LUMENS.find((l) => l.listen === D.id || l.listenDrive === D.id);
  /** What a Lumen card and the Home bar need to know about a Listen format. */
  function info(id) {
    const D = DIALOGUES.find((x) => x.id === id); if (!D) return null;
    const F = flat(D), at = P.D === D ? P.k : D.at || 0, it = F[Math.min(at, F.length - 1)];
    return { meta: D.writing ? (F.length ? "writing…" : "planning…") : minLabel(lengthOf(D)), ch: (it?.ci ?? 0) + 1, chapters: D.chapters.length, drive: D.context === "drive" };
  }

  /* ---------- the brief: one screen to make a Lumen in any format, prefilled from context */
  let C = null;
  const DEF_LEN = { watch: 5, listen: 20, read: 15 };
  function detectTopic(q) {
    const t = q.toLowerCase();
    if (/iwan|mosque|madrasa|cairo|mamluk|sultan|islamic|minaret|dome/.test(t)) return "Islamic architecture";
    if (/daylight|light shel|shading|glare|window/.test(t)) return "Daylight & shading";
    if (/darwin|species|selection|evolution/.test(t)) return "Natural selection";
    return "Climate-responsive design";
  }
  /** The brief, prefilled: the goal and sources follow the topic, which follows the question. */
  function brief({ q = "", topic, goal, context, format = "listen", lumen } = {}) {
    if (lumen) { q = q || lumen.q; topic = topic || lumen.anchor?.[1]; }
    topic = topic || (q ? detectTopic(q) : "Climate-responsive design");
    const lg = lumen?.goal ? GOALS.find((x) => x.short === lumen.goal) : null;
    C = { q, topic, goal: goal || lg?.id || (GOALS.find((x) => x.topic === topic) || GOALS[3]).id, context: context || "any", format, lumen: lumen || null, pair: 0, sources: new Set((LIB[topic] || []).slice(0, 3).map((s) => s[0])), grounding: "mostly", skipKnown: true, len: DEF_LEN[format] };
  }
  function draft() { return { q: C.q, topic: C.topic, goal: C.goal, format: C.format, pair: pairsFor(C.topic)[C.pair] || pairsFor(C.topic)[0], sources: [...C.sources], grounding: C.grounding, skipKnown: C.skipKnown, len: C.len, context: C.context, chapters: [] }; }
  /** A Listen version of a Lumen you already have (or its drive edition), made straight away from its own brief. */
  function listenFor(L, opts = {}) { if (!L) return; brief({ lumen: L, format: "listen", ...opts }); make("now"); }
  function make(how) {
    if (!C?.q.trim()) return;
    const anchor = [areaOf(C.topic), C.topic], g = goalOf({ goal: C.goal }), goal = g.id === "none" ? null : g.short;
    if (how === "live") { const q = C.q, t = C.topic; C = null; return A.startNew(q, t); }
    if (how === "watch" || how === "read") { (how === "watch" ? A.makeLumen : A.makeRead)(C.q, { into: C.lumen, anchor, goal }); C = null; return A.openTab("home"); }
    const d = draft(), L = A.lumenFor(C.q, { into: C.lumen, anchor, goal });
    const D = { id: "d" + A.nextId(), title: L.title, ...d, lumen: L.id, when: "Today", status: "making", offline: how === "later" || C.context === "drive", at: 0, writing: true, listenNow: how === "now", syncTitle: !C.lumen };
    if (d.context === "drive" && L.listen) L.listenDrive = D.id; else L.listen = D.id;
    touch(D); DIALOGUES.unshift(D); C = null;
    write(D);
    if (how === "now") return openDialogue(D.id);
    A.openTab("home");
    A.toast("Making your Lumen.", `Listen: the plan and the first two chapters are written now, the rest as you listen.${D.offline ? " It'll be saved for offline listening." : ""}`);
  }
  /** Home bar, Listen: no brief screen, just the defaults, and it starts playing as soon as it can. */
  function quickListen(q) { if (!String(q).trim()) return; brief({ q: String(q).trim(), format: "listen" }); make("now"); }

  /* ---------- one Dialogue: the player, chapters, other ways in, transcript */
  let cur = null, txTab = "tx";
  function openDialogue(id, { autoplay } = {}) {
    const D = DIALOGUES.find((x) => x.id === id); if (!D) return;
    A.leaveStudio(); A.S.run++;
    cur = D; A.S.view = "dialogue"; A.S.tab = "lumens";
    A.learnShell(`<header class="destination-header"><div class="destination-crumb"><strong>Learn</strong><i aria-hidden="true">/</i><a href="#lumens" data-tab="lumens">Lumens</a><i aria-hidden="true">/</i><span>${esc(D.title)}</span></div></header>
      <div class="dl-head"></div>
      <div class="dl-main"><div class="dl-col">
        <div class="dl-player" data-d="${D.id}">
          <div class="dl-voices"><div class="dl-v a"><span class="dl-disc a">${initials(D.pair.A)}</span><p><b>${esc(D.pair.A.name)}</b>${esc(D.pair.A.role)}</p></div><span class="dl-wave" aria-hidden="true">${"<i></i>".repeat(22)}</span><div class="dl-v b"><span class="dl-disc b">${initials(D.pair.B)}</span><p><b>${esc(D.pair.B.name)}</b>${esc(D.pair.B.role)}</p></div></div>
          <p class="dl-cap" aria-live="off"><span class="dl-cap-who" data-dl-speaker="${D.id}"></span><span class="dl-cap-t"></span></p>
          <p class="dl-wait" data-dl-wait="${D.id}" hidden></p>
          <div class="dl-bar" data-d="${D.id}"></div>
          <div class="dl-meta-row"><span data-dl-chap="${D.id}"></span><span class="dl-time" data-dl-time="${D.id}"></span></div>
          <div class="dl-ctl"><button class="dl-ib" type="button" data-dl-act="back" aria-label="Back 15 seconds" title="Back 15 seconds">${IC.back}</button><button class="dl-pp" type="button" data-dl-pp="${D.id}" aria-label="Play">${IC.play}</button><button class="dl-ib" type="button" data-dl-act="next" aria-label="Next chapter" title="Next chapter">${IC.next}</button>
            <span class="sp"></span><button class="dl-txtb" type="button" data-dl-speed>1×</button><button class="dl-txtb" type="button" data-dl-act="mark" title="Save this moment to your Library">${IC.mark}Mark</button><button class="dl-txtb" type="button" data-dl-walk="${D.id}">${IC.walk}Walk</button><button class="dl-txtb" type="button" data-dl-drive="${D.id}">${IC.car}Drive</button></div>
        </div>
        <section class="dl-sub"><p class="ll-h">Chapters</p><ol class="dl-chapters" data-d="${D.id}"></ol></section>
        <section class="dl-sub"><p class="ll-h">More on ${esc(D.topic)}</p><div class="dl-ways">${ways(D)}</div></section>
        <section class="dl-sub dl-marks-sec"></section>
      </div>
      <aside class="ll-tx dl-tx" aria-label="Transcript"><div class="ll-tx-head" role="tablist"><button type="button" role="tab" data-dl-tab="tx">Transcript</button><button type="button" role="tab" data-dl-tab="src">Sources</button><button type="button" role="tab" data-dl-tab="brief">Made from</button><span class="sp"></span><span class="ll-hint">Tap a line to play it</span></div><div class="dl-tx-body ll-tx-body" role="log"></div></aside></div>`);
    renderHead(); renderChapters(); renderTx(); renderMarks();
    A.dock({ ctx: `Listen · ${D.title}`, chips: [D.askChip || "What's the strongest objection to this?", "Mark that", "Next chapter", "Pause"] });
    if (P.D === D) showCap(flat(D)[Math.min(P.k, flat(D).length - 1)], P.cap.n); else { const F = flat(D); showCap(F[Math.min(D.at || 0, F.length - 1)], -1, D); }
    paint(); window.scrollTo(0, 0);
    if (autoplay) play(D);
  }
  function renderHead() {
    const D = cur, h = $(".dl-head"); if (!h) return;
    const L = lumenOf(D);
    const ed = D.context === "drive" ? (L?.listen && L.listen !== D.id ? `<button class="button button-quiet" type="button" data-dl-open="${L.listen}">${IC.phones}Standard edition</button>` : "")
      : L?.listenDrive ? `<button class="button button-quiet" type="button" data-dl-open="${L.listenDrive}">${IC.car}Drive edition</button>` : `<button class="button button-quiet" type="button" data-dl-act="drive-edition">${IC.car}Make a drive edition</button>`;
    h.innerHTML = `<div class="dl-head-l"><h1>${esc(D.title)}</h1><p class="dl-qline">${esc(D.q)}</p><div class="dl-meta">${topicTag(D)}${goalPill(D)}${ctxPill(D)}<span>Two voices · ${lenLabel(D)} · ${D.chapters.length || "…"} chapters${D.sample ? " · sample, abridged" : ""}</span>${stateLine(D)}</div></div>
      <div class="dl-head-r">${A.fmtSwitch(L, "listen")}<div class="dl-head-acts">${ed}<button class="button button-quiet" type="button" data-dl-act="offline" aria-pressed="${!!D.offline}">${IC.down}${D.offline ? "Saved offline" : "Save for offline"}</button></div></div>`;
  }
  function renderChapters() {
    const D = cur, ol = $(".dl-chapters"), bar = $(".dl-bar"); if (!ol) return;
    const F = flat(D);
    ol.innerHTML = D.chapters.map((c, ci) => { const s = chStart(D, ci), e = chStart(D, ci + 1), d = s < 0 ? 0 : ((e < 0 ? D.total : F[e].t0) - F[s].t0); const st = c.state === "writing" ? "Writing…" : c.state === "waiting" ? "Written when you get closer" : c.state === "planned" ? "Planned" : mmss(d); return `<li data-state="${c.state || "ready"}"><button type="button" data-dl-ch="${ci}" ${s < 0 ? "disabled" : ""}><span class="n">${ci + 1}</span><span class="t"><b>${esc(c.title)}</b><small>${esc(c.point || "")}</small></span><span class="d">${st}</span></button></li>`; }).join("") || '<li class="dl-planning"><span class="lx-dot" aria-hidden="true"></span>Planning the chapters…</li>';
    if (bar) bar.innerHTML = D.chapters.map((c, ci) => `<i role="button" tabindex="0" data-dl-ch="${ci}" title="${esc(c.title)}" style="flex-grow:${Math.max(1, c.turns.reduce((n, t) => n + t.say.split(/\s+/).length, 0) || 40)}"></i>`).join("");
  }
  function renderTx() {
    const D = cur, body = $(".dl-tx-body"); if (!body || !D) return;
    $$("[data-dl-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.dlTab === txTab)));
    if (txTab === "src") { const srcs = D.sources.map((id) => srcOf(D, id)).filter(Boolean); body.innerHTML = (srcs.length ? srcs.map(([id, t, k]) => `<div class="dl-srcrow"><b>${esc(t)}</b><span>${esc(k)} · your library${D.chapters.some((c) => c.turns.some((x) => x.src === id)) ? " · quoted" : ""}</span></div>`).join("") : '<p class="dl-none">No sources: general knowledge.</p>') + `<p class="dl-note">${{ mostly: "Hosts draw on these first and name them. Anything else is general knowledge, and they say so when it matters.", only: "Hosts use only these, and say when they don't cover something.", open: "Hosts use these where they help; general knowledge is fine." }[D.grounding]}</p>`; return; }
    if (txTab === "brief") { body.innerHTML = `<dl class="dl-pack dl-pack-tx">${briefLines(D).map(([k, v, from]) => `<div><dt>${esc(k)}${from ? `<small>${esc(from)}</small>` : ""}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl><p class="dl-note">The same brief every format of a Lumen is made from: Watch, Listen and Read, and live sessions too.</p>`; return; }
    const F = flat(D); let k = 0;
    const html = D.chapters.map((c, ci) => {
      const turns = c.turns.map((tn) => {
        if (tn.who === "you") return `<div class="dl-turn you"><div class="who">${tn.answers ? "You answered" : "You asked"}</div><p>${esc(tn.say)}</p></div>`;
        const h = hostOf(D, tn), ss = sentences(tn.say);
        const sp = ss.map((s) => { const kk = k++; return `<span class="dl-s${P.D === D && kk < P.k ? " said" : ""}" data-k="${kk}" role="button" tabindex="0">${esc(s)} </span>`; }).join("");
        const src = tn.src && srcOf(D, tn.src);
        return `<div class="dl-turn ${tn.who === "B" ? "b" : "a"}${tn.aside ? " aside" : ""}${tn.cont ? " cont" : ""}${tn.recall ? " recall" : ""}">${tn.cont ? "" : `<div class="who"><span class="dl-disc ${tn.who === "B" ? "b" : "a"}">${esc(h.name[0])}</span>${esc(h.name)}<small>${esc(h.role)}</small>${tn.reveal ? "<em>The answer</em>" : tn.aside ? "<em>Answering you</em>" : ""}${tn.recall ? "<em>Recall</em>" : ""}</div>`}<p>${sp}</p>${src ? `<span class="dl-cite">${IC.open}${esc(src[1])}</span>` : ""}</div>`;
      }).join("");
      const pend = c.state === "writing" ? '<p class="dl-pend"><span class="lx-dot" aria-hidden="true"></span>Writing this chapter…</p>' : c.state === "waiting" ? `<p class="dl-pend">Written when you reach chapter ${ci}. Chapters you never reach aren't written or voiced.</p>` : c.state === "planned" && !c.turns.length ? '<p class="dl-pend">Planned</p>' : "";
      return `<h4 class="dl-chh"><span>Chapter ${ci + 1}</span>${esc(c.title)}</h4>${turns}${pend}`;
    }).join("");
    const recall = P.D === D && P.recall ? `<div class="dl-yourturn"><b>Your turn.</b> Answer out loud (hold the mic or Space), type it below, or say “skip”.</div>` : "";
    const tn = D.chapters.flatMap((c) => c.turns).find((t) => t.recall);
    const recap = D.status === "played" ? `<div class="dl-recap"><p class="dl-recap-h">Finished · ${minLabel(D.total)}</p><ul><li><b>Toward</b> ${esc(goalOf(D).title)}</li><li><b>Recall</b> ${tn?.answered === "right" ? "Answered. Noted as evidence on " + esc(D.topic) + " (retrieved)." : tn?.answered === "partly" ? "Partly. It'll come back in a review." : tn?.answered === "thought" ? "Asked to think over while driving; the answer was given. It'll come back in a review." : "Skipped."}</li><li><b>Marks</b> ${MARKS.filter((m) => m.d === D.id).length} saved to your Library</li>${D.asked ? `<li><b>Questions</b> ${D.asked} answered on the way</li>` : ""}</ul></div>` : "";
    body.innerHTML = (html || '<p class="dl-pend"><span class="lx-dot" aria-hidden="true"></span>Planning…</p>') + recall + recap;
    void F;
  }
  function renderMarks() {
    const sec = $(".dl-marks-sec"); if (!sec || !cur) return;
    const list = MARKS.filter((m) => m.d === cur.id);
    sec.innerHTML = `<p class="ll-h">Your marks <span>${list.length ? `${list.length} in your Library` : "Mark a moment and it's saved to your Library as a quote, tagged " + esc(cur.topic)}</span></p>${list.map((m) => `<button class="dl-markrow" type="button" data-dl-k="${m.k}"><span class="at">${m.at}</span><span><b>${esc(m.who)}</b> ${esc(m.text)}</span></button>`).join("")}`;
  }
  /** Other Lumens on the same topic, each with its formats. */
  function ways(D) {
    const others = A.LUMENS.filter((L) => L.anchor?.[1] === D.topic && L.id !== lumenOf(D)?.id).slice(0, 4);
    return others.length ? others.map((L) => `<div class="dl-way"><a class="dl-way-t" href="#open-${L.id}">${esc(L.title)}</a>${A.fmtPills(L)}</div>`).join("") : '<p class="dl-none">Nothing else on this topic yet.</p>';
  }

  /* ---------- walk mode: big targets, nothing to read */
  function openWalk(D) {
    if (D && D !== P.D) play(D); else if (!P.playing && P.D) play();
    closeWalk(); P.walk = true;
    if (!P.recall) A.setChips([P.D.askChip || "What's the strongest objection to this?", "Mark that"]);
    const w = document.createElement("div"); w.className = "dl-walk"; w.dataset.d = P.D.id; w.setAttribute("role", "dialog"); w.setAttribute("aria-label", "Walk mode");
    w.innerHTML = `<div class="dl-w-top"><span>${IC.phones}Walk mode</span><button class="dl-w-x" type="button" data-dl-act="walkx" aria-label="Close walk mode">${IC.x}</button></div>
      <p class="dl-w-title">${esc(P.D.title)}</p><p class="dl-w-ch" data-dl-chap="${P.D.id}"></p>
      <div class="dl-w-mid"><p class="dl-w-who" data-dl-speaker="${P.D.id}"></p><p class="dl-cap-t dl-w-cap"></p><p class="dl-w-wait" data-dl-wait="${P.D.id}" hidden></p></div>
      <div class="dl-bar" data-d="${P.D.id}">${P.D.chapters.map((c, ci) => `<i data-dl-ch="${ci}" style="flex-grow:${Math.max(1, c.turns.reduce((n, t) => n + t.say.split(/\s+/).length, 0) || 40)}"></i>`).join("")}</div>
      <p class="dl-w-time" data-dl-time="${P.D.id}"></p>
      <div class="dl-w-ctl"><button type="button" data-dl-act="back" aria-label="Back 15 seconds">${IC.back}</button><button class="dl-w-pp" type="button" data-dl-pp="${P.D.id}" aria-label="Play">${IC.play}</button><button type="button" data-dl-act="next" aria-label="Next chapter">${IC.next}</button></div>
      <div class="dl-w-row"><button class="dl-w-mark" type="button" data-dl-act="mark">${IC.mark}Mark this moment</button><button class="ll-mic dl-w-mic" type="button" data-mic="dock" aria-label="Hold to ask the hosts">${A.I.mic}<span>Hold to ask</span></button></div>
      <p class="dl-w-note">On a phone the screen can go off: headphone buttons play, pause and skip, and a double press marks the moment. Asking needs the mic.</p>`;
    document.body.appendChild(w);
    try { navigator.wakeLock?.request("screen").then((l) => (P.lock = l)).catch(() => {}); } catch { /* not offered */ }
    const F = flat(P.D); showCap(F[Math.min(P.k, F.length - 1)], P.cap.n); paint();
  }
  /* ---------- drive mode: set up before moving, then nothing to read; the wheel's buttons and your voice do the rest */
  function openDrive(D) {
    D = D || P.D || cur; if (!D) return;
    if (P.D !== D) { if (P.D) stop(); P.D = D; P.k = D.at || 0; } else pause();
    closeWalk(); P.walk = true; P.drive = true;
    D.offline = true;
    const fit = D.context === "drive";
    const w = document.createElement("div"); w.className = "dl-walk dl-drive"; w.dataset.d = D.id; w.setAttribute("role", "dialog"); w.setAttribute("aria-label", "Drive mode");
    w.innerHTML = `<div class="dl-w-top"><span>${IC.car}Drive mode</span><button class="dl-w-x" type="button" data-dl-act="walkx" aria-label="Close drive mode">${IC.x}</button></div>
      <div class="dl-d-ready">
        <p class="dl-w-title">${esc(D.title)}</p>
        <p class="dl-d-h">Set it up before you move.</p>
        <ul class="dl-d-list">
          <li><b>Saved for offline.</b> Tunnels and car parks won't stop it.</li>
          <li><b>The steering-wheel buttons work.</b> Play pauses, Back says that again, Next skips to the next chapter.</li>
          <li><b>You won't need the screen.</b> Press the car's voice button and say “Mark that”, or ask the hosts a question. Calls and directions pause it, and it picks up with a one-line recap.</li>
          ${fit ? "" : '<li class="warn"><b>This one wasn\'t written for driving.</b> It has numbers to hold and things to picture. A drive edition says the same thing in a way that survives a busy junction.</li>'}
        </ul>
        <div class="dl-d-go">${fit ? "" : '<button class="dl-w-mark" type="button" data-dl-act="drive-edition">Make a drive edition</button>'}<button class="dl-d-start" type="button" data-dl-act="drive-go">${IC.play}${fit ? "Start" : "Play it anyway"}</button></div>
      </div>
      <div class="dl-d-live" hidden>
        <p class="dl-d-ch" data-dl-chap="${D.id}"></p>
        <button class="dl-d-pp" type="button" data-dl-pp="${D.id}" aria-label="Play">${IC.play}</button>
        <p class="dl-w-who" data-dl-speaker="${D.id}"></p>
        <p class="dl-w-wait" data-dl-wait="${D.id}" hidden></p>
        <div class="dl-d-row"><button type="button" data-dl-act="again">${IC.back}Say that again</button><button type="button" data-dl-act="mark">${IC.mark}Mark</button><button type="button" data-dl-act="next">${IC.next}Next chapter</button></div>
        <button class="ll-mic dl-w-mic dl-d-mic" type="button" data-mic="dock" aria-label="Hold to ask the hosts">${A.I.mic}<span>Hold to ask</span></button>
        <p class="dl-w-note">In the car these are the wheel's buttons and its voice button (in the app, not a web page). Here the keyboard stands in: ← say that again · P play or pause · → next chapter · M mark · hold Space to ask. <button type="button" class="dl-d-call" data-dl-act="call">Simulate a phone call</button></p>
      </div>`;
    document.body.appendChild(w);
    A.setChips([D.askChip || "What's the strongest objection to this?", "Mark that"]);
    paint();
  }
  function driveGo() { const w = $(".dl-drive"); if (!w) return; $(".dl-d-ready", w).hidden = true; $(".dl-d-live", w).hidden = false; play(); try { navigator.wakeLock?.request("screen").then((l) => (P.lock = l)).catch(() => {}); } catch { /* not offered */ } }
  /** Say that again: back to the start of what's being said, or to the turn before if this one has only just begun. */
  function sayAgain() {
    const F = flat(P.D), it = F[Math.min(P.k, F.length - 1)]; if (!it) return;
    let k = F.findIndex((x) => x.ci === it.ci && x.ti === it.ti);
    if (k === P.k && P.cap.n < 4 && k > 0) { const prev = F[k - 1]; k = F.findIndex((x) => x.ci === prev.ci && x.ti === prev.ti); }
    seek(k); if (!P.playing) play();
  }
  /** One short spoken line outside the script: confirmations and recaps, so the driver never has to look. */
  function speakLine(who, text) {
    return new Promise((res) => {
      const ms = (text.split(/\s+/).length * 60000) / (WPM * 1.1) + 400;
      let done = false; const end = () => { if (!done) { done = true; clearTimeout(t); res(); } };
      const t = setTimeout(end, ms * 2 + 1500);
      const ok = A.S.audio && utter(text, who, () => {}, (e) => (e && e.error !== "interrupted" && e.error !== "canceled" ? setTimeout(end, ms) : end()));
      if (!ok) setTimeout(end, ms);
    });
  }
  async function confirmAloud(text) { const was = P.playing; pause(); P.wait = text; paint(); await speakLine("A", text); P.wait = ""; if (was) play(); else paint(); }
  /** A call or a navigation prompt takes the audio. When it gives it back: the start of the turn that was cut, after one line of bearings. */
  async function interrupted(reason = "Phone call") {
    if (!P.D) return;
    const was = P.playing; pause();
    const w = $(".dl-drive"); if (w) w.dataset.call = "true";
    P.wait = `${reason} · paused`; paint();
    await sleep(3500);
    if (w) w.dataset.call = "false";
    const D = P.D, F = flat(D), it = F[Math.min(P.k, F.length - 1)]; if (!D || !it) return;
    P.k = F.findIndex((x) => x.ci === it.ci && x.ti === it.ti);
    const ch = D.chapters[it.ci];
    P.wait = "Welcome back"; paint();
    await speakLine("B", `Welcome back. We were on ${ch.title.toLowerCase()}: ${String(ch.point || "").replace(/\.$/, "")}. Picking up where we were.`);
    P.wait = ""; if (was) play(); else paint();
  }
  function closeWalk() { $$(".dl-walk").forEach((w) => w.remove()); P.walk = false; P.drive = false; try { P.lock?.release(); } catch { /* gone */ } P.lock = null; }

  /* ---------- the mini player: keeps playing while you move round the app */
  const miniEl = document.createElement("div");
  miniEl.className = "dl-mini"; miniEl.hidden = true; miniEl.setAttribute("aria-label", "Now listening");
  document.body.appendChild(miniEl);
  setInterval(() => A && mini(), 400); // pages change without telling the player; keep the mini player honest
  function mini() {
    const D = P.D, show = !!D && (P.playing || P.recall || P.k > 0) && !(A?.S.view === "dialogue" && cur === D) && !P.walk;
    miniEl.hidden = !show; if (!show) return;
    const h = P.cap.who === "B" ? D.pair.B : D.pair.A;
    const key = [D.id, P.playing, P.recall ? 1 : 0, P.wait, h.name, flat(D)[Math.min(P.k, flat(D).length - 1)]?.ci].join("|");
    if (miniEl.dataset.key === key) return; miniEl.dataset.key = key;
    miniEl.innerHTML = `${cover(D, "mini")}<button class="dl-mini-t" type="button" data-dl-open="${D.id}"><b>${esc(D.title)}</b><small>${P.recall ? "Your turn: answer the recall question" : P.wait || `${esc(h.name)} · chapter ${(flat(D)[Math.min(P.k, flat(D).length - 1)]?.ci ?? 0) + 1} of ${D.chapters.length}`}</small></button><button class="dl-ib" type="button" data-dl-pp="${D.id}" aria-label="${P.playing ? "Pause" : "Play"}">${P.playing ? IC.pause : IC.play}</button><button class="dl-ib" type="button" data-dl-act="walk" aria-label="Walk mode">${IC.walk}</button><button class="dl-ib" type="button" data-dl-act="stop" aria-label="Stop listening">${IC.x}</button>`;
    miniEl.dataset.playing = String(P.playing);
  }

  /* ================================================================ wiring into Learn */
  function route(text) {
    const listening = A.S.view === "dialogue" || P.walk;
    if (/^make (a|another) (lumen|dialogue)/i.test(text.trim())) { pause(); closeWalk(); quickListen(/thesis/i.test(text) ? "Night flushing when the nights stay warm" : "Can a house in Dubai stay cool the old way?"); return true; }
    if (!listening) {
      if (/\bdriv/i.test(text)) { const D = DIALOGUES.find((x) => x.context === "drive" && !x.writing); if (D) openDrive(D); else { brief({ q: "Can a house in Dubai stay cool the old way?", format: "listen", context: "drive" }); make("now"); } return true; }
      return false;
    }
    focusCur();
    const t = text.trim().toLowerCase();
    if (/^(pause|stop|hold on|wait)\b/.test(t)) { pause(); return true; }
    if (/^(play|carry on|go on|continue|resume)\b/.test(t)) { if (/again/.test(t)) P.k = 0; play(); return true; }
    if (/mark (that|this)|save that/.test(t)) { mark(); if (P.drive) confirmAloud("Marked."); return true; }
    if (/say that again|^again\b/.test(t)) { sayAgain(); return true; }
    if (/next chapter|^skip(?! the question)/.test(t) && !P.recall) { nextCh(); return true; }
    if (/^(go back|back 15|say that again|repeat)/.test(t)) { back15(); return true; }
    if (/^slower/.test(t)) { setSpeed(P.speed > 1 ? 1 : 0.85); return true; }
    if (/^faster/.test(t)) { setSpeed(P.speed < 1 ? 1 : 1.25); return true; }
    if (P.recall) { answerRecall(text); return true; }
    ask(text); return true;
  }
  function onClick(e) {
    const el = e.target.closest("[data-dl-pp], [data-dl-play], [data-dl-walk], [data-dl-drive], [data-dl-open], [data-dl-act], [data-dl-ch], [data-dl-tab], [data-dl-live], [data-dl-k], .dl-s, a[href^='#dl-']");
    if (!el) return false;
    const d = el.dataset;
    if (e.target.closest("input, label")) return false;
    e.preventDefault();
    if (d.dlPp !== undefined) { const D = DIALOGUES.find((x) => x.id === d.dlPp); if (P.D === D && P.playing) pause(); else play(D); return true; }
    if (d.dlPlay) { const D = DIALOGUES.find((x) => x.id === d.dlPlay); if (D.writing && flat(D).length < 2) { D.listenNow = true; openDialogue(D.id); return true; } openDialogue(D.id, { autoplay: !(P.D === D && P.playing) }); return true; }
    if (d.dlWalk) { openWalk(DIALOGUES.find((x) => x.id === d.dlWalk)); return true; }
    if (d.dlDrive) { openDrive(DIALOGUES.find((x) => x.id === d.dlDrive)); return true; }
    if (d.dlCh !== undefined) { const D = el.closest("[data-d]") ? DIALOGUES.find((x) => x.id === el.closest("[data-d]").dataset.d) : cur; if (P.D !== D) { if (P.D) stop(); P.D = D; } const k = chStart(D, +d.dlCh); if (k >= 0) { seek(k); if (!P.playing) play(); } return true; }
    if (d.dlK !== undefined) { focusCur(); seek(+d.dlK); if (!P.playing) play(); return true; }
    if (el.classList.contains("dl-s")) { focusCur(); seek(+el.dataset.k); if (!P.playing) play(); return true; }
    if (d.dlTab) { txTab = d.dlTab; renderTx(); if (txTab === "tx" && P.D === cur) showCap(flat(cur)[Math.min(P.k, flat(cur).length - 1)], P.cap.n); return true; }
    if (d.dlLive) { pause(); A.startNew(d.dlLive, cur?.topic); return true; }
    if (d.dlOpen) { if (e.target.closest(".ll-acts")) return true; openDialogue(d.dlOpen); return true; }
    if (el.matches("a[href^='#dl-']")) { openDialogue(el.getAttribute("href").slice(4)); return true; }
    const act = d.dlAct;
    if (["back", "next", "mark"].includes(act)) focusCur();
    if (act === "back") back15(); else if (act === "next") nextCh(); else if (act === "mark") { mark(); if (P.drive) confirmAloud("Marked."); }
    else if (act === "again") sayAgain(); else if (act === "drive-go") driveGo(); else if (act === "call") interrupted();
    else if (act === "drive-edition") { const D = P.walk ? P.D : cur || P.D; if (P.D) stop(); listenFor(lumenOf(D), { q: D.q, topic: D.topic, goal: D.goal, context: "drive" }); }
    else if (act === "walk") (P.D?.context === "drive" ? openDrive : openWalk)(); else if (act === "walkx") { closeWalk(); paint(); } else if (act === "stop") stop();
    else if (act === "offline") { cur.offline = !cur.offline; renderHead(); if (cur.offline) A.toast("Saved for offline.", `${esc(cur.title)}: about ${Math.max(1, Math.round(lengthOf(cur) / 60))} MB. It plays without a connection, on a plane or underground.`); }
    if (el.matches("[data-dl-speed]")) speed();
    return true;
  }
  document.addEventListener("keydown", (e) => { const s = e.target.closest?.(".dl-s, .dl-bar i"); if (s && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); s.click(); } if (e.key === "Escape" && P.walk) { closeWalk(); paint(); }
    // In drive mode the keyboard stands in for the steering-wheel buttons.
    if (P.drive && $(".dl-drive .dl-d-live:not([hidden])") && !e.target.closest?.("input, textarea") && !e.repeat) {
      const k = e.key.toLowerCase();
      if (k === "arrowleft") sayAgain(); else if (k === "arrowright") nextCh(); else if (k === "p" || k === "k") (P.playing ? pause() : play());
      else if (k === "m") { mark(); confirmAloud("Marked."); } else return;
      e.preventDefault();
    } });

  window.LearnExt = {
    dialogue: info,
    cover: (id) => { const D = DIALOGUES.find((x) => x.id === id); return D ? cover(D) : ""; },
    carIcon: IC.car,
    openDialogue: (id) => openDialogue(id),
    listenFor,
    quickListen,
    route,
    onClick,
    onHold: () => { if (A.S.view === "dialogue" || P.walk) pause(); },
    pause: () => { pause(); closeWalk(); },
    init(api) {
      A = api;
      const ph0 = A.LD.input.placeholder;
      new MutationObserver(() => { const v = A.ld.dataset.view; if (v !== "studio") A.LD.input.placeholder = v === "dialogue" ? "Ask the hosts, or say: pause, mark that, next chapter" : ph0; paint(); }).observe(A.ld, { attributes: true, attributeFilter: ["data-view"] });
      const bar = $(".ll-proto");
      if (bar) {
        const b = $("b", bar); if (b) b.textContent = "Prototype · slice 2";
        const h = $(".hint", bar); if (h) h.textContent = "One Lumen, three formats. On Home, pick Watch, Listen or Read in the bar and press Make a Lumen; Tailor… opens the whole brief. Every card shows its formats (+ Listen makes a missing one), and every Lumen page has the same Watch · Listen · Read switcher. Lumens filters by format and groups by date or topic; live sessions are one of its filters. Try “Cooling without machines”: Listen, its drive edition, and Read.";
      }
    },
  };
})();
