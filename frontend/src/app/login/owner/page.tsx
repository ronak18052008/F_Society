"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useNivasa, DEMO_OWNER, makeUser } from "@/store/nivasa-store";
import { createClient } from "@/lib/supabase/client";

export default function OwnerLoginPage() {
  const router = useRouter();
  const { signIn, toast } = useNivasa();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDemoSignIn = () => {
    signIn(DEMO_OWNER);
    toast("Welcome back, Vikram Mehta! Signed in to Owner Command Deck.");
    router.push("/owner/dashboard");
  };

  async function submit() {
    setError("");
    const next: Record<string, string> = {};
    if (!/^[^s@]+@[^s@]+.[^s@]+$/.test(email)) next.email = "Enter a valid email.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const supabase = createClient();
      if (supabase) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }

        fetch("/api/notify/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name: data.user.user_metadata?.name }),
        }).catch(() => {});

        signIn(
          makeUser({
            name: data.user.user_metadata?.name || email.split("@")[0],
            email,
            role: "owner",
          })
        );
        router.push("/owner/dashboard");
        return;
      }

      // Local fallback
      signIn(
        makeUser({
          name: email.split("@")[0],
          email,
          role: "owner",
        })
      );
      toast("Signed in to Owner Command Deck.");
      router.push("/owner/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Owner Value Props */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-900 dark:text-amber-200 border border-amber-500/30">
              <span>Owner & Landlord Deck</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>Asset Management</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ink tracking-tight leading-tight">
              Manage your residential portfolio with precision.
            </h1>

            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
              Publish verified properties across India, vet incoming tenant applications with zero broker spam, generate AI lease agreements, and audit monthly deposits.
            </p>

            {/* Feature Checklist */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-900 dark:text-amber-200">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-ink">Zero Broker Distortions</h2>
                  <p className="text-xs text-ink-muted">Direct communication with pre-screened, verified tenant applicants.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-900 dark:text-amber-200">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-ink">Automated AI Lease Drafter</h2>
                  <p className="text-xs text-ink-muted">State-compliant Indian rental agreements with custom clauses and digital signatures.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-900 dark:text-amber-200">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-ink">Condition Passports & Security Deposits</h2>
                  <p className="text-xs text-ink-muted">Protect your property value with mutual move-in photo ledgers and maintenance logs.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/login/tenant"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#57875d] dark:text-[#a3caa6] hover:underline"
              >
                <span>Looking to rent a home as a tenant?</span>
                <span>Switch to Tenant Sign-In →</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Owner Sign-in Form Card */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-7 sm:p-9 shadow-xl shadow-warm-300/20 dark:shadow-none">
              <div className="flex items-center justify-between border-b border-[#e5dfc5] dark:border-[#2a3f31] pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold font-serif text-ink">Owner Command Deck</h2>
                  <p className="text-xs text-ink-muted mt-0.5">Asset & Tenancy Management</p>
                </div>
                <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-900 dark:text-amber-200">
                  Owner Mode
                </span>
              </div>

              {/* 1-Click Demo Shortcut */}
              <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-center">
                <p className="text-xs text-ink-muted mb-2">Want to test the owner command deck instantly?</p>
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  className="w-full rounded-xl bg-amber-700 hover:bg-amber-800 text-white py-2 px-3 text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  <span>1-Click Demo Owner Sign-In (Vikram Mehta)</span>
                </button>
              </div>

              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e5dfc5] dark:border-[#2a3f31]" />
                </div>
                <span className="relative bg-card dark:bg-card-dark px-3 text-[11px] font-semibold text-ink-muted uppercase">
                  or sign in with credentials
                </span>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-600 dark:text-rose-300 font-medium">
                  {error}
                </div>
              )}

              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                <Field
                  label="Owner Email Address"
                  name="email"
                  type="email"
                  placeholder="e.g. vikram.mehta@example.com"
                  value={email}
                  onChange={setEmail}
                  error={errors.email}
                  required
                />
                <div>
                  <Field
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={setPassword}
                    error={errors.password}
                    required
                  />
                  <div className="mt-1.5 text-right">
                    <Link href="/forgot-password" className="text-xs text-amber-700 dark:text-amber-300 font-semibold hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" size="lg" className="w-full bg-amber-700 hover:bg-amber-800" disabled={loading}>
                    {loading ? "Authenticating..." : "Sign In to Owner Deck"}
                  </Button>
                </div>
              </form>

              <div className="mt-6 pt-5 border-t border-[#e5dfc5] dark:border-[#2a3f31] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-muted">
                <Link className="font-semibold text-amber-800 dark:text-amber-300 hover:underline" href="/owner/properties/new">
                  + List residence without account
                </Link>
                <Link className="font-semibold text-ink hover:underline" href="/register">
                  Register owner profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
