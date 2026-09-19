"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { getProperty, maintenance, payments, properties as demoProps } from "@/data/demo";
import { getOwnerProperties } from "@/lib/supabase/properties";
import { createClient } from "@/lib/supabase/client";
import { useNivasa } from "@/store/nivasa-store";
import { RoleGuard } from "@/components/auth/role-guard";
import { formatInr } from "@/lib/format";
import { MarketTrends } from "@/components/dashboard/market-trends";
import type { Property } from "@/types";

export default function OwnerDashboardPage() {
  const { drafts, enquiries: localEnquiries, user, toast } = useNivasa();
  const [listed, setListed] = useState<Property[]>(() =>
    demoProps.filter((item) => item.ownerId === "own-mehta"),
  );
  const [allEnquiries, setAllEnquiries] = useState(localEnquiries);

  useEffect(() => {
    let active = true;

    async function loadOwnerData() {
      const ownerId = user?.supabaseId || "own-mehta";
      try {
        const props = await getOwnerProperties(ownerId);
        if (active && props && props.length > 0) {
          setListed(props);
        }

        const supabase = createClient();
        if (supabase && user?.supabaseId) {
          const { data: dbEnquiries } = await supabase
            .from("enquiries")
            .select("*")
            .order("created_at", { ascending: false });

          if (active && dbEnquiries && dbEnquiries.length > 0) {
            type DBEnquiry = {
              id: string;
              property_id: string;
              from_name: string;
              message: string;
              status: "sent" | "seen" | "replied";
              created_at: string;
            };
            const mapped = (dbEnquiries as DBEnquiry[]).map((e) => ({
              id: e.id,
              propertyId: e.property_id,
              fromName: e.from_name,
              message: e.message,
              status: e.status,
              createdAt: e.created_at,
            }));
            setAllEnquiries([...mapped, ...localEnquiries]);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch owner remote data:", err);
      }
    }

    loadOwnerData();
    return () => {
      active = false;
    };
  }, [user, localEnquiries]);

  return (
    <RoleGuard allowedRole="owner">
      <DashboardShell
        title={`Owner Command Deck${user?.name ? ` · ${user.name}` : ""}`}
        subtitle="Manage your architectural portfolio, review verified tenant inquiries, and audit tenancy ledgers."
        actions={
          <Button href="/owner/properties/new" size="md">
            + List New Residence
          </Button>
        }
      >
      {/* 3 Metric Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Active Inventory
            </span>
            <span className="h-2 w-2 rounded-full bg-[#6E9271]" />
          </div>
          <p className="mt-2 text-3xl font-serif font-bold text-ink">
            {listed.length + drafts.length}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {listed.length} published · {drafts.length} in draft
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Tenant Enquiries
            </span>
            <span className="rounded-full bg-[#6E9271]/15 px-2 py-0.5 text-[10px] font-bold text-[#6E9271] dark:text-[#A3B899] border border-[#6E9271]/30">
              {allEnquiries.filter((e) => e.status !== "replied").length} Pending
            </span>
          </div>
          <p className="mt-2 text-3xl font-serif font-bold text-ink">
            {allEnquiries.length}
          </p>
          <p className="mt-1 text-xs text-ink-muted">Direct tenant applications</p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Active Tenancy Tickets
            </span>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
          </div>
          <p className="mt-2 text-3xl font-serif font-bold text-ink">
            {maintenance.filter((item) => item.status !== "resolved").length}
          </p>
          <p className="mt-1 text-xs text-ink-muted">Open maintenance requests</p>
        </div>
      </div>

      {/* Listed Properties Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-ink">Portfolio Residences</h2>
            <p className="text-xs text-ink-muted mt-0.5">Properties currently published or drafted</p>
          </div>
          <Button href="/owner/properties/new" variant="outline" size="sm">
            + Add Residence
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-card">
          <ul className="divide-y divide-line">
            {listed.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <div>
                  <Link
                    href={`/owner/properties/${item.id}`}
                    className="text-sm font-semibold text-ink hover:text-[#6E9271] transition-colors"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {item.locality}, {item.city} · <strong className="text-ink">{formatInr(item.rent)}</strong>/mo
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge tone={item.demo ? "demo" : "ok"}>
                    {item.demo ? "Demo" : "Active"}
                  </StatusBadge>
                  <Link
                    href={`/owner/properties/${item.id}`}
                    className="rounded-lg border border-line bg-paper px-3 py-1 text-xs font-semibold text-ink hover:border-[#6E9271] hover:text-[#6E9271] transition"
                  >
                    Manage
                  </Link>
                </div>
              </li>
            ))}
            {drafts.map((draft) => (
              <li
                key={draft.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">{draft.title}</p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {draft.city} · Local Draft
                  </p>
                </div>
                <StatusBadge tone="warn">Draft</StatusBadge>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Inbound Tenant Enquiries */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-ink">Inbound Direct Enquiries</h2>
            <p className="text-xs text-ink-muted mt-0.5">Prospective tenants requesting visits or terms</p>
          </div>
          <span className="text-xs font-medium text-ink-muted">
            {allEnquiries.length} total
          </span>
        </div>

        {allEnquiries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-8 text-center bg-paper">
            <p className="text-sm text-ink-muted">No enquiries received yet for your active listings.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {allEnquiries.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-line bg-card p-5 shadow-card"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-ink">{item.fromName}</span>
                      <span className="text-ink-muted/40">·</span>
                      <span className="text-xs font-medium text-[#6E9271] dark:text-[#A3B899]">
                        {getProperty(item.propertyId)?.title ?? item.propertyId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <StatusBadge
                      tone={
                        item.status === "replied"
                          ? "ok"
                          : item.status === "seen"
                            ? "neutral"
                            : "warn"
                      }
                    >
                      {item.status}
                    </StatusBadge>
                    {item.status !== "replied" && (
                      <button
                        type="button"
                        onClick={async () => {
                          const nextStatus = item.status === "sent" ? "seen" : "replied";
                          const supabase = createClient();
                          if (supabase) {
                            await supabase
                              .from("enquiries")
                              .update({ status: nextStatus })
                              .eq("id", item.id);
                          }
                          setAllEnquiries((prev) =>
                            prev.map((e) =>
                              e.id === item.id ? { ...e, status: nextStatus } : e,
                            ),
                          );
                          toast(`Enquiry marked as ${nextStatus}`);
                        }}
                        className="cursor-pointer rounded-lg bg-[#7ca982]/15 px-2.5 py-1 text-[11px] font-semibold text-[#1d3122] dark:text-[#a3caa6] hover:bg-[#7ca982]/25 transition"
                      >
                        Mark {item.status === "sent" ? "seen" : "replied"}
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-xs sm:text-sm text-ink-muted leading-relaxed bg-paper p-3 rounded-xl border border-line">
                  {item.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tenancy Ledger Overview */}
      <div className="mt-12 rounded-2xl border border-line bg-card p-6 shadow-card">
        <h2 className="text-lg font-serif font-bold text-ink">RentTruth™ Financial Ledger Summary</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Unbundled receipts for shared rentals. {payments.filter((item) => item.status === "unpaid").length}{" "}
          payment line item marked unpaid in the active tenancy workspace.
        </p>
        <div className="mt-4">
          <Link
            href="/rental/rent-navrang/payments"
            className="text-xs font-semibold text-[#6E9271] hover:underline"
          >
            Audit active workspace payment streams →
          </Link>
        </div>
      </div>

      {/* Metropolitan Market Trends Analytics */}
      <div className="mt-12 pt-8 border-t border-line">
        <MarketTrends />
      </div>
    </DashboardShell>
  </RoleGuard>
  );
}
