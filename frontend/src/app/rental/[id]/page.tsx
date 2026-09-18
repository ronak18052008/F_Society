"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Timeline } from "@/components/ui/timeline";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  activity as demoActivity,
  maintenance as demoMaintenance,
  payments as demoPayments,
  workspace as demoWorkspace,
} from "@/data/demo";
import { formatInr } from "@/lib/format";
import {
  getWorkspace,
  getWorkspaceActivity,
  getWorkspaceMaintenance,
  getWorkspacePayments,
} from "@/lib/supabase/workspace";
import { getPropertyById } from "@/lib/supabase/properties";
import type { RentalWorkspace, ActivityEvent, MaintenanceRequest, PaymentRecord, Property } from "@/types";

export default function RentalDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const [workspaceData, setWorkspaceData] = useState<RentalWorkspace>(demoWorkspace);
  const [propertyData, setPropertyData] = useState<Property | null>(null);
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceRequest[]>(demoMaintenance);
  const [paymentsList, setPaymentsList] = useState<PaymentRecord[]>(demoPayments);
  const [activityList, setActivityList] = useState<ActivityEvent[]>(demoActivity);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      try {
        const ws = await getWorkspace(id);
        if (active && ws) {
          setWorkspaceData(ws);
          const prop = await getPropertyById(ws.propertyId);
          if (active && prop) setPropertyData(prop);
        }

        const [acts, maints, pays] = await Promise.all([
          getWorkspaceActivity(id),
          getWorkspaceMaintenance(id),
          getWorkspacePayments(id),
        ]);

        if (active) {
          if (acts && acts.length > 0) setActivityList(acts);
          if (maints && maints.length > 0) setMaintenanceList(maints);
          if (pays && pays.length > 0) setPaymentsList(pays);
        }
      } catch (err) {
        console.warn("Failed to load workspace:", err);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <DashboardShell title="Shared rental">
      <p className="text-sm text-ink-soft">
        Tenant {workspaceData.tenantName} · Owner {workspaceData.ownerName}. Verified tenancy workspace.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href={`/rental/${id}/documents`} className="border border-line p-5 transition-colors hover:border-bronze">
          <p className="font-serif text-xl">Documents</p>
          <p className="mt-1 text-xs text-ink-soft">Lease agreements & identity records</p>
        </Link>
        <Link href={`/rental/${id}/payments`} className="border border-line p-5 transition-colors hover:border-bronze">
          <p className="font-serif text-xl">Payments & bills</p>
          <p className="mt-1 text-xs text-ink-soft">Rent receipts & utility payments</p>
        </Link>
        <Link href={`/rental/${id}/passport`} className="border border-line p-5 transition-colors hover:border-bronze">
          <p className="font-serif text-xl">Condition passport</p>
          <p className="mt-1 text-xs text-ink-soft">Baseline inspection & handover log</p>
        </Link>
      </div>
      <section className="mt-10 border border-line p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          Agreement summary
        </p>
        <p className="mt-2">{workspaceData.agreementSummary || "12-month standard residential tenancy agreement."}</p>
        <p className="mt-2 text-sm text-ink-soft">
          {propertyData?.title || "Property"} · rent {formatInr(workspaceData.rent)} · deposit{" "}
          {formatInr(workspaceData.deposit)}
        </p>
      </section>
      <h2 className="mt-12 font-serif text-3xl">Maintenance</h2>
      <ul className="mt-4 space-y-2">
        {maintenanceList.map((item) => (
          <li key={item.id} className="flex items-center justify-between border border-line px-4 py-3">
            <div>
              <p>{item.title}</p>
              <p className="text-xs text-ink-soft">{item.note}</p>
            </div>
            <StatusBadge tone={item.status === "resolved" ? "ok" : "warn"}>{item.status}</StatusBadge>
          </li>
        ))}
      </ul>
      <h2 className="mt-12 font-serif text-3xl">Outstanding notices</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {paymentsList
          .filter((item) => item.status !== "paid")
          .map((item) => (
            <li key={item.id} className="border border-line px-4 py-3">
              {item.label} is currently {item.status}. Due {item.dueOn}.
            </li>
          ))}
      </ul>
      <h2 className="mt-12 font-serif text-3xl">Activity history</h2>
      <div className="mt-6">
        <Timeline events={activityList} />
      </div>
    </DashboardShell>
  );
}
