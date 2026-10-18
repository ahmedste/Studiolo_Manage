import { num, str } from "../env.ts";
import { getJson } from "../http.ts";
import { compact, fixedFee, priceMeter } from "../meter.ts";
import { periodBetween, type Period } from "../period.ts";
import { PRICES } from "../pricing.ts";
import type { VendorResult } from "../types.ts";

interface Subscription {
  tier?: string;
  character_count?: number;
  character_limit?: number;
  next_character_count_reset_unix?: number;
}

/**
 * ElevenLabs counts characters per its own billing cycle (which resets on the subscription date,
 * not the 1st), so the projection uses that cycle's elapsed share.
 */
export function cycleElapsed(sub: Subscription, now: Date, fallback: Period): number {
  if (!sub.next_character_count_reset_unix) return fallback.elapsed;
  const end = new Date(sub.next_character_count_reset_unix * 1000);
  const start = new Date(end);
  start.setUTCMonth(start.getUTCMonth() - 1);
  return periodBetween(start, end, now).elapsed;
}

export async function elevenlabs(p: Period): Promise<VendorResult> {
  const fee = num("ELEVENLABS_PLAN_FEE", 0);
  const rate = num("ELEVENLABS_RATE_PER_1K", PRICES.elevenlabs.v4Per1k);
  const included = num("ELEVENLABS_INCLUDED_CHARS", 10_000);
  const key = str("ELEVENLABS_API_KEY");
  if (!key) {
    return {
      source: "fixed",
      status: "not-configured",
      plan: "Pay as you go",
      lineItems: [fixedFee("Plan fee", fee)],
      notes: ["Add ELEVENLABS_API_KEY (User: read permission) to read characters used."],
    };
  }
  const sub = await getJson<Subscription>("https://api.elevenlabs.io/v1/user/subscription", { headers: { "xi-api-key": key } });
  const used = sub.character_count ?? 0;
  const elapsed = cycleElapsed(sub, p.now, p);
  const items = [
    ...(fee > 0 ? [fixedFee("Plan fee", fee)] : []),
    priceMeter({ label: `Characters ($${rate}/1K)`, used, included, price: rate, per: 1000, format: (n) => `${compact(n)} characters` }, elapsed),
  ];
  const reset = sub.next_character_count_reset_unix ? new Date(sub.next_character_count_reset_unix * 1000).toISOString().slice(0, 10) : undefined;
  return {
    source: "usage-x-price",
    status: "ok",
    plan: `${sub.tier ?? "Pay as you go"} · $${rate}/1K characters`,
    lineItems: items,
    notes: [
      `First ${compact(included)} characters free each cycle.${reset ? ` Cycle resets ${reset}.` : ""}`,
      "Rate is a setting (ELEVENLABS_RATE_PER_1K): 0.08 for v4, 0.04 for v4 Turbo.",
    ],
  };
}
