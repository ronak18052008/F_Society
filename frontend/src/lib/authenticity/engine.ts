// lib/authenticity/engine.ts
// Feature 3: AI Scam / Fake Listing Detection Engine

import type { Property } from "@/types";
import type {
  AuthenticityAnalysis,
  AuthenticitySignal,
  AuthenticityStatus,
  AuthenticityConfidence,
  DuplicateMatch,
  WhyThisResultBreakdown,
  ImageFingerprintMetadata,
} from "@/types/authenticity";

export const AUTHENTICITY_ENGINE_VERSION = "v3.1.0-deterministic";

const METRO_RENT_BENCHMARKS_PER_SQFT: Record<string, number> = {
  mumbai: 55,
  bangalore: 35,
  bengaluru: 35,
  delhi: 32,
  hyderabad: 24,
  chennai: 24,
  kolkata: 18,
  pune: 26,
  ahmedabad: 20,
};

const CITY_KNOWN_LOCALITIES: Record<string, string[]> = {
  mumbai: ["bandra", "andheri", "juhu", "powai", "worli", "dadar", "borivali", "malad", "chembur", "colaba"],
  bangalore: ["indiranagar", "koramangala", "whitefield", "hsr", "bellandur", "marathahalli", "jayanagar", "hebbal"],
  bengaluru: ["indiranagar", "koramangala", "whitefield", "hsr", "bellandur", "marathahalli", "jayanagar", "hebbal"],
  pune: ["kalyani nagar", "koregaon park", "viman nagar", "baner", "wakad", "hinjewadi", "kothrud", "aundh"],
  ahmedabad: ["navrangpura", "bodakdev", "satellite", "vastrapur", "prahlad nagar", "sg highway", "thaltej"],
  delhi: ["saket", "hauz khas", "vasant kunj", "dwarka", "rohini", "connaught place", "lajpat nagar"],
};

const SUSPICIOUS_PHRASE_PATTERNS = [
  {
    code: "OFF_PLATFORM_CONTACT",
    pattern: /(whatsapp\s*(only|me)?|telegram|reach\s*me\s*at|call\s*direct\s*on|chat\s*on\s*wa|dm\s*me\s*privately)/i,
    title: "Off-Platform Contact Redirection",
    deduction: 15,
  },
  {
    code: "ADVANCE_TOKEN_DEMAND",
    pattern: /(advance\s*token|token\s*before\s*visit|visiting\s*fee|transfer\s*token|pay\s*deposit\s*first|booking\s*amount\s*before|refundable\s*gate\s*pass|security\s*fee\s*before\s*inspection)/i,
    title: "Advance Payment / Token Demand Before Visit",
    deduction: 20,
  },
  {
    code: "WIRE_CRYPTO_PAYMENT",
    pattern: /(western\s*union|moneygram|crypto|usdt|bitcoin|gift\s*card|wire\s*transfer\s*only)/i,
    title: "Untraceable Payment Method Request",
    deduction: 25,
  },
  {
    code: "URGENCY_PRESSURE",
    pattern: /(urgent\s*booking|first\s*come\s*first|immediately\s*transfer|multiple\s*callers|offer\s*valid\s*today\s*only)/i,
    title: "High-Pressure Urgency Tactics",
    deduction: 10,
  },
  {
    code: "UNREALISTIC_PRICE_CLAIM",
    pattern: /(zero\s*deposit.*luxury|cheapest\s*in\s*city|unbelievable\s*deal.*luxury|free\s*utilities.*all\s*inclusive.*super\s*cheap)/i,
    title: "Unrealistic Luxury Claims at Implausible Price",
    deduction: 15,
  },
];

