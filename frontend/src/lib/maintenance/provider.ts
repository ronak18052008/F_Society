// lib/maintenance/provider.ts
// Feature 4: AI Maintenance Triage Provider Abstraction & Engine

import type {
  MaintenanceCategory,
  MaintenanceSeverity,
  MaintenanceUrgency,
  MaintenanceConfidence,
  MaintenanceTriageRequest,
  MaintenanceTriageResult,
} from "@/types/maintenance";

export interface IMaintenanceTriageProvider {
  readonly name: string;
  triage(request: MaintenanceTriageRequest): Promise<MaintenanceTriageResult>;
}

const DISCLAIMER_NOTICE =
  "Nestora AI Maintenance Triage is an assistance tool and does not replace professional inspection or emergency services. In case of fire, gas leaks, structural collapse, or life-threatening electrical hazards, evacuate immediately and call emergency services (112 / 101 / 108).";

// ----------------------------------------------------------------------------
// Provider 1: Deterministic Rule-Based Fallback Engine
// ----------------------------------------------------------------------------
export class DeterministicMaintenanceTriageProvider implements IMaintenanceTriageProvider {
  public readonly name = "Nestora Deterministic Triage Engine";

  public async triage(request: MaintenanceTriageRequest): Promise<MaintenanceTriageResult> {
    const text = (request.description + " " + (request.room || "") + " " + (request.propertyId || "")).toLowerCase();
    const id = "tri-" + Math.random().toString(36).substring(2, 9);
    const timestamp = new Date().toISOString();

    // 1. Detect Immediate Safety Emergency
    const emergencyTerms = [
      "gas leak", "smell gas", "lpg", "sparking", "sparks", "smoke", "fire",
      "burst pipe", "flooding", "water gushing", "ceiling collapse", "roof collapsed",
      "electric shock", "exposed live wire", "sewage backup", "burning smell",
    ];
    const isEmergency = emergencyTerms.some((term) => text.includes(term));

    // 2. Weighted Keyword Scoring for Category Classification
    const scores: Record<MaintenanceCategory, number> = {
      ELECTRICAL: 0,
      PLUMBING: 0,
      HVAC: 0,
      APPLIANCE: 0,
      STRUCTURAL: 0,
      INTERNET: 0,
      SECURITY: 0,
      OTHER: 0,
    };

    const patternGroups: { category: MaintenanceCategory; weight: number; keywords: string[] }[] = [
      {
        category: "APPLIANCE",
        weight: 12,
        keywords: [
          "refrigerator", "fridge", "freezer", "washing machine", "washer",
          "microwave", "oven", "stove", "cooktop", "dishwasher", "dryer",
          "chimney", "induction", "toaster", "blender", "water purifier", "ro purifier",
        ],
      },
      {
        category: "SECURITY",
        weight: 12,
        keywords: [
          "lock", "deadbolt", "biometric", "padlock", "latch", "cctv", "security",
          "theft", "break-in", "burglar", "intruder", "guard", "intercom",
          "door lock", "keycard", "peephole", "surveillance",
        ],
      },
      {
        category: "INTERNET",
        weight: 12,
        keywords: [
          "wifi", "wi-fi", "internet", "router", "fiber", "broadband", "ethernet",
          "lan", "modem", "network", "bandwidth", "optical cable", "isp",
        ],
      },
      {
        category: "HVAC",
        weight: 10,
        keywords: [
          "air condition", "air conditioner", "air conditioning", "ac ", "ac.", "ac,", "ac/",
          "hvac", "thermostat", "cooling", "heating", "compressor", "ventilation",
          "blower", "duct", "furnace", "air filter", "split ac",
        ],
      },
      {
        category: "ELECTRICAL",
        weight: 9,
        keywords: [
          "circuit", "breaker", "mcb", "fuse", "spark", "sparking", "wire", "wiring",
          "short circuit", "switchboard", "socket", "outlet", "voltage", "blackout",
          "geyser", "electric shock", "earthing", "power fluctuation", "light bulb",
          "ceiling fan", "switch", "power cut", "power",
        ],
      },
      {
        category: "STRUCTURAL",
        weight: 8,
        keywords: [
          "crack", "wall crack", "ceiling crack", "structural", "foundation",
          "plaster", "seepage", "dampness", "damp", "concrete", "flooring tile",
          "pillar", "beam", "balcony railing", "waterproofing", "earthquake",
          "wall", "ceiling",
        ],
      },
      {
        category: "PLUMBING",
        weight: 8,
        keywords: [
          "plumbing", "burst pipe", "pipe", "dripping", "faucet", "tap", "sink", "drain",
          "drainage", "toilet", "flush", "sewage", "clog", "clogged", "overflow",
          "water pipe", "stopcock", "washbasin", "shower", "leak", "leaking", "water",
        ],
      },
      {
        category: "OTHER",
        weight: 5,
        keywords: [
          "paint", "painting", "carpentry", "furniture", "pest", "cleaning",
          "touchup", "scuff", "gardening",
        ],
      },
    ];

    for (const group of patternGroups) {
      for (const kw of group.keywords) {
        if (text.includes(kw)) {
          scores[group.category] += group.weight;
        }
      }
    }

    // Special context adjustments:
    // If text contains "ac" or "air condition" alongside "leak", HVAC is the root category
    if ((text.includes("air condition") || text.includes(" ac ") || text.includes("ac unit")) && text.includes("leak")) {
      scores.HVAC += 20;
    }

    // Find highest scoring category
    let maxCategory: MaintenanceCategory = "OTHER";
    let maxScore = 0;

    for (const [cat, score] of Object.entries(scores) as [MaintenanceCategory, number][]) {
      if (score > maxScore) {
        maxScore = score;
        maxCategory = cat;
      }
    }

    const category = maxCategory;
    let confidence: MaintenanceConfidence = maxScore >= 12 ? "HIGH" : maxScore >= 6 ? "MEDIUM" : "LOW";
    let confidenceScore = maxScore >= 12 ? 0.95 : maxScore >= 6 ? 0.85 : 0.65;

    // 3. Determine Severity & Urgency
    let severity: MaintenanceSeverity = "MEDIUM";
    let urgency: MaintenanceUrgency = "STANDARD";
    let requiresImmediateAttention = false;

    if (isEmergency) {
      severity = "EMERGENCY";
      urgency = "IMMEDIATE";
      requiresImmediateAttention = true;
    } else if (
      text.includes("not working") ||
      text.includes("broken") ||
      text.includes("complete blackout") ||
      text.includes("overflow") ||
      text.includes("heavy leak") ||
      category === "ELECTRICAL"
    ) {
      severity = "HIGH";
      urgency = "SAME_DAY";
      requiresImmediateAttention = true;
    } else if (
      text.includes("slow") ||
      text.includes("minor") ||
      text.includes("paint") ||
      text.includes("scuff") ||
      text.includes("loose handle")
    ) {
      severity = "LOW";
      urgency = "SCHEDULED";
      requiresImmediateAttention = false;
    }

    // 4. Generate Remediation Actions & Next Step
    const suggestedActions: string[] = [];
    let recommendedNextStep = "";

    if (category === "ELECTRICAL") {
      suggestedActions.push("Do not touch exposed fixtures, outlets, or wet switches.");
      suggestedActions.push("Locate the main distribution board and switch off the respective MCB breaker.");
      suggestedActions.push("Unplug sensitive electronic appliances connected to the affected circuit.");
      recommendedNextStep = isEmergency
        ? "Turn off main power breaker immediately and evacuate room until an emergency electrician arrives."
        : "Dispatch certified building electrician for circuit diagnostic.";
    } else if (category === "PLUMBING") {
      suggestedActions.push("Locate the isolation stopcock or main water inlet valve and shut off supply.");
      suggestedActions.push("Place a bucket or absorbent towels under active dripping to protect flooring.");
      suggestedActions.push("Avoid using connected drainage until lines are inspected for backpressure.");
      recommendedNextStep = isEmergency
        ? "Shut off main water inlet immediately to prevent flood damage and dispatch emergency plumber."
        : "Schedule technician walkthrough with replacement washers and sealing compound.";
    } else if (category === "HVAC") {
      suggestedActions.push("Power off the AC unit to prevent compressor overheating or internal electrical shorts.");
      suggestedActions.push("Inspect and clean accessible return-air dust filters.");
      suggestedActions.push("Check external drainage pipe for visible blockages or refrigerant icing.");
      recommendedNextStep = "Book seasonal HVAC service technician for refrigerant pressure and coil check.";
    } else if (category === "APPLIANCE") {
      suggestedActions.push("Safely disconnect appliance power cord from electrical outlet.");
      suggestedActions.push("Check user manual troubleshooting guide and error codes.");
      suggestedActions.push("Ensure appliance has adequate ventilation space around exhausts.");
      recommendedNextStep = "Request OEM authorized appliance service specialist.";
    } else if (category === "STRUCTURAL") {
      suggestedActions.push("Clear furniture and valuables away from damp or cracked ceiling sections.");
      suggestedActions.push("Take high-resolution photographic evidence for landlord notice.");
      suggestedActions.push("Avoid applying pressure or drilling into compromised plaster.");
      recommendedNextStep = "Notify property owner for professional structural waterproofing inspection.";
    } else if (category === "SECURITY") {
      suggestedActions.push("Ensure alternate secondary latches or deadbolts are engaged.");
      suggestedActions.push("Do not leave residence unattended with compromised external entry points.");
      suggestedActions.push("Inform building security / society office immediately.");
      recommendedNextStep = "Dispatch locksmith or security technician for immediate hardware replacement.";
    } else if (category === "INTERNET") {
      suggestedActions.push("Power-cycle optical network terminal (ONT) and Wi-Fi router for 30 seconds.");
      suggestedActions.push("Inspect optical fiber cable for severe bending, pinching, or physical disconnections.");
      suggestedActions.push("Verify broadband provider status page or community WhatsApp alerts for ISP outages.");
      recommendedNextStep = "Raise line-fault ticket with fiber broadband provider.";
    } else {
      suggestedActions.push("Document incident with timestamps and photos.");
      suggestedActions.push("Verify whether common society utility lines are experiencing broader outages.");
      suggestedActions.push("Log mutual ticket on Nivasa Tenancy Workspace.");
      recommendedNextStep = "Dispatch standard maintenance contractor through Nivasa portal.";
    }

    const summary = isEmergency
      ? `CRITICAL ${category} EMERGENCY: Immediate hazard detected (${request.description.slice(0, 80)}...). Urgent safety protocol triggered.`
      : `${severity} priority ${category} issue identified in ${request.room || "property"}. ${urgency} resolution recommended.`;

    return {
      id,
      category,
      severity,
      urgency,
      confidence,
      confidenceScore,
      summary,
      suggestedActions,
      recommendedNextStep,
      requiresImmediateAttention,
      safetyHazards: isEmergency
        ? ["Immediate fire / electrical or flood risk", "Potential utility disruption"]
        : undefined,
      estimatedResolutionTime: isEmergency ? "Under 2 hours" : severity === "HIGH" ? "Within 24 hours" : "1–3 business days",
      disclaimer: DISCLAIMER_NOTICE,
      provider: this.name,
      propertyId: request.propertyId,
      room: request.room,
      issueDuration: request.issueDuration,
      hasImage: Boolean(request.image),
      timestamp,
    };
  }
}

