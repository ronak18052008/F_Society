"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PropertyCard } from "@/components/property/property-card";
import { Timeline } from "@/components/ui/timeline";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { activity, getProperty, maintenance, payments, properties } from "@/data/demo";
import { useNestora } from "@/store/nestora-store";
import { formatInr } from "@/lib/format";

export default function TenantDashboardPage() {
  const { savedIds, user } = useNestora();
  const saved = properties.filter((item) => savedIds.includes(item.id));
  const unpaid = payments.filter((item) => item.status !== "paid");

  return (
    <DashboardShell title={`Hello${user?.name ? `, ${user.name}` : ""}`}>
      <p className="mb-8 text-sm text-ink-soft">
        Overview of the demo rental plus locally saved homes.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/rental/rent-navrang" className="border border-line p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            Active rental
          </p>
          <p className="mt-2 font-serif text-2xl">Navrangpura courtyard</p>
          <p className="text-sm text-ink-soft">Demo workspace</p>
        </Link>
        <Link href="/rental/rent-navrang/payments" className="border border-line p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            Payments
          </p>
          <p className="mt-2 font-serif text-2xl">{unpaid.length} open</p>
          <p className="text-sm text-ink-soft">Not processed</p>
        </Link>
        <Link href="/rental/rent-navrang" className="border border-line p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            Maintenance
          </p>
          <p className="mt-2 font-serif text-2xl">
            {maintenance.filter((item) => item.status !== "resolved").length} open
          </p>
        </Link>
      </div>
      <h2 className="mt-12 font-serif text-3xl">Notifications</h2>
      <ul className="mt-4 space-y-2 text-sm">
        <li className="flex justify-between border border-line px-4 py-3">
          <span>September rent is marked unpaid in the demo ledger.</span>
          <StatusBadge tone="warn">Demo</StatusBadge>
        </li>
        <li className="flex justify-between border border-line px-4 py-3">
          <span>Kitchen tap request is in progress.</span>
          <StatusBadge>Maintenance</StatusBadge>
        </li>
      </ul>
      <h2 className="mt-12 font-serif text-3xl">Saved homes</h2>
      {saved.length ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {saved.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-ink-soft">
          Nothing saved yet.{" "}
          <Link className="text-bronze" href="/homes">
            Browse homes
          </Link>
        </p>
      )}
      <h2 className="mt-12 font-serif text-3xl">Recent activity</h2>
      <div className="mt-6">
        <Timeline events={activity} />
      </div>
      <div className="mt-10">
        <Button href="/ai/recommend" variant="line">
          Describe a search in words
        </Button>
      </div>
      <p className="mt-6 text-xs text-ink-soft">
        Sample listing still open: {getProperty("prop-indiranagar")?.title} ·{" "}
        {formatInr(getProperty("prop-indiranagar")?.rent ?? 0)}
      </p>
    </DashboardShell>
  );
}
