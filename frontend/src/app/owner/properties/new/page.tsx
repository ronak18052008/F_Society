"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Field, SelectField, TextArea } from "@/components/ui/field";
import { UploadField } from "@/components/ui/upload-field";
import { useNestora } from "@/store/nestora-store";
import { uploadFile } from "@/lib/supabase/storage";
import { createProperty } from "@/lib/supabase/properties";

export default function AddPropertyPage() {
  const router = useRouter();
  const { addDraft, toast, user } = useNestora();
  const [title, setTitle] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("Ahmedabad");
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [amenities, setAmenities] = useState("Lift, Parking, 24/7 Security, Power Backup");
  const [availability, setAvailability] = useState("2026-10-01");
  const [reqs, setReqs] = useState("Working professionals preferred.");
  const [fileName, setFileName] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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
        setImageUrl(res.url);
        toast("Property photograph uploaded successfully.");
      }
    } catch (err) {
      console.warn("Upload error:", err);
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
            images: imageUrl ? [imageUrl] : [defaultImage],
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
            ? `Listing saved locally with image ${fileName}.`
            : "Listing saved locally.",
        );
      }

      addDraft({ title, city, rent: Number(rent) });
      router.push("/owner/dashboard");
    } catch (err) {
      console.warn("Error creating property:", err);
      addDraft({ title, city, rent: Number(rent) });
      router.push("/owner/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell
      title="List New Residence"
      subtitle="Publish a verified architectural residence to the NIVASA network with itemized cost ledgers and photo verification."
    >
      <div className="max-w-2xl rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none">
        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-600 dark:text-rose-300 font-medium">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Section 1: Overview */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">1. Residence Identity</h3>
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
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">2. Financial Terms (RentTruth™)</h3>
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
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">3. Specifications &amp; Move-in</h3>
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
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">4. Architectural Photography</h3>
            <UploadField
              label="Upload Primary Showcase Photograph"
              accept="image/*"
              hint="Uploaded to public CDN storage for horizon card rendering."
              uploading={uploadingImage}
              previewUrl={imageUrl || undefined}
              onSelect={handleImageSelect}
            />
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
