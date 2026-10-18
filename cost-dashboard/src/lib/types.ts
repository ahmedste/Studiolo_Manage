export type VendorId =
  | "vercel"
  | "neon"
  | "cloudflare"
  | "trigger"
  | "loops"
  | "elevenlabs"
  | "anthropic";

/** Where a vendor's number comes from. */
export type Source =
  | "live-cost" // the vendor's API returns dollars
  | "usage-x-price" // the API returns quantities; we multiply by published prices
  | "fixed" // a plan fee entered in settings
  | "sample"; // demo data (DASHBOARD_SAMPLE=1)

export type Status = "ok" | "not-configured" | "error";

export interface LineItem {
  label: string;
  /** Human-readable quantity, e.g. "1.2M characters". */
  quantity?: string;
  /** USD charged so far this month. */
  spent: number;
  /** USD expected by the end of the month at the current pace. */
  projected: number;
}

export interface VendorResult {
  source: Source;
  status: Status;
  plan: string;
  lineItems: LineItem[];
  /** Shown under the vendor name: what's missing, what's estimated. */
  notes?: string[];
}

export interface VendorReport extends VendorResult {
  id: VendorId;
  name: string;
  color: string;
  spent: number;
  projected: number;
  fetchedAt: string;
}
