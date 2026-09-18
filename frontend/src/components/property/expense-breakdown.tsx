import type { ExpenseLine } from "@/types";
import { formatInr } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";

const tone = (source: ExpenseLine["source"]) => {
  if (source === "verified") return "ok" as const;
  if (source === "estimated") return "warn" as const;
  if (source === "uploaded-bill") return "ok" as const;
  return "neutral" as const;
};

export function ExpenseBreakdown({
  lines,
  title = "RentTruth Itemized Breakdown",
}: {
  lines: ExpenseLine[];
  title?: string;
}) {
  const monthly = lines
    .filter((line) => line.cadence === "monthly")
    .reduce((sum, line) => sum + line.amount, 0);

  return (
    <section className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 overflow-hidden shadow-sm">
      <header className="border-b border-slate-100 dark:border-slate-800 px-6 py-5 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {title}
          </p>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Audited
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <p className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {formatInr(monthly)}
          </p>
          <span className="text-sm font-medium text-slate-400">/ month total</span>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          All-inclusive estimated monthly occupancy footprint
        </p>
      </header>
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {lines.map((line) => (
          <li
            key={line.id}
            className="flex items-start justify-between gap-4 px-6 py-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
          >
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{line.label}</p>
              {line.note ? (
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{line.note}</p>
              ) : null}
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{formatInr(line.amount)}</p>
              <div className="mt-1">
                <StatusBadge tone={tone(line.source)}>{line.source}</StatusBadge>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
