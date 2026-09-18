"use client";

import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { useNivasa } from "@/store/nivasa-store";
import { formatInr } from "@/lib/format";

export default function TenantHubPage() {
  const { user, savedIds } = useNivasa();

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16 space-y-10">
        {/* Hub Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#e5dfc5] dark:border-[#2a3f31] pb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#7ca982]/15 px-3 py-1 text-xs font-semibold text-[#1d3122] dark:text-[#a3caa6] border border-[#7ca982]/30">
              <span>Tenant Hub</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#7ca982]" />
              <span>{user?.name ? `Welcome, ${user.name}` : "Verified Living"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ink tracking-tight">
              Tenant Lifestyle & Workspace
            </h1>
            <p className="text-sm sm:text-base text-ink-muted max-w-2xl">
              Access verified residences, track itemized RentTruth™ living costs, manage your roommate matching preferences, and access digital condition passports.
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
              href="/owner"
              className="rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark hover:bg-[#7ca982]/10 px-4 py-2.5 text-xs font-semibold text-ink transition-colors cursor-pointer"
            >
              Switch to Owner Portal →
            </Link>
          </div>
        </div>

        {/* Quick Tenancy Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Active Tenancy</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-lg font-bold text-ink">Courtyard Villa 2B</span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                Active
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">₹32,000/mo · Navrangpura</p>
          </div>

          <div className="rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Saved Residences</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif text-ink">{savedIds.length} Homes</span>
              <Link href="/properties?saved=true" className="text-xs text-[#57875d] dark:text-[#a3caa6] font-semibold hover:underline">
                View all →
              </Link>
            </div>
            <p className="mt-1 text-xs text-ink-muted">Direct contact with owners</p>
          </div>

          <div className="rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Next Rent Due</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif text-ink">₹32,000</span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">In 12 days</span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">RentTruth™ itemized breakdown</p>
          </div>

          <div className="rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Deposit Security</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif text-ink">100% Protected</span>
              <span className="text-emerald-600 text-xs font-bold">Verified</span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">Condition passport logged</p>
          </div>
        </div>

        {/* Primary Tenant Tools Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-serif text-ink">Tenant Suite & Discovery Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Explore Residences */}
            <Link
              href="/properties"
              className="group rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-6 hover:border-[#7ca982] hover:shadow-lg transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7ca982]/20 text-[#1d3122] dark:text-[#a3caa6] group-hover:scale-110 transition-transform">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-ink group-hover:text-[#57875d] transition-colors">
                Explore 4,750+ Residences
              </h3>
              <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
                Filter across 6 major metros by BHK, budget, furnishing status, and zero-brokerage direct listings.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-[#57875d] dark:text-[#a3caa6]">
                <span>Browse listings</span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* Card 2: Roommate Finder */}
            <Link
              href="/tenant/roommates"
              className="group rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-6 hover:border-[#7ca982] hover:shadow-lg transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 group-hover:scale-110 transition-transform">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-ink group-hover:text-[#57875d] transition-colors">
                Roommate Compatibility Matcher
              </h3>
              <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
                Match with verified working professionals and students based on sleep patterns, diet, and cleanliness.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Find compatible roommates</span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* Card 3: RentTruth Auditor */}
            <Link
              href="/renttruth/prop-navrang-02"
              className="group rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-6 hover:border-[#7ca982] hover:shadow-lg transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 group-hover:scale-110 transition-transform">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-ink group-hover:text-[#57875d] transition-colors">
                RentTruth™ Cost Auditor
              </h3>
              <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
                Full transparency over headline rent vs real monthly cost: society maintenance, bills, and deposit rules.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Audit living costs</span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* Card 4: Digital Condition Passport */}
            <Link
              href="/rental/rent-navrang/passport"
              className="group rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-6 hover:border-[#7ca982] hover:shadow-lg transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300 group-hover:scale-110 transition-transform">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-ink group-hover:text-[#57875d] transition-colors">
                Digital Move-in Passport
              </h3>
              <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
                Immutable photo inspection logs before handover. Protect your hard-earned security deposit.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-amber-700 dark:text-amber-300">
                <span>View condition report</span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* Card 5: Search Requirements */}
            <Link
              href="/tenant/requirements"
              className="group rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-6 hover:border-[#7ca982] hover:shadow-lg transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 group-hover:scale-110 transition-transform">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-ink group-hover:text-[#57875d] transition-colors">
                My Living Requirements
              </h3>
              <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
                Tune your preferred metro corridor, commute radius, budget cap, and lifestyle specifications.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                <span>Edit preferences</span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* Card 6: AI Lease Agreement */}
            <Link
              href="/ai/agreement"
              className="group rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-6 hover:border-[#7ca982] hover:shadow-lg transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-700 dark:text-rose-300 group-hover:scale-110 transition-transform">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-ink group-hover:text-[#57875d] transition-colors">
                AI Agreement Reviewer
              </h3>
              <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
                Scan rental contracts for unfair lock-in clauses, unexpected escalation percentages, and non-refundable deposits.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-rose-600 dark:text-rose-400">
                <span>Analyze agreement</span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
