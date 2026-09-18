import Link from "next/link";
import { cn } from "@/lib/cn";

type Props = {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "line";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

export function Button({
  href,
  children,
  variant = "primary",
  className,
  type = "button",
  onClick,
  disabled,
}: Props) {
  const styles = cn(
    "inline-flex items-center justify-center gap-2 px-5 py-3 text-sm tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze disabled:opacity-40",
    variant === "primary" &&
      "bg-bronze text-[#1a1612] hover:bg-bronze-2",
    variant === "ghost" && "bg-transparent text-[var(--ink)] hover:bg-paper-2",
    variant === "line" && "border border-line bg-transparent text-[var(--ink)] hover:border-[var(--ink)]",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={styles} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
