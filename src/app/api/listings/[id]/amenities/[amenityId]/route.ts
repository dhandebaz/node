import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; amenityId: string }> }
) {
  const { amenityId } = await params;
  try {
    const body = await request.json();
    const { amenity_category, amenity_name, is_available, notes } = body;

    const updateData: Record<string, any> = {};
    if (amenity_category !== undefined) updateData.amenity_category = amenity_category;
    if (amenity_name !== undefined) updateData.amenity_name = amenity_name;
    if (is_available !== undefined) updateData.is_available = is_available;
    if (notes !== undefined) updateData.notes = notes;

    const { data: amenity, error } = await supabase
      .from("listing_amenities")
      .update(updateData)
      .eq("id", amenityId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ amenity });
  } catch (error) {
    console.error("Error updating amenity:", error);
    return NextResponse.json({ error: "Failed to update amenity" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; amenityId: string }> }
) {
  const { amenityId } = await params;
  try {
    const { error } = await supabase
      .from("listing_amenities")
      .delete()
      .eq("id", amenityId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting amenity:", error);
    return NextResponse.json({ error: "Failed to delete amenity" }, { status: 500 });
  }
}