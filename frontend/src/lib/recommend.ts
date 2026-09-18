import type { Property } from "@/types";

export type ParsedRequirements = {
  raw: string;
  city?: string;
  budget?: number;
  furnishing?: Property["furnishing"];
  type?: Property["type"];
  nearCollege?: boolean;
  shared?: boolean;
};

const CITY_HINTS = ["ahmedabad", "bengaluru", "bangalore", "pune", "mumbai"];

export function parseRequirements(raw: string): ParsedRequirements {
  const text = raw.toLowerCase();
  const parsed: ParsedRequirements = { raw };

  if (text.includes("ahmedabad")) parsed.city = "Ahmedabad";
  if (text.includes("pune")) parsed.city = "Pune";
  if (text.includes("mumbai")) parsed.city = "Mumbai";
  if (text.includes("bengaluru") || text.includes("bangalore")) parsed.city = "Bengaluru";

  const budgetMatch = text.match(/(\d+)\s*(k|thousand|lakh|l)/);
  if (budgetMatch) {
    const n = Number(budgetMatch[1]);
    const unit = budgetMatch[2];
    parsed.budget = unit.startsWith("l") ? n * 100000 : n * 1000;
  } else {
    const rupee = text.match(/₹?\s*(\d{4,6})/);
    if (rupee) parsed.budget = Number(rupee[1]);
  }

  if (text.includes("unfurnished")) parsed.furnishing = "unfurnished";
  else if (text.includes("semi")) parsed.furnishing = "semi-furnished";
  else if (text.includes("furnished")) parsed.furnishing = "furnished";

  if (text.includes("studio")) parsed.type = "studio";
  else if (text.includes("villa")) parsed.type = "villa";
  else if (text.includes("floor")) parsed.type = "independent-floor";
  else if (text.includes("apartment") || text.includes("flat")) parsed.type = "apartment";

  parsed.nearCollege = /college|university|campus/.test(text);
  parsed.shared = /roommate|shared|pg/.test(text);

  return parsed;
}

export function matchProperties(properties: Property[], req: ParsedRequirements) {
  return properties
    .map((property) => {
      const reasons: string[] = [];
      let score = 0;
      if (req.city && property.city.toLowerCase() === req.city.toLowerCase()) {
        score += 4;
        reasons.push(`City match: ${property.city}`);
      } else if (req.city) {
        score -= 3;
      }
      if (req.budget) {
        if (property.rent <= req.budget) {
          score += 3;
          reasons.push(`Rent ${property.rent} is within stated budget`);
        } else {
          score -= 2;
          reasons.push(`Rent exceeds stated budget`);
        }
      }
      if (req.furnishing && property.furnishing === req.furnishing) {
        score += 2;
        reasons.push(`Furnishing: ${property.furnishing}`);
      }
      if (req.type && property.type === req.type) {
        score += 2;
        reasons.push(`Type: ${property.type}`);
      }
      if (req.nearCollege && property.suitability.includes("student")) {
        score += 2;
        reasons.push("Listed as suitable for students");
      }
      if (req.shared && property.suitability.includes("shared")) {
        score += 2;
        reasons.push("Open to shared occupancy");
      }
      return { property, score, reasons };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function cityFromText(text: string) {
  const found = CITY_HINTS.find((city) => text.toLowerCase().includes(city));
  return found;
}
