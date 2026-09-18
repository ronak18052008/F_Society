import { NextResponse } from "next/server";
import { getDatasetAnalytics } from "@/lib/supabase/properties";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let totalCount = 4752;
    try {
      const supabase = await createClient();
      if (supabase) {
        const { count, error } = await supabase
          .from("properties")
          .select("*", { count: "exact", head: true });
        if (!error && typeof count === "number" && count > 0) {
          totalCount = count;
        }
      }
    } catch {
      // Fallback
    }

    const analytics = await getDatasetAnalytics();

    return NextResponse.json({
      success: true,
      totalListings: totalCount,
      cities: analytics.cityDistribution,
      bhkDistribution: analytics.bhkDistribution,
      furnishingDistribution: analytics.furnishingDistribution,
      featuredLocalities: [
        { name: "Bandra West", city: "Mumbai" },
        { name: "Koramangala", city: "Bangalore" },
        { name: "Indiranagar", city: "Bangalore" },
        { name: "Gachibowli", city: "Hyderabad" },
        { name: "Anna Nagar", city: "Chennai" },
        { name: "Vasant Kunj", city: "Delhi" },
        { name: "Salt Lake", city: "Kolkata" },
        { name: "Juhu", city: "Mumbai" },
      ],
      quickTags: [
        { label: "Bachelors Friendly", href: "/properties?tenant=Bachelors" },
        { label: "Family Homes", href: "/properties?tenant=Family" },
        { label: "Furnished Residences", href: "/properties?furnishing=Furnished" },
        { label: "Prime Under ₹30K", href: "/properties?maxRent=30000" },
        { label: "Luxury Collection", href: "/properties?minRent=75000" },
      ],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to load navigation summary" },
      { status: 500 },
    );
  }
}
