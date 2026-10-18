/** Reads a setting; empty strings count as unset. */
export function str(name: string): string | undefined {
  const v = process.env[name]?.trim();
  return v ? v : undefined;
}

export function num(name: string, fallback: number): number {
  const v = str(name);
  if (v === undefined) return fallback;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`${name} must be a number, got "${v}"`);
  return n;
}

export function list(name: string): string[] {
  return (str(name) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
