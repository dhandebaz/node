import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { SubscriptionService } from "@/lib/services/subscriptionService";
import { ReferralService } from "@/lib/services/referralService";

const getBaseUrl = (request: Request) => {
  const headers = request.headers;
  const protocol = headers.get("x-forwarded-proto") || "http";
  const host = headers.get("x-forwarded-host") || headers.get("host");
  return `${protocol}://${host}`;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = await requireActiveTenant();

  const body = await request.json();
  const listing = body?.listing;
  const integrations = Array.isArray(body?.integrations) ? body.integrations : [];

  if (!listing?.name || !listing?.city || !listing?.type || !listing?.timezone) {
    return NextResponse.json({ error: "Missing required listing fields" }, { status: 400 });
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
    title: listing.name,
    name: listing.name,
    city: listing.city,
    location: listing.city, // Defaulting location to city if not provided
    address: listing.address || null,
    listing_type: listing.type,
    timezone: listing.timezone,
    status: listing.status || (integrations.length > 0 ? "active" : "incomplete"),
    description: listing.description || null,
    images: listing.images || [],
    amenities: listing.amenities || [],
    internal_notes: listing.internalNotes || null,
    base_price: listing.basePrice || null,
    max_guests: listing.maxGuests || null,
    check_in_time: listing.checkInTime || null,
    check_out_time: listing.checkOutTime || null,
    rules: listing.rules || null
  });

  if (listingError) {
    return NextResponse.json({ error: listingError.message }, { status: 500 });
  }

  const nodebaseIcalUrl = listing.nodebaseIcalUrl || `${getBaseUrl(request)}/api/public/ical/${listingId}`;
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

  // Check for referral reward (first listing created)
  await ReferralService.checkAndReward(tenantId);

  // Mark Onboarding Milestones
  const { data: account } = await supabase.from("accounts").select("onboarding_milestones").eq("tenant_id", tenantId).single();
  const currentMilestones = (account?.onboarding_milestones as string[]) || [];
  const newMilestones = new Set(currentMilestones);
  newMilestones.add("first_listing");
  if (integrations.length > 0) newMilestones.add("connect_integration");
  
  if (newMilestones.size > currentMilestones.length) {
    await supabase.from("accounts").update({ onboarding_milestones: Array.from(newMilestones) }).eq("tenant_id", tenantId);
  }

  return NextResponse.json({
    id: listingId,
    userId: session.userId,
    name: listing.name,
    city: listing.city,
    type: listing.type,
    status: listing.status || (integrations.length > 0 ? "active" : "incomplete"),
    description: listing.description || null,
    images: listing.images || [],
    amenities: listing.amenities || [],
    createdAt: new Date().toISOString(),
    maxGuests: listing.maxGuests || null,
    checkInTime: listing.checkInTime || null,
    checkOutTime: listing.checkOutTime || null,
    rules: listing.rules || null,
    basePrice: listing.basePrice || null,
    internalNotes: listing.internalNotes || null,
    platformsConnected: integrations.filter((integration: any) => integration.externalIcalUrl).map((integration: any) => integration.platform),
    calendarSyncStatus: integrations.length > 0 ? "never_synced" : "not_connected",
    nodebaseIcalUrl
  });
}
