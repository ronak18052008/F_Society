"use client";

import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SelectField } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { roommates } from "@/data/demo";
import { useNestora } from "@/store/nestora-store";
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
  } = useNestora();
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
    <DashboardShell title="Roommate matching">
      <p className="max-w-2xl text-sm text-ink-soft">
        Overlap of stated preferences only. Nestora does not verify identity,
        safety, or personal compatibility. Profiles are limited and demo.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <SelectField
          label="City filter"
          value={city}
          onChange={(value) => {
            setCity(value);
            if (value !== "any") setRoommatePrefs({ ...roommatePrefs, city: value });
          }}
          options={[
            { value: "any", label: "Any demo city" },
            ...["Ahmedabad", "Bengaluru", "Pune", "Mumbai"].map((item) => ({
              value: item,
              label: item,
            })),
          ]}
        />
        <SelectField
          label="Profile visibility"
          value={roommatePrivacy}
          onChange={(value) => setPrivacy(value as "limited" | "hidden")}
          options={[
            { value: "limited", label: "Limited profile" },
            { value: "hidden", label: "Hidden from matching" },
          ]}
        />
      </div>
      {roommatePrivacy === "hidden" ? (
        <p className="mt-4 text-sm text-bronze">
          Your profile is hidden. You can still browse demo cards.
        </p>
      ) : null}
      {visible.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No profiles"
            body="Try another city, or unblock someone from this browser session."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {visible.map((person) => {
            const overlap = [
              person.city === roommatePrefs.city ? "Same city" : null,
              person.food === roommatePrefs.food ? "Food preference overlap" : null,
              person.sleep === roommatePrefs.sleep ? "Sleep overlap" : null,
              person.smoking === roommatePrefs.smoking ? "Smoking overlap" : null,
            ].filter(Boolean) as string[];
            const connected = connectedRoommateIds.includes(person.id);
            return (
              <article key={person.id} className="border border-line p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-3xl">{person.displayName}</h2>
                    <p className="text-sm text-ink-soft">
                      {person.ageRange} · {person.city} · {person.occupation}
                    </p>
                  </div>
                  <StatusBadge tone="demo">Limited</StatusBadge>
                </div>
                <p className="mt-4 text-sm">Budget around {formatInr(person.budget)}</p>
                <p className="mt-2 text-xs text-ink-soft">
                  {overlap.length
                    ? overlap.join(" · ")
                    : "No overlapping preferences with your saved profile."}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    variant={connected ? "ghost" : "primary"}
                    onClick={() => {
                      connectRoommate(person.id);
                      toast("Connection request stored locally. The other person was not notified.");
                    }}
                  >
                    {connected ? "Requested" : "Request connect"}
                  </Button>
                  <Button variant="line" onClick={() => blockRoommate(person.id)}>
                    Block
                  </Button>
                  <Button variant="ghost" onClick={() => setReportId(person.id)}>
                    Report
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <Modal
        open={Boolean(reportId)}
        title="Report profile"
        onClose={() => setReportId(null)}
      >
        <p className="text-sm text-ink-soft">
          Reports are not sent to a moderation team in this prototype. Use this
          control to confirm the flow.
        </p>
        <div className="mt-4">
          <Button
            onClick={() => {
              if (reportId) blockRoommate(reportId);
              toast("Report logged locally and the profile was blocked.");
              setReportId(null);
            }}
          >
            Confirm report and block
          </Button>
        </div>
      </Modal>
    </DashboardShell>
  );
}
