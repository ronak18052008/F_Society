import { NextRequest, NextResponse } from "next/server";
import { getOrComputeRiskAnalysis } from "@/lib/risk/storage";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await context.params;

    if (!propertyId || typeof propertyId !== "string" || propertyId.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing propertyId parameter" },
        { status: 400 }
      );
    }

    const { analysis, property } = await getOrComputeRiskAnalysis(propertyId.trim());

    if (!property || !analysis) {
      return NextResponse.json(
        { success: false, error: `Property '${propertyId}' was not found in the verified registry` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis,
      property: {
        id: property.id,
        title: property.title,
        city: property.city,
        locality: property.locality,
        rent: property.rent,
        deposit: property.deposit,
        verification: property.verification,
      },
    });
  } catch (err) {
    console.error("[Rental Risk API GET] Error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while computing rental risk telemetry" },
      { status: 500 }
    );
  }
}
