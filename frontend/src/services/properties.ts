import { createClient } from "@/lib/supabase/client";
import { properties as demoProperties } from "@/data/demo";
import type { ExpenseLine, Property, PropertyType, Furnishing, Suitability } from "@/types";
import type { PropertyExpense, PropertyRow } from "@/types/database";

const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_DATA_MODE !== "demo" &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

export async function fetchProperties(): Promise<Property[]> {
  if (!isSupabaseConfigured()) {
    return demoProperties;
  }

  const supabase = createClient()!;
  const { data: propertiesData, error } = await supabase
    .from("properties")
    .select("*, property_expenses(*)")
    .order("created_at", { ascending: false });

  if (error || !propertiesData) {
    console.error("Error fetching properties:", error);
    return demoProperties;
  }

  return propertiesData.map((row: any) => mapDatabaseToFrontendProperty(row, row.property_expenses ?? []));
}

export async function fetchPropertyByIdOrSlug(idOrSlug: string): Promise<Property | null> {
  if (!isSupabaseConfigured()) {
    return demoProperties.find((p) => p.id === idOrSlug || p.slug === idOrSlug) ?? null;
  }

  const supabase = createClient()!;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

  const query = supabase.from("properties").select("*, property_expenses(*)");
  const { data, error } = isUuid
    ? await query.eq("id", idOrSlug).maybeSingle()
    : await query.eq("slug", idOrSlug).maybeSingle();

  if (error || !data) {
    // Fallback search in demo data
    return demoProperties.find((p) => p.id === idOrSlug || p.slug === idOrSlug) ?? null;
  }

  const row = data as any;
  return mapDatabaseToFrontendProperty(row, row.property_expenses ?? []);
}

export async function createPropertyListing(input: {
  title: string;
  slug: string;
  locality: string;
  city: string;
  propertyType: PropertyType;
  furnishing: Furnishing;
  suitability: Suitability[];
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  rent: number;
  deposit: number;
  availableFrom: string;
  amenities: string[];
  images: string[];
  ownerId: string;
  description: string;
  expenses: Omit<ExpenseLine, "id">[];
  lat?: number;
  lng?: number;
  isPublished?: boolean;
}): Promise<{ property: Property | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const demoId = `prop-local-${Date.now()}`;
    const newProperty: Property = {
      id: demoId,
      slug: input.slug,
      title: input.title,
      locality: input.locality,
      city: input.city,
      type: input.propertyType,
      furnishing: input.furnishing,
      suitability: input.suitability,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      areaSqft: input.areaSqft,
      rent: input.rent,
      deposit: input.deposit,
      availableFrom: input.availableFrom,
      amenities: input.amenities,
      images: input.images,
      ownerId: input.ownerId,
      verification: "listing-unverified",
      description: input.description,
      expenses: input.expenses.map((e, idx) => ({ ...e, id: `e-${idx}` })),
      coordinates: { lat: input.lat ?? 0, lng: input.lng ?? 0 },
      demo: true,
    };
    return { property: newProperty, error: null };
  }

  const supabase = createClient()!;
  const { data: propData, error: propError } = await supabase
    .from("properties")
    .insert({
      title: input.title,
      slug: input.slug,
      locality: input.locality,
      city: input.city,
      property_type: input.propertyType,
      furnishing: input.furnishing,
      suitability: input.suitability,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      area_sqft: input.areaSqft,
      rent: input.rent,
      deposit: input.deposit,
      available_from: input.availableFrom,
      amenities: input.amenities,
      images: input.images,
      owner_id: input.ownerId,
      description: input.description,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      is_published: input.isPublished ?? true,
      is_demo: false,
    })
    .select()
    .single();

  if (propError || !propData) {
    return { property: null, error: propError?.message ?? "Failed to create property" };
  }

  const typedProp = propData as PropertyRow;

  // Insert associated expenses
  if (input.expenses.length > 0) {
    const expenseInserts = input.expenses.map((exp, idx) => ({
      property_id: typedProp.id,
      label: exp.label,
      amount: exp.amount,
      cadence: exp.cadence,
      source: exp.source === "verified" ? ("owner-provided" as const) : exp.source,
      note: exp.note ?? null,
      sort_order: idx,
    }));

    await supabase.from("property_expenses").insert(expenseInserts);
  }

  return {
    property: mapDatabaseToFrontendProperty(typedProp, []),
    error: null,
  };
}

function mapDatabaseToFrontendProperty(row: PropertyRow, expenses: PropertyExpense[]): Property {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    locality: row.locality,
    city: row.city,
    type: row.property_type,
    furnishing: row.furnishing,
    suitability: row.suitability as Suitability[],
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaSqft: row.area_sqft,
    rent: row.rent,
    deposit: row.deposit,
    availableFrom: row.available_from,
    amenities: row.amenities ?? [],
    images: row.images ?? [],
    ownerId: row.owner_id,
    verification: row.verification,
    description: row.description,
    expenses: expenses.map((exp) => ({
      id: exp.id,
      label: exp.label,
      amount: exp.amount,
      cadence: exp.cadence,
      source: exp.source,
      note: exp.note ?? undefined,
    })),
    coordinates: {
      lat: row.lat ?? 0,
      lng: row.lng ?? 0,
    },
    demo: row.is_demo,
  };
}
