"use client";

import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

export function FeatureTeasers() {
  return (
    <section className="section bg-slate-50/50 dark:bg-slate-950/50">
      <div className="wrap grid gap-8 lg:grid-cols-2">
        {/* ========================================================
            TEASER 1: RentTruth™ Cost Dissection
        ======================================================== */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-8 sm:p-10 backdrop-blur-xl shadow-sm flex flex-col justify-between">
          <Reveal>
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Cost Transparency
                </span>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  RentTruth™
                </span>
              </div>

              <h2 className="display mt-6 text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Headline rent is rarely what you actually pay.
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                Maintenance fees, hidden parking charges, power surcharges, and unexpected one-off deposits are usually concealed until the lease is signed. RentTruth brings total financial honesty upfront.
              </p>

              {/* Modern Breakdown Card Mock */}
              <div className="mt-8 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-950/60 p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Base Monthly Rent</span>
                  <span className="font-bold text-slate-900 dark:text-white font-tabular">₹28,000</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Society Maintenance (Owner Verified)</span>
                  <span className="font-bold text-slate-900 dark:text-white font-tabular">+ ₹3,200</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Covered Parking (Assigned)</span>
                  <span className="font-bold text-slate-900 dark:text-white font-tabular">+ ₹1,000</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Estimated Power & Water (Tenant Avg)</span>
                  <span className="font-bold text-slate-900 dark:text-white font-tabular">+ ₹2,400</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-sm font-semibold">
                  <span className="text-slate-900 dark:text-white">True Estimated Monthly Outflow</span>
                  <span className="text-blue-600 dark:text-blue-400 font-black font-tabular text-base">₹34,600</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button href="/renttruth/prop-navrang-02" variant="primary">
                Audit RentTruth Breakdown
              </Button>
              <Link
                href="/homes"
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Compare verified listings →
              </Link>
            </div>
          </Reveal>
        </div>

        {/* ========================================================
            TEASER 2: Property Condition Passport
        ======================================================== */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-8 sm:p-10 backdrop-blur-xl shadow-sm flex flex-col justify-between">
          <Reveal delay={0.15}>
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-600 dark:text-teal-400">
                  Move-In Protection
                </span>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  Condition Passport
                </span>
              </div>

              <h2 className="display mt-6 text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Photograph the home as you found it. Jointly.
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                Security deposit disputes are the #1 source of tenant anxiety.
                Condition Passport creates an immutable photographic baseline of walls, appliances,
                and wear before the tenancy starts.
              </p>

              {/* Modern Passport Room Timeline Mock */}
              <div className="mt-8 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-950/60 p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span className="font-semibold text-slate-900 dark:text-white">Living Room & Balcony</span>
                  </div>
                  <span className="text-slate-500">4 verified photos</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span className="font-semibold text-slate-900 dark:text-white">Master Bedroom & Bath</span>
                  </div>
                  <span className="text-slate-500">6 verified photos</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span className="font-semibold text-slate-900 dark:text-white">Kitchen & Utility Fixtures</span>
                  </div>
                  <span className="text-slate-500">3 verified photos</span>
                </div>
                <div className="pt-1 text-slate-500 text-[11px] leading-relaxed">
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
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
