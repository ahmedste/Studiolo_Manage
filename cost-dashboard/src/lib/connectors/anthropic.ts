import { list, num } from "../env.ts";
import { getJson } from "../http.ts";
import { round2 } from "../meter.ts";
import type { Period } from "../period.ts";
import type { LineItem, VendorResult } from "../types.ts";

interface CostReport {
  data?: Array<{ results?: Array<{ amount?: string; currency?: string; description?: string | null; model?: string | null }> }>;
  has_more?: boolean;
  next_page?: string | null;
}

/** Cost report amounts are decimal strings in cents. Returns USD per description. */
export function sumCostReport(pages: CostReport[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const page of pages) {
    for (const bucket of page.data ?? []) {
      for (const r of bucket.results ?? []) {
        const usd = Number(r.amount ?? 0) / 100;
        if (!Number.isFinite(usd)) continue;
        const label = r.description || r.model || "Other";
        out.set(label, (out.get(label) ?? 0) + usd);
      }
    }
  }
  return out;
}

async function fetchCostReport(key: string, p: Period): Promise<CostReport[]> {
  const pages: CostReport[] = [];
  let page: string | undefined;
  do {
    const url = new URL("https://api.anthropic.com/v1/organizations/cost_report");
    url.searchParams.set("starting_at", p.start.toISOString());
    url.searchParams.set("ending_at", p.now.toISOString());
    url.searchParams.set("bucket_width", "1d");
    url.searchParams.append("group_by[]", "description");
    url.searchParams.set("limit", "31");
    if (page) url.searchParams.set("page", page);
    const body = await getJson<CostReport>(url, { headers: { "x-api-key": key, "anthropic-version": "2023-06-01" } });
    pages.push(body);
    page = body.has_more && body.next_page ? body.next_page : undefined;
  } while (page);
  return pages;
}

/** Usage across one or more organizations (comma-separated admin keys), minus monthly credits. */
export async function anthropic(p: Period): Promise<VendorResult> {
  const keys = list("ANTHROPIC_ADMIN_KEYS");
  const credits = num("ANTHROPIC_MONTHLY_CREDITS", 300);
  if (!keys.length) {
    return {
      source: "fixed",
      status: "not-configured",
      plan: `API · $${credits}/mo credits`,
      lineItems: [{ label: "Usage", spent: 0, projected: 0 }],
      notes: ["Add ANTHROPIC_ADMIN_KEYS. The Usage & Cost API needs an organization account (Console → Settings → Organization) and an Admin key."],
    };
  }
  const totals = new Map<string, number>();
  for (const key of keys) {
    for (const [label, usd] of sumCostReport(await fetchCostReport(key, p))) totals.set(label, (totals.get(label) ?? 0) + usd);
  }
  const usage: LineItem[] = [...totals.entries()]
    .map(([label, usd]) => ({ label, spent: round2(usd), projected: round2(usd / p.elapsed) }))
    .sort((a, b) => b.projected - a.projected);
  const used = usage.reduce((a, i) => a + i.spent, 0);
  const projectedUse = usage.reduce((a, i) => a + i.projected, 0);
  // Credits absorb usage first; only what's left is paid.
  const creditLine: LineItem = {
    label: `Monthly credits ($${credits})`,
    spent: -round2(Math.min(credits, used)),
    projected: -round2(Math.min(credits, projectedUse)),
  };
  return {
    source: "live-cost",
    status: "ok",
    plan: `API · ${keys.length} account${keys.length > 1 ? "s" : ""} · $${credits}/mo credits`,
    lineItems: [...usage, creditLine],
    notes: [`$${round2(used)} of usage so far; credits cover the first $${credits}. Data lags about 5 minutes.`],
  };
}
