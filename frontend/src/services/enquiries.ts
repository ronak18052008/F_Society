import { createClient } from "@/lib/supabase/client";
import { seedEnquiries } from "@/data/demo";
import type { Enquiry } from "@/types";
import type { PropertyEnquiry } from "@/types/database";

const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_DATA_MODE !== "demo" &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

export async function sendEnquiry(input: {
  propertyId: string;
  fromUserId: string;
  fromName: string;
  message: string;
}): Promise<{ enquiry: Enquiry | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const localEnquiry: Enquiry = {
      id: crypto.randomUUID(),
      propertyId: input.propertyId,
      fromName: input.fromName,
      message: input.message,
      createdAt: new Date().toISOString(),
      status: "sent",
    };
    return { enquiry: localEnquiry, error: null };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("property_enquiries")
    .insert({
      property_id: input.propertyId,
      from_user_id: input.fromUserId,
      message: input.message,
      status: "sent",
    })
    .select()
    .single();

  if (error || !data) {
    return { enquiry: null, error: error?.message ?? "Failed to send enquiry" };
  }

  const typed = data as PropertyEnquiry;
  return {
    enquiry: {
      id: typed.id,
      propertyId: typed.property_id,
      fromName: input.fromName,
      message: typed.message,
      createdAt: typed.created_at,
      status: typed.status,
    },
    error: null,
  };
}

export async function fetchUserEnquiries(userId: string): Promise<Enquiry[]> {
  if (!isSupabaseConfigured()) {
    return seedEnquiries;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("property_enquiries")
    .select("*, profiles!from_user_id(name)")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return seedEnquiries;
  }

  return data.map((row: any) => ({
    id: row.id,
    propertyId: row.property_id,
    fromName: row.profiles?.name ?? "Applicant",
    message: row.message,
    createdAt: row.created_at,
    status: row.status,
  }));
}
