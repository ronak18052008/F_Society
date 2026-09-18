"use client";

import { useState } from "react";
import type { Furnishing, PropertyType, Property } from "@/types";

export type Filters = {
  query: string;
  city: string;
  locality?: string;
  minRent: number;
  maxRent: number;
  minSize?: number;
  maxSize?: number;
  bhk: number | "any";
  furnishing: Furnishing | "any";
  bathrooms: number | "any";
  tenantPreferred: string | "any";
  year: "all" | "2025" | "2026";
  sort: "newest" | "oldest" | "rent_asc" | "rent_desc" | "size_asc" | "size_desc" | "bhk";
};

export const defaultFilters: Filters = {
  query: "",
  city: "any",
  locality: "",
  minRent: 0,
  maxRent: 200000,
  bhk: "any",
  furnishing: "any",
  bathrooms: "any",
  tenantPreferred: "any",
  year: "all",
  sort: "newest",
};

export const CITIES = [
  "any",
  "Mumbai",
  "Bangalore",
  "Delhi",
  "Chennai",
  "Hyderabad",
  "Kolkata"
];

export function FilterPanel({
  value,
  onChange,
  onReset,
  totalResults
}: {
  value: Filters;
  onChange: (value: Filters) => void;
  onReset?: () => void;
  totalResults?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const set = (patch: Partial<Filters>) => onChange({ ...value, ...patch });

  const hasActiveFilters =
    value.query !== "" ||
    value.city !== "any" ||
    (value.locality && value.locality !== "") ||
    value.minRent > 0 ||
    value.maxRent < 200000 ||
    value.bhk !== "any" ||
    value.furnishing !== "any" ||
    value.bathrooms !== "any" ||
    value.tenantPreferred !== "any" ||
    value.year !== "all" ||
    value.sort !== "newest";

  const handleReset = () => {
    if (onReset) onReset();
    else onChange(defaultFilters);
  };

  return (
    <div className="rounded-3xl border border-line bg-card p-5 sm:p-6 shadow-card backdrop-blur-xl transition-all">
      {/* Primary Bar: Search, City, BHK, Sorting, Expand Button */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 items-end">
        {/* Search Keyword / Locality */}
        <div className="sm:col-span-2 lg:col-span-4">
          <label htmlFor="filter-query" className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1.5">
            Search Locality / Residence
          </label>
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="filter-query"
              value={value.query}
              onChange={(e) => set({ query: e.target.value })}
              placeholder="e.g. Bandra, Whitefield, Salt Lake, Gachibowli..."
              className="w-full rounded-xl border border-line bg-paper pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:border-[#6E9271] focus:bg-card focus:ring-2 focus:ring-[#6E9271]/20 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* City Hub */}
        <div className="lg:col-span-2">
          <label htmlFor="filter-city" className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1.5">
            Metro City
          </label>
          <select
            id="filter-city"
            value={value.city}
            onChange={(e) => set({ city: e.target.value })}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm font-medium text-ink focus:border-[#6E9271] focus:ring-2 focus:ring-[#6E9271]/20 focus:outline-none transition-all cursor-pointer"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c === "any" ? "All Metros" : c}
              </option>
            ))}
          </select>
        </div>

        {/* BHK Quick Selector */}
        <div className="lg:col-span-3">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1.5">
            Bedrooms / BHK
          </label>
          <div className="flex items-center gap-1 rounded-xl border border-line bg-paper p-1">
            {[
              { label: "All", val: "any" as const },
              { label: "1 BHK", val: 1 },
              { label: "2 BHK", val: 2 },
              { label: "3 BHK", val: 3 },
              { label: "4+ BHK", val: 4 }
            ].map((item) => {
              const active = value.bhk === item.val;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => set({ bhk: item.val })}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-[#284431] dark:bg-[#6E9271] text-white shadow-xs"
                      : "text-ink-muted hover:text-ink hover:bg-card/50"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort Selector */}
        <div className="lg:col-span-2">
          <label htmlFor="filter-sort" className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1.5">
            Sort Order
          </label>
          <select
            id="filter-sort"
            value={value.sort}
            onChange={(e) => set({ sort: e.target.value as Filters["sort"] })}
            className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-xs font-semibold text-ink focus:border-[#6E9271] focus:ring-2 focus:ring-[#6E9271]/20 focus:outline-none transition-all cursor-pointer"
          >
            <option value="newest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rent_asc">Rent: Low to High</option>
            <option value="rent_desc">Rent: High to Low</option>
            <option value="size_asc">Size: Small to Large</option>
            <option value="size_desc">Size: Large to Small</option>
            <option value="bhk">Bedrooms (BHK)</option>
          </select>
        </div>

        {/* More Filters Toggle */}
        <div className="lg:col-span-1 flex justify-end">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className={`w-full h-[42px] rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
              expanded
                ? "border-[#6E9271] bg-[#6E9271]/15 text-[#284431] dark:text-[#A3B899]"
                : "border-line bg-paper text-ink-muted hover:text-ink hover:border-[#6E9271]/40"
            }`}
          >
            <svg
              className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Expanded Multi-Attribute Drawer */}
      {expanded && (
        <div className="mt-5 border-t border-line/60 pt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Budget Range Presets & Max Rent */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="filter-budget" className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                Monthly Budget
              </label>
              <span className="text-xs font-bold text-[#6E9271] dark:text-[#A3B899] font-tabular">
                ₹{value.maxRent.toLocaleString("en-IN")}
              </span>
            </div>
            <input
              id="filter-budget"
              type="range"
              min={5000}
              max={250000}
              step={5000}
              value={value.maxRent}
              onChange={(e) => set({ maxRent: Number(e.target.value) })}
              className="w-full h-2 bg-[#E3DFD5] dark:bg-[#284431]/40 rounded-lg appearance-none cursor-pointer accent-[#6E9271] my-2"
            />
            <div className="flex flex-wrap gap-1 mt-1">
              {[
                { label: "< ₹20k", max: 20000 },
                { label: "₹20k-₹50k", max: 50000 },
                { label: "₹50k-₹1L", max: 100000 },
                { label: "₹1L+", max: 250000 }
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => set({ maxRent: p.max })}
                  className="rounded-md border border-line/60 bg-paper px-2 py-0.5 text-[10px] font-medium text-ink-muted hover:text-ink hover:border-[#6E9271]/40 transition"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Furnishing Status */}
          <div>
            <label htmlFor="filter-furnishing" className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1.5">
              Furnishing
            </label>
            <select
              id="filter-furnishing"
              value={value.furnishing}
              onChange={(e) => set({ furnishing: e.target.value as Filters["furnishing"] })}
              className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-xs font-medium text-ink focus:border-[#6E9271] focus:outline-none transition cursor-pointer"
            >
              <option value="any">Any Furnishing</option>
              <option value="furnished">Furnished</option>
              <option value="semi-furnished">Semi-Furnished</option>
              <option value="unfurnished">Unfurnished</option>
            </select>
          </div>

          {/* Tenant Preference */}
          <div>
            <label htmlFor="filter-tenant" className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1.5">
              Tenant Preference
            </label>
            <select
              id="filter-tenant"
              value={value.tenantPreferred}
              onChange={(e) => set({ tenantPreferred: e.target.value })}
              className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-xs font-medium text-ink focus:border-[#6E9271] focus:outline-none transition cursor-pointer"
            >
              <option value="any">Any Tenant</option>
              <option value="Bachelors">Bachelors Only</option>
              <option value="Family">Family Only</option>
              <option value="Bachelors/Family">Bachelors / Family</option>
            </select>
          </div>

          {/* Year Timeline (2025 vs 2026) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1.5">
              Tenancy Year
            </label>
            <div className="flex items-center gap-1 rounded-xl border border-line bg-paper p-1">
              {[
                { label: "All Years", val: "all" as const },
                { label: "2025", val: "2025" as const },
                { label: "2026", val: "2026" as const }
              ].map((yr) => (
                <button
                  key={yr.label}
                  type="button"
                  onClick={() => set({ year: yr.val })}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    value.year === yr.val
                      ? "bg-[#284431] dark:bg-[#6E9271] text-white shadow-xs"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {yr.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Pills Bar */}
      {hasActiveFilters && (
        <div className="mt-4 pt-3 border-t border-line/60 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-ink-muted font-medium text-[11px] uppercase tracking-wider">Active:</span>
            {value.query && (
              <span className="inline-flex items-center gap-1 rounded-full bg-paper border border-line px-2.5 py-0.5 text-ink">
                &ldquo;{value.query}&rdquo;
                <button type="button" onClick={() => set({ query: "" })} className="hover:text-red-500 font-bold ml-1">×</button>
              </span>
            )}
            {value.city !== "any" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#6E9271]/15 text-[#284431] dark:text-[#A3B899] border border-[#6E9271]/30 px-2.5 py-0.5">
                City: {value.city}
                <button type="button" onClick={() => set({ city: "any" })} className="hover:text-red-500 font-bold ml-1">×</button>
              </span>
            )}
            {value.bhk !== "any" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-paper border border-line px-2.5 py-0.5 text-ink">
                {value.bhk} BHK
                <button type="button" onClick={() => set({ bhk: "any" })} className="hover:text-red-500 font-bold ml-1">×</button>
              </span>
            )}
            {value.maxRent < 200000 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-paper border border-line px-2.5 py-0.5 text-ink">
                Max ₹{value.maxRent.toLocaleString("en-IN")}
                <button type="button" onClick={() => set({ maxRent: 200000 })} className="hover:text-red-500 font-bold ml-1">×</button>
              </span>
            )}
            {value.furnishing !== "any" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-paper border border-line px-2.5 py-0.5 text-ink capitalize">
                {value.furnishing}
                <button type="button" onClick={() => set({ furnishing: "any" })} className="hover:text-red-500 font-bold ml-1">×</button>
              </span>
            )}
            {value.year !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-paper border border-line px-2.5 py-0.5 text-ink">
                Year: {value.year}
                <button type="button" onClick={() => set({ year: "all" })} className="hover:text-red-500 font-bold ml-1">×</button>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-[#6E9271] dark:text-[#A3B899] hover:underline cursor-pointer ml-auto"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

export function applyFilters(properties: Property[], filters: Filters): Property[] {
  return properties.filter((p) => {
    if (filters.city !== "any" && p.city.toLowerCase() !== filters.city.toLowerCase()) {
      return false;
    }
    if (filters.bhk !== "any") {
      const bhkVal = Number(filters.bhk);
      if (bhkVal >= 4 ? (p.bhk || p.bedrooms) < 4 : (p.bhk || p.bedrooms) !== bhkVal) {
        return false;
      }
    }
    if (p.rent > filters.maxRent) {
      return false;
    }
    if (filters.furnishing !== "any" && p.furnishing.toLowerCase() !== filters.furnishing.toLowerCase()) {
      return false;
    }
    if (filters.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      const match =
        p.title.toLowerCase().includes(q) ||
        p.locality.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}
