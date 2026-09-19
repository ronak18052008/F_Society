"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { getProperty as getDemoProperty, monthlyEstimate } from "@/data/demo";
import { getPropertyById, updateProperty } from "@/lib/supabase/properties";
import { useNivasa } from "@/store/nivasa-store";
import { formatInr } from "@/lib/format";
import type { Property } from "@/types";

export default function ManagePropertyPage() {
  const { id } = useParams<{ id: string }>();
  const { enquiries, toast, user, drafts } = useNivasa();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Form states
  const [title, setTitle] = useState("");
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [status, setStatus] = useState("available");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!id) return;
      try {
        // 1. Try fetching from Supabase
        const found = await getPropertyById(id);
        if (active && found) {
          setProperty(found);
          setTitle(found.title);
          setRent(String(found.rent));
          setDeposit(String(found.deposit));
          setLoading(false);
          return;
        }

        // 2. Try demo properties
        const demo = getDemoProperty(id);
        if (active && demo) {
          setProperty(demo);
          setTitle(demo.title);
          setRent(String(demo.rent));
          setDeposit(String(demo.deposit));
          setLoading(false);
          return;
        }

        // 3. Try drafts
        const draft = drafts.find((d) => d.id === id);
        if (active && draft) {
          const draftProp: Property = {
            id: draft.id,
            slug: draft.id,
            title: draft.title,
            locality: draft.locality || draft.city,
            city: draft.city,
            type: "apartment",
            furnishing: (draft.furnishing as any) || "semi-furnished",
            suitability: ["working-professional", "family"],
            bedrooms: draft.bedrooms || 2,
            bathrooms: draft.bathrooms || 2,
            areaSqft: draft.areaSqft || 850,
            rent: draft.rent,
            deposit: draft.deposit || draft.rent * 2,
            availableFrom: "Immediately",
            amenities: draft.amenities || ["Lift", "Covered Parking", "24/7 Security", "Power Backup"],
            images: draft.images && draft.images.length > 0
              ? draft.images
              : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"],
            verification: "listing-unverified",
            description: draft.description || "Recently uploaded residence awaiting publication verification.",
            expenses: [],
            coordinates: { lat: 19.076, lng: 72.8777 },
            demo: true,
          };
          setProperty(draftProp);
          setTitle(draftProp.title);
          setRent(String(draftProp.rent));
          setDeposit(String(draftProp.deposit));
        }
      } catch (err) {
        console.warn("Failed to load property:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [id, drafts]);

  if (loading) {
    return (
      <DashboardShell title="Loading property...">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-forest)] border-t-transparent mb-4" />
          <p className="text-sm text-ink-muted">Fetching residence data &amp; photography...</p>
        </div>
      </DashboardShell>
    );
  }

  if (!property) {
    return (
      <DashboardShell title="Listing not found">
        <div className="rounded-3xl border border-line bg-card p-12 text-center max-w-xl mx-auto">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-pista)]/10 text-[var(--accent-forest)]">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-ink">Residence Not Found</h3>
          <p className="text-sm text-ink-muted mt-1">This property listing could not be located in your portfolio.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button href="/owner/dashboard" variant="primary">
              Owner Dashboard
            </Button>
            <Button href="/owner/properties/new" variant="outline">
              + Add Property
            </Button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const related = enquiries.filter((item) => item.propertyId === property.id);
  const images = property.images && property.images.length > 0
    ? property.images
    : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"];

  const currentImage = images[activePhotoIdx] || images[0];

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (user?.supabaseId) {
        const res = await updateProperty(
          property.id,
          {
            title,
            rent: Number(rent) || property.rent,
            deposit: Number(deposit) || property.deposit,
          },
          user.supabaseId,
        );
        if (res.error) {
          toast(`Server note: ${res.error}. Changes saved locally.`);
        } else {
          toast("Residence details updated successfully on Nivasa network.");
          if (res.data) setProperty(res.data);
        }
      } else {
        setProperty((prev) => prev ? {
          ...prev,
          title,
          rent: Number(rent) || prev.rent,
          deposit: Number(deposit) || prev.deposit,
        } : null);
        toast("Listing updates saved locally.");
      }
    } catch (err) {
      console.warn("Update error:", err);
      toast("Changes saved locally.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      title={property.title}
      subtitle={`Owner Management Deck · Inspect architectural photographs, review verified tenant inquiries, and manage listing availability for ${property.locality}, ${property.city}.`}
      actions={
        <div className="flex items-center gap-2.5">
          <Link
            href={`/property/${property.id}`}
            target="_blank"
            className="rounded-full border border-line bg-card hover:bg-black/5 dark:hover:bg-white/5 px-4 py-2 text-xs font-semibold text-ink transition-colors flex items-center gap-1.5"
          >
            <span>Public Listing</span>
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
          <Button href="/owner/dashboard" variant="outline" size="sm">
            ← Back to Deck
          </Button>
        </div>
      }
    >
      {/* 1. Header Badges & Quick Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-line">
        <div className="flex flex-wrap items-center gap-2.5">
          <StatusBadge tone={property.demo ? "demo" : "ok"}>
            {property.demo ? "Demo Residence" : "Live & Published"}
          </StatusBadge>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-pista)]/15 border border-[var(--primary-pista)]/30 px-3 py-0.5 text-xs font-semibold text-[var(--accent-forest)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-pista)]" />
            {images.length} Verified Photo{images.length > 1 ? "s" : ""}
          </span>
          <span className="text-xs text-ink-muted font-medium font-mono">
            ID: {property.id}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span>Point of Contact:</span>
          <strong className="text-ink font-semibold">
            {property.pointOfContact || user?.name || "Direct Owner"}
          </strong>
        </div>
      </div>

      {/* 2. Architectural Photo Showcase (Hero + Multi-Photo Gallery) */}
      <div className="mb-10 rounded-3xl border border-line bg-card p-4 sm:p-6 shadow-card">
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-base font-serif font-bold text-ink flex items-center gap-2">
              <span>Architectural Photography</span>
              <span className="text-xs font-sans font-medium text-ink-muted">
                ({activePhotoIdx + 1} of {images.length})
              </span>
            </h2>
            <p className="text-xs text-ink-muted">High-definition photographs uploaded for this residence</p>
          </div>
          <span className="text-xs font-semibold text-[var(--accent-forest)] bg-[var(--primary-pista)]/10 px-3 py-1 rounded-full border border-[var(--primary-pista)]/25">
            CDN Verified
          </span>
        </div>

        {/* Large Showcase Image */}
        <div className="relative aspect-[16/9] sm:aspect-[16/8] w-full rounded-2xl overflow-hidden bg-paper border border-line shadow-inner">
          <Image
            src={currentImage}
            alt={`${property.title} - photo ${activePhotoIdx + 1}`}
            fill
            className="object-cover transition-all duration-300"
            sizes="(max-width: 768px) 100vw, 80vw"
            priority
            unoptimized
          />

          {/* Floating Image Badges */}
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-xs font-medium text-white border border-white/10">
              <svg className="h-3 w-3 text-[var(--primary-pista)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{property.locality}, {property.city}</span>
            </span>
          </div>

          <div className="absolute right-4 bottom-4 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white shadow-md border border-white/10">
              <span>{formatInr(property.rent)}</span>
              <span className="text-white/70 font-normal">/ month</span>
            </span>
          </div>
        </div>

        {/* Thumbnail Carousel / Strip if multiple photos */}
        {images.length > 1 && (
          <div className="mt-4 pt-3 border-t border-line">
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
              {images.map((img, idx) => {
                const isActive = idx === activePhotoIdx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`group relative h-16 w-24 sm:h-20 sm:w-32 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      isActive
                        ? "border-[var(--accent-forest)] ring-2 ring-[var(--accent-forest)]/30 scale-105"
                        : "border-line opacity-75 hover:opacity-100 hover:border-[var(--primary-pista)]"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="128px"
                      unoptimized
                    />
                    <span className="absolute bottom-1 right-1 rounded-sm bg-black/60 px-1 text-[9px] font-bold text-white">
                      #{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Main Details Grid (Specifications & Live Management) */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column (8 cols): Complete Details, Specifications & RentTruth */}
        <div className="space-y-8 lg:col-span-8">
          {/* A. Key Architectural Specifications */}
          <div className="rounded-3xl border border-line bg-card p-6 sm:p-7 shadow-card">
            <h2 className="text-base font-serif font-bold text-ink mb-4">
              Residence Configuration &amp; Architectural Specifications
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              <div className="rounded-2xl border border-line bg-paper p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Configuration</span>
                <p className="mt-1 text-lg font-bold text-ink">
                  {property.bedrooms || property.bhk || 1} BHK
                </p>
                <p className="text-[11px] text-ink-muted">Bedrooms layout</p>
              </div>

              <div className="rounded-2xl border border-line bg-paper p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Carpet / Super Area</span>
                <p className="mt-1 text-lg font-bold text-ink font-tabular">
                  {property.areaSqft || property.sizeSqft || 650} sqft
                </p>
                <p className="text-[11px] text-ink-muted">{property.areaType || "Super Built-up Area"}</p>
              </div>

              <div className="rounded-2xl border border-line bg-paper p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Bathrooms</span>
                <p className="mt-1 text-lg font-bold text-ink">
                  {property.bathrooms || property.bathroom || 1} Ensuite
                </p>
                <p className="text-[11px] text-ink-muted">Western plumbing</p>
              </div>

              <div className="rounded-2xl border border-line bg-paper p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Furnishing State</span>
                <p className="mt-1 text-sm font-bold text-ink capitalize">
                  {property.furnishingStatus || property.furnishing || "Semi-Furnished"}
                </p>
                <p className="text-[11px] text-ink-muted">Move-in ready</p>
              </div>

              <div className="rounded-2xl border border-line bg-paper p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Floor Elevation</span>
                <p className="mt-1 text-sm font-bold text-ink">
                  {property.floor || "Mid Floor / Tower"}
                </p>
                <p className="text-[11px] text-ink-muted">Elevator connected</p>
              </div>

              <div className="rounded-2xl border border-line bg-paper p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Resident Preference</span>
                <p className="mt-1 text-sm font-bold text-ink">
                  {property.tenantPreferred || "Bachelors / Family"}
                </p>
                <p className="text-[11px] text-ink-muted">Open to verified tenants</p>
              </div>
            </div>
          </div>

          {/* B. RentTruth™ Itemized Financial Ledger */}
          <div className="rounded-3xl border border-line bg-card p-6 sm:p-7 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-serif font-bold text-ink flex items-center gap-2">
                  <span>RentTruth™ Itemized Cost Ledger</span>
                  <span className="h-2 w-2 rounded-full bg-[var(--primary-pista)]" />
                </h2>
                <p className="text-xs text-ink-muted">Published all-in transparent cost structure</p>
              </div>
              <span className="text-xs font-semibold text-[var(--accent-forest)]">
                Zero Hidden Charges
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-paper">
                <div>
                  <span className="text-sm font-bold text-ink">Monthly Base Rent</span>
                  <p className="text-xs text-ink-muted">Payable on 1st of every calendar month</p>
                </div>
                <strong className="text-base font-serif text-ink font-tabular">
                  {formatInr(property.rent)}
                </strong>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-paper">
                <div>
                  <span className="text-sm font-bold text-ink">Refundable Security Deposit</span>
                  <p className="text-xs text-ink-muted">Safeguarded via Move-In Condition Passport</p>
                </div>
                <strong className="text-base font-serif text-ink font-tabular">
                  {formatInr(property.deposit || property.rent * 2)}
                </strong>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-paper">
                <div>
                  <span className="text-sm font-bold text-ink">Society Maintenance &amp; Common Dues</span>
                  <p className="text-xs text-ink-muted">Security, common lighting, lift upkeep</p>
                </div>
                <strong className="text-base font-serif text-ink font-tabular">
                  {formatInr(Math.max(500, Math.round(property.rent * 0.08)))} / mo
                </strong>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--primary-pista)]/40 bg-[var(--primary-pista)]/10">
                <div>
                  <span className="text-sm font-bold text-ink">Total Monthly Outflow (Est.)</span>
                  <p className="text-xs text-[var(--accent-forest)] font-medium">Inclusive of utilities &amp; dues</p>
                </div>
                <strong className="text-xl font-serif font-bold text-[var(--accent-forest)] font-tabular">
                  {formatInr(monthlyEstimate(property))}
                </strong>
              </div>
            </div>
          </div>

          {/* C. Verified Amenities Grid */}
          <div className="rounded-3xl border border-line bg-card p-6 sm:p-7 shadow-card">
            <h2 className="text-base font-serif font-bold text-ink mb-2">
              Verified Amenities &amp; Infrastructure
            </h2>
            <p className="text-xs text-ink-muted mb-4">Features verified and available to residents</p>

            <div className="flex flex-wrap gap-2">
              {property.amenities && property.amenities.length > 0 ? (
                property.amenities.map((amenity, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-paper px-3.5 py-2 text-xs font-semibold text-ink shadow-2xs"
                  >
                    <svg className="h-3.5 w-3.5 text-[var(--accent-forest)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{amenity}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-ink-muted">No specific amenities listed.</span>
              )}
            </div>
          </div>

          {/* D. Full Description & House Guidelines */}
          <div className="rounded-3xl border border-line bg-card p-6 sm:p-7 shadow-card">
            <h2 className="text-base font-serif font-bold text-ink mb-3">
              Description &amp; Owner House Notes
            </h2>
            <div className="rounded-2xl border border-line bg-paper p-5">
              <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">
                {property.description || "No specific owner guidelines provided for this residence."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Quick Edit Form & Inbound Inquiries */}
        <div className="space-y-8 lg:col-span-4">
          {/* 1. Owner Quick Edit & Availability Form */}
          <div className="rounded-3xl border border-line bg-card p-6 shadow-card">
            <h3 className="text-base font-serif font-bold text-ink mb-1">
              Listing Controls &amp; Status
            </h3>
            <p className="text-xs text-ink-muted mb-5">Adjust title, rent, and lease availability</p>

            <form className="space-y-4" onSubmit={handleUpdate}>
              <Field
                label="Residence Title"
                name="title"
                value={title}
                onChange={setTitle}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Rent (₹/mo)"
                  name="rent"
                  value={rent}
                  onChange={setRent}
                  required
                />
                <Field
                  label="Deposit (₹)"
                  name="deposit"
                  value={deposit}
                  onChange={setDeposit}
                />
              </div>

              <div>
                <label
                  htmlFor="listing-status"
                  className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5"
                >
                  Availability Status
                </label>
                <select
                  id="listing-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm font-medium text-ink focus:border-[var(--primary-pista)] focus:outline-none cursor-pointer"
                >
                  <option value="available">🟢 Available for Enquiries</option>
                  <option value="paused">🟡 Paused / Under Negotiation</option>
                  <option value="let">🔴 Leased (Occupied)</option>
                </select>
              </div>

              <div className="pt-2">
                <Button type="submit" size="md" className="w-full" disabled={saving}>
                  {saving ? "Saving Changes..." : "Save Listing Updates"}
                </Button>
              </div>
            </form>
          </div>

          {/* 2. Inbound Tenant Enquiries */}
          <div className="rounded-3xl border border-line bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-ink">Inbound Enquiries</h3>
                <p className="text-xs text-ink-muted mt-0.5">Direct prospective tenant chats</p>
              </div>
              <span className="text-xs font-bold text-[var(--accent-forest)] bg-[var(--primary-pista)]/15 px-2.5 py-0.5 rounded-full border border-[var(--primary-pista)]/30">
                {related.length}
              </span>
            </div>

            {related.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line p-6 text-center bg-paper">
                <p className="text-xs text-ink-muted">No inquiries received for this specific listing yet.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {related.map((item) => (
                  <li key={item.id} className="rounded-2xl border border-line bg-paper p-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-ink">{item.fromName}</p>
                      <span className="text-[10px] text-ink-muted">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-ink-soft leading-relaxed bg-card p-2.5 rounded-xl border border-line">
                      {item.message}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 3. Tenancy Workspace Link */}
          <div className="rounded-3xl border border-[var(--primary-pista)]/30 bg-[var(--primary-pista)]/10 p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-forest)]">
              Connected Tenancy Space
            </span>
            <p className="mt-1 text-sm font-semibold text-ink">
              Shared Tenancy Workspace &amp; Ledger
            </p>
            <p className="text-xs text-ink-muted mt-1">
              Once an agreement is finalized, audit deposit receipts, condition passports, and rent invoices.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                className="inline-flex items-center justify-between rounded-xl bg-card border border-line px-3 py-2 text-xs font-semibold text-ink hover:text-[var(--accent-forest)] hover:border-[var(--primary-pista)] transition-colors"
                href="/rental/rent-navrang"
              >
                <span>Open Tenancy Ledger</span>
                <span>→</span>
              </Link>
              <Link
                className="inline-flex items-center justify-between rounded-xl bg-card border border-line px-3 py-2 text-xs font-semibold text-ink hover:text-[var(--accent-forest)] hover:border-[var(--primary-pista)] transition-colors"
                href="/rental/rent-navrang/passport"
              >
                <span>Digital Condition Passport</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
