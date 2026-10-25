/* Studiolo on a phone (prototype). One idea runs through it: the foot of the screen is for doing, not for going.
   - The Loci bar at the foot is the one control: + creates, the field finds a place or asks Loci, the mic dictates.
   - The four destinations move to a drawer on the left (☰ or a swipe from the edge), with the places you opened last.
   - In Loci, whatever is open shows as a card above the bar, as Apple Maps shows a place: its name, its children one
     tap away, and four big actions (add, make a Lumen, ask, more). Peek, card and full, dragged by its top.
   - The canvas is the app's own PalaceEngine and GraphMap (../boards/loci), with phone rules on top: a 44 pt touch
     target around every mark, hold for a menu, a two-finger tap or a pinch out to go back, and the Map shows areas only
     until you open one.
   Loci's answers are simulated here (no model is called); the mic is real where the browser allows it (dictation.js). */
"use strict";
(() => {
  const D = window.SAMPLE, LP = window.LociPalace;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const plural = (n, w, ws = w + "s") => `${n} ${n === 1 ? w : ws}`;
  const app = $("#app");
  let uid = 100;
  const nextId = (p) => `${p}${++uid}`;

  /* ---------- icons (Lucide shapes, as the app draws them) ---------- */
  const P = {
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    mic: '<rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    left: '<path d="M15 5l-7 7 7 7"/>',
    right: '<path d="M9 5l7 7-7 7"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    spark: '<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z"/><path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
    play: '<path d="M8 5.5v13l10.5-6.5z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    whole: '<path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/><circle cx="12" cy="12" r="2.2"/>',
    more: '<circle cx="5.5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18.5" cy="12" r="1.5"/>',
    cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
    map: '<circle cx="12" cy="12" r="2.4"/><circle cx="5" cy="6.5" r="1.8"/><circle cx="19" cy="6.5" r="1.8"/><circle cx="5.5" cy="18" r="1.8"/><circle cx="18.5" cy="18" r="1.8"/><path d="M10.1 10.6 6.5 7.7M13.9 10.6l3.6-2.9M10.2 13.6l-3.4 3.2M13.8 13.6l3.4 3.2"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r=".8"/><circle cx="4.5" cy="12" r=".8"/><circle cx="4.5" cy="18" r=".8"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
    grad: '<path d="M2.5 9.5 12 5l9.5 4.5L12 14z"/><path d="M6.5 11.5v4.2c0 1.3 2.5 2.8 5.5 2.8s5.5-1.5 5.5-2.8v-4.2M21.5 9.5v5"/>',
    library: '<path d="M16 6l4 14M12 6v14M8 8v12M4 4v16"/>',
    network: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M12 12V8"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    sub: '<path d="M14 10l5 5-5 5"/><path d="M5 4v7a4 4 0 0 0 4 4h10"/>',
    listen: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4.5" height="6.5" rx="1.5"/><rect x="16.5" y="14" width="4.5" height="6.5" rx="1.5"/>',
    watch: '<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M8.5 20.5h7M12 16.5v4"/><path d="M10.5 8.2v4.6l3.8-2.3z"/>',
    read: '<path d="M3.5 5.5A1.5 1.5 0 0 1 5 4h5.5A1.5 1.5 0 0 1 12 5.5V20a2 2 0 0 0-2-2H3.5zM20.5 5.5A1.5 1.5 0 0 0 19 4h-5.5A1.5 1.5 0 0 0 12 5.5V20a2 2 0 0 1 2-2h6.5z"/>',
    chat: '<path d="M4.5 19.5l1.2-3.6A7.9 7.9 0 1 1 8.5 18.6z"/>',
    note: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3A4 4 0 0 0 13 5.3l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1"/>',
    file: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    back15: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4v4h4"/><path d="M10 10v5M13 10h2.5l-.5 2.2a1.6 1.6 0 1 1-1.6 2"/>',
    fwd15: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4h-4"/><path d="M9 10v5M12 10h2.5l-.5 2.2a1.6 1.6 0 1 1-1.6 2"/>',
    key: '<circle cx="7" cy="7" r="2.2"/><circle cx="7" cy="17" r="2.2"/><path d="M12 7h8M12 17h8"/>',
    pencil: '<path d="M4 20l1-4L16 5l3 3L8 19z"/>',
    move: '<path d="M4 12h16M14 6l6 6-6 6"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8"/>',
    commonplace: '<rect x="4" y="4" width="7" height="9" rx="1.2"/><rect x="13" y="4" width="7" height="5" rx="1.2"/><rect x="4" y="15" width="7" height="5" rx="1.2"/><rect x="13" y="11" width="7" height="9" rx="1.2"/>',
    chevup: '<path d="M6 15l6-6 6 6"/>',
  };
  const FILLED = new Set(["play", "more"]);
  const ic = (n, cls = "") => `<svg class="m-ico ${FILLED.has(n) ? "fill " : ""}${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
  const FMT = { watch: { label: "Watch", ic: "watch", what: "Slides and a narrator", len: 6 }, listen: { label: "Listen", ic: "listen", what: "Two voices talk it through", len: 15 }, read: { label: "Read", ic: "read", what: "A long read with diagrams", len: 12 } };
  const STATUS = { not_started: { label: "Not started", cls: "" }, learning: { label: "Learning", cls: "s1" }, learned: { label: "Learned", cls: "s2" } };

  /* ---------- state ---------- */
  const S = {
    dest: "loci", view: "palace",
    topics: D.topics.map((t) => ({ ...t })), relations: D.relations, items: D.items.map((x) => ({ ...x })), lumens: D.lumens.map((l) => ({ ...l })),
    trail: [], openId: null, extraArea: null, detent: "card",
    bar: { mode: "idle", parent: null, capture: null, listening: false, ptt: false },
    reply: null, thread: [], chat: false, ghosts: [], making: null, player: null,
    recents: [], theme: "auto", slowTurn: false, key: false, hinted: false, pop: new Set(), lastPlace: null,
  };
  const byId = () => new Map(S.topics.map((t) => [t.id, t]));
  let T = byId();
  const reindex = () => { T = byId(); };
  const kids = (id) => S.topics.filter((t) => t.parentId === id);
  const areaOf = (id) => { let t = T.get(id); while (t && t.parentId) t = T.get(t.parentId); return t ? t.id : null; };
  const isTopic = (id) => !!id && T.has(id);
  const nameOf = (id) => {
    if (!id) return "Your whole map";
    if (T.has(id)) return T.get(id).name;
    const ref = LP.parseExtraId(id);
    if (ref?.kind === "stack") return ref.which === "commonplace" ? "Commonplace" : "Lumens";
    if (ref?.kind === "item") return S.items.find((x) => x.id === ref.id)?.title ?? "Item";
    if (ref?.kind === "lumen") return S.lumens.find((x) => x.id === ref.id)?.title ?? "Lumen";
    return id;
  };
  const descendants = (id) => { const out = []; const walk = (p) => kids(p).forEach((k) => { out.push(k.id); walk(k.id); }); walk(id); return out; };
  const itemsOn = (id) => { const ids = new Set([id, ...descendants(id)]); return S.items.filter((x) => x.topics.some((t) => ids.has(t))); };
  const lumensOn = (id) => { const ids = new Set([id, ...descendants(id)]); return S.lumens.filter((l) => l.state === "ready" && ids.has(l.topic)); };
  const graph = () => ({ topics: S.topics, relations: S.relations });
  let scene = LP.buildScene(graph());

  /* ---------- the Palace's rooms: an open area shows its Commonplace and Lumens stacks ---------- */
  function roomOf(areaId) {
    const items = S.items.filter((x) => x.topics.some((t) => areaOf(t) === areaId))
      .map((x, i) => ({ id: x.id, title: x.title, kindLabel: x.kind, createdAt: `2026-10-${String(20 - i).padStart(2, "0")}T09:00:00Z`, topicIds: x.topics, opens: "quick" }));
    const lumens = S.lumens.filter((l) => l.state === "ready" && areaOf(l.topic) === areaId)
      .map((l, i) => ({ id: l.id, kind: "lumen", title: l.title, createdAt: `2026-10-${String(22 - i).padStart(2, "0")}T09:00:00Z`, anchor: { kind: "topic", topicId: l.topic }, partTopicIds: [], partCount: 0, parts: [] }));
    return { areaId, items, itemTotal: items.length, lumens, lumenTotal: lumens.length };
  }
  function current() {
    const id = S.openId, ref = id ? LP.parseExtraId(id) : null;
    const areaId = !id ? null : ref ? (ref.kind === "stack" ? ref.areaId : S.extraArea) : areaOf(id);
    const room = areaId ? roomOf(areaId) : null;
    const extras = room ? LP.roomExtras(scene, room, { openId: id, roomAreaId: areaId }) : LP.NO_EXTRAS;
    return { id, ref, areaId, room, extras };
  }

  /* ---------- opening and going back: one selection for the Palace, the Map and the List ---------- */
  function openThing(id, opts = {}) {
    if (!id) return goHome();
    const ref = LP.parseExtraId(id);
    if (ref?.kind === "ghost") return ghostMenu(ref.id);
    if (ref?.kind === "draft") return;
    if (ref?.kind === "lumen") return openPlayer(ref.id);
    if (ref?.kind === "item") return openItem(ref.id);
    if (ref) { S.extraArea = ref.kind === "stack" ? ref.areaId : current().areaId; }
    if (!ref && !T.has(id)) return;
    if (id === S.openId) { setDetent(S.detent === "peek" ? "card" : S.detent); return; }
    S.trail = LP.pushTrail(S.trail, id);
    S.openId = id;
    if (!ref) remember({ kind: "topic", id });
    S.detent = opts.detent || "card";
    hideReplyIfStale();
    refresh();
  }
  function goBack() {
    if (!S.openId) return;
    const { trail, openId } = LP.backTrail(S.trail);
    S.trail = trail; S.openId = openId || null;
    S.detent = "card";
    refresh();
  }
  function goHome() { S.trail = []; S.openId = null; S.detent = "card"; refresh(); engine?.home(); }
  function remember(r) {
    S.recents = [r, ...S.recents.filter((x) => !(x.kind === r.kind && x.id === r.id))].slice(0, 5);
  }

  /* ---------- the Palace (Studiolo's own PalaceEngine) with phone rules on top ---------- */
  let engine = null, prov = { ghosts: [], draft: null }, provKey = "";
  function provisional() {
    const draft = S.bar.mode === "naming" && S.bar.draftOn ? { parentId: S.bar.parent } : null;
    const key = JSON.stringify([S.ghosts.map((g) => g.itemId), draft?.parentId ?? "-"]);
    if (key !== provKey) { provKey = key; prov = { ghosts: S.ghosts.map((g) => ({ ...g, inside: 0, parentItemId: null })), draft }; }
    return prov;
  }
  const viewOf = () => ({ panel: "sheet", sheetHeight: coveredBottom(), slowTurn: S.slowTurn, reduced: reduced(), cover: 0 });
  function mountPalace(wrap) {
    wrap.innerHTML = `<div class="palace" data-view="palace"><canvas class="palace-canvas" tabindex="0" aria-label="Your whole map in 3D. Tap a mark to open it, hold for its actions."></canvas></div>`;
    const c = current();
    engine = new LP.PalaceEngine($("canvas", wrap), {
      scene, extras: c.extras, placesKey: "studiolo-mobile-proto", storage: null, view: viewOf(), openId: c.id, trail: S.trail,
      onOpen: (id) => openThing(id), onBack: goBack, onInteract: onCanvasInput, probe: false,
    });
    engine.setProvisional(provisional());
    // A 44 pt target around every mark (Apple's minimum): the nearest mark within 22 px of the finger, in front first.
    const pick = engine.pick.bind(engine);
    engine.pick = function (x, y) {
      const hit = pick(x, y);
      if (hit) return hit;
      let best = null, score = Infinity;
      for (const it of this.items.values()) {
        const r = Math.max(Math.min(it.r, 28), 5) + 3, d = Math.hypot(it.x - x, it.y - y) - r;
        if (d < 22 && d + it.depth * 8 < score) { best = it.id; score = d + it.depth * 8; }
      }
      return best;
    };
    // On a phone a topic opens close up: its sub-topics and Loci's suggestions fill the space above the card, with no
    // pinch to get there. (The app frames every level from at least 260 units away.)
    const frameOf = engine.frameOf.bind(engine);
    engine.frameOf = function (id) {
      const f = frameOf(id);
      if (isTopic(id)) { f.dist = Math.max(120, f.dist * (T.get(id).parentId ? 0.42 : 0.72)); this.focusDist = f.dist; }
      return f;
    };
    gestures(wrap, (x, y) => engine.pick(x, y), () => { engine.drag = null; engine.dragging = false; });
  }
  function onCanvasInput() {
    if (!S.hinted) { S.hinted = true; $(".m-hint")?.classList.add("is-gone"); }
  }

  /* ---------- the Map (Studiolo's own GraphMap): areas only until you open one ---------- */
  let mapMounted = false;
  function mapState() {
    const f = isTopic(S.openId) ? S.openId : null;
    const topics = f ? S.topics : S.topics.filter((t) => !t.parentId);
    return {
      topics, relations: f ? S.relations : [], focusId: f, selectedId: f, lane: null, explainers: null,
      ghosts: S.ghosts.filter((g) => f && (g.parentId === f)).map((g) => ({ itemId: g.itemId, proposalId: g.proposalId, parentId: g.parentId, name: g.name })),
      pending: {}, reducedMotion: reduced(), coveredBottom: coveredBottom(), topicExplainers: null, popIds: new Set(S.pop), glowIds: new Set(), litItemId: null,
      topicName: (id) => T.get(id)?.name ?? "",
      on: {
        activate: (it) => { if (it.kind === "centre" || it.id === f) { if (f) goBack(); } else if (T.has(it.id)) openThing(it.id); },
        add: (topicId) => startNaming(topicId),
        more: () => {}, openItem: () => {}, relation: () => {},
        ghost: (it, act) => { const g = S.ghosts.find((x) => x.itemId === (it.itemId || it.id)); if (!g) return; act === "dismiss" ? dismissGhost(g.itemId) : act === "keep" ? keepGhost(g.itemId) : ghostMenu(g.itemId); },
        openExplainer: () => {},
      },
    };
  }
  function mountMap(wrap) {
    wrap.innerHTML = `<div class="loci-appmap-fill" id="mapView"></div>`;
    LociAppMap.mount($("#mapView", wrap), mapState());
    mapMounted = true;
    gestures(wrap, (x, y) => {
      // The Map's own SVG knows its marks: the topic under the finger, or the nearest within 22 px.
      const r = wrap.getBoundingClientRect(), at = document.elementFromPoint(r.left + x, r.top + y)?.closest?.("[data-topic-id],[data-id]");
      return at ? (at.dataset.topicId || at.dataset.id) : null;
    }, () => {});
  }

  /* ---------- gestures on the canvas: hold for a menu, two-finger tap to go back, swipe from the edge for the drawer ---------- */
  let lastPoint = { x: 0, y: 0 };
  function gestures(wrap, pickAt, cancelTap) {
    const downs = new Map();
    let hold = null, twoAt = 0, moved = 0;
    wrap.addEventListener("pointerdown", (e) => {
      const r = wrap.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      lastPoint = { x: e.clientX - app.getBoundingClientRect().left, y: e.clientY - app.getBoundingClientRect().top };
      downs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (S.detent === "full") setDetent("card");
      if (downs.size === 1) {
        moved = 0;
        clearTimeout(hold);
        hold = setTimeout(() => {
          if (moved > 8 || downs.size !== 1) return;
          const id = pickAt(x, y);
          if (!id) return;
          cancelTap();
          navigator.vibrate?.(8);
          thingMenu(id, lastPoint);
        }, 480);
      }
      if (downs.size === 2) { twoAt = performance.now(); clearTimeout(hold); }
    }, true);
    wrap.addEventListener("pointermove", (e) => {
      const d = downs.get(e.pointerId); if (!d) return;
      moved = Math.max(moved, Math.hypot(e.clientX - d.x, e.clientY - d.y));
      if (moved > 8) clearTimeout(hold);
    }, true);
    const up = (e) => {
      if (!downs.has(e.pointerId)) return;
      downs.delete(e.pointerId); clearTimeout(hold);
      if (twoAt && downs.size === 0) { if (performance.now() - twoAt < 320 && moved < 14) goBack(); twoAt = 0; }
    };
    wrap.addEventListener("pointerup", up, true);
    wrap.addEventListener("pointercancel", up, true);
    // With a mouse, a right-click is the hold.
    wrap.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const r = wrap.getBoundingClientRect(), id = pickAt(e.clientX - r.left, e.clientY - r.top);
      if (id) thingMenu(id, { x: e.clientX - app.getBoundingClientRect().left, y: e.clientY - app.getBoundingClientRect().top });
    });
  }

  /* ---------- painting ---------- */
  function render() {
    // A new destination or view: the stage is drawn again; everything else is repainted by refresh().
    if (engine) { engine.destroy(); engine = null; }
    mapMounted = false;
    const st = $("#stage");
    st.className = "m-stage";
    st.onscroll = null;
    if (S.dest === "loci") {
      st.innerHTML = `<div class="m-canvas-wrap" id="wrap"></div>
        <button class="m-place m-mat is-gone" id="place" type="button"></button>
        <div class="m-fabs m-mat"><button type="button" data-act="whole" aria-label="Whole map">${ic("whole", "sm")}</button><button type="button" data-act="key" aria-label="Key" aria-pressed="${S.key}">${ic("key", "sm")}</button></div>
        <div class="m-key m-mat" id="key" ${S.key ? "" : "hidden"}><span class="state">Not started</span><span class="state s1">Learning</span><span class="state s2">Learned</span><span class="state palace-mark-item">Commonplace</span><span class="state palace-mark-lumen">Lumen</span></div>
        ${S.view === "palace" && !S.hinted ? `<div class="m-hint m-mat">Tap to open · Hold for more</div>` : ""}`;
      const wrap = $("#wrap");
      if (S.view === "palace") { mountPalace(wrap); setTimeout(onCanvasInput, 9000); }
      else if (S.view === "map") mountMap(wrap);
      else paintList(wrap);
      placePill();
    } else {
      st.classList.add("is-page");
      st.innerHTML = pageHtml();
      st.onscroll = () => { const on = st.scrollTop > 44; $("#tb").classList.toggle("is-edge", on); $(".m-title .m-fade")?.style.setProperty("opacity", on ? "1" : "0"); };
    }
    paintTop();
    paintBar();
    refresh();
  }

  function refresh() {
    reindex();
    paintDock();
    if (S.dest === "loci") {
      placePill();
      const c = current();
      if (engine) {
        engine.setExtras(c.extras); engine.setTrail(S.trail); engine.setOpen(c.id); engine.setProvisional(provisional()); engine.setView(viewOf());
      }
      if (mapMounted) LociAppMap.update(mapState());
      if (S.view === "list") paintList($("#wrap"));
    }
    paintDrawer();
  }

  function paintTop() {
    const tb = $("#tb");
    const view = { palace: "Palace", map: "Map", list: "List" }[S.view];
    const title = S.dest === "loci"
      ? `<button class="m-title" type="button" data-act="views" aria-haspopup="menu" aria-label="Loci, ${view}. Change view"><small>Loci</small><b>${view}${ic("down")}</b></button>`
      : `<div class="m-title is-plain"><b class="m-fade" style="opacity:0">${esc(DEST[S.dest].label)}</b></div>`;
    const right = S.dest === "loci" ? `<button class="m-ib" type="button" data-act="options" aria-label="Options" aria-haspopup="menu">${ic("more")}</button>` : "<span></span>";
    tb.className = `m-tb m-mat${S.dest === "loci" ? " is-edge" : ""}`;
    tb.innerHTML = `<button class="m-ib" type="button" data-act="drawer" aria-label="Open menu" aria-controls="drawer">${ic("menu")}</button>${title}${right}`;
  }

  function placePill() {
    const el = $("#place"); if (!el) return;
    if (!S.openId) { el.classList.add("is-gone"); el.setAttribute("aria-hidden", "true"); return; }
    const back = LP.backTrail(S.trail).openId;
    el.classList.remove("is-gone"); el.removeAttribute("aria-hidden");
    el.innerHTML = `${ic("left", "sm")}<span>${esc(back ? nameOf(back) : "All areas")}</span>`;
    el.setAttribute("aria-label", `Back to ${back ? nameOf(back) : "all areas"}. Hold for the trail`);
  }

  /* ---------- the dock: top slot, card, mini player, bar ---------- */
  function paintDock() {
    const dock = $("#dock");
    if (!dock.children.length) dock.innerHTML = `<div id="dtop"></div><div id="dmake"></div><section class="m-card" id="card" aria-label="What is open"></section><div id="dmini"></div><div class="m-bar m-mat" id="bar"></div>`;
    const mode = S.bar.mode;
    const dtop = $("#dtop"), card = $("#card");
    dtop.hidden = false;
    if (mode === "find") dtop.innerHTML = findsHtml();
    else if (mode === "naming") dtop.innerHTML = suggestHtml();
    else if (S.reply && !S.chat) dtop.innerHTML = replyHtml(S.reply);
    else { dtop.innerHTML = ""; dtop.hidden = true; }
    const showCard = S.dest === "loci" && mode !== "find" && mode !== "naming" && !S.chat;
    card.hidden = !showCard;
    if (showCard) paintCard();
    const mk = $("#dmake");
    mk.hidden = !(S.making && S.dest !== "loci" && !S.chat);
    if (!mk.hidden) mk.innerHTML = makingHtml();
    const mini = $("#dmini");
    mini.hidden = !(S.player && S.player.mode === "mini") || mode === "find" || mode === "naming";
    if (!mini.hidden) mini.innerHTML = miniHtml();
    paintBarState();
  }
  function coveredBottom() {
    const dock = $("#dock"); if (!dock) return 0;
    // What the card and the bar cover, so the Palace and the Map frame what is open above them.
    const card = $("#card"), cardH = card && !card.hidden ? targetHeight(S.detent === "full" ? "card" : S.detent) : 0;
    return Math.round(dock.offsetHeight - (card && !card.hidden ? card.offsetHeight : 0) + cardH);
  }

  /* ---------- the card ---------- */
  function cardModel() {
    const id = S.openId;
    if (!id) {
      const areas = kids(null), learned = S.topics.filter((t) => t.status === "learned").length;
      return {
        kind: "home", kicker: "Loci", title: "Your whole map",
        meta: `${plural(areas.length, "area")} · ${plural(S.topics.length - areas.length, "topic")} · ${learned} learned`,
        acts: [["add", "plus", "Area"], ["focus", "target", "Focus"], ["ask", "spark", "Ask"], ["more", "more", "More"]],
        rail: areas.map((a) => ({ id: a.id, name: a.name, cls: STATUS[a.status].cls, n: descendants(a.id).length })),
      };
    }
    const ref = LP.parseExtraId(id);
    if (ref?.kind === "stack") {
      const area = T.get(ref.areaId), room = roomOf(ref.areaId), cp = ref.which === "commonplace";
      return { kind: "stack", which: ref.which, areaId: ref.areaId, kicker: `${cp ? "Commonplace" : "Lumens"} in ${area.name}`, title: cp ? "Commonplace" : "Lumens", meta: cp ? plural(room.itemTotal, "item") : plural(room.lumenTotal, "Lumen"), acts: cp ? [["capture", "plus", "Capture"], ["lumen", "spark", "Lumen"], ["ask", "chat", "Ask"], ["more", "more", "More"]] : [["lumen", "spark", "New"], ["playall", "play", "Play"], ["ask", "chat", "Ask"], ["more", "more", "More"]], rail: [] };
    }
    const t = T.get(id), area = !t.parentId, parent = T.get(t.parentId);
    const ch = kids(id), its = itemsOn(id), ls = lumensOn(id);
    const sub = parent && parent.parentId;
    return {
      kind: area ? "area" : "topic", t,
      kicker: area ? `Area · ${plural(descendants(id).length, "topic")}` : `${sub ? "Sub-topic" : "Topic"} in ${parent.name}`,
      title: t.name, status: t.status,
      meta: [ch.length ? plural(ch.length, area ? "topic" : "sub-topic") : area ? "No topics yet" : "No sub-topics yet", its.length ? `${its.length} in Commonplace` : "", ls.length ? plural(ls.length, "Lumen") : ""].filter(Boolean).join(" · "),
      acts: [["add", "plus", area ? "Topic" : "Sub-topic"], ls.length && !S.making ? ["play", "play", "Play"] : ["lumen", "spark", "Lumen"], ["ask", "chat", "Ask"], ["more", "more", "More"]],
      rail: ch.map((k) => ({ id: k.id, name: k.name, cls: STATUS[k.status].cls, n: kids(k.id).length, focus: k.wantToLearn })),
      ghosts: S.ghosts.filter((g) => g.parentId === id),
      its, ls,
    };
  }
  function paintCard() {
    const card = $("#card"), m = cardModel();
    const making = S.making && (S.making.topicId === S.openId || (m.kind === "area" && areaOf(S.making.topicId) === S.openId));
    const rail = m.kind === "stack" ? "" : `<div class="m-rail" role="list" aria-label="${m.kind === "home" ? "Areas" : "Inside"}">
        ${m.rail.map((r) => `<button class="m-chip" role="listitem" type="button" data-open="${r.id}"><i class="m-sd ${r.cls}${r.focus ? " focus" : ""}"></i>${esc(r.name)}${r.n ? `<span class="m-cnt">${r.n}</span>` : ""}</button>`).join("")}
        ${(m.ghosts || []).map((g) => `<button class="m-chip is-ghost" type="button" data-ghost="${g.itemId}">${ic("plus", "xs")}${esc(g.name)}</button>`).join("")}
        ${m.kind === "topic" || m.kind === "area" ? (m.rail.length || m.ghosts.length ? `<button class="m-chip is-add" type="button" data-act="add">${ic("plus", "xs")}Add</button>` : `<button class="m-chip is-add" type="button" data-act="suggest">${ic("spark", "xs")}Suggest ${m.kind === "area" ? "topics" : "sub-topics"}</button><button class="m-chip is-add" type="button" data-act="add">${ic("plus", "xs")}Add your own</button>`) : ""}
      </div>`;
    card.dataset.detent = S.detent;
    card.innerHTML = `<div class="m-grab" data-drag="card"></div>
      <div class="m-card-body" id="cardBody">
        <div class="m-card-head" data-drag="card">
          <div class="m-names"><div class="m-kicker">${esc(m.kicker)}</div><h2>${esc(m.title)}</h2></div>
          ${S.openId ? `<button class="m-close" type="button" data-act="back" aria-label="Close and go back">${ic("x", "xs")}</button>` : ""}
        </div>
        <div class="m-meta">${m.status && m.kind === "topic" ? `<button class="m-status-pill" type="button" data-act="status" aria-label="Status: ${STATUS[m.status].label}. Change"><i class="m-sd ${STATUS[m.status].cls}"></i>${STATUS[m.status].label}</button>` : ""}<span>${esc(m.meta)}</span></div>
        ${making ? makingHtml() : ""}
        <div class="m-acts">${m.acts.map(([act, icon, label], i) => `<button class="m-act${i === 0 && m.kind !== "home" ? "" : ""}" type="button" data-act="${act}">${ic(icon)}${label}</button>`).join("")}</div>
        ${rail}
        <div class="m-more">${moreHtml(m)}</div>
      </div>`;
    card.style.height = `${targetHeight(S.detent)}px`;
  }
  function moreHtml(m) {
    if (m.kind === "home") {
      const focus = S.topics.filter((t) => t.wantToLearn);
      return `<div class="m-sec"><h3>My Focus</h3><div class="m-rows">${focus.map(rowTopic).join("")}</div>
        <h3>Recently opened</h3><div class="m-rows">${S.recents.filter((r) => r.kind === "topic").map((r) => rowTopic(T.get(r.id))).join("") || `<div class="m-row"><span class="m-txt"><small>Places you open show here.</small></span></div>`}</div></div>`;
    }
    if (m.kind === "stack") {
      const room = roomOf(m.areaId);
      return `<div class="m-sec"><div class="m-rows">${m.which === "commonplace" ? room.items.map((x) => rowItem(S.items.find((i) => i.id === x.id))).join("") : room.lumens.map((l) => rowLumen(S.lumens.find((x) => x.id === l.id))).join("")}</div></div>`;
    }
    const t = m.t;
    return `<div class="m-sec">
      <h3>Status</h3>
      <div class="m-seg" role="group" aria-label="Status">${Object.entries(STATUS).map(([k, s]) => `<button type="button" data-status="${k}" aria-pressed="${t.status === k}"><i class="m-sd ${s.cls}"></i>${s.label}</button>`).join("")}</div>
      ${m.rail.length ? `<h3>${m.kind === "area" ? "Topics" : "Sub-topics"} <button type="button" data-act="add">Add</button></h3><div class="m-rows">${kids(t.id).map(rowTopic).join("")}</div>` : ""}
      <h3>Lumens <button type="button" data-act="lumen">Make one</button></h3>
      ${m.ls.length ? `<div class="m-rows">${m.ls.map(rowLumen).join("")}</div>` : `<div class="m-rows"><button class="m-row" type="button" data-act="lumen"><span class="m-fmt m-thumb">${ic("spark", "sm")}</span><span class="m-txt"><b>Make a Lumen about ${esc(t.name)}</b><small>Watch, Listen or Read, made for you</small></span></button></div>`}
      ${m.its.length ? `<h3>In Commonplace <button type="button" data-act="seeall">See all</button></h3><div class="m-pics">${m.its.map(picItem).join("")}</div>` : ""}
    </div>`;
  }
  const rowTopic = (t) => `<button class="m-row" type="button" data-open="${t.id}"><i class="m-sd ${STATUS[t.status].cls}${t.wantToLearn ? " focus" : ""}"></i><span class="m-txt"><b>${esc(t.name)}</b><small>${t.parentId ? esc(T.get(t.parentId).name) : "Area"}${kids(t.id).length ? ` · ${plural(kids(t.id).length, "sub-topic")}` : ""}</small></span>${ic("right", "sm m-chev")}</button>`;
  const rowLumen = (l) => `<div class="m-row m-lumen-row"><span class="m-fmt ${l.format}">${ic(FMT[l.format].ic, "sm")}</span><span class="m-txt"><b>${esc(l.title)}</b><small>${FMT[l.format].label} · ${l.min} min${l.progress >= 1 ? " · Finished" : l.progress > 0 ? ` · ${Math.round(l.progress * 100)}%` : ""}</small></span><button class="m-play" type="button" data-play="${l.id}" aria-label="Play ${esc(l.title)}">${ic("play", "xs")}</button></div>`;
  const rowItem = (x) => `<button class="m-row" type="button" data-item="${x.id}">${x.img ? `<img class="m-thumb" alt="" src="${D.IMG[x.img]}">` : `<span class="m-thumb">${x.kind}</span>`}<span class="m-txt"><b>${esc(x.title)}</b><small>${x.kind} · on ${esc(x.topics.map((t) => T.get(t)?.name).join(", "))}</small></span></button>`;
  const picItem = (x) => `<button class="m-pic" type="button" data-item="${x.id}">${x.img ? `<img class="m-im" alt="" src="${D.IMG[x.img]}">` : `<span class="m-im">${esc(x.title)}</span>`}<small>${x.kind}</small></button>`;
  function makingHtml() {
    const m = S.making;
    return `<div class="m-making" role="status">${ic(FMT[m.format].ic, "sm")}<span>Making <b>${FMT[m.format].label}</b></span><span class="m-bar-p"><i style="width:${Math.round(m.progress * 100)}%"></i></span><span>${m.progress < 1 ? `${Math.max(1, Math.round((1 - m.progress) * 6))} s` : "Ready"}</span></div>`;
  }

  /* card heights: peek (its name), card (name, actions, what is inside), full (everything) */
  function targetHeight(detent) {
    const card = $("#card"), body = $("#cardBody");
    if (!card || !body) return 0;
    const head = $(".m-card-head", body), rail = $(".m-rail", body), acts = $(".m-acts", body);
    if (detent === "peek") return head.offsetTop + head.offsetHeight + 14;
    const last = rail || acts;
    const cardH = last.offsetTop + last.offsetHeight + (rail ? 0 : 16);
    if (detent === "card") return cardH;
    const avail = app.clientHeight - parseFloat(getComputedStyle($("#tb")).height) - ($("#bar").offsetHeight + 8) - ($("#dmini").hidden ? 0 : $("#dmini").offsetHeight + 8) - ($("#dtop").hidden ? 0 : $("#dtop").offsetHeight + 8) - sab() - 24;
    return Math.max(cardH, Math.min(avail, body.scrollHeight));
  }
  const sab = () => parseFloat(getComputedStyle($("#dock")).paddingBottom) || 8;
  function setDetent(d) {
    S.detent = d;
    const card = $("#card"); if (!card || card.hidden) return;
    card.dataset.detent = d;
    if (d !== "full") $("#cardBody").scrollTop = 0;
    card.style.height = `${targetHeight(d)}px`;
    const settle = () => { engine?.setView(viewOf()); if (mapMounted) LociAppMap.update({ coveredBottom: coveredBottom() }); };
    reduced() ? settle() : setTimeout(settle, 120);
  }

  /* ---------- the bar ---------- */
  function placeholder() {
    if (S.bar.mode === "naming") return S.bar.parent ? "Name a sub-topic" : "Name an area";
    if (S.bar.mode === "capture") return `${S.bar.capture === "link" ? "Paste a link" : "Write a note"}…`;
    if (S.dest === "loci") return S.openId && T.has(S.openId) ? `Ask about ${T.get(S.openId).name}…` : "Find a place or ask Loci…";
    return { today: "Ask about your day…", learn: "What do you want to learn?", commonplace: "Capture, find or ask…" }[S.dest];
  }
  function paintBar() {
    const bar = $("#bar") || (paintDock(), $("#bar"));
    bar.innerHTML = `<button class="m-round m-plus" type="button" data-act="plus" aria-label="Create" aria-haspopup="menu" aria-expanded="false">${ic("plus")}</button>
      <label class="m-field"><span class="m-wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="m-parent" id="barParent" hidden></span><input id="barInput" type="text" enterkeyhint="send" autocomplete="off" autocapitalize="sentences" aria-label="Ask Loci"></label>
      <button class="m-round m-mic" type="button" id="mic" aria-label="Dictate. Hold to talk">${ic("mic")}</button>
      <button class="m-round m-send" type="button" id="send" aria-label="Send" hidden>${ic("up")}</button>`;
    const input = $("#barInput");
    input.addEventListener("focus", () => { if (S.bar.mode === "idle") { S.bar.mode = "find"; paintDock(); } });
    input.addEventListener("blur", () => setTimeout(() => {
      if (document.activeElement === input || S.bar.listening) return;
      if (S.bar.mode === "find" && !input.value.trim()) { S.bar.mode = "idle"; paintDock(); }
    }, 180));
    input.addEventListener("input", () => { if (S.bar.mode === "find") $("#dtop").innerHTML = findsHtml(); paintBarState(); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); submitBar(); }
      if (e.key === "Escape") { e.stopPropagation(); input.value = ""; endBarMode(); input.blur(); }
    });
    micButton($("#mic"));
    paintBarState();
  }
  function paintBarState() {
    const bar = $("#bar"), input = $("#barInput"); if (!bar || !input) return;
    const has = !!input.value.trim(), b = S.bar;
    bar.classList.toggle("is-listening", b.listening);
    bar.classList.toggle("is-naming", b.mode === "naming" || b.mode === "capture");
    input.placeholder = b.listening ? "Listening…" : placeholder();
    $("#send").hidden = !(has && !b.listening);
    $("#mic").hidden = has && !b.listening;
    const par = $("#barParent");
    const chip = b.mode === "naming" ? (b.parent ? `${T.get(b.parent).name}` : "New area") : b.mode === "capture" ? `${b.capture === "link" ? "Link" : "Note"} → ${S.openId && T.has(S.openId) ? T.get(S.openId).name : "Commonplace"}` : "";
    par.hidden = !chip; par.textContent = chip;
    const plus = $(".m-plus", bar);
    const exiting = b.mode === "naming" || b.mode === "capture" || b.listening;
    plus.innerHTML = ic(exiting ? "x" : "plus");
    plus.setAttribute("aria-label", exiting ? (b.listening ? "Stop without sending" : "Done") : "Create");
    plus.dataset.act = exiting ? "barx" : "plus";
  }
  function endBarMode() {
    if (S.bar.listening) stopListening(true);
    const wasNaming = S.bar.mode === "naming";
    S.bar.mode = "idle"; S.bar.capture = null; S.bar.draftOn = false;
    const input = $("#barInput"); if (input) input.value = "";
    if (wasNaming && S.bar.parent && S.dest === "loci" && T.has(S.bar.parent) && S.openId !== S.bar.parent) openThing(S.bar.parent);
    S.bar.parent = null;
    refresh();
  }
  function submitBar() {
    const input = $("#barInput"), text = input.value.trim(); if (!text) return;
    if (S.bar.mode === "naming") { addTopic(text); input.value = ""; paintBarState(); return; }
    if (S.bar.mode === "capture") { captureNote(text); input.value = ""; return; }
    const first = S.bar.mode === "find" ? findHits(text)[0] : null;
    input.value = ""; input.blur(); S.bar.mode = "idle";
    if (first && first.name.toLowerCase() === text.toLowerCase()) { goTo(first.id); refresh(); return; }
    askLoci(text);
  }

  /* typing finds places first, then asks Loci */
  function findHits(q) {
    q = q.trim().toLowerCase(); if (!q) return [];
    const pre = S.topics.filter((t) => t.name.toLowerCase().startsWith(q));
    const inn = S.topics.filter((t) => !pre.includes(t) && t.name.toLowerCase().includes(q));
    const words = S.topics.filter((t) => !pre.includes(t) && !inn.includes(t) && q.length > 3 && q.split(/\s+/).some((w) => w.length > 3 && t.name.toLowerCase().includes(w)));
    return [...pre, ...inn, ...words].slice(0, 4);
  }
  function findsHtml() {
    const q = $("#barInput")?.value.trim() || "";
    if (!q) {
      const sug = S.dest === "loci" && T.has(S.openId) ? [`Suggest sub-topics for ${T.get(S.openId).name}`, `Make a Lumen about ${T.get(S.openId).name}`, "What should I learn next?"] : ["What should I learn next?", "Open Daylight & shading", "Make a Lumen about passive design"];
      const rec = S.recents.filter((r) => r.kind === "topic" && T.has(r.id)).slice(0, 3);
      return `<div class="m-finds">${rec.length ? `<div class="m-head">Recent</div>${rec.map((r) => findRow(T.get(r.id))).join("")}` : ""}<div class="m-head">Ask Loci</div>${sug.map((s) => `<button type="button" data-ask="${esc(s)}">${ic("spark", "sm")}<span class="m-txt"><b class="m-ask">${esc(s)}</b></span></button>`).join("")}</div>`;
    }
    const hits = findHits(q);
    return `<div class="m-finds">${hits.map((t, i) => findRow(t, i === 0)).join("")}<button type="button" data-ask="${esc(q)}">${ic("spark", "sm")}<span class="m-txt"><b class="m-ask">Ask Loci “${esc(q)}”</b></span>${ic("up", "sm")}</button></div>`;
  }
  const findRow = (t, first) => `<button type="button" class="${first ? "is-first" : ""}" data-go="${t.id}"><i class="m-sd ${STATUS[t.status].cls}"></i><span class="m-txt"><b>${esc(t.name)}</b><small>${t.parentId ? esc(T.get(t.parentId).name) : "Area"}</small></span>${ic("right", "sm m-chev")}</button>`;
  function goTo(id) {
    if (S.dest !== "loci") { S.dest = "loci"; render(); }
    // A jump opens the place's own trail (its area, then it), so Back climbs the tree.
    const chain = []; let t = T.get(id); while (t) { chain.unshift(t.id); t = T.get(t.parentId); }
    S.trail = chain.slice(0, -1); S.openId = null;
    openThing(id);
  }

  /* ---------- the mic: tap to dictate, hold to talk ---------- */
  let session = null, pressAt = 0, pressTimer = null;
  function micButton(btn) {
    btn.addEventListener("pointerdown", (e) => {
      if (S.bar.listening) return;
      e.preventDefault();
      pressAt = performance.now();
      pressTimer = setTimeout(() => { S.bar.ptt = true; startListening($("#barInput")); }, 280);
    });
    const release = () => {
      if (!pressAt) return;
      clearTimeout(pressTimer);
      const held = performance.now() - pressAt; pressAt = 0;
      if (S.bar.ptt) { S.bar.ptt = false; stopListening(false).then((text) => { if (text) submitBar(); }); return; }
      if (held < 280) { S.bar.listening ? stopListening(false) : startListening($("#barInput")); }
    };
    btn.addEventListener("pointerup", release);
    btn.addEventListener("pointercancel", release);
    btn.addEventListener("pointerleave", () => { if (pressAt && !S.bar.ptt) clearTimeout(pressTimer); });
    btn.addEventListener("click", (e) => e.preventDefault());
    btn.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); S.bar.listening ? stopListening(false) : startListening($("#barInput")); } });
  }
  function phraseFor() {
    if (S.bar.mode === "naming") return (D.SUGGEST[T.get(S.bar.parent)?.name] || ["Glare control"]).find((n) => !kids(S.bar.parent).some((k) => k.name === n)) || "Case studies";
    if (S.dest === "loci" && T.has(S.openId)) return kids(S.openId).length ? `Make me a Lumen about ${T.get(S.openId).name}` : `Suggest sub-topics for ${T.get(S.openId).name}`;
    if (S.dest === "loci") return "Open daylight and shading";
    return { today: "What should I learn next?", learn: "Explain how a wind tower cools a courtyard", commonplace: "Show me photos about shading" }[S.dest];
  }
  function startListening(input, phrase) {
    if (session) return;
    const before = input.value ? input.value.replace(/\s*$/, " ") : "";
    S.bar.listening = input.id === "barInput";
    if (S.bar.listening && S.bar.mode === "idle") S.bar.mode = "listen";
    input.closest(".m-ask-field")?.classList.add("is-listening");
    paintBarState();
    const begin = () => window.Dictation.start({
      phrase: phrase || phraseFor(),
      onText: (t) => { input.value = before + t; paintBarState(); if (S.bar.mode === "find") $("#dtop").innerHTML = findsHtml(); },
      onState: () => {},
      onError: () => {
        // No microphone here (or permission refused): show the simulation instead, and say so once.
        session = null;
        if (window.Dictation.choice() !== "simulated") { window.Dictation.setChoice("simulated"); toast("No microphone here, so the mic is simulated."); session = begin(); }
      },
      onEnd: () => { if (session) stopListening(false); },
    });
    session = begin();
  }
  async function stopListening(cancel) {
    const s = session; session = null;
    S.bar.listening = false;
    if (S.bar.mode === "listen") S.bar.mode = "idle";
    $$(".m-ask-field").forEach((f) => f.classList.remove("is-listening"));
    let text = "";
    if (s) { if (cancel) s.cancel(); else text = await s.stop(); }
    const input = $("#barInput");
    if (cancel && input) input.value = "";
    paintBarState();
    return (input?.value || "").trim();
  }

  /* ---------- naming: add sub-topics one after another, with Loci's suggestions a tap away ---------- */
  function startNaming(parentId) {
    if (S.dest !== "loci") { S.dest = "loci"; render(); }
    if (parentId && S.openId !== parentId && T.has(parentId)) openThing(parentId);
    S.bar.mode = "naming"; S.bar.parent = parentId; S.bar.draftOn = true;
    refresh();
    const input = $("#barInput"); input.value = ""; input.focus();
    paintBarState();
  }
  function suggestHtml() {
    const p = S.bar.parent, name = p ? T.get(p).name : null;
    const have = new Set(kids(p).map((k) => k.name.toLowerCase()));
    const sug = (D.SUGGEST[name] || (p ? [`${name} basics`, `${name} case studies`, `${name} in hot climates`] : ["Acoustics", "Urban climate"])).filter((s) => !have.has(s.toLowerCase()));
    return `<div class="m-suggest" role="group" aria-label="Loci suggests">
      ${sug.length ? `<span class="m-lab">${ic("spark", "xs")}Loci suggests</span>` : `<span class="m-lab">Return adds it and keeps the field open</span>`}
      ${sug.map((s) => `<button class="m-chip is-ghost" type="button" data-addname="${esc(s)}">${ic("plus", "xs")}${esc(s)}</button>`).join("")}
      <button class="m-chip is-done" type="button" data-act="barx">${ic("check", "xs")}Done</button></div>`;
  }
  function addTopic(name, parentId = S.bar.parent) {
    const id = nextId("t");
    S.topics.push({ id, parentId, name, description: "", status: "not_started", wantToLearn: false, sortOrder: S.topics.length, version: 1 });
    reindex();
    engine?.adopt(new Map([[`draft:${parentId ?? "root"}`, id]]));
    scene = LP.buildScene(graph());
    engine?.setScene(scene);
    S.pop = new Set([id]);
    // A fresh draft for the next name, in a new place.
    S.bar.draftOn = false; refresh();
    requestAnimationFrame(() => { if (S.bar.mode === "naming") { S.bar.draftOn = true; refresh(); } });
    toast(`Added “${name}”`, "Undo", () => removeTopic(id));
    return id;
  }
  function removeTopic(id) {
    S.topics = S.topics.filter((t) => t.id !== id && !descendants(id).includes(t.id));
    reindex(); scene = LP.buildScene(graph()); engine?.setScene(scene);
    if (S.openId === id) goBack(); else refresh();
  }

  /* ---------- Loci's suggestions on the map (ghosts): Keep or Dismiss, one at a time or all ---------- */
  function suggestUnder(parentId, names) {
    const t = T.get(parentId);
    const have = new Set(kids(parentId).map((k) => k.name.toLowerCase()));
    const list = (names || D.SUGGEST[t.name] || [`${t.name} basics`, `${t.name} case studies`, `${t.name} in practice`]).filter((n) => !have.has(n.toLowerCase())).slice(0, 4);
    const proposalId = nextId("p");
    S.ghosts = S.ghosts.filter((g) => g.parentId !== parentId).concat(list.map((name) => ({ itemId: nextId("g"), proposalId, parentId, name })));
    return list;
  }
  function keepGhost(itemId) {
    const g = S.ghosts.find((x) => x.itemId === itemId); if (!g) return;
    const id = nextId("t");
    S.topics.push({ id, parentId: g.parentId, name: g.name, description: "", status: "not_started", wantToLearn: false, sortOrder: S.topics.length, version: 1 });
    S.ghosts = S.ghosts.filter((x) => x !== g);
    reindex();
    engine?.adopt(new Map([[`ghost:${itemId}`, id]]));
    scene = LP.buildScene(graph()); engine?.setScene(scene);
    S.pop = new Set([id]);
    refresh();
    return id;
  }
  function keepAll(parentId) {
    const gs = S.ghosts.filter((g) => !parentId || g.parentId === parentId);
    gs.forEach((g) => keepGhost(g.itemId));
    S.reply = null;
    toast(`Kept ${plural(gs.length, "sub-topic")}`);
    refresh();
  }
  function dismissGhost(itemId) { S.ghosts = S.ghosts.filter((g) => g.itemId !== itemId); refresh(); }
  function ghostMenu(itemId) {
    const g = S.ghosts.find((x) => x.itemId === itemId); if (!g) return;
    menu(lastPoint, `<div class="m-menu-head"><b>${esc(g.name)}</b><small>Suggested under ${esc(T.get(g.parentId).name)}</small></div>
      <button type="button" data-m="keep">Keep${ic("check", "sm")}</button><button type="button" data-m="dismiss">Dismiss${ic("x", "sm")}</button>`,
    { keep: () => { keepGhost(itemId); toast(`Kept “${g.name}”`); }, dismiss: () => dismissGhost(itemId) }, true);
  }

  /* ---------- Loci (simulated): one conversation that follows you; replies float above the bar ---------- */
  function askLoci(text) {
    const place = S.dest === "loci" ? (T.has(S.openId) ? S.openId : null) : null;
    const where = place ? T.get(place).name : S.dest === "loci" ? "Your whole map" : DEST[S.dest].label;
    if (S.lastPlace !== where) { S.thread.push({ divider: `Now in ${where}` }); S.lastPlace = where; }
    S.thread.push({ me: true, text });
    S.reply = { text: "…", acts: [], thinking: true };
    paintDock(); paintChat();
    setTimeout(() => answer(text, place), reduced() ? 50 : 650);
  }
  function answer(text, place) {
    const q = text.toLowerCase();
    const named = S.topics.filter((t) => q.includes(t.name.toLowerCase().replace(/ & /g, " and ")) || q.includes(t.name.toLowerCase())).sort((a, b) => b.name.length - a.name.length)[0];
    const target = named?.id || place;
    let reply;
    if (/\b(open|go to|show me|take me to|jump to)\b/.test(q) && named) {
      goTo(named.id);
      reply = { text: `Here’s ${named.name}${named.parentId ? `, in ${T.get(named.parentId).name}` : ""}.`, acts: [] };
    } else if (/\b(add|suggest|sub-?topics?|ideas|break (it|this) down)\b/.test(q) && target) {
      const m = q.match(/\badd (?:sub-?topics? (?:on|for|about) )?(.+)$/);
      const names = m && !/sub-?topics?|some|more|ideas/.test(m[1]) ? m[1].split(/,| and /).map((s) => s.trim()).filter(Boolean).map((s) => s[0].toUpperCase() + s.slice(1)) : null;
      if (S.dest !== "loci") { S.dest = "loci"; render(); }
      if (S.openId !== target) goTo(target);
      const list = suggestUnder(target, names);
      reply = { text: `I’ve drafted ${plural(list.length, "sub-topic")} under ${T.get(target).name}: ${list.join(", ")}. They’re dashed on the map; keep the ones you want.`, acts: [["keepall", "Keep all", target], ["review", "Review"]] };
    } else if (/\b(lumen|explain|teach me|watch|listen|read|course)\b/.test(q)) {
      const fmt = /\bwatch|video|slides\b/.test(q) ? "watch" : /\bread\b/.test(q) ? "read" : "listen";
      reply = { text: target ? `Here’s a Lumen about ${T.get(target).name}, ready to make. Change the question or the format, then Make.` : "Here’s a Lumen, ready to make.", acts: [] };
      setTimeout(() => openLumenSheet({ topicId: target, question: text, format: fmt }), 250);
    } else if (/\b(learned|learning|not started)\b/.test(q) && target) {
      const st = /not started/.test(q) ? "not_started" : /learned/.test(q) ? "learned" : "learning";
      setStatus(target, st);
      reply = { text: `Marked ${T.get(target).name} as ${STATUS[st].label.toLowerCase()}.`, acts: [] };
    } else if (/what should i (learn|do|study)|next/.test(q)) {
      const f = S.topics.filter((t) => t.wantToLearn && t.status !== "learned");
      const bare = f.find((t) => !kids(t.id).length);
      reply = { text: `${f.map((t) => t.name).join(" and ")} ${f.length === 1 ? "is" : "are"} in your Focus and not finished.${bare ? ` ${bare.name} has no sub-topics yet: shall I break it down?` : ""}`, acts: [...(bare ? [["suggest", "Break it down", bare.id]] : []), ...f.filter((t) => t.id !== S.openId).map((t) => ["open", `Open ${t.name}`, t.id])] };
    } else {
      const n = target ? T.get(target).name : "your map";
      reply = { text: `Short answer about ${n}: it’s worth seeing three examples side by side before the rules. I can make that a Lumen, or add the examples as sub-topics.`, acts: target ? [["lumen", "Make a Lumen", target], ["suggest", "Suggest sub-topics", target]] : [] };
    }
    S.thread.push({ text: reply.text, acts: reply.acts });
    S.reply = reply;
    if (!reply.acts.length) setTimeout(() => { if (S.reply === reply) { S.reply = null; refresh(); } }, 5000);
    refresh(); paintChat();
  }
  function hideReplyIfStale() { if (S.reply && !S.reply.acts?.length && !S.reply.thinking) S.reply = null; }
  function replyHtml(r) {
    return `<div class="m-reply" role="status"><div class="m-reply-top"><span class="m-avatar">${ic("spark", "xs")}</span>
      <p data-act="chat">${r.thinking ? `<span style="color:var(--ink-3)">Loci is thinking…</span>` : esc(r.text)}</p>
      <button class="m-x" type="button" data-act="replyx" aria-label="Dismiss">${ic("x", "xs")}</button></div>
      ${r.acts?.length ? `<div class="m-reply-acts">${r.acts.map(([a, l, id], i) => `<button class="m-btn${i === 0 ? " is-primary" : ""}" type="button" data-reply="${a}" data-id="${id ?? ""}">${esc(l)}</button>`).join("")}<button class="m-btn" type="button" data-act="chat">Thread</button></div>` : ""}</div>`;
  }
  function paintChat() {
    const el = $("#chat");
    el.classList.toggle("is-open", S.chat); el.setAttribute("aria-hidden", String(!S.chat));
    if (!S.chat) return;
    el.innerHTML = `<div class="m-grab" data-drag="chat"></div><div class="m-sheet-head" data-drag="chat"><span class="m-avatar">${ic("spark", "xs")}</span><h2>Loci</h2><small>${esc(S.lastPlace || "")}</small><button class="m-ib" type="button" data-act="chatx" aria-label="Close">${ic("down")}</button></div>
      <div class="m-thread" id="thread">${S.thread.length ? S.thread.map((m) => m.divider ? `<div class="m-divider">${esc(m.divider)}</div>` : `<div class="m-msg ${m.me ? "me" : "loci"}">${esc(m.text)}${m.acts?.length ? `<div class="m-reply-acts">${m.acts.map(([a, l, id], i) => `<button class="m-btn${i === 0 ? " is-primary" : ""}" type="button" data-reply="${a}" data-id="${id ?? ""}">${esc(l)}</button>`).join("")}</div>` : ""}</div>`).join("") : `<div class="m-divider">One conversation, wherever you are</div>`}</div>`;
    const th = $("#thread"); th.scrollTop = th.scrollHeight;
  }

  /* ---------- status ---------- */
  function setStatus(id, st) {
    const t = T.get(id); if (!t) return;
    t.status = st; scene = LP.buildScene(graph()); engine?.setScene(scene); refresh();
  }

  /* ---------- Make a Lumen ---------- */
  function openLumenSheet({ topicId = S.openId && T.has(S.openId) ? S.openId : null, question, format = "listen" } = {}) {
    const name = topicId ? T.get(topicId).name : null;
    let fmt = format;
    sheet(`<div class="m-grab" data-drag="sheet"></div><div class="m-sheet-head" data-drag="sheet"><h2>Make a Lumen</h2><button class="m-ib" type="button" data-act="sheetx" aria-label="Close">${ic("x")}</button></div>
      <div class="m-sheet-body">
        ${name ? `<span class="m-about">${ic("network", "xs")}About ${esc(name)}</span>` : ""}
        <div class="m-formats" role="group" aria-label="Format">${Object.entries(FMT).map(([k, f]) => `<button class="m-format" type="button" data-fmt="${k}" aria-pressed="${k === fmt}">${ic(f.ic)}<b>${f.label}</b><small>${f.what} · ~${f.len} min</small></button>`).join("")}</div>
        <div class="m-ask-field"><textarea id="lq" rows="3" aria-label="Your question">${esc(question || (name ? `Explain ${name.toLowerCase()} for a hot, sunny site, with examples I can draw from.` : ""))}</textarea><button class="m-round" type="button" id="lmic" aria-label="Dictate">${ic("mic", "sm")}</button></div>
        <button class="m-btn is-primary is-big" type="button" id="lmake">Make Lumen</button>
        <p class="m-fine">It’s made in the background. Keep exploring; it lands on ${esc(name || "your map")} when it’s ready.</p>
      </div>`, (el) => {
      $$("[data-fmt]", el).forEach((b) => b.addEventListener("click", () => { fmt = b.dataset.fmt; $$("[data-fmt]", el).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }));
      $("#lmic", el).addEventListener("click", () => session ? stopListening(false) : startListening($("#lq", el), name ? `How does ${name.toLowerCase()} change for a deep plan office?` : "How do courtyards cool a house?"));
      $("#lmake", el).addEventListener("click", () => { if (session) stopListening(false); closeSheet(); makeLumen(topicId, fmt, $("#lq", el).value.trim()); });
    });
  }
  function makeLumen(topicId, format, question) {
    const name = topicId ? T.get(topicId).name : "Your question";
    const title = { listen: `${name}, talked through`, watch: `${name} in six slides`, read: `${name}: a long read` }[format];
    S.making = { id: nextId("l"), topicId, format, title, question, progress: 0 };
    if (topicId && S.dest === "loci" && S.openId !== topicId) openThing(topicId); else refresh();
    const t0 = performance.now(), dur = 6000;
    const tick = setInterval(() => {
      if (!S.making) return clearInterval(tick);
      S.making.progress = Math.min(1, (performance.now() - t0) / dur);
      $$(".m-making .m-bar-p i").forEach((i) => (i.style.width = `${Math.round(S.making.progress * 100)}%`));
      $$(".m-making > span:last-child").forEach((s) => (s.textContent = S.making.progress < 1 ? `${Math.max(1, Math.round((1 - S.making.progress) * 6))} s` : "Ready"));
      if (S.making.progress >= 1) {
        clearInterval(tick);
        const m = S.making; S.making = null;
        S.lumens.unshift({ id: m.id, title: m.title, format: m.format, min: FMT[m.format].len, topic: m.topicId || S.topics[0].id, progress: 0, state: "ready" });
        refresh();
        toast(`“${m.title}” is ready`, "Play", () => openPlayer(m.id));
      }
    }, 250);
  }

  /* ---------- the player: full screen, swiped down to the mini player above the bar ---------- */
  let playTick = null;
  function openPlayer(id) {
    const l = S.lumens.find((x) => x.id === id); if (!l) return;
    if (S.player?.id !== id) S.player = { id, pos: Math.round(l.progress * l.min * 60), playing: true, mode: "full" };
    else S.player.mode = "full";
    remember({ kind: "lumen", id });
    clearInterval(playTick);
    playTick = setInterval(() => { if (!S.player?.playing) return; S.player.pos = Math.min(S.player.pos + 1, l.min * 60); paintPlayerTime(); }, 1000);
    paintPlayer(); refresh();
  }
  function paintPlayer() {
    const el = $("#player"), p = S.player;
    const open = !!p && p.mode === "full";
    el.classList.toggle("is-open", open); el.setAttribute("aria-hidden", String(!open));
    if (!p) return;
    const l = S.lumens.find((x) => x.id === p.id), t = T.get(l.topic);
    el.innerHTML = `<div class="m-player-top" data-drag="player"><button type="button" data-act="mini" aria-label="Minimise">${ic("down")}</button><span class="m-grab-b"></span><button type="button" data-act="playmore" aria-label="More">${ic("more")}</button></div>
      <div class="m-art"><div class="m-hosts">${l.format === "listen" ? `<i class="is-talking">A</i><i>B</i>` : ""}</div><h3>${esc(l.title)}</h3><small>${FMT[l.format].label} · ${t ? esc(t.name) : ""}</small></div>
      <div class="m-switch" role="group" aria-label="Format">${Object.entries(FMT).map(([k, f]) => `<button type="button" aria-pressed="${k === l.format}" data-pfmt="${k}">${f.label}</button>`).join("")}<button type="button" class="live" data-act="live">Live</button></div>
      <div class="m-scrub"><div class="m-track"><i id="ptrack"></i></div><div class="m-times"><span id="ppos"></span><span id="plen"></span></div></div>
      <div class="m-transport"><button type="button" data-act="back15" aria-label="Back 15 seconds">${ic("back15")}</button><button type="button" class="m-pp" data-act="pp" aria-label="${p.playing ? "Pause" : "Play"}">${ic(p.playing ? "pause" : "play")}</button><button type="button" data-act="fwd15" aria-label="Forward 15 seconds">${ic("fwd15")}</button></div>
      <button class="m-player-ask" type="button" data-act="playask"><span>Ask the hosts about this…</span><span class="m-round">${ic("mic", "sm")}</span></button>`;
    paintPlayerTime();
  }
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  function paintPlayerTime() {
    const p = S.player; if (!p) return;
    const l = S.lumens.find((x) => x.id === p.id), len = l.min * 60;
    l.progress = p.pos / len;
    const w = `${(p.pos / len) * 100}%`;
    if ($("#ptrack")) { $("#ptrack").style.width = w; $("#ppos").textContent = mmss(p.pos); $("#plen").textContent = `-${mmss(len - p.pos)}`; }
    $$(".m-mini .m-prog i").forEach((i) => (i.style.width = w));
  }
  function miniHtml() {
    const p = S.player, l = S.lumens.find((x) => x.id === p.id);
    return `<div class="m-mini m-mat" role="group" aria-label="Now playing"><button class="m-cover" type="button" data-act="full" aria-label="Open player">${ic(FMT[l.format].ic, "sm")}</button><button class="m-txt" type="button" data-act="full"><b>${esc(l.title)}</b><small>${FMT[l.format].label} · ${mmss(p.pos)}</small></button>
      <button class="m-ib" type="button" data-act="pp" aria-label="${p.playing ? "Pause" : "Play"}">${ic(p.playing ? "pause" : "play", "sm")}</button><button class="m-ib" type="button" data-act="stop" aria-label="Stop">${ic("x", "sm")}</button><span class="m-prog"><i style="width:${(p.pos / (l.min * 60)) * 100}%"></i></span></div>`;
  }

  /* ---------- an item (from the Palace's Commonplace stack, the card or the wall) ---------- */
  function openItem(id) {
    const x = S.items.find((i) => i.id === id); if (!x) return;
    sheet(`<div class="m-grab" data-drag="sheet"></div><div class="m-sheet-head" data-drag="sheet"><h2>${esc(x.title)}</h2><button class="m-ib" type="button" data-act="sheetx" aria-label="Close">${ic("x")}</button></div>
      <div class="m-sheet-body">${x.img ? `<img alt="" src="${D.IMG[x.img]}" style="width:100%;border-radius:16px;display:block;margin-bottom:12px">` : x.kind === "Quote" ? `<p style="font:italic 22px/1.3 var(--read);margin:0 0 14px">${esc(x.title)}</p>` : ""}
        <span class="m-about">${x.kind} · on ${esc(x.topics.map((t) => T.get(t)?.name).join(", "))}</span>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><button class="m-btn is-primary is-big" type="button" data-sheet="lumen">${ic("spark", "sm")}Make a Lumen</button><button class="m-btn is-big" type="button" data-sheet="topic">${ic("network", "sm")}Show in Loci</button></div></div>`, (el) => {
      $('[data-sheet="lumen"]', el).addEventListener("click", () => { closeSheet(); openLumenSheet({ topicId: x.topics[0], question: `What can I learn from “${x.title}”?`, format: "watch" }); });
      $('[data-sheet="topic"]', el).addEventListener("click", () => { closeSheet(); goTo(x.topics[0]); });
    });
  }

  /* ---------- sheets, menus, toasts ---------- */
  let onSheetClose = null;
  function sheet(html, wire) {
    const el = $("#sheet"); el.innerHTML = html; wire?.(el);
    el.classList.add("is-open"); el.setAttribute("aria-hidden", "false");
    scrim(true, closeSheet);
  }
  function closeSheet() {
    if (session) stopListening(true);
    const el = $("#sheet"); el.classList.remove("is-open"); el.setAttribute("aria-hidden", "true"); el.style.transform = "";
    scrim(false); onSheetClose?.(); onSheetClose = null;
  }
  let scrimTap = null;
  function scrim(on, tap, clear) { const s = $("#scrim"); s.classList.toggle("is-on", on); s.classList.toggle("is-clear", !!clear); scrimTap = on ? tap : null; }
  $("#scrim").addEventListener("click", () => scrimTap?.());

  function menu(at, html, handlers, lift) {
    closeMenu();
    const pop = $("#pop");
    pop.innerHTML = `${lift ? `<div class="m-lift" data-m="close"></div>` : `<div class="m-lift" data-m="close" style="background:transparent;backdrop-filter:none;-webkit-backdrop-filter:none"></div>`}<div class="m-menu" role="menu">${html}</div>`;
    const m = $(".m-menu", pop), W = app.clientWidth, H = app.clientHeight;
    const w = m.offsetWidth, h = m.offsetHeight;
    let x = at.x - (at.align === "right" ? w : at.align === "center" ? w / 2 : 0), y = at.up ? at.y - h - 8 : at.y + 8;
    x = Math.max(8, Math.min(W - w - 8, x)); y = Math.max(8, Math.min(H - h - 8, y));
    m.style.left = `${x}px`; m.style.top = `${y}px`;
    m.style.setProperty("--ox", `${Math.max(0, Math.min(w, at.x - x))}px`); m.style.setProperty("--oy", `${Math.max(0, Math.min(h, at.y - y))}px`);
    pop.onclick = (e) => {
      const b = e.target.closest("[data-m]"); if (!b) return;
      const k = b.dataset.m;
      if (b.tagName === "LABEL") return;
      closeMenu(); if (k !== "close") handlers[k]?.();
    };
    pop.onchange = (e) => { const b = e.target.closest("[data-m]"); handlers[b?.dataset.m]?.(e.target.checked); };
    $("[role=menu] button", pop)?.focus({ preventScroll: true });
  }
  function closeMenu() { $("#pop").innerHTML = ""; $$('[aria-expanded="true"]').forEach((b) => b.setAttribute("aria-expanded", "false")); }
  const anchor = (el, opts = {}) => { const r = el.getBoundingClientRect(), a = app.getBoundingClientRect(); return { x: (opts.align === "right" ? r.right : opts.align === "center" ? r.left + r.width / 2 : r.left) - a.left, y: (opts.up ? r.top : r.bottom) - a.top, ...opts }; };

  function thingMenu(id, at) {
    const ref = LP.parseExtraId(id);
    if (ref?.kind === "ghost") return ghostMenu(ref.id);
    if (ref?.kind === "item") return openItem(ref.id);
    if (ref?.kind === "lumen") return openPlayer(ref.id);
    if (!T.has(id)) return;
    const t = T.get(id), area = !t.parentId;
    menu(at, `<div class="m-menu-head"><b>${esc(t.name)}</b><small>${area ? "Area" : `In ${esc(T.get(t.parentId).name)}`} · ${STATUS[t.status].label}</small></div>
      <button type="button" data-m="open">Open${ic("right", "sm")}</button>
      <button type="button" data-m="add">Add ${area ? "a topic" : "a sub-topic"}${ic("plus", "sm")}</button>
      <button type="button" data-m="lumen">Make a Lumen${ic("spark", "sm")}</button>
      <button type="button" data-m="ask">Ask Loci about it${ic("chat", "sm")}</button>
      <div class="m-sep"></div>
      ${Object.entries(STATUS).map(([k, s]) => `<button type="button" data-m="st-${k}">${s.label}${t.status === k ? ic("check", "sm") : `<i class="m-sd ${s.cls}" style="margin-left:auto"></i>`}</button>`).join("")}
      <div class="m-sep"></div>
      <button type="button" data-m="rename">Rename${ic("pencil", "sm")}</button><button type="button" data-m="move">Move…${ic("move", "sm")}</button><button type="button" class="is-danger" data-m="del">Delete${ic("trash", "sm")}</button>`, {
      open: () => goTo(id), add: () => startNaming(id), lumen: () => openLumenSheet({ topicId: id }),
      ask: () => { goTo(id); focusBar(); },
      "st-not_started": () => setStatus(id, "not_started"), "st-learning": () => setStatus(id, "learning"), "st-learned": () => setStatus(id, "learned"),
      rename: () => toast("Rename edits the name in place, as on the Map."), move: () => toast("Move opens the Map’s move dialog as a sheet."),
      del: () => confirmDelete(id),
    }, true);
  }
  function confirmDelete(id) {
    const t = T.get(id), n = descendants(id).length;
    sheet(`<div class="m-grab" data-drag="sheet"></div><div class="m-sheet-head"><h2>Delete ${esc(t.name)}?</h2></div><div class="m-sheet-body"><p style="margin:0 0 16px;color:var(--ink-2)">${n ? `Its ${plural(n, "sub-topic")} go with it. ` : ""}Items in Commonplace stay; they lose this tag.</p>
      <div style="display:grid;gap:8px"><button class="m-btn is-big" style="background:var(--warn);color:var(--on-accent)" type="button" id="cdel">Delete</button><button class="m-btn is-big" type="button" data-act="sheetx">Cancel</button></div></div>`, (el) => {
      $("#cdel", el).addEventListener("click", () => { closeSheet(); if (S.openId === id) goBack(); removeTopic(id); toast(`Deleted “${t.name}”`); });
    });
  }

  let toastT = null;
  function toast(text, action, fn) {
    const el = $("#toast");
    el.innerHTML = `<span>${esc(text)}</span>${action ? `<button type="button">${esc(action)}</button>` : ""}`;
    el.classList.add("is-on");
    if (action) $("button", el).onclick = () => { el.classList.remove("is-on"); fn(); };
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("is-on"), action ? 5200 : 2600);
  }
  function focusBar() { const i = $("#barInput"); i?.focus(); }

  /* ---------- capture (+ in the bar): a note or a link, filed in Commonplace on what is open ---------- */
  function captureNote(text) {
    const topic = S.openId && T.has(S.openId) ? S.openId : null;
    const isLink = S.bar.capture === "link" || /^https?:\/\//.test(text);
    S.items.unshift({ id: nextId("i"), title: text, kind: isLink ? "Link" : "Note", topics: topic ? [topic] : [S.topics.find((t) => t.wantToLearn).id] });
    endBarMode();
    toast(`Saved to Commonplace${topic ? ` · on ${T.get(topic).name}` : ""}`);
  }

  /* ---------- the List: the same selection, drawn as rows ---------- */
  function paintList(wrap) {
    if (!wrap) return;
    const id = isTopic(S.openId) ? S.openId : null;
    const rows = kids(id);
    wrap.innerHTML = `<div class="m-list">${id ? "" : `<h3>Your map</h3><p class="m-sub">${plural(kids(null).length, "area")} · tap to open, hold for actions</p>`}
      ${id ? `<h3>${esc(T.get(id).name)}</h3><p class="m-sub">${rows.length ? plural(rows.length, T.get(id).parentId ? "sub-topic" : "topic") : "Nothing inside yet"}</p>` : ""}
      <div class="m-rows">${rows.map(rowTopic).join("") || `<button class="m-row" type="button" data-act="add"><span class="m-txt"><b style="color:var(--accent)">Add the first one</b></span>${ic("plus", "sm")}</button>`}</div></div>`;
  }

  /* ---------- the other destinations: kept simple; the bar is the point ---------- */
  const DEST = { today: { label: "Today", ic: "sun" }, learn: { label: "Learn", ic: "grad" }, commonplace: { label: "Commonplace", ic: "library" }, loci: { label: "Loci", ic: "network" } };
  function pageHtml() {
    if (S.dest === "today") {
      const l = S.lumens.find((x) => x.progress > 0 && x.progress < 1);
      const focus = S.topics.filter((t) => t.wantToLearn);
      return `<div class="m-page"><h1>Good morning</h1><p class="m-lede">Sunday 25 October</p>
        <h2>Pick up where you left off</h2><button class="m-hero" type="button" data-play="${l.id}"><small>${FMT[l.format].label} · ${l.min} min</small><b>${esc(l.title)}</b><span class="m-track"><i style="width:${l.progress * 100}%"></i></span></button>
        <h2>Your Focus</h2><div class="m-rows">${focus.map(rowTopic).join("")}</div>
        <h2>Today</h2><div class="m-rows"><button class="m-row" type="button" data-go="${S.topics.find((t) => t.name === "Climate-responsive design").id}"><span class="m-thumb">${ic("target", "sm")}</span><span class="m-txt"><b>Recall: Climate-responsive design</b><small>Three questions, two minutes</small></span>${ic("right", "sm m-chev")}</button>
        <button class="m-row" type="button" data-ask="Suggest sub-topics for Daylight & shading"><span class="m-thumb">${ic("spark", "sm")}</span><span class="m-txt"><b>Break down Daylight & shading</b><small>It has no sub-topics yet</small></span>${ic("right", "sm m-chev")}</button></div></div>`;
    }
    if (S.dest === "learn") {
      return `<div class="m-page"><h1>Learn</h1><p class="m-lede">Ask for anything below, or say it.</p>
        ${S.making ? "" : ""}<h2>Your Lumens</h2><div class="m-rows">${S.lumens.filter((l) => l.state === "ready").map(rowLumen).join("")}</div></div>`;
    }
    return `<div class="m-page"><h1>Commonplace</h1><p class="m-lede">${plural(S.items.length, "item")} · photos, notes, quotes and links</p>
      <div class="m-wall">${S.items.map((x) => `<button class="m-it" type="button" data-item="${x.id}">${x.img ? `<img alt="" src="${D.IMG[x.img]}">` : x.kind === "Quote" ? `<div class="m-q">${esc(x.title)}</div>` : ""}<div><small>${x.kind}</small>${x.img || x.kind === "Quote" ? esc(T.get(x.topics[0])?.name ?? "") : esc(x.title)}</div></button>`).join("")}</div></div>`;
  }

  /* ---------- the drawer ---------- */
  function paintDrawer() {
    const el = $("#drawer");
    const counts = { today: "", learn: plural(S.lumens.length, "Lumen"), commonplace: plural(S.items.length, "item"), loci: plural(S.topics.length, "topic") };
    const rec = S.recents.filter((r) => (r.kind === "topic" && T.has(r.id)) || (r.kind === "lumen" && S.lumens.some((l) => l.id === r.id))).slice(0, 4);
    el.innerHTML = `<div class="m-drawer-head"><span class="m-mark">S</span><b>Studiolo</b></div>
      <div class="m-nav">${["today", "learn", "commonplace", "loci"].map((k) => `<button type="button" data-dest="${k}" ${S.dest === k ? 'aria-current="page"' : ""}>${ic(DEST[k].ic)}${DEST[k].label}<small>${counts[k]}</small></button>`).join("")}</div>
      ${rec.length ? `<h4>Recent</h4><div class="m-recent">${rec.map((r) => r.kind === "topic" ? `<button type="button" data-go="${r.id}"><i class="m-sd ${STATUS[T.get(r.id).status].cls}"></i><span class="m-txt"><b>${esc(T.get(r.id).name)}</b><small>${T.get(r.id).parentId ? esc(T.get(T.get(r.id).parentId).name) : "Area"}</small></span></button>` : `<button type="button" data-play="${r.id}">${ic(FMT[S.lumens.find((l) => l.id === r.id).format].ic, "sm")}<span class="m-txt"><b>${esc(S.lumens.find((l) => l.id === r.id).title)}</b><small>Lumen</small></span></button>`).join("")}</div>` : ""}
      <div class="m-drawer-foot">
        <div class="m-seg" role="group" aria-label="Appearance">${[["auto", "Auto"], ["light", "Light"], ["dark", "Dark"]].map(([k, l]) => `<button type="button" data-theme="${k}" aria-pressed="${S.theme === k}">${l}</button>`).join("")}</div>
        <button type="button" data-act="settings">${ic("gear")}Settings</button>
        <button type="button" data-act="settings"><span class="m-you">S</span>Specimen learner</button>
      </div>`;
  }
  function drawer(open) {
    const el = $("#drawer");
    el.classList.toggle("is-open", open); el.setAttribute("aria-hidden", String(!open)); el.style.transform = "";
    scrim(open, () => drawer(false));
    if (open) $("[aria-current]", el)?.focus({ preventScroll: true });
  }
  function setDest(k) {
    if (S.bar.mode !== "idle") endBarMode();
    drawer(false);
    if (S.dest === k) return;
    S.dest = k; S.chat = false; paintChat(); render();
  }

  /* ---------- clicks ---------- */
  app.addEventListener("click", (e) => {
    const t = e.target.closest("[data-act],[data-open],[data-go],[data-ghost],[data-addname],[data-play],[data-item],[data-ask],[data-dest],[data-theme],[data-status],[data-reply],[data-pfmt]");
    if (!t || t.closest("#pop")) return;
    const d = t.dataset;
    if (d.open) return openThing(d.open);
    if (d.go) { drawer(false); S.bar.mode = "idle"; $("#barInput").value = ""; $("#barInput").blur(); goTo(d.go); return refresh(); }
    if (d.ghost) { lastPoint = anchor(t, { up: true }); return ghostMenu(d.ghost); }
    if (d.addname) { addTopic(d.addname); return refresh(); }
    if (d.play) { drawer(false); return openPlayer(d.play); }
    if (d.item) return openItem(d.item);
    if (d.ask) { const i = $("#barInput"); i.value = ""; i.blur(); S.bar.mode = "idle"; return askLoci(d.ask); }
    if (d.dest) return setDest(d.dest);
    if (d.theme) { S.theme = d.theme; d.theme === "auto" ? delete document.documentElement.dataset.theme : (document.documentElement.dataset.theme = d.theme); paintDrawer(); if (engine) render(); return; }
    if (d.status) return setStatus(S.openId, d.status);
    if (d.pfmt) { const l = S.lumens.find((x) => x.id === S.player.id); if (d.pfmt !== l.format) toast(`${FMT[d.pfmt].label} is made from the same Lumen, one tap away.`); return; }
    if (d.reply) {
      const id = d.id || S.openId;
      if (d.reply === "keepall") return keepAll(id);
      if (d.reply === "review") { S.reply = null; refresh(); return setDetent("card"); }
      if (d.reply === "open") { S.reply = null; return goTo(id); }
      if (d.reply === "lumen") { S.reply = null; refresh(); return openLumenSheet({ topicId: id }); }
      if (d.reply === "suggest") { if (S.openId !== id) goTo(id); const list = suggestUnder(id); S.reply = { text: `Drafted ${list.join(", ")} under ${T.get(id).name}. Tap one to keep or dismiss it.`, acts: [["keepall", "Keep all", id]] }; return refresh(); }
    }
    switch (d.act) {
      case "drawer": return drawer(true);
      case "views": {
        t.setAttribute("aria-expanded", "true");
        return menu(anchor(t, { align: "center" }), [["palace", "Palace", "cube"], ["map", "Map", "map"], ["list", "List", "list"]].map(([k, l, i]) => `<button type="button" data-m="${k}" role="menuitemradio" aria-checked="${S.view === k}">${S.view === k ? ic("check", "sm m-check") : `<span class="m-check"></span>`}${l}${ic(i, "sm")}</button>`).join(""), Object.fromEntries(["palace", "map", "list"].map((k) => [k, () => { S.view = k; render(); }])));
      }
      case "options": return menu(anchor(t, { align: "right" }), `<label data-m="slow">Slow turn<input type="checkbox" ${S.slowTurn ? "checked" : ""}></label><button type="button" data-m="rearrange">Rearrange${ic("map", "sm")}</button><div class="m-sep"></div><button type="button" data-m="mic">Mic: ${window.Dictation.resolve().short}${ic("mic", "sm")}</button>`, {
        slow: (on) => { S.slowTurn = on; engine?.setView(viewOf()); }, rearrange: () => engine?.rearrange(),
        mic: () => { const sim = window.Dictation.resolve().id === "simulated"; window.Dictation.setChoice(sim ? "auto" : "simulated"); toast(`Mic: ${window.Dictation.resolve().short}`); },
      });
      case "whole": return goHome();
      case "key": S.key = !S.key; $("#key").hidden = !S.key; t.setAttribute("aria-pressed", String(S.key)); return;
      case "back": return goBack();
      case "plus": return plusMenu(t);
      case "barx": return endBarMode();
      case "add": return startNaming(S.openId && T.has(S.openId) ? S.openId : null);
      case "suggest": { const id = S.openId; const list = suggestUnder(id); S.reply = { text: `Drafted ${plural(list.length, "suggestion")} under ${T.get(id).name}. Tap one to keep or dismiss it.`, acts: [["keepall", "Keep all", id]] }; return refresh(); }
      case "lumen": return openLumenSheet({ topicId: S.openId && T.has(S.openId) ? S.openId : S.openId ? current().areaId : null });
      case "play": { const l = lumensOn(S.openId)[0]; return l && openPlayer(l.id); }
      case "playall": { const l = roomOf(cardModel().areaId).lumens[0]; return l && openPlayer(l.id); }
      case "ask": return focusBar();
      case "focus": { const f = S.topics.find((x) => x.wantToLearn && x.status !== "learned"); return goTo(f.id); }
      case "capture": S.bar.mode = "capture"; S.bar.capture = "note"; paintDock(); return focusBar();
      case "seeall": return setDest("commonplace");
      case "more": return S.openId && T.has(S.openId) ? thingMenu(S.openId, anchor(t, { up: true, align: "right" })) : menu(anchor(t, { up: true, align: "right" }), `<button type="button" data-m="list">Show as a list${ic("list", "sm")}</button><button type="button" data-m="map">Show the Map${ic("map", "sm")}</button>`, { list: () => { S.view = "list"; render(); }, map: () => { S.view = "map"; render(); } });
      case "status": return menu(anchor(t), Object.entries(STATUS).map(([k, s]) => `<button type="button" data-m="${k}">${s.label}${T.get(S.openId).status === k ? ic("check", "sm") : `<i class="m-sd ${s.cls}" style="margin-left:auto"></i>`}</button>`).join(""), Object.fromEntries(Object.keys(STATUS).map((k) => [k, () => setStatus(S.openId, k)])));
      case "chat": S.chat = true; S.reply = S.reply?.acts?.length ? S.reply : null; paintChat(); return refresh();
      case "chatx": S.chat = false; paintChat(); return refresh();
      case "replyx": S.reply = null; return refresh();
      case "sheetx": return closeSheet();
      case "mini": S.player.mode = "mini"; paintPlayer(); return refresh();
      case "full": S.player.mode = "full"; paintPlayer(); return refresh();
      case "pp": S.player.playing = !S.player.playing; paintPlayer(); return refresh();
      case "stop": clearInterval(playTick); S.player = null; paintPlayer(); return refresh();
      case "back15": S.player.pos = Math.max(0, S.player.pos - 15); return paintPlayerTime();
      case "fwd15": S.player.pos += 15; return paintPlayerTime();
      case "live": return toast("Live talks it through with you, from where you are, as in Learn.");
      case "playask": S.player.mode = "mini"; paintPlayer(); refresh(); return startListening($("#barInput"), "Why does the stack effect need height?");
      case "playmore": return toast("Speed, sleep timer, drive edition, share.");
      case "settings": drawer(false); return toast("Settings, as today, behind the account.");
    }
  });
  // Hold the place pill for the whole trail, as iOS shows history on a held Back button.
  app.addEventListener("pointerdown", (e) => {
    const p = e.target.closest("#place"); if (!p) return;
    const timer = setTimeout(() => {
      p.dataset.held = "1"; navigator.vibrate?.(8);
      const ids = S.trail.filter((x) => x !== S.openId);
      menu(anchor(p), `<button type="button" data-m="home">All areas${ic("whole", "sm")}</button>${ids.map((id, i) => `<button type="button" data-m="c${i}">${esc(nameOf(id))}</button>`).join("")}`,
        { home: goHome, ...Object.fromEntries(ids.map((id, i) => [`c${i}`, () => { S.trail = S.trail.slice(0, S.trail.indexOf(id) + 1); S.openId = id; refresh(); }])) });
    }, 450);
    const clear = () => { clearTimeout(timer); p.removeEventListener("pointerup", clear); p.removeEventListener("pointercancel", clear); };
    p.addEventListener("pointerup", clear); p.addEventListener("pointercancel", clear);
  });
  app.addEventListener("click", (e) => {
    const p = e.target.closest("#place"); if (!p) return;
    if (p.dataset.held) { delete p.dataset.held; return; }
    goBack();
  });
  function plusMenu(btn) {
    btn.setAttribute("aria-expanded", "true");
    const t = S.dest === "loci" && T.has(S.openId) ? T.get(S.openId) : null;
    const items = [
      S.dest === "loci" ? ["add", t ? (t.parentId ? "New sub-topic" : "New topic") : "New area", "sub"] : null,
      ["lumen", "Make a Lumen", "spark"],
      ["note", "Write a note", "note"], ["photo", "Photo or scan", "camera"], ["link", "Paste a link", "link"], ["file", "Add a file or PDF", "file"],
    ].filter(Boolean);
    menu(anchor(btn, { up: true }), `${items.slice(0, S.dest === "loci" ? 2 : 1).map(([k, l, i]) => `<button type="button" data-m="${k}">${l}${ic(i, "sm")}</button>`).join("")}<div class="m-sep"></div>${items.slice(S.dest === "loci" ? 2 : 1).map(([k, l, i]) => `<button type="button" data-m="${k}">${l}${ic(i, "sm")}</button>`).join("")}`, {
      add: () => startNaming(t ? t.id : null), lumen: () => openLumenSheet({ topicId: t?.id ?? null }),
      note: () => { S.bar.mode = "capture"; S.bar.capture = "note"; paintDock(); focusBar(); },
      link: () => { S.bar.mode = "capture"; S.bar.capture = "link"; paintDock(); focusBar(); },
      photo: () => toast("The camera opens; the photo is filed on what is open."), file: () => toast("The file picker opens; PDFs go to Commonplace."),
    });
  }

  /* ---------- drags: the card's detents, sheets and the player down, the drawer from the left edge ---------- */
  app.addEventListener("pointerdown", (e) => {
    const h = e.target.closest("[data-drag]");
    if (h && !e.target.closest("button")) return dragVertical(e, h.dataset.drag);
    const a = app.getBoundingClientRect();
    if (e.clientX - a.left < 22 && !$("#drawer").classList.contains("is-open") && !$("#sheet").classList.contains("is-open") && !S.player?.mode?.startsWith("f")) {
      e.stopPropagation(); e.preventDefault(); dragDrawer(e);
    }
  }, true);
  function dragVertical(e, which) {
    const el = which === "card" ? $("#card") : which === "chat" ? $("#chat") : which === "player" ? $("#player") : $("#sheet");
    const y0 = e.clientY, t0 = performance.now(), h0 = el.offsetHeight;
    let dy = 0;
    el.classList.add("is-dragging");
    const move = (ev) => {
      dy = ev.clientY - y0;
      if (which === "card") el.style.height = `${Math.max(40, h0 - dy)}px`;
      else el.style.transform = `translateY(${Math.max(0, dy)}px)`;
    };
    const up = () => {
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up);
      el.classList.remove("is-dragging");
      const v = dy / Math.max(1, performance.now() - t0), tap = Math.abs(dy) < 6;
      if (which === "card") {
        const order = ["peek", "card", "full"], i = order.indexOf(S.detent);
        let next = S.detent;
        if (tap) next = S.detent === "peek" ? "card" : S.detent;
        else if (dy < -40 || v < -0.5) next = order[Math.min(2, i + (dy < -220 ? 2 : 1))];
        else if (dy > 40 || v > 0.5) next = order[Math.max(0, i - (dy > 220 ? 2 : 1))];
        setDetent(next);
      } else {
        el.style.transform = "";
        if (dy > 90 || v > 0.6) { if (which === "chat") { S.chat = false; paintChat(); refresh(); } else if (which === "player") { S.player.mode = "mini"; paintPlayer(); refresh(); } else closeSheet(); }
      }
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
  }
  function dragDrawer(e) {
    const el = $("#drawer"), w = el.offsetWidth, x0 = e.clientX; let dx = 0;
    el.classList.add("is-dragging");
    const move = (ev) => { dx = Math.max(0, Math.min(w, ev.clientX - x0)); el.style.transform = `translateX(${dx - w}px)`; };
    const up = () => {
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up);
      el.classList.remove("is-dragging"); drawer(dx > w * 0.3);
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
  }
  // Swipe the open drawer back to the left.
  $("#drawer").addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return;
    const el = $("#drawer"), w = el.offsetWidth, x0 = e.clientX; let dx = 0;
    const move = (ev) => { dx = Math.min(0, ev.clientX - x0); el.classList.add("is-dragging"); el.style.transform = `translateX(${dx}px)`; };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); el.classList.remove("is-dragging"); drawer(dx > -w * 0.3); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if ($("#pop").innerHTML) return closeMenu();
    if ($("#sheet").classList.contains("is-open")) return closeSheet();
    if ($("#drawer").classList.contains("is-open")) return drawer(false);
    if (S.player?.mode === "full") { S.player.mode = "mini"; paintPlayer(); return refresh(); }
    if (S.chat) { S.chat = false; paintChat(); return refresh(); }
    if (S.dest === "loci" && document.activeElement?.id !== "barInput") goBack();
  });

  /* ---------- the keyboard on iOS: keep the bar on top of it (mobile P11) ---------- */
  const vv = window.visualViewport;
  if (vv && !document.documentElement.classList.contains("framed")) {
    const fit = () => {
      const kb = window.innerHeight - vv.height > 120;
      app.classList.toggle("kb", kb);
      app.style.height = kb ? `${vv.height}px` : ""; app.style.bottom = kb ? "auto" : ""; app.style.transform = kb ? `translateY(${vv.offsetTop}px)` : "";
      app.style.setProperty("--sab", kb ? "0px" : "");
    };
    vv.addEventListener("resize", fit); vv.addEventListener("scroll", fit);
  }
  new ResizeObserver(() => { if (S.dest === "loci") { setDetent(S.detent); } }).observe(app);

  render();
  // Open where the story starts: Environment & Services, so the card, its topics and its rooms show at once.
  setTimeout(() => { if (!S.openId) { const env = S.topics.find((t) => t.name === "Environment & Services"); remember({ kind: "topic", id: S.topics.find((t) => t.name === "Passive design").id }); openThing(env.id); } }, 1200);
})();
