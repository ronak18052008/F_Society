// lib/authenticity/storage.ts
// Feature 3: Authenticity Storage Adapter (Supabase with Local JSON Cache)

import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/client";
import { getPropertyById, getProperties } from "@/lib/supabase/properties";
import { properties as demoProperties } from "@/data/demo";
import { evaluatePropertyAuthenticity } from "./engine";
import type { AuthenticityAnalysis } from "@/types/authenticity";
import type { Property } from "@/types";

const LOCAL_STORAGE_FILE = path.join(process.cwd(), "src", "data", "authenticity-analyses.json");

function ensureFile(): Record<string, AuthenticityAnalysis> {
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
    console.error("[AuthenticityStorage] Error reading local store:", err);
    return {};
  }
}

function saveFile(store: Record<string, AuthenticityAnalysis>): void {
  try {
    const dir = path.dirname(LOCAL_STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("[AuthenticityStorage] Error saving local store:", err);
  }
}

export async function getPropertyWithFallback(propertyId: string): Promise<Property | null> {
  try {
    const prop = await getPropertyById(propertyId);
    if (prop) return prop;
  } catch (_) {}
  return demoProperties.find((p) => p.id === propertyId || p.slug === propertyId) || null;
}

export async function getAllPropertiesForCrossCheck(): Promise<Property[]> {
  const merged: Property[] = [...demoProperties];
  try {
    const fromDb = await getProperties({ pageSize: 100 });
    if (fromDb && fromDb.length > 0) {
      for (const p of fromDb) {
        if (!merged.some((m) => m.id === p.id)) {
          merged.push(p);
        }
      }
    }
  } catch (_) {}
  return merged;
}

export async function getAuthenticityAnalysisForProperty(
  propertyId: string
): Promise<AuthenticityAnalysis | null> {
  try {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("authenticity_analyses")
        .select("*, authenticity_signals(*)")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          propertyId: data.property_id,
          authenticityScore: data.authenticity_score,
          score: data.authenticity_score,
          status: data.status,
          confidence: data.confidence,
          confidenceScore: Number(data.confidence_score),
          explanation: data.explanation,
          verificationStatus: data.verification_status,
          priceAnomaly: Boolean(data.price_anomaly),
          duplicateWarning: Boolean(data.duplicate_warning),
          duplicateMatches: data.metadata?.duplicateMatches,
          suspiciousDescriptionFlags: data.suspicious_description_flags || [],
          missingInformation: data.missing_information || [],
          signals: (data.authenticity_signals || []).map((s: any) => ({
            id: s.id,
            code: s.code,
            title: s.title,
            category: s.category,
            severity: s.severity,
            scoreDeduction: s.score_deduction,
            explanation: s.explanation,
            evidence: s.evidence,
            source: s.source,
          })),
          whyThisResult: data.why_this_result || {},
          imageMetadata: data.metadata?.imageMetadata || {
            performedRealReverseSearch: false,
            method: "Multi-Listing Internal Asset Fingerprint & URL Matcher",
            duplicateAssetFound: false,
            notes: "Internal asset registry comparison only.",
          },
          timestamp: data.created_at,
        };
      }
    }
  } catch (_) {}

  // Fallback to local store
  const localStore = ensureFile();
  return localStore[propertyId] || null;
}

export async function saveAuthenticityAnalysisRecord(analysis: AuthenticityAnalysis): Promise<void> {
  // Always update local cache
  const localStore = ensureFile();
  localStore[analysis.propertyId] = analysis;
  saveFile(localStore);

  // Sync to Supabase if configured
  try {
    const supabase = createClient();
    if (supabase) {
      const { data: inserted, error } = await supabase
        .from("authenticity_analyses")
        .insert({
          property_id: analysis.propertyId,
          authenticity_score: analysis.authenticityScore,
          status: analysis.status,
          confidence: analysis.confidence,
          confidence_score: analysis.confidenceScore,
          explanation: analysis.explanation,
          verification_status: analysis.verificationStatus,
          price_anomaly: analysis.priceAnomaly,
          duplicate_warning: analysis.duplicateWarning,
          suspicious_description_flags: analysis.suspiciousDescriptionFlags || [],
          missing_information: analysis.missingInformation || [],
          why_this_result: analysis.whyThisResult,
          metadata: {
            duplicateMatches: analysis.duplicateMatches,
            imageMetadata: analysis.imageMetadata,
          },
        })
        .select("id")
        .single();

      if (!error && inserted && analysis.signals.length > 0) {
        await supabase.from("authenticity_signals").insert(
          analysis.signals.map((s) => ({
            analysis_id: inserted.id,
            property_id: analysis.propertyId,
            code: s.code,
            title: s.title,
            category: s.category,
            severity: s.severity,
            score_deduction: s.scoreDeduction,
            explanation: s.explanation,
            evidence: s.evidence,
            source: s.source,
          }))
        );
      }
    }
  } catch (err) {
    console.warn("[AuthenticityStorage] Supabase sync skipped:", err);
  }
}

export async function getOrComputeAuthenticityAnalysis(
  propertyId: string,
  providedProperty?: Property | null
): Promise<{ analysis: AuthenticityAnalysis | null; property: Property | null }> {
  let prop = providedProperty;
  if (!prop) {
    prop = await getPropertyWithFallback(propertyId);
  }

  if (!prop) {
    return { analysis: null, property: null };
  }

  const allProps = await getAllPropertiesForCrossCheck();
  const analysis = evaluatePropertyAuthenticity(prop, allProps);
  await saveAuthenticityAnalysisRecord(analysis);

  return { analysis, property: prop };
}
