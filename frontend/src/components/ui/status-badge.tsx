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
        "inline-flex items-center border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]",
        tone === "neutral" && "border-line text-ink-soft",
        tone === "ok" && "border-ok/40 text-ok",
        tone === "warn" && "border-bronze/50 text-bronze",
        tone === "danger" && "border-danger/40 text-danger",
        tone === "demo" && "border-line text-ink-soft",
      )}
    >
      {children}
    </span>
  );
}
