// lib/expenses/storage.ts
// Feature 5: Smart Roommate Expense Engine - Dual Persistence Layer (Supabase + Local JSON Store)

import fs from "fs";
import path from "path";
import { createClient, isDemoFallbackAllowed } from "@/lib/supabase/client";
import { calculateHouseholdBalances } from "@/lib/expenses/engine";
import type {
  Expense,
  ExpenseParticipant,
  SettlementRecord,
  HouseholdBalances,
} from "@/types/expenses";

const LOCAL_STORE_PATH = path.resolve(process.cwd(), "src/data/roommate-expenses.json");

interface LocalStoreSchema {
  expenses: Expense[];
  settlements: SettlementRecord[];
}

// Initial demo expenses for the active tenancy household (rent-navrang)
const DEFAULT_EXPENSES: Expense[] = [
  {
    id: "exp-demo-1",
    householdId: "rent-navrang",
    title: "High-Speed Fiber Internet Bill",
    description: "Monthly 300 Mbps broadband optical fiber subscription",
    amount: 1499.0,
    category: "INTERNET",
    splitMethod: "EQUAL",
    paidBy: "user-tenant-1",
    paidByName: "A. Shah",
    date: new Date().toISOString().split("T")[0],
    isSettled: false,
    participants: [
      { userId: "user-tenant-1", userName: "A. Shah", shareAmount: 499.68, percentage: 33.33, isPaid: true },
      { userId: "user-tenant-2", userName: "M. Iyer", shareAmount: 499.66, percentage: 33.33, isPaid: false },
      { userId: "user-tenant-3", userName: "R. Kapoor", shareAmount: 499.66, percentage: 33.33, isPaid: false },
    ],
    createdBy: "user-tenant-1",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "exp-demo-2",
    householdId: "rent-navrang",
    title: "Weekly Organic Kitchen Groceries",
    description: "Vegetables, milk, pulses, cooking oil from Nature's Basket",
    amount: 2850.0,
    category: "GROCERIES",
    splitMethod: "EQUAL",
    paidBy: "user-tenant-2",
    paidByName: "M. Iyer",
    date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
    isSettled: false,
    participants: [
      { userId: "user-tenant-1", userName: "A. Shah", shareAmount: 950.0, percentage: 33.33, isPaid: false },
      { userId: "user-tenant-2", userName: "M. Iyer", shareAmount: 950.0, percentage: 33.33, isPaid: true },
      { userId: "user-tenant-3", userName: "R. Kapoor", shareAmount: 950.0, percentage: 33.33, isPaid: false },
    ],
    createdBy: "user-tenant-2",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "exp-demo-3",
    householdId: "rent-navrang",
    title: "Quarterly RO Water Purifier Service & Filter",
    description: "OEM technician filter candle replacement and water TDS calibration",
    amount: 1200.0,
    category: "WATER",
    splitMethod: "EQUAL",
    paidBy: "user-tenant-1",
    paidByName: "A. Shah",
    date: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0],
    isSettled: true,
    participants: [
      { userId: "user-tenant-1", userName: "A. Shah", shareAmount: 400.0, percentage: 33.33, isPaid: true },
      { userId: "user-tenant-2", userName: "M. Iyer", shareAmount: 400.0, percentage: 33.33, isPaid: true },
      { userId: "user-tenant-3", userName: "R. Kapoor", shareAmount: 400.0, percentage: 33.33, isPaid: true },
    ],
    createdBy: "user-tenant-1",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

function readLocalStore(): LocalStoreSchema {
  try {
    if (!fs.existsSync(LOCAL_STORE_PATH)) {
      const initial: LocalStoreSchema = { expenses: DEFAULT_EXPENSES, settlements: [] };
      fs.mkdirSync(path.dirname(LOCAL_STORE_PATH), { recursive: true });
      fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    const raw = fs.readFileSync(LOCAL_STORE_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.warn("[ExpenseStorage] Read local store error, using memory fallback:", err);
    return { expenses: DEFAULT_EXPENSES, settlements: [] };
  }
}

function writeLocalStore(data: LocalStoreSchema): void {
  try {
    fs.mkdirSync(path.dirname(LOCAL_STORE_PATH), { recursive: true });
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.warn("[ExpenseStorage] Write local store error:", err);
  }
}

export async function getExpensesByHousehold(householdId: string): Promise<Expense[]> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { data: expRows, error } = await supabase
        .from("expenses")
        .select("*, expense_participants(*)")
        .eq("household_id", householdId)
        .order("date", { ascending: false });

      if (!error && expRows && expRows.length > 0) {
        return expRows.map((row: any) => ({
          id: row.id,
          householdId: row.household_id,
          title: row.title,
          description: row.description || undefined,
          amount: Number(row.amount),
          category: row.category,
          splitMethod: row.split_method,
          paidBy: row.paid_by,
          date: row.date,
          isSettled: Boolean(row.is_settled),
          metadata: row.metadata || {},
          createdBy: row.created_by,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          participants: (row.expense_participants || []).map((p: any) => ({
            id: p.id,
            expenseId: p.expense_id,
            userId: p.user_id,
            userName: p.user_name || p.user_id,
            shareAmount: Number(p.share_amount),
            percentage: p.percentage ? Number(p.percentage) : undefined,
            usageUnits: p.usage_units ? Number(p.usage_units) : undefined,
            isPaid: Boolean(p.is_paid),
            paidAt: p.paid_at,
          })),
        }));
      }
    } catch (err) {
      console.warn("[ExpenseStorage] Supabase fetch error, using local fallback:", err);
    }
  }

  // Fallback to local store
  const store = readLocalStore();
  return store.expenses.filter((e) => e.householdId === householdId);
}

