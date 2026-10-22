/* Learn, slice 2 (prototype): the Read format's long reads. A long read is a real article, not a page of text: animated
   HTML/SVG diagrams of the mechanism, small interactive figures you can play with, a comparison table, steps, a
   check-yourself question, and source chips that point into Commonplace. learn.js asks for an article by key and mounts
   its behaviour; generated long reads without a key fall back to plain sections.
   Nothing here invents numbers: the humidity figure is qualitative, and the courtyard figure is plain geometry with its
   assumption stated (the sun 45° up). */
(() => {
  "use strict";
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const cite = (title, where) => `<button type="button" class="rd-cite" data-rd-src="${esc(title)}">${esc(title)}${where ? `<span>${esc(where)}</span>` : ""}</button>`;
  const sec = (i, title, body) => `<section id="rs-${i}" class="rd-sec" data-rs-sec="${i}"><h2><span>${i + 1}</span>${esc(title)}</h2>${body}</section>`;
  const fig = (cls, inner, caption) => `<figure class="rd-fig ${cls}">${inner}${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
  // Arrowheads take their colour from the line's class.
  const DEFS = `<defs><marker id="rd-ah-cool" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="rd-ah cool"/></marker><marker id="rd-ah-warm" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="rd-ah warm"/></marker></defs>`;
  const flow = (d, kind = "cool") => `<path class="rd-flow ${kind}" d="${d}" marker-end="url(#rd-ah-${kind})"/>`;

  /* ---------- figures */
  const mechanisms = () => fig("rd-trio", `<div class="rd-trio-grid">
      <div class="rd-mech"><svg viewBox="0 0 200 120" role="img" aria-label="Wind pressure: air pushed in one side of a room and out the other">${DEFS}
        <path class="rd-wall" d="M40 30H160M40 30V52M40 78V100M160 30V52M160 78V100M40 100H160"/>${flow("M6 65H194")}<text class="rd-t" x="8" y="20">wind</text></svg><b>Wind pressure</b><span>Pushed in on the windward side, pulled out on the lee.</span></div>
      <div class="rd-mech"><svg viewBox="0 0 200 120" role="img" aria-label="Stack effect: cool air drawn in low, warm air rising and leaving high">${DEFS}
        <path class="rd-wall" d="M40 30H128M152 30H160M40 30V80M40 98V100M160 30V100M40 100H160"/>${flow("M4 90H70", "cool")}${flow("M84 88C112 76 136 60 140 34V6", "warm")}<text class="rd-t" x="150" y="14">warm out</text><text class="rd-t" x="4" y="112">cool in</text></svg><b>Stack effect</b><span>Warm air rises and leaves high up; cooler air is drawn in low.</span></div>
      <div class="rd-mech"><svg viewBox="0 0 200 120" role="img" aria-label="Evaporation: air passing over a wet jar loses heat">${DEFS}
        <path class="rd-jar" d="M84 112C76 96 76 80 86 72H114C124 80 124 96 116 112Z"/><path class="rd-water" d="M80 92C92 88 108 96 120 92"/>
        <g class="rd-wisps"><path class="rd-wisp" d="M92 68C88 60 96 54 92 46"/><path class="rd-wisp w2" d="M100 68C96 60 104 54 100 46"/><path class="rd-wisp w3" d="M108 68C104 60 112 54 108 46"/></g>
        ${flow("M196 40H128", "warm")}${flow("M72 40H6", "cool")}<text class="rd-t" x="150" y="28">warm</text><text class="rd-t" x="16" y="28">cooler</text></svg><b>Evaporation</b><span>Water turning to vapour takes heat from the air passing over it.</span></div>
    </div>`, "Three ways air takes heat away. The old builders used all three without naming them.");

  const humidity = () => fig("rd-hum", `<div class="rd-hum-grid"><svg viewBox="0 0 220 170" role="img" aria-label="A wet jar at the foot of a tower, with vapour rising">${DEFS}
        <path class="rd-wall" d="M60 6V120M160 6V120"/><path class="rd-jar" d="M94 160C84 140 84 120 96 110H124C136 120 136 140 126 160Z"/><path class="rd-water" d="M90 136C102 132 118 140 130 136"/>
        <g class="rd-wisps"><path class="rd-wisp" d="M102 104C98 94 106 88 102 76"/><path class="rd-wisp w2" d="M110 104C106 94 114 88 110 76"/><path class="rd-wisp w3" d="M118 104C114 94 122 88 118 76"/></g>
        ${flow("M110 8V64")}<text class="rd-t" x="168" y="20">down the tower</text></svg>
      <div class="rd-hum-ctl"><label for="rd-rh"><b>How humid is the air?</b></label><input id="rd-rh" type="range" min="10" max="95" value="25" data-rd-rh>
        <div class="rd-ticks"><span>Dry</span><span>Humid</span></div>
        <div class="rd-presets"><button type="button" data-rh="20">Dry desert afternoon</button><button type="button" data-rh="82">Humid coast in August</button></div>
        <p class="rd-out"><span>Cooling from the wet jar</span><b data-rd-out>Strong</b></p><div class="rd-bar"><i data-rd-bar></i></div></div></div>`,
    "Drag it. In dry air the water evaporates quickly and takes heat with it. As the air fills with water there's less room for more, and the jar stops helping. Qualitative, no numbers.");

  const house = () => fig("rd-house", `<div class="rd-seg" role="group" aria-label="Time of day"><button type="button" data-rd-time="day" aria-pressed="true">Afternoon</button><button type="button" data-rd-time="night" aria-pressed="false">Night</button></div>
      <svg viewBox="0 0 640 300" role="img" aria-label="Section through a courtyard house with a wind tower over the family room">${DEFS}
        <path class="rd-ground" d="M20 262H620"/>
        <path class="rd-mass" d="M60 170H300V262H60Z"/><path class="rd-mass" d="M480 150H600V262H480Z"/>
        <path class="rd-mass" d="M86 60H96V170H86ZM134 60H144V170H134Z"/><path class="rd-wall" d="M80 60H150M80 52H150"/>
        <path class="rd-room" d="M70 180H290V256H70Z"/>
        <text class="rd-t" x="150" y="226">Family room</text><text class="rd-t" x="362" y="282">Courtyard</text><text class="rd-t" x="40" y="44">Tower (barjeel)</text>
        <g class="rd-day"><circle class="rd-sun" cx="560" cy="56" r="16"/><g class="rd-rays"><path d="M560 26V16M560 96V86M530 56H520M600 56H590M539 35L532 28M588 84L581 77M539 77L532 84M588 28L581 35"/></g>
          ${flow("M250 50H115V214H300C350 214 386 176 394 110")}<text class="rd-t" x="256" y="46">breeze</text><text class="rd-t" x="196" y="160">roof terrace</text></g>
        <g class="rd-night"><path class="rd-moon" d="M572 40A20 20 0 1 0 572 76A15 15 0 1 1 572 40Z"/>
          ${flow("M340 252C334 224 346 204 338 170", "warm")}${flow("M390 252C384 222 396 200 388 160", "warm")}${flow("M440 252C434 226 446 204 438 176", "warm")}
          <path class="rd-sleep" d="M200 166H250"/><text class="rd-t" x="196" y="148">sleeping on the roof</text></g>
      </svg>`, `<span data-rd-cap="day">Afternoon: the breeze comes down the tower, crosses the family room and leaves through the courtyard.</span><span data-rd-cap="night" hidden>Night: the courtyard and the walls give the day's heat back to the sky, and the family sleeps on the roof.</span>`);

  const court = () => fig("rd-court", `<svg viewBox="0 0 520 250" role="img" aria-label="Section through a courtyard: the deeper it is, the more of its floor is in shade">${DEFS}
        <path class="rd-ground" d="M20 222H500"/><path class="rd-shade" data-rd-shade d=""/><path class="rd-ray" data-rd-ray d=""/>
        <rect class="rd-mass" data-rd-wl x="0" y="82" width="24" height="140"/><rect class="rd-mass" data-rd-wr x="0" y="82" width="24" height="140"/>
        <text class="rd-t" x="24" y="40">sun 45° up</text></svg>
      <div class="rd-court-ctl"><label for="rd-ratio"><b>How deep is the court?</b> <span data-rd-ratio-out></span></label><input id="rd-ratio" type="range" min="0.5" max="2.5" step="0.1" value="0.8" data-rd-ratio>
        <div class="rd-ticks"><span>Wide and shallow</span><span>Deep and narrow</span></div>
        <p class="rd-out"><span>Floor in shade</span><b data-rd-shade-out></b></p><div class="rd-bar"><i data-rd-shade-bar></i></div></div>`,
    "Geometry only: walls the same height, the sun 45° up from one side. Once the court is as deep as it is wide, its whole floor is in shade.");

  const breeze = () => fig("rd-breeze", `<svg viewBox="0 0 520 170" role="img" aria-label="Plan: a breeze crossing the rooms and leaving through the courtyard">${DEFS}
        <path class="rd-mass" d="M40 30H190V140H40Z"/><path class="rd-mass" d="M330 30H480V140H330Z"/><path class="rd-room" d="M52 42H178V128H52ZM342 42H468V128H342Z"/>
        <text class="rd-t" x="86" y="90">room</text><text class="rd-t" x="378" y="90">room</text><text class="rd-t" x="232" y="160">courtyard</text>
        ${flow("M6 85H230C250 85 260 70 260 40V8")}${flow("M514 85H290C270 85 260 70 260 40", "cool")}<text class="rd-t" x="8" y="74">prevailing wind</text></svg>`,
    "Plan view. With openings on the far side of each room, the courtyard becomes the outlet that pulls air across the house.");

  /* ---------- articles */
  const ARTICLES = {
    cooling: () => {
      const sections = ["The one idea", "Three ways air takes heat away", "Why humidity changes the rules", "What the barjeel houses did", "What it means for your site"];
      const html = [
        sec(0, sections[0], `<p class="rd-lede">In Dubai, a wind tower can't make the air colder, but it can make the air move, and moving air is what makes people comfortable for much of the year.</p>
          <p>This long read follows that idea from the physics to your thesis site. It draws on your lecture notes and on Hassan Fathy where they help, and says so when it's general knowledge.</p>
          <p class="rd-pull">Moving air, not colder air.</p>`),
        sec(1, sections[1], `<p>Three mechanisms do the work. Wind pressure, the stack effect and evaporation each take heat away in a different way, and the old builders used all three without naming them.</p>
          ${mechanisms()}
          <p>Your lecture notes put the order in one line: shade first, then move air, then store or lose heat. ${cite("Climate and Architecture: lecture notes", "p. 2")}</p>`),
        sec(2, sections[2], `<p>Evaporation needs dry air. On a humid August day the air is already close to full of water, so there's little room for more, and the wet jar at the foot of an Egyptian malqaf does very little.</p>
          ${humidity()}
          <p>That's why the Gulf's barjeel rarely relied on water the way the Egyptian malqaf did. It opened on four sides and caught whatever breeze came off the sea. A breeze across damp skin still carries sweat away, so it cools people even when it can't cool the air.</p>`),
        sec(3, sections[3], `<p>In the old courtyard houses of Al Fahidi, the tower stands over one room, where the family sat through the hottest hours. Not the whole house: one room. The courtyard and the thick, shaded walls carried the rest, along with the family moving to wherever was coolest at that hour.</p>
          ${house()}
          <p>Fathy's point, in your copy of his book, is that houses like these work as systems: the tower, the courtyard, the shaded walls and the family's habits together. Lift the tower out on its own and you don't get the same result. ${cite("Natural Energy and Vernacular Architecture", "Hassan Fathy")}</p>
          <div class="rd-tablewrap"><table class="rd-table"><thead><tr><th></th><th>Malqaf</th><th>Barjeel</th></tr></thead><tbody>
            <tr><th>Faces</th><td>One way, to the prevailing breeze</td><td>Four ways, for wind from anywhere</td></tr>
            <tr><th>Cools with</td><td>Often water at its foot</td><td>Mostly moving air</td></tr>
            <tr><th>Works best</td><td>In dry heat</td><td>Where the air is too humid for water to help</td></tr>
            <tr><th>See one</td><td>Old Cairo houses</td><td>Al Fahidi, Dubai</td></tr></tbody></table></div>`),
        sec(4, sections[4], `<ol class="rd-steps">
            <li><b>Shade first.</b> A deep, narrow courtyard, and openings shaded from the low east and west sun.</li>
            <li><b>Give the tower one job.</b> Move air through the main living room: in high, across, and out to the courtyard.</li>
            <li><b>Give it a door.</b> Closed through the humid months, open through the cooler ones. Ceiling fans keep the air moving when it's shut.</li>
            <li><b>Put mass only where it can cool down.</b> Humid nights barely cool, so heavy walls help only where they're shaded and can lose heat on cooler nights.</li></ol>
          <div class="rd-check"><p class="rd-check-q"><b>Check yourself.</b> Why does a wet jar at the foot of a tower cool the air in a dry desert, but hardly at all on a humid coast?</p>
            <button type="button" class="rd-reveal" data-rd-reveal>Show the answer</button><p class="rd-answer" hidden>Dry air can take up water, so evaporation takes heat with it. Humid air is already close to full of water, so it can't.</p></div>
          <p class="rd-srcs"><span>Sources in this read</span>${cite("Climate and Architecture: lecture notes", "PDF")}${cite("Natural Energy and Vernacular Architecture", "Book")}</p>`),
      ].join("");
      return { sections, html };
    },
    courtyards: () => {
      const sections = ["What a courtyard does", "Dry heat: a well of cool air", "Humid heat: a path for breezes", "Proportions that work", "Shade before anything"];
      const html = [
        sec(0, sections[0], `<p class="rd-lede">A courtyard does different work in different climates. In dry heat it holds cool night air; in humid heat it shades, and it gives the breeze somewhere to go.</p>
          <p>This long read follows that difference, and ends with what to check on your own site.</p>`),
        sec(1, sections[1], `<p>In a dry climate the nights cool down. A courtyard collects that cool night air, which is heavier than warm air, and holds it into the morning, while the walls around it stay shaded.</p>`),
        sec(2, sections[2], `<p>In a humid climate the nights barely cool, so that trick fades. The courtyard earns its keep another way: open it to the prevailing wind, keep each room's other opening on the far side, and it becomes the outlet that pulls air across the house.</p>${breeze()}`),
        sec(3, sections[3], `<p>The deeper and narrower the court, the more of its floor and walls stay in shade. Try it.</p>${court()}
          <p class="rd-pull">How much of it is in shade at three in the afternoon?</p>`),
        sec(4, sections[4], `<p>So in humid places, judge a courtyard by two questions: how much of it is in shade at three in the afternoon, and where the air leaves the rooms around it. Thermal mass comes a distant third.</p>
          <div class="rd-check"><p class="rd-check-q"><b>Check yourself.</b> Why does a courtyard's cool-air trick work in dry heat but fade in humid heat?</p>
            <button type="button" class="rd-reveal" data-rd-reveal>Show the answer</button><p class="rd-answer" hidden>Because dry nights cool down and humid ones barely do, so in humid heat there's little cool night air to collect.</p></div>
          <p class="rd-srcs"><span>Sources in this read</span>${cite("Climate and Architecture: lecture notes", "PDF")}</p>`),
      ].join("");
      return { sections, html };
    },
  };
  const article = (key) => (ARTICLES[key] ? ARTICLES[key]() : null);

  /* ---------- behaviour: the figures, the section list and the reading progress */
  function mount(el, { toast } = {}) {
    if (!el) return;
    const $ = (s) => el.querySelector(s), $$ = (s) => [...el.querySelectorAll(s)];
    const hum = (v) => {
      const f = $(".rd-hum"); if (!f) return;
      const rh = +v, dry = Math.max(0, Math.min(1, (90 - rh) / 75));
      f.style.setProperty("--wo", (0.15 + dry * 0.85).toFixed(2));
      $("[data-rd-bar]").style.width = `${Math.round(dry * 100)}%`;
      $("[data-rd-out]").textContent = rh < 35 ? "Strong" : rh < 55 ? "Useful" : rh < 75 ? "Weak" : "Almost none";
      $("[data-rd-rh]").value = rh;
    };
    const courtFig = (v) => {
      const f = $(".rd-court"); if (!f) return;
      const r = +v, H = 140, W = Math.round(H / r), cx = 260, x0 = cx - W / 2, x1 = cx + W / 2, top = 222 - H;
      const sh = Math.min(W, H); // the sun 45° up: the left wall's shadow reaches as far across as the wall is tall
      $("[data-rd-wl]").setAttribute("x", x0 - 24); $("[data-rd-wr]").setAttribute("x", x1);
      $("[data-rd-shade]").setAttribute("d", `M${x0} ${top}L${x0 + sh} 222H${x0}Z`);
      $("[data-rd-ray]").setAttribute("d", `M${x0 - 60} ${top - 60}L${x0 + sh} 222`);
      const pct = Math.round((sh / W) * 100);
      $("[data-rd-shade-out]").textContent = `${pct}%`; $("[data-rd-shade-bar]").style.width = `${pct}%`;
      $("[data-rd-ratio-out]").textContent = `${r.toFixed(1)} times as deep as wide`;
    };
    if ($("[data-rd-rh]")) hum($("[data-rd-rh]").value);
    if ($("[data-rd-ratio]")) courtFig($("[data-rd-ratio]").value);
    el.addEventListener("input", (e) => { if (e.target.dataset.rdRh !== undefined) hum(e.target.value); if (e.target.dataset.rdRatio !== undefined) courtFig(e.target.value); });
    el.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.rh) return hum(b.dataset.rh);
      if (b.dataset.rdTime) {
        const f = b.closest(".rd-house"); f.dataset.time = b.dataset.rdTime;
        $$("[data-rd-time]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        $$("[data-rd-cap]").forEach((c) => (c.hidden = c.dataset.rdCap !== b.dataset.rdTime));
        return;
      }
      if (b.dataset.rdReveal !== undefined) { const a = b.nextElementSibling; a.hidden = !a.hidden; b.textContent = a.hidden ? "Show the answer" : "Hide the answer"; return; }
      if (b.dataset.rdSrc) return toast?.("Opens in your Commonplace.", `“${esc(b.dataset.rdSrc)}”, at the passage this read draws on.`);
    });
    const house = $(".rd-house"); if (house) house.dataset.time = "day";
    // The section list follows the reading, and the pinned head shows how far through you are.
    // The app's main stage scrolls on desktop; on a phone it doesn't, and the window does.
    const main = el.closest("main"), sc = main && getComputedStyle(main).overflowY === "auto" ? main : null;
    const toc = [...document.querySelectorAll(".lf-toc li")], secs = $$("[data-rs-sec]");
    const bar = document.querySelector(".lf-trow");
    const onScroll = () => {
      if (!el.isConnected) return (sc || window).removeEventListener("scroll", onScroll);
      const top = sc ? sc.getBoundingClientRect().top : 0, vh = sc ? sc.clientHeight : innerHeight;
      let cur = 0; secs.forEach((s, i) => { if (s.getBoundingClientRect().top - top < 160) cur = i; });
      toc.forEach((li, i) => (i === cur ? li.setAttribute("aria-current", "true") : li.removeAttribute("aria-current")));
      const art = $(".lf-article") || el, r = art.getBoundingClientRect(), h = r.height - vh * 0.6;
      bar?.style.setProperty("--rp", Math.max(0, Math.min(1, (top - r.top + 120) / Math.max(1, h))).toFixed(3));
    };
    (sc || window).addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  window.LearnRead = { article, mount };
})();
