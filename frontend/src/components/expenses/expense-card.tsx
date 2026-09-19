"use client";

import { useState } from "react";
import { formatInr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Expense, ExpenseCategory } from "@/types/expenses";

interface ExpenseCardProps {
  expense: Expense;
  currentUserId: string;
  onSettle: (expenseId: string, targetUserId?: string) => Promise<void>;
  onDelete: (expenseId: string) => Promise<void>;
}

const CATEGORY_META: Record<ExpenseCategory, { label: string; icon: string; color: string }> = {
  RENT: { label: "Rent", icon: "🏠", color: "text-purple-600 bg-purple-500/10 border-purple-500/20" },
  ELECTRICITY: { label: "Electricity", icon: "⚡", color: "text-amber-600 bg-amber-500/10 border-amber-500/20" },
  WATER: { label: "Water", icon: "💧", color: "text-sky-600 bg-sky-500/10 border-sky-500/20" },
  INTERNET: { label: "Internet", icon: "🌐", color: "text-blue-600 bg-blue-500/10 border-blue-500/20" },
  MAINTENANCE: { label: "Maintenance", icon: "🛠️", color: "text-orange-600 bg-orange-500/10 border-orange-500/20" },
  GROCERIES: { label: "Groceries", icon: "🛒", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
  UTILITIES: { label: "Utilities", icon: "💡", color: "text-teal-600 bg-teal-500/10 border-teal-500/20" },
  OTHER: { label: "Other", icon: "📦", color: "text-slate-600 bg-slate-500/10 border-slate-500/20" },
};

export function ExpenseCard({
  expense,
  currentUserId,
  onSettle,
  onDelete,
}: ExpenseCardProps) {
  const [settling, setSettling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const meta = CATEGORY_META[expense.category] || CATEGORY_META.OTHER;
  const isPayer = expense.paidBy === currentUserId;
  const myShare = expense.participants.find((p) => p.userId === currentUserId);

  const handleSettleParticipant = async (userId: string) => {
    setSettling(userId);
    try {
      await onSettle(expense.id, userId);
    } finally {
      setSettling(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete expense "${expense.title}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(expense.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-card p-4 sm:p-5 shadow-xs hover:border-[var(--primary-pista)]/40 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Left: Icon & Meta */}
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-paper text-xl">
            {meta.icon}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-serif font-bold text-ink">{expense.title}</h3>
              <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.color}`}>
                {meta.label}
              </span>
              <span className="rounded-md bg-black/5 dark:bg-white/5 px-2 py-0.5 text-[10px] font-mono text-ink-muted">
                {expense.splitMethod}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-ink-muted">
              <span>Paid by <strong className="text-ink">{expense.paidByName || expense.paidBy}</strong></span>
              <span>·</span>
              <span>{expense.date}</span>
              {expense.description && (
                <>
                  <span>·</span>
                  <span className="truncate max-w-xs">{expense.description}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Amount & Overall Status */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-line">
          <div className="text-right">
            <span className="text-base sm:text-lg font-mono font-bold text-ink">
              {formatInr(expense.amount)}
            </span>
            <div className="text-[10px] text-ink-muted">
              {isPayer ? (
                <span className="text-[var(--accent-forest)] font-semibold">You paid</span>
              ) : myShare ? (
                <span>Your share: <strong className="text-ink">{formatInr(myShare.shareAmount)}</strong></span>
              ) : null}
            </div>
          </div>
          <div className="mt-1">
            <StatusBadge tone={expense.isSettled ? "ok" : "warn"}>
              {expense.isSettled ? "Settled" : "Open"}
            </StatusBadge>
          </div>
        </div>
      </div>

      {/* Participants Split Grid */}
      <div className="mt-4 pt-3 border-t border-line">
        <div className="flex items-center justify-between text-[11px] mb-2">
          <span className="font-bold uppercase tracking-wider text-ink-muted">
            Roommate Breakdown ({expense.participants.length})
          </span>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] text-[var(--accent-forest)] hover:underline font-semibold"
          >
            {expanded ? "Hide Details ↑" : "View Split Formulas ↓"}
          </button>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {expense.participants.map((part) => {
            const isMe = part.userId === currentUserId;
            const canSettle = !part.isPaid && (isPayer || isMe);

            return (
              <div
                key={part.userId}
                className={`flex items-center justify-between rounded-xl border p-2.5 text-xs ${
                  part.isPaid
                    ? "border-emerald-500/20 bg-emerald-500/5 text-ink"
                    : "border-amber-500/30 bg-amber-500/5 text-ink"
                }`}
              >
                <div>
                  <span className="font-bold text-[11px] block">
                    {part.userName} {isMe ? "(You)" : ""}
                  </span>
                  <span className="font-mono text-xs font-semibold text-ink">
                    {formatInr(part.shareAmount)}
                  </span>
                  {part.percentage && (
                    <span className="text-[10px] text-ink-muted ml-1">
                      ({part.percentage.toFixed(1)}%)
                    </span>
                  )}
                </div>

                <div className="text-right">
                  {part.isPaid ? (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      Paid ✓
                    </span>
                  ) : canSettle ? (
                    <button
                      type="button"
                      disabled={settling === part.userId}
                      onClick={() => handleSettleParticipant(part.userId)}
                      className="cursor-pointer rounded-lg bg-[var(--primary-pista)] hover:bg-[var(--primary-pista-hover)] px-2 py-1 text-[10px] font-bold text-white shadow-2xs transition"
                    >
                      {settling === part.userId ? "Saving..." : "Mark Paid"}
                    </button>
                  ) : (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                      Unpaid
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Expanded metadata & calculation notes */}
        {expanded && expense.metadata?.calculationExplanation && (
          <div className="mt-2 rounded-xl bg-paper p-2.5 text-[11px] text-ink-muted border border-line">
            <span className="font-bold text-ink">Transparent Formula: </span>
            {expense.metadata.calculationExplanation}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="mt-3 pt-2 flex items-center justify-between border-t border-line text-[11px]">
        <span className="text-ink-muted font-mono text-[10px]">ID: {expense.id}</span>
        <div className="flex items-center gap-2">
          {!expense.isSettled && (
            <button
              type="button"
              disabled={settling === "all"}
              onClick={() => handleSettleParticipant("all")}
              className="cursor-pointer text-xs font-semibold text-[var(--accent-forest)] hover:underline"
            >
              {settling === "all" ? "Settling all..." : "Settle Entire Bill"}
            </button>
          )}
          <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            className="cursor-pointer text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
