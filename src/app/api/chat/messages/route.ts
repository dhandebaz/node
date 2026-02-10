import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    try {
        const conversationId = request.nextUrl.searchParams.get("conversationId");
        if (!conversationId) return NextResponse.json([], { status: 400 });

        const [listingId, guestId] = conversationId.split(":");
        if (!listingId || !guestId) return NextResponse.json([], { status: 400 });

        const supabase = await getSupabaseServer();
        
        const { data: messages, error } = await supabase
            .from("messages")
            .select("*")
            .eq("listing_id", listingId)
            .eq("guest_id", guestId)
            .order("timestamp", { ascending: true });
            
        if (error) throw error;
        
        const formatted = messages.map((m: any) => ({
            id: m.id,
            content: m.content,
            sender: m.direction === 'inbound' ? 'guest' : 'business',
            timestamp: m.timestamp
        }));

        return NextResponse.json(formatted);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}