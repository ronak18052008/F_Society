import { NextRequest, NextResponse } from "next/server";
import {
  getExpenseById,
  getExpensesByHousehold,
  getHouseholdBalancesData,
  updateExpense,
  deleteExpense,
} from "@/lib/expenses/storage";
import { calculateSplit } from "@/lib/expenses/engine";
import type { ExpenseCategory, SplitMethod } from "@/types/expenses";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (id.startsWith("exp-")) {
      const expense = await getExpenseById(id);
      if (expense) {
        return NextResponse.json({ success: true, data: expense });
      }
    }

    const expenses = await getExpensesByHousehold(id);
    const balances = await getHouseholdBalancesData(id);

    return NextResponse.json({
      success: true,
      householdId: id,
      expenses,
      balances,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch expense/household data." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await getExpenseById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Expense with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    const body = await req.json();

    let updatedParticipants = existing.participants;
    if (body.amount !== undefined || body.splitMethod || body.participants) {
      const amount = body.amount !== undefined ? body.amount : existing.amount;
      if (typeof amount !== "number" || amount < 0) {
        return NextResponse.json(
          { success: false, error: "Expense amount must be a non-negative number." },
          { status: 400 }
        );
      }

      const splitMethod: SplitMethod = (body.splitMethod || existing.splitMethod).toUpperCase();
      const participantsInput = body.participants || existing.participants;

      const splitResult = calculateSplit({
        amount,
        splitMethod,
        participants: participantsInput,
        metadata: body.metadata || existing.metadata,
      });

      const now = new Date().toISOString();
      const payerId = body.paidBy || existing.paidBy;

      updatedParticipants = splitResult.shares.map((share) => {
        const prev = existing.participants.find((p) => p.userId === share.userId);
        return {
          id: prev?.id || `${id}-p-${share.userId}`,
          expenseId: id,
          userId: share.userId,
          userName: share.userName,
          shareAmount: share.shareAmount,
          percentage: share.percentage,
          usageUnits: share.usageUnits,
          isPaid: share.userId === payerId ? true : prev?.isPaid || false,
          paidAt: share.userId === payerId ? now : prev?.paidAt || null,
        };
      });
    }

    const updated = await updateExpense(id, {
      title: body.title ? body.title.trim() : existing.title,
      description: body.description !== undefined ? body.description.trim() : existing.description,
      amount: body.amount !== undefined ? body.amount : existing.amount,
      category: body.category ? (body.category.toUpperCase() as ExpenseCategory) : existing.category,
      splitMethod: body.splitMethod ? (body.splitMethod.toUpperCase() as SplitMethod) : existing.splitMethod,
      paidBy: body.paidBy || existing.paidBy,
      paidByName: body.paidByName || existing.paidByName,
      date: body.date || existing.date,
      isSettled: body.isSettled !== undefined ? Boolean(body.isSettled) : existing.isSettled,
      participants: updatedParticipants,
      metadata: {
        ...existing.metadata,
        ...body.metadata,
      },
    });

    const balances = await getHouseholdBalancesData(existing.householdId);

    return NextResponse.json({
      success: true,
      data: updated,
      balances,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update expense." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await getExpenseById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Expense with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    const deleted = await deleteExpense(id);
    const balances = await getHouseholdBalancesData(existing.householdId);

    return NextResponse.json({
      success: deleted,
      deletedId: id,
      balances,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete expense." },
      { status: 500 }
    );
  }
}
