"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { PropertyCard } from "@/components/property/property-card";
import {
  applyFilters,
  defaultFilters,
  FilterPanel,
  type Filters,
} from "@/components/property/filter-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { properties as fallbackProperties } from "@/data/demo";
import { isDemoFallbackAllowed } from "@/lib/supabase/client";
import { getProperties } from "@/lib/supabase/properties";
import { useNivasa } from "@/store/nivasa-store";
import { Button } from "@/components/ui/button";
import type { Property } from "@/types";

export default function HomesPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [savedOnly, setSavedOnly] = useState(false);
  const [allProperties, setAllProperties] = useState<Property[]>(() =>
    isDemoFallbackAllowed() ? fallbackProperties : [],
  );
  const [loading, setLoading] = useState(true);
  const { savedIds } = useNivasa();

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await getProperties();
        if (active) {
          setAllProperties(data);
        }
      } catch (err) {
        console.warn("Could not load remote properties:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const results = useMemo(() => {
    const list = applyFilters(allProperties, filters);
    return savedOnly ? list.filter((item) => savedIds.includes(item.id)) : list;
  }, [allProperties, filters, savedOnly, savedIds]);

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
              Direct Tenancy Directory
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              Architectural Residences
            </h1>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Verified inventory across Ahmedabad, Bengaluru, Pune, and Mumbai with itemized RentTruth™ cost receipts and zero broker markups.
            </p>
          </div>

          {/* Saved Toggle Pill */}
          <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-1 backdrop-blur-md self-start md:self-auto">
            <button
              type="button"
              onClick={() => setSavedOnly(false)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                !savedOnly
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All Homes ({allProperties.length})
            </button>
            <button
              type="button"
              onClick={() => setSavedOnly(true)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                savedOnly
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <svg className={`w-3.5 h-3.5 ${savedOnly ? "fill-white" : "fill-none stroke-current"}`} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Saved ({savedIds.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Dock */}
        <div className="mt-8">
          <FilterPanel value={filters} onChange={setFilters} />
        </div>

        {/* Status Bar */}
        <div className="mt-6 flex items-center justify-between gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          <p>
            {loading ? "Verifying live database inventory..." : `Displaying ${results.length} verified residences`}
          </p>
          {(filters.query || filters.city !== "any" || filters.type !== "any" || savedOnly) && (
            <button
              type="button"
              onClick={() => {
                setFilters(defaultFilters);
                setSavedOnly(false);
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Results Grid */}
        {results.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-12 text-center">
            <EmptyState
              title="No residences match your criteria"
              body="Expand your budget filter, select all locations, or disable the saved-only toggle to discover more homes."
              action={
                <Button
                  variant="line"
                  onClick={() => {
                    setFilters(defaultFilters);
                    setSavedOnly(false);
                  }}
                >
                  Reset all filters
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {results.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
