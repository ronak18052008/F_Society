"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { NivasaLogo } from "@/components/brand/nivasa-logo";
import { useNivasa, DEMO_TENANT, DEMO_OWNER, makeUser } from "@/store/nivasa-store";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import type { UserRole } from "@/types";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, toast } = useNivasa();

  const [activeRole, setActiveRole] = useState<UserRole>("tenant");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "owner" || roleParam === "tenant") {
      setActiveRole(roleParam);
    }
  }, [searchParams]);

  const handleDemoSignIn = (roleToSign: UserRole) => {
    if (roleToSign === "owner") {
      signIn(DEMO_OWNER);
      toast("Signed in as Demo Owner.");
      router.push("/owner");
    } else {
      signIn(DEMO_TENANT);
      toast("Signed in as Demo Tenant.");
      router.push("/tenant");
    }
  };

  async function submit() {
    setError("");
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 6) next.password = "Use at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;

    // Check for explicit demo credentials
    if (email.toLowerCase() === "tenant@demo.nivasa" || email.toLowerCase() === "demo.tenant@nivasa.living") {
      signIn(DEMO_TENANT);
      toast("Signed in as Demo Tenant.");
      router.push("/tenant");
      return;
    }

    if (email.toLowerCase() === "owner@demo.nivasa" || email.toLowerCase() === "demo.owner@nivasa.living") {
      signIn(DEMO_OWNER);
      toast("Signed in as Demo Owner.");
      router.push("/owner");
      return;
    }

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

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        fetch("/api/notify/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name: data.user.user_metadata?.name }),
        }).catch(() => {});

        const role = (profile?.role || data.user.user_metadata?.role || activeRole) as UserRole;
        signIn(
          makeUser({
            name: data.user.user_metadata?.name || email.split("@")[0],
            email,
            role,
          })
        );
        router.push(role === "owner" ? "/owner" : "/tenant");
        return;
      }

      // Local / Demo auth fallback
      const detectedRole =
        email.toLowerCase().includes("owner") || activeRole === "owner" ? "owner" : "tenant";

      signIn(
        makeUser({
          name: email.split("@")[0],
          email,
          role: detectedRole,
        })
      );
      toast(`Signed in as ${detectedRole === "owner" ? "Owner" : "Tenant"}.`);
      router.push(detectedRole === "owner" ? "/owner" : "/tenant");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-12 sm:py-20">
      <div className="rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card dark:bg-[#1a281f] p-7 sm:p-9 shadow-xl shadow-warm-300/30 dark:shadow-none">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <NivasaLogo variant="mark" size="sm" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#7ca982]/15 px-3 py-1 text-xs font-semibold text-[#1d3122] dark:text-[#a3caa6] border border-[#7ca982]/30">
            Nivasa Authentication
          </div>
          <h1 className="mt-3 text-3xl font-serif font-bold tracking-tight text-ink dark:text-cream">
            Welcome Back to Nivasa
          </h1>
          <p className="mt-1.5 text-xs text-ink-muted">
            Authenticate to access your role-specific dashboard and workspace.
          </p>
        </div>

        {/* Section 3: Role Selection Tabs (Tenant | Owner) */}
        <div className="mt-6 flex rounded-2xl bg-paper dark:bg-[#142018] p-1 border border-[#e5dfc5] dark:border-[#2a3f31]">
          <button
            type="button"
            onClick={() => setActiveRole("tenant")}
            className={cn(
              "flex-1 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
              activeRole === "tenant"
                ? "bg-white dark:bg-[#1f2e24] text-[#1d3122] dark:text-[#f5f9f6] shadow-xs"
                : "text-ink-muted hover:text-ink"
            )}
          >
            <span>Tenant</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveRole("owner")}
            className={cn(
              "flex-1 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
              activeRole === "owner"
                ? "bg-white dark:bg-[#1f2e24] text-[#1d3122] dark:text-[#f5f9f6] shadow-xs"
                : "text-ink-muted hover:text-ink"
            )}
          >
            <span>Owner</span>
          </button>
        </div>

        {/* Section 20: Pre-configured Development Demo Users */}
        <div className="mt-4 rounded-2xl border border-[#7ca982]/30 bg-[#7ca982]/10 p-3">
          <p className="text-[11px] font-semibold text-ink-muted mb-2 text-center">
            One-Click Development Demo Access:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoSignIn("tenant")}
              className="rounded-xl bg-[#7ca982] hover:bg-[#6b9a71] text-white py-2 px-2.5 text-xs font-semibold shadow-xs transition-colors flex flex-col items-center justify-center text-center cursor-pointer"
            >
              <span className="font-bold">Tenant Demo</span>
              <span className="text-[9px] opacity-80">tenant@demo.nivasa</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn("owner")}
              className="rounded-xl bg-amber-700 hover:bg-amber-800 text-white py-2 px-2.5 text-xs font-semibold shadow-xs transition-colors flex flex-col items-center justify-center text-center cursor-pointer"
            >
              <span className="font-bold">Owner Demo</span>
              <span className="text-[9px] opacity-80">owner@demo.nivasa</span>
            </button>
          </div>
        </div>

        <div className="relative my-5 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e5dfc5] dark:border-[#2a3f31]" />
          </div>
          <span className="relative bg-card dark:bg-[#1a281f] px-3 text-[10px] font-semibold text-ink-muted uppercase">
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
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <Field
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
            error={errors.email}
            placeholder={activeRole === "owner" ? "owner@demo.nivasa" : "tenant@demo.nivasa"}
            required
          />

          <div>
            <Field
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={setPassword}
              error={errors.password}
              placeholder="••••••••"
              required
            />
            <div className="mt-1.5 text-right">
              <Link href="/forgot-password" className="text-xs text-[#57875d] dark:text-[#a3caa6] font-semibold hover:underline">
                Forgot Password?
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Authenticating..." : "Login"}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-ink-muted">
          Don&apos;t have an account?{" "}
          <Link className="font-semibold text-[#57875d] dark:text-[#a3caa6] hover:underline" href={`/register?role=${activeRole}`}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <SiteShell>
      <Suspense fallback={<div className="py-20 text-center text-xs text-ink-muted">Loading authentication...</div>}>
        <LoginForm />
      </Suspense>
    </SiteShell>
  );
}
