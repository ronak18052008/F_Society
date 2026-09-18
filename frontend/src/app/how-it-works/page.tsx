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
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-50/70 dark:bg-blue-950/40 px-3.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-300">
            Platform Protocol
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
            How NIVASA Works
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Two distinct perspectives unified into a single dispute-proof tenancy ledger.
            Zero brokerage, unvarnished costs, and mutual verification from day zero.
          </p>
        </div>

        {/* Dual Pathways Bento */}
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {/* Tenant Journey Card */}
          <Reveal className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                Resident Protocol
              </span>
              <span className="text-xs text-slate-400">For Tenants</span>
            </div>
            <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">The Tenant Journey</h2>
            <ol className="mt-6 space-y-4">
              {tenant.map((step, index) => (
                <li key={step} className="flex items-start gap-3.5 text-sm text-slate-600 dark:text-slate-300">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/60 text-xs font-bold text-blue-600 dark:text-blue-300">
                    0{index + 1}
                  </span>
                  <span className="leading-relaxed mt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Button href="/register?intent=tenant" size="lg" className="w-full">
                Begin Resident Onboarding →
              </Button>
            </div>
          </Reveal>

          {/* Owner Journey Card */}
          <Reveal delay={0.1} className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-bold text-teal-600 dark:text-teal-400">
                Host Protocol
              </span>
              <span className="text-xs text-slate-400">For Property Owners</span>
            </div>
            <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">The Owner Journey</h2>
            <ol className="mt-6 space-y-4">
              {owner.map((step, index) => (
                <li key={step} className="flex items-start gap-3.5 text-sm text-slate-600 dark:text-slate-300">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950/60 text-xs font-bold text-teal-600 dark:text-teal-400">
                    0{index + 1}
                  </span>
                  <span className="leading-relaxed mt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Button href="/register?intent=owner" variant="line" size="lg" className="w-full">
                List Residence as Host →
              </Button>
            </div>
          </Reveal>
        </div>

        {/* Lifecycle Philosophy Banner */}
        <Reveal delay={0.2} className="mt-16 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-blue-50/50 via-white to-teal-50/50 dark:from-slate-900 dark:via-slate-900/60 dark:to-slate-900 p-8 sm:p-10 shadow-xs">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Complete Living Lifecycle
            </span>
            <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Discover → RentTruth™ Audit → Direct Deal → Condition Passport → Shared Ledger
            </h3>
            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Tenancy agreements, security deposits, repair tickets, and move-out inspections
              should never depend on scattered screenshots or contested memory.
              NIVASA provides a living cryptographic record for both parties from day zero through move-out.
            </p>
          </div>
        </Reveal>
      </div>
    </SiteShell>
  );
}
