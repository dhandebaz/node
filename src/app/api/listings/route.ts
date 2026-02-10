import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { SubscriptionService } from "@/lib/services/subscriptionService";

const getBaseUrl = (request: Request) => {
  const headers = request.headers;
  const protocol = headers.get("x-forwarded-proto") || "http";
  const host = headers.get("x-forwarded-host") || headers.get("host");
  return `${protocol}://${host}`;
};

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = await requireActiveTenant();

  const supabase = await getSupabaseServer();
  
  const { data: listings, error } = await supabase
    .from("listings")
    .select("*")
    .eq("tenant_id", tenantId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const listingIds = (listings || []).map((listing: any) => listing.id);
  const [{ data: integrations }, { data: calendars }] = await Promise.all([
    listingIds.length
      ? supabase
          .from("listing_integrations")
          .select("listing_id, platform, external_ical_url, last_synced_at, status")
          .in("listing_id", listingIds)
      : Promise.resolve({ data: [] as any[] }),
    listingIds.length
      ? supabase
          .from("listing_calendars")
          .select("listing_id, nodebase_ical_url")
          .in("listing_id", listingIds)
      : Promise.resolve({ data: [] as any[] })
  ]);

  const baseUrl = getBaseUrl(request);
  const formattedListings = (listings || []).map((listing: any) => {
    const listingIntegrations = (integrations || []).filter((integration: any) => integration.listing_id === listing.id);
    const connectedPlatforms = listingIntegrations.filter((integration: any) => Boolean(integration.external_ical_url));
    const hasError = listingIntegrations.some((integration: any) => integration.status === "error");
    const hasSync = listingIntegrations.some((integration: any) => integration.last_synced_at);
    const calendarStatus = hasError
      ? "error"
      : connectedPlatforms.length === 0
        ? "not_connected"
        : hasSync
          ? "connected"
          : "never_synced";
    const calendar = (calendars || []).find((entry: any) => entry.listing_id === listing.id);

    return {
      id: listing.id,
      userId: listing.host_id,
      name: listing.name || listing.title,
      city: listing.city || listing.location || "",
      type: listing.listing_type || "Homestay",
      timezone: listing.timezone || "Asia/Kolkata",
      status: listing.status || (connectedPlatforms.length > 0 ? "active" : "incomplete"),
      createdAt: listing.created_at,
      internalNotes: listing.internal_notes || null,
      platformsConnected: connectedPlatforms.map((integration: any) => integration.platform),
      calendarSyncStatus: calendarStatus,
      nodebaseIcalUrl: calendar?.nodebase_ical_url || `${baseUrl}/api/public/ical/${listing.id}`
    };
  });

  return NextResponse.json(formattedListings);
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = await requireActiveTenant();

  const { allowed, limit, current } = await SubscriptionService.checkLimit(tenantId, 'listings');
  if (!allowed) {
    return NextResponse.json({ 
      error: `Plan limit reached. Your current plan allows ${limit} listings. You have ${current}.` 
    }, { status: 403 });
  }

  const body = await request.json();
  const title = body?.title?.trim();
  const location = body?.location?.trim() || '';
  const basePrice = Number(body?.basePrice || 0);
  const maxGuests = Number(body?.maxGuests || 1);

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('listings')
    .insert({
      tenant_id: tenantId,
      host_id: user.id,
      title,
      location,
      base_price: basePrice,
      max_guests: maxGuests
    })
    .select('*')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Failed to create listing' }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    hostId: data.host_id,
    title: data.title,
    location: data.location,
    maxGuests: data.max_guests,
    checkInTime: data.check_in_time,
    checkOutTime: data.check_out_time,
    rules: data.rules,
    basePrice: data.base_price,
    calendarIcalUrl: data.calendar_ical_url
  });
}
