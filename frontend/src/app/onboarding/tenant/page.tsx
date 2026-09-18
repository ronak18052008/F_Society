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
      <div className="mx-auto max-w-lg px-5 py-20 sm:py-28">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3">
            Step 2 of 3 · Search Preferences
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Set your tenancy criteria
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Tell us about your spatial needs and budget to personalize recommendations from day one.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-7 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl">
          <form
            className="space-y-5"
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
              toast("Tenancy criteria configured.");
              router.push("/onboarding/profile");
            }}
          >
            <Field
              label="Monthly Rent Budget (₹)"
              name="budget"
              type="number"
              value={budget}
              onChange={setBudget}
              placeholder="35000"
              required
            />
            <SelectField
              label="Preferred Metropolitan Location"
              value={city}
              onChange={setCity}
              options={["Ahmedabad", "Bengaluru", "Pune", "Mumbai"].map((item) => ({
                value: item,
                label: item,
              }))}
            />
            <SelectField
              label="Dwelling Typology"
              value={type}
              onChange={setType}
              options={[
                { value: "apartment", label: "Apartment / Condominium" },
                { value: "studio", label: "Compact Studio" },
                { value: "independent-floor", label: "Independent Villa / Floor" },
              ]}
            />
            <TextArea
              label="Special Living Notes (Optional)"
              name="notes"
              value={notes}
              onChange={setNotes}
              placeholder="e.g. Quiet neighborhood, pet-friendly, dedicated parking..."
              rows={3}
            />
            <div className="pt-2">
              <Button type="submit" fullWidth>
                Continue to Identity Setup →
              </Button>
            </div>
          </form>
        </div>
      </div>
    </SiteShell>
  );
}
