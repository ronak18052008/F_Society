"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Field, SelectField, TextArea } from "@/components/ui/field";
import { useNestora } from "@/store/nestora-store";

export default function TenantOnboardingPage() {
  const router = useRouter();
  const { tenantReqs, setTenantReqs, toast } = useNestora();
  const [budget, setBudget] = useState(String(tenantReqs.budget));
  const [city, setCity] = useState(tenantReqs.cities[0] ?? "Ahmedabad");
  const [type, setType] = useState(tenantReqs.type);
  const [notes, setNotes] = useState(tenantReqs.notes);

  return (
    <SiteShell>
      <div className="mx-auto max-w-lg px-5 py-16">
        <h1 className="font-serif text-5xl">Tenant setup</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Used to pre-fill search. Not a credit or identity check.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const value = Number(budget);
            if (!value || value < 5000) return;
            setTenantReqs({
              budget: value,
              cities: [city],
              type,
              notes,
            });
            toast("Requirements stored locally.");
            router.push("/onboarding/profile");
          }}
        >
          <Field label="Monthly budget (₹)" name="budget" value={budget} onChange={setBudget} required />
          <SelectField
            label="Preferred city"
            value={city}
            onChange={setCity}
            options={["Ahmedabad", "Bengaluru", "Pune", "Mumbai"].map((item) => ({
              value: item,
              label: item,
            }))}
          />
          <SelectField
            label="Property type"
            value={type}
            onChange={setType}
            options={[
              { value: "apartment", label: "Apartment" },
              { value: "studio", label: "Studio" },
              { value: "independent-floor", label: "Independent floor" },
            ]}
          />
          <TextArea label="Notes" name="notes" value={notes} onChange={setNotes} />
          <Button type="submit">Continue to profile</Button>
        </form>
      </div>
    </SiteShell>
  );
}
