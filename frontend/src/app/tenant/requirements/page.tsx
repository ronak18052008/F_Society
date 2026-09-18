"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Field, SelectField, TextArea } from "@/components/ui/field";
import { useNestora } from "@/store/nestora-store";

export default function RequirementsPage() {
  const { tenantReqs, setTenantReqs, roommatePrefs, setRoommatePrefs, toast } =
    useNestora();
  const [budget, setBudget] = useState(String(tenantReqs.budget));
  const [city, setCity] = useState(tenantReqs.cities[0] ?? "Ahmedabad");
  const [type, setType] = useState(tenantReqs.type);
  const [notes, setNotes] = useState(tenantReqs.notes);
  const [food, setFood] = useState(roommatePrefs.food);
  const [sleep, setSleep] = useState(roommatePrefs.sleep);

  return (
    <DashboardShell title="Requirements">
      <form
        className="max-w-lg space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setTenantReqs({
            budget: Number(budget) || 0,
            cities: [city],
            type,
            notes,
          });
          setRoommatePrefs({ ...roommatePrefs, city, food, sleep, budget: Number(budget) / 2 });
          toast("Updated locally. Not synced to a profile server.");
        }}
      >
        <Field label="Budget (₹ / month)" name="budget" value={budget} onChange={setBudget} />
        <SelectField
          label="Preferred location"
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
        <SelectField
          label="Food"
          value={food}
          onChange={setFood}
          options={[
            { value: "veg", label: "Vegetarian" },
            { value: "non-veg", label: "Non-vegetarian" },
            { value: "flexible", label: "Flexible" },
          ]}
        />
        <SelectField
          label="Sleep"
          value={sleep}
          onChange={setSleep}
          options={[
            { value: "early", label: "Early" },
            { value: "late", label: "Late" },
            { value: "flexible", label: "Flexible" },
          ]}
        />
        <TextArea
          label="Lifestyle and travel notes"
          name="notes"
          value={notes}
          onChange={setNotes}
        />
        <Button type="submit">Save locally</Button>
      </form>
    </DashboardShell>
  );
}
