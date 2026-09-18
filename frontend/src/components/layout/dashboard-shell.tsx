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
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useNestora();
  const items = user?.role === "owner" ? ownerNav : tenantNav;

  return (
    <div className="min-h-full grain">
      <Navbar />
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
            {user?.role ?? "guest"} workspace
          </p>
          <nav className="mt-4 space-y-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-3 py-2 text-sm hover:bg-paper-2",
                  pathname === item.href && "bg-paper-2 text-bronze",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <section>
          <header className="mb-8 border-b border-line pb-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
              Prototype
            </p>
            <h1 className="mt-2 font-serif text-4xl md:text-5xl">{title}</h1>
          </header>
          {children}
        </section>
      </div>
    </div>
  );
}
