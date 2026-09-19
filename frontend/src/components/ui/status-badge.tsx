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
        tone === "neutral" && "bg-[var(--secondary-sage)]/15 text-[var(--text-muted)] border border-[var(--secondary-sage)]/30",
        tone === "ok" && "bg-[var(--success)]/15 text-[var(--success)] border border-[var(--success)]/25",
        tone === "warn" && "bg-[var(--warning)]/15 text-[var(--warning)] border border-[var(--warning)]/25",
        tone === "danger" && "bg-[var(--error)]/15 text-[var(--error)] border border-[var(--error)]/25",
        tone === "demo" && "bg-[var(--primary-pista)]/15 text-[var(--text-main)] border border-[var(--primary-pista)]/30",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "neutral" && "bg-[var(--secondary-sage)]",
          tone === "ok" && "bg-[var(--success)] shadow-[0_0_8px_var(--success)]",
          tone === "warn" && "bg-[var(--warning)] shadow-[0_0_8px_var(--warning)]",
          tone === "danger" && "bg-[var(--error)] shadow-[0_0_8px_var(--error)]",
          tone === "demo" && "bg-[var(--primary-pista)] shadow-[0_0_8px_var(--primary-pista)]",
        )}
      />
      {children}
    </span>
  );
}
