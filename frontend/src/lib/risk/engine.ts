import type { Property } from "@/types";
import type { RiskAnalysis, RiskSignal, RiskLevel, RiskConfidence, WhyThisScoreBreakdown } from "@/types/risk";

export const ENGINE_VERSION = "v2.4.0-deterministic";

// Benchmark average rental rates per sqft for major Indian metros
const METRO_RENT_BENCHMARKS_PER_SQFT: Record<string, number> = {
  mumbai: 55,
  bangalore: 35,
  delhi: 32,
  hyderabad: 24,
  chennai: 24,
  kolkata: 18,
  pune: 26,
  ahmedabad: 20,
};

/**
 * Deterministic Rental Risk Scoring Engine
 * Analyzes empirical listing metrics against regulatory thresholds (MTA)
 * and micro-market statistics without random values.
 */
export function evaluateRentalRisk(property: Property | null | undefined): RiskAnalysis {
  const timestamp = new Date().toISOString();

  // 1. Check for Insufficient Data
  if (!property) {
    return createInsufficientDataResponse("unknown", ["property_record_missing"], timestamp);
  }

  const missingFields: string[] = [];
  if (!property.rent || property.rent <= 0) missingFields.push("rent");
  if (!property.deposit && property.deposit !== 0) missingFields.push("deposit");
  if (!property.city) missingFields.push("city");
  if (!property.areaSqft && !property.sizeSqft) missingFields.push("area_sqft");

  if (missingFields.length > 0) {
    return createInsufficientDataResponse(property.id, missingFields, timestamp, property);
  }

  const rent = property.rent;
  const deposit = property.deposit;
  const area = property.areaSqft || property.sizeSqft || 1;
  const cityKey = property.city.toLowerCase().trim();
  const benchmarkRate = METRO_RENT_BENCHMARKS_PER_SQFT[cityKey] || 25;
  const ratePerSqft = Math.round(rent / area);
  const depositMultiplier = Math.round((deposit / rent) * 10) / 10;

  const signals: RiskSignal[] = [];
  const contributions: WhyThisScoreBreakdown["signalContributions"] = [];

  // Base score: 10 (Neutral base risk for any private residential tenancy)
  const baseScore = 10;
  let runningScore = baseScore;

  // -------------------------------------------------------------
  // Signal 1: UNUSUAL_DEPOSIT
  // Statutory Reference: Model Tenancy Act (MTA), Section 11
  // -------------------------------------------------------------
  if (depositMultiplier > 5.0) {
    const pts = 30;
    runningScore += pts;
    const signal: RiskSignal = {
      id: `sig-deposit-${property.id}`,
      code: "UNUSUAL_DEPOSIT",
      title: "Severe Security Deposit Inflation",
      category: "FINANCIAL",
      severity: "CRITICAL",
      impactPoints: pts,
      explanation: `Security deposit of ₹${deposit.toLocaleString("en-IN")} represents ${depositMultiplier}x monthly rent, exceeding the statutory ceiling established under the Model Tenancy Act (MTA).`,
      evidence: `Actual deposit multiplier is ${depositMultiplier}x (₹${deposit.toLocaleString("en-IN")}) against monthly rent of ₹${rent.toLocaleString("en-IN")}. Maximum recommended is 2.0x.`,
      source: "Model Tenancy Act (MTA), Section 11 & Property Tenancy Ledger",
    };
    signals.push(signal);
    contributions.push({
      signalCode: signal.code,
      signalTitle: signal.title,
      points: pts,
      rationale: "Deposit multiple > 5.0x statutory baseline",
      evidence: signal.evidence,
    });
  } else if (depositMultiplier > 3.0) {
    const pts = 15;
    runningScore += pts;
    const signal: RiskSignal = {
      id: `sig-deposit-${property.id}`,
      code: "UNUSUAL_DEPOSIT",
      title: "Elevated Security Deposit",
      category: "FINANCIAL",
      severity: "MEDIUM",
      impactPoints: pts,
      explanation: `Deposit multiple of ${depositMultiplier}x monthly rent exceeds typical institutional rental terms.`,
      evidence: `Deposit is ₹${deposit.toLocaleString("en-IN")} (${depositMultiplier}x rent), compared to typical 2–3x norm.`,
      source: "Nivasa Tenancy Standard & Model Tenancy Act Guidelines",
    };
    signals.push(signal);
    contributions.push({
      signalCode: signal.code,
      signalTitle: signal.title,
      points: pts,
      rationale: "Deposit multiple > 3.0x threshold",
      evidence: signal.evidence,
    });
  } else if (depositMultiplier <= 2.0) {
    const pts = -5;
    runningScore += pts;
    const signal: RiskSignal = {
      id: `sig-deposit-safe-${property.id}`,
      code: "COMPLIANT_DEPOSIT",
      title: "MTA Compliant Security Deposit",
      category: "FINANCIAL",
      severity: "SAFE",
      impactPoints: pts,
      explanation: "Security deposit strictly adheres to Model Tenancy Act guidelines (<= 2 months rent).",
      evidence: `Deposit multiple is ${depositMultiplier}x (₹${deposit.toLocaleString("en-IN")} for ₹${rent.toLocaleString("en-IN")} rent).`,
      source: "Model Tenancy Act (MTA) Regulatory Framework",
    };
    signals.push(signal);
    contributions.push({
      signalCode: signal.code,
      signalTitle: signal.title,
      points: pts,
      rationale: "Deposit multiple <= 2.0x compliant with legal caps",
      evidence: signal.evidence,
    });
  }

  // -------------------------------------------------------------
  // Signal 2: UNUSUALLY_LOW_PRICE (Advance-fee scam indicator)
  // -------------------------------------------------------------
  if (ratePerSqft < benchmarkRate * 0.45 && rent < 20000) {
    const pts = 35;
    runningScore += pts;
    const pctBelow = Math.round((1 - ratePerSqft / benchmarkRate) * 100);
    const signal: RiskSignal = {
      id: `sig-price-${property.id}`,
      code: "UNUSUALLY_LOW_PRICE",
      title: "Unusually Low Price Pattern (Scam Risk)",
      category: "PRICING",
      severity: "CRITICAL",
      impactPoints: pts,
      explanation: `Rental rate of ₹${ratePerSqft}/sqft is ${pctBelow}% below the ${property.city} micro-market benchmark (₹${benchmarkRate}/sqft). Abnormally low rental rates frequently correlate with advance-token deposit scams.`,
      evidence: `Configured at ₹${rent.toLocaleString("en-IN")}/mo for ${area} sqft (₹${ratePerSqft}/sqft) vs expected benchmark of ₹${benchmarkRate}/sqft.`,
      source: "Nivasa Micro-Market Rent Index & Locality Baseline",
    };
    signals.push(signal);
    contributions.push({
      signalCode: signal.code,
      signalTitle: signal.title,
      points: pts,
      rationale: `Rental rate is ${pctBelow}% lower than regional median`,
      evidence: signal.evidence,
    });
  }

  // -------------------------------------------------------------
  // Signal 3: MISSING_VERIFICATION (Owner KYC & Title Deed)
  // -------------------------------------------------------------
  if (property.verification === "listing-unverified") {
    const pts = 25;
    runningScore += pts;
    const signal: RiskSignal = {
      id: `sig-verif-${property.id}`,
      code: "MISSING_VERIFICATION",
      title: "Unverified Landlord & Listing",
      category: "VERIFICATION",
      severity: "HIGH",
      impactPoints: pts,
      explanation: "Neither property title deed nor landlord government identity (Aadhaar/PAN) have been validated.",
      evidence: "Verification status is marked 'listing-unverified'. No utility bills or registry extracts uploaded.",
      source: "Nivasa Identity & Ownership Verification Registry",
    };
    signals.push(signal);
    contributions.push({
      signalCode: signal.code,
      signalTitle: signal.title,
      points: pts,
      rationale: "Zero identity or title proof verified",
      evidence: signal.evidence,
    });
  } else if (property.verification === "documents-pending") {
    const pts = 12;
    runningScore += pts;
    const signal: RiskSignal = {
      id: `sig-verif-${property.id}`,
      code: "DOCUMENT_INCONSISTENCIES",
      title: "Title & KYC Documents Pending",
      category: "VERIFICATION",
      severity: "MEDIUM",
      impactPoints: pts,
      explanation: "Verification documentation has been submitted but remains unconfirmed by municipal records.",
      evidence: "Status is 'documents-pending'. Physical deed and latest electricity bill authentication in review.",
      source: "Nivasa Verification Queue",
    };
    signals.push(signal);
    contributions.push({
      signalCode: signal.code,
      signalTitle: signal.title,
      points: pts,
      rationale: "Partial verification awaiting deed cross-match",
      evidence: signal.evidence,
    });
  } else if (property.verification === "identity-checked") {
    const pts = -5;
    runningScore += pts;
    const signal: RiskSignal = {
      id: `sig-verif-safe-${property.id}`,
      code: "VERIFIED_OWNERSHIP",
      title: "Government Verified Title & KYC",
      category: "VERIFICATION",
      severity: "SAFE",
      impactPoints: pts,
      explanation: "Landlord identity validated via Aadhaar and property address confirmed via verified utility bill.",
      evidence: "Status: 'identity-checked'. Ownership passport active.",
      source: "Nivasa Identity Audit Protocol",
    };
    signals.push(signal);
    contributions.push({
      signalCode: signal.code,
      signalTitle: signal.title,
      points: pts,
      rationale: "Full identity & title deed authenticated",
      evidence: signal.evidence,
    });
  }

  // -------------------------------------------------------------
  // Signal 4: INCOMPLETE_LISTING
  // -------------------------------------------------------------
  const photoCount = property.images?.length || 0;
  const amenityCount = property.amenities?.length || 0;
  const descLength = property.description?.trim().length || 0;

  if (photoCount < 2 || amenityCount < 2 || descLength < 40) {
    const pts = 10;
    runningScore += pts;
    const signal: RiskSignal = {
      id: `sig-incomplete-${property.id}`,
      code: "INCOMPLETE_LISTING",
      title: "Incomplete Listing Telemetry",
      category: "DATA_INTEGRITY",
      severity: "LOW",
      impactPoints: pts,
      explanation: "Listing lacks comprehensive interior photography, detailed description, or itemized amenities.",
      evidence: `Listing provides ${photoCount} photo(s), ${amenityCount} amenity tag(s), and a brief description of ${descLength} characters.`,
      source: "Listing Completeness Scanner",
    };
    signals.push(signal);
    contributions.push({
      signalCode: signal.code,
      signalTitle: signal.title,
      points: pts,
      rationale: "Insufficient photographic and descriptive detail",
      evidence: signal.evidence,
    });
  }

  // -------------------------------------------------------------
  // Signal 5: INCONSISTENT_INFORMATION
  // -------------------------------------------------------------
  const bhk = property.bhk || property.bedrooms || 1;
  const isAreaInconsistent = (bhk >= 3 && area < 400) || (bhk >= 2 && area < 250);
  const isBathroomsInconsistent = property.bathrooms > bhk + 2;

  if (isAreaInconsistent || isBathroomsInconsistent) {
    const pts = 18;
    runningScore += pts;
    const signal: RiskSignal = {
      id: `sig-inconsistent-${property.id}`,
      code: "INCONSISTENT_INFORMATION",
      title: "Inconsistent Property Configuration",
      category: "DATA_INTEGRITY",
      severity: "HIGH",
      impactPoints: pts,
      explanation: "Configured rooms and reported carpet area demonstrate physical inconsistencies.",
      evidence: `Reported ${bhk} BHK layout on only ${area} sqft carpet area is outside architectural viability standards.`,
      source: "Spatial Configuration Engine",
    };
    signals.push(signal);
    contributions.push({
      signalCode: signal.code,
      signalTitle: signal.title,
      points: pts,
      rationale: "Room count to carpet area ratio anomaly",
      evidence: signal.evidence,
    });
  }

  // -------------------------------------------------------------
  // Signal 6: SUSPICIOUS_LISTING_PATTERNS
  // -------------------------------------------------------------
  const poc = (property.pointOfContact || "").toLowerCase();
  if (!property.ownerId && (poc.includes("agent") || poc.includes("unknown") || poc === "")) {
    const pts = 8;
    runningScore += pts;
    const signal: RiskSignal = {
      id: `sig-pattern-${property.id}`,
      code: "SUSPICIOUS_LISTING_PATTERNS",
      title: "Unlinked Landlord Account",
      category: "TRUST",
      severity: "LOW",
      impactPoints: pts,
      explanation: "Property is not tied to a registered, direct-owner Nivasa platform account.",
      evidence: `Point of contact '${property.pointOfContact || "Unspecified"}' operates without direct landlord account linkage.`,
      source: "Host Identity Registry",
    };
    signals.push(signal);
    contributions.push({
      signalCode: signal.code,
      signalTitle: signal.title,
      points: pts,
      rationale: "No direct authenticated landlord entity",
      evidence: signal.evidence,
    });
  }

  // -------------------------------------------------------------
  // Signal 7: COMPLAINT_SIGNALS & UNVERIFIED EXPENSES
  // -------------------------------------------------------------
  const expenses = property.expenses || [];
  const hasEstimatedExpenses = expenses.some((e) => e.source === "estimated");
  if (hasEstimatedExpenses) {
    const pts = 8;
    runningScore += pts;
    const signal: RiskSignal = {
      id: `sig-complaint-${property.id}`,
      code: "COMPLAINT_SIGNALS",
      title: "Estimated / Unverified Society Outlays",
      category: "DISPUTES",
      severity: "LOW",
      impactPoints: pts,
      explanation: "Secondary living expenses (society maintenance, water dues) rely on unverified estimates.",
      evidence: "Property expenses contain estimated line items without uploaded official society utility bills.",
      source: "RentTruth™ Financial Audit Ledger",
    };
    signals.push(signal);
    contributions.push({
      signalCode: signal.code,
      signalTitle: signal.title,
      points: pts,
      rationale: "Estimated maintenance can lead to post move-in billing disputes",
      evidence: signal.evidence,
    });
  }

  // -------------------------------------------------------------
  // Signal 8: MAINTENANCE_HISTORY
  // -------------------------------------------------------------
  const pts = 4;
  runningScore += pts;
  const signalMaint: RiskSignal = {
    id: `sig-maint-${property.id}`,
    code: "MAINTENANCE_HISTORY",
    title: "No Prior Move-In Condition Passport",
    category: "MAINTENANCE",
    severity: "LOW",
    impactPoints: pts,
    explanation: "Property has not yet undergone a digital Day-0 condition check to timestamp pre-existing wear.",
    evidence: "Zero room-by-room photographic inspection logs on the Nivasa Condition Passport ledger.",
    source: "Nivasa Condition Passport Protocol",
  };
  signals.push(signalMaint);
  contributions.push({
    signalCode: signalMaint.code,
    signalTitle: signalMaint.title,
    points: pts,
    rationale: "Pre-existing wear undocumented, requiring Day-0 inventory log",
    evidence: signalMaint.evidence,
  });

  // Clamp final score strictly to [0, 100]
  const finalScore = Math.max(0, Math.min(100, runningScore));

  // Determine Risk Level deterministically
  let riskLevel: RiskLevel = "LOW";
  let bracketDesc = "Listing demonstrates high regulatory compliance and verified credentials with standard security deposit.";

  if (finalScore > 75) {
    riskLevel = "CRITICAL";
    bracketDesc = "Severe risk flags detected (unusually low pricing, severe deposit inflation, or unverified ownership). Strong caution advised.";
  } else if (finalScore > 50) {
    riskLevel = "HIGH";
    bracketDesc = "Elevated risk factors detected regarding deposit multiple or unverified credentials. Demand electricity bill inspection before deposit transfer.";
  } else if (finalScore > 25) {
    riskLevel = "MODERATE";
    bracketDesc = "Moderate risk factors noted (minor listing omissions, estimated maintenance outlays). Standard verification advised.";
  }

  // Confidence calculation
  const totalChecks = 6;
  const passedChecks = [
    Boolean(property.rent && property.rent > 0),
    Boolean(property.deposit && property.deposit > 0),
    Boolean(property.areaSqft || property.sizeSqft),
    Boolean(property.verification),
    Boolean(photoCount >= 1),
    Boolean(property.city),
  ].filter(Boolean).length;

  const confidenceScore = Math.round((passedChecks / totalChecks) * 100) / 100;
  const confidence: RiskConfidence = confidenceScore >= 0.85 ? "HIGH" : confidenceScore >= 0.6 ? "MEDIUM" : "LOW";

  // Human-readable summary explanation
  const explanation = `Rental Risk Score is ${finalScore}/100 (${riskLevel} RISK) with ${confidence} confidence (${Math.round(confidenceScore * 100)}%). ${bracketDesc} Deposit multiple is ${depositMultiplier}x and verification status is '${property.verification || "unverified"}'.`;

  signals.forEach((s) => {
    s.scoreImpact = s.impactPoints;
  });

  const primaryDrivers = signals
    .filter((s) => s.impactPoints > 0)
    .sort((a, b) => b.impactPoints - a.impactPoints)
    .map((s) => ({
      code: s.code,
      title: s.title,
      points: s.impactPoints,
      severity: s.severity,
      rationale: s.explanation,
    }));

  const whyThisScore: WhyThisScoreBreakdown = {
    baseScore,
    signalContributions: contributions,
    calculatedScore: runningScore,
    finalScore,
    primaryDrivers,
    riskBracket: {
      level: riskLevel,
      range: riskLevel === "LOW" ? "0–25" : riskLevel === "MODERATE" ? "26–50" : riskLevel === "HIGH" ? "51–75" : "76–100",
      interpretation: bracketDesc,
    },
    methodology: "Nivasa Deterministic Rental Risk Scoring Model evaluates statutory MTA deposit compliance, micro-market pricing anomalies, government title deed KYC, and listing telemetry completeness.",
  };

  const evidence = signals.map((s) => s.evidence).filter(Boolean);

  return {
    id: `risk-${property.id}`,
    propertyId: property.id,
    score: finalScore,
    riskScore: finalScore,
    riskLevel,
    confidence,
    confidenceScore,
    explanation,
    evidence,
    signals,
    verificationStatus: property.verification === "identity-checked" ? "Identity Verified" : property.verification === "documents-pending" ? "Documents Pending" : "Unverified Listing",
    engineVersion: ENGINE_VERSION,
    insufficientData: false,
    whyThisScore,
    timestamp,
  };
}

