"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/layout/theme-provider";
import { useNestora } from "@/store/nestora-store";
import { cn } from "@/lib/cn";

const publicLinks = [
  { href: "/homes", label: "Homes" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/renttruth/prop-navrang-02", label: "RentTruth" },
  { href: "/ai/recommend", label: "Ask Nestora" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useNestora();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const appHome =
    user?.role === "owner" ? "/owner/dashboard" : "/tenant/dashboard";

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md transition-colors duration-300">
      <div className="wrap flex items-center justify-between py-3.5 sm:py-4">
        <Link
          href="/"
          className="group flex items-baseline gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          <span className="font-serif text-2xl tracking-tight transition-colors group-hover:text-bronze">
            Nestora
          </span>
          <span className="inline-flex items-center gap-1.5 border border-line bg-paper-2/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-bronze animate-pulse" />
            Prototype
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 text-sm lg:gap-8 md:flex" aria-label="Primary">
          {publicLinks.map((link) => {
            const active =
              link.href === "/homes"
                ? pathname === "/homes" || pathname.startsWith("/homes/")
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative py-1 font-sans text-sm tracking-wide transition-colors duration-200 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze",
                  active ? "text-ink font-medium" : "text-ink-soft",
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute inset-x-0 -bottom-1 h-0.5 bg-bronze transition-all duration-300",
                    active ? "opacity-100 scale-x-100" : "opacity-0 scale-x-50 hover:opacity-40",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right Actions & Theme Switcher */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggle}
            className="flex items-center gap-1.5 border border-line bg-paper-2/40 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft transition-all duration-200 hover:border-ink/40 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <>
                <svg className="h-3 w-3 text-bronze" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
                <span>Light</span>
              </>
            ) : (
              <>
                <svg className="h-3 w-3 text-bronze" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                <span>Dark</span>
              </>
            )}
          </button>

          {user ? (
            <>
              <Button href={appHome} variant="ghost" size="sm">
                Workspace
              </Button>
              <Button onClick={signOut} variant="line" size="sm">
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm">
                Sign in
              </Button>
              <Button href="/register" size="sm">
                Get started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="flex items-center gap-2 border border-line bg-paper-2/50 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink transition-colors hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="inline-block">{open ? "Close" : "Menu"}</span>
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-line bg-paper/98 px-6 py-6 backdrop-blur-lg md:hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="space-y-4">
            <p className="kicker text-[10px]">Navigation</p>
            <div className="space-y-2">
              {publicLinks.map((link) => {
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "block border-l-2 py-1.5 pl-3 text-base font-medium transition-colors",
                      active
                        ? "border-bronze text-ink bg-paper-2/40"
                        : "border-transparent text-ink-soft hover:text-ink hover:border-line",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-line">
              <button
                type="button"
                className="flex w-full items-center justify-between py-2 font-mono text-xs uppercase tracking-[0.14em] text-ink-soft hover:text-ink"
                onClick={toggle}
              >
                <span>Theme Mode</span>
                <span className="text-bronze font-medium">
                  {theme === "dark" ? "Dark (Switch to Light)" : "Light (Switch to Dark)"}
                </span>
              </button>
            </div>

            <div className="pt-3 border-t border-line flex flex-col gap-2.5">
              {user ? (
                <>
                  <Button href={appHome} variant="line" fullWidth onClick={() => setOpen(false)}>
                    Go to Workspace
                  </Button>
                  <Button variant="ghost" fullWidth onClick={signOut}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button href="/login" variant="line" fullWidth onClick={() => setOpen(false)}>
                    Sign in
                  </Button>
                  <Button href="/register" fullWidth onClick={() => setOpen(false)}>
                    Get started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
