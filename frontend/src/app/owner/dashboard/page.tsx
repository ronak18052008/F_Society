"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
            <span className="h-2 w-2 rounded-full bg-[var(--primary-pista)]" />
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
            <span className="rounded-full bg-[var(--primary-pista)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--accent-forest)] border border-[var(--primary-pista)]/30">
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
            {listed.map((item) => {
              const images = item.images && item.images.length > 0
                ? item.images
                : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"];
              const primaryPhoto = images[0];

              return (
                <li
                  key={item.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Property Thumbnail with Photo Counter */}
                    <div className="relative h-20 w-28 sm:h-24 sm:w-36 rounded-xl overflow-hidden shrink-0 bg-paper border border-line">
                      <Link href={`/owner/properties/${item.id}`} className="block h-full w-full">
                        <Image
                          src={primaryPhoto}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="144px"
                          unoptimized
                        />
                      </Link>
                      <span className="absolute bottom-1 right-1 rounded-sm bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs flex items-center gap-0.5">
                        <span>📷</span>
                        <span>{images.length}</span>
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/owner/properties/${item.id}`}
                          className="text-sm sm:text-base font-bold text-ink hover:text-[var(--accent-forest)] transition-colors line-clamp-1"
                        >
                          {item.title}
                        </Link>
                        <StatusBadge tone={item.demo ? "demo" : "ok"}>
                          {item.demo ? "Demo" : "Active"}
                        </StatusBadge>
                      </div>

                      <p className="text-xs text-ink-muted">
                        {item.locality}, {item.city} · <strong className="text-ink font-semibold">{formatInr(item.rent)}</strong>/mo
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px] text-ink-muted">
                        <span className="rounded-md bg-paper border border-line px-2 py-0.5 font-medium text-ink">
                          {item.bedrooms || item.bhk || 1} BHK
                        </span>
                        <span className="rounded-md bg-paper border border-line px-2 py-0.5 font-medium text-ink font-tabular">
                          {item.areaSqft || item.sizeSqft || 650} sqft
                        </span>
                        <span className="rounded-md bg-paper border border-line px-2 py-0.5 font-medium capitalize text-ink">
                          {item.furnishingStatus || item.furnishing || "Semi-Furnished"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center ml-auto sm:ml-0">
                    <Link
                      href={`/owner/properties/${item.id}`}
                      className="rounded-xl bg-[var(--accent-forest)] hover:bg-[var(--accent-forest-hover)] text-white px-3.5 py-2 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span>View Details &amp; Photos</span>
                    </Link>

                    <Link
                      href={`/property/${item.id}`}
                      target="_blank"
                      className="rounded-xl border border-line bg-paper px-3 py-2 text-xs font-semibold text-ink hover:border-[var(--primary-pista)] hover:text-[var(--accent-forest)] transition-colors flex items-center gap-1"
                    >
                      <span>Public</span>
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  </div>
                </li>
              );
            })}
            {drafts.map((draft) => {
              const draftPhoto = draft.images?.[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80";
              return (
                <li
                  key={draft.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-28 sm:h-24 sm:w-36 rounded-xl overflow-hidden shrink-0 bg-paper border border-line">
                      <Image
                        src={draftPhoto}
                        alt={draft.title}
                        fill
                        className="object-cover opacity-80"
                        sizes="144px"
                        unoptimized
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-ink">{draft.title}</p>
                        <StatusBadge tone="warn">Draft</StatusBadge>
                      </div>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {draft.locality || draft.city} · <strong className="text-ink">{formatInr(draft.rent)}</strong>/mo
                      </p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium mt-1">
                        Local draft listing · Ready to publish
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/owner/properties/${draft.id}`}
                    className="rounded-xl border border-line bg-paper px-3.5 py-2 text-xs font-semibold text-ink hover:border-[var(--primary-pista)] transition ml-auto sm:ml-0"
                  >
                    View Details
                  </Link>
                </li>
              );
            })}
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
                      <span className="text-xs font-medium text-[var(--accent-forest)]">
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
                        className="cursor-pointer rounded-lg bg-[var(--primary-pista)]/15 px-2.5 py-1 text-[11px] font-semibold text-[var(--accent-forest)] hover:bg-[var(--primary-pista)]/25 transition"
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
            className="text-xs font-semibold text-[var(--accent-forest)] hover:underline"
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
