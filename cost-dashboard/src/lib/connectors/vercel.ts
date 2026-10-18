import { num, str } from "../env.ts";
import { request } from "../http.ts";
import { fixedFee, round2 } from "../meter.ts";
import type { Period } from "../period.ts";
import type { LineItem, VendorResult } from "../types.ts";

interface FocusCharge {
  BilledCost?: number | string;
  ChargeCategory?: string;
  ServiceName?: string;
  ChargeDescription?: string;
}

/** Parses Vercel's FOCUS billing export (one JSON object per line). */
export function parseCharges(jsonl: string): FocusCharge[] {
  return jsonl
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l) as FocusCharge);
}

/** Plan purchases are fixed for the month; usage, credits and adjustments move with the pace. */
export function chargesToItems(charges: FocusCharge[], elapsed: number): LineItem[] {
  const groups = new Map<string, { fixed: boolean; cost: number }>();
  for (const c of charges) {
    const cost = Number(c.BilledCost ?? 0);
    if (!Number.isFinite(cost) || cost === 0) continue;
    const fixed = c.ChargeCategory === "Purchase";
    const label = c.ServiceName || c.ChargeDescription || "Other";
    const key = `${fixed ? "fixed" : "usage"}:${label}`;
    const g = groups.get(key) ?? { fixed, cost: 0 };
    g.cost += cost;
    groups.set(key, g);
  }
  return [...groups.entries()]
    .map(([key, g]) => ({
      label: key.slice(key.indexOf(":") + 1),
      spent: round2(g.cost),
      projected: round2(g.fixed ? g.cost : g.cost / elapsed),
    }))
    .sort((a, b) => b.projected - a.projected);
}

export async function vercel(p: Period): Promise<VendorResult> {
  const token = str("VERCEL_TOKEN");
  const planFee = num("VERCEL_PLAN_FEE", 0);
  if (!token) {
    return {
      source: "fixed",
      status: planFee === 0 ? "ok" : "not-configured",
      plan: planFee === 0 ? "Hobby (free)" : "Pro",
      lineItems: [fixedFee(planFee === 0 ? "Hobby plan" : "Plan fee", planFee)],
      notes: planFee === 0 ? ["Free plan: nothing to bill. Add VERCEL_TOKEN once you move to Pro."] : ["Add VERCEL_TOKEN to read live usage."],
    };
  }
  const url = new URL("https://api.vercel.com/v1/billing/charges");
  url.searchParams.set("from", p.start.toISOString());
  url.searchParams.set("to", p.now.toISOString());
  const teamId = str("VERCEL_TEAM_ID");
  if (teamId) url.searchParams.set("teamId", teamId);
  const res = await request(url, { headers: { Authorization: `Bearer ${token}` } });
  const items = chargesToItems(parseCharges(await res.text()), p.elapsed);
  return {
    source: "live-cost",
    status: "ok",
    plan: planFee > 0 ? "Pro" : "Hobby (free)",
    lineItems: items.length ? items : [fixedFee("No charges yet this month", 0)],
  };
}
