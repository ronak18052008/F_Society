import { SiteShell } from "@/components/layout/site-shell";
import { CityDiscovery } from "@/components/city/city-discovery";
import { getCityMarketStats } from "@/lib/supabase/properties";
import Link from "next/link";

export default async function CitiesPage() {
  const stats = await getCityMarketStats();

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Editorial Header */}
        <div className="max-w-3xl pb-8 border-b border-line">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#7ca982]/15 px-3.5 py-1 text-xs font-semibold text-[#1d3122] dark:text-[#a3caa6] border border-[#7ca982]/30">
            India Metropolitan Housing Telemetry · Live Metropolitan Index
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-ink">
            City Exploration & Housing Analytics
          </h1>
          <p className="mt-3 text-sm sm:text-base text-ink-muted leading-relaxed">
            Direct access to rental metrics across Mumbai, Bangalore, Delhi, Chennai, Hyderabad, and Kolkata. Derived from 4,746 verified listings with zero broker commissions and itemized RentTruth™ outlays.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/properties"
              className="rounded-full bg-[#7ca982] hover:bg-[#6b9a71] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:shadow-md transition cursor-pointer"
            >
              Browse All Listings →
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-line bg-card px-5 py-2.5 text-xs font-semibold text-ink hover:border-[#7ca982] transition shadow-xs"
            >
              Market Trends Dashboard
            </Link>
          </div>
        </div>

        {/* City Discovery Section */}
        <CityDiscovery stats={stats} />
      </div>
    </SiteShell>
  );
}
