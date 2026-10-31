/* Studiolo on iPad (prototype): the iPad layer over the phone shell.
   One app, one state (window.MP.S), two size classes:
   - compact (under 700 px: Slide Over, a narrow Split View or Stage Manager window): the phone shell exactly, untouched;
   - regular (700 px and up): the same app laid out for iPad. This file only moves and decorates what the phone shell
     draws, so a live resize between the two keeps the place, the card, the room and playback.
   In regular widths:
   - a sidebar replaces the drawer: docked in landscape from 1000 px, over the content in portrait;
   - the bar stays the one field, centred at the foot of the content column; ⌘K focuses it, holding ⌘⇧D talks;
   - in Loci the card becomes an inspector: floating on the right in landscape (resizable, its size remembered),
     a sheet with the same three heights in portrait;
   - Lumen and course rooms put the stage beside the transcript, chapters or reading in landscape;
   - Watch leaves as a picture-in-picture tile; Listen leaves as Now Playing (the sidebar's foot, or above the bar);
   - Commonplace opens an item beside the wall in landscape and takes drops from other apps. */
"use strict";
(() => {
  const MP = window.MP, IP = window.IPAD, S = MP.S, D = MP.D, $ = MP.$, $$ = MP.$$, esc = MP.esc, ic = MP.ic;
  const app = $("#app"), side = $("#side"), insp = $("#insp"), host = $("#inspHost"), dock = $("#dock"), pip = $("#pip");
  const isMac = /Mac|iPad|iPhone/.test(navigator.platform || navigator.userAgent);
  const K = isMac ? "⌘" : "Ctrl ";
  const P2 = {
    sidebar: '<rect x="3" y="4.5" width="18" height="15" rx="2.6"/><path d="M9.5 4.5v15M5.6 8.5h1.6M5.6 11.5h1.6"/>',
    pip: '<rect x="3" y="5" width="18" height="14" rx="2.2"/><rect x="11.5" y="11" width="7" height="5.5" rx="1" fill="currentColor" stroke="none"/>',
    expand: '<path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7"/>',
    kbd: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h1M9.5 10h1M13 10h1M16.5 10h1M7 14h10"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    drop: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M4.5 15.5v3a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-3"/>',
  };
  const ic2 = (n, cls = "") => `<svg class="m-ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P2[n]}</svg>`;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(`studiolo.ipad.${k}`); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(`studiolo.ipad.${k}`, JSON.stringify(v)); } catch { /* private window: lasts this visit */ } },
  };

  /* ---------- size classes ---------- */
  // Regular from 700 px (the app's COMPACT edge, unchanged); "wide" is landscape from 1000 px: the sidebar docks and
  // the inspector floats beside the canvas. Split View at two thirds (981) and every portrait iPad are regular, not wide.
  const Q = { regular: matchMedia("(min-width: 700px)"), wide: matchMedia("(min-width: 1000px) and (orientation: landscape)") };
  const L = { sideOpen: false, sideHidden: store.get("sideHidden", false), inspW: store.get("inspW", 360), corner: store.get("pipCorner", "br"), cls: null, coll: null };
  const regular = () => Q.regular.matches, wide = () => regular() && Q.wide.matches;
  const docked = () => wide() && !L.sideHidden;
  const sizeClass = () => (!regular() ? "compact" : wide() ? "inspector" : "sheet");
  const inLoci = () => S.dest === "loci" && !window.MP_ROOM;
  const cardShown = () => { const c = $("#card"); return !!c && wide() && inLoci() && host.contains(c); };

  // What the inspector and the dock cover, for the Palace and the Map (ipad-pre.js).
  IP.cover = () => {
    if (!wide() || S.dest !== "loci") return null;
    return { right: cardShown() ? L.inspW + 24 : 0, bottom: (dock.offsetHeight || 70) + 6 };
  };
  const refit = () => { IP.engine?.setView({ ...IP.engine.view }); IP.refit?.(); };

  function layout() {
    const r = regular(), w = wide(), cls = sizeClass();
    if (L.cls && L.cls !== cls) {
      // The card's height is the learner's, per size class: a phone card, an iPad sheet and an inspector each keep theirs.
      store.set(`detent.${L.cls}`, S.detent);
      const d = store.get(`detent.${cls}`, null);
      if (d) S.detent = d;
    } else if (!L.cls && cls !== "compact") S.detent = store.get(`detent.${cls}`, "card");
    L.cls = cls;
    if (!r) L.sideOpen = false;
    app.classList.toggle("ip-regular", r);
    app.classList.toggle("ip-wide", w);
    app.classList.toggle("ip-docked", docked());
    app.classList.toggle("ip-side-open", r && !docked() && L.sideOpen);
    app.style.setProperty("--insp-w", `${L.inspW}px`);
    if (r && $("#drawer").classList.contains("is-open")) { MP.drawer(false); }
    placeCard();
    sync(true);
    requestAnimationFrame(() => { if (S.dest === "loci" && $("#card") && !$("#card").hidden) MP.setDetent(S.detent); refit(); });
  }
  Q.regular.addEventListener("change", layout);
  Q.wide.addEventListener("change", layout);

  /* ---------- the card: an inspector in landscape, a sheet in portrait, the phone's card when compact ---------- */
  function placeCard() {
    const card = $("#card"); if (!card) return;
    if (wide()) { if (card.parentElement !== host) host.appendChild(card); }
    else if (card.parentElement !== dock) { const mini = $("#dmini"); dock.insertBefore(card, mini && mini.parentElement === dock ? mini : $("#bar")); }
  }

  /* ---------- keeping up with the phone shell: it repaints; this layer re-places and re-decorates ---------- */
  let queued = false;
  function sync(now) {
    if (!now) { if (queued) return; queued = true; queueMicrotask(() => { queued = false; sync(true); }); return; }
    app.classList.toggle("ip-loci", S.dest === "loci");
    app.classList.toggle("ip-room", !!window.MP_ROOM);
    app.classList.toggle("ip-has-insp", cardShown());
    app.dataset.ipdest = S.dest;
    placeCard();
    placePlayer();
    paintSide();
    decorateTop();
    splitRoom();
    splitItem();
    if (L.cls && L.cls !== "compact") store.set(`detent.${L.cls}`, S.detent);
    // The phone shell measured the card while the inspector was still hidden (a room or another page was over it).
    const c = $("#card");
    if (cardShown() && c && !c.hidden && parseFloat(c.style.height || "1") < 2) requestAnimationFrame(() => { MP.setDetent(S.detent); refit(); });
  }
  const watch = (el, opts) => new MutationObserver(() => sync()).observe(el, opts);
  watch(dock, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] });
  watch($("#tb"), { childList: true });
  watch($("#stage"), { childList: true });
  watch($("#room"), { childList: true, attributes: true, attributeFilter: ["class"] });
  watch($("#sheet"), { attributes: true, attributeFilter: ["class"] });
  watch($("#drawer"), { childList: true });

  /* ---------- the sidebar (replaces the drawer in regular widths) ---------- */
  side.innerHTML = `<div class="ip-side-head"><span class="m-mark">S</span><b>Studiolo</b><button class="m-ib" type="button" data-ip="sidetoggle" aria-label="Hide sidebar">${ic2("sidebar")}</button></div>
    <div class="ip-side-list" id="sideList"></div><div class="ip-side-now" id="sideNow"></div><div class="ip-side-foot" id="sideFoot"></div>`;
  const DEST = [["today", "Today", "sun"], ["learn", "Learn", "grad"], ["commonplace", "Commonplace", "library"], ["loci", "Loci", "network"]];
  const row = (attrs, icon, label, extra = "", current = false, cls = "") => `<button type="button" class="ip-row ${cls}" ${attrs} ${current ? 'aria-current="page"' : ""}>${icon}<span class="ip-l">${label}</span>${extra}</button>`;
  function paintSide() {
    if (!regular()) return;
    const T = MP.T(), dest = S.dest, room = !!window.MP_ROOM;
    const learnTab = $(".p-tabs [aria-pressed='true']")?.dataset.t || "home";
    const onColl = !!$("#stage [data-p='cpcollback']");
    if (!onColl) L.coll = null;
    const cpTab = onColl ? "coll" : $(".cp-tabs [aria-pressed='true']")?.dataset.t || "everything";
    const openArea = S.openId && T.has(S.openId) ? MP.areaOf(S.openId) : null;
    const counts = { learn: MP.plural(S.lumens.filter((l) => l.state === "ready").length, "Lumen"), commonplace: String(S.items.length), loci: String(S.topics.length) };
    const sub = (k) => {
      if (k === "learn") return [["home", "Home"], ["lumens", "Lumens"], ["courses", "Courses"]].map(([t, l]) => row(`data-ip="learn" data-t="${t}"`, "", l, "", dest === "learn" && !room && learnTab === t, "is-sub")).join("");
      if (k === "commonplace") {
        const tabs = [["everything", "Everything"], ["collections", "Collections"], ["toread", "To read"]].map(([t, l]) => row(`data-ip="cp" data-t="${t}"`, "", l, "", dest === "commonplace" && !room && cpTab === t, "is-sub")).join("");
        const colls = D.COLLECTIONS.slice(0, 6).map((c) => row(`data-ip="coll" data-c="${c.id}"`, `<i class="ip-cdot ${c.type}"></i>`, esc(c.name), `<small>${S.items.filter((x) => x.coll === c.id).length}</small>`, dest === "commonplace" && L.coll === c.id, "is-sub")).join("");
        return `${tabs}<h4>Collections</h4>${colls}`;
      }
      if (k === "loci") {
        const areas = MP.kids(null).map((a) => row(`data-ip="area" data-id="${a.id}"`, `<i class="m-sd ${MP.STATUS[a.status].cls}"></i>`, esc(a.name), `<small>${MP.descendants(a.id).length}</small>`, dest === "loci" && openArea === a.id, "is-sub")).join("");
        return `${row('data-ip="area" data-id=""', "", "Your whole map", "", dest === "loci" && !S.openId, "is-sub")}<h4>Areas</h4>${areas}`;
      }
      return "";
    };
    const rec = S.recents.filter((r) => (r.kind === "topic" && T.has(r.id)) || (r.kind === "lumen" && S.lumens.some((l) => l.id === r.id))).slice(0, 4);
    $("#sideList").innerHTML = DEST.map(([k, l, i]) => `${row(`data-ip="dest" data-k="${k}"`, ic(i), l, counts[k] ? `<small>${counts[k]}</small>` : "", dest === k && !room && !(k === "learn" || k === "commonplace" || k === "loci"))}${dest === k ? `<div class="ip-subs">${sub(k)}</div>` : ""}`).join("")
      + (rec.length ? `<h4>Recent</h4>${rec.map((r) => r.kind === "topic"
        ? row(`data-ip="go" data-id="${r.id}"`, `<i class="m-sd ${MP.STATUS[T.get(r.id).status].cls}"></i>`, esc(T.get(r.id).name), "", false, "is-rec")
        : row(`data-ip="lumen" data-id="${r.id}"`, ic(MP.FMT[S.lumens.find((x) => x.id === r.id).format].ic, "sm"), esc(S.lumens.find((x) => x.id === r.id).title), "", window.MP_ROOM && S.player?.id === r.id, "is-rec")).join("")}` : "");
    $("#sideFoot").innerHTML = `<div class="m-seg" role="group" aria-label="Appearance">${[["auto", "Auto"], ["light", "Light"], ["dark", "Dark"]].map(([k, l]) => `<button type="button" data-theme="${k}" aria-pressed="${S.theme === k}">${l}</button>`).join("")}</div>
      ${row('data-ip="keys"', ic2("kbd"), "Keyboard shortcuts", `<small>${K}/</small>`)}${row('data-act="settings"', ic("gear"), "Settings")}`;
    const tg = $("[data-ip='sidetoggle']", side);
    tg.setAttribute("aria-label", docked() ? "Hide sidebar" : "Close sidebar");
  }
  const fake = (data) => { const b = document.createElement("button"); Object.assign(b.dataset, data); return b; };
  function sideAction(t) {
    const d = t.dataset;
    const leaveRoom = () => { if (window.MP_ROOM) window.MP_PAGES.learn.click(fake({ p: "rclose" })); };
    switch (d.ip) {
      case "sidetoggle": return toggleSide();
      case "dest": leaveRoom(); MP.setDest(d.k); break;
      case "learn": leaveRoom(); if (S.dest !== "learn") MP.setDest("learn"); window.MP_PAGES.learn.click(fake({ p: "tab", t: d.t })); break;
      case "cp": leaveRoom(); if (S.dest !== "commonplace") MP.setDest("commonplace"); if ($("#stage [data-p='cpcollback']")) window.MP_PAGES.commonplace.click(fake({ p: "cpcollback" })); window.MP_PAGES.commonplace.click(fake({ p: "cptab", t: d.t })); break;
      case "coll": leaveRoom(); if (S.dest !== "commonplace") MP.setDest("commonplace"); L.coll = d.c; window.MP_PAGES.commonplace.click(fake({ p: "cpcollpage", c: d.c })); break;
      case "area": leaveRoom(); if (S.dest !== "loci") MP.setDest("loci"); if (d.id) MP.goTo(d.id); else MP.goHome(); break;
      case "go": leaveRoom(); MP.goTo(d.id); break;
      case "lumen": window.MP_PAGES.learn.openLumen(d.id); break;
      case "keys": hud(true, true); break;
      default: return;
    }
    if (!docked()) setSideOpen(false);
    sync();
  }
  side.addEventListener("click", (e) => { const t = e.target.closest("[data-ip]"); if (t) sideAction(t); });
  function setSideOpen(on) { L.sideOpen = on; app.classList.toggle("ip-side-open", regular() && !docked() && on); if (on) $("[aria-current]", side)?.focus({ preventScroll: true }); }
  function toggleSide() {
    if (!regular()) return MP.drawer(!$("#drawer").classList.contains("is-open"));
    if (wide()) { L.sideHidden = !L.sideHidden; store.set("sideHidden", L.sideHidden); L.sideOpen = false; layout(); return; }
    setSideOpen(!L.sideOpen);
  }
  $("#sideScrim").addEventListener("click", () => setSideOpen(false));
  // The toolbar's ☰ is the sidebar button in regular widths; the edge swipe opens the sidebar over the content.
  document.addEventListener("click", (e) => {
    if (!regular()) return;
    const t = e.target.closest("[data-act='drawer']");
    if (t) { e.stopPropagation(); e.preventDefault(); toggleSide(); }
  }, true);
  document.addEventListener("pointerdown", (e) => {
    if (!regular() || window.MP_ROOM || docked()) return;
    const a = app.getBoundingClientRect();
    if (e.clientX - a.left >= 22 || $("#viewer").classList.contains("is-open") || $("#sheet").classList.contains("is-open")) return;
    e.stopPropagation(); e.preventDefault();
    const w = side.offsetWidth, x0 = e.clientX; let dx = 0;
    side.classList.add("is-dragging");
    const move = (ev) => { dx = Math.max(0, Math.min(w, ev.clientX - x0)); side.style.transform = `translateX(${dx - w}px)`; };
    const up = () => { removeEventListener("pointermove", move); removeEventListener("pointerup", up); removeEventListener("pointercancel", up); side.classList.remove("is-dragging"); side.style.transform = ""; setSideOpen(dx > w * 0.3); };
    addEventListener("pointermove", move); addEventListener("pointerup", up); addEventListener("pointercancel", up);
  }, true);

  /* ---------- the toolbar: the sidebar button, and Palace · Map · List as a segmented control ---------- */
  function decorateTop() {
    const tb = $("#tb"); if (!regular() || !tb.firstElementChild || tb.querySelector(".ip-mark")) return;
    const btn = $("[data-act='drawer']", tb);
    if (btn) { btn.innerHTML = ic2("sidebar"); btn.setAttribute("aria-label", "Show sidebar"); btn.classList.add("ip-sidebtn"); }
    const title = $(".m-title[data-act='views']", tb);
    if (title) {
      const seg = document.createElement("div");
      seg.className = "ip-viewseg m-seg"; seg.setAttribute("role", "group"); seg.setAttribute("aria-label", "View");
      seg.innerHTML = [["palace", "Palace", "cube"], ["map", "Map", "map"], ["list", "List", "list"]].map(([k, l, i]) => `<button type="button" data-ipview="${k}" aria-pressed="${S.view === k}">${ic(i, "sm")}${l}</button>`).join("");
      title.replaceWith(seg);
    }
    const mark = document.createElement("i"); mark.className = "ip-mark"; mark.hidden = true; tb.appendChild(mark);
  }
  $("#tb").addEventListener("click", (e) => {
    const b = e.target.closest("[data-ipview]"); if (!b) return;
    if (S.view !== b.dataset.ipview) { S.view = b.dataset.ipview; MP.render(); }
  });

  /* ---------- the List as columns (as Files' column view): areas, then each level down to what is open ---------- */
  function paintColumns() {
    const wrap = $("#wrap");
    if (!regular() || S.dest !== "loci" || S.view !== "list" || !wrap || wrap.querySelector(".ip-cols")) return;
    const T = MP.T(), chain = [];
    let t = S.openId && T.has(S.openId) ? T.get(S.openId) : null;
    while (t) { chain.unshift(t.id); t = T.get(t.parentId); }
    const levels = [null, ...chain].map((pid, i) => ({ pid, sel: chain[i] || null })).filter((lv) => lv.pid === null || MP.kids(lv.pid).length || lv.pid === S.openId);
    const col = ({ pid, sel }) => {
      const ks = MP.kids(pid), name = pid ? T.get(pid).name : "Your map";
      return `<section class="ip-col" aria-label="${esc(name)}"><h3>${esc(name)}<small>${ks.length ? MP.plural(ks.length, pid ? (T.get(pid).parentId ? "sub-topic" : "topic") : "area") : "Nothing inside yet"}</small></h3>
        <div class="ip-col-rows">${ks.map((k) => `<button type="button" class="ip-crow" data-open="${k.id}" ${k.id === sel ? 'aria-current="true"' : ""}><i class="m-sd ${MP.STATUS[k.status].cls}${k.wantToLearn ? " focus" : ""}"></i><span>${esc(k.name)}</span>${MP.kids(k.id).length ? `<small>${MP.kids(k.id).length}</small>${ic("right", "sm")}` : ""}</button>`).join("")}
        ${pid && pid === S.openId ? `<button type="button" class="ip-crow is-add" data-act="add">${ic("plus", "sm")}<span>Add ${T.get(pid).parentId ? "a sub-topic" : "a topic"}</span></button>` : ""}</div></section>`;
    };
    wrap.innerHTML = `<div class="ip-cols">${levels.map(col).join("")}</div>`;
    const cols = wrap.querySelector(".ip-cols"); cols.scrollLeft = cols.scrollWidth;
    const fade = () => cols.classList.toggle("is-scrolled", cols.scrollLeft > 4); fade(); cols.addEventListener("scroll", fade, { passive: true });
  }
  new MutationObserver(() => { if (S.view === "list") paintColumns(); }).observe($("#stage"), { childList: true, subtree: true });

  /* ---------- the inspector: resize its width by its left edge, its height by its foot or its name ---------- */
  $("#inspEdge").addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const x0 = e.clientX, w0 = L.inspW, max = () => Math.min(480, app.clientWidth * 0.46);
    insp.classList.add("is-resizing");
    const move = (ev) => { L.inspW = Math.round(Math.max(300, Math.min(max(), w0 - (ev.clientX - x0)))); app.style.setProperty("--insp-w", `${L.inspW}px`); refit(); };
    const up = () => { removeEventListener("pointermove", move); removeEventListener("pointerup", up); insp.classList.remove("is-resizing"); store.set("inspW", L.inspW); MP.setDetent(S.detent); refit(); };
    addEventListener("pointermove", move); addEventListener("pointerup", up);
  });
  $("#inspEdge").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    L.inspW = Math.max(300, Math.min(480, L.inspW + (e.key === "ArrowLeft" ? 20 : -20)));
    app.style.setProperty("--insp-w", `${L.inspW}px`); store.set("inspW", L.inspW); refit();
  });
  const ORDER = ["peek", "card", "full"];
  function nextDetent(d, dir) { return ORDER[Math.max(0, Math.min(2, ORDER.indexOf(d) + dir))]; }
  $("#inspGrab").addEventListener("click", () => L.dragged ? (L.dragged = false) : MP.setDetent(S.detent === "full" ? "card" : nextDetent(S.detent, 1)));
  $("#inspGrab").addEventListener("keydown", (e) => { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); MP.setDetent(nextDetent(S.detent, e.key === "ArrowDown" ? 1 : -1)); } });
  // The inspector hangs from the top, so dragging its foot (or its name) down makes it taller, as a window grows.
  document.addEventListener("pointerdown", (e) => {
    if (!wide()) return;
    const h = e.target.closest("#insp [data-drag='card'], #inspGrab");
    if (!h || (e.target.closest("button") && e.target.closest("button").id !== "inspGrab")) return;
    e.stopPropagation(); e.preventDefault();
    const card = $("#card"), y0 = e.clientY, t0 = performance.now(), h0 = card.offsetHeight, max = insp.clientHeight - 24;
    let dy = 0;
    card.classList.add("is-dragging"); card.dataset.detent = "drag";
    const move = (ev) => { dy = ev.clientY - y0; const raw = h0 + dy; card.style.height = `${raw > max ? max + (raw - max) * 0.2 : raw < 48 ? 48 - (48 - raw) * 0.2 : raw}px`; };
    const up = () => {
      removeEventListener("pointermove", move); removeEventListener("pointerup", up); removeEventListener("pointercancel", up);
      card.classList.remove("is-dragging");
      L.dragged = Math.abs(dy) >= 6; setTimeout(() => { L.dragged = false; }, 400);
      const v = dy / Math.max(1, performance.now() - t0);
      if (Math.abs(dy) < 6) { if (h.id !== "inspGrab") MP.setDetent(S.detent === "peek" ? "card" : S.detent); else MP.setDetent(S.detent); return; }
      const hs = { peek: MP.targetHeight("peek"), card: MP.targetHeight("card"), full: max };
      const aim = h0 + dy + v * 160;
      const d = ORDER.reduce((a, b) => (Math.abs(hs[b] - aim) < Math.abs(hs[a] - aim) ? b : a), "peek");
      MP.setDetent(d); refit();
    };
    addEventListener("pointermove", move); addEventListener("pointerup", up); addEventListener("pointercancel", up);
  }, true);

  /* ---------- rooms: the stage beside its words in landscape ---------- */
  function splitRoom() {
    const sc = $("#room .r-scroll"); if (!sc || sc.querySelector(":scope > .ip-left")) return;
    const right = sc.querySelector(":scope > .r-body, :scope > .r-article");
    const left = [...sc.children].filter((c) => !c.classList.contains("r-head") && c !== right);
    if (!right || !left.length) { sc.classList.add("ip-nosplit"); return; }
    const box = document.createElement("div"); box.className = "ip-left";
    sc.insertBefore(box, left[0]); left.forEach((c) => box.appendChild(c));
    sc.classList.add("ip-split-room", right.classList.contains("r-article") ? "is-read" : "is-media");
    const fs = $("[data-p='fs']", sc);
    if (fs) { fs.dataset.p = "ipfs"; fs.setAttribute("aria-label", "Picture in picture"); fs.innerHTML = ic2("pip", "sm"); }
  }
  // The stage's full-screen button becomes picture in picture on iPad.
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-p='ipfs']"); if (!b) return;
    e.stopPropagation(); systemPip();
  }, true);

  /* ---------- playback that survives navigation: Watch as picture in picture, Listen as Now Playing ---------- */
  function placePlayer() {
    const mini = $("#dmini"); if (!mini) return;
    const p = S.player, on = !!p && p.mode === "mini";
    const video = on && regular() && p.fmt === "watch";
    mini.classList.toggle("ip-off", video);
    pip.hidden = !video;
    if (video) paintPip();
    const now = $("#sideNow");
    if (docked() && on && !video) { if (mini.parentElement !== now) now.appendChild(mini); }
    else if (mini.parentElement !== dock) dock.insertBefore(mini, $("#bar"));
    now.classList.toggle("is-on", docked() && on && !video);
  }
  function lumenOf(p) { return S.lumens.find((l) => l.id === p.id); }
  function slideNow(p) {
    const l = lumenOf(p), c = p.course ? D.courses.find((x) => x.id === p.course.id) : null;
    const slides = c ? [c.parts[p.course.k].title, "What it’s for", "How it works", "An example", "On your site"] : l.formats?.watch?.slides || ["The idea", "How it works", "An example", "On your site", "In one picture"];
    const len = c ? 185 : (l.formats?.watch?.min ?? l.min) * 60;
    const i = Math.min(slides.length - 1, Math.floor((p.pos / len) * slides.length));
    return { title: c ? `${c.title}: ${c.parts[p.course.k].title}` : l.title, slide: slides[i], i, n: slides.length, f: p.pos / len };
  }
  function paintPip() {
    const p = S.player; if (!p) return;
    const s = slideNow(p);
    pip.dataset.corner = L.corner;
    pip.innerHTML = `<div class="ip-pip-art" data-act="full"><small>Slide ${s.i + 1} of ${s.n}</small><b>${esc(s.slide)}</b><span>${esc(s.title)}</span></div>
      <div class="ip-pip-ctl"><button type="button" data-act="full" aria-label="Back to the room">${ic2("expand", "sm")}</button><button type="button" data-act="pp" aria-label="${p.playing ? "Pause" : "Play"}">${ic(p.playing ? "pause" : "play", "sm")}</button><button type="button" data-act="stop" aria-label="Stop">${ic("x", "sm")}</button></div>
      <span class="ip-pip-prog"><i style="width:${Math.round(s.f * 1000) / 10}%"></i></span>`;
  }
  setInterval(() => { if (!pip.hidden) { const s = slideNow(S.player || {}); const i = $(".ip-pip-prog i", pip); if (i && S.player) i.style.width = `${s.f * 100}%`; } }, 1000);
  pip.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return;
    const r0 = pip.getBoundingClientRect(), x0 = e.clientX, y0 = e.clientY; let dx = 0, dy = 0;
    pip.classList.add("is-dragging");
    const move = (ev) => { dx = ev.clientX - x0; dy = ev.clientY - y0; pip.style.transform = `translate(${dx}px, ${dy}px)`; };
    const up = () => {
      removeEventListener("pointermove", move); removeEventListener("pointerup", up);
      pip.classList.remove("is-dragging"); pip.style.transform = "";
      if (Math.hypot(dx, dy) < 6) return;
      const a = app.getBoundingClientRect(), cx = r0.left + r0.width / 2 + dx - a.left, cy = r0.top + r0.height / 2 + dy - a.top;
      L.corner = `${cy < a.height / 2 ? "t" : "b"}${cx < a.width / 2 ? "l" : "r"}`; store.set("pipCorner", L.corner); pip.dataset.corner = L.corner;
    };
    addEventListener("pointermove", move); addEventListener("pointerup", up);
  });
  // The system's picture in picture, where the browser allows it: the slide drawn to a canvas, played as a video.
  let pipVideo = null;
  async function systemPip() {
    const p = S.player;
    if (!p || !document.pictureInPictureEnabled || !HTMLCanvasElement.prototype.captureStream) { MP.toast("Picture in picture isn’t available in this browser. Leave the room and the slide stays in a corner."); return; }
    try {
      if (document.pictureInPictureElement) { await document.exitPictureInPicture(); return; }
      const c = document.createElement("canvas"); c.width = 640; c.height = 360; const g = c.getContext("2d");
      const draw = () => {
        const s = slideNow(S.player || p), grad = g.createLinearGradient(0, 0, 640, 360);
        grad.addColorStop(0, "#2c3d63"); grad.addColorStop(1, "#18223a"); g.fillStyle = grad; g.fillRect(0, 0, 640, 360);
        g.fillStyle = "rgba(255,255,255,.6)"; g.font = "600 16px system-ui"; g.fillText(`SLIDE ${s.i + 1} OF ${s.n}`, 36, 56);
        g.fillStyle = "#fff"; g.font = "500 40px Newsreader, Georgia, serif"; g.fillText(s.slide, 36, 110);
        g.fillStyle = "rgba(255,255,255,.75)"; g.font = "18px system-ui"; g.fillText(s.title.slice(0, 54), 36, 316);
        g.fillStyle = "rgba(255,255,255,.2)"; g.fillRect(0, 352, 640, 8); g.fillStyle = "#9db0f3"; g.fillRect(0, 352, 640 * s.f, 8);
      };
      draw();
      pipVideo?.remove();
      pipVideo = Object.assign(document.createElement("video"), { muted: true, playsInline: true, autoplay: true });
      pipVideo.className = "ip-pipvideo";
      document.body.appendChild(pipVideo);
      pipVideo.srcObject = c.captureStream(4);
      await pipVideo.play();
      await pipVideo.requestPictureInPicture();
      const t = setInterval(draw, 500);
      pipVideo.addEventListener("leavepictureinpicture", () => clearInterval(t), { once: true });
    } catch { MP.toast("Picture in picture isn’t allowed here. Leave the room and the slide stays in a corner."); }
  }

  /* ---------- Commonplace: an item beside the wall in landscape ---------- */
  function splitItem() {
    const sh = $("#sheet"), open = sh.classList.contains("is-open");
    const item = open && !!sh.querySelector(".cp-ipage, .cp-iimg, .cp-reader, .cp-vid, .cp-ivideo");
    const on = wide() && S.dest === "commonplace" && !window.MP_ROOM && item;
    app.classList.toggle("ip-split", on);
    if (on && !sh.querySelector(".ip-splitx")) {
      const head = sh.querySelector(".m-sheet-head");
      if (head && !head.querySelector("[data-act='sheetx']")) head.insertAdjacentHTML("beforeend", `<button class="m-ib ip-splitx" type="button" data-act="sheetx" aria-label="Close">${ic("x")}</button>`);
    }
  }

  /* ---------- the keyboard: ⌘K asks or finds, holding ⌘⇧D talks, hold ⌘ for the list ---------- */
  const SHORTCUTS = [
    ["Studiolo", [["Ask, find or search", `${K}K`], ["Find", `${K}F`], ["Hold to talk", `${K}⇧D`], ["Write a note", `${K}N`], ["Make a Lumen", `${K}L`], ["Keyboard shortcuts", `${K}/`]]],
    ["Go to", [["Today", `${K}1`], ["Learn", `${K}2`], ["Commonplace", `${K}3`], ["Loci", `${K}4`], ["Back", `${K}[`], ["Show or hide the sidebar", `${isMac ? "⌃⌘" : "Ctrl Alt "}S`]]],
    ["Loci and playback", [["Palace · Map · List", `${isMac ? "⌥⌘" : "Ctrl Alt "}1 – 3`], ["Inspector height", `${K}↑ ↓`], ["Play or pause", "Space"], ["Close, or back a level", "Esc"]]],
  ];
  function hud(on, sticky) {
    const el = $("#hud");
    if (on) el.innerHTML = `<div class="ip-hud-card"><h3>${ic2("kbd", "sm")}Keyboard shortcuts</h3><div class="ip-hud-cols">${SHORTCUTS.map(([h, rows]) => `<section><h4>${h}</h4>${rows.map(([l, k]) => `<p><span>${l}</span><kbd>${k}</kbd></p>`).join("")}</section>`).join("")}</div><small>${sticky ? "Press Esc to close" : `Release ${K.trim()} to close`}</small></div>`;
    el.classList.toggle("is-on", on); el.setAttribute("aria-hidden", String(!on)); el.dataset.sticky = sticky ? "1" : "";
  }
  $("#hud").addEventListener("click", () => hud(false));
  let hudT = null, ptt = false;
  const typing = () => { const a = document.activeElement; return a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.isContentEditable); };
  function focusBar() { if (S.bar.mode === "idle") { S.bar.mode = "find"; MP.paintDock(); } MP.focusBar(); }
  document.addEventListener("keydown", (e) => {
    const mod = isMac ? e.metaKey : e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
    if ((e.key === "Meta" || (!isMac && e.key === "Control")) && !e.repeat) { clearTimeout(hudT); hudT = setTimeout(() => hud(true, false), 650); return; }
    clearTimeout(hudT);
    if ($("#hud").classList.contains("is-on") && !$("#hud").dataset.sticky) hud(false);
    if (e.key === "Escape" && $("#hud").classList.contains("is-on")) { hud(false); e.stopPropagation(); return; }
    if (e.key === "Escape" && regular() && L.sideOpen) { setSideOpen(false); e.stopPropagation(); return; }
    if (!mod) {
      if (e.key === " " && !typing() && S.player) {
        e.preventDefault();
        const b = $("#rpp") || $(".m-mini [data-act='pp']") || $("#pip [data-act='pp']"); b?.click();
      }
      return;
    }
    if (e.shiftKey && k === "d") { e.preventDefault(); if (!e.repeat && !ptt) { ptt = true; S.bar.ptt = true; MP.startListening($("#barInput")); } return; }
    if (e.altKey && ["1", "2", "3"].includes(e.code.slice(-1)) && S.dest === "loci") { e.preventDefault(); S.view = ["palace", "map", "list"][Number(e.code.slice(-1)) - 1]; MP.render(); return; }
    if ((e.ctrlKey && e.metaKey && k === "s") || (!isMac && e.altKey && k === "s")) { e.preventDefault(); toggleSide(); return; }
    if (k === "k" || k === "f") { e.preventDefault(); focusBar(); return; }
    if (k === "/") { e.preventDefault(); hud(!$("#hud").classList.contains("is-on"), true); return; }
    if (["1", "2", "3", "4"].includes(k)) { e.preventDefault(); if (window.MP_ROOM) window.MP_PAGES.learn.click(fake({ p: "rclose" })); MP.setDest(DEST[Number(k) - 1][0]); return; }
    if (k === "[") { e.preventDefault(); if (window.MP_ROOM) window.MP_PAGES.learn.click(fake({ p: "rclose" })); else if (S.dest === "loci") MP.goBack(); return; }
    if (k === "n") { e.preventDefault(); S.bar.mode = "capture"; S.bar.capture = "note"; MP.paintDock(); MP.focusBar(); return; }
    if (k === "l") { e.preventDefault(); MP.openLumenSheet({}); return; }
    if ((k === "arrowup" || k === "arrowdown") && S.dest === "loci") { e.preventDefault(); MP.setDetent(nextDetent(S.detent, (k === "arrowdown") === wide() ? 1 : -1)); }
  }, true);
  document.addEventListener("keyup", (e) => {
    if (e.key === "Meta" || e.key === "Control") { clearTimeout(hudT); if (!$("#hud").dataset.sticky) hud(false); }
    if (ptt && ["d", "D", "Meta", "Shift", "Control"].includes(e.key)) {
      ptt = false; S.bar.ptt = false;
      MP.stopListening(false).then((text) => { if (text) MP.submitBar(); });
    }
  }, true);
  addEventListener("blur", () => { clearTimeout(hudT); if (!$("#hud").dataset.sticky) hud(false); });

  /* ---------- Palace: a two-finger twist turns it (pinch, the two-finger tap and the hold are the phone's) ---------- */
  const touches = new Map(); let twist = null;
  document.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "touch" || !e.target.closest(".m-canvas-wrap .palace")) return;
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size === 2) { const [a, b] = [...touches.values()]; twist = { a0: Math.atan2(b.y - a.y, b.x - a.x), last: 0, on: false }; }
  }, true);
  document.addEventListener("pointermove", (e) => {
    if (!touches.has(e.pointerId)) return;
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (!twist || touches.size !== 2 || !IP.engine) return;
    const [a, b] = [...touches.values()];
    let d = Math.atan2(b.y - a.y, b.x - a.x) - twist.a0; d = Math.atan2(Math.sin(d), Math.cos(d));
    if (!twist.on && Math.abs(d) > 0.14) twist.on = true;
    if (twist.on && IP.engine.goal) { IP.engine.goal.yaw -= d - twist.last; IP.engine.wake?.(); }
    twist.last = d;
  }, true);
  const lift = (e) => { touches.delete(e.pointerId); if (touches.size < 2) twist = null; };
  document.addEventListener("pointerup", lift, true);
  document.addEventListener("pointercancel", lift, true);

  /* ---------- drag and drop: pictures, links and text from another app land in Commonplace ---------- */
  let dragDepth = 0;
  const dropTarget = () => { const T = MP.T(); const id = S.openId && T.has(S.openId) ? S.openId : null; return id ? T.get(id) : null; };
  const accepts = (dt) => dt && [...dt.types].some((t) => t === "Files" || t === "text/uri-list" || t === "text/plain");
  document.addEventListener("dragenter", (e) => {
    if (!accepts(e.dataTransfer)) return;
    e.preventDefault(); dragDepth++;
    const t = S.dest === "loci" ? dropTarget() : null;
    $("#dropWhere").textContent = t ? `It’s filed on ${t.name}.` : S.dest === "commonplace" ? "It joins the wall, newest first." : "It’s filed on what you have open.";
    $("#drop").classList.add("is-on");
  });
  document.addEventListener("dragover", (e) => { if (accepts(e.dataTransfer)) { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; } });
  document.addEventListener("dragleave", () => { if (--dragDepth <= 0) { dragDepth = 0; $("#drop").classList.remove("is-on"); } });
  document.addEventListener("drop", async (e) => {
    if (!accepts(e.dataTransfer)) return;
    e.preventDefault(); dragDepth = 0; $("#drop").classList.remove("is-on");
    const dt = e.dataTransfer, t = dropTarget(), topics = t ? [t.id] : [S.topics.find((x) => x.wantToLearn)?.id].filter(Boolean);
    const add = [];
    for (const f of [...(dt.files || [])]) {
      if (f.type.startsWith("image/")) add.push(await photoFrom(await readUrl(f), f.name.replace(/\.[a-z0-9]+$/i, ""), topics));
      else add.push({ id: MP.nextId("i"), type: "pdf", kind: "PDF", title: f.name, topics, date: "2026-10-31", state: "unread" });
    }
    if (!add.length) {
      const uri = (dt.getData("text/uri-list") || "").split("\n").find((x) => x && !x.startsWith("#"));
      const label = dt.getData("text/x-studiolo-title") || dt.getData("text/plain");
      if (uri && uri.startsWith("data:image")) add.push(await photoFrom(uri, label || "Dropped picture", topics));
      else if (uri && /^https?:/.test(uri)) { const u = new URL(uri); add.push({ id: MP.nextId("i"), type: "link", kind: "Link", title: label && label !== uri ? label : `${u.hostname.replace(/^www\./, "")}${u.pathname.length > 1 ? u.pathname : ""}`, site: u.hostname.replace(/^www\./, ""), desc: "Saved from another app.", url: uri, coll: "links", state: "unread", topics, date: "2026-10-31" }); }
      else if (label) add.push({ id: MP.nextId("i"), type: "note", kind: "Note", title: label, topics, date: "2026-10-31" });
    }
    if (!add.length) return;
    S.items.unshift(...add);
    if (S.dest === "commonplace" || S.dest === "loci") MP.render();
    MP.toast(`Saved ${add.length === 1 ? (add[0].type === "photo" ? "a picture" : add[0].type === "link" ? "a link" : "it") : `${add.length} things`} to your Commonplace${t ? ` · on ${t.name}` : ""}.`, S.dest === "commonplace" ? null : "Show", () => MP.setDest("commonplace"));
  });
  const readUrl = (f) => new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(f); });
  function photoFrom(url, title, topics) {
    return new Promise((ok) => {
      const im = new Image();
      im.onload = () => {
        const key = MP.nextId("drop");
        D.IMG[key] = url; D.META[key] = [im.naturalWidth || 4, im.naturalHeight || 3, 50, []];
        ok({ id: MP.nextId("i"), type: "photo", kind: "Photo", title, caption: "Dropped from another app.", coll: "site", topics, date: "2026-10-31", img: key });
      };
      im.onerror = () => ok({ id: MP.nextId("i"), type: "note", kind: "Note", title, topics, date: "2026-10-31" });
      im.src = url;
    });
  }

  /* ---------- start ---------- */
  layout();
  MP.render();
  window.IPAD_LAYOUT = { layout, sync, toggleSide, hud, state: L, sizeClass };
})();
