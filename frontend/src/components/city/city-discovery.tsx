"use client";

import Image from "next/image";
import Link from "next/link";
import { formatInr } from "@/lib/format";
import type { CityMarketStat } from "@/lib/supabase/properties";

interface CityDiscoveryProps {
  stats?: CityMarketStat[];
  title?: string;
  subtitle?: string;
}

const DEFAULT_METROS: CityMarketStat[] = [
  {
    city: "Mumbai",
    totalListings: 972,
    avgRent: 85321,
    avgSize: 906,
    popularBhk: "2 BHK",
    minRent: 4500,
    maxRent: 1200000,
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80"
  },
  {
    city: "Bangalore",
    totalListings: 886,
    avgRent: 24966,
    avgSize: 986,
    popularBhk: "2 BHK",
    minRent: 3500,
    maxRent: 3500000,
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80"
  },
  {
    city: "Delhi",
    totalListings: 605,
    avgRent: 29462,
    avgSize: 786,
    popularBhk: "2 BHK",
    minRent: 2000,
    maxRent: 530000,
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80"
  },
  {
    city: "Chennai",
    totalListings: 891,
    avgRent: 21614,
    avgSize: 1032,
    popularBhk: "2 BHK",
    minRent: 3000,
    maxRent: 600000,
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
  },
  {
    city: "Hyderabad",
    totalListings: 868,
    avgRent: 20555,
    avgSize: 1187,
    popularBhk: "2 BHK",
    minRent: 1200,
    maxRent: 400000,
    image: "https://images.unsplash.com/photo-1605007493699-ce65834f8a00?auto=format&fit=crop&w=1200&q=80"
  },
  {
    city: "Kolkata",
    totalListings: 524,
    avgRent: 11645,
    avgSize: 787,
    popularBhk: "2 BHK",
    minRent: 1500,
    maxRent: 180000,
    image: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80"
  }
];

export function CityDiscovery({
  stats = DEFAULT_METROS,
  title = "Metropolitan Rental Hubs",
  subtitle = "Aggregated market statistics across India's top 6 residential rental corridors from the 4,746-record dataset."
}: CityDiscoveryProps) {
  return (
    <section className="py-12 sm:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#6E9271]/15 px-3 py-1 text-xs font-semibold text-[#284431] dark:text-[#A3B899] border border-[#6E9271]/30">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6E9271]" />
            Real Database Aggregates
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-serif font-bold tracking-tight text-ink">
            {title}
          </h2>
          <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-ink-muted leading-relaxed">
            {subtitle}
          </p>
        </div>

        <Link
          href="/properties"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6E9271] dark:text-[#A3B899] hover:underline cursor-pointer"
        >
          <span>Explore All 4,746 Listings</span>
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      {/* Grid of 6 Metros */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((metro) => {
          const filterHref = `/properties?city=${encodeURIComponent(metro.city)}`;

          return (
            <div
              key={metro.city}
              className="group relative flex flex-col rounded-3xl border border-line bg-card overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-[#6E9271]/50"
            >
              {/* Skyline Banner */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-paper">
                <Link href={filterHref} className="block h-full w-full">
                  <Image
                    src={metro.image}
                    alt={`${metro.city} skyline`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized
                  />
                </Link>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* City Name & Total Listings Pill */}
                <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between z-10">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-white tracking-tight">
                      {metro.city}
                    </h3>
                    <span className="text-[11px] font-medium text-[#D8E6D3]">
                      {metro.totalListings.toLocaleString()} Active Listings
                    </span>
                  </div>

                  <Link
                    href={filterHref}
                    className="rounded-full bg-white/90 dark:bg-[#1A281F]/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-[#284431] dark:text-[#A3B899] shadow-sm hover:scale-105 transition"
                  >
                    View City →
                  </Link>
                </div>
              </div>

              {/* Statistics Bento Bar */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-line/60 bg-paper p-2.5">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                      Avg Rent
                    </span>
                    <strong className="block mt-0.5 text-xs sm:text-sm font-serif font-bold text-ink font-tabular">
                      {formatInr(metro.avgRent)}
                    </strong>
                  </div>

                  <div className="rounded-xl border border-line/60 bg-paper p-2.5">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                      Avg Size
                    </span>
                    <strong className="block mt-0.5 text-xs sm:text-sm font-serif font-bold text-ink font-tabular">
                      {metro.avgSize} sqft
                    </strong>
                  </div>

                  <div className="rounded-xl border border-line/60 bg-paper p-2.5">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                      Top BHK
                    </span>
                    <strong className="block mt-0.5 text-xs sm:text-sm font-serif font-bold text-[#6E9271] dark:text-[#A3B899]">
                      {metro.popularBhk}
                    </strong>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-[11px] text-ink-muted">
                  <span>
                    Range: <strong className="text-ink font-tabular">{formatInr(metro.minRent)}</strong> – <strong className="text-ink font-tabular">{formatInr(metro.maxRent)}</strong>
                  </span>

                  <Link
                    href={filterHref}
                    className="font-semibold text-[#6E9271] dark:text-[#A3B899] hover:underline"
                  >
                    Filter {metro.city}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
