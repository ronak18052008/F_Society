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
    <DashboardShell
      title="Manage Residence Listing"
      subtitle={`Configure listing status, update title metadata, and review inbound inquiries for ${property.locality}, ${property.city}.`}
    >
      <div className="flex items-center gap-2.5 mb-6">
        <StatusBadge tone={property.demo ? "demo" : "ok"}>
          {property.demo ? "Demo record" : "Live listing"}
        </StatusBadge>
        <span className="text-xs text-slate-500 font-medium">ID: {property.id}</span>
      </div>

      <div className="max-w-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            try {
              if (user?.supabaseId) {
                const res = await updateProperty(property.id, { title }, user.supabaseId);
                if (res.error) {
                  toast(`Update note: ${res.error}`);
                } else {
                  toast("Listing updated successfully on NIVASA network.");
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
          <Field label="Residence Title" name="title" value={title} onChange={setTitle} required />
          <div>
            <label htmlFor="listing-status" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Listing Availability Status
            </label>
            <select
              id="listing-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="available">Available for Enquiries</option>
              <option value="paused">Paused / Under Negotiation</option>
              <option value="let">Leased (Occupied)</option>
            </select>
          </div>
          <div className="pt-2">
            <Button type="submit" size="lg" className="w-full" disabled={saving}>
              {saving ? "Saving Changes..." : "Save Listing Updates"}
            </Button>
          </div>
        </form>
      </div>

      {/* Inquiries */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Inquiries On This Property</h2>
        {related.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center bg-slate-50/50 dark:bg-slate-900/30">
            <p className="text-sm text-slate-500">No inquiries received for this specific listing yet.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {related.map((item) => (
              <li key={item.id} className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{item.fromName}</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">{item.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Linked Workspace */}
      <div className="mt-10 rounded-2xl border border-blue-500/20 bg-blue-50/30 dark:bg-blue-950/20 p-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Connected Tenancy Workspace
        </span>
        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
          Shared Tenancy Ledger:{" "}
          <Link className="text-blue-600 dark:text-blue-400 hover:underline" href="/rental/rent-navrang">
            Navrangpura Courtyard Workspace →
          </Link>
        </p>
      </div>
    </DashboardShell>
  );
}
