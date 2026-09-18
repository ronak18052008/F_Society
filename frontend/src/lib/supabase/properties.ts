import { createClient, isDemoFallbackAllowed } from "./client";
import { properties as demoProperties } from "@/data/demo";
import type { Property, PropertyType, Furnishing, Suitability } from "@/types";

export interface PropertyFilterOptions {
  city?: string;
  type?: PropertyType | "all";
  furnishing?: Furnishing | "all";
  suitability?: Suitability | "all";
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  query?: string;
}

interface DatabasePropertyRow {
  id: string;
  slug: string;
  title: string;
  locality: string;
  city: string;
  type: PropertyType;
  furnishing: Furnishing;
  suitability: Suitability[];
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  rent: number;
  deposit: number;
  available_from: string;
  amenities: string[];
  images: string[];
  owner_id: string;
  verification: Property["verification"];
  description: string;
  coordinates: { lat: number; lng: number };
  demo: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

function mapRowToProperty(row: DatabasePropertyRow): Property {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    locality: row.locality,
    city: row.city,
    type: row.type,
    furnishing: row.furnishing,
    suitability: row.suitability || [],
    bedrooms: Number(row.bedrooms) || 1,
    bathrooms: Number(row.bathrooms) || 1,
    areaSqft: Number(row.area_sqft) || 500,
    rent: Number(row.rent) || 0,
    deposit: Number(row.deposit) || 0,
    availableFrom: row.available_from || "Immediately",
    amenities: row.amenities || [],
    images: row.images || [],
    ownerId: row.owner_id,
    verification: row.verification || "listing-unverified",
    description: row.description || "",
    expenses: [],
    coordinates: row.coordinates || { lat: 0, lng: 0 },
    demo: Boolean(row.demo),
  };
}

export async function getProperties(filters?: PropertyFilterOptions): Promise<Property[]> {
  const supabase = createClient();

  if (supabase) {
    try {
      let query = supabase
        .from("properties")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (filters?.city && filters.city !== "all") {
        query = query.eq("city", filters.city);
      }
      if (filters?.type && filters.type !== "all") {
        query = query.eq("type", filters.type);
      }
      if (filters?.furnishing && filters.furnishing !== "all") {
        query = query.eq("furnishing", filters.furnishing);
      }
      if (filters?.minRent) {
        query = query.gte("rent", filters.minRent);
      }
      if (filters?.maxRent) {
        query = query.lte("rent", filters.maxRent);
      }
      if (filters?.bedrooms) {
        query = query.gte("bedrooms", filters.bedrooms);
      }
      if (filters?.query && filters.query.trim()) {
        const q = filters.query.trim();
        query = query.or(`title.ilike.%${q}%,locality.ilike.%${q}%,city.ilike.%${q}%`);
      }

      const { data, error } = await query;

      if (!error && data) {
        return (data as unknown as DatabasePropertyRow[]).map(mapRowToProperty);
      }
    } catch (err) {
      console.warn("Failed to fetch properties from Supabase:", err);
    }
  }

  // Only fall back to demo properties if explicitly allowed (e.g. offline dev)
  if (!isDemoFallbackAllowed()) {
    return [];
  }

  let results = [...demoProperties];

  if (filters?.city && filters.city !== "all") {
    results = results.filter((p) => p.city.toLowerCase() === filters.city?.toLowerCase());
  }
  if (filters?.type && filters.type !== "all") {
    results = results.filter((p) => p.type === filters.type);
  }
  if (filters?.furnishing && filters.furnishing !== "all") {
    results = results.filter((p) => p.furnishing === filters.furnishing);
  }
  if (filters?.suitability && filters.suitability !== "all") {
    results = results.filter((p) => p.suitability.includes(filters.suitability as Suitability));
  }
  if (filters?.minRent) {
    results = results.filter((p) => p.rent >= filters.minRent!);
  }
  if (filters?.maxRent) {
    results = results.filter((p) => p.rent <= filters.maxRent!);
  }
  if (filters?.bedrooms) {
    results = results.filter((p) => p.bedrooms >= filters.bedrooms!);
  }
  if (filters?.query && filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.locality.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q),
    );
  }

  return results;
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const supabase = createClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        return mapRowToProperty(data as unknown as DatabasePropertyRow);
      }
    } catch (err) {
      console.warn(`Failed to fetch property ${id} from Supabase:`, err);
    }
  }

  if (!isDemoFallbackAllowed()) {
    return null;
  }

  const found = demoProperties.find((p) => p.id === id);
  return found || null;
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const supabase = createClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!error && data) {
        return mapRowToProperty(data as unknown as DatabasePropertyRow);
      }
    } catch (err) {
      console.warn(`Failed to fetch property by slug ${slug} from Supabase:`, err);
    }
  }

  if (!isDemoFallbackAllowed()) {
    return null;
  }

  const found = demoProperties.find((p) => p.slug === slug);
  return found || null;
}

