import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/client";
import { getPropertyById } from "@/lib/supabase/properties";
import { properties as demoProperties } from "@/data/demo";
import { evaluateRentalRisk } from "./engine";
import type { RiskAnalysis } from "@/types/risk";
import type { Property } from "@/types";

export async function getPropertyWithDemoFallback(propertyId: string): Promise<Property | null> {
  try {
    const prop = await getPropertyById(propertyId);
    if (prop) return prop;
  } catch (_) {}
  const found = demoProperties.find((p) => p.id === propertyId || p.slug === propertyId);
  return found || null;
}

const LOCAL_STORAGE_FILE = path.join(process.cwd(), "src", "data", "risk-analyses.json");

function ensureFile(): Record<string, RiskAnalysis> {
  try {
    const dir = path.dirname(LOCAL_STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_STORAGE_FILE)) {
      fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify({}, null, 2), "utf-8");
      return {};
    }
    const data = fs.readFileSync(LOCAL_STORAGE_FILE, "utf-8");
    return JSON.parse(data) || {};
  } catch (err) {
    console.error("[RiskStorage] Error reading local risk store:", err);
    return {};
  }
}

function saveFile(store: Record<string, RiskAnalysis>): void {
  try {
    const dir = path.dirname(LOCAL_STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("[RiskStorage] Error saving local risk store:", err);
  }
}

export async function getRiskAnalysisForProperty(propertyId: string): Promise<RiskAnalysis | null> {
  try {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("risk_analyses")
        .select("*, risk_signals(*)")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          propertyId: data.property_id,
          score: data.score,
          riskScore: data.score,
          riskLevel: data.risk_level,
          confidence: data.confidence,
          confidenceScore: Number(data.confidence_score),
          explanation: data.explanation,
          evidence: (data.risk_signals || []).map((s: any) => s.evidence).filter(Boolean),
          signals: (data.risk_signals || []).map((s: any) => ({ ...s, scoreImpact: s.impact_points || s.impactPoints })),
          verificationStatus: data.verification_status,
          engineVersion: data.engine_version,
          insufficientData: Boolean(data.insufficient_data),
          missingFields: data.missing_fields || [],
          whyThisScore: data.why_this_score || {},
          timestamp: data.created_at,
        };
      }
    }
  } catch (_) {}

  // Fallback to local persistent cache
  const localStore = ensureFile();
  return localStore[propertyId] || null;
}

export async function saveRiskAnalysisRecord(analysis: RiskAnalysis): Promise<void> {
  // Always update local cache
  const localStore = ensureFile();
  localStore[analysis.propertyId] = analysis;
  saveFile(localStore);

  // Sync with Supabase if available
  try {
    const supabase = createClient();
    if (supabase) {
      const { data: insertedAnalysis, error } = await supabase
        .from("risk_analyses")
        .insert({
          property_id: analysis.propertyId,
          score: analysis.score,
          risk_level: analysis.riskLevel,
          confidence: analysis.confidence,
          confidence_score: analysis.confidenceScore,
          explanation: analysis.explanation,
          verification_status: analysis.verificationStatus,
          engine_version: analysis.engineVersion,
          insufficient_data: analysis.insufficientData,
          missing_fields: analysis.missingFields || [],
          why_this_score: analysis.whyThisScore,
        })
        .select("id")
        .single();

      if (!error && insertedAnalysis && analysis.signals.length > 0) {
        await supabase.from("risk_signals").insert(
          analysis.signals.map((s) => ({
            analysis_id: insertedAnalysis.id,
            property_id: analysis.propertyId,
            code: s.code,
            title: s.title,
            category: s.category,
            severity: s.severity,
            impact_points: s.impactPoints,
            explanation: s.explanation,
            evidence: s.evidence,
            source: s.source,
          }))
        );
      }
    }
  } catch (err) {
    console.warn("[RiskStorage] Supabase sync skipped or failed:", err);
  }
}

export async function getOrComputeRiskAnalysis(
  propertyId: string,
  providedProperty?: Property | null
): Promise<{ analysis: RiskAnalysis | null; property: Property | null }> {
  // 1. Fetch property if not provided
  let prop = providedProperty;
  if (!prop) {
    prop = await getPropertyWithDemoFallback(propertyId);
  }

  if (!prop) {
    return { analysis: null, property: null };
  }

  // 2. Deterministically evaluate risk
  const analysis = evaluateRentalRisk(prop);

  // 3. Persist analysis
  await saveRiskAnalysisRecord(analysis);

  return { analysis, property: prop };
}
