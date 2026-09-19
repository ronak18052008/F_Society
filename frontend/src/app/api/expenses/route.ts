import { NextRequest, NextResponse } from "next/server";
import { calculateSplit } from "@/lib/expenses/engine";
import {
  createExpense,
  getExpensesByHousehold,
  getHouseholdBalancesData,
} from "@/lib/expenses/storage";
import type { Expense, ExpenseCategory, SplitMethod } from "@/types/expenses";

const VALID_CATEGORIES: ExpenseCategory[] = [
  "RENT",
  "ELECTRICITY",
  "WATER",
  "INTERNET",
  "MAINTENANCE",
  "GROCERIES",
  "UTILITIES",
  "OTHER",
];

const VALID_SPLIT_METHODS: SplitMethod[] = [
  "EQUAL",
  "PERCENTAGE",
  "CUSTOM",
  "USAGE_BASED",
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const householdId = searchParams.get("householdId") || "rent-navrang";

    const expenses = await getExpensesByHousehold(householdId);
    const balances = await getHouseholdBalancesData(householdId);

    return NextResponse.json({
      success: true,
      householdId,
      expenses,
      balances,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch expenses." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validation
    if (!body.householdId || typeof body.householdId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'householdId'." },
        { status: 400 }
      );
    }

    if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Expense title is required." },
        { status: 400 }
      );
    }

    if (body.amount === undefined || typeof body.amount !== "number" || body.amount < 0) {
      return NextResponse.json(
        { success: false, error: "Expense amount must be a non-negative number." },
        { status: 400 }
      );
    }

    const category = (body.category || "").toUpperCase() as ExpenseCategory;
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid category '${body.category}'. Allowed: ${VALID_CATEGORIES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const splitMethod = (body.splitMethod || "").toUpperCase() as SplitMethod;
    if (!VALID_SPLIT_METHODS.includes(splitMethod)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid splitMethod '${body.splitMethod}'. Allowed: ${VALID_SPLIT_METHODS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!body.paidBy || typeof body.paidBy !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing 'paidBy' participant ID." },
        { status: 400 }
      );
    }

    if (!body.participants || !Array.isArray(body.participants) || body.participants.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one participant is required." },
        { status: 400 }
      );
    }

    // 2. Calculate Shares via Split Engine
    const splitResult = calculateSplit({
      amount: body.amount,
      splitMethod,
      participants: body.participants,
      metadata: body.metadata,
    });

    // 3. Assemble Expense
    const expenseId = "exp-" + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    const newExpense: Expense = {
      id: expenseId,
      householdId: body.householdId,
      title: body.title.trim(),
      description: body.description?.trim() || undefined,
      amount: body.amount,
      category,
      splitMethod,
      paidBy: body.paidBy,
      paidByName: body.paidByName,
      date: body.date || now.split("T")[0],
      isSettled: false,
      participants: splitResult.shares.map((share) => {
        const origPart = body.participants.find((p: any) => p.userId === share.userId);
        return {
          id: `${expenseId}-p-${share.userId}`,
          expenseId,
          userId: share.userId,
          userName: share.userName,
          shareAmount: share.shareAmount,
          percentage: share.percentage,
          usageUnits: share.usageUnits,
          isPaid: share.userId === body.paidBy ? true : Boolean(origPart?.isPaid),
          paidAt: share.userId === body.paidBy ? now : origPart?.isPaid ? now : null,
        };
      }),
      metadata: {
        ...body.metadata,
        calculationExplanation: splitResult.explanation,
      },
      createdBy: body.createdBy || body.paidBy,
      createdAt: now,
      updatedAt: now,
    };

    // 4. Save
    const saved = await createExpense(newExpense);
    const balances = await getHouseholdBalancesData(body.householdId);

    return NextResponse.json(
      {
        success: true,
        data: saved,
        balances,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create expense." },
      { status: 400 }
    );
  }
}
