"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

export interface NivasaLogoProps {
  variant?: "full" | "horizontal" | "mark" | "image";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  href?: string;
  className?: string;
  showTagline?: boolean;
}

/**
 * High-fidelity Vector SVG Mark representing the official Nivasa house roof,
 * window panes, and dual-tone ribbon "N".
 */
export function NivasaIconMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-xs", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="nivasa-stem-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1C2E3D" />
          <stop offset="100%" stopColor="#14212C" />
        </linearGradient>
        <linearGradient id="nivasa-ribbon-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1E392B" />
          <stop offset="50%" stopColor="#3F6B4E" />
          <stop offset="100%" stopColor="#7CA982" />
        </linearGradient>
      </defs>

      {/* Chimney */}
      <path d="M72 32V24H82V42L72 32Z" fill="#1C2E3D" />

      {/* Roof Gable */}
      <path
        d="M60 14L22 44L28 50L60 25L92 50L98 44L60 14Z"
        fill="#1C2E3D"
      />

      {/* Four Window Panes in warm terracotta/tan */}
      <rect x="52" y="36" width="7" height="7" rx="1.5" fill="#C9A37A" />
      <rect x="61" y="36" width="7" height="7" rx="1.5" fill="#C9A37A" />
      <rect x="52" y="45" width="7" height="7" rx="1.5" fill="#C9A37A" />
      <rect x="61" y="45" width="7" height="7" rx="1.5" fill="#C9A37A" />

      {/* Left Vertical Stem of N (Navy) */}
      <path
        d="M33 46C30.8 46 29 47.8 29 50V90C29 97 34.5 101 40 96L44 92V50C44 47.8 42.2 46 40 46H33Z"
        fill="url(#nivasa-stem-gradient)"
      />

      {/* Ribbon Diagonal & Right Leg of N (Sage / Pista gradient) */}
      <path
        d="M39 52L72 87C74.5 89.5 78 91 82 91C84.8 91 87 88.8 87 86V44L74 38V80L45 48C42.5 45.5 38 46.5 39 52Z"
        fill="url(#nivasa-ribbon-gradient)"
      />
    </svg>
  );
}

export function NivasaLogo({
  variant = "horizontal",
  size = "md",
  href,
  className,
  showTagline = true,
}: NivasaLogoProps) {
  // Dimensions per size
  const markDimensions = {
    xs: 24,
    sm: 30,
    md: 36,
    lg: 48,
    xl: 68,
  }[size];

  const textSizes = {
    xs: "text-base tracking-tight",
    sm: "text-lg tracking-tight",
    md: "text-xl tracking-tight",
    lg: "text-2xl sm:text-3xl tracking-tight",
    xl: "text-3xl sm:text-4xl tracking-tight",
  }[size];

  const content = (
    <div
      className={cn(
        "inline-flex items-center transition-all duration-200 select-none",
        variant === "full" ? "flex-col items-center text-center gap-2" : "gap-3",
        className
      )}
    >
      {/* Logo Mark: Vector or Image */}
      {variant === "image" ? (
        <div className="relative overflow-hidden rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] shadow-xs">
          <Image
            src="/brand/nivasa-logo.jpg"
            alt="Nivasa Logo"
            width={markDimensions * 2}
            height={markDimensions * 2}
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <NivasaIconMark size={markDimensions} />
      )}

      {/* Wordmark and Tagline */}
      {variant !== "mark" && (
        <div className={cn("flex flex-col", variant === "full" && "items-center")}>
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                "font-sans font-extrabold text-[#192734] dark:text-[#f5f9f6]",
                textSizes
              )}
            >
              Nivasã
            </span>
          </div>

          {(variant === "full" || showTagline) && (
            <span
              className={cn(
                "font-sans text-ink-muted leading-tight",
                size === "xs" || size === "sm" ? "text-[10px]" : "text-xs",
                variant === "full" && "mt-0.5 text-xs text-[#5b6c7a] dark:text-[#a5b8aa]"
              )}
            >
              Rent with clarity. Live with confidence.
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ca982] rounded-2xl"
        aria-label="Nivasa Homepage"
      >
        {content}
      </Link>
    );
  }

  return content;
}
