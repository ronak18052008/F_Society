// types/expenses.ts
// Feature 5: Smart Roommate Expense Engine TypeScript Definitions

export type ExpenseCategory =
  | "RENT"
  | "ELECTRICITY"
  | "WATER"
  | "INTERNET"
  | "MAINTENANCE"
  | "GROCERIES"
  | "UTILITIES"
  | "OTHER";

export type SplitMethod =
  | "EQUAL"
  | "PERCENTAGE"
  | "CUSTOM"
  | "USAGE_BASED";

export interface ExpenseParticipant {
  id?: string;
  expenseId?: string;
  userId: string;
  userName: string;
  shareAmount: number;
  percentage?: number;
  usageUnits?: number;
  isPaid: boolean;
  paidAt?: string | null;
}

export interface Expense {
  id: string;
  householdId: string;
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  splitMethod: SplitMethod;
  paidBy: string;
  paidByName?: string;
  date: string;
  isSettled: boolean;
  participants: ExpenseParticipant[];
  metadata?: {
    unitLabel?: string;
    ratePerUnit?: number;
    calculationNotes?: string;
    [key: string]: any;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettlementRecord {
  id: string;
  householdId: string;
  expenseId?: string;
  payerId: string;
  payerName?: string;
  payeeId: string;
  payeeName?: string;
  amount: number;
  status: "pending" | "completed" | "cancelled";
  settledAt: string;
  referenceNote?: string;
  idempotencyKey?: string;
  createdAt: string;
}

export interface ParticipantBalance {
  userId: string;
  userName: string;
  totalPaid: number;
  totalOwed: number;
  netBalance: number; // positive = owed money, negative = owes money
}

export interface SettlementSuggestion {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
}

export interface HouseholdBalances {
  householdId: string;
  totalExpenses: number;
  monthlyTotal: number;
  settledTotal: number;
  unsettledTotal: number;
  balances: ParticipantBalance[];
  settlementSuggestions: SettlementSuggestion[];
  categoryTotals: Record<ExpenseCategory, number>;
}

export interface SplitCalculationParticipantInput {
  userId: string;
  userName: string;
  percentage?: number;
  customAmount?: number;
  usageUnits?: number;
}

export interface SplitCalculationRequest {
  amount: number;
  splitMethod: SplitMethod;
  participants: SplitCalculationParticipantInput[];
  metadata?: {
    unitLabel?: string;
    ratePerUnit?: number;
  };
}

export interface CalculatedParticipantShare {
  userId: string;
  userName: string;
  shareAmount: number;
  percentage: number;
  usageUnits?: number;
  calculationFormula: string;
}

export interface SplitCalculationResult {
  amount: number;
  splitMethod: SplitMethod;
  shares: CalculatedParticipantShare[];
  roundingResidual: number;
  isBalanced: boolean;
  explanation: string;
}
