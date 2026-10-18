import { num, str } from "../env.ts";
import { getJson } from "../http.ts";
import { compact, fixedFee, priceMeter } from "../meter.ts";
import { isoDate, type Period } from "../period.ts";
import { PRICES } from "../pricing.ts";
import type { LineItem, VendorResult } from "../types.ts";

/** R2 operation classes: https://developers.cloudflare.com/r2/pricing/ */
export function r2Class(actionType: string): "A" | "B" | "free" {
  if (/^(DeleteObject|DeleteObjects|AbortMultipartUpload)$/.test(actionType)) return "free";
  if (/^(Put|Copy|Complete|Create|Upload|List|LifecycleStorageTierTransition)/.test(actionType)) return "A";
  return "B";
}

const QUERY = `
query Usage($account: String!, $start: Date!, $end: Date!) {
  viewer {
    accounts(filter: { accountTag: $account }) {
      r2Storage: r2StorageAdaptiveGroups(limit: 10000, filter: { date_geq: $start, date_leq: $end }) {
        max { payloadSize metadataSize }
        dimensions { date bucketName }
      }
      r2Ops: r2OperationsAdaptiveGroups(limit: 10000, filter: { date_geq: $start, date_leq: $end }) {
        sum { requests }
        dimensions { actionType }
      }
      workers: workersInvocationsAdaptive(limit: 10000, filter: { date_geq: $start, date_leq: $end }) {
        sum { requests }
      }
    }
  }
}`;

interface UsageResponse {
  data?: {
    viewer?: {
      accounts?: Array<{
        r2Storage?: Array<{ max: { payloadSize: number; metadataSize: number }; dimensions: { date: string; bucketName: string } }>;
        r2Ops?: Array<{ sum: { requests: number }; dimensions: { actionType: string } }>;
        workers?: Array<{ sum: { requests: number } }>;
      }>;
    };
  };
  errors?: Array<{ message: string }> | null;
}

/** Stored bytes on the latest day reported, summed across buckets. */
export function latestStoredBytes(rows: NonNullable<NonNullable<NonNullable<UsageResponse["data"]>["viewer"]>["accounts"]>[number]["r2Storage"] = []): number {
  const latest = rows.reduce((d, r) => (r.dimensions.date > d ? r.dimensions.date : d), "");
  return rows.filter((r) => r.dimensions.date === latest).reduce((a, r) => a + r.max.payloadSize + r.max.metadataSize, 0);
}

export async function cloudflare(p: Period): Promise<VendorResult> {
  const c = PRICES.cloudflare;
  const workersFee = num("CLOUDFLARE_WORKERS_PLAN_FEE", c.workersPaidFee);
  const token = str("CLOUDFLARE_API_TOKEN");
  const account = str("CLOUDFLARE_ACCOUNT_ID");
  if (!token || !account) {
    return {
      source: "fixed",
      status: "not-configured",
      plan: "Workers Paid · R2 · Images",
      lineItems: [fixedFee("Workers Paid plan", workersFee)],
      notes: ["Add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID to read R2, Workers and Images usage."],
    };
  }
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const body = await getJson<UsageResponse>("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers,
    body: JSON.stringify({ query: QUERY, variables: { account, start: isoDate(p.start), end: isoDate(p.now) } }),
  });
  if (body.errors?.length) throw new Error(`Cloudflare GraphQL: ${body.errors.map((e) => e.message).join("; ")}`);
  const acct = body.data?.viewer?.accounts?.[0] ?? {};

  const ops = { A: 0, B: 0, free: 0 };
  for (const r of acct.r2Ops ?? []) ops[r2Class(r.dimensions.actionType)] += r.sum.requests;
  const storedGb = latestStoredBytes(acct.r2Storage) / 1e9;
  const workerRequests = (acct.workers ?? []).reduce((a, r) => a + r.sum.requests, 0);

  const notes: string[] = ["Priced from usage at Cloudflare list prices. Workers CPU time isn't in the analytics API, so only requests are priced."];
  let images: LineItem;
  try {
    const stats = await getJson<{ result?: { count?: { current?: number } } }>(
      `https://api.cloudflare.com/client/v4/accounts/${account}/images/v1/stats`,
      { headers },
    );
    const stored = stats.result?.count?.current ?? 0;
    images = priceMeter({ label: "Images · stored", used: stored, price: c.imagesStoragePer100k, per: 100_000, kind: "level", format: (n) => `${compact(n)} images` }, p.elapsed);
    notes.push("Images transformations and deliveries aren't reported by the API yet; only storage is priced.");
  } catch {
    images = { label: "Images · stored", quantity: "unavailable", spent: 0, projected: 0 };
    notes.push("Couldn't read Images stats (token needs Cloudflare Images: Read).");
  }

  const items: LineItem[] = [
    fixedFee("Workers · Paid plan", workersFee),
    priceMeter({ label: "Workers · requests", used: workerRequests, included: c.workersIncludedRequests, price: c.workersPerMillionRequests, per: 1e6 }, p.elapsed),
    priceMeter({ label: "R2 · storage", used: storedGb, included: c.r2IncludedGb, price: c.r2StorageGbMonth, kind: "level", format: (n) => `${n.toFixed(2)} GB` }, p.elapsed),
    priceMeter({ label: "R2 · writes (Class A)", used: ops.A, included: c.r2IncludedClassA, price: c.r2ClassAPerMillion, per: 1e6 }, p.elapsed),
    priceMeter({ label: "R2 · reads (Class B)", used: ops.B, included: c.r2IncludedClassB, price: c.r2ClassBPerMillion, per: 1e6 }, p.elapsed),
    images,
  ];
  return { source: "usage-x-price", status: "ok", plan: "Workers Paid · R2 · Images", lineItems: items, notes };
}
