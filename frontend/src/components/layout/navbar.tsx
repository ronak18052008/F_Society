"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/layout/theme-provider";
import { useNivasa } from "@/store/nivasa-store";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Residences" },
  { href: "/cities", label: "Cities" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/renttruth/prop-navrang-02", label: "RentTruth™" },
  { href: "/ai/recommend", label: "AI Advisor" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useNivasa();

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
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#ffffff]/90 dark:bg-[#142018]/90 px-4 sm:px-6 py-2.5 backdrop-blur-xl shadow-lg shadow-[#7ca982]/[0.06] dark:shadow-black/[0.4]">
        {/* F_Society Brand Symbol & Wordmark */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ca982] rounded-full"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#7ca982] to-[#5c8e63] text-white shadow-md shadow-[#7ca982]/20 transition-transform duration-200 group-hover:scale-105">
            <span className="font-serif font-bold text-base tracking-tight">F</span>
          </div>
          <span className="font-sans text-xl font-bold tracking-tight text-[#1d3122] dark:text-[#f5f9f6]">
            F_Society
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#7ca982]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#23452b] dark:text-[#8fb893]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7ca982] animate-pulse" />
            Verified
          </span>
        </Link>

        {/* Desktop Navigation Pills */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {publicLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : link.href === "/homes"
                  ? pathname === "/homes" || pathname.startsWith("/homes/")
                  : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-[#7ca982] text-white dark:bg-[#7ca982] dark:text-white shadow-xs font-semibold"
                    : "text-[#4e6853] dark:text-[#a5b8aa] hover:text-[#1d3122] dark:hover:text-[#f5f9f6] hover:bg-[#7ca982]/10",
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
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#faf7f0] dark:bg-[#1d2d22] text-[#4e6853] dark:text-[#a5b8aa] transition-all duration-200 hover:scale-105 hover:text-[#1d3122] dark:hover:text-[#f5f9f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ca982] cursor-pointer"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <svg className="h-4 w-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-[#4e6853]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-1.5 rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#faf7f0] dark:bg-[#1d2d22] px-3 py-1.5 text-xs font-semibold text-[#1d3122] dark:text-[#8fb893] hover:border-[#7ca982] transition-colors"
                title="Manage profile & account"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7ca982] text-white text-[10px] font-bold">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="max-w-[80px] truncate">{user.name || "Profile"}</span>
              </Link>
              <Link
                href={appHome}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#7ca982] hover:bg-[#6b9a71] text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors"
              >
                <span className="capitalize">{user.role} Space</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full px-2.5 py-1.5 text-xs font-medium text-[#5e7565] hover:text-[#1d3122] dark:text-[#8ea393] dark:hover:text-[#f5f9f6] transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full px-3.5 py-1.5 text-xs font-medium text-[#4a5e50] dark:text-[#a5b8aa] hover:text-[#1a281f] dark:hover:text-[#f5f9f6] transition-colors"
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
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#faf7f0] dark:bg-[#1d2d22] text-[#4e6853] dark:text-[#a5b8aa]"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#faf7f0] dark:bg-[#1d2d22] text-[#1d3122] dark:text-[#f5f9f6]"
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
        <div className="mx-auto mt-2 max-w-6xl rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#faf7f0]/95 dark:bg-[#142018]/95 p-6 backdrop-blur-2xl shadow-xl md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              {publicLinks.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-[#7ca982]/20 text-[#1d3122] dark:text-[#8fb893] font-semibold"
                        : "text-[#4e6853] dark:text-[#a5b8aa] hover:bg-[#7ca982]/10",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-[#e5dfc5] dark:border-[#2a3f31] pt-4 flex flex-col gap-2.5">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium bg-[#f4efe6] dark:bg-[#1d2d22] text-[#1d3122] dark:text-[#8fb893]"
                    onClick={() => setOpen(false)}
                  >
                    <span>My Account & Profile</span>
                    <span className="text-xs uppercase font-bold text-[#7ca982]">{user.role}</span>
                  </Link>
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
