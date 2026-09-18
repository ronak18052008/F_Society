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
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-pista/30 bg-pista/10 px-3.5 py-1 text-xs font-semibold text-forest dark:text-pista">
            <span className="flex h-1.5 w-1.5 rounded-full bg-forest dark:bg-pista animate-ping" />
            <span>Gemini 2.5 Tenancy Discovery</span>
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl font-serif font-bold tracking-tight text-ink dark:text-cream">
            Ask Nivasa AI
          </h1>
          <p className="mt-3 text-base sm:text-lg text-ink-muted max-w-2xl mx-auto">
            Describe your ideal living space, daily commute, sunlight needs, or pet preferences in natural language.
            Our semantic engine extracts requirements and maps them to verified residences.
          </p>
        </div>

        {/* Input Box Card */}
        <div className="mt-10 mx-auto max-w-2xl rounded-3xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-6 sm:p-8 shadow-xl shadow-warm-300/30 dark:shadow-none">
          <label htmlFor="ai-prompt" className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
            What are your tenancy criteria?
          </label>
          <TextArea
            id="ai-prompt"
            label=""
            name="q"
            value={raw}
            onChange={setRaw}
          />

          {/* Quick Preset Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-ink-muted">Suggestions:</span>
            {[
              "Quiet 2 BHK in Navrangpura Ahmedabad under 35000",
              "Furnished studio in Indiranagar near metro",
              "Spacious apartment with terrace for working professional",
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setRaw(preset)}
                className="rounded-full border border-warm-200 dark:border-forest/40 bg-warm-100/50 dark:bg-forest/20 px-3 py-1 text-ink-muted hover:border-pista hover:text-forest dark:hover:text-pista transition cursor-pointer text-[11px]"
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button size="lg" onClick={run} disabled={status === "loading"}>
              {status === "loading" ? "Analyzing Requirements..." : "Discover Matching Residences →"}
            </Button>
          </div>
        </div>

        {status === "error" && (
          <p className="mt-6 text-center text-sm font-semibold text-rose-600">
            Please write a slightly longer description (at least 8 characters) to help our AI engine extract requirements.
          </p>
        )}

        {status === "loading" && (
          <div className="mt-12 space-y-4 max-w-3xl mx-auto">
            <Skeleton className="h-8 w-1/3 rounded-xl" />
            <Skeleton className="h-48 w-full rounded-3xl" />
          </div>
        )}

        {status === "done" && parsed && (
          <div className="mt-14">
            {/* Extracted Requirements Chips */}
            <div className="rounded-3xl border border-warm-200/80 dark:border-forest/40 bg-warm-100/40 dark:bg-card-dark/60 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif font-bold text-ink dark:text-cream">Extracted Search Telemetry</h2>
                <span className="rounded-full bg-pista/20 px-3 py-1 text-xs font-semibold text-forest dark:text-pista border border-pista/30">
                  {isAi ? "Gemini Neural Parse" : "Deterministic Parse"}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-warm-200 dark:border-forest/40 bg-card dark:bg-card-dark p-4">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">City Hub</span>
                  <span className="mt-1 block text-base font-bold text-ink dark:text-cream capitalize">{parsed.city ?? "Any"}</span>
                </div>
                <div className="rounded-2xl border border-warm-200 dark:border-forest/40 bg-card dark:bg-card-dark p-4">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">Max Budget</span>
                  <span className="mt-1 block text-base font-bold text-ink dark:text-cream">
                    {parsed.budget ? `₹${parsed.budget.toLocaleString("en-IN")}` : "Flexible"}
                  </span>
                </div>
                <div className="rounded-2xl border border-warm-200 dark:border-forest/40 bg-card dark:bg-card-dark p-4">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">Furnishing</span>
                  <span className="mt-1 block text-base font-bold text-ink dark:text-cream capitalize">{parsed.furnishing ?? "Any"}</span>
                </div>
                <div className="rounded-2xl border border-warm-200 dark:border-forest/40 bg-card dark:bg-card-dark p-4">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">Typology</span>
                  <span className="mt-1 block text-base font-bold text-ink dark:text-cream capitalize">{parsed.type ?? "Any"}</span>
                </div>
              </div>
            </div>

            {/* Matching Results */}
            {matches.length === 0 ? (
              <div className="mt-10 rounded-3xl border border-dashed border-warm-300 dark:border-forest/40 p-12 text-center bg-card/50 dark:bg-card-dark/50">
                <EmptyState
                  title="No Matching Residences"
                  body="Widen your budget constraints or change the location keyword to discover available homes."
                />
              </div>
            ) : (
              <div className="mt-10">
                <h3 className="text-xl font-serif font-bold text-ink dark:text-cream mb-6">
                  Recommended Residences ({matches.length})
                </h3>
                <div className="grid gap-8 md:grid-cols-2">
                  {matches.map(({ property, reasons, score }) => (
                    <div key={property.id} className="flex flex-col">
                      <PropertyCard property={property} />
                      <div className="mt-3 rounded-2xl border border-pista/30 bg-pista/10 dark:bg-forest/20 p-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-forest dark:text-pista mb-1.5">
                          <span>Match Score</span>
                          <span className="rounded-full bg-forest dark:bg-pista text-cream dark:text-ink px-2 py-0.5 text-[10px] font-bold">{score} pts</span>
                        </div>
                        <p className="text-xs text-ink-muted leading-relaxed">
                          {reasons.join(" · ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
