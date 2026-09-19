import { NextRequest, NextResponse } from "next/server";
import { settleExpense, getExpenseById, getHouseholdBalancesData } from "@/lib/expenses/storage";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const expense = await getExpenseById(id);
    if (!expense) {
      return NextResponse.json(
        { success: false, error: `Expense '${id}' not found.` },
        { status: 404 }
      );
    }

    if (!body.payerId || !body.payeeId) {
      return NextResponse.json(
        { success: false, error: "Missing required 'payerId' or 'payeeId'." },
        { status: 400 }
      );
    }

    const amount = Number(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Settlement amount must be greater than zero." },
        { status: 400 }
      );
    }

    const result = await settleExpense(id, {
      payerId: body.payerId,
      payeeId: body.payeeId,
      amount,
      referenceNote: body.referenceNote,
      idempotencyKey: body.idempotencyKey,
      targetUserId: body.targetUserId,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to process settlement." },
        { status: 400 }
      );
    }

    const updatedExpense = await getExpenseById(id);
    const balances = await getHouseholdBalancesData(expense.householdId);

    return NextResponse.json({
      success: true,
      settlement: result.settlement,
      expense: updatedExpense,
      balances,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to settle expense." },
      { status: 500 }
    );
  }
}
