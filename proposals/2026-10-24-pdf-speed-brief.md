# Brief: PDF speed in Commonplace

Status: brief for the building agent · 24 Oct 2026 · not yet approved for merge

Written for an AI agent working in the main app, `studiolo`. All code references are to `studiolo` @ `3167600` (main, after the `commonplace-speed` merge). This brief was written from reading the code; nothing in it has been measured in a browser yet.

## 0. How to use this brief

There are two parts:

- **Part A: build it.** A stored cover image for every PDF, so a PDF card on the wall loads like a photo card. The owner has decided this should happen, so build it. Don't run experiments to decide whether to do it.
- **Part B: test, then advise.** Several possible fixes for opening, reading and closing a PDF. Measure each one, write up what you found, recommend which to apply, and **stop for the owner's decision** before applying anything from Part B.

Order of work:

1. Build the measurement harness and take the **baseline** (§3). Do this before any code change, so Part A's gain can be shown.
2. Build **Part A** (§4) on its own branch and measure it against the baseline.
3. Run the **Part B experiments** (§5) on throwaway branches or behind local switches. Measure each one.
4. Write the **report** (§6) and hand over. Apply the Part B items the owner picks, on the same or a new branch.

Rules that apply throughout. These come from `AGENTS.md` in `studiolo`; read it and follow it, because it wins over this brief:

- Work on a branch. **Never merge into `main` or push any branch** until the owner has tested the work and said so in the current conversation.
- **No migration, new paid service, production data or credential change** without the owner's explicit approval. Part A as designed below needs no migration. If you find it does, stop and ask.
- **Ask before adding a dependency** (see A2: the server-side renderer probably needs one).
- Update the owning guides in `project-docs/implementation/` in the same branch as the code, as `AGENTS.md` describes: at least `frontend.md`, `backend.md` and `library-perf-baseline.md` (or a PDF section beside it).
- Measure on a **throwaway Neon branch** of Studiolo Dev with seeded data, as `project-docs/implementation/library-perf-baseline.md` did, and delete it afterwards. Don't touch shared Dev data or production.
- Before handing over, run the Verify steps locally: lint, typecheck, unit tests, `check:docs`, `scripts/check-prototype.cjs` and build, plus the browser tests this brief adds.

## 1. The problem

The owner's experience: Commonplace feels heavy whenever it has PDFs. Covers take time to appear every time the Library opens, and opening and closing a PDF is slow too.

What the code does today:

### PDF cards on the wall

Every PDF card draws its own cover **in the browser** (`src/components/library/pdf-first-page.tsx`, used from `card-media.tsx:292`). For each card that scrolls near the view:

1. It calls `GET /api/files/:id?variant=original` (`features/files/gateway.ts:141`): one serverless call with its own session and account check, to get a signed link.
2. It loads PDF.js (`pdf-canvas.tsx` `loadPdfjs`: the module, the worker, wasm and data files from `/pdfjs/`).
3. It opens the PDF straight from R2 through a presigned S3 link, with range requests (`rangeChunkSize: 262_144`, `disableAutoFetch: true`). Learning the file's size, reading its cross-reference table and reading page 1's objects takes several requests. This does **not** go through the media Worker or any edge cache: `links.ts` signs PDFs "always through storage".
4. It renders page 1 to a canvas, turns it into a PNG blob, and closes the document.

Only two cards draw at a time (`createRenderQueue(2)`). The result is kept only in a module-level `Map` (`firstPages`), so **every reload, new tab, new day or other device redraws every cover from scratch**.

Photos, by contrast, show a stored `thumb` WebP, served by the media Worker with an edge cache and links signed on a one-hour step, so the browser reuses them.

### Opening a PDF

`/library/items/[itemId]/pdf` is a `force-dynamic` server page: an account check, the item read, and a signed 60-minute link. Then the browser loads PDF.js and opens the PDF with range requests again. The bytes the wall card just fetched were thrown away when its document was destroyed.

### Reopening a PDF

PDF links use `signingWindow` (`features/files/signing.ts`) on the default **5-minute** step, so the link changes every 5 minutes and the browser can't reuse bytes it already downloaded. R2 objects are also written without a `Cache-Control` header (check this), so the browser has nothing to go on even when the URL matches.

### Closing a PDF

