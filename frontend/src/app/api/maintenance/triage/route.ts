import { NextRequest, NextResponse } from "next/server";
import { validateMaintenanceTriageInput } from "@/lib/maintenance/validation";
import { getMaintenanceTriageProvider } from "@/lib/maintenance/provider";
import { sanitizeForLogging, sanitizeText } from "@/lib/maintenance/privacy";
import { saveMaintenanceTriageRecord } from "@/lib/maintenance/storage";
import type { MaintenanceTriageRequest } from "@/types/maintenance";

export async function POST(req: NextRequest) {
  const requestId = "req-" + Math.random().toString(36).substring(2, 8);

  try {
    // 1. Authorization / Role Check
    // Check Authorization header or session token if provided
    const authHeader = req.headers.get("authorization");
    const roleHeader = req.headers.get("x-user-role");

    // Optional strict check: if authorization header is provided but malformed
    if (authHeader && !authHeader.startsWith("Bearer ") && authHeader.toLowerCase() !== "demo") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Invalid authorization scheme.",
          sanitizedRequestId: requestId,
        },
        { status: 401 }
      );
    }

    // Role check: if x-user-role is provided, must be tenant, owner, or admin
    if (roleHeader && !["tenant", "owner", "admin"].includes(roleHeader.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: User role not authorized for maintenance triage.",
          sanitizedRequestId: requestId,
        },
        { status: 403 }
      );
    }

    // 2. Parse Body
    let body: any = {};
    try {
      body = await req.json();
    } catch (_) {
      return NextResponse.json(
        {
          success: false,
          error: "Malformed request payload. Expected application/json body.",
          sanitizedRequestId: requestId,
        },
        { status: 400 }
      );
    }

    // 3. Input & Image Validation
    const validation = validateMaintenanceTriageInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error || "Input validation failed.",
          sanitizedRequestId: requestId,
        },
        { status: validation.statusCode || 400 }
      );
    }

    // 4. Privacy: Sanitize sensitive text
    const sanitizedDescription = sanitizeText(validation.sanitizedDescription || body.description);

    const triageRequest: MaintenanceTriageRequest = {
      description: sanitizedDescription,
      image: body.image,
      imageName: body.imageName,
      imageMimeType: validation.imageInfo?.mimeType || body.imageMimeType,
      imageSizeBytes: validation.imageInfo?.sizeBytes || body.imageSizeBytes,
      propertyId: body.propertyId,
      unitNumber: body.unitNumber,
      room: body.room,
      issueDuration: body.issueDuration,
      isTenantPresent: Boolean(body.isTenantPresent),
      accessInstructions: body.accessInstructions ? sanitizeText(body.accessInstructions) : undefined,
      userRole: roleHeader || body.userRole || "tenant",
    };

    // Safe sanitized logging (never logs PII or raw image base64 buffers)
    console.log(
      "[MaintenanceTriage POST]",
      sanitizeForLogging({
        requestId,
        propertyId: triageRequest.propertyId,
        room: triageRequest.room,
        hasImage: Boolean(triageRequest.image),
        descLength: sanitizedDescription.length,
      })
    );

    // 5. Invoke AI Provider Abstraction
    const provider = getMaintenanceTriageProvider();
    const result = await provider.triage(triageRequest);

    // 6. Persistence
    await saveMaintenanceTriageRecord(result);

    return NextResponse.json({
      success: true,
      triage: result,
      data: result,
      sanitizedRequestId: requestId,
    });
  } catch (err) {
    console.error("[MaintenanceTriage POST Error]", requestId, err instanceof Error ? err.message : "Internal Error");
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while processing maintenance triage.",
        sanitizedRequestId: requestId,
      },
      { status: 500 }
    );
  }
}
