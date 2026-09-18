"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { makeUser, useNestora } from "@/store/nestora-store";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, toast } = useNestora();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit() {
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;
    signIn(
      makeUser({
        name: email.split("@")[0],
        email,
        role: "tenant",
      }),
    );
    toast("Signed in locally. No server session was created.");
    router.push("/tenant/dashboard");
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