Going back to `/library` re-renders the server page: the workspace layout's roughly 7 round trips plus about 14 queries for the wall. Next.js's client router cache keeps dynamic pages for 0 seconds by default.

### Not measured yet

`library-perf-baseline.md` measured database queries, signed links and payload. It did not measure anything the browser does with PDFs. That gap is what §3 fills.

## 2. Facts that shape the design

- `stored_objects.variants` already allows `original`, `display` and `thumb` on **any** object (`drizzle/0007_files.sql:93`: `variants <@ ARRAY['original','display','thumb']`). A PDF object can carry a `thumb` and a `display` without a migration.
- Files are stored at `keptKey(account, object, variant)`, i.e. `a/<account>/<object>/<variant>`. The media Worker (`workers/media/src/deliver.ts`) serves any signed `(account, object, variant)` with `variant` in `MEDIA_VARIANTS`, and caches it at the edge. A PDF's `thumb` is deliverable through the Worker with no Worker change.
  - Caveat: when a stored `display` or `thumb` is missing, `deliver.ts` tries to make one from the `original` (around line 165). For a PDF that original is not an image. Check that the Worker answers cleanly (404, not 500, and no cached failure) when a PDF has no cover yet, or make sure it is never asked.
- A PDF upload goes straight to `ready` when completed (`objects-repository.ts:352`: `CASE WHEN o.kind = 'image' THEN 'processing' ELSE 'ready' END`). Nothing runs on a PDF after upload today.
- The Trigger worker already runs PDF.js under Node for text extraction (`src/features/explainers/sources/pdf.ts`, legacy build, "no rendering, no fonts loaded"). Rendering needs a canvas implementation in Node; PDF.js's Node examples use `@napi-rs/canvas`.
- `sharp` is already a dependency and makes the photo sizes (`features/files/processing.ts`: `display` is WebP at most 2,048 px on the long edge, `thumb` is WebP at most 640 px).
- Page 1's size is stored as `sources.pdf_page_width` and `pdf_page_height` (migration 0010). Today the browser measures it on the first draw and posts it to `/api/library/items/[itemId]/pdf-size`.
- Photo and link-preview signing goes through `signRows` (`features/files/links.ts`). With media delivery off, it presigns through R2 instead of the Worker. Covers must work both ways.

## 3. Baseline: measure before changing anything

Build a repeatable browser harness: Playwright against a **production build** (`npm run build && npm start`) pointed at a throwaway Neon branch. Use a seeded account of **40 PDFs** (a mix: 5 small text PDFs, 25 typical 1–10 MB papers or books, 5 scan-heavy PDFs of 30 MB or more, 5 of 300 pages or more) plus about 200 photos and notes, so the wall looks real.

Run every scenario with the network throttled to the owner's conditions: about **120 ms round trip** to Frankfurt (measured in `library-perf-baseline.md`) and a typical home connection, e.g. 50 Mbps down. Report the first (cold) run and the median of five warm runs, as the Library baseline did.

| Id | Scenario | Measure |
|---|---|---|
| S1 | Cold load of Commonplace (empty browser cache) | Time until every PDF cover in the first viewport is drawn; requests and bytes for PDF data; `/api/files` calls |
| S2 | Reload Commonplace (warm browser cache) | Same as S1. Today this should look almost the same as S1, which is the bug |
| S3 | Scroll the wall through all 40 PDFs | Time per cover; worst cover; main-thread long tasks |
| S4 | Open a PDF from the wall (first time) | Click → first page visible; click → page text selectable; bytes |
| S5 | Turn pages 1 → 10 → 50 | Time per page turn; extra range requests |
| S6 | Close the PDF and return to the wall | Click → wall usable; server requests |
| S7 | Reopen the same PDF within 5 minutes, after 10 minutes, and after 70 minutes | Same as S4; bytes actually downloaded versus served from cache |
| S8 | Save actions while reading: reading position, a note, a quote | Click → confirmed; requests made |

Also record the size and cache headers of `/pdfjs/*` (module, worker, wasm, cmaps) as served by the production build.

Keep the harness script in the repository (`scripts/` or `tests/perf/`), so the same numbers can be re-taken after each change. Real-world limits to label in the report: server times on Vercel `fra1` aren't reproduced by a local `next start`; note where that matters.

## 4. Part A (build): a stored cover for every PDF

**Goal:** a PDF card on the wall loads like a photo card. One small cached WebP is delivered by the media Worker. There is no PDF.js, no PDF download and no `/api/files` call per card, on any device, after the first upload.

