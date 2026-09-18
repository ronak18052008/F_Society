"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { getProperty, maintenance, payments, properties as demoProps } from "@/data/demo";
import { getOwnerProperties } from "@/lib/supabase/properties";
import { createClient } from "@/lib/supabase/client";
import { useNestora } from "@/store/nestora-store";
import { formatInr } from "@/lib/format";
import type { Property } from "@/types";

export default function OwnerDashboardPage() {
  const { drafts, enquiries: localEnquiries, user, toast } = useNestora();
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
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Inventory
            </span>
            <span className="h-2 w-2 rounded-full bg-blue-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {listed.length + drafts.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {listed.length} published · {drafts.length} in draft
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tenant Enquiries
            </span>
            <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-600">
              {allEnquiries.filter((e) => e.status !== "replied").length} Pending
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {allEnquiries.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Direct tenant applications</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Tenancy Tickets
            </span>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {maintenance.filter((item) => item.status !== "resolved").length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Open maintenance requests</p>
        </div>
      </div>

      {/* Listed Properties Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Portfolio Residences</h2>
            <p className="text-xs text-slate-500 mt-0.5">Properties currently published or drafted</p>
          </div>
          <Button href="/owner/properties/new" variant="line" size="sm">
            + Add Residence
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {listed.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div>
                  <Link
                    href={`/owner/properties/${item.id}`}
                    className="text-sm font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.locality}, {item.city} · <strong className="text-slate-700 dark:text-slate-300">{formatInr(item.rent)}</strong>/mo
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge tone={item.demo ? "demo" : "ok"}>
                    {item.demo ? "Demo" : "Active"}
                  </StatusBadge>
                  <Link
                    href={`/owner/properties/${item.id}`}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition"
                  >
                    Manage
                  </Link>
                </div>
              </li>
            ))}
            {drafts.map((draft) => (
              <li
                key={draft.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{draft.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Inbound Direct Enquiries</h2>
            <p className="text-xs text-slate-500 mt-0.5">Prospective tenants requesting visits or terms</p>
          </div>
          <span className="text-xs font-medium text-slate-400">
            {allEnquiries.length} total
          </span>
        </div>

        {allEnquiries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center bg-slate-50/50 dark:bg-slate-900/30">
            <p className="text-sm text-slate-500">No enquiries received yet for your active listings.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {allEnquiries.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{item.fromName}</span>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
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
                        className="cursor-pointer rounded-lg bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-300 hover:bg-blue-100 transition"
                      >
                        Mark {item.status === "sent" ? "seen" : "replied"}
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {item.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tenancy Ledger Overview */}
      <div className="mt-12 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">RentTruth™ Financial Ledger Summary</h2>
        <p className="mt-1 text-xs text-slate-500">
          Unbundled receipts for shared rentals. {payments.filter((item) => item.status === "unpaid").length}{" "}
          payment line item marked unpaid in the active tenancy workspace.
        </p>
        <div className="mt-4">
          <Link
            href="/rental/rent-navrang/payments"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Audit active workspace payment streams →
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
