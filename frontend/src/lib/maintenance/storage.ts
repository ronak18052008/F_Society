// lib/maintenance/storage.ts
// Feature 4: Maintenance Triage Persistence (Supabase with Local JSON Cache)

import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/client";
import type { MaintenanceTriageResult } from "@/types/maintenance";

const LOCAL_STORAGE_FILE = path.join(process.cwd(), "src", "data", "maintenance-triage.json");

function ensureFile(): MaintenanceTriageResult[] {
  try {
    const dir = path.dirname(LOCAL_STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_STORAGE_FILE)) {
      fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    const data = fs.readFileSync(LOCAL_STORAGE_FILE, "utf-8");
    return JSON.parse(data) || [];
  } catch (err) {
    console.error("[MaintenanceStorage] Error reading local triage store:", err);
    return [];
  }
}

function saveFile(store: MaintenanceTriageResult[]): void {
  try {
    const dir = path.dirname(LOCAL_STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("[MaintenanceStorage] Error saving local triage store:", err);
  }
}

export async function saveMaintenanceTriageRecord(record: MaintenanceTriageResult): Promise<void> {
  // Always update local cache
  const localList = ensureFile();
  localList.unshift(record);
  // Keep last 100 entries locally
  if (localList.length > 100) localList.length = 100;
  saveFile(localList);

  // Sync to Supabase if configured
  try {
    const supabase = createClient();
    if (supabase) {
      await supabase.from("maintenance_triage_records").insert({
        property_id: record.propertyId || null,
        category: record.category,
        severity: record.severity,
        urgency: record.urgency,
        confidence: record.confidence,
        confidence_score: record.confidenceScore,
        summary: record.summary,
        suggested_actions: record.suggestedActions,
        recommended_next_step: record.recommendedNextStep,
        requires_immediate_attention: record.requiresImmediateAttention,
        room: record.room || null,
        issue_duration: record.issueDuration || null,
        has_image: record.hasImage,
        disclaimer: record.disclaimer,
        provider: record.provider,
        metadata: {
          safetyHazards: record.safetyHazards,
          estimatedResolutionTime: record.estimatedResolutionTime,
        },
      });
    }
  } catch (err) {
    console.warn("[MaintenanceStorage] Supabase sync skipped:", err);
  }
}

export async function getMaintenanceTriageRecords(propertyId?: string): Promise<MaintenanceTriageResult[]> {
  try {
    const supabase = createClient();
    if (supabase) {
      let query = supabase.from("maintenance_triage_records").select("*").order("created_at", { ascending: false }).limit(20);
      if (propertyId) {
        query = query.eq("property_id", propertyId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          category: d.category,
          severity: d.severity,
          urgency: d.urgency,
          confidence: d.confidence,
          confidenceScore: Number(d.confidence_score),
          summary: d.summary,
          suggestedActions: d.suggested_actions || [],
          recommendedNextStep: d.recommended_next_step,
          requiresImmediateAttention: Boolean(d.requires_immediate_attention),
          room: d.room,
          issueDuration: d.issue_duration,
          hasImage: Boolean(d.has_image),
          safetyHazards: d.metadata?.safetyHazards,
          estimatedResolutionTime: d.metadata?.estimatedResolutionTime,
          disclaimer: d.disclaimer,
          provider: d.provider,
          propertyId: d.property_id,
          timestamp: d.created_at,
        }));
      }
    }
  } catch (_) {}

  // Fallback to local store
  const localList = ensureFile();
  if (propertyId) {
    return localList.filter((r) => r.propertyId === propertyId);
  }
  return localList;
}
