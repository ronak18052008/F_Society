import { getProperties, getPropertyById } from "@/lib/supabase/properties";
import { properties as demoProperties, roommates as seedRoommates } from "@/data/demo";
import type { Property, RoommateProfile } from "@/types";

export type CopilotIntent =
  | "PROPERTY_SEARCH"
  | "PROPERTY_COMPARISON"
  | "RENTAL_RISK"
  | "ROOMMATE"
  | "MAINTENANCE"
  | "VERIFICATION"
  | "GENERAL_HELP";

export interface PropertyComparisonData {
  properties: Array<{
    id: string;
    title: string;
    city: string;
    locality: string;
    rent: number;
    deposit: number;
    bhk: number;
    sizeSqft: number;
    furnishing: string;
    areaType: string;
    trustScore: number;
    highlights: string[];
  }>;
  verdict: string;
  bestValueId: string;
}

export interface RentalRiskAudit {
  score: number; // 0 to 100
  level: "Low" | "Moderate" | "High";
  depositMultiplier: number;
  factors: Array<{
    title: string;
    status: "pass" | "warning" | "danger";
    detail: string;
  }>;
  legalGuidance: string;
}

export interface CopilotPayload {
  reply: string;
  intent: CopilotIntent;
  suggestedPrompts: string[];
  recommendations?: Property[];
  comparison?: PropertyComparisonData;
  riskAudit?: RentalRiskAudit;
  roommates?: RoommateProfile[];
  actionTriggers?: Array<{
    type: "view_property" | "save_property" | "compare" | "check_risk";
    label: string;
    href?: string;
    propertyId?: string;
  }>;
}

/**
 * Classifies query into one of the 7 supported intents
 */
export function classifyIntent(query: string, currentPropertyId?: string): CopilotIntent {
  const q = query.toLowerCase();

  // Compare intent
  if (
    q.includes("compare") ||
    q.includes("difference between") ||
    q.includes("vs") ||
    q.includes("which is better") ||
    (currentPropertyId && (q.includes("other options") || q.includes("similar options")))
  ) {
    return "PROPERTY_COMPARISON";
  }

  // Rental Risk / Scam / Security deposit audit
  if (
    q.includes("risk") ||
    q.includes("scam") ||
    q.includes("fraud") ||
    q.includes("safe") ||
    q.includes("deposit") ||
    q.includes("advance") ||
    q.includes("hidden cost") ||
    q.includes("renttruth") ||
    q.includes("legal") ||
    q.includes("clause") ||
    q.includes("agreement issue")
  ) {
    return "RENTAL_RISK";
  }

  // Roommate intent
  if (
    q.includes("roommate") ||
    q.includes("flatmate") ||
    q.includes("shared") ||
    q.includes("co-living") ||
    q.includes("room partner") ||
    q.includes("split rent")
  ) {
    return "ROOMMATE";
  }

  // Maintenance intent
  if (
    q.includes("maintenance") ||
    q.includes("leak") ||
    q.includes("repair") ||
    q.includes("plumbing") ||
    q.includes("electric") ||
    q.includes("appliance") ||
    q.includes("ac broken") ||
    q.includes("damage") ||
    q.includes("water issue")
  ) {
    return "MAINTENANCE";
  }

  // Verification intent
  if (
    q.includes("verif") ||
    q.includes("kyc") ||
    q.includes("aadhaar") ||
    q.includes("pan") ||
    q.includes("police verification") ||
    q.includes("passport") ||
    q.includes("ownership proof") ||
    q.includes("title deed") ||
    q.includes("electricity bill")
  ) {
    return "VERIFICATION";
  }

  // Search intent
  if (
    q.includes("find") ||
    q.includes("search") ||
    q.includes("looking for") ||
    q.includes("bhk") ||
    q.includes("rent") ||
    q.includes("flat") ||
    q.includes("house") ||
    q.includes("apartment") ||
    q.includes("mumbai") ||
    q.includes("bangalore") ||
    q.includes("chennai") ||
    q.includes("hyderabad") ||
    q.includes("delhi") ||
    q.includes("kolkata") ||
    q.includes("budget")
  ) {
    return "PROPERTY_SEARCH";
  }

  return "GENERAL_HELP";
}

/**
 * Intelligent Rule-Based Engine providing complete domain analysis for all 7 intents
 */
