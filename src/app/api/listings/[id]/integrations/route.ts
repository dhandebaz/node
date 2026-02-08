import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const integrations = Array.isArray(body?.integrations) ? body.integrations : [];
  const listingId = params.id;

  const supabase = await getSupabaseServer();

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id")
    .eq("id", listingId)
    .eq("host_id", session.userId)
    .maybeSingle();

  if (listingError) {
    return NextResponse.json({ error: listingError.message }, { status: 500 });
  }

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const payload = integrations.map((integration: any) => ({
    listing_id: listingId,
    platform: integration.platform,
    external_ical_url: integration.externalIcalUrl || null,
    last_synced_at: integration.lastSyncedAt || null,
    status: integration.status || (integration.externalIcalUrl ? "connected" : "not_connected"),
    updated_at: new Date().toISOString()
  }));

  if (payload.length > 0) {
    const { error } = await supabase.from("listing_integrations").upsert(payload, {
      onConflict: "listing_id, platform"
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    integrations: payload.map((integration: any) => ({
      listingId,
      platform: integration.platform,
      externalIcalUrl: integration.external_ical_url,
      lastSyncedAt: integration.last_synced_at,
      status: integration.status
    }))
  });
}
