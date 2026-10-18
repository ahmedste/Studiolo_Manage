import assert from "node:assert/strict";
import { test } from "node:test";
import { priceMeter } from "./meter.ts";
import { currentMonth } from "./period.ts";
import { stages } from "./stages.ts";

test("currentMonth: halfway through a 30-day month", () => {
  const p = currentMonth(new Date("2026-11-16T00:00:00Z"));
  assert.equal(p.start.toISOString(), "2026-11-01T00:00:00.000Z");
  assert.equal(p.end.toISOString(), "2026-12-01T00:00:00.000Z");
  assert.equal(p.elapsed, 0.5);
});

test("currentMonth: never returns zero elapsed", () => {
  assert.ok(currentMonth(new Date("2026-11-01T00:00:00Z")).elapsed > 0);
});

test("priceMeter: flow usage scales to month end and respects the free allowance", () => {
  const item = priceMeter({ label: "x", used: 6_000_000, included: 10_000_000, price: 0.3, per: 1e6 }, 0.5);
  assert.equal(item.spent, 0); // 6M used, 10M free
  assert.equal(item.projected, 0.6); // 12M projected → 2M billable × $0.30
});

test("priceMeter: level usage (storage) is not scaled up", () => {
  const item = priceMeter({ label: "GB", used: 20, included: 10, price: 0.015, kind: "level" }, 0.5);
  assert.equal(item.projected, 0.15);
  assert.equal(item.spent, 0); // 20 GB × half a month = 10 GB-months, all free
});

test("stages: typical usage on v4 matches the mockup", () => {
  const [pre, early, mvp] = stages("typical", "v4").map((s) => Math.round(s.total));
  assert.equal(pre, 104);
  assert.equal(early, 581);
  assert.equal(mvp, 3986);
});

test("stages: Turbo halves narration", () => {
  const v4 = stages("heavy", "v4")[2].lines.find((l) => l.name === "ElevenLabs")!.cost;
  const turbo = stages("heavy", "turbo")[2].lines.find((l) => l.name === "ElevenLabs")!.cost;
  assert.equal(Math.round(turbo * 2), Math.round(v4));
});
