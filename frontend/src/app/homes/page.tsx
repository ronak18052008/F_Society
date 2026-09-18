"use client";

import { useMemo, useState } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { PropertyCard } from "@/components/property/property-card";
import {
  applyFilters,
  defaultFilters,
  FilterPanel,
  type Filters,
} from "@/components/property/filter-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { properties } from "@/data/demo";
import { useNestora } from "@/store/nestora-store";
import { Button } from "@/components/ui/button";

export default function HomesPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [savedOnly, setSavedOnly] = useState(false);
  const { savedIds } = useNestora();

  const results = useMemo(() => {
    const list = applyFilters(properties, filters);
    return savedOnly ? list.filter((item) => savedIds.includes(item.id)) : list;
  }, [filters, savedOnly, savedIds]);

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-5 py-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
          Demo inventory
        </p>
        <h1 className="mt-3 font-serif text-5xl">Find a home</h1>
        <p className="mt-3 max-w-xl text-sm text-ink-soft">
          Eight prototype listings. Filters run in the browser. Saved homes are
          stored locally.
        </p>
        <div className="mt-8">
          <FilterPanel value={filters} onChange={setFilters} />
        </div>
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-ink-soft">{results.length} homes</p>
          <button
            type="button"
            className="font-mono text-[11px] uppercase tracking-[0.16em]"
            onClick={() => setSavedOnly((value) => !value)}
            aria-pressed={savedOnly}
          >
            {savedOnly ? "Showing saved" : "Saved only"}
          </button>
        </div>
        {results.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="No homes match"
              body="Widen the budget or clear a filter. Saved-only view is empty if you have not saved a listing."
              action={
                <Button
                  variant="line"
                  onClick={() => {
                    setFilters(defaultFilters);
                    setSavedOnly(false);
                  }}
                >
                  Reset filters
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
