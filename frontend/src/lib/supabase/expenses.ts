import { createClient, isDemoFallbackAllowed } from "./client";
import { getProperty as getDemoProperty } from "@/data/demo";
import type { ExpenseLine, DataSource } from "@/types";

interface DatabaseExpenseRow {
  id: string;
  property_id: string;
  label: string;
  amount: number;
  cadence: "monthly" | "one-time" | "deposit";
  source: DataSource;
  note: string | null;
  document_url: string | null;
  created_at: string;
}

function mapRowToExpense(row: DatabaseExpenseRow): ExpenseLine {
  return {
    id: row.id,
    label: row.label,
    amount: Number(row.amount),
    cadence: row.cadence,
    source: row.source,
    note: row.note ?? undefined,
  };
}

export async function getExpensesByPropertyId(propertyId: string): Promise<ExpenseLine[]> {
  const supabase = createClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("property_expenses")
        .select("*")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        return (data as unknown as DatabaseExpenseRow[]).map(mapRowToExpense);
      }
    } catch (err) {
      console.warn("Failed to fetch expenses from Supabase:", err);
    }
  }

  // Only fall back to demo if explicitly allowed
  if (!isDemoFallbackAllowed()) {
    return [];
  }

  const demo = getDemoProperty(propertyId);
  return demo?.expenses || [];
}

export async function addExpenseLine(
  propertyId: string,
  expense: Omit<ExpenseLine, "id">,
): Promise<{ data: ExpenseLine | null; error: string | null }> {
  const supabase = createClient();

  if (!supabase) {
    // Generate local mock expense if offline
    const mockExpense: ExpenseLine = {
      id: `exp-${Date.now()}`,
      ...expense,
    };
    return { data: mockExpense, error: null };
  }

  try {
    const { data, error } = await supabase
      .from("property_expenses")
      .insert({
        property_id: propertyId,
        label: expense.label,
        amount: expense.amount,
        cadence: expense.cadence,
        source: expense.source,
        note: expense.note || null,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return {
      data: mapRowToExpense(data as unknown as DatabaseExpenseRow),
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to add expense line",
    };
  }
}

export async function deleteExpenseLine(
  expenseId: string,
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();

  if (!supabase) {
    return { success: true, error: null };
  }

  try {
    const { error } = await supabase
      .from("property_expenses")
      .delete()
      .eq("id", expenseId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete expense",
    };
  }
}

export async function updateExpenseLine(
  expenseId: string,
  updates: Partial<Omit<ExpenseLine, "id">>,
): Promise<{ data: ExpenseLine | null; error: string | null }> {
  const supabase = createClient();

  if (!supabase) {
    return { data: null, error: "Supabase not configured" };
  }

  try {
    const payload: Record<string, unknown> = {};
    if (updates.label !== undefined) payload.label = updates.label;
    if (updates.amount !== undefined) payload.amount = updates.amount;
    if (updates.cadence !== undefined) payload.cadence = updates.cadence;
    if (updates.source !== undefined) payload.source = updates.source;
    if (updates.note !== undefined) payload.note = updates.note;

    const { data, error } = await supabase
      .from("property_expenses")
      .update(payload)
      .eq("id", expenseId)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return {
      data: mapRowToExpense(data as unknown as DatabaseExpenseRow),
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to update expense",
    };
  }
}

