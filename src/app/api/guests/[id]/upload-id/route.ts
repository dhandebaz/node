import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: guestId } = await params;
    const tenantId = await requireActiveTenant();
    const supabase = await getSupabaseServer();

    // Verify Guest exists and belongs to tenant
    const { data: guest, error: guestError } = await supabase
      .from("guests")
      .select("id, name")
      .eq("id", guestId)
      .eq("tenant_id", tenantId)
      .single();

    if (guestError || !guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const frontImage = formData.get("frontImage") as File;
    const backImage = formData.get("backImage") as File;
    const documentType = formData.get("documentType") as string;

    if (!frontImage || !documentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Mock Upload (In real app, upload to storage bucket)
    // const { data: uploadData, error: uploadError } = await supabase.storage.from('ids').upload(...)
    const mockPath = `secure/ids/${tenantId}/${guestId}/${Date.now()}_front.jpg`;

    // Update Guest Status
    const { data: updated, error: updateError } = await supabase
      .from("guests")
      .update({
        id_verification_status: "submitted",
        // Store metadata in a separate table usually, but for now assuming guest table has fields or we just update status
        // If guest table has metadata column:
        // metadata: { documentType, frontPath: mockPath }
      })
      .eq("id", guestId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: "Failed to update guest status" }, { status: 500 });
    }

    // Log Event
    await logEvent({
      tenant_id: tenantId,
      actor_type: "user", // Guest is the user here technically, or system if proxy
      event_type: EVENT_TYPES.ID_SUBMITTED,
      entity_type: "guest",
      entity_id: guestId,
      metadata: { documentType }
    });

    return NextResponse.json({
      success: true,
      status: "submitted",
      guestId
    });

  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
