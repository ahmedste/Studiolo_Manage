import Link from "next/link";
import { buildReport } from "@/lib/report";
import { Shell, SOURCE_LABEL, usd } from "./shell";
import { StatusBadge } from "./status";

export const revalidate = 3600;

export default async function Overview() {
  const r = await buildReport();
  const month = r.period.start.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const pct = Math.round(r.period.elapsed * 100);
  const attention = r.vendors.filter((v) => v.status !== "ok");
  const ranked = [...r.vendors].sort((a, b) => b.projected - a.projected);
  const maxShare = Math.max(...r.vendors.map((v) => v.projected), 0.01);

  return (
    <Shell active="overview" generatedAt={r.generatedAt}>
      <section className="kpis" aria-label="Headline numbers">
        <div className="card kpi">
          <span className="muted small">Spent so far · {month}</span>
          <span className="value">{usd(r.spent)}</span>
          <span className="muted small">{pct}% of the month elapsed</span>
        </div>
        <div className="card kpi">
          <span className="muted small">Projected {month.split(" ")[0]} bill</span>
          <span className="value">{usd(r.projected, 0)}</span>
          <span className="muted small">Plan fees + usage at the current pace</span>
        </div>
        <div className="card kpi">
          <span className="muted small">Cost per active user</span>
          <span className="value">{r.activeUsers ? usd(r.projected / r.activeUsers) : "—"}</span>
          <span className="muted small">{r.activeUsers ? `${r.activeUsers.toLocaleString("en-US")} active users` : "Set ACTIVE_USERS to see this"}</span>
        </div>
        <div className="card kpi dashed">
          <span className="muted small">Revenue &amp; margin</span>
          <span className="value muted">—</span>
          <span className="muted small">Arrives when Stripe is connected</span>
        </div>
      </section>

      <section className="row">
        <div className="card grow">
          <h2>Every service, this month</h2>
          <div className="table-scroll">
            <table style={{ minWidth: 860 }}>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Plan</th>
                  <th className="num">Spent so far</th>
                  <th className="num">Projected</th>
                  <th className="num">Per user</th>
                  <th style={{ width: 160 }}>Share of bill</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <Link href={`/vendor/${v.id}`} style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500, textDecoration: "none" }}>
                        <span className="swatch" style={{ background: v.color }} />
                        {v.name}
                      </Link>
                    </td>
                    <td className="muted">{v.plan}</td>
                    <td className="num">{usd(v.spent)}</td>
                    <td className="num" style={{ fontWeight: 500 }}>{usd(v.projected)}</td>
                    <td className="num">{r.activeUsers ? usd(v.projected / r.activeUsers, 3) : "—"}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="bar">
                          <span style={{ width: `${Math.max(0, (v.projected / maxShare) * 100)}%`, background: v.color }} />
                        </div>
                        <span className="num small muted" style={{ width: 36 }}>
                          {r.projected > 0 ? `${Math.round((v.projected / r.projected) * 100)}%` : "—"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={v.status} />
                      <div className="muted small">{SOURCE_LABEL[v.source]}</div>
                    </td>
                  </tr>
                ))}
                <tr className="total">
                  <td>Total</td>
                  <td />
                  <td className="num">{usd(r.spent)}</td>
                  <td className="num">{usd(r.projected)}</td>
                  <td className="num">{r.activeUsers ? usd(r.projected / r.activeUsers) : "—"}</td>
                  <td />
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <aside className="card side">
          <h2>Needs attention</h2>
          {attention.length === 0 ? (
            <p className="muted small" style={{ margin: 0 }}>All services connected.</p>
          ) : (
            attention.map((v) => (
              <div key={v.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <Link href={`/vendor/${v.id}`} style={{ fontWeight: 600 }}>{v.name}</Link>
                  <StatusBadge status={v.status} />
                </span>
                <span className="muted small">{v.notes?.[0]}</span>
              </div>
            ))
          )}
          <p className="muted small" style={{ margin: 0, borderTop: "1px solid var(--rule)", paddingTop: 12 }}>
            Month-over-month history starts once daily snapshots are stored (next step). <Link href="/stages">See growth stages →</Link>
          </p>
        </aside>
      </section>
    </Shell>
  );
}
