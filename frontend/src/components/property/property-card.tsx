"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Property } from "@/types";
import { formatInr } from "@/lib/format";
import { monthlyEstimate } from "@/data/demo";
import { StatusBadge } from "@/components/ui/status-badge";
import { useNestora } from "@/store/nestora-store";

export function PropertyCard({ property }: { property: Property }) {
  const { savedIds, toggleSave } = useNestora();
  const saved = savedIds.includes(property.id);

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group border border-line bg-paper"
    >
      <Link href={`/homes/${property.id}`} className="block">
        <div className="relative h-56 overflow-hidden">
          <Image
            src={property.images[0]}
            alt=""
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
          <div className="absolute left-3 top-3">
            <StatusBadge tone="demo">Demo listing</StatusBadge>
          </div>
        </div>
        <div className="space-y-2 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            {property.locality}, {property.city}
          </p>
          <h3 className="font-serif text-2xl leading-tight">{property.title}</h3>
          <p className="text-sm text-ink-soft">
            {property.bedrooms} bed · {property.areaSqft} sqft · {property.furnishing}
          </p>
          <p className="pt-2 text-sm">
            <span className="text-lg">{formatInr(property.rent)}</span>
            <span className="text-ink-soft"> / month</span>
          </p>
          <p className="text-xs text-ink-soft">
            Est. monthly total {formatInr(monthlyEstimate(property))} · mixed sources
          </p>
        </div>
      </Link>
      <div className="flex items-center justify-between border-t border-line px-4 py-3">
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
        <button
          type="button"
          className="font-mono text-[11px] uppercase tracking-[0.16em]"
          onClick={() => toggleSave(property.id)}
          aria-pressed={saved}
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </motion.article>
  );
}
