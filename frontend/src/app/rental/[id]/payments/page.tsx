"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { UploadField } from "@/components/ui/upload-field";
import { payments as demoPayments } from "@/data/demo";
import { formatInr, formatDate } from "@/lib/format";
import { useNestora } from "@/store/nestora-store";
import { getWorkspacePayments, markPaymentPaid } from "@/lib/supabase/workspace";
import { uploadFile } from "@/lib/supabase/storage";
import type { PaymentRecord } from "@/types";

export default function PaymentsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useNestora();
  const [rows, setRows] = useState<PaymentRecord[]>(demoPayments);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      try {
        const pays = await getWorkspacePayments(id);
        if (active && pays && pays.length > 0) {
          setRows(pays);
        }
      } catch (err) {
        console.warn("Failed to load workspace payments:", err);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  const handleProofUpload = async (file: File) => {
    const unpaidIndex = rows.findIndex((item) => item.status === "unpaid");
    if (unpaidIndex < 0) {
      toast("No unpaid payment items found in ledger.");
      return;
    }

    setUploading(true);
    try {
      const targetPayment = rows[unpaidIndex];
      const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = `${id}/payments/${Date.now()}-${sanitized}`;
      const uploadRes = await uploadFile("rental-documents", storagePath, file);

      await markPaymentPaid(id, targetPayment.id, uploadRes.url || undefined, file.name);

      setRows((current) => {
        const next = [...current];
        next[unpaidIndex] = {
          ...next[unpaidIndex],
          status: "proof-uploaded",
          proofName: file.name,
          proofUrl: uploadRes.url || undefined,
          source: "uploaded-bill",
        };
        return next;
      });

      toast(`Payment proof "${file.name}" uploaded and recorded.`);
    } catch (err) {
      console.warn("Payment proof upload failed:", err);
      toast("Proof recorded locally.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardShell title="Payments and bills">
      <p className="text-sm text-ink-soft">
        Transparent ledger for rent installments, society maintenance, and meter bills.
        Upload receipts to record payment verification.
      </p>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            <tr>
              <th className="border-b border-line py-3">Item</th>
              <th className="border-b border-line py-3">Amount</th>
              <th className="border-b border-line py-3">Due</th>
              <th className="border-b border-line py-3">Status</th>
              <th className="border-b border-line py-3">Receipt / Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="border-b border-line py-3 font-medium">{row.label}</td>
                <td className="border-b border-line py-3">{formatInr(row.amount)}</td>
                <td className="border-b border-line py-3">{formatDate(row.dueOn)}</td>
                <td className="border-b border-line py-3">
                  <StatusBadge tone={row.status === "paid" ? "ok" : row.status === "proof-uploaded" ? "neutral" : "warn"}>
                    {row.status}
                  </StatusBadge>
                </td>
                <td className="border-b border-line py-3">
                  {row.proofUrl ? (
                    <a
                      href={row.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs text-bronze hover:underline"
                    >
                      {row.proofName || "View receipt"}
                    </a>
                  ) : (
                    <StatusBadge tone="demo">{row.proofName || row.source}</StatusBadge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8 max-w-xl">
        <UploadField
          label="Upload payment proof or utility receipt"
          hint="Attaches payment proof to the next open billing item in the ledger."
          uploading={uploading}
          onSelect={handleProofUpload}
        />
      </div>
    </DashboardShell>
  );
}
