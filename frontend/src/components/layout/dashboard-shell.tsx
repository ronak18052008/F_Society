"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { useNestora } from "@/store/nestora-store";
import { cn } from "@/lib/cn";

const tenantNav = [
  { href: "/tenant/dashboard", label: "Overview" },
  { href: "/tenant/requirements", label: "Requirements" },
  { href: "/tenant/roommates", label: "Roommates" },
  { href: "/homes", label: "Find homes" },
  { href: "/rental/rent-navrang", label: "Active rental" },
  { href: "/ai/recommend", label: "Ask Nestora" },
];

const ownerNav = [
  { href: "/owner/dashboard", label: "Overview" },
  { href: "/owner/properties/new", label: "Add property" },
  { href: "/owner/properties/prop-navrang-02", label: "Manage listing" },
  { href: "/rental/rent-navrang", label: "Active rental" },
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
  const { user } = useNestora();
  const role = user?.role === "owner" ? "owner" : "tenant";
  const items = role === "owner" ? ownerNav : tenantNav;

  return (
    <div className="min-h-full grain bg-paper text-ink transition-colors duration-300">
      <Navbar />
      <div className="wrap grid gap-8 py-6 sm:py-8 lg:grid-cols-[14rem_1fr] lg:gap-12 lg:py-10">
        {/* Sidebar Nav (Desktop) & Overflow Scroll (Mobile) */}
        <aside className="border-b border-line pb-4 lg:border-b-0 lg:border-r lg:border-line lg:pb-0 lg:pr-6">
          <div className="flex items-center justify-between lg:block">
            <div>
              <p className="kicker-bronze capitalize">
                {role} workspace
              </p>
              <p className="hidden text-xs text-ink-soft mt-0.5 lg:block">
                Simulated local state
              </p>
            </div>
          </div>

          {/* Desktop Vertical Menu */}
          <nav className="hidden lg:block mt-6 space-y-1" aria-label="Workspace sidebar">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center justify-between border-l-2 px-3.5 py-2.5 text-sm font-sans tracking-wide transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze",
                    active
                      ? "border-bronze bg-paper-2 text-ink font-medium shadow-xs"
                      : "border-transparent text-ink-soft hover:border-line hover:bg-paper-2/60 hover:text-ink",
                  )}
                >
                  <span>{item.label}</span>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-bronze" />
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
                    "whitespace-nowrap border px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze",
                    active
                      ? "border-bronze bg-paper-2 text-ink font-medium"
                      : "border-line bg-paper/40 text-ink-soft hover:border-ink/40 hover:text-ink",
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
          <header className="mb-8 border-b border-line pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="kicker-bronze">Nestora Record · Local Demo</p>
                <h1 className="display mt-2 text-3xl sm:text-4xl md:text-5xl tracking-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-2 text-sm text-ink-soft max-w-2xl">{subtitle}</p>
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
