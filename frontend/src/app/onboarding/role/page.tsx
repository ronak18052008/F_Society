"use client";

import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { makeUser, useNestora } from "@/store/nestora-store";

export default function RolePage() {
  const router = useRouter();
  const { user, signIn } = useNestora();

  function choose(role: "tenant" | "owner") {
    if (user) signIn({ ...user, role });
    else
      signIn(
        makeUser({ name: "Guest", email: "guest@nestora.local", role }),
      );
    router.push(role === "owner" ? "/onboarding/owner" : "/onboarding/tenant");
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="font-serif text-5xl">How will you use Nestora?</h1>
        <p className="mt-3 text-sm text-ink-soft">
          You can switch later in profile setup.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            className="border border-line p-8 text-left hover:border-bronze"
            onClick={() => choose("tenant")}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-bronze">
              Tenant
            </p>
            <h2 className="mt-3 font-serif text-3xl">I am looking to rent</h2>
          </button>
          <button
            type="button"
            className="border border-line p-8 text-left hover:border-bronze"
            onClick={() => choose("owner")}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-bronze">
              Owner
            </p>
            <h2 className="mt-3 font-serif text-3xl">I list a property</h2>
          </button>
        </div>
        <div className="mt-8">
          <Button href="/login" variant="ghost">
            I already have a session
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}
