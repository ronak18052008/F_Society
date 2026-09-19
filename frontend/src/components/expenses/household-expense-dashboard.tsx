"use client";

import { useState, useEffect, useMemo } from "react";
import { formatInr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ExpenseCard } from "@/components/expenses/expense-card";
import { CreateExpenseModal } from "@/components/expenses/create-expense-modal";
import type {
  Expense,
  ExpenseCategory,
  HouseholdBalances,
} from "@/types/expenses";

interface HouseholdExpenseDashboardProps {
  householdId?: string;
  householdName?: string;
  currentUserId?: string;
  currentUserName?: string;
}

const CATEGORIES: { value: "ALL" | ExpenseCategory; label: string; icon: string }[] = [
  { value: "ALL", label: "All Expenses", icon: "📑" },
  { value: "RENT", label: "Rent", icon: "🏠" },
  { value: "ELECTRICITY", label: "Electricity", icon: "⚡" },
  { value: "WATER", label: "Water", icon: "💧" },
  { value: "INTERNET", label: "Internet", icon: "🌐" },
  { value: "MAINTENANCE", label: "Maintenance", icon: "🛠️" },
  { value: "GROCERIES", label: "Groceries", icon: "🛒" },
  { value: "UTILITIES", label: "Utilities", icon: "💡" },
  { value: "OTHER", label: "Other", icon: "📦" },
];

