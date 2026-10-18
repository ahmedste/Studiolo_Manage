import assert from "node:assert/strict";
import { test } from "node:test";
import { periodBetween } from "../period.ts";
import { sumCostReport } from "./anthropic.ts";
import { latestStoredBytes, r2Class } from "./cloudflare.ts";
import { cycleElapsed } from "./elevenlabs.ts";
import { sumMetrics } from "./neon.ts";
import { chargesToItems, parseCharges } from "./vercel.ts";

test("vercel: JSONL charges group by service; plan purchases aren't scaled", () => {
  const jsonl = [
    '{"BilledCost":20,"ChargeCategory":"Purchase","ServiceName":"Pro plan"}',
    '{"BilledCost":"3.5","ChargeCategory":"Usage","ServiceName":"Functions"}',
    '{"BilledCost":1.5,"ChargeCategory":"Usage","ServiceName":"Functions"}',
    "",
  ].join("\n");
  const items = chargesToItems(parseCharges(jsonl), 0.5);
  assert.deepEqual(items, [
    { label: "Pro plan", spent: 20, projected: 20 },
    { label: "Functions", spent: 5, projected: 10 },
  ]);
});

test("neon: sums metrics at any nesting depth", () => {
  const body = {
    projects: [
      { periods: [{ consumption: [{ metrics: [{ metric_name: "compute_unit_seconds", value: 3600 }] }, { metrics: [{ metric_name: "compute_unit_seconds", value: 1800 }] }] }] },
      { periods: [{ consumption: [{ metrics: [{ metric_name: "root_branch_bytes_month", value: "500" }] }] }] },
    ],
  };
  assert.deepEqual(sumMetrics(body), { compute_unit_seconds: 5400, root_branch_bytes_month: 500 });
});

test("cloudflare: R2 operation classes", () => {
  assert.equal(r2Class("PutObject"), "A");
  assert.equal(r2Class("ListObjectsV2"), "A");
  assert.equal(r2Class("GetObject"), "B");
  assert.equal(r2Class("HeadObject"), "B");
  assert.equal(r2Class("DeleteObject"), "free");
});

test("cloudflare: storage uses the latest day across buckets", () => {
  const rows = [
    { max: { payloadSize: 100, metadataSize: 1 }, dimensions: { date: "2026-10-01", bucketName: "a" } },
    { max: { payloadSize: 300, metadataSize: 2 }, dimensions: { date: "2026-10-02", bucketName: "a" } },
    { max: { payloadSize: 50, metadataSize: 0 }, dimensions: { date: "2026-10-02", bucketName: "b" } },
  ];
  assert.equal(latestStoredBytes(rows), 352);
});

test("anthropic: cost report amounts are cents, summed across pages and buckets", () => {
  const totals = sumCostReport([
    { data: [{ results: [{ amount: "1250.5", description: "Claude Opus 5.5 Usage - Output Tokens" }] }] },
    { data: [{ results: [{ amount: "749.5", description: "Claude Opus 5.5 Usage - Output Tokens" }, { amount: "100", model: "claude-sonnet-5-5" }] }] },
  ]);
  assert.equal(totals.get("Claude Opus 5.5 Usage - Output Tokens"), 20);
  assert.equal(totals.get("claude-sonnet-5-5"), 1);
});

test("elevenlabs: projects over its own billing cycle", () => {
  const now = new Date("2026-10-18T00:00:00Z");
  const fallback = periodBetween(new Date("2026-10-01T00:00:00Z"), new Date("2026-11-01T00:00:00Z"), now);
  // Cycle 2026-10-03 → 2026-11-03: 15 of 31 days passed
  const e = cycleElapsed({ next_character_count_reset_unix: Date.parse("2026-11-03T00:00:00Z") / 1000 }, now, fallback);
  assert.ok(Math.abs(e - 15 / 31) < 1e-9);
  assert.equal(cycleElapsed({}, now, fallback), fallback.elapsed);
});
