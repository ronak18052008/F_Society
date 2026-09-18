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
    <form className="grid gap-4 border border-line p-4 md:grid-cols-3 lg:grid-cols-4">
      <label className="md:col-span-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          Search
        </span>
        <input
          value={value.query}
          onChange={(event) => set({ query: event.target.value })}
          placeholder="Locality, city, or title"
          className="mt-2 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-bronze"
        />
      </label>
      <label>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          Location
        </span>
        <select
          value={value.city}
          onChange={(event) => set({ city: event.target.value })}
          className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm"
        >
          {cities.map((city) => (
            <option key={city} value={city}>
              {city === "any" ? "All cities" : city}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          Budget up to {value.maxRent.toLocaleString("en-IN")}
        </span>
        <input
          type="range"
          min={10000}
          max={80000}
          step={1000}
          value={value.maxRent}
          onChange={(event) => set({ maxRent: Number(event.target.value) })}
          className="mt-4 w-full"
        />
      </label>
      <label>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          Type
        </span>
        <select
          value={value.type}
          onChange={(event) => set({ type: event.target.value as Filters["type"] })}
          className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm"
        >
          <option value="any">Any</option>
          <option value="apartment">Apartment</option>
          <option value="studio">Studio</option>
          <option value="independent-floor">Independent floor</option>
          <option value="villa">Villa wing</option>
        </select>
      </label>
      <label>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          Furnishing
        </span>
        <select
          value={value.furnishing}
          onChange={(event) =>
            set({ furnishing: event.target.value as Filters["furnishing"] })
          }
          className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm"
        >
          <option value="any">Any</option>
          <option value="furnished">Furnished</option>
          <option value="semi-furnished">Semi-furnished</option>
          <option value="unfurnished">Unfurnished</option>
        </select>
      </label>
      <label>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          Suitability
        </span>
        <select
          value={value.suitability}
          onChange={(event) =>
            set({ suitability: event.target.value as Filters["suitability"] })
          }
          className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm"
        >
          <option value="any">Any</option>
          <option value="working-professional">Working professional</option>
          <option value="student">Student</option>
          <option value="family">Family</option>
          <option value="shared">Shared</option>
        </select>
      </label>
      <label>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          Sort
        </span>
        <select
          value={value.sort}
          onChange={(event) => set({ sort: event.target.value as Filters["sort"] })}
          className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm"
        >
          <option value="soonest">Available soonest</option>
          <option value="rent-asc">Rent: low to high</option>
          <option value="rent-desc">Rent: high to low</option>
        </select>
      </label>
    </form>
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
