"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useNivasa } from "@/store/nivasa-store";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useNivasa();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    if (!supabase) {
      setError("Password reset requires Supabase configuration.");
      toast("Supabase not configured in this build.");
      setLoading(false);
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined,
    });

    if (resetError) {
      setError(resetError.message);
      toast(resetError.message);
    } else {
      setSuccess(true);
      toast("Reset link sent! Please check your email inbox.");
    }
    setLoading(false);
  };

  return (
    <SiteShell>
      <section className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl">
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3">
              Account Recovery
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Reset your password
            </h1>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Enter your registered email and we&apos;ll dispatch a secure recovery link.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 p-3.5 text-xs font-medium text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {success ? (
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-6 text-center">
              ✓ Recovery link dispatched! Please check your email inbox to reset your password.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                label="Registered Email"
                name="email"
                type="email"
                required
                value={email}
                onChange={setEmail}
                placeholder="resident@example.com"
              />
              <Button type="submit" disabled={loading} fullWidth size="lg">
                {loading ? "Dispatching link..." : "Send Recovery Link"}
              </Button>
            </form>
          )}

          <div className="mt-6 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-center">
            <Link
              href="/login"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Sign in
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
