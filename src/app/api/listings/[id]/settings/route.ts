import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { requireActiveTenant } from "@/lib/auth/tenant";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: listingId } = await params;
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = await requireActiveTenant();
    const supabase = await getSupabaseServer();

    // Verify listing ownership
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, tenant_id")
      .eq("id", listingId)
      .eq("host_id", session.userId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (listingError) {
      return NextResponse.json(
        { error: listingError.message },
        { status: 500 },
      );
    }

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found or access denied" },
        { status: 404 },
      );
    }

    const body = await request.json();

    // Only allow updating safe settings fields  -  never allow overwriting id/tenant_id/host_id
    const allowedFields: Record<string, unknown> = {};

    if (body.dynamic_pricing_settings !== undefined) {
      allowedFields.dynamic_pricing_settings = body.dynamic_pricing_settings;
    }
    if (body.check_in_instructions !== undefined) {
      allowedFields.check_in_instructions = String(
        body.check_in_instructions,
      ).slice(0, 5000);
    }
    if (body.house_rules !== undefined) {
      allowedFields.house_rules = String(body.house_rules).slice(0, 5000);
    }
    if (body.cancellation_policy !== undefined) {
      allowedFields.cancellation_policy = String(
        body.cancellation_policy,
      ).slice(0, 1000);
    }
    if (body.instant_booking !== undefined) {
      allowedFields.instant_booking = Boolean(body.instant_booking);
    }
    if (body.min_nights !== undefined) {
      const v = Number(body.min_nights);
      if (!isNaN(v) && v >= 1) allowedFields.min_nights = v;
    }
    if (body.max_nights !== undefined) {
      const v = Number(body.max_nights);
      if (!isNaN(v) && v >= 1) allowedFields.max_nights = v;
    }

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json(
        { error: "No valid settings fields provided" },
        { status: 400 },
      );
    }

    allowedFields.updated_at = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("listings")
      .update(allowedFields)
      .eq("id", listingId)
      .eq("tenant_id", tenantId);

    if (updateError) {
      console.error("Listing settings update error:", updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Listing settings PATCH error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
