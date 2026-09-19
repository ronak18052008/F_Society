"use client";

import { useState, useEffect } from "react";
import { NivasaSidebar } from "@/components/layout/nivasa-sidebar";
import { NivasaHeader } from "@/components/layout/nivasa-header";
import { NivasaSplash } from "@/components/brand/nivasa-splash";
import { FloatingCopilot } from "@/components/ai/floating-copilot";
import { Footer } from "@/components/layout/footer";
import { cn } from "@/lib/cn";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Restore sidebar preference from localStorage if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nivasa_sidebar_collapsed");
      if (stored !== null) {
        setCollapsed(stored === "true");
      }
    } catch {
      // Ignore storage errors in private mode
    }
  }, []);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("nivasa_sidebar_collapsed", String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-paper text-ink transition-colors flex flex-col">
      {/* Startup Animated Splash Screen (once per session) */}
      <NivasaSplash />

      {/* Global Responsive Sidebar (Desktop Collapsible + Mobile Drawer) */}
      <NivasaSidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Primary Main Content Area dynamically offset by sidebar width */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-[padding] duration-300 ease-in-out min-w-0",
          collapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        <NivasaHeader
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main id="main" className="flex-1 min-w-0">
          {children}
        </main>
        <Footer />
        {/* Global Summonable AI Rental Copilot Widget */}
        <FloatingCopilot />
      </div>
    </div>
  );
}
