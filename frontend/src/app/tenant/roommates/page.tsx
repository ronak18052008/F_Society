"use client";

import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SelectField } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";
import { roommates } from "@/data/demo";
import { useNivasa } from "@/store/nivasa-store";
import { formatInr } from "@/lib/format";

export default function RoommatesPage() {
  const {
    roommatePrefs,
    setRoommatePrefs,
    blockedRoommateIds,
    connectedRoommateIds,
    connectRoommate,
    blockRoommate,
    roommatePrivacy,
    setPrivacy,
    toast,
  } = useNivasa();
  const [city, setCity] = useState(roommatePrefs.city);
  const [reportId, setReportId] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      roommates.filter((person) => {
        if (blockedRoommateIds.includes(person.id)) return false;
        if (city !== "any" && person.city !== city) return false;
        return true;
      }),
    [blockedRoommateIds, city],
  );

  return (
    <DashboardShell title="Co-Living &amp; Roommate Harmony">
      <div className="space-y-6 max-w-5xl">
        {/* Intro banner */}
        <div className="rounded-2xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 p-4 sm:p-5 flex items-start gap-3">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Compatibility indexing based on verified lifestyle attributes, sleep cycles, and culinary patterns. Community safety guidelines apply across all co-tenancy connections.
          </p>
        </div>

        {/* Filter controls */}
        <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
          <SelectField
            label="Filter by City"
            value={city}
            onChange={(value) => {
              setCity(value);
              if (value !== "any") setRoommatePrefs({ ...roommatePrefs, city: value });
            }}
            options={[
              { value: "any", label: "All Target Metros" },
              ...["Ahmedabad", "Bengaluru", "Pune", "Mumbai"].map((item) => ({
                value: item,
                label: item,
              })),
            ]}
          />
          <SelectField
            label="Profile Visibility"
            value={roommatePrivacy}
            onChange={(value) => setPrivacy(value as "limited" | "hidden")}
            options={[
              { value: "limited", label: "Active & Discoverable" },
              { value: "hidden", label: "Hidden from Matching Pool" },
            ]}
          />
        </div>

        {roommatePrivacy === "hidden" ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-4 text-xs font-semibold text-amber-800 dark:text-amber-400">
            Your profile is currently hidden from other residents. You can still explore active listings.
          </div>
        ) : null}

        {visible.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No Matching Co-Residents"
              body="No active profiles matched your current filters. Try changing city parameters or resetting blocks."
            />
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {visible.map((person) => {
              const overlap = [
                person.city === roommatePrefs.city ? "City Alignment" : null,
                person.food === roommatePrefs.food ? "Dietary Match" : null,
                person.sleep === roommatePrefs.sleep ? "Circadian Match" : null,
                person.smoking === roommatePrefs.smoking ? "Smoke Policy" : null,
              ].filter(Boolean) as string[];
              const connected = connectedRoommateIds.includes(person.id);

              return (
                <article
                  key={person.id}
                  className="rounded-3xl border border-line bg-card p-6 shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7ca982] to-[#57875d] text-white font-serif font-bold text-lg shadow-sm">
                        {person.displayName[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-serif font-bold text-ink">
                          {person.displayName}
                        </h3>
                        <p className="text-xs text-ink-muted">
                          {person.ageRange} · {person.city} · {person.occupation}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#7ca982]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#1d3122] dark:text-[#a3caa6] border border-[#7ca982]/30">
                      Verified
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3 text-xs">
                    <span className="text-ink-muted">Target Contribution:</span>
                    <span className="font-serif font-bold text-ink text-sm">
                      {formatInr(person.budget)} <span className="text-[11px] font-normal text-ink-muted">/ mo</span>
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {overlap.length ? (
                      overlap.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[#7ca982]/30 bg-[#7ca982]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#1d3122] dark:text-[#a3caa6]"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-ink-muted">General Lifestyle Compatibility</span>
                    )}
                  </div>

                  <div className="mt-6 flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant={connected ? "outline" : "primary"}
                      onClick={() => {
                        connectRoommate(person.id);
                        toast(
                          connected
                            ? `Invitation already pending with ${person.displayName}`
                            : `Invitation sent to ${person.displayName}`,
                        );
                      }}
                    >
                      {connected ? "Invite Pending" : "Connect"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setReportId(person.id)}
                      className="ml-auto rounded-xl px-2 py-1.5 text-xs text-ink-muted hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      Report
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <Modal
          open={Boolean(reportId)}
          title="Flag Community Profile"
          onClose={() => setReportId(null)}
        >
          <p className="text-sm text-ink-muted">
            F_Society upholds strict trust and mutual respect standards. Flagging this profile will immediately suppress it from your matches and log a moderation review ticket.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReportId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (reportId) blockRoommate(reportId);
                toast("Profile flagged and blocked from recommendations.");
                setReportId(null);
              }}
            >
              Confirm &amp; Block
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardShell>
  );
}
