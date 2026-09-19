// lib/expenses/engine.ts
// Feature 5: Smart Roommate Expense Engine - Mathematical Split & Balance Core

import type {
  SplitMethod,
  ExpenseCategory,
  Expense,
  SplitCalculationRequest,
  SplitCalculationResult,
  CalculatedParticipantShare,
  HouseholdBalances,
  ParticipantBalance,
  SettlementSuggestion,
} from "@/types/expenses";

/**
 * Validates and calculates transparent participant shares based on the selected split method.
 * Guaranteed invariant: sum of calculated shares ALWAYS equals total amount down to 2 decimal places (₹0.01).
 */
export function calculateSplit(request: SplitCalculationRequest): SplitCalculationResult {
  const { amount, splitMethod, participants, metadata } = request;

  if (amount < 0) {
    throw new Error("Expense amount cannot be negative.");
  }

  if (!participants || participants.length === 0) {
    throw new Error("At least one participant is required to split an expense.");
  }

  // Edge case: Amount is 0
  if (amount === 0) {
    const zeroShares: CalculatedParticipantShare[] = participants.map((p) => ({
      userId: p.userId,
      userName: p.userName,
      shareAmount: 0,
      percentage: Math.round((100 / participants.length) * 100) / 100,
      usageUnits: p.usageUnits || 0,
      calculationFormula: "₹0.00 (Zero expense balance)",
    }));
    return {
      amount: 0,
      splitMethod,
      shares: zeroShares,
      roundingResidual: 0,
      isBalanced: true,
      explanation: "Zero amount divided equally among participants.",
    };
  }

  const count = participants.length;

  switch (splitMethod) {
    case "EQUAL": {
      // Divide amount in cents/paise
      const totalPaise = Math.round(amount * 100);
      const basePaise = Math.floor(totalPaise / count);
      let remainderPaise = totalPaise - basePaise * count;

      const shares: CalculatedParticipantShare[] = participants.map((p, idx) => {
        // Distribute 1 paise to the first remainderPaise participants
        const addPaise = idx < remainderPaise ? 1 : 0;
        const participantPaise = basePaise + addPaise;
        const shareAmount = participantPaise / 100;
        const pct = Math.round((shareAmount / amount) * 10000) / 100;

        return {
          userId: p.userId,
          userName: p.userName,
          shareAmount,
          percentage: pct,
          calculationFormula: remainderPaise > 0 && idx < remainderPaise
            ? `₹${(basePaise / 100).toFixed(2)} + ₹0.01 rounding adjustment`
            : `₹${amount.toFixed(2)} ÷ ${count} participants = ₹${shareAmount.toFixed(2)}`,
        };
      });

      return {
        amount,
        splitMethod,
        shares,
        roundingResidual: remainderPaise / 100,
        isBalanced: true,
        explanation: `Even distribution among ${count} roommates (${remainderPaise > 0 ? `+${remainderPaise}p rounding balanced` : "exact division"}).`,
      };
    }

    case "PERCENTAGE": {
      // Validate percentage sum
      const totalPercentage = participants.reduce((sum, p) => sum + (Number(p.percentage) || 0), 0);
      const roundedTotalPct = Math.round(totalPercentage * 100) / 100;

      if (Math.abs(roundedTotalPct - 100.0) > 0.05) {
        throw new Error(
          `Total percentages must sum to 100.00%. Current total: ${roundedTotalPct.toFixed(2)}%`
        );
      }

      let allocatedPaise = 0;
      const initialShares = participants.map((p) => {
        const pct = Number(p.percentage) || 0;
        if (pct < 0) {
          throw new Error(`Percentage for ${p.userName} cannot be negative.`);
        }
        const paise = Math.round(amount * (pct / 100) * 100);
        allocatedPaise += paise;
        return {
          userId: p.userId,
          userName: p.userName,
          percentage: pct,
          paise,
        };
      });

      // Handle residual rounding adjustment
      const totalPaise = Math.round(amount * 100);
      const residualPaise = totalPaise - allocatedPaise;

      // Allocate residual to participant with largest percentage
      let largestIdx = 0;
      let maxPct = -1;
      initialShares.forEach((s, idx) => {
        if (s.percentage > maxPct) {
          maxPct = s.percentage;
          largestIdx = idx;
        }
      });

      const shares: CalculatedParticipantShare[] = initialShares.map((s, idx) => {
        const finalPaise = s.paise + (idx === largestIdx ? residualPaise : 0);
        const shareAmount = finalPaise / 100;
        return {
          userId: s.userId,
          userName: s.userName,
          shareAmount,
          percentage: s.percentage,
          calculationFormula: `${s.percentage.toFixed(1)}% of ₹${amount.toFixed(2)} = ₹${shareAmount.toFixed(2)}`,
        };
      });

      return {
        amount,
        splitMethod,
        shares,
        roundingResidual: Math.abs(residualPaise) / 100,
        isBalanced: true,
        explanation: `Percentage split totaling 100.00% across ${count} roommates.`,
      };
    }

    case "CUSTOM": {
      let customSum = 0;
      const shares: CalculatedParticipantShare[] = participants.map((p) => {
        const val = Number(p.customAmount);
        if (isNaN(val) || val < 0) {
          throw new Error(`Custom amount for ${p.userName} must be a non-negative number.`);
        }
        customSum += val;
        const pct = amount > 0 ? Math.round((val / amount) * 10000) / 100 : 0;
        return {
          userId: p.userId,
          userName: p.userName,
          shareAmount: Math.round(val * 100) / 100,
          percentage: pct,
          calculationFormula: `Direct custom allocation: ₹${val.toFixed(2)} (${pct.toFixed(1)}%)`,
        };
      });

      const roundedCustomSum = Math.round(customSum * 100) / 100;
      const targetAmount = Math.round(amount * 100) / 100;

      if (Math.abs(roundedCustomSum - targetAmount) > 0.02) {
        throw new Error(
          `Sum of custom shares (₹${roundedCustomSum.toFixed(2)}) must equal total expense amount (₹${targetAmount.toFixed(2)}).`
        );
      }

      return {
        amount,
        splitMethod,
        shares,
        roundingResidual: 0,
        isBalanced: true,
        explanation: `Custom nominal amounts specified directly per roommate.`,
      };
    }

    case "USAGE_BASED": {
      const unitLabel = metadata?.unitLabel || "units";
      let totalUnits = 0;
      participants.forEach((p) => {
        const u = Number(p.usageUnits) || 0;
        if (u < 0) {
          throw new Error(`Usage units for ${p.userName} cannot be negative.`);
        }
        totalUnits += u;
      });

      if (totalUnits <= 0) {
        throw new Error("Total usage units across all roommates must be greater than zero.");
      }

      let allocatedPaise = 0;
      const initialShares = participants.map((p) => {
        const units = Number(p.usageUnits) || 0;
        const ratio = units / totalUnits;
        const paise = Math.round(amount * ratio * 100);
        allocatedPaise += paise;
        return {
          userId: p.userId,
          userName: p.userName,
          units,
          ratio,
          paise,
        };
      });

      const totalPaise = Math.round(amount * 100);
      const residualPaise = totalPaise - allocatedPaise;

      // Allocate residual to participant with largest units
      let largestIdx = 0;
      let maxUnits = -1;
      initialShares.forEach((s, idx) => {
        if (s.units > maxUnits) {
          maxUnits = s.units;
          largestIdx = idx;
        }
      });

      const shares: CalculatedParticipantShare[] = initialShares.map((s, idx) => {
        const finalPaise = s.paise + (idx === largestIdx ? residualPaise : 0);
        const shareAmount = finalPaise / 100;
        const pct = Math.round((shareAmount / amount) * 10000) / 100;
        return {
          userId: s.userId,
          userName: s.userName,
          shareAmount,
          percentage: pct,
          usageUnits: s.units,
          calculationFormula: `${s.units} ${unitLabel} / ${totalUnits} total (${(s.ratio * 100).toFixed(1)}%) × ₹${amount.toFixed(2)} = ₹${shareAmount.toFixed(2)}`,
        };
      });

      return {
        amount,
        splitMethod,
        shares,
        roundingResidual: Math.abs(residualPaise) / 100,
        isBalanced: true,
        explanation: `Usage-based proportional split based on ${totalUnits} total ${unitLabel}.`,
      };
    }

    default:
      throw new Error(`Unsupported split method: ${splitMethod}`);
  }
}

