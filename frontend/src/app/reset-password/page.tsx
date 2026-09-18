"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useNivasa } from "@/store/nivasa-store";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { toast } = useNivasa();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    
    if (!supabase) {
      setError("Password reset requires Supabase configuration.");
      toast("Supabase not configured in this build.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      toast(updateError.message);
      setLoading(false);
    } else {
      toast("Your password has been reset successfully. Please sign in.");
      router.push("/login");
    }
  };

  return (
    <SiteShell>
      <section className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-8 sm:p-10 shadow-xl shadow-warm-300/30 dark:shadow-none">
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pista/15 px-3 py-1 text-xs font-semibold text-forest dark:text-pista border border-pista/30 mb-3">
              Security Credentials
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-ink dark:text-cream">
              Create a new password
            </h1>
            <p className="mt-2 text-xs text-ink-muted">
              Set a strong password for your verified Nivasa account.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 p-3.5 text-xs font-medium text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="New Password"
              name="password"
              type="password"
              required
              value={password}
              onChange={setPassword}
              placeholder="Minimum 8 characters"
            />
            <Field
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Re-enter password"
            />
            <Button type="submit" disabled={loading} fullWidth size="lg">
              {loading ? "Updating credentials..." : "Update Password & Sign In"}
            </Button>
          </form>
        </div>
      </section>
    </SiteShell>
  );
}