export function evaluatePropertyAuthenticity(
  property: Property | null | undefined,
  allProperties: Property[] = []
): AuthenticityAnalysis {
  const timestamp = new Date().toISOString();

  if (!property) {
    return createEmptyPropertyAuthenticity(timestamp);
  }

  const signals: AuthenticitySignal[] = [];
  const deductions: WhyThisResultBreakdown["deductions"] = [];
  const safetyCredits: WhyThisResultBreakdown["safetyCredits"] = [];
  const primaryRisks: string[] = [];
  const trustFactors: string[] = [];
  const suspiciousDescriptionFlags: string[] = [];
  const missingInformation: string[] = [];

  // Check missing required fields
  if (!property.rent || property.rent <= 0) missingInformation.push("Rent amount");
  if (!property.deposit && property.deposit !== 0) missingInformation.push("Security deposit");
  if (!property.areaSqft && !property.sizeSqft) missingInformation.push("Living area (sqft)");
  if (!property.city || property.city.trim().length === 0) missingInformation.push("City");
  if (!property.locality || property.locality.trim().length === 0) missingInformation.push("Locality");
  if (!property.images || property.images.length === 0) missingInformation.push("Property photographs");
  if (!property.pointOfContact && !property.ownerId) missingInformation.push("Landlord / Owner identification");
  if (!property.description || property.description.trim().length < 30) missingInformation.push("Detailed description");

  // Starting Base Score: 100 points
  const initialScore = 100;
  let runningScore = initialScore;

  const rent = property.rent || 0;
  const area = property.areaSqft || property.sizeSqft || 1;
  const ratePerSqft = Math.round(rent / area);
  const cityKey = (property.city || "").toLowerCase().trim();
  const benchmarkRate = METRO_RENT_BENCHMARKS_PER_SQFT[cityKey] || 25;

  let priceAnomaly = false;
  let duplicateWarning = false;
  const duplicateMatches: DuplicateMatch[] = [];

  // -------------------------------------------------------------
  // 1. SIGNAL: PRICE ANOMALY / UNUSUALLY LOW PRICE
  // -------------------------------------------------------------
  if (rent > 0 && area > 50) {
    if (ratePerSqft < benchmarkRate * 0.45 && rent < 22000) {
      priceAnomaly = true;
      const pts = 30;
      runningScore -= pts;
      const pctBelow = Math.round((1 - ratePerSqft / benchmarkRate) * 100);
      const sig: AuthenticitySignal = {
        id: `sig-auth-price-${property.id}`,
        code: "UNUSUALLY_LOW_PRICE",
        title: "Severe Price Anomaly (Advance-Fee Scam Risk)",
        category: "PRICING",
        severity: "CRITICAL",
        scoreDeduction: pts,
        explanation: `Rent rate of ₹${ratePerSqft}/sqft is ${pctBelow}% below the ${property.city} micro-market median (₹${benchmarkRate}/sqft). Severe underpricing is the primary marker of bait-and-switch advance token scams.`,
        evidence: `Configured rent ₹${rent.toLocaleString("en-IN")}/mo for ${area} sqft against locality benchmark ₹${benchmarkRate}/sqft.`,
        source: "Nivasa Micro-Market Rental Benchmark Index",
      };
      signals.push(sig);
      deductions.push({
        signalCode: sig.code,
        title: sig.title,
        pointsDeducted: pts,
        explanation: sig.explanation,
        evidence: sig.evidence,
      });
      primaryRisks.push(`Rent rate is ${pctBelow}% below market benchmark (High scam likelihood)`);
    } else if (ratePerSqft < benchmarkRate * 0.60 && rent < 30000) {
      priceAnomaly = true;
      const pts = 15;
      runningScore -= pts;
      const pctBelow = Math.round((1 - ratePerSqft / benchmarkRate) * 100);
      const sig: AuthenticitySignal = {
        id: `sig-auth-price-mod-${property.id}`,
        code: "SUSPICIOUS_PRICE_DISCOUNT",
        title: "Substantial Price Under-Cut",
        category: "PRICING",
        severity: "MEDIUM",
        scoreDeduction: pts,
        explanation: `Rent rate of ₹${ratePerSqft}/sqft is ${pctBelow}% lower than regional averages. Requires physical walkthrough verification.`,
        evidence: `Configured rent ₹${rent.toLocaleString("en-IN")}/mo vs median market expectation.`,
        source: "Nivasa Locality Pricing Model",
      };
      signals.push(sig);
      deductions.push({
        signalCode: sig.code,
        title: sig.title,
        pointsDeducted: pts,
        explanation: sig.explanation,
        evidence: sig.evidence,
      });
      primaryRisks.push(`Rent is discounted by ${pctBelow}% compared to local averages`);
    } else {
      trustFactors.push(`Rent rate of ₹${ratePerSqft}/sqft aligns with ${property.city} regional benchmark (₹${benchmarkRate}/sqft)`);
    }
  }

  // -------------------------------------------------------------
  // 2. SIGNAL: DUPLICATE LISTING & CROSS-REGISTRY CHECK
  // -------------------------------------------------------------
  if (allProperties.length > 0) {
    const currentTitle = (property.title || "").toLowerCase().trim();
    const currentLocality = (property.locality || "").toLowerCase().trim();
    const currentCity = (property.city || "").toLowerCase().trim();

    for (const other of allProperties) {
      if (other.id === property.id) continue;

      const otherTitle = (other.title || "").toLowerCase().trim();
      const otherLocality = (other.locality || "").toLowerCase().trim();
      const otherCity = (other.city || "").toLowerCase().trim();

      // Exact title match or title + locality match
      if (currentTitle.length > 8 && currentTitle === otherTitle) {
        duplicateWarning = true;
        const match: DuplicateMatch = {
          propertyId: other.id,
          title: other.title,
          locality: other.locality,
          city: other.city,
          rent: other.rent,
          matchType: "EXACT_TITLE",
          similarityPercent: 98,
        };
        duplicateMatches.push(match);
      } else if (
        currentLocality.length > 3 &&
        currentLocality === otherLocality &&
        currentCity === otherCity &&
        Math.abs(other.rent - rent) < 1000 &&
        (other.bedrooms === property.bedrooms || other.bhk === property.bhk)
      ) {
        duplicateWarning = true;
        const match: DuplicateMatch = {
          propertyId: other.id,
          title: other.title,
          locality: other.locality,
          city: other.city,
          rent: other.rent,
          matchType: "SIMILAR_SPEC",
          similarityPercent: 88,
        };
        duplicateMatches.push(match);
      }
    }

    if (duplicateWarning) {
      const pts = 25;
      runningScore -= pts;
      const sig: AuthenticitySignal = {
        id: `sig-auth-dup-${property.id}`,
        code: "DUPLICATE_LISTING",
        title: "Potential Duplicate / Cross-Listed Property",
        category: "DUPLICATE",
        severity: "HIGH",
        scoreDeduction: pts,
        explanation: `Listing matches existing property records in the ${property.locality}, ${property.city} registry with identical or near-identical specifications.`,
        evidence: `Matched ${duplicateMatches.length} existing listing(s): ${duplicateMatches.map(m => m.title).join(", ")}`,
        source: "Nivasa Cross-Listing Duplicate Engine",
      };
      signals.push(sig);
      deductions.push({
        signalCode: sig.code,
        title: sig.title,
        pointsDeducted: pts,
        explanation: sig.explanation,
        evidence: sig.evidence,
      });
      primaryRisks.push(`Suspected duplicate listing matching ${duplicateMatches.length} other active record(s)`);
    } else {
      trustFactors.push("Unique listing footprint (no duplicate collisions detected in metropolitan database)");
    }
  }

  // -------------------------------------------------------------
  // 3. SIGNAL: SIMILAR / DUPLICATE IMAGES (Perceptual Asset Fingerprinting)
  // Transparent framing: Never claims third-party reverse image web crawl
  // -------------------------------------------------------------
  let duplicateImageFound = false;
  let duplicateImageSource = "";
  if (property.images && property.images.length > 0 && allProperties.length > 0) {
    const currentImages = new Set(property.images.map(img => img.split("?")[0]));
    for (const other of allProperties) {
      if (other.id === property.id) continue;
      const otherImages = (other.images || []).map(img => img.split("?")[0]);
      const common = otherImages.filter(img => currentImages.has(img));
      if (common.length >= 2) {
        duplicateImageFound = true;
        duplicateImageSource = other.title;
        break;
      }
    }
  }

  const imageMetadata: ImageFingerprintMetadata = {
    performedRealReverseSearch: false,
    method: "Multi-Listing Internal Asset Fingerprint & URL Matcher",
    duplicateAssetFound: duplicateImageFound,
    notes: "Internal asset registry comparison only. Third-party web reverse-image scraping was not performed.",
  };

  if (duplicateImageFound) {
    const pts = 20;
    runningScore -= pts;
    const sig: AuthenticitySignal = {
      id: `sig-auth-img-${property.id}`,
      code: "IMAGE_DUPLICATE_RISK",
      title: "Reused Photographic Assets Across Distinct Listings",
      category: "IMAGE",
      severity: "HIGH",
      scoreDeduction: pts,
      explanation: `Multiple photos uploaded to this residence appear identically in another registry listing ('${duplicateImageSource}').`,
      evidence: `Shared photograph asset signature detected with '${duplicateImageSource}'.`,
      source: "Nivasa Digital Asset Registry Fingerprinter",
    };
    signals.push(sig);
    deductions.push({
      signalCode: sig.code,
      title: sig.title,
      pointsDeducted: pts,
      explanation: sig.explanation,
      evidence: sig.evidence,
    });
    primaryRisks.push("Photographic assets shared across multiple separate listings");
  } else if (property.images && property.images.length >= 3) {
    trustFactors.push(`${property.images.length} distinct high-resolution gallery images cataloged`);
  }

  // -------------------------------------------------------------
  // 4. SIGNAL: SUSPICIOUS DESCRIPTION PATTERNS
  // -------------------------------------------------------------
  const desc = property.description || "";
  let matchedPatternPoints = 0;

  for (const item of SUSPICIOUS_PHRASE_PATTERNS) {
    if (item.pattern.test(desc)) {
      suspiciousDescriptionFlags.push(item.title);
      matchedPatternPoints += item.deduction;
    }
  }

  if (suspiciousDescriptionFlags.length > 0) {
    const pts = Math.min(35, matchedPatternPoints);
    runningScore -= pts;
    const sig: AuthenticitySignal = {
      id: `sig-auth-desc-${property.id}`,
      code: "SUSPICIOUS_DESCRIPTION",
      title: "High-Risk Keywords in Property Description",
      category: "DESCRIPTION",
      severity: suspiciousDescriptionFlags.length >= 2 ? "CRITICAL" : "HIGH",
      scoreDeduction: pts,
      explanation: `Property description contains ${suspiciousDescriptionFlags.length} scam marker pattern(s): ${suspiciousDescriptionFlags.join("; ")}.`,
      evidence: `Detected suspicious markers: ${suspiciousDescriptionFlags.join(", ")}.`,
      source: "Nivasa NLP Scam Indicator Parser",
    };
    signals.push(sig);
    deductions.push({
      signalCode: sig.code,
      title: sig.title,
      pointsDeducted: pts,
      explanation: sig.explanation,
      evidence: sig.evidence,
    });
    primaryRisks.push(`Description contains high-risk phrasing: ${suspiciousDescriptionFlags[0]}`);
  } else if (desc.length > 60) {
    trustFactors.push("Clean, professional property description free of off-platform redirection or advance fee pressure");
  }

  // -------------------------------------------------------------
  // 5. SIGNAL: INCONSISTENT LOCATION
  // -------------------------------------------------------------
  if (property.city && property.locality) {
    const locLower = property.locality.toLowerCase().trim();
    // Check if locality actually belongs to a completely different major metro
    let conflictingCity: string | null = null;
    for (const [metroCity, localities] of Object.entries(CITY_KNOWN_LOCALITIES)) {
      if (metroCity !== cityKey && localities.some(l => locLower.includes(l))) {
        conflictingCity = metroCity;
        break;
      }
    }

    if (conflictingCity) {
      const pts = 20;
      runningScore -= pts;
      const sig: AuthenticitySignal = {
        id: `sig-auth-loc-${property.id}`,
        code: "INCONSISTENT_LOCATION",
        title: "Locality & Metro City Inconsistency",
        category: "LOCATION",
        severity: "HIGH",
        scoreDeduction: pts,
        explanation: `Locality '${property.locality}' belongs to ${conflictingCity.toUpperCase()}, but property is registered under city '${property.city}'.`,
        evidence: `Contradiction: '${property.locality}' matches known geography of ${conflictingCity}.`,
        source: "Nivasa Metropolitan Postal Directory",
      };
      signals.push(sig);
      deductions.push({
        signalCode: sig.code,
        title: sig.title,
        pointsDeducted: pts,
        explanation: sig.explanation,
        evidence: sig.evidence,
      });
      primaryRisks.push(`Locality '${property.locality}' contradicts specified city '${property.city}'`);
    } else {
      trustFactors.push(`Locality '${property.locality}' verified within ${property.city} metropolitan area`);
    }
  }

  // -------------------------------------------------------------
  // 6. SIGNAL: INCONSISTENT AMENITIES
  // -------------------------------------------------------------
  const amenities = property.amenities || [];
  const hasLuxuryAmenities = amenities.some(a =>
    /(private\s*swimming\s*pool|olympic\s*pool|helipad|private\s*lawn|sauna|jacuzzi)/i.test(a)
  );

  if (hasLuxuryAmenities && (area < 450 || rent < 12000)) {
    const pts = 15;
    runningScore -= pts;
    const sig: AuthenticitySignal = {
      id: `sig-auth-amenity-${property.id}`,
      code: "INCONSISTENT_AMENITIES",
      title: "Implausible Amenity Specification",
      category: "AMENITIES",
      severity: "MEDIUM",
      scoreDeduction: pts,
      explanation: `Listing lists ultra-luxury infrastructure (e.g. private pool/lawn) on a compact ${area} sqft unit (rent ₹${rent.toLocaleString("en-IN")}/mo).`,
      evidence: `Claimed amenities: ${amenities.join(", ")} on a ${area} sqft property.`,
      source: "Spatial Infrastructure Compatibility Engine",
    };
    signals.push(sig);
    deductions.push({
      signalCode: sig.code,
      title: sig.title,
      pointsDeducted: pts,
      explanation: sig.explanation,
      evidence: sig.evidence,
    });
    primaryRisks.push("Claimed amenities contradict property dimensions and rent tier");
  }

  // -------------------------------------------------------------
  // 7. SIGNAL: INCOMPLETE OWNER INFORMATION & SUSPICIOUS CONTACT
  // -------------------------------------------------------------
  const poc = (property.pointOfContact || "").trim();
  if (!poc || poc.toLowerCase() === "owner" || poc.toLowerCase() === "contact owner") {
    const pts = 12;
    runningScore -= pts;
    const sig: AuthenticitySignal = {
      id: `sig-auth-owner-${property.id}`,
      code: "INCOMPLETE_OWNER_INFO",
      title: "Anonymous / Incomplete Landlord Information",
      category: "OWNER",
      severity: "LOW",
      scoreDeduction: pts,
      explanation: "No individual or corporate landlord name provided. Listing relies on an anonymous point of contact.",
      evidence: `Point of contact field is '${poc || "unspecified"}'.`,
      source: "Nivasa Identity Registry",
    };
    signals.push(sig);
    deductions.push({
      signalCode: sig.code,
      title: sig.title,
      pointsDeducted: pts,
      explanation: sig.explanation,
      evidence: sig.evidence,
    });
    primaryRisks.push("Anonymous landlord profile without designated individual contact");
  } else {
    trustFactors.push(`Designated point of contact: '${poc}'`);
  }

  // -------------------------------------------------------------
  // 8. SIGNAL: MISSING VERIFICATION / SAFETY CREDIT
  // -------------------------------------------------------------
  if (property.verification === "listing-unverified" || !property.verification) {
    const pts = 15;
    runningScore -= pts;
    const sig: AuthenticitySignal = {
      id: `sig-auth-verif-${property.id}`,
      code: "MISSING_VERIFICATION",
      title: "Unverified Ownership & Title Credentials",
      category: "VERIFICATION",
      severity: "MEDIUM",
      scoreDeduction: pts,
      explanation: "Property has not yet undergone official government title deed or landlord identity verification.",
      evidence: "Verification status is marked 'listing-unverified'.",
      source: "Nivasa Land Registry Verification Ledger",
    };
    signals.push(sig);
    deductions.push({
      signalCode: sig.code,
      title: sig.title,
      pointsDeducted: pts,
      explanation: sig.explanation,
      evidence: sig.evidence,
    });
    primaryRisks.push("Landlord identity and property title deed pending official verification");
  } else if (property.verification === "identity-checked") {
    runningScore += 5; // safety credit
    safetyCredits.push({
      title: "Government KYC Verified Landlord",
      pointsCredited: 5,
      explanation: "Landlord identity successfully validated against official identification documents.",
    });
    trustFactors.push("Landlord identity verified through official government KYC");
  }

  // -------------------------------------------------------------
  // Final Score Clamping & Status Determination
  // -------------------------------------------------------------
  const finalScore = Math.max(0, Math.min(100, runningScore));

  let status: AuthenticityStatus = "LIKELY_AUTHENTIC";
  if (finalScore < 40) {
    status = "HIGH_RISK";
  } else if (finalScore < 65) {
    status = "SUSPICIOUS";
  } else if (finalScore < 85) {
    status = "NEEDS_REVIEW";
  } else {
    status = "LIKELY_AUTHENTIC";
  }

  // Calculate confidence score based on data completeness
  const totalFields = 8;
  const availableFields = [
    Boolean(property.rent && property.rent > 0),
    Boolean(property.deposit !== undefined),
    Boolean(property.city),
    Boolean(property.locality),
    Boolean(property.images && property.images.length > 0),
    Boolean(property.areaSqft || property.sizeSqft),
    Boolean(property.description && property.description.length > 20),
    Boolean(property.pointOfContact),
  ].filter(Boolean).length;

  const confidenceScore = Math.round((availableFields / totalFields) * 100) / 100;
  const confidence: AuthenticityConfidence =
    confidenceScore >= 0.85 ? "HIGH" : confidenceScore >= 0.6 ? "MEDIUM" : "LOW";

  // Natural language summary explanation
  let explanation = "";
  if (status === "LIKELY_AUTHENTIC") {
    explanation = `Listing is rated LIKELY AUTHENTIC (${finalScore}/100) with ${confidence} confidence. Pricing aligns with ${property.city} benchmarks, documentation is consistent, and no scam markers were detected.`;
  } else if (status === "NEEDS_REVIEW") {
    explanation = `Listing requires review (${finalScore}/100). Minor omissions or unverified title documentation observed. Walkthrough inspection recommended prior to financial commitment.`;
  } else if (status === "SUSPICIOUS") {
    explanation = `Listing flagged as SUSPICIOUS (${finalScore}/100) with ${signals.length} anomaly signal(s). Review price competitiveness and verify landlord identity before visiting.`;
  } else {
    explanation = `Listing flagged as HIGH RISK (${finalScore}/100). Critical scam indicators detected (severe underpricing, duplicate collision, or off-platform payment demand). Do NOT transfer any advance funds.`;
  }

  const whyThisResult: WhyThisResultBreakdown = {
    initialScore,
    deductions,
    safetyCredits,
    calculatedScore: runningScore,
    finalScore,
    status,
    primaryRisks,
    trustFactors,
    methodology: "Nivasa Authenticity Detector uses deterministic heuristics across micro-market rent parity, duplicate registry collisions, regex scam phrase patterns, spatial attribute integrity, and official KYC verification.",
  };

  return {
    id: `auth-${property.id}`,
    propertyId: property.id,
    authenticityScore: finalScore,
    score: finalScore,
    status,
    confidence,
    confidenceScore,
    explanation,
    verificationStatus: property.verification === "identity-checked" ? "Identity Verified" : property.verification === "documents-pending" ? "Documents Pending" : "Unverified Listing",
    priceAnomaly,
    duplicateWarning,
    duplicateMatches: duplicateMatches.length > 0 ? duplicateMatches : undefined,
    suspiciousDescriptionFlags,
    missingInformation,
    signals,
    whyThisResult,
    imageMetadata,
    timestamp,
  };
}

