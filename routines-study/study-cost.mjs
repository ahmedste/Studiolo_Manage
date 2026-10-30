// Studies: what one long, in-depth piece of work costs (Loci plans, researches and writes a course while the
// learner gets on with their day). Every rate and token shape is named here. Run: node routines-study/study-cost.mjs
// Prices (USD), checked 30 Oct 2026, from Anthropic's API reference (claude-api skill, models.md and
// managed-agents-core.md):
//  - Opus 5.5: $4 in, $20 out, cache reads $0.20 per million tokens. Sonnet 5.5: $2, $10, $0.20.
//    Haiku 5.5: $0.10, $0.50, $0.01 (prompts up to 100K tokens).
//  - Cache writes (5-minute): 1.25x input. Batch API: 50% off every token.
//  - Web search: $10 per 1,000 searches. Web fetch: tokens only.
//  - Claude Managed Agents: session running time $0.08 an hour (threads running at once counted once), plus
//    tokens and searches at list price. A session budget is a hard cap: the session pauses when it reaches it.
//  - Trigger.dev Micro machine about $0.0000169 a second (secondary sources; see cost-model.mjs).
const P = {
  opus: { in: 4, out: 20, cacheRead: 0.2 },
  sonnet: { in: 2, out: 10, cacheRead: 0.2 },
  haiku: { in: 0.1, out: 0.5, cacheRead: 0.01 },
  cacheWrite: 1.25,
  batch: 0.5,
  search: 10 / 1000,
  agentHour: 0.08,
  triggerSecond: 0.0000169,
  lumen: 0.13, // one Watch lesson = one Lumen (Live Lumens design)
  reading: 0.05, // one Read lesson (a LessonPage and quiz, Learn roadmap Phase 2; estimate)
};
const M = 1e6;
const tok = (m, { cached = 0, fresh = 0, out = 0, batch = false }) =>
  ((cached * P[m].cacheRead + fresh * P[m].in * P.cacheWrite + out * P[m].out) / M) * (batch ? P.batch : 1);

// An agent loop of T turns: it starts with c0 tokens of context; each turn adds g tokens (search results, page
// extracts, its own notes) and writes o tokens (thinking, tool calls). Earlier context is a cache read; the new
// part is written to the cache. It ends with a report of r tokens.
function loop(m, { T, c0, g, o, r, searches = 0 }) {
  let cached = 0, fresh = c0;
  for (let i = 1; i < T; i++) { cached += c0 + (i - 1) * g; fresh += g; }
  const out = T * o + r;
  return { cost: tok(m, { cached, fresh, out }) + searches * P.search, tokIn: cached + fresh, tokOut: out, searches };
}
const one = (m, inT, out, opt = {}) => ({ cost: tok(m, { fresh: inT, out, ...opt }), tokIn: inT, tokOut: out, searches: 0 });
const cachedOne = (m, cached, fresh, out) => ({ cost: tok(m, { cached, fresh, out }), tokIn: cached + fresh, tokOut: out, searches: 0 });

// Two depths. "Standard": 3 questions, about 20 minutes, no grader. "Deep": 5 questions, about 50 minutes,
// checked against a rubric by a separate grader (Managed Agents outcomes), one revision on average.
const DEPTH = {
  standard: { segs: 3, researcher: "sonnet", turns: 10, grow: 5000, perTurnOut: 700, report: 2500, searches: 5,
    planOut: 4000, coordTurns: 5, courseOut: 14000, graderIters: 0, minutes: 20 },
  deep: { segs: 5, researcher: "sonnet", turns: 14, grow: 5000, perTurnOut: 900, report: 3000, searches: 8,
    planOut: 6000, coordTurns: 7, courseOut: 24000, graderIters: 1.5, minutes: 50 },
};

