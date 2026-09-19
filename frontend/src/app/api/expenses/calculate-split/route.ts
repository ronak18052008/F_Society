import { NextRequest, NextResponse } from "next/server";
import { calculateSplit } from "@/lib/expenses/engine";
import type { SplitCalculationRequest } from "@/types/expenses";

export async function POST(req: NextRequest) {
  try {
    const body: SplitCalculationRequest = await req.json();

    if (body.amount === undefined || body.amount === null) {
      return NextResponse.json(
        { success: false, error: "Missing required 'amount' field." },
        { status: 400 }
      );
    }

    if (typeof body.amount !== "number" || body.amount < 0) {
      return NextResponse.json(
        { success: false, error: "Expense amount must be a non-negative number." },
        { status: 400 }
      );
    }

    if (!body.splitMethod) {
      return NextResponse.json(
        { success: false, error: "Missing required 'splitMethod' field (EQUAL, PERCENTAGE, CUSTOM, USAGE_BASED)." },
        { status: 400 }
      );
    }

    if (!body.participants || !Array.isArray(body.participants) || body.participants.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one participant is required." },
        { status: 400 }
      );
    }

    const result = calculateSplit(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to calculate expense split.",
      },
      { status: 400 }
    );
  }
}
