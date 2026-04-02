import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { start_date, end_date, reason } = body;

    const updateData: Record<string, any> = {};
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (reason !== undefined) updateData.reason = reason;

    const { data: blockedDate, error } = await supabase
      .from("blocked_dates")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ blocked_date: blockedDate });
  } catch (error) {
    console.error("Error updating blocked date:", error);
    return NextResponse.json({ error: "Failed to update blocked date" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from("blocked_dates")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blocked date:", error);
    return NextResponse.json({ error: "Failed to delete blocked date" }, { status: 500 });
  }
}