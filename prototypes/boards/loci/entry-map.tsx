// Mounts Studiolo's own Map (src/components/graph/graph-map.tsx, main @ 6f8d396) inside the Boards prototype.
// The prototype owns the data and the selection; this file turns them into the app's layout input and renders the
// app's map exactly as graph-workspace.tsx does (layoutFrame → useFrameTween → GraphMap, the same fit rules).
import { createRoot } from "react-dom/client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { GraphMap } from "./src/components/graph/graph-map";
import { drawingFitBox, frameBounds, layoutFrame, type FrameItem } from "./src/features/topics/layout";
import { indexTopics } from "./src/features/topics/hierarchy";
import { useFrameTween } from "./src/components/graph/use-frame-tween";
import { BASE_HEIGHT, BASE_WIDTH, BUTTON_STEP, fitBox, homeViewport, visibleCentre, zoomAround, type Viewport } from "./src/features/topics/viewport";

const FIT_MS = 380;
const WHEEL_EASE_MS = 160;
const TOUCH_FIT_ZOOM = 1.35;
const FULL_BOX = { x: 0, y: 0, width: BASE_WIDTH, height: BASE_HEIGHT } as const;
const COMPACT = "(max-width: 699.98px)";
const TOUCH = "(pointer: coarse)";

type State = any;
let state: State = null;
const subs = new Set<() => void>();
const store = { get: () => state, sub: (f: () => void) => (subs.add(f), () => subs.delete(f)) };
const commands: { zoom?: (dir: 1 | -1) => void; fit?: () => void } = {};

function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (f) => { const m = matchMedia(query); m.addEventListener("change", f); return () => m.removeEventListener("change", f); },
    () => matchMedia(query).matches,
  );
}

function MapApp() {
  const s = useSyncExternalStore(store.sub, store.get);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrap = useRef<HTMLDivElement | null>(null);
  const compact = useMedia(COMPACT);
  const touch = useMedia(TOUCH);
  const [size, setSize] = useState({ width: BASE_WIDTH, height: BASE_HEIGHT });
  useLayoutEffect(() => {
    const el = wrap.current; if (!el) return;
    const measure = () => setSize((c) => (c.width === el.clientWidth && c.height === el.clientHeight) || !el.clientWidth ? c : { width: el.clientWidth, height: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el); return () => ro.disconnect();
  }, []);
  const index = useMemo(() => indexTopics(s.topics), [s.topics]);
  const target = useMemo(() => layoutFrame({
    index, relations: s.relations, focusId: s.focusId, selectedId: s.selectedId, selectedRelationId: null, draft: null,
    // On phones the lanes leave the map, as in the app (M-D3).
    lane: compact ? null : s.lane, explainers: compact ? null : s.explainers, ghosts: s.ghosts, pending: s.pending,
  }), [index, s.relations, s.focusId, s.selectedId, s.lane, s.explainers, s.ghosts, s.pending, compact]);
  const frame = useFrameTween(target, s.reducedMotion);
  const stage = { width: size.width, height: size.height, coveredRight: 0, coveredBottom: s.coveredBottom || 0 };
  const homeView = compact
    ? fitBox(stage, frameBounds(target.items) ?? FULL_BOX)
    : touch ? fitBox(stage, drawingFitBox(stage, target.items, TOUCH_FIT_ZOOM) ?? FULL_BOX) : homeViewport(stage);
  const [view, setView] = useState<{ viewport: Viewport; ms: number }>({ viewport: homeView, ms: 0 });
  // A new focus, a new size or a phone's new drawing refits, as the workspace's Fit does.
  const key = `${s.focusId}|${size.width}|${size.height}|${s.coveredBottom || 0}|${compact || touch ? `${homeView.x.toFixed(1)} ${homeView.y.toFixed(1)} ${homeView.zoom.toFixed(3)}` : ""}`;
  const [tracked, setTracked] = useState(key);
  if (tracked !== key) {
    setTracked(key);
    setView({ viewport: { ...homeView }, ms: s.reducedMotion ? 0 : FIT_MS });
  }
  useEffect(() => {
    commands.zoom = (dir) => setView((c) => ({ viewport: zoomAround(c.viewport, c.viewport.zoom + dir * BUTTON_STEP, visibleCentre(c.viewport, stage)), ms: WHEEL_EASE_MS }));
    commands.fit = () => setView({ viewport: { ...homeView }, ms: FIT_MS });
  });
  return (
    <div ref={wrap} className="loci-appmap-fill">
      <GraphMap
        allowAdd
        frame={frame}
        viewport={view.viewport}
        viewportMs={view.ms}
        reducedMotion={s.reducedMotion}
        svgRef={svgRef}
        onViewportChange={(next: Viewport, ms = 0) => setView({ viewport: next, ms })}
        onActivate={(item: FrameItem) => s.on.activate(item)}
        onAdd={(topicId: string) => s.on.add(topicId)}
        onMore={(item: FrameItem) => s.on.more(item)}
        onOpenItem={(item: FrameItem) => s.on.openItem(item)}
        onSelectRelation={(id: string) => s.on.relation(id)}
        onGhostActivate={(item: FrameItem) => s.on.ghost(item, "open")}
        onGhostKeep={(item: FrameItem) => s.on.ghost(item, "keep")}
        onGhostDismiss={(item: FrameItem) => s.on.ghost(item, "dismiss")}
        onOpenExplainer={(item: FrameItem) => s.on.openExplainer(item)}
        explainerHref={(id: string) => `#lumen-${id}`}
        topicExplainers={compact ? null : s.topicExplainers}
        topicName={(id: string) => s.topicName(id)}
        popIds={s.popIds}
        glowIds={s.glowIds}
        litItemId={s.litItemId ?? null}
      />
    </div>
  );
}

(window as any).LociAppMap = {
  mount(el: HTMLElement, initial: State) { state = initial; createRoot(el).render(<MapApp />); },
  update(next: State) { state = { ...state, ...next }; subs.forEach((f) => f()); },
  zoom(dir: 1 | -1) { commands.zoom?.(dir); },
  fit() { commands.fit?.(); },
};
