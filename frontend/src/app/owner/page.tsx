"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { RoleGuard } from "@/components/auth/role-guard";
import { useNivasa } from "@/store/nivasa-store";
import { properties as demoProps } from "@/data/demo";
import { getOwnerProperties } from "@/lib/supabase/properties";
import { formatInr } from "@/lib/format";
import type { Property } from "@/types";

const METRO_BENCHMARKS = [
  { city: "Mumbai", avgRent: "₹85,000", yieldPct: "4.2%", demand: "Very High", sampleTag: "Demo / Sample Market Data" },
  { city: "Bangalore", avgRent: "₹25,000", yieldPct: "4.8%", demand: "High", sampleTag: "Demo / Sample Market Data" },
  { city: "Chennai", avgRent: "₹22,000", yieldPct: "3.9%", demand: "Steady", sampleTag: "Demo / Sample Market Data" },
  { city: "Hyderabad", avgRent: "₹21,000", yieldPct: "4.5%", demand: "Very High", sampleTag: "Demo / Sample Market Data" },
  { city: "Delhi", avgRent: "₹29,000", yieldPct: "3.6%", demand: "High", sampleTag: "Demo / Sample Market Data" },
  { city: "Kolkata", avgRent: "₹12,000", yieldPct: "3.4%", demand: "Moderate", sampleTag: "Demo / Sample Market Data" },
];

interface TenantApplication {
  id: string;
  applicantName: string;
  applicantRole: string;
  propertyTitle: string;
  offerRent: number;
  moveInDate: string;
  status: "Pending Review" | "Verified KYC" | "Agreement Sent";
}

interface TenantInquiry {
  id: string;
  senderName: string;
  propertyTitle: string;
  message: string;
  timeAgo: string;
  unread: boolean;
}

const RECENT_APPLICATIONS: TenantApplication[] = [
  {
    id: "app-101",
    applicantName: "Aarav Sharma",
    applicantRole: "Senior Software Engineer · Razorpay",
    propertyTitle: "Courtyard Villa 2B, Navrangpura",
    offerRent: 32000,
    moveInDate: "Oct 01, 2026",
    status: "Verified KYC",
  },
  {
    id: "app-102",
    applicantName: "Pooja & Dev Kothari",
    applicantRole: "Product Designers · Swiggy",
    propertyTitle: "Skyline Minimalist Studio, Indiranagar",
    offerRent: 28000,
    moveInDate: "Oct 15, 2026",
    status: "Pending Review",
  },
];

const RECENT_INQUIRIES: TenantInquiry[] = [
  {
    id: "inq-201",
    senderName: "Tanvi Saxena",
    propertyTitle: "Courtyard Villa 2B",
    message: "Hi Mr. Mehta, would it be possible to schedule an in-person walkthrough this Saturday around 3 PM?",
    timeAgo: "2 hours ago",
    unread: true,
  },
  {
    id: "inq-202",
    senderName: "Kunal Verma",
    propertyTitle: "Courtyard Villa 2B",
    message: "Hello! Is covered four-wheeler parking included in the base rent or billed through society dues?",
    timeAgo: "5 hours ago",
    unread: false,
  },
];

