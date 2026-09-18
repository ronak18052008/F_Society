"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { useNivasa } from "@/store/nivasa-store";
import { cn } from "@/lib/cn";

const tenantNav = [
  { href: "/tenant/dashboard", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/tenant/requirements", label: "Requirements", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { href: "/tenant/roommates", label: "Roommates", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  { href: "/homes", label: "Explore Homes", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  { href: "/rental/rent-navrang", label: "Tenancy Space", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { href: "/ai/recommend", label: "AI Advisor", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
];

const ownerNav = [
  { href: "/owner/dashboard", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/owner/properties/new", label: "List Residence", icon: "M12 4v16m8-8H4" },
  { href: "/owner/properties/prop-navrang-02", label: "Manage Units", icon: "M4 6h16M4 12h16M4 18h16" },
  { href: "/rental/rent-navrang", label: "Tenancy Space", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
];

export function DashboardShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useNivasa();
  const role = user?.role === "owner" ? "owner" : "tenant";
  const items = role === "owner" ? ownerNav : tenantNav;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      
      {/* Background ambient radial gradients */}
      <div className="pointer-events-none fixed top-0 left-1/4 w-96 h-96 bg-blue-500/5 blur-3xl -z-10" />
      <div className="pointer-events-none fixed bottom-0 right-1/4 w-96 h-96 bg-teal-500/5 blur-3xl -z-10" />

      <div className="wrap grid gap-8 py-6 sm:py-8 lg:grid-cols-[16rem_1fr] lg:gap-10 lg:py-10">
        {/* Sidebar Nav (Desktop) & Overflow Scroll (Mobile) */}
        <aside className="border-b border-slate-200/80 dark:border-slate-800/80 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
          <div className="flex items-center justify-between lg:block">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {role} Command Center
              </span>
            </div>
          </div>

          {/* Desktop Vertical Menu */}
          <nav className="hidden lg:block mt-6 space-y-1.5" aria-label="Workspace sidebar">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    active
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d={item.icon} />
                    </svg>
                    <span>{item.label}</span>
                  </div>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile / Tablet Horizontal Tab Scroll */}
          <nav
            className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none lg:hidden"
            aria-label="Workspace tabs"
          >
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <section className="min-w-0">
          <header className="mb-8 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <span>NIVASA Workspace</span>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="text-teal-600 dark:text-teal-400">Live Telemetry</span>
                </div>
                <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">{subtitle}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          </header>
          {children}
        </section>
      </div>
    </div>
  );
}
