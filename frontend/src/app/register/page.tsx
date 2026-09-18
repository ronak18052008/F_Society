"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { makeUser, useNivasa } from "@/store/nivasa-store";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";

function RegisterForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { signIn, toast } = useNivasa();
  const intent = params.get("intent");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nextPath = useMemo(
    () => (intent === "owner" ? "/onboarding/owner" : "/onboarding/role"),
    [intent],
  );

  async function submit() {
    setError("");
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const role = intent === "owner" ? "owner" : "tenant";
      
      if (supabase) {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role,
            },
          },
        });

        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }

        toast("Check your email to confirm your account");
        router.push("/login");
        return;
      }

      // Fallback
      signIn(
        makeUser({
          name,
          email,
          role,
        }),
      );
      toast("Account exists only in this browser.");
      router.push(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16 sm:py-24">
      <div className="rounded-3xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-8 sm:p-10 shadow-xl shadow-warm-300/30 dark:shadow-none">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-pista/15 px-3 py-1 text-xs font-semibold text-forest dark:text-pista border border-pista/30">
            F_Society Network
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-serif font-bold tracking-tight text-ink dark:text-cream">
            Create Account
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-ink-muted">
            Join India&apos;s direct tenancy platform with itemized ledgers and condition passports.
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
          <div className="pt-2">
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account & Proceed"}
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-warm-200/60 dark:border-forest/30 text-center text-xs text-ink-muted">
          Already have an account?{" "}
          <Link className="font-semibold text-forest dark:text-pista hover:underline" href="/login">
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
      <Suspense fallback={<div className="px-5 py-16">Loading form…</div>}>
        <RegisterForm />
      </Suspense>
    </SiteShell>
  );
}
