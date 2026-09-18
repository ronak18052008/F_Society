"use client";

import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { makeUser, useNivasa } from "@/store/nivasa-store";

export default function RolePage() {
  const router = useRouter();
  const { user, signIn } = useNivasa();

  function choose(role: "tenant" | "owner") {
    if (user) signIn({ ...user, role });
    else
      signIn(
        makeUser({ name: "Resident", email: "resident@fsociety.local", role }),
      );
    router.push(role === "owner" ? "/onboarding/owner" : "/onboarding/tenant");
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-5 py-20 sm:py-28">
        <div className="text-center max-w-xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-pista/15 px-3 py-1 text-xs font-semibold text-forest dark:text-pista border border-pista/30 mb-4">
            Step 1 of 3 · Identity Selection
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-ink dark:text-cream">
            Define your living journey
          </h1>
          <p className="mt-3 text-sm text-ink-muted leading-relaxed">
            Select your primary mode of interaction on the Nivasa platform. You can change your workspace role at any time.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Tenant Option */}
          <button
            type="button"
            className="group relative rounded-3xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-8 text-left transition-all hover:border-pista hover:shadow-xl hover:shadow-warm-300/20 hover:-translate-y-1 active:scale-[0.99] cursor-pointer"
            onClick={() => choose("tenant")}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pista/15 text-forest dark:text-pista group-hover:scale-110 transition-transform">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-forest dark:text-pista">
              Resident · Tenant
            </p>
            <h2 className="mt-2 text-2xl font-serif font-bold text-ink dark:text-cream">
              I am seeking a dwelling
            </h2>
            <p className="mt-2 text-xs text-ink-muted leading-relaxed">
              Explore verified listings with unbundled RentTruth costs, photographic condition passports, and digital agreements.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-forest dark:text-pista">
              <span>Continue as Resident</span>
              <span>→</span>
            </div>
          </button>

          {/* Owner Option */}
          <button
            type="button"
            className="group relative rounded-3xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-8 text-left transition-all hover:border-pista hover:shadow-xl hover:shadow-warm-300/20 hover:-translate-y-1 active:scale-[0.99] cursor-pointer"
            onClick={() => choose("owner")}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pista/15 text-forest dark:text-pista group-hover:scale-110 transition-transform">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-forest dark:text-pista">
              Dwelling Curator · Owner
            </p>
            <h2 className="mt-2 text-2xl font-serif font-bold text-ink dark:text-cream">
              I am listing a residence
            </h2>
            <p className="mt-2 text-xs text-ink-muted leading-relaxed">
              Publish high-end residences, verify applicant criteria, manage tenancy workspaces, and track rental cashflows.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-forest dark:text-pista">
              <span>Continue as Owner</span>
              <span>→</span>
            </div>
          </button>
        </div>

        <div className="mt-10 text-center">
          <Button href="/login" variant="ghost">
            Already have an active account? Sign in
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}
