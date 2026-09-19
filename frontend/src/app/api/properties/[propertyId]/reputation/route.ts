// API Route: GET /api/properties/:propertyId/reputation
// NESTORA Feature 6: Property Reputation Graph Retrieval

import { NextRequest, NextResponse } from "next/server";
import { getOrComputeReputationGraph } from "@/lib/reputation/storage";

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

    const { graph, property } = await getOrComputeReputationGraph(propertyId.trim());

    if (!property || !graph) {
      return NextResponse.json(
        { success: false, error: `Property '${propertyId}' was not found in the verified registry` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: graph,
      // Alias convenience fields directly matching requirements
      entities: graph.nodes,
      relationships: graph.relationships,
      confidence: graph.overallConfidence,
      confidenceScore: graph.confidenceScore,
      dataSources: {
        verifiedCount: graph.telemetry.verifiedDataCount,
        userGeneratedCount: graph.telemetry.userGeneratedCount,
        aiDerivedCount: graph.telemetry.aiDerivedCount,
      },
      traceableSignals: graph.signals,
      hasInsufficientData: graph.hasInsufficientData,
      insufficientDataEntities: graph.insufficientDataEntities,
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
    console.error("[Property Reputation API GET] Error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while generating property reputation graph" },
      { status: 500 }
    );
  }
}
