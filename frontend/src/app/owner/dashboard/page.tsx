"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { getProperty, maintenance, payments, properties } from "@/data/demo";
import { useNestora } from "@/store/nestora-store";
import { formatInr } from "@/lib/format";

export default function OwnerDashboardPage() {
  const { drafts, enquiries } = useNestora();
  const listed = properties.filter((item) => item.ownerId === "own-mehta");

  return (
    <DashboardShell title="Owner overview">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="border border-line p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            Listings
          </p>
          <p className="mt-2 font-serif text-3xl">{listed.length + drafts.length}</p>
        </div>
        <div className="border border-line p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            Enquiries
          </p>
          <p className="mt-2 font-serif text-3xl">{enquiries.length}</p>
        </div>
        <div className="border border-line p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            Open maintenance
          </p>
          <p className="mt-2 font-serif text-3xl">
            {maintenance.filter((item) => item.status !== "resolved").length}
          </p>
        </div>
      </div>
      <div className="mt-8">
        <Button href="/owner/properties/new">Add property</Button>
      </div>
      <h2 className="mt-12 font-serif text-3xl">Listed properties</h2>
      <ul className="mt-4 divide-y divide-line border border-line">
        {listed.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <Link href={`/owner/properties/${item.id}`} className="font-medium hover:text-bronze">
                {item.title}
              </Link>
              <p className="text-xs text-ink-soft">
                {item.city} · {formatInr(item.rent)}
              </p>
            </div>
            <StatusBadge tone="demo">Demo</StatusBadge>
          </li>
        ))}
        {drafts.map((draft) => (
          <li key={draft.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p>{draft.title}</p>
              <p className="text-xs text-ink-soft">
                {draft.city} · local draft
              </p>
            </div>
            <StatusBadge tone="warn">Draft</StatusBadge>
          </li>
        ))}
      </ul>
      <h2 className="mt-12 font-serif text-3xl">Enquiries</h2>
      <ul className="mt-4 space-y-3">
        {enquiries.map((item) => (
          <li key={item.id} className="border border-line p-4 text-sm">
            <p className="font-medium">{item.fromName}</p>
            <p className="text-ink-soft">
              {getProperty(item.propertyId)?.title ?? item.propertyId}
            </p>
            <p className="mt-2">{item.message}</p>
          </li>
        ))}
      </ul>
      <h2 className="mt-12 font-serif text-3xl">Payment overview</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Ledger is illustrative. {payments.filter((item) => item.status === "unpaid").length}{" "}
        item marked unpaid in the shared demo rental.
      </p>
    </DashboardShell>
  );
}