### A1. Where the cover is stored (decided)

Store the cover on the PDF's own `stored_objects` row as the variants **`thumb`** (640 px long edge, WebP) and **`display`** (up to 2,048 px, WebP), at `keptKey(account, pdfObjectId, 'thumb' | 'display')`. The row's `variants` becomes `{original, display, thumb}`.

Why: no migration, no new object kind, no new foreign key. Deleting the PDF already removes all its kept files (verify in `purge.ts` and `erasure.ts` that every variant listed on the row is removed; fix it if only `original` is). Delivery and signing reuse the photo path.

Decide and document: covers don't count toward quota (they are generated), the same as link-preview pictures. `size_bytes` stays the PDF's size.

### A2. Where the cover is made (build the first; fall back to the second only if the first is blocked)

1. **Server-side, in a Trigger task (preferred).** On upload completion of a PDF, dispatch `studiolo-files-render-pdf-cover`. It reads the original from R2, renders page 1 with PDF.js under Node, makes `display` and `thumb` with `sharp`, writes them, updates `variants`, and stores page 1's size in `sources.pdf_page_width/height` when empty. It follows `processImageTask`'s queue, retry and analytics pattern (`src/trigger/files-tasks.ts`). Covers then exist for every PDF, including ones nobody has opened yet, on every device.
   - **Spike this first (30–60 minutes):** check that page-1 rendering works in the Trigger build with the proposed canvas package, on the seeded PDFs, within `medium-1x` memory and a `maxDuration` of 60–120 s. Rendering page 1 of a large scan must not load the whole file into memory more than necessary.
   - **The canvas package is a new native dependency.** Ask the owner before adding it, giving its name, size and licence. Don't use AGPL renderers such as MuPDF builds.
   - Add a **backfill** for existing PDFs, in the style of `npm run media:backfill` (`scripts/media-backfill.mjs`). Running it against any hosted database needs the owner's approval.
   - The hourly sweep (`sweepFiles`) should redispatch a PDF whose cover failed or stalled, within the same attempt limits as photos. A PDF that can't be rendered (password-protected, damaged) gets no cover and keeps today's fallback; it is **never** marked failed as a file, because the PDF itself is fine.
2. **Fallback: the browser uploads the cover it already draws.** On the first draw (`pdf-first-page.tsx`), post the PNG to a new route. The server re-encodes it with `sharp` into `display` and `thumb`, which also strips anything odd, writes them, and updates `variants`. There's no new dependency and no Trigger work, but the first view on the first device is still slow, and PDFs nobody has opened get no cover. Use this only if the owner declines the dependency or the spike fails.

### A3. Showing the cover

- **Read model:** for PDF cards, sign `thumb` (not `original`) through `signRows`, so the card's data carries a cover link the same way a photo card does. With media delivery on, this is a media Worker link on the one-hour step.
- **Wall card** (`card-media.tsx`, `case "pdf"`): when the cover exists, render it as an `<img>` inside the existing `.pdf-sheet` box at the stored page aspect, `loading="lazy"`, exactly as `PhotoBlock` does. When it doesn't exist yet (just uploaded, before backfill, or unrenderable), keep today's `PdfFirstPage` path unchanged. A PDF this tab just uploaded keeps drawing from the local file, as it does now.
- **Preserve the prototype's look.** The sheet, shadow and proportions must look the same as today. Compare against the prototype and today's rendering at matching sizes, as `AGENTS.md` requires.
- **Reader, a cheap bonus:** while PDF.js loads, show the cover's `display` image as the opening sheet (`.pdf-opening-sheet`). Opening a PDF then shows page 1 instantly, and the real page replaces it when drawn. Do this only if it doesn't fight the existing card-to-reader "ghost" transition (`claimGhostTo`).
- **Page size:** once covers store page 1's size on the server, the browser's `savePdfSize` call can stay for the fallback path only.

### A4. Tests and acceptance

