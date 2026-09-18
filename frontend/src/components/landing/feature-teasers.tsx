"use client";

import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

export function FeatureTeasers() {
  return (
    <section className="border-t border-line bg-paper text-ink">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-line">
        {/* ========================================================
            TEASER 1: RentTruth™ Cost Dissection
        ======================================================== */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
          <Reveal>
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-bronze font-semibold">
                  Cost Transparency
                </span>
                <span className="border border-line bg-paper-2/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                  RentTruth™
                </span>
              </div>

              <h2 className="display mt-6 text-3xl sm:text-4xl md:text-5xl tracking-tight">
                Headline rent is rarely what you actually pay.
              </h2>
              <p className="lede mt-4 text-sm sm:text-base text-ink-soft">
                Maintenance dues, power tariffs, car parking charges, and one-off deposits are often hidden until final agreements are drafted. RentTruth brings full financial legibility upfront.
              </p>

              {/* Mini Breakdown Card Mock */}
              <div className="mt-8 border border-line bg-paper-2/50 p-5 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-ink-soft">Base Monthly Rent</span>
                  <span className="font-semibold text-ink font-tabular">₹28,000</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-ink-soft">Society Maintenance (Owner Verified)</span>
                  <span className="font-semibold text-ink font-tabular">+ ₹3,200</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-ink-soft">Covered Parking (Assigned)</span>
                  <span className="font-semibold text-ink font-tabular">+ ₹1,000</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-ink-soft">Estimated Power & Water (Tenant Avg)</span>
                  <span className="font-semibold text-ink font-tabular">+ ₹2,400</span>
                </div>
                <div className="flex items-center justify-between pt-1 font-sans text-sm font-medium">
                  <span className="text-ink">True Estimated Monthly Outflow</span>
                  <span className="text-bronze font-bold font-tabular text-base">₹34,600</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button href="/renttruth/prop-navrang-02" variant="primary">
                Explore RentTruth Demo
              </Button>
              <Link
                href="/homes"
                className="font-mono text-xs uppercase tracking-wider text-ink-soft hover:text-ink hover:underline underline-offset-4"
              >
                Compare listings →
              </Link>
            </div>
          </Reveal>
        </div>

        {/* ========================================================
            TEASER 2: Property Condition Passport
        ======================================================== */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-between bg-paper">
          <Reveal delay={0.15}>
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-bronze font-semibold">
                  Move-In Protection
                </span>
                <span className="border border-line bg-paper-2/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                  Condition Passport
                </span>
              </div>

              <h2 className="display mt-6 text-3xl sm:text-4xl md:text-5xl tracking-tight">
                Photograph the home as you found it. Together.
              </h2>
              <p className="lede mt-4 text-sm sm:text-base text-ink-soft">
                Security deposit deductions are the primary source of rental friction.
                Condition Passport creates an immutable record of walls, appliances,
                fixtures, and existing wear before keys change hands.
              </p>

              {/* Mini Passport Room Timeline Mock */}
              <div className="mt-8 border border-line bg-paper-2/50 p-5 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-ok" />
                    <span className="font-medium text-ink">Living Room & Balcony</span>
                  </div>
                  <span className="text-ink-soft">4 verified photos</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-ok" />
                    <span className="font-medium text-ink">Master Bedroom & Bath</span>
                  </div>
                  <span className="text-ink-soft">6 verified photos</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-ok" />
                    <span className="font-medium text-ink">Kitchen & Utility Fixtures</span>
                  </div>
                  <span className="text-ink-soft">3 verified photos</span>
                </div>
                <div className="pt-2 text-ink-soft text-[11px] leading-relaxed">
                  Mutual timestamp logged on move-in. Neither party can unilaterally alter photographs once acknowledged.
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button href="/rental/rent-navrang/passport" variant="line">
                Open Condition Passport
              </Button>
              <Link
                href="/how-it-works"
                className="font-mono text-xs uppercase tracking-wider text-ink-soft hover:text-ink hover:underline underline-offset-4"
              >
                How verification works →
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
