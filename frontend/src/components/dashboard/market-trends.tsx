"use client";

import Link from "next/link";
import { formatInr } from "@/lib/format";
import type { DatasetAnalytics } from "@/lib/supabase/properties";

interface MarketTrendsProps {
  analytics?: DatasetAnalytics;
}

const DEFAULT_ANALYTICS: DatasetAnalytics = {
  totalProperties: 4746,
  averageRent: 32525,
  averageSize: 960,
  citiesCount: 6,
  bhkDistribution: [
    { bhk: "1 BHK", count: 1167, percentage: 24.6 },
    { bhk: "2 BHK", count: 2265, percentage: 47.7 },
    { bhk: "3 BHK", count: 1068, percentage: 22.5 },
    { bhk: "4+ BHK", count: 246, percentage: 5.2 }
  ],
  cityDistribution: [
    { city: "Mumbai", count: 972, avgRent: 85321 },
    { city: "Delhi", count: 605, avgRent: 29462 },
    { city: "Bangalore", count: 886, avgRent: 24966 },
    { city: "Chennai", count: 891, avgRent: 21614 },
    { city: "Hyderabad", count: 868, avgRent: 20555 },
    { city: "Kolkata", count: 524, avgRent: 11645 }
  ],
  furnishingDistribution: [
    { status: "Semi-Furnished", count: 2251, percentage: 47.4 },
    { status: "Unfurnished", count: 1815, percentage: 38.2 },
    { status: "Furnished", count: 680, percentage: 14.4 }
  ],
  yearDistribution: [
    { year: "2025 Upgraded", count: 2839, percentage: 59.8 },
    { year: "2026 Current", count: 1907, percentage: 40.2 }
  ]
};

