import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ratelimit";

export async function GET(request: NextRequest) {
    try {
        const ip = request.headers.get("x-forwarded-for") || 'unknown';
        const { success } = await rateLimit.limit(`public_chat_${ip}`);
        if (!success) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const conversationId = request.nextUrl.searchParams.get("conversationId");
        if (!conversationId) {
            return NextResponse.json({ error: "conversationId required" }, { status: 400 });
        }

        const supabase = await getSupabaseAdmin();
        
        const { data: messages, error } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true });
            
        if (error) throw error;
        
        const formatted = messages?.map((m: any) => ({
            id: m.id,
            content: m.content,
            sender: m.direction === 'inbound' ? 'guest' : 'host',
            timestamp: m.created_at,
            role: m.role,
            channel: m.channel
        })) ?? [];

        return NextResponse.json({ messages: formatted });
    } catch (error: any) {
        console.error("Public chat messages error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
