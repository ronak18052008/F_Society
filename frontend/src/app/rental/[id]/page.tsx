"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Timeline } from "@/components/ui/timeline";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { activity, getProperty, maintenance, payments, workspace } from "@/data/demo";
import { formatInr } from "@/lib/format";

export default function RentalDashboardPage() {
  const { id } = useParams<{ id: string }>();
  if (id !== workspace.id) {
    return (
      <DashboardShell title="Workspace not found">
        <p className="text-sm text-ink-soft">
          Only the Navrangpura demo rental is available.
        </p>
        <Button href="/rental/rent-navrang">Open demo rental</Button>
      </DashboardShell>
    );
  }
  const property = getProperty(workspace.propertyId);

  return (
    <DashboardShell title="Shared rental">
      <p className="text-sm text-ink-soft">
        Tenant {workspace.tenantName} · Owner {workspace.ownerName}. Demo workspace
        only.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href="/rental/rent-navrang/documents" className="border border-line p-5">
          Documents
        </Link>
        <Link href="/rental/rent-navrang/payments" className="border border-line p-5">
          Payments & bills
        </Link>
        <Link href="/rental/rent-navrang/passport" className="border border-line p-5">
          Condition passport
        </Link>
      </div>
      <section className="mt-10 border border-line p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          Agreement
        </p>
        <p className="mt-2">{workspace.agreementSummary}</p>
        <p className="mt-2 text-sm text-ink-soft">
          {property?.title} · rent {formatInr(workspace.rent)} · deposit{" "}
          {formatInr(workspace.deposit)}
        </p>
      </section>
      <h2 className="mt-12 font-serif text-3xl">Maintenance</h2>
      <ul className="mt-4 space-y-2">
        {maintenance.map((item) => (
          <li key={item.id} className="flex items-center justify-between border border-line px-4 py-3">
            <div>
              <p>{item.title}</p>
              <p className="text-xs text-ink-soft">{item.note}</p>
            </div>
            <StatusBadge>{item.status}</StatusBadge>
          </li>
        ))}
      </ul>
      <h2 className="mt-12 font-serif text-3xl">Notifications</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {payments
          .filter((item) => item.status !== "paid")
          .map((item) => (
            <li key={item.id} className="border border-line px-4 py-3">
              {item.label} is {item.status}. No payment ran.
            </li>
          ))}
      </ul>
      <h2 className="mt-12 font-serif text-3xl">Activity</h2>
      <div className="mt-6">
        <Timeline events={activity} />
      </div>
    </DashboardShell>
  );
}
