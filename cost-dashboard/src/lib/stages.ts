/**
 * The growth-stage cost model from the mockup: what Studiolo costs at 20 / 100 / 500 users.
 * Usage per action is measured from Studiolo's own runs (docs/superpowers/evidence in the app repo);
 * prices are the vendors' October 2026 list prices.
 */
export type Level = "light" | "typical" | "heavy";
export type VoiceModel = "v4" | "turbo";

export const LEVELS: Record<Level, { label: string; explainers: number; chats: number; readings: number }> = {
  light: { label: "Light · 8 explainers", explainers: 8, chats: 3, readings: 0 },
  typical: { label: "Typical · 20 explainers", explainers: 20, chats: 6, readings: 10 },
  heavy: { label: "Heavy · 40 explainers", explainers: 40, chats: 10, readings: 10 },
};

export const VOICE_RATE: Record<VoiceModel, number> = { v4: 0.08, turbo: 0.04 };

export const STAGE_USERS = [20, 100, 500] as const;
export const STAGE_NAMES = ["Pre-MVP", "Early", "MVP"] as const;

/** Narration characters billed per explainer: measured median 1,890–2,270 + ~10% retries. */
export const CHARS_PER_EXPLAINER = 2150;
/** Claude cost per explainer (25% built from PDFs, incl. repairs), per co-pilot chat, per course reading. */
export const CLAUDE = { explainer: 0.165, chat: 0.15, reading: 0.05 };
export const ANTHROPIC_CREDITS = 300;
/** Trigger.dev: fixed schedules (~$4.80/mo) + ~$0.0056 per explainer. */
export const TRIGGER = { fixedUsage: 4.8, perExplainer: 0.0056 };

export interface StageLine {
  name: string;
  cost: number;
  plan: string;
}

export interface Stage {
  name: string;
  users: number;
  lines: StageLine[];
  total: number;
}

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export function stageLines(users: number, index: number, level: Level, model: VoiceModel): StageLine[] {
  const L = LEVELS[level];
  const pick = <T,>(values: readonly T[]) => values[index];
  const triggerUse = TRIGGER.fixedUsage + users * L.explainers * TRIGGER.perExplainer;
  const chars = users * L.explainers * CHARS_PER_EXPLAINER;
  const claudeUse = users * (L.explainers * CLAUDE.explainer + L.chats * CLAUDE.chat + L.readings * CLAUDE.reading);
  return [
    { name: "Vercel", cost: pick([0, 20, 40]), plan: pick(["Hobby (free) · friends beta", "Pro · from first paying user", "Pro + small overage"]) },
    { name: "Neon", cost: pick([20, 25, 50]), plan: pick(["Launch · DB awake 24/7", "Launch", "Launch · scales at peaks"]) },
    { name: "Cloudflare", cost: pick([5, 6, 16]), plan: pick(["Workers $5 · R2 $0 · Images $0", "Workers $5 · R2 $1 · Images $0", "Workers $5 · R2 $5 · Images ~$6"]) },
    triggerUse <= 10
      ? { name: "Trigger.dev", cost: 10, plan: "Hobby ($10 incl. $10 usage)" }
      : triggerUse <= 50
        ? { name: "Trigger.dev", cost: triggerUse, plan: `Hobby + ${usd(triggerUse - 10)} usage` }
        : { name: "Trigger.dev", cost: triggerUse, plan: "Pro ($50 incl. $50 usage)" },
    { name: "Loops", cost: pick([0, 0, 49]), plan: pick(["Free", "Free", "Paid · >1,000 contacts"]) },
    { name: "ElevenLabs", cost: (chars / 1000) * VOICE_RATE[model], plan: `${(chars / 1e6).toFixed(2)}M characters · pay as you go` },
    {
      name: "Anthropic",
      cost: Math.max(0, claudeUse - ANTHROPIC_CREDITS),
      plan: claudeUse <= ANTHROPIC_CREDITS ? `${usd(claudeUse)} used · covered by credits` : `${usd(claudeUse)} used − $300 credits`,
    },
  ];
}

export function stages(level: Level, model: VoiceModel): Stage[] {
  return STAGE_USERS.map((users, i) => {
    const lines = stageLines(users, i, level, model);
    return { name: STAGE_NAMES[i], users, lines, total: lines.reduce((a, l) => a + l.cost, 0) };
  });
}
