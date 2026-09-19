"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNivasa } from "@/store/nivasa-store";
import { SiteShell } from "@/components/layout/site-shell";
import { MarketTrends } from "@/components/dashboard/market-trends";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useNivasa();

  useEffect(() => {
    // If logged in, dispatch directly to active workspace
    if (user) {
      if (user.role === "owner") {
        router.replace("/owner/dashboard");
      } else {
        router.replace("/tenant/dashboard");
      }
    }
  }, [user, router]);

  // If unauthenticated, show Market Trends & Housing Intelligence command center
  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Guest Banner */}
        <div className="mb-10 rounded-3xl border border-[var(--border-subtle)] bg-gradient-to-r from-[var(--primary-pista-subtle)] via-[var(--bg-canvas)] to-transparent p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-card">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-pista)] px-3.5 py-1 text-xs font-semibold text-white">
              Nivasa Workspace Hub
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-serif font-bold text-[var(--text-main)] tracking-tight">
              Metropolitan Housing Telemetry & Dashboard
            </h1>
            <p className="mt-1 max-w-xl text-xs sm:text-sm text-[var(--text-muted)]">
              Access real-time aggregates across 4,746+ verified residences. Sign in to open your private resident or property owner workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/login?next=/dashboard"
              className="rounded-full bg-[var(--primary-pista)] hover:bg-[var(--primary-pista-hover)] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:shadow-md transition cursor-pointer"
            >
              Sign In to Workspace
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-[var(--border)] bg-card px-5 py-2.5 text-xs font-semibold text-[var(--text-main)] hover:border-[var(--primary-pista)] transition shadow-xs"
            >
              Create Free Account
            </Link>
          </div>
        </div>

        {/* Live Market Trends Analytics */}
        <MarketTrends />
      </div>
    </SiteShell>
  );
}
