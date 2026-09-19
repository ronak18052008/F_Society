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
    q.includes("electricity bill") ||
    q.includes("draft agreement") ||
    q.includes("draft a rental agreement") ||
    q.includes("lease drafter")
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
    q.includes("ahmedabad") ||
    q.includes("budget") ||
    q.includes("price my property") ||
    q.includes("pricing")
  ) {
    return "PROPERTY_SEARCH";
  }

  return "GENERAL_HELP";
}

/**
 * Intelligent Domain Fallback Engine
 * Generates verified, structured responses for all 7 intents with role awareness
 */
export async function executeDomainEngine(
  query: string,
  currentPropertyId?: string,
  role?: "tenant" | "owner"
): Promise<CopilotPayload> {
  const intent = classifyIntent(query, currentPropertyId);
  const q = query.toLowerCase();
  const isOwner = role === "owner";

  // ========================================================
  // OWNER SPECIFIC FLOWS
  // ========================================================
  if (isOwner) {
    // A. Listing Creation Guidance
    if (q.includes("listing") || q.includes("post") || q.includes("create")) {
      return {
        intent: "GENERAL_HELP",
        reply: `**Nivasa Landlord Guide: Creating a Verified Listing**\n\nTo maximize qualified tenant applications and minimize vacancies on Nivasa:\n\n1. **High-Resolution Photography**: Upload 8-12 well-lit photos showing natural daylight, kitchen cabinets, and bathroom fittings.\n2. **RentTruth™ Transparency**: Itemize base rent, society maintenance, and parking charges separately so tenants know the exact monthly outlay.\n3. **Deposit Moderation**: Keep security deposits within 2 months' rent (MTA compliant) to attract top-tier verified professionals faster.\n4. **Instant Title Verification**: Upload your latest electricity bill or property tax receipt for the green 'Verified Owner' badge.`,
        suggestedPrompts: [
          "Open Post Residence form",
          "What is the average rent for a 2 BHK in my area?",
          "How to respond to tenant inquiries effectively?",
        ],
        actionTriggers: [
          {
            type: "view_property",
            label: "+ Post Residence Now",
            href: "/owner/properties/new",
          },
        ],
      };
    }

    // B. Pricing & Rental Yield Guidance
    if (q.includes("price") || q.includes("pricing") || q.includes("yield") || q.includes("rate")) {
      return {
        intent: "PROPERTY_SEARCH",
        reply: `**Nivasa Market Pricing Intelligence**:\n\nBased on Q3 2026 metro benchmarks:\n- **Ahmedabad (Navrangpura/Bodakdev)**: ₹18,000–₹34,000 for 2 BHK (Yield: 3.8%–4.5%)\n- **Bengaluru (Indiranagar/Whitefield)**: ₹32,000–₹55,000 for 2 BHK (Yield: 4.6%–5.2%)\n- **Mumbai (Bandra/Andheri)**: ₹65,000–₹1,15,000 for 2 BHK (Yield: 3.5%–4.2%)\n\n**Yield Optimization Tips**:\n- Fully furnished residences command a **18%–24% premium** with shorter days-on-market.\n- Clear demarcation of society maintenance prevents negotiation friction.`,
        suggestedPrompts: [
          "Compare my property with similar listings",
          "Draft a rental agreement for my tenant",
          "Review pending tenant applications",
        ],
        actionTriggers: [
          {
            type: "view_property",
            label: "Open Owner Command Center",
            href: "/owner",
          },
        ],
      };
    }

    // C. Responding to Inquiries
    if (q.includes("inquir") || q.includes("respond") || q.includes("message")) {
      return {
        intent: "GENERAL_HELP",
        reply: `**Nivasa Tenant Communication Template**:\n\n*\"Hello! Thank you for your interest in our residence on Nivasa. The property is verified and available for move-in. The base rent is as listed with transparent RentTruth™ society maintenance breakdown. Would you like to schedule an in-person walkthrough this weekend or review our 3D digital habitat? Let us know your preferred move-in date and we will send the visit confirmation.\"*\n\n**Best Practices**:\n- Always ensure tenant has completed digital Aadhaar KYC before handing over keys.\n- Use Nivasa's mutual Condition Passport for move-in photo documentation.`,
        suggestedPrompts: [
          "View pending tenant inquiries",
          "Draft a rental agreement",
          "Check tenant KYC requirements",
        ],
        actionTriggers: [
          {
            type: "view_property",
            label: "Review Tenant Inquiries",
            href: "/owner/dashboard#inquiries",
          },
        ],
      };
    }
  }

  // ========================================================
  // 1. PROPERTY COMPARISON
  // ========================================================
  if (intent === "PROPERTY_COMPARISON") {
    const fetchedP1 = currentPropertyId ? await getPropertyById(currentPropertyId) : null;
    const p1 = fetchedP1 || demoProperties[0];
    const p2 = demoProperties.find((p) => p.id !== p1.id && p.city === p1.city) || demoProperties[1];

    const properties = [
      {
        id: p1.id,
        title: p1.title,
        city: p1.city,
        locality: p1.locality,
        rent: p1.rent,
        deposit: p1.deposit,
        bhk: p1.bhk || p1.bedrooms || 1,
        sizeSqft: p1.areaSqft || p1.sizeSqft || 800,
        furnishing: p1.furnishing,
        areaType: "Carpet Area",
        trustScore: 94,
        highlights: ["RentTruth Verified", "Zero Brokerage", "Day 0 Condition Log"],
      },
      {
        id: p2.id,
        title: p2.title,
        city: p2.city,
        locality: p2.locality,
        rent: p2.rent,
        deposit: p2.deposit,
        bhk: p2.bhk || p2.bedrooms || 1,
        sizeSqft: p2.areaSqft || p2.sizeSqft || 800,
        furnishing: p2.furnishing,
        areaType: "Carpet Area",
        trustScore: 91,
        highlights: ["Zero Brokerage", "Metro Commute Corridor", "Verified Owner Title"],
      },
    ];

    const p1Area = p1.areaSqft || p1.sizeSqft || 1;
    const p2Area = p2.areaSqft || p2.sizeSqft || 1;
    const bestValue = p1.rent / p1Area < p2.rent / p2Area ? p1 : p2;
    const bestValueArea = bestValue.areaSqft || bestValue.sizeSqft || 1;

    return {
      intent: "PROPERTY_COMPARISON",
      reply: `Here is a side-by-side metric comparison between **${p1.title}** and **${p2.title}**. Both feature verified landlord credentials, transparent zero-brokerage terms, and itemized RentTruth™ living costs.`,
      comparison: {
        properties,
        verdict: `**${bestValue.title}** offers superior space efficiency at ₹${Math.round(bestValue.rent / bestValueArea)}/sqft with 100% verified ownership records.`,
        bestValueId: bestValue.id,
      },
      suggestedPrompts: [
        `Check rental risk for ${bestValue.title}`,
        "What are the typical society maintenance charges here?",
        "Find verified roommates near this locality",
      ],
      actionTriggers: [
        {
          type: "view_property",
          label: `View ${p1.title}`,
          href: `/property/${p1.id}`,
          propertyId: p1.id,
        },
        {
          type: "view_property",
          label: `View ${p2.title}`,
          href: `/property/${p2.id}`,
          propertyId: p2.id,
        },
      ],
    };
  }

  // ========================================================
  // 2. RENTAL RISK & AUDIT
  // ========================================================
  if (intent === "RENTAL_RISK") {
    const fetchedProp = currentPropertyId ? await getPropertyById(currentPropertyId) : null;
    const prop = fetchedProp || demoProperties[0];
    const rent = prop.rent;
    const deposit = prop.deposit;
    const multiplier = Math.round((deposit / rent) * 10) / 10;
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
          ? "Owner identity and utility bill cross-validation verified on Nivasa."
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

  // ========================================================
  // 3. ROOMMATE ASSISTANCE
  // ========================================================
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
        "How does Nivasa protect roommate privacy?",
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

  // ========================================================
  // 4. MAINTENANCE ASSISTANCE
  // ========================================================
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
          label: isOwner ? "Open Maintenance Ledger" : "Open Maintenance Dashboard",
          href: isOwner ? "/rental/rent-navrang" : "/tenant/dashboard",
        },
      ],
    };
  }

  // ========================================================
  // 5. VERIFICATION & AGREEMENT ASSISTANCE
  // ========================================================
  if (intent === "VERIFICATION") {
    if (isOwner || q.includes("agreement") || q.includes("draft") || q.includes("lease")) {
      return {
        intent: "VERIFICATION",
        reply: `**Nivasa Autonomous Lease Drafter & Verification Protocol**:\n\n1. **Standardized Bilingual Format**: Conforms strictly to the Model Tenancy Act (MTA) with clear Hindi/English clauses.\n2. **Security Deposit Ceiling**: Restricted to a maximum of 2 months for residential premises.\n3. **Notice Period & Escalation**: Standardized 1-month notice and predictable annual rent escalations.\n4. **Digital Aadhaar e-Sign**: Fully paperless, legally binding digital execution.\n5. **Day 0 Condition Passport**: Tamper-proof move-in photographic record.`,
        suggestedPrompts: [
          "Open AI Lease Drafter",
          "What documents does a landlord need to show?",
          "Explain the Move-in Condition Passport",
        ],
        actionTriggers: [
          {
            type: "view_property",
            label: "Draft Digital Lease Agreement",
            href: "/ai/agreement",
          },
        ],
      };
    }

    return {
      intent: "VERIFICATION",
      reply: `**Nivasa Multi-Point Verification Protocol**:\n\n1. **Tenant KYC**: Digital Aadhaar verification, PAN validation, and employer/college email authentication.\n2. **Landlord Title Check**: Ownership cross-referenced via municipal property tax records and latest electricity utility bills.\n3. **Property Condition Passport**: High-resolution room-by-room photo documentation at handover to safeguard 100% of your deposit.\n4. **Zero Brokerage Guarantee**: No middleman fees or hidden commissions.`,
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

  // ========================================================
  // 6. PROPERTY SEARCH (Default search query flow)
  // ========================================================
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

  // ========================================================
  // 7. GENERAL_HELP
  // ========================================================
  if (isOwner) {
    return {
      intent: "GENERAL_HELP",
      reply: `Welcome to **Nivasa AI Rental Copilot for Property Owners**! I can assist you with:\n\n- 📝 **Post Residence**: Create high-converting, zero-commission listings.\n- 📊 **Rental Yield & Pricing**: Optimize rent rates based on micro-market data.\n- ⚖️ **Market Comparison**: Benchmark your property with neighboring listings.\n- 📜 **AI Lease Drafter**: Generate legally binding, MTA-compliant agreements.\n- 💬 **Tenant Inquiries**: Draft polite responses to prospective tenants.\n- 🛠️ **Maintenance Management**: Triage tenant repair tickets and responsibility.`,
      suggestedPrompts: [
        "Help me create a property listing",
        "How should I price my 2 BHK apartment?",
        "Compare my property with similar listings",
        "Draft a standard bilingual rental agreement",
      ],
      actionTriggers: [
        {
          type: "view_property",
          label: "+ Post Residence",
          href: "/owner/properties/new",
        },
      ],
    };
  }

  return {
    intent: "GENERAL_HELP",
    reply: `Welcome to **Nivasa AI Rental Copilot**! I can assist you with:\n\n- 🔍 **Property Search**: Find verified 1/2/3 BHK flats across 6 metro corridors.\n- ⚖️ **Property Comparison**: Side-by-side matrices on rent, deposits, and value per sqft.\n- 🛡️ **RentTruth™ Risk Audit**: Detect unfair lease terms, deposit inflation, and scam indicators.\n- 🤝 **Roommate Match**: Find verified co-living partners with compatible lifestyles.\n- 🔧 **Maintenance Triage**: Classify repairs and understand legal obligations.\n- ✅ **Verification & Agreements**: Generate legally sound rental agreements and verify titles.`,
    suggestedPrompts: [
      "Find 2 BHK flats in Mumbai under ₹45,000",
      "How does Nivasa verify property owners?",
      "Compare properties in Bangalore",
      "Check rental risk on security deposits",
    ],
    actionTriggers: [
      {
        type: "view_property",
        label: "Browse All Residences",
        href: "/properties",
      },
    ],
  };
}
