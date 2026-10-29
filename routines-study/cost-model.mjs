// Routines: cost per user per month. Every rate and assumption is named here, so the study can be re-run
// when a price or a usage figure changes. Run: node routines-study/cost-model.mjs
// Prices (USD), checked 29 Oct 2026:
//  - Claude: Anthropic API pricing (claude-api reference, cached 2026-10-06). Batch API: 50% off every token.
//    Cache reads: 0.1x input on Haiku 5.5 and Sonnet 5.5. Haiku 5.5 rates are for prompts up to 100K tokens.
//  - Web search tool: $10 per 1,000 searches. Web fetch: tokens only.
//  - ElevenLabs Scribe v2 speech-to-text: $0.22 per hour (elevenlabs.io/pricing/api).
//  - Trigger.dev: $0.000025 per run; Micro machine $0.0000169 per second (secondary sources; trigger.dev was not
//    reachable from the study session, so confirm on its pricing page).
//  - WhatsApp Business Platform: from 1 Oct 2026 Studiolo's replies inside the 24-hour window are billed;
//    rates vary by country (about $0.0034 to $0.0068 in the US; higher in parts of Europe). 1,000 free service
//    messages per business number per month, shared by all users. Inbound messages are free.
//  - Cloudflare: Workers Paid $5/month already in the stack; Email Routing inbound is unlimited.
const P = {
  haiku: { in: 0.10, out: 0.50, cacheRead: 0.01 },
  sonnet: { in: 2.0, out: 10.0, cacheRead: 0.20 },
  batch: 0.5,
  webSearch: 10 / 1000,
  sttPerMinute: 0.22 / 60,
  triggerRun: 0.000025,
  triggerSecond: 0.0000169,
  whatsappReply: 0.005,
};
const M = 1e6;
const call = (m, { cached = 0, fresh = 0, out = 0, batch = false }) =>
  (cached * P[m].cacheRead + fresh * P[m].in + out * P[m].out) / M * (batch ? P.batch : 1);

// Tokens per unit of work: [model, input (cached + fresh), output]
const TOK = {
  arrivalRead: ["haiku", 1600, 150], photoDescribe: ["haiku", 1900, 200], pdfSummary: ["haiku", 8800, 300],
  voiceMinute: ["haiku", 600, 200], findsRun: ["haiku", 18500, 1600], findsWebRun: ["sonnet", 26000, 1500],
  tidyRun: ["haiku", 3900, 540], reviewRun: ["haiku", 3000, 600], lociTurn: ["sonnet", 6000, 300],
};
// One unit of each kind of work, with its token shape (estimates; replace with ledger medians after 100 runs).
const UNIT = {
  arrivalPlain: 0, // matched by plain rules: no model
  arrivalRead: call("haiku", { cached: 1200, fresh: 400, out: 150 }), // what is it, which topic, a title
  photoDescribe: call("haiku", { fresh: 1600 + 300, out: 200 }), // one image (~1,600 tokens) + prompt
  pdfSummary: call("haiku", { cached: 800, fresh: 8000, out: 300 }), // text pulled from about 10 pages
  voiceMinute: P.sttPerMinute + call("haiku", { fresh: 600, out: 200 }), // transcribe, then questions out
  findsRun: call("haiku", { fresh: 2000 + 30 * 250 + 6 * 1500, out: 1600, batch: true }), // rank 30, sum up 6 with page text
  findsWebRun: 3 * P.webSearch + call("sonnet", { fresh: 3 * 8000 + 2000, out: 1500, batch: false }), // open-web discovery, 3 searches
  tidyRun: call("haiku", { cached: 1200, fresh: 9 * 300, out: 9 * 60, batch: true }),
  reviewRun: call("haiku", { fresh: 3000, out: 600, batch: true }),
  lociTurn: call("sonnet", { cached: 4000, fresh: 2000, out: 300 }), // making, changing or asking about a routine
  infraRun: P.triggerRun + 4 * P.triggerSecond, // one task run, about 4 s of compute
};

