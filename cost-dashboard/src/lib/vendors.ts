import { anthropic } from "./connectors/anthropic.ts";
import { cloudflare } from "./connectors/cloudflare.ts";
import { elevenlabs } from "./connectors/elevenlabs.ts";
import { loops } from "./connectors/loops.ts";
import { neon } from "./connectors/neon.ts";
import { trigger } from "./connectors/trigger.ts";
import { vercel } from "./connectors/vercel.ts";
import type { Period } from "./period.ts";
import type { VendorId, VendorResult } from "./types.ts";

export interface Vendor {
  id: VendorId;
  name: string;
  /** Categorical series color, fixed per vendor (never re-ordered by rank). */
  color: string;
  fetch: (p: Period) => Promise<VendorResult>;
}

export const VENDORS: Vendor[] = [
  { id: "vercel", name: "Vercel", color: "var(--series-1)", fetch: vercel },
  { id: "neon", name: "Neon", color: "var(--series-2)", fetch: neon },
  { id: "cloudflare", name: "Cloudflare", color: "var(--series-3)", fetch: cloudflare },
  { id: "trigger", name: "Trigger.dev", color: "var(--series-4)", fetch: trigger },
  { id: "loops", name: "Loops", color: "var(--series-5)", fetch: loops },
  { id: "elevenlabs", name: "ElevenLabs", color: "var(--series-6)", fetch: elevenlabs },
  { id: "anthropic", name: "Anthropic", color: "var(--series-7)", fetch: anthropic },
];

export function vendorById(id: string): Vendor | undefined {
  return VENDORS.find((v) => v.id === id);
}
