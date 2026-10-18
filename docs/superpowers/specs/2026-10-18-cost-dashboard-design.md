# Studiolo cost dashboard: live running costs

Status: **draft for owner review**, October 18, 2026. Written from the brainstorming session that produced the [design mockup](https://claude.ai/artifact/FHNoMufFfjnDM3i1KB2bGs) and the first build in [`cost-dashboard/`](../../../cost-dashboard/README.md) (commit 9037edb). Decisions marked *Agreed* were stated by the owner in that session; *Recommended* items need confirmation. No vendor accounts, plans or keys are changed by this document.

## Purpose

One wide page that answers "what am I paying to run Studiolo, right now?": total bill so far this month, projected month-end bill, cost per user, and each service's share, with a page per service to dive in. A second view models costs at 20 / 100 / 500 users and tells the owner when each service needs an upgrade. Revenue (Stripe) and margin come later.

Every number is pulled from the vendor's own API where one exists. Where it doesn't, the dashboard uses the nearest honest substitute and labels it as such.

## Decisions and assumptions

| Status | Decision |
|---|---|
| Agreed | Services tracked: Vercel, Neon, Cloudflare (R2, Images, Workers), Trigger.dev, Loops, ElevenLabs, Anthropic API. Stripe is added later for revenue. |
| Agreed | Personal tools the owner pays for anyway (e.g. Craft) are not operating costs and are excluded. |
| Agreed | Lives in the Studiolo_Manage repo as `cost-dashboard/`. It never writes to the Studiolo app or its database. |
| Agreed | Pre-MVP is a free 20-user friends beta: Vercel stays on Hobby until the first paying user, then Pro ($20). |
| Agreed | Cloudflare Workers Paid ($5/month) from day one; R2 and Images stay on free allowances at 20 users. |
| Agreed | Neon and Trigger.dev are pay-per-use (Neon Launch; Trigger.dev Hobby is the smallest plan that runs Studiolo's every-minute schedule). |
| Agreed | ElevenLabs is pay as you go: $0.08 per 1,000 characters on Eleven v4, $0.04 on v4 Turbo (owner confirmed on the ElevenLabs calculator). |
| Agreed | Anthropic: $300/month in credits across two accounts ($100 + $200). |
| Recommended | Next.js app on Vercel, password-protected (HTTP Basic auth via `DASHBOARD_PASSWORD`, since Vercel's own protection isn't on Hobby). |
| Recommended | Refresh at most hourly; store one snapshot per vendor per day in a small Neon database owned by the dashboard (not Studiolo's). |
| Recommended | Read Studiolo's usage ledger through a dedicated read-only Postgres role for active users and per-user cost (Phase 3). |
| Deferred | Revenue, margin and break-even (Stripe); alerts; multi-currency. |

## Can each service be linked? Feasibility by service

Legend: **Live $**: the API returns dollars. **Live usage**: the API returns quantities, priced with list prices in `src/lib/pricing.ts`. **Fixed**: no API; a plan fee entered as a setting. Confidence reflects whether the endpoint was confirmed on an official page during research (direct page fetches were blocked by this session's network proxy, so most confirmations are from official-domain search results; Anthropic's page was read in full).

| Service | Linkable? | How | Gaps | Alternative / fallback |
|---|---|---|---|---|
| **Anthropic API** | Yes: Live $ | `GET /v1/organizations/cost_report` (daily, USD in cents, group by description) and `usage_report/messages` (tokens). Header `x-api-key` (Admin key), `anthropic-version: 2023-06-01`. ~5 min lag. | **Admin keys exist only for organization accounts.** If the two accounts are individual accounts, this endpoint is unavailable until each is converted (Console → Settings → Organization). | 1) Studiolo's own usage ledger (`provider_usage_evidence`, `source = 'anthropic'`) already records cost per call per account. 2) Console usage CSV export, uploaded monthly. |
| **ElevenLabs** | Partly: Live usage | `GET /v1/user/subscription` → `character_count`, `character_limit`, `tier`, reset date. Newer `POST /v1/workspace/analytics/query/usage-by-product-over-time` gives credits over time. Dollars = characters × PAYG rate. | No dollar/invoice endpoint. Counts follow ElevenLabs' billing cycle, not the calendar month. Credit-per-character for v4 on the API is not published (assumed 1). | 1) Studiolo usage ledger (`source = 'elevenlabs'`): characters and cost per call per account. Its rate card is still a $0.30/1K placeholder and must be set to the real rate first. 2) Monthly invoice. |
| **Vercel** | Yes on Pro: Live $ | `GET https://api.vercel.com/v1/billing/charges?from&to&teamId` (FOCUS v1.3 JSONL: `BilledCost`, `ChargeCategory`, `ServiceName`). Team-scoped bearer token. Daily, per service. | Unconfirmed whether the billing API answers for Hobby teams. Per service, not per project. | On Hobby the bill is $0 by definition: show a fixed $0. Free-limit headroom (function CPU, data transfer) has no confirmed API; check the Vercel Usage page manually. |
| **Neon** | Yes on paid plans: Live usage | `GET /api/v2/consumption_history/v2/projects?from&to&granularity&metrics` (CU-seconds, branch byte-months, transfer). Neon API key. Hourly/daily/monthly. Querying doesn't wake computes. | Not available on the Free plan; history starts at the plan upgrade. Units converted to CU-hours / GB-months and priced at Launch rates. | Fixed monthly estimate (`NEON_FIXED_MONTHLY`, default $20) until a key is added; Neon invoice for month-end truth. |
| **Cloudflare R2** | Yes: Live usage | GraphQL Analytics `r2StorageAdaptiveGroups` (bytes stored) and `r2OperationsAdaptiveGroups` (requests by action → Class A/B). Token with Account Analytics: Read. 31-day retention. | Storage priced from the latest daily size, not the exact GB-month average. | Cloudflare invoice. |
| **Cloudflare Workers** | Partly: Live usage + fixed fee | GraphQL `workersInvocationsAdaptive` → requests. $5 Workers Paid fee fixed. | CPU time is only shown as percentiles in documented examples; a summed CPU field is unconfirmed, so CPU overage isn't priced. | Verify a summed CPU field on first live run; otherwise the invoice. Low risk: CPU overage is $0.02 per 1M CPU-ms beyond 30M included. |
| **Cloudflare Images** | Partly | `GET /accounts/{id}/images/v1/stats` → images stored (token: Cloudflare Images: Read). | Transformations and deliveries aren't in that endpoint; a GraphQL dataset for them is unverified. Studiolo doesn't use Images yet (photos are resized on Trigger.dev), so this reads $0 for now. | Check GraphQL for an Images requests dataset when Images goes live; otherwise invoice. |
| **Cloudflare (all)** | Maybe: Live $ | `GET /accounts/{id}/billing/usage/paygo` returns billable usage with cost (Billing: Read). | Beta, "restricted to select accounts". | Try first; if it returns 403, use the GraphQL path above. |
| **Trigger.dev** | Yes: Live $ per run | Management API runs list (`/api/v1/runs` with the production secret key, or `/api/v1/projects/{ref}/runs` with a personal access token), summing `costInCents + baseCostInCents` for the month. Plan fee and included usage are settings. | No account billing API. Many pages of runs at scale (Studiolo's every-minute schedule alone is ~43k runs/month), so totals must be cached. | Snapshot store makes the sum incremental (only new runs since the last snapshot). Trigger dashboard for month-end truth. |
| **Loops** | No | No billing or contact-count endpoint. | Price depends on subscribed contacts (free to 1,000, $49 to 5,000). | Fixed fee setting. Count subscribed contacts from Studiolo's own invitation/waitlist tables (read-only) to warn before 1,000. |
| **Stripe** (later) | Yes: Live $ | Balance transactions, invoices and subscriptions APIs give revenue, refunds and Stripe's own fees. Restricted read-only key. | n/a | n/a |
| **Active users** | Yes (Phase 3) | Studiolo database, read-only role: accounts active in the month. | Until then, `ACTIVE_USERS` setting. | n/a |

**Summary.**
- **Fully live in dollars:** Anthropic (with an organization Admin key), Vercel (once on Pro), Trigger.dev, and later Stripe.
- **Live usage priced by the dashboard:** Neon, Cloudflare R2, Workers and Images, and ElevenLabs.
- **No API:** Loops, which stays a setting.
- **Main risk:** Anthropic's Admin API requires organization accounts. Studiolo's own usage ledger is the fallback, and it also gives per-user cost no vendor can.

### Cross-cutting alternatives for anything not directly linkable

1. **Studiolo's usage ledger (recommended).** Every Anthropic and ElevenLabs call already writes a `provider_usage_evidence` row with units, cost, account and outcome (Studiolo `drizzle/0002_jobs_usage.sql`, source values added in `0016_jobs_generalise.sql`). A read-only role turns this into cost per user, per feature and per explainer. Two caveats:
   - **It only reflects the app's traffic.** Manual Console use, other projects on the same key, and test traffic are missing, so it should be reconciled against the vendor numbers.
   - **ElevenLabs costs in it are wrong for now.** Its rate card uses a placeholder $0.30 per 1,000 characters until fixed in Studiolo.
2. **Monthly invoice reconciliation.** Each vendor emails a monthly invoice. A month-end step, entered by hand at first and possibly read from email later, records the real amount next to the dashboard's estimate, so estimate drift is visible and the pricing table can be corrected.
3. **Usage CSV upload.** For vendors with a console export but no API (Anthropic individual accounts, ElevenLabs history), allow dropping a CSV into the month.
4. **Settings-based fixed fees.** Plan fees that never vary (Workers Paid $5, Trigger Hobby $10, Loops tiers, Vercel Pro $20) are settings, shown as "Fixed plan fee" so they're never mistaken for live data.

## Architecture

```
Vercel (cost-dashboard)
├─ Pages: Overview · /vendor/[id] · /stages        ← server-rendered, revalidate 1h
├─ Connectors (src/lib/connectors/*): one per vendor, each returns
│    { source, status, plan, lineItems[{label, quantity, spent, projected}], notes }
├─ Cron /api/snapshot (daily, Phase 2) → dashboard's own Neon DB
└─ Read-only role → Studiolo DB (Phase 3: active users, per-user cost)
```

- **Connector contract.** A connector never throws to the page: errors become `status: "error"` with the vendor's message, minus any secrets. Missing keys become `not-configured` with the setting to add. Each line item carries both *spent so far* and *projected month-end*.
- **Projection.** Plan fees count in full from the 1st. Flow usage (requests, characters, tokens) is scaled by the share of the period that has passed. Level usage (stored GB) is a monthly rate and isn't scaled. ElevenLabs uses its own billing-cycle dates.
- **Freshness.** Pages regenerate at most hourly. Anthropic is polled no more than once a minute, per its guidance. The header shows when data was fetched.
- **Sample mode.** `DASHBOARD_SAMPLE=1` shows demo numbers so the UI can be reviewed without keys.

### Data model (Phase 2)

`snapshots(day date, vendor text, spent numeric, projected numeric, line_items jsonb, source text, status text, fetched_at timestamptz, primary key (day, vendor))`, plus `invoices(month date, vendor text, amount numeric, note text)` for reconciliation. The 6-month chart reads month-end snapshots. When an invoice exists, the chart uses it instead.

### Growth-stage model

As in the mockup and `src/lib/stages.ts`:
- **Narration:** 2,150 characters per explainer, measured from 216 recorded Studiolo runs (median 1,890; 2,270 when built from a PDF; plus ~10% retries).
- **Claude:** ≈ $0.165 per explainer, $0.15 per co-pilot chat, $0.05 per course reading.
- **Trigger.dev:** ≈ $4.80/month of fixed schedules, plus $0.0056 per explainer.
- **Usage levels:** light (8 explainers a month), typical (20) and heavy (40).

Typical usage on v4 gives ≈ $104 / $581 / $3,986 a month at 20 / 100 / 500 users. The model is a planning tool; Phase 3 replaces its assumptions with measured per-user usage.

## Security

- **Read-only, least-scope keys:**
  - Vercel token scoped to the team
  - Cloudflare token with Account Analytics: Read and Images: Read only
  - ElevenLabs key restricted to User: Read
  - Anthropic Admin key (powerful: it can manage the organization, so it lives only in Vercel's encrypted settings)
  - Trigger.dev production secret key or a personal access token
- **No secrets in the repo.** `.env.example` documents names only. Error messages never echo request headers.
- **The dashboard fails closed.** Without `DASHBOARD_PASSWORD` the deployed site refuses all requests, and it's excluded from search indexing.
- **Studiolo's database is read-only to the dashboard.** It gets a dedicated role with `SELECT` on the usage, accounts and invitation tables only.

## Error handling and honesty rules

- Every number shows its source: live cost, live usage × list price, fixed fee, or sample.
- A failed or unconfigured vendor stays on the page with its status and the fix ("Needs API key: add CLOUDFLARE_API_TOKEN"). It is never silently dropped from the total, and the overview lists it under *Needs attention*.
- Estimated parts are noted per vendor, e.g. "Workers CPU time isn't priced" or "Images transformations not reported".

## Testing

- Unit tests (Node test runner) for the period math, meter pricing, each vendor's response parser (recorded sample payloads) and the stage model. 12 tests pass on the current build.
- **First live run per vendor is the acceptance test.** Response shapes were written from documentation, not recorded calls, so each connector is "verified" only once real keys return plausible numbers that match the vendor's own console within a few percent. Recorded responses (secrets removed) then become fixtures.
- Typecheck and `next build` on every change.

## Phasing

| Phase | Scope | Done when |
|---|---|---|
| 0 (done) | Mockup; app scaffold with 7 connectors, three pages, password gate, sample mode, tests | Builds and renders in sample mode |
| 1 | Deploy on Vercel; add keys one vendor at a time; fix connectors against real responses | Each connected vendor matches its console within a few percent |
| 2 | Daily snapshot cron + dashboard Neon DB; 6-month chart; month-end invoice entry; incremental Trigger.dev totals | History survives redeploys; chart shows real months |
| 3 | Read-only Studiolo ledger: active users, per-user and per-feature cost, Loops contact count | Cost per user uses measured users; Anthropic/ElevenLabs reconcile against vendor totals |
| 4 | Stripe: revenue, fees, margin, break-even on the Growth stages view | Overview shows income and margin |
| 5 | Alerts: credits running out before reset (ElevenLabs, Anthropic), a vendor over its monthly budget, connector failing for 24h | Owner is notified by email or Slack |

## Open questions for the owner

1. Are the two Anthropic accounts **organization** accounts? If not, convert them, or rely on the Studiolo ledger for Claude cost.
2. Use one Neon project for the dashboard's snapshots (a separate small database on the existing account), or keep history in Vercel-managed storage?
3. Should "active user" mean signed in this month, or generated at least one explainer this month?
4. Where should alerts go (Phase 5): email, Slack, or a Craft task?

## Sources

- Anthropic Usage & Cost API: https://platform.claude.com/docs/en/manage-claude/usage-cost-api
- Vercel billing charges (FOCUS): https://vercel.com/docs/rest-api/reference/endpoints/billing/list-focus-billing-charges
- Neon consumption metrics: https://neon.com/docs/guides/consumption-metrics
- Cloudflare R2 metrics: https://developers.cloudflare.com/r2/platform/metrics-analytics/ · Workers GraphQL: https://developers.cloudflare.com/analytics/graphql-api/tutorials/querying-workers-metrics/ · PayGo billing usage: https://developers.cloudflare.com/api/resources/billing/subresources/usage/methods/paygo
- Trigger.dev run usage: https://trigger.dev/docs/run-usage · runs API: https://trigger.dev/docs/management/projects/runs
- ElevenLabs subscription: https://elevenlabs.io/docs/api-reference/user/subscription/get · usage over time: https://elevenlabs.io/docs/api-reference/workspace/usage/get-usage-by-product-over-time · API pricing: https://elevenlabs.io/pricing/api
- Loops API: https://loops.so/docs/api-reference/intro
- Studiolo usage ledger: `ahmedste/studiolo` @ d6e510e, `drizzle/0002_jobs_usage.sql`, `drizzle/0016_jobs_generalise.sql`, `src/features/usage/rate-card.ts`
