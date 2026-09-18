import { SiteShell } from "@/components/layout/site-shell";
import { ArchitecturalHero } from "@/components/three/architectural-hero";
import { Button } from "@/components/ui/button";
import { Reveal, StaggerIn } from "@/components/motion/reveal";
import { PropertyCard } from "@/components/property/property-card";
import { LifecycleSection } from "@/components/landing/lifecycle-section";
import { FeatureTeasers } from "@/components/landing/feature-teasers";
import { EditorialVideo } from "@/components/landing/editorial-video";
import { properties } from "@/data/demo";

export default function HomePage() {
  const featuredProperties = properties.slice(0, 3);

  return (
    <SiteShell>
      {/* ========================================================
          1. EDITORIAL HERO SECTION WITH 3D RESIDENCE
      ======================================================== */}
      <section className="relative grid min-h-[92vh] items-stretch lg:grid-cols-[1.08fr_0.92fr] border-b border-line">
        {/* Left Editorial Narrative */}
        <div className="flex flex-col justify-center px-6 py-16 sm:px-10 md:px-14 lg:py-24 xl:py-28 bg-paper">
          <div className="max-w-xl">
            {/* Kicker with prototype notice */}
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-bronze" />
              <p className="kicker-bronze">
                Rental lifecycle, made legible · Prototype v0.1
              </p>
            </div>

            {/* Display Heading */}
            <h1 className="display-lg mt-6 text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-ink">
              Rent with the full picture in view.
            </h1>

            {/* Editorial Lede */}
            <p className="lede mt-6 max-w-lg text-base sm:text-lg text-ink-soft">
              Nestora connects tenants and owners across discovery, true unbundled
              costs, mutual agreements, and move-in condition — without hiding
              estimates as facts or forcing broker intermediaries.
            </p>

            {/* Primary / Secondary CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button href="/homes" size="lg">
                Explore homes
              </Button>
              <Button href="/register?intent=owner" variant="line" size="lg">
                List your property
              </Button>
            </div>

            {/* Subtle Hero Metadata Principles */}
            <div className="mt-14 border-t border-line/70 pt-6 grid grid-cols-3 gap-4 font-mono text-[11px] text-ink-soft">
              <div>
                <span className="block font-semibold text-ink uppercase tracking-wider">
                  RentTruth™
                </span>
                <span className="text-[10px] text-ink-soft/80">Itemized cost receipts</span>
              </div>
              <div>
                <span className="block font-semibold text-ink uppercase tracking-wider">
                  Passport
                </span>
                <span className="text-[10px] text-ink-soft/80">Timestamped condition</span>
              </div>
              <div>
                <span className="block font-semibold text-ink uppercase tracking-wider">
                  Direct
                </span>
                <span className="text-[10px] text-ink-soft/80">No broker distortion</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 3D Architectural Visual Canvas */}
        <div className="relative min-h-[460px] sm:min-h-[520px] lg:min-h-full border-t border-line lg:border-l lg:border-t-0 bg-[#110f0d]">
          <ArchitecturalHero />
        </div>
      </section>

      {/* ========================================================
          2. EDITORIAL MANIFESTO / PROTOTYPE STATEMENT
      ======================================================== */}
      <section className="section-lg bg-paper text-ink border-b border-line">
        <div className="wrap">
          <Reveal>
            <div className="max-w-4xl">
              <p className="kicker-bronze">The Core Idea</p>
              <h2 className="display mt-4 text-4xl sm:text-5xl md:text-6xl tracking-tight text-ink">
                A shared record for a relationship that usually lives in chats,
                PDFs, and contested memory.
              </h2>
              <p className="lede mt-6 max-w-2xl text-base sm:text-lg text-ink-soft">
                Tenancy agreements, security deposits, routine repairs, and move-out
                inspections shouldn&apos;t depend on who took screenshots. Nestora provides
                a single living record for both parties from day zero.
              </p>

              <div className="mt-8 inline-flex items-center gap-3 border border-line bg-paper-2/60 px-4 py-2 text-xs font-mono text-ink-soft">
                <span className="h-2 w-2 rounded-full bg-bronze" />
                <span>Working prototype: demo listings are labeled and state is stored locally.</span>
              </div>
            </div>
          </Reveal>
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
          5. REUSABLE EDITORIAL VIDEO THEATER
      ======================================================== */}
      <EditorialVideo />

      {/* ========================================================
          6. PREMIUM / SAMPLE LISTINGS PREVIEW SECTION
      ======================================================== */}
      <section className="section-lg bg-paper text-ink border-t border-line">
        <div className="wrap">
          {/* Section Header */}
          <Reveal>
            <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-line pb-6">
              <div>
                <p className="kicker-bronze">Selected Residences</p>
                <h2 className="display mt-2 text-4xl sm:text-5xl tracking-tight">
                  Homes currently on the board
                </h2>
                <p className="mt-2 text-sm text-ink-soft">
                  Verified dimensions, itemized fee structures, and direct owner channels.
                </p>
              </div>
              <Button href="/homes" variant="line">
                View all residences ({properties.length}) →
              </Button>
            </div>
          </Reveal>

          {/* Properties Grid */}
          <StaggerIn
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            selector=".property-card-wrap"
          >
            {featuredProperties.map((property) => (
              <div key={property.id} className="property-card-wrap">
                <PropertyCard property={property} />
              </div>
            ))}
          </StaggerIn>

          {/* Bottom City Directory Bar */}
          <Reveal delay={0.2} className="mt-14 border border-line bg-paper-2/40 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <h3 className="font-serif text-2xl font-medium">
                  Seeking residences in Ahmedabad, Bengaluru, or Pune?
                </h3>
                <p className="mt-1 text-sm text-ink-soft">
                  Filter by transit corridors, verified balconies, and realistic utility estimates.
                </p>
              </div>
              <Button href="/homes" variant="primary">
                Browse Directory
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================================================
          7. INVITATION / ONBOARDING GATEWAY
      ======================================================== */}
      <section className="section-lg border-t border-line bg-paper-2 text-ink">
        <div className="wrap">
          <Reveal>
            <div className="mx-auto max-w-4xl text-center">
              <p className="kicker-bronze">Get Started with Nestora</p>
              <h2 className="display mt-4 text-4xl sm:text-5xl md:text-6xl tracking-tight">
                Ready for a rental experience built on clarity?
              </h2>
              <p className="lede mx-auto mt-6 max-w-2xl text-base sm:text-lg">
                Join our prototype as a tenant searching for an unvarnished living space
                or as an owner looking for respectful, verified residents.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Button href="/register?intent=tenant" size="lg">
                  Start as Tenant
                </Button>
                <Button href="/register?intent=owner" variant="line" size="lg">
                  Start as Property Owner
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
