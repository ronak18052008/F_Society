"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { PropertyCard } from "@/components/property/property-card";
import { FilterPanel, type Filters, defaultFilters } from "@/components/property/filter-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getPaginatedProperties, type PaginatedPropertiesResult } from "@/lib/supabase/properties";
import { useNivasa } from "@/store/nivasa-store";
import type { Property } from "@/types";
import Link from "next/link";

function PropertiesMarketplace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { savedIds } = useNivasa();

  // Read initial filter values from URL query parameters
  const [filters, setFilters] = useState<Filters>(() => {
    const city = searchParams.get("city") || "any";
    const query = searchParams.get("q") || searchParams.get("query") || "";
    const locality = searchParams.get("locality") || "";
    const bhkParam = searchParams.get("bhk");
    const bhk = bhkParam && bhkParam !== "any" ? Number(bhkParam) : "any";
    const minRent = Number(searchParams.get("minRent")) || 0;
    const maxRent = Number(searchParams.get("maxRent")) || 200000;
    const furnishing = (searchParams.get("furnishing") as Filters["furnishing"]) || "any";
    const bathroomsParam = searchParams.get("bathrooms");
    const bathrooms = bathroomsParam && bathroomsParam !== "any" ? Number(bathroomsParam) : "any";
    const tenantPreferred = searchParams.get("tenant") || "any";
    const year = (searchParams.get("year") as Filters["year"]) || "all";
    const sort = (searchParams.get("sort") as Filters["sort"]) || "newest";

    return {
      city,
      query,
      locality,
      minRent,
      maxRent,
      bhk,
      furnishing,
      bathrooms,
      tenantPreferred,
      year,
      sort
    };
  });

  const [page, setPage] = useState<number>(() => {
    return Math.max(1, Number(searchParams.get("page")) || 1);
  });
  const [pageSize, setPageSize] = useState<number>(() => {
    return Math.max(12, Number(searchParams.get("pageSize")) || 24);
  });
  const [savedOnly, setSavedOnly] = useState(false);

  const [data, setData] = useState<PaginatedPropertiesResult>({
    properties: [],
    total: 0,
    page: 1,
    pageSize: 24,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);

  // Sync state changes to URL query parameters
  const updateUrlParams = useCallback(
    (newFilters: Filters, newPage: number, newPageSize: number) => {
      const params = new URLSearchParams();
      if (newFilters.city !== "any") params.set("city", newFilters.city);
      if (newFilters.query) params.set("q", newFilters.query);
      if (newFilters.locality) params.set("locality", newFilters.locality);
      if (newFilters.bhk !== "any") params.set("bhk", String(newFilters.bhk));
      if (newFilters.minRent > 0) params.set("minRent", String(newFilters.minRent));
      if (newFilters.maxRent < 200000) params.set("maxRent", String(newFilters.maxRent));
      if (newFilters.furnishing !== "any") params.set("furnishing", newFilters.furnishing);
      if (newFilters.bathrooms !== "any") params.set("bathrooms", String(newFilters.bathrooms));
      if (newFilters.tenantPreferred !== "any") params.set("tenant", newFilters.tenantPreferred);
      if (newFilters.year !== "all") params.set("year", newFilters.year);
      if (newFilters.sort !== "newest") params.set("sort", newFilters.sort);
      if (newPage > 1) params.set("page", String(newPage));
      if (newPageSize !== 24) params.set("pageSize", String(newPageSize));

      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname]
  );

  // Fetch paginated properties from Supabase
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPaginatedProperties({
        city: filters.city,
        locality: filters.locality,
        minRent: filters.minRent > 0 ? filters.minRent : undefined,
        maxRent: filters.maxRent < 200000 ? filters.maxRent : undefined,
        bhk: filters.bhk !== "any" ? Number(filters.bhk) : undefined,
        furnishing: filters.furnishing !== "any" ? filters.furnishing : undefined,
        bathrooms: filters.bathrooms !== "any" ? Number(filters.bathrooms) : undefined,
        tenantPreferred: filters.tenantPreferred !== "any" ? filters.tenantPreferred : undefined,
        year: filters.year !== "all" ? filters.year : undefined,
        sortBy: filters.sort,
        query: filters.query,
        page,
        pageSize
      });
      setData(res);
    } catch (err) {
      console.warn("Failed to load paginated properties:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setPage(1); // Reset to page 1 on filter modification
    updateUrlParams(newFilters, 1, pageSize);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > data.totalPages || newPage === page) return;
    setPage(newPage);
    updateUrlParams(filters, newPage, pageSize);
    window.scrollTo({ top: 180, behavior: "smooth" });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
    updateUrlParams(filters, 1, newSize);
  };

  const displayedList = savedOnly
    ? data.properties.filter((p) => savedIds.includes(p.id))
    : data.properties;

  const startIdx = data.total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, data.total);

  // Generate numbered pagination window (e.g. 1 ... 4 5 6 ... 198)
  const renderPaginationButtons = () => {
    const totalPages = data.totalPages;
    if (totalPages <= 1) return null;

    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    let l: number | undefined;
    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return (
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <button
          type="button"
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous Page"
          className="rounded-xl border border-line bg-card px-3 py-2 text-xs font-semibold text-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-paper transition shadow-xs cursor-pointer flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Prev</span>
        </button>

        {rangeWithDots.map((item, idx) => {
          if (item === "...") {
            return (
              <span key={`dots-${idx}`} className="px-2 text-xs font-bold text-ink-muted">
                ...
              </span>
            );
          }
          const num = item as number;
          const isCurrent = num === page;
          return (
            <button
              key={num}
              type="button"
              onClick={() => handlePageChange(num)}
              className={`min-w-[36px] h-9 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isCurrent
                  ? "bg-[#284431] dark:bg-[#6E9271] text-white"
                  : "border border-line bg-card text-ink hover:bg-paper"
              }`}
            >
              {num}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next Page"
          className="rounded-xl border border-line bg-card px-3 py-2 text-xs font-semibold text-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-paper transition shadow-xs cursor-pointer flex items-center gap-1"
        >
          <span className="hidden sm:inline">Next</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Header Block with Live Metrics */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-line">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#6E9271]/15 px-3.5 py-1 text-xs font-semibold text-[#284431] dark:text-[#A3B899] border border-[#6E9271]/30">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6E9271] animate-pulse" />
              Live Housing Directory · 2025–2026 Upgrades
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-ink">
              Metropolitan Residences
            </h1>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-ink-muted">
              Explore 4,746+ verified residences across Mumbai, Bangalore, Delhi, Chennai, Hyderabad, and Kolkata with transparent RentTruth™ itemization.
            </p>
          </div>

          {/* Quick Actions & Saved Toggle */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <Link
              href="/cities"
              className="rounded-full border border-line bg-card px-4 py-2 text-xs font-semibold text-ink hover:border-[#6E9271] transition shadow-xs"
            >
              City Statistics →
            </Link>

            <div className="flex items-center gap-1 rounded-full border border-line bg-card p-1 shadow-card">
              <button
                type="button"
                onClick={() => setSavedOnly(false)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  !savedOnly
                    ? "bg-[#284431] dark:bg-[#6E9271] text-white shadow-xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                All Homes ({data.total.toLocaleString()})
              </button>
              <button
                type="button"
                onClick={() => setSavedOnly(true)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  savedOnly
                    ? "bg-[#284431] dark:bg-[#6E9271] text-white shadow-xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <svg className={`w-3.5 h-3.5 ${savedOnly ? "fill-white" : "fill-none stroke-current"}`} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Saved ({savedIds.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel Dock */}
        <div className="mt-8">
          <FilterPanel
            value={filters}
            onChange={handleFilterChange}
            onReset={() => handleFilterChange(defaultFilters)}
            totalResults={data.total}
          />
        </div>

        {/* Results Bar: Counter & Page Size Selector */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-ink-muted">
          <div className="font-medium">
            {loading ? (
              <span>Searching database records...</span>
            ) : data.total > 0 ? (
              <span>
                Showing <strong className="text-ink">{startIdx}–{endIdx}</strong> of{" "}
                <strong className="text-ink">{data.total.toLocaleString()}</strong> residences
                {filters.city !== "any" && ` in ${filters.city}`}
              </span>
            ) : (
              <span>No residences found matching these parameters.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>Show per page:</span>
            <div className="flex items-center gap-1">
              {[12, 24, 48].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handlePageSizeChange(size)}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${
                    pageSize === size
                      ? "bg-[#284431] dark:bg-[#6E9271] text-white"
                      : "border border-line bg-card text-ink hover:bg-paper"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Listings Grid / Skeletons / Empty State */}
        <div className="mt-6">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-3xl border border-line bg-card p-4 shadow-card">
                  <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-5 w-3/4 rounded-md" />
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-6 w-16 rounded-lg" />
                      <Skeleton className="h-6 w-16 rounded-lg" />
                      <Skeleton className="h-6 w-20 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayedList.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayedList.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={savedOnly ? "No saved residences yet" : "No residences found"}
              body={
                savedOnly
                  ? "Explore the directory and bookmark properties by clicking the heart icon."
                  : "No listings in our 4,746+ record database match all selected criteria. Try adjusting your budget slider or clearing specific filters."
              }
              action={
                <button
                  type="button"
                  onClick={() => handleFilterChange(defaultFilters)}
                  className="rounded-full bg-[#284431] dark:bg-[#6E9271] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-95 transition cursor-pointer"
                >
                  Reset All Filters
                </button>
              }
            />
          )}
        </div>

        {/* Bottom Server-side Pagination Bar */}
        {!loading && data.totalPages > 1 && (
          <div className="mt-14 pt-8 border-t border-line flex flex-col items-center gap-4">
            {renderPaginationButtons()}
            <p className="text-xs text-ink-muted">
              Page <strong className="text-ink">{page}</strong> of <strong className="text-ink">{data.totalPages}</strong>
            </p>
          </div>
        )}
      </div>
    </SiteShell>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <SiteShell>
          <div className="mx-auto max-w-7xl px-4 py-20 text-center">
            <div className="inline-flex h-10 w-10 animate-spin rounded-full border-3 border-[#6E9271] border-t-transparent mb-3" />
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6E9271]">Loading Housing Directory...</p>
          </div>
        </SiteShell>
      }
    >
      <PropertiesMarketplace />
    </Suspense>
  );
}
