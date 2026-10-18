# Studiolo cost dashboard

One page that shows what it costs to run Studiolo this month, per service, with a month-end projection and a growth-stage model (20 / 100 / 500 users).

Design mockup: https://claude.ai/artifact/FHNoMufFfjnDM3i1KB2bGs

## Pages

- **Overview** (`/`): spent so far, projected bill, cost per active user, every service with its share of the bill and data status.
- **Service detail** (`/vendor/[id]`): line items, usage, notes on what's estimated.
- **Growth stages** (`/stages`): the 20 / 100 / 500-user cost model, with usage (light / typical / heavy) and voice model (v4 / v4 Turbo) switches.

Numbers refresh at most once an hour.

## Where each number comes from

| Service | Data | Source |
|---|---|---|
| Vercel | Live cost | `GET /v1/billing/charges` (FOCUS export). Fixed $0 while on Hobby. |
| Neon | Usage × Launch prices | `GET /api/v2/consumption_history/v2/projects` (paid plans only) |
| Cloudflare | Usage × list prices + $5 Workers Paid | GraphQL Analytics (R2 storage + operations, Workers requests), Images stats |
| Trigger.dev | Live cost per run + plan fee | Management API runs list (`costInCents` + `baseCostInCents`) |
| Loops | Fixed fee | No billing API: `LOOPS_MONTHLY_FEE` |
| ElevenLabs | Characters × pay-as-you-go rate | `GET /v1/user/subscription` |
| Anthropic | Live cost − monthly credits | `GET /v1/organizations/cost_report` (organization accounts + Admin key only) |

List prices live in `src/lib/pricing.ts`; the growth-stage model and its measured assumptions live in `src/lib/stages.ts`.

Known gaps: Cloudflare Workers CPU time and Images transformations/deliveries aren't in the APIs we read, so only Workers requests and Images storage are priced. ElevenLabs counts characters over its own billing cycle, not the calendar month.

## Run it

```bash
cd cost-dashboard
npm install
cp .env.example .env.local   # fill in keys, or set DASHBOARD_SAMPLE=1
npm run dev                  # http://localhost:3000
npm test                     # unit tests (parsers, pricing, stage model)
npm run typecheck
```

## Deploy on Vercel

1. New project → import `Studiolo_Manage`, set **Root Directory** to `cost-dashboard`.
2. Add the variables from `.env.example` under Settings → Environment Variables. Set `DASHBOARD_PASSWORD`: without it the deployed site refuses all requests.
3. Deploy. Use read-only keys everywhere; none of them belong in this repo.

## Next steps

- Store a daily snapshot (Neon table) for month-over-month history and the 6-month chart.
- Read active users from Studiolo's database instead of `ACTIVE_USERS`.
- Connect Stripe for revenue and margin.
- Alerts (e.g. ElevenLabs or Anthropic credits running out before reset).
