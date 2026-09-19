"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PropertyCard } from "@/components/property/property-card";
import { Timeline } from "@/components/ui/timeline";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  activity as demoActivity,
  maintenance as demoMaintenance,
  payments as demoPayments,
  properties as demoProperties,
} from "@/data/demo";
import { useNivasa } from "@/store/nivasa-store";
import { createClient } from "@/lib/supabase/client";
import { getProperties } from "@/lib/supabase/properties";
import {
  getWorkspacePayments,
  getWorkspaceMaintenance,
  getWorkspaceActivity,
} from "@/lib/supabase/workspace";
import { RoleGuard } from "@/components/auth/role-guard";
import { MarketTrends } from "@/components/dashboard/market-trends";
import { MaintenanceTriageModal } from "@/components/maintenance/maintenance-triage-modal";
import type { ActivityEvent, MaintenanceRequest, PaymentRecord, Property } from "@/types";

export default function TenantDashboardPage() {
  const { savedIds, user } = useNivasa();
  const [allProperties, setAllProperties] = useState<Property[]>(demoProperties);
  const [workspacePayments, setWorkspacePayments] = useState<PaymentRecord[]>(demoPayments);
  const [workspaceMaintenance, setWorkspaceMaintenance] = useState<MaintenanceRequest[]>(demoMaintenance);
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>(demoActivity);
  const [userSavedIds, setUserSavedIds] = useState<string[]>(savedIds);

  useEffect(() => {
    let active = true;

    async function loadTenantData() {
      try {
        // Fetch properties (from Supabase if configured)
        const remoteProps = await getProperties();
        if (active && remoteProps && remoteProps.length > 0) {
          setAllProperties(remoteProps);
        }

        // Fetch live workspace telemetry for Navrangpura Courtyard
        const [livePayments, liveMaint, liveAct] = await Promise.all([
          getWorkspacePayments("rent-navrang"),
          getWorkspaceMaintenance("rent-navrang"),
          getWorkspaceActivity("rent-navrang"),
        ]);

        if (active) {
          if (livePayments && livePayments.length > 0) setWorkspacePayments(livePayments);
          if (liveMaint && liveMaint.length > 0) setWorkspaceMaintenance(liveMaint);
          if (liveAct && liveAct.length > 0) setActivityFeed(liveAct);
        }

        // If authenticated with Supabase, fetch persisted saved_properties
        const supabase = createClient();
        if (supabase && user?.supabaseId) {
          const { data: dbSaved } = await supabase
            .from("saved_properties")
            .select("property_id")
            .eq("user_id", user.supabaseId);

          if (active && dbSaved && dbSaved.length > 0) {
            const dbIds = dbSaved.map((s: { property_id: string }) => s.property_id);
            setUserSavedIds(Array.from(new Set([...savedIds, ...dbIds])));
          }
        }
      } catch (err) {
        console.warn("Failed to load live tenant telemetry:", err);
      }
    }

    loadTenantData();
    return () => {
      active = false;
    };
  }, [user, savedIds]);

  const saved = allProperties.filter((item) => userSavedIds.includes(item.id));
  const unpaid = workspacePayments.filter((item) => item.status !== "paid");

  return (
    <RoleGuard allowedRole="tenant">
      <DashboardShell
        title={`Welcome back${user?.name ? `, ${user.name}` : ""}`}
        subtitle="Your active tenancy workspace, financial ledger, and saved architectural residences."
      >
      {/* 3 Metric Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/rental/rent-navrang"
          className="group relative rounded-2xl border border-line bg-card p-5 shadow-card hover:shadow-card-hover hover:border-[#7ca982]/50 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Active Tenancy
            </span>
            <span className="h-2 w-2 rounded-full bg-[#7ca982]" />
          </div>
          <p className="mt-2 text-xl font-serif font-bold text-ink group-hover:text-[#57875d] dark:group-hover:text-[#a3caa6] transition-colors">
            Navrangpura Courtyard
          </p>
          <p className="mt-1 text-xs text-ink-muted">Ahmedabad · Verified Workspace →</p>
        </Link>

        <Link
          href="/rental/rent-navrang/payments"
          className="group relative rounded-2xl border border-line bg-card p-5 shadow-card hover:shadow-card-hover hover:border-[#7ca982]/50 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Rent & Dues
            </span>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">
              {unpaid.length} Pending
            </span>
          </div>
          <p className="mt-2 text-xl font-serif font-bold text-ink group-hover:text-[#57875d] dark:group-hover:text-[#a3caa6] transition-colors">
            {unpaid.length ? "Payment Due" : "All Clear"}
          </p>
          <p className="mt-1 text-xs text-ink-muted">RentTruth™ itemized receipts →</p>
        </Link>

        <Link
          href="/rental/rent-navrang"
          className="group relative rounded-2xl border border-line bg-card p-5 shadow-card hover:shadow-card-hover hover:border-[#7ca982]/50 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Maintenance
            </span>
            <span className="rounded-full bg-[#7ca982]/15 px-2 py-0.5 text-[10px] font-bold text-[#1d3122] dark:text-[#a3caa6]">
              {workspaceMaintenance.filter((item) => item.status !== "resolved").length} In Progress
            </span>
          </div>
          <p className="mt-2 text-xl font-serif font-bold text-ink group-hover:text-[#57875d] dark:group-hover:text-[#a3caa6] transition-colors">
            Ticket Records
          </p>
          <p className="mt-1 text-xs text-ink-muted">Condition Passport & repairs →</p>
        </Link>
      </div>

      {/* AI Maintenance Triage Banner */}
      <div className="mt-8 rounded-2xl border border-warm-200/90 dark:border-forest/40 bg-gradient-to-br from-paper to-card p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pista/15 text-forest dark:text-pista">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-bold text-ink">AI Maintenance Triage</h3>
                <span className="rounded-full bg-forest/10 dark:bg-pista/20 px-2 py-0.5 text-[10px] font-bold text-forest dark:text-pista uppercase tracking-wider">
                  Feature 4
                </span>
              </div>
              <p className="mt-0.5 text-xs text-ink-muted max-w-xl leading-relaxed">
                Describe an issue or upload a photo to immediately assess category, severity, emergency risks, and tenant safety actions.
              </p>
            </div>
          </div>
          <MaintenanceTriageModal
            propertyId="rent-navrang"
            propertyTitle="Navrangpura Courtyard"
            buttonLabel="Triage Issue with AI"
            onTicketCreated={(ticket) => {
              setWorkspaceMaintenance((prev) => [
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
      </div>

      {/* Tenancy Notifications Feed */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-bold text-ink">Workspace Alerts</h2>
          <span className="text-xs text-ink-muted">Live Sync</span>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between rounded-xl border border-line bg-card px-4 py-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-xs sm:text-sm font-medium text-ink">
                September rent is pending in the itemized ledger.
              </span>
            </div>
            <StatusBadge tone="warn">Due</StatusBadge>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-line bg-card px-4 py-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-[#6E9271]" />
              <span className="text-xs sm:text-sm font-medium text-ink">
                Plumbing / kitchen tap repair ticket acknowledged by owner.
              </span>
            </div>
            <StatusBadge tone="ok">In Progress</StatusBadge>
          </div>
        </div>
      </div>

      {/* Saved Residences Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-serif font-bold text-ink">Shortlisted Residences</h2>
            <p className="text-xs text-ink-muted mt-0.5">Homes you have pinned for comparison</p>
          </div>
          <Button href="/homes" variant="outline" size="sm">
            Browse All Homes →
          </Button>
        </div>
        {saved.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {saved.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line p-8 text-center bg-paper">
            <p className="text-sm text-ink-muted">You haven&apos;t shortlisted any residences yet.</p>
            <div className="mt-4">
              <Button href="/homes" size="sm">
                Explore Available Residences
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Timeline */}
      <div className="mt-12">
        <h2 className="text-xl font-serif font-bold text-ink mb-6">Chronological Tenancy Log</h2>
        <div className="rounded-2xl border border-line bg-card p-6 shadow-card">
          <Timeline events={activityFeed} />
        </div>
      </div>

      {/* AI Tenancy Assistant Banner */}
      <div className="mt-10 rounded-2xl border border-[#6E9271]/30 bg-gradient-to-r from-[#6E9271]/10 via-[#8FA89B]/5 to-transparent p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-serif font-bold text-ink">Need tailored rental suggestions?</h3>
          <p className="text-xs text-ink-muted mt-1">
            Describe your preferred commute, sunlight preference, or family requirements in plain conversational language.
          </p>
        </div>
        <Button href="/ai/recommend" size="md">
          Ask Nivasa AI →
        </Button>
      </div>

      {/* Metropolitan Market Trends Analytics */}
      <div className="mt-12 pt-8 border-t border-line">
        <MarketTrends />
      </div>
    </DashboardShell>
  </RoleGuard>
  );
}
