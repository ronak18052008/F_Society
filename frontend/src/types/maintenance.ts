// types/maintenance.ts
// Feature 4: AI Maintenance Triage Types

export type MaintenanceCategory =
  | "ELECTRICAL"
  | "PLUMBING"
  | "HVAC"
  | "APPLIANCE"
  | "STRUCTURAL"
  | "INTERNET"
  | "SECURITY"
  | "OTHER";

export type MaintenanceSeverity = "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";

export type MaintenanceUrgency = "IMMEDIATE" | "SAME_DAY" | "NEXT_DAY" | "STANDARD" | "SCHEDULED";

export type MaintenanceConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface MaintenanceTriageRequest {
  description: string;
  image?: string; // Base64 data URI or image URL
  imageName?: string;
  imageMimeType?: string;
  imageSizeBytes?: number;
  propertyId?: string;
  unitNumber?: string;
  room?: string;
  issueDuration?: string;
  isTenantPresent?: boolean;
  accessInstructions?: string;
  userId?: string;
  userRole?: string;
}

export interface MaintenanceTriageResult {
  id: string;
  category: MaintenanceCategory;
  severity: MaintenanceSeverity;
  urgency: MaintenanceUrgency;
  confidence: MaintenanceConfidence;
  confidenceScore: number; // 0.0 to 1.0
  summary: string;
  suggestedActions: string[];
  recommendedNextStep: string;
  requiresImmediateAttention: boolean;
  safetyHazards?: string[];
  estimatedResolutionTime?: string;
  disclaimer: string;
  provider: string;
  propertyId?: string;
  room?: string;
  issueDuration?: string;
  hasImage: boolean;
  timestamp: string;
}

export interface MaintenanceTriageApiResponse {
  success: boolean;
  triage?: MaintenanceTriageResult;
  error?: string;
  sanitizedRequestId?: string;
}