export function HouseholdExpenseDashboard({
  householdId = "rent-navrang",
  householdName = "Navrangpura Shared Residency",
  currentUserId = "user-tenant-1",
  currentUserName = "A. Shah",
}: HouseholdExpenseDashboardProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<HouseholdBalances | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<"ALL" | ExpenseCategory>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "SETTLED">("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [settlingNote, setSettlingNote] = useState<string | null>(null);

  // Default household co-residents
  const roommates = useMemo(
    () => [
      { id: "user-tenant-1", name: "A. Shah" },
      { id: "user-tenant-2", name: "M. Iyer" },
      { id: "user-tenant-3", name: "R. Kapoor" },
    ],
    []
  );

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/expenses/${householdId}`);
      const json = await res.json();
      if (json.success) {
        setExpenses(json.expenses || []);
        setBalances(json.balances || null);
      }
    } catch (err) {
      console.warn("Error loading expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [householdId]);

  // Filtered expenses
  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (activeCategory !== "ALL" && e.category !== activeCategory) return false;
      if (statusFilter === "OPEN" && e.isSettled) return false;
      if (statusFilter === "SETTLED" && !e.isSettled) return false;
      return true;
    });
  }, [expenses, activeCategory, statusFilter]);

  // Current user's balance
  const myBalance = balances?.balances.find((b) => b.userId === currentUserId) || {
    totalPaid: 0,
    totalOwed: 0,
    netBalance: 0,
  };

  const handleExpenseCreated = (newExpense: Expense) => {
    setExpenses((prev) => [newExpense, ...prev]);
    fetchExpenses();
  };

  const handleSettle = async (expenseId: string, targetUserId?: string) => {
    try {
      const exp = expenses.find((e) => e.id === expenseId);
      if (!exp) return;

      const payerId = targetUserId && targetUserId !== "all" ? targetUserId : currentUserId;
      const payeeId = exp.paidBy;

      const res = await fetch(`/api/expenses/${expenseId}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payerId,
          payeeId,
          amount: exp.amount,
          targetUserId: targetUserId === "all" ? undefined : targetUserId,
          idempotencyKey: `settle-${expenseId}-${payerId}-${Date.now()}`,
        }),
      });

      const json = await res.json();
      if (json.success) {
        fetchExpenses();
      }
    } catch (err) {
      console.error("Settlement error:", err);
    }
  };

  const handleDelete = async (expenseId: string) => {
    try {
      const res = await fetch(`/api/expenses/${expenseId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
        fetchExpenses();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleQuickSettleSuggestion = async (sugg: { fromUserId: string; toUserId: string; amount: number }) => {
    setSettlingNote(`Settling ₹${sugg.amount.toFixed(2)}...`);
    try {
      // Find open expenses between these users or record direct settlement
      const openExp = expenses.find((e) => !e.isSettled && (e.paidBy === sugg.toUserId || e.paidBy === sugg.fromUserId));
      const expId = openExp ? openExp.id : expenses[0]?.id;

      if (expId) {
        await fetch(`/api/expenses/${expId}/settle`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payerId: sugg.fromUserId,
            payeeId: sugg.toUserId,
            amount: sugg.amount,
            referenceNote: "Mutual peer-to-peer ledger reconciliation",
            idempotencyKey: `direct-sugg-${sugg.fromUserId}-${sugg.toUserId}-${Date.now()}`,
          }),
        });
        fetchExpenses();
      }
    } finally {
      setSettlingNote(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Banner & Action */}
      <div className="rounded-2xl border border-line bg-card p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-serif font-bold text-ink">{householdName}</h2>
            <span className="rounded-full bg-[var(--primary-pista)]/15 px-2.5 py-0.5 text-[10px] font-bold text-[var(--text-main)] uppercase tracking-wider">
              Feature 5 · Split Engine
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">
            Transparent shared ledger with penny-balanced splits (Equal, Percentage, Custom, Usage-based) &amp; automated settlement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="bg-[var(--primary-pista)] hover:bg-[var(--primary-pista-hover)] text-white shadow-2xs cursor-pointer font-bold inline-flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Expense</span>
          </Button>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Household Total */}
        <div className="rounded-2xl border border-line bg-card p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block">
            Household Total
          </span>
          <p className="mt-1 text-2xl font-serif font-bold text-ink">
            {formatInr(balances?.totalExpenses || 0)}
          </p>
          <span className="mt-1 text-[11px] text-ink-muted block">
            {expenses.length} shared bill{expenses.length !== 1 ? "s" : ""} recorded
          </span>
        </div>

        {/* Card 2: Monthly Total */}
        <div className="rounded-2xl border border-line bg-card p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block">
            This Month
          </span>
          <p className="mt-1 text-2xl font-serif font-bold text-ink">
            {formatInr(balances?.monthlyTotal || 0)}
          </p>
          <span className="mt-1 text-[11px] text-ink-muted block">
            Current calendar billing cycle
          </span>
        </div>

        {/* Card 3: Personal Contribution */}
        <div className="rounded-2xl border border-line bg-card p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block">
            Your Contribution
          </span>
          <p className="mt-1 text-2xl font-serif font-bold text-ink">
            {formatInr(myBalance.totalPaid)}
          </p>
          <span className="mt-1 text-[11px] text-ink-muted block">
            Share consumed: {formatInr(myBalance.totalOwed)}
          </span>
        </div>

        {/* Card 4: Net Balance */}
        <div className={`rounded-2xl border p-4 shadow-xs ${
          myBalance.netBalance > 0.01
            ? "border-emerald-500/30 bg-emerald-500/5"
            : myBalance.netBalance < -0.01
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-line bg-card"
        }`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block">
            Your Net Balance
          </span>
          <p className={`mt-1 text-2xl font-serif font-bold ${
            myBalance.netBalance > 0.01
              ? "text-emerald-600 dark:text-emerald-400"
              : myBalance.netBalance < -0.01
              ? "text-amber-600 dark:text-amber-400"
              : "text-ink"
          }`}>
            {myBalance.netBalance > 0.01
              ? `+${formatInr(myBalance.netBalance)}`
              : formatInr(myBalance.netBalance)}
          </p>
          <span className="mt-1 text-[11px] font-semibold block">
            {myBalance.netBalance > 0.01
              ? "You are owed by roommates"
              : myBalance.netBalance < -0.01
              ? "You owe money to roommates"
              : "All settled up"}
          </span>
        </div>
      </div>

      {/* Debt Simplification & Settlement Suggestions */}
      {balances && balances.settlementSuggestions.length > 0 && (
        <div className="rounded-2xl border border-[var(--primary-pista)]/40 bg-[var(--primary-pista)]/10 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🤝</span>
              <h3 className="text-sm font-bold text-ink">
                Automated Debt Simplification ({balances.settlementSuggestions.length} settlement{balances.settlementSuggestions.length !== 1 ? "s" : ""})
              </h3>
            </div>
            <span className="text-[11px] text-ink-muted">
              Minimum transaction path
            </span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {balances.settlementSuggestions.map((sugg, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-line bg-card p-3 text-xs shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-ink">
                    <span>{sugg.fromUserName}</span>
                    <span className="text-ink-muted">→</span>
                    <span>{sugg.toUserName}</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-[var(--accent-forest)] block mt-0.5">
                    {formatInr(sugg.amount)}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={Boolean(settlingNote)}
                  onClick={() => handleQuickSettleSuggestion(sugg)}
                  className="cursor-pointer rounded-lg bg-[var(--primary-pista)] hover:bg-[var(--primary-pista-hover)] text-white px-2.5 py-1 text-[11px] font-bold shadow-2xs transition"
                >
                  Settle Up
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter Pills & Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-3xl no-scrollbar">
          {CATEGORIES.map((cat) => {
            const count =
              cat.value === "ALL"
                ? expenses.length
                : expenses.filter((e) => e.category === cat.value).length;

            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setActiveCategory(cat.value)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  activeCategory === cat.value
                    ? "border-[var(--primary-pista)] bg-[var(--primary-pista)]/15 text-[var(--text-main)]"
                    : "border-line bg-card text-ink-muted hover:border-[var(--primary-pista)]/40"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="rounded-full bg-black/5 dark:bg-white/5 px-1.5 py-0.2 text-[10px] font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 shrink-0 rounded-xl border border-line bg-card p-1 text-xs">
          {(["ALL", "OPEN", "SETTLED"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                statusFilter === s
                  ? "bg-[var(--primary-pista)] text-white"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {s === "ALL" ? "All" : s === "OPEN" ? "Open" : "Settled"}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-line p-12 text-center bg-card">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary-pista)] border-t-transparent mb-2" />
            <p className="text-xs text-ink-muted">Loading household expenses &amp; split calculations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-10 text-center bg-paper">
            <EmptyState
              title="No Expenses Found"
              body="No household expenses match your current filters. Click &quot;Add Expense&quot; above to log and split a new bill."
            />
          </div>
        ) : (
          filtered.map((exp) => (
            <ExpenseCard
              key={exp.id}
              expense={exp}
              currentUserId={currentUserId}
              onSettle={handleSettle}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Create Modal */}
      <CreateExpenseModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        householdId={householdId}
        roommates={roommates}
        currentUserId={currentUserId}
        onExpenseCreated={handleExpenseCreated}
      />
    </div>
  );
}