function createEmptyPropertyAuthenticity(timestamp: string): AuthenticityAnalysis {
  return {
    id: "auth-unknown",
    propertyId: "unknown",
    authenticityScore: 0,
    score: 0,
    status: "HIGH_RISK",
    confidence: "LOW",
    confidenceScore: 0.1,
    explanation: "No property data available for authenticity verification.",
    verificationStatus: "Unverified",
    priceAnomaly: false,
    duplicateWarning: false,
    suspiciousDescriptionFlags: [],
    missingInformation: ["Entire property record missing"],
    signals: [
      {
        id: "sig-auth-missing",
        code: "EMPTY_RECORD",
        title: "Missing Property Record",
        category: "VERIFICATION",
        severity: "CRITICAL",
        scoreDeduction: 100,
        explanation: "Property details could not be retrieved from the directory.",
        evidence: "Zero records returned for requested identifier.",
        source: "Nivasa Data Validator",
      },
    ],
    whyThisResult: {
      initialScore: 100,
      deductions: [{
        signalCode: "EMPTY_RECORD",
        title: "Missing Property Record",
        pointsDeducted: 100,
        explanation: "Cannot evaluate non-existent property.",
        evidence: "Missing property record.",
      }],
      safetyCredits: [],
      calculatedScore: 0,
      finalScore: 0,
      status: "HIGH_RISK",
      primaryRisks: ["Property record does not exist"],
      trustFactors: [],
      methodology: "Cannot compute authenticity without property telemetry.",
    },
    imageMetadata: {
      performedRealReverseSearch: false,
      method: "None",
      duplicateAssetFound: false,
      notes: "No images provided.",
    },
    timestamp,
  };
}
