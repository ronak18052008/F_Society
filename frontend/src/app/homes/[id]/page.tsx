"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { PropertyGallery } from "@/components/property/property-gallery";
import { ExpenseBreakdown } from "@/components/property/expense-breakdown";
import { Button } from "@/components/ui/button";
import { Field, TextArea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { getOwner, getProperty as getDemoProperty, monthlyEstimate } from "@/data/demo";
import { getPropertyById } from "@/lib/supabase/properties";
import { createClient } from "@/lib/supabase/client";
import { formatInr } from "@/lib/format";
import { useNivasa } from "@/store/nivasa-store";
import { ArchitecturalHero } from "@/components/three/architectural-hero";
import type { Property } from "@/types";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(() => getDemoProperty(id) || null);
  const [loading, setLoading] = useState(!property);
  const { savedIds, toggleSave, addEnquiry, user, toast } = useNivasa();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(
    "I would like to visit this week. Please share a suitable time.",
  );
  const [name, setName] = useState(user?.name ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      try {
        const found = await getPropertyById(id);
        if (active && found) {
          setProperty(found);
        }
      } catch (err) {
        console.warn("Could not fetch remote property details:", err);
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
        <div className="mx-auto max-w-xl px-5 py-28 text-center">
          <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4" />
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Loading residence telemetry...</p>
        </div>
      </SiteShell>
    );
  }

  if (!property) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-xl px-5 py-24 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Listing Not Found</h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            This residence is currently unavailable or has been archived from the network.
          </p>
          <div className="mt-6">
            <Button href="/homes">Back to residences</Button>
          </div>
        </div>
      </SiteShell>
    );
  }

  const owner = getOwner(property.ownerId) || {
    id: property.ownerId,
    name: "Property Host",
    city: property.city,
    listedSince: "2025",
    responseNote: "Responds promptly to verified inquiries.",
  };
  const saved = savedIds.includes(property.id);

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <a href="/homes" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Residences</a>
          <span>/</span>
          <span className="text-slate-400 dark:text-slate-500">{property.city}</span>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-xs">{property.title}</span>
        </div>

        {/* Gallery */}
        <PropertyGallery images={property.images} title={property.title} />

        {/* Main Content Layout */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Left Column: Residence Specs & Details */}
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge tone={property.demo ? "demo" : "ok"}>
                {property.demo ? "Demo Listing" : "NIVASA Verified"}
              </StatusBadge>
              <span className="rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/70 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {property.bedrooms} BHK · {property.type}
              </span>
              <span className="rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/70 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">
                {property.furnishing}
              </span>
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              {property.title}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{property.locality}, {property.city}</span>
            </p>

            {/* Core Specifications Bento Grid */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Base Rent</span>
                <span className="mt-1 block text-lg font-bold text-slate-900 dark:text-white">{formatInr(property.rent)}</span>
                <span className="text-[10px] text-slate-500">per month</span>
              </div>
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Security Deposit</span>
                <span className="mt-1 block text-lg font-bold text-slate-900 dark:text-white">{formatInr(property.deposit)}</span>
                <span className="text-[10px] text-slate-500">fully refundable</span>
              </div>
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Carpet Area</span>
                <span className="mt-1 block text-lg font-bold text-slate-900 dark:text-white">{property.areaSqft} sqft</span>
                <span className="text-[10px] text-slate-500">verified layout</span>
              </div>
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Possession</span>
                <span className="mt-1 block text-lg font-bold text-slate-900 dark:text-white">{property.availableFrom}</span>
                <span className="text-[10px] text-slate-500">ready to move</span>
              </div>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">About the Residence</h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Included Amenities & Features</h2>
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {property.amenities.map((item) => (
                  <li
                    key={item}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs"
                  >
                    <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3D Spatial Architectural Preview */}
            <div className="mt-10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Spatial Habitat 3D Telemetry</h2>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Interactive WebGL</span>
              </div>
              <div className="relative h-80 w-full overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-[#050a17] shadow-xl">
                <ArchitecturalHero />
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Action Dock & RentTruth Breakdown */}
          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Financial Action Dock */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                      {formatInr(property.rent)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">/ month</span>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Direct Deal
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Est. monthly living outlay: <strong className="text-slate-700 dark:text-slate-200">{formatInr(monthlyEstimate(property))}</strong>
                </p>

                <div className="mt-6 flex flex-col gap-3">
                  <Button size="lg" onClick={() => setOpen(true)}>
                    Connect With Owner Directly
                  </Button>
                  <Button
                    variant="line"
                    size="md"
                    onClick={() => toggleSave(property.id)}
                  >
                    {saved ? "Saved in Shortlist" : "Shortlist Residence"}
                  </Button>
                  <Button href={`/renttruth/${property.id}`} variant="ghost" size="sm">
                    View Full RentTruth™ Breakdown →
                  </Button>
                </div>
              </div>

              {/* Verified Owner Card */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Property Host
                </span>
                <div className="mt-2 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{owner?.name}</h3>
                  <StatusBadge
                    tone={
                      property.verification === "identity-checked" ? "ok" : "warn"
                    }
                  >
                    {property.verification.replaceAll("-", " ")}
                  </StatusBadge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{owner?.city} · Member since {owner?.listedSince}</p>
                <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  &ldquo;{owner?.responseNote}&rdquo;
                </p>
              </div>

              {/* Itemized Expense Breakdown */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <ExpenseBreakdown lines={property.expenses} />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Direct Contact Modal */}
      <Modal open={open} title="Connect With Property Host" onClose={() => setOpen(false)}>
        <p className="mb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Send a direct, verified inquiry to the host regarding site visits, lease tenure, and move-in timeline without intermediaries.
        </p>
        <div className="space-y-4">
          <Field
            label="Your Name"
            name="name"
            value={name}
            onChange={setName}
            required
            error={error && !name ? error : undefined}
          />
          <TextArea
            label="Message or Preferred Visit Date"
            name="message"
            value={message}
            onChange={setMessage}
          />
          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
          <Button
            disabled={submitting}
            onClick={async () => {
              if (!name.trim() || message.trim().length < 12) {
                setError("Name and a short message (12+ characters) are required.");
                return;
              }
              setSubmitting(true);
              setError("");
              try {
                const supabase = createClient();
                if (supabase && user?.supabaseId) {
                  await supabase.from("enquiries").insert({
                    property_id: property.id,
                    from_user: user.supabaseId,
                    from_name: name,
                    message,
                    status: "sent",
                  });
                }
                addEnquiry(property.id, `${name}: ${message}`);
                toast("Enquiry sent to the owner.");
                setOpen(false);
              } catch (err) {
                console.warn("Failed to submit enquiry to server:", err);
                addEnquiry(property.id, `${name}: ${message}`);
                toast("Enquiry recorded locally.");
                setOpen(false);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitting ? "Transmitting..." : "Send Direct Enquiry"}
          </Button>
        </div>
      </Modal>
    </SiteShell>
  );
}
