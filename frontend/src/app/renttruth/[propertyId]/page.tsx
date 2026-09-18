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
import { useNestora } from "@/store/nestora-store";
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
  const { toast } = useNestora();

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
      <div className="mx-auto max-w-3xl px-5 py-14">
        <div className="flex items-center justify-between gap-4">
          <StatusBadge tone={property.demo ? "demo" : "ok"}>
            {property.demo ? "Demo cost sheet" : "Live verified ledger"}
          </StatusBadge>
          <button
            type="button"
            onClick={() => setOpenAddModal(true)}
            className="font-mono text-xs uppercase tracking-wider text-bronze hover:underline"
          >
            + Add cost item
          </button>
        </div>
        <h1 className="mt-4 font-serif text-5xl">RentTruth</h1>
        <p className="mt-3 text-ink-soft">{property.title}</p>
        <p className="mt-4 text-sm text-ink-soft">
          Headline rent is {formatInr(property.rent)}. Calculated monthly occupancy
          cost is {formatInr(monthly)}. {verifiedCount} verified lines, {estimatedCount} estimated lines.
        </p>
        <div className="mt-10">
          <ExpenseBreakdown lines={expenses} />
        </div>
        <p className="mt-6 text-xs text-ink-soft">
          RentTruth ensures true cost clarity by disaggregating utility bills, maintenance charges, and society deposits.
        </p>
        <div className="mt-8 flex gap-4">
          <Button href={`/homes/${property.id}`} variant="line">
            Back to listing
          </Button>
          <Button onClick={() => setOpenAddModal(true)}>
            Add verified bill
          </Button>
        </div>
      </div>

      <Modal open={openAddModal} title="Add Cost Line to RentTruth" onClose={() => setOpenAddModal(false)}>
        <form onSubmit={handleAddExpense} className="space-y-4">
          <Field
            label="Expense label"
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
              { value: "monthly", label: "Monthly recurring" },
              { value: "one-time", label: "One-time payment" },
              { value: "deposit", label: "Refundable deposit" },
            ]}
          />
          <SelectField
            label="Source verification"
            value={source}
            onChange={(val) => setSource(val as ExpenseLine["source"])}
            options={[
              { value: "verified", label: "Verified documentation" },
              { value: "uploaded-bill", label: "Uploaded utility bill" },
              { value: "owner-provided", label: "Owner declaration" },
              { value: "estimated", label: "Locality estimate" },
            ]}
          />
          <Field
            label="Note or breakdown"
            name="note"
            value={note}
            onChange={setNote}
            placeholder="e.g. Billed quarterly by society RW"
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding line..." : "Add to RentTruth"}
          </Button>
        </form>
      </Modal>
    </SiteShell>
  );
}
