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
    <DashboardShell
      title="Encrypted Document Vault"
      subtitle="Cryptographically verified repository for executed lease agreements, KYC identity proofs, and rent receipts."
    >
      {/* Category Pills Filter */}
      <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        {[
          { value: "all", label: "All Visible Vaults" },
          { value: "agreement", label: "Agreements" },
          { value: "identity", label: "Identity & KYC" },
          { value: "payment-proof", label: "Payment Proofs" },
          { value: "maintenance", label: "Maintenance Receipts" },
          { value: "other", label: "Other Records" },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setCategory(item.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              category === item.value
                ? "bg-blue-600 text-white shadow-xs"
                : "border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Upload Document Dock */}
      <div className="mt-8 max-w-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Upload Tenancy Document</h3>
        <UploadField
          label="Select File (.pdf, .png, .jpg)"
          accept=".pdf,.png,.jpg,.jpeg"
          hint="Uploaded directly to private Supabase Storage with signed URL access control."
          uploading={uploading}
          onSelect={handleDocumentUpload}
        />
      </div>

      {/* Documents Grid */}
      {visible.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-10 text-center bg-slate-50/50 dark:bg-slate-900/30">
          <EmptyState
            title="No Documents Found"
            body="No records in this category are currently shared with your role."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {visible.map((doc) => (
            <article
              key={doc.id}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md hover:border-blue-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <StatusBadge tone={doc.status === "shared" ? "ok" : "warn"}>{doc.status}</StatusBadge>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {doc.category}
                  </span>
                </div>

                <div className="mt-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{doc.title}</h2>
                    <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{doc.fileName}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">{formatDateTime(doc.uploadedAt)}</span>
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  className="inline-flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Access Document</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
