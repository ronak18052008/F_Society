"use client";

import { useState, useEffect } from "react";
import type { AuthenticityAnalysis, AuthenticityStatus } from "@/types/authenticity";
import type { Property } from "@/types";
import { cn } from "@/lib/cn";
import { Modal } from "@/components/ui/modal";

interface AuthenticityCardProps {
  propertyId: string;
  property?: Property | null;
  className?: string;
}

export function AuthenticityCard({ propertyId, property, className }: AuthenticityCardProps) {
  const [analysis, setAnalysis] = useState<AuthenticityAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWhyModal, setShowWhyModal] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchAuthenticity() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/properties/${encodeURIComponent(propertyId)}/authenticity`);
        const data = await res.json();
        if (active) {
          if (res.ok && data.success && data.analysis) {
            setAnalysis(data.analysis);
          } else {
            setError(data.error || "Unable to fetch authenticity telemetry");
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
      fetchAuthenticity();
    }

    return () => {
      active = false;
    };
  }, [propertyId]);

  if (loading) {
    return (
      <div className={cn("rounded-3xl border border-[var(--border)] bg-card p-6 shadow-card animate-pulse", className)}>
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 rounded bg-black/10 dark:bg-white/10" />
          <div className="h-6 w-24 rounded-full bg-black/10 dark:bg-white/10" />
        </div>
        <div className="mt-4 h-16 rounded-2xl bg-black/5 dark:bg-white/5" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className={cn("rounded-3xl border border-rose-200 bg-rose-50/70 dark:bg-rose-950/20 dark:border-rose-900/40 p-6 text-xs text-rose-700 dark:text-rose-300", className)}>
        <div className="flex items-center gap-2 font-bold mb-1">
          <span>⚠️</span>
          <span>Authenticity Telemetry Offline</span>
        </div>
        <p>{error || "Unable to load authenticity analysis for this residence."}</p>
      </div>
    );
  }

  const score = analysis.authenticityScore;
  const status = analysis.status;

  const statusConfig: Record<AuthenticityStatus, { label: string; badgeCls: string; borderCls: string; bgCls: string; icon: string }> = {
    LIKELY_AUTHENTIC: {
      label: "Likely Authentic",
      badgeCls: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
      borderCls: "border-emerald-500/25 dark:border-emerald-900/40",
      bgCls: "bg-emerald-500/5",
      icon: "🛡️",
    },
    NEEDS_REVIEW: {
      label: "Needs Review",
      badgeCls: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
      borderCls: "border-amber-500/30 dark:border-amber-900/40",
      bgCls: "bg-amber-500/5",
      icon: "🔍",
    },
    SUSPICIOUS: {
      label: "Suspicious",
      badgeCls: "bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30",
      borderCls: "border-orange-500/30 dark:border-orange-900/40",
      bgCls: "bg-orange-500/5",
      icon: "⚠️",
    },
    HIGH_RISK: {
      label: "High Risk",
      badgeCls: "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30",
      borderCls: "border-rose-500/30 dark:border-rose-900/40",
      bgCls: "bg-rose-500/5",
      icon: "🚨",
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className={cn("rounded-3xl border bg-card p-6 shadow-card space-y-6 transition-all", currentStatus.borderCls, className)}>
      {/* Header with Title and Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--accent-forest)]/15 text-[var(--text-main)] font-bold text-base">
            {currentStatus.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-serif font-bold text-ink">AI Scam & Authenticity Detector</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-ink-muted">
                v3.1.0-deterministic
              </span>
            </div>
            <p className="text-xs text-ink-muted">Multi-factor empirical fraud detection & fake listing analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn("rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border", currentStatus.badgeCls)}>
            {status.replace("_", " ")}
          </span>
          <button
            onClick={() => setShowWhyModal(true)}
            className="rounded-full border border-[var(--accent-forest)]/40 bg-[var(--accent-forest)]/10 hover:bg-[var(--accent-forest)]/20 px-3 py-1 text-xs font-semibold text-[var(--text-main)] transition shadow-2xs"
          >
            Why this result?
          </button>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Authenticity Score Card */}
        <div className="rounded-2xl border border-line bg-card/60 p-4 shadow-2xs">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">Authenticity Score</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold font-tabular text-ink">{score}</span>
            <span className="text-xs text-ink-muted font-mono">/ 100</span>
          </div>
          {/* Progress track */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
            <div
              className={cn("h-full rounded-full transition-all duration-500",
                score >= 85 ? "bg-[var(--success)]" : score >= 65 ? "bg-[var(--warning)]" : score >= 40 ? "bg-orange-500" : "bg-[var(--error)]"
              )}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Confidence Card */}
        <div className="rounded-2xl border border-line bg-card/60 p-4 shadow-2xs">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">Confidence Level</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-serif font-bold text-ink">{analysis.confidence}</span>
            <span className="text-xs text-ink-muted font-mono">({Math.round(analysis.confidenceScore * 100)}%)</span>
          </div>
          <span className="mt-1 block text-[11px] text-ink-muted">Based on 8 verifiable attributes</span>
        </div>

        {/* Verification Status Card */}
        <div className="rounded-2xl border border-line bg-card/60 p-4 shadow-2xs">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">Verification Status</span>
          <span className="mt-1 block text-sm font-bold text-ink truncate">{analysis.verificationStatus}</span>
          <span className="text-[11px] text-ink-muted">Land Registry & KYC state</span>
        </div>
      </div>

      {/* Warning Callouts: Price Anomaly & Duplicate Warnings */}
      {(analysis.priceAnomaly || analysis.duplicateWarning) && (
        <div className="space-y-3">
          {analysis.priceAnomaly && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <strong className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                  Price Anomaly Detected
                </strong>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                  The rental rate of this residence deviates significantly from regional micro-market medians. Ensure physical inspection before paying any token.
                </p>
              </div>
            </div>
          )}

          {analysis.duplicateWarning && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-start gap-3">
              <span className="text-lg">🚨</span>
              <div>
                <strong className="text-xs font-bold text-rose-900 dark:text-rose-200 block">
                  Duplicate Listing Warning
                </strong>
                <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5 leading-relaxed">
                  This residence matches {analysis.duplicateMatches?.length || 1} other active listing(s) in the database with identical specifications or reused photographic assets.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suspicious Description Flags Callout */}
      {analysis.suspiciousDescriptionFlags && analysis.suspiciousDescriptionFlags.length > 0 && (
        <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">🚩</span>
            <strong className="text-xs font-bold text-orange-900 dark:text-orange-200">
              Suspicious Description Indicators Detected ({analysis.suspiciousDescriptionFlags.length})
            </strong>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.suspiciousDescriptionFlags.map((flag, idx) => (
              <span
                key={idx}
                className="rounded-lg bg-orange-500/20 border border-orange-500/30 px-2.5 py-1 text-[11px] font-semibold text-orange-900 dark:text-orange-200"
              >
                {flag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Information Checklist */}
      {analysis.missingInformation && analysis.missingInformation.length > 0 && (
        <div className="rounded-2xl border border-line bg-black/5 dark:bg-white/5 p-3.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block mb-1.5">
            Missing Information Checklist
          </span>
          <div className="flex flex-wrap gap-2">
            {analysis.missingInformation.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-md bg-card border border-line px-2 py-0.5 text-[11px] text-ink-muted"
              >
                <span className="text-amber-500">✕</span>
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Explanation Summary Banner */}
      <div className="rounded-2xl border border-line bg-card p-4">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">Diagnostic Explanation</span>
        <p className="mt-1 text-xs text-ink leading-relaxed">{analysis.explanation}</p>
      </div>

      {/* Detected Signals Stream */}
      {analysis.signals && analysis.signals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Detected Signals ({analysis.signals.length})
            </h4>
            <span className="text-[11px] text-ink-muted">Telemetry Audit</span>
          </div>

          <div className="space-y-2.5">
            {analysis.signals.map((sig) => (
              <div
                key={sig.id}
                className="rounded-xl border border-line bg-card/70 p-3 shadow-2xs hover:border-[var(--accent-forest)]/50 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold uppercase",
                      sig.severity === "CRITICAL" ? "bg-rose-500/20 text-rose-700 dark:text-rose-300" :
                      sig.severity === "HIGH" ? "bg-orange-500/20 text-orange-700 dark:text-orange-300" :
                      sig.severity === "MEDIUM" ? "bg-amber-500/20 text-amber-700 dark:text-amber-300" :
                      "bg-blue-500/20 text-blue-700 dark:text-blue-300"
                    )}>
                      {sig.severity}
                    </span>
                    <strong className="text-xs font-semibold text-ink">{sig.title}</strong>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400">
                    -{sig.scoreDeduction} pts
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">{sig.explanation}</p>
                <div className="mt-2 text-[11px] text-ink-muted border-t border-line/50 pt-1.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="truncate max-w-md"><strong>Evidence:</strong> {sig.evidence}</span>
                  <span className="font-mono text-[10px] opacity-75">{sig.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Analysis Disclosure (Explicit constraint: Never claim external reverse-image search unless real) */}
      <div className="text-[11px] text-ink-muted border-t border-line pt-3 flex flex-wrap items-center justify-between gap-2 font-mono">
        <span>Image Check: {analysis.imageMetadata?.method || "Internal Asset Registry Fingerprinter"}</span>
        <span>Reverse Web Scraping: None (Internal only)</span>
      </div>

      {/* Interactive Modal: Why this result? */}
      {showWhyModal && (
        <Modal
          open={showWhyModal}
          onClose={() => setShowWhyModal(false)}
          title="Authenticity Analysis Breakdown"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs">
            <div className="rounded-2xl border border-line bg-black/5 dark:bg-white/5 p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Initial Baseline</span>
                <div className="text-xl font-serif font-bold text-ink">100 Points</div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Final Authenticity</span>
                <div className="text-xl font-serif font-bold text-ink">{score}/100 ({status})</div>
              </div>
            </div>

            {/* Deductions Breakdown */}
            <div>
              <h5 className="font-bold uppercase tracking-wider text-ink-muted text-[11px] mb-2">
                Score Deductions ({analysis.whyThisResult.deductions?.length || 0})
              </h5>
              <div className="space-y-2">
                {analysis.whyThisResult.deductions?.map((d, i) => (
                  <div key={i} className="rounded-xl border border-line bg-card p-3">
                    <div className="flex items-center justify-between font-semibold text-ink">
                      <span>{d.title}</span>
                      <span className="text-rose-600 dark:text-rose-400 font-mono">-{d.pointsDeducted} pts</span>
                    </div>
                    <p className="mt-1 text-ink-muted text-[11px]">{d.explanation}</p>
                    <div className="mt-1 text-[10px] text-ink-muted italic">Evidence: {d.evidence}</div>
                  </div>
                ))}
                {(!analysis.whyThisResult.deductions || analysis.whyThisResult.deductions.length === 0) && (
                  <p className="text-ink-muted italic">No negative score deductions applied.</p>
                )}
              </div>
            </div>

            {/* Safety Credits */}
            {analysis.whyThisResult.safetyCredits && analysis.whyThisResult.safetyCredits.length > 0 && (
              <div>
                <h5 className="font-bold uppercase tracking-wider text-ink-muted text-[11px] mb-2">
                  Safety & Trust Credits
                </h5>
                <div className="space-y-2">
                  {analysis.whyThisResult.safetyCredits.map((c, i) => (
                    <div key={i} className="rounded-xl border border-[var(--success)]/20 bg-[var(--success)]/5 p-3">
                      <div className="flex items-center justify-between font-semibold text-[var(--success)]">
                        <span>{c.title}</span>
                        <span className="font-mono">+{c.pointsCredited} pts</span>
                      </div>
                      <p className="mt-1 text-ink-muted text-[11px]">{c.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Methodology */}
            <div className="rounded-2xl border border-line bg-card p-3.5">
              <strong className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                Audit Methodology
              </strong>
              <p className="text-ink-muted text-[11px] leading-relaxed">
                {analysis.whyThisResult.methodology}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