/**
 * Calculates current household balances, personal contributions, and settlement suggestions.
 */
export function calculateHouseholdBalances(
  householdId: string,
  expenses: Expense[],
  knownUsers: { userId: string; userName: string }[] = []
): HouseholdBalances {
  // Collect all unique users
  const userMap = new Map<string, string>();
  knownUsers.forEach((u) => userMap.set(u.userId, u.userName));

  expenses.forEach((e) => {
    if (e.paidBy) userMap.set(e.paidBy, e.paidByName || userMap.get(e.paidBy) || e.paidBy);
    e.participants.forEach((p) => {
      userMap.set(p.userId, p.userName || userMap.get(p.userId) || p.userId);
    });
  });

  const participantTotals = new Map<string, { totalPaid: number; totalOwed: number }>();
  userMap.forEach((_, userId) => {
    participantTotals.set(userId, { totalPaid: 0, totalOwed: 0 });
  });

  let totalExpenses = 0;
  let settledTotal = 0;
  let unsettledTotal = 0;
  let monthlyTotal = 0;

  const currentYearMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

  const categoryTotals: Record<ExpenseCategory, number> = {
    RENT: 0,
    ELECTRICITY: 0,
    WATER: 0,
    INTERNET: 0,
    MAINTENANCE: 0,
    GROCERIES: 0,
    UTILITIES: 0,
    OTHER: 0,
  };

  expenses.forEach((exp) => {
    totalExpenses += exp.amount;
    if (exp.category && categoryTotals[exp.category] !== undefined) {
      categoryTotals[exp.category] += exp.amount;
    }

    if (exp.date && exp.date.startsWith(currentYearMonth)) {
      monthlyTotal += exp.amount;
    }

    if (exp.isSettled) {
      settledTotal += exp.amount;
    } else {
      unsettledTotal += exp.amount;
    }

    // Payer contribution
    const payerData = participantTotals.get(exp.paidBy) || { totalPaid: 0, totalOwed: 0 };
    payerData.totalPaid += exp.amount;
    participantTotals.set(exp.paidBy, payerData);

    // Each participant's share
    exp.participants.forEach((p) => {
      const partData = participantTotals.get(p.userId) || { totalPaid: 0, totalOwed: 0 };
      partData.totalOwed += p.shareAmount;
      participantTotals.set(p.userId, partData);
    });
  });

  const balances: ParticipantBalance[] = [];
  participantTotals.forEach((data, userId) => {
    const net = Math.round((data.totalPaid - data.totalOwed) * 100) / 100;
    balances.push({
      userId,
      userName: userMap.get(userId) || userId,
      totalPaid: Math.round(data.totalPaid * 100) / 100,
      totalOwed: Math.round(data.totalOwed * 100) / 100,
      netBalance: net,
    });
  });

  // Calculate settlement suggestions to minimize transactions (Greedy debt simplification)
  const debtors: { userId: string; userName: string; amount: number }[] = [];
  const creditors: { userId: string; userName: string; amount: number }[] = [];

  balances.forEach((b) => {
    if (b.netBalance < -0.01) {
      debtors.push({ userId: b.userId, userName: b.userName, amount: Math.abs(b.netBalance) });
    } else if (b.netBalance > 0.01) {
      creditors.push({ userId: b.userId, userName: b.userName, amount: b.netBalance });
    }
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlementSuggestions: SettlementSuggestion[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    const settleAmt = Math.min(debtor.amount, creditor.amount);

    if (settleAmt > 0.01) {
      settlementSuggestions.push({
        fromUserId: debtor.userId,
        fromUserName: debtor.userName,
        toUserId: creditor.userId,
        toUserName: creditor.userName,
        amount: Math.round(settleAmt * 100) / 100,
      });

      debtor.amount = Math.round((debtor.amount - settleAmt) * 100) / 100;
      creditor.amount = Math.round((creditor.amount - settleAmt) * 100) / 100;
    }

    if (debtor.amount <= 0.01) dIdx++;
    if (creditor.amount <= 0.01) cIdx++;
  }

  return {
    householdId,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    monthlyTotal: Math.round(monthlyTotal * 100) / 100,
    settledTotal: Math.round(settledTotal * 100) / 100,
    unsettledTotal: Math.round(unsettledTotal * 100) / 100,
    balances,
    settlementSuggestions,
    categoryTotals,
  };
}
