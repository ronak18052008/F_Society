"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useNestora } from "@/store/nestora-store";

export default function OwnerOnboardingPage() {
  const router = useRouter();
  const { addDraft, toast } = useNestora();
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("Ahmedabad");
  const [rent, setRent] = useState("");

  return (
    <SiteShell>
      <div className="mx-auto max-w-lg px-5 py-16">
        <h1 className="font-serif text-5xl">Owner setup</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Optional first listing draft. You can complete details later.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (title.trim().length < 4) return;
            addDraft({ title, city, rent: Number(rent) || 0 });
            toast("You can add photographs on the listing form.");
            router.push("/onboarding/profile");
          }}
        >
          <Field label="Working title" name="title" value={title} onChange={setTitle} required />
          <Field label="City" name="city" value={city} onChange={setCity} required />
          <Field label="Indicative rent (₹)" name="rent" value={rent} onChange={setRent} />
          <div className="flex gap-3">
            <Button type="submit">Save draft</Button>
            <Button href="/onboarding/profile" variant="ghost">
              Skip
            </Button>
          </div>
        </form>
      </div>
    </SiteShell>
  );
}
