import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant_id = searchParams.get("tenant_id");

    if (!tenant_id) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
    }

    const { data: guests, error } = await supabase
      .from("guest_loyalty")
      .select(`
        *,
        guests:guest_id (name, phone)
      `)
      .eq("tenant_id", tenant_id)
      .order("points", { ascending: false });

    if (error) throw error;

    const formattedGuests = (guests || []).map((g: any) => ({
      id: g.id,
      guest_id: g.guest_id,
      guest_name: g.guests?.name || "Unknown",
      guest_phone: g.guests?.phone || "",
      total_bookings: g.total_bookings,
      total_spent: g.total_spent,
      loyalty_tier: g.loyalty_tier,
      points: g.points,
      last_booking_at: g.last_booking_at
    }));

    return NextResponse.json({ guests: formattedGuests });
  } catch (error) {
    console.error("Error fetching loyalty:", error);
    return NextResponse.json({ error: "Failed to fetch loyalty data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenant_id, guest_id, loyalty_tier, points, total_bookings, total_spent } = body;

    if (!tenant_id || !guest_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: loyalty, error } = await supabase
      .from("guest_loyalty")
      .upsert({
        tenant_id,
        guest_id,
        loyalty_tier: loyalty_tier || "bronze",
        points: points || 0,
        total_bookings: total_bookings || 0,
        total_spent: total_spent || 0,
        last_booking_at: new Date().toISOString()
      }, { onConflict: "tenant_id,guest_id" })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ loyalty });
  } catch (error) {
    console.error("Error updating loyalty:", error);
    return NextResponse.json({ error: "Failed to update loyalty" }, { status: 500 });
  }
}