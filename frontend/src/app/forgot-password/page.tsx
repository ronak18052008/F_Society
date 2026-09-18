"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useNestora } from "@/store/nestora-store";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useNestora();

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
      <section className="py-24 px-4 min-h-[70vh] flex items-center justify-center">
        <div className="max-w-md w-full bg-paper p-8 border border-bronze/20 shadow-sm">
          <div className="mb-8">
            <div className="text-bronze uppercase font-mono text-sm mb-4 tracking-wider">Account recovery</div>
            <h1 className="text-3xl font-serif text-ink mb-2">Reset your password</h1>
            <p className="text-muted">Enter your email address and we&apos;ll send you a link to reset your password.</p>
          </div>

          {error && (
            <div className="mb-6 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success ? (
            <div className="bg-bronze/10 text-ink p-4 border border-bronze/30 mb-6">
              <p>Check your email for a reset link to set your new password.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Field
                label="Email"
                name="email"
                type="email"
                required
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Sending link..." : "Send reset link"}
              </Button>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-bronze hover:underline">
              Return to login
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