const PROFILES = {
  light: { arrivals: 20, readShare: 0.5, photos: 5, pdfs: 2, voiceMin: 0, finds: 4, findsWeb: 0, tidy: 4, review: 4, lociTurns: 8, whatsappReplies: 0 },
  typical: { arrivals: 120, readShare: 0.5, photos: 30, pdfs: 10, voiceMin: 20, finds: 30, findsWeb: 0, tidy: 30, review: 4, lociTurns: 25, whatsappReplies: 0 },
  heavy: { arrivals: 400, readShare: 0.6, photos: 100, pdfs: 30, voiceMin: 60, finds: 90, findsWeb: 4, tidy: 30, review: 8, lociTurns: 60, whatsappReplies: 200 },
};

function month(p) {
  const ai = {
    "Reading what arrives": p.arrivals * p.readShare * UNIT.arrivalRead,
    "Describing photos": p.photos * UNIT.photoDescribe,
    "Summing up PDFs": p.pdfs * UNIT.pdfSummary,
    "Voice notes (speech-to-text + questions)": p.voiceMin * UNIT.voiceMinute,
    "Finds from chosen sources": p.finds * UNIT.findsRun,
    "Finds from the open web": p.findsWeb * UNIT.findsWebRun,
    "Sort Unsorted": p.tidy * UNIT.tidyRun,
    "Review questions": p.review * UNIT.reviewRun,
    "Talking to Loci about routines": p.lociTurns * UNIT.lociTurn,
  };
  const runs = p.arrivals + p.finds + p.findsWeb + p.tidy + p.review;
  const other = {
    "Trigger.dev runs": runs * UNIT.infraRun,
    "WhatsApp replies": p.whatsappReplies * P.whatsappReply,
  };
  const total = [...Object.values(ai), ...Object.values(other)].reduce((a, b) => a + b, 0);
  const n = { arrivalRead: p.arrivals * p.readShare, photoDescribe: p.photos, pdfSummary: p.pdfs, voiceMinute: p.voiceMin, findsRun: p.finds, findsWebRun: p.findsWeb, tidyRun: p.tidy, reviewRun: p.review, lociTurn: p.lociTurns };
  const tokens = { haiku: [0, 0], sonnet: [0, 0] };
  for (const [k, c] of Object.entries(n)) { const [m, i, o] = TOK[k]; tokens[m][0] += c * i; tokens[m][1] += c * o; }
  return { ai, other, runs, total, tokens };
}

const f = (x) => (x < 0.01 ? x.toFixed(4) : x.toFixed(2));
console.log("Unit costs (USD):");
for (const [k, v] of Object.entries(UNIT)) console.log(`  ${k.padEnd(14)} ${f(v)}`);
const out = {};
for (const [name, p] of Object.entries(PROFILES)) {
  const m = month(p);
  out[name] = m;
  console.log(`\n${name.toUpperCase()}  (${m.runs} runs a month)`);
  for (const [k, v] of Object.entries({ ...m.ai, ...m.other })) if (v) console.log(`  ${k.padEnd(42)} $${f(v)}`);
  console.log(`  ${"TOTAL".padEnd(42)} $${f(m.total)}`);
  const k = (x) => `${Math.round(x / 1000)}k`;
  console.log(`  tokens: Haiku ${k(m.tokens.haiku[0])} in, ${k(m.tokens.haiku[1])} out · Sonnet ${k(m.tokens.sonnet[0])} in, ${k(m.tokens.sonnet[1])} out`);
}
// For 1,000 users at the typical profile, the fixed share: Workers Paid ($5) + the every-minute dispatcher, both already paid.
// 1,000 learners at the typical profile
const t = month(PROFILES.typical);
console.log(`\n1,000 typical learners: about $${Math.round(t.total * 1000)} a month in total (AI, speech-to-text, Trigger.dev runs).`);
console.log("If Finds ranked with Sonnet 5.5 instead of Haiku 5.5 (batch):", "$" + f(call("sonnet", { fresh: 18500, out: 1600, batch: true }) * 30), "a month for one daily Finds routine");
console.log("If routine chats ran on Haiku 5.5 instead of Sonnet 5.5:", "$" + f(call("haiku", { cached: 4000, fresh: 2000, out: 300 }) * 25), "a month (typical)");
export { P, UNIT, PROFILES, month };
