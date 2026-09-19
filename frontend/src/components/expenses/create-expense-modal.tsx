"use client";

import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { calculateSplit } from "@/lib/expenses/engine";
import type {
  Expense,
  ExpenseCategory,
  SplitMethod,
  SplitCalculationParticipantInput,
} from "@/types/expenses";

interface CreateExpenseModalProps {
  open: boolean;
  onClose: () => void;
  householdId: string;
  roommates: { id: string; name: string }[];
  currentUserId: string;
  onExpenseCreated: (expense: Expense) => void;
}

const CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: "RENT", label: "Rent", icon: "🏠" },
  { value: "ELECTRICITY", label: "Electricity", icon: "⚡" },
  { value: "WATER", label: "Water", icon: "💧" },
  { value: "INTERNET", label: "Internet / Wi-Fi", icon: "🌐" },
  { value: "MAINTENANCE", label: "Maintenance", icon: "🛠️" },
  { value: "GROCERIES", label: "Groceries", icon: "🛒" },
  { value: "UTILITIES", label: "Utilities", icon: "💡" },
  { value: "OTHER", label: "Other", icon: "📦" },
];

const SPLIT_METHODS: { value: SplitMethod; label: string; desc: string }[] = [
  { value: "EQUAL", label: "Equal", desc: "Divide equally with exact paise rounding" },
  { value: "PERCENTAGE", label: "Percentage", desc: "Custom percentage totaling 100%" },
  { value: "CUSTOM", label: "Custom Amount", desc: "Specify exact amounts per person" },
  { value: "USAGE_BASED", label: "Usage Based", desc: "Proportional by units consumed (kWh, days, etc.)" },
];