- **Unit tests:** the cover render function (sizes, WebP output, a password-protected or damaged PDF gives "no cover" rather than a throw), the signing change, and the card choosing between the image and the drawn first page.
- **Integration tests** (per-run Neon branches, as the existing suite does): upload completion dispatches the task; the task writes the variants and the page size; delete removes the cover files; the sweep redispatches a stalled cover.
- **Browser tests:** a wall with covered PDFs makes **zero** requests to the storage origin for PDF bytes and **zero** `/api/files` calls for those cards; a PDF without a cover still draws as today; a just-uploaded PDF still appears at once.
- **Acceptance numbers** (from the §3 harness): S1 and S2 show every first-viewport PDF cover within the same time as photo cards of the same count, and S2 downloads no cover bytes again (all served from the browser cache). Report before and after.

## 5. Part B (test, then advise): opening, reading, reopening and closing

For each experiment: change one thing, re-run the relevant §3 scenarios, and record the gain, the cost in code and risk, and any approvals it would need. Don't merge any of these; the owner picks from the report.

| Id | Experiment | What to try | Scenarios | Watch out for |
|---|---|---|---|---|
| B1 | **Stable, cacheable PDF links** | Sign PDF links on a one-hour step, as media links do, instead of 5 minutes; serve them with `Cache-Control: private, max-age=…` (set on the object at upload completion, or with the presign's response-header override if R2 honours it — check) | S7 | Link lifetime rules in specs D10 and D11; a revoked or deleted file must still stop working when its link expires |
| B2 | **PDFs through the media Worker** | Deliver PDF originals through the Worker (edge cache, range requests answered from the cached object) instead of presigned R2 | S4, S5, S7 | Why the code keeps PDFs on R2 today (find the decision in the specs first); range-request support in the Worker and Cloudflare's cache; CSP `connect-src` would need the media origin; large-file limits |
| B3 | **Fewer round trips per open** | `rangeChunkSize` 256 KB vs 1 MB vs 2 MB; whole-file download (no ranges) for PDFs under a threshold, e.g. 8 MB; `disableAutoFetch: false` so the rest streams in the background after page 1 | S4, S5 | Memory on phones; data used on metered connections; very large scans |
| B4 | **PDF.js ready before it's needed** | Preload the PDF.js module, worker and wasm when Commonplace is idle (`requestIdleCallback` or `<link rel="modulepreload">`); give `/pdfjs/*` long-lived immutable caching with a versioned path | S4 (first open of the session) | Bytes spent for learners who never open a PDF; keep the CSP intact |
| B5 | **Start fetching on intent** | On hover or press of a PDF card, `preconnect` to the storage or media origin and start the server page's prefetch, and optionally the PDF's first range | S4 | Wasted requests on accidental hovers; phone behaviour (no hover) |
| B6 | **Instant close** | Next.js `experimental.staleTimes.dynamic` (e.g. 30 s) so returning to `/library` reuses the rendered wall | S6 | The sign-out and router-cache bug recorded in `frontend.md` (Oct 18, 2026); a wall that doesn't show a just-made change; test both |
| B7 | **Per-device PDF cache** | Keep downloaded PDF bytes in Cache Storage or IndexedDB keyed by object id (an object's original never changes), so reopening is local | S7 | Must be cleared on sign-out and account change, like the session-memory stores (`session-memory.ts`); browser storage limits; is the gain over B1 worth the code? |
| B8 | **Saving while reading** | Time S8 and trace each save's server path (`savePosition`, Note and Quote saves, `pdf-size`) | S8 | Report only. Suggest a fix if one save is clearly slow; the code reviewed for this brief found nothing slow |

Run B1 before B7: if a stable link plus `Cache-Control` already makes reopening near-instant, B7 may not be worth its privacy and storage cost.

## 6. The report to hand over

Add a **PDF section to `project-docs/implementation/library-perf-baseline.md`**, or a sibling subject guide linked from the implementation README, following `AGENTS.md`'s rules for fixed guides. It should contain:

1. **How it was measured:** seed, throttling, build, branch (and that the branch was deleted).
2. **Baseline:** the S1–S8 table.
3. **Part A as built:** the same table after Part A, what changed, how it's tested, and its limits (e.g. PDFs that can't be rendered).
4. **Part B:** one row per experiment with the measured gain, cost, risk, approvals needed, and a clear **recommend / don't recommend / needs the owner's decision**.
5. **Proposed order** for the recommended Part B items.
6. **Everything that needs the owner's word:** new dependency, backfill on a hosted database, any migration, any change to link lifetimes.

Then stop and hand over to the owner. Apply only the Part B items the owner chooses, on a branch, with the same gates. Merge and push only when the owner says to.
