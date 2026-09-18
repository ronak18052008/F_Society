"use client";

import { useState, useEffect } from "react";
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

export default function LoginPage() {
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

  const handleDemoSignIn = () => {
    if (activeRole === "owner") {
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

        const role = profile?.role || data.user.user_metadata?.role || activeRole;
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

      // Local fallback
      signIn(
        makeUser({
          name: email.split("@")[0],
          email,
          role: activeRole,
        })
      );
      toast(`Signed in as ${activeRole === "owner" ? "Owner" : "Tenant"}.`);
      router.push(activeRole === "owner" ? "/owner" : "/tenant");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-md px-4 sm:px-6 py-12 sm:py-20">
        <div className="rounded-3xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-7 sm:p-9 shadow-xl shadow-warm-300/30 dark:shadow-none">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <NivasaLogo variant="mark" size="sm" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-pista/15 px-3 py-1 text-xs font-semibold text-forest dark:text-pista border border-pista/30">
              Nivasa Identity
            </div>
            <h1 className="mt-3 text-3xl font-serif font-bold tracking-tight text-ink dark:text-cream">
              Welcome Back
            </h1>
            <p className="mt-1.5 text-xs text-ink-muted">
              {activeRole === "owner"
                ? "Manage properties, tenant inquiries, leases, and operations with Nivasa."
                : "Find verified homes, understand rental costs, and manage your tenancy with Nivasa."}
            </p>
          </div>

          {/* Role-selection tabs */}
          <div className="mt-6 flex rounded-2xl bg-paper dark:bg-[#1d2d22] p-1 border border-[#e5dfc5] dark:border-[#2a3f31]">
            <button
              type="button"
              onClick={() => setActiveRole("tenant")}
              className={cn(
                "flex-1 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                activeRole === "tenant"
                  ? "bg-white dark:bg-[#142018] text-ink shadow-xs"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              <span>[Tenant Member]</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRole("owner")}
              className={cn(
                "flex-1 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                activeRole === "owner"
                  ? "bg-white dark:bg-[#142018] text-ink shadow-xs"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              <span>[Property Owner / Landlord]</span>
            </button>
          </div>

          {/* 1-Click Demo Shortcut */}
          <div className="mt-4 rounded-2xl border border-[#7ca982]/30 bg-[#7ca982]/10 p-3 text-center">
            <p className="text-[11px] text-ink-muted mb-1.5">
              Instant 1-click test as {activeRole === "owner" ? "Owner" : "Tenant"}:
            </p>
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full rounded-xl bg-[#7ca982] hover:bg-[#6b9471] text-white py-1.5 px-3 text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span>1-Click Demo {activeRole === "owner" ? "Owner" : "Tenant"} Sign In</span>
            </button>
          </div>

          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5dfc5] dark:border-[#2a3f31]" />
            </div>
            <span className="relative bg-card dark:bg-card-dark px-3 text-[10px] font-semibold text-ink-muted uppercase">
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
              label={activeRole === "owner" ? "Owner Email Address" : "Tenant Email Address"}
              name="email"
              type="email"
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
                value={password}
                onChange={setPassword}
                error={errors.password}
                required
              />
              <div className="mt-1.5 text-right">
                <Link href="/forgot-password" className="text-xs text-forest dark:text-pista font-semibold hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
            <div className="pt-2">
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Authenticating..." : `Sign In as ${activeRole === "owner" ? "Owner" : "Tenant"}`}
              </Button>
            </div>
          </form>

          {/* Direct links to dedicated portals */}
          <div className="mt-5 pt-4 border-t border-warm-200/60 dark:border-forest/30 flex items-center justify-between text-[11px]">
            <Link href="/login/tenant" className="text-[#57875d] dark:text-[#a3caa6] font-semibold hover:underline">
              Dedicated Tenant Login →
            </Link>
            <Link href="/login/owner" className="text-[#57875d] dark:text-[#a3caa6] font-semibold hover:underline">
              Dedicated Owner Login →
            </Link>
          </div>

          <div className="mt-4 text-center text-xs text-ink-muted">
            Don&apos;t have an account yet?{" "}
            <Link className="font-semibold text-forest dark:text-pista hover:underline" href="/register">
              Create a free account
            </Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
