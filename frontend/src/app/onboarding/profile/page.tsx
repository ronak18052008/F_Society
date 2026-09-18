"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useNivasa } from "@/store/nivasa-store";
import { createClient } from "@/lib/supabase/client";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, signIn, toast } = useNivasa();
  const [name, setName] = useState(user?.name ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [loading, setLoading] = useState(false);

  return (
    <SiteShell>
      <div className="mx-auto max-w-lg px-5 py-20 sm:py-28">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-pista/15 px-3 py-1 text-xs font-semibold text-forest dark:text-pista border border-pista/30 mb-3">
            Step 3 of 3 · Identity Verification
          </span>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-ink dark:text-cream">
            Complete your resident profile
          </h1>
          <p className="mt-2 text-xs text-ink-muted">
            This name and contact handle are presented on verified tenancy enquiries and agreements.
          </p>
        </div>

        <div className="rounded-3xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-8 sm:p-10 shadow-xl shadow-warm-300/30 dark:shadow-none">
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
