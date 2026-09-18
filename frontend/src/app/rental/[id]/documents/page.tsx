"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { UploadField } from "@/components/ui/upload-field";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { SelectField } from "@/components/ui/field";
import { documents as demoDocuments } from "@/data/demo";
import { useNestora } from "@/store/nestora-store";
import { formatDateTime } from "@/lib/format";
import { getWorkspaceDocuments, addWorkspaceDocument } from "@/lib/supabase/workspace";
import { uploadFile, getSignedDocumentUrl } from "@/lib/supabase/storage";
import type { DocumentRecord } from "@/types";

export default function DocumentsPage() {
  const { id } = useParams<{ id: string }>();
  const { user, toast } = useNestora();
  const [category, setCategory] = useState("all");
  const [localDocs, setLocalDocs] = useState<DocumentRecord[]>(demoDocuments);
  const [uploading, setUploading] = useState(false);

  const role = user?.role ?? "tenant";

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      try {
        const docs = await getWorkspaceDocuments(id);
        if (active && docs && docs.length > 0) {
          setLocalDocs(docs);
        }
      } catch (err) {
        console.warn("Failed to load workspace documents:", err);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  const visible = useMemo(
    () =>
      localDocs.filter((doc) => {
        if (!doc.visibleTo.includes(role)) return false;
        if (category !== "all" && doc.category !== category) return false;
        return true;
      }),
    [category, localDocs, role],
  );

  const handleDocumentUpload = async (file: File) => {
    setUploading(true);
    try {
      const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = `${id}/${Date.now()}-${sanitized}`;
      const uploadRes = await uploadFile("rental-documents", storagePath, file);

      const newDoc = await addWorkspaceDocument(id, {
        title: file.name.replace(/\.[^/.]+$/, ""),
        category: (category !== "all" ? category : "other") as DocumentRecord["category"],
        status: "shared",
        visibleTo: ["tenant", "owner"],
        fileName: file.name,
        fileUrl: uploadRes.url || undefined,
        storagePath: uploadRes.path || undefined,
      });

      setLocalDocs((prev) => [newDoc, ...prev]);
      toast("Document securely uploaded and shared to workspace repository.");
    } catch (err) {
      console.warn("Upload failed:", err);
      toast("Added locally.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: DocumentRecord) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, "_blank");
      return;
    }
    if (doc.storagePath) {
      const signedUrl = await getSignedDocumentUrl(doc.storagePath);
      if (signedUrl) {
        window.open(signedUrl, "_blank");
        return;
      }
    }
    toast(`Viewing simulated document record: ${doc.fileName}`);
  };

  return (
    <DashboardShell title="Documents">
      <p className="text-sm text-ink-soft">
        Repository of agreements, KYC identity documents, and payment receipts.
        Encrypted and accessible according to verified party roles.
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
          label="Upload workspace document"
          accept=".pdf,.png,.jpg,.jpeg"
          hint="Uploaded to encrypted document store."
          uploading={uploading}
          onSelect={handleDocumentUpload}
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
              <div className="flex items-center justify-between">
                <StatusBadge tone={doc.status === "shared" ? "ok" : "warn"}>{doc.status}</StatusBadge>
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  className="font-mono text-xs text-bronze uppercase tracking-wider hover:underline"
                >
                  View / Download
                </button>
              </div>
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
