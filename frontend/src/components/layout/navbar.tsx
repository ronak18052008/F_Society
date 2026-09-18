"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/layout/theme-provider";
import { useNivasa } from "@/store/nivasa-store";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";

interface SearchSuggestion {
  id: string;
  type: "city" | "locality" | "property";
  title: string;
  subtitle: string;
  badge?: string;
  url: string;
}

const METRO_CITIES = [
  { name: "Mumbai", count: 972, avg: "₹85k", state: "MH" },
  { name: "Bangalore", count: 886, avg: "₹25k", state: "KA" },
  { name: "Chennai", count: 891, avg: "₹22k", state: "TN" },
  { name: "Hyderabad", count: 868, avg: "₹21k", state: "TS" },
  { name: "Delhi", count: 605, avg: "₹29k", state: "DL" },
  { name: "Kolkata", count: 524, avg: "₹12k", state: "WB" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, savedIds } = useNivasa();
  const { theme, toggle } = useTheme();

  // Menu states
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Quick Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const appHome = user?.role === "owner" ? "/owner/dashboard" : "/tenant/dashboard";

  // Click outside to dismiss open menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setActiveMenu(null);
        setMobileOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced search query to backend /api/navigation/search
  useEffect(() => {
    if (!searchOpen) return;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch("/api/navigation/search?q=" + encodeURIComponent(searchQuery));
        const data = await res.json();
        if (data.success && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
        }
      } catch {
        setSuggestions(
          METRO_CITIES.map((c) => ({
            id: c.name,
            type: "city",
            title: c.name,
            subtitle: c.count + " available residences",
            badge: "Metro",
            url: "/properties?city=" + c.name,
          }))
        );
      } finally {
        setSearchLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery, searchOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    signOut();
    router.push("/");
  };

  const executeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      router.push("/properties");
    } else {
      router.push("/properties?q=" + encodeURIComponent(searchQuery.trim()));
    }
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-3.5 z-50 px-3 sm:px-6 transition-all duration-300">
      <div
        ref={navRef}
        className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#ffffff]/95 dark:bg-[#142018]/95 px-3 sm:px-5 py-2 backdrop-blur-xl shadow-lg shadow-[#7ca982]/[0.08] dark:shadow-black/[0.4]"
      >
        {/* Brand Logo & Verification Pill */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ca982] rounded-full"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#7ca982] to-[#5c8e63] text-white shadow-md shadow-[#7ca982]/20 transition-transform duration-200 group-hover:scale-105">
              <span className="font-serif font-bold text-base tracking-tight">F</span>
            </div>
            <span className="font-sans text-xl font-bold tracking-tight text-[#1d3122] dark:text-[#f5f9f6]">
              Nivasa
            </span>
            <span className="hidden xl:inline-flex items-center gap-1.5 rounded-full bg-[#7ca982]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#23452b] dark:text-[#8fb893]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7ca982] animate-pulse" />
              Verified Hub
            </span>
          </Link>

          {/* Desktop Navigation Mega Menus */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {/* 1. Explore & Rent Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === "rent" ? null : "rent")}
                className={cn(
                  "flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer",
                  activeMenu === "rent" || pathname.startsWith("/properties") || pathname.startsWith("/cities")
                    ? "bg-[#7ca982] text-white font-semibold shadow-xs"
                    : "text-[#4e6853] dark:text-[#a5b8aa] hover:text-[#1d3122] dark:hover:text-[#f5f9f6] hover:bg-[#7ca982]/10"
                )}
                aria-expanded={activeMenu === "rent"}
              >
                <span>Rent & Explore</span>
                <svg
                  className={cn("h-3.5 w-3.5 transition-transform duration-200", activeMenu === "rent" && "rotate-180")}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {activeMenu === "rent" && (
                <div className="absolute left-0 top-full mt-3 w-[560px] rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#ffffff] dark:bg-[#142018] p-5 shadow-2xl shadow-black/10 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e5dfc5] dark:border-[#2a3f31]">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#7ca982]">Metropolitan Directory</h4>
                      <p className="text-xs text-ink-muted">4,750+ verified residential homes across India</p>
                    </div>
                    <Link
                      href="/properties"
                      onClick={() => setActiveMenu(null)}
                      className="rounded-full bg-[#7ca982]/15 px-3 py-1 text-xs font-semibold text-[#1d3122] dark:text-[#a3caa6] hover:bg-[#7ca982] hover:text-white transition-colors"
                    >
                      Browse All Homes →
                    </Link>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-6">
                    {/* Metropolitan Cities */}
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Top Metro Hubs</span>
                      <div className="mt-2.5 grid grid-cols-2 gap-2">
                        {METRO_CITIES.map((city) => (
                          <Link
                            key={city.name}
                            href={"/properties?city=" + encodeURIComponent(city.name)}
                            onClick={() => setActiveMenu(null)}
                            className="group flex flex-col rounded-xl border border-[#e5dfc5]/80 dark:border-[#2a3f31] bg-[#faf7f0]/70 dark:bg-[#1a281f]/60 p-2.5 hover:border-[#7ca982] hover:bg-[#ffffff] dark:hover:bg-[#1f3025] transition-all"
                          >
                            <span className="text-xs font-bold text-ink group-hover:text-[#57875d] dark:group-hover:text-[#a3caa6]">
                              {city.name}
                            </span>
                            <span className="text-[10px] text-ink-muted">
                              {city.count} homes · {city.avg}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* BHK Configurations & Collections */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">BHK Configurations</span>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {[
                            { label: "1 BHK", href: "/properties?bhk=1" },
                            { label: "2 BHK Prime", href: "/properties?bhk=2" },
                            { label: "3 BHK Family", href: "/properties?bhk=3" },
                            { label: "4+ BHK Luxury", href: "/properties?bhk=4" },
                          ].map((bhk) => (
                            <Link
                              key={bhk.label}
                              href={bhk.href}
                              onClick={() => setActiveMenu(null)}
                              className="rounded-lg border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#faf7f0] dark:bg-[#1a281f] px-2.5 py-1 text-xs font-medium text-ink hover:border-[#7ca982] hover:bg-[#7ca982]/10 transition-colors"
                            >
                              {bhk.label}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Curated Collections</span>
                        <div className="mt-2 flex flex-col gap-1.5">
                          <Link
                            href="/properties?furnishing=Furnished"
                            onClick={() => setActiveMenu(null)}
                            className="flex items-center justify-between text-xs text-ink hover:text-[#57875d] dark:hover:text-[#a3caa6] transition-colors py-0.5"
                          >
                            <span>Fully Furnished Homes</span>
                            <span className="text-[10px] text-ink-muted font-tabular">680 listings</span>
                          </Link>
                          <Link
                            href="/properties?tenant=Bachelors"
                            onClick={() => setActiveMenu(null)}
                            className="flex items-center justify-between text-xs text-ink hover:text-[#57875d] dark:hover:text-[#a3caa6] transition-colors py-0.5"
                          >
                            <span>Bachelor Friendly</span>
                            <span className="text-[10px] text-ink-muted font-tabular">Direct Owner</span>
                          </Link>
                          <Link
                            href="/cities"
                            onClick={() => setActiveMenu(null)}
                            className="flex items-center justify-between text-xs text-ink hover:text-[#57875d] dark:hover:text-[#a3caa6] transition-colors py-0.5"
                          >
                            <span>City Telemetry & Rental Index</span>
                            <span className="text-[10px] text-[#7ca982] font-semibold">6 Metros →</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. For Owners Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === "owners" ? null : "owners")}
                className={cn(
                  "flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer",
                  activeMenu === "owners" || pathname.startsWith("/owner")
                    ? "bg-[#7ca982] text-white font-semibold shadow-xs"
                    : "text-[#4e6853] dark:text-[#a5b8aa] hover:text-[#1d3122] dark:hover:text-[#f5f9f6] hover:bg-[#7ca982]/10"
                )}
                aria-expanded={activeMenu === "owners"}
              >
                <span>For Owners</span>
                <svg
                  className={cn("h-3.5 w-3.5 transition-transform duration-200", activeMenu === "owners" && "rotate-180")}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {activeMenu === "owners" && (
                <div className="absolute left-0 top-full mt-3 w-72 rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#ffffff] dark:bg-[#142018] p-4 shadow-2xl shadow-black/10 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="space-y-1.5">
                    <Link
                      href="/owner/properties/new"
                      onClick={() => setActiveMenu(null)}
                      className="group flex items-start gap-3 rounded-2xl p-2.5 hover:bg-[#7ca982]/10 transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#7ca982]/20 text-[#23452b] dark:text-[#a3caa6]">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-ink group-hover:text-[#57875d] block">
                          List Your Property
                        </span>
                        <span className="text-[11px] text-ink-muted leading-tight block">
                          Post direct listing with zero broker fees
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/owner/dashboard"
                      onClick={() => setActiveMenu(null)}
                      className="group flex items-start gap-3 rounded-2xl p-2.5 hover:bg-[#7ca982]/10 transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#7ca982]/20 text-[#23452b] dark:text-[#a3caa6]">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-ink group-hover:text-[#57875d] block">
                          Owner Dashboard
                        </span>
                        <span className="text-[11px] text-ink-muted leading-tight block">
                          Manage enquiries, tenants, and inventory
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/ai/agreement"
                      onClick={() => setActiveMenu(null)}
                      className="group flex items-start gap-3 rounded-2xl p-2.5 hover:bg-[#7ca982]/10 transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#7ca982]/20 text-[#23452b] dark:text-[#a3caa6]">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-ink group-hover:text-[#57875d] block">
                          Digital Rental Agreement
                        </span>
                        <span className="text-[11px] text-ink-muted leading-tight block">
                          Legally compliant draft generated with AI
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 3. For Tenants Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === "tenants" ? null : "tenants")}
                className={cn(
                  "flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer",
                  activeMenu === "tenants" || pathname.startsWith("/tenant")
                    ? "bg-[#7ca982] text-white font-semibold shadow-xs"
                    : "text-[#4e6853] dark:text-[#a5b8aa] hover:text-[#1d3122] dark:hover:text-[#f5f9f6] hover:bg-[#7ca982]/10"
                )}
                aria-expanded={activeMenu === "tenants"}
              >
                <span>For Tenants</span>
                <svg
                  className={cn("h-3.5 w-3.5 transition-transform duration-200", activeMenu === "tenants" && "rotate-180")}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {activeMenu === "tenants" && (
                <div className="absolute left-0 top-full mt-3 w-72 rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#ffffff] dark:bg-[#142018] p-4 shadow-2xl shadow-black/10 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="space-y-1.5">
                    <Link
                      href="/properties?saved=true"
                      onClick={() => setActiveMenu(null)}
                      className="group flex items-start gap-3 rounded-2xl p-2.5 hover:bg-[#7ca982]/10 transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-ink group-hover:text-[#57875d]">
                            Saved Residences
                          </span>
                          <span className="rounded-full bg-rose-100 text-rose-700 px-1.5 py-0.2 text-[10px] font-bold">
                            {savedIds.length}
                          </span>
                        </div>
                        <span className="text-[11px] text-ink-muted leading-tight block">
                          Quick access to bookmarked properties
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/tenant/roommates"
                      onClick={() => setActiveMenu(null)}
                      className="group flex items-start gap-3 rounded-2xl p-2.5 hover:bg-[#7ca982]/10 transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#7ca982]/20 text-[#23452b] dark:text-[#a3caa6]">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-ink group-hover:text-[#57875d] block">
                          Find Roommates
                        </span>
                        <span className="text-[11px] text-ink-muted leading-tight block">
                          Verified flatmates matching your habits
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/tenant/requirements"
                      onClick={() => setActiveMenu(null)}
                      className="group flex items-start gap-3 rounded-2xl p-2.5 hover:bg-[#7ca982]/10 transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#7ca982]/20 text-[#23452b] dark:text-[#a3caa6]">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-ink group-hover:text-[#57875d] block">
                          Rental Requirements
                        </span>
                        <span className="text-[11px] text-ink-muted leading-tight block">
                          Set budget, cities, and move-in timeline
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/tenant/dashboard"
                      onClick={() => setActiveMenu(null)}
                      className="group flex items-start gap-3 rounded-2xl p-2.5 hover:bg-[#7ca982]/10 transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#7ca982]/20 text-[#23452b] dark:text-[#a3caa6]">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-ink group-hover:text-[#57875d] block">
                          Tenant Workspace
                        </span>
                        <span className="text-[11px] text-ink-muted leading-tight block">
                          Track enquiries, leases, and RentTruth™
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Analytics & Tools Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === "tools" ? null : "tools")}
                className={cn(
                  "flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer",
                  activeMenu === "tools" || pathname === "/dashboard" || pathname.startsWith("/ai")
                    ? "bg-[#7ca982] text-white font-semibold shadow-xs"
                    : "text-[#4e6853] dark:text-[#a5b8aa] hover:text-[#1d3122] dark:hover:text-[#f5f9f6] hover:bg-[#7ca982]/10"
                )}
                aria-expanded={activeMenu === "tools"}
              >
                <span>Analytics & Tools</span>
                <svg
                  className={cn("h-3.5 w-3.5 transition-transform duration-200", activeMenu === "tools" && "rotate-180")}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {activeMenu === "tools" && (
                <div className="absolute left-0 top-full mt-3 w-72 rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#ffffff] dark:bg-[#142018] p-4 shadow-2xl shadow-black/10 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="space-y-1.5">
                    <Link
                      href="/dashboard"
                      onClick={() => setActiveMenu(null)}
                      className="group flex items-start gap-3 rounded-2xl p-2.5 hover:bg-[#7ca982]/10 transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#7ca982]/20 text-[#23452b] dark:text-[#a3caa6]">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-ink group-hover:text-[#57875d] block">
                          Market Price Index & Trends
                        </span>
                        <span className="text-[11px] text-ink-muted leading-tight block">
                          Rental benchmarks and city-by-city trends
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/renttruth/prop-navrang-02"
                      onClick={() => setActiveMenu(null)}
                      className="group flex items-start gap-3 rounded-2xl p-2.5 hover:bg-[#7ca982]/10 transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#7ca982]/20 text-[#23452b] dark:text-[#a3caa6]">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-ink group-hover:text-[#57875d] block">
                          RentTruth™ Passport
                        </span>
                        <span className="text-[11px] text-ink-muted leading-tight block">
                          100% itemized pricing without hidden fees
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/ai/recommend"
                      onClick={() => setActiveMenu(null)}
                      className="group flex items-start gap-3 rounded-2xl p-2.5 hover:bg-[#7ca982]/10 transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#7ca982]/20 text-[#23452b] dark:text-[#a3caa6]">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-ink group-hover:text-[#57875d] block">
                          AI Residence Matcher
                        </span>
                        <span className="text-[11px] text-ink-muted leading-tight block">
                          Personalized home recommendations
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/how-it-works"
                      onClick={() => setActiveMenu(null)}
                      className="group flex items-start gap-3 rounded-2xl p-2.5 hover:bg-[#7ca982]/10 transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#7ca982]/20 text-[#23452b] dark:text-[#a3caa6]">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-ink group-hover:text-[#57875d] block">
                          How It Works
                        </span>
                        <span className="text-[11px] text-ink-muted leading-tight block">
                          Nivasa verification & rental workflow
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Center: Interactive Quick Search Bar with Instant Autocomplete */}
        <div ref={searchContainerRef} className="relative hidden md:block max-w-[240px] xl:max-w-[300px] w-full mx-2">
          <form onSubmit={executeSearch} className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search 4,750+ homes, cities..."
              className="w-full rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#faf7f0] dark:bg-[#1d2d22] pl-8 pr-11 py-1.5 text-xs text-[#1d3122] dark:text-[#f5f9f6] placeholder:text-[#7d9782] focus:border-[#7ca982] focus:ring-2 focus:ring-[#7ca982]/20 focus:outline-none transition-all"
            />
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7ca982]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="hidden xl:inline-block rounded border border-[#e5dfc5] dark:border-[#2a3f31] bg-white dark:bg-[#142018] px-1 text-[9px] text-[#7d9782]">
                ⌘K
              </kbd>
            </div>
          </form>

          {/* Autocomplete Dropdown Flyout */}
          {searchOpen && (
            <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#ffffff] dark:bg-[#142018] p-3.5 shadow-2xl shadow-black/15 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              <div className="flex items-center justify-between px-2 pb-2 text-[10px] uppercase font-bold tracking-wider text-ink-muted border-b border-[#e5dfc5] dark:border-[#2a3f31]">
                <span>{searchQuery ? "Search Matches" : "Metropolitan Corridors"}</span>
                {searchLoading && <span className="text-[#7ca982] animate-pulse">Searching...</span>}
              </div>

              <div className="mt-2 max-h-72 overflow-y-auto space-y-1 divide-y divide-[#e5dfc5]/40 dark:divide-[#2a3f31]/40">
                {suggestions.length > 0 ? (
                  suggestions.map((item) => (
                    <Link
                      key={item.id}
                      href={item.url}
                      onClick={() => {
                        setSearchOpen(false)
                        setSearchQuery("");
                      }}
                      className="group flex items-center justify-between rounded-xl px-2.5 py-2 hover:bg-[#7ca982]/10 transition-colors pt-2"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#7ca982]/15 text-[#23452b] dark:text-[#a3caa6]">
                          {item.type === "city" ? (
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
                            </svg>
                          ) : item.type === "locality" ? (
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="10" r="3" />
                              <path d="M12 2a8 8 0 00-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 00-8-8z" />
                            </svg>
                          ) : (
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            </svg>
                          )}
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-semibold text-ink group-hover:text-[#57875d] block truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-ink-muted truncate block">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>
                      {item.badge && (
                        <span className="shrink-0 rounded-full bg-[#7ca982]/15 border border-[#7ca982]/30 px-2 py-0.5 text-[9px] font-semibold text-[#1d3122] dark:text-[#a3caa6]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-ink-muted">
                    No matching locations. Press enter to search all properties.
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-[#e5dfc5] dark:border-[#2a3f31] flex items-center justify-between text-[11px]">
                <Link
                  href="/properties"
                  onClick={() => setSearchOpen(false)}
                  className="text-[#57875d] dark:text-[#a3caa6] font-semibold hover:underline"
                >
                  Explore All 4,750+ Listings →
                </Link>
                <span className="text-ink-muted text-[10px]">Zero Brokerage</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Actions: Saved (❤️), Post Property, Theme & Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Saved Homes (❤️) Badge Counter */}
          <Link
            href="/properties?saved=true"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#faf7f0] dark:bg-[#1d2d22] text-[#4e6853] dark:text-[#a5b8aa] hover:border-[#7ca982] hover:text-rose-500 transition-colors"
            title="View saved residences"
            aria-label="View saved residences"
          >
            <svg
              className={cn("h-4 w-4 transition-colors", savedIds.length > 0 ? "fill-rose-500 text-rose-500" : "fill-none")}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {savedIds.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-bold shadow-xs">
                {savedIds.length}
              </span>
            )}
          </Link>

          {/* "+ Post Property" Direct CTA */}
          <Link
            href="/owner/properties/new"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#7ca982]/15 hover:bg-[#7ca982] hover:text-white text-[#1d3122] dark:text-[#a3caa6] px-3.5 py-1.5 text-xs font-semibold border border-[#7ca982]/30 transition-all cursor-pointer shadow-xs"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Post Property</span>
          </Link>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#faf7f0] dark:bg-[#1d2d22] text-[#4e6853] dark:text-[#a5b8aa] transition-all hover:scale-105 hover:text-[#1d3122] dark:hover:text-[#f5f9f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ca982] cursor-pointer"
            aria-label="Switch visual color theme"
            title="Switch visual color theme"
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

          {/* User Account Menu / Auth */}
          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#faf7f0] dark:bg-[#1d2d22] pl-1 pr-2.5 py-1 text-xs font-semibold text-[#1d3122] dark:text-[#8fb893] hover:border-[#7ca982] transition-colors cursor-pointer"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7ca982] text-white text-[11px] font-bold">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="hidden sm:inline max-w-[70px] truncate">{user.name || "Account"}</span>
                <span className="hidden md:inline rounded-full bg-[#7ca982]/15 px-1.5 py-0.2 text-[9px] uppercase font-bold text-[#23452b]">
                  {user.role}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-white dark:bg-[#142018] p-2 shadow-xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3 py-2 border-b border-[#e5dfc5] dark:border-[#2a3f31]">
                    <span className="text-xs font-bold text-ink block truncate">{user.name || "Member"}</span>
                    <span className="text-[11px] text-ink-muted block truncate">{user.email}</span>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    <Link
                      href={appHome}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-[#7ca982]/10 transition-colors"
                    >
                      <span>Open Workspace</span>
                      <span className="text-[10px] font-bold uppercase text-[#7ca982]">{user.role}</span>
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-[#7ca982]/10 transition-colors"
                    >
                      Profile & Settings
                    </Link>
                    <Link
                      href="/properties?saved=true"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-[#7ca982]/10 transition-colors"
                    >
                      <span>Saved Properties</span>
                      <span className="text-[10px] font-bold text-rose-500">{savedIds.length}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleSignOut();
                      }}
                      className="w-full text-left rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/login"
                className="rounded-full px-3 py-1.5 text-xs font-medium text-[#4a5e50] dark:text-[#a5b8aa] hover:text-[#1a281f] dark:hover:text-[#f5f9f6] transition-colors"
              >
                Sign in
              </Link>
              <Button href="/register" size="sm">
                Get started
              </Button>
            </div>
          )}

          {/* Mobile Hamburger Trigger */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#faf7f0] dark:bg-[#1d2d22] text-[#1d3122] dark:text-[#f5f9f6]"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((value) => !value)}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Categorized & Accessible) */}
      {mobileOpen ? (
        <div className="mx-auto mt-2 max-w-7xl rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#faf7f0]/98 dark:bg-[#142018]/98 p-5 backdrop-blur-2xl shadow-xl lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-4">
            {/* Mobile Search Form */}
            <form onSubmit={executeSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 4,750+ homes across 6 metros..."
                className="w-full rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-white dark:bg-[#1d2d22] pl-9 pr-4 py-2 text-xs text-ink placeholder:text-[#7d9782] focus:border-[#7ca982] focus:outline-none"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7ca982]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </form>

            {/* Quick Cities Ribbon in Mobile */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Metropolitan Cities</span>
              <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {METRO_CITIES.map((c) => (
                  <Link
                    key={c.name}
                    href={"/properties?city=" + encodeURIComponent(c.name)}
                    onClick={() => setMobileOpen(false)}
                    className="shrink-0 rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-white dark:bg-[#1a281f] px-3 py-1 text-[11px] font-semibold text-ink hover:border-[#7ca982]"
                  >
                    {c.name} ({c.count})
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/properties"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-white dark:bg-[#1a281f] border border-[#e5dfc5] dark:border-[#2a3f31] p-2.5 font-medium text-ink"
              >
                <span>🏠 All Residences</span>
              </Link>
              <Link
                href="/properties?saved=true"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-xl bg-white dark:bg-[#1a281f] border border-[#e5dfc5] dark:border-[#2a3f31] p-2.5 font-medium text-ink"
              >
                <span>❤️ Saved Homes</span>
                <span className="rounded-full bg-rose-100 text-rose-700 px-1.5 py-0.2 text-[10px] font-bold">
                  {savedIds.length}
                </span>
              </Link>
              <Link
                href="/owner/properties/new"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-[#7ca982]/15 border border-[#7ca982]/30 p-2.5 font-bold text-[#1d3122] dark:text-[#a3caa6]"
              >
                <span>➕ Post Property</span>
              </Link>
              <Link
                href="/cities"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-white dark:bg-[#1a281f] border border-[#e5dfc5] dark:border-[#2a3f31] p-2.5 font-medium text-ink"
              >
                <span>🏙️ City Hubs</span>
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-white dark:bg-[#1a281f] border border-[#e5dfc5] dark:border-[#2a3f31] p-2.5 font-medium text-ink"
              >
                <span>📊 Market Trends</span>
              </Link>
              <Link
                href="/tenant/roommates"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-white dark:bg-[#1a281f] border border-[#e5dfc5] dark:border-[#2a3f31] p-2.5 font-medium text-ink"
              >
                <span>👥 Roommates</span>
              </Link>
              <Link
                href="/ai/agreement"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-white dark:bg-[#1a281f] border border-[#e5dfc5] dark:border-[#2a3f31] p-2.5 font-medium text-ink"
              >
                <span>📄 AI Agreement</span>
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-white dark:bg-[#1a281f] border border-[#e5dfc5] dark:border-[#2a3f31] p-2.5 font-medium text-ink"
              >
                <span>ℹ️ How It Works</span>
              </Link>
            </div>

            {/* Mobile User Actions */}
            <div className="border-t border-[#e5dfc5] dark:border-[#2a3f31] pt-3 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-medium bg-white dark:bg-[#1d2d22] text-[#1d3122] dark:text-[#8fb893]"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>My Account ({user.email})</span>
                    <span className="text-[10px] uppercase font-bold text-[#7ca982]">{user.role}</span>
                  </Link>
                  <Button href={appHome} fullWidth onClick={() => setMobileOpen(false)}>
                    Open Workspace ({user.role})
                  </Button>
                  <Button variant="ghost" fullWidth onClick={handleSignOut}>
                    Sign out
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button href="/login" variant="secondary" fullWidth onClick={() => setMobileOpen(false)}>
                    Sign in
                  </Button>
                  <Button href="/register" fullWidth onClick={() => setMobileOpen(false)}>
                    Get started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
