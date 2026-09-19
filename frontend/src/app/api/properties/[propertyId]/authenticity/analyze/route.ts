import { NextRequest, NextResponse } from "next/server";
import {
  getOrComputeAuthenticityAnalysis,
  saveAuthenticityAnalysisRecord,
  getPropertyWithFallback,
  getAllPropertiesForCrossCheck,
} from "@/lib/authenticity/storage";
import { evaluatePropertyAuthenticity } from "@/lib/authenticity/engine";

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

    let body: any = {};
    try {
      body = await req.json();
    } catch (_) {}

    const existingProperty = await getPropertyWithFallback(propertyId.trim());
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

    const allProps = await getAllPropertiesForCrossCheck();
    const analysis = evaluatePropertyAuthenticity(targetProperty, allProps);
    await saveAuthenticityAnalysisRecord(analysis);

    return NextResponse.json({
      success: true,
      analysis,
      reanalyzedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Authenticity API POST analyze] Error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during authenticity re-analysis" },
      { status: 500 }
    );
  }
}
