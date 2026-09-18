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
      <div className="mx-auto max-w-5xl px-5 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
          Process
        </p>
        <h1 className="mt-4 font-serif text-6xl">How Nestora works</h1>
        <p className="mt-4 max-w-xl text-ink-soft">
          Two journeys, one rental record. The steps below describe the product
          intent. Authentication and storage are simulated.
        </p>
        <div className="mt-16 grid gap-10 md:grid-cols-2">
          <Reveal>
            <h2 className="font-serif text-4xl">Tenant</h2>
            <ol className="mt-6 space-y-5">
              {tenant.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span className="font-mono text-bronze">0{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <Button href="/register?intent=tenant">Start as tenant</Button>
            </div>
          </Reveal>
          <Reveal>
            <h2 className="font-serif text-4xl">Owner</h2>
            <ol className="mt-6 space-y-5">
              {owner.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span className="font-mono text-bronze">0{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <Button href="/register?intent=owner" variant="line">
                Start as owner
              </Button>
            </div>
          </Reveal>
        </div>
        <Reveal className="mt-20 border border-line p-8">
          <h2 className="font-serif text-4xl">Lifecycle</h2>
          <p className="mt-4 max-w-2xl text-ink-soft">
            Discover → compare real costs → connect → review agreement →
            document move-in → track rent and bills → close with a shared
            record. Nestora does not replace legal advice or a registered
            agreement.
          </p>
        </Reveal>
      </div>
    </SiteShell>
  );
}
