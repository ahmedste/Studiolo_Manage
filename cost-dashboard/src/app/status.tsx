import type { Status } from "@/lib/types";

const TEXT: Record<Status, string> = { ok: "Connected", "not-configured": "Needs API key", error: "Error" };
const CLASS: Record<Status, string> = { ok: "ok", "not-configured": "warn", error: "bad" };

/** Status always ships with an icon and a label, never color alone. */
export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`status ${CLASS[status]}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        {status === "ok" ? <path d="M20 6 9 17l-5-5" /> : status === "error" ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M12 8v5M12 16.5v.5" />}
      </svg>
      {TEXT[status]}
    </span>
  );
}
