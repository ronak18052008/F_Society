"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RoleGuard } from "@/components/auth/role-guard";
import { HouseholdExpenseDashboard } from "@/components/expenses/household-expense-dashboard";
import { useNivasa } from "@/store/nivasa-store";

export default function TenantExpensesPage() {
  const { user } = useNivasa();

  return (
    <RoleGuard allowedRole="tenant">
      <DashboardShell
        title="Smart Roommate Expenses &amp; Ledger"
        subtitle="Transparent co-living cost allocation with exact-cent split algorithms and peer settlements."
      >
        <HouseholdExpenseDashboard
          householdId="rent-navrang"
          householdName="Navrangpura Shared Residency"
          currentUserId={user?.id || "user-tenant-1"}
          currentUserName={user?.name || "A. Shah"}
        />
      </DashboardShell>
    </RoleGuard>
  );
}
