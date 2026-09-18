import { cn } from "@/lib/cn";

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "ok" | "warn" | "danger" | "demo";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-md transition-colors",
        tone === "neutral" && "bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20",
        tone === "ok" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
        tone === "warn" && "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
        tone === "danger" && "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20",
        tone === "demo" && "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "neutral" && "bg-slate-400",
          tone === "ok" && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
          tone === "warn" && "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
          tone === "danger" && "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]",
          tone === "demo" && "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]",
        )}
      />
      {children}
    </span>
  );
}