export function CreateExpenseModal({
  open,
  onClose,
  householdId,
  roommates,
  currentUserId,
  onExpenseCreated,
}: CreateExpenseModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("GROCERIES");
  const [splitMethod, setSplitMethod] = useState<SplitMethod>("EQUAL");
  const [paidBy, setPaidBy] = useState(currentUserId || roommates[0]?.id || "user-tenant-1");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Split-specific state
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [usageUnits, setUsageUnits] = useState<Record<string, string>>({});
  const [unitLabel, setUnitLabel] = useState("kWh");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = Number(amountStr) || 0;

  // Real-time calculation preview
  const preview = useMemo(() => {
    if (amount <= 0 || roommates.length === 0) return null;

    try {
      const participants: SplitCalculationParticipantInput[] = roommates.map((r) => {
        if (splitMethod === "PERCENTAGE") {
          const defaultPct = Math.round((100 / roommates.length) * 100) / 100;
          return {
            userId: r.id,
            userName: r.name,
            percentage: percentages[r.id] !== undefined ? Number(percentages[r.id]) : defaultPct,
          };
        }
        if (splitMethod === "CUSTOM") {
          const defaultVal = Math.round((amount / roommates.length) * 100) / 100;
          return {
            userId: r.id,
            userName: r.name,
            customAmount: customAmounts[r.id] !== undefined ? Number(customAmounts[r.id]) : defaultVal,
          };
        }
        if (splitMethod === "USAGE_BASED") {
          return {
            userId: r.id,
            userName: r.name,
            usageUnits: usageUnits[r.id] !== undefined ? Number(usageUnits[r.id]) : 10,
          };
        }
        return {
          userId: r.id,
          userName: r.name,
        };
      });

      return calculateSplit({
        amount,
        splitMethod,
        participants,
        metadata: { unitLabel },
      });
    } catch {
      return null;
    }
  }, [amount, splitMethod, roommates, percentages, customAmounts, usageUnits, unitLabel]);

  // Validation checks for inputs
  const percentageSum = useMemo(() => {
    return roommates.reduce((sum, r) => {
      const defaultPct = Math.round((100 / roommates.length) * 100) / 100;
      const val = percentages[r.id] !== undefined ? Number(percentages[r.id]) : defaultPct;
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [roommates, percentages]);

  const customSum = useMemo(() => {
    return roommates.reduce((sum, r) => {
      const defaultVal = Math.round((amount / roommates.length) * 100) / 100;
      const val = customAmounts[r.id] !== undefined ? Number(customAmounts[r.id]) : defaultVal;
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [roommates, customAmounts, amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter an expense title.");
      return;
    }

    if (amount <= 0) {
      setError("Please enter a valid expense amount greater than 0.");
      return;
    }

    if (splitMethod === "PERCENTAGE" && Math.abs(percentageSum - 100.0) > 0.05) {
      setError(`Percentages must sum to 100.00% (currently ${percentageSum.toFixed(1)}%).`);
      return;
    }

    if (splitMethod === "CUSTOM" && Math.abs(customSum - amount) > 0.05) {
      setError(`Custom amounts must sum to exactly ₹${amount.toFixed(2)} (currently ₹${customSum.toFixed(2)}).`);
      return;
    }

    setSubmitting(true);

    try {
      const participants = roommates.map((r) => {
        const defaultPct = Math.round((100 / roommates.length) * 100) / 100;
        const defaultVal = Math.round((amount / roommates.length) * 100) / 100;

        return {
          userId: r.id,
          userName: r.name,
          percentage: splitMethod === "PERCENTAGE"
            ? (percentages[r.id] !== undefined ? Number(percentages[r.id]) : defaultPct)
            : undefined,
          customAmount: splitMethod === "CUSTOM"
            ? (customAmounts[r.id] !== undefined ? Number(customAmounts[r.id]) : defaultVal)
            : undefined,
          usageUnits: splitMethod === "USAGE_BASED"
            ? (usageUnits[r.id] !== undefined ? Number(usageUnits[r.id]) : 10)
            : undefined,
        };
      });

      const payerObj = roommates.find((r) => r.id === paidBy);

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          householdId,
          title: title.trim(),
          description: description.trim() || undefined,
          amount,
          category,
          splitMethod,
          paidBy,
          paidByName: payerObj?.name || paidBy,
          date,
          participants,
          metadata: { unitLabel },
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create expense.");
      }

      onExpenseCreated(json.data);
      onClose();
      setTitle("");
      setDescription("");
      setAmountStr("");
      setCategory("GROCERIES");
      setSplitMethod("EQUAL");
    } catch (err: any) {
      setError(err.message || "Failed to create expense.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Household Expense">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[82vh] overflow-y-auto pr-1 text-xs">
        {error && (
          <div className="rounded-xl border border-rose-400 bg-rose-50 dark:bg-rose-950/30 p-3 text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Expense Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. WiFi Bill, Weekly Groceries, Gas Refill"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs text-ink focus:border-[#7ca982] focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Total Amount (₹) *
            </label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs font-mono font-bold text-ink focus:border-[#7ca982] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs text-ink focus:border-[#7ca982] focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Paid By
            </label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs text-ink focus:border-[#7ca982] focus:outline-none"
            >
              {roommates.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.id === currentUserId ? "(You)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs text-ink focus:border-[#7ca982] focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-line">
          <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            Split Method
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SPLIT_METHODS.map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => setSplitMethod(method.value)}
                className={`rounded-xl border p-2.5 text-left transition-all ${
                  splitMethod === method.value
                    ? "border-[#7ca982] bg-[#7ca982]/10 text-ink shadow-xs"
                    : "border-line bg-card text-ink-muted hover:border-line/80"
                }`}
              >
                <div className="font-bold text-xs">{method.label}</div>
                <div className="text-[10px] opacity-75 mt-0.5 line-clamp-1">{method.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {splitMethod === "PERCENTAGE" && (
          <div className="rounded-xl border border-line bg-black/5 dark:bg-white/5 p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="text-ink-muted">Roommate Percentages</span>
              <span className={Math.abs(percentageSum - 100) < 0.05 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                Total: {percentageSum.toFixed(1)}% / 100%
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {roommates.map((r) => {
                const defaultPct = (100 / roommates.length).toFixed(1);
                return (
                  <div key={r.id} className="space-y-1">
                    <span className="text-[10px] text-ink-muted block truncate">{r.name}</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder={defaultPct}
                        value={percentages[r.id] !== undefined ? percentages[r.id] : defaultPct}
                        onChange={(e) =>
                          setPercentages({ ...percentages, [r.id]: e.target.value })
                        }
                        className="w-full rounded-lg border border-line bg-paper px-2 py-1 text-xs font-mono text-ink"
                      />
                      <span className="text-xs text-ink-muted">%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {splitMethod === "CUSTOM" && (
          <div className="rounded-xl border border-line bg-black/5 dark:bg-white/5 p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="text-ink-muted">Exact Custom Shares</span>
              <span className={Math.abs(customSum - amount) < 0.05 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                Sum: ₹{customSum.toFixed(2)} / ₹{amount.toFixed(2)}
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {roommates.map((r) => {
                const defaultAmt = (amount / roommates.length).toFixed(2);
                return (
                  <div key={r.id} className="space-y-1">
                    <span className="text-[10px] text-ink-muted block truncate">{r.name}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-ink-muted">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={defaultAmt}
                        value={customAmounts[r.id] !== undefined ? customAmounts[r.id] : defaultAmt}
                        onChange={(e) =>
                          setCustomAmounts({ ...customAmounts, [r.id]: e.target.value })
                        }
                        className="w-full rounded-lg border border-line bg-paper px-2 py-1 text-xs font-mono text-ink"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {splitMethod === "USAGE_BASED" && (
          <div className="rounded-xl border border-line bg-black/5 dark:bg-white/5 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink-muted">Consumption Metric</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-ink-muted">Unit label:</span>
                <input
                  type="text"
                  value={unitLabel}
                  onChange={(e) => setUnitLabel(e.target.value)}
                  className="w-20 rounded border border-line bg-paper px-1.5 py-0.5 text-xs text-ink"
                  placeholder="e.g. kWh, L"
                />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {roommates.map((r) => (
                <div key={r.id} className="space-y-1">
                  <span className="text-[10px] text-ink-muted block truncate">{r.name}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="10"
                      value={usageUnits[r.id] !== undefined ? usageUnits[r.id] : "10"}
                      onChange={(e) =>
                        setUsageUnits({ ...usageUnits, [r.id]: e.target.value })
                      }
                      className="w-full rounded-lg border border-line bg-paper px-2 py-1 text-xs font-mono text-ink"
                    />
                    <span className="text-xs text-ink-muted">{unitLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {preview && (
          <div className="rounded-xl border border-[#7ca982]/30 bg-[#7ca982]/10 p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#1d3122] dark:text-[#a3caa6]">
              <span>Transparent Split Breakdown</span>
              <span className="font-mono">Sum: ₹{preview.shares.reduce((s, i) => s + i.shareAmount, 0).toFixed(2)}</span>
            </div>
            <div className="space-y-1">
              {preview.shares.map((share) => (
                <div key={share.userId} className="flex items-center justify-between text-xs text-ink">
                  <span className="font-medium">{share.userName}</span>
                  <div className="text-right font-mono">
                    <strong>₹{share.shareAmount.toFixed(2)}</strong>
                    <span className="text-[10px] text-ink-muted ml-1.5">({share.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-ink-muted pt-1 border-t border-[#7ca982]/20 leading-tight">
              {preview.explanation}
            </p>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            Optional Notes / Bill Reference
          </label>
          <input
            type="text"
            placeholder="e.g. Electricity meter reading: 4520–4820"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs text-ink focus:border-[#7ca982] focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={submitting || amount <= 0 || !title.trim()}
            className="bg-[#7ca982] hover:bg-[#6b9a71] text-white"
          >
            {submitting ? "Splitting..." : "Save & Split Expense"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
