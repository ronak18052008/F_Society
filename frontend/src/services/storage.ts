import { createClient } from "@/lib/supabase/client";

const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_DATA_MODE !== "demo" &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

export async function uploadPropertyImage(params: {
  ownerId: string;
  propertyId: string;
  file: File;
}): Promise<{ url: string | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { url: URL.createObjectURL(params.file), error: null };
  }

  const supabase = createClient();
  const filePath = `${params.ownerId}/${params.propertyId}/${Date.now()}-${params.file.name}`;

  const { error } = await supabase.storage
    .from("property-images")
    .upload(filePath, params.file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return { url: null, error: error.message };
  }

  const { data } = supabase.storage.from("property-images").getPublicUrl(filePath);
  return { url: data.publicUrl, error: null };
}

export async function uploadRentalDocument(params: {
  workspaceId: string;
  documentId: string;
  file: File;
}): Promise<{ path: string | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { path: `local-doc-${params.file.name}`, error: null };
  }

  const supabase = createClient();
  const filePath = `${params.workspaceId}/${params.documentId}/${params.file.name}`;

  const { error } = await supabase.storage
    .from("rental-documents")
    .upload(filePath, params.file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return { path: null, error: error.message };
  }

  return { path: filePath, error: null };
}

export async function uploadPassportPhoto(params: {
  workspaceId: string;
  roomId: string;
  file: File;
}): Promise<{ path: string | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { path: URL.createObjectURL(params.file), error: null };
  }

  const supabase = createClient();
  const filePath = `${params.workspaceId}/${params.roomId}/${Date.now()}-${params.file.name}`;

  const { error } = await supabase.storage
    .from("passport-photos")
    .upload(filePath, params.file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return { path: null, error: error.message };
  }

  return { path: filePath, error: null };
}
