"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/layout/theme-provider";
import { useNestora } from "@/store/nestora-store";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";

const publicLinks = [
  { href: "/homes", label: "Homes" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/renttruth/prop-navrang-02", label: "RentTruth" },
  { href: "/ai/recommend", label: "Ask Nestora" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useNestora();

  const handleSignOut = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    signOut();
    router.push("/");
  };
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
    <header className="sticky top-3.5 z-50 px-4 sm:px-6 transition-all duration-300">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-4 sm:px-6 py-2.5 backdrop-blur-xl shadow-lg shadow-black/[0.03] dark:shadow-black/[0.4]">
        {/* NIVASA Brand Symbol & Wordmark */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-teal-400 text-white shadow-md shadow-blue-500/25 transition-transform duration-200 group-hover:scale-105">
            <span className="font-sans font-black text-sm tracking-tight">N</span>
          </div>
          <span className="font-sans text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            NIVASA
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            Live
          </span>
        </Link>

        {/* Desktop Navigation Pills */}
        <nav className="hidden items-center gap-1.5 md:flex" aria-label="Primary">
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
                  "rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Theme Toggle & Account / Auth */}
        <div className="hidden items-center gap-2.5 md:flex">
          <button
            type="button"
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 transition-all duration-200 hover:scale-105 hover:text-slate-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <svg className="h-4 w-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={appHome}
                className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
              >
                <span className="capitalize">{user.role} Workspace</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Button href="/register" size="sm">
                Get started
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open ? (
        <div className="mx-auto mt-2 max-w-6xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 p-6 backdrop-blur-2xl shadow-xl md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              {publicLinks.map((link) => {
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-4 flex flex-col gap-2.5">
              {user ? (
                <>
                  <Button href={appHome} fullWidth onClick={() => setOpen(false)}>
                    Open Workspace ({user.role})
                  </Button>
                  <Button variant="ghost" fullWidth onClick={handleSignOut}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button href="/login" variant="secondary" fullWidth onClick={() => setOpen(false)}>
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
