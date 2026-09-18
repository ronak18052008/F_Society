"use client";

import { useState } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/field";
import { PropertyCard } from "@/components/property/property-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { properties } from "@/data/demo";
import { matchProperties, parseRequirements } from "@/lib/recommend";

export default function RecommendPage() {
  const [raw, setRaw] = useState(
    "Furnished room in Ahmedabad under 20000 near college",
  );
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [parsed, setParsed] = useState<ReturnType<typeof parseRequirements> | null>(
    null,
  );
  const [matches, setMatches] = useState<ReturnType<typeof matchProperties>>([]);

  const [isAi, setIsAi] = useState(false);

  async function run() {
    if (raw.trim().length < 8) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: raw }),
      });

      if (res.ok) {
        const data = await res.json();
        setParsed(data.requirements);
        setMatches(data.matches);
        setIsAi(Boolean(data.aiPowered));
        setStatus("done");
        return;
      }
    } catch (err) {
      console.warn("API recommend failed, fallback to local:", err);
    }

    // Local fallback
    const req = parseRequirements(raw);
    const next = matchProperties(properties, req);
    setParsed(req);
    setMatches(next);
    setIsAi(false);
    setStatus("done");
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-5 py-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
          {isAi ? "Gemini-powered semantic search" : "Intelligent requirement discovery"}
        </p>
        <h1 className="mt-3 font-serif text-5xl">Ask Nestora</h1>
        <p className="mt-3 max-w-xl text-sm text-ink-soft">
          Express your ideal home requirements in natural language. We extract locality,
          budget constraints, lifestyle suitability, and discover matching residences.
        </p>
        <div className="mt-8 max-w-xl">
          <TextArea label="What do you need?" name="q" value={raw} onChange={setRaw} />
          <div className="mt-4">
            <Button onClick={run}>Find matches</Button>
          </div>
        </div>
        {status === "error" ? (
          <p className="mt-6 text-sm text-danger">Write a slightly longer request.</p>
        ) : null}
        {status === "loading" ? (
          <div className="mt-10 space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : null}
        {status === "done" && parsed ? (
          <div className="mt-10">
            <h2 className="font-serif text-3xl">Structured preview</h2>
            <ul className="mt-3 text-sm text-ink-soft">
              <li>City: {parsed.city ?? "not detected"}</li>
              <li>Budget: {parsed.budget ?? "not detected"}</li>
              <li>Furnishing: {parsed.furnishing ?? "not detected"}</li>
              <li>Type: {parsed.type ?? "not detected"}</li>
            </ul>
            {matches.length === 0 ? (
              <div className="mt-8">
                <EmptyState
                  title="No matches"
                  body="Try another city or a higher budget. Matching only uses the demo inventory."
                />
              </div>
            ) : (
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {matches.map(({ property, reasons, score }) => (
                  <div key={property.id}>
                    <PropertyCard property={property} />
                    <p className="mt-2 text-xs text-ink-soft">
                      Score {score}: {reasons.join("; ")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </SiteShell>
  );
}
