import type { ActivityEvent } from "@/types";
import { formatDateTime } from "@/lib/format";

export function Timeline({ events }: { events: ActivityEvent[] }) {
  return (
    <ol className="relative space-y-6 border-l-2 border-slate-200 dark:border-slate-800 ml-3 pl-6">
      {events.map((event) => (
        <li key={event.id} className="relative group">
          <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 bg-blue-600 shadow-sm shadow-blue-500/50" />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {formatDateTime(event.at)}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{event.title}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{event.detail}</p>
        </li>
      ))}
    </ol>
  );
}
