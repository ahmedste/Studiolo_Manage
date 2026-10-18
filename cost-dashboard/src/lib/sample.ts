import { fixedFee, priceMeter } from "./meter.ts";
import type { Period } from "./period.ts";
import type { VendorId, VendorResult } from "./types.ts";

/**
 * Demo numbers for a 20-user friends beta at "typical" usage (DASHBOARD_SAMPLE=1),
 * so the dashboard can be reviewed before any keys are added.
 */
export function sampleResult(id: VendorId, p: Period): VendorResult {
  const e = p.elapsed;
  const items = {
    vercel: [fixedFee("Hobby plan", 0)],
    neon: [priceMeter({ label: "Compute", used: 182 * e, price: 0.106, format: (v) => `${v.toFixed(1)} CU-hours` }, e), priceMeter({ label: "Storage", used: 0.4 * e, price: 0.35, format: (v) => `${v.toFixed(2)} GB-months` }, e)],
    cloudflare: [fixedFee("Workers · Paid plan", 5), { label: "R2 · storage", quantity: "1.9 GB", spent: 0, projected: 0 }, { label: "Images · stored", quantity: "620 images", spent: 0, projected: 0 }],
    trigger: [fixedFee("Hobby plan (includes $10 usage)", 10), { label: "Usage beyond included", quantity: `${Math.round(30_000 * e).toLocaleString("en-US")} runs`, spent: 0, projected: 0 }],
    loops: [fixedFee("Free plan", 0)],
    elevenlabs: [priceMeter({ label: "Characters ($0.08/1K)", used: 860_000 * e, included: 10_000, price: 0.08, per: 1000 }, e)],
    anthropic: [{ label: "Claude Opus 5.5", spent: 70 * e, projected: 70 }, { label: "Claude Sonnet 5.5", spent: 24 * e, projected: 24 }, { label: "Monthly credits ($300)", spent: -94 * e, projected: -94 }],
  } satisfies Record<VendorId, VendorResult["lineItems"]>;
  return { source: "sample", status: "ok", plan: "Sample data", lineItems: items[id], notes: ["Sample data: set DASHBOARD_SAMPLE=0 and add API keys for live numbers."] };
}
