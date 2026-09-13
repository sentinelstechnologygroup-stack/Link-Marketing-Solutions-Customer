import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { changeBadge } from "@/lib/portalUtils";

export default function StatCard({ label, value, suffix = "", change, lowerIsBetter = false, hint = "" }) {
  const badge = changeBadge(change, lowerIsBetter);
  return (
    <div className="portal-card p-4 sm:p-5 flex flex-col">
      <div className="eyebrow" style={{ color: "var(--muted-ink)" }}>{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-[26px] sm:text-[30px] font-semibold leading-none" style={{ color: "var(--shell)" }}>
          {value}{suffix}
        </span>
        {badge && (
          <span
            className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded"
            style={{
              color: badge.good ? "var(--success)" : "var(--danger)",
              background: badge.good ? "rgba(46,125,91,0.10)" : "rgba(180,69,47,0.10)",
            }}
          >
            {badge.up ? <ArrowUpRight className="w-3 h-3" /> : change === 0 ? <Minus className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {badge.label}
          </span>
        )}
      </div>
      {hint && <div className="mt-1.5 text-[12px]" style={{ color: "var(--muted-ink)" }}>{hint}</div>}
    </div>
  );
}