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

  function analyse(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setStatus("error");
      return;
    }
    setStatus("processing");
    window.setTimeout(() => {
      setExtracted({
        fileName: file.name,
        rent: "₹28,000 / month (pattern detected in filename or placeholder)",
        deposit: "Three months, as commonly stated in demo agreements",
        notice: "60-day notice period (illustrative)",
        lockIn: "6 months (illustrative)",
        maintenance: "Tenant pays society maintenance (illustrative)",
        review: [
          "Lock-in may be longer than a 30-day preference.",
          "Notice period of 60 days is longer than 30 days.",
          "Confirm who pays major repairs — this extractor cannot decide.",
        ],
      });
      setStatus("done");
    }, 1100);
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-5 py-14">
        <StatusBadge tone="warn">Informational only</StatusBadge>
        <h1 className="mt-4 font-serif text-5xl">Rental agreement analyzer</h1>
        <p className="mt-4 text-sm text-ink-soft">
          This prototype does not read the PDF contents. It demonstrates the
          interface and returns sample clauses. It is not legal advice.
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
