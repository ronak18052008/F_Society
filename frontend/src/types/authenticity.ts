// types/authenticity.ts
// Feature 3: AI Scam / Fake Listing Detector Types

export type AuthenticityStatus = "LIKELY_AUTHENTIC" | "NEEDS_REVIEW" | "SUSPICIOUS" | "HIGH_RISK";

export type AuthenticityConfidence = "HIGH" | "MEDIUM" | "LOW";

export type SignalSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AuthenticitySignalCategory =
  | "PRICING"
  | "DUPLICATE"
  | "IMAGE"
  | "LOCATION"
  | "DESCRIPTION"
  | "OWNER"
  | "AMENITIES"
  | "CONTACT"
  | "VERIFICATION";

export interface AuthenticitySignal {
  id: string;
  code: string;
  title: string;
  category: AuthenticitySignalCategory;
  severity: SignalSeverity;
  scoreDeduction: number; // Penalty points deducted from 100
  explanation: string;
  evidence: string;
  source: string;
}

export interface DuplicateMatch {
  propertyId: string;
  title: string;
  locality: string;
  city: string;
  rent: number;
  matchType: "EXACT_TITLE" | "SIMILAR_SPEC" | "IMAGE_OVERLAP" | "SUSPECTED_CROSS_LISTING";
  similarityPercent: number;
}

export interface WhyThisResultBreakdown {
  initialScore: number;
  deductions: Array<{
    signalCode: string;
    title: string;
    pointsDeducted: number;
    explanation: string;
    evidence: string;
  }>;
  safetyCredits: Array<{
    title: string;
    pointsCredited: number;
    explanation: string;
  }>;
  calculatedScore: number;
  finalScore: number;
  status: AuthenticityStatus;
  primaryRisks: string[];
  trustFactors: string[];
  methodology: string;
}

export interface ImageFingerprintMetadata {
  performedRealReverseSearch: false; // Never claim reverse-image analysis unless actually performed by a real service
  method: string;
  fingerprintHash?: string;
  duplicateAssetFound: boolean;
  notes: string;
}

export interface AuthenticityAnalysis {
  id: string;
  propertyId: string;
  authenticityScore: number; // 0 to 100
  score?: number;            // convenient alias
  status: AuthenticityStatus;
  confidence: AuthenticityConfidence;
  confidenceScore: number;   // 0.0 to 1.0
  explanation: string;
  verificationStatus: string;
  priceAnomaly: boolean;
  duplicateWarning: boolean;
  duplicateMatches?: DuplicateMatch[];
  suspiciousDescriptionFlags: string[];
  missingInformation: string[];
  signals: AuthenticitySignal[];
  whyThisResult: WhyThisResultBreakdown;
  imageMetadata: ImageFingerprintMetadata;
  timestamp: string;
}
