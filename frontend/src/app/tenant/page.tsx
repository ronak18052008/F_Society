"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { RoleGuard } from "@/components/auth/role-guard";
import { useNivasa } from "@/store/nivasa-store";
import { properties } from "@/data/demo";
import { PropertyCard } from "@/components/property/property-card";

export default function TenantHubPage() {
  const { user, savedIds } = useNivasa();
  const [greeting, setGreeting] = useState("Good Day");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const tenantName = user?.name || "Ronak";
  const savedProperties = properties.filter((p) => savedIds.includes(p.id));
  const recommendedProperties = properties.slice(0, 3);

  return (
    <RoleGuard allowedRole="tenant">
      <SiteShell>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16 space-y-12">
          {/* 1. Hub Header & Greeting */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#e5dfc5] dark:border-[#2a3f31] pb-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#7ca982]/15 px-3 py-1 text-xs font-semibold text-[#1d3122] dark:text-[#a3caa6] border border-[#7ca982]/30">
                <span>Tenant Portal</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#7ca982]" />
                <span>TENANT</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ink tracking-tight">
                {greeting}, {tenantName} 👋
              </h1>
              <p className="text-sm sm:text-base text-ink-muted max-w-2xl font-medium">
                Find a place that feels like home.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/tenant/dashboard"
                className="rounded-full bg-[#7ca982] hover:bg-[#68946e] text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Open Tenancy Workspace</span>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/properties"
                className="rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark hover:bg-[#7ca982]/10 px-4 py-2.5 text-xs font-semibold text-ink transition-colors cursor-pointer"
              >
                Browse All Homes →
              </Link>
            </div>
          </div>

          {/* 2. Quick Action Toolbar */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <Link
                href="/properties"
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark hover:border-[#7ca982] hover:shadow-sm transition-all text-center group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7ca982]/15 text-[#23452b] dark:text-[#a3caa6] group-hover:scale-110 transition-transform">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="mt-2 text-xs font-bold text-ink">Browse Homes</span>
                <span className="text-[10px] text-ink-muted">4,750+ verified</span>
              </Link>

              <Link
                href="/properties?saved=true"
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark hover:border-rose-400 hover:shadow-sm transition-all text-center group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 group-hover:scale-110 transition-transform">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="mt-2 text-xs font-bold text-ink">Saved Homes</span>
                <span className="text-[10px] text-ink-muted">{savedIds.length} homes</span>
              </Link>

              <Link
                href="/tenant/roommates"
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark hover:border-indigo-400 hover:shadow-sm transition-all text-center group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 group-hover:scale-110 transition-transform">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <span className="mt-2 text-xs font-bold text-ink">Find Roommate</span>
                <span className="text-[10px] text-ink-muted">Compatible peers</span>
              </Link>

              <Link
                href="/rental/rent-navrang"
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark hover:border-amber-400 hover:shadow-sm transition-all text-center group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-200 group-hover:scale-110 transition-transform">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                </div>
                <span className="mt-2 text-xs font-bold text-ink">Maintenance</span>
                <span className="text-[10px] text-ink-muted">Tickets & repairs</span>
              </Link>

              <Link
                href="/copilot"
                className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-4 rounded-2xl border border-[#7ca982]/40 bg-[#7ca982]/10 hover:bg-[#7ca982]/20 hover:shadow-sm transition-all text-center group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7ca982] text-white group-hover:scale-110 transition-transform">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="mt-2 text-xs font-bold text-ink">AI Copilot</span>
                <span className="text-[10px] text-[#23452b] dark:text-[#a3caa6] font-semibold">24/7 assistant</span>
              </Link>
            </div>
          </div>

          {/* 3. My Tenancy Section */}
          <div className="rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5dfc5] dark:border-[#2a3f31] pb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#57875d] dark:text-[#a3caa6]">
                  Active Tenancy Ledger
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-ink mt-1">
                  Courtyard Villa 2B · Navrangpura
                </h2>
                <p className="text-xs text-ink-muted mt-0.5">Lease ID: NIV-NVR-2026-02 · Signed via Aadhaar e-Sign</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active Tenancy
                </span>
                <Link
                  href="/rental/rent-navrang"
                  className="rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] px-3.5 py-1 text-xs font-semibold text-ink hover:bg-[#7ca982]/10 transition-colors"
                >
                  Manage Ledger →
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Monthly Rent</p>
                <p className="mt-1 text-2xl font-bold font-serif text-ink">₹32,000</p>
                <p className="text-[11px] text-ink-muted mt-0.5">RentTruth™ Itemized</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Next Rent Due</p>
                <p className="mt-1 text-2xl font-bold font-serif text-amber-600 dark:text-amber-400">Oct 01, 2026</p>
                <p className="text-[11px] text-ink-muted mt-0.5">In 12 days (UPI / Bank)</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Deposit Guarantee</p>
                <p className="mt-1 text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400">₹64,000</p>
                <p className="text-[11px] text-ink-muted mt-0.5">Condition Passport Locked</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Lease Period</p>
                <p className="mt-1 text-2xl font-bold font-serif text-ink">11 Months</p>
                <p className="text-[11px] text-ink-muted mt-0.5">Expires Aug 2027</p>
              </div>
            </div>
          </div>

          {/* 4. Saved Residences Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-serif text-ink">Saved Residences</h2>
                <p className="text-xs text-ink-muted">Properties you bookmarked for review or direct owner contact</p>
              </div>
              <Link href="/properties?saved=true" className="text-xs font-semibold text-[#57875d] dark:text-[#a3caa6] hover:underline">
                View all ({savedIds.length}) →
              </Link>
            </div>

            {savedProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {savedProperties.slice(0, 3).map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#e5dfc5] dark:border-[#2a3f31] p-8 text-center bg-card/50">
                <p className="text-sm font-semibold text-ink">No saved residences yet</p>
                <p className="text-xs text-ink-muted mt-1">Explore verified direct listings and click the heart icon to save.</p>
                <Link
                  href="/properties"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#7ca982] text-white px-4 py-2 text-xs font-bold shadow-xs hover:bg-[#68946e] transition-colors"
                >
                  Discover Residences →
                </Link>
              </div>
            )}
          </div>

          {/* 5. Recommended For You */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-serif text-ink">Recommended For You</h2>
                <p className="text-xs text-ink-muted">Curated homes matching verified zero-brokerage criteria</p>
              </div>
              <Link href="/ai/recommend" className="text-xs font-semibold text-[#57875d] dark:text-[#a3caa6] hover:underline">
                Tune AI Preferences →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </div>

          {/* 6. Maintenance & Condition Passport Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#e5dfc5] dark:border-[#2a3f31] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-200">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">Maintenance Tracker</h3>
                    <p className="text-[11px] text-ink-muted">Courtyard Villa 2B</p>
                  </div>
                </div>
                <Link href="/rental/rent-navrang" className="text-xs font-semibold text-[#57875d] dark:text-[#a3caa6] hover:underline">
                  + New Ticket
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-paper dark:bg-[#1d2d22] text-xs">
                  <div>
                    <span className="font-semibold text-ink block">Water purifier filter replacement</span>
                    <span className="text-[10px] text-ink-muted">Scheduled for tomorrow, 11:00 AM</span>
                  </div>
                  <span className="rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 text-[10px]">
                    In Progress
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-paper dark:bg-[#1d2d22] text-xs">
                  <div>
                    <span className="font-semibold text-ink block">Balcony slider latch adjustment</span>
                    <span className="text-[10px] text-ink-muted">Resolved on Sep 12</span>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 text-[10px]">
                    Resolved
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#e5dfc5] dark:border-[#2a3f31] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">Digital Condition Passport</h3>
                    <p className="text-[11px] text-ink-muted">Day 0 Mutual Inspection Log</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 text-[10px]">
                  Verified
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-xl bg-paper dark:bg-[#1d2d22] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">Move-In Inspection Photos</span>
                    <span className="text-ink-muted text-[10px]">16 Photos Logged</span>
                  </div>
                  <p className="text-[11px] text-ink-muted mt-1">
                    Wall paint status, appliance serial numbers, and meter readings time-stamped on blockchain ledger.
                  </p>
                </div>
                <Link
                  href="/rental/rent-navrang/passport"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#7ca982]/15 hover:bg-[#7ca982] hover:text-white text-[#1d3122] dark:text-[#a3caa6] py-2 text-xs font-bold transition-all cursor-pointer"
                >
                  View Cryptographic Move-In Report →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </SiteShell>
    </RoleGuard>
  );
}
