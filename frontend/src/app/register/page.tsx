"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { makeUser, useNestora } from "@/store/nestora-store";
import { Suspense } from "react";

function RegisterForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { signIn, toast } = useNestora();
  const intent = params.get("intent");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const nextPath = useMemo(
    () => (intent === "owner" ? "/onboarding/owner" : "/onboarding/role"),
    [intent],
  );

  function submit() {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;
    signIn(
      makeUser({
        name,
        email,
        role: intent === "owner" ? "owner" : "tenant",
      }),
    );
    toast("Account exists only in this browser.");
    router.push(nextPath);
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
        Prototype registration
      </p>
      <h1 className="mt-3 font-serif text-5xl">Create account</h1>
      <form
        className="mt-8 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Field label="Full name" name="name" value={name} onChange={setName} error={errors.name} required />
        <Field
          label="Email"
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
        <Button type="submit">Continue</Button>
      </form>
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