export default function OwnerHubPage() {
  const { user, drafts } = useNivasa();
  const [greeting, setGreeting] = useState("Good Day");
  const [listed, setListed] = useState<Property[]>(() =>
    demoProps.filter((item) => item.ownerId === "own-mehta")
  );

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const ownerName = user?.name || "Mehta Properties (Owner)";

  useEffect(() => {
    let active = true;
    async function loadProperties() {
      try {
        const ownerId = user?.supabaseId || "own-mehta";
        const props = await getOwnerProperties(ownerId);
        if (active && props && props.length > 0) {
          setListed(props);
        }
      } catch (err) {
        console.warn("Could not load owner properties:", err);
      }
    }
    loadProperties();
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <RoleGuard allowedRole="owner">
      <SiteShell>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16 space-y-12">
          {/* 1. Hub Header & Greeting */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border)] pb-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-900 dark:text-amber-200 border border-amber-500/30">
                <span>Owner Portal</span>
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>OWNER</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ink tracking-tight">
                {greeting}, {ownerName} 👋
              </h1>
              <p className="text-sm sm:text-base text-ink-muted max-w-2xl font-medium">
                Manage your residences from one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/owner/properties/new"
                className="rounded-full bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>+ Post Residence</span>
              </Link>
              <Link
                href="/owner/dashboard"
                className="rounded-full border border-[var(--border)] bg-card hover:bg-[var(--primary-pista)]/10 px-4 py-2.5 text-xs font-semibold text-ink transition-colors cursor-pointer"
              >
                Open Full Workspace →
              </Link>
            </div>
          </div>

          {/* 2. Overview Telemetry Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Active Properties</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold font-serif text-ink">{listed.length} Published</span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  Live
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-muted">{drafts.length} drafts in preparation</p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Pending Applications</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold font-serif text-ink">2 Applications</span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Needs Review</span>
              </div>
              <p className="mt-1 text-xs text-ink-muted">Pre-screened verified profiles</p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Tenant Inquiries</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold font-serif text-ink">4 Inquiries</span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">1 Unread</span>
              </div>
              <p className="mt-1 text-xs text-ink-muted">Direct prospective tenant chats</p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Occupied Units</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold font-serif text-ink">100% Occupancy</span>
                <span className="text-emerald-600 text-xs font-bold">Optimal</span>
              </div>
              <p className="mt-1 text-xs text-ink-muted">₹82,000 / month gross yield</p>
            </div>
          </div>

          {/* 3. Owner Quick Actions */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Owner Management Suite</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                href="/owner/properties/new"
                className="group flex flex-col items-center justify-center p-5 rounded-2xl border border-[var(--border)] bg-card hover:border-amber-600 hover:shadow-md transition-all text-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-200 group-hover:scale-110 transition-transform">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
                <span className="mt-2.5 text-xs font-bold text-ink group-hover:text-amber-700">+ Post Residence</span>
                <span className="text-[10px] text-ink-muted">Zero commission listing</span>
              </Link>

              <Link
                href="/ai/agreement"
                className="group flex flex-col items-center justify-center p-5 rounded-2xl border border-[var(--border)] bg-card hover:border-amber-600 hover:shadow-md transition-all text-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 group-hover:scale-110 transition-transform">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <span className="mt-2.5 text-xs font-bold text-ink group-hover:text-indigo-600">AI Lease Drafter</span>
                <span className="text-[10px] text-ink-muted">Bilingual legal agreements</span>
              </Link>

              <Link
                href="/rental/rent-navrang/passport"
                className="group flex flex-col items-center justify-center p-5 rounded-2xl border border-[var(--border)] bg-card hover:border-amber-600 hover:shadow-md transition-all text-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 group-hover:scale-110 transition-transform">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <span className="mt-2.5 text-xs font-bold text-ink group-hover:text-emerald-700">Condition Passport</span>
                <span className="text-[10px] text-ink-muted">Move-in photo ledger</span>
              </Link>

              <Link
                href="/copilot"
                className="group flex flex-col items-center justify-center p-5 rounded-2xl border border-[var(--primary-pista)]/40 bg-[var(--primary-pista)]/10 hover:bg-[var(--primary-pista)]/20 hover:shadow-md transition-all text-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-pista)] text-white group-hover:scale-110 transition-transform">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="mt-2.5 text-xs font-bold text-ink group-hover:text-[var(--accent-forest)]">AI Rental Copilot</span>
                <span className="text-[10px] text-[var(--accent-forest)] font-semibold">Yield & lease queries</span>
              </Link>
            </div>
          </div>

          {/* 4. My Properties Portfolio */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-serif text-ink">My Property Portfolio</h2>
                <p className="text-xs text-ink-muted">Active residences registered under your landlord profile</p>
              </div>
              <Link
                href="/owner/properties/new"
                className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline"
              >
                + Add Another Property
              </Link>
            </div>

            {listed.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {listed.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-[var(--border)] bg-card p-6 shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                          Published & Active
                        </span>
                        <span className="text-xs font-bold text-ink font-serif">{formatInr(item.rent)} / month</span>
                      </div>
                      <h3 className="text-base font-bold text-ink">{item.title}</h3>
                      <p className="text-xs text-ink-muted">
                        {item.locality}, {item.city} · {item.bedrooms || item.bhk} BHK · {item.areaSqft || item.sizeSqft} sqft
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <Link href={`/property/${item.id}`} className="font-semibold text-[var(--accent-forest)] hover:underline">
                          View
                        </Link>
                        <Link href={`/owner/properties/${item.id}`} className="font-semibold text-ink hover:underline">
                          Edit
                        </Link>
                        <Link href="/owner/dashboard" className="font-semibold text-amber-700 dark:text-amber-300 hover:underline">
                          Applications (2)
                        </Link>
                      </div>
                      <span className="text-[10px] text-ink-muted">RentTruth™ Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[var(--border)] p-10 text-center">
                <p className="text-sm font-semibold text-ink">No properties listed yet.</p>
                <p className="mt-1 text-xs text-ink-muted">Publish your first residence to start receiving verified tenant applications.</p>
                <Link
                  href="/owner/properties/new"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-700 text-white px-4 py-2 text-xs font-bold shadow-xs hover:bg-amber-800 transition-colors"
                >
                  + Post Your First Property
                </Link>
              </div>
            )}
          </div>

          {/* 5. Recent Applications Table */}
          <div className="rounded-3xl border border-[var(--border)] bg-card p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-serif text-ink">Recent Tenant Applications</h2>
                <p className="text-xs text-ink-muted">Prospective tenants awaiting lease offer approval</p>
              </div>
              <Link href="/owner/dashboard" className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline">
                View All Applications →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-ink-muted uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-bold">Applicant</th>
                    <th className="pb-3 font-bold">Residence</th>
                    <th className="pb-3 font-bold">Offer Rent</th>
                    <th className="pb-3 font-bold">Move-In</th>
                    <th className="pb-3 font-bold">KYC Status</th>
                    <th className="pb-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]/60">
                  {RECENT_APPLICATIONS.map((app) => (
                    <tr key={app.id} className="hover:bg-paper/50 transition-colors">
                      <td className="py-3.5">
                        <div className="font-bold text-ink">{app.applicantName}</div>
                        <div className="text-[10px] text-ink-muted">{app.applicantRole}</div>
                      </td>
                      <td className="py-3.5 text-ink-muted">{app.propertyTitle}</td>
                      <td className="py-3.5 font-bold font-serif text-ink">{formatInr(app.offerRent)}/mo</td>
                      <td className="py-3.5 text-ink-muted">{app.moveInDate}</td>
                      <td className="py-3.5">
                        <span className="inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          href="/ai/agreement"
                          className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-pista)] text-white px-3 py-1 text-[11px] font-bold shadow-xs hover:bg-[var(--primary-pista-hover)] transition-colors"
                        >
                          Draft Lease
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. Recent Tenant Inquiries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-[var(--border)] bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div>
                  <h3 className="text-base font-bold font-serif text-ink">Recent Inquiries</h3>
                  <p className="text-xs text-ink-muted">Direct questions from verified searchers</p>
                </div>
                <span className="rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 text-[10px]">
                  1 Unread
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {RECENT_INQUIRIES.map((inq) => (
                  <div key={inq.id} className="p-3.5 rounded-2xl bg-paper border border-[var(--border)] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink">{inq.senderName}</span>
                      <span className="text-[10px] text-ink-muted">{inq.timeAgo}</span>
                    </div>
                    <p className="text-[11px] text-ink leading-relaxed">&ldquo;{inq.message}&rdquo;</p>
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-ink-muted">{inq.propertyTitle}</span>
                      <button type="button" className="text-[var(--accent-forest)] font-bold hover:underline cursor-pointer">
                        Reply via Chat →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Maintenance & Occupancy Ledger */}
            <div className="rounded-3xl border border-[var(--border)] bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div>
                  <h3 className="text-base font-bold font-serif text-ink">Maintenance & Condition Log</h3>
                  <p className="text-xs text-ink-muted">Live tenant repair tickets & dispute prevention</p>
                </div>
                <Link href="/rental/rent-navrang" className="text-xs font-semibold text-[var(--accent-forest)] hover:underline">
                  Ledger →
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                <div className="p-3.5 rounded-2xl bg-paper border border-[var(--border)] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink">Courtyard Villa 2B</span>
                    <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 text-[10px]">
                      Zero Open Tickets
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-muted mt-1.5">
                    Move-in condition audit confirmed on mutual cryptographic ledger. Last routine AC inspection passed.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-paper border border-[var(--border)] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink">Scheduled Maintenance Payout</span>
                    <span className="font-bold font-serif text-ink">₹2,400</span>
                  </div>
                  <p className="text-[11px] text-ink-muted mt-1.5">
                    Society sinking fund & water maintenance automatically credited to Navrangpura Society account.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 8. Metropolitan Rental Yield Intelligence */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div>
                <h2 className="text-xl font-bold font-serif text-ink">Metropolitan Rental Yield Intelligence</h2>
                <p className="text-xs text-ink-muted">Benchmark your rental performance across top Indian metro corridors</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Demo / Sample Market Data
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {METRO_BENCHMARKS.map((m) => (
                <div
                  key={m.city}
                  className="rounded-2xl border border-[var(--border)] bg-card p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink">{m.city}</span>
                    <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">{m.yieldPct}</span>
                  </div>
                  <p className="mt-1 text-sm font-serif font-bold text-ink">{m.avgRent}</p>
                  <div className="mt-2 pt-2 border-t border-[var(--border)]/60 flex items-center justify-between text-[9px] text-ink-muted">
                    <span>Demand:</span>
                    <span className="font-semibold text-ink">{m.demand}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SiteShell>
    </RoleGuard>
  );
}
