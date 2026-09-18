import type { ActivityEvent } from "@/types";
import { formatDateTime } from "@/lib/format";

export function Timeline({ events }: { events: ActivityEvent[] }) {
  return (
    <ol className="space-y-6 border-l border-line pl-6">
      {events.map((event) => (
        <li key={event.id} className="relative">
          <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-bronze" />
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            {formatDateTime(event.at)}
          </p>
          <p className="mt-1 font-medium">{event.title}</p>
          <p className="text-sm text-ink-soft">{event.detail}</p>
        </li>
      ))}
    </ol>
  );
}
