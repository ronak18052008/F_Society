"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { NivasaLogo } from "@/components/brand/nivasa-logo";
import { useNivasa } from "@/store/nivasa-store";
import { signInUser, DEMO_TENANT_USER } from "@/services/auth";

export default function TenantLoginPage() {
  const router = useRouter();
  const { signIn, toast } = useNivasa();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDemoSignIn = () => {
    signIn(DEMO_TENANT_USER);
    toast("Signed in as Demo Tenant.");
    router.push("/tenant");
  };

  async function submit() {
    setError("");
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const { user, error: authError } = await signInUser({
        email: email.trim(),
        password,
        expectedRole: "tenant",
      });

      if (authError || !user) {
        setError(authError || "Invalid email or password.");
        setLoading(false);
        return;
      }

      fetch("/api/notify/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, name: user.name }),
      }).catch(() => {});

      signIn(user);

      if (user.role === "owner") {
        toast("Your account is registered as a Property Owner. Redirecting to your Owner Portal.");
        router.push("/owner");
      } else {
        toast("Signed in as Tenant Member.");
        router.push("/tenant");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during authentication.");
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
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-pista-subtle)] px-3 py-1 text-xs font-semibold text-[var(--text-main)] border border-[var(--primary-pista-subtle)]">
                <span>Tenant Portal</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-pista)]" />
                <span>TENANT</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[var(--text-main)] tracking-tight leading-tight">
              Tenant Sign In
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed font-medium">
              Find verified homes, understand your rental costs, and manage your tenancy with Nivasa.
            </p>

            {/* Feature Highlights per Section 6 */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[var(--text-main)]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary-pista-subtle)] text-[var(--text-main)] font-bold">
                  ✓
                </span>
                <span>Verified residence discovery</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-[var(--text-main)]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary-pista-subtle)] text-[var(--text-main)] font-bold">
                  ✓
                </span>
                <span>Rental expense information</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-[var(--text-main)]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary-pista-subtle)] text-[var(--text-main)] font-bold">
                  ✓
                </span>
                <span>Digital condition passport</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-[var(--text-main)]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary-pista-subtle)] text-[var(--text-main)] font-bold">
                  ✓
                </span>
                <span>Roommate matching</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-[var(--text-main)]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary-pista-subtle)] text-[var(--text-main)] font-bold">
                  ✓
                </span>
                <span>Tenant-focused housing tools</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)]">
              <Link
                href="/login/owner"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--primary-pista)] hover:underline"
              >
                <span>Are you a property owner? Sign in as Owner →</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Tenant Sign-in Form Card */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface-elevated)] p-7 sm:p-9 shadow-xl">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold font-serif text-[var(--text-main)]">Tenant Member Sign In</h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Access your verified tenancy workspace</p>
                </div>
                <span className="rounded-full bg-[var(--primary-pista-subtle)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-main)]">
                  TENANT
                </span>
              </div>

              {/* 1-Click Demo Shortcut */}
              <div className="mb-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--primary-pista-subtle)] p-3.5 text-center">
                <p className="text-xs text-[var(--text-muted)] mb-2">Instant demo testing without typing credentials:</p>
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  className="w-full rounded-xl bg-[var(--primary-pista)] hover:bg-[var(--primary-pista-hover)] text-white py-2 px-3 text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  <span>1-Click Demo Tenant Sign In</span>
                </button>
              </div>

              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border)]" />
                </div>
                <span className="relative bg-[var(--bg-surface-elevated)] px-3 text-[11px] font-semibold text-[var(--text-muted)] uppercase">
                  or enter credentials
                </span>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-[var(--error)] bg-rose-50 p-3 text-xs text-[var(--error)] font-medium">
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
                    <Link href="/forgot-password" className="text-xs text-[var(--primary-pista)] font-semibold hover:underline">
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

              <div className="mt-6 pt-5 border-t border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
                Don&apos;t have a tenant profile?{" "}
                <Link className="font-semibold text-[var(--primary-pista)] hover:underline" href="/register">
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
