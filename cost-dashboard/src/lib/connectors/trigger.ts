import { num, str } from "../env.ts";
import { getJson } from "../http.ts";
import { fixedFee, round2 } from "../meter.ts";
import type { Period } from "../period.ts";
import type { VendorResult } from "../types.ts";

interface RunsPage {
  data?: Array<{ costInCents?: number; baseCostInCents?: number }>;
  pagination?: { next?: string | null };
}

const MAX_PAGES = 500;

/** Trigger.dev has no billing API, so we add up the cost the API reports on every run this month. */
export async function trigger(p: Period): Promise<VendorResult> {
  const fee = num("TRIGGER_PLAN_FEE", 10);
  const included = num("TRIGGER_INCLUDED_USAGE", 10);
  const plan = fee >= 50 ? "Pro" : fee > 0 ? "Hobby" : "Free";
  const token = str("TRIGGER_ACCESS_TOKEN") ?? str("TRIGGER_SECRET_KEY");
  if (!token) {
    return {
      source: "fixed",
      status: "not-configured",
      plan,
      lineItems: [fixedFee(`${plan} plan`, fee)],
      notes: ["Add TRIGGER_ACCESS_TOKEN (+ TRIGGER_PROJECT_REF) or a production TRIGGER_SECRET_KEY to read run costs."],
    };
  }
  const project = str("TRIGGER_PROJECT_REF");
  const base = project
    ? `https://api.trigger.dev/api/v1/projects/${project}/runs`
    : "https://api.trigger.dev/api/v1/runs";

  let cents = 0;
  let runs = 0;
  let after: string | undefined;
  for (let page = 0; page < MAX_PAGES; page++) {
    const url = new URL(base);
    url.searchParams.set("filter[createdAt][from]", p.start.toISOString());
    url.searchParams.set("filter[createdAt][to]", p.now.toISOString());
    url.searchParams.set("page[size]", "100");
    if (after) url.searchParams.set("page[after]", after);
    const body = await getJson<RunsPage>(url, { headers: { Authorization: `Bearer ${token}` } });
    for (const r of body.data ?? []) {
      cents += (r.costInCents ?? 0) + (r.baseCostInCents ?? 0);
      runs++;
    }
    after = body.pagination?.next ?? undefined;
    if (!after) break;
  }

  const usage = cents / 100;
  const projectedUsage = usage / p.elapsed;
  return {
    source: "live-cost",
    status: "ok",
    plan,
    lineItems: [
      fixedFee(`${plan} plan (includes $${included} usage)`, fee),
      {
        label: "Usage beyond included",
        quantity: `${runs.toLocaleString("en-US")} runs · $${usage.toFixed(2)} used`,
        spent: round2(Math.max(0, usage - included)),
        projected: round2(Math.max(0, projectedUsage - included)),
      },
    ],
  };
}
