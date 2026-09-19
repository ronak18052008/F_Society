"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { PropertyGallery } from "@/components/property/property-gallery";
import { ExpenseBreakdown } from "@/components/property/expense-breakdown";
import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { Field, TextArea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatInr } from "@/lib/format";
import { monthlyEstimate } from "@/data/demo";
import { getPropertyById, getSimilarProperties } from "@/lib/supabase/properties";
import { useNivasa } from "@/store/nivasa-store";
import type { Property } from "@/types";
import { RentalRiskCard } from "@/components/risk/rental-risk-card";
<<<<<<< HEAD
import { AuthenticityCard } from "@/components/authenticity/authenticity-card";
import { PropertyReputationGraph } from "@/components/property/property-reputation-graph";
=======
>>>>>>> origin/main

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [similar, setSimilar] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { savedIds, toggleSave, user, toast } = useNivasa();

  const [openEnquiry, setOpenEnquiry] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState(
    "Hello, I am interested in scheduling a walkthrough for this residence. Please let me know available slots."
  );
  const [senderName, setSenderName] = useState(user?.name ?? "");
  const [senderContact, setSenderContact] = useState(user?.email ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const found = await getPropertyById(id);
        if (active && found) {
          setProperty(found);
          const sim = await getSimilarProperties(found, 3);
          if (active) setSimilar(sim);
        }
      } catch (err) {
        console.warn("Error fetching property details:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-7xl px-4 py-28 text-center">
          <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-[#6E9271] border-t-transparent mb-4" />
          <p className="text-xs font-bold uppercase tracking-wider text-[#6E9271] dark:text-[#A3B899]">
            Loading Residence Telemetry...
          </p>
        </div>
      </SiteShell>
    );
  }

  if (!property) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-xl px-4 py-28 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7ca982]/15 text-[#1d3122] dark:text-[#a3caa6]">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-serif font-bold text-ink">Residence Not Found</h1>
          <p className="mt-3 text-sm text-ink-muted">
            The listing you are searching for is not available or may have been updated.
          </p>
          <div className="mt-6">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 rounded-full bg-[#7ca982] hover:bg-[#6b9a71] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:shadow-md transition"
            >
              Browse 4,746+ Residences
            </Link>
          </div>
        </div>
      </SiteShell>
    );
  }

  const saved = savedIds.includes(property.id);

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !enquiryMessage.trim()) return;

    setSubmitting(true);
    // Simulate / record enquiry
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    toast(`Inquiry dispatched for ${property.title}`);
    setTimeout(() => {
      setOpenEnquiry(false);
      setSubmitted(false);
    }, 1500);
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs font-medium text-ink-muted">
          <Link href="/properties" className="hover:text-[#7ca982] transition">Residences</Link>
          <span>/</span>
          <Link href={`/properties?city=${property.city}`} className="hover:text-[#7ca982] transition">
            {property.city}
          </Link>
          <span>/</span>
          <span className="text-ink font-semibold truncate max-w-xs">{property.title}</span>
        </div>

        {/* High Resolution Gallery */}
        <PropertyGallery images={property.images} title={property.title} />

        {/* Main Content Layout */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Left Column: Residence Specifications & Provenance */}
          <div className="space-y-8">
            {/* Top Badges & Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <StatusBadge tone="ok">Nivasa Verified Residence</StatusBadge>
                {property.pointOfContact && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#faf7f0]/95 dark:bg-[#142018]/95 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-[#1d3122] dark:text-[#f5f9f6] border border-[#e5dfc5] dark:border-[#2a3f31] shadow-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#7ca982]" />
                    {property.pointOfContact}
                  </span>
                )}

                <span className="rounded-full border border-line bg-card px-3 py-1 text-xs font-semibold text-ink">
                  {property.bhk || property.bedrooms} BHK · {property.type}
                </span>

                <span className="rounded-full border border-line bg-card px-3 py-1 text-xs font-semibold text-ink capitalize">
                  {property.furnishingStatus || property.furnishing}
                </span>

                {property.tenantPreferred && (
                  <span className="rounded-full bg-[#7ca982]/15 border border-[#7ca982]/30 px-3 py-1 text-xs font-semibold text-[#1d3122] dark:text-[#a3caa6]">
                    Tenant: {property.tenantPreferred}
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-3xl sm:text-4xl font-serif font-bold tracking-tight text-ink">
                {property.title}
              </h1>

              <p className="mt-2 text-sm sm:text-base text-ink-muted flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#6E9271] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{property.locality}, {property.city}</span>
              </p>
            </div>

            {/* Core Specifications Bento Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-line bg-card p-4 shadow-card">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">Monthly Rent</span>
                <span className="mt-1 block text-xl font-serif font-bold text-ink font-tabular">{formatInr(property.rent)}</span>
                <span className="text-[10px] text-ink-muted">₹0 Brokerage</span>
              </div>

              <div className="rounded-2xl border border-line bg-card p-4 shadow-card">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">Deposit</span>
                <span className="mt-1 block text-xl font-serif font-bold text-ink font-tabular">{formatInr(property.deposit)}</span>
                <span className="text-[10px] text-ink-muted">fully refundable</span>
              </div>

              <div className="rounded-2xl border border-line bg-card p-4 shadow-card">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">Area Size</span>
                <span className="mt-1 block text-xl font-serif font-bold text-ink font-tabular">{property.sizeSqft || property.areaSqft} sqft</span>
                <span className="text-[10px] text-ink-muted">{property.areaType || "Super Area"}</span>
              </div>

              <div className="rounded-2xl border border-line bg-card p-4 shadow-card">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">Bathrooms</span>
                <span className="mt-1 block text-xl font-serif font-bold text-ink font-tabular">{property.bathrooms || property.bathroom || 1} Bath</span>
                <span className="text-[10px] text-ink-muted">fittings included</span>
              </div>
            </div>

            {/* Secondary Attributes Grid (Floor, Tenant Preference, Contact, Year) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-line bg-card p-4 shadow-card">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">Floor Level</span>
                <span className="mt-1 block text-sm font-semibold text-ink truncate">{property.floor || "Standard Floor"}</span>
              </div>

              <div className="rounded-2xl border border-line bg-card p-4 shadow-card">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">Preferred Tenant</span>
                <span className="mt-1 block text-sm font-semibold text-ink truncate">{property.tenantPreferred || "Open to all"}</span>
              </div>

              <div className="rounded-2xl border border-line bg-card p-4 shadow-card">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">Point of Contact</span>
                <span className="mt-1 block text-sm font-semibold text-ink truncate">{property.pointOfContact || "Contact Owner"}</span>
              </div>

              <div className="rounded-2xl border border-line bg-card p-4 shadow-card">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">Availability</span>
                <span className="mt-1 block text-sm font-semibold text-ink font-tabular">{property.displayPostedOn || property.availableFrom}</span>
              </div>
            </div>

            {/* Residence Verification & Tenancy Details */}
            <div className="rounded-3xl border border-[#7ca982]/30 bg-[#7ca982]/5 p-6 shadow-card">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7ca982]/20 text-[#1d3122] dark:text-[#a3caa6]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">Verified Tenancy & Listing Audit</h3>
                  <p className="text-xs text-ink-muted">Nivasa Metropolitan Residential Network</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-xl border border-line bg-card p-3">
                  <span className="text-ink-muted block text-[11px]">Direct Point of Contact:</span>
                  <strong className="text-ink font-semibold">{property.pointOfContact || "Verified Owner / Listing Partner"}</strong>
                </div>
                <div className="rounded-xl border border-line bg-card p-3">
                  <span className="text-ink-muted block text-[11px]">Availability Status:</span>
                  <strong className="text-[#57875d] dark:text-[#a3caa6] font-tabular">{property.displayPostedOn ? `Listed ${property.displayPostedOn}` : "Immediate Move-in"}</strong>
                </div>
              </div>

              <p className="mt-3 text-xs text-ink-muted leading-relaxed">
                This property is registered in the Nivasa metropolitan directory. Specifications including configuration ({property.bhk || property.bedrooms} BHK), living area ({property.sizeSqft || property.areaSqft} sqft), floor level ({property.floor || "Standard"}), and preferred tenancy ({property.tenantPreferred || "Open to all"}) have been verified.
              </p>
            </div>

            {/* Feature 2: Rental Risk Engine Analysis Card */}
            <RentalRiskCard propertyId={property.id} property={property} />

            {/* Feature 3: AI Scam / Fake Listing Detector Card */}
            <AuthenticityCard propertyId={property.id} property={property} />

            {/* Feature 6: Property Reputation Graph */}
            <PropertyReputationGraph propertyId={property.id} />
            {/* About the Residence */}
            <div>
              <h2 className="text-xl font-serif font-bold text-ink">Residence Description</h2>
              <p className="mt-3 text-sm sm:text-base text-ink-muted leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Included Amenities & Features */}
            <div>
              <h2 className="text-xl font-serif font-bold text-ink">Amenities & Infrastructure</h2>
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {property.amenities.map((item) => (
                  <li
                    key={item}
                    className="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-3.5 py-2 text-xs font-semibold text-ink shadow-xs"
                  >
                    <svg className="w-4 h-4 text-[#7ca982] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Sticky Action Dock & RentTruth Breakdown */}
          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Financial Action Dock */}
              <div className="rounded-3xl border border-line bg-card p-6 shadow-card backdrop-blur-xl">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl sm:text-4xl font-serif font-bold text-ink font-tabular">
                      {formatInr(property.rent)}
                    </span>
                    <span className="text-xs text-ink-muted ml-1.5">/ month</span>
                  </div>
                  <span className="rounded-full bg-[#7ca982]/15 px-2.5 py-1 text-[11px] font-bold text-[#1d3122] dark:text-[#a3caa6] border border-[#7ca982]/30">
                    Direct Listing
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-ink-muted">
                  All-in estimated living outlay:{" "}
                  <strong className="text-ink font-tabular">{formatInr(monthlyEstimate(property))}</strong>
                </p>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenEnquiry(true)}
                    className="w-full rounded-2xl bg-[#7ca982] hover:bg-[#6b9a71] py-3.5 px-4 text-sm font-semibold text-white shadow-card hover:shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Connect With {property.pointOfContact || "Owner"}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleSave(property.id)}
                    className="w-full rounded-2xl border border-line bg-paper py-3 px-4 text-xs font-semibold text-ink hover:border-[#7ca982] transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg
                      className={`w-4 h-4 ${saved ? "fill-rose-500 text-rose-500" : "fill-none text-ink-muted"}`}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{saved ? "Saved to Favorites" : "Save Residence"}</span>
                  </button>
                </div>

                <div className="mt-6 pt-5 border-t border-line/60 grid grid-cols-2 gap-3 text-center text-xs">
                  <div>
                    <span className="text-[11px] text-ink-muted block">Security Deposit</span>
                    <strong className="text-ink font-tabular">{formatInr(property.deposit)}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-ink-muted block">Brokerage Fee</span>
                    <strong className="text-[#6E9271] dark:text-[#A3B899]">₹0 (Direct)</strong>
                  </div>
                </div>
              </div>

              {/* RentTruth Financial Transparency Breakdown */}
              <ExpenseBreakdown lines={property.expenses} />
            </div>
          </aside>
        </div>

        {/* Similar Residences Recommendations Deck */}
        {similar.length > 0 && (
          <div className="mt-20 pt-10 border-t border-line">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#6E9271] dark:text-[#A3B899]">
                  Curated Matches
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink mt-1">
                  Similar {property.bhk || property.bedrooms} BHK Residences in {property.city}
                </h2>
              </div>

              <Link
                href={`/properties?city=${property.city}&bhk=${property.bhk || property.bedrooms}`}
                className="text-xs font-semibold text-[#6E9271] dark:text-[#A3B899] hover:underline hidden sm:inline"
              >
                View all in {property.city} →
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((simProp) => (
                <PropertyCard key={simProp.id} property={simProp} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enquiry / Viewing Request Modal */}
      <Modal open={openEnquiry} onClose={() => setOpenEnquiry(false)} title="Connect With Residence Host">
        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#6E9271]/20 text-[#6E9271]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-ink">Inquiry Received!</h3>
            <p className="mt-1 text-xs text-ink-muted">
              The host will respond to your contact coordinates regarding {property.title}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendEnquiry} className="space-y-4 pt-2">
            <p className="text-xs text-ink-muted">
              You are sending a direct inquiry for <strong className="text-ink">{property.title}</strong> in {property.locality}, {property.city}.
            </p>

            <Field
              label="Your Full Name"
              name="senderName"
              required
              value={senderName}
              onChange={(val) => setSenderName(val)}
              placeholder="e.g. Ronak Marvaniya"
            />

            <Field
              label="Contact Email / Phone"
              name="senderContact"
              required
              value={senderContact}
              onChange={(val) => setSenderContact(val)}
              placeholder="e.g. ronak@example.com or +91 9876543210"
            />

            <TextArea
              label="Message to Host"
              name="enquiryMessage"
              value={enquiryMessage}
              onChange={(val) => setEnquiryMessage(val)}
              rows={3}
            />

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpenEnquiry(false)}
                className="rounded-xl border border-line bg-card px-4 py-2 text-xs font-semibold text-ink hover:bg-paper transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#7ca982] hover:bg-[#6b9a71] px-5 py-2 text-xs font-semibold text-white hover:shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Sending..." : "Submit Inquiry"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </SiteShell>
  );
}
