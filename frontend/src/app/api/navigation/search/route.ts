import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface SearchSuggestion {
  id: string;
  type: "city" | "locality" | "property";
  title: string;
  subtitle: string;
  badge?: string;
  url: string;
}

const METRO_CITIES = [
  { name: "Mumbai", count: 972, avgRent: "₹85k", state: "Maharashtra" },
  { name: "Bangalore", count: 886, avgRent: "₹25k", state: "Karnataka" },
  { name: "Chennai", count: 891, avgRent: "₹22k", state: "Tamil Nadu" },
  { name: "Hyderabad", count: 868, avgRent: "₹21k", state: "Telangana" },
  { name: "Delhi", count: 605, avgRent: "₹29k", state: "Delhi NCR" },
  { name: "Kolkata", count: 524, avgRent: "₹12k", state: "West Bengal" },
];

const POPULAR_LOCALITIES = [
  { name: "Bandra West", city: "Mumbai" },
  { name: "Andheri West", city: "Mumbai" },
  { name: "Juhu", city: "Mumbai" },
  { name: "Koramangala", city: "Bangalore" },
  { name: "Indiranagar", city: "Bangalore" },
  { name: "Whitefield", city: "Bangalore" },
  { name: "HSR Layout", city: "Bangalore" },
  { name: "Gachibowli", city: "Hyderabad" },
  { name: "Hitec City", city: "Hyderabad" },
  { name: "Jubilee Hills", city: "Hyderabad" },
  { name: "Anna Nagar", city: "Chennai" },
  { name: "Adyar", city: "Chennai" },
  { name: "T Nagar", city: "Chennai" },
  { name: "Vasant Kunj", city: "Delhi" },
  { name: "Hauz Khas", city: "Delhi" },
  { name: "Greater Kailash", city: "Delhi" },
  { name: "Salt Lake", city: "Kolkata" },
  { name: "New Town", city: "Kolkata" },
  { name: "Ballygunge", city: "Kolkata" },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  if (!q) {
    // Default popular suggestions
    const suggestions: SearchSuggestion[] = METRO_CITIES.map((c) => ({
      id: `city-${c.name}`,
      type: "city",
      title: c.name,
      subtitle: `${c.count} available residences · Avg ${c.avgRent}`,
      badge: "Metro Hub",
      url: `/properties?city=${encodeURIComponent(c.name)}`,
    }));
    return NextResponse.json({ success: true, suggestions });
  }

  const results: SearchSuggestion[] = [];

  // 1. Match Cities
  for (const city of METRO_CITIES) {
    if (city.name.toLowerCase().includes(q)) {
      results.push({
        id: `city-${city.name}`,
        type: "city",
        title: city.name,
        subtitle: `${city.count} residences · Avg ${city.avgRent}/mo (${city.state})`,
        badge: "City",
        url: `/properties?city=${encodeURIComponent(city.name)}`,
      });
    }
  }

  // 2. Match Localities
  for (const loc of POPULAR_LOCALITIES) {
    if (loc.name.toLowerCase().includes(q) || loc.city.toLowerCase().includes(q)) {
      results.push({
        id: `loc-${loc.name}`,
        type: "locality",
        title: loc.name,
        subtitle: `Prime neighborhood in ${loc.city}`,
        badge: "Locality",
        url: `/properties?city=${encodeURIComponent(loc.city)}&locality=${encodeURIComponent(loc.name)}`,
      });
    }
  }

  // 3. Match from Supabase properties if query has length >= 2
  if (q.length >= 2) {
    try {
      const supabase = await createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("properties")
          .select("id, title, city, locality, rent, bedrooms, area_sqft, bhk")
          .or(`title.ilike.%${q}%,locality.ilike.%${q}%,city.ilike.%${q}%`)
          .limit(5);

        if (!error && data) {
          for (const item of data) {
            results.push({
              id: item.id,
              type: "property",
              title: item.title,
              subtitle: `${item.bhk || item.bedrooms || 1} BHK · ₹${Number(item.rent || 0).toLocaleString("en-IN")}/mo · ${item.locality || ""}, ${item.city}`,
              badge: "Residence",
              url: `/property/${item.id}`,
            });
          }
        }
      }
    } catch {
      // Ignore error and return static matches
    }
  }

  // Deduplicate and limit to 8 results
  const unique = Array.from(new Map(results.map((r) => [r.id, r])).values()).slice(0, 8);

  return NextResponse.json({
    success: true,
    query: q,
    count: unique.length,
    suggestions: unique,
  });
}