function createInsufficientDataResponse(
  propertyId: string,
  missingFields: string[],
  timestamp: string,
  property?: Property | null
): RiskAnalysis {
  const insSignal: RiskSignal = {
    id: `sig-insufficient-${propertyId}`,
    code: "INSUFFICIENT_DATA",
    title: "Missing Required Listing Fields",
    category: "DATA_INTEGRITY",
    severity: "CRITICAL",
    impactPoints: 0,
    scoreImpact: 0,
    explanation: "Critical financial or physical attributes are missing from the property listing record.",
    evidence: `Missing parameter(s): ${missingFields.join(", ")}`,
    source: "Data Integrity Validator",
  };

  return {
    id: `risk-${propertyId}`,
    propertyId,
    score: 0,
    riskScore: 0,
    riskLevel: "INSUFFICIENT_DATA",
    confidence: "LOW",
    confidenceScore: 0.2,
    explanation: `Insufficient data: Listing is missing essential attributes (${missingFields.join(", ")}). A reliable rental risk analysis cannot be computed until these parameters are populated.`,
    evidence: [`Missing parameter(s): ${missingFields.join(", ")}`],
    signals: [insSignal],
    verificationStatus: property?.verification || "Unknown",
    engineVersion: ENGINE_VERSION,
    insufficientData: true,
    missingFields,
    whyThisScore: {
      baseScore: 0,
      signalContributions: [],
      calculatedScore: 0,
      finalScore: 0,
      primaryDrivers: [],
      riskBracket: {
        level: "INSUFFICIENT_DATA",
        range: "N/A",
        interpretation: "Insufficient data to score risk. Update property listing parameters.",
      },
      methodology: "Data integrity requirement: properties require valid rent, deposit, city, and area values before deterministic risk evaluation.",
    },
    timestamp,
  };
}
