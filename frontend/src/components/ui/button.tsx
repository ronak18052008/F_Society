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
      "bg-gradient-to-r from-[#7ca982] to-[#68996e] text-white shadow-md shadow-[#7ca982]/25 hover:from-[#6b9a71] hover:to-[#57875d] hover:shadow-lg hover:shadow-[#7ca982]/30 active:scale-[0.98] font-medium",
    secondary:
      "bg-[#f4efe6] text-[#1d3122] hover:bg-[#eae3d6] border border-[#e5dfc5] dark:bg-[#1d2d22] dark:text-[#f5f9f6] dark:border-[#2a3f31] dark:hover:bg-[#24362a] active:scale-[0.98]",
    line:
      "border border-[#d9d2be] bg-white/90 backdrop-blur-md text-[#1d3122] hover:border-[#7ca982] hover:bg-[#faf7f0] hover:text-[#57875d] dark:border-[#2a3f31] dark:bg-[#152219]/80 dark:text-[#f5f9f6] dark:hover:border-[#8fb893] active:scale-[0.98]",
    outline:
      "border border-[#d9d2be] bg-white/90 backdrop-blur-md text-[#1d3122] hover:border-[#7ca982] hover:bg-[#faf7f0] hover:text-[#57875d] dark:border-[#2a3f31] dark:bg-[#152219]/80 dark:text-[#f5f9f6] dark:hover:border-[#8fb893] active:scale-[0.98]",
    ghost:
      "bg-transparent text-[#4e6853] hover:bg-[#f4efe6] hover:text-[#1d3122] dark:text-[#a5b8aa] dark:hover:bg-[#1d2d22] dark:hover:text-[#f5f9f6]",
    danger:
      "bg-[#c24b4b] text-white shadow-md shadow-[#c24b4b]/20 hover:bg-[#af3f3f] hover:shadow-lg active:scale-[0.98]",
  }[variant];

  const styles = cn(
    "inline-flex items-center justify-center gap-2 font-sans select-none rounded-full cursor-pointer",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ca982] focus-visible:ring-offset-2",
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
