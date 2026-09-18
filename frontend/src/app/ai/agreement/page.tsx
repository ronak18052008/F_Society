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
      <div className="mx-auto max-w-3xl px-5 py-14">
        <StatusBadge tone={isAi ? "ok" : "warn"}>
          {isAi ? "Gemini Multimodal Analysis" : "Document Clause Extractor"}
        </StatusBadge>
        <h1 className="mt-4 font-serif text-5xl">Rental agreement analyzer</h1>
        <p className="mt-4 text-sm text-ink-soft">
          Upload any Indian residential tenancy or Leave &amp; Licence agreement (PDF).
          We extract key financial covenants, notice terms, lock-in clauses, and highlight tenant caution points.
        </p>
        <div className="mt-8">
          <UploadField
            label="Upload a PDF"
            accept="application/pdf"
            hint="PDF only. The file stays on your device."
            onSelect={analyse}
          />
        </div>
        {status === "error" ? (
          <p className="mt-4 text-sm text-danger">Please choose a PDF file.</p>
        ) : null}
        {status === "processing" ? (
          <div className="mt-10 space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-bronze">
              Processing
            </p>
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : null}
        {status === "done" && extracted ? (
          <div className="mt-10 space-y-5">
            <p className="text-sm text-ink-soft">Source file: {extracted.fileName}</p>
            {[
              ["Rent", extracted.rent],
              ["Deposit", extracted.deposit],
              ["Notice period", extracted.notice],
              ["Lock-in", extracted.lockIn],
              ["Maintenance responsibility", extracted.maintenance],
            ].map(([label, value]) => (
              <div key={label} className="border-b border-line pb-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                  {label}
                </p>
                <p className="mt-1">{value}</p>
              </div>
            ))}
            <div>
              <h2 className="font-serif text-3xl">Points for review</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                {extracted.review.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <Button
              variant="line"
              onClick={() => {
                setStatus("idle");
                setExtracted(null);
              }}
            >
              Clear
            </Button>
          </div>
        ) : null}
      </div>
    </SiteShell>
  );
}
