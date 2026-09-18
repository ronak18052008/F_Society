"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { useNivasa } from "@/store/nivasa-store";
import { properties as demoProps } from "@/data/demo";
import { getOwnerProperties } from "@/lib/supabase/properties";
import { formatInr } from "@/lib/format";
import type { Property } from "@/types";

const METRO_BENCHMARKS = [
  { city: "Mumbai", avgRent: "₹85,000", yieldPct: "4.2%", demand: "Very High", sampleTag: "Demo / Sample Market Data" },
  { city: "Bangalore", avgRent: "₹25,000", yieldPct: "4.8%", demand: "High", sampleTag: "Demo / Sample Market Data" },
  { city: "Chennai", avgRent: "₹22,000", yieldPct: "3.9%", demand: "Steady", sampleTag: "Demo / Sample Market Data" },
  { city: "Hyderabad", avgRent: "₹21,000", yieldPct: "4.5%", demand: "Very High", sampleTag: "Demo / Sample Market Data" },
  { city: "Delhi", avgRent: "₹29,000", yieldPct: "3.6%", demand: "High", sampleTag: "Demo / Sample Market Data" },
  { city: "Kolkata", avgRent: "₹12,000", yieldPct: "3.4%", demand: "Moderate", sampleTag: "Demo / Sample Market Data" },
];

