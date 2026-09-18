"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { getProperty, maintenance, payments, properties as demoProps } from "@/data/demo";
import { getOwnerProperties } from "@/lib/supabase/properties";
import { createClient } from "@/lib/supabase/client";
import { useNestora } from "@/store/nestora-store";
import { formatInr } from "@/lib/format";
import type { Property } from "@/types";

export default function OwnerDashboardPage() {
  const { drafts, enquiries: localEnquiries, user, toast } = useNestora();
  const [listed, setListed] = useState<Property[]>(() =>
    demoProps.filter((item) => item.ownerId === "own-mehta"),
  );
  const [allEnquiries, setAllEnquiries] = useState(localEnquiries);

  useEffect(() => {
    let active = true;

    async function loadOwnerData() {
      const ownerId = user?.supabaseId || "own-mehta";
      try {
        const props = await getOwnerProperties(ownerId);
        if (active && props && props.length > 0) {
          setListed(props);
        }

        const supabase = createClient();
        if (supabase && user?.supabaseId) {
          const { data: dbEnquiries } = await supabase
            .from("enquiries")
            .select("*")
            .order("created_at", { ascending: false });

          if (active && dbEnquiries && dbEnquiries.length > 0) {
            type DBEnquiry = {
              id: string;
              property_id: string;
              from_name: string;
              message: string;
              status: "sent" | "seen" | "replied";
              created_at: string;
            };
            const mapped = (dbEnquiries as DBEnquiry[]).map((e) => ({
              id: e.id,
              propertyId: e.property_id,
              fromName: e.from_name,
              message: e.message,
              status: e.status,
              createdAt: e.created_at,
            }));
            setAllEnquiries([...mapped, ...localEnquiries]);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch owner remote data:", err);
      }
    }

    loadOwnerData();
    return () => {
      active = false;
    };
  }, [user, localEnquiries]);

  return (
    <DashboardShell title="Owner overview">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="border border-line p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            Listings
          </p>
          <p className="mt-2 font-serif text-3xl">{listed.length + drafts.length}</p>
        </div>
        <div className="border border-line p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            Enquiries
          </p>
          <p className="mt-2 font-serif text-3xl">{allEnquiries.length}</p>
        </div>
        <div className="border border-line p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            Open maintenance
          </p>
          <p className="mt-2 font-serif text-3xl">
            {maintenance.filter((item) => item.status !== "resolved").length}
          </p>
        </div>
      </div>
      <div className="mt-8">
        <Button href="/owner/properties/new">Add property</Button>
      </div>
      <h2 className="mt-12 font-serif text-3xl">Listed properties</h2>
      <ul className="mt-4 divide-y divide-line border border-line">
        {listed.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <Link href={`/owner/properties/${item.id}`} className="font-medium hover:text-bronze">
                {item.title}
              </Link>
              <p className="text-xs text-ink-soft">
                {item.city} · {formatInr(item.rent)}
              </p>
            </div>
            <StatusBadge tone={item.demo ? "demo" : "ok"}>
              {item.demo ? "Demo" : "Active"}
            </StatusBadge>
          </li>
        ))}
        {drafts.map((draft) => (
          <li key={draft.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p>{draft.title}</p>
              <p className="text-xs text-ink-soft">
                {draft.city} · local draft
              </p>
            </div>
            <StatusBadge tone="warn">Draft</StatusBadge>
          </li>
        ))}
      </ul>
      <h2 className="mt-12 font-serif text-3xl">Enquiries</h2>
      {allEnquiries.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">No enquiries received yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {allEnquiries.map((item) => (
            <li key={item.id} className="border border-line p-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{item.fromName}</p>
                  <p className="text-xs text-ink-soft">
                    {getProperty(item.propertyId)?.title ?? item.propertyId}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    tone={
                      item.status === "replied"
                        ? "ok"
                        : item.status === "seen"
                          ? "neutral"
                          : "warn"
                    }
                  >
                    {item.status}
                  </StatusBadge>
                  {item.status !== "replied" && (
                    <button
                      type="button"
                      onClick={async () => {
                        const nextStatus = item.status === "sent" ? "seen" : "replied";
                        const supabase = createClient();
                        if (supabase) {
                          await supabase
                            .from("enquiries")
                            .update({ status: nextStatus })
                            .eq("id", item.id);
                        }
                        setAllEnquiries((prev) =>
                          prev.map((e) =>
                            e.id === item.id ? { ...e, status: nextStatus } : e,
                          ),
                        );
                        toast(`Enquiry marked as ${nextStatus}`);
                      }}
                      className="cursor-pointer font-mono text-[11px] uppercase tracking-wider text-bronze hover:underline"
                    >
                      Mark {item.status === "sent" ? "seen" : "replied"}
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-ink-soft">{item.message}</p>
            </li>
          ))}
        </ul>
      )}
      <h2 className="mt-12 font-serif text-3xl">Payment overview</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Ledger is illustrative. {payments.filter((item) => item.status === "unpaid").length}{" "}
        item marked unpaid in the shared demo rental.
      </p>
    </DashboardShell>
  );
}
