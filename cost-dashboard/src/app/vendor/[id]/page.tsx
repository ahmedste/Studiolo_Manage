import { notFound } from "next/navigation";
import { buildReport } from "@/lib/report";
import { VENDORS } from "@/lib/vendors";
import { Shell, SOURCE_LABEL, usd } from "../../shell";
import { StatusBadge } from "../../status";

export const revalidate = 3600;

export function generateStaticParams() {
  return VENDORS.map((v) => ({ id: v.id }));
}

export default async function VendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await buildReport();
  const v = r.vendors.find((x) => x.id === id);
  if (!v) notFound();
  const share = r.projected > 0 ? Math.round((v.projected / r.projected) * 100) : 0;

  return (
    <Shell active={v.id} generatedAt={r.generatedAt}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <h1 style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="swatch" style={{ background: v.color, width: 14, height: 14 }} />
          {v.name}
        </h1>
        <span className="muted">{v.plan}</span>
      </div>

      <section className="kpis" aria-label={`${v.name} headline numbers`}>
        <div className="card kpi">
          <span className="muted small">Spent so far</span>
          <span className="value">{usd(v.spent)}</span>
        </div>
        <div className="card kpi">
          <span className="muted small">Projected month-end</span>
          <span className="value">{usd(v.projected)}</span>
          <span className="muted small">{share}% of the total bill</span>
        </div>
        <div className="card kpi">
          <span className="muted small">Per active user</span>
          <span className="value">{r.activeUsers ? usd(v.projected / r.activeUsers, 3) : "—"}</span>
        </div>
        <div className="card kpi">
          <span className="muted small">Data source</span>
          <StatusBadge status={v.status} />
          <span className="muted small">{SOURCE_LABEL[v.source]}</span>
        </div>
      </section>

      <section className="card">
        <h2>Line items</h2>
        {v.lineItems.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>No data yet.</p>
        ) : (
          <div className="table-scroll">
            <table style={{ minWidth: 560 }}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Usage</th>
                  <th className="num">Spent so far</th>
                  <th className="num">Projected</th>
                </tr>
              </thead>
              <tbody>
                {v.lineItems.map((i) => (
                  <tr key={i.label}>
                    <td>{i.label}</td>
                    <td className="muted">{i.quantity ?? "—"}</td>
                    <td className="num">{usd(i.spent)}</td>
                    <td className="num" style={{ fontWeight: 500 }}>{usd(i.projected)}</td>
                  </tr>
                ))}
                <tr className="total">
                  <td>Total</td>
                  <td />
                  <td className="num">{usd(v.spent)}</td>
                  <td className="num">{usd(v.projected)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {v.notes && v.notes.length > 0 && (
          <ul className="notes">
            {v.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
      </section>
    </Shell>
  );
}
