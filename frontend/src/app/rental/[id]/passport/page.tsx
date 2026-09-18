"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { UploadField } from "@/components/ui/upload-field";
import { passport as demoPassport } from "@/data/demo";
import { formatDateTime } from "@/lib/format";
import { useNestora } from "@/store/nestora-store";
import { getConditionPassport, acknowledgePassport, addRoomPhoto } from "@/lib/supabase/passport";
import { uploadFile } from "@/lib/supabase/storage";
import type { ConditionPassport } from "@/types";

export default function PassportPage() {
  const { id } = useParams<{ id: string }>();
  const { toast, user } = useNestora();
  const [data, setData] = useState<ConditionPassport>(demoPassport);
  const [ownerAck, setOwnerAck] = useState<string | undefined>(demoPassport.ownerAcknowledgedAt);
  const [tenantAck, setTenantAck] = useState<string | undefined>(demoPassport.tenantAcknowledgedAt);
  const [left, setLeft] = useState(demoPassport.rooms[0]?.photos[0]?.src || "");
  const [right, setRight] = useState(
    demoPassport.rooms[0]?.photos[1]?.src ?? demoPassport.rooms[0]?.photos[0]?.src ?? "",
  );
  const [uploading, setUploading] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      try {
        const passportData = await getConditionPassport(id);
        if (active && passportData) {
          setData(passportData);
          setOwnerAck(passportData.ownerAcknowledgedAt);
          setTenantAck(passportData.tenantAcknowledgedAt);
          if (passportData.rooms[0]?.photos[0]?.src) {
            setLeft(passportData.rooms[0].photos[0].src);
            setRight(passportData.rooms[0].photos[1]?.src || passportData.rooms[0].photos[0].src);
          }
        }
      } catch (err) {
        console.warn("Failed to load condition passport:", err);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  const photos = data.rooms.flatMap((room) => room.photos);

  function swapPhoto(src: string) {
    setLeft(right);
    setRight(src);
  }

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    try {
      const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `${id}/${Date.now()}-${sanitized}`;
      const uploadRes = await uploadFile("passport-photos", path, file);

      if (uploadRes.url) {
        const firstRoom = data.rooms[0];
        if (firstRoom) {
          const newPhoto = {
            id: `photo-${Date.now()}`,
            label: "Move-in inspection",
            src: uploadRes.url,
            takenAt: new Date().toISOString(),
          };

          await addRoomPhoto(id, firstRoom.id, newPhoto);

          setData((prev) => ({
            ...prev,
            rooms: prev.rooms.map((r) =>
              r.id === firstRoom.id
                ? { ...r, photos: [...r.photos, newPhoto] }
                : r,
            ),
          }));
          setRight(uploadRes.url);
          toast("Condition photograph uploaded and attached to baseline record.");
        }
      } else {
        toast(uploadRes.error || "Upload failed. Saved preview locally.");
      }
    } catch (err) {
      console.warn("Passport photo upload error:", err);
      toast("Photograph recorded locally.");
    } finally {
      setUploading(false);
    }
  };

  const handleAcknowledge = async () => {
    setAcknowledging(true);
    const role = user?.role === "owner" ? "owner" : "tenant";
    try {
      const res = await acknowledgePassport(id, role);
      if (role === "owner") {
        setOwnerAck(res.acknowledgedAt);
      } else {
        setTenantAck(res.acknowledgedAt);
      }
      toast(`${role === "owner" ? "Owner" : "Tenant"} condition acknowledgement verified.`);
    } catch (err) {
      console.warn("Acknowledgement error:", err);
    } finally {
      setAcknowledging(false);
    }
  };

  return (
    <DashboardShell title="Property Condition Passport">
      <p className="max-w-2xl text-sm text-ink-soft">
        Photographs and baseline notes create an immutable joint inspection record.
        Visual differences are flagged for mutual agreement.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <StatusBadge tone={tenantAck ? "ok" : "warn"}>
          Tenant {tenantAck ? `acknowledged ${formatDateTime(tenantAck)}` : "pending signature"}
        </StatusBadge>
        <StatusBadge tone={ownerAck ? "ok" : "warn"}>
          Owner {ownerAck ? `acknowledged ${formatDateTime(ownerAck)}` : "pending signature"}
        </StatusBadge>
      </div>
      <div className="mt-8 space-y-8">
        {data.rooms.map((room) => (
          <article key={room.id} className="border border-line p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-3xl">{room.name}</h2>
              {room.reviewRequired ? (
                <StatusBadge tone="warn">Review required</StatusBadge>
              ) : (
                <StatusBadge>Verified baseline</StatusBadge>
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
        Place two photographs side by side to verify pre/post occupancy status.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {[left, right].map((src, index) => (
          <div key={src + index} className="relative h-64 border border-line">
            {src ? (
              <Image src={src} alt="" fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-ink-soft">
                No photograph selected
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            className="border border-line px-2 py-1 text-xs hover:border-bronze"
            onClick={() => swapPhoto(photo.src)}
          >
            {photo.label}
          </button>
        ))}
      </div>
      <div className="mt-8 max-w-xl">
        <UploadField
          label="Add move-in or handover photograph"
          accept="image/*"
          hint="Uploaded to secure passport storage bucket."
          uploading={uploading}
          onSelect={handlePhotoUpload}
        />
      </div>
      <div className="mt-6">
        <Button
          onClick={handleAcknowledge}
          disabled={acknowledging || (user?.role === "owner" ? Boolean(ownerAck) : Boolean(tenantAck))}
        >
          {user?.role === "owner"
            ? ownerAck
              ? "Owner record verified"
              : acknowledging
                ? "Recording..."
                : "Acknowledge passport (Owner)"
            : tenantAck
              ? "Tenant record verified"
              : acknowledging
                ? "Recording..."
                : "Acknowledge passport (Tenant)"}
        </Button>
      </div>
    </DashboardShell>
  );
}