export async function getOwnerProperties(ownerId: string): Promise<Property[]> {
  const supabase = createClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        return (data as unknown as DatabasePropertyRow[]).map(mapRowToProperty);
      }
    } catch (err) {
      console.warn("Failed to fetch owner properties from Supabase:", err);
    }
  }

  if (!isDemoFallbackAllowed()) {
    return [];
  }

  return demoProperties.filter((p) => p.ownerId === ownerId);
}

export async function createProperty(
  propertyData: Partial<Property>,
  ownerId: string,
): Promise<{ data: Property | null; error: string | null }> {
  const supabase = createClient();

  if (!supabase) {
    return {
      data: null,
      error: "Supabase is not configured. Real listing creation requires a database connection.",
    };
  }

  try {
    const slug =
      propertyData.slug ||
      (propertyData.title || `property-${Date.now()}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const row = {
      slug,
      title: propertyData.title || "Untitled Property",
      locality: propertyData.locality || "Unknown locality",
      city: propertyData.city || "Mumbai",
      type: propertyData.type || "apartment",
      furnishing: propertyData.furnishing || "semi-furnished",
      suitability: propertyData.suitability || ["working-professional"],
      bedrooms: propertyData.bedrooms ?? 1,
      bathrooms: propertyData.bathrooms ?? 1,
      area_sqft: propertyData.areaSqft ?? 600,
      rent: propertyData.rent ?? 25000,
      deposit: propertyData.deposit ?? 75000,
      available_from: propertyData.availableFrom || "Immediately",
      amenities: propertyData.amenities || [],
      images: propertyData.images || [],
      owner_id: ownerId,
      verification: "listing-unverified" as const,
      description: propertyData.description || "",
      coordinates: propertyData.coordinates || { lat: 19.076, lng: 72.8777 },
      demo: false,
      status: "active",
    };

    const { data, error } = await supabase
      .from("properties")
      .insert(row)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return {
      data: mapRowToProperty(data as unknown as DatabasePropertyRow),
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "An unexpected error occurred",
    };
  }
}

export async function updateProperty(
  id: string,
  propertyData: Partial<Property>,
  ownerId: string,
): Promise<{ data: Property | null; error: string | null }> {
  const supabase = createClient();

  if (!supabase) {
    return {
      data: null,
      error: "Supabase is not configured.",
    };
  }

  try {
    const updatePayload: Record<string, unknown> = {};

    if (propertyData.title !== undefined) updatePayload.title = propertyData.title;
    if (propertyData.locality !== undefined) updatePayload.locality = propertyData.locality;
    if (propertyData.city !== undefined) updatePayload.city = propertyData.city;
    if (propertyData.type !== undefined) updatePayload.type = propertyData.type;
    if (propertyData.furnishing !== undefined) updatePayload.furnishing = propertyData.furnishing;
    if (propertyData.suitability !== undefined) updatePayload.suitability = propertyData.suitability;
    if (propertyData.bedrooms !== undefined) updatePayload.bedrooms = propertyData.bedrooms;
    if (propertyData.bathrooms !== undefined) updatePayload.bathrooms = propertyData.bathrooms;
    if (propertyData.areaSqft !== undefined) updatePayload.area_sqft = propertyData.areaSqft;
    if (propertyData.rent !== undefined) updatePayload.rent = propertyData.rent;
    if (propertyData.deposit !== undefined) updatePayload.deposit = propertyData.deposit;
    if (propertyData.availableFrom !== undefined) updatePayload.available_from = propertyData.availableFrom;
    if (propertyData.amenities !== undefined) updatePayload.amenities = propertyData.amenities;
    if (propertyData.images !== undefined) updatePayload.images = propertyData.images;
    if (propertyData.description !== undefined) updatePayload.description = propertyData.description;
    if (propertyData.coordinates !== undefined) updatePayload.coordinates = propertyData.coordinates;

    const { data, error } = await supabase
      .from("properties")
      .update(updatePayload)
      .eq("id", id)
      .eq("owner_id", ownerId)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return {
      data: mapRowToProperty(data as unknown as DatabasePropertyRow),
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "An unexpected error occurred",
    };
  }
}

export async function deleteProperty(
  id: string,
  ownerId: string,
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();

  if (!supabase) {
    return { success: true, error: null };
  }

  try {
    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", id)
      .eq("owner_id", ownerId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred",
    };
  }
}

