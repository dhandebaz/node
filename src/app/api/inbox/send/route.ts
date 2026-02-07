import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conversationId, content, senderType } = body || {};

    if (!conversationId || !content || !senderType) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderType,
      channel: body?.channel || "web",
      content,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({ message });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to send message" }, { status: 500 });
  }
}
