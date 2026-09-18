"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { makeUser, useNestora } from "@/store/nestora-store";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, toast } = useNestora();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email.";
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

        // Fetch user profile to get role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        // Fire login notification asynchronously
        fetch("/api/notify/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name: data.user.user_metadata?.name }),
        }).catch(() => {});

        const role = profile?.role || data.user.user_metadata?.role || "tenant";
        router.push(role === "owner" ? "/owner/dashboard" : "/tenant/dashboard");
        return;
      }

      // Fallback if no Supabase config
      signIn(
        makeUser({
          name: email.split("@")[0],
          email,
          role: "tenant",
        }),
      );
      toast("Signed in locally. No server session was created.");
      router.push("/tenant/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-md px-4 sm:px-6 py-16 sm:py-24">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
              NIVASA Identity
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome Back
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Sign in to manage your tenancy workspace, RentTruth™ ledger, and condition passports.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-600 dark:text-rose-300 font-medium">
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
            <Field
              label="Email Address"
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
                <Link href="/forgot-password" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
            <div className="pt-2">
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Authenticating..." : "Sign In to Workspace"}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            Don&apos;t have an account yet?{" "}
            <Link className="font-semibold text-blue-600 dark:text-blue-400 hover:underline" href="/register">
              Create a free account
            </Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