function study(d, over = {}) {
  const D = { ...DEPTH[d], ...over };
  const parts = {
    // Templates in code ask the questions; one Haiku call reads the subject and the answers.
    "Scoping (what you know, what it's for, time, depth)": one("haiku", 3000, 400),
    // Opus 5.5 at high effort reads the learner's memory, what's in their Commonplace on it, and the answers.
    "Plan (shown to you before it starts)": one("opus", 14000, D.planOut),
    // Each question goes to a researcher thread with a fresh context: search, fetch, read, note, report.
    [`Research (${D.segs} questions, ${D.researcher} researchers)`]: (() => {
      const one1 = loop(D.researcher, { T: D.turns, c0: 4000, g: D.grow, o: D.perTurnOut, r: D.report, searches: D.searches });
      return { cost: one1.cost * D.segs, tokIn: one1.tokIn * D.segs, tokOut: one1.tokOut * D.segs, searches: D.searches * D.segs };
    })(),
    // The coordinator hands out questions and reads the reports.
    "Coordinating": loop("opus", { T: D.coordTurns, c0: 16000, g: D.report, o: 800, r: 0 }),
    // It writes the course as typed content (mission, lessons with a win and a source each, readings, questions).
    "Writing the course": cachedOne("opus", 35000, 5000 + D.segs * 1000, D.courseOut),
    // Deep only: a separate grader checks it against the rubric; on average one revision.
    "Checking (grader and a revision)": D.graderIters
      ? (() => { const g = one("opus", 30000, 4000), rev = cachedOne("opus", 60000, 4000, 8000);
          return { cost: g.cost * D.graderIters + rev.cost * (D.graderIters - 1), tokIn: g.tokIn * D.graderIters + rev.tokIn * (D.graderIters - 1), tokOut: g.tokOut * D.graderIters + rev.tokOut * (D.graderIters - 1), searches: 0 }; })()
      : { cost: 0, tokIn: 0, tokOut: 0, searches: 0 },
    "Running time (Managed Agents)": { cost: (D.minutes / 60) * P.agentHour, tokIn: 0, tokOut: 0, searches: 0 },
  };
  const total = Object.values(parts).reduce((a, p) => a + p.cost, 0);
  const tIn = Object.values(parts).reduce((a, p) => a + p.tokIn, 0), tOut = Object.values(parts).reduce((a, p) => a + p.tokOut, 0);
  const searches = Object.values(parts).reduce((a, p) => a + p.searches, 0);
  return { parts, total, tIn, tOut, searches, minutes: D.minutes };
}

const f = (x) => (x < 0.01 ? x.toFixed(4) : x.toFixed(2));
const k = (n) => (n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : Math.round(n / 1000) + "k");
for (const d of ["standard", "deep"]) {
  const s = study(d);
  console.log(`\n${d.toUpperCase()} study, about ${s.minutes} minutes: $${f(s.total)}  (${k(s.tIn)} tokens in, ${k(s.tOut)} out, ${s.searches} searches)`);
  for (const [n, p] of Object.entries(s.parts)) console.log(`  ${n.padEnd(52)} $${f(p.cost).padStart(6)}   ${p.tokIn ? `${k(p.tokIn)} in, ${k(p.tokOut)} out` : ""}${p.searches ? `, ${p.searches} searches` : ""}`);
}
const std = study("standard"), deep = study("deep");
console.log(`\nA deep study costs about as much as ${Math.round(deep.total / P.lumen)} Lumens; a standard one about ${Math.round(std.total / P.lumen)}.`);
const course = 5 * P.lumen + 3 * P.reading;
console.log(`Its course (5 Watch, 3 Read lessons) is made lesson by lesson as the learner reaches each one: about $${f(course)} in all, already Learn's cost.`);

console.log("\nWhat moves the number:");
console.log(`  Researchers on Haiku 5.5 instead of Sonnet 5.5: deep $${f(study("deep", { researcher: "haiku" }).total)}, standard $${f(study("standard", { researcher: "haiku" }).total)}`);
const batchSave = (s) => (s.parts["Plan (shown to you before it starts)"].cost + s.parts["Writing the course"].cost + s.parts["Checking (grader and a revision)"].cost) * P.batch;
console.log(`  "Ready by morning" (own loop on Trigger.dev; plan, writing and checks by Batch API): deep about $${f(deep.total - batchSave(deep))}`);
console.log(`  Running time on Trigger.dev instead (one Micro task for ${deep.minutes} min): $${f(deep.minutes * 60 * P.triggerSecond)} vs $${f(deep.parts["Running time (Managed Agents)"].cost)} on Managed Agents`);
console.log(`  Half the searches (Loci reads your Commonplace first): deep $${f(study("deep", { searches: 4 }).total)}`);

console.log("\nPer learner per month, with routines (cost-model.mjs: light $0.08, typical $0.36, heavy $2.35):");
const R = { light: 0.08, typical: 0.36, heavy: 2.35 };
const use = { light: [0, 0], typical: [1, 0], heavy: [2, 1] }; // [standard, deep] studies a month
for (const [n, [a, b]] of Object.entries(use)) {
  const st = a * std.total + b * deep.total;
  console.log(`  ${n.padEnd(8)} ${a} standard + ${b} deep: studies $${f(st)}, with routines $${f(st + R[n])} a month`);
}
const typ = 1 * std.total + R.typical;
console.log(`  1,000 typical learners: about $${Math.round(typ * 1000)} a month (routines and studies; lessons are Learn's cost)`);
