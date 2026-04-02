import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from("channel_credentials")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting channel credential:", error);
    return NextResponse.json({ error: "Failed to delete credential" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { is_active, credentials } = body;

    const updateData: Record<string, any> = {};
    if (is_active !== undefined) updateData.is_active = is_active;
    if (credentials !== undefined) updateData.credentials = credentials;

    const { data: credential, error } = await supabase
      .from("channel_credentials")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ credential });
  } catch (error) {
    console.error("Error updating channel credential:", error);
    return NextResponse.json({ error: "Failed to update credential" }, { status: 500 });
  }
}