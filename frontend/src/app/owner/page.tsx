"use client";

import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { useNivasa } from "@/store/nivasa-store";
import { formatInr } from "@/lib/format";

export default function OwnerHubPage() {
  const { user, drafts } = useNivasa();

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16 space-y-10">
        {/* Hub Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#e5dfc5] dark:border-[#2a3f31] pb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-900 dark:text-amber-200 border border-amber-500/30">
              <span>Owner Command Deck</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>{user?.name ? `Landlord: ${user.name}` : "Asset Management"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ink tracking-tight">
              Property Owner & Asset Management Hub
            </h1>
            <p className="text-sm sm:text-base text-ink-muted max-w-2xl">
              Publish verified properties to 4,750+ Indian metro listings, evaluate high-intent verified tenant applicants, draft legally validated lease agreements, and manage property ledgers.
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
              <span>+ List New Property</span>
            </Link>
            <Link
              href="/owner/dashboard"
              className="rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark hover:bg-[#7ca982]/10 px-4 py-2.5 text-xs font-semibold text-ink transition-colors cursor-pointer"
            >
              Open Full Deck →
            </Link>
          </div>
        </div>

        {/* Portfolio Quick Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Listed Properties</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif text-ink">{2 + drafts.length} Homes</span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                100% Occupied
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">{drafts.length} draft listings in progress</p>
          </div>

          <div className="rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Monthly Revenue</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif text-ink">₹82,000</span>
              <span className="text-emerald-600 text-xs font-semibold">+8.4% YoY</span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">2 active tenancy ledgers</p>
          </div>

          <div className="rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Tenant Applications</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif text-ink">4 Inquiries</span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">2 New</span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">Zero broker spam filter active</p>
          </div>

          <div className="rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Deposit Custody</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif text-ink">₹1,60,000</span>
              <span className="text-xs font-semibold text-ink-muted">Escrow</span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">Backed by condition passports</p>
          </div>
        </div>

        {/* Primary Owner Tools Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-serif text-ink">Landlord & Asset Command Center</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: List Property */}
            <Link
              href="/owner/properties/new"
              className="group rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-6 hover:border-amber-600 hover:shadow-lg transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-900 dark:text-amber-200 group-hover:scale-110 transition-transform">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-ink group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                List a Verified Residence
              </h3>
              <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
                Add your apartment, floor, or villa with BHK details, itemized maintenance, photo uploads, and tenant criteria.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-amber-700 dark:text-amber-300">
                <span>Start listing flow</span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* Card 2: AI Lease Agreement */}
            <Link
              href="/ai/agreement"
              className="group rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-6 hover:border-amber-600 hover:shadow-lg transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 group-hover:scale-110 transition-transform">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-ink group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                AI Lease Agreement Drafter
              </h3>
              <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
                Generate airtight, state-compliant Indian rental agreements with custom lock-in, escalation, and maintenance terms.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Draft legal agreement</span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* Card 3: Tenant Inquiries */}
            <Link
              href="/owner/dashboard#inquiries"
              className="group rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-6 hover:border-amber-600 hover:shadow-lg transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 group-hover:scale-110 transition-transform">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-ink group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                Tenant Applications & Leads
              </h3>
              <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
                Screen verified inquiries directly from prospects with verified employment and clean tenancy track records.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <span>Review tenant applications</span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* Card 4: Move-in Condition Passport */}
            <Link
              href="/rental/rent-navrang/passport"
              className="group rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-6 hover:border-amber-600 hover:shadow-lg transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-800 dark:text-amber-200 group-hover:scale-110 transition-transform">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-ink group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                Inspection & Condition Passports
              </h3>
              <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
                Log mutual photo condition before keys are handed over, preventing end-of-tenancy deposit disputes.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-amber-700 dark:text-amber-300">
                <span>Inspect passport records</span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* Card 5: Rent Ledgers & Receipts */}
            <Link
              href="/rental/rent-navrang/payments"
              className="group rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-6 hover:border-amber-600 hover:shadow-lg transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-700 dark:text-teal-300 group-hover:scale-110 transition-transform">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-ink group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                Rent Collection Ledgers
              </h3>
              <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
                Automated monthly rent tracking, maintenance pass-through receipts, and deposit reconciliation.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-teal-700 dark:text-teal-300">
                <span>View financial ledgers</span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* Card 6: Market Yield Radar */}
            <Link
              href="/dashboard"
              className="group rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-6 hover:border-amber-600 hover:shadow-lg transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-700 dark:text-purple-300 group-hover:scale-110 transition-transform">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                  <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-ink group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                Metro Rental Yield Intelligence
              </h3>
              <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
                Compare your rental yields against Mumbai (₹85k), Bangalore (₹25k), Chennai (₹22k), and Delhi benchmarks.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-purple-700 dark:text-purple-300">
                <span>Analyze market yields</span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
