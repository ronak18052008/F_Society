import { NextRequest, NextResponse } from "next/server";
import { getOrComputeRiskAnalysis, saveRiskAnalysisRecord, getPropertyWithDemoFallback } from "@/lib/risk/storage";
import { evaluateRentalRisk } from "@/lib/risk/engine";

export async function POST(
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

    // Optional body overrides (e.g. simulated re-evaluation)
    let body: any = {};
    try {
      body = await req.json();
    } catch (_) {}

    const existingProperty = await getPropertyWithDemoFallback(propertyId.trim());
    const propertyData = body.property || body.customOverrides;

    if (!existingProperty && !propertyData) {
      return NextResponse.json(
        { success: false, error: `Property '${propertyId}' was not found to analyze` },
        { status: 404 }
      );
    }

    const targetProperty = propertyData
      ? { ...(existingProperty || {}), ...propertyData, id: propertyId }
      : existingProperty!;

    const analysis = evaluateRentalRisk(targetProperty);
    await saveRiskAnalysisRecord(analysis);

    return NextResponse.json({
      success: true,
      analysis,
      reanalyzedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Rental Risk API POST analyze] Error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during risk re-analysis" },
      { status: 500 }
    );
  }
}