// ----------------------------------------------------------------------------
// Provider 2: Google Gemini AI Triage Provider
// ----------------------------------------------------------------------------
export class GeminiMaintenanceTriageProvider implements IMaintenanceTriageProvider {
  public readonly name = "Google Gemini 2.5 AI";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async triage(request: MaintenanceTriageRequest): Promise<MaintenanceTriageResult> {
    const prompt = `
You are an expert residential property maintenance triage specialist for NESTORA.
Analyze the following tenant maintenance report and optional attached image.

Issue Description:
"${request.description}"

Location/Room: ${request.room || "Residential Unit"}
Duration: ${request.issueDuration || "Recently observed"}

Output ONLY valid JSON strictly adhering to this structure:
{
  "category": "ELECTRICAL" | "PLUMBING" | "HVAC" | "APPLIANCE" | "STRUCTURAL" | "INTERNET" | "SECURITY" | "OTHER",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY",
  "urgency": "IMMEDIATE" | "SAME_DAY" | "STANDARD" | "SCHEDULED",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "confidenceScore": number (0.0 to 1.0),
  "summary": "Concise 1-2 sentence executive summary of the issue",
  "suggestedActions": ["Action 1 for tenant safety/containment", "Action 2", "Action 3"],
  "recommendedNextStep": "Specific immediate operational next step",
  "requiresImmediateAttention": boolean,
  "safetyHazards": ["hazard 1", "hazard 2"] (optional),
  "estimatedResolutionTime": "e.g., 2-4 hours, 24 hours, 2-3 days"
}
`;

    try {
      const parts: any[] = [{ text: prompt }];

      if (request.image) {
        let mimeType = request.imageMimeType || "image/jpeg";
        let base64Data = request.image;
        const sub = request.image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (sub) {
          mimeType = sub[1];
          base64Data = sub[2];
        }
        parts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error("Empty candidate returned by Gemini API");
      }

      const parsed = JSON.parse(rawText);

      return {
        id: "tri-" + Math.random().toString(36).substring(2, 9),
        category: parsed.category || "OTHER",
        severity: parsed.severity || "MEDIUM",
        urgency: parsed.urgency || "STANDARD",
        confidence: parsed.confidence || "HIGH",
        confidenceScore: parsed.confidenceScore || 0.9,
        summary: parsed.summary || "AI Maintenance Triage complete.",
        suggestedActions: parsed.suggestedActions || [
          "Document the issue with photographs.",
          "Prevent further water/electrical usage in the affected zone.",
        ],
        recommendedNextStep:
          parsed.recommendedNextStep || "Dispatch certified trade specialist for inspection.",
        requiresImmediateAttention: Boolean(parsed.requiresImmediateAttention),
        safetyHazards: parsed.safetyHazards,
        estimatedResolutionTime: parsed.estimatedResolutionTime || "Within 24–48 hours",
        disclaimer: DISCLAIMER_NOTICE,
        provider: this.name,
        propertyId: request.propertyId,
        room: request.room,
        issueDuration: request.issueDuration,
        hasImage: Boolean(request.image),
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      console.warn("[GeminiMaintenanceTriageProvider] Error falling back to deterministic:", err);
      const fallback = new DeterministicMaintenanceTriageProvider();
      return fallback.triage(request);
    }
  }
}

// ----------------------------------------------------------------------------
// Factory Function
// ----------------------------------------------------------------------------
export function getMaintenanceTriageProvider(): IMaintenanceTriageProvider {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.trim() !== "" && !geminiKey.includes("placeholder")) {
    return new GeminiMaintenanceTriageProvider(geminiKey);
  }
  return new DeterministicMaintenanceTriageProvider();
}
