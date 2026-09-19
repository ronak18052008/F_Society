"use client";

import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

export function FeatureTeasers() {
  return (
    <section className="section bg-paper border-t border-line">
      <div className="wrap grid gap-8 lg:grid-cols-2">
        {/* ========================================================
            TEASER 1: RentTruth™ Cost Dissection
        ======================================================== */}
        <div className="rounded-3xl border border-line bg-card p-8 sm:p-10 shadow-card flex flex-col justify-between">
          <Reveal>
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-forest)]/15 px-3 py-1 text-xs font-semibold text-[var(--accent-forest)] border border-[var(--accent-forest)]/30">
                  Cost Transparency
                </span>
                <span className="rounded-full bg-paper border border-line px-3 py-1 text-xs font-bold text-ink-muted">
                  RentTruth™
                </span>
              </div>

              <h2 className="display mt-6 text-2xl sm:text-4xl font-serif font-bold tracking-tight text-ink">
                Headline rent is rarely what you actually pay.
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-ink-muted">
                Maintenance fees, hidden parking charges, power surcharges, and unexpected one-off deposits are usually concealed until the lease is signed. RentTruth brings total financial honesty upfront.
              </p>

              {/* Modern Breakdown Card Mock */}
              <div className="mt-8 rounded-2xl border border-line bg-paper p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <span className="text-ink-muted font-medium">Base Monthly Rent</span>
                  <span className="font-bold text-ink font-tabular">₹28,000</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <span className="text-ink-muted font-medium">Society Maintenance (Owner Verified)</span>
                  <span className="font-bold text-ink font-tabular">+ ₹3,200</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <span className="text-ink-muted font-medium">Covered Parking (Assigned)</span>
                  <span className="font-bold text-ink font-tabular">+ ₹1,000</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <span className="text-ink-muted font-medium">Estimated Power & Water (Tenant Avg)</span>
                  <span className="font-bold text-ink font-tabular">+ ₹2,400</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-sm font-semibold">
                  <span className="text-ink">True Estimated Monthly Outflow</span>
                  <span className="text-[var(--accent-forest)] font-serif font-bold font-tabular text-lg">₹34,600</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button href="/renttruth/prop-navrang-02" variant="primary">
                Audit RentTruth Breakdown
              </Button>
              <Link
                href="/homes"
                className="text-xs font-semibold text-ink-muted hover:text-[var(--primary-pista)] transition-colors"
              >
                Compare verified listings →
              </Link>
            </div>
          </Reveal>
        </div>

        {/* ========================================================
            TEASER 2: Property Condition Passport
        ======================================================== */}
        <div className="rounded-3xl border border-line bg-card p-8 sm:p-10 shadow-card flex flex-col justify-between">
          <Reveal delay={0.15}>
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--secondary-sage)]/20 px-3 py-1 text-xs font-semibold text-[var(--text-main)] border border-[var(--secondary-sage)]/30">
                  Move-In Protection
                </span>
                <span className="rounded-full bg-paper border border-line px-3 py-1 text-xs font-bold text-ink-muted">
                  Condition Passport
                </span>
              </div>

              <h2 className="display mt-6 text-2xl sm:text-4xl font-serif font-bold tracking-tight text-ink">
                Photograph the home as you found it. Jointly.
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-ink-muted">
                Security deposit disputes are the #1 source of tenant anxiety.
                Condition Passport creates an immutable photographic baseline of walls, appliances,
                and wear before the tenancy starts.
              </p>

              {/* Modern Passport Room Timeline Mock */}
              <div className="mt-8 rounded-2xl border border-line bg-paper p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--accent-forest)] shadow-glow" />
                    <span className="font-semibold text-ink">Living Room & Balcony</span>
                  </div>
                  <span className="text-ink-muted">4 verified photos</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--accent-forest)] shadow-glow" />
                    <span className="font-semibold text-ink">Master Bedroom & Bath</span>
                  </div>
                  <span className="text-ink-muted">6 verified photos</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--accent-forest)] shadow-glow" />
                    <span className="font-semibold text-ink">Kitchen & Utility Fixtures</span>
                  </div>
                  <span className="text-ink-muted">3 verified photos</span>
                </div>
                <div className="pt-1 text-ink-muted text-[11px] leading-relaxed">
                  Cryptographically timestamped and stored in Supabase. Neither party can alter inspection photos after mutual sign-off.
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button href="/rental/rent-navrang/passport" variant="line">
                Open Condition Passport
              </Button>
              <Link
                href="/how-it-works"
                className="text-xs font-semibold text-ink-muted hover:text-[var(--accent-forest)] transition-colors"
              >
                How protection works →
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
