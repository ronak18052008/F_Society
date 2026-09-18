import Link from "next/link";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "line" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type Props = {
  href?: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
};

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  type = "button",
  onClick,
  disabled,
  ariaLabel,
}: Props) {
  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs tracking-wider",
    md: "px-5 py-3 text-sm tracking-wide",
    lg: "px-7 py-3.5 text-base tracking-wide font-medium",
  }[size];

  const variantStyles = {
    primary:
      "bg-bronze text-[#14110e] hover:bg-bronze-2 hover:shadow-[var(--shadow)] active:bg-[#b09060]",
    secondary:
      "bg-paper-2 text-ink border border-line hover:border-ink/30 hover:bg-paper active:bg-paper-2",
    line:
      "border border-line bg-transparent text-ink hover:border-ink hover:bg-paper-2/60 active:bg-paper-2",
    ghost:
      "bg-transparent text-ink-soft hover:bg-paper-2 hover:text-ink active:bg-paper-2/80",
  }[variant];

  const styles = cn(
    "inline-flex items-center justify-center gap-2 font-sans select-none",
    "transition-[color,background-color,border-color,transform,box-shadow,opacity] duration-300",
    "ease-[cubic-bezier(0.22,1,0.36,1)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
    "disabled:pointer-events-none disabled:opacity-40",
    "active:scale-[0.985]",
    sizeStyles,
    variantStyles,
    fullWidth && "w-full",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={styles} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={styles}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
