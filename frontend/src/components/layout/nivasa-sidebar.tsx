"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { NivasaLogo } from "@/components/brand/nivasa-logo";
import { useNivasa } from "@/store/nivasa-store";
import { useTheme } from "@/components/layout/theme-provider";
import { cn } from "@/lib/cn";

export interface NivasaSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavSection {
  title: string;
  items: {
    href: string;
    label: string;
    icon: (active: boolean) => React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
  }[];
}

export function NivasaSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: NivasaSidebarProps) {
  const pathname = usePathname();
  const { user, savedIds, switchRole } = useNivasa();
  const { theme, toggle } = useTheme();

  const isOwner = user?.role === "owner";

  // Close mobile sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        onCloseMobile();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, onCloseMobile]);

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Dynamic Navigation Sections based on Active Role
  const ownerSections: NavSection[] = [
    {
      title: "Owner Command Deck",
      items: [
        {
          href: "/owner",
          label: "Owner Hub",
          badge: "Deck",
          badgeColor: "pista",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
        },
        {
          href: "/owner/properties/new",
          label: "List Residence",
          badge: "+ New",
          badgeColor: "pista",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          ),
        },
        {
          href: "/owner/dashboard",
          label: "Portfolio Workspace",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          ),
        },
        {
          href: "/ai/agreement",
          label: "AI Lease Drafter",
          badge: "Legal",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          href: "/rental/rent-navrang/passport",
          label: "Inspection Passports",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          ),
        },
        {
          href: "/rental/rent-navrang/payments",
          label: "Payment Ledgers",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Market Intelligence",
      items: [
        {
          href: "/dashboard",
          label: "Market Benchmarks",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
        },
        {
          href: "/properties",
          label: "Explore Network",
          badge: "4,750+",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
        },
        {
          href: "/cities",
          label: "Metro Corridors",
          badge: "6 Cities",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Tenant View Mode",
      items: [
        {
          href: "/tenant",
          label: "View as Tenant",
          badge: "Switch",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
        },
      ],
    },
  ];

  const tenantSections: NavSection[] = [
    {
      title: "Core Discovery",
      items: [
        {
          href: "/properties",
          label: "Residences",
          badge: "4,750+",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
        },
        {
          href: "/cities",
          label: "Metro Hubs",
          badge: "6 Cities",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
            </svg>
          ),
        },
        {
          href: "/dashboard",
          label: "Market Intelligence",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Tenant Hub",
      items: [
        {
          href: "/tenant",
          label: "Tenant Hub",
          badge: "Active",
          badgeColor: "pista",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
        },
        {
          href: "/properties?saved=true",
          label: "Saved Homes",
          badge: savedIds.length > 0 ? savedIds.length : undefined,
          badgeColor: "rose",
          icon: (active) => (
            <svg
              className={cn("h-4 w-4 shrink-0", savedIds.length > 0 && "fill-rose-500 text-rose-500")}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={active ? 2.5 : 2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ),
        },
        {
          href: "/tenant/roommates",
          label: "Roommate Match",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
        },
        {
          href: "/tenant/requirements",
          label: "My Requirements",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          ),
        },
        {
          href: "/tenant/dashboard",
          label: "Active Tenancy",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Tenancy Intelligence",
      items: [
        {
          href: "/renttruth/prop-navrang-02",
          label: "RentTruth™ Audit",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          ),
        },
        {
          href: "/rental/rent-navrang/passport",
          label: "Condition Passport",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          ),
        },
        {
          href: "/ai/agreement",
          label: "AI Agreement",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          href: "/ai/recommend",
          label: "AI Advisor",
          badge: "AI",
          badgeColor: "indigo",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Property Owners",
      items: [
        {
          href: "/login/owner",
          label: "Owner Portal",
          badge: "+ Post",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          ),
        },
      ],
    },
  ];

  const navSections = isOwner ? ownerSections : tenantSections;

  const sidebarContent = (isMobile: boolean) => (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      {/* Top: Brand Header & Mode Switcher */}
      <div className="flex flex-col">
        <div className="flex h-16 items-center justify-between border-b border-[#e5dfc5] dark:border-[#2a3f31] px-4">
          <Link
            href="/"
            onClick={() => {
              if (isMobile) onCloseMobile();
            }}
            className="flex items-center gap-2.5 overflow-hidden group"
          >
            {collapsed && !isMobile ? (
              <NivasaLogo variant="mark" size="sm" />
            ) : (
              <NivasaLogo variant="horizontal" size="sm" />
            )}
          </Link>

          {/* Mobile Close Button (X) */}
          {isMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e5dfc5] dark:border-[#2a3f31] text-ink-muted hover:text-ink hover:bg-[#7ca982]/10 transition-colors"
              aria-label="Close navigation"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Dynamic Role Switcher Pill */}
        {(!collapsed || isMobile) && (
          <div className="mx-3 mt-3 rounded-2xl bg-[#7ca982]/10 dark:bg-[#1d2d22] p-2.5 border border-[#7ca982]/25">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-ink flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", isOwner ? "bg-amber-500" : "bg-[#7ca982]")} />
                <span>{isOwner ? "Owner Mode" : "Tenant Mode"}</span>
              </span>
              <button
                type="button"
                onClick={() => switchRole(isOwner ? "tenant" : "owner")}
                className="text-[10px] font-bold text-[#57875d] dark:text-[#a3caa6] hover:underline cursor-pointer"
              >
                Switch to {isOwner ? "Tenant" : "Owner"} →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Center: Scrollable Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-[#7ca982]/20">
        <div className="space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {/* Section Header */}
              {(!collapsed || isMobile) && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-ink-muted/80 pb-1">
                  {section.title}
                </p>
              )}

              {/* Navigation Items */}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (isMobile) onCloseMobile();
                      }}
                      className={cn(
                        "group relative flex items-center rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150",
                        active
                          ? "bg-[#7ca982] text-white shadow-xs"
                          : "text-ink/80 hover:bg-[#7ca982]/10 hover:text-ink",
                        collapsed && !isMobile && "justify-center px-2 py-2.5"
                      )}
                      title={collapsed && !isMobile ? item.label : undefined}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.icon(active)}
                        {(!collapsed || isMobile) && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {/* Badges / Active Indicator */}
                      {(!collapsed || isMobile) && (
                        <div className="ml-auto flex items-center gap-1.5 pl-2">
                          {item.badge ? (
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[9px] font-bold shrink-0 leading-none",
                                active
                                  ? "bg-white/20 text-white"
                                  : item.badgeColor === "rose"
                                  ? "bg-rose-500 text-white"
                                  : item.badgeColor === "indigo"
                                  ? "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300"
                                  : "bg-[#7ca982]/20 text-[#1d3122] dark:text-[#a3caa6]"
                              )}
                            >
                              {item.badge}
                            </span>
                          ) : active ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          ) : null}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Controls: User Profile & Collapse Toggle */}
      <div className="p-3 border-t border-[#e5dfc5] dark:border-[#2a3f31] bg-white/40 dark:bg-[#142018]/40 backdrop-blur-md">
        {/* User Card */}
        {user ? (
          <Link
            href="/profile"
            onClick={() => {
              if (isMobile) onCloseMobile();
            }}
            className={cn(
              "flex items-center gap-2.5 rounded-2xl p-2 hover:bg-[#7ca982]/10 transition-colors mb-2",
              collapsed && !isMobile && "justify-center p-1"
            )}
            title={collapsed && !isMobile ? user.name || user.email : undefined}
          >
            <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold shadow-xs", isOwner ? "bg-amber-600" : "bg-[#7ca982]")}>
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
            {(!collapsed || isMobile) && (
              <div className="truncate text-left">
                <span className="text-xs font-bold text-ink block truncate">{user.name || "Member"}</span>
                <span className="text-[10px] text-ink-muted uppercase font-semibold">{user.role} Workspace</span>
              </div>
            )}
          </Link>
        ) : (
          <Link
            href="/login"
            onClick={() => {
              if (isMobile) onCloseMobile();
            }}
            className={cn(
              "flex items-center gap-2 rounded-2xl p-2 text-xs font-semibold text-ink-muted hover:text-ink hover:bg-[#7ca982]/10 transition-colors mb-2",
              collapsed && !isMobile && "justify-center"
            )}
            title="Sign in to your Nivasa account"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            {(!collapsed || isMobile) && <span>Sign In</span>}
          </Link>
        )}

        {/* Desktop Collapse / Expand Toggle Button */}
        {!isMobile && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#e5dfc5] dark:border-[#2a3f31] py-1.5 text-xs text-ink-muted hover:text-ink hover:border-[#7ca982] transition-colors cursor-pointer"
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
            {!collapsed && <span className="text-[11px] font-medium">Collapse</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed/Sticky Sidebar */}
      <aside
        aria-label="Desktop Nivasa Sidebar"
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 hidden lg:flex flex-col border-r border-[#e5dfc5] dark:border-[#2a3f31] bg-[#ffffff] dark:bg-[#142018] transition-all duration-300 ease-in-out shadow-sm",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {sidebarContent(false)}
      </aside>

      {/* 2. Mobile Off-Canvas Drawer Backdrop */}
      {mobileOpen && (
        <div
          role="presentation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* 3. Mobile Off-Canvas Drawer */}
      <aside
        aria-label="Mobile Nivasa Navigation"
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] bg-[#ffffff] dark:bg-[#142018] border-r border-[#e5dfc5] dark:border-[#2a3f31] shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent(true)}
      </aside>
    </>
  );
}
