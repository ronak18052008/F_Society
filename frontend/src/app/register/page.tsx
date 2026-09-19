"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { NivasaLogo } from "@/components/brand/nivasa-logo";
import { useNivasa } from "@/store/nivasa-store";
import { cn } from "@/lib/cn";
import type { UserRole } from "@/types";
import { signUpUser } from "@/services/auth";

function RegisterForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { signIn, toast } = useNivasa();

  const [role, setRole] = useState<UserRole>("tenant");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = params.get("role") || params.get("intent");
    if (roleParam === "owner" || roleParam === "tenant") {
      setRole(roleParam);
    }
  }, [params]);

  async function submit() {
    setError("");
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (password !== confirmPassword) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const { user, error: authError } = await signUpUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      if (authError || !user) {
        setError(authError || "Failed to create account.");
        setLoading(false);
        return;
      }

      // Also mirror to local endpoint for offline fallback
      fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        }),
      }).catch(() => {});

      signIn(user);

      toast(`Account registered as ${role === "owner" ? "Property Owner" : "Tenant Member"}!`);
      router.push(role === "owner" ? "/owner" : "/tenant");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-12 sm:py-20">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface-elevated)] p-7 sm:p-9 shadow-xl">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <NivasaLogo variant="mark" size="sm" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-pista-subtle)] px-3 py-1 text-xs font-semibold text-[var(--text-main)] border border-[var(--border-subtle)]">
            Nivasa Registration
          </div>
          <h1 className="mt-3 text-3xl font-serif font-bold tracking-tight text-[var(--text-main)]">
            Create your Nivasa account
          </h1>
          <p className="mt-1.5 text-xs text-[var(--text-muted)]">
            Join India&apos;s direct housing network with transparent pricing and zero brokerage.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-[var(--error)] bg-rose-50 p-3.5 text-xs text-[var(--error)] font-medium">
            {error}
          </div>
        )}

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          {/* Section 19: Role Selection "I am a: ○ Tenant ○ Owner" */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              I am a:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("tenant")}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5",
                  role === "tenant"
                    ? "border-[var(--primary-pista)] bg-[var(--primary-pista-subtle)] text-[var(--text-main)] ring-1 ring-[var(--primary-pista)]"
                    : "border-[var(--border)] bg-[var(--bg-canvas)] text-[var(--text-muted)] hover:border-[var(--primary-pista)]"
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 rounded-full border items-center justify-center",
                    role === "tenant" ? "border-[var(--primary-pista)] bg-[var(--primary-pista)]" : "border-[var(--border)]"
                  )}
                >
                  {role === "tenant" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <div>
                  <div className="text-xs font-bold font-serif">Tenant</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Looking for a home</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("owner")}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5",
                  role === "owner"
                    ? "border-amber-600 bg-amber-500/15 text-[var(--text-main)] ring-1 ring-amber-600"
                    : "border-[var(--border)] bg-[var(--bg-canvas)] text-[var(--text-muted)] hover:border-amber-600/50"
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 rounded-full border items-center justify-center",
                    role === "owner" ? "border-amber-600 bg-amber-600" : "border-[var(--border)]"
                  )}
                >
                  {role === "owner" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <div>
                  <div className="text-xs font-bold font-serif">Owner</div>
                  <div className="text-[10px] text-[var(--text-muted)]">List residences</div>
                </div>
              </button>
            </div>
          </div>

          <Field
            label="Full Name"
            name="name"
            value={name}
            onChange={setName}
            error={errors.name}
            required
          />

          <Field
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
            error={errors.email}
            required
          />

          <Field
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            required
          />

          <Field
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={errors.confirmPassword}
            required
          />

          <div className="pt-2">
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : `Create ${role === "owner" ? "Owner" : "Tenant"} Account`}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-[var(--text-muted)]">
          Already have an account?{" "}
          <Link className="font-semibold text-[var(--primary-pista)] hover:underline" href="/login">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <SiteShell>
      <Suspense fallback={<div className="py-20 text-center text-xs text-[var(--text-muted)]">Loading registration...</div>}>
        <RegisterForm />
      </Suspense>
    </SiteShell>
  );
}
