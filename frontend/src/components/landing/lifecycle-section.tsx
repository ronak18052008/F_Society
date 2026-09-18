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
            <p className="kicker-bronze">The Complete Lifecycle</p>
            <h2 className="display mt-3 text-4xl sm:text-5xl md:text-6xl tracking-tight">
              Eight steps from first search to honest deposit return.
            </h2>
            <p className="lede mt-5 max-w-2xl text-base sm:text-lg">
              Most rental websites disappear once contact details are exchanged.
              Nestora provides a continuous, accountable record across every stage
              of the living relationship.
            </p>
          </div>
        </Reveal>

        {/* 8-Step Architectural Grid */}
        <StaggerIn
          className="mt-14 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4 border border-line"
          selector=".lifecycle-card"
        >
          {lifecycleSteps.map((step, index) => {
            const isHovered = activeStep === index;
            return (
              <article
                key={step.number}
                className={cn(
                  "lifecycle-card relative flex flex-col justify-between bg-paper p-6 sm:p-7 transition-all duration-300",
                  "hover:bg-paper-2/90",
                  isHovered && "bg-paper-2 shadow-xs",
                )}
                onMouseEnter={() => setActiveStep(index)}
                onMouseLeave={() => setActiveStep(null)}
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold tracking-wider text-bronze">
                      {step.number}
                    </span>
                    <span className="border border-line/60 bg-paper-2/50 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
                      {step.phase}
                    </span>
                  </div>

                  {/* Title & Summaries */}
                  <h3 className="font-serif text-2xl font-medium mt-5 tracking-tight text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    {step.summary}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-ink-soft/75 border-t border-line/50 pt-3">
                    {step.detail}
                  </p>
                </div>

                {/* Direct Action Link */}
                {step.href && (
                  <div className="mt-6 pt-2">
                    <Link
                      href={step.href}
                      className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-bronze transition-colors hover:text-ink hover:underline underline-offset-4"
                    >
                      <span>{step.ctaText ?? "Learn more"}</span>
                      <span className="text-xs">→</span>
                    </Link>
                  </div>
                )}
              </article>
            );
          })}
        </StaggerIn>

        {/* Prototype Transparency Footnote */}
        <Reveal delay={0.2} className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-ink-soft border-t border-line/50 pt-4">
          <p>
            * Steps reflect the core product model. All interactions within this prototype remain on your device.
          </p>
          <Link
            href="/how-it-works"
            className="uppercase tracking-[0.16em] text-bronze hover:underline underline-offset-2 whitespace-nowrap"
          >
            Detailed Journey Guide →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
