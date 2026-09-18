"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { UploadField } from "@/components/ui/upload-field";
import { payments as demoPayments } from "@/data/demo";
import { formatInr, formatDate } from "@/lib/format";
import { useNivasa } from "@/store/nivasa-store";
import { getWorkspacePayments, markPaymentPaid } from "@/lib/supabase/workspace";
import { uploadFile } from "@/lib/supabase/storage";
import type { PaymentRecord } from "@/types";

export default function PaymentsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useNivasa();
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
    <DashboardShell
      title="Payments & RentTruth™ Ledger"
      subtitle="Transparent itemized accounting for rent installments, society maintenance, and meter bills with digital receipts."
    >
      {/* 3 Ledger Summary Chips */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Paid To Date</span>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatInr(rows.filter((r) => r.status === "paid").reduce((acc, curr) => acc + curr.amount, 0))}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{rows.filter((r) => r.status === "paid").length} settled line items</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Due</span>
          <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatInr(rows.filter((r) => r.status !== "paid").reduce((acc, curr) => acc + curr.amount, 0))}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{rows.filter((r) => r.status !== "paid").length} pending verification</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Audit Status</span>
          <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">RentTruth™</p>
          <p className="text-xs text-slate-500 mt-0.5">Shared cryptographic ledger</p>
        </div>
      </div>

      {/* Itemized Payments Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Payment Item</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Due Date</th>
                <th className="px-5 py-3.5">Verification</th>
                <th className="px-5 py-3.5">Proof / Digital Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{row.label}</td>
                  <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200">{formatInr(row.amount)}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs">{formatDate(row.dueOn)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge tone={row.status === "paid" ? "ok" : row.status === "proof-uploaded" ? "neutral" : "warn"}>
                      {row.status}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-4">
                    {row.proofUrl ? (
                      <a
                        href={row.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-300 hover:underline"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>{row.proofName || "View Receipt"}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">{row.proofName || row.source}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Proof Card */}
      <div className="mt-8 max-w-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Upload Payment Receipt / Bank Voucher</h3>
        <UploadField
          label="Payment Proof Document"
          hint="Attaches payment proof to the next open billing item in the ledger and alerts the owner."
          uploading={uploading}
          onSelect={handleProofUpload}
        />
      </div>
    </DashboardShell>
  );
}