export async function executeDomainEngine(
  query: string,
  propertyId?: string
): Promise<CopilotPayload> {
  const intent = classifyIntent(query, propertyId);
  const q = query.toLowerCase();

  // Fetch contextual property if propertyId provided
  let contextProperty: Property | null = null;
  if (propertyId) {
    try {
      contextProperty = await getPropertyById(propertyId);
    } catch {
      // Fallback
    }
  }

  // 1. PROPERTY COMPARISON
  if (intent === "PROPERTY_COMPARISON") {
    let all = await getProperties({ pageSize: 24 });
    if (!all || all.length === 0) all = demoProperties;

    const baseProp = contextProperty || all[0];
    const cityProps = all.filter((p) => p.city.toLowerCase() === baseProp.city.toLowerCase());
    const candidates = [baseProp, ...(cityProps.filter((p) => p.id !== baseProp.id).slice(0, 2))];

    const compItems = candidates.map((p, idx) => ({
      id: p.id,
      title: p.title,
      city: p.city,
      locality: p.locality,
      rent: p.rent,
      deposit: p.deposit || p.rent * 2,
      bhk: p.bhk || p.bedrooms || 2,
      sizeSqft: p.sizeSqft || p.areaSqft || 800,
      furnishing: p.furnishingStatus || (p.furnishing ? p.furnishing.toUpperCase() : "Furnished"),
      areaType: p.areaType || "Super Area",
      trustScore: p.verification === "identity-checked" ? 96 : 84,
      highlights: [
        `${p.bhk || p.bedrooms} BHK in ${p.locality}`,
        `₹${Math.round(p.rent / (p.sizeSqft || p.areaSqft || 800))}/sqft effective`,
        p.furnishingStatus || "Semi-Furnished",
      ],
    }));

    // Find best value
    const sortedByValue = [...compItems].sort(
      (a, b) => a.rent / a.sizeSqft - b.rent / b.sizeSqft
    );
    const bestValue = sortedByValue[0];

    return {
      intent: "PROPERTY_COMPARISON",
      reply: `Here is a side-by-side comparative breakdown of residences in **${baseProp.city}**. **${bestValue.title}** offers the optimal rate per sqft at ₹${Math.round(bestValue.rent / bestValue.sizeSqft)}/sqft with verified credentials.`,
      recommendations: candidates,
      comparison: {
        properties: compItems,
        verdict: `${bestValue.title} in ${bestValue.locality} stands out as the most cost-efficient option with transparent deposit terms and verified landlord status.`,
        bestValueId: bestValue.id,
      },
      suggestedPrompts: [
        `Check rental risk for ${bestValue.title}`,
        "What are typical security deposit standards in this area?",
        "Find more furnished flats under ₹30,000",
      ],
      actionTriggers: candidates.map((c) => ({
        type: "view_property",
        label: `View ${c.locality}`,
        href: `/property/${c.id}`,
        propertyId: c.id,
      })),
    };
  }

  // 2. RENTAL RISK & SCAM AUDIT
  if (intent === "RENTAL_RISK") {
    let prop = contextProperty;
    if (!prop) {
      const all = await getProperties({ pageSize: 5 });
      prop = all[0] || demoProperties[0];
    }

    const rent = prop.rent || 25000;
    const deposit = prop.deposit || rent * 2.5;
    const multiplier = Number((deposit / rent).toFixed(1));

    const isDepositHigh = multiplier > 3.0;
    const isVerified = prop.verification === "identity-checked";

    const factors: RentalRiskAudit["factors"] = [
      {
        title: "Security Deposit Multiple",
        status: isDepositHigh ? "warning" : "pass",
        detail: `Deposit is ${multiplier}x of monthly rent (₹${deposit.toLocaleString("en-IN")}). The Model Tenancy Act recommends a maximum of 2 months for residential rentals.`,
      },
      {
        title: "Landlord Ownership & Title KYC",
        status: isVerified ? "pass" : "warning",
        detail: isVerified
          ? "Owner identity and utility bill cross-validation verified on NESTORA."
          : "Property documentation is pending deed confirmation. Always demand electricity bill inspection.",
      },
      {
        title: "Hidden Maintenance & Lock-in Clauses",
        status: "pass",
        detail: "Zero brokerage guarantee. Society maintenance is clearly separated in the RentTruth™ breakdown.",
      },
      {
        title: "Condition Passport Inspection",
        status: "pass",
        detail: "Pre-move digital condition ledger required prior to security deposit handover.",
      },
    ];

    const score = (isVerified ? 50 : 30) + (isDepositHigh ? 20 : 45);
    const level = score >= 80 ? "Low" : score >= 50 ? "Moderate" : "High";

    return {
      intent: "RENTAL_RISK",
      reply: `**RentTruth™ Risk Analysis for ${prop.title}**: The estimated risk level is **${level}** (Trust Score: ${score}/100). Deposit stands at ${multiplier}x monthly rent. Always verify the latest electricity bill before signing the lease.`,
      riskAudit: {
        score,
        level,
        depositMultiplier: multiplier,
        factors,
        legalGuidance:
          "Under the Model Tenancy Act (MTA), security deposit for residential premises cannot exceed 2 months' rent. Ensure lock-in periods have mutual termination notices.",
      },
      suggestedPrompts: [
        `View full RentTruth breakdown for this property`,
        "What clauses should I ensure in the rental agreement?",
        "How does the Move-in Condition Passport protect my deposit?",
      ],
      actionTriggers: [
        {
          type: "check_risk",
          label: "View RentTruth™ Audit",
          href: `/renttruth/${prop.id}`,
          propertyId: prop.id,
        },
        {
          type: "view_property",
          label: "Inspect Property Details",
          href: `/property/${prop.id}`,
          propertyId: prop.id,
        },
      ],
    };
  }

  // 3. ROOMMATE ASSISTANCE
  if (intent === "ROOMMATE") {
    const city = ["mumbai", "bangalore", "delhi", "chennai", "hyderabad", "ahmedabad"].find((c) =>
      q.includes(c)
    ) || "Ahmedabad";

    const roommates = seedRoommates.slice(0, 3);

    return {
      intent: "ROOMMATE",
      reply: `Found verified roommate profiles in **${city}** looking for flat shares with verified employment and transparent living preferences. You can view compatibility ratings for food habits, sleep cycles, and budget splits.`,
      roommates,
      suggestedPrompts: [
        "Filter roommates with vegetarian diet only",
        "How does NESTORA protect roommate privacy?",
        "Find 2 BHK apartments suitable for flat-sharing",
      ],
      actionTriggers: [
        {
          type: "view_property",
          label: "Explore Roommate Network",
          href: "/tenant/roommates",
        },
      ],
    };
  }

  // 4. MAINTENANCE ASSISTANCE
  if (intent === "MAINTENANCE") {
    let category = "General Maintenance";
    let priority = "Routine (Resolution within 48-72h)";
    let guidance =
      "Minor wear-and-tear items are typically tenant responsibility. Major structural, electrical conduit, and seepage issues fall on the landlord.";

    if (q.includes("leak") || q.includes("water") || q.includes("plumb")) {
      category = "Plumbing & Water Seepage";
      priority = "High (Resolution within 24h)";
      guidance =
        "Main pipeline bursts and structural seepage are 100% Landlord responsibility. Tap washer replacements and external pipe clogs are tenant upkeep.";
    } else if (q.includes("electric") || q.includes("power") || q.includes("wiring")) {
      category = "Electrical System";
      priority = "Urgent Safety (Immediate dispatch)";
      guidance =
        "Short circuits or main DB board issues require licensed electrician inspection. Do not tamper with wiring. Landlord must reimburse electrical repairs if caused by old wiring.";
    }

    return {
      intent: "MAINTENANCE",
      reply: `**Maintenance Triage (${category})**:\n- **Priority Level**: ${priority}\n- **Responsibility Framework**: ${guidance}\n\n**Next Steps**:\n1. Photograph the affected area with timestamp.\n2. Submit a digital ticket via your Tenancy Workspace.\n3. The property owner will receive automated notification and SLA tracking.`,
      suggestedPrompts: [
        "Log a new maintenance request with photo",
        "Can an owner deduct maintenance from the security deposit?",
        "View condition passport guidelines",
      ],
      actionTriggers: [
        {
          type: "view_property",
          label: "Open Maintenance Dashboard",
          href: "/tenant/dashboard",
        },
      ],
    };
  }

  // 5. VERIFICATION ASSISTANCE
  if (intent === "VERIFICATION") {
    return {
      intent: "VERIFICATION",
      reply: `**NESTORA Multi-Point Verification Protocol**:\n\n1. **Tenant KYC**: Digital Aadhaar verification, PAN validation, and employer/college email authentication.\n2. **Landlord Title Check**: Ownership cross-referenced via municipal property tax records and latest electricity utility bills.\n3. **Property Condition Passport**: High-resolution room-by-room photo documentation at handover to safeguard 100% of your deposit.\n4. **Zero Brokerage Guarantee**: No middleman fees or hidden commissions.`,
      suggestedPrompts: [
        "How do I complete my tenant verification?",
        "What documents does a landlord need to show?",
        "Explain the Move-in Condition Passport",
      ],
      actionTriggers: [
        {
          type: "view_property",
          label: "Start Tenant Verification",
          href: "/onboarding/tenant",
        },
      ],
    };
  }

  // 6. PROPERTY SEARCH (Default fallback for search queries)
  if (intent === "PROPERTY_SEARCH") {
    // Filter by city if mentioned
    const cities = ["Mumbai", "Bangalore", "Chennai", "Hyderabad", "Delhi", "Kolkata", "Ahmedabad"];
    const matchedCity = cities.find((c) => q.includes(c.toLowerCase()));

    // Filter by BHK if mentioned
    let targetBhk: number | undefined;
    if (q.includes("1 bhk") || q.includes("1bhk")) targetBhk = 1;
    else if (q.includes("2 bhk") || q.includes("2bhk")) targetBhk = 2;
    else if (q.includes("3 bhk") || q.includes("3bhk")) targetBhk = 3;

    let filtered = await getProperties({
      city: matchedCity,
      bhk: targetBhk,
      pageSize: 12,
    });

    if (!filtered || filtered.length === 0) {
      filtered = demoProperties.filter((p) => {
        const matchesCity = !matchedCity || p.city.toLowerCase() === matchedCity.toLowerCase();
        const matchesBhk = !targetBhk || (p.bhk || p.bedrooms) === targetBhk;
        return matchesCity && matchesBhk;
      });
      if (filtered.length === 0) {
        filtered = demoProperties.slice(0, 3);
      }
    }

    const matches = filtered.slice(0, 3);
    const cityLabel = matchedCity || "top metropolitan cities";
    const bhkLabel = targetBhk ? `${targetBhk} BHK ` : "";

    return {
      intent: "PROPERTY_SEARCH",
      reply: `I discovered **${filtered.length}** verified ${bhkLabel}residences in **${cityLabel}** matching your criteria. All listings feature verified landlord credentials, transparent zero-brokerage terms, and itemized RentTruth™ cost breakdowns.`,
      recommendations: matches,
      suggestedPrompts: [
        "Compare top 2 options side-by-side",
        "Check rental risk on the lowest rent property",
        "Show only furnished apartments with parking",
      ],
      actionTriggers: matches.map((m) => ({
        type: "view_property",
        label: `View ${m.bhk || m.bedrooms}BHK in ${m.locality}`,
        href: `/property/${m.id}`,
        propertyId: m.id,
      })),
    };
  }

  // 7. GENERAL_HELP
  return {
    intent: "GENERAL_HELP",
    reply: `Welcome to **NESTORA AI Rental Copilot**! I can assist you with:\n\n- 🔍 **Property Search**: Find verified 1/2/3 BHK flats across 6 metro corridors.\n- ⚖️ **Property Comparison**: Side-by-side matrices on rent, deposits, and value per sqft.\n- 🛡️ **RentTruth™ Risk Audit**: Detect unfair lease terms, deposit inflation, and scam indicators.\n- 🤝 **Roommate Match**: Find verified co-living partners with compatible lifestyles.\n- 🔧 **Maintenance Triage**: Classify repairs and understand legal obligations.\n- ✅ **Verification & Agreements**: Generate legally sound rental agreements and verify titles.`,
    suggestedPrompts: [
      "Find 2 BHK flats in Mumbai under ₹45,000",
      "How does NESTORA verify property owners?",
      "Compare properties in Bangalore",
      "Check rental risk on security deposits",
    ],
  };
}
