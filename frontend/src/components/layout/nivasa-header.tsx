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
  type: "city" | "locality" | "property" | "feature";
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

const PLATFORM_FEATURES = [
  {
    id: "risk",
    name: "Rental Risk Engine",
    badge: "Risk 0-100",
    badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    description: "Deterministic scoring across financial, legal, physical & market risks.",
    url: "/properties?view=risk",
    icon: (
      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: "scam",
    name: "AI Scam & Listing Shield",
    badge: "Authenticity",
    badgeColor: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
    description: "Detects price anomalies, duplicate listings, and suspicious deposit terms.",
    url: "/properties?view=authentic",
    icon: (
      <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    id: "triage",
    name: "AI Maintenance Triage",
    badge: "Live Diagnosis",
    badgeColor: "bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30",
    description: "Urgency evaluation, trade dispatching, and fair repair cost estimation.",
    url: "/maintenance/triage",
    icon: (
      <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: "expenses",
    name: "Roommate Expense Engine",
    badge: "Smart Split",
    badgeColor: "bg-teal-500/15 text-teal-800 dark:text-teal-200 border-teal-500/30",
    description: "Proportional split, monthly ledgers, and simplified bilateral settlement.",
    url: "/tenant/expenses",
    icon: (
      <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "reputation",
    name: "Property Reputation Graph",
    badge: "Trust Graph",
    badgeColor: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    description: "Interactive network graph mapping landlords, inspections, and verified history.",
    url: "/properties",
    icon: (
      <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="18" cy="18" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M9 6h6M6 9v6m12-6v6m-9 3h6" />
      </svg>
    ),
  },
  {
    id: "copilot",
    name: "AI Rental Copilot",
    badge: "GenAI v2.4",
    badgeColor: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
    description: "Conversational tenant & owner advisor grounded in Indian tenancy law.",
    url: "/copilot",
    icon: (
      <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "AI Maintenance Triage Alert",
    desc: "AC compressor issue on Navrangpura 3BHK diagnosed as HIGH urgency (HVAC).",
    time: "10m ago",
    unread: true,
    url: "/maintenance/triage",
    badge: "Maintenance",
  },
  {
    id: "notif-2",
    title: "RentTruth™ Verified",
    desc: "14 new listings in Bengaluru Whitefield validated with zero brokerage.",
    time: "1h ago",
    unread: true,
    url: "/properties?city=Bangalore",
    badge: "RentTruth",
  },
  {
    id: "notif-3",
    title: "Scam Shield Update",
    desc: "Listing with suspicious deposit multiplier automatically flagged & reviewed.",
    time: "3h ago",
    unread: false,
    url: "/properties",
    badge: "Security",
  },
];

export function NivasaHeader({ collapsed, onToggleCollapse, onOpenMobile }: NivasaHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, savedIds } = useNivasa();
  const { theme, toggle } = useTheme();

  const isOwner = user?.role === "owner";

  // Menu states
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const featuresMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const appDashboard = isOwner ? "/owner" : "/tenant";

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
    if (pathname.startsWith("/maintenance/triage")) return "AI Maintenance Triage";
    if (pathname.startsWith("/tenant/expenses")) return "Roommate Expense Engine";
    if (pathname.startsWith("/copilot")) return "AI Rental Copilot";
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
      const target = e.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
      if (featuresMenuRef.current && !featuresMenuRef.current.contains(target)) {
        setFeaturesOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(target)) {
        setNotificationsOpen(false);
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
        setFeaturesOpen(false);
        setNotificationsOpen(false);
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

  const unreadNotifCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e5dfc5]/90 dark:border-[#243828]/90 bg-white/85 dark:bg-[#111c15]/85 backdrop-blur-xl shadow-xs transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 gap-3">
        {/* ========================================================================= */}
        {/* Left: Hamburger (mobile), Collapse (desktop), Brand Logo, Page Breadcrumb */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
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

          {/* Brand Mark & Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#7ca982] to-[#557e5b] text-white shadow-xs group-hover:scale-105 transition-transform">
                <span className="font-serif font-bold text-sm tracking-tight">N</span>
              </div>
              <div className="hidden xl:flex flex-col">
                <span className="text-xs font-serif font-extrabold tracking-wider text-ink uppercase leading-none">Nivasa</span>
                <span className="text-[9px] text-[#7ca982] dark:text-[#a3caa6] font-semibold tracking-widest leading-none mt-0.5">RESIDENTIAL OS</span>
              </div>
            </Link>

            <span className="text-xs text-ink-muted/40 hidden sm:inline">/</span>

            {/* Breadcrumb Title */}
            <h2 className="text-xs sm:text-sm font-bold text-ink tracking-tight font-serif truncate max-w-[130px] sm:max-w-[180px] md:max-w-none">
              {getPageTitle()}
            </h2>

            {/* Read-Only Role Badge */}
            {user && (
              <span
                className={cn(
                  "hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-2xs",
                  isOwner
                    ? "bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30"
                    : "bg-[#7ca982]/15 text-[#1d3122] dark:text-[#a3caa6] border border-[#7ca982]/30"
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", isOwner ? "bg-amber-500" : "bg-[#7ca982]")} />
                <span>{isOwner ? "OWNER" : "TENANT"}</span>
              </span>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Center: Navigation Links + AI Suite Mega-Menu Dropdown */}
        {/* ========================================================================= */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {/* Discover Residences */}
          <Link
            href="/properties"
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:bg-[#7ca982]/10",
              pathname.startsWith("/properties")
                ? "text-[#47704c] dark:text-[#a3caa6] bg-[#7ca982]/15 font-bold"
                : "text-[#4e6853] dark:text-[#a5b8aa] hover:text-[#1d3122] dark:hover:text-[#f5f9f6]"
            )}
          >
            Residences
          </Link>

          {/* AI Suite Dropdown */}
          <div ref={featuresMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setFeaturesOpen((prev) => !prev)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:bg-[#7ca982]/10 cursor-pointer",
                featuresOpen
                  ? "bg-[#7ca982]/20 text-[#23452b] dark:text-[#a3caa6] border border-[#7ca982]/30"
                  : "text-[#4e6853] dark:text-[#a5b8aa] hover:text-[#1d3122] dark:hover:text-[#f5f9f6]"
              )}
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AI Suite</span>
              <svg
                className={cn("h-3.5 w-3.5 transition-transform duration-200", featuresOpen && "rotate-180")}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* AI Suite Mega-Flyout */}
            {featuresOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[480px] max-w-[90vw] rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-white/95 dark:bg-[#121f16]/95 p-4 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-[#e5dfc5]/60 dark:border-[#2a3f31]/60">
                  <div>
                    <span className="text-[11px] font-bold font-serif uppercase tracking-wider text-ink block">
                      Autonomous Rental Intelligence
                    </span>
                    <span className="text-[10px] text-ink-muted block">
                      6 Deterministic AI Engines for Indian Tenancy & Security
                    </span>
                  </div>
                  <span className="rounded-full bg-[#7ca982]/15 border border-[#7ca982]/30 px-2 py-0.5 text-[9px] font-bold text-[#23452b] dark:text-[#a3caa6]">
                    Nivasa v2.4
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1">
                  {PLATFORM_FEATURES.map((feat) => (
                    <Link
                      key={feat.id}
                      href={feat.url}
                      onClick={() => setFeaturesOpen(false)}
                      className="group flex flex-col justify-between p-2.5 rounded-2xl border border-transparent hover:border-[#7ca982]/30 hover:bg-[#7ca982]/10 transition-all text-left"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-xl bg-card border border-line shrink-0 group-hover:scale-105 transition-transform">
                          {feat.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-ink group-hover:text-[#47704c] dark:group-hover:text-[#a3caa6] truncate">
                              {feat.name}
                            </span>
                          </div>
                          <p className="text-[10px] text-ink-muted leading-tight mt-1 line-clamp-2">
                            {feat.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={cn("rounded-md px-1.5 py-0.5 text-[9px] font-semibold border", feat.badgeColor)}>
                          {feat.badge}
                        </span>
                        <span className="text-[10px] font-semibold text-[#57875d] opacity-0 group-hover:opacity-100 transition-opacity">
                          Launch →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#e5dfc5]/60 dark:border-[#2a3f31]/60 flex items-center justify-between text-[11px]">
                  <Link
                    href="/maintenance/triage"
                    onClick={() => setFeaturesOpen(false)}
                    className="text-[#47704c] dark:text-[#a3caa6] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Try Maintenance Triage</span>
                    <span>→</span>
                  </Link>
                  <span className="text-[10px] text-ink-muted">Zero-Fabrication Guarantee</span>
                </div>
              </div>
            )}
          </div>

          {/* Maintenance Triage */}
          <Link
            href="/maintenance/triage"
            className={cn(
              "hidden lg:inline-flex px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:bg-[#7ca982]/10",
              pathname.startsWith("/maintenance")
                ? "text-[#47704c] dark:text-[#a3caa6] bg-[#7ca982]/15 font-bold"
                : "text-[#4e6853] dark:text-[#a5b8aa] hover:text-[#1d3122] dark:hover:text-[#f5f9f6]"
            )}
          >
            Maintenance Triage
          </Link>

          {/* Metro Hubs */}
          <Link
            href="/cities"
            className={cn(
              "hidden xl:inline-flex px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:bg-[#7ca982]/10",
              pathname.startsWith("/cities")
                ? "text-[#47704c] dark:text-[#a3caa6] bg-[#7ca982]/15 font-bold"
                : "text-[#4e6853] dark:text-[#a5b8aa] hover:text-[#1d3122] dark:hover:text-[#f5f9f6]"
            )}
          >
            Metro Hubs
          </Link>

          {/* How it Works */}
          <Link
            href="/how-it-works"
            className={cn(
              "hidden xl:inline-flex px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:bg-[#7ca982]/10",
              pathname === "/how-it-works"
                ? "text-[#47704c] dark:text-[#a3caa6] bg-[#7ca982]/15 font-bold"
                : "text-[#4e6853] dark:text-[#a5b8aa] hover:text-[#1d3122] dark:hover:text-[#f5f9f6]"
            )}
          >
            How It Works
          </Link>
        </nav>

        {/* ========================================================================= */}
        {/* Center-Right: Search Input with Cmd+K */}
        {/* ========================================================================= */}
        <div ref={searchContainerRef} className="relative hidden md:block max-w-[200px] lg:max-w-[260px] w-full">
          <form onSubmit={executeSearch} className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search homes, cities..."
              className="w-full rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#faf7f0]/80 dark:bg-[#1d2d22]/80 pl-8 pr-11 py-1.5 text-xs text-[#1d3122] dark:text-[#f5f9f6] placeholder:text-[#7d9782] focus:border-[#7ca982] focus:bg-white dark:focus:bg-[#142018] focus:ring-2 focus:ring-[#7ca982]/20 focus:outline-none transition-all shadow-2xs"
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
              <kbd className="rounded border border-[#e5dfc5] dark:border-[#2a3f31] bg-white dark:bg-[#142018] px-1 text-[9px] text-[#7d9782] font-mono">
                ⌘K
              </kbd>
            </div>
          </form>

          {/* Search Flyout Modal */}
          {searchOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-white dark:bg-[#142018] p-3.5 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150 z-50">
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
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
                          </svg>
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
                  className="text-[#47704c] dark:text-[#a3caa6] font-semibold hover:underline"
                >
                  Explore All 4,750+ Listings →
                </Link>
                <span className="text-ink-muted text-[10px]">Zero Brokerage</span>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* Right Actions: Notifications, AI Copilot, Role Actions, Theme, User Auth */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Notifications Flyout */}
          <div ref={notifMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#faf7f0] dark:bg-[#1d2d22] text-[#4e6853] dark:text-[#a5b8aa] hover:border-[#7ca982] hover:text-[#1d3122] dark:hover:text-white transition-colors cursor-pointer"
              aria-label="View platform notifications"
              title="Notifications & Alerts"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-bold shadow-xs animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Notifications Menu */}
            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-white dark:bg-[#142018] p-3 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                <div className="flex items-center justify-between px-2 pb-2 border-b border-line">
                  <span className="text-xs font-serif font-bold text-ink">Platform Signals & Alerts</span>
                  <span className="text-[10px] font-semibold text-[#7ca982]">Live Telemetry</span>
                </div>
                <div className="mt-2 space-y-1 divide-y divide-line/40 max-h-64 overflow-y-auto">
                  {NOTIFICATIONS.map((notif) => (
                    <Link
                      key={notif.id}
                      href={notif.url}
                      onClick={() => setNotificationsOpen(false)}
                      className="block p-2 rounded-xl hover:bg-[#7ca982]/10 transition-colors pt-2 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-ink truncate">{notif.title}</span>
                        <span className="text-[9px] text-ink-muted">{notif.time}</span>
                      </div>
                      <p className="text-[10px] text-ink-muted mt-1 leading-snug">{notif.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Copilot Quick Button */}
          <Link
            href="/copilot"
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#7ca982]/15 to-[#557e5b]/15 hover:from-[#7ca982] hover:to-[#557e5b] hover:text-white text-[#1d3122] dark:text-[#a3caa6] px-2.5 sm:px-3 py-1.5 text-xs font-semibold border border-[#7ca982]/30 transition-all cursor-pointer shadow-2xs group"
            title="Nivasa AI Rental Copilot"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 group-hover:bg-white animate-pulse" />
            <span className="hidden sm:inline font-serif font-medium">AI Copilot</span>
            <span className="rounded-full bg-[#7ca982]/20 group-hover:bg-white/20 px-1 py-0.2 text-[9px] font-bold">2.4</span>
          </Link>

          {/* Contextual Role Actions (Only when logged in) */}
          {user && (
            !isOwner ? (
              <>
                {/* Tenant: Smart Roommate Expenses */}
                <Link
                  href="/tenant/expenses"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 hover:bg-teal-600 hover:text-white text-teal-900 dark:text-teal-200 px-3 py-1.5 text-xs font-semibold border border-teal-500/30 transition-all cursor-pointer shadow-2xs"
                  title="Roommate Expense Engine"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden lg:inline">Expenses</span>
                </Link>

                {/* Tenant: Saved Homes */}
                <Link
                  href="/properties?saved=true"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#faf7f0] dark:bg-[#1d2d22] text-[#4e6853] dark:text-[#a5b8aa] hover:border-[#7ca982] hover:text-rose-500 transition-colors"
                  title="Saved Residences"
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
              </>
            ) : (
              /* Owner: + Post Residence */
              <Link
                href="/owner/properties/new"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-all cursor-pointer hover:scale-102"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>Post Residence</span>
              </Link>
            )
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#faf7f0] dark:bg-[#1d2d22] text-[#4e6853] dark:text-[#a5b8aa] transition-all hover:scale-105 hover:text-[#1d3122] dark:hover:text-[#f5f9f6] focus-visible:outline-none cursor-pointer"
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

          {/* User Profile Dropdown or Auth Action */}
          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] bg-[#faf7f0] dark:bg-[#1d2d22] pl-1 pr-2.5 py-1 text-xs font-semibold text-[#1d3122] dark:text-[#8fb893] hover:border-[#7ca982] transition-colors cursor-pointer shadow-2xs"
              >
                <div className={cn("flex h-6 w-6 items-center justify-center rounded-full text-white text-[11px] font-bold", isOwner ? "bg-amber-600" : "bg-[#7ca982]")}>
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="hidden sm:inline max-w-[70px] truncate">{user.name || "Account"}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-white dark:bg-[#142018] p-2.5 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3 py-2.5 border-b border-line">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink block truncate">{user.name || "Member"}</span>
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                        isOwner ? "bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/30" : "bg-[#7ca982]/20 text-[#1d3122] dark:text-[#a3caa6] border border-[#7ca982]/30"
                      )}>
                        {isOwner ? "OWNER" : "TENANT"}
                      </span>
                    </div>
                    <span className="text-[11px] text-ink-muted block truncate mt-0.5">{user.email}</span>
                  </div>

                  <div className="mt-1.5 space-y-0.5">
                    <Link
                      href={appDashboard}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-[#7ca982]/10 transition-colors"
                    >
                      <span>{isOwner ? "Owner Portal" : "Tenant Portal"}</span>
                      <span className="text-[10px] font-bold text-[#7ca982]">Hub</span>
                    </Link>

                    {/* Role-Specific Direct Tools */}
                    {!isOwner ? (
                      <Link
                        href="/tenant/expenses"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-[#7ca982]/10 transition-colors"
                      >
                        <span>Roommate Expenses</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-800 dark:text-teal-300">Split</span>
                      </Link>
                    ) : (
                      <Link
                        href="/owner/properties/new"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-[#7ca982]/10 transition-colors"
                      >
                        <span>Post New Listing</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300">+ Add</span>
                      </Link>
                    )}

                    <Link
                      href="/maintenance/triage"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-[#7ca982]/10 transition-colors"
                    >
                      <span>Maintenance Triage</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300">AI</span>
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-[#7ca982]/10 transition-colors"
                    >
                      Profile & Settings
                    </Link>

                    <div className="my-1 border-t border-line" />

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleSignOut();
                      }}
                      className="w-full text-left rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      Logout
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
              <Button href="/register" size="sm" className="rounded-full shadow-xs">
                Get started
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
