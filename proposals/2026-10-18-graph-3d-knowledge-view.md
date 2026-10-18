# Proposal: an optional 3D "whole knowledge" view for Graph

Status: draft for the owner's decision · 18 Oct 2026

## 1. Summary

Add a fourth Graph tab, **3D**, next to Map, List and Overview. It shows a learner's **whole** topic graph at once (every area, topic and related link) as a light, rotatable 3D constellation. The idea comes from the term graph on [The AI Coding Dictionary](https://www.aicodingdictionary.com/?term=agent).

The existing radial Map stays as it is. The 3D view is an extra option, and nothing in the current design changes.

## 2. The reference: AI Coding Dictionary

- **What it is.** Matt Pocock's dictionary of about 71 AI-coding terms, grouped into 7 sections. The graph lets you move from term to term: clicking a term opens its definition and shows the terms connected to it, and `?term=agent` deep-links to one term.
- **Where its data comes from.** The term content is public in `github.com/mattpocock/dictionary-of-ai-coding`, at commit `ed1ebed` (24 Sep 2026). Each term is a Markdown file in `dictionary/`. Links come from inline `[term](./Other.md)` references, about 695 in total ("Agent" alone is linked from 52 places). Sections come from `internal/Curriculum.md`. So the graph is simply *notes plus the links inside them, grouped by section*, which is the same shape as Studiolo's topics, relations and areas.
- **Not verified.** The live site is blocked from this work environment (both DNS and the proxy refuse it), and the website's code isn't in that repo. I could not confirm which rendering library it uses. The light, glowing, orbiting look is typical of `3d-force-graph` / `react-force-graph-3d` (three.js), but **check that in a browser before relying on it.**

What makes it feel "crazy light":

- dots instead of heavy cards, with labels on hover or focus only;
- a dark or quiet background with thin, low-opacity links;
- colour by group;
- a gentle settling simulation;
- a smooth camera fly-to when a node is picked.

## 3. How it maps onto Studiolo today

Sources: `ahmedste/studiolo` at `d6e510e`, read-only.

| Reference graph | Studiolo |
|---|---|
| Term | `Topic` (`src/features/topics/types.ts:16`) |
| Inline link between terms | `TopicRelation`, an undirected link with a reason (`types.ts:26`) |
| Section (colour group) | Top-level area (a level-1 topic) |
| *(none)* | Parent → child hierarchy, up to 10 levels |
| Term status | `status`: not_started / learning / learned, plus `wantToLearn` (My Focus) |
| `?term=` | `?topic=<id>` already exists (`graph-workspace.tsx:79`) |

Why this helps: the Map is a **focused** radial view by design. It shows at most 24 children and 6 related topics per focus (D14, `project-docs/design/graph.md`). Nothing currently shows the whole learning map at once. An account can hold up to 2,000 topics and 4,000 links, and a 3D force view handles that size comfortably. It would show at a glance:

- how big the learner's knowledge is;
- which areas are dense or sparse;
- how much is Learned and how much is still Not started;
- which links cross between areas.

Current implementation, for reference:

- The Map is hand-written React SVG (`src/components/graph/graph-map.tsx`, `map-node.tsx`).
- Its radial layout lives in `src/features/topics/layout.ts:609`.
- Studiolo has **no** graph or 3D library today; `three` is not a dependency.
- Stack: Next.js 16.3.5 (App Router), React 19.3.0.

## 4. Proposed design

**Placement:** a new tab, at `/graph/3d`.

- Add `"3d"` to `GraphViewName` and `VIEWS` (`graph-workspace.tsx:76-86`).
- Allow `3d` in `app/(workspace)/graph/[section]/page.tsx:13`.
- Add a branch beside the Map/List/Overview switch (`graph-workspace.tsx:1951`) that renders a new `GraphSpace` component.
- It takes the `TopicGraph` the page already loads with `loadTopicGraph(account.id)`, so it needs **no new API or database work**.

**Rendering**

- Use `react-force-graph-3d` (a wrapper around `3d-force-graph`, built on three.js).
- Load it only on this tab, with `next/dynamic(..., { ssr: false })`, so Map, List and Overview stay as fast as they are. three.js is roughly 150 KB gzipped and is only downloaded when the tab is opened.
- Pin exact versions when this is built.

**Encoding**

- Node colour = status. Reuse the Map's existing status colours from the prototype tokens; don't invent a new palette.
- My Focus topics get a soft halo.
- Node size: areas are largest, sub-topics shrink with depth.
- Hierarchy links: faint and solid. Related links: dashed or a second tint, matching the Map's `lk` and `rl` classes.
- Areas cluster: add a weak force that pulls each topic toward its area, so the space reads like the dictionary's coloured sections.

**Interaction**

- Click a node: the camera flies to it, its neighbours are highlighted, and the **existing `TopicInspector`** opens. That keeps status, My Focus and Connect working exactly as on the Map.
- `?topic=` deep-links into the view and focuses that topic.
- **Open in Map** jumps to the radial view for editing.
- Hovering shows the full name.
- Labels appear only for areas, the focused topic and its neighbours.
- The view is read-mostly. Creating, moving and deleting topics stay in Map and List.

**Accessibility, motion and devices**

- `prefers-reduced-motion`: no auto-rotate, and camera moves are instant instead of animated (as in `use-frame-tween.ts`).
- Keyboard: the List remains the keyboard path, as it already is for Map links. The canvas gets an accessible name and a short text summary, for example "N topics in M areas, K learned".
- Touch: orbit and pinch on phones and iPad.
- Without WebGL, the tab shows a short message and a link to the Map.

## 5. Decisions the owner needs to make

`AGENTS.md` says the prototype must be preserved, and a substantial visual departure needs a design decision first. This view is additive, but it is new visual language, so it needs explicit approval:

1. **Approve a 3D tab**, or prefer a toggle inside the Map's controls (`GraphControls`). A tab is recommended: it keeps the Map untouched and gives the view its own URL.
2. **Name:** "3D", "Space" or "Constellation".
3. **Background:** dark, like the reference, or the app's own light surface. The app's own surface is recommended for consistency, with a dark option later.
4. **Scope of "a person's whole knowledge":** start with topics and relations only. A possible phase 2 adds Library items (`content_topic_tags`) and Lumens as small satellite nodes.
5. **D13 (no dragging):** the force layout is computed on the client and is not saved. Allow node dragging in 3D only, or freeze the layout after it settles. Freezing is recommended, to stay close to D13's stable-map spirit.

## 6. Rough effort

- About 1 slice: new component, tab wiring, inspector reuse, reduced-motion and WebGL fallback, plus a Playwright test that loads the tab and focuses `?topic=`.
- No schema or API changes.
- Main risks:
  - label legibility at 2,000 nodes, handled by showing labels only on focus;
  - mobile GPU performance, handled by lowering the resolution and turning off link particles.
