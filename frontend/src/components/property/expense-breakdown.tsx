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
  title = "RentTruth breakdown",
}: {
  lines: ExpenseLine[];
  title?: string;
}) {
  const monthly = lines
    .filter((line) => line.cadence === "monthly")
    .reduce((sum, line) => sum + line.amount, 0);

  return (
    <section className="border border-line">
      <header className="border-b border-line px-5 py-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
          {title}
        </p>
        <p className="mt-2 font-serif text-4xl">{formatInr(monthly)}</p>
        <p className="text-sm text-ink-soft">Estimated monthly occupancy cost</p>
      </header>
      <ul>
        {lines.map((line) => (
          <li
            key={line.id}
            className="flex items-start justify-between gap-4 border-t border-line px-5 py-3 text-sm"
          >
            <div>
              <p>{line.label}</p>
              {line.note ? (
                <p className="mt-1 text-xs text-ink-soft">{line.note}</p>
              ) : null}
            </div>
            <div className="text-right">
              <p>{formatInr(line.amount)}</p>
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
