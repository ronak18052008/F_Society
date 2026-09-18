"use client";

import Image from "next/image";
import { useState } from "react";
import { useParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { UploadField } from "@/components/ui/upload-field";
import { passport, workspace } from "@/data/demo";
import { formatDateTime } from "@/lib/format";
import { useNestora } from "@/store/nestora-store";

export default function PassportPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useNestora();
  const [ownerAck, setOwnerAck] = useState(passport.ownerAcknowledgedAt);
  const [tenantAck] = useState(passport.tenantAcknowledgedAt);
  const [left, setLeft] = useState(passport.rooms[0].photos[0].src);
  const [right, setRight] = useState(
    passport.rooms[0].photos[1]?.src ?? passport.rooms[0].photos[0].src,
  );

  if (id !== workspace.id) {
    return (
      <DashboardShell title="Workspace not found">
        <Button href="/rental/rent-navrang/passport">Open demo passport</Button>
      </DashboardShell>
    );
  }

  const photos = passport.rooms.flatMap((room) => room.photos);

  function swapPhoto(src: string) {
    setLeft(right);
    setRight(src);
  }

  return (
    <DashboardShell title="Property Condition Passport">
      <p className="max-w-2xl text-sm text-ink-soft">
        Photographs and notes are a shared record. Visual differences are flagged
        for human review. Nestora does not decide who caused damage.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <StatusBadge tone={tenantAck ? "ok" : "warn"}>
          Tenant {tenantAck ? `acknowledged ${formatDateTime(tenantAck)}` : "pending"}
        </StatusBadge>
        <StatusBadge tone={ownerAck ? "ok" : "warn"}>
          Owner {ownerAck ? `acknowledged ${formatDateTime(ownerAck)}` : "pending"}
        </StatusBadge>
      </div>
      <div className="mt-8 space-y-8">
        {passport.rooms.map((room) => (
          <article key={room.id} className="border border-line p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-3xl">{room.name}</h2>
              {room.reviewRequired ? (
                <StatusBadge tone="warn">Review required</StatusBadge>
              ) : (
                <StatusBadge>Noted</StatusBadge>
              )}
            </div>
            <p className="mt-2 text-sm text-ink-soft">{room.notes}</p>
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {room.photos.map((photo) => (
                <figure key={photo.id} className="relative h-36 w-52 shrink-0">
                  <Image src={photo.src} alt={photo.label} fill className="object-cover" />
                  <figcaption className="absolute bottom-0 w-full bg-black/50 px-2 py-1 text-[11px] text-white">
                    {photo.label} · {formatDateTime(photo.takenAt)}
                  </figcaption>
                </figure>
              ))}
            </div>
          </article>
        ))}
      </div>
      <h2 className="mt-12 font-serif text-3xl">Photo comparison</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Place two photographs side by side. Any conclusion remains yours.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {[left, right].map((src, index) => (
          <div key={src + index} className="relative h-64 border border-line">
            <Image src={src} alt="" fill className="object-cover" />
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            className="border border-line px-2 py-1 text-xs"
            onClick={() => swapPhoto(photo.src)}
          >
            {photo.label}
          </button>
        ))}
      </div>
      <div className="mt-8 max-w-xl">
        <UploadField
          label="Add a move-in photograph"
          accept="image/*"
          onSelect={(file) =>
            toast(`${file.name} selected. It was not uploaded or analysed.`)
          }
        />
      </div>
      <div className="mt-6">
        <Button
          onClick={() => {
            const at = new Date().toISOString();
            setOwnerAck(at);
            toast("Owner acknowledgement stored in this session only.");
          }}
          disabled={Boolean(ownerAck)}
        >
          {ownerAck ? "Owner acknowledged" : "Owner acknowledge record"}
        </Button>
      </div>
    </DashboardShell>
  );
}
