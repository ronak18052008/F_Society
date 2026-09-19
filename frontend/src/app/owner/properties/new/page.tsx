"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Field, SelectField, TextArea } from "@/components/ui/field";
import { UploadField } from "@/components/ui/upload-field";
import { useNivasa } from "@/store/nivasa-store";
import { uploadFile } from "@/lib/supabase/storage";
import { createProperty } from "@/lib/supabase/properties";

export default function AddPropertyPage() {
  const router = useRouter();
  const { addDraft, toast, user } = useNivasa();
  const [title, setTitle] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("Ahmedabad");
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [amenities, setAmenities] = useState("Lift, Parking, 24/7 Security, Power Backup");
  const [availability, setAvailability] = useState("2026-10-01");
  const [reqs, setReqs] = useState("Working professionals preferred.");
  const [fileName, setFileName] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [furnishing, setFurnishing] = useState("semi-furnished");
  const [error, setError] = useState("");

  const handleImageSelect = async (file: File) => {
    setFileName(file.name);
    setUploadingImage(true);
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `${user?.supabaseId || "guest"}/${Date.now()}-${sanitizedName}`;
      const res = await uploadFile("property-images", path, file);
      if (res.url) {
        setImageUrls((prev) => [...prev, res.url!]);
        toast(`Photograph #${imageUrls.length + 1} uploaded successfully.`);
      }
    } catch (err) {
      console.warn("Upload error:", err);
      toast("Photograph attached locally.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (title.trim().length < 4 || !Number(rent)) {
      setError("Title and a numeric rent are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const amenitiesList = amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      const defaultImage =
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80";
      const finalImages = imageUrls.length > 0 ? imageUrls : [defaultImage];

      if (user?.supabaseId) {
        const res = await createProperty(
          {
            title,
            locality: locality.trim() || city,
            city,
            rent: Number(rent),
            deposit: Number(deposit) || Number(rent) * 2,
            amenities: amenitiesList,
            availableFrom: availability,
            furnishing: furnishing as "furnished" | "semi-furnished" | "unfurnished",
            description: reqs,
            images: finalImages,
          },
          user.supabaseId,
        );

        if (res.error) {
          toast(`Server note: ${res.error}. Saved locally.`);
        } else {
          toast("Property listing published successfully to the network!");
        }
      } else {
        toast(
          fileName
            ? `Listing saved locally with ${finalImages.length} photograph(s).`
            : "Listing saved locally.",
        );
      }

      addDraft({
        title,
        city,
        rent: Number(rent),
        locality: locality.trim() || city,
        deposit: Number(deposit) || Number(rent) * 2,
        images: finalImages,
        amenities: amenitiesList,
        furnishing,
        description: reqs,
      });
      router.push("/owner/dashboard");
    } catch (err) {
      console.warn("Error creating property:", err);
      const defaultImage =
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80";
      const finalImages = imageUrls.length > 0 ? imageUrls : [defaultImage];
      addDraft({
        title,
        city,
        rent: Number(rent),
        locality: locality.trim() || city,
        deposit: Number(deposit) || Number(rent) * 2,
        images: finalImages,
      });
      router.push("/owner/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell
      title="List New Residence"
      subtitle="Publish a verified architectural residence to the Nivasa network with itemized cost ledgers and photo verification."
    >
      <div className="max-w-2xl rounded-3xl border border-line bg-card p-6 sm:p-8 shadow-card">
        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-600 dark:text-rose-300 font-medium">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Section 1: Overview */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink-muted mb-3">1. Residence Identity</h3>
            <div className="space-y-4">
              <Field
                label="Residence Title"
                name="title"
                value={title}
                onChange={setTitle}
                placeholder="e.g. Modern Courtyard Apartment, Sunlit Terrace Penthouse"
                error={error}
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Locality / Neighborhood"
                  name="locality"
                  value={locality}
                  onChange={setLocality}
                  placeholder="e.g. Navrangpura, Indiranagar"
                  required
                />
                <Field
                  label="City Hub"
                  name="city"
                  value={city}
                  onChange={setCity}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Financial Terms */}
          <div className="pt-4 border-t border-line">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink-muted mb-3">2. Financial Terms (RentTruth™)</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Monthly Base Rent (₹)"
                name="rent"
                value={rent}
                onChange={setRent}
                placeholder="32000"
                required
              />
              <Field
                label="Refundable Security Deposit (₹)"
                name="deposit"
                value={deposit}
                onChange={setDeposit}
                placeholder="64000"
              />
            </div>
          </div>

          {/* Section 3: Specs & Amenities */}
          <div className="pt-4 border-t border-line">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink-muted mb-3">3. Specifications &amp; Move-in</h3>
            <div className="grid gap-4 sm:grid-cols-2 mb-4">
              <SelectField
                label="Furnishing Tier"
                value={furnishing}
                onChange={setFurnishing}
                options={[
                  { value: "furnished", label: "Fully Furnished" },
                  { value: "semi-furnished", label: "Semi-Furnished" },
                  { value: "unfurnished", label: "Unfurnished Canvas" },
                ]}
              />
              <Field
                label="Availability Date"
                name="availability"
                type="date"
                value={availability}
                onChange={setAvailability}
              />
            </div>
            <Field
              label="Amenities (comma separated)"
              name="amenities"
              value={amenities}
              onChange={setAmenities}
              placeholder="Lift, Covered Parking, 24/7 Security, Balcony"
            />
            <div className="mt-4">
              <TextArea
                label="Description &amp; Resident Preferences"
                name="reqs"
                value={reqs}
                onChange={setReqs}
                placeholder="Describe lighting, cross-ventilation, transit proximity..."
              />
            </div>
          </div>

          {/* Section 4: Imagery */}
          <div className="pt-4 border-t border-line space-y-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink-muted mb-1">
                4. Architectural Photography
              </h3>
              <p className="text-xs text-ink-muted mb-3">
                Upload photographs of your residence (living room, bedroom, kitchen, exterior). You can upload multiple photographs.
              </p>
            </div>

            <UploadField
              label={imageUrls.length > 0 ? "Add Another Photograph" : "Upload Residence Photograph"}
              accept="image/*"
              hint="Uploaded securely to public CDN storage for card, gallery, and detail views."
              uploading={uploadingImage}
              onSelect={handleImageSelect}
            />

            {/* Uploaded Photographs Grid Preview */}
            {imageUrls.length > 0 && (
              <div className="rounded-2xl border border-line bg-paper p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-ink flex items-center gap-2">
                    <span>Uploaded Photographs</span>
                    <span className="rounded-full bg-[var(--primary-pista)]/20 text-[var(--accent-forest)] px-2 py-0.5 text-[11px] font-semibold">
                      {imageUrls.length} Photo{imageUrls.length > 1 ? "s" : ""}
                    </span>
                  </span>
                  <span className="text-[11px] text-ink-muted">First photo will be showcase hero</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="group relative aspect-[16/10] rounded-xl overflow-hidden border border-line bg-card shadow-xs">
                      <Image
                        src={url}
                        alt={`Uploaded photo ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="200px"
                        unoptimized
                      />
                      <div className="absolute top-1.5 left-1.5 z-10">
                        {idx === 0 ? (
                          <span className="rounded-md bg-[var(--accent-forest)] text-white px-2 py-0.5 text-[10px] font-bold shadow-xs">
                            ★ Primary
                          </span>
                        ) : (
                          <span className="rounded-md bg-black/60 text-white px-1.5 py-0.5 text-[10px] font-medium">
                            #{idx + 1}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setImageUrls((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1.5 right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors cursor-pointer text-xs"
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button type="submit" size="lg" className="w-full" disabled={submitting || uploadingImage}>
              {submitting ? "Publishing Residence..." : "Publish Verified Residence Listing"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
