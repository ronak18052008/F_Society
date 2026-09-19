// Property Reputation Storage and Persistence Service
// NESTORA Feature 6: Reputation Graph DB & Local Fallback Store

import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/client";
import { getPropertyById } from "@/lib/supabase/properties";
import { properties as demoProperties } from "@/data/demo";
import { synthesizePropertyReputationGraph } from "./engine";
import type { PropertyReputationGraph } from "@/types/reputation";
import type { Property } from "@/types";

export async function getPropertyWithFallback(propertyId: string): Promise<Property | null> {
  try {
    const prop = await getPropertyById(propertyId);
    if (prop) return prop;
  } catch (_) {}
  const found = demoProperties.find((p) => p.id === propertyId || p.slug === propertyId);
  return found || null;
}

const LOCAL_STORAGE_FILE = path.join(process.cwd(), "src", "data", "property-reputations.json");

function ensureFile(): Record<string, PropertyReputationGraph> {
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
    console.error("[ReputationStorage] Error reading local reputation store:", err);
    return {};
  }
}

function saveFile(store: Record<string, PropertyReputationGraph>): void {
  try {
    const dir = path.dirname(LOCAL_STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("[ReputationStorage] Error saving local reputation store:", err);
  }
}

export async function getReputationGraphForProperty(propertyId: string): Promise<PropertyReputationGraph | null> {
  // Check Supabase if client is ready
  try {
    const supabase = createClient();
    if (supabase) {
      const { data: nodes, error: nodeErr } = await supabase
        .from("property_reputation_nodes")
        .select("*")
        .eq("property_id", propertyId);

      if (!nodeErr && nodes && nodes.length > 0) {
        const { data: rels } = await supabase
          .from("property_reputation_relationships")
          .select("*")
          .eq("property_id", propertyId);

        const { data: signals } = await supabase
          .from("property_reputation_signals")
          .select("*")
          .eq("property_id", propertyId);

        // Load cached overall metadata from local file if available
        const localStore = ensureFile();
        if (localStore[propertyId]) {
          return localStore[propertyId];
        }
      }
    }
  } catch (_) {
    // Fall back to local file
  }

  const localStore = ensureFile();
  return localStore[propertyId] || null;
}

export async function saveReputationGraph(graph: PropertyReputationGraph): Promise<void> {
  // Save to local file
  const localStore = ensureFile();
  localStore[graph.propertyId] = graph;
  saveFile(localStore);

  // Attempt Supabase persistence
  try {
    const supabase = createClient();
    if (supabase) {
      // Upsert nodes
      for (const node of graph.nodes) {
        await supabase.from("property_reputation_nodes").upsert({
          id: `${graph.propertyId}_${node.id}`,
          property_id: graph.propertyId,
          entity_type: node.entityType,
          label: node.label,
          sublabel: node.sublabel,
          description: node.description,
          data_source: node.dataSource,
          confidence: node.confidence,
          confidence_score: node.confidenceScore,
          status: node.status,
          insufficient_data: node.insufficientData,
          score: node.score,
          evidence: node.evidence,
          metadata: node.metadata,
          pos_x: node.x,
          pos_y: node.y,
          updated_at: new Date().toISOString(),
        });
      }

      // Upsert relationships
      for (const rel of graph.relationships) {
        await supabase.from("property_reputation_relationships").upsert({
          id: `${graph.propertyId}_${rel.id}`,
          property_id: graph.propertyId,
          source_id: rel.sourceId,
          target_id: rel.targetId,
          relationship_type: rel.relationshipType,
          label: rel.label,
          description: rel.description,
          source_classification: rel.sourceClassification,
          confidence: rel.confidence,
          confidence_score: rel.confidenceScore,
          weight: rel.weight,
          evidence: rel.evidence,
        });
      }

      // Upsert signals
      for (const sig of graph.signals) {
        await supabase.from("property_reputation_signals").upsert({
          id: `${graph.propertyId}_${sig.id}`,
          property_id: graph.propertyId,
          code: sig.code,
          title: sig.title,
          entity_type: sig.entityType,
          classification: sig.classification,
          score_effect: sig.scoreEffect,
          description: sig.description,
          traceable_source: sig.traceableSource,
          confidence: sig.confidence,
          evidence: sig.evidence,
        });
      }
    }
  } catch (err) {
    // Non-blocking fallback
    console.warn("[ReputationStorage] Supabase sync skipped, local file persisted:", err);
  }
}

export async function getOrComputeReputationGraph(propertyId: string): Promise<{
  graph: PropertyReputationGraph | null;
  property: Property | null;
}> {
  const property = await getPropertyWithFallback(propertyId);
  if (!property) {
    return { graph: null, property: null };
  }

  // Synthesize deterministic reputation graph
  const graph = synthesizePropertyReputationGraph(property);
  await saveReputationGraph(graph);

  return { graph, property };
}
