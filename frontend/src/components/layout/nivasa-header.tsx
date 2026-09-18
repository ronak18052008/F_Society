"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/layout/theme-provider";
import { useNivasa } from "@/store/nivasa-store";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

export interface NivasaHeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
}

interface SearchSuggestion {
  id: string;
  type: "city" | "locality" | "property";
  title: string;
  subtitle: string;
  badge?: string;
  url: string;
}

const METRO_CITIES = [
  { name: "Mumbai", count: 972, avg: "₹85k" },
  { name: "Bangalore", count: 886, avg: "₹25k" },
  { name: "Chennai", count: 891, avg: "₹22k" },
  { name: "Hyderabad", count: 868, avg: "₹21k" },
  { name: "Delhi", count: 605, avg: "₹29k" },
  { name: "Kolkata", count: 524, avg: "₹12k" },
];

export function NivasaHeader({ collapsed, onToggleCollapse, onOpenMobile }: NivasaHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, savedIds, switchRole } = useNivasa();
  const { theme, toggle } = useTheme();

  const isOwner = user?.role === "owner";

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const appHome = isOwner ? "/owner/dashboard" : "/tenant/dashboard";

  // Dynamic breadcrumb / title
  const getPageTitle = () => {
    if (pathname === "/") return "Discover";
    if (pathname === "/owner") return "Owner Hub";
    if (pathname === "/tenant") return "Tenant Hub";
    if (pathname === "/login/owner") return "Owner Sign In";
    if (pathname === "/login/tenant") return "Tenant Sign In";
    if (pathname.startsWith("/properties") || pathname.startsWith("/homes")) return "Residences";
    if (pathname.startsWith("/property/")) return "Residence Details";
    if (pathname.startsWith("/cities")) return "Metro Hubs";
    if (pathname.startsWith("/dashboard")) return "Market Intelligence";
    if (pathname.startsWith("/owner/properties/new")) return "List Residence";
    if (pathname.startsWith("/owner/dashboard")) return "Owner Workspace";
    if (pathname.startsWith("/tenant/dashboard")) return "Tenant Workspace";
    if (pathname.startsWith("/tenant/roommates")) return "Roommate Matcher";
    if (pathname.startsWith("/tenant/requirements")) return "Requirements";
    if (pathname.startsWith("/renttruth")) return "RentTruth™ Audit";
    if (pathname.startsWith("/ai/agreement")) return "Digital Agreement";
    if (pathname.startsWith("/ai/recommend")) return "AI Advisor";
    if (pathname.startsWith("/how-it-works")) return "How Nivasa Works";
    if (pathname.startsWith("/profile")) return "Profile & Settings";
    if (pathname.startsWith("/login")) return "Sign In";
    if (pathname.startsWith("/register")) return "Create Account";
    return "Nivasa";
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
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

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced search query
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
            subtitle: c.count + " available residences · " + c.avg,
            badge: "City",
            url: "/properties?city=" + encodeURIComponent(c.name),
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
    <header className="sticky top-0 z-30 w-full border-b border-[#e5dfc5] dark:border-[#2a3f31] bg-[#ffffff]/90 dark:bg-[#142018]/90 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile Hamburger & Current Page Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={onOpenMobile}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e5dfc5] dark:border-[#2a3f31] text-[#1d3122] dark:text-[#f5f9f6] hover:bg-[#7ca982]/10 lg:hidden transition-colors cursor-pointer"
            aria-label="Open Nivasa navigation menu"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Desktop Sidebar Toggle Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex h-9 w-9 items-center justify-center rounded-xl border border-[#e5dfc5] dark:border-[#2a3f31] text-[#4e6853] dark:text-[#a5b8aa] hover:text-[#1d3122] hover:bg-[#7ca982]/10 transition-colors cursor-pointer"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className={cn("h-4 w-4 transition-transform duration-200", collapsed && "rotate-180")}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          {/* Breadcrumb Title */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-muted hidden sm:inline">Nivasa</span>
            <span className="text-xs text-ink-muted/50 hidden sm:inline">/</span>
            <h2 className="text-sm font-bold text-ink tracking-tight font-serif">{getPageTitle()}</h2>
            {user && (
              <span className={cn(
                "hidden md:inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                isOwner ? "bg-amber-500/15 text-amber-900 dark:text-amber-200" : "bg-[#7ca982]/15 text-[#1d3122] dark:text-[#a3caa6]"
              )}>
                {isOwner ? "Owner" : "Tenant"}
              </span>
            )}
          </div>
        </div>

        {/* Center: Live Quick Search Bar */}
        <div ref={searchContainerRef} className="relative hidden md:block max-w-[280px] lg:max-w-[340px] w-full mx-4">
          <form onSubmit={executeSearch} className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search 4,750+ homes, cities, localities..."
              className="w-full rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#faf7f0] dark:bg-[#1d2d22] pl-8 pr-12 py-1.5 text-xs text-[#1d3122] dark:text-[#f5f9f6] placeholder:text-[#7d9782] focus:border-[#7ca982] focus:ring-2 focus:ring-[#7ca982]/20 focus:outline-none transition-all"
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
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
              <kbd className="rounded border border-[#e5dfc5] dark:border-[#2a3f31] bg-white dark:bg-[#142018] px-1 text-[9px] text-[#7d9782]">
                ⌘K
              </kbd>
            </div>
          </form>

          {/* Search Autocomplete Flyout */}
          {searchOpen && (
            <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-white dark:bg-[#142018] p-3.5 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              <div className="flex items-center justify-between px-2 pb-2 text-[10px] uppercase font-bold tracking-wider text-ink-muted border-b border-[#e5dfc5] dark:border-[#2a3f31]">
                <span>{searchQuery ? "Matching Results" : "Metropolitan Corridors"}</span>
                {searchLoading && <span className="text-[#7ca982] animate-pulse">Searching...</span>}
              </div>

              <div className="mt-2 max-h-72 overflow-y-auto space-y-1 divide-y divide-[#e5dfc5]/40 dark:divide-[#2a3f31]/40">
                {suggestions.length > 0 ? (
                  suggestions.map((item) => (
                    <Link
                      key={item.id}
                      href={item.url}
                      onClick={() => {
                        setSearchOpen(false);
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

        {/* Right Actions: Role Adaptive CTAs, Theme & Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Saved Homes (❤️) Badge Counter (for Tenants) */}
          <Link
            href="/properties?saved=true"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#faf7f0] dark:bg-[#1d2d22] text-[#4e6853] dark:text-[#a5b8aa] hover:border-[#7ca982] hover:text-rose-500 transition-colors"
            title="Saved residences"
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

          {/* Role-Adaptive Primary CTA */}
          {isOwner ? (
            <Link
              href="/owner/properties/new"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-700 hover:bg-amber-800 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>+ Post Property</span>
            </Link>
          ) : (
            <Link
              href="/tenant/roommates"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#7ca982]/15 hover:bg-[#7ca982] hover:text-white text-[#1d3122] dark:text-[#a3caa6] px-3.5 py-1.5 text-xs font-semibold border border-[#7ca982]/30 transition-all cursor-pointer shadow-xs"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              <span>Find Roommate</span>
            </Link>
          )}

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#faf7f0] dark:bg-[#1d2d22] text-[#4e6853] dark:text-[#a5b8aa] transition-all hover:scale-105 hover:text-[#1d3122] dark:hover:text-[#f5f9f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ca982] cursor-pointer"
            aria-label="Toggle theme"
            title="Toggle theme"
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
                <div className={cn("flex h-6 w-6 items-center justify-center rounded-full text-white text-[11px] font-bold", isOwner ? "bg-amber-600" : "bg-[#7ca982]")}>
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="hidden sm:inline max-w-[70px] truncate">{user.name || "Account"}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-white dark:bg-[#142018] p-2.5 shadow-xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3 py-2 border-b border-[#e5dfc5] dark:border-[#2a3f31]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink block truncate">{user.name || "Member"}</span>
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase",
                        isOwner ? "bg-amber-500/20 text-amber-900 dark:text-amber-200" : "bg-[#7ca982]/20 text-[#1d3122] dark:text-[#a3caa6]"
                      )}>
                        {user.role}
                      </span>
                    </div>
                    <span className="text-[11px] text-ink-muted block truncate mt-0.5">{user.email}</span>
                  </div>

                  {/* Fast 1-Click Role Switcher */}
                  <div className="my-1.5 p-1.5 rounded-xl bg-paper dark:bg-[#1d2d22] border border-[#e5dfc5] dark:border-[#2a3f31]">
                    <button
                      type="button"
                      onClick={() => {
                        switchRole(isOwner ? "tenant" : "owner");
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-ink hover:text-[#57875d] transition-colors cursor-pointer"
                    >
                      <span>Switch to {isOwner ? "Tenant Mode" : "Owner Mode"}</span>
                      <span className="text-[10px] text-ink-muted">Toggle ⇄</span>
                    </button>
                  </div>

                  <div className="mt-1 space-y-0.5">
                    <Link
                      href={isOwner ? "/owner" : "/tenant"}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-[#7ca982]/10 transition-colors"
                    >
                      <span>{isOwner ? "Owner Hub" : "Tenant Hub"}</span>
                      <span className="text-[10px] font-bold text-[#7ca982]">Hub</span>
                    </Link>
                    <Link
                      href={appHome}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-[#7ca982]/10 transition-colors"
                    >
                      <span>{isOwner ? "Owner Portfolio" : "Tenancy Workspace"}</span>
                      <span className="text-[10px] font-bold uppercase text-[#7ca982]">Desk</span>
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-[#7ca982]/10 transition-colors"
                    >
                      Profile & Settings
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
        </div>
      </div>
    </header>
  );
}