export default function OwnerHubPage() {
  const { user, drafts } = useNivasa();
  const [listed, setListed] = useState<Property[]>(() =>
    demoProps.filter((item) => item.ownerId === "own-mehta")
  );

  useEffect(() => {
    let active = true;
    async function loadProperties() {
      try {
        const ownerId = user?.supabaseId || "own-mehta";
        const props = await getOwnerProperties(ownerId);
        if (active && props && props.length > 0) {
          setListed(props);
        }
      } catch (err) {
        console.warn("Could not load owner properties:", err);
      }
    }
    loadProperties();
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16 space-y-12">
        {/* Hub Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#e5dfc5] dark:border-[#2a3f31] pb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-900 dark:text-amber-200 border border-amber-500/30">
              <span>Owner Command Deck</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>OWNER</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ink tracking-tight">
              Property Owner & Landlord Portal
            </h1>
            <p className="text-sm sm:text-base text-ink-muted max-w-2xl font-medium">
              Manage properties, tenant inquiries, leases, and property operations with Nivasa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/owner/properties/new"
              className="rounded-full bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>+ Post Property</span>
            </Link>
            <Link
              href="/owner/dashboard"
              className="rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark hover:bg-[#7ca982]/10 px-4 py-2.5 text-xs font-semibold text-ink transition-colors cursor-pointer"
            >
              Open Full Workspace →
            </Link>
          </div>
        </div>

        {/* 11. Owner Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-serif text-ink">Owner Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              href="/owner/properties/new"
              className="group flex flex-col items-center justify-center p-5 rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark hover:border-amber-600 hover:shadow-md transition-all text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-200 group-hover:scale-110 transition-transform">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <span className="mt-2.5 text-xs font-bold text-ink group-hover:text-amber-700">+ Post Property</span>
              <span className="text-[10px] text-ink-muted">List a residence</span>
            </Link>

            <Link
              href="/ai/agreement"
              className="group flex flex-col items-center justify-center p-5 rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark hover:border-amber-600 hover:shadow-md transition-all text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 group-hover:scale-110 transition-transform">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <span className="mt-2.5 text-xs font-bold text-ink group-hover:text-indigo-600">AI Lease Drafter</span>
              <span className="text-[10px] text-ink-muted">Digital agreement</span>
            </Link>

            <Link
              href="/owner/dashboard"
              className="group flex flex-col items-center justify-center p-5 rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark hover:border-amber-600 hover:shadow-md transition-all text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 group-hover:scale-110 transition-transform">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <span className="mt-2.5 text-xs font-bold text-ink group-hover:text-emerald-700">Tenant Inquiries</span>
              <span className="text-[10px] text-ink-muted">Review applications</span>
            </Link>

            <Link
              href="/rental/rent-navrang/passport"
              className="group flex flex-col items-center justify-center p-5 rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark hover:border-amber-600 hover:shadow-md transition-all text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-200 group-hover:scale-110 transition-transform">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <span className="mt-2.5 text-xs font-bold text-ink group-hover:text-amber-700">Maintenance & Passport</span>
              <span className="text-[10px] text-ink-muted">Condition log</span>
            </Link>
          </div>
        </div>

        {/* 11. Owner Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Active Properties</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif text-ink">{listed.length} Published</span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                100% Occupied
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">{drafts.length} draft listings in progress</p>
          </div>

          <div className="rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Draft Listings</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif text-ink">{drafts.length} Drafts</span>
              <Link href="/owner/properties/new" className="text-xs text-amber-700 dark:text-amber-300 font-semibold hover:underline">
                Resume →
              </Link>
            </div>
            <p className="mt-1 text-xs text-ink-muted">Ready for publication</p>
          </div>

          <div className="rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Tenant Leads & Inquiries</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif text-ink">4 Inquiries</span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">2 New</span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">Pre-screened verified applicants</p>
          </div>

          <div className="rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Monthly Rental Income</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif text-ink">₹82,000</span>
              <span className="text-emerald-600 text-xs font-semibold">+8.4% YoY</span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">2 active tenancy ledgers</p>
          </div>
        </div>

        {/* 12. Owner Property Portfolio */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-serif text-ink">My Property Portfolio</h2>
              <p className="text-xs text-ink-muted">Manage, edit, publish, and review applications for your registered residences</p>
            </div>
            <Link
              href="/owner/properties/new"
              className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline"
            >
              + Add Property
            </Link>
          </div>

          {listed.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {listed.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-6 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                        Published & Active
                      </span>
                      <span className="text-xs font-bold text-ink font-serif">{formatInr(item.rent)} / month</span>
                    </div>
                    <h3 className="text-base font-bold text-ink">{item.title}</h3>
                    <p className="text-xs text-ink-muted">{item.locality}, {item.city} · {item.bedrooms || item.bhk} BHK · {item.areaSqft || item.sizeSqft} sqft</p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#e5dfc5] dark:border-[#2a3f31] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <Link href={`/property/${item.id}`} className="font-semibold text-[#57875d] dark:text-[#a3caa6] hover:underline">
                        View
                      </Link>
                      <Link href={`/owner/properties/${item.id}`} className="font-semibold text-ink hover:underline">
                        Edit
                      </Link>
                      <Link href="/owner/dashboard" className="font-semibold text-amber-700 dark:text-amber-300 hover:underline">
                        Applications (2)
                      </Link>
                    </div>
                    <span className="text-[10px] text-ink-muted">Verified Listing</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#e5dfc5] dark:border-[#2a3f31] p-10 text-center">
              <p className="text-sm font-semibold text-ink">No properties listed yet.</p>
              <p className="mt-1 text-xs text-ink-muted">Publish your first residence to start receiving verified tenant applications.</p>
              <Link
                href="/owner/properties/new"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-700 text-white px-4 py-2 text-xs font-bold shadow-xs hover:bg-amber-800 transition-colors"
              >
                + Post Your First Property
              </Link>
            </div>
          )}
        </div>

        {/* 13. Owner Market Analytics (Demo / Sample Market Data) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div>
              <h2 className="text-xl font-bold font-serif text-ink">Metropolitan Rental Yield Intelligence</h2>
              <p className="text-xs text-ink-muted">Benchmark your rental performance across top Indian metro corridors</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Demo / Sample Market Data
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {METRO_BENCHMARKS.map((m) => (
              <div
                key={m.city}
                className="rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-4 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">{m.city}</span>
                  <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">{m.yieldPct}</span>
                </div>
                <p className="mt-1 text-sm font-serif font-bold text-ink">{m.avgRent}</p>
                <div className="mt-2 pt-2 border-t border-[#e5dfc5]/60 dark:border-[#2a3f31]/60 flex items-center justify-between text-[9px] text-ink-muted">
                  <span>Demand:</span>
                  <span className="font-semibold text-ink">{m.demand}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
