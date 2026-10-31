/* Studiolo on iPad (prototype): what runs before the phone modules.
   The Palace and the Map are Studiolo's own engines. On an iPad in landscape the inspector floats on the right, so the
   engines must frame what is open in the space to its left, not above a card. The engines already know how:
   - the PalaceEngine's view takes { panel: "side", cover } (the app's desktop panel), as well as { panel: "sheet" };
   - the GraphMap takes coveredRight as well as coveredBottom.
   This file wraps both so the iPad layer (ipad.js) decides which applies; nothing inside the engines changes. */
"use strict";
(() => {
  const IP = (window.IPAD = window.IPAD || {});
  // ipad.js replaces this once it runs: what the inspector and the dock cover now.
  IP.cover = () => null;
  IP.adjust = (view) => {
    const c = IP.cover();
    return c ? { ...view, panel: "side", cover: c.right, sheetHeight: c.bottom } : view;
  };

  const LP = window.LociPalace, Base = LP.PalaceEngine;
  class IPadPalace extends Base {
    constructor(canvas, opts) {
      super(canvas, { ...opts, view: IP.adjust(opts.view) });
      IP.engine = this;
    }
    setView(view) { super.setView(IP.adjust(view)); }
    destroy() { if (IP.engine === this) IP.engine = null; return super.destroy(); }
  }
  LP.PalaceEngine = IPadPalace;

  const M = window.LociAppMap;
  if (M) {
    const fix = (s) => { const c = IP.cover(); return c ? { ...s, coveredRight: c.right, coveredBottom: c.bottom } : { ...s, coveredRight: 0 }; };
    const mount = M.mount.bind(M), update = M.update.bind(M);
    M.mount = (el, state) => mount(el, fix(state));
    M.update = (state) => update(fix(state));
    IP.refit = () => { try { update(fix({})); } catch { /* no map mounted */ } };
  }
})();
