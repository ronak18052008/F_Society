import { createClient } from "./client";

export type StorageBucket = "property-images" | "rental-documents" | "passport-photos";

export interface UploadResult {
  url: string | null;
  path: string | null;
  error: string | null;
}

/**
 * Upload a file to a designated Supabase Storage bucket
 */
export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File | Blob,
): Promise<UploadResult> {
  const supabase = createClient();

  if (!supabase) {
    // If Supabase is unconfigured, create an object URL for client preview
    if (typeof window !== "undefined" && file instanceof Blob) {
      const mockUrl = URL.createObjectURL(file);
      return {
        url: mockUrl,
        path: `local-demo/${path}`,
        error: null,
      };
    }
    return {
      url: null,
      path: null,
      error: "Supabase client not initialized",
    };
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
        cacheControl: "3600",
      });

    if (error) {
      return { url: null, path: null, error: error.message };
    }

    // If bucket is public, get public URL
    if (bucket === "property-images" || bucket === "passport-photos") {
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        url: urlData.publicUrl,
        path: data.path,
        error: null,
      };
    }

    // For private buckets, return the storage path
    return {
      url: null,
      path: data.path,
      error: null,
    };
  } catch (err) {
    return {
      url: null,
      path: null,
      error: err instanceof Error ? err.message : "Failed to upload file",
    };
  }
}

/**
 * Generate a temporary signed URL for private bucket objects (e.g. rental documents)
 */
export async function getSignedDocumentUrl(
  path: string,
  expiresInSeconds = 3600,
): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.storage
      .from("rental-documents")
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data) {
      console.warn("Failed to generate signed URL:", error);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.warn("Error creating signed document URL:", err);
    return null;
  }
}

/**
 * Delete a file from a storage bucket
 */
export async function deleteStorageFile(
  bucket: StorageBucket,
  path: string,
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    return !error;
  } catch {
    return false;
  }
}
