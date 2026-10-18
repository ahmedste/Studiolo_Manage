import { num, str } from "../env.ts";
import { getJson } from "../http.ts";
import { fixedFee, priceMeter } from "../meter.ts";
import type { Period } from "../period.ts";
import { PRICES } from "../pricing.ts";
import type { VendorResult } from "../types.ts";

const METRICS = [
  "compute_unit_seconds",
  "root_branch_bytes_month",
  "child_branch_bytes_month",
  "instant_restore_bytes_month",
  "public_network_transfer_bytes",
  "extra_branches_month",
] as const;

/**
 * Sums every {metric_name, value} pair in Neon's consumption response, whatever the nesting
 * (projects → periods → consumption → metrics), so a reshuffle of wrappers doesn't break totals.
 */
export function sumMetrics(body: unknown): Record<string, number> {
  const totals: Record<string, number> = {};
  const walk = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== "object") return;
    const o = node as Record<string, unknown>;
    const name = (o.metric_name ?? o.metric) as string | undefined;
    if (typeof name === "string" && o.value !== undefined) {
      const v = Number(o.value);
      if (Number.isFinite(v)) totals[name] = (totals[name] ?? 0) + v;
      return;
    }
    Object.values(o).forEach(walk);
  };
  walk(body);
  return totals;
}

const GB = 1e9;

export async function neon(p: Period): Promise<VendorResult> {
  const key = str("NEON_API_KEY");
  if (!key) {
    const fee = num("NEON_FIXED_MONTHLY", 0);
    return {
      source: "fixed",
      status: "not-configured",
      plan: "Launch (pay per use)",
      lineItems: [fixedFee("Estimated monthly", fee)],
      notes: ["Add NEON_API_KEY to read live usage. Usage history is only available on paid plans."],
    };
  }
  const url = new URL("https://console.neon.tech/api/v2/consumption_history/v2/projects");
  url.searchParams.set("from", p.start.toISOString());
  url.searchParams.set("to", p.now.toISOString());
  url.searchParams.set("granularity", "daily");
  url.searchParams.set("metrics", METRICS.join(","));
  const org = str("NEON_ORG_ID");
  if (org) url.searchParams.set("org_id", org);
  const m = sumMetrics(await getJson(url, { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } }));
  const n = PRICES.neon;
  // Byte-month metrics accumulate day by day, so they grow through the month like a flow.
  const items = [
    priceMeter({ label: "Compute", used: (m.compute_unit_seconds ?? 0) / 3600, price: n.cuHour, format: (v) => `${v.toFixed(1)} CU-hours` }, p.elapsed),
    priceMeter({ label: "Storage", used: ((m.root_branch_bytes_month ?? 0) + (m.child_branch_bytes_month ?? 0)) / GB, price: n.storageGbMonth, format: (v) => `${v.toFixed(2)} GB-months` }, p.elapsed),
    priceMeter({ label: "Restore history", used: (m.instant_restore_bytes_month ?? 0) / GB, price: n.restoreGbMonth, format: (v) => `${v.toFixed(2)} GB-months` }, p.elapsed),
    priceMeter({ label: "Network transfer", used: (m.public_network_transfer_bytes ?? 0) / GB, included: n.transferIncludedGb, price: n.transferPerGb, format: (v) => `${v.toFixed(1)} GB` }, p.elapsed),
    priceMeter({ label: "Extra branches", used: m.extra_branches_month ?? 0, price: n.extraBranchMonth, format: (v) => `${v.toFixed(2)} branch-months` }, p.elapsed),
  ];
  return {
    source: "usage-x-price",
    status: "ok",
    plan: "Launch (pay per use)",
    lineItems: items,
    notes: ["Priced from usage at Launch-plan list prices."],
  };
}
