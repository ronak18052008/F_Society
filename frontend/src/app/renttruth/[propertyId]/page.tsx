import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { ExpenseBreakdown } from "@/components/property/expense-breakdown";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { getProperty, monthlyEstimate } from "@/data/demo";
import { formatInr } from "@/lib/format";

export default async function RentTruthPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const property = getProperty(propertyId);
  if (!property) notFound();
  const monthly = monthlyEstimate(property);
  const estimated = property.expenses.filter((item) => item.source === "estimated").length;

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-5 py-14">
        <StatusBadge tone="demo">Demo cost sheet</StatusBadge>
        <h1 className="mt-4 font-serif text-5xl">RentTruth</h1>
        <p className="mt-3 text-ink-soft">{property.title}</p>
        <p className="mt-4 text-sm text-ink-soft">
          Headline rent is {formatInr(property.rent)}. Estimated monthly occupancy
          is {formatInr(monthly)}. {estimated} lines are estimates. None are marked
          verified.
        </p>
        <div className="mt-10">
          <ExpenseBreakdown lines={property.expenses} />
        </div>
        <p className="mt-6 text-xs text-ink-soft">
          Verified is reserved for costs that have actually been checked. This
          listing does not include verified lines.
        </p>
        <div className="mt-8">
          <Button href={`/homes/${property.id}`} variant="line">
            Back to listing
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}
