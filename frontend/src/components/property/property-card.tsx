"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Property } from "@/types";
import { formatInr } from "@/lib/format";
import { monthlyEstimate } from "@/data/demo";
import { StatusBadge } from "@/components/ui/status-badge";
import { useNivasa } from "@/store/nivasa-store";
import { cn } from "@/lib/cn";

export function PropertyCard({ property }: { property: Property }) {
  const { savedIds, toggleSave } = useNivasa();
  const saved = savedIds.includes(property.id);

  // Link seamlessly to dedicated /property/:id route
  const detailHref = `/property/${property.id}`;

  const isDataset =
    property.sourceType === "DATASET" ||
    (property.dataSource && property.dataSource.includes("Housing"));

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col rounded-3xl border border-line bg-card overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-[#6E9271]/50"
    >
      {/* Visual Image Banner with Floating Pills */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-paper">
        <Link href={detailHref} className="block h-full w-full">
          <Image
            src={property.images[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        </Link>

        {/* Top Left: Provenance & Verification Badges */}
        <div className="absolute left-3.5 top-3.5 z-10 flex flex-col gap-1.5 items-start">
          {isDataset ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#284431]/90 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-[#D8E6D3] border border-[#6E9271]/40 shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6E9271] animate-pulse" />
              Dataset 2025–2026
            </span>
          ) : (
            <StatusBadge
              tone={
                property.verification === "identity-checked"
                  ? "ok"
                  : property.verification === "documents-pending"
                    ? "warn"
                    : "neutral"
              }
            >
              {property.verification === "identity-checked" ? "Verified F_Society" : property.verification.replace("-", " ")}
            </StatusBadge>
          )}
        </div>

        {/* Top Right: Magnetic Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleSave(property.id);
          }}
          aria-label={saved ? "Remove from saved" : "Save property"}
          aria-pressed={saved}
          className="absolute right-3.5 top-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 dark:bg-[#1A281F]/90 backdrop-blur-md text-ink-muted shadow-sm transition-all hover:scale-110 active:scale-95 cursor-pointer border border-line/60"
        >
          <svg
            className={cn(
              "h-4 w-4 transition-colors",
              saved ? "fill-rose-500 text-rose-500" : "fill-none text-ink-muted",
            )}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Bottom Image Gradient Overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Locality & City Chip on image bottom-left */}
        <div className="absolute bottom-3 left-3.5 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            <svg className="h-3 w-3 text-[#A3B899]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="truncate max-w-[200px]">{property.locality}, {property.city}</span>
          </span>
        </div>
      </div>

      {/* Property Details Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <Link href={detailHref} className="group/title block">
            <h3 className="font-serif text-lg font-bold tracking-tight text-ink transition-colors group-hover/title:text-[#284431] dark:group-hover/title:text-[#A3B899] line-clamp-1">
              {property.title}
            </h3>
          </Link>

          {/* Specification Pills */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
            <span className="rounded-lg bg-paper border border-line/60 px-2.5 py-1 font-semibold text-ink">
              {property.bhk || property.bedrooms} BHK
            </span>
            <span className="rounded-lg bg-paper border border-line/60 px-2.5 py-1 font-medium font-tabular text-ink">
              {property.sizeSqft || property.areaSqft} sqft
            </span>
            <span className="rounded-lg bg-paper border border-line/60 px-2.5 py-1 font-medium text-ink">
              {property.bathrooms || property.bathroom || 1} Bath
            </span>
            <span className="rounded-lg bg-paper border border-line/60 px-2.5 py-1 font-medium capitalize text-ink">
              {property.furnishingStatus || property.furnishing}
            </span>
            {property.tenantPreferred && (
              <span className="rounded-lg bg-[#6E9271]/10 border border-[#6E9271]/20 px-2 py-0.5 text-[11px] font-medium text-[#284431] dark:text-[#A3B899]">
                {property.tenantPreferred}
              </span>
            )}
          </div>

          {/* Floor & Contact Info */}
          {(property.floor || property.displayPostedOn) && (
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-ink-muted">
              {property.floor && (
                <span className="truncate max-w-[160px]">
                  Floor: {property.floor}
                </span>
              )}
              {property.displayPostedOn && (
                <span className="font-tabular ml-auto">
                  Available: {property.displayPostedOn}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing & RentTruth Transparency */}
        <div className="mt-5 border-t border-line/60 pt-4 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-2xl font-bold tracking-tight text-ink font-tabular">
                {formatInr(property.rent)}
              </span>
              <span className="text-xs text-ink-muted font-medium">/ month</span>
            </div>
            <p className="mt-0.5 text-[11px] text-[#284431] dark:text-[#A3B899] font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6E9271]" />
              All-in est. {formatInr(monthlyEstimate(property))} · RentTruth™
            </p>
          </div>

          <Link
            href={detailHref}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#284431] dark:bg-[#6E9271] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-95 transition-all cursor-pointer"
          >
            <span>Explore</span>
            <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
