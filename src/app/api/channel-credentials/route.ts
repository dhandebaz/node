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
    const listing_id = searchParams.get("listing_id");

    if (!tenant_id) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
    }

    let query = supabase
      .from("channel_credentials")
      .select("*")
      .eq("tenant_id", tenant_id);

    if (listing_id) {
      query = query.eq("listing_id", listing_id);
    }

    const { data: credentials, error } = await query;

    if (error) throw error;

    return NextResponse.json({ credentials });
  } catch (error) {
    console.error("Error fetching credentials:", error);
    return NextResponse.json({ error: "Failed to fetch credentials" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenant_id, listing_id, channel, credentials } = body;

    if (!tenant_id || !listing_id || !channel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: credential, error } = await supabase
      .from("channel_credentials")
      .insert({
        tenant_id,
        listing_id,
        channel,
        credentials,
        is_active: true,
        sync_status: "idle"
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ credential });
  } catch (error) {
    console.error("Error creating credential:", error);
    return NextResponse.json({ error: "Failed to create credential" }, { status: 500 });
  }
}