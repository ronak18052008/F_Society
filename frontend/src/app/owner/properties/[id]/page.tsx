"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { getProperty } from "@/data/demo";
import { useNestora } from "@/store/nestora-store";

export default function ManagePropertyPage() {
  const { id } = useParams<{ id: string }>();
  const property = getProperty(id);
  const { enquiries, toast } = useNestora();
  const [title, setTitle] = useState(property?.title ?? "");
  const [status, setStatus] = useState("available");

  if (!property) {
    return (
      <DashboardShell title="Listing not found">
        <p className="text-sm text-ink-soft">This id is not in the demo set.</p>
        <div className="mt-4">
          <Button href="/owner/dashboard">Owner dashboard</Button>
        </div>
      </DashboardShell>
    );
  }
  const related = enquiries.filter((item) => item.propertyId === property.id);

  return (
    <DashboardShell title="Manage listing">
      <StatusBadge tone="demo">Demo record</StatusBadge>
      <form
        className="mt-6 max-w-lg space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          toast("Edits are not written to a database in this prototype.");
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
            <option value="let">Let (demo)</option>
          </select>
        </label>
        <Button type="submit">Save locally</Button>
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
