// Property Reputation Graph Type Definitions
// NESTORA Feature 6: Interactive Property Reputation Graph

export type ReputationEntityType =
  | "PROPERTY"
  | "LANDLORD"
  | "REVIEWS"
  | "VERIFICATION"
  | "MAINTENANCE"
  | "LOCATION"
  | "RESIDENT EXPERIENCE"
  | "LISTING HISTORY";

export type ReputationDataSource =
  | "VERIFIED DATA"
  | "USER-GENERATED DATA"
  | "AI-DERIVED SIGNAL";

export type ReputationConfidence = "HIGH" | "MEDIUM" | "LOW";

export type NodeStatus = "positive" | "neutral" | "warning" | "insufficient_data";

export interface ReputationEvidenceItem {
  id: string;
  source: string;
  timestamp?: string;
  verified: boolean;
  classification: ReputationDataSource;
  description: string;
  url?: string;
  rawMetric?: string | number;
}

export interface ReputationNode {
  id: string;
  entityType: ReputationEntityType;
  label: string;
  sublabel?: string;
  description: string;
  dataSource: ReputationDataSource;
  confidence: ReputationConfidence;
  confidenceScore: number; // 0.00 to 1.00
  status: NodeStatus;
  insufficientData: boolean;
  score?: number; // 0 to 100 where applicable
  evidence: ReputationEvidenceItem[];
  metadata: Record<string, any>;
  x?: number; // Visual graph positioning
  y?: number;
}

export interface ReputationRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: string;
  label: string;
  description: string;
  sourceClassification: ReputationDataSource;
  confidence: ReputationConfidence;
  confidenceScore: number;
  weight: number; // 1 to 10
  evidence: ReputationEvidenceItem[];
}

export interface ReputationSignal {
  id: string;
  code: string;
  title: string;
  entityType: ReputationEntityType;
  classification: ReputationDataSource;
  scoreEffect: "positive" | "neutral" | "negative" | "info";
  description: string;
  traceableSource: string;
  confidence: number;
  evidence: string;
}

export interface ReputationTelemetry {
  verifiedDataCount: number;
  userGeneratedCount: number;
  aiDerivedCount: number;
  totalEntities: number;
  totalRelationships: number;
  engineVersion: string;
  computedAt: string;
}

export interface PropertyReputationGraph {
  propertyId: string;
  propertyTitle: string;
  overallScore: number; // 0 to 100
  overallConfidence: ReputationConfidence;
  confidenceScore: number;
  summary: string;
  hasInsufficientData: boolean;
  insufficientDataEntities: ReputationEntityType[];
  nodes: ReputationNode[];
  relationships: ReputationRelationship[];
  signals: ReputationSignal[];
  telemetry: ReputationTelemetry;
}

export interface PropertyReputationResponse {
  success: boolean;
  data?: PropertyReputationGraph;
  error?: string;
}
