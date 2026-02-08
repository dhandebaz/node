import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";

const getBaseUrl = (request: Request) => {
  const headers = request.headers;
  const protocol = headers.get("x-forwarded-proto") || "http";
  const host = headers.get("x-forwarded-host") || headers.get("host");
  return `${protocol}://${host}`;
};

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const listingId = params.id;
  const supabase = await getSupabaseServer();

  const { data: listing, error } = await supabase
    .from("listings")
    .select("id")
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

  const connectedIntegrations = (integrations || []).filter((integration: any) => integration.external_ical_url);
  const lastSyncedAt = (integrations || [])
    .map((integration: any) => integration.last_synced_at)
    .filter(Boolean)
    .sort()
    .slice(-1)[0] || null;
  const hasError = (integrations || []).some((integration: any) => integration.status === "error");
  const status = hasError
    ? "error"
    : connectedIntegrations.length === 0
      ? "not_connected"
      : lastSyncedAt
        ? "connected"
        : "never_synced";

  const nodebaseIcalUrl = calendar?.nodebase_ical_url || `${getBaseUrl(request)}/api/public/ical/${listingId}`;

  return NextResponse.json({
    calendar: {
      listingId,
      nodebaseIcalUrl
    },
    integrations: (integrations || []).map((integration: any) => ({
      listingId,
      platform: integration.platform,
      externalIcalUrl: integration.external_ical_url || null,
      lastSyncedAt: integration.last_synced_at || null,
      status: integration.status || "not_connected"
    })),
    lastSyncedAt,
    status,
    bookings: []
  });
}
