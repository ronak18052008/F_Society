export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL" | "INSUFFICIENT_DATA";

export type RiskConfidence = "HIGH" | "MEDIUM" | "LOW";

export type RiskSeverity = "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type RiskSignalCategory =
  | "FINANCIAL"
  | "PRICING"
  | "VERIFICATION"
  | "DATA_INTEGRITY"
  | "DISPUTES"
  | "MAINTENANCE"
  | "TRUST";

export interface RiskSignal {
  id: string;
  code: string;
  title: string;
  category: RiskSignalCategory;
  severity: RiskSeverity;
  impactPoints: number; // positive = added risk, negative = safety credit
  scoreImpact?: number; // alias for impactPoints
  explanation: string;
  evidence: string;
  source: string;
}

export interface WhyThisScoreBreakdown {
  baseScore: number;
  signalContributions: Array<{
    signalCode: string;
    signalTitle: string;
    points: number;
    rationale: string;
    evidence: string;
  }>;
  calculatedScore: number;
  finalScore: number;
  primaryDrivers?: Array<{
    code: string;
    title: string;
    points: number;
    severity: RiskSeverity;
    rationale: string;
  }>;
  riskBracket: {
    level: RiskLevel;
    range: string;
    interpretation: string;
  };
  methodology: string;
}

export interface RiskAnalysis {
  id: string;
  propertyId: string;
  score: number;        // 0 to 100
  riskScore?: number;   // alias for score
  riskLevel: RiskLevel;
  confidence: RiskConfidence;
  confidenceScore: number; // 0.0 to 1.0
  explanation: string;
  evidence?: string[];  // evidence summary array
  signals: RiskSignal[];
  verificationStatus: string;
  engineVersion: string;
  insufficientData: boolean;
  missingFields?: string[];
  whyThisScore: WhyThisScoreBreakdown;
  timestamp: string;
}