export async function getExpenseById(expenseId: string): Promise<Expense | null> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*, expense_participants(*)")
        .eq("id", expenseId)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          householdId: data.household_id,
          title: data.title,
          description: data.description || undefined,
          amount: Number(data.amount),
          category: data.category,
          splitMethod: data.split_method,
          paidBy: data.paid_by,
          date: data.date,
          isSettled: Boolean(data.is_settled),
          metadata: data.metadata || {},
          createdBy: data.created_by,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          participants: (data.expense_participants || []).map((p: any) => ({
            id: p.id,
            expenseId: p.expense_id,
            userId: p.user_id,
            userName: p.user_name || p.user_id,
            shareAmount: Number(p.share_amount),
            percentage: p.percentage ? Number(p.percentage) : undefined,
            usageUnits: p.usage_units ? Number(p.usage_units) : undefined,
            isPaid: Boolean(p.is_paid),
            paidAt: p.paid_at,
          })),
        };
      }
    } catch (err) {
      console.warn("[ExpenseStorage] Supabase getExpenseById error:", err);
    }
  }

  const store = readLocalStore();
  return store.expenses.find((e) => e.id === expenseId) || null;
}

export async function createExpense(expense: Expense): Promise<Expense> {
  // 1. Dual-write to Local Store
  const store = readLocalStore();
  const existingIdx = store.expenses.findIndex((e) => e.id === expense.id);
  if (existingIdx >= 0) {
    store.expenses[existingIdx] = expense;
  } else {
    store.expenses.unshift(expense);
  }
  writeLocalStore(store);

  // 2. Dual-write to Supabase if available
  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.from("expenses").upsert({
        id: expense.id,
        household_id: expense.householdId,
        title: expense.title,
        description: expense.description || null,
        amount: expense.amount,
        category: expense.category,
        split_method: expense.splitMethod,
        paid_by: expense.paidBy,
        date: expense.date,
        is_settled: expense.isSettled,
        metadata: expense.metadata || {},
        created_by: expense.createdBy,
        created_at: expense.createdAt,
        updated_at: expense.updatedAt,
      });

      if (expense.participants && expense.participants.length > 0) {
        const participantRows = expense.participants.map((p, i) => ({
          id: p.id || `${expense.id}-part-${i}`,
          expense_id: expense.id,
          user_id: p.userId,
          user_name: p.userName,
          share_amount: p.shareAmount,
          percentage: p.percentage || null,
          usage_units: p.usageUnits || null,
          is_paid: p.isPaid,
          paid_at: p.paidAt || null,
        }));
        await supabase.from("expense_participants").upsert(participantRows);
      }
    } catch (err) {
      console.warn("[ExpenseStorage] Supabase insert error, saved to local store:", err);
    }
  }

  return expense;
}

