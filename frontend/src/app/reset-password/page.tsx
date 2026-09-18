"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useNestora } from "@/store/nestora-store";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { toast } = useNestora();

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
      <section className="py-24 px-4 min-h-[70vh] flex items-center justify-center">
        <div className="max-w-md w-full bg-paper p-8 border border-bronze/20 shadow-sm">
          <div className="mb-8">
            <div className="text-bronze uppercase font-mono text-sm mb-4 tracking-wider">Account recovery</div>
            <h1 className="text-3xl font-serif text-ink mb-2">Choose a new password</h1>
            <p className="text-muted">Enter a new password for your account.</p>
          </div>

          {error && (
            <div className="mb-6 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Field
              label="New Password"
              name="password"
              type="password"
              required
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
            />
            <Field
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="••••••••"
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Updating password..." : "Update password"}
            </Button>
          </form>
        </div>
      </section>
    </SiteShell>
  );
}