export function MarketTrends({ analytics = DEFAULT_ANALYTICS }: MarketTrendsProps) {
  const maxCityRent = Math.max(...analytics.cityDistribution.map((c) => c.avgRent));

  return (
    <div className="space-y-8">
      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#7ca982]/15 px-3 py-1 text-xs font-semibold text-[#1d3122] dark:text-[#a3caa6] border border-[#7ca982]/30">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7ca982] animate-pulse" />
            Live Dataset Intelligence
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-serif font-bold text-ink tracking-tight">
            Metropolitan Rental Market Trends
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-ink-muted">
            Aggregated analytics across {analytics.totalProperties.toLocaleString()} residential rental records in the active database.
          </p>
        </div>

        <Link
          href="/properties"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#7ca982] hover:bg-[#6b9a71] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:shadow-md transition cursor-pointer"
        >
          <span>Query Full Dataset</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-line bg-card p-5 shadow-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block">
            Total Inventory
          </span>
          <strong className="text-2xl sm:text-3xl font-serif font-bold text-ink block mt-1 font-tabular">
            {analytics.totalProperties.toLocaleString()}
          </strong>
          <span className="text-[11px] text-[#57875d] dark:text-[#a3caa6] font-medium mt-0.5 block">
            100% Ingested & Indexed
          </span>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5 shadow-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block">
            National Mean Rent
          </span>
          <strong className="text-2xl sm:text-3xl font-serif font-bold text-ink block mt-1 font-tabular">
            {formatInr(analytics.averageRent)}
          </strong>
          <span className="text-[11px] text-ink-muted mt-0.5 block">
            ₹0 Brokerage Baseline
          </span>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5 shadow-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block">
            Average Layout Size
          </span>
          <strong className="text-2xl sm:text-3xl font-serif font-bold text-ink block mt-1 font-tabular">
            {analytics.averageSize} sqft
          </strong>
          <span className="text-[11px] text-ink-muted mt-0.5 block">
            Predominantly 2 BHK
          </span>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5 shadow-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block">
            Metro Clusters
          </span>
          <strong className="text-2xl sm:text-3xl font-serif font-bold text-ink block mt-1 font-tabular">
            {analytics.citiesCount} Metros
          </strong>
          <span className="text-[11px] text-[#57875d] dark:text-[#a3caa6] font-medium mt-0.5 block">
            Tier-1 Urban Corridors
          </span>
        </div>
      </div>

      {/* City Rent Comparison & Timeline Split */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* City Rent Comparison Bar Chart */}
        <div className="lg:col-span-7 rounded-3xl border border-line bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-ink">Average Rent by City</h3>
              <p className="text-xs text-ink-muted">Comparison across Tier-1 metropolitan markets</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted bg-paper px-2.5 py-1 rounded-lg border border-line/60">
              ₹ / Month
            </span>
          </div>

          <div className="space-y-3.5 pt-2">
            {analytics.cityDistribution.map((item) => {
              const pct = Math.round((item.avgRent / maxCityRent) * 100);
              return (
                <div key={item.city} className="group">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <Link
                      href={`/properties?city=${encodeURIComponent(item.city)}`}
                      className="font-semibold text-ink group-hover:text-[#57875d] transition flex items-center gap-1.5"
                    >
                      <span>{item.city}</span>
                      <span className="text-[10px] text-ink-muted font-normal">
                        ({item.count} listings)
                      </span>
                    </Link>
                    <span className="font-bold text-ink font-tabular">
                      {formatInr(item.avgRent)}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-paper border border-line/40 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7ca982] to-[#57875d] dark:from-[#7ca982] dark:to-[#a3caa6] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2025 vs 2026 Timeline & Inventory Distribution */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Timeline Split */}
          <div className="rounded-3xl border border-line bg-card p-6 shadow-card">
            <h3 className="font-serif text-lg font-bold text-ink mb-1">Timeline Distribution</h3>
            <p className="text-xs text-ink-muted mb-4">Upgraded availability across 2025 and 2026</p>

            <div className="space-y-3">
              {analytics.yearDistribution.map((yr) => (
                <div key={yr.year}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-ink">{yr.year}</span>
                    <span className="font-bold text-ink font-tabular">
                      {yr.count.toLocaleString()} ({yr.percentage}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-paper border border-line/40 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#6E9271]"
                      style={{ width: `${yr.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[11px] text-ink-muted leading-relaxed">
              Historical 2022 dataset dates are mapped with deterministic monthly variance across 2025 and 2026 while preserving original audit timestamps.
            </p>
          </div>

          {/* Furnishing Breakdown */}
          <div className="rounded-3xl border border-line bg-card p-6 shadow-card">
            <h3 className="font-serif text-lg font-bold text-ink mb-1">Furnishing Breakdown</h3>
            <div className="grid grid-cols-3 gap-2 text-center mt-3">
              {analytics.furnishingDistribution.map((f) => (
                <div key={f.status} className="rounded-xl border border-line/60 bg-paper p-2.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted truncate">
                    {f.status}
                  </span>
                  <strong className="block mt-0.5 text-sm font-bold text-ink font-tabular">
                    {f.percentage}%
                  </strong>
                  <span className="text-[10px] text-ink-muted">
                    {f.count} homes
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BHK Distribution Breakdown */}
      <div className="rounded-3xl border border-line bg-card p-6 shadow-card">
        <h3 className="font-serif text-lg font-bold text-ink mb-1">BHK Typology Distribution</h3>
        <p className="text-xs text-ink-muted mb-4">Proportion of bedrooms across all imported housing stock</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {analytics.bhkDistribution.map((b) => (
            <div key={b.bhk} className="rounded-2xl border border-line/60 bg-paper p-4 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6E9271] dark:text-[#A3B899] block">
                {b.bhk}
              </span>
              <strong className="text-2xl font-serif font-bold text-ink block mt-1 font-tabular">
                {b.count.toLocaleString()}
              </strong>
              <span className="text-xs text-ink-muted block mt-0.5">
                {b.percentage}% of all listings
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
