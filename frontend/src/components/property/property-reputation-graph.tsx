"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { Property } from "@/types";
import type {
  PropertyReputationGraph,
  ReputationNode,
  ReputationRelationship,
  ReputationDataSource,
  ReputationEntityType,
  ReputationSignal,
} from "@/types/reputation";
import { cn } from "@/lib/cn";
import { Modal } from "@/components/ui/modal";

interface PropertyReputationGraphProps {
  propertyId: string;
  property?: Property | null;
  className?: string;
}

export function PropertyReputationGraph({
  propertyId,
  property,
  className,
}: PropertyReputationGraphProps) {
  const [graph, setGraph] = useState<PropertyReputationGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interaction States
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("node-property");
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<string>("ALL");
  const [showSignalsModal, setShowSignalsModal] = useState(false);

  // Pan and Zoom transform states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Fetch reputation telemetry
  useEffect(() => {
    let active = true;
    async function loadGraph() {
      if (!propertyId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/properties/${encodeURIComponent(propertyId)}/reputation`);
        const json = await res.json();
        if (active) {
          if (res.ok && json.success && json.data) {
            setGraph(json.data);
          } else {
            setError(json.error || "Unable to fetch reputation telemetry");
          }
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Network error");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadGraph();
    return () => {
      active = false;
    };
  }, [propertyId]);

  // Selected Node & Relationship lookups
  const selectedNode = useMemo(() => {
    if (!graph || !selectedNodeId) return null;
    return graph.nodes.find((n) => n.id === selectedNodeId) || null;
  }, [graph, selectedNodeId]);

  const selectedRelationship = useMemo(() => {
    if (!graph || !selectedRelationshipId) return null;
    return graph.relationships.find((r) => r.id === selectedRelationshipId) || null;
  }, [graph, selectedRelationshipId]);

  // Connected Relationships for the selected node
  const connectedRelationships = useMemo(() => {
    if (!graph || !selectedNodeId) return [];
    return graph.relationships.filter(
      (r) => r.sourceId === selectedNodeId || r.targetId === selectedNodeId
    );
  }, [graph, selectedNodeId]);

  // Handle Pan & Zoom
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Only left click drags
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.5), 2.2));
  };

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNodeId("node-property");
    setSelectedRelationshipId(null);
  };

  // Helper entity icons
  const getEntityIcon = (type: ReputationEntityType) => {
    switch (type) {
      case "PROPERTY":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        );
      case "LANDLORD":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        );
      case "VERIFICATION":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        );
      case "REVIEWS":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        );
      case "MAINTENANCE":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
        );
      case "LOCATION":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
        );
      case "RESIDENT EXPERIENCE":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        );
      case "LISTING HISTORY":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        );
      default:
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        );
    }
  };

  // Color badge for classification
  const getClassificationBadge = (source: ReputationDataSource) => {
    switch (source) {
      case "VERIFIED DATA":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success)]/15 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[var(--success)] border border-[var(--success)]/30">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
            VERIFIED DATA
          </span>
        );
      case "USER-GENERATED DATA":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-sky-800 dark:text-sky-300 border border-sky-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            USER-GENERATED DATA
          </span>
        );
      case "AI-DERIVED SIGNAL":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-purple-800 dark:text-purple-300 border border-purple-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            AI-DERIVED SIGNAL
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className={cn("rounded-3xl border border-[var(--border)] bg-card p-6 shadow-card animate-pulse", className)}>
        <div className="flex items-center justify-between">
          <div className="h-6 w-56 rounded bg-black/10 dark:bg-white/10" />
          <div className="h-7 w-32 rounded-full bg-black/10 dark:bg-white/10" />
        </div>
        <div className="mt-6 h-80 rounded-2xl bg-black/5 dark:bg-white/5" />
      </div>
    );
  }

  if (error || !graph) {
    return (
      <div className={cn("rounded-3xl border border-rose-200 bg-rose-50/70 dark:bg-rose-950/20 dark:border-rose-900/40 p-6 text-xs text-rose-700 dark:text-rose-300", className)}>
        <div className="flex items-center gap-2 font-bold mb-1">
          <span>⚠️</span>
          <span>Property Reputation Telemetry Offline</span>
        </div>
        <p>{error || "Unable to synthesize reputation graph for this property."}</p>
      </div>
    );
  }

  // Filter nodes according to source filter
  const isNodeDimmed = (node: ReputationNode) => {
    if (filterSource === "ALL") return false;
    return node.dataSource !== filterSource;
  };

  return (
    <div className={cn("rounded-3xl border border-[var(--accent-forest)]/30 bg-card p-6 shadow-card transition-all", className)}>
      {/* Header & Graph Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--accent-forest)]/20 text-[var(--text-main)]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-bold text-ink">Property Reputation Graph</h3>
                <span className="rounded-full bg-[var(--accent-forest)]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-main)] border border-[var(--accent-forest)]/30">
                  Feature 6
                </span>
              </div>
              <p className="text-xs text-ink-muted">
                Interactive Multi-Entity Telemetry & Verifiable Provenance Map
              </p>
            </div>
          </div>
        </div>

        {/* Global Confidence & Score Pill */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-3.5 py-1.5 text-xs shadow-xs">
            <span className="text-ink-muted text-[11px]">Reputation Score:</span>
            <span className="font-bold text-ink font-tabular text-sm">
              {graph.overallScore} / 100
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-[var(--accent-forest)]/40 bg-[var(--accent-forest)]/10 px-3.5 py-1.5 text-xs">
            <span className="text-[var(--text-muted)] text-[11px]">Confidence:</span>
            <span className="font-bold text-[var(--text-main)]">
              {graph.overallConfidence} ({Math.round(graph.confidenceScore * 100)}%)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowSignalsModal(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-card hover:bg-surface border border-line px-3.5 py-1.5 text-xs font-semibold text-ink shadow-xs transition"
          >
            <span>Audit Signals ({graph.signals.length})</span>
            <span className="text-xs">→</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar & Data Provenance Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mr-1">Filter View:</span>
          <button
            type="button"
            onClick={() => setFilterSource("ALL")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition shadow-xs",
              filterSource === "ALL"
                ? "bg-[var(--accent-forest)] text-white"
                : "bg-surface hover:bg-line border border-line text-ink"
            )}
          >
            All 8 Entities
          </button>
          <button
            type="button"
            onClick={() => setFilterSource("VERIFIED DATA")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition shadow-xs",
              filterSource === "VERIFIED DATA"
                ? "bg-emerald-600 text-white"
                : "bg-surface hover:bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
            )}
          >
            VERIFIED DATA ({graph.telemetry.verifiedDataCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterSource("USER-GENERATED DATA")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition shadow-xs",
              filterSource === "USER-GENERATED DATA"
                ? "bg-sky-600 text-white"
                : "bg-surface hover:bg-sky-500/10 border border-sky-500/30 text-sky-700 dark:text-sky-300"
            )}
          >
            USER-GENERATED ({graph.telemetry.userGeneratedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterSource("AI-DERIVED SIGNAL")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition shadow-xs",
              filterSource === "AI-DERIVED SIGNAL"
                ? "bg-purple-600 text-white"
                : "bg-surface hover:bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300"
            )}
          >
            AI-DERIVED ({graph.telemetry.aiDerivedCount})
          </button>
        </div>

        {/* Zoom & Navigation Controls */}
        <div className="flex items-center gap-1.5 bg-surface border border-line rounded-2xl p-1 shadow-xs">
          <button
            type="button"
            title="Zoom In"
            onClick={() => setZoom((z) => Math.min(z + 0.15, 2.2))}
            className="h-7 w-7 rounded-xl flex items-center justify-center font-bold text-ink hover:bg-line transition"
          >
            +
          </button>
          <span className="text-[11px] font-tabular font-semibold text-ink-muted px-1">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            title="Zoom Out"
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.5))}
            className="h-7 w-7 rounded-xl flex items-center justify-center font-bold text-ink hover:bg-line transition"
          >
            -
          </button>
          <button
            type="button"
            title="Reset View"
            onClick={resetZoom}
            className="h-7 px-2 rounded-xl flex items-center justify-center text-[10px] font-bold text-ink hover:bg-line transition"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Graph Viewport & Inspector Side-by-Side */}
      <div className="mt-5 grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        {/* SVG Canvas Area */}
        <div className="relative overflow-hidden rounded-2xl border border-line bg-[var(--bg-canvas)]/60 shadow-inner h-[480px]">
          {/* Subtle Grid Pattern */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(var(--accent-forest) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Pan / Drag Hint */}
          <div className="absolute top-3 left-3 pointer-events-none rounded-xl bg-card/85 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-[var(--text-muted)] border border-line/60 shadow-xs">
            Drag to pan · Scroll to zoom · Click node to inspect
          </div>

          <svg
            ref={svgRef}
            className={cn(
              "w-full h-full select-none",
              isDragging ? "cursor-grabbing" : "cursor-grab"
            )}
            viewBox="0 0 800 600"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <defs>
              <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-forest)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="var(--accent-forest-hover)" stopOpacity="0.4" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Transform Group for Pan & Zoom */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* RELATIONSHIP EDGES */}
              {graph.relationships.map((rel) => {
                const source = graph.nodes.find((n) => n.id === rel.sourceId);
                const target = graph.nodes.find((n) => n.id === rel.targetId);
                if (!source || !target || source.x === undefined || source.y === undefined || target.x === undefined || target.y === undefined) {
                  return null;
                }

                const isConnected =
                  rel.id === selectedRelationshipId ||
                  rel.sourceId === selectedNodeId ||
                  rel.targetId === selectedNodeId;

                const isDimmed = filterSource !== "ALL" && rel.sourceClassification !== filterSource;

                // Midpoint for relationship label chip
                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2;

                return (
                  <g key={rel.id} className="transition-opacity">
                    {/* Connection Line */}
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={
                        rel.sourceClassification === "VERIFIED DATA"
                          ? "var(--success)"
                          : rel.sourceClassification === "USER-GENERATED DATA"
                          ? "#0ea5e9"
                          : "#8b5cf6"
                      }
                      strokeWidth={isConnected ? 3 : 1.75}
                      strokeDasharray={rel.confidence === "LOW" ? "4 4" : undefined}
                      opacity={isDimmed ? 0.15 : isConnected ? 1 : 0.45}
                      className="cursor-pointer transition-all hover:stroke-width-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRelationshipId(rel.id);
                      }}
                    />

                    {/* Edge Label on Midpoint */}
                    <g
                      transform={`translate(${midX}, ${midY})`}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRelationshipId(rel.id);
                      }}
                    >
                      <rect
                        x="-45"
                        y="-10"
                        width="90"
                        height="20"
                        rx="10"
                        className={cn(
                          "transition-all",
                          rel.id === selectedRelationshipId
                            ? "fill-[var(--accent-forest)] stroke-white stroke-1 shadow-md"
                            : "fill-white dark:fill-[var(--bg-surface-elevated)] stroke-line/60 stroke-1"
                        )}
                        opacity={isDimmed ? 0.2 : isConnected ? 1 : 0.85}
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="600"
                        className={cn(
                          rel.id === selectedRelationshipId
                            ? "fill-white"
                            : "fill-neutral-700 dark:fill-neutral-200"
                        )}
                      >
                        {rel.label.length > 14 ? rel.label.slice(0, 13) + "…" : rel.label}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* GRAPH NODES */}
              {graph.nodes.map((node) => {
                if (node.x === undefined || node.y === undefined) return null;
                const isSelected = node.id === selectedNodeId;
                const isDimmed = isNodeDimmed(node);
                const isInsufficient = node.insufficientData || node.status === "insufficient_data";
                const isProperty = node.entityType === "PROPERTY";

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className={cn(
                      "cursor-pointer transition-all",
                      isDimmed ? "opacity-25" : "opacity-100"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                      setSelectedRelationshipId(null);
                    }}
                  >
                    {/* Selection halo */}
                    {isSelected && (
                      <circle
                        r={isProperty ? 44 : 34}
                        className="fill-[var(--accent-forest)]/20 stroke-[var(--accent-forest)] stroke-2 animate-pulse"
                      />
                    )}

                    {/* Outer Circle Container */}
                    <circle
                      r={isProperty ? 38 : 28}
                      className={cn(
                        "transition-all",
                        isInsufficient
                          ? "fill-[var(--warning)]/10 stroke-[var(--warning)] stroke-2 stroke-dasharray-4"
                          : node.dataSource === "VERIFIED DATA"
                          ? "fill-[var(--success)]/10 stroke-[var(--success)] stroke-2"
                          : node.dataSource === "USER-GENERATED DATA"
                          ? "fill-sky-50 dark:fill-sky-950/40 stroke-sky-500 stroke-2"
                          : "fill-purple-50 dark:fill-purple-950/40 stroke-purple-500 stroke-2"
                      )}
                      strokeDasharray={isInsufficient ? "4 3" : undefined}
                    />

                    {/* Node Center Icon SVG */}
                    <g
                      transform={isProperty ? "translate(-12, -12)" : "translate(-9, -9)"}
                      className={cn(
                        isInsufficient
                          ? "text-[var(--warning)]"
                          : node.dataSource === "VERIFIED DATA"
                          ? "text-[var(--success)]"
                          : node.dataSource === "USER-GENERATED DATA"
                          ? "text-sky-700 dark:text-sky-400"
                          : "text-purple-700 dark:text-purple-400"
                      )}
                    >
                      <svg
                        className={isProperty ? "w-6 h-6" : "w-[18px] h-[18px]"}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {getEntityIcon(node.entityType)}
                      </svg>
                    </g>

                    {/* Node Label Below */}
                    <text
                      x="0"
                      y={isProperty ? 54 : 44}
                      textAnchor="middle"
                      fontSize={isProperty ? "12" : "10"}
                      fontWeight="700"
                      className="fill-ink drop-shadow-xs"
                    >
                      {node.entityType}
                    </text>

                    {/* Secondary Status Badge / Label */}
                    <text
                      x="0"
                      y={isProperty ? 67 : 56}
                      textAnchor="middle"
                      fontSize="8.5"
                      fontWeight="500"
                      className={cn(
                        isInsufficient
                          ? "fill-[var(--warning)] font-bold"
                          : "fill-ink-muted"
                      )}
                    >
                      {isInsufficient
                        ? "Insufficient verified data"
                        : node.label.length > 20
                        ? node.label.slice(0, 18) + "…"
                        : node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* INSPECTOR DRAWER: Interactive Details on Selected Node / Edge */}
        <div className="flex flex-col rounded-2xl border border-line bg-card p-5 shadow-xs overflow-hidden">
          {selectedRelationship ? (
            // Relationship Inspector View
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Relationship Inspection
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedRelationshipId(null)}
                  className="text-xs font-semibold text-[var(--accent-forest)] hover:underline"
                >
                  Close
                </button>
              </div>

              <div>
                <h4 className="text-base font-serif font-bold text-ink">
                  {selectedRelationship.label}
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                  {selectedRelationship.relationshipType}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {getClassificationBadge(selectedRelationship.sourceClassification)}
                <span className="rounded-full bg-surface border border-line px-2.5 py-0.5 text-[10px] font-bold text-ink">
                  Weight: {selectedRelationship.weight} / 10
                </span>
                <span className="rounded-full bg-surface border border-line px-2.5 py-0.5 text-[10px] font-bold text-ink">
                  Confidence: {selectedRelationship.confidence} ({Math.round(selectedRelationship.confidenceScore * 100)}%)
                </span>
              </div>

              <p className="text-xs text-ink leading-relaxed bg-surface/70 border border-line/60 rounded-xl p-3">
                {selectedRelationship.description}
              </p>

              {/* Evidence for this relationship */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  Verifiable Evidence & Source
                </h5>
                <div className="space-y-2">
                  {selectedRelationship.evidence.map((ev) => (
                    <div key={ev.id} className="rounded-xl border border-line bg-surface/50 p-3 text-xs">
                      <div className="flex items-center justify-between font-semibold text-ink">
                        <span>{ev.source}</span>
                        {ev.verified ? (
                          <span className="text-[var(--success)] text-[10px]">✓ Certified</span>
                        ) : (
                          <span className="text-[var(--warning)] text-[10px]">Uncertified</span>
                        )}
                      </div>
                      <p className="mt-1 text-[var(--text-muted)] leading-relaxed">{ev.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : selectedNode ? (
            // Node Inspector View
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Entity Inspector · {selectedNode.entityType}
                </span>
                {selectedNode.score !== undefined && (
                  <span className="rounded-full bg-[var(--accent-forest)]/15 px-2.5 py-0.5 text-xs font-bold text-[var(--text-main)]">
                    Entity Score: {selectedNode.score}/100
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-base font-serif font-bold text-[var(--text-main)]">
                  {selectedNode.label}
                </h4>
                {selectedNode.sublabel && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{selectedNode.sublabel}</p>
                )}
              </div>

              {/* Classification & Confidence Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {getClassificationBadge(selectedNode.dataSource)}
                <span className="rounded-full bg-surface border border-line px-2.5 py-0.5 text-[10px] font-bold text-[var(--text-main)]">
                  Confidence: {selectedNode.confidence} ({Math.round(selectedNode.confidenceScore * 100)}%)
                </span>
              </div>

              {/* Zero-Fabrication Alert for Insufficient Data */}
              {(selectedNode.insufficientData || selectedNode.status === "insufficient_data") && (
                <div className="rounded-xl border border-[var(--warning)]/50 bg-[var(--warning)]/10 p-3 text-xs text-[var(--warning)]">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <span>⚠️</span>
                    <span>Insufficient Verified Data</span>
                  </div>
                  <p className="leading-relaxed">
                    Zero verified records exist in the repository for this entity. Nestora enforces a strict zero-fabrication policy and never synthesizes fictitious reviews, ratings, or complaints.
                  </p>
                </div>
              )}

              {/* Node Summary Description */}
              <p className="text-xs text-[var(--text-main)] leading-relaxed bg-surface/70 border border-line/60 rounded-xl p-3">
                {selectedNode.description}
              </p>

              {/* Connected Relationships with click-to-inspect */}
              <div>
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  Connected Relationships ({connectedRelationships.length})
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {connectedRelationships.map((rel) => {
                    const otherNodeId = rel.sourceId === selectedNode.id ? rel.targetId : rel.sourceId;
                    const otherNode = graph.nodes.find((n) => n.id === otherNodeId);
                    return (
                      <button
                        key={rel.id}
                        type="button"
                        onClick={() => setSelectedRelationshipId(rel.id)}
                        className="rounded-lg border border-line bg-surface hover:bg-line/80 px-2.5 py-1 text-[11px] font-medium text-[var(--text-main)] transition shadow-2xs"
                      >
                        <span>{rel.label}</span>
                        <span className="text-[var(--text-muted)] ml-1">({otherNode?.entityType})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Traceable Evidence Drawer */}
              <div>
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  Verifiable Evidence & Audit Trail
                </h5>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedNode.evidence.map((ev) => (
                    <div key={ev.id} className="rounded-xl border border-line bg-surface/50 p-2.5 text-xs">
                      <div className="flex items-center justify-between font-semibold text-ink">
                        <span>{ev.source}</span>
                        {ev.timestamp && (
                          <span className="text-[10px] text-[var(--text-muted)] font-tabular">{ev.timestamp}</span>
                        )}
                      </div>
                      <p className="mt-1 text-[var(--text-muted)] leading-relaxed">{ev.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-ink-muted">
              <span className="text-2xl mb-2">🔍</span>
              <p className="text-xs font-semibold text-[var(--text-main)]">Select Any Graph Node</p>
              <p className="text-[11px] mt-1">
                Click any of the 8 entities or connecting relationships to inspect verified evidence and confidence metrics.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER NOTICE ON ZERO-FABRICATION INTEGRITY */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
          <span>
            Strict Provenance Audit Enabled · Zero Synthetic Feedback Guarantee
          </span>
        </div>
        <div className="font-mono text-[11px]">
          Engine: {graph.telemetry.engineVersion}
        </div>
      </div>

      {/* MODAL: Traceable AI Signals & Audit Ledger */}
      <Modal
        open={showSignalsModal}
        onClose={() => setShowSignalsModal(false)}
        title="Traceable AI Signals & Provenance Audit"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[var(--text-muted)] leading-relaxed">
            Every signal influencing the property reputation index is strictly grounded in verifiable records, telemetry algorithms, or transparent zero-fabrication notices.
          </p>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {graph.signals.map((sig) => (
              <div
                key={sig.id}
                className="rounded-2xl border border-line bg-card p-4 shadow-card"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-[var(--text-main)] text-sm">
                      {sig.title}
                    </span>
                    <span className="rounded-full bg-surface border border-line px-2 py-0.5 text-[10px] font-mono text-[var(--text-muted)]">
                      {sig.code}
                    </span>
                  </div>
                  {getClassificationBadge(sig.classification)}
                </div>

                <p className="mt-2 text-[var(--text-main)] leading-relaxed">{sig.description}</p>

                <div className="mt-3 grid gap-2 rounded-xl bg-surface/70 border border-line/60 p-3 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Affected Entity:</span>
                    <strong className="text-[var(--text-main)]">{sig.entityType}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Traceable Source:</span>
                    <span className="font-mono text-[var(--text-main)] text-right max-w-xs truncate">
                      {sig.traceableSource}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Signal Confidence:</span>
                    <strong className="text-[var(--text-main)]">
                      {Math.round(sig.confidence * 100)}%
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowSignalsModal(false)}
              className="rounded-full bg-[var(--accent-forest)] hover:bg-[var(--accent-forest-hover)] px-5 py-2 text-xs font-semibold text-white shadow-xs transition"
            >
              Close Audit
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