export async function updateExpense(
  expenseId: string,
  updates: Partial<Expense>
): Promise<Expense | null> {
  const store = readLocalStore();
  const idx = store.expenses.findIndex((e) => e.id === expenseId);
  if (idx < 0) {
    return null;
  }

  const existing = store.expenses[idx];
  const updated: Expense = {
    ...existing,
    ...updates,
    id: existing.id,
    householdId: existing.householdId,
    updatedAt: new Date().toISOString(),
  };

  store.expenses[idx] = updated;
  writeLocalStore(store);

  const supabase = createClient();
  if (supabase) {
    try {
      await supabase
        .from("expenses")
        .update({
          title: updated.title,
          description: updated.description || null,
          amount: updated.amount,
          category: updated.category,
          split_method: updated.splitMethod,
          paid_by: updated.paidBy,
          date: updated.date,
          is_settled: updated.isSettled,
          metadata: updated.metadata || {},
          updated_at: updated.updatedAt,
        })
        .eq("id", expenseId);

      if (updates.participants) {
        await supabase.from("expense_participants").delete().eq("expense_id", expenseId);
        const participantRows = updates.participants.map((p, i) => ({
          id: p.id || `${expenseId}-part-${i}`,
          expense_id: expenseId,
          user_id: p.userId,
          user_name: p.userName,
          share_amount: p.shareAmount,
          percentage: p.percentage || null,
          usage_units: p.usageUnits || null,
          is_paid: p.isPaid,
          paid_at: p.paidAt || null,
        }));
        await supabase.from("expense_participants").insert(participantRows);
      }
    } catch (err) {
      console.warn("[ExpenseStorage] Supabase update error:", err);
    }
  }

  return updated;
}

export async function deleteExpense(expenseId: string): Promise<boolean> {
  const store = readLocalStore();
  const initialLen = store.expenses.length;
  store.expenses = store.expenses.filter((e) => e.id !== expenseId);
  writeLocalStore(store);

  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.from("expenses").delete().eq("id", expenseId);
    } catch (err) {
      console.warn("[ExpenseStorage] Supabase delete error:", err);
    }
  }

  return store.expenses.length < initialLen;
}

export async function settleExpense(
  expenseId: string,
  settlementInput: {
    payerId: string;
    payeeId: string;
    amount: number;
    referenceNote?: string;
    idempotencyKey?: string;
    targetUserId?: string; // If settling a specific participant's share
  }
): Promise<{ success: boolean; settlement?: SettlementRecord; error?: string }> {
  const store = readLocalStore();
  const expense = store.expenses.find((e) => e.id === expenseId);
  if (!expense) {
    return { success: false, error: "Expense not found." };
  }

  // Idempotency check: prevent duplicate settlements
  if (settlementInput.idempotencyKey) {
    const existing = store.settlements.find(
      (s) => s.idempotencyKey === settlementInput.idempotencyKey
    );
    if (existing) {
      return {
        success: true,
        settlement: existing,
        error: "Duplicate settlement detected; returned existing settlement record.",
      };
    }
  }

  const settlementId = "set-" + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();

  const settlement: SettlementRecord = {
    id: settlementId,
    householdId: expense.householdId,
    expenseId,
    payerId: settlementInput.payerId,
    payeeId: settlementInput.payeeId,
    amount: settlementInput.amount,
    status: "completed",
    settledAt: now,
    referenceNote: settlementInput.referenceNote,
    idempotencyKey: settlementInput.idempotencyKey,
    createdAt: now,
  };

  store.settlements.unshift(settlement);

  // Mark participant(s) as paid
  if (settlementInput.targetUserId) {
    const part = expense.participants.find((p) => p.userId === settlementInput.targetUserId);
    if (part) {
      part.isPaid = true;
      part.paidAt = now;
    }
  } else {
    // Settle entire expense
    expense.participants.forEach((p) => {
      p.isPaid = true;
      p.paidAt = now;
    });
  }

  // If all participants are paid, mark expense as settled
  const allPaid = expense.participants.every((p) => p.isPaid);
  if (allPaid) {
    expense.isSettled = true;
  }

  writeLocalStore(store);

  // Sync to Supabase
  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.from("settlements").insert({
        id: settlement.id,
        household_id: settlement.householdId,
        expense_id: settlement.expenseId,
        payer_id: settlement.payerId,
        payee_id: settlement.payeeId,
        amount: settlement.amount,
        status: settlement.status,
        settled_at: settlement.settledAt,
        reference_note: settlement.referenceNote || null,
        idempotency_key: settlement.idempotencyKey || null,
      });

      await supabase
        .from("expenses")
        .update({ is_settled: expense.isSettled, updated_at: now })
        .eq("id", expenseId);
    } catch (err) {
      console.warn("[ExpenseStorage] Supabase settlement sync error:", err);
    }
  }

  return { success: true, settlement };
}

export async function getHouseholdBalancesData(householdId: string): Promise<HouseholdBalances> {
  const expenses = await getExpensesByHousehold(householdId);
  const defaultKnownUsers = [
    { userId: "user-tenant-1", userName: "A. Shah" },
    { userId: "user-tenant-2", userName: "M. Iyer" },
    { userId: "user-tenant-3", userName: "R. Kapoor" },
  ];
  return calculateHouseholdBalances(householdId, expenses, defaultKnownUsers);
}
