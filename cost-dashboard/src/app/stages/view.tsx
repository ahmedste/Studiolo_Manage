"use client";

import { useState } from "react";
import { CHARS_PER_EXPLAINER, CLAUDE, LEVELS, stages, VOICE_RATE, type Level, type VoiceModel } from "@/lib/stages";

const COLORS: Record<string, string> = {
  Vercel: "var(--series-1)",
  Neon: "var(--series-2)",
  Cloudflare: "var(--series-3)",
  "Trigger.dev": "var(--series-4)",
  Loops: "var(--series-5)",
  ElevenLabs: "var(--series-6)",
  Anthropic: "var(--series-7)",
};

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export function StagesView() {
  const [level, setLevel] = useState<Level>("typical");
  const [model, setModel] = useState<VoiceModel>("v4");
  const data = stages(level, model);
  const names = data[0].lines.map((l) => l.name);
  const voice = (CHARS_PER_EXPLAINER / 1000) * VOICE_RATE[model];

  return (
    <>
      <section className="card" aria-label="Assumptions" style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 24 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <strong>Usage per user</strong>
          <div className="seg" role="group" aria-label="Usage per user">
            {(Object.keys(LEVELS) as Level[]).map((k) => (
              <button key={k} type="button" aria-pressed={k === level} onClick={() => setLevel(k)}>
                {LEVELS[k].label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <strong>Voice model</strong>
          <div className="seg" role="group" aria-label="Voice model">
            {(["v4", "turbo"] as VoiceModel[]).map((k) => (
              <button key={k} type="button" aria-pressed={k === model} onClick={() => setModel(k)}>
                {k === "v4" ? "Eleven v4 · $0.08/1K" : "v4 Turbo · $0.04/1K"}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="kpis" aria-label="Stages">
        {data.map((s) => {
          const top = [...s.lines].sort((a, b) => b.cost - a.cost)[0];
          return (
            <div key={s.name} className="card kpi">
              <span className="muted small" style={{ fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.name}</span>
              <span style={{ fontSize: 18, fontWeight: 600 }}>{s.users} users</span>
              <span className="value">
                {usd(s.total)}
                <span className="muted" style={{ fontSize: 16 }}> /month</span>
              </span>
              <span className="muted">
                ${(s.total / s.users).toFixed(2)} per user · biggest: {top.name} {Math.round((top.cost / s.total) * 100)}%
              </span>
            </div>
          );
        })}
      </section>

      <section className="row">
        <div className="card grow">
          <h2>Monthly bill by service</h2>
          <div className="table-scroll">
            <table style={{ minWidth: 720 }}>
              <thead>
                <tr>
                  <th>Service</th>
                  {data.map((s) => (
                    <th key={s.name}>{s.name} · {s.users} users</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {names.map((name, row) => (
                  <tr key={name}>
                    <td style={{ fontWeight: 500 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="swatch" style={{ background: COLORS[name] }} />
                        {name}
                      </span>
                    </td>
                    {data.map((s) => (
                      <td key={s.name}>
                        <div style={{ fontFamily: "var(--mono)", fontWeight: 500 }}>{usd(s.lines[row].cost)}</div>
                        <div className="muted" style={{ fontSize: 12 }}>{s.lines[row].plan}</div>
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="total">
                  <td>Total</td>
                  {data.map((s) => (
                    <td key={s.name} style={{ fontFamily: "var(--mono)" }}>{usd(s.total)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <aside className="card side">
          <h2>Where each user&apos;s dollar goes</h2>
          {data.map((s) => (
            <div key={s.name} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }} className="small">
                <span>{s.users} users</span>
                <span style={{ fontFamily: "var(--mono)" }}>${(s.total / s.users).toFixed(2)}</span>
              </div>
              <div className="stack" title={s.lines.map((l) => `${l.name} $${(l.cost / s.users).toFixed(2)}`).join(" · ")}>
                {s.lines
                  .filter((l) => l.cost > 0)
                  .map((l) => (
                    <span key={l.name} style={{ flex: `${l.cost} 1 0`, background: COLORS[l.name] }} />
                  ))}
              </div>
            </div>
          ))}
          <div role="list" aria-label="Legend" style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 12 }} className="muted">
            {names.map((n) => (
              <span role="listitem" key={n} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="swatch" style={{ background: COLORS[n] }} />
                {n}
              </span>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--rule)", paddingTop: 12 }}>
            <strong>One explainer ≈ ${(voice + CLAUDE.explainer + 0.006).toFixed(2)}</strong>
            <div className="muted small">
              Narration ${voice.toFixed(2)} · Claude ≈ ${CLAUDE.explainer.toFixed(2)} average · Trigger.dev $0.006 · storage ≈ $0
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
