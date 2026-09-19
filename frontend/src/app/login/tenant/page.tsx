"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { NivasaLogo } from "@/components/brand/nivasa-logo";
import { useNivasa, DEMO_TENANT, makeUser } from "@/store/nivasa-store";
import { createClient } from "@/lib/supabase/client";

export default function TenantLoginPage() {
  const router = useRouter();
  const { signIn, toast } = useNivasa();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDemoSignIn = () => {
    signIn(DEMO_TENANT);
    toast("Signed in as Demo Tenant.");
    router.push("/tenant");
  };

  async function submit() {
    setError("");
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email.";
    if (password.length < 6) next.password = "Use at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, expectedRole: "tenant" }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      fetch("/api/notify/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.user.email, name: data.user.name }),
      }).catch(() => {});

      signIn(
        makeUser({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        })
      );

      if (data.user.role === "owner") {
        toast("Your account is registered as a Property Owner. Redirecting to your Owner Portal.");
        router.push("/owner");
      } else {
        toast("Signed in as Tenant Member.");
        router.push("/tenant");
      }
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
          {/* Left Column: Tenant Value Props */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3">
              <NivasaLogo variant="mark" size="sm" />
              <div className="inline-flex items-center gap-2 rounded-full bg-[#7ca982]/15 px-3 py-1 text-xs font-semibold text-[#1d3122] dark:text-[#a3caa6] border border-[#7ca982]/30">
                <span>Tenant Portal</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#7ca982]" />
                <span>TENANT</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ink tracking-tight leading-tight">
              Tenant Sign In
            </h1>

            <p className="text-sm sm:text-base text-ink-muted leading-relaxed font-medium">
              Find verified homes, understand your rental costs, and manage your tenancy with Nivasa.
            </p>

            {/* Feature Highlights per Section 6 */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-ink">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7ca982]/20 text-[#1d3122] dark:text-[#a3caa6] font-bold">
                  ✓
                </span>
                <span>Verified residence discovery</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-ink">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7ca982]/20 text-[#1d3122] dark:text-[#a3caa6] font-bold">
                  ✓
                </span>
                <span>Rental expense information</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-ink">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7ca982]/20 text-[#1d3122] dark:text-[#a3caa6] font-bold">
                  ✓
                </span>
                <span>Digital condition passport</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-ink">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7ca982]/20 text-[#1d3122] dark:text-[#a3caa6] font-bold">
                  ✓
                </span>
                <span>Roommate matching</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-ink">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7ca982]/20 text-[#1d3122] dark:text-[#a3caa6] font-bold">
                  ✓
                </span>
                <span>Tenant-focused housing tools</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#e5dfc5] dark:border-[#2a3f31]">
              <Link
                href="/login/owner"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#57875d] dark:text-[#a3caa6] hover:underline"
              >
                <span>Are you a property owner? Sign in as Owner →</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Tenant Sign-in Form Card */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-card-dark p-7 sm:p-9 shadow-xl shadow-warm-300/20 dark:shadow-none">
              <div className="flex items-center justify-between border-b border-[#e5dfc5] dark:border-[#2a3f31] pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold font-serif text-ink">Tenant Member Sign In</h2>
                  <p className="text-xs text-ink-muted mt-0.5">Access your verified tenancy workspace</p>
                </div>
                <span className="rounded-full bg-[#7ca982]/15 px-2.5 py-1 text-[11px] font-bold text-[#1d3122] dark:text-[#a3caa6]">
                  TENANT
                </span>
              </div>

              {/* 1-Click Demo Shortcut */}
              <div className="mb-6 rounded-2xl border border-[#7ca982]/30 bg-[#7ca982]/10 p-3.5 text-center">
                <p className="text-xs text-ink-muted mb-2">Instant demo testing without typing credentials:</p>
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  className="w-full rounded-xl bg-[#7ca982] hover:bg-[#6b9471] text-white py-2 px-3 text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  <span>1-Click Demo Tenant Sign In</span>
                </button>
              </div>

              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e5dfc5] dark:border-[#2a3f31]" />
                </div>
                <span className="relative bg-card dark:bg-card-dark px-3 text-[11px] font-semibold text-ink-muted uppercase">
                  or enter credentials
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
                  label="Tenant Email Address"
                  name="email"
                  type="email"
                  placeholder="e.g. rohan@example.com"
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
                    <Link href="/forgot-password" className="text-xs text-[#57875d] dark:text-[#a3caa6] font-semibold hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? "Authenticating..." : "Sign In to Tenant Portal"}
                  </Button>
                </div>
              </form>

              <div className="mt-6 pt-5 border-t border-[#e5dfc5] dark:border-[#2a3f31] text-center text-xs text-ink-muted">
                Don&apos;t have a tenant profile?{" "}
                <Link className="font-semibold text-[#57875d] dark:text-[#a3caa6] hover:underline" href="/register">
                  Create tenant account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
