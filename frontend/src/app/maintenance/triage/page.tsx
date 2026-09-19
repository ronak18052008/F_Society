"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MaintenanceTriageModal } from "@/components/maintenance/maintenance-triage-modal";
import { StatusBadge } from "@/components/ui/status-badge";
import type { MaintenanceTriageResult } from "@/types/maintenance";

export default function MaintenanceTriagePage() {
  const [recentTriaged, setRecentTriaged] = useState<MaintenanceTriageResult[]>([]);

  return (
    <DashboardShell
      title="AI Maintenance Triage"
      subtitle="Intelligent maintenance assessment, risk analysis, and urgent repair dispatch."
    >
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left column: Overview & Initiation */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-warm-200/90 dark:border-forest/40 bg-card dark:bg-card-dark p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pista/15 text-forest dark:text-pista">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-serif font-bold text-ink dark:text-cream">Issue Triage Assistant</h2>
                  <span className="rounded-full bg-forest/10 dark:bg-pista/20 px-2.5 py-0.5 text-[10px] font-bold text-forest dark:text-pista uppercase tracking-wider">
                    AI Powered
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-0.5">
                  Automated categorization, severity rating, and emergency isolation
                </p>
              </div>
            </div>

            <p className="text-sm text-ink-muted dark:text-cream/80 leading-relaxed mb-6">
              NESTORA AI Maintenance Triage analyzes tenant reports with natural language classification and optional image analysis. It identifies hazard severities from routine repairs to immediate electrical or gas emergencies, providing instant containment steps.
            </p>

            <div className="rounded-xl border border-warm-200/60 dark:border-forest/30 bg-paper/60 dark:bg-card-dark/40 p-4 mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">Supported Categories</h3>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {["ELECTRICAL", "PLUMBING", "HVAC", "APPLIANCE", "STRUCTURAL", "INTERNET", "SECURITY", "OTHER"].map((cat) => (
                  <span key={cat} className="rounded-md bg-white dark:bg-forest/20 px-2 py-0.5 text-[11px] font-medium text-ink dark:text-cream border border-warm-200/50 dark:border-forest/30">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <MaintenanceTriageModal
                propertyId="rent-navrang"
                propertyTitle="Navrangpura Courtyard"
                buttonLabel="Start New AI Triage"
                onTicketCreated={(ticket) => {
                  setRecentTriaged((prev) => [ticket, ...prev]);
                }}
              />
              <Link
                href="/tenant/dashboard"
                className="text-xs font-semibold text-ink-muted hover:text-ink dark:hover:text-cream transition-colors"
              >
                ← Return to Tenant Dashboard
              </Link>
            </div>
          </div>

          {/* Emergency protocol card */}
          <div className="rounded-2xl border border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white font-bold text-sm">
                !
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-rose-900 dark:text-rose-200">Life Safety & Critical Emergencies</h4>
                <p className="mt-1 text-rose-800/90 dark:text-rose-300/90 leading-relaxed">
                  If you detect an active gas leak, sparking wires with smoke, or rushing water near electrical panels, prioritize your personal safety immediately. Evacuate the premises and call emergency services (112 or local fire/utility authority). AI triage is an advisory system and does not replace emergency response.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Recent Triaged Items / Guide */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-warm-200/90 dark:border-forest/40 bg-card dark:bg-card-dark p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-serif font-bold text-ink dark:text-cream">Triaged In This Session</h3>
              <span className="text-xs text-ink-muted">{recentTriaged.length} logged</span>
            </div>

            {recentTriaged.length === 0 ? (
              <div className="rounded-xl border border-dashed border-warm-200/80 dark:border-forest/30 p-8 text-center bg-paper/40">
                <p className="text-xs text-ink-muted">
                  No maintenance issues triaged yet in this session. Click &quot;Start New AI Triage&quot; to run an analysis.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {recentTriaged.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-warm-200/80 dark:border-forest/40 bg-paper/60 dark:bg-card-dark/60 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink dark:text-cream">
                        {item.category}
                      </span>
                      <StatusBadge
                        tone={
                          item.severity === "EMERGENCY"
                            ? "warn"
                            : item.severity === "HIGH"
                            ? "warn"
                            : "ok"
                        }
                      >
                        {item.severity}
                      </StatusBadge>
                    </div>
                    <p className="text-xs text-ink dark:text-cream font-medium line-clamp-2">
                      {item.summary}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-ink-muted pt-1 border-t border-warm-200/50 dark:border-forest/20">
                      <span>Urgency: {item.urgency}</span>
                      <span>Confidence: {item.confidence}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-5 text-xs text-ink-muted space-y-2">
            <h4 className="font-bold text-ink dark:text-cream">Triage Engine Features</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Automatic PII & personal phone redaction</li>
              <li>Dual provider support (Google Gemini + Deterministic engine)</li>
              <li>Multi-format image inspection (JPEG, PNG, WebP &le; 5MB)</li>
              <li>Instant tenant containment guidance and next steps</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
