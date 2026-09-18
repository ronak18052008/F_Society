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
    <DashboardShell
      title="Tenancy Workspace"
      subtitle={`Collaborative digital ledger between ${workspaceData.tenantName} (Resident) and ${workspaceData.ownerName} (Host).`}
    >
      {/* 3 Portal Action Cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        <Link
          href={`/rental/${id}/documents`}
          className="group relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md hover:border-blue-500/40 transition-all duration-200"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Documents & Vault</p>
          <p className="mt-1 text-xs text-slate-500">Lease agreements & identity records →</p>
        </Link>

        <Link
          href={`/rental/${id}/payments`}
          className="group relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md hover:border-blue-500/40 transition-all duration-200"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">Payments & Ledger</p>
          <p className="mt-1 text-xs text-slate-500">RentTruth™ itemized receipts & utility bills →</p>
        </Link>

        <Link
          href={`/rental/${id}/passport`}
          className="group relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md hover:border-blue-500/40 transition-all duration-200"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">Condition Passport</p>
          <p className="mt-1 text-xs text-slate-500">Baseline inspection & handover log →</p>
        </Link>
      </div>

      {/* Agreement Terms Summary Card */}
      <div className="mt-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Agreement Baseline
          </span>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
            Mutual Record Active
          </span>
        </div>
        <p className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
          {workspaceData.agreementSummary || "12-month standard residential tenancy agreement."}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400">Property: </span>
            <strong className="text-slate-800 dark:text-slate-200">{propertyData?.title || "Navrangpura Residence"}</strong>
          </div>
          <div>
            <span className="text-slate-400">Monthly Rent: </span>
            <strong className="text-slate-800 dark:text-slate-200">{formatInr(workspaceData.rent)}</strong>
          </div>
          <div>
            <span className="text-slate-400">Security Deposit: </span>
            <strong className="text-slate-800 dark:text-slate-200">{formatInr(workspaceData.deposit)}</strong>
          </div>
        </div>
      </div>

      {/* Maintenance Tickets Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Maintenance Tickets</h2>
          <span className="text-xs text-slate-400">{maintenanceList.length} total logged</span>
        </div>
        <ul className="space-y-3">
          {maintenanceList.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3.5 shadow-xs"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.note}</p>
              </div>
              <StatusBadge tone={item.status === "resolved" ? "ok" : "warn"}>{item.status}</StatusBadge>
            </li>
          ))}
        </ul>
      </div>

      {/* Outstanding Notices */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Notices & Due Items</h2>
        <ul className="space-y-2.5">
          {paymentsList
            .filter((item) => item.status !== "paid")
            .map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20 px-4 py-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200"
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
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Activity Timeline</h2>
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <Timeline events={activityList} />
        </div>
      </div>
    </DashboardShell>
  );
}
