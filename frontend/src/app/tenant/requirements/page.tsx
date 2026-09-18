"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Field, SelectField, TextArea } from "@/components/ui/field";
import { useNivasa } from "@/store/nivasa-store";
import { formatInr } from "@/lib/format";

export default function RequirementsPage() {
  const { tenantReqs, setTenantReqs, roommatePrefs, setRoommatePrefs, toast } =
    useNivasa();
  const [budget, setBudget] = useState(String(tenantReqs.budget));
  const [city, setCity] = useState(tenantReqs.cities[0] ?? "Ahmedabad");
  const [type, setType] = useState(tenantReqs.type);
  const [notes, setNotes] = useState(tenantReqs.notes);
  const [food, setFood] = useState(roommatePrefs.food);
  const [sleep, setSleep] = useState(roommatePrefs.sleep);

  const parsedBudget = Number(budget) || 0;

  return (
    <DashboardShell title="Tenancy Requirements & Search Profile">
      <div className="max-w-3xl">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure your residential preferences, financial constraints, and living habits. These parameters power intelligent matching across the NIVASA residence ecosystem.
        </p>

        <form
          className="mt-8 space-y-8"
          onSubmit={(event) => {
            event.preventDefault();
            setTenantReqs({
              budget: parsedBudget,
              cities: [city],
              type,
              notes,
            });
            setRoommatePrefs({ ...roommatePrefs, city, food, sleep, budget: parsedBudget / 2 });
            toast("Tenancy criteria updated and synchronized with your active session.");
          }}
        >
          {/* Section 1: Financial & Spatial Constraints */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-7 shadow-sm backdrop-blur-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                1. Budget &amp; Dwelling Type
              </h3>
              {parsedBudget > 0 ? (
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  Target: {formatInr(parsedBudget)} / mo
                </span>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Maximum Monthly Rent (₹)"
                name="budget"
                type="number"
                value={budget}
                onChange={setBudget}
                placeholder="35000"
                required
              />
              <SelectField
                label="Target Metropolitan Area"
                value={city}
                onChange={setCity}
                options={["Ahmedabad", "Bengaluru", "Pune", "Mumbai"].map((item) => ({
                  value: item,
                  label: item,
                }))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Dwelling Architecture
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "apartment", label: "Apartment", icon: "🏢" },
                  { id: "studio", label: "Studio", icon: "🛋️" },
                  { id: "independent-floor", label: "Villa / Floor", icon: "🏡" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border p-4 text-center transition-all cursor-pointer ${
                      type === item.id
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-xs font-bold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Habit & Compatibility Preferences */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-7 shadow-sm backdrop-blur-sm space-y-6">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                2. Lifestyle &amp; Dwelling Habits
              </h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Culinary / Dietary Alignment"
                value={food}
                onChange={setFood}
                options={[
                  { value: "veg", label: "Pure Vegetarian" },
                  { value: "non-veg", label: "Non-Vegetarian / Omnivore" },
                  { value: "flexible", label: "Flexible & Respectful" },
                ]}
              />
              <SelectField
                label="Circadian / Sleep Rhythm"
                value={sleep}
                onChange={setSleep}
                options={[
                  { value: "early", label: "Early Riser (pre-11 PM)" },
                  { value: "late", label: "Night Owl (post-1 AM)" },
                  { value: "flexible", label: "Flexible schedule" },
                ]}
              />
            </div>

            <TextArea
              label="Bespoke Lifestyle Notes & Commute Priorities"
              name="notes"
              value={notes}
              onChange={setNotes}
              placeholder="e.g., Cross-ventilation preferred, 10 min to metro, pet-friendly society, high-speed fiber required..."
              rows={3}
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center gap-4 pt-2">
            <Button type="submit" size="lg">
              Save Tenancy Profile
            </Button>
            <span className="text-xs text-slate-400">
              Changes update search weights immediately
            </span>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
