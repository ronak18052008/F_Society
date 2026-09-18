import { NextRequest, NextResponse } from "next/server";
import { getProperties } from "@/lib/supabase/properties";
import { matchProperties, parseRequirements } from "@/lib/recommend";
import type { ParsedRequirements } from "@/lib/recommend";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 4) {
      return NextResponse.json(
        { error: "Please provide a more descriptive query." },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    let requirements: ParsedRequirements;
    let aiPowered = false;

    if (geminiApiKey) {
      try {
        const aiPrompt = `You are a real estate requirement extraction AI for an Indian rental platform.
Extract structured rental requirements from this user query:
"${prompt}"

Return ONLY a valid JSON object matching this TypeScript interface without any markdown formatting or code blocks:
{
  "city": string | null, // (e.g. "Ahmedabad", "Bengaluru", "Mumbai", "Pune")
  "budget": number | null, // in Indian Rupees (INR)
  "furnishing": "furnished" | "semi-furnished" | "unfurnished" | null,
  "type": "apartment" | "studio" | "villa" | "independent-floor" | null,
  "suitability": "working-professional" | "student" | "family" | "shared" | null
}`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: aiPrompt }] }],
              generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (res.ok) {
          const geminiData = await res.json();
          const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsedJson = JSON.parse(text);
            requirements = {
              raw: prompt,
              city: parsedJson.city || undefined,
              budget: parsedJson.budget ? Number(parsedJson.budget) : undefined,
              furnishing: parsedJson.furnishing || undefined,
              type: parsedJson.type || undefined,
              nearCollege: Boolean(parsedJson.nearCollege),
              shared: Boolean(parsedJson.shared),
            };
            aiPowered = true;
          } else {
            requirements = parseRequirements(prompt);
          }
        } else {
          requirements = parseRequirements(prompt);
        }
      } catch (aiErr) {
        console.warn("Gemini parsing error, falling back to regex:", aiErr);
        requirements = parseRequirements(prompt);
      }
    } else {
      requirements = parseRequirements(prompt);
    }

    // Fetch properties from Supabase / inventory
    const allProperties = await getProperties();
    const matched = matchProperties(allProperties, requirements);

    return NextResponse.json({
      requirements,
      matches: matched,
      aiPowered,
    });
  } catch (error) {
    console.error("AI recommend error:", error);
    return NextResponse.json(
      { error: "Internal error processing recommendations" },
      { status: 500 }
    );
  }
}
