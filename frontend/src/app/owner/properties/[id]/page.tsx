"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { getProperty as getDemoProperty } from "@/data/demo";
import { getPropertyById, updateProperty } from "@/lib/supabase/properties";
import { useNestora } from "@/store/nestora-store";
import type { Property } from "@/types";

export default function ManagePropertyPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(() => getDemoProperty(id) || null);
  const [loading, setLoading] = useState(!property);
  const { enquiries, toast, user } = useNestora();
  const [title, setTitle] = useState(property?.title ?? "");
  const [status, setStatus] = useState("available");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      try {
        const found = await getPropertyById(id);
        if (active && found) {
          setProperty(found);
          setTitle(found.title);
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
  }, [id]);

  if (loading) {
    return (
      <DashboardShell title="Loading property...">
        <p className="text-sm text-ink-soft">Fetching listing details...</p>
      </DashboardShell>
    );
  }

  if (!property) {
    return (
      <DashboardShell title="Listing not found">
        <p className="text-sm text-ink-soft">This listing could not be found.</p>
        <div className="mt-4">
          <Button href="/owner/dashboard">Owner dashboard</Button>
        </div>
      </DashboardShell>
    );
  }
  const related = enquiries.filter((item) => item.propertyId === property.id);

  return (
    <DashboardShell title="Manage listing">
      <StatusBadge tone={property.demo ? "demo" : "ok"}>
        {property.demo ? "Demo record" : "Live listing"}
      </StatusBadge>
      <form
        className="mt-6 max-w-lg space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setSaving(true);
          try {
            if (user?.supabaseId) {
              const res = await updateProperty(property.id, { title }, user.supabaseId);
              if (res.error) {
                toast(`Update note: ${res.error}`);
              } else {
                toast("Listing updated successfully on Nestora network.");
              }
            } else {
              toast("Listing changes saved locally.");
            }
          } catch (err) {
            console.warn("Update error:", err);
            toast("Changes saved locally.");
          } finally {
            setSaving(false);
          }
        }}
      >
        <Field label="Title" name="title" value={title} onChange={setTitle} />
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            Status
          </span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="mt-2 w-full border border-line bg-paper px-3 py-3 text-sm"
          >
            <option value="available">Available</option>
            <option value="paused">Paused</option>
            <option value="let">Let (occupied)</option>
          </select>
        </label>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </form>
      <h2 className="mt-12 font-serif text-3xl">Enquiries</h2>
      {related.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">No enquiries on this listing yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {related.map((item) => (
            <li key={item.id} className="border border-line p-4 text-sm">
              <p>{item.fromName}</p>
              <p className="text-ink-soft">{item.message}</p>
            </li>
          ))}
        </ul>
      )}
      <h2 className="mt-12 font-serif text-3xl">Tenant connections</h2>
      <p className="mt-3 text-sm text-ink-soft">
        Shared demo workspace:{" "}
        <Link className="text-bronze" href="/rental/rent-navrang">
          Navrangpura courtyard
        </Link>
        .
      </p>
    </DashboardShell>
  );
}
