import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface BookingAutomationOptions {
  bookingId: string;
  tenantId: string;
  listingId: string;
  guestId: string;
  startDate: string;
  endDate: string;
}

export async function runBookingAutomation(options: BookingAutomationOptions) {
  const { bookingId, tenantId, listingId, guestId, startDate, endDate } = options;

  console.log(`[Automation] Running for booking ${bookingId}`);

  try {
    await Promise.all([
      createCalendarBlock(tenantId, listingId, startDate, endDate, bookingId),
      createAutoTasks(tenantId, listingId, bookingId, startDate, endDate),
      guestId ? updateGuestLoyalty(tenantId, guestId) : Promise.resolve(),
      exportToExternalCalendar(tenantId, listingId, startDate, endDate, bookingId),
    ]);

    console.log(`[Automation] Completed for booking ${bookingId}`);
  } catch (error) {
    console.error(`[Automation] Error for booking ${bookingId}:`, error);
  }
}

async function createCalendarBlock(
  tenantId: string,
  listingId: string,
  startDate: string,
  endDate: string,
  bookingId: string
) {
  const { error } = await supabase
    .from("blocked_dates")
    .insert({
      tenant_id: tenantId,
      listing_id: listingId,
      start_date: startDate,
      end_date: endDate,
      reason: `Booking ${bookingId}`,
      created_by: null,
    });

  if (error) {
    console.error(`[Automation] Failed to create calendar block:`, error);
  } else {
    console.log(`[Automation] Calendar blocked for booking ${bookingId}`);
  }
}

async function createAutoTasks(
  tenantId: string,
  listingId: string,
  bookingId: string,
  startDate: string,
  endDate: string
) {
  const checkInDate = new Date(startDate);
  const checkOutDate = new Date(endDate);
  const cleaningDate = new Date(checkOutDate);
  cleaningDate.setDate(cleaningDate.getDate() + 1);

  const tasks = [
    {
      tenant_id: tenantId,
      listing_id: listingId,
      booking_id: bookingId,
      title: "Check-in preparation",
      description: `Prepare for guest check-in on ${checkInDate.toLocaleDateString()}`,
      type: "checkin",
      status: "pending",
      priority: "high",
      due_date: new Date(checkInDate.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      tenant_id: tenantId,
      listing_id: listingId,
      booking_id: bookingId,
      title: "Post checkout cleaning",
      description: `Clean property after checkout on ${checkOutDate.toLocaleDateString()}`,
      type: "cleaning",
      status: "pending",
      priority: "normal",
      due_date: cleaningDate.toISOString(),
    },
    {
      tenant_id: tenantId,
      listing_id: listingId,
      booking_id: bookingId,
      title: "Check-out process",
      description: `Handle guest check-out on ${checkOutDate.toLocaleDateString()}`,
      type: "checkout",
      status: "pending",
      priority: "normal",
      due_date: new Date(checkOutDate.getTime() + 12 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const { error } = await supabase.from("tasks").insert(tasks);

  if (error) {
    console.error(`[Automation] Failed to create auto tasks:`, error);
  } else {
    console.log(`[Automation] Created ${tasks.length} auto tasks for booking ${bookingId}`);
  }
}

async function updateGuestLoyalty(tenantId: string, guestId: string) {
  const { data: existing } = await supabase
    .from("guest_loyalty")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("guest_id", guestId)
    .maybeSingle();

  if (existing) {
    const newBookings = (existing.total_bookings || 0) + 1;
    const tier = getTierFromBookings(newBookings);
    const pointsMultiplier = getPointsMultiplier(tier);

    await supabase
      .from("guest_loyalty")
      .update({
        total_bookings: newBookings,
        loyalty_tier: tier,
        points: (existing.points || 0) + 100 * pointsMultiplier,
        last_booking_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("guest_loyalty")
      .insert({
        tenant_id: tenantId,
        guest_id: guestId,
        total_bookings: 1,
        loyalty_tier: "bronze",
        points: 100,
        last_booking_at: new Date().toISOString(),
      });
  }

  console.log(`[Automation] Updated guest loyalty for ${guestId}`);
}

async function exportToExternalCalendar(
  tenantId: string,
  listingId: string,
  startDate: string,
  endDate: string,
  bookingId: string
) {
  const { data: credentials } = await supabase
    .from("channel_credentials")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("listing_id", listingId)
    .eq("is_active", true);

  if (!credentials || credentials.length === 0) {
    console.log(`[Automation] No external calendars configured for listing ${listingId}`);
    return;
  }

  for (const cred of credentials) {
    if (cred.channel === "google") {
      console.log(`[Automation] Would push to Google Calendar (API not implemented - use iCal export)`);
    } else if (["airbnb", "booking", "mmt", "Vrbo", "expedia"].includes(cred.channel)) {
      console.log(`[Automation] Would mark dates as unavailable in ${cred.channel} (requires API)`);
    }
  }
}

function getTierFromBookings(bookings: number): string {
  if (bookings >= 30) return "platinum";
  if (bookings >= 15) return "gold";
  if (bookings >= 5) return "silver";
  return "bronze";
}

function getPointsMultiplier(tier: string): number {
  switch (tier) {
    case "platinum": return 3;
    case "gold": return 2;
    case "silver": return 1.5;
    default: return 1;
  }
}

export async function runCheckoutAutomation(bookingId: string, tenantId: string, guestId: string) {
  const { data: loyalty } = await supabase
    .from("guest_loyalty")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("guest_id", guestId)
    .maybeSingle();

  if (loyalty) {
    const { data: bookings } = await supabase
      .from("bookings")
      .select("amount")
      .eq("tenant_id", tenantId)
      .eq("guest_id", guestId)
      .in("status", ["confirmed", "completed"]);

    const totalSpent = (bookings || []).reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalBookings = bookings?.length || 0;
    const tier = getTierFromBookings(totalBookings);
    const pointsMultiplier = getPointsMultiplier(tier);

    await supabase
      .from("guest_loyalty")
      .update({
        total_bookings: totalBookings,
        total_spent: totalSpent,
        loyalty_tier: tier,
        points: Math.floor(totalSpent * pointsMultiplier / 100),
      })
      .eq("id", loyalty.id);

    console.log(`[Automation] Updated loyalty on checkout for guest ${guestId}`);
  }
}
