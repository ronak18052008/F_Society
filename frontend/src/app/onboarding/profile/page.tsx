"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useNestora } from "@/store/nestora-store";
import { createClient } from "@/lib/supabase/client";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, signIn, toast } = useNestora();
  const [name, setName] = useState(user?.name ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [loading, setLoading] = useState(false);

  return (
    <SiteShell>
      <div className="mx-auto max-w-lg px-5 py-20 sm:py-28">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
            Step 3 of 3 · Identity Verification
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Complete your resident profile
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            This name and contact handle are presented on verified tenancy enquiries and agreements.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-7 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl">
          <form
            className="space-y-5"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!user || name.trim().length < 2) return;
              setLoading(true);

              // Update local store immediately
              signIn({ ...user, name, city, phone });

              // Persist to Supabase if configured
              const supabase = createClient();
              if (supabase) {
                const { error } = await supabase
                  .from("profiles")
                  .update({ name, city, phone })
                  .eq("id", user.supabaseId ?? user.id);
                if (error) {
                  toast("Profile saved locally. Server sync failed.");
                } else {
                  toast("Profile successfully synchronized to database.");
                }
              } else {
                toast("Profile updated in local storage.");
              }

              setLoading(false);
              router.push(
                user.role === "owner" ? "/owner/dashboard" : "/tenant/dashboard",
              );
            }}
          >
            <Field
              label="Full Legal / Preferred Name"
              name="name"
              value={name}
              onChange={setName}
              placeholder="e.g. Meet Patel"
              required
            />
            <Field
              label="Primary City of Residence"
              name="city"
              value={city}
              onChange={setCity}
              placeholder="e.g. Ahmedabad"
            />
            <Field
              label="Contact Phone Number"
              name="phone"
              type="tel"
              value={phone}
              onChange={setPhone}
              placeholder="+91 98765 43210"
            />
            <div className="pt-2">
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? "Entering Workspace..." : "Enter Workspace →"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </SiteShell>
  );
}
