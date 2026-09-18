import { createClient } from "./client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface EnquiryRow {
  id: string;
  property_id: string;
  from_name: string;
  message: string;
}

interface ActivityRow {
  title?: string;
  detail?: string;
}

export function subscribeToEnquiries(
  onNewEnquiry: (enquiry: { id: string; propertyId: string; fromName: string; message: string }) => void,
): (() => void) | null {
  const supabase = createClient();
  if (!supabase) return null;

  try {
    const channel: RealtimeChannel = supabase
      .channel("public:enquiries")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "enquiries",
        },
        (payload) => {
          if (payload.new && typeof payload.new === "object") {
            const row = payload.new as EnquiryRow;
            onNewEnquiry({
              id: row.id,
              propertyId: row.property_id,
              fromName: row.from_name,
              message: row.message,
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn("Failed to subscribe to enquiries realtime:", err);
    return null;
  }
}

export function subscribeToWorkspaceEvents(
  workspaceId: string,
  onEvent: (event: { type: string; title: string; detail: string }) => void,
): (() => void) | null {
  const supabase = createClient();
  if (!supabase) return null;

  try {
    const channel: RealtimeChannel = supabase
      .channel(`workspace:${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workspace_activity",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === "object") {
            const row = payload.new as ActivityRow;
            onEvent({
              type: "activity",
              title: row.title || "Workspace Update",
              detail: row.detail || "",
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn("Failed to subscribe to workspace realtime:", err);
    return null;
  }
}
