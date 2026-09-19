import { executeDomainEngine, type CopilotPayload, type CopilotIntent } from "./engine";
import { maskSensitivePII } from "./guardrails";

export interface CopilotRequest {
  message: string;
  conversationId?: string;
  propertyId?: string;
  role?: "tenant" | "owner";
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface AICopilotProvider {
  name: string;
  generateResponse(request: CopilotRequest): Promise<CopilotPayload>;
}

/**
 * Mock / Offline Intelligent Provider
 * 100% deterministic, high-fidelity rental intelligence engine
 */
export class MockCopilotProvider implements AICopilotProvider {
  name = "Nivasa Intelligent Domain Engine (Offline Fallback)";

  async generateResponse(request: CopilotRequest): Promise<CopilotPayload> {
    return executeDomainEngine(request.message, request.propertyId, request.role);
  }
}

/**
 * Google Gemini Copilot Provider
 * Connects via GEMINI_API_KEY with schema enforcement and graceful fallback
 */
export class GeminiCopilotProvider implements AICopilotProvider {
  name = "Google Gemini Copilot";
  private apiKey: string;
  private fallbackProvider: MockCopilotProvider;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.fallbackProvider = new MockCopilotProvider();
  }

  async generateResponse(request: CopilotRequest): Promise<CopilotPayload> {
    // Mask sensitive personal data before external transmission
    const sanitizedPrompt = maskSensitivePII(request.message);
    const isOwner = request.role === "owner";

    try {
      const systemInstruction = isOwner
        ? `You are Nivasa AI Rental Copilot for Property Owners, an expert residential tenancy AI for Indian metropolitan cities.
You assist landlords with:
1. PROPERTY_SEARCH & PRICING: advice on creating high-converting listings, micro-market pricing, and rental yields.
2. PROPERTY_COMPARISON: benchmarking landlord properties against neighboring market listings.
3. RENTAL_RISK: screening prospective tenant credentials (KYC), setting legally compliant deposits (max 2 months under Model Tenancy Act), and mutual lock-in terms.
4. TENANT_INQUIRIES: drafting polite, professional responses to prospective tenants regarding amenities and site visits.
5. MAINTENANCE: triaging maintenance requests between landlord responsibilities (structural, roof, wiring) and tenant upkeep.
6. VERIFICATION: drafting bilingual, state-compliant digital tenancy agreements and guiding Aadhaar e-Sign.
7. GENERAL_HELP: navigating the Nivasa Owner Command Deck, property occupancy, and rental ledgers.

Format your response as a valid JSON object matching this schema:
{
  "reply": "string (clear markdown formatting with helpful bullet points and bold highlights)",
  "intent": "PROPERTY_SEARCH" | "PROPERTY_COMPARISON" | "RENTAL_RISK" | "ROOMMATE" | "MAINTENANCE" | "VERIFICATION" | "GENERAL_HELP",
  "suggestedPrompts": ["string", "string", "string"]
}`
        : `You are Nivasa AI Rental Copilot, an expert residential tenancy AI for Indian metropolitan cities.
You assist tenants with:
1. PROPERTY_SEARCH: finding verified residences with transparent pricing and zero brokerage.
2. PROPERTY_COMPARISON: side-by-side metric comparison (Rent, Deposit, Area, Value/sqft, Furnishing).
3. RENTAL_RISK: evaluating security deposits (max 2-3 months by Model Tenancy Act), hidden maintenance costs, title verification.
4. ROOMMATE: finding compatible flatmates based on lifestyle, food habits, work schedules.
5. MAINTENANCE: triaging issues (urgent plumbing/electrical vs routine wear-and-tear) and dispute resolution.
6. VERIFICATION: identity checks (Aadhaar, PAN) and property deed verification.
7. GENERAL_HELP: navigating the Nivasa platform and rent agreements.

Format your response as a valid JSON object matching this schema:
{
  "reply": "string (clear markdown formatting with helpful bullet points and bold highlights)",
  "intent": "PROPERTY_SEARCH" | "PROPERTY_COMPARISON" | "RENTAL_RISK" | "ROOMMATE" | "MAINTENANCE" | "VERIFICATION" | "GENERAL_HELP",
  "suggestedPrompts": ["string", "string", "string"]
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemInstruction}\n\nUser Role: ${request.role || "tenant"}\nUser Message: "${sanitizedPrompt}"` }],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
          signal: AbortSignal.timeout(10000), // 10s Gemini timeout
        }
      );

      if (!res.ok) {
        throw new Error(`Gemini API returned status ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error("Empty response from Gemini API");
      }

      const parsed = JSON.parse(rawText);

      // Enhance Gemini's text with real domain objects from the engine
      const domainEnrichment = await executeDomainEngine(request.message, request.propertyId, request.role);

      return {
        reply: parsed.reply || domainEnrichment.reply,
        intent: (parsed.intent as CopilotIntent) || domainEnrichment.intent,
        suggestedPrompts:
          Array.isArray(parsed.suggestedPrompts) && parsed.suggestedPrompts.length > 0
            ? parsed.suggestedPrompts
            : domainEnrichment.suggestedPrompts,
        recommendations: domainEnrichment.recommendations,
        comparison: domainEnrichment.comparison,
        riskAudit: domainEnrichment.riskAudit,
        roommates: domainEnrichment.roommates,
        actionTriggers: domainEnrichment.actionTriggers,
      };
    } catch (err) {
      console.warn("Gemini Copilot failed or timed out, executing offline domain engine:", err);
      return this.fallbackProvider.generateResponse(request);
    }
  }
}

/**
 * Factory providing active AI Copilot provider
 */
export function getCopilotProvider(): AICopilotProvider {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim().length > 0) {
    return new GeminiCopilotProvider(apiKey.trim());
  }
  return new MockCopilotProvider();
}
