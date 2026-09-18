import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { ArchitecturalHero } from "@/components/three/architectural-hero";
import { Button } from "@/components/ui/button";
import { Reveal, StaggerIn } from "@/components/motion/reveal";
import { PropertyCard } from "@/components/property/property-card";
import { LifecycleSection } from "@/components/landing/lifecycle-section";
import { FeatureTeasers } from "@/components/landing/feature-teasers";
import { EditorialVideo } from "@/components/landing/editorial-video";
import { CityDiscovery } from "@/components/city/city-discovery";
import { properties } from "@/data/demo";

export default function HomePage() {
  const featuredProperties = properties.slice(0, 3);

  return (
    <SiteShell>
      {/* ========================================================
          1. NIVASA SPATIAL HERO WITH INTEGRATED 3D HABITAT
      ======================================================== */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
        {/* Ambient atmospheric glows */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#6E9271]/15 via-[#8FA89B]/10 to-transparent blur-3xl opacity-70 -z-10" />
        <div className="pointer-events-none absolute top-1/3 -left-32 w-96 h-96 bg-[#6E9271]/10 blur-3xl rounded-full -z-10" />
        <div className="pointer-events-none absolute top-1/2 -right-32 w-96 h-96 bg-[#8FA89B]/10 blur-3xl rounded-full -z-10" />

        <div className="wrap">
          {/* Top Pill / Platform Status */}
          <div className="flex justify-center">
            <Reveal>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#7ca982]/30 bg-[#7ca982]/10 px-4 py-1.5 backdrop-blur-md shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7ca982] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7ca982] dark:bg-[#a3caa6]"></span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#23452b] dark:text-[#a3caa6]">
                  Nivasa Residential Network · v2.4
                </span>
              </div>
            </Reveal>
          </div>

          {/* Hero Headlines */}
          <div className="mx-auto mt-8 max-w-4xl text-center">
            <Reveal delay={0.1}>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold tracking-tight text-ink leading-[1.08]">
                Living,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#57875d] via-[#7ca982] to-[#96bd9b] dark:from-[#a3caa6] dark:via-[#7ca982] dark:to-[#96bd9b]">
                  Harmonized.
                </span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 text-lg sm:text-xl text-ink-muted max-w-2xl mx-auto font-normal leading-relaxed">
                Direct tenancy without broker distortion. Experience verified residences,
                transparent RentTruth™ itemized ledgers, digital Condition Passports, and autonomous AI lease audits.
              </p>
            </Reveal>
          </div>

          {/* Floating Search Dock */}
          <div className="mx-auto mt-10 max-w-3xl">
            <Reveal delay={0.3}>
              <div className="rounded-2xl sm:rounded-full border border-line bg-card p-2 sm:p-2.5 shadow-card backdrop-blur-xl transition-all">
                <form
                  action="/properties"
                  method="GET"
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                >
                  {/* City selector */}
                  <div className="flex items-center gap-3 px-4 py-2.5 flex-1">
                    <svg className="w-5 h-5 text-[#6E9271] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="w-full text-left">
                      <label htmlFor="city" className="block text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                        Location
                      </label>
                      <input
                        id="city"
                        type="text"
                        name="city"
                        placeholder="Ahmedabad, Bengaluru, Pune..."
                        className="w-full bg-transparent text-sm font-medium text-ink placeholder:text-ink-muted/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="hidden sm:block w-[1px] h-8 bg-line" />

                  {/* Configuration Select */}
                  <div className="flex items-center gap-3 px-4 py-2.5 sm:w-44">
                    <svg className="w-5 h-5 text-[#8FA89B] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <div className="w-full text-left">
                      <label htmlFor="bedrooms" className="block text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                        Layout
                      </label>
                      <select
                        id="bedrooms"
                        name="bedrooms"
                        className="w-full bg-transparent text-sm font-medium text-ink focus:outline-none cursor-pointer"
                      >
                        <option value="">Any Layout</option>
                        <option value="1">1 BHK Residence</option>
                        <option value="2">2 BHK Residence</option>
                        <option value="3">3+ BHK Residence</option>
                      </select>
                    </div>
                  </div>

                  {/* Search Button */}
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-full bg-[#7ca982] hover:bg-[#6b9a71] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#7ca982]/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Discover Homes</span>
                  </button>
                </form>
              </div>
            </Reveal>
          </div>

          {/* Quick Filter Tags */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-ink-muted">
            <span className="font-medium">Popular:</span>
            <Link href="/homes?city=Ahmedabad" className="rounded-full border border-line bg-card/70 px-3 py-1 hover:border-[#7ca982]/50 hover:text-ink transition">
              Ahmedabad
            </Link>
            <Link href="/homes?city=Bengaluru" className="rounded-full border border-line bg-card/70 px-3 py-1 hover:border-[#7ca982]/50 hover:text-ink transition">
              Bengaluru
            </Link>
            <Link href="/homes?verified=true" className="rounded-full border border-line bg-card/70 px-3 py-1 hover:border-[#7ca982]/50 hover:text-ink transition">
              RentTruth™ Verified Only
            </Link>
          </div>

          {/* 3D Nivasa Spatial Habitat Showcase */}
          <div className="mt-12 sm:mt-16">
            <Reveal delay={0.4}>
              <div className="relative mx-auto max-w-5xl rounded-3xl border border-line bg-card p-2 sm:p-3 shadow-card">
                <div className="relative h-[480px] sm:h-[560px] w-full overflow-hidden rounded-2xl bg-[#050a17]">
                  <ArchitecturalHero />
                </div>
              </div>
            </Reveal>
          </div>

          {/* Trust Metrics Bar */}
          <div className="mt-14 border-y border-line py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#57875d] dark:text-[#a3caa6]">₹0</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">Brokerage Overhead</p>
                <p className="text-[11px] text-ink-muted/80 mt-0.5">Direct tenant-owner contracts</p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#7ca982]">100%</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">Itemized RentTruth™</p>
                <p className="text-[11px] text-ink-muted/80 mt-0.5">Every rupee unbundled upfront</p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#96bd9b]">Day 0</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">Condition Passport</p>
                <p className="text-[11px] text-ink-muted/80 mt-0.5">Dispute-proof move-in logs</p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#57875d] dark:text-[#a3caa6]">Gemini 2.5</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">AI Lease Audit</p>
                <p className="text-[11px] text-ink-muted/80 mt-0.5">Automated clause risk analysis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. NIVASA ECOSYSTEM BENTO GRID
      ======================================================== */}
      <section className="py-16 sm:py-24 bg-card/40 border-b border-line">
        <div className="wrap">
          <div className="max-w-2xl">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#6E9271]/15 px-3.5 py-1 text-xs font-semibold text-[#6E9271] dark:text-[#A3B899] border border-[#6E9271]/30">
                Architectural Clarity
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-ink tracking-tight">
                A shared record for a relationship that usually lives in chaos.
              </h2>
              <p className="mt-4 text-ink-muted leading-relaxed">
                Security deposits, maintenance emergencies, unexpected escalations, and move-out inspections
                shouldn’t hinge on fragmented WhatsApp chats or selective memory.
              </p>
            </Reveal>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: RentTruth */}
            <Reveal className="group relative rounded-3xl border border-line bg-card p-8 shadow-card hover:shadow-card-hover hover:border-[#6E9271]/50 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6E9271]/15 text-[#6E9271] group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-serif font-bold text-ink">RentTruth™ Unbundled</h3>
              <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                See true monthly outlay: base rent, society maintenance, water, parking, and clubhouse dues itemized separately before you schedule a visit.
              </p>
              <div className="mt-6 pt-4 border-t border-line">
                <span className="text-xs font-semibold text-[#6E9271] group-hover:underline">
                  Explore cost transparency →
                </span>
              </div>
            </Reveal>

            {/* Bento Card 2: Condition Passport */}
            <Reveal delay={0.1} className="group relative rounded-3xl border border-line bg-card p-8 shadow-card hover:shadow-card-hover hover:border-[#7ca982]/50 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#96bd9b]/20 text-[#1d3122] dark:text-[#a3caa6] group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-serif font-bold text-ink">Condition Passport</h3>
              <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                Cryptographically signed move-in condition photos. Pre-existing wall scuffs, appliance status, and key handover verified mutually on day zero.
              </p>
              <div className="mt-6 pt-4 border-t border-line">
                <span className="text-xs font-semibold text-[#57875d] dark:text-[#a3caa6] group-hover:underline">
                  Protect security deposit →
                </span>
              </div>
            </Reveal>

            {/* Bento Card 3: AI Lease Analysis */}
            <Reveal delay={0.2} className="group relative rounded-3xl border border-line bg-card p-8 shadow-card hover:shadow-card-hover hover:border-[#6E9271]/50 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6E9271]/15 text-[#6E9271] group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-serif font-bold text-ink">AI Lease Intelligence</h3>
              <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                Gemini 2.5 scans rental agreements for predatory lock-ins, excessive rent escalation clauses, and ambiguous maintenance responsibilities.
              </p>
              <div className="mt-6 pt-4 border-t border-line">
                <span className="text-xs font-semibold text-[#6E9271] group-hover:underline">
                  Analyze agreement draft →
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. 8-STEP RENTAL LIFECYCLE SECTION
      ======================================================== */}
      <LifecycleSection />

      {/* ========================================================
          4. FEATURE TEASERS: RENTTRUTH & CONDITION PASSPORT
      ======================================================== */}
      <FeatureTeasers />

      {/* ========================================================
          5. EDITORIAL VIDEO / WALKTHROUGH THEATER
      ======================================================== */}
      <EditorialVideo />

      {/* ========================================================
          5.5 CITY DISCOVERY & METROPOLITAN HUBS
      ======================================================== */}
      <section className="border-t border-line bg-card">
        <div className="wrap">
          <CityDiscovery />
        </div>
      </section>

      {/* ========================================================
          6. SELECTED HORIZON RESIDENCES
      ======================================================== */}
      <section className="py-20 bg-paper border-t border-line">
        <div className="wrap">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-10 border-b border-line">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#6E9271]/15 px-3.5 py-1 text-xs font-semibold text-[#6E9271] dark:text-[#A3B899] border border-[#6E9271]/30">
                Selected Residences
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-serif font-bold text-ink tracking-tight">
                Architectural Homes On Board
              </h2>
              <p className="mt-2 text-sm text-ink-muted">
                Verified floorplans, transparent maintenance breakdowns, and direct owner discussions.
              </p>
            </div>
            <Button href="/properties" variant="outline" size="md">
              View All 4,746+ Residences →
            </Button>
          </div>

          <StaggerIn
            className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            selector=".property-card-wrap"
          >
            {featuredProperties.map((property) => (
              <div key={property.id} className="property-card-wrap">
                <PropertyCard property={property} />
              </div>
            ))}
          </StaggerIn>
        </div>
      </section>

      {/* ========================================================
          7. INVITATION / ONBOARDING DOCK
      ======================================================== */}
      <section className="py-24 bg-gradient-to-b from-paper to-card border-t border-line">
        <div className="wrap">
          <Reveal>
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#7ca982]/30 bg-[#7ca982]/15 px-3.5 py-1 text-xs font-semibold text-[#23452b] dark:text-[#a3caa6]">
                Join the Network
              </div>
              <h2 className="mt-4 text-4xl sm:text-5xl font-serif font-bold text-ink tracking-tight">
                Step into clarity. Choose your entry point.
              </h2>
              <p className="mt-4 text-base sm:text-lg text-ink-muted max-w-2xl mx-auto">
                Whether seeking an unvarnished home with zero brokerage or an owner wanting verified, respectful tenants with a shared ledger.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Button href="/register?intent=tenant" size="lg" variant="primary">
                  Explore as Tenant
                </Button>
                <Button href="/register?intent=owner" variant="outline" size="lg">
                  List Property as Owner
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
