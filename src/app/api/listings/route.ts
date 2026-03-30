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
  
  const { data: { user } } = await supabase.auth.getUser();
  console.log(`[Listings API] Fetching for User: ${user?.id}, Tenant: ${tenantId}`);

  const { data: listings, error } = await supabase
    .from("listings")
    .select("*")
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("[Listings API] Error fetching listings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[Listings API] Found ${listings?.length || 0} listings for tenant ${tenantId}`);

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
      description: listing.description || null,
      images: listing.images || [],
      amenities: listing.amenities || [],
      internalNotes: listing.internal_notes || null,
      platformsConnected: connectedPlatforms.map((integration: any) => integration.platform),
      calendarSyncStatus: calendarStatus,
      nodebaseIcalUrl: calendar?.nodebase_ical_url || `${baseUrl}/api/public/ical/${listing.id}`
    };
  });

  return NextResponse.json(formattedListings);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = await requireActiveTenant();
  const body = await request.json();
  
  // Handle both { listing, integrations } format and flat format for backward compatibility
  const listing = body?.listing || body;
  const integrations = Array.isArray(body?.integrations) ? body.integrations : [];

  if (!listing?.name && !listing?.title) {
    return NextResponse.json({ error: "Property name is required" }, { status: 400 });
  }

  const supabase = await getSupabaseServer();
  const listingId = listing.id || crypto.randomUUID();

  // Subscription Limit Check
  const { allowed, limit } = await SubscriptionService.checkLimit(tenantId, 'listings');
  if (!allowed) {
    return NextResponse.json({ 
      error: `Listing limit reached (${limit}). Please upgrade your plan.` 
    }, { status: 403 });
  }

  const { error: listingError } = await supabase.from("listings").insert({
    id: listingId,
    tenant_id: tenantId,
    host_id: session.userId,
    title: listing.name || listing.title,
    name: listing.name || listing.title,
    city: listing.city || listing.location || "Unknown",
    location: listing.city || listing.location || "Unknown",
    address: listing.address || null,
    listing_type: listing.type || listing.listing_type || "Property",
    timezone: listing.timezone || "Asia/Kolkata",
    status: listing.status || (integrations.length > 0 ? "active" : "incomplete"),
    description: listing.description || null,
    images: listing.images || [],
    amenities: listing.amenities || [],
    internal_notes: listing.internalNotes || listing.internal_notes || null,
    base_price: listing.basePrice || listing.base_price || null,
    max_guests: listing.maxGuests || listing.max_guests || null,
    check_in_time: listing.checkInTime || listing.check_in_time || null,
    check_out_time: listing.checkOutTime || listing.check_out_time || null,
    rules: listing.rules || null
  });

  if (listingError) {
    console.error("[Listings API] Error inserting listing:", listingError);
    return NextResponse.json({ error: listingError.message }, { status: 500 });
  }

  const baseUrl = getBaseUrl(request);
  const nodebaseIcalUrl = listing.nodebaseIcalUrl || `${baseUrl}/api/public/ical/${listingId}.ics`;
  
  await supabase.from("listing_calendars").upsert({
    listing_id: listingId,
    nodebase_ical_url: nodebaseIcalUrl
  });

  if (integrations.length > 0) {
    const payload = integrations.map((integration: any) => ({
      listing_id: listingId,
      platform: integration.platform,
      external_ical_url: integration.externalIcalUrl || null,
      last_synced_at: integration.lastSyncedAt || null,
      status: integration.status || (integration.externalIcalUrl ? "connected" : "not_connected")
    }));
    await supabase.from("listing_integrations").upsert(payload, { onConflict: "listing_id, platform" });
  }

  // Mark Onboarding Milestones
  try {
    const { data: account } = await supabase.from("accounts").select("onboarding_milestones").eq("tenant_id", tenantId).single();
    const currentMilestones = (account?.onboarding_milestones as string[]) || [];
    const newMilestones = new Set(currentMilestones);
    newMilestones.add("first_listing");
    if (integrations.length > 0) newMilestones.add("connect_integration");
    
    if (newMilestones.size > currentMilestones.length) {
      await supabase.from("accounts").update({ onboarding_milestones: Array.from(newMilestones) }).eq("tenant_id", tenantId);
    }
  } catch (e) {
    console.error("[Listings API] Failed to update milestones:", e);
  }

  return NextResponse.json({
    id: listingId,
    name: listing.name || listing.title,
    status: listing.status || (integrations.length > 0 ? "active" : "incomplete"),
    nodebaseIcalUrl
  });
}
