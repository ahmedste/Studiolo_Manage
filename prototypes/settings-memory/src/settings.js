/* Settings and learner memory (prototype).
   - Settings has five tabs: Profile, Learning (what you tell Loci), Memory (what Loci noticed), Usage, Privacy & data.
   - Memory follows the map: You, then areas, topics and sub-topics. Each place can hold a card with fixed slots
     (where you are, why, working on, you know, to revisit, how you like it here, your words), plus facts: seen here,
     and the status and My Focus you set. Every entry has a basis: You said, You did, You showed, or Suggested.
   - "What Loci knows here" builds the exact slice the AI would read at a place (spec §6), with its size in tokens.
     "Try it" asks Claude (the page's `sample` capability) to plan the same Lumen with and without it.
   - In Loci, the same card opens from the topic panel, a reply shows "Loci will remember", and a Lumen offer shows
     "Made for you". The shell, map and panel are the app's own DOM and CSS, captured read-only from studiolo's
     /dev/specimens (see ../live-lumens/capture/capture.cjs). Spec:
     docs/superpowers/specs/2026-10-24-learner-memory-and-settings-design.md */
(() => {
  "use strict";
  const DATA = JSON.parse(document.getElementById("vx-data").textContent);
  const root = document.getElementById("vx-app");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  DATA.htmlClass.split(/\s+/).filter(Boolean).forEach((c) => document.documentElement.classList.add(c));

  /* ================================================================ the sample learner (examples, not real data) */
  const PLACES = [
    { id: "you", name: "You", parent: null },
    { id: "history", name: "History & Theory", parent: "you" },
    { id: "islamic", name: "Islamic architecture", parent: "history", st: "Learned" },
    { id: "plantypes", name: "Plan types & ritual", parent: "islamic", st: "Learning" },
    { id: "culture", name: "Culture & Context", parent: "you" },
    { id: "climate", name: "Climate-responsive design", parent: "culture", st: "Learning", focus: true },
    { id: "envelope", name: "Envelope & Facade", parent: "you" },
    { id: "facades", name: "Facade systems", parent: "envelope", st: "Learning" },
    { id: "precast", name: "Precast", parent: "facades", st: "Learning", focus: true },
    { id: "structures", name: "Structures", parent: "you" },
    { id: "concrete", name: "Concrete & precast", parent: "structures", st: "Not started" },
    { id: "law", name: "Construction Law", parent: "you" },
  ];
  const P = Object.fromEntries(PLACES.map((p) => [p.id, p]));
  const RELATED = [["precast", "concrete"], ["climate", "islamic"]];
  const kids = (id) => PLACES.filter((p) => p.parent === id);
  const chain = (id) => { const out = []; let p = P[id]; while (p && p.parent) { p = P[p.parent]; if (p && p.id !== "you") out.unshift(p); } return out; };
  const pathText = (id) => id === "you" ? "Everywhere" : ["Loci", ...chain(id).map((p) => p.name)].join(" › ");
  const related = (id) => RELATED.filter((r) => r.includes(id)).map((r) => r[0] === id ? r[1] : r[0]);

  const SLOTS = [
    { k: "level", name: "Where you are", you: "Experience", one: true },
    { k: "why", name: "Why you're learning it", you: "Goals", one: true },
    { k: "working_on", name: "Working on", you: "Working on" },
    { k: "known", name: "You know", you: "You know" },
    { k: "revisit", name: "To revisit", you: "To revisit", hint: "Only from checks you answered" },
    { k: "prefer", name: "How you like it here", you: "How you like to learn", hint: "Includes what clicked" },
    { k: "words", name: "Your words", you: "Your words" },
  ];
  const BASIS = { said: "You said", did: "You did", showed: "You showed", agreed: "You agreed", suggested: "Suggested" };

  let uid = 0;
  const e = (place, slot, text, basis, date, why) => ({ id: "e" + ++uid, place, slot, text, basis, date, why: [].concat(why) });
  const ENTRIES = [
    e("you", "level", "Architect, 8 years in practice, mostly religious and civic buildings in the Gulf", "said", "16 Oct", "You picked Architecture and typed this when you joined (16 Oct)."),
    e("you", "why", "Become the practice's facade lead", "said", "18 Oct", "Map chat, 18 Oct: “I want to become the facade lead at work.”"),
    e("you", "working_on", "A prayer hall for about 600 in Dubai: envelope and daylight", "said", "18 Oct", "Map chat, 18 Oct."),
    e("you", "prefer", "A worked example from a real building, then the principle", "agreed", "20 Oct", ["Loci suggested this on 20 Oct after you tapped From my field four times in Live sessions.", "You pressed Keep."]),
    e("you", "words", "“Qibla wall”, not “prayer wall”", "said", "18 Oct", "Map chat, 18 Oct: you corrected Loci."),
    e("culture", "level", "Basics", "said", "19 Oct", "You answered “How well do you know Culture & Context?” with Basics (19 Oct)."),
    e("climate", "level", "Basics", "said", "16 Oct", "Your answer when you joined: “I know the basics” (16 Oct)."),
    e("climate", "why", "For work: cooling the prayer hall's courtyard", "said", "18 Oct", ["When you joined: “For my work”.", "The project line is from the map chat, 18 Oct."]),
    e("climate", "known", "The stack effect", "showed", "21 Oct", ["Check yourself in “Cooling without machines” (Read): right first time, 21 Oct.", "Right again in Live on 24 Oct, three days later."]),
    e("climate", "known", "How a malqaf catches the wind", "showed", "19 Oct", "The quiz at the end of “How a malqaf moves air”: right first time, 19 Oct."),
    e("climate", "revisit", "Evaporative cooling helps little in humid air", "showed", "22 Oct", "Check yourself, 22 Oct: you chose “Humid coast in August” as the best case for the wet jar."),
    e("climate", "prefer", "Sections before photos", "said", "20 Oct", "This topic's chat, 20 Oct: “Show me a section first, photos after.”"),
    e("climate", "prefer", "What clicked: “like blowing on hot soup”, the malqaf as breath over water", "said", "19 Oct", "You pressed This clicked in a Live session on 19 Oct. Kept word for word."),
    e("islamic", "level", "Regular", "said", "18 Oct", "Map chat, 18 Oct: “I've designed two mosques.”"),
    e("islamic", "working_on", "The mihrab and the light on the qibla wall", "said", "20 Oct", "This topic's chat, 20 Oct."),
    e("islamic", "known", "Hypostyle and four-iwan plans", "showed", "23 Oct", "Two checks right, 20 and 23 Oct, three days apart."),
    e("envelope", "level", "Regular", "said", "17 Oct", "You answered “How well do you know Envelope & Facade?” with I use it regularly (17 Oct)."),
    e("envelope", "why", "For work: the prayer hall's envelope", "said", "17 Oct", "Envelope & Facade's chat, 17 Oct."),
    e("facades", "level", "Regular", "showed", "21 Oct", "Four checks right across “Unitised or stick?” and “Rainscreen basics”, 17–21 Oct."),
    e("precast", "level", "Basics", "said", "21 Oct", "Precast's chat, 21 Oct: “I only know the basics of precast.”"),
    e("precast", "working_on", "The mihrab panel joint; coordinating with the precaster", "said", "21 Oct", "Precast's chat, 21 Oct."),
    e("precast", "known", "Panel joints", "showed", "22 Oct", "Check yourself in “Precast joints”: right first time, 22 Oct."),
    e("precast", "known", "Tolerances", "showed", "22 Oct", "Check yourself in “Precast joints”: right first time, 22 Oct."),
    e("precast", "revisit", "Thermal bridging at panel fixings", "showed", "23 Oct", "Check yourself in “Why precast cracks”, 23 Oct: you chose the joint sealant as the main heat path."),
    e("precast", "words", "“Reveal”, not “return”", "said", "22 Oct", "Precast's chat, 22 Oct: you corrected Loci."),
    e("concrete", "level", "Basics", "said", "22 Oct", "You answered “How well do you know Concrete & precast?” with Basics (22 Oct)."),
  ];
  const SEEN = {
    climate: [["How a malqaf moves air", "Watch", "finished"], ["Cooling without machines", "Listen", "chapter 2 of 4"], ["Cooling without machines", "Read", "read"]],
    islamic: [["The four-iwan plan", "Watch", "finished"]],
    plantypes: [["Why the qibla turns the plan", "Watch", "finished"]],
    precast: [["Precast joints", "Watch", "finished"], ["Why precast cracks", "Read", "half read"]],
    structures: [["Load paths, simply", "Watch", "finished"], ["What a transfer beam does", "Watch", "finished"], ["Why columns buckle", "Watch", "stopped at slide 3"]],
  };
  const SUGGESTIONS = [
    { id: "s1", place: "structures", slot: "level", text: "New: start simpler in Structures", keep: "New", why: ["You tapped Simpler three times in Structures Lumens (Load paths, Transfer beams, Columns).", "You stopped “Why columns buckle” at slide 3."], q: "You often ask for it simpler in Structures. Start simpler there?" },
    { id: "s2", place: "you", slot: "prefer", text: "Sections and diagrams before photos, everywhere", why: ["You asked for sections first in Climate-responsive design (20 Oct).", "And for Precast's joints in section (22 Oct)."], q: "You like sections and diagrams first in two areas. Make that your default?" },
    { id: "s3", place: "islamic", slot: "prefer", text: "Plans with the qibla direction marked", why: ["You asked for it twice in this topic's chat (20 and 23 Oct)."], q: "Mark the qibla on every plan here?" },
  ];

  /* ================================================================ state */
  const S = {
    view: "settings", tab: "memory", sel: "climate", memoryOn: true,
    profile: { name: "Layla Haddad", tz: "Asia/Dubai", field: "architecture", own: "Architect, mostly religious and civic buildings", years: "8", lang: "English", spell: "British", units: "Metric", theme: "system" },
    prefs: { start: "Watch", length: "Short", depth: "Balanced", field: true, checks: "Sometimes", voice: "Calm", speed: "1×" },
    instr: {
      about: "Architect, 8 years, mostly religious and civic buildings in the Gulf. I think in sections and details.",
      teaching: "Diagrams before text. Define a term once, then use it. Keep it short; I'll ask for more.",
      now: "A prayer hall for about 600 in Dubai: a precast envelope, and daylight through the qibla wall.",
    },
    notes: {
      precast: "I'm the project architect, not the engineer: focus on interfaces and what to ask the precaster.",
      islamic: "Prefer named buildings and primary sources over generalities.",
    },
    entries: ENTRIES, sugs: SUGGESTIONS.slice(), tombs: [], hiddenSeen: new Set(), open: { why: null, edit: null, add: null, note: null },
    pv: { place: "precast", surface: "lumen" }, tryQ: "How do I stop heat getting in at the panel fixings?", tryOut: null, trying: false,
    confirm: null, analytics: true, sheet: false, thread: { remembered: true, opened: null, mf: false },
  };
  let sample = null;
  (async () => { await null; try { sample = window.claude ? await window.claude.use("sample") : null; } catch { sample = null; } if (S.view === "settings" && S.tab === "memory") render(); })();

  const entriesAt = (id, slot) => S.entries.filter((x) => x.place === id && (!slot || x.slot === slot));
  const hasCard = (id) => entriesAt(id).length > 0;
  const seenAt = (id) => (SEEN[id] || []).map((s, i) => ({ k: id + ":" + i, t: s[0], f: s[1], st: s[2] }));
  const visibleSeen = (id) => seenAt(id).filter((s) => !S.hiddenSeen.has(s.k));
  const levelOf = (id) => entriesAt(id, "level")[0];
  const basisWord = (b) => ({ said: "you said", did: "you did", showed: "you showed", agreed: "you agreed" })[b] || b;

  /* ================================================================ the slice (spec §6): what Loci reads at a place */
  const cut = (t, n) => (t.length > n ? t.slice(0, n - 1).trimEnd() + "…" : t);
  const short = (t) => t.replace(/^For work: /, "");
  function headline(id) {
    const L = levelOf(id), W = entriesAt(id, "why")[0], K = entriesAt(id, "known").length, R = entriesAt(id, "revisit").length;
    const bits = [];
    if (L) bits.push(L.text.toLowerCase() + ` (${basisWord(L.basis)})`);
    if (W) bits.push(/^For work/.test(W.text) ? "for work" : "why: " + cut(W.text, 40));
    if (K) bits.push(`knows ${K}`);
    if (R) bits.push(`${R} to revisit`);
    return bits.join(" · ");
  }
  /** The slice as [kind, text] lines; kinds colour the preview. */
  function slice(id, surface, memoryOn) {
    const L = [];
    const pr = S.profile, pf = S.prefs;
    L.push(["k", "you:", `${cut(pr.own || "", 60)}${pr.years ? `, ${pr.years} years in practice` : ""}. ${pr.spell} spelling, ${pr.units.toLowerCase()}.`]);
    L.push(["k", "prefers:", `starts with ${pf.start}; ${pf.length.toLowerCase()}; ${pf.depth.toLowerCase()} depth; ${pf.field ? "examples from their field" : "no field examples"}; quick checks ${pf.checks.toLowerCase()}.`]);
    if (S.instr.teaching.trim()) L.push(["k", "taught (their words):", `“${cut(S.instr.teaching.trim(), 160)}”`]);
    if (S.instr.about.trim()) L.push(["k", "about (their words):", `“${cut(S.instr.about.trim(), 140)}”`]);
    if (S.instr.now.trim() && (surface !== "chat" || id === "you")) L.push(["k", "now (their words):", `“${cut(S.instr.now.trim(), 120)}”`]);
    if (memoryOn) {
      const you = ["why", "working_on", "prefer"].flatMap((s) => entriesAt("you", s).map((x) => cut(x.text, 70) + ` (${basisWord(x.basis)})`));
      if (you.length) L.push(["k", "noted:", you.join(" · ")]);
    }
    if (id === "you") {
      if (memoryOn) PLACES.filter((p) => p.parent === "you" && (hasCard(p.id) || kids(p.id).some((c) => hasCard(c.id)))).forEach((a) => L.push(["k", "area:", `${a.name}${hasCard(a.id) ? " · " + headline(a.id) : ""}`]));
      return L;
    }
    const pl = P[id];
    chain(id).forEach((a) => {
      const bits = [a.name];
      if (memoryOn && hasCard(a.id)) bits.push(headline(a.id));
      if (S.notes[a.id]) bits.push(`note: “${cut(S.notes[a.id], 70)}”`);
      if (bits.length > 1) L.push(["k", "path:", bits.join(" · ")]);
    });
    const facts = [pl.st ? `status ${pl.st}` : null, pl.focus ? "in My Focus" : null].filter(Boolean).join(", ");
    L.push(["k", "here:", `${pl.name}${memoryOn && hasCard(id) ? " · " + headline(id) : ""}${facts ? ` · ${facts} (set by the learner)` : ""}`]);
    if (memoryOn) {
      const W = entriesAt(id, "why")[0]; if (W) L.push(["i", "  why:", cut(short(W.text), 90)]);
      [["working_on", "working on:"], ["known", "knows:"], ["revisit", "revisit:"], ["prefer", "prefers here:"], ["words", "words:"]].forEach(([s, label]) => {
        const xs = entriesAt(id, s); if (xs.length) L.push(["i", "  " + label, xs.map((x) => cut(x.text, 80) + (s === "known" || s === "revisit" ? ` (${basisWord(x.basis)})` : "")).join("; ")]);
      });
    }
    if (S.notes[id]) L.push(["i", "  note from the learner:", `“${cut(S.notes[id], 120)}”`]);
    if (surface !== "chat") {
      const sn = visibleSeen(id); if (sn.length) L.push(["k", "seen:", sn.slice(0, 5).map((s) => `“${s.t}” (${s.f}, ${s.st})`).join("; ")]);
      if (memoryOn) related(id).filter(hasCard).slice(0, 3).forEach((r) => L.push(["k", "related:", `${P[r].name} · ${headline(r)}`]));
    } else {
      kids(id).filter((c) => memoryOn && hasCard(c.id)).forEach((c) => L.push(["k", "below:", `${c.name} · ${headline(c.id)}`]));
    }
    if (!memoryOn) L.push(["c", "", "(memory is off: profile, preferences, instructions and on-screen facts only)"]);
    return L;
  }
  const sliceText = (id, surface, on) => `<learner>\n${slice(id, surface, on).map(([, a, b]) => (a ? a + " " : "") + b).join("\n")}\n</learner>`;
  const tokens = (t) => Math.ceil(t.length / 4);
  const sliceHTML = (id, surface, on) => `<span class="c">&lt;learner&gt;</span>\n${slice(id, surface, on).map(([k, a, b]) => k === "c" ? `<span class="c">${esc(b)}</span>` : `<span class="k">${esc(a)}</span> ${esc(b)}`).join("\n")}\n<span class="c">&lt;/learner&gt;</span>`;

  /* ================================================================ pieces */
  const seg = (group, key, options, cur, label) => `<span class="sm-seg" role="group" aria-label="${esc(label)}">${options.map((o) => `<button type="button" data-seg="${group}" data-key="${key}" data-val="${esc(o)}" aria-pressed="${o === cur}">${esc(o)}</button>`).join("")}</span>`;
  const sw = (id, on, label) => `<button type="button" class="sm-switch" role="switch" id="${id}" aria-checked="${on}" data-switch="${id}"><i aria-hidden="true"></i>${esc(label)}</button>`;
  const pill = (b) => `<span class="sm-basis" data-b="${b === "agreed" ? "said" : b}">${esc(BASIS[b] || b)}</span>`;
  const btn = (label, attrs, kind = "") => `<button type="button" class="button${kind ? " button-" + kind : ""}" ${attrs}>${label}</button>`;

  function header(sub) {
    const TABS = [["profile", "Profile"], ["learning", "Learning"], ["memory", "Memory"], ["usage", "Usage"], ["privacy", "Privacy & data"]];
    return `<header class="destination-header"><div class="destination-crumb"><strong>Settings</strong><i aria-hidden="true">/</i><span>${esc(sub)}</span></div><nav aria-label="Settings sections" class="destination-tabs">${TABS.map(([k, l]) => `<a class="destination-tab" href="#${k}" data-tab="${k}"${S.tab === k ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav></header>`;
  }

  /* ---------- Profile */
  function profileTab() {
    const pr = S.profile;
    const zones = ["UTC", "Europe/London", "Europe/Paris", "Europe/Istanbul", "Africa/Cairo", "Asia/Riyadh", "Asia/Dubai", "Asia/Karachi", "Asia/Kolkata", "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney", "America/New_York", "America/Chicago", "America/Los_Angeles"];
    const fields = [["law", "Law"], ["architecture", "Architecture"], ["engineering", "Engineering"], ["business", "Business"], ["medicine", "Medicine"], ["other", "Something else"]];
    return `<div class="sm-body"><div class="sm-sec" style="max-width:680px">
      <div><h1 class="sm-h1">Profile</h1><p class="sm-lead">Who you are, for this private account. Loci reads what you do and how you spell everywhere; your name only greets you.</p></div>
      <div class="sm-grid2">
        <label class="sm-field"><span>Display name</span><input class="sm-input" id="pf-name" data-pf="name" value="${esc(pr.name)}" maxlength="100"></label>
        <label class="sm-field"><span>Time zone</span><select class="sm-select" id="pf-tz" data-pf="tz">${zones.map((z) => `<option${z === pr.tz ? " selected" : ""}>${z}</option>`).join("")}</select></label>
      </div>
      <div class="sm-field"><span>What you do</span>${seg("pf", "field", fields.map((f) => f[1]), fields.find((f) => f[0] === pr.field)?.[1], "Field")}
        <small>From your answers when you joined. Changing it here changes it everywhere.</small></div>
      <div class="sm-grid2">
        <label class="sm-field"><span>In your words</span><input class="sm-input" id="pf-own" data-pf="own" value="${esc(pr.own)}" maxlength="120"></label>
        <label class="sm-field"><span>Years in practice <small>(optional)</small></span><input class="sm-input" id="pf-years" data-pf="years" value="${esc(pr.years)}" inputmode="numeric" maxlength="2"></label>
      </div>
      <div class="sm-grid2">
        <label class="sm-field"><span>Language of lessons</span><select class="sm-select" id="pf-lang" data-pf="lang"><option selected>English</option><option disabled>Arabic (later)</option><option disabled>French (later)</option></select></label>
        <div class="sm-field"><span>Spelling and units</span><div class="sm-row">${seg("pf", "spell", ["British", "American"], pr.spell, "Spelling")}${seg("pf", "units", ["Metric", "Imperial"], pr.units, "Units")}</div></div>
      </div>
      <div class="sm-field"><span>Appearance</span>${seg("pf", "theme", ["System", "Light", "Dark"], pr.theme[0].toUpperCase() + pr.theme.slice(1), "Appearance")}<small>The same switch as the one in the sidebar.</small></div>
      <div class="sm-row">${btn("Save profile", 'data-act="save-profile"')}<span class="sm-note">Saved with a version check, as Profile is today.</span></div>
    </div></div>`;
  }

  /* ---------- Learning (what you tell Loci) */
  function learningTab() {
    const pf = S.prefs;
    const area = (k, label, ph) => `<label class="sm-field"><span>${label}</span><textarea class="sm-area" id="in-${k}" data-instr="${k}" maxlength="1000" placeholder="${esc(ph)}">${esc(S.instr[k])}</textarea><small><span class="sm-count" data-count="${k}">${S.instr[k].length} / 1,000</span> · Loci reads this everywhere</small></label>`;
    const notes = Object.entries(S.notes).map(([id, t]) => S.open.note === id
      ? `<div class="sm-notecard"><div class="sm-path">${esc(pathText(id))} › <b>${esc(P[id].name)}</b></div><textarea class="sm-area" id="note-${id}" data-note-draft="${id}">${esc(t)}</textarea><div class="sm-row">${btn("Save", `data-act="note-save" data-id="${id}"`)}${btn("Cancel", 'data-act="note-cancel"', "quiet")}</div></div>`
      : `<div class="sm-notecard"><div class="sm-path">${esc(pathText(id))} › <b>${esc(P[id].name)}</b> · applies here and below</div><p>${esc(t)}</p><div class="sm-row"><button class="sm-act" type="button" data-act="note-edit" data-id="${id}">Edit</button><button class="sm-act" type="button" data-act="note-del" data-id="${id}" data-danger>Delete</button><button class="sm-act" type="button" data-act="open-loci" data-id="${id}">Open in Loci</button></div></div>`).join("");
    return `<div class="sm-body"><div class="sm-cols"><div class="sm-sec" style="gap:0">
      <div class="sm-sec"><div><h1 class="sm-h1">Learning</h1><p class="sm-lead">What you tell Loci. It always wins over anything Loci has noticed.</p></div></div>
      <div class="sm-sec"><h2 class="sm-h2">Learning preferences</h2>
        <div class="sm-field"><span>Start with</span>${seg("pr", "start", ["Watch", "Listen", "Read"], pf.start, "Start with")}<small>Make a Lumen starts here. Live is always one tap away.</small></div>
        <div class="sm-grid2">
          <div class="sm-field"><span>Length</span>${seg("pr", "length", ["Short", "Standard", "Long"], pf.length, "Length")}</div>
          <div class="sm-field"><span>Depth</span>${seg("pr", "depth", ["Gentle", "Balanced", "Rigorous"], pf.depth, "Depth")}</div>
          <div class="sm-field"><span>Quick checks</span>${seg("pr", "checks", ["Often", "Sometimes", "Never"], pf.checks, "Quick checks")}<small>Checks are how Loci learns what you know. Never means it only goes by what you tell it.</small></div>
          <div class="sm-field"><span>Examples</span>${sw("sw-field", pf.field, "Examples from my field")}</div>
          <label class="sm-field"><span>Narrator voice</span><select class="sm-select" id="pr-voice" data-prsel="voice">${["Calm", "Bright", "Warm"].map((v) => `<option${v === pf.voice ? " selected" : ""}>${v}</option>`).join("")}</select></label>
          <div class="sm-field"><span>Narrator speed</span>${seg("pr", "speed", ["0.9×", "1×", "1.15×", "1.3×"], pf.speed, "Narrator speed")}</div>
        </div>
      </div>
      <div class="sm-sec"><h2 class="sm-h2">Instructions for Loci</h2><p class="sm-note">In your own words. Loci follows these in every Lumen, chat and Live session.</p>
        ${area("about", "About me", "What you do, what you've done, how you think")}
        ${area("teaching", "How I like to be taught", "Pace, examples, what to skip, what annoys you")}
        ${area("now", "Right now I'm working on…", "A project, an exam, a decision")}
      </div>
      <div class="sm-sec"><h2 class="sm-h2">Notes on topics</h2><p class="sm-note">A note on a topic applies there and to everything under it. Add one from any topic's menu in Loci: <b>Tell Loci about this topic…</b></p>
        <div class="sm-notes">${notes || '<p class="sm-none">No notes on topics yet.</p>'}</div>
      </div>
    </div>
    <aside class="sm-aside" aria-label="What Loci reads everywhere"><h3 class="sm-h3">Loci reads this everywhere</h3><pre class="sm-slice" id="aside-slice">${sliceHTML("you", "chat", S.memoryOn)}</pre><p class="sm-note">This is the start of every slice Loci reads. It updates as you type. See the rest in <a href="#memory" data-tab="memory">Memory</a>.</p></aside>
    </div></div>`;
  }

  /* ---------- Memory: the card */
  function entryRow(x) {
    const editing = S.open.edit === x.id, why = S.open.why === x.id;
    const acts = `<span class="sm-acts"><button class="sm-act" type="button" data-act="why" data-id="${x.id}" aria-expanded="${why}">Why?</button>${x.slot === "revisit" ? `<button class="sm-act" type="button" data-act="understood" data-id="${x.id}">Understood</button>` : `<button class="sm-act" type="button" data-act="edit" data-id="${x.id}">Edit</button>`}<button class="sm-act" type="button" data-act="del" data-id="${x.id}" data-danger>Delete</button></span>`;
    return `<div class="sm-entry">${editing
      ? `<div class="sm-edit"><input class="sm-input" id="edit-${x.id}" data-edit-draft value="${esc(x.text)}" maxlength="160">${btn("Save", `data-act="edit-save" data-id="${x.id}"`)}${btn("Cancel", 'data-act="edit-cancel"', "quiet")}</div>`
      : `<div><div class="sm-entry-text">${esc(x.text)}</div><div class="sm-entry-meta">${pill(x.basis)}<span>${esc(x.date)}</span>${x.edited ? "<span>edited by you</span>" : ""}</div></div>${acts}`}
      ${why ? `<div class="sm-why">${x.why.map((w) => `<span>${esc(w)}</span>`).join("")}${x.edited ? "<span><b>You edited this.</b> Loci won't change it from anything older than your edit.</span>" : ""}</div>` : ""}</div>`;
  }
  function cardHTML(id, { inSheet } = {}) {
    const pl = P[id], isYou = id === "you";
    const head = `<div class="sm-card-head"><div class="sm-path">${esc(isYou ? "Applies everywhere" : pathText(id))}</div>
      <div class="sm-row"><h2 class="sm-h2">${esc(isYou ? "You" : pl.name)}</h2><span class="sm-row">${hasCard(id) ? `<button class="sm-act" type="button" data-act="forget" data-id="${id}" data-danger>Forget this place</button>` : ""}${!inSheet && id === "climate" ? `<button class="sm-act" type="button" data-act="open-loci" data-id="${id}">Open in Loci</button>` : ""}</span></div>
      <p class="sm-headline"${hasCard(id) ? "" : " data-empty"}>${hasCard(id) ? esc(headline(id).replace(/^./, (c) => c.toUpperCase())) : isYou ? "Nothing yet." : "Nothing noted here yet. This place reads from the places above it."}</p></div>`;
    const off = S.memoryOn ? "" : `<div class="sm-off-note">Memory is off. Loci isn't using or updating this card. You can still read, edit and delete it.</div>`;
    const note = S.notes[id] ? `<div class="sm-slot"><div class="sm-slot-name">Your note for Loci<small>An instruction: it wins</small></div><div class="sm-entries"><div class="sm-entry"><div><div class="sm-entry-text">${esc(S.notes[id])}</div><div class="sm-entry-meta"><span class="sm-basis" data-b="note">Instruction</span></div></div><span class="sm-acts"><button class="sm-act" type="button" data-act="goto-learning">Edit in Learning</button></span></div></div></div>` : "";
    const slots = SLOTS.map((s) => {
      const xs = entriesAt(id, s.k);
      const adding = S.open.add === id + ":" + s.k;
      const add = s.k === "revisit" ? "" : adding
        ? `<div class="sm-edit"><input class="sm-input" id="add-${id}-${s.k}" data-add-draft placeholder="${esc(s.k === "level" ? "New, Basics, Regular or Deep" : "In a few words")}" maxlength="160">${btn("Add", `data-act="add-save" data-id="${id}" data-slot="${s.k}"`)}${btn("Cancel", 'data-act="add-cancel"', "quiet")}</div>`
        : (s.one && xs.length) ? "" : `<button class="sm-add" type="button" data-act="add" data-id="${id}" data-slot="${s.k}">+ Add</button>`;
      return `<div class="sm-slot"><div class="sm-slot-name">${esc(isYou ? s.you : s.name)}${s.hint ? `<small>${esc(s.hint)}</small>` : ""}</div><div class="sm-entries">${xs.map(entryRow).join("") || '<span class="sm-none">—</span>'}${add}</div></div>`;
    }).join("");
    const sn = seenAt(id);
    const seen = isYou ? "" : `<div class="sm-slot"><div class="sm-slot-name">Seen here<small>Facts, not judgements</small></div><div class="sm-entries sm-seen">${sn.map((s) => `<div${S.hiddenSeen.has(s.k) ? " data-hidden" : ""}><b>${esc(s.t)}</b><span>${esc(s.f)} · ${esc(s.st)}</span><button class="sm-act" type="button" data-act="seen" data-k="${s.k}">${S.hiddenSeen.has(s.k) ? "Show to Loci" : "Hide from Loci"}</button></div>`).join("") || '<span class="sm-none">Nothing seen here yet.</span>'}</div></div>`;
    const facts = !isYou && (pl.st || pl.focus) ? `<div class="sm-slot"><div class="sm-slot-name">From your map<small>You set these; Loci never changes them</small></div><div class="sm-entries"><span class="sm-entry-text">${esc([pl.st, pl.focus ? "In My Focus" : null].filter(Boolean).join(" · "))}</span></div></div>` : "";
    const tombs = S.tombs.filter((t) => t.place === id).map((t) => `<div class="sm-tomb">Deleted “${esc(cut(t.text, 50))}”. Loci won't bring it back from anything that happened before now.<button class="sm-act" type="button" data-act="undo-del" data-id="${t.id}">Undo</button></div>`).join("");
    return `${head}${off}<div class="sm-slots">${note}${slots}${seen}${facts}</div>${tombs}`;
  }

  /* ---------- Memory tab */
  function treeHTML() {
    const node = (p, d) => {
      const n = entriesAt(p.id).length, empty = !n && !seenAt(p.id).length && !S.notes[p.id];
      return `<button class="sm-node" type="button" data-act="sel" data-id="${p.id}" style="--d:${d}" aria-current="${S.sel === p.id}"${n ? " data-has" : ""}${empty ? " data-empty" : ""}${p.id === "you" ? " data-you" : ""}><span class="dot" aria-hidden="true"></span>${esc(p.name)}<span class="n">${n || ""}</span></button>` + kids(p.id).map((c) => node(c, d + 1)).join("");
    };
    const places = PLACES.filter((p) => hasCard(p.id)).length;
    return `<div class="sm-tree"><div class="sm-tree-h"><h3 class="sm-h3">Your memory map</h3><span class="sm-count">${places} places</span></div>${node(P.you, 0)}</div>`;
  }
  function memoryTab() {
    const sugs = S.memoryOn && S.sugs.length ? `<div class="sm-sec"><h2 class="sm-h2">Waiting for you</h2><p class="sm-note">Loci thinks these are true, but it won't use them until you say so. At most five wait at a time.</p><div class="sm-sugs">${S.sugs.map((g) => `<div class="sm-sug"><div class="sm-sug-top"><b>${esc(g.text)}</b>${pill("suggested")}<span class="sm-path">${esc(g.place === "you" ? "You, everywhere" : pathText(g.place) + " › " + P[g.place].name)}</span></div><p class="sm-sug-why">${g.why.map(esc).join(" ")}</p><div class="sm-row">${btn("Keep", `data-act="sug-keep" data-id="${g.id}"`)}${btn("Dismiss", `data-act="sug-dismiss" data-id="${g.id}"`, "quiet")}</div></div>`).join("")}</div></div>` : "";
    const pvPlaces = PLACES.map((p) => `<option value="${p.id}"${p.id === S.pv.place ? " selected" : ""}>${esc(p.id === "you" ? "You (the map chat)" : "  ".repeat(chain(p.id).length) + p.name)}</option>`).join("");
    const surfaces = S.pv.place === "you" ? ["Map chat"] : ["Topic chat", "Make a Lumen", "Live session"];
    const sKey = { "Map chat": "chat", "Topic chat": "chat", "Make a Lumen": "lumen", "Live session": "live" };
    const curS = surfaces.find((s) => sKey[s] === S.pv.surface) || surfaces[0];
    const text = sliceText(S.pv.place, sKey[curS], S.memoryOn), tk = tokens(text), budget = 700;
    const out = S.tryOut;
    const col = (o, withMem) => `<div class="sm-try-col"${withMem ? " data-with" : ""}><h4>${withMem ? "With what Loci knows here" : "Knowing nothing about you"}</h4>${o ? `<div class="t">${esc(o.title)}</div><div class="p">${esc(o.pitch)}</div><ol>${(o.slides || []).slice(0, 4).map((s) => `<li>${esc(s)}</li>`).join("")}</ol><p class="o">“${esc(o.opening)}”</p>` : `<div class="p">${S.trying ? "Writing…" : "—"}</div>`}</div>`;
    return `<div class="sm-body">
      <div class="sm-sec"><div><h1 class="sm-h1">Memory</h1><p class="sm-lead">What Loci noticed about how you learn, kept on the same map as your topics. Everything Loci reads about you is here, with its reason.</p></div>
        <div class="sm-toggle"${S.memoryOn ? "" : " data-off"}>${sw("sw-mem", S.memoryOn, S.memoryOn ? "Memory is on" : "Memory is off")}<p>Loci notes what you know and how you like to learn, and uses it to pitch Lumens and replies. Turning it off stops new notes <b>and</b> stops using the ones you have. Nothing is deleted: you can still read, edit or delete them here. Your Profile, Learning preferences and Instructions always apply.</p></div>
      </div>
      ${sugs}
      <div class="sm-sec"><h2 class="sm-h2">Your memory map</h2><p class="sm-note">A card for each place where Loci knows something. A place with no card reads from the places above it: a new sub-topic under Precast starts at basics without asking.</p>
        <div class="sm-mem"${S.memoryOn ? "" : " data-off"}>${treeHTML()}<div class="sm-card" id="card">${cardHTML(S.sel)}</div></div>
      </div>
      <div class="sm-sec"><h2 class="sm-h2">What Loci knows here</h2><p class="sm-note">The exact text Loci reads when you're at a place. It's compiled when something changes, so reading it costs no extra AI call.</p>
        <div class="sm-pv"><div class="sm-pv-ctl">
          <label class="sm-field"><span>Place</span><select class="sm-select" id="pv-place" data-pv="place">${pvPlaces}</select></label>
          <div class="sm-field"><span>When Loci is…</span><span class="sm-seg" role="group" aria-label="Surface">${surfaces.map((s) => `<button type="button" data-act="pv-surface" data-val="${sKey[s]}" aria-pressed="${s === curS}">${s}</button>`).join("")}</span></div>
          <div class="sm-meter"><div class="sm-meter-l"><span>About ${tk} tokens</span><span>budget ${budget}</span></div><div class="sm-meter-bar"><i style="width:${Math.min(100, (tk / budget) * 100).toFixed(0)}%"></i></div></div>
          <p class="sm-note">Read in full: this place's card. In short: one line from each place above. Not at all: other areas. Today's onboarding line is about 30 tokens.</p>
        </div><div class="sm-pv-out"><pre class="sm-slice" aria-label="What Loci reads">${sliceHTML(S.pv.place, sKey[curS], S.memoryOn)}</pre></div></div>
        <div class="sm-try"><div class="sm-row" style="justify-content:space-between"><h3 class="sm-h3">Try it: the same Lumen, two ways</h3><span class="sm-ai">${sample ? "Written by Claude, live" : "Scripted example (Claude isn't available on this page)"}</span></div>
          <div class="sm-row"><input class="sm-input" id="try-q" data-tryq value="${esc(S.tryQ)}" style="flex:1 1 280px" aria-label="Your question">${btn(S.trying ? "Writing…" : "Plan it both ways", `data-act="try"${S.trying ? " disabled" : ""}`)}</div>
          <div class="sm-try-cols">${col(out?.with, true)}${col(out?.without, false)}</div>
        </div>
      </div>
      <div class="sm-sec"><h2 class="sm-h2">Off the record, and starting over</h2>
        <p class="sm-note"><b>Off the record</b> is chosen before a chat or a Live session starts: Loci neither reads your memory nor notes anything from it. Your Profile and Instructions still apply.</p>
        ${S.confirm === "mem" ? `<div class="sm-confirm"><p>This deletes every card on your map. Loci won't rebuild them from anything that happened before now. Your chats, Lumens and checks stay. Type <b>delete</b> to confirm.</p><div class="sm-row"><input class="sm-input" id="confirm-mem" data-confirm style="max-width:160px" aria-label="Type delete to confirm">${btn("Delete all memory", 'data-act="delall-go"', "danger")}${btn("Cancel", 'data-act="confirm-cancel"', "quiet")}</div></div>` : `<div class="sm-row">${btn("Delete all memory…", 'data-act="delall"', "quiet")}</div>`}
      </div>
    </div>`;
  }

  /* ---------- Usage, Privacy */
  function usageTab() {
    const rows = [["Lumens (Watch, Listen, Read)", 27], ["Chats with Loci", 9], ["Live sessions", 5], ["Memory (Loci's notes)", 1]];
    return `<div class="sm-body"><div class="sm-sec"><div><h1 class="sm-h1">Usage</h1><p class="sm-lead">How much of this month's included AI you've used. Example figures: the allowance arrives with prices (Phase 3D).</p></div>
      <div class="sm-usage"><div><span class="sm-big">42%</span> <span class="sm-note">of October's allowance · resets 1 November</span></div><div class="sm-meter-bar" style="height:8px"><i style="width:42%"></i></div>
      ${rows.map(([l, v]) => `<div class="sm-usage-row"><span>${esc(l)}</span><b>${v}%</b><div class="sm-meter-bar"><i style="width:${v}%"></i></div></div>`).join("")}
      <p class="sm-note">Memory is the cheapest part of Studiolo: Loci's notes use a small model, and reading them adds a few hundred words to each request.</p></div></div></div>`;
  }
  function privacyTab() {
    return `<div class="sm-body"><div class="sm-sec" style="max-width:680px"><div><h1 class="sm-h1">Privacy & data</h1><p class="sm-lead">Your account is private. Here is what Studiolo keeps, what it never keeps, and how to take it all with you.</p></div>
      <div class="sm-field">${sw("sw-analytics", S.analytics, "Help improve Studiolo with usage analytics and masked screen recordings")}<small>Your notes, maps and files are never recorded.</small></div></div>
      <div class="sm-sec" style="max-width:680px"><h2 class="sm-h2">What Loci never notes</h2><p class="sm-note">These can't be stored as memory, even if a chat touches on them. If you write one into your own Instructions, it's yours and Loci follows it; it just never infers or files it.</p>
        <ul class="sm-never"><li>Health, religion or beliefs, politics, sexuality, ethnicity, union membership, money or family. Studying a subject says nothing about you: learning Islamic architecture is not a statement of faith.</li><li>Mood, stress or confidence from how you sound or look. Live never reads your voice for feelings.</li><li>Anything about other people you mention.</li><li>Guesses from what you save or browse in Commonplace.</li><li>When or how long you study, as a judgement about you.</li></ul></div>
      <div class="sm-sec" style="max-width:680px"><h2 class="sm-h2">Your data</h2><p class="sm-note">Export gives you your Commonplace, your map, your memory and your instructions as JSON and Markdown.</p>
        <div class="sm-row">${btn("Export my data", 'data-act="export"', "quiet")}${btn("Delete my account…", 'data-act="delacct"', "quiet")}</div>
        ${S.confirm === "acct" ? `<div class="sm-confirm"><p>Deleting your account removes everything: Commonplace, map, Lumens, courses, memory. Type <b>delete</b> to confirm. (Prototype: nothing is deleted.)</p><div class="sm-row"><input class="sm-input" id="confirm-acct" data-confirm style="max-width:160px" aria-label="Type delete to confirm">${btn("Delete my account", 'data-act="delacct-go"', "danger")}${btn("Cancel", 'data-act="confirm-cancel"', "quiet")}</div></div>` : ""}
      </div></div>`;
  }

  /* ================================================================ Loci: the same memory, in context */
  function lociPanel() {
    const cp = $(".cp", root); if (!cp) return;
    const meta = $(".cp-meta", cp);
    if (meta && !$(".lk-tellbtn", meta)) meta.insertAdjacentHTML("beforeend", `<button class="chip-btn lk-tellbtn" type="button" data-act="tell">Tell Loci…</button>`);
    $(".lk-here", cp)?.remove(); $(".lk-tell", cp)?.remove();
    const id = "climate";
    const h = S.memoryOn && hasCard(id) ? headline(id) : "nothing noted here";
    meta?.insertAdjacentHTML("afterend", `<button class="lk-here" type="button" data-act="sheet"><span>Loci knows here:</span><b>${esc(h.replace(/^./, (c) => c.toUpperCase()))}</b><span>· ${visibleSeen(id).length} seen</span><em>${S.memoryOn ? "See and edit ›" : "Memory is off ›"}</em></button>${S.open.tell ? `<div class="lk-tell"><textarea class="sm-area" id="tell-text" data-tell placeholder="For example: I'm designing for Dubai's climate, so humid summers matter.">${esc(S.notes.climate || "")}</textarea><div class="sm-row">${btn("Save note", 'data-act="tell-save"')}${btn("Cancel", 'data-act="tell-cancel"', "quiet")}<span class="sm-note">Applies to this topic and everything under it.</span></div></div>` : ""}`);
    const body = $(".cp-body", cp); if (!body) return;
    const T = S.thread;
    const remembered = S.entries.some((x) => x.id === "e-court");
    body.innerHTML = `<div class="lk-thread">
      <div class="lk-loci"><p>Last time, the wet jar in humid air was the tricky one. A two-minute check first, or straight on?</p>
        ${T.opened ? `<p class="sm-note">${T.opened === "check" ? "Starting a two-minute check on evaporative cooling (in the app, a Check yourself card opens here)." : "Straight on, then. Loci keeps “To revisit” on the card for another day."}</p>` : `<div class="lk-q">${["Check me", "Straight on"].map((l, i) => `<button class="chip-btn" type="button" data-act="opening" data-val="${i ? "on" : "check"}">${l}</button>`).join("")}</div>`}
        <span class="sm-ai">From “To revisit” on this card. Loci opens like this at most once a week per topic.</span></div>
      <div class="lk-me">I already know how the stack effect works, skip it. I'm designing a courtyard for a prayer hall in Dubai.</div>
      <div class="lk-loci"><p>Then we'll start where the stack effect stops: how a shaded courtyard and a malqaf work together on a Dubai afternoon, and why the wet jar earns its place mostly in the dry months.</p>
        <div class="lk-remember"${remembered ? "" : " data-undone"}><span>Loci will remember:</span><b>Working on a courtyard for a prayer hall in Dubai</b><span class="sm-basis" data-b="said">You said</span><button class="sm-act" type="button" data-act="${remembered ? "rem-undo" : "rem-redo"}">${remembered ? "Undo" : "Remember it"}</button><button class="sm-act" type="button" data-act="sheet">Edit</button></div>
        <div class="lk-lumen"><span class="sm-ai">Lumen · Watch</span><b>Courtyard and malqaf, together</b>
          <button class="mf" type="button" data-act="mf" aria-expanded="${T.mf}">Made for you ${T.mf ? "▾" : "▸"}</button>
          ${T.mf ? `<div class="mfd"><span>Pitched at <b>basics</b> (you said) · skips the stack effect (you showed it) · uses your prayer hall in Dubai · sections before photos.</span><div class="sm-row">${btn("Too basic", 'data-act="pitch" data-val="basic"', "quiet")}${btn("Too advanced", 'data-act="pitch" data-val="adv"', "quiet")}</div></div>` : ""}
          <div class="sm-row">${btn("Make it", 'data-act="makeit"')}${btn("Not now", 'data-act="notnow"', "quiet")}</div></div>
      </div></div>`;
  }
  function sheetHTML() {
    return `<div class="lk-sheet" role="dialog" aria-label="What Loci knows about you here" id="lk-sheet"><div class="lk-sheet-top"><h3 class="sm-h3">What Loci knows here</h3><button class="button button-link" type="button" data-act="sheet-close">Close</button></div><div class="sm-card">${cardHTML("climate", { inSheet: true })}<p class="sm-note">The same card as in Settings → Memory. <a href="#memory" data-tab="memory">See your whole memory map</a></p></div></div>`;
  }

  /* ================================================================ rendering */
  function shell(name) {
    root.innerHTML = DATA.screens[name];
    $$(".navigation-rail .navigation-link[href], .tab-bar .tab-bar-link[href]", root).forEach((a) => a.removeAttribute("aria-current"));
    const n = S.profile.name.trim() || "You";
    $$(".account-name", root).forEach((x) => (x.textContent = n));
    $$(".account-avatar", root).forEach((x) => (x.textContent = n.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()));
    $$(".account-trigger", root).forEach((x) => { x.setAttribute("aria-label", "Account menu for " + n); x.title = n; });
  }
  const SUB = { profile: "Profile", learning: "Learning", memory: "Memory", usage: "Usage", privacy: "Privacy & data" };
  function render() {
    const scroll = window.scrollY, active = document.activeElement?.id;
    if (S.view === "loci") {
      shell("climate");
      $$(`.navigation-rail .navigation-link[href="/graph"], .tab-bar .tab-bar-link[href="/graph"]`, root).forEach((a) => a.setAttribute("aria-current", "page"));
      lociPanel();
      if (S.sheet) root.insertAdjacentHTML("beforeend", sheetHTML());
    } else {
      shell("library");
      const main = $("main", root);
      const tab = { profile: profileTab, learning: learningTab, memory: memoryTab, usage: usageTab, privacy: privacyTab }[S.tab] || memoryTab;
      main.innerHTML = `<div class="sm-page">${header(SUB[S.tab])}${tab()}</div>`;
    }
    root.insertAdjacentHTML("beforeend", `<div class="sm-proto" role="group" aria-label="Prototype views"><span>Prototype</span><button type="button" data-go="settings" aria-pressed="${S.view === "settings"}">Settings</button><button type="button" data-go="loci" aria-pressed="${S.view === "loci"}">In Loci</button></div>`);
    if (toastMsg) root.insertAdjacentHTML("beforeend", `<div class="sm-toast" role="status"><span>${esc(toastMsg.t)}</span>${toastMsg.undo ? '<button type="button" data-act="toast-undo">Undo</button>' : ""}</div>`);
    window.scrollTo(0, scroll);
    if (active) { const el = document.getElementById(active); if (el) { el.focus({ preventScroll: true }); if (el.setSelectionRange && typeof el.value === "string") try { el.setSelectionRange(el.value.length, el.value.length); } catch { /* not text */ } } }
  }
  let toastMsg = null, toastTimer = 0, undoFn = null;
  /** A toast for something that just happened; `undo` (a function) adds an Undo button. */
  function toast(t, undo) { undoFn = undo || null; toastMsg = { t, undo: !!undo }; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toastMsg = null; undoFn = null; $(".sm-toast", root)?.remove(); }, 5200); }
  function go(view, tab) { S.view = view; if (tab) S.tab = tab; S.sheet = false; try { history.replaceState(null, "", "#" + (view === "loci" ? "loci" : S.tab)); } catch { /* sandboxed */ } window.scrollTo(0, 0); render(); }

  /* ================================================================ actions */
  const find = (id) => S.entries.find((x) => x.id === id);
  function remove(id) {
    const x = find(id); if (!x) return;
    S.entries = S.entries.filter((y) => y !== x); S.tombs.push(x); S.open = { ...S.open, why: null, edit: null };
    toast(`Deleted from ${x.place === "you" ? "You" : P[x.place].name}. Loci won't rebuild it from older evidence.`, () => { S.tombs = S.tombs.filter((t) => t !== x); S.entries.push(x); });
  }
  async function tryIt() {
    const q = S.tryQ.trim(); if (!q) return;
    const place = S.pv.place === "you" ? "precast" : S.pv.place;
    const ctx = sliceText(place, "lumen", S.memoryOn);
    S.trying = true; S.tryOut = null; render();
    const ask = (withCtx) => `You plan a short narrated lesson, called a Lumen, in Studiolo, a private learning app. Plan it for this one learner.\n\n${withCtx ? `What Studiolo knows about the learner at this place on their map. Their instructions win over notes. Don't mention memory or this block:\n${ctx}` : "You know nothing about the learner."}\n\nThe learner's question, asked on the topic "${P[place].name}": ${q}\n\nReply with JSON only, in British English: {"title": "at most 7 words", "pitch": "one short sentence: who it is pitched for and what it skips, or 'For anyone new to this' if you know nothing", "slides": ["exactly four slide titles, at most 6 words each"], "opening": "the narrator's first sentence, at most 30 words"}`;
    try {
      if (!sample) throw new Error("no sample");
      const [w, wo] = await Promise.all([sample.json(ask(true), { modelTier: "quick" }), sample.json(ask(false), { modelTier: "quick" })]);
      S.tryOut = { with: w, without: wo };
    } catch {
      S.tryOut = {
        with: { title: "Stopping heat at the fixings", pitch: "Pitched at basics, for the project architect on the prayer hall; skips joints and tolerances you've shown you know.", slides: ["Where the heat really gets in", "The fixing in section", "Thermal breaks: what to ask for", "Checking the precaster's detail"], opening: "You already know your joints and tolerances, so let's go straight to the steel fixing behind the panel, in section, where most of the heat slips through." },
        without: { title: "Thermal bridging in precast panels", pitch: "For anyone new to this.", slides: ["What is a thermal bridge?", "Why concrete conducts heat", "Common bridging points", "Solutions and products"], opening: "A thermal bridge is a path through a wall where heat escapes faster than through the rest of it; let's see why precast panels have them." },
      };
      if (sample) toast("Claude didn't answer, so this is the scripted example.");
    }
    S.trying = false; render();
  }

  root.addEventListener("click", (ev) => {
    const t = ev.target.closest("[data-act], [data-tab], [data-go], [data-seg], [data-switch], a[href], .account-trigger, .theme-toggle, .rail-toggle");
    if (!t || !root.contains(t)) return;
    if (t.matches("[data-tab]")) { ev.preventDefault(); go("settings", t.dataset.tab); return; }
    if (t.matches("[data-go]")) { go(t.dataset.go); return; }
    if (t.matches(".account-trigger")) { ev.preventDefault(); go("settings", "profile"); return; }
    if (t.matches(".theme-toggle")) { const dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches); document.documentElement.dataset.theme = dark ? "light" : "dark"; S.profile.theme = dark ? "light" : "dark"; render(); return; }
    if (t.matches(".rail-toggle")) { const sh = $(".app-shell", root); sh.dataset.rail = sh.dataset.rail === "open" ? "closed" : "open"; return; }
    if (t.matches("[data-seg]")) {
      const { seg: g, key, val } = t.dataset;
      if (g === "pf") {
        if (key === "field") S.profile.field = ({ Law: "law", Architecture: "architecture", Engineering: "engineering", Business: "business", Medicine: "medicine", "Something else": "other" })[val];
        else if (key === "theme") { S.profile.theme = val.toLowerCase(); if (val === "System") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = val.toLowerCase(); }
        else S.profile[key] = val;
      } else S.prefs[key] = val;
      render(); return;
    }
    if (t.matches("[data-switch]")) {
      const id = t.dataset.switch;
      if (id === "sw-mem") { S.memoryOn = !S.memoryOn; toast(S.memoryOn ? "Memory is on. Loci uses your cards again and notes new things from now on." : "Memory is off. Loci stops noting and stops using your cards. Nothing was deleted."); }
      if (id === "sw-field") S.prefs.field = !S.prefs.field;
      if (id === "sw-analytics") S.analytics = !S.analytics;
      render(); return;
    }
    if (t.matches("a[href]") && !t.dataset.act) {
      ev.preventDefault();
      const href = t.getAttribute("href");
      if (href === "/graph") go("loci"); else if (href === "/settings") go("settings", "profile"); else toast("Only Settings and Loci are in this prototype.");
      return;
    }
    const a = t.dataset.act, id = t.dataset.id;
    const draft = (sel) => $(sel, root)?.value ?? "";
    switch (a) {
      case "sel": S.sel = id; S.open = { why: null, edit: null, add: null, note: null }; break;
      case "why": S.open.why = S.open.why === id ? null : id; break;
      case "edit": S.open.edit = id; S.open.why = null; break;
      case "edit-cancel": S.open.edit = null; break;
      case "edit-save": { const x = find(id), v = draft(`#edit-${id}`).trim(); if (x && v) { x.text = v.slice(0, 160); x.edited = true; x.basis = "said"; x.date = "24 Oct"; x.why = [...x.why, "You edited it on 24 Oct. Your words win from here on."]; toast("Saved. Loci reads your version from the next Lumen or reply."); } S.open.edit = null; break; }
      case "del": remove(id); break;
      case "understood": { const x = find(id); remove(id); if (x) S.entries.push(e(x.place, "known", x.text.replace(/^./, (c) => c.toUpperCase()), "said", "24 Oct", "You marked it understood on 24 Oct. Loci may check it once, gently.")); toast("Marked understood. Loci may check it once, gently, another day."); break; }
      case "undo-del": { const x = S.tombs.find((y) => y.id === id); if (x) { S.tombs = S.tombs.filter((y) => y !== x); S.entries.push(x); } break; }
      case "toast-undo": if (undoFn) undoFn(); undoFn = null; toastMsg = null; break;
      case "add": S.open.add = id + ":" + t.dataset.slot; break;
      case "add-cancel": S.open.add = null; break;
      case "add-save": { const v = draft("[data-add-draft]").trim(); if (v) { S.entries.push(e(id, t.dataset.slot, v.slice(0, 160), "said", "24 Oct", "You added this in Settings on 24 Oct.")); toast("Added. Loci reads it from the next Lumen or reply."); } S.open.add = null; break; }
      case "forget": { const xs = entriesAt(id); S.entries = S.entries.filter((x) => x.place !== id); S.tombs.push(...xs); toast(`Forgot ${xs.length} notes on ${id === "you" ? "You" : P[id].name}.`, () => { S.tombs = S.tombs.filter((y) => !xs.includes(y)); S.entries.push(...xs); }); break; }
      case "seen": { const k = t.dataset.k; S.hiddenSeen.has(k) ? S.hiddenSeen.delete(k) : S.hiddenSeen.add(k); break; }
      case "sug-keep": { const g = S.sugs.find((x) => x.id === id); if (g) { S.sugs = S.sugs.filter((x) => x !== g); S.entries.push(e(g.place, g.slot, g.keep || g.text, "agreed", "24 Oct", [...g.why, "You pressed Keep on 24 Oct."])); S.sel = g.place; toast(`Kept on ${g.place === "you" ? "You" : P[g.place].name}.`); } break; }
      case "sug-dismiss": { const g = S.sugs.find((x) => x.id === id); S.sugs = S.sugs.filter((x) => x !== g); toast("Dismissed. Loci won't suggest it again unless something new happens."); break; }
      case "pv-surface": S.pv.surface = t.dataset.val; break;
      case "try": tryIt(); return;
      case "delall": S.confirm = "mem"; break;
      case "delall-go": if (draft("#confirm-mem").trim().toLowerCase() === "delete") { const xs = S.entries; S.tombs.push(...xs); S.entries = []; S.sugs = []; S.confirm = null; toast("All memory deleted. Loci starts again from your Profile and Instructions."); } else toast("Type delete to confirm."); break;
      case "delacct": S.confirm = "acct"; break;
      case "delacct-go": toast(draft("#confirm-acct").trim().toLowerCase() === "delete" ? "Prototype: nothing was deleted." : "Type delete to confirm."); S.confirm = null; break;
      case "confirm-cancel": S.confirm = null; break;
      case "export": toast("Prototype: in the app, this prepares a download of your data."); break;
      case "save-profile": toast("Profile saved."); break;
      case "note-edit": S.open.note = id; break;
      case "note-cancel": S.open.note = null; break;
      case "note-save": { const v = draft(`#note-${id}`).trim(); if (v) S.notes[id] = v.slice(0, 1000); else delete S.notes[id]; S.open.note = null; toast("Note saved. It applies there and below."); break; }
      case "note-del": { const old = S.notes[id]; delete S.notes[id]; toast(`Note on ${P[id].name} deleted.`, () => { S.notes[id] = old; }); break; }
      case "goto-learning": go("settings", "learning"); return;
      case "open-loci": if (id === "climate") { go("loci"); return; } toast(`In the app, this opens ${P[id].name} in Loci. This prototype has Climate-responsive design.`); break;
      case "sheet": S.sheet = true; break;
      case "sheet-close": S.sheet = false; break;
      case "tell": S.open.tell = !S.open.tell; break;
      case "tell-cancel": S.open.tell = false; break;
      case "tell-save": { const v = draft("#tell-text").trim(); if (v) S.notes.climate = v.slice(0, 1000); else delete S.notes.climate; S.open.tell = false; toast("Note saved on Climate-responsive design. It's in Settings → Learning too."); break; }
      case "opening": S.thread.opened = t.dataset.val; break;
      case "rem-undo": S.entries = S.entries.filter((x) => x.id !== "e-court"); toast("Undone. Loci won't remember that."); break;
      case "rem-redo": addCourt(); break;
      case "mf": S.thread.mf = !S.thread.mf; break;
      case "pitch": S.sugs = S.sugs.filter((g) => g.id !== "s-pitch"); S.sugs.unshift(t.dataset.val === "basic"
        ? { id: "s-pitch", place: "climate", slot: "level", text: "Regular: skip more of the basics here", keep: "Regular", why: ["You said “Courtyard and malqaf, together” was too basic (24 Oct)."] }
        : { id: "s-pitch", place: "climate", slot: "level", text: "New: start from the beginning here", keep: "New", why: ["You said “Courtyard and malqaf, together” was too advanced (24 Oct)."] });
        toast("Noted. It's waiting for you in Settings → Memory, and the next Lumen here will lean that way."); break;
      case "makeit": toast("In the app, Make it writes the Lumen with this slice and records which notes it used."); break;
      case "notnow": toast("Not now. The offer stays in this topic's journal."); break;
      default: return;
    }
    render();
  });
  function addCourt() { const x = e("climate", "working_on", "A courtyard for a prayer hall in Dubai", "said", "24 Oct", "This topic's chat, 24 Oct: “I'm designing a courtyard for a prayer hall in Dubai.”"); x.id = "e-court"; S.entries.push(x); }
  addCourt();

  root.addEventListener("input", (ev) => {
    const t = ev.target;
    if (t.dataset.instr) {
      const k = t.dataset.instr; S.instr[k] = t.value;
      const c = $(`[data-count="${k}"]`, root); if (c) c.textContent = `${t.value.length} / 1,000`;
      const pre = $("#aside-slice", root); if (pre) pre.innerHTML = sliceHTML("you", "chat", S.memoryOn);
    } else if (t.dataset.pf) {
      S.profile[t.dataset.pf] = t.value;
      if (t.dataset.pf === "name") { const n = t.value.trim() || "You"; $$(".account-name", root).forEach((x) => (x.textContent = n)); }
    } else if (t.matches("[data-tryq]")) S.tryQ = t.value;
  });
  root.addEventListener("change", (ev) => {
    const t = ev.target;
    if (t.dataset.pv === "place") { S.pv.place = t.value; if (t.value === "you") S.pv.surface = "chat"; else if (S.pv.surface === "chat" && S.pv.place !== "you") S.pv.surface = "chat"; render(); }
    else if (t.dataset.prsel) { S.prefs[t.dataset.prsel] = t.value; render(); }
    else if (t.dataset.pf === "tz") S.profile.tz = t.value;
  });
  root.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && S.sheet) { S.sheet = false; render(); }
    if (ev.key === "Enter" && ev.target.matches("[data-edit-draft], [data-add-draft], [data-tryq]")) { ev.preventDefault(); ev.target.closest(".sm-edit, .sm-row")?.querySelector("button.button")?.click(); }
  });

  const h0 = (location.hash || "").slice(1);
  if (h0 === "loci") S.view = "loci"; else if (SUB[h0]) S.tab = h0;
  render();
})();
