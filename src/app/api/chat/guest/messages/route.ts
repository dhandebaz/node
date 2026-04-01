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

        // Validate UUID format to prevent SQL injection
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(conversationId)) {
            return NextResponse.json({ error: "Invalid conversation ID format" }, { status: 400 });
        }

        const supabase = await getSupabaseAdmin();
        
        // Verify the conversation exists and belongs to a valid listing
        const { data: conversation } = await supabase
            .from("conversations")
            .select("id, tenant_id, listing_id")
            .eq("id", conversationId)
            .single();
            
        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        const { data: messages, error } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true });
            
        if (error) throw error;
        
        // Filter sensitive data - don't expose internal metadata
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
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
