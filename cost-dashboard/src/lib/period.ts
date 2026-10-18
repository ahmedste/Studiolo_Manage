export interface Period {
  start: Date;
  end: Date;
  now: Date;
  /** Share of the period that has passed, in (0, 1]. */
  elapsed: number;
}

/** The current calendar month in UTC, which is how most of these vendors bill. */
export function currentMonth(now: Date = new Date()): Period {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return periodBetween(start, end, now);
}

export function periodBetween(start: Date, end: Date, now: Date = new Date()): Period {
  const total = end.getTime() - start.getTime();
  const passed = Math.min(Math.max(now.getTime() - start.getTime(), 0), total);
  // Never 0: projecting from the first minutes of a month would divide by zero.
  const elapsed = Math.max(passed / total, 1 / (24 * 31));
  return { start, end, now, elapsed };
}

/** YYYY-MM-DD in UTC. */
export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
