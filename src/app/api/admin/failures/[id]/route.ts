import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    const supabase = await getSupabaseAdmin();

    const { data: failure, error: fetchError } = await supabase
      .from("failures")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !failure) {
      return NextResponse.json(
        { error: "Failure not found" },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from("failures")
      .update({
        is_active: false,
        resolved_at: new Date().toISOString(),
        resolution_reason: reason || null,
        resolved_by: failure.tenant_id,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to resolve failure:", updateError);
      return NextResponse.json(
        { error: "Failed to resolve failure" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error resolving failure:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const supabase = await getSupabaseAdmin();

    const { error: deleteError } = await supabase
      .from("failures")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Failed to delete failure:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete failure" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error deleting failure:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
