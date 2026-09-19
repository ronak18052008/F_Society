import Link from "next/link";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "line" | "outline" | "ghost" | "danger";
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
    sm: "px-3.5 py-1.5 text-xs font-medium",
    md: "px-5 py-2.5 text-sm font-medium",
    lg: "px-6 py-3 text-base font-semibold",
  }[size];

  const variantStyles = {
    primary:
      "bg-[var(--accent-forest)] text-white shadow-md shadow-[var(--accent-forest)]/20 hover:bg-[var(--accent-forest-hover)] hover:shadow-lg hover:shadow-[var(--accent-forest)]/25 active:scale-[0.98] font-medium",
    secondary:
      "bg-[var(--bg-surface-elevated)] text-[var(--text-main)] hover:bg-[var(--border)] border border-[var(--border)] active:scale-[0.98]",
    line:
      "border border-[var(--border)] bg-[var(--bg-surface)]/90 backdrop-blur-md text-[var(--text-main)] hover:border-[var(--primary-pista)] hover:bg-[var(--bg-canvas)] hover:text-[var(--accent-forest)] active:scale-[0.98]",
    outline:
      "border border-[var(--border)] bg-[var(--bg-surface)]/90 backdrop-blur-md text-[var(--text-main)] hover:border-[var(--primary-pista)] hover:bg-[var(--bg-canvas)] hover:text-[var(--accent-forest)] active:scale-[0.98]",
    ghost:
      "bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-main)]",
    danger:
      "bg-[var(--error)] text-white shadow-md shadow-[var(--error)]/20 hover:brightness-110 hover:shadow-lg active:scale-[0.98]",
  }[variant];

  const styles = cn(
    "inline-flex items-center justify-center gap-2 font-sans select-none rounded-full cursor-pointer",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-pista)] focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-40",
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
