"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PropertyCard } from "@/components/property/property-card";
import { Timeline } from "@/components/ui/timeline";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { activity, getProperty, maintenance, payments, properties } from "@/data/demo";
import { useNestora } from "@/store/nestora-store";
import { formatInr } from "@/lib/format";

export default function TenantDashboardPage() {
  const { savedIds, user } = useNestora();
  const saved = properties.filter((item) => savedIds.includes(item.id));
  const unpaid = payments.filter((item) => item.status !== "paid");

  return (
    <DashboardShell
      title={`Welcome back${user?.name ? `, ${user.name}` : ""}`}
      subtitle="Your active tenancy workspace, financial ledger, and saved architectural residences."
    >
      {/* 3 Metric Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/rental/rent-navrang"
          className="group relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md hover:border-blue-500/40 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Tenancy
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
            Navrangpura Courtyard
          </p>
          <p className="mt-1 text-xs text-slate-500">Ahmedabad · Verified Workspace →</p>
        </Link>

        <Link
          href="/rental/rent-navrang/payments"
          className="group relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md hover:border-blue-500/40 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Rent & Dues
            </span>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">
              {unpaid.length} Pending
            </span>
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
            {unpaid.length ? "Payment Due" : "All Clear"}
          </p>
          <p className="mt-1 text-xs text-slate-500">RentTruth™ itemized receipts →</p>
        </Link>

        <Link
          href="/rental/rent-navrang"
          className="group relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md hover:border-blue-500/40 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Maintenance
            </span>
            <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-600">
              {maintenance.filter((item) => item.status !== "resolved").length} In Progress
            </span>
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
            Ticket Records
          </p>
          <p className="mt-1 text-xs text-slate-500">Condition Passport & repairs →</p>
        </Link>
      </div>

      {/* Tenancy Notifications Feed */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Workspace Alerts</h2>
          <span className="text-xs text-slate-400">Live Sync</span>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                September rent is pending in the itemized ledger.
              </span>
            </div>
            <StatusBadge tone="warn">Due</StatusBadge>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-teal-500" />
              <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                Plumbing / kitchen tap repair ticket acknowledged by owner.
              </span>
            </div>
            <StatusBadge tone="ok">In Progress</StatusBadge>
          </div>
        </div>
      </div>

      {/* Saved Residences Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Shortlisted Residences</h2>
            <p className="text-xs text-slate-500 mt-0.5">Homes you have pinned for comparison</p>
          </div>
          <Button href="/homes" variant="line" size="sm">
            Browse All Homes →
          </Button>
        </div>
        {saved.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {saved.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center bg-slate-50/50 dark:bg-slate-900/30">
            <p className="text-sm text-slate-500">You haven&apos;t shortlisted any residences yet.</p>
            <div className="mt-4">
              <Button href="/homes" size="sm">
                Explore Available Residences
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Timeline */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Chronological Tenancy Log</h2>
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <Timeline events={activity} />
        </div>
      </div>

      {/* AI Tenancy Assistant Banner */}
      <div className="mt-10 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-teal-500/5 to-transparent p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Need tailored rental suggestions?</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Describe your preferred commute, sunlight preference, or family requirements in plain conversational language.
          </p>
        </div>
        <Button href="/ai/recommend" size="md">
          Ask NIVASA AI →
        </Button>
      </div>
    </DashboardShell>
  );
}
