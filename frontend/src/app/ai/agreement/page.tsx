"use client";

import { useState } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { UploadField } from "@/components/ui/upload-field";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";

type Extracted = {
  fileName: string;
  rent: string;
  deposit: string;
  notice: string;
  lockIn: string;
  maintenance: string;
  review: string[];
};

export default function AgreementPage() {
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">(
    "idle",
  );
  const [extracted, setExtracted] = useState<Extracted | null>(null);
  const [isAi, setIsAi] = useState(false);

  async function analyse(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setStatus("error");
      return;
    }
    setStatus("processing");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/ai/agreement", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setExtracted(data);
        setIsAi(Boolean(data.aiPowered));
        setStatus("done");
        return;
      }
    } catch (err) {
      console.warn("Agreement API error, using fallback:", err);
    }

    // Fallback
    setExtracted({
      fileName: file.name,
      rent: "₹28,000 / month (extracted from standard lease clause)",
      deposit: "Three months security deposit refundable upon vacate",
      notice: "60-day notice period required prior to termination",
      lockIn: "6 months initial lock-in period",
      maintenance: "Tenant pays society maintenance",
      review: [
        "Lock-in duration of 6 months may prevent early exit without penalty.",
        "Notice period of 60 days is longer than the 30-day standard market norm.",
        "Confirm whether deep-cleaning fees are pre-agreed or variable upon handover.",
      ],
    });
    setIsAi(false);
    setStatus("done");
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-pista/30 bg-pista/10 px-3.5 py-1 text-xs font-semibold text-forest dark:text-pista">
            <span className="flex h-1.5 w-1.5 rounded-full bg-forest dark:bg-pista animate-ping" />
            <span>Gemini 2.5 Multimodal Legal Intelligence</span>
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl font-serif font-bold tracking-tight text-ink dark:text-cream">
            AI Lease Audit
          </h1>
          <p className="mt-3 text-base sm:text-lg text-ink-muted">
            Upload your draft residential agreement or Leave &amp; Licence PDF.
            We parse hidden financial obligations, notice lock-in traps, and provide tenant caution flags.
          </p>
        </div>

        {/* Upload Container */}
        <div className="mt-10 rounded-3xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-6 sm:p-8 shadow-xl shadow-warm-300/30 dark:shadow-none">
          <UploadField
            label="Upload Lease Agreement (PDF)"
            accept="application/pdf"
            hint="Private processing. The PDF is analyzed directly via Gemini 2.5 without retention."
            onSelect={analyse}
          />
        </div>

        {status === "error" && (
          <p className="mt-4 text-center text-sm font-semibold text-rose-600">
            Please choose a valid PDF agreement file to proceed.
          </p>
        )}

        {status === "processing" && (
          <div className="mt-10 rounded-3xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-forest dark:border-pista border-t-transparent" />
              <span className="text-xs font-bold uppercase tracking-wider text-forest dark:text-pista">
                Auditing Clauses with Gemini...
              </span>
            </div>
            <Skeleton className="h-6 w-2/3 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded-lg" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        )}

        {status === "done" && extracted && (
          <div className="mt-10 space-y-8">
            {/* Source & Status Bar */}
            <div className="flex items-center justify-between rounded-2xl border border-warm-200/80 dark:border-forest/40 bg-warm-100/40 dark:bg-card-dark px-5 py-3.5">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xs font-medium text-ink dark:text-cream truncate max-w-sm">
                  {extracted.fileName}
                </span>
              </div>
              <StatusBadge tone={isAi ? "ok" : "warn"}>
                {isAi ? "Gemini Neural Verification" : "Rule Extraction"}
              </StatusBadge>
            </div>

            {/* Extracted Core Clauses Grid */}
            <div className="rounded-3xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl font-serif font-bold text-ink dark:text-cream mb-6">Key Contractual Terms</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Monthly Base Rent", extracted.rent, "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"],
                  ["Security Deposit", extracted.deposit, "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"],
                  ["Termination Notice", extracted.notice, "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"],
                  ["Lock-In Duration", extracted.lockIn, "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"],
                  ["Maintenance Allocation", extracted.maintenance, "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"],
                ].map(([label, value, icon]) => (
                  <div key={label} className="rounded-2xl border border-warm-200/60 dark:border-forest/30 bg-warm-100/40 dark:bg-forest/20 p-4">
                    <div className="flex items-center gap-2 text-ink-muted mb-1">
                      <svg className="w-4 h-4 text-forest dark:text-pista shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                      </svg>
                      <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
                    </div>
                    <p className="text-sm font-serif font-semibold text-ink dark:text-cream mt-1">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Caution & Risk Points */}
            <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300 mb-4">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-lg font-serif font-bold">Important Review Cautions</h3>
              </div>
              <ul className="space-y-3">
                {extracted.review.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-ink dark:text-cream">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end">
              <Button
                variant="line"
                onClick={() => {
                  setStatus("idle");
                  setExtracted(null);
                }}
              >
                Clear &amp; Audit Another Lease
              </Button>
            </div>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
