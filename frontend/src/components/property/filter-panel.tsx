"use client";

import { properties } from "@/data/demo";
import type { Furnishing, PropertyType, Suitability } from "@/types";

export type Filters = {
  query: string;
  city: string;
  maxRent: number;
  type: PropertyType | "any";
  furnishing: Furnishing | "any";
  suitability: Suitability | "any";
  sort: "rent-asc" | "rent-desc" | "soonest";
};

export const defaultFilters: Filters = {
  query: "",
  city: "any",
  maxRent: 80000,
  type: "any",
  furnishing: "any",
  suitability: "any",
  sort: "soonest",
};

const cities = ["any", ...Array.from(new Set(properties.map((item) => item.city)))];

export function FilterPanel({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (value: Filters) => void;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...value, ...patch });

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-5 sm:p-6 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl">
      <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-4">
        {/* Search Query */}
        <div className="md:col-span-2">
          <label htmlFor="filter-query" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Keywords or Locality
          </label>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="filter-query"
              value={value.query}
              onChange={(event) => set({ query: event.target.value })}
              placeholder="e.g. Navrangpura, Indiranagar, terrace garden..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Location Dropdown */}
        <div>
          <label htmlFor="filter-city" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            City Hub
          </label>
          <select
            id="filter-city"
            value={value.city}
            onChange={(event) => set({ city: event.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all cursor-pointer"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city === "any" ? "All Locations" : city}
              </option>
            ))}
          </select>
        </div>

        {/* Budget Slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="filter-budget" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Max Base Rent
            </label>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              ₹{value.maxRent.toLocaleString("en-IN")}
            </span>
          </div>
          <input
            id="filter-budget"
            type="range"
            min={10000}
            max={80000}
            step={1000}
            value={value.maxRent}
            onChange={(event) => set({ maxRent: Number(event.target.value) })}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
          />
        </div>

        {/* Property Typology */}
        <div>
          <label htmlFor="filter-type" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Typology
          </label>
          <select
            id="filter-type"
            value={value.type}
            onChange={(event) => set({ type: event.target.value as Filters["type"] })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all cursor-pointer"
          >
            <option value="any">Any Typology</option>
            <option value="apartment">Apartment Residence</option>
            <option value="studio">Modern Studio</option>
            <option value="independent-floor">Independent Floor</option>
            <option value="villa">Architectural Villa</option>
          </select>
        </div>

        {/* Furnishing */}
        <div>
          <label htmlFor="filter-furnishing" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Furnishing Tier
          </label>
          <select
            id="filter-furnishing"
            value={value.furnishing}
            onChange={(event) =>
              set({ furnishing: event.target.value as Filters["furnishing"] })
            }
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all cursor-pointer"
          >
            <option value="any">Any Furnishing</option>
            <option value="furnished">Fully Furnished</option>
            <option value="semi-furnished">Semi-Furnished</option>
            <option value="unfurnished">Unfurnished Canvas</option>
          </select>
        </div>

        {/* Suitability */}
        <div>
          <label htmlFor="filter-suitability" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Household Fit
          </label>
          <select
            id="filter-suitability"
            value={value.suitability}
            onChange={(event) =>
              set({ suitability: event.target.value as Filters["suitability"] })
            }
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all cursor-pointer"
          >
            <option value="any">Any Household</option>
            <option value="working-professional">Working Professionals</option>
            <option value="student">Scholars & Students</option>
            <option value="family">Families</option>
            <option value="shared">Shared Living</option>
          </select>
        </div>

        {/* Sorting Order */}
        <div>
          <label htmlFor="filter-sort" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Sort Order
          </label>
          <select
            id="filter-sort"
            value={value.sort}
            onChange={(event) => set({ sort: event.target.value as Filters["sort"] })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all cursor-pointer"
          >
            <option value="soonest">Available Soonest</option>
            <option value="rent-asc">Rent: Low to High</option>
            <option value="rent-desc">Rent: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export function applyFilters(list: typeof properties, filters: Filters) {
  const q = filters.query.toLowerCase();
  const next = list.filter((item) => {
    const text = `${item.title} ${item.locality} ${item.city}`.toLowerCase();
    if (q && !text.includes(q)) return false;
    if (filters.city !== "any" && item.city !== filters.city) return false;
    if (item.rent > filters.maxRent) return false;
    if (filters.type !== "any" && item.type !== filters.type) return false;
    if (filters.furnishing !== "any" && item.furnishing !== filters.furnishing)
      return false;
    if (
      filters.suitability !== "any" &&
      !item.suitability.includes(filters.suitability)
    )
      return false;
    return true;
  });

  return next.sort((a, b) => {
    if (filters.sort === "rent-asc") return a.rent - b.rent;
    if (filters.sort === "rent-desc") return b.rent - a.rent;
    return a.availableFrom.localeCompare(b.availableFrom);
  });
}
