import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = params.id;

    const { data: amenities, error } = await supabase
      .from("listing_amenities")
      .select("*")
      .eq("listing_id", listingId)
      .order("amenity_category", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ amenities });
  } catch (error) {
    console.error("Error fetching amenities:", error);
    return NextResponse.json({ error: "Failed to fetch amenities" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { amenity_category, amenity_name, is_available, notes } = body;
    const listingId = params.id;

    if (!amenity_name) {
      return NextResponse.json({ error: "Amenity name required" }, { status: 400 });
    }

    const { data: amenity, error } = await supabase
      .from("listing_amenities")
      .insert({
        listing_id: listingId,
        amenity_category: amenity_category || "other",
        amenity_name,
        is_available: is_available !== false,
        notes
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ amenity });
  } catch (error) {
    console.error("Error creating amenity:", error);
    return NextResponse.json({ error: "Failed to create amenity" }, { status: 500 });
  }
}
