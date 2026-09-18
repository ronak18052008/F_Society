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
  const { user, savedIds } = useNivasa();
  const { theme, toggle } = useTheme();

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

  const navSections: NavSection[] = [
    {
      title: "Core Platform",
      items: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
        },
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
      ],
    },
    {
      title: "Tenant Hub",
      items: [
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
          label: "Tenant Portal",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Owner Portal",
      items: [
        {
          href: "/owner/properties/new",
          label: "Post Property",
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
          label: "Owner Workspace",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
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
      ],
    },
    {
      title: "Intelligence & Tools",
      items: [
        {
          href: "/renttruth/prop-navrang-02",
          label: "RentTruth™",
          badge: "Verified",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ),
        },
        {
          href: "/ai/recommend",
          label: "AI Matcher",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
        },
        {
          href: "/how-it-works",
          label: "How It Works",
          icon: (active) => (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
      ],
    },
  ];

  const sidebarContent = (isMobile: boolean) => (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      {/* Top Brand Header */}
      <div>
        <div
          className={cn(
            "flex items-center px-4 py-4 border-b border-[#e5dfc5] dark:border-[#2a3f31]",
            collapsed && !isMobile ? "justify-center" : "justify-between"
          )}
        >
          {collapsed && !isMobile ? (
            <NivasaLogo variant="mark" size="sm" href="/" />
          ) : (
            <NivasaLogo variant="horizontal" size="sm" href="/" showTagline={false} />
          )}

          {/* Mobile Close Button */}
          {isMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5dfc5] dark:border-[#2a3f31] text-ink-muted hover:text-ink hover:bg-[#7ca982]/10 transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation Item Sections */}
        <div className="overflow-y-auto px-3 py-4 space-y-6 max-h-[calc(100vh-140px)]">
          {navSections.map((section, idx) => (
            <div key={section.title || idx} className="space-y-1">
              {(!collapsed || isMobile) && (
                <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted/80 block mb-1.5">
                  {section.title}
                </span>
              )}

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : item.href.includes("?")
                      ? pathname === item.href.split("?")[0]
                      : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (isMobile) onCloseMobile();
                      }}
                      title={collapsed && !isMobile ? item.label : undefined}
                      className={cn(
                        "group flex items-center rounded-2xl px-2.5 py-2 text-xs font-medium transition-all duration-150 relative",
                        collapsed && !isMobile ? "justify-center" : "justify-between",
                        active
                          ? "bg-[#7ca982] text-white font-semibold shadow-xs"
                          : "text-ink-muted hover:text-ink hover:bg-[#7ca982]/10"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.icon(active)}
                        {(!collapsed || isMobile) && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {/* Active Indicator or Badge */}
                      {(!collapsed || isMobile) && (
                        <div>
                          {item.badge !== undefined ? (
                            <span
                              className={cn(
                                "rounded-full px-1.5 py-0.2 text-[9px] font-bold",
                                active
                                  ? "bg-white text-[#1d3122]"
                                  : item.badgeColor === "rose"
                                  ? "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400"
                                  : "bg-[#7ca982]/15 text-[#23452b] dark:text-[#a3caa6]"
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
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7ca982] text-white text-xs font-bold shadow-xs">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
            {(!collapsed || isMobile) && (
              <div className="truncate text-left">
                <span className="text-xs font-bold text-ink block truncate">{user.name || "Member"}</span>
                <span className="text-[10px] text-ink-muted uppercase font-semibold">{user.role} Space</span>
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
