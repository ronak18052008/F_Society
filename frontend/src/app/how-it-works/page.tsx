import { SiteShell } from "@/components/layout/site-shell";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

const tenant = [
  "Set budget, city, and living pattern.",
  "Shortlist homes and read RentTruth labels.",
  "Enquire. In this prototype the note stays local.",
  "If a rental is confirmed, use the shared workspace.",
];

const owner = [
  "Create a listing with rent, deposit, and recurring costs.",
  "Respond to enquiries from the owner dashboard.",
  "Share documents only with the connected tenant.",
  "Acknowledge move-in condition together.",
];

export default function HowItWorksPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--primary-pista-subtle)] px-3.5 py-1 text-xs font-semibold text-[var(--text-main)]">
            Platform Protocol
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-[var(--text-main)]">
            How Nivasa Works
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[var(--text-muted)]">
            Two distinct perspectives unified into a single dispute-proof tenancy ledger.
            Zero brokerage, unvarnished costs, and mutual verification from day zero.
          </p>
        </div>

        {/* Dual Pathways Bento */}
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {/* Tenant Journey Card */}
          <Reveal className="rounded-3xl border border-[var(--border)] bg-card p-8 shadow-card">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[var(--primary-pista-subtle)] border border-[var(--border-subtle)] px-3 py-1 text-xs font-bold text-[var(--text-main)]">
                Resident Protocol
              </span>
              <span className="text-xs text-[var(--text-muted)]">For Tenants</span>
            </div>
            <h2 className="mt-4 text-2xl sm:text-3xl font-serif font-bold text-[var(--text-main)]">The Tenant Journey</h2>
            <ol className="mt-6 space-y-4">
              {tenant.map((step, index) => (
                <li key={step} className="flex items-start gap-3.5 text-sm text-[var(--text-muted)]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary-pista-subtle)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-main)]">
                    0{index + 1}
                  </span>
                  <span className="leading-relaxed mt-0.5 text-[var(--text-main)]">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-8 pt-6 border-t border-[var(--border)]">
              <Button href="/register?intent=tenant" size="lg" className="w-full">
                Begin Resident Onboarding →
              </Button>
            </div>
          </Reveal>

          {/* Owner Journey Card */}
          <Reveal delay={0.1} className="rounded-3xl border border-[var(--border)] bg-card p-8 shadow-card">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[var(--primary-pista-subtle)] border border-[var(--border-subtle)] px-3 py-1 text-xs font-bold text-[var(--text-main)]">
                Host Protocol
              </span>
              <span className="text-xs text-[var(--text-muted)]">For Property Owners</span>
            </div>
            <h2 className="mt-4 text-2xl sm:text-3xl font-serif font-bold text-[var(--text-main)]">The Owner Journey</h2>
            <ol className="mt-6 space-y-4">
              {owner.map((step, index) => (
                <li key={step} className="flex items-start gap-3.5 text-sm text-[var(--text-muted)]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary-pista-subtle)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-main)]">
                    0{index + 1}
                  </span>
                  <span className="leading-relaxed mt-0.5 text-[var(--text-main)]">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-8 pt-6 border-t border-[var(--border)]">
              <Button href="/register?intent=owner" variant="outline" size="lg" className="w-full">
                List Residence as Host →
              </Button>
            </div>
          </Reveal>
        </div>

        {/* Lifecycle Philosophy Banner */}
        <Reveal delay={0.2} className="mt-16 rounded-3xl border border-[var(--border)] bg-gradient-to-r from-[var(--bg-canvas)] via-card to-[var(--bg-canvas)] p-8 sm:p-10 shadow-card">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary-pista-hover)]">
              Complete Living Lifecycle
            </span>
            <h3 className="mt-2 text-2xl sm:text-3xl font-serif font-bold text-[var(--text-main)]">
              Discover → RentTruth™ Audit → Direct Deal → Condition Passport → Shared Ledger
            </h3>
            <p className="mt-4 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              Tenancy agreements, security deposits, repair tickets, and move-out inspections
              should never depend on scattered screenshots or contested memory.
              Nivasa provides a living cryptographic record for both parties from day zero through move-out.
            </p>
          </div>
        </Reveal>
      </div>
    </SiteShell>
  );
}
