"use client";

import { useState, useEffect } from "react";
import type { RiskAnalysis, RiskLevel, RiskSeverity } from "@/types/risk";
import type { Property } from "@/types";
import { cn } from "@/lib/cn";
import { Modal } from "@/components/ui/modal";

interface RentalRiskCardProps {
  propertyId: string;
  property?: Property | null;
  className?: string;
}

export function RentalRiskCard({ propertyId, property, className }: RentalRiskCardProps) {
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [activeSignalFilter, setActiveSignalFilter] = useState<string>("all");

  useEffect(() => {
    let active = true;

    async function fetchRisk() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/properties/${encodeURIComponent(propertyId)}/risk`);
        const data = await res.json();
        if (active) {
          if (res.ok && data.success && data.analysis) {
            setAnalysis(data.analysis);
          } else {
            setError(data.error || "Unable to fetch rental risk telemetry");
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

    if (propertyId) {
      fetchRisk();
    }

    return () => {
      active = false;
    };
  }, [propertyId]);

  if (loading) {
    return (
      <div className={cn("rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card p-6 shadow-card animate-pulse", className)}>
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 rounded bg-black/10 dark:bg-white/10" />
          <div className="h-6 w-20 rounded-full bg-black/10 dark:bg-white/10" />
        </div>
        <div className="mt-4 h-16 rounded-2xl bg-black/5 dark:bg-white/5" />
        <div className="mt-4 space-y-2">
          <div className="h-4 w-full rounded bg-black/5 dark:bg-white/5" />
          <div className="h-4 w-3/4 rounded bg-black/5 dark:bg-white/5" />
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className={cn("rounded-3xl border border-rose-200 bg-rose-50/70 dark:bg-rose-950/20 dark:border-rose-900/40 p-6 text-xs text-rose-700 dark:text-rose-300", className)}>
        <div className="flex items-center gap-2 font-bold mb-1">
          <span>⚠️</span>
          <span>Rental Risk Telemetry Offline</span>
        </div>
        <p>{error || "Unable to load risk analysis for this residence."}</p>
      </div>
    );
  }

  // Handle Insufficient Data state
  if (analysis.insufficientData || analysis.riskLevel === "INSUFFICIENT_DATA") {
    return (
      <div className={cn("rounded-3xl border border-amber-300 bg-amber-50/80 dark:bg-amber-950/25 dark:border-amber-900/50 p-6 shadow-card", className)}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 dark:border-amber-900/50 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold text-lg">
              ⚠️
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-ink">Rental Risk Analysis</h3>
              <p className="text-xs text-ink-muted">Deterministic Risk Evaluation Engine</p>
            </div>
          </div>
          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 border border-amber-500/30">
            Insufficient data
          </span>
        </div>

        <div className="mt-4 text-xs text-ink-muted leading-relaxed">
          <p className="font-semibold text-ink mb-1">{analysis.explanation}</p>
          <p>
            Missing parameters:{" "}
            <strong className="text-amber-700 dark:text-amber-400 font-mono">
              {analysis.missingFields?.join(", ") || "essential financial or spatial details"}
            </strong>
          </p>
          <p className="mt-2 text-[11px] opacity-80">
            Engine Version: {analysis.engineVersion} · Evaluated: {new Date(analysis.timestamp).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }

  const riskBadgeStyles: Record<RiskLevel, { badge: string; ring: string; text: string; bg: string }> = {
    LOW: {
      badge: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
      ring: "border-emerald-500 text-emerald-700 dark:text-emerald-400",
      text: "Low Risk · High Compliance",
      bg: "bg-emerald-500/10",
    },
    MODERATE: {
      badge: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
      ring: "border-amber-500 text-amber-700 dark:text-amber-400",
      text: "Moderate Risk · Standard Precautions",
      bg: "bg-amber-500/10",
    },
    HIGH: {
      badge: "bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30",
      ring: "border-orange-500 text-orange-700 dark:text-orange-400",
      text: "High Risk · Review Clauses Carefully",
      bg: "bg-orange-500/10",
    },
    CRITICAL: {
      badge: "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30",
      ring: "border-rose-600 text-rose-700 dark:text-rose-400",
      text: "Critical Risk · Severe Anomalies Detected",
      bg: "bg-rose-500/10",
    },
    INSUFFICIENT_DATA: {
      badge: "bg-slate-500/15 text-slate-800 dark:text-slate-300 border-slate-500/30",
      ring: "border-slate-500 text-slate-700 dark:text-slate-400",
      text: "Insufficient Data",
      bg: "bg-slate-500/10",
    },
  };

  const severityBadge = (sev: RiskSeverity) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300";
      case "HIGH":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 border-orange-300";
      case "MEDIUM":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300";
      case "LOW":
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200";
      case "SAFE":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300";
    }
  };

  const currentBadge = riskBadgeStyles[analysis.riskLevel];

  const filteredSignals =
    activeSignalFilter === "all"
      ? analysis.signals
      : analysis.signals.filter((s) => s.severity.toLowerCase() === activeSignalFilter.toLowerCase());

  return (
    <div className={cn("rounded-3xl border border-[#e5dfc5] dark:border-[#2a3f31] bg-card p-6 shadow-card space-y-6", className)}>
      {/* 1. Header: Risk Score & Level */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div className="flex items-center gap-3">
          {/* Circular Score Gauge */}
          <div className={cn("relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 font-mono font-bold shadow-xs", currentBadge.ring, currentBadge.bg)}>
            <div className="text-center">
              <span className="text-2xl font-extrabold leading-none">{analysis.score}</span>
              <span className="block text-[9px] uppercase tracking-tighter opacity-70">/ 100</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-bold text-ink">Rental Risk Engine</h3>
              <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border", currentBadge.badge)}>
                {analysis.riskLevel}
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">{currentBadge.text}</p>
          </div>
        </div>

        {/* Action Button: "Why this score?" */}
        <div className="flex items-center gap-2 sm:self-center">
          <button
            type="button"
            onClick={() => setShowWhyModal(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#7ca982]/40 bg-[#7ca982]/10 hover:bg-[#7ca982]/20 px-3.5 py-1.5 text-xs font-semibold text-[#1d3122] dark:text-[#a3caa6] transition-colors cursor-pointer shadow-xs"
          >
            <span>Why this score?</span>
            <span className="text-xs">ℹ️</span>
          </button>
        </div>
      </div>

      {/* 2. Metadata Strip: Confidence, Verification Status, Engine Version, Timestamp */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="rounded-2xl border border-line bg-paper/60 p-3">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted">Confidence</span>
          <strong className="mt-0.5 block font-semibold text-ink">
            {analysis.confidence} ({Math.round(analysis.confidenceScore * 100)}%)
          </strong>
        </div>

        <div className="rounded-2xl border border-line bg-paper/60 p-3">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted">Verification</span>
          <strong className="mt-0.5 block font-semibold text-[#57875d] dark:text-[#a3caa6] truncate">
            {analysis.verificationStatus}
          </strong>
        </div>

        <div className="rounded-2xl border border-line bg-paper/60 p-3">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted">Engine Version</span>
          <strong className="mt-0.5 block font-mono text-ink text-[11px] truncate">
            {analysis.engineVersion}
          </strong>
        </div>

        <div className="rounded-2xl border border-line bg-paper/60 p-3">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted">Audited At</span>
          <strong className="mt-0.5 block font-mono text-ink text-[11px] truncate">
            {new Date(analysis.timestamp).toLocaleDateString()}
          </strong>
        </div>
      </div>

      {/* 3. Narrative Explanation */}
      <div className="rounded-2xl border border-[#7ca982]/20 bg-[#7ca982]/5 p-4 text-xs text-ink leading-relaxed">
        <p className="font-semibold text-ink mb-1">Executive Summary:</p>
        <p className="text-ink-muted">{analysis.explanation}</p>
      </div>

      {/* 4. Risk Signals Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
            Detected Risk Signals ({analysis.signals.length})
          </h4>

          {/* Quick Filter */}
          <div className="flex items-center gap-1 text-[11px]">
            {["all", "critical", "high", "medium", "safe"].map((filterKey) => (
              <button
                key={filterKey}
                type="button"
                onClick={() => setActiveSignalFilter(filterKey)}
                className={cn(
                  "rounded-lg px-2 py-0.5 capitalize font-medium transition-colors cursor-pointer",
                  activeSignalFilter === filterKey
                    ? "bg-[#7ca982] text-white"
                    : "text-ink-muted hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                {filterKey}
              </button>
            ))}
          </div>
        </div>

        {filteredSignals.length === 0 ? (
          <p className="text-xs text-ink-muted py-2 text-center">No signals match filter '{activeSignalFilter}'.</p>
        ) : (
          <div className="space-y-2.5">
            {filteredSignals.map((signal) => (
              <div
                key={signal.id}
                className="rounded-2xl border border-line bg-card p-4 transition-all hover:border-[#7ca982]/40 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase", severityBadge(signal.severity))}>
                      {signal.severity}
                    </span>
                    <h5 className="font-semibold text-xs text-ink">{signal.title}</h5>
                  </div>
                  <span className={cn(
                    "text-xs font-mono font-bold shrink-0",
                    signal.impactPoints > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                  )}>
                    {signal.impactPoints > 0 ? `+${signal.impactPoints} pts` : `${signal.impactPoints} pts`}
                  </span>
                </div>

                <p className="text-xs text-ink-muted leading-relaxed">
                  {signal.explanation}
                </p>

                {/* Evidence & Source Attribution */}
                <div className="grid sm:grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-line/60">
                  <div>
                    <span className="font-semibold text-ink-muted">Evidence: </span>
                    <span className="text-ink font-mono">{signal.evidence}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-ink-muted">Source: </span>
                    <span className="text-[#57875d] dark:text-[#a3caa6]">{signal.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* "Why this score?" Interactive Modal */}
      <Modal
        open={showWhyModal}
        onClose={() => setShowWhyModal(false)}
        title="Why this score? — Deterministic Calculation"
      >
        <div className="space-y-4 text-xs">
          <p className="text-ink-muted leading-relaxed">
            Nivasa calculates rental risk using an empirical scoring engine. Scores are never randomly generated or fabricated.
            Every score starts at a baseline of <strong>{analysis.whyThisScore?.baseScore ?? 10} points</strong> and factors in positive compliance credits and negative risk penalties.
          </p>

          <div className="rounded-2xl border border-line bg-paper/60 p-3 space-y-2">
            <div className="flex justify-between items-center font-semibold text-ink pb-1 border-b border-line">
              <span>Risk Factor / Signal</span>
              <span>Impact</span>
            </div>

            <div className="flex justify-between text-ink-muted">
              <span>Base Tenancy Risk Baseline</span>
              <span className="font-mono font-semibold">+{analysis.whyThisScore?.baseScore ?? 10} pts</span>
            </div>

            {analysis.whyThisScore?.signalContributions?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start gap-3 py-1 border-b border-line/40 last:border-b-0">
                <div>
                  <strong className="block text-ink font-semibold">{item.signalTitle}</strong>
                  <span className="text-[11px] text-ink-muted">{item.rationale}</span>
                </div>
                <span className={cn(
                  "font-mono font-bold shrink-0",
                  item.points > 0 ? "text-rose-600" : "text-emerald-600"
                )}>
                  {item.points > 0 ? `+${item.points}` : item.points} pts
                </span>
              </div>
            ))}

            <div className="flex justify-between items-center font-bold text-ink pt-2 border-t border-line text-sm">
              <span>Final Risk Score:</span>
              <span className={cn("font-mono font-extrabold text-base", currentBadge.ring.split(" ")[1])}>
                {analysis.score} / 100 ({analysis.riskLevel})
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-[#7ca982]/10 p-3 border border-[#7ca982]/20">
            <h5 className="font-bold text-ink text-xs mb-1">Risk Brackets:</h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-900 dark:text-emerald-300">
                <strong>0–25: LOW</strong>
                <p>Safe & MTA Compliant</p>
              </div>
              <div className="p-1.5 rounded bg-amber-500/20 text-amber-900 dark:text-amber-300">
                <strong>26–50: MODERATE</strong>
                <p>Standard Precaution</p>
              </div>
              <div className="p-1.5 rounded bg-orange-500/20 text-orange-900 dark:text-orange-300">
                <strong>51–75: HIGH</strong>
                <p>Review Deposit/Title</p>
              </div>
              <div className="p-1.5 rounded bg-rose-500/20 text-rose-900 dark:text-rose-300">
                <strong>76–100: CRITICAL</strong>
                <p>Severe Discrepancies</p>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-ink-muted">
            <strong>Legal Reference:</strong> Evaluated under the Model Tenancy Act (MTA), 2021 guidelines for residential leases in India.
          </div>
        </div>
      </Modal>
    </div>
  );
}
