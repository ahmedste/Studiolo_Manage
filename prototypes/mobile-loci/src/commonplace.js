/* Commonplace on a phone: the approved header (CP_HEADER and the v4 prototype), folded for a thumb.
   - The title is the area switch: COMMONPLACE / All areas ⌄ (All areas, each area with its count, No area yet).
   - Under it, pinned: Everything · Collections · To read · Templates; then the types (All · Notes · Sources · Photos ·
     Objects) with the chosen type's collections after "›"; then one slim bar: All · Unsorted · ★ Picks, Topic ▾, the
     type's own filter (Status, Style, Colour and More), and Display. The two lower rows fold away while you scroll down.
   - The bar at the foot searches as you type (it is the search field) and captures; Select is in the top bar.
   - Every kind opens the way the wall opens it: photos in the viewer, videos in a player, links in the web viewer, PDFs
     in the reading room, notes and books on their page. Words are the app's (wall-*.tsx, header-model.ts, card-menu.tsx). */
"use strict";
(() => {
  const C = {
    tab: "everything", type: "all", coll: null, show: "all", topic: null, status: null, style: null, shape: null, colour: null, light: null,
    view: "wall", sort: "newest", group: "none", layout: "masonry", cols: 2, caps: true, q: "", sel: null, collPage: null, readTab: "unread", area: "all", collapsed: false,
  };
  const M = () => window.MP;
  const TYPES = [["all", "All", "grid"], ["note", "Notes", "note"], ["source", "Sources", "read"], ["photo", "Photos", "camera"], ["object", "Objects", "tag"]];
  const PLACE = { all: "Search, capture or ask…", note: "Search notes and quotes…", source: "Search books, lectures and links…", photo: "Search photos by place or note…", object: "Search objects and their fields…" };
  const STATUSES = [["unread", "To read"], ["reading", "Reading"], ["read", "Read"]];
  const STYLES = [["note", "Plain"], ["longnote", "Long"], ["quote", "Quote"]];
  const SHAPES = [["landscape", "Landscape"], ["portrait", "Portrait"], ["square", "Square"], ["panorama", "Panorama"]];
  const COLOURS = [["red", "Red", "#b23a2c"], ["terracotta", "Terracotta", "#b26a3a"], ["ochre", "Ochre", "#c99a52"], ["sand", "Sand", "#dcc7a4"], ["green", "Green", "#2f7563"], ["teal", "Teal", "#3f6f87"], ["sky", "Sky blue", "#90afd3"], ["navy", "Navy", "#26385e"], ["white", "White", "#f4f2ec"], ["grey", "Grey", "#a8a7a2"], ["charcoal", "Charcoal", "#3a3936"], ["brown", "Brown", "#6b4428"]];
  const VIEWS = [
    { name: "Warm brick references", set: { type: "photo", colour: "terracotta" } },
    { name: "Competition picks", set: { type: "photo", show: "picks", coll: "renders" } },
    { name: "Reading now", set: { type: "source", status: "reading" } },
  ];

  /* ---------- helpers ---------- */
  const items = () => M().S.items;
  const typeOf = (x) => (x.type === "photo" ? "photo" : ["note", "longnote", "quote"].includes(x.type) ? "note" : ["person", "thing"].includes(x.type) ? "object" : "source");
  const coll = (id) => M().D.COLLECTIONS.find((c) => c.id === id);
  const meta = (x) => M().D.META[x.img] || [4, 3, 50, []];
  const ratio = (x) => meta(x)[0] / meta(x)[1];
  const shapeOf = (x) => { const r = ratio(x); return r > 1.9 ? "panorama" : r > 1.12 ? "landscape" : r < 0.89 ? "portrait" : "square"; };
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const near = (a, b) => { const [x, y] = [rgb(a), rgb(b)]; return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) < 70; };
  const hasColour = (x, id) => { const hex = COLOURS.find((c) => c[0] === id)[2]; return meta(x)[3].slice(0, 3).some((h) => near(h, hex)); };
  const areaOfItem = (x) => [...new Set(x.topics.map((t) => M().areaOf(t)))];
  const inArea = (x) => C.area === "all" ? true : C.area === "none" ? !x.topics.length : areaOfItem(x).includes(C.area);
  const topicLine = (x) => x.topics.map((t) => M().T().get(t)?.name).filter(Boolean).slice(0, 2).join(", ");
  function filtered(opts = {}) {
    const q = C.q.trim().toLowerCase();
    let list = items().filter(inArea);
    if (C.collPage) list = list.filter((x) => x.coll === C.collPage);
    else if (!opts.ignoreType) {
      if (C.type !== "all") list = list.filter((x) => typeOf(x) === C.type);
      if (C.coll) list = list.filter((x) => x.coll === C.coll);
    }
    if (C.show === "unsorted") list = list.filter((x) => !x.topics.length);
    if (C.show === "picks") list = list.filter((x) => x.picked);
    if (C.topic) { const ids = new Set([C.topic, ...M().descendants(C.topic)]); list = list.filter((x) => x.topics.some((t) => ids.has(t))); }
    if (C.type === "source" && C.status) list = list.filter((x) => x.state === C.status);
    if (C.type === "note" && C.style) list = list.filter((x) => x.type === C.style);
    if (C.type === "photo" && C.shape) list = list.filter((x) => shapeOf(x) === C.shape);
    if (C.type === "photo" && C.colour) list = list.filter((x) => hasColour(x, C.colour));
    if (C.type === "photo" && C.light) list = list.filter((x) => (C.light === "light" ? meta(x)[2] >= 55 : meta(x)[2] < 55));
    if (q) list = list.filter((x) => [x.title, x.caption, x.creator, x.src, x.text, x.site, topicLine(x), coll(x.coll)?.name].filter(Boolean).join(" ").toLowerCase().includes(q));
    const by = { newest: (a, b) => b.date.localeCompare(a.date), oldest: (a, b) => a.date.localeCompare(b.date), title: (a, b) => a.title.localeCompare(b.title) }[C.sort];
    return list.sort(by);
  }
  const countBy = (pred) => items().filter(inArea).filter(pred).length;
  const typeCount = (t) => countBy((x) => t === "all" || typeOf(x) === t);

  /* ---------- top bar: the area switch is the title; Select on the right ---------- */
  function top() {
    const { esc, ic } = M(), T = M().T();
    const name = C.area === "all" ? "All areas" : C.area === "none" ? "No area yet" : T.get(C.area).name;
    return `<button class="m-title" type="button" data-p="cparea" aria-haspopup="menu" aria-label="Area: ${esc(name)}. Change"><small>Commonplace</small><b><i class="cp-adot"></i>${esc(name)}${ic("down")}</b></button>
      ${C.tab === "everything" || C.collPage ? `<button class="cp-select ${C.sel ? "is-on" : ""}" type="button" data-p="select">${C.sel ? "Done" : "Select"}</button>` : "<span></span>"}`;
  }

  /* ---------- the page ---------- */
  function html() {
    const { D, plural } = M();
    if (C.collPage) return collectionPage();
    const tabs = [["everything", "Everything"], ["collections", "Collections"], ["toread", "To read"], ["templates", "Templates"]];
    return `<div class="m-page p-cp ${C.sel ? "is-selecting" : ""}"><h1>Commonplace</h1>
      <p class="m-lede">${plural(items().filter(inArea).length, "entry", "entries")}, ${plural(D.COLLECTIONS.length, "collection")}</p>
      <div class="p-sticky cp-head ${C.collapsed ? "is-collapsed" : ""}" id="cphead">
        <div class="m-seg cp-tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" role="tab" data-p="cptab" data-t="${k}" aria-pressed="${C.tab === k}">${l}</button>`).join("")}</div>
        ${C.tab === "everything" ? `<div class="cp-fold">${typeRow()}${slimBar()}</div>` : ""}
      </div>
      <div id="cpbody">${C.tab === "everything" ? everything() : C.tab === "collections" ? collectionsTab() : C.tab === "toread" ? toRead() : templates()}</div></div>
      ${C.sel ? selectBar() : ""}`;
  }
  function typeRow() {
    const { ic, esc, D } = M();
    const colls = C.type === "all" ? [] : D.COLLECTIONS.filter((c) => c.type === C.type);
    return `<div class="cp-types" role="group" aria-label="Type">${TYPES.map(([k, l, i]) => `<button type="button" class="cp-type" data-p="cptype" data-t="${k}" aria-pressed="${C.type === k && !C.coll}">${ic(i, "xs")}${l}<span>${typeCount(k)}</span></button>${C.type === k && colls.length ? `<span class="cp-gt" aria-hidden="true">›</span>${colls.map((c) => `<button type="button" class="cp-pill" data-p="cpcoll" data-c="${c.id}" aria-pressed="${C.coll === c.id}">${esc(c.name)}<span>${countBy((x) => x.coll === c.id)}</span></button>`).join("")}` : ""}`).join("")}</div>`;
  }
  function slimBar() {
    const { ic, esc } = M(), T = M().T();
    const base = items().filter(inArea).filter((x) => C.type === "all" || typeOf(x) === C.type);
    const own = C.type === "source" ? `<button class="cp-f ${C.status ? "is-on" : ""}" type="button" data-p="cpstatus">${C.status ? STATUSES.find((s) => s[0] === C.status)[1] : "Status"}${ic("down", "xs")}</button>`
      : C.type === "note" && !C.coll ? `<button class="cp-f ${C.style ? "is-on" : ""}" type="button" data-p="cpstyle">${C.style ? STYLES.find((s) => s[0] === C.style)[1] : "Style"}${ic("down", "xs")}</button>`
      : C.type === "photo" ? `<button class="cp-f ${C.colour ? "is-on" : ""}" type="button" data-p="cpcolour">${C.colour ? `<i class="cp-sw" style="background:${COLOURS.find((c) => c[0] === C.colour)[2]}"></i>${COLOURS.find((c) => c[0] === C.colour)[1]}` : `<i class="cp-sw rainbow"></i>Colour`}</button><button class="cp-f ${C.shape || C.light ? "is-on" : ""}" type="button" data-p="cpmore">More${ic("down", "xs")}</button>` : "";
    return `<div class="cp-slim">
      <div class="m-seg cp-show">${[["all", "All", base.length], ["unsorted", "Unsorted", base.filter((x) => !x.topics.length).length], ["picks", "★ Picks", base.filter((x) => x.picked).length]].map(([k, l, n]) => `<button type="button" data-p="cpshow" data-s="${k}" aria-pressed="${C.show === k}">${l}<span>${n}</span></button>`).join("")}</div>
      <button class="cp-f ${C.topic ? "is-on" : ""}" type="button" data-p="cptopic">${C.topic ? esc(T.get(C.topic).name) : "Topic"}${ic("down", "xs")}</button>
      ${own}
      <button class="cp-f cp-disp" type="button" data-p="display" aria-label="Display">${ic("filter", "xs")}Display</button></div>`;
  }
  function countLine(n) {
    const { ic, esc, plural } = M();
    const word = C.type === "photo" ? ["photo"] : C.type === "note" ? ["note"] : C.type === "source" ? ["source"] : C.type === "object" ? ["object"] : ["entry", "entries"];
    const sort = { newest: "newest first", oldest: "oldest first", title: "A to Z" }[C.sort];
    return `<div class="cp-count"><span>${C.q ? `<button class="cp-qchip" type="button" data-p="cpclearq">“${esc(C.q)}” ${ic("x", "xs")}</button>` : ""}${C.view === "shelves" ? "Shelves · in your order" : `${plural(n, ...word)} · ${sort}`}</span>
      <span class="m-seg cp-vs" role="group" aria-label="View"><button type="button" data-p="cpview" data-v="wall" aria-pressed="${C.view === "wall"}" aria-label="Wall">${ic("grid", "xs")}</button><button type="button" data-p="cpview" data-v="shelves" aria-pressed="${C.view === "shelves"}" aria-label="Shelves">${ic("shelves", "xs")}</button></span></div>`;
  }
  function everything() {
    if (C.type === "object") return `${countLine(0)}<div class="cp-empty"><b>No objects yet</b><p>People, buildings, cases… each with your own fields. Make an Objects collection to start one.</p><button class="m-btn is-primary" type="button" data-p="newcoll" data-t="object">New Objects collection</button></div>`;
    const list = filtered();
    if (C.view === "shelves") return countLine(list.length) + shelves(list);
    if (!list.length) return `${countLine(0)}<div class="cp-empty"><b>${C.show === "unsorted" ? "Every entry has a topic." : "Nothing here yet."}</b>${C.q || C.topic || C.colour || C.shape || C.status || C.style || C.show !== "all" ? `<button class="m-btn" type="button" data-p="cpclear">Clear filters</button>` : ""}</div>`;
    return countLine(list.length) + wall(list);
  }

  /* ---------- the wall: the app's card faces ---------- */
  function wall(list) {
    // On All, an album shows as one card with its count, as the wall does today.
    const shown = [], albums = new Map();
    list.forEach((x) => {
      if (C.type === "all" && x.album && !C.q) { if (!albums.has(x.album)) { albums.set(x.album, []); shown.push({ isAlbum: x.album }); } albums.get(x.album).push(x); }
      else shown.push(x);
    });
    if (C.type === "photo" && C.layout === "rows") return `<div class="cp-rows">${list.map((x) => `<button class="cp-rowpic ${selCls(x)}" type="button" data-p="open" data-id="${x.id}" style="flex:${ratio(x) * 100} 1 ${ratio(x) * 104}px"><img alt="" src="${M().D.IMG[x.img]}" loading="lazy">${x.picked ? `<i class="cp-star">★</i>` : ""}${selMark(x)}</button>`).join("")}</div>`;
    if (C.type === "photo" && C.layout === "grid") return `<div class="cp-grid" style="--cols:${C.cols + 1}">${list.map((x) => `<button class="cp-sq ${selCls(x)}" type="button" data-p="open" data-id="${x.id}"><img alt="" src="${M().D.IMG[x.img]}" loading="lazy">${x.picked ? `<i class="cp-star">★</i>` : ""}${selMark(x)}</button>`).join("")}</div>`;
    return `<div class="cp-wall" style="--cols:${C.cols}">${shown.map((x) => (x.isAlbum ? albumCard(x.isAlbum, albums.get(x.isAlbum)) : card(x))).join("")}</div>`;
  }
  const selCls = (x) => (C.sel?.has(x.id) ? "is-sel" : "");
  const selMark = (x) => (C.sel ? `<i class="cp-check ${C.sel.has(x.id) ? "on" : ""}" aria-hidden="true">${C.sel.has(x.id) ? "✓" : ""}</i>` : "");
  function kicker(x) { const c = coll(x.coll); return c ? `<small class="cp-k">${M().esc(c.name)}</small>` : ""; }
  function card(x) {
    const { esc, D, ic } = M();
    const open = `class="cp-card ${x.type} ${selCls(x)}" type="button" data-p="open" data-id="${x.id}"`;
    const foot = C.caps ? `<span class="cp-cap"><b>${esc(x.title)}</b><small>${[coll(x.coll)?.name, topicLine(x) || "No topic yet"].filter(Boolean).join(" · ")}</small></span>` : "";
    switch (x.type) {
      case "photo": return `<button ${open}><span class="cp-pic" style="aspect-ratio:${ratio(x)}"><img alt="" src="${D.IMG[x.img]}" loading="lazy">${x.picked ? `<i class="cp-star">★</i>` : ""}${x.notes ? `<i class="cp-notes">${x.notes}</i>` : ""}</span>${foot}${selMark(x)}</button>`;
      case "quote": return `<button ${open}>${kicker(x)}<q>${esc(x.title)}</q><small class="cp-src">${esc(x.src)}</small>${x.picked ? `<i class="cp-star in">★</i>` : ""}${selMark(x)}</button>`;
      case "note": return `<button ${open}>${kicker(x)}<p>${esc(x.title)}</p><small class="cp-src">${esc(topicLine(x) || "No topic yet")}</small>${selMark(x)}</button>`;
      case "longnote": return `<button ${open}>${kicker(x)}<b class="cp-lt">${esc(x.title)}</b><p>${esc(x.text)}</p>${x.picked ? `<i class="cp-star in">★</i>` : ""}${selMark(x)}</button>`;
      case "book": return `<button ${open}><span class="cp-book"><b>${esc(x.title)}</b><small>${esc(x.creator)}</small></span>${x.prog ? `<span class="cp-bar"><i style="width:${x.prog * 100}%"></i></span>` : ""}<span class="cp-cap"><b>${esc(x.title)}</b><small>Book · ${STATUSES.find((s) => s[0] === x.state)[1]}</small></span>${selMark(x)}</button>`;
      case "video": return `<button ${open}><span class="cp-pic vid"><img alt="" src="${D.IMG[x.img]}" loading="lazy"><i class="cp-play">${ic("play", "xs")}</i><i class="cp-dur">${x.dur}</i>${x.prog ? `<span class="cp-bar on"><i style="width:${x.prog * 100}%"></i></span>` : ""}</span><span class="cp-cap"><b>${esc(x.title)}</b><small>${esc(x.creator)}${coll(x.coll) ? ` · ${coll(x.coll).name}` : ""}</small></span>${selMark(x)}</button>`;
      case "link": return `<button ${open}>${x.img ? `<span class="cp-pic"><img alt="" src="${D.IMG[x.img]}" loading="lazy"></span>` : ""}<span class="cp-cap"><small class="cp-site">${ic("link", "xs")}${esc(x.site)}</small><b>${esc(x.title)}</b><small>${esc(x.desc)}</small></span>${selMark(x)}</button>`;
      case "pdf": return `<button ${open}><span class="cp-sheet"><b>${esc(x.title)}</b><i></i><i></i><i></i><i></i></span><span class="cp-cap"><b>${esc(x.title)}</b><small>PDF · ${x.pages} pages</small></span>${selMark(x)}</button>`;
    }
    return "";
  }
  function albumCard(id, list) {
    const { esc, D } = M(), x = list[0];
    return `<button class="cp-card photo album" type="button" data-p="album" data-a="${id}"><span class="cp-pic" style="aspect-ratio:${ratio(x)}"><img alt="" src="${D.IMG[x.img]}" loading="lazy"><i class="cp-count-b">${list.length}</i></span><span class="cp-cap"><b>${esc(D.ALBUMS[id])}</b><small>Album · ${list.length} photos</small></span></button>`;
  }

  /* ---------- shelves: one shelf per collection, then what isn't on a shelf ---------- */
  function shelves(list) {
    const { esc, ic, D } = M();
    const colls = D.COLLECTIONS.filter((c) => (C.type === "all" || c.type === C.type) && (!C.coll || c.id === C.coll));
    const rows = colls.map((c) => [c, list.filter((x) => x.coll === c.id)]).filter(([, l]) => l.length);
    const loose = list.filter((x) => !x.coll);
    const shelf = (title, l, cid) => `<section class="cp-shelf"><h3><span>${esc(title)} <small>${l.length}</small></span>${cid ? `<button type="button" data-p="cpcollpage" data-c="${cid}">Open shelf ${ic("right", "xs")}</button>` : ""}</h3>
      <div class="cp-shelfrow">${l.map((x) => `<button class="cp-spine ${x.type}" type="button" data-p="open" data-id="${x.id}">${x.img ? `<img alt="" src="${D.IMG[x.img]}" style="aspect-ratio:${ratio(x)}">` : `<span>${esc(x.title)}</span>`}</button>`).join("")}</div></section>`;
    return rows.map(([c, l]) => shelf(c.name, l, c.id)).join("") + (loose.length ? shelf("Not on a shelf", loose, null) : "");
  }

  /* ---------- Collections, one collection, To read, Templates ---------- */
  function collCover(c) {
    const { D, esc } = M(), first = items().find((x) => x.coll === c.id && x.img);
    if (first) return `<img alt="" src="${D.IMG[first.img]}">`;
    const t = items().find((x) => x.coll === c.id);
    return `<span class="cp-paper ${c.type}"><b>${esc(t ? t.title : "No items yet")}</b></span>`;
  }
  function collectionsTab() {
    const { esc, D, plural, ic } = M();
    const typeName = { photo: "Photos", note: "Notes", source: "Sources", object: "Objects" };
    return `<div class="cp-colls">${D.COLLECTIONS.filter((c) => !C.q || c.name.toLowerCase().includes(C.q.toLowerCase())).map((c) => `<button class="cp-coll" type="button" data-p="cpcollpage" data-c="${c.id}"><span class="cp-cover">${collCover(c)}</span><b>${esc(c.name)}</b><small>${typeName[c.type]} · ${plural(items().filter((x) => x.coll === c.id).length, "item")}</small></button>`).join("")}
      <button class="cp-coll is-new" type="button" data-p="newcoll"><span class="cp-cover">${ic("plus")}</span><b>New collection</b><small>Notes, Sources, Photos or Objects</small></button></div>`;
  }
  function collectionPage() {
    const { esc, ic } = M(), c = coll(C.collPage), list = filtered();
    const typeName = { photo: "Photos", note: "Notes", source: "Sources", object: "Objects" }[c.type];
    return `<div class="m-page p-cp ${C.sel ? "is-selecting" : ""}">
      <button class="cp-back" type="button" data-p="cpcollback">${ic("left", "sm")}Collections</button>
      <header class="cp-chead"><span class="cp-thumb">${collCover(c)}</span><div><small>${typeName} collection</small><h1>${esc(c.name)}</h1></div></header>
      ${c.desc ? `<p class="cp-desc">${esc(c.desc)}</p>` : ""}
      <div class="cp-cacts"><button class="m-btn" type="button" data-p="additems">${ic("plus", "xs")}Add items</button><button class="m-btn" type="button" data-p="editcoll">${ic("pencil", "xs")}Edit collection</button></div>
      ${countLine(list.length)}${C.view === "shelves" ? shelves(list) : wall(list)}</div>${C.sel ? selectBar() : ""}`;
  }
  function toRead() {
    const { esc, ic } = M();
    const list = items().filter(inArea).filter((x) => typeOf(x) === "source" && (x.state || "unread") === C.readTab);
    const empty = { unread: "Nothing to read yet. Sources you save start here.", reading: "Nothing in progress. Set a Source to Reading on its page.", read: "Nothing finished yet." }[C.readTab];
    return `<div class="m-seg cp-readtabs">${STATUSES.map(([k, l]) => `<button type="button" data-p="readtab" data-t="${k}" aria-pressed="${C.readTab === k}">${l}<span>${items().filter((x) => typeOf(x) === "source" && (x.state || "unread") === k).length}</span></button>`).join("")}</div>
      ${list.length ? `<div class="m-rows cp-readrows">${list.map((x) => `<button class="m-row" type="button" data-p="open" data-id="${x.id}">${x.img ? `<img class="m-thumb" alt="" src="${M().D.IMG[x.img]}">` : `<span class="m-thumb cp-tthumb ${x.type}">${x.kind}</span>`}<span class="m-txt"><b>${esc(x.title)}</b><small>${esc(x.creator || x.site || "")} · ${x.kind}</small>${x.prog ? `<span class="cp-bar"><i style="width:${x.prog * 100}%"></i></span>` : ""}</span>${ic("right", "sm m-chev")}</button>`).join("")}</div>` : `<div class="cp-empty"><p>${empty}</p></div>`}`;
  }
  function templates() {
    const { ic } = M();
    const four = [["note", "Notes", "Your writing and quotes", "note"], ["source", "Sources", "Links, videos, PDFs, books", "read"], ["photo", "Photos", "Pictures and their groups", "camera"], ["object", "Objects", "People, buildings, cases… with your own fields", "tag"]];
    return `<h2>The Four Types</h2><div class="cp-four">${four.map(([k, n, d, i]) => `<button class="cp-tpl" type="button" data-p="newcoll" data-t="${k}">${ic(i)}<b>${n}</b><small>${d}</small><span>New ${n} collection</span></button>`).join("")}</div>`;
  }

  /* ---------- Select ---------- */
  function selectBar() {
    const { ic } = M(), n = C.sel.size;
    return `<div class="cp-selbar m-mat" role="toolbar" aria-label="Selection"><b>${n ? `${n} selected` : "Select items"}</b>
      <div class="cp-selacts"><button type="button" data-p="seltopic" ${n ? "" : "disabled"}>${ic("tag", "sm")}<span>Add topics…</span></button><button type="button" data-p="selmove" ${n ? "" : "disabled"}>${ic("folder", "sm")}<span>Move to…</span></button><button type="button" data-p="selpick" ${n ? "" : "disabled"}>${ic("star", "sm")}<span>Pick</span></button><button type="button" class="is-danger" data-p="seldel" ${n ? "" : "disabled"}>${ic("trash", "sm")}<span>Delete…</span></button></div></div>`;
  }

  /* ---------- opening an item ---------- */
  function openItem(id, list) {
    const x = items().find((i) => i.id === id); if (!x) return;
    if (x.type === "photo") return viewer(x, list || (M().S.dest === "commonplace" ? filtered().filter((i) => i.type === "photo") : items().filter((i) => i.type === "photo")));
    if (x.type === "pdf") return pdfRoom(x);
    if (x.type === "video") return videoView(x);
    if (x.type === "link") return webView(x);
    return itemPage(x);
  }
  // The photo viewer: dark mat, swipe between photos, swipe down to close, double-tap or pinch to zoom, facts.
  let V = null;
  function viewer(x, list) {
    V = { list: list.length ? list : [x], i: Math.max(0, list.findIndex((p) => p.id === x.id)), z: 1, info: false };
    paintViewer();
    const el = document.getElementById("viewer"); el.classList.add("is-open"); el.setAttribute("aria-hidden", "false");
  }
  function paintViewer() {
    const { esc, ic, D } = M(), x = V.list[V.i], m = meta(x), T = M().T();
    const el = document.getElementById("viewer");
    el.innerHTML = `<header class="v-top"><button class="v-b" type="button" data-p="vclose" aria-label="Close">${ic("x")}</button><span>${V.i + 1} of ${V.list.length}</span><button class="v-b" type="button" data-p="vmore" aria-label="More">${ic("more")}</button></header>
      <div class="v-stage" id="vstage"><img id="vimg" alt="${esc(x.title)}" src="${D.IMG[x.img]}" style="transform:scale(${V.z})" draggable="false"></div>
      <div class="v-panel ${V.info ? "is-info" : ""}">
        <div class="v-title"><b>${esc(x.title)}</b>${x.caption ? `<p>${esc(x.caption)}</p>` : ""}</div>
        ${V.info ? `<dl class="v-facts">${x.album ? `<dt>Album</dt><dd>${esc(D.ALBUMS[x.album])}</dd>` : ""}<dt>Size</dt><dd>${m[0]} × ${m[1]}</dd><dt>Kind</dt><dd>${esc(coll(x.coll)?.name || "Photo")}</dd><dt>Taken</dt><dd>${esc(x.date)}${x.camera ? ` · ${esc(x.camera)}` : ""}</dd>${x.site ? `<dt>From</dt><dd>${esc(x.site)}</dd>` : ""}</dl>
          <div class="v-topics">${x.topics.length ? x.topics.map((t) => `<button class="v-chip" type="button" data-p="vtopic" data-t="${t}">${esc(T.get(t).name)}</button>`).join("") : `<button class="v-chip" type="button" data-p="vaddtopic">+ Topic</button>`}</div>
          ${x.notes ? `<p class="v-note">${x.notes} ${x.notes === 1 ? "note" : "notes"} on a detail · tap and hold the photo to add one</p>` : `<p class="v-note">Tap and hold the photo to note a detail</p>`}` : ""}
        <div class="v-acts"><button type="button" data-p="vpick" aria-pressed="${!!x.picked}">${ic("star", "sm")}<span>${x.picked ? "Picked" : "Pick"}</span></button><button type="button" data-p="vinfo" aria-pressed="${V.info}"><b class="v-i">i</b><span>Info</span></button><button type="button" data-p="vlumen">${ic("spark", "sm")}<span>Lumen</span></button><button type="button" data-p="vloci">${ic("network", "sm")}<span>On Loci</span></button><button type="button" data-p="vshare">${ic("share", "sm")}<span>Share</span></button></div>
      </div>`;
    viewerGestures();
  }
  function viewerGestures() {
    const st = document.getElementById("vstage"), img = document.getElementById("vimg");
    let x0 = 0, y0 = 0, dx = 0, dy = 0, last = 0, pts = new Map(), d0 = 0, z0 = 1;
    st.onpointerdown = (e) => {
      st.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2) { const [a, b] = [...pts.values()]; d0 = Math.hypot(a[0] - b[0], a[1] - b[1]); z0 = V.z; return; }
      x0 = e.clientX; y0 = e.clientY; dx = dy = 0;
      const now = performance.now(); if (now - last < 300) { V.z = V.z > 1 ? 1 : 2.5; img.style.transform = `scale(${V.z})`; last = 0; return; } last = now;
    };
    st.onpointermove = (e) => {
      if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2) { const [a, b] = [...pts.values()]; V.z = Math.max(1, Math.min(5, z0 * Math.hypot(a[0] - b[0], a[1] - b[1]) / d0)); img.style.transform = `scale(${V.z})`; return; }
      dx = e.clientX - x0; dy = e.clientY - y0;
      if (V.z > 1) { img.style.transform = `translate(${dx}px, ${dy}px) scale(${V.z})`; return; }
      if (Math.abs(dy) > Math.abs(dx) && dy > 0) { img.style.transform = `translateY(${dy}px) scale(${1 - Math.min(dy, 300) / 1200})`; document.getElementById("viewer").style.background = `rgba(10,12,14,${1 - Math.min(dy, 300) / 400})`; }
      else img.style.transform = `translateX(${dx}px)`;
    };
    st.onpointerup = st.onpointercancel = (e) => {
      pts.delete(e.pointerId); if (pts.size) return;
      document.getElementById("viewer").style.background = "";
      if (V.z > 1) return;
      if (dy > 110 && Math.abs(dy) > Math.abs(dx)) return closeViewer();
      if (dx < -60 && V.i < V.list.length - 1) { V.i++; V.z = 1; return paintViewer(); }
      if (dx > 60 && V.i > 0) { V.i--; V.z = 1; return paintViewer(); }
      img.style.transform = `scale(${V.z})`;
    };
  }
  function closeViewer() { const el = document.getElementById("viewer"); el.classList.remove("is-open"); el.setAttribute("aria-hidden", "true"); V = null; }

  // A video: its player in a sheet, with your place kept, then the watching room.
  function videoView(x) {
    const { esc, ic, D } = M();
    M().sheet(`<div class="m-grab" data-drag="sheet"></div><div class="cp-vid"><img alt="" src="${D.IMG[x.img]}"><button class="cp-vplay" type="button" data-p="vplay" aria-label="Play">${ic("play")}</button><span class="cp-bar on"><i style="width:${(x.prog || 0) * 100}%"></i></span></div>
      <div class="m-sheet-body"><h2 class="cp-ih">${esc(x.title)}</h2><p class="r-meta">${esc(x.creator)} · ${x.dur}${x.prog ? ` · ${Math.round(x.prog * 100)}% watched` : ""}${coll(x.coll) ? ` · ${coll(x.coll).name}` : ""}</p>
        ${statusSeg(x)}
        <div class="cp-iacts"><button class="m-btn is-primary is-big" type="button" data-p="vroom">${ic("watch", "sm")}${x.prog ? "Resume in the watching room" : "Open the watching room"}</button><button class="m-btn is-big" type="button" data-p="explain" data-id="${x.id}">${ic("spark", "sm")}Explain… (make a Lumen or a course)</button></div>
        ${topicsRow(x)}</div>`);
  }
  // A link: the web viewer, with the page's preview and a reader view.
  function webView(x) {
    const { esc, ic, D } = M();
    M().sheet(`<div class="m-grab" data-drag="sheet"></div><div class="m-sheet-head" data-drag="sheet"><small class="cp-site">${ic("link", "xs")}${esc(x.site)}</small><span style="flex:1"></span><button class="m-ib" type="button" data-act="sheetx" aria-label="Close">${ic("x")}</button></div>
      <div class="m-sheet-body">${x.img ? `<img alt="" src="${D.IMG[x.img]}" class="cp-iimg">` : ""}<h2 class="cp-ih">${esc(x.title)}</h2><p class="cp-reader">${esc(x.desc)} The web viewer shows the page itself here, with a reader view for long articles; your highlights become quotes on this source.</p>
        ${statusSeg(x)}
        <div class="cp-iacts"><button class="m-btn is-big" type="button" data-p="vroom">Open in the browser ↗</button><button class="m-btn is-big" type="button" data-p="explain" data-id="${x.id}">${ic("spark", "sm")}Explain…</button></div>${topicsRow(x)}</div>`);
  }
  // A PDF: the reading room, full screen, pages scrolling, notes in the margin.
  function pdfRoom(x) {
    const { esc, ic } = M(), el = document.getElementById("viewer");
    el.innerHTML = `<div class="cp-pdf"><header class="cp-pdftop m-mat"><button class="r-back" type="button" data-p="vclose">${ic("left", "sm")}<span>Commonplace</span></button><b>${esc(x.title)}</b><button class="m-ib" type="button" data-p="pdfnotes" aria-label="Notes">${ic("note", "sm")}</button></header>
      <div class="cp-pages" id="pdfpages">${Array.from({ length: 8 }, (_, i) => `<div class="cp-page"><b>${i ? `${i + 1}  ${["Daylight factor", "Glare", "Sky models", "Side lighting", "Top lighting", "Shading", "Controls"][i - 1]}` : esc(x.title)}</b>${Array.from({ length: i ? 14 : 4 }, () => "<i></i>").join("")}<small>${i + 1}</small></div>`).join("")}</div>
      <footer class="cp-pdfbar m-mat"><span id="pdfp">Page 1 of ${x.pages}</span><input type="range" min="1" max="${x.pages}" value="1" aria-label="Page" id="pdfr"><button class="m-btn" type="button" data-p="explain" data-id="${x.id}">${ic("spark", "xs")}Explain…</button></footer></div>`;
    el.classList.add("is-open"); el.setAttribute("aria-hidden", "false");
    const pages = document.getElementById("pdfpages");
    pages.onscroll = () => { const p = Math.min(x.pages, 1 + Math.floor(pages.scrollTop / 520)); document.getElementById("pdfp").textContent = `Page ${p} of ${x.pages}`; document.getElementById("pdfr").value = p; };
    document.getElementById("pdfr").oninput = (e) => { pages.scrollTop = (Number(e.target.value) - 1) * 520; };
  }
  // Notes, quotes, long notes and books: their page, in a full sheet.
  function itemPage(x) {
    const { esc, ic } = M();
    const body = x.type === "quote" ? `<blockquote class="cp-q" contenteditable="true">${esc(x.title)}</blockquote><p class="r-meta">${esc(x.src)}</p>`
      : x.type === "book" ? `<div class="cp-ibook"><span class="cp-book big"><b>${esc(x.title)}</b><small>${esc(x.creator)}</small></span></div><h2 class="cp-ih">${esc(x.title)}</h2><p class="r-meta">${esc(x.creator)}</p>${statusSeg(x)}`
      : `${x.type === "longnote" ? `<h2 class="cp-ih" contenteditable="true">${esc(x.title)}</h2>` : ""}<div class="cp-write" contenteditable="true">${esc(x.type === "longnote" ? x.text : x.title)}</div>`;
    M().sheet(`<div class="m-grab" data-drag="sheet"></div><div class="m-sheet-head" data-drag="sheet"><small class="m-kicker">${x.kind}${coll(x.coll) ? ` · ${esc(coll(x.coll).name)}` : ""}</small><span style="flex:1"></span><button class="m-ib" type="button" data-p="imenu" data-id="${x.id}" aria-label="More">${ic("more")}</button><button class="m-ib" type="button" data-act="sheetx" aria-label="Done">${ic("check")}</button></div>
      <div class="m-sheet-body cp-ipage">${body}${topicsRow(x)}<div class="cp-iacts"><button class="m-btn is-big" type="button" data-p="explain" data-id="${x.id}">${ic("spark", "sm")}Explain…</button><button class="m-btn is-big" type="button" data-p="conn" data-id="${x.id}">${ic("network", "sm")}Show connections</button></div></div>`);
    document.getElementById("sheet").classList.add("is-tall");
  }
  const statusSeg = (x) => (typeOf(x) === "source" ? `<div class="m-seg cp-status" role="group" aria-label="Status">${STATUSES.map(([k, l]) => `<button type="button" data-p="setstate" data-id="${x.id}" data-s="${k}" aria-pressed="${(x.state || "unread") === k}">${l}</button>`).join("")}</div>` : "");
  const topicsRow = (x) => { const { esc } = M(), T = M().T(); return `<div class="cp-topics"><small>Topics</small>${x.topics.map((t) => `<button class="m-chip" type="button" data-p="vtopic" data-t="${t}">${esc(T.get(t).name)}</button>`).join("")}<button class="m-chip is-add" type="button" data-p="addtopic" data-id="${x.id}">+ Topic</button></div>`; };

  /* ---------- the bar in Commonplace: it searches as you type, and captures ---------- */
  function placeholder() { return C.tab === "collections" ? "Search your collections…" : C.collPage ? `Search ${coll(C.collPage).name}…` : PLACE[C.type]; }
  function onBarInput(v) { C.q = v; repaintBody(); }
  function barPanel(q) {
    const { esc, ic, plural } = M();
    if (!q) return `<div class="m-finds" data-keep><div class="m-head">Views</div>${VIEWS.map((v, i) => `<button type="button" data-keep data-p="view" data-k="${i}">${ic("filter", "sm")}<span class="m-txt"><b>${esc(v.name)}</b></span></button>`).join("")}<button type="button" data-p="capnote">${ic("plus", "sm")}<span class="m-txt"><b class="m-ask">Capture a thought, quote or link…</b></span></button></div>`;
    const n = C.tab === "everything" ? filtered().length : 0;
    return `<div class="m-finds" data-keep>${C.tab === "everything" ? `<div class="m-head">${plural(n, "match", "matches")} on the wall</div>` : ""}<button type="button" data-p="capnote" data-v="${esc(q)}">${ic("note", "sm")}<span class="m-txt"><b>Save “${esc(q)}” as a note</b><small>Looks like a Note</small></span></button><button type="button" data-ask="${esc(q)}">${ic("spark", "sm")}<span class="m-txt"><b class="m-ask">Ask Loci “${esc(q)}”</b></span></button></div>`;
  }
  function onSubmit(text) { C.q = text; repaintBody(); return true; }
  function repaintBody() {
    if (M().S.dest !== "commonplace") return;
    const b = document.getElementById("cpbody");
    if (C.collPage || !b) { M().render(); return; }
    b.innerHTML = C.tab === "everything" ? everything() : C.tab === "collections" ? collectionsTab() : C.tab === "toread" ? toRead() : templates();
    const f = document.querySelector(".cp-fold"); if (f) f.innerHTML = typeRow() + slimBar();
  }
  function rerender() { M().render(); }

  /* ---------- clicks ---------- */
  let held = false;
  function click(t) {
    const d = t.dataset, mp = M(), { esc, ic } = mp, T = mp.T();
    switch (d.p) {
      case "cparea": {
        const areas = T ? mp.S.topics.filter((x) => !x.parentId) : [];
        const n = (a) => items().filter((x) => (a === "none" ? !x.topics.length : areaOfItem(x).includes(a))).length;
        mp.menu(mp.anchor(t, { align: "center" }), `<button type="button" data-m="all">All areas<small class="cp-mn">${items().length}</small></button>${areas.filter((a) => n(a.id)).map((a) => `<button type="button" data-m="${a.id}">${esc(a.name)}<small class="cp-mn">${n(a.id)}</small></button>`).join("")}<button type="button" data-m="none">No area yet<small class="cp-mn">${n("none")}</small></button>`,
          Object.fromEntries(["all", "none", ...areas.map((a) => a.id)].map((k) => [k, () => { C.area = k; C.topic = null; rerender(); mp.toast(k === "all" ? "All areas" : `Showing ${k === "none" ? "entries with no area yet" : T.get(k).name}. New captures go there too.`); }])));
        return true;
      }
      case "select": C.sel = C.sel ? null : new Set(); rerender(); return true;
      case "cptab": C.tab = d.t; C.q = ""; C.sel = null; rerender(); document.getElementById("stage").scrollTop = 0; return true;
      case "cptype": C.type = d.t; C.coll = null; C.status = C.style = C.shape = C.colour = C.light = null; if (d.t !== "photo") C.layout = "masonry"; rerender(); return true;
      case "cpcoll": C.coll = C.coll === d.c ? null : d.c; rerender(); return true;
      case "cpshow": C.show = d.s; repaintBody(); return true;
      case "cptopic": {
        const used = new Set(items().filter(inArea).flatMap((x) => x.topics));
        const list = mp.S.topics.filter((x) => used.has(x.id)).slice(0, 14);
        mp.menu(mp.anchor(t), `<button type="button" data-m="any">Any topic${!C.topic ? ic("check", "sm") : ""}</button>${list.map((x) => `<button type="button" data-m="${x.id}">${esc(x.name)}<small class="cp-mn">${esc(T.get(mp.areaOf(x.id)).name)}</small></button>`).join("")}`,
          Object.fromEntries([["any", () => { C.topic = null; repaintBody(); }], ...list.map((x) => [x.id, () => { C.topic = x.id; repaintBody(); }])]));
        return true;
      }
      case "cpstatus": mp.menu(mp.anchor(t), `<button type="button" data-m="any">Any status</button>${STATUSES.map(([k, l]) => `<button type="button" data-m="${k}">${l}${C.status === k ? ic("check", "sm") : ""}</button>`).join("")}`, Object.fromEntries([["any", () => { C.status = null; repaintBody(); }], ...STATUSES.map(([k]) => [k, () => { C.status = k; repaintBody(); }])])); return true;
      case "cpstyle": mp.menu(mp.anchor(t), `<button type="button" data-m="any">Any style</button>${STYLES.map(([k, l]) => `<button type="button" data-m="${k}">${l}${C.style === k ? ic("check", "sm") : ""}</button>`).join("")}`, Object.fromEntries([["any", () => { C.style = null; repaintBody(); }], ...STYLES.map(([k]) => [k, () => { C.style = k; repaintBody(); }])])); return true;
      case "cpcolour": mp.menu(mp.anchor(t), `<div class="cp-swatches">${COLOURS.map(([k, l, h]) => `<button type="button" data-m="${k}" aria-label="${l}" title="${l}" class="${C.colour === k ? "on" : ""}"><i style="background:${h}"></i></button>`).join("")}</div><button type="button" data-m="any">Any colour</button>`, Object.fromEntries([["any", () => { C.colour = null; repaintBody(); }], ...COLOURS.map(([k]) => [k, () => { C.colour = k; repaintBody(); }])])); return true;
      case "cpmore": mp.menu(mp.anchor(t), `${SHAPES.map(([k, l]) => `<button type="button" data-m="s-${k}">${l}${C.shape === k ? ic("check", "sm") : ""}</button>`).join("")}<div class="m-sep"></div><button type="button" data-m="l-light">Light${C.light === "light" ? ic("check", "sm") : ""}</button><button type="button" data-m="l-dark">Dark${C.light === "dark" ? ic("check", "sm") : ""}</button><div class="m-sep"></div><button type="button" data-m="clear">Any shape or light</button>`,
        { ...Object.fromEntries(SHAPES.map(([k]) => [`s-${k}`, () => { C.shape = k; repaintBody(); }])), "l-light": () => { C.light = "light"; repaintBody(); }, "l-dark": () => { C.light = "dark"; repaintBody(); }, clear: () => { C.shape = C.light = null; repaintBody(); } }); return true;
      case "display": displaySheet(); return true;
      case "cpview": C.view = d.v; repaintBody(); return true;
      case "cpclear": C.q = ""; C.topic = C.colour = C.shape = C.status = C.style = C.light = null; C.show = "all"; repaintBody(); return true;
      case "cpclearq": C.q = ""; repaintBody(); return true;
      case "view": { const v = VIEWS[Number(d.k)]; Object.assign(C, { tab: "everything", coll: null, show: "all", status: null, colour: null }, v.set); const i = document.getElementById("barInput"); i.value = ""; i.blur(); mp.S.bar.mode = "idle"; rerender(); mp.toast(v.name); return true; }
      case "capnote": { const i = document.getElementById("barInput"); const v = d.v || ""; mp.S.bar.mode = "capture"; mp.S.bar.capture = "note"; i.value = v; mp.paintDock(); i.focus(); return true; }
      case "open": {
        if (held) { held = false; return true; }
        if (C.sel) { C.sel.has(d.id) ? C.sel.delete(d.id) : C.sel.add(d.id); repaintBody(); const sb = document.querySelector(".cp-selbar"); if (sb) sb.outerHTML = selectBar(); return true; }
        openItem(d.id); return true;
      }
      case "album": { C.type = "photo"; C.coll = null; rerender(); mp.toast(`${M().D.ALBUMS[d.a]}: albums open as photos on Photos`); return true; }
      case "cpcollpage": C.collPage = d.c; C.q = ""; rerender(); document.getElementById("stage").scrollTop = 0; return true;
      case "cpcollback": C.collPage = null; C.tab = "collections"; rerender(); return true;
      case "newcoll": newCollection(d.t); return true;
      case "additems": mp.toast("Add items: the item picker, filtered to this collection’s type, multi-select."); return true;
      case "editcoll": mp.toast("Edit collection: fields, layout, cover and colour. Save changes."); return true;
      case "readtab": C.readTab = d.t; repaintBody(); return true;
      case "seltopic": mp.toast(`Add topics to ${C.sel.size}: the topic picker, as on a card.`); return true;
      case "selmove": moveSheet([...C.sel]); return true;
      case "selpick": items().forEach((x) => { if (C.sel.has(x.id)) x.picked = true; }); mp.toast(`Picked ${C.sel.size}`); C.sel = null; rerender(); return true;
      case "seldel": mp.toast(`Delete ${C.sel.size}… asks first, as a sheet at the foot.`); return true;
      // the viewer
      case "vclose": closeViewer(); return true;
      case "vinfo": V.info = !V.info; paintViewer(); return true;
      case "vpick": { const x = V.list[V.i]; x.picked = !x.picked; paintViewer(); return true; }
      case "vlumen": { const x = V.list[V.i]; closeViewer(); mp.openLumenSheet({ topicId: x.topics[0] || null, question: `What can I learn from “${x.title}”?`, format: "watch" }); return true; }
      case "vloci": case "vtopic": { const x = V ? V.list[V.i] : null, tid = d.t || x?.topics[0]; closeViewer(); mp.closeSheet(); if (tid) mp.goTo(tid); else mp.toast("Give it a topic first, and it shows on Loci."); return true; }
      case "vshare": mp.toast("Copy image · Copy link · Share…"); return true;
      case "vmore": mp.menu(mp.anchor(t, { align: "right" }), `<button type="button" data-m="copy">Copy image</button><button type="button" data-m="move">Move to collection…</button><button type="button" data-m="note">Note a detail</button><button type="button" class="is-danger" data-m="del">Delete…</button>`, { copy: () => mp.toast("Image copied"), move: () => moveSheet([V.list[V.i].id]), note: () => mp.toast("Drag a box over the detail, then write."), del: () => mp.toast("Delete… asks first.") }); return true;
      case "vaddtopic": case "addtopic": mp.toast("+ Topic: search your topics, or make one."); return true;
      case "vplay": mp.toast("Plays here; your place is kept."); return true;
      case "vroom": mp.closeSheet(); mp.toast("Opens full screen; the bar steps aside."); return true;
      case "explain": { const x = items().find((i) => i.id === d.id); mp.closeSheet(); closeViewer(); explainSheet(x); return true; }
      case "conn": mp.closeSheet(); mp.toast("Show connections: the topics, Lumens and notes linked to this, on Loci."); return true;
      case "setstate": { const x = items().find((i) => i.id === d.id); x.state = d.s; t.parentElement.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === t))); return true; }
      case "imenu": mp.menu(mp.anchor(t, { align: "right" }), `<button type="button" data-m="move">Move to collection…</button><button type="button" data-m="area">Area ›</button><button type="button" data-m="link">Copy link</button><button type="button" class="is-danger" data-m="del">Delete…</button>`, { move: () => moveSheet([d.id]), area: () => mp.toast("Area: pick one of your areas."), link: () => mp.toast("Link copied"), del: () => mp.toast("Delete… asks first.") }); return true;
      case "pdfnotes": mp.toast("Notes · your margin notes on this PDF, by page."); return true;
    }
    return false;
  }
  function displaySheet() {
    const mp = M(), { ic } = mp;
    const seg = (key, opts) => `<div class="m-seg cp-dseg" style="grid-template-columns:repeat(${opts.length},1fr)">${opts.map(([k, l]) => `<button type="button" data-d="${key}" data-v="${k}" aria-pressed="${String(C[key]) === String(k)}">${l}</button>`).join("")}</div>`;
    mp.sheet(`<div class="m-grab" data-drag="sheet"></div><div class="m-sheet-head" data-drag="sheet"><h2>Display</h2><button class="m-ib" type="button" data-act="sheetx" aria-label="Close">${ic("x")}</button></div>
      <div class="m-sheet-body cp-display">
        <label>View</label>${seg("view", [["wall", "Wall"], ["shelves", "Shelves"]])}
        ${C.type === "photo" ? `<label>Layout</label>${seg("layout", [["rows", "Rows"], ["masonry", "Masonry"], ["grid", "Grid"]])}` : ""}
        <label>Size</label>${seg("cols", [[3, "Small"], [2, "Medium"], [1, "Large"]])}
        <label>Sort</label>${seg("sort", [["newest", "Newest"], ["oldest", "Oldest"], ["title", "Title"]])}
        ${C.type === "photo" ? `<label>Captions</label>${seg("caps", [[true, "Show"], [false, "Hide"]])}` : ""}
        <label>Views</label><div class="m-rows">${VIEWS.map((v, i) => `<button class="m-row" type="button" data-p="view" data-k="${i}"><span class="m-txt"><b>${M().esc(v.name)}</b></span>${ic("right", "sm m-chev")}</button>`).join("")}<button class="m-row" type="button" id="saveview"><span class="m-txt"><b style="color:var(--accent)">Save these filters as a View…</b></span></button></div>
      </div>`, (el) => {
      el.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => {
        const k = b.dataset.d, v = b.dataset.v; C[k] = k === "cols" ? Number(v) : k === "caps" ? v === "true" : v;
        b.parentElement.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); repaintBody();
      }));
      el.querySelector("#saveview").onclick = () => { M().closeSheet(); M().toast("Saved as a View. It’s under Views when you tap the bar."); };
      el.querySelectorAll('[data-p="view"]').forEach((b) => b.addEventListener("click", () => M().closeSheet()));
    });
  }
  function moveSheet(ids) {
    const mp = M(), { esc, ic, D } = mp, x = items().find((i) => i.id === ids[0]), type = typeOf(x);
    mp.sheet(`<div class="m-grab" data-drag="sheet"></div><div class="m-sheet-head" data-drag="sheet"><h2>Move to collection</h2><button class="m-ib" type="button" data-act="sheetx" aria-label="Close">${ic("x")}</button></div>
      <div class="m-sheet-body"><div class="m-rows">${D.COLLECTIONS.filter((c) => c.type === type).map((c) => `<button class="m-row" type="button" data-mv="${c.id}"><span class="m-thumb">${ic("folder", "sm")}</span><span class="m-txt"><b>${esc(c.name)}</b></span></button>`).join("")}<button class="m-row" type="button" data-mv=""><span class="m-txt"><b>No collection</b></span></button><button class="m-row" type="button" data-mvnew="1"><span class="m-txt"><b style="color:var(--accent)">New collection…</b></span></button></div></div>`, (el) => {
      el.querySelectorAll("[data-mv]").forEach((b) => b.addEventListener("click", () => { items().forEach((i) => { if (ids.includes(i.id)) i.coll = b.dataset.mv || null; }); M().closeSheet(); C.sel = null; M().toast(`Moved ${ids.length === 1 ? "1 item" : `${ids.length} items`}`); rerender(); }));
      el.querySelector("[data-mvnew]").addEventListener("click", () => newCollection(type));
    });
  }
  function newCollection(type) {
    const mp = M(), { ic } = mp;
    const four = [["note", "Notes", "your writing and quotes"], ["source", "Sources", "links, videos, PDFs, books"], ["photo", "Photos", "pictures and their groups"], ["object", "Objects", "people, buildings, cases… with your own fields"]];
    let pick = type || "photo";
    mp.sheet(`<div class="m-grab" data-drag="sheet"></div><div class="m-sheet-head" data-drag="sheet"><h2>New collection</h2><button class="m-ib" type="button" data-act="sheetx" aria-label="Close">${ic("x")}</button></div>
      <div class="m-sheet-body cp-new"><label for="ncname">Name</label><input id="ncname" type="text" placeholder="Site visits, Reading list, People…" autocomplete="off">
        <label>Type</label><div class="m-rows">${four.map(([k, n, d]) => `<button class="m-row" type="button" data-nt="${k}" aria-pressed="${pick === k}"><span class="m-txt"><b>${n}</b><small>${d}</small></span><i class="cp-radio"></i></button>`).join("")}</div>
        <button class="m-btn is-primary is-big" type="button" id="nccreate">Create</button><p class="m-fine">Fields, layout, cover and colour are in Edit collection.</p></div>`, (el) => {
      el.querySelectorAll("[data-nt]").forEach((b) => b.addEventListener("click", () => { pick = b.dataset.nt; el.querySelectorAll("[data-nt]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }));
      el.querySelector("#nccreate").onclick = () => {
        const name = el.querySelector("#ncname").value.trim() || "New collection", id = mp.nextId("c");
        mp.D.COLLECTIONS.push({ id, name, type: pick }); mp.closeSheet(); C.collPage = id; C.tab = "collections"; mp.setDest("commonplace"); rerender();
      };
      setTimeout(() => el.querySelector("#ncname").focus(), 300);
    });
  }
  function explainSheet(x) {
    const mp = M(), { ic, esc } = mp;
    const long = ["book", "pdf", "video"].includes(x.type);
    mp.sheet(`<div class="m-grab" data-drag="sheet"></div><div class="m-sheet-head" data-drag="sheet"><h2>Explain</h2><button class="m-ib" type="button" data-act="sheetx" aria-label="Close">${ic("x")}</button></div>
      <div class="m-sheet-body"><span class="m-about">${ic("commonplace", "xs")}${esc(x.title)}</span>
        <div class="m-rows">${(long ? [["whole", "The whole thing", "One Lumen, the whole source"], ["parts", "Part by part", "A course: start with part 1"], ["chapter", "One chapter", "Choose pages instead"]] : [["whole", "The whole thing", "One Lumen about it"]]).map(([k, t, d], i) => `<button class="m-row" type="button" data-ex="${k}" aria-pressed="${i === 0}"><span class="m-txt"><b>${t}</b><small>${d}</small></span><i class="cp-radio"></i></button>`).join("")}</div>
        <label class="cp-lab" for="exfocus">Focus on… (optional)</label><input id="exfocus" class="cp-in" type="text" placeholder="the daylight chapters, for a library">
        <button class="m-btn is-primary is-big" type="button" id="exgo" style="margin-top:14px">Make a Lumen</button></div>`, (el) => {
      let k = "whole";
      el.querySelectorAll("[data-ex]").forEach((b) => b.addEventListener("click", () => { k = b.dataset.ex; el.querySelectorAll("[data-ex]").forEach((y) => y.setAttribute("aria-pressed", String(y === b))); el.querySelector("#exgo").textContent = k === "parts" ? "Start with part 1" : "Make a Lumen"; }));
      el.querySelector("#exgo").onclick = () => { mp.closeSheet(); mp.makeLumen(x.topics[0] || null, "watch", x.title); mp.toast(k === "parts" ? "Making Part 1. The other parts are made as you open them." : "Making a Lumen. It lands in Learn."); };
    });
  }

  // Hold a card for its menu (the app's card menu), as iOS does.
  document.addEventListener("pointerdown", (e) => {
    const cardEl = e.target.closest(".cp-card, .cp-rowpic, .cp-sq"); if (!cardEl || C.sel) return;
    const x0 = e.clientX, y0 = e.clientY;
    const tm = setTimeout(() => {
      held = true; navigator.vibrate?.(8);
      const id = cardEl.dataset.id, mp = M(), { ic } = mp, a = document.getElementById("app").getBoundingClientRect();
      if (!id) return;
      mp.menu({ x: x0 - a.left, y: y0 - a.top }, `<button type="button" data-m="move">Move to collection${ic("folder", "sm")}</button><button type="button" data-m="area">Area ›${ic("network", "sm")}</button><button type="button" data-m="explain">Explain…${ic("spark", "sm")}</button><button type="button" data-m="conn">Show connections${ic("map", "sm")}</button><button type="button" data-m="link">Copy link${ic("link", "sm")}</button><button type="button" data-m="sel">Select${ic("check", "sm")}</button><button type="button" class="is-danger" data-m="del">Delete…${ic("trash", "sm")}</button>`,
        { move: () => moveSheet([id]), area: () => mp.toast("Area: pick one of your areas."), explain: () => explainSheet(items().find((i) => i.id === id)), conn: () => mp.toast("Show connections: on Loci."), link: () => mp.toast("Link copied"), sel: () => { C.sel = new Set([id]); rerender(); }, del: () => mp.toast("Delete… asks first.") }, true);
    }, 480);
    const cancel = (ev) => { if (ev.type === "pointermove" && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 8) return; clearTimeout(tm); window.removeEventListener("pointermove", cancel); window.removeEventListener("pointerup", cancel); };
    window.addEventListener("pointermove", cancel); window.addEventListener("pointerup", cancel);
  });
  // The header's lower rows fold away while you scroll down, and come back when you scroll up (as Safari's bars do).
  function mounted(st) {
    // Folding the rows changes the page's height, which moves the scroll position: ignore that for a moment.
    let lastY = st.scrollTop, quietUntil = 0;
    st.addEventListener("scroll", () => {
      const y = st.scrollTop, h = document.getElementById("cphead"); if (!h) return;
      if (performance.now() < quietUntil) { lastY = y; return; }
      const fold = y > 260 && y > lastY + 8, unfold = y < lastY - 14 || y < 160;
      if (fold && !C.collapsed) { h.classList.add("is-collapsed"); C.collapsed = true; quietUntil = performance.now() + 450; }
      else if (unfold && C.collapsed) { h.classList.remove("is-collapsed"); C.collapsed = false; quietUntil = performance.now() + 450; }
      lastY = y;
    });
  }

  window.MP_PAGES = window.MP_PAGES || {};
  window.MP_PAGES.commonplace = { html, top, click, placeholder, barPanel, onBarInput, onSubmit, mounted, openItem };
})();
