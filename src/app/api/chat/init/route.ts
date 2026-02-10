import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { businessId, name, phone } = await request.json();
    if (!businessId || !name) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();

    // 1. Verify Business (Host) exists and get a default listing
    const { data: listings, error: listingError } = await supabase
        .from("listings")
        .select("id")
        .eq("host_id", businessId)
        .limit(1);
    
    if (listingError || !listings?.length) {
        return NextResponse.json({ error: "Business not found or has no listings" }, { status: 404 });
    }
    
    const listingId = listings[0].id;

    // 2. Create or Update Guest
    let guestId: string;
    
    if (phone) {
        const { data: existingGuest } = await supabase
            .from("guests")
            .select("id")
            .eq("phone", phone)
            .maybeSingle();
        
        if (existingGuest) {
            guestId = existingGuest.id;
        } else {
             const { data: newGuest, error: createError } = await supabase
                .from("guests")
                .insert({ name, phone, channel: 'web', id_verification_status: 'none' })
                .select("id")
                .single();
            
            if (createError) throw createError;
            guestId = newGuest.id;
        }
    } else {
        const { data: newGuest, error: createError } = await supabase
            .from("guests")
            .insert({ name, channel: 'web', id_verification_status: 'none' })
            .select("id")
            .single();
        
        if (createError) throw createError;
        guestId = newGuest.id;
    }

    // 3. Return session info
    return NextResponse.json({
        guestId,
        conversationId: `${listingId}:${guestId}`
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}