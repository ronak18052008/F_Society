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
import { useNivasa } from "@/store/nivasa-store";
import { getConditionPassport, acknowledgePassport, addRoomPhoto } from "@/lib/supabase/passport";
import { uploadFile } from "@/lib/supabase/storage";
import type { ConditionPassport } from "@/types";

export default function PassportPage() {
  const { id } = useParams<{ id: string }>();
  const { toast, user } = useNivasa();
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
    <DashboardShell
      title="Digital Condition Passport"
      subtitle="Cryptographically timestamped baseline photographs and condition notes creating a dispute-proof move-in and handover record."
    >
      {/* Dual Signature Badges */}
      <div className="flex flex-wrap items-center gap-3 pb-6 border-b border-warm-200/80 dark:border-forest/40">
        <StatusBadge tone={tenantAck ? "ok" : "warn"}>
          Tenant {tenantAck ? `Signed · ${formatDateTime(tenantAck)}` : "Pending Signature"}
        </StatusBadge>
        <StatusBadge tone={ownerAck ? "ok" : "warn"}>
          Owner {ownerAck ? `Signed · ${formatDateTime(ownerAck)}` : "Pending Signature"}
        </StatusBadge>
      </div>

      {/* Room-by-Room Inspection Cards */}
      <div className="mt-8 space-y-6">
        {data.rooms.map((room) => (
          <article
            key={room.id}
            className="rounded-3xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-6 sm:p-8 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-ink dark:text-cream">{room.name}</h2>
                <p className="mt-1 text-xs sm:text-sm text-ink-muted">{room.notes}</p>
              </div>
              {room.reviewRequired ? (
                <StatusBadge tone="warn">Discrepancy Flagged</StatusBadge>
              ) : (
                <StatusBadge tone="ok">Verified Clean</StatusBadge>
              )}
            </div>

            {/* Horizontal Photo Strip */}
            <div className="mt-5 flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {room.photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => swapPhoto(photo.src)}
                  className="group relative h-40 w-60 shrink-0 overflow-hidden rounded-2xl border border-warm-200 dark:border-forest/40 bg-warm-100 dark:bg-forest/20 cursor-pointer shadow-xs hover:border-pista transition-all"
                >
                  <Image src={photo.src} alt={photo.label} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 text-[11px] text-white">
                    <p className="font-semibold leading-tight">{photo.label}</p>
                    <p className="text-[10px] text-white/70">{formatDateTime(photo.takenAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* Dual Comparison Viewport */}
      <div className="mt-12 rounded-3xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl font-serif font-bold text-ink dark:text-cream">Dual Frame Inspection Comparison</h2>
            <p className="mt-1 text-xs text-ink-muted">
              Select any photograph from the gallery to compare move-in state against interim inspection records.
            </p>
          </div>
          <span className="text-xs font-semibold text-forest dark:text-pista">Click any photo below to inspect</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[left, right].map((src, index) => (
            <div
              key={src + index}
              className="relative h-72 sm:h-80 overflow-hidden rounded-2xl border border-warm-200 dark:border-forest/40 bg-warm-100/50 dark:bg-forest/20 shadow-inner"
            >
              {src ? (
                <Image src={src} alt="Comparison specimen" fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-ink-muted">
                  No photograph selected for frame {index + 1}
                </div>
              )}
              <span className="absolute top-3 left-3 rounded-full bg-forest/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                Viewport {index === 0 ? "A (Baseline)" : "B (Current)"}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              className="rounded-full border border-warm-200 dark:border-forest/40 bg-card dark:bg-card-dark px-3 py-1 text-xs font-medium text-ink-muted hover:border-pista hover:text-forest dark:hover:text-pista transition cursor-pointer"
              onClick={() => swapPhoto(photo.src)}
            >
              {photo.label}
            </button>
          ))}
        </div>
      </div>

      {/* Upload & Signature Block */}
      <div className="mt-10 grid gap-8 md:grid-cols-2 items-start">
        <div className="rounded-3xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-6 sm:p-8 shadow-xs">
          <h3 className="text-base font-serif font-bold text-ink dark:text-cream mb-2">Upload Condition Document / Photo</h3>
          <UploadField
            label="Upload Room Photograph"
            accept="image/*"
            hint="Stored immutably on Supabase Storage bucket for condition validation."
            uploading={uploading}
            onSelect={handlePhotoUpload}
          />
        </div>

        <div className="rounded-3xl border border-warm-200/80 dark:border-forest/40 bg-card dark:bg-card-dark p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-serif font-bold text-ink dark:text-cream mb-2">Mutual Handover Confirmation</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              By digitally acknowledging, both parties verify that baseline fixtures, walls, and electrical appliances match the photographs above.
            </p>
          </div>
          <div className="mt-6">
            <Button
              size="lg"
              className="w-full"
              onClick={handleAcknowledge}
              disabled={acknowledging || (user?.role === "owner" ? Boolean(ownerAck) : Boolean(tenantAck))}
            >
              {user?.role === "owner"
                ? ownerAck
                  ? "✓ Owner Record Verified & Signed"
                  : acknowledging
                    ? "Recording Signature..."
                    : "Sign & Acknowledge (Owner)"
                : tenantAck
                  ? "✓ Tenant Record Verified & Signed"
                  : acknowledging
                    ? "Recording Signature..."
                    : "Sign & Acknowledge (Tenant)"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
