import type { LineItem } from "./types.ts";

export interface Meter {
  label: string;
  /** Usage so far this period, in the meter's own unit. */
  used: number;
  /** Free allowance per period, same unit. */
  included?: number;
  /** Price per `per` units. */
  price: number;
  per?: number;
  /** How to print the quantity, e.g. (n) => `${n} GB`. */
  format?: (n: number) => string;
  /**
   * "flow" usage (requests, characters) grows through the month, so the projection scales it up.
   * "level" usage (stored GB) is already a monthly rate, so it isn't scaled.
   */
  kind?: "flow" | "level";
}

/** Prices one usage meter for "so far" and "by month end". */
export function priceMeter(m: Meter, elapsed: number): LineItem {
  const per = m.per ?? 1;
  const included = m.included ?? 0;
  const cost = (q: number) => (Math.max(0, q - included) / per) * m.price;
  const kind = m.kind ?? "flow";
  const projectedUse = kind === "flow" ? m.used / elapsed : m.used;
  const spentUse = kind === "flow" ? m.used : m.used * elapsed;
  return {
    label: m.label,
    quantity: (m.format ?? compact)(m.used),
    spent: round2(cost(spentUse)),
    projected: round2(cost(projectedUse)),
  };
}

/** A plan fee: charged in full at the start of the month. */
export function fixedFee(label: string, amount: number): LineItem {
  return { label, spent: amount, projected: amount };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function compact(n: number): string {
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e4) return `${(n / 1e3).toFixed(1)}k`;
  return `${Math.round(n * 100) / 100}`;
}

export function sum(items: LineItem[], key: "spent" | "projected"): number {
  return round2(items.reduce((a, i) => a + i[key], 0));
}
