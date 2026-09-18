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

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/30 dark:hover:border-blue-500/30"
    >
      {/* Visual Image Banner with Floating Pills */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Link href={`/homes/${property.id}`} className="block h-full w-full">
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
        </Link>

        {/* Top Badges: Verification Status */}
        <div className="absolute left-3.5 top-3.5 z-10">
          <StatusBadge
            tone={
              property.verification === "identity-checked"
                ? "ok"
                : property.verification === "documents-pending"
                  ? "warn"
                  : "neutral"
            }
          >
            {property.verification.replace("-", " ")}
          </StatusBadge>
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
          className="absolute right-3.5 top-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 dark:bg-slate-950/85 backdrop-blur-md text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          <svg
            className={cn(
              "h-4 w-4 transition-colors",
              saved ? "fill-rose-500 text-rose-500" : "fill-none text-slate-600 dark:text-slate-300",
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
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Locality Chip on image bottom-left */}
        <div className="absolute bottom-3 left-3.5 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/70 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-md">
            <svg className="h-3 w-3 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {property.locality}, {property.city}
          </span>
        </div>
      </div>

      {/* Property Details Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <Link href={`/homes/${property.id}`} className="group/title block">
            <h3 className="font-sans text-lg font-bold tracking-tight text-slate-900 dark:text-white transition-colors group-hover/title:text-blue-600 dark:group-hover/title:text-blue-400 line-clamp-1">
              {property.title}
            </h3>
          </Link>

          {/* Specification Pills */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="rounded-lg bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 font-medium">
              {property.bedrooms} BHK
            </span>
            <span className="rounded-lg bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 font-medium font-tabular">
              {property.areaSqft} sqft
            </span>
            <span className="rounded-lg bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 font-medium capitalize">
              {property.furnishing}
            </span>
          </div>
        </div>

        {/* Pricing & RentTruth Transparency */}
        <div className="mt-5 border-t border-slate-100 dark:border-slate-800/80 pt-4 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-sans text-2xl font-black tracking-tight text-slate-900 dark:text-white font-tabular">
                {formatInr(property.rent)}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ month</span>
            </div>
            <p className="mt-0.5 text-[11px] text-teal-600 dark:text-teal-400 font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              All-in est. {formatInr(monthlyEstimate(property))} · RentTruth™
            </p>
          </div>

          <Link
            href={`/homes/${property.id}`}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all cursor-pointer"
          >
            <span>View</span>
            <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
