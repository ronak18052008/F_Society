"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Field, SelectField, TextArea } from "@/components/ui/field";
import { UploadField } from "@/components/ui/upload-field";
import { useNestora } from "@/store/nestora-store";

export default function AddPropertyPage() {
  const router = useRouter();
  const { addDraft, toast } = useNestora();
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("Ahmedabad");
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [amenities, setAmenities] = useState("Lift, Parking");
  const [costs, setCosts] = useState("Maintenance 3000");
  const [availability, setAvailability] = useState("2026-10-01");
  const [reqs, setReqs] = useState("Working professionals preferred.");
  const [fileName, setFileName] = useState<string | null>(null);
  const [furnishing, setFurnishing] = useState("semi-furnished");
  const [error, setError] = useState("");

  return (
    <DashboardShell title="Add property">
      <p className="mb-8 max-w-xl text-sm text-ink-soft">
        Drafts stay in this browser. Photographs are not uploaded to storage.
      </p>
      <form
        className="max-w-xl space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (title.trim().length < 4 || !Number(rent)) {
            setError("Title and a numeric rent are required.");
            return;
          }
          addDraft({ title, city, rent: Number(rent) });
          toast(
            fileName
              ? `Draft saved with local file ${fileName}. Deposit ${deposit || "n/a"}.`
              : "Draft saved locally.",
          );
          router.push("/owner/dashboard");
        }}
      >
        <Field label="Title" name="title" value={title} onChange={setTitle} error={error} required />
        <Field label="City" name="city" value={city} onChange={setCity} required />
        <Field label="Monthly rent (₹)" name="rent" value={rent} onChange={setRent} required />
        <Field label="Deposit (₹)" name="deposit" value={deposit} onChange={setDeposit} />
        <Field label="Amenities" name="amenities" value={amenities} onChange={setAmenities} />
        <Field label="Recurring costs" name="costs" value={costs} onChange={setCosts} />
        <Field
          label="Availability"
          name="availability"
          type="date"
          value={availability}
          onChange={setAvailability}
        />
        <SelectField
          label="Furnishing"
          value={furnishing}
          onChange={setFurnishing}
          options={[
            { value: "furnished", label: "Furnished" },
            { value: "semi-furnished", label: "Semi-furnished" },
            { value: "unfurnished", label: "Unfurnished" },
          ]}
        />
        <TextArea label="Tenant requirements" name="reqs" value={reqs} onChange={setReqs} />
        <UploadField
          label="Photographs"
          accept="image/*"
          hint="Files remain on your device."
          onSelect={(file) => setFileName(file.name)}
        />
        <Button type="submit">Save draft listing</Button>
      </form>
    </DashboardShell>
  );
}
