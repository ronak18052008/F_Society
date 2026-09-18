"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { UploadField } from "@/components/ui/upload-field";
import { Button } from "@/components/ui/button";
import { payments, workspace } from "@/data/demo";
import { formatInr, formatDate } from "@/lib/format";
import { useNestora } from "@/store/nestora-store";
import type { PaymentRecord } from "@/types";

export default function PaymentsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useNestora();
  const [rows, setRows] = useState<PaymentRecord[]>(payments);

  if (id !== workspace.id) {
    return (
      <DashboardShell title="Workspace not found">
        <Button href="/rental/rent-navrang/payments">Open demo ledger</Button>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Payments and bills">
      <p className="text-sm text-ink-soft">
        Nestora does not process payments in this prototype. Status is a ledger,
        not a bank confirmation.
      </p>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            <tr>
              <th className="border-b border-line py-3">Item</th>
              <th className="border-b border-line py-3">Amount</th>
              <th className="border-b border-line py-3">Due</th>
              <th className="border-b border-line py-3">Status</th>
              <th className="border-b border-line py-3">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="border-b border-line py-3">{row.label}</td>
                <td className="border-b border-line py-3">{formatInr(row.amount)}</td>
                <td className="border-b border-line py-3">{formatDate(row.dueOn)}</td>
                <td className="border-b border-line py-3">
                  <StatusBadge tone={row.status === "paid" ? "ok" : "warn"}>
                    {row.status}
                  </StatusBadge>
                </td>
                <td className="border-b border-line py-3">
                  <StatusBadge tone="demo">{row.source}</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8 max-w-xl">
        <UploadField
          label="Upload payment proof"
          hint="Marks the first unpaid rent row as proof-uploaded. No money moves."
          onSelect={(file) => {
            setRows((current) => {
              const index = current.findIndex((item) => item.status === "unpaid");
              if (index < 0) return current;
              const next = [...current];
              next[index] = {
                ...next[index],
                status: "proof-uploaded",
                proofName: file.name,
                source: "uploaded-bill",
              };
              return next;
            });
            toast(`Proof ${file.name} attached in this view only.`);
          }}
        />
      </div>
    </DashboardShell>
  );
}
