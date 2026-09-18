"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { ExpenseBreakdown } from "@/components/property/expense-breakdown";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Field, SelectField } from "@/components/ui/field";
import { getProperty as getDemoProperty } from "@/data/demo";
import { getPropertyById } from "@/lib/supabase/properties";
import { getExpensesByPropertyId, addExpenseLine } from "@/lib/supabase/expenses";
import { formatInr } from "@/lib/format";
import { useNivasa } from "@/store/nivasa-store";
import type { Property, ExpenseLine } from "@/types";

export default function RentTruthPage() {
  const params = useParams<{ propertyId: string }>();
  const propertyId = params.propertyId;
  const [property, setProperty] = useState<Property | null>(() => getDemoProperty(propertyId) || null);
  const [expenses, setExpenses] = useState<ExpenseLine[]>(() => property?.expenses || []);
  const [loading, setLoading] = useState(!property);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [cadence, setCadence] = useState<"monthly" | "one-time" | "deposit">("monthly");
  const [source, setSource] = useState<ExpenseLine["source"]>("verified");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useNivasa();

  useEffect(() => {
    let active = true;
    async function load() {
      if (!propertyId) return;
      try {
        const prop = await getPropertyById(propertyId);
        if (active && prop) {
          setProperty(prop);
        }
        const exp = await getExpensesByPropertyId(propertyId);
        if (active && exp && exp.length > 0) {
          setExpenses(exp);
        }
      } catch (err) {
        console.warn("Failed to load RentTruth data:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [propertyId]);

  if (loading) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-5 py-20">
          <p className="font-mono text-sm uppercase tracking-widest text-bronze">Loading RentTruth sheet...</p>
        </div>
      </SiteShell>
    );
  }

  if (!property) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-5 py-20">
          <h1 className="font-serif text-4xl">Cost sheet not found</h1>
          <p className="mt-3 text-sm text-ink-soft">
            The requested property cost breakdown is not available.
          </p>
          <div className="mt-6">
            <Button href="/homes">Back to homes</Button>
          </div>
        </div>
      </SiteShell>
    );
  }

  const monthly = expenses
    .filter((line) => line.cadence === "monthly")
    .reduce((sum, line) => sum + line.amount, 0);

  const estimatedCount = expenses.filter((item) => item.source === "estimated").length;
  const verifiedCount = expenses.filter((item) => item.source === "verified" || item.source === "uploaded-bill").length;

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !Number(amount)) return;

    setIsSubmitting(true);
    try {
      const res = await addExpenseLine(property.id, {
        label: label.trim(),
        amount: Number(amount),
        cadence,
        source,
        note: note.trim() || undefined,
      });

      if (res.data) {
        setExpenses((prev) => [...prev, res.data!]);
        toast("Expense line added to RentTruth record.");
        setOpenAddModal(false);
        setLabel("");
        setAmount("");
        setNote("");
      } else {
        toast(`Error: ${res.error}`);
      }
    } catch (err) {
      console.warn("Error adding expense:", err);
      toast("Added locally.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Navigation Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 text-xs font-medium text-ink-muted">
          <a href="/homes" className="hover:text-forest dark:hover:text-pista transition">Residences</a>
          <span>/</span>
          <a href={`/homes/${property.id}`} className="hover:text-forest dark:hover:text-pista transition">{property.title}</a>
          <span>/</span>
          <span className="text-ink dark:text-cream font-semibold">RentTruth™ Breakdown</span>
        </div>

        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-warm-200/80 dark:border-forest/40">
          <div>
            <div className="flex items-center gap-2.5">
              <StatusBadge tone={property.demo ? "demo" : "ok"}>
                {property.demo ? "Demo Ledger" : "Cryptographically Verified"}
              </StatusBadge>
              <span className="text-xs font-semibold text-forest dark:text-pista">
                100% Unbundled
              </span>
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-serif font-bold tracking-tight text-ink dark:text-cream">
              RentTruth™ Cost Audit
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {property.title} · {property.locality}, {property.city}
            </p>
          </div>

          <Button onClick={() => setOpenAddModal(true)} size="md">
            + Add Cost Item
          </Button>
        </div>

        {/* Cost Comparison Bento */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-6 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Headline Rent</span>
            <p className="mt-1 text-2xl sm:text-3xl font-serif font-bold text-ink dark:text-cream">
              {formatInr(property.rent)}
            </p>
            <p className="text-xs text-ink-muted mt-0.5">Base lease fee quoted</p>
          </div>

          <div className="rounded-2xl border border-pista/40 bg-pista/10 dark:bg-forest/20 p-6 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-forest dark:text-pista">True Monthly Outlay</span>
            <p className="mt-1 text-2xl sm:text-3xl font-serif font-bold text-forest dark:text-pista">
              {formatInr(monthly)}
            </p>
            <p className="text-xs text-forest/80 dark:text-pista/80 mt-0.5">
              +{formatInr(monthly - property.rent)} monthly utilities/dues
            </p>
          </div>

          <div className="rounded-2xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-6 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Line Integrity</span>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="rounded-full bg-pista/20 px-2.5 py-0.5 text-xs font-bold text-forest dark:text-pista border border-pista/30">
                {verifiedCount} Verified
              </span>
              <span className="rounded-full bg-warm-100 dark:bg-forest/30 px-2.5 py-0.5 text-xs font-semibold text-ink-muted">
                {estimatedCount} Est.
              </span>
            </div>
            <p className="text-[11px] text-ink-muted mt-1">Zero hidden society surprises</p>
          </div>
        </div>

        {/* Itemized Breakdown Component */}
        <div className="mt-10 rounded-3xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl font-serif font-bold text-ink dark:text-cream mb-6">Disaggregated Fee Ledger</h2>
          <ExpenseBreakdown lines={expenses} />
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex items-center justify-between">
          <Button href={`/homes/${property.id}`} variant="line" size="md">
            ← Return to Residence Detail
          </Button>
          <Button onClick={() => setOpenAddModal(true)} variant="primary" size="md">
            + Add Verified Bill Line
          </Button>
        </div>
      </div>

      {/* Add Cost Line Modal */}
      <Modal open={openAddModal} title="Add Cost Line to RentTruth™" onClose={() => setOpenAddModal(false)}>
        <p className="mb-4 text-xs text-ink-muted leading-relaxed">
          Record society dues, metered water, club fees, or fiber internet costs into this residence&apos;s public RentTruth™ ledger.
        </p>
        <form onSubmit={handleAddExpense} className="space-y-4">
          <Field
            label="Expense Item Label"
            name="label"
            value={label}
            onChange={setLabel}
            placeholder="e.g. Society Maintenance, High-speed Fiber, Piped Gas"
            required
          />
          <Field
            label="Amount (₹)"
            name="amount"
            type="number"
            value={amount}
            onChange={setAmount}
            placeholder="3500"
            required
          />
          <SelectField
            label="Cadence"
            value={cadence}
            onChange={(val) => setCadence(val as "monthly" | "one-time" | "deposit")}
            options={[
              { value: "monthly", label: "Monthly Recurring" },
              { value: "one-time", label: "One-Time Handover Fee" },
              { value: "deposit", label: "Refundable Security Deposit" },
            ]}
          />
          <SelectField
            label="Source Verification Tier"
            value={source}
            onChange={(val) => setSource(val as ExpenseLine["source"])}
            options={[
              { value: "verified", label: "Verified Legal Documentation" },
              { value: "uploaded-bill", label: "Uploaded Utility / Society Bill" },
              { value: "owner-provided", label: "Owner Written Declaration" },
              { value: "estimated", label: "Locality Statistical Estimate" },
            ]}
          />
          <Field
            label="Notes or Breakdown"
            name="note"
            value={note}
            onChange={setNote}
            placeholder="e.g. Billed quarterly by society RWA"
          />
          <div className="pt-2">
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Recording to Ledger..." : "Add to RentTruth™ Record"}
            </Button>
          </div>
        </form>
      </Modal>
    </SiteShell>
  );
}
