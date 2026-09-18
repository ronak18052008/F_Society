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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6E9271]/15 px-3.5 py-1 text-xs font-semibold text-[#6E9271] dark:text-[#A3B899] border border-[#6E9271]/30">
              The Tenancy Protocol
            </span>
            <h2 className="display mt-4 text-3xl sm:text-5xl font-serif font-bold tracking-tight text-ink">
              End-to-end verified living, from first inquiry to full deposit return.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-ink-muted leading-relaxed">
              Traditional rental platforms vanish once phone numbers are exchanged.
              Nivasa provides a living, verifiable system of record for both tenant and owner.
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
                  "lifecycle-card relative flex flex-col justify-between rounded-3xl border border-line bg-card p-6 sm:p-7 shadow-card transition-all duration-300",
                  "hover:border-[#6E9271]/50 hover:shadow-card-hover hover:-translate-y-1",
                  isHovered && "border-[#6E9271]/60",
                )}
                onMouseEnter={() => setActiveStep(index)}
                onMouseLeave={() => setActiveStep(null)}
              >
                <div>
                  {/* Step Header Pill */}
                  <div className="flex items-center justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6E9271]/15 text-xs font-bold text-[#6E9271] dark:text-[#A3B899] font-tabular border border-[#6E9271]/20">
                      {step.number}
                    </span>
                    <span className="rounded-full bg-paper border border-line px-2.5 py-0.5 text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
                      {step.phase}
                    </span>
                  </div>

                  {/* Title & Summaries */}
                  <h3 className="font-serif text-lg font-bold mt-5 tracking-tight text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
                    {step.summary}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-ink-muted/80 border-t border-line pt-3">
                    {step.detail}
                  </p>
                </div>

                {/* Direct Action Link */}
                {step.href && (
                  <div className="mt-6 pt-2">
                    <Link
                      href={step.href}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#57875d] dark:text-[#A3B899] hover:underline transition-colors"
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
        <Reveal delay={0.2} className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-ink-muted border-t border-line pt-4">
          <p>
            * Connected to Supabase real-time database with live state synchronization.
          </p>
          <Link
            href="/how-it-works"
            className="font-medium text-[#6E9271] hover:underline underline-offset-2 whitespace-nowrap"
          >
            Explore Complete Journey Guide →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
