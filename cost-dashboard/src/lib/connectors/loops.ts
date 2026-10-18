import { num } from "../env.ts";
import { fixedFee } from "../meter.ts";
import type { VendorResult } from "../types.ts";

/** Loops has no billing or contact-count API; its fee is a setting. */
export async function loops(): Promise<VendorResult> {
  const fee = num("LOOPS_MONTHLY_FEE", 0);
  return {
    source: "fixed",
    status: "ok",
    plan: fee === 0 ? "Free (up to 1,000 contacts)" : "Paid",
    lineItems: [fixedFee(fee === 0 ? "Free plan" : "Monthly plan", fee)],
    notes: ["Set LOOPS_MONTHLY_FEE when you pass 1,000 subscribed contacts ($49 up to 5,000)."],
  };
}
