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
        tone === "neutral" && "bg-[#8fa89b]/15 text-[#3e5244] dark:text-[#a5b8aa] border border-[#8fa89b]/30",
        tone === "ok" && "bg-[#3d8c57]/15 text-[#245e37] dark:text-[#6ee7b7] border border-[#3d8c57]/25",
        tone === "warn" && "bg-[#d9822b]/15 text-[#9a5410] dark:text-[#fcd34d] border border-[#d9822b]/25",
        tone === "danger" && "bg-[#c24b4b]/15 text-[#942f2f] dark:text-[#fca5a5] border border-[#c24b4b]/25",
        tone === "demo" && "bg-[#6e9271]/15 text-[#284431] dark:text-[#a3caa6] border border-[#6e9271]/30",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "neutral" && "bg-[#8fa89b]",
          tone === "ok" && "bg-[#3d8c57] shadow-[0_0_8px_rgba(61,140,87,0.6)]",
          tone === "warn" && "bg-[#d9822b] shadow-[0_0_8px_rgba(217,130,43,0.6)]",
          tone === "danger" && "bg-[#c24b4b] shadow-[0_0_8px_rgba(194,75,75,0.6)]",
          tone === "demo" && "bg-[#6e9271] shadow-[0_0_8px_rgba(110,146,113,0.6)]",
        )}
      />
      {children}
    </span>
  );
}
