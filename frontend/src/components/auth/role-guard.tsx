"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useNivasa } from "@/store/nivasa-store";
import type { UserRole } from "@/types";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export function RoleGuard({ children, allowedRole }: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, toast } = useNivasa();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // 1. If not authenticated, redirect to login
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // 2. If authenticated with wrong role, redirect to their role dashboard
    if (user.role !== allowedRole) {
      toast(`Access restricted to ${allowedRole}s. Redirected to your dashboard.`);
      router.replace(user.role === "owner" ? "/owner" : "/tenant");
    }
  }, [user, allowedRole, mounted, pathname, router, toast]);

  if (!mounted || !user || user.role !== allowedRole) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7ca982]/20 text-[#5a835f] dark:text-[#a8cca9] animate-pulse mb-4">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <p className="text-sm font-semibold text-[#1d3122] dark:text-[#f5f9f6]">
          Verifying {allowedRole === "owner" ? "Owner" : "Tenant"} Credentials...
        </p>
        <p className="text-xs text-[#4e6853] dark:text-[#9bb3a0] mt-1">
          Checking permissions and access controls
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
