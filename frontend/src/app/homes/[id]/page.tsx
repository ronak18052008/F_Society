"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { PropertyGallery } from "@/components/property/property-gallery";
import { ExpenseBreakdown } from "@/components/property/expense-breakdown";
import { Button } from "@/components/ui/button";
import { Field, TextArea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { getOwner, getProperty, monthlyEstimate } from "@/data/demo";
import { formatInr } from "@/lib/format";
import { useNestora } from "@/store/nestora-store";
import { ArchitecturalHero } from "@/components/three/architectural-hero";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const property = getProperty(id);
  const { savedIds, toggleSave, addEnquiry, user } = useNestora();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(
    "I would like to visit this week. Please share a suitable time.",
  );
  const [name, setName] = useState(user?.name ?? "");
  const [error, setError] = useState("");

  if (!property) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-xl px-5 py-20">
          <h1 className="font-serif text-4xl">Listing not found</h1>
          <p className="mt-3 text-sm text-ink-soft">
            This id is not in the demo inventory.
          </p>
          <div className="mt-6">
            <Button href="/homes">Back to homes</Button>
          </div>
        </div>
      </SiteShell>
    );
  }
  const owner = getOwner(property.ownerId);
  const saved = savedIds.includes(property.id);

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-5 py-10">
        <PropertyGallery images={property.images} title={property.title} />
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <StatusBadge tone="demo">Demo listing</StatusBadge>
            <h1 className="mt-4 font-serif text-5xl">{property.title}</h1>
            <p className="mt-2 text-ink-soft">
              {property.locality}, {property.city}
            </p>
            <p className="mt-6 max-w-xl text-sm leading-6">{property.description}</p>
            <dl className="mt-8 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <dt className="text-ink-soft">Rent</dt>
                <dd>{formatInr(property.rent)}</dd>
              </div>
              <div>
                <dt className="text-ink-soft">Deposit</dt>
                <dd>{formatInr(property.deposit)}</dd>
              </div>
              <div>
                <dt className="text-ink-soft">Area</dt>
                <dd>{property.areaSqft} sqft</dd>
              </div>
              <div>
                <dt className="text-ink-soft">Available</dt>
                <dd>{property.availableFrom}</dd>
              </div>
            </dl>
            <h2 className="mt-10 font-serif text-3xl">Amenities</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {property.amenities.map((item) => (
                <li key={item} className="border border-line px-3 py-1 text-sm">
                  {item}
                </li>
              ))}
            </ul>
            <h2 className="mt-10 font-serif text-3xl">Location</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Approximate coordinates {property.coordinates.lat},{" "}
              {property.coordinates.lng}. No live map is connected in this
              prototype.
            </p>
            <div className="mt-10 h-72 border border-line">
              <ArchitecturalHero />
            </div>
          </div>
          <aside className="space-y-6">
            <div className="border border-line p-5">
              <p className="font-serif text-4xl">{formatInr(property.rent)}</p>
              <p className="text-sm text-ink-soft">
                Est. monthly {formatInr(monthlyEstimate(property))}
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <Button onClick={() => setOpen(true)}>Contact owner</Button>
                <Button variant="line" onClick={() => toggleSave(property.id)}>
                  {saved ? "Saved" : "Save property"}
                </Button>
                <Button href={`/renttruth/${property.id}`} variant="ghost">
                  Open RentTruth
                </Button>
              </div>
            </div>
            <div className="border border-line p-5 text-sm">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                Owner
              </p>
              <p className="mt-2 font-serif text-2xl">{owner?.name}</p>
              <p className="text-ink-soft">{owner?.city}</p>
              <div className="mt-3">
                <StatusBadge
                  tone={
                    property.verification === "identity-checked" ? "ok" : "warn"
                  }
                >
                  {property.verification.replaceAll("-", " ")}
                </StatusBadge>
              </div>
              <p className="mt-3 text-ink-soft">{owner?.responseNote}</p>
            </div>
            <ExpenseBreakdown lines={property.expenses} />
          </aside>
        </div>
      </div>
      <Modal open={open} title="Contact owner" onClose={() => setOpen(false)}>
        <p className="mb-4 text-sm text-ink-soft">
          This enquiry stays in your browser. It is not emailed or stored on a
          server.
        </p>
        <div className="space-y-4">
          <Field
            label="Your name"
            name="name"
            value={name}
            onChange={setName}
            required
            error={error && !name ? error : undefined}
          />
          <TextArea
            label="Message"
            name="message"
            value={message}
            onChange={setMessage}
          />
          <Button
            onClick={() => {
              if (!name.trim() || message.trim().length < 12) {
                setError("Name and a short message (12+ characters) are required.");
                return;
              }
              addEnquiry(property.id, `${name}: ${message}`);
              setOpen(false);
            }}
          >
            Submit enquiry
          </Button>
        </div>
      </Modal>
    </SiteShell>
  );
}
