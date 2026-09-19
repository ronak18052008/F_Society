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
          1. NIVASA SPATIAL HERO WITH DIRECT PRIMARY & SECONDARY CTAS
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

            {/* Primary & Secondary Hero CTAs */}
            <Reveal delay={0.25}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/properties"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#7ca982] hover:bg-[#68946e] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#7ca982]/25 hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Find Your Home</span>
                </Link>

                <Link
                  href="/owner/properties/new"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full border border-amber-600/40 bg-amber-500/10 hover:bg-amber-500/20 px-7 py-3.5 text-sm font-bold text-amber-900 dark:text-amber-200 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>List Your Property</span>
                </Link>
              </div>
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
            <Link href="/properties?city=Ahmedabad" className="rounded-full border border-line bg-card/70 px-3 py-1 hover:border-[#7ca982]/50 hover:text-ink transition">
              Ahmedabad
            </Link>
            <Link href="/properties?city=Bengaluru" className="rounded-full border border-line bg-card/70 px-3 py-1 hover:border-[#7ca982]/50 hover:text-ink transition">
              Bengaluru
            </Link>
            <Link href="/properties?city=Mumbai" className="rounded-full border border-line bg-card/70 px-3 py-1 hover:border-[#7ca982]/50 hover:text-ink transition">
              Mumbai
            </Link>
            <Link href="/properties?verified=true" className="rounded-full border border-line bg-card/70 px-3 py-1 hover:border-[#7ca982]/50 hover:text-ink transition">
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
          2. KEY PLATFORM BENEFITS (AI Match, Verified Listings, Secure Agreements, Direct Connect)
      ======================================================== */}
      <section className="py-16 sm:py-24 bg-card/60 border-b border-line">
        <div className="wrap">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#7ca982]/15 px-3.5 py-1 text-xs font-semibold text-[#1d3122] dark:text-[#a3caa6] border border-[#7ca982]/30">
                Core Innovations
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-ink tracking-tight">
                Designed for direct trust, not middleman friction.
              </h2>
              <p className="mt-4 text-ink-muted leading-relaxed">
                Nivasa re-engineers Indian residential renting with four uncompromising pillars of platform integrity.
              </p>
            </Reveal>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: AI Match */}
            <Reveal delay={0.1} className="rounded-3xl border border-line bg-card p-6 shadow-xs hover:border-[#7ca982] transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7ca982]/15 text-[#23452b] dark:text-[#a3caa6] group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-serif font-bold text-ink">AI Match</h3>
              <p className="mt-2 text-xs text-ink-muted leading-relaxed">
                Smart neural matching that pairs your commute preferences, light orientation, and lifestyle habits with genuine homes.
              </p>
            </Reveal>

            {/* Pillar 2: Verified Listings */}
            <Reveal delay={0.15} className="rounded-3xl border border-line bg-card p-6 shadow-xs hover:border-[#7ca982] transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-serif font-bold text-ink">Verified Listings</h3>
              <p className="mt-2 text-xs text-ink-muted leading-relaxed">
                Every property has verified ownership documents, physical spot checks, and 100% itemized RentTruth™ ledgers.
              </p>
            </Reveal>

            {/* Pillar 3: Secure Rent Agreements */}
            <Reveal delay={0.2} className="rounded-3xl border border-line bg-card p-6 shadow-xs hover:border-[#7ca982] transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-serif font-bold text-ink">Secure Agreements</h3>
              <p className="mt-2 text-xs text-ink-muted leading-relaxed">
                Bilingual, legally compliant rental contracts with digital Aadhaar e-Sign and automated clause-by-clause audit.
              </p>
            </Reveal>

            {/* Pillar 4: Direct Owner Connect */}
            <Reveal delay={0.25} className="rounded-3xl border border-line bg-card p-6 shadow-xs hover:border-[#7ca982] transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-800 dark:text-amber-200 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-serif font-bold text-ink">Direct Owner Connect</h3>
              <p className="mt-2 text-xs text-ink-muted leading-relaxed">
                Connect directly with property owners without aggressive brokerage calls, fake listings, or hidden markup fees.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. DEDICATED ROLE SECTIONS: FOR TENANTS & FOR OWNERS
      ======================================================== */}
      <section className="py-20 bg-paper border-b border-line">
        <div className="wrap">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* For Tenants Card */}
            <Reveal className="rounded-3xl border border-[#7ca982]/30 bg-card p-8 sm:p-10 shadow-card flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#7ca982]/15 px-3 py-1 text-xs font-semibold text-[#1d3122] dark:text-[#a3caa6] border border-[#7ca982]/30">
                  For Tenants
                </div>
                <h3 className="mt-4 text-2xl sm:text-3xl font-serif font-bold text-ink">
                  Rent without broker harassment or surprise fees.
                </h3>
                <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                  Everything you need to find, audit, and enjoy a home with full peace of mind.
                </p>

                <ul className="mt-6 space-y-3 text-xs text-ink">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#7ca982] font-bold text-sm">✓</span>
                    <span><strong>₹0 Brokerage Fees:</strong> Save ₹25,000–₹60,000 upfront on every move.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#7ca982] font-bold text-sm">✓</span>
                    <span><strong>RentTruth™ Itemized Outlay:</strong> Know the exact society maintenance, water, and parking costs upfront.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#7ca982] font-bold text-sm">✓</span>
                    <span><strong>Digital Condition Passport:</strong> Mutual move-in photo audit that dispute-proofs your security deposit.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#7ca982] font-bold text-sm">✓</span>
                    <span><strong>AI Lease Audit:</strong> Scan drafts automatically to flag unfair escalation and lock-in clauses.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#7ca982] font-bold text-sm">✓</span>
                    <span><strong>Roommate Compatibility Matcher:</strong> Find verified flatmates matching your sleep and work rhythm.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-line flex items-center justify-between">
                <Link
                  href="/properties"
                  className="inline-flex items-center gap-2 rounded-full bg-[#7ca982] text-white px-5 py-2.5 text-xs font-bold shadow-xs hover:bg-[#68946e] transition-all"
                >
                  <span>Browse Homes</span>
                  <span>→</span>
                </Link>
                <Link href="/login?intent=tenant" className="text-xs font-semibold text-[#57875d] dark:text-[#a3caa6] hover:underline">
                  Sign in as Tenant →
                </Link>
              </div>
            </Reveal>

            {/* For Owners Card */}
            <Reveal delay={0.15} className="rounded-3xl border border-amber-500/30 bg-card p-8 sm:p-10 shadow-card flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-900 dark:text-amber-200 border border-amber-500/30">
                  For Property Owners
                </div>
                <h3 className="mt-4 text-2xl sm:text-3xl font-serif font-bold text-ink">
                  Quality tenants. Frictionless property stewardship.
                </h3>
                <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                  List your residential assets directly to verified working professionals and families.
                </p>

                <ul className="mt-6 space-y-3 text-xs text-ink">
                  <li className="flex items-start gap-2.5">
                    <span className="text-amber-600 font-bold text-sm">✓</span>
                    <span><strong>Pre-Screened KYC Verified Tenants:</strong> Identity and background-vetted profiles before site visits.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-amber-600 font-bold text-sm">✓</span>
                    <span><strong>Zero Listing Commissions:</strong> Keep 100% of your rental returns without broker cuts.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-amber-600 font-bold text-sm">✓</span>
                    <span><strong>AI Lease Drafter:</strong> Generate state-compliant digital tenancy agreements in under 5 minutes.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-amber-600 font-bold text-sm">✓</span>
                    <span><strong>Applications & Inquiries Deck:</strong> 1-click approvals and real-time prospective tenant inquiries.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-amber-600 font-bold text-sm">✓</span>
                    <span><strong>Maintenance & Yield Analytics:</strong> Track repair tickets and benchmark rental yield across metro corridors.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-line flex items-center justify-between">
                <Link
                  href="/owner/properties/new"
                  className="inline-flex items-center gap-2 rounded-full bg-amber-700 text-white px-5 py-2.5 text-xs font-bold shadow-xs hover:bg-amber-800 transition-all"
                >
                  <span>+ List Your Property</span>
                  <span>→</span>
                </Link>
                <Link href="/login?intent=owner" className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline">
                  Sign in as Owner →
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. HOW NIVASA WORKS (4-STEP FLOW)
      ======================================================== */}
      <section className="py-20 bg-card border-b border-line">
        <div className="wrap">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#7ca982]/15 px-3 py-1 text-xs font-semibold text-[#1d3122] dark:text-[#a3caa6] border border-[#7ca982]/30">
                Simple & Transparent
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-serif font-bold text-ink tracking-tight">
                How Nivasa Works
              </h2>
              <p className="mt-3 text-sm text-ink-muted">
                From discovery to key handover, an orderly 4-step digital journey.
              </p>
            </Reveal>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Reveal delay={0.1} className="relative rounded-3xl border border-line bg-paper p-6 shadow-xs">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7ca982] text-white text-xs font-bold">
                1
              </span>
              <h3 className="mt-4 text-base font-bold font-serif text-ink">Discover & AI Match</h3>
              <p className="mt-2 text-xs text-ink-muted leading-relaxed">
                Filter verified residences across top metro corridors. Use our AI Copilot to match your lifestyle and commute needs.
              </p>
            </Reveal>

            <Reveal delay={0.2} className="relative rounded-3xl border border-line bg-paper p-6 shadow-xs">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7ca982] text-white text-xs font-bold">
                2
              </span>
              <h3 className="mt-4 text-base font-bold font-serif text-ink">Direct Connect & Visit</h3>
              <p className="mt-2 text-xs text-ink-muted leading-relaxed">
                Directly chat with property owners. Schedule physical walk-throughs or interactive 3D virtual habitat tours.
              </p>
            </Reveal>

            <Reveal delay={0.3} className="relative rounded-3xl border border-line bg-paper p-6 shadow-xs">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7ca982] text-white text-xs font-bold">
                3
              </span>
              <h3 className="mt-4 text-base font-bold font-serif text-ink">Smart Agreement & Passport</h3>
              <p className="mt-2 text-xs text-ink-muted leading-relaxed">
                Sign digitally with Aadhaar e-Sign. Mutually record and freeze move-in condition photos to secure your deposit.
              </p>
            </Reveal>

            <Reveal delay={0.4} className="relative rounded-3xl border border-line bg-paper p-6 shadow-xs">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7ca982] text-white text-xs font-bold">
                4
              </span>
              <h3 className="mt-4 text-base font-bold font-serif text-ink">Move In & Shared Ledger</h3>
              <p className="mt-2 text-xs text-ink-muted leading-relaxed">
                Pay rent with itemized receipts, log maintenance tickets, and enjoy a dispute-proof, transparent tenancy.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. 8-STEP RENTAL LIFECYCLE & FEATURE TEASERS
      ======================================================== */}
      <LifecycleSection />
      <FeatureTeasers />
      <EditorialVideo />

      {/* ========================================================
          6. CITY DISCOVERY & METROPOLITAN HUBS
      ======================================================== */}
      <section className="border-t border-line bg-card">
        <div className="wrap">
          <CityDiscovery />
        </div>
      </section>

      {/* ========================================================
          7. SELECTED HORIZON RESIDENCES
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
          8. INVITATION / ONBOARDING DOCK
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
