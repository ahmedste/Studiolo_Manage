import Link from "next/link";
import { VENDORS } from "@/lib/vendors";

/** Header + section tabs shared by every page. `active` is "overview", "stages" or a vendor id. */
export function Shell({ active, children, generatedAt }: { active: string; children: React.ReactNode; generatedAt?: string }) {
  const tabs = [
    { href: "/", key: "overview", label: "Overview" },
    ...VENDORS.map((v) => ({ href: `/vendor/${v.id}`, key: v.id, label: v.name, color: v.color })),
    { href: "/stages", key: "stages", label: "Growth stages" },
  ];
  return (
    <>
      <header className="top">
        <div className="wrap">
          <div className="brand">
            <span>
              <b>Studiolo</b> <span className="muted">Running costs</span>
            </span>
            {generatedAt && (
              <span className="muted small">
                Updated {new Date(generatedAt).toUTCString().replace(" GMT", " UTC")} · refreshes hourly
              </span>
            )}
          </div>
          <nav className="tabs" aria-label="Sections">
            {tabs.map((t) => (
              <Link key={t.key} href={t.href} aria-current={t.key === active ? "page" : undefined}>
                {"color" in t && <span className="swatch" style={{ background: t.color }} />}
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="wrap">{children}</main>
    </>
  );
}

export const usd = (n: number, digits = 2) =>
  (n < 0 ? "−$" : "$") + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const SOURCE_LABEL = {
  "live-cost": "Live cost from API",
  "usage-x-price": "Live usage × list price",
  fixed: "Fixed plan fee",
  sample: "Sample data",
} as const;
