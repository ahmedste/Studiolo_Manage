import { num, str } from "./env.ts";
import { round2, sum } from "./meter.ts";
import { currentMonth, type Period } from "./period.ts";
import { sampleResult } from "./sample.ts";
import type { VendorReport, VendorResult } from "./types.ts";
import { VENDORS, type Vendor } from "./vendors.ts";

export interface Report {
  period: Period;
  vendors: VendorReport[];
  spent: number;
  projected: number;
  activeUsers: number | undefined;
  generatedAt: string;
}

async function runVendor(v: Vendor, p: Period, sample: boolean): Promise<VendorReport> {
  let result: VendorResult;
  try {
    result = sample ? sampleResult(v.id, p) : await v.fetch(p);
  } catch (err) {
    result = {
      source: "usage-x-price",
      status: "error",
      plan: "—",
      lineItems: [],
      notes: [err instanceof Error ? err.message : String(err)],
    };
  }
  return {
    ...result,
    id: v.id,
    name: v.name,
    color: v.color,
    spent: sum(result.lineItems, "spent"),
    projected: sum(result.lineItems, "projected"),
    fetchedAt: new Date().toISOString(),
  };
}

export async function buildReport(now = new Date()): Promise<Report> {
  const period = currentMonth(now);
  const sample = str("DASHBOARD_SAMPLE") === "1";
  const vendors = await Promise.all(VENDORS.map((v) => runVendor(v, period, sample)));
  const users = num("ACTIVE_USERS", 0);
  return {
    period,
    vendors,
    spent: round2(vendors.reduce((a, v) => a + v.spent, 0)),
    projected: round2(vendors.reduce((a, v) => a + v.projected, 0)),
    activeUsers: users > 0 ? users : undefined,
    generatedAt: new Date().toISOString(),
  };
}
