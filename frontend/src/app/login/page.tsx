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
      <div className="mx-auto max-w-md px-5 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
          Prototype auth
        </p>
        <h1 className="mt-3 font-serif text-5xl">Sign in</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Credentials are not checked against a database. This creates a local
          session in your browser.
        </p>
        {error && (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <Field
            label="Email"
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
            <div className="mt-1 text-right">
              <Link href="/forgot-password" className="text-xs text-bronze hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Continue"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-ink-soft">
          New here?{" "}
          <Link className="text-bronze" href="/register">
            Create an account
          </Link>
        </p>
      </div>
    </SiteShell>
  );
}
