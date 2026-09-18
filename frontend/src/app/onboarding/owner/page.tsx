"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useNivasa } from "@/store/nivasa-store";

export default function OwnerOnboardingPage() {
  const router = useRouter();
  const { addDraft, toast } = useNivasa();
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("Ahmedabad");
  const [rent, setRent] = useState("");

  return (
    <SiteShell>
      <div className="mx-auto max-w-lg px-5 py-20 sm:py-28">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-600 dark:text-teal-400 mb-3">
            Step 2 of 3 · Portfolio Setup
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Curate your first listing
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Create an initial listing draft. Full architectural specifications and photography can be configured later.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-7 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl">
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              if (title.trim().length < 4) return;
              addDraft({ title, city, rent: Number(rent) || 0 });
              toast("Initial listing draft preserved in portfolio.");
              router.push("/onboarding/profile");
            }}
          >
            <Field
              label="Listing Headline / Architectural Title"
              name="title"
              value={title}
              onChange={setTitle}
              placeholder="e.g., The Glass Pavilion Residence"
              required
            />
            <Field
              label="Location / City"
              name="city"
              value={city}
              onChange={setCity}
              placeholder="Ahmedabad"
              required
            />
            <Field
              label="Target Headline Rent (₹ / month)"
              name="rent"
              type="number"
              value={rent}
              onChange={setRent}
              placeholder="45000"
            />
            <div className="flex items-center gap-3 pt-3">
              <Button type="submit" fullWidth>
                Save &amp; Continue
              </Button>
              <Button href="/onboarding/profile" variant="ghost" fullWidth>
                Skip for now
              </Button>
            </div>
          </form>
        </div>
      </div>
    </SiteShell>
  );
}
