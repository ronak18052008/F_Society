"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { UploadField } from "@/components/ui/upload-field";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { SelectField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { documents, workspace } from "@/data/demo";
import { useNestora } from "@/store/nestora-store";
import { formatDateTime } from "@/lib/format";
import type { DocumentRecord } from "@/types";

export default function DocumentsPage() {
  const { id } = useParams<{ id: string }>();
  const { user, toast } = useNestora();
  const [category, setCategory] = useState("all");
  const [localDocs, setLocalDocs] = useState<DocumentRecord[]>(documents);

  const role = user?.role ?? "tenant";
  const visible = useMemo(
    () =>
      localDocs.filter((doc) => {
        if (!doc.visibleTo.includes(role)) return false;
        if (category !== "all" && doc.category !== category) return false;
        return true;
      }),
    [category, localDocs, role],
  );

  if (id !== workspace.id) {
    return (
      <DashboardShell title="Workspace not found">
        <Button href="/rental/rent-navrang/documents">Open demo documents</Button>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Documents">
      <p className="text-sm text-ink-soft">
        Files selected here are not uploaded. Access is mocked from your current
        role.
      </p>
      <div className="mt-6 max-w-sm">
        <SelectField
          label="Category"
          value={category}
          onChange={setCategory}
          options={[
            { value: "all", label: "All visible" },
            { value: "agreement", label: "Agreement" },
            { value: "identity", label: "Identity" },
            { value: "payment-proof", label: "Payment proof" },
            { value: "maintenance", label: "Maintenance" },
            { value: "other", label: "Other" },
          ]}
        />
      </div>
      <div className="mt-6 max-w-xl">
        <UploadField
          label="Add a document"
          accept=".pdf,.png,.jpg"
          hint="Maximum size is not enforced. Nothing leaves this device."
          onSelect={(file) => {
            setLocalDocs((current) => [
              {
                id: crypto.randomUUID(),
                title: file.name,
                category: "other",
                status: "draft",
                uploadedAt: new Date().toISOString(),
                visibleTo: [role],
                fileName: file.name,
              },
              ...current,
            ]);
            toast("Document card added locally. File was not stored.");
          }}
        />
      </div>
      {visible.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No documents"
            body="Nothing in this category is visible to the current role."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {visible.map((doc) => (
            <article key={doc.id} className="border border-line p-5">
              <StatusBadge>{doc.status}</StatusBadge>
              <h2 className="mt-3 font-serif text-2xl">{doc.title}</h2>
              <p className="text-sm text-ink-soft">{doc.fileName}</p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                {doc.category} · {formatDateTime(doc.uploadedAt)}
              </p>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
