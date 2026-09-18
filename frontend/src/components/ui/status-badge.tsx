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
        tone === "neutral" && "bg-[#96bd9b]/15 text-[#3d5a44] dark:text-[#a5b8aa] border border-[#96bd9b]/30",
        tone === "ok" && "bg-[#4e9b5f]/15 text-[#245e37] dark:text-[#6ee7b7] border border-[#4e9b5f]/25",
        tone === "warn" && "bg-[#d9822b]/15 text-[#9a5410] dark:text-[#fcd34d] border border-[#d9822b]/25",
        tone === "danger" && "bg-[#c24b4b]/15 text-[#942f2f] dark:text-[#fca5a5] border border-[#c24b4b]/25",
        tone === "demo" && "bg-[#7ca982]/15 text-[#1d3122] dark:text-[#a3caa6] border border-[#7ca982]/30",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "neutral" && "bg-[#96bd9b]",
          tone === "ok" && "bg-[#4e9b5f] shadow-[0_0_8px_rgba(78,155,95,0.6)]",
          tone === "warn" && "bg-[#d9822b] shadow-[0_0_8px_rgba(217,130,43,0.6)]",
          tone === "danger" && "bg-[#c24b4b] shadow-[0_0_8px_rgba(194,75,75,0.6)]",
          tone === "demo" && "bg-[#7ca982] shadow-[0_0_8px_rgba(124,169,130,0.6)]",
        )}
      />
      {children}
    </span>
  );
}
