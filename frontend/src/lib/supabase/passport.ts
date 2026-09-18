import { createClient, isDemoFallbackAllowed } from "./client";
import { passport as demoPassport } from "@/data/demo";
import type { ConditionPassport, PassportRoom } from "@/types";

export async function getConditionPassport(rentalId: string): Promise<ConditionPassport> {
  const supabase = createClient();

  if (supabase) {
    try {
      const { data: passportRow, error } = await supabase
        .from("condition_passports")
        .select(`
          id,
          rental_id,
          tenant_acknowledged_at,
          owner_acknowledged_at,
          passport_rooms (
            id,
            name,
            notes,
            review_required,
            photos
          )
        `)
        .eq("rental_id", rentalId)
        .maybeSingle();

      if (!error && passportRow) {
        interface PassportRoomRow {
          id: string;
          name: string;
          notes: string | null;
          review_required: boolean;
          photos: PassportRoom["photos"];
        }
        interface PassportRow {
          id: string;
          rental_id: string;
          tenant_acknowledged_at: string | null;
          owner_acknowledged_at: string | null;
          passport_rooms: PassportRoomRow[];
        }

        const typedRow = passportRow as unknown as PassportRow;
        const rooms: PassportRoom[] = (typedRow.passport_rooms || []).map((r: PassportRoomRow) => ({
          id: r.id,
          name: r.name,
          notes: r.notes || "",
          reviewRequired: Boolean(r.review_required),
          photos: r.photos || [],
        }));

        return {
          rentalId: typedRow.rental_id,
          rooms,
          tenantAcknowledgedAt: typedRow.tenant_acknowledged_at || undefined,
          ownerAcknowledgedAt: typedRow.owner_acknowledged_at || undefined,
        };
      }
    } catch (err) {
      console.warn("Failed to fetch condition passport from Supabase:", err);
    }
  }

  // Only fall back to demo if explicitly allowed
  if (!isDemoFallbackAllowed()) {
    return {
      rentalId,
      rooms: [],
      tenantAcknowledgedAt: undefined,
      ownerAcknowledgedAt: undefined,
    };
  }

  return demoPassport;
}

export async function acknowledgePassport(
  rentalId: string,
  role: "tenant" | "owner",
): Promise<{ success: boolean; acknowledgedAt: string }> {
  const supabase = createClient();
  const now = new Date().toISOString();

  if (!supabase) {
    return { success: true, acknowledgedAt: now };
  }

  try {
    const updateField =
      role === "tenant" ? "tenant_acknowledged_at" : "owner_acknowledged_at";

    const { error } = await supabase
      .from("condition_passports")
      .update({ [updateField]: now })
      .eq("rental_id", rentalId);

    if (error) {
      console.warn("Error recording acknowledgement:", error);
    }

    return { success: !error, acknowledgedAt: now };
  } catch (err) {
    console.warn("Passport acknowledgement error:", err);
    return { success: true, acknowledgedAt: now };
  }
}

export async function addRoomPhoto(
  rentalId: string,
  roomId: string,
  photo: { id: string; label: string; src: string; takenAt: string },
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();

  if (!supabase) {
    return { success: true, error: null };
  }

  try {
    const { data: room, error: fetchErr } = await supabase
      .from("passport_rooms")
      .select("photos")
      .eq("id", roomId)
      .maybeSingle();

    if (fetchErr || !room) {
      return { success: false, error: fetchErr?.message || "Room not found" };
    }

    const updatedPhotos = [...(room.photos || []), photo];

    const { error: updateErr } = await supabase
      .from("passport_rooms")
      .update({ photos: updatedPhotos })
      .eq("id", roomId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to record photo",
    };
  }
}

export async function createConditionPassport(
  rentalId: string,
  initialRooms: {
    name: string;
    notes?: string;
    photos?: { id: string; label: string; src: string; takenAt: string }[];
  }[] = [],
): Promise<{ data: ConditionPassport | null; error: string | null }> {
  const supabase = createClient();

  if (!supabase) {
    return { data: null, error: "Supabase not configured" };
  }

  try {
    const { data: passport, error: passErr } = await supabase
      .from("condition_passports")
      .insert({ rental_id: rentalId })
      .select()
      .single();

    if (passErr) {
      return { data: null, error: passErr.message };
    }

    const defaultRoomDefs: {
      name: string;
      notes: string;
      photos: { id: string; label: string; src: string; takenAt: string }[];
    }[] = [
      { name: "Living Room", notes: "Baseline move-in condition", photos: [] },
      { name: "Master Bedroom", notes: "Baseline move-in condition", photos: [] },
      { name: "Kitchen", notes: "Appliances & fixtures check", photos: [] },
    ];

    const roomsToInsert = (initialRooms.length > 0 ? initialRooms : defaultRoomDefs).map((r) => ({
      passport_id: passport.id,
      name: r.name,
      notes: r.notes || "",
      photos: r.photos || [],
      review_required: false,
    }));

    const { data: rooms, error: roomErr } = await supabase
      .from("passport_rooms")
      .insert(roomsToInsert)
      .select();

    if (roomErr) {
      return { data: null, error: roomErr.message };
    }

    return {
      data: {
        rentalId: passport.rental_id,
        rooms: (rooms || []).map((r) => ({
          id: r.id,
          name: r.name,
          notes: r.notes || "",
          reviewRequired: Boolean(r.review_required),
          photos: r.photos || [],
        })),
        tenantAcknowledgedAt: passport.tenant_acknowledged_at || undefined,
        ownerAcknowledgedAt: passport.owner_acknowledged_at || undefined,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to create passport",
    };
  }
}

