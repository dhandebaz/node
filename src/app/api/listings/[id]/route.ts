import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

const getBaseUrl = (request: NextRequest) => {
  const headers = request.headers;
  const protocol = headers.get("x-forwarded-proto") || "http";
  const host = headers.get("x-forwarded-host") || headers.get("host");
  return `${protocol}://${host}`;
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await getSupabaseServer();
  const { id: listingId } = await params;

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .eq("host_id", session.userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const [{ data: integrations }, { data: calendar }] = await Promise.all([
    supabase
      .from("listing_integrations")
      .select("listing_id, platform, external_ical_url, last_synced_at, status")
      .eq("listing_id", listingId),
    supabase
      .from("listing_calendars")
      .select("listing_id, nodebase_ical_url")
      .eq("listing_id", listingId)
      .maybeSingle()
  ]);

  const baseUrl = getBaseUrl(request);
  const nodebaseIcalUrl = calendar?.nodebase_ical_url || `${baseUrl}/api/public/ical/${listingId}`;

  return NextResponse.json({
    listing: {
      id: listing.id,
      userId: listing.host_id,
      name: listing.name || listing.title,
      city: listing.city || listing.location || "",
      type: listing.listing_type || "Homestay",
      timezone: listing.timezone || "Asia/Kolkata",
      status: listing.status || "incomplete",
      createdAt: listing.created_at,
      internalNotes: listing.internal_notes || null,
      nodebaseIcalUrl
    },
    integrations: (integrations || []).map((integration: any) => ({
      listingId: integration.listing_id,
      platform: integration.platform,
      externalIcalUrl: integration.external_ical_url || null,
      lastSyncedAt: integration.last_synced_at || null,
      status: integration.status || "not_connected"
    })),
    calendar: {
      listingId,
      nodebaseIcalUrl
    }
  });
}
