
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSupabaseServer } from "@/lib/supabase/server";
import { parseICal } from "@/lib/ical";
import { ListingPlatform } from "@/types";
import { WalletService } from "@/lib/services/walletService";
import { PricingService } from "@/lib/services/pricingService";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: listingId } = await params;
  const session = await getSession();

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { platform, url } = body as { platform: ListingPlatform; url: string };

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const supabase = await getSupabaseServer();

  // 1. Verify ownership
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, tenant_id")
    .eq("id", listingId)
    .eq("host_id", session.userId)
    .single();

  if (listingError || !listing) {
    return NextResponse.json({ error: "Listing not found or access denied" }, { status: 404 });
  }

  // Cost Check & Deduction (Calendar Sync)
  // Charge for manual sync action
  const SYNC_TOKEN_EQUIVALENT = 50; 
  const cost = await PricingService.calculateCost('integration_sync', SYNC_TOKEN_EQUIVALENT, listing.tenant_id);
  
  const hasBalance = await WalletService.hasSufficientBalance(listing.tenant_id, cost);
  if (!hasBalance) {
     return NextResponse.json({ error: "Insufficient credits for sync" }, { status: 402 });
  }
  
  await WalletService.deductCredits(listing.tenant_id, cost, 'integration_sync', {
    listing_id: listingId,
    platform
  });

  // 2. Upsert integration
  const { error: upsertError } = await supabase
    .from("listing_integrations")
    .upsert({
      listing_id: listingId,
      tenant_id: listing.tenant_id,
      platform,
      external_ical_url: url,
      status: "connected",
      last_synced_at: new Date().toISOString()
    }, { onConflict: "listing_id, platform" });

  if (upsertError) {
    return NextResponse.json({ error: "Failed to save integration" }, { status: 500 });
  }

  // 3. Fetch and Parse iCal
  try {
    const icalRes = await fetch(url);
    if (!icalRes.ok) throw new Error("Failed to fetch iCal");
    const icalText = await icalRes.text();
    const events = parseICal(icalText);

    // 4. Sync Bookings (Wipe and Replace Strategy for future bookings)
    // Only delete future bookings from this platform to avoid destroying history
    const today = new Date().toISOString().split('T')[0];

    // Delete existing future bookings for this platform
    const { error: deleteError } = await supabase
      .from("bookings")
      .delete()
      .eq("listing_id", listingId)
      .eq("source", platform)
      .gte("start_date", today);

    if (deleteError) throw deleteError;

    // Filter valid events
    const validEvents = events.filter(e => {
      // Basic validation
      if (!e.startDate || !e.endDate) return false;
      // Must be in future or ongoing (end date > now)
      return e.endDate.getTime() > Date.now();
    });

    if (validEvents.length > 0) {
      const bookingsToInsert = validEvents.map(e => ({
        tenant_id: listing.tenant_id,
        listing_id: listingId,
        guest_id: "00000000-0000-0000-0000-000000000000", // Placeholder or create a generic guest?
        // Actually, 'guest_id' is foreign key to 'guests'. 
        // We need a way to handle external guests. 
        // Maybe 'guests' table has a generic 'External Guest' or we create one per booking?
        // Or is guest_id nullable? core memory says "Booking.guestId" is string.
        // Let's check schema for bookings.guest_id nullability.
        // If not nullable, we need a placeholder guest.
        
        start_date: e.startDate.toISOString(),
        end_date: e.endDate.toISOString(),
        status: "confirmed",
        source: platform,
        amount: 0,
        // We need to handle guest_id. I'll check if I can insert without it or if I need to fetch/create a dummy guest.
      }));

      // Wait, I need to solve the guest_id issue.
      // If I cannot insert null, I must have a guest.
      // I'll check if I can make guest_id optional or if there is a 'system' guest.
      // For now, I will try to insert. If it fails, I'll know.
      // But wait, "Do not mock".
      // Correct approach: Create a "Guest" record for the external platform if it doesn't exist?
      // Or just use a generic "External Guest".
      // I'll first check if I can make guest_id nullable.
      // But I can't change schema easily without migration.
      // I'll assume guest_id is nullable OR I need to create a guest.
      // Let's check `bookings` schema in `20240523000002` (if I can find it) or just try.
      
      // Let's try to find a guest first.
      // If no guest, create one "External Guest".
    }
    
    // I will do the insert in a separate step to handle guest_id.
    
    // Get or Create generic External Guest
    let { data: guest } = await supabase
      .from("guests")
      .select("id")
      .eq("email", `external@${platform}.com`)
      .eq("tenant_id", listing.tenant_id)
      .maybeSingle();

    if (!guest) {
      const { data: newGuest, error: guestError } = await supabase
        .from("guests")
        .insert({
          tenant_id: listing.tenant_id,
          name: `${platform} Guest`,
          email: `external@${platform}.com`,
          phone: "0000000000"
        })
        .select("id")
        .single();
      
      if (guestError) {
         // If guest creation fails (maybe constraints), we might be stuck.
         console.error("Failed to create external guest", guestError);
         // Try to find ANY guest? No.
         // If guest_id is nullable, we can skip.
         // I'll assume it's NOT nullable based on typical schema.
         throw guestError;
      }
      guest = newGuest;
    }

    const bookingsToInsert = validEvents.map(e => ({
        tenant_id: listing.tenant_id,
        listing_id: listingId,
        guest_id: guest!.id,
        start_date: e.startDate.toISOString(),
        end_date: e.endDate.toISOString(),
        status: "confirmed",
        source: platform,
        amount: 0
    }));

    if (bookingsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("bookings")
        .insert(bookingsToInsert);
      
      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true, count: bookingsToInsert.length });

  } catch (error: any) {
    console.error("Sync failed:", error);
    // Update status to error
    await supabase
      .from("listing_integrations")
      .update({ 
        status: "error", 
        last_synced_at: new Date().toISOString(),
        error_message: error.message || "Unknown sync error"
      })
      .eq("listing_id", listingId)
      .eq("platform", platform);
      
    return NextResponse.json({ error: error.message || "Sync failed" }, { status: 500 });
  }
}
