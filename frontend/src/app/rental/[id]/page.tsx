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
import { MaintenanceTriageModal } from "@/components/maintenance/maintenance-triage-modal";
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
    <DashboardShell
      title="Tenancy Workspace"
      subtitle={`Collaborative digital ledger between ${workspaceData.tenantName} (Resident) and ${workspaceData.ownerName} (Host).`}
    >
      {/* 4 Portal Action Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href={`/rental/${id}/documents`}
          className="group relative rounded-2xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-6 shadow-xs hover:shadow-md hover:border-pista transition-all duration-200"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pista/15 text-forest dark:text-pista mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-lg font-serif font-bold text-ink dark:text-cream group-hover:text-forest dark:group-hover:text-pista transition-colors">Documents & Vault</p>
          <p className="mt-1 text-xs text-ink-muted">Lease agreements & identity records →</p>
        </Link>

        <Link
          href={`/rental/${id}/payments`}
          className="group relative rounded-2xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-6 shadow-xs hover:shadow-md hover:border-pista transition-all duration-200"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pista/15 text-forest dark:text-pista mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-lg font-serif font-bold text-ink dark:text-cream group-hover:text-forest dark:group-hover:text-pista transition-colors">Payments & Ledger</p>
          <p className="mt-1 text-xs text-ink-muted">RentTruth™ itemized receipts & utility bills →</p>
        </Link>

        <Link
          href={`/rental/${id}/passport`}
          className="group relative rounded-2xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-6 shadow-xs hover:shadow-md hover:border-pista transition-all duration-200"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pista/15 text-forest dark:text-pista mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </div>
          <p className="text-lg font-serif font-bold text-ink dark:text-cream group-hover:text-forest dark:group-hover:text-pista transition-colors">Condition Passport</p>
          <p className="mt-1 text-xs text-ink-muted">Baseline inspection & handover log →</p>
        </Link>

        <Link
          href="/tenant/expenses"
          className="group relative rounded-2xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-6 shadow-xs hover:shadow-md hover:border-pista transition-all duration-200"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7ca982]/15 text-[#1d3122] dark:text-[#a3caa6] mb-3 group-hover:scale-110 transition-transform">
            <span className="text-xl">💰</span>
          </div>
          <p className="text-lg font-serif font-bold text-ink dark:text-cream group-hover:text-forest dark:group-hover:text-pista transition-colors">Roommate Splits</p>
          <p className="mt-1 text-xs text-ink-muted">Smart bill split engine &amp; peer settlement →</p>
        </Link>
      </div>

      {/* Agreement Terms Summary Card */}
      <div className="mt-8 rounded-2xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            Agreement Baseline
          </span>
          <span className="rounded-full bg-pista/15 px-3 py-1 text-[11px] font-bold text-forest dark:text-pista border border-pista/30">
            Mutual Record Active
          </span>
        </div>
        <p className="mt-3 text-base font-serif font-semibold text-ink dark:text-cream">
          {workspaceData.agreementSummary || "12-month standard residential tenancy agreement."}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-6 pt-4 border-t border-warm-200/60 dark:border-forest/30 text-xs">
          <div>
            <span className="text-ink-muted">Property: </span>
            <strong className="text-ink dark:text-cream">{propertyData?.title || "Navrangpura Residence"}</strong>
          </div>
          <div>
            <span className="text-ink-muted">Monthly Rent: </span>
            <strong className="text-ink dark:text-cream">{formatInr(workspaceData.rent)}</strong>
          </div>
          <div>
            <span className="text-ink-muted">Security Deposit: </span>
            <strong className="text-ink dark:text-cream">{formatInr(workspaceData.deposit)}</strong>
          </div>
        </div>
      </div>

      {/* Maintenance Tickets Section */}
      <div className="mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-ink dark:text-cream">Maintenance Tickets</h2>
            <span className="text-xs text-ink-muted">{maintenanceList.length} total logged · AI Triage enabled</span>
          </div>
          <MaintenanceTriageModal
            propertyId={id}
            propertyTitle={propertyData?.title || "Rental Residence"}
            onTicketCreated={(ticket) => {
              setMaintenanceList((prev) => [
                {
                  id: ticket.id,
                  title: `[${ticket.category}] ${ticket.summary}`,
                  area: ticket.room || "Residence",
                  status: "open",
                  openedAt: new Date().toISOString().split("T")[0],
                  note: `Severity: ${ticket.severity} · Urgency: ${ticket.urgency}`,
                },
                ...prev,
              ]);
            }}
          />
        </div>
        <ul className="space-y-3">
          {maintenanceList.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark px-5 py-3.5 shadow-xs"
            >
              <div>
                <p className="text-sm font-semibold text-ink dark:text-cream">{item.title}</p>
                <p className="text-xs text-ink-muted mt-0.5">{item.note}</p>
              </div>
              <StatusBadge tone={item.status === "resolved" ? "ok" : "warn"}>{item.status}</StatusBadge>
            </li>
          ))}
        </ul>
      </div>

      {/* Outstanding Notices */}
      <div className="mt-10">
        <h2 className="text-xl font-serif font-bold text-ink dark:text-cream mb-4">Notices & Due Items</h2>
        <ul className="space-y-2.5">
          {paymentsList
            .filter((item) => item.status !== "paid")
            .map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs sm:text-sm text-ink dark:text-cream"
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>{item.label} is currently marked <strong className="uppercase">{item.status}</strong>.</span>
                </div>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Due {item.dueOn}</span>
              </li>
            ))}
        </ul>
      </div>

      {/* Activity History Timeline */}
      <div className="mt-12">
        <h2 className="text-xl font-serif font-bold text-ink dark:text-cream mb-6">Activity Timeline</h2>
        <div className="rounded-2xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-6 shadow-xs">
          <Timeline events={activityList} />
        </div>
      </div>
    </DashboardShell>
  );
}
