"use client";

import { useState, useRef } from "react";
import type {
  MaintenanceTriageResult,
  MaintenanceCategory,
  MaintenanceSeverity,
} from "@/types/maintenance";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export interface MaintenanceTriageModalProps {
  open?: boolean;
  onClose?: () => void;
  propertyId?: string;
  propertyName?: string;
  propertyTitle?: string;
  buttonLabel?: string;
  buttonVariant?: "primary" | "secondary" | "outline" | "ghost";
  buttonSize?: "sm" | "md" | "lg";
  className?: string;
  onTicketCreated?: (ticket: any) => void;
}

const ROOM_OPTIONS = [
  "Kitchen",
  "Bathroom / Washroom",
  "Master Bedroom",
  "Living Room",
  "Balcony / Utility",
  "Main Meter Board / Electrical Panel",
  "Common Corridor",
  "Other Area",
];

const DURATION_OPTIONS = [
  "Just started (Under 1 hour)",
  "A few hours today",
  "1–2 days",
  "More than a week",
  "Intermittent / Recurring",
];

export function MaintenanceTriageModal({
  open,
  onClose,
  propertyId,
  propertyName,
  propertyTitle,
  buttonLabel,
  buttonVariant = "primary",
  buttonSize = "sm",
  className,
  onTicketCreated,
}: MaintenanceTriageModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof open === "boolean";
  const isOpen = isControlled ? open : internalOpen;
  const handleClose = () => {
    if (isControlled && onClose) {
      onClose();
    } else {
      setInternalOpen(false);
    }
  };
  const effectivePropertyName = propertyName || propertyTitle;
  const [description, setDescription] = useState("");
  const [room, setRoom] = useState(ROOM_OPTIONS[0]);
  const [duration, setDuration] = useState(DURATION_OPTIONS[0]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<MaintenanceTriageResult | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image file exceeds the 5 MB limit.");
      return;
    }

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type.toLowerCase())) {
      setImageError("Unsupported file type. Please upload a JPEG, PNG, or WEBP image.");
      return;
    }

    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageName(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 5) {
      setSubmitError("Please provide at least 5 characters describing the issue.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setResult(null);

    // Staged loading effect
    setLoadingStep(1);
    const stepTimer1 = setTimeout(() => setLoadingStep(2), 500);
    const stepTimer2 = setTimeout(() => setLoadingStep(3), 1000);

    try {
      const res = await fetch("/api/maintenance/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          room,
          issueDuration: duration,
          image: imagePreview || undefined,
          imageName: imageName || undefined,
          propertyId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.triage) {
        setResult(data.triage);
      } else {
        setSubmitError(data.error || "Failed to process maintenance triage.");
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Network error");
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setDescription("");
    setImagePreview(null);
    setImageName(null);
    setImageError(null);
    setSubmitError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getSeverityBadge = (severity: MaintenanceSeverity) => {
    switch (severity) {
      case "EMERGENCY":
        return {
          badge: "bg-rose-500 text-white font-bold animate-pulse",
          card: "border-rose-500/40 bg-rose-500/10",
          icon: "🚨",
        };
      case "HIGH":
        return {
          badge: "bg-orange-500/20 text-orange-800 dark:text-orange-300 border-orange-500/40",
          card: "border-orange-500/30 bg-orange-500/5",
          icon: "⚠️",
        };
      case "MEDIUM":
        return {
          badge: "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40",
          card: "border-amber-500/30 bg-amber-500/5",
          icon: "🔧",
        };
      case "LOW":
      default:
        return {
          badge: "bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-500/40",
          card: "border-blue-500/30 bg-blue-500/5",
          icon: "ℹ️",
        };
    }
  };

  const modalContent = (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title="AI Maintenance Triage Intelligence"
    >
      <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1 text-xs">
        {/* Header Notice & Context */}
        <div className="rounded-2xl border border-line bg-black/5 dark:bg-white/5 p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block">
              Tenancy Maintenance Assistant
            </span>
            <span className="font-semibold text-ink">
              {effectivePropertyName ? `Context: ${effectivePropertyName}` : "Residential Triage & Safety Diagnostic"}
            </span>
          </div>
          <span className="rounded-full bg-[var(--primary-pista)]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-main)]">
            Smart Triage
          </span>
        </div>

        {/* Display Triage Results or Form */}
        {result ? (
          <div className="space-y-4">
            {/* Immediate Attention Callout */}
            {result.requiresImmediateAttention && (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-500/15 p-4 flex items-start gap-3">
                <span className="text-2xl">🚨</span>
                <div>
                  <strong className="text-sm font-bold text-rose-900 dark:text-rose-200 block">
                    Immediate Action Required ({result.severity})
                  </strong>
                  <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5 leading-relaxed">
                    This issue involves critical safety risks. Follow recommended emergency procedures immediately.
                  </p>
                </div>
              </div>
            )}

            {/* Diagnostic Header Grid */}
            <div className="grid gap-3 sm:grid-cols-3">
              {/* Category */}
              <div className="rounded-2xl border border-line bg-card p-3.5 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block">Category</span>
                <span className="mt-1 text-base font-serif font-bold text-ink flex items-center gap-1.5">
                  <span>🛠️</span>
                  <span>{result.category}</span>
                </span>
              </div>

              {/* Severity */}
              <div className="rounded-2xl border border-line bg-card p-3.5 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block">Severity</span>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={cn("rounded-md px-2.5 py-0.5 text-xs font-bold uppercase border", getSeverityBadge(result.severity).badge)}>
                    {result.severity}
                  </span>
                </div>
              </div>

              {/* Urgency & Confidence */}
              <div className="rounded-2xl border border-line bg-card p-3.5 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block">Urgency & Confidence</span>
                <span className="mt-1 text-xs font-bold text-ink block font-mono">
                  {result.urgency} ({Math.round(result.confidenceScore * 100)}% Conf.)
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-line bg-card p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
                Diagnostic Summary
              </span>
              <p className="text-xs text-ink leading-relaxed">{result.summary}</p>
            </div>

            {/* Recommended Next Step Callout */}
            <div className="rounded-2xl border border-[var(--primary-pista)]/40 bg-[var(--primary-pista)]/10 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-main)] block mb-1">
                Recommended Immediate Next Step
              </span>
              <p className="text-sm font-semibold text-ink leading-snug">{result.recommendedNextStep}</p>
              {result.estimatedResolutionTime && (
                <span className="mt-2 inline-block text-[11px] font-mono text-ink-muted">
                  Estimated Resolution: <strong>{result.estimatedResolutionTime}</strong>
                </span>
              )}
            </div>

            {/* Suggested Actions Checklist */}
            {result.suggestedActions && result.suggestedActions.length > 0 && (
              <div className="rounded-2xl border border-line bg-card p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block mb-2">
                  Immediate Tenant Action Checklist
                </span>
                <ul className="space-y-2">
                  {result.suggestedActions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-ink leading-relaxed">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--primary-pista)]/20 text-[10px] font-bold text-[var(--text-main)]">
                        {i + 1}
                      </span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prominent Legal / Safety Disclaimer */}
            <div className="rounded-2xl border border-line bg-black/5 dark:bg-white/5 p-3.5 text-[11px] text-ink-muted leading-relaxed">
              <strong className="text-ink font-semibold block mb-0.5">⚠️ Safety & Legal Notice</strong>
              {result.disclaimer}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line">
              <span className="text-[10px] text-ink-muted font-mono">
                Provider: {result.provider}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Triage Another Issue
                </Button>
                <Button
                  size="sm"
                  className="bg-[var(--primary-pista)] hover:bg-[var(--primary-pista-hover)] text-white"
                  onClick={() => {
                    if (onTicketCreated) onTicketCreated(result);
                    handleClose();
                  }}
                >
                  Save to Maintenance Log
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleTriageSubmit} className="space-y-4">
            {submitError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                {submitError}
              </div>
            )}

            {/* Room / Location Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                Affected Area / Room
              </label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full rounded-xl border border-line bg-card px-3 py-2 text-xs text-ink focus:border-[var(--primary-pista)] focus:outline-none"
              >
                {ROOM_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                How long has this issue occurred?
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-xl border border-line bg-card px-3 py-2 text-xs text-ink focus:border-[var(--primary-pista)] focus:outline-none"
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Text Description with Character Counter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  Issue Description *
                </label>
                <span className="text-[10px] text-ink-muted font-mono">{description.length}/2000</span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={2000}
                required
                placeholder="Describe what happened in detail (e.g. Water leaking rapidly beneath bathroom washbasin tap; sparking sound when turning on kitchen exhaust fan)..."
                className="w-full rounded-xl border border-line bg-card p-3 text-xs text-ink placeholder:text-ink-muted/60 focus:border-[var(--primary-pista)] focus:outline-none leading-relaxed"
              />
            </div>

            {/* Optional Image Upload Dropzone */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                Optional Photographic Evidence (Max 5 MB)
              </label>

              {imagePreview ? (
                <div className="relative rounded-2xl border border-line bg-card p-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 truncate">
                    <img
                      src={imagePreview}
                      alt="Uploaded preview"
                      className="h-14 w-14 object-cover rounded-xl border border-line shrink-0"
                    />
                    <div className="truncate">
                      <span className="text-xs font-semibold text-ink block truncate">{imageName || "Uploaded image"}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Ready for AI triage</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="rounded-lg p-1.5 text-ink-muted hover:text-rose-600 transition"
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed border-line hover:border-[var(--primary-pista)] p-4 text-center cursor-pointer transition bg-black/2 dark:bg-white/2"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">📸</span>
                    <span className="text-xs font-semibold text-ink">Upload photo of the defect or leak</span>
                    <span className="text-[10px] text-ink-muted">Supports JPEG, PNG, or WEBP (up to 5 MB)</span>
                  </div>
                </div>
              )}

              {imageError && (
                <span className="mt-1 text-[11px] text-rose-600 block">{imageError}</span>
              )}
            </div>

            {/* Disclaimer in form */}
            <p className="text-[11px] text-ink-muted leading-relaxed border-t border-line pt-3">
              <strong>Notice:</strong> AI triage provides immediate guidance and diagnostic categorization. In cases of active electrical fire, gas odors, or structural hazard, evacuate and call emergency authorities.
            </p>

            {/* Submit CTA */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
              <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting || description.trim().length < 5}
                className="bg-[var(--primary-pista)] hover:bg-[var(--primary-pista-hover)] text-white"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>
                      {loadingStep === 1
                        ? "Scanning issue..."
                        : loadingStep === 2
                        ? "Classifying severity..."
                        : "Formulating actions..."}
                    </span>
                  </span>
                ) : (
                  "Run AI Triage"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );

  if (isControlled) {
    return modalContent;
  }

  return (
    <>
      <Button
        type="button"
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => setInternalOpen(true)}
        className={cn("inline-flex items-center gap-1.5", className)}
      >
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <span>{buttonLabel || "AI Maintenance Triage"}</span>
      </Button>
      {modalContent}
    </>
  );
}
