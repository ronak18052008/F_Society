"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useNestora } from "@/store/nestora-store";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, signIn, toast } = useNestora();
  const [name, setName] = useState(user?.name ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  return (
    <SiteShell>
      <div className="mx-auto max-w-lg px-5 py-16">
        <h1 className="font-serif text-5xl">Profile</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Phone is optional and never submitted to a server in this build.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!user || name.trim().length < 2) return;
            signIn({ ...user, name, city, phone });
            toast("Profile updated in local storage.");
            router.push(
              user.role === "owner" ? "/owner/dashboard" : "/tenant/dashboard",
            );
          }}
        >
          <Field label="Display name" name="name" value={name} onChange={setName} required />
          <Field label="City" name="city" value={city} onChange={setCity} />
          <Field label="Phone" name="phone" value={phone} onChange={setPhone} />
          <Button type="submit">Enter workspace</Button>
        </form>
      </div>
    </SiteShell>
  );
}
