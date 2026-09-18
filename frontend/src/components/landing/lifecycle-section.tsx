"use client";

import { useState } from "react";
import { StaggerIn, Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/cn";
import Link from "next/link";

export interface LifecycleStep {
  number: string;
  title: string;
  phase: "Pre-Tenancy" | "Agreement" | "Tenancy" | "Conclusion";
  summary: string;
  detail: string;
  href?: string;
  ctaText?: string;
}

export const lifecycleSteps: LifecycleStep[] = [
  {
    number: "01",
    title: "Discover a Property",
    phase: "Pre-Tenancy",
    summary: "Search listings with verified dimensions, furnishing status, and authentic photography.",
    detail: "Filter by rent, locality, bedroom count, and living patterns without deceptive wide-angle trickery.",
    href: "/homes",
    ctaText: "Browse homes",
  },
  {
    number: "02",
    title: "Compare Real Costs",
    phase: "Pre-Tenancy",
    summary: "Deconstruct total monthly commitments before visiting through RentTruth.",
    detail: "See society maintenance, parking fees, typical utility averages, and security deposits laid bare.",
    href: "/renttruth/prop-navrang-02",
    ctaText: "View RentTruth breakdown",
  },
  {
    number: "03",
    title: "Connect With Owner",
    phase: "Pre-Tenancy",
    summary: "Send structured, verified enquiries directly without intermediary broker clutter.",
    detail: "Share your professional background, preferred move-in window, and schedule a walk-through.",
    href: "/homes/prop-navrang-02",
    ctaText: "See demo enquiry",
  },
  {
    number: "04",
    title: "Review Rental Agreement",
    phase: "Agreement",
    summary: "Analyze tenancy clauses, notice periods, and maintenance responsibilities in plain language.",
    detail: "Identify non-standard terms, escalation percentages, and mutual obligations prior to execution.",
    href: "/ai/agreement",
    ctaText: "Agreement analyzer",
  },
  {
    number: "05",
    title: "Document Condition",
    phase: "Agreement",
    summary: "Establish an unalterable baseline with the Property Condition Passport.",
    detail: "Photograph walls, fixtures, flooring, and appliances on move-in day with mutual timestamps.",
    href: "/rental/rent-navrang/passport",
    ctaText: "Inspect passport",
  },
  {
    number: "06",
    title: "Track Rent & Bills",
    phase: "Tenancy",
    summary: "Centralize monthly payment receipts, society bills, and electricity meters in one ledger.",
    detail: "A shared chronological ledger keeps both tenant and owner aligned with zero forgotten payments.",
    href: "/rental/rent-navrang/payments",
    ctaText: "Payment ledger",
  },
  {
    number: "07",
    title: "Manage Relationship",
    phase: "Tenancy",
    summary: "Submit maintenance tickets with photos and track repairs from notification to resolution.",
    detail: "Avoid WhatsApp confusion. Keep every plumbing, electrical, or appliance request accountable.",
    href: "/rental/rent-navrang",
    ctaText: "Active workspace",
  },
  {
    number: "08",
    title: "Move-Out Transparency",
    phase: "Conclusion",
    summary: "Revisit the move-in Condition Passport to settle security deposits objectively.",
    detail: "Distinguish fair wear-and-tear from actual damage using original photos, preventing disputes.",
    href: "/how-it-works",
    ctaText: "Learn full lifecycle",
  },
];

export function LifecycleSection() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section className="section-lg border-t border-line bg-paper text-ink">
      <div className="wrap">
        {/* Section Header */}
        <Reveal>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
              The Tenancy Journey
            </span>
            <h2 className="display mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              End-to-end verified living, from first inquiry to full deposit return.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Traditional rental platforms disappear once phone numbers are exchanged.
              NIVASA provides a living, verifiable system of record for both tenant and owner.
            </p>
          </div>
        </Reveal>

        {/* Modern Responsive Cards Grid */}
        <StaggerIn
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          selector=".lifecycle-card"
        >
          {lifecycleSteps.map((step, index) => {
            const isHovered = activeStep === index;
            return (
              <article
                key={step.number}
                className={cn(
                  "lifecycle-card relative flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-6 sm:p-7 backdrop-blur-md transition-all duration-300",
                  "hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1",
                  isHovered && "border-blue-500/40 bg-white dark:bg-slate-900",
                )}
                onMouseEnter={() => setActiveStep(index)}
                onMouseLeave={() => setActiveStep(null)}
              >
                <div>
                  {/* Step Header Pill */}
                  <div className="flex items-center justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-600 dark:text-blue-400 font-tabular">
                      {step.number}
                    </span>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {step.phase}
                    </span>
                  </div>

                  {/* Title & Summaries */}
                  <h3 className="font-sans text-xl font-bold mt-5 tracking-tight text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {step.summary}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {step.detail}
                  </p>
                </div>

                {/* Direct Action Link */}
                {step.href && (
                  <div className="mt-6 pt-2">
                    <Link
                      href={step.href}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
                    >
                      <span>{step.ctaText ?? "Learn more"}</span>
                      <span className="text-sm">→</span>
                    </Link>
                  </div>
                )}
              </article>
            );
          })}
        </StaggerIn>

        {/* Footnote */}
        <Reveal delay={0.2} className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60 pt-4">
          <p>
            * Connected to Supabase real-time database with live state sync.
          </p>
          <Link
            href="/how-it-works"
            className="font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-2 whitespace-nowrap"
          >
            Explore Complete Journey Guide →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
